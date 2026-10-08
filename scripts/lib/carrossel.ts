/**
 * Render dos slides de um carrossel (campo `carrossel` do post.md) em
 * out/<slug>/carrossel/: NN-<composicao>.png e, para slides em vídeo, .mp4.
 *
 * Com `master: true`, cada slide é renderizado em 2× (out/<slug>/carrossel/2160/,
 * CRF 12) e reduzido para o tamanho do post com Lanczos (CRF 14, -tune film):
 * sai mais nítido do que renderizar direto em 1080, porque o Chrome reduz as
 * imagens com um filtro mais mole.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer';

import { falhar, PASTA_OUT, type Peca } from './pecas';

const ffmpeg = (...a: string[]) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...a], { stdio: 'inherit' });

export async function renderizarCarrossel(serveUrl: string, peca: Peca, opcoes: { soPng?: boolean; ids?: string[] } = {}) {
  const c = peca.post.carrossel;
  if (!c) falhar(`A peça ${peca.slug} não tem "carrossel" no post.md.`);
  const saida = join(PASTA_OUT, peca.slug, 'carrossel');
  const master = join(saida, '2160');
  mkdirSync(c.master ? master : saida, { recursive: true });

  for (const [i, slide] of c.slides.entries()) {
    if (opcoes.ids?.length && !opcoes.ids.some((id) => slide.composicao.includes(id))) continue;
    const composition = await selectComposition({ serveUrl, id: slide.composicao });
    const nome = `${String(i + 1).padStart(2, '0')}-${slide.composicao}`;
    const ehVideo = composition.durationInFrames > 1;
    const quadro = ehVideo ? (slide.quadro_png ?? composition.durationInFrames - 1) : 0;
    const reduz = `scale=${composition.width}:${composition.height}:flags=lanczos+accurate_rnd+full_chroma_int`;

    if (c.master) {
      await renderStill({ serveUrl, composition, frame: quadro, scale: 2, output: join(master, `${nome}.png`) });
      ffmpeg('-i', join(master, `${nome}.png`), '-vf', reduz, join(saida, `${nome}.png`));
    } else {
      await renderStill({ serveUrl, composition, frame: quadro, output: join(saida, `${nome}.png`) });
    }
    console.log(`  ${nome}.png`);
    if (!ehVideo || opcoes.soPng) continue;

    if (c.master) {
      await renderMedia({
        serveUrl, composition, scale: 2, codec: 'h264', crf: 12, x264Preset: 'slow', pixelFormat: 'yuv420p', imageFormat: 'png',
        outputLocation: join(master, `${nome}.mp4`),
      });
      ffmpeg(
        '-i', join(master, `${nome}.mp4`), '-vf', reduz,
        '-c:v', 'libx264', '-crf', '14', '-preset', 'slow', '-tune', 'film', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an',
        join(saida, `${nome}.mp4`),
      );
    } else {
      await renderMedia({
        serveUrl, composition, codec: 'h264', crf: 16, pixelFormat: 'yuv420p', imageFormat: 'png',
        outputLocation: join(saida, `${nome}.mp4`),
      });
    }
    console.log(`  ${nome}.mp4`);
  }
  return saida;
}
