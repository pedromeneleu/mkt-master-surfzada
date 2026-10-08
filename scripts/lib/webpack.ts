import { resolve } from 'node:path';
import type { WebpackOverrideFn } from '@remotion/bundler';

/**
 * Atalhos de import, iguais aos do tsconfig.json (`paths`):
 *   @compartilhado/...  → src/compartilhado/...
 *   @modelos/...        → modelos/...
 * Usado pelo remotion.config.ts (Studio/CLI) e pelos scripts que chamam bundle().
 * Os caminhos partem da raiz do projeto (o npm run sempre roda dali).
 */
export const comAtalhos: WebpackOverrideFn = (config) => ({
  ...config,
  resolve: {
    ...config.resolve,
    alias: {
      ...(config.resolve?.alias as Record<string, string> | undefined),
      '@compartilhado': resolve(process.cwd(), 'src', 'compartilhado'),
      '@modelos': resolve(process.cwd(), 'modelos'),
    },
  },
});
