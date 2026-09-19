// Editores de propriedade do card: texto na própria linha (input no lugar do valor, sem
// deslocar o texto) e popovers ancorados no valor para select, data e segmentos.

import { useEffect, useRef, type KeyboardEvent, type ReactElement, type ReactNode } from "react"
import { ptBR } from "react-day-picker/locale"
import { ArrowUpRightIcon, CopyIcon, PencilIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Calendar } from "@/components/ui/calendar"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

import { formatarDataBR, lerDataBR } from "./dados"

/** Destaque de alvo editável: o mesmo cinza no hover e durante a edição. */
export const ALVO_EDITAVEL = "-mx-[3px] rounded-sm px-[3px] transition-colors duration-120"

/* ------------------------------------------------------------------ */
/* Texto na própria linha                                              */
/* ------------------------------------------------------------------ */

/**
 * Campo de texto que ocupa o lugar do valor durante a edição. Enter salva (em texto longo,
 * Ctrl/Cmd + Enter), Esc cancela e sair do campo salva.
 */
export function EntradaNaLinha({
  valor,
  rotulo,
  multilinha,
  onSalvar,
  onCancelar,
  className,
}: {
  valor: string
  rotulo: string
  multilinha?: boolean
  onSalvar: (valor: string) => void
  onCancelar: () => void
  className?: string
}) {
  const ref = useRef<HTMLInputElement & HTMLTextAreaElement>(null)
  const encerrado = useRef(false)

  useEffect(() => {
    ref.current?.focus()
    ref.current?.select()
  }, [])

  const encerrar = (salvar: boolean) => {
    if (encerrado.current) return
    encerrado.current = true
    const texto = ref.current?.value.trim() ?? ""
    if (salvar) onSalvar(texto || valor)
    else onCancelar()
  }

  const props = {
    ref,
    defaultValue: valor,
    "aria-label": rotulo,
    onBlur: () => encerrar(true),
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        e.stopPropagation()
        encerrar(false)
      } else if (e.key === "Enter" && (!multilinha || e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        encerrar(true)
      }
    },
    className: cn(
      ALVO_EDITAVEL,
      "m-0 min-w-0 resize-none border-0 bg-foreground/6 p-0 [font:inherit] text-inherit caret-primary outline-none",
      className
    ),
  }

  return multilinha ? <textarea rows={1} {...props} /> : <input type="text" {...props} />
}

/* ------------------------------------------------------------------ */
/* Casca dos popovers                                                  */
/* ------------------------------------------------------------------ */

function PopoverAncorado({
  open,
  onOpenChange,
  ancora,
  className,
  focarLista,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  ancora: ReactElement
  className?: string
  /** Sem campo de busca: o foco vai para a lista (setas e Enter funcionam). */
  focarLista?: boolean
  children: ReactNode
}) {
  // a âncora não é o botão que abriu: ao fechar, o foco volta para quem abriu
  const retorno = useRef<HTMLElement | null>(null)
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverAnchor asChild>{ancora}</PopoverAnchor>
      <PopoverContent
        align="start"
        collisionPadding={8}
        onOpenAutoFocus={(e) => {
          retorno.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
          if (focarLista) {
            e.preventDefault()
            const lista = (e.currentTarget as HTMLElement).querySelector<HTMLElement>("[cmdk-root]")
            lista?.focus()
          }
        }}
        onCloseAutoFocus={(e) => {
          if (!retorno.current?.isConnected) return
          e.preventDefault()
          retorno.current.focus()
        }}
        className={cn("w-auto min-w-50 gap-0 rounded-[10px] p-1.5", className)}
      >
        {children}
      </PopoverContent>
    </Popover>
  )
}

/* ------------------------------------------------------------------ */
/* Seleção (única ou múltipla)                                         */
/* ------------------------------------------------------------------ */

