# Modelos

Formatos recorrentes: um componente que recebe dados/props da peça, um `dados.ts` opcional
(`npm run dados -- <peca>`) e um `template/` que o `npm run novo -- <nome> --modelo=<modelo>`
copia para `pecas/AAAA-MM-<nome>/`.

| Modelo | Formato | Para quê |
|---|---|---|
| [story-previsao](story-previsao/README.md) | story 9:16 | previsão de picos × dias, com dados da API |
| [story-playlist](story-playlist/README.md) | story 9:16 + capa 1:1 | divulgar playlist do Spotify |
| [meme-one-shot](meme-one-shot/README.md) | reel 9:16 | plano real do mar + frase-meme |
| `_peca-propria` | qualquer | esqueleto de peça sem modelo (`npm run novo -- <nome>`) |

**Quando criar um modelo novo:** quando o mesmo formato vai se repetir (3ª vez que alguém copia uma
peça). Passo a passo em [docs/03-modelos.md](../docs/03-modelos.md).

O carrossel do Surfzada Explica ainda é código da peça `2026-09-explica-ep01`; vira modelo
`carrossel-explica` quando o ep02 tiver carrossel.
