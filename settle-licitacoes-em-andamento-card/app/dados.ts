// Dados de exemplo, tipos e regras do card canônico de licitações em andamento.
// As regras seguem docs/handoff-desenvolvedor.md (especificação para desenvolvedores).

/* ------------------------------------------------------------------ */
/* Licitação                                                           */
/* ------------------------------------------------------------------ */

export type StatusId =
  | "abertas"
  | "em-disputa"
  | "suspensa"
  | "anulada"
  | "revogada"
  | "homologada"
  | "deserta"

/** Família de cor do status (§10.2): verde, âmbar ou vermelho. */
export type TomStatus = "success" | "warning" | "destructive"

export type Status = { id: StatusId; rotulo: string; tom: TomStatus }

export const STATUS: Status[] = [
  { id: "abertas", rotulo: "Abertas para participação", tom: "success" },
  { id: "em-disputa", rotulo: "Em disputa ou Homologação", tom: "warning" },
  { id: "suspensa", rotulo: "Suspensa", tom: "warning" },
  { id: "anulada", rotulo: "Anulada", tom: "destructive" },
  { id: "revogada", rotulo: "Revogada", tom: "destructive" },
  { id: "homologada", rotulo: "Homologada", tom: "success" },
  { id: "deserta", rotulo: "Deserta ou Fracassada", tom: "destructive" },
]

export const statusPorId = (id: StatusId | null) => STATUS.find((s) => s.id === id)

export type Pessoa = { id: number; nome: string }

export const PESSOAS: Pessoa[] = [
  { id: 1, nome: "Juliana Santos" },
  { id: 2, nome: "Fabio Almeida Pereira" },
  { id: 3, nome: "Mateus Silva" },
  { id: 4, nome: "Ana Costa" },
  { id: 5, nome: "Pedro Lima" },
  { id: 6, nome: "Carla Mendes" },
  { id: 7, nome: "Rafael Oliveira" },
]

export const pessoaPorId = (id: number) => PESSOAS.find((p) => p.id === id)

export const SEGMENTOS_INICIAIS = [
  "Tecnologia",
  "Materiais",
  "Saúde",
  "Educação",
  "Engenharia",
  "Serviços",
  "Construção",
  "Alimentação",
  "Tecnologia da Informação e Comunicação",
  "Materiais de Construção e Engenharia Civil",
  "Equipamentos e Suprimentos Médico-Hospitalares",
]

export const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA",
  "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
]

export type Licitacao = {
  id: string
  titulo: string
  codigoEdital: string
  segmentos: string[]
  orgao: string
  objeto: string
  status: StatusId | null
  responsaveis: number[]
  /** AAAA-MM-DD; null só se o usuário limpar no calendário. */
  dataEnvio: string | null
  cidade: string
  estado: string
  /** null = vazio. Zero mostra "R$ 0,00". */
  valorGlobal: number | null
}

export const LICITACAO_INICIAL: Licitacao = {
  id: "90001-2026",
  titulo: "Locação de software integrado de gestão pública em Pacatuba/SE",
  codigoEdital: "90001/2026",
  segmentos: [
    "Tecnologia da Informação e Comunicação",
    "Materiais de Construção e Engenharia Civil",
    "Equipamentos e Suprimentos Médico-Hospitalares",
  ],
  orgao: "Universidade Federal de Mato Grosso",
  objeto:
    "[LICITANET] - SISTEMA DE REGISTRO DE PREÇOS VISANDO A FUTURA E EVENTUAL CONTRATAÇÃO DE EMPRESA ESPECIALIZADA NA PRESTAÇÃO DE SERVIÇOS DE LOCAÇÃO DE SOFTWARE INTEGRADO DE GESTÃO PÚBLICA, DESTINADO A ATENDER ÀS DEMANDAS DA ADMINISTRAÇÃO PÚBLICA MUNICIPAL DE PACATUBA/SE, CONFORME ESPECIFICAÇÕES CONTIDAS NO TERMO DE REFERÊNCIA.",
  status: "em-disputa",
  responsaveis: [1, 2, 3],
  dataEnvio: "2026-04-25",
  cidade: "Paripiranga",
  estado: "BA",
  valorGlobal: 220965.46,
}

/** Link único do card (§18.3). */
export const linkDaLicitacao = (id: string) => `https://app.settle.com/licitacao/${id}`

/* ------------------------------------------------------------------ */
/* Propriedades do card                                                */
/* ------------------------------------------------------------------ */

export type ChavePropriedade =
  | "codigoEdital"
  | "segmentos"
  | "orgao"
  | "objeto"
  | "status"
  | "responsaveis"
  | "dataEnvio"
  | "cidade"
  | "valor"

/** O título fica sempre no topo (§5); as demais podem ser reordenadas arrastando. */
export const ORDEM_PADRAO: ChavePropriedade[] = [
  "codigoEdital",
  "segmentos",
  "orgao",
  "objeto",
  "status",
  "responsaveis",
  "dataEnvio",
  "cidade",
  "valor",
]

/** Dica que aparece à esquerda da linha (250ms de atraso). */
export const DICAS: Record<ChavePropriedade | "titulo", string> = {
  titulo: "Título da licitação",
  codigoEdital: "Número do edital",
  segmentos: "Segmento",
  orgao: "Nome do Órgão",
  objeto: "Objeto da licitação",
  status: "Status do edital",
  responsaveis: "Responsável",
  dataEnvio: "Data de envio da proposta",
  cidade: "Cidade / Estado",
  valor: "Valor global",
}

