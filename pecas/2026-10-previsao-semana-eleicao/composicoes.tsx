import { Composition, Folder } from 'remotion';

import { COR, FORMATOS, FPS } from '@compartilhado/tema';
import { criarStory } from '@modelos/story-previsao/StoryPrevisao';
import type { PrevisaoFimDeSemana } from '@modelos/story-previsao/tipos';

import dados from './dados.json';

const SLUG = '2026-10-previsao-semana-eleicao';

/** Semana da eleição: o gancho em duas linhas empurra a tabela um pouco para baixo. */
const { Story, duracao } = criarStory({
  dados: dados as unknown as PrevisaoFimDeSemana,
  quadrosPorDia: 115,
  topoLinhas: 444,
  alturaLinha: 222,
  sobretitulo: 'PREVISÃO DA SEMANA',
  titulo: (
    <div style={{ fontSize: 58, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.08, whiteSpace: 'nowrap' }}>
      Independente do resultado,
      <br />a semana promete <span style={{ color: COR.coral }}>altas ondas</span>.
    </div>
  ),
  legendaFinal: 'o dia eleito em cada pico: mais mar e vento melhor',
  altura: 'swell',
});

export function Composicoes() {
  return (
    <Folder name={SLUG}>
      <Composition id="previsao-semana-eleicao" component={Story} durationInFrames={duracao} fps={FPS} {...FORMATOS['story-9x16']} />
    </Folder>
  );
}
