import type { ReactNode } from 'react';
import { AbsoluteFill, Img } from 'remotion';

import { FundoClaro, FundoEscuro, Logo } from '@compartilhado/marca/Marca';
import { Rotulo, Titulo } from '@compartilhado/marca/Texto';
import { COR, FONTE } from '@compartilhado/tema';
import { arquivosDaPeca } from '@compartilhado/util/arquivos';

export const SLUG = '2026-10-curiosidades-peniche';
const arquivo = arquivosDaPeca(SLUG);

/**
 * Carrossel 4:5 "5 curiosidades sobre Peniche" para a etapa da WSL em Supertubos:
 * capa, cinco curiosidades (cada uma com uma foto ou um desenho simples) e o fecho
 * pedindo comentário. Slides parados: `em` negativo deixa a marca inteira no quadro 0.
 * A marca é masculina: "o Surfzada".
 */
const PRONTO = -100;
const MARGEM = 88;
const LARGURA = 1080 - 2 * MARGEM;
export const TOTAL = 7;

type Tom = 'claro' | 'escuro';

function Slide({ n, tom, rotulo, children }: { n: number; tom: Tom; rotulo: string; children: ReactNode }) {
  const escuro = tom === 'escuro';
  return (
    <AbsoluteFill style={{ fontFamily: FONTE, color: escuro ? '#fff' : COR.tinta }}>
      {escuro ? <FundoEscuro /> : <FundoClaro />}
      <div style={{ position: 'absolute', left: MARGEM, right: MARGEM, top: MARGEM, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Rotulo texto={rotulo} em={PRONTO} tamanho={24} cor={escuro ? COR.coral : COR.coralTexto} />
        <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: '0.12em', color: escuro ? COR.suave : COR.apagado }}>
          {n} / {TOTAL}
        </div>
      </div>
      <AbsoluteFill style={{ padding: `${MARGEM + 90}px ${MARGEM}px ${MARGEM}px` }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
}

function Foto({ src, altura, foco = '50% 50%' }: { src: string; altura: number; foco?: string }) {
  return (
    <div style={{ height: altura, borderRadius: 28, overflow: 'hidden', background: COR.tinta2 }}>
      <Img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: foco }} />
    </div>
  );
}

/** Área de baixo de cada curiosidade, onde vai a foto ou o desenho. */
function Base({ children }: { children: ReactNode }) {
  return <div style={{ position: 'absolute', left: MARGEM, right: MARGEM, bottom: MARGEM }}>{children}</div>;
}

export function Capa() {
  return (
    <Slide n={1} tom="escuro" rotulo="WSL · MEO RIP CURL PRO PORTUGAL">
      <Foto src={arquivo('fotos/supertubos.jpg')} altura={500} foco="50% 55%" />
      <div style={{ marginTop: 44 }}>
        <Titulo texto={'*5* curiosidades\nsobre Peniche que\nvocê não sabia 🌊'} em={PRONTO} tamanho={80} peso={700} cor="#fff" />
      </div>
      <div style={{ marginTop: 22, fontSize: 34, lineHeight: 1.35, color: COR.apagado }}>A elite do surf chega a Supertubos de 16 a 25 de outubro.</div>
      <div style={{ position: 'absolute', left: MARGEM, right: MARGEM, bottom: MARGEM, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Logo tamanho={40} em={PRONTO} cor="#fff" />
        <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: '0.08em', color: COR.apagado }}>arrasta →</div>
      </div>
    </Slide>
  );
}

