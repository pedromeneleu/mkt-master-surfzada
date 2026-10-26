import { Composition, Folder } from 'remotion';

import { FORMATOS, FPS } from '@compartilhado/tema';

import { DURACAO, IaAnalisa } from './IaAnalisa';
import { SLUG } from './comum';

/** O Reel e as 2 variações de gancho para o teste A/B (só os primeiros 4 s mudam). */
export function Composicoes() {
  return (
    <Folder name={SLUG}>
      <Composition id="ia-analisa-rasgada" component={IaAnalisa} defaultProps={{ gancho: 'a' as const }} durationInFrames={DURACAO} fps={FPS} {...FORMATOS['reel-9x16']} />
      <Composition id="ia-analisa-rasgada-gancho-b" component={IaAnalisa} defaultProps={{ gancho: 'b' as const }} durationInFrames={DURACAO} fps={FPS} {...FORMATOS['reel-9x16']} />
      <Composition id="ia-analisa-rasgada-gancho-c" component={IaAnalisa} defaultProps={{ gancho: 'c' as const }} durationInFrames={DURACAO} fps={FPS} {...FORMATOS['reel-9x16']} />
    </Folder>
  );
}
