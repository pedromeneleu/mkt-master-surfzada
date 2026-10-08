import { AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

import { Destaque } from '../componentes/Destaque';
import { FundoClaro, FundoEscuro, Logo } from '@compartilhado/marca/Marca';
import { Sfx } from '@compartilhado/componentes/Sfx';
import { Contador, Rotulo, Titulo } from '@compartilhado/marca/Texto';
import dados from '../dados/energia.json';
import type { Caixa, CapturaEnergia } from '../dados/tipos';
import type { PropsCena } from '../Trailer';
import { arquivo, bt, CHEGADA, COR, FONTE } from '../tema';

/**
 * Reel das features de energia (9:16, ~15 s): gancho com a física da
 * potência, o mapa de energia da Timeline Pico e o gráfico "Energia e
 * potência" — cada um com a leitura explicada, parte a parte — e a chamada
 * para o site.
 */

const E = dados as unknown as CapturaEnergia;

/** Largura em que as capturas do celular aparecem (a seção tem 358 px CSS). */
const LARGURA = 900;
const ESQUERDA = (1080 - LARGURA) / 2;
/** Onde começa a tela capturada, abaixo do rótulo e do título de 2 linhas. */
const TOPO_TELA = 470;

const escalar = (c: Caixa, k: number): Caixa => ({ x: c.x * k, y: c.y * k, w: c.w * k, h: c.h * k });

// ---------------------------------------------------------------------------
//  Leitura: a legenda que explica a parte destacada da tela
// ---------------------------------------------------------------------------

export interface ItemLeitura {
  em: number;
  ate: number;
  /** Frase curta; *palavra* sai em coral. */
  titulo: string;
  /** O que isso muda na prática. */
  sub: string;
}

/** Texto com *trechos* em coral (sem animação por palavra, para ler de uma vez). */
function ComDestaque({ texto }: { texto: string }) {
  return (
    <>
      {texto.split('*').map((parte, i) => (
        <span key={i} style={{ color: i % 2 ? COR.coral : undefined }}>
          {parte}
        </span>
      ))}
    </>
  );
}

/** Uma legenda por vez no mesmo lugar, trocando com um deslize curto. */
function Leitura({ itens, topo }: { itens: ItemLeitura[]; topo: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      {itens.map((it, i) => {
        const entra = spring({ frame: frame - it.em, fps, config: { damping: 18, stiffness: 160 } });
        const sai = interpolate(frame, [it.ate - 5, it.ate], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const o = Math.min(entra, sai);
        if (frame < it.em || o <= 0.01) return null;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: topo,
              left: 60,
              right: 60,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10,
              textAlign: 'center',
              fontFamily: FONTE,
              opacity: o,
              transform: `translateY(${(1 - entra) * 28}px)`,
            }}
          >
            <div style={{ fontSize: 56, fontWeight: 600, letterSpacing: '-0.02em', color: COR.tinta, lineHeight: 1.1 }}>
              <ComDestaque texto={it.titulo} />
            </div>
            <div style={{ fontSize: 36, fontWeight: 400, color: COR.suave, lineHeight: 1.25 }}>{it.sub}</div>
          </div>
        );
      })}
    </>
  );
}

// ---------------------------------------------------------------------------
//  Gancho: mesma altura, o dobro de força
// ---------------------------------------------------------------------------

/**
 * Ondulação senoidal com `ciclos` cristas na largura, correndo para a direita.
 * Em águas profundas a onda de período maior anda mais rápido — por isso a
 * `velocidade` vai junto com o período.
 */
