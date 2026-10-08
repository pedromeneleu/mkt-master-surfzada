/**
 * Contrato entre a captura (Playwright) e o vídeo (Remotion). A captura grava
 * `src/dados/manifesto.json` com este formato; as cenas leem as posições dos
 * elementos daqui para saber onde dar zoom, por onde o cursor passa etc.
 */

/** Retângulo em pixels CSS do viewport da captura (não em pixels da imagem). */
export interface Caixa {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Captura {
  /** Caminho relativo a `public/` (usar com `staticFile`). */
  arquivo: string;
  /** Viewport em pixels CSS. */
  largura: number;
  altura: number;
  /** deviceScaleFactor da captura (a imagem tem largura × escala pixels). */
  escala: number;
  caixas: Record<string, Caixa>;
}

/** Recorte de um único elemento (gráfico, cartão), para animar solto na cena. */
export interface Recorte {
  arquivo: string;
  largura: number;
  altura: number;
  escala: number;
}

export interface Condicoes {
  alturaOnda: string;
  swell: string;
  periodo: string;
  vento: string;
}

/** Análise da trilha (`npm run musica`): grade de batidas ancorada na virada. */
export interface Musica {
  arquivo: string;
  duracao: number;
  bpm: number;
  /** Segundos por batida. */
  batida: number;
  /** Onde a banda entra (tempo 1 de um compasso) — o ponto de sincronia. */
  virada: number;
  /** Último instante com som. */
  fim: number;
  /** Início (s) e energia (dB) de cada compasso. */
  compassos: { n: number; t: number; db: number }[];
}

/** Capturas das features de energia (`npm run captura:energia` → src/dados/energia.json). */
export interface CapturaEnergia {
  geradoEm: string;
  pico: { id: string; nome: string; cidade: string };
  /** Gráfico "Energia e potência", rolado até o máximo da semana. */
  grafico: Recorte;
  /** O mesmo gráfico com a coluna do máximo realçada (ponteiro em cima). */
  graficoGuia: Recorte;
  /** Balão da coluna do máximo; `x`/`y` relativos ao gráfico. */
  balao: Recorte & { x: number; y: number };
  /** Onde o ponteiro estava, relativo ao gráfico. */
  ponteiro: { x: number; y: number };
  /** Seção Timeline Pico na camada Direções (antes do toque em Energia). */
  direcoes: Recorte;
  /** Seção Timeline Pico na camada Energia, um quadro por instante (3 h). */
  quadros: { arquivo: string; rotulo: string }[];
  /** Tamanho da seção (pixels CSS), igual para todos os quadros. */
  largura: number;
  altura: number;
  /** Caixas relativas à seção (`escala` = legenda de cores do mapa). */
  caixas: Record<'chipEnergia' | 'mapa' | 'trilho' | 'escala', Caixa>;
  /** Caixas relativas ao gráfico: barras visíveis, linha da média e legenda. */
  caixasGrafico: { barras: Caixa; media: Caixa | null; legenda: Caixa };
}

export interface Manifesto {
  geradoEm: string;
  pico: { id: string; nome: string; cidade: string };
  condicoes: Condicoes;
  /** Todos os picos cadastrados, para o mapa de pontos da cena de prova. */
  picos: { lat: number; lng: number }[];
  totalEstados: number;
  desktop: Record<string, Captura>;
  mobile: Record<string, Captura>;
  recortes: Record<string, Recorte>;
  /** Surfistas fictícios que confirmam presença na cena de sessões. */
  galera: { nome: string; avatar: string }[];
}

