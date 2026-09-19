import * as React from "react"

import { cn } from "@/lib/utils"

// Linha do tempo vertical: marcador em cada etapa, ligado ao próximo por uma
// linha. Uma etapa pode ser destacada (highlighted): o marcador fica preenchido
// na cor primária e o conteúdo ganha um fundo sutil. Use junto de um texto
// (ex.: uma tag) quando o destaque carregar significado: o estado não fica só na cor.
//
// <Timeline>
//   <TimelineItem highlighted>
//     <TimelineTitle>Contrarrazões</TimelineTitle>
//     <TimelineMeta>Licitante · Há 2 dias</TimelineMeta>
//     <TimelineDescription>Texto…</TimelineDescription>
//   </TimelineItem>
// </Timeline>

function Timeline({ className, ...props }: React.ComponentProps<"ol">) {
  return <ol data-slot="timeline" className={cn("relative flex flex-col", className)} {...props} />
}

function TimelineItem({
  highlighted = false,
  className,
  children,
  ...props
}: React.ComponentProps<"li"> & { highlighted?: boolean }) {
  return (
    <li
      data-slot="timeline-item"
      data-highlighted={highlighted || undefined}
      className={cn(
        "group/timeline-item relative flex gap-4 pb-5.5 pl-1 last:pb-1",
        // linha ligando ao próximo marcador
        "before:absolute before:top-4.5 before:-bottom-1 before:left-2.25 before:w-0.5 before:bg-border last:before:hidden",
        className
      )}
      {...props}
    >
      <span
        aria-hidden
        data-slot="timeline-marker"
        className="relative mt-0.5 size-4 shrink-0 rounded-full border-2 border-muted-foreground/60 bg-background group-data-highlighted/timeline-item:border-primary group-data-highlighted/timeline-item:bg-primary"
      />
      <div
        data-slot="timeline-content"
        className="min-w-0 flex-1 pb-0.5 group-data-highlighted/timeline-item:-ml-0.5 group-data-highlighted/timeline-item:rounded-[10px] group-data-highlighted/timeline-item:border group-data-highlighted/timeline-item:border-primary/15 group-data-highlighted/timeline-item:bg-primary/5 group-data-highlighted/timeline-item:px-3 group-data-highlighted/timeline-item:py-2.5"
      >
        {children}
      </div>
    </li>
  )
}

function TimelineTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="timeline-title"
      className={cn("flex flex-wrap items-center gap-2 text-sm font-semibold text-foreground", className)}
      {...props}
    />
  )
}

function TimelineMeta({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="timeline-meta"
      className={cn("mt-0.75 mb-1.75 text-[12.5px] text-muted-foreground", className)}
      {...props}
    />
  )
}

function TimelineDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="timeline-description"
      className={cn("text-[13.5px] leading-[1.6] whitespace-pre-wrap text-foreground/80", className)}
      {...props}
    />
  )
}

export { Timeline, TimelineDescription, TimelineItem, TimelineMeta, TimelineTitle }
