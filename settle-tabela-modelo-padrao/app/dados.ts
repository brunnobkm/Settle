// Tabela modelo padrão: esquema de colunas (base da Análise Técnica no Figma),
// 100 requisitos de exemplo e as regras de valor, ordenação, filtro, agregação e
// agrupamento (recursos do Notion).

import {
  CalendarIcon,
  ChevronDownIcon,
  ContrastIcon,
  HashIcon,
  LinkIcon,
  ListIcon,
  MailIcon,
  SettingsIcon,
  SigmaIcon,
  SquareCheckIcon,
  ToggleLeftIcon,
  Trash2Icon,
  TypeIcon,
  UserIcon,
  type LucideIcon,
} from "lucide-react"

/* ---------------- tipos ---------------- */

export type Tipo =
  | "text"
  | "status_ai"
  | "confidence"
  | "select"
  | "multiselect"
  | "number"
  | "date"
  | "person"
  | "checkbox"
  | "url"
  | "email"
  | "formula"
  | "toggle_action"
  | "revisar"
  | "delete_action"

/** Tons semânticos das opções (badge, texto colorido, etiqueta). */
export type Tom = "neutral" | "primary" | "success" | "warning" | "destructive"

export type Opcao = { id: string; name: string; tone: Tom }

export type Agregacao =
  | "none"
  | "count_all"
  | "count_values"
  | "count_unique"
  | "count_empty"
  | "count_not_empty"
  | "percent_empty"
  | "sum"
  | "avg"
  | "min"
  | "max"
  | "percent_checked"
  | "checked"

export type Coluna = {
  id: string
  name: string
  type: Tipo
  width: number
  title?: boolean
  hidden: boolean
  wrap: boolean
  agg: Agregacao
  options?: Opcao[]
  /** Seleção exibida como pílula neutra (coluna Bloco). */
  renderAs?: "pill"
  /** Colunas de ação da Análise Técnica: menu reduzido. */
  system?: boolean
}

export type Valor = string | number | boolean | string[] | null | undefined

export type Linha = { id: string; valores: Record<string, Valor> }

export type Operador =
  | "contains"
  | "not_contains"
  | "is"
  | "is_not"
  | "empty"
  | "not_empty"
  | "checked"
  | "unchecked"
  | "gt"
  | "lt"
  | "eq"

export type Filtro = { col: string; op: Operador; value: string }

export type Ordenacao = { col: string; dir: "asc" | "desc" }

/* ---------------- catálogo de tipos ---------------- */

export const TIPOS: Record<Tipo, { label: string; Icon: LucideIcon }> = {
  text: { label: "Texto", Icon: TypeIcon },
  status_ai: { label: "Status (IA)", Icon: ContrastIcon },
  confidence: { label: "Confiança", Icon: ChevronDownIcon },
  select: { label: "Seleção", Icon: ChevronDownIcon },
  multiselect: { label: "Multi-seleção", Icon: ListIcon },
  number: { label: "Número", Icon: HashIcon },
  date: { label: "Data", Icon: CalendarIcon },
  person: { label: "Pessoa", Icon: UserIcon },
  checkbox: { label: "Checkbox", Icon: SquareCheckIcon },
  url: { label: "URL", Icon: LinkIcon },
  email: { label: "Email", Icon: MailIcon },
  formula: { label: "Fórmula", Icon: SigmaIcon },
  toggle_action: { label: "Ação (toggle)", Icon: ToggleLeftIcon },
  revisar: { label: "Revisar", Icon: SettingsIcon },
  delete_action: { label: "Excluir", Icon: Trash2Icon },
}

/** Tipos que podem ser escolhidos ao criar ou trocar o tipo de uma coluna. */
export const TIPOS_ESCOLHIVEIS = (Object.keys(TIPOS) as Tipo[]).filter((t) => t !== "delete_action")

export const TIPOS_COM_OPCOES: Tipo[] = ["select", "multiselect", "status_ai", "confidence"]
const TIPOS_OPCAO_UNICA: Tipo[] = ["status_ai", "confidence", "select"]

