"use client"

import * as React from "react"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronDownIcon,
  FunnelIcon,
  GripVerticalIcon,
  PlusIcon,
  SquareArrowOutUpRightIcon,
} from "lucide-react"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"
import {
  ActionBar,
  ActionBarClose,
  ActionBarGroup,
  ActionBarLabel,
  ActionBarSeparator,
} from "@/components/ui/action-bar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Tabela de dados no estilo Notion, montada sobre Table + Checkbox + DropdownMenu.
// Estrutura e interações genéricas: cabeçalho fixo com menu por coluna, colunas
// redimensionáveis e reordenáveis, linhas reordenáveis pela alça, seleção com
// "selecionar tudo", grupos recolhíveis, rodapé (agregações), "adicionar coluna",
// "adicionar linha" e barra de ações em lote. O conteúdo de cada célula, os menus
// e os editores vêm por props: o componente não conhece o tipo dos dados.

type DataTableSortDirection = "asc" | "desc"

type DataTableColumn<TRow> = {
  id: string
  /** Nome no cabeçalho. */
  header: string
  /** Ícone antes do nome (ex.: tipo da coluna). */
  icon?: React.ReactNode
  /** Conteúdo extra depois do nome. */
  headerAddon?: React.ReactNode
  /** Largura em px. */
  width?: number
  /** Mostra a seta de ordenação e define aria-sort. */
  sorted?: DataTableSortDirection | false
  /** Mostra o ícone de filtro ativo. */
  filtered?: boolean
  /** Quebra o texto em várias linhas (padrão: uma linha, cortada). */
  wrap?: boolean
  align?: "start" | "center"
  /** Conteúdo da célula. */
  cell: (row: TRow) => React.ReactNode
  /**
   * false: a célula já traz o próprio DataTableCellFrame (ex.: um botão que ocupa a
   * célula inteira). Não vale para a primeira coluna, que sempre recebe o frame.
   */
  frame?: boolean
  /** Itens do menu do cabeçalho (DropdownMenuGroup...). Sem menu, o cabeçalho é só texto. */
  menu?: React.ReactNode
  /** Célula do rodapé (ex.: agregação). */
  footer?: React.ReactNode
}

type DataTableGroup<TRow> = {
  id: string
  label: React.ReactNode
  rows: TRow[]
  collapsed?: boolean
}

type DataTableLabels = {
  selectAll: string
  selectRow: (rowLabel: string) => string
  rowHandle: (rowLabel: string) => string
  openRow: string
  resizeColumn: (columnName: string) => string
  columnMenu: (columnName: string) => string
  sortedAsc: string
  sortedDesc: string
  filtered: string
  addColumn: string
  addRow: string
  empty: string
  selected: (count: number) => string
  clearSelection: string
}

const defaultLabels: DataTableLabels = {
  selectAll: "Selecionar todas as linhas",
  selectRow: (row) => `Selecionar ${row}`,
  rowHandle: (row) => `Mover ou abrir o menu de ${row}`,
  openRow: "Abrir",
  resizeColumn: (col) => `Redimensionar a coluna ${col}`,
  columnMenu: (col) => `Opções da coluna ${col}`,
  sortedAsc: "ordem crescente",
  sortedDesc: "ordem decrescente",
  filtered: "filtrada",
  addColumn: "Adicionar coluna",
  addRow: "Adicionar linha",
  empty: "Nenhuma linha encontrada.",
  selected: (n) => (n === 1 ? "1 selecionada" : `${n} selecionadas`),
  clearSelection: "Limpar seleção",
}

