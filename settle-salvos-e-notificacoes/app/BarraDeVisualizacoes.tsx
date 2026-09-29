// Abas de visualização (estilo Notion): contador, menu "⋮" (renomear, copiar link,
// duplicar, excluir), "+" para criar, arrastar para reordenar e, quando não cabem
// todas, "Mais N" com a lista completa.

import { useEffect, useLayoutEffect, useRef, useState, type ComponentProps, type DragEvent, type ReactNode } from "react"
import {
  CopyIcon,
  EllipsisIcon,
  EllipsisVerticalIcon,
  GripVerticalIcon,
  LayoutGridIcon,
  LinkIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { VISUALIZACAO_OBRIGATORIA, type Visualizacao } from "./dados"

type Posicao = "antes" | "depois"

type Props = {
  /** Visualizações visíveis, na ordem. */
  visualizacoes: Visualizacao[]
  ativa: string
  contagens: Record<string, number>
  /** Largura livre para a barra (a toolbar menos o grupo de ações). */
  disponivel: number
  /** Visualização recém-criada: ativa se couber na barra; senão abre a lista "Mais N". */
  novaPendente: string | null
  onNovaTratada: () => void
  onAtivar: (chave: string) => void
  onCriar: () => void
  onMover: (chave: string, alvo: string, posicao: Posicao) => void
  onRenomear: (chave: string, rotulo: string) => void
  onCopiarLink: (chave: string) => void
  onDuplicar: (chave: string) => void
  onExcluir: (chave: string) => void
}

// mesmas medidas no gatilho real e na cópia invisível usada para medir
const CLASSE_ABA = "h-7.5 flex-none gap-1.5 rounded-lg pl-3 pr-7 hover:bg-background/60 hover:text-foreground"
const CLASSE_MEDIDA = "inline-flex h-7.5 items-center gap-1.5 border border-transparent pl-3 pr-7 text-sm font-medium"

function ConteudoAba({ rotulo, contagem }: { rotulo: string; contagem: number }) {
  return (
    <>
      <span>{rotulo}</span>
      <span className="rounded-md bg-foreground/10 px-1.5 py-px text-xs leading-4 font-medium text-foreground tabular-nums">
        {contagem}
      </span>
    </>
  )
}

export function BarraDeVisualizacoes({
  visualizacoes,
  ativa,
  contagens,
  disponivel,
  novaPendente,
  onNovaTratada,
  onAtivar,
  onCriar,
  onMover,
  onRenomear,
  onCopiarLink,
  onDuplicar,
  onExcluir,
}: Props) {
  const listaRef = useRef<HTMLDivElement>(null)
  const medidaRef = useRef<HTMLDivElement>(null)
  const [ocultas, setOcultas] = useState<string[]>([])
  const [listaAberta, setListaAberta] = useState(false)
  // menu "⋮" aberto: de qual visualização, de onde (aba ou lista) e o nome antes de renomear
  const [menu, setMenu] = useState<{ chave: string; origem: "aba" | "lista"; original: string } | null>(null)
  const [arrastando, setArrastando] = useState<string | null>(null)

  // Esconde as abas que não cabem (a ativa fica sempre) e mostra "Mais N".
  useLayoutEffect(() => {
    const medida = medidaRef.current
    if (!medida) return
    const largura = (seletor: string) => (medida.querySelector(seletor) as HTMLElement | null)?.offsetWidth ?? 0
    const larguras = new Map(visualizacoes.map((v) => [v.chave, largura(`[data-medida="${CSS.escape(v.chave)}"]`)]))
    const soma = [...larguras.values()].reduce((a, b) => a + b, 0)
    const PADDING = 6
    const novas: string[] = []
    if (PADDING + soma + largura("[data-medida-add]") > disponivel) {
      // modelo Notion: o "+" sai da barra e "Mais N" entra no lugar
      let total = PADDING + soma + largura("[data-medida-mais]")
      for (const v of [...visualizacoes].reverse()) {
        if (total <= disponivel) break
        if (v.chave === ativa) continue
        total -= larguras.get(v.chave) ?? 0
        novas.push(v.chave)
      }
    }
    setOcultas((atuais) => (atuais.join("|") === novas.join("|") ? atuais : novas))

    if (novaPendente) {
      if (novas.includes(novaPendente)) setListaAberta(true)
      else onAtivar(novaPendente)
      onNovaTratada()
    }
  }, [visualizacoes, ativa, contagens, disponivel, novaPendente, onAtivar, onNovaTratada])

  // lista "Mais N" fecha ao rolar a página (como na versão HTML)
  useEffect(() => {
    const fechar = () => setListaAberta(false)
    window.addEventListener("scroll", fechar, { passive: true })
    return () => window.removeEventListener("scroll", fechar)
  }, [])

  const mostradas = visualizacoes.filter((v) => !ocultas.includes(v.chave))

  // arrastar na barra: reordena ao vivo pela posição do cursor
  function aoArrastarSobre(e: DragEvent) {
    if (!arrastando || !listaRef.current) return
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    const outras = [...listaRef.current.querySelectorAll<HTMLElement>("[data-aba]")].filter(
      (el) => el.dataset.aba !== arrastando
    )
    const ancora = outras.find((el) => {
      const r = el.getBoundingClientRect()
      return e.clientX < r.left + r.width / 2
    })
    const indice = mostradas.findIndex((v) => v.chave === arrastando)
    if (ancora) {
      if (mostradas[indice + 1]?.chave !== ancora.dataset.aba) onMover(arrastando, ancora.dataset.aba!, "antes")
    } else {
      const ultima = outras.at(-1)
      if (ultima && indice !== mostradas.length - 1) onMover(arrastando, ultima.dataset.aba!, "depois")
    }
  }

  function abrirMenu(v: Visualizacao, origem: "aba" | "lista", aberto: boolean) {
    setMenu(aberto ? { chave: v.chave, origem, original: v.rotulo } : null)
  }

  function conteudoDoMenu(v: Visualizacao, lado: "bottom" | "left") {
    return (
      <MenuDaVisualizacao
        visualizacao={v}
        side={lado}
        align="start"
        onEscapeKeyDown={() => menu && onRenomear(v.chave, menu.original)}
        onRenomear={(rotulo) => onRenomear(v.chave, rotulo || menu?.original || v.rotulo)}
        onConfirmar={() => setMenu(null)}
        onCopiarLink={() => onCopiarLink(v.chave)}
        onDuplicar={() => onDuplicar(v.chave)}
        onExcluir={() => onExcluir(v.chave)}
      />
    )
  }

  return (
    <div className="relative min-w-0">
      <Tabs value={ativa} onValueChange={onAtivar} className="min-w-0">
        <TabsList
          ref={listaRef}
          aria-label="Visualizações"
          className="h-auto max-w-full overflow-hidden"
          onDragOver={aoArrastarSobre}
          onDrop={(e) => e.preventDefault()}
        >
          {mostradas.map((v) => {
            const menuAberto = menu?.chave === v.chave && menu.origem === "aba"
            return (
              <div key={v.chave} data-aba={v.chave} className="relative flex">
                <TabsTrigger
                  value={v.chave}
                  draggable
                  onDragStart={(e) => {
                    setMenu(null)
                    setListaAberta(false)
                    setArrastando(v.chave)
                    e.dataTransfer.effectAllowed = "move"
                    e.dataTransfer.setData("text/plain", v.chave)
                  }}
                  onDragEnd={() => setArrastando(null)}
                  className={cn(
                    CLASSE_ABA,
                    (menuAberto || arrastando === v.chave) && "bg-background/60 text-foreground",
                    arrastando && "cursor-grabbing"
                  )}
                >
                  <ConteudoAba rotulo={v.rotulo} contagem={contagens[v.chave] ?? 0} />
                </TabsTrigger>
                <DropdownMenu open={menuAberto} onOpenChange={(aberto) => abrirMenu(v, "aba", aberto)}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      aria-label={`Opções da visualização ${v.rotulo}`}
                      className="absolute top-1/2 right-1.5 size-5 -translate-y-1/2 rounded-[5px] text-muted-foreground hover:bg-foreground/10 hover:text-foreground aria-expanded:bg-foreground/10"
                    >
                      <EllipsisVerticalIcon />
                    </Button>
                  </DropdownMenuTrigger>
                  {conteudoDoMenu(v, "bottom")}
                </DropdownMenu>
              </div>
            )
          })}

          {ocultas.length > 0 ? (
            <Popover open={listaAberta} onOpenChange={setListaAberta}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7.5 flex-none px-3 text-foreground/60 hover:bg-foreground/5 hover:text-foreground"
                >
                  Mais {ocultas.length}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-72 gap-0 p-2">
                <ListaDeVisualizacoes
                  visualizacoes={visualizacoes}
                  menu={menu}
                  onAbrirMenu={(v, aberto) => abrirMenu(v, "lista", aberto)}
                  conteudoDoMenu={(v) => conteudoDoMenu(v, "left")}
                  onEscolher={(chave) => {
                    setListaAberta(false)
                    onAtivar(chave)
                  }}
                  onMover={onMover}
                  onCriar={() => {
                    setListaAberta(false)
                    onCriar()
                  }}
                />
              </PopoverContent>
            </Popover>
          ) : (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Nova visualização"
              className="size-7.5 flex-none text-muted-foreground hover:bg-foreground/5"
              onClick={onCriar}
            >
              <PlusIcon />
            </Button>
          )}
        </TabsList>
      </Tabs>

      {/* cópia invisível só para medir a largura de cada aba */}
      <div
        ref={medidaRef}
        aria-hidden
        className="pointer-events-none invisible absolute top-0 left-0 flex whitespace-nowrap"
      >
        {visualizacoes.map((v) => (
          <span key={v.chave} data-medida={v.chave} className={CLASSE_MEDIDA}>
            <ConteudoAba rotulo={v.rotulo} contagem={contagens[v.chave] ?? 0} />
          </span>
        ))}
        <span data-medida-mais className="inline-flex h-7.5 items-center px-3 text-sm font-medium">
          Mais 0
        </span>
        <span data-medida-add className="inline-flex size-8" />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Lista "Mais N"                                                      */
/* ------------------------------------------------------------------ */

function ListaDeVisualizacoes({
  visualizacoes,
  menu,
  onAbrirMenu,
  conteudoDoMenu,
  onEscolher,
  onMover,
  onCriar,
}: {
  visualizacoes: Visualizacao[]
  menu: { chave: string; origem: "aba" | "lista" } | null
  onAbrirMenu: (v: Visualizacao, aberto: boolean) => void
  conteudoDoMenu: (v: Visualizacao) => ReactNode
  onEscolher: (chave: string) => void
  onMover: (chave: string, alvo: string, posicao: Posicao) => void
  onCriar: () => void
}) {
  const [busca, setBusca] = useState("")
  const [arrastando, setArrastando] = useState<string | null>(null)
  const [sobre, setSobre] = useState<{ chave: string; posicao: Posicao } | null>(null)

  const normalizar = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
  const q = normalizar(busca)
  const podeArrastar = !q // arrastar só faz sentido na lista completa
  const filtradas = visualizacoes.filter((v) => normalizar(v.rotulo).includes(q))

  const posicaoDoCursor = (e: DragEvent<HTMLElement>): Posicao => {
    const r = e.currentTarget.getBoundingClientRect()
    return e.clientY < r.top + r.height / 2 ? "antes" : "depois"
  }

  return (
    <>
      <Input
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar visualização..."
        aria-label="Buscar visualização"
        className="mb-1.5 h-8"
      />
      <ul aria-label="Visualizações" className="flex max-h-70 flex-col gap-px overflow-y-auto">
        {filtradas.length === 0 && (
          <li className="px-2 py-3 text-center text-[13px] text-muted-foreground">Nenhuma visualização</li>
        )}
        {filtradas.map((v) => {
          const menuAberto = menu?.chave === v.chave && menu.origem === "lista"
          return (
            <li
              key={v.chave}
              draggable={podeArrastar}
              data-sobre={sobre?.chave === v.chave ? sobre.posicao : undefined}
              onDragStart={(e) => {
                setArrastando(v.chave)
                e.dataTransfer.effectAllowed = "move"
                e.dataTransfer.setData("text/plain", v.chave)
              }}
              onDragEnd={() => {
                setArrastando(null)
                setSobre(null)
              }}
              onDragOver={(e) => {
                if (!arrastando) return
                e.preventDefault()
                setSobre({ chave: v.chave, posicao: posicaoDoCursor(e) })
              }}
              onDragLeave={() => setSobre((s) => (s?.chave === v.chave ? null : s))}
              onDrop={(e) => {
                e.preventDefault()
                if (arrastando && arrastando !== v.chave) onMover(arrastando, v.chave, posicaoDoCursor(e))
                setSobre(null)
              }}
              className={cn(
                "group/vm flex items-center gap-1.5 rounded-md px-1.5 py-0.5 hover:bg-muted",
                "data-[sobre=antes]:shadow-[inset_0_2px_0_0_var(--primary)] data-[sobre=depois]:shadow-[inset_0_-2px_0_0_var(--primary)]",
                arrastando === v.chave && "opacity-40"
              )}
            >
              <span
                aria-hidden
                title="Arraste para reordenar"
                className={cn(
                  "flex size-4 flex-none items-center justify-center text-muted-foreground/50 group-hover/vm:text-muted-foreground",
                  podeArrastar ? "cursor-grab" : "invisible"
                )}
              >
                <GripVerticalIcon className="size-3.75" />
              </span>
              <button
                type="button"
                onClick={() => onEscolher(v.chave)}
                className="flex min-w-0 flex-1 items-center gap-1.75 rounded-sm py-1 text-left text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <LayoutGridIcon aria-hidden className="size-4 flex-none text-muted-foreground" />
                <span className="truncate">{v.rotulo}</span>
              </button>
              <DropdownMenu open={menuAberto} onOpenChange={(aberto) => onAbrirMenu(v, aberto)}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Opções da visualização ${v.rotulo}`}
                    className="text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
                  >
                    <EllipsisIcon />
                  </Button>
                </DropdownMenuTrigger>
                {conteudoDoMenu(v)}
              </DropdownMenu>
            </li>
          )
        })}
      </ul>
      <Separator className="my-1.5" />
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start font-normal text-muted-foreground hover:text-foreground"
        onClick={onCriar}
      >
        <PlusIcon data-icon="inline-start" />
        Nova visualização
      </Button>
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Menu "⋮" de uma visualização                                        */
/* ------------------------------------------------------------------ */

function MenuDaVisualizacao({
  visualizacao,
  onRenomear,
  onConfirmar,
  onCopiarLink,
  onDuplicar,
  onExcluir,
  ...props
}: Omit<ComponentProps<typeof DropdownMenuContent>, "children"> & {
  visualizacao: Visualizacao
  onRenomear: (rotulo: string) => void
  onConfirmar: () => void
  onCopiarLink: () => void
  onDuplicar: () => void
  onExcluir: () => void
}) {
  const obrigatoria = visualizacao.chave === VISUALIZACAO_OBRIGATORIA
  return (
    <DropdownMenuContent className="w-66 p-1.5" {...props}>
      <CampoRenomear rotulo={visualizacao.rotulo} onRenomear={onRenomear} onConfirmar={onConfirmar} />
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem onSelect={onCopiarLink}>
          <LinkIcon />
          Copiar link
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onDuplicar}>
          <CopyIcon />
          Duplicar
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          disabled={obrigatoria}
          title={obrigatoria ? "A visualização “Todas” não pode ser excluída" : undefined}
          onSelect={onExcluir}
        >
          <Trash2Icon />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  )
}

// Renomeia ao vivo. Enter confirma; Esc desfaz (tratado no onEscapeKeyDown do menu).
function CampoRenomear({
  rotulo,
  onRenomear,
  onConfirmar,
}: {
  rotulo: string
  onRenomear: (rotulo: string) => void
  onConfirmar: () => void
}) {
  const [texto, setTexto] = useState(rotulo)
  return (
    <Input
      value={texto}
      aria-label="Renomear visualização"
      className="mb-1.5 h-8 bg-muted font-medium focus-visible:bg-background"
      onChange={(e) => {
        setTexto(e.target.value)
        onRenomear(e.target.value)
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault()
          onConfirmar()
        } else if (e.key !== "Escape") {
          // não deixa a busca por letra do menu roubar o foco do campo
          e.stopPropagation()
        }
      }}
    />
  )
}
