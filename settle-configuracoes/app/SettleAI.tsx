// Settle AI em Configurações: a mesma IA da plataforma, com as mesmas ferramentas
// (settle-agentes/plataforma/app/SettleAI.tsx). Três tamanhos para a mesma conversa,
// lista de agentes para escolher com quem falar, contexto da página, campo que aceita
// chip de variável e anexo. O que muda é o assunto: aqui ela fala de configuração.
//
// As respostas são roteirizadas. O que não está no roteiro ela diz que ainda não sabe,
// em vez de inventar.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import {
  AppWindowIcon,
  BotIcon,
  ChevronDownIcon,
  FileTextIcon,
  LayoutListIcon,
  Maximize2Icon,
  PanelRightIcon,
  PaperclipIcon,
  PlusIcon,
  SlidersHorizontalIcon,
  SparklesIcon,
  SquarePenIcon,
  WrenchIcon,
  XIcon,
  type LucideIcon,
} from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { DockedPanel } from "@/components/ui/docked-panel"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { TokenField, TokenText, type TokenFieldHandle } from "@/components/ui/token-field"

import { NOMES, type Rota } from "./dados"
import { useConfig } from "./estado"
import { tokenDaVar } from "./agentes/comum"
import { useAgentes } from "./agentes/estado"
import { quandoTxt, resumoDoAgente, varsDoAgente } from "./agentes/regras"
import { APROVACAO, ONDE, type Agente } from "./agentes/dados"

type Modo = "flutuante" | "lateral" | "cheio"

const MODOS: { id: Modo; nome: string; icone: LucideIcon }[] = [
  { id: "lateral", nome: "Lateral", icone: PanelRightIcon },
  { id: "flutuante", nome: "Flutuante", icone: AppWindowIcon },
  { id: "cheio", nome: "Tela cheia", icone: Maximize2Icon },
]

type Fala = { quem: "settle" | "voce"; texto: ReactNode }
/** O que a pergunta leva junto: a área em que a pessoa está entra sozinha (auto). */
type Ctx = { id: string; nome: string; tipo: "area" | "agente" | "documento"; auto?: boolean }

const ICONE_DO_CTX: Record<Ctx["tipo"], LucideIcon> = {
  area: SlidersHorizontalIcon,
  agente: BotIcon,
  documento: FileTextIcon,
}

/** Uma sugestão da conversa: a pergunta como a pessoa faria, e o que a Settle responde. */
type Sugestao = { p: string; r?: ReactNode; faz?: "variavel" | "agente" }

const SOBRE_VARIAVEL: Sugestao = {
  p: "O que é uma variável?",
  r: (
    <>
      Uma <b>variável</b> é uma pergunta que eu faço a todo edital: o CNPJ do órgão, o valor estimado, se exige atestado
      técnico. Eu procuro nos documentos que você marcar e guardo a <b>resposta</b>. Sozinha ela não muda nada na
      licitação: quem usa a resposta para decidir é o <b>agente</b>.
    </>
  ),
}

const SOBRE_AGENTE: Sugestao = {
  p: "O que é um agente?",
  r: (
    <>
      Um <b>agente</b> é uma tarefa que eu faço sozinha em cada licitação, como uma pessoa do time faria. Ele lê as
      respostas das variáveis, decide, e mostra o <b>resultado</b> dentro da licitação. Se for mudar alguma coisa, como
      a etapa, ele pode pedir aprovação antes.
    </>
  ),
}

const CRIAR_VARIAVEL: Sugestao = { p: "Criar uma variável comigo", faz: "variavel" }
const CRIAR_AGENTE: Sugestao = { p: "Criar um agente comigo", faz: "agente" }

const PARADO: Sugestao = {
  p: "Por que um agente ficou parado?",
  r: (
    <>
      Ele usava uma variável que foi excluída, e sem a resposta não tem como decidir. Abra o agente, troque a variável
      que falta por outra ou crie de novo a que foi excluída, e ele volta a rodar.
    </>
  ),
}

