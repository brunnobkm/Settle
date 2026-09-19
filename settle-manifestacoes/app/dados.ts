// Fonte de dados (mock) da aba Manifestações da licitação.
// Implementa o "Mapeamento de tipos (backend -> UI)" e expõe uma carga assíncrona
// que simula a API (latência). A API ainda não está confirmada: tudo passa por
// mapBackendEvent(), então trocar a fonte depois não exige mudar a interface.

/* ------------------------------------------------------------------ */
/* Categorias e abas                                                   */
/* ------------------------------------------------------------------ */

export type Categoria = "aviso" | "impugnacao" | "esclarecimento" | "recurso"

// MVP exibe 3 (Avisos, Impugnações, Questionamentos). O modelo acomoda Recursos.
/** cor: variante de categoria do Badge (category-N do tema; ver o "$comentario" do theme.json da Settle). */
export const CATEGORIAS: Record<
  Categoria,
  { label: string; plural: string; cor: "category-1" | "category-2" | "category-3" | "category-4" }
> = {
  aviso: { label: "Aviso", plural: "Avisos", cor: "category-1" }, // azul
  impugnacao: { label: "Impugnação", plural: "Impugnações", cor: "category-3" }, // vermelho
  // CLARIFICATION_* (termo de UI: Questionamento)
  esclarecimento: { label: "Questionamento", plural: "Questionamentos", cor: "category-2" }, // verde
  recurso: { label: "Recurso", plural: "Recursos", cor: "category-4" }, // roxo
}

/* MVP: sem aba "Recursos" dedicada. O modelo suporta a categoria 'recurso' desde já;
 * para evoluir a navegação depois, basta MOSTRAR_RECURSO = true. */
const MVP_RECURSOS_TAB = true
export const MOSTRAR_RECURSO = false // Recurso fora do escopo por enquanto: não exibir (aba + cards)

export type Aba = { id: string; label: string; demo?: boolean }

const ABAS_BASE: Aba[] = [
  { id: "todas", label: "Todas" },
  { id: "aviso", label: "Avisos" },
  { id: "esclarecimento", label: "Questionamentos" },
  { id: "impugnacao", label: "Impugnações" },
]

export const ABAS: Aba[] = [
  ...(MOSTRAR_RECURSO ? [...ABAS_BASE, { id: "recurso", label: "Recursos" }] : ABAS_BASE),
  // Abas de demonstração dos estados vazios (para apresentação)
  { id: "demo-vazio", label: "Sem itens", demo: true },
  { id: "demo-portal", label: "Sem captura", demo: true },
]

/** Em qual aba cada categoria é contada/filtrada. Sem aba de Recursos, 'recurso' cai em 'aviso'. */
export function abaDaCategoria(categoria: Categoria) {
  if (categoria === "recurso" && !MVP_RECURSOS_TAB) return "aviso"
  return categoria
}

// Abas primárias do workspace. Manifestações é a única "viva" no protótipo.
export const ABAS_DO_WORKSPACE = [
  { id: "itens", label: "Itens" },
  { id: "analise", label: "Análise técnica" },
  { id: "manifestacoes", label: "Manifestações", beta: true },
]

// Ordenação (botão "Ordenar"): traz o grupo escolhido ao topo, mantendo a ordem por
// data dentro de cada grupo. 'nenhum' = ordem padrão (atualização mais recente primeiro).
export type Ordem = "nenhum" | "com-resposta" | "aguardando"
export const OPCOES_DE_ORDEM: { id: Ordem; label: string }[] = [
  { id: "nenhum", label: "Nenhum" },
  { id: "com-resposta", label: "Manifestações com resposta" },
  { id: "aguardando", label: "Manifestações aguardando resposta" },
]

/* ------------------------------------------------------------------ */
/* Mapeamento de tipos (backend -> UI)                                 */
/* ------------------------------------------------------------------ */

type TipoBackend =
  | "CLARIFICATION_REQUEST"
  | "CLARIFICATION_RESPONSE"
  | "OBJECTION_REQUEST"
  | "OBJECTION_RESPONSE"
  | "APPEAL_INTENTION"
  | "APPEAL_REASON"
  | "APPEAL_COUNTER_REASON"
  | "APPEAL_JUDGMENT"
  | "NOTICE"

