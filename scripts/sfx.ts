/**
 * Sintetiza os efeitos sonoros de todas as peças em WAV (44,1 kHz, 16 bits,
 * mono) em public/compartilhado/sfx/. Tudo é gerado por código, sem bancos de
 * terceiros, e o PRNG com semente fixa faz cada execução sair idêntica.
 * Os códigos S-… do Surfzada Explica estão em series/surfzada-explica/sons.md.
 *
 * Para usar numa peça: <Sfx nome="pop" em={30} /> (src/compartilhado/componentes/Sfx.tsx)
 * ou arquivoSfx('pop') (src/compartilhado/util/arquivos.ts).
 *
 * Uso: npm run sfx
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const TAXA = 44_100;
const PASTA = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'compartilhado', 'sfx');

/** PRNG determinístico (mulberry32), para o ruído sair igual em toda geração. */
function criarAleatorio(semente: number): () => number {
  let a = semente >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const amostras = (segundos: number) => new Float32Array(Math.round(segundos * TAXA));

/** Envelope ataque/decaimento exponencial, com `t` em segundos. */
function envelope(t: number, ataque: number, decaimento: number): number {
  if (t < ataque) return t / ataque;
  return Math.exp(-(t - ataque) / decaimento);
}

/** Passa-baixa de um polo com corte variável no tempo (Hz). */
function passaBaixa(sinal: Float32Array, corte: (t: number) => number): Float32Array {
  const saida = new Float32Array(sinal.length);
  let y = 0;
  for (let i = 0; i < sinal.length; i++) {
    const fc = Math.min(corte(i / TAXA), TAXA / 2.2);
    const alfa = 1 - Math.exp((-2 * Math.PI * fc) / TAXA);
    y += alfa * (sinal[i] - y);
    saida[i] = y;
  }
  return saida;
}

/** Passa-alta de um polo (tira o "grave embolado" do ruído). */
function passaAlta(sinal: Float32Array, corte: number): Float32Array {
  const grave = passaBaixa(sinal, () => corte);
  return sinal.map((v, i) => v - grave[i]);
}

/** Reverb simples: alguns ecos amortecidos (comb), o bastante para dar ar. */
function reverb(sinal: Float32Array, cauda: number, mistura: number): Float32Array {
  const extra = Math.round(cauda * TAXA);
  const saida = new Float32Array(sinal.length + extra);
  saida.set(sinal);
  const atrasos = [0.0297, 0.0371, 0.0411, 0.0437].map((s) => Math.round(s * TAXA));
  for (const atraso of atrasos) {
    const ganho = Math.pow(0.001, atraso / TAXA / cauda);
    const linha = new Float32Array(saida.length);
    for (let i = 0; i < saida.length; i++) {
      const anterior = i >= atraso ? linha[i - atraso] : 0;
      linha[i] = (i < sinal.length ? sinal[i] : 0) + anterior * ganho;
      saida[i] += (linha[i] - (i < sinal.length ? sinal[i] : 0)) * (mistura / atrasos.length);
    }
  }
  return saida;
}

/** Normaliza para o pico pedido (dBFS) e aplica fade curto nas pontas contra estalos. */
function finalizar(sinal: Float32Array, picoDb = -3): Float32Array {
  let pico = 0;
  for (const v of sinal) pico = Math.max(pico, Math.abs(v));
  const alvo = Math.pow(10, picoDb / 20);
  const ganho = pico > 0 ? alvo / pico : 1;
  const fade = Math.round(0.004 * TAXA);
  return sinal.map((v, i) => {
    const borda = Math.min(1, i / fade, (sinal.length - 1 - i) / fade);
    return v * ganho * borda;
  });
}

function salvarWav(nome: string, sinal: Float32Array): void {
  const dados = Buffer.alloc(sinal.length * 2);
  sinal.forEach((v, i) => dados.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v)) * 32767), i * 2));
  const cabecalho = Buffer.alloc(44);
  cabecalho.write('RIFF', 0);
  cabecalho.writeUInt32LE(36 + dados.length, 4);
  cabecalho.write('WAVE', 8);
  cabecalho.write('fmt ', 12);
  cabecalho.writeUInt32LE(16, 16);
  cabecalho.writeUInt16LE(1, 20); // PCM
  cabecalho.writeUInt16LE(1, 22); // mono
  cabecalho.writeUInt32LE(TAXA, 24);
  cabecalho.writeUInt32LE(TAXA * 2, 28);
  cabecalho.writeUInt16LE(2, 32);
  cabecalho.writeUInt16LE(16, 34);
  cabecalho.write('data', 36);
  cabecalho.writeUInt32LE(dados.length, 40);
  writeFileSync(join(PASTA, `${nome}.wav`), Buffer.concat([cabecalho, dados]));
  console.log(`  sfx/${nome}.wav  ${(sinal.length / TAXA).toFixed(2)}s`);
}

