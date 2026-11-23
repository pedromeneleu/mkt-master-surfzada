import { AbsoluteFill, useCurrentFrame } from 'remotion';

import { Simbolo, Wordmark } from '@compartilhado/marca/Marca';
import { Rotulo, Titulo } from '@compartilhado/marca/Texto';
import { COR, FONTE } from '@compartilhado/tema';

import { Credito, Entra, Foto, FundoTinta, Paragrafo } from './componentes';
import { FOTOS } from './fotos';
import { MARGEM } from './tema';

/*
 * Stories 9:16. Área segura: nada importante acima de y≈250 (barra do perfil) nem abaixo de
 * y≈1580 (resposta e reações). Os stickers (link e enquete) entram no Instagram, nos espaços
 * deixados livres.
 */

const LARGURA_UTIL = 1080 - MARGEM * 2;

/** Story 1 · Contexto, com espaço para o sticker de link que leva ao carrossel. */
export function StoryContexto() {
  return (
    <AbsoluteFill style={{ fontFamily: FONTE, color: COR.superficie }}>
      <FundoTinta />
      <div style={{ position: 'absolute', left: MARGEM, top: 262 }}>
        <Rotulo texto="WILD CARD · PIPELINE 2026" cor={COR.coral} tamanho={24} />
      </div>
      <div style={{ position: 'absolute', right: MARGEM, top: 240 }}>
        <Simbolo largura={70} em={-60} cor={COR.superficie} />
      </div>
      <Entra em={0} estilo={{ position: 'absolute', left: 0, top: 340 }}>
        <Foto src={FOTOS.praia.src} largura={1080} altura={608} foco="55% 45%" />
      </Entra>
      <Titulo
        texto={'John John Florence\npediu wild card\npra *Pipeline*.'}
        em={8}
        tamanho={94}
        cor={COR.superficie}
        estilo={{ position: 'absolute', left: MARGEM, top: 1000, width: LARGURA_UTIL }}
      />
      <Paragrafo em={24} tamanho={40} estilo={{ position: 'absolute', left: MARGEM, top: 1330, width: LARGURA_UTIL }}>
        {'Pode cruzar com *4 brasileiros* já na 4ª rodada.'}
      </Paragrafo>
      {/* y 1440–1580 fica livre para o sticker de link. */}
      <Credito texto={FOTOS.praia.credito} baixo={980} />
    </AbsoluteFill>
  );
}

/** Story 2 · Enquete. O meio da tela (y 820–1250) fica livre para o sticker de enquete. */
export function StoryEnquete() {
  const frame = useCurrentFrame();
  const balanco = Math.sin(frame / 22) * 1.5;
  return (
    <AbsoluteFill style={{ fontFamily: FONTE, color: COR.tinta, background: COR.coral }}>
      {/* Sobre o coral, o traço do rótulo e o sol do símbolo sumiriam: rótulo em pílula e só o nome. */}
      <div
        style={{
          position: 'absolute',
          left: MARGEM,
          top: 252,
          padding: '8px 18px',
          borderRadius: 999,
          background: COR.tinta,
          color: COR.coral,
          fontSize: 22,
          fontWeight: 600,
          letterSpacing: '0.16em',
        }}
      >
        ENQUETE
      </div>
      <div style={{ position: 'absolute', right: MARGEM, top: 256 }}>
        <Wordmark tamanho={34} cor={COR.tinta} />
      </div>
      <Titulo
        texto={'A WSL deve\naceitar o wild card\ndo John John?'}
        em={4}
        tamanho={96}
        peso={700}
        cor={COR.tinta}
        estilo={{ position: 'absolute', left: MARGEM, top: 360, width: LARGURA_UTIL }}
      />
      <Entra em={20} estilo={{ position: 'absolute', right: MARGEM + 10, top: 1260, transform: `rotate(${4 + balanco}deg)` }}>
        <div style={{ background: COR.superficie, padding: 10, boxShadow: '0 18px 40px rgba(10,10,10,0.25)' }}>
          <Foto src={FOTOS.estudio.src} largura={240} altura={300} foco="50% 25%" escala={1.05} />
        </div>
      </Entra>
      <div style={{ position: 'absolute', left: MARGEM, top: 1340, width: 560 }}>
        <Paragrafo em={26} tamanho={38} cor={COR.tinta} destaque={COR.tinta}>
          {'*Vota aí em cima.* Amanhã a gente mostra o resultado.'}
        </Paragrafo>
      </div>
      <div
        style={{
          position: 'absolute',
          right: 22,
          bottom: 360,
          writingMode: 'vertical-rl',
          transform: 'rotate(180deg)',
          fontSize: 13,
          fontWeight: 500,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'rgba(10,10,10,0.55)',
        }}
      >
        {FOTOS.estudio.credito}
      </div>
    </AbsoluteFill>
  );
}
