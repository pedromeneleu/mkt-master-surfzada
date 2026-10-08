import { useId } from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';

import { Andy, EXPRESSOES, piscar, POSES, respirando } from '..';
import { transformaCorpo } from '../Andy';
import { COR } from '../../../tema';

/**
 * GIF do Andy "bad boy" (fundo transparente, em loop): braços cruzados, cara de
 * deboche, desce os óculos escuros da testa, dá uma levantada de queixo, a lente
 * brilha e ele sobe os óculos de volta para o loop fechar.
 *
 * Render: npm run gif:badboy → out/gifs/andy-bad-boy.gif
 */
export const GIF_BAD_BOY = { largura: 600, altura: 630, duracao: 72 };

const CHEGADA = Easing.bezier(0.16, 1, 0.3, 1);
const SUAVE = Easing.bezier(0.65, 0, 0.35, 1);

// Lente de um lado, centrada no olho (os olhos ficam em x = ±36, y = -212).
const LENTE = 'M-30 -17 L30 -17 Q33 -17 32 -12 L27 9 Q24 19 13 19 L-13 19 Q-24 19 -27 9 L-32 -12 Q-33 -17 -30 -17 Z';

function Oculos({ desce, brilho }: { desce: number; brilho: number }) {
  const id = useId();
  // Na testa: 46 px acima dos olhos e meio torto. No rosto: em cima dos olhos.
  const y = interpolate(desce, [0, 1], [-46, 0]);
  const giro = interpolate(desce, [0, 1], [-7, 0]);
  return (
    <g transform={`translate(0 ${y}) rotate(${giro} 0 -212)`}>
      <defs>
        <clipPath id={id}>
          <path d={LENTE} transform="translate(-36 -212)" />
          <path d={LENTE} transform="translate(36 -212)" />
        </clipPath>
      </defs>
      {/* Hastes até a lateral da cabeça. */}
      <path d="M-66 -222 L-94 -214" stroke={COR.tinta} strokeWidth={6} strokeLinecap="round" />
      <path d="M66 -222 L94 -214" stroke={COR.tinta} strokeWidth={6} strokeLinecap="round" />
      <path d="M-8 -224 Q0 -230 8 -224" stroke={COR.tinta} strokeWidth={6} fill="none" strokeLinecap="round" />
      {[-36, 36].map((x) => (
        <g key={x} transform={`translate(${x} -212)`}>
          <path d={LENTE} fill={COR.tinta} stroke={COR.tinta} strokeWidth={4} strokeLinejoin="round" />
          <path d="M-20 -9 L-8 -9" stroke="#fff" strokeOpacity={0.35} strokeWidth={4} strokeLinecap="round" />
        </g>
      ))}
      {/* O brilho que atravessa as lentes. */}
      <g clipPath={`url(#${id})`}>
        <rect x={-130 + brilho * 260} y={-260} width={16} height={100} fill="#fff" opacity={0.85} transform={`rotate(25 ${-122 + brilho * 260} -212)`} />
      </g>
    </g>
  );
}

export function GifAndyBadBoy() {
  const frame = useCurrentFrame();
  const desce =
    frame < 40
      ? interpolate(frame, [8, 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: CHEGADA })
      : interpolate(frame, [58, 70], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: SUAVE });
  // Levantada de queixo logo depois que os óculos assentam.
  const queixo = interpolate(frame, [18, 24, 32], [0, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: SUAVE });
  const brilho = interpolate(frame, [30, 42], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const base = respirando(frame, POSES.bracosCruzados, 36);
  const corpo = { ...base, cabeca: base.cabeca - queixo * 7, queixo: base.queixo - queixo * 6 };
  const rosto = piscar(frame, EXPRESSOES.deboche, 200);
  const cabeca = `translate(${corpo.vira * 22} ${corpo.queixo}) rotate(${corpo.cabeca} 0 -190)`;

  return (
    <AbsoluteFill style={{ backgroundColor: 'transparent' }}>
      <svg width={GIF_BAD_BOY.largura} height={GIF_BAD_BOY.altura} viewBox="-200 -350 400 420">
        <Andy corpo={corpo} rosto={rosto} />
        {/* Mesmo caminho de transformações da cabeça do Andy (vista de frente). */}
        <g transform={`translate(0 ${-corpo.pulo})`}>
          <g transform={transformaCorpo(corpo)}>
            <g transform={cabeca}>
              <Oculos desce={desce} brilho={brilho} />
            </g>
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  );
}
