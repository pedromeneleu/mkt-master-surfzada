import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

import type { Caixa } from '../dados/tipos';
import { COR } from '../tema';
import { useZoom } from './Tela';

/**
 * Holofote: escurece a tela em volta da `caixa` e contorna o elemento em coral.
 * Fica dentro de <Tela>, em pixels CSS da captura.
 */
export function Destaque({
  caixa,
  em,
  ate = Infinity,
  raio = 14,
  escurecer = 0.5,
  folga = 6,
}: {
  caixa: Caixa;
  em: number;
  ate?: number;
  raio?: number;
  escurecer?: number;
  folga?: number;
}) {
  const frame = useCurrentFrame();
  const z = useZoom();
  const entra = interpolate(frame, [em, em + 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const sai = Number.isFinite(ate)
    ? interpolate(frame, [ate, ate + 10], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 1;
  const o = Math.min(entra, sai);
  if (o <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: caixa.x - folga,
        top: caixa.y - folga,
        width: caixa.w + folga * 2,
        height: caixa.h + folga * 2,
        borderRadius: raio,
        boxShadow: `0 0 0 4000px rgba(10,10,10,${escurecer * o}), 0 0 0 ${3 / z}px rgba(255,122,89,${o}), 0 0 ${30 / z}px rgba(255,122,89,${0.55 * o})`,
        pointerEvents: 'none',
      }}
    />
  );
}

/** Anel coral que "pinga" sobre um ponto (pinos do mapa, elementos novos). */
export function Pulso({ x, y, em, tamanho = 44 }: { x: number; y: number; em: number; tamanho?: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const z = useZoom();
  if (frame < em) return null;
  const s = spring({ frame: frame - em, fps, config: { damping: 12, stiffness: 180 } });
  const onda = ((frame - em) % 36) / 36;
  const t = tamanho / z;
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: t * (0.6 + onda * 1.4),
          height: t * (0.6 + onda * 1.4),
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          border: `${2 / z}px solid ${COR.coral}`,
          opacity: (1 - onda) * 0.9,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: t * 0.42,
          height: t * 0.42,
          transform: `translate(-50%, -50%) scale(${s})`,
          borderRadius: '50%',
          background: COR.coral,
          boxShadow: `0 0 ${14 / z}px ${COR.coral}`,
        }}
      />
    </>
  );
}
