// Selo "Atualizada": aparece no card (Board, Recomendadas), na linha da Tabela e no chip do
// Calendário quando a licitação tem atualização do portal que o usuário ainda não viu.
// Some ao abrir a licitação ou depois de DIAS_DO_SELO dias. Âmbar quando a mudança pede ação
// (sessão adiantada, suspensão, conflito com valor editado); teal nos outros casos.

import { createContext, useContext } from "react"
import { RefreshCwIcon } from "lucide-react"

import { cn } from "@/lib/utils"

import { resumoDoSelo, type Atualizacao } from "./atualizacoes"

export function SeloAtualizacao({
  novas,
  compacto = false,
  className,
}: {
  novas: Atualizacao[]
  /** Só o ponto (Tabela e Calendário). */
  compacto?: boolean
  className?: string
}) {
  const r = resumoDoSelo(novas)
  if (!r) return null
  const rotulo = `Atualizada: ${r.texto}${r.extras ? ` e mais ${r.extras}` : ""}`

  if (compacto)
    return (
      <span
        role="img"
        aria-label={rotulo}
        title={rotulo}
        className={cn("size-2 shrink-0 rounded-full", r.urgente ? "bg-warning" : "bg-primary", className)}
      />
    )

  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-md px-2 py-1 text-xs leading-tight font-semibold",
        r.urgente ? "bg-warning/10 text-warning-strong" : "bg-primary/10 text-primary",
        className
      )}
    >
      <RefreshCwIcon aria-hidden className="size-3.5 shrink-0" />
      <span className="truncate">{r.texto}</span>
      {r.extras > 0 && <span className="shrink-0 font-medium opacity-80">+{r.extras}</span>}
    </span>
  )
}

/** Atualizações não vistas por licitação: o App fornece, Board/Tabela/Calendário leem. */
export const NovasContext = createContext<(licitacaoId: string) => Atualizacao[]>(() => [])
export const useNovas = (licitacaoId: string) => useContext(NovasContext)(licitacaoId)
