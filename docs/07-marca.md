# 07 · Marca

Fonte da verdade: `design/design-kit-v2.html` e os logos em `design/` (no repositório principal),
os mesmos do site (`web/client/src/app/app.scss`). No código, tudo isso está em
`src/compartilhado/tema.ts` e `src/compartilhado/marca/`. **Não copie cores nem logo para dentro de
uma peça**: importe de `@compartilhado`.

## Cores (`COR`)

| Token | Hex | Uso |
|---|---|---|
| `tinta` | `#0a0a0a` | texto principal, fundos escuros |
| `tinta2` | `#1c1c1c` | superfícies sobre fundo escuro |
| `coral` | `#ff7a59` | **o** destaque: uma palavra-chave, um número, o traço do rótulo |
| `coralTexto` (= `coralEscuro`) | `#e55a36` | coral para texto sobre fundo claro (contraste) |
| `coralClaro` | `#ffe3db` | fundos de destaque suaves |
| `fundo` | `#f5f5f5` | fundo claro padrão |
| `superficie` | `#ffffff` | cartões |
| `borda` | `#e5e5e5` | linhas finas |
| `suave` / `apagado` | `#737373` / `#a3a3a3` | texto secundário, metadados |
| `marFundo`, `mar`, `raso`, `agua`, `espuma` | azuis | ilustrações de mar (Explica) |
| `pele`, `listra`, `barriga`, `cicatriz` | cinzas | o Andy |

Regra: **um** coral por tela. O resto é tinta, cinza e fundo.

## Tipografia

**Poppins** (`FONTE`), pesos 300–700, carregada do Google Fonts. Títulos em 600 com
`letterSpacing: -0.03em`; rótulos em caixa alta, 600, `letterSpacing: 0.12em`, com traço coral.
`<Titulo texto="Onde tem *onda* até domingo?" />`: as palavras entre `*asteriscos*` saem em coral.

## Logo

`Logo` (símbolo + wordmark), `Simbolo` e `Wordmark` em `@compartilhado/marca/Marca` (vetor, já
animável com `em`). Nunca use PNG do logo nem redesenhe. Em fundo escuro: `cor="#fff"`. O logo
fecha o vídeo ou fica discreto no rodapé; não precisa aparecer o tempo todo.

## Movimento

- Curvas: `CHEGADA` (entradas, desacelera no fim), `SUAVE` (câmera), `SAIDA` (saídas).
- Entradas curtas (10–20 quadros a 30 fps). Nada de bounce exagerado.
- Cortes e acentos no ritmo: quando há trilha, meça em batidas (`npm run musica`).

## Áreas seguras do Instagram (1080×1920)

| Faixa | Reels | Stories |
|---|---|---|
| Topo | ~220 px | ~230 px |
| Base | ~420 px (legenda, botões) | ~220 px |
| Direita | ~140 px (curtir, comentar) | — |

Texto essencial e créditos fora dessas faixas. Carrossel 1:1/4:5: margem de 64 px.

## Tom de voz

- Português do Brasil, direto, de surfista para surfista ("Bora surfar?", "O mar não mente.").
- Ganchos genéricos (servem para qualquer pico), não presos a uma cidade.
- Humor leve, sem duplo sentido (ex.: trocou-se "O que tenho usado:" por "Minha dose diária:").
- Dado é dado: altura, período e vento sempre conferidos na API/fonte.

## Identidade visual em uma frase

Minimalista e claro (fundo `#f5f5f5`, tinta, um coral), material **real** filmado pela equipe, e o
Andy (tubarão-tigre) como narrador da série Surfzada Explica. Sem vídeo gerado por IA nas cenas.
