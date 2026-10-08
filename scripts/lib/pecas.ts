/**
 * Base da CLI: caminhos do projeto, .env, leitura e validação das peças
 * (pecas/<slug>/post.md e assets.json). Todos os scripts usam daqui.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse, stringify } from 'yaml';
import { z } from 'zod';

export const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const PASTA_PECAS = join(RAIZ, 'pecas');
export const PASTA_MODELOS = join(RAIZ, 'modelos');
export const PASTA_PUBLIC = join(RAIZ, 'public');
export const PASTA_OUT = join(RAIZ, 'out');

// ---------------------------------------------------------------------------
//  .env (sem dependência: KEY=valor, # comentário)
// ---------------------------------------------------------------------------

export function carregarEnv(): void {
  const arquivo = join(RAIZ, '.env');
  if (!existsSync(arquivo)) return;
  for (const linha of readFileSync(arquivo, 'utf8').split(/\r?\n/)) {
    const m = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (!m || m[2] === '') continue;
    process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, '');
  }
}
carregarEnv();

/** Pasta do Drive (MKT_DRIVE). Para com uma mensagem clara se não estiver configurada. */
export function pastaDrive(): string {
  const drive = process.env.MKT_DRIVE;
  if (!drive) falhar('Configure MKT_DRIVE no .env (copie de .env.exemplo). Ver docs/01-setup.md.');
  if (!existsSync(drive)) falhar(`MKT_DRIVE aponta para "${drive}", que não existe. O Drive para computador está aberto?`);
  return drive;
}

export const API_URL = () => process.env.API_URL ?? 'https://api.surfzada.com.br/api';

export function falhar(mensagem: string): never {
  console.error(`\n✖ ${mensagem}\n`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
//  post.md
// ---------------------------------------------------------------------------

export const STATUS = ['ideia', 'producao', 'revisao', 'aprovado', 'publicado', 'arquivado'] as const;
export const FORMATOS = ['story-9x16', 'reel-9x16', 'carrossel-1x1', 'carrossel-4x5', 'video-16x9', 'outro'] as const;
const data = z
  .union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'use AAAA-MM-DD'), z.date().transform((d) => d.toISOString().slice(0, 10))])
  .nullable();

export const RenderSchema = z.object({
  /** id da <Composition>/<Still> registrada em composicoes.tsx. */
  composicao: z.string(),
  /** Nome do arquivo em out/<slug>/ (convenção: surfzada-<nome>-<variante>-<proporção>.<ext>). */
  arquivo: z.string().regex(/^[a-z0-9][a-z0-9.-]*\.(mp4|png|jpg|jpeg|gif)$/, 'kebab-case, sem acento, com extensão mp4/png/jpg/gif'),
  /** Imagem parada (remotion still). Deduzido da extensão se omitido. */
  still: z.boolean().optional(),
  /** Frame do still (padrão 0). */
  frame: z.number().int().optional(),
  /** Escala do render (2 = dobro da resolução). */
  escala: z.number().positive().optional(),
  /** Copia o resultado para public/pecas/<slug>/<caminho> (ex.: capa usada dentro do story). */
  copiar_para_public: z.string().optional(),
  /** Parâmetros extras para o `remotion render`/`still` (ex.: ["--crf=12"]). */
  extras: z.array(z.string()).optional(),
});
export type Render = z.infer<typeof RenderSchema>;

export const CarrosselSchema = z.object({
  /** Renderiza cada slide em 2× e reduz com Lanczos (mais nítido que renderizar direto em 1080). */
  master: z.boolean().default(false),
  /** Os slides na ordem do post. Still vira PNG; Composition vira MP4 + PNG de um quadro. */
  slides: z
    .array(
      z.object({
        composicao: z.string(),
        /** Quadro do PNG de um slide em vídeo (padrão: o último). */
        quadro_png: z.number().int().optional(),
      }),
    )
    .min(1),
});
export type Carrossel = z.infer<typeof CarrosselSchema>;

export const PostSchema = z.object({
  titulo: z.string().min(1),
  slug: z.string().regex(/^\d{4}-\d{2}-[a-z0-9]+(-[a-z0-9]+)*$/, 'AAAA-MM-nome-em-kebab-case'),
  serie: z.string().nullable().default(null),
  modelo: z.string().default('proprio'),
  formato: z.enum(FORMATOS),
  canais: z.array(z.string()).default(['instagram']),
  status: z.enum(STATUS),
  responsavel: z.string().nullable().default(null),
  publicar_em: data.default(null),
  publicado_em: data.default(null),
  link: z.string().url().nullable().default(null),
  renders: z.array(RenderSchema).default([]),
  /** Carrossel: slides numerados em out/<slug>/carrossel/ (`npm run carrossel`). */
  carrossel: CarrosselSchema.optional(),
});
export type Post = z.infer<typeof PostSchema>;

export interface Peca {
  slug: string;
  pasta: string;
  post: Post;
  /** Corpo do post.md (depois do frontmatter). */
  corpo: string;
}

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

