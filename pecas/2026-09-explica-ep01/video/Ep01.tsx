import { AbsoluteFill, Audio, Sequence } from 'remotion';

import { arquivo, COR } from '../tema';
import { Agua } from './cenas/Agua';
import { Chegando } from './cenas/Chegando';
import { Fechamento } from './cenas/Fechamento';
import { Gancho } from './cenas/Gancho';
import { Nascimento } from './cenas/Nascimento';
import { Swell } from './cenas/Swell';
import { Legenda } from './comum';
import { duracaoCena, inicioCena, NARRACAO, type NomeCena } from './tempos';

const CENAS: [NomeCena, () => React.JSX.Element][] = [
  ['gancho', Gancho],
  ['nascimento', Nascimento],
  ['agua', Agua],
  ['swell', Swell],
  ['chegando', Chegando],
  ['fechamento', Fechamento],
];

/** Surfzada Analisa #1 · De onde vem a onda? (Reels 9:16). */
export function Ep01() {
  return (
    <AbsoluteFill style={{ background: COR.tinta }}>
      {CENAS.map(([nome, Cena]) => (
        <Sequence key={nome} name={nome} from={inicioCena(nome)} durationInFrames={duracaoCena(nome)}>
          <Cena />
        </Sequence>
      ))}
      {/* Espaço da voz do Andy: quando existir, é só apontar NARRACAO (tempos.ts). */}
      {NARRACAO && <Audio src={arquivo(NARRACAO)} />}
      <Legenda />
    </AbsoluteFill>
  );
}
