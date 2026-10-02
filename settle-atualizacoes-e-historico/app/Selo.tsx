// Selo "Atualização": aparece no card do Board, no card de Recomendadas, no cabeçalho da página
// da licitação e como ponto na Tabela, quando há atualização do portal que o usuário ainda não
// viu. O clique abre o sheet de atualizações. Some quando a pessoa vê as atualizações (abre o
// sheet) ou depois de DIAS_DO_SELO dias.

import { createContext, useContext, type MouseEvent } from "react"
import { RefreshCwIcon } from "lucide-react"

import { cn } from "@/lib/utils"

import type { Atualizacao } from "./atualizacoes"

type Contexto = {
  novasDe: (licitacaoId: string) => Atualizacao[]
  abrirAtualizacoes: (licitacaoId: string) => void
}

/** O App fornece; Board, Tabela, Calendário, Recomendadas e a página da licitação leem. */
export const NovasContext = createContext<Contexto>({ novasDe: () => [], abrirAtualizacoes: () => {} })
export const useNovas = (licitacaoId: string) => useContext(NovasContext).novasDe(licitacaoId)

export function SeloAtualizacao({
  licitacaoId,
  compacto = false,
  className,
}: {
  licitacaoId: string
  /** Só o ponto (Tabela e Calendário). */
  compacto?: boolean
  className?: string
}) {
  const { novasDe, abrirAtualizacoes } = useContext(NovasContext)
  const novas = novasDe(licitacaoId)
  if (!novas.length) return null

  const rotulo = `Atualização: ${novas.length === 1 ? "1 mudança nova" : `${novas.length} mudanças novas`}. Ver atualizações`
  const abrir = (e: MouseEvent) => {
    // dentro do card: não abre a licitação, só as atualizações
    e.stopPropagation()
    abrirAtualizacoes(licitacaoId)
  }

  if (compacto)
    return (
      <span
        role="img"
        aria-label={rotulo}
        title={rotulo}
        className={cn("size-2 shrink-0 rounded-full bg-warning", className)}
      />
    )

  return (
    <button
      type="button"
      data-sem-abrir
      aria-label={rotulo}
      onClick={abrir}
      className={cn(
        "inline-flex items-center gap-1 rounded-md bg-warning px-2 py-0.5 text-xs leading-5 font-medium text-warning-foreground",
        "outline-none hover:bg-warning/90 focus-visible:ring-3 focus-visible:ring-ring/50",
        className
      )}
    >
      <RefreshCwIcon aria-hidden className="size-3.5 shrink-0" />
      Atualização
    </button>
  )
}

/** Ponto clicável da Tabela (a célula é um botão próprio, fora do clique da linha). */
export function PontoAtualizacao({ licitacaoId }: { licitacaoId: string }) {
  const { novasDe, abrirAtualizacoes } = useContext(NovasContext)
  const n = novasDe(licitacaoId).length
  if (!n) return null
  return (
    <button
      type="button"
      aria-label={`Atualização: ${n === 1 ? "1 mudança nova" : `${n} mudanças novas`}. Ver atualizações`}
      title="Atualização"
      onClick={(e) => {
        e.stopPropagation()
        abrirAtualizacoes(licitacaoId)
      }}
      className="inline-flex size-5 items-center justify-center rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <span aria-hidden className="size-2 rounded-full bg-warning" />
    </button>
  )
}
