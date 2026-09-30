// Dados de exemplo: Explorar licitações + Salvos para depois com alertas de atualização
// e a central de notificações.

export type Aderencia = "aderente" | "duvida" | "nao_aderente"

export type Licitacao = {
  edital: string
  /** Nome curto do órgão, para linhas de uma linha só (notificações). */
  orgaoCurto: string
  orgao: string
  objeto: string
  valor: string
  id: string
  modalidade: string
  julgamento: string
  estado: string
  cidade: string
  habitantes: string
  portal: string
  adicionada: string
  atualizada: string
  envio: string
  semAnexo: boolean
  arquivos?: number
  aderencia: Aderencia
  motivo: string
  /** Na fila de "Salvos para depois" (sai desta lista). */
  salvo: boolean
  /** Notificações ligadas pelo sino: tipos de atualização. Vazio: desligadas. */
  alertas: TipoAtualizacao[]
  /** Descartada (sai das listas). Descartar desliga as notificações, a não ser que o usuário peça para continuar. */
  descartada?: boolean
  /** Quando foi salva (DD/MM/AAAA). */
  salvaEm?: string
}

/* ------------------------------------------------------------------ */
/* Atualizações acompanhadas                                           */
/* ------------------------------------------------------------------ */

export type TipoAtualizacao = "retificacao" | "documento" | "prazo" | "status" | "manifestacao"

export const TIPOS_DE_ATUALIZACAO: { chave: TipoAtualizacao; rotulo: string; descricao: string }[] = [
  { chave: "retificacao", rotulo: "Retificação do edital", descricao: "Nova versão do edital ou do termo de referência" },
  { chave: "documento", rotulo: "Novo documento", descricao: "Anexo, planilha ou errata publicada no portal" },
  { chave: "prazo", rotulo: "Mudança de prazo", descricao: "Envio da proposta ou data da disputa alterada" },
  { chave: "status", rotulo: "Mudança de status", descricao: "Suspensa, revogada, anulada, reaberta ou homologada" },
  { chave: "manifestacao", rotulo: "Avisos, impugnações e esclarecimentos", descricao: "Publicados pelo pregoeiro, com as respostas" },
]

export const TODOS_OS_TIPOS = TIPOS_DE_ATUALIZACAO.map((t) => t.chave)

export const ROTULO_CURTO: Record<TipoAtualizacao, string> = {
  retificacao: "Retificação",
  documento: "Novo documento",
  prazo: "Prazo",
  status: "Status",
  manifestacao: "Manifestação",
}

/** Abas das notificações (padrão do Figma "Central de notificações" + atualizações do edital). */
export type Categoria = "atualizacao" | "aviso" | "impugnacao" | "esclarecimento"

export const CATEGORIAS: { chave: Categoria | "todos"; rotulo: string }[] = [
  { chave: "todos", rotulo: "Todos" },
  { chave: "atualizacao", rotulo: "Atualizações" },
  { chave: "aviso", rotulo: "Avisos" },
  { chave: "impugnacao", rotulo: "Impugnações" },
  { chave: "esclarecimento", rotulo: "Esclarecimentos" },
]

export const ROTULO_CATEGORIA: Record<Categoria, string> = {
  atualizacao: "Atualização",
  aviso: "Aviso",
  impugnacao: "Impugnação",
  esclarecimento: "Esclarecimento",
}

export type Notificacao = {
  id: string
  edital: string
  categoria: Categoria
  tipo: TipoAtualizacao
  /** Texto integral (avisos, impugnações, esclarecimentos): abre em "Visualizar mensagem completa". */
  mensagem?: string
  /** Resposta do pregoeiro. */
  resposta?: string
  novaResposta?: boolean
  anexos?: string[]
  /** DD/MM/AAAA às HH:MM */
  quando: string
  titulo: string
  /** O que mudou: valor anterior → novo (quando se aplica). */
  mudanca?: { campo: string; de: string; para: string }
  /** Leitura do possível impacto, gerada pela IA a partir do diff. */
  impacto?: string
  documento?: string
  lida: boolean
}

