/**
 * Exporta o Andy em PNG com fundo transparente, para usar fora do Remotion
 * (CapCut, Canva, stories, figurinhas). Tudo sai do mesmo rig de src/compartilhado/personagens/andy.
 *
 * Uso: npm run andy:sprites
 * Saída: out/andy/sprites/{vistas,expressoes,visemas,poses,corrida,nado,caminhada}/*.png
 */
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';

import { comAtalhos } from '../lib/webpack';
import type { PropsSprite } from '../../src/compartilhado/personagens/andy/estudo/SpriteAndy';
import { EXPRESSOES, POSES, VISEMAS } from '../../src/compartilhado/personagens/andy';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SAIDA = join(RAIZ, 'out', 'andy', 'sprites');

const pedidos: [string, string, PropsSprite][] = [
  ['vistas', 'frente', { vista: 'frente' }],
  ['vistas', 'perfil', { vista: 'perfil' }],
  ['vistas', 'costas', { vista: 'costas' }],
  ['vistas', 'nadando', { vista: 'nado' }],
  ...Object.keys(EXPRESSOES).map((e): [string, string, PropsSprite] => ['expressoes', e, { expressao: e as PropsSprite['expressao'] }]),
  ...Object.keys(VISEMAS).map((v): [string, string, PropsSprite] => ['visemas', v, { visema: v as PropsSprite['visema'], recorte: 'rosto' }]),
  ...Object.keys(POSES).map((p): [string, string, PropsSprite] => [
    'poses',
    p,
    { pose: p as PropsSprite['pose'], vista: p.endsWith('Perfil') ? 'perfil' : 'frente' },
  ]),
  ...Array.from({ length: 12 }, (_, q): [string, string, PropsSprite] => ['corrida', `corrida-${String(q).padStart(2, '0')}`, { ciclo: 'corrida', quadro: q, expressao: 'determinado' }]),
  ...Array.from({ length: 24 }, (_, q): [string, string, PropsSprite] => ['nado', `nado-${String(q).padStart(2, '0')}`, { ciclo: 'nado', quadro: q, expressao: 'determinado' }]),
  ...Array.from({ length: 18 }, (_, q): [string, string, PropsSprite] => ['caminhada', `caminhada-${String(q).padStart(2, '0')}`, { ciclo: 'caminhada', quadro: q }]),
];

const serveUrl = await bundle({ entryPoint: join(RAIZ, 'src', 'index.ts'), webpackOverride: comAtalhos });

for (const [pasta, nome, props] of pedidos) {
  mkdirSync(join(SAIDA, pasta), { recursive: true });
  const composition = await selectComposition({ serveUrl, id: 'andy-sprite', inputProps: { ...props } });
  const output = join(SAIDA, pasta, `${nome}.png`);
  await renderStill({ serveUrl, composition, inputProps: { ...props }, output, imageFormat: 'png' });
  console.log(`  ${pasta}/${nome}.png`);
}
console.log(`${pedidos.length} sprites em ${SAIDA}`);
