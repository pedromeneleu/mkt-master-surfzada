import type { ComponentType } from 'react';
import { AbsoluteFill, Html5Audio, Sequence, interpolate } from 'remotion';

import { Dor, Gancho } from './cenas/Abertura';
import { Final, Prova } from './cenas/Encerramento';
import { Graficos } from './cenas/Graficos';
import { Multiplataforma } from './cenas/Multiplataforma';
import { Previsoes } from './cenas/Previsoes';
import { Revelacao } from './cenas/Revelacao';
import { Sessoes } from './cenas/Sessoes';
import { SurfCheck } from './cenas/SurfCheck';
import { PrevisoesVertical, SessoesVertical } from './cenas/Vertical';
import { arquivo, bt, COM_MUSICA, FONTE, FPS, naMusica, TRILHA, VOLUME_MUSICA } from './tema';

/** Props que toda cena recebe: a própria duração em frames. */
export interface PropsCena {
  duracao: number;
}

/** Uma cena do roteiro e quantas batidas ela dura (a 90 BPM, 1 batida = 20 frames). */
export interface Cena {
  nome: string;
  batidas: number;
  Componente: ComponentType<PropsCena>;
}

/**
 * Um trecho da trilha: a partir da batida `emBatida` do vídeo, toca a música
 * desde o instante `de` (s). Trechos seguidos se emendam com crossfade curto.
 */
export interface Trecho {
  emBatida: number;
  de: number;
}

export interface Roteiro {
  cenas: Cena[];
  trilha: Trecho[];
}

/**
 * 16:9 — 96 batidas (64 s). Cada troca de cena cai no tempo 1 de um compasso.
 *  - Gancho + Dor = 4 compassos; o respiro da música (compasso 25) cai no fim da Dor, com o riser.
 *  - A Revelação cai exatamente na virada (compasso 26, a banda entrando).
 *  - Na Prova a trilha emenda no fim da música (compasso 57) e o Final cai no
 *    acorde que se desfaz (compasso 59): o logo aparece enquanto a música termina.
 */
export const HORIZONTAL: Roteiro = {
  cenas: [
    { nome: 'Gancho', batidas: 8, Componente: Gancho },
    { nome: 'Dor', batidas: 8, Componente: Dor },
    { nome: 'Revelação', batidas: 8, Componente: Revelacao },
    { nome: 'Previsões', batidas: 16, Componente: Previsoes },
    { nome: 'Gráficos', batidas: 8, Componente: Graficos },
    { nome: 'Surf check', batidas: 12, Componente: SurfCheck },
    { nome: 'Sessões', batidas: 12, Componente: Sessoes },
    { nome: 'Web e celular', batidas: 8, Componente: Multiplataforma },
    { nome: 'Prova', batidas: 8, Componente: Prova },
    { nome: 'Final', batidas: 8, Componente: Final },
  ],
  trilha: [
    { emBatida: 0, de: naMusica(22) },
    { emBatida: 80, de: naMusica(57) },
  ],
};

/**
 * 9:16 — 45 batidas (30 s). Gancho + Dor = 3 compassos a partir do compasso 23:
 * o respiro da música cai no fim da Dor, com o riser, e a Revelação na virada
 * (8 s). Mesma emenda para o fim.
 */
export const VERTICAL: Roteiro = {
  cenas: [
    { nome: 'Gancho', batidas: 4, Componente: Gancho },
    { nome: 'Dor', batidas: 8, Componente: Dor },
    { nome: 'Revelação', batidas: 8, Componente: Revelacao },
    { nome: 'Previsões', batidas: 8, Componente: PrevisoesVertical },
    { nome: 'Sessões', batidas: 8, Componente: SessoesVertical },
    { nome: 'Prova', batidas: 4, Componente: Prova },
    { nome: 'Final', batidas: 5, Componente: Final },
  ],
  trilha: [
    { emBatida: 0, de: naMusica(23) },
    { emBatida: 36, de: naMusica(58) },
  ],
};

const totalBatidas = (r: Roteiro) => r.cenas.reduce((t, c) => t + c.batidas, 0);
export const duracao = (r: Roteiro) => bt(totalBatidas(r));

const CROSSFADE = 8;

/** A trilha em trechos, com fade de entrada, crossfade nas emendas e fade no fim. */
function Trilha({ trechos, total }: { trechos: Trecho[]; total: number }) {
  if (!COM_MUSICA) return null;
  return (
    <>
      {trechos.map((t, i) => {
        const inicio = Math.max(0, bt(t.emBatida) - (i ? CROSSFADE / 2 : 0));
        const proximo = trechos[i + 1];
        const fimTrecho = proximo ? bt(proximo.emBatida) + CROSSFADE / 2 : total;
        const dur = fimTrecho - inicio;
        const deFrames = Math.round(t.de * FPS) - (bt(t.emBatida) - inicio);
        return (
          <Sequence key={i} from={inicio} durationInFrames={dur} layout="none" name={`trilha ${i + 1}`}>
            <Html5Audio
              src={arquivo(TRILHA.arquivo)}
              trimBefore={deFrames}
              volume={(f) =>
                VOLUME_MUSICA *
                Math.min(
                  interpolate(f, [0, i ? CROSSFADE : 6], [0, 1], { extrapolateRight: 'clamp' }),
                  proximo
                    ? interpolate(f, [dur - CROSSFADE, dur], [1, 0], { extrapolateLeft: 'clamp' })
                    : interpolate(f, [dur - 24, dur], [1, 0], { extrapolateLeft: 'clamp' }),
                )
              }
            />
          </Sequence>
        );
      })}
    </>
  );
}

export function Montagem({ roteiro }: { roteiro: Roteiro }) {
  let batida = 0;
  return (
    <AbsoluteFill style={{ fontFamily: FONTE, background: '#000' }}>
      {roteiro.cenas.map(({ nome, batidas, Componente }) => {
        // Arredonda sobre o acumulado para os cortes não escorregarem da grade.
        const de = bt(batida);
        batida += batidas;
        const dur = bt(batida) - de;
        return (
          <Sequence key={nome} from={de} durationInFrames={dur} name={nome}>
            <Componente duracao={dur} />
          </Sequence>
        );
      })}
      <Trilha trechos={roteiro.trilha} total={duracao(roteiro)} />
    </AbsoluteFill>
  );
}

export const Trailer = () => <Montagem roteiro={HORIZONTAL} />;
export const TrailerVertical = () => <Montagem roteiro={VERTICAL} />;
