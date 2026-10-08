---
titulo: {{TITULO}}
slug: {{SLUG}}
serie: null
modelo: story-previsao
formato: story-9x16
canais: [instagram]
status: producao
responsavel: {{RESPONSAVEL}}
publicar_em: null
publicado_em: null
link: null
renders:
  - composicao: {{ID}}
    arquivo: surfzada-{{NOME}}-9x16.mp4
---

## Briefing

Story de previsão (modelo `story-previsao`). Gancho: _"Onde tem onda até domingo?"_ (troque em
composicoes.tsx). Picos: os de `PICOS` (ou `PICOS_SEMANA` com `--semana`) em
`modelos/story-previsao/dados.ts`.

## Roteiro

Tabela parada desde o primeiro frame; o dia troca a cada 4,5 s; no fim, cascata para o melhor dia
de cada pico (★). Sai sem trilha: a música entra no Instagram.

## Legenda

_Story: sem legenda._

## Hashtags

_Não se aplica (story)._

## Créditos

Previsões da API da Surfzada (`npm run dados -- {{SLUG}}`, gerado em _AAAA-MM-DD_).

## Notas de revisão

- 
