import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

import { Aviso } from '../componentes/Aviso';
import { Cursor } from '../componentes/Cursor';
import { Destaque } from '../componentes/Destaque';
import { FundoClaro } from '@compartilhado/marca/Marca';
import { Navegador } from '../componentes/Molduras';
import { Digitacao, Sfx } from '@compartilhado/componentes/Sfx';
import { Camada, Revelar, Tela, centro } from '../componentes/Tela';
import { Rotulo, Titulo } from '@compartilhado/marca/Texto';
import type { Caixa } from '../dados/tipos';
import { COR, FONTE, M, bt } from '../tema';

const CORTE = bt(5);
/** Uma confirmação por batida, a partir do 2º compasso e meio. */
export const AVISOS = [bt(6), bt(7), bt(8), bt(9), bt(10)];

/**
 * Tampa o "1 confirmados" do cartão e conta junto com as notificações.
 * Termina igual à captura real com 6 confirmados, que entra por baixo.
 */
export function Confirmados({ caixa, ate, avisos = AVISOS }: { caixa: Caixa; ate: number; avisos?: number[] }) {
  const frame = useCurrentFrame();
  const chegaram = avisos.filter((a) => frame >= a).length;
  const ultimo = avisos.filter((a) => frame >= a).pop();
  const pulo = ultimo === undefined ? 0 : Math.max(0, 1 - (frame - ultimo) / 8);
  const some = interpolate(frame, [ate, ate + 1], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div
      style={{
        position: 'absolute',
        left: caixa.x - 2,
        top: caixa.y - 2,
        width: caixa.w,
        height: caixa.h + 4,
        background: COR.superficie,
        display: 'flex',
        alignItems: 'center',
        fontFamily: FONTE,
        fontSize: caixa.h * 0.72,
        color: COR.suave,
        opacity: some,
      }}
    >
      <span
        style={{
          display: 'inline-block',
          transform: `scale(${1 + pulo * 0.35})`,
          transformOrigin: '0 50%',
          color: pulo > 0 ? COR.coralTexto : undefined,
          fontWeight: pulo > 0 ? 600 : 400,
          marginRight: `${0.28 + pulo * 0.4}em`,
        }}
      >
        {1 + chegaram}
      </span>
      confirmados
    </div>
  );
}

/** Sessões: marcar a sessão e ver a galera confirmando no ritmo. */
export function Sessoes() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const vazio = M.desktop['sessao-vazio'];
  const cheio = M.desktop.sessao;
  const feed = M.desktop['inicio-sessao'];
  const feed6 = M.desktop['inicio-sessao-6'];
  const k = cheio.caixas;
  const entra = spring({ frame, fps, config: { damping: 20, stiffness: 110 } });

  return (
    <AbsoluteFill>
      <FundoClaro />
      <Sfx nome="whoosh" em={0} volume={0.45} />
      <Digitacao em={bt(1) + 2} teclas={4} intervalo={2} />
      <Digitacao em={bt(2) + 2} teclas={8} intervalo={2} />
      <Sfx nome="whoosh-curto" em={CORTE - 2} volume={0.45} />
      <Sfx nome="pop" em={CORTE + 8} volume={0.4} />

      <div style={{ position: 'absolute', left: 110, top: 130, width: 580, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Rotulo texto="SESSÕES" em={4} />
        <Titulo texto="Marque a sessão." em={8} tamanho={62} />
        <Titulo texto="Chame a *galera*." em={CORTE + 10} tamanho={62} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 26 }}>
          {M.galera.slice(0, AVISOS.length).map((p, i) => (
            <Aviso key={p.nome} nome={p.nome} avatar={p.avatar} em={AVISOS[i]} escala={0.98} />
          ))}
        </div>
      </div>

      <div style={{ position: 'absolute', left: 720, top: 160, transform: `translateX(${(1 - entra) * 1000}px)` }}>
        <Navegador largura={1150}>
          {frame < CORTE ? (
            <Tela cap={vazio} largura={1150} camera={[{ em: 0, alvo: k.modal }]}>
              <Revelar cap={cheio} caixa={k.dataHora} em={bt(1) + 2} dur={8} />
              {/* Com a data preenchida, o botão "Criar sessão" habilita. */}
              <Revelar cap={cheio} caixa={k.criar} em={bt(1) + 10} dur={4} />
              <Revelar cap={cheio} caixa={k.observacao} em={bt(2) + 2} dur={16} />
              <Cursor
                paradas={[
                  { em: 2, x: 1000, y: 760 },
                  { em: bt(1) - 12, ...centro(k.dataHora, -80), dur: 12, clique: true },
                  { em: bt(2) - 12, ...centro(k.observacao), dur: 12, clique: true },
                  { em: bt(4) - 16, ...centro(k.criar), dur: 16, clique: true },
                ]}
              />
            </Tela>
          ) : (
            <Tela
              cap={feed}
              largura={1150}
              camera={[
                { em: 0, alvo: feed.caixas.item0, zoom: 1.15 },
                { em: CORTE + 4, alvo: feed.caixas.item0, zoom: 1.35, dur: 30 },
              ]}
            >
              <Camada cap={feed6} em={AVISOS[4] + 12} />
              <Confirmados caixa={feed.caixas.rodape0} ate={AVISOS[4] + 18} />
              <Destaque caixa={feed.caixas.item0} em={CORTE + 8} raio={16} escurecer={0.35} />
            </Tela>
          )}
        </Navegador>
      </div>
    </AbsoluteFill>
  );
}
