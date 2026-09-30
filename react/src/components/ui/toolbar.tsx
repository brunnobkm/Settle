import * as React from "react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"

// Barra de ações de uma área, no mesmo bloco visual das abas: um grupo com fundo sutil
// e botões sem contorno, que ganham o fundo da superfície no hover. É o par da TabsList
// quando as abas dizem o que se está vendo e a barra junta o que dá para fazer com aquilo
// ("Filtrar", "Ordenar", "Exportar"). Composição: Toolbar > ToolbarButton / ToolbarSeparator.
//
// Não confundir com ActionBar, que é a barra flutuante das ações em lote.

function Toolbar({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="toolbar"
      data-slot="toolbar"
      // a mesma altura e o mesmo raio da TabsList: as duas ficam lado a lado e alinhadas
      className={cn(
        "inline-flex h-9 w-fit items-center gap-0.5 rounded-lg bg-muted p-[3px] text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function ToolbarButton({
  className,
  variant = "ghost",
  size = "sm",
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      data-slot="toolbar-button"
      variant={variant}
      size={size}
      className={cn(
        "h-full rounded-md text-foreground/70 hover:bg-background hover:text-foreground aria-expanded:bg-background aria-expanded:text-foreground",
        className
      )}
      {...props}
    />
  )
}

function ToolbarSeparator({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="toolbar-separator"
      className={cn("mx-0.5 h-4.5 w-px shrink-0 bg-border", className)}
      {...props}
    />
  )
}

export { Toolbar, ToolbarButton, ToolbarSeparator }
