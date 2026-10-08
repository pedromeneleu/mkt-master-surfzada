import { Composition, Folder } from 'remotion';

import { FORMATOS, FPS } from '@compartilhado/tema';

import { DURACAO, Peca, SLUG } from './Peca';

export function Composicoes() {
  return (
    <Folder name={SLUG}>
      <Composition id="{{ID}}" component={Peca} durationInFrames={DURACAO} fps={FPS} {...FORMATOS['story-9x16']} />
    </Folder>
  );
}
