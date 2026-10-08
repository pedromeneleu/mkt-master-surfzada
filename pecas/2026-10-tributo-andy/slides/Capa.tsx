import { AbsoluteFill, useCurrentFrame } from 'remotion';

import { DURACAO_GIRO, GiroEmLoop } from '../componentes/GiroEmLoop';
import { Logo } from '@compartilhado/marca/Marca';
import { COR, FONTE } from '../tema';

/**
 * Slide 1 do carrossel: a camisa girando, em loop, com a linguagem do trailer
 * (rótulo com traço coral, título Poppins com a palavra-chave em coral, logo).
 *
 * A camisa ocupa quase o quadro todo, então os textos ficam nos cantos que
 * ela nunca alcança em nenhuma pose do giro (medido sobre todos os quadros):
 * acima de y≈250 para x < 220 e x > 860, e abaixo de y≈950 (o chão).
 * Nada entra nem sai: o que se mexe tem período que divide o loop.
 */
export function Capa() {
  return (
    <AbsoluteFill style={{ backgroundColor: '#8f9194', fontFamily: FONTE, color: COR.tinta }}>
      <GiroEmLoop />
      {/* Clareia o chão sob o título e põe um fio do brilho coral do trailer no canto. */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(to top, rgba(245,245,245,0.38), transparent 12%),
            radial-gradient(40% 35% at 96% 2%, rgba(255,122,89,0.10), transparent 70%)`,
        }}
      />
      <Cabecalho />
      <Rodape />
    </AbsoluteFill>
  );
}

const MARGEM = 60;

function Cabecalho() {
  return (
    <>
      <div style={{ position: 'absolute', left: MARGEM, top: MARGEM - 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 18, fontWeight: 600, letterSpacing: '0.16em' }}>
          <span style={{ width: 36, height: 3, borderRadius: 2, background: COR.coral }} />
          Nº 001 · TRIBUTO
        </div>
        <div style={{ marginTop: 8, marginLeft: 48, fontSize: 15, fontWeight: 500, letterSpacing: '0.16em', opacity: 0.72 }}>ANDY IRONS · 1978 — 2010</div>
      </div>
      <div style={{ position: 'absolute', right: MARGEM, top: MARGEM - 10 }}>
        {/* em negativo: o logo já entra desenhado. */}
        <Logo tamanho={30} em={-60} />
      </div>
    </>
  );
}

function Rodape() {
  const frame = useCurrentFrame();
  // Três toques da seta por volta da camisa.
  const fase = (frame / DURACAO_GIRO) * 3 * Math.PI * 2;
  const empurra = Math.max(0, Math.sin(fase)) ** 3 * 12;
  return (
    <div
      style={{
        position: 'absolute',
        left: MARGEM,
        right: MARGEM,
        bottom: MARGEM - 14,
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ fontSize: 50, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1 }}>
        Don’t waste your <span style={{ color: COR.coralTexto }}>time</span>.
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 17, fontWeight: 600, letterSpacing: '0.16em' }}>
        A HISTÓRIA
        <svg width={44} height={20} viewBox="0 0 44 20" style={{ transform: `translateX(${empurra}px)` }}>
          <path d="M0 10 H40 M31 2 L41 10 L31 18" fill="none" stroke={COR.coralTexto} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}
