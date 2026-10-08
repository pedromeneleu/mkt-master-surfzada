import { AbsoluteFill, interpolate, OffthreadVideo, Sequence, spring, useCurrentFrame, useVideoConfig } from 'remotion';

import { Andy, EXPRESSOES, piscar, POSES, respirando } from '@compartilhado/personagens/andy';
import { arquivo, COR, FONTE, FPS, SUAVE } from '../../tema';
import { Ambiente, bocaDoAndy, Chip, Sfx, Titulo, useSegundos } from '../comum';
import { FORTALEZA, Mapa, projeta, type Vista } from '../Mapa';
import { f } from '../tempos';
import { TEMPESTADE, VISTA_ATLANTICO, Tempestade } from './Nascimento';

const REAL = 1.8;
const PRAIAS = 3.4;
const PERFEITA = 4.6;
const FECHA = 6.3;
const POR_QUE = 7.8;
const PROXIMO = 9.4;

const VISTA_CEARA: Vista = { lon: -38.9, lat: -3.3, escala: 230 };

function ZoomMapa({ t }: { t: number }) {
  const p = interpolate(t, [0.15, REAL - 0.1], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: SUAVE });
  // Zoom exponencial na escala, para a aproximação parecer constante.
  const escala = VISTA_ATLANTICO.escala * Math.pow(VISTA_CEARA.escala / VISTA_ATLANTICO.escala, p);
  const vista: Vista = {
    lon: interpolate(p, [0, 1], [VISTA_ATLANTICO.lon, VISTA_CEARA.lon]),
    lat: interpolate(Math.pow(p, 0.6), [0, 1], [VISTA_ATLANTICO.lat, VISTA_CEARA.lat]),
    escala,
  };
  const [tx, ty] = projeta(vista, TEMPESTADE);
  const [fx, fy] = projeta(vista, FORTALEZA);
  return (
    <Mapa vista={vista}>
      <Tempestade x={tx} y={ty} forca={1} escala={vista.escala / VISTA_ATLANTICO.escala} />
      <circle cx={fx} cy={fy} r={14} fill={COR.coral} stroke="#fff" strokeWidth={4} opacity={p} />
      <text x={fx + 26} y={fy + 12} fontFamily={FONTE} fontWeight={700} fontSize={44} fill="#fff" opacity={p}>
        Ceará
      </text>
    </Mapa>
  );
}

/**
 * Três praias vizinhas vistas de cima, separadas por pontas de pedra,
 * recebendo as mesmas linhas de swell. O fundo de cada uma é diferente:
 * - esquerda: laje junto à ponta → a onda abre, a espuma corre ao longo da crista;
 * - meio: banco de areia plano → a linha inteira quebra de uma vez (fecha);
 * - direita: canal fundo → a onda quase não quebra.
 */
function TresPraias({ t }: { t: number }) {
  const tp = Math.min(t, POR_QUE) - PRAIAS;
  const esp = 150;
  const [Z0, Z1] = [850, 960];
  const COSTA = 1010;
  const linhas = Array.from({ length: 8 }, (_, i) => 420 + ((tp * 90 + i * esp) % (esp * 8)) - esp).filter((y) => y > 380 && y < Z1 + 30);
  const dentro = (y: number) => Math.min(1, Math.max(0, (y - Z0) / (Z1 - Z0)));
  return (
    <>
      <defs>
        <linearGradient id="mar-praias" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={COR.marFundo} />
          <stop offset="1" stopColor={COR.raso} />
        </linearGradient>
      </defs>
      <rect width={1080} height={1920} fill="url(#mar-praias)" />
      {/* O que tem no fundo de cada praia. */}
      <ellipse cx={250} cy={930} rx={120} ry={60} fill="#0c2436" opacity={0.45} />
      <rect x={380} y={870} width={320} height={100} rx={30} fill={COR.agua} opacity={0.3} />
      <path d="M800 1010 C810 800 990 800 1000 1010 Z" fill={COR.marFundo} opacity={0.75} />

      {linhas.map((y, i) => {
        const p = dentro(y);
        if (y < Z0) {
          return (
            <g key={i}>
              <line x1={0} y1={y} x2={760} y2={y} stroke={COR.espuma} strokeWidth={8} opacity={0.9} />
              <line x1={760} y1={y} x2={1080} y2={y} stroke={COR.espuma} strokeWidth={8} opacity={0.9 * Math.max(0.15, 1 - (y - 600) / 320)} />
            </g>
          );
        }
        const xPeel = 345 - p * 330;
        return (
          <g key={i}>
            {/* Esquerda: abre a partir da ponta. */}
            <line x1={0} y1={y} x2={xPeel} y2={y} stroke={COR.espuma} strokeWidth={8} />
            <rect x={xPeel} y={y - 13} width={350 - xPeel} height={26} rx={13} fill="#fff" />
            <circle cx={xPeel} cy={y} r={12} fill={COR.coral} />
            {/* Meio: fecha tudo de uma vez. */}
            <rect x={372} y={y - 17 - p * 6} width={336} height={34 + p * 12} rx={20} fill="#fff" />
            {/* Direita: quase não quebra. */}
            <line x1={730} y1={y} x2={1080} y2={y} stroke={COR.espuma} strokeWidth={5} opacity={0.2} />
          </g>
        );
      })}

      {/* Areia e as duas pontas de pedra que separam as praias. */}
      <path d={`M0 ${COSTA} C120 1050 240 1050 340 ${COSTA} L380 ${COSTA} C480 1050 600 1050 700 ${COSTA} L740 ${COSTA} C850 1050 960 1050 1080 ${COSTA} L1080 1920 L0 1920 Z`} fill="#e9d8a6" />
      {[360, 720].map((x) => (
        <path key={x} d={`M${x - 42} ${COSTA + 20} C${x - 34} 930 ${x - 12} 880 ${x} 870 C${x + 12} 880 ${x + 34} 930 ${x + 42} ${COSTA + 20} Z`} fill="#4a3f2c" stroke="#2e271b" strokeWidth={3} />
      ))}
    </>
  );
}

