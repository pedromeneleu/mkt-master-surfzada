import { Composition, Folder, Still } from 'remotion';

import { LADO, SLIDES, SlideCarrossel01 } from './carrossel/Carrossel01';
import { FORMATOS, FPS, SLUG } from './tema';
import { Ep01 } from './video/Ep01';
import { DURACAO } from './video/tempos';

export function Composicoes() {
  return (
    <Folder name={SLUG}>
      <Composition id="explica-ep01" component={Ep01} durationInFrames={DURACAO} fps={FPS} {...FORMATOS['reel-9x16']} />
      {SLIDES.map((_, i) => (
        <Still key={i} id={`explica-ep01-carrossel-${i + 1}`} component={SlideCarrossel01} defaultProps={{ n: i + 1 }} width={LADO} height={LADO} />
      ))}
    </Folder>
  );
}
