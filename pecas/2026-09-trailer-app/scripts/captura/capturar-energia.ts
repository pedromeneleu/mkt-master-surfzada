/**
 * Captura das features de energia para o reel `ReelEnergia`: o mapa de energia
 * da Timeline Pico, quadro a quadro ao longo da previsão, e o gráfico "Energia
 * e potência".
 *
 * Enquanto as features não estão em produção, a captura usa o web LOCAL no
 * build de produção (API real), servido em WEB_LOCAL — `ng serve
 * --configuration production --port 4300` em web/client. Duas coisas são
 * resolvidas aqui, só dentro do navegador do Playwright:
 *  - CORS: a API de produção só aceita surfzada.com, então as leituras passam
 *    pelo Node (`route.fetch`) e voltam com o cabeçalho liberado.
 *  - `previsoes/grade-energia` (ainda não publicado): montado aqui, igual ao
 *    GradeEnergiaService da API — malha 13×13 de 0,25° em volta do pico, Marine
 *    API da Open-Meteo, E = ρ·g·Hs²/16.
 *
 * Saída: public/pecas/2026-09-trailer-app/capturas/energia/** e dados/energia.json
 * Uso:   npx tsx pecas/2026-09-trailer-app/scripts/captura/capturar-energia.ts   (WEB_LOCAL=... para outra origem)
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, type Locator, type Page, type Route } from 'playwright';

import type { Recorte } from '../../dados/tipos';
import { API, FUSO, GEO } from './mocks';

const PECA = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const RAIZ = join(PECA, '..', '..');
const PUBLICO = join(RAIZ, 'public', 'pecas', '2026-09-trailer-app');
const PASTA = join(PUBLICO, 'capturas', 'energia');
const WEB = process.env.WEB_LOCAL ?? 'http://localhost:4300';

const CELULAR = { largura: 390, altura: 844, escala: 3 };
/** Quadros do mapa: um a cada `PASSO_H` horas, até `QUADROS` (a janela de 7 dias inteira). */
const QUADROS = 56;
const PASSO_H = 3;

// ---------------------------------------------------------------------------
//  Grade de energia (espelho do GradeEnergiaService)
// ---------------------------------------------------------------------------

const PASSO = 0.25;
const RAIO = 6;
const ENCAIXE = 0.5;
const LOTE = 100;
const MARINE = 'https://marine-api.open-meteo.com/v1/marine';

const encaixar = (g: number) => Math.round(g / ENCAIXE) * ENCAIXE;
const eixo = (c: number) => Array.from({ length: RAIO * 2 + 1 }, (_, i) => Math.round((c + (i - RAIO) * PASSO) * 100) / 100);

interface RespMarine {
  hourly?: { time?: string[]; wave_height?: (number | null)[]; wave_direction?: (number | null)[] };
}

async function montarGrade(lat: number, lng: number) {
  const latitudes = eixo(encaixar(lat));
  const longitudes = eixo(encaixar(lng));
  const coords = latitudes.flatMap((la) => longitudes.map((lo) => [la, lo] as const));
  const locais: RespMarine[] = [];
  for (let i = 0; i < coords.length; i += LOTE) {
    const lote = coords.slice(i, i + LOTE);
    const url =
      `${MARINE}?latitude=${lote.map((c) => c[0]).join(',')}&longitude=${lote.map((c) => c[1]).join(',')}` +
      '&hourly=wave_height,wave_direction&timezone=GMT&forecast_days=7&temporal_resolution=hourly_3&cell_selection=nearest';
    const r = await fetch(url);
    if (!r.ok) throw new Error(`Open-Meteo ${r.status}: ${await r.text()}`);
    const corpo = (await r.json()) as RespMarine | RespMarine[];
    locais.push(...(Array.isArray(corpo) ? corpo : [corpo]));
  }
  const tempos = locais.find((l) => l.hourly?.time?.length)?.hourly?.time ?? [];
  const instantes = tempos.map((t) => new Date(`${t}:00Z`).toISOString());
  const energia = tempos.map((_, t) =>
    locais.map((l) => {
      const h = l.hourly?.wave_height?.[t];
      return h == null ? null : Math.round((1025 * 9.81 * h * h) / 16);
    }),
  );
  const direcao = tempos.map((_, t) =>
    locais.map((l) => {
      const d = l.hourly?.wave_direction?.[t];
      return d == null ? null : Math.round(d) % 360;
    }),
  );
  console.log(`  grade ${latitudes.length}×${longitudes.length}, ${instantes.length} instantes`);
  return { latitudes, longitudes, instantes, energia, direcao };
}

