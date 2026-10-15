import { AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

import { Sfx } from '@compartilhado/componentes/Sfx';
import { Logo } from '@compartilhado/marca/Marca';
import { CHEGADA, COR, FONTE } from '@compartilhado/tema';
import { arquivosDaPeca } from '@compartilhado/util/arquivos';

export const SLUG = '2026-10-meme-sonhei-com-voce';
/** Arquivo em public/pecas/<slug>/ (do Drive, via `npm run assets`). */
export const arquivo = arquivosDaPeca(SLUG);

/**
 * Meme de conversa: as mensagens aparecem uma a uma sobre a foto do surfista, como num
 * chat ("Sonhei com você ontem" / "Eu tava surfando?" / "Não" / "Então não era eu").
 * As minhas mensagens saem em coral, as da outra pessoa em tinta. Logo discreto no fim.
 */
type Mensagem = { texto: string; minha: boolean; em: number; y: number };

const MENSAGENS: Mensagem[] = [
  { texto: 'Sonhei com você ontem', minha: false, em: 15, y: 470 },
  { texto: 'Eu tava surfando?', minha: true, em: 60, y: 610 },
  { texto: 'Não', minha: false, em: 105, y: 930 },
  { texto: 'Então não era eu', minha: true, em: 140, y: 1170 },
];

export const DURACAO = 270;

/** Margens: esquerda, e direita fora da coluna de botões do Reels (~140 px). */
const ESQ = 80;
const DIR = 170;

export function Peca() {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const zoom = interpolate(frame, [0, durationInFrames], [1, 1.08]);
  const marcaEm = durationInFrames - 60;
  const marca = interpolate(frame, [marcaEm, marcaEm + 16], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: CHEGADA });

  return (
    <AbsoluteFill style={{ background: COR.tinta, fontFamily: FONTE }}>
      {/* Fundo: a mesma foto, ampliada e desfocada, para a foto (deitada) caber inteira no meio. */}
      <AbsoluteFill style={{ transform: `scale(${1.25 * zoom})` }}>
        <Img src={arquivo('surfista.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(40px) brightness(0.75)' }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: 'center' }}>
        <div style={{ width: '100%', height: 1080 * (408 / 612) * 1.32, overflow: 'hidden' }}>
          <Img
            src={arquivo('surfista.jpg')}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})`, boxShadow: '0 0 80px rgba(0,0,0,0.4)' }}
          />
        </div>
      </AbsoluteFill>

      {MENSAGENS.map((m) => (
        <Balao key={m.texto} {...m} />
      ))}

      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 425, opacity: marca }}>
        <div style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.45))' }}>
          <Logo tamanho={44} em={marcaEm} cor="#fff" />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

function Balao({ texto, minha, em, y }: Mensagem) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - em, fps, config: { damping: 14, stiffness: 220, mass: 0.6 } });
  if (frame < em) return null;
  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: y,
          ...(minha ? { right: DIR } : { left: ESQ }),
          maxWidth: 1080 - ESQ - DIR,
          padding: '26px 40px',
          borderRadius: minha ? '48px 48px 12px 48px' : '48px 48px 48px 12px',
          background: minha ? COR.coral : COR.tinta2,
          color: minha ? COR.tinta : '#fff',
          fontSize: 50,
          fontWeight: 500,
          letterSpacing: '-0.01em',
          lineHeight: 1.2,
          boxShadow: '0 10px 30px rgba(0,0,0,0.28)',
          transform: `scale(${p})`,
          transformOrigin: minha ? 'bottom right' : 'bottom left',
          opacity: Math.min(1, p * 1.5),
        }}
      >
        {texto}
      </div>
      <Sfx nome={minha ? 'pop-agudo' : 'pop'} em={em} volume={0.55} />
    </>
  );
}
