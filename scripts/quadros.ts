/**
 * Renderiza quadros soltos (PNG em meia resolução) para revisar sem gerar o
 * vídeo inteiro, e para anexar ao Merge Request. Empacota uma vez só.
 *
 * Sem frames: tira 4 quadros de cada composição da peça (começo, 1/3, 2/3 e o
 * último). Saída em out/<slug>/quadros/<composicao>-NNNN.png.
 *
 * Uso: npm run quadros -- <peca>
 *      npm run quadros -- <peca> <composicao> 60 330 600
 */
import { mkdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { renderStill, selectComposition } from '@remotion/renderer';

import { acharPeca, argumentos, falhar, PASTA_OUT, RAIZ } from './lib/pecas';
import { empacotar } from './lib/remotion';

const { posicionais } = argumentos();
const peca = acharPeca(posicionais[0]);
const [idPedido, ...frames] = posicionais.slice(1);

const ids = idPedido
  ? [idPedido]
  : [...new Set([...peca.post.renders.map((r) => r.composicao), ...(peca.post.carrossel?.slides.map((s) => s.composicao) ?? [])])];
if (ids.length === 0) falhar(`A peça ${peca.slug} não lista composições no post.md. Passe o id: npm run quadros -- ${peca.slug} <composicao> 0 90`);

const saida = join(PASTA_OUT, peca.slug, 'quadros');
mkdirSync(saida, { recursive: true });
const serveUrl = await empacotar();

for (const id of ids) {
  const composicao = await selectComposition({ serveUrl, id });
  const ultimo = composicao.durationInFrames - 1;
  const lista = frames.length ? frames.map(Number) : [...new Set([0, Math.floor(ultimo / 3), Math.floor((2 * ultimo) / 3), ultimo])];
  for (const frame of lista) {
    const arquivo = join(saida, `${id}-${String(frame).padStart(4, '0')}.png`);
    await renderStill({ serveUrl, composition: composicao, frame, output: arquivo, scale: 0.5 });
    console.log(`  ${relative(RAIZ, arquivo)}`);
  }
}
