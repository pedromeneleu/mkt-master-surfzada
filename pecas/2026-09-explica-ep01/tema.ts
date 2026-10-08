import { arquivosDaPeca } from '@compartilhado/util/arquivos';

/** Tema da marca (inclui as cores do mar e do Andy) + a pasta desta peça em public/. */
export * from '@compartilhado/tema';

export const SLUG = '2026-09-explica-ep01';
/** Arquivo em public/pecas/2026-09-explica-ep01/ (clipes reais em reais/, narração). */
export const arquivo = arquivosDaPeca(SLUG);
