// Recomendadas: o card de produção (LicitacaoCard) mostrando a atualização no próprio card,
// e não só o aviso de que atualizou. Pedido da Alice (01/10) com três cenários:
// chegou um documento novo, mudou a data, mudou o status.
//
// A atualização aparece em três camadas, todas enquanto ela for "nova" (mesma regra do selo:
// some ao abrir a licitação ou depois de 7 dias):
// 1. Selo "Atualizada" no topo: o clique abre "O que mudou" (antes → agora e o que pode impactar).
// 2. Faixa de novidades logo abaixo do topo: uma linha por mudança, sem precisar abrir nada.
// 3. O próprio campo que mudou fica marcado: a data antiga riscada ao lado da nova, o status
//    novo com o anterior, e o ícone de arquivos com "+1".

import { useState } from "react"
import {
  ArrowRightIcon,
  BookmarkIcon,
  CalendarClockIcon,
  CircleDotIcon,
  ClockIcon,
  FilePlus2Icon,
  FolderIcon,
  LinkIcon,
  RefreshCwIcon,
  Share2Icon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LicitacaoCard, LicitacaoCardStatusButton } from "@/components/ui/licitacao-card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

import { ATUALIZACOES, dataCurta, quandoRelativo, type Atualizacao } from "./atualizacoes"
import { categoriaDoSegmento, formatarData, formatarMoeda, statusPorId, type Licitacao } from "./dados"
import { useNovas } from "./Selo"

export function VistaRecomendadas({ licitacoes, onAbrir }: { licitacoes: Licitacao[]; onAbrir: (l: Licitacao) => void }) {
  return (
    <div className="mx-auto grid w-full max-w-347 gap-4 px-6 pt-4 pb-16">
      <h1 className="text-lg font-semibold">Recomendadas</h1>
      {licitacoes.map((l) => (
        <CardRecomendada key={l.id} l={l} onAbrir={() => onAbrir(l)} />
      ))}
    </div>
  )
}

const ICONE_DO_TIPO = {
  arquivo: FilePlus2Icon,
  data: CalendarClockIcon,
  status: CircleDotIcon,
  manifestacao: RefreshCwIcon,
} as const

/** Uma linha curta por mudança: "Envio da proposta: 27/05 → 10/06". */
function LinhaDaMudanca({ a }: { a: Atualizacao }) {
  const Icone = ICONE_DO_TIPO[a.tipo]
  return (
    <span className="flex min-w-0 items-center gap-1.5">
      <Icone aria-hidden className="size-3.5 shrink-0" />
      {a.tipo === "data" && a.antes && a.depois ? (
        <span className="min-w-0 truncate">
          Envio da proposta: <span className="line-through opacity-70">{dataCurta(a.antes)}</span>{" "}
          <ArrowRightIcon aria-label="passou para" className="inline size-3" />{" "}
          <span className="font-semibold">{dataCurta(a.depois)}</span>
        </span>
      ) : a.tipo === "status" && a.antes && a.depois ? (
        <span className="min-w-0 truncate">
          Status: <span className="line-through opacity-70">{a.antes}</span>{" "}
          <ArrowRightIcon aria-label="passou para" className="inline size-3" />{" "}
          <span className="font-semibold">{a.depois}</span>
        </span>
      ) : (
        <span className="min-w-0 truncate">
          {a.titulo.replace(/:.*/, "")}:{" "}
          <a href="#" data-nao-prototipado className="font-semibold underline-offset-2 hover:underline">
            {a.titulo.split(": ")[1] ?? a.titulo}
          </a>
        </span>
      )}
    </span>
  )
}

