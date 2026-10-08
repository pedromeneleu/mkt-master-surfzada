/**
 * Captura as telas da surfzada.com.br para o trailer.
 *
 * Tira screenshots nítidos (2× no desktop, 3× no celular) de cada estado que o
 * vídeo usa e anota a posição dos elementos importantes. O movimento (zoom,
 * cursor, destaques) é todo feito depois no Remotion, frame a frame — por
 * isso não gravamos vídeo aqui.
 *
 * Saída: public/pecas/2026-09-trailer-app/capturas/** e dados/manifesto.json
 * Uso:   npx tsx pecas/2026-09-trailer-app/scripts/captura/capturar.ts   (CAPTURA_VISIVEL=1 para ver o navegador)
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, type Browser, type BrowserContext, type Locator, type Page } from 'playwright';

import type { Caixa, Captura, Manifesto, Recorte } from '../../dados/tipos';
import {
  API,
  EstadoDemo,
  FUSO,
  GALERA,
  GEO,
  SITE,
  avatarSvg,
  dataLocal,
  instalarMocks,
  type PicosDemo,
} from './mocks';

const PECA = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const RAIZ = join(PECA, '..', '..');
const PUBLICO = join(RAIZ, 'public', 'pecas', '2026-09-trailer-app');
const PASTA_CAPTURAS = join(PUBLICO, 'capturas');
const PASTA_FOTOS = join(PECA, 'scripts', 'captura', 'fotos');

const DESKTOP = { largura: 1440, altura: 900, escala: 2 };
const CELULAR = { largura: 390, altura: 844, escala: 3 };

type Grupo = 'desktop' | 'mobile';

const manifesto: Omit<Manifesto, 'pico' | 'condicoes' | 'picos' | 'totalEstados'> = {
  geradoEm: new Date().toISOString(),
  desktop: {},
  mobile: {},
  recortes: {},
  galera: [],
};

// ---------------------------------------------------------------------------
//  Utilitários
// ---------------------------------------------------------------------------

/** Esconde barras de rolagem e o cursor de texto — ruído visual no vídeo. */
const CSS_LIMPO = `
  *, *::before, *::after { scrollbar-width: none !important; caret-color: transparent !important; }
  *::-webkit-scrollbar { display: none !important; }
`;

async function limparVisual(pagina: Page): Promise<void> {
  await pagina.addStyleTag({ content: CSS_LIMPO });
}

async function caixaDe(alvo: Locator): Promise<Caixa> {
  await alvo.waitFor({ state: 'visible', timeout: 15_000 });
  const b = await alvo.boundingBox();
  if (!b) throw new Error(`Sem caixa para ${alvo}`);
  const r = (n: number) => Math.round(n * 10) / 10;
  return { x: r(b.x), y: r(b.y), w: r(b.width), h: r(b.height) };
}

/** Espera os tiles do Leaflet terminarem de carregar (sem isso o mapa sai cinza). */
async function esperarMapas(pagina: Page): Promise<void> {
  await pagina
    .waitForFunction(
      () => {
        const tiles = [...document.querySelectorAll('.leaflet-tile')];
        return tiles.length > 0 && tiles.every((t) => t.classList.contains('leaflet-tile-loaded'));
      },
      undefined,
      { timeout: 20_000 },
    )
    .catch(() => console.warn('  ! mapa não terminou de carregar, seguindo assim mesmo'));
}

/** Espera sumir spinner/esqueleto, a rede acalmar e as fontes carregarem. */
async function estabilizar(pagina: Page, extraMs = 600): Promise<void> {
  await pagina.waitForLoadState('networkidle').catch(() => undefined);
  await pagina
    .waitForFunction(() => !document.querySelector('app-spinner, app-skeleton, [aria-busy="true"]'), undefined, {
      timeout: 20_000,
    })
    .catch(() => console.warn('  ! ainda há carregamento na tela'));
  await pagina.evaluate(() => document.fonts.ready);
  await pagina.waitForTimeout(extraMs);
}

