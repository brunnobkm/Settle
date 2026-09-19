import * as React from "react"
import { ChevronDownIcon, SearchIcon } from "lucide-react"
import type { Matcher } from "react-day-picker"
import { ptBR } from "react-day-picker/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

// Selo de filtro aplicado ("Órgão: 2 selecionadas ▾"). Clicar abre um popover para
// editar o filtro: lista de opções (busca, caixas, Selecionar tudo/Limpar) ou data
// (atalhos de período + calendário). Vários selos lado a lado: FilterChipGroup.

type FilterChipOption = { value: string; label: string }

type FilterChipDateValue = {
  /** Atalho escolhido (valor de um item de `presets`). */
  preset?: string
  date?: Date
}

type FilterChipListLabels = {
  /** Título da lista. */
  title?: string
  selectAll?: string
  clear?: string
  searchPlaceholder?: string
  /** Nome do campo de busca para leitores de tela. Padrão: "Buscar em <rótulo>". */
  search?: string
  empty?: string
  /** Valor do selo sem nada marcado. */
  any?: string
  /** Valor do selo com mais de uma opção marcada. */
  selected?: (count: number) => string
}

type FilterChipDateLabels = {
  /** Valor do selo sem data. */
  any?: string
  today?: string
  /** Nome do grupo de atalhos para leitores de tela. */
  presets?: string
}

type FilterChipCommonProps = {
  /** Nome do filtro (ex.: "Órgão"). */
  label: string
  /** Texto do valor no selo. Padrão: calculado a partir do valor. */
  valueLabel?: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Fecha o popover quando a página (ou a barra de selos) rola. */
  closeOnScroll?: boolean
  align?: "start" | "center" | "end"
  /** Classes do selo. */
  className?: string
  /** Classes do popover. */
  contentClassName?: string
}

type FilterChipListProps = FilterChipCommonProps & {
  type?: "list"
  options: (string | FilterChipOption)[]
  value: string[]
  onValueChange: (value: string[]) => void
  /** Mostra o campo de busca (padrão: sim). */
  searchable?: boolean
  labels?: FilterChipListLabels
}

type FilterChipDateProps = FilterChipCommonProps & {
  type: "date"
  value: FilterChipDateValue
  onValueChange: (value: FilterChipDateValue) => void
  /** Atalhos de período (ex.: "Últimos 7 dias"). */
  presets?: FilterChipOption[]
  /** Data de hoje (padrão: agora). */
  today?: Date
  /** Dias que não podem ser escolhidos (ex.: { after: hoje }). */
  disabled?: Matcher | Matcher[]
  locale?: React.ComponentProps<typeof Calendar>["locale"]
  formatDate?: (date: Date) => string
  /** Fecha o popover ao escolher (padrão: sim). */
  closeOnSelect?: boolean
  labels?: FilterChipDateLabels
}

type FilterChipProps = FilterChipListProps | FilterChipDateProps

const LIST_LABELS: Required<Omit<FilterChipListLabels, "search">> = {
  title: "Lista de opções",
  selectAll: "Selecionar tudo",
  clear: "Limpar",
  searchPlaceholder: "Buscar",
  empty: "Nenhuma opção encontrada",
  any: "Qualquer",
  selected: (count) => `${count} selecionadas`,
}

const DATE_LABELS: Required<FilterChipDateLabels> = {
  any: "Qualquer data",
  today: "Hoje",
  presets: "Atalhos de período",
}

/** Sem acentos e sem caixa: "belem" encontra "Belém". */
const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")

const toOption = (option: string | FilterChipOption): FilterChipOption =>
  typeof option === "string" ? { value: option, label: option } : option

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString()

function useControllableOpen({
  open,
  defaultOpen = false,
  onOpenChange,
}: Pick<FilterChipCommonProps, "open" | "defaultOpen" | "onOpenChange">) {
  const [openState, setOpenState] = React.useState(defaultOpen)
  const current = open ?? openState
  const setOpen = React.useCallback(
    (value: boolean) => {
      if (open === undefined) setOpenState(value)
      onOpenChange?.(value)
    },
    [open, onOpenChange]
  )
  return [current, setOpen] as const
}

function useCloseOnScroll(
  enabled: boolean,
  open: boolean,
  close: () => void,
  contentRef: React.RefObject<HTMLElement | null>
) {
  React.useEffect(() => {
    if (!enabled || !open) return
    const onScroll = (event: Event) => {
      // rolar a lista dentro do popover não fecha
      if (event.target instanceof Node && contentRef.current?.contains(event.target)) return
      close()
    }
    // captura: pega a rolagem da página e de qualquer contêiner (ex.: a barra de selos)
    document.addEventListener("scroll", onScroll, { capture: true, passive: true })
    return () => document.removeEventListener("scroll", onScroll, { capture: true })
  }, [enabled, open, close, contentRef])
}

/** Linha de selos: rola na horizontal quando não cabe. */
function FilterChipGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="group"
      data-slot="filter-chip-group"
      // barra de rolagem fina (a de sobreposição do macOS cobria o texto dos selos)
      className={cn(
        "flex items-center gap-2 overflow-x-auto pb-0.5 [scrollbar-width:thin]",
        className
      )}
      {...props}
    />
  )
}

