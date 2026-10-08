import type { CSSProperties, ReactNode } from 'react';
import { AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

import { arquivo, CHEGADA, COR, FONTE } from '../tema';
import { Simbolo, Wordmark } from '@compartilhado/marca/Marca';

export const MARGEM = 72;
export const TOTAL_SLIDES = 11;

/**
 * Slide da história: fundo tinta com o brilho coral do FundoEscuro do trailer
 * (a mesma tinta preta da camisa), rótulo em cima e logo + página embaixo.
 */
export function Slide({
  rotulo,
  pagina,
  children,
  fundo,
  credito,
}: {
  rotulo: string;
  pagina: number;
  children: ReactNode;
  fundo?: ReactNode;
  /** Crédito das fotos do slide, na vertical junto à borda direita (como em revista). */
  credito?: string;
}) {
  const frame = useCurrentFrame();
  const deriva = Math.sin(frame / 80) * 4;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(60% 55% at ${50 + deriva}% 112%, rgba(255,122,89,0.20), transparent 70%), ${COR.tinta}`,
        fontFamily: FONTE,
        color: COR.superficie,
      }}
    >
      {fundo}
      <div style={{ position: 'absolute', left: MARGEM, top: MARGEM - 8 }}>
        <Rotulo texto={rotulo} />
      </div>
      {children}
      {credito && <Credito texto={credito} />}
      <div
        style={{
          position: 'absolute',
          left: MARGEM,
          right: MARGEM,
          bottom: MARGEM - 26,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          opacity: 0.85,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Simbolo largura={54} em={-60} cor={COR.superficie} />
          <Wordmark tamanho={26} cor={COR.superficie} />
        </div>
        <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: '0.18em', fontVariantNumeric: 'tabular-nums' }}>
          {String(pagina).padStart(2, '0')} / {TOTAL_SLIDES}
        </div>
      </div>
    </AbsoluteFill>
  );
}

export function Credito({ texto }: { texto: string }) {
  return (
    <div
      style={{
        position: 'absolute',
        right: 24,
        bottom: 130,
        // Lido de baixo para cima, colado na borda direita.
        writingMode: 'vertical-rl',
        transform: 'rotate(180deg)',
        fontSize: 13,
        fontWeight: 500,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        color: 'rgba(255,255,255,0.55)',
      }}
    >
      {texto}
    </div>
  );
}

/**
 * Foto do Andy em preto e branco com contraste e grão: mantém a expressão
 * (a retícula apagaria o rosto) e fica na paleta da camisa. `zoom` faz um
 * Ken Burns lento ao longo do slide; `foco` é o object-position.
 */
export function FotoPB({
  src,
  largura,
  altura,
  foco = '50% 50%',
  zoom = 0.06,
  estilo,
}: {
  src: string;
  largura: number;
  altura: number;
  foco?: string;
  zoom?: number;
  estilo?: CSSProperties;
}) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const z = 1 + zoom * (frame / durationInFrames);
  return (
    <div style={{ position: 'relative', width: largura, height: altura, overflow: 'hidden', background: COR.tinta2, ...estilo }}>
      <Img
        src={arquivo(src)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: foco,
          filter: 'grayscale(1) contrast(1.22) brightness(0.92)',
          transform: `scale(${z})`,
          transformOrigin: foco,
        }}
      />
      <Grao />
    </div>
  );
}

/** Grão de filme por cima da foto (ruído SVG, muda a cada 2 quadros). */
function Grao() {
  const frame = useCurrentFrame();
  const semente = Math.floor(frame / 2) % 7;
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', mixBlendMode: 'overlay', opacity: 0.35 }}>
      <filter id={`grao-${semente}`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={semente} stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#grao-${semente})`} />
    </svg>
  );
}

/** Rótulo do trailer: traço coral que cresce + caixa-alta espaçada. */
export function Rotulo({ texto, em = 0, tamanho = 20 }: { texto: string; em?: number; tamanho?: number }) {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [em, em + 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: CHEGADA });
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: tamanho * 0.6,
        fontSize: tamanho,
        fontWeight: 600,
        letterSpacing: '0.16em',
        color: COR.coral,
        opacity: p,
        transform: `translateX(${(1 - p) * -20}px)`,
      }}
    >
      <span style={{ width: tamanho * 2 * p, height: 3, borderRadius: 2, background: COR.coral }} />
      {texto}
    </div>
  );
}

