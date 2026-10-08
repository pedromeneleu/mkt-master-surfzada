import { FPS } from '../tema';

/**
 * Linha do tempo do Surfzada Analisa #1 (roteiro em
 * ../../../episodios/01-de-onde-vem-a-onda/roteiro.md).
 *
 * Enquanto a voz do Andy não existe, os tempos das falas são estimados pelo
 * número de palavras (~3 por segundo). Quando a narração for gravada:
 *   1. coloque o arquivo em public/episodios/01/narracao.wav e aponte
 *      `NARRACAO` para ele;
 *   2. troque os `inicio` das falas pelos tempos da transcrição.
 * A boca do Andy, as legendas e o ducking do ambiente seguem as falas.
 */
export const NARRACAO: string | null = null;

export const CENAS = {
  gancho: [0, 6],
  nascimento: [6, 17],
  agua: [17, 27.2],
  swell: [27.2, 38.2],
  chegando: [38.2, 49.8],
  fechamento: [49.8, 56.6],
} as const satisfies Record<string, readonly [number, number]>;

export type NomeCena = keyof typeof CENAS;

export const DURACAO = Math.round(CENAS.fechamento[1] * FPS);

/** Segundos → frames. */
export const f = (segundos: number) => Math.round(segundos * FPS);

export const inicioCena = (c: NomeCena) => f(CENAS[c][0]);
export const duracaoCena = (c: NomeCena) => f(CENAS[c][1] - CENAS[c][0]);

export interface Fala {
  /** Início em segundos, no tempo do episódio. */
  inicio: number;
  texto: string;
}

const PALAVRAS_POR_SEGUNDO = 3;

export const FALAS: Fala[] = [
  { inicio: 0.35, texto: 'Essa onda aí viajou milhares de quilômetros pra chegar.' },
  { inicio: 3.5, texto: "E não trouxe uma gota d'água junto." },

  { inicio: 6.5, texto: 'Ela nasceu numa tempestade lá no meio do Atlântico.' },
  { inicio: 10.1, texto: 'O vento empurra o mar e passa energia pra água.' },
  { inicio: 13.9, texto: 'Mais forte, mais tempo, mais mar: mais onda.' },

  { inicio: 17.5, texto: "E a gota d'água? Olha minha boia." },
  { inicio: 20.5, texto: 'A onda passa e ela só gira no lugar.' },
  { inicio: 23.9, texto: 'Quem viaja é a energia, parceiro. Não a água.' },

  { inicio: 27.6, texto: 'Perto da tempestade, o mar é bagunça.' },
  { inicio: 30.4, texto: 'Mas onda de período longo corre mais e sai na frente.' },
  { inicio: 34.6, texto: 'Dias depois, chega isso aqui: linhas organizadas. Swell.' },

  { inicio: 38.6, texto: 'Só que na costa quem manda é o fundo.' },
  { inicio: 41.8, texto: 'A mesma onda quebra perfeita num pico e fecha no vizinho.' },
  { inicio: 46.0, texto: 'Por quê?' },
  { inicio: 47.6, texto: 'Surfzada Analisa número dois.' },

  { inicio: 50.2, texto: 'Manda pro amigo que acha que onda vem da maré.' },
  { inicio: 53.9, texto: 'O mar não mente.' },
];

/** Duração estimada de uma fala, em segundos. */
export function duracaoFala(fala: Fala) {
  const palavras = fala.texto.split(/\s+/).length;
  return Math.max(0.8, palavras / PALAVRAS_POR_SEGUNDO);
}

/** A fala que está no ar em `segundos` (tempo do episódio), com o progresso de 0 a 1. */
export function falaNoInstante(segundos: number): { fala: Fala; t: number; decorrido: number } | null {
  for (const fala of FALAS) {
    const d = duracaoFala(fala);
    if (segundos >= fala.inicio && segundos < fala.inicio + d) {
      return { fala, t: (segundos - fala.inicio) / d, decorrido: segundos - fala.inicio };
    }
  }
  return null;
}