export const TONS: Tom[] = ["neutral", "primary", "success", "warning", "destructive"]
export const ROTULO_TOM: Record<Tom, string> = {
  neutral: "Neutro",
  primary: "Destaque",
  success: "Positivo",
  warning: "Atenção",
  destructive: "Crítico",
}

export const PESSOAS = [
  { id: "u1", name: "Ana Lima" },
  { id: "u2", name: "Bruno Khauã" },
  { id: "u3", name: "Carla Reis" },
]
export const iniciais = (n: string) =>
  n
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

export const REV_ESTADOS = {
  off: "Não iniciado",
  andamento: "Em andamento",
  revisado: "Revisado",
  pendente: "Marcar como revisado",
} as const
export type EstadoRevisao = keyof typeof REV_ESTADOS

/* ---------------- ids ---------------- */

let proximoId = 100
export const novoId = (prefixo = "id") => `${prefixo}${proximoId++}`

/* ---------------- esquema (base do Figma) ---------------- */

export const COLUNAS_INICIAIS: Coluna[] = [
  { id: "requisito", name: "Requisito", type: "text", width: 260, title: true, hidden: false, wrap: false, agg: "count_values" },
  {
    id: "status", name: "Status", type: "status_ai", width: 170, hidden: false, wrap: false, agg: "none",
    options: [
      { id: "atende", name: "Atende", tone: "success" },
      { id: "parcial", name: "Atende com parcialidade", tone: "warning" },
      { id: "revisao", name: "Em revisão", tone: "neutral" },
      { id: "naoatende", name: "Não atende", tone: "destructive" },
    ],
  },
  {
    id: "confianca", name: "Confiança IA", type: "confidence", width: 120, hidden: false, wrap: false, agg: "none",
    options: [
      { id: "alta", name: "Alta", tone: "success" },
      { id: "media", name: "Média", tone: "warning" },
      { id: "baixa", name: "Baixa", tone: "destructive" },
    ],
  },
  { id: "fonte", name: "Fonte", type: "url", width: 120, hidden: false, wrap: false, agg: "none" },
  {
    id: "bloco", name: "Bloco", type: "select", width: 140, hidden: false, wrap: false, agg: "none", renderAs: "pill",
    options: [
      { id: "b1", name: "Funcional", tone: "primary" },
      { id: "b2", name: "Não funcional", tone: "neutral" },
      { id: "b3", name: "Segurança", tone: "destructive" },
      { id: "b4", name: "Integração", tone: "warning" },
      { id: "b5", name: "Infraestrutura", tone: "success" },
    ],
  },
  { id: "notas", name: "Notas", type: "text", width: 120, hidden: false, wrap: false, agg: "none" },
  { id: "questionar", name: "Questionar", type: "toggle_action", width: 110, hidden: false, wrap: false, agg: "none", system: true },
  { id: "impugnar", name: "Impugnar", type: "toggle_action", width: 110, hidden: false, wrap: false, agg: "none", system: true },
  { id: "revisar", name: "Revisar", type: "revisar", width: 130, hidden: false, wrap: false, agg: "none", system: true },
  { id: "excluir", name: "Excluir", type: "delete_action", width: 90, hidden: false, wrap: false, agg: "none", system: true },
]

/* ---------------- linhas: 100 requisitos variados ---------------- */

const REQUISITOS = [
  "Autenticação de dois fatores", "Controle de acesso por perfil", "Exportação de relatórios em PDF",
  "Integração com gov.br", "Assinatura digital ICP-Brasil", "Backup automático diário", "Trilha de auditoria",
  "Disponibilidade mínima de 99,5%", "Suporte técnico 8x5", "Painel de indicadores", "API REST documentada",
  "Conformidade com a LGPD", "Importação de planilhas", "Notificações por e-mail", "Busca textual avançada",
  "Versionamento de documentos", "Gestão de prazos e alertas", "Cadastro de fornecedores", "Emissão de empenho",
  "Controle orçamentário", "Workflow de aprovação", "Histórico de alterações", "Acessibilidade WCAG 2.1",
  "Interface multi-idioma", "Recuperação de senha", "Dashboard em tempo real", "Geração de protocolo",
  "Anexos de até 50MB", "Filtros salvos por usuário", "Logs de segurança", "Cadastro de licitações",
  "Análise técnica de propostas", "Emissão de ata de registro", "Controle de impugnações", "Gestão de recursos",
]
const NOTAS = ["Verificar com o jurídico", "Aguardando publicação do edital", "Depende de terceiros", "Revisar redação", "Validado pela equipe", ""]
const STATUS_IDS = ["atende", "parcial", "revisao", "naoatende"]
const CONF_IDS = ["alta", "media", "baixa"]
const BLOCO_IDS = ["b1", "b2", "b3", "b4", "b5"]
const REV_IDS: EstadoRevisao[] = ["off", "andamento", "revisado", "pendente"]

