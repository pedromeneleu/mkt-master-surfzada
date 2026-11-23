import { AbsoluteFill, Img, interpolate, useCurrentFrame } from 'remotion';

import { Logo } from '@compartilhado/marca/Marca';
import { Rotulo, Titulo } from '@compartilhado/marca/Texto';
import { AndySvg } from '@compartilhado/personagens/andy';
import { CHEGADA, COR, FONTE } from '@compartilhado/tema';

import { Credito, Entra, Foto, Paragrafo, Quadro, SetaArrasta, Slide } from './componentes';
import { FOTOS } from './fotos';
import { arquivo, MARGEM } from './tema';

const LARGURA_UTIL = 1080 - MARGEM * 2;

/** 1 · Capa: John John com a prancha em cima, o gancho embaixo. */
export function Capa() {
  const ALTURA_FOTO = 780;
  return (
    <AbsoluteFill style={{ fontFamily: FONTE, color: COR.superficie, background: COR.tinta }}>
      <Foto src={FOTOS.prancha.src} largura={1080} altura={ALTURA_FOTO} foco="50% 35%" zoom={0.04} />
      {/* Escurece o topo (rótulo) e funde a foto na tinta embaixo. */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(to bottom, rgba(10,10,10,0.82), rgba(10,10,10,0.35) 12%, transparent 24%),
            linear-gradient(to top, ${COR.tinta} ${((1350 - ALTURA_FOTO) / 1350) * 100}%, transparent ${((1350 - ALTURA_FOTO + 260) / 1350) * 100}%)`,
        }}
      />
      <div style={{ position: 'absolute', left: MARGEM, top: MARGEM - 8 }}>
        <Rotulo texto="WILD CARD · PIPELINE 2026" cor={COR.coral} tamanho={20} />
      </div>
      <div style={{ position: 'absolute', right: MARGEM, top: MARGEM - 14 }}>
        <Logo tamanho={28} em={-60} cor={COR.superficie} />
      </div>
      <Titulo
        texto={'O havaiano que\npode *decidir* o título\ndo Brasil'}
        em={6}
        tamanho={86}
        cor={COR.superficie}
        estilo={{ position: 'absolute', left: MARGEM, top: 870, width: LARGURA_UTIL }}
      />
      <div
        style={{
          position: 'absolute',
          left: MARGEM,
          right: MARGEM,
          bottom: MARGEM - 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: '0.16em', opacity: 0.7 }}>JOHN JOHN FLORENCE</div>
        <SetaArrasta />
      </div>
      <Credito texto={FOTOS.prancha.credito} baixo={620} />
    </AbsoluteFill>
  );
}

/** 2 · O pedido: só Pipeline, e a WSL decide até o fim de novembro. */
export function Pedido() {
  return (
    <Slide rotulo="O PEDIDO" pagina={2} credito={FOTOS.estudio.credito}>
      <Titulo
        texto={'Ele pediu wild card.\nNão pra temporada:\nsó pra *Pipeline*.'}
        em={4}
        tamanho={74}
        cor={COR.superficie}
        estilo={{ position: 'absolute', left: MARGEM, top: 150, width: LARGURA_UTIL }}
      />
      <Quadro
        src={FOTOS.estudio.src}
        largura={440}
        altura={587}
        esquerda="JOHN JOHN"
        direita="HAV"
        em={14}
        estilo={{ position: 'absolute', left: MARGEM, top: 500 }}
      />
      <div style={{ position: 'absolute', left: MARGEM + 440 + 48, top: 560, width: LARGURA_UTIL - 488 }}>
        <Entra em={24}>
          <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: '0.18em', color: COR.coral }}>TRICAMPEÃO MUNDIAL</div>
          <div style={{ marginTop: 10, fontSize: 40, fontWeight: 600, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
            2016 · 2017 · 2024
          </div>
        </Entra>
        <div style={{ margin: '34px 0', height: 2, background: 'rgba(255,255,255,0.18)' }} />
        <Paragrafo em={32} tamanho={32}>
          {'Pipeline fecha o Championship Tour 2026, em dezembro. *A WSL decide até o fim de novembro.*'}
        </Paragrafo>
      </div>
    </Slide>
  );
}

/** 3 · O quintal dele: cresceu de frente pra Pipeline. */
export function Quintal() {
  return (
    <Slide rotulo="O QUINTAL DELE" pagina={3} credito={FOTOS.praia.credito}>
      <Quadro
        src={FOTOS.praia.src}
        largura={LARGURA_UTIL}
        altura={560}
        em={2}
        foco="55% 45%"
        estilo={{ position: 'absolute', left: MARGEM, top: 150 }}
      />
      <Titulo
        texto={'Ele cresceu numa casa\nde frente pra Pipeline.'}
        em={14}
        tamanho={68}
        cor={COR.superficie}
        estilo={{ position: 'absolute', left: MARGEM, top: 790, width: LARGURA_UTIL }}
      />
      <Paragrafo em={26} tamanho={38} estilo={{ position: 'absolute', left: MARGEM, top: 985, width: LARGURA_UTIL }}>
        {'Pra ele, a onda mais perigosa do circuito é o *quintal de casa*. E local em Pipeline sempre dá medo.'}
      </Paragrafo>
    </Slide>
  );
}

const BRASILEIROS = ['Yago Dora', 'Gabriel Medina', 'Ítalo Ferreira', 'Miguel Pupo'];

/** 4 · A chave: os quatro brasileiros que ele pode pegar na 4ª rodada. */
export function Chave() {
  const frame = useCurrentFrame();
  const TOPO = 480;
  const ALTURA_CARD = 118;
  const VAO = 34;
  const LARGURA_CARD = 430;
  const meioCards = TOPO + (BRASILEIROS.length * ALTURA_CARD + (BRASILEIROS.length - 1) * VAO) / 2;
  const xLinha = MARGEM + LARGURA_CARD;
  const xJohn = 640;
  const ALTURA_JOHN = 300;
  const linhas = interpolate(frame, [30, 52], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: CHEGADA });
  return (
    <Slide rotulo="A CHAVE" pagina={4}>
      <Titulo
        texto={'Se entrar, pode cruzar\njá na *4ª rodada* com\num destes brasileiros:'}
        em={4}
        tamanho={64}
        cor={COR.superficie}
        estilo={{ position: 'absolute', left: MARGEM, top: 150, width: LARGURA_UTIL }}
      />
      <svg style={{ position: 'absolute', inset: 0 }} width={1080} height={1350}>
        {BRASILEIROS.map((_, i) => {
          const y = TOPO + i * (ALTURA_CARD + VAO) + ALTURA_CARD / 2;
          const meio = xLinha + (xJohn - xLinha) / 2;
          const d = `M${xLinha} ${y} H${meio} V${meioCards} H${xJohn}`;
          return (
            <path
              key={i}
              d={d}
              fill="none"
              stroke={COR.coral}
              strokeWidth={3}
              strokeOpacity={0.8}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - linhas}
            />
          );
        })}
      </svg>
      {BRASILEIROS.map((nome, i) => (
        <Entra key={nome} em={12 + i * 4} estilo={{ position: 'absolute', left: MARGEM, top: TOPO + i * (ALTURA_CARD + VAO) }}>
          <div
            style={{
              width: LARGURA_CARD,
              height: ALTURA_CARD,
              boxSizing: 'border-box',
              border: '2px solid rgba(255,255,255,0.85)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 28px',
              background: COR.tinta,
            }}
          >
            <span style={{ fontSize: 36, fontWeight: 600, letterSpacing: '-0.01em' }}>{nome}</span>
            <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '0.18em', opacity: 0.6 }}>BRA</span>
          </div>
        </Entra>
      ))}
      <Entra em={40} estilo={{ position: 'absolute', left: xJohn, top: meioCards - ALTURA_JOHN / 2 }}>
        <div
          style={{
            width: 1080 - MARGEM - xJohn,
            height: ALTURA_JOHN,
            boxSizing: 'border-box',
            background: COR.coral,
            color: COR.tinta,
            padding: 28,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Rosto tamanho={110} />
          <div>
            <div style={{ fontSize: 40, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.02em' }}>John John</div>
            <div style={{ marginTop: 10, fontSize: 15, fontWeight: 600, letterSpacing: '0.18em' }}>WILD CARD · HAV</div>
          </div>
        </div>
      </Entra>
      <Credito texto={FOTOS.estudio.credito} />
    </Slide>
  );
}

/** Rosto do John John recortado em círculo da foto do estúdio. */
function Rosto({ tamanho }: { tamanho: number }) {
  // Na foto do estúdio (387×516) o rosto fica por volta de x≈195, y≈150.
  const escala = (tamanho * 2.6) / 387;
  return (
    <div style={{ width: tamanho, height: tamanho, borderRadius: '50%', overflow: 'hidden', position: 'relative', border: `3px solid ${COR.tinta}` }}>
      <Img
        src={arquivo(FOTOS.estudio.src)}
        style={{
          position: 'absolute',
          width: 387 * escala,
          height: 516 * escala,
          left: tamanho / 2 - 195 * escala,
          top: tamanho / 2 - 150 * escala,
          filter: 'grayscale(1) contrast(1.15)',
        }}
      />
    </div>
  );
}

/** 5 · O que está em jogo: Medina × Yago. */
export function EmJogo() {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [18, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: CHEGADA });
  return (
    <Slide rotulo="O QUE ESTÁ EM JOGO" pagina={5}>
      <div style={{ position: 'absolute', left: MARGEM, top: 230, width: LARGURA_UTIL }}>
        <Titulo texto="Medina" em={4} tamanho={168} peso={700} cor={COR.superficie} />
        <div
          style={{
            fontSize: 120,
            fontWeight: 300,
            color: COR.coral,
            lineHeight: 1,
            margin: '6px 0 0 8px',
            opacity: x,
            transform: `rotate(${(1 - x) * -90}deg)`,
            transformOrigin: '36px 60px',
            display: 'inline-block',
          }}
        >
          ×
        </div>
        <Titulo texto="Yago" em={12} tamanho={168} peso={700} cor={COR.superficie} estilo={{ marginTop: 6 }} />
      </div>
      <Trofeu em={26} />
      <Paragrafo em={30} tamanho={42} estilo={{ position: 'absolute', left: MARGEM, top: 900, width: LARGURA_UTIL }}>
        {'Pipeline decide o título de 2026. *Uma bateria contra o John John pode tirar um deles da briga.*'}
      </Paragrafo>
    </Slide>
  );
}

function Trofeu({ em }: { em: number }) {
  return (
    <Entra em={em} estilo={{ position: 'absolute', right: MARGEM + 10, top: 440 }}>
      <svg width={220} height={260} viewBox="0 0 110 130" fill="none" stroke={COR.coral} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round">
        <path d="M28 10 H82 V40 C82 62 70 74 55 74 C40 74 28 62 28 40 Z" />
        <path d="M28 18 H10 C10 38 18 48 30 50 M82 18 H100 C100 38 92 48 80 50" />
        <path d="M55 74 V96 M38 120 H72 L68 96 H42 Z" />
      </svg>
    </Entra>
  );
}

/** 6 · A última chance? Ele não pediu vaga pra 2027. */
export function UltimaChance() {
  const frame = useCurrentFrame();
  const risco = interpolate(frame, [22, 38], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: CHEGADA });
  return (
    <Slide rotulo="A ÚLTIMA CHANCE?" pagina={6}>
      <div style={{ position: 'absolute', left: MARGEM - 10, top: 200, width: LARGURA_UTIL }}>
        <Entra em={2}>
          <div
            style={{
              fontSize: 330,
              fontWeight: 700,
              letterSpacing: '-0.05em',
              lineHeight: 1,
              color: 'transparent',
              WebkitTextStroke: '3px rgba(255,255,255,0.85)',
              position: 'relative',
              display: 'inline-block',
            }}
          >
            2027
            <span
              style={{
                position: 'absolute',
                left: -10,
                top: '52%',
                height: 16,
                width: `${risco * 104}%`,
                background: COR.coral,
                transform: 'rotate(-8deg)',
                transformOrigin: 'left center',
                borderRadius: 8,
              }}
            />
          </div>
        </Entra>
      </div>
      <Titulo
        texto={'Ele não pediu vaga\npra temporada 2027.'}
        em={10}
        tamanho={72}
        cor={COR.superficie}
        estilo={{ position: 'absolute', left: MARGEM, top: 640, width: LARGURA_UTIL }}
      />
      <Paragrafo em={30} tamanho={38} estilo={{ position: 'absolute', left: MARGEM, top: 855, width: LARGURA_UTIL }}>
        {'Sem o tour inteiro, fica praticamente fora da corrida olímpica de LA 2028. *Pipeline pode ser a única chance de ver o John John competir tão cedo.*'}
      </Paragrafo>
    </Slide>
  );
}

/** 7 · Chamada: a WSL deve aceitar? Comenta SIM ou NÃO. */
export function Chamada() {
  return (
    <Slide rotulo="E VOCÊ?" pagina={7}>
      <Titulo
        texto={'E aí: a WSL\ndeve *aceitar*?'}
        em={4}
        tamanho={100}
        cor={COR.superficie}
        estilo={{ position: 'absolute', left: MARGEM, top: 150, width: LARGURA_UTIL }}
      />
      <div style={{ position: 'absolute', left: MARGEM, top: 430, display: 'flex', gap: 22 }}>
        <Entra em={18}>
          <Pilula texto="SIM" cheia />
        </Entra>
        <Entra em={22}>
          <Pilula texto="NÃO" />
        </Entra>
      </div>
      <Paragrafo em={28} tamanho={38} estilo={{ position: 'absolute', left: MARGEM, top: 600, width: LARGURA_UTIL - 120 }}>
        {'*Comenta aqui embaixo.* E manda pro amigo que torce pro Medina (ou pro Yago).'}
      </Paragrafo>
      <Entra em={14} estilo={{ position: 'absolute', right: MARGEM - 40, bottom: 110 }}>
        <AndySvg largura={520} pose="pensando" expressao="deboche" />
      </Entra>
    </Slide>
  );
}

function Pilula({ texto, cheia = false }: { texto: string; cheia?: boolean }) {
  return (
    <div
      style={{
        padding: '18px 46px',
        borderRadius: 999,
        fontSize: 40,
        fontWeight: 700,
        letterSpacing: '0.04em',
        border: `3px solid ${cheia ? COR.coral : COR.superficie}`,
        background: cheia ? COR.coral : 'transparent',
        color: cheia ? COR.tinta : COR.superficie,
      }}
    >
      {texto}
    </div>
  );
}
