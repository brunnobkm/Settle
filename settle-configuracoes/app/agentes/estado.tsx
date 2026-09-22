// Estado de Agentes, Variáveis e Aprovações dentro de Configurações: a configuração
// (variáveis, regras, agentes), a fila de aprovações e a janela de configuração. A
// confirmação e a Auditoria são as de Configurações.

import { createContext, useCallback, useContext, useLayoutEffect, useRef, useState, type ReactNode } from "react"
import { toast } from "sonner"

import { useConfig } from "../estado"
import {
  APROVACOES_INICIAIS,
  GATILHOS,
  type Agenda,
  type Agente,
  type Aprovacao,
  type ModoAprovacao,
  type Momento,
  type Onde,
  type Regra,
  type Repeticao,
  type TipoVar,
  type Variavel,
} from "./dados"
import { acaoTxt, configInicial, semVariaveis, textoLegivel, usosDaVar, type Config } from "./regras"

/** Rascunho do agente em criação. */
export type Rascunho = {
  formato: "texto" | "score"
  nome: string
  texto: string
  linhas: { k: string; cond: string; pontos: number }[]
  gatilho: Momento | ""
  repete: Repeticao
  onde: Onde | ""
  agenda: Agenda
  aprovacao: ModoAprovacao | ""
}

/** As telas da janela de configuração. Uma pode levar a outra, com caminho de volta. */
export type Tela =
  | { tipo: "modelos" }
  | { tipo: "novo"; rascunho: Rascunho }
  | { tipo: "agente"; id: string }
  | { tipo: "editar"; id: string }
  | { tipo: "variavel"; k: string | null; inicial?: DadosDaVariavel }
  /* Criar conversando: perguntas uma de cada vez, com o resultado montado ao lado. */
  | { tipo: "conversa-agente"; varInicial?: string }
  | { tipo: "conversa-variavel" }

export type DadosDaVariavel = {
  nome: string
  tipo: TipoVar
  prompt: string
  fontes: string[]
  resto: boolean
  padrao: string
}

/*
  Os erros de preenchimento, campo a campo. No teste, a Graziela deixou Instruções em
  branco duas vezes e os botões pareceram não fazer nada: o aviso era um toast no canto e
  o campo vermelho estava fora da tela. O erro agora mora embaixo do próprio campo, e a
  janela rola até o primeiro.
*/
export type Erros = Partial<Record<"nome" | "texto" | "onde" | "gatilho" | "aprovacao" | "linhas" | "prompt" | "fontes" | "padrao", string>>

let sequencia = 0
const novoId = () => ++sequencia

const RISCO_EXCLUIDA = "A variável que alimentava esta regra foi excluída, então ela não roda mais."