/** Regras do documento. exibir: false remove o evento da lista. */
function mapBackendEvent(type: TipoBackend, portal: string): { categoria: Categoria; exibir: boolean } {
  switch (type) {
    // Questionamentos (Esclarecimentos): pedido + resposta
    case "CLARIFICATION_REQUEST":
    case "CLARIFICATION_RESPONSE":
      return { categoria: "esclarecimento", exibir: true }
    // Impugnações: pedido + resposta
    case "OBJECTION_REQUEST":
    case "OBJECTION_RESPONSE":
      return { categoria: "impugnacao", exibir: true }
    // Recursos
    case "APPEAL_INTENTION":
      return { categoria: "recurso", exibir: true }
    case "APPEAL_REASON":
      // Não exibir: em alguns portais é redundante e não é a "razão real" (usar APPEAL_INTENTION).
      return { categoria: "recurso", exibir: false }
    case "APPEAL_COUNTER_REASON":
      return { categoria: "recurso", exibir: true }
    case "APPEAL_JUDGMENT":
      // No PNCP não é "julgamento de recurso": é log administrativo, agrupado com Avisos.
      return portal === "PNCP" ? { categoria: "aviso", exibir: true } : { categoria: "recurso", exibir: true }
    // Avisos do pregoeiro e eventos administrativos equivalentes
    case "NOTICE":
      return { categoria: "aviso", exibir: true }
    default:
      // Fonte flexível: tipo desconhecido cai em Avisos, sem quebrar a UI.
      return { categoria: "aviso", exibir: true }
  }
}

/* ------------------------------------------------------------------ */
/* Eventos crus (como viriam do backend)                               */
/* ------------------------------------------------------------------ */

export type Anexo = { nome: string; tamanho: string }

type EventoCru = {
  id: string
  type: TipoBackend
  portal: string
  licitacao: string
  autor: string
  documento?: string
  /** minutos atrás: a data real é calculada ao carregar */
  minAtras: number
  minAtrasMensagem?: number
  minAtrasAtualizacao?: number
  lida: boolean
  mensagem: string
  resumo?: string
  resumoAuto?: string
  mensagemCompleta?: string
  resposta?: { novaResposta?: boolean; texto: string }
  anexos?: Anexo[]
  // recurso encadeado (etapas que compartilham recursoId viram um item só)
  recursoId?: string
  recursoTitulo?: string
  etapaLabel?: string
  etapaCurto?: string
  resultado?: string
}

const LICITACOES: Record<string, { id: string; label: string }> = {
  pe12: { id: "pe12", label: "PE 12/2026 · Prefeitura SP" },
  pe07: { id: "pe07", label: "PE 07/2026 · Gov. RJ" },
  cc003: { id: "cc003", label: "CC 003/2026 · UFMG" },
}

const DIA = 60 * 24

