import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

import { Sfx } from '@compartilhado/componentes/Sfx';
import { Logo } from '@compartilhado/marca/Marca';
import { Titulo } from '@compartilhado/marca/Texto';
import { CHEGADA, COR, FONTE, SAIDA } from '@compartilhado/tema';

import { Credito, Foto, FundoTinta } from './componentes';
import { FOTOS } from './fotos';
import { MARGEM } from './tema';

export type PropsVeredito = {
  decisao: 'aceitou' | 'negou';
  /** % de SIM na enquete do story. `null` mostra "XX%" (falta o número real). */
  porcentagemSim: number | null;
};

const TEXTOS = {
  aceitou: { decisao: 'A WSL *aceitou*.\nJohn John está\nem Pipeline.', fecho: 'Pipeline ficou mais\ndifícil pros *brasileiros*.' },
  negou: { decisao: 'A WSL *negou*.\nSem John John\nem Pipeline.', fecho: 'Caminho livre?\nPipeline *nunca* é.' },
};

const LARGURA_UTIL = 1080 - MARGEM * 2;
const SAI = 282;

/**
 * Reel do veredito (~12 s): carimbo, foto + decisão, barra da enquete e o fecho.
 * Área segura do Reels: entre y≈250 e y≈1580, e longe da borda direita embaixo.
 */
export function Veredito({ decisao, porcentagemSim }: PropsVeredito) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const textos = TEXTOS[decisao];

  const carimbo = spring({ frame: frame - 6, fps, config: { damping: 11, stiffness: 180 } });
  const foto = interpolate(frame, [36, 56], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: CHEGADA });
  const saida = interpolate(frame, [SAI, SAI + 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: SAIDA });
  const logo = interpolate(frame, [SAI + 34, SAI + 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: CHEGADA });

  return (
    <AbsoluteFill style={{ fontFamily: FONTE, color: COR.superficie }}>
      <FundoTinta />
      <AbsoluteFill style={{ opacity: 1 - saida, transform: `translateY(${saida * -40}px)` }}>
        <div
          style={{
            position: 'absolute',
            left: MARGEM,
            top: 270,
            transform: `scale(${2.2 - 1.2 * carimbo}) rotate(-6deg)`,
            transformOrigin: 'left center',
            opacity: Math.min(1, carimbo * 2),
            border: `6px solid ${COR.coral}`,
            color: COR.coral,
            padding: '8px 28px',
            fontSize: 92,
            fontWeight: 700,
            letterSpacing: '0.06em',
          }}
        >
          VEREDITO
        </div>
        <div style={{ position: 'absolute', left: 0, top: 460, clipPath: `inset(0 ${(1 - foto) * 100}% 0 0)` }}>
          <Foto src={FOTOS.praia.src} largura={1080} altura={560} foco="55% 40%" zoom={0.08} />
        </div>
        <Titulo
          texto={textos.decisao}
          em={60}
          tamanho={82}
          cor={COR.superficie}
          estilo={{ position: 'absolute', left: MARGEM, top: 1060, width: LARGURA_UTIL }}
        />
        <Enquete em={140} porcentagem={porcentagemSim} />
        <div style={{ opacity: foto }}>
          <Credito texto={FOTOS.praia.credito} baixo={880} />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', gap: 80 }}>
        <Titulo texto={textos.fecho} em={SAI + 10} tamanho={88} cor={COR.superficie} alinhar="center" />
        <div style={{ opacity: logo }}>
          <Logo tamanho={48} em={SAI + 34} cor={COR.superficie} />
        </div>
      </AbsoluteFill>
      <Sfx nome="impacto" em={8} />
      <Sfx nome="whoosh-curto" em={36} />
      <Sfx nome="pop" em={150} />
      <Sfx nome="whoosh" em={SAI} />
    </AbsoluteFill>
  );
}

/** Barra com a % de SIM da enquete, enchendo da esquerda para a direita. */
function Enquete({ em, porcentagem }: { em: number; porcentagem: number | null }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const aparece = spring({ frame: frame - em, fps, config: { damping: 200 } });
  const enche = interpolate(frame, [em + 8, em + 44], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: CHEGADA });
  const alvo = porcentagem ?? 50;
  const numero = porcentagem === null ? 'XX' : String(Math.round(alvo * enche));
  return (
    <div style={{ position: 'absolute', left: MARGEM, top: 1360, width: LARGURA_UTIL, opacity: aparece, transform: `translateY(${(1 - aparece) * 30}px)` }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
        <span style={{ fontSize: 96, fontWeight: 700, color: COR.coral, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.03em' }}>{numero}%</span>
        <span style={{ fontSize: 38, fontWeight: 500, opacity: 0.85 }}>de vocês votaram SIM</span>
      </div>
      <div style={{ marginTop: 16, height: 26, borderRadius: 13, background: 'rgba(255,255,255,0.14)', overflow: 'hidden' }}>
        <div
          style={{
            width: `${alvo * enche}%`,
            height: '100%',
            borderRadius: 13,
            background:
              porcentagem === null ? `repeating-linear-gradient(45deg, ${COR.coral} 0 14px, rgba(255,122,89,0.45) 14px 28px)` : COR.coral,
          }}
        />
      </div>
    </div>
  );
}
