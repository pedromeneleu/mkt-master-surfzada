/**
 * Entrega uma peça aprovada: copia os renders de out/<slug>/ (sem quadros/ e
 * sem o master 2160/) para $MKT_DRIVE/entregas/<slug>/ e marca o post.md como
 * `aprovado` (se ainda estava antes disso). Depois de postar, atualize no
 * post.md: status: publicado, publicado_em e link.
 *
 * Uso: npm run entregar -- <peca>
 *      npm run entregar -- <peca> --com-master   (leva também carrossel/2160/)
 */
import { cpSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

import { acharPeca, argumentos, atualizarPost, falhar, PASTA_OUT, pastaDrive, STATUS } from './lib/pecas';

const { posicionais, flags } = argumentos();
const peca = acharPeca(posicionais[0]);
const origem = join(PASTA_OUT, peca.slug);
if (!existsSync(origem) || readdirSync(origem).length === 0) falhar(`Nada em out/${peca.slug}/. Rode antes: npm run render -- ${peca.slug}`);

const destino = join(pastaDrive(), 'entregas', peca.slug);
mkdirSync(destino, { recursive: true });
const pular = new Set(['quadros', ...(flags['com-master'] ? [] : ['2160'])]);
cpSync(origem, destino, {
  recursive: true,
  filter: (caminho) => !relative(origem, caminho).split(/[\\/]/).some((parte) => pular.has(parte)),
});
console.log(`Copiado para ${destino}`);
for (const f of readdirSync(destino, { recursive: true })) console.log(`  ${f}`);

if (STATUS.indexOf(peca.post.status) < STATUS.indexOf('aprovado')) {
  atualizarPost(peca.pasta, { status: 'aprovado' });
  console.log(`\npost.md: status ${peca.post.status} → aprovado (commite essa mudança).`);
}
console.log('\nDepois de postar: status: publicado, publicado_em: AAAA-MM-DD e link: <url do post> no post.md.');
