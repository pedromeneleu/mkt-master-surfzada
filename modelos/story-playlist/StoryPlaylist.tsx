import { createContext, useContext } from 'react';
import { AbsoluteFill, Img, interpolate, useCurrentFrame } from 'remotion';

import { CHEGADA, COR, FONTE, SUAVE } from '@compartilhado/tema';

/**
 * Stories das playlists da surfzada no Spotify — 9:16, 16 s, em loop
 * perfeito, sem trilha (a música entra no Instagram, de preferência uma faixa
 * da própria playlist).
 *
 * O logo da surfzada em tamanho grande: o sol vira um vinil girando dentro
 * do anel coral, e a onda passa na frente. Por baixo, "tocando agora" passa as
 * primeiras faixas da playlist; no pé, "Ouça no Spotify" e setas apontando
 * para o lugar do sticker de link, que é colado no próprio Instagram.
 *
 * Cada playlist tem a sua vibe (VIBES): Teahupo'o é pesada (fundo tinta,
 * 120 BPM, tranco no disco, corte seco com glitch); Waikiki é leve (fundo
 * claro, 75 BPM, balanço longo, crossfade lento).
 *
 * Tudo é periódico na duração do loop (voltas, pulsos, ondas e faixas), então
 * o último quadro emenda no primeiro.
 *
 * Modelo: a peça passa `vibe` (um preset de VIBES), `dados` (dados.json, de
 * `npm run dados -- <peca>`) e `capa` (URL da capa 1:1, renderizada antes com
 * CapaPlaylist e copiada para public/ pelo `npm run render`).
 */

export interface Playlist {
  nome: string;
  musicas: number;
  duracao: string;
  faixas: { titulo: string; artista: string }[];
}

interface Vibe {
  /** Quantas faixas do começo da playlist passam no "tocando agora". */
  faixas: number;
  /** Quadros por batida e batidas por faixa. */
  batida: number;
  porFaixa: number;
  /** Quadros da troca de faixa. */
  troca: number;
  /** Corte seco com um eco coral deslocado (glitch) na troca. */
  glitch: boolean;
  /** Voltas do disco por loop. */
  voltas: number;
  /** Deslocamento (px) do disco a cada batida; 0 = sem tranco. */
  tranco: number;
  /** Uma onda sonora sai do sol a cada `pulsoACada` batidas e vive `vidaPulso` batidas. */
  pulsoACada: number;
  vidaPulso: number;
  /** Onda: ciclos por loop e amplitude (unidades do logo) do sobe-desce e da deriva; inclinação (graus). */
  onda: { sobe: number; amplitudeSobe: number; deriva: number; amplitudeDeriva: number; inclina: number };
  /** Ciclos por loop de cada barra do equalizador. */
  equalizador: number[];
  claro: boolean;
  titulo: [string, string];
}

export const VIBES = {
  teahupoo: {
    faixas: 8,
    batida: 15,
    porFaixa: 4,
    troca: 7,
    glitch: true,
    voltas: 8,
    tranco: 7,
    pulsoACada: 1,
    vidaPulso: 3,
    onda: { sobe: 16, amplitudeSobe: 12, deriva: 4, amplitudeDeriva: 20, inclina: 1.6 },
    equalizador: [71, 97, 59, 113, 83, 101, 67],
    claro: false,
    titulo: ['Pra quando o mar ', 'pesa.'],
  },
  waikiki: {
    faixas: 5,
    batida: 24,
    porFaixa: 4,
    troca: 30,
    glitch: false,
    voltas: 4,
    tranco: 0,
    pulsoACada: 2,
    vidaPulso: 5,
    onda: { sobe: 3, amplitudeSobe: 9, deriva: 2, amplitudeDeriva: 32, inclina: 0.8 },
    equalizador: [23, 31, 19, 29, 37],
    claro: true,
    titulo: ['Pra remar ', 'sem pressa.'],
  },
} satisfies Record<string, Vibe>;

export type IdVibe = keyof typeof VIBES;

