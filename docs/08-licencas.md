# 08 · Licenças e créditos

Toda foto, vídeo, música, fonte ou modelo 3D que não foi feito pela equipe entra na seção
**Créditos** do `post.md` com **autor, licença e link**. Na dúvida, não use e pergunte.

## Onde guardar, conforme a licença

| Licença | Pode ir para o git? | Crédito |
|---|---|---|
| Material próprio da Surfzada | sim, se ≤ 2 MB (senão Drive) | — |
| Domínio público, CC0 | sim (≤ 2 MB), com `creditos.json` | recomendável |
| CC BY / CC BY-SA | sim (≤ 2 MB), com `creditos.json` | **obrigatório**, visível na peça e/ou na legenda |
| Pexels, Pixabay (fotos/vídeos) | não: Drive (tamanho) | recomendável (nome do autor) |
| Música da Pixabay | **não** (a licença proíbe redistribuir o arquivo solto): Drive | — (guarde o certificado se tiver Content ID) |
| Fotos de fotógrafos/WSL/revistas, sem licença | **não**: Drive, só com decisão explícita do João | **obrigatório** em cada slide/cena |
| Música comercial (Spotify etc.) | **nunca** no arquivo: só colada no próprio Instagram | — |

`creditos.json` (na pasta onde está a foto):

```json
{
  "foto.jpg": {
    "titulo": "Teahupoo1.jpg",
    "autor": "The Last Minute (Flickr)",
    "data": "2007-11-01",
    "licenca": "CC BY 2.0",
    "fonte": "https://commons.wikimedia.org/wiki/File:Teahupoo1.jpg"
  }
}
```

## Regras que já valem

- **Vídeo gerado por IA**: não para cenas explicativas (erra a física) nem como "filmagem". Upscale
  ou ajuste de material nosso, ok, mas declare nas notas.
- **Marcas de terceiros** (Billabong, WSL): não usar logo. Homenagem leva aviso de independência
  (ver `pecas/2026-10-tributo-andy`).
- **Clipe de outro perfil**: não, nem com crédito, sem autorização por escrito.
- **Pessoas reconhecíveis** em material nosso: para anúncio pago, peça autorização.
- **Temas sensíveis** (morte, saúde mental): pelo lado da prevenção, com o CVV 188.
- **Modelo 3D "Camisa Zakaria"** (Sketchfab, CC BY): crédito a Zakaria Essekkouri em qualquer render
  (ver `produtos/camisa-tshirt-01/creditos.md`).

## Fontes boas de material livre

Wikimedia Commons (filtre por licença), Pexels e Pixabay (vídeo), Freesound CC0 (som). Para som, a
preferência é o `npm run sfx` (gerado por código, sem licença de terceiros).