const APROVA: Sugestao = {
  p: "Por que uma ação espera aprovação?",
  r: (
    <>
      Porque o agente está configurado para pedir aprovação antes de mudar a licitação. Nada muda até alguém responder.
      A fila fica em <b>Aprovações</b>, e quem respondeu, o quê e quando fica registrado em <b>Auditoria</b>.
    </>
  ),
}

/** O que eu sei responder em cada área. A primeira fala é sempre sobre onde a pessoa está. */
const POR_ROTA: Record<Rota, { resumo: string; sugestoes: Sugestao[] }> = {
  inicio: {
    resumo: "Daqui você configura como a Settle trabalha para o seu time: o funil, as listas, o card, o e-mail, quem pode o quê, e os agentes.",
    sugestoes: [SOBRE_AGENTE, SOBRE_VARIAVEL],
  },
  etapas: {
    resumo: "As etapas são as colunas do Kanban, o caminho que uma licitação percorre até virar proposta.",
    sugestoes: [
      {
        p: "O que acontece com as licitações se eu renomear uma etapa?",
        r: "Nada se perde: elas continuam onde estão, só com o novo nome. Excluir é diferente: aí você escolhe para qual etapa vão as licitações que estavam nela.",
      },
      SOBRE_AGENTE,
    ],
  },
  abas: {
    resumo: "As abas são as listas salvas que o time vê no topo, cada uma com os próprios filtros.",
    sugestoes: [
      {
        p: "A aba vale para o time todo?",
        r: "As abas configuradas aqui valem para a organização inteira. O que cada pessoa filtra na hora não mexe na aba dos outros.",
      },
      SOBRE_AGENTE,
    ],
  },
  motivos: {
    resumo: "Os motivos são as opções que aparecem quando alguém descarta uma licitação ou marca uma perda.",
    sugestoes: [
      {
        p: "Para que serve exigir o motivo?",
        r: "Sem motivo obrigatório, a maior parte das licitações sai da lista sem explicação, e ninguém consegue dizer depois por que perdeu. Com ele, o relatório de perdas passa a valer alguma coisa.",
      },
      SOBRE_AGENTE,
    ],
  },
  card: {
    resumo: "Aqui você escolhe quais informações aparecem no card de cada licitação, e em que ordem.",
    sugestoes: [
      {
        p: "Ocultar um campo apaga a informação?",
        r: "Não. O campo só deixa de aparecer no card; a informação continua na licitação e nos filtros.",
      },
      SOBRE_AGENTE,
    ],
  },
  email: {
    resumo: "Este é o modelo do e-mail que a Settle manda quando encontra licitações para o time.",
    sugestoes: [
      {
        p: "O que acontece quando não tem licitação nova?",
        r: "Você escolhe: ou o e-mail não sai naquele dia, ou sai dizendo que não houve novidade. Nada de e-mail em branco.",
      },
      SOBRE_AGENTE,
    ],
  },
  equipe: {
    resumo: "Aqui ficam as pessoas da organização e o papel de cada uma.",
    sugestoes: [
      {
        p: "Qual a diferença entre desativar e excluir alguém?",
        r: "Desativar tira o acesso e preserva o histórico do que a pessoa fez. É o que você quer em quase todo caso.",
      },
      SOBRE_AGENTE,
    ],
  },
  permissoes: {
    resumo: "As permissões dizem o que cada papel vê e pode mudar.",
    sugestoes: [
      {
        p: "Quem pode configurar agentes?",
        r: (
          <>
            Configurar agentes e variáveis é de administrador. <b>Aprovações</b> abre para qualquer função, porque quem
            aprova nem sempre é quem configura.
          </>
        ),
      },
      SOBRE_AGENTE,
    ],
  },
  auditoria: {
    resumo: "A Auditoria guarda o que foi mudado na configuração e as respostas às aprovações dos agentes.",
    sugestoes: [
      {
        p: "O que fica registrado aqui?",
        r: (
          <>
            Uma linha por acontecimento, com quem, quando e o quê. Nas aprovações, uma linha por decisão: a licitação, o
            agente que pediu e se foi aprovada ou recusada. Registro não se edita nem se apaga.
          </>
        ),
      },
      APROVA,
    ],
  },
  agentes: {
    resumo: "Esta é a área dos agentes: as tarefas que eu faço sozinha em cada licitação.",
    sugestoes: [SOBRE_AGENTE, CRIAR_AGENTE, APROVA, SOBRE_VARIAVEL],
  },
  variaveis: {
    resumo: "Esta é a área das variáveis: as perguntas que eu faço a todo edital.",
    sugestoes: [SOBRE_VARIAVEL, CRIAR_VARIAVEL, PARADO, SOBRE_AGENTE],
  },
  artefato: {
    resumo: "Esta página mostra o artefato: o bloco que um agente produz dentro da licitação. É uma apresentação, nada aqui é configurável.",
    sugestoes: [
      {
        p: "O que define o conteúdo do artefato?",
        r: (
          <>
            A instrução do agente: se ela pede uma resposta curta, o artefato sai curto; se pede conferir item a item,
            sai uma lista. O que você escolhe no formulário é <b>onde</b> ele aparece, não o que vem dentro.
          </>
        ),
      },
      SOBRE_AGENTE,
    ],
  },
}

