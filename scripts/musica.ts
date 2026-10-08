/**
 * Analisa a trilha de uma peça para sincronizar o vídeo com ela:
 * andamento (BPM), instante da primeira batida e energia de cada compasso —
 * é pela energia que se acham a entrada da banda, as quedas e os picos.
 *
 * A trilha fica em public/pecas/<slug>/ (trazida do Drive por `npm run assets`).
 * Saída: pecas/<slug>/dados/musica.json + tabela no terminal.
 * Uso:   npm run musica -- <peca> [arquivo]    (padrão: musica.wav|mp3|m4a)
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { acharPeca, argumentos, falhar, RAIZ } from './lib/pecas';

const { posicionais } = argumentos();
const peca = acharPeca(posicionais[0]);
const PUBLIC_PECA = join(RAIZ, 'public', 'pecas', peca.slug);
const TAXA = 22_050;
const SALTO = 256; // ~11,6 ms por quadro de análise
const JANELA = 1024;

const nome = posicionais[1] ?? ['musica.wav', 'musica.mp3', 'musica.m4a'].find((n) => existsSync(join(PUBLIC_PECA, n)));
if (!nome || !existsSync(join(PUBLIC_PECA, nome))) falhar(`Trilha não encontrada em public/pecas/${peca.slug}/ (rode npm run assets -- ${peca.slug})`);

// Decodifica com o ffmpeg que vem com o Remotion: mono, 22 kHz, PCM 16 bits.
// Caminhos relativos à raiz: no Windows o npx passa pelo shell e quebra em espaços.
mkdirSync(join(RAIZ, 'out'), { recursive: true });
const temp = join(RAIZ, 'out', 'musica-analise.wav');
execFileSync('npx', ['remotion', 'ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', `public/pecas/${peca.slug}/${nome}`, '-ac', '1', '-ar', String(TAXA), '-c:a', 'pcm_s16le', 'out/musica-analise.wav'], {
  cwd: RAIZ,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});
const bruto = readFileSync(temp).subarray(44);
rmSync(temp);
const sinal = new Float32Array(bruto.length / 2);
for (let i = 0; i < sinal.length; i++) sinal[i] = bruto.readInt16LE(i * 2) / 32768;
const duracao = sinal.length / TAXA;

// ---------------------------------------------------------------------------
//  Fluxo espectral (quanto o espectro "cresce" de um quadro para o outro)
// ---------------------------------------------------------------------------

function fft(re: Float64Array, im: Float64Array): void {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }
  for (let tam = 2; tam <= n; tam <<= 1) {
    const ang = (-2 * Math.PI) / tam;
    for (let i = 0; i < n; i += tam) {
      for (let k = 0; k < tam / 2; k++) {
        const wr = Math.cos(ang * k);
        const wi = Math.sin(ang * k);
        const a = i + k;
        const b = a + tam / 2;
        const tr = re[b] * wr - im[b] * wi;
        const ti = re[b] * wi + im[b] * wr;
        re[b] = re[a] - tr;
        im[b] = im[a] - ti;
        re[a] += tr;
        im[a] += ti;
      }
    }
  }
}

const hann = Float64Array.from({ length: JANELA }, (_, i) => 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / JANELA));
const quadros = Math.floor((sinal.length - JANELA) / SALTO);
const fluxo = new Float64Array(quadros);
const rms = new Float64Array(quadros);
let anterior = new Float64Array(JANELA / 2);
for (let q = 0; q < quadros; q++) {
  const re = new Float64Array(JANELA);
  const im = new Float64Array(JANELA);
  let soma = 0;
  for (let i = 0; i < JANELA; i++) {
    const v = sinal[q * SALTO + i];
    re[i] = v * hann[i];
    soma += v * v;
  }
  rms[q] = Math.sqrt(soma / JANELA);
  fft(re, im);
  const mag = new Float64Array(JANELA / 2);
  let f = 0;
  for (let k = 1; k < JANELA / 2; k++) {
    mag[k] = Math.log1p(100 * Math.hypot(re[k], im[k]));
    const d = Math.max(0, mag[k] - anterior[k]);
    f += d;
  }
  fluxo[q] = f;
  anterior = mag;
}

// Tira a tendência lenta (média móvel de ~0,5 s) para sobrar só os ataques.
function realcar(env: Float64Array): Float64Array {
  const r = Math.round(0.25 / (SALTO / TAXA));
  const saida = new Float64Array(env.length);
  let acc = 0;
  for (let i = 0; i < env.length; i++) {
    acc += env[i] - (i > 2 * r ? env[i - 2 * r - 1] : 0);
    const media = acc / Math.min(i + 1, 2 * r + 1);
    saida[i] = Math.max(0, env[i] - media);
  }
  return saida;
}
const ataques = realcar(fluxo);

// ---------------------------------------------------------------------------
//  Andamento: autocorrelação dos ataques, preferindo 70–140 BPM
// ---------------------------------------------------------------------------

const qps = TAXA / SALTO; // quadros por segundo
function autocorr(lag: number): number {
  let s = 0;
  for (let i = lag; i < ataques.length; i++) s += ataques[i] * ataques[i - lag];
  return s;
}
let melhor = { bpm: 0, nota: -Infinity };
for (let bpm = 60; bpm <= 180; bpm += 0.1) {
  const lag = (60 / bpm) * qps;
  const l0 = Math.floor(lag);
  const frac = lag - l0;
  const ac = autocorr(l0) * (1 - frac) + autocorr(l0 + 1) * frac;
  // Peso log-gaussiano centrado em 100 BPM, para não cair no dobro/metade.
  const peso = Math.exp(-0.5 * Math.pow(Math.log2(bpm / 100) / 0.7, 2));
  if (ac * peso > melhor.nota) melhor = { bpm, nota: ac * peso };
}
const bpm = Math.round(melhor.bpm * 10) / 10;

// ---------------------------------------------------------------------------
//  Virada: o maior salto de energia da faixa (a banda entrando). Ela vira a
//  âncora da grade: é o tempo 1 de um compasso e o ponto de sincronia do vídeo.
// ---------------------------------------------------------------------------

function db(a: number, b: number): number {
  let s = 0;
  const i0 = Math.max(0, Math.floor(a * TAXA));
  const i1 = Math.min(sinal.length, Math.floor(b * TAXA));
  for (let i = i0; i < i1; i++) s += sinal[i] * sinal[i];
  return 10 * Math.log10(s / Math.max(1, i1 - i0) + 1e-12);
}

let salto = { t: 0, db: -Infinity };
for (let t = 2; t < duracao - 2; t += 0.05) {
  const d = db(t, t + 2) - db(t - 2, t);
  if (d > salto.db) salto = { t, db: d };
}
// Refina até o ataque: a janela de 20 ms que mais sobe perto do salto.
let virada = { t: salto.t, db: -Infinity };
for (let t = salto.t - 0.6; t < salto.t + 0.6; t += 0.005) {
  const d = db(t, t + 0.02) - db(t - 0.06, t);
  if (d > virada.db) virada = { t, db: d };
}

// Batida fina: a grade ancorada na virada que mais coincide com os ataques.
function pontuar(bat: number): number {
  let s = 0;
  for (let t = virada.t % bat; t < duracao; t += bat) {
    const i = Math.round(t * qps);
    s += Math.max(ataques[i - 1] ?? 0, ataques[i] ?? 0, ataques[i + 1] ?? 0);
  }
  return s;
}
const aprox = 60 / bpm;
let batida = aprox;
let nota = -Infinity;
for (let b = aprox * 0.99; b <= aprox * 1.01; b += 0.00002) {
  const n = pontuar(b);
  if (n > nota) [nota, batida] = [n, b];
}

// Fim: último instante com som acima de -45 dB do pico.
const pico = Math.max(...Array.from({ length: Math.floor(duracao / 0.05) }, (_, k) => db(k * 0.05, k * 0.05 + 0.05)));
let fim = duracao;
while (fim > 0 && db(fim - 0.05, fim) < pico - 45) fim -= 0.05;

// ---------------------------------------------------------------------------
//  Energia por compasso (compassos contados a partir da virada)
// ---------------------------------------------------------------------------

const compasso = 4 * batida;
const primeira = virada.t - Math.floor(virada.t / compasso) * compasso;
const compassos: { n: number; t: number; db: number }[] = [];
for (let n = 1, t = primeira; t < duracao; n++, t += compasso) {
  compassos.push({ n, t: Math.round(t * 1000) / 1000, db: Math.round(db(t, t + compasso) * 10) / 10 });
}

const r3 = (v: number) => Math.round(v * 1000) / 1000;
const saida = {
  arquivo: nome,
  duracao: r3(duracao),
  bpm: Math.round((60 / batida) * 100) / 100,
  batida: Math.round(batida * 100000) / 100000,
  virada: r3(virada.t),
  fim: r3(fim),
  compassos,
};
const destino = join(peca.pasta, 'dados', 'musica.json');
mkdirSync(join(peca.pasta, 'dados'), { recursive: true });
writeFileSync(destino, JSON.stringify(saida, null, 2) + '\n');

console.log(`\n${nome}: ${duracao.toFixed(1)} s · ${saida.bpm} BPM · batida ${batida.toFixed(4)} s`);
console.log(`virada (banda entra): ${virada.t.toFixed(3)} s (+${virada.db.toFixed(0)} dB) · fim do som: ${fim.toFixed(2)} s\n`);
const max = Math.max(...compassos.map((c) => c.db));
for (const c of compassos) {
  const barra = '█'.repeat(Math.max(0, Math.round((c.db - max + 30) * 1.5)));
  const ehVirada = Math.abs(c.t - virada.t) < batida / 2 ? '  ◀ virada' : '';
  console.log(`${String(c.n).padStart(3)}  ${c.t.toFixed(2).padStart(7)} s  ${c.db.toFixed(1).padStart(6)} dB  ${barra}${ehVirada}`);
}
console.log(`\nSalvo em ${destino}`);
