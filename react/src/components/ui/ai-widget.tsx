import * as React from "react"
import { GripVerticalIcon, SparklesIcon } from "lucide-react"

import { cn } from "@/lib/utils"

// Moldura de um resultado produzido por IA (um agente, um assistente): a borda e o
// fundo na cor da marca dizem de onde veio o conteúdo antes de a pessoa ler uma linha.
// Composição: AiWidget > AiWidgetHeader (AiWidgetHandle, AiWidgetTitle, AiWidgetActions)
// + AiWidgetContent (+ AiWidgetNote). Todo o texto vem por props/children.

function AiWidget({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="ai-widget"
      className={cn(
        "group/ai-widget rounded-2xl border-2 border-primary bg-linear-to-b from-primary/5 to-primary/20 p-1.5",
        "data-[dragging=true]:opacity-50 data-[drop-target=true]:outline-2 data-[drop-target=true]:outline-offset-3 data-[drop-target=true]:outline-primary data-[drop-target=true]:outline-dashed",
        className
      )}
      {...props}
    />
  )
}

function AiWidgetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="ai-widget-header"
      className={cn(
        "flex flex-wrap items-center gap-2.5 px-2.5 pt-2 pb-3 sm:flex-nowrap",
        className
      )}
      {...props}
    />
  )
}

/** Alça de arrastar: só aparece com o mouse sobre o widget (parada, ela é ruído). */
function AiWidgetHandle({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="ai-widget-handle"
      aria-hidden
      className={cn(
        "flex shrink-0 cursor-grab text-muted-foreground opacity-0 transition-opacity group-hover/ai-widget:opacity-100 active:cursor-grabbing [&_svg]:size-3.5",
        className
      )}
      {...props}
    >
      <GripVerticalIcon />
    </span>
  )
}

/** Nome de quem produziu o resultado, com o ícone de IA (troque por `icon`). */
function AiWidgetTitle({
  icon,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & { icon?: React.ReactNode }) {
  return (
    <div
      data-slot="ai-widget-title"
      className={cn(
        "flex min-w-0 flex-1 items-center gap-2 text-base font-semibold text-primary [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {icon ?? <SparklesIcon aria-hidden />}
      <span className="min-w-0 truncate">{children}</span>
    </div>
  )
}

function AiWidgetActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="ai-widget-actions"
      className={cn("flex shrink-0 items-center gap-2 max-sm:w-full", className)}
      {...props}
    />
  )
}

function AiWidgetContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="ai-widget-content"
      className={cn(
        "rounded-xl border border-primary/20 bg-card p-4 text-sm text-card-foreground",
        className
      )}
      {...props}
    />
  )
}

/** Explicação curta do resultado, abaixo do conteúdo. */
function AiWidgetNote({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="ai-widget-note"
      className={cn("mt-2 text-xs leading-[18px] text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  AiWidget,
  AiWidgetActions,
  AiWidgetContent,
  AiWidgetHandle,
  AiWidgetHeader,
  AiWidgetNote,
  AiWidgetTitle,
}
