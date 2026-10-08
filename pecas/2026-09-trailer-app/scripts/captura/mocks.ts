/**
 * Dados de demonstração e interceptação da API durante a captura.
 *
 * A produção quase não tem conteúdo social, então feed, sessões e surf checks
 * são respondidos aqui, dentro do navegador do Playwright. Previsões, picos,
 * busca e mapas continuam reais. Nenhuma escrita chega à API: todo
 * POST/PUT/DELETE é respondido localmente.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import type { BrowserContext, Route } from 'playwright';

export const SITE = 'https://surfzada.com.br';
export const API = 'https://api.surfzada.com.br/api';
/** Host fictício para os avatares e fotos de demonstração (nunca sai do navegador). */
export const DEMO = 'https://demo.surfzada.test';

/** Posição simulada do usuário: Varjota, Fortaleza — perto de Mucuripe e da Praia do Futuro. */
export const GEO = { latitude: -3.7327, longitude: -38.4862 };
export const FUSO = 'America/Fortaleza';

export interface Autor {
  id: string;
  nome: string;
  avatarUrl: string;
}

interface PicoResumo {
  id: string;
  nome: string;
  cidade?: string;
}

interface Sessao {
  id: string;
  autor: Autor;
  pico: PicoResumo;
  dataHora: string;
  observacao?: string;
  confirmacoes: Autor[];
  criadoEm: string;
}

interface Check {
  id: string;
  localId: string;
  autor: Autor;
  momento: string;
  tamanhoOnda: number;
  qualidade: number;
  vento: string;
  crowd: number;
  notaGeral: number;
  comentario?: string;
  fotoUrl?: string;
  midias?: { id: string; tipo: 'foto'; url: string }[];
}

// ---------------------------------------------------------------------------
//  Pessoas (fictícias)
// ---------------------------------------------------------------------------

const GRADIENTES: [string, string][] = [
  ['#ff7a59', '#ffb26b'],
  ['#1e6091', '#48cae4'],
  ['#0a0a0a', '#525252'],
  ['#2e9e5b', '#8fd9a8'],
  ['#e8a51c', '#ffd37a'],
  ['#5b4bd6', '#a29bfe'],
  ['#c4482a', '#ff8f6e'],
];

function pessoa(id: string, nome: string): Autor {
  return { id, nome, avatarUrl: `${DEMO}/avatar/${id}.svg` };
}

export const EU = pessoa('demo-rafa', 'Rafa Menezes');
export const GALERA: Autor[] = [
  pessoa('demo-marina', 'Marina Costa'),
  pessoa('demo-lucas', 'Lucas Andrade'),
  pessoa('demo-bia', 'Bia Farias'),
  pessoa('demo-teo', 'Téo Ramos'),
  pessoa('demo-caio', 'Caio Nogueira'),
  pessoa('demo-duda', 'Duda Lima'),
];
const [MARINA, LUCAS, BIA, TEO, CAIO, DUDA] = GALERA;