export const LICITACOES: Licitacao[] = [
  {
    edital: "90001/2026",
    orgaoCurto: "PGE-PA",
    orgao: "EPA - PROCURADORIA GERAL DO ESTADO DO PARÁ",
    objeto:
      "Licitação para fornecimento de computadores desktop, notebooks, monitores e periféricos para atender a rede municipal de ensino. Inclui instalação, configuração e garantia de 36 meses com suporte on-site. Entrega em 47 unidades escolares.",
    valor: "47.284.499,63",
    id: "1078513",
    modalidade: "Pregão - Eletrônico",
    julgamento: "Menor preço por item",
    estado: "PA",
    cidade: "Belém",
    habitantes: "1.303.403",
    portal: "compras.saobernado.sp…",
    adicionada: "04/02/2026",
    atualizada: "12/02/2026",
    envio: "13/02/2026",
    semAnexo: true,
    aderencia: "aderente",
    motivo: "Objeto casa com o segmento de TI (computadores, notebooks e periféricos).",
    salvo: false,
    alertas: [],
  },
  {
    edital: "88234/2026",
    orgaoCurto: "Prefeitura de Campinas",
    orgao: "PREFEITURA MUNICIPAL DE CAMPINAS - SECRETARIA DE TI",
    objeto:
      "Aquisição de equipamentos de rede, switches gerenciáveis, roteadores e infraestrutura de cabeamento estruturado para modernização do data center municipal, com suporte e garantia de 48 meses.",
    valor: "12.640.310,00",
    id: "1099842",
    modalidade: "Pregão - Eletrônico",
    julgamento: "Menor preço por lote",
    estado: "SP",
    cidade: "Campinas",
    habitantes: "1.223.237",
    portal: "compras.campinas.sp.gov…",
    adicionada: "07/02/2026",
    atualizada: "14/02/2026",
    envio: "21/02/2026",
    semAnexo: false,
    arquivos: 3,
    aderencia: "aderente",
    motivo: "Equipamentos de rede e cabeamento dentro do escopo de infraestrutura.",
    salvo: false,
    alertas: ["prazo", "status"],
  },
  {
    edital: "90455/2025",
    orgaoCurto: "SESA-CE",
    orgao: "SECRETARIA DE ESTADO DA SAÚDE DO CEARÁ",
    objeto:
      "Registro de preços para aquisição de mobiliário hospitalar, macas, camas e equipamentos médico-hospitalares destinados às unidades de pronto atendimento do estado, com entrega parcelada.",
    valor: "8.910.770,45",
    id: "1065217",
    modalidade: "Pregão - Presencial",
    julgamento: "Menor preço por item",
    estado: "CE",
    cidade: "Fortaleza",
    habitantes: "2.703.391",
    portal: "licitacoes.saude.ce.gov…",
    adicionada: "29/01/2026",
    atualizada: "10/02/2026",
    envio: "18/02/2026",
    semAnexo: false,
    arquivos: 2,
    aderencia: "nao_aderente",
    motivo: "Mobiliário e equipamentos hospitalares, fora do segmento da empresa.",
    salvo: false,
    alertas: [],
  },
  {
    edital: "73/2026",
    orgaoCurto: "Prefeitura de Sorocaba",
    orgao: "PREFEITURA MUNICIPAL DE SOROCABA",
    objeto:
      "Contratação de empresa para serviços de manutenção predial preventiva e corretiva, incluindo instalações elétricas, hidráulicas e pequenas reformas nos prédios administrativos do município.",
    valor: "3.480.000,00",
    id: "1102944",
    modalidade: "Pregão - Eletrônico",
    julgamento: "Menor preço global",
    estado: "SP",
    cidade: "Sorocaba",
    habitantes: "687.357",
    portal: "compras.sorocaba.sp.gov…",
    adicionada: "09/02/2026",
    atualizada: "11/02/2026",
    envio: "24/02/2026",
    semAnexo: false,
    arquivos: 1,
    aderencia: "duvida",
    motivo: "Há itens elétricos, mas o objeto é majoritariamente reforma predial. Requer análise.",
    salvo: false,
    alertas: [],
  },
  {
    edital: "204/2025",
    orgaoCurto: "SEC-BA",
    orgao: "SECRETARIA DE EDUCAÇÃO DO ESTADO DA BAHIA",
    objeto:
      "Registro de preços para aquisição de gêneros alimentícios e merenda escolar destinados às unidades da rede estadual de ensino, com entrega programada ao longo do ano letivo.",
    valor: "15.230.000,00",
    id: "1061780",
    modalidade: "Pregão - Eletrônico",
    julgamento: "Menor preço por item",
    estado: "BA",
    cidade: "Salvador",
    habitantes: "2.417.678",
    portal: "comprasnet.ba.gov…",
    adicionada: "02/02/2026",
    atualizada: "05/02/2026",
    envio: "20/02/2026",
    semAnexo: false,
    arquivos: 2,
    aderencia: "nao_aderente",
    motivo: "Gêneros alimentícios e merenda, sem relação com o segmento da empresa.",
    salvo: false,
    alertas: [],
  },
  {
    edital: "112/2026",
    orgaoCurto: "TJMG",
    orgao: "TRIBUNAL DE JUSTIÇA DO ESTADO DE MINAS GERAIS",
    objeto:
      "Registro de preços para aquisição de notebooks corporativos, estações de acoplamento e monitores de 24 polegadas para as comarcas do interior, com garantia de 60 meses on-site.",
    valor: "21.975.400,00",
    id: "1110385",
    modalidade: "Pregão - Eletrônico",
    julgamento: "Menor preço por lote",
    estado: "MG",
    cidade: "Belo Horizonte",
    habitantes: "2.315.560",
    portal: "compras.mg.gov…",
    adicionada: "01/02/2026",
    atualizada: "18/06/2026",
    envio: "03/07/2026",
    semAnexo: false,
    arquivos: 6,
    aderencia: "duvida",
    motivo: "Objeto aderente, mas o edital exige certificação EPEAT Gold que a empresa não possui.",
    salvo: true,
    alertas: ["retificacao", "documento", "prazo", "status", "manifestacao"],
    salvaEm: "10/06/2026",
  },
  {
    edital: "45/2026",
    orgaoCurto: "Sanepar",
    orgao: "COMPANHIA DE SANEAMENTO DO PARANÁ - SANEPAR",
    objeto:
      "Contratação de solução de monitoramento de rede com licenças de software, appliances e serviço de implantação para as unidades regionais, por 36 meses.",
    valor: "6.842.118,90",
    id: "1108822",
    modalidade: "Pregão - Eletrônico",
    julgamento: "Menor preço global",
    estado: "PR",
    cidade: "Curitiba",
    habitantes: "1.773.718",
    portal: "licitacoes.sanepar.com…",
    adicionada: "28/01/2026",
    atualizada: "17/06/2026",
    envio: "30/06/2026",
    semAnexo: false,
    arquivos: 4,
    aderencia: "aderente",
    motivo: "Monitoramento de rede e appliances dentro do escopo de infraestrutura.",
    salvo: true,
    alertas: ["prazo", "status"],
    salvaEm: "12/06/2026",
  },
  {
    edital: "318/2026",
    orgaoCurto: "Prefeitura do Recife",
    orgao: "PREFEITURA MUNICIPAL DE RECIFE - SECRETARIA DE ADMINISTRAÇÃO",
    objeto:
      "Aquisição de equipamentos de videomonitoramento urbano, câmeras IP, servidores de gravação e licenças de VMS para o Centro de Operações da cidade.",
    valor: "9.127.600,00",
    id: "1109077",
    modalidade: "Concorrência - Eletrônica",
    julgamento: "Técnica e preço",
    estado: "PE",
    cidade: "Recife",
    habitantes: "1.488.920",
    portal: "compras.recife.pe.gov…",
    adicionada: "05/02/2026",
    atualizada: "05/02/2026",
    envio: "22/07/2026",
    semAnexo: false,
    arquivos: 2,
    aderencia: "aderente",
    motivo: "Videomonitoramento e servidores dentro do segmento de TI.",
    salvo: true,
    alertas: [],
    salvaEm: "15/06/2026",
  },
]

