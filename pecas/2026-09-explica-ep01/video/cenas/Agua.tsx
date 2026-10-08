import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

import { Andy, EXPRESSOES, misturaRosto, nado, piscar } from '@compartilhado/personagens/andy';
import { COR, FPS, SUAVE } from '../../tema';
import { Ambiente, bocaDoAndy, Chip, Sfx, Titulo, useSegundos } from '../comum';
import { duracaoCena, f } from '../tempos';

/**
 * Onda em águas profundas, fora de escala mas com a física certa: a
 * superfície é η = A·cos(kx − ωt) e cada partícula gira num círculo de raio
 * A·e^(−kz). A boia é uma partícula da superfície: sobe, desce, vai e volta,
 * mas não sai do lugar.
 */
export const ONDA = { L: 640, A: 46, T: 3.2, y0: 760 };
const k = (2 * Math.PI) / ONDA.L;
const w = (2 * Math.PI) / ONDA.T;

/** Altura da superfície (px de tela) em x, no tempo t (s). */
export const superficie = (x: number, t: number) => ONDA.y0 - ONDA.A * Math.cos(k * x - w * t);

/** Posição de uma partícula que em repouso estaria em (x0, y0 + z). */
export function particula(x0: number, z: number, t: number): [number, number] {
  const th = k * x0 - w * t;
  const r = ONDA.A * Math.exp(-k * z);
  return [x0 - r * Math.sin(th), ONDA.y0 + z - r * Math.cos(th)];
}

const X_BOIA = 640;
const SOLTA = 2.2; // o Andy solta a boia
const BOIA_CHEGA = 3.0;
const ORBITAS = 3.5;
const ENERGIA = 6.9;
const SACOU = 8.75;

