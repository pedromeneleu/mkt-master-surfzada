import { AbsoluteFill } from 'remotion';

import { caminhada, corrida, AndySvg, nado, VISEMAS, type NomeExpressao, type NomePose, type NomeVisema, type Vista } from '..';

export interface PropsSprite {
  vista?: Vista;
  pose?: NomePose;
  expressao?: NomeExpressao;
  visema?: NomeVisema;
  ciclo?: 'corrida' | 'caminhada' | 'nado';
  quadro?: number;
  recorte?: 'inteiro' | 'rosto';
}

export const SPRITE = { largura: 600 };

/** Um quadro do Andy sobre fundo transparente, para exportar como PNG (npm run sprites). */
export function SpriteAndy({ vista, pose, expressao, visema, ciclo, quadro = 0, recorte = 'inteiro' }: PropsSprite) {
  const corpo = ciclo === 'corrida' ? corrida(quadro) : ciclo === 'caminhada' ? caminhada(quadro) : ciclo === 'nado' ? nado(quadro) : undefined;
  return (
    <AbsoluteFill style={{ backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center' }}>
      <AndySvg
        largura={SPRITE.largura}
        recorte={recorte}
        vista={ciclo === 'corrida' ? 'perfil' : ciclo === 'nado' ? 'nado' : vista}
        pose={pose}
        expressao={expressao}
        corpo={corpo}
        rosto={visema ? { boca: VISEMAS[visema] } : undefined}
      />
    </AbsoluteFill>
  );
}
