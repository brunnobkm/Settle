import * as React from "react"
import { ArrowDownIcon, ArrowUpIcon, GripVerticalIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

// Lista de prioridade: todas as opções aparecem, marcadas ou não, e a ordem das
// marcadas é a ordem em que elas valem (ex.: "procure primeiro aqui, depois ali").
// A ordem muda arrastando a linha ou pelas setas. Cada marcada ganha o número da
// sua posição. Todo o texto vem por props.

type PriorityListItem = {
  id: string
  label: React.ReactNode
  /** Nome em texto para os rótulos de acessibilidade (padrão: o label, se for texto). */
  name?: string
  checked: boolean
}

type PriorityListLabels = {
  moveUp: (name: string) => string
  moveDown: (name: string) => string
}

const DEFAULT_LABELS: PriorityListLabels = {
  moveUp: (name) => `Subir ${name}`,
  moveDown: (name) => `Descer ${name}`,
}

function PriorityList({
  items,
  onItemsChange,
  disabled = false,
  labels: labelsProp,
  className,
  ...props
}: Omit<React.ComponentProps<"ul">, "children"> & {
  items: PriorityListItem[]
  onItemsChange?: (items: PriorityListItem[]) => void
  /** Só leitura: sem alça, sem setas, caixas desabilitadas. */
  disabled?: boolean
  labels?: Partial<PriorityListLabels>
}) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp }
  const [dragging, setDragging] = React.useState<number | null>(null)
  const [over, setOver] = React.useState<number | null>(null)
  const editable = !disabled && !!onItemsChange

  const move = (from: number, to: number) => {
    if (!onItemsChange || to < 0 || to >= items.length || from === to) return
    const next = [...items]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    onItemsChange(next)
  }

  const toggle = (index: number, checked: boolean) => {
    if (!onItemsChange) return
    onItemsChange(items.map((item, i) => (i === index ? { ...item, checked } : item)))
  }

  let position = 0

  return (
    <ul
      data-slot="priority-list"
      data-disabled={disabled || undefined}
      className={cn("flex flex-col gap-1.5", className)}
      {...props}
    >
      {items.map((item, index) => {
        if (item.checked) position += 1
        const name = item.name ?? (typeof item.label === "string" ? item.label : item.id)
        const checkboxId = `priority-list-${item.id}`
        return (
          <li
            key={item.id}
            data-checked={item.checked}
            data-dragging={dragging === index || undefined}
            data-over={over === index || undefined}
            draggable={editable}
            onDragStart={(e) => {
              if (!editable) return
              e.dataTransfer.effectAllowed = "move"
              try {
                e.dataTransfer.setData("text/plain", item.id)
              } catch {
                /* alguns navegadores recusam; o índice fica no estado */
              }
              setDragging(index)
            }}
            onDragEnd={() => {
              setDragging(null)
              setOver(null)
            }}
            onDragOver={(e) => {
              if (!editable || dragging === null) return
              e.preventDefault()
              if (over !== index) setOver(index)
            }}
            onDragLeave={() => setOver((o) => (o === index ? null : o))}
            onDrop={(e) => {
              if (!editable || dragging === null) return
              e.preventDefault()
              move(dragging, index)
              setDragging(null)
              setOver(null)
            }}
            className={cn(
              "flex items-center gap-2.5 rounded-lg border bg-card px-2.5 py-1.5 text-[13px]",
              !item.checked && "bg-muted text-muted-foreground",
              editable && "cursor-grab",
              "data-dragging:opacity-45 data-over:border-primary data-over:ring-1 data-over:ring-primary"
            )}
          >
            {editable && (
              <GripVerticalIcon aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
            )}
            <span
              aria-hidden
              className={cn(
                "grid size-5 shrink-0 place-items-center rounded-full text-[11px] font-semibold tabular-nums",
                item.checked
                  ? "bg-foreground text-background"
                  : "border bg-transparent text-muted-foreground"
              )}
            >
              {item.checked ? position : ""}
            </span>
            <Checkbox
              id={checkboxId}
              checked={item.checked}
              disabled={!editable}
              onCheckedChange={(value) => toggle(index, value === true)}
            />
            <label htmlFor={checkboxId} className="min-w-0 flex-1 cursor-pointer truncate text-foreground">
              {item.label}
            </label>
            {editable && (
              <span className="flex shrink-0 gap-0.5">
                <Button
                  variant="outline"
                  size="icon-xs"
                  className="shadow-none"
                  aria-label={labels.moveUp(name)}
                  disabled={index === 0}
                  onClick={() => move(index, index - 1)}
                >
                  <ArrowUpIcon />
                </Button>
                <Button
                  variant="outline"
                  size="icon-xs"
                  className="shadow-none"
                  aria-label={labels.moveDown(name)}
                  disabled={index === items.length - 1}
                  onClick={() => move(index, index + 1)}
                >
                  <ArrowDownIcon />
                </Button>
              </span>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export { PriorityList, type PriorityListItem, type PriorityListLabels }
