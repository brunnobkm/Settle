import * as React from "react"
import { ChevronDownIcon, ChevronsUpDownIcon, PanelLeftIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar"

// Casca da aplicação: sidebar recolhível (fechada só com ícones, aberta com rótulos)
// + barra superior fixa no topo + área de conteúdo. Todo o conteúdo vem por props.

/** Atributos data-* extras repassados ao link (ex.: data-nao-prototipado). */
type AppShellDataAttributes = {
  [key: `data-${string}`]: string | number | boolean | undefined
}

type AppShellIcon = React.ComponentType<{ className?: string }>

type AppShellSubItem = Omit<React.ComponentProps<"a">, "children"> &
  AppShellDataAttributes & {
    label: string
    href?: string
    active?: boolean
  }

type AppShellItem = Omit<React.ComponentProps<"a">, "children"> &
  AppShellDataAttributes & {
    label: string
    icon?: AppShellIcon
    href?: string
    active?: boolean
    /** Alerta (ex.: pendências). Com a sidebar fechada vira um ponto sobre o ícone. */
    badge?: React.ReactNode
    /** Contador neutro. Não aparece quando é 0. */
    count?: number
    /** Subitens: o item vira um grupo expansível. */
    items?: AppShellSubItem[]
    defaultOpen?: boolean
  }

type AppShellGroup = {
  label?: string
  items: AppShellItem[]
}

type AppShellWorkspace = {
  name: string
  description?: string
  /** Ícone mostrado num círculo com a cor da marca. */
  icon?: AppShellIcon
  /** Logo pronto; substitui o ícone. */
  logo?: React.ReactNode
}

type AppShellUser = {
  name: string
  email?: string
  initials?: string
  image?: string
}

type AppShellLabels = {
  expand?: string
  collapse?: string
  navigation?: string
}

type AppShellProps = Omit<React.ComponentProps<"div">, "children"> & {
  workspace?: AppShellWorkspace
  groups: AppShellGroup[]
  user?: AppShellUser
  /** Conteúdo da barra superior, à direita do botão de abrir/fechar a sidebar. */
  header?: React.ReactNode
  children?: React.ReactNode
  /** Sidebar começa aberta? (padrão: fechada, só ícones) */
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Esconde a barra superior ao rolar para baixo e mostra de novo ao rolar para cima. */
  hideHeaderOnScroll?: boolean
  labels?: AppShellLabels
}

const DEFAULT_LABELS: Required<AppShellLabels> = {
  expand: "Expandir sidebar",
  collapse: "Recolher sidebar",
  navigation: "Navegação principal",
}

const AppShellContext = React.createContext<{ headerHidden: boolean }>({
  headerHidden: false,
})

/**
 * Estado da casca para a página. Ex.: uma barra sticky que precisa subir junto
 * quando a barra superior se esconde. Também dá para usar só CSS:
 * `group-data-[header-hidden=true]/app-shell:-translate-y-16`.
 */
function useAppShell() {
  return React.useContext(AppShellContext)
}

function useHideOnScroll(enabled: boolean) {
  const [hidden, setHidden] = React.useState(false)

  React.useEffect(() => {
    if (!enabled) return
    // zona segura no topo e movimento mínimo para trocar de estado (evita tremor)
    const SAFE_ZONE = 80
    const DELTA = 8
    let lastY = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      if (y < SAFE_ZONE) {
        setHidden(false)
        lastY = y
      } else if (y - lastY > DELTA) {
        setHidden(true)
        lastY = y
      } else if (lastY - y > DELTA) {
        setHidden(false)
        lastY = y
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [enabled])

  return enabled && hidden
}

function AppShell({
  workspace,
  groups,
  user,
  header,
  children,
  defaultOpen = false,
  open,
  onOpenChange,
  hideHeaderOnScroll = false,
  labels,
  className,
  style,
  ...props
}: AppShellProps) {
  const headerHidden = useHideOnScroll(hideHeaderOnScroll)
  const text = { ...DEFAULT_LABELS, ...labels }
  const context = React.useMemo(() => ({ headerHidden }), [headerHidden])

  return (
    <AppShellContext.Provider value={context}>
      <SidebarProvider
        data-slot="app-shell"
        data-header-hidden={headerHidden}
        defaultOpen={defaultOpen}
        open={open}
        onOpenChange={onOpenChange}
        className={cn("group/app-shell", className)}
        style={
          {
            "--sidebar-width": "17.5rem",
            "--sidebar-width-icon": "3.25rem",
            ...style,
          } as React.CSSProperties
        }
        {...props}
      >
        <AppShellSidebar
          workspace={workspace}
          groups={groups}
          user={user}
          navigationLabel={text.navigation}
        />
        <div
          data-slot="app-shell-main"
          className="flex min-w-0 flex-1 flex-col"
        >
          <AppShellHeader
            hidden={headerHidden}
            expandLabel={text.expand}
            collapseLabel={text.collapse}
          >
            {header}
          </AppShellHeader>
          {/* isolate: o que a página empilhar (barras sticky, badges) fica sempre abaixo da barra superior */}
          <main data-slot="app-shell-content" className="isolate flex-1">
            {children}
          </main>
        </div>
      </SidebarProvider>
    </AppShellContext.Provider>
  )
}

function AppShellSidebar({
  workspace,
  groups,
  user,
  navigationLabel,
}: {
  workspace?: AppShellWorkspace
  groups: AppShellGroup[]
  user?: AppShellUser
  navigationLabel: string
}) {
  return (
    <Sidebar collapsible="icon">
      {workspace && (
        <SidebarHeader className="h-16 shrink-0 flex-row items-center gap-2 px-4 py-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          {workspace.logo ?? (
            <span
              aria-hidden
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
            >
              {workspace.icon && <workspace.icon className="size-4" />}
            </span>
          )}
          <div className="grid min-w-0 flex-1 leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-medium">
              {workspace.name}
            </span>
            {workspace.description && (
              <span className="truncate text-xs text-sidebar-foreground/80">
                {workspace.description}
              </span>
            )}
          </div>
          <ChevronsUpDownIcon
            aria-hidden
            className="size-4 shrink-0 text-muted-foreground group-data-[collapsible=icon]:hidden"
          />
        </SidebarHeader>
      )}

      <SidebarContent className="p-2 group-data-[collapsible=icon]:px-0">
        <nav aria-label={navigationLabel} className="flex flex-col">
          {groups.map((group, groupIndex) => (
            <SidebarGroup key={group.label ?? groupIndex}>
              {group.label && (
                <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <AppShellMenuItem key={item.label} item={item} />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </nav>
      </SidebarContent>

      {user && (
        <SidebarFooter className="flex-row items-center gap-2 px-2 py-4 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <Avatar>
            {user.image && <AvatarImage src={user.image} alt="" />}
            <AvatarFallback className="bg-foreground/10 text-foreground">
              {user.initials ?? user.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="grid min-w-0 flex-1 leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-medium">{user.name}</span>
            {user.email && (
              <span className="truncate text-xs font-light">{user.email}</span>
            )}
          </div>
          <ChevronsUpDownIcon
            aria-hidden
            className="size-4 shrink-0 text-muted-foreground group-data-[collapsible=icon]:hidden"
          />
        </SidebarFooter>
      )}
    </Sidebar>
  )
}

// Fechada: quadrado de 36px só com o ícone. Aberta: linha de 36px com rótulo.
const ITEM_CLASS =
  "h-9 group-data-[collapsible=icon]:size-9! group-data-[collapsible=icon]:p-2.5!"

function AppShellItemExtras({ badge, count }: { badge?: React.ReactNode; count?: number }) {
  return (
    <>
      {badge != null && (
        <span className="ml-auto shrink-0 rounded-md bg-destructive px-1.5 text-xs leading-4 font-medium text-background group-data-[collapsible=icon]:sr-only">
          {badge}
        </span>
      )}
      {!!count && (
        <span className="ml-auto shrink-0 rounded-full bg-sidebar-foreground/10 px-1.5 text-xs leading-4 font-medium tabular-nums group-data-[collapsible=icon]:sr-only">
          {count}
        </span>
      )}
    </>
  )
}

function AppShellBadgeDot({ show }: { show: boolean }) {
  if (!show) return null
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute top-0.75 left-5.75 hidden size-1.75 rounded-full bg-destructive ring-[1.5px] ring-sidebar group-data-[collapsible=icon]:block"
    />
  )
}

function AppShellMenuItem({ item }: { item: AppShellItem }) {
  const {
    label,
    icon: Icon,
    href,
    active,
    badge,
    count,
    items,
    defaultOpen,
    className,
    ...linkProps
  } = item
  const { state, isMobile, setOpen } = useSidebar()

  if (items?.length) {
    return (
      <Collapsible
        asChild
        defaultOpen={defaultOpen}
        className="group/app-shell-collapsible"
      >
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton
              tooltip={label}
              isActive={active}
              className={cn(ITEM_CLASS, className)}
              onClick={(event) => {
                // fechada: o primeiro clique só abre a sidebar
                if (state === "collapsed" && !isMobile) {
                  event.preventDefault()
                  setOpen(true)
                }
              }}
            >
              {Icon && <Icon />}
              <span className="flex-1 truncate">{label}</span>
              <AppShellItemExtras badge={badge} count={count} />
              <ChevronDownIcon
                aria-hidden
                className="text-muted-foreground transition-transform group-data-[collapsible=icon]:hidden group-data-[state=closed]/app-shell-collapsible:-rotate-90"
              />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <AppShellBadgeDot show={badge != null} />
          <CollapsibleContent>
            <SidebarMenuSub>
              {items.map(
                ({ label: subLabel, href: subHref, active: subActive, ...subProps }) => (
                  <SidebarMenuSubItem key={subLabel}>
                    <SidebarMenuSubButton
                      href={subHref ?? "#"}
                      isActive={subActive}
                      aria-current={subActive ? "page" : undefined}
                      className="h-9 px-4"
                      {...subProps}
                    >
                      <span>{subLabel}</span>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                )
              )}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    )
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        tooltip={label}
        isActive={active}
        className={cn(ITEM_CLASS, className)}
      >
        <a
          href={href ?? "#"}
          aria-current={active ? "page" : undefined}
          {...linkProps}
        >
          {Icon && <Icon />}
          <span className="flex-1 truncate">{label}</span>
          <AppShellItemExtras badge={badge} count={count} />
        </a>
      </SidebarMenuButton>
      <AppShellBadgeDot show={badge != null} />
    </SidebarMenuItem>
  )
}

function AppShellHeader({
  hidden,
  expandLabel,
  collapseLabel,
  children,
}: {
  hidden: boolean
  expandLabel: string
  collapseLabel: string
  children?: React.ReactNode
}) {
  const { open, openMobile, isMobile, toggleSidebar } = useSidebar()
  const expanded = isMobile ? openMobile : open

  return (
    <header
      data-slot="app-shell-header"
      data-hidden={hidden}
      className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-3 border-b bg-background px-6 transition-transform duration-250 ease-out data-[hidden=true]:-translate-y-full"
    >
      <Button
        variant="ghost"
        size="icon-sm"
        className="text-muted-foreground"
        aria-label={expanded ? collapseLabel : expandLabel}
        aria-expanded={expanded}
        onClick={toggleSidebar}
      >
        <PanelLeftIcon />
      </Button>
      <Separator
        orientation="vertical"
        className="data-vertical:h-5.5 data-vertical:self-center"
      />
      {children}
    </header>
  )
}

export {
  AppShell,
  useAppShell,
  type AppShellGroup,
  type AppShellItem,
  type AppShellLabels,
  type AppShellProps,
  type AppShellSubItem,
  type AppShellUser,
  type AppShellWorkspace,
}
