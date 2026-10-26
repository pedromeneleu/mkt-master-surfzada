---
titulo: A IA analisou essa rasgada
slug: 2026-10-ia-analisa-rasgada
serie: null
modelo: proprio
formato: reel-9x16
canais: [instagram, tiktok, youtube]
status: producao
responsavel: pedro
publicar_em: null
publicado_em: null
link: null
renders:
  - composicao: ia-analisa-rasgada
    arquivo: surfzada-ia-analisa-rasgada-9x16.mp4
  - composicao: ia-analisa-rasgada-gancho-b
    arquivo: surfzada-ia-analisa-rasgada-gancho-b-9x16.mp4
  - composicao: ia-analisa-rasgada-gancho-c
    arquivo: surfzada-ia-analisa-rasgada-gancho-c-9x16.mp4
---

## Briefing

**Objetivo:** apresentar a ferramenta de visão computacional que a Surfzada está construindo (lê
o vídeo de alguém surfando, identifica a manobra, dá nota e aponta o que melhorar) num formato
viral, e trazer vídeos da comunidade: **os 10 primeiros que mandarem vídeo recebem a análise de
graça**. Comentário com a palavra **ANÁLISE** dispara a resposta automática por DM.

**Formato:** "IA vs. o surf do meu brother", um roast bem-humorado com dado técnico. Reel 9:16 de
30 s, legendas grandes em todas as cenas (a maioria assiste sem som), cortes de 1–2 s.