function Curiosidade({ i, tom, titulo, texto, children }: { i: number; tom: Tom; titulo: string; texto: string; children: ReactNode }) {
  const escuro = tom === 'escuro';
  return (
    <Slide n={i + 1} tom={tom} rotulo={`CURIOSIDADE ${i} DE 5`}>
      <div style={{ fontSize: 132, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.04em', color: COR.coral }}>{String(i).padStart(2, '0')}</div>
      <div style={{ marginTop: 22 }}>
        <Titulo texto={titulo} em={PRONTO} tamanho={74} peso={700} cor={escuro ? '#fff' : COR.tinta} />
      </div>
      <div style={{ marginTop: 26, fontSize: 38, lineHeight: 1.38, color: escuro ? COR.apagado : COR.suave, maxWidth: 880 }}>{texto}</div>
      <Base>{children}</Base>
    </Slide>
  );
}

export function Pipeline() {
  return (
    <Curiosidade i={1} tom="claro" titulo={'Supertubos é o\n“Pipeline europeu”'} texto="Pelos tubos rápidos e pesados, quebrando num fundo de areia: um beach break de respeito.">
      <Foto src={arquivo('fotos/farol.jpg')} altura={500} foco="50% 60%" />
    </Curiosidade>
  );
}

/** A ilha ligada ao continente pela areia (tômbolo). */
export function Ilha() {
  const terra = 'rgba(255,255,255,0.9)';
  return (
    <Curiosidade i={2} tom="escuro" titulo={'Peniche já\nfoi uma ilha!'} texto="A areia acumulada ao longo dos séculos ligou a cidade ao continente.">
      <svg width={LARGURA} height={360} viewBox={`0 0 ${LARGURA} 360`}>
        <rect x={0} y={60} width={LARGURA} height={240} rx={28} fill={COR.marFundo} />
        <path d="M0 88 Q0 60 28 60 L250 60 C300 120 290 220 240 300 L28 300 Q0 300 0 272 Z" fill={terra} />
        <path d="M240 150 C380 140 520 150 640 165 L640 205 C520 200 380 205 250 220 Z" fill={COR.sol} />
        <ellipse cx={740} cy={180} rx={130} ry={96} fill={terra} />
        <text x={120} y={340} fill={COR.apagado} fontSize={26} fontWeight={600} letterSpacing="0.12em" textAnchor="middle">
          CONTINENTE
        </text>
        <text x={445} y={130} fill={COR.sol} fontSize={26} fontWeight={600} letterSpacing="0.12em" textAnchor="middle">
          AREIA
        </text>
        <text x={740} y={340} fill={COR.apagado} fontSize={26} fontWeight={600} letterSpacing="0.12em" textAnchor="middle">
          PENICHE
        </text>
      </svg>
    </Curiosidade>
  );
}

export function Elite() {
  return (
    <Curiosidade i={3} tom="claro" titulo={'Elite mundial\ndesde 2009'} texto="Em 2026, Supertubos recebe a 10ª das 12 etapas do circuito mundial.">
      <div style={{ height: 300, display: 'flex', alignItems: 'center', gap: 32 }}>
        <div>
          <div style={{ fontSize: 96, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1 }}>2009</div>
          <div style={{ marginTop: 12, fontSize: 24, fontWeight: 600, letterSpacing: '0.12em', color: COR.suave }}>PRIMEIRA ETAPA</div>
        </div>
        <div style={{ flex: 1, height: 6, borderRadius: 3, background: `repeating-linear-gradient(90deg, ${COR.tinta} 0 18px, transparent 18px 30px)`, marginBottom: 38 }} />
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 96, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1 }}>2026</div>
          <div style={{ marginTop: 12, fontSize: 24, fontWeight: 600, letterSpacing: '0.12em', color: COR.suave }}>ETAPA 10 DE 12</div>
        </div>
      </div>
    </Curiosidade>
  );
}

