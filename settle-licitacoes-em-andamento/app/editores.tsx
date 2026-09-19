// Editores das propriedades (popovers ancorados no valor clicado), usados pelo card do
// Board, pela prévia do Calendário e pelas células da Tabela. Mesmo comportamento do
// card canônico: as mudanças valem na hora; Esc ou clique fora fecham.

import { useRef, useState, type PointerEvent, type ReactElement, type ReactNode } from "react"
import { ptBR } from "react-day-picker/locale"
import { PlusIcon, XIcon } from "lucide-react"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"
import { badgeVariants } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { LicitacaoCardSegment } from "@/components/ui/licitacao-card"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

import {
  CIDADES_POR_UF,
  ETAPAS,
  HOJE,
  HOJE_ISO,
  MESES,
  PESSOAS,
  RESULTADOS,
  STATUS,
  UFS,
  categoriaDoSegmento,
  dataParaIso,
  isoParaData,
  type EtapaId,
  type ResultadoId,
  type StatusId,
  type Tom,
} from "./dados"

/* ------------------------------------------------------------------ */
/* Peças visuais                                                       */
/* ------------------------------------------------------------------ */

/** Medidas do chip de segmento do original: 2px 8px, raio 5px, peso 500. */
export const CHIP_SEGMENTO = "rounded-[5px] border-0 py-0.5 leading-[1.4] font-medium"

export function ChipSegmento({ nome, className }: { nome: string; className?: string }) {
  return (
    <LicitacaoCardSegment category={categoriaDoSegmento(nome)} className={cn(CHIP_SEGMENTO, className)}>
      {nome}
    </LicitacaoCardSegment>
  )
}

/** Selo de status do edital ou de resultado, nas três famílias de cor. */
export function Selo({ tom, children, className }: { tom: Tom; children: ReactNode; className?: string }) {
  return (
    <span className={cn(badgeVariants({ variant: tom }), "h-auto rounded-sm px-2 py-0.5 leading-[1.4]", className)}>
      {children}
    </span>
  )
}

/** Ponto de cor + nome da etapa (coluna do kanban). */
export function SeloEtapa({ etapa, className }: { etapa: EtapaId; className?: string }) {
  const e = ETAPAS.find((x) => x.id === etapa)
  if (!e) return null
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-full bg-foreground/4 px-2 py-0.5 text-xs leading-[1.4] text-foreground",
        className
      )}
    >
      <span aria-hidden className={cn("size-2 shrink-0 rounded-full", e.cor)} />
      <span className="truncate">{e.rotulo}</span>
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* Cascas                                                              */
/* ------------------------------------------------------------------ */

type PopoverEditorProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Elemento que abre o popover (vira PopoverTrigger) ou só a âncora dele. */
  gatilho: ReactElement
  ancora?: boolean
  className?: string
  children: ReactNode
}

/** Popover dos editores, alinhado ao início do valor clicado. */
export function PopoverEditor({ open, onOpenChange, gatilho, ancora, className, children }: PopoverEditorProps) {
  // só âncora (sem gatilho): ao fechar, o foco volta para o controle que abriu o popover
  const retorno = useRef<HTMLElement | null>(null)
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      {ancora ? <PopoverAnchor asChild>{gatilho}</PopoverAnchor> : <PopoverTrigger asChild>{gatilho}</PopoverTrigger>}
      <PopoverContent
        align="start"
        collisionPadding={8}
        onOpenAutoFocus={() => {
          if (ancora) retorno.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
        }}
        onCloseAutoFocus={(e) => {
          if (!ancora || !retorno.current?.isConnected) return
          e.preventDefault()
          retorno.current.focus()
        }}
        className={cn("w-auto min-w-70 gap-0 rounded-[10px] p-1.5", className)}
      >
        {children}
      </PopoverContent>
    </Popover>
  )
}

/**
 * Menu que abre no clique (e não no pointerdown, como o padrão do Radix): assim
 * dá para arrastar o card começando pelo selo, como no original.
 */
