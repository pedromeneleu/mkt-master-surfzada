import { useId } from 'react';

import { COR } from '../../tema';
import type { PropsVista } from './Andy';
import { BocaLado, DORSAL, Efeitos, Olho } from './partes';

/**
 * Andy nadando na horizontal, para a direita; a origem é o centro do corpo.
 *
 * O corpo é montado sobre uma espinha: `u` vai de 0 (base da cauda) a 1
 * (ponta do focinho). A espinha se curva com `corpo.cauda` (mais perto da
 * cauda, mais curva; a cabeça fica firme) e tudo acompanha a curva: contorno,
 * listras e barbatanas.
 */

type P = [number, number];

const X0 = -150;
const COMPRIMENTO = 320;

/** Meia-espessura acima e abaixo da espinha ao longo do corpo: [u, cima, baixo]. */
const PERFIL: [number, number, number][] = [
  [0, 9, 7],
  [0.1, 14, 11],
  [0.3, 34, 27],
  [0.5, 52, 40],
  [0.65, 57, 45],
  [0.8, 52, 42],
  [0.9, 40, 32],
  [0.97, 22, 17],
  [1, 4, 4],
];

function espessura(u: number): [number, number] {
  const i = Math.max(0, PERFIL.findIndex(([v]) => v >= u) - 1);
  const [u0, c0, b0] = PERFIL[i];
  const [u1, c1, b1] = PERFIL[Math.min(i + 1, PERFIL.length - 1)];
  const t = u1 === u0 ? 0 : (u - u0) / (u1 - u0);
  const s = t * t * (3 - 2 * t);
  return [c0 + (c1 - c0) * s, b0 + (b1 - b0) * s];
}

/** Deslocamento vertical da espinha em `u`; `curva` vai de -1 a 1. */
function espinha(u: number, curva: number) {
  const w = Math.max(0, (0.72 - u) / 0.72);
  return curva * 46 * w * w;
}

const xDe = (u: number) => X0 + COMPRIMENTO * u;

/** Contorno suave (Catmull-Rom) passando por todos os pontos. */
function suave(pts: P[], fechado = true) {
  const n = pts.length;
  const p = (i: number) => (fechado ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < (fechado ? n : n - 1); i++) {
    const [a, b, c, e] = [p(i - 1), p(i), p(i + 1), p(i + 2)];
    d += ` C${b[0] + (c[0] - a[0]) / 6} ${b[1] + (c[1] - a[1]) / 6} ${c[0] - (e[0] - b[0]) / 6} ${c[1] - (e[1] - b[1]) / 6} ${c[0]} ${c[1]}`;
  }
  return d + (fechado ? ' Z' : '');
}

export function Nado({ c, r }: PropsVista) {
  const id = useId();
  const curva = Math.max(-1.2, Math.min(1.2, c.cauda / 16));
  const us = Array.from({ length: 33 }, (_, i) => i / 32);
  const y = (u: number) => espinha(u, curva);
  const angulo = (u: number) => (Math.atan2(y(u + 0.01) - y(u - 0.01), COMPRIMENTO * 0.02) * 180) / Math.PI;
  const cima = (u: number): P => [xDe(u), y(u) - espessura(u)[0]];
  const baixo = (u: number): P => [xDe(u), y(u) + espessura(u)[1]];

  const corpo = suave([...us.map(cima), ...[...us].reverse().map(baixo)]);
  const usBarriga = us.filter((u) => u >= 0.12);
  const barriga = suave([...usBarriga.map((u): P => [xDe(u), y(u) + espessura(u)[1] * 0.08 + 3]), ...[...usBarriga].reverse().map(baixo)]);

  const em = (u: number, lado: 'cima' | 'baixo', recuo = 0) => {
    const [x, yy] = lado === 'cima' ? cima(u) : baixo(u);
    return `translate(${x} ${yy + (lado === 'cima' ? recuo : -recuo)}) rotate(${angulo(u)})`;
  };

  return (
    <g transform={`translate(0 ${-c.pulo}) rotate(${c.inclina}) scale(${c.estica} ${1 / Math.sqrt(c.estica)})`}>
      {/* Peitoral do lado de lá, atrás do corpo. */}
      <path d="M10 -2 C4 16 -12 36 -34 50 C-22 30 -16 12 -10 -4 Z" fill={DORSAL} transform={`${em(0.72, 'baixo', 12)} rotate(${c.nadEsq - 10})`} />
      {/* Dorsal, com o corte antigo na borda de trás. */}
      <path
        d="M28 4 C24 -24 10 -54 -20 -78 L-16 -56 L-26 -51 L-19 -43 C-24 -24 -27 -10 -32 4 Z"
        fill={DORSAL}
        transform={em(0.57, 'cima', 6)}
      />
      <clipPath id={id}>
        <path d={corpo} />
      </clipPath>
      <path d={corpo} fill={COR.pele} />
      <g clipPath={`url(#${id})`}>
        {[0.2, 0.29, 0.38, 0.47, 0.56].map((u) => {
          const h = espessura(u)[0] * 0.7;
          return (
            <path
              key={u}
              d={`M0 -4 q7 ${h / 4} 0 ${h / 2} t0 ${h / 2}`}
              transform={em(u, 'cima')}
              stroke={COR.listra}
              strokeWidth={8}
              strokeLinecap="round"
              fill="none"
            />
          );
        })}
        <path d={barriga} fill={COR.barriga} />
        {[0.71, 0.735, 0.76].map((u) => {
          const [t, b] = espessura(u);
          return <path key={u} d={`M${xDe(u)} ${-t * 0.32} q6 ${(t * 0.32 + b * 0.3) / 2} 0 ${t * 0.32 + b * 0.3}`} stroke={COR.listra} strokeWidth={3} fill="none" strokeLinecap="round" />;
        })}
      </g>
      {/* Cauda em meia-lua, com o lobo de cima maior. Chicoteia além da curva da espinha. */}
      <path
        d="M6 -7 C-12 -22 -32 -50 -50 -82 C-42 -48 -38 -26 -28 0 C-38 18 -44 34 -48 52 C-30 36 -14 20 6 7 Z"
        fill={DORSAL}
        transform={`translate(${xDe(0) + 4} ${y(0)}) rotate(${angulo(0) + c.cauda * 0.9})`}
      />
      <path d="M4 -2 C0 8 -8 16 -20 22 C-14 12 -10 4 -8 -2 Z" fill={DORSAL} transform={em(0.36, 'baixo', 3)} />
      <circle cx={153} cy={-11} r={2.6} fill={COR.listra} />
      <g transform="translate(124 -19) scale(1.3)">
        <Olho cx={0} cy={0} lado={1} r={r} achatado />
      </g>
      <BocaLado b={r.boca} dobra={[94, 19]} ponta={[160, 6]} curva={7} />
      <Efeitos efeitos={r.efeitos} olhos={[124]} yOlho={-19} dx={10} />
      {/* Peitoral do lado da câmera, varrida para trás. */}
      <path
        d="M10 -2 C2 18 -18 44 -48 62 C-32 36 -22 14 -14 -4 Z"
        fill={COR.pele}
        stroke={COR.listra}
        strokeWidth={2.5}
        strokeLinejoin="round"
        transform={`${em(0.68, 'baixo', 8)} rotate(${c.nadDir - 10})`}
      />
    </g>
  );
}
