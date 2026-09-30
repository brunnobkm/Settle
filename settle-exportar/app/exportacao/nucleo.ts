// Núcleo da exportação, compartilhado por Recomendadas e Em andamento (Kanban):
// versão do protótipo (Hoje x Proposta), decisões em aberto, métricas (Amplitude
// simulado no console), dados fictícios das linhas e geração do arquivo XLSX/CSV.

import { useCallback, useEffect, useState } from "react"

export type Formato = "xlsx" | "csv"
export type TelaExport = "recomendadas" | "kanban"
export type OpcaoExport = "hoje" | "periodo" | "filtrado" | "etapa" | "lote"

/** Acima disso o arquivo é preparado em segundo plano (simulação). */
export const LIMITE_SEGUNDO_PLANO = 500

export const USUARIO_DA_EXPORTACAO = "Brunno Krier (brunno.krier+demos@settlegov.com)"

export const quantidade = (n: number) => `${n.toLocaleString("pt-BR")} ${n === 1 ? "licitação" : "licitações"}`

/* ------------------------------------------------------------------ */
/* Métricas: eventos que iriam para o Amplitude                        */
/* ------------------------------------------------------------------ */

export type Evento = "export_modal_opened" | "export_option_selected" | "export_confirmed" | "export_completed" | "export_failed"

export function registrarEvento(evento: Evento, props: Record<string, unknown>) {
  const dados = { ...props, versao: lerVersao(), em: new Date().toISOString() }
  console.info(`%c[Amplitude] ${evento}`, "color:#00786f;font-weight:600", dados)
}

/* ------------------------------------------------------------------ */
/* Versão (Hoje x Proposta): fica na URL (?v=proposta)                 */
/* ------------------------------------------------------------------ */

export type Versao = "hoje" | "proposta"

export function lerVersao(): Versao {
  return new URLSearchParams(window.location.search).get("v") === "proposta" ? "proposta" : "hoje"
}

export function useVersao(): [Versao, (v: Versao) => void] {
  const [versao, setVersao] = useState<Versao>(lerVersao)
  const trocar = useCallback((v: Versao) => {
    const url = new URL(window.location.href)
    url.searchParams.set("v", v)
    window.history.replaceState(null, "", url)
    setVersao(v)
  }, [])
  return [versao, trocar]
}

/* ------------------------------------------------------------------ */
/* Decisões em aberto (alternáveis na tela, lembradas no navegador)    */
/* ------------------------------------------------------------------ */

/** a) Onde fica "Exportar esta etapa" no Kanban. */
export type EtapaVia = "ambos" | "coluna" | "geral"

export type Decisoes = {
  etapaVia: EtapaVia
  /** b) Coluna "Etapa atual" no arquivo da tela Recomendadas. */
  etapaNoArquivoRecomendadas: boolean
  /** Força a próxima exportação a falhar (para ver o estado de erro). */
  simularFalha: boolean
  /** Encurta as esperas (Selecionar tudo de hoje leva ~40 s). */
  temposCurtos: boolean
}

const DECISOES_PADRAO: Decisoes = {
  etapaVia: "ambos",
  etapaNoArquivoRecomendadas: true,
  simularFalha: false,
  temposCurtos: false,
}
const CHAVE = "settle-exportar:decisoes"
const EVENTO_DECISOES = "settle-exportar:decisoes"

function lerDecisoes(): Decisoes {
  try {
    return { ...DECISOES_PADRAO, ...JSON.parse(localStorage.getItem(CHAVE) ?? "{}") }
  } catch {
    return DECISOES_PADRAO
  }
}

export function useDecisoes(): [Decisoes, (patch: Partial<Decisoes>) => void] {
  const [decisoes, setDecisoes] = useState(lerDecisoes)
  useEffect(() => {
    const atualizar = () => setDecisoes(lerDecisoes())
    window.addEventListener(EVENTO_DECISOES, atualizar)
    return () => window.removeEventListener(EVENTO_DECISOES, atualizar)
  }, [])
  const alterar = useCallback((patch: Partial<Decisoes>) => {
    const nova = { ...lerDecisoes(), ...patch }
    try {
      localStorage.setItem(CHAVE, JSON.stringify(nova))
    } catch {
      // sem armazenamento: vale só nesta página
    }
    setDecisoes(nova)
    window.dispatchEvent(new Event(EVENTO_DECISOES))
  }, [])
  return [decisoes, alterar]
}

/* ------------------------------------------------------------------ */
/* Linhas fictícias do arquivo                                         */
/* ------------------------------------------------------------------ */

export type Linha = Record<string, string | number>