export const duracaoPlaylist = (id: IdVibe) => {
  const v: Vibe = VIBES[id];
  return v.faixas * v.porFaixa * v.batida;
};

// ---------------------------------------------------------------------------
//  Vibe corrente, cores e relógio do loop
// ---------------------------------------------------------------------------

function paleta(claro: boolean) {
  return claro
    ? { fundo: COR.fundo, texto: COR.tinta, artista: COR.suave, meta: COR.apagado, trilho: 'rgba(10,10,10,0.1)', onda: COR.tinta, pontos: 'rgba(10,10,10,0.07)' }
    : { fundo: COR.tinta, texto: '#fff', artista: COR.apagado, meta: COR.suave, trilho: 'rgba(255,255,255,0.12)', onda: COR.fundo, pontos: 'rgba(255,255,255,0.05)' };
}

const Contexto = createContext<{ v: Vibe & { dados: Playlist }; id: IdVibe; capa: string } | null>(null);

function useVibe() {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error('useVibe fora de <StoryPlaylist>');
  const { v, id, capa } = contexto;
  const duracao = duracaoPlaylist(id);
  /** Ângulo (rad) de `k` ciclos inteiros por loop: garante a emenda. */
  const ciclo = (f: number, k: number) => (2 * Math.PI * k * f) / duracao;
  /** Pulso que cai a cada batida e decai até a próxima. */
  const pulso = (f: number) => (1 - (f % v.batida) / v.batida) ** 2;
  return { v, id, capa, duracao, ciclo, pulso, cor: paleta(v.claro) };
}

// Geometria do logo v2 (componentes/Marca.tsx), em unidades do desenho 1818×1003.
/** Crista da onda (o começo de ONDA), fechada por cima: recorta o anel, que some atrás dela como no logo. */
const ACIMA_DA_CRISTA = 'M0 800 C150 600 330 510 500 518 C700 528 850 700 1050 770 C1250 840 1500 800 1810 658 L1900 -600 L-100 -600 Z';
const ONDA =
  'M0 800 C150 600 330 510 500 518 C700 528 850 700 1050 770 C1250 840 1500 800 1810 658 C1650 900 1400 1000 1150 990 C900 980 650 800 450 730 C300 690 150 720 0 800 Z';
const CX = 942;
const CY = 445;
const R_DISCO = 300;
/** Raio do selo do vinil, onde gira a capa da playlist. */
const R_SELO = 150;
/** A onda desce em relação ao logo para mostrar mais do disco (o vinil é maior que o sol). */
const DESCE_ONDA = 70;

// O logo é desenhado em escala E, com o centro do sol no meio da tela.
const E = 0.86;
const TOPO_LOGO = 400;
const TX = 540 - CX * E;
const centroPx = { x: 540, y: TOPO_LOGO + CY * E };

/** Tranco do disco: um empurrão por batida, numa direção fixa por batida, que assenta antes da próxima. */
function useTranco() {
  const frame = useCurrentFrame();
  const { v, duracao } = useVibe();
  if (!v.tranco) return { x: 0, y: 0 };
  const n = Math.floor(frame / v.batida) % (duracao / v.batida);
  const ang = n * 2.399; // ângulo áureo: direções que não se repetem em sequência
  const forca = v.tranco * Math.exp(-(frame % v.batida) / 2.2);
  return { x: Math.cos(ang) * forca, y: Math.sin(ang) * forca };
}

// ---------------------------------------------------------------------------
//  Fundo
// ---------------------------------------------------------------------------