export function MenuDeClique({
  open,
  onOpenChange,
  gatilho,
  children,
  className,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  gatilho: ReactElement
  children: ReactNode
  className?: string
}) {
  const interno = useRef<HTMLElement>(null)
  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange} modal={false}>
      <DropdownMenuTrigger asChild>
        <span className="inline-flex max-w-full" onClick={() => onOpenChange(!open)}>
          <Slot.Root
            ref={interno}
            aria-haspopup="menu"
            aria-expanded={open}
            onPointerDown={(e: PointerEvent) => e.stopPropagation()}
          >
            {gatilho}
          </Slot.Root>
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        collisionPadding={8}
        onCloseAutoFocus={(e) => {
          e.preventDefault()
          interno.current?.focus()
        }}
        className={cn("min-w-70 rounded-[10px] p-1.5", className)}
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/* ------------------------------------------------------------------ */
/* Status, resultado e etapa: seleção única                            */
/* ------------------------------------------------------------------ */

export function OpcoesStatus({ valor, onChange }: { valor: StatusId | null; onChange: (v: StatusId | null) => void }) {
  return (
    <>
      <DropdownMenuRadioGroup value={valor ?? ""} onValueChange={(v) => onChange(v as StatusId)}>
        {STATUS.map((s) => (
          <DropdownMenuRadioItem key={s.id} value={s.id}>
            <Selo tom={s.tom}>{s.rotulo}</Selo>
          </DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
      {valor && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => onChange(null)} className="text-muted-foreground">
              <XIcon />
              Limpar status
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </>
      )}
    </>
  )
}

export function OpcoesResultado({
  valor,
  onChange,
}: {
  valor: ResultadoId | null | undefined
  onChange: (v: ResultadoId | null) => void
}) {
  return (
    <>
      <DropdownMenuRadioGroup value={valor ?? ""} onValueChange={(v) => onChange(v as ResultadoId)}>
        {RESULTADOS.map((r) => (
          <DropdownMenuRadioItem key={r.id} value={r.id}>
            <Selo tom={r.tom}>{r.rotulo}</Selo>
          </DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
      {valor && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => onChange(null)} className="text-muted-foreground">
              <XIcon />
              Limpar resultado
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </>
      )}
    </>
  )
}

export function OpcoesEtapa({ valor, onChange }: { valor: EtapaId; onChange: (v: EtapaId) => void }) {
  return (
    <DropdownMenuRadioGroup value={valor} onValueChange={(v) => onChange(v as EtapaId)}>
      {ETAPAS.map((e) => (
        <DropdownMenuRadioItem key={e.id} value={e.id}>
          <SeloEtapa etapa={e.id} />
        </DropdownMenuRadioItem>
      ))}
    </DropdownMenuRadioGroup>
  )
}

/* ------------------------------------------------------------------ */
/* Segmentos: multi-seleção com busca e "Criar"                        */
/* ------------------------------------------------------------------ */

export function ListaSegmentos({
  selecionados,
  disponiveis,
  onAlternar,
  onCriar,
}: {
  selecionados: string[]
  disponiveis: string[]
  onAlternar: (nome: string) => void
  onCriar: (nome: string) => void
}) {
  const [busca, setBusca] = useState("")
  const termo = busca.trim()
  const q = termo.toLowerCase()
  const livres = disponiveis.filter((s) => !selecionados.includes(s) && s.toLowerCase().includes(q))
  const podeCriar = !!q && !disponiveis.some((s) => s.toLowerCase() === q)

  return (
    <Command shouldFilter={false} className="p-0">
      <CommandInput
        value={busca}
        onValueChange={setBusca}
        placeholder="Buscar ou criar segmento..."
        aria-label="Buscar ou criar segmento"
      />
      <CommandList className="mt-1 max-h-70">
        {!selecionados.length && !livres.length && !podeCriar && (
          <p className="px-2 py-2.5 text-center text-xs text-muted-foreground">Nenhum segmento</p>
        )}
        {selecionados.length > 0 && (
          <CommandGroup heading="Selecionados">
            {selecionados.map((s) => (
              <CommandItem key={s} value={`sel:${s}`} data-checked="true" onSelect={() => onAlternar(s)}>
                <ChipSegmento nome={s} />
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {livres.length > 0 && (
          <CommandGroup heading="Disponíveis">
            {livres.map((s) => (
              <CommandItem key={s} value={`disp:${s}`} onSelect={() => onAlternar(s)}>
                <ChipSegmento nome={s} />
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {podeCriar && (
          <CommandGroup heading="Criar">
            <CommandItem
              value={`criar:${termo}`}
              onSelect={() => {
                onCriar(termo)
                setBusca("")
              }}
            >
              <PlusIcon className="text-muted-foreground" />
              <span>
                Criar “<strong>{termo}</strong>”
              </span>
            </CommandItem>
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  )
}

/* ------------------------------------------------------------------ */
/* Responsáveis: multi-seleção com busca                               */
/* ------------------------------------------------------------------ */

export function ListaPessoas({ selecionados, onAlternar }: { selecionados: number[]; onAlternar: (id: number) => void }) {
  return (
    <Command className="p-0">
      <CommandInput placeholder="Buscar pessoa..." aria-label="Buscar pessoa" />
      <CommandList className="mt-1 max-h-70">
        <CommandEmpty className="py-2.5 text-xs text-muted-foreground">Nenhuma pessoa encontrada</CommandEmpty>
        <CommandGroup>
          {PESSOAS.map((p) => (
            <CommandItem
              key={p.id}
              value={p.nome}
              data-checked={selecionados.includes(p.id) ? "true" : undefined}
              onSelect={() => onAlternar(p.id)}
            >
              {p.nome}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}

/* ------------------------------------------------------------------ */
/* Envio da proposta: mini-calendário                                  */
/* ------------------------------------------------------------------ */

const DIAS_DA_SEMANA = "DSTQQSS"

/** Sem data, abre no mês de hoje; "Hoje" define a data de hoje. */
export function CalendarioEnvio({ valor, onEscolher }: { valor: string | null; onEscolher: (iso: string) => void }) {
  const [mes, setMes] = useState(() => (valor ? isoParaData(valor) : HOJE))
  return (
    <div className="flex flex-col">
      <Calendar
        mode="single"
        required
        locale={ptBR}
        month={mes}
        onMonthChange={setMes}
        today={HOJE}
        selected={valor ? isoParaData(valor) : undefined}
        onSelect={(d) => d && onEscolher(dataParaIso(d))}
        formatters={{
          formatCaption: (d) => `${MESES[d.getMonth()]} ${d.getFullYear()}`,
          formatWeekdayName: (d) => DIAS_DA_SEMANA[d.getDay()],
        }}
        // hoje em teal, como no original
        classNames={{ today: "font-semibold text-primary" }}
        className="mx-auto p-1.5"
      />
      <div className="mt-1 flex items-center border-t pt-1.5">
        <Button variant="ghost" size="xs" className="text-muted-foreground" onClick={() => onEscolher(HOJE_ISO)}>
          Hoje
        </Button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Cidade e Estado: dois campos dependentes                            */
/* ------------------------------------------------------------------ */

export function EditorCidade({
  cidade,
  estado,
  onChange,
  idBase,
}: {
  cidade: string
  estado: string
  onChange: (patch: { cidade: string; estado: string }) => void
  /** Prefixo dos ids dos campos (únicos na página). */
  idBase: string
}) {
  const uf = CIDADES_POR_UF[estado] ? estado : "SP"
  const cidades = CIDADES_POR_UF[uf] ?? []
  const atual = cidades.includes(cidade) ? cidade : (cidades[0] ?? "")

  return (
    <FieldGroup className="gap-1 p-1">
      <Field orientation="horizontal" className="gap-2.5 px-1 py-1">
        <FieldLabel htmlFor={`${idBase}-uf`} className="min-w-12.5 text-xs font-medium text-muted-foreground">
          Estado
        </FieldLabel>
        <NativeSelect
          id={`${idBase}-uf`}
          size="sm"
          autoFocus
          className="flex-1"
          value={uf}
          onChange={(e) => {
            const novaUf = e.target.value
            const lista = CIDADES_POR_UF[novaUf] ?? []
            // a cidade atual pode não existir no novo estado
            onChange({ estado: novaUf, cidade: lista.includes(cidade) ? cidade : (lista[0] ?? "") })
          }}
        >
          {UFS.map((u) => (
            <NativeSelectOption key={u} value={u}>
              {u}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </Field>
      <Field orientation="horizontal" className="gap-2.5 px-1 py-1">
        <FieldLabel htmlFor={`${idBase}-cidade`} className="min-w-12.5 text-xs font-medium text-muted-foreground">
          Cidade
        </FieldLabel>
        <NativeSelect
          id={`${idBase}-cidade`}
          size="sm"
          className="flex-1"
          value={atual}
          onChange={(e) => onChange({ estado: uf, cidade: e.target.value })}
        >
          {cidades.map((c) => (
            <NativeSelectOption key={c} value={c}>
              {c}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </Field>
    </FieldGroup>
  )
}
