import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

import { Sfx } from '@compartilhado/componentes/Sfx';
import { Titulo } from '@compartilhado/marca/Texto';
import { FundoEscuro } from '@compartilhado/marca/Marca';
import type { PropsCena } from '../Trailer';
import { CHEGADA, COR, FONTE, bt } from '../tema';

/** Linha de onda coral se desenhando atrás do texto. */
function LinhaOnda({ em, largura }: { em: number; largura: number }) {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [em, em + 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: CHEGADA });
  const fase = frame / 10;
  const pontos = Array.from({ length: 61 }, (_, i) => {
    const x = (i / 60) * largura;
    const y = Math.sin(i / 6 + fase) * 26 + Math.sin(i / 2.7 + fase * 1.6) * 6;
    return `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg width={largura} height={120} viewBox={`0 -60 ${largura} 120`} style={{ overflow: 'visible' }}>
      <path d={pontos} fill="none" stroke={COR.coral} strokeWidth={6} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
    </svg>
  );
}

/**
 * Gancho: duas perguntas que todo surfista faz, uma em cada metade da cena.
 * No 16:9 uma troca pela outra (um compasso cada); no 9:16, que é mais curto,
 * elas ficam empilhadas para dar tempo de ler.
 */
export function Gancho({ duracao }: PropsCena) {
  const { width, height } = useVideoConfig();
  const meio = Math.round(duracao / 2);
  const vertical = height > width;
  const tamanho = vertical ? 120 : 132;
  return (
    <AbsoluteFill>
      <FundoEscuro />
      <Sfx nome="onda" em={0} volume={0.5} />
      <Sfx nome="whoosh-curto" em={2} volume={0.4} />
      <Sfx nome="whoosh-curto" em={meio - 2} volume={0.4} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', transform: vertical ? 'translateY(-150px)' : undefined }}>
          <Titulo texto="O mar tá *bom?*" em={4} sai={vertical ? undefined : meio - bt(0.75)} tamanho={tamanho} cor="#fff" alinhar="center" />
        </div>
        <div style={{ position: 'absolute', transform: vertical ? 'translateY(110px)' : undefined }}>
          <Titulo texto={vertical ? 'Quem vai\n*surfar?*' : 'Quem vai *surfar?*'} em={meio} tamanho={tamanho} cor="#fff" alinhar="center" />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: height * 0.14 }}>
        <LinhaOnda em={0} largura={width * 0.7} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

const MENSAGENS: [string, string][] = [
  ['Lucas', 'alguém vai amanhã?'],
  ['Bia', 'tá flat?'],
  ['Téo', 'sei não, vi uma previsão aí'],
  ['Marina', 'que horas??'],
  ['Caio', 'quem vai de carro?'],
  ['Lucas', 'gente???'],
  ['Duda', 'fui ontem, tava crowdzão'],
  ['Bia', 'e o vento?'],
];

/** A dor: a combinação no grupo que nunca fecha. Um compasso de mensagens, um de frase. */
export function Dor({ duracao }: PropsCena) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const vertical = height > width;
  // Uma mensagem a cada meia batida; a frase entra no 2º compasso.
  const intervalo = bt(0.5);
  const frase = bt(4);
  const altBalao = vertical ? 124 : 108;
  const visiveis = Math.min(MENSAGENS.length, Math.floor(frame / intervalo) + 1);
  // A conversa "rola" para cima conforme chegam mensagens.
  const rolagem = interpolate(frame, [0, intervalo * MENSAGENS.length], [0, altBalao * 3.5], { extrapolateRight: 'clamp' });
  const desfoque = interpolate(frame, [frase - 8, frase + 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill>
      <FundoEscuro />
      {MENSAGENS.map((_, i) => (
        <Sfx key={i} nome={i % 2 ? 'pop-agudo' : 'pop'} em={i * intervalo + 2} volume={0.45} />
      ))}
      {/* O riser (2 s) termina junto com a cena: na virada da música. */}
      <Sfx nome="riser" em={duracao - 60} volume={0.55} />
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          filter: `blur(${desfoque * 10}px)`,
          opacity: 1 - desfoque * 0.75,
          transform: `scale(${1 - desfoque * 0.06})`,
        }}
      >
        <div style={{ width: vertical ? width * 0.84 : Math.min(760, width * 0.8), transform: `translateY(${240 - rolagem}px)`, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {MENSAGENS.slice(0, visiveis).map(([quem, texto], i) => {
            const s = spring({ frame: frame - i * intervalo, fps, config: { damping: 14, stiffness: 200 } });
            const direita = i % 3 === 1;
            return (
              <div
                key={i}
                style={{
                  alignSelf: direita ? 'flex-end' : 'flex-start',
                  maxWidth: '78%',
                  padding: '16px 24px',
                  borderRadius: 26,
                  borderBottomLeftRadius: direita ? 26 : 6,
                  borderBottomRightRadius: direita ? 6 : 26,
                  background: direita ? '#2a2a2a' : COR.tinta2,
                  fontFamily: FONTE,
                  color: '#fff',
                  transform: `scale(${s})`,
                  transformOrigin: direita ? '100% 100%' : '0% 100%',
                  opacity: s,
                }}
              >
                <div style={{ fontSize: vertical ? 26 : 20, fontWeight: 600, color: COR.coral, marginBottom: 2 }}>{quem}</div>
                <div style={{ fontSize: vertical ? 42 : 32 }}>{texto}</div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 8%' }}>
        <Titulo
          texto={vertical ? 'Surfar não devia\ndepender de\n*40 mensagens*\nno grupo.' : 'Surfar não devia depender\nde *40 mensagens* no grupo.'}
          em={frase}
          tamanho={vertical ? 92 : 84}
          cor="#fff"
          alinhar="center"
          intervalo={2}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
