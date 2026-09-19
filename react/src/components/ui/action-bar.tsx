import * as React from "react"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

// Barra flutuante de ações em lote: aparece no rodapé, centralizada, quando há
// itens selecionados. Composição: ActionBar > ActionBarLabel, ActionBarSeparator,
// ActionBarGroup (ActionBarButton...), ActionBarClose. Todo o texto vem por props.

function ActionBar({
  open = true,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  /** Mostra ou esconde a barra (com transição). */
  open?: boolean
}) {
  return (
    <div
      role="toolbar"
      data-slot="action-bar"
      data-state={open ? "open" : "closed"}
      aria-hidden={!open}
      inert={!open}
      className={cn(
        "fixed bottom-4 left-1/2 z-50 flex h-11.5 -translate-x-1/2 items-center rounded-lg bg-primary pr-1 pl-4 text-primary-foreground shadow-lg transition-[opacity,translate] duration-200 ease-out",
        "data-[state=closed]:pointer-events-none data-[state=closed]:invisible data-[state=closed]:translate-y-2.5 data-[state=closed]:opacity-0",
        className
      )}
      {...props}
    />
  )
}

function ActionBarLabel({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="action-bar-label"
      aria-live="polite"
      className={cn("pr-4 text-sm font-medium whitespace-nowrap tabular-nums", className)}
      {...props}
    />
  )
}

function ActionBarSeparator({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="action-bar-separator"
      className={cn("h-5.5 w-px shrink-0 bg-primary-foreground/30", className)}
      {...props}
    />
  )
}

function ActionBarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="action-bar-group"
      className={cn("flex items-center", className)}
      {...props}
    />
  )
}

function ActionBarButton({
  className,
  type = "button",
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      type={type}
      data-slot="action-bar-button"
      className={cn(
        "inline-flex h-11.5 items-center gap-1.5 px-3.5 text-sm whitespace-nowrap outline-none transition-colors hover:bg-primary-foreground/15 focus-visible:bg-primary-foreground/15 focus-visible:ring-2 focus-visible:ring-primary-foreground/60 focus-visible:ring-inset disabled:pointer-events-none disabled:opacity-50 aria-expanded:bg-primary-foreground/15 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function ActionBarClose({
  className,
  label = "Limpar seleção",
  type = "button",
  ...props
}: Omit<React.ComponentProps<"button">, "children"> & {
  /** Nome acessível do botão (só ícone). */
  label?: string
}) {
  return (
    <button
      type={type}
      data-slot="action-bar-close"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-11.5 w-10 items-center justify-center rounded-r-md outline-none transition-colors hover:bg-primary-foreground/15 focus-visible:bg-primary-foreground/15 focus-visible:ring-2 focus-visible:ring-primary-foreground/60 focus-visible:ring-inset [&_svg]:size-4",
        className
      )}
      {...props}
    >
      <XIcon aria-hidden />
    </button>
  )
}

export {
  ActionBar,
  ActionBarButton,
  ActionBarClose,
  ActionBarGroup,
  ActionBarLabel,
  ActionBarSeparator,
}
