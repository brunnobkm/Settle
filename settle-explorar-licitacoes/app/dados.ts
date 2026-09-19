// Dados de exemplo da tela Explorar licitações (iguais aos da versão HTML).

export type Aderencia = "aderente" | "duvida" | "nao_aderente"

export type Licitacao = {
  edital: string
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
}

export const LICITACOES: Licitacao[] = [
  {
    edital: "90001/2026",
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
  },
  {
    edital: "88234/2026",
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
  },
  {
    edital: "90455/2025",
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
  },
  {
    edital: "73/2026",
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
  },
  {
    edital: "204/2025",
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
