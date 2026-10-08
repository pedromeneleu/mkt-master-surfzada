import type { ComponentType } from 'react';

/**
 * Registro das peças no Studio, em ordem de slug. O `npm run novo` acrescenta
 * as linhas sozinho (antes dos marcadores); para tirar uma peça do Studio,
 * apague as duas linhas dela. Peças sem composicoes.tsx (só ideia) não entram.
 */
import { Composicoes as p202609ExplicaEp01 } from './2026-09-explica-ep01/composicoes';
import { Composicoes as p202609TrailerApp } from './2026-09-trailer-app/composicoes';
import { Composicoes as p202610MemeOneShot } from './2026-10-meme-one-shot/composicoes';
import { Composicoes as p202610ParabensRyan } from './2026-10-parabens-ryan/composicoes';
import { Composicoes as p202610PlaylistTeahupoo } from './2026-10-playlist-teahupoo/composicoes';
import { Composicoes as p202610PlaylistWaikiki } from './2026-10-playlist-waikiki/composicoes';
import { Composicoes as p202610PrevisaoFimDeSemana } from './2026-10-previsao-fim-de-semana/composicoes';
import { Composicoes as p202610PrevisaoSemanaEleicao } from './2026-10-previsao-semana-eleicao/composicoes';
import { Composicoes as p202610SaquaremaCinematico } from './2026-10-saquarema-cinematico/composicoes';
import { Composicoes as p202610TributoAndy } from './2026-10-tributo-andy/composicoes';
// novo:imports

export const PECAS: { slug: string; Composicoes: ComponentType }[] = [
  { slug: '2026-09-explica-ep01', Composicoes: p202609ExplicaEp01 },
  { slug: '2026-09-trailer-app', Composicoes: p202609TrailerApp },
  { slug: '2026-10-meme-one-shot', Composicoes: p202610MemeOneShot },
  { slug: '2026-10-parabens-ryan', Composicoes: p202610ParabensRyan },
  { slug: '2026-10-playlist-teahupoo', Composicoes: p202610PlaylistTeahupoo },
  { slug: '2026-10-playlist-waikiki', Composicoes: p202610PlaylistWaikiki },
  { slug: '2026-10-previsao-fim-de-semana', Composicoes: p202610PrevisaoFimDeSemana },
  { slug: '2026-10-previsao-semana-eleicao', Composicoes: p202610PrevisaoSemanaEleicao },
  { slug: '2026-10-saquarema-cinematico', Composicoes: p202610SaquaremaCinematico },
  { slug: '2026-10-tributo-andy', Composicoes: p202610TributoAndy },
  // novo:pecas
];
