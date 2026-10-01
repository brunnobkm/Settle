// Detalhe da licitação (recorte do workspace): cabeçalho + duas abas novas.
// "Atualizações": o que veio do portal, com antes → depois, o que pode ser impactado,
// comparação de versões de arquivo e decisão quando o portal conflita com um valor editado.
// "Histórico": tudo que mudou, filtrável por origem (Portal, Agentes, Pessoas); versões
// geradas por agentes guardam acesso à anterior.

import { useState } from "react"
import {
  ArrowRightIcon,
  BotIcon,
  CalendarClockIcon,
  FileDiffIcon,
  FileTextIcon,
  GlobeIcon,
  HistoryIcon,
  MessageSquareTextIcon,
  RadioTowerIcon,
  TriangleAlertIcon,
  UserIcon,
} from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Timeline, TimelineDescription, TimelineItem, TimelineMeta, TimelineTitle } from "@/components/ui/timeline"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { MENSAGEM_NAO_PROTOTIPADO } from "@/settle/nao-prototipado"

import {
  ROTULO_DA_ORIGEM,
  ROTULO_DO_TIPO,
  dataCurta,
  quandoRelativo,
  type Atualizacao,
  type EventoHistorico,
  type OrigemHistorico,
} from "./atualizacoes"
import { statusPorId, type Licitacao } from "./dados"

const ICONE_DO_TIPO = {
  data: CalendarClockIcon,
  arquivo: FileTextIcon,
  manifestacao: MessageSquareTextIcon,
  status: RadioTowerIcon,
}

const ICONE_DA_ORIGEM = { portal: GlobeIcon, agente: BotIcon, pessoa: UserIcon }

export type Aba = "atualizacoes" | "historico"