/* ------------------------------------------------------------------ */
/* Formatação e regras                                                 */
/* ------------------------------------------------------------------ */

export const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
]

export const formatarMoeda = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

export const formatarData = (iso: string) => {
  const [a, m, d] = iso.split("-")
  return `${d}/${m}/${a}`
}

export const dataParaIso = (data: Date) =>
  `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}`

export const isoParaData = (iso: string) => {
  const [a, m, d] = iso.split("-").map(Number)
  return new Date(a, m - 1, d)
}

/**
 * Urgência da data de envio (§10.3), no fuso local:
 * hoje = vermelho; 1 a 7 dias = âmbar; 8+ dias ou data passada = neutro.
 */
export type Urgencia = { tom: "hoje" | "semana" | "normal"; dias: number }

export function urgenciaDaData(iso: string): Urgencia {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const dias = Math.round((isoParaData(iso).getTime() - hoje.getTime()) / 86_400_000)
  if (dias === 0) return { tom: "hoje", dias }
  if (dias >= 1 && dias <= 7) return { tom: "semana", dias }
  return { tom: "normal", dias }
}

/** Valor: só números, "," e "." (§5.10). */
export const limparValor = (texto: string) => texto.replace(/[^\d.,]/g, "")

/**
 * Aceita vírgula ou ponto como decimal e só números ("1500" vira 1500).
 * Com os dois separadores, o último é o decimal. Retorna null se vazio.
 */
export function lerValor(texto: string): number | null | "invalido" {
  const t = limparValor(texto).trim()
  if (!t) return null
  const ultimaVirgula = t.lastIndexOf(",")
  const ultimoPonto = t.lastIndexOf(".")
  let normalizado: string
  if (ultimaVirgula >= 0 && ultimoPonto >= 0) {
    const decimal = ultimaVirgula > ultimoPonto ? "," : "."
    const milhar = decimal === "," ? "." : ","
    normalizado = t.split(milhar).join("").replace(decimal, ".")
  } else if (ultimaVirgula >= 0) {
    normalizado = t.split(".").join("").replace(/,(?=.*,)/g, "").replace(",", ".")
  } else if ((t.match(/\./g) ?? []).length > 1 || /\.\d{3}$/.test(t)) {
    // "1.500" e "1.500.000" são separador de milhar
    normalizado = t.split(".").join("")
  } else {
    normalizado = t
  }
  const n = Number(normalizado)
  return Number.isFinite(n) && n >= 0 ? n : "invalido"
}

/** Texto para o input de edição: 220965.46 vira "220965,46". */
export const valorParaInput = (v: number | null) => (v == null ? "" : String(v).replace(".", ","))

/* ------------------------------------------------------------------ */
/* Propriedades de demonstração ("Adicionar propriedade")              */
/* ------------------------------------------------------------------ */

export type TipoDemo =
  | "text"
  | "number"
  | "select"
  | "multi-select"
  | "date"
  | "person"
  | "files-media"
  | "checkbox"
  | "url"
  | "email"
  | "phone"
  | "last-edited-by"
  | "button"
  | "place"

/** Como cada tipo é editado: texto na própria linha, popover ou alternância. */
export type EditorDemo = "texto" | "numero" | "botao" | "select" | "multi" | "data" | "pessoa" | "arquivos" | "alternar"

export type ConfigTipo = {
  rotulo: string
  valorPadrao: unknown
  opcoes?: string[]
  /** Preenchida automaticamente: não abre editor. */
  automatica?: boolean
  editor?: EditorDemo
}

export const TIPOS: Record<TipoDemo, ConfigTipo> = {
  text: { rotulo: "Texto", valorPadrao: "Texto de exemplo", editor: "texto" },
  number: { rotulo: "Número", valorPadrao: 42, editor: "numero" },
  select: {
    rotulo: "Select",
    valorPadrao: "Opção 1",
    opcoes: ["Opção 1", "Opção 2", "Opção 3"],
    editor: "select",
  },
  "multi-select": {
    rotulo: "Multi-select",
    valorPadrao: ["Tag 1", "Tag 2"],
    opcoes: ["Tag 1", "Tag 2", "Tag 3", "Tag 4", "Tag 5"],
    editor: "multi",
  },
  date: { rotulo: "Data", valorPadrao: "2026-06-15", editor: "data" },
  person: { rotulo: "Pessoa", valorPadrao: [1, 2], editor: "pessoa" },
  "files-media": { rotulo: "Arquivos e mídia", valorPadrao: [], editor: "arquivos" },
  checkbox: { rotulo: "Caixa de seleção", valorPadrao: true, editor: "alternar" },
  url: { rotulo: "URL", valorPadrao: "https://exemplo.com", editor: "texto" },
  email: { rotulo: "Email", valorPadrao: "usuario@empresa.com", editor: "texto" },
  phone: { rotulo: "Telefone", valorPadrao: "+55 (11) 99999-9999", editor: "texto" },
  "last-edited-by": { rotulo: "Editado por", valorPadrao: 2, automatica: true },
  button: { rotulo: "Botão", valorPadrao: "Enviar proposta", editor: "botao" },
  place: { rotulo: "Lugar", valorPadrao: "Avenida Paulista, 1578", editor: "texto" },
}

export type PropriedadeDemo = { id: string; tipo: TipoDemo; valor: unknown }

export function novaPropriedadeDemo(tipo: TipoDemo): PropriedadeDemo {
  const padrao = TIPOS[tipo].valorPadrao
  return {
    id: `demo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    tipo,
    valor: Array.isArray(padrao) ? [...padrao] : padrao,
  }
}
