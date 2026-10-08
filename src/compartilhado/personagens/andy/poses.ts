import type { Corpo } from './tipos';

export const CORPO_PADRAO: Corpo = {
  inclina: 0,
  estica: 1,
  pulo: 0,
  // Queixo erguido e peito aberto: postura de quem não se intimida.
  nadEsq: 0,
  nadDir: 0,
  peEsq: [-4, 0],
  peDir: [4, 0],
  cabeca: 0,
  queixo: -2,
  vira: 0,
  cauda: 0,
};

const pose = (c: Partial<Corpo>): Corpo => ({ ...CORPO_PADRAO, ...c });

/** Poses paradas, de frente. As do perfil têm o sufixo `Perfil`. */
export const POSES = {
  parado: pose({}),
  apontando: pose({ nadDir: 118, cabeca: 6, vira: 0.35 }),
  apontandoCima: pose({ nadDir: 168, nadEsq: 14, cabeca: -4, queixo: -3 }),
  apresentando: pose({ nadDir: 70, nadEsq: 20, vira: 0.2, cabeca: 4 }),
  comemorando: pose({ nadEsq: 150, nadDir: 150, estica: 1.05, queixo: -4 }),
  acenando: pose({ nadDir: 145, cabeca: 5, vira: 0.15 }),
  pensando: pose({ nadEsq: -72, nadDir: 10, cabeca: -7, vira: -0.2 }),
  confiante: pose({ nadEsq: 28, nadDir: 28, estica: 1.03, queixo: -4 }),
  bracosCruzados: pose({ nadEsq: -62, nadDir: -62, estica: 1.02, queixo: -4, cabeca: 4 }),
  encolhido: pose({ nadEsq: -35, nadDir: -35, estica: 0.9, queixo: 4 }),
  desanimado: pose({ nadEsq: 2, nadDir: 2, estica: 0.95, cabeca: -6, queixo: 8 }),
  bravo: pose({ nadEsq: 40, nadDir: 40, estica: 1.04, peEsq: [-6, 0], peDir: [6, 0] }),
  surfando: pose({ nadEsq: 85, nadDir: 60, estica: 0.88, inclina: -8, cabeca: 8, peEsq: [-16, 0], peDir: [16, 0] }),
  apontandoPerfil: pose({ nadDir: -115 }),
  paradoPerfil: pose({ nadDir: 10, nadEsq: 10 }),
} satisfies Record<string, Corpo>;

export type NomePose = keyof typeof POSES;
