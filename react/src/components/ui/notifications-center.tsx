import * as React from "react"

import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Central de notificações: painel com abas por categoria (com contagem) e uma
// lista de itens em cards. Os dados vêm por props; o conteúdo de cada item é
// composto pela tela (selos, datas, mensagem, anexos).
//
// <NotificationsCenter tabs={[{ value: "todas", label: "Todas", count: 6 }]} value={aba} onValueChange={setAba}>
//   <NotificationsCenterList loading={carregando} empty={<Empty />}>
//     <NotificationsCenterItem unread onOpen={() => abrir(id)}>
//       <NotificationsCenterItemHeader>
//         <NotificationsCenterUnreadDot />
//         <Badge>Aviso</Badge>
//       </NotificationsCenterItemHeader>
//       <NotificationsCenterItemMeta>18/09/2026 às 14:30</NotificationsCenterItemMeta>
//       <NotificationsCenterItemMessage>Texto…</NotificationsCenterItemMessage>
//       <NotificationsCenterItemFooter>anexos</NotificationsCenterItemFooter>
//     </NotificationsCenterItem>
//   </NotificationsCenterList>
// </NotificationsCenter>

type NotificationsCenterTab = {
  value: string
  label: React.ReactNode
  /** Contagem ao lado do rótulo. null mostra "–" (ainda carregando); undefined esconde. */
  count?: number | null
}

/** Abas no estilo "segmented control". Exportado para outras barras de abas da mesma tela. */
const notificationsCenterTabsListClassName =
  "h-auto max-w-full justify-start gap-0.5 overflow-x-auto rounded-[10px] bg-foreground/8 p-0.75 [scrollbar-width:none]"
const notificationsCenterTabClassName =
  "h-auto flex-none rounded-lg px-3 py-1 text-[15px] leading-6 data-active:shadow-xs"

function NotificationsCenterCount({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="notifications-center-count"
      className={cn(
        "inline-flex min-w-4.5 items-center justify-center rounded-md bg-foreground/10 px-1.5 text-xs leading-4 font-medium text-foreground tabular-nums",
        className
      )}
      {...props}
    />
  )
}

function NotificationsCenter({
  tabs,
  value,
  defaultValue,
  onValueChange,
  tabsLabel = "Categorias",
  actions,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"section">, "defaultValue" | "onChange"> & {
  tabs: NotificationsCenterTab[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Nome acessível da lista de abas. */
  tabsLabel?: string
  /** Ações à direita das abas (ordenar, filtrar, buscar). */
  actions?: React.ReactNode
}) {
  const [interno, setInterno] = React.useState(defaultValue ?? tabs[0]?.value ?? "")
  const atual = value ?? interno

  function mudar(proximo: string) {
    if (value === undefined) setInterno(proximo)
    onValueChange?.(proximo)
  }

  return (
    <section
      data-slot="notifications-center"
      className={cn("rounded-2xl border bg-card p-2 text-card-foreground", className)}
      {...props}
    >
      <Tabs value={atual} onValueChange={mudar} className="gap-0">
        <div data-slot="notifications-center-toolbar" className="mb-2 flex items-center justify-between gap-2">
          <TabsList aria-label={tabsLabel} className={notificationsCenterTabsListClassName}>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className={notificationsCenterTabClassName}>
                {tab.label}
                {tab.count !== undefined && <NotificationsCenterCount>{tab.count ?? "–"}</NotificationsCenterCount>}
              </TabsTrigger>
            ))}
          </TabsList>
          {actions}
        </div>
        <TabsContent value={atual}>{children}</TabsContent>
      </Tabs>
    </section>
  )
}