export function EditorDeSelecao({
  open,
  onOpenChange,
  ancora,
  rotulo,
  opcoes,
  selecionadas,
  busca,
  placeholderBusca = "Buscar…",
  onEscolher,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  ancora: ReactElement
  rotulo: string
  opcoes: string[]
  selecionadas: string[]
  busca?: boolean
  placeholderBusca?: string
  /** Seleção única: quem chama fecha o popover. Múltipla: o popover continua aberto. */
  onEscolher: (opcao: string) => void
}) {
  return (
    <PopoverAncorado open={open} onOpenChange={onOpenChange} ancora={ancora} focarLista={!busca}>
      <Command label={rotulo} defaultValue={selecionadas[0]} className="p-0 outline-none">
        {busca && <CommandInput placeholder={placeholderBusca} aria-label={`Buscar em ${rotulo}`} />}
        <CommandList className={cn("max-h-60", busca && "mt-1")}>
          <CommandEmpty className="px-2 py-2.5 text-[13px] text-muted-foreground">Nada encontrado</CommandEmpty>
          <CommandGroup className="p-0">
            {opcoes.map((o) => (
              <CommandItem
                key={o}
                value={o}
                data-checked={selecionadas.includes(o) ? "true" : undefined}
                onSelect={() => onEscolher(o)}
                className="text-[13px] **:[svg]:text-primary"
              >
                {o}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverAncorado>
  )
}

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]
const DIAS_DA_SEMANA = "DSTQQSS"

export function EditorDeData({
  open,
  onOpenChange,
  ancora,
  valor,
  onEscolher,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  ancora: ReactElement
  /** DD/MM/AAAA */
  valor: string
  onEscolher: (valor: string) => void
}) {
  const atual = lerDataBR(valor) ?? undefined
  return (
    <PopoverAncorado open={open} onOpenChange={onOpenChange} ancora={ancora} className="min-w-62.5">
      <Calendar
        mode="single"
        required
        locale={ptBR}
        defaultMonth={atual ?? new Date(2026, 1, 1)}
        selected={atual}
        onSelect={(d) => d && onEscolher(formatarDataBR(d))}
        formatters={{
          formatCaption: (d) => `${MESES[d.getMonth()]} ${d.getFullYear()}`,
          formatWeekdayName: (d) => DIAS_DA_SEMANA[d.getDay()],
        }}
        // hoje em teal
        classNames={{ today: "font-semibold text-primary" }}
        className="mx-auto p-1"
      />
    </PopoverAncorado>
  )
}

/* ------------------------------------------------------------------ */
/* Ações da propriedade (lápis, trecho do edital, copiar)              */
/* ------------------------------------------------------------------ */

function AcaoDaPilula({
  dica,
  rotulo,
  className,
  onClick,
  children,
}: {
  dica: string
  rotulo: string
  className?: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={rotulo}
          onClick={onClick}
          className={cn(
            "size-6.5 rounded-none text-muted-foreground hover:bg-foreground/9 hover:text-foreground",
            "not-first:shadow-[inset_1px_0_0_var(--color-border)]",
            className
          )}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{dica}</TooltipContent>
    </Tooltip>
  )
}

/**
 * Pílula de ações que aparece no hover (ou com foco) da propriedade.
 * flutuante: por cima do fim do valor, à direita, com um degradê (não reserva espaço).
 */
export function AcoesDaPropriedade({
  rotulo,
  editavel,
  vinculada,
  flutuante,
  onEditar,
  onTrecho,
  onCopiar,
  className,
}: {
  rotulo: string
  editavel: boolean
  vinculada: boolean
  flutuante?: boolean
  onEditar: () => void
  onTrecho: () => void
  onCopiar: () => void
  className?: string
}) {
  return (
    <div
      data-sem-detalhe
      className={cn(
        "flex flex-none items-center opacity-0 transition-opacity duration-120",
        "group-hover/prop:opacity-100 focus-within:opacity-100 has-aria-expanded:opacity-100",
        flutuante &&
          "pointer-events-none absolute top-1/2 right-0 -translate-y-1/2 bg-[linear-gradient(90deg,transparent,var(--color-card)_22px)] pl-7 group-hover/prop:pointer-events-auto focus-within:pointer-events-auto",
        className
      )}
    >
      <ButtonGroup aria-label={`Ações de ${rotulo}`} className="overflow-hidden rounded-lg bg-muted">
        {editavel && (
          <AcaoDaPilula dica="Editar" rotulo={`Editar ${rotulo}`} onClick={onEditar}>
            <PencilIcon />
          </AcaoDaPilula>
        )}
        <AcaoDaPilula
          dica={vinculada ? "Ver trecho no edital" : "Vincular trecho do edital"}
          rotulo={vinculada ? `Ver trecho de ${rotulo} no edital` : `Vincular trecho do edital a ${rotulo}`}
          onClick={onTrecho}
          // seta verde: a propriedade tem trecho vinculado
          className={cn(vinculada && "text-success-strong hover:bg-success/10 hover:text-success-strong")}
        >
          <ArrowUpRightIcon />
        </AcaoDaPilula>
        <AcaoDaPilula dica="Copiar" rotulo={`Copiar ${rotulo}`} onClick={onCopiar}>
          <CopyIcon />
        </AcaoDaPilula>
      </ButtonGroup>
    </div>
  )
}
