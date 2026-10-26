import { loadFont } from '@remotion/google-fonts/NotoColorEmoji';
import type { CSSProperties } from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

import { COR, FONTE, SAIDA } from '@compartilhado/tema';
import { arquivosDaPeca } from '@compartilhado/util/arquivos';

export const SLUG = '2026-10-ia-analisa-rasgada';
/** Clipes convertidos por `npm run assets` em public/pecas/2026-10-ia-analisa-rasgada/clipes/. */
export const arquivo = arquivosDaPeca(SLUG);

/**
 * Emoji colorido (💀 🤙 👇) depois da Poppins: o Chrome do render não tem fonte de emoji,
 * e o roteiro do Market Master usa emoji nas legendas.
 */
const { fontFamily: EMOJI } = loadFont();
export const FONTE_LEGENDA = `${FONTE}, ${EMOJI}`;

export const W = 1080;
export const H = 1920;

/**
 * Legenda grande (a maioria assiste sem som): entra palavra por palavra subindo da
 * máscara, como o `Titulo` da marca, mas aceitando emoji. *Asteriscos* = coral.
 */
export function Legenda({
  texto,
  em = 0,
  sai,
  tamanho = 76,
  cor = '#ffffff',
  peso = 700,
  intervalo = 2,
  estilo,
}: {
  texto: string;
  em?: number;
  sai?: number;
  tamanho?: number;
  cor?: string;
  peso?: number;
  intervalo?: number;
  estilo?: CSSProperties;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  let indice = 0;
  return (
    <div
      style={{
        fontFamily: FONTE_LEGENDA,
        fontSize: tamanho,
        fontWeight: peso,
        lineHeight: 1.1,
        letterSpacing: '-0.025em',
        color: cor,
        textAlign: 'center',
        ...estilo,
      }}
    >
      {texto.split('\n').map((linha, l) => (
        <div key={l} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 0.26em' }}>
          {linha.split(' ').map((palavra) => {
            const i = indice++;
            const entra = spring({ frame: frame - em - i * intervalo, fps, config: { damping: 18, stiffness: 160, mass: 0.7 } });
            const recolhe =
              sai === undefined
                ? 0
                : interpolate(frame, [sai + i, sai + i + 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: SAIDA });
            return (
              <span key={i} style={{ display: 'inline-block', overflow: 'hidden', padding: '0.06em 0 0.14em', margin: '-0.06em 0 -0.14em' }}>
                <span
                  style={{
                    display: 'inline-block',
                    transform: `translateY(${(1 - entra) * 110 - recolhe * 110}%)`,
                    color: palavra.includes('*') ? COR.coral : undefined,
                  }}
                >
                  {palavra.replace(/\*/g, '')}
                </span>
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/** Rótulo técnico pequeno em caixa-alta (o "texto de máquina" da IA). */
export function Etiqueta({ texto, cor = 'rgba(255,255,255,0.7)', tamanho = 22, estilo }: { texto: string; cor?: string; tamanho?: number; estilo?: CSSProperties }) {
  return (
    <div style={{ fontFamily: FONTE, fontSize: tamanho, fontWeight: 600, letterSpacing: '0.16em', color: cor, whiteSpace: 'nowrap', ...estilo }}>
      {texto}
    </div>
  );
}
