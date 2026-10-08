import { PECAS } from '../pecas';
import { EstudoMarca } from './compartilhado/marca/estudo/composicoes';
import { EstudoAndy } from './compartilhado/personagens/andy/estudo/composicoes';

/**
 * Todas as composições do Studio: uma pasta (<Folder>) por peça, na ordem de
 * pecas/index.ts, a referência da marca e o estudo do mascote Andy. Não registre composições aqui:
 * elas ficam em pecas/<slug>/composicoes.tsx (ver docs/02-criar-uma-peca.md).
 */
export function Root() {
  return (
    <>
      {PECAS.map(({ slug, Composicoes }) => (
        <Composicoes key={slug} />
      ))}
      <EstudoMarca />
      <EstudoAndy />
    </>
  );
}
