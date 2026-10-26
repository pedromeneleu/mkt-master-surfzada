import { AbsoluteFill, Html5Audio, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

import { Sfx, VOLUME_SFX } from '@compartilhado/componentes/Sfx';
import { FundoClaro, Logo } from '@compartilhado/marca/Marca';
import { Rotulo } from '@compartilhado/marca/Texto';
import { CHEGADA, COR, FONTE, SUAVE } from '@compartilhado/tema';
import { arquivoSfx } from '@compartilhado/util/arquivos';

import { Janela, Visor, type Camera, type Projetar } from './Janela';
import { Etiqueta, FONTE_LEGENDA, H, Legenda, W } from './comum';
import { P, joelhoEstavel, joelhoMaisReto, punhoMaisAberto, quadroNoTempo, type IdClipe, type Ponto } from './pose';

/**
 * Reel "IA vs. o surf do meu brother" (roteiro no post.md): um roast com dado técnico
 * que apresenta a IA de análise de surf (em desenvolvimento) e pede vídeos da galera.
 *
 * Estilo da referência (o vídeo "Você vê isso / A gente vê isso"): fundo tinta, o clipe
 * numa janela 16:9 com cantos de visor e o esqueleto da IA por cima. O esqueleto é o
 * de verdade, extraído quadro a quadro (pose.json, scripts/extrair_pose.py).
 */

/** Cenas, em quadros (30 fps), como na tabela do roteiro. */
export const CENA = {
  gancho: 0,
  rewind: 30,
  analise: 120,
  placar: 360,
  ideal: 480,
  marca: 600,
  cta: 720,
} as const;
export const DURACAO = 900;

/**
 * Tempos do clipe da rasgada (segundos de clipes/rasgada.mp4, que começa aos 10 s do
 * bruto). Medidos nos quadros e na pose: ele sobe pro lip, joga água, abre os braços,
 * cai pra trás e a prancha voa.
 */
const T = {
  /** Começa no meio da ação (o gancho), já subindo pro lip. */
  gancho: 5.0,
  /** O quadro congelado: o pico da rasgada, água pra cima. */
  congela: 5.6,
  /** O rewind volta até a base, antes da batida. */
  base: 2.6,
  /** A câmera lenta: da subida até a queda. */
  lento: [4.4, 8.0] as [number, number],
  /** A queda: carimbo "VACA DETECTADA". */
  vaca: 7.0,
  /** O placar fica congelado na queda (inclinado pra trás, braços pra cima). */
  placar: 7.6,
};

/**
 * Os 3 apontamentos (quadro de entrada na cena de análise e texto). Cada um é visível na
 * pose: joelhos a 150–179° no lip (medido), braços abertos de ponta a ponta e o tronco
 * caindo pra trás. "Olhar" ficou de fora: no contraluz não dá para ver para onde ele olha.
 */
const NOTAS = [
  { em: CENA.analise + 6, numero: '01', titulo: 'BRAÇOS', texto: 'Abriu os braços de avião.\nO tronco *não girou* junto.' },
  // A nota dos joelhos entra quando as pernas já estão esticadas no lip (158–173° na pose,
  // quadros 186–236); antes disso ele ainda vem comprimido (~120°).
  { em: CENA.analise + 66, numero: '02', titulo: 'JOELHOS', texto: 'Perna esticada na batida.\nChegou *duro* no lip.' },
  { em: CENA.analise + 126, numero: '03', titulo: 'PESO', texto: 'Peso no pé de trás.\nSaiu *de ré* da onda.' },
];

/** Notas dos 5 juízes: cortam a maior e a menor e fazem a média (2,33 → 2,3). */
const JUIZES = ['2,0', '2,5', '2,3', '2,2', '3,1'];
const DESCARTADAS = [0, 4];

export type Gancho = { abre: string; vira: string };
/** Gancho principal e as 2 variações para teste A/B (post.md, Roteiro). */
export const GANCHOS: Record<'a' | 'b' | 'c', Gancho> = {
  a: { abre: 'A IA analisou\nessa rasgada…', vira: '…e não foi\n*gentil* 💀' },
  b: { abre: 'Meu brother jura\nque essa foi nota 10.', vira: 'A IA *discordou* 💀' },
  c: { abre: 'POV: teu brother\npediu nota pra IA', vira: 'Ela foi *sincera*\ndemais 💀' },
};

const JANELA = { w: W, h: 760, top: 630 };
/** Faixa das legendas, acima da janela e abaixo da área do topo do Reels (~220 px). */
const LEGENDA = { top: 230, h: 360 };

const lim = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** Segundo do clipe da rasgada em cada quadro do vídeo (gancho → rewind → câmera lenta). */
function tempoRasgada(f: number): number {
  if (f < 16) return interpolate(f, [0, 16], [T.gancho, T.congela]);
  if (f < CENA.rewind) return T.congela;
  if (f < 66) return interpolate(f, [CENA.rewind, 66], [T.congela, T.base], { easing: SUAVE });
  if (f < CENA.analise) return interpolate(f, [66, CENA.analise], [T.base, T.lento[0]]);
  if (f < CENA.placar) return interpolate(f, [CENA.analise, CENA.placar], T.lento);
  return T.placar;
}

export function IaAnalisa({ gancho }: { gancho: keyof typeof GANCHOS }) {
  const g = GANCHOS[gancho];
  return (
    <AbsoluteFill style={{ background: COR.tinta }}>
      <Sequence durationInFrames={CENA.placar} name="gancho · rewind · análise">
        <Analise gancho={g} />
      </Sequence>
      <Sequence from={CENA.placar} durationInFrames={CENA.ideal - CENA.placar} name="placar">
        <Placar />
      </Sequence>
      <Sequence from={CENA.ideal} durationInFrames={CENA.marca - CENA.ideal} name="linha ideal">
        <LinhaIdeal />
      </Sequence>
      <Sequence from={CENA.marca} durationInFrames={CENA.cta - CENA.marca} name="marca">
        <Marca />
      </Sequence>
      <Sequence from={CENA.cta} durationInFrames={DURACAO - CENA.cta} name="cta">
        <Chamada />
      </Sequence>
      <Efeitos />
    </AbsoluteFill>
  );
}

// ---------------------------------------------------------------------------
//  0–12 s: gancho congelado, rewind com o esqueleto e câmera lenta com 3 notas
// ---------------------------------------------------------------------------

function Analise({ gancho }: { gancho: Gancho }) {
  const frame = useCurrentFrame();
  const t = tempoRasgada(frame);
  const q = quadroNoTempo('rasgada', t);
  const voltando = frame >= CENA.rewind && frame < 66;

  // Câmera: punch-in no congelado; na análise, um corte a cada nota (pernas, cabeça, aberto).
  let camera: Camera = { zoom: 1.7 };
  if (frame >= 16 && frame < CENA.rewind) camera = { zoom: interpolate(frame, [16, 22], [1.7, 2.1], { ...lim, easing: CHEGADA }) };
  if (frame >= CENA.analise) camera = { zoom: 2.5, mira: { y: -0.03 } };
  if (frame >= NOTAS[1].em) camera = { zoom: 2.6, mira: { y: 0.05 } };
  if (frame >= NOTAS[2].em) camera = { zoom: 1.7 };

  const esqueleto = frame < 66 ? 0 : interpolate(frame, [66, 84], [0, 1], lim);
  const flash = frame < 16 ? 0 : interpolate(frame, [16, 22], [0.75, 0], lim);
  const nota = [...NOTAS].reverse().find((n) => frame >= n.em);

  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 0, top: JANELA.top }}>
        <Janela
          clipe="rasgada"
          t={t}
          largura={JANELA.w}
          altura={JANELA.h}
          camera={camera}
          esqueleto={esqueleto}
          filtro={voltando ? 'contrast(1.15) saturate(0.6) blur(1px)' : undefined}
        >
          {(projetar, pts, quadro) => nota && <Marcador nota={nota.titulo} projetar={projetar} pts={pts} graus={joelhoEstavel('rasgada', quadro)} em={nota.em} />}
        </Janela>
        {voltando && <Rebobinar />}
        <AbsoluteFill style={{ background: '#fff', opacity: flash }} />
        <Carimbo />
        <Visor
          largura={JANELA.w}
          altura={JANELA.h}
          esquerda={voltando ? '◀◀ VOLTANDO' : frame >= 66 ? '● RASTREADO' : undefined}
          direita={`QUADRO ${String(q).padStart(4, '0')}`}
          baixoEsquerda={frame >= 66 ? 'CORPO · 17 PONTOS' : undefined}
          baixoDireita={frame >= 66 ? 'PROTÓTIPO · EM TESTE' : undefined}
        />
      </div>

      {/* Legendas acima da janela: gancho, a virada e, na análise, cada nota. */}
      <div style={{ position: 'absolute', left: 60, right: 60, top: LEGENDA.top, height: LEGENDA.h, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', gap: 22 }}>
        {frame < CENA.rewind + 2 && <Legenda texto={gancho.abre} em={-30} sai={CENA.rewind - 4} tamanho={80} />}
        {frame >= CENA.rewind && frame < CENA.analise && <Legenda texto={gancho.vira} em={CENA.rewind + 4} sai={CENA.analise - 8} tamanho={86} />}
        {nota && frame >= CENA.analise && (
          <Sequence from={nota.em} layout="none" key={nota.numero}>
            <TituloNota numero={nota.numero} titulo={nota.titulo} />
            <Legenda texto={nota.texto} em={3} tamanho={64} intervalo={1} />
          </Sequence>
        )}
      </div>

      {frame >= CENA.analise && <PlacarNotas frame={frame} />}
    </AbsoluteFill>
  );
}

