// Importação e exportação da análise técnica em Excel (SheetJS).
// A biblioteca é carregada sob demanda da CDN oficial da SheetJS, como no protótipo original,
// para não adicionar dependência ao workspace react/.

import { CONFIANCA, STATUS, STATUS_VALIDOS, type Confianca, type Requisito, type Status } from "./dados"


// Nome da aba de instruções no modelo. Regra de leitura de abas:
// a importação IGNORA qualquer aba cujo nome comece com este prefixo.
const INSTRUCOES_PREFIX = "📋"
const ABA_INSTRUCOES = "📋 Instruções"
const ABA_REQUISITOS = "Requisitos"

// Colunas obrigatórias no arquivo importado.
const COL_ID = "ID"
const COL_MODULO = "Nome do Módulo"

// Ordem e cabeçalhos das colunas no arquivo exportado.
const HEADERS = [COL_ID, COL_MODULO, "Requisito", "Status", "Confiança IA", "Justificativa IA", "Responsável", "Notas"]

export const NOME_DO_ARQUIVO = "analise-tecnica-software.xlsx"
export const FORMATOS_ACEITOS = ".xlsx,.xls,.csv,.ods"

/* ---------------- SheetJS (tipos mínimos do que usamos) ---------------- */

type Aba = Record<string, unknown> & { "!cols"?: { wch: number }[] }
type Pasta = { SheetNames: string[]; Sheets: Record<string, Aba> }
type XLSX = {
  read: (dados: ArrayBuffer, opcoes: { type: "array" }) => Pasta
  write: (pasta: Pasta, opcoes: { type: "array"; bookType: "xlsx" }) => ArrayBuffer
  utils: {
    book_new: () => Pasta
    aoa_to_sheet: (linhas: unknown[][]) => Aba
    json_to_sheet: (linhas: object[], opcoes?: { header?: string[] }) => Aba
    book_append_sheet: (pasta: Pasta, aba: Aba, nome: string) => void
    sheet_to_json: (aba: Aba, opcoes?: { defval?: unknown }) => Record<string, unknown>[]
  }
}

export class BibliotecaIndisponivel extends Error {}

let carregando: Promise<XLSX> | null = null

/** Carrega a SheetJS (instalada no projeto) uma vez só. Chamar cedo deixa os botões instantâneos. */
export function carregarSheetJS(): Promise<XLSX> {
  if (carregando) return carregando
  carregando = import("xlsx")
    .then((m) => m as unknown as XLSX)
    .catch(() => {
      carregando = null // permite tentar de novo
      throw new BibliotecaIndisponivel()
    })
  return carregando
}

/* ---------------- exportação ---------------- */

