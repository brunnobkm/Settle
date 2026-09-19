// Visão Calendário (estilo Notion): licitações no dia do envio da proposta. O chip
// mostra "Edital · Órgão"; passar o mouse (ou focar) abre a prévia com o card completo
// do Board, com a mesma edição. Licitações sem data ficam num aviso na barra do mês.

import { useCallback, useState } from "react"

import { cn } from "@/lib/utils"
import { EventCalendar } from "@/components/ui/event-calendar"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@/components/ui/popover"

import { CardKanban, type PropsCard } from "./CardKanban"
import { HOJE, avisoDePrazo, urgenciaDaData, type Licitacao } from "./dados"

type PropsDoCard = Omit<PropsCard, "licitacao" | "onChange" | "onAbrir" | "onCopiarLink" | "onDescartar" | "onEdicao">

type Props = PropsDoCard & {
  licitacoes: Licitacao[]
  onChange: (id: string, patch: Partial<Licitacao>) => void
  onAbrir: (l: Licitacao) => void
  onCopiarLink: (l: Licitacao) => void
  onDescartar: (l: Licitacao) => void
}

// nome do órgão no chip: corta em fronteira de palavra depois de 50 caracteres
const LIMITE_ORGAO = 50
function cortarOrgao(orgao: string) {
  if (orgao.length <= LIMITE_ORGAO) return orgao
  return orgao.slice(0, LIMITE_ORGAO).replace(/\s+\S*$/, "").trimEnd() + "…"
}

export function VistaCalendario({ licitacoes, ...props }: Props) {
  const [mes, setMes] = useState(HOJE)
  const semData = licitacoes.filter((l) => !l.dataEnvio)
  const getDate = useCallback((l: Licitacao) => l.dataEnvio, [])

  const chip = (l: Licitacao, naLista: boolean) => <ChipDoCalendario key={l.id} licitacao={l} naLista={naLista} {...props} />

  return (
    <EventCalendar
      month={mes}
      onMonthChange={setMes}
      today={HOJE}
      items={licitacoes}
      getItemId={(l) => l.id}
      getItemDate={getDate}
      renderItem={(l, { inList }) => chip(l, inList)}
      toolbarEnd={
        semData.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="inline-flex h-7 items-center gap-1.5 rounded-md border bg-background px-2.5 text-xs font-medium outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <span aria-hidden className="size-2 rounded-full bg-muted-foreground" />
                {/* "data de envio da proposta": na frase, a expressão completa lê melhor (pedido Brunno 2026-05-29) */}
                {semData.length} {semData.length === 1 ? "licitação" : "licitações"} sem data de envio da proposta
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" collisionPadding={8} className="w-auto min-w-70 gap-0 rounded-[10px] p-0">
              <div className="flex items-center gap-1.5 border-b px-2.5 pt-2 pb-1.5">
                <span aria-hidden className="size-2 rounded-full bg-muted-foreground" />
                <PopoverTitle className="text-xs font-semibold">Sem data programada ({semData.length})</PopoverTitle>
              </div>
              <div className="flex max-h-80 flex-col gap-1 overflow-y-auto p-1.5">{semData.map((l) => chip(l, true))}</div>
            </PopoverContent>
          </Popover>
        )
      }
      className="h-full"
    />
  )
}

function ChipDoCalendario({
  licitacao: l,
  naLista,
  onChange,
  onAbrir,
  onCopiarLink,
  onDescartar,
  ...props
}: Omit<Props, "licitacoes"> & { licitacao: Licitacao; naLista: boolean }) {
  const [aberta, setAberta] = useState(false)
  const [editando, setEditando] = useState(false)
  const u = urgenciaDaData(l.dataEnvio)
  const aviso = avisoDePrazo(u)
  const onEdicao = useCallback((_: string, ativa: boolean) => setEditando(ativa), [])

  return (
    // com um editor aberto na prévia, ela não fecha ao tirar o mouse
    <HoverCard open={aberta || editando} onOpenChange={setAberta} openDelay={350} closeDelay={200}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          onClick={() => onAbrir(l)}
          className={cn(
            "flex w-full min-w-0 shrink-0 items-center gap-1.5 rounded-[5px] border bg-card text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
            naLista ? "px-2 py-1 text-xs leading-[1.3]" : "px-1.5 py-0.5 text-[11px] leading-[1.3]"
          )}
        >
          {u.tom === "hoje" && <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-destructive" />}
          {u.tom === "semana" && <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-warning" />}
          <span className="min-w-0 flex-1 truncate">
            Edital {l.codigoEdital} · {cortarOrgao(l.orgao)}
          </span>
          {aviso && <span className="sr-only">, {aviso}</span>}
        </button>
      </HoverCardTrigger>
      <HoverCardContent
        side="right"
        align="start"
        sideOffset={8}
        collisionPadding={8}
        className="w-[358px] rounded-xl bg-transparent p-0 shadow-lg ring-0"
      >
        <CardKanban
          licitacao={l}
          onChange={(patch) => onChange(l.id, patch)}
          onAbrir={() => onAbrir(l)}
          onCopiarLink={() => onCopiarLink(l)}
          onDescartar={() => onDescartar(l)}
          onEdicao={onEdicao}
          className="hover:translate-y-0"
          {...props}
        />
      </HoverCardContent>
    </HoverCard>
  )
}
