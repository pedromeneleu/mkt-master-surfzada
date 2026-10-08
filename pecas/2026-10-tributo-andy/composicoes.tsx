import type { ComponentType } from 'react';
import { Composition, Folder } from 'remotion';

import { DURACAO_GIRO, VOLTAS_CAPA } from './componentes/GiroEmLoop';
import { Capa } from './slides/Capa';
import { ACamisa, Auge, DURACAO_SLIDE, Fechamento, JeitoDele, Kauai, NaAgua, OQueFica, RisingSun, Rivalidade, Teahupoo } from './slides/Historia';
import { ALTURA, FONTE, FPS, LARGURA, SLUG } from './tema';

/** Os slides do carrossel, na ordem (a mesma do `carrossel.slides` no post.md). */
const SLIDES: { id: string; Componente: ComponentType; duracao: number }[] = [
  { id: 'tributo-andy-capa', Componente: Capa, duracao: DURACAO_GIRO * VOLTAS_CAPA },
  { id: 'tributo-andy-auge', Componente: Auge, duracao: DURACAO_SLIDE },
  { id: 'tributo-andy-kauai', Componente: Kauai, duracao: DURACAO_SLIDE },
  { id: 'tributo-andy-rivalidade', Componente: Rivalidade, duracao: DURACAO_SLIDE },
  { id: 'tributo-andy-jeito-dele', Componente: JeitoDele, duracao: DURACAO_SLIDE },
  { id: 'tributo-andy-na-agua', Componente: NaAgua, duracao: DURACAO_SLIDE },
  { id: 'tributo-andy-rising-sun', Componente: RisingSun, duracao: DURACAO_SLIDE },
  { id: 'tributo-andy-teahupoo', Componente: Teahupoo, duracao: DURACAO_SLIDE },
  { id: 'tributo-andy-o-que-fica', Componente: OQueFica, duracao: DURACAO_SLIDE },
  { id: 'tributo-andy-a-camisa', Componente: ACamisa, duracao: DURACAO_SLIDE },
  { id: 'tributo-andy-fechamento', Componente: Fechamento, duracao: DURACAO_SLIDE },
];

export function Composicoes() {
  return (
    <Folder name={SLUG}>
      {SLIDES.map(({ id, Componente, duracao }) => (
        <Composition
          key={id}
          id={id}
          component={() => (
            <div style={{ fontFamily: FONTE, width: '100%', height: '100%' }}>
              <Componente />
            </div>
          )}
          durationInFrames={duracao}
          fps={FPS}
          width={LARGURA}
          height={ALTURA}
        />
      ))}
    </Folder>
  );
}
