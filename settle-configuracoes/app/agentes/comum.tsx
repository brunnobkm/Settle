// Peças pequenas de Agentes e Variáveis: chip de variável, selos de momento, de fonte e
// de origem, o texto de apoio e a explicação de como a área funciona.

import { useState, type ReactNode } from "react"
import { ArrowRightIcon, LockIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TokenChip, type TokenFieldToken } from "@/components/ui/token-field"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

import { FORMATO_VAR, GATILHOS, type Agente, type Variavel } from "./dados"
import { useAgentes } from "./estado"
import { descAgenda, fontesDe, momentoDe } from "./regras"

/* ------------------------------------------------------------------ */
/* Variável como objeto dentro do texto                                */
/* ------------------------------------------------------------------ */

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
  return { label: v.nome, title: `${FORMATO_VAR[v.tipo].t} · procura em ${fontesDe(v).join(", ")}` }
}

/*
  Chip de variável em leitura. No teste, a Isadora pediu para ver o que a variável é sem
  sair de onde estava: o chip mostra o formato e onde ela procura, e leva à variável.
*/
export function VarChip({ k, aoAbrir }: { k: string; aoAbrir?: (k: string) => void }) {
  const { cfg } = useAgentes()
  const token = tokenDaVar(k, cfg.vars, cfg.varsEx)
  const v = cfg.vars[k]
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <TokenChip
          tone={token.tone}
          tabIndex={0}
          role={aoAbrir && v ? "button" : undefined}
          className={cn(aoAbrir && v ? "cursor-pointer" : "cursor-help")}
          onClick={() => v && aoAbrir?.(k)}
          onKeyDown={(e) => {
            if (v && aoAbrir && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault()
              aoAbrir(k)
            }
          }}
        >
          {token.label}
        </TokenChip>
      </TooltipTrigger>
      <TooltipContent className="max-w-72">
        {v ? (
          <span className="flex flex-col gap-0.5">
            <b className="font-semibold">{v.nome}</b>
            <span>{v.prompt}</span>
            <span className="opacity-80">{token.title}</span>
          </span>
        ) : (
          token.title
        )}
      </TooltipContent>
    </Tooltip>
  )
}

/* ------------------------------------------------------------------ */
/* Selos                                                               */
/* ------------------------------------------------------------------ */

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

/** Texto de apoio abaixo de um campo. */
export function Dica({ children, className, id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <p id={id} className={cn("text-xs leading-[17px] text-muted-foreground", className)}>
      {children}
    </p>
  )
}

/* ------------------------------------------------------------------ */
/* Como funciona                                                       */
/* ------------------------------------------------------------------ */

const CHAVE_COMO_FUNCIONA = "settle-configuracoes:como-funciona-agentes"

function lerFechado() {
  try {
    return window.localStorage.getItem(CHAVE_COMO_FUNCIONA) === "1"
  } catch {
    return false
  }
}

/*
  O problema mais grave do teste: ninguém separou agente de variável só olhando a tela, e
  em quatro de cinco sessões o conceito precisou ser explicado em voz alta. A explicação
  que funcionou nas sessões virou o topo das duas páginas: o dado, a tarefa e o lugar
  onde o resultado aparece, com um exemplo que atravessa os três. Quem já entendeu fecha,
  e a página lembra.
*/
export function ComoFunciona({ aoCriarVariavel, aoCriarAgente }: { aoCriarVariavel?: () => void; aoCriarAgente?: () => void }) {
  const [fechado, setFechado] = useState(lerFechado)
  if (fechado) {
    return (
      <button
        type="button"
        onClick={() => {
          setFechado(false)
          try {
            window.localStorage.removeItem(CHAVE_COMO_FUNCIONA)
          } catch {
            /* sem armazenamento: só não lembra */
          }
        }}
        className="mb-5 rounded-sm text-[13px] font-medium text-primary underline-offset-3 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        Como agentes e variáveis funcionam
      </button>
    )
  }
  const passos = [
    {
      n: "1",
      t: "Variável",
      d: "Um dado que a Settle tira de todo edital, sempre do mesmo jeito.",
      ex: "Atestado exigido: sim ou não",
      acao: aoCriarVariavel && { t: "Criar variável", f: aoCriarVariavel },
    },
    {
      n: "2",
      t: "Agente",
      d: "Uma tarefa que usa esses dados, como uma pessoa do time que faz sempre o mesmo trabalho.",
      ex: "Avisar quando o edital exigir atestado",
      acao: aoCriarAgente && { t: "Criar agente", f: aoCriarAgente },
    },
    {
      n: "3",
      t: "Resultado",
      d: "O que o agente produz aparece dentro da licitação, na aba que você escolher.",
      ex: "Um bloco na aba Habilitação",
    },
  ]
  return (
    <section aria-labelledby="como-funciona" className="relative mb-6 rounded-lg border bg-card p-4.5 pr-11">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Esconder a explicação"
        className="absolute top-2.5 right-2.5 text-muted-foreground"
        onClick={() => {
          setFechado(true)
          try {
            window.localStorage.setItem(CHAVE_COMO_FUNCIONA, "1")
          } catch {
            /* sem armazenamento: esconde só nesta visita */
          }
        }}
      >
        <XIcon />
      </Button>
      <h2 id="como-funciona" className="mb-3 text-sm font-semibold">
        Como funciona
      </h2>
      <ol className="grid grid-cols-1 gap-3 min-[760px]:grid-cols-[1fr_auto_1fr_auto_1fr] min-[760px]:items-start">
        {passos.map((p, i) => (
          <li key={p.n} className="contents">
            {i > 0 && <ArrowRightIcon aria-hidden className="mt-7 hidden size-4 text-muted-foreground min-[760px]:block" />}
            <div className="flex flex-col gap-1.5 rounded-md bg-muted/60 p-3">
              <span className="flex items-center gap-2 text-[13px] font-semibold">
                <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-[11px] text-primary">
                  {p.n}
                </span>
                {p.t}
              </span>
              <span className="text-[12.5px] leading-[18px] text-muted-foreground">{p.d}</span>
              <span className="text-[12.5px] leading-[18px]">
                <span className="text-muted-foreground">Ex.: </span>
                {p.ex}
              </span>
              {p.acao && (
                <Button variant="outline" size="xs" className="mt-1 self-start shadow-none" onClick={p.acao.f}>
                  {p.acao.t}
                </Button>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
