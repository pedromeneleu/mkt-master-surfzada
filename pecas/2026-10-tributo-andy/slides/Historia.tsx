import { AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

import { Simbolo, Wordmark } from '@compartilhado/marca/Marca';
import { Credito, FotoPB, MARGEM, Quadro, QuadroFoto, Slide, Texto } from '../componentes/Slide';
import { FOTOS } from '../fotos';
import { Contador, Titulo } from '@compartilhado/marca/Texto';
import { arquivo, CHEGADA, COR, SUAVE } from '../tema';

/** Duração de cada slide da história: as entradas acabam em ~2 s, o resto é leitura. */
export const DURACAO_SLIDE = 150;

const LARGURA_UTIL = 1080 - 2 * MARGEM;
const BRANCO = COR.superficie;

/** 2 · O auge: Andy beijando o troféu de 2002, os três títulos e os números da carreira. */
export function Auge() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const anos = ['2002', '2003', '2004'];
  const foto = (
    <AbsoluteFill>
      <FotoPB src={FOTOS.trofeu2002.src} largura={1080} altura={470} foco="50% 32%" />
      <AbsoluteFill style={{ height: 470, background: `linear-gradient(to bottom, rgba(10,10,10,0.75) 0%, transparent 28%, transparent 55%, ${COR.tinta} 100%)` }} />
    </AbsoluteFill>
  );
  return (
    <Slide rotulo="O AUGE" pagina={2} fundo={foto} credito={FOTOS.trofeu2002.credito}>
      <div style={{ position: 'absolute', left: MARGEM, top: 420 }}>
        <Titulo texto="Três títulos mundiais. *Seguidos.*" tamanho={58} cor={BRANCO} em={4} />
      </div>
      <div style={{ position: 'absolute', left: MARGEM, right: MARGEM, top: 540, display: 'flex', justifyContent: 'space-between' }}>
        {anos.map((ano, i) => {
          const p = spring({ frame: frame - 18 - i * 9, fps, config: { damping: 14, stiffness: 150 } });
          return (
            <div key={ano} style={{ width: 290, opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - p) * 40}px)` }}>
              <div style={{ height: 6, width: 290 * p, background: COR.coral, borderRadius: 3, marginBottom: 18 }} />
              <div style={{ fontSize: 112, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{ano}</div>
              <div style={{ marginTop: 8, fontSize: 17, fontWeight: 600, letterSpacing: '0.18em', opacity: 0.6 }}>CAMPEÃO MUNDIAL</div>
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: MARGEM, right: MARGEM, top: 790, display: 'flex', gap: 72 }}>
        {[
          { valor: '4', sufixo: '×', rotulo: 'Pipe Masters' },
          { valor: '4', sufixo: '×', rotulo: 'Triple Crown' },
          { valor: '20', sufixo: '', rotulo: 'vitórias no circuito' },
        ].map((n, i) => (
          <div key={n.rotulo}>
            <Contador valor={n.valor} sufixo={n.sufixo} em={48 + i * 8} dur={22} tamanho={68} cor={BRANCO} />
            <Texto em={52 + i * 8} tamanho={22} estilo={{ marginTop: 0 }}>
              {n.rotulo}
            </Texto>
          </div>
        ))}
      </div>
    </Slide>
  );
}

/** 3 · Kauai: de onde ele veio. */
export function Kauai() {
  return (
    <Slide rotulo="ORIGEM" pagina={3}>
      <div style={{ position: 'absolute', left: MARGEM, top: 140 }}>
        <Titulo texto={'Tudo começou\nem *Kauai*.'} tamanho={80} cor={BRANCO} em={4} />
      </div>
      <Quadro
        src="reticula/kauai.png"
        esquerda="HANALEI, KAUAI"
        direita="22°12'N  159°30'W"
        em={18}
        largura={LARGURA_UTIL}
        altura={400}
        estilo={{ position: 'absolute', left: MARGEM, top: 370 }}
      />
      <div style={{ position: 'absolute', left: MARGEM, right: MARGEM, top: 842 }}>
        <Texto em={34}>{'Nasceu em *1978*, no Havaí. Aprendeu a surfar com o irmão *Bruce*, nas bancadas rasas da ilha.'}</Texto>
      </div>
    </Slide>
  );
}

/** 4 · Andy × Kelly: os nomes, a história e o Kelly erguendo o braço do Andy em Pipe, 2003. */
export function Rivalidade() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const andy = spring({ frame: frame - 6, fps, config: { damping: 16, stiffness: 120 } });
  const kelly = spring({ frame: frame - 14, fps, config: { damping: 16, stiffness: 120 } });
  const x = spring({ frame: frame - 22, fps, config: { damping: 10, stiffness: 180 } });
  const nome = { fontSize: 140, fontWeight: 700, letterSpacing: '-0.05em', lineHeight: 0.92 };
  const foto = (
    <AbsoluteFill style={{ top: 520, height: 560 }}>
      <FotoPB src={FOTOS.podioPipe2003.src} largura={1080} altura={560} foco="62% 18%" />
      <AbsoluteFill style={{ background: `linear-gradient(to bottom, ${COR.tinta} 0%, transparent 26%, transparent 55%, ${COR.tinta} 92%)` }} />
    </AbsoluteFill>
  );
  return (
    <Slide rotulo="A RIVALIDADE" pagina={4} fundo={foto} credito={FOTOS.podioPipe2003.credito}>
      <div style={{ position: 'absolute', left: MARGEM, top: 140 }}>
        <div style={{ ...nome, transform: `translateX(${(1 - andy) * -80}px)`, opacity: andy }}>Andy</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, marginTop: 6 }}>
          <span style={{ fontSize: 96, fontWeight: 300, color: COR.coral, transform: `scale(${x}) rotate(${(1 - x) * 90}deg)`, display: 'inline-block' }}>×</span>
          <span style={{ ...nome, color: 'transparent', WebkitTextStroke: `3px ${BRANCO}`, transform: `translateX(${(1 - kelly) * 80}px)`, opacity: kelly }}>
            Kelly
          </span>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 560, right: MARGEM, top: 150 }}>
        <Texto em={30} tamanho={26}>
          {'Muita gente chama de a maior rivalidade da história do surf. Em 2003, a briga pelo título foi até *Pipeline*, a última etapa do ano.'}
        </Texto>
        <Texto em={42} tamanho={44} estilo={{ marginTop: 20, color: BRANCO, fontWeight: 600, letterSpacing: '-0.02em' }}>
          Deu Andy.
        </Texto>
      </div>
    </Slide>
  );
}

/** 5 · Do jeito dele: a comemoração "espingarda" em Teahupo'o, 2006, ocupando o slide. */
export function JeitoDele() {
  const frame = useCurrentFrame();
  const entra = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp', easing: CHEGADA });
  const fundo = (
    <AbsoluteFill style={{ opacity: entra }}>
      <FotoPB src={FOTOS.claimTeahupoo2006.src} largura={1080} altura={1080} foco="78% 45%" zoom={0.05} />
      <AbsoluteFill
        style={{
          background: `linear-gradient(to right, ${COR.tinta} 0%, rgba(10,10,10,0.85) 38%, transparent 66%), linear-gradient(to bottom, rgba(10,10,10,0.6) 0%, transparent 20%, transparent 80%, ${COR.tinta} 100%)`,
        }}
      />
    </AbsoluteFill>
  );
  return (
    <Slide rotulo="DO JEITO DELE" pagina={5} fundo={fundo} credito={FOTOS.claimTeahupoo2006.credito}>
      <div style={{ position: 'absolute', left: MARGEM, top: 140 }}>
        <Titulo texto={'Irreverente.\n*Corajoso.*\nDo jeito dele.'} tamanho={84} cor={BRANCO} em={4} intervalo={5} />
      </div>
      <div style={{ position: 'absolute', left: MARGEM, width: 500, top: 480 }}>
        <Texto em={36} tamanho={27}>
          {'Encarava as ondas mais pesadas do planeta sem pedir licença, competia com o coração na mão e nunca fingiu ser quem não era.'}
        </Texto>
        <Texto em={50} tamanho={36} estilo={{ marginTop: 26, color: BRANCO, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
          {'Por isso ele é o nosso ídolo.'}
        </Texto>
      </div>
    </Slide>
  );
}

/** 6 · Na água e fora dela: quatro fotos nos quadros das costas da camisa. */
const QUADROS = [
  { foto: FOTOS.tuboPipe2003, esquerda: 'Nº01', direita: 'PIPELINE · 2003', foco: '55% 50%', ampliar: 1 },
  { foto: FOTOS.paz, esquerda: 'Nº02', direita: 'MENTAWAI · 2004', foco: '52% 62%', ampliar: 1 },
  { foto: FOTOS.presidente, esquerda: 'Nº03', direita: 'PRESIDENTE · 2004', foco: '50% 26%', ampliar: 1.18 },
  { foto: FOTOS.tuboTeahupoo, esquerda: 'Nº04', direita: "TEAHUPO'O", foco: '62% 55%', ampliar: 1 },
];

export function NaAgua() {
  const largura = (LARGURA_UTIL - 28) / 2;
  return (
    <Slide rotulo="NA ÁGUA E FORA DELA" pagina={6}>
      <div style={{ position: 'absolute', left: MARGEM, top: 140 }}>
        <Titulo texto="O Andy em *quatro quadros*." tamanho={58} cor={BRANCO} em={4} />
      </div>
      <div style={{ position: 'absolute', left: MARGEM, top: 250, width: LARGURA_UTIL, display: 'flex', flexWrap: 'wrap', gap: '30px 28px' }}>
        {QUADROS.map((q, i) => (
          <QuadroFoto
            key={q.esquerda}
            src={q.foto.src}
            esquerda={q.esquerda}
            direita={q.direita}
            credito={q.foto.credito}
            em={12 + i * 8}
            largura={largura}
            altura={250}
            foco={q.foco}
            ampliar={q.ampliar}
          />
        ))}
      </div>
    </Slide>
  );
}

/**
 * 7 · Rising Sun: o sol das costas da camisa se acende raio a raio (máscara
 * cônica a partir do centro do círculo, da esquerda para a direita).
 */
export function RisingSun() {
  const frame = useCurrentFrame();
  const raios = interpolate(frame, [18, 84], [0, 180], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: SUAVE });
  const circulo = interpolate(frame, [10, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  // sol.png: 1471×1170; o círculo tem centro em (735, 730) e raio 485; os raios começam em 520.
  const largura = 740;
  const k = largura / 1471;
  const cx = 735 * k;
  const cy = 730 * k;
  const mascaraRaios = `conic-gradient(from 270deg at ${cx}px ${cy}px, black ${raios}deg, transparent ${raios}deg)`;
  const mascaraCirculo = `radial-gradient(circle at ${cx}px ${cy}px, black ${500 * k}px, transparent ${502 * k}px)`;
  return (
    <Slide rotulo="O SOL NASCENTE" pagina={7}>
      <div style={{ position: 'absolute', left: MARGEM, top: 140 }}>
        <Titulo texto="Rising *Sun*." tamanho={92} cor={BRANCO} em={4} />
      </div>
      <div style={{ position: 'absolute', left: MARGEM, right: MARGEM, top: 262 }}>
        <Texto em={16} tamanho={28}>
          {'Na Billabong, a linha assinatura do Andy eram as bermudas *Rising Sun*, com os raios do sol subindo pela perna. Até hoje a molecada de Pipe usa. É daí que vem o sol da nossa camisa.'}
        </Texto>
      </div>
      <div style={{ position: 'absolute', left: (1080 - largura) / 2, top: 452, width: largura, height: 1170 * k }}>
        <Img src={arquivo('arte/sol.png')} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', maskImage: mascaraRaios, WebkitMaskImage: mascaraRaios }} />
        <Img
          src={arquivo('arte/sol.png')}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: circulo, maskImage: mascaraCirculo, WebkitMaskImage: mascaraCirculo }}
        />
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, transparent 66%, ${COR.tinta} 88%)` }} />
      </div>
    </Slide>
  );
}

/**
 * 8 · Teahupo'o, 2010: a última vitória. A bandeira do Havaí no jet ski foi,
 * segundo o Brian Bielmann, a última foto que ele fez do Andy.
 */
export function Teahupoo() {
  return (
    <Slide rotulo="TEAHUPO'O, 2010" pagina={8}>
      <div style={{ position: 'absolute', left: MARGEM, top: 140 }}>
        <Titulo texto="A última *vitória*." tamanho={80} cor={BRANCO} em={4} />
      </div>
      <QuadroFoto
        src={FOTOS.bandeira2010.src}
        esquerda="TEAHUPO'O, TAITI"
        direita="SETEMBRO DE 2010"
        credito={FOTOS.bandeira2010.credito.replace('Foto: ', '')}
        em={14}
        largura={LARGURA_UTIL}
        altura={420}
        foco="55% 30%"
        estilo={{ position: 'absolute', left: MARGEM, top: 262 }}
      />
      <div style={{ position: 'absolute', left: MARGEM, right: MARGEM, top: 770 }}>
        <Texto em={32}>
          {'Em setembro de 2010, ele venceu em Teahupo\'o. Dois meses depois, em *2 de novembro*, o Andy se foi, aos 32 anos. Em dezembro nasceu o filho, *Axel*.'}
        </Texto>
      </div>
    </Slide>
  );
}

/** 9 · O que fica: a fundação e o CVV. */
export function OQueFica() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cartao = spring({ frame: frame - 40, fps, config: { damping: 200 } });
  return (
    <Slide rotulo="O QUE FICA" pagina={9}>
      <div style={{ position: 'absolute', left: MARGEM, top: 140 }}>
        <Titulo texto={'Falar sobre isso\ntambém é *homenagem*.'} tamanho={76} cor={BRANCO} em={4} />
      </div>
      <div style={{ position: 'absolute', left: MARGEM, right: MARGEM, top: 362 }}>
        <Texto em={24}>
          {'Hoje a *Andy Irons Foundation* apoia jovens que enfrentam dependência química e questões de saúde mental.'}
        </Texto>
      </div>
      <div
        style={{
          position: 'absolute',
          left: MARGEM,
          right: MARGEM,
          top: 600,
          padding: '40px 44px',
          borderRadius: 24,
          background: COR.tinta2,
          borderLeft: `6px solid ${COR.coral}`,
          opacity: cartao,
          transform: `translateY(${(1 - cartao) * 30}px)`,
        }}
      >
        <div style={{ fontSize: 34, fontWeight: 600, letterSpacing: '-0.01em' }}>Se a barra pesar, fala com alguém.</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 22, marginTop: 18 }}>
          <span style={{ fontSize: 22, fontWeight: 600, letterSpacing: '0.18em', color: COR.coral }}>CVV</span>
          <span style={{ fontSize: 96, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1 }}>188</span>
        </div>
        <div style={{ marginTop: 12, fontSize: 22, color: 'rgba(255,255,255,0.6)' }}>Ligação gratuita, 24 horas · cvv.org.br</div>
      </div>
    </Slide>
  );
}

