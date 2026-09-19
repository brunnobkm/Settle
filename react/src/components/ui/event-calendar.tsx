"use client"

import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"

// Calendário mensal de eventos (estilo Notion): grade de 6 semanas que ocupa a
// altura disponível, com os eventos de cada dia empilhados. Cada dia mostra até
// `maxVisible` eventos; o resto fica em "+ N mais", que abre a lista completa do dia.
// O evento é desenhado pela tela (renderItem); datas no formato AAAA-MM-DD.

type EventCalendarLabels = {
  previous: string
  next: string
  today: string
  close: string
  /** Nomes curtos dos dias, começando no domingo. */
  weekdays: string[]
  more: (count: number) => string
  /** Título do mês (ex.: "Maio de 2026"). */
  monthTitle: (month: Date) => string
  /** Título da lista completa de um dia (ex.: "Quinta-feira, 21 de maio"). */
  dayTitle: (day: Date) => string
}

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

const defaultLabels: EventCalendarLabels = {
  previous: "Mês anterior",
  next: "Próximo mês",
  today: "Hoje",
  close: "Fechar",
  weekdays: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
  more: (n) => `+ ${n} mais`,
  monthTitle: (d) => capitalize(d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })),
  dayTitle: (d) =>
    capitalize(d.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })),
}

