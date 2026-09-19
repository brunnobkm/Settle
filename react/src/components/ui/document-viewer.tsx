import * as React from "react"
import { DownloadIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"

// Visualizador de documento em texto, página a página, para conferir a origem de uma
// informação: troca de documento, destaque de um trecho (rola até ele) e seleção de
// texto com uma ação flutuante (ex.: "Usar este trecho"). Opcionalmente mostra uma dica
// que acompanha o ponteiro sobre o texto (ex.: "Selecione um trecho").
// Todo o texto e os dados vêm por props.

type DocumentViewerDocument = { value: string; label: string }

type DocumentViewerProps = Omit<React.ComponentProps<"section">, "onChange"> & {
  /** Documentos disponíveis no seletor do cabeçalho. */
  documents: DocumentViewerDocument[]
  /** Documento aberto. */
  value: string
  onValueChange: (value: string) => void
  /** Páginas do documento aberto; cada página é uma lista de parágrafos. */
  pages: string[][]
  /**
   * Trecho a destacar (sem diferenciar maiúsculas). Quebras de linha separam partes
   * que podem estar em parágrafos seguidos. O painel rola até o destaque.
   */
  highlight?: string
  /** Mude para rolar de novo até o destaque, mesmo com o mesmo texto. */
  highlightKey?: React.Key
  /** Nome acessível do seletor de documento. Padrão: "Documento aberto". */
  documentLabel?: string
  /** Nome acessível de cada página. Padrão: "Página N". */
  pageLabel?: (page: number) => string
  /** Sem ele, o botão de baixar não aparece. */
  onDownload?: () => void
  downloadLabel?: string
  /** Sem ele, o botão de fechar não aparece. */
  onClose?: () => void
  closeLabel?: string
  /** Texto da ação que aparece ao selecionar texto. Sem ele, não há ação. */
  selectionActionLabel?: string
  /** Recebe o texto selecionado quando a ação é usada. */
  onSelectionAction?: (text: string) => void
  /** Dica que acompanha o ponteiro sobre o texto. Sem ela, não há dica. */
  pointerHint?: string
  /** Clique no documento que não resultou em seleção de texto. */
  onClickWithoutSelection?: () => void
}

type Range = [start: number, end: number]

/** Onde o destaque cai: chave "página-parágrafo" e intervalos de caracteres. */
function findHighlights(pages: string[][], highlight: string | undefined) {
  const found = new Map<string, Range[]>()
  const parts = (highlight ?? "")
    .split(/\n+/)
    .map((part) => part.replace(/\s+/g, " ").trim().toLowerCase())
    .filter(Boolean)
  if (!parts.length) return found

  const paragraphs = pages.flatMap((page, p) =>
    page.map((text, i) => ({ key: `${p}-${i}`, lower: text.toLowerCase() }))
  )
  let cursor = 0
  let offset = 0
  for (const part of parts) {
    let hit = false
    for (let k = cursor; k < paragraphs.length; k++) {
      const start = paragraphs[k].lower.indexOf(part, k === cursor ? offset : 0)
      if (start < 0) continue
      const list = found.get(paragraphs[k].key) ?? []
      list.push([start, start + part.length])
      found.set(paragraphs[k].key, list)
      cursor = k
      offset = start + part.length
      hit = true
      break
    }
    if (!hit) break
  }
  return found
}

function renderParagraph(text: string, ranges: Range[] | undefined) {
  if (!ranges?.length) return text
  const nodes: React.ReactNode[] = []
  let last = 0
  ranges
    .slice()
    .sort((a, b) => a[0] - b[0])
    .forEach(([start, end], index) => {
      if (start < last) return
      if (start > last) nodes.push(text.slice(last, start))
      nodes.push(
        <mark
          key={index}
          data-slot="document-viewer-highlight"
          className="rounded-xs bg-primary px-0.5 py-px text-primary-foreground"
        >
          {text.slice(start, end)}
        </mark>
      )
      last = end
    })
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

function caretRangeAt(x: number, y: number): globalThis.Range | null {
  const doc = document as Document & {
    caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null
  }
  if (doc.caretRangeFromPoint) return doc.caretRangeFromPoint(x, y)
  const position = doc.caretPositionFromPoint?.(x, y)
  if (!position) return null
  const range = document.createRange()
  range.setStart(position.offsetNode, position.offset)
  range.collapse(true)
  return range
}

function hitsCharacter(node: Text, start: number, end: number, x: number, y: number) {
  if (start < 0 || end > node.length || start === end) return false
  const range = document.createRange()
  range.setStart(node, start)
  range.setEnd(node, end)
  return [...range.getClientRects()].some(
    (rect) => x >= rect.left - 2 && x <= rect.right + 2 && y >= rect.top - 2 && y <= rect.bottom + 2
  )
}

/** O ponteiro está sobre uma letra (e não sobre o espaço vazio da página)? */
function pointerIsOverText(event: React.PointerEvent) {
  if (!(event.target instanceof Element) || !event.target.closest("p")) return false
  const range = caretRangeAt(event.clientX, event.clientY)
  const container = range?.startContainer
  if (!range || !container) return false
  let node: Node | null = container
  if (node.nodeType !== Node.TEXT_NODE) {
    node = container.childNodes[range.startOffset] ?? container.childNodes[range.startOffset - 1] ?? null
  }
  if (!node || node.nodeType !== Node.TEXT_NODE) return false
  const text = node as Text
  const offset = range.startContainer === text ? range.startOffset : text.length
  return (
    hitsCharacter(text, offset - 1, offset, event.clientX, event.clientY) ||
    hitsCharacter(text, offset, offset + 1, event.clientX, event.clientY)
  )
}

function DocumentViewer({
  documents,
  value,
  onValueChange,
  pages,
  highlight,
  highlightKey,
  documentLabel = "Documento aberto",
  pageLabel = (page) => `Página ${page}`,
  onDownload,
  downloadLabel = "Baixar documento",
  onClose,
  closeLabel = "Fechar",
  selectionActionLabel,
  onSelectionAction,
  pointerHint,
  onClickWithoutSelection,
  className,
  ...props
}: DocumentViewerProps) {
  const bodyRef = React.useRef<HTMLDivElement>(null)
  const pagesRef = React.useRef<HTMLDivElement>(null)
  const actionRef = React.useRef<HTMLButtonElement>(null)
  const hintRef = React.useRef<HTMLDivElement>(null)
  const startedWithSelection = React.useRef(false)
  const [selection, setSelection] = React.useState<{ text: string; rect: DOMRect } | null>(null)
  const [actionPosition, setActionPosition] = React.useState<{ left: number; top: number } | null>(null)

  const highlights = React.useMemo(() => findHighlights(pages, highlight), [pages, highlight])

  const hideHint = React.useCallback(() => {
    if (hintRef.current) hintRef.current.dataset.visible = "false"
  }, [])

  // rola até o destaque (centralizado); sem destaque, volta ao topo
  React.useEffect(() => {
    const body = bodyRef.current
    if (!body) return
    const center = () => {
      const mark = body.querySelector("[data-slot=document-viewer-highlight]")
      if (!mark) return false
      const bodyRect = body.getBoundingClientRect()
      const markRect = mark.getBoundingClientRect()
      const top = body.scrollTop + markRect.top - bodyRect.top - body.clientHeight / 2 + markRect.height / 2
      body.scrollTo({ top: Math.max(0, top) })
      return true
    }
    if (!center()) {
      body.scrollTo({ top: 0 })
      return
    }
    // o painel pode estar mudando de largura (transição): centraliza de novo no fim
    const timer = window.setTimeout(center, 380)
    return () => window.clearTimeout(timer)
    // pages acompanha value; só rola quando o documento ou o destaque mudam
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, highlight, highlightKey])

  const rangeInsidePages = React.useCallback((sel: Selection | null) => {
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return null
    const range = sel.getRangeAt(0)
    const node = range.commonAncestorContainer
    const element = node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement
    return element && pagesRef.current?.contains(element) ? range : null
  }, [])

  // seleção de texto: mostra a ação flutuante perto do trecho selecionado
  React.useEffect(() => {
    if (!selectionActionLabel) return
    const onMouseUp = () => {
      window.setTimeout(() => {
        const range = rangeInsidePages(window.getSelection())
        const text = range?.toString().trim()
        setSelection(range && text ? { text, rect: range.getBoundingClientRect() } : null)
        if (range) hideHint()
      })
    }
    const onSelectionChange = () => {
      if (!rangeInsidePages(window.getSelection())) setSelection(null)
    }
    const onScrollOrResize = () => {
      setSelection(null)
      hideHint()
    }
    document.addEventListener("mouseup", onMouseUp)
    document.addEventListener("selectionchange", onSelectionChange)
    document.addEventListener("scroll", onScrollOrResize, true)
    window.addEventListener("resize", onScrollOrResize)
    return () => {
      document.removeEventListener("mouseup", onMouseUp)
      document.removeEventListener("selectionchange", onSelectionChange)
      document.removeEventListener("scroll", onScrollOrResize, true)
      window.removeEventListener("resize", onScrollOrResize)
    }
  }, [selectionActionLabel, rangeInsidePages, hideHint])

  React.useLayoutEffect(() => {
    const button = actionRef.current
    if (!selection || !button) {
      setActionPosition(null)
      return
    }
    const { rect } = selection
    const size = button.getBoundingClientRect()
    const gap = 8
    const left = Math.max(gap, Math.min(rect.left + rect.width / 2 - size.width / 2, window.innerWidth - size.width - gap))
    let top = rect.bottom + gap
    if (top + size.height > window.innerHeight - gap) top = rect.top - size.height - gap
    top = Math.max(gap, Math.min(top, window.innerHeight - size.height - gap))
    setActionPosition({ left, top })
  }, [selection])

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const hint = hintRef.current
    if (!hint) return
    if (selection || rangeInsidePages(window.getSelection()) || !pointerIsOverText(event)) {
      hideHint()
      return
    }
    const gap = 8
    hint.style.left = `${Math.min(event.clientX + gap, window.innerWidth - hint.offsetWidth - gap)}px`
    hint.style.top = `${Math.min(event.clientY + gap, window.innerHeight - hint.offsetHeight - gap)}px`
    hint.dataset.visible = "true"
  }

  const onBodyClick = () => {
    window.setTimeout(() => {
      const sel = window.getSelection()
      if (rangeInsidePages(sel)) return
      if (startedWithSelection.current) {
        startedWithSelection.current = false
        sel?.removeAllRanges()
        setSelection(null)
        return
      }
      onClickWithoutSelection?.()
    })
  }

  const applySelection = () => {
    if (!selection) return
    onSelectionAction?.(selection.text)
    window.getSelection()?.removeAllRanges()
    setSelection(null)
  }

  return (
    <section
      data-slot="document-viewer"
      className={cn("grid min-h-0 min-w-0 grid-rows-[auto_1fr] bg-background", className)}
      {...props}
    >
      <header
        data-slot="document-viewer-header"
        className="flex min-h-16 items-center gap-2.5 border-b px-4 py-3.5"
      >
        <NativeSelect
          aria-label={documentLabel}
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          className="min-w-0 flex-1 [&_select]:font-semibold"
        >
          {documents.map((document) => (
            <NativeSelectOption key={document.value} value={document.value}>
              {document.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        {(onDownload || onClose) && (
          <div className="flex items-center gap-1">
            {onDownload && (
              <Button variant="ghost" size="icon-sm" aria-label={downloadLabel} title={downloadLabel} onClick={onDownload}>
                <DownloadIcon aria-hidden />
              </Button>
            )}
            {onClose && (
              <Button variant="ghost" size="icon-sm" aria-label={closeLabel} title={closeLabel} onClick={onClose}>
                <XIcon aria-hidden />
              </Button>
            )}
          </div>
        )}
      </header>

      <div
        ref={bodyRef}
        data-slot="document-viewer-body"
        className="min-h-0 overflow-y-auto p-4"
        onPointerDown={() => {
          startedWithSelection.current = Boolean(selection)
        }}
        onPointerMove={pointerHint ? onPointerMove : undefined}
        onPointerLeave={hideHint}
        onClick={onBodyClick}
      >
        <div ref={pagesRef} className="grid gap-4 text-sm leading-[1.48] text-muted-foreground">
          {pages.map((paragraphs, p) => (
            <section
              key={`${value}-${p}`}
              aria-label={pageLabel(p + 1)}
              data-slot="document-viewer-page"
              className="grid min-h-170 content-start gap-4.5 rounded-xl border bg-background px-4 pt-4.5 pb-7"
            >
              {paragraphs.map((text, i) => (
                <p key={i} className="cursor-text">
                  {renderParagraph(text, highlights.get(`${p}-${i}`))}
                </p>
              ))}
            </section>
          ))}
        </div>
      </div>

      {selectionActionLabel && selection && (
        <Button
          ref={actionRef}
          size="sm"
          data-slot="document-viewer-selection-action"
          onMouseDown={(event) => event.preventDefault()}
          onClick={applySelection}
          style={actionPosition ? { left: actionPosition.left, top: actionPosition.top } : { visibility: "hidden" }}
          className="fixed bg-foreground text-background shadow-md hover:bg-foreground/85"
        >
          {selectionActionLabel}
        </Button>
      )}
      {pointerHint && (
        <div
          ref={hintRef}
          aria-hidden
          data-slot="document-viewer-hint"
          data-visible="false"
          className="pointer-events-none fixed top-0 left-0 rounded-full bg-foreground px-2.5 py-2 text-xs leading-none font-medium whitespace-nowrap text-background opacity-0 transition-opacity duration-100 data-[visible=true]:opacity-100"
        >
          {pointerHint}
        </div>
      )}
    </section>
  )
}

export { DocumentViewer, type DocumentViewerDocument, type DocumentViewerProps }
