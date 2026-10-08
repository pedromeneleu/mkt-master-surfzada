/**
 * Cria uma peça nova a partir de um modelo (modelos/<modelo>/template/) ou do
 * esqueleto de peça própria (modelos/_peca-propria/template/), e registra a
 * peça em pecas/index.ts para ela aparecer no Studio.
 *
 * Nos arquivos do template, troca {{SLUG}}, {{NOME}}, {{TITULO}}, {{FORMATO}},
 * {{RESPONSAVEL}} e {{ID}} (prefixo dos ids de composição = o nome).
 *
 * Uso: npm run novo -- <nome-em-kebab-case> [--modelo=story-playlist] [--titulo="..."]
 *                     [--formato=story-9x16] [--mes=2026-11] [--responsavel=joao]
 *      npm run pecas -- --modelos     (lista os modelos)
 *
 * Ex.: npm run novo -- previsao-fds-17-out --modelo=story-previsao --titulo="Previsão até domingo (17/10)"
 */
import { cpSync, existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

import { argumentos, falhar, FORMATOS, PASTA_MODELOS, PASTA_PECAS, RAIZ } from './lib/pecas';

const { posicionais, flags } = argumentos();
const nome = posicionais[0];
if (!nome || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(nome)) {
  falhar('Diga o nome da peça em kebab-case, sem acento e sem a data. Ex.: npm run novo -- playlist-pororoca --modelo=story-playlist');
}

const modelo = typeof flags.modelo === 'string' ? flags.modelo : 'proprio';
const pastaTemplate = join(PASTA_MODELOS, modelo === 'proprio' ? '_peca-propria' : modelo, 'template');
if (!existsSync(pastaTemplate)) {
  const lista = readdirSync(PASTA_MODELOS).filter((m) => !m.startsWith('_') && existsSync(join(PASTA_MODELOS, m, 'template')));
  falhar(`Modelo "${modelo}" não existe. Modelos: proprio, ${lista.join(', ')}`);
}

const mes = typeof flags.mes === 'string' ? flags.mes : new Date().toISOString().slice(0, 7);
if (!/^\d{4}-\d{2}$/.test(mes)) falhar('--mes no formato AAAA-MM');
const slug = `${mes}-${nome}`;
const pasta = join(PASTA_PECAS, slug);
if (existsSync(pasta)) falhar(`Já existe ${relative(RAIZ, pasta)}`);

const formato = typeof flags.formato === 'string' ? flags.formato : null;
if (formato && !(FORMATOS as readonly string[]).includes(formato)) falhar(`--formato: ${FORMATOS.join(', ')}`);

const trocas: Record<string, string> = {
  SLUG: slug,
  NOME: nome,
  ID: nome,
  TITULO: typeof flags.titulo === 'string' ? flags.titulo : nome.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase()),
  RESPONSAVEL: typeof flags.responsavel === 'string' ? flags.responsavel : (process.env.MKT_RESPONSAVEL ?? 'null'),
};

cpSync(pastaTemplate, pasta, { recursive: true });
for (const arquivo of readdirSync(pasta, { recursive: true }) as string[]) {
  const caminho = join(pasta, arquivo);
  if (statSync(caminho).isDirectory() || !/\.(md|tsx?|json)$/.test(arquivo)) continue;
  let texto = readFileSync(caminho, 'utf8').replace(/\{\{(\w+)\}\}/g, (m, chave: string) => trocas[chave] ?? m);
  if (formato && arquivo === 'post.md') texto = texto.replace(/^formato: .*$/m, `formato: ${formato}`);
  writeFileSync(caminho, texto);
}

// Registro no Studio
if (existsSync(join(pasta, 'composicoes.tsx'))) {
  const indice = join(PASTA_PECAS, 'index.ts');
  const ident = 'p' + mes.replace('-', '') + nome.split('-').map((p) => p[0].toUpperCase() + p.slice(1)).join('');
  const registro = readFileSync(indice, 'utf8')
    .replace('// novo:imports', `import { Composicoes as ${ident} } from './${slug}/composicoes';\n// novo:imports`)
    .replace('  // novo:pecas', `  { slug: '${slug}', Composicoes: ${ident} },\n  // novo:pecas`);
  writeFileSync(indice, registro);
}

console.log(`✔ Criada ${relative(RAIZ, pasta)}/ (modelo: ${modelo})\n`);
for (const f of readdirSync(pasta, { recursive: true })) console.log(`  ${f}`);
console.log(`
Próximos passos (docs/02-criar-uma-peca.md):
  1. git switch -c peca/${slug}
  2. Preencha o briefing, o roteiro e a legenda em pecas/${slug}/post.md
  3. ${modelo === 'proprio' ? 'Escreva a peça em pecas/' + slug + '/ (comece por Peca.tsx)' : 'Veja modelos/' + modelo + '/README.md e ajuste composicoes.tsx'}
  4. npm run dados -- ${slug}    (se o modelo gera dados)
     npm run assets -- ${slug}   (copia assets/ e o que estiver no assets.json)
  5. npm run studio              → pasta ${slug}
  6. npm run render -- ${slug}  ·  npm run quadros -- ${slug}`);
