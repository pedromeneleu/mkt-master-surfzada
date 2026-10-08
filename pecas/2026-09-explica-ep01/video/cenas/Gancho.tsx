import { AbsoluteFill, Img, interpolate, OffthreadVideo, spring, useCurrentFrame, useVideoConfig } from 'remotion';

import { Andy, piscar, EXPRESSOES } from '@compartilhado/personagens/andy';
import { arquivo, COR, SUAVE } from '../../tema';
import { Ambiente, bocaDoAndy, Sfx, Titulo, useProgresso, useSegundos } from '../comum';
import { duracaoCena, f } from '../tempos';

const PASTA = 'reais';

/**
 * Recorte 9:16 do clipe 3840×2160: altura 1920 (escala 0,889) e o tubo no
 * centro. A crista foi marcada à mão no quadro congelado (3,0 s do clipe).
 */
const VIDEO = { largura: 3413, altura: 1920, x: -1385 };
const CRISTA = 'M0 821 C120 823 240 838 322 859 S520 940 588 960 S780 1020 855 1035 S980 1050 1030 1053';

/** O quadro do começo, parado (para o loop do fim reencaixar nele). */
export function QuadroInicial() {
  return <Img src={arquivo(`${PASTA}/r1-inicio.jpg`)} style={{ position: 'absolute', left: VIDEO.x, top: 0, width: VIDEO.largura, height: VIDEO.altura }} />;
}

/** Odômetro que gira e assenta em "milhares de km". */
function Odometro({ ate }: { ate: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const girando = frame < f(ate);
  const numero = Math.floor(interpolate(frame, [0, f(ate)], [0, 9999], { extrapolateRight: 'clamp', easing: (t) => t * t }));
  const assenta = spring({ frame: frame - f(ate), fps, config: { damping: 10, stiffness: 220 } });
  return (
    <div style={{ position: 'absolute', inset: 0, transform: `scale(${girando ? 1 : 0.9 + 0.1 * assenta})`, transformOrigin: '50% 450px' }}>
      <Titulo em={0.05} y={395} tamanho={girando ? 104 : 110} claro>
        {girando ? `*${numero.toLocaleString('pt-BR')} km*` : `*milhares de km*`}
      </Titulo>
    </div>
  );
}

export function Gancho() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = useSegundos('gancho');
  const congelado = frame >= f(1.5);
  const zoom = interpolate(frame, [f(1.5), duracaoCena('gancho')], [1, 1.07], { extrapolateLeft: 'clamp', easing: SUAVE });
  const traco = useProgresso(1.6, 2.4);
  const entra = spring({ frame: frame - f(2.1), fps, config: { damping: 11, stiffness: 120 } });

  return (
    <AbsoluteFill style={{ background: COR.tinta, overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: '50% 48%' }}>
        {congelado ? (
          <Img src={arquivo(`${PASTA}/r1-congelado.jpg`)} style={{ position: 'absolute', left: VIDEO.x, top: 0, width: VIDEO.largura, height: VIDEO.altura }} />
        ) : (
          <OffthreadVideo
            src={arquivo(`${PASTA}/r1-telo-island.mp4`)}
            startFrom={f(1.5)}
            muted
            style={{ position: 'absolute', left: VIDEO.x, top: 0, width: VIDEO.largura, height: VIDEO.altura }}
          />
        )}
        <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
          <path d={CRISTA} stroke={COR.coral} strokeWidth={12} strokeLinecap="round" fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - traco} />
        </svg>
      </AbsoluteFill>

      <Titulo em={0} y={300} tamanho={62} claro>
        Essa onda viajou
      </Titulo>
      <Odometro ate={1.9} />
      <Titulo em={3.55} y={540} tamanho={58} claro>
        {"…sem trazer *uma gota d'água*"}
      </Titulo>

      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <g transform={`translate(0 ${(1 - entra) * 760})`} opacity={frame >= f(2.1) ? 1 : 0}>
          <Andy x={215} y={1650} altura={520} pose="apontando" rosto={{ ...piscar(frame, EXPRESSOES.deboche), boca: bocaDoAndy(s) ?? EXPRESSOES.deboche.boca }} />
        </g>
      </svg>

      <Ambiente som="arrebentacao-longe" cena="gancho" volume={0.45} duracao={duracaoCena('gancho')} />
      <Sfx som="arrebentacao-1" em={0} volume={0.7} />
      <Sfx som="contador" em={0.1} volume={0.8} />
      <Sfx som="congela" em={1.05} />
      <Sfx som="traco" em={1.6} volume={0.9} />
      <Sfx som="cauda" em={2.05} volume={0.7} />
      <Sfx som="pouso" em={2.35} volume={0.7} />
    </AbsoluteFill>
  );
}
