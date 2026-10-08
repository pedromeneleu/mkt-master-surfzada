import { AbsoluteFill, OffthreadVideo, Sequence, interpolate, useCurrentFrame } from 'remotion';

import { Logo } from '@compartilhado/marca/Marca';
import { FONTE, FPS } from '@compartilhado/tema';
import { arquivosDaPeca } from '@compartilhado/util/arquivos';

import { CLIPES, type IdClipe } from './clipes';

export const SLUG = '2026-10-saquarema-cinematico';
/** Clipes convertidos por `npm run assets` em public/pecas/2026-10-saquarema-cinematico/clipes/. */
const arquivo = arquivosDaPeca(SLUG);

/**
 * Edit cinemático de Saquarema (junho/2026), 9:16, sem som.
 * A música entra no Instagram: "Loser", do Tame Impala, a 83 BPM.
 *
 * Os primeiros 9 s são o refactor do usuário (Drive: pecas/2026-10-saquarema-cinematico/refactor.mp4,
 * editado no CapCut): costão 0–4 s, onda 4–7,53 s. A galera (7,53–9 s) foi refeita na janela 16:9.
 * O resto entra com os cortes e enquadramentos dele. Depois vem a montagem, um corte por batida a
 * 83 BPM a partir dos 9 s, na mesma janela 16:9 que ele usou.
 * Roteiro e decupagem no post.md. Clipes: npm run assets -- saquarema (converte do Drive).
 */
export const BPM = 83;
const BATIDA_S = 60 / BPM;

/** Fim do refactor do usuário (9,0 s): a grade de batidas do resto começa aqui. */
const FIM_REFACTOR = Math.round(9.0 * FPS);
/** Frame em que cai a batida `b` do resto (contando do fim do refactor). */
const naBatida = (b: number) => FIM_REFACTOR + Math.round(b * BATIDA_S * FPS);

/** Batidas do resto da montagem, depois do refactor. */
const BATIDAS_RESTO = 14;
export const DURACAO_SAQUAREMA = naBatida(BATIDAS_RESTO);

const W = 1080;
const H = 1920;
/** A janela horizontal no meio da tela vertical: 16:9 na largura toda, como no refactor. */
const JANELA = { w: 1080, h: 608 };
const TOPO_JANELA = (H - JANELA.h) / 2;

const PERGUNTA = 'Você tá muito tranquilo ultimamente.\nTá usando alguma coisa?';
/** Escolhida pelo usuário em vez de "O que tenho usado:", que dava duplo sentido com pessoas e bichos. */
const RESPOSTA = 'Minha dose diária:';
/** A resposta entra no primeiro corte do refactor (a onda, 4 s). */
const RESPOSTA_DE = Math.round(4.0 * FPS);

type Plano = {
  clipe: IdClipe;
  /** Frame em que o plano começa (dura até o próximo). */
  em: number;
  /** Segundo do clipe convertido em que o plano começa. */
  de: number;
  /** < 1 = câmera lenta (os clipes de 60 fps aguentam 0,5). */
  vel?: number;
  /** Ponto do clipe (0–1) que fica no centro da janela. */
  centro?: { x?: number; y?: number };
  zoom?: number;
  /** Empurrão de câmera ao longo do plano (padrão 1 → 1,04). */
  empurrao?: [number, number];
  noite?: boolean;
  /** Tela cheia, sem janela nem empurrão: o refactor, que já vem com as faixas pretas dele. */
  cheia?: boolean;
};

const PLANOS: Plano[] = [
  // 0–7,53 s: o refactor do usuário, do jeito que ele montou (costão e onda).
  { clipe: 'refactor', em: 0, de: 0, cheia: true },
  // 7,53–9 s: a galera do refactor tinha ficado em 9:16 (tela cheia). É o mesmo trecho do IMG_6494
  // (6,75 s, achado por SSIM com os frames do refactor), agora na janela 16:9.
  { clipe: 'fotografos', em: 226, de: 6.75, centro: { y: 0.58 } },
  // Depois dos 9 s, um corte por batida, só praia e galera: o campeonato...
  { clipe: 'atletas2', em: naBatida(0), de: 1.0, centro: { y: 0.6 } },
  { clipe: 'atletas1', em: naBatida(1), de: 0.1, centro: { y: 0.52 } },
  { clipe: 'torcida', em: naBatida(2), de: 4.0, centro: { y: 0.55 } },
  { clipe: 'multidao', em: naBatida(3), de: 2.0, centro: { y: 0.66 } },
  { clipe: 'torcida', em: naBatida(4), de: 14.0, centro: { y: 0.6 } },
  // ...e o dia de praia.
  { clipe: 'cachorro', em: naBatida(5), de: 7.0 },
  { clipe: 'saindo', em: naBatida(6), de: 0.0 },
  { clipe: 'areia', em: naBatida(8), de: 17.0 }, // menina sorrindo pra câmera
  { clipe: 'areia', em: naBatida(9), de: 14.0 }, // tartaruga de areia, sem mão
  { clipe: 'close', em: naBatida(10), de: 0.5 },
  { clipe: 'guardasois', em: naBatida(11), de: 5.0, centro: { y: 0.62 } },
  // Fecha calmo no morro com o banco e o loop volta pro costão do refactor, com a pergunta.
  { clipe: 'banco', em: naBatida(12), de: 3.0 },
];
const ULTIMO = PLANOS[PLANOS.length - 1].em;

