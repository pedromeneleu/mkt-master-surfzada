import { AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

import { Aviso } from '../componentes/Aviso';
import { Destaque, Pulso } from '../componentes/Destaque';
import { FundoClaro } from '@compartilhado/marca/Marca';
import { Celular } from '../componentes/Molduras';
import { Sfx } from '@compartilhado/componentes/Sfx';
import { Tela } from '../componentes/Tela';
import { Contador, Rotulo, Titulo } from '@compartilhado/marca/Texto';
import { arquivo, bt, COR, FONTE, M } from '../tema';
import { pinos } from './Previsoes';
import { Confirmados } from './Sessoes';

const CORTE = bt(3);

/** Vertical — previsões no celular (2 compassos): mapa com os pinos → condições do pico, uma por batida. */
export function PrevisoesVertical() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const m = M.mobile;
  const c = M.condicoes;
  const sobe = spring({ frame, fps, config: { damping: 20, stiffness: 100 } });

  return (
    <AbsoluteFill>
      <FundoClaro />
      <Sfx nome="whoosh" em={0} volume={0.45} />
      <Sfx nome="pop" em={bt(1)} volume={0.35} />
      <Sfx nome="pop-agudo" em={bt(1.5)} volume={0.35} />
      <Sfx nome="whoosh-curto" em={CORTE - 2} volume={0.45} />

      <div style={{ position: 'absolute', top: 120, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        <Rotulo texto="PREVISÕES" em={2} tamanho={28} />
        <Titulo texto={'Como o mar\ntá *agora*.'} em={6} tamanho={104} alinhar="center" />
      </div>

      <div style={{ position: 'absolute', top: 440, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 44 }}>
        {[
          { v: c.alturaOnda, u: 'm', em: bt(4) },
          { v: c.periodo, u: 's', em: bt(5) },
          { v: c.vento, u: 'kn', em: bt(6) },
        ].map((x) => (
          <span key={x.u}>
            <Contador valor={x.v} sufixo={x.u} em={x.em} tamanho={78} />
            <Sfx nome="tick" em={x.em} volume={0.5} />
          </span>
        ))}
      </div>

      <div style={{ position: 'absolute', top: 580, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `translateY(${(1 - sobe) * 1200}px)` }}>
        <Celular largura={560}>
          {frame < CORTE ? (
            <Tela cap={m.previsoes} largura={560} camera={[{ em: 0 }, { em: bt(0.5), alvo: m.previsoes.caixas.mapa, zoom: 1.35, dur: 30 }]}>
              {pinos(m.previsoes.caixas)
                .slice(0, 10)
                .map((p, i) => (
                  <Pulso key={i} x={p.x + p.w / 2} y={p.y + p.h / 2} em={bt(1) + i * 3} tamanho={34} />
                ))}
            </Tela>
          ) : (
            <Tela cap={m.pico} largura={560}>
              <Destaque caixa={m.pico.caixas.condAltura} em={bt(4)} ate={bt(4.9)} />
              <Destaque caixa={m.pico.caixas.condSwell} em={bt(5)} ate={bt(5.9)} />
              <Destaque caixa={m.pico.caixas.condVento} em={bt(6)} ate={bt(8)} />
            </Tela>
          )}
        </Celular>
      </div>
    </AbsoluteFill>
  );
}

/** Confirmações a cada meia batida: no 9:16 a cena é curta e o ritmo, mais rápido. */
const AVISOS_V = [bt(3), bt(3.5), bt(4), bt(4.5), bt(5)];

/** Vertical — sessões: o cartão da sessão e a galera confirmando. */
export function SessoesVertical() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const r = M.recortes;
  const feed = M.desktop['inicio-sessao'].caixas;
  // Rodapé do cartão em coordenadas do próprio cartão.
  const rodape = { ...feed.rodape0, x: feed.rodape0.x - feed.item0.x, y: feed.rodape0.y - feed.item0.y };
  const largura = 960;
  // Só a parte esquerda do cartão (quem, onde, quando, confirmados), ampliada para ler no celular.
  const visivel = 640;
  const escala = largura / visivel;
  const cartao = spring({ frame: frame - 4, fps, config: { damping: 14, stiffness: 130 } });
  const seis = interpolate(frame, [AVISOS_V[4] + 8, AVISOS_V[4] + 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill>
      <FundoClaro />
      <Sfx nome="whoosh" em={0} volume={0.45} />
      <Sfx nome="pop" em={6} volume={0.5} />

      <div style={{ position: 'absolute', top: 140, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <Rotulo texto="SESSÕES" em={2} tamanho={28} />
        <Titulo texto="Marque a sessão." em={6} tamanho={96} alinhar="center" />
        <Titulo texto="Chame a *galera*." em={bt(2)} tamanho={96} alinhar="center" />
      </div>

      <div
        style={{
          position: 'absolute',
          left: (1080 - largura) / 2,
          top: 560,
          width: largura,
          height: r['cartao-sessao-1'].altura * escala,
          borderRadius: 22,
          overflow: 'hidden',
          boxShadow: '0 40px 90px -24px rgba(10,10,10,0.3)',
          maskImage: 'linear-gradient(to right, black 88%, transparent)',
          transform: `scale(${0.85 + 0.15 * cartao})`,
          opacity: cartao,
        }}
      >
        <div style={{ position: 'relative', width: r['cartao-sessao-1'].largura, height: r['cartao-sessao-1'].altura, transform: `scale(${escala})`, transformOrigin: '0 0' }}>
          <Img src={arquivo(r['cartao-sessao-1'].arquivo)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
          <Img src={arquivo(r['cartao-sessao-6'].arquivo)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: seis }} />
          <Confirmados caixa={rodape} ate={AVISOS_V[4] + 14} avisos={AVISOS_V} />
        </div>
      </div>

      <div style={{ position: 'absolute', top: 860, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
        {M.galera.slice(0, AVISOS_V.length).map((p, i) => (
          <Aviso key={p.nome} nome={p.nome} avatar={p.avatar} em={AVISOS_V[i]} escala={1.55} />
        ))}
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 90,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: FONTE,
          fontSize: 34,
          color: COR.suave,
          opacity: interpolate(frame, [bt(6), bt(6.6)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        }}
      >
        Ninguém mais surfa sozinho.
      </div>
    </AbsoluteFill>
  );
}
