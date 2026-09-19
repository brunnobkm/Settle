// Peças pequenas usadas pelas várias partes da tela.

import { useLayoutEffect, useRef, type ReactElement } from "react"

import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

/** Dica ao passar o mouse (substitui os data-tip do protótipo). */
export function Dica({
  texto,
  lado,
  children,
}: {
  texto: string
  lado?: "top" | "bottom" | "left" | "right"
  children: ReactElement
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={lado} sideOffset={4}>
        {texto}
      </TooltipContent>
    </Tooltip>
  )
}

/**
 * Texto editável no lugar (estilo Notion): clica, corrige e confirma com Enter ou ao sair.
 * O texto é escrito direto no DOM para o cursor não pular enquanto a pessoa digita.
 */
export function Editavel({
  valor,
  rotulo,
  onConfirmar,
  className,
  autoFocus,
}: {
  valor: string
  rotulo: string
  onConfirmar: (texto: string) => void
  className?: string
  autoFocus?: boolean
}) {
  const ref = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (el && document.activeElement !== el && el.textContent !== valor) el.textContent = valor
  }, [valor])

  useLayoutEffect(() => {
    const el = ref.current
    if (!autoFocus || !el) return
    el.focus()
    document.getSelection()?.selectAllChildren(el)
  }, [autoFocus])

  return (
    <span
      ref={ref}
      role="textbox"
      aria-label={rotulo}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      className={cn(
        "-mx-0.75 -my-px cursor-text rounded-sm px-0.75 py-px outline-none hover:bg-muted hover:shadow-[inset_0_0_0_1px_var(--border)] focus:bg-background focus:shadow-[0_0_0_2px_color-mix(in_oklab,var(--primary)_25%,transparent)]",
        className
      )}
      onBlur={(e) => onConfirmar(e.currentTarget.textContent?.trim() ?? "")}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault()
          e.currentTarget.blur()
        }
      }}
    />
  )
}

/* Fundos opacos com tom semântico (para colunas e cabeçalhos que grudam ao rolar). */
export const FUNDO = {
  ok: "bg-[color-mix(in_oklab,var(--success)_10%,var(--background))]",
  no: "bg-[color-mix(in_oklab,var(--destructive)_10%,var(--background))]",
  marca: "bg-[color-mix(in_oklab,var(--primary)_12%,var(--background))]",
}
