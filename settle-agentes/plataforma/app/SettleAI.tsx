// Settle AI: presente em qualquer tela. Abre como conversa comum, com a página em que
// a pessoa está como contexto; o ícone de agentes lista com quem dá para falar, com os
// desta página primeiro. A conversa com um agente dá acesso à configuração dele.
// Três tamanhos para a mesma conversa, como no Notion: flutuante, lateral e tela cheia.

import { useEffect, useRef, useState, type ReactNode, type UIEvent } from "react"
import {
  AppWindowIcon,
  AtSignIcon,
  BotIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  FileTextIcon,
  GaugeIcon,
  GitCompareArrowsIcon,
  HashIcon,
  LayoutListIcon,
  ListChecksIcon,
  ListIcon,
  Maximize2Icon,
  PanelRightIcon,
  PlusIcon,
  SlidersHorizontalIcon,
  SquarePenIcon,
  UploadIcon,
  WrenchIcon,
  XIcon,
  type LucideIcon,
} from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { DockedPanel } from "@/components/ui/docked-panel"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { TokenField, TokenText, type TokenFieldHandle } from "@/components/ui/token-field"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

import { tokenDaVar } from "./comum"
import {
  AGENTES_DA_PAGINA,
  GRUPOS_DE_CONTEXTO,
  LICITACOES_DO_ACERVO,
  type Conexao,
  type Contexto,
  type FonteIA,
  type OpcaoDeContexto,
  type TipoContexto,
} from "./dados"
import { useSim, type ModoChat } from "./estado"
import { regrasDa } from "./regras"

/* O chip precisa dizer que tipo de coisa está no contexto, não só o nome (Alice, 09/09). */
const ICONE_DO_CONTEXTO: Record<TipoContexto, LucideIcon> = {
  pagina: FileTextIcon,
  licitacao: LayoutListIcon,
  documento: FileTextIcon,
  area: BotIcon,
}

const MODOS: { id: ModoChat; nome: string; icone: LucideIcon }[] = [
  { id: "lateral", nome: "Lateral", icone: PanelRightIcon },
  { id: "flutuante", nome: "Flutuante", icone: AppWindowIcon },
  { id: "cheio", nome: "Tela cheia", icone: Maximize2Icon },
]

/** Botão de ícone com dica: o mesmo em todo o cabeçalho. */
function BotaoDeIcone({ rotulo, dica, onClick, children, className }: { rotulo: string; dica?: string; onClick?: () => void; children: ReactNode; className?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={rotulo} onClick={onClick} className={className}>
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{dica ?? rotulo}</TooltipContent>
    </Tooltip>
  )
}

/* ------------------------------------------------------------------ */
/* Cabeçalho                                                           */
/* ------------------------------------------------------------------ */