/** Gera o .xlsx com a aba de instruções + a aba de requisitos e baixa direto (sem "salvar como"). */
export async function exportarPlanilha(dados: Requisito[]) {
  const X = await carregarSheetJS()
  const pasta = X.utils.book_new()

  // Aba de instruções (sugestão de Alice Iglesias)
  const instrucoes = [
    ["Análise técnica de software: instruções de preenchimento"],
    [],
    ["O que esta planilha faz:"],
    ["• Exporta os requisitos da análise técnica para você editar no Excel."],
    ["• Ao reimportar, o sistema preenche automaticamente a tabela existente."],
    [],
    ["Regras obrigatórias:"],
    ['• NÃO exclua a coluna "ID": ela identifica cada requisito.'],
    ['• A coluna "Nome do Módulo" deve estar sempre presente.'],
    ["• Mantenha todas as demais colunas existentes."],
    ["• Não repita o mesmo requisito em várias abas."],
    [`• Edite os dados apenas na aba "${ABA_REQUISITOS}".`],
    [],
    ["Valores aceitos:"],
    ["• Status: " + STATUS_VALIDOS.join(" | ")],
    ["• Confiança IA: " + CONFIANCA.join(" | ")],
    [],
    ["Leitura de abas:"],
    [`• Esta aba de instruções (prefixo "${INSTRUCOES_PREFIX}") é ignorada na importação.`],
    [],
    ["Em caso de erro: releia estas instruções e garanta que está alinhado."],
  ]
  const abaInstrucoes = X.utils.aoa_to_sheet(instrucoes)
  abaInstrucoes["!cols"] = [{ wch: 90 }]
  X.utils.book_append_sheet(pasta, abaInstrucoes, ABA_INSTRUCOES)

  // Aba de requisitos
  const linhas = dados.map((r) => ({
    [COL_ID]: r.id,
    [COL_MODULO]: r.modulo,
    Requisito: r.requisito,
    Status: r.status,
    "Confiança IA": r.confianca,
    "Justificativa IA": r.justificativa,
    Responsável: r.responsavel,
    Notas: r.notas,
  }))
  const abaRequisitos = X.utils.json_to_sheet(linhas, { header: HEADERS })
  abaRequisitos["!cols"] = [12, 16, 60, 20, 13, 60, 18, 24].map((wch) => ({ wch }))
  X.utils.book_append_sheet(pasta, abaRequisitos, ABA_REQUISITOS)

  const buffer = X.write(pasta, { type: "array", bookType: "xlsx" })
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = NOME_DO_ARQUIVO
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

/* ---------------- importação ---------------- */

export type ResultadoImportacao = { dados: Requisito[]; atualizados: number; criados: number }

/** Erro de formato do arquivo: a tela mostra a mensagem genérica "Releia as instruções...". */
export class ArquivoInvalido extends Error {}

/**
 * Lê o arquivo, valida e preenche a tabela existente:
 * ID existente → atualiza; ID novo → cria; requisitos ausentes no arquivo → mantidos.
 */
export async function importarPlanilha(arquivo: File, atuais: Requisito[]): Promise<ResultadoImportacao> {
  const X = await carregarSheetJS()
  let pasta: Pasta
  try {
    pasta = X.read(await arquivo.arrayBuffer(), { type: "array" })
  } catch {
    throw new ArquivoInvalido("arquivo ilegível")
  }

  // Regra de leitura: ignora abas de instruções (prefixo) e lê as demais.
  const abasDeDados = pasta.SheetNames.filter((n) => !n.trim().startsWith(INSTRUCOES_PREFIX))
  if (abasDeDados.length === 0) throw new ArquivoInvalido("sem aba de dados")

  // Junta as linhas de todas as abas de dados (suporta divisão por módulo).
  const linhas = abasDeDados.flatMap((nome) => X.utils.sheet_to_json(pasta.Sheets[nome], { defval: "" }))
  if (linhas.length === 0) throw new ArquivoInvalido("arquivo vazio")

  // Colunas obrigatórias: ID e Nome do Módulo.
  const colunas = Object.keys(linhas[0])
  const norm = (s: string) => s.trim().toLowerCase()
  const chave = (alvo: string) => colunas.find((c) => norm(c) === norm(alvo))
  const kId = chave(COL_ID)
  const kMod = chave(COL_MODULO)
  if (!kId || !kMod) throw new ArquivoInvalido("colunas obrigatórias ausentes")
  const kReq = chave("Requisito")
  const kStatus = chave("Status")
  const kConf = chave("Confiança IA")
  const kJust = chave("Justificativa IA")
  const kResp = chave("Responsável")
  const kNotas = chave("Notas")
  const texto = (linha: Record<string, unknown>, k?: string) => (k ? String(linha[k] ?? "").trim() : "")

  const dados = atuais.map((r) => ({ ...r }))
  const porId = new Map(dados.map((r) => [r.id, r]))
  const vistos = new Set<string>()
  let atualizados = 0
  let criados = 0

  for (const linha of linhas) {
    const id = texto(linha, kId)
    if (!id) throw new ArquivoInvalido("linha sem ID")
    if (vistos.has(id)) continue // não duplica requisito repetido entre abas
    vistos.add(id)

    // valores fora da lista caem num padrão (DECISOES.md, item 4)
    const valStatus = texto(linha, kStatus)
    const status: Status = STATUS_VALIDOS.includes(valStatus as Status) ? (valStatus as Status) : STATUS.PARCIAL
    const valConf = texto(linha, kConf)
    const confianca: Confianca = CONFIANCA.includes(valConf as Confianca) ? (valConf as Confianca) : "Média"

    const campos = {
      modulo: texto(linha, kMod),
      requisito: texto(linha, kReq),
      status,
      confianca,
      justificativa: texto(linha, kJust),
      responsavel: texto(linha, kResp),
      notas: texto(linha, kNotas),
    }

    const existente = porId.get(id)
    if (existente) {
      Object.assign(existente, campos, { aiSuggested: false })
      atualizados++
    } else {
      const novo: Requisito = { id, tipo: "Software", aiSuggested: false, ...campos }
      dados.push(novo)
      porId.set(id, novo)
      criados++
    }
  }

  return { dados, atualizados, criados }
}
