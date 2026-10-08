/**
 * Gera os dados de uma peça (previsão da API, faixas do Spotify...) rodando o
 * `dados.ts` do modelo dela (modelos/<modelo>/dados.ts) ou, se a peça for
 * própria, o `dados.ts` da pasta da peça. O resultado fica em pecas/<slug>/
 * (em geral dados.json) e vai para o git junto com a peça.
 *
 * Uso: npm run dados -- <peca> [argumentos do modelo]
 *      npm run dados -- previsao-semana --semana
 */
import { existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';

import { acharPeca, argumentos, falhar, PASTA_MODELOS, RAIZ, type Peca } from './lib/pecas';

export interface ContextoDados {
  slug: string;
  pasta: string;
  peca: Peca;
  /** O que veio depois do nome da peça na linha de comando. */
  args: { posicionais: string[]; flags: Record<string, string | true> };
}

// Só roda quando chamado pela linha de comando (os modelos importam o tipo daqui).
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { posicionais, flags } = argumentos();
  const peca = acharPeca(posicionais[0]);
  const script =
    peca.post.modelo === 'proprio' ? join(peca.pasta, 'dados.ts') : join(PASTA_MODELOS, peca.post.modelo, 'dados.ts');
  if (!existsSync(script)) {
    falhar(
      peca.post.modelo === 'proprio'
        ? `A peça ${peca.slug} não tem dados.ts (é própria; os dados são editados à mão).`
        : `O modelo ${peca.post.modelo} não gera dados (não tem dados.ts).`,
    );
  }
  console.log(`Dados de ${peca.slug} (${relative(RAIZ, script)})\n`);
  const { default: gerar } = (await import(pathToFileURL(script).href)) as { default: (c: ContextoDados) => Promise<void> };
  await gerar({ slug: peca.slug, pasta: peca.pasta, peca, args: { posicionais: posicionais.slice(1), flags } });
}
