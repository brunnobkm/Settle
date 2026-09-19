// Card canônico da licitação em andamento: lista vertical de propriedades (padrão Notion).
// Regra mestra (§4): clicar exatamente num componente (chip, pill, data, valor) edita;
// clicar em qualquer outra área abre o painel de detalhe.

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react"
import { createPortal } from "react-dom"
import { CircleAlertIcon, ClockIcon, EllipsisIcon, LinkIcon, Trash2Icon } from "lucide-react"

import { cn } from "@/lib/utils"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  LicitacaoCardHoverActions,
  LicitacaoCardIconAction,
  LicitacaoCardRoot,
  LicitacaoCardSegments,
  LicitacaoCardSelect,
  LicitacaoCardStatusButton,
  LicitacaoCardTitle,
} from "@/components/ui/licitacao-card"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

import {
  categoriaDoSegmento,
  DICAS,
  formatarData,
  formatarMoeda,
  pessoaPorId,
  statusPorId,
  TIPOS,
  urgenciaDaData,
  type ChavePropriedade,
  type Licitacao,
  type PropriedadeDemo,
} from "./dados"
import {
  CalendarioData,
  CampoValor,
  CHIP_SEGMENTO,
  ChipPessoa,
  EditorStatus,
  ListaPessoas,
  ListaSegmentos,
  PopoverEditor,
} from "./editores"
import { ConteudoDemo, editorDaDemo } from "./PropriedadesDemo"

const LIMIAR_ARRASTE = 4 // px antes de considerar arraste
const EASING = "cubic-bezier(.2, .9, .3, 1)"

/** Alvo de edição: fundo cinza sutil no hover (textos e dicas de vazio). */
export const ALVO_TEXTO =
  "rounded-sm outline-none hover:bg-foreground/6 focus-visible:ring-3 focus-visible:ring-ring/50"
/** Dica de propriedade vazia. */
export const DICA_VAZIA = "text-muted-foreground"

const ehInterativo = (alvo: EventTarget | null) =>
  alvo instanceof Element && !!alvo.closest("button, a, input, textarea, select, [role=checkbox], [data-sem-detalhe]")

type Props = {
  licitacao: Licitacao
  onChange: (patch: Partial<Licitacao>) => void
  segmentosDisponiveis: string[]
  onCriarSegmento: (nome: string) => void
  demos: PropriedadeDemo[]
  onChangeDemo: (id: string, valor: unknown) => void
  onRemoverDemo: (id: string) => void
  /** Ordem das propriedades abaixo do título (chaves fixas e ids das demos). */
  ordem: string[]
  onOrdem: (ordem: string[]) => void
  selecionado: boolean
  onSelecionado: (selecionado: boolean) => void
  /** Popover aberto: chave da propriedade, id da demo ou "menu". */
  editando: string | null
  setEditando: (chave: string | null) => void
  /** Demo em edição de texto na própria linha. */
  editandoInline: string | null
  setEditandoInline: (id: string | null) => void
  onAbrirDetalhe: () => void
  onCopiarLink: () => void
  onDescartar: () => void
  /** Painel de detalhe ou diálogo aberto: sem dicas nem prévia do objeto. */
  sobreposto?: boolean
}

