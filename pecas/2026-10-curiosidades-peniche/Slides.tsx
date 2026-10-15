import type { ReactNode } from 'react';
import { AbsoluteFill, Img } from 'remotion';

import { FundoClaro, FundoEscuro, Logo } from '@compartilhado/marca/Marca';
import { Rotulo, Titulo } from '@compartilhado/marca/Texto';
import { COR, FONTE } from '@compartilhado/tema';
import { arquivosDaPeca } from '@compartilhado/util/arquivos';

export const SLUG = '2026-10-curiosidades-peniche';
const arquivo = arquivosDaPeca(SLUG);

/**
 * Carrossel 4:5 "5 curiosidades sobre a etapa de Peniche" (MEO Rip Curl Pro Portugal,
 * Supertubos): capa, cinco curiosidades da história da etapa e o fecho pedindo palpite.
 * Slides parados: `em` negativo deixa a marca inteira no quadro 0. Dados conferidos (fontes
 * no post.md). A marca é masculina: "o Surfzada".
 */
const PRONTO = -100;
const MARGEM = 88;
export const TOTAL = 7;

type Tom = 'claro' | 'escuro';

function Slide({ n, tom, rotulo, children }: { n: number; tom: Tom; rotulo: string; children: ReactNode }) {
  const escuro = tom === 'escuro';
  return (
    <AbsoluteFill style={{ fontFamily: FONTE, color: escuro ? '#fff' : COR.tinta }}>
      {escuro ? <FundoEscuro /> : <FundoClaro />}
      <div style={{ position: 'absolute', left: MARGEM, right: MARGEM, top: MARGEM, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Rotulo texto={rotulo} em={PRONTO} tamanho={24} cor={escuro ? COR.coral : COR.coralTexto} />
        <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: '0.12em', color: escuro ? COR.suave : COR.apagado }}>
          {n} / {TOTAL}
        </div>
      </div>
      <AbsoluteFill style={{ padding: `${MARGEM + 90}px ${MARGEM}px ${MARGEM}px` }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
}

function Foto({ src, altura, foco = '50% 50%' }: { src: string; altura: number; foco?: string }) {
  return (
    <div style={{ height: altura, borderRadius: 28, overflow: 'hidden', background: COR.tinta2 }}>
      <Img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: foco }} />
    </div>
  );
}

/** Área de baixo de cada curiosidade, onde vai a foto ou o desenho. */
function Base({ children }: { children: ReactNode }) {
  return <div style={{ position: 'absolute', left: MARGEM, right: MARGEM, bottom: MARGEM }}>{children}</div>;
}

export function Capa() {
  return (
    <Slide n={1} tom="escuro" rotulo="WSL · MEO RIP CURL PRO PORTUGAL">
      <Foto src={arquivo('fotos/supertubos.jpg')} altura={460} foco="50% 55%" />
      <div style={{ marginTop: 40 }}>
        <Titulo texto={'*5* curiosidades\nsobre a etapa de\nPeniche que você\nnão sabia 🌊'} em={PRONTO} tamanho={72} peso={700} cor="#fff" />
      </div>
      <div style={{ marginTop: 22, fontSize: 34, lineHeight: 1.35, color: COR.apagado }}>MEO Rip Curl Pro Portugal: começa em 16 de outubro, em Supertubos.</div>
      <div style={{ position: 'absolute', left: MARGEM, right: MARGEM, bottom: MARGEM, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Logo tamanho={40} em={PRONTO} cor="#fff" />
        <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: '0.08em', color: COR.apagado }}>arrasta →</div>
      </div>
    </Slide>
  );
}

function Curiosidade({ i, tom, titulo, texto, children }: { i: number; tom: Tom; titulo: string; texto: string; children: ReactNode }) {
  const escuro = tom === 'escuro';
  return (
    <Slide n={i + 1} tom={tom} rotulo={`CURIOSIDADE ${i} DE 5`}>
      <div style={{ fontSize: 132, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.04em', color: COR.coral }}>{String(i).padStart(2, '0')}</div>
      <div style={{ marginTop: 22 }}>
        <Titulo texto={titulo} em={PRONTO} tamanho={74} peso={700} cor={escuro ? '#fff' : COR.tinta} />
      </div>
      {texto && <div style={{ marginTop: 26, fontSize: 38, lineHeight: 1.38, color: escuro ? COR.apagado : COR.suave, maxWidth: 880 }}>{texto}</div>}
      <Base>{children}</Base>
    </Slide>
  );
}

function Etiqueta({ children, escuro }: { children: ReactNode; escuro?: boolean }) {
  return <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: '0.12em', color: escuro ? COR.apagado : COR.suave }}>{children}</div>;
}

/** Os três bicampeões, com os anos. */
export function Recorde() {
  const campeoes = [
    ['Mick Fanning', '2009 · 2014'],
    ['Italo Ferreira', '2018 · 2019'],
    ['Griffin Colapinto', '2022 · 2024'],
  ];
  return (
    <Curiosidade i={1} tom="claro" titulo={'Ninguém domina\nPeniche'} texto="No masculino, três surfistas dividem o recorde, com 2 títulos cada:">
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {campeoes.map(([nome, anos], k) => (
          <div
            key={nome}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '26px 0', borderTop: k ? `2px solid ${COR.borda}` : undefined }}
          >
            <div style={{ fontSize: 46, fontWeight: 700, letterSpacing: '-0.02em' }}>{nome}</div>
            <div style={{ fontSize: 36, fontWeight: 500, color: COR.suave, fontVariantNumeric: 'tabular-nums' }}>{anos}</div>
          </div>
        ))}
      </div>
    </Curiosidade>
  );
}