function CartaoProximo({ em }: { em: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - f(em), fps, config: { damping: 12 } });
  if (frame < f(em)) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: 150,
        right: 150,
        top: 560,
        background: COR.tinta,
        color: '#fff',
        borderRadius: 30,
        padding: '34px 40px',
        textAlign: 'center',
        fontFamily: FONTE,
        transform: `scale(${0.7 + 0.3 * s})`,
        opacity: s,
        boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
      }}
    >
      <div style={{ fontSize: 34, fontWeight: 600, color: COR.coral, letterSpacing: '0.08em' }}>PRÓXIMO</div>
      <div style={{ fontSize: 66, fontWeight: 700, marginTop: 8 }}>Surfzada Analisa #2</div>
      <div style={{ fontSize: 40, marginTop: 10, color: '#d4d4d4' }}>Por que a onda quebra?</div>
    </div>
  );
}

export function Chegando() {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const s = useSegundos('chegando');
  const parte = t < REAL ? 'mapa' : t < PRAIAS ? 'real' : 'praias';
  const congelou = t >= POR_QUE;
  const falaOuBase = (r: typeof EXPRESSOES.neutro) => ({ ...piscar(frame, r), boca: bocaDoAndy(s) ?? r.boca });

  return (
    <AbsoluteFill style={{ overflow: 'hidden', background: COR.marFundo }}>
      {parte === 'mapa' && <ZoomMapa t={t} />}
      {parte === 'real' && (
        <Sequence from={f(REAL)} layout="none">
          <OffthreadVideo
            src={arquivo('reais/r2-swell-aereo-tomfisk.mp4')}
            startFrom={f(17)}
            muted
            style={{ position: 'absolute', left: -1166, top: 0, width: 3413, height: 1920 }}
          />
          <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(10,10,10,0.65) 0%, rgba(10,10,10,0) 40%)' }} />
        </Sequence>
      )}
      {parte === 'praias' && (
        <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
          <TresPraias t={t} />
          <Andy
            x={190}
            y={1570}
            altura={500}
            pose="bracosCruzados"
            corpo={respirando(frame, POSES.bracosCruzados)}
            rosto={falaOuBase(EXPRESSOES.desconfiado)}
          />
        </svg>
      )}

      {parte === 'real' && (
        <Titulo em={REAL + 0.05} y={300} tamanho={68}>
          {'Na costa, quem manda é o *fundo*'}
        </Titulo>
      )}
      {parte === 'praias' && !congelou && (
        <>
          <Chip x={180} y={780} em={PERFEITA}>
            abre
          </Chip>
          <Chip x={540} y={780} em={FECHA}>
            fecha
          </Chip>
          <Chip x={900} y={780} em={FECHA + 0.5}>
            quase nada
          </Chip>
        </>
      )}
      {congelou && t < PROXIMO && (
        <>
          <Titulo em={POR_QUE} y={380} tamanho={130}>
            {'Por *quê*?'}
          </Titulo>
          {[180, 540, 900].map((x, i) => (
            <Chip key={x} x={x} y={780} em={POR_QUE + i * 0.08} fundo={COR.coral} cor="#fff">
              ?
            </Chip>
          ))}
        </>
      )}
      <CartaoProximo em={PROXIMO} />

      <Ambiente som="arrebentacao-longe" cena="chegando" volume={0.5} duracao={f(POR_QUE)} />
      <Sfx som="whoosh-grave" em={0} />
      <Sfx som="whoosh" em={REAL - 0.2} />
      <Sfx som="whoosh-curto" em={PRAIAS - 0.1} />
      <Sfx som="arrebentacao-1" em={PERFEITA - 0.3} volume={0.6} />
      <Sfx som="pop" em={PERFEITA} volume={0.5} />
      <Sfx som="arrebentacao-3" em={FECHA - 0.3} volume={0.8} />
      <Sfx som="pop" em={FECHA} volume={0.5} />
      <Sfx som="riser-longo" em={POR_QUE - 2.2} volume={0.7} />
      <Sfx som="pop-agudo" em={PROXIMO} volume={0.7} />
      <Sfx som="whoosh-curto" em={PROXIMO} volume={0.5} />
    </AbsoluteFill>
  );
}
