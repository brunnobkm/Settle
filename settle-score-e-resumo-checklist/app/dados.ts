// Dados de exemplo das propostas de Score e Checklist no card.

/* ------------------------------------------------------------------ */
/* Temperatura do score                                                */
/* ------------------------------------------------------------------ */

export type Tom = "destructive" | "warning" | "success"

export type Temperatura = {
  chave: "frio" | "morno" | "quente"
  rotulo: "Frio" | "Morno" | "Quente"
  tom: Tom
}

export const FRIO: Temperatura = { chave: "frio", rotulo: "Frio", tom: "destructive" }
export const MORNO: Temperatura = { chave: "morno", rotulo: "Morno", tom: "warning" }
export const QUENTE: Temperatura = { chave: "quente", rotulo: "Quente", tom: "success" }

export function temperaturaDoScore(score: number): Temperatura {
  if (score >= 75) return QUENTE
  if (score >= 50) return MORNO
  return FRIO
}

// classes fixas por tom (o Tailwind precisa das classes escritas por extenso)
export const CLASSES_DO_TOM: Record<
  Tom,
  { texto: string; fundo: string; cheio: string; hover: string; indicador: string }
> = {
  destructive: {
    texto: "text-destructive",
    fundo: "bg-destructive/10",
    cheio: "bg-destructive",
    hover: "hover:bg-destructive/15 hover:text-destructive",
    indicador: "*:data-[slot=progress-indicator]:bg-destructive",
  },
  warning: {
    texto: "text-warning",
    fundo: "bg-warning/10",
    cheio: "bg-warning",
    hover: "hover:bg-warning/15 hover:text-warning",
    indicador: "*:data-[slot=progress-indicator]:bg-warning",
  },
  success: {
    texto: "text-success",
    fundo: "bg-success/10",
    cheio: "bg-success",
    hover: "hover:bg-success/15 hover:text-success",
    indicador: "*:data-[slot=progress-indicator]:bg-success",
  },
}

/** As 3 variações de cada modelo da aba Score. */
export type ExemploDeScore = Temperatura & { valor: number; revisar: number }

export const EXEMPLOS_DE_SCORE: ExemploDeScore[] = [
  { ...FRIO, valor: 39, revisar: 3 },
  { ...MORNO, valor: 65, revisar: 0 },
  { ...QUENTE, valor: 88, revisar: 0 },
]

/* ------------------------------------------------------------------ */
/* Card                                                                */
/* ------------------------------------------------------------------ */

export type Edital = {
  edital: string
  segmentos: string[]
  orgao: string
  objeto: string
  valor: string
}

export const EDITAL_PADRAO: Edital = {
  edital: "90001/2026",
  segmentos: ["Segmento 1", "Segmento 2"],
  orgao: "EPA - PROCURADORIA GERAL DO ESTADO DO PARÁ",
  objeto:
    "Licitação para fornecimento de computadores desktop, notebooks, monitores e periféricos para atender a rede municipal de ensino. Inclui instalação, configuração e garantia de 36 meses com suporte on-site. Entrega em 47 unidades escolares.",
  valor: "R$ 47.284.499,63",
}

export type CampoDeMetadado = {
  rotulo: string
  valor: string
  /** Prazo (envio da proposta). */
  prazo?: boolean
  /** Nota CAPAG: vira selo. */
  capag?: "boa" | "atencao"
}

export const DATAS: CampoDeMetadado[] = [
  { rotulo: "Adicionada", valor: "04/02/2026" },
  { rotulo: "Atualizada", valor: "12/02/2026" },
  { rotulo: "Envio da proposta", valor: "13/02/2026", prazo: true },
]

export const METADADOS: CampoDeMetadado[] = [
  { rotulo: "ID", valor: "1078513" },
  { rotulo: "UASG", valor: "-" },
  { rotulo: "Modalidade", valor: "Pregão - Eletrônico" },
  { rotulo: "Julgamento", valor: "Menor preço por item" },
  { rotulo: "Estado", valor: "PA" },
  { rotulo: "Cidade", valor: "Belém" },
  { rotulo: "Habitantes", valor: "1.303.403" },
  { rotulo: "CAPAG Estadual", valor: "A", capag: "boa" },
  { rotulo: "CAPAG Municipal", valor: "C", capag: "atencao" },
  { rotulo: "Portal de disputa", valor: "compras.saobernado.sp..." },
]

export type ItemDoEdital = { lote: string; nome: string; unidades: string; unitario: string; total: string }

export const ITENS: ItemDoEdital[] = [
  { lote: "1", nome: "Microcomputador desktop básico + Monitor Full HD", unidades: "94", unitario: "R$ 00.000,00", total: "R$ 0.000.000,00" },
  { lote: "1", nome: "Microcomputador desktop intermediário + Monitor Full HD", unidades: "22", unitario: "R$ 00.000,00", total: "R$ 0.000.000,00" },
  { lote: "1", nome: "Microcomputador desktop básico + Monitor Full HD", unidades: "94", unitario: "R$ 00.000,00", total: "R$ 0.000.000,00" },
  { lote: "1", nome: "Notebook básico", unidades: "186", unitario: "R$ 00.000,00", total: "R$ 0.000.000,00" },
  { lote: "1", nome: "Notebook intermediário", unidades: "5", unitario: "R$ 00.000,00", total: "R$ 0.000.000,00" },
]