**Estilo:** o da referência ("Você vê isso. / A gente vê isso.", com o esqueleto de pose sobre o
surf): fundo tinta, o clipe numa janela 16:9 com cantos de visor e etiquetas técnicas ("QUADRO
0123", "● RASTREADO"), esqueleto da IA por cima. Do briefing do Market Master vieram a textura de
impressão (grão, retícula de meio-tom na tela papel, carimbo torto) e as linhas do esqueleto no
destaque. As cores e a fonte são as da marca (`@compartilhado/tema`), não a paleta risograph do
briefing (#E5E0D3/#191712/#D9432A/#7E7A6B): o coral da marca faz o papel do #D9432A e o fundo
claro o do papel.

**O esqueleto é de verdade:** pose extraída quadro a quadro por um modelo de visão (YOLO11-pose,
17 pontos), em `pose.json` (`scripts/extrair_pose.py`). O ângulo do joelho na nota 01 é medido
nessa pose. A "linha ideal" (16–20 s) é a mesma pose com o quadril mais baixo e o tronco à frente:
ilustração do conselho, não simulação.

**O que NÃO fazer:**
- Prometer precisão: a ferramenta está **em desenvolvimento** (etiqueta "PROTÓTIPO · EM TESTE" na
  análise, "EM DESENVOLVIMENTO" na marca, e a legenda convida a galera a ajudar a treinar).
- Usar os cortes da WSL nem o "Horizontal Snap" da referência (imagem de terceiros, sem licença), nem
  música com direitos: a trilha entra pela biblioteca do Instagram/TikTok.
- Vídeo gerado por IA nas cenas: só material filmado.

**Público:** surfistas BR de 18–40, do iniciante ao intermediário que filma a própria sessão; o
"brother" que vai ser marcado.

## Roteiro

Gancho principal (A) e 2 variações para teste A/B (B e C): só os primeiros 4 s mudam, o resto é igual.
Clipe da rasgada: `clipes/rasgada.mp4` (bruto `7450_Surfer_Surfing`, dos 10 aos 20 s). O cara sobe
pro lip, joga água, abre os braços, cai de costas e a prancha voa.

| Tempo | Cena | Na tela | Texto na tela | Áudio |
|---|---|---|---|---|
| 0–0,5 s | Gancho | Começa no meio da rasgada, já subindo pro lip | **A IA analisou essa rasgada…** (já no quadro 0) | trilha entra seca |
| 0,5–1 s | Freeze | Congela no pico (água pra cima), punch-in e flash | idem | `congela` |
| 1–2,2 s | Rewind | Volta até a base, linhas de fita, "◀◀ VOLTANDO" | **…e não foi gentil 💀** | `whoosh-grave` |
| 2,2–4 s | Rastreio | Toca de novo e o esqueleto coral se traça no corpo; "● RASTREADO · CORPO · 17 PONTOS" | idem | `traco` |
| 4–6 s | Nota 01 | Câmera lenta (0,45×), punch-in no tronco, anel no punho mais aberto: "MODO AVIÃO" | **01 BRAÇOS** · Abriu os braços de avião. O tronco *não girou* junto. | `pop` |
| 6–8 s | Nota 02 | Punch-in nas pernas, anel no joelho com o ângulo medido na pose (mediana de ±4 quadros: 158–173°) | **02 JOELHOS** · Perna esticada na batida. Chegou *duro* no lip. | `pop` |
| 8–12 s | Nota 03 + queda | Plano aberto, ele cai de costas; "PESO ATRÁS" nos pés e carimbo **VACA DETECTADA** | **03 PESO** · Peso no pé de trás. Saiu *de ré* da onda. | `pop`, `impacto` |
| 12–14 s | Juízes | Queda congelada e escurecida; 5 notas (5,5 · 6,0 · 5,8 · 5,7 · 6,3), corta a maior e a menor | NOTA DOS JUÍZES | `tick` ×5, `clack` |
| 14–16 s | Nota final | Contador até **5,8** em coral | **mas a intenção foi 10 🤙** | `contador` |
| 16–20 s | Linha ideal | Split: em cima "O QUE ROLOU · 5,8", embaixo "LINHA IDEAL · 7,8" (esqueleto corrigido sobre o fantasma do real) | **com essa correção: +2 pontos** | `whoosh`, `brilho` |
| 20–24 s | Marca | Tela papel com retícula, logo se desenhando | **Tamo construindo uma IA que lê teu surf.** · EM DESENVOLVIMENTO | `whoosh-curto`, `brilho` |
| 24–30 s | CTA | Outros surfistas sendo rastreados na janela ("● TEU VÍDEO AQUI", "10 VAGAS GRÁTIS") | **Manda teu vídeo surfando.** · Os *10 primeiros* recebem a análise de graça. · botão **Comenta ANÁLISE 👇** | `notificacao` |

### Ganchos para o teste A/B (0–4 s)

| | 0–1 s | 1–4 s | Composição |
|---|---|---|---|
| **A** (principal) | A IA analisou essa rasgada… | …e não foi gentil 💀 | `ia-analisa-rasgada` |
| **B** (desafio) | Meu brother jura que essa foi nota 10. | A IA discordou 💀 | `ia-analisa-rasgada-gancho-b` |
| **C** (POV) | POV: teu brother pediu nota pra IA | Ela foi sincera demais 💀 | `ia-analisa-rasgada-gancho-c` |

Teste: A e B como Reels de teste (público não seguidor) por 24 h; quem tiver mais retenção nos 3 s
e mais envios por DM vira o post do feed. C fica para o TikTok.

### Áudio

Sem trilha no arquivo, só os efeitos (`npm run sfx`). No app: trilha **da biblioteca livre** do
Instagram/TikTok (eletrônico/lo-fi tenso, ~120 BPM, com drop perto dos 12 s para o placar). Nada de
música comercial.

## Legenda

A gente pôs uma IA pra analisar a rasgada do brother e ela não teve pena nenhuma 💀

Nota 5,8. Braço de avião, joelho duro e peso no pé de trás. Mas a intenção foi 10, isso ninguém tira 🤙

Tamo construindo na Surfzada uma IA que lê teu surf: identifica a manobra, dá a nota e mostra o
que ajustar (base, joelho, olhar, timing, parede da onda). Ela ainda tá aprendendo, e quem ensina
é a galera do line-up.

👉 Comenta **ANÁLISE** que a gente te manda no DM como enviar teu vídeo.
Os **10 primeiros** recebem a análise de graça (e podem virar o próximo episódio).

Marca aquele amigo que se acha o Medina 👇

## Hashtags

#surf #surfbrasil #surfista #surfistabrasileiro #rasgada #surfcoaching #inteligenciaartificial #surfzada

## Créditos

Vídeos de banco de imagens, no Drive em `pecas/2026-10-ia-analisa-rasgada/brutos/` (nome original
do arquivo). Licença livre para uso comercial, sem crédito obrigatório; crédito recomendável na
legenda ou nos comentários. **Autor e link a confirmar** (ver Notas de revisão):

| Arquivo | Uso | Fonte | Autor | Licença |
|---|---|---|---|---|
| `7450_Surfer_Surfing_1280x720.mp4` | a rasgada (o "brother") | a confirmar (nome no padrão Videvo/Pixabay) | a confirmar | a confirmar |
| `7660373-uhd_3840_2160_25fps.mp4` | CTA: surfista de roupa preta | Pexels, vídeo 7660373 | a confirmar | Licença Pexels |
| `7425528-uhd_3840_2160_30fps.mp4` | CTA: pico cheio | Pexels, vídeo 7425528 | a confirmar | Licença Pexels |

Pose: modelo YOLO11-pose (Ultralytics, AGPL-3.0), usado só como ferramenta para gerar o
`pose.json`; nada do modelo vai no vídeo. Emoji: Noto Color Emoji (Google, SIL OFL 1.1). Efeitos:
gerados por código (`npm run sfx`).

## Notas técnicas

- Os vídeos não têm trilha; os efeitos entram no arquivo.
- O vídeo é pedido sempre **no quadro exato** da pose (`Freeze` no tempo do quadro do clipe), por
  isso o esqueleto não escorrega. A câmera virtual segue o centro do corpo suavizado (±8 quadros).
- `pose.json` (~200 KB) está no git; refazer só se trocar os clipes (`scripts/extrair_pose.py`, que
  pede `pip install ultralytics` à parte, ~1 GB com o PyTorch).
- A rasgada é 720p e 25 fps: a câmera lenta (0,45×) "anda em quadros", o que combina com a leitura
  "quadro a quadro" da IA; o punch-in máximo é 2,6× para não estourar a nitidez.

## Notas de revisão

- 2026-10-26: primeira versão (roteiro, 3 ganchos, pose real). As notas seguem o que a pose
  mostra: "olhar" (do briefing) saiu porque no contraluz não dá para ver para onde ele olha, e os
  joelhos entram só quando as pernas já estão esticadas (antes ele vem comprimido, ~120°). Os brutos vieram anexados na
  conversa; **subir os 3 para o Drive** em `pecas/2026-10-ia-analisa-rasgada/brutos/` com o nome
  original, para o `npm run assets` funcionar nas outras máquinas.
- **Confirmar autor e licença** dos 3 vídeos (Pexels 7660373 e 7425528; o `7450_Surfer_Surfing`
  parece Videvo, que tem licenças diferentes por vídeo: conferir se é livre para uso comercial).
- **Não reaproveitar** os cortes da referência: têm imagem da WSL e de um vídeo de treino
  ("Basic Mechanics · Horizontal Snap") sem licença.
- O material de apoio da campanha (carrossel, stories, DM automática, série, métricas e prompt para
  CapCut/Runway) está em `campanha.md`.