export const ROTULO_ADERENCIA: Record<Aderencia, string> = {
  aderente: "Aderente",
  duvida: "Dúvida",
  nao_aderente: "Não aderente",
}

export const RESPONSAVEIS = [
  { initials: "JS", name: "Juliana Santos" },
  { initials: "MR", name: "Marcos Ribeiro" },
  { initials: "AL", name: "Ana Lima" },
]

export const SEGMENTOS_DO_CARD = ["Segmento 1", "Segmento 2"]

/* ------------------------------------------------------------------ */
/* Visualizações (abas) e filtros                                      */
/* ------------------------------------------------------------------ */

export type FiltroLista = { rotulo: string; tipo: "lista"; opcoes: string[]; valor: string[] }
export type FiltroData = {
  rotulo: string
  tipo: "data"
  modo: "passado" | "futuro"
  valor: { preset?: string; data?: string }
}
export type Filtro = FiltroLista | FiltroData

export type Visualizacao = {
  chave: string
  rotulo: string
  filtros: Filtro[]
  /** Status de aderência mostrados (sem valor: todos). */
  aderencia?: Aderencia[]
  /** Existe, mas não aparece na barra (decisão de produto: por enquanto). */
  oculta?: boolean
}

/** Não pode ser excluída. */
export const VISUALIZACAO_OBRIGATORIA = "Todas"
export const VISUALIZACAO_ORGAOS = "Órgãos favoritos"

