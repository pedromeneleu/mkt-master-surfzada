/**
 * Renderiza só os slides do carrossel de uma peça (campo `carrossel` no post.md),
 * numerados, em out/<slug>/carrossel/. O `npm run render` já faz isto no fim;
 * este comando serve para revisar rápido ou refazer alguns slides.
 *
 * Uso: npm run carrossel -- <peca>
 *      npm run carrossel -- <peca> --png         (só os PNGs, revisão rápida)
 *      npm run carrossel -- <peca> capa kauai    (só os slides cujo id contém esses trechos)
 */
import { relative } from 'node:path';

import { renderizarCarrossel } from './lib/carrossel';
import { acharPeca, argumentos, RAIZ } from './lib/pecas';
import { empacotar } from './lib/remotion';

const { posicionais, flags } = argumentos();
const peca = acharPeca(posicionais[0]);
const serveUrl = await empacotar();
const saida = await renderizarCarrossel(serveUrl, peca, { soPng: Boolean(flags.png), ids: posicionais.slice(1) });
console.log(`\nPronto: ${relative(RAIZ, saida)}/`);
