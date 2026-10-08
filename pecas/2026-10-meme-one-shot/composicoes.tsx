import { Composition, Folder, Still } from 'remotion';

import { COR, FORMATOS, FPS } from '@compartilhado/tema';
import { arquivosDaPeca } from '@compartilhado/util/arquivos';
import { CamadaLogoMeme, CamadaTextoMeme, MemeOneShot, duracaoMeme } from '@modelos/meme-one-shot/MemeOneShot';

const SLUG = '2026-10-meme-one-shot';
const arquivo = arquivosDaPeca(SLUG);

const FRASES = {
  trabalho: 'O que fica na minha mente quando tô no trabalho:',
  prova: 'O que fica na minha mente quando tô na semana de prova:',
} as const;

type Fundo = { arquivo: string; segundos: number; corLogo?: string };

const FUNDOS: Record<'ipanema' | 'saquarema' | 'surfista', Fundo> = {
  /** IMG_6440: Ipanema, sexta 7h45, 0–6,6 s. */
  ipanema: { arquivo: 'fundo-ipanema.mp4', segundos: 6.6 },
  /** IMG_6577: Saquarema visto do morro, 1,2–12,4 s (sem a descida inicial da câmera). */
  saquarema: { arquivo: 'fundo-saquarema.mp4', segundos: 11.2 },
  /** Pexels 13683526: surfista numa direita, 5,68 s inteiros (25 fps). Termina na espuma: logo escuro. */
  surfista: { arquivo: 'fundo-surfista.mp4', segundos: 5.68, corLogo: COR.marFundo },
};

/** Camadas 4K transparentes para o ffmpeg aplicar sobre o vídeo original em HDR (ver post.md). */
const CAMADA = { width: 2160, height: 3840 };

export function Composicoes() {
  return (
    <Folder name={SLUG}>
      {(Object.keys(FUNDOS) as (keyof typeof FUNDOS)[]).flatMap((fundo) =>
        (Object.keys(FRASES) as (keyof typeof FRASES)[]).map((frase) => (
          <Composition
            key={`${fundo}-${frase}`}
            id={`meme-${fundo}-${frase}`}
            component={MemeOneShot}
            defaultProps={{ texto: FRASES[frase], fundo: arquivo(FUNDOS[fundo].arquivo), corLogo: FUNDOS[fundo].corLogo }}
            durationInFrames={duracaoMeme(FUNDOS[fundo].segundos)}
            fps={FPS}
            {...FORMATOS['reel-9x16']}
          />
        )),
      )}
      {(Object.keys(FRASES) as (keyof typeof FRASES)[]).map((frase) => (
        <Still key={frase} id={`meme-camada-texto-${frase}`} component={CamadaTextoMeme} defaultProps={{ texto: FRASES[frase] }} {...CAMADA} />
      ))}
      <Still id="meme-camada-logo" component={CamadaLogoMeme} {...CAMADA} />
    </Folder>
  );
}
