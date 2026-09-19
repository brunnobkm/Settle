// Proposta de solução para Recurso + Contrarrazões.
// O recurso é modelado como um FLUXO encadeado (uma "thread"):
// intenção → razões → contrarrazões → julgamento, porque a contrarrazão só faz
// sentido dentro do processo do recurso. Mostra (1) como aparece na lista e
// (2) o detalhe (linha do tempo).

import { Fragment, type ReactNode } from "react"
import { PaperclipIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  NotificationsCenterItem,
  NotificationsCenterItemHeader,
  NotificationsCenterItemMeta,
} from "@/components/ui/notifications-center"
import { Timeline, TimelineDescription, TimelineItem, TimelineMeta, TimelineTitle } from "@/components/ui/timeline"
import { useNaoPrototipado } from "@/settle/nao-prototipado"

/* ------------------------------------------------------------------ */
/* Dados                                                               */
/* ------------------------------------------------------------------ */

const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"]

/** Tempo relativo (até 6 dias) ou data por extenso. */
function quando(minAtras: number) {
  const date = new Date(Date.now() - minAtras * 60000)
  const min = Math.floor(minAtras)
  if (min < 60) return `Há ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `Há ${h} h`
  const d = Math.floor(h / 24)
  if (d <= 6) return `Há ${d} ${d === 1 ? "dia" : "dias"}`
  return `${date.getDate()} de ${MESES[date.getMonth()]} de ${date.getFullYear()}`
}

type Status = "em_andamento" | "provido" | "improvido"

// status nunca só por cor: o selo sempre tem o texto
const STATUS: Record<Status, { label: string; variant: "warning" | "success" | "secondary" }> = {
  em_andamento: { label: "Em andamento", variant: "warning" },
  provido: { label: "Provido", variant: "success" },
  improvido: { label: "Improvido", variant: "secondary" },
}

type Etapa = {
  etapa: string
  curto: string
  autor: string
  minAtras: number
  texto: string
  anexos?: { nome: string; tamanho: string }[]
  foco?: boolean
  resultado?: string
}

/** Um recurso = uma thread de etapas. */
const RECURSO: { titulo: string; status: Status; etapas: Etapa[] } = {
  titulo: "Recurso à decisão de habilitação (Item 1)",
  status: "improvido",
  etapas: [
    {
      etapa: "Intenção de recurso",
      curto: "Intenção",
      autor: "Licitante: Gamma Engenharia (recorrente)",
      minAtras: 60 * 24 * 4,
      texto:
        "Manifestação de intenção de recurso contra a decisão que habilitou a empresa classificada em 1º lugar no item 1.",
    },
    {
      etapa: "Razões do recurso",
      curto: "Razões",
      autor: "Licitante: Gamma Engenharia (recorrente)",
      minAtras: 60 * 24 * 3,
      texto:
        "O recorrente sustenta que a empresa habilitada não atende ao item 7.2 do edital (atestado de capacidade técnica com quantitativo mínimo), e pleiteia a reforma da decisão de habilitação.",
      anexos: [{ nome: "Razoes_do_recurso.pdf", tamanho: "240 KB" }],
    },
    {
      etapa: "Contrarrazões",
      curto: "Contrarrazões",
      autor: "Licitante: Alfa Tecnologia LTDA (recorrida)",
      minAtras: 60 * 24 * 2,
      texto:
        "Apresentação de contrarrazões sustentando a regularidade da documentação de habilitação, com atestados que comprovam o quantitativo exigido no item 7.2 do edital. Requer-se o não provimento do recurso.",
      anexos: [{ nome: "Contrarrazoes.pdf", tamanho: "188 KB" }],
      foco: true,
    },
    {
      etapa: "Julgamento do recurso",
      curto: "Julgamento",
      autor: "Autoridade Competente",
      minAtras: 60 * 24,
      texto:
        "Recurso conhecido e, no mérito, IMPROVIDO. Mantém-se a decisão de habilitação: os atestados apresentados atendem ao quantitativo do item 7.2.",
      resultado: "Improvido",
    },
  ],
}

/* ------------------------------------------------------------------ */
/* Tela                                                                */
/* ------------------------------------------------------------------ */

function Secao({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <section className="mb-7" aria-label={rotulo}>
      <h2 className="mb-2.5 text-[11px] font-semibold tracking-[.04em] text-muted-foreground uppercase">{rotulo}</h2>
      {children}
    </section>
  )
}

/** Trilha compacta das etapas (no card da lista). A etapa em foco leva cor e peso. */
function TrilhaDeEtapas({ etapas }: { etapas: Etapa[] }) {
  return (
    <ol aria-label="Etapas do recurso" className="mt-3.5 mb-1 flex flex-wrap items-center">
      {etapas.map((e, i) => (
        <Fragment key={e.etapa}>
          <li className="inline-flex items-center gap-1.5">
            <span aria-hidden className={cn("size-2.25 shrink-0 rounded-full bg-foreground", e.foco && "bg-primary")} />
            <span className={cn("text-xs font-medium text-foreground", e.foco && "font-semibold text-primary")}>
              {e.curto}
            </span>
          </li>
          {i < etapas.length - 1 && <li aria-hidden className="mx-2 h-px w-6.5 bg-border" />}
        </Fragment>
      ))}
    </ol>
  )
}

export default function App() {
  useNaoPrototipado()

  const status = STATUS[RECURSO.status]
  const ultima = RECURSO.etapas[RECURSO.etapas.length - 1]

  return (
    <div className="min-h-svh bg-muted text-foreground">
      <main className="mx-auto max-w-190 px-5 pt-9 pb-18 text-sm leading-normal">
        <header className="mb-4.5">
          <h1 className="my-[0.67em] text-[28px] leading-tight font-bold">Recurso &amp; Contrarrazões</h1>
          <p>Proposta: PE 12/2026 · Prefeitura SP</p>
        </header>

        <p className="mb-5.5 max-w-160 text-[13.5px] leading-[1.55] text-muted-foreground">
          A ideia: o <strong className="text-foreground">recurso</strong> não é vários itens soltos, é{" "}
          <strong className="text-foreground">um processo encadeado</strong>. A{" "}
          <strong className="text-foreground">contrarrazão</strong> é uma{" "}
          <strong className="text-foreground">etapa dentro do recurso</strong> (a resposta da parte recorrida).
        </p>

        <Secao rotulo="1 · Como aparece na lista de Manifestações">
          <NotificationsCenterItem>
            <NotificationsCenterItemHeader>
              <Badge variant="category-4" className="h-6 rounded-md px-2.5 text-[11.5px] font-semibold">
                Recurso
              </Badge>
              <Badge variant={status.variant} className="h-6 rounded-md px-2.5 text-[11px] font-semibold">
                {status.label}
              </Badge>
            </NotificationsCenterItemHeader>
            <h3 className="mt-2 mb-0.5 text-[15px] font-semibold">{RECURSO.titulo}</h3>
            <NotificationsCenterItemMeta>
              {RECURSO.etapas.length} etapas · última: {ultima.curto} · {quando(ultima.minAtras)}
            </NotificationsCenterItemMeta>
            <TrilhaDeEtapas etapas={RECURSO.etapas} />
            <Button variant="outline" size="sm" className="mt-3 text-[12.5px] font-semibold" data-nao-prototipado>
              Ver recurso completo
            </Button>
          </NotificationsCenterItem>
        </Secao>

        <Secao rotulo="2 · Ao abrir: o fluxo do recurso (timeline)">
          <div className="rounded-[14px] border bg-card px-5.5 pt-5.5 pb-2.5">
            <Timeline>
              {RECURSO.etapas.map((e) => (
                <TimelineItem key={e.etapa} highlighted={e.foco}>
                  <TimelineTitle>
                    {e.etapa}
                    {e.foco && (
                      <Badge className="h-auto rounded-full bg-primary/10 px-1.75 py-0.5 text-[10.5px] font-bold tracking-[.03em] text-primary uppercase">
                        contrarrazões
                      </Badge>
                    )}
                    {e.resultado && (
                      <Badge variant={status.variant} className="h-6 rounded-md px-2.5 text-[11px] font-semibold">
                        {e.resultado}
                      </Badge>
                    )}
                  </TimelineTitle>
                  <TimelineMeta>
                    {e.autor} · {quando(e.minAtras)}
                  </TimelineMeta>
                  <TimelineDescription>{e.texto}</TimelineDescription>
                  {!!e.anexos?.length && (
                    <div className="mt-2.25 flex flex-wrap gap-2">
                      {e.anexos.map((a) => (
                        <a
                          key={a.nome}
                          href="#"
                          data-nao-prototipado
                          className="inline-flex items-center gap-1.25 rounded-lg border border-primary/15 bg-primary/5 px-2.5 py-1.25 text-xs text-primary no-underline hover:bg-primary/10"
                        >
                          <PaperclipIcon aria-hidden className="size-3.5" />
                          {a.nome} · {a.tamanho}
                        </a>
                      ))}
                    </div>
                  )}
                </TimelineItem>
              ))}
            </Timeline>
          </div>
        </Secao>
      </main>
    </div>
  )
}
