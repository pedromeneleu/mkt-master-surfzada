import type { ReactNode } from 'react';
import { AbsoluteFill } from 'remotion';

import { caminhada, corrida, EXPRESSOES, AndySvg, nado, POSES, VISEMAS, type NomeExpressao, type NomePose, type NomeVisema, type PropsAndy } from '..';
import { COR, FONTE } from '../../../tema';

export const FOLHA = { largura: 2400, altura: 3500 };

const CELULA = 250;

function Celula({ nome, children }: { nome: string; children: ReactNode }) {
  return (
    <div style={{ width: CELULA, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      {children}
      <div style={{ fontSize: 22, fontWeight: 500, color: COR.suave }}>{nome}</div>
    </div>
  );
}

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div style={{ marginTop: 36 }}>
      <div style={{ fontSize: 34, fontWeight: 600, marginBottom: 12 }}>{titulo}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '18px 24px' }}>{children}</div>
    </div>
  );
}

const inteiro = (nome: string, p: PropsAndy) => (
  <Celula key={nome} nome={nome}>
    <AndySvg largura={CELULA} {...p} />
  </Celula>
);
const rosto = (nome: string, p: PropsAndy) => (
  <Celula key={nome} nome={nome}>
    <div style={{ background: COR.superficie, borderRadius: 18, border: `1px solid ${COR.borda}`, overflow: 'hidden' }}>
      <AndySvg largura={CELULA - 2} recorte="rosto" {...p} />
    </div>
  </Celula>
);

/** Folha de referência do Andy: tudo o que o rig sabe fazer, numa imagem. */
export function FolhaAndy() {
  const quadrosCorrida = [0, 2, 4, 6, 8, 10];
  const quadrosCaminhada = [0, 3, 6, 9, 12, 15];
  const quadrosNado = [0, 4, 8, 12, 16, 20];
  return (
    <AbsoluteFill style={{ background: COR.fundo, fontFamily: FONTE, color: COR.tinta, padding: 70 }}>
      <div style={{ fontSize: 64, fontWeight: 700, letterSpacing: '-0.02em' }}>
        Andy <span style={{ color: COR.coral }}>·</span> folha do personagem
      </div>
      <div style={{ fontSize: 26, color: COR.suave, marginTop: 4 }}>
        Tudo abaixo sai do mesmo rig (src/andy). Expressão, boca, pose e ciclos combinam entre si.
      </div>

      <Secao titulo="Vistas">
        {inteiro('frente', {})}
        {inteiro('vira (3/4)', { corpo: { vira: 0.8 } })}
        {inteiro('perfil', { vista: 'perfil' })}
        {inteiro('perfil virado', { vista: 'perfil', virado: true })}
        {inteiro('costas', { vista: 'costas' })}
        {inteiro('nadando', { vista: 'nado' })}
        {inteiro('perfil falando', { vista: 'perfil', rosto: { boca: VISEMAS.A } })}
      </Secao>

      <Secao titulo="Expressões">
        {(Object.keys(EXPRESSOES) as NomeExpressao[]).map((e) => rosto(e, { expressao: e }))}
      </Secao>

      <Secao titulo="Boca na fala (visemas)">
        {(Object.keys(VISEMAS) as NomeVisema[]).map((v) => rosto(v, { rosto: { boca: VISEMAS[v] } }))}
      </Secao>

      <Secao titulo="Poses">
        {(Object.keys(POSES) as NomePose[]).map((p) =>
          inteiro(p, {
            pose: p,
            vista: p.endsWith('Perfil') ? 'perfil' : 'frente',
            expressao: p === 'bravo' ? 'raiva' : p === 'desanimado' ? 'tristeza' : p === 'encolhido' ? 'medo' : p === 'pensando' ? 'pensativo' : p === 'comemorando' ? 'riso' : p === 'bracosCruzados' ? 'deboche' : p === 'surfando' ? 'determinado' : undefined,
          }),
        )}
      </Secao>

      <Secao titulo="Corrida (perfil, 12 quadros por passada)">
        {quadrosCorrida.map((q) => inteiro(`quadro ${q}`, { vista: 'perfil', corpo: corrida(q), expressao: 'determinado' }))}
      </Secao>

      <Secao titulo="Nado (24 quadros por batida de cauda)">
        {quadrosNado.map((q) => inteiro(`quadro ${q}`, { vista: 'nado', corpo: nado(q), expressao: 'determinado' }))}
      </Secao>

      <Secao titulo="Caminhada (frente, 18 quadros por passo duplo)">
        {quadrosCaminhada.map((q) => inteiro(`quadro ${q}`, { corpo: caminhada(q) }))}
      </Secao>
    </AbsoluteFill>
  );
}