type DataTableProps<TRow> = Omit<React.ComponentProps<"div">, "children"> & {
  columns: DataTableColumn<TRow>[]
  /** Linhas sem agrupamento. Ignorado quando há `groups`. */
  rows?: TRow[]
  /** Linhas agrupadas: cada grupo ganha um cabeçalho recolhível. */
  groups?: DataTableGroup<TRow>[]
  onToggleGroup?: (groupId: string) => void
  getRowId: (row: TRow) => string
  /** Nome da linha para leitores de tela (padrão: o id). */
  getRowLabel?: (row: TRow) => string
  /** Ativa a seleção (checkbox na primeira coluna). */
  selectedIds?: string[]
  onSelectedIdsChange?: (ids: string[]) => void
  /** Botões da barra de ações em lote (ActionBarButton). Aparece com a seleção. */
  bulkActions?: React.ReactNode
  /** Itens do menu da alça da linha (DropdownMenuGroup...). */
  rowMenu?: (row: TRow) => React.ReactNode
  /** Mantém a alça da linha visível nas linhas selecionadas (padrão: só no hover). */
  showHandleOnSelected?: boolean
  /** Ativa arrastar linhas pela alça. */
  onRowMove?: (fromId: string, toId: string) => void
  /** Botão "Abrir" na primeira coluna. */
  onOpenRow?: (row: TRow) => void
  /** Ativa arrastar colunas pelo cabeçalho. */
  onColumnMove?: (fromId: string, toId: string) => void
  /** Ativa redimensionar colunas pela borda do cabeçalho. */
  onColumnResize?: (columnId: string, width: number) => void
  /**
   * "auto" (padrão): a coluna nunca fica menor que o conteúdo, e a tabela rola quando não
   * cabe. "fixed": as larguras de `width` mandam, o conteúdo e o título quebram em mais de
   * uma linha e a tabela acompanha a largura disponível, sem rolagem lateral.
   */
  layout?: "auto" | "fixed"
  minColumnWidth?: number
  /**
   * Última coluna "Adicionar coluna". Com content, o botão abre um popover com ele;
   * só com onClick, é um botão simples (sem popover).
   */
  addColumn?: {
    content?: React.ReactNode
    onClick?: () => void
    open?: boolean
    onOpenChange?: (open: boolean) => void
    width?: number
    contentClassName?: string
  }
  /** Botão "Adicionar linha" no fim da tabela. */
  onAddRow?: () => void
  labels?: Partial<DataTableLabels>
}

const ADD_COLUMN_CLASS =
  "flex h-11 w-full items-center gap-1.5 px-4 font-medium text-primary outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset [&_svg]:size-4"

const ROW_TYPE = "application/x-data-table-row"
const COLUMN_TYPE = "application/x-data-table-column"

/** Área padrão de uma célula: mesma altura e respiro em todas as colunas. */
function DataTableCellFrame({
  asChild = false,
  wrap = false,
  align = "start",
  vAlign = "center",
  className,
  ...props
}: React.ComponentProps<"div"> & {
  asChild?: boolean
  wrap?: boolean
  align?: "start" | "center"
  /** "top": o conteúdo fica no topo quando a linha cresce (célula com texto em várias linhas). */
  vAlign?: "center" | "top"
}) {
  const Comp = asChild ? Slot.Root : "div"
  return (
    <Comp
      data-slot="data-table-cell"
      className={cn(
        "flex min-h-11 w-full gap-1.5 px-4 py-[7px] text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset",
        vAlign === "top" ? "items-start pt-2.5" : "items-center",
        wrap
          ? "flex-wrap whitespace-normal"
          : "flex-nowrap overflow-hidden whitespace-nowrap",
        align === "center" && "justify-center",
        className
      )}
      {...props}
    />
  )
}

/**
 * Menu que abre no clique, e não no pointerdown como o padrão do Radix: o
 * pointerdown do Radix cancela o evento e impediria arrastar o mesmo elemento
 * (alça da linha, cabeçalho da coluna). O gatilho do Radix fica num invólucro e o
 * elemento de dentro não deixa o pointerdown chegar até ele.
 */
