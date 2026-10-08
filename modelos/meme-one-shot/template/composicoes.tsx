import { Composition, Folder, Still } from 'remotion';

import { FORMATOS, FPS } from '@compartilhado/tema';
import { arquivosDaPeca } from '@compartilhado/util/arquivos';
import { CamadaLogoMeme, CamadaTextoMeme, MemeOneShot, duracaoMeme } from '@modelos/meme-one-shot/MemeOneShot';

const SLUG = '{{SLUG}}';
const arquivo = arquivosDaPeca(SLUG);

// TROQUE: a frase e o fundo (convertido pelo assets.json para public/pecas/{{SLUG}}/fundo.mp4).
const TEXTO = 'O que fica na minha mente quando tô no trabalho:';
const SEGUNDOS = 8;

/** Camadas 4K transparentes para aplicar sobre o vídeo original em HDR (ver modelos/meme-one-shot/README.md). */
const CAMADA = { width: 2160, height: 3840 };

export function Composicoes() {
  return (
    <Folder name={SLUG}>
      <Composition
        id="{{ID}}"
        component={MemeOneShot}
        defaultProps={{ texto: TEXTO, fundo: arquivo('fundo.mp4') }}
        durationInFrames={duracaoMeme(SEGUNDOS)}
        fps={FPS}
        {...FORMATOS['reel-9x16']}
      />
      <Still id="{{ID}}-camada-texto" component={CamadaTextoMeme} defaultProps={{ texto: TEXTO }} {...CAMADA} />
      <Still id="{{ID}}-camada-logo" component={CamadaLogoMeme} {...CAMADA} />
    </Folder>
  );
}