/** Emenda o fim no começo com um crossfade, para o ambiente tocar em loop sem clique. */
function emLoop(sinal: Float32Array, cruzamento: number): Float32Array {
  const c = Math.round(cruzamento * TAXA);
  const saida = sinal.slice(0, sinal.length - c);
  for (let i = 0; i < c; i++) {
    const k = i / c;
    saida[i] = sinal[i] * k + sinal[sinal.length - c + i] * (1 - k);
  }
  return saida;
}

/** Normaliza sem os fades de ponta (para ambientes em loop). */
function normalizar(sinal: Float32Array, picoDb: number): Float32Array {
  let pico = 0;
  for (const v of sinal) pico = Math.max(pico, Math.abs(v));
  const ganho = pico > 0 ? Math.pow(10, picoDb / 20) / pico : 1;
  return sinal.map((v) => v * ganho);
}

const ruido = (segundos: number, semente: number) => {
  const rnd = criarAleatorio(semente);
  return amostras(segundos).map(() => rnd() * 2 - 1);
};

// ---------------------------------------------------------------------------
//  Movimento e interface (a base é a do trailer)
// ---------------------------------------------------------------------------

function whoosh(duracao: number, semente: number, brilho: number, inverso = false): Float32Array {
  const pico = duracao * (inverso ? 0.8 : 0.45);
  const filtrado = passaBaixa(ruido(duracao, semente), (t) => 250 + brilho * Math.exp(-Math.pow((t - pico) / (duracao * 0.22), 2)));
  return finalizar(
    filtrado.map((v, i) => v * Math.exp(-Math.pow((i / TAXA - pico) / (duracao * (inverso ? 0.35 : 0.28)), 2))),
    -4,
  );
}

function pop(frequencia: number): Float32Array {
  const s = amostras(0.16);
  let fase = 0;
  for (let i = 0; i < s.length; i++) {
    const t = i / TAXA;
    fase += (2 * Math.PI * frequencia * (0.45 + 0.55 * Math.exp(-t / 0.03))) / TAXA;
    s[i] = Math.sin(fase) * envelope(t, 0.002, 0.04);
  }
  return finalizar(s, -5);
}

function tickEm(s: Float32Array, inicio: number, f1: number, f2: number, ganho = 1) {
  const i0 = Math.round(inicio * TAXA);
  for (let i = 0; i < 0.05 * TAXA && i0 + i < s.length; i++) {
    const t = i / TAXA;
    s[i0 + i] += ganho * (Math.sin(2 * Math.PI * f1 * t) + 0.4 * Math.sin(2 * Math.PI * f2 * t)) * Math.exp(-t / 0.004);
  }
}

function tick(): Float32Array {
  const s = amostras(0.05);
  tickEm(s, 0, 3200, 5100);
  return finalizar(s, -9);
}

function impacto(): Float32Array {
  const rnd = criarAleatorio(11);
  const s = amostras(1.6);
  let fase = 0;
  for (let i = 0; i < s.length; i++) {
    const t = i / TAXA;
    fase += (2 * Math.PI * (38 + 50 * Math.exp(-t / 0.08))) / TAXA;
    s[i] = Math.sin(fase) * envelope(t, 0.003, 0.45) + (rnd() * 2 - 1) * Math.exp(-t / 0.03) * 0.35;
  }
  return finalizar(reverb(passaBaixa(s, (t) => 4000 * Math.exp(-t / 0.2) + 200), 1.2, 0.35), -2);
}

