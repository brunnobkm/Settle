// Editores das propriedades (popovers ancorados no componente clicado, §11).
// Salvam ao fechar: não há botão "Salvar" nem "Cancelar"; Esc fecha mantendo as mudanças.

import { useState, type ReactElement, type ReactNode } from "react"
import { ptBR } from "react-day-picker/locale"
import { FileIcon, PlusIcon, UploadIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { badgeVariants } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
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
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group"
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

import {
  MESES,
  PESSOAS,
  STATUS,
  dataParaIso,
  isoParaData,
  lerValor,
  limparValor,
  valorParaInput,
  type Status,
  type StatusId,
} from "./dados"

/* ------------------------------------------------------------------ */
/* Peças visuais compartilhadas                                        */
/* ------------------------------------------------------------------ */

/** Chip de segmento: fundo escuro, texto claro, uma linha só (não trunca, §5.3). */
export function ChipSegmento({ nome, className }: { nome: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[5px] bg-foreground px-2 py-0.5 text-xs leading-[1.4] font-medium whitespace-nowrap text-background",
        className
      )}
    >
      {nome}
    </span>
  )
}

/** Pill de status nas três famílias de cor (§10.2). */
export function PillStatus({ status, className }: { status: Status; className?: string }) {
  return (
    <span
      className={cn(
        badgeVariants({ variant: status.tom }),
        "h-auto rounded-sm px-2 py-0.5 leading-[1.4]",
        className
      )}
    >
      {status.rotulo}
    </span>
  )
}

/** Chip oval de pessoa (responsável), só o nome. */
export function ChipPessoa({ nome, className }: { nome: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-block max-w-full truncate rounded-full bg-foreground/5 px-2 py-0.5 text-xs leading-[1.4] text-foreground",
        className
      )}
    >
      {nome}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* Casca dos popovers                                                  */
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