async function rolarConteudoParaTopo(pagina: Page): Promise<void> {
  await pagina.evaluate(() => {
    document.querySelectorAll('main, .conteudo').forEach((el) => (el.scrollTop = 0));
    window.scrollTo(0, 0);
  });
  await pagina.waitForTimeout(250);
}

async function fotografar(
  pagina: Page,
  grupo: Grupo,
  nome: string,
  alvos: Record<string, Locator | Caixa | undefined> = {},
): Promise<Captura> {
  const caixas: Record<string, Caixa> = {};
  for (const [chave, alvo] of Object.entries(alvos)) {
    if (!alvo) continue;
    caixas[chave] = 'w' in alvo ? alvo : await caixaDe(alvo);
  }
  const arquivo = `capturas/${grupo}/${nome}.png`;
  await pagina.screenshot({ path: join(PUBLICO, arquivo) });
  const viewport = pagina.viewportSize()!;
  const cfg = grupo === 'desktop' ? DESKTOP : CELULAR;
  const captura: Captura = { arquivo, largura: viewport.width, altura: viewport.height, escala: cfg.escala, caixas };
  manifesto[grupo][nome] = captura;
  console.log(`  ✓ ${arquivo}  (${Object.keys(caixas).length} caixas)`);
  return captura;
}

async function recortar(alvo: Locator, nome: string, escala: number): Promise<Recorte> {
  const arquivo = `capturas/recortes/${nome}.png`;
  await alvo.scrollIntoViewIfNeeded();
  const caixa = await caixaDe(alvo);
  await alvo.screenshot({ path: join(PUBLICO, arquivo) });
  const recorte: Recorte = { arquivo, largura: caixa.w, altura: caixa.h, escala };
  manifesto.recortes[nome] = recorte;
  console.log(`  ✓ ${arquivo}`);
  return recorte;
}

/** Caixas de todos os marcadores visíveis do mapa (pinos de pico/praia). */
async function caixasDosPinos(pagina: Page, mapa: Locator): Promise<Record<string, Caixa>> {
  const limite = await caixaDe(mapa);
  const pinos = pagina.locator('.leaflet-marker-icon, path.leaflet-interactive');
  const saida: Record<string, Caixa> = {};
  let i = 0;
  for (const pino of await pinos.all()) {
    const b = await pino.boundingBox();
    if (!b || b.width > 80) continue;
    const dentro = b.x >= limite.x && b.y >= limite.y && b.x + b.width <= limite.x + limite.w && b.y + b.height <= limite.y + limite.h;
    if (dentro) saida[`pino${i++}`] = { x: b.x, y: b.y, w: b.width, h: b.height };
  }
  return saida;
}

async function novoContexto(navegador: Browser, cfg: typeof DESKTOP, celular: boolean, estado: EstadoDemo) {
  const contexto = await navegador.newContext({
    viewport: { width: cfg.largura, height: cfg.altura },
    deviceScaleFactor: cfg.escala,
    isMobile: celular,
    hasTouch: celular,
    locale: 'pt-BR',
    timezoneId: FUSO,
    geolocation: GEO,
    permissions: ['geolocation'],
    colorScheme: 'light',
    reducedMotion: 'no-preference',
  });
  await instalarMocks(contexto, estado, PASTA_FOTOS);
  const pagina = await contexto.newPage();
  pagina.on('load', () => void limparVisual(pagina).catch(() => undefined));
  return { contexto, pagina };
}

async function irPara(pagina: Page, caminho: string): Promise<void> {
  await pagina.goto(`${SITE}${caminho}`, { waitUntil: 'domcontentloaded' });
  await limparVisual(pagina);
}

async function escolherOpcao(select: Locator, texto: string | RegExp): Promise<boolean> {
  await select.waitFor({ state: 'visible' });
  await esperarOpcoes(select);
  const opcoes = await select.locator('option').allTextContents();
  const alvo = opcoes.find((o) => (typeof texto === 'string' ? o.trim() === texto : texto.test(o)));
  if (!alvo) return false;
  await select.selectOption({ label: alvo });
  return true;
}