function riser(duracao: number): Float32Array {
  const rnd = criarAleatorio(23);
  const s = amostras(duracao);
  let fase = 0;
  for (let i = 0; i < s.length; i++) {
    const p = i / TAXA / duracao;
    fase += (2 * Math.PI * (180 + 1100 * p * p)) / TAXA;
    s[i] = (Math.sin(fase) * 0.35 + (rnd() * 2 - 1) * 0.65) * Math.pow(p, 2.2);
  }
  return finalizar(passaBaixa(s, (t) => 400 + 9000 * Math.pow(t / duracao, 2)), -4);
}

/** Brilho curto de "sacou!": três notas agudas arpejadas. */
function brilhoSacou(): Float32Array {
  const s = amostras(1.1);
  const notas = [1046.5, 1318.5, 1568];
  for (let i = 0; i < s.length; i++) {
    const t = i / TAXA;
    s[i] = notas.reduce((v, f, n) => {
      const t0 = t - n * 0.045;
      return t0 > 0 ? v + Math.sin(2 * Math.PI * f * t0) * envelope(t0, 0.004, 0.22) * (1 - n * 0.15) : v;
    }, 0);
  }
  return finalizar(reverb(s, 0.8, 0.3), -9);
}

/** Contador (odômetro): ticks acelerando e um tick final mais forte. */
function contador(duracao: number): Float32Array {
  const s = amostras(duracao + 0.1);
  let t = 0;
  let passo = 0.11;
  while (t < duracao - 0.05) {
    tickEm(s, t, 2900, 4700, 0.7);
    t += passo;
    passo = Math.max(0.028, passo * 0.9);
  }
  tickEm(s, duracao, 2200, 3600, 1.4);
  return finalizar(s, -8);
}

/** Medidor enchendo: tom subindo, com um tick no topo. */
function medidor(duracao: number): Float32Array {
  const s = amostras(duracao + 0.08);
  let fase = 0;
  for (let i = 0; i < duracao * TAXA; i++) {
    const p = i / TAXA / duracao;
    fase += (2 * Math.PI * (260 + 640 * p)) / TAXA;
    s[i] = (Math.sin(fase) + 0.25 * Math.sin(3 * fase)) * Math.min(1, p * 6) * (0.4 + 0.6 * p);
  }
  tickEm(s, duracao, 3000, 4800, 1.2);
  return finalizar(passaBaixa(s, () => 3500), -10);
}

/** Relógio contando rápido: tique-taque alternado. */
function relogio(batidas: number, intervalo: number): Float32Array {
  const s = amostras(batidas * intervalo + 0.1);
  for (let b = 0; b < batidas; b++) tickEm(s, b * intervalo, b % 2 ? 1700 : 2500, b % 2 ? 2600 : 3900, 0.9);
  return finalizar(s, -9);
}

/** Vídeo congelando: whoosh invertido que corta num clique. */
function congela(): Float32Array {
  const w = whoosh(0.45, 5, 6000, true);
  const s = amostras(0.5);
  s.set(w.slice(0, s.length));
  tickEm(s, 0.44, 1800, 5200, 2);
  return finalizar(s, -5);
}

/** Traço de caneta: ruído agudo com o tremor rápido da ponta no papel. */
function traco(duracao: number): Float32Array {
  const filtrado = passaAlta(passaBaixa(ruido(duracao, 9), () => 5000), 1500);
  return finalizar(
    filtrado.map((v, i) => {
      const t = i / TAXA;
      return v * (0.6 + 0.4 * Math.sin(2 * Math.PI * 17 * t)) * envelope(t, 0.03, duracao * 0.7);
    }),
    -14,
  );
}

// ---------------------------------------------------------------------------
//  Interface do app (trailer)
// ---------------------------------------------------------------------------

