import { AbsoluteFill, type CalculateMetadataFunction } from 'remotion';

import { COR } from '../../tema';
import { Logo, Simbolo, Wordmark } from '../Marca';
import { LogoVertical } from './FolhaMarca';

/**
 * Uma variação do logo sozinha, em PNG transparente, para usar fora do Remotion
 * (site, apresentações, gráfica). `npm run marca` gera todas em out/marca/.
 */
export type PropsArquivoLogo = {
  variante: 'horizontal' | 'vertical' | 'simbolo' | 'nome';
  /** Cor da onda e do nome: tinta (fundo claro) ou branco (fundo escuro). */
  cor: 'tinta' | 'branco';
};

const PRONTO = -100;

/** Tela de cada variação, com uma margem de respiro em volta do desenho. */
const TELAS: Record<PropsArquivoLogo['variante'], { width: number; height: number }> = {
  horizontal: { width: 2200, height: 520 },
  vertical: { width: 1300, height: 1100 },
  simbolo: { width: 1200, height: 720 },
  nome: { width: 1500, height: 420 },
};

export const metadadosArquivoLogo: CalculateMetadataFunction<PropsArquivoLogo> = ({ props }) => TELAS[props.variante];

export function ArquivoLogo({ variante, cor }: PropsArquivoLogo) {
  const c = cor === 'tinta' ? COR.tinta : '#fff';
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      {variante === 'horizontal' && <Logo tamanho={200} em={PRONTO} cor={c} />}
      {variante === 'vertical' && <LogoVertical largura={700} cor={c} />}
      {variante === 'simbolo' && <Simbolo largura={1000} em={PRONTO} cor={c} />}
      {variante === 'nome' && <Wordmark tamanho={260} cor={c} />}
    </AbsoluteFill>
  );
}
