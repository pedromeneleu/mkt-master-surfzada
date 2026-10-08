import type { ReactNode } from 'react';
import { AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

import { Sfx } from '@compartilhado/componentes/Sfx';
import { FundoClaro, FundoEscuro, Logo } from '@compartilhado/marca/Marca';
import { Rotulo, Titulo } from '@compartilhado/marca/Texto';
import { CHEGADA, COR, FONTE } from '@compartilhado/tema';

export const SLUG = '2026-10-coisas-que-so-quem-surfa-entende';

/**
 * Reel do carrossel "Coisas que só quem surfa entende" (post 09): capa, seis itens e o fecho
 * pedindo comentário. Cada cena entra cobrindo a anterior de baixo para cima.
 */

/** Duração das cenas (frames a 30 fps) e da sobreposição da troca de cena. */
const CAPA = 96;
const ITEM = 114;
const FECHO = 132;
const TROCA = 12;

/** Margens: esquerda, e direita fora da coluna de botões do Reels (~140 px). */
const ESQ = 96;
const DIR = 160;
/** Topo da área do gráfico de cada item (a base segura do Reels começa em 1500). */
const GRAFICO = 1080;

type Fundo = 'claro' | 'escuro';

type Item = { texto: string; fundo: Fundo; grafico: (escuro: boolean) => ReactNode };

const ITENS: Item[] = [
  { texto: 'Olhar o mar\n*cinco* *vezes*\nantes de\ndecidir entrar.', fundo: 'claro', grafico: () => <CincoOlhadas /> },
  { texto: 'Dizer *“não* *está*\n*tão* *bom”* e\nentrar mesmo\nassim.', fundo: 'escuro', grafico: () => <TodaVez /> },
  { texto: 'Conhecer alguém\npela *prancha*\nantes do nome.', fundo: 'claro', grafico: () => <Pranchas /> },
  { texto: 'Ver previsão\nde onda como\nquem vê\n*horóscopo*.', fundo: 'escuro', grafico: () => <Previsao /> },
  { texto: '*“Só* *mais* *uma”*\nsem nenhuma\nintenção\nde sair.', fundo: 'claro', grafico: (e) => <MaisUma escuro={e} /> },
  { texto: 'Voltar para\ncasa cansado,\nmas *melhor*\ndo que chegou.', fundo: 'claro', grafico: () => <Medidores /> },
];

const inicioItem = (i: number) => CAPA - TROCA + i * (ITEM - TROCA);
const INICIO_FECHO = inicioItem(ITENS.length);
export const DURACAO = INICIO_FECHO + FECHO;

export function Peca() {
  return (
    <AbsoluteFill style={{ background: COR.fundo }}>
      <Cena inicio={0} duracao={CAPA} fundo="claro" primeira>
        <Capa />
      </Cena>
      {ITENS.map((item, i) => (
        <Cena key={i} inicio={inicioItem(i)} duracao={ITEM} fundo={item.fundo}>
          <CenaItem n={i + 1} item={item} />
        </Cena>
      ))}
      <Cena inicio={INICIO_FECHO} duracao={FECHO} fundo="escuro">
        <Fecho />
      </Cena>
    </AbsoluteFill>
  );
}

/** Uma cena: o fundo sobe cobrindo a anterior em TROCA quadros, com um whoosh. */
function Cena({ inicio, duracao, fundo, primeira, children }: { inicio: number; duracao: number; fundo: Fundo; primeira?: boolean; children: ReactNode }) {
  return (
    <Sequence from={inicio} durationInFrames={duracao}>
      <Cobre ativo={!primeira}>
        {fundo === 'escuro' ? <FundoEscuro /> : <FundoClaro />}
        {children}
      </Cobre>
      {!primeira && <Sfx nome="whoosh-curto" em={0} volume={0.6} />}
    </Sequence>
  );
}

function Cobre({ ativo, children }: { ativo: boolean; children: ReactNode }) {
  const frame = useCurrentFrame();
  const p = ativo ? interpolate(frame, [0, TROCA], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: CHEGADA }) : 1;
  return <AbsoluteFill style={{ clipPath: `inset(${(1 - p) * 100}% 0 0 0)`, transform: `translateY(${(1 - p) * 80}px)` }}>{children}</AbsoluteFill>;
}

