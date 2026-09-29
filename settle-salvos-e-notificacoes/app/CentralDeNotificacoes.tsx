// Central de notificações: painel lateral com as atualizações das licitações que o
// usuário salvou para acompanhar. Cada item mostra o que mudou (de → para), a leitura
// do impacto e leva à licitação em Salvos para depois.

import { BellOffIcon, CheckCheckIcon, FileTextIcon, SettingsIcon, SparklesIcon, XIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import {
  NotificationsCenter,
  NotificationsCenterItem,
  NotificationsCenterItemFooter,
  NotificationsCenterItemHeader,
  NotificationsCenterItemMessage,
  NotificationsCenterItemMeta,
  NotificationsCenterList,
  NotificationsCenterUnreadDot,
} from "@/components/ui/notifications-center"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"

import { ROTULO_CURTO, type Licitacao, type Notificacao } from "./dados"

export type AbaDaCentral = "nao-lidas" | "todas"

export function CentralDeNotificacoes({
  aberta,
  onAbertaChange,
  notificacoes,
  licitacoes,
  aba,
  onAba,
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
  aba: AbaDaCentral
  onAba: (aba: AbaDaCentral) => void
  /** Aberta a partir de um card: mostra só as daquele edital. */
  filtroEdital: string | null
  onLimparFiltro: () => void
  onLida: (id: string, lida: boolean) => void
  onTodasLidas: () => void
  onVerLicitacao: (n: Notificacao) => void
}) {
  const doEscopo = notificacoes.filter((n) => !filtroEdital || n.edital === filtroEdital)
  const naoLidas = doEscopo.filter((n) => !n.lida)
  const lista = aba === "nao-lidas" ? naoLidas : doEscopo
  const acompanhando = licitacoes.filter((l) => l.salvo && l.alertas.length).length

  return (
    <Sheet open={aberta} onOpenChange={onAbertaChange}>
      <SheetContent side="right" size="md" className="gap-0">
        <SheetHeader className="border-b pr-12">
          <SheetTitle className="text-base font-semibold">Notificações</SheetTitle>
          <SheetDescription>
            Atualizações de {acompanhando} {acompanhando === 1 ? "licitação acompanhada" : "licitações acompanhadas"}
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          <div className="mb-2 flex min-h-8 items-center gap-2 px-1 text-[13px]">
            {filtroEdital && (
              <>
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
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              disabled={!naoLidas.length}
              onClick={onTodasLidas}
              className="ml-auto text-muted-foreground"
            >
              <CheckCheckIcon data-icon="inline-start" />
              Marcar todas como lidas
            </Button>
          </div>

          <NotificationsCenter
            className="border-0 p-0"
            tabsLabel="Filtrar notificações"
            value={aba}
            onValueChange={(v) => onAba(v as AbaDaCentral)}
            tabs={[
              { value: "nao-lidas", label: "Não lidas", count: naoLidas.length },
              { value: "todas", label: "Todas", count: doEscopo.length },
            ]}
            actions={
              <Button variant="ghost" size="icon-sm" aria-label="Preferências de notificação" data-nao-prototipado>
                <SettingsIcon />
              </Button>
            }
          >
            <NotificationsCenterList
              empty={
                <Empty className="border border-dashed px-4 py-12">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <BellOffIcon />
                    </EmptyMedia>
                    <EmptyTitle className="text-[15px] font-semibold">
                      {aba === "nao-lidas" ? "Tudo lido por aqui" : "Nenhuma atualização ainda"}
                    </EmptyTitle>
                    <EmptyDescription>
                      {acompanhando
                        ? "Quando o portal publicar mudanças nas licitações que você acompanha, elas aparecem aqui."
                        : "Salve uma licitação escolhendo “Guardar e receber atualizações” para ser avisado aqui."}
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              }
            >
              {lista.map((n) => (
                <ItemDeNotificacao
                  key={n.id}
                  notificacao={n}
                  licitacao={licitacoes.find((l) => l.edital === n.edital)}
                  onLida={(lida) => onLida(n.id, lida)}
                  onVer={() => onVerLicitacao(n)}
                />
              ))}
            </NotificationsCenterList>
          </NotificationsCenter>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function ItemDeNotificacao({
  notificacao: n,
  licitacao,
  onLida,
  onVer,
}: {
  notificacao: Notificacao
  licitacao?: Licitacao
  onLida: (lida: boolean) => void
  onVer: () => void
}) {
  const importante = n.tipo === "retificacao" || n.tipo === "status"
  return (
    <NotificationsCenterItem unread={!n.lida} className="p-3">
      <NotificationsCenterItemHeader className="mb-1.5">
        {!n.lida && <NotificationsCenterUnreadDot label="Não lida" />}
        <Badge variant={importante ? "warning" : "secondary"} className="h-5.5 rounded-md">
          {ROTULO_CURTO[n.tipo]}
        </Badge>
        <span className="text-[13px] font-semibold">Edital {n.edital}</span>
        <span className="ml-auto text-xs text-muted-foreground tabular-nums">{n.quando}</span>
      </NotificationsCenterItemHeader>
      {licitacao && <NotificationsCenterItemMeta className="truncate">{licitacao.orgao}</NotificationsCenterItemMeta>}

      <NotificationsCenterItemMessage className="mt-1 font-medium">{n.titulo}</NotificationsCenterItemMessage>

      {n.mudanca && (
        <div className="mt-2 rounded-md bg-muted/60 px-2.5 py-2 text-[13px]">
          <p className="mb-1 text-xs font-medium text-muted-foreground">{n.mudanca.campo}</p>
          <dl className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5">
            <dt className="text-muted-foreground">Antes</dt>
            <dd className="text-muted-foreground line-through">{n.mudanca.de}</dd>
            <dt className="text-muted-foreground">Agora</dt>
            <dd className="font-medium">{n.mudanca.para}</dd>
          </dl>
        </div>
      )}

      {n.impacto && (
        <p className="mt-2 flex gap-1.5 text-[13px] text-muted-foreground">
          <SparklesIcon aria-hidden className="mt-0.5 size-3.5 shrink-0 text-primary" />
          <span>
            <span className="sr-only">Leitura da IA: </span>
            {n.impacto}
          </span>
        </p>
      )}

      {n.documento && (
        <p className="mt-2 flex items-center gap-1.5 text-[13px]">
          <FileTextIcon aria-hidden className="size-3.5 text-muted-foreground" />
          <a href="#" data-nao-prototipado className="truncate font-medium text-primary hover:underline">
            {n.documento}
          </a>
        </p>
      )}

      <NotificationsCenterItemFooter className="mx-0 flex items-center gap-2">
        <Button size="sm" variant="outline" className="shadow-none" onClick={onVer}>
          Ver licitação
        </Button>
        <Button size="sm" variant="ghost" className="ml-auto text-muted-foreground" onClick={() => onLida(!n.lida)}>
          {n.lida ? "Marcar como não lida" : "Marcar como lida"}
        </Button>
      </NotificationsCenterItemFooter>
    </NotificationsCenterItem>
  )
}
