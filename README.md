# Surfzada · Marketing

Posts da Surfzada (stories, reels, carrosséis e vídeos) feitos em código, com
[Remotion](https://www.remotion.dev/): **um projeto só**, **modelos** para os formatos que se
repetem e **uma pasta por peça**, com o briefing, a legenda e o status no `post.md`.

O git guarda o código, os textos e os arquivos leves. Vídeos brutos, fotos com direitos, trilhas
e renders ficam no **Google Drive** (`MKT_DRIVE`), e cada peça lista o que precisa no `assets.json`.

## Começo rápido

```bash
npm ci                          # Node 22+ (ver .nvmrc)
cp .env.exemplo .env            # e ajuste MKT_DRIVE para a pasta do Drive na sua máquina
npm run sfx                     # gera os efeitos sonoros
npm run pecas                   # painel das peças (status, formato, datas)
npm run assets -- <peca>        # traz do Drive o que a peça precisa
npm run studio                  # Remotion Studio: uma pasta por peça
npm run render -- <peca>        # out/<slug>/
```

Peça nova: `npm run novo -- <nome> [--modelo=story-playlist]`. O passo a passo completo está em
[docs/02-criar-uma-peca.md](docs/02-criar-uma-peca.md).

## Mapa

```
pecas/AAAA-MM-<nome>/   uma peça = um post (ou um conjunto de posts da mesma pauta)
  post.md               frontmatter (status, renders...) + briefing, roteiro, legenda, hashtags, créditos
  composicoes.tsx       as composições da peça no Studio
  assets.json           o que vem do Drive · assets/ arquivos leves no git · dados.json dados gerados
modelos/                formatos recorrentes (story-previsao, story-playlist, meme-one-shot) + templates
src/compartilhado/      tema (cores, fonte, formatos), marca (logo, textos), Sfx, mascote Andy, utilitários
scripts/                a CLI (npm run ...)
series/                 séries de conteúdo (surfzada-explica: pautas, sons)
produtos/               produtos físicos (camisa TSHIRT-01: geradores da arte)
design/mascote/         conceitos e regras do mascote Andy
docs/                   como fazer tudo (comece pelo 01)
```

## Documentação

| | |
|---|---|
| [01 · Setup](docs/01-setup.md) | instalar, configurar o Drive e o .env |
| [02 · Criar uma peça](docs/02-criar-uma-peca.md) | do briefing à publicação, passo a passo |
| [03 · Modelos](docs/03-modelos.md) | usar e criar modelos |
| [04 · Assets e Drive](docs/04-assets-e-drive.md) | o que fica no git e no Drive, `assets.json`, migração do legado |
| [05 · Render e entrega](docs/05-render-e-entrega.md) | formatos do Instagram, render, 4K, carrossel, entrega |
| [06 · Revisão e git](docs/06-revisao-e-git.md) | branches, Merge Request, checklist |
| [07 · Marca](docs/07-marca.md) | cores, fonte, logo, tom, áreas seguras |
| [08 · Licenças](docs/08-licencas.md) | fotos, vídeos e músicas de terceiros |
| [Convenções](docs/convencoes.md) | nomes de pastas, arquivos, ids e renders |

Para IAs (Claude Code, Codex): [AGENTS.md](AGENTS.md).
