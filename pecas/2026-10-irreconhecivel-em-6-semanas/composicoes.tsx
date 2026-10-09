import { Folder, Still } from 'remotion';

import { FORMATOS } from '@compartilhado/tema';

import { Capa, Comparacao, Fecho, PONTOS, SLUG, SlidePonto } from './Slides';

/** Os slides, na ordem do `carrossel.slides` do post.md. */
export function Composicoes() {
  return (
    <Folder name={SLUG}>
      <Still id="irreconhecivel-capa" component={Capa} {...FORMATOS['carrossel-4x5']} />
      <Still id="irreconhecivel-comparacao" component={Comparacao} {...FORMATOS['carrossel-4x5']} />
      {PONTOS.map((_, i) => (
        <Still key={i} id={`irreconhecivel-ponto-${i + 1}`} component={() => <SlidePonto i={i} />} {...FORMATOS['carrossel-4x5']} />
      ))}
      <Still id="irreconhecivel-fecho" component={Fecho} {...FORMATOS['carrossel-4x5']} />
    </Folder>
  );
}
