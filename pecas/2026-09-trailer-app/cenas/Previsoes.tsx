import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';

import { Cursor } from '../componentes/Cursor';
import { Destaque, Pulso } from '../componentes/Destaque';
import { FundoClaro } from '@compartilhado/marca/Marca';
import { Navegador } from '../componentes/Molduras';
import { Sfx } from '@compartilhado/componentes/Sfx';
import { Tela, centro } from '../componentes/Tela';
import { Contador, Rotulo, Titulo } from '@compartilhado/marca/Texto';
import type { Caixa } from '../dados/tipos';
import { COR, FONTE, M, bt } from '../tema';

export const pinos = (caixas: Record<string, Caixa>) =>
  Object.entries(caixas)
    .filter(([k]) => k.startsWith('pino'))
    .map(([, c]) => c)
    .sort((a, b) => a.x - b.x);

/** Uma métrica grande contando, com legenda — a coluna de dados ao lado da UI. */
export function Metrica({ valor, unidade, legenda, em, tamanho = 76 }: { valor: string; unidade: string; legenda: string; em: number; tamanho?: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - em, fps, config: { damping: 200 } });
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 18, opacity: s, transform: `translateY(${(1 - s) * 30}px)` }}>
      <div style={{ minWidth: tamanho * 2.7 }}>
        <Contador valor={valor} em={em} sufixo={unidade} tamanho={tamanho} />
      </div>
      <span style={{ fontFamily: FONTE, fontSize: tamanho * 0.34, color: COR.suave }}>{legenda}</span>
      <Sfx nome="tick" em={em} volume={0.5} />
    </div>
  );
}

const CORTE = bt(6);

/** Previsões: mapa com os picos → clique → condições de agora (uma por compasso de meia). */
export function Previsoes() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const prev = M.desktop.previsoes;
  const pico = M.desktop.pico;
  const entra = spring({ frame, fps, config: { damping: 20, stiffness: 110 } });
  const c = M.condicoes;
  const alvoCartao = { ...prev.caixas.cartaoFuturo, h: 40 };

  return (
    <AbsoluteFill>
      <FundoClaro />
      <Sfx nome="whoosh" em={0} volume={0.45} />
      <Sfx nome="whoosh-curto" em={CORTE - 2} volume={0.5} />

      <div style={{ position: 'absolute', left: 110, top: 250, width: 560, display: 'flex', flexDirection: 'column', gap: 26 }}>
        <Rotulo texto="PREVISÕES" em={4} />
        <Titulo texto={'Como o mar\ntá *agora*.'} em={8} tamanho={84} />
        <Titulo texto="Pico a pico, com previsão de verdade." em={bt(6.5)} tamanho={30} peso={400} cor={COR.suave} intervalo={1} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 30 }}>
          <Metrica valor={c.alturaOnda} unidade="m" legenda="ondas" em={bt(8)} />
          <Metrica valor={c.periodo} unidade="s" legenda="período" em={bt(10)} />
          <Metrica valor={c.vento} unidade="kn" legenda="vento" em={bt(12)} />
        </div>
      </div>

      <div style={{ position: 'absolute', left: 720, top: 160, transform: `translateX(${(1 - entra) * 1000}px)` }}>
        <Navegador largura={1150}>
          {frame < CORTE ? (
            <Tela
              cap={prev}
              largura={1150}
              camera={[
                { em: 0 },
                { em: bt(1), alvo: prev.caixas.mapa, zoom: 1.5, dur: 32 },
                { em: bt(4), alvo: alvoCartao, zoom: 1.45, dur: 26 },
              ]}
            >
              {pinos(prev.caixas)
                .slice(0, 10)
                .map((p, i) => (
                  <Pulso key={i} x={p.x + p.w / 2} y={p.y + p.h / 2} em={bt(2) + i * 3} tamanho={40} />
                ))}
              <Cursor
                paradas={[
                  { em: bt(3), x: 1250, y: 760 },
                  { em: bt(4.5), ...centro(alvoCartao, -60, -4), dur: bt(1), clique: true },
                ]}
              />
            </Tela>
          ) : (
            <Tela
              cap={pico}
              largura={1150}
              camera={[
                { em: 0, alvo: pico.caixas.titulo, zoom: 1.7 },
                { em: CORTE + 4, alvo: pico.caixas.condicoes, zoom: 1.35, dur: 28 },
              ]}
            >
              <Destaque caixa={pico.caixas.condAltura} em={bt(8)} ate={bt(9.75)} />
              <Destaque caixa={pico.caixas.condSwell} em={bt(10)} ate={bt(11.75)} />
              <Destaque caixa={pico.caixas.condVento} em={bt(12)} ate={bt(15)} />
            </Tela>
          )}
        </Navegador>
      </div>
      <Sfx nome="pop" em={bt(2)} volume={0.35} />
      <Sfx nome="pop-agudo" em={bt(2.5)} volume={0.35} />
      <Sfx nome="pop" em={bt(3)} volume={0.35} />
    </AbsoluteFill>
  );
}
