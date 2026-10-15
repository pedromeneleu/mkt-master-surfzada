import { Folder, Still } from 'remotion';

import { FORMATOS } from '@compartilhado/tema';

import { Berlengas, Capa, Elite, Fecho, Fortaleza, Ilha, Pipeline, SLUG } from './Slides';

/** Os slides, na ordem do `carrossel.slides` do post.md. */
export function Composicoes() {
  return (
    <Folder name={SLUG}>
      <Still id="peniche-capa" component={Capa} {...FORMATOS['carrossel-4x5']} />
      <Still id="peniche-pipeline" component={Pipeline} {...FORMATOS['carrossel-4x5']} />
      <Still id="peniche-ilha" component={Ilha} {...FORMATOS['carrossel-4x5']} />
      <Still id="peniche-elite" component={Elite} {...FORMATOS['carrossel-4x5']} />
      <Still id="peniche-berlengas" component={Berlengas} {...FORMATOS['carrossel-4x5']} />
      <Still id="peniche-fortaleza" component={Fortaleza} {...FORMATOS['carrossel-4x5']} />
      <Still id="peniche-fecho" component={Fecho} {...FORMATOS['carrossel-4x5']} />
    </Folder>
  );
}
