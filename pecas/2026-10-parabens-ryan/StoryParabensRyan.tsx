import type { CSSProperties, ReactNode } from 'react';
import { AbsoluteFill, Img, Sequence, interpolate, random, spring, useCurrentFrame, useVideoConfig } from 'remotion';

import { Sfx } from '@compartilhado/componentes/Sfx';
import { Simbolo, Wordmark } from '@compartilhado/marca/Marca';
import { CHEGADA, COR, FONTE, SUAVE } from '@compartilhado/tema';
import { arquivosDaPeca } from '@compartilhado/util/arquivos';

export const SLUG = '2026-10-parabens-ryan';
/** Fotos da WSL em public/pecas/2026-10-parabens-ryan/fotos/ (Drive; créditos em creditos.json). */
const arquivo = arquivosDaPeca(SLUG);

/**
 * Story de parabéns ao Ryan Kainalo, campeão do Banco do Brasil São Sebastião
 * Pro (Maresias, 03/10/2026, etapa 3 do Challenger Series), que com a vitória
 * assumiu o 1º lugar do ranking. 9:16, 16 s, sem trilha (a música entra no
 * Instagram), com os efeitos sintetizados no ritmo de 120 BPM (15 quadros).
 *
 * 1. Parabéns: a comemoração com a bandeira, fechada no rosto.
 * 2. A final: placar contando até 14,50 × 5,83 contra Alister Reginato.
 * 3. Semifinal: o aéreo full rotation de 8,50, a maior nota do dia.
 * 4. Ranking: "1º" gigante, +10.000 pontos, rumo ao CT 2027.
 * 5. Fim: a comemoração aberta, confete e o logo da surfzada.
 *
 * As trocas de cena ficam escondidas por uma faixa coral que cruza a tela.
 * Fotos da WSL no Drive (assets.json), com crédito em cada cena (creditos.json).
 */

const BATIDA = 15;
const CENAS = [6, 7, 6, 7, 6].map((b) => b * BATIDA);
const INICIO = CENAS.map((_, i) => CENAS.slice(0, i).reduce((a, b) => a + b, 0));
export const DURACAO_PARABENS = CENAS.reduce((a, b) => a + b, 0);

const MARGEM = 72;
const PRESO = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const num = (x: number, casas = 2) => x.toFixed(casas).replace('.', ',');

// ---------------------------------------------------------------------------
//  Peças
// ---------------------------------------------------------------------------

/** Foto em tela cheia, com zoom lento (Ken Burns) e escurecida para o texto. */
function Foto({
  src,
  foco,
  dur,
  zoom,
  deriva = [0, 0],
  escuro,
  filtro,
}: {
  src: string;
  foco: string;
  dur: number;
  zoom: [number, number];
  deriva?: [number, number];
  escuro: string;
  filtro?: string;
}) {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, dur], [0, 1], PRESO);
  const escala = zoom[0] + (zoom[1] - zoom[0]) * p;
  return (
    <AbsoluteFill style={{ overflow: 'hidden', background: COR.tinta }}>
      <Img
        src={arquivo(`fotos/${src}`)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: foco,
          transform: `scale(${escala}) translate(${deriva[0] * p}px, ${deriva[1] * p}px)`,
          filter: filtro,
        }}
      />
      <AbsoluteFill style={{ background: escuro }} />
    </AbsoluteFill>
  );
}

/** Texto que sobe de dentro de uma máscara. */
function Sobe({ em, children, style }: { em: number; children: ReactNode; style?: CSSProperties }) {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [em, em + 14], [0, 1], { ...PRESO, easing: CHEGADA });
  return (
    <div style={{ overflow: 'hidden', paddingBottom: '0.14em', marginBottom: '-0.14em', ...style }}>
      <div style={{ transform: `translateY(${(1 - t) * 115}%)` }}>{children}</div>
    </div>
  );
}

/** Rótulo em caixa alta com o traço coral, como nos slides e nas capas. */
function Rotulo({ em, children }: { em: number; children: ReactNode }) {
  const frame = useCurrentFrame();
  const traco = interpolate(frame, [em, em + 12], [0, 1], { ...PRESO, easing: CHEGADA });
  const texto = interpolate(frame, [em + 4, em + 16], [0, 1], { ...PRESO, easing: CHEGADA });
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 28, fontWeight: 600, letterSpacing: '0.16em', color: COR.coral }}>
      <span style={{ width: 56 * traco, height: 4, borderRadius: 2, background: COR.coral }} />
      <span style={{ opacity: texto, transform: `translateX(${(1 - texto) * -16}px)` }}>{children}</span>
    </div>
  );
}

