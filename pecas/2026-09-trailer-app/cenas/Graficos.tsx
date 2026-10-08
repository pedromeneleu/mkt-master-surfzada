import { AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

import { FundoClaro } from '@compartilhado/marca/Marca';
import { Sfx } from '@compartilhado/componentes/Sfx';
import { Titulo } from '@compartilhado/marca/Texto';
import type { Recorte } from '../dados/tipos';
import { arquivo, bt, CHEGADA, COR, M } from '../tema';

/**
 * Um gráfico recortado da página do pico, flutuando em 2,5D. `revelar`
 * desenrola o conteúdo da esquerda para a direita (a previsão "correndo" no tempo).
 */
function Cartao({
  recorte,
  largura,
  x,
  y,
  em,
  inclinacao,
  profundidade,
  revelar = true,
}: {
  recorte: Recorte;
  largura: number;
  x: number;
  y: number;
  em: number;
  inclinacao: number;
  profundidade: number;
  revelar?: boolean;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - em, fps, config: { damping: 18, stiffness: 120 } });
  const wipe = interpolate(frame, [em + 6, em + 42], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: CHEGADA });
  const altura = (largura * recorte.altura) / recorte.largura;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y - frame * 0.25 * profundidade,
        width: largura,
        height: altura,
        borderRadius: 22,
        overflow: 'hidden',
        background: COR.superficie,
        boxShadow: '0 40px 90px -24px rgba(10,10,10,0.32), 0 0 0 1px rgba(10,10,10,0.05)',
        opacity: s,
        transform: `translateY(${(1 - s) * 160}px) rotateY(${inclinacao * (1 - frame / 600)}deg) rotateX(6deg) scale(${0.9 + 0.1 * s})`,
      }}
    >
      <Img
        src={arquivo(recorte.arquivo)}
        style={{ width: '100%', height: '100%', clipPath: revelar ? `inset(0 ${(1 - wipe) * 100}% 0 0)` : undefined }}
      />
    </div>
  );
}

/** Previsão detalhada: onda, maré e a rosa de swell/vento, um cartão por batida. */
export function Graficos() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const r = M.recortes;
  const bussola = spring({ frame: frame - bt(3), fps, config: { damping: 12, stiffness: 110 } });
  const altB = (560 * r.bussola.altura) / r.bussola.largura;

  return (
    <AbsoluteFill>
      <FundoClaro />
      <Sfx nome="whoosh" em={bt(1) - 2} volume={0.45} />
      <Sfx nome="whoosh-curto" em={bt(2) - 2} volume={0.4} />
      <Sfx nome="whoosh-grave" em={bt(3) - 2} volume={0.45} />
      <Sfx nome="pop" em={bt(3) + 10} volume={0.4} />

      <div style={{ position: 'absolute', top: 84, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <Titulo texto="Onda, swell, vento e *maré*." em={2} tamanho={78} alinhar="center" />
        <Titulo texto="Hora a hora, dias à frente." em={bt(0.75)} tamanho={32} peso={400} cor={COR.suave} alinhar="center" intervalo={2} />
      </div>

      <AbsoluteFill style={{ perspective: 2400 }}>
        <Cartao recorte={r['grafico-altura']} largura={860} x={110} y={280} em={bt(1)} inclinacao={10} profundidade={0.6} />
        {r['grafico-mare'] && <Cartao recorte={r['grafico-mare']} largura={900} x={330} y={610} em={bt(2)} inclinacao={-6} profundidade={1} />}
        <div
          style={{
            position: 'absolute',
            left: 1230,
            top: 330 - frame * 0.15,
            width: 560,
            height: altB,
            borderRadius: 26,
            overflow: 'hidden',
            boxShadow: '0 40px 90px -24px rgba(10,10,10,0.35)',
            opacity: Math.min(1, bussola * 1.5),
            transform: `rotate(${(1 - bussola) * -35}deg) scale(${0.6 + 0.4 * bussola})`,
          }}
        >
          <Img src={arquivo(r.bussola.arquivo)} style={{ width: '100%', height: '100%' }} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
