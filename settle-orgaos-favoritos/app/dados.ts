// Dados de exemplo da tela Órgãos favoritos (iguais aos da versão HTML).

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
  /** Itens com correspondência. */
  itens: number
  /** Total de itens do edital. */
  total: number
  /** Tabela de itens começa recolhida. */
  recolhida: boolean
  semAnexo: boolean
  arquivos?: number
  /** Na fila de "Salvos para depois" (sai de Recomendadas). */
  salvo: boolean
  /** Salva que já recebeu o anexo: mostra "Atualizado" em Salvos para depois. */
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
    recolhida: false,
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
    recolhida: false,
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
    recolhida: true,
    semAnexo: false,
    arquivos: 2,
    salvo: true,
    atualizado: true,
  },
]

/** Itens com correspondência (mesmas linhas em todos os cards, como no HTML). */
export const ITENS = [
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
/* Abas e filtro de órgão                                              */
/* ------------------------------------------------------------------ */

export const ABA_TODAS = "Todas"
export const ABA_ORGAOS = "Órgãos favoritos"
export const ABAS = [ABA_TODAS, ABA_ORGAOS] as const
export type Aba = (typeof ABAS)[number]

/** Total fictício de Recomendadas (a lista mostra só uma amostra). */
export const TOTAL_RECOMENDADAS = 300

// órgãos monitorados (iguais ao campo orgao das licitações)
export const ORGAOS = [
  "EPA - PROCURADORIA GERAL DO ESTADO DO PARÁ",
  "PREFEITURA MUNICIPAL DE CAMPINAS - SECRETARIA DE TI",
  "SECRETARIA DE ESTADO DA SAÚDE DO CEARÁ",
]

export const ORGAOS_FAVORITOS_INICIAIS = [ORGAOS[0], ORGAOS[1]]

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
