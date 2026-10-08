# story-previsao

Story 9:16 de previsão: tabela de picos × dias com a altura da manhã, sanfona com swell/vento/energia e o melhor dia de cada pico (★). Sem trilha.

**Peças feitas com ele:** `2026-10-previsao-fim-de-semana`, `2026-10-previsao-semana-eleicao`.

## Criar uma nova

```bash
npm run novo -- previsao-fds-17-out --modelo=story-previsao --titulo="Previsão até domingo (17/10)"
npm run dados -- previsao-fds-17-out              # de amanhã até domingo (PICOS)
npm run dados -- previsao-fds-17-out --semana     # a semana inteira (PICOS_SEMANA)
npm run dados -- previsao-fds-17-out 2026-10-15   # a partir de um dia
npm run render -- previsao-fds-17-out
```

## Arquivos

- `StoryPrevisao.tsx`: `criarStory(opções)` devolve `{ Story, duracao }`.
- `dados.ts`: busca as previsões na API (`API_URL` do .env) e grava `pecas/<slug>/dados.json`.
  As listas de picos (`PICOS`, `PICOS_SEMANA`) e a orientação de cada praia ficam aqui.
- `tipos.ts`: formato do dados.json.
- `template/`: o que o `npm run novo` copia.

## Opções de `criarStory`

| Opção | O que faz |
|---|---|
| `dados` | o dados.json da peça |
| `titulo` | JSX do título grande (use `<span style={{ color: COR.coral }}>` para a palavra-chave) |
| `sobretitulo` | antes das datas ("PREVISÃO", "PREVISÃO DA SEMANA") |
| `legendaFinal` | texto do final, depois da ★ |
| `quadrosPorDia` | duração de cada dia no ciclo (135 = 4,5 s; com 7 dias use ~115) |
| `topoLinhas`, `alturaLinha` | posição da tabela (título em 2 linhas: desça uns 30 px) |
| `altura` | `'onda'` (Hs total, padrão) ou `'swell'` (só a do swell) |

## Regras

- Primeiro frame já montado (o story tem que funcionar parado). Faixas de ~230 px em cima e ~220 px
  embaixo livres para a interface do Instagram.
- A orientação das praias (terral/maral/cruzado) é estimada; a API ainda não tem esse campo.