export function Detalhe({
  licitacao: l,
  atualizacoes,
  historico,
  novasIds,
  aba,
  onAba,
  onFechar,
  onResolverConflito,
}: {
  licitacao: Licitacao | null
  atualizacoes: Atualizacao[]
  historico: EventoHistorico[]
  /** Atualizações que o usuário ainda não tinha visto ao abrir (marcadas "Nova"). */
  novasIds: string[]
  aba: Aba
  onAba: (a: Aba) => void
  onFechar: () => void
  onResolverConflito: (a: Atualizacao, escolha: "manual" | "portal") => void
}) {
  const status = l ? statusPorId(l.status) : null
  return (
    <Sheet open={!!l} onOpenChange={(o) => !o && onFechar()}>
      <SheetContent side="right" className="gap-0 p-0 data-[side=right]:w-[min(620px,100vw)] data-[side=right]:sm:max-w-none">
        {l && (
          <>
            <SheetHeader className="gap-1.5 border-b px-5 pt-5 pb-4">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="font-mono">Edital {l.codigoEdital}</span>
                {status && (
                  <Badge variant={status.tom} className="text-[11px]">
                    {status.rotulo}
                  </Badge>
                )}
              </div>
              <SheetTitle className="pr-8 text-base leading-snug">{l.titulo}</SheetTitle>
              <SheetDescription className="text-xs">{l.orgao}</SheetDescription>
              <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Seções do workspace">
                {["Visão geral", "Itens", "Análise técnica", "Habilitação", "Manifestações"].map((s) => (
                  <Button key={s} variant="outline" size="xs" className="shadow-none" data-nao-prototipado>
                    {s}
                  </Button>
                ))}
              </div>
            </SheetHeader>

            <Tabs value={aba} onValueChange={(v) => onAba(v as Aba)} className="min-h-0 flex-1 gap-0">
              <TabsList variant="line" className="h-10 w-full justify-start gap-3 border-b px-5">
                <TabsTrigger value="atualizacoes" className="flex-none px-0.5 text-[13px]">
                  Atualizações
                  {novasIds.length > 0 && (
                    <Badge className="h-4.5 min-w-4.5 px-1.5 text-[11px] tabular-nums">{novasIds.length}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="historico" className="flex-none px-0.5 text-[13px]">
                  Histórico
                </TabsTrigger>
              </TabsList>

              <TabsContent value="atualizacoes" className="min-h-0 overflow-y-auto px-5 py-4">
                <ListaDeAtualizacoes
                  atualizacoes={atualizacoes}
                  novasIds={novasIds}
                  onResolverConflito={onResolverConflito}
                  onVerHistorico={() => onAba("historico")}
                />
              </TabsContent>
              <TabsContent value="historico" className="min-h-0 overflow-y-auto px-5 py-4">
                <Historico eventos={historico} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

/* ------------------------------------------------------------------ */
/* Atualizações                                                         */
/* ------------------------------------------------------------------ */

function ListaDeAtualizacoes({
  atualizacoes,
  novasIds,
  onResolverConflito,
  onVerHistorico,
}: {
  atualizacoes: Atualizacao[]
  novasIds: string[]
  onResolverConflito: (a: Atualizacao, escolha: "manual" | "portal") => void
  onVerHistorico: () => void
}) {
  const [comparando, setComparando] = useState<Atualizacao | null>(null)

  if (!atualizacoes.length)
    return (
      <Empty className="py-12">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <RadioTowerIcon />
          </EmptyMedia>
          <EmptyTitle>Nenhuma atualização do portal</EmptyTitle>
          <EmptyDescription>Quando o órgão mudar data, arquivo, status ou responder uma manifestação, aparece aqui.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )

  return (
    <div className="grid gap-3">
      {novasIds.length > 0 && (
        <p className="text-[13px] text-muted-foreground">
          {novasIds.length === 1 ? "1 atualização" : `${novasIds.length} atualizações`} desde a sua última visita.
        </p>
      )}
      {atualizacoes.map((a) => {
        const Icone = ICONE_DO_TIPO[a.tipo]
        const nova = novasIds.includes(a.id)
        return (
          <article
            key={a.id}
            className={cn("grid gap-2.5 rounded-xl border bg-card p-3.5", nova && "border-primary/30 bg-primary/3")}
          >
            <header className="flex items-start gap-2.5">
              <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Icone aria-hidden className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <h3 className="text-[13.5px] font-semibold">{a.titulo}</h3>
                  {nova && <Badge className="h-4.5 px-1.5 text-[10px]">Nova</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">
                  {ROTULO_DO_TIPO[a.tipo]} · {quandoRelativo(a.quando)}
                </p>
              </div>
            </header>

            {/* antes → depois */}
            {a.antes && a.depois && (
              <div className="flex flex-wrap items-center gap-2 text-[13px] tabular-nums">
                <span className="text-muted-foreground line-through">{a.tipo === "data" ? dataCurta(a.antes) : a.antes}</span>
                <ArrowRightIcon aria-label="mudou para" className="size-3.5 text-muted-foreground" />
                <span className={cn("font-semibold", a.antecipou && "text-destructive")}>
                  {a.tipo === "data" ? dataCurta(a.depois) : a.depois}
                </span>
                {a.antecipou && (
                  <Badge variant="destructive" className="text-[11px]">
                    Prazo encurtou
                  </Badge>
                )}
              </div>
            )}

            {a.manifestacao && (
              <div className="grid gap-1.5 rounded-lg bg-muted p-2.5 text-[13px] leading-snug">
                <p>
                  <span className="font-semibold">Pergunta: </span>
                  {a.manifestacao.pergunta}
                </p>
                <p>
                  <span className="font-semibold">Resposta: </span>
                  {a.manifestacao.resposta}
                </p>
              </div>
            )}

            {a.arquivo && (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted p-2.5 text-xs">
                <span className="min-w-0">
                  <span className="block text-muted-foreground line-through">{a.arquivo.versaoAnterior}</span>
                  <span className="block font-medium">{a.arquivo.versaoNova}</span>
                </span>
                <Button size="xs" variant="outline" className="bg-background shadow-none" onClick={() => setComparando(a)}>
                  <FileDiffIcon data-icon="inline-start" />
                  Comparar versões
                  <Badge variant="secondary" className="h-4 px-1 text-[10px] tabular-nums">
                    {a.arquivo.trechos.length}
                  </Badge>
                </Button>
              </div>
            )}

            {/* corner case: valor editado à mão + portal trouxe outro */}
            {a.conflito && a.depois && (
              <div className="grid gap-2 rounded-lg border border-warning/40 bg-warning/5 p-2.5 text-[13px]">
                <p className="flex gap-2 leading-snug">
                  <TriangleAlertIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-warning-strong" />
                  <span>
                    {a.conflito.autor} definiu <strong>{dataCurta(a.conflito.valorManual)}</strong> à mão. O portal agora
                    informa <strong>{dataCurta(a.depois)}</strong>. Qual vale?
                  </span>
                </p>
                <div className="flex flex-wrap gap-2 pl-6">
                  <Button size="xs" onClick={() => onResolverConflito(a, "portal")}>
                    Usar a do portal ({dataCurta(a.depois)})
                  </Button>
                  <Button size="xs" variant="outline" className="bg-background shadow-none" onClick={() => onResolverConflito(a, "manual")}>
                    Manter {dataCurta(a.conflito.valorManual)}
                  </Button>
                </div>
              </div>
            )}

            {a.impacta && a.impacta.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-muted-foreground">Pode impactar:</span>
                {a.impacta.map((s) => (
                  <Badge key={s} variant="outline" className="cursor-pointer text-[11px]" data-nao-prototipado>
                    {s}
                  </Badge>
                ))}
              </div>
            )}

            {a.tipo === "arquivo" && a.impacta?.some((s) => s.startsWith("Análise") || s === "Habilitação") && (
              <button
                type="button"
                onClick={onVerHistorico}
                className="flex items-center gap-1.5 text-left text-xs font-medium text-primary hover:underline"
              >
                <BotIcon aria-hidden className="size-3.5" />
                Os agentes geraram novas versões a partir deste arquivo. Ver no histórico
              </button>
            )}
          </article>
        )
      })}

      <CompararVersoes atualizacao={comparando} onFechar={() => setComparando(null)} />
    </div>
  )
}

function CompararVersoes({ atualizacao: a, onFechar }: { atualizacao: Atualizacao | null; onFechar: () => void }) {
  const arq = a?.arquivo
  return (
    <Dialog open={!!arq} onOpenChange={(o) => !o && onFechar()}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Comparar versões: {arq?.nome}</DialogTitle>
          <DialogDescription>Só os trechos que mudaram. Vermelho saiu, verde entrou.</DialogDescription>
        </DialogHeader>
        {arq && (
          <div className="grid max-h-[60vh] gap-3 overflow-y-auto">
            <div className="grid grid-cols-2 gap-3 text-xs font-medium text-muted-foreground">
              <span>{arq.versaoAnterior}</span>
              <span>{arq.versaoNova}</span>
            </div>
            {arq.trechos.map((t) => (
              <section key={t.secao} className="grid gap-1.5">
                <h4 className="text-[13px] font-semibold">{t.secao}</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  <p className="rounded-lg bg-destructive/8 p-2.5 text-[13px] leading-snug whitespace-pre-line">{t.antes}</p>
                  <p className="rounded-lg bg-success/10 p-2.5 text-[13px] leading-snug whitespace-pre-line">{t.depois}</p>
                </div>
              </section>
            ))}
            <Button variant="link" size="sm" className="justify-self-start px-0" onClick={() => toast(MENSAGEM_NAO_PROTOTIPADO)}>
              Abrir as duas versões completas
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

/* ------------------------------------------------------------------ */
/* Histórico                                                            */
/* ------------------------------------------------------------------ */

function Historico({ eventos }: { eventos: EventoHistorico[] }) {
  const [filtro, setFiltro] = useState<OrigemHistorico | "todos">("todos")
  const visiveis = filtro === "todos" ? eventos : eventos.filter((e) => e.origem === filtro)

  return (
    <div className="grid gap-4">
      <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        value={filtro}
        onValueChange={(v) => v && setFiltro(v as typeof filtro)}
        aria-label="Filtrar por origem"
        className="justify-start"
      >
        <ToggleGroupItem value="todos" className="px-3 text-xs">
          Todos
        </ToggleGroupItem>
        {(Object.keys(ROTULO_DA_ORIGEM) as OrigemHistorico[]).map((o) => (
          <ToggleGroupItem key={o} value={o} className="px-3 text-xs">
            {ROTULO_DA_ORIGEM[o]}
            <span className="text-muted-foreground tabular-nums">{eventos.filter((e) => e.origem === o).length}</span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {visiveis.length === 0 ? (
        <Empty className="py-10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HistoryIcon />
            </EmptyMedia>
            <EmptyTitle>Nada registrado</EmptyTitle>
            <EmptyDescription>Nenhuma mudança desta origem na licitação.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <Timeline>
          {visiveis.map((e) => {
            const Icone = ICONE_DA_ORIGEM[e.origem]
            return (
              <TimelineItem key={e.id} highlighted={!!e.versao && e.versao.atual > 1}>
                <TimelineTitle className="text-[13.5px]">
                  {e.texto}
                  {e.versao && (
                    <Badge variant="secondary" className="text-[11px]">
                      v{e.versao.atual}
                    </Badge>
                  )}
                </TimelineTitle>
                <TimelineMeta className="flex items-center gap-1.5">
                  <Icone aria-hidden className="size-3.5" />
                  {e.autor} · {quandoRelativo(e.quando)}
                </TimelineMeta>
                {(e.detalhe || e.versao) && (
                  <TimelineDescription className="grid gap-1.5 text-[13px]">
                    {e.detalhe && <span>{e.detalhe}</span>}
                    {e.versao && (
                      <span className="text-muted-foreground">
                        Motivo: {e.versao.motivo}
                        {e.versao.atual > 1 && (
                          <>
                            {" · "}
                            <button
                              type="button"
                              className="font-medium text-primary hover:underline"
                              onClick={() => toast(`Abrindo ${e.versao!.agente} v${e.versao!.atual - 1} (somente leitura)`)}
                            >
                              Ver versão {e.versao.atual - 1}
                            </button>
                          </>
                        )}
                      </span>
                    )}
                  </TimelineDescription>
                )}
              </TimelineItem>
            )
          })}
        </Timeline>
      )}
      <p className="text-xs text-muted-foreground">
        Entram no histórico: mudanças do portal, versões geradas por agentes e alterações feitas por pessoas (etapa,
        status, datas, responsáveis, resultado, decisões de divergência). Comentários e visualizações não entram.
      </p>
    </div>
  )
}
