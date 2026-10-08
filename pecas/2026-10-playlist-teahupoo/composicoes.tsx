import { Composition, Folder, Still } from 'remotion';

import { FORMATOS, FPS } from '@compartilhado/tema';
import { arquivosDaPeca } from '@compartilhado/util/arquivos';
import { CapaPlaylist, type Capa } from '@modelos/story-playlist/CapaPlaylist';
import { StoryPlaylist, duracaoPlaylist, type PropsStoryPlaylist } from '@modelos/story-playlist/StoryPlaylist';

import dados from './dados.json';

const SLUG = '2026-10-playlist-teahupoo';
const arquivo = arquivosDaPeca(SLUG);

const capa: Capa = {
  nome: 'Teahupo’o',
  frase: ['Pra quando o mar ', 'pesa.'],
  foto: arquivo('foto.jpg'),
  foco: '42% 50%',
  coordenadas: '17°51′S · 149°16′W',
  legenda: 'TAITI · POLINÉSIA FRANCESA',
  credito: 'Foto: The Last Minute · CC BY 2.0',
  claro: false,
};

const story: PropsStoryPlaylist = { vibe: 'teahupoo', dados, capa: arquivo('capa.jpg') };

export function Composicoes() {
  return (
    <Folder name={SLUG}>
      {/* A capa sai primeiro: o render copia o JPG para public/, e o story usa no selo do disco. */}
      <Still id="playlist-teahupoo-capa" component={CapaPlaylist} defaultProps={capa} {...FORMATOS['carrossel-1x1']} />
      <Composition
        id="playlist-teahupoo"
        component={StoryPlaylist}
        defaultProps={story}
        durationInFrames={duracaoPlaylist('teahupoo')}
        fps={FPS}
        {...FORMATOS['story-9x16']}
      />
    </Folder>
  );
}
