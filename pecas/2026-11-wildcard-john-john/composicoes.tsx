import type { ComponentType } from 'react';
import { Composition, Folder } from 'remotion';

import { FORMATOS, FPS } from '@compartilhado/tema';

import { Capa, Chamada, Chave, EmJogo, Pedido, Quintal, UltimaChance } from './slides';
import { StoryContexto, StoryEnquete } from './stories';
import { DURACAO_SLIDE, DURACAO_STORY, DURACAO_VEREDITO, SLUG } from './tema';
import { Veredito, type PropsVeredito } from './Veredito';

/** Slides do carrossel, na ordem do `carrossel.slides` do post.md. */
const SLIDES: { id: string; Componente: ComponentType }[] = [
  { id: 'wildcard-john-john-capa', Componente: Capa },
  { id: 'wildcard-john-john-pedido', Componente: Pedido },
  { id: 'wildcard-john-john-quintal', Componente: Quintal },
  { id: 'wildcard-john-john-chave', Componente: Chave },
  { id: 'wildcard-john-john-em-jogo', Componente: EmJogo },
  { id: 'wildcard-john-john-ultima-chance', Componente: UltimaChance },
  { id: 'wildcard-john-john-chamada', Componente: Chamada },
];

/** Veredito: as duas versões ficam prontas; troque `porcentagemSim` pelo resultado da enquete. */
const VEREDITOS: { id: string; props: PropsVeredito }[] = [
  { id: 'wildcard-john-john-veredito-aceitou', props: { decisao: 'aceitou', porcentagemSim: null } },
  { id: 'wildcard-john-john-veredito-negou', props: { decisao: 'negou', porcentagemSim: null } },
];

export function Composicoes() {
  return (
    <Folder name={SLUG}>
      {SLIDES.map(({ id, Componente }) => (
        <Composition key={id} id={id} component={Componente} durationInFrames={DURACAO_SLIDE} fps={FPS} {...FORMATOS['carrossel-4x5']} />
      ))}
      <Composition
        id="wildcard-john-john-story-contexto"
        component={StoryContexto}
        durationInFrames={DURACAO_STORY}
        fps={FPS}
        {...FORMATOS['story-9x16']}
      />
      <Composition
        id="wildcard-john-john-story-enquete"
        component={StoryEnquete}
        durationInFrames={DURACAO_STORY}
        fps={FPS}
        {...FORMATOS['story-9x16']}
      />
      {VEREDITOS.map(({ id, props }) => (
        <Composition
          key={id}
          id={id}
          component={Veredito}
          defaultProps={props}
          durationInFrames={DURACAO_VEREDITO}
          fps={FPS}
          {...FORMATOS['reel-9x16']}
        />
      ))}
    </Folder>
  );
}
