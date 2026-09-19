// Peças pequenas usadas em várias partes da tela: chip de variável, selos de
// momento, de fonte e de origem, o ícone de estado de um item e o aviso do que o
// protótipo não simula.

import type { ReactNode } from "react"
import { CheckIcon, LockIcon, MinusIcon, XIcon } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { TokenChip, type TokenFieldToken } from "@/components/ui/token-field"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

import { GATILHOS, type Agente, type StatusItem, type Variavel } from "./dados"
import { useSim } from "./estado"
import { descAgenda, momentoDe } from "./regras"

/** Um lugar só: o que o protótipo não simula avisa em vez de fingir que funciona. */
export function naoSimulado(oque: string) {
  toast(`${oque}: esta área não foi simulada no protótipo`)
}

/* ------------------------------------------------------------------ */
/* Variável como objeto dentro do texto                                */
/* ------------------------------------------------------------------ */

/*
  Três estados: em ordem, alterada desde que a instrução foi escrita, e excluída. O
  verde não pode ser o único estado: quem exclui uma variável precisa ver a mudança nos
  agentes que a usavam.
*/
export function tokenDaVar(k: string, vars: Record<string, Variavel>, varsEx: Record<string, string>): TokenFieldToken {
  const v = vars[k]
  if (!v) {
    return {
      label: varsEx[k] ?? k,
      tone: "destructive",
      title: "Esta variável foi excluída. A instrução não tem mais como preencher este pedaço.",
    }
  }
  if (v.alterada) return { label: v.nome, tone: "warning", title: "Esta variável mudou depois que a instrução foi escrita." }
  return { label: v.nome }
}

/** Chip de variável em leitura, com a explicação do estado e o atalho para conferir a mudança. */
export function VarChip({ k, aoVerMudancas }: { k: string; aoVerMudancas?: (k: string) => void }) {
  const { cfg } = useSim()
  const token = tokenDaVar(k, cfg.vars, cfg.varsEx)
  const chip = <TokenChip tone={token.tone}>{token.label}</TokenChip>
  if (!token.title) return chip
  const alterada = token.tone === "warning"
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <TokenChip tone={token.tone} tabIndex={0} className="cursor-help">
          {token.label}
        </TokenChip>
      </TooltipTrigger>
      <TooltipContent className="max-w-70">
        <span>
          {token.title}
          {/* o atalho mora no tooltip: o chip é a variável, e não pode virar dois elementos */}
          {alterada && aoVerMudancas && (
            <button
              type="button"
              className="ml-1 font-semibold underline underline-offset-2"
              onClick={() => aoVerMudancas(k)}
            >
              Ver mudanças
            </button>
          )}
        </span>
      </TooltipContent>
    </Tooltip>
  )
}

/* ------------------------------------------------------------------ */
/* Selos                                                               */
/* ------------------------------------------------------------------ */

/* Gatilho: uma cor por momento em que o agente roda. Agendado vira selo com o próprio horário. */
const COR_DO_MOMENTO = {
  captura: "category-4",
  recomendadas: "category-1",
  analise: "primary",
  demanda: "category-5",
  agendado: "success",
} as const

export function TagGatilho({ agente }: { agente: Pick<Agente, "gatilho" | "agenda"> }) {
  const m = momentoDe(agente.gatilho)
  const conhecido = Object.values(GATILHOS).includes(agente.gatilho as (typeof GATILHOS)[keyof typeof GATILHOS])
  if (m === "agendado") {
    return (
      <Badge variant="success" className="rounded-full font-medium">
        {descAgenda(agente.agenda)}
      </Badge>
    )
  }
  const cor = conhecido && m ? COR_DO_MOMENTO[m] : null
  return (
    <Badge
      variant={cor && cor !== "primary" ? cor : "secondary"}
      className={cn("rounded-full font-normal", cor === "primary" && "bg-primary/10 text-primary")}
    >
      {agente.gatilho}
    </Badge>
  )
}

/* Cada fonte com a própria cor: numa tabela com muitas linhas, a ordem de busca se lê de relance. */
type TomDeSelo = "primary" | "secondary" | `category-${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}`

const COR_DA_FONTE: Record<string, TomDeSelo> = {
  "Edital e anexos": "category-1",
  "Termo de referência": "primary",
  "Minuta do contrato": "category-5",
  "Estudo técnico preliminar": "category-4",
  Manifestações: "category-8",
  "Arquivos de resultado": "category-2",
  "Dados do portal": "secondary",
  "Bases públicas": "category-7",
  "Outros arquivos": "category-6",
}

export function TagFonte({ fonte }: { fonte: string }) {
  const cor = COR_DA_FONTE[fonte] ?? "secondary"
  return (
    <Badge
      variant={cor === "primary" ? "secondary" : cor}
      className={cn("rounded-md px-1.75 text-[11px] font-normal", cor === "primary" && "bg-primary/10 text-primary")}
    >
      {fonte}
    </Badge>
  )
}

/** De quem é a variável: a da Settle o cliente usa, mas não edita. */
export function TagOrigem({ settle, empresa }: { settle?: boolean; empresa: string }) {
  if (settle) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" tabIndex={0} className="rounded-full font-normal text-muted-foreground">
            <LockIcon data-icon="inline-start" />
            Settle
          </Badge>
        </TooltipTrigger>
        <TooltipContent>Variável padrão da Settle: você pode usar em qualquer agente, mas não pode editar.</TooltipContent>
      </Tooltip>
    )
  }
  return (
    <Badge variant="outline" className="rounded-full border-primary/30 bg-primary/10 font-normal text-primary">
      {empresa}
    </Badge>
  )
}

/** Estado de um item de resultado: o ícone muda junto com a cor. */
export function IconeDeStatus({ st, className }: { st: StatusItem; className?: string }) {
  const Icone = st === "ok" ? CheckIcon : st === "no" ? XIcon : MinusIcon
  const rotulo = st === "ok" ? "Atende" : st === "no" ? "Não atende" : "Não avaliado"
  return (
    <Icone
      role="img"
      aria-label={rotulo}
      className={cn(
        "size-3.5 shrink-0",
        st === "ok" ? "text-success" : st === "no" ? "text-warning" : "text-muted-foreground",
        className
      )}
    />
  )
}

/** Selo de estado de um item (Atende, Não atende, Não se aplica/avaliado). */
export function SeloDeStatus({ st, na = "Não avaliado" }: { st: StatusItem; na?: string }) {
  if (st === "ok") return <Badge variant="success">Atende</Badge>
  if (st === "no") return <Badge variant="warning">Não atende</Badge>
  return <Badge variant="secondary">{na}</Badge>
}

/** Texto de apoio abaixo de um campo. */
export function Dica({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-xs leading-[17px] text-muted-foreground", className)}>{children}</p>
}
