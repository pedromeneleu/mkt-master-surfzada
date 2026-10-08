import type { ReactNode } from 'react';

import { COR } from '../tema';

/**
 * Mapa estilizado do Atlântico (projeção equirretangular). As costas são
 * simplificadas à mão a partir de coordenadas aproximadas: servem para
 * situar, não para navegar.
 */

type LonLat = [number, number];

export interface Vista {
  /** Centro do quadro. */
  lon: number;
  lat: number;
  /** Pixels por grau. */
  escala: number;
}

export const projeta = (v: Vista, [lon, lat]: LonLat): [number, number] => [540 + (lon - v.lon) * v.escala, 960 - (lat - v.lat) * v.escala];

export const TERRAS: LonLat[][] = [
  // América do Sul (norte e nordeste)
  [
    [-80, 12], [-72, 12], [-68, 11], [-62, 10.7], [-60, 8.5], [-57, 6], [-54, 5.7], [-51.5, 4.4], [-50, 1.8], [-49, -0.3],
    [-47.5, -0.8], [-44.5, -2.5], [-41, -2.9], [-38.5, -3.7], [-37, -4.9], [-35.2, -5.5], [-34.8, -7.5], [-35.3, -9.5],
    [-37, -11.5], [-38.5, -13], [-39, -17], [-40, -20], [-41, -22], [-44, -23], [-48, -26], [-49, -29], [-53, -34],
    [-58, -38], [-80, -40],
  ],
  // América do Norte (leste)
  [
    [-100, 25], [-81, 25], [-80, 31], [-76, 35], [-74, 40], [-70, 41.5], [-70, 43], [-66, 44], [-63, 44.5], [-60, 46],
    [-64, 47], [-61, 47.5], [-59, 47.6], [-53, 46.7], [-52.7, 47.6], [-55, 51.5], [-56, 52], [-60, 55], [-62, 57],
    [-64, 60], [-65, 63], [-100, 70],
  ],
  // Groenlândia (sul)
  [[-44, 60], [-48, 61], [-50, 63], [-53, 66], [-54, 72], [-20, 72], [-22, 68], [-32, 68], [-40, 65], [-42, 62]],
  // Islândia
  [[-22, 64], [-24, 65.5], [-22, 66.4], [-14, 66.5], [-13, 65], [-18, 63.4]],
  // Europa (Península Ibérica e França)
  [
    [-9, 43], [-8.9, 40], [-9.5, 38.7], [-8.7, 37], [-6, 36.2], [-5.5, 36], [-2, 36.8], [0, 38.7], [3, 42], [3, 45],
    [-1.2, 46], [-2.2, 47.2], [-4.7, 48.4], [-1.8, 49.7], [1, 50.5], [6, 53], [30, 60], [30, 35], [3, 42],
  ],
  // Irlanda
  [[-10, 51.6], [-10, 53.5], [-8.5, 54.8], [-6, 55.2], [-6, 52]],
  // Grã-Bretanha
  [
    [-5.7, 50], [-3, 50.6], [1.5, 51], [1.7, 53], [-0.5, 54.5], [-2, 57], [-3, 58.6], [-5, 58.6], [-6, 57], [-5, 55],
    [-3, 54.8], [-3.2, 53.4], [-4.8, 52.8], [-5.3, 51.7],
  ],
  // África (oeste)
  [
    [-5.5, 36], [-6.8, 34], [-9.8, 31], [-9.6, 29.5], [-13, 27.7], [-16, 23.5], [-17, 21], [-16.5, 19], [-17.5, 14.7],
    [-16.8, 13], [-15, 11], [-13.5, 9.5], [-12.5, 7.5], [-10, 6], [-7.5, 4.4], [-4, 5.2], [0, 5.5], [2, 6.2], [9, 4],
    [10, -5], [13, -12], [30, -12], [30, 36],
  ],
];

const ILHAS: LonLat[] = [
  [-28, 38.6], [-31.2, 39.5], [-25.5, 37.8], [-27.2, 38.7], // Açores
  [-16.9, 32.7], // Madeira
  [-15.5, 28], [-13.8, 28.5], [-17.9, 28.6], // Canárias
  [-24, 16], [-23.5, 15], [-25, 17], // Cabo Verde
  [-32.4, -3.85], // Fernando de Noronha
  [-66, 18.2], [-61.5, 16], [-61, 14.5], [-61.5, 12.2], // Porto Rico e Pequenas Antilhas
];

export const FORTALEZA: LonLat = [-38.5, -3.72];

export function Mapa({ vista, children }: { vista: Vista; children?: ReactNode }) {
  const p = (c: LonLat) => projeta(vista, c);
  const caminho = (pts: LonLat[]) => pts.map((c, i) => `${i ? 'L' : 'M'}${p(c).join(' ')}`).join(' ') + ' Z';
  const meridianos = Array.from({ length: 13 }, (_, i) => -100 + i * 10);
  const paralelos = Array.from({ length: 13 }, (_, i) => -40 + i * 10);
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <radialGradient id="mar-mapa" cx="50%" cy="45%" r="75%">
          <stop offset="0" stopColor={COR.mar} />
          <stop offset="1" stopColor={COR.marFundo} />
        </radialGradient>
      </defs>
      <rect width={1080} height={1920} fill="url(#mar-mapa)" />
      <g stroke="#ffffff" strokeOpacity={0.07} strokeWidth={1.5}>
        {meridianos.map((lon) => {
          const [x] = p([lon, 0]);
          return <line key={lon} x1={x} y1={0} x2={x} y2={1920} />;
        })}
        {paralelos.map((lat) => {
          const [, y] = p([0, lat]);
          return <line key={lat} x1={0} y1={y} x2={1080} y2={y} strokeOpacity={lat === 0 ? 0.16 : 0.07} />;
        })}
      </g>
      {TERRAS.map((t, i) => (
        <path key={i} d={caminho(t)} fill="#0c2436" stroke={COR.raso} strokeOpacity={0.55} strokeWidth={2} strokeLinejoin="round" />
      ))}
      {ILHAS.map((c, i) => {
        const [x, y] = p(c);
        return <circle key={i} cx={x} cy={y} r={Math.max(2.5, vista.escala * 0.25)} fill="#0c2436" stroke={COR.raso} strokeOpacity={0.55} strokeWidth={1.5} />;
      })}
      {children}
    </svg>
  );
}
