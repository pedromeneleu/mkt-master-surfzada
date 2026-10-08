import { interpolate, useCurrentFrame } from 'remotion';

import { COR, SUAVE } from '../tema';
import { Sfx } from '@compartilhado/componentes/Sfx';
import { useZoom } from './Tela';

/** Parada do cursor: começa a ir para (x, y) no frame `em` e chega em `em + dur`. */
export interface Parada {
  em: number;
  x: number;
  y: number;
  dur?: number;
  /** Clica ao chegar. */
  clique?: boolean;
}

const DUR = 18;

/**
 * Cursor desenhado (seta ou toque de dedo), com movimento suavizado e clique
 * com "respiro" + onda. Fica dentro de <Tela>, em pixels CSS da captura.
 */
export function Cursor({ paradas, tipo = 'seta', som = true }: { paradas: Parada[]; tipo?: 'seta' | 'toque'; som?: boolean }) {
  const frame = useCurrentFrame();
  const z = useZoom();
  if (!paradas.length) return null;

  let x = paradas[0].x;
  let y = paradas[0].y;
  for (const p of paradas.slice(1)) {
    if (frame < p.em) break;
    const t = interpolate(frame, [p.em, p.em + (p.dur ?? DUR)], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: SUAVE,
    });
    // Arco leve no caminho: movimento de mão, não de régua.
    const arco = Math.sin(t * Math.PI) * Math.min(40, Math.hypot(p.x - x, p.y - y) * 0.12);
    const nx = x + (p.x - x) * t;
    const ny = y + (p.y - y) * t - arco;
    x = nx;
    y = ny;
  }

  const cliques = paradas.filter((p) => p.clique).map((p) => p.em + (p.dur ?? DUR));
  const ultimo = cliques.filter((c) => frame >= c).pop();
  const desde = ultimo === undefined ? Infinity : frame - ultimo;
  const aperto = desde < 8 ? 1 - Math.sin((desde / 8) * Math.PI) * 0.18 : 1;
  const onda = desde < 18 ? desde / 18 : null;
  const opacidade = interpolate(frame, [paradas[0].em, paradas[0].em + 6], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const tam = 30 / z;

  return (
    <>
      {som && cliques.map((c) => <Sfx key={c} nome="clique" em={c} volume={0.8} />)}
      {onda !== null && (
        <div
          style={{
            position: 'absolute',
            left: x,
            top: y,
            width: (70 * onda) / z,
            height: (70 * onda) / z,
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            border: `${3 / z}px solid ${COR.coral}`,
            opacity: 1 - onda,
          }}
        />
      )}
      {tipo === 'seta' ? (
        <svg
          width={tam}
          height={tam * 1.3}
          viewBox="0 0 24 31"
          style={{
            position: 'absolute',
            left: x - tam * 0.12,
            top: y - tam * 0.08,
            transform: `scale(${aperto})`,
            transformOrigin: '12% 8%',
            opacity: opacidade,
            filter: `drop-shadow(0 ${2 / z}px ${4 / z}px rgba(0,0,0,0.35))`,
          }}
        >
          <path d="M2 2 L2 25 L8 19.5 L12.2 29 L16.4 27.2 L12.4 18 L20.5 18 Z" fill={COR.tinta} stroke="#fff" strokeWidth={2} strokeLinejoin="round" />
        </svg>
      ) : (
        <div
          style={{
            position: 'absolute',
            left: x,
            top: y,
            width: tam * 1.5,
            height: tam * 1.5,
            transform: `translate(-50%, -50%) scale(${aperto})`,
            borderRadius: '50%',
            background: 'rgba(10,10,10,0.28)',
            border: `${2.5 / z}px solid rgba(255,255,255,0.9)`,
            opacity: opacidade,
          }}
        />
      )}
    </>
  );
}