const ORGAOS = [
  "Prefeitura Municipal de Campinas / Secretaria de Administração",
  "Secretaria de Estado da Saúde de São Paulo",
  "Tribunal de Justiça do Estado de São Paulo",
  "Prefeitura Municipal de Belo Horizonte / Secretaria de Educação",
  "DNIT / Superintendência Regional em Minas Gerais",
  "Secretaria de Estado da Educação do Paraná",
  "Prefeitura Municipal de Ribeirão Preto",
  "Universidade Federal do Rio Grande do Sul",
  "Companhia de Saneamento Básico do Estado de São Paulo (SABESP)",
  "Secretaria de Estado da Saúde do Ceará",
]
const OBJETOS = [
  "Registro de preços para aquisição de computadores desktop, notebooks e monitores para a rede municipal de ensino.",
  "Contratação de empresa especializada em serviços continuados de limpeza hospitalar.",
  "Aquisição de gêneros alimentícios para a merenda escolar, com prioridade para agricultura familiar.",
  "Execução de obras de restauração e manutenção rodoviária, incluindo recapeamento e sinalização.",
  "Registro de preços para solução de proteção de endpoints (EDR), com implantação e suporte.",
  "Aquisição de mobiliário hospitalar, macas e camas para unidades de pronto atendimento.",
  "Prestação de serviços de vigilância armada e desarmada, com fornecimento de postos de trabalho.",
  "Aquisição de switches gerenciáveis e cabeamento estruturado para o data center.",
]
const LOCAIS: [string, string][] = [
  ["São Paulo", "SP"],
  ["Campinas", "SP"],
  ["Ribeirão Preto", "SP"],
  ["Belo Horizonte", "MG"],
  ["Curitiba", "PR"],
  ["Porto Alegre", "RS"],
  ["Fortaleza", "CE"],
  ["Rio de Janeiro", "RJ"],
]
const MODALIDADES = ["Pregão - Eletrônico", "Pregão - Presencial", "Concorrência", "Dispensa eletrônica"]
const JULGAMENTOS = ["Menor preço por item", "Menor preço por lote", "Maior desconto"]
const PORTAIS = ["Compras.gov.br", "BLL Compras", "Licitanet", "Portal de Compras Públicas"]
export const PESSOAS_DA_EXPORTACAO = ["Alice Iglesias", "Juliana Santos", "Marcos Ribeiro", "Ana Lima", "Diego Pires"]
const TAGS = ["Tecnologia", "Saúde", "Educação", "Infraestrutura", "Serviços", "Alimentação"]
const ETAPAS_RECOMENDADAS = ["Recomendada", "Recomendada", "Recomendada", "Salva para depois"]

const pad = (n: number) => String(n).padStart(2, "0")
const data = (dia: number) => {
  const d = new Date(2026, 8, 30 - (dia % 60))
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
}
const dataFutura = (dia: number) => {
  const d = new Date(2026, 9, 1 + (dia % 45))
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
}

export type OpcoesDasLinhas = {
  tela: TelaExport
  /** Valores fixos vindos dos filtros (ex.: Estado SP, Responsável Alice). */
  fixos?: { estado?: string; responsavel?: string }
  /** Etapas do Kanban para distribuir as linhas (nome e quantidade). */
  etapas?: { rotulo: string; total: number }[]
  /** Recomendadas: incluir a coluna "Etapa atual" (decisão b). */
  comEtapaAtual?: boolean
  /** Semente para variar os dados entre exportações. */
  semente?: number
}

