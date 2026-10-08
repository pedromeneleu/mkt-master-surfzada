import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

import { Andy, EXPRESSOES, piscar, respirando, POSES } from '@compartilhado/personagens/andy';
import { COR, FONTE, FPS } from '../../tema';
import { Ambiente, bocaDoAndy, Sfx, Titulo, useSegundos } from '../comum';
import { Mapa, projeta, type Vista } from '../Mapa';
import { duracaoCena, f } from '../tempos';

export const VISTA_ATLANTICO: Vista = { lon: -38, lat: 24, escala: 18 };
export const TEMPESTADE: [number, number] = [-40, 42];

/** Os três medidores acendem com "mais forte, mais tempo, mais mar" (em segundos da cena). */
const MEDIDORES = [
  { nome: 'VENTO', em: 7.9 },
  { nome: 'DURAÇÃO', em: 8.6 },
  { nome: 'PISTA', em: 9.3 },
];
const MAIS_ONDA = 10.0;

/**
 * Tempestade vista de cima: nuvem espiral girando no sentido anti-horário
 * (hemisfério norte), vento circulando e ondas saindo para o sul.
 */
export function Tempestade({ x, y, forca, escala = 1 }: { x: number; y: number; forca: number; escala?: number }) {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const giro = -t * 40;
  const bracos = [0, 1, 2, 3].map((b) => {
    const pts = Array.from({ length: 30 }, (_, i) => {
      const r = 18 + i * 5.5;
      const a = (b * Math.PI) / 2 + r * 0.028;
      return `${i ? 'L' : 'M'}${Math.cos(a) * r} ${Math.sin(a) * r}`;
    });
    return pts.join(' ');
  });
  return (
    <g transform={`translate(${x} ${y}) scale(${escala})`}>
      <defs>
        <filter id="nuvem" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={16} />
        </filter>
      </defs>
      {/* Ondas saindo, cada vez maiores conforme a força. */}
      {[0, 1, 2, 3, 4].map((i) => {
        const fase = ((t * 0.45 + i / 5) % 1 + 1) % 1;
        const r = 120 + fase * 520;
        return (
          <path
            key={i}
            d={`M${Math.cos(0.35) * r} ${Math.sin(0.35) * r} A${r} ${r} 0 0 1 ${Math.cos(2.8) * r} ${Math.sin(2.8) * r}`}
            stroke={COR.espuma}
            strokeWidth={3 + forca * 5}
            strokeOpacity={(1 - fase) * (0.25 + forca * 0.55)}
            fill="none"
            strokeLinecap="round"
          />
        );
      })}
      <g transform={`rotate(${giro})`}>
        <circle r={150} fill="#ffffff" opacity={0.28} filter="url(#nuvem)" />
        {bracos.map((d, i) => (
          <path key={i} d={d} stroke="#ffffff" strokeOpacity={0.75} strokeWidth={16} strokeLinecap="round" fill="none" filter="url(#nuvem)" />
        ))}
        {bracos.map((d, i) => (
          <path key={`n${i}`} d={d} stroke="#ffffff" strokeOpacity={0.55} strokeWidth={5} strokeLinecap="round" fill="none" />
        ))}
      </g>
      <circle r={10} fill={COR.marFundo} opacity={0.8} />
    </g>
  );
}

