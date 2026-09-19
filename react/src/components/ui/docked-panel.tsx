import * as React from "react"

import { cn } from "@/lib/utils"

// Painel lateral acoplado: fica ao lado do conteúdo e o empurra (não cobre a página,
// ao contrário do Sheet). A largura é em % da janela (vw) e pode ser ajustada pela
// alça na borda interna, arrastando ou com as setas do teclado. Todo o texto vem por props.
//
// Uso: coloque-o como irmão do conteúdo principal num contêiner flex.
//   <div className="flex">
//     <main className="min-w-0 flex-1">...</main>
//     <DockedPanel open width={40} minWidth={30} maxWidth={60} onWidthChange={setW}>...</DockedPanel>
//   </div>

type DockedPanelProps = React.ComponentProps<"aside"> & {
  open: boolean
  /** Largura em vw (0 a 100). */
  width: number
  /** Limites da alça, em vw. Padrão: 20 e 90. */
  minWidth?: number
  maxWidth?: number
  /** Chamado ao arrastar a alça ou usar as setas. Sem ele a alça não aparece. */
  onWidthChange?: (width: number) => void
  /** Lado da tela onde o painel fica. Padrão: right. */
  side?: "left" | "right"
  /** Nome acessível da alça de redimensionar. */
  resizeLabel?: string
  /** Passo das setas do teclado, em vw. Padrão: 2. */
  step?: number
}

function DockedPanel({
  open,
  width,
  minWidth = 20,
  maxWidth = 90,
  onWidthChange,
  side = "right",
  resizeLabel = "Redimensionar painel",
  step = 2,
  className,
  style,
  children,
  ...props
}: DockedPanelProps) {
  const [resizing, setResizing] = React.useState(false)

  const clamp = React.useCallback(
    (value: number) => Math.min(maxWidth, Math.max(minWidth, value)),
    [minWidth, maxWidth]
  )

  const widthFromPointer = (clientX: number) => {
    const fromEdge = side === "right" ? window.innerWidth - clientX : clientX
    return clamp((fromEdge / window.innerWidth) * 100)
  }

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!onWidthChange) return
    event.preventDefault()
    event.currentTarget.setPointerCapture?.(event.pointerId)
    setResizing(true)
    onWidthChange(widthFromPointer(event.clientX))
  }

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!resizing || !onWidthChange) return
    onWidthChange(widthFromPointer(event.clientX))
  }

  const stopResize = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!resizing) return
    event.currentTarget.releasePointerCapture?.(event.pointerId)
    setResizing(false)
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!onWidthChange) return
    // a seta que aponta para o conteúdo aumenta o painel
    const grow = side === "right" ? "ArrowLeft" : "ArrowRight"
    const shrink = side === "right" ? "ArrowRight" : "ArrowLeft"
    let next: number | null = null
    if (event.key === grow) next = width + step
    if (event.key === shrink) next = width - step
    if (event.key === "Home") next = minWidth
    if (event.key === "End") next = maxWidth
    if (next === null) return
    event.preventDefault()
    onWidthChange(clamp(next))
  }

  // enquanto arrasta, o texto da página não é selecionado e o cursor fica fixo
  React.useEffect(() => {
    if (!resizing) return
    const { userSelect, cursor } = document.body.style
    document.body.style.userSelect = "none"
    document.body.style.cursor = "ew-resize"
    return () => {
      document.body.style.userSelect = userSelect
      document.body.style.cursor = cursor
    }
  }, [resizing])

  return (
    <aside
      data-slot="docked-panel"
      data-state={open ? "open" : "closed"}
      data-side={side}
      data-resizing={resizing || undefined}
      aria-hidden={!open}
      inert={!open}
      style={{ "--docked-panel-width": `${width}vw`, ...style } as React.CSSProperties}
      className={cn(
        "relative flex min-h-svh shrink-0 flex-col overflow-hidden bg-background transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] data-resizing:transition-none",
        "data-[state=closed]:w-0 data-[state=closed]:border-0 data-[state=open]:w-(--docked-panel-width)",
        side === "right" ? "border-l" : "border-r",
        className
      )}
      {...props}
    >
      {children}
      {onWidthChange && open && (
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label={resizeLabel}
          aria-valuenow={Math.round(width)}
          aria-valuemin={minWidth}
          aria-valuemax={maxWidth}
          tabIndex={0}
          data-slot="docked-panel-handle"
          data-resizing={resizing || undefined}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={stopResize}
          onPointerCancel={stopResize}
          onKeyDown={onKeyDown}
          className={cn(
            "absolute inset-y-0 w-2 cursor-ew-resize touch-none outline-none",
            "before:absolute before:inset-y-0 before:w-px before:bg-transparent before:transition-colors hover:before:bg-border focus-visible:before:w-0.5 focus-visible:before:bg-ring data-resizing:before:bg-border",
            side === "right" ? "left-0 before:left-0" : "right-0 before:right-0"
          )}
        />
      )}
    </aside>
  )
}

export { DockedPanel, type DockedPanelProps }
