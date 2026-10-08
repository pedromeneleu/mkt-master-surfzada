---
name: revisar
description: Revisa uma peça do repositório mkt contra o checklist de Merge Request (conteúdo, visual, licenças, técnico) e aponta problemas. Use quando pedirem para revisar ou conferir uma peça antes do MR ou da entrega.
---

1. Leia `pecas/<slug>/post.md`, `composicoes.tsx` e o checklist de `docs/06-revisao-e-git.md`.
2. `npm run checar` e `npm run quadros -- <peca>`; leia os PNGs.
3. Confira item por item do checklist: gancho, português, números/datas contra a fonte, créditos e
   licenças (`docs/08-licencas.md`), marca (`docs/07-marca.md`), área segura, loop, nada pesado no
   git (`git status`).
4. Responda com uma lista curta: o que está ok e o que precisa mudar (arquivo:linha quando for
   código). Não altere nada sem o usuário pedir.
