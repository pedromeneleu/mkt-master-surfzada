import { PECAS } from '../pecas';
import { EstudoAndy } from './compartilhado/personagens/andy/estudo/composicoes';

/**
 * Todas as composições do Studio: uma pasta (<Folder>) por peça, na ordem de
 * pecas/index.ts, e o estudo do mascote Andy. Não registre composições aqui:
 * elas ficam em pecas/<slug>/composicoes.tsx (ver docs/02-criar-uma-peca.md).
 */
export function Root() {
  return (
    <>
      {PECAS.map(({ slug, Composicoes }) => (
        <Composicoes key={slug} />
      ))}
      <EstudoAndy />
    </>
  );
}
