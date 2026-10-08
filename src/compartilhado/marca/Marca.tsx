import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

import { CHEGADA, COR, FONTE } from '../tema';

/** Fundo claro do site (#f5f5f5) com um brilho coral bem discreto que respira. */
export function FundoClaro() {
  const frame = useCurrentFrame();
  const deriva = Math.sin(frame / 90) * 4;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(60% 55% at ${78 + deriva}% ${12 - deriva}%, rgba(255,122,89,0.13), transparent 70%),
          radial-gradient(50% 50% at ${12 - deriva}% 95%, rgba(10,10,10,0.05), transparent 70%), ${COR.fundo}`,
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage: 'radial-gradient(rgba(10,10,10,0.07) 1.2px, transparent 1.2px)',
          backgroundSize: '34px 34px',
          maskImage: 'radial-gradient(70% 70% at 50% 50%, black, transparent)',
        }}
      />
    </AbsoluteFill>
  );
}

/** Fundo escuro (tinta) com o brilho coral — gancho, dor e prova. */
export function FundoEscuro() {
  const frame = useCurrentFrame();
  const deriva = Math.sin(frame / 80) * 5;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(55% 60% at ${50 + deriva}% 110%, rgba(255,122,89,0.22), transparent 70%), ${COR.tinta}`,
      }}
    />
  );
}

// Geometria do logo v2 (design/logo_sem_texto_v2.png, 1818×1003), redesenhada em vetor.
const ANEL = 'M561.3 529.4 A390 390 0 1 1 1238.1 698.8';
const ONDA =
  'M0 800 C150 600 330 510 500 518 C700 528 850 700 1050 770 C1250 840 1500 800 1810 658 C1650 900 1400 1000 1150 990 C900 980 650 800 450 730 C300 690 150 720 0 800 Z';
const RECORTE_SOL = 'M600 0 H1300 V625 L1045 625 Q900 478 735 478 L600 478 Z';

/**
 * Símbolo da surfzada (sol + onda) com animação de desenho: o anel se traça,
 * o sol nasce e a onda passa da esquerda para a direita. `em` = início.
 * `corSol` só muda na versão monocromática (sol e anel na mesma cor da onda).
 */
export function Simbolo({ largura, em = 0, cor = COR.tinta, corSol = COR.coral }: { largura: number; em?: number; cor?: string; corSol?: string }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const anel = interpolate(frame, [em, em + 22], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: CHEGADA });
  const sol = spring({ frame: frame - em - 8, fps, config: { damping: 11, stiffness: 160 } });
  const onda = interpolate(frame, [em + 4, em + 24], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: CHEGADA });
  const id = `sol-${em}`;
  return (
    <svg width={largura} height={largura * (1003 / 1818)} viewBox="0 0 1818 1003" style={{ overflow: 'visible' }}>
      <defs>
        <clipPath id={id}>
          <path d={RECORTE_SOL} />
        </clipPath>
        <clipPath id={`${id}-onda`}>
          <rect x={-20} y={0} width={1860 * onda} height={1003} />
        </clipPath>
      </defs>
      <path d={ANEL} fill="none" stroke={corSol} strokeWidth={105} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - anel} />
      <g clipPath={`url(#${id})`}>
        <circle cx={942} cy={445} r={205 * sol} fill={corSol} />
      </g>
      <path d={ONDA} fill={cor} clipPath={`url(#${id}-onda)`} />
    </svg>
  );
}

/** "surfzada" como no topo do site: "surf" forte, "zada" leve. */
export function Wordmark({ tamanho, cor = COR.tinta }: { tamanho: number; cor?: string }) {
  return (
    <span style={{ fontFamily: FONTE, fontSize: tamanho, color: cor, letterSpacing: '-0.02em', lineHeight: 1 }}>
      <span style={{ fontWeight: 600 }}>surf</span>
      <span style={{ fontWeight: 300 }}>zada</span>
    </span>
  );
}

/** Símbolo + wordmark lado a lado, entrando juntos. */
export function Logo({ tamanho, em = 0, cor = COR.tinta, corSol }: { tamanho: number; em?: number; cor?: string; corSol?: string }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const texto = spring({ frame: frame - em - 10, fps, config: { damping: 200 } });
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: tamanho * 0.28 }}>
      <Simbolo largura={tamanho * 1.9} em={em} cor={cor} corSol={corSol} />
      <div style={{ opacity: texto, transform: `translateX(${(1 - texto) * -24}px)`, clipPath: `inset(0 ${(1 - texto) * 100}% 0 0)` }}>
        <Wordmark tamanho={tamanho} cor={cor} />
      </div>
    </div>
  );
}
