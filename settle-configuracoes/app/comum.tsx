// Peças pequenas usadas em mais de uma página de Configurações.

import { useState, type ComponentProps, type ReactNode } from "react"
import { InfoIcon, XIcon } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Toggle } from "@/components/ui/toggle"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

import { VARS, type OrigemVar, type Variavel } from "./dados"

/** Toast com "Desfazer". */
export function avisarComDesfazer(mensagem: string, desfazer: () => void) {
  toast(mensagem, { action: { label: "Desfazer", onClick: desfazer } })
}

/**
 * Aviso de consequência (o que acontece com o que já existe). tom "marca": no verde da Settle, para explicar uma seção.
 *
 * Com `fechavel`, ganha um botão de fechar. Aqui no protótipo fechar vale até recarregar a
 * página, igual ao card "Como funciona", para dar para demonstrar de novo. **No produto, uma
 * vez que a pessoa fecha, aquele banner não volta mais** (guardar por pessoa e por seção:
 * fechar o de Variáveis não fecha o de Agentes).
 */
export function Aviso({
  children,
  className,
  tom = "neutro",
  fechavel,
}: {
  children: ReactNode
  className?: string
  tom?: "neutro" | "marca"
  fechavel?: boolean
}) {
  const [fechado, setFechado] = useState(false)
  if (fechado) return null
  return (
    <Alert
      className={cn(
        "mb-3.5 px-3.5 py-2.75",
        tom === "marca" ? "border-primary/25 bg-primary/8 [&>svg]:text-primary" : "bg-muted",
        fechavel && "pr-11",
        className
      )}
    >
      <InfoIcon />
      <AlertDescription className="text-[13px] leading-[19px] text-foreground [&_b]:font-semibold">
        {children}
      </AlertDescription>
      {fechavel && (
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Fechar explicação"
          title="Fechar. Esta explicação não aparece de novo."
          className="absolute top-1.5 right-1.5 text-muted-foreground hover:text-foreground"
          onClick={() => setFechado(true)}
        >
          <XIcon />
        </Button>
      )}
    </Alert>
  )
}


/** Botão só com ícone, com dica. perigo: fica vermelho no hover (excluir, arquivar). */
export function BotaoIcone({
  rotulo,
  dica,
  perigo,
  className,
  children,
  ...props
}: ComponentProps<typeof Button> & { rotulo: string; dica?: string; perigo?: boolean }) {
  const botao = (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={rotulo}
      className={cn("text-muted-foreground", perigo && "hover:text-destructive", className)}
      {...props}
    >
      {children}
    </Button>
  )
  if (!dica) return botao
  return (
    <Tooltip>
      <TooltipTrigger asChild>{botao}</TooltipTrigger>
      <TooltipContent>{dica}</TooltipContent>
    </Tooltip>
  )
}

/** Pílula liga/desliga (onde o motivo aparece, "Pede descrição"). */
export function Pilula({ className, ...props }: ComponentProps<typeof Toggle>) {
  return (
    <Toggle
      size="sm"
      variant="outline"
      className={cn(
        "h-5.5 min-w-0 flex-none rounded-full bg-card px-2.25 text-[11.5px] font-normal text-muted-foreground shadow-none hover:bg-muted aria-pressed:border-primary aria-pressed:bg-primary/10 aria-pressed:font-semibold aria-pressed:text-primary",
        className
      )}
      {...props}
    />
  )
}

/** Selo de filtro salvo numa aba ("Situação: Ativas"). onAbrir edita; onRemover tira o filtro. */
export function SeloDeFiltro({
  rotulo,
  valor,
  onAbrir,
  onRemover,
}: {
  rotulo: string
  valor: string
  onAbrir?: () => void
  onRemover?: () => void
}) {
  const conteudo = (
    <>
      <span className="text-muted-foreground">{rotulo}:</span>
      <span className="font-semibold text-foreground">{valor}</span>
    </>
  )
  return (
    <span className="inline-flex h-6 flex-none items-center rounded-full bg-foreground/10 text-xs whitespace-nowrap">
      {onAbrir ? (
        <button
          type="button"
          onClick={onAbrir}
          className={cn(
            "inline-flex h-full items-center gap-1.25 rounded-full pl-2.75 outline-none hover:bg-foreground/5 focus-visible:ring-3 focus-visible:ring-ring/50",
            onRemover ? "pr-1" : "pr-2.75"
          )}
        >
          {conteudo}
        </button>
      ) : (
        <span className={cn("inline-flex items-center gap-1.25 pl-2.75", onRemover ? "pr-1" : "pr-2.75")}>
          {conteudo}
        </span>
      )}
      {onRemover && (
        <button
          type="button"
          aria-label={`Tirar o filtro ${rotulo}`}
          onClick={onRemover}
          className="mr-1 inline-flex size-4.5 items-center justify-center rounded-full text-muted-foreground outline-none hover:bg-foreground/10 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <XIcon aria-hidden className="size-3" />
        </button>
      )}
    </span>
  )
}

/** Selo de origem da variável (da organização ou da Settle). */
export function SeloDeOrigem({ origem }: { origem: OrigemVar }) {
  return (
    <span
      className={cn(
        "inline-flex flex-none items-center rounded-md border px-1.75 text-xs leading-4.5 whitespace-nowrap",
        origem === "minha" ? "border-primary/30 bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
      )}
    >
      {origem === "minha" ? "Minha variável" : "Variável Settle"}
    </span>
  )
}

/**
 * Lista de variáveis (e-mail e campos do card): as da Settle e as da organização,
 * com busca e o atalho para criar uma nova em Variáveis. Vai dentro de um PopoverContent.
 */
export function ListaDeVariaveis({
  excluir = [],
  onEscolher,
}: {
  excluir?: string[]
  onEscolher: (v: Variavel) => void
}) {
  const grupo = (origem: OrigemVar, titulo: string) => {
    const vs = VARS.filter((v) => v.o === origem && !excluir.includes(v.k))
    if (!vs.length) return null
    return (
      <CommandGroup heading={titulo} className="**:[[cmdk-group-heading]]:text-[11px] **:[[cmdk-group-heading]]:font-semibold **:[[cmdk-group-heading]]:tracking-wide **:[[cmdk-group-heading]]:uppercase">
        {vs.map((v) => (
          <CommandItem
            key={v.k}
            value={`${v.n} ${v.k}`}
            // adiado: com Enter, fechar na hora devolve o foco ao gatilho e o mesmo Enter o reabriria
            onSelect={() => window.setTimeout(() => onEscolher(v), 0)}
            className="items-baseline"
          >
            <span className="font-semibold">{v.n}</span>
            <span className="text-[11.5px] text-muted-foreground">
              {v.o === "minha" ? `Minha variável · ${v.tipo}` : "Settle"}
            </span>
          </CommandItem>
        ))}
      </CommandGroup>
    )
  }
  return (
    <Command>
      <CommandInput placeholder="Buscar variável" aria-label="Buscar variável" />
      <CommandList className="max-h-70">
        <CommandEmpty>Nenhuma variável encontrada</CommandEmpty>
        {grupo("settle", "Da Settle")}
        {grupo("minha", "Da organização")}
        <CommandSeparator />
        <CommandGroup>
          <CommandItem
            forceMount
            value="Criar variável"
            onSelect={() => (window.location.hash = "variaveis?nova=1")}
            className="font-semibold text-primary data-selected:text-primary"
          >
            Criar variável
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  )
}
