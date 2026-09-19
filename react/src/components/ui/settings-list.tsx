"use client"

import * as React from "react"
import { GripVerticalIcon, LockIcon, PlusIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Lista de itens configuráveis (etapas, motivos, campos, abas): cada linha tem alça,
// nome editável, informação de uso e ações. Itens se reordenam arrastando ou pelo
// teclado (setas na alça), sempre dentro do próprio grupo; itens fixos mostram um
// cadeado. Faixas (SettingsListGroupLabel) separam blocos fixos e editáveis.
// Composição: SettingsList > SettingsListGroupLabel + SettingsListItem >
// (SettingsListNameInput | SettingsListName) + SettingsListItemDescription +
// SettingsListItemMeta + SettingsListLockBadge + SettingsListItemActions; SettingsListAdd no fim.
// Vai dentro de SettingsBox (settings-page) ou de qualquer caixa com borda.

type SettingsListLabels = {
  /** Nome da alça para leitores de tela (recebe o nome do item, quando houver). */
  moveHandle?: (name?: string) => string
}

type SettingsListContextValue = {
  canMove: boolean
  dragging: { id: string; group: string } | null
  over: { id: string; position: "before" | "after" } | null
  setDragging: (value: SettingsListContextValue["dragging"]) => void
  setOver: (value: SettingsListContextValue["over"]) => void
  move: (fromId: string, toId: string) => void
  labels: Required<SettingsListLabels>
  root: React.RefObject<HTMLDivElement | null>
}

const SettingsListContext = React.createContext<SettingsListContextValue | null>(null)

function useSettingsList() {
  const context = React.useContext(SettingsListContext)
  if (!context) throw new Error("SettingsListItem precisa estar dentro de SettingsList")
  return context
}

const DEFAULT_LABELS: Required<SettingsListLabels> = {
  moveHandle: (name) => (name ? `Mover ${name}` : "Mover"),
}

const ITEM_SELECTOR = "[data-slot=settings-list-item][data-movable=true]"

function SettingsList({
  onMove,
  labels,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  /**
   * Chamado ao soltar um item sobre outro do mesmo grupo (ou com as setas na alça).
   * O item `fromId` sai do lugar e entra na posição que `toId` ocupava.
   */
  onMove?: (fromId: string, toId: string) => void
  labels?: SettingsListLabels
}) {
  const root = React.useRef<HTMLDivElement | null>(null)
  const [dragging, setDragging] = React.useState<SettingsListContextValue["dragging"]>(null)
  const [over, setOver] = React.useState<SettingsListContextValue["over"]>(null)
  const move = React.useCallback(
    (fromId: string, toId: string) => {
      if (fromId !== toId) onMove?.(fromId, toId)
    },
    [onMove]
  )
  const value = React.useMemo(
    () => ({
      canMove: !!onMove,
      dragging,
      over,
      setDragging,
      setOver,
      move,
      labels: { ...DEFAULT_LABELS, ...labels },
      root,
    }),
    [onMove, dragging, over, move, labels]
  )

  return (
    <SettingsListContext.Provider value={value}>
      <div
        ref={root}
        data-slot="settings-list"
        className={cn("flex flex-col", className)}
        {...props}
      >
        {children}
      </div>
    </SettingsListContext.Provider>
  )
}

/** Faixa de grupo: título em negrito e, ao lado, uma explicação curta. */
function SettingsListGroupLabel({
  description,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & { description?: React.ReactNode }) {
  return (
    <div
      data-slot="settings-list-group-label"
      className={cn(
        "flex items-center gap-2 border-t bg-muted px-4 py-2 text-[12.5px] font-semibold text-muted-foreground first:border-t-0",
        className
      )}
      {...props}
    >
      <span>
        {children}
        {description != null && <span className="font-normal"> · {description}</span>}
      </span>
    </div>
  )
}

/** Posição de cada item movível do mesmo grupo, na ordem da tela. */
function groupIds(root: HTMLElement | null, group: string) {
  if (!root) return []
  return [...root.querySelectorAll<HTMLElement>(ITEM_SELECTOR)]
    .filter((el) => el.dataset.group === group)
    .map((el) => el.dataset.id ?? "")
}

type SettingsListItemProps = Omit<React.ComponentProps<"div">, "id"> & {
  id: string
  /** Itens só trocam de lugar com outros do mesmo grupo. */
  group?: string
  /** Fixo: cadeado no lugar da alça, fundo apagado, não se move. */
  locked?: boolean
  /** Pode ser reordenado (padrão: sim, se não for fixo e a lista tiver onMove). */
  movable?: boolean
  /** archived: item fora de uso (fundo e texto apagados). */
  variant?: "default" | "archived"
  /** Mostra a coluna da alça (grip, cadeado ou espaço vazio). Padrão: sim. */
  handle?: boolean
  /** Nome do item, para o rótulo da alça. */
  name?: string
  /** Texto de ajuda do cadeado (ex.: "Posição fixa"). */
  lockedLabel?: string
}

function SettingsListItem({
  id,
  group = "default",
  locked = false,
  movable,
  variant = "default",
  handle = true,
  name,
  lockedLabel,
  className,
  children,
  ...props
}: SettingsListItemProps) {
  const list = useSettingsList()
  const canMove = list.canMove && !locked && (movable ?? true)
  const isDragging = list.dragging?.id === id
  const overPosition = list.over?.id === id ? list.over.position : undefined
  const origin = React.useRef<EventTarget | null>(null)

  const position = (targetId: string) => {
    const ids = groupIds(list.root.current, group)
    const from = ids.indexOf(list.dragging?.id ?? "")
    return from < ids.indexOf(targetId) ? "after" : "before"
  }

  return (
    <div
      data-slot="settings-list-item"
      data-id={id}
      data-group={group}
      data-movable={canMove}
      data-locked={locked || undefined}
      data-variant={variant}
      data-dragging={isDragging || undefined}
      data-over={overPosition}
      draggable={canMove}
      onPointerDown={(event) => {
        origin.current = event.target
      }}
      onDragStart={(event) => {
        // arrastar a partir de um campo ou botão (ex.: selecionar texto) não move o item
        const from = origin.current instanceof Element ? origin.current : null
        if (
          !canMove ||
          from?.closest(
            "input, textarea, select, [contenteditable=true], button:not([data-slot=settings-list-handle]), a, [data-settings-list-no-drag]"
          )
        ) {
          event.preventDefault()
          return
        }
        event.dataTransfer.effectAllowed = "move"
        event.dataTransfer.setData("text/plain", id)
        // adiado: mudar o DOM dentro do dragstart cancela o arraste no Chrome
        window.setTimeout(() => list.setDragging({ id, group }), 0)
      }}
      onDragEnd={() => {
        list.setDragging(null)
        list.setOver(null)
      }}
      onDragOver={(event) => {
        const dragging = list.dragging
        if (!dragging || dragging.id === id || dragging.group !== group || !canMove) return
        event.preventDefault()
        event.dataTransfer.dropEffect = "move"
        const next = position(id)
        if (list.over?.id !== id || list.over.position !== next) list.setOver({ id, position: next })
      }}
      onDragLeave={(event) => {
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) return
        if (list.over?.id === id) list.setOver(null)
      }}
      onDrop={(event) => {
        const dragging = list.dragging
        if (!dragging || dragging.group !== group || !canMove) return
        event.preventDefault()
        list.setDragging(null)
        list.setOver(null)
        list.move(dragging.id, id)
      }}
      className={cn(
        "group/settings-list-item flex min-h-12 items-center gap-2.5 border-t bg-card py-1.5 pr-2.5 pl-3 text-sm first:border-t-0 max-sm:flex-wrap",
        "data-[movable=true]:cursor-grab data-dragging:opacity-45",
        "data-[over=before]:shadow-[inset_0_2px_0_var(--primary)] data-[over=after]:shadow-[inset_0_-2px_0_var(--primary)]",
        "data-locked:cursor-default data-locked:bg-muted",
        "data-[variant=archived]:bg-muted data-[variant=archived]:text-muted-foreground",
        className
      )}
      {...props}
    >
      {handle &&
        (canMove ? (
          <button
            type="button"
            data-slot="settings-list-handle"
            aria-label={list.labels.moveHandle(name)}
            aria-keyshortcuts="ArrowUp ArrowDown"
            className="-my-1 inline-flex h-7 w-4 flex-none cursor-grab items-center justify-center rounded-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
            onKeyDown={(event) => {
              if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return
              event.preventDefault()
              const ids = groupIds(list.root.current, group)
              const target = ids[ids.indexOf(id) + (event.key === "ArrowUp" ? -1 : 1)]
              if (target) list.move(id, target)
            }}
          >
            <GripVerticalIcon aria-hidden className="size-3.5" />
          </button>
        ) : locked ? (
          <span
            data-slot="settings-list-handle"
            title={lockedLabel}
            className="inline-flex w-4 flex-none justify-center text-muted-foreground/60"
          >
            <LockIcon aria-hidden className="size-3" />
            {lockedLabel && <span className="sr-only">{lockedLabel}</span>}
          </span>
        ) : (
          <span data-slot="settings-list-handle" aria-hidden className="w-4 flex-none" />
        ))}
      {children}
    </div>
  )
}

const NAME_CLASS =
  "min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-1.75 py-1.25 text-sm text-inherit"

/**
 * Nome editável no lugar. Confirma ao sair do campo ou com Enter; Esc desfaz.
 * Vazio volta ao nome anterior. `onValueCommit` pode devolver false para recusar
 * (ex.: nome repetido) e o campo volta ao valor atual.
 */
function SettingsListNameInput({
  value,
  onValueCommit,
  className,
  onKeyDown,
  onBlur,
  ...props
}: Omit<React.ComponentProps<"input">, "value" | "defaultValue" | "onChange"> & {
  value: string
  onValueCommit: (value: string) => boolean | void
}) {
  const [draft, setDraft] = React.useState(value)
  const [previous, setPrevious] = React.useState(value)
  if (value !== previous) {
    setPrevious(value)
    setDraft(value)
  }

  const commit = () => {
    const next = draft.trim()
    if (!next || next === value) {
      setDraft(value)
      return
    }
    if (onValueCommit(next) === false) setDraft(value)
  }

  return (
    <input
      data-slot="settings-list-name-input"
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        if (event.key === "Enter") event.currentTarget.blur()
        if (event.key === "Escape") {
          setDraft(value)
          // o valor antigo volta antes do blur, então não confirma nada
          window.setTimeout(() => (event.target as HTMLInputElement).blur(), 0)
        }
      }}
      onBlur={(event) => {
        onBlur?.(event)
        commit()
      }}
      className={cn(
        NAME_CLASS,
        "outline-none hover:border-border focus:border-primary focus:ring-1 focus:ring-primary",
        className
      )}
      {...props}
    />
  )
}