function Capa() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sol = spring({ frame: frame - 4, fps, config: { damping: 200 } });
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: -220,
          top: 860,
          width: 760,
          height: 760,
          borderRadius: '50%',
          background: COR.coralClaro,
          transform: `scale(${sol})`,
        }}
      />
      <div style={{ position: 'absolute', left: ESQ, top: 300 }}>
        <Rotulo texto="VOCABULÁRIO DO LINE-UP" em={6} tamanho={26} />
      </div>
      <div style={{ position: 'absolute', left: ESQ, right: DIR - 40, top: 560 }}>
        <Titulo texto={'Coisas que\nsó quem\n*surfa*\nentende'} em={8} tamanho={140} peso={700} />
      </div>
      <Sfx nome="pop" em={10} volume={0.5} />
    </AbsoluteFill>
  );
}

function CenaItem({ n, item }: { n: number; item: Item }) {
  const escuro = item.fundo === 'escuro';
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: ESQ, top: 300 }}>
        <Rotulo texto={`${String(n).padStart(2, '0')} / ${String(ITENS.length).padStart(2, '0')}`} em={6} tamanho={26} cor={escuro ? COR.coral : COR.coralTexto} />
      </div>
      <div style={{ position: 'absolute', left: ESQ, right: DIR, top: 440 }}>
        <Titulo texto={item.texto} em={8} tamanho={100} peso={700} cor={escuro ? '#fff' : COR.tinta} />
      </div>
      <div style={{ position: 'absolute', left: ESQ, right: DIR, top: GRAFICO, height: 400 }}>{item.grafico(escuro)}</div>
    </AbsoluteFill>
  );
}

/** Entrada de 0 a 1 com mola, começando em `em`. */
function useEntrada(em: number) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - em, fps, config: { damping: 16, stiffness: 160, mass: 0.7 } });
}

/** 01: cinco olhadas para o mar; a quinta é a que decide. */
function CincoOlhadas() {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: 'flex', gap: 18, marginTop: 140 }}>
      {Array.from({ length: 5 }, (_, i) => {
        const em = 30 + i * 9;
        const cheio = frame >= em;
        const p = interpolate(frame, [em, em + 6], [0.85, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: CHEGADA });
        return (
          <div key={i}>
            <div
              style={{
                width: 140,
                height: 110,
                borderRadius: 14,
                border: `5px solid ${COR.tinta}`,
                background: cheio ? (i === 4 ? COR.coral : COR.tinta) : 'transparent',
                borderColor: cheio && i === 4 ? COR.coral : COR.tinta,
                transform: `scale(${cheio ? p : 1})`,
              }}
            />
            <Sfx nome={i === 4 ? 'pop-agudo' : 'tick'} em={em} volume={i === 4 ? 0.6 : 0.4} />
          </div>
        );
      })}
    </div>
  );
}

/** 02: uma onda que se desenha, e o "toda vez". */
function TodaVez() {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [26, 70], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: CHEGADA });
  const onda = 'M0 60 C70 0 140 0 210 60 S350 120 420 60 S560 0 630 60 S770 120 824 70';
  return (
    <div style={{ marginTop: 120 }}>
      <svg width={824} height={130} viewBox="0 0 824 130" style={{ overflow: 'visible' }}>
        <path d={onda} fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
      </svg>
      <div style={{ marginTop: 50 }}>
        <Rotulo texto="TODA VEZ" em={60} tamanho={30} cor={COR.coral} />
      </div>
    </div>
  );
}

/** 03: três pranchas (o "nome" de cada um no line-up). */
function Pranchas() {
  const formas = [
    { altura: 300, cor: COR.tinta, contorno: false },
    { altura: 230, cor: COR.suave, contorno: false },
    { altura: 360, cor: 'transparent', contorno: true },
  ];
  const legenda = useEntrada(62);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 26, height: 380 }}>
      {formas.map((f, i) => {
        const p = useEntrada(26 + i * 8);
        return (
          <div
            key={i}
            style={{
              width: 92,
              height: f.altura,
              borderRadius: '46px 46px 30px 30px',
              background: f.cor,
              border: f.contorno ? `5px solid ${COR.tinta}` : undefined,
              transform: `translateY(${(1 - p) * 120}%)`,
              opacity: Math.min(1, p * 2),
            }}
          />
        );
      })}
      <div
        style={{
          marginLeft: 22,
          marginBottom: 6,
          fontFamily: FONTE,
          fontSize: 28,
          fontWeight: 600,
          letterSpacing: '0.08em',
          color: COR.suave,
          opacity: legenda,
          transform: `translateY(${(1 - legenda) * 16}px)`,
        }}
      >
        “O DO FISH
        <br />
        AMARELO”
      </div>
      <Sfx nome="pop" em={26} volume={0.4} />
      <Sfx nome="pop" em={42} volume={0.4} />
    </div>
  );
}