export function lerPost(pasta: string): { post: Post; corpo: string; bruto: Record<string, unknown> } {
  const arquivo = join(pasta, 'post.md');
  if (!existsSync(arquivo)) throw new Error(`falta ${arquivo}`);
  const m = readFileSync(arquivo, 'utf8').match(FRONTMATTER);
  if (!m) throw new Error(`${arquivo}: sem frontmatter (--- ... ---) no topo`);
  const bruto = (parse(m[1]) ?? {}) as Record<string, unknown>;
  const r = PostSchema.safeParse(bruto);
  if (!r.success) {
    const erros = r.error.issues.map((i) => `  - ${i.path.join('.') || '(raiz)'}: ${i.message}`).join('\n');
    throw new Error(`${arquivo}: frontmatter inválido\n${erros}`);
  }
  return { post: r.data, corpo: m[2], bruto };
}

/** Atualiza campos do frontmatter preservando o corpo do post.md. */
export function atualizarPost(pasta: string, campos: Partial<Post>): void {
  const arquivo = join(pasta, 'post.md');
  const m = readFileSync(arquivo, 'utf8').match(FRONTMATTER)!;
  const bruto = { ...(parse(m[1]) as object), ...campos };
  writeFileSync(arquivo, `---\n${stringify(bruto, { lineWidth: 0 }).trimEnd()}\n---\n${m[2]}`);
}

/** Slugs de todas as pastas em pecas/ (que têm post.md). */
export function listarSlugs(): string[] {
  return readdirSync(PASTA_PECAS, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(PASTA_PECAS, d.name, 'post.md')))
    .map((d) => d.name)
    .sort();
}

export function listarPecas(): Peca[] {
  return listarSlugs().map((slug) => {
    const pasta = join(PASTA_PECAS, slug);
    const { post, corpo } = lerPost(pasta);
    return { slug, pasta, post, corpo };
  });
}

/**
 * Acha a peça pelo slug completo ou por um pedaço único dele
 * ("teahupoo" → 2026-10-playlist-teahupoo). Para com a lista se for ambíguo.
 */
export function acharPeca(busca: string | undefined): Peca {
  if (!busca) falhar('Diga qual peça. Ex.: npm run render -- playlist-teahupoo   (lista: npm run pecas)');
  const slugs = listarSlugs();
  const exato = slugs.find((s) => s === busca);
  const candidatos = exato ? [exato] : slugs.filter((s) => s.includes(busca));
  if (candidatos.length === 0) falhar(`Nenhuma peça com "${busca}". Lista: npm run pecas`);
  if (candidatos.length > 1) falhar(`"${busca}" é ambíguo:\n  ${candidatos.join('\n  ')}`);
  const slug = candidatos[0];
  const pasta = join(PASTA_PECAS, slug);
  try {
    const { post, corpo } = lerPost(pasta);
    return { slug, pasta, post, corpo };
  } catch (e) {
    falhar((e as Error).message);
  }
}

/** Argumentos: posicionais e flags (--chave ou --chave=valor). */
export function argumentos(argv = process.argv.slice(2)) {
  const posicionais: string[] = [];
  const flags: Record<string, string | true> = {};
  for (const a of argv) {
    const m = a.match(/^--([^=]+)(?:=(.*))?$/);
    if (m) flags[m[1]] = m[2] ?? true;
    else posicionais.push(a);
  }
  return { posicionais, flags };
}

// ---------------------------------------------------------------------------
//  assets.json
// ---------------------------------------------------------------------------

export const ConversaoSchema = z.object({
  /** Vídeo vertical (1080×1920) ou deitado (1920×1080). */
  orientacao: z.enum(['vertical', 'deitado']).default('vertical'),
  /** Original em HDR (iPhone HLG): faz tonemap para SDR BT.709. */
  hdr: z.boolean().default(true),
  /** Recorte [início, fim] em segundos do original. */
  corte: z.tuple([z.number(), z.number()]).optional(),
  /** Mantém o áudio (padrão: sem áudio). */
  audio: z.boolean().default(false),
});
export type Conversao = z.infer<typeof ConversaoSchema>;

export const AssetSchema = z.object({
  /** Caminho relativo a $MKT_DRIVE. Aceita * no nome do arquivo (ex.: pecas/x/fotos/*.jpg). */
  origem: z.string(),
  /** Pasta (terminada em /) ou arquivo dentro de public/pecas/<slug>/. */
  destino: z.string(),
  /** Converte vídeo com ffmpeg em vez de copiar. */
  converter: ConversaoSchema.optional(),
  /** Para que serve (aparece no aviso quando falta). */
  nota: z.string().optional(),
});
export type Asset = z.infer<typeof AssetSchema>;

export const AssetsSchema = z.object({ arquivos: z.array(AssetSchema).default([]) });

export function lerAssets(pasta: string): Asset[] {
  const arquivo = join(pasta, 'assets.json');
  if (!existsSync(arquivo)) return [];
  const r = AssetsSchema.safeParse(JSON.parse(readFileSync(arquivo, 'utf8')));
  if (!r.success) throw new Error(`${arquivo}: ${r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`);
  return r.data.arquivos;
}