export const ESTADOS = ["SP", "RJ", "MG", "PA", "CE", "BA", "PR", "RS"]
export const CIDADES = ["São Paulo", "Campinas", "Rio de Janeiro", "Belém", "Fortaleza"]
// órgãos monitorados (iguais ao campo orgao das licitações)
export const ORGAOS = [
  "EPA - PROCURADORIA GERAL DO ESTADO DO PARÁ",
  "PREFEITURA MUNICIPAL DE CAMPINAS - SECRETARIA DE TI",
  "SECRETARIA DE ESTADO DA SAÚDE DO CEARÁ",
]

// "Todas" e "Órgãos favoritos" estão ocultas por enquanto (como na versão HTML).
export const VISUALIZACOES_INICIAIS: Visualizacao[] = [
  { chave: "Todas", rotulo: "Todas", filtros: [], oculta: true },
  {
    chave: VISUALIZACAO_ORGAOS,
    rotulo: "Órgãos favoritos",
    oculta: true,
    filtros: [
      { rotulo: "Órgão", tipo: "lista", opcoes: ORGAOS, valor: [ORGAOS[0], ORGAOS[1]] },
      { rotulo: "Estado", tipo: "lista", opcoes: ESTADOS, valor: ["PA", "SP"] },
      { rotulo: "Cidade", tipo: "lista", opcoes: CIDADES, valor: ["Belém", "Campinas"] },
    ],
  },
  // Relevantes = aderentes + dúvidas; Provável ruído = não aderentes
  { chave: "Relevantes", rotulo: "Relevantes", filtros: [], aderencia: ["aderente", "duvida"] },
  { chave: "Provável ruído", rotulo: "Provável ruído", filtros: [], aderencia: ["nao_aderente"] },
]

export const VISUALIZACAO_INICIAL = "Relevantes"

export const PRESETS_DATA = {
  passado: [
    { chave: "todos", rotulo: "Todos" },
    { chave: "24h", rotulo: "Últimas 24h" },
    { chave: "7d", rotulo: "Últimos 7 dias" },
  ],
  futuro: [
    { chave: "7d", rotulo: "Próximos 7 dias" },
    { chave: "15d", rotulo: "Próximos 15 dias" },
    { chave: "30d", rotulo: "Próximos 30 dias" },
  ],
}

/** Data de referência fixa do protótipo. */
export const HOJE = new Date(2026, 5, 19)

export const formatarData = (d: Date) =>
  `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`

export const lerData = (s: string) => {
  const [d, m, a] = s.split("/").map(Number)
  return new Date(a, m - 1, d)
}

/* ------------------------------------------------------------------ */
/* Busca                                                               */
/* ------------------------------------------------------------------ */

/** Remove acentos e caixa: "belem" encontra "Belém". */
export const normalizar = (s: string) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")

export const ESCOPOS: { chave: string; rotulo: string; valor: (l: Licitacao) => string }[] = [
  { chave: "edital", rotulo: "Edital", valor: (l) => l.edital },
  { chave: "orgao", rotulo: "Órgão", valor: (l) => l.orgao },
  { chave: "objeto", rotulo: "Objeto", valor: (l) => l.objeto },
  { chave: "valor", rotulo: "Valor global", valor: (l) => "R$ " + l.valor },
  { chave: "id", rotulo: "ID", valor: (l) => l.id },
  { chave: "uasg", rotulo: "UASG", valor: () => "–" },
  { chave: "modalidade", rotulo: "Modalidade", valor: (l) => l.modalidade },
  { chave: "julgamento", rotulo: "Julgamento", valor: (l) => l.julgamento },
  { chave: "estado", rotulo: "Estado", valor: (l) => l.estado },
  { chave: "cidade", rotulo: "Cidade", valor: (l) => l.cidade },
  { chave: "habitantes", rotulo: "Habitantes", valor: (l) => l.habitantes },
  { chave: "segmento", rotulo: "Segmento", valor: () => SEGMENTOS_DO_CARD.join(" ") },
  { chave: "adicionada", rotulo: "Adicionada", valor: (l) => l.adicionada },
  { chave: "atualizada", rotulo: "Atualizada", valor: (l) => l.atualizada },
  { chave: "envio", rotulo: "Envio da proposta", valor: (l) => l.envio },
  { chave: "capagE", rotulo: "CAPAG Estadual", valor: () => "–" },
  { chave: "capagM", rotulo: "CAPAG Municipal", valor: () => "–" },
  { chave: "portal", rotulo: "Portal de disputa", valor: (l) => l.portal },
]