function FilterChip(props: FilterChipProps) {
  const {
    label,
    valueLabel,
    open: openProp,
    defaultOpen,
    onOpenChange,
    closeOnScroll = false,
    align = "start",
    className,
    contentClassName,
  } = props
  const [open, setOpen] = useControllableOpen({
    open: openProp,
    defaultOpen,
    onOpenChange,
  })
  const contentRef = React.useRef<HTMLDivElement>(null)
  const close = React.useCallback(() => setOpen(false), [setOpen])
  useCloseOnScroll(closeOnScroll, open, close, contentRef)

  const isDate = props.type === "date"
  const shownValue = valueLabel ?? (isDate ? dateValueLabel(props) : listValueLabel(props))

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="xs"
          className={cn(
            "flex-none gap-1.25 rounded-full bg-foreground/10 px-2.75 font-normal hover:bg-foreground/15 aria-expanded:bg-foreground/20",
            className
          )}
        >
          <span className="text-muted-foreground">{label}:</span>
          <span className="font-semibold text-foreground">{shownValue}</span>
          <ChevronDownIcon data-icon="inline-end" className="text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        ref={contentRef}
        align={align}
        className={cn("gap-2 p-2", isDate ? "w-75" : "w-62", contentClassName)}
      >
        {props.type === "date" ? (
          <FilterChipDate {...props} onClose={close} />
        ) : (
          <FilterChipList {...props} />
        )}
      </PopoverContent>
    </Popover>
  )
}

function listValueLabel({ options, value, labels }: FilterChipListProps) {
  const text = { ...LIST_LABELS, ...labels }
  if (!value.length) return text.any
  if (value.length === 1) {
    return options.map(toOption).find((o) => o.value === value[0])?.label ?? value[0]
  }
  return text.selected(value.length)
}

function dateValueLabel({
  value,
  presets,
  today = new Date(),
  locale = ptBR,
  formatDate,
  labels,
}: FilterChipDateProps) {
  const text = { ...DATE_LABELS, ...labels }
  if (value.preset) return presets?.find((p) => p.value === value.preset)?.label ?? value.preset
  if (value.date) {
    if (sameDay(value.date, today)) return text.today
    return formatDate ? formatDate(value.date) : value.date.toLocaleDateString(locale.code)
  }
  return text.any
}

function FilterChipList({
  label,
  options,
  value,
  onValueChange,
  searchable = true,
  labels,
}: FilterChipListProps) {
  const text = { ...LIST_LABELS, ...labels }
  const [query, setQuery] = React.useState("")
  const all = options.map(toOption)
  const allSelected = all.length > 0 && all.every((o) => value.includes(o.value))
  const shown = all.filter((o) => normalize(o.label).includes(normalize(query)))

  return (
    <>
      <div className="flex items-center justify-between px-1.5 pt-1">
        <span className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
          {text.title}
        </span>
        <Button
          variant="link"
          size="xs"
          className="h-auto px-0 font-semibold"
          onClick={() => onValueChange(allSelected ? [] : all.map((o) => o.value))}
        >
          {allSelected ? text.clear : text.selectAll}
        </Button>
      </div>
      {searchable && (
        <InputGroup className="h-8">
          <InputGroupInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={text.searchPlaceholder}
            aria-label={labels?.search ?? `Buscar em ${label}`}
            autoFocus
          />
          <InputGroupAddon align="inline-end">
            <SearchIcon />
          </InputGroupAddon>
        </InputGroup>
      )}
      <ul className="flex max-h-55 flex-col overflow-auto">
        {shown.map((option) => {
          const checked = value.includes(option.value)
          return (
            <li key={option.value}>
              <label className="flex cursor-pointer items-center gap-2.25 rounded-md px-2 py-1.75 text-sm hover:bg-muted">
                <Checkbox
                  checked={checked}
                  onCheckedChange={() =>
                    onValueChange(
                      checked
                        ? value.filter((v) => v !== option.value)
                        : [...value, option.value]
                    )
                  }
                />
                <span className="min-w-0">{option.label}</span>
              </label>
            </li>
          )
        })}
        {!shown.length && (
          <li className="px-2 py-3 text-center text-[13px] text-muted-foreground">
            {text.empty}
          </li>
        )}
      </ul>
    </>
  )
}

function FilterChipDate({
  value,
  onValueChange,
  presets,
  today = new Date(),
  disabled,
  locale = ptBR,
  closeOnSelect = true,
  labels,
  onClose,
}: FilterChipDateProps & { onClose: () => void }) {
  const text = { ...DATE_LABELS, ...labels }
  const change = (next: FilterChipDateValue) => {
    onValueChange(next)
    if (closeOnSelect) onClose()
  }

  return (
    <>
      {!!presets?.length && (
        <ToggleGroup
          type="single"
          spacing={0}
          value={value.preset ?? ""}
          onValueChange={(preset) => preset && change({ preset })}
          aria-label={text.presets}
          className="w-full rounded-lg bg-muted p-0.75"
        >
          {presets.map((preset) => (
            <ToggleGroupItem
              key={preset.value}
              value={preset.value}
              className="h-7 flex-1 rounded-md px-1 text-xs text-muted-foreground data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-xs"
            >
              {preset.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      )}
      <Calendar
        mode="single"
        locale={locale}
        today={today}
        selected={value.date}
        defaultMonth={value.date ?? today}
        disabled={disabled}
        onSelect={(date) => date && change({ date })}
        className="w-full p-1"
      />
    </>
  )
}

export {
  FilterChip,
  FilterChipGroup,
  type FilterChipDateLabels,
  type FilterChipDateProps,
  type FilterChipDateValue,
  type FilterChipListLabels,
  type FilterChipListProps,
  type FilterChipOption,
  type FilterChipProps,
}
