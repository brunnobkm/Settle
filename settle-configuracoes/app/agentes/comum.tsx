// Peças pequenas de Agentes e Variáveis: chip de variável, selos de momento, de fonte e
// de origem, o texto de apoio e a explicação de como a área funciona.

import { useState, type ReactNode } from "react"
import { ArrowRightIcon, ChevronDownIcon, InfoIcon, LockIcon, MessageCircleIcon, SlidersHorizontalIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TokenChip, type TokenFieldToken } from "@/components/ui/token-field"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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

/*
  O "i" do cabeçalho de uma coluna, com a explicação ao passar o mouse. Dentro de um
  cabeçalho que já é botão (o menu de ordenar e filtrar), ele não pode receber foco: o
  mesmo texto vai para o topo do menu, que é por onde o teclado chega.
*/
export function InfoDaColuna({ texto, focavel }: { texto: ReactNode; focavel?: boolean }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          tabIndex={focavel ? 0 : undefined}
          aria-label={focavel ? "O que é esta coluna" : undefined}
          aria-hidden={focavel ? undefined : true}
          className="ml-1 flex shrink-0 cursor-help rounded-full text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <InfoIcon className="size-3.5" />
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-64 font-normal normal-case">{texto}</TooltipContent>
    </Tooltip>
  )
}

