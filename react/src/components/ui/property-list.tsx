import * as React from "react"

import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Lista de propriedades no estilo Notion (card de kanban, painel de item): linhas
// "valor" com o nome da propriedade numa dica no hover. Clicar no valor edita;
// o resto da linha fica livre (para abrir o item ou arrastar o card).
// Composição: PropertyList > PropertyRow > PropertyTrigger (+ PropertyText,
// PropertyChip, PropertyEmpty) ou PropertyInlineEdit durante a edição.
// Todo o texto vem por props; os editores (popovers) ficam na tela.

function PropertyList({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="property-list"
      className={cn("flex min-w-0 flex-col gap-0.5", className)}
      {...props}
    />
  )
}

/** Primeiro texto cortado (reticências ou limite de linhas) dentro do elemento. */
function clippedText(root: HTMLElement) {
  const clipped = (el: Element) =>
    el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1
  for (const el of root.querySelectorAll("[data-slot=property-text]")) {
    if (clipped(el)) return (el.textContent ?? "").replace(/\s+/g, " ").trim()
  }
  return ""
}

type PropertyRowProps = React.ComponentProps<"div"> & {
  /** Nome da propriedade: aparece na dica do hover. */
  label: string
  /** Lado da dica: left (padrão, não cobre o valor) ou top. */
  labelSide?: "left" | "top"
  /** Na dica, mostra também o texto completo quando um PropertyText está cortado. */
  showClippedText?: boolean
  /** Sem dica (ex.: durante um arraste ou com um painel por cima). */
  hideLabel?: boolean
  /** Editor da propriedade aberto: fundo de destaque e sem dica. */
  editing?: boolean
  /** Lugar reservado de uma linha sendo arrastada: fundo cinza, conteúdo invisível. */
  reserved?: boolean
}