function CardRecomendada({ l, onAbrir }: { l: Licitacao; onAbrir: () => void }) {
  const novas = useNovas(l.id)
  const [aberto, setAberto] = useState(false)
  const temNovas = novas.length > 0
  const urgente = novas.some((a) => a.tipo === "status" || a.antecipou)

  const mudouData = novas.find((a) => a.tipo === "data")
  const mudouStatus = novas.find((a) => a.tipo === "status")
  const docsNovos = novas.filter((a) => a.tipo === "arquivo").length

  const ultima = ATUALIZACOES.filter((a) => a.licitacaoId === l.id).reduce((m, a) => (a.quando > m ? a.quando : m), "")
  const status = statusPorId(l.status)

  const selo = temNovas ? (
    <Popover open={aberto} onOpenChange={setAberto}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-haspopup="dialog"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs leading-tight font-semibold hover:brightness-95",
            urgente ? "bg-warning/15 text-warning-strong" : "bg-primary/10 text-primary"
          )}
        >
          <RefreshCwIcon aria-hidden className="size-3.5" />
          Atualizada
          {novas.length > 1 && <span className="font-medium opacity-80">· {novas.length}</span>}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-96 gap-0 p-0">
        <div className="border-b px-4 py-3">
          <h2 className="text-sm font-semibold">O que mudou</h2>
          <p className="text-xs text-muted-foreground">Desde a última vez que você viu esta licitação</p>
        </div>
        <ul className="divide-y">
          {novas.map((a) => (
            <li key={a.id} className="px-4 py-3 text-[13px]">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold">{a.titulo}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{quandoRelativo(a.quando)}</span>
              </div>
              {a.antes && a.depois && (
                <dl className="mt-1.5 grid grid-cols-[auto_1fr] gap-x-2 rounded-md bg-muted/60 px-2.5 py-1.5">
                  <dt className="text-muted-foreground">Antes</dt>
                  <dd className="text-muted-foreground line-through">{a.tipo === "data" ? formatarData(a.antes) : a.antes}</dd>
                  <dt className="text-muted-foreground">Agora</dt>
                  <dd className="font-medium">{a.tipo === "data" ? formatarData(a.depois) : a.depois}</dd>
                </dl>
              )}
              {!!a.impacta?.length && (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Pode impactar:</span> {a.impacta.join(", ")}
                </p>
              )}
            </li>
          ))}
        </ul>
        <div className="border-t px-4 py-2.5">
          <Button
            size="sm"
            variant="outline"
            className="w-full shadow-none"
            onClick={() => {
              setAberto(false)
              onAbrir()
            }}
          >
            Ver atualizações e histórico
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  ) : null

  return (
    <LicitacaoCard
      edital={l.codigoEdital}
      badges={selo}
      actions={
        <>
          <Button variant="outline" className="px-3.5 shadow-none" data-nao-prototipado>
            Descartar
          </Button>
          <Button className="px-3.5" data-nao-prototipado>
            Enviar para análise
          </Button>
        </>
      }
      status={
        <LicitacaoCardStatusButton data-nao-prototipado title={mudouStatus ? `Antes: ${mudouStatus.antes}` : undefined}>
          {mudouStatus && <span aria-hidden className="size-2 rounded-full bg-warning" />}
          {status?.rotulo ?? "Sem status"}
          {mudouStatus && <span className="sr-only">, mudou de {mudouStatus.antes}</span>}
        </LicitacaoCardStatusButton>
      }
      iconActions={[
        { id: "salvar", label: "Salvar para depois", icon: <BookmarkIcon />, "data-nao-prototipado": true },
        { id: "link", label: "Copiar link", icon: <LinkIcon />, "data-nao-prototipado": true },
        { id: "compartilhar", label: "Compartilhar", icon: <Share2Icon />, "data-nao-prototipado": true },
        {
          id: "arquivos",
          label: docsNovos ? `Arquivos: ${docsNovos} ${docsNovos === 1 ? "documento novo" : "documentos novos"}` : "Arquivos",
          icon: <FolderIcon />,
          count: docsNovos || undefined,
          tone: docsNovos ? "warning" : "default",
          "data-nao-prototipado": true,
        },
      ]}
      highlight={
        temNovas ? (
          <div
            className={cn(
              "flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md border px-2.5 py-1.5 text-[13px]",
              urgente ? "border-warning/30 bg-warning/8 text-warning-strong" : "border-primary/20 bg-primary/5 text-primary"
            )}
          >
            <span className="sr-only">Novidades desde a sua última visita:</span>
            {novas.map((a) => (
              <LinhaDaMudanca key={a.id} a={a} />
            ))}
          </div>
        ) : undefined
      }
      segments={l.segmentos.map((s) => ({ label: s, category: categoriaDoSegmento(s) }))}
      orgao={l.orgao}
      objeto={l.objeto}
      valor={formatarMoeda(l.valorGlobal)}
      metaAside={[
        [
          { label: "Adicionada", value: "12/05/2026" },
          { label: "Atualizada", value: ultima ? formatarData(ultima.slice(0, 10)) : "–" },
        ],
        [
          {
            label: "Envio da proposta",
            tone: "warning",
            icon: <ClockIcon aria-hidden />,
            title: mudouData ? `Antes: ${formatarData(mudouData.antes!)}` : undefined,
            value:
              mudouData && l.dataEnvio ? (
                <span className="inline-flex flex-wrap items-baseline gap-1.5">
                  {formatarData(l.dataEnvio)}
                  <span className="text-xs font-normal text-muted-foreground line-through">{formatarData(mudouData.antes!)}</span>
                  <Badge variant="warning" className="h-4.5 rounded px-1 text-[10px]">
                    Alterada
                  </Badge>
                </span>
              ) : l.dataEnvio ? (
                formatarData(l.dataEnvio)
              ) : (
                "Sem data"
              ),
          },
        ],
      ]}
      meta={[
        { label: "ID", value: l.id },
        { label: "Cidade", value: l.cidade },
        { label: "Estado", value: l.estado },
        { label: "Itens com match", value: String(l.itensMatch) },
      ]}
    />
  )
}