async function esperarOpcoes(select: Locator): Promise<void> {
  await select
    .locator('option:not([value=""])')
    .first()
    .waitFor({ state: 'attached', timeout: 15_000 })
    .catch(() => undefined);
}

// ---------------------------------------------------------------------------
//  Dados reais de apoio (picos e estados)
// ---------------------------------------------------------------------------

interface PicoApi {
  id: string;
  nome: string;
  cidade?: string;
  localizacao?: { latitude: number; longitude: number };
}

async function buscarJson<T>(caminho: string): Promise<T> {
  const r = await fetch(`${API}/${caminho}`);
  if (!r.ok) throw new Error(`GET ${caminho} → ${r.status}`);
  return (await r.json()) as T;
}

function acharPico(picos: PicoApi[], nome: string, reserva: PicoApi): PicoApi {
  return picos.find((p) => p.nome === nome && p.cidade === 'Fortaleza') ?? picos.find((p) => p.nome === nome) ?? reserva;
}

// ---------------------------------------------------------------------------
//  Roteiro de captura
// ---------------------------------------------------------------------------

async function capturarDesktop(pagina: Page, estado: EstadoDemo, picos: PicosDemo) {
  const g: Grupo = 'desktop';
  const primeiroItem = pagina.locator('.lista app-card').first();

  console.log('\nDesktop — Início');
  await irPara(pagina, '/');
  await pagina.getByText('Perto de você').waitFor({ timeout: 20_000 });
  await primeiroItem.waitFor();
  await esperarMapas(pagina);
  await estabilizar(pagina);
  await fotografar(pagina, g, 'inicio', {
    perto: pagina.locator('section.perto'),
    mapa: pagina.locator('.perto__mapa'),
    feed: pagina.locator('.feed-titulo'),
    item0: primeiroItem,
    novaSessao: pagina.getByRole('button', { name: /Nova sessão/ }),
    surfCheck: pagina.getByRole('button', { name: /Surf check/ }),
  });

  console.log('\nDesktop — Previsões');
  await irPara(pagina, '/previsoes');
  const selects = pagina.locator('main select');
  await escolherOpcao(selects.nth(0), 'Ceará');
  await pagina.waitForTimeout(800);
  await escolherOpcao(selects.nth(1), 'Fortaleza');
  const cartaoFuturo = pagina.locator('a.link', { hasText: picos.futuro.nome }).first();
  await cartaoFuturo.waitFor({ timeout: 20_000 });
  await esperarMapas(pagina);
  await estabilizar(pagina);
  const mapaPrev = pagina.locator('main .leaflet-container').first();
  await fotografar(pagina, g, 'previsoes', {
    mapa: mapaPrev,
    grade: pagina.locator('.grade'),
    cartaoFuturo,
    ...(await caixasDosPinos(pagina, mapaPrev)),
  });

  console.log('\nDesktop — Pico');
  await irPara(pagina, `/previsoes/pico/${picos.futuro.id}`);
  await pagina.locator('app-condicoes-previsao').waitFor({ timeout: 25_000 });
  await pagina.locator('app-grafico-metrica').first().waitFor({ timeout: 25_000 });
  await esperarMapas(pagina);
  await estabilizar(pagina, 900);
  const cartoesCond = pagina.locator('app-condicoes-previsao app-card');
  const painelChecks = pagina.locator('section.painel').nth(0);
  const painelPlanos = pagina.locator('section.painel').nth(1);
  await fotografar(pagina, g, 'pico', {
    titulo: pagina.locator('header.cabecalho'),
    condicoes: pagina.locator('app-condicoes-previsao'),
    condAltura: cartoesCond.nth(0),
    condSwell: cartoesCond.nth(1),
    condVento: cartoesCond.nth(2),
    graficoAltura: pagina.locator('app-grafico-metrica').first(),
    timeline: pagina.locator('aside.colunas__lateral section.secao').first(),
    checks: painelChecks,
    botaoCheck: painelChecks.getByRole('button'),
  });

  const texto = (await pagina.locator('app-condicoes-previsao').innerText()).replace(/\s+/g, ' ');
  const achar = (re: RegExp) => texto.match(re)?.[1] ?? '—';
  const condicoes = {
    alturaOnda: achar(/Altura das ondas ([\d.,]+)\s*m/i),
    swell: achar(/Swell ([\d.,]+)\s*m/i),
    periodo: achar(/Swell [\d.,]+\s*m ([\d.,]+)\s*s/i),
    vento: achar(/Vento ([\d.,]+)\s*kn/i),
  };
  console.log('  condições agora:', condicoes);

  console.log('\nDesktop — Recortes dos gráficos');
  const graficos = pagina.locator('app-grafico-metrica');
  await recortar(graficos.nth(0), 'grafico-altura', DESKTOP.escala);
  if ((await graficos.count()) > 1) await recortar(graficos.nth(1), 'grafico-periodo', DESKTOP.escala);
  if ((await graficos.count()) > 2) await recortar(graficos.nth(2), 'grafico-vento', DESKTOP.escala);
  const mare = pagina.locator('app-grafico-mare');
  if (await mare.count()) await recortar(mare.first(), 'grafico-mare', DESKTOP.escala);
  await recortar(pagina.locator('aside.colunas__lateral app-mapa-previsao').first(), 'bussola', DESKTOP.escala);
  await recortar(cartoesCond.nth(0), 'cond-altura', DESKTOP.escala);
  await recortar(cartoesCond.nth(1), 'cond-swell', DESKTOP.escala);
  await recortar(cartoesCond.nth(2), 'cond-vento', DESKTOP.escala);
  await rolarConteudoParaTopo(pagina);

  console.log('\nDesktop — Surf check');
  await painelChecks.getByRole('button').click();
  const modal = pagina.locator('.modal');
  await modal.waitFor();
  await pagina.waitForTimeout(500);
  const campo = (nome: string) => modal.locator(`[name="${nome}"]`);
  const caixasCheck = async () => ({
    modal,
    tamanho: campo('tamanho'),
    vento: campo('vento'),
    qualidade: campo('qualidade'),
    crowd: campo('crowd'),
    nota: campo('nota'),
    comentario: campo('comentario'),
    publicar: modal.locator('button[type="submit"]'),
  });
  await fotografar(pagina, g, 'check-vazio', await caixasCheck());
  await campo('tamanho').fill('150');
  await campo('vento').fill('Terral leve');
  await campo('qualidade').fill('5');
  await campo('crowd').fill('2');
  await campo('nota').fill('5');
  await campo('comentario').fill('Tubos na bancada da direita, maré secando. Corre!');
  await modal.locator('h2').click(); // tira o foco do textarea
  await pagina.waitForTimeout(300);
  await fotografar(pagina, g, 'check', await caixasCheck());
  await modal.locator('button[type="submit"]').click();
  await modal.waitFor({ state: 'hidden', timeout: 15_000 });
  await painelChecks.getByText('Rafa Menezes').first().waitFor({ timeout: 15_000 });
  // O painel fica abaixo da dobra: centraliza os checks (o toast de sucesso segue na tela).
  await painelChecks.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  await estabilizar(pagina, 700);
  await fotografar(pagina, g, 'pico-com-check', {
    checks: painelChecks,
    check0: painelChecks.locator('app-cartao-check').first(),
    planos: painelPlanos,
  });

  console.log('\nDesktop — Nova sessão');
  await irPara(pagina, '/');
  await primeiroItem.waitFor({ timeout: 20_000 });
  await esperarMapas(pagina);
  await estabilizar(pagina);
  await pagina.getByRole('button', { name: /Nova sessão/ }).click();
  await modal.waitFor();
  const selPico = modal.locator('app-seletor-pico select').nth(2);
  // O seletor tenta se preencher pela localização; se não conseguir, escolhe à mão.
  await pagina.waitForTimeout(2500);
  if (!(await selPico.inputValue().catch(() => ''))) {
    const selsModal = modal.locator('app-seletor-pico select');
    await escolherOpcao(selsModal.nth(0), 'Ceará');
    await pagina.waitForTimeout(600);
    await escolherOpcao(selsModal.nth(1), 'Fortaleza');
    await pagina.waitForTimeout(600);
  }
  await escolherOpcao(selPico, new RegExp(`^${picos.futuro.nome}\\b`));
  await pagina.waitForTimeout(300);
  const caixasSessao = async () => ({
    modal,
    pico: modal.locator('app-seletor-pico'),
    dataHora: modal.locator('input[name="dataHora"]'),
    observacao: modal.locator('[name="observacao"]'),
    criar: modal.locator('button[type="submit"]'),
  });
  await fotografar(pagina, g, 'sessao-vazio', await caixasSessao());
  await modal.locator('input[name="dataHora"]').fill(`${dataLocal(1)}T05:30`);
  await modal.locator('[name="observacao"]').fill('Bora cedo! Encontro na areia às 5h15.');
  await modal.locator('h2').click();
  await pagina.waitForTimeout(300);
  await fotografar(pagina, g, 'sessao', await caixasSessao());
  await modal.locator('button[type="submit"]').click();
  await modal.waitFor({ state: 'hidden', timeout: 15_000 });

  await irPara(pagina, '/');
  await pagina.locator('.lista app-card', { hasText: 'Rafa Menezes' }).first().waitFor({ timeout: 20_000 });
  await esperarMapas(pagina);
  await estabilizar(pagina);
  const minhaSessao = pagina.locator('.lista app-card', { hasText: 'Rafa Menezes' }).first();
  await fotografar(pagina, g, 'inicio-sessao', {
    item0: minhaSessao,
    rodape0: minhaSessao.locator('.item__rodape'),
    feed: pagina.locator('.feed-titulo'),
  });
  await recortar(minhaSessao, 'cartao-sessao-1', DESKTOP.escala);

  estado.confirmarGalera();
  await irPara(pagina, '/');
  await pagina.getByText('6 confirmados').first().waitFor({ timeout: 20_000 });
  await esperarMapas(pagina);
  await estabilizar(pagina);
  await rolarConteudoParaTopo(pagina);
  await fotografar(pagina, g, 'inicio-sessao-6', {
    item0: minhaSessao,
    rodape0: minhaSessao.locator('.item__rodape'),
  });
  await recortar(minhaSessao, 'cartao-sessao-6', DESKTOP.escala);

  return condicoes;
}