function PropertyRow({
  ref: refProp,
  label,
  labelSide = "left",
  showClippedText = false,
  hideLabel = false,
  editing = false,
  reserved = false,
  className,
  children,
  ...props
}: PropertyRowProps) {
  const [open, setOpen] = React.useState(false)
  const [clipped, setClipped] = React.useState("")
  const ref = React.useRef<HTMLDivElement | null>(null)
  // a tela pode pedir o elemento da linha (ex.: animar a reordenação)
  const setRef = React.useCallback(
    (el: HTMLDivElement | null) => {
      ref.current = el
      if (typeof refProp === "function") refProp(el)
      else if (refProp) refProp.current = el
    },
    [refProp]
  )

  // arraste, painel ou edição por cima: fecha a dica para ela não voltar sozinha depois
  React.useEffect(() => {
    if (hideLabel || editing) setOpen(false)
  }, [hideLabel, editing])

  return (
    <Tooltip
      open={open && !hideLabel && !editing}
      onOpenChange={(next) => {
        // só no hover: o foco que volta de um editor fechado não reabre a dica
        if (next && !ref.current?.matches(":hover")) return
        if (next && showClippedText && ref.current) {
          const text = clippedText(ref.current)
          setClipped(text !== label ? text : "")
        }
        setOpen(next)
      }}
      delayDuration={250}
      // a dica não recebe o ponteiro: passar por cima dela vai direto para a linha de baixo
      disableHoverableContent
    >
      <TooltipTrigger asChild>
        <div
          ref={setRef}
          data-slot="property-row"
          data-editing={editing || undefined}
          data-reserved={reserved || undefined}
          className={cn(
            "group/property-row relative min-w-0 rounded-md px-2 py-1.5 text-[13px] leading-[1.4] text-foreground",
            "data-editing:bg-muted data-reserved:bg-foreground/5 data-reserved:*:invisible",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </TooltipTrigger>
      <TooltipContent
        side={labelSide}
        align={labelSide === "top" ? "start" : "center"}
        alignOffset={labelSide === "top" ? 8 : 0}
        sideOffset={labelSide === "top" ? 4 : 8}
        className={cn("pointer-events-none", clipped && "flex-col items-start gap-0.5 px-2.5 py-1.5")}
      >
        {clipped ? (
          <>
            <span className="text-[10px] font-medium tracking-[0.02em] text-background/60">
              {label}
            </span>
            <span className="max-w-80 text-xs leading-snug break-words">
              {clipped}
            </span>
          </>
        ) : (
          label
        )}
      </TooltipContent>
    </Tooltip>
  )
}

/**
 * Valor clicável (abre o editor). variant="text": fundo cinza no hover (textos e
 * dicas de vazio); variant="chip": só escurece (chips e selos coloridos).
 */
function PropertyTrigger({
  variant = "text",
  className,
  type = "button",
  ...props
}: React.ComponentProps<"button"> & { variant?: "text" | "chip" }) {
  return (
    <button
      type={type}
      data-slot="property-trigger"
      data-variant={variant}
      className={cn(
        "max-w-full cursor-pointer text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        variant === "text"
          ? "rounded-sm hover:bg-foreground/6"
          : "rounded-md transition-[filter] duration-120 hover:brightness-[.92]",
        className
      )}
      {...props}
    />
  )
}

/** Texto do valor com corte: 1 linha (reticências) ou 2 a 3 linhas. */
function PropertyText({
  lines = 1,
  className,
  ...props
}: React.ComponentProps<"span"> & { lines?: 1 | 2 | 3 }) {
  return (
    <span
      data-slot="property-text"
      className={cn(
        "min-w-0 break-words",
        lines === 1 && "block truncate",
        lines === 2 && "line-clamp-2",
        lines === 3 && "line-clamp-3",
        className
      )}
      {...props}
    />
  )
}

/** Chip neutro e oval (ex.: pessoa responsável). */
function PropertyChip({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="property-chip"
      className={cn(
        "inline-block max-w-full truncate rounded-full bg-foreground/5 px-2 py-0.5 text-xs leading-[1.4] text-foreground",
        className
      )}
      {...props}
    />
  )
}

/** Dica de propriedade vazia (ex.: "Adicionar segmento"). */
function PropertyEmpty({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="property-empty"
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  )
}

type PropertyInlineEditProps = {
  defaultValue: string
  /** Nome do campo para leitores de tela. */
  label: string
  /** Várias linhas (textarea). Salva com Cmd/Ctrl+Enter; uma linha salva com Enter. */
  multiline?: boolean
  /** Texto fixo antes do campo (ex.: "R$"). */
  prefix?: React.ReactNode
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]
  /** Salva ao sair do campo ou com Enter. */
  onCommit: (value: string) => void
  /** Esc: sai sem salvar. */
  onCancel: () => void
  className?: string
}

/** Edição do valor na própria linha: salva ao sair do campo, Esc cancela. */
function PropertyInlineEdit({
  defaultValue,
  label,
  multiline = false,
  prefix,
  inputMode,
  onCommit,
  onCancel,
  className,
}: PropertyInlineEditProps) {
  const cancelled = React.useRef(false)
  const shared = {
    autoFocus: true,
    defaultValue,
    "aria-label": label,
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      e.currentTarget.select(),
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (cancelled.current) onCancel()
      else onCommit(e.currentTarget.value)
    },
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (e.key === "Escape") {
        e.preventDefault()
        e.stopPropagation()
        cancelled.current = true
        e.currentTarget.blur()
      } else if (e.key === "Enter" && (!multiline || e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        e.currentTarget.blur()
      }
    },
    // o clique no campo não chega ao card (que abriria o item)
    onClick: (e: React.MouseEvent) => e.stopPropagation(),
    onPointerDown: (e: React.PointerEvent) => e.stopPropagation(),
  }
  const field = "w-full min-w-0 bg-transparent p-0 text-inherit outline-none"

  return (
    <span
      data-slot="property-inline-edit"
      className={cn("flex w-full items-baseline gap-1", className)}
    >
      {prefix != null && (
        <span className="shrink-0 text-muted-foreground">{prefix}</span>
      )}
      {multiline ? (
        <textarea
          {...shared}
          className={cn(field, "field-sizing-content min-h-18 resize-y leading-[1.4]")}
        />
      ) : (
        <input {...shared} type="text" inputMode={inputMode} className={field} />
      )}
    </span>
  )
}

export {
  PropertyChip,
  PropertyEmpty,
  PropertyInlineEdit,
  PropertyList,
  PropertyRow,
  PropertyText,
  PropertyTrigger,
  type PropertyInlineEditProps,
  type PropertyRowProps,
}
