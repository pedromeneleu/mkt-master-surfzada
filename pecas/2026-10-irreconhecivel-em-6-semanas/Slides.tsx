import type { ReactNode } from 'react';
import { AbsoluteFill, Img } from 'remotion';

import { FundoClaro, FundoEscuro, Logo } from '@compartilhado/marca/Marca';
import { Rotulo, Titulo } from '@compartilhado/marca/Texto';
import { COR, FONTE } from '@compartilhado/tema';
import { arquivosDaPeca } from '@compartilhado/util/arquivos';

export const SLUG = '2026-10-irreconhecivel-em-6-semanas';
const arquivo = arquivosDaPeca(SLUG);

/**
 * Carrossel 4:5 "Como ficar irreconhecível no surf em 6 semanas": capa, comparação
 * "Isso → Pra isso", seis pontos e o fecho. Slides parados: os componentes animados
 * da marca recebem `em` negativo para já estarem inteiros no quadro 0.
 */
const PRONTO = -100;
// A marca é masculina: "o Surfzada", "o app do Surfzada".
const MARGEM = 88;
export const TOTAL = 9;

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

export function Capa() {
  return (
    <Slide n={1} tom="escuro" rotulo="TREINO · 6 SEMANAS">
      <div style={{ marginTop: 210 }}>
        <Titulo texto={'Como ele ficou\n*irreconhecível*\nno surf em\n6 semanas'} em={PRONTO} tamanho={118} peso={700} cor="#fff" />
      </div>
      <div style={{ position: 'absolute', left: MARGEM, right: MARGEM, bottom: MARGEM, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Logo tamanho={40} em={PRONTO} cor="#fff" />
        <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: '0.08em', color: COR.apagado }}>arrasta →</div>
      </div>
    </Slide>
  );
}

function Foto({ src, rotulo, destaque, foco }: { src: string; rotulo: string; destaque?: boolean; foco: string }) {
  return (
    <div style={{ position: 'relative', height: 470, borderRadius: 28, overflow: 'hidden', background: COR.borda }}>
      <Img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: foco }} />
      <div
        style={{
          position: 'absolute',
          left: 28,
          bottom: 28,
          padding: '12px 28px',
          borderRadius: 999,
          background: destaque ? COR.coral : COR.tinta,
          color: destaque ? COR.tinta : '#fff',
          fontSize: 40,
          fontWeight: 700,
          letterSpacing: '-0.02em',
        }}
      >
        {rotulo}
      </div>
    </div>
  );
}

export function Comparacao() {
  return (
    <Slide n={2} tom="claro" rotulo="EM 6 SEMANAS">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        <Foto src={arquivo('fotos/caldo.jpg')} rotulo="Isso" foco="50% 45%" />
        <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width={220} height={96} viewBox="0 0 220 96" style={{ overflow: 'visible' }}>
            <path d="M20 14 C40 86 150 96 196 34" fill="none" stroke={COR.tinta} strokeWidth={7} strokeLinecap="round" />
            <path d="M166 30 L198 30 L196 62" fill="none" stroke={COR.tinta} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <Foto src={arquivo('fotos/batida.jpg')} rotulo="Pra isso" destaque foco="50% 50%" />
      </div>
    </Slide>
  );
}

export type Ponto = { titulo: string; abre: string; chamada: string; itens: string[]; fecha: string; cta?: boolean };

export const PONTOS: Ponto[] = [
  {
    titulo: 'Parou de treinar\ncomo marombeiro.',
    abre: 'Ele pegava pesado e corria atrás de número. Só que o surf não liga pro supino.',
    chamada: 'Passou a treinar:',
    itens: ['Força rotacional', 'Resistência de ombro', 'Explosão de quadril', 'Fôlego pra repetir o esforço'],
    fecha: 'Aí começou a aparecer na água.',
  },
  {
    titulo: 'Construiu um\nmotor de remada.',
    abre: 'Técnica não adianta nada se o fôlego acaba em 20 minutos.',
    chamada: 'Construiu:',
    itens: ['Base aeróbica', 'Ombro que aguenta remar muito', 'Respiração controlada'],
    fecha: 'Hoje surfa mais tempo, sem desespero.',
  },
  {
    titulo: 'Deixou o pop-up\nno automático.',
    abre: 'Antes ele pensava, hesitava, duvidava na hora de levantar.',
    chamada: 'Agora:',
    itens: ['Explosivo', 'Limpo', 'Sem atraso'],
    fecha: 'Repetição fora d’água mudou isso.',
  },
  {
    titulo: 'Parou de\nchutar.',
    abre: 'Treino aleatório = resultado aleatório.',
    chamada: 'Montou um sistema:',
    itens: ['Progressão', 'Registro de cada treino', 'Ajuste toda semana'],
    fecha: 'Isso tirou o ruído da cabeça dele.',
  },
  {
    titulo: 'Confere o app\ndo Surfzada antes\nde sair de casa.',
    abre: 'Nada de viagem perdida nem de chegar com o mar flat.',
    chamada: 'Antes de cair, ele vê:',
    itens: ['Altura e período do swell', 'Direção e força do vento', 'O melhor dia da semana em cada pico'],
    fecha: 'Baixe na App Store',
    cta: true,
  },
  {
    titulo: 'Surfou mais vezes,\nnão mais tempo.',
    abre: 'Uma maratona no fim de semana não segura a evolução.',
    chamada: 'O que funcionou:',
    itens: ['Sessões curtas e frequentes', 'Um foco por sessão', 'Descanso de verdade entre elas'],
    fecha: 'Constância ganha de intensidade.',
  },
];