export const ITENS_COM_CORRESPONDENCIA = 29
export const TOTAL_DE_ITENS = 300

/* ------------------------------------------------------------------ */
/* Checklist                                                           */
/* ------------------------------------------------------------------ */
// Lista de campos configurada pelo cliente; os valores são extraídos do
// edital (por isso há campos em revisão: valor null). Nenhum campo é mais
// importante que outro. O objetivo é dar visibilidade a essa lista no card.

export type SecaoDoChecklist = { nome: string; campos: [string, string | null][] }

export const CHECKLIST: SecaoDoChecklist[] = [
  {
    nome: "Variáveis para cálculo do Score",
    campos: [
      ["Encaixa em segmento de interesse?", "Sim"],
      ["Exige certidão específica na habilitação?", null],
      ["Exige certificado do fabricante?", "Sim"],
      ["Exige Prova de Conceito?", "Não"],
      ["Menciona Intelbras?", "Não"],
    ],
  },
  {
    nome: "Condições de Participação",
    campos: [
      ["Permite Consórcio?", "Sim"],
      ["Permite Subcontratação?", "Não"],
      ["Garantia Contratual?", null],
    ],
  },
  {
    nome: "Dados Básicos",
    campos: [
      ["Portal de Disputa", "compras.saobernado.sp..."],
      ["Legislação", "Lei nº 14.133/2021"],
      ["Ata de Registro de Preços?", null],
      ["Código no Portal", "90001/2026"],
    ],
  },
]

/** Mesma lista, tudo extraído (sem revisão). */
export const CHECKLIST_COMPLETO: SecaoDoChecklist[] = CHECKLIST.map((s) => ({
  nome: s.nome,
  campos: s.campos.map(([campo, valor]) => [campo, valor ?? "Não"]),
}))

export const pendentesDaSecao = (s: SecaoDoChecklist) => s.campos.filter(([, v]) => v === null).length
export const pendentesDoChecklist = (lista: SecaoDoChecklist[]) =>
  lista.reduce((total, s) => total + pendentesDaSecao(s), 0)

export const VARIACOES_DO_CHECKLIST = ["Com itens a revisar", "Tudo certo"]

/* ------------------------------------------------------------------ */
/* Filtro (simulação em padrão de produção)                            */
/* ------------------------------------------------------------------ */

export type EditalDoFiltro = Edital & { score: number; revisar: number }

export const EDITAIS_DO_FILTRO: EditalDoFiltro[] = [
  {
    edital: "026/2026",
    segmentos: ["Software"],
    orgao: "Prefeitura de Nova Alvorada do Sul",
    objeto:
      "Contratação de licença de uso de sistema de gestão pública municipal, web nativo, com implantação, treinamento e suporte técnico.",
    valor: "R$ 81.000,00",
    score: 88,
    revisar: 0,
  },
  {
    edital: "90001/2026",
    segmentos: ["Software"],
    orgao: "EPA - Procuradoria Geral do Estado do Pará",
    objeto:
      "Fornecimento de computadores desktop, notebooks, monitores e periféricos para a rede municipal de ensino, com instalação e garantia.",
    valor: "R$ 47.284.499,63",
    score: 65,
    revisar: 0,
  },
  {
    edital: "45/2026",
    segmentos: ["Software"],
    orgao: "Governo do Estado de São Paulo",
    objeto:
      "Contratação de software de gestão documental, com implantação, migração de dados, treinamento e manutenção continuada.",
    valor: "R$ 320.000,00",
    score: 41,
    revisar: 0,
  },
  {
    edital: "28/2026",
    segmentos: ["Software"],
    orgao: "Município de Atalaia",
    objeto:
      "Fornecimento de software de gestão fiscal, contábil e administrativa para a Prefeitura, Câmara e Fundo de Previdência, com suporte.",
    valor: "R$ 538.825,96",
    score: 44,
    revisar: 3,
  },
  {
    edital: "12/2026",
    segmentos: ["Software"],
    orgao: "Prefeitura Municipal de Belém",
    objeto:
      "Contratação de sistema integrado de gestão pública, com implantação, treinamento e suporte técnico continuado.",
    valor: "R$ 1.204.000,00",
    score: 31,
    revisar: 5,
  },
]

export type Ordem = "maior" | "menor" | "recentes" | "proposta"

export const ORDENS: { chave: Ordem; rotulo: string }[] = [
  { chave: "maior", rotulo: "Maior score" },
  { chave: "menor", rotulo: "Menor score" },
  { chave: "recentes", rotulo: "Mais recentes" },
  { chave: "proposta", rotulo: "Envio da proposta" },
]

/** Pendentes (score parcial) ficam agrupados: no topo em "Menor score", no fim nas demais ordens. */
export function ordenar(lista: EditalDoFiltro[], ordem: Ordem) {
  const comScore = lista.filter((d) => !d.revisar)
  const pendentes = lista.filter((d) => d.revisar)
  if (ordem === "menor") return [...pendentes, ...[...comScore].sort((a, b) => a.score - b.score)]
  return [...[...comScore].sort((a, b) => b.score - a.score), ...pendentes]
}