/** Crédito da foto na vertical, junto à borda direita. */
function Credito({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        position: 'absolute',
        right: 26,
        top: 760,
        writingMode: 'vertical-rl',
        transform: 'rotate(180deg)',
        fontSize: 17,
        fontWeight: 500,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        color: 'rgba(255,255,255,0.62)',
      }}
    >
      Foto: {children}
    </div>
  );
}

/** Número que conta de 0 até `valor` entre `em` e `em + dur`. */
function Contador({ valor, em, dur, casas = 2 }: { valor: number; em: number; dur: number; casas?: number }) {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [em, em + dur], [0, 1], { ...PRESO, easing: CHEGADA });
  return <>{num(valor * t, casas)}</>;
}

/** Faixa coral que cruza a tela na diagonal e esconde o corte entre as cenas. */
function Cortina({ em }: { em: number }) {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [em - 9, em + 9], [0, 1], { ...PRESO, easing: SUAVE });
  if (t <= 0 || t >= 1) return null;
  const x = -2300 + t * 3700;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', top: -200, left: x - 90, width: 60, height: 2320, background: COR.superficie, transform: 'skewX(-14deg)' }} />
      <div style={{ position: 'absolute', top: -200, left: x, width: 2000, height: 2320, background: COR.coral, transform: 'skewX(-14deg)' }} />
    </AbsoluteFill>
  );
}

/** Flash branco curto, no impacto. */
function Flash({ em, forca = 0.85 }: { em: number; forca?: number }) {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [em, em + 2, em + 12], [0, forca, 0], PRESO);
  return <AbsoluteFill style={{ background: COR.superficie, opacity: o, pointerEvents: 'none' }} />;
}

// ---------------------------------------------------------------------------
//  Cenas
// ---------------------------------------------------------------------------

const TITULO: CSSProperties = {
  fontWeight: 600,
  letterSpacing: '-0.045em',
  lineHeight: 0.95,
  color: COR.superficie,
  textShadow: '0 4px 30px rgba(10,10,10,0.45)',
};

function CenaParabens({ dur }: { dur: number }) {
  return (
    <AbsoluteFill style={{ fontFamily: FONTE }}>
      <Foto
        src="comemoracao.jpg"
        foco="50% 30%"
        dur={dur}
        zoom={[1.42, 1.3]}
        deriva={[0, 18]}
        escuro="linear-gradient(180deg, rgba(10,10,10,0.35) 0%, transparent 18%, transparent 38%, rgba(10,10,10,0.7) 54%, rgba(10,10,10,0.9) 66%, rgba(10,10,10,0.94) 100%)"
      />
      <Flash em={0} />
      <div style={{ position: 'absolute', left: MARGEM, right: MARGEM, top: 1170 }}>
        <Rotulo em={6}>SÃO SEBASTIÃO PRO · MARESIAS</Rotulo>
        <Sobe em={10} style={{ marginTop: 26 }}>
          <div style={{ ...TITULO, fontSize: 150 }}>Parabéns,</div>
        </Sobe>
        <Sobe em={16}>
          <div style={{ ...TITULO, fontSize: 250, color: COR.coral }}>Ryan!</div>
        </Sobe>
        <Sobe em={30} style={{ marginTop: 22 }}>
          <div style={{ fontSize: 44, fontWeight: 500, letterSpacing: '-0.01em', color: COR.superficie }}>
            Campeão em Maresias, de praia lotada.
          </div>
        </Sobe>
      </div>
      <Credito>WSL / Thiago Diz</Credito>
    </AbsoluteFill>
  );
}

