// Histórico de divergências (ícone de alerta no cabeçalho): pendentes primeiro, depois
// as resolvidas nesta sessão e o histórico de exemplo, até 7 itens.

import { CircleAlertIcon, CircleCheckIcon, CircleXIcon, TriangleAlertIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

import { HISTORICO_DE_EXEMPLO, SECOES, type ItemDeHistorico } from "./dados"
import type { Painel } from "./painel"

function itensDoHistorico(painel: Painel): ItemDeHistorico[] {
  const { divergencias } = painel.estado
  const todas = SECOES.flatMap((s) => s.divergencias)
  const pendentes = todas
    .filter((d) => !divergencias[d.id].resolvida && d.opcoes.length)
    .map((d): ItemDeHistorico => ({ rotulo: d.rotulo, status: "pendente", opcoes: d.opcoes.map((o) => o.texto) }))
  const resolvidas = todas
    .filter((d) => divergencias[d.id].resolvida)
    .map((d): ItemDeHistorico => {
      const r = divergencias[d.id].resolvida!
      return { rotulo: d.rotulo, status: "resolvida", tipo: r.tipo, escolha: r.escolha, opcoes: d.opcoes.map((o) => o.texto) }
    })
  return [...pendentes, ...resolvidas, ...HISTORICO_DE_EXEMPLO].slice(0, 7)
}

function ItemHistorico({ item }: { item: ItemDeHistorico }) {
  const resolvida = item.status === "resolvida"
  const escolha = item.escolha ?? ""
  const opcoes = resolvida && !item.opcoes.includes(escolha) ? [escolha, ...item.opcoes] : item.opcoes
  const ajuda = item.tipo === "manual" ? "Informação adicionada" : "Opção escolhida"

  return (
    <article className="border-b px-3.5 py-3 last:border-b-0">
      <div className="flex items-center justify-between gap-2">
        <strong className="text-[13px] font-semibold">{item.rotulo}</strong>
        <Badge variant={resolvida ? "success" : "warning"} className="text-[11px] font-semibold">
          {resolvida ? "Resolvida" : "Pendente"}
        </Badge>
      </div>
      <ul aria-label={ajuda} className="mt-2.5 grid divide-y overflow-hidden rounded-lg border bg-background">
        {opcoes.map((opcao, i) => {
          const escolhida = resolvida && opcao === escolha
          const Icone = escolhida ? CircleCheckIcon : resolvida ? CircleXIcon : CircleAlertIcon
          return (
            <li key={i} className="grid grid-cols-[18px_minmax(0,1fr)] items-start gap-2.25 p-2.5">
              <Icone
                aria-hidden
                className={cn(
                  "size-4.5",
                  escolhida ? "text-success" : resolvida ? "text-muted-foreground" : "text-warning"
                )}
              />
              <div>
                <span className="block text-[11px] leading-tight font-semibold text-muted-foreground">
                  {resolvida ? (escolhida ? ajuda : "Opção descartada") : "Opção aguardando revisão"}
                </span>
                <p
                  className={cn(
                    "mt-1 text-xs leading-snug text-muted-foreground",
                    escolhida && "font-semibold text-foreground/80"
                  )}
                >
                  {opcao}
                </p>
              </div>
            </li>
          )
        })}
      </ul>
    </article>
  )
}

export function Historico({ painel }: { painel: Painel }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Ver histórico de divergências" title="Ver histórico de divergências">
          <TriangleAlertIcon aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="max-h-[min(520px,calc(100dvh-92px))] w-[min(360px,calc(100vw-32px))] gap-0 overflow-y-auto p-0"
      >
        <div className="border-b px-3.5 py-3 text-[13px] font-bold">Histórico de divergências</div>
        {itensDoHistorico(painel).map((item, i) => (
          <ItemHistorico key={i} item={item} />
        ))}
      </PopoverContent>
    </Popover>
  )
}
