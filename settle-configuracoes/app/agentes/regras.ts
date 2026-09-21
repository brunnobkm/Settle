// Regras sem interface: quem usa cada variável, como a instrução vira leitura, como o
// momento vira frase. Tudo puro, a partir do estado. Parte do handoff
// (settle-agentes/plataforma/app/regras.ts), com o resumo em frase do agente.

import {
  AGENDA_PADRAO,
  AGENTE_TEC,
  AGENTES_SEM_TEXTO,
  DIAS,
  GATILHOS,
  ONDE,
  OUTROS_ARQUIVOS,
  REGRAS_INICIAIS,
  VARS_INICIAIS,
  type Agenda,
  type Agente,
  type Momento,
  type Regra,
  type Variavel,
} from "./dados"

/** O que a área configura: variáveis, regras e agentes. É o que o desfazer restaura. */
export type Config = {
  vars: Record<string, Variavel>
  /** Nomes das variáveis excluídas: o chip continua dizendo de quem ele fala. */
  varsEx: Record<string, string>
  regras: Regra[]
  /** Variáveis da Análise técnica (escopo por componente), fora do texto dela. */
  tecVars: string[]
  agentes: Agente[]
}

export const cap = (t: string) => (t ? t.charAt(0).toUpperCase() + t.slice(1) : t)

export const ehAtivo = (an: Agente) => an.ativo !== false

/** As fontes na ordem de busca, com a procura nos demais arquivos no fim. */
export function fontesDe(v: Pick<Variavel, "fontes" | "resto">) {
  return [...(v.fontes ?? []), ...(v.resto ? [OUTROS_ARQUIVOS] : [])]
}

/** As variáveis citadas num texto, na ordem, sem repetir. */
export function varsDoTexto(t: string) {
  const ks: string[] = []
  for (const m of (t || "").matchAll(/\{\{(\w+)\}\}/g)) if (!ks.includes(m[1])) ks.push(m[1])
  return ks
}

/** O texto sem as variáveis: vazio quer dizer que a instrução só tem variáveis. */
export const semVariaveis = (t: string) => (t || "").replace(/\{\{\w+\}\}/g, "").replace(/[^\p{L}\p{N}]+/gu, " ").trim()

/** Fora do campo de edição, a variável aparece pelo nome, não pela chave. */
export function textoLegivel(t: string, vars: Record<string, Variavel>, varsEx: Record<string, string> = {}) {
  return (t || "").replace(/\{\{(\w+)\}\}/g, (m, k: string) => vars[k]?.nome ?? varsEx[k] ?? m)
}

/** As regras de um Score criado pelo cliente são só as dele. */
export function regrasDa(an: Pick<Agente, "id" | "destino" | "propria">, regras: Regra[]) {
  if (!an.destino) return []
  return regras.filter((r) => (r.analise ? r.analise === an.id : r.destino === an.destino && !an.propria))
}

/* A instrução do Score e do Checklist é derivada uma vez das regras, com as variáveis já como variáveis. */
export function textoDasRegras(an: Pick<Agente, "id" | "destino" | "propria">, regras: Regra[]) {
  return regrasDa(an, regras)
    .map((r) => {
      const v = r.vars.map((k) => `{{${k}}}`).join(" e ")
      return `${r.nome}: ${r.regraTexto || r.instr}${v ? ` Use ${v}.` : ""}`
    })
    .join("\n")
}

export function configInicial(): Config {
  const regras = REGRAS_INICIAIS.map((r) => ({ ...r, vars: [...r.vars] }))
  return {
    vars: structuredClone(VARS_INICIAIS),
    varsEx: {},
    regras,
    tecVars: [...AGENTE_TEC.vars],
    agentes: AGENTES_SEM_TEXTO.map((an) => ({
      ...structuredClone(an),
      texto: an.texto ?? (an.formato === "estruturado" ? textoDasRegras(an, regras) : ""),
    })),
  }
}

/** As variáveis que o agente usa: as do texto e as das regras dele. */
export function varsDoAgente(an: Agente, cfg: Config) {
  const ks = varsDoTexto(an.texto)
  regrasDa(an, cfg.regras).forEach((r) => r.vars.forEach((k) => !ks.includes(k) && ks.push(k)))
  if (an.formato === "composicao") cfg.tecVars.forEach((k) => !ks.includes(k) && ks.push(k))
  // a excluída não conta como usada: ela aparece como pendência, não como variável
  return ks.filter((k) => cfg.vars[k])
}

const agenteDaRegra = (r: Regra) => (r.analise ? r.analise : r.destino === "checklist" ? "checklist" : "score")

