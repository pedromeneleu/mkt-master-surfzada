/**
 * Monta public/pecas/<slug>/ para renderizar uma peça:
 *
 * 1. Copia pecas/<slug>/assets/ (arquivos leves que estão no git).
 * 2. Traz do Drive ($MKT_DRIVE) o que está no assets.json da peça: copia, ou
 *    converte vídeo com o ffmpeg quando o item tem `converter`.
 *
 * Só copia/converte o que falta ou mudou (tamanho/data); --todos refaz tudo.
 * No fim, lista o que não foi achado no Drive.
 *
 * Uso: npm run assets -- <peca> [--todos]
 *      npm run assets -- --todas          (todas as peças)
 */
import { spawnSync } from 'node:child_process';
import { copyFileSync, cpSync, existsSync, globSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { basename, dirname, join, relative } from 'node:path';

import { acharPeca, argumentos, type Asset, type Conversao, lerAssets, listarPecas, pastaDrive, PASTA_PUBLIC, type Peca, RAIZ } from './lib/pecas';

const { posicionais, flags } = argumentos();
const refazer = Boolean(flags.todos);

/** HLG/BT.2020 (iPhone) → SDR BT.709 com tonemap hable (o mobius deixava tudo lavado). */
const HDR_PARA_SDR = 'zscale=t=linear:npl=203,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv';

function precisa(origem: string, destino: string): boolean {
  if (refazer || !existsSync(destino)) return true;
  const o = statSync(origem);
  const d = statSync(destino);
  return o.mtimeMs > d.mtimeMs || (o.isFile() && o.size !== d.size);
}

function converter(origem: string, destino: string, c: Conversao): void {
  const escala = c.orientacao === 'deitado' ? 'scale=1920:1080:flags=lanczos' : 'scale=1080:1920:flags=lanczos';
  const filtros = [c.hdr ? HDR_PARA_SDR : null, escala, 'format=yuv420p'].filter(Boolean).join(',');
  const args = [
    '-v', 'error', '-y',
    ...(c.corte ? ['-ss', String(c.corte[0]), '-to', String(c.corte[1])] : []),
    '-i', origem,
    '-vf', filtros,
    ...(c.audio ? ['-c:a', 'aac', '-b:a', '192k'] : ['-an']),
    '-map_metadata', '-1',
    '-c:v', 'libx264', '-crf', '14', '-preset', 'slow',
    '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709',
    '-movflags', '+faststart',
    destino,
  ];
  const r = spawnSync('ffmpeg', args, { stdio: 'inherit' });
  if (r.error) throw new Error('ffmpeg não encontrado no PATH (ver docs/01-setup.md)');
  if (r.status !== 0) throw new Error(`ffmpeg falhou em ${origem}`);
}

/** Resolve a origem no Drive: arquivo, pasta (termina em /) ou padrão com * no nome. */
function resolverOrigem(drive: string, a: Asset): string[] {
  const caminho = join(drive, a.origem);
  if (a.origem.includes('*')) return globSync(a.origem, { cwd: drive }).map((p) => join(drive, p));
  return existsSync(caminho) ? [caminho] : [];
}

function trazerDoDrive(peca: Peca, drive: string, destinoPeca: string): string[] {
  const faltando: string[] = [];
  for (const a of lerAssets(peca.pasta)) {
    const origens = resolverOrigem(drive, a);
    if (origens.length === 0) {
      faltando.push(`${a.origem}${a.nota ? `  (${a.nota})` : ''}`);
      continue;
    }
    for (const origem of origens) {
      const pastaDestino = a.destino.endsWith('/');
      const destino = pastaDestino ? join(destinoPeca, a.destino, a.origem.endsWith('/') ? '' : basename(origem)) : join(destinoPeca, a.destino);
      if (statSync(origem).isDirectory()) {
        const novos = readdirSync(origem, { recursive: true }).length;
        if (!refazer && existsSync(destino) && readdirSync(destino, { recursive: true }).length === novos) continue;
        mkdirSync(destino, { recursive: true });
        cpSync(origem, destino, { recursive: true });
        console.log(`  pasta  ${a.origem} → ${relative(RAIZ, destino)}`);
        continue;
      }
      if (!precisa(origem, destino)) continue;
      mkdirSync(dirname(destino), { recursive: true });
      if (a.converter) {
        console.log(`  ffmpeg ${relative(drive, origem)} → ${relative(RAIZ, destino)}`);
        converter(origem, destino, a.converter);
      } else {
        copyFileSync(origem, destino);
        console.log(`  cópia  ${relative(drive, origem)} → ${relative(RAIZ, destino)}`);
      }
    }
  }
  return faltando;
}

function montar(peca: Peca, drive: string | null): string[] {
  console.log(`\n${peca.slug}`);
  const destinoPeca = join(PASTA_PUBLIC, 'pecas', peca.slug);
  mkdirSync(destinoPeca, { recursive: true });
  const leves = join(peca.pasta, 'assets');
  if (existsSync(leves)) {
    cpSync(leves, destinoPeca, { recursive: true });
    console.log(`  git    assets/ → ${relative(RAIZ, destinoPeca)}`);
  }
  if (lerAssets(peca.pasta).length === 0) return [];
  if (!drive) return lerAssets(peca.pasta).map((a) => a.origem);
  return trazerDoDrive(peca, drive, destinoPeca).map((f) => `${peca.slug}: ${f}`);
}

const pecas = flags.todas ? listarPecas() : [acharPeca(posicionais[0])];
const precisaDrive = pecas.some((p) => lerAssets(p.pasta).length > 0);
const drive = precisaDrive ? pastaDrive() : null;
const faltando = pecas.flatMap((p) => montar(p, drive));

if (faltando.length) {
  console.log(`\n⚠ Não achei no Drive (${drive}):\n  ${faltando.join('\n  ')}`);
  console.log('\nConfira o assets.json da peça e se o Drive para computador terminou de sincronizar.');
  process.exitCode = 1;
} else {
  console.log('\nPronto.');
}
