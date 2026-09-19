// Fonte de dados (mock) da central de notificações da licitação.
// Implementa o "Mapeamento de tipos (backend -> UI)" do documento e expõe uma carga
// assíncrona que simula a API (latência). A API ainda não está confirmada: tudo passa
// por mapBackendEvent(), então trocar a fonte depois não exige mudar a interface.

/* ------------------------------------------------------------------ */
/* Categorias e abas                                                   */
/* ------------------------------------------------------------------ */

export type Categoria = "aviso" | "impugnacao" | "esclarecimento" | "recurso"

/** cor: variante de categoria do Badge (Aviso 1, Questionamento 2, Impugnação 3, Recurso 4). */
export const CATEGORIAS: Record<
  Categoria,
  { label: string; plural: string; cor: "category-1" | "category-2" | "category-3" | "category-4" }
> = {
  aviso: { label: "Aviso", plural: "Avisos", cor: "category-1" },
  impugnacao: { label: "Impugnação", plural: "Impugnações", cor: "category-3" },
  // CLARIFICATION_* (termo de UI: Questionamento)
  esclarecimento: { label: "Questionamento", plural: "Questionamentos", cor: "category-2" },
  recurso: { label: "Recurso", plural: "Recursos", cor: "category-4" },
}

/* O modelo suporta a categoria 'recurso' desde já. Com a aba dedicada desligada,
 * os recursos aparecem em "Todas" e, nas abas de categoria, sob "Avisos". */
const MVP_RECURSOS_TAB = true

const ABAS_BASE = [
  { id: "todas", label: "Todas" },
  { id: "aviso", label: "Avisos" },
  { id: "esclarecimento", label: "Questionamentos" },
  { id: "impugnacao", label: "Impugnações" },
]

export const ABAS = MVP_RECURSOS_TAB ? [...ABAS_BASE, { id: "recurso", label: "Recursos" }] : ABAS_BASE

/** Em qual aba cada categoria é contada/filtrada. */
export function abaDaCategoria(categoria: Categoria) {
  if (categoria === "recurso" && !MVP_RECURSOS_TAB) return "aviso"
  return categoria
}

// Abas primárias do workspace. Manifestações é a única "viva" no protótipo;
// Itens e Análise técnica servem para demonstrar a regra do indicador de "novo".
export const ABAS_DO_WORKSPACE = [
  { id: "itens", label: "Itens" },
  { id: "analise", label: "Análise técnica" },
  { id: "manifestacoes", label: "Manifestações", beta: true },
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
  /** minutos atrás do envio da mensagem, quando difere da data do evento (resposta) */
  minAtrasMensagem?: number
  lida: boolean
  mensagem: string
  resumo?: string
  resumoAuto?: string
  mensagemCompleta?: string
  resposta?: { novaResposta?: boolean; texto: string }
  anexos?: Anexo[]
  /** duplicatas da mesma manifestação (ex.: enviada por lote) viram 1 item */
  grupoId?: string
  // recurso encadeado: etapas que compartilham recursoId viram um item só
  recursoId?: string
  recursoTitulo?: string
  etapaLabel?: string
  etapaCurto?: string
  resultado?: string
}

export const LICITACOES = {
  pe12: { id: "pe12", label: "PE 12/2026 · Prefeitura SP" },
  pe07: { id: "pe07", label: "PE 07/2026 · Gov. RJ" },
  cc003: { id: "cc003", label: "CC 003/2026 · UFMG" },
}

