/**
 * Dados do modelo story-previsao: a janela da manhã (6h–11h) de cada pico, com
 * as previsões reais da API de produção, gravadas em pecas/<slug>/dados.json.
 *
 * - Padrão: de amanhã (ou do dia pedido) até domingo, picos de PICOS.
 * - `--semana`: de segunda até domingo (ou até o último dia que a API já cobre),
 *   picos de PICOS_SEMANA, para variar em relação ao do fim de semana.
 *
 * Uso: npm run dados -- <peca>
 *      npm run dados -- <peca> 2026-10-01   (dia inicial; padrão = amanhã)
 *      npm run dados -- <peca> --semana     (dia inicial = próxima segunda)
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import type { ContextoDados } from '../../scripts/dados';
import { API_URL } from '../../scripts/lib/pecas';
import type { DiaPrevisao, PicoFimDeSemana, PrevisaoFimDeSemana, TipoVento } from './tipos';

/**
 * Um pico por estado, de norte a sul. `orientacao` = rumo (graus) para onde a
 * praia está voltada; a API ainda não tem esse campo preenchido, então fica
 * aqui, só para dizer se o vento é terral, maral ou cruzado.
 */
const PICOS = [
  { id: 'c3a04fc9-3a57-46e3-aa4a-a32eb3955cb0', uf: 'CE', nome: 'Praia do Futuro', cidade: 'Fortaleza', orientacao: 70 },
  // A API põe a Baía Formosa em Canguaretama (cidade vizinha).
  { id: '6d5bb141-0ac8-4a7d-bc42-0b818ff350bb', uf: 'RN', nome: 'Baía Formosa', cidade: 'Litoral sul do RN', orientacao: 45 },
  { id: '9fe89a41-d04f-4dbb-9946-5f99e48fa5f6', uf: 'ES', nome: 'Regência', cidade: 'Linhares', orientacao: 115 },
  { id: '021f81eb-0acf-4660-b75c-cf30b9aa83da', uf: 'RJ', nome: 'Arpoador', cidade: 'Rio de Janeiro', orientacao: 180 },
  { id: '098508d8-d57d-40e2-92cb-b47342cd3d65', uf: 'SP', nome: 'Maresias', cidade: 'São Sebastião', orientacao: 170 },
];

/** Story da semana: outros picos, para variar em relação ao do fim de semana. */
const PICOS_SEMANA: typeof PICOS = [
  // O Titanzinho quebra no lado norte do espigão do Serviluz.
  { id: '31b65d21-a344-4c6b-ae5c-3e4a563e2c85', uf: 'CE', nome: 'Titanzinho', cidade: 'Fortaleza', orientacao: 15 },
  // A API põe a Pipa em Arês; a praia fica em Tibau do Sul.
  { id: 'e3f2282f-eb05-4d5e-97bb-2ecd6ec11aa4', uf: 'RN', nome: 'Pipa', cidade: 'Tibau do Sul', orientacao: 80 },
  { id: '407e678e-3911-4655-9c70-43371002bd67', uf: 'ES', nome: 'Jacaraípe', cidade: 'Serra', orientacao: 110 },
  { id: 'ebca6198-efa4-47f2-b3b6-654937546608', uf: 'RJ', nome: 'Itaúna', cidade: 'Saquarema', orientacao: 165 },
  { id: '4d1b96f3-1a90-4c52-a50a-6427fb67f770', uf: 'SP', nome: 'Itamambuca', cidade: 'Ubatuba', orientacao: 140 },
];

/** Janela da manhã, em hora de Brasília. */
const HORAS = [6, 7, 8, 9, 10, 11];
const FUSO = -3;
const SIGLAS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
const NOMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const CARDEAIS = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];

interface ValorApi {
  chave: string;
  valorNum?: number;
}
interface PrevisaoApi {
  intervalo: string;
  alvoEm: string;
  valores: ValorApi[];
}

const media = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
/** Média de rumos (graus) pelo vetor unitário: 350° e 10° dão 0°, não 180°. */
function mediaAngular(graus: number[]): number {
  const s = media(graus.map((g) => Math.sin((g * Math.PI) / 180)));
  const c = media(graus.map((g) => Math.cos((g * Math.PI) / 180)));
  return ((Math.atan2(s, c) * 180) / Math.PI + 360) % 360;
}
const cardeal = (g: number) => CARDEAIS[Math.round(g / 45) % 8];
const difAngular = (a: number, b: number) => {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
};
const arred = (x: number, casas: number) => Number(x.toFixed(casas));

/** Mesma regra do web (classificacao-vento.service.ts), com "fraco" abaixo de 5 nós. */
function tipoVento(orientacao: number, direcao: number, nos: number): TipoVento {
  if (nos < 5) return 'fraco';
  const dif = difAngular(direcao, orientacao);
  if (dif <= 45) return 'maral';
  if (dif >= 135) return 'terral';
  return 'cruzado';
}

/** Potência do mar (kW/m) ≈ 0,49·Hs²·T, como em web/client/src/app/utils/energia-onda.ts. */
const potencia = (hs: number, t: number) => (1025 * 9.81 * 9.81 * hs * hs * t) / (64 * Math.PI) / 1000;

/** Story da semana (`--semana`): muda os picos, o período e a nota. */
let SEMANA = false;

/**
 * Nota só para escolher o "melhor dia": força do mar, descontada pelo vento.
 * O story da semana mostra a altura do swell, então lá a força é a do swell.
 */
function nota(d: DiaPrevisao): number {
  const vento = { fraco: 1, terral: 1, cruzado: 0.8, maral: d.ventoKn > 10 ? 0.45 : 0.6 }[d.tipoVento];
  return (SEMANA ? potencia(d.alturaSwell, d.periodo) : d.potencia) * vento;
}

