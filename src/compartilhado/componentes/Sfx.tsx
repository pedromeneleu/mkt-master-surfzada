import { Html5Audio, Sequence } from 'remotion';

import { arquivoSfx } from '../util/arquivos';

/** Efeitos gerados por `npm run sfx` (scripts/sfx.ts). */
export type NomeSfx =
  | 'whoosh'
  | 'whoosh-curto'
  | 'whoosh-grave'
  | 'clique'
  | 'pop'
  | 'pop-agudo'
  | 'tick'
  | 'tecla-1'
  | 'tecla-2'
  | 'tecla-3'
  | 'impacto'
  | 'riser'
  | 'notificacao'
  | 'onda'
  | 'brilho';

/**
 * Com trilha por baixo, os efeitos descem ~3 dB para não brigar com ela.
 * Todas as peças com `Sfx` hoje têm trilha (no vídeo ou colada no Instagram).
 */
export const VOLUME_SFX = 0.7;

/** Toca um efeito no frame `em` da cena. */
export function Sfx({ nome, em, volume = 0.7 }: { nome: NomeSfx; em: number; volume?: number }) {
  return (
    <Sequence from={Math.round(em)} layout="none" name={`sfx:${nome}`}>
      <Html5Audio src={arquivoSfx(nome)} volume={volume * VOLUME_SFX} />
    </Sequence>
  );
}

/** Rajada de teclas a partir de `em` (digitação), alternando as três amostras. */
export function Digitacao({ em, teclas, intervalo = 3, volume = 0.45 }: { em: number; teclas: number; intervalo?: number; volume?: number }) {
  const nomes: NomeSfx[] = ['tecla-1', 'tecla-2', 'tecla-3'];
  return (
    <>
      {Array.from({ length: teclas }, (_, i) => (
        <Sfx key={i} nome={nomes[(i * 7) % 3]} em={em + i * intervalo} volume={volume} />
      ))}
    </>
  );
}