function TituloNota({ numero, titulo }: { numero: string; titulo: string }) {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, 10], [0, 1], { ...lim, easing: CHEGADA });
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, opacity: p, transform: `translateY(${(1 - p) * 20}px)` }}>
      <span style={{ fontFamily: FONTE, fontSize: 30, fontWeight: 700, color: COR.tinta, background: COR.coral, padding: '4px 14px', borderRadius: 6 }}>{numero}</span>
      <Etiqueta texto={titulo} cor={COR.coral} tamanho={30} />
    </div>
  );
}

/** Abaixo da janela: as 3 notas como checklist, acendendo na ordem. */
function PlacarNotas({ frame }: { frame: number }) {
  return (
    <div style={{ position: 'absolute', left: 60, right: 60, top: JANELA.top + JANELA.h + 64, display: 'flex', justifyContent: 'space-between' }}>
      {NOTAS.map((n) => {
        const on = interpolate(frame, [n.em, n.em + 8], [0, 1], lim);
        return (
          <div key={n.numero} style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: 0.35 + on * 0.65 }}>
            <span style={{ width: 22, height: 22, borderRadius: 11, border: `3px solid ${COR.coral}`, background: on > 0.5 ? COR.coral : 'transparent' }} />
            <Etiqueta texto={`${n.numero} ${n.titulo}`} tamanho={24} cor="#fff" />
          </div>
        );
      })}
    </div>
  );
}

