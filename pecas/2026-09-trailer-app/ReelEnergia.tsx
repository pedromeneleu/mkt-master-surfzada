import { ChamadaSite, GanchoForca, GraficoEnergia, MapaEnergia } from './cenas/Energia';
import { Montagem, type Roteiro } from './Trailer';

/**
 * Reel das features de energia — 9:16, 22 batidas (~14,7 s) na grade de
 * 90 BPM do trailer.
 *
 * Sem trilha: a música entra no próprio Instagram, só os efeitos vão no
 * arquivo. O riser do gancho ainda desemboca no impacto do mapa, a 2,7 s. Se
 * a música do Instagram tiver uma virada, alinhe-a ali.
 */
export const REEL_ENERGIA: Roteiro = {
  cenas: [
    { nome: 'Gancho', batidas: 4, Componente: GanchoForca },
    { nome: 'Mapa de energia', batidas: 7, Componente: MapaEnergia },
    { nome: 'Energia e potência', batidas: 7, Componente: GraficoEnergia },
    { nome: 'Chamada', batidas: 4, Componente: ChamadaSite },
  ],
  trilha: [],
};

export const ReelEnergia = () => <Montagem roteiro={REEL_ENERGIA} />;
