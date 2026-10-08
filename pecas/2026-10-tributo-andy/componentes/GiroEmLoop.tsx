import { AbsoluteFill, Img, useCurrentFrame } from 'remotion';
import { arquivo } from '../tema';

/**
 * O giro da camisa em loop: public/giro/000.jpg…224.jpg (2160×2160), gerados
 * por scripts/preparar_giro.py: uma volta de 225 quadros, sem os quadros
 * repetidos da conversão 24 → 30 fps, com a ponte que fecha a volta e o selo
 * "AI" apagado.
 *
 * Ocupa o quadro inteiro, sem filtro: renderizado com scale 2, cada pixel do
 * JPG vira um pixel do vídeo (ver scripts/carrossel.ts).
 */
export const DURACAO_GIRO = 225;

/** A capa para o Instagram: 4 voltas = 900 quadros = 30 s, e o fim emenda no começo. */
export const VOLTAS_CAPA = 4;

const quadro = (n: number) => arquivo(`giro/${String(n).padStart(3, '0')}.jpg`);

export function GiroEmLoop() {
  const frame = useCurrentFrame() % DURACAO_GIRO;
  return (
    <AbsoluteFill>
      <Img src={quadro(frame)} style={{ width: '100%', height: '100%' }} />
    </AbsoluteFill>
  );
}
