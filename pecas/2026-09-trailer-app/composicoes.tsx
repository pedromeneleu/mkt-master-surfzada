import { Composition, Folder } from 'remotion';

import { REEL_ENERGIA, ReelEnergia } from './ReelEnergia';
import { FORMATOS, FPS, SLUG } from './tema';
import { HORIZONTAL, Trailer, TrailerVertical, VERTICAL, duracao } from './Trailer';

export function Composicoes() {
  return (
    <Folder name={SLUG}>
      <Composition id="trailer-app-16x9" component={Trailer} durationInFrames={duracao(HORIZONTAL)} fps={FPS} {...FORMATOS['video-16x9']} />
      <Composition id="trailer-app-9x16" component={TrailerVertical} durationInFrames={duracao(VERTICAL)} fps={FPS} {...FORMATOS['reel-9x16']} />
      <Composition id="trailer-app-reel-energia" component={ReelEnergia} durationInFrames={duracao(REEL_ENERGIA)} fps={FPS} {...FORMATOS['reel-9x16']} />
    </Folder>
  );
}