const EVENTOS: EventoCru[] = [
  {
    id: "e01",
    type: "NOTICE",
    portal: "PNCP",
    licitacao: "pe12",
    autor: "Pregoeiro, Prefeitura SP",
    minAtras: 0,
    minAtrasAtualizacao: 3,
    lida: false,
    mensagem: "Comunicado de suspensão da sessão pública do Pregão Eletrônico nº 12/2026.",
    resumo:
      "A sessão pública foi suspensa por tempo indeterminado para análise de questionamentos e impugnações. Nova data será publicada nos canais oficiais.",
    mensagemCompleta:
      "Comunicado de suspensão da sessão pública. A autoridade competente, no uso de suas atribuições e com fundamento no art. 71 da Lei nº 14.133/2021, torna público que a sessão pública do Pregão Eletrônico nº 12/2026, anteriormente agendada para esta data, fica SUSPENSA por tempo indeterminado, em razão da necessidade de análise dos questionamentos e impugnações apresentados tempestivamente ao instrumento convocatório.\n\nA suspensão tem por finalidade resguardar a lisura e a competitividade do certame, assegurando a todos os interessados prazo adequado para a compreensão das eventuais alterações que venham a ser promovidas no edital e em seus anexos. Eventuais respostas aos pedidos de esclarecimento e às impugnações serão publicadas no Portal Nacional de Contratações Públicas (PNCP) e no sítio eletrônico oficial do órgão, passando a integrar o edital para todos os efeitos legais.\n\nNova data para a realização da sessão pública será oportunamente divulgada pelos mesmos meios de publicação, observado o prazo mínimo legal de antecedência. Os licitantes que já tenham encaminhado suas propostas e documentos de habilitação poderão mantê-los ou substituí-los até a nova data designada, não havendo qualquer prejuízo à sua participação. Recomenda-se o acompanhamento diário das publicações oficiais relativas a este certame.\n\nFica facultado aos interessados o protocolo de novos pedidos de esclarecimento e de impugnação, observados os prazos legais, os quais serão igualmente respondidos e publicados nos canais oficiais. A Administração reafirma seu compromisso com a transparência, a isonomia e a busca da proposta mais vantajosa, nos termos dos princípios que regem as contratações públicas.",
  },
  {
    id: "e02",
    type: "CLARIFICATION_RESPONSE",
    portal: "PNCP",
    licitacao: "pe12",
    autor: "Equipe de Licitação",
    // resposta há 18 min; pergunta há 2 dias; exibido há 10 min
    minAtras: 18,
    minAtrasMensagem: DIA * 2,
    minAtrasAtualizacao: 10,
    lida: false,
    mensagem: "Resposta ao pedido de esclarecimento nº 3 referente ao item 4.2 do Termo de Referência.",
    resumo:
      "Esclarecimento sobre a comprovação de qualificação técnica (item 4.2): atestado pode ser da empresa ou do responsável técnico, com somatório admitido. Já respondido pela equipe.",
    mensagemCompleta:
      "Pedido de esclarecimento nº 3, protocolado tempestivamente, referente ao item 4.2 do Termo de Referência do Pregão Eletrônico nº 12/2026. O interessado solicita esclarecimento quanto à forma de comprovação da qualificação técnica exigida, especificamente sobre a possibilidade de o atestado de capacidade técnica ser emitido em nome de responsável técnico vinculado à empresa licitante, e não exclusivamente em nome da pessoa jurídica.\n\nIndaga-se, ainda, se o quantitativo mínimo previsto no subitem 4.2.1 deverá ser comprovado por meio de um único atestado ou se será admitido o somatório de atestados distintos, emitidos por diferentes contratantes, para fins de alcance do quantitativo total exigido. Questiona-se também se contratos em execução, ainda não concluídos, poderão ser considerados para a referida comprovação, desde que acompanhados de declaração do contratante atestando a parcela já executada.\n\nPor fim, requer-se esclarecimento sobre a data de referência para a verificação do vínculo do responsável técnico com a empresa: se a data de abertura da sessão pública, se a data de assinatura do eventual contrato, ou outra data a ser definida pela Administração. Solicita-se que a resposta seja publicada no portal para conhecimento de todos os interessados, passando a integrar o edital.\n\nReitera-se que o presente pedido foi formulado com estrita observância ao prazo previsto no edital, requerendo-se a publicação da resposta em campo de fácil acesso no portal, de modo a garantir igualdade de informação entre todos os participantes do certame.",
    resposta: {
      novaResposta: true,
      texto:
        "Em resposta ao pedido de esclarecimento nº 3, a equipe de licitação informa que: (i) o atestado de capacidade técnica poderá ser apresentado em nome da empresa licitante ou de seu responsável técnico, desde que comprovado o vínculo na data da sessão pública, nos termos do item 4.2.1 do edital; (ii) será admitido o somatório de atestados para fins de comprovação do quantitativo mínimo exigido; (iii) contratos em execução serão aceitos desde que acompanhados de declaração do contratante quanto à parcela executada. As demais condições do edital permanecem inalteradas.",
    },
    anexos: [{ nome: "Resposta_Esclarecimento_03.pdf", tamanho: "142 KB" }],
  },
  {
    id: "e03",
    type: "OBJECTION_REQUEST",
    portal: "PNCP",
    licitacao: "pe12",
    autor: "Licitante: Alfa Tecnologia LTDA",
    // impugnação há 2 dias; resposta há 47 min
    minAtras: 47,
    minAtrasMensagem: DIA * 2,
    minAtrasAtualizacao: 25,
    lida: false,
    mensagem:
      "Pedido de impugnação ao instrumento editalício quanto à exigência de comprovação de capital social mínimo, por suposta restrição à competitividade nos termos da Lei 14.133/2021.",
    resumo:
      "Impugnação ao item 7.5 do edital: a exigência de capital social mínimo de 10% restringiria a competitividade e prejudicaria micro e pequenas empresas. Pede a exclusão da exigência e a republicação do edital.",
    resumoAuto:
      "A empresa impugna o item 7.5 do edital: a exigência de capital social mínimo de 10% restringe a competitividade e prejudica micro e pequenas empresas. Pede a exclusão da exigência (ou sua troca por garantia de proposta) e a republicação do edital com reabertura de prazo.",
    mensagemCompleta:
      "Trata-se de pedido de impugnação ao instrumento convocatório do Pregão Eletrônico nº 12/2026, especificamente quanto à exigência de comprovação de capital social mínimo equivalente a 10% (dez por cento) do valor estimado da contratação, prevista no item 7.5 do edital.\n\nA exigência, da forma como redigida, configura restrição indevida à competitividade e afronta os princípios da isonomia e da ampla participação consagrados na Lei nº 14.133/2021. O percentual estabelecido extrapola o limite necessário à aferição da qualificação econômico-financeira e, na prática, inviabiliza a participação de microempresas e empresas de pequeno porte plenamente aptas à execução do objeto.\n\nRessalte-se que a Administração dispõe de meios menos gravosos para assegurar a qualificação econômico-financeira dos licitantes, tais como a exigência de índices contábeis (liquidez geral, solvência geral e liquidez corrente) ou a apresentação de garantia de proposta, nos termos do art. 58 da referida lei.\n\nDiante do exposto, requer-se: (i) o conhecimento e provimento da presente impugnação; (ii) a revisão do item 7.5 do edital, com a exclusão da exigência de capital social mínimo ou sua substituição por garantia de proposta; e (iii) a republicação do edital, com a consequente reabertura do prazo legal, de modo a preservar a competitividade e a legalidade do certame.\n\nAcrescenta-se que a manutenção da exigência impugnada, nos termos em que redigida, poderá ensejar a redução do universo de licitantes aptos e, por conseguinte, prejuízo à obtenção da proposta mais vantajosa para a Administração. Protesta-se, desde já, pela juntada posterior de documentos e pareceres técnicos que corroborem as alegações ora deduzidas, requerendo-se o recebimento e a apreciação da presente impugnação em todos os seus termos.",
    resposta: {
      texto:
        "Impugnação conhecida e, no mérito, INDEFERIDA. A exigência de capital social mínimo de 10% está em conformidade com o art. 69 da Lei nº 14.133/2021, observando estritamente o limite legal de qualificação econômico-financeira. Mantêm-se inalteradas as condições do edital e a data designada para a realização da sessão pública.",
    },
    anexos: [
      { nome: "Impugnacao_capital_social.pdf", tamanho: "318 KB" },
      { nome: "Procuracao.pdf", tamanho: "96 KB" },
      { nome: "Contrato_social_consolidado.pdf", tamanho: "1.2 MB" },
      { nome: "Balanco_patrimonial_2025.pdf", tamanho: "842 KB" },
      { nome: "Certidao_negativa_debitos.pdf", tamanho: "154 KB" },
      { nome: "Atestado_capacidade_tecnica.pdf", tamanho: "276 KB" },
      { nome: "Parecer_juridico_anexo.pdf", tamanho: "512 KB" },
      { nome: "Jurisprudencia_TCU_acordao.pdf", tamanho: "388 KB" },
      { nome: "Demonstrativo_indices_contabeis.pdf", tamanho: "201 KB" },
    ],
  },
  // Segunda impugnação, ainda SEM resposta (demonstra "Aguardando resposta").
  {
    id: "e04",
    type: "OBJECTION_REQUEST",
    portal: "PNCP",
    licitacao: "pe12",
    autor: "Licitante: Sigma Sistemas",
    minAtras: 60 * 5, // impugnação há 5 h; exibido há ~3 h
    minAtrasAtualizacao: 200,
    lida: true,
    mensagem: "Pedido de impugnação quanto ao prazo de entrega previsto no item 9 do edital.",
    mensagemCompleta:
      "Pedido de impugnação ao instrumento convocatório do Pregão Eletrônico nº 12/2026 quanto ao prazo de entrega de 10 (dez) dias previsto no item 9 do edital, considerado exíguo e desproporcional à complexidade e ao volume do objeto licitado.\n\nO prazo estabelecido, da forma como redigido, inviabiliza a adequada execução do fornecimento por licitantes que não disponham de estoque imediato, configurando restrição injustificada à competitividade e afronta ao princípio da ampla participação previsto na Lei nº 14.133/2021.\n\nDiante do exposto, requer-se a dilação do prazo de entrega para, no mínimo, 30 (trinta) dias corridos, com a consequente republicação do edital e reabertura do prazo legal.",
    anexos: [{ nome: "Impugnacao_prazo_entrega.pdf", tamanho: "204 KB" }],
  },
  {
    id: "e05",
    type: "CLARIFICATION_REQUEST",
    portal: "Compras.gov",
    licitacao: "pe07",
    autor: "Licitante: Beta Serviços",
    minAtras: 60 * 3,
    lida: true,
    mensagem: "Pedido de esclarecimento sobre a forma de comprovação da qualificação econômico-financeira para o lote 2.",
  },
  {
    id: "e06",
    type: "APPEAL_INTENTION",
    portal: "Compras.gov",
    licitacao: "pe07",
    autor: "Licitante: Gamma Engenharia",
    minAtras: 60 * 11,
    lida: false,
    mensagem: "Manifestação de intenção de recurso quanto à decisão de classificação das propostas do lote 1.",
  },
  // Evento que NÃO deve aparecer (regra: APPEAL_REASON não é exibido)
  {
    id: "e07",
    type: "APPEAL_REASON",
    portal: "Compras.gov",
    licitacao: "pe07",
    autor: "Sistema",
    minAtras: 60 * 11,
    lida: false,
    mensagem: "(este evento não deve ser exibido na lista)",
  },
  {
    id: "e08",
    type: "APPEAL_JUDGMENT", // portal PNCP => mapeado para Aviso (log administrativo)
    portal: "PNCP",
    licitacao: "pe12",
    autor: "Autoridade Competente",
    minAtras: 60 * 26, // ~1 dia; exibido há ~20 h
    minAtrasAtualizacao: 60 * 20,
    lida: true,
    mensagem: "Registro administrativo de julgamento publicado no portal.",
    resumo:
      "Registro administrativo de julgamento de recurso publicado no portal (PNCP). Conteúdo informativo, sem abertura de novo prazo recursal.",
    mensagemCompleta:
      "Registro administrativo de julgamento de recurso publicado no Portal Nacional de Contratações Públicas. Comunica-se que a autoridade competente proferiu decisão nos autos do recurso administrativo interposto em face do resultado de julgamento das propostas, cujo inteiro teor encontra-se disponível para consulta no portal oficial.\n\nO presente registro tem natureza meramente informativa e administrativa, destinando-se a dar publicidade ao andamento processual do certame, nos termos do princípio da publicidade que rege as contratações públicas. Eventuais interessados poderão acessar a íntegra da decisão, bem como as peças que instruem o processo, mediante consulta ao número do processo administrativo correspondente.\n\nNão decorre do presente aviso a abertura de novo prazo recursal, salvo deliberação expressa em sentido contrário pela autoridade competente. Reitera-se que todos os prazos processuais correm na forma da legislação aplicável e do edital, contando-se em dias úteis, salvo disposição expressa em contrário. As comunicações relativas ao presente certame serão realizadas preferencialmente por meio eletrônico, sendo de responsabilidade dos licitantes a manutenção de seus dados cadastrais atualizados junto ao sistema.",
  },
  {
    id: "e09",
    type: "APPEAL_COUNTER_REASON",
    portal: "Compras.gov",
    licitacao: "pe07",
    autor: "Licitante: Delta Soluções",
    minAtras: DIA * 3,
    lida: true,
    mensagem: "Apresentação de contrarrazões ao recurso interposto pelo licitante classificado em 1º lugar.",
    anexos: [{ nome: "Contrarrazoes.pdf", tamanho: "210 KB" }],
  },
  {
    id: "e10",
    type: "CLARIFICATION_RESPONSE",
    portal: "Compras.gov",
    licitacao: "cc003",
    autor: "Equipe de Licitação, UFMG",
    minAtras: DIA * 5,
    lida: true,
    mensagem: "Resposta consolidada aos pedidos de esclarecimento recebidos até o prazo legal.",
    resposta: {
      novaResposta: false,
      texto: "Foram respondidos 7 pedidos de esclarecimento. Ver anexo com o quadro consolidado de perguntas e respostas.",
    },
    anexos: [{ nome: "Quadro_Esclarecimentos_consolidado.pdf", tamanho: "512 KB" }],
  },
  {
    id: "e11",
    type: "NOTICE",
    portal: "PNCP",
    licitacao: "cc003",
    autor: "Pregoeiro, UFMG",
    minAtras: DIA * 9,
    lida: true,
    mensagem: "Aviso de reabertura de prazo para envio de propostas após retificação do edital.",
  },
  {
    id: "e12",
    type: "OBJECTION_REQUEST",
    portal: "PNCP",
    licitacao: "cc003",
    autor: "Licitante: Épsilon Materiais",
    minAtras: DIA * 14,
    lida: true,
    mensagem: "Impugnação quanto à descrição técnica do item 12 (especificação supostamente direcionada a marca específica).",
  },
  // Cenário de RECURSO encadeado na PE 12/2026: as etapas compartilham recursoId e a UI
  // agrupa tudo em UM item (intenção e razões, contrarrazões, julgamento).
  // APPEAL_REASON não vira item próprio, mas entra como ETAPA do recurso.
  {
    // Intenção + Razões consolidadas em UMA etapa (título único).
    id: "e13ab",
    type: "APPEAL_REASON",
    portal: "Compras.gov",
    licitacao: "pe12",
    recursoId: "rec-pe12-hab1",
    recursoTitulo: "Recurso à decisão de habilitação (Item 1)",
    etapaLabel: "Intenção e razões do recurso",
    etapaCurto: "Intenção e razões",
    autor: "Licitante: Gamma Engenharia",
    documento: "CNPJ 12.345.678/0001-90",
    minAtras: DIA * 3,
    lida: true,
    mensagem:
      "Manifestação de intenção de recurso, apresentada de forma motivada e tempestiva ao final da sessão pública, contra a decisão que habilitou a empresa classificada em primeiro lugar no item 1 do certame, com reserva do direito de apresentar as razões no prazo legal de três dias úteis (art. 165 da Lei nº 14.133/2021).\n\nNas razões, o recorrente sustenta que a empresa habilitada não atende ao requisito de qualificação técnica do item 7.2 do edital, que exige atestado de capacidade técnica com quantitativo compatível com o objeto. O atestado apresentado pela vencedora refere-se a quantitativo inferior ao mínimo exigido e não especifica o período de execução nem a parcela realizada, o que compromete sua validade.\n\nDiante disso, requer o conhecimento e o provimento do recurso, para reformar a decisão de habilitação, com a inabilitação da empresa classificada em primeiro lugar e a retomada do certame com os licitantes remanescentes.",
    anexos: [{ nome: "Razoes_do_recurso.pdf", tamanho: "240 KB" }],
  },
  {
    id: "e13c",
    type: "APPEAL_COUNTER_REASON",
    portal: "Compras.gov",
    licitacao: "pe12",
    recursoId: "rec-pe12-hab1",
    autor: "Licitante: Alfa Tecnologia LTDA",
    documento: "CNPJ 98.765.432/0001-10",
    minAtras: DIA * 2,
    lida: true,
    mensagem:
      "A empresa recorrida, na qualidade de classificada em primeiro lugar e devidamente habilitada, vem apresentar suas CONTRARRAZÕES ao recurso interposto, requerendo, ao final, o seu integral desprovimento.\n\nDe início, cumpre afastar a alegação de insuficiência do atestado de capacidade técnica. Ao contrário do sustentado pelo recorrente, a documentação apresentada comprova de forma inequívoca a execução de serviços de natureza e quantitativo plenamente compatíveis com o objeto licitado, atendendo integralmente ao disposto no item 7.2 do edital.\n\nO atestado juntado refere-se a contrato concluído, com indicação expressa do período de execução, do quantitativo total executado e da plena satisfação do contratante, encontrando-se acompanhado da respectiva certidão de acervo técnico, o que confere a necessária higidez probatória ao documento. A tentativa do recorrente de desqualificar a prova carreada aos autos não encontra respaldo nos elementos concretos do processo.\n\nDestaque-se, ademais, que o somatório de atestados é expressamente admitido pelo edital e pela jurisprudência consolidada dos órgãos de controle, de modo que eventual fracionamento da comprovação não constitui óbice à habilitação. As exigências editalícias foram, portanto, rigorosamente cumpridas pela recorrida.\n\nPelo exposto, requer-se o conhecimento das presentes contrarrazões e, no mérito, o NÃO PROVIMENTO do recurso, mantendo-se incólume a decisão de habilitação e o resultado do certame, por ser medida de inteira justiça e estrita observância à legalidade.",
    anexos: [{ nome: "Contrarrazoes_PE12-2026.pdf", tamanho: "188 KB" }],
  },
  {
    id: "e13d",
    type: "APPEAL_JUDGMENT",
    portal: "Compras.gov",
    licitacao: "pe12",
    recursoId: "rec-pe12-hab1",
    resultado: "Improvido",
    autor: "Autoridade Competente",
    minAtras: 60 * 20, // ~20 h (etapa mais recente)
    lida: false,
    mensagem:
      "Decisão da autoridade competente acerca do recurso administrativo interposto em face da decisão de habilitação no item 1 do Pregão Eletrônico nº 12/2026.\n\nConhece-se do recurso, porquanto tempestivo e dotado dos requisitos de admissibilidade. No mérito, analisadas as razões recursais e as contrarrazões apresentadas, verifica-se que a documentação de habilitação da empresa classificada em primeiro lugar atende às exigências do item 7.2 do edital. O atestado de capacidade técnica apresentado, acompanhado da respectiva certidão de acervo técnico, comprova a execução de serviços em quantitativo compatível com o objeto, admitido o somatório de atestados conforme previsão editalícia.\n\nNão se sustentam, portanto, as alegações de insuficiência probatória deduzidas pelo recorrente, que não logrou demonstrar a existência de vício apto a macular a decisão de habilitação. As contrarrazões, por sua vez, encontram-se devidamente fundamentadas e amparadas nos elementos dos autos.\n\nAnte o exposto, a autoridade competente decide CONHECER do recurso para, no mérito, NEGAR-LHE PROVIMENTO, mantendo-se a decisão de habilitação da empresa classificada em primeiro lugar e o resultado do certame. Publique-se e intimem-se os interessados.",
  },
]

