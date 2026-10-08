import { Composition, Folder } from 'remotion';

import { FORMATOS, FPS } from '@compartilhado/tema';

import { DURACAO, Peca, SLUG } from './Peca';

export function Composicoes() {
  return (
    <Folder name={SLUG}>
      <Composition id="coisas-que-so-quem-surfa-entende" component={Peca} durationInFrames={DURACAO} fps={FPS} {...FORMATOS['reel-9x16']} />
    </Folder>
  );
}