export function CardLicitacao(props: Props) {
  const {
    licitacao: l,
    onChange,
    ordem,
    onOrdem,
    selecionado,
    onSelecionado,
    editando,
    setEditando,
    editandoInline,
    setEditandoInline,
    demos,
  } = props

  const [arrastando, setArrastando] = useState<string | null>(null)
  const [fantasma, setFantasma] = useState<{ chave: string; x: number; y: number; w: number; h: number } | null>(null)
  const [previaObjeto, setPreviaObjeto] = useState(false)
  const linhas = useRef(new Map<string, HTMLDivElement>())
  const fantasmaRef = useRef<HTMLDivElement>(null)
  const ordemRef = useRef(ordem)
  const flip = useRef<Map<string, number> | null>(null)
  const acabouDeArrastar = useRef(false)

  ordemRef.current = ordem
  const semDicas = !!arrastando || !!props.sobreposto
  const status = statusPorId(l.status)
  const abrir = (chave: string) => (open: boolean) => setEditando(open ? chave : null)

  /* ---------------- FLIP: vizinhos deslizam até a nova posição ---------------- */

  useLayoutEffect(() => {
    const antes = flip.current
    if (!antes) return
    flip.current = null
    antes.forEach((topo, chave) => {
      const el = linhas.current.get(chave)
      if (!el) return
      el.getAnimations().forEach((a) => a.cancel())
      const dy = topo - el.getBoundingClientRect().top
      if (dy) el.animate([{ translate: `0 ${dy}px` }, { translate: "0 0" }], { duration: 200, easing: EASING })
    })
  }, [ordem])

  /* ---------------- arraste das propriedades ---------------- */

  function reordenar(chave: string, y: number) {
    const atual = ordemRef.current
    const outras = atual.filter((k) => k !== chave)
    let alvo = outras.length
    for (let i = 0; i < outras.length; i++) {
      const r = linhas.current.get(outras[i])?.getBoundingClientRect()
      if (r && y < r.top + r.height / 2) {
        alvo = i
        break
      }
    }
    const nova = [...outras.slice(0, alvo), chave, ...outras.slice(alvo)]
    if (nova.join("|") === atual.join("|")) return
    flip.current = new Map(
      outras.map((k) => [k, linhas.current.get(k)?.getBoundingClientRect().top ?? 0] as const)
    )
    ordemRef.current = nova
    onOrdem(nova)
  }

  function finalizarArraste(chave: string) {
    const linha = linhas.current.get(chave)
    const g = fantasmaRef.current
    if (linha && g) {
      // o fantasma volta para o lugar reservado antes de sumir
      const r = linha.getBoundingClientRect()
      g.style.transition = `left 160ms ${EASING}, top 160ms ${EASING}, rotate 160ms ease`
      g.style.left = `${r.left}px`
      g.style.top = `${r.top}px`
      g.style.rotate = "0deg"
    }
    acabouDeArrastar.current = true
    window.setTimeout(() => {
      setFantasma(null)
      setArrastando(null)
      document.body.style.cursor = ""
    }, 160)
    window.setTimeout(() => (acabouDeArrastar.current = false), 210)
  }

  function aoPressionar(chave: string) {
    return (e: ReactPointerEvent<HTMLDivElement>) => {
      if (e.button !== 0 || ehInterativo(e.target)) return
      if (editando === chave || editandoInline === chave) return
      const linha = e.currentTarget
      const inicio = { x: e.clientX, y: e.clientY }
      let deslocamento = { x: 0, y: 0 }
      let ativo = false

      const mover = (ev: PointerEvent) => {
        if (!ativo) {
          if (Math.abs(ev.clientX - inicio.x) <= LIMIAR_ARRASTE && Math.abs(ev.clientY - inicio.y) <= LIMIAR_ARRASTE) return
          ativo = true
          const r = linha.getBoundingClientRect()
          deslocamento = { x: inicio.x - r.left, y: inicio.y - r.top }
          setEditando(null)
          setPreviaObjeto(false)
          setFantasma({ chave, x: ev.clientX - deslocamento.x, y: ev.clientY - deslocamento.y, w: r.width, h: r.height })
          setArrastando(chave)
          document.body.style.cursor = "grabbing"
          window.getSelection()?.removeAllRanges()
        }
        ev.preventDefault()
        const g = fantasmaRef.current
        if (g) {
          g.style.left = `${ev.clientX - deslocamento.x}px`
          g.style.top = `${ev.clientY - deslocamento.y}px`
        }
        reordenar(chave, ev.clientY)
      }
      const soltar = () => {
        window.removeEventListener("pointermove", mover)
        window.removeEventListener("pointerup", soltar)
        window.removeEventListener("pointercancel", soltar)
        if (ativo) finalizarArraste(chave)
      }
      window.addEventListener("pointermove", mover)
      window.addEventListener("pointerup", soltar)
      window.addEventListener("pointercancel", soltar)
    }
  }

  /* ---------------- clique e teclado no card ---------------- */

  function aoClicarNoCard(e: MouseEvent<HTMLDivElement>) {
    if (acabouDeArrastar.current) return
    // cliques dentro dos popovers (portal) sobem pela árvore do React: ignora
    if (!e.currentTarget.contains(e.target as Node)) return
    if (ehInterativo(e.target)) return
    props.onAbrirDetalhe()
  }

  function aoTeclarNoCard(e: KeyboardEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget) return
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      props.onAbrirDetalhe()
    } else if (e.key.toLowerCase() === "a" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      onSelecionado(!selecionado)
    }
  }

  /* ---------------- conteúdo de cada propriedade ---------------- */

  function conteudo(chave: string): ReactNode {
    switch (chave) {
      case "codigoEdital":
        return (
          <>
            Edital{" "}
            {l.codigoEdital ? (
              <span className="font-mono">{l.codigoEdital}</span>
            ) : (
              <span className={DICA_VAZIA}>sem número</span>
            )}
          </>
        )

      case "segmentos": {
        const abrirSegmentos = () => setEditando("segmentos")
        return (
          <PopoverEditor
            ancora
            open={editando === "segmentos"}
            onOpenChange={abrir("segmentos")}
            gatilho={
              l.segmentos.length ? (
                <LicitacaoCardSegments
                  aria-label="Segmentos"
                  className="min-h-5.5 items-center"
                  segments={l.segmentos.map((s) => ({
                    label: s,
                    category: categoriaDoSegmento(s, props.segmentosDisponiveis),
                    className: CHIP_SEGMENTO,
                    "aria-label": `Segmento ${s}. Editar segmentos`,
                    "aria-haspopup": "dialog",
                    "aria-expanded": editando === "segmentos",
                    onClick: abrirSegmentos,
                  }))}
                />
              ) : (
                <button
                  type="button"
                  aria-haspopup="dialog"
                  aria-expanded={editando === "segmentos"}
                  onClick={abrirSegmentos}
                  className={cn("inline-flex min-h-5.5 items-center text-left", ALVO_TEXTO)}
                >
                  <span className={cn("text-xs", DICA_VAZIA)}>Adicionar segmento</span>
                </button>
              )
            }
          >
            <ListaSegmentos
              selecionados={l.segmentos}
              disponiveis={props.segmentosDisponiveis}
              onAlternar={(s) =>
                onChange({
                  segmentos: l.segmentos.includes(s) ? l.segmentos.filter((x) => x !== s) : [...l.segmentos, s],
                })
              }
              onCriar={(nome) => {
                props.onCriarSegmento(nome)
                onChange({ segmentos: [...l.segmentos, nome] })
              }}
            />
          </PopoverEditor>
        )
      }

      case "orgao":
        return l.orgao ? (
          <span className="line-clamp-2 font-semibold break-words">{l.orgao}</span>
        ) : (
          <span className={DICA_VAZIA}>Vazio</span>
        )

      case "objeto":
        return l.objeto ? (
          <HoverCard open={previaObjeto && !semDicas} onOpenChange={setPreviaObjeto} openDelay={250} closeDelay={0}>
            <HoverCardTrigger asChild>
              <span className="line-clamp-3 leading-snug">{l.objeto}</span>
            </HoverCardTrigger>
            <HoverCardContent
              align="start"
              sideOffset={0}
              collisionPadding={8}
              className="w-75 max-w-[92vw] rounded-lg px-3 py-2.5 text-xs leading-[1.55]"
            >
              {l.objeto}
            </HoverCardContent>
          </HoverCard>
        ) : (
          <span className={DICA_VAZIA}>Vazio</span>
        )

      case "status":
        return (
          <div className="flex min-h-5.5 items-center">
            <EditorStatus
              open={editando === "status"}
              onOpenChange={abrir("status")}
              valor={l.status}
              onChange={(v) => {
                onChange({ status: v })
                setEditando(null)
              }}
            >
              {status ? (
                <LicitacaoCardStatusButton
                  tone={status.tom}
                  size="xs"
                  aria-label={`Status: ${status.rotulo}. Alterar`}
                  // medidas da pill do original (2px 8px, raio 4px)
                  className="h-auto rounded-sm px-2 py-0.5 leading-[1.4]"
                >
                  {status.rotulo}
                </LicitacaoCardStatusButton>
              ) : (
                <button type="button" aria-label="Definir status" className={ALVO_TEXTO}>
                  <span className={cn("text-xs", DICA_VAZIA)}>Definir status</span>
                </button>
              )}
            </EditorStatus>
          </div>
        )

      case "responsaveis": {
        const pessoas = l.responsaveis.map(pessoaPorId).filter((p) => !!p)
        return (
          <PopoverEditor
            open={editando === "responsaveis"}
            onOpenChange={abrir("responsaveis")}
            gatilho={
              <button
                type="button"
                aria-label={
                  pessoas.length ? `Responsáveis: ${pessoas.map((p) => p.nome).join(", ")}. Editar` : "Sem responsáveis. Atribuir"
                }
                className={cn(
                  "inline-flex max-w-full flex-wrap items-center gap-1 text-left",
                  pessoas.length ? "rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50" : ALVO_TEXTO
                )}
              >
                {pessoas.length ? (
                  pessoas.map((p) => (
                    <ChipPessoa key={p.id} nome={p.nome} className="transition-[filter] duration-120 hover:brightness-[.92]" />
                  ))
                ) : (
                  <span className={cn("text-xs", DICA_VAZIA)}>Sem responsáveis</span>
                )}
              </button>
            }
          >
            <ListaPessoas
              selecionados={l.responsaveis}
              onAlternar={(id) =>
                onChange({
                  responsaveis: l.responsaveis.includes(id)
                    ? l.responsaveis.filter((x) => x !== id)
                    : [...l.responsaveis, id],
                })
              }
            />
          </PopoverEditor>
        )
      }

      case "dataEnvio": {
        const urgencia = l.dataEnvio ? urgenciaDaData(l.dataEnvio) : null
        const aviso =
          urgencia?.tom === "hoje"
            ? "envio hoje"
            : urgencia?.tom === "semana"
              ? `faltam ${urgencia.dias} ${urgencia.dias === 1 ? "dia" : "dias"}`
              : null
        return (
          <PopoverEditor
            open={editando === "dataEnvio"}
            onOpenChange={abrir("dataEnvio")}
            className="min-w-60"
            gatilho={
              <button
                type="button"
                aria-label={
                  l.dataEnvio
                    ? `Data de envio da proposta: ${formatarData(l.dataEnvio)}${aviso ? `, ${aviso}` : ""}. Alterar`
                    : "Definir data de envio da proposta"
                }
                className={cn(
                  ALVO_TEXTO,
                  "inline-flex items-center gap-1 tabular-nums [&>svg]:size-3.5",
                  urgencia?.tom === "hoje" && "font-medium text-destructive",
                  urgencia?.tom === "semana" && "font-medium text-warning-strong"
                )}
              >
                {urgencia?.tom === "hoje" && <CircleAlertIcon aria-hidden />}
                {urgencia?.tom === "semana" && <ClockIcon aria-hidden />}
                {l.dataEnvio ? formatarData(l.dataEnvio) : <span className={DICA_VAZIA}>Definir data</span>}
              </button>
            }
          >
            <CalendarioData
              valor={l.dataEnvio}
              onEscolher={(iso) => {
                onChange({ dataEnvio: iso })
                setEditando(null)
              }}
              onLimpar={() => {
                onChange({ dataEnvio: null })
                setEditando(null)
              }}
            />
          </PopoverEditor>
        )
      }

      case "cidade":
        return l.cidade ? `${l.cidade} • ${l.estado}` : <span className={DICA_VAZIA}>Vazio</span>

      case "valor":
        return (
          <PopoverEditor
            open={editando === "valor"}
            onOpenChange={abrir("valor")}
            className="min-w-60"
            gatilho={
              <button
                type="button"
                aria-label={l.valorGlobal != null ? `Valor global: ${formatarMoeda(l.valorGlobal)}. Editar` : "Definir valor global"}
                className={cn(ALVO_TEXTO, "tabular-nums")}
              >
                {l.valorGlobal != null ? formatarMoeda(l.valorGlobal) : <span className={DICA_VAZIA}>Vazio</span>}
              </button>
            }
          >
            <CampoValor
              autoFocus
              valor={l.valorGlobal}
              onSalvar={(v) => onChange({ valorGlobal: v })}
              onConcluir={() => setEditando(null)}
            />
          </PopoverEditor>
        )
    }

    const demo = demos.find((d) => d.id === chave)
    if (!demo) return null
    return (
      <ConteudoDemo
        demo={demo}
        editando={editando === demo.id}
        onEditando={abrir(demo.id)}
        editandoInline={editandoInline === demo.id}
        onFimInline={() => setEditandoInline(null)}
        onChange={(v) => props.onChangeDemo(demo.id, v)}
        onRemover={() => props.onRemoverDemo(demo.id)}
      />
    )
  }

  /* ---------------- linha ---------------- */

  function linha(chave: string) {
    const demo = demos.find((d) => d.id === chave)
    const editor = demo ? editorDaDemo(demo) : undefined
    const emEdicao = editando === chave || editandoInline === chave
    const dica = demo ? TIPOS[demo.tipo].rotulo : DICAS[chave as ChavePropriedade]

    return (
      <LinhaPropriedade
        key={chave}
        chave={chave}
        dica={dica}
        emEdicao={emEdicao}
        reservada={arrastando === chave}
        semDica={semDicas}
        registrar={(el) => {
          if (el) linhas.current.set(chave, el)
          else linhas.current.delete(chave)
        }}
        onPointerDown={aoPressionar(chave)}
        onClick={
          demo && editor && !emEdicao
            ? (e) => {
                // demo editável: clicar em qualquer ponto da linha edita (como no original)
                if (acabouDeArrastar.current || ehInterativo(e.target)) return
                e.stopPropagation()
                if (editor === "alternar") props.onChangeDemo(demo.id, !demo.valor)
                else if (editor === "texto" || editor === "numero" || editor === "botao") {
                  setEditando(null)
                  setEditandoInline(demo.id)
                } else setEditando(demo.id)
              }
            : undefined
        }
        className={cn(
          chave === "orgao" && "leading-snug",
          demo && "pr-7",
          demo && editor && "cursor-pointer"
        )}
      >
        {conteudo(chave)}
      </LinhaPropriedade>
    )
  }

  const statusTexto = status?.rotulo ?? "sem status"
  const valorTexto = l.valorGlobal != null ? formatarMoeda(l.valorGlobal) : "sem valor"

  return (
    <>
      <LicitacaoCardRoot
        role="group"
        aria-roledescription="card"
        aria-label={`Licitação Edital ${l.codigoEdital || "sem número"}, status ${statusTexto}, valor ${valorTexto}, cidade ${l.cidade || "não informada"}`}
        tabIndex={0}
        data-selecionado={selecionado || undefined}
        onClick={aoClicarNoCard}
        onKeyDown={aoTeclarNoCard}
        className={cn(
          "relative w-[342px] cursor-pointer gap-0.5 overflow-visible rounded-xl p-2.5 shadow-none ring-border outline-none",
          "origin-center transition duration-150 ease-out hover:scale-[1.005]",
          "focus-visible:ring-3 focus-visible:ring-ring/50",
          selecionado && "ring-primary",
          arrastando && "cursor-grabbing"
        )}
      >
        {/* Título: sempre no topo, não é reordenável; hover revela a seleção (§8) */}
        <LinhaPropriedade
          chave="titulo"
          dica={DICAS.titulo}
          semDica={semDicas}
          // o hover da linha do título revela a caixa de seleção
          className="group/licitacao-card-select"
        >
          <div className="flex items-start">
            <LicitacaoCardSelect
              reveal="hover"
              label="Selecionar card"
              checked={selecionado}
              onCheckedChange={(v) => onSelecionado(v === true)}
              className={cn("mt-px size-4", arrastando && "hidden")}
            />
            <LicitacaoCardTitle size="sm" lines={2}>
              {l.titulo || <span className={DICA_VAZIA}>Sem título</span>}
            </LicitacaoCardTitle>
          </div>
        </LinhaPropriedade>

        {ordem.map(linha)}

        {/* Ações flutuantes: aparecem no hover do card (§7). Vêm depois das linhas para ficar por cima delas */}
        <LicitacaoCardHoverActions data-sem-detalhe className={cn(arrastando && "hidden")}>
          <LicitacaoCardIconAction label="Copiar link" icon={<LinkIcon />} variant="ghost" onClick={props.onCopiarLink} />
          <DropdownMenu open={editando === "menu"} onOpenChange={abrir("menu")} modal={false}>
            <DropdownMenuTrigger asChild>
              <LicitacaoCardIconAction label="Mais opções" icon={<EllipsisIcon />} variant="ghost" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" collisionPadding={8} className="min-w-40 rounded-[10px] p-1.5">
              <DropdownMenuGroup>
                <DropdownMenuItem variant="destructive" onSelect={props.onDescartar}>
                  <Trash2Icon />
                  Descartar
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </LicitacaoCardHoverActions>
      </LicitacaoCardRoot>

      {/* Fantasma que segue o cursor durante o arraste */}
      {fantasma &&
        createPortal(
          <div
            ref={fantasmaRef}
            aria-hidden
            inert
            className="pointer-events-none fixed rotate-[.5deg] cursor-grabbing rounded-lg border bg-card px-2 py-1.5 text-[13px] leading-[1.4] text-card-foreground shadow-lg"
            style={{ left: fantasma.x, top: fantasma.y, width: fantasma.w, height: fantasma.h }}
          >
            {conteudo(fantasma.chave)}
          </div>,
          document.body
        )}
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Linha de propriedade                                                */
/* ------------------------------------------------------------------ */

function LinhaPropriedade({
  chave,
  dica,
  emEdicao,
  reservada,
  semDica,
  registrar,
  onPointerDown,
  onClick,
  className,
  children,
}: {
  chave: string
  dica: string
  emEdicao?: boolean
  /** Lugar reservado da linha que está sendo arrastada. */
  reservada?: boolean
  semDica?: boolean
  registrar?: (el: HTMLDivElement | null) => void
  onPointerDown?: (e: ReactPointerEvent<HTMLDivElement>) => void
  onClick?: (e: MouseEvent<HTMLDivElement>) => void
  className?: string
  children: ReactNode
}) {
  const [dicaAberta, setDicaAberta] = useState(false)
  // painel, diálogo ou arraste por cima: fecha a dica para ela não voltar sozinha depois
  useEffect(() => {
    if (semDica) setDicaAberta(false)
  }, [semDica])

  return (
    <Tooltip open={dicaAberta && !semDica && !emEdicao} onOpenChange={setDicaAberta} delayDuration={250}>
      <TooltipTrigger asChild>
        <div
          ref={registrar}
          data-propriedade={chave}
          data-em-edicao={emEdicao || undefined}
          onPointerDown={onPointerDown}
          onClick={onClick}
          className={cn(
            "group/linha relative min-w-0 rounded-md px-2 py-1.5 text-[13px] leading-[1.4] text-foreground select-none",
            "data-em-edicao:bg-muted",
            reservada && "bg-foreground/5 *:invisible",
            className
          )}
        >
          {children}
        </div>
      </TooltipTrigger>
      <TooltipContent side="left" sideOffset={8}>
        {dica}
      </TooltipContent>
    </Tooltip>
  )
}