/** Setas de vento circulando no sentido anti-horário em volta da tempestade. */
function Ventos({ x, y, aparece }: { x: number; y: number; aparece: number }) {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  return (
    <g transform={`translate(${x} ${y})`} opacity={aparece}>
      {Array.from({ length: 8 }, (_, i) => {
        const a0 = (i / 8) * Math.PI * 2 - t * 0.9;
        const r = 240;
        const a1 = a0 - 0.45;
        const [x0, y0, x1, y1] = [Math.cos(a0) * r, Math.sin(a0) * r, Math.cos(a1) * r, Math.sin(a1) * r];
        const ang = (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI;
        return (
          <g key={i}>
            <path d={`M${x0} ${y0} A${r} ${r} 0 0 0 ${x1} ${y1}`} stroke={COR.coral} strokeWidth={7} strokeLinecap="round" fill="none" />
            <path d="M0 0 L-16 -9 L-16 9 Z" fill={COR.coral} transform={`translate(${x1} ${y1}) rotate(${ang - 12})`} />
          </g>
        );
      })}
    </g>
  );
}

function Medidores() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < f(MEDIDORES[0].em) - 8) return null;
  return (
    <div style={{ position: 'absolute', top: 300, left: 90, right: 90, display: 'flex', gap: 24 }}>
      {MEDIDORES.map((m) => {
        const aparece = spring({ frame: frame - f(m.em) + 8, fps, config: { damping: 14 } });
        const enche = interpolate(frame, [f(m.em), f(m.em) + 20], [0.12, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        return (
          <div
            key={m.nome}
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.95)',
              borderRadius: 20,
              padding: '18px 18px 20px',
              fontFamily: FONTE,
              opacity: aparece,
              transform: `translateY(${(1 - aparece) * 40}px)`,
              boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 30, color: COR.tinta, letterSpacing: '0.04em' }}>{m.nome}</div>
            <div style={{ marginTop: 14, height: 18, borderRadius: 9, background: COR.borda, overflow: 'hidden' }}>
              <div style={{ width: `${enche * 100}%`, height: '100%', background: COR.coral, borderRadius: 9 }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function Nascimento() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = useSegundos('nascimento');
  const [tx, ty] = projeta(VISTA_ATLANTICO, TEMPESTADE);
  const nivel = MEDIDORES.filter((m) => frame >= f(m.em)).length / 3;
  const pulso = spring({ frame: frame - f(MAIS_ONDA), fps, config: { damping: 8 } });
  const forca = Math.min(1, 0.15 + nivel * 0.75 + (frame >= f(MAIS_ONDA) ? pulso * 0.1 : 0));
  const ventos = interpolate(frame, [f(4.1), f(4.8)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const entrada = spring({ frame, fps, config: { damping: 16, stiffness: 90 } });
  const andy = spring({ frame: frame - f(0.3), fps, config: { damping: 12 } });

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `scale(${1.15 - 0.15 * entrada})` }}>
        <Mapa vista={VISTA_ATLANTICO}>
          <Ventos x={tx} y={ty} aparece={ventos} />
          <Tempestade x={tx} y={ty} forca={forca} escala={1 + (frame >= f(MAIS_ONDA) ? pulso * 0.08 : 0)} />
        </Mapa>
      </AbsoluteFill>

      <Titulo em={0.5} ate={7.7} y={300} tamanho={70}>
        {'Nasce numa *tempestade*'}
      </Titulo>
      <Medidores />
      <Titulo em={MAIS_ONDA} y={470} tamanho={80}>
        {'= *mais onda*'}
      </Titulo>

      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <g transform={`translate(${(1 - andy) * -420} 0)`}>
          <Andy
            x={200}
            y={1570}
            altura={520}
            pose="apontando"
            corpo={respirando(frame, POSES.apontando)}
            rosto={{ ...piscar(frame, EXPRESSOES.neutro), boca: bocaDoAndy(s) ?? EXPRESSOES.neutro.boca }}
          />
        </g>
      </svg>

      <Ambiente som="tempestade" cena="nascimento" volume={0.55} duracao={duracaoCena('nascimento')} />
      <Sfx som="whoosh-grave" em={0} />
      <Sfx som="whoosh-curto" em={0.3} volume={0.6} />
      <Sfx som="vento" em={4.1} volume={0.35} />
      {MEDIDORES.map((m) => (
        <Sfx key={m.nome} som="medidor" em={m.em - 0.05} volume={0.8} />
      ))}
      <Sfx som="impacto" em={MAIS_ONDA} volume={0.45} />
    </AbsoluteFill>
  );
}