/** Parágrafo que sobe e aparece. Trechos entre *asteriscos* em branco cheio e peso 600. */
export function Texto({ children, em = 0, tamanho = 30, estilo }: { children: string; em?: number; tamanho?: number; estilo?: CSSProperties }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - em, fps, config: { damping: 200 } });
  return (
    <div
      style={{
        fontSize: tamanho,
        fontWeight: 400,
        lineHeight: 1.42,
        color: 'rgba(255,255,255,0.74)',
        opacity: p,
        transform: `translateY(${(1 - p) * 24}px)`,
        textWrap: 'pretty',
        ...estilo,
      }}
    >
      {children.split(/(\*[^*]+\*)/).map((t, i) =>
        t.startsWith('*') ? (
          <span key={i} style={{ color: COR.superficie, fontWeight: 600 }}>
            {t.slice(1, -1)}
          </span>
        ) : (
          t
        ),
      )}
    </div>
  );
}

/**
 * Foto do Andy dentro de um quadro (legenda em cima, crédito embaixo), na
 * mesma moldura dos quadros das costas. A foto entra varrendo, como a retícula.
 */
export function QuadroFoto({
  src,
  esquerda,
  direita,
  credito,
  em = 0,
  largura,
  altura,
  foco,
  ampliar = 1,
  estilo,
}: {
  src: string;
  esquerda: string;
  direita: string;
  credito?: string;
  em?: number;
  largura: number;
  altura: number;
  foco?: string;
  /** Escala extra (para tirar bordas da própria foto). */
  ampliar?: number;
  estilo?: CSSProperties;
}) {
  const frame = useCurrentFrame();
  const moldura = interpolate(frame, [em, em + 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: CHEGADA });
  const varre = interpolate(frame, [em + 6, em + 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: CHEGADA });
  const legenda = { fontSize: 16, fontWeight: 600, letterSpacing: '0.18em' };
  return (
    <div style={{ width: largura, opacity: moldura, ...estilo }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 9, ...legenda }}>
        <span>{esquerda}</span>
        <span style={{ opacity: 0.7 }}>{direita}</span>
      </div>
      <div style={{ position: 'relative', width: largura, height: altura, border: `2px solid ${COR.superficie}`, padding: 5, boxSizing: 'border-box' }}>
        <div style={{ width: '100%', height: '100%', overflow: 'hidden', clipPath: `inset(0 ${(1 - varre) * 100}% 0 0)` }}>
          <FotoPB src={src} largura={largura - 14} altura={altura - 14} foco={foco} estilo={{ transform: `scale(${ampliar})`, transformOrigin: foco ?? '50% 50%' }} />
        </div>
      </div>
      {credito && (
        <div style={{ marginTop: 8, fontSize: 13, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>
          Foto: {credito}
        </div>
      )}
    </div>
  );
}

/**
 * Foto em retícula dentro de um quadro, como os quadros Nº01–Nº04 das costas:
 * legenda em cima (esquerda e direita), moldura branca fina. A retícula entra
 * varrendo da esquerda para a direita.
 */
export function Quadro({
  src,
  esquerda,
  direita,
  em = 0,
  largura,
  altura,
  estilo,
}: {
  src: string;
  esquerda: string;
  direita: string;
  em?: number;
  largura: number;
  altura: number;
  estilo?: CSSProperties;
}) {
  const frame = useCurrentFrame();
  const moldura = interpolate(frame, [em, em + 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: CHEGADA });
  const varre = interpolate(frame, [em + 6, em + 34], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: CHEGADA });
  const legenda = { fontSize: 17, fontWeight: 600, letterSpacing: '0.18em' };
  return (
    <div style={{ width: largura, opacity: moldura, ...estilo }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, ...legenda }}>
        <span>{esquerda}</span>
        <span style={{ opacity: 0.7 }}>{direita}</span>
      </div>
      <div style={{ position: 'relative', width: largura, height: altura, border: `2px solid ${COR.superficie}`, overflow: 'hidden' }}>
        <Img
          src={arquivo(src)}
          style={{
            position: 'absolute',
            inset: 6,
            width: largura - 16,
            height: altura - 16,
            objectFit: 'cover',
            clipPath: `inset(0 ${(1 - varre) * 100}% 0 0)`,
          }}
        />
      </div>
    </div>
  );
}