export function PopoverEditor({ open, onOpenChange, gatilho, ancora, className, children }: PopoverEditorProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      {ancora ? <PopoverAnchor asChild>{gatilho}</PopoverAnchor> : <PopoverTrigger asChild>{gatilho}</PopoverTrigger>}
      <PopoverContent
        align="start"
        collisionPadding={8}
        className={cn("w-auto min-w-70 gap-0 rounded-[10px] p-1.5", className)}
      >
        {children}
      </PopoverContent>
    </Popover>
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
      <CommandList className="mt-1 max-h-60">
        {!disponiveis.length && !q && (
          <p className="px-2 py-3 text-center text-xs text-muted-foreground">
            Nenhum segmento criado ainda. Comece digitando.
          </p>
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
/* Pessoas: multi-seleção com busca (responsáveis e tipo "Pessoa")     */
/* ------------------------------------------------------------------ */

export function ListaPessoas({ selecionados, onAlternar }: { selecionados: number[]; onAlternar: (id: number) => void }) {
  return (
    <Command className="p-0">
      <CommandInput placeholder="Buscar pessoa..." aria-label="Buscar pessoa" />
      <CommandList className="mt-1 max-h-60">
        <CommandEmpty className="py-3 text-xs text-muted-foreground">Nenhuma pessoa encontrada</CommandEmpty>
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
/* Opções simples (tipos "Select" e "Multi-select")                    */
/* ------------------------------------------------------------------ */

export function ListaOpcoes({
  opcoes,
  selecionadas,
  onEscolher,
  multi,
}: {
  opcoes: string[]
  selecionadas: string[]
  onEscolher: (opcao: string) => void
  multi?: boolean
}) {
  return (
    <Command className="p-0">
      <CommandInput placeholder="Buscar..." aria-label="Buscar opção" />
      <CommandList className="mt-1 max-h-60">
        <CommandEmpty className="py-3 text-xs text-muted-foreground">Sem opções</CommandEmpty>
        <CommandGroup>
          {opcoes.map((o) => (
            <CommandItem
              key={o}
              value={o}
              data-checked={selecionadas.includes(o) ? "true" : undefined}
              onSelect={() => onEscolher(o)}
            >
              {multi ? (
                <ChipSegmento nome={o} />
              ) : (
                <span className={cn(badgeVariants({ variant: "secondary" }), "h-auto rounded-sm py-0.5")}>{o}</span>
              )}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}

/* ------------------------------------------------------------------ */
/* Status: seleção única                                               */
/* ------------------------------------------------------------------ */

export function EditorStatus({
  open,
  onOpenChange,
  valor,
  onChange,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  valor: StatusId | null
  onChange: (valor: StatusId | null) => void
  children: ReactElement
}) {
  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange} modal={false}>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="start" collisionPadding={8} className="w-auto min-w-70 rounded-[10px] p-1.5">
        <DropdownMenuRadioGroup value={valor ?? ""} onValueChange={(v) => onChange(v as StatusId)}>
          {STATUS.map((s) => (
            <DropdownMenuRadioItem key={s.id} value={s.id}>
              <PillStatus status={s} />
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
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/* ------------------------------------------------------------------ */
/* Data: mini-calendário                                               */
/* ------------------------------------------------------------------ */

const DIAS_DA_SEMANA = "DSTQQSS"

export function CalendarioData({
  valor,
  onEscolher,
  onLimpar,
}: {
  valor: string | null
  onEscolher: (iso: string) => void
  /** Com onLimpar, mostra o rodapé "Hoje" / "Limpar". */
  onLimpar?: () => void
}) {
  const [mes, setMes] = useState(() => (valor ? isoParaData(valor) : new Date()))

  return (
    <div className="flex flex-col">
      <Calendar
        mode="single"
        required
        locale={ptBR}
        month={mes}
        onMonthChange={setMes}
        selected={valor ? isoParaData(valor) : undefined}
        onSelect={(d) => d && onEscolher(dataParaIso(d))}
        formatters={{
          formatCaption: (d) => `${MESES[d.getMonth()]} ${d.getFullYear()}`,
          formatWeekdayName: (d) => DIAS_DA_SEMANA[d.getDay()],
        }}
        // hoje em teal (§5.8)
        classNames={{ today: "font-semibold text-primary" }}
        className="mx-auto p-1.5"
      />
      {onLimpar && (
        <div className="mt-1 flex items-center justify-between border-t pt-1.5">
          <Button variant="ghost" size="xs" className="text-muted-foreground" onClick={() => setMes(new Date())}>
            Hoje
          </Button>
          <Button variant="ghost" size="xs" className="text-muted-foreground" onClick={onLimpar}>
            Limpar
          </Button>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Valor global                                                        */
/* ------------------------------------------------------------------ */

/**
 * Campo de valor em reais. Salva a cada digitação válida (o popover salva ao fechar,
 * inclusive com Esc) e Enter conclui. Só aceita números, "," e "."; "1500" vira R$ 1.500,00.
 */
export function CampoValor({
  valor,
  onSalvar,
  onConcluir,
  id,
  autoFocus,
  rotulo = "Valor global",
}: {
  valor: number | null
  onSalvar: (valor: number | null) => void
  onConcluir?: () => void
  id?: string
  autoFocus?: boolean
  rotulo?: string
}) {
  const [texto, setTexto] = useState(valorParaInput(valor))
  const erro = lerValor(texto) === "invalido"

  return (
    <div className="flex flex-col gap-1">
      <InputGroup className="h-8">
        <InputGroupAddon>
          <InputGroupText>R$</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput
          id={id}
          autoFocus={autoFocus}
          inputMode="decimal"
          aria-label={id ? undefined : rotulo}
          aria-invalid={erro || undefined}
          value={texto}
          onChange={(e) => {
            const limpo = limparValor(e.target.value)
            setTexto(limpo)
            const lido = lerValor(limpo)
            if (lido !== "invalido") onSalvar(lido)
          }}
          onFocus={(e) => e.currentTarget.select()}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !erro) {
              e.preventDefault()
              onConcluir?.()
            }
          }}
          className="tabular-nums"
        />
      </InputGroup>
      {erro && <p className="px-1 text-xs text-destructive">Valor inválido.</p>}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Arquivos e mídia (upload simulado)                                  */
/* ------------------------------------------------------------------ */

export function ListaArquivos({ arquivos, onChange }: { arquivos: string[]; onChange: (arquivos: string[]) => void }) {
  return (
    <div className="flex flex-col gap-2 p-1">
      <button
        type="button"
        onClick={() => onChange([...arquivos, `documento-${arquivos.length + 1}.pdf`])}
        className="flex flex-col items-center gap-0.5 rounded-md border border-dashed border-border p-3 text-center outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <UploadIcon className="mb-1 size-5 text-muted-foreground" />
        <span className="text-xs text-foreground">Arraste arquivos aqui</span>
        <span className="text-[10px] text-muted-foreground">ou clique para simular upload</span>
      </button>
      {arquivos.length > 0 && (
        <ul className="flex flex-col gap-1">
          {arquivos.map((nome, i) => (
            <li key={nome + i} className="flex items-center gap-2 rounded-sm bg-muted px-2 py-1 text-xs">
              <FileIcon className="size-3 text-muted-foreground" />
              <span className="flex-1 truncate">{nome}</span>
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label={`Remover ${nome}`}
                className="size-5 text-muted-foreground"
                onClick={() => onChange(arquivos.filter((_, j) => j !== i))}
              >
                <XIcon />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
