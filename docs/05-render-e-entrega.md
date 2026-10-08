# 05 · Render e entrega

## Formatos do Instagram

| `formato` no post.md | Tamanho | Uso | Constante |
|---|---|---|---|
| `story-9x16` | 1080×1920 | stories | `FORMATOS['story-9x16']` |
| `reel-9x16` | 1080×1920 | reels, TikTok | `FORMATOS['reel-9x16']` |
| `carrossel-1x1` | 1080×1080 | carrossel quadrado, capas | `FORMATOS['carrossel-1x1']` |
| `carrossel-4x5` | 1080×1350 | carrossel retrato (ocupa mais o feed) | `FORMATOS['carrossel-4x5']` |
| `video-16x9` | 1920×1080 | YouTube, site, apresentação | `FORMATOS['video-16x9']` |

30 fps em tudo (`FPS`). Áreas seguras: [07-marca.md](07-marca.md).

## `renders:` no post.md

```yaml
renders:
  - composicao: playlist-pororoca-capa      # id da <Composition>/<Still>
    arquivo: surfzada-playlist-pororoca-capa-1x1.jpg
    escala: 2                               # 2160×2160
    copiar_para_public: capa.jpg            # usado por outra composição da peça (ordem importa)
  - composicao: playlist-pororoca
    arquivo: surfzada-playlist-pororoca-9x16.mp4
```

| Campo | |
|---|---|
| `composicao` | id registrado em `composicoes.tsx` |
| `arquivo` | nome final, kebab-case: `surfzada-<nome>[-variante]-<proporção>.<mp4/png/jpg/gif>` |
| `still` | imagem parada (deduzido da extensão png/jpg) |
| `frame` | quadro do still (padrão 0) |
| `escala` | multiplica a resolução (2 = 4K num story) |
| `copiar_para_public` | depois de renderizar, copia para `public/pecas/<slug>/<caminho>` |

Vídeo: H.264, CRF 16, yuv420p, quadros intermediários em PNG. JPG: qualidade 92.

```bash
npm run render -- <peca>              # tudo, na ordem
npm run render -- <peca> --4k         # vídeos em 2× com sufixo -4k (bom para peças só de vetor/texto)
npm run render -- <peca> --so=<id>    # só um item
```

## Carrossel

```yaml
carrossel:
  master: true                 # renderiza em 2× e reduz com Lanczos (mais nítido)
  slides:
    - composicao: tributo-andy-capa
      quadro_png: 0            # PNG de um slide em vídeo: padrão é o último quadro
    - composicao: tributo-andy-auge
```

Sai em `out/<slug>/carrossel/NN-<composicao>.png` (+ `.mp4` para slides animados; o Instagram
aceita misturar vídeo e foto). Com `master`, o 2× fica em `carrossel/2160/`.

```bash
npm run carrossel -- <peca> --png        # só os PNGs (revisão rápida)
npm run carrossel -- <peca> capa auge    # só alguns slides
```

## Revisão rápida

```bash
npm run quadros -- <peca>                # 4 quadros de cada composição, em meia resolução
npm run quadros -- <peca> <id> 0 90 300  # quadros específicos
```

## Som

A maioria das peças sai **sem trilha**: a música entra no Instagram (catálogo licenciado do app).
Efeitos (`<Sfx>`) entram no arquivo. Trilha dentro do arquivo só com licença que permita (ver
[08-licencas.md](08-licencas.md)) e pelo Drive.

## Entrega

```bash
npm run entregar -- <peca>               # out/<slug>/ → MKT_DRIVE/entregas/<slug>/  (sem quadros/ e sem 2160/)
npm run entregar -- <peca> --com-master  # leva o 2160/ também
```

O comando muda o status para `aprovado`. Quem posta pega os arquivos em `entregas/<slug>/` e a
legenda/hashtags no `post.md`. Depois de postado, no post.md:

```yaml
status: publicado
publicado_em: 2026-10-12
link: https://www.instagram.com/p/...
```

## Disco

O Remotion deixa arquivos temporários grandes. A CLI usa `MKT_TEMP` (do `.env`) como pasta
temporária; limpe-a de vez em quando. `out/` pode ser apagado a qualquer momento (tudo se refaz).
