import type { CSSProperties, ReactNode } from 'react';
import { Audio, interpolate, Sequence, spring, useCurrentFrame, useVideoConfig } from 'remotion';

import { bocaFalando, type Boca } from '@compartilhado/personagens/andy';
import { arquivoSfx } from '@compartilhado/util/arquivos';
import { CHEGADA, COR, FONTE, FPS } from '../tema';
import { duracaoFala, f, FALAS, falaNoInstante, inicioCena, type NomeCena } from './tempos';

/** Segundos no tempo do episódio, dentro de uma cena (as cenas começam do frame 0). */
export function useSegundos(cena: NomeCena) {
  const frame = useCurrentFrame();
  return (frame + inicioCena(cena)) / FPS;
}

/** Boca do Andy no instante: fala o texto da fala no ar, esticado para caber na duração dela. */
export function bocaDoAndy(segundos: number): Boca | undefined {
  const agora = falaNoInstante(segundos);
  if (!agora) return undefined;
  const letras = agora.fala.texto.length;
  return bocaFalando(agora.fala.texto, agora.decorrido, letras / duracaoFala(agora.fala));
}

/** 0 no meio de uma fala, 1 longe de qualquer fala (rampa de 0,25 s). Para o ducking do ambiente. */
export function silencio(segundos: number) {
  let v = 1;
  for (const fala of FALAS) {
    const a = fala.inicio;
    const b = fala.inicio + duracaoFala(fala);
    const d = segundos < a ? a - segundos : segundos > b ? segundos - b : 0;
    v = Math.min(v, Math.min(1, d / 0.25));
  }
  return v;
}

/** Um efeito em `em` segundos (tempo da cena em que está). */
export function Sfx({ som, em, volume = 1 }: { som: string; em: number; volume?: number }) {
  return (
    <Sequence from={f(em)} layout="none">
      <Audio src={arquivoSfx(som)} volume={volume} />
    </Sequence>
  );
}

/**
 * Ambiente em loop durante a cena, com entrada e saída suaves e abaixando
 * quando o Andy fala (ducking). `cena` define o tempo das falas.
 */
export function Ambiente({ som, cena, volume = 0.5, duracao }: { som: string; cena: NomeCena; volume?: number; duracao: number }) {
  return (
    <Audio
      src={arquivoSfx(som)}
      loop
      volume={(fr) => {
        const s = (fr + inicioCena(cena)) / FPS;
        const bordas = Math.min(1, fr / 12, (duracao - fr) / 12);
        return volume * Math.max(0, bordas) * (0.35 + 0.65 * silencio(s));
      }}
    />
  );
}

const sombra = '0 4px 18px rgba(10,10,10,0.35)';

/**
 * Texto grande que entra com um "pop". Trechos entre *asteriscos* ficam em
 * coral. `claro` = texto escuro sobre fundo claro.
 */
export function Titulo({
  children,
  em = 0,
  ate,
  y = 320,
  tamanho = 76,
  claro = false,
  estilo,
}: {
  children: string;
  em?: number;
  ate?: number;
  y?: number;
  tamanho?: number;
  claro?: boolean;
  estilo?: CSSProperties;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entra = spring({ frame: frame - f(em), fps, config: { damping: 12, stiffness: 170 } });
  const sai = ate === undefined ? 0 : interpolate(frame, [f(ate) - 6, f(ate)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  if (frame < f(em)) return null;
  const partes = children.split('*');
  return (
    <div
      style={{
        position: 'absolute',
        top: y,
        left: 70,
        right: 70,
        textAlign: 'center',
        fontFamily: FONTE,
        fontWeight: 700,
        fontSize: tamanho,
        lineHeight: 1.08,
        letterSpacing: '-0.02em',
        color: claro ? COR.tinta : '#fff',
        textShadow: claro ? 'none' : sombra,
        opacity: (1 - sai) * Math.min(1, entra * 1.5),
        transform: `scale(${0.8 + 0.2 * entra}) translateY(${(1 - entra) * 30}px)`,
        ...estilo,
      }}
    >
      {partes.map((p, i) => (
        <span key={i} style={{ color: i % 2 ? COR.coral : undefined }}>
          {p}
        </span>
      ))}
    </div>
  );
}

/** Rótulo pequeno (chip) posicionado em px na tela. */
export function Chip({ children, x, y, em = 0, cor = COR.tinta, fundo = '#fff' }: { children: ReactNode; x: number; y: number; em?: number; cor?: string; fundo?: string }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - f(em), fps, config: { damping: 14, stiffness: 200 } });
  if (frame < f(em)) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${s})`,
        background: fundo,
        color: cor,
        fontFamily: FONTE,
        fontWeight: 600,
        fontSize: 34,
        padding: '10px 22px',
        borderRadius: 999,
        whiteSpace: 'nowrap',
        boxShadow: '0 6px 20px rgba(10,10,10,0.25)',
      }}
    >
      {children}
    </div>
  );
}

/**
 * Legenda da fala do Andy, com a palavra da vez em coral. Fica na faixa
 * y≈1330–1440, abaixo do rosto do Andy e acima do nome e do texto do post; a
 * margem direita maior foge da coluna de botões do Reels.
 */
export function Legenda() {
  const frame = useCurrentFrame();
  const s = frame / FPS;
  const agora = falaNoInstante(s);
  if (!agora) return null;
  const palavras = agora.fala.texto.split(' ');
  const atual = Math.min(palavras.length - 1, Math.floor(agora.t * palavras.length));
  const entra = interpolate(agora.decorrido, [0, 0.12], [0, 1], { extrapolateRight: 'clamp', easing: CHEGADA });
  return (
    <div style={{ position: 'absolute', left: 60, right: 150, top: 1330, display: 'flex', justifyContent: 'center' }}>
      <div
        style={{
          maxWidth: 840,
          textAlign: 'center',
          background: 'rgba(10,10,10,0.78)',
          borderRadius: 22,
          padding: '14px 26px',
          fontFamily: FONTE,
          fontWeight: 600,
          fontSize: 42,
          lineHeight: 1.22,
          color: '#fff',
          opacity: entra,
          transform: `translateY(${(1 - entra) * 12}px)`,
        }}
      >
        {palavras.map((p, i) => (
          <span key={i} style={{ color: i === atual ? COR.coral : undefined }}>
            {p}
            {i < palavras.length - 1 ? ' ' : ''}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Progresso 0→1 entre dois instantes (segundos da cena), com curva de chegada. */
export function useProgresso(de: number, ate: number, curva = CHEGADA) {
  const frame = useCurrentFrame();
  return interpolate(frame, [f(de), f(ate)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: curva });
}