/* ------------------------------------------------------------------ */
/* Itens da lista (já mapeados)                                        */
/* ------------------------------------------------------------------ */

export type EtapaDeRecurso = {
  tipo: TipoBackend
  etapa: string
  curto: string
  autor: string
  documento: string | null
  date: Date
  texto: string
  anexos: Anexo[] | null
  resultado: string | null
  lida: boolean
}

export type Manifestacao = {
  id: string
  categoria: Categoria
  licitacao: string
  lida: boolean
  /** data do evento (resposta, quando houver) */
  date: Date
  /** data de envio da mensagem (quando difere da data do evento) */
  dateMensagem: Date
  /** quando o card foi exibido ao cliente: a lista ordena por ela */
  dateAtualizacao: Date
  mensagem: string
  mensagemCompleta?: string
  resposta?: { novaResposta?: boolean; texto: string }
  anexos?: Anexo[]
  // só recurso encadeado
  titulo?: string
  etapas?: EtapaDeRecurso[]
  status?: "em_andamento" | "provido" | "improvido"
}

const ETAPA_RECURSO: Partial<Record<TipoBackend, { etapa: string; curto: string }>> = {
  APPEAL_INTENTION: { etapa: "Intenção de recurso", curto: "Intenção" },
  APPEAL_REASON: { etapa: "Razões do recurso", curto: "Razões" },
  APPEAL_COUNTER_REASON: { etapa: "Contrarrazões", curto: "Contrarrazões" },
  APPEAL_JUDGMENT: { etapa: "Julgamento do recurso", curto: "Julgamento" },
}