/** Data local no formato AAAA-MM-DD. */
const toIsoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`

type EventCalendarProps<TItem> = Omit<React.ComponentProps<"div">, "children"> & {
  /** Qualquer dia do mês mostrado. */
  month: Date
  onMonthChange: (month: Date) => void
  /** Dia de hoje (destacado; o botão "Hoje" volta para o mês dele). */
  today?: Date
  items: TItem[]
  getItemId: (item: TItem) => string
  /** Data do evento (AAAA-MM-DD). null: fica fora da grade. */
  getItemDate: (item: TItem) => string | null
  /** Desenha o evento. `inList`: dentro da lista completa do dia (mais espaço). */
  renderItem: (item: TItem, context: { inList: boolean }) => React.ReactNode
  /** Eventos visíveis por dia antes do "+ N mais". */
  maxVisible?: number
  /** Conteúdo extra à direita da barra do mês (ex.: aviso de eventos sem data). */
  toolbarEnd?: React.ReactNode
  labels?: Partial<EventCalendarLabels>
}

function EventCalendar<TItem>({
  month,
  onMonthChange,
  today = new Date(),
  items,
  getItemId,
  getItemDate,
  renderItem,
  maxVisible = 3,
  toolbarEnd,
  labels: labelsProp,
  className,
  ...props
}: EventCalendarProps<TItem>) {
  const labels = { ...defaultLabels, ...labelsProp }
  const year = month.getFullYear()
  const monthIndex = month.getMonth()
  const todayIso = toIsoDate(today)

  const byDate = React.useMemo(() => {
    const map = new Map<string, TItem[]>()
    items.forEach((item) => {
      const date = getItemDate(item)
      if (!date) return
      map.set(date, [...(map.get(date) ?? []), item])
    })
    return map
  }, [items, getItemDate])

  // 6 semanas a partir do domingo anterior ao dia 1
  const first = new Date(year, monthIndex, 1)
  const days = Array.from({ length: 42 }, (_, i) => new Date(year, monthIndex, 1 - first.getDay() + i))
  const weeks = Array.from({ length: 6 }, (_, w) => days.slice(w * 7, w * 7 + 7))

  return (
    <div
      data-slot="event-calendar"
      className={cn("flex min-h-0 flex-col gap-3", className)}
      {...props}
    >
      <div className="flex shrink-0 flex-wrap items-center gap-1.5">
        <h2 className="mr-2 text-base font-semibold">{labels.monthTitle(month)}</h2>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label={labels.previous}
          className="size-7 shadow-none"
          onClick={() => onMonthChange(new Date(year, monthIndex - 1, 1))}
        >
          <ChevronLeftIcon />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label={labels.next}
          className="size-7 shadow-none"
          onClick={() => onMonthChange(new Date(year, monthIndex + 1, 1))}
        >
          <ChevronRightIcon />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-3 text-[13px] shadow-none"
          onClick={() => onMonthChange(new Date(today.getFullYear(), today.getMonth(), 1))}
        >
          {labels.today}
        </Button>
        {toolbarEnd != null && <div className="ml-auto flex items-center">{toolbarEnd}</div>}
      </div>

      <div
        role="table"
        aria-label={labels.monthTitle(month)}
        className="grid min-h-0 flex-1 grid-rows-[auto_repeat(6,minmax(0,1fr))] overflow-hidden rounded-lg border bg-card"
      >
        <div role="row" className="grid grid-cols-7 border-b bg-muted/50">
          {labels.weekdays.map((weekday) => (
            <div
              key={weekday}
              role="columnheader"
              className="border-r px-2.5 py-2 text-[11px] font-medium tracking-[0.04em] text-muted-foreground uppercase last:border-r-0"
            >
              {weekday}
            </div>
          ))}
        </div>
        {weeks.map((week, w) => (
          <div key={w} role="row" className="grid min-h-0 grid-cols-7">
            {week.map((day) => {
              const iso = toIsoDate(day)
              const dayItems = byDate.get(iso) ?? []
              const visible = dayItems.slice(0, maxVisible)
              const hidden = dayItems.length - visible.length
              const outside = day.getMonth() !== monthIndex
              const isToday = iso === todayIso
              return (
                <div
                  key={iso}
                  role="cell"
                  data-outside={outside || undefined}
                  data-today={isToday || undefined}
                  className={cn(
                    "flex min-h-0 min-w-0 flex-col gap-0.5 overflow-hidden border-r p-1 last:border-r-0",
                    w > 0 && "border-t"
                  )}
                >
                  <time
                    dateTime={iso}
                    aria-current={isToday ? "date" : undefined}
                    className={cn(
                      "mb-0.5 w-fit rounded-full px-1.5 py-0.5 text-xs leading-[1.2] font-medium",
                      outside && "text-muted-foreground/60",
                      isToday && "bg-primary text-primary-foreground"
                    )}
                  >
                    {day.getDate()}
                  </time>
                  <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto [scrollbar-width:thin]">
                    {visible.map((item) => (
                      <React.Fragment key={getItemId(item)}>{renderItem(item, { inList: false })}</React.Fragment>
                    ))}
                    {hidden > 0 && (
                      <EventCalendarMore
                        label={labels.more(hidden)}
                        title={labels.dayTitle(day)}
                        closeLabel={labels.close}
                      >
                        {dayItems.map((item) => (
                          <React.Fragment key={getItemId(item)}>{renderItem(item, { inList: true })}</React.Fragment>
                        ))}
                      </EventCalendarMore>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

/** "+ N mais": abre a lista completa dos eventos do dia. */
function EventCalendarMore({
  label,
  title,
  closeLabel,
  children,
}: {
  label: string
  title: string
  closeLabel: string
  children: React.ReactNode
}) {
  const [open, setOpen] = React.useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="w-fit shrink-0 rounded-sm px-1.5 py-0.5 text-left text-[11px] leading-[1.3] font-medium text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          {label}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        collisionPadding={8}
        className="flex max-h-[60vh] w-80 flex-col gap-0 overflow-hidden rounded-[10px] p-0"
      >
        <div className="flex items-center justify-between border-b py-2 pr-2 pl-3">
          <PopoverTitle className="text-[13px] font-semibold">{title}</PopoverTitle>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={closeLabel}
            className="text-muted-foreground"
            onClick={() => setOpen(false)}
          >
            <XIcon />
          </Button>
        </div>
        <div className="flex min-h-0 flex-col gap-0.5 overflow-y-auto p-1.5">{children}</div>
      </PopoverContent>
    </Popover>
  )
}

export { EventCalendar, type EventCalendarLabels, type EventCalendarProps }
