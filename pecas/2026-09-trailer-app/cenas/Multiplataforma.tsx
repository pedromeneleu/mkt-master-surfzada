import { AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

import { FundoClaro } from '@compartilhado/marca/Marca';
import { Celular, Navegador } from '../componentes/Molduras';
import { Digitacao, Sfx } from '@compartilhado/componentes/Sfx';
import { Tela } from '../componentes/Tela';
import { Titulo } from '@compartilhado/marca/Texto';
import type { Captura } from '../dados/tipos';
import { arquivo, bt, M } from '../tema';

/** Sequência de telas do celular, trocando com fade curto. */
export function TelasCelular({ telas, largura }: { telas: { cap: Captura; em: number }[]; largura: number }) {
  const frame = useCurrentFrame();
  const base = telas[0].cap;
  return (
    <div style={{ position: 'relative', width: largura, height: (largura * base.altura) / base.largura }}>
      {telas.map(({ cap, em }, i) => {
        const o = i === 0 ? 1 : interpolate(frame, [em, em + 4], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        if (o <= 0) return null;
        return <Img key={cap.arquivo} src={arquivo(cap.arquivo)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: o }} />;
      })}
    </div>
  );
}

const BUSCA = bt(4);

/** Web e celular: o navegador de lado e o celular com a busca, uma tecla por meia batida. */
export function Multiplataforma() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const m = M.mobile;
  const nav = spring({ frame, fps, config: { damping: 22, stiffness: 100 } });
  const cel = spring({ frame: frame - 12, fps, config: { damping: 16, stiffness: 110 } });

  return (
    <AbsoluteFill>
      <FundoClaro />
      <Sfx nome="whoosh" em={0} volume={0.45} />
      <Sfx nome="whoosh-grave" em={12} volume={0.5} />
      <Sfx nome="whoosh-curto" em={bt(2) - 2} volume={0.35} />
      <Sfx nome="clique" em={BUSCA - bt(0.5)} volume={0.6} />
      <Digitacao em={BUSCA} teclas={4} intervalo={bt(0.5)} volume={0.55} />

      <div style={{ position: 'absolute', top: 70, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <Titulo texto="Na web e no *celular*." em={4} tamanho={76} alinhar="center" />
      </div>

      <AbsoluteFill style={{ perspective: 2600 }}>
        <div
          style={{
            position: 'absolute',
            left: 120,
            top: 250,
            transform: `translateX(${(1 - nav) * -900}px) rotateY(${14 - frame * 0.02}deg)`,
            transformOrigin: '0% 50%',
          }}
        >
          <Navegador largura={1180}>
            <Tela cap={M.desktop['pico-com-check']} largura={1180} camera={[{ em: 0 }, { em: 20, alvo: M.desktop['pico-com-check'].caixas.check0, zoom: 1.12, dur: 140 }]} />
          </Navegador>
        </div>

        <div
          style={{
            position: 'absolute',
            left: 1320,
            top: 160,
            transform: `translateY(${(1 - cel) * 900}px) rotateY(${-10 + frame * 0.02}deg) rotateZ(${(1 - cel) * 8}deg)`,
          }}
        >
          <Celular largura={390}>
            <TelasCelular
              largura={390}
              telas={[
                { cap: m.inicio, em: 0 },
                { cap: m.pico, em: bt(2) },
                { cap: m['busca-0'], em: BUSCA - bt(0.5) },
                { cap: m['busca-1'], em: BUSCA },
                { cap: m['busca-2'], em: BUSCA + bt(0.5) },
                { cap: m['busca-3'], em: BUSCA + bt(1) },
                { cap: m['busca-4'], em: BUSCA + bt(1.5) + 2 },
              ]}
            />
          </Celular>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