/** 04: barras de previsão da semana, lidas como signo. */
function Previsao() {
  const dias = ['SEG', 'TER', 'QUA', 'QUI', 'SEX'];
  const alturas = [110, 200, 140, 300, 80];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 22, height: 400 }}>
      {dias.map((dia, i) => {
        const p = useEntrada(26 + i * 6);
        return (
          <div key={dia} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 140,
                height: alturas[i] * p,
                borderRadius: 12,
                background: i % 2 ? '#fff' : COR.tinta2,
                border: i % 2 ? undefined : '4px solid rgba(255,255,255,0.35)',
              }}
            />
            <div style={{ fontFamily: FONTE, fontSize: 24, fontWeight: 600, letterSpacing: '0.12em', color: COR.apagado }}>{dia}</div>
          </div>
        );
      })}
      <Sfx nome="whoosh-grave" em={26} volume={0.4} />
    </div>
  );
}

/** 05: o contador de "só mais uma" que não para. */
function MaisUma({ escuro }: { escuro: boolean }) {
  const frame = useCurrentFrame();
  const primeiro = 28;
  const passo = 9;
  const numero = Math.max(1, Math.min(7, 1 + Math.floor((frame - primeiro) / passo)));
  const aparece = useEntrada(primeiro - 4);
  const pulso = interpolate((frame - primeiro) % passo, [0, 5], [1.08, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 36, marginTop: 70, opacity: aparece }}>
      <div
        style={{
          fontFamily: FONTE,
          fontSize: 240,
          fontWeight: 700,
          lineHeight: 1,
          letterSpacing: '-0.04em',
          color: escuro ? '#fff' : COR.tinta,
          fontVariantNumeric: 'tabular-nums',
          transform: `scale(${frame >= primeiro && numero < 7 ? pulso : 1})`,
          transformOrigin: 'left center',
        }}
      >
        {numero}ª
      </div>
      <div style={{ fontFamily: FONTE, fontSize: 30, fontWeight: 600, letterSpacing: '0.1em', lineHeight: 1.35, color: COR.suave }}>
        “ÚLTIMA”
        <br />
        ONDA DO DIA
      </div>
      {Array.from({ length: 7 }, (_, i) => (
        <Sfx key={i} nome="tick" em={primeiro + i * passo} volume={0.45} />
      ))}
    </div>
  );
}

/** 06: energia desce, humor sobe. */
function Medidores() {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [30, 84], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: CHEGADA });
  const aparece = useEntrada(22);
  const barras = [
    { nome: 'ENERGIA', valor: 0.95 - 0.77 * p, cor: COR.tinta },
    { nome: 'HUMOR', valor: 0.3 + 0.7 * p, cor: COR.coral },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 44, marginTop: 110, opacity: aparece }}>
      {barras.map((b) => (
        <div key={b.nome}>
          <div style={{ fontFamily: FONTE, fontSize: 26, fontWeight: 600, letterSpacing: '0.14em', color: COR.suave, marginBottom: 14 }}>{b.nome}</div>
          <div style={{ height: 34, borderRadius: 17, background: COR.borda, overflow: 'hidden' }}>
            <div style={{ width: `${b.valor * 100}%`, height: '100%', borderRadius: 17, background: b.cor }} />
          </div>
        </div>
      ))}
      <Sfx nome="riser" em={30} volume={0.35} />
    </div>
  );
}

function Fecho() {
  const frame = useCurrentFrame();
  const botao = useEntrada(40);
  const logo = interpolate(frame, [62, 78], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: CHEGADA });
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: ESQ, right: DIR - 40, top: 640 }}>
        <Titulo texto={'O que ficou\nfaltando?'} em={8} tamanho={140} peso={700} cor="#fff" />
      </div>
      <div
        style={{
          position: 'absolute',
          left: ESQ,
          top: 1010,
          padding: '22px 40px',
          borderRadius: 999,
          background: COR.coral,
          fontFamily: FONTE,
          fontSize: 50,
          fontWeight: 600,
          color: COR.tinta,
          transform: `scale(${botao})`,
          transformOrigin: 'left center',
        }}
      >
        Comenta a sua.
      </div>
      <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 470, opacity: logo }}>
        <Logo tamanho={48} em={62} cor="#fff" />
      </AbsoluteFill>
      <Sfx nome="pop" em={40} volume={0.6} />
      <Sfx nome="brilho" em={64} volume={0.5} />
    </AbsoluteFill>
  );
}
