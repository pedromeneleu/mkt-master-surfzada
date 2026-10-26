# Campanha "A IA analisou" — material de apoio

Tudo o que acompanha o Reel desta peça (roteiro, ganchos A/B, legenda e hashtags estão no
`post.md`). Tom Surfzada: gíria de surf, humor, nada corporativo. A ferramenta é **protótipo em
desenvolvimento**: nunca prometer precisão, sempre convidar a galera a ajudar a treinar e testar.

---

## 1. Prompt para ferramenta de edição (CapCut, Runway ou Veo)

Para quem for refazer ou adaptar fora do Remotion. **Use só material filmado** (nosso ou de banco
livre); a ferramenta é para montar, rastrear e legendar, **não para gerar as cenas de surf**.

```text
Edite um Reel vertical 9:16 (1080×1920), 30 fps, 30 segundos, a partir dos clipes de surf enviados
(material filmado; não gere imagens de surfistas por IA).

ESTÉTICA: zine/risografia digital. Fundo quase preto #0A0A0A. O vídeo fica numa janela horizontal
16:9 no meio da tela, com cantos de visor em L brancos finos e etiquetas técnicas pequenas em caixa
alta (fonte Poppins SemiBold, letterspacing largo): "● RASTREADO", "QUADRO 0123", "CORPO · 17
PONTOS", "PROTÓTIPO · EM TESTE". Grão de impressão leve por cima do vídeo. Uma única cor de
destaque, coral #FF7A59, usada no esqueleto de pose e em uma palavra por legenda. Sem gradientes
chamativos, sem efeitos 3D, sem brilho neon.

ESQUELETO: aplique rastreamento de pose (body tracking) no surfista e desenhe o esqueleto com
linhas coral grossas, juntas como bolinhas brancas e a cabeça como um círculo vazado.

LEGENDAS: Poppins Bold, branco, grandes (ocupam 80% da largura), entrando palavra por palavra de
baixo para cima, sempre acima da janela, longe dos 220 px do topo e dos 420 px de baixo.

SEQUÊNCIA:
0–1 s: começa no meio da rasgada, congela no pico com flash branco rápido e zoom de 20%.
  Texto: "A IA analisou essa rasgada…"
1–4 s: rewind rápido com linhas de fita, depois toca de novo e o esqueleto se desenha no corpo.
  Texto: "…e não foi gentil 💀"
4–12 s: câmera lenta (0,45×), três cortes com punch-in (pernas, cabeça, plano aberto). Em cada
  um, um anel branco no ponto do corpo e a nota: "01 BRAÇOS · Abriu os braços de avião",
  "02 JOELHOS · Perna esticada na batida", "03 PESO · Peso no pé de trás". Na queda, carimbo torto coral
  "VACA DETECTADA".
12–16 s: imagem congelada escurecida, 5 cartões de juiz (2,0 2,5 2,3 2,2 3,1), risca a maior e a
  menor, número grande coral "2,3". Texto: "mas a intenção foi 10 🤙"
16–20 s: tela dividida: em cima "O QUE ROLOU · 2,3", embaixo "LINHA IDEAL · 4,3" com o esqueleto
  corrigido (joelhos mais dobrados, tronco à frente). Texto: "com essa correção: +2 pontos"
20–24 s: tela papel #F5F5F5 com retícula de meio-tom nas bordas, logo Surfzada. Texto: "Tamo
  construindo uma IA que lê teu surf." e a etiqueta "EM DESENVOLVIMENTO".
24–30 s: volta ao fundo escuro, outros surfistas sendo rastreados na janela ("● TEU VÍDEO AQUI").
  Texto: "Manda teu vídeo surfando." / "Os 10 primeiros recebem a análise de graça." e um botão
  coral "Comenta ANÁLISE 👇" pulsando.

ÁUDIO: trilha da biblioteca livre do app (eletrônico/lo-fi tenso, ~120 BPM) com drop no placar
(12 s). Efeitos: congelar, rewind, pop a cada nota, impacto no carimbo, ticks nos juízes.
Nada de música comercial.
```

---

## 2. Carrossel (7 slides, 4:5, 1080×1350)