function CabecalhoDoChat({ titulo }: { titulo: ReactNode }) {
  const { chat, mostrarListaDeAgentes, novaConversa, fecharChat, setModoChat, irPara, abaAtiva, abrirModal } = useSim()
  return (
    <div className="flex shrink-0 items-center gap-1.5 border-b bg-card py-3 pr-3 pl-4">
      <button
        type="button"
        aria-expanded={chat.visao === "lista"}
        onClick={mostrarListaDeAgentes}
        className="group/titulo -ml-2 flex min-w-0 flex-1 items-center gap-1.75 rounded-md px-2 py-1.25 text-left text-[15px] font-semibold outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <span className="truncate">{titulo}</span>
        <ChevronDownIcon aria-hidden className="size-3.5 shrink-0 transition-transform group-aria-expanded/titulo:rotate-180" />
      </button>
      <BotaoDeIcone rotulo="Ver os agentes" onClick={mostrarListaDeAgentes}>
        <BotIcon />
      </BotaoDeIcone>
      {chat.agenteId && (
        <BotaoDeIcone
          rotulo="Configurar este agente"
          onClick={() => {
            irPara("agentes")
            abaAtiva("agentes")
            abrirModal({ tipo: "agente", id: chat.agenteId! })
          }}
        >
          <WrenchIcon />
        </BotaoDeIcone>
      )}
      <BotaoDeIcone rotulo="Começar uma conversa nova" dica="Nova conversa" onClick={novaConversa}>
        <SquarePenIcon />
      </BotaoDeIcone>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Trocar o modo do chat">
                <PanelRightIcon />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>Trocar o modo do chat</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuRadioGroup value={chat.modo} onValueChange={(v) => setModoChat(v as ModoChat)}>
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
      <BotaoDeIcone rotulo="Fechar o painel" dica="Fechar" onClick={fecharChat}>
        <XIcon />
      </BotaoDeIcone>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Corpo                                                               */
/* ------------------------------------------------------------------ */

type Sugestao = { t: string; icone: LucideIcon; faz?: "novoAgente" | "novaVar" }

/* As sugestões dependem da tela: "Perguntar sobre este edital" na lista de agentes não
   faz sentido, ali não existe edital nenhum. */
function sugestoesDa(pagina: Contexto, aba: string): Sugestao[] {
  if (pagina.id === "lic") {
    return [
      { t: "Perguntar sobre este edital", icone: FileTextIcon },
      { t: "Comparar com uma licitação parecida", icone: GitCompareArrowsIcon },
      { t: "Criar um agente novo", icone: PlusIcon, faz: "novoAgente" },
    ]
  }
  if (pagina.id === "lics") {
    return [
      { t: "Por que esta licitação tirou essa nota?", icone: GaugeIcon },
      { t: "Comparar duas licitações da lista", icone: GitCompareArrowsIcon },
      { t: "Criar um agente novo", icone: PlusIcon, faz: "novoAgente" },
    ]
  }
  if (aba === "variaveis") {
    return [
      { t: "Criar uma variável", icone: PlusIcon, faz: "novaVar" },
      { t: "Onde esta variável é usada?", icone: HashIcon },
      { t: "O que muda se eu editar uma variável?", icone: ListIcon },
    ]
  }
  if (aba === "aprovacoes") {
    return [
      { t: "O que está esperando a minha aprovação?", icone: ListChecksIcon },
      { t: "Por que estas ações precisam de aprovação?", icone: ListIcon },
      { t: "Aprovar tudo de um agente só", icone: PlusIcon },
    ]
  }
  return [
    { t: "Criar um agente novo", icone: PlusIcon, faz: "novoAgente" },
    { t: "O que cada agente faz hoje?", icone: ListIcon },
    { t: "Qual agente errou mais nesta semana?", icone: ListChecksIcon },
  ]
}

function ConversaVazia() {
  const { pagina, aba, fecharChat, irPara, abaAtiva, abrirModal, perguntar } = useSim()
  return (
    <div className="px-0.5 pt-2">
      <h3 className="mt-3.5 mb-3 text-[17px] font-semibold">Como posso ajudar?</h3>
      <ul className="flex flex-col">
        {sugestoesDa(pagina, aba).map((s) => (
          <li key={s.t}>
            <button
              type="button"
              onClick={() => {
                if (s.faz === "novoAgente") {
                  fecharChat()
                  irPara("agentes")
                  abaAtiva("agentes")
                  abrirModal({ tipo: "modelos" })
                } else if (s.faz === "novaVar") {
                  fecharChat()
                  irPara("agentes")
                  abaAtiva("variaveis")
                  abrirModal({ tipo: "variavel", k: null })
                } else {
                  perguntar(s.t)
                }
              }}
              className="flex w-full items-center gap-2.25 rounded-lg px-1.5 py-2 text-left text-sm outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <s.icone aria-hidden className="size-4 shrink-0 text-muted-foreground" />
              {s.t}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* A lista de agentes, agrupada: os que rodam na página em que a pessoa está vêm primeiro. */
function ListaDeAgentesDoChat() {
  const { cfg, pagina, selecionarAgente, fecharChat, abaAtiva, abrirModal } = useSim()
  const daPagina = AGENTES_DA_PAGINA[pagina.id] ?? []
  const aqui = cfg.agentes.filter((a) => daPagina.includes(a.id))
  const resto = cfg.agentes.filter((a) => !daPagina.includes(a.id))
  const grupo = (t: string) => (
    <p className="px-2 pt-2.5 pb-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">{t}</p>
  )
  const item = (nome: string, sub: string, onClick: () => void, key: string) => (
    <button
      key={key}
      type="button"
      onClick={onClick}
      className="mb-2 flex w-full flex-col rounded-lg border bg-card px-3.25 py-2.75 text-left outline-none hover:border-foreground/20 hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <span className="text-sm font-semibold">{nome}</span>
      <span className="mt-0.5 text-xs leading-[17px] text-muted-foreground">{sub}</span>
    </button>
  )
  const linha = (a: (typeof cfg.agentes)[number]) =>
    item(
      a.nome,
      a.formato === "estruturado"
        ? `${regrasDa(a, cfg.regras).length} regras · ${a.gatilho.toLowerCase()}`
        : a.id === "tecnica"
          ? "roda por componente"
          : "instrução em texto",
      () => selecionarAgente(a.id),
      a.id
    )
  return (
    <div>
      {aqui.length > 0 && (
        <>
          {grupo(`Agentes desta página · ${pagina.nome}`)}
          {aqui.map(linha)}
        </>
      )}
      {resto.length > 0 && (
        <>
          {grupo("Outros agentes")}
          {resto.map(linha)}
        </>
      )}
      {grupo("Criar")}
      {item(
        "Criar um agente novo",
        "abre a configuração em branco",
        () => {
          fecharChat()
          abaAtiva("agentes")
          abrirModal({ tipo: "modelos" })
        },
        "criar"
      )}
    </div>
  )
}

function Conversa() {
  const { chat, responderOpcao } = useSim()
  const fim = useRef<HTMLDivElement>(null)
  useEffect(() => {
    fim.current?.scrollIntoView({ block: "end" })
  }, [chat.itens.length])
  return (
    <div className="flex flex-col gap-2.5">
      {chat.sub && <p className="mb-1 text-xs text-muted-foreground">{chat.sub}</p>}
      {chat.itens.map((it) =>
        it.tipo === "msg" ? (
          <Bubble key={it.id} variant={it.quem === "me" ? "default" : "muted"} align={it.quem === "me" ? "end" : "start"} className="max-w-[94%]">
            <BubbleContent
              className={cn(
                "text-[13.5px] leading-5 [&_b]:font-semibold",
                /* o chip da variável continua legível dentro da mensagem enviada */
                it.quem === "me" && "**:data-[slot=token-chip]:bg-primary-foreground/20 **:data-[slot=token-chip]:text-primary-foreground"
              )}
            >
              {it.conteudo}
            </BubbleContent>
          </Bubble>
        ) : (
          <div key={it.id} className="flex flex-wrap gap-2">
            {it.ops.map((op) => (
              <Button key={op.t} variant="outline" size="sm" className="rounded-full shadow-none" onClick={() => responderOpcao(it.id, op)}>
                {op.t}
              </Button>
            ))}
          </div>
        )
      )}
      <div ref={fim} aria-hidden />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* O "+": o que dá para trazer para dentro da pergunta                 */
/* ------------------------------------------------------------------ */

function CabecalhoDoMenu({ titulo, voltar, extra }: { titulo: string; voltar?: () => void; extra?: ReactNode }) {
  return (
    <div className="flex items-center gap-1 px-1 pt-0.5 pb-2">
      {voltar && (
        <Button variant="ghost" size="icon-xs" aria-label="Voltar" onClick={voltar}>
          <ChevronLeftIcon />
        </Button>
      )}
      <span className="min-w-0 flex-1 text-xs font-semibold text-muted-foreground">{titulo}</span>
      {extra}
    </div>
  )
}

const opcaoClasse =
  "block w-full rounded-md px-2 py-1.75 text-left text-[13px] outline-none hover:bg-muted focus-visible:bg-muted"

/** A lista entra por rolagem, carregando o próximo lote quando a pessoa chega no fim. */
function useLotes(total: number, passo: number) {
  const [mostra, setMostra] = useState(passo)
  const [carregando, setCarregando] = useState(false)
  const reiniciar = () => {
    setMostra(passo)
    setCarregando(false)
  }
  const aoRolar = (e: UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    if (carregando || el.scrollTop + el.clientHeight < el.scrollHeight - 24 || mostra >= total) return
    setCarregando(true)
    /* o giro fica à vista enquanto carrega: sem ele a lista parecia ter acabado */
    window.setTimeout(() => {
      setCarregando(false)
      setMostra((m) => m + passo)
    }, 450)
  }
  const rodape =
    total > mostra ? (
      <p className="flex items-center gap-2 px-2 py-2.5 text-[11.5px] text-muted-foreground">
        {carregando ? (
          <>
            <Spinner className="size-3.25" aria-hidden />
            Carregando…
          </>
        ) : (
          "Role para ver mais"
        )}
      </p>
    ) : null
  return { mostra, aoRolar, reiniciar, rodape }
}

function Mencionar({ voltar, fechar }: { voltar: () => void; fechar: () => void }) {
  const { chat, setContextos } = useSim()
  const [busca, setBusca] = useState("")
  const q = busca.trim().toLowerCase()
  const jaEsta = (o: OpcaoDeContexto) => chat.contextos.some((c) => c.id === o.id)
  const bate = (o: OpcaoDeContexto) => !q || `${o.nome} ${o.sub ?? ""}`.toLowerCase().includes(q)
  const livres = LICITACOES_DO_ACERVO.filter((o) => !jaEsta(o) && bate(o))
  const lotes = useLotes(livres.length, 8)
  const grupos = GRUPOS_DE_CONTEXTO.map((g) => ({ ...g, itens: g.itens.filter((o) => !jaEsta(o) && bate(o)) })).filter((g) => g.itens.length)

  const adicionar = (o: OpcaoDeContexto) => {
    setContextos((cs) => [...cs, { id: o.id, nome: o.nome, tipo: o.tipo ?? "licitacao" }])
    fechar()
  }
  const opcao = (o: OpcaoDeContexto) => (
    <button key={o.id} type="button" className={opcaoClasse} onClick={() => adicionar(o)}>
      {o.nome}
      {o.sub && (
        <span className="mt-px block text-[11.5px] leading-4 text-muted-foreground">
          {o.sub}
          {o.quando ? ` · ${o.quando}` : ""}
        </span>
      )}
    </button>
  )
  const titulo = (t: string) => <p className="px-2 pt-2 pb-1 text-xs font-semibold text-muted-foreground">{t}</p>

  return (
    <>
      <CabecalhoDoMenu titulo="Mencionar" voltar={voltar} />
      <Input
        autoFocus
        aria-label="Buscar licitação ou documento"
        placeholder="Buscar..."
        className="mb-1.5 h-8 text-[13px]"
        value={busca}
        onChange={(e) => {
          setBusca(e.target.value)
          lotes.reiniciar()
        }}
      />
      <div className="max-h-63 overflow-y-auto" onScroll={lotes.aoRolar}>
        {grupos.map((g) => (
          <div key={g.grupo}>
            {titulo(g.grupo)}
            {g.itens.map(opcao)}
          </div>
        ))}
        {livres.length > 0 && (
          <>
            {titulo("Licitações")}
            {livres.slice(0, lotes.mostra).map(opcao)}
            {lotes.rodape}
          </>
        )}
        {!grupos.length && !livres.length && <p className="px-2 py-2.5 text-[12.5px] text-muted-foreground">Nada encontrado para esta busca.</p>}
      </div>
    </>
  )
}

/* As variáveis fazem aqui o papel das skills do Notion: são o que a Settle já sabe
   extrair, e entram na pergunta em vez de serem redigitadas. */
function VariaveisDoChat({ voltar, fechar, inserir }: { voltar: () => void; fechar: () => void; inserir: (k: string) => void }) {
  const { cfg, irPara, abaAtiva, abrirModal } = useSim()
  const [busca, setBusca] = useState("")
  const q = busca.trim().toLowerCase()
  const ks = Object.keys(cfg.vars).filter((k) => !q || `${cfg.vars[k].nome} ${cfg.vars[k].desc}`.toLowerCase().includes(q))
  const lotes = useLotes(ks.length, 6)
  /* A conversa continua aberta: a pessoa vai olhar a tabela e voltar para a pergunta. */
  const irParaVariaveis = () => {
    fechar()
    irPara("agentes")
    abaAtiva("variaveis")
  }
  return (
    <>
      <CabecalhoDoMenu
        titulo="Variáveis"
        voltar={voltar}
        extra={
          <>
            <Button variant="ghost" size="xs" className="text-primary" onClick={irParaVariaveis}>
              Ver todas
            </Button>
            <Button
              variant="ghost"
              size="xs"
              className="text-primary"
              onClick={() => {
                irParaVariaveis()
                abrirModal({ tipo: "variavel", k: null })
              }}
            >
              Criar
            </Button>
          </>
        }
      />
      <Input
        autoFocus
        aria-label="Buscar variável"
        placeholder="Buscar variável..."
        className="mb-1.5 h-8 text-[13px]"
        value={busca}
        onChange={(e) => {
          setBusca(e.target.value)
          lotes.reiniciar()
        }}
      />
      <div className="max-h-63 overflow-y-auto" onScroll={lotes.aoRolar}>
        {ks.length ? (
          ks.slice(0, lotes.mostra).map((k) => (
            <button key={k} type="button" className={opcaoClasse} onClick={() => inserir(k)}>
              {cfg.vars[k].nome}
              <span className="mt-px block text-[11.5px] leading-4 text-muted-foreground">
                {cfg.vars[k].tipo} · {cfg.vars[k].desc}
              </span>
            </button>
          ))
        ) : (
          <p className="px-2 py-2.5 text-[12.5px] text-muted-foreground">Nenhuma variável com esse nome.</p>
        )}
        {lotes.rodape}
      </div>
    </>
  )
}

function MenuMais({ inserirVariavel, anexar }: { inserirVariavel: (k: string) => void; anexar: () => void }) {
  const [aberto, setAberto] = useState(false)
  const [tela, setTela] = useState<"raiz" | "mencao" | "variaveis">("raiz")
  const fechar = () => setAberto(false)
  return (
    <Popover
      open={aberto}
      onOpenChange={(o) => {
        setAberto(o)
        if (!o) setTela("raiz")
      }}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon-xs" className="size-7 shadow-none" aria-label="Adicionar contexto">
              <PlusIcon />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Adicionar contexto</TooltipContent>
      </Tooltip>
      <PopoverContent side="top" align="start" className="w-76 gap-0 p-1.5">
        {tela === "raiz" && (
          <div className="flex flex-col">
            {(
              [
                {
                  t: "Anexar arquivo",
                  icone: UploadIcon,
                  faz: () => {
                    fechar()
                    anexar()
                  },
                },
                { t: "Mencionar licitação ou documento", icone: AtSignIcon, faz: () => setTela("mencao") },
                { t: "Variáveis", icone: HashIcon, faz: () => setTela("variaveis") },
              ] as const
            ).map((o) => (
              <button key={o.t} type="button" className={cn(opcaoClasse, "flex items-start gap-2.25")} onClick={o.faz}>
                <o.icone aria-hidden className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1">{o.t}</span>
              </button>
            ))}
          </div>
        )}
        {tela === "mencao" && <Mencionar voltar={() => setTela("raiz")} fechar={fechar} />}
        {tela === "variaveis" && (
          <VariaveisDoChat
            voltar={() => setTela("raiz")}
            fechar={fechar}
            inserir={(k) => {
              fechar()
              inserirVariavel(k)
            }}
          />
        )}
      </PopoverContent>
    </Popover>
  )
}

/* Uma lista só: onde a Settle AI pode procurar. As conexões são as fontes que ainda
   precisam ser ligadas: ligar uma é o que faz uma fonte nova aparecer na lista. */
function MenuFontes({
  fontes,
  setFontes,
  conexoes,
  setConexoes,
}: {
  fontes: FonteIA[]
  setFontes: (f: FonteIA[]) => void
  conexoes: Conexao[]
  setConexoes: (c: Conexao[]) => void
}) {
  const [tela, setTela] = useState<"fontes" | "conexoes">("fontes")
  const filhas = fontes.filter((f) => !f.mestre)
  const ligadas = filhas.filter((f) => f.on).length
  /* nem tudo ligado, nem tudo desligado: o mestre fica no traço */
  const mestre = ligadas === filhas.length ? true : ligadas > 0 ? "indeterminate" : false

  const linha = (id: string, nome: string, sub: string | undefined, marcado: boolean | "indeterminate", aoMudar: (v: boolean) => void) => (
    <label key={id} htmlFor={id} className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.75 hover:bg-muted">
      <span className="min-w-0 flex-1 text-[13px]">
        {nome}
        {sub && <span className="mt-px block text-[11.5px] leading-4 text-muted-foreground">{sub}</span>}
      </span>
      <Checkbox id={id} checked={marcado} onCheckedChange={(v) => aoMudar(v === true)} />
    </label>
  )

  return (
    <Popover onOpenChange={(o) => !o && setTela("fontes")}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon-xs" className="size-7 shadow-none" aria-label="Minhas fontes">
              <SlidersHorizontalIcon />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Minhas fontes</TooltipContent>
      </Tooltip>
      <PopoverContent side="top" align="start" className="w-76 gap-0 p-1.5">
        {tela === "fontes" ? (
          <>
            <CabecalhoDoMenu titulo="Minhas fontes" />
            {fontes.map((f, i) => (
              <div key={f.nome}>
                {linha(`fonte-ia-${i}`, f.nome, f.mestre ? undefined : f.sub, f.mestre ? mestre : f.on, (v) => {
                  if (f.mestre) setFontes(fontes.map((x) => ({ ...x, on: v })))
                  else {
                    const novas = fontes.map((x, j) => (j === i ? { ...x, on: v } : x))
                    setFontes(novas.map((x) => (x.mestre ? { ...x, on: novas.every((y) => y.mestre || y.on) } : x)))
                  }
                })}
                {f.mestre && <Separator className="my-1.5" />}
              </div>
            ))}
            <Separator className="my-1.5" />
            <button type="button" className={cn(opcaoClasse, "flex items-center gap-2.25")} onClick={() => setTela("conexoes")}>
              <PlusIcon aria-hidden className="size-3.5 text-muted-foreground" />
              Adicionar fontes
            </button>
            <p className="px-2 pt-0.5 pb-1.5 text-[11.5px] leading-4 text-muted-foreground">A Settle AI só procura nas fontes marcadas aqui.</p>
          </>
        ) : (
          <>
            <CabecalhoDoMenu titulo="Adicionar fontes" voltar={() => setTela("fontes")} />
            {conexoes.map((c, i) =>
              linha(`conexao-${i}`, c.nome, c.sub, c.on, (v) => {
                setConexoes(conexoes.map((x, j) => (j === i ? { ...x, on: v } : x)))
                setFontes(v ? [...fontes, { nome: c.nome, sub: c.sub, on: true, conexao: c.nome }] : fontes.filter((f) => f.conexao !== c.nome))
                toast(`${c.nome}${v ? " entrou nas fontes" : " saiu das fontes"}`)
              })
            )}
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}

/* ------------------------------------------------------------------ */
/* Rodapé: contexto, campo e ferramentas                               */
/* ------------------------------------------------------------------ */

function RodapeDoChat() {
  const {
    cfg, chat, setContextos, enviarMensagem,
    fontesIA: fontes, setFontesIA: setFontes, conexoes, setConexoes, rascunhoChat, setRascunhoChat,
  } = useSim()
  const campo = useRef<TokenFieldHandle>(null)
  const arquivo = useRef<HTMLInputElement>(null)
  const getToken = (k: string) => tokenDaVar(k, cfg.vars, cfg.varsEx)

  const enviar = () => {
    const valor = campo.current?.getValue() ?? ""
    if (!valor.replace(/ /g, " ").trim()) return
    /* A mensagem enviada mantém os chips: quem lê depois vê de qual variável a pergunta falava. */
    enviarMensagem(<TokenText value={valor.trim()} getToken={getToken} />)
    campo.current?.clear()
  }

  return (
    <form
      className="flex shrink-0 flex-col gap-2 border-t px-4 py-3"
      onSubmit={(e) => {
        e.preventDefault()
        enviar()
      }}
    >
      {/* O contexto em que a pergunta vai ser feita: a página entra sozinha; o "+" acrescenta outras. */}
      {chat.contextos.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Contexto da conversa">
          {chat.contextos.map((c, i) => {
            const Icone = ICONE_DO_CONTEXTO[c.tipo] ?? FileTextIcon
            return (
              <li
                key={`${c.id}-${i}`}
                title={c.auto ? "A página em que você está" : undefined}
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
      {/* O campo aceita chip de variável: por isso é um campo de tokens, e não um input. */}
      <TokenField
        ref={campo}
        singleLine
        trigger={null}
        aria-label="Mensagem para a Settle AI"
        placeholder="Pergunte qualquer coisa"
        getToken={getToken}
        defaultValue={rascunhoChat}
        onValueChange={setRascunhoChat}
        onSubmit={enviar}
      />
      {/* A barra de ferramentas mora ao lado do campo: é ali que a pessoa decide com o que a pergunta vai ser respondida. */}
      <div className="flex items-center gap-1.5">
        <MenuMais inserirVariavel={(k) => campo.current?.insertToken(k)} anexar={() => arquivo.current?.click()} />
        <MenuFontes fontes={fontes} setFontes={setFontes} conexoes={conexoes} setConexoes={setConexoes} />
        <Button type="submit" size="sm" className="ml-auto">
          Enviar
        </Button>
        {/* Anexar é o seletor do sistema: o arquivo escolhido vira um chip de contexto como qualquer outro. */}
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

/* ------------------------------------------------------------------ */
/* A janela                                                            */
/* ------------------------------------------------------------------ */

function ConteudoDoChat({ cheio = false }: { cheio?: boolean }) {
  const { cfg, chat } = useSim()
  const an = chat.agenteId ? cfg.agentes.find((a) => a.id === chat.agenteId) : null
  const titulo = chat.visao === "lista" ? "Agentes" : an ? an.nome : "Converse com a Settle AI"
  const vazia = chat.visao === "conversa" && !chat.agenteId && !chat.itens.length
  const largura = cheio ? "mx-auto w-full max-w-180" : ""
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <CabecalhoDoChat titulo={titulo} />
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3.5">
        <div className={largura}>{chat.visao === "lista" ? <ListaDeAgentesDoChat /> : vazia ? <ConversaVazia /> : <Conversa />}</div>
      </div>
      {/* na lista de agentes não há campo: escolher com quem falar vem antes */}
      {chat.visao === "conversa" && (
        <div className={largura}>
          <RodapeDoChat />
        </div>
      )}
    </div>
  )
}

/** A conversa como coluna do layout: empurra a tela inteira, cabeçalho junto, em vez de cobrir. */
export function ChatLateral() {
  const { chat } = useSim()
  const aberto = chat.aberto && chat.modo === "lateral"
  return (
    <DockedPanel open={aberto} width={30} aria-label="Settle AI" className="sticky top-0 h-svh min-h-0 self-start">
      {aberto && <ConteudoDoChat />}
    </DockedPanel>
  )
}

/**
 * O botão fica: com a janela flutuando acima dele, ele vira o interruptor de abrir e
 * fechar. Com o painel de resultado aberto, ele (e a janela) se afastam para o lado.
 */
export function SettleAI() {
  const { chat, painel, abrirChat, fecharChat } = useSim()
  const flutuante = chat.aberto && chat.modo === "flutuante"
  const cheio = chat.aberto && chat.modo === "cheio"
  const escondido = chat.aberto && chat.modo !== "flutuante"

  return (
    <>
      <Popover open={flutuante}>
        <PopoverAnchor asChild>
          <Button
            size="lg"
            aria-expanded={chat.aberto}
            onClick={() => (chat.aberto ? fecharChat() : abrirChat())}
            className={cn(
              "fixed right-6 bottom-6 h-11 rounded-full px-4.5 text-sm font-semibold shadow-lg transition-[right] duration-200",
              escondido && "hidden",
              painel?.lado && "min-[901px]:right-[calc(30vw+1.5rem)]",
              painel && !painel.lado && "min-[1000px]:right-[464px]"
            )}
          >
            <BotIcon data-icon="inline-start" />
            Settle AI
          </Button>
        </PopoverAnchor>
        {/* Janela flutuante ancorada no botão, não uma gaveta: acompanha a pessoa em qualquer
            tela sem empurrar o conteúdo. Não fecha com clique fora nem com Esc: sai pelo X ou
            pelo botão. Volta para a frente quando outra janela abre (camada). */}
        <PopoverContent
          key={chat.camada}
          side="top"
          align="end"
          sideOffset={16}
          aria-label="Settle AI"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
          className="flex max-h-[min(640px,calc(100svh-124px))] w-[424px] max-w-[calc(100vw-2rem)] flex-col gap-0 overflow-hidden rounded-[14px] p-0 shadow-xl"
        >
          <ConteudoDoChat />
        </PopoverContent>
      </Popover>

      <Dialog open={cheio} onOpenChange={(o) => !o && fecharChat()}>
        <DialogContent size="full" showCloseButton={false} aria-describedby={undefined}>
          <DialogTitle className="sr-only">Settle AI</DialogTitle>
          <ConteudoDoChat cheio />
        </DialogContent>
      </Dialog>
    </>
  )
}
