import { loadFont } from '@remotion/google-fonts/Poppins';
import { Easing } from 'remotion';

/**
 * Tema único da marca: fonte, paleta, curvas e formatos do Instagram.
 * Fonte da paleta: design/design-kit-v2.html (o mesmo do site, web/client/src/app/app.scss).
 * Coisas de uma peça só (trilha, BPM, dados) ficam na pasta da peça, não aqui.
 */

// A mesma fonte do site.
export const { fontFamily: FONTE } = loadFont('normal', {
  weights: ['300', '400', '500', '600', '700'],
  subsets: ['latin', 'latin-ext'],
});

export const FPS = 30;

export const COR = {
  // Design kit v2
  tinta: '#0a0a0a',
  tinta2: '#1c1c1c',
  coral: '#ff7a59',
  /** Coral para texto sobre fundo claro (contraste AA). */
  coralTexto: '#e55a36',
  /** Mesmo tom de `coralTexto`, nome usado nos episódios do Explica. */
  coralEscuro: '#e55a36',
  coralClaro: '#ffe3db',
  sol: '#ffb26b',
  fundo: '#f5f5f5',
  superficie: '#ffffff',
  borda: '#e5e5e5',
  suave: '#737373',
  apagado: '#a3a3a3',
  // Mar: os azuis do símbolo antigo (design/logo_simbolo.svg)
  marFundo: '#0a3d62',
  mar: '#1e6091',
  raso: '#0091d5',
  agua: '#48cae4',
  espuma: '#eaf9ff',
  // Andy, o tubarão-tigre mascote: dorso cinza-azulado, listras escuras e barriga clara
  pele: '#5b6f7e',
  listra: '#34434f',
  barriga: '#eef2f4',
  cicatriz: '#c8d3da',
};

/** Curvas: movimento de câmera (entra e sai macio), entradas (desacelera no fim) e saídas. */
export const SUAVE = Easing.bezier(0.65, 0, 0.35, 1);
export const CHEGADA = Easing.bezier(0.16, 1, 0.3, 1);
export const SAIDA = Easing.bezier(0.7, 0, 0.84, 0);

/** Formatos do Instagram (largura × altura em px). Ver docs/05-render-e-entrega.md. */
export const FORMATOS = {
  'story-9x16': { width: 1080, height: 1920 },
  'reel-9x16': { width: 1080, height: 1920 },
  'carrossel-1x1': { width: 1080, height: 1080 },
  'carrossel-4x5': { width: 1080, height: 1350 },
  'video-16x9': { width: 1920, height: 1080 },
} as const;
export type Formato = keyof typeof FORMATOS;