function LinhaPlacar({
  em,
  nome,
  pais,
  total,
  ondas,
  vencedor,
}: {
  em: number;
  nome: string;
  pais: string;
  total: number;
  ondas: string;
  vencedor: boolean;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entra = spring({ frame: frame - em, fps, config: { damping: 16, stiffness: 140 } });
  const cor = vencedor ? COR.tinta : COR.superficie;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '26px 34px',
        borderRadius: 28,
        background: vencedor ? COR.coral : 'rgba(255,255,255,0.1)',
        border: vencedor ? 'none' : '2px solid rgba(255,255,255,0.18)',
        opacity: entra,
        transform: `translateX(${(1 - entra) * -120}px)`,
        color: cor,
      }}
    >
      <div>
        <div style={{ fontSize: 40, fontWeight: 600, letterSpacing: '-0.01em' }}>{nome}</div>
        <div style={{ marginTop: 6, fontSize: 24, fontWeight: 500, letterSpacing: '0.12em', opacity: 0.75 }}>
          {pais} · {ondas}
        </div>
      </div>
      <div style={{ fontSize: 96, fontWeight: 600, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums' }}>
        <Contador valor={total} em={em + 6} dur={24} />
      </div>
    </div>
  );
}

function CenaFinal({ dur }: { dur: number }) {
  return (
    <AbsoluteFill style={{ fontFamily: FONTE }}>
      <Foto
        src="batida.jpg"
        foco="52% 50%"
        dur={dur}
        zoom={[1.08, 1.2]}
        deriva={[-20, 0]}
        escuro="linear-gradient(180deg, rgba(10,10,10,0.88) 0%, rgba(10,10,10,0.72) 24%, rgba(10,10,10,0.3) 36%, transparent 44%, transparent 52%, rgba(10,10,10,0.75) 64%, rgba(10,10,10,0.9) 100%)"
      />
      <div style={{ position: 'absolute', left: MARGEM, right: MARGEM, top: 270 }}>
        <Rotulo em={8}>A FINAL</Rotulo>
        <Sobe em={12} style={{ marginTop: 22 }}>
          <div style={{ ...TITULO, fontSize: 118 }}>Uma final</div>
        </Sobe>
        <Sobe em={18}>
          <div style={{ ...TITULO, fontSize: 118, color: COR.coral }}>dominada.</div>
        </Sobe>
      </div>
      <div style={{ position: 'absolute', left: MARGEM, right: MARGEM, top: 1250, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <LinhaPlacar em={26} nome="Ryan Kainalo" pais="BRA" ondas="7,67 + 6,83" total={14.5} vencedor />
        <LinhaPlacar em={34} nome="Alister Reginato" pais="AUS" ondas="vice" total={5.83} vencedor={false} />
      </div>
      <Credito>WSL / Thiago Diz</Credito>
    </AbsoluteFill>
  );
}

/** Seta circular que se desenha numa volta inteira: o "full rotation". */
function Volta({ em, tamanho }: { em: number; tamanho: number }) {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [em, em + 22], [0, 1], { ...PRESO, easing: CHEGADA });
  const r = 44;
  const a = -90 + t * 330;
  const rad = (a * Math.PI) / 180;
  const px = 60 + r * Math.cos(rad);
  const py = 60 + r * Math.sin(rad);
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 120 120" style={{ transform: `rotate(${t * 30}deg)` }}>
      <circle
        cx={60}
        cy={60}
        r={r}
        fill="none"
        stroke={COR.coral}
        strokeWidth={9}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={`${t * (330 / 360)} 1`}
        transform="rotate(-90 60 60)"
      />
      {t > 0.05 && (
        <path
          d="M -11 -9 L 9 0 L -11 9 Z"
          fill={COR.coral}
          transform={`translate(${px} ${py}) rotate(${a + 90})`}
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

function CenaAereo({ dur }: { dur: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const nota = spring({ frame: frame - 14, fps, config: { damping: 12, stiffness: 150 } });
  return (
    <AbsoluteFill style={{ fontFamily: FONTE }}>
      <Foto
        src="aereo.jpg"
        foco="47% 40%"
        dur={dur}
        zoom={[1.12, 1.26]}
        deriva={[0, -24]}
        escuro="linear-gradient(180deg, rgba(10,10,10,0.35) 0%, transparent 16%, transparent 48%, rgba(10,10,10,0.8) 66%, rgba(10,10,10,0.92) 100%)"
      />
      <div style={{ position: 'absolute', left: MARGEM, right: MARGEM, top: 1110 }}>
        <Rotulo em={6}>SEMIFINAL</Rotulo>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, marginTop: 10 }}>
          <div
            style={{
              ...TITULO,
              fontSize: 260,
              fontVariantNumeric: 'tabular-nums',
              transform: `scale(${0.6 + 0.4 * nota})`,
              transformOrigin: 'left center',
              opacity: Math.min(1, nota * 1.5),
            }}
          >
            <Contador valor={8.5} em={14} dur={20} />
          </div>
          <Volta em={18} tamanho={170} />
        </div>
        <Sobe em={28} style={{ marginTop: 6 }}>
          <div style={{ fontSize: 50, fontWeight: 600, letterSpacing: '-0.02em', color: COR.superficie }}>Aéreo full rotation, sem grab.</div>
        </Sobe>
        <Sobe em={34} style={{ marginTop: 4 }}>
          <div style={{ fontSize: 50, fontWeight: 600, letterSpacing: '-0.02em', color: COR.coral }}>A maior nota do dia.</div>
        </Sobe>
      </div>
      <Credito>WSL / Ana Catarina</Credito>
    </AbsoluteFill>
  );
}

function Selo({ em, children, destaque = false }: { em: number; children: ReactNode; destaque?: boolean }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - em, fps, config: { damping: 14, stiffness: 160 } });
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 12,
        padding: '18px 30px',
        borderRadius: 999,
        fontSize: 36,
        fontWeight: 600,
        letterSpacing: '-0.01em',
        background: destaque ? COR.coral : 'rgba(255,255,255,0.1)',
        border: destaque ? 'none' : '2px solid rgba(255,255,255,0.22)',
        color: destaque ? COR.tinta : COR.superficie,
        opacity: s,
        transform: `translateY(${(1 - s) * 40}px) scale(${0.9 + 0.1 * s})`,
      }}
    >
      {children}
    </div>
  );
}

