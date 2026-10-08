/**
 * GIF do Andy "bad boy": renderiza os quadros transparentes (GifAndyBadBoy) e
 * monta dois GIFs com o ffmpeg, um transparente (figurinha) e um sobre o fundo
 * claro da marca.
 *
 * Uso: npm run andy:gif → out/andy/gifs/andy-bad-boy.gif e andy-bad-boy-transparente.gif
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const saida = join(RAIZ, 'out', 'andy', 'gifs');
const quadros = join(saida, 'quadros');
rmSync(quadros, { recursive: true, force: true });
mkdirSync(saida, { recursive: true });

// Com shell (o npx no Windows é .cmd), o caminho vai entre aspas: a pasta do projeto tem espaços.
execFileSync('npx', ['remotion', 'render', 'andy-gif-bad-boy', `"${quadros}"`, '--sequence', '--image-format=png'], { cwd: RAIZ, stdio: 'inherit', shell: true });

const entrada = join(quadros, 'element-%02d.png');
const paleta = 'fps=25,scale=480:-1:flags=lanczos,split[a][b];[a]palettegen=reserve_transparent=1:stats_mode=full[p];[b][p]paletteuse=alpha_threshold=128:dither=none';
execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', '30', '-i', entrada, '-vf', paleta, '-loop', '0', join(saida, 'andy-bad-boy-transparente.gif')], { stdio: 'inherit' });

const sobreFundo =
  '[0][1]overlay=shortest=1,fps=25,scale=480:-1:flags=lanczos,split[a][b];[a]palettegen=stats_mode=full[p];[b][p]paletteuse=dither=sierra2_4a';
execFileSync(
  'ffmpeg',
  ['-v', 'error', '-y', '-f', 'lavfi', '-i', 'color=c=0xf5f5f5:s=600x630:r=30', '-framerate', '30', '-i', entrada, '-filter_complex', sobreFundo, '-loop', '0', join(saida, 'andy-bad-boy.gif')],
  { stdio: 'inherit' },
);
console.log(`  ${join(saida, 'andy-bad-boy.gif')}\n  ${join(saida, 'andy-bad-boy-transparente.gif')}`);
