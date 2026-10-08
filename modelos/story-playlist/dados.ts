/**
 * Dados do modelo story-playlist: lê a playlist da Surfzada no Spotify (página
 * pública do embed, sem login) e grava pecas/<slug>/dados.json com nome, link,
 * número de músicas, duração total e as faixas na ordem da playlist.
 *
 * Uso: npm run dados -- <peca> <id ou link da playlist>
 *      npm run dados -- <peca>          (reaproveita o link que já está no dados.json)
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import type { ContextoDados } from '../../scripts/dados';

/** Tira os sufixos de remaster ("Song 2 - 2012 Remaster", "Would? (2022 Remaster)"). */
const limpar = (titulo: string) =>
  titulo
    .replace(/\s+-\s+.*remaster(ed)?.*$/i, '')
    .replace(/\s*\([^)]*remaster(ed)?[^)]*\)/i, '')
    .trim();

function duracao(ms: number): string {
  const min = Math.round(ms / 60000);
  const h = Math.floor(min / 60);
  return h ? `${h} h ${String(min % 60).padStart(2, '0')} min` : `${min} min`;
}

interface Faixa {
  title: string;
  subtitle: string;
  duration: number;
}

export default async function gerar({ pasta, args }: ContextoDados) {
  const arquivo = join(pasta, 'dados.json');
  const anterior = existsSync(arquivo) ? (JSON.parse(readFileSync(arquivo, 'utf8')) as { url?: string }) : {};
  const pedido = args.posicionais[0] ?? anterior.url ?? '';
  const spotify = pedido.match(/playlist\/([A-Za-z0-9]+)/)?.[1] ?? (/^[A-Za-z0-9]{22}$/.test(pedido) ? pedido : null);
  if (!spotify) throw new Error('Passe o id ou o link da playlist: npm run dados -- <peca> https://open.spotify.com/playlist/...');

  const html = await (await fetch(`https://open.spotify.com/embed/playlist/${spotify}`, { headers: { 'User-Agent': 'Mozilla/5.0' } })).text();
  const json = html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s)?.[1];
  if (!json) throw new Error(`Não achei os dados da playlist ${spotify} no embed do Spotify`);
  const e = JSON.parse(json).props.pageProps.state.data.entity;
  const faixas = (e.trackList as Faixa[]).map((t) => ({ titulo: limpar(t.title), artista: t.subtitle.replace(/ /g, ' ') }));
  const total = (e.trackList as Faixa[]).reduce((s, t) => s + t.duration, 0);
  const dados = {
    nome: e.name as string,
    url: `https://open.spotify.com/playlist/${spotify}`,
    capa: e.coverArt?.sources?.[0]?.url ?? null,
    musicas: faixas.length,
    duracao: duracao(total),
    faixas,
  };
  writeFileSync(arquivo, JSON.stringify(dados, null, 2) + '\n');
  console.log(`${dados.nome}: ${dados.musicas} músicas · ${dados.duracao} → ${arquivo}`);
}
