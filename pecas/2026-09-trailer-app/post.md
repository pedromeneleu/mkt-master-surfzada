---
titulo: Trailer da Surfzada (app) + reel de energia
slug: 2026-09-trailer-app
serie: null
modelo: proprio
formato: video-16x9
canais: [instagram, youtube, site]
status: revisao
responsavel: joao
publicar_em: null
publicado_em: null
link: null
renders:
  - composicao: trailer-app-16x9
    arquivo: surfzada-trailer-16x9.mp4
  - composicao: trailer-app-9x16
    arquivo: surfzada-trailer-9x16.mp4
  - composicao: trailer-app-reel-energia
    arquivo: surfzada-reel-energia-9x16.mp4
---

## Briefing

Vídeo de apresentação da plataforma no estilo "trailer de software": texto cinético, telas
reais com zoom, cursor animado e cortes no ritmo da música.

- **16:9, ~64 s** (`trailer-app-16x9`): site, YouTube, apresentação.
- **9:16, 30 s** (`trailer-app-9x16`): Reels, TikTok, prévia de loja.
- **Reel de energia, 9:16, ~15 s** (`trailer-app-reel-energia`): apresenta o mapa de energia
  da Timeline Pico e o gráfico "Energia e potência". Sai **sem trilha**, e a música entra no
  Instagram. A virada da música deve cair no impacto do mapa, aos 2,7 s.

## Roteiro

### 16:9

| Tempo | Batidas | Cena | O que acontece | Texto |
|---|---|---|---|---|
| 0–5,3 s | 8 | Gancho | Fundo escuro, linha de onda coral; uma pergunta por compasso | "O mar tá bom?" → "Quem vai surfar?" |
| 5,3–10,7 s | 8 | Dor | Mensagens de grupo a cada meia batida; no respiro, desfoque e riser | "Surfar não devia depender de 40 mensagens no grupo." |
| 10,7–16 s | 8 | Revelação | **Na virada**: impacto + flash, o logo se desenha, o navegador sobe | "Feito pra comunidade do surf." |
| 16–26,7 s | 16 | Previsões | Mapa do Ceará, pinos pulsando, clique na Praia do Futuro | "Como o mar tá agora." |
| 26,7–32 s | 8 | Gráficos | Altura das ondas, maré e bússola, um cartão por batida | "Onda, swell, vento e maré." |
| 32–40 s | 12 | Surf check | O formulário se preenche, um clique por batida | "Quem tá na água conta como tá." |
| 40–48 s | 12 | Sessões | Nova sessão, o cartão no feed e confirmações (1 → 6) | "Marque a sessão. Chame a galera." |
| 48–53,3 s | 8 | Web e celular | Navegador e celular lado a lado; busca digitada | "Na web e no celular." |
| 53,3–58,7 s | 8 | Prova | Os picos reais acendem de norte a sul | "536 picos · 15 estados" (da API) |
| 58,7–64 s | 8 | Final | Símbolo, wordmark e endereço sobre o acorde final | "Bora surfar?" · surfzada.com.br |

O 9:16 reaproveita as cenas (45 batidas, 30 s): gancho → conversa do grupo → revelação no
celular (virada aos 8 s) → previsões no celular → sessões → prova → final.

### Reel de energia

| Tempo | Batidas | Cena | O que acontece |
|---|---|---|---|
| 0–2,7 s | 4 | Gancho | "NOVO NA SURFZADA" e "Mesmo tamanho. *Dobro* de força.": duas ondulações de 1,5 m (8 s e 16 s), 9 → 18 kW/m |
| 2,7–7,3 s | 7 | Mapa de energia | Impacto, toque em "Energia" e a timeline corre três dias: o swell de sul chega ao Arpoador |
| 7,3–12 s | 7 | Energia e potência | O gráfico se desenrola até o máximo da semana; um toque abre o balão com a potência |
| 12–14,7 s | 4 | Chamada | Logo, "NOVO · Energia e potência em cada pico", surfzada.com.br e "link na bio" |

## Legenda

_A definir._

## Hashtags

_A definir._

## Créditos

- Trilha: "Modern Psychedelic Acoustic Rock Full", de catch22music (Pixabay). Licença da Pixabay:
  uso comercial liberado, sem atribuição. A faixa está no Content ID: se o YouTube acusar,
  conteste com o certificado de licença baixado da página da faixa. O arquivo não vai para o
  git (a licença não permite redistribuir a música solta): fica no Drive.
- Telas: capturas de surfzada.com.br com dados de demonstração.

## Notas técnicas

Tudo é gerado por código:

1. **Playwright** tira screenshots nítidos de surfzada.com.br e anota a posição de cada
   elemento (`scripts/captura/capturar.ts`). A captura intercepta a API **só dentro do
   navegador do Playwright** (`scripts/captura/mocks.ts`): login, feed, sessões, surf checks e
   surfistas são simulados; previsões, picos, busca e mapas são reais; nenhum POST/PUT/DELETE
   sai do navegador. Para ter foto no surf check da Marina, ponha um `.jpg` em
   `scripts/captura/fotos/`.
2. **Remotion** anima tudo frame a frame: câmera, cursor, destaques e textos.
3. Os efeitos sonoros vêm de `npm run sfx`.
4. A trilha é analisada por `npm run musica -- trailer-app` (andamento, virada, fim) e o
   roteiro se encaixa nela: cenas e acentos medidos em batidas com `bt(n)`; trocas de cena no
   tempo 1 dos compassos; a trilha toca em trechos emendados com crossfade (`Trailer.tsx`).
   Virada: 66,68 s; 90,01 BPM (1 batida = 20 frames). `COM_MUSICA = false` em `tema.ts` volta
   a só efeitos, a 120 BPM.

As capturas e a trilha ficam no Drive (`assets.json`). Para refazer as capturas:

```bash
npx tsx pecas/2026-09-trailer-app/scripts/captura/capturar.ts          # telas + dados/manifesto.json
npx tsx pecas/2026-09-trailer-app/scripts/captura/capturar-energia.ts  # reel de energia + dados/energia.json
```

A captura de energia usa o web local no build de produção (`ng serve --configuration production
--port 4300` em `web/client`), libera o CORS da API e monta a `previsoes/grade-energia` a partir
da Open-Meteo. `PICO="Arpoador"` escolhe o pico. Depois de uma captura nova, confira
`QUADRO_INICIO`/`QUADRO_FIM` em `cenas/Energia.tsx`. Depois de capturar, suba a pasta
`public/pecas/2026-09-trailer-app/capturas/` para o Drive.

## Notas de revisão

- Migrado de `mkt/videos/trailer` em 2026-10-05. Status a confirmar (publicado?).
