import { createContext, useContext, type ReactNode } from 'react';
import { Img, interpolate, useCurrentFrame } from 'remotion';

import type { Caixa, Captura } from '../dados/tipos';
import { arquivo, SUAVE } from '../tema';

/**
 * Um movimento de câmera: a partir do frame `em`, vai até `alvo` em `dur`
 * frames. Sem `alvo`, volta para a tela inteira. `zoom` é opcional — por
 * padrão enquadra o alvo com folga.
 */
export interface Quadro {
  em: number;
  alvo?: Caixa;
  zoom?: number;
  dur?: number;
}

interface Enquadramento {
  cx: number;
  cy: number;
  z: number;
}

const CameraCtx = createContext<{ z: number; cap: Captura } | null>(null);

/** Zoom atual da câmera — para cursor e destaques manterem o tamanho na tela. */
export function useZoom(): number {
  return useContext(CameraCtx)?.z ?? 1;
}

export function useCaptura(): Captura {
  const ctx = useContext(CameraCtx);
  if (!ctx) throw new Error('useCaptura fora de <Tela>');
  return ctx.cap;
}

function enquadrar(q: Quadro, cap: Captura): Enquadramento {
  const { largura: L, altura: A } = cap;
  const alvo = q.alvo ?? { x: 0, y: 0, w: L, h: A };
  const z = Math.max(1, q.zoom ?? Math.min(L / alvo.w, A / alvo.h) * 0.82);
  const meioL = L / (2 * z);
  const meioA = A / (2 * z);
  const limitar = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
  return {
    cx: limitar(alvo.x + alvo.w / 2, meioL, L - meioL),
    cy: limitar(alvo.y + alvo.h / 2, meioA, A - meioA),
    z,
  };
}

/** Posição da câmera no frame atual, encadeando os quadros em ordem. */
export function useCamera(quadros: Quadro[], cap: Captura): Enquadramento {
  const frame = useCurrentFrame();
  const ordenados = [...quadros].sort((a, b) => a.em - b.em);
  let atual = enquadrar(ordenados[0] ?? { em: 0 }, cap);
  for (const q of ordenados.slice(1)) {
    if (frame < q.em) break;
    const p = interpolate(frame, [q.em, q.em + (q.dur ?? 24)], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: SUAVE,
    });
    const alvo = enquadrar(q, cap);
    // Zoom interpolado em escala logarítmica: a aproximação parece constante.
    atual = {
      cx: atual.cx + (alvo.cx - atual.cx) * p,
      cy: atual.cy + (alvo.cy - atual.cy) * p,
      z: Math.exp(Math.log(atual.z) + (Math.log(alvo.z) - Math.log(atual.z)) * p),
    };
  }
  return atual;
}

/**
 * Screenshot da plataforma com câmera. Os filhos são posicionados em pixels
 * CSS da captura (as mesmas coordenadas das caixas do manifesto) e seguem a
 * câmera automaticamente.
 */
export function Tela({
  cap,
  largura,
  camera = [],
  children,
}: {
  cap: Captura;
  largura: number;
  camera?: Quadro[];
  children?: ReactNode;
}) {
  const { cx, cy, z } = useCamera(camera, cap);
  const escala = largura / cap.largura;
  const altura = cap.altura * escala;
  return (
    <div style={{ width: largura, height: altura, overflow: 'hidden', position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          width: cap.largura,
          height: cap.altura,
          transformOrigin: '0 0',
          transform: `scale(${escala}) translate(${cap.largura / 2}px, ${cap.altura / 2}px) scale(${z}) translate(${-cx}px, ${-cy}px)`,
        }}
      >
        <Img src={arquivo(cap.arquivo)} style={{ width: '100%', height: '100%', display: 'block' }} />
        <CameraCtx.Provider value={{ z, cap }}>{children}</CameraCtx.Provider>
      </div>
    </div>
  );
}

/** Outra captura do mesmo tamanho por cima, em fade (ex.: antes → depois). */
export function Camada({ cap, em, dur = 8 }: { cap: Captura; em: number; dur?: number }) {
  const frame = useCurrentFrame();
  const opacidade = interpolate(frame, [em, em + dur], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  if (opacidade <= 0) return null;
  return (
    <Img
      src={arquivo(cap.arquivo)}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: opacidade }}
    />
  );
}

/**
 * Revela só um pedaço de outra captura (ex.: o campo já preenchido do
 * formulário), recortado na `caixa`. Assim o formulário "se preenche" campo a
 * campo usando só dois screenshots.
 */
export function Revelar({ cap, caixa, em, dur = 6 }: { cap: Captura; caixa: Caixa; em: number; dur?: number }) {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [em, em + dur], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  if (p <= 0) return null;
  const folga = 2;
  const { largura: L, altura: A } = cap;
  // Revela da esquerda para a direita, como texto sendo digitado.
  const direita = L - (caixa.x + caixa.w + folga) + (caixa.w + folga * 2) * (1 - p);
  return (
    <Img
      src={arquivo(cap.arquivo)}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        clipPath: `inset(${caixa.y - folga}px ${direita}px ${A - (caixa.y + caixa.h + folga)}px ${caixa.x - folga}px)`,
      }}
    />
  );
}

/** Centro de uma caixa — útil para mirar o cursor. */
export const centro = (c: Caixa, dx = 0, dy = 0) => ({ x: c.x + c.w / 2 + dx, y: c.y + c.h / 2 + dy });
