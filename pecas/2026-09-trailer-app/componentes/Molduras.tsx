import type { CSSProperties, ReactNode } from 'react';

import { COR, FONTE } from '../tema';

const SOMBRA = '0 50px 120px -20px rgba(10,10,10,0.35), 0 18px 40px -12px rgba(10,10,10,0.18)';

/** Janela de navegador em volta de uma <Tela> (conteúdo com `largura` px). */
export function Navegador({
  largura,
  children,
  estilo,
  url = 'surfzada.com.br',
}: {
  largura: number;
  children: ReactNode;
  estilo?: CSSProperties;
  url?: string;
}) {
  const barra = Math.round(largura * 0.036);
  return (
    <div
      style={{
        width: largura,
        borderRadius: barra * 0.42,
        overflow: 'hidden',
        background: COR.superficie,
        boxShadow: SOMBRA,
        outline: `1px solid ${COR.borda}`,
        ...estilo,
      }}
    >
      <div
        style={{
          height: barra,
          display: 'flex',
          alignItems: 'center',
          padding: `0 ${barra * 0.45}px`,
          gap: barra * 0.2,
          background: '#fbfbfb',
          borderBottom: `1px solid ${COR.borda}`,
        }}
      >
        {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
          <span key={c} style={{ width: barra * 0.26, height: barra * 0.26, borderRadius: '50%', background: c }} />
        ))}
        <div
          style={{
            margin: '0 auto',
            height: barra * 0.6,
            padding: `0 ${barra * 0.6}px`,
            borderRadius: barra,
            background: '#efefef',
            display: 'flex',
            alignItems: 'center',
            gap: barra * 0.15,
            fontFamily: FONTE,
            fontSize: barra * 0.32,
            color: COR.suave,
          }}
        >
          <svg width={barra * 0.26} height={barra * 0.3} viewBox="0 0 10 12">
            <rect x="1" y="5" width="8" height="6.5" rx="1.4" fill={COR.suave} />
            <path d="M3 5.2 V3.6 a2 2 0 0 1 4 0 V5.2" stroke={COR.suave} strokeWidth="1.3" fill="none" />
          </svg>
          {url}
        </div>
        <span style={{ width: barra * 1.2 }} />
      </div>
      {children}
    </div>
  );
}

/** Celular genérico (sem marca) em volta de uma <Tela> de 390×844. */
export function Celular({ largura, children, estilo }: { largura: number; children: ReactNode; estilo?: CSSProperties }) {
  const borda = largura * 0.035;
  return (
    <div
      style={{
        width: largura + borda * 2,
        padding: borda,
        borderRadius: largura * 0.16,
        background: COR.tinta,
        boxShadow: `${SOMBRA}, inset 0 0 0 ${borda * 0.25}px #2a2a2a`,
        position: 'relative',
        ...estilo,
      }}
    >
      <div style={{ borderRadius: largura * 0.13, overflow: 'hidden', position: 'relative', background: COR.superficie }}>
        {/* Barra de status: as capturas não têm área segura, então a ilha fica aqui e não em cima da página. */}
        <div
          style={{
            height: largura * 0.12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: `0 ${largura * 0.08}px`,
            fontFamily: FONTE,
            fontWeight: 600,
            fontSize: largura * 0.04,
            color: COR.tinta,
          }}
        >
          <span>9:41</span>
          <span style={{ display: 'flex', gap: largura * 0.012, alignItems: 'flex-end' }}>
            {[0.35, 0.55, 0.75, 1].map((h) => (
              <span key={h} style={{ width: largura * 0.009, height: largura * 0.03 * h, borderRadius: 2, background: COR.tinta }} />
            ))}
            <span
              style={{
                width: largura * 0.062,
                height: largura * 0.03,
                marginLeft: largura * 0.015,
                borderRadius: largura * 0.008,
                border: `${Math.max(1, largura * 0.003)}px solid ${COR.tinta}`,
                padding: largura * 0.004,
                boxSizing: 'border-box',
              }}
            >
              <span style={{ display: 'block', width: '80%', height: '100%', background: COR.tinta, borderRadius: 1 }} />
            </span>
          </span>
        </div>
        {children}
        {/* Ilha no topo */}
        <div
          style={{
            position: 'absolute',
            top: largura * 0.025,
            left: '50%',
            width: largura * 0.3,
            height: largura * 0.075,
            transform: 'translateX(-50%)',
            borderRadius: largura,
            background: COR.tinta,
          }}
        />
      </div>
    </div>
  );
}
