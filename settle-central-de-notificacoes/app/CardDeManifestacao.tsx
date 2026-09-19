// Card de uma manifestação: tipo, data e um preview da mensagem (cortado por
// caracteres). Com resposta, fica no formato de e-mail: resposta em cima, mensagem
// embaixo, cada uma com sua data. Clicar abre a mensagem completa.

import { Fragment } from "react"

import { Badge } from "@/components/ui/badge"
import {
  NotificationsCenterItem,
  NotificationsCenterItemHeader,
  NotificationsCenterItemMessage,
  NotificationsCenterItemMeta,
  NotificationsCenterUnreadDot,
} from "@/components/ui/notifications-center"

import { AnexosDoCard } from "./Anexos"
import { CATEGORIAS, formatarDataHora, temAutor, truncar, type Manifestacao } from "./dados"

type Bloco = { data: Date; rotulo?: string; texto: string; autor?: string }

function blocosDoCard(item: Manifestacao): Bloco[] {
  if (item.etapas?.length) {
    // Recurso: última etapa (atualização) em cima, origem embaixo
    const primeira = item.etapas[0]
    const ultima = item.etapas[item.etapas.length - 1]
    return [
      { data: ultima.date, rotulo: `${ultima.etapa}:`, texto: ultima.texto },
      { data: primeira.date, rotulo: `${primeira.etapa}:`, texto: primeira.texto },
    ]
  }
  const texto = item.mensagemCompleta ?? item.mensagem ?? ""
  if (item.resposta) {
    return [
      { data: item.date, rotulo: "Resposta:", texto: item.resposta.texto },
      { data: item.dateMensagem, rotulo: "Mensagem:", texto },
    ]
  }
  return [{ data: item.date, texto, autor: temAutor(item.categoria) ? item.autor : undefined }]
}

export function CardDeManifestacao({
  item,
  novo,
  onAbrir,
  onVisualizarAnexo,
}: {
  item: Manifestacao
  novo: boolean
  onAbrir: () => void
  onVisualizarAnexo: (indice: number) => void
}) {
  const categoria = CATEGORIAS[item.categoria]

  return (
    <NotificationsCenterItem
      unread={novo}
      onOpen={onAbrir}
      aria-haspopup="dialog"
      aria-label={`${categoria.label}${novo ? " (novo)" : ""}: abrir mensagem completa`}
    >
      <NotificationsCenterItemHeader>
        {novo && <NotificationsCenterUnreadDot />}
        <Badge variant={categoria.cor} className="h-6 rounded-md px-2.5 text-[11.5px] font-semibold">
          {categoria.label}
        </Badge>
      </NotificationsCenterItemHeader>

      {blocosDoCard(item).map((bloco) => (
        <Fragment key={bloco.rotulo ?? "mensagem"}>
          <NotificationsCenterItemMeta>
            {bloco.autor && `${bloco.autor} · `}
            {formatarDataHora(bloco.data)}
          </NotificationsCenterItemMeta>
          <NotificationsCenterItemMessage>
            {bloco.rotulo && <strong className="font-bold">{bloco.rotulo}</strong>} {truncar(bloco.texto)}
          </NotificationsCenterItemMessage>
        </Fragment>
      ))}

      {!!item.anexos?.length && <AnexosDoCard anexos={item.anexos} onVisualizar={onVisualizarAnexo} />}
    </NotificationsCenterItem>
  )
}
