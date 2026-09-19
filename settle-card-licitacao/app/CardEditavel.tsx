// Card de licitação com edição inline por tipo de propriedade.
// Clicar num alvo de edição (número do edital, segmentos, porte, lápis) edita; clicar em
// qualquer outra área do card abre o edital (simulado por aviso).

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react"
import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  BookmarkIcon,
  CheckIcon,
  CircleAlertIcon,
  ClockIcon,
  ExternalLinkIcon,
  FolderIcon,
  GaugeIcon,
  GlobeIcon,
  LinkIcon,
  RefreshCwIcon,
  Share2Icon,
  SquareCheckIcon,
  SquareIcon,
} from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  LicitacaoCardActions,
  LicitacaoCardAvatars,
  LicitacaoCardContent,
  LicitacaoCardDescription,
  LicitacaoCardField,
  LicitacaoCardHeader,
  LicitacaoCardIconAction,
  LicitacaoCardIconActions,
  LicitacaoCardRoot,
  LicitacaoCardSegments,
  LicitacaoCardSelect,
  LicitacaoCardTitle,
  LicitacaoCardValue,
} from "@/components/ui/licitacao-card"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

import {
  LINKS_DAS_PROPRIEDADES,
  ORDEM_DATAS,
  PORTES,
  RESPONSAVEIS,
  SEGMENTOS,
  cidadesDoEstado,
  configDoCampo,
  dicaDeVazio,
  estaVazio,
  formatarPorTipo,
  licitacaoInicial,
  opcoesDoCampo,
  ordemDoGrid,
  temTrecho,
  urgenciaDoPrazo,
  valorDaPropriedade,
  type LinkDoEdital,
  type Licitacao,
  type Propriedade,
} from "./dados"
import { ALVO_EDITAVEL, AcoesDaPropriedade, EditorDeData, EditorDeSelecao, EntradaNaLinha } from "./editores"

const ehInterativo = (alvo: EventTarget | null) =>
  alvo instanceof Element &&
  !!alvo.closest("button, a, input, textarea, [role=checkbox], [role=menuitem], [data-sem-detalhe]")

function DivisorVertical() {
  return <Separator orientation="vertical" className="data-vertical:h-6 data-vertical:self-center" />
}

