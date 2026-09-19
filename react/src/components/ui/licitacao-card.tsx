"use client"

import * as React from "react"
import { ChevronDownIcon, PlusIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Card de licitação para listas densas (explorar, recomendadas, em andamento, score).
// Duas formas de usar:
// 1. <LicitacaoCard edital=... orgao=... metadados=... />: tudo por props.
// 2. Composição: LicitacaoCardRoot + LicitacaoCardHeader + LicitacaoCardMeta...
//    para telas que precisam de outra ordem ou de peças extras.

/** Atributos data-* extras (ex.: data-nao-prototipado). */
type LicitacaoCardDataAttributes = {
  [key: `data-${string}`]: string | number | boolean | undefined
}

/* ------------------------------------------------------------------ */
/* Estrutura                                                           */
/* ------------------------------------------------------------------ */

function LicitacaoCardRoot({
  className,
  ...props
}: React.ComponentProps<typeof Card>) {
  return (
    <Card
      data-slot="licitacao-card"
      className={cn(
        "gap-0 rounded-lg py-4 [--card-spacing:--spacing(4.5)]",
        className
      )}
      {...props}
    />
  )
}

/** Linha do topo: seleção, título, selos e, à direita, as ações. */
function LicitacaoCardHeader({
  className,
  ...props
}: React.ComponentProps<typeof CardHeader>) {
  return (
    <CardHeader
      data-slot="licitacao-card-header"
      // quebra linha em telas estreitas (título em cima, ações embaixo) em vez de rolar
      // group/licitacao-card-select: o LicitacaoCardSelect reveal="hover" aparece no hover daqui
      className={cn(
        "group/licitacao-card-select flex min-w-0 flex-wrap items-center gap-2.5",
        className
      )}
      {...props}
    />
  )
}

/**
 * Caixa de seleção do card (ações em lote).
 * reveal="hover": fica recolhida (largura zero) e aparece, animando a largura, no hover
 * do LicitacaoCardHeader ou de qualquer ancestral com a classe
 * "group/licitacao-card-select"; continua visível quando marcada ou com foco de teclado.
 * Use num contêiner sem gap (o espaço até o título vem da margem da própria caixa).
 */
function LicitacaoCardSelect({
  label,
  reveal = "always",
  className,
  ...props
}: React.ComponentProps<typeof Checkbox> & {
  label: string
  reveal?: "always" | "hover"
}) {
  return (
    <Checkbox
      data-slot="licitacao-card-select"
      data-reveal={reveal}
      aria-label={label}
      className={cn(
        "size-4.5 rounded-[5px]",
        reveal === "hover" && [
          "pointer-events-none mr-0 max-w-0 border-transparent opacity-0 shadow-none",
          "transition-[max-width,margin,opacity,background-color,border-color] duration-180 ease-[cubic-bezier(.2,.9,.3,1)]",
          "group-hover/licitacao-card-select:pointer-events-auto group-hover/licitacao-card-select:mr-1.5 group-hover/licitacao-card-select:max-w-5 group-hover/licitacao-card-select:border-foreground/25 group-hover/licitacao-card-select:opacity-100 hover:border-foreground/45",
          "focus-visible:mr-1.5 focus-visible:max-w-5 focus-visible:opacity-100",
          "data-checked:pointer-events-auto data-checked:mr-1.5 data-checked:max-w-5 data-checked:opacity-100",
        ],
        className
      )}
      {...props}
    />
  )
}

/**
 * Título do card. prefix: texto antes do título (ex.: "Edital"), separado por espaço.
 * size="sm": 13px, para cards estreitos. lines: corta em 1 linha (reticências) ou 2 linhas;
 * sem lines, o título fica numa linha só, sem corte.
 */
function LicitacaoCardTitle({
  prefix,
  size = "default",
  lines,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof CardTitle>, "prefix"> & {
  prefix?: React.ReactNode
  size?: "default" | "sm"
  lines?: 1 | 2
}) {
  return (
    <CardTitle
      data-slot="licitacao-card-title"
      data-size={size}
      className={cn(
        "max-w-full font-semibold [&_b]:font-bold",
        size === "sm" ? "text-[13px] leading-[1.4]" : "text-[15px] leading-5",
        lines === 1
          ? "min-w-0 truncate"
          : lines === 2
            ? "line-clamp-2 min-w-0 break-words whitespace-normal"
            : "whitespace-nowrap",
        className
      )}
      {...props}
    >
      {prefix != null && prefix !== "" && <>{prefix} </>}
      {children}
    </CardTitle>
  )
}

function LicitacaoCardActions({
  className,
  ...props
}: React.ComponentProps<typeof CardAction>) {
  return (
    <CardAction
      data-slot="licitacao-card-actions"
      className={cn(
        "ml-auto flex max-w-full min-w-0 flex-wrap items-center gap-2",
        className
      )}
      {...props}
    />
  )
}

/**
 * Botão da etapa atual (ex.: "Em disputa ou Homologação").
 * tone: warning (em andamento, atenção), success (aberta, homologada),
 * destructive (anulada, revogada, deserta) ou neutral (contorno cinza).
 */
function LicitacaoCardStatusButton({
  tone = "warning",
  className,
  ...props
}: React.ComponentProps<typeof Button> & {
  tone?: "warning" | "success" | "destructive" | "neutral"
}) {
  return (
    <Button
      data-slot="licitacao-card-status"
      data-tone={tone}
      variant="outline"
      className={cn(
        "px-3.5 shadow-none",
        "data-[tone=warning]:border-warning/25 data-[tone=warning]:bg-warning/10 data-[tone=warning]:text-warning-strong data-[tone=warning]:hover:bg-warning/15 data-[tone=warning]:hover:text-warning-strong",
        "data-[tone=success]:border-success/25 data-[tone=success]:bg-success/10 data-[tone=success]:text-success-strong data-[tone=success]:hover:bg-success/15 data-[tone=success]:hover:text-success-strong",
        "data-[tone=destructive]:border-destructive/25 data-[tone=destructive]:bg-destructive/10 data-[tone=destructive]:text-destructive data-[tone=destructive]:hover:bg-destructive/15 data-[tone=destructive]:hover:text-destructive",
        className
      )}
      {...props}
    />
  )
}

type LicitacaoCardAvatar = {
  initials: string
  name: string
}

// cores só de tokens do tema: o cliente define a cara
const AVATAR_TONES = [
  "bg-muted-foreground text-background",
  "bg-primary text-primary-foreground",
  "bg-chart-5 text-primary-foreground",
  "bg-foreground text-background",
]

function LicitacaoCardAvatars({
  avatars,
  onAdd,
  addLabel = "Adicionar responsável",
  addProps,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  avatars: LicitacaoCardAvatar[]
  onAdd?: () => void
  addLabel?: string
  addProps?: React.ComponentProps<typeof Button> & LicitacaoCardDataAttributes
}) {
  return (
    <div
      data-slot="licitacao-card-avatars"
      className={cn("flex items-center", className)}
      {...props}
    >
      <AvatarGroup>
        {avatars.map((avatar, index) => (
          <Tooltip key={avatar.initials + index}>
            <TooltipTrigger asChild>
              <Avatar aria-label={avatar.name} role="img">
                <AvatarFallback
                  className={cn(
                    "text-[11px] font-semibold",
                    AVATAR_TONES[index % AVATAR_TONES.length]
                  )}
                >
                  {avatar.initials}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>{avatar.name}</TooltipContent>
          </Tooltip>
        ))}
        {(onAdd || addProps) && (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={addLabel}
            onClick={onAdd}
            {...addProps}
            className={cn(
              "rounded-full bg-muted text-muted-foreground ring-2 ring-background hover:bg-muted hover:text-foreground",
              addProps?.className
            )}
          >
            <PlusIcon />
          </Button>
        )}
      </AvatarGroup>
    </div>
  )
}

type LicitacaoCardIconActionProps = Omit<
  React.ComponentProps<typeof Button>,
  "children" | "variant"
> &
  LicitacaoCardDataAttributes & {
    /** Nome da ação: vira aria-label e tooltip. */
    label: string
    icon: React.ReactNode
    /** Ação liga/desliga (ex.: salvar). Define aria-pressed. */
    pressed?: boolean
    tone?: "default" | "warning"
    /**
     * outline: com borda (padrão). soft: fundo cinza, sem borda, 32px.
     * ghost: pequeno (24px), sem fundo; para LicitacaoCardHoverActions.
     */
    variant?: "outline" | "soft" | "ghost"
    /** Contador sobre o ícone (ex.: arquivos anexados). */
    count?: number
  }

function LicitacaoCardIconAction({
  label,
  icon,
  pressed,
  tone = "default",
  variant = "outline",
  count,
  className,
  ...props
}: LicitacaoCardIconActionProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          data-slot="licitacao-card-icon-action"
          data-tone={tone}
          data-variant={variant}
          variant={variant === "outline" ? "outline" : "ghost"}
          size={variant === "ghost" ? "icon-xs" : "icon"}
          aria-label={label}
          aria-pressed={pressed}
          className={cn(
            "relative size-8.5 overflow-visible text-muted-foreground shadow-none hover:text-foreground",
            variant === "soft" &&
              "size-8 bg-foreground/8 text-foreground hover:bg-foreground/14 dark:hover:bg-foreground/14",
            variant === "ghost" &&
              "size-6 bg-transparent hover:bg-foreground/5 aria-expanded:bg-foreground/5 dark:hover:bg-foreground/10",
            "aria-pressed:border-primary/30 aria-pressed:bg-primary/10 aria-pressed:text-primary",
            "data-[tone=warning]:border-warning/30 data-[tone=warning]:text-warning data-[tone=warning]:hover:bg-warning/10 data-[tone=warning]:hover:text-warning",
            className
          )}
          {...props}
        >
          {icon}
          {!!count && (
            <span
              aria-hidden
              className="absolute -top-1.5 -right-1.5 flex h-4.25 min-w-4.25 items-center justify-center rounded-full bg-primary px-1 text-[10px] leading-none font-bold text-primary-foreground ring-2 ring-background"
            >
              {count}
            </span>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

function LicitacaoCardIconActions({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="licitacao-card-icon-actions"
      className={cn("ml-1 flex flex-wrap items-center gap-1.5", className)}
      {...props}
    />
  )
}

/**
 * Grupo de ações que aparece no hover do card (ou com foco, ou com um menu aberto),
 * no canto superior direito, por cima do conteúdo. Use com LicitacaoCardIconAction
 * variant="ghost". O LicitacaoCardRoot precisa de "relative" (padrão).
 */
function LicitacaoCardHoverActions({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="licitacao-card-hover-actions"
      className={cn(
        "absolute top-1.5 right-1.5 flex items-center gap-0.5 rounded-lg border bg-card p-0.5 shadow-sm",
        "-translate-y-0.5 opacity-0 transition duration-120 ease-out",
        "group-hover/card:translate-y-0 group-hover/card:opacity-100 focus-within:translate-y-0 focus-within:opacity-100",
        "has-aria-expanded:translate-y-0 has-aria-expanded:opacity-100",
        className
      )}
      {...props}
    />
  )
}

function LicitacaoCardContent({
  className,
  ...props
}: React.ComponentProps<typeof CardContent>) {
  return (
    <CardContent
      data-slot="licitacao-card-content"
      className={cn("gap-3 pt-3.5", className)}
      {...props}
    />
  )
}

type LicitacaoCardSegmentCategory = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

// cor sólida da categoria (tokens category-N do tema); sem categoria, fundo escuro
const SEGMENT_CATEGORY: Record<LicitacaoCardSegmentCategory, string> = {
  1: "bg-category-1 text-category-1-foreground",
  2: "bg-category-2 text-category-2-foreground",
  3: "bg-category-3 text-category-3-foreground",
  4: "bg-category-4 text-category-4-foreground",
  5: "bg-category-5 text-category-5-foreground",
  6: "bg-category-6 text-category-6-foreground",
  7: "bg-category-7 text-category-7-foreground",
  8: "bg-category-8 text-category-8-foreground",
}

type LicitacaoCardSegmentProps = Omit<
  React.ComponentProps<typeof Badge>,
  "variant" | "onClick"
> &
  LicitacaoCardDataAttributes & {
    /** Cor de categoria (1 a 8, tokens category-N). Sem ela, o chip é escuro. */
    category?: LicitacaoCardSegmentCategory
    size?: "default" | "sm"
    /** Torna o chip um botão (ex.: abrir o editor de segmentos). */
    onClick?: React.MouseEventHandler<HTMLElement>
  }

/** Um chip de segmento. Clicável com onClick (vira botão) ou asChild (link, gatilho). */
function LicitacaoCardSegment({
  category,
  size = "default",
  onClick,
  asChild = false,
  className,
  children,
  ...props
}: LicitacaoCardSegmentProps) {
  const clickable = asChild || !!onClick
  const classes = cn(
    "h-auto rounded-md font-semibold",
    category ? SEGMENT_CATEGORY[category] : "bg-foreground text-background",
    size === "sm" ? "px-1.75 py-0.5 text-[11px]" : "px-2 py-0.75 text-xs",
    clickable &&
      "cursor-pointer outline-none transition-[filter] duration-120 hover:brightness-[.92] focus-visible:ring-3 focus-visible:ring-ring/50",
    className
  )
  if (onClick && !asChild) {
    return (
      <Badge
        asChild
        data-slot="licitacao-card-segment"
        data-category={category}
        className={classes}
        {...props}
      >
        <button type="button" onClick={onClick}>
          {children}
        </button>
      </Badge>
    )
  }
  return (
    <Badge
      asChild={asChild}
      data-slot="licitacao-card-segment"
      data-category={category}
      className={classes}
      onClick={onClick}
      {...props}
    >
      {children}
    </Badge>
  )
}

type LicitacaoCardSegmentItem =
  | React.ReactNode
  | (Omit<LicitacaoCardSegmentProps, "children" | "size"> & {
      label: React.ReactNode
      /** Chave da lista (padrão: o label, se for texto). */
      id?: string
    })

const isSegmentObject = (
  item: LicitacaoCardSegmentItem
): item is Exclude<LicitacaoCardSegmentItem, React.ReactNode> =>
  typeof item === "object" &&
  item !== null &&
  !React.isValidElement(item) &&
  "label" in item

/**
 * Chips de segmento. Cada item pode ser só o texto (chip escuro) ou um objeto
 * { label, category?, onClick?, asChild? } para cor de categoria e chip clicável.
 */
function LicitacaoCardSegments({
  segments,
  size = "default",
  className,
  ...props
}: React.ComponentProps<"ul"> & {
  segments: LicitacaoCardSegmentItem[]
  size?: "default" | "sm"
}) {
  return (
    <ul
      data-slot="licitacao-card-segments"
      className={cn("flex flex-wrap gap-1.5", className)}
      {...props}
    >
      {segments.map((segment, index) => {
        if (isSegmentObject(segment)) {
          const { label, id, ...rest } = segment
          return (
            <li key={id ?? (typeof label === "string" ? label : index)}>
              <LicitacaoCardSegment size={size} {...rest}>
                {label}
              </LicitacaoCardSegment>
            </li>
          )
        }
        return (
          <li key={index}>
            <LicitacaoCardSegment size={size}>{segment}</LicitacaoCardSegment>
          </li>
        )
      })}
    </ul>
  )
}

/** Bloco de linhas "Rótulo: valor" (órgão, objeto...). */
function LicitacaoCardDescription({
  className,
  ...props
}: React.ComponentProps<typeof CardDescription>) {
  return (
    <CardDescription
      data-slot="licitacao-card-description"
      className={cn("flex flex-col gap-2 text-foreground", className)}
      {...props}
    />
  )
}

function LicitacaoCardField({
  label,
  tag,
  className,
  children,
  ...props
}: React.ComponentProps<"p"> & { label: React.ReactNode; tag?: React.ReactNode }) {
  return (
    <p
      data-slot="licitacao-card-field"
      className={cn("text-sm leading-[21px]", className)}
      {...props}
    >
      <span className="font-semibold">{label}:</span> {children}
      {tag != null && (
        <>
          {" "}
          <Badge
            variant="secondary"
            className="rounded-md bg-muted px-2 font-medium text-muted-foreground"
          >
            {tag}
          </Badge>
        </>
      )}
    </p>
  )
}

function LicitacaoCardValue({
  label = "Valor global",
  className,
  children,
  ...props
}: React.ComponentProps<"p"> & { label?: React.ReactNode }) {
  return (
    <p
      data-slot="licitacao-card-value"
      className={cn("text-[15px] font-bold tabular-nums", className)}
      {...props}
    >
      {label}: {children}
    </p>
  )
}

/* ------------------------------------------------------------------ */
/* Metadados em grade                                                  */
/* ------------------------------------------------------------------ */

type LicitacaoCardMetaField = {
  label: string
  value: React.ReactNode
  /** warning: prazo/atenção. Junte um ícone ou texto: estado nunca só por cor. */
  tone?: "default" | "warning"
  icon?: React.ReactNode
  /** Texto completo quando o valor é cortado. */
  title?: string
}

function LicitacaoCardMetaItem({
  field,
  className,
}: {
  field: LicitacaoCardMetaField
  className?: string
}) {
  return (
    <div
      data-slot="licitacao-card-meta-item"
      className={cn("flex min-w-0 flex-col gap-0.75", className)}
    >
      <dt className="text-[13px] font-semibold text-foreground group-data-[variant=boxed]/licitacao-card-meta:text-sm group-data-[variant=boxed]/licitacao-card-meta:leading-5">
        {field.label}
      </dt>
      <dd
        data-tone={field.tone ?? "default"}
        title={field.title ?? (typeof field.value === "string" ? field.value : undefined)}
        className="flex min-w-0 items-center gap-1 text-sm text-muted-foreground group-data-[variant=boxed]/licitacao-card-meta:leading-5 data-[tone=warning]:font-medium data-[tone=warning]:text-warning-strong [&>svg]:size-3.5 [&>svg]:shrink-0"
      >
        {field.icon}
        <span className="truncate">{field.value}</span>
      </dd>
    </div>
  )
}

/**
 * Caixa de metadados: coluna lateral (datas, prazos) + grade principal.
 * `aside` é uma lista de linhas; cada linha pode ter mais de um campo lado a lado.
 * variant="boxed": a coluna lateral e a grade viram duas caixas separadas (raio maior,
 * medidas do Figma). Para empilhar mais cedo, passe um breakpoint no className
 * (ex.: "max-[1200px]:flex-col").
 */
function LicitacaoCardMeta({
  aside,
  fields,
  variant = "default",
  className,
  ...props
}: React.ComponentProps<"div"> & {
  aside?: LicitacaoCardMetaField[][]
  fields: LicitacaoCardMetaField[]
  variant?: "default" | "boxed"
}) {
  const boxed = variant === "boxed"
  // boxed: a coluna lateral vira uma grade com as colunas alinhadas entre as linhas
  const asideColumns = Math.max(1, ...(aside ?? []).map((row) => row.length))

  return (
    <div
      data-slot="licitacao-card-meta"
      data-variant={variant}
      className={cn(
        "group/licitacao-card-meta flex max-sm:flex-col",
        boxed ? "gap-2" : "overflow-hidden rounded-md border",
        className
      )}
      {...props}
    >
      {aside?.length ? (
        boxed ? (
          <dl
            className="grid flex-none gap-x-8 gap-y-4 rounded-xl border px-3.5 py-3"
            style={{ gridTemplateColumns: `repeat(${asideColumns}, max-content)` }}
          >
            {aside.map((row) =>
              row.map((field, column) => (
                <LicitacaoCardMetaItem
                  key={field.label}
                  field={field}
                  // cada linha começa na primeira coluna
                  className={column === 0 ? "col-start-1" : undefined}
                />
              ))
            )}
          </dl>
        ) : (
          <dl className="flex w-57.5 flex-none flex-col gap-3.5 border-r px-4 py-3.5 max-sm:w-auto max-sm:border-r-0 max-sm:border-b">
            {aside.map((row, index) => (
              <div key={index} className="flex gap-6">
                {row.map((field) => (
                  <LicitacaoCardMetaItem key={field.label} field={field} />
                ))}
              </div>
            ))}
          </dl>
        )
      ) : null}
      <dl
        className={cn(
          "grid min-w-0 flex-1 grid-cols-2 min-[640px]:grid-cols-3 min-[1100px]:grid-cols-5",
          boxed
            ? "gap-x-6 gap-y-4 rounded-xl border px-3.5 py-3"
            : "gap-x-4.5 gap-y-3.5 px-4.5 py-3.5"
        )}
      >
        {fields.map((field) => (
          <LicitacaoCardMetaItem key={field.label} field={field} />
        ))}
      </dl>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Itens (tabela recolhível)                                           */
/* ------------------------------------------------------------------ */

type LicitacaoCardItemsColumn = {
  key: string
  label: string
  align?: "left" | "right"
  /** Coluna secundária (ex.: lote, quantidade): texto em tom apagado. */
  muted?: boolean
  /** Largura da coluna (ex.: 56, "9rem", "100%" para ocupar o que sobra). */
  width?: number | string
  /** Classes do título e das células da coluna (ex.: "tabular-nums"). */
  className?: string
}

type LicitacaoCardItemsProps = {
  title?: React.ReactNode
  /** Quantidade mostrada no chip ao lado do título. */
  count?: number
  /** Texto à direita do título (ex.: "29 de 300 itens"). */
  summary?: React.ReactNode
  columns: LicitacaoCardItemsColumn[]
  rows: Record<string, React.ReactNode>[]
  /**
   * default: tabela recolhível no rodapé do card ("Mostrar/Ocultar itens").
   * boxed: sempre aberta, numa caixa com borda e divisórias entre as colunas
   * (pode ficar em qualquer lugar do card, ex.: dentro de LicitacaoCardContent).
   */
  variant?: "default" | "boxed"
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  showLabel?: string
  hideLabel?: string
  className?: string
}

function LicitacaoCardItemsTable({
  columns,
  rows,
  boxed,
}: {
  columns: LicitacaoCardItemsColumn[]
  rows: Record<string, React.ReactNode>[]
  boxed: boolean
}) {
  return (
    // contain: a tabela larga rola dentro do card em vez de alargar o card (e a página)
    <Table containerClassName="[contain:inline-size]">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          {columns.map((column) => (
            <TableHead
              key={column.key}
              scope="col"
              style={column.width != null ? { width: column.width } : undefined}
              className={cn(
                boxed
                  ? "h-auto border-r px-2 py-2 text-sm font-medium last:border-r-0"
                  : "h-auto px-3 py-2.5 font-semibold",
                column.align === "right" && "text-right",
                column.className
              )}
            >
              {column.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, index) => (
          <TableRow key={index}>
            {columns.map((column) => (
              <TableCell
                key={column.key}
                className={cn(
                  boxed
                    ? "h-9 border-r px-2 py-2 text-xs leading-4 text-muted-foreground last:border-r-0"
                    : "px-3 py-2.75",
                  column.align === "right" && "text-right tabular-nums",
                  column.muted && "text-muted-foreground",
                  column.className
                )}
              >
                {row[column.key]}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function LicitacaoCardItems({
  title = "Itens",
  count,
  summary,
  columns,
  rows,
  variant = "default",
  open: openProp,
  defaultOpen = true,
  onOpenChange,
  showLabel = "Mostrar itens",
  hideLabel = "Ocultar itens",
  className,
}: LicitacaoCardItemsProps) {
  const [openState, setOpenState] = React.useState(defaultOpen)
  const open = openProp ?? openState
  const setOpen = (value: boolean) => {
    if (openProp === undefined) setOpenState(value)
    onOpenChange?.(value)
  }

  if (variant === "boxed") {
    return (
      <section
        data-slot="licitacao-card-items"
        data-variant="boxed"
        aria-label={typeof title === "string" ? title : undefined}
        className={cn("min-w-0 overflow-hidden rounded-lg border bg-card", className)}
      >
        <div className="flex items-center justify-between gap-3 border-b p-2">
          <div className="flex items-center gap-1.5">
            <h3 className="text-base leading-6 font-semibold">{title}</h3>
            {count != null && (
              <Badge
                variant="secondary"
                className="rounded-md bg-foreground/10 px-1.5 text-foreground tabular-nums"
              >
                {count}
              </Badge>
            )}
          </div>
          {summary != null && (
            <span className="text-sm text-muted-foreground">{summary}</span>
          )}
        </div>
        <LicitacaoCardItemsTable columns={columns} rows={rows} boxed />
      </section>
    )
  }

  return (
    <CardFooter
      data-slot="licitacao-card-items"
      className={cn("block pt-0", className)}
    >
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleContent>
          <div className="mt-5 mb-3 flex items-center gap-2.5">
            <span className="text-base font-semibold">{title}</span>
            {count != null && (
              <Badge
                variant="secondary"
                className="bg-muted font-semibold text-muted-foreground tabular-nums"
              >
                {count}
              </Badge>
            )}
            {summary != null && (
              <span className="ml-auto text-[13px] text-muted-foreground">
                {summary}
              </span>
            )}
          </div>
          <LicitacaoCardItemsTable columns={columns} rows={rows} boxed={false} />
        </CollapsibleContent>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="group/items-toggle mt-3.5 h-auto px-0 py-1 text-[13px] text-muted-foreground hover:bg-transparent hover:text-foreground"
          >
            <ChevronDownIcon
              data-icon="inline-start"
              className="transition-transform group-data-[state=closed]/items-toggle:-rotate-90"
            />
            {open ? hideLabel : showLabel}
          </Button>
        </CollapsibleTrigger>
      </Collapsible>
    </CardFooter>
  )
}

/* ------------------------------------------------------------------ */
/* Card completo por props                                             */
/* ------------------------------------------------------------------ */

type LicitacaoCardProps = Omit<React.ComponentProps<typeof Card>, "title"> & {
  /** Número do edital (em negrito). */
  edital: React.ReactNode
  /** Prefixo do título. Padrão: "Edital". */
  editalLabel?: React.ReactNode
  /** Mostra a caixa de seleção (ações em lote). */
  selectable?: boolean
  selected?: boolean
  onSelectedChange?: (selected: boolean) => void
  selectLabel?: string
  /** Selos ao lado do título (ex.: "Atualizado", score). */
  badges?: React.ReactNode
  /** Botões de texto à direita (ex.: Descartar, Enviar para análise). */
  actions?: React.ReactNode
  /** Botão da etapa atual (use LicitacaoCardStatusButton). */
  status?: React.ReactNode
  avatars?: LicitacaoCardAvatar[]
  onAddAvatar?: () => void
  addAvatarLabel?: string
  addAvatarProps?: React.ComponentProps<typeof Button> & LicitacaoCardDataAttributes
  iconActions?: (LicitacaoCardIconActionProps & { id?: string })[]
  /** Linha logo abaixo do topo (ex.: aderência e motivo). */
  highlight?: React.ReactNode
  segments?: LicitacaoCardSegmentItem[]
  orgao?: React.ReactNode
  orgaoLabel?: React.ReactNode
  /** Selo ao lado do órgão (ex.: "ME - EPP"). */
  orgaoTag?: React.ReactNode
  objeto?: React.ReactNode
  objetoLabel?: React.ReactNode
  valor?: React.ReactNode
  valorLabel?: React.ReactNode
  metaAside?: LicitacaoCardMetaField[][]
  meta?: LicitacaoCardMetaField[]
  items?: LicitacaoCardItemsProps
}

function LicitacaoCard({
  edital,
  editalLabel = "Edital",
  selectable = false,
  selected,
  onSelectedChange,
  selectLabel,
  badges,
  actions,
  status,
  avatars,
  onAddAvatar,
  addAvatarLabel,
  addAvatarProps,
  iconActions,
  highlight,
  segments,
  orgao,
  orgaoLabel = "Órgão",
  orgaoTag,
  objeto,
  objetoLabel = "Objeto",
  valor,
  valorLabel,
  metaAside,
  meta,
  items,
  children,
  ...props
}: LicitacaoCardProps) {
  const hasRight =
    actions != null || status != null || !!avatars?.length || !!iconActions?.length

  return (
    <LicitacaoCardRoot {...props}>
      <LicitacaoCardHeader>
        {selectable && (
          <LicitacaoCardSelect
            label={
              selectLabel ??
              `Selecionar ${typeof editalLabel === "string" ? editalLabel.toLowerCase() : ""} ${typeof edital === "string" ? edital : ""}`.trim()
            }
            checked={selected}
            onCheckedChange={(value) => onSelectedChange?.(value === true)}
          />
        )}
        <LicitacaoCardTitle prefix={editalLabel}>
          <b>{edital}</b>
        </LicitacaoCardTitle>
        {badges}
        {hasRight && (
          <LicitacaoCardActions>
            {actions}
            {status}
            {!!avatars?.length && (
              <LicitacaoCardAvatars
                avatars={avatars}
                onAdd={onAddAvatar}
                addLabel={addAvatarLabel}
                addProps={addAvatarProps}
              />
            )}
            {!!iconActions?.length && (
              <LicitacaoCardIconActions>
                {iconActions.map(({ id, ...action }) => (
                  <LicitacaoCardIconAction key={id ?? action.label} {...action} />
                ))}
              </LicitacaoCardIconActions>
            )}
          </LicitacaoCardActions>
        )}
      </LicitacaoCardHeader>

      <LicitacaoCardContent>
        {highlight}
        {!!segments?.length && <LicitacaoCardSegments segments={segments} />}
        {(orgao != null || objeto != null) && (
          <LicitacaoCardDescription>
            {orgao != null && (
              <LicitacaoCardField label={orgaoLabel} tag={orgaoTag}>
                {orgao}
              </LicitacaoCardField>
            )}
            {objeto != null && (
              <LicitacaoCardField label={objetoLabel}>{objeto}</LicitacaoCardField>
            )}
          </LicitacaoCardDescription>
        )}
        {valor != null && (
          <LicitacaoCardValue label={valorLabel}>{valor}</LicitacaoCardValue>
        )}
        {meta?.length ? <LicitacaoCardMeta aside={metaAside} fields={meta} /> : null}
      </LicitacaoCardContent>

      {items && <LicitacaoCardItems {...items} />}
      {children}
    </LicitacaoCardRoot>
  )
}

export {
  LicitacaoCard,
  LicitacaoCardActions,
  LicitacaoCardAvatars,
  LicitacaoCardContent,
  LicitacaoCardDescription,
  LicitacaoCardField,
  LicitacaoCardHeader,
  LicitacaoCardHoverActions,
  LicitacaoCardIconAction,
  LicitacaoCardIconActions,
  LicitacaoCardItems,
  LicitacaoCardMeta,
  LicitacaoCardRoot,
  LicitacaoCardSegment,
  LicitacaoCardSegments,
  LicitacaoCardSelect,
  LicitacaoCardStatusButton,
  LicitacaoCardTitle,
  LicitacaoCardValue,
  type LicitacaoCardAvatar,
  type LicitacaoCardIconActionProps,
  type LicitacaoCardItemsColumn,
  type LicitacaoCardItemsProps,
  type LicitacaoCardMetaField,
  type LicitacaoCardProps,
  type LicitacaoCardSegmentCategory,
  type LicitacaoCardSegmentItem,
  type LicitacaoCardSegmentProps,
}
