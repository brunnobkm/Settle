import * as React from "react"
import { LinkIcon } from "lucide-react"

import { cn } from "@/lib/utils"

// Lista de trechos (citações) que sustentam uma informação: de onde ela veio
// (documento e item), o trecho em si e qual é o principal. Uma informação pode ter
// vários trechos (1:N). Cabeçalho com título, contagem e ação opcional de vincular.
// Todo o texto vem por props.

type CitationListItem = {
  id: string
  /** Onde o trecho está (ex.: documento e item). */
  location: React.ReactNode
  /** O trecho citado. */
  excerpt: React.ReactNode
  /** Marca o trecho principal (mostra o selo primaryLabel). */
  primary?: boolean
}

type CitationListProps = Omit<React.ComponentProps<"div">, "title"> & {
  title: React.ReactNode
  items: CitationListItem[]
  /** Selo do trecho principal. Padrão: "Principal". */
  primaryLabel?: string
  /** Texto do botão de cada trecho. Padrão: "Ver". */
  viewLabel?: string
  /** Sem ele, os trechos não têm botão. */
  onView?: (item: CitationListItem) => void
  /** Texto da ação do cabeçalho. Padrão: "+ Vincular trecho". */
  addLabel?: string
  /** Sem ele, a ação do cabeçalho não aparece. */
  onAdd?: () => void
  /** Ícone de cada trecho. Padrão: link. */
  icon?: React.ReactNode
}

function CitationList({
  title,
  items,
  primaryLabel = "Principal",
  viewLabel = "Ver",
  onView,
  addLabel = "+ Vincular trecho",
  onAdd,
  icon,
  className,
  ...props
}: CitationListProps) {
  const titleId = React.useId()

  return (
    <div data-slot="citation-list" className={cn("grid gap-1.5", className)} {...props}>
      <div data-slot="citation-list-header" className="flex items-center gap-2">
        <span id={titleId} className="text-xs font-semibold text-foreground/80">
          {title}
        </span>
        <span
          data-slot="citation-list-count"
          className="rounded-full bg-primary/10 px-1.75 py-px text-[11px] font-semibold text-primary tabular-nums"
        >
          {items.length}
        </span>
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            className="ml-auto rounded-sm text-xs text-primary underline underline-offset-2 outline-none hover:text-primary/80 focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {addLabel}
          </button>
        )}
      </div>
      <ul
        aria-labelledby={titleId}
        className="divide-y overflow-hidden rounded-lg border bg-background"
      >
        {items.map((item) => (
          <li
            key={item.id}
            data-slot="citation-list-item"
            data-primary={item.primary || undefined}
            className="grid grid-cols-[16px_minmax(0,1fr)_auto] items-start gap-2 px-2.5 py-2"
          >
            <span aria-hidden className="mt-px inline-flex text-primary [&_svg]:size-3.5">
              {icon ?? <LinkIcon />}
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-semibold text-foreground/80">
                {item.location}
                {item.primary && (
                  <span className="ml-1.5 rounded-full bg-primary/10 px-1.5 text-[10px] font-semibold text-primary">
                    {primaryLabel}
                  </span>
                )}
              </span>
              <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                {item.excerpt}
              </span>
            </span>
            {onView && (
              <button
                type="button"
                onClick={() => onView(item)}
                className="self-center rounded-sm text-xs whitespace-nowrap text-primary outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {viewLabel}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export { CitationList, type CitationListItem, type CitationListProps }
