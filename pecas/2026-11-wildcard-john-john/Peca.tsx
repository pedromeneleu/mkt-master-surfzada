import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

import { FundoClaro, Logo } from '@compartilhado/marca/Marca';
import { Titulo } from '@compartilhado/marca/Texto';
import { CHEGADA, COR } from '@compartilhado/tema';
import { arquivosDaPeca } from '@compartilhado/util/arquivos';

export const SLUG = '2026-11-wildcard-john-john';
/** Arquivo em public/pecas/2026-11-wildcard-john-john/ (de assets/ ou do Drive, via `npm run assets`). */
export const arquivo = arquivosDaPeca(SLUG);

export const DURACAO = 150;

/** Ponto de partida: troque pelo roteiro do post.md. */
export function Peca() {
  const frame = useCurrentFrame();
  const logo = interpolate(frame, [90, 110], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: CHEGADA });
  return (
    <AbsoluteFill style={{ background: COR.fundo }}>
      <FundoClaro />
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Titulo texto="John John pede wild card para Pipeline" em={10} tamanho={84} alinhar="center" />
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 320, opacity: logo }}>
        <Logo tamanho={44} em={90} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