/*
  Criar tem dois caminhos, como em Tarefas agendadas do Claude: conversando (as perguntas
  uma de cada vez, com o resultado montado ao lado) ou configurando manualmente (o
  formulário). Conversando vem primeiro: foi o caminho que faltou no teste de 21/09.
*/
export function BotaoDeCriar({
  rotulo,
  oque,
  aoConversar,
  aoConfigurar,
  className,
}: {
  rotulo: string
  /** "uma variável", "um agente": entra nos textos das duas opções. */
  oque: string
  aoConversar: () => void
  aoConfigurar: () => void
  className?: string
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className={className}>
          {rotulo}
          <ChevronDownIcon data-icon="inline-end" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuItem onSelect={aoConversar} className="items-start gap-2.5 py-2">
          <MessageCircleIcon className="mt-0.5" />
          <span className="flex flex-col">
            <span className="font-medium">Criar conversando</span>
            <span className="text-xs text-muted-foreground">Converse com a nossa IA para ela ajudar você a criar {oque}.</span>
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={aoConfigurar} className="items-start gap-2.5 py-2">
          <SlidersHorizontalIcon className="mt-0.5" />
          <span className="flex flex-col">
            <span className="font-medium">Configurar manualmente</span>
            <span className="text-xs text-muted-foreground">Preencha o formulário você mesmo, do zero ou a partir de um modelo.</span>
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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

/* A imagem do card: os três passos em miniatura (pergunta, tarefa, resultado), no tema da
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

/* ------------------------------------------------------------------ */
/* Como funciona: passo a passo com um exemplo                         */
/* ------------------------------------------------------------------ */

/** Moldura das miniaturas: o mesmo desenho das telas de verdade, em escala menor. */
function Miniatura({ children, rotulo }: { children: ReactNode; rotulo: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">{rotulo}</span>
      <div className="rounded-lg border bg-card p-3.5 text-[13px] leading-[19px] shadow-xs">{children}</div>
    </div>
  )
}

/*
  Os quatro passos seguem um caso só, do começo ao fim, porque foi assim que o conceito
  ficou claro nas sessões do teste de 21/09: com o exemplo na mão, não com a definição.
  Cada passo tem uma pergunta de título, a resposta em uma frase e a miniatura do que a
  pessoa vai encontrar na tela.
*/
const PASSOS: { t: string; d: ReactNode; mini: ReactNode }[] = [
  {
    t: "A variável faz uma pergunta ao edital",
    d: (
      <>
        Você cria a pergunta uma vez e a Settle responde em <b>todo edital</b>, sempre do mesmo jeito. Sozinha, a
        variável só guarda a resposta: ela não faz mais nada.
      </>
    ),
    mini: (
      <Miniatura rotulo="Variáveis">
        <div className="flex items-center justify-between gap-2">
          <b className="font-semibold">Atestado exigido</b>
          <Badge variant="secondary" className="font-normal">Sim ou não</Badge>
        </div>
        <p className="mt-0.5 text-muted-foreground">O edital exige atestado de capacidade técnica?</p>
        <ul className="mt-2.5 flex flex-col gap-1 border-t pt-2.5">
          <li className="flex justify-between"><span className="text-muted-foreground">PE 90014/2026</span><b className="font-semibold">Sim</b></li>
          <li className="flex justify-between"><span className="text-muted-foreground">PE 00312/2026</span><b className="font-semibold">Não</b></li>
          <li className="flex justify-between"><span className="text-muted-foreground">PE 00758/2026</span><b className="font-semibold">Sim</b></li>
        </ul>
      </Miniatura>
    ),
  },
  {
    t: "O agente decide o que fazer com a resposta",
    d: (
      <>
        O agente é como uma pessoa do time: você diz <b>o que ela faz</b> com a resposta e <b>quando</b> ela
        trabalha. É no agente que a variável ganha uso.
      </>
    ),
    mini: (
      <Miniatura rotulo="Agentes">
        <b className="font-semibold">Exige atestado técnico?</b>
        <p className="mt-1.5">
          Se <TokenChip>Atestado exigido</TokenChip> for sim, avise e diga quantos atestados o edital pede.
        </p>
        <div className="mt-2.5 flex flex-wrap gap-1.5 border-t pt-2.5">
          <Badge variant="category-1" className="rounded-full font-normal">Quando chega em Recomendadas</Badge>
          <Badge variant="secondary" className="rounded-full font-normal">Mostra em Habilitação</Badge>
        </div>
      </Miniatura>
    ),
  },
  {
    t: "O resultado aparece dentro da licitação",
    d: (
      <>
        Quando o agente trabalha, o que ele produziu aparece <b>na aba que você escolheu</b>, com o nome do agente e de
        onde saiu a resposta no edital.
      </>
    ),
    mini: (
      <Miniatura rotulo="Licitação PE 90014/2026 · aba Habilitação">
        <div className="rounded-md border border-primary/30 bg-primary/5 p-2.5">
          <b className="font-semibold text-primary">Exige atestado técnico?</b>
          <p className="mt-1">Sim: 2 atestados de design de produto, somando 1.500 horas.</p>
          <p className="mt-1 text-xs text-muted-foreground">Edital, item 9.4.1 · p. 21</p>
        </div>
      </Miniatura>
    ),
  },
  {
    t: "Se o agente for mudar algo, ele pode pedir licença",
    d: (
      <>
        Um agente também pode <b>fazer ações</b>, como mover a licitação de etapa. Se você quiser, ele pede aprovação
        antes, e o pedido espera em <b>Aprovações</b> até alguém responder.
      </>
    ),
    mini: (
      <Miniatura rotulo="Agentes › Aprovações">
        <p className="flex flex-wrap items-center gap-1.5">
          Mover de <Badge variant="secondary" className="font-normal">Recomendadas</Badge>
          <ArrowRightIcon aria-label="para" className="size-3.5 text-muted-foreground" />
          <Badge variant="secondary" className="font-normal">Em análise</Badge>
        </p>
        <p className="mt-1 text-muted-foreground">Pedido por Exige atestado técnico? · PE 90014/2026</p>
        <div className="mt-2.5 flex gap-1.5 border-t pt-2.5">
          <span className="rounded-md border px-2 py-0.5 text-xs">Recusar</span>
          <span className="rounded-md bg-primary px-2 py-0.5 text-xs text-primary-foreground">Aprovar</span>
        </div>
      </Miniatura>
    ),
  },
]

/*
  O problema mais grave do teste: ninguém separou agente de variável só olhando a tela, e
  em quatro de cinco sessões o conceito precisou ser explicado em voz alta. Um card no
  canto inferior direito convida a ver a explicação e volta a cada refresh da página. A
  explicação é um passo a passo com um exemplo que atravessa tudo, e termina num resumo
  de uma linha por conceito e nos atalhos para criar.
*/
export function ComoFunciona({ aoCriarVariavel, aoCriarAgente }: { aoCriarVariavel?: () => void; aoCriarAgente?: () => void }) {
  /* Fechar vale até recarregar a página: a cada refresh o card volta (pedido do Brunno). */
  const [fechado, setFechado] = useState(false)
  const [aberto, setAberto] = useState(false)
  const [passo, setPasso] = useState(0)
  const fechar = () => setFechado(true)
  const ultimo = passo === PASSOS.length
  const criar = (f?: () => void) => {
    setAberto(false)
    fechar()
    f?.()
  }
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
              Como agentes e variáveis funcionam
            </h2>
            <p className="text-[13px] leading-[19px] text-muted-foreground">
              Em quatro passos, com um exemplo do começo ao fim: saber se o edital exige atestado técnico.
            </p>
            <Button
              size="sm"
              className="mt-1.5 self-start"
              onClick={() => {
                setPasso(0)
                setAberto(true)
              }}
            >
              Ver como funciona
            </Button>
          </div>
        </aside>
      )}
      <Dialog
        open={aberto}
        onOpenChange={(o) => {
          setAberto(o)
          // quem viu a explicação não precisa do convite de novo, até recarregar
          if (!o) fechar()
        }}
      >
        <DialogContent className="gap-0 p-0 sm:max-w-[720px]">
          <DialogHeader className="border-b px-6 pt-5 pb-4 text-left">
            <span className="text-xs font-medium text-muted-foreground">
              {ultimo ? "Resumo" : `Passo ${passo + 1} de ${PASSOS.length}`}
            </span>
            <DialogTitle className="text-lg">{ultimo ? "Em resumo" : PASSOS[passo].t}</DialogTitle>
            <DialogDescription className="sr-only">Como agentes e variáveis funcionam, passo a passo.</DialogDescription>
          </DialogHeader>

          <div className="min-h-68 px-6 py-5">
            {ultimo ? (
              <div className="flex flex-col gap-3">
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2.5 text-sm leading-5">
                  <dt className="font-semibold">Variável</dt>
                  <dd className="text-muted-foreground">a pergunta que a Settle faz a todo edital.</dd>
                  <dt className="font-semibold">Agente</dt>
                  <dd className="text-muted-foreground">o que fazer com a resposta, e quando.</dd>
                  <dt className="font-semibold">Resultado</dt>
                  <dd className="text-muted-foreground">onde você vê o que o agente produziu, dentro da licitação.</dd>
                  <dt className="font-semibold">Aprovações</dt>
                  <dd className="text-muted-foreground">onde esperam as ações que o agente quer fazer, se ele precisar de licença.</dd>
                </dl>
                <p className="mt-2 rounded-lg bg-primary/8 px-3.5 py-3 text-[13px] leading-[19px]">
                  Para começar, crie a variável com a pergunta e depois o agente que usa a resposta. Se a variável já
                  existir, comece pelo agente.
                </p>
                <div className="flex flex-wrap gap-2">
                  {aoCriarVariavel && (
                    <Button variant="outline" onClick={() => criar(aoCriarVariavel)}>
                      Criar variável
                    </Button>
                  )}
                  {aoCriarAgente && <Button onClick={() => criar(aoCriarAgente)}>Criar agente</Button>}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 items-start gap-5 min-[620px]:grid-cols-[1fr_300px]">
                <p className="text-[15px] leading-6">{PASSOS[passo].d}</p>
                {PASSOS[passo].mini}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 border-t px-6 py-3.5">
            <div className="flex flex-1 items-center gap-1.5" aria-hidden>
              {[...PASSOS, null].map((_, i) => (
                <span key={i} className={cn("h-1.5 rounded-full transition-all", i === passo ? "w-5 bg-primary" : "w-1.5 bg-foreground/15")} />
              ))}
            </div>
            {passo > 0 && (
              <Button variant="outline" className="shadow-none" onClick={() => setPasso((p) => p - 1)}>
                Voltar
              </Button>
            )}
            {!ultimo ? (
              <Button onClick={() => setPasso((p) => p + 1)}>Próximo</Button>
            ) : (
              <Button variant="outline" className="shadow-none" onClick={() => criar()}>
                Fechar
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
