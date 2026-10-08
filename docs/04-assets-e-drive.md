# 04 · Assets e Drive

## O que vai para onde

| Tipo | Onde | Exemplo |
|---|---|---|
| Código, `post.md`, docs, dados pequenos (JSON) | **git** | `pecas/*/post.md`, `dados.json` |
| Arquivo leve **e** redistribuível (≤ 2 MB, licença livre ou nosso) | **git**, em `pecas/<slug>/assets/` | foto CC da capa da playlist |
| Vídeo, áudio, foto com direitos, sequência de quadros, qualquer coisa > 2 MB | **Drive** | brutos do iPhone, fotos da WSL, trilha da Pixabay |
| Arquivos de trabalho de design/3D (`.af`, `.blend`, `.psd`) | **Drive**, em `produtos/` | camisa TSHIRT-01 |
| Renders finais | **Drive**, em `entregas/<slug>/` | `surfzada-playlist-teahupoo-9x16.mp4` |
| `public/`, `out/`, `node_modules/` | **nenhum** (gerados) | |

O `.gitignore` já barra vídeo, áudio, `.blend`, `.af`, `.psd`, zip, `public/` e `out/`. O
`npm run checar` barra qualquer arquivo versionável acima de 2 MB e caminhos de máquina.

## Estrutura do Drive (`MKT_DRIVE`)

`MKT_DRIVE` é a pasta **"Insumos pra Marketing"** do Google Drive.

```
Insumos pra Marketing/
├─ Captações/<CAPTACAO>/      brutos como saíram da câmera, por saída/evento (ex.: SAQUAREMA-0626, IPANEMA-0626)
├─ pecas/<slug>/              material de uma peça: fotos com direitos, sequências, trilhas, vídeos convertidos
├─ produtos/<produto>/        arquivos de trabalho de produtos (camisa-tshirt-01: .af, .blend, export/)
├─ entregas/<slug>/           renders finais aprovados (`npm run entregar`)
└─ arquivo/                   material morto ou só de conferência (não postar)
```

Regras:

- `Captações/` guarda o bruto **original** (não renomeie: o nome da câmera é a referência).
  Nome da pasta: `<LUGAR>-<MMAA>` em maiúsculas, como já está.
- `pecas/<slug>/` usa o **mesmo slug** da pasta da peça no git.
- Nada de `v2`, `final`: substitua o arquivo e, se precisar guardar o antigo, mande para `arquivo/`.

## `assets.json`

Cada peça lista o que precisa do Drive. O `npm run assets -- <peca>` copia (ou converte) para
`public/pecas/<slug>/`, e o código lê com `arquivo('caminho')`.

```json
{
  "arquivos": [
    { "origem": "pecas/2026-10-parabens-ryan/fotos/*.jpg", "destino": "fotos/", "nota": "Fotos da WSL" },
    { "origem": "pecas/2026-09-trailer-app/capturas/", "destino": "capturas/" },
    { "origem": "pecas/2026-09-trailer-app/musica.mp3", "destino": "musica.mp3" },
    {
      "origem": "Captações/SAQUAREMA-0626/IMG_6552.MOV",
      "destino": "clipes/atletas2.mp4",
      "converter": { "orientacao": "vertical", "hdr": true, "corte": [0, 8] }
    }
  ]
}
```

| Campo | |
|---|---|
| `origem` | relativo a `MKT_DRIVE`. Arquivo, pasta (termina em `/`) ou `*` no nome |
| `destino` | dentro de `public/pecas/<slug>/`. Termina em `/` = pasta |
| `converter` | (opcional) converte vídeo com ffmpeg: `orientacao` `vertical` (1080×1920) ou `deitado` (1920×1080); `hdr: true` faz o tonemap HLG → SDR (iPhone), `false` para câmeras SDR (Canon `MVI_*`); `corte: [início, fim]` em segundos; `audio: true` mantém o som. Sempre sai H.264, sem GPS/metadados |
| `nota` | aparece no aviso quando o arquivo não é achado |

`npm run assets` só copia/converte o que falta ou mudou; `--todos` refaz tudo; `--todas` faz todas
as peças. O que não for achado aparece listado no fim.

Arquivo **gerado** por um script da peça (ex.: capturas de tela, quadros do giro)? Gere em
`public/pecas/<slug>/...` e **suba o resultado para o Drive** em `pecas/<slug>/...`, para os outros
não precisarem rodar o script.

## Migração do legado (pendente, para a pessoa responsável pelos arquivos)

