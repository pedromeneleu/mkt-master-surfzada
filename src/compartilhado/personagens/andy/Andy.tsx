import { useId } from 'react';

import { COR } from '../../tema';
import { EXPRESSOES, ROSTO_PADRAO, type NomeExpressao } from './expressoes';
import { CORPO_PADRAO, POSES, type NomePose } from './poses';
import { Nado } from './Nado';
import { BocaFrente, BocaLado, DORSAL, Efeitos, Listras, Olho } from './partes';
import type { Corpo, Rosto, Vista } from './tipos';

/** Altura do Andy em pé no espaço do desenho, do chão ao topo da cabeça. */
export const ALTURA_ANDY = 270;


export interface PropsAndy {
  /** Posição na cena: os "pés" em pé, o centro do corpo no nado. */
  x?: number;
  y?: number;
  /** Altura em px na cena (padrão 270). */
  altura?: number;
  /** Espelha: de perfil ou nadando, passa a olhar para a esquerda. */
  virado?: boolean;
  vista?: Vista;
  /** Pose e expressão prontas; `corpo` e `rosto` ajustam por cima. */
  pose?: NomePose;
  expressao?: NomeExpressao;
  corpo?: Partial<Corpo>;
  rosto?: Partial<Rosto>;
}

/** O Andy como um `<g>`, para entrar dentro do SVG de uma cena. */
export function Andy({ x = 0, y = 0, altura = ALTURA_ANDY, virado = false, vista = 'frente', pose, expressao, corpo, rosto }: PropsAndy) {
  const c: Corpo = { ...CORPO_PADRAO, ...(pose ? POSES[pose] : {}), ...corpo };
  const r: Rosto = { ...ROSTO_PADRAO, ...(expressao ? EXPRESSOES[expressao] : {}), ...rosto };
  const e = altura / ALTURA_ANDY;
  const Desenho = { frente: Frente, perfil: Perfil, costas: Costas, nado: Nado }[vista];
  return (
    <g transform={`translate(${x} ${y}) scale(${virado ? -e : e} ${e})`}>
      <Desenho c={c} r={r} />
    </g>
  );
}

/**
 * O Andy num `<svg>` próprio, centrado, com folga para pulos e barbatanas.
 * `recorte="rosto"` enquadra só a cabeça (para ver expressões e boca de perto).
 */
export function AndySvg({ largura, recorte = 'inteiro', ...props }: PropsAndy & { largura: number; recorte?: 'inteiro' | 'rosto' }) {
  const [vb, proporcao] = recorte === 'rosto' ? ['-110 -300 220 200', 200 / 220] : ['-200 -350 400 420', 420 / 400];
  // No nado a origem é o centro do corpo; sobe para ficar no meio do quadro.
  const y = props.vista === 'nado' ? -150 : 0;
  return (
    <svg width={largura} height={largura * proporcao} viewBox={vb} style={{ overflow: recorte === 'rosto' ? 'hidden' : 'visible' }}>
      <Andy y={y} {...props} />
    </svg>
  );
}

// ——— Vistas ———————————————————————————————————————————————————————————————

export type PropsVista = { c: Corpo; r: Rosto };

/** Amassar/esticar mantendo o volume, com os pés como âncora. */
export const transformaCorpo = (c: Corpo) => `rotate(${c.inclina}) scale(${1 / Math.sqrt(c.estica)} ${c.estica})`;

const CORPO = 'M0 -268 C58 -268 98 -230 100 -178 C102 -126 86 -80 58 -50 C44 -36 22 -30 0 -30 C-22 -30 -44 -36 -58 -50 C-86 -80 -102 -126 -100 -178 C-98 -230 -58 -268 0 -268 Z';
/** Dorsal com um corte antigo na borda de trás. */
const DORSAL_FRENTE = 'M-26 -250 C-18 -290 4 -318 34 -334 L31 -306 L40 -300 L34 -290 C34 -272 36 -260 40 -246 Z';
const PEITORAL_ESQ = 'M-84 -150 Q-122 -112 -146 -58 Q-116 -74 -82 -112 Z';
const PEITORAL_DIR = 'M84 -150 Q122 -112 146 -58 Q116 -74 82 -112 Z';
const LOBO_ESQ = 'M-30 -44 Q-50 -20 -72 2 Q-36 -2 -6 -22 Z';
const LOBO_DIR = 'M30 -44 Q50 -20 72 2 Q36 -2 6 -22 Z';

