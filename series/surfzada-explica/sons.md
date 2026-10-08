# Sons do Surfzada Explica

Biblioteca de efeitos sonoros do quadro, sem a voz. Os roteiros citam cada
som pelo código da primeira coluna (ex.: `S-clack`).

## Princípios

- **O som acompanha o que se vê.** Todo movimento importante tem um som
  curto: aparecer, trocar de cena, número subindo, quebra. Som não fica
  "decorando" por baixo da fala.
- **A voz manda.** Efeito nenhum cobre palavra. Onde houver fala, efeitos
  curtos e baixos; os efeitos fortes (impacto, estalo de dentes) caem nas
  pausas.
- **Nada essencial fica só no áudio.** Muita gente assiste sem som, então
  todo número e toda ideia também aparecem na tela.
- **Uma assinatura.** O estalo de dentes do Andy (`S-clack`) aparece em
  todo episódio, nos momentos de "sacou!" e depois do bordão ("O mar não
  mente."). Vira o som reconhecível do quadro.
- **Tudo com licença limpa.** Vale som gerado por código, gravado por nós ou
  de banco com uso comercial liberado (Pixabay, Freesound CC0). Nada tirado
  de vídeo de terceiros.

## Da onde vem cada som

1. **Gerado por código.** Aproveita o sintetizador do trailer
   ([scripts/sfx.ts](../../scripts/sfx.ts)), que produz WAV
   determinístico, sem banco de terceiros. Serve para os sons de interface e
   movimento.
2. **Gravado na praia**, com celular e protetor de vento (uma espuma já
   resolve), 1–2 min de cada. Serve para os ambientes reais: arrebentação
   perto e longe, espuma, vento. É o que dá a cara do Ceará ao quadro.
3. **Banco livre** (Pixabay SFX ou Freesound CC0), para o que não dá para
   gravar: tempestade, trovão, som debaixo d'água, respingo grande. Guardar
   o link e a licença de cada arquivo.

## Biblioteca

### Movimento e interface (gerados)

| Código | Som | Quando usar | Já existe no trailer? |
|---|---|---|---|
| `S-whoosh` | Sopro de ar, médio | Troca de cena, câmera andando | Sim (`whoosh`) |
| `S-whoosh-curto` | Sopro rápido | Elemento entrando ou saindo | Sim |
| `S-whoosh-grave` | Sopro grave | Transição grande, mergulho | Sim |
| `S-pop` / `S-pop-agudo` | Estalo redondo | Texto, número ou ícone aparecendo | Sim |
| `S-tick` | Tique seco | Contador, cada batida de um medidor | Sim |
| `S-riser` | Tom subindo com ruído | Tensão antes de uma revelação ou quebra | Sim (`riser-longo`, 2,2 s) |
| `S-impacto` | Batida grave com cauda | Revelação, quebra, corte forte | Sim |
| `S-brilho` | Brilho agudo | "Sacou!", ideia, número-chave | Sim (`brilho-sacou`; o `brilho` do trailer é o acorde longo de fechamento) |
| `S-contador` | Ticks acelerando | Número subindo rápido (ex.: 0 → 5.000 km) | Novo: sequência de `S-tick` |
| `S-medidor` | Tom subindo junto com uma barra | Medidores de vento, duração e pista; barra altura ÷ profundidade | Novo |
| `S-relogio` | Tique-taque de relógio | Contar o período (16 s entre cristas) | Novo |
| `S-congela` | Whoosh invertido com um "clique" | Vídeo real congelando para análise | Novo |
| `S-traco` | Rabisco leve de caneta | Linha coral contornando crista, seta, órbita | Novo |

### Andy (gerados)

| Código | Som | Quando usar |
|---|---|---|
| `S-clack` | **Assinatura:** estalo seco de dentes batendo, duas batidas rápidas | "Sacou!", fim do episódio, bordão |
| `S-cauda` | Swish curto e molhado | Batida de cauda no nado |
| `S-pouso` | Baque abafado com um "squish" | Andy caindo em pé, pulando |
| `S-plop` | Algo pequeno caindo na água (tom descendo + ruído) | Andy soltando a boia |
| `S-bolhas` | 3–6 bolhinhas subindo | Andy submerso, transição para debaixo d'água |

### Mar e clima (gravados ou de banco)

| Código | Som | Fonte | Quando usar |
|---|---|---|---|
| `S-arrebentacao-perto` | Onda quebrando perto, com espuma | Gravação na praia | Vídeo real de quebra, gancho |
| `S-arrebentacao-longe` | Mar de fundo, contínuo | Gravação na praia | Ambiente por baixo das cenas na costa |
| `S-mar-aberto` | Mar aberto, ondulação sem quebra | Banco | Cenas do swell viajando |
| `S-tempestade` | Vento forte + chuva, trovão distante | Banco | Nascimento da onda |
| `S-vento` | Vento contínuo, variando | Gerado (ruído filtrado) ou gravado | Setas de vento, terral e maral |
| `S-submerso` | Ambiente abafado, grave | Banco ou gerado (ruído com passa-baixa forte) | Cortes debaixo d'água |
| `S-respingo` | Respingo grande | Banco | Andy saltando da água |

### Sem trilha

Decisão: o quadro não tem música. Quem segura o clima é o ambiente do mar
(arrebentação, mar aberto, vento), e os efeitos marcam o ritmo. Por isso o
ambiente não pode sumir: sempre há alguma camada de mar tocando baixa, e as
trocas de cena trocam também o ambiente.

## Mixagem

| Camada | Nível aproximado | Observação |
|---|---|---|
| Voz | Referência (~ -14 LUFS no geral) | Sempre inteligível no alto-falante do celular |
| Efeitos curtos | Picos até ~ -6 dBFS | Caem entre as frases |
| Ambiente | 15–20 dB abaixo da voz sob a fala, ~8 dB abaixo nas pausas | Faz o papel da trilha: abaixa na fala (ducking) e cresce nas pausas |

No Remotion, o volume de cada `<Audio>` pode variar por frame. O ducking sai
da mesma transcrição com tempos por palavra que comanda as animações.

Testar a mixagem em alto-falante de celular. É assim que a maioria vai
ouvir, e é onde os graves somem.

## A fazer

- [x] Sintetizador em `scripts/sfx.ts` (`npm run sfx`, saída em `public/compartilhado/sfx/`), com
      todos os sons da biblioteca. Os de mar e clima também saem dele, como
      provisórios.
- [ ] Gravar na praia: arrebentação perto e longe, espuma, vento.
- [ ] Baixar do banco: tempestade, mar aberto, submerso, respingo. Anotar o
      link e a licença de cada um aqui.