/** Quem quebra se esta variável mudar ou sumir: é o que a pessoa precisa saber antes de mexer. */
export function usosDaVar(k: string, cfg: Config) {
  const u: { id: string; agente: string; regra: string }[] = []
  cfg.regras
    .filter((r) => r.vars.includes(k))
    .forEach((r) => {
      const an = cfg.agentes.find((x) => x.id === agenteDaRegra(r))
      if (an) u.push({ id: an.id, agente: an.nome, regra: r.nome })
    })
  if (cfg.tecVars.includes(k)) {
    const an = cfg.agentes.find((x) => x.formato === "composicao")
    if (an) u.push({ id: an.id, agente: an.nome, regra: "Conformidade técnica do item" })
  }
  cfg.agentes
    .filter((an) => an.formato === "texto" && varsDoTexto(an.texto).includes(k))
    .forEach((an) => u.push({ id: an.id, agente: an.nome, regra: "instrução em texto" }))
  return u
}

/** Quais agentes dependem dela, não quantas regras: a mesma análise pode usar a variável duas vezes. */
export function agentesDaVar(k: string, cfg: Config) {
  const vistos: { id: string; nome: string }[] = []
  usosDaVar(k, cfg).forEach((u) => {
    if (!vistos.some((x) => x.id === u.id)) vistos.push({ id: u.id, nome: u.agente })
  })
  return vistos
}

/* Variável excluída: a exclusão continua livre, mas quem usava a variável para de rodar
   até alguém revisar, e a lista mostra isso (no teste, o agente quebrado continuava com
   cara de ativo). */
export function varsQuebradas(an: Agente, cfg: Config) {
  const ks = varsDoTexto(an.texto).filter((k) => cfg.varsEx[k] && !cfg.vars[k])
  regrasDa(an, cfg.regras).forEach((r) => (r.perdeu ?? []).forEach((k) => !cfg.vars[k] && !ks.includes(k) && ks.push(k)))
  return ks
}

export function dicaQuebra(q: string[], varsEx: Record<string, string>) {
  const nomes = q.map((k) => `“${varsEx[k]}”`).join(", ")
  return (
    (q.length === 1 ? `A variável ${nomes} foi excluída` : `As variáveis ${nomes} foram excluídas`) +
    ". O agente parou de rodar até alguém revisar a instrução."
  )
}

/** O gatilho mora como chave no formulário e como texto no agente salvo. */
export function momentoDe(gatilho: string): Momento | "" {
  if (!gatilho) return ""
  if (gatilho in GATILHOS) return gatilho as Momento
  const k = (Object.keys(GATILHOS) as Momento[]).find((m) => GATILHOS[m] === gatilho)
  return k ?? "analise"
}

/** O texto do selo, como o Claude escreve: "Toda sexta-feira às 9:00". */
export function descAgenda(ag: Agenda = AGENDA_PADRAO) {
  const h = (ag.hora || "09:00").replace(/^0/, "")
  if (ag.freq === "hora") return "A cada hora"
  if (ag.freq === "dia") return `Todo dia às ${h}`
  if (ag.freq === "uteis") return `Dias úteis às ${h}`
  if (ag.freq === "mes") return `Todo mês no dia ${+(ag.inicio || "2026-09-12").slice(8)} às ${h}`
  const d = DIAS[ag.dia] ?? DIAS.sex
  return `${ag.dia === "sab" || ag.dia === "dom" ? "Todo" : "Toda"} ${d} às ${h}`
}

/** Quando, em frase curta: "Quando chega em Recomendadas", "Toda segunda-feira às 8:00". */
export function quandoTxt(an: Pick<Agente, "gatilho" | "agenda" | "repete">) {
  const m = momentoDe(an.gatilho)
  if (m === "agendado") return descAgenda(an.agenda)
  const repete = an.repete === "sempre" && (m === "captura" || m === "recomendadas")
  return repete ? `${an.gatilho} e quando o edital mudar` : an.gatilho
}

/** Onde o resultado aparece, em frase curta: "Mostra em Habilitação", "Só faz ações". */
export function ondeTxt(an: Pick<Agente, "onde">) {
  if (!an.onde) return "Sem lugar definido"
  return an.onde === "nenhum" ? "Só faz ações" : `Mostra em ${ONDE[an.onde].t}`
}

/** Quando, com o quê e onde, em três pedaços: "Quando chega em Recomendadas · usa 2 variáveis · mostra em Habilitação". */
export function resumoDoAgente(an: Agente, cfg: Config) {
  const n = varsDoAgente(an, cfg).length
  const onde = ondeTxt(an)
  return [quandoTxt(an), n ? `usa ${n === 1 ? "1 variável" : `${n} variáveis`}` : "não usa variáveis", onde.charAt(0).toLowerCase() + onde.slice(1)]
}

export function proximaExecucao(an: Agente) {
  if (an.ativo === false) return "Não roda em licitação nova até ser retomado"
  const e = an.execs[0]
  return e ? `Última execução ${e.quando}` : "Ainda não rodou"
}

/** "A, B e C": quem sente a mudança, dito numa frase. */
export function listaDeNomes<T>(itens: T[], e: T): T[] {
  if (itens.length <= 1) return itens
  const out: T[] = []
  itens.forEach((it, i) => {
    if (i > 0) out.push(i === itens.length - 1 ? e : (", " as T))
    out.push(it)
  })
  return out
}