/**
 * O que a nota aponta no corpo: anel no joelho (com o ângulo medido na pose),
 * na cabeça ou nos pés, com uma linha até a etiqueta.
 */
function Marcador({ nota, projetar, pts, graus, em }: { nota: string; projetar: Projetar; pts: Ponto[]; graus: number; em: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entra = spring({ frame: frame - em - 4, fps, config: { damping: 14, stiffness: 180 } });
  const joelho = joelhoMaisReto(pts);
  const alvo =
    nota === 'JOELHOS'
      ? projetar(pts[joelho.indice])
      : nota === 'BRAÇOS'
        ? projetar(pts[punhoMaisAberto(pts)])
        : (() => {
            const [a, b] = [projetar(pts[P.tornozeloE]), projetar(pts[P.tornozeloD])];
            return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] as [number, number];
          })();
  const rotulo = nota === 'JOELHOS' ? `${Math.round(graus)}°` : nota === 'BRAÇOS' ? 'MODO AVIÃO' : 'PESO ATRÁS';
  const r = 46 * entra;
  const lado = alvo[0] > JANELA.w * 0.6 ? -1 : 1;
  const ex = alvo[0] + lado * 150;
  const ey = alvo[1] - 90;
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
      <circle cx={alvo[0]} cy={alvo[1]} r={r} fill="none" stroke="#fff" strokeWidth={4} />
      <circle cx={alvo[0]} cy={alvo[1]} r={r + 10 + (frame % 20)} fill="none" stroke="#fff" strokeWidth={2} opacity={(1 - (frame % 20) / 20) * entra} />
      <polyline points={`${alvo[0] + lado * r * 0.7},${alvo[1] - r * 0.7} ${ex - lado * 10},${ey} ${ex + lado * 6},${ey}`} fill="none" stroke="#fff" strokeWidth={3} opacity={entra} />
      <foreignObject x={lado > 0 ? ex + 8 : ex - 408} y={ey - 34} width={400} height={70} opacity={entra}>
        <div style={{ display: 'flex', justifyContent: lado > 0 ? 'flex-start' : 'flex-end' }}>
          <span
            style={{
              background: 'rgba(10,10,10,0.78)',
              color: '#fff',
              borderRadius: 10,
              padding: '6px 16px',
              fontFamily: FONTE,
              fontSize: nota === 'JOELHOS' ? 46 : 30,
              fontWeight: 700,
              letterSpacing: nota === 'JOELHOS' ? '-0.02em' : '0.12em',
              whiteSpace: 'nowrap',
            }}
          >
            {rotulo}
          </span>
        </div>
      </foreignObject>
    </svg>
  );
}

