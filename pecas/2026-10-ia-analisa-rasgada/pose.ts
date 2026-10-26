import POSE from './pose.json';

/**
 * Esqueleto de verdade dos clipes: 17 pontos COCO por quadro, extraídos por
 * scripts/extrair_pose.py (YOLO11-pose) e gravados em pose.json, em coordenadas
 * 0–1 do clipe convertido (1920×1080).
 */
export type IdClipe = keyof typeof POSE;
export type Ponto = [number, number, number];
type Quadro = { f: number; caixa: number[]; p: number[][] };

export const LARGURA_CLIPE = 1920;
export const ALTURA_CLIPE = 1080;

/** Índices COCO usados nas contas. */
export const P = {
  nariz: 0,
  orelhaE: 3,
  orelhaD: 4,
  ombroE: 5,
  ombroD: 6,
  cotoveloE: 7,
  cotoveloD: 8,
  punhoE: 9,
  punhoD: 10,
  quadrilE: 11,
  quadrilD: 12,
  joelhoE: 13,
  joelhoD: 14,
  tornozeloE: 15,
  tornozeloD: 16,
} as const;

export const OSSOS: [number, number][] = [
  [5, 6],
  [5, 7],
  [7, 9],
  [6, 8],
  [8, 10],
  [5, 11],
  [6, 12],
  [11, 12],
  [11, 13],
  [13, 15],
  [12, 14],
  [14, 16],
];

/** Abaixo disso o ponto não é desenhado. */
export const CONF_MINIMA = 0.3;

export function fpsClipe(clipe: IdClipe): number {
  return POSE[clipe].fps;
}

export function totalQuadros(clipe: IdClipe): number {
  return POSE[clipe].quadros.length;
}

/**
 * Quadro do clipe no segundo `t`. O vídeo é sempre pedido exatamente nesse quadro
 * (ver `tempoDoQuadro`), para o esqueleto não escorregar da pessoa.
 */
export function quadroNoTempo(clipe: IdClipe, t: number): number {
  return Math.max(0, Math.min(totalQuadros(clipe) - 1, Math.round(t * fpsClipe(clipe))));
}

/** Segundo em que o quadro `q` começa, mais uma folga de 2 ms para não cair no anterior. */
export function tempoDoQuadro(clipe: IdClipe, q: number): number {
  return q / fpsClipe(clipe) + 0.002;
}

export function pose(clipe: IdClipe, q: number): Ponto[] {
  const quadro = POSE[clipe].quadros[q] as Quadro;
  return quadro.p as Ponto[];
}

/** Centro do corpo (quadris; ombros se os quadris não vieram). */
function centroCorpo(pts: Ponto[]): [number, number] {
  const usa = [P.quadrilE, P.quadrilD, P.ombroE, P.ombroD].map((i) => pts[i]).filter((p) => p[2] >= CONF_MINIMA);
  if (usa.length === 0) return [pts[0][0], pts[0][1]];
  return [usa.reduce((s, p) => s + p[0], 0) / usa.length, usa.reduce((s, p) => s + p[1], 0) / usa.length];
}

const cacheCamera = new Map<IdClipe, [number, number][]>();

/**
 * Trilha da câmera virtual: o centro do corpo suavizado (média de ±8 quadros), para
 * o enquadramento seguir o surfista sem tremer com o ruído da pose.
 */
export function centroCamera(clipe: IdClipe, q: number): [number, number] {
  let trilha = cacheCamera.get(clipe);
  if (!trilha) {
    const bruto = POSE[clipe].quadros.map((x) => centroCorpo((x as Quadro).p as Ponto[]));
    trilha = bruto.map((_, i) => {
      let sx = 0;
      let sy = 0;
      let n = 0;
      for (let j = Math.max(0, i - 8); j <= Math.min(bruto.length - 1, i + 8); j++) {
        const peso = 9 - Math.abs(i - j);
        sx += bruto[j][0] * peso;
        sy += bruto[j][1] * peso;
        n += peso;
      }
      return [sx / n, sy / n] as [number, number];
    });
    cacheCamera.set(clipe, trilha);
  }
  return trilha[q];
}

/** Altura do corpo no quadro (0–1 da altura do clipe), para medir zoom. */
export function alturaCorpo(clipe: IdClipe, q: number): number {
  const c = (POSE[clipe].quadros[q] as Quadro).caixa;
  return c[3] - c[1];
}

