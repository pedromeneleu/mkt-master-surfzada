import type { CSSProperties } from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

import { COR, FONTE, SAIDA } from '../tema';

/**
 * Título com as palavras subindo de trás de uma máscara, uma a uma.
 * Palavras entre *asteriscos* ficam em coral. `sai` recolhe tudo para cima.
 */
export function Titulo({
  texto,
  em = 0,
  sai,
  tamanho = 88,
  cor = COR.tinta,
  peso = 600,
  alinhar = 'left',
  intervalo = 3,
  estilo,
}: {
  texto: string;
  em?: number;
  sai?: number;
  tamanho?: number;
  cor?: string;
  peso?: number;
  alinhar?: 'left' | 'center';
  intervalo?: number;
  estilo?: CSSProperties;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const linhas = texto.split('\n');
  let indice = 0;

  return (
    <div
      style={{
        fontFamily: FONTE,
        fontSize: tamanho,
        fontWeight: peso,
        lineHeight: 1.08,
        letterSpacing: '-0.025em',
        color: cor,
        textAlign: alinhar,
        ...estilo,
      }}
    >
      {linhas.map((linha, l) => (
        <div key={l} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: alinhar === 'center' ? 'center' : 'flex-start', gap: '0 0.26em' }}>
          {linha.split(' ').map((palavra) => {
            const i = indice++;
            const destaque = palavra.includes('*');
            const limpa = palavra.replace(/\*/g, '');
            const entra = spring({ frame: frame - em - i * intervalo, fps, config: { damping: 18, stiffness: 140, mass: 0.8 } });
            const recolhe =
              sai === undefined
                ? 0
                : interpolate(frame, [sai + i * 1.5, sai + i * 1.5 + 10], [0, 1], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                    easing: SAIDA,
                  });
            const y = (1 - entra) * 110 - recolhe * 110;
            return (
              <span key={i} style={{ display: 'inline-block', overflow: 'hidden', padding: '0.06em 0 0.12em', margin: '-0.06em 0 -0.12em' }}>
                <span
                  style={{
                    display: 'inline-block',
                    transform: `translateY(${y}%)`,
                    color: destaque ? COR.coral : undefined,
                  }}
                >
                  {limpa}
                </span>
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/** Rótulo pequeno em caixa-alta com traço coral ("PREVISÕES"). */
export function Rotulo({ texto, em = 0, tamanho = 22, cor = COR.coralTexto }: { texto: string; em?: number; tamanho?: number; cor?: string }) {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [em, em + 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: tamanho * 0.6,
        fontFamily: FONTE,
        fontSize: tamanho,
        fontWeight: 600,
        letterSpacing: '0.16em',
        color: cor,
        opacity: p,
        transform: `translateX(${(1 - p) * -20}px)`,
      }}
    >
      <span style={{ width: tamanho * 2 * p, height: 3, borderRadius: 2, background: COR.coral }} />
      {texto}
    </div>
  );
}

/** Número que conta até o valor final (mesmo número de casas do valor). */
export function Contador({
  valor,
  em,
  dur = 24,
  sufixo = '',
  tamanho = 96,
  cor = COR.tinta,
}: {
  valor: string;
  em: number;
  dur?: number;
  sufixo?: string;
  tamanho?: number;
  cor?: string;
}) {
  const frame = useCurrentFrame();
  const alvo = Number(valor.replace(',', '.'));
  const casas = valor.includes('.') || valor.includes(',') ? valor.split(/[.,]/)[1].length : 0;
  const p = interpolate(frame, [em, em + dur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });
  const aparece = interpolate(frame, [em - 4, em + 4], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const numero = Number.isFinite(alvo) ? (alvo * p).toFixed(casas) : valor;
  return (
    <span
      style={{
        fontFamily: FONTE,
        fontSize: tamanho,
        fontWeight: 600,
        letterSpacing: '-0.03em',
        color: cor,
        fontVariantNumeric: 'tabular-nums',
        opacity: aparece,
        whiteSpace: 'nowrap',
      }}
    >
      {numero}
      {sufixo && <small style={{ fontSize: '0.45em', fontWeight: 500, marginLeft: '0.1em' }}>{sufixo}</small>}
    </span>
  );
}
