/**
 * Clipes e decupagem do edit cinemático de Saquarema (junho/2026).
 * Material: Drive "Captações/SAQUAREMA-0626". A conversão de cada clipe (HDR → SDR, recorte)
 * está no assets.json da peça, gerado a partir desta lista; se mudar um clipe aqui, mude lá.
 */

export type Clipe = {
  arquivo: string;
  /** Horizontal (1920×1080). Se não, vertical 1080×1920. */
  deitado?: boolean;
  /** Já é SDR (câmera Canon): não passa pelo tonemap. */
  sdr?: boolean;
  /** Recorte [início, fim] em segundos do original, para não converter o clipe inteiro. */
  corte?: [number, number];
};

export const CLIPES = {
  // O começo refeito pelo usuário no CapCut (4K SDR, já com as faixas pretas): 0–9 s.
  refactor: { arquivo: 'refactor.mp4', sdr: true, corte: [0, 9] },
  // Só praia e galera (a festa e os shows à noite saíram na v3). Fora também o IMG_6577/6562
  // (onda quebrando vista do morro), que já foi usado no reels do meme.
  atletas2: { arquivo: 'IMG_6552.MOV' }, // 4K60, atletas indo pra água
  atletas1: { arquivo: 'IMG_6551.MOV' }, // 4K60, atletas + galera na areia
  fotografos: { arquivo: 'IMG_6494.MOV' }, // 4K60, a galera vendo a bateria (refaz o 9:16 do refactor)
  torcida: { arquivo: 'IMG_6554.MOV' }, // 4K60, atleta saindo do mar com a galera atrás (0–8 s); mãos pro alto no pódio (10–17 s)
  multidao: { arquivo: 'IMG_7912.MOV' }, // 4K60, a praia lotada
  guardasois: { arquivo: 'IMG_6553.MOV' }, // 4K60, atletas e depois os guarda-sóis verdes (~4,5 s)
  cachorro: { arquivo: 'MVI_8979.MOV', deitado: true, sdr: true }, // cocker vindo pra câmera
  saindo: { arquivo: 'MVI_8987.MOV', deitado: true, sdr: true, corte: [0, 4] }, // surfista saindo do mar
  areia: { arquivo: 'MVI_8983.MOV', deitado: true, sdr: true }, // tartaruga de areia (~10 s), menina sorrindo (~16 s)
  close: { arquivo: 'MVI_8981.MOV', deitado: true, sdr: true, corte: [0, 4] }, // close na areia
  banco: { arquivo: 'MVI_8688.MOV', deitado: true, sdr: true, corte: [30, 40] }, // morro com o banco, alguém olhando o mar
} satisfies Record<string, Clipe>;

export type IdClipe = keyof typeof CLIPES;
