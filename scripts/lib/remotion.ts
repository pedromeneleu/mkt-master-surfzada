/**
 * Empacotamento e render com o Remotion a partir dos scripts (sem o CLI):
 * um bundle por execução, com os atalhos @compartilhado/@modelos, e a pasta
 * temporária em MKT_TEMP (o render deixa sobras grandes; ver docs/01-setup.md).
 */
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { bundle } from '@remotion/bundler';

import { RAIZ } from './pecas';
import { comAtalhos } from './webpack';

/** Aponta TEMP/TMP para MKT_TEMP, se configurado. Chame antes de renderizar. */
export function usarTempDoProjeto(): void {
  const temp = process.env.MKT_TEMP;
  if (!temp) return;
  mkdirSync(temp, { recursive: true });
  process.env.TEMP = temp;
  process.env.TMP = temp;
  process.env.TMPDIR = temp;
}

export async function empacotar(): Promise<string> {
  usarTempDoProjeto();
  process.stdout.write('Empacotando o projeto... ');
  const serveUrl = await bundle({ entryPoint: join(RAIZ, 'src', 'index.ts'), webpackOverride: comAtalhos, publicDir: join(RAIZ, 'public') });
  console.log('ok');
  return serveUrl;
}
