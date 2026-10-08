import { useId } from 'react';

import { COR } from '../../tema';
import type { Boca, Efeito, Rosto } from './tipos';

/** Peças compartilhadas pelas vistas do Andy: listras, olhos, boca e efeitos. */

export const BRANCO = '#ffffff';
export const GARGANTA = '#3a1010';
export const LINGUA = '#ff8f78';
export const DORSAL = '#4d606e';

/** Listras do tubarão-tigre, desenhadas como ondinhas verticais. */
export function Listras({ xs }: { xs: [number, number, number][] }) {
  return (
    <>
      {xs.map(([x, y, h]) => (
        <path
          key={`${x}${y}`}
          d={`M${x} ${y} q7 ${h / 4} 0 ${h / 2} t0 ${h / 2}`}
          stroke={COR.listra}
          strokeWidth={8}
          strokeLinecap="round"
          fill="none"
        />
      ))}
    </>
  );
}

// ——— Rosto ————————————————————————————————————————————————————————————————

export function Olho({ cx, cy, lado, r, achatado = false }: { cx: number; cy: number; lado: -1 | 1; r: Rosto; achatado?: boolean }) {
  const id = useId();
  const [ox, oy] = r.olhar;
  const traco = { stroke: COR.tinta, strokeWidth: 5, strokeLinecap: 'round' as const, fill: 'none' };
  const sx = achatado ? 0.85 : 1;

  const arregalado = r.olho === 'arregalado';
  const rx = arregalado ? 14 : 11;
  const ry = arregalado ? 13 : 9;
  let olho: React.ReactNode;
  if (r.olho === 'feliz') {
    olho = <path d="M-9 3 Q0 -6 9 3" {...traco} />;
  } else if (r.olho === 'fechado') {
    olho = <path d="M-9 0 Q0 5 9 0" {...traco} />;
  } else {
    const [px, py] = arregalado ? [4.5 * r.pupila, 4.5 * r.pupila] : [5.5 * r.pupila, 6.5 * r.pupila];
    olho = (
      <>
        <ellipse rx={rx} ry={ry} fill={BRANCO} stroke={COR.tinta} strokeWidth={2.5} />
        <ellipse cx={ox * 4} cy={oy * 3} rx={px} ry={py} fill={COR.tinta} />
        <circle cx={ox * 4 + px * 0.35} cy={oy * 3 - py * 0.4} r={1.6} fill={BRANCO} />
      </>
    );
  }
  const aberto = r.olho === 'aberto' || arregalado;
  // A pálpebra (da cor da pele) desce do topo e inclina com a sobrancelha.
  const desce = -ry - 2 + (2 * ry + 4) * r.palpebra;
  const inclinaPalpebra = r.sobrancelha * lado * 16;
  const sobe = r.altura * 6 + (lado > 0 ? r.assimetria * 7 : -r.assimetria * 2);

  return (
    <g transform={`translate(${cx} ${cy}) scale(${sx} 1)`}>
      <clipPath id={id}>
        <ellipse rx={rx + 1.5} ry={ry + 1.5} />
      </clipPath>
      {olho}
      {aberto && r.palpebra > 0.02 && (
        <g clipPath={`url(#${id})`}>
          <g transform={`rotate(${inclinaPalpebra})`}>
            <rect x={-24} y={-ry - 24} width={48} height={desce + ry + 24} fill={COR.pele} />
            <line x1={-24} y1={desce} x2={24} y2={desce} stroke={COR.tinta} strokeWidth={4} />
          </g>
        </g>
      )}
      {/* Sobrancelha: uma crista grossa, sempre à mostra. */}
      <path
        d="M-12 2 Q-3 -3 11 0"
        transform={`translate(${lado * 1} ${-ry - 7 - sobe}) rotate(${lado * r.sobrancelha * 22}) scale(${-lado} 1)`}
        stroke={COR.tinta}
        strokeWidth={7}
        strokeLinecap="round"
        fill="none"
      />
    </g>
  );
}

