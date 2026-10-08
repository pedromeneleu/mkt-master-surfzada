# story-playlist

Playlist da Surfzada no Spotify: capa 1:1 (2160) para o Spotify e story 9:16 em loop de 16 s ("disco-sol", com o sticker de link).

**Peças feitas com ele:** `2026-10-playlist-teahupoo`, `2026-10-playlist-waikiki`.

## Criar uma nova

```bash
npm run novo -- playlist-pororoca --modelo=story-playlist --titulo="Playlist Pororoca"
npm run dados -- playlist-pororoca https://open.spotify.com/playlist/<id>
# troque assets/foto.jpg + assets/creditos.json e os textos da capa em composicoes.tsx
npm run assets -- playlist-pororoca
npm run render -- playlist-pororoca      # a capa sai primeiro e é copiada para public/ antes do story
```

## Arquivos

- `StoryPlaylist.tsx`: `<StoryPlaylist vibe dados capa />` e `duracaoPlaylist(vibe)`. As **vibes**
  (`VIBES`) são presets visuais: `teahupoo` (pesada: fundo tinta, 120 BPM, tranco, glitch, 8 faixas)
  e `waikiki` (leve: fundo claro, 75 BPM, crossfade, 5 faixas). Para uma vibe nova, acrescente em
  `VIBES` mantendo tudo periódico em `faixas × porFaixa × batida` quadros (o loop tem que emendar).
- `CapaPlaylist.tsx`: `<CapaPlaylist {...capa} />` (nome, frase, foto, foco, coordenadas, legenda, crédito, claro).
- `dados.ts`: lê o embed público do Spotify (sem login) → `dados.json`.

## Regras

- Foto da capa com licença livre (Wikimedia/CC) e o crédito na própria capa. Até 2 MB em `assets/`.
- Sai sem trilha: no Instagram, use uma faixa da própria playlist.
- O sticker de link vai no halo coral (y ≈ 1715).