/** Gera `n` linhas fictícias no formato do arquivo exportado. */
export function gerarLinhas(n: number, o: OpcoesDasLinhas): Linha[] {
  const linhas: Linha[] = []
  const s = o.semente ?? 0
  const etapaDaLinha: string[] = []
  if (o.etapas) for (const e of o.etapas) for (let i = 0; i < e.total; i++) etapaDaLinha.push(e.rotulo)

  for (let i = 0; i < n; i++) {
    const k = i + s
    const [cidade, uf] = o.fixos?.estado
      ? (LOCAIS.find((l) => l[1] === o.fixos?.estado) ?? [LOCAIS[0][0], o.fixos.estado])
      : LOCAIS[k % LOCAIS.length]
    const responsavel = o.fixos?.responsavel ?? PESSOAS_DA_EXPORTACAO[(k * 3) % PESSOAS_DA_EXPORTACAO.length]
    const tags = [TAGS[k % TAGS.length], TAGS[(k + 2) % TAGS.length]].join(", ")
    const comum: Linha = {
      Edital: `${String(77 + ((k * 7) % 900)).padStart(3, "0")}/2026`,
      ID: 1431011 - k * 13,
      Órgão: ORGAOS[k % ORGAOS.length],
      Objeto: OBJETOS[k % OBJETOS.length],
      "Valor global (R$)": Math.round((180000 + ((k * 7919) % 48000000)) * 100) / 100,
      Estado: uf,
      Cidade: cidade,
    }
    if (o.tela === "kanban") {
      linhas.push({
        ...comum,
        Etapa: etapaDaLinha[i] ?? "Análise de Oportunidades",
        Status: ["Abertas para participação", "Em disputa ou Homologação", "Suspensa"][k % 3],
        "Entrada na etapa": data(k + 3),
        Responsável: responsavel,
        Tags: tags,
        "Envio da proposta": dataFutura(k),
      })
    } else {
      linhas.push({
        ...comum,
        ...(o.comEtapaAtual ? { "Etapa atual": ETAPAS_RECOMENDADAS[k % ETAPAS_RECOMENDADAS.length] } : {}),
        Modalidade: MODALIDADES[k % MODALIDADES.length],
        Julgamento: JULGAMENTOS[k % JULGAMENTOS.length],
        "Portal de disputa": PORTAIS[k % PORTAIS.length],
        Adicionada: data(k),
        Atualizada: data(Math.max(0, k - 2)),
        "Envio da proposta": dataFutura(k),
        Score: 40 + ((k * 17) % 60),
        Responsável: responsavel,
        Tags: tags,
      })
    }
  }
  return linhas
}

/* ------------------------------------------------------------------ */
/* Arquivo                                                             */
/* ------------------------------------------------------------------ */

type Aba = Record<string, unknown> & { "!cols"?: { wch: number }[] }
type Pasta = { SheetNames: string[]; Sheets: Record<string, Aba> }
type XLSX = {
  write: (pasta: Pasta, opcoes: { type: "array"; bookType: "xlsx" }) => ArrayBuffer
  utils: {
    book_new: () => Pasta
    aoa_to_sheet: (linhas: unknown[][]) => Aba
    json_to_sheet: (linhas: object[]) => Aba
    book_append_sheet: (pasta: Pasta, aba: Aba, nome: string) => void
  }
}

export type Arquivo = {
  nome: string
  formato: Formato
  /** Pares "rótulo: valor" do cabeçalho (data e hora, usuário, filtros). Vazio = arquivo de hoje, sem cabeçalho. */
  sobre: [string, string][]
  linhas: Linha[]
}

function baixarBlob(blob: Blob, nome: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = nome
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

const larguras = (linhas: Linha[]) =>
  Object.keys(linhas[0] ?? {}).map((c) => ({
    wch: Math.min(60, Math.max(c.length, ...linhas.slice(0, 50).map((l) => String(l[c] ?? "").length)) + 2),
  }))

export async function baixarArquivo(arq: Arquivo) {
  if (arq.formato === "csv") {
    const esc = (v: unknown) => {
      const t = String(v ?? "")
      return /[;"\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t
    }
    const colunas = Object.keys(arq.linhas[0] ?? {})
    const topo = arq.sobre.map(([k, v]) => `# ${k}: ${v}`)
    const corpo = [colunas.map(esc).join(";"), ...arq.linhas.map((l) => colunas.map((c) => esc(l[c])).join(";"))]
    baixarBlob(new Blob(["﻿" + [...topo, ...(topo.length ? [""] : []), ...corpo].join("\n")], { type: "text/csv;charset=utf-8" }), arq.nome)
    return
  }
  const X = (await import("xlsx")) as unknown as XLSX
  const pasta = X.utils.book_new()
  if (arq.sobre.length) {
    const sobre = X.utils.aoa_to_sheet([["Exportação de licitações: Settle"], [], ...arq.sobre])
    sobre["!cols"] = [{ wch: 26 }, { wch: 90 }]
    X.utils.book_append_sheet(pasta, sobre, "Sobre esta exportação")
  }
  const aba = X.utils.json_to_sheet(arq.linhas)
  aba["!cols"] = larguras(arq.linhas)
  X.utils.book_append_sheet(pasta, aba, "Licitações")
  baixarBlob(
    new Blob([X.write(pasta, { type: "array", bookType: "xlsx" })], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    arq.nome
  )
}

export function agoraFormatado(d = new Date()) {
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} às ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function nomeDoArquivo(tela: TelaExport, formato: Formato, d = new Date()) {
  const base = tela === "kanban" ? "licitacoes-em-andamento" : "licitacoes-recomendadas"
  return `${base}_${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}h${pad(d.getMinutes())}.${formato}`
}