export function gerarLinhas(n: number): Linha[] {
  // gerador determinístico: o layout fica igual a cada carregamento
  let seed = 20260608
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    return seed / 0x7fffffff
  }
  const sortear = <T,>(a: T[]) => a[Math.floor(rnd() * a.length)]
  const out: Linha[] = []
  for (let i = 0; i < n; i++) {
    const status = sortear(STATUS_IDS)
    const confianca = sortear(CONF_IDS)
    const fonte = rnd() > 0.25 ? `https://exemplo.com/doc/${i + 1}` : ""
    const bloco = sortear(BLOCO_IDS)
    const notas = sortear(NOTAS)
    const questionar = rnd() > 0.6
    const impugnar = rnd() > 0.72
    const revisar = sortear(REV_IDS)
    out.push({
      id: `r${i + 1}`,
      valores: { requisito: REQUISITOS[i % REQUISITOS.length], status, confianca, fonte, bloco, notas, questionar, impugnar, revisar },
    })
  }
  return out
}

/* ---------------- valores ---------------- */

export const opcaoPorId = (col: Coluna, id: Valor) => (col.options ?? []).find((o) => o.id === id)

export function formatarData(s: string) {
  if (!s) return ""
  const [a, m, d] = s.split("-")
  return `${d}/${m}/${a}`
}

export function textoDaCelula(col: Coluna, linha: Linha): string {
  const v = linha.valores[col.id]
  switch (col.type) {
    case "status_ai":
    case "confidence":
    case "select":
      return opcaoPorId(col, v)?.name ?? ""
    case "multiselect":
      return (Array.isArray(v) ? v : []).map((id) => opcaoPorId(col, id)?.name ?? "").join(" ")
    case "person":
      return PESSOAS.find((p) => p.id === v)?.name ?? ""
    case "date":
      return typeof v === "string" ? formatarData(v) : ""
    case "checkbox":
      return v ? "sim" : "não"
    case "toggle_action":
      return v ? "Sim" : "Não"
    case "revisar":
      return REV_ESTADOS[v as EstadoRevisao] ?? ""
    case "delete_action":
    case "formula":
      return ""
    default:
      return v == null ? "" : String(v)
  }
}

function chaveDeOrdenacao(col: Coluna, linha: Linha): number | string {
  const v = linha.valores[col.id]
  if (col.type === "number") return v == null || v === "" ? -Infinity : Number(v)
  if (col.type === "checkbox" || col.type === "toggle_action") return v ? 1 : 0
  if (col.type === "date") return typeof v === "string" && v ? new Date(v).getTime() : -Infinity
  if (TIPOS_OPCAO_UNICA.includes(col.type)) {
    const i = (col.options ?? []).findIndex((o) => o.id === v)
    return i < 0 ? 999 : i
  }
  if (col.type === "revisar") return ["off", "andamento", "pendente", "revisado"].indexOf(String(v))
  return textoDaCelula(col, linha).toLowerCase()
}

/* ---------------- filtro / ordenação ---------------- */

export const OPERADORES_PRECISAM_VALOR: Operador[] = ["contains", "not_contains", "is", "is_not", "gt", "lt", "eq"]