/** Agentes e Variáveis são as áreas em que falar com um agente faz sentido de imediato. */
const AREA_DE_AGENTES: Rota[] = ["agentes", "variaveis"]

const NAO_SEI = (
  <>
    Isso eu ainda não sei responder por aqui. Posso falar sobre esta área, sobre agentes e variáveis, e criar um agente
    ou uma variável com você. É só escolher abaixo.
  </>
)

/* ------------------------------------------------------------------ */
/* Estado da conversa                                                  */
/* ------------------------------------------------------------------ */

type Chat = {
  rota: Rota
  modo: Modo
  setModo: (m: Modo) => void
  visao: "conversa" | "lista"
  verLista: () => void
  agenteId: string | null
  falarCom: (id: string) => void
  falas: Fala[]
  contextos: Ctx[]
  setContextos: (f: (c: Ctx[]) => Ctx[]) => void
  rascunho: string
  setRascunho: (t: string) => void
  abrir: () => void
  fechar: () => void
  novaConversa: () => void
  responder: (s: Sugestao) => void
  perguntar: (t: ReactNode) => void
}

const Contexto = createContext<Chat | null>(null)

function useChat() {
  const c = useContext(Contexto)
  if (!c) throw new Error("useChat fora do ChatProvider")
  return c
}

export function ChatProvider({ rota, children }: { rota: Rota; children: ReactNode }) {
  const { iaAberta, setIaAberta } = useConfig()
  const { cfg, abrirModal } = useAgentes()
  const [modo, setModo] = useState<Modo>("flutuante")
  const [visao, setVisao] = useState<"conversa" | "lista">("conversa")
  const [agenteId, setAgenteId] = useState<string | null>(null)
  const [falas, setFalas] = useState<Fala[]>([])
  const [rascunho, setRascunho] = useState("")
  const [contextos, setContextosBruto] = useState<Ctx[]>([])

  const saudacao = useCallback(
    (r: Rota): Fala => ({
      quem: "settle",
      texto: (
        <>
          Olá, Brunno. Você está em <b>{NOMES[r]}</b>. {POR_ROTA[r].resumo} Pergunte o que quiser, ou escolha abaixo.
        </>
      ),
    }),
    []
  )

  /* A área em que a pessoa está entra sozinha no contexto e acompanha a navegação; o que
     ela acrescentou à mão continua ali. */
  useEffect(() => {
    setContextosBruto((cs) => [
      { id: `area-${rota}`, nome: NOMES[rota], tipo: "area", auto: true },
      ...cs.filter((c) => !c.auto),
    ])
  }, [rota])

  const abrir = () => {
    if (!falas.length) setFalas([saudacao(rota)])
    setIaAberta(true)
  }

  const novaConversa = () => {
    setAgenteId(null)
    setVisao("conversa")
    setFalas([saudacao(rota)])
    setRascunho("")
  }

  const falarCom = (id: string) => {
    const an = cfg.agentes.find((a) => a.id === id)
    if (!an) return
    setAgenteId(id)
    setVisao("conversa")
    setContextosBruto((cs) => [
      ...cs.filter((c) => c.tipo !== "agente"),
      { id: `agente-${id}`, nome: an.nome, tipo: "agente" },
    ])
    setFalas([
      {
        quem: "settle",
        texto: (
          <>
            Agora você está falando com <b>{an.nome}</b>. {resumoDoAgente(an, cfg).join(" · ")}. Pergunte sobre ele, ou
            abra a configuração pela chave aí em cima.
          </>
        ),
      },
    ])
  }

  const perguntar = (t: ReactNode, r?: ReactNode) => {
    setFalas((f) => [...f, { quem: "voce", texto: t }, { quem: "settle", texto: r ?? NAO_SEI }])
  }

  const responder = (s: Sugestao) => {
    if (s.faz) {
      setIaAberta(false)
      abrirModal(s.faz === "variavel" ? { tipo: "conversa-variavel" } : { tipo: "conversa-agente" })
      return
    }
    perguntar(s.p, s.r)
  }

  const valor = useMemo<Chat>(
    () => ({
      rota,
      modo,
      setModo,
      visao,
      verLista: () => setVisao((v) => (v === "lista" ? "conversa" : "lista")),
      agenteId,
      falarCom,
      falas,
      contextos,
      setContextos: (f) => setContextosBruto(f),
      rascunho,
      setRascunho,
      abrir,
      fechar: () => setIaAberta(false),
      novaConversa,
      responder,
      perguntar: (t: ReactNode) => perguntar(t),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rota, modo, visao, agenteId, falas, contextos, rascunho, iaAberta, cfg]
  )

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

/* ------------------------------------------------------------------ */
/* Peças                                                               */
/* ------------------------------------------------------------------ */

function BotaoDeIcone({ rotulo, onClick, children }: { rotulo: string; onClick: () => void; children: ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={rotulo} onClick={onClick} className="text-muted-foreground hover:text-foreground">
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{rotulo}</TooltipContent>
    </Tooltip>
  )
}

function Cabecalho() {
  const { visao, verLista, agenteId, modo, setModo, novaConversa, fechar, rota } = useChat()
  const { cfg, abrirModal } = useAgentes()
  const an = agenteId ? cfg.agentes.find((a) => a.id === agenteId) : null
  const titulo = visao === "lista" ? "Agentes" : an ? an.nome : "Settle AI"
  return (
    <div className="flex shrink-0 items-center gap-1 border-b px-2.5 py-2">
      <button
        type="button"
        aria-expanded={visao === "lista"}
        onClick={verLista}
        className="group/titulo flex min-w-0 flex-1 items-center gap-1.5 rounded-md px-1.5 py-1 text-left outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <BotIcon aria-hidden className="size-4 shrink-0 text-primary" />
        <span className="truncate text-sm font-semibold">{titulo}</span>
        {visao === "conversa" && !an && <span className="truncate text-xs text-muted-foreground">· {NOMES[rota]}</span>}
        <ChevronDownIcon aria-hidden className="size-3.5 shrink-0 text-muted-foreground transition-transform group-aria-expanded/titulo:rotate-180" />
      </button>
      {an && (
        <BotaoDeIcone
          rotulo="Configurar este agente"
          onClick={() => {
            window.location.hash = "agentes"
            abrirModal({ tipo: "agente", id: an.id })
          }}
        >
          <WrenchIcon />
        </BotaoDeIcone>
      )}
      <BotaoDeIcone rotulo="Começar uma conversa nova" onClick={novaConversa}>
        <SquarePenIcon />
      </BotaoDeIcone>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Trocar o modo do chat" className="text-muted-foreground hover:text-foreground">
                <PanelRightIcon />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>Trocar o modo do chat</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuRadioGroup value={modo} onValueChange={(v) => setModo(v as Modo)}>
              {MODOS.map((m) => (
                <DropdownMenuRadioItem key={m.id} value={m.id}>
                  <m.icone />
                  {m.nome}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <BotaoDeIcone rotulo="Fechar a Settle AI" onClick={fechar}>
        <XIcon />
      </BotaoDeIcone>
    </div>
  )
}

/* A lista de agentes: os da área em que a pessoa está primeiro, como na plataforma. */
function ListaDeAgentes() {
  const { falarCom, rota, fechar } = useChat()
  const { cfg, abrirModal } = useAgentes()
  const daArea = AREA_DE_AGENTES.includes(rota)
  const grupo = (t: string) => (
    <p className="px-1 pt-2.5 pb-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">{t}</p>
  )
  const item = (nome: string, sub: string, onClick: () => void, key: string) => (
    <button
      key={key}
      type="button"
      onClick={onClick}
      className="mb-2 flex w-full flex-col rounded-lg border bg-card px-3 py-2.5 text-left outline-none hover:border-foreground/20 hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <span className="text-[13.5px] font-semibold">{nome}</span>
      <span className="mt-0.5 text-xs leading-[17px] text-muted-foreground">{sub}</span>
    </button>
  )
  const linha = (a: Agente) => item(a.nome, resumoDoAgente(a, cfg).join(" · "), () => falarCom(a.id), a.id)
  return (
    <div>
      {grupo(daArea ? `Agentes desta área · ${NOMES[rota]}` : "Agentes")}
      {cfg.agentes.map(linha)}
      {grupo("Criar")}
      {item(
        "Criar um agente novo",
        "conversando comigo, do zero",
        () => {
          fechar()
          abrirModal({ tipo: "conversa-agente" })
        },
        "criar-agente"
      )}
      {item(
        "Criar uma variável nova",
        "conversando comigo, do zero",
        () => {
          fechar()
          abrirModal({ tipo: "conversa-variavel" })
        },
        "criar-var"
      )}
    </div>
  )
}

function Bolha({ fala }: { fala: Fala }) {
  if (fala.quem === "voce") {
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] rounded-2xl rounded-br-md bg-muted px-3.5 py-2 text-[13.5px] leading-5">{fala.texto}</p>
      </div>
    )
  }
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <SparklesIcon aria-hidden className="size-3.5" />
      </span>
      <div className="max-w-[88%] text-[13.5px] leading-5 [&_b]:font-semibold">{fala.texto}</div>
    </div>
  )
}

/** As perguntas que fazem sentido agora: as do agente, quando há um, ou as da área. */
function sugestoesAgora(agente: Agente | null | undefined, cfg: ReturnType<typeof useAgentes>["cfg"], rota: Rota): Sugestao[] {
  if (!agente) return POR_ROTA[rota].sugestoes
  const vars = varsDoAgente(agente, cfg)
  return [
    {
      p: "O que este agente faz?",
      r: (
        <>
          {quandoTxt(agente)}, ele {agente.texto ? "segue a instrução que você escreveu" : "aplica as regras configuradas"} e{" "}
          {agente.onde?.length && !agente.onde.includes("nenhum") ? (
            <>
              mostra o resultado em <b>{agente.onde.map((k) => ONDE[k].t).join(" e ")}</b>.
            </>
          ) : (
            "não mostra resultado: ele só faz ações na licitação."
          )}
        </>
      ),
    },
    {
      p: "Quais variáveis ele usa?",
      r: vars.length ? (
        <>
          Ele usa {vars.map((k) => cfg.vars[k]?.nome).filter(Boolean).join(", ")}. Se uma delas for excluída, ele fica
          parado até você trocar.
        </>
      ) : (
        "Nenhuma: a instrução dele não depende de resposta de variável."
      ),
    },
    {
      p: "Ele precisa de aprovação?",
      r: <>{APROVACAO[agente.aprovacao ?? "manual"].t}. {APROVACAO[agente.aprovacao ?? "manual"].d}</>,
    },
  ]
}

function Conversa() {
  const { falas, responder, agenteId, rota } = useChat()
  const { cfg } = useAgentes()
  const an = agenteId ? cfg.agentes.find((a) => a.id === agenteId) : null
  const fim = useRef<HTMLDivElement>(null)
  useEffect(() => {
    fim.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [falas.length])
  return (
    <div className="flex flex-col gap-3.5">
      {falas.map((f, i) => (
        <Bolha key={i} fala={f} />
      ))}
      <div ref={fim} />
      <div className="flex flex-wrap gap-1.5 pt-0.5">
        {sugestoesAgora(an, cfg, rota).map((s) => (
          <Button
            key={s.p}
            variant="outline"
            size="xs"
            className="h-7 rounded-full font-normal shadow-none"
            onClick={() => responder(s)}
          >
            {s.p}
          </Button>
        ))}
      </div>
    </div>
  )
}

function Rodape() {
  const { contextos, setContextos, rascunho, setRascunho, perguntar } = useChat()
  const { cfg } = useAgentes()
  const campo = useRef<TokenFieldHandle>(null)
  const arquivo = useRef<HTMLInputElement>(null)
  const getToken = (k: string) => tokenDaVar(k, cfg.vars, cfg.varsEx)

  const enviar = () => {
    const valor = campo.current?.getValue() ?? ""
    if (!valor.trim()) return
    /* A mensagem enviada mantém os chips: quem lê depois vê de qual variável a pergunta falava. */
    perguntar(<TokenText value={valor.trim()} getToken={getToken} />)
    campo.current?.clear()
    setRascunho("")
  }

  return (
    <form
      className="flex shrink-0 flex-col gap-2 border-t px-3.5 py-3"
      onSubmit={(e) => {
        e.preventDefault()
        enviar()
      }}
    >
      {/* O contexto em que a pergunta vai ser feita: a área entra sozinha; o "+" acrescenta. */}
      {contextos.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Contexto da conversa">
          {contextos.map((c, i) => {
            const Icone = ICONE_DO_CTX[c.tipo]
            return (
              <li
                key={`${c.id}-${i}`}
                title={c.auto ? "A área em que você está" : undefined}
                className={cn(
                  "inline-flex items-center gap-1.25 rounded-md bg-muted px-1.75 py-0.5 text-xs leading-[18px]",
                  c.auto && "bg-primary/10 text-primary"
                )}
              >
                <Icone aria-hidden className={cn("size-2.75 shrink-0", !c.auto && "text-muted-foreground")} />
                {c.nome}
                <button
                  type="button"
                  aria-label={`Tirar ${c.nome} do contexto`}
                  className="inline-flex text-muted-foreground hover:text-foreground"
                  onClick={() => setContextos((cs) => cs.filter((_, j) => j !== i))}
                >
                  <XIcon aria-hidden className="size-2.75" />
                </button>
              </li>
            )
          })}
        </ul>
      )}
      {/* O campo aceita chip de variável: por isso é campo de tokens, e não input. */}
      <TokenField
        ref={campo}
        singleLine
        trigger={null}
        aria-label="Mensagem para a Settle AI"
        placeholder="Pergunte qualquer coisa"
        getToken={getToken}
        defaultValue={rascunho}
        onValueChange={setRascunho}
        onSubmit={enviar}
      />
      <div className="flex items-center gap-1.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Acrescentar à pergunta">
              <PlusIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            <DropdownMenuGroup>
              <p className="px-2 pt-1.5 pb-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                Inserir variável
              </p>
              {Object.entries(cfg.vars)
                .slice(0, 6)
                .map(([k, v]) => (
                  <DropdownMenuItem key={k} onSelect={() => campo.current?.insertToken(k)}>
                    <LayoutListIcon />
                    {v.nome}
                  </DropdownMenuItem>
                ))}
            </DropdownMenuGroup>
            <DropdownMenuGroup>
              <DropdownMenuItem onSelect={() => arquivo.current?.click()}>
                <PaperclipIcon />
                Anexar arquivo
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button type="submit" size="sm" className="ml-auto">
          Enviar
        </Button>
        {/* Anexar é o seletor do sistema: o arquivo escolhido vira um chip de contexto. */}
        <input
          ref={arquivo}
          type="file"
          className="sr-only"
          aria-label="Escolher arquivo para anexar"
          tabIndex={-1}
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (!f) return
            setContextos((cs) => [...cs, { id: `arq-${Date.now()}`, nome: f.name, tipo: "documento" }])
            toast(`${f.name} entrou no contexto`)
            e.target.value = ""
          }}
        />
      </div>
    </form>
  )
}

