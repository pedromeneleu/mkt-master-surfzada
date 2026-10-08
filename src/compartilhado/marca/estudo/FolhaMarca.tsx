import type { ReactNode } from 'react';
import { AbsoluteFill } from 'remotion';

import { COR, FONTE } from '../../tema';
import { Logo, Simbolo, Wordmark } from '../Marca';

/**
 * Folha de referência da marca (não é post): as variações do logo nos fundos da marca,
 * as cores com o hex e o uso, e a tipografia. Tudo sai dos componentes e do tema, então
 * a folha acompanha qualquer mudança neles. Ver docs/07-marca.md.
 */
export const FOLHA_MARCA = { largura: 2400, altura: 4160 };

/** O símbolo anima a partir de `em`; num quadro parado ele tem que estar inteiro. */
const PRONTO = -100;

const MARGEM = 120;
const VAO = 40;
const LARGURA_CELULA = (FOLHA_MARCA.largura - 2 * MARGEM - 2 * VAO) / 3;

type Fundo = { nome: string; fundo: string; cor: string; borda?: boolean };

const FUNDOS: Fundo[] = [
  { nome: 'Fundo claro', fundo: COR.fundo, cor: COR.tinta },
  { nome: 'Branco', fundo: COR.superficie, cor: COR.tinta, borda: true },
  { nome: 'Tinta (fundo escuro)', fundo: COR.tinta, cor: '#fff' },
];

/** Logo empilhado: símbolo em cima e nome embaixo, na proporção do encerramento do trailer. */
export function LogoVertical({ largura, cor }: { largura: number; cor: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: largura * 0.09 }}>
      <Simbolo largura={largura} em={PRONTO} cor={cor} />
      <Wordmark tamanho={largura * 0.4} cor={cor} />
    </div>
  );
}

function Secao({ titulo, nota, children }: { titulo: string; nota?: string; children: ReactNode }) {
  return (
    <div style={{ marginTop: 84 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 28, marginBottom: 28 }}>
        <div style={{ fontSize: 44, fontWeight: 600, letterSpacing: '-0.02em' }}>{titulo}</div>
        {nota && <div style={{ fontSize: 28, color: COR.suave }}>{nota}</div>}
      </div>
      {children}
    </div>
  );
}

