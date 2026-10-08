import type { ReactNode } from 'react';
import { AbsoluteFill, Img } from 'remotion';

import { Andy, type NomeExpressao, type NomePose } from '@compartilhado/personagens/andy';
import { TEMPESTADE } from '../video/cenas/Nascimento';
import { FORTALEZA, TERRAS } from '../video/Mapa';
import { arquivo, COR, FONTE } from '../tema';

/**
 * Carrossel-resumo do Surfzada Explica #1 (1080×1080), tema claro como o post
 * de lançamento do perfil: fundo #f5f5f5 com brilho coral discreto, rótulo
 * coral, título tinta com uma palavra em coral, desenhos em linha fina, no
 * máximo ~25 palavras por slide, o Andy pequeno no canto e o site no rodapé.
 * O último slide traz as fontes.
 *
 * Roteiro: ../../../episodios/01-de-onde-vem-a-onda/roteiro.md ("Carrossel-resumo");
 * números conferidos na tabela "Números usados".
 */
export const LADO = 1080;
export const TOTAL = 8;
const QUADRO = 'SURFZADA EXPLICA #1';

const TEXTO = '#3f3f3f';
const SUAVE = '#8a8a8a';
const TRACO = COR.tinta;

function Fundo() {
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(55% 50% at 88% 6%, rgba(255,122,89,0.14), transparent 70%), radial-gradient(50% 45% at 8% 100%, rgba(255,122,89,0.08), transparent 70%), ${COR.fundo}`,
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage: 'radial-gradient(rgba(10,10,10,0.07) 1.2px, transparent 1.2px)',
          backgroundSize: '34px 34px',
          maskImage: 'radial-gradient(75% 75% at 50% 50%, black, transparent)',
        }}
      />
    </AbsoluteFill>
  );
}

/** Texto com *trechos em coral*. */
function Marcado({ texto }: { texto: string }) {
  return (
    <>
      {texto.split('*').map((p, i) => (
        <span key={i} style={i % 2 ? { color: COR.coralEscuro } : undefined}>
          {p}
        </span>
      ))}
    </>
  );
}

/** Rótulo coral com traço, centrado. */
function Rotulo({ texto, top = 64 }: { texto: string; top?: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
        fontFamily: FONTE,
        fontSize: 24,
        fontWeight: 600,
        letterSpacing: '0.16em',
        color: COR.coralEscuro,
      }}
    >
      <span style={{ width: 44, height: 3, borderRadius: 2, background: COR.coral }} />
      {texto}
    </div>
  );
}

function Titulo({ children, top = 112, tamanho = 64 }: { children: string; top?: number; tamanho?: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 70,
        right: 70,
        textAlign: 'center',
        fontFamily: FONTE,
        fontWeight: 600,
        fontSize: tamanho,
        lineHeight: 1.08,
        letterSpacing: '-0.025em',
        color: COR.tinta,
      }}
    >
      <Marcado texto={children} />
    </div>
  );
}

/** A explicação, ao lado do Andy. */
function Explica({ children }: { children: string }) {
  return (
    <div style={{ position: 'absolute', left: 330, right: 70, bottom: 96, fontFamily: FONTE, fontWeight: 400, fontSize: 31, lineHeight: 1.35, color: TEXTO }}>
      <Marcado texto={children} />
    </div>
  );
}

/** Rodapé de todos os slides: o site e a página. */
function Rodape({ n, esquerda = false }: { n: number; esquerda?: boolean }) {
  return (
    <div
      style={{
        position: 'absolute',
        ...(esquerda ? { left: 70 } : { right: 70 }),
        bottom: 40,
        display: 'flex',
        gap: 18,
        fontFamily: FONTE,
        fontSize: 22,
        fontWeight: 500,
        letterSpacing: '0.04em',
        color: SUAVE,
      }}
    >
      <span>
        surfzada<span style={{ color: COR.coralEscuro }}>.com.br</span>
      </span>
      <span style={{ opacity: 0.7 }}>
        {n}/{TOTAL}
      </span>
    </div>
  );
}

/** Rótulo pequeno solto sobre o desenho. */
function Nota({ children, x, y, cor = SUAVE, alinhar = 'middle' }: { children: string; x: number; y: number; cor?: string; alinhar?: 'start' | 'middle' | 'end' }) {
  return (
    <text x={x} y={y} fill={cor} fontFamily={FONTE} fontSize={26} fontWeight={500} textAnchor={alinhar}>
      {children}
    </text>
  );
}

/** O Andy no canto de baixo à esquerda, saindo pela borda. */
function AndyCanto({ pose = 'parado', expressao = 'neutro', altura = 380, x = 150, y = 1150 }: { pose?: NomePose; expressao?: NomeExpressao; altura?: number; x?: number; y?: number }) {
  return (
    <svg width={LADO} height={LADO} style={{ position: 'absolute', inset: 0 }}>
      <Andy x={x} y={y} altura={altura} pose={pose} expressao={expressao} />
    </svg>
  );
}

function Desenho({ children }: { children: ReactNode }) {
  return (
    <svg width={LADO} height={LADO} style={{ position: 'absolute', inset: 0 }}>
      {children}
    </svg>
  );
}

const seta = (x: number, y: number, ang = 0, cor: string = COR.coral, t = 18) => (
  <path d={`M${t} 0 L${-t} ${-t * 0.8} L${-t} ${t * 0.8} Z`} fill={cor} transform={`translate(${x} ${y}) rotate(${ang})`} />
);

/** Tempestade em traço: quatro braços de espiral girando no sentido anti-horário (hemisfério norte). */
function Espiral({ x, y, raio = 150, cor = TRACO }: { x: number; y: number; raio?: number; cor?: string }) {
  const e = raio / 180;
  const bracos = [0, 1, 2, 3].map((b) =>
    Array.from({ length: 30 }, (_, i) => {
      const r = (18 + i * 5.5) * e;
      const a = (b * Math.PI) / 2 + (r / e) * 0.028;
      return `${i ? 'L' : 'M'}${x + Math.cos(a) * r} ${y + Math.sin(a) * r}`;
    }).join(' '),
  );
  return (
    <g>
      {bracos.map((d, i) => (
        <path key={i} d={d} stroke={cor} strokeOpacity={0.8} strokeWidth={Math.max(2.5, 5 * e)} strokeLinecap="round" fill="none" />
      ))}
      <circle cx={x} cy={y} r={Math.max(4, 7 * e)} fill={COR.coral} />
    </g>
  );
}

// 1 · Capa: o mito, a onda real num cartão e o Andy se apresentando.
function Capa() {
  return (
    <AbsoluteFill>
      <Fundo />
      <Rotulo texto={QUADRO} top={86} />
      {/* Texto entre x≈150 e 930: a grade do perfil recorta o quadrado em 3:4. */}
      <div style={{ position: 'absolute', top: 132, left: 150, right: 150, textAlign: 'center', fontFamily: FONTE, fontWeight: 600, fontSize: 92, lineHeight: 1.06, letterSpacing: '-0.025em', color: COR.tinta }}>
        A onda não vem
        <br />
        <span style={{ color: COR.coralEscuro }}>da maré</span>.
      </div>
      <div style={{ position: 'absolute', top: 362, left: 150, right: 150, textAlign: 'center', whiteSpace: 'nowrap', fontFamily: FONTE, fontWeight: 500, fontSize: 30, color: TEXTO }}>
        5 coisas sobre ondas que nem surfista sabe <span style={{ color: COR.coralEscuro }}>→</span>
      </div>
      {/* Quadro 3840×2160 da Telo Island num cartão, com o tubo no meio. */}
      <div style={{ position: 'absolute', left: 70, right: 70, top: 440, bottom: 90, borderRadius: 32, overflow: 'hidden', boxShadow: '0 18px 50px rgba(10,10,10,0.18)' }}>
        <Img src={arquivo('reais/r1-congelado.jpg')} style={{ position: 'absolute', left: -560, top: -250, width: 1940, height: 1091 }} />
      </div>
      <AndyCanto pose="acenando" expressao="alegria" altura={420} x={150} y={1160} />
      {/* O Andy se apresenta, discreto. */}
      <div
        style={{
          position: 'absolute',
          left: 300,
          top: 790,
          background: '#fff',
          borderRadius: 22,
          padding: '12px 20px',
          fontFamily: FONTE,
          fontSize: 24,
          fontWeight: 500,
          color: TEXTO,
          boxShadow: '0 8px 24px rgba(10,10,10,0.18)',
        }}
      >
        O <b style={{ color: COR.tinta }}>Andy</b> te explica.
      </div>
      <Rodape n={1} />
    </AbsoluteFill>
  );
}

// 2 · Nasce numa tempestade: vento, duração e pista.
function Nascimento() {
  const medidores = ['VENTO', 'DURAÇÃO', 'PISTA'];
  const [cx, cy] = [320, 470];
  return (
    <AbsoluteFill>
      <Fundo />
      <Desenho>
        {/* Ondas saindo da tempestade. */}
        {[200, 240, 280].map((r) => (
          <path key={r} d={`M${cx + Math.cos(0.5) * r} ${cy + Math.sin(0.5) * r} A${r} ${r} 0 0 1 ${cx + Math.cos(2.6) * r} ${cy + Math.sin(2.6) * r}`} stroke={TRACO} strokeOpacity={0.18} strokeWidth={3} fill="none" />
        ))}
        <Espiral x={cx} y={cy} raio={120} />
        {/* Vento girando em volta. */}
        {Array.from({ length: 6 }, (_, i) => {
          const r = 165;
          const a0 = (i / 6) * Math.PI * 2;
          const a1 = a0 - 0.5;
          const [x1, y1] = [cx + Math.cos(a1) * r, cy + Math.sin(a1) * r];
          return (
            <g key={i}>
              <path d={`M${cx + Math.cos(a0) * r} ${cy + Math.sin(a0) * r} A${r} ${r} 0 0 0 ${x1} ${y1}`} stroke={COR.coral} strokeWidth={5} strokeLinecap="round" fill="none" />
              {seta(x1, y1, ((a1 - Math.PI / 2) * 180) / Math.PI, COR.coral, 11)}
            </g>
          );
        })}
        {medidores.map((m, i) => (
          <g key={m} transform={`translate(600 ${370 + i * 90})`}>
            <text x={0} y={0} fill={COR.tinta} fontFamily={FONTE} fontWeight={600} fontSize={26} letterSpacing="0.12em">
              {m}
            </text>
            <line x1={0} y1={22} x2={400} y2={22} stroke="rgba(10,10,10,0.1)" strokeWidth={8} strokeLinecap="round" />
            <line x1={0} y1={22} x2={400 * (0.72 + i * 0.1)} y2={22} stroke={COR.coral} strokeWidth={8} strokeLinecap="round" />
          </g>
        ))}
        <text x={600} y={670} fill={COR.tinta} fontFamily={FONTE} fontWeight={600} fontSize={40}>
          = <tspan fill={COR.coralEscuro}>mais onda</tspan>
        </text>
      </Desenho>
      <Rotulo texto="1 · ONDE ELA NASCE" />
      <Titulo>{'Numa *tempestade*, longe daqui'}</Titulo>
      <AndyCanto pose="apontandoCima" expressao="neutro" />
      <Explica>{'Vento forte, soprando por muito tempo, sobre uma área grande de mar (a pista). Quanto mais de cada, *mais onda*.'}</Explica>
      <Rodape n={2} />
    </AbsoluteFill>
  );
}

// 3 · A água não viaja: a boia só gira; quem segue é a energia.
function Agua() {
  const y0 = 520;
  const A = 46;
  const L = 420;
  const xb = 640; // boia na crista: topo da órbita
  const sup = Array.from({ length: 109 }, (_, i) => i * 10)
    .map((x) => `${x ? 'L' : 'M'}${x} ${y0 - A * Math.cos(((x - xb) / L) * 2 * Math.PI)}`)
    .join(' ');
  const k = (2 * Math.PI) / L;
  return (
    <AbsoluteFill>
      <Fundo />
      <Desenho>
        <path d={sup} stroke={TRACO} strokeWidth={6} fill="none" />
        {/* Órbitas das partículas: o raio cai com a profundidade (A·e^(−kz)). */}
        {[0, 70, 150].map((z) => (
          <circle key={z} cx={xb} cy={y0 + z} r={A * Math.exp(-k * z)} stroke={TRACO} strokeOpacity={z ? 0.35 : 0.6} strokeWidth={3} strokeDasharray="6 9" fill="none" />
        ))}
        {[70, 150].map((z) => (
          <circle key={z} cx={xb} cy={y0 + z - A * Math.exp(-k * z)} r={7} fill={TRACO} opacity={0.6} />
        ))}
        {/* Boia na crista. */}
        <circle cx={xb} cy={y0 - A - 22} r={22} fill={COR.coral} />
        <line x1={xb} y1={y0 - A - 44} x2={xb} y2={y0 - A - 78} stroke={TRACO} strokeWidth={4} strokeLinecap="round" />
        <Nota x={xb + 90} y={y0 + 100} alinhar="start">
          a água só gira
        </Nota>
        {/* A energia segue. */}
        <line x1={300} y1={330} x2={860} y2={330} stroke={COR.coral} strokeWidth={8} strokeLinecap="round" />
        {seta(880, 330)}
        <Nota x={580} y={300} cor={COR.coralEscuro}>
          a energia segue
        </Nota>
      </Desenho>
      <Rotulo texto="2 · O QUE VIAJA" />
      <Titulo>{'A água *não viaja*'}</Titulo>
      <AndyCanto pose="pensando" expressao="ideia" />
      <Explica>{'A onda passa e a boia só *gira no lugar*. O que atravessa o oceano é a *energia*, não a água.'}</Explica>
      <Rodape n={3} />
    </AbsoluteFill>
  );
}

// 4 · Dispersão: a bagunça perto da tempestade vira swell organizado.
function Swell() {
  const largura = 820;
  const x0 = 130;
  const linha = (y: number, eta: (x: number) => number) =>
    Array.from({ length: 165 }, (_, i) => i * 5)
      .map((x) => `${x ? 'L' : 'M'}${x0 + x} ${y - eta(x)}`)
      .join(' ');
  const bagunca = (x: number) => 14 * Math.cos(0.041 * x) + 11 * Math.cos(0.063 * x + 1) + 9 * Math.cos(0.097 * x + 2.3) + 8 * Math.cos(0.019 * x + 0.4);
  const swell = (x: number) => 30 * Math.cos((2 * Math.PI * x) / 410);
  return (
    <AbsoluteFill>
      <Fundo />
      <Desenho>
        <Nota x={x0} y={292} alinhar="start">
          perto da tempestade
        </Nota>
        <path d={linha(375, bagunca)} stroke={TRACO} strokeOpacity={0.85} strokeWidth={5} fill="none" strokeLinejoin="round" />
        <line x1={x0} y1={375} x2={x0 + largura} y2={375} stroke="rgba(10,10,10,0.12)" strokeWidth={2} strokeDasharray="4 8" />
        <Nota x={x0} y={482} alinhar="start">
          dias depois: swell
        </Nota>
        <path d={linha(560, swell)} stroke={COR.coral} strokeWidth={8} fill="none" />
        <line x1={x0} y1={560} x2={x0 + largura} y2={560} stroke="rgba(10,10,10,0.12)" strokeWidth={2} strokeDasharray="4 8" />
        {seta(x0 + largura + 30, 560)}
      </Desenho>
      <Rotulo texto="3 · COMO ELA SE ORGANIZA" />
      <Titulo>{'Onda longa *sai na frente*'}</Titulo>
      <AndyCanto pose="parado" expressao="pensativo" />
      <Explica>{'Onda de *período longo* corre mais. Ela larga a bagunça para trás e chega primeiro, em linhas organizadas: o *swell*.'}</Explica>
      <Rodape n={4} />
    </AbsoluteFill>
  );
}

// 5 · A viagem: da tempestade até o Ceará, em contorno fino.
function Viagem() {
  const v = { lon: -38, lat: 19.5, esc: 10.2, cx: 600, cy: 520 };
  const p = ([lon, lat]: [number, number]): [number, number] => [v.cx + (lon - v.lon) * v.esc, v.cy - (lat - v.lat) * v.esc];
  const [tx, ty] = p(TEMPESTADE);
  const [fx, fy] = p(FORTALEZA);
  return (
    <AbsoluteFill>
      <Fundo />
      <Desenho>
        <defs>
          <clipPath id="quadro-mapa">
            <rect x={0} y={230} width={LADO} height={560} />
          </clipPath>
        </defs>
        <g clipPath="url(#quadro-mapa)">
          {TERRAS.map((t, i) => (
            <path key={i} d={t.map((c, j) => `${j ? 'L' : 'M'}${p(c).join(' ')}`).join(' ') + ' Z'} fill="#e8e8e8" stroke="rgba(10,10,10,0.28)" strokeWidth={2} strokeLinejoin="round" />
          ))}
          {/* Frentes do swell descendo para o sul. */}
          {[0.25, 0.45, 0.65, 0.85].map((u, i) => {
            const r = u * (fy - ty);
            return (
              <path
                key={i}
                d={`M${tx + Math.cos(0.9) * r} ${ty + Math.sin(0.9) * r} A${r} ${r} 0 0 1 ${tx + Math.cos(2.24) * r} ${ty + Math.sin(2.24) * r}`}
                stroke={TRACO}
                strokeOpacity={0.35}
                strokeWidth={3}
                fill="none"
                strokeLinecap="round"
              />
            );
          })}
          <Espiral x={tx} y={ty} raio={52} />
        </g>
        <line x1={tx} y1={ty + 50} x2={fx} y2={fy - 18} stroke={COR.coral} strokeWidth={5} strokeDasharray="14 12" strokeLinecap="round" />
        <circle cx={fx} cy={fy} r={12} fill={COR.coral} stroke="#fff" strokeWidth={3} />
        <Nota x={fx + 24} y={fy + 9} alinhar="start" cor={COR.tinta}>
          Ceará
        </Nota>
        <Nota x={tx + 80} y={ty + 8} alinhar="start">
          tempestade
        </Nota>
      </Desenho>
      <Rotulo texto="4 · ATÉ ONDE ELA VAI" />
      <Titulo>{'Viaja *milhares de km*'}</Titulo>
      <AndyCanto pose="parado" expressao="alegria" />
      <Explica>{'Do Atlântico Norte ao Ceará: *~5 mil km*, em 4 a 5 dias. Já mediram swell cruzando *16 mil km* de oceano.'}</Explica>
      <Rodape n={5} />
    </AbsoluteFill>
  );
}

// 6 · Na costa, quem manda é o fundo: a mesma onda vista da areia, em três fundos diferentes.

/** Espuma: festões ao longo da crista (de xa a xb, altura y(x)) descendo até `ate`. */
function Espuma({ xa, xb, y, ate }: { xa: number; xb: number; y: (x: number) => number; ate: (x: number) => number }) {
  const r = 11;
  const n = Math.max(1, Math.round((xb - xa) / (r * 2)));
  const passo = (xb - xa) / n;
  let d = `M${xa} ${ate(xa)} L${xa} ${y(xa)}`;
  for (let i = 0; i < n; i++) {
    const x1 = xa + (i + 1) * passo;
    d += ` A${passo / 2} ${r} 0 0 1 ${x1} ${y(x1)}`;
  }
  d += ` L${xb} ${ate(xb)} Z`;
  return <path d={d} fill="#fff" stroke={TRACO} strokeWidth={3} strokeLinejoin="round" />;
}

/** Uma onda de frente (como se vê da areia): face, crista e o jeito de quebrar. */
function OndaDeFrente({ tipo }: { tipo: 'abre' | 'fecha' | 'nada' }) {
  // A parede passa das bordas do cartão (é uma onda comprida); xa..xb é a parte visível.
  const [xa, xb, b] = [-10, 310, 455];
  const crista =
    tipo === 'abre'
      ? (x: number) => b - 125 + 80 * ((x - xa) / (xb - xa))
      : tipo === 'fecha'
        ? () => b - 112
        : (x: number) => b - 38 * Math.sin(Math.PI * ((x - xa) / (xb - xa)));
  const pts = Array.from({ length: 27 }, (_, i) => xa + ((xb - xa) * i) / 26);
  const face = `M${xa} ${b} ` + pts.map((x) => `L${x} ${crista(x)}`).join(' ') + ` L${xb} ${b} Z`;
  const quebra = 150; // até onde a espuma já chegou na onda que abre
  return (
    <g>
      {/* Céu claro atrás, para a espuma branca aparecer. */}
      <rect x={-20} y={b - 260} width={360} height={260} fill="#e4eef3" />
      {/* Mar na frente da onda. */}
      <rect x={-20} y={b} width={360} height={60} fill="#cfe0e8" />
      <path d={face} fill="#a9c8d6" stroke={TRACO} strokeWidth={4} strokeLinejoin="round" />
      {tipo === 'abre' && (
        <>
          <Espuma xa={xa} xb={xa + quebra} y={(x) => crista(x) - 4} ate={() => b} />
          {/* Borda da espuma, fofa, avançando para a direita. */}
          {[0, 1, 2, 3].map((k) => {
            const y = crista(xa + quebra) + 18 + k * ((b - crista(xa + quebra) - 30) / 3);
            return <circle key={k} cx={xa + quebra + (k % 2 ? 2 : 10)} cy={y} r={15} fill="#fff" stroke={TRACO} strokeWidth={3} />;
          })}
          {/* O lábio se enrolando logo à frente da espuma. */}
          <path
            d={`M${xa + quebra + 8} ${crista(xa + quebra + 8)} Q${xa + quebra + 46} ${crista(xa + quebra + 8) + 4} ${xa + quebra + 40} ${crista(xa + quebra + 8) + 44}`}
            stroke={TRACO}
            strokeWidth={4}
            fill="none"
            strokeLinecap="round"
          />
          {/* Surfista na parede, à frente da espuma. */}
          <line x1={xa + quebra + 58} y1={b - 24} x2={xa + quebra + 104} y2={b - 36} stroke={COR.coral} strokeWidth={6} strokeLinecap="round" />
          <circle cx={xa + quebra + 82} cy={b - 56} r={11} fill={COR.coral} />
          {/* A quebra corre de um lado para o outro. */}
          <line x1={xa + 30} y1={b - 160} x2={xa + 190} y2={b - 160} stroke={COR.coral} strokeWidth={6} strokeLinecap="round" />
          {seta(xa + 206, b - 160, 0, COR.coral, 13)}
        </>
      )}
      {tipo === 'fecha' && (
        <>
          <Espuma xa={xa} xb={xb} y={(x) => crista(x) - 4} ate={(x) => crista(x) + 48} />
          {/* Tudo cai de uma vez. */}
          {[70, 150, 230].map((x) => (
            <g key={x}>
              <line x1={x} y1={b - 190} x2={x} y2={b - 150} stroke={COR.coral} strokeWidth={6} strokeLinecap="round" />
              {seta(x, b - 140, 90, COR.coral, 11)}
            </g>
          ))}
        </>
      )}
    </g>
  );
}

const JEITOS = [
  { tipo: 'abre', nome: 'Abre', texto: 'Quebra aos poucos, de um lado pro outro. Dá pra surfar.', fundo: 'fundo em diagonal' },
  { tipo: 'fecha', nome: 'Fecha', texto: 'A linha inteira quebra de uma vez. Não sobra parede.', fundo: 'fundo reto' },
  { tipo: 'nada', nome: 'Quase não quebra', texto: 'Passa direto, sem espuma.', fundo: 'canal profundo' },
] as const;

function Fundo6() {
  const [larg, gap, x0, topo] = [300, 20, 60, 205];
  return (
    <AbsoluteFill>
      <Fundo />
      {JEITOS.map((j, i) => (
        <div
          key={j.tipo}
          style={{
            position: 'absolute',
            left: x0 + i * (larg + gap),
            top: topo,
            width: larg,
            height: 470,
            background: 'rgba(255,255,255,0.92)',
            borderRadius: 26,
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(10,10,10,0.08)',
          }}
        >
          <svg width={larg} height={240} viewBox={`0 ${455 - 210} ${larg} 240`} style={{ position: 'absolute', top: 0, left: 0 }}>
            <OndaDeFrente tipo={j.tipo} />
          </svg>
          <div style={{ position: 'absolute', top: 258, left: 24, right: 20, fontFamily: FONTE }}>
            <div style={{ fontSize: 32, fontWeight: 600, color: j.tipo === 'abre' ? COR.coralEscuro : COR.tinta, letterSpacing: '-0.02em' }}>{j.nome}</div>
            <div style={{ fontSize: 22, lineHeight: 1.3, color: TEXTO, marginTop: 6 }}>{j.texto}</div>
            <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: '0.06em', color: SUAVE, marginTop: 10, textTransform: 'uppercase' }}>{j.fundo}</div>
          </div>
        </div>
      ))}
      <Rotulo texto="5 · ONDE ELA QUEBRA" />
      <Titulo>{'Quem manda é *o fundo*'}</Titulo>
      <AndyCanto pose="bracosCruzados" expressao="desconfiado" />
      <Explica>{'A mesma onda, três fundos, três jeitos de quebrar. Por que isso acontece? Fica pro *Surfzada Explica #2*.'}</Explica>
      <Rodape n={6} />
    </AbsoluteFill>
  );
}

// 7 · Fechamento: bordão, salvar e mandar.
function Fechamento() {
  return (
    <AbsoluteFill>
      <Fundo />
      <AndyCanto pose="parado" expressao="deboche" altura={720} x={840} y={1260} />
      <Rotulo texto={QUADRO} top={150} />
      <div style={{ position: 'absolute', top: 210, left: 70, width: 600, fontFamily: FONTE, fontWeight: 600, fontSize: 96, lineHeight: 1.04, letterSpacing: '-0.025em', color: COR.tinta }}>
        O mar <span style={{ color: COR.coralEscuro }}>não mente</span>.
      </div>
      <div style={{ position: 'absolute', top: 470, left: 70, width: 470, fontFamily: FONTE, fontWeight: 400, fontSize: 36, lineHeight: 1.35, color: TEXTO }}>
        <span style={{ color: COR.tinta, fontWeight: 600 }}>Salva</span> pra lembrar e <span style={{ color: COR.tinta, fontWeight: 600 }}>manda pro amigo</span> que acha que onda vem da maré.
      </div>
      <div style={{ position: 'absolute', top: 680, left: 70, width: 470, fontFamily: FONTE, fontWeight: 500, fontSize: 30, color: SUAVE }}>
        Previsão de onda no <span style={{ color: COR.coralEscuro, fontWeight: 600 }}>surfzada.com.br</span>
      </div>
      <Rodape n={7} esquerda />
    </AbsoluteFill>
  );
}

// 8 · Fontes: de onde saiu cada número.
const FONTES: [string, string][] = [
  ['Onda é energia, não água', 'NOAA Ocean Service, "Why does the ocean have waves?" (oceanservice.noaa.gov)'],
  ['Vento, duração e pista', 'Sverdrup & Munk (1947), Wind, Sea and Swell: Theory of Relations for Forecasting. U.S. Navy Hydrographic Office, pub. 601'],
  ['Órbitas e dispersão', 'Holthuijsen (2007), Waves in Oceanic and Coastal Waters. Cambridge University Press. Teoria linear: velocidade de grupo = g·T/4π'],
  ['~5 mil km e 4 a 5 dias', 'Conta nossa: tempestade a ~42°N 40°O até Fortaleza ≈ 5 mil km; swell de 16 s ≈ 12,5 m/s ≈ 45 km/h'],
  ['16 mil km', 'Snodgrass, Munk et al. (1966), "Propagation of ocean swell across the Pacific". Phil. Trans. R. Soc. A 259:431–497'],
  ['Foto da capa', 'Luke Cromwell, "Surfer riding perfect wave at Telo Island" (Pexels)'],
];

function Fontes() {
  return (
    <AbsoluteFill>
      <Fundo />
      <Rotulo texto="FONTES" top={70} />
      <Titulo top={112} tamanho={56}>
        {'De onde saiu *cada número*'}
      </Titulo>
      <div style={{ position: 'absolute', top: 230, left: 90, right: 90, display: 'flex', flexDirection: 'column', gap: 26, fontFamily: FONTE }}>
        {FONTES.map(([tema, ref]) => (
          <div key={tema} style={{ borderLeft: `4px solid ${COR.coral}`, paddingLeft: 20 }}>
            <div style={{ fontSize: 26, fontWeight: 600, color: COR.tinta }}>{tema}</div>
            <div style={{ fontSize: 23, fontWeight: 400, lineHeight: 1.35, color: TEXTO, marginTop: 2 }}>{ref}</div>
          </div>
        ))}
      </div>
      <Rodape n={8} />
    </AbsoluteFill>
  );
}

export const SLIDES = [Capa, Nascimento, Agua, Swell, Viagem, Fundo6, Fechamento, Fontes];

export function SlideCarrossel01({ n }: { n: number }) {
  const Slide = SLIDES[n - 1];
  return (
    <AbsoluteFill style={{ background: COR.fundo, overflow: 'hidden' }}>
      <Slide />
    </AbsoluteFill>
  );
}