/**
 * 10 · A camisa: a arte das costas com quatro chamadas. Coordenadas das
 * chamadas em costas.png (1500×2000).
 */
const CHAMADAS = [
  { x: 1240, y: 360, titulo: 'Os raios', texto: 'o Rising Sun do Andy' },
  { x: 1120, y: 760, titulo: 'A onda em retícula', texto: 'uma foto de Saquarema' },
  { x: 1380, y: 1090, titulo: 'Don’t waste your time', texto: 'o mar não espera ninguém' },
  { x: 1000, y: 1640, titulo: 'Acervo Nº 001', texto: 'a primeira peça da surfzada' },
];

export function ACamisa() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const arte = spring({ frame: frame - 8, fps, config: { damping: 200 } });
  // A arte ocupa 470 px de largura; o recorte corta o vazio de baixo.
  const k = 470 / 1500;
  const ax = MARGEM - 40;
  const ay = 290;
  const colunaTexto = 610;
  return (
    <Slide rotulo="A CAMISA" pagina={10}>
      <div style={{ position: 'absolute', left: MARGEM, top: 140 }}>
        <Titulo texto="Por que essa *camisa*." tamanho={76} cor={BRANCO} em={4} />
      </div>
      <Img
        src={arquivo('arte/costas.png')}
        style={{ position: 'absolute', left: ax, top: ay, width: 1500 * k, height: 2000 * k, opacity: arte, transform: `translateY(${(1 - arte) * 20}px)` }}
      />
      <svg width={1080} height={1080} style={{ position: 'absolute', inset: 0 }}>
        {CHAMADAS.map((c, i) => {
          const p = interpolate(frame, [28 + i * 10, 44 + i * 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: CHEGADA });
          const x0 = ax + c.x * k;
          const y0 = ay + c.y * k;
          const y1 = 330 + i * 150;
          const x1 = colunaTexto - 24;
          return (
            <g key={i} opacity={p > 0 ? 1 : 0}>
              <circle cx={x0} cy={y0} r={7 * p} fill={COR.coral} />
              <path d={`M${x0} ${y0} L${x0 + (x1 - x0) * 0.35} ${y1} L${x1} ${y1}`} fill="none" stroke={COR.coral} strokeWidth={2} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
            </g>
          );
        })}
      </svg>
      {CHAMADAS.map((c, i) => (
        <div key={i} style={{ position: 'absolute', left: colunaTexto, right: MARGEM, top: 330 + i * 150 - 22 }}>
          <Texto em={36 + i * 10} tamanho={30} estilo={{ color: BRANCO, fontWeight: 600, lineHeight: 1.2 }}>
            {c.titulo}
          </Texto>
          <Texto em={40 + i * 10} tamanho={24} estilo={{ marginTop: 4 }}>
            {c.texto}
          </Texto>
        </div>
      ))}
    </Slide>
  );
}

