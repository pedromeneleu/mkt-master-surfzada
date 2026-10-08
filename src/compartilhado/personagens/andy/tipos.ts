/**
 * O Andy (um tubarão-tigre) é um boneco articulado: tudo o que ele faz
 * (expressão, fala, pose, corrida, nado) é um conjunto de números. Assim dá
 * para misturar, interpolar e sincronizar com a narração, em vez de trocar
 * desenhos prontos.
 *
 * Espaço do desenho: origem no chão, entre os lobos da cauda (os "pés"); y
 * cresce para baixo. Em pé, o Andy tem ~270 unidades de altura e olha para a
 * direita no perfil. Na vista `nado` ele fica na horizontal, nadando para a
 * direita.
 */

export type Vista = 'frente' | 'perfil' | 'costas' | 'nado';

/** Forma base do olho. As emoções vêm da combinação com sobrancelha, pálpebra e boca. */
export type FormaOlho = 'aberto' | 'arregalado' | 'feliz' | 'fechado';

export type Efeito = 'lagrima' | 'suor' | 'raiva' | 'ideia';

export interface Boca {
  /** 0 = fechado, 1 = aberto ao máximo. */
  abertura: number;
  /** 1 = normal; < 1 boca estreita (O, U), > 1 boca larga (E, I). */
  largura: number;
  /** -1 = cantos para baixo (triste), 0 = neutro, 1 = sorriso. */
  sorriso: number;
  /** Canto de lado: 1 = sobe só o direito (sorriso de canto), -1 = só o esquerdo. */
  torto: number;
}

export interface Rosto {
  olho: FormaOlho;
  /** 0 = aberto, 1 = fechado. Para piscar e para cara de sono ou desconfiança. */
  palpebra: number;
  /** Escala da pupila: 0,6 no medo, 1,2 no encanto. */
  pupila: number;
  /** Para onde olha, de -1 a 1 em x e y. */
  olhar: [number, number];
  /** Ângulo das sobrancelhas: -1 = raiva (ponta de dentro para baixo), 1 = tristeza ou medo (ponta de dentro para cima). */
  sobrancelha: number;
  /** Altura das sobrancelhas: 1 = levantadas (surpresa), -1 = franzidas. */
  altura: number;
  /** Assimetria: levanta só a sobrancelha direita (dúvida, desconfiança). */
  assimetria: number;
  boca: Boca;
  efeitos: Efeito[];
}

export interface Corpo {
  /** Inclinação do corpo inteiro em graus, girando em torno dos pés. Positivo = para a direita ou para a frente no perfil. */
  inclina: number;
  /** 1 = normal; > 1 estica, < 1 amassa (mantendo o volume). */
  estica: number;
  /** Altura do pulo, para cima. */
  pulo: number;
  /**
   * Barbatanas peitorais (os "braços") em graus, girando no ombro. 0 =
   * repouso, 90 = abertas na horizontal, 160 = para cima. Negativo cruza na
   * frente da barriga. No perfil e no nado: `nadDir` é a do lado da câmera,
   * e positivo leva para trás.
   */
  nadEsq: number;
  nadDir: number;
  /** Deslocamento de cada lobo da cauda, que servem de pés: [para o lado ou para a frente, altura]. */
  peEsq: [number, number];
  peDir: [number, number];
  /** Inclinação da cabeça em graus. */
  cabeca: number;
  /** Cabeça baixa (positivo) ou erguida (negativo): desloca o rosto na vertical. */
  queixo: number;
  /** De frente: vira o rosto e a barriga para um lado (-1 a 1), um quase-3/4. */
  vira: number;
  /** Ângulo da cauda em graus (nado): o batimento que empurra o tubarão. */
  cauda: number;
}