function Fundo() {
  const frame = useCurrentFrame();
  const { v, ciclo, pulso, cor } = useVibe();
  const respiro = Math.sin(ciclo(frame, 2));
  const fundo = v.claro
    ? `radial-gradient(60% 34% at 50% ${38 + respiro}%, rgba(255,122,89,${0.2 + 0.03 * respiro}), transparent 72%),
       linear-gradient(180deg, rgba(255,227,219,0.55), transparent 45%), ${cor.fundo}`
    : `radial-gradient(48% 30% at 50% ${40 + respiro}%, rgba(255,122,89,${0.18 + 0.06 * pulso(frame)}), transparent 72%),
       radial-gradient(70% 40% at 50% 112%, rgba(255,122,89,0.24), transparent 70%), ${cor.fundo}`;
  return (
    <AbsoluteFill style={{ background: fundo }}>
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(${cor.pontos} 1.2px, transparent 1.2px)`,
          backgroundSize: '34px 34px',
          maskImage: 'radial-gradient(60% 60% at 50% 45%, black, transparent)',
        }}
      />
    </AbsoluteFill>
  );
}

// ---------------------------------------------------------------------------
//  Disco-sol
// ---------------------------------------------------------------------------

function Disco() {
  const frame = useCurrentFrame();
  const { v, id, duracao, pulso } = useVibe();
  const tranco = useTranco();
  const giro = (360 * v.voltas * frame) / duracao;
  const batida = pulso(frame);
  const sulcos = Array.from({ length: 23 }, (_, i) => R_SELO + 14 + i * 5.6);
  const intervalo = v.pulsoACada * v.batida;
  const vida = v.vidaPulso * v.batida;
  const pulsos = Math.ceil(v.vidaPulso / v.pulsoACada);

  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
      <defs>
        <filter id={`brilho-anel-${id}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="28" />
        </filter>
        <clipPath id={`acima-da-crista-${id}`}>
          <path d={ACIMA_DA_CRISTA} transform={`translate(0 ${DESCE_ONDA + 14})`} />
        </clipPath>
      </defs>
      <g transform={`translate(${TX + tranco.x} ${TOPO_LOGO + tranco.y}) scale(${E})`}>
        {/* Ondas sonoras saindo do sol */}
        {Array.from({ length: pulsos }, (_, j) => {
          // A j-ésima onda viva nasceu j intervalos atrás: período = intervalo, que divide o loop.
          const idade = ((frame % intervalo) + j * intervalo) / vida;
          if (idade > 1) return null;
          return (
            <circle
              key={j}
              cx={CX}
              cy={CY}
              r={445 + idade * 300}
              fill="none"
              stroke={COR.coral}
              strokeWidth={v.glitch ? 9 : 6}
              opacity={(1 - idade) ** 2 * (v.claro ? 0.55 : 0.45)}
            />
          );
        })}

        {/* Anel do logo, com um brilho que bate no ritmo; some atrás da crista */}
        <g clipPath={`url(#acima-da-crista-${id})`}>
          <circle
            cx={CX}
            cy={CY}
            r={390}
            fill="none"
            stroke={COR.coral}
            strokeWidth={105}
            filter={`url(#brilho-anel-${id})`}
            opacity={(v.claro ? 0.2 : 0.25) + (v.claro ? 0.25 : 0.55) * batida}
          />
          <circle cx={CX} cy={CY} r={390} fill="none" stroke={COR.coral} strokeWidth={105} />
        </g>

        {/* O vinil */}
        <g transform={`rotate(${giro} ${CX} ${CY})`}>
          <circle cx={CX} cy={CY} r={R_DISCO} fill="#131313" />
          {sulcos.map((r, i) => (
            <circle
              key={r}
              cx={CX}
              cy={CY}
              r={r}
              fill="none"
              stroke="#fff"
              strokeOpacity={i % 6 === 5 ? 0.02 : 0.055}
              strokeWidth={i % 6 === 5 ? 4 : 1.6}
            />
          ))}
          {/* Reflexo preso ao disco: denuncia o giro */}
          <path d={`M${CX} ${CY} L${CX + 290} ${CY - 70} A300 300 0 0 1 ${CX + 290} ${CY + 70} Z`} fill="#fff" opacity={0.035} />
          {/* Aro coral do selo (a capa entra por cima, em Selo) */}
          <circle cx={CX} cy={CY} r={R_SELO + 5} fill={COR.coral} />
        </g>
      </g>
    </svg>
  );
}

