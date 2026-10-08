/**
 * Confere o projeto antes de commitar (o `npm run checar` roda o tsc antes):
 *
 * - post.md e assets.json de todas as peças válidos (schema em scripts/lib/pecas.ts);
 * - slug do frontmatter igual ao nome da pasta;
 * - toda peça com composicoes.tsx registrada em pecas/index.ts;
 * - ids de composição citados no post.md existem e não se repetem entre peças;
 * - nenhum arquivo versionável acima de 2 MB (o que é pesado vai para o Drive);
 * - nenhum caminho absoluto de máquina (C:/Users/..., G:/O meu disco...) no código.
 *
 * Uso: npm run checar
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { lerAssets, lerPost, listarSlugs, PASTA_PECAS, RAIZ } from './lib/pecas';

const LIMITE_MB = 2;
const erros: string[] = [];
const avisos: string[] = [];

// ---------------------------------------------------------------- peças
const registro = readFileSync(join(PASTA_PECAS, 'index.ts'), 'utf8');
/** id de composição → slug da peça que o declara. */
const declarados = new Map<string, string>();
/** Peças com id montado por template (`meme-${fundo}`): esses não dá para conferir aqui. */
const comTemplate = new Set<string>();
const citados: [string, string][] = [];

for (const slug of listarSlugs()) {
  const pasta = join(PASTA_PECAS, slug);
  try {
    const { post } = lerPost(pasta);
    if (post.slug !== slug) erros.push(`${slug}/post.md: slug "${post.slug}" diferente do nome da pasta`);
    for (const r of post.renders) citados.push([slug, r.composicao]);
    for (const s of post.carrossel?.slides ?? []) citados.push([slug, s.composicao]);
  } catch (e) {
    erros.push((e as Error).message);
  }
  try {
    lerAssets(pasta);
  } catch (e) {
    erros.push((e as Error).message);
  }

  const arquivo = join(pasta, 'composicoes.tsx');
  if (!existsSync(arquivo)) continue;
  if (!registro.includes(`'./${slug}/composicoes'`)) erros.push(`${slug}: tem composicoes.tsx mas não está em pecas/index.ts`);
  const codigo = readFileSync(arquivo, 'utf8');
  if (/\bid=\{`/.test(codigo)) comTemplate.add(slug);
  // id="x" no JSX ou { id: 'x' } numa lista de slides
  for (const m of codigo.matchAll(/\bid(?:=|:\s*)["']([a-z0-9-]+)["']/g)) {
    const outro = declarados.get(m[1]);
    if (outro && outro !== slug) erros.push(`id de composição "${m[1]}" repetido em ${outro} e ${slug}`);
    declarados.set(m[1], slug);
  }
}

for (const [slug, id] of citados) {
  if (!existsSync(join(PASTA_PECAS, slug, 'composicoes.tsx'))) {
    erros.push(`${slug}/post.md cita "${id}", mas a peça não tem composicoes.tsx`);
  } else if (!declarados.has(id) && !comTemplate.has(slug)) {
    erros.push(`${slug}/post.md cita a composição "${id}", que não aparece em composicoes.tsx`);
  }
}

// ---------------------------------------------------------------- arquivos versionáveis
let arquivos: string[] = [];
try {
  arquivos = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], { cwd: RAIZ, encoding: 'utf8' })
    .split('\n')
    .filter(Boolean);
} catch {
  avisos.push('git indisponível: não conferi o tamanho dos arquivos');
}
const CAMINHO_DA_MAQUINA = /[A-Z]:[\\/](Users|O meu disco|My Drive)\b[^\s'"`)]*/;
for (const f of arquivos) {
  const caminho = join(RAIZ, f);
  if (!existsSync(caminho)) continue;
  const mb = statSync(caminho).size / 1e6;
  if (mb > LIMITE_MB) erros.push(`${f}: ${mb.toFixed(1)} MB (> ${LIMITE_MB} MB). Leve para o Drive e liste no assets.json`);
  if (/\.(tsx?|py|js|mjs)$/.test(f) && f !== 'scripts/checar.ts') {
    const m = readFileSync(caminho, 'utf8').match(CAMINHO_DA_MAQUINA);
    if (m) erros.push(`${f}: caminho da máquina "${m[0]}". Use MKT_DRIVE/MKT_TEMP (.env)`);
  }
}

// ---------------------------------------------------------------- resultado
for (const a of avisos) console.log(`⚠ ${a}`);
if (erros.length) {
  console.log(`✖ ${erros.length} problema(s):\n  ${erros.join('\n  ')}`);
  process.exit(1);
}
console.log(`✔ ${listarSlugs().length} peças, ${declarados.size} composições e ${arquivos.length} arquivos versionáveis conferidos.`);
