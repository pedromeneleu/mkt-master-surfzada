import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

import { Andy, EXPRESSOES, nado, piscar, POSES, respirando } from '@compartilhado/personagens/andy';
import { COR, FPS } from '../../tema';
import { Ambiente, bocaDoAndy, Chip, Sfx, Titulo, useSegundos } from '../comum';
import { duracaoCena, f } from '../tempos';

// A partir daqui, o swell visto de cima (segundos da cena).
const LINHAS = 7.2;

function Ceu() {
  return (
    <>
      <defs>
        <linearGradient id="ceu-swell" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dff3fb" />
          <stop offset="1" stopColor="#a9dcef" />
        </linearGradient>
        <linearGradient id="agua-swell" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={COR.raso} />
          <stop offset="0.45" stopColor={COR.mar} />
          <stop offset="1" stopColor={COR.marFundo} />
        </linearGradient>
      </defs>
      <rect width={1080} height={1920} fill="url(#ceu-swell)" />
    </>
  );
}

const Y0 = 760;

function Superficie({ eta }: { eta: (x: number) => number }) {
  const pts = Array.from({ length: 109 }, (_, i) => i * 10);
  const sup = pts.map((x) => `${x ? 'L' : 'M'}${x} ${Y0 - eta(x)}`).join(' ');
  return (
    <>
      <path d={`${sup} L1080 1920 L0 1920 Z`} fill="url(#agua-swell)" />
      <path d={sup} stroke={COR.espuma} strokeWidth={6} fill="none" strokeLinejoin="round" />
    </>
  );
}

/**
 * Dispersão: a câmera acompanha o pacote de energia. As ondas longas ficam
 * no quadro; as curtas, mais lentas, escorregam para a esquerda e somem.
 */
function Bagunca({ t }: { t: number }) {
  const kL = (2 * Math.PI) / 720;
  const fronteira = interpolate(t, [1.2, 6.2], [1240, -200], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const eta = (x: number) => {
    const longa = 40 * Math.cos(kL * x - 0.5 * t);
    const peso = Math.min(1, Math.max(0, (fronteira - x) / 260));
    const curtas = 15 * Math.cos(0.041 * x + 2.6 * t) + 11 * Math.cos(0.063 * x + 3.4 * t + 1) + 8 * Math.cos(0.097 * x + 4.1 * t + 2.3);
    return longa + curtas * peso;
  };
  return <Superficie eta={eta} />;
}

/** Swell visto de cima: linhas paralelas e espaçadas descendo para a costa. */
function Linhas({ t }: { t: number }) {
  const esp = 190;
  const desloca = (t * 70) % esp;
  return (
    <>
      <defs>
        <linearGradient id="mar-cima" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={COR.marFundo} />
          <stop offset="1" stopColor={COR.mar} />
        </linearGradient>
      </defs>
      <rect width={1080} height={1920} fill="url(#mar-cima)" />
      {Array.from({ length: 13 }, (_, i) => {
        const y = -esp + i * esp + desloca;
        const d = Array.from({ length: 23 }, (_, j) => {
          const x = -60 + j * 55;
          return `${j ? 'L' : 'M'}${x} ${y + Math.sin(x * 0.004 + i * 0.4) * 22 + (x - 540) * 0.12}`;
        }).join(' ');
        return <path key={i} d={d} stroke={COR.espuma} strokeOpacity={0.85} strokeWidth={9} strokeLinecap="round" fill="none" />;
      })}
    </>
  );
}

export function Swell() {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const s = useSegundos('swell');
  const parte = t < LINHAS ? 'bagunca' : 'linhas';
  const falaOuBase = (r: typeof EXPRESSOES.neutro) => ({ ...piscar(frame, r), boca: bocaDoAndy(s) ?? r.boca });

  return (
    <AbsoluteFill style={{ overflow: 'hidden', background: COR.marFundo }}>
      <svg width={1080} height={1920}>
        {parte === 'bagunca' && (
          <>
            <Ceu />
            <Bagunca t={t} />
            <Andy x={520} y={1080} altura={380} vista="nado" corpo={nado(frame, 22)} rosto={falaOuBase(EXPRESSOES.determinado)} />
          </>
        )}
        {parte === 'linhas' && (
          <>
            <Linhas t={t} />
            <Andy
              x={200}
              y={1570}
              altura={520}
              pose="apontando"
              corpo={respirando(frame, POSES.apontando)}
              rosto={falaOuBase(EXPRESSOES.neutro)}
            />
          </>
        )}
      </svg>

      {parte === 'bagunca' && (
        <>
          <Titulo em={0.3} y={300} tamanho={66} claro>
            {'Perto da tempestade: *bagunça*'}
          </Titulo>
          <Chip x={820} y={560} em={3.2} fundo={COR.coral} cor="#fff">
            longas: saem na frente →
          </Chip>
          <Chip x={270} y={640} em={4.2}>
            ← curtas: ficam pra trás
          </Chip>
        </>
      )}
      {parte === 'linhas' && (
        <Titulo em={9.4} y={420} tamanho={150}>
          {'*Swell*'}
        </Titulo>
      )}
      <Ambiente som="mar-aberto" cena="swell" volume={0.5} duracao={duracaoCena('swell')} />
      <Sfx som="cauda" em={0.3} volume={0.6} />
      <Sfx som="cauda" em={1.4} volume={0.5} />
      <Sfx som="pop" em={3.2} volume={0.6} />
      <Sfx som="pop" em={4.2} volume={0.6} />
      <Sfx som="whoosh" em={LINHAS - 0.15} />
      <Sfx som="impacto" em={9.4} volume={0.5} />
    </AbsoluteFill>
  );
}