function useAgentesInterno() {
  const { confirmar, auditar, desauditar } = useConfig()
  const [cfg, setCfg] = useState<Config>(configInicial)
  const [aprovacoes, setAprovacoes] = useState<Aprovacao[]>(APROVACOES_INICIAIS)
  const [modal, setModal] = useState<{ tela: Tela; pilha: Tela[] } | null>(null)

  // o que as ações leem: sempre o estado mais novo, mesmo chamadas de um toast antigo
  const atual = useRef({ cfg, aprovacoes })
  useLayoutEffect(() => {
    atual.current = { cfg, aprovacoes }
  })

  /* ---------------- janela de configuração ---------------- */

  const abrirModal = useCallback((tela: Tela) => setModal({ tela, pilha: [] }), [])
  const irParaTela = useCallback((tela: Tela) => setModal((m) => (m ? { ...m, tela } : { tela, pilha: [] })), [])
  const abrirComVolta = useCallback(
    (tela: Tela) => setModal((m) => (m ? { tela, pilha: [...m.pilha, m.tela] } : { tela, pilha: [] })),
    []
  )
  const voltarModal = useCallback(
    () => setModal((m) => (m && m.pilha.length ? { tela: m.pilha[m.pilha.length - 1], pilha: m.pilha.slice(0, -1) } : m)),
    []
  )
  const fecharModal = useCallback(() => setModal(null), [])

  /* ---------------- agentes ---------------- */

  const alterarAgente = useCallback((id: string, patch: Partial<Agente>) => {
    setCfg((c) => ({ ...c, agentes: c.agentes.map((a) => (a.id === id ? { ...a, ...patch } : a)) }))
  }, [])

  /** Executar pelo agente roda em todas as licitações. */
  const executarEmTodas = useCallback(
    (id: string) => {
      const an = atual.current.cfg.agentes.find((a) => a.id === id)
      if (!an) return
      setCfg((c) => ({
        ...c,
        agentes: c.agentes.map((a) =>
          a.id === id
            ? { ...a, execs: [{ quando: "agora", lic: "Todas as licitações", o: "Execução manual, disparada por você", st: "ok" as const }, ...a.execs] }
            : a
        ),
      }))
      auditar("Agentes", `Executou "${an.nome}" em todas as licitações`)
      toast(`Executando ${an.nome} em todas as licitações`)
    },
    [auditar]
  )

  const excluirAgentes = useCallback(
    (ids: string[], aoConfirmar?: () => void) => {
      const sel = atual.current.cfg.agentes.filter((a) => ids.includes(a.id))
      if (!sel.length) return
      const um = sel.length === 1
      confirmar({
        titulo: um ? `Excluir "${sel[0].nome}"?` : `Excluir ${sel.length} agentes?`,
        corpo: (
          <>
            <p>
              {um ? "O agente para" : "Eles param"} de rodar nas próximas licitações. O que já apareceu nas licitações
              continua lá, e as variáveis {um ? "que ele usa" : "que eles usam"} continuam existindo.
            </p>
            <p>Se for só uma pausa, desligue o agente em vez de excluir.</p>
            {!um && (
              <ul className="mt-1 text-[13px] leading-5 text-foreground">
                {sel.map((a) => (
                  <li key={a.id}>· {a.nome}</li>
                ))}
              </ul>
            )}
          </>
        ),
        acao: um ? "Excluir agente" : "Excluir agentes",
        perigo: true,
        ok: () => {
          const antes = atual.current.cfg.agentes
          setCfg((c) => ({ ...c, agentes: c.agentes.filter((a) => !ids.includes(a.id)) }))
          sel.forEach((a) => auditar("Agentes", `Excluiu "${a.nome}"`))
          aoConfirmar?.()
          toast(um ? "Agente excluído" : `${sel.length} agentes excluídos`, {
            action: {
              label: "Desfazer",
              onClick: () =>
                setCfg((c) => {
                  const agentes = [...c.agentes]
                  antes.forEach((a, i) => {
                    if (ids.includes(a.id) && !agentes.some((x) => x.id === a.id)) agentes.splice(i, 0, a)
                  })
                  return { ...c, agentes }
                }),
            },
          })
        },
      })
    },
    [auditar, confirmar]
  )

  /** Os campos que a criação e a edição exigem. */
  const validarAgente = useCallback((r: Pick<Rascunho, "formato" | "texto" | "onde" | "gatilho" | "aprovacao" | "linhas">): Erros => {
    const e: Erros = {}
    if (r.formato === "score") {
      if (!r.linhas.some((l) => l.k && l.cond)) e.linhas = "Preencha pelo menos um critério: a variável, quando conta e quantos pontos vale."
    } else if (!r.texto.trim()) {
      e.texto = "Escreva o que o agente deve fazer. Ex.: avise quando o edital exigir atestado e diga quantos."
    } else if (!semVariaveis(r.texto)) {
      /* No teste, duas pessoas puseram só a variável: o agente recebia a resposta e não sabia o que fazer com ela. */
      e.texto = "Diga o que o agente deve fazer com essa resposta. Ex.: avise quando for sim."
    }
    if (r.formato === "texto" && !r.onde) e.onde = "Escolha onde o resultado aparece."
    if (!r.gatilho) e.gatilho = "Escolha quando o agente trabalha."
    if (!r.aprovacao) e.aprovacao = "Escolha se as ações do agente precisam de aprovação."
    return e
  }, [])

  /* Um agente novo é uma análise nova, não uma regra dentro do Score. Devolve os erros, ou null quando criou. */
  const criarAgente = useCallback(
    (r: Rascunho): Erros | null => {
      const erros = validarAgente(r)
      if (Object.keys(erros).length) return erros
      const c = atual.current.cfg
      const id = `nv${c.agentes.length}-${novoId()}`
      const gatilho = GATILHOS[r.gatilho as Momento]
      let an: Agente
      let regras: Regra[] = []
      if (r.formato === "score") {
        const linhas = r.linhas.filter((l) => l.k && l.cond)
        regras = linhas.map((l, i) => ({
          id: `sc${id}-${i}`, nome: c.vars[l.k].nome, destino: "score", instr: `${c.vars[l.k].nome}: ${l.cond}`,
          vars: [l.k], pontos: +l.pontos || 0, custo: c.vars[l.k].custo || 0.02, regraTexto: l.cond, analise: id,
        }))
        an = {
          id, nome: r.nome.trim() || "Score sem nome", formato: "estruturado", destino: "score", propria: true, onde: "score",
          desc: `${linhas.length} critérios, ${linhas.reduce((t, l) => t + (+l.pontos || 0), 0)} pontos no total`,
          gatilho, repete: r.repete, agenda: r.agenda, aprovacao: r.aprovacao as ModoAprovacao, execs: [], ativo: true,
          texto: regras.map((x) => `${x.nome}: ${x.regraTexto} Use {{${x.vars[0]}}}.`).join("\n"),
        }
      } else {
        const texto = r.texto.trim()
        const legivel = textoLegivel(texto, c.vars)
        an = {
          id, nome: r.nome.trim() || "Agente sem nome", formato: "texto", onde: r.onde as Onde,
          desc: legivel.length > 90 ? `${legivel.slice(0, 88)}…` : legivel,
          gatilho, repete: r.repete, agenda: r.agenda, aprovacao: r.aprovacao as ModoAprovacao, execs: [], ativo: true, texto,
        }
      }
      setCfg((x) => ({ ...x, regras: [...x.regras, ...regras], agentes: [...x.agentes, an] }))
      setModal({ tela: { tipo: "agente", id }, pilha: [] })
      auditar("Agentes", `Criou "${an.nome}"`)
      toast("Agente criado e ativo")
      return null
    },
    [auditar, validarAgente]
  )

  /* ---------------- variáveis ---------------- */

  /* Excluir mostra o estrago antes, e o que fica parado depois. */
  const excluirVars = useCallback(
    (ks: string[], aoConfirmar?: () => void) => {
      const c0 = atual.current.cfg
      const podem = ks.filter((k) => c0.vars[k] && !c0.vars[k].settle)
      const daSettle = ks.filter((k) => c0.vars[k]?.settle)
      if (!podem.length) {
        toast("Variáveis da Settle não podem ser excluídas")
        return
      }
      const usos = podem.flatMap((k) => usosDaVar(k, c0))
      const agentes = [...new Set(usos.map((u) => u.agente))]
      const um = podem.length === 1
      confirmar({
        titulo: um ? `Excluir "${c0.vars[podem[0]].nome}"?` : `Excluir ${podem.length} variáveis?`,
        corpo: agentes.length ? (
          <>
            <p>
              <b className="font-semibold text-foreground">
                {agentes.length} {agentes.length === 1 ? "agente para" : "agentes param"} de rodar
              </b>{" "}
              até alguém revisar a instrução:
            </p>
            <ul className="mt-1 text-[13px] leading-5 text-foreground">
              {agentes.map((a) => (
                <li key={a}>· {a}</li>
              ))}
            </ul>
            {daSettle.length > 0 && <p>{daSettle.length} da Settle ficam de fora: elas não podem ser excluídas.</p>}
          </>
        ) : (
          <p>Nenhum agente usa {um ? "esta variável" : "estas variáveis"}. Excluir não para nada.</p>
        ),
        acao: um ? "Excluir variável" : "Excluir variáveis",
        perigo: true,
        ok: () => {
          const c = atual.current.cfg
          const antes = Object.fromEntries(podem.map((k) => [k, c.vars[k]]))
          const regrasAntes = c.regras
          const tecAntes = c.tecVars
          setCfg((x) => {
            const vars = { ...x.vars }
            const varsEx = { ...x.varsEx }
            podem.forEach((k) => {
              varsEx[k] = vars[k].nome
              delete vars[k]
            })
            return {
              ...x,
              vars,
              varsEx,
              regras: x.regras.map((r) => {
                const perdidas = r.vars.filter((k) => podem.includes(k))
                return perdidas.length
                  ? { ...r, vars: r.vars.filter((k) => !podem.includes(k)), estado: "warn", risco: RISCO_EXCLUIDA, perdeu: [...(r.perdeu ?? []), ...perdidas] }
                  : r
              }),
              tecVars: x.tecVars.filter((k) => !podem.includes(k)),
            }
          })
          podem.forEach((k) => auditar("Variáveis", `Excluiu "${antes[k].nome}"`))
          aoConfirmar?.()
          toast(`${um ? "Variável excluída" : `${podem.length} variáveis excluídas`}${agentes.length ? ` · ${agentes.length} ${agentes.length === 1 ? "agente parou" : "agentes pararam"}` : ""}`, {
            action: {
              label: "Desfazer",
              onClick: () =>
                setCfg((x) => {
                  const varsEx = { ...x.varsEx }
                  podem.forEach((k) => delete varsEx[k])
                  return { ...x, vars: { ...x.vars, ...antes }, varsEx, regras: regrasAntes, tecVars: tecAntes }
                }),
            },
          })
        },
      })
    },
    [auditar, confirmar]
  )

  const validarVar = useCallback((d: DadosDaVariavel): Erros => {
    const e: Erros = {}
    if (!d.nome.trim()) e.nome = "Dê um nome à variável. Ex.: Atestado exigido."
    if (!d.prompt.trim()) e.prompt = "Diga o que procurar no edital. Ex.: diga se o edital exige atestado de capacidade técnica."
    /* Procurar "nos outros arquivos" sozinho não basta: sem um documento marcado, a
       Settle não sabe por onde começar. */
    if (!d.fontes.length) e.fontes = "Marque pelo menos um documento para a Settle procurar."
    /* Sem resposta padrão, o agente fica sem saber o que dizer quando o edital não fala do assunto. */
    if (!d.padrao.trim()) e.padrao = "Diga o que responder quando o edital não falar disso. Ex.: não, ou não encontrado."
    return e
  }, [])

  /** Serve para criar (k null) e para editar. Devolve os erros, ou null quando salvou. */
  const salvarVar = useCallback(
    (k: string | null, d: DadosDaVariavel): Erros | null => {
      const erros = validarVar(d)
      if (Object.keys(erros).length) return erros
      const c = atual.current.cfg
      const novo = !k
      const chave = k ?? `nv${Object.keys(c.vars).length}-${novoId()}`
      const antes = novo ? null : c.vars[chave]
      const nome = d.nome.trim()
      const prompt = d.prompt.trim()
      const padrao = d.padrao.trim()
      const mudou =
        !!antes &&
        (antes.nome !== nome || antes.tipo !== d.tipo || antes.prompt !== prompt || (antes.padrao || "") !== padrao ||
          antes.fontes.join(">") + antes.resto !== d.fontes.join(">") + d.resto)
      const v: Variavel = {
        nome, desc: antes?.desc ?? "", tipo: d.tipo, prompt, fontes: d.fontes, resto: d.resto, padrao,
        alterada: novo ? false : mudou || !!antes?.alterada,
        v: antes?.v ?? "v1", custo: antes?.custo ?? 0.02,
      }
      setCfg((x) => ({ ...x, vars: { ...x.vars, [chave]: v } }))
      auditar("Variáveis", novo ? `Criou "${nome}"` : `Alterou "${nome}"`)
      const u = usosDaVar(chave, c)
      toast(novo ? "Variável criada. Use-a nas instruções de um agente." : `Variável atualizada${u.length ? ` · ${u.length} uso(s) passam a seguir a nova definição` : ""}`, {
        action: {
          label: "Desfazer",
          onClick: () =>
            setCfg((x) => {
              const vars = { ...x.vars }
              if (antes) vars[chave] = antes
              else delete vars[chave]
              return { ...x, vars }
            }),
        },
      })
      return null
    },
    [auditar, validarVar]
  )

  /** Cria a variável e devolve a chave dela, para quem precisa usá-la na sequência. */
  const criarVar = useCallback(
    (d: DadosDaVariavel): { k: string } | { erros: Erros } => {
      const erros = validarVar(d)
      if (Object.keys(erros).length) return { erros }
      const c = atual.current.cfg
      const k = `nv${Object.keys(c.vars).length}-${novoId()}`
      const v: Variavel = {
        nome: d.nome.trim(), desc: "", tipo: d.tipo, prompt: d.prompt.trim(), fontes: d.fontes, resto: d.resto,
        padrao: d.padrao.trim(), v: "v1", custo: 0.02,
      }
      setCfg((x) => ({ ...x, vars: { ...x.vars, [k]: v } }))
      auditar("Variáveis", `Criou "${v.nome}"`)
      toast("Variável criada. Use-a nas instruções de um agente.")
      return { k }
    },
    [auditar, validarVar]
  )

  /** Criação a partir da escrita: os campos obrigatórios, em versão curta. Devolve a chave. */
  const criarVarRapida = useCallback(
    (d: { nome: string; tipo: TipoVar; prompt: string; fonte: string }) => {
      const nome = d.nome.trim()
      const prompt = d.prompt.trim()
      if (!nome || !prompt) return null
      const k = `nv${Object.keys(atual.current.cfg.vars).length}-${novoId()}`
      const v: Variavel = { nome, desc: "", tipo: d.tipo, prompt, fontes: [d.fonte], resto: true, padrao: "", v: "v1", custo: 0.02 }
      setCfg((x) => ({ ...x, vars: { ...x.vars, [k]: v } }))
      auditar("Variáveis", `Criou "${nome}"`)
      toast("Variável criada. Ela também fica em Variáveis, para outros agentes.")
      return k
    },
    [auditar]
  )

  /** "Ver mudanças" dá a mudança por vista: quem voltar encontra o chip normal. */
  const marcarVarVista = useCallback((k: string) => {
    setCfg((x) => (x.vars[k] ? { ...x, vars: { ...x.vars, [k]: { ...x.vars[k], alterada: false } } } : x))
  }, [])

  /* ---------------- aprovações ---------------- */

  const responderAprovacoes = useCallback(
    (ids: string[], aprovou: boolean, aoFeito?: () => void, aoDesfazer?: () => void) => {
      if (!ids.length) return
      const antes = atual.current.aprovacoes
      const decididas = antes.filter((a) => ids.includes(a.id))
      setAprovacoes(antes.filter((a) => !ids.includes(a.id)))
      aoFeito?.()
      // Um registro por decisão, não um resumo: auditoria serve para responder "quem aprovou
      // isto, nesta licitação, e quando". Ver REGRAS.md, seção 6 (histórico das aprovações).
      decididas.forEach((a) => {
        const nome = atual.current.cfg.agentes.find((x) => x.id === a.agente)?.nome ?? "agente excluído"
        auditar(
          "Aprovações",
          `${aprovou ? "Aprovou" : "Recusou"} ${acaoTxt(a)}, pedido do agente "${nome}" em ${a.lic} (${a.org})`
        )
      })
      toast(aprovou ? `${ids.length === 1 ? "Ação aprovada e executada" : `${ids.length} ações aprovadas e executadas`}` : `${ids.length === 1 ? "Ação recusada" : `${ids.length} ações recusadas`}`, {
        action: {
          label: "Desfazer",
          onClick: () => {
            setAprovacoes(antes)
            desauditar(decididas.length)
            aoDesfazer?.()
          },
        },
      })
    },
    [auditar, desauditar]
  )

  return {
    cfg, aprovacoes, modal,
    abrirModal, irParaTela, abrirComVolta, voltarModal, fecharModal,
    alterarAgente, executarEmTodas, excluirAgentes, validarAgente, criarAgente,
    excluirVars, salvarVar, criarVar, criarVarRapida, marcarVarVista, responderAprovacoes,
  }
}

export type Agentes = ReturnType<typeof useAgentesInterno>

const Contexto = createContext<Agentes | null>(null)

export function AgentesProvider({ children }: { children: ReactNode }) {
  const valor = useAgentesInterno()
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

export function useAgentes() {
  const valor = useContext(Contexto)
  if (!valor) throw new Error("useAgentes fora do AgentesProvider")
  return valor
}