export function SlidePonto({ i }: { i: number }) {
  const p = PONTOS[i];
  const tom: Tom = i % 2 ? 'escuro' : 'claro';
  const escuro = tom === 'escuro';
  const secundario = escuro ? COR.apagado : COR.suave;
  return (
    <Slide n={i + 3} tom={tom} rotulo={`PONTO ${i + 1} DE ${PONTOS.length}`}>
      <div style={{ fontSize: 150, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.04em', color: COR.coral }}>
        {String(i + 1).padStart(2, '0')}
      </div>
      <div style={{ marginTop: 26 }}>
        <Titulo texto={p.titulo} em={PRONTO} tamanho={76} peso={700} cor={escuro ? '#fff' : COR.tinta} />
      </div>
      <div style={{ marginTop: 34, fontSize: 38, lineHeight: 1.35, color: secundario, maxWidth: 880 }}>{p.abre}</div>
      <div style={{ marginTop: 34, fontSize: 38, fontWeight: 600 }}>{p.chamada}</div>
      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {p.itens.map((item) => (
          <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 22, fontSize: 38, lineHeight: 1.25 }}>
            <span style={{ width: 14, height: 14, borderRadius: 4, flex: 'none', background: escuro ? '#fff' : COR.tinta }} />
            {item}
          </div>
        ))}
      </div>
      <div
        style={{
          position: 'absolute',
          left: MARGEM,
          right: MARGEM,
          bottom: MARGEM,
          paddingTop: 28,
          borderTop: `2px solid ${escuro ? COR.tinta2 : COR.borda}`,
          fontSize: 40,
          fontWeight: 600,
          letterSpacing: '-0.01em',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {p.cta ? (
          <>
            <Logo tamanho={40} em={PRONTO} cor={escuro ? '#fff' : COR.tinta} />
            <span style={{ fontSize: 32, fontWeight: 600 }}>{p.fecha} →</span>
          </>
        ) : (
          p.fecha
        )}
      </div>
    </Slide>
  );
}

export function Fecho() {
  return (
    <Slide n={TOTAL} tom="escuro" rotulo="RESUMINDO">
      <div style={{ marginTop: 160 }}>
        <Titulo texto={'6 semanas não fazem\nninguém profissional.'} em={PRONTO} tamanho={82} peso={600} cor={COR.apagado} />
        <div style={{ marginTop: 30 }}>
          <Titulo texto={'Mas fizeram dele\n*outro* *surfista.*'} em={PRONTO} tamanho={88} peso={700} cor="#fff" />
        </div>
        <div style={{ marginTop: 56, display: 'inline-block', padding: '20px 36px', borderRadius: 999, background: '#fff', color: COR.tinta, fontSize: 40, fontWeight: 600 }}>
          Salva pra começar segunda.
        </div>
        <div style={{ marginTop: 56, padding: '34px 40px', borderRadius: 28, background: COR.tinta2, border: '2px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: '-0.02em', color: '#fff' }}>O app do Surfzada chegou.</div>
          <div style={{ marginTop: 10, fontSize: 32, lineHeight: 1.35, color: COR.apagado }}>Previsão de surf no bolso, antes de cada sessão.</div>
        </div>
      </div>
      <div style={{ position: 'absolute', left: MARGEM, right: MARGEM, bottom: MARGEM, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Logo tamanho={44} em={PRONTO} cor="#fff" />
        <div style={{ textAlign: 'right', lineHeight: 1.35 }}>
          <div style={{ fontSize: 30, fontWeight: 600, color: '#fff' }}>Disponível na App Store</div>
          <div style={{ fontSize: 26, fontWeight: 500, color: COR.apagado }}>e em surfzada.com.br</div>
        </div>
      </div>
    </Slide>
  );
}