/** Ângulo (graus) no vértice `b` entre os segmentos b→a e b→c, em pixels do clipe. */
export function angulo(a: Ponto, b: Ponto, c: Ponto): number {
  const ax = (a[0] - b[0]) * LARGURA_CLIPE;
  const ay = (a[1] - b[1]) * ALTURA_CLIPE;
  const cx = (c[0] - b[0]) * LARGURA_CLIPE;
  const cy = (c[1] - b[1]) * ALTURA_CLIPE;
  const cos = (ax * cx + ay * cy) / (Math.hypot(ax, ay) * Math.hypot(cx, cy) || 1);
  return (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI;
}

/** Joelho mais esticado do quadro (o que a nota 01 aponta). */
export function joelhoMaisReto(pts: Ponto[]): { indice: number; graus: number } {
  const e = angulo(pts[P.quadrilE], pts[P.joelhoE], pts[P.tornozeloE]);
  const d = angulo(pts[P.quadrilD], pts[P.joelhoD], pts[P.tornozeloD]);
  const confE = Math.min(pts[P.quadrilE][2], pts[P.joelhoE][2], pts[P.tornozeloE][2]);
  const confD = Math.min(pts[P.quadrilD][2], pts[P.joelhoD][2], pts[P.tornozeloD][2]);
  if (confE < CONF_MINIMA) return { indice: P.joelhoD, graus: d };
  if (confD < CONF_MINIMA) return { indice: P.joelhoE, graus: e };
  return e >= d ? { indice: P.joelhoE, graus: e } : { indice: P.joelhoD, graus: d };
}

/** Punho mais longe do centro do corpo (o braço "de avião" da nota 02). */
export function punhoMaisAberto(pts: Ponto[]): number {
  const [cx, cy] = centroCorpo(pts);
  const longe = (i: number) => (pts[i][2] < CONF_MINIMA ? -1 : Math.hypot((pts[i][0] - cx) * LARGURA_CLIPE, (pts[i][1] - cy) * ALTURA_CLIPE));
  return longe(P.punhoE) >= longe(P.punhoD) ? P.punhoE : P.punhoD;
}

/**
 * Ângulo do joelho mais esticado, como mediana de ±4 quadros: no meio da água a pose
 * erra um quadro ou outro (24°, 32°) e o número na tela não pode pular.
 */
export function joelhoEstavel(clipe: IdClipe, q: number): number {
  const valores: number[] = [];
  for (let i = Math.max(0, q - 4); i <= Math.min(totalQuadros(clipe) - 1, q + 4); i++) {
    valores.push(joelhoMaisReto(pose(clipe, i)).graus);
  }
  valores.sort((a, b) => a - b);
  return valores[Math.floor(valores.length / 2)];
}

// ---------------------------------------------------------------------------
//  Linha ideal: a mesma pose com a base mais baixa e o tronco à frente
// ---------------------------------------------------------------------------

type V = [number, number];
const px = (p: Ponto): V => [p[0] * LARGURA_CLIPE, p[1] * ALTURA_CLIPE];
const volta = (v: V, c: number): Ponto => [v[0] / LARGURA_CLIPE, v[1] / ALTURA_CLIPE, c];
const dist = (a: V, b: V) => Math.hypot(a[0] - b[0], a[1] - b[1]);

/** Joelho por cinemática inversa: mantém coxa e canela do tamanho medido e dobra para o lado `lado`. */
function joelhoIK(quadril: V, tornozelo: V, coxa: number, canela: number, lado: number): V {
  const d = Math.min(dist(quadril, tornozelo), coxa + canela - 1e-3);
  const a = (coxa * coxa - canela * canela + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, coxa * coxa - a * a));
  const ux = (tornozelo[0] - quadril[0]) / d;
  const uy = (tornozelo[1] - quadril[1]) / d;
  return [quadril[0] + ux * a - uy * h * lado, quadril[1] + uy * a + ux * h * lado];
}

/**
 * A correção que o vídeo mostra (cena "linha ideal"): quadril desce `baixa` da
 * distância até os pés (joelhos dobram, com coxa e canela do mesmo tamanho) e o
 * tronco inclina `inclina` graus para o lado da frente. É ilustração do conselho,
 * não uma simulação; o post diz que a ferramenta está em desenvolvimento.
 */
export function poseIdeal(pts: Ponto[], baixa = 0.28, inclina = 18): Ponto[] {
  const novo = pts.map((p) => [...p] as Ponto);
  const qE = px(pts[P.quadrilE]);
  const qD = px(pts[P.quadrilD]);
  const tE = px(pts[P.tornozeloE]);
  const tD = px(pts[P.tornozeloD]);
  const quadril: V = [(qE[0] + qD[0]) / 2, (qE[1] + qD[1]) / 2];
  const pes: V = [(tE[0] + tD[0]) / 2, (tE[1] + tD[1]) / 2];
  const desce: V = [(pes[0] - quadril[0]) * baixa, (pes[1] - quadril[1]) * baixa];
  // Frente = para onde o nariz aponta em relação ao tronco.
  const nariz = px(pts[P.nariz]);
  const frente = Math.sign(nariz[0] - quadril[0]) || 1;

  const pernas: [number, number, number][] = [
    [P.quadrilE, P.joelhoE, P.tornozeloE],
    [P.quadrilD, P.joelhoD, P.tornozeloD],
  ];
  for (const [iq, ij, it] of pernas) {
    const q = px(pts[iq]);
    const j = px(pts[ij]);
    const t = px(pts[it]);
    const q2: V = [q[0] + desce[0], q[1] + desce[1]];
    // Dobra para a frente (joelho à frente da linha quadril–tornozelo).
    const lado = frente * Math.sign(t[1] - q2[1] || 1);
    const j2 = joelhoIK(q2, t, dist(q, j), dist(j, t), lado);
    novo[iq] = volta(q2, pts[iq][2]);
    novo[ij] = volta(j2, pts[ij][2]);
  }

  // Tronco, braços e cabeça: descem com o quadril e giram em torno dele para a frente.
  const centro: V = [quadril[0] + desce[0], quadril[1] + desce[1]];
  const ang = ((inclina * Math.PI) / 180) * frente;
  const cos = Math.cos(ang);
  const sin = Math.sin(ang);
  for (let i = 0; i <= P.punhoD; i++) {
    const p = px(pts[i]);
    const x = p[0] + desce[0] - centro[0];
    const y = p[1] + desce[1] - centro[1];
    novo[i] = volta([centro[0] + x * cos - y * sin, centro[1] + x * sin + y * cos], pts[i][2]);
  }
  return novo;
}
