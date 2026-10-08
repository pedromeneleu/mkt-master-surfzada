import { CORPO_PADRAO } from './poses';
import type { Boca, Corpo, Rosto } from './tipos';

const TAU = Math.PI * 2;

/**
 * Ciclos: funções do frame que devolvem o corpo naquele instante. Todos
 * repetem sem emenda; `quadros` é quantos frames dura uma volta.
 */

/** Corrida de perfil: lobos da cauda alternando como pés, corpo quicando duas vezes por volta, barbatanas para trás. */
export function corrida(frame: number, quadros = 12): Corpo {
  const f = (frame / quadros) * TAU;
  return {
    ...CORPO_PADRAO,
    inclina: 12,
    pulo: 7 + 7 * Math.cos(2 * f),
    estica: 1 + 0.05 * Math.cos(2 * f),
    peDir: [Math.sin(f) * 30, Math.max(0, Math.cos(f)) * 24],
    peEsq: [-Math.sin(f) * 30, Math.max(0, -Math.cos(f)) * 24],
    nadDir: 55 + Math.sin(f) * 30,
    nadEsq: 55 - Math.sin(f) * 30,
    queixo: -2,
  };
}

/** Caminhada de frente: gingando de um lobo da cauda para o outro. */
export function caminhada(frame: number, quadros = 18): Corpo {
  const f = (frame / quadros) * TAU;
  const s = Math.sin(f);
  return {
    ...CORPO_PADRAO,
    inclina: s * 7,
    pulo: Math.abs(s) * 3,
    peEsq: [0, Math.max(0, s) * 12],
    peDir: [0, Math.max(0, -s) * 12],
    nadEsq: 14 - s * 8,
    nadDir: 14 + s * 8,
    cabeca: -s * 3,
  };
}

/** Nado (vista `nado`): a cauda bate, o corpo ondula e sobe e desce de leve, as peitorais equilibram. */
export function nado(frame: number, quadros = 24): Corpo {
  const f = (frame / quadros) * TAU;
  return {
    ...CORPO_PADRAO,
    cauda: Math.sin(f) * 16,
    inclina: Math.sin(f - 1) * 2.5,
    pulo: Math.sin(f - 0.5) * 5,
    cabeca: -Math.sin(f) * 2,
    nadDir: 12 + Math.sin(f + 1) * 8,
    nadEsq: 12 - Math.sin(f + 1) * 8,
  };
}

/** Parado, respirando: um sobe e desce quase invisível que evita o boneco "congelado". */
export function respirando(frame: number, base: Corpo = CORPO_PADRAO, quadros = 70): Corpo {
  const s = Math.sin((frame / quadros) * TAU);
  return { ...base, estica: base.estica * (1 + s * 0.012), nadEsq: base.nadEsq + s * 2, nadDir: base.nadDir + s * 2 };
}

/** Acenando: a nadadeira direita vai e volta no alto. */
export function aceno(frame: number, base: Corpo = CORPO_PADRAO, quadros = 10): Corpo {
  return { ...base, nadDir: 140 + Math.sin((frame / quadros) * TAU) * 22, cabeca: 5 };
}

/** Pulo de comemoração: sobe, amassa na chegada ao chão. */
export function pulando(frame: number, base: Corpo = CORPO_PADRAO, quadros = 22): Corpo {
  const t = (frame % quadros) / quadros;
  const noAr = t < 0.7 ? Math.sin((t / 0.7) * Math.PI) : 0;
  const impacto = t >= 0.7 ? Math.sin(((t - 0.7) / 0.3) * Math.PI) : 0;
  return {
    ...base,
    pulo: noAr * 60,
    estica: 1 + noAr * 0.08 - impacto * 0.14,
    nadEsq: 150 - impacto * 30,
    nadDir: 150 - impacto * 30,
  };
}

/** Tremendo de medo: vibração curta e irregular. */
export function tremendo(frame: number, base: Corpo = CORPO_PADRAO): Corpo {
  const r = Math.sin(frame * 2.7) * Math.cos(frame * 1.3);
  return { ...base, inclina: base.inclina + r * 2, pulo: base.pulo + Math.abs(r) * 1.5 };
}

/** Piscar: fecha e abre em 5 frames, a cada ~3 s, com um pouco de irregularidade. */
export function piscar(frame: number, rosto: Rosto, intervalo = 95): Rosto {
  const ciclo = Math.floor(frame / intervalo);
  const inicio = ciclo * intervalo + ((ciclo * 37) % 23);
  const t = frame - inicio;
  if (t < 0 || t > 5) return rosto;
  const fechado = [0.4, 0.9, 1, 0.7, 0.3, 0][t];
  return { ...rosto, palpebra: Math.max(rosto.palpebra, fechado) };
}

/** Troca só o boca de um rosto (para falar mantendo a expressão). */
export const comBoca = (rosto: Rosto, boca: Boca): Rosto => ({ ...rosto, boca });
