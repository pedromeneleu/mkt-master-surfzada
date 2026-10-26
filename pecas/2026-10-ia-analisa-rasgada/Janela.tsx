import type { ReactNode } from 'react';
import { AbsoluteFill, Freeze, OffthreadVideo, useCurrentFrame } from 'remotion';

import { COR, FONTE, FPS } from '@compartilhado/tema';

import { Esqueleto } from './Esqueleto';
import { arquivo } from './comum';
import {
  ALTURA_CLIPE,
  LARGURA_CLIPE,
  centroCamera,
  pose,
  poseIdeal,
  quadroNoTempo,
  tempoDoQuadro,
  type IdClipe,
  type Ponto,
} from './pose';

export type Camera = {
  /** 1 = o clipe inteiro na largura da janela. */
  zoom: number;
  /** Desloca o centro em relação ao surfista (0–1 do clipe), ex.: { y: 0.05 } mira mais nas pernas. */
  mira?: { x?: number; y?: number };
};

/** Converte um ponto do clipe (0–1) para pixels da janela, com o enquadramento atual. */
export type Projetar = (p: Ponto) => [number, number];

/**
 * A janela horizontal do vídeo (como na referência): o clipe parado exatamente no
 * quadro `t`, enquadrado por uma câmera virtual que segue o surfista, com o esqueleto
 * por cima. `t` vem de cada cena (câmera lenta, rewind, congelado).
 */
export function Janela({
  clipe,
  t,
  largura,
  altura,
  camera,
  esqueleto = 1,
  ideal = 0,
  fantasma = false,
  escurece = 0,
  filtro,
  children,
}: {
  clipe: IdClipe;
  /** Segundo do clipe. */
  t: number;
  largura: number;
  altura: number;
  camera: Camera;
  /** 0–1: quanto do esqueleto já foi traçado (0 = sem esqueleto). */
  esqueleto?: number;
  /** 0–1: mistura da pose real para a linha ideal (poseIdeal). */
  ideal?: number;
  /** Desenha a pose real apagada por baixo (quando `ideal` > 0). */
  fantasma?: boolean;
  escurece?: number;
  filtro?: string;
  children?: (projetar: Projetar, pts: Ponto[], quadro: number) => ReactNode;
}) {
  const q = quadroNoTempo(clipe, t);
  const real = pose(clipe, q);
  const pts = ideal > 0 ? mistura(real, poseIdeal(real), ideal) : real;

  // Câmera: cobre a janela e centraliza o surfista (suavizado), sem mostrar borda do clipe.
  const [cx, cy] = centroCamera(clipe, q);
  const s = (largura / LARGURA_CLIPE) * camera.zoom;
  const vw = LARGURA_CLIPE * s;
  const vh = ALTURA_CLIPE * s;
  const mx = cx + (camera.mira?.x ?? 0);
  const my = cy + (camera.mira?.y ?? 0);
  const left = Math.min(0, Math.max(largura - vw, largura / 2 - mx * vw));
  const top = Math.min(0, Math.max(altura - vh, altura / 2 - my * vh));
  const projetar: Projetar = (p) => [left + p[0] * vw, top + p[1] * vh];

  return (
    <div style={{ position: 'relative', width: largura, height: altura, overflow: 'hidden', background: COR.tinta }}>
      {/* Freeze no tempo exato do quadro q: vídeo e pose são o mesmo quadro. */}
      <Freeze frame={tempoDoQuadro(clipe, q) * FPS}>
        <OffthreadVideo
          src={arquivo(`clipes/${clipe}.mp4`)}
          muted
          style={{
            position: 'absolute',
            left,
            top,
            width: vw,
            height: vh,
            maxWidth: 'none',
            filter: filtro ?? 'contrast(1.06) saturate(0.9)',
          }}
        />
      </Freeze>
      <AbsoluteFill style={{ background: COR.tinta, opacity: escurece }} />
      <Grao largura={largura} altura={altura} />
      {fantasma && ideal > 0 && <Esqueleto pts={real} projetar={projetar} cor="#ffffff" opacidade={0.45} tracejado espessura={4} />}
      {esqueleto > 0 && <Esqueleto pts={pts} projetar={projetar} progresso={esqueleto} />}
      {children?.(projetar, pts, q)}
    </div>
  );
}

function mistura(a: Ponto[], b: Ponto[], k: number): Ponto[] {
  return a.map((p, i) => [p[0] + (b[i][0] - p[0]) * k, p[1] + (b[i][1] - p[1]) * k, p[2]]);
}

/** Grão de impressão: ruído que muda a cada quadro (a textura do zine, sem pesar no vídeo). */
function Grao({ largura, altura }: { largura: number; altura: number }) {
  const frame = useCurrentFrame();
  return (
    <svg width={largura} height={altura} style={{ position: 'absolute', inset: 0, opacity: 0.09, mixBlendMode: 'overlay' }}>
      <filter id={`grao-${largura}-${altura}`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={frame} stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#grao-${largura}-${altura})`} />
    </svg>
  );
}

/**
 * Moldura de visor por cima da janela: cantos em L e as legendas técnicas pequenas
 * ("● RASTREADO", "QUADRO 0123"), como na referência.
 */
export function Visor({
  largura,
  altura,
  esquerda,
  direita,
  baixoEsquerda,
  baixoDireita,
  destaque = true,
}: {
  largura: number;
  altura: number;
  esquerda?: string;
  direita?: string;
  baixoEsquerda?: string;
  baixoDireita?: string;
  destaque?: boolean;
}) {
  const canto = 34;
  const linha = 'rgba(255,255,255,0.85)';
  const cantos: [number, number, number, number][] = [
    [-10, -10, 1, 1],
    [largura + 10, -10, -1, 1],
    [-10, altura + 10, 1, -1],
    [largura + 10, altura + 10, -1, -1],
  ];
  const rotulo = (texto: string | undefined, estilo: React.CSSProperties, cor = 'rgba(255,255,255,0.7)') =>
    texto && (
      <div
        style={{
          position: 'absolute',
          fontFamily: FONTE,
          fontSize: 19,
          fontWeight: 600,
          letterSpacing: '0.16em',
          color: cor,
          whiteSpace: 'nowrap',
          ...estilo,
        }}
      >
        {texto}
      </div>
    );
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <svg width={largura} height={altura} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        {cantos.map(([x, y, dx, dy], i) => (
          <path key={i} d={`M${x} ${y + canto * dy} V${y} H${x + canto * dx}`} fill="none" stroke={linha} strokeWidth={3} />
        ))}
      </svg>
      {rotulo(esquerda, { left: 4, top: -44 }, destaque ? COR.coral : undefined)}
      {rotulo(direita, { right: 4, top: -44 })}
      {rotulo(baixoEsquerda, { left: 4, bottom: -44 })}
      {rotulo(baixoDireita, { right: 4, bottom: -44 })}
    </div>
  );
}
