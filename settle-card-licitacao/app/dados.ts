// Dados de exemplo, tipos de editor por propriedade e regras do card de licitação editável.

export type TipoDeCampo = "text" | "textarea" | "currency" | "number" | "select" | "date" | "readonly"

export type ConfigDoCampo = {
  tipo: TipoDeCampo
  /** Opções do select (lista fixa ou calculada a partir do estado do card). */
  opcoes?: string[] | ((licitacao: Licitacao) => string[])
  /** Select com campo de busca. */
  busca?: boolean
}

export type Propriedade = { chave: string; rotulo: string; valor: string }

export type Licitacao = {
  numero: string
  segmentos: string[]
  porte: string
  orgao: string
  objeto: string
  valor: string
  datas: Propriedade[]
  props: Propriedade[]
}

/** Fonte de onde abrir o edital (menu do globo do cabeçalho). */
export type LinkDoEdital = { rotulo: string; descricao: string }

/* ------------------------------------------------------------------ */
/* Listas de opções                                                    */
/* ------------------------------------------------------------------ */

const UFS = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"]
const MODALIDADES = ["Pregão - Eletrônico", "Pregão - Presencial", "Concorrência", "Concurso", "Leilão", "Diálogo Competitivo", "Dispensa", "Inexigibilidade"]
const JULGAMENTOS = ["Menor preço global", "Menor preço por grupo", "Menor preço por item", "Maior desconto", "Técnica e preço", "Melhor técnica", "Maior lance"]
export const PORTES = ["ME", "EPP", "ME - EPP", "Demais"]
const CAPAG = ["A", "B", "B+", "C", "D", "E", "Sem informação"]
export const SEGMENTOS = [
  "Tecnologia da Informação",
  "Mobiliário",
  "Serviços",
  "Obras e Engenharia",
  "Saúde",
  "Alimentação",
  "Material de Escritório",
  "Veículos",
  "Limpeza e Conservação",
  "Equipamentos médicos",
]

// Cidade depende do Estado: lista filtrada pela UF selecionada
const CAPITAIS: Record<string, string> = {
  AC: "Rio Branco", AL: "Maceió", AP: "Macapá", AM: "Manaus", BA: "Salvador", CE: "Fortaleza", DF: "Brasília",
  ES: "Vitória", GO: "Goiânia", MA: "São Luís", MT: "Cuiabá", MS: "Campo Grande", MG: "Belo Horizonte", PA: "Belém",
  PB: "João Pessoa", PR: "Curitiba", PE: "Recife", PI: "Teresina", RJ: "Rio de Janeiro", RN: "Natal", RS: "Porto Alegre",
  RO: "Porto Velho", RR: "Boa Vista", SC: "Florianópolis", SP: "São Paulo", SE: "Aracaju", TO: "Palmas",
}
const CIDADES_POR_UF: Record<string, string[]> = {
  PA: ["Belém", "Ananindeua", "Santarém", "Marabá", "Castanhal", "Parauapebas", "Abaetetuba", "Cametá", "Bragança", "Altamira", "Tucuruí", "Barcarena"],
  SP: ["São Paulo", "Guarulhos", "Campinas", "São Bernardo do Campo", "Santo André", "Osasco", "Ribeirão Preto", "Sorocaba", "Santos", "São José dos Campos"],
  RJ: ["Rio de Janeiro", "São Gonçalo", "Duque de Caxias", "Nova Iguaçu", "Niterói", "Belford Roxo", "Petrópolis", "Volta Redonda"],
  MG: ["Belo Horizonte", "Uberlândia", "Contagem", "Juiz de Fora", "Betim", "Montes Claros", "Uberaba"],
}

export const valorDaPropriedade = (l: Licitacao, chave: string) => l.props.find((p) => p.chave === chave)?.valor ?? ""
export const cidadesDoEstado = (uf: string) => CIDADES_POR_UF[uf] ?? (CAPITAIS[uf] ? [CAPITAIS[uf]] : [])

/* ------------------------------------------------------------------ */
/* Tipo de editor de cada propriedade                                  */
/* ------------------------------------------------------------------ */

