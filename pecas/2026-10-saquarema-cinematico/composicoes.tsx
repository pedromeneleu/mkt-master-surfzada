import { Composition, Folder } from 'remotion';

import { FORMATOS, FPS } from '@compartilhado/tema';

import { DURACAO_SAQUAREMA, SLUG, SaquaremaCinematico } from './SaquaremaCinematico';

export function Composicoes() {
  return (
    <Folder name={SLUG}>
      <Composition id="saquarema-cinematico" component={SaquaremaCinematico} durationInFrames={DURACAO_SAQUAREMA} fps={FPS} {...FORMATOS['reel-9x16']} />
    </Folder>
  );
}
