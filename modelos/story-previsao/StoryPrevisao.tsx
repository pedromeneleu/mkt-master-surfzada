import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

import { FundoClaro, Simbolo, Wordmark } from '@compartilhado/marca/Marca';
import { COR, FONTE, SUAVE } from '@compartilhado/tema';

import type { DiaPrevisao, PicoFimDeSemana, PrevisaoFimDeSemana, TipoVento } from './tipos';

/**
 * Stories de previsão — 9:16, sem trilha (a música entra no Instagram).
 *
 * Uma tabela parada desde o primeiro frame: um pico por estado nas linhas e
 * os dias nas colunas, cada coluna com a altura da manhã. A coluna do dia
 * corrente abre (sanfona) e mostra o resto: swell, vento e energia, com uma
 * ondulação desenhada pela altura e pelo período. O dia corre do primeiro ao
 * último, todas as linhas juntas; no fim, cada linha vai para o seu melhor
 * dia, em cascata.
 *
 * Modelo: a peça chama `criarStory({ dados, titulo, ... })` em composicoes.tsx, com o
 * dados.json gerado por `npm run dados -- <peca>` (ver README.md deste modelo).
 */

export interface OpcoesStory {
  dados: PrevisaoFimDeSemana;
  /** Quadros por dia no ciclo. */
  quadrosPorDia: number;
  /** Onde começa a primeira linha e a altura de cada uma. */
  topoLinhas: number;
  alturaLinha: number;
  /** Título grande, abaixo do sobretítulo com as datas. */
  titulo: React.ReactNode;
  /** Sobretítulo antes das datas ("PREVISÃO · 5 A 10 DE OUT"). */
  sobretitulo: string;
  /** Legenda do final, depois da estrela. */
  legendaFinal: string;
  /** Altura mostrada: 'onda' = altura total (Hs), 'swell' = só a do swell. */
  altura?: 'onda' | 'swell';
}

const FINAL = 165;
/** Duração da troca de coluna e o atraso entre linhas no final (cascata). */
const TROCA = 16;
const CASCATA = 5;

// Grade: as faixas de cima e de baixo ficam livres para a interface do story.
const MARGEM = 40;
const VAO = 12;
const INFO = 262;
const COLUNAS = 1080 - 2 * MARGEM - INFO - 14;

const num = (x: number, casas = 1) => x.toFixed(casas).replace('.', ',');
const ROTULO_VENTO: Record<TipoVento, string> = { fraco: 'fraco', terral: 'terral', cruzado: 'cruzado', maral: 'maral' };
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

/** Média ponderada de um valor dos dias. */
const misturar = (pesos: number[], dias: DiaPrevisao[], f: (d: DiaPrevisao) => number) =>
  pesos.reduce((s, w, i) => s + w * f(dias[i]), 0);

/** Média ponderada de rumos: a seta gira pelo caminho mais curto. */
function misturarRumo(pesos: number[], graus: number[]): number {
  const s = pesos.reduce((a, w, i) => a + w * Math.sin((graus[i] * Math.PI) / 180), 0);
  const c = pesos.reduce((a, w, i) => a + w * Math.cos((graus[i] * Math.PI) / 180), 0);
  return (Math.atan2(s, c) * 180) / Math.PI;
}

// ---------------------------------------------------------------------------
//  Ícones
// ---------------------------------------------------------------------------

/** Seta apontando para onde vai (rumo), a partir de onde vem (`de`, graus). */
function Seta({ de, tamanho = 30, cor = COR.tinta }: { de: number; tamanho?: number; cor?: string }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="-12 -12 24 24" style={{ transform: `rotate(${de + 180}deg)`, flexShrink: 0 }}>
      <path d="M0 -10 L7 2 L1.6 0.4 L1.6 10 L-1.6 10 L-1.6 0.4 L-7 2 Z" fill={cor} />
    </svg>
  );
}

