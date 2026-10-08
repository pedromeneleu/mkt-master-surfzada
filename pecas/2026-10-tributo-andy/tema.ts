import { arquivosDaPeca } from '@compartilhado/util/arquivos';

/** Tema da marca + o formato do carrossel. */
export * from '@compartilhado/tema';

export const SLUG = '2026-10-tributo-andy';
/** Arquivo em public/pecas/2026-10-tributo-andy/ (giro, fotos, arte, retícula). */
export const arquivo = arquivosDaPeca(SLUG);

/** Carrossel do Instagram em 1:1: todos os slides no mesmo formato. */
export const LARGURA = 1080;
export const ALTURA = 1080;
