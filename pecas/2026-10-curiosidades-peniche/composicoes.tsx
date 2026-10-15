import { Folder, Still } from 'remotion';

import { FORMATOS } from '@compartilhado/tema';

import { BiSeguido, Brasil, Caminhada, Capa, Fecho, Recorde, SLUG, Search } from './Slides';

/** Os slides, na ordem do `carrossel.slides` do post.md. */
export function Composicoes() {
  return (
    <Folder name={SLUG}>
      <Still id="peniche-capa" component={Capa} {...FORMATOS['carrossel-4x5']} />
      <Still id="peniche-recorde" component={Recorde} {...FORMATOS['carrossel-4x5']} />
      <Still id="peniche-bi-seguido" component={BiSeguido} {...FORMATOS['carrossel-4x5']} />
      <Still id="peniche-brasil" component={Brasil} {...FORMATOS['carrossel-4x5']} />
      <Still id="peniche-search" component={Search} {...FORMATOS['carrossel-4x5']} />
      <Still id="peniche-caminhada" component={Caminhada} {...FORMATOS['carrossel-4x5']} />
      <Still id="peniche-fecho" component={Fecho} {...FORMATOS['carrossel-4x5']} />
    </Folder>
  );
}