function Ondulacao({
  largura,
  ciclos,
  velocidade,
  em,
  cor,
  espessura,
}: {
  largura: number;
  ciclos: number;
  velocidade: number;
  em: number;
  cor: string;
  espessura: number;
}) {
  const frame = useCurrentFrame();
  const desenho = interpolate(frame, [em, em + 24], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: CHEGADA });
  const amplitude = 52;
  const fase = (frame * velocidade) / largura;
  const pontos = Array.from({ length: 121 }, (_, i) => {
    const x = (i / 120) * largura;
    const y = -Math.sin(2 * Math.PI * (ciclos * (i / 120) - fase)) * amplitude;
    return `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg width={largura} height={amplitude * 2 + 20} viewBox={`0 ${-amplitude - 10} ${largura} ${amplitude * 2 + 20}`} style={{ overflow: 'visible' }}>
      {/* Guia da altura: as duas ondulações batem nas mesmas linhas. */}
      {[-amplitude, amplitude].map((y) => (
        <line key={y} x1={0} x2={largura} y1={y} y2={y} stroke="rgba(255,255,255,0.14)" strokeWidth={2} strokeDasharray="8 10" />
      ))}
      <path d={pontos} fill="none" stroke={cor} strokeWidth={espessura} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - desenho} />
    </svg>
  );
}

function LinhaOndulacao({
  topo,
  legenda,
  potencia,
  emValor,
  destaque,
  ciclos,
  velocidade,
}: {
  topo: number;
  legenda: string;
  potencia: string;
  emValor: number;
  destaque: boolean;
  ciclos: number;
  velocidade: number;
}) {
  const largura = 900;
  return (
    <div style={{ position: 'absolute', top: topo, left: (1080 - largura) / 2, width: largura }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
        <span style={{ fontFamily: FONTE, fontSize: 42, fontWeight: 500, color: 'rgba(255,255,255,0.72)' }}>{legenda}</span>
        <Contador valor={potencia} em={emValor} dur={18} sufixo="kW/m" tamanho={92} cor={destaque ? COR.coral : '#fff'} />
      </div>
      <Ondulacao
        largura={largura}
        ciclos={ciclos}
        velocidade={velocidade}
        em={destaque ? 6 : 0}
        cor={destaque ? COR.coral : 'rgba(255,255,255,0.85)'}
        espessura={destaque ? 9 : 6}
      />
    </div>
  );
}

/**
 * Gancho (4 batidas): duas ondulações de 1,5 m, uma de 8 s e outra de 16 s.
 * Mesma altura, o dobro de potência (P ≈ 0,49·H²·T). O selo "NOVO" já diz que
 * é lançamento; o riser termina junto com a cena, no impacto do mapa.
 */
export function GanchoForca({ duracao }: PropsCena) {
  const frame = useCurrentFrame();
  const formula = interpolate(frame, [bt(2.5), bt(3)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill>
      <FundoEscuro />
      <Sfx nome="onda" em={0} volume={0.5} />
      <Sfx nome="tick" em={16} volume={0.5} />
      <Sfx nome="whoosh-curto" em={bt(2) - 2} volume={0.4} />
      <Sfx nome="pop" em={bt(2) + 4} volume={0.5} />
      <Sfx nome="riser" em={duracao - 60} volume={0.55} />

      <div style={{ position: 'absolute', top: 200, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34 }}>
        <Rotulo texto="NOVO NA SURFZADA" em={0} tamanho={30} cor={COR.coral} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <Titulo texto="Mesmo tamanho." em={2} tamanho={118} cor="#fff" alinhar="center" />
          <Titulo texto="*Dobro* de força." em={bt(2)} tamanho={118} cor="#fff" alinhar="center" />
        </div>
      </div>

      <LinhaOndulacao topo={780} legenda="1,5 m · 8 s" potencia="9" emValor={16} destaque={false} ciclos={4} velocidade={7} />
      <LinhaOndulacao topo={1120} legenda="1,5 m · 16 s" potencia="18" emValor={bt(2) + 4} destaque ciclos={2} velocidade={14} />

      <div
        style={{
          position: 'absolute',
          top: 1450,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: FONTE,
          fontSize: 36,
          color: 'rgba(255,255,255,0.55)',
          opacity: formula,
        }}
      >
        potência ≈ 0,49 · altura² · período
      </div>
    </AbsoluteFill>
  );
}

// ---------------------------------------------------------------------------
//  Toque (celular): anel que abre e some, no lugar do cursor do desktop
// ---------------------------------------------------------------------------

function Toque({ x, y, em, tamanho = 110 }: { x: number; y: number; em: number; tamanho?: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame - em;
  if (t < -4 || t > 20) return null;
  const aperta = spring({ frame: t + 4, fps, config: { damping: 14, stiffness: 220 } });
  const anel = interpolate(t, [0, 18], [0.5, 1.5], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const some = interpolate(t, [8, 20], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: tamanho * anel,
          height: tamanho * anel,
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          border: `4px solid ${COR.coral}`,
          opacity: t < 0 ? 0 : some * 0.9,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: tamanho * 0.55,
          height: tamanho * 0.55,
          transform: `translate(-50%, -50%) scale(${aperta})`,
          borderRadius: '50%',
          background: 'rgba(255,122,89,0.35)',
          border: '3px solid rgba(255,255,255,0.9)',
          opacity: some,
        }}
      />
    </>
  );
}

/** Rótulo coral + título de 2 linhas no topo das cenas claras. */
function Cabecalho({ rotulo, titulo }: { rotulo: string; titulo: string }) {
  return (
    <div style={{ position: 'absolute', top: 150, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      <Rotulo texto={rotulo} em={2} tamanho={28} />
      <Titulo texto={titulo} em={4} tamanho={88} alinhar="center" />
    </div>
  );
}

// ---------------------------------------------------------------------------
//  Mapa de energia: toque em "Energia", a timeline correndo e a leitura
// ---------------------------------------------------------------------------

/** Primeiro e último quadro do time-lapse: o swell de sul entrando e batendo no pico. */
const QUADRO_INICIO = 8;
const QUADRO_FIM = 38;

/**
 * Mapa de energia — cai no impacto, depois do riser. Toque no chip "Energia"
 * e a Timeline Pico corre três dias: o campo passa do azul ao amarelo com o
 * swell chegando. Enquanto isso, a leitura: cor, setas e timeline, cada uma
 * destacada na tela. Os quadros trocam seco (flipbook): em crossfade, o
 * marcador da timeline e as setas ficariam dobrados.
 */
export function MapaEnergia({ duracao }: PropsCena) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = LARGURA / E.largura;
  const altura = E.altura * k;

  const TOQUE = 8;
  const TROCA = 12;
  const ultimo = E.quadros.length - 1;
  const fim = Math.min(QUADRO_FIM, ultimo);
  const posicao = interpolate(frame, [TROCA, duracao - 8], [QUADRO_INICIO, fim], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const indice = Math.round(posicao);
  const quadroMapa = frame < TROCA ? E.direcoes.arquivo : E.quadros[indice].arquivo;

  // Trocas de dia no trecho mostrado: um tick em cada uma.
  const trocasDeDia = E.quadros
    .map((q, i) => ({ i, dia: q.rotulo.split(',')[0] }))
    .filter(({ i, dia }, j, todos) => i > QUADRO_INICIO && i <= fim && dia !== todos[j - 1]?.dia)
    .map(({ i }) => Math.round(TROCA + ((i - QUADRO_INICIO) / (fim - QUADRO_INICIO)) * (duracao - 8 - TROCA)));

  const entra = spring({ frame, fps, config: { damping: 18, stiffness: 120 } });
  const flash = interpolate(frame, [0, 10], [0.9, 0], { extrapolateRight: 'clamp' });

  const { chipEnergia: chip, trilho, escala, mapa } = E.caixas;
  const dedo = interpolate(frame, [TROCA - 2, TROCA + 4, duracao - 6, duracao], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const dedoX = trilho.x + ((indice + 0.5) / (ultimo + 1)) * trilho.w;

  // A leitura, em três partes iguais depois do toque.
  const L1 = 22;
  const L2 = 62;
  const L3 = 100;
  const mar: Caixa = { x: mapa.x, y: escala.y + escala.h + 6, w: mapa.w, h: mapa.y + mapa.h - (escala.y + escala.h + 6) };
  const linhaTempo: Caixa = { x: 0, y: trilho.y, w: E.largura, h: trilho.h };
  const leitura: ItemLeitura[] = [
    { em: L1, ate: L2, titulo: '*Cor* = energia do mar', sub: 'azul é mar fraco · amarelo e vermelho, forte' },
    { em: L2, ate: L3, titulo: '*Setas* = rumo das ondas', sub: 'o amarelo avançando é o swell chegando' },
    { em: L3, ate: duracao + 1, titulo: '*Arraste* a timeline', sub: '7 dias pela frente, de 3 em 3 horas' },
  ];

  return (
    <AbsoluteFill>
      <FundoClaro />
      <Sfx nome="impacto" em={0} volume={0.6} />
      <Sfx nome="whoosh" em={0} volume={0.4} />
      <Sfx nome="clique" em={TOQUE} volume={0.6} />
      <Sfx nome="pop-agudo" em={TROCA} volume={0.4} />
      {[L1, L2, L3].map((f) => (
        <Sfx key={f} nome="whoosh-curto" em={f - 2} volume={0.3} />
      ))}
      {trocasDeDia.map((f) => (
        <Sfx key={f} nome="tick" em={f} volume={0.45} />
      ))}

      <Cabecalho rotulo="NOVO · MAPA DE ENERGIA" titulo={'Veja o swell\n*chegando*.'} />

      <div
        style={{
          position: 'absolute',
          left: ESQUERDA,
          top: TOPO_TELA,
          width: LARGURA,
          height: altura,
          overflow: 'hidden',
          borderRadius: 18,
          opacity: entra,
          transform: `translateY(${(1 - entra) * 120}px) scale(${0.94 + 0.06 * entra})`,
        }}
      >
        <Img src={arquivo(quadroMapa)} style={{ width: '100%', height: '100%', display: 'block' }} />
        <Destaque caixa={escalar(escala, k)} em={L1} ate={L2 - 6} escurecer={0.35} raio={22} folga={8} />
        <Destaque caixa={escalar(mar, k)} em={L2} ate={L3 - 6} escurecer={0.35} raio={22} folga={0} />
        <Destaque caixa={escalar(linhaTempo, k)} em={L3} ate={duracao - 4} escurecer={0.35} raio={22} folga={6} />
        <Toque x={(chip.x + chip.w / 2) * k} y={(chip.y + chip.h / 2) * k} em={TOQUE} />
        {dedo > 0 && (
          <div
            style={{
              position: 'absolute',
              left: dedoX * k,
              top: (trilho.y + trilho.h / 2) * k,
              width: 76,
              height: 76,
              transform: `translate(-50%, -50%) scale(${0.6 + 0.4 * dedo})`,
              borderRadius: '50%',
              background: 'rgba(10,10,10,0.16)',
              border: '3px solid rgba(255,255,255,0.95)',
              boxShadow: '0 6px 18px rgba(10,10,10,0.18)',
              opacity: dedo,
            }}
          />
        )}
      </div>

      <Leitura itens={leitura} topo={TOPO_TELA + altura + 36} />

      <AbsoluteFill style={{ background: '#fff', opacity: flash, pointerEvents: 'none' }} />
    </AbsoluteFill>
  );
}

// ---------------------------------------------------------------------------
//  Gráfico de energia e potência, com a leitura
// ---------------------------------------------------------------------------

/**
 * O gráfico "Energia e potência" se desenrola da esquerda para a direita (a
 * energia subindo até o máximo da semana). A leitura destaca as barras e a
 * média do pico; no fim, um toque na coluna do máximo abre o balão com a
 * potência e a divisão entre swell, vaga e outras ondas.
 */
export function GraficoEnergia({ duracao }: PropsCena) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = LARGURA / E.grafico.largura;
  const altura = E.grafico.altura * k;
  // O balão sobe acima do gráfico: o gráfico desce o bastante para ele não
  // encostar no título.
  const topo = TOPO_TELA + 20 - E.balao.y * k;

  const L1 = 14;
  const L2 = 56;
  const TOQUE = 92;
  const BALAO = TOQUE + 4;
  const { barras, media } = E.caixasGrafico;
  const leitura: ItemLeitura[] = [
    { em: L1, ate: L2, titulo: '*Barra* = energia do mar', sub: 'quanto mais alta, mais pesada a série' },
    { em: L2, ate: BALAO, titulo: '*Tracejado* = média do pico', sub: 'acima dela, o mar tá mais forte que o normal' },
    { em: BALAO, ate: duracao + 1, titulo: '*Potência* = força na bancada', sub: 'em kW/m · período longo empurra mais' },
  ];

  const entra = spring({ frame, fps, config: { damping: 18, stiffness: 120 } });
  const wipe = interpolate(frame, [4, 34], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: CHEGADA });
  const guia = interpolate(frame, [TOQUE, TOQUE + 5], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const balao = spring({ frame: frame - BALAO, fps, config: { damping: 15, stiffness: 170 } });
  const origem = `${((E.ponteiro.x - E.balao.x) / E.balao.largura) * 100}% ${((E.ponteiro.y - E.balao.y) / E.balao.altura) * 100}%`;
  const raio = 14 * k;

  return (
    <AbsoluteFill>
      <FundoClaro />
      <Sfx nome="whoosh-curto" em={0} volume={0.45} />
      <Sfx nome="whoosh-curto" em={L2 - 2} volume={0.3} />
      <Sfx nome="clique" em={TOQUE} volume={0.6} />
      <Sfx nome="pop" em={BALAO} volume={0.5} />

      <Cabecalho rotulo="NOVO · ENERGIA E POTÊNCIA" titulo={'Quanta *força*\nchega no pico.'} />

      <div
        style={{
          position: 'absolute',
          left: ESQUERDA,
          top: topo,
          width: LARGURA,
          height: altura,
          borderRadius: raio,
          overflow: 'hidden',
          boxShadow: '0 40px 90px -24px rgba(10,10,10,0.3)',
          opacity: entra,
          transform: `translateY(${(1 - entra) * 140}px)`,
        }}
      >
        <Img src={arquivo(E.grafico.arquivo)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', clipPath: `inset(0 ${(1 - wipe) * 100}% 0 0)` }} />
        <Img src={arquivo(E.graficoGuia.arquivo)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: guia }} />
        <Destaque caixa={escalar(barras, k)} em={L1 + 4} ate={L2 - 6} escurecer={0.3} raio={16} folga={6} />
        {media && <Destaque caixa={escalar(media, k)} em={L2} ate={TOQUE - 4} escurecer={0.3} raio={12} folga={4} />}
      </div>

      <div style={{ position: 'absolute', left: ESQUERDA, top: topo }}>
        <Toque x={E.ponteiro.x * k} y={E.ponteiro.y * k} em={TOQUE} />
      </div>

      {balao > 0.01 && (
        <div
          style={{
            position: 'absolute',
            left: ESQUERDA + E.balao.x * k,
            top: topo + E.balao.y * k,
            width: E.balao.largura * k,
            height: E.balao.altura * k,
            borderRadius: raio,
            overflow: 'hidden',
            boxShadow: '0 40px 90px -20px rgba(10,10,10,0.35)',
            transform: `scale(${0.6 + 0.4 * balao})`,
            transformOrigin: origem,
            opacity: Math.min(1, balao * 1.4),
          }}
        >
          <Img src={arquivo(E.balao.arquivo)} style={{ width: '100%', height: '100%', display: 'block' }} />
        </div>
      )}

      <Leitura itens={leitura} topo={topo + altura + 36} />
    </AbsoluteFill>
  );
}

// ---------------------------------------------------------------------------
//  Chamada para o site
// ---------------------------------------------------------------------------

/**
 * Fechamento: a marca, o que é novo e para onde ir. O endereço pulsa; "link
 * na bio" porque o link no texto do reel não é clicável.
 */
export function ChamadaSite() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const selo = spring({ frame: frame - 2, fps, config: { damping: 12, stiffness: 180 } });
  const EM_URL = bt(1.5);
  const url = spring({ frame: frame - EM_URL, fps, config: { damping: 12, stiffness: 150 } });
  const pulso = 1 + Math.max(0, Math.sin(((frame - EM_URL - 12) / 18) * Math.PI)) * 0.035 * (frame > EM_URL + 12 ? 1 : 0);
  const bio = interpolate(frame, [bt(2.5), bt(2.5) + 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const convite = interpolate(frame, [EM_URL - 6, EM_URL + 4], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill>
      <FundoClaro />
      <Sfx nome="whoosh-grave" em={0} volume={0.45} />
      <Sfx nome="pop-agudo" em={2} volume={0.45} />
      <Sfx nome="pop" em={EM_URL} volume={0.55} />
      <Sfx nome="brilho" em={EM_URL + 2} volume={0.4} />

      <div style={{ position: 'absolute', top: 290, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <Logo tamanho={96} em={0} />
      </div>

      <div style={{ position: 'absolute', top: 560, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34 }}>
        <div
          style={{
            padding: '12px 30px',
            borderRadius: 999,
            background: COR.coral,
            color: '#fff',
            fontFamily: FONTE,
            fontWeight: 700,
            fontSize: 34,
            letterSpacing: '0.14em',
            transform: `scale(${selo})`,
            opacity: selo,
          }}
        >
          NOVO
        </div>
        <Titulo texto={'Energia e potência\nem cada *pico*.'} em={6} tamanho={88} alinhar="center" />
      </div>

      <div style={{ position: 'absolute', top: 1000, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26, fontFamily: FONTE }}>
        <div style={{ fontSize: 42, color: COR.suave, opacity: convite }}>Veja o mar do seu pico em</div>
        <div
          style={{
            padding: '26px 56px',
            borderRadius: 999,
            background: COR.tinta,
            color: '#fff',
            fontWeight: 600,
            fontSize: 58,
            letterSpacing: '-0.01em',
            transform: `scale(${url * pulso})`,
            opacity: url,
            boxShadow: '0 30px 70px -20px rgba(10,10,10,0.4)',
          }}
        >
          surfzada.com.br
        </div>
        <div style={{ fontSize: 34, fontWeight: 600, color: COR.coralTexto, letterSpacing: '0.08em', opacity: bio }}>LINK NA BIO</div>
      </div>
    </AbsoluteFill>
  );
}
