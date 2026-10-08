import type { Boca, Rosto } from './tipos';

export const BOCA_FECHADA: Boca = { abertura: 0, largura: 1, sorriso: 0, torto: 0.35 };

/**
 * O Andy em repouso já tem cara de quem viu muito mar: pálpebra pesada,
 * sobrancelha um pouco franzida e um meio sorriso de canto. Sem rubor.
 */
export const ROSTO_PADRAO: Rosto = {
  olho: 'aberto',
  palpebra: 0.32,
  pupila: 1,
  olhar: [0, 0],
  sobrancelha: -0.3,
  altura: 0,
  assimetria: 0,
  boca: BOCA_FECHADA,
  efeitos: [],
};

/** Monta um rosto a partir do padrão; `boca` pode vir parcial. */
function rosto(r: Omit<Partial<Rosto>, 'boca'> & { boca?: Partial<Boca> }): Rosto {
  return { ...ROSTO_PADRAO, ...r, boca: { ...BOCA_FECHADA, ...r.boca } };
}

export const EXPRESSOES = {
  neutro: rosto({}),
  determinado: rosto({ sobrancelha: -0.7, altura: -0.6, palpebra: 0.28, olhar: [0.4, 0], boca: { torto: 0, sorriso: -0.2 } }),
  deboche: rosto({ palpebra: 0.45, assimetria: 1, sobrancelha: -0.2, olhar: [-0.4, 0], boca: { torto: 1, sorriso: 0.3 } }),
  alegria: rosto({ palpebra: 0.15, sobrancelha: 0, altura: 0.2, boca: { sorriso: 0.9, abertura: 0.2, torto: 0.3 } }),
  riso: rosto({ olho: 'feliz', sobrancelha: 0.1, altura: 0.3, boca: { sorriso: 1, abertura: 0.95, largura: 1.15, torto: 0.2 } }),
  tristeza: rosto({ sobrancelha: 0.9, altura: 0, palpebra: 0.5, olhar: [0, 0.7], boca: { sorriso: -0.9, torto: 0 } }),
  lamento: rosto({ sobrancelha: 1, altura: 0.2, palpebra: 0.4, olhar: [-0.3, 0.6], boca: { sorriso: -1, torto: -0.2 }, efeitos: ['lagrima'] }),
  raiva: rosto({ sobrancelha: -1, altura: -1, palpebra: 0.4, pupila: 0.8, boca: { sorriso: -0.8, largura: 1.1, torto: 0 } }),
  furia: rosto({ sobrancelha: -1, altura: -1, palpebra: 0.2, pupila: 0.7, boca: { sorriso: -0.9, abertura: 0.85, largura: 1.2, torto: 0 }, efeitos: ['raiva'] }),
  medo: rosto({ olho: 'arregalado', palpebra: 0, sobrancelha: 1, altura: 0.8, pupila: 0.6, boca: { sorriso: -0.8, abertura: 0.3, largura: 0.9, torto: -0.3 }, efeitos: ['suor'] }),
  surpresa: rosto({ olho: 'arregalado', palpebra: 0, sobrancelha: 0.2, altura: 1, pupila: 0.9, boca: { abertura: 0.7, largura: 0.75, sorriso: 0, torto: 0 } }),
  pensativo: rosto({ palpebra: 0.4, olhar: [0.7, -0.8], assimetria: 0.8, sobrancelha: -0.1, boca: { sorriso: -0.3, largura: 0.9, torto: -0.6 } }),
  desconfiado: rosto({ palpebra: 0.62, olhar: [-0.8, 0], assimetria: 0.9, sobrancelha: -0.5, boca: { sorriso: -0.4, torto: 0.5 } }),
  ideia: rosto({ palpebra: 0, pupila: 1.05, altura: 0.9, sobrancelha: 0, olhar: [0.2, -0.6], boca: { sorriso: 0.8, abertura: 0.4, torto: 0.5 }, efeitos: ['ideia'] }),
  tedio: rosto({ palpebra: 0.62, olhar: [0.5, -0.5], sobrancelha: 0.1, altura: -0.2, boca: { sorriso: -0.4, largura: 0.9, torto: -0.3 } }),
} satisfies Record<string, Rosto>;

export type NomeExpressao = keyof typeof EXPRESSOES;

/**
 * Posições do boca na fala (visemas), simplificadas para um boca: o que muda
 * é quanto abre e a largura. Por cima de uma expressão, trocam só o boca.
 */
export const VISEMAS = {
  repouso: { abertura: 0, largura: 1, sorriso: 0, torto: 0.35 },
  A: { abertura: 1, largura: 1.1, sorriso: 0, torto: 0.2 },
  E: { abertura: 0.55, largura: 1.2, sorriso: 0.25, torto: 0.2 },
  I: { abertura: 0.28, largura: 1.25, sorriso: 0.35, torto: 0.2 },
  O: { abertura: 0.7, largura: 0.72, sorriso: 0, torto: 0 },
  U: { abertura: 0.35, largura: 0.6, sorriso: 0, torto: 0 },
  M: { abertura: 0, largura: 0.92, sorriso: -0.15, torto: 0.2 },
  consoante: { abertura: 0.18, largura: 1, sorriso: 0, torto: 0.25 },
} satisfies Record<string, Boca>;

export type NomeVisema = keyof typeof VISEMAS;

const SEM_ACENTO = (c: string) => c.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Letra → visema, para o português. */
export function visemaDaLetra(letra: string): NomeVisema {
  const c = SEM_ACENTO(letra);
  if (c === 'a') return 'A';
  if (c === 'e') return 'E';
  if (c === 'i' || c === 'y') return 'I';
  if (c === 'o') return 'O';
  if (c === 'u') return 'U';
  if ('mbp'.includes(c)) return 'M';
  if (/[a-z]/.test(c)) return 'consoante';
  return 'repouso';
}

/**
 * Boca falando um texto sem áudio: percorre as letras a `letrasPorSegundo` e
 * suaviza a troca entre visemas. Serve para testes e falas curtas. Com
 * narração gravada, usar `bocaPelaAmplitude` com o volume do áudio.
 */
export function bocaFalando(texto: string, segundos: number, letrasPorSegundo = 13): Boca {
  const letras = [...texto];
  const pos = segundos * letrasPorSegundo;
  if (pos < 0 || pos >= letras.length) return VISEMAS.repouso;
  const i = Math.floor(pos);
  const t = pos - i;
  const a = VISEMAS[visemaDaLetra(letras[i])];
  const b = VISEMAS[visemaDaLetra(letras[i + 1] ?? ' ')];
  // Segura a letra na primeira metade e faz a transição na segunda.
  const k = t < 0.5 ? 0 : (t - 0.5) * 2;
  return {
    abertura: a.abertura + (b.abertura - a.abertura) * k,
    largura: a.largura + (b.largura - a.largura) * k,
    sorriso: a.sorriso + (b.sorriso - a.sorriso) * k,
    torto: a.torto + (b.torto - a.torto) * k,
  };
}

/** Boca pelo volume da fala (0 a 1), para sincronizar com a narração gravada. */
export function bocaPelaAmplitude(volume: number, base: Boca = BOCA_FECHADA): Boca {
  const v = Math.max(0, Math.min(1, volume));
  return { abertura: v, largura: base.largura + (1 - v) * 0.05, sorriso: base.sorriso * (1 - v * 0.5), torto: base.torto * (1 - v * 0.5) };
}