/** Lista de itens, com estado de carregando (esqueletos) e vazio. */
function NotificationsCenterList({
  loading = false,
  skeletonCount = 3,
  loadingLabel = "Carregando",
  empty,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  loading?: boolean
  skeletonCount?: number
  /** Nome acessível do estado de carregando. */
  loadingLabel?: string
  /** Mostrado quando não há itens. */
  empty?: React.ReactNode
}) {
  if (loading) {
    return (
      <div
        data-slot="notifications-center-list"
        aria-busy
        aria-label={loadingLabel}
        className={cn("flex flex-col gap-2", className)}
        {...props}
      >
        {Array.from({ length: skeletonCount }, (_, i) => (
          <div key={i} aria-hidden className="flex flex-col gap-2 rounded-[14px] border bg-card p-2 shadow-sm">
            <Skeleton className="h-6 w-24 rounded-md" />
            <Skeleton className="h-3.5 w-36" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[72%]" />
          </div>
        ))}
      </div>
    )
  }

  if (React.Children.count(children) === 0 && empty) return <>{empty}</>

  return (
    <div data-slot="notifications-center-list" className={cn("flex flex-col gap-2", className)} {...props}>
      {children}
    </div>
  )
}

/**
 * Item (card). Com onOpen, o card inteiro abre o detalhe (clique, Enter ou espaço),
 * sem atrapalhar quem está selecionando texto dentro dele.
 */
function NotificationsCenterItem({
  unread = false,
  onOpen,
  className,
  onMouseDown,
  onClick,
  onKeyDown,
  ...props
}: React.ComponentProps<"article"> & {
  unread?: boolean
  onOpen?: () => void
}) {
  const inicio = React.useRef({ x: 0, y: 0 })
  const abre = !!onOpen

  return (
    <article
      data-slot="notifications-center-item"
      data-unread={unread || undefined}
      tabIndex={abre ? 0 : undefined}
      className={cn(
        "rounded-[14px] border bg-card p-2 text-sm text-card-foreground shadow-sm transition-[transform,box-shadow] duration-200 ease-out",
        abre &&
          "cursor-pointer hover:scale-[1.005] hover:shadow-xl focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        className
      )}
      onMouseDown={(e) => {
        inicio.current = { x: e.clientX, y: e.clientY }
        onMouseDown?.(e)
      }}
      onClick={(e) => {
        onClick?.(e)
        if (!onOpen || e.defaultPrevented) return
        // arrastou (selecionando texto) ou há texto selecionado: não abre
        const arrastou = Math.abs(e.clientX - inicio.current.x) > 4 || Math.abs(e.clientY - inicio.current.y) > 4
        const selecionou = String(window.getSelection() ?? "").length > 0
        if (arrastou || selecionou) return
        onOpen()
      }}
      onKeyDown={(e) => {
        onKeyDown?.(e)
        if (!onOpen || e.target !== e.currentTarget) return
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onOpen()
        }
      }}
      {...props}
    />
  )
}

function NotificationsCenterItemHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="notifications-center-item-header"
      className={cn("mb-2 flex flex-wrap items-center gap-2", className)}
      {...props}
    />
  )
}

/** Bolinha de "novo". Leva texto para leitor de tela: o estado não fica só na cor. */
function NotificationsCenterUnreadDot({
  label = "Novo",
  className,
  ...props
}: React.ComponentProps<"span"> & { label?: string }) {
  return (
    <span
      data-slot="notifications-center-unread-dot"
      title={label}
      className={cn("size-2.5 shrink-0 rounded-full bg-destructive", className)}
      {...props}
    >
      <span className="sr-only">{label}</span>
    </span>
  )
}

function NotificationsCenterItemMeta({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="notifications-center-item-meta"
      className={cn(
        "mb-1 text-[12.5px] text-muted-foreground [[data-slot=notifications-center-item-message]+&]:mt-3.5",
        className
      )}
      {...props}
    />
  )
}

function NotificationsCenterItemMessage({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="notifications-center-item-message"
      className={cn("mt-2 text-sm leading-[1.6] text-foreground", className)}
      {...props}
    />
  )
}

/** Rodapé separado por uma linha (anexos, ações). */
function NotificationsCenterItemFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="notifications-center-item-footer"
      className={cn("mx-1 mt-2.5 border-t pt-2.5", className)}
      {...props}
    />
  )
}

export {
  NotificationsCenter,
  NotificationsCenterCount,
  NotificationsCenterItem,
  NotificationsCenterItemFooter,
  NotificationsCenterItemHeader,
  NotificationsCenterItemMessage,
  NotificationsCenterItemMeta,
  NotificationsCenterList,
  NotificationsCenterUnreadDot,
  notificationsCenterTabClassName,
  notificationsCenterTabsListClassName,
  type NotificationsCenterTab,
}
