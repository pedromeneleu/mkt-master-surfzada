---
titulo: Meme one shot — "O que fica na minha mente…"
slug: 2026-10-meme-one-shot
serie: null
modelo: meme-one-shot
formato: reel-9x16
canais: [instagram, tiktok]
status: revisao
responsavel: joao
publicar_em: null
publicado_em: null
link: null
renders:
  - composicao: meme-ipanema-trabalho
    arquivo: surfzada-meme-ipanema-trabalho-9x16.mp4
  - composicao: meme-ipanema-prova
    arquivo: surfzada-meme-ipanema-prova-9x16.mp4
  - composicao: meme-saquarema-trabalho
    arquivo: surfzada-meme-saquarema-trabalho-9x16.mp4
  - composicao: meme-saquarema-prova
    arquivo: surfzada-meme-saquarema-prova-9x16.mp4
  - composicao: meme-surfista-depois
    arquivo: surfzada-meme-surfista-depois-9x16.mp4
  - composicao: meme-camada-texto-trabalho
    arquivo: surfzada-meme-camada-texto-trabalho.png
  - composicao: meme-camada-texto-prova
    arquivo: surfzada-meme-camada-texto-prova.png
  - composicao: meme-camada-logo
    arquivo: surfzada-meme-camada-logo.png
---

## Briefing

Vídeos curtos de divulgação com material real (nada de vídeo gerado por IA): um plano do mar sem
cortes, com uma frase-meme no topo no estilo de texto nativo do Reels/TikTok e a marca discreta no
fim. Público: quem trabalha/estuda e surfa.

Fundos:

- **Ipanema** (`IMG_6440.mov`): vertical, sexta 19/06/2026 às 7h45. Panorâmica da esquerda pra
  direita: lixeira laranja, shorebreak pesado, um tubo verde aos ~4 s e uma moça passando no fim
  (cortado em 6,6 s).
- **Saquarema** (`IMG_6577.MOV`, Drive `Captações/SAQUAREMA-0626`): 4K 60 fps HDR, visto do morro
  com grama na frente, cortado de 1,2 s a 12,4 s. **Não reusar este clipe** em outras peças
  (já foi para o reels do meme).
- **Surfista** (Pexels 13683526, Drive `pecas/2026-10-meme-one-shot/pexels-13683526_2160_3840_25fps.mp4`):
  4K vertical, 25 fps, SDR, 5,68 s inteiros sem cortes. Surfista de prancha laranja numa direita,
  a câmera acompanha a manobra e o plano termina na espuma; por isso o logo do fim sai escuro
  (`COR.marFundo`), o branco sumia na espuma.

## Roteiro

- Texto grande no terço de cima, na fonte da marca, já no primeiro quadro.
- Logo entra discreto ~1,4 s antes do fim.
- Som: o próprio mar ou um áudio em alta, colado no Instagram.

Frases (em `composicoes.tsx`):

- trabalho: "O que fica na minha mente quando tô no trabalho:"
- prova: "O que fica na minha mente quando tô na semana de prova:"
- surfista (só com o fundo "surfista"): "“Talvez depois”" + linha em branco + "E se não tiver
  “depois”?"

Outras frases pesquisadas (para as próximas): "Sexta, 7h45. Seu chefe acha que você tá no
trânsito." · "Desculpa pelas coisas que eu disse quando tava flat." · "Amanhã alguém vai te falar
'tinha que ter vindo ontem'. O ontem é hoje." · "POV: você olhou a previsão na quinta à noite."

## Legenda

A frase + "Previsão de surf grátis: Surfzada"

## Hashtags

#surf #ipanema #surfrio #saquarema

## Créditos

Imagens próprias (João), exceto o fundo "surfista": vídeo 13683526 do Pexels
(https://www.pexels.com/video/13683526/), Licença Pexels (uso livre, crédito recomendado).
**Falta o nome do autor** — conferir na página do vídeo e completar aqui.

## Notas técnicas

**Versão "vídeo original"** (a preferida, 2026-10-03): a conversão de cor e a recompressão
estragavam o vídeo, então o texto (e opcionalmente o logo) sai como PNG transparente 2160×3840
(`meme-camada-texto-<frase>`, `meme-camada-logo`) e o ffmpeg aplica por cima do `.MOV` original
**sem mexer na cor**: HLG/BT.2020 10-bit, 60 fps, 12,5 s inteiros, sem GPS. Saída 1080×1920 HEVC
(crf 16, até 25 Mbps), ~39 MB. O branco do texto fica em 235 (~92% do sinal HLG), para não
estourar em tela HDR. Entregues: `surfzada-meme-mente-{trabalho,prova}-1080[-logo].mp4` (Drive,
`entregas/2026-10-meme-one-shot/`).

## Notas de revisão

- Migrado de `mkt/videos/one-shot-ipanema` + `trailer/src/MemeOneShot.tsx` em 2026-10-05.
- 2026-10-08: novo fundo "surfista" (Pexels) com frase própria ("Talvez depois"), render direto do Remotion
  (o original já é SDR, não precisa da versão "vídeo original" com camada).
- O comando ffmpeg exato da versão "vídeo original" não ficou registrado; ao refazer, documentar
  aqui.
