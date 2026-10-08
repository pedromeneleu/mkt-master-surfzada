import { Img, spring, useCurrentFrame, useVideoConfig } from 'remotion';

import { arquivo, COR, FONTE, M } from '../tema';
import { Sfx } from '@compartilhado/componentes/Sfx';

/** Notificação "Fulano vai surfar com você" entrando pela direita, com sininho. */
export function Aviso({
  nome,
  avatar,
  em,
  escala = 1,
  som = true,
}: {
  nome: string;
  avatar: string;
  em: number;
  escala?: number;
  som?: boolean;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - em, fps, config: { damping: 15, stiffness: 170 } });
  if (frame < em) return som ? <Sfx nome="notificacao" em={em} volume={0.35} /> : null;
  const primeiro = nome.split(' ')[0];
  return (
    <>
      {som && <Sfx nome="notificacao" em={em} volume={0.35} />}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16 * escala,
          width: 440 * escala,
          padding: `${14 * escala}px ${18 * escala}px`,
          borderRadius: 20 * escala,
          background: 'rgba(255,255,255,0.96)',
          boxShadow: '0 24px 60px -16px rgba(10,10,10,0.35), 0 0 0 1px rgba(10,10,10,0.06)',
          fontFamily: FONTE,
          transform: `translateX(${(1 - s) * 120}%) scale(${0.9 + 0.1 * s})`,
          opacity: Math.min(1, s * 1.4),
        }}
      >
        <Img src={arquivo(avatar)} style={{ width: 52 * escala, height: 52 * escala, borderRadius: '50%' }} />
        <div style={{ flex: 1, lineHeight: 1.25, whiteSpace: 'nowrap' }}>
          <div style={{ fontSize: 21 * escala, color: COR.tinta }}>
            <strong style={{ fontWeight: 600 }}>{primeiro}</strong> confirmou
          </div>
          <div style={{ fontSize: 17 * escala, color: COR.suave }}>{M.pico.nome} · amanhã 05:30</div>
        </div>
        <span
          style={{
            fontSize: 16 * escala,
            fontWeight: 600,
            color: '#fff',
            background: COR.tinta,
            padding: `${5 * escala}px ${12 * escala}px`,
            borderRadius: 99,
          }}
        >
          bora!
        </span>
      </div>
    </>
  );
}