/** Sem escopo marcado, a busca olha estes campos. */
export const textoPadraoDeBusca = (l: Licitacao) =>
  [l.edital, l.orgao, l.objeto, l.cidade, l.estado, l.modalidade, l.julgamento, l.id].join(" ")

/* ------------------------------------------------------------------ */
/* Notificações                                                        */
/* ------------------------------------------------------------------ */

export const NOTIFICACOES: Notificacao[] = [
  {
    id: "n1",
    edital: "112/2026",
    categoria: "atualizacao",
    tipo: "retificacao",
    quando: "18/06/2026 às 16:42",
    titulo: "Edital retificado: exigência de certificação removida",
    mudanca: { campo: "Item 7.3 do termo de referência", de: "Certificação EPEAT Gold obrigatória", para: "Certificação EPEAT Silver ou superior" },
    impacto: "O motivo da dúvida na aderência deixou de existir. Vale reavaliar a licitação.",
    documento: "Edital_112-2026_retificado_v2.pdf",
    lida: false,
  },
  {
    id: "n2",
    edital: "112/2026",
    categoria: "atualizacao",
    tipo: "prazo",
    quando: "18/06/2026 às 16:42",
    titulo: "Envio da proposta adiado",
    mudanca: { campo: "Envio da proposta", de: "24/06/2026", para: "03/07/2026" },
    lida: false,
  },
  {
    id: "n3",
    edital: "45/2026",
    categoria: "atualizacao",
    tipo: "status",
    quando: "17/06/2026 às 09:15",
    titulo: "Licitação suspensa pelo órgão",
    mudanca: { campo: "Status no portal", de: "Aberta para participação", para: "Suspensa" },
    impacto: "Suspensões costumam ser seguidas de republicação com correções.",
    lida: false,
  },
  {
    id: "n4",
    edital: "112/2026",
    categoria: "esclarecimento",
    tipo: "manifestacao",
    quando: "19/06/2026 às 11:42",
    titulo: "Pedido de esclarecimento sobre a garantia on-site",
    mensagem:
      "Prezados, em relação ao item 9.2 do termo de referência, solicitamos esclarecer se a garantia on-site de 60 meses pode ser prestada por assistência técnica credenciada pelo fabricante nas comarcas onde a licitante não possui filial, ou se é exigido atendimento com equipe própria.",
    resposta:
      "A garantia poderá ser prestada por assistência técnica credenciada pelo fabricante, desde que comprovado o credenciamento no momento da assinatura da ata e mantidos os prazos de atendimento do item 9.4.",
    novaResposta: true,
    lida: false,
  },
  {
    id: "n6",
    edital: "112/2026",
    categoria: "aviso",
    tipo: "manifestacao",
    quando: "19/06/2026 às 09:30",
    titulo: "Aviso do pregoeiro: sessão pública mantida",
    mensagem:
      "Comunicamos que, em razão da retificação publicada em 18/06/2026, a sessão pública fica mantida para 03/07/2026 às 09h30, no portal compras.mg.gov.br. As propostas já cadastradas deverão ser revisadas pelas licitantes à luz do novo item 7.3.",
    lida: false,
  },
  {
    id: "n7",
    edital: "45/2026",
    categoria: "impugnacao",
    tipo: "manifestacao",
    quando: "16/06/2026 às 15:05",
    titulo: "Pedido de impugnação ao instrumento editalício",
    mensagem:
      "A empresa impugnante requer a exclusão da exigência de appliance de um único fabricante (item 4.1), por restringir a competitividade, e a aceitação de soluções equivalentes que atendam às especificações de desempenho descritas no Anexo I.",
    resposta:
      "Impugnação acolhida parcialmente. O certame será suspenso para revisão do item 4.1 e posterior republicação do edital.",
    novaResposta: true,
    anexos: ["Impugnacao_Empresa_X.pdf", "Decisao_Pregoeiro_45-2026.pdf"],
    lida: true,
  },
  {
    id: "n5",
    edital: "45/2026",
    categoria: "atualizacao",
    tipo: "documento",
    quando: "13/06/2026 às 18:20",
    titulo: "Novo anexo publicado: planilha de quantitativos",
    documento: "Anexo_III_Quantitativos.xlsx",
    lida: true,
  },
]

