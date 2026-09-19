// Card de uma manifestação: tipo e status, data de atualização, blocos de
// mensagem/resposta (preview cortado) e anexos. Clicar abre a mensagem completa,
// sem atrapalhar a seleção de texto.

import { useRef } from "react"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

import { AnexosDoCard } from "./Anexos"
import { CATEGORIAS, formatarDataHora, truncar, type Manifestacao } from "./dados"

/** Selo do tipo (Aviso, Questionamento, Impugnação, Recurso). */
export function SeloDeCategoria({ item }: { item: Pick<Manifestacao, "categoria"> }) {
  return (
    <Badge variant="secondary" className="h-6 rounded-md bg-foreground/8 px-2.5 text-[11.5px] font-semibold">
      {CATEGORIAS[item.categoria].label}
    </Badge>
  )
}

/** Status de questionamento e impugnação: Respondido ou Aguardando resposta. */
export function SeloDeStatus({ item }: { item: Manifestacao }) {
  if (item.categoria !== "esclarecimento" && item.categoria !== "impugnacao") return null
  return item.resposta ? (
    <Badge variant="success" className="h-6 rounded-md px-2.5 text-[11.5px] font-semibold">
      Respondido
    </Badge>
  ) : (
    <Badge variant="warning" className="h-6 rounded-md px-2.5 text-[11.5px] font-semibold">
      Aguardando resposta
    </Badge>
  )
}

/** Blocos do card (origem primeiro), cada um com sua data. */
function blocosDoCard(item: Manifestacao) {
  if (item.etapas?.length) {
    const primeira = item.etapas[0]
    const ultima = item.etapas[item.etapas.length - 1]
    return [
      { data: primeira.date, rotulo: `${primeira.etapa}:`, texto: primeira.texto },
      { data: ultima.date, rotulo: `${ultima.etapa}:`, texto: ultima.texto },
    ]
  }
  const mensagem = { data: item.dateMensagem, rotulo: "Mensagem:", texto: item.mensagemCompleta ?? item.mensagem }
  return item.resposta ? [mensagem, { data: item.date, rotulo: "Resposta:", texto: item.resposta.texto }] : [mensagem]
}

export function CardDeManifestacao({
  item,
  onAbrir,
  onVisualizarAnexo,
}: {
  item: Manifestacao
  onAbrir: () => void
  onVisualizarAnexo: (indice: number) => void
}) {
  const inicio = useRef({ x: 0, y: 0 })

  return (
    <Card
      tabIndex={0}
      aria-haspopup="dialog"
      aria-label={`${CATEGORIAS[item.categoria].label}: abrir mensagem completa`}
      className="cursor-pointer gap-0 rounded-[14px] px-3 shadow-sm ring-border transition-[transform,box-shadow] duration-200 ease-out [--card-spacing:--spacing(3)] hover:scale-[1.005] hover:shadow-xl focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      onMouseDown={(e) => {
        inicio.current = { x: e.clientX, y: e.clientY }
      }}
      onClick={(e) => {
        // arrastou (selecionando texto) ou há texto selecionado: não abre
        const arrastou = Math.abs(e.clientX - inicio.current.x) > 4 || Math.abs(e.clientY - inicio.current.y) > 4
        const selecionou = String(window.getSelection() ?? "").length > 0
        if (arrastou || selecionou) return
        onAbrir()
      }}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onAbrir()
        }
      }}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <SeloDeCategoria item={item} />
        <SeloDeStatus item={item} />
      </div>

      {/* data da última atualização da thread: a lista ordena por ela */}
      <p className="text-sm leading-5 text-muted-foreground">
        <span className="text-foreground">Atualizado</span> em{" "}
        <span className="text-foreground">{formatarDataHora(item.dateAtualizacao)}</span>
      </p>

      {blocosDoCard(item).map((bloco) => (
        <div key={bloco.rotulo} className="mt-3 border-t pt-3">
          <p className="mb-1 text-sm leading-5 text-foreground">{formatarDataHora(bloco.data)}</p>
          <p className="text-sm leading-[1.55] whitespace-pre-wrap text-foreground">
            <strong className="font-bold">{bloco.rotulo}</strong> {truncar(bloco.texto)}
          </p>
        </div>
      ))}

      {!!item.anexos?.length && <AnexosDoCard anexos={item.anexos} onVisualizar={onVisualizarAnexo} />}
    </Card>
  )
}