function Frente({ c, r }: PropsVista) {
  const id = useId();
  const v = c.vira;
  const cabeca = `translate(${v * 22} ${c.queixo}) rotate(${c.cabeca} 0 -190)`;
  // Nadadeira erguida (acima de ~90°): sai um pouco para fora e vai para a frente do corpo;
  // atrás dele, ela sumia inteira atrás da cabeça.
  const erguida = (nad: number) => Math.min(1, Math.max(0, (nad - 90) / 60));
  const naFrente = (nad: number) => nad < 0 || nad > 90;
  const peitoral = (d: string, nad: number, lado: 1 | -1) => {
    const e = erguida(nad);
    return (
      <path
        d={d}
        fill={COR.pele}
        stroke={naFrente(nad) ? COR.listra : 'none'}
        strokeWidth={3}
        strokeLinejoin="round"
        transform={`translate(${lado * 14 * e} ${-6 * e}) rotate(${lado * -nad} ${lado * 86} -140)`}
      />
    );
  };
  const esq = peitoral(PEITORAL_ESQ, c.nadEsq, -1);
  const dir = peitoral(PEITORAL_DIR, c.nadDir, 1);
  return (
    <g transform={`translate(0 ${-c.pulo})`}>
      <path d={LOBO_ESQ} fill={COR.pele} transform={`translate(${c.peEsq[0]} ${-c.peEsq[1]})`} />
      <path d={LOBO_DIR} fill={COR.pele} transform={`translate(${c.peDir[0]} ${-c.peDir[1]})`} />
      <g transform={transformaCorpo(c)}>
        <path d={DORSAL_FRENTE} fill={DORSAL} transform={`translate(${-v * 10} 0)`} />
        {!naFrente(c.nadEsq) && esq}
        {!naFrente(c.nadDir) && dir}
        <clipPath id={id}>
          <path d={CORPO} />
        </clipPath>
        <path d={CORPO} fill={COR.pele} />
        <g clipPath={`url(#${id})`}>
          <Listras xs={[[-96, -176, 40], [-90, -120, 44], [-72, -72, 34], [96, -176, 40], [90, -120, 44], [72, -72, 34]]} />
          <ellipse cx={v * 14} cy={-112} rx={62} ry={84} fill={COR.barriga} />
          {/* Guelras. */}
          {[-86, -78, -70, 70, 78, 86].map((x) => (
            <path key={x} d={`M${x} -160 q${x < 0 ? -5 : 5} 16 0 32`} stroke={COR.listra} strokeWidth={3} fill="none" strokeLinecap="round" />
          ))}
        </g>
        <g transform={cabeca}>
          <circle cx={-12} cy={-240} r={2.6} fill={COR.listra} />
          <circle cx={12} cy={-240} r={2.6} fill={COR.listra} />
          <Olho cx={-36} cy={-212} lado={-1} r={r} />
          <Olho cx={36} cy={-212} lado={1} r={r} />
          {/* Cicatriz atravessando o olho esquerdo. */}
          <path d="M-55 -240 L-49 -231 L-45 -222" stroke={COR.cicatriz} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M-30 -201 L-26 -194" stroke={COR.cicatriz} strokeWidth={3.5} strokeLinecap="round" fill="none" />
          <BocaFrente b={r.boca} dx={v * 4} />
          <Efeitos efeitos={r.efeitos} olhos={[-36, 36]} yOlho={-212} />
        </g>
        {naFrente(c.nadEsq) && esq}
        {naFrente(c.nadDir) && dir}
      </g>
    </g>
  );
}

const CORPO_PERFIL =
  'M-6 -268 C40 -272 84 -254 106 -222 C114 -210 108 -198 92 -194 C88 -150 78 -94 52 -54 C40 -36 20 -30 0 -30 C-24 -30 -46 -40 -58 -60 C-80 -100 -84 -176 -72 -220 C-62 -250 -40 -266 -6 -268 Z';
