import { AbsoluteFill, Img } from 'remotion';

import { Simbolo, Wordmark } from '@compartilhado/marca/Marca';
import { COR, FONTE } from '@compartilhado/tema';

/**
 * Capas 1:1 das playlists no Spotify (1080, renderizadas em 2160). Seguem o
 * layout do carrossel do tributo: foto do pico em cima, que se funde no
 * fundo, rótulo com traço coral, nome grande, frase com a palavra-chave em
 * coral e o logo no pé. O nome é grande para continuar legível na miniatura
 * do Spotify.
 *
 * Teahupo'o: tinta, foto em P&B com contraste e grão (pesada).
 * Waikiki: claro, foto de 1898 em sépia quente (leve).
 * A foto e os textos vêm da peça (props), com a foto em pecas/<slug>/assets/.
 */

const MARGEM = 64;

export type Capa = {
  nome: string;
  frase: [string, string];
  /** URL da foto (ex.: arquivo('foto.jpg')). */
  foto: string;
  foco: string;
  coordenadas: string;
  legenda: string;
  credito: string;
  claro: boolean;
};


/** Grão de filme por cima da foto (ruído SVG). */
function Grao({ opacidade }: { opacidade: number }) {
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', mixBlendMode: 'overlay', opacity: opacidade }}>
      <filter id="grao-capa">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={3} stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grao-capa)" />
    </svg>
  );
}

export function CapaPlaylist(c: Capa) {
  const fundo = c.claro ? COR.fundo : COR.tinta;
  const texto = c.claro ? COR.tinta : COR.superficie;
  const destaque = c.claro ? COR.coralTexto : COR.coral;
  const ALTURA_FOTO = 720;

  return (
    <AbsoluteFill style={{ background: fundo, fontFamily: FONTE, color: texto }}>
      {/* Foto do pico, fundindo no fundo */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: ALTURA_FOTO, overflow: 'hidden' }}>
        <Img
          src={c.foto}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: c.foco,
            filter: c.claro ? 'grayscale(1) sepia(0.6) contrast(1.12) brightness(1.06)' : 'grayscale(1) contrast(1.28) brightness(0.9)',
          }}
        />
        {/* Waikiki: um véu coral bem leve para a sépia puxar para a paleta */}
        {c.claro && <AbsoluteFill style={{ background: 'rgba(255,122,89,0.14)', mixBlendMode: 'multiply' }} />}
        <Grao opacidade={c.claro ? 0.22 : 0.38} />
        <AbsoluteFill
          style={{
            background: c.claro
              ? `linear-gradient(180deg, rgba(245,245,245,0.55) 0%, transparent 22%, transparent 52%, ${fundo} 98%)`
              : `linear-gradient(180deg, rgba(10,10,10,0.88) 0%, rgba(10,10,10,0.45) 14%, transparent 30%, transparent 50%, ${fundo} 98%)`,
          }}
        />
      </div>

      {/* Brilho coral no pé, como nos slides */}
      <AbsoluteFill style={{ background: `radial-gradient(60% 40% at 50% 112%, rgba(255,122,89,${c.claro ? 0.16 : 0.22}), transparent 70%)` }} />

      {/* Rótulo e coordenadas */}
      <div
        style={{
          position: 'absolute',
          left: MARGEM,
          right: MARGEM,
          top: MARGEM - 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 22,
          fontWeight: 600,
          letterSpacing: '0.16em',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 13, color: destaque }}>
          <span style={{ width: 44, height: 3, borderRadius: 2, background: COR.coral }} />
          PLAYLIST SURFZADA
        </span>
        <span style={{ fontSize: 18, color: texto, opacity: 0.8 }}>{c.coordenadas}</span>
      </div>

      {/* Nome e frase */}
      <div style={{ position: 'absolute', left: MARGEM - 6, right: MARGEM, top: 606 }}>
        <div style={{ fontSize: 196, fontWeight: 600, letterSpacing: '-0.045em', lineHeight: 1, whiteSpace: 'nowrap' }}>{c.nome}</div>
        <div style={{ marginTop: 22, marginLeft: 6, fontSize: 50, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          {c.frase[0]}
          <span style={{ color: COR.coral, fontWeight: 600 }}>{c.frase[1]}</span>
        </div>
      </div>

      {/* Pé: logo e legenda do lugar */}
      <div
        style={{
          position: 'absolute',
          left: MARGEM,
          right: MARGEM,
          bottom: MARGEM - 22,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <Simbolo largura={64} em={-100} cor={texto} />
          <Wordmark tamanho={31} cor={texto} />
        </div>
        <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: '0.18em', color: texto, opacity: 0.75 }}>{c.legenda}</span>
      </div>

      {/* Crédito da foto, na vertical junto à borda direita */}
      <div
        style={{
          position: 'absolute',
          right: 22,
          top: 300,
          writingMode: 'vertical-rl',
          transform: 'rotate(180deg)',
          fontSize: 12,
          fontWeight: 500,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          color: c.claro ? 'rgba(10,10,10,0.55)' : 'rgba(255,255,255,0.6)',
        }}
      >
        {c.credito}
      </div>
    </AbsoluteFill>
  );
}
