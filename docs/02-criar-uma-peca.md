# 02 · Criar uma peça, do briefing à publicação

**Peça** = uma pauta: um post, ou alguns posts da mesma ideia (ex.: o vídeo e o carrossel de um
episódio, as 4 variações de um meme). Cada peça é uma pasta `pecas/AAAA-MM-<nome>/`.

```
ideia → producao → revisao → aprovado → publicado        (ou arquivado)
```

## Resumo

```bash
git switch master && git pull
npm run novo -- <nome> [--modelo=<modelo>] --titulo="..."
git switch -c peca/AAAA-MM-<nome>
# post.md: briefing, roteiro, legenda · composicoes.tsx/código
npm run dados -- <nome>          # se o modelo gera dados
npm run assets -- <nome>
npm run studio                   # ou: npm run quadros -- <nome>
npm run render -- <nome>
npm run checar
git add pecas/AAAA-MM-<nome> pecas/index.ts && git commit -m "Peça <nome>: ..."
git push -u origin peca/AAAA-MM-<nome>       # e abre o Merge Request
npm run entregar -- <nome>       # depois de aprovado
# post.md: status publicado, publicado_em, link
```

## 1. Antes de começar

- Atualize a `master` (`git switch master && git pull`) e rode `npm ci` se o `package-lock.json` mudou.
- Veja se já existe um modelo para o formato: `npm run pecas -- --modelos`. Formato que se repete →
  modelo (mais rápido e padronizado). Coisa única → peça própria.
- Combine o nome: curto, kebab-case, sem acento, sem data (o `novo` põe o mês). Ex.:
  `previsao-fds-17-out`, `parabens-tati-weston`, `explica-ep02`.

## 2. Criar a pasta

```bash
npm run novo -- playlist-pororoca --modelo=story-playlist --titulo="Playlist Pororoca"
npm run novo -- parabens-tati-weston --titulo="Parabéns, Tati"        # peça própria
```

Opções: `--formato=story-9x16|reel-9x16|carrossel-1x1|carrossel-4x5|video-16x9`, `--mes=AAAA-MM`
(padrão: mês atual), `--responsavel=<nome>`.

O comando cria a pasta a partir do template do modelo (ou de `modelos/_peca-propria/template/`) e
registra a peça em `pecas/index.ts`. Crie a branch:

```bash
git switch -c peca/2026-10-playlist-pororoca
```

## 3. Briefing no `post.md`

Antes de qualquer código, preencha no `post.md`:

- **Briefing**: objetivo, público, gancho, referências (links), o que **não** fazer.
- **Roteiro**: cena a cena, com tempo e texto na tela (tabela).
- **Legenda** e **Hashtags** (pode ser rascunho).
- **Créditos**: tudo de terceiros (ver [08-licencas.md](08-licencas.md)).
- Frontmatter: `status: producao`, `formato`, `canais`, `publicar_em` se já tiver data.

Com IA: peça para ela ler o `AGENTS.md`, o README do modelo e o `post.md`, e escrever o roteiro
antes do código.

## 4. Material

- **Arquivo leve e livre** (≤ 2 MB, licença livre: foto CC, ícone) → `pecas/<slug>/assets/`, com
  `assets/creditos.json`. Vai para o git.
- **Pesado ou com direitos** (vídeo, foto da WSL, trilha) → Drive, em
  `MKT_DRIVE/pecas/<slug>/` (ou o bruto em `Captações/<captação>/`), e uma linha no
  `assets.json` (formato em [04-assets-e-drive.md](04-assets-e-drive.md)).
- **Dados** (previsão, playlist): `npm run dados -- <peca>` grava `dados.json` na pasta da peça.

Depois:

```bash
npm run assets -- <peca>      # monta public/pecas/<slug>/ (assets/ + Drive, com conversão de vídeo)
```

## 5. Montar a peça

- **Com modelo**: ajuste `composicoes.tsx` (textos, vibe, opções do modelo; README do modelo).
- **Própria**: comece por `Peca.tsx`. Use:
  - `@compartilhado/tema`: `COR`, `FONTE`, `FPS`, `FORMATOS`, `CHEGADA`/`SUAVE`/`SAIDA`;
  - `@compartilhado/marca/Marca`: `Logo`, `Simbolo`, `Wordmark`, `FundoClaro`, `FundoEscuro`;
  - `@compartilhado/marca/Texto`: `Titulo` (palavras em `*asteriscos*` saem em coral), `Rotulo`, `Contador`;
  - `@compartilhado/componentes/Sfx`: `<Sfx nome="pop" em={frame} />`;
  - `arquivo('foto.jpg')` (de `arquivosDaPeca(SLUG)`) para tudo de `public/pecas/<slug>/`.
- Cada `<Composition>`/`<Still>` fica em `composicoes.tsx`, dentro de `<Folder name={SLUG}>`, com
  id único em kebab-case (`playlist-pororoca`, `playlist-pororoca-capa`).
- Liste em `renders:` do post.md o que deve sair (composição + nome do arquivo). Carrossel: campo
  `carrossel:` (ver [05-render-e-entrega.md](05-render-e-entrega.md)).

## 6. Ver e revisar

```bash
npm run studio                          # pasta da peça no Studio (atualiza ao salvar)
npm run quadros -- <peca>               # 4 quadros de cada composição em out/<slug>/quadros/
npm run quadros -- <peca> <id> 0 45 90  # quadros específicos
```

Confira: primeiro quadro já funciona parado (feed), textos dentro da área segura
([07-marca.md](07-marca.md)), créditos visíveis, loop emendando (se for loop), sem erro de português.

## 7. Renderizar

```bash
npm run render -- <peca>           # out/<slug>/
npm run render -- <peca> --4k      # vídeos em 2× (para tudo que é vetor/texto)
npm run render -- <peca> --so=<id> # só uma composição
```

## 8. Revisão (Merge Request)

```bash
npm run checar
git add pecas/<slug> pecas/index.ts
git commit -m "Peça <nome>: <o que mudou>"
git push -u origin peca/<slug>
```

Abra o MR no GitLab com o template **Peca** (checklist), anexe os PNGs de `out/<slug>/quadros/`
(ou o link do render no Drive) e mude o `status` para `revisao`. Detalhes em
[06-revisao-e-git.md](06-revisao-e-git.md).

## 9. Entregar e publicar

Aprovado:

```bash
npm run entregar -- <peca>     # out/<slug>/ → MKT_DRIVE/entregas/<slug>/ e status: aprovado
```

Quem posta pega os arquivos em `entregas/<slug>/` e a legenda no `post.md`. Depois de publicar,
atualize o post.md (`status: publicado`, `publicado_em: AAAA-MM-DD`, `link: <url>`), commite e faça
o merge do MR.

## Peça recorrente (ex.: previsão da semana)

Cada edição é uma peça nova a partir do modelo, não uma edição da anterior:

```bash
npm run novo -- previsao-fds-17-out --modelo=story-previsao --titulo="Previsão até domingo (17/10)"
npm run dados -- previsao-fds-17-out
npm run render -- previsao-fds-17-out
```
