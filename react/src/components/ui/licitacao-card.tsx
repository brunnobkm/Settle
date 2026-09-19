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
      className={cn("flex flex-wrap items-center gap-2.5", className)}
      {...props}
    />
  )
}

function LicitacaoCardSelect({
  label,
  className,
  ...props
}: React.ComponentProps<typeof Checkbox> & { label: string }) {
  return (
    <Checkbox
      data-slot="licitacao-card-select"
      aria-label={label}
      className={cn("size-4.5 rounded-[5px]", className)}
      {...props}
    />
  )
}

function LicitacaoCardTitle({
  className,
  ...props
}: React.ComponentProps<typeof CardTitle>) {
  return (
    <CardTitle
      data-slot="licitacao-card-title"
      className={cn(
        "text-[15px] leading-5 font-semibold whitespace-nowrap [&_b]:font-bold",
        className
      )}
      {...props}
    />
  )
}

function LicitacaoCardActions({
  className,
  ...props
}: React.ComponentProps<typeof CardAction>) {
  return (
    <CardAction
      data-slot="licitacao-card-actions"
      className={cn("ml-auto flex flex-wrap items-center gap-2", className)}
      {...props}
    />
  )
}

/** Botão da etapa atual (ex.: "Em disputa ou Homologação"). */
function LicitacaoCardStatusButton({
  tone = "warning",
  className,
  ...props
}: React.ComponentProps<typeof Button> & { tone?: "warning" | "neutral" }) {
  return (
    <Button
      data-slot="licitacao-card-status"
      data-tone={tone}
      variant="outline"
      className={cn(
        "px-3.5 shadow-none data-[tone=warning]:border-warning/25 data-[tone=warning]:bg-warning/10 data-[tone=warning]:text-warning data-[tone=warning]:hover:bg-warning/15 data-[tone=warning]:hover:text-warning",
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
  "children"
> &
  LicitacaoCardDataAttributes & {
    /** Nome da ação: vira aria-label e tooltip. */
    label: string
    icon: React.ReactNode
    /** Ação liga/desliga (ex.: salvar). Define aria-pressed. */
    pressed?: boolean
    tone?: "default" | "warning"
    /** Contador sobre o ícone (ex.: arquivos anexados). */
    count?: number
  }

function LicitacaoCardIconAction({
  label,
  icon,
  pressed,
  tone = "default",
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
          variant="outline"
          size="icon"
          aria-label={label}
          aria-pressed={pressed}
          className={cn(
            "relative size-8.5 overflow-visible text-muted-foreground shadow-none hover:text-foreground",
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
      className={cn("ml-1 flex items-center gap-1.5", className)}
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

/** Chips de segmento (fundo escuro). */
function LicitacaoCardSegments({
  segments,
  size = "default",
  className,
  ...props
}: React.ComponentProps<"ul"> & {
  segments: React.ReactNode[]
  size?: "default" | "sm"
}) {
  return (
    <ul
      data-slot="licitacao-card-segments"
      className={cn("flex flex-wrap gap-1.5", className)}
      {...props}
    >
      {segments.map((segment, index) => (
        <li key={index}>
          <Badge
            className={cn(
              "h-auto rounded-md bg-foreground font-semibold text-background",
              size === "sm" ? "px-1.75 py-0.5 text-[11px]" : "px-2 py-0.75 text-xs"
            )}
          >
            {segment}
          </Badge>
        </li>
      ))}
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

function LicitacaoCardMetaItem({ field }: { field: LicitacaoCardMetaField }) {
  return (
    <div data-slot="licitacao-card-meta-item" className="flex min-w-0 flex-col gap-0.75">
      <dt className="text-[13px] font-semibold text-foreground">{field.label}</dt>
      <dd
        data-tone={field.tone ?? "default"}
        title={field.title ?? (typeof field.value === "string" ? field.value : undefined)}
        className="flex min-w-0 items-center gap-1 text-sm text-muted-foreground data-[tone=warning]:font-medium data-[tone=warning]:text-warning [&>svg]:size-3.5 [&>svg]:shrink-0"
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
 */
function LicitacaoCardMeta({
  aside,
  fields,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  aside?: LicitacaoCardMetaField[][]
  fields: LicitacaoCardMetaField[]
}) {
  return (
    <div
      data-slot="licitacao-card-meta"
      className={cn(
        "flex overflow-hidden rounded-md border max-sm:flex-col",
        className
      )}
      {...props}
    >
      {aside?.length ? (
        <dl className="flex w-57.5 flex-none flex-col gap-3.5 border-r px-4 py-3.5 max-sm:w-auto max-sm:border-r-0 max-sm:border-b">
          {aside.map((row, index) => (
            <div key={index} className="flex gap-6">
              {row.map((field) => (
                <LicitacaoCardMetaItem key={field.label} field={field} />
              ))}
            </div>
          ))}
        </dl>
      ) : null}
      <dl className="grid min-w-0 flex-1 grid-cols-2 gap-x-4.5 gap-y-3.5 px-4.5 py-3.5 min-[640px]:grid-cols-3 min-[1100px]:grid-cols-5">
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
}

type LicitacaoCardItemsProps = {
  title?: React.ReactNode
  /** Quantidade mostrada no chip ao lado do título. */
  count?: number
  /** Texto à direita do título (ex.: "29 de 300 itens"). */
  summary?: React.ReactNode
  columns: LicitacaoCardItemsColumn[]
  rows: Record<string, React.ReactNode>[]
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  showLabel?: string
  hideLabel?: string
}

function LicitacaoCardItems({
  title = "Itens",
  count,
  summary,
  columns,
  rows,
  open: openProp,
  defaultOpen = true,
  onOpenChange,
  showLabel = "Mostrar itens",
  hideLabel = "Ocultar itens",
}: LicitacaoCardItemsProps) {
  const [openState, setOpenState] = React.useState(defaultOpen)
  const open = openProp ?? openState
  const setOpen = (value: boolean) => {
    if (openProp === undefined) setOpenState(value)
    onOpenChange?.(value)
  }

  return (
    <CardFooter
      data-slot="licitacao-card-items"
      className="block pt-0"
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
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    scope="col"
                    className={cn(
                      "h-auto px-3 py-2.5 font-semibold",
                      column.align === "right" && "text-right"
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
                        "px-3 py-2.75",
                        column.align === "right" && "text-right tabular-nums",
                        column.muted && "text-muted-foreground"
                      )}
                    >
                      {row[column.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
  segments?: React.ReactNode[]
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
        <LicitacaoCardTitle>
          {editalLabel} <b>{edital}</b>
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
  LicitacaoCardIconAction,
  LicitacaoCardIconActions,
  LicitacaoCardItems,
  LicitacaoCardMeta,
  LicitacaoCardRoot,
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
}
