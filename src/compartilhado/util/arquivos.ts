import { staticFile } from 'remotion';

/**
 * Caminhos de arquivos em public/. Nunca use `staticFile` direto numa peça:
 * cada peça tem a sua pasta em public/pecas/<slug>/, montada por `npm run assets`.
 *
 *   const arquivo = arquivosDaPeca('2026-10-playlist-teahupoo');
 *   <Img src={arquivo('capa.jpg')} />   // public/pecas/2026-10-playlist-teahupoo/capa.jpg
 */
export function arquivosDaPeca(slug: string) {
  return (caminho: string) => staticFile(`pecas/${slug}/${caminho}`);
}

/** Efeito sonoro gerado por `npm run sfx` (public/compartilhado/sfx/<nome>.wav). */
export const arquivoSfx = (nome: string) => staticFile(`compartilhado/sfx/${nome}.wav`);
