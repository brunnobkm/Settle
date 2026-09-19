// Seleção de PDF: revisão dos requisitos extraídos do edital.
// Tela inicial com o grupo de ações da análise; "Revisar requisitos" abre o
// visualizador do PDF com a sidebar de requisitos (Módulos -> Itens). Selecionar um
// trecho do documento mostra a barra flutuante "Extrair em" (adicionar num módulo
// ou criar um módulo com o trecho). Trechos extraídos ficam realçados no PDF; clicar
// num card leva ao trecho e clicar num trecho realçado leva ao card.

import { memo, useCallback, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type RefObject } from "react"
import {
  ChevronDownIcon,
  Clock3Icon,
  DownloadIcon,
  FileIcon,
  HandIcon,
  MinusIcon,
  MousePointer2Icon,
  PanelLeftIcon,
  PlusIcon,
  RectangleVerticalIcon,
  RotateCcwIcon,
  SearchIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import {
  ActionBar,
  ActionBarButton,
  ActionBarClose,
  ActionBarGroup,
  ActionBarLabel,
  ActionBarSeparator,
} from "@/components/ui/action-bar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useNaoPrototipado } from "@/settle/nao-prototipado"

import {
  DOCUMENTOS,
  acharItem,
  copiarTexto,
  extrairRequisitos,
  novoId,
  novoModulo,
  totalDeItens,
  type DocId,
  type Item,
  type Modulo,
} from "./dados"
import { Documento } from "./Documento"
import { Requisitos, type AcoesDosRequisitos } from "./Requisitos"

const LARGURA_DA_PAGINA = 760 // largura base do documento (px)
const PASSOS_DE_ZOOM = [0.5, 0.75, 1, 1.25, 1.5, 2]
const OPCOES_DE_ZOOM = [
  ["fit", "Ajustar"],
  ["0.5", "50%"],
  ["0.75", "75%"],
  ["1", "100%"],
  ["1.25", "125%"],
  ["1.5", "150%"],
  ["2", "200%"],
] as const

/** Ações da tela inicial; sem aviso = abre a revisão dos requisitos. */
const ACOES_INICIAIS: { rotulo: string; aviso?: string }[] = [
  { rotulo: "Concluir análise", aviso: "Análise concluída" },
  { rotulo: "Importar", aviso: "Importar documento" },
  { rotulo: "Exportar", aviso: "Exportar análise" },
  { rotulo: "Revisar requisitos" },
]

type Trecho = { texto: string; range: Range }

const DocumentoFixo = memo(Documento)

// Cor dos trechos realçados. ::highlight() não tem variante no Tailwind (e o minificador
// não reconhece o pseudo-elemento), então fica numa regra curta, só com tokens.
const CSS_DOS_REALCES = `
::highlight(trecho) { background-color: color-mix(in oklab, var(--primary) 20%, transparent); }
::highlight(trecho-ativo) { background-color: color-mix(in oklab, var(--primary) 45%, transparent); }
`

/** Trecho selecionado dentro do documento (ou null). */
function selecaoNoDocumento(doc: HTMLElement | null): Trecho | null {
  const sel = window.getSelection()
  if (!doc || !sel || sel.isCollapsed || sel.rangeCount === 0) return null
  const range = sel.getRangeAt(0)
  if (!doc.contains(range.commonAncestorContainer)) return null
  const texto = sel.toString().replace(/\s+/g, " ").trim()
  if (texto.length < 2) return null
  return { texto, range: range.cloneRange() }
}

/* ---------------- realce dos trechos (CSS Custom Highlight API) ---------------- */

function useRealces(modulos: Modulo[]) {
  const realces = useRef<{ base: Highlight; ativo: Highlight } | null>(null)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (typeof Highlight === "undefined" || !CSS.highlights) return
    const base = new Highlight()
    const ativo = new Highlight()
    ativo.priority = 1
    CSS.highlights.set("trecho", base)
    CSS.highlights.set("trecho-ativo", ativo)
    realces.current = { base, ativo }
    return () => {
      CSS.highlights.delete("trecho")
      CSS.highlights.delete("trecho-ativo")
      realces.current = null
    }
  }, [])

  useEffect(() => {
    const r = realces.current
    if (!r) return
    r.base.clear()
    for (const m of modulos) {
      if (m.range) r.base.add(m.range)
      for (const it of m.itens) if (it.range) r.base.add(it.range)
    }
  }, [modulos])

  return useCallback((range: Range | null) => {
    const r = realces.current
    if (!r || !range) return
    r.ativo.clear()
    r.ativo.add(range)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => r.ativo.clear(), 1500)
  }, [])
}