/** Aplica o mapeamento, filtra os ocultos, agrupa recursos e ordena (atualização mais recente primeiro). */
function montarLista(): Manifestacao[] {
  const agora = Date.now()
  const haMinutos = (min: number) => new Date(agora - min * 60000)
  const recursos = new Map<string, Manifestacao>()
  const lista: Manifestacao[] = []

  for (const ev of EVENTOS) {
    const m = mapBackendEvent(ev.type, ev.portal)
    const date = haMinutos(ev.minAtras)

    // Recurso encadeado: etapas com o mesmo recursoId viram UM item.
    if (ev.recursoId && m.categoria === "recurso") {
      if (!MOSTRAR_RECURSO) continue
      const meta = ETAPA_RECURSO[ev.type] ?? { etapa: ev.type, curto: ev.type }
      let grupo = recursos.get(ev.recursoId)
      if (!grupo) {
        grupo = {
          id: ev.recursoId,
          categoria: "recurso",
          licitacao: ev.licitacao,
          lida: true,
          date,
          dateMensagem: date,
          dateAtualizacao: haMinutos(60 * 3), // exibido ao cliente há ~3 h
          mensagem: "",
          titulo: ev.recursoTitulo ?? "Recurso",
          etapas: [],
        }
        recursos.set(ev.recursoId, grupo)
        lista.push(grupo)
      }
      if (ev.recursoTitulo) grupo.titulo = ev.recursoTitulo
      grupo.etapas!.push({
        tipo: ev.type,
        etapa: ev.etapaLabel ?? meta.etapa,
        curto: ev.etapaCurto ?? meta.curto,
        autor: ev.autor,
        documento: ev.documento ?? null,
        date,
        texto: ev.mensagem,
        anexos: ev.anexos ?? null,
        resultado: ev.resultado ?? null,
        lida: ev.lida,
      })
      continue
    }

    if (!m.exibir) continue
    lista.push({
      id: ev.id,
      categoria: m.categoria,
      licitacao: ev.licitacao,
      lida: ev.lida,
      date,
      dateMensagem: ev.minAtrasMensagem != null ? haMinutos(ev.minAtrasMensagem) : date,
      dateAtualizacao: ev.minAtrasAtualizacao != null ? haMinutos(ev.minAtrasAtualizacao) : date,
      mensagem: ev.mensagem,
      mensagemCompleta: ev.mensagemCompleta,
      resposta: ev.resposta,
      anexos: ev.anexos,
    })
  }

  // Fecha cada recurso: etapas em ordem cronológica, status, data e anexos agregados.
  for (const grupo of recursos.values()) {
    const etapas = grupo.etapas!
    etapas.sort((a, b) => a.date.getTime() - b.date.getTime())
    grupo.date = etapas[etapas.length - 1].date
    grupo.dateMensagem = etapas[0].date
    grupo.mensagem = etapas[0].texto
    grupo.mensagemCompleta = `${grupo.titulo}. ${etapas[0].texto}`
    grupo.anexos = etapas.flatMap((e) => e.anexos ?? [])
    const julgamento = etapas.find((e) => e.tipo === "APPEAL_JUDGMENT")
    grupo.status = julgamento
      ? /improv/i.test(julgamento.resultado ?? julgamento.texto)
        ? "improvido"
        : "provido"
      : "em_andamento"
    grupo.lida = !etapas.some((e) => !e.lida)
  }

  return lista.sort((a, b) => b.dateAtualizacao.getTime() - a.dateAtualizacao.getTime())
}

