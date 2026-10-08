# 01 · Setup

Uma vez por máquina. Leva uns 15 minutos (a maior parte é o `npm ci`).

## 1. Ferramentas

| Ferramenta | Versão | Para quê | Como conferir |
|---|---|---|---|
| Node.js | 22 ou mais (`.nvmrc`) | Remotion e a CLI | `node -v` |
| Git | qualquer recente | versionar | `git --version` |
| ffmpeg | 6 ou mais, no PATH | converter vídeos do Drive, carrossel, GIFs | `ffmpeg -version` |
| Google Drive para computador | — | acessar `MKT_DRIVE` como uma pasta | abre o Drive no Explorer/Finder |
| Python | 3.11 ou mais (opcional) | scripts de algumas peças e produtos | `py --version` / `python3 --version` |

Windows: `winget install OpenJS.NodeJS.LTS Git.Git Gyan.FFmpeg Python.Python.3.12 Google.GoogleDrive`.
macOS: `brew install node git ffmpeg python` + o Drive para computador.

O Remotion baixa o próprio Chrome headless na primeira vez que renderiza.

## 2. Clonar e instalar

```bash
git clone https://gitlab.com/plataforma-de-surf/mkt.git
cd mkt
npm ci
```

(Quem usa o repositório principal recebe o `mkt` como submódulo: `git submodule update --init mkt`.)

## 3. Drive e `.env`

1. Peça acesso à pasta do Drive de marketing ("Insumos pra Marketing"). A estrutura dela está em
   [04-assets-e-drive.md](04-assets-e-drive.md).
2. No Drive para computador, deixe essa pasta **disponível offline** (ou ao menos as subpastas das
   peças em que você vai trabalhar): o render lê os arquivos direto dela.
3. Copie o `.env`:

   ```bash
   cp .env.exemplo .env
   ```

   e ajuste:

   | Variável | Exemplo | Para quê |
   |---|---|---|
   | `MKT_DRIVE` | `G:/O meu disco/Insumos pra Marketing` (Windows) · `~/Library/CloudStorage/GoogleDrive-<email>/Drives compartilhados/Insumos pra Marketing` (macOS) | raiz do Drive de marketing |
   | `MKT_TEMP` | `D:/tmp-remotion` | pasta temporária do render. O Remotion deixa sobras de GBs; aponte para um disco com espaço (no Windows, evite o C: se ele estiver cheio) |
   | `API_URL` | `https://api.surfzada.com.br/api` | API usada pelos dados de previsão |
   | `MKT_RESPONSAVEL` | `joao` | (opcional) preenche o `responsavel` das peças novas |

   O `.env` não vai para o git.

## 4. Gerar os efeitos sonoros

```bash
npm run sfx        # public/compartilhado/sfx/*.wav (gerados por código, iguais em toda máquina)
```

## 5. Conferir

```bash
npm run checar                                   # tipos + post.md + assets.json
npm run pecas                                    # painel das peças
npm run render -- previsao-fim-de-semana         # peça que não precisa do Drive
```

Se o último comando gerar `out/2026-10-previsao-fim-de-semana/surfzada-previsao-fim-de-semana-9x16.mp4`,
está tudo certo. Abra o Studio com `npm run studio`.

## 6. Python (só se for usar scripts .py)

```bash
py -m venv .venv
.venv\Scripts\pip install -r requirements.txt        # Windows
# source .venv/bin/activate && pip install -r requirements.txt   (macOS/Linux)
```

## 7. IA

- **Claude Code**: abra o terminal na pasta `mkt/`. Ele lê o `CLAUDE.md` (que importa o `AGENTS.md`)
  e as skills de `.claude/skills/` (`/novo-post`, `/renderizar`, `/revisar`, `/entregar`).
- **Codex** e outros: leem o `AGENTS.md` da raiz.

## Problemas comuns

| Sintoma | Causa e solução |
|---|---|
| `Configure MKT_DRIVE no .env` | faltou o passo 3 |
| `Não achei no Drive: ...` no `npm run assets` | o Drive ainda está sincronizando, a pasta não está offline, ou o arquivo ainda não foi para o Drive (ver 04) |
| Imagem/vídeo faltando no Studio (404) | rode `npm run assets -- <peca>` |
| Disco C: cheio depois de renders | configure `MKT_TEMP` e apague a pasta temporária antiga |
| `ffmpeg não encontrado` | instale e reabra o terminal |
| Fonte diferente no render | sem internet na primeira vez: a Poppins vem do Google Fonts |