function CenaRanking({ dur }: { dur: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const um = spring({ frame: frame - 10, fps, config: { damping: 11, stiffness: 120 } });
  const brilho = interpolate(frame, [10, 30, dur], [0, 1, 0.75], PRESO);
  return (
    <AbsoluteFill style={{ fontFamily: FONTE, background: COR.tinta }}>
      {/* O troféu, desfocado e apagado, por trás */}
      <Foto
        src="trofeu.jpg"
        foco="50% 50%"
        dur={dur}
        zoom={[1.15, 1.25]}
        escuro="rgba(10,10,10,0.72)"
        filtro="grayscale(0.6) blur(6px)"
      />
      <AbsoluteFill
        style={{ background: `radial-gradient(60% 40% at 50% 46%, rgba(255,122,89,${0.32 * brilho}), transparent 70%)` }}
      />
      <div style={{ position: 'absolute', left: MARGEM, right: MARGEM, top: 300 }}>
        <Rotulo em={4}>CHALLENGER SERIES 2026</Rotulo>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 430,
          textAlign: 'center',
          ...TITULO,
          fontSize: 600,
          lineHeight: 1,
          color: COR.coral,
          opacity: Math.min(1, um * 1.4),
          transform: `scale(${0.4 + 0.6 * um})`,
          textShadow: '0 30px 80px rgba(255,122,89,0.35)',
        }}
      >
        1º
      </div>
      <div style={{ position: 'absolute', left: MARGEM, right: MARGEM, top: 1080, textAlign: 'center' }}>
        <Sobe em={22}>
          <div style={{ ...TITULO, fontSize: 84, letterSpacing: '-0.03em' }}>no ranking do</div>
        </Sobe>
        <Sobe em={27}>
          <div style={{ ...TITULO, fontSize: 84, letterSpacing: '-0.03em' }}>Challenger Series</div>
        </Sobe>
        <div style={{ marginTop: 56, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
          <Selo em={40}>+10.000 pontos em Maresias</Selo>
          <Selo em={48} destaque>
            Rumo ao CT 2027 →
          </Selo>
        </div>
      </div>
      <Credito>WSL / Thiago Diz</Credito>
    </AbsoluteFill>
  );
}

/** Confete caindo de cima, sorteado com semente (o mesmo em todo render). */
function Confete({ em, quantos = 90 }: { em: number; quantos?: number }) {
  const frame = useCurrentFrame();
  const f = frame - em;
  if (f < 0) return null;
  const cores = [COR.coral, COR.superficie, COR.coralClaro, '#ffd23f', '#22b25a', COR.coral];
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {Array.from({ length: quantos }, (_, i) => {
        const r = (k: string) => random(`confete-${i}-${k}`);
        const atraso = r('atraso') * 18;
        const t = f - atraso;
        if (t < 0) return null;
        const x0 = r('x') * 1080;
        const vy = 9 + r('vy') * 9;
        const y = -60 + t * vy + 0.05 * t * t;
        const x = x0 + Math.sin(t / (6 + r('osc') * 6) + r('fase') * 6) * (20 + r('amp') * 30);
        const giro = t * (6 + r('giro') * 12) * (r('lado') > 0.5 ? 1 : -1);
        const vira = Math.cos(t / (3 + r('vira') * 4));
        const larg = 14 + r('l') * 12;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: larg,
              height: larg * 0.55,
              borderRadius: 3,
              background: cores[i % cores.length],
              transform: `rotate(${giro}deg) scaleY(${vira})`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
}

function CenaFim({ dur }: { dur: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const site = spring({ frame: frame - 40, fps, config: { damping: 200 } });
  return (
    <AbsoluteFill style={{ fontFamily: FONTE }}>
      <Foto
        src="comemoracao.jpg"
        foco="50% 30%"
        dur={dur}
        zoom={[1.0, 1.08]}
        escuro="linear-gradient(180deg, rgba(10,10,10,0.3) 0%, transparent 16%, transparent 38%, rgba(10,10,10,0.72) 52%, rgba(10,10,10,0.9) 64%, rgba(10,10,10,0.95) 100%)"
      />
      <Confete em={0} />
      <div style={{ position: 'absolute', left: MARGEM, right: MARGEM, top: 1130 }}>
        <Rotulo em={6}>RYAN KAINALO · 20 ANOS</Rotulo>
        <Sobe em={10} style={{ marginTop: 24 }}>
          <div style={{ ...TITULO, fontSize: 112 }}>De Ubatuba pro</div>
        </Sobe>
        <Sobe em={16}>
          <div style={{ ...TITULO, fontSize: 112, color: COR.coral }}>topo do ranking.</div>
        </Sobe>
      </div>
      <div
        style={{
          position: 'absolute',
          left: MARGEM,
          right: MARGEM,
          top: 1500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Simbolo largura={104} em={30} cor={COR.superficie} />
          <div style={{ opacity: site, transform: `translateX(${(1 - site) * -20}px)` }}>
            <Wordmark tamanho={50} cor={COR.superficie} />
          </div>
        </div>
        <div style={{ opacity: site, fontSize: 30, fontWeight: 500, color: 'rgba(255,255,255,0.8)' }}>surfzada.com.br</div>
      </div>
      <Credito>WSL / Thiago Diz</Credito>
    </AbsoluteFill>
  );
}

// ---------------------------------------------------------------------------
//  Montagem
// ---------------------------------------------------------------------------

const COMPONENTES = [CenaParabens, CenaFinal, CenaAereo, CenaRanking, CenaFim];

export function StoryParabensRyan() {
  const [, final, aereo, ranking, fim] = INICIO;
  return (
    <AbsoluteFill style={{ background: COR.tinta }}>
      {COMPONENTES.map((Cena, i) => (
        <Sequence key={i} from={INICIO[i]} durationInFrames={CENAS[i]} name={Cena.name}>
          <Cena dur={CENAS[i]} />
        </Sequence>
      ))}
      {INICIO.slice(1).map((em) => (
        <Cortina key={em} em={em} />
      ))}

      {/* Efeitos */}
      <Sfx nome="impacto" em={0} volume={0.8} />
      <Sfx nome="pop" em={16} />
      <Sfx nome="brilho" em={30} volume={0.5} />
      {INICIO.slice(1).map((em) => (
        <Sfx key={em} nome="whoosh" em={em - 9} volume={0.6} />
      ))}
      <Sfx nome="pop" em={final + 26} />
      <Sfx nome="pop" em={final + 34} volume={0.5} />
      {Array.from({ length: 8 }, (_, i) => (
        <Sfx key={i} nome="tick" em={final + 32 + i * 3} volume={0.35} />
      ))}
      <Sfx nome="impacto" em={aereo + 14} volume={0.6} />
      <Sfx nome="whoosh-curto" em={aereo + 18} volume={0.5} />
      <Sfx nome="impacto" em={ranking + 10} volume={0.9} />
      <Sfx nome="pop-agudo" em={ranking + 40} />
      <Sfx nome="pop-agudo" em={ranking + 48} />
      <Sfx nome="brilho" em={fim} volume={0.7} />
      <Sfx nome="whoosh-grave" em={fim + 30} volume={0.5} />
    </AbsoluteFill>
  );
}
