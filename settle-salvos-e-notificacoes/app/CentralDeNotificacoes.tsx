// Central de notificações (sino da navbar): todas as notificações das licitações com sino
// ligado, no padrão do Figma "Central de notificações": título com contador, busca, filtro,
// marcar todas como lidas e fechar; abas por categoria; estados de carregando, vazio e erro.

import { useEffect, useRef, useState } from "react"
import { CheckCheckIcon, ListFilterIcon, SearchIcon, SettingsIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

import { normalizar, type Licitacao, type Notificacao } from "./dados"
import { ListaDeNotificacoes, type EstadoDaLista } from "./ListaDeNotificacoes"

const ATRASO = 600 // ms: simula a busca das notificações

export function CentralDeNotificacoes({
  aberta,
  onAbertaChange,
  notificacoes,
  licitacoes,
  estado,
  filtroEdital,
  onLimparFiltro,
  onLida,
  onTodasLidas,
  onVerLicitacao,
}: {
  aberta: boolean
  onAbertaChange: (aberta: boolean) => void
  notificacoes: Notificacao[]
  licitacoes: Licitacao[]
  estado: EstadoDaLista
  /** Mostra só as de um edital (chip removível). */
  filtroEdital: string | null
  onLimparFiltro: () => void
  onLida: (id: string, lida: boolean) => void
  onTodasLidas: () => void
  onVerLicitacao: (n: Notificacao) => void
}) {
  const [carregando, setCarregando] = useState(false)
  const [buscando, setBuscando] = useState(false)
  const [busca, setBusca] = useState("")
  const [soNaoLidas, setSoNaoLidas] = useState(false)
  const [comResposta, setComResposta] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  function carregar() {
    window.clearTimeout(timer.current)
    setCarregando(true)
    timer.current = window.setTimeout(() => setCarregando(false), ATRASO)
  }

  useEffect(() => {
    if (aberta) carregar()
    else {
      setBuscando(false)
      setBusca("")
    }
    return () => window.clearTimeout(timer.current)
  }, [aberta])

  const q = normalizar(busca.trim())
  const lista = notificacoes.filter((n) => {
    if (filtroEdital && n.edital !== filtroEdital) return false
    if (soNaoLidas && n.lida) return false
    if (comResposta && !n.resposta) return false
    if (!q) return true
    const l = licitacoes.find((x) => x.edital === n.edital)
    return normalizar([n.edital, n.titulo, n.mensagem ?? "", l?.orgao ?? ""].join(" ")).includes(q)
  })
  const naoLidas = notificacoes.filter((n) => !n.lida && (!filtroEdital || n.edital === filtroEdital)).length
  const filtros = Number(soNaoLidas) + Number(comResposta)

  return (
    <Sheet open={aberta} onOpenChange={onAbertaChange}>
      <SheetContent side="right" size="md" className="gap-0" showCloseButton={false}>
        <div className="flex items-center gap-1 border-b py-2.5 pr-2 pl-4">
          <SheetTitle className="flex flex-1 items-center gap-2 text-base font-semibold">
            Notificações
            {naoLidas > 0 && (
              <span className="rounded-full bg-destructive px-1.5 text-xs leading-5 font-semibold text-white tabular-nums">
                {naoLidas}
                <span className="sr-only"> não lidas</span>
              </span>
            )}
          </SheetTitle>
          <SheetDescription className="sr-only">Notificações das licitações com o sino ativado</SheetDescription>

          <Acao dica="Buscar" ativo={buscando} onClick={() => setBuscando((b) => !b)}>
            <SearchIcon />
          </Acao>
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label="Filtrar" className="relative text-muted-foreground">
                    <ListFilterIcon />
                    {filtros > 0 && <span aria-hidden className="absolute top-1 right-1 size-1.5 rounded-full bg-primary" />}
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Filtrar</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Mostrar</DropdownMenuLabel>
              <DropdownMenuCheckboxItem checked={soNaoLidas} onCheckedChange={(v) => setSoNaoLidas(v === true)}>
                Só não lidas
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={comResposta} onCheckedChange={(v) => setComResposta(v === true)}>
                Com resposta
              </DropdownMenuCheckboxItem>
              {filtros > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={false}
                    onCheckedChange={() => {
                      setSoNaoLidas(false)
                      setComResposta(false)
                    }}
                  >
                    Limpar filtros
                  </DropdownMenuCheckboxItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Acao dica="Marcar todas como lidas" onClick={onTodasLidas} disabled={!naoLidas}>
            <CheckCheckIcon />
          </Acao>
          <Acao dica="Preferências de notificação" data-nao-prototipado>
            <SettingsIcon />
          </Acao>
          <SheetClose asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Fechar" className="text-muted-foreground">
              <XIcon />
            </Button>
          </SheetClose>
        </div>

        {(buscando || filtroEdital) && (
          <div className="flex flex-col gap-2 border-b px-3 py-2">
            {buscando && (
              <Input
                autoFocus
                aria-label="Buscar notificações"
                placeholder="Buscar por edital, órgão ou texto"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="h-8"
              />
            )}
            {filtroEdital && (
              <div className="flex items-center gap-2 text-[13px]">
                <span className="text-muted-foreground">Só o edital</span>
                <Badge variant="secondary" className="h-6 gap-1 pr-1">
                  {filtroEdital}
                  <button
                    type="button"
                    aria-label="Mostrar todas as licitações"
                    className="rounded-sm p-0.5 hover:bg-foreground/10"
                    onClick={onLimparFiltro}
                  >
                    <XIcon className="size-3" />
                  </button>
                </Badge>
              </div>
            )}
          </div>
        )}

        <ListaDeNotificacoes
          notificacoes={lista}
          licitacoes={licitacoes}
          carregando={carregando}
          estado={estado}
          vazio={
            q || filtros
              ? "Nenhuma notificação com esses filtros"
              : "Ative o sino de uma licitação para ser avisado aqui quando o edital mudar."
          }
          onTentarNovamente={carregar}
          onLida={onLida}
          onVerLicitacao={onVerLicitacao}
        />
      </SheetContent>
    </Sheet>
  )
}

function Acao({
  dica,
  ativo,
  className,
  children,
  ...props
}: React.ComponentProps<typeof Button> & { dica: string; ativo?: boolean }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={dica}
          aria-pressed={ativo}
          className={cn("text-muted-foreground aria-pressed:bg-muted aria-pressed:text-foreground", className)}
          {...props}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{dica}</TooltipContent>
    </Tooltip>
  )
}
