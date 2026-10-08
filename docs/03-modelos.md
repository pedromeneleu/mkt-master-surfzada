# 03 · Modelos

Um **modelo** é um formato que se repete: o componente (visual) fica em `modelos/<modelo>/`, e
cada post feito com ele é uma peça que só passa os dados e os textos. Lista e detalhes de cada um:
[modelos/README.md](../modelos/README.md) ou `npm run pecas -- --modelos`.

## Usar um modelo

```bash
npm run novo -- <nome> --modelo=<modelo> --titulo="..."
```

Leia o `README.md` do modelo: ele diz quais props/opções existem, se há `npm run dados` e o que a
peça precisa trazer (foto, vídeo).

## Estrutura de um modelo

```
modelos/<modelo>/
├─ README.md          o que é, peças feitas com ele, como criar, opções, regras
├─ <Componente>.tsx   o visual; recebe tudo por props (ou por uma fábrica, como criarStory)
├─ dados.ts           (opcional) gera pecas/<slug>/dados.json: `export default async function gerar(ctx)`
├─ tipos.ts           (opcional) tipos dos dados
└─ template/          o que o `npm run novo` copia para a peça
   ├─ post.md         frontmatter com modelo, formato e renders já preenchidos
   ├─ composicoes.tsx registra as composições usando o componente do modelo
   └─ ...             dados.json de exemplo, assets/, assets.json
```

Nos arquivos do `template/`, o `novo` troca `{{SLUG}}`, `{{NOME}}`, `{{ID}}`, `{{TITULO}}` e
`{{RESPONSAVEL}}`.

## Regras do componente

- **Nada de dado fixo de uma peça** dentro do modelo: textos, fotos, URLs e dados chegam por props.
  Presets visuais (ex.: as vibes da playlist) podem ficar no modelo.
- **Nada de `staticFile`**: a peça resolve o caminho (`arquivo('foto.jpg')`) e passa a URL pronta.
- Props como `type` (não `interface`): o Remotion exige que elas sejam compatíveis com
  `Record<string, unknown>`.
- Marca e tema só de `@compartilhado/*`.
- Duração calculada a partir dos dados (ex.: `duracaoPlaylist(vibe)`), exportada para a peça usar
  em `durationInFrames`.

## Criar um modelo novo

Quando o mesmo formato vai para a 3ª peça, ou quando já se sabe que é recorrente:

1. Escolha a peça mais completa desse formato como ponto de partida.
2. Crie `modelos/<nome>/` e mova o componente para lá, trocando o que é da peça (textos, dados,
   caminhos) por props.
3. Se os dados vêm de um script, transforme-o em `dados.ts` com `export default async function
   gerar({ slug, pasta, args })` (veja `modelos/story-previsao/dados.ts`).
4. Faça a peça original usar o modelo (o `composicoes.tsx` dela passa as props) e mude o `modelo:`
   no `post.md`. Renderize e compare com o render antigo (`npm run quadros`).
5. Crie o `template/` a partir dessa peça, com os placeholders `{{...}}`.
6. Escreva o `README.md` e acrescente o modelo na tabela de `modelos/README.md`.
7. `npm run novo -- teste-modelo --modelo=<nome>`, renderize, e apague a peça de teste (pasta + 2
   linhas em `pecas/index.ts`).

Mudar um modelo muda **todas** as peças feitas com ele: confira os quadros de pelo menos uma peça
antiga antes do MR e cite no MR quais peças mudam.