/**
 * Selo do vinil: a capa da playlist (render 1:1 de CapaPlaylist, que o
 * `npm run render` copia para public/pecas/<slug>/capa.jpg antes do story),
 * recortada em círculo e girando com o disco. Em HTML, e não dentro do SVG, para o <Img> segurar o render até
 * a imagem carregar.
 */
function Selo() {
  const frame = useCurrentFrame();
  const { capa, v, duracao } = useVibe();
  const tranco = useTranco();
  const giro = (360 * v.voltas * frame) / duracao;
  const r = R_SELO * E;
  return (
    <div
      style={{
        position: 'absolute',
        left: centroPx.x - r + tranco.x,
        top: centroPx.y - r + tranco.y,
        width: 2 * r,
        height: 2 * r,
        borderRadius: '50%',
        overflow: 'hidden',
        transform: `rotate(${giro}deg)`,
        background: COR.tinta,
      }}
    >
      <Img src={capa} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      {/* Furo do eixo */}
      <div
        style={{
          position: 'absolute',
          left: r - 9,
          top: r - 9,
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: COR.tinta,
          boxShadow: `0 0 0 3px ${v.claro ? 'rgba(10,10,10,0.25)' : 'rgba(255,255,255,0.35)'}`,
        }}
      />
    </div>
  );
}

/** Brilho fixo por cima do vinil (luz do ambiente; não gira). */
function Reflexo() {
  const tranco = useTranco();
  const r = R_DISCO * E;
  return (
    <div
      style={{
        position: 'absolute',
        left: centroPx.x - r + tranco.x,
        top: centroPx.y - r + tranco.y,
        width: 2 * r,
        height: 2 * r,
        borderRadius: '50%',
        background:
          'conic-gradient(from 20deg, transparent 0deg, rgba(255,255,255,0.09) 30deg, transparent 70deg, transparent 180deg, rgba(255,255,255,0.07) 210deg, transparent 250deg)',
        WebkitMaskImage: `radial-gradient(circle, transparent ${((R_SELO + 5) / R_DISCO) * 100}%, black ${((R_SELO + 10) / R_DISCO) * 100}%)`,
        maskImage: `radial-gradient(circle, transparent ${((R_SELO + 5) / R_DISCO) * 100}%, black ${((R_SELO + 10) / R_DISCO) * 100}%)`,
      }}
    />
  );
}

/** A onda do logo na frente do disco, balançando; uma cópia coral atrás, em contrafase. */
function Onda() {
  const frame = useCurrentFrame();
  const { v, id, ciclo, cor } = useVibe();
  const o = v.onda;
  const sobe = Math.sin(ciclo(frame, o.sobe));
  const deriva = Math.sin(ciclo(frame, o.deriva));
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
      <defs>
        <linearGradient id={`corpo-onda-${id}`} x1="0" y1="560" x2="0" y2="1000" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={cor.onda} />
          <stop offset="0.62" stopColor={cor.onda} stopOpacity={0.97} />
          <stop offset="1" stopColor={cor.onda} stopOpacity={0} />
        </linearGradient>
        <linearGradient id={`corpo-onda-coral-${id}`} x1="0" y1="560" x2="0" y2="1000" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={COR.coral} stopOpacity={0.45} />
          <stop offset="1" stopColor={COR.coral} stopOpacity={0} />
        </linearGradient>
      </defs>
      <g transform={`translate(${TX} ${TOPO_LOGO + DESCE_ONDA * E}) scale(${E})`}>
        <path
          d={ONDA}
          fill={`url(#corpo-onda-coral-${id})`}
          transform={`translate(${-30 - deriva * o.amplitudeDeriva * 1.4} ${-34 - sobe * o.amplitudeSobe})`}
        />
        <path
          d={ONDA}
          fill={`url(#corpo-onda-${id})`}
          transform={`translate(${deriva * o.amplitudeDeriva} ${sobe * o.amplitudeSobe}) rotate(${deriva * o.inclina} 942 800)`}
        />
      </g>
    </svg>
  );
}

