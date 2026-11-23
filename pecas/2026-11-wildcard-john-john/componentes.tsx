import { useId, type CSSProperties, type ReactNode } from 'react';
import { AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

import { Simbolo, Wordmark } from '@compartilhado/marca/Marca';
import { Rotulo } from '@compartilhado/marca/Texto';
import { CHEGADA, COR, FONTE } from '@compartilhado/tema';

import { arquivo, MARGEM, TOTAL_SLIDES } from './tema';

/** Fundo tinta com o brilho coral da marca, que respira devagar. */
export function FundoTinta() {
  const frame = useCurrentFrame();
  const deriva = Math.sin(frame / 80) * 4;
  return (
    <AbsoluteFill
      style={{ background: `radial-gradient(60% 55% at ${50 + deriva}% 112%, rgba(255,122,89,0.20), transparent 70%), ${COR.tinta}` }}
    />
  );
}

/** Slide do carrossel 4:5: rótulo em cima, logo e paginação embaixo, crédito na borda direita. */
export function Slide({ rotulo, pagina, credito, children }: { rotulo: string; pagina: number; credito?: string; children: ReactNode }) {
  return (
    <AbsoluteFill style={{ fontFamily: FONTE, color: COR.superficie }}>
      <FundoTinta />
      {children}
      <div style={{ position: 'absolute', left: MARGEM, top: MARGEM - 8 }}>
        <Rotulo texto={rotulo} cor={COR.coral} tamanho={20} />
      </div>
      {credito && <Credito texto={credito} />}
      <Rodape pagina={pagina} />
    </AbsoluteFill>
  );
}

export function Rodape({ pagina }: { pagina?: number }) {
  return (
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
      {pagina !== undefined && (
        <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: '0.18em', fontVariantNumeric: 'tabular-nums' }}>
          {String(pagina).padStart(2, '0')} / {String(TOTAL_SLIDES).padStart(2, '0')}
        </div>
      )}
    </div>
  );
}

/** Crédito da foto na vertical, colado na borda direita (lido de baixo para cima). */
export function Credito({ texto, baixo = 140 }: { texto: string; baixo?: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        right: 22,
        bottom: baixo,
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
 * Foto em preto e branco com contraste e grão. As fotos que temos são pequenas (≤ 738 px): o P&B
 * com grão esconde a ampliação e deixa as três com a mesma cara. `zoom` = Ken Burns lento.
 */
export function Foto({
  src,
  largura,
  altura,
  foco = '50% 50%',
  zoom = 0.05,
  escala = 1,
  estilo,
}: {
  src: string;
  largura: number;
  altura: number;
  foco?: string;
  zoom?: number;
  /** Escala extra, para recortar mais justo. */
  escala?: number;
  estilo?: CSSProperties;
}) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const z = escala * (1 + zoom * (frame / durationInFrames));
  return (
    <div style={{ position: 'relative', width: largura, height: altura, overflow: 'hidden', background: COR.tinta2, ...estilo }}>
      <Img
        src={arquivo(src)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: foco,
          filter: 'grayscale(1) contrast(1.2) brightness(0.95)',
          transform: `scale(${z})`,
          transformOrigin: foco,
        }}
      />
      <Grao />
    </div>
  );
}

/** Grão de filme (ruído SVG) por cima da foto; muda a cada 2 quadros. */
function Grao() {
  const frame = useCurrentFrame();
  const id = useId().replace(/:/g, '');
  const semente = Math.floor(frame / 2) % 7;
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', mixBlendMode: 'overlay', opacity: 0.4 }}>
      <filter id={`grao-${id}`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={semente} stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#grao-${id})`} />
    </svg>
  );
}

/** Foto dentro de uma moldura branca fina, com legenda em cima; entra varrendo da esquerda. */
export function Quadro({
  src,
  largura,
  altura,
  esquerda,
  direita,
  em = 0,
  foco,
  escala,
  estilo,
}: {
  src: string;
  largura: number;
  altura: number;
  esquerda?: string;
  direita?: string;
  em?: number;
  foco?: string;
  escala?: number;
  estilo?: CSSProperties;
}) {
  const frame = useCurrentFrame();
  const moldura = interpolate(frame, [em, em + 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: CHEGADA });
  const varre = interpolate(frame, [em + 6, em + 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: CHEGADA });
  return (
    <div style={{ width: largura, opacity: moldura, ...estilo }}>
      {(esquerda || direita) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 16, fontWeight: 600, letterSpacing: '0.18em' }}>
          <span>{esquerda}</span>
          <span style={{ opacity: 0.7 }}>{direita}</span>
        </div>
      )}
      <div style={{ width: largura, height: altura, border: `2px solid ${COR.superficie}`, padding: 6, boxSizing: 'border-box' }}>
        <div style={{ width: '100%', height: '100%', overflow: 'hidden', clipPath: `inset(0 ${(1 - varre) * 100}% 0 0)` }}>
          <Foto src={src} largura={largura - 16} altura={altura - 16} foco={foco} escala={escala} />
        </div>
      </div>
    </div>
  );
}

/** Parágrafo que sobe e aparece. Trechos entre *asteriscos* em branco cheio, peso 600. */
export function Paragrafo({
  children,
  em = 0,
  tamanho = 32,
  cor = 'rgba(255,255,255,0.74)',
  destaque = COR.superficie,
  estilo,
}: {
  children: string;
  em?: number;
  tamanho?: number;
  cor?: string;
  destaque?: string;
  estilo?: CSSProperties;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - em, fps, config: { damping: 200 } });
  return (
    <div
      style={{
        fontSize: tamanho,
        fontWeight: 400,
        lineHeight: 1.38,
        color: cor,
        opacity: p,
        transform: `translateY(${(1 - p) * 24}px)`,
        textWrap: 'pretty',
        ...estilo,
      }}
    >
      {children.split(/(\*[^*]+\*)/).map((t, i) =>
        t.startsWith('*') ? (
          <span key={i} style={{ color: destaque, fontWeight: 600 }}>
            {t.slice(1, -1)}
          </span>
        ) : (
          t
        ),
      )}
    </div>
  );
}

/** Algo que entra com mola (escala + opacidade) no quadro `em`. */
export function Entra({ em, children, estilo }: { em: number; children: ReactNode; estilo?: CSSProperties }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - em, fps, config: { damping: 14, stiffness: 160 } });
  return <div style={{ opacity: Math.min(1, p * 1.5), transform: `scale(${0.85 + 0.15 * p})`, ...estilo }}>{children}</div>;
}

/** Seta "→" coral que dá toques para a direita (chamada para arrastar). */
export function SetaArrasta({ texto = 'ARRASTA' }: { texto?: string }) {
  const frame = useCurrentFrame();
  const empurra = Math.max(0, Math.sin((frame / 30) * Math.PI * 2)) ** 3 * 12;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 18, fontWeight: 600, letterSpacing: '0.16em' }}>
      {texto}
      <svg width={44} height={20} viewBox="0 0 44 20" style={{ transform: `translateX(${empurra}px)` }}>
        <path d="M0 10 H40 M31 2 L41 10 L31 18" fill="none" stroke={COR.coral} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
