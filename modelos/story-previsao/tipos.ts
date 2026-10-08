/** Dados do modelo story-previsao (gerados por modelos/story-previsao/dados.ts). */

/** Vento em relação à praia; `fraco` = abaixo de 5 nós, seja de onde for. */
export type TipoVento = 'fraco' | 'terral' | 'cruzado' | 'maral';

/** Médias da janela da manhã de um dia. Rumos em graus, DE ONDE vem. */
export interface DiaPrevisao {
  data: string;
  sigla: string;
  nome: string;
  altura: number;
  alturaSwell: number;
  periodo: number;
  swellDirecao: number;
  swellCardeal: string;
  ventoKn: number;
  ventoDirecao: number;
  ventoCardeal: string;
  tipoVento: TipoVento;
  /** kW/m (≈ 0,49·Hs²·T). */
  potencia: number;
}

export interface PicoFimDeSemana {
  uf: string;
  nome: string;
  cidade: string;
  dias: DiaPrevisao[];
  /** Índice em `dias` do dia com mais mar e melhor vento. */
  melhorDia: number;
}

export interface PrevisaoFimDeSemana {
  geradoEm: string;
  janela: string;
  picos: PicoFimDeSemana[];
}
