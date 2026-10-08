---
titulo: {{TITULO}}
slug: {{SLUG}}
serie: null
modelo: story-playlist
formato: story-9x16
canais: [instagram, spotify]
status: producao
responsavel: {{RESPONSAVEL}}
publicar_em: null
publicado_em: null
link: null
renders:
  - composicao: {{ID}}-capa
    arquivo: surfzada-{{NOME}}-capa-1x1.jpg
    escala: 2
    copiar_para_public: capa.jpg
  - composicao: {{ID}}
    arquivo: surfzada-{{NOME}}-9x16.mp4
---

## Briefing

Divulgar a playlist _<nome>_ da Surfzada no Spotify (modelo `story-playlist`): capa 1:1 para o
Spotify e story 9:16 em loop de 16 s com o sticker de link.

1. `npm run dados -- {{SLUG}} <link da playlist>` (faixas do Spotify → dados.json)
2. Troque a foto em `assets/foto.jpg` (+ `assets/creditos.json`) e os textos da capa em
   composicoes.tsx; escolha a vibe.

## Roteiro

Loop perfeito de 480 quadros. Sai sem trilha: no Instagram, use uma faixa da própria playlist.

## Legenda

_Story: sem legenda. Sticker de link: <link da playlist>._

## Hashtags

_Não se aplica (story)._

## Créditos

- Foto da capa: _autor, licença e link (o crédito também vai na capa)._

## Notas de revisão

- 
