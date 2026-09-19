import * as React from "react"

import { cn } from "@/lib/utils"

// Quadro kanban: colunas lado a lado (rolagem horizontal), cada uma com título,
// indicador de cor, contador e lista de cartões com rolagem própria. Arrastar um
// cartão mostra um espaço reservado do tamanho dele onde vai cair (entre colunas ou
// na mesma coluna). O conteúdo do cartão vem por renderItem; o componente não
// conhece o tipo dos dados.

type KanbanColumn<TItem> = {
  id: string
  title: React.ReactNode
  /** Nome da coluna em texto (leitores de tela), quando o título não é texto. */
  label?: string
  /** Ponto de cor antes do título (ex.: "bg-category-1"). */
  indicatorClassName?: string
  items: TItem[]
}

type KanbanProps<TItem> = Omit<React.ComponentProps<"div">, "children"> & {
  columns: KanbanColumn<TItem>[]
  getItemId: (item: TItem) => string
  renderItem: (item: TItem, state: { dragging: boolean }) => React.ReactNode
  /**
   * Cartão solto numa coluna. `index` é a posição entre os cartões da coluna de
   * destino, sem contar o próprio cartão arrastado.
   */
  onMove?: (itemId: string, columnId: string, index: number) => void
  /** Bloqueia o arraste (ex.: com um editor aberto num cartão). */
  dragDisabled?: boolean
  /** Largura de cada coluna em px. */
  columnWidth?: number
  /** Texto da coluna vazia. */
  emptyLabel?: React.ReactNode
  /** Classes da lista de cartões de cada coluna. */
  listClassName?: string
}

const ITEM_TYPE = "application/x-kanban-item"

type DropTarget = { columnId: string; index: number }

function Kanban<TItem>({
  columns,
  getItemId,
  renderItem,
  onMove,
  dragDisabled = false,
  columnWidth = 358,
  emptyLabel,
  listClassName,
  className,
  style,
  ...props
}: KanbanProps<TItem>) {
  const [dragging, setDragging] = React.useState<{ id: string; height: number } | null>(null)
  const [target, setTarget] = React.useState<DropTarget | null>(null)
  const draggingRef = React.useRef<string | null>(null)
  const canDrag = !!onMove && !dragDisabled

  const clear = () => {
    draggingRef.current = null
    setDragging(null)
    setTarget(null)
  }

  // posição do cursor na lista: antes do primeiro cartão cuja metade fica abaixo dele
  const indexAt = (list: HTMLElement, y: number) => {
    const cards = [...list.querySelectorAll<HTMLElement>("[data-kanban-item]:not([data-dragging])")]
    const i = cards.findIndex((el) => {
      const r = el.getBoundingClientRect()
      return y < r.top + r.height / 2
    })
    return i < 0 ? cards.length : i
  }

  return (
    <div
      data-slot="kanban"
      className={cn("flex h-full min-h-0 gap-3 overflow-x-auto overflow-y-hidden p-4", className)}
      style={{ "--kanban-column-width": `${columnWidth}px`, ...style } as React.CSSProperties}
      {...props}
    >
      {columns.map((column) => {
        const titleId = `kanban-${column.id}-title`
        const isTarget = !!dragging && target?.columnId === column.id
        const visible = column.items.filter((item) => getItemId(item) !== dragging?.id)
        const placeholderIndex = isTarget ? target.index : -1

        const nodes: React.ReactNode[] = []
        let visibleIndex = 0
        column.items.forEach((item) => {
          const id = getItemId(item)
          const isDragging = dragging?.id === id
          if (!isDragging && visibleIndex === placeholderIndex) {
            nodes.push(<KanbanPlaceholder key="placeholder" height={dragging!.height} />)
          }
          if (!isDragging) visibleIndex++
          nodes.push(
            <li
              key={id}
              data-kanban-item={id}
              data-dragging={isDragging || undefined}
              draggable={canDrag}
              onDragStart={(e) => {
                const origin = e.target instanceof Element ? e.target : null
                // arraste vindo de um popover do cartão (portal): não é o cartão
                if (!origin || !e.currentTarget.contains(origin)) return
                // campo de texto ou área marcada: seleciona texto em vez de arrastar
                if (
                  !canDrag ||
                  origin.closest("input, textarea, select, [contenteditable=true], [data-kanban-no-drag]")
                ) {
                  e.preventDefault()
                  return
                }
                const height = e.currentTarget.getBoundingClientRect().height
                e.dataTransfer.setData(ITEM_TYPE, id)
                e.dataTransfer.setData("text/plain", id)
                e.dataTransfer.effectAllowed = "move"
                draggingRef.current = id
                // adiado: mudar o DOM dentro do dragstart cancela o arraste no Chrome
                window.setTimeout(() => setDragging({ id, height }), 0)
              }}
              onDragEnd={clear}
              className="min-w-0 flex-none"
            >
              {renderItem(item, { dragging: isDragging })}
            </li>
          )
        })
        if (placeholderIndex >= visible.length && isTarget) {
          nodes.push(<KanbanPlaceholder key="placeholder" height={dragging!.height} />)
        }

        return (
          <section
            key={column.id}
            data-slot="kanban-column"
            data-drop-target={isTarget || undefined}
            aria-labelledby={titleId}
            onDragOver={(e) => {
              if (!draggingRef.current) return
              e.preventDefault()
              e.dataTransfer.dropEffect = "move"
              const list = e.currentTarget.querySelector<HTMLElement>("[data-slot=kanban-list]")
              if (!list) return
              const index = indexAt(list, e.clientY)
              if (target?.columnId !== column.id || target.index !== index) {
                setTarget({ columnId: column.id, index })
              }
            }}
            onDrop={(e) => {
              const id = draggingRef.current
              if (!id) return
              e.preventDefault()
              const list = e.currentTarget.querySelector<HTMLElement>("[data-slot=kanban-list]")
              const index = list ? indexAt(list, e.clientY) : column.items.length
              clear()
              onMove?.(id, column.id, index)
            }}
            className={cn(
              "flex h-full w-(--kanban-column-width) min-w-0 flex-none flex-col rounded-[10px] bg-muted p-2 transition-colors duration-120",
              "data-drop-target:bg-primary/8"
            )}
          >
            <header className="flex items-center justify-between gap-2 px-1.5 pt-1 pb-2">
              <h2
                id={titleId}
                aria-label={column.label}
                className="flex min-w-0 items-center gap-2 text-[13px] leading-5 font-medium"
              >
                {column.indicatorClassName && (
                  <span aria-hidden className={cn("size-2 shrink-0 rounded-full", column.indicatorClassName)} />
                )}
                <span className="truncate">{column.title}</span>
              </h2>
              <span className="text-xs text-muted-foreground tabular-nums">{column.items.length}</span>
            </header>
            <ul
              data-slot="kanban-list"
              className={cn(
                "flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-2 pt-1 pb-2 [scrollbar-width:thin]",
                listClassName
              )}
            >
              {nodes}
              {!column.items.length && !isTarget && emptyLabel != null && (
                <li className="px-1 py-2 text-xs text-muted-foreground">{emptyLabel}</li>
              )}
            </ul>
          </section>
        )
      })}
    </div>
  )
}

/** Espaço reservado com a altura do cartão arrastado, onde ele vai cair. */
function KanbanPlaceholder({ height }: { height: number }) {
  return (
    <li
      aria-hidden
      data-slot="kanban-placeholder"
      className="pointer-events-none flex-none rounded-xl border-2 border-dashed border-primary bg-primary/8"
      style={{ height }}
    />
  )
}

export { Kanban, type KanbanColumn, type KanbanProps }