/** O primeiro bi seguido: dois anos lado a lado. */
export function BiSeguido() {
  return (
    <Curiosidade i={2} tom="escuro" titulo={'O primeiro\nbi seguido'} texto="Italo Ferreira foi o primeiro a vencer a etapa duas vezes seguidas.">
      <div style={{ display: 'flex', gap: 24 }}>
        {['2018', '2019'].map((ano) => (
          <div key={ano} style={{ flex: 1, padding: '40px 36px', borderRadius: 28, background: COR.tinta2, border: '2px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: 108, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1 }}>{ano}</div>
            <div style={{ marginTop: 16 }}>
              <Etiqueta escuro>CAMPEÃO · ITALO</Etiqueta>
            </div>
          </div>
        ))}
      </div>
    </Curiosidade>
  );
}

/** Os títulos brasileiros, um selo por título. */
export function Brasil() {
  const masculino = [
    ['Adriano', '2011'],
    ['Filipe', '2015'],
    ['Medina', '2017'],
    ['Italo', '2018'],
    ['Italo', '2019'],
    ['Chianca', '2023'],
    ['Yago', '2025'],
  ];
  const selo = (nome: string, ano: string, destaque?: boolean) => (
    <div
      key={nome + ano}
      style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 12,
        padding: '14px 24px',
        borderRadius: 999,
        background: destaque ? 'transparent' : COR.tinta,
        border: `3px solid ${COR.tinta}`,
        color: destaque ? COR.tinta : '#fff',
      }}
    >
      <span style={{ fontSize: 34, fontWeight: 700 }}>{nome}</span>
      <span style={{ fontSize: 26, fontWeight: 500, opacity: 0.7 }}>{ano}</span>
    </div>
  );
  return (
    <Curiosidade i={3} tom="claro" titulo={'Terra de\nbrasileiro 🇧🇷'} texto="">
      <Etiqueta>MASCULINO · 7 TÍTULOS</Etiqueta>
      <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 14 }}>{masculino.map(([n, a]) => selo(n, a))}</div>
      <div style={{ marginTop: 34 }}>
        <Etiqueta>FEMININO</Etiqueta>
      </div>
      <div style={{ marginTop: 16, display: 'flex' }}>{selo('Tati Weston-Webb', '2022', true)}</div>
    </Curiosidade>
  );
}

export function Search() {
  return (
    <Curiosidade
      i={4}
      tom="escuro"
      titulo={'A etapa nasceu\npor acaso'}
      texto="Em 2009, veio como o evento itinerante Rip Curl Pro Search. Fez tanto sucesso que virou parada fixa do circuito."
    >
      <Foto src={arquivo('fotos/farol.jpg')} altura={400} foco="50% 60%" />
    </Curiosidade>
  );
}

/** A caminhada de 2009, em dois números. */
export function Caminhada() {
  const numeros = [
    ['30 mil', 'FÃS'],
    ['5 km', 'A PÉ'],
  ];
  return (
    <Curiosidade i={5} tom="claro" titulo={'Valeu a\ncaminhada'} texto="Em 2009, os fãs caminharam até uma praia alternativa só para assistir às baterias.">
      <div style={{ display: 'flex', gap: 24 }}>
        {numeros.map(([valor, rotulo]) => (
          <div key={rotulo} style={{ flex: 1, padding: '40px 36px', borderRadius: 28, background: COR.superficie, border: `2px solid ${COR.borda}` }}>
            <div style={{ fontSize: 104, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1 }}>{valor}</div>
            <div style={{ marginTop: 16 }}>
              <Etiqueta>{rotulo}</Etiqueta>
            </div>
          </div>
        ))}
      </div>
    </Curiosidade>
  );
}

export function Fecho() {
  return (
    <Slide n={TOTAL} tom="escuro" rotulo="SUA VEZ">
      <div style={{ marginTop: 180 }}>
        <Titulo texto={'Quem leva\nPeniche\n*este* *ano?*'} em={PRONTO} tamanho={104} peso={700} cor="#fff" />
        <div style={{ marginTop: 34, fontSize: 56, fontWeight: 600 }}>Comenta aí 👇</div>
        <div style={{ marginTop: 64, display: 'inline-block', padding: '20px 36px', borderRadius: 999, background: '#fff', color: COR.tinta, fontSize: 32, fontWeight: 600 }}>
          Segue o Surfzada pra acompanhar a etapa
        </div>
      </div>
      <div style={{ position: 'absolute', left: MARGEM, right: MARGEM, bottom: MARGEM, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Logo tamanho={44} em={PRONTO} cor="#fff" />
        <div style={{ textAlign: 'right', lineHeight: 1.35 }}>
          <div style={{ fontSize: 30, fontWeight: 600, color: '#fff' }}>App do Surfzada</div>
          <div style={{ fontSize: 26, fontWeight: 500, color: COR.apagado }}>disponível na App Store</div>
        </div>
      </div>
    </Slide>
  );
}