O material pesado da estrutura antiga (`videos/`, `ondalogia/`, `accesorios e roupas/`) ainda está
só na máquina do João, e as pastas antigas estão fora do git (excluídas localmente). Para fechar a
migração, copie para o Drive como abaixo (caminhos de destino relativos a "Insumos pra
Marketing"), rode `npm run assets -- --todas` para conferir que nada falta e só então apague as
pastas antigas.

### Material das peças (o `assets.json` de cada uma já aponta para cá)

| De (mkt antigo) | Para (Drive) |
|---|---|
| `videos/trailer/public/capturas/` | `pecas/2026-09-trailer-app/capturas/` |
| `videos/trailer/public/musica.mp3` | `pecas/2026-09-trailer-app/musica.mp3` |
| `videos/trailer/public/videos/ipanema-one-shot.mp4` | `pecas/2026-10-meme-one-shot/fundo-ipanema.mp4` |
| `videos/trailer/public/videos/saquarema-one-shot.mp4` | `pecas/2026-10-meme-one-shot/fundo-saquarema.mp4` |
| `videos/trailer/public/fotos/ryan/{aereo,batida,comemoracao,trofeu}.jpg` | `pecas/2026-10-parabens-ryan/fotos/` |
| `videos/saquarema-cinematico/Refactor.mp4` | `pecas/2026-10-saquarema-cinematico/refactor.mp4` |
| `videos/tributo-andy/public/giro/` (225 JPGs) | `pecas/2026-10-tributo-andy/giro/` |
| `videos/tributo-andy/public/fotos/andy/` (com `candidatas/`) | `pecas/2026-10-tributo-andy/fotos/andy/` |
| `videos/tributo-andy/public/arte/` | `pecas/2026-10-tributo-andy/arte/` |
| `videos/tributo-andy/public/reticula/` | `pecas/2026-10-tributo-andy/reticula/` |
| `ondalogia/video/public/episodios/01/reais/{r1-inicio.jpg, r1-congelado.jpg, r1-telo-island.mp4, r2-swell-aereo-tomfisk.mp4}` | `pecas/2026-09-explica-ep01/reais/` |
| `videos/one-shot-ipanema/IMG_6440.mov` | `Captações/IPANEMA-0626/IMG_6440.mov` |
| — (já está no Drive) | `Captações/SAQUAREMA-0626/` (clipes do Saquarema cinemático e o IMG_6577 do meme) |
| `shot_01_v11` (vídeo da camisa girando, fonte do giro; estava em Downloads e não foi achado) | `pecas/2026-10-tributo-andy/shot_01_v11.mp4`, se ainda existir |

### Produto: camisa TSHIRT-01

| De | Para |
|---|---|
| `accesorios e roupas/TSHIRT-01.af` | `produtos/camisa-tshirt-01/TSHIRT-01.af` |
| `accesorios e roupas/tshirt-01.blend` (o `.blend1` é backup automático, pode ficar de fora) | `produtos/camisa-tshirt-01/tshirt-01.blend` |
| `accesorios e roupas/tshirt-01/export/` | `produtos/camisa-tshirt-01/export/` |
| `accesorios e roupas/tshirt-01/texturas/` | `produtos/camisa-tshirt-01/texturas/` |
| `accesorios e roupas/tshirt-01/modelos/` (modelo do Zakaria, CC BY) | `produtos/camisa-tshirt-01/modelos/` |

### Entregas (renders já feitos)

| De | Para `entregas/<slug>/` |
|---|---|
| `videos/trailer/out/surfzada-trailer-{16x9,9x16}.mp4`, `surfzada-reel-energia-9x16.mp4` | `2026-09-trailer-app/` |
| `videos/trailer/out/surfzada-story-fim-de-semana-9x16[-4k].mp4` | `2026-10-previsao-fim-de-semana/` (renomear para `surfzada-previsao-fim-de-semana-9x16[-4k].mp4`) |
| `videos/trailer/out/surfzada-story-semana-eleicao-9x16.mp4` | `2026-10-previsao-semana-eleicao/` (`surfzada-previsao-semana-eleicao-9x16.mp4`) |
| `videos/trailer/out/surfzada-story-parabens-ryan-9x16.mp4` | `2026-10-parabens-ryan/` (`surfzada-parabens-ryan-9x16.mp4`) |
| `videos/trailer/out/surfzada-story-playlist-<vibe>-9x16.mp4` e `capa-playlist-<vibe>.jpg` | `2026-10-playlist-<vibe>/` (`surfzada-playlist-<vibe>-9x16.mp4`, `surfzada-playlist-<vibe>-capa-1x1.jpg`) |
| `videos/trailer/out/surfzada-meme-{trabalho,prova}-9x16.mp4`, `texto-meme-*.png`, `logo-meme.png`; `videos/one-shot-ipanema/surfzada-meme-saquarema-*.mp4` (as versões de ~18 MB) e `surfzada-meme-mente-*.mp4` | `2026-10-meme-one-shot/` |
| `videos/trailer/out/surfzada-saquarema-cinematico-9x16.mp4` | `2026-10-saquarema-cinematico/` |
| `videos/tributo-andy/out/carrossel/` (com `2160/`) | `2026-10-tributo-andy/carrossel/` |
| `ondalogia/video/out/surfzada-analisa-01.mp4` e `carrossel01/` | `2026-09-explica-ep01/` (`surfzada-explica-ep01-9x16.mp4`, `carrossel/`) |
| `ondalogia/video/out/{andy-demo.mp4, gifs/andy-bad-boy*.gif, sprites/}` | `andy-estudo/` |

### Arquivo (não postar)

| De | Para `arquivo/` |
|---|---|
| `videos/trailer/out/surfzada-saquarema-cinematico-METRONOMO.mp4`, `videos/saquarema-cinematico/teste-look-IMG_6444.png` | `2026-10-saquarema-cinematico/` |
| `videos/trailer/out/surfzada-trailer-9x16.zip` | `2026-09-trailer-app/` |
| `videos/trailer/public/fotos/ryan/podio.jpg` (não usada) | `2026-10-parabens-ryan/` |
| `ondalogia/video/public/episodios/01/reais/r2-swell-aereo.mp4` ("não serve") | `2026-09-explica-ep01/` |
| `ondalogia/mascote/pinguim-conceitos.{html,png}` (conceito descartado) | `mascote/` |

Pode descartar sem copiar: `node_modules/` (3×), `out/quadros/`, `out/saq-*.png`, `sorriso*.png`,
`public/sfx/` (tudo é regenerado), `public/capas/` (cópia das capas) e os `.blend1`.

Depois de conferido, apague as pastas antigas e a exclusão local:

```bash
rm -rf videos ondalogia "accesorios e roupas" logo_v2_sem_fundo.png
# e remova o bloco "Legado em migração" de .git/info/exclude
```
