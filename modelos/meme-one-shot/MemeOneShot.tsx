import { AbsoluteFill, OffthreadVideo, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

import { Logo } from '@compartilhado/marca/Marca';
import { CHEGADA, FONTE, FPS } from '@compartilhado/tema';

/**
 * Meme "one shot": um plano real do mar (sem cortes) com uma frase no topo, no estilo
 * de texto nativo do Reels/TikTok. A marca só aparece discreta no fim.
 *
 * Fundo: vídeo do iPhone convertido de HDR para SDR e cortado (`converter` no
 * assets.json da peça). A peça passa a URL do fundo, a frase e a duração.
 */
export type PropsMeme = {
  /** Frase do topo, já no primeiro quadro (o gancho tem que estar lá antes do play). Aceita \n. */
  texto: string;
  /** URL do vídeo de fundo (ex.: arquivo('fundo-ipanema.mp4')). */
  fundo: string;
  /** Cor do logo do fim (padrão branco); use uma escura quando o fim do plano é espuma. */
  corLogo?: string;
};

/** Duração em frames de um fundo de `segundos`. */
export const duracaoMeme = (segundos: number) => Math.round(segundos * FPS);

export function MemeOneShot({ texto, fundo, corLogo = '#fff' }: PropsMeme) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const marcaEm = durationInFrames - 42;
  const marca = interpolate(frame, [marcaEm, marcaEm + 14], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: CHEGADA,
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <OffthreadVideo src={fundo} />

      <TextoMeme texto={texto} />

      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 470 }}>
        <div style={{ opacity: marca, filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.35))' }}>
          <Logo tamanho={44} em={marcaEm} cor={corLogo} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

/** A frase no topo, em coordenadas de 1080×1920; `escala` = 2 para o vídeo 4K original. */
function TextoMeme({ texto, escala = 1, cor = '#fff' }: { texto: string; escala?: number; cor?: string }) {
  return (
    <AbsoluteFill style={{ alignItems: 'center', paddingTop: 330 * escala }}>
      <div
        style={{
          maxWidth: 900 * escala,
          padding: `0 ${40 * escala}px`,
          fontFamily: FONTE,
          fontWeight: 600,
          fontSize: 64 * escala,
          lineHeight: 1.22,
          color: cor,
          textAlign: 'center',
          whiteSpace: 'pre-line',
          letterSpacing: -0.5 * escala,
          textShadow: `0 ${2 * escala}px ${3 * escala}px rgba(0,0,0,0.45), 0 0 ${26 * escala}px rgba(0,0,0,0.28)`,
        }}
      >
        {texto}
      </div>
    </AbsoluteFill>
  );
}

/**
 * Só a frase, em PNG transparente 2160×3840, para o ffmpeg aplicar por cima do vídeo
 * original do iPhone sem recodificar cor nem resolução (HLG). O branco fica em ~92% do
 * sinal, como os brancos da espuma no próprio vídeo.
 */
export function CamadaTextoMeme({ texto }: { texto: string }) {
  return <TextoMeme texto={texto} escala={2} cor="rgb(235,235,235)" />;
}

/** O logo já desenhado (em = -60), no mesmo lugar do fim do MemeOneShot, em 2160×3840 transparente. */
export function CamadaLogoMeme() {
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 470 * 2 }}>
      <div style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.35))' }}>
        <Logo tamanho={44 * 2} em={-60} cor="rgb(235,235,235)" />
      </div>
    </AbsoluteFill>
  );
}
