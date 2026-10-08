import { useMemo } from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

import { FundoClaro, FundoEscuro, Simbolo, Wordmark } from '@compartilhado/marca/Marca';
import { Sfx } from '@compartilhado/componentes/Sfx';
import { Contador, Titulo } from '@compartilhado/marca/Texto';
import { CHEGADA, COM_MUSICA, COR, FONTE, M, bt } from '../tema';

/**
 * Os picos cadastrados como pontos, na posição real (projeção equirretangular
 * corrigida pela latitude média). Só com os pontos, a costa do Brasil aparece.
 */
function MapaDePicos({ largura, altura, em }: { largura: number; altura: number; em: number }) {
  const frame = useCurrentFrame();
  const pontos = useMemo(() => {
    const lats = M.picos.map((p) => p.lat);
    const lngs = M.picos.map((p) => p.lng);
    const [minLat, maxLat, minLng, maxLng] = [Math.min(...lats), Math.max(...lats), Math.min(...lngs), Math.max(...lngs)];
    const coss = Math.cos((((minLat + maxLat) / 2) * Math.PI) / 180);
    const w = (maxLng - minLng) * coss;
    const h = maxLat - minLat;
    const escala = Math.min(largura / w, altura / h) * 0.92;
    const offX = (largura - w * escala) / 2;
    const offY = (altura - h * escala) / 2;
    return M.picos
      .map((p) => ({ x: offX + (p.lng - minLng) * coss * escala, y: offY + (maxLat - p.lat) * escala }))
      .sort((a, b) => a.y - b.y) // acendem de norte a sul
      .map((p, i, todos) => ({ ...p, atraso: (i / todos.length) * 50 }));
  }, [largura, altura]);

  return (
    <svg width={largura} height={altura} style={{ overflow: 'visible' }}>
      {pontos.map((p, i) => {
        const t = frame - em - p.atraso;
        if (t < 0) return null;
        const s = Math.min(1, t / 6);
        const brilho = Math.max(0, 1 - t / 14);
        return (
          <g key={i}>
            {brilho > 0 && <circle cx={p.x} cy={p.y} r={14 * brilho} fill={COR.coral} opacity={0.35 * brilho} />}
            <circle cx={p.x} cy={p.y} r={4.2 * s} fill={brilho > 0.3 ? '#fff' : COR.coral} />
          </g>
        );
      })}
    </svg>
  );
}

/** Prova: todos os picos da base acendendo no mapa. */
export function Prova() {
  const { width, height } = useVideoConfig();
  const vertical = height > width;
  const total = String(M.picos.length);
  const estados = String(M.totalEstados);
  const mapa = vertical ? { l: 900, a: 1100, x: 90, y: 150 } : { l: 820, a: 960, x: 1000, y: 60 };

  return (
    <AbsoluteFill>
      <FundoEscuro />
      <Sfx nome="whoosh-grave" em={0} volume={0.5} />
      <Sfx nome="tick" em={8} volume={0.5} />
      <Sfx nome="tick" em={bt(2)} volume={0.5} />

      <div style={{ position: 'absolute', left: mapa.x, top: mapa.y }}>
        <MapaDePicos largura={mapa.l} altura={mapa.a} em={4} />
      </div>

      <div
        style={{
          position: 'absolute',
          left: vertical ? 0 : 150,
          right: vertical ? 0 : undefined,
          top: vertical ? 1300 : 330,
          display: 'flex',
          flexDirection: 'column',
          alignItems: vertical ? 'center' : 'flex-start',
          gap: 8,
          fontFamily: FONTE,
          color: '#fff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 22 }}>
          <Contador valor={total} em={8} dur={40} tamanho={vertical ? 180 : 190} cor="#fff" />
          <span style={{ fontSize: 56, fontWeight: 500 }}>picos</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
          <Contador valor={estados} em={bt(2)} dur={20} tamanho={vertical ? 96 : 100} cor={COR.coral} />
          <span style={{ fontSize: 44, fontWeight: 400, color: 'rgba(255,255,255,0.8)' }}>estados do litoral</span>
        </div>
      </div>
    </AbsoluteFill>
  );
}

/** Final: marca, chamada e endereço — sobre o acorde final da música se desfazendo. */
export function Final() {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const vertical = height > width;
  const nome = spring({ frame: frame - 14, fps, config: { damping: 200 } });
  const url = spring({ frame: frame - bt(2), fps, config: { damping: 14, stiffness: 140 } });
  const respira = 1 + interpolate(frame, [0, 120], [0, 0.03], { easing: CHEGADA });

  return (
    <AbsoluteFill>
      <FundoClaro />
      {/* O arpejo sintetizado brigaria com o acorde da trilha: só entra sem música. */}
      {!COM_MUSICA && <Sfx nome="brilho" em={2} volume={0.6} />}
      <Sfx nome="pop" em={bt(2)} volume={0.45} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', gap: 34, transform: `scale(${respira})` }}>
        <Simbolo largura={vertical ? 380 : 300} em={0} />
        <div style={{ opacity: nome, transform: `translateY(${(1 - nome) * 24}px)` }}>
          <Wordmark tamanho={vertical ? 150 : 130} />
        </div>
        <Titulo texto="Bora surfar?" em={bt(1)} tamanho={vertical ? 64 : 52} peso={400} cor={COR.suave} alinhar="center" />
        <div
          style={{
            marginTop: 10,
            padding: vertical ? '22px 48px' : '18px 40px',
            borderRadius: 999,
            background: COR.tinta,
            color: '#fff',
            fontFamily: FONTE,
            fontWeight: 600,
            fontSize: vertical ? 50 : 40,
            letterSpacing: '-0.01em',
            transform: `scale(${url})`,
            opacity: url,
          }}
        >
          surfzada.com.br
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