/** Atualização "chegando do portal" quando o protótipo simula uma captura. */
export const PROXIMAS_NOTIFICACOES: Omit<Notificacao, "id" | "lida">[] = [
  {
    edital: "45/2026",
    categoria: "atualizacao",
    tipo: "status",
    quando: "19/06/2026 às 11:48",
    titulo: "Licitação reaberta com novo edital",
    mudanca: { campo: "Status no portal", de: "Suspensa", para: "Aberta para participação" },
    impacto: "Reaberta após a suspensão. Confira o edital republicado antes do novo prazo.",
    documento: "Edital_45-2026_republicado.pdf",
  },
  {
    edital: "318/2026",
    categoria: "atualizacao",
    tipo: "prazo",
    quando: "19/06/2026 às 10:31",
    titulo: "Data da disputa antecipada",
    mudanca: { campo: "Envio da proposta", de: "22/07/2026", para: "15/07/2026" },
  },
  {
    edital: "112/2026",
    categoria: "atualizacao",
    tipo: "documento",
    quando: "19/06/2026 às 11:12",
    titulo: "Errata publicada no portal",
    documento: "Errata_01_Edital_112-2026.pdf",
  },
]

/* ------------------------------------------------------------------ */
/* Descarte                                                            */
/* ------------------------------------------------------------------ */

// Motivos de descarte de hoje (mesma lista de settle-configuracoes).
export const MOTIVOS_DE_DESCARTE = [
  "Não atende requisitos técnicos",
  "Valor abaixo do desejado",
  "Prazo inadequado para elaboração proposta",
  "Falta de capacidade técnica/operacional",
  "Conflito de interesse",
  "Documentação técnica restritiva/direcionado",
  "Fora da área que quer atuar",
  "Minha empresa não atende esse produto / serviço",
  "Órgão indesejado",
  "Valor indesejado",
  "Região indesejada",
  "Prazo muito próximo",
  "Duplicado",
  "Revenda",
  "Certificação que não temos",
  "Outros",
]

/** Motivos que uma atualização do edital pode desfazer: o diálogo sugere continuar acompanhando. */
export const MOTIVOS_REVERSIVEIS: Record<string, string> = {
  "Não atende requisitos técnicos": "Uma retificação pode mudar os requisitos.",
  "Prazo inadequado para elaboração proposta": "O órgão pode adiar o envio da proposta.",
  "Prazo muito próximo": "O órgão pode adiar o envio da proposta.",
  "Documentação técnica restritiva/direcionado": "Uma impugnação pode levar à retificação do edital.",
  "Certificação que não temos": "Uma retificação pode flexibilizar a exigência.",
  "Valor abaixo do desejado": "O edital pode ser republicado com outro valor.",
}

/* ------------------------------------------------------------------ */
/* Tempo relativo ("Há 18 minutos")                                    */
/* ------------------------------------------------------------------ */

/** "Agora" do protótipo. */
export const AGORA = new Date(2026, 5, 19, 12, 0)

export const lerQuando = (q: string) => {
  const [data, hora] = q.split(" às ")
  const [d, m, a] = data.split("/").map(Number)
  const [h, min] = hora.split(":").map(Number)
  return new Date(a, m - 1, d, h, min)
}

export function tempoRelativo(quando: string) {
  const minutos = Math.max(0, Math.round((AGORA.getTime() - lerQuando(quando).getTime()) / 60000))
  if (minutos < 1) return "Agora"
  if (minutos < 60) return `Há ${minutos} ${minutos === 1 ? "minuto" : "minutos"}`
  const horas = Math.floor(minutos / 60)
  if (horas < 24) return `Há ${horas} ${horas === 1 ? "hora" : "horas"}`
  const dias = Math.floor(horas / 24)
  if (dias < 7) return dias === 1 ? "Ontem" : `Há ${dias} dias`
  return quando.split(" às ")[0]
}

/** "PE 112/2026 · TJMG" */
export function tituloDoEdital(l: Licitacao | undefined, edital: string) {
  if (!l) return edital
  const sigla = l.modalidade.startsWith("Pregão") ? "PE" : l.modalidade.startsWith("Concorrência") ? "CC" : ""
  return `${sigla} ${edital} · ${l.orgaoCurto}`.trim()
}
