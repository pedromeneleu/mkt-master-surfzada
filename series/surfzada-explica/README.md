# Surfzada Explica

> Antes chamado "Surfzada Analisa" (pasta `ondalogia/`). O nome novo já vale para o
> carrossel; no vídeo do ep01 ainda aparece o antigo.

Quadro da Surfzada no Instagram com um olhar analítico sobre o surf: como as
ondas nascem e quebram, por que cada pico funciona de um jeito e a física das
manobras. A base é animação; vídeos reais entram como prova e como tela para
análise, com desenhos por cima do vídeo pausado.

Os episódios são numerados: *Surfzada Explica #1*, *#2*…

## Formato

- **Reels 9:16** (1080×1920), ~60 s, 30 fps. Um episódio por semana.
- **Legenda queimada** no vídeo, porque a maioria assiste sem som. Tudo que
  importa fica fora das bordas de baixo e da direita, onde entra a interface do
  Instagram.
- **Capa 3:4** (1080×1440) para a grade do perfil, com título grande e o Andy.
- **Carrossel** opcional com os mesmos desenhos (1:1, 1080×1080): resumo do
  episódio para salvar.
- **Narração**: o Andy é o narrador e o personagem principal; a boca dele
  sincroniza com o áudio. A voz ainda está em aberto.
- **Sem música**: o som é o ambiente do mar e os efeitos ([sons.md](sons.md)).
- **Fechamento**: pede para mandar o vídeo a um amigo, fecha com o bordão do
  Andy ("O mar não mente.") e o estalo de dentes, e volta ao primeiro quadro
  em loop. A pergunta de comentário ("qual pico analisar?") vai na legenda do
  post.

## Identidade

- Paleta da marca (tinta `#0a0a0a`, coral `#ff7a59`) mais os azuis do
  [símbolo antigo](../../../design/logo_simbolo.svg) (repositório principal) para o mar. Veja
  [design/mascote/boia-conceitos.png](../../design/mascote/boia-conceitos.png).
- Poppins, como no site e no trailer.
- Traço plano, sem degradê nem sombra realista. A física tem que estar certa;
  o desenho pode ser simples.
- Mascote: o **Andy**, um tubarão-tigre. Ver
  [design/mascote/](../../design/mascote/README.md).

## Como produzir com o Claude

Cada episódio é uma peça do projeto Remotion único (`pecas/AAAA-MM-explica-epNN/`), com
`serie: surfzada-explica` no post.md. O Andy é um boneco articulado em `src/compartilhado/personagens/andy/`. O trailer já
provou esse caminho: tudo sai de código, o Claude renderiza quadros soltos,
olha o resultado e corrige.

| Peça | Ferramenta | Por quê |
|---|---|---|
| Montagem, texto, legendas, mascote, trilha | Remotion | Já funciona no trailer; mesma marca, mesmas curvas e componentes |
| Física das animações | Funções TS em `src/compartilhado/fisica/` (a criar) | Dispersão, empinamento, quebra, refração e órbitas calculadas de verdade, não desenhadas no olho |
| Ritmo | Narração transcrita com timestamps por palavra (whisper.cpp via `@remotion/install-whisper-cpp`) | Cada animação dispara na palavra certa, como o trailer faz com as batidas da música. As legendas saem do mesmo arquivo |
| Vídeo real | `<OffthreadVideo>` no Remotion | Cortar, congelar e desenhar setas e trajetórias por cima |
| Cenas 3D (fase 2) | Blender (há MCP conectado) | Fundo 3D de um pico com a onda refratando, para os episódios de análise de picos |
| Equações (se precisar) | Manim, exportado com fundo transparente | Só se um episódio pedir dedução matemática; entra no Remotion como vídeo |
| Ajuste fino do mascote | Penpot ou Affinity | Se quiser polir o traço à mão; o rig continua em SVG |

**O que eu deixaria de fora:**

- **CapCut e o MCP dele:** os MCPs de CapCut são de terceiros e escrevem o
  formato interno de rascunho do app, que muda a cada versão. O que ele faz
  melhor, que é áudio em alta e corte rápido no celular, dá para fazer no
  próprio Instagram na hora de postar.
- **Vídeo gerado por IA** para as cenas explicativas: ele erra a física, e
  física errada é o pior erro para esse quadro. Para b-roll decorativo, tudo
  bem.

### Fluxo de um episódio

1. **Pauta, planejamento e roteiro** na pasta da peça (`pecas/AAAA-MM-explica-epNN/`: post.md, planejamento.md, roteiro.md, clipes.md): gancho,
   pontos de atenção, narração, cenas, sons e lista de planos reais. O
   Claude escreve; você revisa o conteúdo.
2. **Gravar a narração** (celular com lapela serve) em
   Drive `pecas/<slug>/narracao.wav` (listado no assets.json da peça).
3. **Transcrever**: um script gera `narracao.json` com o tempo de cada
   palavra.
4. **Animar**: o Claude monta as cenas presas às palavras e revisa por quadros
   renderizados.
5. **Vídeo real**: os clipes vão para Drive `pecas/<slug>/reais/` (assets.json → `public/pecas/<slug>/reais/`) e
   entram nos pontos marcados no roteiro.
6. **Render**: Reels, capa e, se quiser, o carrossel.

## Onde fica cada coisa

```
series/surfzada-explica/   README (este), pautas.md, sons.md
pecas/2026-09-explica-ep01/ episódio 1: post.md, planejamento, roteiro, clipes, video/ e carrossel/
pecas/2026-10-explica-ep02/ episódio 2 (rascunho do roteiro)
src/compartilhado/personagens/andy/   o rig do Andy (+ estudo/: demo, folha, sprites, GIF)
design/mascote/            conceitos e regras do mascote
```

## Vídeo real: de onde tirar

- **Filmagem própria**: celular com zoom ou GoPro, de preferência num dia de
  swell limpo, e drone se tiver. Serve para quase todos os episódios.
- **Fotógrafos e filmmakers locais**, com permissão por escrito e crédito na
  legenda. Pode virar parceria.
- **Bancos livres** (Pexels, Pixabay) para tempestade, mar aberto e boia.
- **Não usar** clipe de outro perfil sem autorização, mesmo com crédito.
