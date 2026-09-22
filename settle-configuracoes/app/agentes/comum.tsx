// Peças pequenas de Agentes e Variáveis: chip de variável, selos de momento, de fonte e
// de origem, o texto de apoio e a explicação de como a área funciona.

import { useState, type ReactNode } from "react"
import { ArrowRightIcon, LockIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TokenChip, type TokenFieldToken } from "@/components/ui/token-field"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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

/* A imagem do card: os três passos em miniatura (dado, tarefa, resultado), no tema da
   tela. Desenhada aqui para não depender de arquivo de imagem. */
function Ilustracao() {
  return (
    <svg viewBox="0 0 320 120" aria-hidden className="block h-auto w-full">
      <rect width="320" height="120" className="fill-primary/10" />
      {/* 1. variável */}
      <rect x="16" y="38" width="78" height="44" rx="8" className="fill-card stroke-border" />
      <rect x="26" y="50" width="40" height="6" rx="3" className="fill-muted-foreground/40" />
      <rect x="26" y="62" width="58" height="10" rx="4" className="fill-primary/20" />
      <rect x="30" y="65" width="34" height="4" rx="2" className="fill-primary" />
      {/* seta */}
      <path d="M102 60h18m-5-5 5 5-5 5" className="fill-none stroke-muted-foreground" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* 2. agente */}
      <rect x="128" y="30" width="64" height="60" rx="10" className="fill-card stroke-border" />
      <circle cx="160" cy="52" r="11" className="fill-primary" />
      <circle cx="156" cy="51" r="1.8" className="fill-primary-foreground" />
      <circle cx="164" cy="51" r="1.8" className="fill-primary-foreground" />
      <rect x="140" y="70" width="40" height="5" rx="2.5" className="fill-muted-foreground/40" />
      <rect x="146" y="79" width="28" height="4" rx="2" className="fill-muted-foreground/25" />
      {/* seta */}
      <path d="M200 60h18m-5-5 5 5-5 5" className="fill-none stroke-muted-foreground" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* 3. resultado na licitação */}
      <rect x="226" y="26" width="80" height="68" rx="8" className="fill-card stroke-border" />
      <rect x="236" y="36" width="44" height="6" rx="3" className="fill-muted-foreground/40" />
      <rect x="236" y="50" width="60" height="34" rx="6" className="fill-primary/10 stroke-primary/40" />
      <path d="m243 63 3 3 6-6" className="fill-none stroke-success" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="256" y="61" width="32" height="4" rx="2" className="fill-muted-foreground/40" />
      <path d="m243 75 3 3 6-6" className="fill-none stroke-success" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="256" y="73" width="24" height="4" rx="2" className="fill-muted-foreground/40" />
    </svg>
  )
}

/*
  O problema mais grave do teste: ninguém separou agente de variável só olhando a tela, e
  em quatro de cinco sessões o conceito precisou ser explicado em voz alta. Em vez de um
  bloco fixo no topo, um card no canto inferior direito convida a ver a explicação, e
  some quando a pessoa fecha ou já viu, até a página ser recarregada. A explicação abre numa janela: o dado, a tarefa e o
  lugar onde o resultado aparece, com um exemplo que atravessa os três.
*/
export function ComoFunciona({ aoCriarVariavel, aoCriarAgente }: { aoCriarVariavel?: () => void; aoCriarAgente?: () => void }) {
  /* Fechar vale até recarregar a página: a cada refresh o card volta (pedido do Brunno). */
  const [fechado, setFechado] = useState(false)
  const [aberto, setAberto] = useState(false)
  const fechar = () => setFechado(true)
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
    <>
      {!fechado && (
        <aside
          aria-labelledby="como-funciona-card"
          className="fixed right-6 bottom-6 z-40 w-[min(320px,calc(100vw-2rem))] overflow-hidden rounded-xl border bg-card shadow-lg"
        >
          <Ilustracao />
          <Button
            variant="secondary"
            size="icon-xs"
            aria-label="Fechar"
            className="absolute top-2 right-2 rounded-full bg-card/90 shadow-xs hover:bg-card"
            onClick={fechar}
          >
            <XIcon />
          </Button>
          <div className="flex flex-col gap-1.5 p-4">
            <h2 id="como-funciona-card" className="text-sm font-semibold">
              Agentes e variáveis, em três passos
            </h2>
            <p className="text-[13px] leading-[19px] text-muted-foreground">
              Entenda como um dado do edital vira uma tarefa que a Settle faz sozinha, e onde o resultado aparece na
              licitação.
            </p>
            <Button size="sm" className="mt-1.5 self-start" onClick={() => setAberto(true)}>
              Ver como funciona
            </Button>
          </div>
        </aside>
      )}
      <Dialog
        open={aberto}
        onOpenChange={(o) => {
          setAberto(o)
          // quem viu a explicação não precisa do convite de novo
          if (!o) fechar()
        }}
      >
        <DialogContent className="sm:max-w-[760px]">
          <DialogHeader>
            <DialogTitle>Como funciona</DialogTitle>
            <DialogDescription>Um exemplo atravessa os três passos: saber se o edital exige atestado.</DialogDescription>
          </DialogHeader>
          <ol className="grid grid-cols-1 gap-3 min-[640px]:grid-cols-[1fr_auto_1fr_auto_1fr] min-[640px]:items-start">
            {passos.map((p, i) => (
              <li key={p.n} className="contents">
                {i > 0 && <ArrowRightIcon aria-hidden className="mt-7 hidden size-4 text-muted-foreground min-[640px]:block" />}
                <div className="flex h-full flex-col gap-1.5 rounded-md bg-muted/60 p-3">
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
                    <Button
                      variant="outline"
                      size="xs"
                      className="mt-auto self-start shadow-none"
                      onClick={() => {
                        setAberto(false)
                        fechar()
                        p.acao!.f()
                      }}
                    >
                      {p.acao.t}
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </DialogContent>
      </Dialog>
    </>
  )
}
