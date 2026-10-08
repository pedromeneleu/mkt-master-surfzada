import { Folder, Still } from 'remotion';

import { ArquivoLogo, metadadosArquivoLogo, type PropsArquivoLogo } from './ArquivoLogo';
import { FOLHA_MARCA, FolhaMarca } from './FolhaMarca';

const padrao: PropsArquivoLogo = { variante: 'horizontal', cor: 'tinta' };

/** Referência da marca (não é post): a folha com logos e cores, e cada logo em PNG transparente. */
export function EstudoMarca() {
  return (
    <Folder name="marca">
      <Still id="marca-folha" component={FolhaMarca} width={FOLHA_MARCA.largura} height={FOLHA_MARCA.altura} />
      <Still id="marca-logo" component={ArquivoLogo} width={2200} height={520} defaultProps={padrao} calculateMetadata={metadadosArquivoLogo} />
    </Folder>
  );
}