// ---------------------------------------------------------------------------
//  Tocando agora
// ---------------------------------------------------------------------------

function Equalizador() {
  const frame = useCurrentFrame();
  const { v, ciclo, pulso } = useVibe();
  const batida = pulso(frame);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 30 }}>
      {v.equalizador.map((k, i) => {
        const h = 0.25 + 0.5 * Math.abs(Math.sin(ciclo(frame, k) + i)) + 0.25 * batida;
        return <span key={k} style={{ width: 6, height: 30 * h, borderRadius: 3, background: COR.coral }} />;
      })}
    </div>
  );
}

function Faixa({ indice, y, opacidade, eco = 0 }: { indice: number; y: number; opacidade: number; eco?: number }) {
  const { v, cor } = useVibe();
  const f = v.dados.faixas[indice];
  const titulo = { fontSize: 54, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } as const;
  return (
    <div style={{ position: 'absolute', inset: 0, transform: `translateY(${y}px)`, opacity: opacidade }}>
      {/* Eco coral deslocado: o glitch do corte seco */}
      {eco !== 0 && (
        <div style={{ ...titulo, position: 'absolute', left: eco, top: 0, right: 0, color: COR.coral, opacity: 0.85 }}>{f.titulo}</div>
      )}
      <div style={{ ...titulo, position: 'relative', color: cor.texto, transform: `translateX(${-eco * 0.4}px)` }}>{f.titulo}</div>
      <div style={{ fontSize: 32, fontWeight: 400, color: cor.artista, marginTop: 4 }}>{f.artista}</div>
    </div>
  );
}

