// Dados de exemplo da tela Licitações recomendadas (iguais aos da versão HTML).

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
  /** Itens com correspondência e total de itens do edital. */
  itens: number
  total: number
  /** Tabela de itens começa recolhida. */
  recolhido: boolean
  semAnexo: boolean
  arquivos?: number
  /** Na fila de "Salvos para depois" (sai de Recomendadas). */
  salvo: boolean
  /** Salvo que já recebeu o anexo: mostra "Atualizado" em Salvos para depois. */
  atualizado?: boolean
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
    itens: 29,
    total: 300,
    recolhido: false,
    semAnexo: true,
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
    itens: 14,
    total: 120,
    recolhido: false,
    semAnexo: false,
    arquivos: 3,
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
    itens: 37,
    total: 410,
    recolhido: true,
    semAnexo: false,
    arquivos: 2,
    // salvo que já recebeu o anexo: "Atualizado" + quantidade de arquivos
    salvo: true,
    atualizado: true,
  },
]

/** Itens com correspondência (os mesmos em todos os cards do protótipo). */
export const ITENS: { lote: string; nome: string; unidades: string }[] = [
  { lote: "1", nome: "Microcomputador desktop básico + Monitor Full HD", unidades: "94" },
  { lote: "1", nome: "Microcomputador desktop intermediário + Monitor Full HD", unidades: "22" },
  { lote: "1", nome: "Microcomputador desktop básico + Monitor Full HD", unidades: "94" },
  { lote: "2", nome: 'Notebook 14" i5 / 8GB / 256GB SSD', unidades: "48" },
  { lote: "2", nome: 'Notebook 15" i7 / 16GB / 512GB SSD', unidades: "12" },
  { lote: "3", nome: "Impressora multifuncional laser monocromática", unidades: "30" },
]

export const RESPONSAVEIS = [
  { initials: "JS", name: "Juliana Santos" },
  { initials: "MR", name: "Marcos Ribeiro" },
  { initials: "AL", name: "Ana Lima" },
]

export const SEGMENTOS_DO_CARD = ["Segmento 1", "Segmento 2"]

/* ------------------------------------------------------------------ */
/* Abas e filtros aplicados                                            */
/* ------------------------------------------------------------------ */

export type FiltroLista = { rotulo: string; tipo: "lista"; opcoes: string[]; valor: string[] }
export type FiltroData = {
  rotulo: string
  tipo: "data"
  modo: "passado" | "futuro"
  valor: { preset?: string; data?: string }
}
export type Filtro = FiltroLista | FiltroData

export type Aba = { chave: string; contagem: number }

export const ABA_TODAS = "Todas"
export const TOTAL_RECOMENDADAS = 300

export const ABAS: Aba[] = [
  { chave: ABA_TODAS, contagem: TOTAL_RECOMENDADAS },
  { chave: "Ativas", contagem: 248 },
  { chave: "Chegou hoje", contagem: 12 },
  { chave: "Vencendo em breve", contagem: 87 },
  { chave: "Exemplo", contagem: 3 },
]

const SITUACAO = ["Ativas", "Em disputa", "Homologação", "Encerradas", "Descartadas"]
const SEGMENTOS = ["Produtos", "Software"]
const ESTADOS = ["SP", "RJ", "MG", "PA", "CE", "BA", "PR", "RS"]
const CIDADES = ["São Paulo", "Campinas", "Rio de Janeiro", "Belém", "Fortaleza"]
const VALORES = ["Até R$ 100 mil", "R$ 100 mil – 1 mi", "R$ 1 mi – 10 mi", "Acima de R$ 10 mi"]

/** Filtros aplicados em cada aba (viram selos abaixo da barra). */
export const FILTROS_INICIAIS: Record<string, Filtro[]> = {
  Todas: [],
  Ativas: [{ rotulo: "Situação", tipo: "lista", opcoes: SITUACAO, valor: ["Ativas"] }],
  "Chegou hoje": [{ rotulo: "Data de adição", tipo: "data", modo: "passado", valor: { data: "19/06/2026" } }],
  "Vencendo em breve": [{ rotulo: "Envio da proposta", tipo: "data", modo: "futuro", valor: { preset: "7d" } }],
  // aba de demonstração: todos os filtros aplicados de uma vez
  Exemplo: [
    { rotulo: "Situação", tipo: "lista", opcoes: SITUACAO, valor: ["Ativas"] },
    { rotulo: "Segmento", tipo: "lista", opcoes: SEGMENTOS, valor: ["Software"] },
    { rotulo: "Estado", tipo: "lista", opcoes: ESTADOS, valor: ["SP"] },
    { rotulo: "Cidade", tipo: "lista", opcoes: CIDADES, valor: ["Campinas"] },
    { rotulo: "Valor global", tipo: "lista", opcoes: VALORES, valor: ["R$ 1 mi – 10 mi"] },
    { rotulo: "Data de adição", tipo: "data", modo: "passado", valor: { preset: "7d" } },
    { rotulo: "Data de atualização", tipo: "data", modo: "passado", valor: { data: "19/06/2026" } },
    { rotulo: "Envio da proposta", tipo: "data", modo: "futuro", valor: { preset: "7d" } },
  ],
}

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
