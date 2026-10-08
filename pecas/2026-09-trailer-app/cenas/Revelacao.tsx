import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

import { FundoClaro, Logo } from '@compartilhado/marca/Marca';
import { Celular, Navegador } from '../componentes/Molduras';
import { Sfx } from '@compartilhado/componentes/Sfx';
import { Tela } from '../componentes/Tela';
import { Titulo } from '@compartilhado/marca/Texto';
import { CHEGADA, M, bt } from '../tema';

/**
 * Revelação — cai na virada da música (a banda entrando): impacto, logo e o
 * produto subindo em perspectiva. No vertical o aparelho é o celular.
 */
export function Revelacao() {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const vertical = height > width;

  const flash = interpolate(frame, [0, 10], [1, 0], { extrapolateRight: 'clamp' });
  const sobe = spring({ frame: frame - bt(2), fps, config: { damping: 22, stiffness: 90, mass: 1.1 } });
  const logoY = interpolate(frame, [bt(2), bt(2) + 22], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: CHEGADA });
  // Depois de subir, o aparelho segue "flutuando" devagar.
  const deriva = frame * 0.12;

  const topoLogo = vertical ? height * 0.1 : height * 0.075;
  const centroLogo = height / 2 - 70;

  return (
    <AbsoluteFill>
      <FundoClaro />
      {/* A banda já bate forte aqui: o impacto só reforça o grave. */}
      <Sfx nome="impacto" em={0} volume={0.65} />
      <Sfx nome="whoosh-grave" em={bt(2) - 4} volume={0.5} />

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: centroLogo + (topoLogo - centroLogo) * logoY,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 18,
          transform: `scale(${1 - logoY * 0.4})`,
          transformOrigin: '50% 0',
        }}
      >
        <Logo tamanho={vertical ? 120 : 132} em={2} />
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, top: vertical ? height * 0.19 : height * 0.2, display: 'flex', justifyContent: 'center' }}>
        <Titulo texto={vertical ? 'Feito pra *comunidade*\ndo surf.' : 'Feito pra *comunidade* do surf.'} em={bt(3)} tamanho={vertical ? 84 : 76} alinhar="center" />
      </div>

      <AbsoluteFill style={{ perspective: 2200, alignItems: 'center' }}>
        <div
          style={{
            position: 'absolute',
            top: vertical ? height * 0.37 : height * 0.36,
            transform: `translateY(${(1 - sobe) * height * 0.8 - deriva}px) rotateX(${8 + (1 - sobe) * 30}deg) rotateZ(${(1 - sobe) * -4}deg)`,
            transformOrigin: '50% 0',
          }}
        >
          {vertical ? (
            <Celular largura={620}>
              <Tela cap={M.mobile.inicio} largura={620} />
            </Celular>
          ) : (
            <Navegador largura={1480}>
              <Tela cap={M.desktop.inicio} largura={1480} camera={[{ em: 0 }, { em: bt(4), alvo: M.desktop.inicio.caixas.perto, zoom: 1.12, dur: bt(4) }]} />
            </Navegador>
          )}
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ background: '#fff', opacity: flash }} />
    </AbsoluteFill>
  );
}
