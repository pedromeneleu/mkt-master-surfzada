# 06 · Revisão e git

## Branches

- `master`: o que está aprovado. Ninguém commita direto nela.
- `peca/<slug>`: uma branch por peça (`peca/2026-10-playlist-pororoca`).
- `infra/<assunto>`: mudanças em `src/compartilhado/`, `modelos/`, `scripts/` ou `docs/`
  (`infra/modelo-carrossel-explica`). Não misture com uma peça.

```bash
git switch master && git pull
git switch -c peca/2026-10-playlist-pororoca
```

## Commits

Em português, no imperativo ou descritivo, curtos: `Peça playlist-pororoca: roteiro e capa`,
`Modelo story-previsao: opção de 4 picos`. Rode `npm run checar` antes.

**Nunca commite:** `.env`, `public/`, `out/`, vídeo/áudio, `.blend`/`.af`, fotos com direitos (o
`.gitignore` e o `checar` ajudam, mas confira o `git status`).

## Merge Request

1. `git push -u origin peca/<slug>` e abra o MR para a `master` com o template **Peca**.
2. Anexe os PNGs de `out/<slug>/quadros/` (arraste no MR) ou o link do render no Drive.
3. Mude `status: revisao` no post.md.
4. Quem revisa comenta no MR; ajustes viram commits na mesma branch.
5. Aprovado: `npm run entregar -- <slug>`, commit do status, **merge** (squash) e apague a branch.

## Checklist de revisão

Conteúdo:

- [ ] Gancho no primeiro quadro (feed e stories mostram o quadro parado).
- [ ] Texto revisado (português, acentos, nomes próprios, números e datas conferidos na fonte).
- [ ] Legenda e hashtags no post.md.
- [ ] Créditos: tudo de terceiros com autor e licença, e o crédito visível quando a licença pede.

Visual:

- [ ] Cores, fonte e logo da marca (`@compartilhado`), sem paleta copiada.
- [ ] Nada importante fora da área segura (interface do Instagram).
- [ ] Loop emendando, se for loop. Sem quadro preto no início/fim.
- [ ] Som: sem trilha no arquivo (a não ser licenciada), efeitos em volume baixo.

Técnico:

- [ ] `npm run checar` passa.
- [ ] Nada pesado ou com direitos no git; o que vem do Drive está no `assets.json`.
- [ ] Mexeu em `src/compartilhado/` ou num modelo? Quadros de outra peça afetada no MR.

## Quem faz o quê

| Papel | |
|---|---|
| Autor | cria a peça, renderiza, abre o MR, entrega |
| Revisor | confere o checklist, aprova o MR |
| Responsável pelo Drive | organiza `Captações/` e `pecas/`, sobe brutos, mantém `entregas/` |
| Quem posta | pega `entregas/<slug>/` + legenda do post.md, posta e atualiza `status`/`link` |

## Ferramenta de IA no fluxo

A IA pode fazer qualquer passo, mas: não faz push/merge sem pedido, não apaga material do Drive, e
sempre mostra os quadros renderizados antes de dizer que terminou. Regras em `AGENTS.md`.