const DORSAL_PERFIL = 'M-64 -196 C-96 -206 -120 -226 -136 -252 L-112 -250 L-110 -242 L-100 -248 C-86 -242 -72 -234 -58 -222 Z';

function Perfil({ c, r }: PropsVista) {
  const id = useId();
  const cabeca = `translate(0 ${c.queixo}) rotate(${c.cabeca} 20 -190)`;
  return (
    <g transform={`translate(0 ${-c.pulo})`}>
      <path d="M-26 -46 Q-60 -26 -88 -2 Q-46 -6 -8 -30 Z" fill={DORSAL} transform={`translate(${c.peEsq[0]} ${-c.peEsq[1]})`} />
      <path d="M16 -42 Q36 -22 56 -2 Q26 -6 4 -28 Z" fill={COR.pele} transform={`translate(${c.peDir[0]} ${-c.peDir[1]})`} />
      <g transform={transformaCorpo(c)}>
        <path d={DORSAL_PERFIL} fill={DORSAL} />
        <path d="M56 -144 Q34 -104 14 -66 Q46 -84 68 -120 Z" fill={DORSAL} transform={`rotate(${c.nadEsq} 56 -136)`} />
        <clipPath id={id}>
          <path d={CORPO_PERFIL} />
        </clipPath>
        <path d={CORPO_PERFIL} fill={COR.pele} />
        <g clipPath={`url(#${id})`}>
          <Listras xs={[[-78, -200, 44], [-80, -140, 48], [-64, -86, 38], [-40, -230, 30]]} />
          <ellipse cx={50} cy={-110} rx={46} ry={86} fill={COR.barriga} />
          {[-6, 2, 10].map((x) => (
            <path key={x} d={`M${x} -172 q5 16 0 32`} stroke={COR.listra} strokeWidth={3} fill="none" strokeLinecap="round" />
          ))}
        </g>
        <g transform={cabeca}>
          <circle cx={98} cy={-212} r={2.6} fill={COR.listra} />
          <Olho cx={60} cy={-222} lado={1} r={r} achatado />
          <BocaLado b={r.boca} />
          <Efeitos efeitos={r.efeitos} olhos={[60]} yOlho={-222} dx={20} />
        </g>
        <path d="M40 -144 Q18 -104 -2 -66 Q30 -84 52 -120 Z" fill={COR.pele} stroke={COR.listra} strokeWidth={2.5} strokeLinejoin="round" transform={`rotate(${c.nadDir} 38 -136)`} />
      </g>
    </g>
  );
}

function Costas({ c }: PropsVista) {
  const id = useId();
  return (
    <g transform={`translate(0 ${-c.pulo})`}>
      <path d={LOBO_ESQ} fill={COR.pele} transform={`translate(${c.peEsq[0]} ${-c.peEsq[1]})`} />
      <path d={LOBO_DIR} fill={COR.pele} transform={`translate(${c.peDir[0]} ${-c.peDir[1]})`} />
      <g transform={transformaCorpo(c)}>
        {/* Nas costas o lado da câmera se inverte. */}
        <path d={PEITORAL_ESQ} fill={COR.pele} transform={`rotate(${c.nadDir} -86 -140)`} />
        <path d={PEITORAL_DIR} fill={COR.pele} transform={`rotate(${-c.nadEsq} 86 -140)`} />
        <clipPath id={id}>
          <path d={CORPO} />
        </clipPath>
        <path d={CORPO} fill={COR.pele} />
        <g clipPath={`url(#${id})`}>
          <Listras xs={[[-70, -210, 50], [-38, -150, 56], [0, -214, 44], [38, -150, 56], [70, -210, 50], [-60, -100, 40], [60, -100, 40], [0, -110, 44]]} />
        </g>
        <path d="M-12 -150 C-10 -220 -6 -270 4 -310 C10 -270 12 -220 12 -150 Z" fill={DORSAL} />
      </g>
    </g>
  );
}