/* ---------------- dica que acompanha o cursor ---------------- */

function DicaDoCursor({ alvo, ativa }: { alvo: RefObject<HTMLElement | null>; ativa: boolean }) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  useEffect(() => {
    const el = alvo.current
    if (!el) return
    const mover = (e: MouseEvent) => setPos(ativa ? { x: e.clientX, y: e.clientY } : null)
    const sair = () => setPos(null)
    el.addEventListener("mousemove", mover)
    el.addEventListener("mouseleave", sair)
    return () => {
      el.removeEventListener("mousemove", mover)
      el.removeEventListener("mouseleave", sair)
    }
  }, [alvo, ativa])
  if (!pos || !ativa) return null
  return (
    <div
      aria-hidden
      style={{ left: pos.x + 14, top: pos.y }}
      className="pointer-events-none fixed -translate-y-1/2 rounded-md bg-foreground/90 px-2.5 py-1 text-[12.5px] font-medium whitespace-nowrap text-background"
    >
      Selecione um trecho
    </div>
  )
}

export default function App() {
  useNaoPrototipado()

  const [aberta, setAberta] = useState(false)
  const [docVisto, setDocVisto] = useState<DocId>("edital")
  const [docExtraido, setDocExtraido] = useState<DocId | null>(null) // só um documento tem a extração ativa
  const [modulos, setModulos] = useState<Modulo[]>([])
  const [alvo, setAlvo] = useState<string | null>(null)
  const [itemAtivo, setItemAtivo] = useState<string | null>(null)
  const [vinculando, setVinculando] = useState<string | null>(null)
  const [pendente, setPendente] = useState<Trecho | null>(null)
  const [menuAberto, setMenuAberto] = useState(false)
  const [modalAberto, setModalAberto] = useState(false)
  const [refazer, setRefazer] = useState(false)
  const [zoom, setZoom] = useState<string>("fit")
  const [larguraUtil, setLarguraUtil] = useState(LARGURA_DA_PAGINA)
  const [ferramenta, setFerramenta] = useState("select")
  const [focarModulo, setFocarModulo] = useState<string | null>(null)
  const [rolarParaItem, setRolarParaItem] = useState<string | null>(null)

  const docRef = useRef<HTMLDivElement>(null)
  const paginaRef = useRef<HTMLElement>(null)
  const rolagemRef = useRef<HTMLDivElement>(null)
  const ativaRef = useRef(false)
  const menuRef = useRef(false)

  const ativa = docExtraido !== null && docExtraido === docVisto
  const piscar = useRealces(modulos)
  const escala = zoom === "fit" ? Math.max(0.2, larguraUtil / LARGURA_DA_PAGINA) : Number(zoom)
  const nomeDoDoc = (id: DocId) => DOCUMENTOS.find((d) => d.id === id)?.nome ?? "documento"

  useEffect(() => {
    ativaRef.current = ativa
  }, [ativa])

  /* ---------- seleção de texto ---------- */

  useEffect(() => {
    const aoMudar = () => {
      const achado = selecaoNoDocumento(docRef.current)
      if (achado && ativaRef.current) setPendente(achado)
      else if (!menuRef.current) setPendente(null)
    }
    document.addEventListener("selectionchange", aoMudar)
    return () => document.removeEventListener("selectionchange", aoMudar)
  }, [])

  const limparSelecao = () => {
    window.getSelection()?.removeAllRanges()
    menuRef.current = false
    setMenuAberto(false)
    setPendente(null)
  }

  const aoMudarMenu = (aberto: boolean) => {
    menuRef.current = aberto
    setMenuAberto(aberto)
    if (!aberto) {
      window.setTimeout(() => {
        if (!selecaoNoDocumento(docRef.current)) setPendente(null)
      }, 0)
    }
  }

  /* ---------- zoom ---------- */

  useEffect(() => {
    const el = rolagemRef.current
    if (!el) return
    const medir = () => {
      const cs = getComputedStyle(el)
      const util = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
      if (util > 0) setLarguraUtil(util)
    }
    medir()
    const ro = new ResizeObserver(medir)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const passoDeZoom = (direcao: -1 | 1) => {
    const alvoZoom =
      direcao > 0
        ? (PASSOS_DE_ZOOM.find((o) => o > escala + 0.001) ?? PASSOS_DE_ZOOM[PASSOS_DE_ZOOM.length - 1])
        : ([...PASSOS_DE_ZOOM].reverse().find((o) => o < escala - 0.001) ?? PASSOS_DE_ZOOM[0])
    setZoom(String(alvoZoom))
  }

  /* ---------- navegação PDF <-> cards ---------- */

  const rolarAte = (range: Range) => {
    const rolagem = rolagemRef.current
    if (!rolagem) return
    const rects = range.getClientRects()
    const r = rects.length ? rects[0] : range.getBoundingClientRect()
    if (!r.height && !r.width) return
    const s = rolagem.getBoundingClientRect()
    rolagem.scrollBy({ top: r.top - s.top - rolagem.clientHeight / 2 + r.height / 2, behavior: "smooth" })
  }

  const irParaItem = (itemId: string) => {
    const achado = acharItem(modulos, itemId)
    if (!achado) return
    setItemAtivo(itemId)
    if (achado.item.range) {
      rolarAte(achado.item.range)
      piscar(achado.item.range)
    }
  }

  const itemNoPonto = (x: number, y: number) => {
    for (const m of modulos)
      for (const it of m.itens) {
        if (!it.range) continue
        for (const r of it.range.getClientRects()) if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return it.id
      }
    return null
  }

  const aoClicarNoDocumento = (e: ReactMouseEvent) => {
    const sel = window.getSelection()
    if (sel && !sel.isCollapsed) return // clique que finaliza uma seleção
    const id = itemNoPonto(e.clientX, e.clientY)
    const achado = id ? acharItem(modulos, id) : null
    if (!id || !achado) return
    setItemAtivo(id)
    if (achado.modulo.recolhido)
      setModulos((ms) => ms.map((m) => (m.id === achado.modulo.id ? { ...m, recolhido: false } : m)))
    setRolarParaItem(id)
    piscar(achado.item.range)
  }

  /* ---------- documentos e extração ---------- */

  const trocarDoc = (id: DocId) => {
    setDocVisto(id)
    limparSelecao()
    if (rolagemRef.current) rolagemRef.current.scrollTop = 0
  }

  const extrair = (docId: DocId) => {
    const corpo = docRef.current?.querySelector<HTMLElement>(`[data-doc="${docId}"]`)
    const novos = corpo ? extrairRequisitos(corpo, docId) : []
    setModulos(novos)
    setAlvo(novos[0]?.id ?? null)
    setItemAtivo(null)
    setVinculando(null)
    setDocExtraido(docId) // a extração "se move" para o documento atual
  }

  const pedirExtracao = () => {
    setRefazer(ativa)
    setModalAberto(true)
  }

  const confirmarExtracao = () => {
    setModalAberto(false)
    extrair(docVisto)
    toast(`Requisitos extraídos de ${nomeDoDoc(docVisto)}`)
  }

  const abrirExtracao = () => {
    setAberta(true)
    trocarDoc("edital")
    extrair("edital")
    toast("Requisitos extraídos de arquivo-errado.pdf")
  }

  /* ---------- trecho selecionado -> requisito ---------- */

  const adicionarDaSelecao = (moduloId: string) => {
    if (!pendente) return
    let lista = modulos
    let destino = lista.find((m) => m.id === moduloId) ?? lista.find((m) => m.id === alvo) ?? lista[0]
    if (!destino) {
      destino = novoModulo("Módulo 1")
      lista = [...lista, destino]
    }
    const item: Item = { id: novoId(), texto: pendente.texto, range: pendente.range, ia: false }
    const idDestino = destino.id
    setModulos(lista.map((m) => (m.id === idDestino ? { ...m, recolhido: false, itens: [...m.itens, item] } : m)))
    setAlvo(idDestino)
    setItemAtivo(item.id)
    limparSelecao()
    toast(`Adicionado em “${destino.nome}”`)
  }

  const criarModuloComTrecho = () => {
    if (!pendente) return
    const m = novoModulo(pendente.texto.slice(0, 60), pendente.range)
    setModulos((ms) => [...ms, m])
    setAlvo(m.id)
    limparSelecao()
    toast(`Módulo “${m.nome}” criado`)
  }

  const copiarSelecao = () => {
    if (pendente) copiarTexto(pendente.texto, () => toast("Trecho copiado"))
  }

  /* ---------- vincular título ao módulo ---------- */

  const confirmarVinculo = () => {
    if (!vinculando || !pendente) return
    const m = modulos.find((x) => x.id === vinculando)
    const range = pendente.range
    setModulos((ms) => ms.map((x) => (x.id === vinculando ? { ...x, range } : x)))
    setVinculando(null)
    limparSelecao()
    toast(m ? `Título vinculado a “${m.nome}”` : "Título vinculado")
  }

  const cancelarVinculo = () => {
    setVinculando(null)
    limparSelecao()
  }

  useEffect(() => {
    if (!vinculando) return
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      setVinculando(null)
      window.getSelection()?.removeAllRanges()
      setPendente(null)
    }
    document.addEventListener("keydown", aoTeclar)
    return () => document.removeEventListener("keydown", aoTeclar)
  }, [vinculando])

  /* ---------- ações da sidebar ---------- */

  const acoes: AcoesDosRequisitos = {
    adicionarModulo: () => {
      const m = novoModulo(`Módulo ${modulos.length + 1}`)
      setModulos((ms) => [...ms, m])
      setAlvo(m.id)
      setFocarModulo(m.id)
    },
    renomearModulo: (id, nome) => setModulos((ms) => ms.map((m) => (m.id === id ? { ...m, nome } : m))),
    alternarModulo: (id) => setModulos((ms) => ms.map((m) => (m.id === id ? { ...m, recolhido: !m.recolhido } : m))),
    removerModulo: (id) => {
      setModulos((ms) => ms.filter((m) => m.id !== id))
      if (vinculando === id) setVinculando(null)
    },
    irParaModulo: (id) => {
      const range = modulos.find((m) => m.id === id)?.range
      if (!range) return
      rolarAte(range)
      piscar(range)
    },
    vincularTitulo: (id) => {
      const proximo = vinculando === id ? null : id
      setVinculando(proximo)
      if (proximo) toast("Sem trecho vinculado. Selecione um trecho para vincular.")
    },
    irParaItem,
    copiarItem: (id) => {
      const achado = acharItem(modulos, id)
      if (achado) copiarTexto(achado.item.texto, () => toast("Trecho copiado"))
    },
    removerItem: (id) => {
      setModulos((ms) => ms.map((m) => ({ ...m, itens: m.itens.filter((i) => i.id !== id) })))
      if (itemAtivo === id) setItemAtivo(null)
    },
    reordenar: (fn) => setModulos(fn),
    salvar: () => {
      const total = totalDeItens(modulos)
      if (!total) toast("Adicione ao menos um requisito")
      else toast(`${modulos.length} módulo(s) e ${total} requisito(s) salvos`)
    },
  }

  const limparFoco = useCallback(() => setFocarModulo(null), [])
  const limparRolagem = useCallback(() => setRolarParaItem(null), [])

  return (
    <div className="min-h-svh bg-muted text-foreground">
      <style>{CSS_DOS_REALCES}</style>
      {/* ===================== TELA INICIAL (só o grupo de botões) ===================== */}
      {!aberta && (
        <div className="flex min-h-svh items-center justify-center">
          <ButtonGroup aria-label="Análise técnica" className="rounded-md shadow-xs">
            {ACOES_INICIAIS.map(({ rotulo, aviso }) => (
              <Button
                key={rotulo}
                variant="secondary"
                size="sm"
                onClick={aviso ? () => toast(aviso) : abrirExtracao}
                className="bg-foreground/10 text-foreground hover:bg-foreground/15"
              >
                {rotulo}
              </Button>
            ))}
          </ButtonGroup>
        </div>
      )}

      {/* ===================== EXTRAÇÃO ===================== */}
      <div hidden={!aberta} className="mx-auto flex min-h-dvh max-w-[1860px] flex-col p-4 min-[1080px]:h-dvh">
        <header className="flex shrink-0 items-center justify-between gap-4 pb-4">
          <div>
            <h1 className="text-[21px] font-bold tracking-[-.01em]">Title</h1>
            <p className="mt-1 text-sm text-muted-foreground">Explicação ...</p>
          </div>
          <Button variant="ghost" size="icon" aria-label="Fechar" onClick={() => setAberta(false)} className="text-muted-foreground">
            <XIcon />
          </Button>
        </header>

        <div
          className={cn(
            "grid min-h-0 flex-1 grid-cols-1 items-stretch gap-4",
            ativa && "min-[1080px]:grid-cols-[minmax(0,1fr)_392px]"
          )}
        >
          {/* ===================== VISUALIZADOR ===================== */}
          <section
            aria-label="Visualizador de PDF"
            className="flex min-h-0 flex-col overflow-hidden rounded-xl border bg-card shadow-xs min-[1080px]:h-full"
          >
            <div className="flex h-16 shrink-0 items-center gap-3 border-b px-4">
              <Select value={docVisto} onValueChange={(v) => trocarDoc(v as DocId)}>
                <SelectTrigger aria-label="Documento" title="Documento da licitação" className="max-w-[340px] bg-muted/50">
                  <FileIcon className="text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" align="start">
                  <SelectGroup>
                    {DOCUMENTOS.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.nome}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <span className="flex-1" />
              <Button variant="outline" onClick={() => toast("Download iniciado")}>
                <DownloadIcon data-icon="inline-start" />
                Baixar
              </Button>
              <Button onClick={pedirExtracao}>{ativa ? "Refazer extração" : "Extrair requisitos"}</Button>
            </div>

            <div className="flex shrink-0 items-center gap-1.5 border-b bg-muted/30 px-4 py-2">
              <Button variant="ghost" size="icon-sm" aria-label="Painel de páginas" data-nao-prototipado className="text-muted-foreground">
                <PanelLeftIcon />
              </Button>
              <Button variant="ghost" size="icon-sm" aria-label="Uma página" data-nao-prototipado className="text-muted-foreground">
                <RectangleVerticalIcon />
              </Button>
              <Separator orientation="vertical" className="mx-1 h-[22px]!" />
              <ButtonGroup aria-label="Zoom">
                <Button variant="outline" size="icon-sm" aria-label="Diminuir zoom" onClick={() => passoDeZoom(-1)}>
                  <MinusIcon />
                </Button>
                <Select value={zoom} onValueChange={setZoom}>
                  <SelectTrigger size="sm" aria-label="Nível de zoom" className="w-[92px] justify-center">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper" align="center">
                    <SelectGroup>
                      {OPCOES_DE_ZOOM.map(([valor, rotulo]) => (
                        <SelectItem key={valor} value={valor}>
                          {rotulo}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon-sm" aria-label="Aumentar zoom" onClick={() => passoDeZoom(1)}>
                  <PlusIcon />
                </Button>
              </ButtonGroup>
              <Separator orientation="vertical" className="mx-1 h-[22px]!" />
              <ToggleGroup
                type="single"
                size="sm"
                spacing={1}
                aria-label="Ferramenta"
                value={ferramenta}
                onValueChange={(v) => v && setFerramenta(v)}
              >
                <ToggleGroupItem
                  value="hand"
                  aria-label="Mover"
                  className="text-muted-foreground data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
                >
                  <HandIcon />
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="select"
                  aria-label="Selecionar texto"
                  className="text-muted-foreground data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
                >
                  <MousePointer2Icon />
                </ToggleGroupItem>
              </ToggleGroup>
              <span className="flex-1" />
              <Button variant="ghost" size="icon-sm" aria-label="Buscar no documento" data-nao-prototipado className="text-muted-foreground">
                <SearchIcon />
              </Button>
            </div>

            <div
              ref={rolagemRef}
              className="flex flex-1 justify-center overflow-auto bg-card p-4 max-[1079px]:max-h-[60vh]"
            >
              <article
                ref={paginaRef}
                style={{ zoom: escala }}
                className="h-fit w-[760px] max-w-full shrink-0 border bg-background p-4 text-foreground"
              >
                <div
                  ref={docRef}
                  onClick={aoClicarNoDocumento}
                  className="text-[14.5px] leading-[1.62] selection:bg-primary/25"
                >
                  <DocumentoFixo visto={docVisto} />
                </div>
              </article>
            </div>
          </section>

          {/* ===================== SIDEBAR ===================== */}
          {ativa && (
            <Requisitos
              modulos={modulos}
              itemAtivo={itemAtivo}
              vinculando={vinculando}
              focarModulo={focarModulo}
              aoFocarModulo={limparFoco}
              rolarParaItem={rolarParaItem}
              aoRolarParaItem={limparRolagem}
              acoes={acoes}
            />
          )}
        </div>
      </div>

      <DicaDoCursor alvo={paginaRef} ativa={aberta && ativa && !pendente} />

      {/* barra flutuante ao selecionar um trecho */}
      <ActionBar open={!!pendente && ativa && !vinculando} aria-label="Trecho selecionado" onMouseDown={(e) => e.preventDefault()}>
        <ActionBarLabel>Trecho selecionado</ActionBarLabel>
        <ActionBarSeparator />
        <ActionBarGroup>
          <DropdownMenu open={menuAberto} onOpenChange={aoMudarMenu}>
            <DropdownMenuTrigger asChild>
              <ActionBarButton>
                Extrair em
                <ChevronDownIcon aria-hidden data-icon="inline-end" />
              </ActionBarButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              align="center"
              sideOffset={10}
              className="w-auto max-w-80 min-w-62"
              onMouseDown={(e) => e.preventDefault()}
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-[11px] font-semibold tracking-[.04em] text-muted-foreground uppercase">
                  Adicionar como requisito em
                </DropdownMenuLabel>
                {modulos.length ? (
                  modulos.map((m) => (
                    <DropdownMenuItem key={m.id} onSelect={() => adicionarDaSelecao(m.id)}>
                      <span className="min-w-0 flex-1 truncate">{m.nome}</span>
                      <Badge variant="secondary" className="text-[11px] font-normal text-muted-foreground tabular-nums">
                        <span className="sr-only">Requisitos: </span>
                        {m.itens.length}
                      </Badge>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled>Nenhum módulo ainda</DropdownMenuItem>
                )}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onSelect={criarModuloComTrecho} className="font-semibold text-primary focus:text-primary">
                  Criar módulo com este trecho
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <ActionBarButton onClick={copiarSelecao}>Copiar</ActionBarButton>
        </ActionBarGroup>
        <ActionBarSeparator />
        <ActionBarClose label="Fechar" onClick={limparSelecao} />
      </ActionBar>

      {/* barra de vincular o título ao módulo */}
      <ActionBar open={!!pendente && !!vinculando} aria-label="Vincular trecho ao módulo" onMouseDown={(e) => e.preventDefault()}>
        <ActionBarLabel>Trecho selecionado</ActionBarLabel>
        <ActionBarSeparator />
        <ActionBarGroup>
          <ActionBarButton onClick={confirmarVinculo}>Vincular</ActionBarButton>
        </ActionBarGroup>
        <ActionBarSeparator />
        <ActionBarClose label="Cancelar" onClick={cancelarVinculo} />
      </ActionBar>

      {/* confirmação da extração */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent showCloseButton={false} className="gap-0 overflow-hidden p-0 sm:max-w-[440px]">
          <div className="px-6 pt-6 pb-5">
            <DialogHeader className="gap-2">
              <DialogTitle className="text-[17px] font-bold">
                {refazer ? "Refazer a extração deste documento?" : "Extrair requisitos deste documento?"}
              </DialogTitle>
              <DialogDescription className="text-[13.5px] leading-normal">
                {refazer
                  ? "A Settle vai analisar novamente o documento aberto e gerar os requisitos do zero."
                  : "A Settle vai analisar o documento aberto e gerar os requisitos automaticamente."}
              </DialogDescription>
            </DialogHeader>
            <ul className="mt-4 flex flex-col gap-2.5 text-[13px] leading-[1.45]">
              <li className="flex items-start gap-2.5">
                <TriangleAlertIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>
                  {refazer
                    ? "A extração atual deste documento será substituída pela nova."
                    : "A extração ativa passa a ser deste documento. O documento anterior deixa de ter requisitos associados."}
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <RotateCcwIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>Requisitos e ajustes manuais feitos antes serão substituídos pela nova extração.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock3Icon aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>Leva alguns segundos até os requisitos ficarem prontos.</span>
              </li>
            </ul>
          </div>
          <DialogFooter className="border-t bg-muted/50 px-6 py-3.5">
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={confirmarExtracao}>{refazer ? "Refazer extração" : "Extrair requisitos"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
