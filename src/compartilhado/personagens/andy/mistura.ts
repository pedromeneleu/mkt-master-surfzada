import type { Boca, Corpo, Rosto } from './tipos';

const l = (a: number, b: number, t: number) => a + (b - a) * t;
const l2 = (a: [number, number], b: [number, number], t: number): [number, number] => [l(a[0], b[0], t), l(a[1], b[1], t)];

export const misturaBoca = (a: Boca, b: Boca, t: number): Boca => ({
  abertura: l(a.abertura, b.abertura, t),
  largura: l(a.largura, b.largura, t),
  sorriso: l(a.sorriso, b.sorriso, t),
  torto: l(a.torto, b.torto, t),
});

/**
 * Transição entre duas expressões. Os números interpolam; a forma do olho e
 * os efeitos trocam no meio. Para a troca do olho não "pular", a pálpebra
 * fecha um pouco no meio da transição, como uma piscada.
 */
export function misturaRosto(a: Rosto, b: Rosto, t: number): Rosto {
  const trocaOlho = a.olho !== b.olho;
  const piscada = trocaOlho ? Math.sin(Math.PI * t) * 0.8 : 0;
  return {
    olho: t < 0.5 ? a.olho : b.olho,
    palpebra: Math.max(l(a.palpebra, b.palpebra, t), piscada),
    pupila: l(a.pupila, b.pupila, t),
    olhar: l2(a.olhar, b.olhar, t),
    sobrancelha: l(a.sobrancelha, b.sobrancelha, t),
    altura: l(a.altura, b.altura, t),
    assimetria: l(a.assimetria, b.assimetria, t),
    boca: misturaBoca(a.boca, b.boca, t),
    efeitos: t < 0.5 ? a.efeitos : b.efeitos,
  };
}

export const misturaCorpo = (a: Corpo, b: Corpo, t: number): Corpo => ({
  inclina: l(a.inclina, b.inclina, t),
  estica: l(a.estica, b.estica, t),
  pulo: l(a.pulo, b.pulo, t),
  nadEsq: l(a.nadEsq, b.nadEsq, t),
  nadDir: l(a.nadDir, b.nadDir, t),
  peEsq: l2(a.peEsq, b.peEsq, t),
  peDir: l2(a.peDir, b.peDir, t),
  cabeca: l(a.cabeca, b.cabeca, t),
  queixo: l(a.queixo, b.queixo, t),
  vira: l(a.vira, b.vira, t),
  cauda: l(a.cauda, b.cauda, t),
});