// Obs.: o evento e07 (APPEAL_REASON) não deve aparecer na lista (regra do documento).
// As etapas com recursoId "rec-pe12-hab1" formam um único item de recurso
// (intenção e razões, contrarrazões, julgamento).
const EVENTOS: EventoCru[] = 
[
  {
    id: "e01",
    type: "NOTICE",
    portal: "PNCP",
    licitacao: "pe12",
    autor: "Pregoeiro, Prefeitura SP",
    minAtras: 0,
    lida: false,
    mensagem: "Comunicado de suspensão da sessão pública do Pregão Eletrônico nº 12/2026.",
    resumo: "A sessão pública foi suspensa por tempo indeterminado para análise de questionamentos e impugnações. Nova data será publicada nos canais oficiais.",
    mensagemCompleta: "Comunicado de suspensão da sessão pública. A autoridade competente, no uso de suas atribuições e com fundamento no art. 71 da Lei nº 14.133/2021, torna público que a sessão pública do Pregão Eletrônico nº 12/2026, anteriormente agendada para esta data, fica SUSPENSA por tempo indeterminado, em razão da necessidade de análise dos questionamentos e impugnações apresentados tempestivamente ao instrumento convocatório.\n\nA suspensão tem por finalidade resguardar a lisura e a competitividade do certame, assegurando a todos os interessados prazo adequado para a compreensão das eventuais alterações que venham a ser promovidas no edital e em seus anexos. Eventuais respostas aos pedidos de esclarecimento e às impugnações serão publicadas no Portal Nacional de Contratações Públicas (PNCP) e no sítio eletrônico oficial do órgão, passando a integrar o edital para todos os efeitos legais.\n\nNova data para a realização da sessão pública será oportunamente divulgada pelos mesmos meios de publicação, observado o prazo mínimo legal de antecedência. Os licitantes que já tenham encaminhado suas propostas e documentos de habilitação poderão mantê-los ou substituí-los até a nova data designada, não havendo qualquer prejuízo à sua participação. Recomenda-se o acompanhamento diário das publicações oficiais relativas a este certame.\n\nFica facultado aos interessados o protocolo de novos pedidos de esclarecimento e de impugnação, observados os prazos legais, os quais serão igualmente respondidos e publicados nos canais oficiais. A Administração reafirma seu compromisso com a transparência, a isonomia e a busca da proposta mais vantajosa, nos termos dos princípios que regem as contratações públicas."
  },
  {
    id: "e02",
    type: "CLARIFICATION_RESPONSE",
    portal: "PNCP",
    licitacao: "pe12",
    autor: "Equipe de Licitação",
    minAtras: 18,
    minAtrasMensagem: 2880,
    lida: false,
    mensagem: "Resposta ao pedido de esclarecimento nº 3 referente ao item 4.2 do Termo de Referência.",
    resumo: "Esclarecimento sobre a comprovação de qualificação técnica (item 4.2): atestado pode ser da empresa ou do responsável técnico, com somatório admitido. Já respondido pela equipe.",
    mensagemCompleta: "Pedido de esclarecimento nº 3, protocolado tempestivamente, referente ao item 4.2 do Termo de Referência do Pregão Eletrônico nº 12/2026. O interessado solicita esclarecimento quanto à forma de comprovação da qualificação técnica exigida, especificamente sobre a possibilidade de o atestado de capacidade técnica ser emitido em nome de responsável técnico vinculado à empresa licitante, e não exclusivamente em nome da pessoa jurídica.\n\nIndaga-se, ainda, se o quantitativo mínimo previsto no subitem 4.2.1 deverá ser comprovado por meio de um único atestado ou se será admitido o somatório de atestados distintos, emitidos por diferentes contratantes, para fins de alcance do quantitativo total exigido. Questiona-se também se contratos em execução, ainda não concluídos, poderão ser considerados para a referida comprovação, desde que acompanhados de declaração do contratante atestando a parcela já executada.\n\nPor fim, requer-se esclarecimento sobre a data de referência para a verificação do vínculo do responsável técnico com a empresa: se a data de abertura da sessão pública, se a data de assinatura do eventual contrato, ou outra data a ser definida pela Administração. Solicita-se que a resposta seja publicada no portal para conhecimento de todos os interessados, passando a integrar o edital.\n\nReitera-se que o presente pedido foi formulado com estrita observância ao prazo previsto no edital, requerendo-se a publicação da resposta em campo de fácil acesso no portal, de modo a garantir igualdade de informação entre todos os participantes do certame.",
    resposta: {
      novaResposta: true,
      texto: "Em resposta ao pedido de esclarecimento nº 3, a equipe de licitação informa que: (i) o atestado de capacidade técnica poderá ser apresentado em nome da empresa licitante ou de seu responsável técnico, desde que comprovado o vínculo na data da sessão pública, nos termos do item 4.2.1 do edital; (ii) será admitido o somatório de atestados para fins de comprovação do quantitativo mínimo exigido; (iii) contratos em execução serão aceitos desde que acompanhados de declaração do contratante quanto à parcela executada. As demais condições do edital permanecem inalteradas."
    },
    anexos: [
      {
        nome: "Resposta_Esclarecimento_03.pdf",
        tamanho: "142 KB"
      }
    ]
  },
  {
    id: "e03",
    type: "OBJECTION_REQUEST",
    portal: "PNCP",
    licitacao: "pe12",
    autor: "Licitante: Alfa Tecnologia LTDA",
    minAtras: 47,
    lida: false,
    mensagem: "Pedido de impugnação ao instrumento editalício quanto à exigência de comprovação de capital social mínimo, por suposta restrição à competitividade nos termos da Lei 14.133/2021.",
    resumo: "Impugnação ao item 7.5 do edital: a exigência de capital social mínimo de 10% restringiria a competitividade e prejudicaria micro e pequenas empresas. Pede a exclusão da exigência e a republicação do edital.",
    resumoAuto: "A empresa impugna o item 7.5 do edital: a exigência de capital social mínimo de 10% restringe a competitividade e prejudica micro e pequenas empresas. Pede a exclusão da exigência (ou sua troca por garantia de proposta) e a republicação do edital com reabertura de prazo.",
    mensagemCompleta: "Trata-se de pedido de impugnação ao instrumento convocatório do Pregão Eletrônico nº 12/2026, especificamente quanto à exigência de comprovação de capital social mínimo equivalente a 10% (dez por cento) do valor estimado da contratação, prevista no item 7.5 do edital.\n\nA exigência, da forma como redigida, configura restrição indevida à competitividade e afronta os princípios da isonomia e da ampla participação consagrados na Lei nº 14.133/2021. O percentual estabelecido extrapola o limite necessário à aferição da qualificação econômico-financeira e, na prática, inviabiliza a participação de microempresas e empresas de pequeno porte plenamente aptas à execução do objeto.\n\nRessalte-se que a Administração dispõe de meios menos gravosos para assegurar a qualificação econômico-financeira dos licitantes, tais como a exigência de índices contábeis (liquidez geral, solvência geral e liquidez corrente) ou a apresentação de garantia de proposta, nos termos do art. 58 da referida lei.\n\nDiante do exposto, requer-se: (i) o conhecimento e provimento da presente impugnação; (ii) a revisão do item 7.5 do edital, com a exclusão da exigência de capital social mínimo ou sua substituição por garantia de proposta; e (iii) a republicação do edital, com a consequente reabertura do prazo legal, de modo a preservar a competitividade e a legalidade do certame.\n\nAcrescenta-se que a manutenção da exigência impugnada, nos termos em que redigida, poderá ensejar a redução do universo de licitantes aptos e, por conseguinte, prejuízo à obtenção da proposta mais vantajosa para a Administração. Protesta-se, desde já, pela juntada posterior de documentos e pareceres técnicos que corroborem as alegações ora deduzidas, requerendo-se o recebimento e a apreciação da presente impugnação em todos os seus termos.",
    anexos: [
      {
        nome: "Impugnacao_capital_social.pdf",
        tamanho: "318 KB"
      },
      {
        nome: "Procuracao.pdf",
        tamanho: "96 KB"
      },
      {
        nome: "Contrato_social_consolidado.pdf",
        tamanho: "1.2 MB"
      },
      {
        nome: "Balanco_patrimonial_2025.pdf",
        tamanho: "842 KB"
      },
      {
        nome: "Certidao_negativa_debitos.pdf",
        tamanho: "154 KB"
      },
      {
        nome: "Atestado_capacidade_tecnica.pdf",
        tamanho: "276 KB"
      },
      {
        nome: "Parecer_juridico_anexo.pdf",
        tamanho: "512 KB"
      },
      {
        nome: "Jurisprudencia_TCU_acordao.pdf",
        tamanho: "388 KB"
      },
      {
        nome: "Demonstrativo_indices_contabeis.pdf",
        tamanho: "201 KB"
      }
    ]
  },
  {
    id: "e04a",
    type: "OBJECTION_RESPONSE",
    portal: "PNCP",
    licitacao: "pe12",
    autor: "Procuradoria",
    minAtras: 130,
    minAtrasMensagem: 4320,
    grupoId: "resp-impug-7",
    lida: true,
    mensagem: "Resposta à impugnação ao instrumento editalício (lote 1).",
    resumo: "Resposta à impugnação do capital social mínimo (item 7.5): conhecida e, no mérito, indeferida. A exigência está conforme o art. 69 da Lei 14.133/2021; mantida a data da sessão.",
    mensagemCompleta: "Trata-se de resposta à impugnação apresentada em face do instrumento convocatório do Pregão Eletrônico nº 12/2026, na qual a impugnante sustenta a suposta ilegalidade da exigência de capital social mínimo prevista no item 7.5 do edital.\n\nPreliminarmente, registra-se que a impugnação foi apresentada tempestivamente, razão pela qual dela se conhece. No mérito, contudo, não assiste razão à impugnante, pelas razões a seguir expostas.\n\nA exigência de capital social mínimo equivalente a 10% do valor estimado da contratação encontra amparo expresso no art. 69 da Lei nº 14.133/2021, que faculta à Administração exigir, para fins de qualificação econômico-financeira, capital social ou patrimônio líquido mínimo de até 10% do valor estimado da contratação. Trata-se, portanto, de exigência que observa estritamente o limite legal, não havendo que se falar em restrição indevida à competitividade.\n\nNão prospera o argumento de que a exigência inviabilizaria a participação de microempresas e empresas de pequeno porte. A uma, porque o tratamento favorecido conferido a tais empresas pela Lei Complementar nº 123/2006 não as exime da comprovação de qualificação econômico-financeira compatível com o vulto da contratação. A duas, porque a exigência se aplica isonomicamente a todos os licitantes, sem qualquer distinção que configure direcionamento.\n\nQuanto à alegação de existência de meios menos gravosos, esclarece-se que a escolha entre as alternativas legalmente admitidas para a aferição da qualificação econômico-financeira insere-se no âmbito da discricionariedade técnica da Administração, desde que devidamente motivada, como se verifica no presente caso, em que o elevado valor e a complexidade do objeto justificam a cautela adotada.\n\nDiante do exposto, e considerando a plena conformidade da exigência impugnada com o ordenamento jurídico vigente, conhece-se da impugnação para, no mérito, NEGAR-LHE PROVIMENTO, mantendo-se inalteradas as condições do edital e a data designada para a realização da sessão pública. Publique-se a presente decisão no Portal Nacional de Contratações Públicas e no sítio eletrônico oficial do órgão, para conhecimento de todos os interessados.",
    resposta: {
      novaResposta: false,
      texto: "A exigência de capital social mínimo está em conformidade com o art. 69 da Lei 14.133/2021. Impugnação conhecida e, no mérito, INDEFERIDA. Mantém-se a data da sessão."
    }
  },
  {
    id: "e04b",
    type: "OBJECTION_RESPONSE",
    portal: "PNCP",
    licitacao: "pe12",
    autor: "Procuradoria",
    minAtras: 130,
    grupoId: "resp-impug-7",
    lida: true,
    mensagem: "Resposta à impugnação ao instrumento editalício (lote 2).",
    resposta: {
      novaResposta: false,
      texto: "Conteúdo idêntico ao envio do lote 1 (resposta replicada)."
    }
  },
  {
    id: "e04c",
    type: "OBJECTION_RESPONSE",
    portal: "PNCP",
    licitacao: "pe12",
    autor: "Procuradoria",
    minAtras: 132,
    grupoId: "resp-impug-7",
    lida: true,
    mensagem: "Resposta à impugnação ao instrumento editalício (lote 3).",
    resposta: {
      novaResposta: false,
      texto: "Conteúdo idêntico ao envio do lote 1 (resposta replicada)."
    }
  },
  {
    id: "e05",
    type: "CLARIFICATION_REQUEST",
    portal: "Compras.gov",
    licitacao: "pe07",
    autor: "Licitante: Beta Serviços",
    minAtras: 180,
    lida: true,
    mensagem: "Pedido de esclarecimento sobre a forma de comprovação da qualificação econômico-financeira para o lote 2."
  },
  {
    id: "e06",
    type: "APPEAL_INTENTION",
    portal: "Compras.gov",
    licitacao: "pe07",
    autor: "Licitante: Gamma Engenharia",
    minAtras: 660,
    lida: false,
    mensagem: "Manifestação de intenção de recurso quanto à decisão de classificação das propostas do lote 1."
  },
  {
    id: "e07",
    type: "APPEAL_REASON",
    portal: "Compras.gov",
    licitacao: "pe07",
    autor: "Sistema",
    minAtras: 660,
    lida: false,
    mensagem: "(este evento não deve ser exibido na lista)"
  },
  {
    id: "e08",
    type: "APPEAL_JUDGMENT",
    portal: "PNCP",
    licitacao: "pe12",
    autor: "Autoridade Competente",
    minAtras: 1560,
    lida: true,
    mensagem: "Registro administrativo de julgamento publicado no portal.",
    resumo: "Registro administrativo de julgamento de recurso publicado no portal (PNCP). Conteúdo informativo, sem abertura de novo prazo recursal.",
    mensagemCompleta: "Registro administrativo de julgamento de recurso publicado no Portal Nacional de Contratações Públicas. Comunica-se que a autoridade competente proferiu decisão nos autos do recurso administrativo interposto em face do resultado de julgamento das propostas, cujo inteiro teor encontra-se disponível para consulta no portal oficial.\n\nO presente registro tem natureza meramente informativa e administrativa, destinando-se a dar publicidade ao andamento processual do certame, nos termos do princípio da publicidade que rege as contratações públicas. Eventuais interessados poderão acessar a íntegra da decisão, bem como as peças que instruem o processo, mediante consulta ao número do processo administrativo correspondente.\n\nNão decorre do presente aviso a abertura de novo prazo recursal, salvo deliberação expressa em sentido contrário pela autoridade competente. Reitera-se que todos os prazos processuais correm na forma da legislação aplicável e do edital, contando-se em dias úteis, salvo disposição expressa em contrário. As comunicações relativas ao presente certame serão realizadas preferencialmente por meio eletrônico, sendo de responsabilidade dos licitantes a manutenção de seus dados cadastrais atualizados junto ao sistema."
  },
  {
    id: "e09",
    type: "APPEAL_COUNTER_REASON",
    portal: "Compras.gov",
    licitacao: "pe07",
    autor: "Licitante: Delta Soluções",
    minAtras: 4320,
    lida: true,
    mensagem: "Apresentação de contrarrazões ao recurso interposto pelo licitante classificado em 1º lugar.",
    anexos: [
      {
        nome: "Contrarrazoes.pdf",
        tamanho: "210 KB"
      }
    ]
  },
  {
    id: "e10",
    type: "CLARIFICATION_RESPONSE",
    portal: "Compras.gov",
    licitacao: "cc003",
    autor: "Equipe de Licitação, UFMG",
    minAtras: 7200,
    lida: true,
    mensagem: "Resposta consolidada aos pedidos de esclarecimento recebidos até o prazo legal.",
    resposta: {
      novaResposta: false,
      texto: "Foram respondidos 7 pedidos de esclarecimento. Ver anexo com o quadro consolidado de perguntas e respostas."
    },
    anexos: [
      {
        nome: "Quadro_Esclarecimentos_consolidado.pdf",
        tamanho: "512 KB"
      }
    ]
  },
  {
    id: "e11",
    type: "NOTICE",
    portal: "PNCP",
    licitacao: "cc003",
    autor: "Pregoeiro, UFMG",
    minAtras: 12960,
    lida: true,
    mensagem: "Aviso de reabertura de prazo para envio de propostas após retificação do edital."
  },
  {
    id: "e12",
    type: "OBJECTION_REQUEST",
    portal: "PNCP",
    licitacao: "cc003",
    autor: "Licitante: Épsilon Materiais",
    minAtras: 20160,
    lida: true,
    mensagem: "Impugnação quanto à descrição técnica do item 12 (especificação supostamente direcionada a marca específica)."
  },
  {
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
    minAtras: 4320,
    lida: true,
    mensagem: "Manifestação de intenção de recurso, apresentada de forma motivada e tempestiva ao final da sessão pública, contra a decisão que habilitou a empresa classificada em primeiro lugar no item 1 do certame, com reserva do direito de apresentar as razões no prazo legal de três dias úteis (art. 165 da Lei nº 14.133/2021).\n\nNas razões, o recorrente sustenta que a empresa habilitada não atende ao requisito de qualificação técnica do item 7.2 do edital, que exige atestado de capacidade técnica com quantitativo compatível com o objeto. O atestado apresentado pela vencedora refere-se a quantitativo inferior ao mínimo exigido e não especifica o período de execução nem a parcela realizada, o que compromete sua validade.\n\nDiante disso, requer o conhecimento e o provimento do recurso, para reformar a decisão de habilitação, com a inabilitação da empresa classificada em primeiro lugar e a retomada do certame com os licitantes remanescentes.",
    anexos: [
      {
        nome: "Razoes_do_recurso.pdf",
        tamanho: "240 KB"
      }
    ]
  },
  {
    id: "e13c",
    type: "APPEAL_COUNTER_REASON",
    portal: "Compras.gov",
    licitacao: "pe12",
    recursoId: "rec-pe12-hab1",
    autor: "Licitante: Alfa Tecnologia LTDA",
    documento: "CNPJ 98.765.432/0001-10",
    minAtras: 2880,
    lida: true,
    mensagem: "A empresa recorrida, na qualidade de classificada em primeiro lugar e devidamente habilitada, vem apresentar suas CONTRARRAZÕES ao recurso interposto, requerendo, ao final, o seu integral desprovimento.\n\nDe início, cumpre afastar a alegação de insuficiência do atestado de capacidade técnica. Ao contrário do sustentado pelo recorrente, a documentação apresentada comprova de forma inequívoca a execução de serviços de natureza e quantitativo plenamente compatíveis com o objeto licitado, atendendo integralmente ao disposto no item 7.2 do edital.\n\nO atestado juntado refere-se a contrato concluído, com indicação expressa do período de execução, do quantitativo total executado e da plena satisfação do contratante, encontrando-se acompanhado da respectiva certidão de acervo técnico, o que confere a necessária higidez probatória ao documento. A tentativa do recorrente de desqualificar a prova carreada aos autos não encontra respaldo nos elementos concretos do processo.\n\nDestaque-se, ademais, que o somatório de atestados é expressamente admitido pelo edital e pela jurisprudência consolidada dos órgãos de controle, de modo que eventual fracionamento da comprovação não constitui óbice à habilitação. As exigências editalícias foram, portanto, rigorosamente cumpridas pela recorrida.\n\nPelo exposto, requer-se o conhecimento das presentes contrarrazões e, no mérito, o NÃO PROVIMENTO do recurso, mantendo-se incólume a decisão de habilitação e o resultado do certame, por ser medida de inteira justiça e estrita observância à legalidade.",
    anexos: [
      {
        nome: "Contrarrazoes_PE12-2026.pdf",
        tamanho: "188 KB"
      }
    ]
  },
  {
    id: "e13d",
    type: "APPEAL_JUDGMENT",
    portal: "Compras.gov",
    licitacao: "pe12",
    recursoId: "rec-pe12-hab1",
    resultado: "Improvido",
    autor: "Autoridade Competente",
    minAtras: 1200,
    lida: false,
    mensagem: "Decisão da autoridade competente acerca do recurso administrativo interposto em face da decisão de habilitação no item 1 do Pregão Eletrônico nº 12/2026.\n\nConhece-se do recurso, porquanto tempestivo e dotado dos requisitos de admissibilidade. No mérito, analisadas as razões recursais e as contrarrazões apresentadas, verifica-se que a documentação de habilitação da empresa classificada em primeiro lugar atende às exigências do item 7.2 do edital. O atestado de capacidade técnica apresentado, acompanhado da respectiva certidão de acervo técnico, comprova a execução de serviços em quantitativo compatível com o objeto, admitido o somatório de atestados conforme previsão editalícia.\n\nNão se sustentam, portanto, as alegações de insuficiência probatória deduzidas pelo recorrente, que não logrou demonstrar a existência de vício apto a macular a decisão de habilitação. As contrarrazões, por sua vez, encontram-se devidamente fundamentadas e amparadas nos elementos dos autos.\n\nAnte o exposto, a autoridade competente decide CONHECER do recurso para, no mérito, NEGAR-LHE PROVIMENTO, mantendo-se a decisão de habilitação da empresa classificada em primeiro lugar e o resultado do certame. Publique-se e intimem-se os interessados."
  }
]