async function capturarCelular(pagina: Page, picos: PicosDemo) {
  const g: Grupo = 'mobile';

  console.log('\nCelular — Início');
  await irPara(pagina, '/');
  await pagina.locator('.lista app-card').first().waitFor({ timeout: 20_000 });
  await esperarMapas(pagina);
  await estabilizar(pagina);
  await fotografar(pagina, g, 'inicio', { item0: pagina.locator('.lista app-card').first() });

  console.log('\nCelular — Previsões');
  await irPara(pagina, '/previsoes');
  const selects = pagina.locator('main select');
  await escolherOpcao(selects.nth(0), 'Ceará');
  await pagina.waitForTimeout(800);
  await escolherOpcao(selects.nth(1), 'Fortaleza');
  await pagina.locator('a.link', { hasText: picos.futuro.nome }).first().waitFor({ timeout: 20_000 });
  await esperarMapas(pagina);
  await estabilizar(pagina);
  const mapa = pagina.locator('main .leaflet-container').first();
  await fotografar(pagina, g, 'previsoes', { mapa, ...(await caixasDosPinos(pagina, mapa)) });

  console.log('\nCelular — Pico');
  await irPara(pagina, `/previsoes/pico/${picos.futuro.id}`);
  await pagina.locator('app-condicoes-previsao').waitFor({ timeout: 25_000 });
  await estabilizar(pagina, 900);
  const cartoes = pagina.locator('app-condicoes-previsao app-card');
  await fotografar(pagina, g, 'pico', {
    condAltura: cartoes.nth(0),
    condSwell: cartoes.nth(1),
    condVento: cartoes.nth(2),
  });

  console.log('\nCelular — Busca');
  const busca = pagina.locator('input[type="search"]').first();
  await busca.click();
  await pagina.waitForTimeout(300);
  await fotografar(pagina, g, 'busca-0', { campo: busca });
  const termo = 'prai';
  for (let i = 1; i <= termo.length; i++) {
    await busca.press(termo[i - 1]);
    await pagina.waitForTimeout(i < termo.length ? 250 : 900);
    await pagina.waitForLoadState('networkidle').catch(() => undefined);
    const resultados = pagina.locator('.busca__resultados');
    await fotografar(pagina, g, `busca-${i}`, {
      campo: busca,
      resultados: (await resultados.isVisible()) ? resultados : undefined,
    });
  }
}

