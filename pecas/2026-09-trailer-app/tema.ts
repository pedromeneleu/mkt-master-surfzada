import { arquivosDaPeca } from '@compartilhado/util/arquivos';

import dados from './dados/manifesto.json';
import musica from './dados/musica.json';
import type { Manifesto, Musica } from './dados/tipos';

/** Tema da marca + o que é só do trailer (capturas, trilha e grade de batidas). */
export * from '@compartilhado/tema';

export const SLUG = '2026-09-trailer-app';
/** Arquivo em public/pecas/2026-09-trailer-app/ (capturas, trilha). */
export const arquivo = arquivosDaPeca(SLUG);

/** O que a captura gravou (telas, caixas dos elementos, dados reais). */
export const M = dados as unknown as Manifesto;

/**
 * Trilha: "Modern Psychedelic Acoustic Rock Full", de catch22music (Pixabay).
 * O andamento, a virada e os compassos vêm de `npm run musica -- trailer-app`
 * (dados/musica.json). `false` = só os efeitos, a 120 BPM.
 */
export const COM_MUSICA = true;
export const TRILHA: Musica = musica;
export const VOLUME_MUSICA = 0.6;

const FPS_TRAILER = 30;
/** Duração de uma batida em frames (20 a 90 BPM). Cenas e acentos são medidos nela. */
export const BATIDA = COM_MUSICA ? TRILHA.batida * FPS_TRAILER : (FPS_TRAILER * 60) / 120;
/** Batidas → frames. */
export const bt = (batidas: number) => Math.round(batidas * BATIDA);

/** Instante (s) do tempo `tempo` do compasso `n` da trilha, contado como na análise. */
export function naMusica(n: number, tempo = 1): number {
  const c = TRILHA.compassos[n - 1];
  if (!c) throw new Error(`A trilha não tem o compasso ${n}`);
  return c.t + (tempo - 1) * TRILHA.batida;
}