const OPS: Record<"text" | "number" | "select" | "checkbox", [Operador, string][]> = {
  text: [["contains", "contém"], ["not_contains", "não contém"], ["is", "é"], ["empty", "vazio"], ["not_empty", "preenchido"]],
  number: [["eq", "="], ["gt", ">"], ["lt", "<"], ["empty", "vazio"], ["not_empty", "preenchido"]],
  select: [["is", "é"], ["is_not", "não é"], ["empty", "vazio"], ["not_empty", "preenchido"]],
  checkbox: [["checked", "marcado"], ["unchecked", "desmarcado"]],
}
export function operadoresPara(tipo: Tipo) {
  if (TIPOS_OPCAO_UNICA.includes(tipo)) return OPS.select
  if (tipo === "checkbox" || tipo === "toggle_action") return OPS.checkbox
  if (tipo === "number") return OPS.number
  return OPS.text
}
export const filtroTemEfeito = (f: Filtro) => !OPERADORES_PRECISAM_VALOR.includes(f.op) || f.value !== ""
export const filtroUsaOpcoes = (col: Coluna) => TIPOS_OPCAO_UNICA.includes(col.type)

function passaFiltro(linha: Linha, f: Filtro, col: Coluna | undefined) {
  if (!col) return true
  // filtro ainda sem valor não esconde nada
  if (!filtroTemEfeito(f)) return true
  const bruto = linha.valores[col.id]
  const txt = textoDaCelula(col, linha).toLowerCase()
  const val = f.value.toLowerCase()
  const vazio = txt === "" || (Array.isArray(bruto) && !bruto.length)
  switch (f.op) {
    case "contains": return txt.includes(val)
    case "not_contains": return !txt.includes(val)
    case "is": return filtroUsaOpcoes(col) ? bruto === f.value : txt === val
    case "is_not": return filtroUsaOpcoes(col) ? bruto !== f.value : txt !== val
    case "empty": return vazio
    case "not_empty": return !vazio
    case "checked": return !!bruto
    case "unchecked": return !bruto
    case "gt": return Number(bruto) > Number(f.value)
    case "lt": return Number(bruto) < Number(f.value)
    case "eq": return Number(bruto) === Number(f.value)
  }
}

export function linhasVisiveis(linhas: Linha[], colunas: Coluna[], filtros: Filtro[], ordenacao: Ordenacao | null) {
  const porId = (id: string) => colunas.find((c) => c.id === id)
  let out = linhas.filter((l) => filtros.every((f) => passaFiltro(l, f, porId(f.col))))
  const col = ordenacao ? porId(ordenacao.col) : undefined
  if (ordenacao && col) {
    out = [...out].sort((a, b) => {
      const ka = chaveDeOrdenacao(col, a)
      const kb = chaveDeOrdenacao(col, b)
      const c = ka < kb ? -1 : ka > kb ? 1 : 0
      return ordenacao.dir === "desc" ? -c : c
    })
  }
  return out
}

/* ---------------- agregações ---------------- */

type FnAgregacao = (linhas: Linha[], col: Coluna) => string | number
const numeros = (ls: Linha[], c: Coluna) => ls.map((l) => Number(l.valores[c.id]) || 0)
const vazios = (ls: Linha[], c: Coluna) => ls.filter((l) => textoDaCelula(c, l) === "").length

export const AGREGACOES: Record<Agregacao, { label: string; fn: FnAgregacao }> = {
  none: { label: "Calcular", fn: () => "" },
  count_all: { label: "Contar tudo", fn: (ls) => ls.length },
  count_values: { label: "Valores", fn: (ls, c) => ls.length - vazios(ls, c) },
  count_unique: { label: "Únicos", fn: (ls, c) => new Set(ls.map((l) => textoDaCelula(c, l)).filter(Boolean)).size },
  count_empty: { label: "Vazios", fn: vazios },
  count_not_empty: { label: "Preenchidos", fn: (ls, c) => ls.length - vazios(ls, c) },
  percent_empty: { label: "% vazio", fn: (ls, c) => (ls.length ? `${Math.round((vazios(ls, c) / ls.length) * 100)}%` : "0%") },
  sum: { label: "Soma", fn: (ls, c) => numeros(ls, c).reduce((a, b) => a + b, 0) },
  avg: {
    label: "Média",
    fn: (ls, c) => {
      const n = numeros(ls, c)
      return n.length ? (n.reduce((a, b) => a + b, 0) / n.length).toFixed(1).replace(".", ",") : 0
    },
  },
  min: { label: "Mín", fn: (ls, c) => Math.min(...numeros(ls, c)) },
  max: { label: "Máx", fn: (ls, c) => Math.max(...numeros(ls, c)) },
  percent_checked: { label: "% marcado", fn: (ls, c) => (ls.length ? `${Math.round((ls.filter((l) => l.valores[c.id]).length / ls.length) * 100)}%` : "0%") },
  checked: { label: "Marcados", fn: (ls, c) => ls.filter((l) => l.valores[c.id]).length },
}