const CAMPOS: Record<string, ConfigDoCampo> = {
  numero: { tipo: "text" },
  orgao: { tipo: "text" },
  objeto: { tipo: "textarea" },
  valor: { tipo: "currency" },
  porte: { tipo: "select", opcoes: PORTES },
  adicionada: { tipo: "readonly" },
  atualizada: { tipo: "readonly" },
  envio: { tipo: "date" },
  id: { tipo: "readonly" },
  uasg: { tipo: "number" },
  habitantes: { tipo: "number" },
  modalidade: { tipo: "select", opcoes: MODALIDADES, busca: true },
  julgamento: { tipo: "select", opcoes: JULGAMENTOS, busca: true },
  estado: { tipo: "select", opcoes: UFS, busca: true },
  capagmun: { tipo: "select", opcoes: CAPAG },
  capagest: { tipo: "select", opcoes: CAPAG },
  portal: { tipo: "text" },
  cidade: { tipo: "select", opcoes: (l) => cidadesDoEstado(valorDaPropriedade(l, "estado")), busca: true },
  nova: { tipo: "text" },
  locacao: { tipo: "select", opcoes: ["Locação", "Aquisição"] },
  amostra: { tipo: "select", opcoes: ["Sim", "Não"] },
  consorcio: { tipo: "select", opcoes: ["Sim", "Não"] },
  prazoimpugnacao: { tipo: "text" },
  localentrega: { tipo: "text" },
}

export const configDoCampo = (chave: string): ConfigDoCampo => CAMPOS[chave] ?? { tipo: "text" }

export const opcoesDoCampo = (config: ConfigDoCampo, l: Licitacao) =>
  typeof config.opcoes === "function" ? config.opcoes(l) : (config.opcoes ?? [])

export const estaVazio = (v: string | null | undefined) => v == null || v === "" || v === "-" || v === "\u2014"

export const dicaDeVazio = (tipo: TipoDeCampo) =>
  ({ select: "Selecionar", date: "Definir data", readonly: "Vazio" } as Partial<Record<TipoDeCampo, string>>)[tipo] ?? "Adicionar"

/** Propriedades com trecho vinculado no edital (seta verde). */
const VINCULADAS = new Set([
  "orgao", "objeto", "valor", "modalidade", "julgamento", "estado", "cidade", "envio", "portal", "uasg",
  "locacao", "amostra", "consorcio", "prazoimpugnacao", "localentrega",
])
export const temTrecho = (chave: string) => VINCULADAS.has(chave)

/** Propriedades exibidas como hyperlink (texto = nome; abre em nova aba). */
export const LINKS_DAS_PROPRIEDADES: Record<string, string> = { portal: "https://www.gov.br/compras" }

/* ------------------------------------------------------------------ */
/* Formatação                                                          */
/* ------------------------------------------------------------------ */

export function formatarPorTipo(v: string, tipo: TipoDeCampo) {
  if (tipo === "currency") {
    const n = parseFloat(v.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", "."))
    return isNaN(n) ? v : n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  }
  if (tipo === "number") {
    const d = v.replace(/[^\d]/g, "")
    return d ? Number(d).toLocaleString("pt-BR") : v
  }
  return v
}

export function lerDataBR(s: string) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s.trim())
  return m ? new Date(+m[3], +m[2] - 1, +m[1]) : null
}

export const formatarDataBR = (d: Date) =>
  `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`

export type Urgencia = { tom: "critico" | "atencao" | "normal"; dias: number }

/** Prazo de envio: crítico (vencido ou até 2 dias), atenção (3 a 7 dias) ou normal. */
export function urgenciaDoPrazo(s: string): Urgencia {
  const alvo = lerDataBR(s)
  if (!alvo) return { tom: "normal", dias: Infinity }
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const dias = Math.round((alvo.getTime() - hoje.getTime()) / 86400000)
  return { tom: dias <= 2 ? "critico" : dias <= 7 ? "atencao" : "normal", dias }
}

/* ------------------------------------------------------------------ */
/* Card de exemplo                                                     */
/* ------------------------------------------------------------------ */

// demo: "Envio da proposta" 5 dias à frente para mostrar o tom de atenção (3 a 7 dias)
function envioDemo() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 5)
  return formatarDataBR(d)
}