/** Clique de mouse: transiente curto + "corpo" agudo que morre rápido. */
function clique(): Float32Array {
  const rnd = criarAleatorio(7);
  const s = amostras(0.08);
  for (let i = 0; i < s.length; i++) {
    const t = i / TAXA;
    const corpo = Math.sin(2 * Math.PI * 2400 * t) * Math.exp(-t / 0.006);
    const estalo = (rnd() * 2 - 1) * Math.exp(-t / 0.0015);
    const segundo = t > 0.035 ? Math.sin(2 * Math.PI * 1900 * (t - 0.035)) * Math.exp(-(t - 0.035) / 0.005) * 0.5 : 0;
    s[i] = corpo * 0.6 + estalo * 0.5 + segundo;
  }
  return finalizar(passaAlta(s, 300), -6);
}

/** Tecla de teclado: batida abafada + estalo de plástico. */
function tecla(semente: number): Float32Array {
  const rnd = criarAleatorio(semente);
  const s = amostras(0.07);
  for (let i = 0; i < s.length; i++) {
    const t = i / TAXA;
    const baque = Math.sin(2 * Math.PI * 180 * t) * Math.exp(-t / 0.01);
    const plastico = (rnd() * 2 - 1) * Math.exp(-t / 0.004);
    s[i] = baque * 0.5 + plastico * 0.8;
  }
  return finalizar(passaBaixa(s, () => 6000), -10);
}

/** Notificação: dois sininhos (Mi6 → Si6) com harmônicos, leve e amigável. */
function notificacao(): Float32Array {
  const s = amostras(0.7);
  const nota = (t: number, f: number) =>
    (Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(2 * Math.PI * f * 2.01 * t)) * envelope(t, 0.004, 0.12);
  for (let i = 0; i < s.length; i++) {
    const t = i / TAXA;
    s[i] = nota(t, 1318.5) * 0.7 + (t > 0.09 ? nota(t - 0.09, 1975.5) : 0);
  }
  return finalizar(reverb(s, 0.5, 0.25), -8);
}

/** Onda do mar: ruído filtrado com uma "arrebentação" que cresce e espalha. */
function onda(duracao: number): Float32Array {
  const rnd = criarAleatorio(31);
  const r = amostras(duracao).map(() => rnd() * 2 - 1);
  const arrebenta = duracao * 0.35;
  const filtrado = passaBaixa(r, (t) => 300 + 2600 * Math.exp(-Math.pow((t - arrebenta) / (duracao * 0.25), 2)));
  return finalizar(
    filtrado.map((v, i) => {
      const t = i / TAXA;
      const sobe = Math.min(1, t / arrebenta);
      const espalha = t > arrebenta ? Math.exp(-(t - arrebenta) / (duracao * 0.35)) : 1;
      return v * sobe * sobe * espalha;
    }),
    -5,
  );
}

/** Brilho de fechamento: acorde maior arpejado com cauda (logo final). */
function brilho(): Float32Array {
  const s = amostras(2.2);
  const notas = [523.25, 659.25, 783.99, 1046.5];
  for (let i = 0; i < s.length; i++) {
    const t = i / TAXA;
    let v = 0;
    notas.forEach((f, n) => {
      const t0 = t - n * 0.06;
      if (t0 > 0) v += Math.sin(2 * Math.PI * f * t0) * envelope(t0, 0.01, 0.6) * (1 - n * 0.12);
    });
    s[i] = v;
  }
  return finalizar(reverb(s, 1.4, 0.4), -6);
}

// ---------------------------------------------------------------------------
//  Andy
// ---------------------------------------------------------------------------

/** Assinatura: dois estalos secos de dentes batendo ("tchac-tchac"). */
function clack(): Float32Array {
  const rnd = criarAleatorio(77);
  const s = amostras(0.3);
  const batida = (t0: number, ganho: number) => {
    const i0 = Math.round(t0 * TAXA);
    for (let i = 0; i < 0.06 * TAXA; i++) {
      const t = i / TAXA;
      const corpo = Math.sin(2 * Math.PI * 1150 * t) * 0.8 + Math.sin(2 * Math.PI * 2380 * t) * 0.5 + Math.sin(2 * Math.PI * 190 * t) * 0.6;
      s[i0 + i] += ganho * (corpo * Math.exp(-t / 0.012) + (rnd() * 2 - 1) * Math.exp(-t / 0.0025) * 0.9);
    }
  };
  batida(0, 1);
  batida(0.085, 0.8);
  return finalizar(reverb(s, 0.25, 0.12), -3);
}