/** 11 · Fechamento: o Andy carregado na areia em Pipe, a dedicatória, o logo e a chamada. */
export function Fechamento() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fim = spring({ frame: frame - 46, fps, config: { damping: 200 } });
  const centro = { position: 'absolute' as const, left: 0, right: 0, display: 'flex', justifyContent: 'center' };
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(60% 55% at 50% 112%, rgba(255,122,89,0.22), transparent 70%), ${COR.tinta}`,
        color: BRANCO,
        textAlign: 'center',
      }}
    >
      <AbsoluteFill>
        <FotoPB src={FOTOS.carregadoPipe.src} largura={1080} altura={500} foco="50% 16%" />
        <AbsoluteFill style={{ height: 500, background: `linear-gradient(to bottom, transparent 45%, ${COR.tinta} 100%)` }} />
      </AbsoluteFill>
      <Credito texto={FOTOS.carregadoPipe.credito} />
      <div style={{ ...centro, top: 470 }}>
        <Texto em={2} tamanho={22} estilo={{ letterSpacing: '0.2em', fontWeight: 600, color: COR.coral }}>
          ANDY IRONS · 1978 — 2010
        </Texto>
      </div>
      <div style={{ ...centro, top: 530, alignItems: 'center', gap: 22 }}>
        <Simbolo largura={150} em={14} cor={BRANCO} />
        <div style={{ opacity: fim }}>
          <Wordmark tamanho={56} cor={BRANCO} />
        </div>
      </div>
      <div style={{ ...centro, top: 690 }}>
        <Titulo texto="Don’t waste your *time*." tamanho={64} cor={BRANCO} em={36} alinhar="center" />
      </div>
      <div style={{ ...centro, top: 790 }}>
        <Texto em={54} tamanho={22} estilo={{ letterSpacing: '0.18em', fontWeight: 600 }}>
          TSHIRT-01 · ACERVO Nº 001 · LINK NA BIO
        </Texto>
      </div>
      <div style={{ position: 'absolute', left: MARGEM, right: MARGEM, bottom: 40, opacity: fim * 0.55, fontSize: 15, lineHeight: 1.5 }}>
        Homenagem independente, sem vínculo com a Billabong ou com a família Irons.
        <br />
        Fotos do Andy: créditos em cada slide. Hanalei: Bryce Edwards (CC BY 2.0), em retícula.
      </div>
    </AbsoluteFill>
  );
}
