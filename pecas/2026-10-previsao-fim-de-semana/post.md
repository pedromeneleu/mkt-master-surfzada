---
titulo: Previsão até domingo
slug: 2026-10-previsao-fim-de-semana
serie: null
modelo: story-previsao
formato: story-9x16
canais: [instagram]
status: revisao
responsavel: joao
publicar_em: null
publicado_em: null
link: null
renders:
  - composicao: previsao-fim-de-semana
    arquivo: surfzada-previsao-fim-de-semana-9x16.mp4
---

## Briefing

Story recorrente de previsão: "Onde tem onda até domingo?". Uma tabela parada desde o primeiro
frame, com um pico por estado, de norte a sul, e a altura da manhã (médias das 6h às 11h) de
amanhã até domingo. A coluna do dia abre como sanfona e mostra swell, vento e energia; no fim,
cada linha vai para o seu melhor dia (★), escolhido pela potência do mar descontada pelo vento.

Picos (lista `PICOS` em `modelos/story-previsao/dados.ts`): Praia do Futuro (CE, obrigatória),
Baía Formosa (RN), Regência (ES), Arpoador (RJ) e Maresias (SP).

## Roteiro

- 0 s: tabela montada (o story tem que funcionar parado no primeiro frame).
- A cada 4,5 s o dia troca, em todas as linhas juntas.
- Final (5,5 s): cascata para o melhor dia de cada pico, com a legenda "melhor dia de cada pico:
  mais mar e vento melhor".

Sai sem trilha: a música entra no Instagram. As faixas de cima (~230 px) e de baixo (~220 px)
ficam livres para a interface do story.

## Legenda

_Story: sem legenda. Sugestão de música: escolher no Instagram._

## Hashtags

_Não se aplica (story)._

## Créditos

Previsões da API da Surfzada (dados gerados em 2026-10-01).

## Notas de revisão

- Para a próxima semana: `npm run novo -- previsao-fim-de-semana --modelo story-previsao`,
  depois `npm run dados -- <slug-novo>` e `npm run render -- <slug-novo>`.
- A orientação das praias (que classifica o vento em terral/maral/cruzado) está no script e foi
  estimada; a API ainda não tem esse campo.