function TocandoAgora() {
  const frame = useCurrentFrame();
  const { v, cor } = useVibe();
  const porFaixa = v.porFaixa * v.batida;
  const atual = Math.floor(frame / porFaixa) % v.faixas;
  const proxima = (atual + 1) % v.faixas;
  const local = frame % porFaixa;
  const t = interpolate(local, [porFaixa - v.troca, porFaixa], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: v.glitch ? CHEGADA : SUAVE,
  });
  const progresso = interpolate(local, [0, porFaixa - v.troca], [0, 1], { extrapolateRight: 'clamp' });

  // Pesada: corte seco (sobe pouco e rápido) e eco coral que treme nos primeiros quadros da faixa nova.
  // Leve: crossfade lento, a faixa nova sobe devagar por baixo.
  const curso = v.glitch ? 40 : 120;
  const eco = v.glitch && local < 6 ? (local % 2 ? -1 : 1) * (12 - local * 2) : 0;

  return (
    <div style={{ position: 'absolute', left: 70, right: 70, top: 1318 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Equalizador />
          <span style={{ fontSize: 24, fontWeight: 600, letterSpacing: '0.16em', color: v.claro ? COR.coralTexto : COR.coral }}>TOCANDO AGORA</span>
        </div>
        <span style={{ fontSize: 24, fontWeight: 500, color: cor.meta }}>
          {v.dados.musicas} músicas · {v.dados.duracao}
        </span>
      </div>
      <div style={{ position: 'relative', height: 118, marginTop: 18, overflow: 'hidden' }}>
        {v.glitch ? (
          <>
            {t < 1 && <Faixa indice={atual} y={-curso * t} opacidade={1 - t} eco={eco} />}
            {t > 0 && <Faixa indice={proxima} y={curso * (1 - t)} opacidade={t} />}
          </>
        ) : (
          <>
            <Faixa indice={atual} y={-curso * t} opacidade={1 - Math.min(1, t * 1.6)} />
            {t > 0 && <Faixa indice={proxima} y={curso * (1 - t)} opacidade={Math.max(0, t * 1.6 - 0.6)} />}
          </>
        )}
      </div>
      <div style={{ position: 'relative', height: 5, marginTop: 14, borderRadius: 3, background: cor.trilho }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${progresso * 100}%`, borderRadius: 3, background: COR.coral, opacity: 1 - t }} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
//  Chamada para o sticker de link
// ---------------------------------------------------------------------------

function IconeSpotify({ tamanho }: { tamanho: number }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <circle cx={12} cy={12} r={12} fill="#1DB954" />
      <g fill="none" stroke="#000" strokeLinecap="round">
        <path d="M6.2 9.3 C10 8.1 14.6 8.5 18 10.4" strokeWidth={2} />
        <path d="M6.9 12.5 C10.1 11.6 13.8 12 16.6 13.7" strokeWidth={1.7} />
        <path d="M7.6 15.6 C10.2 14.9 13 15.2 15.3 16.5" strokeWidth={1.4} />
      </g>
    </svg>
  );
}

/** Y do centro do lugar do sticker (acima da barra de resposta do story). */
const STICKER_Y = 1715;

function Chamada() {
  const frame = useCurrentFrame();
  const { v, duracao, ciclo, pulso, cor } = useVibe();
  const batida = pulso(frame);
  // As setas pulam a cada duas batidas.
  const pulo = Math.abs(Math.sin(ciclo(frame, duracao / (2 * v.batida))));
  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: 1538,
          left: 0,
          right: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 18,
          fontSize: 42,
          fontWeight: 600,
          letterSpacing: '-0.01em',
          color: cor.texto,
        }}
      >
        <IconeSpotify tamanho={52} />
        Ouça no <span style={{ color: v.claro ? cor.texto : '#1DB954', marginLeft: -6 }}>Spotify</span>
      </div>

      {/* Setas em cascata */}
      <svg width={80} height={70} viewBox="0 0 80 70" style={{ position: 'absolute', left: 500, top: 1606 + pulo * 10 }}>
        {[0, 1].map((i) => (
          <path
            key={i}
            d={`M18 ${10 + i * 22} L40 ${30 + i * 22} L62 ${10 + i * 22}`}
            fill="none"
            stroke={COR.coral}
            strokeWidth={7}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={i === 0 ? 0.45 + 0.3 * (1 - pulo) : 0.7 + 0.3 * pulo}
          />
        ))}
      </svg>

      {/* Halo onde o sticker de link é colado */}
      <div
        style={{
          position: 'absolute',
          left: 540 - 300,
          top: STICKER_Y - 80,
          width: 600,
          height: 160,
          borderRadius: 999,
          background: `radial-gradient(50% 50% at 50% 50%, rgba(255,122,89,${0.22 + 0.18 * batida}), transparent 75%)`,
        }}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
//  Story
// ---------------------------------------------------------------------------

function Story() {
  const { v, cor } = useVibe();
  return (
    <AbsoluteFill style={{ fontFamily: FONTE, color: cor.texto }}>
      <Fundo />

      {/* Cabeçalho */}
      <div style={{ position: 'absolute', top: 232, left: 70, right: 70, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            fontSize: 25,
            fontWeight: 600,
            letterSpacing: '0.16em',
            color: v.claro ? COR.coralTexto : COR.coral,
          }}
        >
          <span style={{ width: 46, height: 3, borderRadius: 2, background: COR.coral }} />
          PLAYLIST · {v.dados.nome.toUpperCase()}
        </div>
        <div style={{ fontSize: 80, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.05, whiteSpace: 'nowrap' }}>
          {v.titulo[0]}
          <span style={{ color: COR.coral }}>{v.titulo[1]}</span>
        </div>
      </div>

      <Disco />
      <Selo />
      <Reflexo />
      <Onda />
      <TocandoAgora />
      <Chamada />
    </AbsoluteFill>
  );
}

export type PropsStoryPlaylist = {
  vibe: IdVibe;
  dados: Playlist;
  /** URL da capa 1:1 (ex.: arquivo('capa.jpg')), que gira no selo do disco. */
  capa: string;
};

export function StoryPlaylist({ vibe, dados, capa }: PropsStoryPlaylist) {
  return (
    <Contexto.Provider value={{ v: { ...VIBES[vibe], dados }, id: vibe, capa }}>
      <Story />
    </Contexto.Provider>
  );
}