export function SaquaremaCinematico() {
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {PLANOS.map((p, i) => {
        const fim = PLANOS[i + 1]?.em ?? DURACAO_SAQUAREMA;
        return (
          <Sequence key={i} from={p.em} durationInFrames={fim - p.em} name={`${(p.em / FPS).toFixed(2)}s · ${p.clipe}`}>
            <PlanoVideo plano={p} duracao={fim - p.em} />
          </Sequence>
        );
      })}
      <Legenda />
      <Marca />
    </AbsoluteFill>
  );
}

function PlanoVideo({ plano, duracao }: { plano: Plano; duracao: number }) {
  const frame = useCurrentFrame();
  const clipe = CLIPES[plano.clipe];
  const deitado = 'deitado' in clipe && clipe.deitado;
  const [sw, sh] = deitado ? [1920, 1080] : [1080, 1920];
  const area = plano.cheia ? { w: W, h: H, top: 0 } : { ...JANELA, top: TOPO_JANELA };

  // Cobre a área, com um empurrão lento de câmera ao longo do plano.
  const empurrao = plano.cheia ? 1 : interpolate(frame, [0, duracao], plano.empurrao ?? [1, 1.04]);
  const s = Math.max(area.w / sw, area.h / sh) * (plano.zoom ?? 1) * empurrao;
  const vw = sw * s;
  const vh = sh * s;
  const cx = plano.centro?.x ?? 0.5;
  const cy = plano.centro?.y ?? 0.5;
  const left = Math.min(0, Math.max(area.w - vw, area.w / 2 - cx * vw));
  const top = Math.min(0, Math.max(area.h - vh, area.h / 2 - cy * vh));

  // Dia: quente e com contraste. Noite: mais fria e escura, puxando pra ref "the drugs".
  // No preto das faixas do refactor o filtro, o véu (soft-light) e o grão não mudam nada.
  const filtro = plano.noite
    ? 'contrast(1.12) saturate(0.92) brightness(0.94)'
    : 'contrast(1.08) saturate(1.1)';

  return (
    <div style={{ position: 'absolute', left: 0, top: area.top, width: area.w, height: area.h, overflow: 'hidden' }}>
      <OffthreadVideo
        src={arquivo(`clipes/${plano.clipe}.mp4`)}
        trimBefore={Math.round(plano.de * FPS)}
        playbackRate={plano.vel ?? 1}
        muted
        style={{ position: 'absolute', left, top, width: vw, height: vh, maxWidth: 'none', filter: filtro }}
      />
      <AbsoluteFill
        style={{
          backgroundColor: plano.noite ? '#2a4a80' : '#ffb070',
          mixBlendMode: 'soft-light',
          opacity: plano.noite ? 0.22 : 0.16,
        }}
      />
      <Grao w={area.w} h={area.h} />
      {!plano.cheia && (
        <AbsoluteFill
          style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.38) 100%)' }}
        />
      )}
    </div>
  );
}

/** Grão de filme: ruído que muda a cada frame. */
function Grao({ w, h }: { w: number; h: number }) {
  const frame = useCurrentFrame();
  return (
    <svg width={w} height={h} style={{ position: 'absolute', inset: 0, opacity: 0.07, mixBlendMode: 'overlay' }}>
      <filter id="grao">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={frame} stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grao)" />
    </svg>
  );
}

/**
 * A frase na faixa preta de cima, logo acima da imagem, como na ref "are you on drugs?".
 * A sombra segura a leitura no plano em tela cheia do refactor, em que o texto cai sobre o céu.
 */
function Legenda() {
  const frame = useCurrentFrame();
  const resposta = frame >= RESPOSTA_DE && frame < ULTIMO;
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: W,
        height: TOPO_JANELA,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingBottom: 30,
      }}
    >
      <div
        style={{
          maxWidth: 860,
          fontFamily: FONTE,
          fontWeight: 600,
          fontSize: 40,
          lineHeight: 1.3,
          color: '#fff',
          textAlign: 'center',
          letterSpacing: -0.2,
          whiteSpace: 'pre-line',
          textShadow: '0 2px 3px rgba(0,0,0,0.45), 0 0 22px rgba(0,0,0,0.3)',
        }}
      >
        {resposta ? RESPOSTA : PERGUNTA}
      </div>
    </div>
  );
}

/**
 * O logo pequeno na faixa preta de baixo, logo abaixo da imagem (espelha a frase de cima).
 * Já desenhado desde o frame 0 (em = -60), sem animação, para o loop não "piscar".
 */
function Marca() {
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: TOPO_JANELA + JANELA.h + 40,
        width: W,
        display: 'flex',
        justifyContent: 'center',
        opacity: 0.92,
      }}
    >
      <Logo tamanho={30} em={-60} cor="#fff" />
    </div>
  );
}
