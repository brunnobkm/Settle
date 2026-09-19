// Regras do protótipo sem interface: quem usa cada variável, como o texto da
// instrução vira leitura, como o momento vira frase. Tudo puro, a partir do estado.

import {
  AGENDA_PADRAO,
  AGENTE_TEC,
  AGENTES_SEM_TEXTO,
  DIAS,
  GATILHOS,
  OUTROS_ARQUIVOS,
  REGRAS_INICIAIS,
  VARS_INICIAIS,
  type Agenda,
  type Agente,
  type Momento,
  type Regra,
  type Variavel,
} from "./dados"

/** O que o protótipo configura: variáveis, regras e agentes. É o que o desfazer restaura. */
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

export const fonteTxt = (v: Pick<Variavel, "fontes" | "resto">) => fontesDe(v).join(" > ")

/** As variáveis citadas num texto, na ordem, sem repetir. */
export function varsDoTexto(t: string) {
  const ks: string[] = []
  for (const m of (t || "").matchAll(/\{\{(\w+)\}\}/g)) if (!ks.includes(m[1])) ks.push(m[1])
  return ks
}

/** Fora do campo de edição, a variável aparece pelo nome, não pela chave. */
export function textoLegivel(t: string, vars: Record<string, Variavel>) {
  return (t || "").replace(/\{\{(\w+)\}\}/g, (m, k: string) => vars[k]?.nome ?? m)
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

/** De quem é o resultado de uma regra: "Resumo" é o nome antigo do Checklist. */
const agenteDaRegra = (r: Regra) => (r.destino === "checklist" ? "checklist" : "score")

/** Quem quebra se esta variável mudar ou sumir: é o que a pessoa precisa saber antes de mexer. */
export function usosDaVar(k: string, cfg: Config) {
  const u: { agente: string; regra: string }[] = []
  cfg.regras
    .filter((r) => r.vars.includes(k))
    .forEach((r) => {
      const an = cfg.agentes.find((x) => x.id === agenteDaRegra(r))
      u.push({ agente: an ? an.nome : "Score", regra: r.nome })
    })
  if (cfg.tecVars.includes(k)) u.push({ agente: "Análise técnica", regra: "Conformidade técnica do item" })
  /* Agentes de instrução em texto guardam a variável no próprio texto. Sem eles, a
     confirmação de exclusão contava menos agentes do que os que depois ficam marcados
     como precisando de atenção. A jurídica vem primeiro, como sempre veio. */
  const deTexto = cfg.agentes.filter((an) => an.formato === "texto")
  const ordenados = [...deTexto.filter((an) => an.id === "juridica"), ...deTexto.filter((an) => an.id !== "juridica")]
  ordenados
    .filter((an) => varsDoTexto(an.texto).includes(k))
    .forEach((an) => u.push({ agente: an.nome, regra: "instrução em texto" }))
  return u
}

/** Quantos agentes dependem dela, não quantas regras: a mesma análise pode usar a variável duas vezes. */
export function agentesDaVar(k: string, cfg: Config) {
  const nomes: string[] = []
  usosDaVar(k, cfg).forEach((u) => {
    if (!nomes.includes(u.agente)) nomes.push(u.agente)
  })
  return nomes
}

/* Agentes afetados por uma variável excluída: a exclusão continua livre, mas quem usava a
   variável aparece como pendente, na lista e dentro do agente, até alguém revisar. */
export function varsQuebradas(an: Agente, cfg: Config) {
  return varsDoTexto(an.texto).filter((k) => cfg.varsEx[k] && !cfg.vars[k])
}

export function dicaQuebra(q: string[], varsEx: Record<string, string>) {
  const nomes = q.map((k) => `“${varsEx[k]}”`).join(", ")
  return (
    (q.length === 1 ? `A variável ${nomes} foi excluída` : `As variáveis ${nomes} foram excluídas`) +
    " e a instrução não tem mais como preencher esse dado."
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

/*
  Na plataforma, a classificação quente, morno ou frio vem do backend: o front só a
  traduz em rótulo e cor. Os cortes abaixo são inferidos do que está em produção (87 e
  100 quentes, 65 e 52 mornos) e servem só para o protótipo.
*/
export const classificar = (n: number) => (n >= 70 ? "Quente" : n >= 40 ? "Morno" : "Frio")
export const tomDoScore = (n: number) => (n >= 70 ? "quente" : n >= 40 ? "morno" : "frio")

export const moeda = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`
