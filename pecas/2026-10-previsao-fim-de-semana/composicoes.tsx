import { Composition, Folder } from 'remotion';

import { COR, FORMATOS, FPS } from '@compartilhado/tema';
import { criarStory } from '@modelos/story-previsao/StoryPrevisao';
import type { PrevisaoFimDeSemana } from '@modelos/story-previsao/tipos';

import dados from './dados.json';

const SLUG = '2026-10-previsao-fim-de-semana';

const { Story, duracao } = criarStory({
  dados: dados as unknown as PrevisaoFimDeSemana,
  quadrosPorDia: 135,
  topoLinhas: 410,
  alturaLinha: 226,
  sobretitulo: 'PREVISÃO',
  titulo: (
    <div style={{ fontSize: 63, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.05, whiteSpace: 'nowrap' }}>
      Onde tem <span style={{ color: COR.coral }}>onda</span> até domingo?
    </div>
  ),
  legendaFinal: 'melhor dia de cada pico: mais mar e vento melhor',
});

export function Composicoes() {
  return (
    <Folder name={SLUG}>
      <Composition id="previsao-fim-de-semana" component={Story} durationInFrames={duracao} fps={FPS} {...FORMATOS['story-9x16']} />
    </Folder>
  );
}