// ---------------------------------------------------------------------------
//  Rede: CORS liberado e a grade montada aqui
// ---------------------------------------------------------------------------

function cors(route: Route): Record<string, string> {
  const origem = route.request().headers()['origin'] ?? WEB;
  return {
    'access-control-allow-origin': origem,
    'access-control-allow-credentials': 'true',
    'access-control-allow-headers': '*',
    'access-control-allow-methods': 'GET, OPTIONS',
  };
}

async function instalarRede(pagina: Page, pico: PicoApi) {
  const grade = montarGrade(pico.localizacao!.latitude, pico.localizacao!.longitude);
  await pagina.route(/googletagmanager\.com|google-analytics\.com|analytics\.google\.com/, (r) => r.abort());
  await pagina.route(`${API}/**`, async (route) => {
    const req = route.request();
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors(route) });
    if (req.method() !== 'GET') return route.fulfill({ status: 200, headers: cors(route), contentType: 'application/json', body: '{}' });
    if (new URL(req.url()).pathname.endsWith('/previsoes/grade-energia')) {
      return route.fulfill({ headers: cors(route), contentType: 'application/json', body: JSON.stringify(await grade) });
    }
    const { authorization: _semToken, origin: _o, ...cabecalhos } = req.headers();
    const resp = await route.fetch({ headers: cabecalhos });
    return route.fulfill({ response: resp, headers: { ...resp.headers(), ...cors(route) } });
  });
}

// ---------------------------------------------------------------------------
//  Captura
// ---------------------------------------------------------------------------

interface PicoApi {
  id: string;
  nome: string;
  cidade?: string;
  localizacao?: { latitude: number; longitude: number };
}

/** Sem barras de rolagem, cursor de texto e a navegação de baixo (fixa, cobria a timeline). */
const CSS_LIMPO = `
  *, *::before, *::after { scrollbar-width: none !important; caret-color: transparent !important; }
  *::-webkit-scrollbar { display: none !important; }
  app-nav-inferior { display: none !important; }
`;

async function recortar(alvo: Locator, nome: string): Promise<Recorte> {
  const arquivo = `capturas/energia/${nome}.png`;
  const b = (await alvo.boundingBox())!;
  await alvo.screenshot({ path: join(PUBLICO, arquivo) });
  return { arquivo, largura: Math.round(b.width), altura: Math.round(b.height), escala: CELULAR.escala };
}

async function esperarTiles(pagina: Page) {
  await pagina
    .waitForFunction(
      () => {
        const tiles = [...document.querySelectorAll('.leaflet-tile')];
        return tiles.length > 0 && tiles.every((t) => t.classList.contains('leaflet-tile-loaded'));
      },
      undefined,
      { timeout: 20_000 },
    )
    .catch(() => console.warn('  ! mapa não terminou de carregar'));
}

