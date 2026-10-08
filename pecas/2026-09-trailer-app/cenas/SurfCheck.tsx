import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';

import { Cursor } from '../componentes/Cursor';
import { Destaque } from '../componentes/Destaque';
import { FundoClaro } from '@compartilhado/marca/Marca';
import { Navegador } from '../componentes/Molduras';
import { Digitacao, Sfx } from '@compartilhado/componentes/Sfx';
import { Revelar, Tela, centro } from '../componentes/Tela';
import { Rotulo, Titulo } from '@compartilhado/marca/Texto';
import type { Caixa } from '../dados/tipos';
import { COR, M, bt } from '../tema';

/** Slider + o rótulo acima dele ("Qualidade: 5/5"), que mudam juntos. */
const comRotulo = (c: Caixa): Caixa => ({ x: c.x - 4, y: c.y - 36, w: c.w + 8, h: c.h + 40 });

const CORTE = bt(8);

/** Surf check: o formulário se preenche (um clique por batida) e o check aparece no pico. */
export function SurfCheck() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const vazio = M.desktop['check-vazio'];
  const cheio = M.desktop.check;
  const depois = M.desktop['pico-com-check'];
  const k = cheio.caixas;
  const entra = spring({ frame, fps, config: { damping: 20, stiffness: 110 } });

  return (
    <AbsoluteFill>
      <FundoClaro />
      <Sfx nome="whoosh" em={0} volume={0.45} />
      <Sfx nome="tick" em={bt(3) + 2} volume={0.4} />
      <Sfx nome="tick" em={bt(4) + 2} volume={0.4} />
      <Sfx nome="tick" em={bt(5) + 2} volume={0.4} />
      <Digitacao em={bt(1) + 2} teclas={3} />
      <Digitacao em={bt(2) + 2} teclas={5} intervalo={2} />
      <Digitacao em={bt(6) + 2} teclas={7} intervalo={2} />
      <Sfx nome="whoosh-curto" em={CORTE - 2} volume={0.45} />
      <Sfx nome="pop-agudo" em={CORTE + 12} volume={0.5} />

      <div style={{ position: 'absolute', left: 90, top: 150, transform: `translateX(${(1 - entra) * -1000}px)` }}>
        <Navegador largura={1180}>
          {frame < CORTE ? (
            <Tela cap={vazio} largura={1180} camera={[{ em: 0, alvo: k.modal }]}>
              <Revelar cap={cheio} caixa={k.tamanho} em={bt(1) + 2} dur={8} />
              <Revelar cap={cheio} caixa={k.vento} em={bt(2) + 2} dur={10} />
              <Revelar cap={cheio} caixa={comRotulo(k.qualidade)} em={bt(3) + 2} dur={3} />
              <Revelar cap={cheio} caixa={comRotulo(k.crowd)} em={bt(4) + 2} dur={3} />
              <Revelar cap={cheio} caixa={comRotulo(k.nota)} em={bt(5) + 2} dur={3} />
              <Revelar cap={cheio} caixa={k.comentario} em={bt(6) + 2} dur={14} />
              <Cursor
                paradas={[
                  { em: 2, x: 1000, y: 720 },
                  { em: bt(1) - 14, ...centro(k.tamanho), dur: 14, clique: true },
                  { em: bt(2) - 14, ...centro(k.vento), dur: 14, clique: true },
                  { em: bt(3) - 12, x: k.qualidade.x + k.qualidade.w - 6, y: centro(k.qualidade).y, dur: 12, clique: true },
                  { em: bt(4) - 10, x: k.crowd.x + k.crowd.w * 0.25, y: centro(k.crowd).y, dur: 10, clique: true },
                  { em: bt(5) - 10, x: k.nota.x + k.nota.w - 6, y: centro(k.nota).y, dur: 10, clique: true },
                  { em: bt(6) - 12, ...centro(k.comentario), dur: 12, clique: true },
                  { em: bt(7) - 14, ...centro(k.publicar), dur: 14, clique: true },
                ]}
              />
            </Tela>
          ) : (
            <Tela
              cap={depois}
              largura={1180}
              camera={[
                { em: 0, alvo: depois.caixas.checks, zoom: 1.3 },
                { em: CORTE + 4, alvo: depois.caixas.check0, zoom: 2, dur: 30 },
              ]}
            >
              <Destaque caixa={depois.caixas.check0} em={CORTE + 12} raio={16} />
            </Tela>
          )}
        </Navegador>
      </div>

      <div style={{ position: 'absolute', left: 1330, top: 290, width: 560, display: 'flex', flexDirection: 'column', gap: 26 }}>
        <Rotulo texto="SURF CHECK" em={4} />
        <Titulo texto={'Quem tá na\nágua conta\ncomo *tá*.'} em={8} tamanho={72} />
        <Titulo texto="Tamanho, vento, crowd e nota em segundos." em={60} tamanho={28} peso={400} cor={COR.suave} intervalo={1} />
      </div>
    </AbsoluteFill>
  );
}
