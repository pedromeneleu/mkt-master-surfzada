---
titulo: Playlist Waikiki
slug: 2026-10-playlist-waikiki
serie: null
modelo: story-playlist
formato: story-9x16
canais: [instagram, spotify]
status: revisao
responsavel: joao
publicar_em: null
publicado_em: null
link: null
renders:
  - composicao: playlist-waikiki-capa
    arquivo: surfzada-playlist-waikiki-capa-1x1.jpg
    escala: 2
    copiar_para_public: capa.jpg
  - composicao: playlist-waikiki
    arquivo: surfzada-playlist-waikiki-9x16.mp4
---

## Briefing

Divulgar a playlist Waikiki da Surfzada no Spotify: reggae e surf music tranquila, "pra remar
sem pressa". Vibe leve: fundo claro, 75 BPM, pulsos suaves, crossfade lento, 5 primeiras faixas
(3,2 s cada).

Duas saídas:

- **Capa 1:1** (2160×2160) para a playlist no Spotify, no layout do carrossel do tributo: foto do
  pico em cima fundindo no fundo, rótulo com traço coral e coordenadas, nome grande (legível na
  miniatura do Spotify), a frase da vibe e o logo no pé.
- **Story 9:16, 16 s, em loop perfeito** (conceito "disco-sol"): o logo grande, o sol vira um
  vinil girando dentro do anel coral, com a capa girando no selo, e a onda do logo balança na
  frente. Por baixo, "tocando agora" com as primeiras faixas; no pé, "Ouça no Spotify" e setas
  até o halo coral em y ≈ 1715, onde se cola o **sticker de link** do Instagram.

## Roteiro

Tudo é periódico em 480 quadros (voltas, pulsos, ondas e faixas), então o fim emenda no começo.
Sai sem trilha: no Instagram, use uma faixa da própria playlist como música do story.

## Legenda

_Story: sem legenda. Sticker de link: https://open.spotify.com/playlist/5sIdTpI0g7zXqRd4N6Yz8j_

## Hashtags

_Não se aplica (story)._

## Créditos

- Foto da capa: Charles Kauha com uma prancha alaia em Waikiki, Diamond Head ao fundo. Frank
  Davey (Bishop Museum), c. 1898, **domínio público** —
  https://commons.wikimedia.org/wiki/File:Hawaiian_with_surfboard_and_Diamond_Head_in_the_background.JPG
- Faixas: dados públicos do embed do Spotify (`npm run dados -- 2026-10-playlist-waikiki`).

## Notas de revisão

- Depois de mexer na capa, renderize de novo a peça inteira (`npm run render -- 2026-10-playlist-waikiki`): a capa
  sai primeiro e é copiada para public/ antes do story.