/** A boia do Andy: bola coral com faixa preta e antena com o anel do logo. */
export function Boia({ x, y, giro = 0, escala = 1 }: { x: number; y: number; giro?: number; escala?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${giro}) scale(${escala})`}>
      <line x1={0} y1={-36} x2={0} y2={-78} stroke={COR.tinta} strokeWidth={6} strokeLinecap="round" />
      <circle cx={0} cy={-86} r={11} fill="none" stroke={COR.coral} strokeWidth={5} />
      <circle cx={0} cy={-86} r={4.5} fill={COR.coral} />
      <circle r={40} fill={COR.coral} />
      <path d="M-36 -14 a38 38 0 0 1 26 -22" stroke="#fff" strokeOpacity={0.4} strokeWidth={7} strokeLinecap="round" fill="none" />
      <path d="M-39 6 q39 14 78 0" stroke={COR.tinta} strokeWidth={7} fill="none" />
    </g>
  );
}

export function Agua() {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const s = useSegundos('agua');

  const pontos = Array.from({ length: 55 }, (_, i) => i * 20);
  const sup = pontos.map((x) => `${x ? 'L' : 'M'}${x} ${superficie(x, t)}`).join(' ');
  const agua = `${sup} L1080 1920 L0 1920 Z`;

  // Andy entra nadando, solta a boia e fica por ali.
  const xAndy = interpolate(t, [0, SOLTA], [-300, 330], { extrapolateRight: 'clamp', easing: SUAVE }) + Math.sin(t * 0.8) * 10;
  const yAndy = 1060 + Math.sin(t * 1.3) * 8;
  const rostoBase = t < SACOU - 0.25 ? EXPRESSOES.determinado : misturaRosto(EXPRESSOES.determinado, EXPRESSOES.ideia, Math.min(1, (t - SACOU + 0.25) / 0.25));
  const rosto = { ...piscar(frame, rostoBase), boca: bocaDoAndy(s) ?? rostoBase.boca };

  // Boia: sobe da boca do Andy até a superfície e daí segue a órbita.
  const [bxOrb, byOrb] = particula(X_BOIA, 0, t);
  const subida = interpolate(t, [SOLTA, BOIA_CHEGA], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: SUAVE });
  const bx = interpolate(subida, [0, 1], [xAndy + 190, bxOrb]);
  const by = interpolate(subida, [0, 1], [yAndy - 10, byOrb]);
  const inclinacao = (Math.atan(ONDA.A * k * Math.sin(k * bx - w * t)) * 180) / Math.PI;

  const orbitas = interpolate(t, [ORBITAS, ORBITAS + 0.6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const energia = interpolate(t, [ENERGIA, ENERGIA + 1.6], [-0.2, 1.1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const rastro = Array.from({ length: 14 }, (_, i) => particula(X_BOIA, 0, t - i * 0.12));

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <svg width={1080} height={1920}>
        <defs>
          <linearGradient id="ceu" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#dff3fb" />
            <stop offset="1" stopColor="#a9dcef" />
          </linearGradient>
          <linearGradient id="fundo-agua" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={COR.raso} />
            <stop offset="0.45" stopColor={COR.mar} />
            <stop offset="1" stopColor={COR.marFundo} />
          </linearGradient>
        </defs>
        <rect width={1080} height={1920} fill="url(#ceu)" />
        <path d={agua} fill="url(#fundo-agua)" />
        <path d={sup} stroke={COR.espuma} strokeWidth={6} fill="none" />

        {/* Órbitas das partículas: menores quanto mais fundo. */}
        <g opacity={orbitas}>
          {[X_BOIA, X_BOIA + 280].map((x0) =>
            [0, 70, 160, 270].map((z) => {
              const r = ONDA.A * Math.exp(-k * z);
              const [px, py] = particula(x0, z, t);
              return (
                <g key={`${x0}-${z}`}>
                  <circle cx={x0} cy={ONDA.y0 + z} r={r} stroke="#fff" strokeOpacity={z ? 0.55 : 0.9} strokeWidth={z ? 3 : 4} strokeDasharray="6 8" fill="none" />
                  {z > 0 && <circle cx={px} cy={py} r={8} fill="#fff" />}
                </g>
              );
            }),
          )}
        </g>

        <Andy x={xAndy} y={yAndy} altura={380} vista="nado" corpo={nado(frame, 30)} rosto={rosto} />
        {t < SOLTA + 0.8 &&
          [0, 1, 2].map((i) => {
            const u = ((t * 0.9 + i / 3) % 1 + 1) % 1;
            return <circle key={i} cx={xAndy + 150 + i * 14} cy={yAndy - 40 - u * 160} r={5 + i * 2} fill="#fff" opacity={(1 - u) * 0.6} />;
          })}

        {/* Rastro da boia desenhando o círculo. */}
        {subida >= 1 &&
          rastro.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={7 - i * 0.4} fill={COR.coral} opacity={(1 - i / rastro.length) * 0.5 * orbitas} />)}
        <Boia x={bx} y={by} giro={subida >= 1 ? inclinacao : 0} escala={0.9} />

        {/* A energia atravessa a tela; a água fica. */}
        {energia > -0.2 && energia < 1.1 && (
          <g transform={`translate(${energia * 1300 - 150} 600)`}>
            <path d="M-260 0 L0 0" stroke={COR.coral} strokeWidth={16} strokeLinecap="round" />
            <path d="M24 0 L-24 -30 L-24 30 Z" fill={COR.coral} />
          </g>
        )}
      </svg>

      <Titulo em={ORBITAS} ate={ENERGIA - 0.1} y={300} tamanho={70} claro>
        {'A boia *só gira*'}
      </Titulo>
      <Titulo em={ENERGIA} y={300} tamanho={70} claro>
        {'Quem viaja: a *energia*'}
      </Titulo>
      <Chip x={X_BOIA} y={500} em={ORBITAS + 0.4}>
        a água fica
      </Chip>

      <Ambiente som="mar-aberto" cena="agua" volume={0.5} duracao={duracaoCena('agua')} />
      <Ambiente som="submerso" cena="agua" volume={0.25} duracao={duracaoCena('agua')} />
      <Sfx som="bolhas" em={0} volume={0.8} />
      <Sfx som="cauda" em={0.4} volume={0.7} />
      <Sfx som="cauda" em={1.3} volume={0.6} />
      <Sfx som="bolhas" em={SOLTA} volume={0.6} />
      <Sfx som="plop" em={BOIA_CHEGA - 0.05} />
      <Sfx som="traco" em={ORBITAS} volume={0.8} />
      <Sfx som="pop" em={ORBITAS + 0.4} volume={0.6} />
      <Sfx som="whoosh" em={ENERGIA} volume={0.8} />
      <Sfx som="clack" em={SACOU} />
      <Sfx som="brilho-sacou" em={SACOU + 0.08} volume={0.7} />
    </AbsoluteFill>
  );
}
