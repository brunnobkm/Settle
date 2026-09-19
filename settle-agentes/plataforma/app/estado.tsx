// Estado do protótipo: configuração (variáveis, regras, agentes), a simulação das
// licitações (o que cada funcionalidade mostra e o que está em preparação), a Settle
// AI, a janela de configuração e a confirmação. Um só lugar, porque quase toda ação
// atravessa telas: excluir uma variável marca agentes, enviar para análise mexe no
// card, na licitação e no card de acompanhamento.

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react"
import { CircleCheckIcon } from "lucide-react"
import { toast } from "sonner"

import {
  APROVACOES_INICIAIS,
  CONEXOES_INICIAIS,
  FONTES_IA_INICIAIS,
  FUNCS,
  GATILHOS,
  LICITACOES_INICIAIS,
  MOMENTO_PADRAO,
  PREP_TEMPO,
  RESPOSTA_A_DEFINIR,
  type Agenda,
  type Agente,
  type Aprovacao,
  type ChaveFn,
  type Contexto,
  type EstadoFn,
  type Execucao,
  type Licitacao,
  type ModoAprovacao,
  type Momento,
  type Regra,
  type TipoVar,
  type Variavel,
} from "./dados"
import { configInicial, momentoDe, regrasDa, textoLegivel, usosDaVar, type Config } from "./regras"

/* ------------------------------------------------------------------ */
/* Tipos                                                               */
/* ------------------------------------------------------------------ */

export type Area = "agentes" | "lics" | "workspace"
export type Aba = "agentes" | "variaveis" | "aprovacoes"
export type AbaWk = "itens" | "tecnica" | "habil" | "manif"

/** Rascunho do agente em criação. */
export type Rascunho = {
  formato: "texto" | "score"
  nome: string
  texto: string
  linhas: { k: string; cond: string; pontos: number }[]
  gatilho: Momento | ""
  repete: "primeira" | "sempre"
  onde: string
  agenda: Agenda
  aprovacao: ModoAprovacao
}

/** As telas da janela de configuração. Uma pode levar a outra, com caminho de volta. */
export type Tela =
  | { tipo: "modelos" }
  | { tipo: "novo"; rascunho: Rascunho }
  | { tipo: "agente"; id: string }
  | { tipo: "editar"; id: string }
  | { tipo: "variavel"; k: string | null }

export type Confirmacao = { titulo: string; corpo: ReactNode; rotulo: string; faz: () => void }

export type ModoChat = "lateral" | "flutuante" | "cheio"
export type AcaoDeOpcao = "executar" | "produziu" | "mudar" | "onde"
export type ItemChat =
  | { id: number; tipo: "msg"; quem: "bot" | "me"; conteudo: ReactNode }
  | { id: number; tipo: "opcoes"; ops: { t: string; acao: AcaoDeOpcao }[] }

export type Chat = {
  aberto: boolean
  modo: ModoChat
  /** Agente com quem a conversa está; null é a conversa comum com a Settle AI. */
  agenteId: string | null
  visao: "conversa" | "lista"
  /** Linha de contexto acima da conversa com um agente. */
  sub: string | null
  itens: ItemChat[]
  contextos: Contexto[]
  /** Troca quando outra janela abre por cima: o chat volta para a frente. */
  camada: number
}

export type DadosDaVariavel = {
  nome: string
  tipo: TipoVar
  prompt: string
  fontes: string[]
  resto: boolean
  padrao: string
}

const ESTADOS_NO_CARD: EstadoFn[] = ["preparando", "pronto", "falhou"]
const CHAVES_FN = Object.keys(FUNCS) as ChaveFn[]

export const momentoDaFn = (lic: Licitacao, k: ChaveFn): Momento => lic.mom?.[k] ?? MOMENTO_PADRAO[k]

let sequencia = 0
const novoId = () => ++sequencia

function paginaInicial(): Area {
  const ir = new URLSearchParams(window.location.search).get("ir")
  return ir === "agentes" ? "agentes" : "lics"
}

/* ------------------------------------------------------------------ */
/* Store                                                               */
/* ------------------------------------------------------------------ */

