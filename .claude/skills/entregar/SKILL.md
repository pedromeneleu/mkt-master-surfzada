---
name: entregar
description: Entrega uma peça aprovada do repositório mkt no Drive (npm run entregar) e atualiza o status no post.md; depois de publicada, registra data e link. Use quando a peça for aprovada ou publicada.
---

1. Confirme com o usuário que a peça foi aprovada (o comando muda o status para `aprovado`).
2. Confira que `out/<slug>/` tem os renders atuais (senão, `/renderizar`).
3. `npm run entregar -- <peca>` e mostre a lista copiada para `$MKT_DRIVE/entregas/<slug>/`.
4. Se o usuário informar que publicou: no post.md, `status: publicado`, `publicado_em: AAAA-MM-DD`
   e `link: <url>`.
5. Commit na branch da peça (`Peça <nome>: entregue` / `publicada`). Não faça push nem merge sem
   pedido.