async function principal() {
  rmSync(PASTA, { recursive: true, force: true });
  mkdirSync(join(PASTA, 'mapa'), { recursive: true });

  const picos = (await (await fetch(`${API}/picos`)).json()) as PicoApi[];
  // PICO="Arpoador" troca o pico; o padrão é o do trailer.
  const nome = process.env.PICO ?? 'Praia do Futuro';
  const pico = picos.find((p) => p.nome === nome && p.localizacao) ?? picos[0];
  console.log(`Pico: ${pico.nome} (${pico.id})`);

  const navegador = await chromium
    .launch({ channel: 'chrome', headless: process.env.CAPTURA_VISIVEL !== '1' })
    .catch(() => chromium.launch({ headless: process.env.CAPTURA_VISIVEL !== '1' }));
  const contexto = await navegador.newContext({
    viewport: { width: CELULAR.largura, height: CELULAR.altura },
    deviceScaleFactor: CELULAR.escala,
    // Largura de celular, mas com mouse: o balão do ECharts abre no hover, e o
    // toque emulado não o abre.
    isMobile: false,
    hasTouch: false,
    locale: 'pt-BR',
    timezoneId: FUSO,
    geolocation: GEO,
    permissions: ['geolocation'],
    colorScheme: 'light',
  });
  const pagina = await contexto.newPage();
  await instalarRede(pagina, pico);
  pagina.on('load', () => void pagina.addStyleTag({ content: CSS_LIMPO }).catch(() => undefined));

  try {
    await pagina.goto(`${WEB}/previsoes/pico/${pico.id}`, { waitUntil: 'domcontentloaded' });
    await pagina.addStyleTag({ content: CSS_LIMPO });
    const grafico = pagina.locator('app-grafico-metrica', { hasText: 'Energia e potência' });
    await grafico.waitFor({ timeout: 30_000 });
    await pagina.waitForLoadState('networkidle').catch(() => undefined);
    await pagina.evaluate(() => document.fonts.ready);
    await pagina.waitForTimeout(1200);

    // ---- Gráfico de energia e potência ----
    console.log('\nGráfico de energia e potência');
    await grafico.scrollIntoViewIfNeeded();
    // A faixa rola na horizontal (34 px por coluna): leva o pico de energia da
    // semana para a direita da parte visível, com a subida antes dele.
    const alvo = await grafico.evaluate((el) => {
      const valores = [...el.querySelectorAll('.gm__linha:first-of-type .gm__valor, .gm__valor')].map((s) => Number(s.textContent?.trim() || 0));
      const indice = valores.indexOf(Math.max(...valores));
      const faixa = el.querySelector<HTMLElement>('.gm__faixa')!;
      faixa.scrollLeft = Math.max(0, (indice + 2) * 34 - faixa.clientWidth);
      faixa.dispatchEvent(new Event('scroll'));
      return { indice, valor: valores[indice], rolagem: faixa.scrollLeft, x: faixa.getBoundingClientRect().x };
    });
    await pagina.waitForTimeout(800);
    const graficoLimpo = await recortar(grafico, 'grafico');
    console.log(`  ✓ ${graficoLimpo.arquivo} (máximo ${alvo.valor} J/m² na coluna ${alvo.indice})`);
    // Partes do gráfico que o vídeo explica (relativas ao gráfico): as barras
    // (a faixa visível) e a linha tracejada da média do pico.
    // (Sem funções nomeadas dentro do evaluate: o tsx as embrulha num `__name`
    // que não existe no navegador.)
    const partesGrafico = await grafico.evaluate((el) => {
      const g = el.getBoundingClientRect();
      const faixa = el.querySelector('.gm__faixa')!.getBoundingClientRect();
      const plot = el.querySelector('.gm__plot')!.getBoundingClientRect();
      const tracejada = [...el.querySelectorAll('.gm__plot path')].find((p) => p.getAttribute('stroke-dasharray'));
      const linha = tracejada?.getBoundingClientRect();
      return {
        barras: { x: faixa.x - g.x, y: plot.y - g.y - 30, w: faixa.width, h: plot.height + 30 },
        media: linha ? { x: faixa.x - g.x, y: linha.y - g.y - 6, w: faixa.width, h: Math.max(linha.height, 2) + 12 } : null,
        legenda: [el.querySelector('.gm__legenda')!.getBoundingClientRect()].map((r) => ({ x: r.x - g.x, y: r.y - g.y, w: r.width, h: r.height }))[0],
      };
    });
    console.log('  partes:', JSON.stringify(partesGrafico));
    // Ponteiro na coluna do máximo: o balão abre com swell/vaga/outras e a potência.
    // O balão é `position: fixed` e pode passar da borda do gráfico, então vai
    // num recorte à parte, com a posição relativa ao gráfico.
    const plot = grafico.locator('.gm__plot');
    const bp = (await plot.boundingBox())!;
    const bg = (await grafico.boundingBox())!;
    const coluna = { x: alvo.x + alvo.indice * 34 + 17 - alvo.rolagem, y: bp.y + bp.height * 0.6 };
    await pagina.mouse.move(coluna.x, coluna.y);
    await pagina.waitForTimeout(700);
    const balaoEl = pagina.locator('div[style*="position: fixed"], div[style*="position:fixed"]').filter({ hasText: /kW\/m/ }).last();
    const bb = (await balaoEl.boundingBox())!;
    const balao = { ...(await recortar(balaoEl, 'balao')), x: bb.x - bg.x, y: bb.y - bg.y };
    // O realce da coluna sem o balão por cima: no vídeo o balão entra depois, solto.
    await balaoEl.evaluate((el) => ((el as HTMLElement).style.visibility = 'hidden'));
    const graficoGuia = await recortar(grafico, 'grafico-guia');
    const ponteiro = { x: coluna.x - bg.x, y: coluna.y - bg.y };
    console.log(`  ✓ ${graficoGuia.arquivo} + ${balao.arquivo} (${Math.round(bb.width)}×${Math.round(bb.height)})`);
    await pagina.mouse.move(5, 300);
    await pagina.waitForTimeout(300);

    // ---- Timeline Pico: direções → energia, quadro a quadro ----
    console.log('\nTimeline Pico');
    const secao = pagina.locator('section.secao', { has: pagina.getByRole('heading', { name: 'Timeline Pico' }) });
    await secao.evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await esperarTiles(pagina);
    await pagina.waitForTimeout(800);
    const direcoes = await recortar(secao, 'timeline-direcoes');
    const chipEnergia = secao.getByRole('button', { name: 'Energia' });
    const bSecao = (await secao.boundingBox())!;
    const bChip = (await chipEnergia.boundingBox())!;
    await chipEnergia.click();
    await secao.locator('.mp-energia').first().waitFor({ timeout: 30_000 });
    await pagina.waitForTimeout(1200);

    const range = secao.locator('input[type="range"]');
    const maximo = Number(await range.getAttribute('max'));
    const instantes = await pagina.evaluate(() => (document.querySelector('.ldt__rotulo')?.textContent ?? '').trim());
    // Descobre o passo da timeline (horas por índice) pelo rótulo de dois índices.
    await range.fill('0');
    await pagina.waitForTimeout(200);
    const r0 = await secao.locator('.ldt__rotulo').innerText();
    await range.fill('1');
    await pagina.waitForTimeout(200);
    const r1 = await secao.locator('.ldt__rotulo').innerText();
    const h = (r: string) => Number(r.match(/(\d+)h/)?.[1] ?? 0);
    const horasPorIndice = ((h(r1) - h(r0) + 24) % 24) || 1;
    const passo = Math.max(1, Math.round(PASSO_H / horasPorIndice));
    console.log(`  timeline: ${maximo + 1} instantes (${instantes}), ${horasPorIndice} h por índice → passo ${passo}`);

    const quadros: { arquivo: string; rotulo: string }[] = [];
    for (let q = 0; q < QUADROS; q++) {
      const i = Math.min(maximo, q * passo);
      await range.fill(String(i));
      await pagina.waitForTimeout(350);
      const rotulo = await secao.locator('.ldt__rotulo').innerText();
      const rec = await recortar(secao, `mapa/${String(q).padStart(2, '0')}`);
      quadros.push({ arquivo: rec.arquivo, rotulo });
      if (i === maximo) break;
    }
    console.log(`  ✓ ${quadros.length} quadros do mapa (${quadros[0].rotulo} → ${quadros.at(-1)!.rotulo})`);

    const secaoFinal = (await secao.boundingBox())!;
    const map = (await secao.locator('app-mapa-previsao').boundingBox())!;
    const trilho = (await secao.locator('.ldt__trilho').boundingBox())!;
    const escalaMapa = (await secao.locator('.mp-escala').boundingBox())!;
    const rel = (b: { x: number; y: number; width: number; height: number }) => ({
      x: Math.round((b.x - secaoFinal.x) * 10) / 10,
      y: Math.round((b.y - secaoFinal.y) * 10) / 10,
      w: Math.round(b.width * 10) / 10,
      h: Math.round(b.height * 10) / 10,
    });

    const saida = {
      geradoEm: new Date().toISOString(),
      pico: { id: pico.id, nome: pico.nome, cidade: pico.cidade ?? '' },
      grafico: graficoLimpo,
      graficoGuia,
      balao,
      ponteiro,
      direcoes,
      quadros,
      largura: direcoes.largura,
      altura: direcoes.altura,
      caixas: {
        chipEnergia: { x: bChip.x - bSecao.x, y: bChip.y - bSecao.y, w: bChip.width, h: bChip.height },
        mapa: rel(map),
        trilho: rel(trilho),
        escala: rel(escalaMapa),
      },
      caixasGrafico: partesGrafico,
    };
    writeFileSync(join(PECA, 'dados', 'energia.json'), JSON.stringify(saida, null, 2));
    console.log('\nSalvo em pecas/2026-09-trailer-app/dados/energia.json');
  } finally {
    await contexto.close();
    await navegador.close();
  }
}

principal().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
