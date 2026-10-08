/**
 * Renderiza uma peça: tudo o que está em `renders:` no post.md, na ordem, em
 * out/<slug>/, e depois o carrossel (se a peça tiver `carrossel:`).
 * Vídeo: H.264, CRF 16, yuv420p, frames em PNG (o mesmo do remotion.config.ts).
 *
 * Uso: npm run render -- <peca>
 *      npm run render -- <peca> --4k              (vídeos em 2× e sufixo -4k)
 *      npm run render -- <peca> --so=<composicao> (só um item)
 */
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, extname, join, relative } from 'node:path';
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer';

import { renderizarCarrossel } from './lib/carrossel';
import { acharPeca, argumentos, falhar, PASTA_OUT, PASTA_PUBLIC, RAIZ } from './lib/pecas';
import { empacotar } from './lib/remotion';

const { posicionais, flags } = argumentos();
const peca = acharPeca(posicionais[0]);
const { renders, carrossel } = peca.post;
const so = typeof flags.so === 'string' ? flags.so : null;
const em4k = Boolean(flags['4k']);

if (renders.length === 0 && !carrossel) falhar(`A peça ${peca.slug} não tem "renders" nem "carrossel" no post.md.`);
if (!existsSync(join(PASTA_PUBLIC, 'pecas', peca.slug)) && existsSync(join(peca.pasta, 'assets.json'))) {
  console.warn(`⚠ public/pecas/${peca.slug}/ não existe: rode antes npm run assets -- ${peca.slug}\n`);
}

const saida = join(PASTA_OUT, peca.slug);
mkdirSync(saida, { recursive: true });
let serveUrl = await empacotar();
/** O bundle copia o public/ na hora: depois de um copiar_para_public, empacota de novo. */
let reempacotar = false;
const inicio = Date.now();

for (const r of renders) {
  if (so && r.composicao !== so) continue;
  if (reempacotar) {
    serveUrl = await empacotar();
    reempacotar = false;
  }
  const composition = await selectComposition({ serveUrl, id: r.composicao });
  const ext = extname(r.arquivo).slice(1);
  const still = r.still ?? ['png', 'jpg', 'jpeg'].includes(ext);
  const escala = r.escala ?? (em4k && !still ? 2 : 1);
  const arquivo = em4k && !still ? r.arquivo.replace(/(\.\w+)$/, '-4k$1') : r.arquivo;
  const destino = join(saida, arquivo);
  console.log(`\n▶ ${r.composicao} → ${relative(RAIZ, destino)}`);

  if (still) {
    await renderStill({
      serveUrl,
      composition,
      frame: r.frame ?? 0,
      scale: escala,
      output: destino,
      imageFormat: ext === 'png' ? 'png' : 'jpeg',
      jpegQuality: 92,
    });
  } else {
    let ultimo = -1;
    await renderMedia({
      serveUrl,
      composition,
      scale: escala,
      codec: ext === 'gif' ? 'gif' : 'h264',
      crf: ext === 'gif' ? undefined : 16,
      pixelFormat: 'yuv420p',
      imageFormat: 'png',
      outputLocation: destino,
      onProgress: ({ progress }) => {
        const pct = Math.floor(progress * 10) * 10;
        if (pct !== ultimo) process.stdout.write(`${(ultimo = pct)}% `);
      },
    });
    console.log();
  }

  if (r.copiar_para_public) {
    const alvo = join(PASTA_PUBLIC, 'pecas', peca.slug, r.copiar_para_public);
    mkdirSync(dirname(alvo), { recursive: true });
    copyFileSync(destino, alvo);
    reempacotar = true;
    console.log(`  copiado para ${relative(RAIZ, alvo)}`);
  }
}

if (carrossel && !so) {
  if (reempacotar) serveUrl = await empacotar();
  console.log('\n▶ carrossel');
  await renderizarCarrossel(serveUrl, peca);
}

console.log(`\nPronto em ${((Date.now() - inicio) / 1000).toFixed(0)} s: ${relative(RAIZ, saida)}/`);
console.log(`Revisão rápida: npm run quadros -- ${peca.slug}   ·   Entregar: npm run entregar -- ${peca.slug}`);
