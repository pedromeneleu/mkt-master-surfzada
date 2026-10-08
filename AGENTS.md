# AGENTS.md — instruções para IAs (Claude Code, Codex e outras)

Este repositório gera os posts da Surfzada em Remotion. Leia isto inteiro antes de mexer. A
documentação humana está em `docs/`; aqui vão as regras e as receitas que você deve seguir.

**Responda e escreva sempre em português do Brasil** (código, comentários, docs e mensagens de commit).

## Regras de ouro

1. **Use a CLI** (`npm run ...`) em vez de reinventar: criar peça, trazer assets, gerar dados,
   renderizar, revisar e entregar já têm comando. Não escreva scripts soltos para isso.
2. **Nada pesado no git.** Vídeo, áudio, `.blend`, `.af`, fotos com direitos e renders vão para o
   Drive (`$MKT_DRIVE`) e entram no `assets.json` da peça. Arquivo leve e redistribuível (≤ 2 MB,
   licença livre) pode ir em `pecas/<slug>/assets/`. O `npm run checar` acusa o que passar disso.
3. **Nunca caminhos da máquina** (`C:/Users/...`, `G:/O meu disco/...`, OneDrive). Use
   `arquivosDaPeca(SLUG)` no código das peças e `MKT_DRIVE`/`MKT_TEMP` nos scripts.
4. **Nunca `staticFile` direto numa peça**: use `arquivo('x.jpg')` (de `arquivosDaPeca`), que aponta
   para `public/pecas/<slug>/`. Efeitos: `<Sfx nome="pop" em={30} />` ou `arquivoSfx('pop')`.
5. **Marca única**: cores, fonte, curvas e formatos vêm de `@compartilhado/tema`; logo e textos de
   `@compartilhado/marca/*`. Não copie paleta nem componente para dentro da peça.
6. **O `post.md` é a fonte da verdade** da peça: briefing, roteiro, legenda, créditos e status.
   Atualize-o junto com o código (status, notas de revisão, créditos novos).
7. **Créditos e licenças**: toda foto/vídeo/música de terceiros entra em "Créditos" do post.md com
   autor, licença e link (regras em `docs/08-licencas.md`). Na dúvida sobre direitos, pergunte.
8. **Material real > IA**: não gere vídeo por IA para cenas; a equipe prefere material filmado.
9. **Revise renderizando quadros** (`npm run quadros -- <peca>`) e olhe as imagens antes de dizer
   que ficou pronto. Rode `npm run checar` antes de commitar.
10. **Git**: uma branch por peça (`peca/<slug>`), commits pequenos em pt-BR, Merge Request na
    `master`. Não faça push nem merge sem o usuário pedir.

## Mapa

```
pecas/<AAAA-MM-nome>/      post.md · composicoes.tsx · assets.json · assets/ · dados.json · código próprio
pecas/index.ts             registro das peças no Studio (o `npm run novo` atualiza)
modelos/<modelo>/          componente + dados.ts (opcional) + template/ + README.md
src/compartilhado/         tema.ts · marca/ · componentes/Sfx.tsx · personagens/andy/ · util/arquivos.ts
scripts/                   CLI; scripts/lib/pecas.ts tem o schema do post.md e do assets.json
series/<serie>/            pautas e regras de uma série (ex.: surfzada-explica)
public/ e out/             gerados, fora do git
```

Atalhos de import: `@compartilhado/...` → `src/compartilhado/...` e `@modelos/...` → `modelos/...`.

## Receitas

### Criar uma peça

```bash
npm run pecas -- --modelos                                   # ver os modelos
npm run novo -- <nome-kebab> --modelo=<modelo> --titulo="..."  # ou sem --modelo (peça própria)
```

Depois: preencha o `post.md` (briefing, roteiro, legenda), ajuste `composicoes.tsx`, `npm run dados`
(se o modelo tiver), `npm run assets`, e confira no Studio ou por quadros. Detalhes em
`docs/02-criar-uma-peca.md`.

### Renderizar e revisar

```bash
npm run assets -- <peca>         # obrigatório antes, se a peça tem assets.json ou assets/
npm run quadros -- <peca>        # 4 quadros por composição em out/<slug>/quadros/ (olhe!)
npm run quadros -- <peca> <id> 0 90 180
npm run render -- <peca>         # tudo de `renders:` + carrossel, em out/<slug>/
npm run carrossel -- <peca> --png
```

### Entregar

```bash
npm run entregar -- <peca>       # out/<slug>/ → $MKT_DRIVE/entregas/<slug>/ e status: aprovado
```

Depois de postado: `status: publicado`, `publicado_em` e `link` no post.md.

### Mudar código compartilhado

Mexeu em `src/compartilhado/` ou num modelo? Isso afeta várias peças: rode `npm run checar` e
`npm run quadros` de pelo menos uma peça de cada modelo afetado, e diga no MR quais peças mudam.

## Convenções rápidas (completas em docs/convencoes.md)

- Pastas e arquivos: kebab-case, sem acento, sem espaço. Componentes React em PascalCase.
- Slug da peça: `AAAA-MM-nome` (mês de criação). Id de composição: `nome[-variante]` em kebab-case,
  único no projeto. Render: `surfzada-<nome>[-variante]-<proporção>.<ext>`.
- Sem `v2`, `final`, `novo` em nome de arquivo: o histórico é do git e do Drive.
- Status: `ideia → producao → revisao → aprovado → publicado` (ou `arquivado`).

## Ambiente

- Windows, macOS ou Linux; Node 22+; ffmpeg no PATH (conversões e carrossel).
- `.env` (copie de `.env.exemplo`): `MKT_DRIVE`, `MKT_TEMP` (o render deixa sobras grandes; aponte
  para um disco com espaço), `API_URL`.
- Scripts Python (peças e produtos): `py -m venv .venv` + `pip install -r requirements.txt`.
