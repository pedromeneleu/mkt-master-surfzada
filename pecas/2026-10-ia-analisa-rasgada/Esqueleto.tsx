import { COR } from '@compartilhado/tema';

import type { Projetar } from './Janela';
import { CONF_MINIMA, OSSOS, P, type Ponto } from './pose';

/**
 * O esqueleto da IA (linhas em coral, juntas brancas). `progresso` traça os ossos
 * do tronco para as pontas, como se a IA estivesse "achando" o corpo.
 */
export function Esqueleto({
  pts,
  projetar,
  progresso = 1,
  cor = COR.coral,
  opacidade = 1,
  espessura = 6,
  tracejado = false,
}: {
  pts: Ponto[];
  projetar: Projetar;
  progresso?: number;
  cor?: string;
  opacidade?: number;
  espessura?: number;
  tracejado?: boolean;
}) {
  const ok = (i: number) => pts[i][2] >= CONF_MINIMA;
  const xy = (i: number) => projetar(pts[i]);

  // Cabeça: círculo no meio dos pontos do rosto que vieram, com raio pela largura dos ombros.
  const rosto = [P.nariz, 1, 2, P.orelhaE, P.orelhaD].filter(ok).map(xy);
  const [oe, od] = [xy(P.ombroE), xy(P.ombroD)];
  const ombros = Math.hypot(oe[0] - od[0], oe[1] - od[1]);
  const cabeca =
    rosto.length > 0
      ? {
          x: rosto.reduce((s, p) => s + p[0], 0) / rosto.length,
          y: rosto.reduce((s, p) => s + p[1], 0) / rosto.length,
          r: Math.max(10, ombros * 0.38),
        }
      : null;
  const pescoco: [number, number] = [(oe[0] + od[0]) / 2, (oe[1] + od[1]) / 2];

  // Ordem de traçado: tronco primeiro, depois braços e pernas.
  const ordem = [0, 5, 6, 7, 1, 3, 8, 10, 2, 4, 9, 11];
  const traco = (k: number) => Math.max(0, Math.min(1, progresso * OSSOS.length - ordem.indexOf(k)));

  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', opacity: opacidade }}>
      {OSSOS.map(([a, b], k) => {
        if (!ok(a) || !ok(b)) return null;
        const t = traco(k);
        if (t <= 0) return null;
        const [x1, y1] = xy(a);
        const [x2, y2] = xy(b);
        return (
          <line
            key={k}
            x1={x1}
            y1={y1}
            x2={x1 + (x2 - x1) * t}
            y2={y1 + (y2 - y1) * t}
            stroke={cor}
            strokeWidth={espessura}
            strokeLinecap="round"
            strokeDasharray={tracejado ? '2 10' : undefined}
          />
        );
      })}
      {cabeca && progresso > 0.25 && ok(P.ombroE) && ok(P.ombroD) && (
        <>
          <line x1={pescoco[0]} y1={pescoco[1]} x2={cabeca.x} y2={cabeca.y + cabeca.r} stroke={cor} strokeWidth={espessura} strokeLinecap="round" strokeDasharray={tracejado ? '2 10' : undefined} />
          <circle cx={cabeca.x} cy={cabeca.y} r={cabeca.r} fill="none" stroke={cor} strokeWidth={espessura * 0.8} strokeDasharray={tracejado ? '2 10' : undefined} />
        </>
      )}
      {!tracejado &&
        [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map((i) =>
          ok(i) && progresso * 12 > [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].indexOf(i) ? (
            <circle key={i} cx={xy(i)[0]} cy={xy(i)[1]} r={espessura * 0.95} fill="#ffffff" stroke={cor} strokeWidth={espessura * 0.5} />
          ) : null,
        )}
    </svg>
  );
}
