import { Composition, Folder } from 'remotion';

import { FORMATOS, FPS } from '@compartilhado/tema';

import { DURACAO_PARABENS, SLUG, StoryParabensRyan } from './StoryParabensRyan';

export function Composicoes() {
  return (
    <Folder name={SLUG}>
      <Composition id="parabens-ryan" component={StoryParabensRyan} durationInFrames={DURACAO_PARABENS} fps={FPS} {...FORMATOS['story-9x16']} />
    </Folder>
  );
}