function ClickMenu({
  trigger,
  children,
  align = "start",
  className,
  contentClassName,
}: {
  trigger: React.ReactElement
  children: React.ReactNode
  align?: "start" | "center" | "end"
  className?: string
  contentClassName?: string
}) {
  const [open, setOpen] = React.useState(false)
  const innerRef = React.useRef<HTMLElement>(null)
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <span
          className={cn("flex", className)}
          onClick={() => setOpen((o) => !o)}
        >
          <Slot.Root
            ref={innerRef}
            aria-haspopup="menu"
            aria-expanded={open}
            onPointerDown={(e: React.PointerEvent) => e.stopPropagation()}
          >
            {trigger}
          </Slot.Root>
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        onCloseAutoFocus={(e) => {
          e.preventDefault()
          innerRef.current?.focus()
        }}
        className={cn("w-auto min-w-56", contentClassName)}
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function DataTable<TRow>({
  columns,
  rows = [],
  groups,
  onToggleGroup,
  getRowId,
  getRowLabel,
  selectedIds,
  onSelectedIdsChange,
  bulkActions,
  rowMenu,
  showHandleOnSelected = false,
  onRowMove,
  onOpenRow,
  onColumnMove,
  onColumnResize,
  layout = "auto",
  minColumnWidth = 60,
  addColumn,
  onAddRow,
  labels: labelsProp,
  className,
  ...props
}: DataTableProps<TRow>) {
  const labels = { ...defaultLabels, ...labelsProp }
  const selectable = !!selectedIds && !!onSelectedIdsChange
  const selected = React.useMemo(() => new Set(selectedIds ?? []), [selectedIds])
  const allRows = groups ? groups.flatMap((g) => g.rows) : rows
  const allIds = allRows.map(getRowId)
  const selectedVisible = allIds.filter((id) => selected.has(id)).length
  const allChecked =
    allIds.length > 0 && selectedVisible === allIds.length
      ? true
      : selectedVisible > 0
        ? "indeterminate"
        : false
  const span = columns.length + (addColumn ? 1 : 0)
  const hasFooter = columns.some((c) => c.footer !== undefined)
  const rowLabel = (row: TRow) => getRowLabel?.(row) || getRowId(row)

  const [draggingRow, setDraggingRow] = React.useState<string | null>(null)
  const [draggingColumn, setDraggingColumn] = React.useState<string | null>(null)

  const toggleAll = () => {
    if (!onSelectedIdsChange) return
    if (allChecked === true) {
      const visible = new Set(allIds)
      onSelectedIdsChange([...selected].filter((id) => !visible.has(id)))
    } else {
      onSelectedIdsChange([...new Set([...selected, ...allIds])])
    }
  }
  const toggleRow = (id: string) => {
    if (!onSelectedIdsChange) return
    onSelectedIdsChange(
      selected.has(id)
        ? [...selected].filter((x) => x !== id)
        : [...selected, id]
    )
  }

  const startResize = (
    e: React.MouseEvent<HTMLElement>,
    column: DataTableColumn<TRow>
  ) => {
    if (!onColumnResize) return
    e.preventDefault()
    e.stopPropagation()
    const th = e.currentTarget.closest("th")
    const startX = e.clientX
    // parte da largura real (o conteúdo pode deixar a coluna maior que width)
    const startWidth = th?.offsetWidth ?? column.width ?? 120
    const move = (ev: MouseEvent) =>
      onColumnResize(
        column.id,
        Math.max(minColumnWidth, startWidth + ev.clientX - startX)
      )
    const up = () => {
      document.removeEventListener("mousemove", move)
      document.removeEventListener("mouseup", up)
    }
    document.addEventListener("mousemove", move)
    document.addEventListener("mouseup", up)
  }
  const resizeByKey = (
    e: React.KeyboardEvent<HTMLElement>,
    column: DataTableColumn<TRow>
  ) => {
    if (!onColumnResize || (e.key !== "ArrowLeft" && e.key !== "ArrowRight"))
      return
    e.preventDefault()
    const th = e.currentTarget.closest("th")
    const current = th?.offsetWidth ?? column.width ?? 120
    onColumnResize(
      column.id,
      Math.max(minColumnWidth, current + (e.key === "ArrowLeft" ? -10 : 10))
    )
  }

  const renderHead = (column: DataTableColumn<TRow>, index: number) => {
    const first = index === 0
    const content = (
      <>
        {column.icon && (
          <span
            aria-hidden
            className="flex shrink-0 text-muted-foreground [&_svg:not([class*='size-'])]:size-4"
          >
            {column.icon}
          </span>
        )}
        <span className={cn(layout === "fixed" ? "min-w-0 break-words whitespace-normal" : "truncate")}>
          {column.header}
        </span>
        {column.headerAddon}
        {column.sorted && (
          <span className="flex shrink-0 text-muted-foreground [&_svg]:size-3.5">
            {column.sorted === "asc" ? (
              <ArrowUpIcon aria-hidden />
            ) : (
              <ArrowDownIcon aria-hidden />
            )}
            <span className="sr-only">
              {column.sorted === "asc" ? labels.sortedAsc : labels.sortedDesc}
            </span>
          </span>
        )}
        {column.filtered && (
          <span className="flex shrink-0 text-primary [&_svg]:size-3.5">
            <FunnelIcon aria-hidden />
            <span className="sr-only">{labels.filtered}</span>
          </span>
        )}
      </>
    )
    const triggerClass = cn(
      "flex h-full min-w-0 flex-1 items-center gap-1.5 pr-4 text-left font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset",
      layout === "fixed" && "py-2",
      first && selectable ? "pl-1.5" : "pl-4"
    )
    return (
      <TableHead
        key={column.id}
        scope="col"
        aria-sort={
          column.sorted === "asc"
            ? "ascending"
            : column.sorted === "desc"
              ? "descending"
              : undefined
        }
        draggable={!!onColumnMove}
        onDragStart={(e) => {
          if (!onColumnMove) return
          e.dataTransfer.setData(COLUMN_TYPE, column.id)
          e.dataTransfer.effectAllowed = "move"
          // adiado: mudar o DOM dentro do dragstart cancela o arrastar no Chrome
          setTimeout(() => setDraggingColumn(column.id), 0)
        }}
        onDragEnd={() => setDraggingColumn(null)}
        onDragEnter={(e) => {
          if (onColumnMove && e.dataTransfer.types.includes(COLUMN_TYPE))
            e.preventDefault()
        }}
        onDragOver={(e) => {
          if (onColumnMove && e.dataTransfer.types.includes(COLUMN_TYPE))
            e.preventDefault()
        }}
        onDrop={(e) => {
          const from = e.dataTransfer.getData(COLUMN_TYPE)
          if (onColumnMove && from && from !== column.id) {
            e.preventDefault()
            onColumnMove(from, column.id)
          }
        }}
        className={cn(
          "group/head sticky top-0 z-10 border-b bg-background p-0 align-bottom select-none",
          // no modo fixo o título quebra em mais de uma linha, e a altura acompanha
          layout === "fixed" ? "h-auto min-h-11" : "h-11",
          draggingColumn === column.id && "opacity-40"
        )}
      >
        <div className={cn("flex items-center hover:bg-muted", layout === "fixed" ? "min-h-11" : "h-11")}>
          {first && selectable && (
            <Checkbox
              aria-label={labels.selectAll}
              checked={allChecked}
              onCheckedChange={toggleAll}
              className={cn(
                "ml-4 opacity-0 group-hover/head:opacity-100 focus-visible:opacity-100",
                allChecked !== false && "opacity-100"
              )}
            />
          )}
          {column.menu ? (
            <ClickMenu
              className="h-full min-w-0 flex-1"
              trigger={
                <button
                  type="button"
                  aria-label={labels.columnMenu(column.header)}
                  className={triggerClass}
                >
                  {content}
                  <ChevronDownIcon
                    aria-hidden
                    className="ml-0.5 size-3.5 shrink-0 text-muted-foreground opacity-0 group-hover/head:opacity-100"
                  />
                </button>
              }
            >
              {column.menu}
            </ClickMenu>
          ) : (
            <div className={triggerClass}>{content}</div>
          )}
        </div>
        {onColumnResize && (
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label={labels.resizeColumn(column.header)}
            aria-valuenow={column.width}
            tabIndex={0}
            onMouseDown={(e) => startResize(e, column)}
            onKeyDown={(e) => resizeByKey(e, column)}
            className="absolute top-0 right-0 h-full w-1.5 cursor-col-resize outline-none hover:bg-primary/35 focus-visible:bg-primary/35"
          />
        )}
      </TableHead>
    )
  }

  const renderRow = (row: TRow) => {
    const id = getRowId(row)
    const isSelected = selected.has(id)
    const label = rowLabel(row)
    return (
      <TableRow
        key={id}
        data-state={isSelected ? "selected" : undefined}
        onDragEnter={(e) => {
          if (onRowMove && e.dataTransfer.types.includes(ROW_TYPE))
            e.preventDefault()
        }}
        onDragOver={(e) => {
          if (onRowMove && e.dataTransfer.types.includes(ROW_TYPE))
            e.preventDefault()
        }}
        onDrop={(e) => {
          const from = e.dataTransfer.getData(ROW_TYPE)
          if (onRowMove && from && from !== id) {
            e.preventDefault()
            onRowMove(from, id)
          }
        }}
        className={cn(
          "group/row *:border-b",
          draggingRow === id && "opacity-40"
        )}
      >
        {columns.map((column, index) => {
          if (index > 0) {
            return (
              <TableCell
                key={column.id}
                className={cn("p-0", column.wrap && "whitespace-normal")}
              >
                {column.frame === false ? (
                  column.cell(row)
                ) : (
                  <DataTableCellFrame wrap={column.wrap} align={column.align} vAlign={layout === "fixed" ? "top" : "center"}>
                    {column.cell(row)}
                  </DataTableCellFrame>
                )}
              </TableCell>
            )
          }
          const handle = (rowMenu || onRowMove) && (
            <button
              type="button"
              aria-label={labels.rowHandle(label)}
              draggable={!!onRowMove}
              onDragStart={(e) => {
                if (!onRowMove) return
                e.dataTransfer.setData(ROW_TYPE, id)
                e.dataTransfer.effectAllowed = "move"
                setTimeout(() => setDraggingRow(id), 0)
              }}
              onDragEnd={() => setDraggingRow(null)}
              className={cn(
                "-ml-1 flex shrink-0 cursor-grab rounded-sm text-muted-foreground/70 opacity-0 outline-none group-hover/row:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring/50 [&_svg]:size-3.5",
                showHandleOnSelected && isSelected && "opacity-100"
              )}
            >
              <GripVerticalIcon aria-hidden />
            </button>
          )
          return (
            <TableCell
              key={column.id}
              className={cn("p-0", column.wrap && "whitespace-normal")}
            >
              <DataTableCellFrame wrap={column.wrap} vAlign={layout === "fixed" ? "top" : "center"} className="group/cell gap-2">
                {handle &&
                  (rowMenu ? (
                    <ClickMenu
                      trigger={handle}
                      className="shrink-0"
                      contentClassName="min-w-48"
                    >
                      {rowMenu(row)}
                    </ClickMenu>
                  ) : (
                    handle
                  ))}
                {selectable && (
                  <Checkbox
                    aria-label={labels.selectRow(label)}
                    checked={isSelected}
                    onCheckedChange={() => toggleRow(id)}
                    className={cn(
                      "opacity-0 group-hover/row:opacity-100 focus-visible:opacity-100",
                      isSelected && "opacity-100"
                    )}
                  />
                )}
                <div className="flex min-w-0 flex-1 items-center gap-1.5">
                  {column.cell(row)}
                </div>
                {onOpenRow && (
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={() => onOpenRow(row)}
                    className="ml-auto h-5 gap-1 rounded-sm px-1.5 text-[11px] font-normal text-muted-foreground opacity-0 shadow-none group-hover/cell:opacity-100 focus-visible:opacity-100"
                  >
                    <SquareArrowOutUpRightIcon data-icon="inline-start" />
                    {labels.openRow}
                  </Button>
                )}
              </DataTableCellFrame>
            </TableCell>
          )
        })}
        {addColumn && <TableCell className="p-0" />}
      </TableRow>
    )
  }

  const emptyRow = (
    <TableRow className="hover:bg-transparent *:border-b">
      <TableCell
        colSpan={span}
        className="h-24 px-4 text-left text-muted-foreground"
      >
        {labels.empty}
      </TableCell>
    </TableRow>
  )

  return (
    <div
      data-slot="data-table"
      className={cn(
        "flex min-h-0 flex-col overflow-hidden rounded-lg border bg-card text-card-foreground shadow-xs",
        className
      )}
      {...props}
    >
      {/* a rolagem é deste contêiner: dentro de um flex item sem altura fixa, o h-full do
          contêiner da tabela não resolvia e as linhas de baixo ficavam cortadas */}
      <div className="min-h-0 flex-1 overflow-auto">
        <Table
          containerClassName="overflow-visible"
          className={cn(
            "border-separate border-spacing-0",
            layout === "fixed" ? "w-full table-fixed" : "w-max min-w-full"
          )}
        >
          <colgroup>
            {columns.map((column) => (
              <col
                key={column.id}
                style={column.width ? { width: column.width } : undefined}
              />
            ))}
            {addColumn && <col style={{ width: addColumn.width ?? 160 }} />}
          </colgroup>
          <TableHeader className="[&_tr]:border-b-0">
            <TableRow className="hover:bg-transparent">
              {columns.map(renderHead)}
              {addColumn && (
                <TableHead
                  scope="col"
                  className="sticky top-0 z-10 h-11 border-b bg-background p-0"
                >
                  {addColumn.content == null ? (
                    <button
                      type="button"
                      onClick={addColumn.onClick}
                      className={ADD_COLUMN_CLASS}
                    >
                      <PlusIcon aria-hidden />
                      {labels.addColumn}
                    </button>
                  ) : (
                    <Popover
                      open={addColumn.open}
                      onOpenChange={addColumn.onOpenChange}
                    >
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          onClick={addColumn.onClick}
                          className={ADD_COLUMN_CLASS}
                        >
                          <PlusIcon aria-hidden />
                          {labels.addColumn}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        align="start"
                        className={cn("w-72 gap-1 p-1.5", addColumn.contentClassName)}
                      >
                        {addColumn.content}
                      </PopoverContent>
                    </Popover>
                  )}
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups
              ? allRows.length === 0
                ? emptyRow
                : groups.map((group) => (
                    <React.Fragment key={group.id}>
                      <TableRow className="hover:bg-transparent *:border-b">
                        <TableCell colSpan={span} className="p-0">
                          <button
                            type="button"
                            aria-expanded={!group.collapsed}
                            onClick={() => onToggleGroup?.(group.id)}
                            className="flex w-full items-center gap-2 px-4 pt-2.5 pb-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset"
                          >
                            <ChevronDownIcon
                              aria-hidden
                              className={cn(
                                "size-3.5 text-muted-foreground transition-transform",
                                group.collapsed && "-rotate-90"
                              )}
                            />
                            {group.label}
                            <span className="text-xs text-muted-foreground tabular-nums">
                              {group.rows.length}
                            </span>
                          </button>
                        </TableCell>
                      </TableRow>
                      {!group.collapsed && group.rows.map(renderRow)}
                    </React.Fragment>
                  ))
              : rows.length === 0
                ? emptyRow
                : rows.map(renderRow)}
          </TableBody>
          {hasFooter && (
            <TableFooter className="border-t-0 bg-transparent font-normal">
              <TableRow className="hover:bg-transparent">
                {columns.map((column) => (
                  <TableCell key={column.id} className="p-0">
                    {column.footer}
                  </TableCell>
                ))}
                {addColumn && <TableCell className="p-0" />}
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>
      {onAddRow && (
        <button
          type="button"
          onClick={onAddRow}
          className="flex w-full items-center gap-1.5 px-4 py-[11px] text-left text-sm text-muted-foreground outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset [&_svg]:size-4"
        >
          <PlusIcon aria-hidden />
          {labels.addRow}
        </button>
      )}
      {selectable && bulkActions && (
        <ActionBar open={selected.size > 0}>
          <ActionBarLabel>{labels.selected(selected.size)}</ActionBarLabel>
          <ActionBarSeparator />
          <ActionBarGroup>{bulkActions}</ActionBarGroup>
          <ActionBarSeparator />
          <ActionBarClose
            label={labels.clearSelection}
            onClick={() => onSelectedIdsChange?.([])}
          />
        </ActionBar>
      )}
    </div>
  )
}

export { DataTable, DataTableCellFrame }
export type {
  DataTableColumn,
  DataTableGroup,
  DataTableLabels,
  DataTableProps,
  DataTableSortDirection,
}
