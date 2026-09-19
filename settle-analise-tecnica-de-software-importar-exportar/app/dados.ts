// Dados de exemplo e regras de domínio da análise técnica de software.
// Regras conforme o documento "Importação e exportação de dados (Excel)" (ver DECISOES.md).

export const STATUS = {
  ATENDE: "Atende",
  PARCIAL: "Atende parcialmente",
  PARCEIRO: "Atende com parceiro",
  NAO: "Não atende",
} as const

export type Status = (typeof STATUS)[keyof typeof STATUS]
export const STATUS_VALIDOS: Status[] = Object.values(STATUS)

export const CONFIANCA = ["Alta", "Média", "Baixa"] as const
export type Confianca = (typeof CONFIANCA)[number]

export const TIPOS = ["Software", "Produto", "Serviço"] as const
export type Tipo = (typeof TIPOS)[number]

export type Requisito = {
  id: string
  tipo: Tipo
  modulo: string
  requisito: string
  status: Status
  /** Status sugerido pela IA (mostra o brilho ao lado do status). */
  aiSuggested: boolean
  confianca: Confianca
  justificativa: string
  responsavel: string
  notas: string
}

const MODULOS = ["IPTU", "ISS", "Dívida Ativa", "Protocolo", "Tesouraria", "Nota Fiscal", "Cadastro", "Relatórios"]
const REQ_BASE =
  "A fórmula de cálculo do IPTU deve ser totalmente parametrizável pelo gestor tributário do município, não necessitando de qualquer alteração no código executável do sistema para inclusão de novas fórmulas, alíquotas ou índices de correção monetária, garantindo plena autonomia operacional ao setor."

/** ~30 requisitos de exemplo, como na tela original. */
export function gerarDados(): Requisito[] {
  const statusCiclo: Status[] = [
    STATUS.PARCEIRO,
    STATUS.ATENDE,
    STATUS.PARCEIRO,
    STATUS.PARCEIRO,
    STATUS.NAO,
    STATUS.PARCEIRO,
    STATUS.PARCIAL,
    STATUS.ATENDE,
  ]
  const confCiclo: Confianca[] = ["Alta", "Média", "Baixa", "Baixa", "Baixa", "Baixa", "Média", "Alta"]
  return Array.from({ length: 30 }, (_, i) => {
    const status = statusCiclo[i % statusCiclo.length]
    return {
      id: "REQ-" + String(i + 1).padStart(3, "0"),
      tipo: "Software",
      modulo: MODULOS[i % MODULOS.length],
      requisito: REQ_BASE,
      status,
      // brilho (sugestão da IA) para tudo que não seja o "Atende" confirmado pelo usuário
      aiSuggested: status !== STATUS.ATENDE,
      confianca: confCiclo[i % confCiclo.length],
      justificativa: REQ_BASE,
      responsavel: i === 0 ? "" : "Fulano da Silva",
      notas: "",
    }
  })
}

/** Cards "Questionamentos" e "Impugnação": valor fixo no protótipo. */
export const QUESTIONAMENTOS = 6
export const IMPUGNACOES = 6

export const ETAPAS = [
  { rotulo: "Análise de Oportunidades", atual: false },
  { rotulo: "Em disputa ou Homologação", atual: true },
]

export const ABAS_DA_LICITACAO = [
  { valor: "visao-geral", rotulo: "Visão geral" },
  { valor: "itens", rotulo: "Itens" },
  { valor: "analise-tecnica", rotulo: "Análise técnica" },
  { valor: "documentos", rotulo: "Documentos" },
  { valor: "habilitacao", rotulo: "Habilitação" },
  { valor: "juridico", rotulo: "Jurídico" },
  { valor: "comunicacao", rotulo: "Comunicação" },
  { valor: "time", rotulo: "Time" },
  { valor: "risco", rotulo: "Risco de pagamento do órgão" },
]
export const ABA_ATUAL = "analise-tecnica"

export const EQUIPE = [
  { nome: "Fulano da Silva", iniciais: "FS" },
  { nome: "Alice Iglesias", iniciais: "AI" },
  { nome: "Brunno Krier", iniciais: "BK" },
]
