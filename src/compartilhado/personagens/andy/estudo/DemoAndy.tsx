import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

import {
  aceno,
  bocaFalando,
  comBoca,
  nado,
  EXPRESSOES,
  Andy,
  misturaCorpo,
  misturaRosto,
  piscar,
  POSES,
  pulando,
  respirando,
  tremendo,
  type Corpo,
  type NomeExpressao,
  type NomePose,
  type Rosto,
  type Vista,
} from '..';
import { CHEGADA, COR, FONTE } from '../../../tema';

/** Cada emoção da demonstração: expressão, pose e um nome para a legenda. */
const EMOCOES: { expressao: NomeExpressao; pose: NomePose; nome: string; treme?: boolean }[] = [
  { expressao: 'deboche', pose: 'bracosCruzados', nome: 'deboche' },
  { expressao: 'surpresa', pose: 'confiante', nome: 'surpresa' },
  { expressao: 'medo', pose: 'encolhido', nome: 'medo', treme: true },
  { expressao: 'raiva', pose: 'bravo', nome: 'raiva' },
  { expressao: 'tristeza', pose: 'desanimado', nome: 'tristeza' },
  { expressao: 'pensativo', pose: 'pensando', nome: 'dúvida' },
  { expressao: 'ideia', pose: 'apontandoCima', nome: 'sacou!' },
];

const SALTA = 60; // sai da água
const POUSA = 86; // cai em pé no chão
const FALA = 106; // começa a falar
const FRASE = 'E aí. Eu sou o Andy.';
const EMOCAO_INICIO = 172;
const EMOCAO_DURA = 36;
const TRANSICAO = 8;
const FESTA = EMOCAO_INICIO + EMOCOES.length * EMOCAO_DURA;
export const DURACAO_DEMO = FESTA + 60;

const CHAO = 1330;
const AGUA = 1690;
const X_SALTO = 330;

/** Demonstração do rig: entra nadando, salta da água, fala, passa pelas emoções e comemora. */
export function DemoAndy() {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  let vista: Vista = 'frente';
  let corpo: Corpo;
  let rosto: Rosto;
  let legenda = '';
  let x = width / 2;
  let y = CHAO;

  if (frame < SALTA) {
    // Entra nadando por dentro da onda.
    vista = 'nado';
    x = interpolate(frame, [0, SALTA], [-420, X_SALTO]);
    y = AGUA;
    corpo = nado(frame);
    rosto = EXPRESSOES.determinado;
  } else if (frame < POUSA) {
    // Salta: sobe de focinho para cima, gira no alto e desce já em pé.
    const t = (frame - SALTA) / (POUSA - SALTA);
    x = interpolate(t, [0, 1], [X_SALTO, width / 2]);
    y = interpolate(t, [0, 1], [AGUA, CHAO]) - Math.sin(t * Math.PI) * 520;
    if (t < 0.5) {
      vista = 'nado';
      corpo = { ...nado(frame), inclina: interpolate(t, [0, 0.5], [-55, -90]), cauda: Math.sin(frame) * 10 };
    } else {
      corpo = { ...POSES.comemorando, estica: 1.12, nadEsq: 60, nadDir: 60 };
    }
    rosto = t < 0.5 ? EXPRESSOES.determinado : EXPRESSOES.riso;
  } else if (frame < FALA) {
    // Pousa amassando e se ajeita.
    const s = spring({ frame: frame - POUSA, fps, config: { damping: 9, stiffness: 180 } });
    corpo = { ...POSES.parado, estica: 0.86 + 0.14 * s, inclina: (1 - s) * 10 };
    rosto = EXPRESSOES.neutro;
  } else if (frame < EMOCAO_INICIO) {
    const t = frame - FALA;
    corpo = aceno(t, POSES.parado);
    rosto = comBoca(EXPRESSOES.neutro, bocaFalando(FRASE, t / fps));
    legenda = FRASE;
  } else if (frame < FESTA) {
    const i = Math.floor((frame - EMOCAO_INICIO) / EMOCAO_DURA);
    const local = frame - EMOCAO_INICIO - i * EMOCAO_DURA;
    const atual = EMOCOES[i];
    const anterior = EMOCOES[i - 1] ?? { expressao: 'neutro', pose: 'parado' };
    const t = interpolate(local, [0, TRANSICAO], [0, 1], { extrapolateRight: 'clamp', easing: CHEGADA });
    corpo = respirando(frame, misturaCorpo(POSES[anterior.pose], POSES[atual.pose], t));
    if (atual.treme && t === 1) corpo = tremendo(frame, corpo);
    rosto = misturaRosto(EXPRESSOES[anterior.expressao], EXPRESSOES[atual.expressao], t);
    legenda = atual.nome;
  } else {
    corpo = pulando(frame - FESTA, POSES.comemorando);
    rosto = EXPRESSOES.riso;
    legenda = 'bora!';
  }

  const escala = 2.2;
  const onda = <path d={`M0 1500 C200 1420 380 1420 560 1470 S900 1540 ${width} 1430 L${width} 1920 L0 1920 Z`} fill={COR.tinta} />;
  // Respingos quando ele fura a superfície.
  const respingo = interpolate(frame, [SALTA - 2, SALTA + 16], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ background: COR.fundo, fontFamily: FONTE }}>
      <svg width={width} height={1920} viewBox={`0 0 ${width} 1920`}>
        {vista !== 'nado' && (
          <ellipse cx={x} cy={CHAO + 6} rx={100 * escala * Math.max(0.3, 1 - (CHAO - y + corpo.pulo) / 500)} ry={12 * escala} fill={COR.tinta} opacity={0.08} />
        )}
        {onda}
        <Andy x={x} y={y} altura={270 * escala} vista={vista} corpo={corpo} rosto={piscar(frame, rosto)} />
        {respingo > 0 && respingo < 1 &&
          [-70, -40, -12, 16, 44, 72].map((dx, i) => (
            <circle
              key={dx}
              cx={X_SALTO + 60 + dx * (0.6 + respingo * 1.4)}
              cy={1470 - Math.sin(respingo * Math.PI) * (90 + (i % 3) * 40)}
              r={10 * (1 - respingo) + 3}
              fill={COR.agua}
            />
          ))}
      </svg>
      {legenda && (
        <div style={{ position: 'absolute', top: 300, width: '100%', textAlign: 'center', fontSize: 84, fontWeight: 700, color: COR.tinta, letterSpacing: '-0.02em' }}>
          {legenda}
        </div>
      )}
      <div style={{ position: 'absolute', bottom: 70, width: '100%', textAlign: 'center', fontSize: 40, fontWeight: 600, color: COR.fundo }}>
        Surfzada <span style={{ color: COR.coral }}>Analisa</span>
      </div>
    </AbsoluteFill>
  );
}