export function agregacoesPara(col: Coluna): Agregacao[] {
  const base: Agregacao[] = ["none", "count_all", "count_values", "count_unique", "count_empty", "count_not_empty", "percent_empty"]
  if (col.type === "number") return [...base, "sum", "avg", "min", "max"]
  if (col.type === "checkbox" || col.type === "toggle_action") return ["none", "checked", "percent_checked", "count_all"]
  if (col.type === "delete_action") return ["none"]
  return base
}

/* ---------------- agrupamento ---------------- */

export const podeAgrupar = (col: Coluna) =>
  ["status_ai", "confidence", "select", "multiselect", "person", "checkbox", "toggle_action", "revisar"].includes(col.type)

export const GRUPO_VAZIO = "__empty"

export function agrupar(linhas: Linha[], col: Coluna) {
  const mapa = new Map<string, Linha[]>()
  for (const l of linhas) {
    const v = l.valores[col.id]
    let chaves: string[]
    if (col.type === "multiselect") chaves = Array.isArray(v) && v.length ? v : [GRUPO_VAZIO]
    else {
      const vazio = v == null || v === "" || v === false
      chaves = [vazio ? (col.type === "toggle_action" ? "false" : GRUPO_VAZIO) : String(v)]
    }
    for (const k of chaves) {
      if (!mapa.has(k)) mapa.set(k, [])
      mapa.get(k)!.push(l)
    }
  }
  const ordem = col.options ? col.options.map((o) => o.id) : [...mapa.keys()]
  return [...new Set([...ordem, ...mapa.keys()])].filter((k) => mapa.has(k)).map((k) => ({ chave: k, linhas: mapa.get(k)! }))
}

/* ---------------- colunas e linhas novas ---------------- */

export function valorInicial(col: Coluna): Valor {
  if (col.type === "multiselect") return []
  if (col.type === "checkbox" || col.type === "toggle_action") return false
  if (col.type === "revisar") return "off"
  return ""
}

export function novaColuna(nome: string, tipo: Tipo): Coluna {
  return {
    id: novoId("c"),
    name: nome.trim() || TIPOS[tipo].label,
    type: tipo,
    width: 140,
    hidden: false,
    wrap: false,
    agg: "none",
    ...(TIPOS_COM_OPCOES.includes(tipo) ? { options: [] } : {}),
    ...(tipo === "select" ? { renderAs: "pill" as const } : {}),
  }
}

/** Troca o tipo da coluna e converte os valores das linhas quando precisa. */
export function trocarTipo(col: Coluna, tipo: Tipo, linhas: Linha[]): { coluna: Coluna; linhas: Linha[] } {
  const coluna: Coluna = { ...col, type: tipo, system: false, agg: "none" }
  if (TIPOS_COM_OPCOES.includes(tipo) && !coluna.options) coluna.options = []
  if (tipo === "select" && !coluna.renderAs) coluna.renderAs = "pill"
  let novas = linhas
  if (tipo === "multiselect") {
    novas = linhas.map((l) => {
      const v = l.valores[col.id]
      return Array.isArray(v) ? l : { ...l, valores: { ...l.valores, [col.id]: v ? [String(v)] : [] } }
    })
  }
  if (tipo === "checkbox" || tipo === "toggle_action") {
    novas = linhas.map((l) => ({ ...l, valores: { ...l.valores, [col.id]: !!l.valores[col.id] } }))
  }
  return { coluna, linhas: novas }
}