async function principal(): Promise<void> {
  rmSync(PASTA_CAPTURAS, { recursive: true, force: true });
  for (const sub of ['desktop', 'mobile', 'recortes', 'avatares']) mkdirSync(join(PASTA_CAPTURAS, sub), { recursive: true });

  console.log('Buscando picos e estados na API...');
  const todos = await buscarJson<PicoApi[]>('picos');
  const estados = await buscarJson<unknown[]>('locais?tipo=estado');
  const futuro = acharPico(todos, 'Praia do Futuro', todos[0]);
  const picos: PicosDemo = {
    futuro,
    titanzinho: acharPico(todos, 'Titanzinho', futuro),
    iracema: acharPico(todos, 'Praia de Iracema', futuro),
    lesteOeste: acharPico(todos, 'Leste Oeste', futuro),
  };
  console.log(`  ${todos.length} picos em ${estados.length} estados`);

  for (const p of GALERA) {
    writeFileSync(join(PASTA_CAPTURAS, 'avatares', `${p.id}.svg`), avatarSvg(p.id));
    manifesto.galera.push({ nome: p.nome, avatar: `capturas/avatares/${p.id}.svg` });
  }

  const estado = new EstadoDemo(picos, PASTA_FOTOS);
  if (estado.temFotos()) console.log('  usando fotos de captura/fotos no surf check da Marina');

  // Chrome instalado dá fontes e renderização mais fiéis; sem ele, o Chromium do Playwright.
  const visivel = process.env.CAPTURA_VISIVEL === '1';
  const navegador = await chromium
    .launch({ channel: 'chrome', headless: !visivel })
    .catch(() => chromium.launch({ headless: !visivel }));

  const contextos: BrowserContext[] = [];
  try {
    const desk = await novoContexto(navegador, DESKTOP, false, estado);
    contextos.push(desk.contexto);
    const condicoes = await capturarDesktop(desk.pagina, estado, picos);

    const cel = await novoContexto(navegador, CELULAR, true, estado);
    contextos.push(cel.contexto);
    await capturarCelular(cel.pagina, picos);

    const final: Manifesto = {
      ...manifesto,
      pico: { id: futuro.id, nome: futuro.nome, cidade: futuro.cidade ?? '' },
      condicoes,
      picos: todos
        .filter((p) => p.localizacao)
        .map((p) => ({ lat: p.localizacao!.latitude, lng: p.localizacao!.longitude })),
      totalEstados: estados.length,
    };
    writeFileSync(join(PECA, 'dados', 'manifesto.json'), JSON.stringify(final, null, 2));
    console.log('\nManifesto salvo em pecas/2026-09-trailer-app/dados/manifesto.json');
  } finally {
    await Promise.all(contextos.map((c) => c.close()));
    await navegador.close();
  }
}

principal().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