type PorHora = Map<string, Record<string, number>>;

/** Previsões horárias de um pico: hora local "AAAA-MM-DDTHH" → valores daquela hora. */
async function previsoesPorHora(pico: (typeof PICOS)[number]): Promise<PorHora> {
  const resposta = await fetch(`${API_URL()}/previsoes?localId=${pico.id}`);
  if (!resposta.ok) throw new Error(`${pico.nome}: HTTP ${resposta.status}`);
  const previsoes = ((await resposta.json()) as PrevisaoApi[]).filter((p) => p.intervalo === 'horaria');
  const porHora: PorHora = new Map();
  for (const p of previsoes) {
    const local = new Date(new Date(p.alvoEm).getTime() + FUSO * 3600e3).toISOString().slice(0, 13);
    porHora.set(local, Object.fromEntries(p.valores.filter((v) => v.valorNum != null).map((v) => [v.chave, v.valorNum!])));
  }
  return porHora;
}

const horasDaManha = (porHora: PorHora, dia: Date) => {
  const data = dia.toISOString().slice(0, 10);
  return HORAS.map((h) => porHora.get(`${data}T${String(h).padStart(2, '0')}`)).filter((v) => v != null);
};

function picoFimDeSemana(pico: (typeof PICOS)[number], porHora: PorHora, dias: Date[]): PicoFimDeSemana {
  const resultado: DiaPrevisao[] = dias.map((dia) => {
    const data = dia.toISOString().slice(0, 10);
    const horas = horasDaManha(porHora, dia);
    if (horas.length < 3) throw new Error(`${pico.nome}: sem previsão horária para ${data}`);
    const col = (chave: string) => horas.map((h) => h[chave]).filter((v) => v != null);

    const altura = media(col('altura_onda'));
    const periodo = media(col('periodo_swell'));
    const ventoKn = media(col('vento_kn'));
    const ventoDirecao = mediaAngular(col('vento_direcao'));
    const swellDirecao = mediaAngular(col('direcao_swell'));
    return {
      data,
      sigla: SIGLAS[dia.getUTCDay()],
      nome: NOMES[dia.getUTCDay()],
      altura: arred(altura, 2),
      alturaSwell: arred(media(col('altura_swell')), 2),
      periodo: arred(periodo, 1),
      swellDirecao: Math.round(swellDirecao),
      swellCardeal: cardeal(swellDirecao),
      ventoKn: arred(ventoKn, 1),
      ventoDirecao: Math.round(ventoDirecao),
      ventoCardeal: cardeal(ventoDirecao),
      tipoVento: tipoVento(pico.orientacao, ventoDirecao, ventoKn),
      potencia: arred(potencia(altura, periodo), 1),
    };
  });

  const notas = resultado.map(nota);
  return {
    uf: pico.uf,
    nome: pico.nome,
    cidade: pico.cidade,
    dias: resultado,
    melhorDia: notas.indexOf(Math.max(...notas)),
  };
}

/** Busca as previsões e grava pecas/<slug>/dados.json. */
export default async function gerar({ pasta, args }: ContextoDados) {
  SEMANA = Boolean(args.flags.semana);
  const dataPedida = args.posicionais.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a));

  // De amanhã (ou do dia pedido) até domingo: o story sai hoje, a manhã de hoje já passou.
  // Na semana, o padrão é a próxima segunda.
  const inicio = dataPedida ? new Date(`${dataPedida}T12:00:00Z`) : new Date(Date.now() + (FUSO + 24) * 3600e3);
  inicio.setUTCHours(12, 0, 0, 0);
  if (SEMANA && !dataPedida) while (inicio.getUTCDay() !== 1) inicio.setUTCDate(inicio.getUTCDate() + 1);
  let dias: Date[] = [];
  for (let d = new Date(inicio); dias.length === 0 || d.getUTCDay() !== 1; d = new Date(d.getTime() + 86400e3)) dias.push(d);
  if (dias.length < 2) throw new Error('Hoje já é domingo: passe o dia inicial (ex.: npm run dados -- <peca> 2026-10-08)');

  const lista = SEMANA ? PICOS_SEMANA : PICOS;
  const porHora = await Promise.all(lista.map(previsoesPorHora));
  if (SEMANA) {
    // A API cobre ~7 dias à frente: a semana termina no último dia com a manhã completa em todos os picos.
    dias = dias.filter((dia) => porHora.every((h) => horasDaManha(h, dia).length === HORAS.length));
    if (dias.length < 5) throw new Error(`A API só cobre ${dias.length} dia(s) da semana; rode mais perto da segunda`);
  }
  const picos = lista.map((p, i) => picoFimDeSemana(p, porHora[i], dias));
  const saida: PrevisaoFimDeSemana = {
    geradoEm: new Date().toISOString(),
    janela: `${HORAS[0]}h–${HORAS[HORAS.length - 1]}h`,
    picos,
  };
  const arquivo = join(pasta, 'dados.json');
  writeFileSync(arquivo, JSON.stringify(saida, null, 2) + '\n');

  console.log(`${arquivo}\n`);
  for (const p of picos) {
    console.log(`${p.uf} ${p.nome} (melhor: ${p.dias[p.melhorDia].sigla})`);
    for (const d of p.dias) {
      console.log(
        `  ${d.sigla} ${d.altura.toFixed(1)} m · swell ${d.alturaSwell} m ${d.periodo} s ${d.swellCardeal} · vento ${d.ventoKn} kn ${d.ventoCardeal} (${d.tipoVento}) · ${d.potencia} kW/m`,
      );
    }
  }
}
