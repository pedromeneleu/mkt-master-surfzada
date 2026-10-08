/**
 * Exporta a referência da marca: a folha com as variações do logo e as cores
 * (marca-folha) e cada variação do logo em PNG transparente (marca-logo), para
 * usar fora do Remotion (site, apresentações, gráfica, Canva).
 *
 * Uso: npm run marca
 * Saída: out/marca/surfzada-marca-folha.png e out/marca/logos/surfzada-logo-<variante>-<cor>.png
 */
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { renderStill, selectComposition } from '@remotion/renderer';

import type { PropsArquivoLogo } from '../src/compartilhado/marca/estudo/ArquivoLogo';
import { PASTA_OUT } from './lib/pecas';
import { empacotar } from './lib/remotion';

const SAIDA = join(PASTA_OUT, 'marca');
const VARIANTES: PropsArquivoLogo['variante'][] = ['horizontal', 'vertical', 'simbolo', 'nome'];
const CORES: PropsArquivoLogo['cor'][] = ['tinta', 'branco'];

const serveUrl = await empacotar();
mkdirSync(join(SAIDA, 'logos'), { recursive: true });

const folha = await selectComposition({ serveUrl, id: 'marca-folha' });
await renderStill({ serveUrl, composition: folha, output: join(SAIDA, 'surfzada-marca-folha.png'), imageFormat: 'png' });
console.log('  surfzada-marca-folha.png');

for (const variante of VARIANTES) {
  for (const cor of CORES) {
    const inputProps: PropsArquivoLogo = { variante, cor };
    const composition = await selectComposition({ serveUrl, id: 'marca-logo', inputProps });
    const nome = `surfzada-logo-${variante}-${cor}.png`;
    await renderStill({ serveUrl, composition, inputProps, output: join(SAIDA, 'logos', nome), imageFormat: 'png' });
    console.log(`  logos/${nome}`);
  }
}
console.log(`Pronto: ${SAIDA}`);
