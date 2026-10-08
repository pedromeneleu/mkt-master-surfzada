---
name: novo-post
description: Cria uma peça nova de marketing (post, story, reel, carrossel) no repositório mkt a partir de um modelo ou do esqueleto de peça própria, e preenche o briefing no post.md. Use quando pedirem um post, story, reel ou carrossel novo.
---

1. Leia `AGENTS.md` e `docs/02-criar-uma-peca.md` se ainda não leu nesta conversa.
2. Rode `npm run pecas -- --modelos` e escolha o modelo que serve ao pedido (ou peça própria).
   Se não estiver claro qual formato/modelo, pergunte ao usuário.
3. Defina um nome curto em kebab-case sem acento e sem data e rode
   `npm run novo -- <nome> [--modelo=<modelo>] --titulo="<título>"`.
4. Crie a branch: `git switch -c peca/<slug>`.
5. Preencha no `pecas/<slug>/post.md`: Briefing, Roteiro (tabela cena a cena), Legenda, Hashtags e
   Créditos, a partir do pedido. Mostre o roteiro ao usuário antes de escrever código.
6. Siga o README do modelo (ou `Peca.tsx` para peça própria). Depois, use a skill `/renderizar`.