/* ------------------------------------------------------------------ */
/* Itens da lista                                                      */
/* ------------------------------------------------------------------ */

export type EtapaDeRecurso = {
  tipo: TipoBackend
  etapa: string
  curto: string
  foco: boolean
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
  autor?: string
  /** data do evento (ou da etapa mais recente, no recurso): a lista ordena por ela */
  date: Date
  /** data de envio da mensagem original */
  dateMensagem: Date
  lida: boolean
  mensagem?: string
  mensagemCompleta?: string
  resposta?: { novaResposta?: boolean; texto: string }
  anexos?: Anexo[]
  copias: number
  grupoId?: string
  // só no recurso encadeado
  titulo?: string
  etapas?: EtapaDeRecurso[]
  status?: "em_andamento" | "provido" | "improvido"
}

// Rótulos das etapas do recurso. A ordem do fluxo é dada pela data.
const ETAPA_RECURSO: Partial<Record<TipoBackend, { etapa: string; curto: string; foco?: boolean }>> = {
  APPEAL_INTENTION: { etapa: "Intenção de recurso", curto: "Intenção" },
  APPEAL_REASON: { etapa: "Razões do recurso", curto: "Razões" },
  APPEAL_COUNTER_REASON: { etapa: "Contrarrazões", curto: "Contrarrazões", foco: true },
  APPEAL_JUDGMENT: { etapa: "Julgamento do recurso", curto: "Julgamento" },
}

