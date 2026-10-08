import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

import { Andy, EXPRESSOES, misturaCorpo, piscar, POSES, respirando } from '@compartilhado/personagens/andy';
import { COR, FPS } from '../../tema';
import { Ambiente, bocaDoAndy, Sfx, Titulo, useSegundos } from '../comum';
import { f } from '../tempos';
import { QuadroInicial } from './Gancho';

const BORDAO = 4.1;
const CLACK = 5.55;
const MERGULHO = 5.9;
const LOOP = 6.4;

/** Aviãozinho de "enviar", pulando para chamar a atenção para o compartilhamento. */
function Enviar({ em }: { em: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - f(em), fps, config: { damping: 9 } });
  const pulo = Math.abs(Math.sin(((frame - f(em)) / fps) * 5)) * 18;
  if (frame < f(em)) return null;
  return (
    <g transform={`translate(860 ${640 - pulo}) scale(${s * 2}) rotate(-18)`}>
      <path d="M-30 -4 L34 -28 L12 34 L2 8 Z" fill={COR.coral} />
      <path d="M2 8 L34 -28" stroke="#fff" strokeWidth={4} />
    </g>
  );
}

export function Fechamento() {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const s = useSegundos('fechamento');
  const cruzou = interpolate(t, [BORDAO - 0.2, BORDAO + 0.2], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const corpo = respirando(frame, misturaCorpo(POSES.apresentando, POSES.bracosCruzados, cruzou));
  const mergulho = interpolate(t, [MERGULHO, LOOP], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (x) => x * x });
  const r = t >= CLACK ? EXPRESSOES.riso : EXPRESSOES.deboche;

  if (t >= LOOP) {
    return (
      <AbsoluteFill style={{ overflow: 'hidden' }}>
        <QuadroInicial />
        <Sfx som="arrebentacao-1" em={LOOP} volume={0.7} />
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ background: COR.fundo, overflow: 'hidden' }}>
      <svg width={1080} height={1920}>
        <Enviar em={0.5} />
        <g transform={`translate(0 ${mergulho * 1300})`}>
          <Andy
            x={520}
            y={1720}
            altura={880}
            corpo={{ ...corpo, estica: corpo.estica * (1 - mergulho * 0.15) }}
            rosto={{ ...piscar(frame, r), boca: bocaDoAndy(s) ?? r.boca }}
          />
        </g>
        {mergulho > 0 &&
          [0, 1, 2, 3, 4, 5].map((i) => (
            <circle key={i} cx={420 + i * 48} cy={1400 - mergulho * (300 + i * 90)} r={10 + (i % 3) * 6} fill="#fff" stroke={COR.mar} strokeWidth={3} opacity={1 - mergulho * 0.6} />
          ))}
        <path d="M0 1560 C200 1480 380 1480 560 1530 S900 1600 1080 1490 L1080 1920 L0 1920 Z" fill={COR.tinta} />
      </svg>

      <Titulo em={0} y={300} tamanho={52} claro>
        {'Surfzada *Analisa* #1'}
      </Titulo>
      <Titulo em={BORDAO} y={380} tamanho={84} claro>
        {'O mar *não mente*.'}
      </Titulo>

      <Ambiente som="arrebentacao-longe" cena="fechamento" volume={0.35} duracao={f(LOOP)} />
      <Sfx som="pop" em={0.5} volume={0.6} />
      <Sfx som="whoosh-curto" em={BORDAO - 0.2} volume={0.5} />
      <Sfx som="clack" em={CLACK} />
      <Sfx som="whoosh-grave" em={MERGULHO - 0.05} volume={0.7} />
      <Sfx som="bolhas" em={MERGULHO} />
    </AbsoluteFill>
  );
}
