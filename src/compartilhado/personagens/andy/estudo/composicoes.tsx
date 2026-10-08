import { Composition, Folder, Still } from 'remotion';

import { FPS } from '../../../tema';
import { DemoAndy, DURACAO_DEMO } from './DemoAndy';
import { FOLHA, FolhaAndy } from './FolhaAndy';
import { GIF_BAD_BOY, GifAndyBadBoy } from './GifAndyBadBoy';
import { SPRITE, SpriteAndy, type PropsSprite } from './SpriteAndy';

const spritePadrao: PropsSprite = { expressao: 'neutro' };

/**
 * Estudo do mascote Andy (não é post): demo, folha de referência, sprites em PNG
 * transparente e o GIF "bad boy". Ver design/mascote/README.md.
 */
export function EstudoAndy() {
  return (
    <Folder name="andy-estudo">
      <Composition id="andy-demo" component={DemoAndy} durationInFrames={DURACAO_DEMO} fps={FPS} width={1080} height={1920} />
      <Still id="andy-folha" component={FolhaAndy} width={FOLHA.largura} height={FOLHA.altura} />
      <Still id="andy-sprite" component={SpriteAndy} width={SPRITE.largura} height={Math.round(SPRITE.largura * 1.1)} defaultProps={spritePadrao} />
      <Composition
        id="andy-gif-bad-boy"
        component={GifAndyBadBoy}
        durationInFrames={GIF_BAD_BOY.duracao}
        fps={FPS}
        width={GIF_BAD_BOY.largura}
        height={GIF_BAD_BOY.altura}
      />
    </Folder>
  );
}