function ConteudoDoChat({ cheio = false }: { cheio?: boolean }) {
  const { visao } = useChat()
  const largura = cheio ? "mx-auto w-full max-w-180" : ""
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <Cabecalho />
      <div className="min-h-0 flex-1 overflow-y-auto px-3.5 py-3">
        <div className={largura}>{visao === "lista" ? <ListaDeAgentes /> : <Conversa />}</div>
      </div>
      {/* na lista de agentes não há campo: escolher com quem falar vem antes */}
      {visao === "conversa" && (
        <div className={largura}>
          <Rodape />
        </div>
      )}
    </div>
  )
}

/** A conversa como coluna do layout: empurra a tela inteira, em vez de cobrir. */
export function ChatLateral() {
  const { iaAberta } = useConfig()
  const { modo } = useChat()
  const [largura, setLargura] = useState(30)
  const aberto = iaAberta && modo === "lateral"
  return (
    <DockedPanel
      open={aberto}
      width={largura}
      minWidth={24}
      maxWidth={60}
      onWidthChange={setLargura}
      aria-label="Settle AI"
      resizeLabel="Redimensionar a Settle AI"
      className="sticky top-0 h-svh min-h-0 self-start"
    >
      {aberto && <ConteudoDoChat />}
    </DockedPanel>
  )
}

