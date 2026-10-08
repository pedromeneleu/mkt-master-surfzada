/**
 * Painel das peças: slug, status, formato, responsável e datas, lido do
 * frontmatter de cada pecas/<slug>/post.md.
 *
 * Uso: npm run pecas
 *      npm run pecas -- --status=revisao
 *      npm run pecas -- --serie=surfzada-explica
 *      npm run pecas -- --modelos     (lista os modelos disponíveis)
 *      npm run pecas -- --composicoes (empacota e lista todas as composições do Studio)
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { argumentos, listarPecas, PASTA_MODELOS, STATUS } from './lib/pecas';

const { flags } = argumentos();

if (flags.modelos) {
  console.log('Modelos (npm run novo -- <nome> --modelo=<modelo>):\n');
  for (const m of readdirSync(PASTA_MODELOS, { withFileTypes: true }).filter((d) => d.isDirectory() && !d.name.startsWith('_'))) {
    const readme = join(PASTA_MODELOS, m.name, 'README.md');
    const resumo = existsSync(readme) ? (readFileSync(readme, 'utf8').split('\n').find((l) => l.trim() && !l.startsWith('#')) ?? '') : '';
    console.log(`  ${m.name.padEnd(18)} ${resumo}`);
  }
  process.exit(0);
}

if (flags.composicoes) {
  // Empacota o projeto: confirma que tudo compila e lista o que o Studio vai mostrar.
  const { getCompositions } = await import('@remotion/renderer');
  const { empacotar } = await import('./lib/remotion');
  const lista = await getCompositions(await empacotar());
  for (const c of lista) console.log(`  ${c.id.padEnd(34)} ${`${c.width}×${c.height}`.padEnd(10)} ${c.durationInFrames > 1 ? `${(c.durationInFrames / c.fps).toFixed(1)} s` : 'still'}`);
  console.log(`\n${lista.length} composições.`);
  process.exit(0);
}

const pecas = listarPecas().filter(
  (p) => (typeof flags.status !== 'string' || p.post.status === flags.status) && (typeof flags.serie !== 'string' || p.post.serie === flags.serie),
);

const linhas = pecas
  .sort((a, b) => STATUS.indexOf(a.post.status) - STATUS.indexOf(b.post.status) || a.slug.localeCompare(b.slug))
  .map((p) => [
    p.slug,
    p.post.status,
    p.post.formato,
    p.post.modelo,
    p.post.responsavel ?? '—',
    p.post.publicado_em ? `publicado ${p.post.publicado_em}` : p.post.publicar_em ? `publicar ${p.post.publicar_em}` : '—',
  ]);
const cab = ['peça', 'status', 'formato', 'modelo', 'resp.', 'data'];
const larg = cab.map((c, i) => Math.max(c.length, ...linhas.map((l) => l[i].length)));
const fmt = (l: string[]) => l.map((c, i) => c.padEnd(larg[i])).join('  ');
console.log(fmt(cab));
console.log(larg.map((n) => '─'.repeat(n)).join('  '));
for (const l of linhas) console.log(fmt(l));
console.log(`\n${linhas.length} peça(s). Por status: ${STATUS.map((s) => `${s} ${pecas.filter((p) => p.post.status === s).length}`).join(' · ')}`);