/** Batida de cauda: swish molhado. */
function cauda(): Float32Array {
  const d = 0.4;
  const filtrado = passaBaixa(ruido(d, 13), (t) => 400 + 2400 * Math.sin((Math.PI * t) / d));
  return finalizar(
    filtrado.map((v, i) => {
      const t = i / TAXA;
      return v * Math.sin((Math.PI * t) / d) * (0.7 + 0.3 * Math.sin(2 * Math.PI * 23 * t));
    }),
    -8,
  );
}

/** Pouso: baque grave com um "squish". */
function pouso(): Float32Array {
  const s = amostras(0.45);
  const r = passaBaixa(ruido(0.45, 17), () => 1800);
  let fase = 0;
  for (let i = 0; i < s.length; i++) {
    const t = i / TAXA;
    fase += (2 * Math.PI * (70 + 60 * Math.exp(-t / 0.04))) / TAXA;
    s[i] = Math.sin(fase) * envelope(t, 0.002, 0.09) + r[i] * envelope(t, 0.01, 0.08) * 0.5;
  }
  return finalizar(s, -4);
}

/** Algo pequeno caindo na água: tom descendo + respingo. */
function plop(): Float32Array {
  const s = amostras(0.35);
  const r = passaAlta(ruido(0.35, 19), 1200);
  let fase = 0;
  for (let i = 0; i < s.length; i++) {
    const t = i / TAXA;
    fase += (2 * Math.PI * (180 + 620 * Math.exp(-t / 0.03))) / TAXA;
    s[i] = Math.sin(fase) * envelope(t, 0.001, 0.05) + r[i] * envelope(t, 0.02, 0.07) * 0.35;
  }
  return finalizar(s, -6);
}

/** Bolhas subindo: pequenos pios que sobem de tom. */
function bolhas(): Float32Array {
  const rnd = criarAleatorio(29);
  const s = amostras(0.9);
  for (let b = 0; b < 7; b++) {
    const t0 = rnd() * 0.75;
    const f0 = 350 + rnd() * 500;
    const i0 = Math.round(t0 * TAXA);
    let fase = 0;
    for (let i = 0; i < 0.06 * TAXA && i0 + i < s.length; i++) {
      const t = i / TAXA;
      fase += (2 * Math.PI * f0 * (1 + t * 25)) / TAXA;
      s[i0 + i] += Math.sin(fase) * envelope(t, 0.002, 0.018) * (0.5 + rnd() * 0.5);
    }
  }
  return finalizar(s, -9);
}

// ---------------------------------------------------------------------------
//  Mar e clima (provisórios: trocar por gravações da praia quando houver)
// ---------------------------------------------------------------------------

/** Vento em rajadas. */
function vento(duracao: number, semente: number, forca: number): Float32Array {
  const lfo = (t: number) => 0.55 + 0.45 * Math.sin(2 * Math.PI * 0.13 * t) * Math.sin(2 * Math.PI * 0.071 * t + 1);
  const filtrado = passaBaixa(ruido(duracao, semente), (t) => 250 + forca * lfo(t));
  return filtrado.map((v, i) => v * (0.3 + 0.7 * lfo(i / TAXA)));
}

/** Mar aberto: marulho grave que sobe e desce devagar. */
function marAberto(duracao: number): Float32Array {
  const s = passaBaixa(ruido(duracao, 37), (t) => 380 + 260 * Math.sin(2 * Math.PI * 0.11 * t));
  return normalizar(
    emLoop(s.map((v, i) => v * (0.55 + 0.45 * Math.sin(2 * Math.PI * 0.11 * (i / TAXA)))), 1.5),
    -12,
  );
}