const LATENCIA = 450 // ms: simula a rede

/** Carrega as manifestações de uma licitação (simula a API). */
export function carregarManifestacoes(licitacaoId: string): Promise<Manifestacao[]> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(montarLista().filter((i) => i.licitacao === licitacaoId)), LATENCIA)
  })
}

export const LICITACAO_ATUAL = LICITACOES.pe12

/* ------------------------------------------------------------------ */
/* Arquivos da licitação                                               */
/* ------------------------------------------------------------------ */

export const ARQUIVOS_EDITAL: Anexo[] = [
  { nome: "Edital_Pregao_Eletronico_12-2026.pdf", tamanho: "2.4 MB" },
  { nome: "Termo_de_Referencia.pdf", tamanho: "890 KB" },
  { nome: "Minuta_do_Contrato.pdf", tamanho: "512 KB" },
]

// Arquivos de manifestação capturados na licitação SEM associação a uma manifestação
// específica. O tipo vem do nome do arquivo (PNCP). Fase 1: todos com tipo conhecido.
export const ARQUIVOS_SEM_VINCULO: (Anexo & { tipo: Categoria })[] = [
  { nome: "Respostas_aos_questionamentos.pdf", tamanho: "412 KB", tipo: "esclarecimento" },
  { nome: "Esclarecimentos_complementares.pdf", tamanho: "188 KB", tipo: "esclarecimento" },
  { nome: "Decisao_impugnacao_capital_social.pdf", tamanho: "256 KB", tipo: "impugnacao" },
  { nome: "Analise_impugnacao_prazo_entrega.pdf", tamanho: "174 KB", tipo: "impugnacao" },
]

/* ------------------------------------------------------------------ */
/* Cabeçalho da licitação                                              */
/* ------------------------------------------------------------------ */

export const RESPONSAVEIS = [
  { initials: "MS", name: "Mariana Souza" },
  { initials: "RL", name: "Ricardo Lima" },
  { initials: "PA", name: "Paulo Almeida" },
]

/* ------------------------------------------------------------------ */
/* Formatação                                                          */
/* ------------------------------------------------------------------ */

/** "DD/MM/AAAA às HH:MM" (data e hora pontuais, não "há X min"). */
export function formatarDataHora(date: Date) {
  const p = (n: number) => String(n).padStart(2, "0")
  return `${p(date.getDate())}/${p(date.getMonth() + 1)}/${date.getFullYear()} às ${p(date.getHours())}:${p(date.getMinutes())}`
}

// Preview do card: texto original cortado por nº de caracteres. p50 (~745): a mediana cabe inteira.
const LIMITE_DO_PREVIEW = 745

export function truncar(texto: string) {
  const limpo = texto.replace(/\s+/g, " ").trim()
  return limpo.length > LIMITE_DO_PREVIEW ? limpo.slice(0, LIMITE_DO_PREVIEW).trimEnd() + "…" : limpo
}