Fundo tinta nos slides de análise, papel nos de marca. Imagens: quadros congelados do Reel com o
esqueleto (dá para exportar com `npm run quadros -- ia-analisa-rasgada ia-analisa-rasgada <quadro>`).

| # | Texto | Visual |
|---|---|---|
| 1 | **A IA analisou a rasgada do meu brother 💀** · _arrasta pro lado se aguenta a verdade →_ | Quadro do pico da rasgada (água pra cima) com o esqueleto coral, cantos de visor, etiqueta "● RASTREADO". Capa: texto grande em cima, imagem no meio. |
| 2 | **01 · BRAÇOS** · Abriu os braços de avião. O tronco não girou junto. | Punch-in no tronco, anel branco no punho mais aberto com a etiqueta "MODO AVIÃO". |
| 3 | **02 · JOELHOS** · Perna esticada na batida. Chegou duro no lip. | Punch-in nas pernas, anel branco no joelho com o ângulo medido (ex.: 166°) grande ao lado. |
| 4 | **03 · PESO** · Peso no pé de trás. Saiu de ré da onda. | Plano aberto da queda, carimbo torto coral "VACA DETECTADA". |
| 5 | **NOTA 2,3** · _mas a intenção foi 10 🤙_ | 5 cartões de juiz, maior e menor riscadas, o 2,3 enorme em coral. |
| 6 | **Linha ideal: +2 pontos** · Joelho dobrado, braço na frente, peso no pé da frente. | Duas imagens empilhadas: "O QUE ROLOU · 2,3" × "LINHA IDEAL · 4,3" (esqueleto corrigido sobre o fantasma tracejado). |
| 7 | **Tamo construindo uma IA que lê teu surf.** · Manda teu vídeo: os 10 primeiros recebem a análise de graça. · **Comenta ANÁLISE 👇** | Tela papel com retícula, logo Surfzada, botão coral "Comenta ANÁLISE", etiqueta "EM DESENVOLVIMENTO". |

---

## 3. Stories de apoio (com contador de vagas)

Formato 9:16, mesma linguagem (fundo tinta, janela com visor, coral só no número). O contador é
atualizado à mão a cada vídeo recebido e validado.

| Quando | Story | Texto | Interação |
|---|---|---|---|
| **Antes** (D-1, noite) | Teaser: janela com o esqueleto se traçando sobre um quadro escuro, sem mostrar o surfista | "Amanhã a IA vai julgar o surf de alguém. E ela não tem dó 💀" | Enquete: "Tu aguentaria a análise?" **Manda ver / Tô fora** |
| **Durante** (logo após o post) | Repost do Reel com sticker | "Saiu. Comenta ANÁLISE no post e garante tua vaga 👇" · contador **0/10 VAGAS** | Sticker de link pro post + contagem regressiva de 48 h |
| **Durante** (+6 h a +24 h, um por atualização) | Barra de vagas: 10 bolinhas, as preenchidas em coral | "**3/10 vagas preenchidas.** Já tem vídeo de Saquarema, Floripa e Itacaré na fila 🤙" | Caixa de pergunta: "Qual manobra tu quer que a IA analise?" |
| **Depois** (vagas esgotadas) | Bolinhas todas em coral, carimbo "ESGOTOU" | "**10/10.** Valeu, galera! Primeira análise sai [dia]. Quem ficou de fora: ativa o sininho que vai ter nova rodada." | Sticker "Lembrete" para o 1º episódio da série |

---

## 4. Resposta automática por DM (quem comentar ANÁLISE)

