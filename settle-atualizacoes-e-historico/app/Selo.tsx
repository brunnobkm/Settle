// Selo "Atualização": aparece no card do Board, no card de Recomendadas, no cabeçalho da página
// da licitação, na coluna Edital da Tabela e no chip do Calendário, quando há atualização do
// portal que o usuário ainda não viu. O clique abre o sheet de atualizações. Some quando a pessoa vê as atualizações (abre o
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
  pequeno = false,
  dentroDeBotao = false,
  className,
}: {
  licitacaoId: string
  /** Versão menor (Tabela e Calendário). */
  pequeno?: boolean
  /** Dentro de outro botão (chip do Calendário): vira span com role="button". */
  dentroDeBotao?: boolean
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

  const classes = cn(
    "inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-md bg-warning font-medium text-warning-foreground",
    "outline-none hover:bg-warning/90 focus-visible:ring-3 focus-visible:ring-ring/50",
    pequeno ? "px-1.5 text-[11px] leading-4.5 [&_svg]:size-3" : "px-2 py-0.5 text-xs leading-5 [&_svg]:size-3.5",
    className
  )
  const conteudo = (
    <>
      <RefreshCwIcon aria-hidden className="shrink-0" />
      Atualização
    </>
  )

  if (dentroDeBotao)
    return (
      <span
        role="button"
        tabIndex={0}
        data-sem-abrir
        aria-label={rotulo}
        onClick={abrir}
        onKeyDown={(e) => {
          if (e.key !== "Enter" && e.key !== " ") return
          e.preventDefault()
          e.stopPropagation()
          abrirAtualizacoes(licitacaoId)
        }}
        className={classes}
      >
        {conteudo}
      </span>
    )

  return (
    <button type="button" data-sem-abrir aria-label={rotulo} onClick={abrir} className={classes}>
      {conteudo}
    </button>
  )
}

