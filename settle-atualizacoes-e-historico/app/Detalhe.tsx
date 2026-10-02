// Sheet "Atualizações" da licitação: abre pelo selo "Atualização" (card, tabela, página da
// licitação). Uma lista só, da mais recente para a mais antiga, cada item em até três linhas:
//   o que aconteceu  ·  o que mudou (antes → agora)  ·  quem e quando
// As novas (ainda não vistas) ficam no topo. Mudanças do portal, de agentes e de pessoas entram
// na mesma lista; comentários e visualizações não entram.

import { useState } from "react"
import { ArrowRightIcon, BotIcon, GlobeIcon, TriangleAlertIcon, UserIcon } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"

import { dataCurta, quandoRelativo, type Atualizacao, type EventoHistorico } from "./atualizacoes"
import type { Licitacao } from "./dados"

type Item =
  | { tipo: "portal"; id: string; quando: string; a: Atualizacao }
  | { tipo: "evento"; id: string; quando: string; e: EventoHistorico }

const portalDe = (l: Licitacao) => (l.objeto.startsWith("[LICITANET]") ? "Portal Licitanet" : "Portal Compras.gov")

export function Detalhe({
  licitacao: l,
  atualizacoes,
  historico,
  novasIds,
  onFechar,
  onResolverConflito,
}: {
  licitacao: Licitacao | null
  atualizacoes: Atualizacao[]
  historico: EventoHistorico[]
  /** Atualizações que o usuário ainda não tinha visto ao abrir. */
  novasIds: string[]
  onFechar: () => void
  onResolverConflito: (a: Atualizacao, escolha: "manual" | "portal") => void
}) {
  const itens: Item[] = [
    ...atualizacoes.map((a): Item => ({ tipo: "portal", id: a.id, quando: a.quando, a })),
    ...historico.map((e): Item => ({ tipo: "evento", id: e.id, quando: e.quando, e })),
  ].sort((x, y) => y.quando.localeCompare(x.quando))
  const novas = itens.filter((i) => novasIds.includes(i.id))
  const anteriores = itens.filter((i) => !novasIds.includes(i.id))

  return (
    <Sheet open={!!l} onOpenChange={(o) => !o && onFechar()}>
      <SheetContent side="right" className="gap-0 p-0 data-[side=right]:w-[min(480px,100vw)] data-[side=right]:sm:max-w-none">
        {l && (
          <>
            <SheetHeader className="gap-1 border-b px-5 pt-5 pb-4">
              <SheetTitle className="text-base">Atualizações</SheetTitle>
              <SheetDescription className="text-xs">
                Edital {l.codigoEdital} · {l.orgao}
              </SheetDescription>
            </SheetHeader>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {itens.length === 0 ? (
                <Empty className="py-12">
                  <EmptyHeader>
                    <EmptyTitle>Nenhuma atualização</EmptyTitle>
                    <EmptyDescription>Quando algo mudar nesta licitação, aparece aqui.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <>
                  {novas.length > 0 && (
                    <Secao titulo={novas.length === 1 ? "Nova" : `Novas (${novas.length})`}>
                      {novas.map((i) => (
                        <Linha key={i.id} item={i} nova portal={portalDe(l)} onResolverConflito={onResolverConflito} />
                      ))}
                    </Secao>
                  )}
                  {anteriores.length > 0 && (
                    <Secao titulo="Anteriores">
                      {anteriores.map((i) => (
                        <Linha key={i.id} item={i} portal={portalDe(l)} onResolverConflito={onResolverConflito} />
                      ))}
                    </Secao>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="pt-4">
      <h3 className="px-5 pb-1 text-xs font-semibold text-muted-foreground">{titulo}</h3>
      <ul>{children}</ul>
    </section>
  )
}

function Linha({
  item: i,
  nova = false,
  portal,
  onResolverConflito,
}: {
  item: Item
  nova?: boolean
  portal: string
  onResolverConflito: (a: Atualizacao, escolha: "manual" | "portal") => void
}) {
  const origem = i.tipo === "portal" ? "portal" : i.e.origem
  const Icone = origem === "portal" ? GlobeIcon : origem === "agente" ? BotIcon : UserIcon
  const titulo = i.tipo === "portal" ? i.a.titulo : i.e.texto
  const autor = i.tipo === "portal" ? portal : i.e.autor

  return (
    <li className="flex gap-3 px-5 py-3">
      <span className="relative mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icone aria-hidden className="size-3.5" />
        {nova && <span aria-label="Nova" className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full border-2 border-background bg-warning" />}
      </span>
      <div className="grid min-w-0 flex-1 gap-1">
        <p className="text-[13.5px] leading-snug font-semibold">{titulo}</p>
        {i.tipo === "portal" ? <OQueMudou a={i.a} onResolverConflito={onResolverConflito} /> : <DoEvento e={i.e} />}
        <p className="text-xs text-muted-foreground">
          {autor} · {quandoRelativo(i.quando)}
        </p>
      </div>
    </li>
  )
}

/** A mudança em uma linha: antes → agora. Arquivo abre os trechos só se pedir. */
function OQueMudou({ a, onResolverConflito }: { a: Atualizacao; onResolverConflito: (a: Atualizacao, escolha: "manual" | "portal") => void }) {
  const [verTrechos, setVerTrechos] = useState(false)
  const fmt = (v: string) => (a.tipo === "data" ? dataCurta(v) : v)

  return (
    <div className="grid gap-2 text-[13px]">
      {a.antes && a.depois && (
        <p className="flex flex-wrap items-center gap-1.5 tabular-nums">
          <span className="text-muted-foreground line-through">{fmt(a.antes)}</span>
          <ArrowRightIcon aria-label="agora" className="size-3.5 text-muted-foreground" />
          <span className={cn("font-medium", a.antecipou && "text-destructive")}>{fmt(a.depois)}</span>
          {a.antecipou && <span className="text-xs font-medium text-destructive">(prazo encurtou)</span>}
        </p>
      )}
      {!a.antes && a.depois && <p>{a.depois}</p>}

      {a.manifestacao && <p className="leading-snug text-foreground/80">{a.manifestacao.resposta}</p>}

      {a.arquivo && (
        <div className="grid gap-2">
          <button
            type="button"
            aria-expanded={verTrechos}
            onClick={() => setVerTrechos((v) => !v)}
            className="justify-self-start text-[13px] font-medium text-primary hover:underline"
          >
            {verTrechos ? "Ocultar o que mudou" : `Ver o que mudou (${a.arquivo.trechos.length})`}
          </button>
          {verTrechos &&
            a.arquivo.trechos.map((t) => (
              <div key={t.secao} className="grid gap-1 rounded-lg bg-muted p-2.5 leading-snug">
                <span className="text-xs font-semibold">{t.secao}</span>
                <span className="text-muted-foreground line-through">{t.antes}</span>
                <span className="whitespace-pre-line">{t.depois}</span>
              </div>
            ))}
        </div>
      )}

      {a.conflito && a.depois && (
        <div className="grid gap-2 rounded-lg border border-warning/40 bg-warning/5 p-2.5">
          <p className="flex gap-2 leading-snug">
            <TriangleAlertIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-warning-strong" />
            <span>
              {a.conflito.autor} tinha definido {dataCurta(a.conflito.valorManual)}. Qual data vale?
            </span>
          </p>
          <div className="flex flex-wrap gap-2 pl-6">
            <Button size="xs" onClick={() => onResolverConflito(a, "portal")}>
              {dataCurta(a.depois)} (portal)
            </Button>
            <Button size="xs" variant="outline" className="bg-background shadow-none" onClick={() => onResolverConflito(a, "manual")}>
              {dataCurta(a.conflito.valorManual)} (manter)
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function DoEvento({ e }: { e: EventoHistorico }) {
  if (!e.detalhe && !(e.versao && e.versao.atual > 1)) return null
  return (
    <div className="grid gap-1 text-[13px] leading-snug">
      {e.detalhe && <p className="text-foreground/80">{e.detalhe}</p>}
      {e.versao && e.versao.atual > 1 && (
        <button
          type="button"
          onClick={() => toast(`Abrindo ${e.versao!.agente} v${e.versao!.atual - 1}`, { description: "Versão anterior, somente leitura." })}
          className="justify-self-start font-medium text-primary hover:underline"
        >
          Ver versão anterior
        </button>
      )}
    </div>
  )
}