function useSimuladorInterno() {
  const [cfg, setCfg] = useState<Config>(configInicial)
  const [aprovacoes, setAprovacoes] = useState<Aprovacao[]>(APROVACOES_INICIAIS)
  const [area, setArea] = useState<Area>(paginaInicial)
  const [aba, setAba] = useState<Aba>("agentes")
  const [lics, setLics] = useState<Licitacao[]>(() => structuredClone(LICITACOES_INICIAIS))
  const [aberta, setAberta] = useState<number | null>(null)
  const [abaWk, setAbaWk] = useState<AbaWk>("manif")
  const [prepItens, setPrepItens] = useState<ChaveFn[]>([])
  const [painel, setPainel] = useState<{ k: "score" | "checklist"; lado: boolean } | null>(null)
  const [modal, setModal] = useState<{ tela: Tela; pilha: Tela[] } | null>(null)
  const [confirmacao, setConfirmacao] = useState<Confirmacao | null>(null)
  const [ordemWidgets, setOrdemWidgets] = useState<string[]>(["habil", "certidoes"])
  /* O que a Settle AI guarda entre uma abertura e outra: as fontes marcadas e o texto
     que a pessoa estava escrevendo. */
  const [fontesIA, setFontesIA] = useState(FONTES_IA_INICIAIS)
  const [conexoes, setConexoes] = useState(CONEXOES_INICIAIS)
  const [rascunhoChat, setRascunhoChat] = useState("")
  const [chat, setChat] = useState<Chat>({
    aberto: false, modo: "flutuante", agenteId: null, visao: "conversa", sub: null,
    itens: [], contextos: [], camada: 0,
  })

  // o que as ações leem: sempre o estado mais novo, mesmo chamadas de um toast antigo
  const atual = useRef({ cfg, lics, aberta, area, aba, chat, aprovacoes })
  useLayoutEffect(() => {
    atual.current = { cfg, lics, aberta, area, aba, chat, aprovacoes }
  })

  const licFoco = lics[aberta ?? 0]

  /* ---------------- página atual (contexto do chat) ---------------- */

  const NOME_ABA: Record<Aba, string> = { agentes: "Agentes", variaveis: "Variáveis", aprovacoes: "Aprovações" }
  const pagina: Contexto =
    area === "workspace"
      ? { id: "lic", nome: `PE ${lics[aberta ?? 0].n}`, tipo: "licitacao", auto: true }
      : area === "lics"
        ? { id: "lics", nome: "Licitações", tipo: "pagina", auto: true }
        : { id: "agentes", nome: NOME_ABA[aba], tipo: "pagina", auto: true }

  /* Mudar de tela com o chat aberto muda o contexto: senão a pergunta vai para a
     página anterior sem a pessoa perceber. */
  useEffect(() => {
    if (!chat.aberto) return
    setChat((c) => {
      const i = c.contextos.findIndex((x) => x.auto)
      if (i >= 0 && c.contextos[i].id === pagina.id && c.contextos[i].nome === pagina.nome) return c
      const contextos = [...c.contextos]
      if (i >= 0) contextos.splice(i, 1, pagina)
      else contextos.unshift(pagina)
      return { ...c, contextos }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat.aberto, pagina.id, pagina.nome])

  /* ---------------- card de acompanhamento ---------------- */

  /* Entrar numa licitação com resultado em preparação mostra o card: ele é a resposta
     para "por que este lugar está vazio", e precisa estar lá quando a pessoa chega.
     Sai da lista quem deixou de ter resultado a caminho. */
  useEffect(() => {
    const lic = lics[aberta ?? 0]
    setPrepItens((itens) => {
      const novo = itens.filter((k) => ESTADOS_NO_CARD.includes(lic.fx[k]))
      if (area === "workspace") {
        CHAVES_FN.forEach((k) => {
          if (lic.fx[k] === "preparando" && !novo.includes(k)) novo.push(k)
        })
      }
      return novo.length === itens.length && novo.every((k, i) => k === itens[i]) ? itens : novo
    })
  }, [area, aberta, lics])

  /* ---------------- navegação ---------------- */

  const fecharPainel = useCallback(() => setPainel(null), [])

  /* A sidebar alterna entre a configuração e a licitação. O painel pertence ao lugar
     onde foi aberto: levá-lo para a próxima tela é deixar para trás o contexto. */
  const irPara = useCallback((a: Area) => {
    setPainel(null)
    setArea(a)
  }, [])

  const abaAtiva = useCallback((a: Aba) => setAba(a), [])

  /** Cada resultado fica pronto no seu tempo, e aparece na hora, sem esperar os outros. */
  const correrPreparacao = useCallback((i: number, alvos: ChaveFn[]) => {
    if (!alvos.length) return
    setLics((ls) => ls.map((l, j) => (j === i ? { ...l, aPreparar: null } : l)))
    alvos.forEach((k) => {
      window.setTimeout(() => {
        setLics((ls) =>
          ls.map((l, j) => {
            if (j !== i || l.fx[k] !== "preparando") return l
            /* Uma licitação pode nascer com um agente que não entrega: o item só
               acerta quando a pessoa tenta de novo. */
            const falha = !!l.falhar?.includes(k)
            return {
              ...l,
              fx: { ...l.fx, [k]: falha ? "falhou" : "pronto" },
              falhar: falha ? l.falhar?.filter((x) => x !== k) : l.falhar,
            }
          })
        )
      }, PREP_TEMPO[k] ?? 4000)
    })
  }, [])

  /* Abrir uma licitação leva o cabeçalho junto: a trilha e o card do topo passam a
     ser os dela. Os relógios da preparação começam quando a pessoa entra. */
  const abrirLicitacao = useCallback(
    (i: number) => {
      const lic = atual.current.lics[i]
      setAberta(i)
      toast.dismiss("aviso-envio")
      irPara("workspace")
      correrPreparacao(i, lic.aPreparar ?? [])
    },
    [correrPreparacao, irPara]
  )

  /* Enviar para análise tira a licitação de Recomendadas, como na plataforma. Enviado
     de dentro da licitação, o lugar não muda: quem está lá vê a preparação começar. O
     aviso é para quem enviou da lista, onde a licitação acabou de sumir. */
  const enviarParaAnalise = useCallback(
    (i: number, deDentro: boolean) => {
      const lic = atual.current.lics[i]
      const alvos = CHAVES_FN.filter((k) => momentoDaFn(lic, k) === "analise" && lic.fx[k] === "aguardando")
      setAberta(i)
      setLics((ls) =>
        ls.map((l, j) => {
          if (j !== i) return l
          const fx = { ...l.fx }
          alvos.forEach((k) => (fx[k] = "preparando"))
          return { ...l, fx, enviada: true, aPreparar: deDentro ? null : alvos }
        })
      )
      setPrepItens([])
      if (deDentro) {
        correrPreparacao(i, alvos)
        return
      }
      toast("Licitação enviada para a área Em andamento.", {
        id: "aviso-envio",
        /* preso na base até a pessoa dispensar: é o único caminho para a licitação que
           acabou de sair da lista */
        position: "bottom-center",
        duration: Number.POSITIVE_INFINITY,
        closeButton: true,
        icon: <CircleCheckIcon className="size-4 text-primary" />,
        action: { label: "Abrir licitação", onClick: () => abrirLicitacao(i) },
      })
    },
    [abrirLicitacao, correrPreparacao]
  )

  const mudarEstadoFn = useCallback((i: number, k: ChaveFn, estado: EstadoFn) => {
    setLics((ls) => ls.map((l, j) => (j === i ? { ...l, fx: { ...l.fx, [k]: estado } } : l)))
  }, [])

  /* Onde cada funcionalidade aparece: Score e Checklist num painel lateral, Análise
     técnica e Habilitação na aba delas. Pela lista, o painel empurra a tela: o card
     que abriu continua à vista. */
  const abrirFuncionalidade = useCallback((k: ChaveFn) => {
    if (k === "score" || k === "checklist") {
      const pelaLista = atual.current.area === "lics"
      if (pelaLista && atual.current.chat.modo === "lateral") setChat((c) => ({ ...c, aberto: false }))
      setPainel({ k, lado: pelaLista })
      return
    }
    setPainel(null)
    setArea("workspace")
    setAbaWk(k === "tecnica" ? "tecnica" : "habil")
  }, [])

  /** Tentar de novo tem duas portas (o card e o vazio da funcionalidade): as duas fazem o mesmo. */
  const tentarDeNovo = useCallback(
    (k: ChaveFn) => {
      const i = atual.current.aberta ?? 0
      mudarEstadoFn(i, k, "preparando")
      correrPreparacao(i, [k])
    },
    [correrPreparacao, mudarEstadoFn]
  )

  const fecharPrep = useCallback(() => setPrepItens([]), [])

  /* ---------------- janela de configuração ---------------- */

  const abrirModal = useCallback((tela: Tela) => setModal({ tela, pilha: [] }), [])

  /* A conversa aberta fica por cima do que abrir depois dela (a configuração, o painel
     do resultado): ler a execução e ver a instrução ao lado é o ponto. Chamado depois
     que a outra janela já está na tela. */
  const trazerChatParaFrente = useCallback(() => setChat((c) => (c.aberto ? { ...c, camada: c.camada + 1 } : c)), [])
  const irParaTela = useCallback((tela: Tela) => setModal((m) => (m ? { ...m, tela } : { tela, pilha: [] })), [])
  /* Uma janela pode levar a outra: o caminho de volta fica no cabeçalho, e some quando fecha. */
  const abrirComVolta = useCallback(
    (tela: Tela) => setModal((m) => (m ? { tela, pilha: [...m.pilha, m.tela] } : { tela, pilha: [] })),
    []
  )
  const voltarModal = useCallback(
    () => setModal((m) => (m && m.pilha.length ? { tela: m.pilha[m.pilha.length - 1], pilha: m.pilha.slice(0, -1) } : m)),
    []
  )
  const fecharModal = useCallback(() => setModal(null), [])

  const confirmar = useCallback((c: Confirmacao) => setConfirmacao(c), [])

  /* ---------------- agentes ---------------- */

  const alterarAgente = useCallback((id: string, patch: Partial<Agente>) => {
    setCfg((c) => ({ ...c, agentes: c.agentes.map((a) => (a.id === id ? { ...a, ...patch } : a)) }))
  }, [])

  /* Mudar o momento na configuração muda a frase de espera da funcionalidade que o
     agente alimenta, na licitação aberta. */
  const aplicarMomento = useCallback((agenteId: string, momento: Momento) => {
    const i = atual.current.aberta
    if (i === null) return
    const chaves = CHAVES_FN.filter((k) => FUNCS[k].agente === agenteId)
    if (!chaves.length) return
    setLics((ls) =>
      ls.map((l, j) => {
        if (j !== i) return l
        const mom = { ...l.mom }
        chaves.forEach((k) => (mom[k] = momento))
        return { ...l, mom }
      })
    )
  }, [])

  /** Executar pelo agente, no card ou na janela, roda em todas as licitações. */
  const executarEmTodas = useCallback((id: string) => {
    const an = atual.current.cfg.agentes.find((a) => a.id === id)
    if (!an) return
    const exec: Execucao = {
      quando: "agora", lic: "Todas as licitações",
      o: "Execução manual em todas as licitações, disparada por você", st: "ok",
    }
    setCfg((c) => ({ ...c, agentes: c.agentes.map((a) => (a.id === id ? { ...a, execs: [exec, ...a.execs] } : a)) }))
    toast(`Executando ${an.nome} em todas as licitações`)
  }, [])

  const excluirAgente = useCallback(
    (id: string, aoConfirmar?: () => void) => {
      const an = atual.current.cfg.agentes.find((a) => a.id === id)
      if (!an) return
      confirmar({
        titulo: `Excluir "${an.nome}"?`,
        corpo: (
          <p>
            O agente para de rodar nas próximas licitações. As variáveis que ele usa continuam existindo, e podem ser
            usadas por outros agentes.
          </p>
        ),
        rotulo: "Excluir agente",
        faz: () => {
          const i = atual.current.cfg.agentes.findIndex((a) => a.id === id)
          setCfg((c) => ({ ...c, agentes: c.agentes.filter((a) => a.id !== id) }))
          aoConfirmar?.()
          toast("Agente excluído", {
            action: {
              label: "Desfazer",
              onClick: () =>
                setCfg((c) => {
                  const agentes = [...c.agentes]
                  agentes.splice(i, 0, an)
                  return { ...c, agentes }
                }),
            },
          })
        },
      })
    },
    [confirmar]
  )

  const excluirAgentes = useCallback(
    (ids: string[], aoConfirmar?: () => void) => {
      const sel = atual.current.cfg.agentes.filter((a) => ids.includes(a.id))
      if (!sel.length) return
      const um = sel.length === 1
      confirmar({
        titulo: `Excluir ${sel.length} ${um ? "agente" : "agentes"}?`,
        corpo: (
          <>
            <p>Eles param de rodar nas próximas licitações. As variáveis que usam continuam existindo.</p>
            <ul className="mt-2 text-[13px] leading-5 text-foreground">
              {sel.map((a) => (
                <li key={a.id}>· {a.nome}</li>
              ))}
            </ul>
          </>
        ),
        rotulo: `Excluir ${um ? "agente" : "agentes"}`,
        faz: () => {
          const antes = atual.current.cfg.agentes
          setCfg((c) => ({ ...c, agentes: c.agentes.filter((a) => !ids.includes(a.id)) }))
          aoConfirmar?.()
          toast(`${sel.length} ${um ? "agente excluído" : "agentes excluídos"}`, {
            action: {
              label: "Desfazer",
              onClick: () =>
                setCfg((c) => {
                  // devolve cada um à posição em que estava
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
    [confirmar]
  )

  /* Um agente novo é uma análise nova, não uma regra dentro do Score. */
  const criarAgenteTexto = useCallback(
    (r: Rascunho) => {
      const texto = r.texto.trim()
      if (!texto) { toast("Escreva as instruções do agente"); return }
      if (!r.onde) { toast("Escolha onde o resultado aparece"); return }
      if (!r.gatilho) { toast("Escolha quando o agente roda"); return }
      const legivel = textoLegivel(texto, atual.current.cfg.vars)
      const an: Agente = {
        id: `nv${atual.current.cfg.agentes.length}-${novoId()}`,
        nome: r.nome || "Agente sem nome",
        formato: "texto",
        desc: legivel.length > 90 ? `${legivel.slice(0, 88)}…` : legivel,
        gatilho: GATILHOS[r.gatilho],
        agenda: r.agenda,
        texto,
        aprovacao: r.aprovacao || "manual",
        execs: [],
        ativo: true,
      }
      setCfg((c) => ({ ...c, agentes: [...c.agentes, an] }))
      setAba("agentes")
      setModal({ tela: { tipo: "agente", id: an.id }, pilha: [] })
      toast("Agente criado")
    },
    []
  )

  /* O agente feito pelo modelo de Score nasce estruturado: cada linha vira uma regra, e
     a soma dos pontos é a nota. */
  const criarAgenteScore = useCallback((r: Rascunho) => {
    const { vars } = atual.current.cfg
    const linhas = r.linhas.filter((l) => l.k && l.cond)
    if (!linhas.length) { toast("Preencha pelo menos um critério"); return }
    if (!r.gatilho) { toast("Escolha quando o agente roda"); return }
    const id = `nv${atual.current.cfg.agentes.length}-${novoId()}`
    const regras: Regra[] = linhas.map((l, i) => ({
      id: `sc${id}-${i}`, nome: vars[l.k].nome, destino: "score", instr: `${vars[l.k].nome}: ${l.cond}`,
      vars: [l.k], pontos: +l.pontos || 0, custo: vars[l.k].custo || 0.02, regraTexto: l.cond, analise: id,
    }))
    const base = { id, destino: "score" as const, propria: true }
    const an: Agente = {
      ...base,
      nome: r.nome || "Score sem nome",
      formato: "estruturado",
      desc: `${linhas.length} critérios, ${linhas.reduce((t, l) => t + (+l.pontos || 0), 0)} pontos no total`,
      gatilho: GATILHOS[r.gatilho],
      agenda: r.agenda,
      aprovacao: r.aprovacao || "manual",
      execs: [],
      ativo: true,
      texto: regras
        .map((x) => `${x.nome}: ${x.regraTexto}${x.vars.length ? ` Use ${x.vars.map((k) => `{{${k}}}`).join(" e ")}.` : ""}`)
        .join("\n"),
    }
    setCfg((c) => ({ ...c, regras: [...c.regras, ...regras], agentes: [...c.agentes, an] }))
    setAba("agentes")
    setModal({ tela: { tipo: "agente", id }, pilha: [] })
    toast(`Score criado com ${linhas.length} critérios`)
  }, [])

  /* ---------------- variáveis ---------------- */

  /* Excluir mostra o estrago antes, e o que fica quebrado depois. */
  const excluirVar = useCallback(
    (k: string, daModal: boolean) => {
      const c0 = atual.current.cfg
      const v = c0.vars[k]
      if (!v) return
      const u = usosDaVar(k, c0)
      confirmar({
        titulo: `Excluir "${v.nome}"?`,
        corpo: u.length ? (
          <>
            <p>
              <b className="font-semibold text-foreground">{u.length} regra(s)</b> dependem desta variável e param de
              funcionar.
            </p>
            <ul className="mt-2 text-[13px] leading-5 text-foreground">
              {u.map((x, i) => (
                <li key={i}>
                  · <b className="font-semibold">{x.agente}</b> · {x.regra}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p>Nenhum agente usa esta variável. Excluir não quebra nada.</p>
        ),
        rotulo: "Excluir variável",
        faz: () => {
          /* Só fecha a configuração depois de confirmado: quem cancela volta para onde estava. */
          if (daModal) setModal(null)
          const c = atual.current.cfg
          const antes = c.vars[k]
          const afetadas = c.regras.filter((r) => r.vars.includes(k)).map((r) => ({ id: r.id, risco: r.risco, estado: r.estado }))
          const naTecnica = c.tecVars.includes(k)
          setCfg((x) => {
            const vars = { ...x.vars }
            delete vars[k]
            return {
              ...x,
              vars,
              varsEx: { ...x.varsEx, [k]: antes.nome },
              regras: x.regras.map((r) =>
                r.vars.includes(k)
                  ? { ...r, vars: r.vars.filter((y) => y !== k), estado: "warn", risco: "A variável que alimentava esta regra foi excluída, então ela não roda mais." }
                  : r
              ),
              tecVars: x.tecVars.filter((y) => y !== k),
            }
          })
          toast(`Variável excluída${afetadas.length ? ` · ${afetadas.length} regra(s) ficaram para reescrever` : ""}`, {
            action: {
              label: "Desfazer",
              onClick: () =>
                setCfg((x) => {
                  const varsEx = { ...x.varsEx }
                  delete varsEx[k]
                  return {
                    ...x,
                    vars: { ...x.vars, [k]: antes },
                    varsEx,
                    regras: x.regras.map((r) => {
                      const f = afetadas.find((a) => a.id === r.id)
                      return f ? { ...r, vars: [...r.vars, k], risco: f.risco, estado: f.estado } : r
                    }),
                    tecVars: naTecnica && !x.tecVars.includes(k) ? [...x.tecVars, k] : x.tecVars,
                  }
                }),
            },
          })
        },
      })
    },
    [confirmar]
  )

  /* Excluir em lote passa pela mesma confirmação, somando o estrago de todas. */
  const excluirVars = useCallback(
    (ks: string[], aoConfirmar?: () => void) => {
      const c0 = atual.current.cfg
      const sel = ks.filter((k) => c0.vars[k])
      if (!sel.length) return
      const daSettle = sel.filter((k) => c0.vars[k].settle)
      const podem = sel.filter((k) => !c0.vars[k].settle)
      if (!podem.length) { toast("Variáveis da Settle não podem ser excluídas"); return }
      const regras = podem.reduce((t, k) => t + usosDaVar(k, c0).length, 0)
      const um = podem.length === 1
      confirmar({
        titulo: `Excluir ${podem.length} ${um ? "variável?" : "variáveis?"}`,
        corpo: (
          <>
            <p>{podem.length} {um ? "variável será excluída." : "variáveis serão excluídas."}</p>
            {regras > 0 && (
              <p>
                <b className="font-semibold text-foreground">{regras} regra(s)</b> dependem delas e param de funcionar.
              </p>
            )}
            {daSettle.length > 0 && <p>{daSettle.length} da Settle ficam de fora: elas não podem ser excluídas.</p>}
            <ul className="mt-2 text-[13px] leading-5 text-foreground">
              {podem.map((k) => (
                <li key={k}>· {c0.vars[k].nome}</li>
              ))}
            </ul>
          </>
        ),
        rotulo: `Excluir ${um ? "variável" : "variáveis"}`,
        faz: () => {
          const c = atual.current.cfg
          const antes = Object.fromEntries(podem.map((k) => [k, c.vars[k]]))
          const afetadas = c.regras
            .filter((r) => r.vars.some((k) => podem.includes(k)))
            .map((r) => ({ id: r.id, vars: r.vars, risco: r.risco, estado: r.estado }))
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
              regras: x.regras.map((r) =>
                r.vars.some((k) => podem.includes(k))
                  ? { ...r, vars: r.vars.filter((k) => !podem.includes(k)), estado: "warn", risco: "A variável que alimentava esta regra foi excluída, então ela não roda mais." }
                  : r
              ),
              tecVars: x.tecVars.filter((k) => !podem.includes(k)),
            }
          })
          aoConfirmar?.()
          toast(`${podem.length} ${um ? "variável excluída" : "variáveis excluídas"}`, {
            action: {
              label: "Desfazer",
              onClick: () =>
                setCfg((x) => {
                  const varsEx = { ...x.varsEx }
                  podem.forEach((k) => delete varsEx[k])
                  return {
                    ...x,
                    vars: { ...x.vars, ...antes },
                    varsEx,
                    regras: x.regras.map((r) => {
                      const f = afetadas.find((a) => a.id === r.id)
                      return f ? { ...r, vars: f.vars, risco: f.risco, estado: f.estado } : r
                    }),
                    tecVars: tecAntes,
                  }
                }),
            },
          })
        },
      })
    },
    [confirmar]
  )

  /** Serve para criar (k null) e para editar. Devolve false quando falta algo. */
  const salvarVar = useCallback((k: string | null, d: DadosDaVariavel) => {
    const nome = d.nome.trim()
    if (!nome) { toast("Dê um nome à variável"); return false }
    const prompt = d.prompt.trim()
    if (!prompt) { toast("Escreva as instruções da extração"); return false }
    if (!d.fontes.length && !d.resto) { toast("Marque pelo menos um lugar para procurar"); return false }
    const c = atual.current.cfg
    const novo = !k
    const chave = k ?? `nv${Object.keys(c.vars).length}-${novoId()}`
    const antes = novo ? null : c.vars[chave]
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
    const u = usosDaVar(chave, c)
    toast(novo ? "Variável criada" : `Variável atualizada${u.length ? ` · ${u.length} regra(s) passam a usar a nova definição` : ""}`, {
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
    return true
  }, [])

  /** Criação a partir da escrita: os campos obrigatórios, em versão curta. Devolve a chave. */
  const criarVarRapida = useCallback((d: { nome: string; tipo: TipoVar; prompt: string; fonte: string }) => {
    const nome = d.nome.trim()
    if (!nome) { toast("Dê um nome à variável"); return null }
    const prompt = d.prompt.trim()
    if (!prompt) { toast("Escreva as instruções da extração"); return null }
    const k = `nv${Object.keys(atual.current.cfg.vars).length}-${novoId()}`
    const v: Variavel = {
      nome, desc: "", tipo: d.tipo, prompt, fontes: [d.fonte], resto: true, padrao: "", v: "v1",
      custo: d.fonte === "Edital e anexos" ? 0.04 : 0.02,
    }
    setCfg((x) => ({ ...x, vars: { ...x.vars, [k]: v } }))
    toast("Variável criada e disponível para as outras análises")
    return k
  }, [])

  /** "Ver mudanças" dá a mudança por vista: quem voltar encontra o chip normal. */
  const marcarVarVista = useCallback((k: string) => {
    setCfg((x) => (x.vars[k] ? { ...x, vars: { ...x.vars, [k]: { ...x.vars[k], alterada: false } } } : x))
  }, [])

  /* ---------------- aprovações ---------------- */

  const responderAprovacoes = useCallback((ids: string[], aprovou: boolean, aoFeito?: () => void, aoDesfazer?: () => void) => {
    if (!ids.length) return
    const antes = atual.current.aprovacoes
    setAprovacoes(antes.filter((a) => !ids.includes(a.id)))
    aoFeito?.()
    toast(`${ids.length}${aprovou ? " ação(ões) aprovada(s) e executada(s)" : " ação(ões) recusada(s)"}`, {
      action: {
        label: "Desfazer",
        onClick: () => {
          setAprovacoes(antes)
          aoDesfazer?.()
        },
      },
    })
  }, [])

  /* ---------------- Settle AI ---------------- */

  const bolha = (quem: "bot" | "me", conteudo: ReactNode): ItemChat => ({ id: novoId(), tipo: "msg", quem, conteudo })

  /* Conversa comum: sem agente escolhido, com o contexto da página. */
  const novaConversa = useCallback(() => {
    setChat((c) => ({ ...c, agenteId: null, visao: "conversa", sub: null, itens: [], contextos: [pagina] }))
  }, [pagina])

  /* O painel abre como conversa comum, não como lista: a lista fica atrás do ícone. */
  const abrirChat = useCallback(() => {
    setChat((c) =>
      c.agenteId
        ? { ...c, aberto: true, camada: c.camada + 1 }
        : { ...c, aberto: true, camada: c.camada + 1, visao: "conversa", sub: null, itens: [], contextos: [pagina] }
    )
  }, [pagina])

  const fecharChat = useCallback(() => setChat((c) => ({ ...c, aberto: false })), [])

  const mostrarListaDeAgentes = useCallback(() => setChat((c) => ({ ...c, agenteId: null, visao: "lista" })), [])

  /* Entrar numa conversa de agente: o cabeçalho passa a ser dele. */
  const conversarCom = useCallback((id: string, saudacao: ReactNode | null, sub: string | null) => {
    setChat((c) => ({
      ...c,
      aberto: true,
      camada: c.camada + 1,
      agenteId: id,
      visao: "conversa",
      sub,
      itens: saudacao ? [bolha("bot", saudacao)] : [],
      contextos: c.aberto ? c.contextos : c.contextos.length ? c.contextos : [pagina],
    }))
  }, [pagina])

  const selecionarAgente = useCallback(
    (id: string) => {
      const an = atual.current.cfg.agentes.find((a) => a.id === id)
      if (!an) return
      const naLic = atual.current.area === "workspace"
      setChat((c) => ({
        ...c,
        agenteId: id,
        visao: "conversa",
        sub: an.desc,
        itens: [
          bolha("bot", "Pode me dizer o que quer mudar, ou apontar um resultado que ficou errado. Eu consigo ver o que produzi em cada licitação que analisei."),
          {
            id: novoId(),
            tipo: "opcoes",
            ops: naLic
              ? [
                  { t: "Executar nesta licitação", acao: "executar" },
                  { t: "O que você produziu nesta licitação?", acao: "produziu" },
                  { t: "Quero mudar uma regra", acao: "mudar" },
                ]
              : [
                  { t: "Onde este agente já rodou?", acao: "onde" },
                  { t: "Quero mudar uma regra", acao: "mudar" },
                ],
          },
        ],
      }))
    },
    []
  )

  /* Executar pelo chat, dentro da licitação: o alvo é a licitação aberta, e o resultado
     segue o caminho de qualquer outro, com o card de acompanhamento e a funcionalidade
     passando por "preparando". Evita ir até Agentes só para disparar uma execução. */
  const executarAqui = useCallback((): ReactNode => {
    const { cfg: c, chat: ch, lics: ls, aberta: ab } = atual.current
    const an = c.agentes.find((a) => a.id === ch.agenteId)
    if (!an) return null
    if (an.ativo === false) return "Estou desativado. Ative o agente para eu poder rodar nesta licitação."
    const i = ab ?? 0
    const lic = ls[i]
    const exec: Execucao = { quando: "agora", lic: `PE ${lic.n}`, o: "Execução pedida no chat", st: "ok" }
    setCfg((x) => ({ ...x, agentes: x.agentes.map((a) => (a.id === an.id ? { ...a, execs: [exec, ...a.execs] } : a)) }))
    const k = CHAVES_FN.find((x) => FUNCS[x].agente === an.id)
    if (k && lic.fx[k] !== "indisponivel") {
      mudarEstadoFn(i, k, "preparando")
      correrPreparacao(i, [k])
      return (
        <>
          Comecei a rodar na PE {lic.n}. O resultado aparece em <b>{FUNCS[k].nome}</b> quando ficar pronto, e o card no
          canto da tela mostra o andamento.
        </>
      )
    }
    return `Rodei na PE ${lic.n}. O que eu fiz fica no meu histórico.`
  }, [correrPreparacao, mudarEstadoFn])

  const responderOpcao = useCallback(
    (itemId: number, op: { t: string; acao: AcaoDeOpcao }) => {
      const { cfg: c, chat: ch } = atual.current
      const an = c.agentes.find((a) => a.id === ch.agenteId)
      let resposta: ReactNode = null
      if (op.acao === "executar") resposta = executarAqui()
      if (op.acao === "produziu") {
        resposta = `Nesta licitação, a PE 90014/2026, produzi ${
          an?.destino ? `${regrasDa(an, c.regras).length} resultados` : "15 resultados"
        }. Pode citar um deles que eu te mostro de onde saiu.`
      }
      if (op.acao === "mudar") resposta = "Me diga qual, ou abra a configuração deste agente para ver todas."
      if (op.acao === "onde") {
        resposta = "Rodei em 148 licitações neste mês. Pode citar uma delas que eu te mostro o que produzi lá e de onde saiu."
      }
      setChat((x) => ({
        ...x,
        itens: [
          ...x.itens.filter((it) => it.id !== itemId),
          bolha("me", op.t),
          ...(resposta ? [bolha("bot", resposta)] : []),
        ],
      }))
    },
    [executarAqui]
  )

  const enviarMensagem = useCallback((conteudo: ReactNode) => {
    setChat((x) => ({
      ...x,
      itens: [
        ...x.itens,
        bolha("me", conteudo),
        bolha(
          "bot",
          "Consigo agir sobre as regras deste agente e sobre o que ele produziu nas licitações. Se for uma correção, eu proponho a mudança com o antes e o depois antes de aplicar."
        ),
      ],
    }))
  }, [])

  /* As sugestões dependem da tela. As que ainda não têm resposta dizem isso. */
  const perguntar = useCallback((t: string) => {
    setChat((x) => ({ ...x, itens: [bolha("me", t), bolha("bot", RESPOSTA_A_DEFINIR)] }))
  }, [])

  const setModoChat = useCallback((modo: ModoChat) => setChat((c) => ({ ...c, modo, camada: c.camada + 1 })), [])
  const setContextos = useCallback((f: (c: Contexto[]) => Contexto[]) => setChat((c) => ({ ...c, contextos: f(c.contextos) })), [])

  return {
    cfg, setCfg, aprovacoes, area, aba, lics, aberta, licFoco, abaWk, prepItens, painel, modal, confirmacao,
    ordemWidgets, chat, pagina, fontesIA, setFontesIA, conexoes, setConexoes, rascunhoChat, setRascunhoChat,
    setAberta, setAbaWk, setOrdemWidgets, setConfirmacao,
    irPara, abaAtiva, abrirLicitacao, enviarParaAnalise, mudarEstadoFn, abrirFuncionalidade, tentarDeNovo,
    fecharPrep, fecharPainel, abrirModal, trazerChatParaFrente, irParaTela, abrirComVolta, voltarModal, fecharModal, confirmar,
    alterarAgente, aplicarMomento, executarEmTodas, excluirAgente, excluirAgentes, criarAgenteTexto, criarAgenteScore,
    excluirVar, excluirVars, salvarVar, criarVarRapida, marcarVarVista, responderAprovacoes,
    novaConversa, abrirChat, fecharChat, mostrarListaDeAgentes, conversarCom, selecionarAgente, responderOpcao,
    enviarMensagem, perguntar, setModoChat, setContextos,
  }
}

export type Simulador = ReturnType<typeof useSimuladorInterno>

const SimuladorContext = createContext<Simulador | null>(null)

export function SimuladorProvider({ children }: { children: ReactNode }) {
  const sim = useSimuladorInterno()
  return <SimuladorContext.Provider value={sim}>{children}</SimuladorContext.Provider>
}

export function useSim() {
  const sim = useContext(SimuladorContext)
  if (!sim) throw new Error("useSim fora do SimuladorProvider")
  return sim
}

/** Quando o gatilho de um agente muda, a chave do momento correspondente. */
export const momentoDoAgente = (an: Agente) => momentoDe(an.gatilho)