export function CardEditavel({ linksDoEdital }: { linksDoEdital: LinkDoEdital[] }) {
  const [l, setL] = useState<Licitacao>(licitacaoInicial)
  const [selecionado, setSelecionado] = useState(false)
  /** Propriedade em edição (texto na linha ou popover aberto). */
  const [editando, setEditando] = useState<string | null>(null)
  // clique que só fecha um editor não abre o edital
  const fechouEm = useRef(0)

  const encerrarEdicao = useCallback(() => {
    fechouEm.current = Date.now()
    setEditando(null)
  }, [])
  const abrirPopover = (chave: string) => (open: boolean) => (open ? setEditando(chave) : encerrarEdicao())

  /* ---------------- estado ---------------- */

  function valorDe(chave: string, escopo: Escopo) {
    if (escopo === "props") return valorDaPropriedade(l, chave)
    if (escopo === "datas") return l.datas.find((d) => d.chave === chave)?.valor ?? ""
    return String(l[chave as keyof Licitacao] ?? "")
  }

  function gravar(chave: string, escopo: Escopo, valor: string) {
    setL((atual) => {
      if (escopo === "datas") {
        return { ...atual, datas: atual.datas.map((d) => (d.chave === chave ? { ...d, valor } : d)) }
      }
      if (escopo === "props") {
        let props = atual.props.map((p) => (p.chave === chave ? { ...p, valor } : p))
        // Cidade depende do Estado: se a cidade atual não é da nova UF, fica vazia
        if (chave === "estado") {
          const cidade = props.find((p) => p.chave === "cidade")
          if (cidade && !cidadesDoEstado(valor).includes(cidade.valor)) {
            props = props.map((p) => (p.chave === "cidade" ? { ...p, valor: "" } : p))
          }
        }
        return { ...atual, props }
      }
      return { ...atual, [chave]: valor }
    })
  }

  /* ---------------- ações ---------------- */

  function copiar(chave: string, escopo: Escopo) {
    const valor = valorDe(chave, escopo)
    navigator.clipboard?.writeText(valor).catch(() => {})
    toast(`Copiado: ${valor.length > 40 ? valor.slice(0, 40) + "…" : valor}`, {
      icon: <CheckIcon className="size-4" />,
    })
  }

  function abrirTrecho(chave: string, rotulo: string) {
    toast(temTrecho(chave) ? `Abrindo o edital no trecho de "${rotulo}"…` : `Sem trecho vinculado para "${rotulo}"`, {
      icon: <ArrowUpRightIcon className="size-4" />,
    })
  }

  function selecionar(marcado: boolean) {
    setSelecionado(marcado)
    toast(marcado ? "Card selecionado" : "Seleção removida", {
      icon: marcado ? <SquareCheckIcon className="size-4" /> : <SquareIcon className="size-4" />,
    })
  }

  const abrirLink = (link: LinkDoEdital) =>
    toast(`Abrindo: ${link.rotulo} …`, { icon: <ExternalLinkIcon className="size-4" /> })

  const abrirEdital = () =>
    toast(`Abrindo edital ${l.numero} …`, { icon: <ArrowRightIcon className="size-4" /> })

  function aoClicarNoCard(e: MouseEvent<HTMLDivElement>) {
    // cliques dentro dos popovers (portal) sobem pela árvore do React: ignora
    if (!e.currentTarget.contains(e.target as Node)) return
    if (ehInterativo(e.target) || Date.now() - fechouEm.current < 400) return
    abrirEdital()
  }

  function aoTeclarNoCard(e: KeyboardEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget) return
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      abrirEdital()
    }
  }

  /* ---------------- valor editável ---------------- */

  /**
   * Valor de uma propriedade no lugar certo: texto (ou input na edição), âncora do popover
   * para select e data, link para o Portal de disputa.
   */
  function valorEditavel({
    chave,
    rotulo,
    escopo,
    className,
    classeEntrada,
    exibir,
  }: {
    chave: string
    rotulo: string
    escopo: Escopo
    className?: string
    classeEntrada?: string
    exibir?: ReactNode
  }) {
    const config = configDoCampo(chave)
    const valor = valorDe(chave, escopo)
    const vazio = estaVazio(valor)
    const conteudo = vazio ? <span className="text-muted-foreground/70">{dicaDeVazio(config.tipo)}</span> : (exibir ?? valor)

    if (editando === chave && (config.tipo === "text" || config.tipo === "textarea" || config.tipo === "number" || config.tipo === "currency")) {
      return (
        <EntradaNaLinha
          valor={vazio ? "" : valor}
          rotulo={rotulo}
          multilinha={config.tipo === "textarea"}
          onSalvar={(v) => {
            gravar(chave, escopo, formatarPorTipo(v, config.tipo))
            encerrarEdicao()
          }}
          onCancelar={encerrarEdicao}
          className={classeEntrada}
        />
      )
    }

    const texto = (
      <span
        data-campo={chave}
        title={!vazio && valor.length > 24 ? valor : undefined}
        className={cn(editando === chave && "bg-foreground/6", editando === chave && ALVO_EDITAVEL, className)}
      >
        {conteudo}
      </span>
    )

    if (config.tipo === "select") {
      return (
        <EditorDeSelecao
          open={editando === chave}
          onOpenChange={abrirPopover(chave)}
          ancora={texto}
          rotulo={rotulo}
          opcoes={opcoesDoCampo(config, l)}
          selecionadas={[valor]}
          busca={config.busca}
          onEscolher={(v) => {
            gravar(chave, escopo, v)
            encerrarEdicao()
          }}
        />
      )
    }
    if (config.tipo === "date") {
      return (
        <EditorDeData
          open={editando === chave}
          onOpenChange={abrirPopover(chave)}
          ancora={texto}
          valor={valor}
          onEscolher={(v) => {
            gravar(chave, escopo, v)
            encerrarEdicao()
          }}
        />
      )
    }
    return texto
  }

  /* ---------------- propriedade da grade (datas e informações) ---------------- */

  function campo(p: Propriedade, escopo: "datas" | "props") {
    const config = configDoCampo(p.chave)
    const editavel = config.tipo !== "readonly"
    const href = LINKS_DAS_PROPRIEDADES[p.chave]
    const urgencia = p.chave === "envio" ? urgenciaDoPrazo(p.valor) : null
    const aviso =
      urgencia?.tom === "critico"
        ? urgencia.dias < 0
          ? "prazo vencido"
          : urgencia.dias === 0
            ? "envio hoje"
            : `faltam ${urgencia.dias} ${urgencia.dias === 1 ? "dia" : "dias"}`
        : urgencia?.tom === "atencao"
          ? `faltam ${urgencia.dias} dias`
          : null
    const classeValor = "block min-w-0 truncate text-sm leading-5"

    let valor: ReactNode
    if (href && editando !== p.chave && !estaVazio(p.valor)) {
      // Portal de disputa: hyperlink que abre em outra página; o lápis edita o texto
      valor = (
        <a
          href={href}
          target="_blank"
          rel="noopener"
          className="flex min-w-0 items-center gap-1 rounded-sm text-primary outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <span className={classeValor}>{p.valor}</span>
          <ExternalLinkIcon aria-hidden className="size-3.5 shrink-0" />
        </a>
      )
    } else {
      valor = valorEditavel({
        chave: p.chave,
        rotulo: p.rotulo,
        escopo,
        className: cn(
          classeValor,
          "text-muted-foreground",
          urgencia?.tom === "critico" && "font-medium text-destructive",
          urgencia?.tom === "atencao" && "font-medium text-warning-strong",
          !editavel && "cursor-default"
        ),
        classeEntrada: "w-full text-sm leading-5 text-muted-foreground",
        exibir:
          urgencia && urgencia.tom !== "normal" ? (
            <span className="inline-flex items-center gap-1" title={`Envio da proposta: ${p.valor}, ${aviso}`}>
              {urgencia.tom === "critico" ? (
                <CircleAlertIcon aria-hidden className="size-3.5 shrink-0" />
              ) : (
                <ClockIcon aria-hidden className="size-3.5 shrink-0" />
              )}
              {p.valor}
              <span className="sr-only">, {aviso}</span>
            </span>
          ) : undefined,
      })
    }

    return (
      <div key={p.chave} className="group/prop grid min-w-0 gap-1">
        <dt className="truncate text-sm leading-5 font-semibold text-foreground">{p.rotulo}</dt>
        <dd className="relative flex min-h-5 min-w-0 items-center">
          {editavel ? (
            valor
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex min-w-0">{valor}</span>
              </TooltipTrigger>
              <TooltipContent side="top" align="start">
                Essa informação não pode ser editada
              </TooltipContent>
            </Tooltip>
          )}
          <AcoesDaPropriedade
            flutuante
            rotulo={p.rotulo}
            editavel={editavel}
            vinculada={temTrecho(p.chave)}
            onEditar={() => setEditando(p.chave)}
            onTrecho={() => abrirTrecho(p.chave, p.rotulo)}
            onCopiar={() => copiar(p.chave, escopo)}
          />
        </dd>
      </div>
    )
  }

  /* ---------------- linha do bloco principal (órgão, objeto, valor) ---------------- */

  function acoesDaLinha(chave: string, rotulo: string, className?: string) {
    return (
      <AcoesDaPropriedade
        rotulo={rotulo}
        editavel
        vinculada={temTrecho(chave)}
        onEditar={() => setEditando(chave)}
        onTrecho={() => abrirTrecho(chave, rotulo)}
        onCopiar={() => copiar(chave, "topo")}
        className={className}
      />
    )
  }

  const porDatas = Object.fromEntries(l.datas.map((d) => [d.chave, d]))
  const porProps = Object.fromEntries(l.props.map((p) => [p.chave, p]))
  const multiplosLinks = linksDoEdital.length > 1

  return (
    <LicitacaoCardRoot
      role="group"
      aria-label={`Licitação Edital ${l.numero}`}
      tabIndex={0}
      data-selecionado={selecionado || undefined}
      data-editando={editando != null || undefined}
      onClick={aoClicarNoCard}
      onKeyDown={aoTeclarNoCard}
      className={cn(
        "w-full max-w-345 cursor-pointer py-0 outline-none [--card-spacing:--spacing(4)]",
        // o card inteiro é clicável: cresce 0,5% no hover; parado enquanto edita
        "origin-center transition duration-170 ease-out hover:scale-[1.005] hover:shadow-md",
        "data-editando:hover:scale-100 data-editando:hover:shadow-xs",
        "focus-visible:ring-3 focus-visible:ring-ring/50",
        selecionado && "ring-primary"
      )}
    >
      {/* ---------- topo ---------- */}
      <LicitacaoCardHeader className="min-h-15 gap-x-4 gap-y-2 py-2.5">
        <div className="flex flex-1 items-center gap-2">
          <LicitacaoCardSelect
            label={`Selecionar edital ${l.numero}`}
            checked={selecionado}
            onCheckedChange={(v) => selecionar(v === true)}
            className="mr-1"
          />
          <LicitacaoCardTitle prefix={<b>Edital</b>} className="flex min-w-0 items-baseline gap-1 text-lg leading-7 font-normal">
            {editando === "numero" ? (
              <EntradaNaLinha
                valor={l.numero}
                rotulo="Número do edital"
                onSalvar={(v) => {
                  gravar("numero", "topo", v)
                  encerrarEdicao()
                }}
                onCancelar={encerrarEdicao}
                className="field-sizing-content max-w-full"
              />
            ) : (
              <button
                type="button"
                aria-label={`Número do edital: ${l.numero}. Editar`}
                // o mousedown não deve tirar o foco antes do input aparecer
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setEditando("numero")}
                className={cn(
                  ALVO_EDITAVEL,
                  "min-w-0 cursor-text truncate text-left outline-none hover:bg-foreground/6 focus-visible:ring-3 focus-visible:ring-ring/50"
                )}
              >
                {l.numero}
              </button>
            )}
          </LicitacaoCardTitle>
          <Badge variant="warning" className="h-6.5 flex-none rounded-md border-current/20 px-3 font-medium">
            <RefreshCwIcon data-icon="inline-start" />
            Atualizado
          </Badge>
        </div>

        <LicitacaoCardActions data-sem-detalhe className="gap-2">
          <Button variant="secondary" size="sm" className="px-3" data-nao-prototipado>
            Descartar
          </Button>
          <Button size="sm" className="px-3" data-nao-prototipado>
            Enviar para análise
          </Button>
          <DivisorVertical />
          <LicitacaoCardAvatars avatars={RESPONSAVEIS} addProps={{ "data-nao-prototipado": true }} />
          <DivisorVertical />
          {multiplosLinks ? (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <LicitacaoCardIconAction variant="soft" label="Link do edital" icon={<GlobeIcon />} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-66">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-[11px] tracking-wide uppercase">Abrir o edital em</DropdownMenuLabel>
                  {linksDoEdital.map((link) => (
                    <DropdownMenuItem key={link.rotulo} onSelect={() => abrirLink(link)}>
                      {link.rotulo}
                      <ExternalLinkIcon className="ml-auto text-primary" />
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <LicitacaoCardIconAction
              variant="soft"
              label="Link do edital"
              icon={<GlobeIcon />}
              onClick={() => (linksDoEdital[0] ? abrirLink(linksDoEdital[0]) : toast("Sem link do edital"))}
            />
          )}
          <DivisorVertical />
          <LicitacaoCardIconActions className="ml-0 gap-2">
            <LicitacaoCardIconAction variant="soft" label="Salvar para depois" icon={<BookmarkIcon />} data-nao-prototipado />
            <LicitacaoCardIconAction variant="soft" label="Copiar link" icon={<LinkIcon />} data-nao-prototipado />
            <LicitacaoCardIconAction variant="soft" label="Compartilhar" icon={<Share2Icon />} data-nao-prototipado />
            <LicitacaoCardIconAction variant="soft" label="Arquivos" icon={<FolderIcon />} count={4} data-nao-prototipado />
          </LicitacaoCardIconActions>
          <DivisorVertical />
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="success"
                tabIndex={0}
                aria-label="Score Quente: 80 de 100"
                className="h-8 rounded-lg px-2.5 text-[13px] font-semibold tabular-nums [&>svg]:size-4!"
              >
                <GaugeIcon data-icon="inline-start" />
                80/100
              </Badge>
            </TooltipTrigger>
            <TooltipContent>Score Quente</TooltipContent>
          </Tooltip>
        </LicitacaoCardActions>
      </LicitacaoCardHeader>

      <LicitacaoCardContent className="flex flex-col gap-4 pt-0 pb-4">
        {/* ---------- bloco principal ---------- */}
        <section aria-label="Resumo do edital" className="flex flex-col gap-4 rounded-xl border p-4">
          <EditorDeSelecao
            open={editando === "segmentos"}
            onOpenChange={abrirPopover("segmentos")}
            rotulo="Segmentos"
            placeholderBusca="Buscar segmento…"
            busca
            opcoes={SEGMENTOS}
            selecionadas={l.segmentos}
            onEscolher={(s) =>
              setL((atual) => ({
                ...atual,
                segmentos: atual.segmentos.includes(s) ? atual.segmentos.filter((x) => x !== s) : [...atual.segmentos, s],
              }))
            }
            ancora={
              <div className="self-start">
                {l.segmentos.length ? (
                  <LicitacaoCardSegments
                    aria-label="Segmentos"
                    segments={l.segmentos.map((s) => ({
                      label: s,
                      className: "rounded-md px-1.5 py-0.5 font-medium",
                      "aria-label": `Segmento ${s}. Editar segmentos`,
                      "aria-haspopup": "dialog",
                      "aria-expanded": editando === "segmentos",
                      onClick: () => setEditando("segmentos"),
                    }))}
                  />
                ) : (
                  <button
                    type="button"
                    aria-haspopup="dialog"
                    aria-expanded={editando === "segmentos"}
                    onClick={() => setEditando("segmentos")}
                    className="inline-flex items-center rounded-md border border-dashed border-foreground/25 px-1.75 py-px text-xs text-muted-foreground outline-none hover:border-solid hover:border-foreground/40 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    Selecionar segmentos
                  </button>
                )}
              </div>
            }
          />

          <LicitacaoCardDescription className="gap-2 text-sm">
            <div className="group/prop flex w-full flex-wrap items-center gap-2">
              <LicitacaoCardField label="Órgão" className="min-w-0 leading-5 [&>span:first-child]:font-bold">
                {valorEditavel({
                  chave: "orgao",
                  rotulo: "Órgão",
                  escopo: "topo",
                  classeEntrada: "field-sizing-content max-w-full align-baseline",
                })}
              </LicitacaoCardField>
              <EditorDeSelecao
                open={editando === "porte"}
                onOpenChange={abrirPopover("porte")}
                rotulo="Porte"
                opcoes={PORTES}
                selecionadas={[l.porte]}
                onEscolher={(v) => {
                  gravar("porte", "topo", v)
                  encerrarEdicao()
                }}
                ancora={
                  <Badge asChild variant="secondary" className="h-auto rounded-md px-1.5 py-0.5 leading-4">
                    <button
                      type="button"
                      aria-label={`Porte: ${l.porte}. Alterar`}
                      aria-haspopup="dialog"
                      aria-expanded={editando === "porte"}
                      onClick={() => setEditando("porte")}
                      className="cursor-pointer outline-none hover:brightness-[.92] focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      {l.porte}
                    </button>
                  </Badge>
                }
              />
              {acoesDaLinha("orgao", "Órgão", "ml-auto")}
            </div>

            <div className="group/prop flex w-full items-start gap-2">
              <LicitacaoCardField label="Objeto" className="min-w-0 flex-1 leading-5 [&>span:first-child]:font-bold">
                {valorEditavel({
                  chave: "objeto",
                  rotulo: "Objeto",
                  escopo: "topo",
                  classeEntrada: "field-sizing-content w-full align-top leading-5",
                })}
              </LicitacaoCardField>
              {acoesDaLinha("objeto", "Objeto", "mt-0.5")}
            </div>
          </LicitacaoCardDescription>

          <div className="group/prop flex w-full items-center gap-2">
            <LicitacaoCardValue className="text-base leading-6">
              {valorEditavel({
                chave: "valor",
                rotulo: "Valor global",
                escopo: "topo",
                classeEntrada: "field-sizing-content max-w-full font-bold tabular-nums",
              })}
            </LicitacaoCardValue>
            {acoesDaLinha("valor", "Valor global")}
          </div>
        </section>

        {/* ---------- datas + informações ---------- */}
        <GradeDePropriedades
          datas={ORDEM_DATAS.map((k) => porDatas[k])
            .filter(Boolean)
            .map((d) => campo(d, "datas"))}
          campos={ordemDoGrid()
            .map((k) => porProps[k])
            .filter(Boolean)
            .map((p) => campo(p, "props"))}
        />
      </LicitacaoCardContent>
    </LicitacaoCardRoot>
  )
}

type Escopo = "topo" | "datas" | "props"

/* ------------------------------------------------------------------ */
/* Datas + grade de informações (rolagem e "Ver mais")                 */
/* ------------------------------------------------------------------ */

/**
 * A caixa de informações tem a altura da caixa de datas ao lado (a partir de 768px) e rola
 * por dentro. "Ver mais" aparece só se sobra conteúdo e some de vez no primeiro scroll.
 */
function GradeDePropriedades({ datas, campos }: { datas: ReactNode; campos: ReactNode }) {
  const caixaDatas = useRef<HTMLDivElement>(null)
  const rolagem = useRef<HTMLDivElement>(null)
  const [alturaMax, setAlturaMax] = useState<number | null>(null)
  const [sobra, setSobra] = useState(false)
  const [dispensado, setDispensado] = useState(false)

  useLayoutEffect(() => {
    const datasEl = caixaDatas.current
    const rolagemEl = rolagem.current
    if (!datasEl || !rolagemEl) return
    const ajustar = () => {
      if (window.innerWidth >= 768) {
        // altura útil = caixa de datas menos o padding da caixa (p-4)
        setAlturaMax(Math.max(72, datasEl.clientHeight - 32))
      } else {
        setAlturaMax(null)
      }
      requestAnimationFrame(() => setSobra(rolagemEl.scrollHeight - rolagemEl.clientHeight > 4 && window.innerWidth >= 768))
    }
    ajustar()
    const observador = new ResizeObserver(ajustar)
    observador.observe(datasEl)
    observador.observe(rolagemEl)
    window.addEventListener("resize", ajustar)
    document.fonts?.ready.then(ajustar)
    return () => {
      observador.disconnect()
      window.removeEventListener("resize", ajustar)
    }
  }, [])

  const dispensar = () => setDispensado(true)

  return (
    <div className="grid w-full items-start gap-4 md:grid-cols-[auto_minmax(0,1fr)]">
      <div ref={caixaDatas} className="rounded-xl border p-4">
        <dl aria-label="Datas" className="flex flex-col gap-3">
          {datas}
        </dl>
      </div>
      <div className="@container relative min-w-0 rounded-xl border p-4" onWheel={dispensar}>
        <div
          ref={rolagem}
          onScroll={dispensar}
          style={alturaMax != null ? { maxHeight: alturaMax } : undefined}
          className={cn(alturaMax != null && "overflow-y-scroll [scrollbar-width:thin]")}
        >
          <dl aria-label="Informações do edital" className="grid grid-cols-1 gap-x-4 gap-y-2 @sm:grid-cols-2 @3xl:grid-cols-5">
            {campos}
          </dl>
        </div>
        {sobra && !dispensado && (
          <button
            type="button"
            data-sem-detalhe
            onClick={() => {
              rolagem.current?.scrollBy({ top: 56, behavior: "smooth" })
              dispensar()
            }}
            className="absolute right-2.25 bottom-0 left-0 flex items-center gap-1 rounded-b-xl bg-linear-to-t from-card from-55% to-transparent px-4 pt-5.5 pb-2.5 text-left text-[13px] font-medium text-primary outline-none hover:text-primary/80 focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            Ver mais
            <ArrowDownIcon aria-hidden className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