type P = [number, number];
const bezier = (a: P, c: P, b: P, t: number): P => [
  (1 - t) ** 2 * a[0] + 2 * (1 - t) * t * c[0] + t ** 2 * b[0],
  (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * c[1] + t ** 2 * b[1],
];

/** Fileira de dentes ao longo de uma curva; `sentido` 1 = para baixo, -1 = para cima. */
export function Dentes({ a, c, b, sentido, n = 8, altura = 10 }: { a: P; c: P; b: P; sentido: 1 | -1; n?: number; altura?: number }) {
  const pontos: string[] = [];
  for (let i = 0; i < n; i++) {
    const [x0, y0] = bezier(a, c, b, (i + 0.08) / n);
    const [xm, ym] = bezier(a, c, b, (i + 0.5) / n);
    const [x1, y1] = bezier(a, c, b, (i + 0.92) / n);
    pontos.push(`M${x0} ${y0} L${xm} ${ym + altura * sentido} L${x1} ${y1} Z`);
  }
  return <path d={pontos.join(' ')} fill={BRANCO} stroke={COR.tinta} strokeWidth={1.5} strokeLinejoin="round" />;
}

/**
 * Boca fechada de tubarão: a faixa de dentes encaixados em zigue-zague ao
 * longo da curva da boca.
 */
export function Sorrisao({ a, c, b }: { a: P; c: P; b: P }) {
  const n = 9;
  const zig: string[] = [];
  for (let i = 0; i <= n * 2; i++) {
    const [x, y] = bezier(a, c, b, i / (n * 2));
    const borda = i === 0 || i === n * 2;
    zig.push(`${i ? 'L' : 'M'}${x} ${y + (borda ? 0 : i % 2 ? 4.5 : -4.5)}`);
  }
  const curva = (d: number) => `M${a[0]} ${a[1]} Q${c[0]} ${c[1] + d * 2} ${b[0]} ${b[1]}`;
  return (
    <g>
      <path d={`${curva(-6)} Q${c[0]} ${c[1] + 12} ${a[0]} ${a[1]} Z`} fill={BRANCO} stroke={COR.tinta} strokeWidth={3} strokeLinejoin="round" />
      <path d={zig.join(' ')} stroke={COR.tinta} strokeWidth={2} fill="none" strokeLinejoin="round" />
    </g>
  );
}

export function BocaFrente({ b, dx = 0 }: { b: Boca; dx?: number }) {
  const id = useId();
  const xC = 46 * b.largura;
  const yC = -168 - b.sorriso * 6;
  const esq: P = [-xC, yC + b.torto * 6];
  const dir: P = [xC, yC - b.torto * 6];
  const meio = -160 + b.sorriso * 8;
  const mx = b.torto * 6;
  const cai = b.abertura * 38;
  const cima: P = [mx, meio];
  const baixo: P = [mx, meio + cai * 2];
  const boca = `M${esq[0]} ${esq[1]} Q${cima[0]} ${cima[1]} ${dir[0]} ${dir[1]} Q${baixo[0]} ${baixo[1]} ${esq[0]} ${esq[1]} Z`;
  if (cai < 3) {
    return (
      <g transform={`translate(${dx} 0)`}>
        <Sorrisao a={esq} c={cima} b={dir} />
      </g>
    );
  }
  const fundo = (esq[1] + dir[1]) / 4 + (meio + cai * 2) / 2;
  return (
    <g transform={`translate(${dx} 0)`}>
      <clipPath id={id}>
        <path d={boca} />
      </clipPath>
      <path d={boca} fill={GARGANTA} />
      <g clipPath={`url(#${id})`}>
        <ellipse cx={mx / 2} cy={fundo} rx={24 * b.largura} ry={6 + cai * 0.2} fill={LINGUA} />
        <Dentes a={esq} c={cima} b={dir} sentido={1} n={9} altura={9 + cai * 0.08} />
        <Dentes a={esq} c={baixo} b={dir} sentido={-1} n={8} altura={8 + cai * 0.06} />
      </g>
      <path d={boca} fill="none" stroke={COR.tinta} strokeWidth={3.5} strokeLinejoin="round" />
    </g>
  );
}

/**
 * Boca de lado: vai do canto (`dobra`, onde a mandíbula articula) até a
 * frente (`ponta`). `curva` afunda o meio da boca, num sorriso maior.
 */
export function BocaLado({ b, dobra = [48, -184], ponta = [98, -194], curva = 0 }: { b: Boca; dobra?: P; ponta?: P; curva?: number }) {
  const id = useId();
  const ctrl: P = [(dobra[0] + ponta[0]) / 2, dobra[1] + curva + b.sorriso * 3];
  const ang = (b.abertura * 30 * Math.PI) / 180;
  const gira = ([x, y]: P): P => [
    dobra[0] + (x - dobra[0]) * Math.cos(ang) - (y - dobra[1]) * Math.sin(ang),
    dobra[1] + (x - dobra[0]) * Math.sin(ang) + (y - dobra[1]) * Math.cos(ang),
  ];
  const canto = <path d={`M${dobra[0]} ${dobra[1]} q-6 0 -10 ${-(b.sorriso + b.torto * 0.6) * 7}`} stroke={COR.tinta} strokeWidth={3} fill="none" strokeLinecap="round" />;
  if (b.abertura < 0.08) {
    return (
      <g>
        <Sorrisao a={dobra} c={ctrl} b={ponta} />
        {canto}
      </g>
    );
  }
  const [c2, p2] = [gira(ctrl), gira(ponta)];
  const boca = `M${dobra[0]} ${dobra[1]} Q${ctrl[0]} ${ctrl[1]} ${ponta[0]} ${ponta[1]} L${p2[0]} ${p2[1]} Q${c2[0]} ${c2[1]} ${dobra[0]} ${dobra[1]} Z`;
  return (
    <g>
      <clipPath id={id}>
        <path d={boca} />
      </clipPath>
      <path d={boca} fill={GARGANTA} />
      <g clipPath={`url(#${id})`}>
        <Dentes a={dobra} c={ctrl} b={ponta} sentido={1} n={6} altura={9} />
        <Dentes a={dobra} c={c2} b={p2} sentido={-1} n={5} altura={8} />
      </g>
      <path d={boca} fill="none" stroke={COR.tinta} strokeWidth={3} strokeLinejoin="round" />
      {canto}
    </g>
  );
}

// ——— Efeitos ——————————————————————————————————————————————————————————————

const GOTA = 'M0 -9 C5 -2 7 2 7 5 A7 7 0 0 1 -7 5 C-7 2 -5 -2 0 -9 Z';

export function Efeitos({ efeitos, olhos, yOlho, dx = 0 }: { efeitos: Efeito[]; olhos: number[]; yOlho: number; dx?: number }) {
  const tem = (e: Efeito) => efeitos.includes(e);
  const coral = { stroke: COR.coral, strokeWidth: 5, strokeLinecap: 'round' as const, fill: 'none' };
  // Lágrima no canto de fora do olho.
  const xLagrima = olhos[0] + Math.sign(olhos[0] || 1) * 10;
  const topo = yOlho - 40;
  return (
    <g transform={`translate(${dx} 0)`}>
      {tem('lagrima') && (
        <g transform={`translate(${xLagrima} ${yOlho + 16})`}>
          <path d={GOTA} fill={COR.agua} stroke={COR.espuma} strokeWidth={1} />
        </g>
      )}
      {tem('suor') && (
        <g transform={`translate(${olhos[olhos.length - 1] + 40} ${yOlho - 26}) scale(1.6)`}>
          <path d={GOTA} fill={COR.agua} stroke={COR.espuma} strokeWidth={1.2} />
        </g>
      )}
      {tem('raiva') && (
        <path
          d="M-11 -3 Q-3 -3 -3 -11 M3 -11 Q3 -3 11 -3 M11 3 Q3 3 3 11 M-3 11 Q-3 3 -11 3"
          transform={`translate(${olhos[olhos.length - 1] + 30} ${topo})`}
          {...coral}
        />
      )}
      {tem('ideia') &&
        [-165, -135, -45, -15].map((a) => {
          const t = (a * Math.PI) / 180;
          const cx = olhos.length > 1 ? 0 : olhos[0];
          return <line key={a} x1={cx + Math.cos(t) * 64} y1={topo + Math.sin(t) * 64} x2={cx + Math.cos(t) * 80} y2={topo + Math.sin(t) * 80} {...coral} />;
        })}
    </g>
  );
}
