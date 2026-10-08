import { Composition, Folder, Still } from 'remotion';

import { FORMATOS, FPS } from '@compartilhado/tema';
import { arquivosDaPeca } from '@compartilhado/util/arquivos';
import { CapaPlaylist, type Capa } from '@modelos/story-playlist/CapaPlaylist';
import { StoryPlaylist, duracaoPlaylist, type PropsStoryPlaylist } from '@modelos/story-playlist/StoryPlaylist';

import dados from './dados.json';

const SLUG = '2026-10-playlist-waikiki';
const arquivo = arquivosDaPeca(SLUG);

const capa: Capa = {
  nome: 'Waikiki',
  frase: ['Pra remar ', 'sem pressa.'],
  foto: arquivo('foto.jpg'),
  foco: '50% 40%',
  coordenadas: '21°16′N · 157°50′W',
  legenda: 'O‘AHU · CHARLES KAUHA, 1898',
  credito: 'Foto: Frank Davey, c. 1898 · Bishop Museum',
  claro: true,
};

const story: PropsStoryPlaylist = { vibe: 'waikiki', dados, capa: arquivo('capa.jpg') };

export function Composicoes() {
  return (
    <Folder name={SLUG}>
      {/* A capa sai primeiro: o render copia o JPG para public/, e o story usa no selo do disco. */}
      <Still id="playlist-waikiki-capa" component={CapaPlaylist} defaultProps={capa} {...FORMATOS['carrossel-1x1']} />
      <Composition
        id="playlist-waikiki"
        component={StoryPlaylist}
        defaultProps={story}
        durationInFrames={duracaoPlaylist('waikiki')}
        fps={FPS}
        {...FORMATOS['story-9x16']}
      />
    </Folder>
  );
}
