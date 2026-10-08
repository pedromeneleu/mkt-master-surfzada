# O giro da camisa (capa do carrossel)

Scripts Python desta peça (dependências em `requirements.txt` na raiz; ver docs/01-setup.md).

```bash
py pecas/2026-10-tributo-andy/scripts/preparar_giro.py "<shot_01_v11 em 2160>.mp4"   # public/.../giro (depois suba para o Drive)
py pecas/2026-10-tributo-andy/scripts/preparar_imagens.py                              # public/.../reticula e arte
py pecas/2026-10-tributo-andy/scripts/verificar_loop.py out/2026-10-tributo-andy/carrossel/01-tributo-andy-capa.mp4 225
py pecas/2026-10-tributo-andy/scripts/verificar_emenda.py
```

O vídeo de origem (`shot_01_v11`, render + super-resolução) fica no Drive em
`pecas/2026-10-tributo-andy/shot_01_v11.mp4`.

O vídeo da camisa girando (`shot_01_v11`, render + super-resolução, já em
2160×2160, 239 quadros) não fica no git. O `preparar_giro.py` gera uma volta de 225
quadros em `public/pecas/2026-10-tributo-andy/giro/`, em resolução cheia, como JPEG 97 sem subamostragem
de cor. A Capa toca 4 voltas: 900 quadros, 30,000 s. O fim emenda no começo,
então o Instagram repete sem pulo.

O `OffthreadVideo` não consegue buscar quadros nos vídeos da super-resolução
("No frame found at position"), mesmo re-encodados. Por isso a Capa toca a
sequência de JPGs.

## Por que a volta não fecha sozinha

Medido quadro a quadro com o deslocamento da estampa (correlação de fase) e a
posição da gola:

- **Quadros repetidos:** o vídeo foi gerado a 24 fps e convertido para 30
  repetindo 1 quadro a cada 5. São 48 repetidos e sobram 191 únicos.
- **Partida lenta e arrancada:** nos quadros 0–8 a estampa anda ~1 px por
  quadro (em 1080). Nos quadros 10–27 vem uma arrancada, de 4–5,7 px por
  quadro, e depois o giro volta a ~2–3. No fim (222–238) anda ~2,5–3.
- **Balanço:** no fim a camisa vem para a esquerda. No começo ela está ~8 px
  mais à direita, vai para a direita e para por uns quadros.

Emendar o fim no quadro 0 dava uma travadinha: a rotação quase parava e o
balanço invertia de uma vez. Nenhum par de corte resolve sozinho. O quadro 235
bate em posição com o 0, mas não em velocidade nem em balanço. Cortar só a
partida deixava uma "virada rápida": a camisa saía do ritmo do fim direto para
a arrancada.

## Como a volta é montada

Só os 25 quadros da emenda e da retomada são sintetizados. O resto é quadro
original.

1. **Corte da partida:** a volta começa no quadro 8, depois da partida lenta.
   Vale para todas as voltas, senão a travada voltaria a cada repetição do
   Instagram.
2. **Emenda por fluxo óptico (DIS, OpenCV):** os 4 últimos quadros únicos
   (234, 236, 237 e 238) se transformam nos quadros da partida que estão na
   mesma fase da rotação (0, 3, 6 e 7), com peso de 0,25 a 1. O último já é o
   próprio 7, então 7 → 8 é um passo natural do vídeo.
3. **Retomada sem arrancada:** do quadro 8 ao 30, a volta toca no ritmo do fim
   (a estampa a 3,0 px por quadro, constante). As posições saem da fase medida
   da estampa, e os intermediários vêm por fluxo. Do 30 em diante segue o
   vídeo, que ali já anda nesse ritmo.
4. **Balanço:** só a camisa vai para a esquerda, até 18 px em 2160, numa curva
   suave. Ela começa ~16 quadros antes da emenda, chega ao máximo 6 depois e
   volta a zero em ~2,5 s, dando um pouco de embalo onde a rotação afrouxa.
   - O deslocamento é em pixels inteiros, sem reamostrar.
   - A parede e o pedestal ficam parados.
   - A faixa que a camisa descobre vem de um fundo limpo do estúdio: a mediana
     da parede ao longo do giro, longe das bordas, ajustada ao brilho de cada
     quadro.
5. **Fusões:** camisa e parede são tratadas à parte.
   - A camisa vem deformada pelo fluxo, e cada imagem só entra onde a própria
     silhueta diz que é camisa.
   - A parede, que está parada, vem dos originais sem deformar. O fluxo é
     instável no liso e misturava as duas.
6. **30 s exatos:** os 32 repetidos que sobram vão para o miolo, espaçados por
   igual e fora da emenda e da retomada.
7. **Selo "AI":** o canto inferior direito é refeito interpolando a parede a
   partir das bordas.

Os números do vídeo (pares da emenda, retomada, desvio) estão no topo do script,
com os valores medidos.

## Conferência

- `py verificar_loop.py out/2026-10-tributo-andy/carrossel/01-tributo-andy-capa.mp4 225` mede, no MP4 final:
  - duração;
  - passo do último quadro para o primeiro (4,0; a mediana dos passos é 2,6 e
    o máximo, 5,4);
  - as 4 voltas idênticas (diferença 0,2, ruído da compressão);
  - saltos (nenhum).
- `py verificar_emenda.py` mede, quadro a quadro em volta da emenda,
  em `public/pecas/2026-10-tributo-andy/giro`:
  - a velocidade da estampa: no fim ~3,0 (2,4–4,7), na emenda
    3,1 → 3,0 → 2,1 → **2,6** → 2,4 → 2,6 → 4,1, e depois 3,0 constante até o
    quadro ~25. Sem parar, sem voltar e sem arrancada;
  - a gola, que segue sempre para a esquerda;
  - o fundo, parado: a parede varia 0,1–0,8; o pedestal, 1–2,5, pela sombra
    que muda com a rotação.

A camisa ocupa quase o quadro todo. Os textos da Capa ficam nos cantos que ela
nunca alcança em nenhuma pose, medidos sobre todos os quadros: em cima, à
esquerda e à direita, e no chão.

A versão anterior (`shot_01_v7`, 9:16) precisava estender o estúdio para os
lados. Esse código saiu com a troca de vídeo.