const atras = (min: number) => new Date(Date.now() - min * 60000)

/** Aplica o mapeamento, agrupa recursos, deduplica e ordena (recentes primeiro). */
function montarLista(): Manifestacao[] {
  const recursos = new Map<string, Manifestacao>()
  const mapeados: Manifestacao[] = []

  for (const ev of EVENTOS) {
    const m = mapBackendEvent(ev.type, ev.portal)
    const date = atras(ev.minAtras)

    // Recurso encadeado: mesmo APPEAL_REASON (que não vira card próprio) entra como etapa
    if (ev.recursoId && m.categoria === "recurso") {
      const meta = ETAPA_RECURSO[ev.type] ?? { etapa: ev.type, curto: ev.type }
      let grupo = recursos.get(ev.recursoId)
      if (!grupo) {
        grupo = {
          id: ev.recursoId,
          categoria: "recurso",
          licitacao: ev.licitacao,
          titulo: ev.recursoTitulo ?? "Recurso",
          etapas: [],
          copias: 1,
          date,
          dateMensagem: date,
          lida: true,
        }
        recursos.set(ev.recursoId, grupo)
        mapeados.push(grupo)
      }
      if (ev.recursoTitulo) grupo.titulo = ev.recursoTitulo
      grupo.etapas!.push({
        tipo: ev.type,
        etapa: ev.etapaLabel ?? meta.etapa,
        curto: ev.etapaCurto ?? meta.curto,
        foco: !!meta.foco,
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
    mapeados.push({
      id: ev.id,
      categoria: m.categoria,
      licitacao: ev.licitacao,
      autor: ev.autor,
      date,
      dateMensagem: ev.minAtrasMensagem != null ? atras(ev.minAtrasMensagem) : date,
      lida: ev.lida,
      mensagem: ev.mensagem,
      mensagemCompleta: ev.mensagemCompleta,
      resposta: ev.resposta,
      anexos: ev.anexos,
      copias: 1,
      grupoId: ev.grupoId,
    })
  }

  // Finaliza cada recurso: etapas no tempo, data da mais recente, anexos, status e "lida"
  for (const grupo of recursos.values()) {
    const etapas = grupo.etapas!
    etapas.sort((a, b) => a.date.getTime() - b.date.getTime())
    grupo.date = etapas[etapas.length - 1].date
    grupo.dateMensagem = etapas[0].date
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

  // Deduplicação por grupoId: mantém o primeiro, conta as cópias e usa a data mais recente
  const grupos = new Map<string, Manifestacao>()
  const resultado: Manifestacao[] = []
  for (const item of mapeados) {
    if (!item.grupoId) {
      resultado.push(item)
      continue
    }
    const existente = grupos.get(item.grupoId)
    if (existente) {
      existente.copias += 1
      if (item.date > existente.date) existente.date = item.date
    } else {
      const copia = { ...item }
      grupos.set(item.grupoId, copia)
      resultado.push(copia)
    }
  }

  return resultado.sort((a, b) => b.date.getTime() - a.date.getTime())
}

const LATENCIA = 450 // ms: simula a rede

/** Carrega as manifestações de uma licitação (simula a API). */
export function carregarManifestacoes(licitacaoId: string): Promise<Manifestacao[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(montarLista().filter((i) => i.licitacao === licitacaoId)), LATENCIA)
  })
}

export const LICITACAO_ATUAL = LICITACOES.pe12

/* ------------------------------------------------------------------ */
/* Formatação                                                          */
/* ------------------------------------------------------------------ */

const dois = (n: number) => String(n).padStart(2, "0")

/** Data e hora pontuais (não "Há X min"): "DD/MM/AAAA às HH:MM". */
export function formatarDataHora(date: Date) {
  return `${dois(date.getDate())}/${dois(date.getMonth() + 1)}/${date.getFullYear()} às ${dois(date.getHours())}:${dois(date.getMinutes())}`
}

/** Preview do card: texto original cortado por número de caracteres. */
const LIMITE_DO_PREVIEW = 300

export function truncar(texto: string) {
  const limpo = texto.replace(/\s+/g, " ").trim()
  return limpo.length > LIMITE_DO_PREVIEW ? limpo.slice(0, LIMITE_DO_PREVIEW).trimEnd() + "…" : limpo
}

/** Recurso tem autor (nome, documento, papel); aviso, questionamento e impugnação não. */
export function temAutor(categoria: Categoria) {
  return categoria === "recurso"
}