export function licitacaoInicial(): Licitacao {
  return {
    numero: "90001/2026",
    segmentos: ["Tecnologia da Informação", "Mobiliário"],
    porte: "ME - EPP",
    orgao: "EPA - PROCURADORIA GERAL DO ESTADO DO PARÁ",
    objeto:
      "Licitação para fornecimento de computadores desktop, notebooks, monitores e periféricos para atender a rede municipal de ensino. Inclui instalação, configuração e garantia de 36 meses com suporte on-site. Entrega em 47 unidades escolares.",
    valor: "R$ 47.284.499,63",
    datas: [
      { chave: "adicionada", rotulo: "Adicionada", valor: "04/02/2026" },
      { chave: "atualizada", rotulo: "Atualizada", valor: "12/02/2026" },
      { chave: "envio", rotulo: "Envio da proposta", valor: envioDemo() },
    ],
    props: [
      { chave: "id", rotulo: "ID", valor: "1078513" },
      { chave: "modalidade", rotulo: "Modalidade", valor: "Pregão - Eletrônico" },
      { chave: "julgamento", rotulo: "Julgamento", valor: "Menor preço por item" },
      { chave: "uasg", rotulo: "UASG", valor: "-" },
      { chave: "portal", rotulo: "Portal de disputa", valor: "Compras Governamentais" },
      { chave: "cidade", rotulo: "Cidade", valor: "Belém" },
      { chave: "estado", rotulo: "Estado", valor: "PA" },
      { chave: "capagmun", rotulo: "CAPAG Municipal", valor: "-" },
      { chave: "capagest", rotulo: "CAPAG Estadual", valor: "-" },
      { chave: "habitantes", rotulo: "Habitantes", valor: "1.303.403" },
      { chave: "nova", rotulo: "Nova propriedade", valor: "Variable" },
      { chave: "locacao", rotulo: "Locação x Aquisição", valor: "Aquisição" },
      { chave: "amostra", rotulo: "Requerimento de amostra", valor: "Não" },
      { chave: "consorcio", rotulo: "Possibilidade de consórcio", valor: "Não" },
      { chave: "prazoimpugnacao", rotulo: "Prazo de impugnação", valor: "3 dias úteis antes da data de abertura do certame" },
      {
        chave: "localentrega",
        rotulo: "Local de entrega",
        valor: "Secretaria Municipal de Educação, Av. Presidente Vargas, 1200, Centro, Belém - PA, CEP 66017-000",
      },
      // propriedades extras só para o grid transbordar e demonstrar a rolagem e o "Ver mais"
      { chave: "extra1", rotulo: "Propriedade adicional 1", valor: "Lorem ipsum dolor" },
      { chave: "extra2", rotulo: "Propriedade adicional 2", valor: "Sit amet consectetur" },
      { chave: "extra3", rotulo: "Propriedade adicional 3", valor: "Adipiscing elit" },
      { chave: "extra4", rotulo: "Propriedade adicional 4", valor: "Vivamus lacinia odio" },
      { chave: "extra5", rotulo: "Propriedade adicional 5", valor: "Sed do eiusmod" },
      { chave: "extra6", rotulo: "Propriedade adicional 6", valor: "Tempor incididunt" },
    ],
  }
}

/** Ordem das datas: uma coluna só (define a altura visível do grid ao lado). */
export const ORDEM_DATAS = ["adicionada", "atualizada", "envio"]

/**
 * Ordem do grid de propriedades. "locacao" e "prazoimpugnacao" são opcionais: só aparecem
 * se ligados nas Configurações (área ainda em desenvolvimento); por padrão, desligados.
 */
const ORDEM_GRID = [
  "id", "julgamento", "portal", "estado", "capagest", "modalidade", "uasg", "cidade", "capagmun", "habitantes",
  "nova", "locacao", "amostra", "consorcio", "prazoimpugnacao", "localentrega",
  "extra1", "extra2", "extra3", "extra4", "extra5", "extra6",
]
const OPCIONAIS: Record<string, boolean> = { locacao: false, prazoimpugnacao: false }
export const ordemDoGrid = () => ORDEM_GRID.filter((k) => (k in OPCIONAIS ? OPCIONAIS[k] : true))

// Fontes de onde ABRIR o edital (globo do cabeçalho). Diferente da propriedade "Portal de
// disputa", que só nomeia em qual portal a disputa acontece. 1 fonte: o clique abre direto;
// 2 ou mais: menu.
export const LINKS_DO_EDITAL: LinkDoEdital[] = [
  { rotulo: "PNCP", descricao: "Portal Nacional de Contratações Públicas" },
  { rotulo: "BBMnet", descricao: "plataforma de licitações" },
]

export const RESPONSAVEIS = [
  { initials: "A", name: "Ana Lima" },
  { initials: "M", name: "Marcos Ribeiro" },
  { initials: "R", name: "Rafael Costa" },
]
