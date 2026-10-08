# Convenções

## Língua

Português do Brasil em tudo: nomes de pastas, arquivos, variáveis, componentes, comentários, docs,
commits. Termos técnicos sem tradução boa ficam em inglês (`render`, `loop`, `story`).

## Nomes

| O quê | Padrão | Exemplo |
|---|---|---|
| Pasta e arquivo (não-componente) | kebab-case, sem acento, sem espaço | `story-playlist/`, `dados.json`, `preparar_giro.py` (Python: snake_case) |
| Componente React | PascalCase | `StoryPlaylist.tsx`, `CapaPlaylist` |
| Peça | `AAAA-MM-<nome>` (mês de criação) | `2026-10-playlist-teahupoo` |
| Branch | `peca/<slug>` · `infra/<assunto>` | `peca/2026-10-playlist-teahupoo` |
| Id de composição | `<nome>[-variante]`, kebab-case, único no projeto | `playlist-teahupoo`, `playlist-teahupoo-capa`, `meme-ipanema-prova` |
| `<Folder>` no Studio | o slug da peça | `2026-10-playlist-teahupoo` |
| Render | `surfzada-<nome>[-variante]-<proporção>.<ext>` | `surfzada-playlist-teahupoo-9x16.mp4`, `-capa-1x1.jpg`, `-9x16-4k.mp4` |
| Slides de carrossel | `NN-<composicao>.png/mp4` (automático) | `01-tributo-andy-capa.mp4` |
| Bruto no Drive | o nome original da câmera, em `Captações/<LUGAR>-<MMAA>/` | `Captações/SAQUAREMA-0626/IMG_6552.MOV` |
| Arquivo dentro de `public/pecas/<slug>/` | kebab-case, por função | `fundo-ipanema.mp4`, `clipes/atletas2.mp4`, `fotos/andy/` |

**Proibido em nome:** `v2`, `final`, `novo`, `teste`, `copia`, datas soltas. O histórico é do git;
versão velha que precisa ficar vai para `arquivo/` no Drive.

## Código

- Imports: externos, depois `@compartilhado/...`/`@modelos/...`, depois relativos (`./`).
- Constantes de roteiro em MAIÚSCULAS no topo do arquivo (`DURACAO`, `FRASES`, `PLANOS`), com um
  comentário dizendo de onde vêm (decupagem, fonte do dado).
- Tempo em quadros (30 fps). Se a peça tem música, em batidas (`bt(n)`).
- Comentário explica o **porquê** (decisão de roteiro, medida, pedido do João), não o óbvio.
- Props de componentes de modelo: `type`, não `interface`.
- Nada de `staticFile` em peça: `arquivo(...)`. Nada de caminho de máquina.

## post.md

Frontmatter obrigatório (validado pelo `npm run checar`):

```yaml
titulo:        # livre
slug:          # = nome da pasta
serie:         # null ou o nome da série (surfzada-explica)
modelo:        # proprio ou o nome do modelo
formato:       # story-9x16 | reel-9x16 | carrossel-1x1 | carrossel-4x5 | video-16x9 | outro
canais:        # [instagram, tiktok, youtube, spotify, site]
status:        # ideia | producao | revisao | aprovado | publicado | arquivado
responsavel:   # nome curto
publicar_em:   # AAAA-MM-DD ou null
publicado_em:  # AAAA-MM-DD ou null
link:          # URL do post publicado ou null
renders:       # lista (ver docs/05)
carrossel:     # opcional (ver docs/05)
```

Corpo, nesta ordem: **Briefing**, **Roteiro**, **Legenda**, **Hashtags**, **Créditos**, **Notas de
revisão** (e, se precisar, **Notas técnicas** antes das notas de revisão).