/** Nome sem edição (item fixo ou só com liga/desliga). */
function SettingsListName({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="settings-list-name"
      className={cn(
        NAME_CLASS,
        "truncate group-data-locked/settings-list-item:text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

/** Explicação curta na própria linha (ex.: por que o item é fixo). */
function SettingsListItemDescription({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="settings-list-item-description"
      className={cn("min-w-0 flex-1 text-[12.5px] text-muted-foreground", className)}
      {...props}
    />
  )
}

/** Uso do item (ex.: "49 licitações", "nunca usado"). */
function SettingsListItemMeta({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="settings-list-item-meta"
      className={cn("flex-none text-xs whitespace-nowrap text-muted-foreground", className)}
      {...props}
    />
  )
}

function SettingsListItemActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="settings-list-item-actions"
      className={cn("flex flex-none items-center gap-0.5", className)}
      {...props}
    />
  )
}

/** Selo com cadeado. Com `tooltip`, recebe foco e explica o motivo numa dica. */
function SettingsListLockBadge({
  tooltip,
  className,
  children,
  ...props
}: React.ComponentProps<"span"> & { tooltip?: React.ReactNode }) {
  const badge = (
    <span
      data-slot="settings-list-lock-badge"
      tabIndex={tooltip != null ? 0 : undefined}
      className={cn(
        "inline-flex flex-none items-center gap-1 rounded-full border bg-muted px-2 py-px text-[11.5px] leading-4.5 font-medium whitespace-nowrap text-muted-foreground outline-none group-data-locked/settings-list-item:bg-background focus-visible:ring-3 focus-visible:ring-ring/50",
        tooltip != null && "cursor-help",
        className
      )}
      {...props}
    >
      <LockIcon aria-hidden className="size-3" />
      {children}
    </span>
  )
  if (tooltip == null) return badge
  return (
    <Tooltip>
      <TooltipTrigger asChild>{badge}</TooltipTrigger>
      <TooltipContent className="max-w-65">{tooltip}</TooltipContent>
    </Tooltip>
  )
}

/**
 * Última linha: botão "+ Adicionar". Com `disabled`, vira um aviso (ex.: limite
 * atingido) no mesmo lugar.
 */
function SettingsListAdd({
  disabled = false,
  className,
  children,
  ...props
}: React.ComponentProps<"button">) {
  const classes = cn(
    "flex w-full items-center gap-2 border-t bg-card px-4 py-2.75 text-left text-[13.5px] text-muted-foreground first:border-t-0 [&_svg]:size-3.5 [&_svg]:shrink-0",
    className
  )
  if (disabled) {
    return (
      <div data-slot="settings-list-add" data-disabled className={classes}>
        {children}
      </div>
    )
  }
  return (
    <button
      type="button"
      data-slot="settings-list-add"
      className={cn(
        classes,
        "cursor-pointer outline-none hover:bg-muted hover:text-foreground focus-visible:bg-muted focus-visible:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset"
      )}
      {...props}
    >
      <PlusIcon aria-hidden />
      {children}
    </button>
  )
}

export {
  SettingsList,
  SettingsListAdd,
  SettingsListGroupLabel,
  SettingsListItem,
  SettingsListItemActions,
  SettingsListItemDescription,
  SettingsListItemMeta,
  SettingsListLockBadge,
  SettingsListName,
  SettingsListNameInput,
  type SettingsListItemProps,
  type SettingsListLabels,
}