/**
 * O botão fica: com a janela flutuando acima dele, ele vira o interruptor de abrir e
 * fechar. Nos modos lateral e tela cheia ele some, porque a conversa já está à vista.
 */
export function SettleAI() {
  const { iaAberta } = useConfig()
  const { modo, abrir, fechar } = useChat()
  const flutuante = iaAberta && modo === "flutuante"
  const cheio = iaAberta && modo === "cheio"
  const escondido = iaAberta && modo !== "flutuante"

  return (
    <>
      <Popover open={flutuante}>
        <PopoverAnchor asChild>
          <Button
            size="lg"
            aria-expanded={iaAberta}
            onClick={() => (iaAberta ? fechar() : abrir())}
            className={cn(
              "fixed right-6 bottom-6 z-50 h-11 rounded-full px-4.5 text-sm font-semibold shadow-lg",
              escondido && "hidden"
            )}
          >
            <BotIcon data-icon="inline-start" />
            Settle AI
          </Button>
        </PopoverAnchor>
        {/* Não fecha com clique fora nem com Esc: sai pelo X ou pelo próprio botão. */}
        <PopoverContent
          side="top"
          align="end"
          sideOffset={16}
          aria-label="Settle AI"
          className="flex h-[min(560px,calc(100svh-8rem))] w-[min(400px,calc(100vw-2rem))] flex-col gap-0 overflow-hidden p-0"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <ConteudoDoChat />
        </PopoverContent>
      </Popover>

      <Dialog open={cheio} onOpenChange={(o) => !o && fechar()}>
        <DialogContent size="full" showCloseButton={false} aria-describedby={undefined}>
          <DialogTitle className="sr-only">Settle AI</DialogTitle>
          <ConteudoDoChat cheio />
        </DialogContent>
      </Dialog>
    </>
  )
}