/** Linhas de fita voltando (o rewind). */
function Rebobinar() {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        width: JANELA.w,
        height: JANELA.h,
        backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0 2px, transparent 2px 6px)',
        backgroundPositionY: frame * 9,
        mixBlendMode: 'screen',
      }}
    />
  );
}

/** "VACA DETECTADA": o carimbo da queda, torto como uma impressão de zine. */
function Carimbo() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const em = Math.round(interpolate(T.vaca, T.lento, [CENA.analise, CENA.placar]));
  if (frame < em || frame >= CENA.placar) return null;
  const bate = spring({ frame: frame - em, fps, config: { damping: 12, stiffness: 260 } });
  return (
    <div
      style={{
        position: 'absolute',
        left: JANELA.w / 2,
        top: JANELA.h * 0.78,
        transform: `translate(-50%, -50%) rotate(-7deg) scale(${2.2 - 1.2 * bate})`,
        opacity: Math.min(1, bate * 1.5),
        border: `6px solid ${COR.coral}`,
        padding: '10px 26px',
        fontFamily: FONTE,
        fontSize: 54,
        fontWeight: 700,
        letterSpacing: '0.06em',
        color: COR.coral,
        background: 'rgba(10,10,10,0.55)',
        whiteSpace: 'nowrap',
      }}
    >
      VACA DETECTADA
    </div>
  );
}

// ---------------------------------------------------------------------------
//  12–16 s: placar de juiz
// ---------------------------------------------------------------------------