/** As ilhas das Berlengas no mar, em frente à costa. */
export function Berlengas() {
  const ilhas = [
    { x: 150, y: 150, r: 46 },
    { x: 232, y: 196, r: 20 },
    { x: 96, y: 222, r: 14 },
    { x: 196, y: 92, r: 12 },
  ];
  return (
    <Curiosidade i={4} tom="escuro" titulo={'As Berlengas\nficam logo ali'} texto="O arquipélago em frente a Peniche é Reserva da Biosfera da UNESCO.">
      <svg width={LARGURA} height={340} viewBox={`0 0 ${LARGURA} 340`}>
        <rect x={0} y={20} width={LARGURA} height={280} rx={28} fill={COR.marFundo} />
        {ilhas.map((ilha, k) => (
          <circle key={k} cx={ilha.x} cy={ilha.y} r={ilha.r} fill="rgba(255,255,255,0.9)" />
        ))}
        <path d={`M${LARGURA - 150} 20 C${LARGURA - 210} 110 ${LARGURA - 170} 210 ${LARGURA - 230} 300 L${LARGURA - 28} 300 Q${LARGURA} 300 ${LARGURA} 272 L${LARGURA} 48 Q${LARGURA} 20 ${LARGURA - 28} 20 Z`} fill="rgba(255,255,255,0.9)" />
        <path d={`M270 170 L${LARGURA - 210} 170`} stroke="rgba(255,255,255,0.45)" strokeWidth={4} strokeDasharray="14 12" strokeLinecap="round" />
        <text x={160} y={330} fill={COR.apagado} fontSize={26} fontWeight={600} letterSpacing="0.12em" textAnchor="middle">
          BERLENGAS
        </text>
        <text x={LARGURA - 110} y={330} fill={COR.apagado} fontSize={26} fontWeight={600} letterSpacing="0.12em" textAnchor="middle">
          PENICHE
        </text>
      </svg>
    </Curiosidade>
  );
}

/** Planta de uma fortaleza abaluartada: muralha quadrada com um baluarte em cada canto. */
export function Fortaleza() {
  const cx = LARGURA / 2;
  const cy = 165;
  const h = 88; // meia muralha
  const f = 40; // onde o baluarte encosta na muralha, a partir do canto
  const g = 34; // quanto o flanco sai da muralha
  const p = 72; // quanto a ponta do baluarte avança para fora do canto
  const cantos: [number, number][] = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  const pontos = cantos
    .flatMap(([x, y], k): [number, number][] => {
      // horário: entra pela muralha anterior, sai pelo flanco, vai à ponta e volta pela muralha seguinte
      const ponta: [number, number] = [x * (h + p), y * (h + p)];
      return k % 2 === 0
        ? [[x * h, y * (h - f)], [x * (h + g), y * (h - f)], ponta, [x * (h - f), y * (h + g)], [x * (h - f), y * h]]
        : [[x * (h - f), y * h], [x * (h - f), y * (h + g)], ponta, [x * (h + g), y * (h - f)], [x * h, y * (h - f)]];
    })
    .map(([x, y]) => `${cx + x},${cy + y}`)
    .join(' ');
  return (
    <Curiosidade i={5} tom="claro" titulo={'Da prisão\nao museu'} texto="A Fortaleza de Peniche foi prisão política do Estado Novo. Hoje é o Museu Nacional Resistência e Liberdade.">
      <svg width={LARGURA} height={330} viewBox={`0 0 ${LARGURA} 330`}>
        <polygon points={pontos} fill="none" stroke={COR.tinta} strokeWidth={7} strokeLinejoin="round" />
        <rect x={cx - 44} y={cy - 44} width={88} height={88} rx={6} fill="none" stroke={COR.tinta} strokeWidth={5} />
      </svg>
    </Curiosidade>
  );
}

export function Fecho() {
  return (
    <Slide n={TOTAL} tom="escuro" rotulo="SUA VEZ">
      <div style={{ marginTop: 180 }}>
        <Titulo texto={'Quem leva a\netapa de Peniche\n*este* *ano?*'} em={PRONTO} tamanho={88} peso={700} cor="#fff" />
        <div style={{ marginTop: 34, fontSize: 56, fontWeight: 600 }}>Comenta aí 👇</div>
        <div style={{ marginTop: 64, display: 'inline-block', padding: '20px 36px', borderRadius: 999, background: '#fff', color: COR.tinta, fontSize: 32, fontWeight: 600 }}>
          Segue o Surfzada pra acompanhar a etapa
        </div>
      </div>
      <div style={{ position: 'absolute', left: MARGEM, right: MARGEM, bottom: MARGEM, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Logo tamanho={44} em={PRONTO} cor="#fff" />
        <div style={{ textAlign: 'right', lineHeight: 1.35 }}>
          <div style={{ fontSize: 30, fontWeight: 600, color: '#fff' }}>App do Surfzada</div>
          <div style={{ fontSize: 26, fontWeight: 500, color: COR.apagado }}>disponível na App Store</div>
        </div>
      </div>
    </Slide>
  );
}