/** Tempestade: vento forte + chuva + ronco grave, com um trovão. */
function tempestade(duracao: number): Float32Array {
  const v = vento(duracao, 41, 1800);
  const chuva = passaAlta(ruido(duracao, 43), 2500);
  const ronco = passaBaixa(ruido(duracao, 47), () => 90);
  const s = v.map((x, i) => x * 0.8 + chuva[i] * 0.12 + ronco[i] * 2.5);
  const trovaoEm = Math.round(duracao * 0.35 * TAXA);
  const t2 = passaBaixa(ruido(3, 53), (t) => 140 + 900 * Math.exp(-t / 0.15));
  for (let i = 0; i < t2.length && trovaoEm + i < s.length; i++) {
    const t = i / TAXA;
    s[trovaoEm + i] += t2[i] * 3 * envelope(t, 0.05, 0.9) * (1 + 0.6 * Math.sin(2 * Math.PI * 6 * t));
  }
  return normalizar(emLoop(s, 1.5), -8);
}

/** Uma arrebentação: cresce, estoura e espalha em espuma. */
function arrebentacao(duracao: number, semente: number): Float32Array {
  const pico = duracao * 0.3;
  const filtrado = passaBaixa(ruido(duracao, semente), (t) => 300 + 3200 * Math.exp(-Math.pow((t - pico) / (duracao * 0.2), 2)) + 600 * Math.exp(-(t - pico) / duracao));
  return finalizar(
    filtrado.map((v, i) => {
      const t = i / TAXA;
      const sobe = Math.min(1, t / pico);
      return v * sobe * sobe * (t > pico ? Math.exp(-(t - pico) / (duracao * 0.4)) : 1);
    }),
    -4,
  );
}

/** Arrebentação ao longe: ronco contínuo com séries a cada ~7 s. */
function arrebentacaoLonge(duracao: number): Float32Array {
  const base = passaBaixa(ruido(duracao, 59), () => 700);
  const s = base.map((v, i) => {
    const t = i / TAXA;
    const serie = Math.pow(0.5 + 0.5 * Math.sin(2 * Math.PI * (t / 7) - 1.2), 3);
    return v * (0.35 + 0.65 * serie);
  });
  return normalizar(emLoop(s, 1.5), -12);
}

/** Debaixo d'água: abafado, com um balanço lento. */
function submerso(duracao: number): Float32Array {
  const s = passaBaixa(ruido(duracao, 61), (t) => 160 + 60 * Math.sin(2 * Math.PI * 0.2 * t));
  return normalizar(emLoop(s, 1.5), -12);
}

mkdirSync(PASTA, { recursive: true });
console.log('Gerando efeitos em public/compartilhado/sfx/');
// Movimento e interface
salvarWav('whoosh', whoosh(0.7, 1, 5200));
salvarWav('whoosh-curto', whoosh(0.35, 2, 7000));
salvarWav('whoosh-grave', whoosh(1.1, 3, 2200));
salvarWav('pop', pop(900));
salvarWav('pop-agudo', pop(1400));
salvarWav('tick', tick());
salvarWav('riser', riser(2));
salvarWav('riser-longo', riser(2.2));
salvarWav('impacto', impacto());
salvarWav('brilho', brilho());
salvarWav('brilho-sacou', brilhoSacou());
salvarWav('clique', clique());
salvarWav('tecla-1', tecla(41));
salvarWav('tecla-2', tecla(42));
salvarWav('tecla-3', tecla(43));
salvarWav('notificacao', notificacao());
salvarWav('onda', onda(3));
// Explica: medidas, Andy, mar e clima
salvarWav('contador', contador(1.8));
salvarWav('medidor', medidor(0.7));
salvarWav('relogio', relogio(16, 0.16));
salvarWav('congela', congela());
salvarWav('traco', traco(0.7));
salvarWav('clack', clack());
salvarWav('cauda', cauda());
salvarWav('pouso', pouso());
salvarWav('plop', plop());
salvarWav('bolhas', bolhas());
salvarWav('vento', normalizar(emLoop(vento(13.5, 67, 900), 1.5), -12));
salvarWav('mar-aberto', marAberto(13.5));
salvarWav('tempestade', tempestade(13.5));
salvarWav('arrebentacao-1', arrebentacao(3, 71));
salvarWav('arrebentacao-2', arrebentacao(2.6, 73));
salvarWav('arrebentacao-3', arrebentacao(3.4, 79));
salvarWav('arrebentacao-longe', arrebentacaoLonge(15.5));
salvarWav('submerso', submerso(11.5));