```text
Aloha! 🤙 Valeu por topar colocar teu surf na mão da nossa IA.

Ela ainda tá em desenvolvimento, aprendendo com a galera. Teu vídeo ajuda a treinar, e a análise
pode errar aqui e ali. Combinado?

COMO MANDAR:
📹 Responde aqui no DM com o vídeo (ou um link do Drive/WeTransfer se for pesado).
⏱️ Só a onda: de 5 a 30 segundos, da remada até o fim da manobra.
📐 Ângulo ideal: filmado da areia ou do costão, de lado pra onda, câmera parada (tripé ou
   apoiada), com zoom suficiente pro corpo ocupar pelo menos 1/4 da altura da tela.
☀️ Luz de dia, sem contraluz forte. Pode ser horizontal ou vertical.
🏄 Uma pessoa surfando a onda. Conta qual é tu (cor da roupa ou da prancha) e qual manobra tentou.

REGRAS DOS 10 PRIMEIROS:
1. Valem os 10 primeiros vídeos que chegarem completos pelo DM e dentro das orientações.
2. O vídeo tem que ser teu (tu surfando, filmado por ti ou por um amigo que topou).
3. Mandando, tu autoriza a Surfzada a postar o vídeo e a análise no @surfzada.app, com teu @.
   Se preferir só receber a análise no privado, avisa.
4. A análise chega por DM em até 7 dias. Os escolhidos viram episódio da série
   "A IA analisou o surf de @…".
5. Uma vaga por pessoa. Vagas acabaram? Fica de olho que vai ter nova rodada.

Bora? Manda o vídeo aqui 👇
```

---

## 5. Plano de série: "A IA analisou o surf de @fulano"

- **Frequência:** 2 episódios por semana (terça e sexta, 18 h) durante 5 semanas = os 10
  vídeos. Stories no dia anterior com teaser ("Amanhã: a rasgada do @…").
- **Formato:** Reel de 20–25 s, mesmo esqueleto do piloto: gancho no pico congelado → rewind com
  pose → 2 ou 3 notas → placar → linha ideal → "Manda o teu". Variar o encerramento com o surfista
  reagindo (se ele mandar um vídeo-resposta, entra nos 3 últimos segundos).
- **Título padrão (capa e primeira legenda):** `A IA analisou o surf de @fulano 💀` · na capa:
  número do episódio + manobra ("EP.03 · CAVADA").
- **Ordem:** alternar quem manda bem e quem toma vaca (humor e técnica), terminar com o melhor
  surf da rodada ("a IA ficou sem argumento").
- **Regras de respeito:** roast é com o surf, não com a pessoa; ninguém entra sem autorização
  (regra 3 da DM); menor de idade só com autorização do responsável.
- **Produção:** cada episódio é uma peça nova a partir desta (`npm run novo -- ia-analisa-<nome>`),
  com os clipes no Drive e o `extrair_pose.py` apontando para eles. Se a série vingar, vira um
  modelo em `modelos/` (vale a pena a partir do 3º episódio).
- **Fechamento da rodada:** carrossel "Ranking da rodada" (as 10 notas) + chamada para a rodada 2.

---

## 6. Métricas e sucesso nas primeiras 48 h

| Métrica | Por que importa | Sucesso em 48 h (referência para perfil em fase de teaser) |
|---|---|---|
| **Retenção nos 3 s** (Reels Insights) | Mede o gancho e decide o teste A/B | ≥ 70% |
| **Tempo médio assistido / % que vê até o fim** | Cortes e roteiro segurando | ≥ 60% do vídeo; ≥ 35% chegam no CTA |
| **Comentários "ANÁLISE"** | Intenção real de mandar vídeo | ≥ 50 (5× o número de vagas) |
| **Vídeos recebidos válidos** | O objetivo da campanha | 10/10 vagas em até 48 h |
| **Envios por DM + compartilhamentos** | Viralização ("marca o brother") | Envios ≥ 3% das visualizações |
| **Salvamentos** | Valor técnico percebido | ≥ 1,5% das visualizações |
| **Alcance de não seguidores** | Se o Reel saiu da bolha | ≥ 60% do alcance |
| **Novos seguidores** | Base para o lançamento do app | ≥ 2% do alcance vira seguidor |
| **Respostas da enquete dos stories** | Aquecimento e escassez | ≥ 10% de quem viu o story |

Leitura: se a retenção nos 3 s ficar abaixo de 50%, trocar o gancho (B ou C) e repostar como
teste; se tiver muita visualização e pouco "ANÁLISE", deixar o CTA mais cedo (aos 20 s) na
próxima. Anotar os números no `post.md` (Notas de revisão) depois das 48 h.
