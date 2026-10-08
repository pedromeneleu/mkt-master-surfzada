# meme-one-shot

Reel 9:16 com um plano real do mar, sem cortes, uma frase-meme no topo (texto nativo do Reels/TikTok) e o logo discreto no fim.

**Peça feita com ele:** `2026-10-meme-one-shot` (Ipanema e Saquarema × "trabalho" e "prova").

## Criar um novo

```bash
npm run novo -- meme-flat --modelo=meme-one-shot --titulo="Meme: desculpa, mar"
# assets.json: aponte o .MOV em Captações/... e o corte; composicoes.tsx: TEXTO e SEGUNDOS
npm run assets -- meme-flat      # converte HDR → SDR (tonemap hable), recorta e tira o GPS
npm run render -- meme-flat
```

## Duas formas de entregar

1. **Render do Remotion** (`<id>`): o fundo convertido para SDR + texto + logo. Simples.
2. **Vídeo original com camada** (melhor cor): renderize `<id>-camada-texto` (e `-camada-logo`), PNG
   transparente 2160×3840, e aplique com ffmpeg sobre o `.MOV` original sem mexer na cor
   (HLG/BT.2020 10-bit, 60 fps; saída HEVC 1080×1920). O branco do texto fica em 235 (~92% do
   sinal HLG) para não estourar em tela HDR. Registre o comando usado no post.md da peça.

## Regras

- Material real, filmado pela equipe. Nada de vídeo gerado por IA.
- Não reusar um plano que já foi para outra peça (confira com `grep -r "IMG_XXXX" pecas`).
- Frase já no primeiro quadro: no feed, o gancho tem que estar lá antes do play.