/** Avatar em SVG: gradiente da paleta + iniciais. Usado no site e no vídeo. */
export function avatarSvg(id: string): string {
  const todos = [EU, ...GALERA];
  const indice = Math.max(0, todos.findIndex((p) => p.id === id));
  const nome = todos[indice]?.nome ?? '?';
  const [c1, c2] = GRADIENTES[indice % GRADIENTES.length];
  const iniciais = nome
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
  <circle cx="64" cy="64" r="64" fill="url(#g)"/>
  <text x="64" y="64" dy="0.35em" text-anchor="middle" font-family="Poppins, 'Segoe UI', Arial, sans-serif" font-weight="600" font-size="50" fill="#fff">${iniciais}</text>
</svg>`;
}

// ---------------------------------------------------------------------------
//  Datas no fuso do pico
// ---------------------------------------------------------------------------

/** "YYYY-MM-DD" de hoje + `dias` no fuso de Fortaleza (UTC-3, sem horário de verão). */
export function dataLocal(dias: number): string {
  const agora = new Date(Date.now() - 3 * 3600_000 + dias * 86_400_000);
  return agora.toISOString().slice(0, 10);
}

/** ISO com offset -03:00 para `dias` à frente, na hora pedida. */
function emFortaleza(dias: number, hora: string): string {
  return `${dataLocal(dias)}T${hora}:00-03:00`;
}

const minutosAtras = (min: number) => new Date(Date.now() - min * 60_000).toISOString();

// ---------------------------------------------------------------------------
//  Estado da demo (muda conforme a captura cria sessão, check e confirmações)
// ---------------------------------------------------------------------------

export interface PicosDemo {
  futuro: PicoResumo;
  titanzinho: PicoResumo;
  iracema: PicoResumo;
  lesteOeste: PicoResumo;
}

export class EstadoDemo {
  sessoes: Sessao[];
  checks: Check[];
  private fotos: string[];

  constructor(
    private readonly picos: PicosDemo,
    pastaFotos: string,
  ) {
    this.fotos = existsSync(pastaFotos)
      ? readdirSync(pastaFotos).filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
      : [];

    const foto = this.fotos[0] ? `${DEMO}/foto/${encodeURIComponent(this.fotos[0])}` : undefined;
    this.checks = [
      {
        id: 'demo-check-marina',
        localId: picos.futuro.id,
        autor: MARINA,
        momento: minutosAtras(25),
        tamanhoOnda: 120,
        qualidade: 4,
        vento: 'Terral leve',
        crowd: 2,
        notaGeral: 4,
        comentario: 'Série boa na maré enchendo e quase ninguém na água.',
        fotoUrl: foto,
        midias: foto ? [{ id: 'demo-midia-1', tipo: 'foto', url: foto }] : undefined,
      },
      {
        id: 'demo-check-teo',
        localId: picos.lesteOeste.id,
        autor: TEO,
        momento: minutosAtras(70),
        tamanhoOnda: 80,
        qualidade: 3,
        vento: 'Maral fraco',
        crowd: 3,
        notaGeral: 3,
        comentario: 'Pequeno, mas divertido pro long.',
      },
      {
        id: 'demo-check-caio',
        localId: picos.futuro.id,
        autor: CAIO,
        momento: minutosAtras(190),
        tamanhoOnda: 100,
        qualidade: 3,
        vento: 'Sem vento',
        crowd: 2,
        notaGeral: 4,
        comentario: 'Espelhado cedinho.',
      },
    ];

    this.sessoes = [
      {
        id: 'demo-sessao-lucas',
        autor: LUCAS,
        pico: picos.titanzinho,
        dataHora: emFortaleza(1, '06:00'),
        observacao: 'Quem anima? Encontro no quebra-mar.',
        confirmacoes: [LUCAS, BIA, TEO],
        criadoEm: minutosAtras(40),
      },
      {
        id: 'demo-sessao-duda',
        autor: DUDA,
        pico: picos.futuro,
        dataHora: emFortaleza(2, '07:00'),
        observacao: 'Sábado de manhã, depois açaí.',
        confirmacoes: [DUDA, MARINA],
        criadoEm: minutosAtras(95),
      },
    ];
  }

  temFotos(): boolean {
    return this.fotos.length > 0;
  }

  caminhoFoto(nome: string, pasta: string): string | undefined {
    return this.fotos.includes(nome) ? join(pasta, nome) : undefined;
  }

  /** A sessão criada pela captura (a do "você"), se já existir. */
  minhaSessao(): Sessao | undefined {
    return this.sessoes.find((s) => s.autor.id === EU.id);
  }

  /** A galera confirma presença na sessão do usuário (cena "chame a galera"). */
  confirmarGalera(): void {
    const sessao = this.minhaSessao();
    if (sessao) sessao.confirmacoes = [EU, MARINA, LUCAS, BIA, TEO, CAIO];
  }

  private distancia(picoId: string): number {
    const tabela: Record<string, number> = {
      [this.picos.futuro.id]: 3.4,
      [this.picos.titanzinho.id]: 4.8,
      [this.picos.iracema.id]: 3.1,
      [this.picos.lesteOeste.id]: 6.2,
    };
    return tabela[picoId] ?? 5;
  }

  feed() {
    const itens = [
      ...this.sessoes.map((s) => ({
        id: `plano-${s.id}`,
        tipo: 'plano' as const,
        criadoEm: s.criadoEm,
        plano: s,
        distanciaKm: this.distancia(s.pico.id),
      })),
      ...this.checks.map((c) => ({
        id: `check-${c.id}`,
        tipo: 'check' as const,
        criadoEm: c.momento,
        check: c,
        distanciaKm: this.distancia(c.localId),
      })),
    ].sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
    return {
      content: itens,
      totalElements: itens.length,
      totalPages: 1,
      number: 0,
      size: itens.length,
      first: true,
      last: true,
      referencia: new Date().toISOString(),
    };
  }

  sessoesFiltradas(params: URLSearchParams): Sessao[] {
    const picoId = params.get('picoId');
    const autorId = params.get('autorId');
    return this.sessoes
      .filter((s) => (!picoId || s.pico.id === picoId) && (!autorId || s.autor.id === autorId))
      .sort((a, b) => a.dataHora.localeCompare(b.dataHora));
  }

  criarSessao(corpo: { picoId: string; dataHora: string; observacao?: string }): Sessao {
    const pico = Object.values(this.picos).find((p) => p.id === corpo.picoId) ?? {
      id: corpo.picoId,
      nome: 'Pico',
    };
    const sessao: Sessao = {
      id: 'demo-sessao-rafa',
      autor: EU,
      pico,
      // O datetime-local chega sem fuso; a API interpreta no horário do pico.
      dataHora: corpo.dataHora.length <= 16 ? `${corpo.dataHora}:00-03:00` : corpo.dataHora,
      observacao: corpo.observacao,
      confirmacoes: [EU],
      criadoEm: new Date().toISOString(),
    };
    this.sessoes = [sessao, ...this.sessoes.filter((s) => s.id !== sessao.id)];
    return sessao;
  }

  criarCheck(corpo: Omit<Check, 'id' | 'autor' | 'momento'>): Check {
    const check: Check = { ...corpo, id: 'demo-check-rafa', autor: EU, momento: new Date().toISOString() };
    this.checks = [check, ...this.checks.filter((c) => c.id !== check.id)];
    return check;
  }

  checksDoLocal(localId: string | null): Check[] {
    return this.checks.filter((c) => !localId || c.localId === localId);
  }
}

// ---------------------------------------------------------------------------
//  Sessão "logada" só no navegador da captura
// ---------------------------------------------------------------------------

/** JWT de mentira (sem assinatura válida): o front só lê o `exp` para decidir se está logado. */
function tokenDemo(): string {
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64');
  const exp = Math.floor(Date.now() / 1000) + 7 * 86_400;
  return `${b64({ alg: 'none', typ: 'JWT' })}.${b64({ sub: EU.id, exp })}.demo`;
}

export const USUARIO_DEMO = {
  ...EU,
  email: 'demo@surfzada.test',
  nivel: 'intermediario',
  bio: 'Surfista de fim de tarde.',
};

const json = (route: Route, corpo: unknown, status = 200) =>
  route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(corpo) });

const TIPOS_IMAGEM: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

/**
 * Instala no contexto: login de demonstração, bloqueio de analytics (a captura
 * não deve contar como visita), respostas simuladas e o host dos avatares.
 */
export async function instalarMocks(
  contexto: BrowserContext,
  estado: EstadoDemo,
  pastaFotos: string,
): Promise<void> {
  const token = tokenDemo();
  await contexto.addInitScript(
    ([t, u]) => {
      localStorage.setItem('surfzada_token', t);
      localStorage.setItem('surfzada_usuario', u);
    },
    [token, JSON.stringify(USUARIO_DEMO)] as const,
  );

  await contexto.route(/googletagmanager\.com|google-analytics\.com|analytics\.google\.com/, (r) => r.abort());

  await contexto.route(`${DEMO}/**`, async (route) => {
    const url = new URL(route.request().url());
    const [, tipo, arquivo] = url.pathname.split('/');
    if (tipo === 'avatar') {
      return route.fulfill({ contentType: 'image/svg+xml', body: avatarSvg(arquivo.replace(/\.svg$/, '')) });
    }
    const caminho = tipo === 'foto' ? estado.caminhoFoto(decodeURIComponent(arquivo), pastaFotos) : undefined;
    if (caminho) {
      return route.fulfill({ contentType: TIPOS_IMAGEM[extname(caminho).toLowerCase()], body: readFileSync(caminho) });
    }
    return route.fulfill({ status: 404, body: '' });
  });

  await contexto.route(`${API}/**`, async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const caminho = url.pathname.replace(/^\/api\//, '');
    const metodo = req.method();

    if (metodo === 'GET' && caminho === 'auth/eu') return json(route, USUARIO_DEMO);
    if (metodo === 'GET' && caminho === 'feed') return json(route, estado.feed());
    if (metodo === 'GET' && caminho === 'sessoes') return json(route, estado.sessoesFiltradas(url.searchParams));
    if (metodo === 'GET' && caminho.startsWith('sessoes/')) {
      const sessao = estado.sessoes.find((s) => s.id === caminho.split('/')[1]);
      return sessao ? json(route, sessao) : json(route, { mensagem: 'não encontrada' }, 404);
    }
    if (metodo === 'GET' && caminho === 'surf-checks') {
      return json(route, estado.checksDoLocal(url.searchParams.get('localId')));
    }

    if (metodo === 'POST' && caminho === 'sessoes') return json(route, estado.criarSessao(req.postDataJSON()), 201);
    if (metodo === 'POST' && /^sessoes\/[^/]+\/presenca$/.test(caminho)) {
      estado.confirmarGalera();
      return json(route, estado.minhaSessao());
    }
    if (metodo === 'POST' && caminho === 'surf-checks') return json(route, estado.criarCheck(req.postDataJSON()), 201);

    // Qualquer outra escrita: responde aqui e não deixa sair.
    if (metodo !== 'GET') return json(route, {});

    // Leitura real (previsões, picos, busca...), sem o token de mentira.
    const { authorization: _semToken, ...cabecalhos } = req.headers();
    return route.continue({ headers: cabecalhos });
  });
}
