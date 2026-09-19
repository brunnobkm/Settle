// Peças pequenas usadas pelas várias partes da tela.

import { useLayoutEffect, useRef, useState, type ReactElement, type RefObject } from "react"

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

/** Texto com reticência: a dica mostra o valor completo só quando ele está cortado. */
export function Truncado({ texto, className }: { texto: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [aberta, setAberta] = useState(false)
  return (
    <Tooltip
      open={aberta}
      onOpenChange={(v) => {
        const el = ref.current
        setAberta(v && !!el && el.scrollWidth > el.clientWidth + 1)
      }}
    >
      <TooltipTrigger asChild>
        <span ref={ref} className={cn("block min-w-0 truncate", className)}>
          {texto}
        </span>
      </TooltipTrigger>
      <TooltipContent sideOffset={4}>{texto}</TooltipContent>
    </Tooltip>
  )
}

/** Altura atual de um elemento (acompanha mudanças de tamanho). */
export function useAltura(ref: RefObject<HTMLElement | null>) {
  const [altura, setAltura] = useState(0)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const medir = () => setAltura(el.getBoundingClientRect().height)
    medir()
    const ro = new ResizeObserver(medir)
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  return altura
}

/** Largura interna (sem a barra de rolagem) de um elemento. */
export function useLarguraInterna(ref: RefObject<HTMLElement | null>) {
  const [largura, setLargura] = useState(0)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const medir = () => setLargura(el.clientWidth)
    medir()
    const ro = new ResizeObserver(medir)
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  return largura
}

/** Altura da janela (recalcula ao redimensionar). */
export function useAlturaDaJanela() {
  const [altura, setAltura] = useState(() => window.innerHeight)
  useLayoutEffect(() => {
    const medir = () => setAltura(window.innerHeight)
    window.addEventListener("resize", medir)
    return () => window.removeEventListener("resize", medir)
  }, [])
  return altura
}

/* Fundos opacos com tom semântico (para colunas e cabeçalhos que grudam ao rolar). */
export const FUNDO = {
  marca: "bg-[color-mix(in_oklab,var(--primary)_14%,var(--background))]",
  suave: "bg-[color-mix(in_oklab,var(--muted)_50%,var(--background))]",
}
/** Fundo da célula fixa quando a linha está sob o mouse (escrito por extenso para o Tailwind achar). */
export const HOVER_LINHA = "group-hover/row:bg-[color-mix(in_oklab,var(--muted)_50%,var(--background))]"

export function copiar(texto: string) {
  navigator.clipboard?.writeText(texto).catch(() => {})
}