function Raio({ tamanho = 30 }: { tamanho?: number }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <path d="M13.5 1 L4 13.5 H11 L9.5 23 L20 9.5 H12.8 Z" fill={COR.tinta} />
    </svg>
  );
}

// ---------------------------------------------------------------------------
//  Ondulação da lente: altura = amplitude, período = comprimento e velocidade
// ---------------------------------------------------------------------------

function Ondulacao({ largura, altura, periodo }: { largura: number; altura: number; periodo: number }) {
  const frame = useCurrentFrame();
  const amplitude = 3 + altura * 4;
  const comprimento = periodo * 18;
  const fase = (frame * periodo * 0.22) / comprimento;
  const caminho = (deslocamento: number) =>
    Array.from({ length: 61 }, (_, i) => {
      const x = (i / 60) * largura;
      const y = 30 - Math.sin(2 * Math.PI * (x / comprimento - fase - deslocamento)) * amplitude;
      return `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');
  return (
    <svg width={largura} height={44} style={{ position: 'absolute', left: 0, bottom: 0, overflow: 'visible' }}>
      <path d={`${caminho(0)} L${largura} 60 L0 60 Z`} fill="rgba(255,122,89,0.14)" />
      <path d={caminho(0)} fill="none" stroke="rgba(255,122,89,0.5)" strokeWidth={2.5} strokeLinecap="round" />
    </svg>
  );
}

function Metrica({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 34, whiteSpace: 'nowrap' }}>
      <span style={{ width: 90, fontSize: 17, fontWeight: 600, letterSpacing: '0.12em', color: COR.suave }}>{rotulo}</span>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
//  Fábrica: o mesmo story para qualquer janela de dias
// ---------------------------------------------------------------------------

export function criarStory({ dados: D, quadrosPorDia: DIA, topoLinhas: TOPO_LINHAS, alturaLinha: ALTURA_LINHA, titulo, sobretitulo, legendaFinal, altura: qualAltura = 'onda' }: OpcoesStory) {
  const alturaDe = (d: DiaPrevisao) => (qualAltura === 'swell' ? d.alturaSwell : d.altura);
  const N = D.picos[0].dias.length;
  const duracao = N * DIA + FINAL;
  // Com muitos dias, a coluna aberta estreita um pouco e as fechadas usam número menor.
  const ATIVA = N > 4 ? 380 : 404;
  const INATIVA = (COLUNAS - ATIVA) / (N - 1);
  const ESTREITA = INATIVA < 80;
  const FONTE_COLUNA = ESTREITA ? 30 : 34;
  const BARRA_MAX = ALTURA_LINHA < 226 ? 98 : 104;
  const ALTURA_MAX = Math.max(...D.picos.flatMap((p) => p.dias.map(alturaDe)));

  /** Peso de cada coluna (somam 1) no quadro `f`, para a linha `linha`. */
  function pesos(f: number, linha: number, melhor: number): number[] {
    const estados = [...Array.from({ length: N }, (_, k) => ({ em: k * DIA, col: k })), { em: N * DIA + linha * CASCATA, col: melhor }];
    let p: number[] = Array.from({ length: N }, (_, i) => (i === estados[0].col ? 1 : 0));
    for (const e of estados.slice(1)) {
      const t = interpolate(f, [e.em, e.em + TROCA], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: SUAVE });
      p = p.map((v, i) => v * (1 - t) + (i === e.col ? t : 0));
    }
    return p;
  }

  function Linha({ pico, indice }: { pico: PicoFimDeSemana; indice: number }) {
    const frame = useCurrentFrame();
    const p = pesos(frame, indice, pico.melhorDia);
    const larguras = p.map((w) => INATIVA + (ATIVA - INATIVA) * w);
    const esquerdas = larguras.map((_, i) => larguras.slice(0, i).reduce((a, b) => a + b, 0));
    const lente = p.reduce((s, w, i) => s + w * esquerdas[i], 0);
    const dominante = p.indexOf(Math.max(...p));

    const altura = misturar(p, pico.dias, alturaDe);
    const periodo = misturar(p, pico.dias, (d) => d.periodo);
    const swell = misturarRumo(p, pico.dias.map((d) => d.swellDirecao));
    const vento = misturarRumo(p, pico.dias.map((d) => d.ventoDirecao));
    const ventoKn = misturar(p, pico.dias, (d) => d.ventoKn);
    const potencia = misturar(p, pico.dias, (d) => d.potencia);
    const dia = pico.dias[dominante];

    // No final, a lente ganha o selo de melhor dia.
    const emFinal = N * DIA + indice * CASCATA;
    const selo = interpolate(frame, [emFinal + TROCA - 4, emFinal + TROCA + 6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const topo = TOPO_LINHAS + indice * (ALTURA_LINHA + VAO);

    return (
      <div
        style={{
          position: 'absolute',
          left: MARGEM,
          right: MARGEM,
          top: topo,
          height: ALTURA_LINHA,
          borderRadius: 30,
          background: COR.superficie,
          border: `2px solid ${COR.borda}`,
          boxShadow: '0 12px 30px rgba(10,10,10,0.05)',
          fontFamily: FONTE,
          color: COR.tinta,
        }}
      >
        {/* Pico */}
        <div style={{ position: 'absolute', left: 26, top: 0, bottom: 0, width: INFO - 30, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10 }}>
          <span
            style={{
              alignSelf: 'flex-start',
              padding: '4px 14px',
              borderRadius: 999,
              background: COR.tinta,
              color: '#fff',
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: '0.1em',
            }}
          >
            {pico.uf}
          </span>
          {/* Nome de uma palavra só e comprido (Itamambuca) não cabe a 38 px. */}
          <span style={{ fontSize: pico.nome.length >= 10 && !pico.nome.includes(' ') ? 33 : 38, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>{pico.nome}</span>
          <span style={{ fontSize: 23, color: COR.suave }}>{pico.cidade}</span>
        </div>

        {/* Colunas dos dias */}
        <div style={{ position: 'absolute', left: INFO, top: 10, bottom: 10, width: COLUNAS }}>
          {pico.dias.map((d, i) => {
            const visivel = interpolate(p[i], [0, 0.55], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            const barra = (alturaDe(d) / ALTURA_MAX) * BARRA_MAX;
            return (
              <div
                key={d.data}
                style={{
                  position: 'absolute',
                  left: esquerdas[i],
                  width: larguras[i],
                  top: 0,
                  bottom: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: 8,
                  paddingBottom: 8,
                  opacity: visivel,
                }}
              >
                <span style={{ fontSize: FONTE_COLUNA, fontWeight: 600, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                  {num(alturaDe(d))}
                  {/* Nas colunas estreitas o "m" sai: a lente e a legenda já dizem a unidade. */}
                  {!ESTREITA && <small style={{ fontSize: FONTE_COLUNA * 0.6, fontWeight: 500, marginLeft: 3, color: COR.suave }}>m</small>}
                </span>
                <span style={{ width: Math.min(54, INATIVA - 16), height: barra, borderRadius: 14, background: '#d4d4d4' }} />
                <span style={{ fontSize: 20, fontWeight: 600, letterSpacing: '0.12em', color: COR.suave }}>{d.sigla}</span>
              </div>
            );
          })}

          {/* Lente: a coluna aberta, com todas as métricas do dia */}
          <div
            style={{
              position: 'absolute',
              left: lente + 4,
              width: ATIVA - 8,
              top: 0,
              bottom: 0,
              borderRadius: 24,
              background: COR.coralClaro,
              overflow: 'hidden',
            }}
          >
            <Ondulacao largura={ATIVA - 8} altura={altura} periodo={periodo} />
            <div style={{ position: 'absolute', inset: '12px 18px 0 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <span style={{ fontSize: 62, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1, color: COR.coralTexto, fontVariantNumeric: 'tabular-nums' }}>
                  {num(altura)}
                  <small style={{ fontSize: 28, fontWeight: 500, marginLeft: 4 }}>m</small>
                </span>
                <span style={{ position: 'relative', marginTop: 4 }}>
                  <span style={{ fontSize: 20, fontWeight: 600, letterSpacing: '0.12em', color: COR.coralTexto, opacity: 1 - selo }}>{dia.sigla}</span>
                  <span
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: -4,
                      whiteSpace: 'nowrap',
                      padding: '4px 12px',
                      borderRadius: 999,
                      background: COR.coral,
                      color: '#fff',
                      fontSize: 19,
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      opacity: selo,
                      transform: `scale(${0.7 + 0.3 * selo})`,
                      transformOrigin: 'right center',
                    }}
                  >
                    ★ {dia.sigla}
                  </span>
                </span>
              </div>
              <Metrica rotulo="SWELL">
                <Seta de={swell} />
                <span style={{ fontSize: 26, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
                  {num(periodo)} s <span style={{ color: COR.suave }}>· {dia.swellCardeal}</span>
                </span>
              </Metrica>
              <Metrica rotulo="VENTO">
                <Seta de={vento} />
                <span style={{ fontSize: 26, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
                  {num(ventoKn, 0)} kn <span style={{ color: COR.suave }}>· {ROTULO_VENTO[dia.tipoVento]}</span>
                </span>
              </Metrica>
              <Metrica rotulo="ENERGIA">
                <Raio />
                <span style={{ fontSize: 26, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
                  {num(potencia)} <small style={{ fontSize: 19, color: COR.suave }}>kW/m</small>
                </span>
              </Metrica>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function Story() {
    const frame = useCurrentFrame();
    const dias = D.picos[0].dias;
    const [, mes, inicio] = dias[0].data.split('-').map(Number);
    const fim = Number(dias[N - 1].data.split('-')[2]);
    const final = interpolate(frame, [N * DIA, N * DIA + 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const baseLinhas = TOPO_LINHAS + D.picos.length * (ALTURA_LINHA + VAO);

    return (
      <AbsoluteFill style={{ fontFamily: FONTE, color: COR.tinta }}>
        <FundoClaro />

        {/* Cabeçalho */}
        <div style={{ position: 'absolute', top: 236, left: MARGEM + 6, right: MARGEM, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 25, fontWeight: 600, letterSpacing: '0.16em', color: COR.coralTexto }}>
            <span style={{ width: 46, height: 3, borderRadius: 2, background: COR.coral }} />
            {sobretitulo} · {inicio} A {fim} DE {MESES[mes - 1].toUpperCase()}
          </div>
          {titulo}
        </div>

        {D.picos.map((pico, i) => (
          <Linha key={pico.uf} pico={pico} indice={i} />
        ))}

        {/* Rodapé: legenda (troca para a do melhor dia no final) e marca */}
        <div style={{ position: 'absolute', top: baseLinhas + 6, left: MARGEM + 6, right: MARGEM + 6, height: 30, fontSize: 21, color: COR.suave }}>
          <span style={{ position: 'absolute', left: 0, opacity: 1 - final }}>{qualAltura === 'swell' ? 'Altura do swell, média ' : 'Médias '}da manhã ({D.janela}) · setas: rumo do swell e do vento</span>
          <span style={{ position: 'absolute', left: 0, opacity: final }}>
            <span style={{ color: COR.coralTexto, fontWeight: 600 }}>★</span> {legendaFinal}
          </span>
        </div>
        <div
          style={{
            position: 'absolute',
            top: baseLinhas + 52,
            left: MARGEM + 6,
            right: MARGEM + 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Simbolo largura={82} em={-100} />
            <Wordmark tamanho={40} />
          </div>
          <span style={{ fontSize: 26, fontWeight: 500, color: COR.tinta }}>
            previsão completa em <span style={{ fontWeight: 600, color: COR.coralTexto }}>surfzada.com.br</span>
          </span>
        </div>
      </AbsoluteFill>
    );
  }

  return { Story, duracao };
}

