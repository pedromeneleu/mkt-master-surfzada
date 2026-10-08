---
name: renderizar
description: Prepara os assets, gera os quadros de revisão e renderiza uma peça do repositório mkt (npm run assets / quadros / render). Use quando pedirem para renderizar, gerar o vídeo ou ver como ficou uma peça.
---

1. Identifique a peça (slug ou parte dele; `npm run pecas` lista).
2. `npm run assets -- <peca>`. Se faltar algo do Drive, mostre a lista ao usuário e pare.
3. `npm run dados -- <peca>` só se o usuário pediu dados novos (previsão, playlist).
4. `npm run quadros -- <peca>` e **leia os PNGs** de `out/<slug>/quadros/` com a ferramenta de
   imagem. Confira gancho no 1º quadro, área segura, textos e créditos. Corrija o que estiver errado
   antes de seguir.
5. `npm run render -- <peca>` (ou `--so=<id>`, `--4k`). Diga onde os arquivos ficaram
   (`out/<slug>/`) e envie um quadro ao usuário.
6. Rode `npm run checar`.