function Placar() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const virada = 62;
  const someJuizes = interpolate(frame, [virada - 6, virada + 4], [1, 0], lim);
  const corta = interpolate(frame, [32, 40], [0, 1], lim);
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 0, top: JANELA.top }}>
        <Janela clipe="rasgada" t={T.placar} largura={JANELA.w} altura={JANELA.h} camera={{ zoom: 1.7 }} escurece={0.55} />
        <Visor largura={JANELA.w} altura={JANELA.h} esquerda="● RESULTADO" direita="BATERIA 01" />
      </div>

      <div style={{ position: 'absolute', left: 60, right: 60, top: LEGENDA.top, height: LEGENDA.h, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', gap: 28 }}>
        {frame < virada + 4 ? (
          <div style={{ opacity: someJuizes, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
            <Rotulo texto="NOTA DOS JUÍZES" tamanho={28} cor="#fff" />
            <div style={{ display: 'flex', gap: 18 }}>
              {JUIZES.map((n, i) => {
                const entra = spring({ frame: frame - 4 - i * 4, fps, config: { damping: 14, stiffness: 200 } });
                const fora = DESCARTADAS.includes(i);
                return (
                  <div
                    key={i}
                    style={{
                      position: 'relative',
                      width: 168,
                      padding: '14px 0 18px',
                      borderRadius: 14,
                      background: COR.tinta2,
                      border: '2px solid rgba(255,255,255,0.18)',
                      textAlign: 'center',
                      transform: `translateY(${(1 - entra) * 60}px)`,
                      opacity: entra * (fora ? 1 - corta * 0.6 : 1),
                    }}
                  >
                    <div style={{ fontFamily: FONTE, fontSize: 20, fontWeight: 600, letterSpacing: '0.14em', color: COR.apagado }}>J{i + 1}</div>
                    <div style={{ fontFamily: FONTE, fontSize: 64, fontWeight: 700, color: '#fff', letterSpacing: '-0.03em' }}>{n}</div>
                    {fora && <div style={{ position: 'absolute', left: 14, right: 14, top: '58%', height: 6, background: COR.coral, transform: `scaleX(${corta}) rotate(-8deg)` }} />}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Etiqueta texto="NOTA FINAL" tamanho={30} cor="#fff" />
            <Nota valor={2.3} em={virada + 2} dur={16} />
          </div>
        )}
      </div>

      <div style={{ position: 'absolute', left: 60, right: 60, top: JANELA.top + JANELA.h - 250 }}>
        {frame >= virada + 12 && <Legenda texto={'mas a intenção\nfoi *10* 🤙'} em={virada + 14} tamanho={84} />}
      </div>
    </AbsoluteFill>
  );
}

/** O número grande do placar contando até a nota, com vírgula (o `Contador` da marca sai com ponto). */
function Nota({ valor, em, dur }: { valor: number; em: number; dur: number }) {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [em, em + dur], [0, 1], { ...lim, easing: (t) => 1 - Math.pow(1 - t, 3) });
  return (
    <span style={{ fontFamily: FONTE, fontSize: 250, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.04em', color: COR.coral, fontVariantNumeric: 'tabular-nums', opacity: frame >= em ? 1 : 0 }}>
      {(valor * p).toFixed(1).replace('.', ',')}
    </span>
  );
}

// ---------------------------------------------------------------------------
//  16–20 s: split-screen com a linha ideal
// ---------------------------------------------------------------------------

const SPLIT = { h: 470, a: 450, b: 990 };

function LinhaIdeal() {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, CENA.marca - CENA.ideal], [T.lento[0], T.lento[0] + 1.8]);
  const ideal = interpolate(frame, [16, 40], [0, 1], { ...lim, easing: SUAVE });
  const entra = interpolate(frame, [0, 12], [0, 1], { ...lim, easing: CHEGADA });
  const camera: Camera = { zoom: 2.1 };
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 60, right: 60, top: LEGENDA.top - 10, height: 200, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }}>
        <Legenda texto="com essa correção:" em={2} tamanho={60} />
        <Legenda texto="*+2 pontos*" em={22} tamanho={92} />
      </div>
      <div style={{ position: 'absolute', left: 0, top: SPLIT.a, transform: `translateX(${(1 - entra) * -W}px)` }}>
        <Janela clipe="rasgada" t={t} largura={W} altura={SPLIT.h} camera={camera} />
        <Visor largura={W} altura={SPLIT.h} esquerda="O QUE ROLOU" direita="2,3" destaque={false} />
      </div>
      <div style={{ position: 'absolute', left: 0, top: SPLIT.b, transform: `translateX(${(1 - entra) * W}px)` }}>
        <Janela clipe="rasgada" t={t} largura={W} altura={SPLIT.h} camera={camera} ideal={ideal} fantasma escurece={0.25} />
        <Visor largura={W} altura={SPLIT.h} esquerda="● LINHA IDEAL" direita={frame > 40 ? '4,3' : '2,3'} baixoEsquerda="JOELHO DOBRADO · BRAÇO NA FRENTE · PESO NA FRENTE" />
      </div>
    </AbsoluteFill>
  );
}

// ---------------------------------------------------------------------------
//  20–24 s: a marca em tela papel
// ---------------------------------------------------------------------------

function Marca() {
  const frame = useCurrentFrame();
  const abre = interpolate(frame, [0, 14], [0, 150], { ...lim, easing: CHEGADA });
  return (
    <AbsoluteFill style={{ clipPath: `circle(${abre}% at 50% 50%)` }}>
      <FundoClaro />
      <Reticula />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', gap: 70, paddingBottom: 80 }}>
        <Logo tamanho={74} em={8} />
        <Legenda texto={'Tamo construindo\numa *IA* que lê\nteu surf.'} em={20} tamanho={88} cor={COR.tinta} peso={700} />
        <Rotulo texto="EM DESENVOLVIMENTO" em={44} tamanho={26} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

/** Reticula de meio-tom nos cantos (a textura de risografia/zine do briefing). */
function Reticula() {
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `radial-gradient(${COR.tinta} 2.4px, transparent 2.6px)`,
        backgroundSize: '16px 16px',
        opacity: 0.1,
        maskImage: 'radial-gradient(75% 55% at 50% 50%, transparent 55%, black 100%)',
      }}
    />
  );
}

// ---------------------------------------------------------------------------
//  24–30 s: chamada (manda teu vídeo, 10 primeiros, comenta ANÁLISE)
// ---------------------------------------------------------------------------

/** Clipes de "teu vídeo aqui" na janela da chamada: outros surfistas sendo rastreados. */
const VITRINE: { clipe: IdClipe; de: number; dur: number; zoom: number }[] = [
  { clipe: 'vaca', de: 2.6, dur: 90, zoom: 3.0 },
  { clipe: 'espuma', de: 2.5, dur: 90, zoom: 2.4 },
];

/** Na chamada a janela é mais baixa: texto e botão têm que caber acima dos ~420 px de baixo do Reels. */
const JANELA_CTA = 560;

function Chamada() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entra = interpolate(frame, [0, 10], [0, 1], { ...lim, easing: CHEGADA });
  const botao = spring({ frame: frame - 52, fps, config: { damping: 12, stiffness: 170 } });
  const pulsa = frame > 70 ? 1 + Math.sin((frame - 70) / 5) * 0.025 : 1;
  let inicio = 0;
  const atual = VITRINE.find((v) => {
    const dentro = frame < inicio + v.dur;
    if (!dentro) inicio += v.dur;
    return dentro;
  }) ?? VITRINE[VITRINE.length - 1];
  const local = frame - inicio;
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 60, right: 60, top: LEGENDA.top, height: LEGENDA.h, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }}>
        <Legenda texto={'Manda teu\nvídeo surfando.'} em={4} tamanho={90} />
      </div>
      <div style={{ position: 'absolute', left: 0, top: JANELA.top, opacity: entra }}>
        <Janela
          clipe={atual.clipe}
          t={atual.de + local / 30}
          largura={JANELA.w}
          altura={JANELA_CTA}
          camera={{ zoom: atual.zoom }}
          esqueleto={interpolate(local, [6, 22], [0, 1], lim)}
        />
        <Visor largura={JANELA.w} altura={JANELA_CTA} esquerda="● TEU VÍDEO AQUI" direita="ANALISANDO…" baixoEsquerda="10 VAGAS GRÁTIS" />
      </div>
      <div style={{ position: 'absolute', left: 60, right: 60, top: JANELA.top + JANELA_CTA + 66, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30 }}>
        <Legenda texto={'Os *10 primeiros* recebem\na análise de graça.'} em={24} tamanho={52} peso={600} />
        <div
          style={{
            transform: `scale(${(0.6 + 0.4 * botao) * pulsa})`,
            opacity: Math.min(1, botao * 1.4),
            background: COR.coral,
            color: COR.tinta,
            borderRadius: 999,
            padding: '18px 44px',
            fontFamily: FONTE_LEGENDA,
            fontSize: 54,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            whiteSpace: 'nowrap',
          }}
        >
          Comenta ANÁLISE 👇
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ---------------------------------------------------------------------------
//  Efeitos (npm run sfx). A trilha entra no Instagram (biblioteca livre).
// ---------------------------------------------------------------------------