function Linha({ altura, desenho, partes = 'onda e nome' }: { altura: number; desenho: (cor: string) => ReactNode; partes?: string }) {
  return (
    <div style={{ display: 'flex', gap: VAO }}>
      {FUNDOS.map((f) => (
        <div key={f.nome} style={{ width: LARGURA_CELULA }}>
          <div
            style={{
              height: altura,
              borderRadius: 28,
              background: f.fundo,
              border: f.borda ? `2px solid ${COR.borda}` : undefined,
              boxShadow: f.borda ? undefined : '0 0 0 2px rgba(10,10,10,0.04)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {desenho(f.cor)}
          </div>
          <div style={{ marginTop: 16, fontSize: 26, color: COR.suave }}>
            {f.nome} · {partes} em {f.cor === COR.tinta ? 'tinta' : 'branco'}
          </div>
        </div>
      ))}
    </div>
  );
}

type Amostra = { token: string; cor: string; uso: string };

function Amostras({ titulo, itens }: { titulo: string; itens: Amostra[] }) {
  return (
    <div style={{ marginTop: 34 }}>
      <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: '0.14em', color: COR.suave, marginBottom: 18 }}>{titulo.toUpperCase()}</div>
      <div style={{ display: 'flex', gap: 24 }}>
        {itens.map((a) => (
          <div key={a.token} style={{ width: (FOLHA_MARCA.largura - 2 * MARGEM - 4 * 24) / 5 }}>
            <div style={{ height: 150, borderRadius: 20, background: a.cor, border: `2px solid ${COR.borda}` }} />
            <div style={{ marginTop: 14, fontSize: 30, fontWeight: 600 }}>{a.token}</div>
            <div style={{ fontSize: 28, fontWeight: 500, color: COR.tinta2, fontVariantNumeric: 'tabular-nums' }}>{a.cor.toUpperCase()}</div>
            <div style={{ marginTop: 4, fontSize: 24, lineHeight: 1.3, color: COR.suave }}>{a.uso}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FolhaMarca() {
  return (
    <AbsoluteFill style={{ background: COR.superficie, fontFamily: FONTE, color: COR.tinta, padding: `${MARGEM}px ${MARGEM}px 0` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 28, fontWeight: 600, letterSpacing: '0.16em', color: COR.coralTexto }}>
            <span style={{ width: 56, height: 4, borderRadius: 2, background: COR.coral }} />
            MARCA
          </div>
          <div style={{ marginTop: 18, fontSize: 96, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1 }}>Logo e cores da Surfzada</div>
        </div>
        <Logo tamanho={64} em={PRONTO} />
      </div>

      <Secao titulo="Logomarca horizontal" nota="símbolo + nome · a versão principal">
        <Linha altura={340} desenho={(cor) => <Logo tamanho={92} em={PRONTO} cor={cor} />} />
      </Secao>

      <Secao titulo="Logomarca vertical" nota="símbolo em cima, nome embaixo · encerramentos e formatos altos">
        <Linha altura={460} desenho={(cor) => <LogoVertical largura={290} cor={cor} />} />
      </Secao>

      <Secao titulo="Símbolo" nota="sol + onda · avatar, ícone, espaço pequeno">
        <Linha altura={320} desenho={(cor) => <Simbolo largura={340} em={PRONTO} cor={cor} />} partes="onda" />
      </Secao>

      <Secao titulo="Nome" nota="“surf” em Poppins 600 + “zada” em Poppins 300">
        <Linha altura={220} desenho={(cor) => <Wordmark tamanho={110} cor={cor} />} partes="nome" />
      </Secao>

      <Secao titulo="Cores">
        <Amostras
          titulo="Do logo"
          itens={[
            { token: 'coral', cor: COR.coral, uso: 'sol e anel do símbolo, sempre; o destaque das peças' },
            { token: 'tinta', cor: COR.tinta, uso: 'onda e nome sobre fundo claro' },
            { token: 'branco', cor: '#ffffff', uso: 'onda e nome sobre fundo escuro' },
          ]}
        />
        <Amostras
          titulo="Fundos"
          itens={[
            { token: 'fundo', cor: COR.fundo, uso: 'fundo claro padrão' },
            { token: 'superficie', cor: COR.superficie, uso: 'cartões' },
            { token: 'tinta', cor: COR.tinta, uso: 'fundo escuro' },
            { token: 'tinta2', cor: COR.tinta2, uso: 'superfícies sobre fundo escuro' },
            { token: 'coralClaro', cor: COR.coralClaro, uso: 'fundos de destaque suaves' },
          ]}
        />
        <Amostras
          titulo="Apoio"
          itens={[
            { token: 'coralTexto', cor: COR.coralTexto, uso: 'coral para texto sobre fundo claro' },
            { token: 'sol', cor: COR.sol, uso: 'acento quente' },
            { token: 'suave', cor: COR.suave, uso: 'texto secundário' },
            { token: 'apagado', cor: COR.apagado, uso: 'metadados' },
            { token: 'borda', cor: COR.borda, uso: 'linhas finas' },
          ]}
        />
      </Secao>

      <div style={{ marginTop: 70, paddingTop: 34, borderTop: `2px solid ${COR.borda}`, display: 'flex', gap: 60, fontSize: 26, lineHeight: 1.45, color: COR.suave }}>
        <div style={{ flex: 1 }}>
          <b style={{ color: COR.tinta }}>Tipografia:</b> Poppins (Google Fonts), pesos 300–700. Títulos em 600, rótulos em caixa
          alta 600 com traço coral.
        </div>
        <div style={{ flex: 1 }}>
          <b style={{ color: COR.tinta }}>Regras:</b> o sol e o anel são sempre coral; em fundo escuro, onda e nome brancos. Um coral
          por tela. Não distorça nem redesenhe: nos vídeos, use <i>Logo</i>, <i>Simbolo</i> e <i>Wordmark</i> de @compartilhado/marca.
        </div>
      </div>
    </AbsoluteFill>
  );
}