/** Efeito gerado que não está no tipo do <Sfx> (congela, traco, clack, contador, medidor). */
function Efeito({ nome, em, volume = 0.7 }: { nome: string; em: number; volume?: number }) {
  return (
    <Sequence from={Math.round(em)} layout="none" name={`sfx:${nome}`}>
      <Html5Audio src={arquivoSfx(nome)} volume={volume * VOLUME_SFX} />
    </Sequence>
  );
}

function Efeitos() {
  const carimbo = Math.round(interpolate(T.vaca, T.lento, [CENA.analise, CENA.placar]));
  return (
    <>
      <Efeito nome="congela" em={16} />
      <Sfx nome="whoosh-grave" em={CENA.rewind} />
      <Efeito nome="traco" em={66} volume={0.5} />
      {NOTAS.map((n) => (
        <Sfx key={n.numero} nome="pop" em={n.em} volume={0.6} />
      ))}
      <Sfx nome="impacto" em={carimbo} volume={0.6} />
      <Sfx nome="whoosh" em={CENA.placar} />
      {JUIZES.map((_, i) => (
        <Sfx key={i} nome="tick" em={CENA.placar + 4 + i * 4} volume={0.5} />
      ))}
      <Efeito nome="clack" em={CENA.placar + 32} volume={0.5} />
      <Efeito nome="contador" em={CENA.placar + 64} volume={0.6} />
      <Sfx nome="whoosh" em={CENA.ideal} />
      <Sfx nome="brilho" em={CENA.ideal + 22} volume={0.6} />
      <Sfx nome="whoosh-curto" em={CENA.marca} />
      <Sfx nome="brilho" em={CENA.marca + 12} volume={0.5} />
      <Sfx nome="whoosh" em={CENA.cta} />
      <Sfx nome="notificacao" em={CENA.cta + 52} volume={0.6} />
    </>
  );
}
