// Detalhe da licitação (recorte do workspace): cabeçalho + painel "Atualizações" no formato
// do Updates do Notion. Um feed só, do mais recente para o mais antigo:
// - topo: o que veio do portal e o usuário ainda não viu ("Nova");
// - abaixo: o histórico inteiro, filtrável por origem (Portal, Agentes, Pessoas).
// Cada item diz quem, o quê, quando, e mostra a mudança no próprio item: antes → depois em
// propriedades e o trecho do arquivo com o que saiu riscado e o que entrou marcado.
// Itens seguidos do mesmo autor viram um bloco ("Ver mais N"). O relógio de cada item abre a
// licitação como estava antes daquela mudança (versão anterior, somente leitura).

import { Fragment, useState } from "react"
import {
  ArrowRightIcon,
  BotIcon,
  GlobeIcon,
  HistoryIcon,
  RadioTowerIcon,
  TriangleAlertIcon,
  UserIcon,
} from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
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

const ICONE_DA_ORIGEM = { portal: GlobeIcon, agente: BotIcon, pessoa: UserIcon }

/** Trechos de arquivo mostrados no item antes do "Ver mais". */
const TRECHOS_VISIVEIS = 2

/** Item do feed: atualização do portal (rica) ou evento de agente/pessoa. */
type Item =
  | { tipo: "portal"; id: string; quando: string; autor: string; a: Atualizacao }
  | { tipo: "evento"; id: string; quando: string; autor: string; e: EventoHistorico }

const origemDo = (i: Item): OrigemHistorico => (i.tipo === "portal" ? "portal" : i.e.origem)

/** Agrupa itens seguidos do mesmo autor e origem (como o Notion faz com edições em sequência). */
function agrupar(itens: Item[]) {
  const grupos: Item[][] = []
  for (const i of itens) {
    const ultimo = grupos.at(-1)
    if (ultimo && ultimo[0].autor === i.autor && origemDo(ultimo[0]) === origemDo(i)) ultimo.push(i)
    else grupos.push([i])
  }
  return grupos
}

const autorDoPortal = (l: Licitacao) => (l.objeto.startsWith("[LICITANET]") ? "Portal Licitanet" : "Portal Compras.gov")

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
  /** Atualizações que o usuário ainda não tinha visto ao abrir (marcadas "Nova"). */
  novasIds: string[]
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

            <Painel
              key={l.id}
              licitacao={l}
              atualizacoes={atualizacoes}
              historico={historico}
              novasIds={novasIds}
              onResolverConflito={onResolverConflito}
            />
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

/* ------------------------------------------------------------------ */
/* Painel único: novas no topo + histórico filtrável                   */
/* ------------------------------------------------------------------ */

function Painel({
  licitacao: l,
  atualizacoes,
  historico,
  novasIds,
  onResolverConflito,
}: {
  licitacao: Licitacao
  atualizacoes: Atualizacao[]
  historico: EventoHistorico[]
  novasIds: string[]
  onResolverConflito: (a: Atualizacao, escolha: "manual" | "portal") => void
}) {
  const [filtro, setFiltro] = useState<OrigemHistorico | "todos">("todos")

  const autorPortal = autorDoPortal(l)
  const itens: Item[] = [
    ...atualizacoes.map((a): Item => ({ tipo: "portal", id: a.id, quando: a.quando, autor: autorPortal, a })),
    ...historico.map((e): Item => ({ tipo: "evento", id: e.id, quando: e.quando, autor: e.autor, e })),
  ].sort((x, y) => y.quando.localeCompare(x.quando))

  const novas = itens.filter((i) => novasIds.includes(i.id))
  const anteriores = itens.filter((i) => !novasIds.includes(i.id)).filter((i) => filtro === "todos" || origemDo(i) === filtro)
  const contagem = (o: OrigemHistorico) => itens.filter((i) => origemDo(i) === o).length

  const propsItem = { onResolverConflito }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="flex h-10 items-center border-b px-5 text-[13px] font-semibold">
        Atualizações
        {novas.length > 0 && <Badge className="ml-2 h-4.5 min-w-4.5 px-1.5 text-[11px] tabular-nums">{novas.length}</Badge>}
      </div>

      {itens.length === 0 ? (
        <Empty className="py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <RadioTowerIcon />
            </EmptyMedia>
            <EmptyTitle>Nenhuma atualização</EmptyTitle>
            <EmptyDescription>
              Mudanças do portal, versões geradas por agentes e alterações da equipe aparecem aqui.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          {novas.length > 0 && (
            <section aria-labelledby="titulo-novas" className="border-b bg-primary/3">
              <h3 id="titulo-novas" className="px-5 pt-3 text-xs font-semibold text-primary">
                {novas.length === 1 ? "1 novidade" : `${novas.length} novidades`} desde a sua última visita
              </h3>
              {agrupar(novas).map((g) => (
                <Grupo key={g[0].id} itens={g} nova {...propsItem} />
              ))}
            </section>
          )}

          <section aria-labelledby="titulo-historico">
            <div className="flex flex-wrap items-center justify-between gap-2 px-5 pt-4 pb-1">
              <h3 id="titulo-historico" className="text-xs font-semibold text-muted-foreground">
                Histórico
              </h3>
              <ToggleGroup
                type="single"
                variant="outline"
                size="sm"
                value={filtro}
                onValueChange={(v) => v && setFiltro(v as typeof filtro)}
                aria-label="Filtrar por origem"
              >
                <ToggleGroupItem value="todos" className="h-7 px-2.5 text-xs">
                  Todos
                </ToggleGroupItem>
                {(Object.keys(ROTULO_DA_ORIGEM) as OrigemHistorico[]).map((o) => (
                  <ToggleGroupItem key={o} value={o} className="h-7 px-2.5 text-xs">
                    {ROTULO_DA_ORIGEM[o]}
                    <span className="text-muted-foreground tabular-nums">{contagem(o)}</span>
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            {anteriores.length === 0 ? (
              <p className="px-5 py-6 text-[13px] text-muted-foreground">
                {filtro === "todos" ? "Nada além das novidades acima." : "Nenhuma mudança desta origem."}
              </p>
            ) : (
              agrupar(anteriores).map((g) => <Grupo key={g[0].id} itens={g} {...propsItem} />)
            )}

            <p className="px-5 pt-2 pb-6 text-xs text-muted-foreground">
              Entram: mudanças do portal, versões geradas por agentes e alterações da equipe (etapa, status, datas,
              responsáveis, resultado, decisões de divergência). Comentários e visualizações não entram.
            </p>
          </section>
        </>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Grupo (mesmo autor em sequência) e item                             */
/* ------------------------------------------------------------------ */

function Grupo({
  itens,
  nova = false,
  onResolverConflito,
}: {
  itens: Item[]
  nova?: boolean
  onResolverConflito: (a: Atualizacao, escolha: "manual" | "portal") => void
}) {
  // novidades vêm abertas: nada novo fica escondido atrás do "Ver mais"
  const [aberto, setAberto] = useState(nova)
  const visiveis = aberto ? itens : itens.slice(0, 1)
  const origem = origemDo(itens[0])
  const Icone = ICONE_DA_ORIGEM[origem]

  return (
    <article className="grid grid-cols-[28px_minmax(0,1fr)] gap-x-2.5 border-b px-5 py-3.5 last:border-b-0">
      <span
        aria-hidden
        className={cn(
          "mt-0.5 flex size-7 items-center justify-center rounded-full",
          origem === "portal" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
        )}
      >
        <Icone className="size-3.5" />
      </span>
      <div className="grid min-w-0 gap-3">
        {visiveis.map((i, n) => (
          <Fragment key={i.id}>
            {n > 0 && <hr className="border-dashed" />}
            <ConteudoDoItem item={i} nova={nova} mostrarAutor={n === 0} onResolverConflito={onResolverConflito} />
          </Fragment>
        ))}
        {itens.length > 1 && !nova && (
          <button
            type="button"
            onClick={() => setAberto((a) => !a)}
            className="justify-self-start text-xs font-medium text-muted-foreground hover:text-foreground hover:underline"
          >
            {aberto ? "Ver menos" : `Ver mais ${itens.length - 1}`}
          </button>
        )}
      </div>
    </article>
  )
}

function ConteudoDoItem({
  item: i,
  nova,
  mostrarAutor,
  onResolverConflito,
}: {
  item: Item
  nova: boolean
  mostrarAutor: boolean
  onResolverConflito: (a: Atualizacao, escolha: "manual" | "portal") => void
}) {
  const titulo = i.tipo === "portal" ? i.a.titulo : i.e.texto
  const versaoAnterior = () =>
    toast(`Abrindo a licitação como estava antes de ${dataCurta(i.quando.slice(0, 10))}, ${i.quando.slice(11, 16)}`, {
      description: "Versão anterior, somente leitura.",
    })

  return (
    <div className="grid min-w-0 gap-2">
      <header className="flex items-start gap-2">
        <div className="min-w-0 flex-1 text-[13px] leading-snug">
          {/* "Fulano adicionou…" para agentes e pessoas; "Portal X: Título" para o portal */}
          {mostrarAutor && <span className="font-semibold">{i.autor}{i.tipo === "portal" ? ": " : " "}</span>}
          <span className={cn(!mostrarAutor && "font-medium")}>
            {mostrarAutor && i.tipo === "evento" ? minusculaInicial(titulo) : titulo}
          </span>
          {i.tipo === "evento" && i.e.versao && (
            <Badge variant="secondary" className="ml-1.5 h-4.5 px-1.5 align-[1px] text-[10px]">
              v{i.e.versao.atual}
            </Badge>
          )}
          {nova && <Badge className="ml-1.5 h-4.5 px-1.5 align-[1px] text-[10px]">Nova</Badge>}
          <p className="mt-0.5 text-xs text-muted-foreground">
            {i.tipo === "portal" ? `${ROTULO_DO_TIPO[i.a.tipo]} · ` : ""}
            {quandoRelativo(i.quando)}
          </p>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="Ver versão anterior a esta mudança"
              className="text-muted-foreground"
              onClick={versaoAnterior}
            >
              <HistoryIcon aria-hidden />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Ver versão anterior</TooltipContent>
        </Tooltip>
      </header>

      {i.tipo === "portal" ? <MudancaDoPortal a={i.a} onResolverConflito={onResolverConflito} /> : <MudancaDeEvento e={i.e} />}
    </div>
  )
}

const minusculaInicial = (t: string) => t.charAt(0).toLowerCase() + t.slice(1)

/** Propriedade: valor antigo riscado → novo, como "Prioridade P2 › P1" no Notion. */
function AntesDepois({ rotulo, antes, depois, alerta }: { rotulo: string; antes: string; depois: string; alerta?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-[13px] tabular-nums">
      <span className="text-xs text-muted-foreground">{rotulo}</span>
      <span className="rounded-sm bg-destructive/8 px-1.5 text-muted-foreground line-through">{antes}</span>
      <ArrowRightIcon aria-label="mudou para" className="size-3.5 text-muted-foreground" />
      <span className={cn("rounded-sm bg-success/10 px-1.5 font-semibold", alerta && "text-destructive")}>{depois}</span>
      {alerta && (
        <Badge variant="destructive" className="text-[11px]">
          {alerta}
        </Badge>
      )}
    </div>
  )
}

function MudancaDoPortal({
  a,
  onResolverConflito,
}: {
  a: Atualizacao
  onResolverConflito: (a: Atualizacao, escolha: "manual" | "portal") => void
}) {
  const [todosTrechos, setTodosTrechos] = useState(false)
  const formatar = (v: string) => (a.tipo === "data" ? dataCurta(v) : v)
  const trechos = a.arquivo?.trechos ?? []
  const visiveis = todosTrechos ? trechos : trechos.slice(0, TRECHOS_VISIVEIS)

  return (
    <div className="grid gap-2.5">
      {a.antes && a.depois && (
        <AntesDepois
          rotulo={ROTULO_DO_TIPO[a.tipo]}
          antes={formatar(a.antes)}
          depois={formatar(a.depois)}
          alerta={a.antecipou ? "Prazo encurtou" : undefined}
        />
      )}
      {!a.antes && a.depois && (
        <p className="text-[13px]">
          <span className="rounded-sm bg-success/10 px-1.5 font-medium">{a.depois}</span>
        </p>
      )}

      {a.manifestacao && (
        <div className="grid gap-1.5 border-l-2 pl-3 text-[13px] leading-snug">
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

      {/* Trecho do arquivo: o que saiu riscado, o que entrou marcado, no próprio item */}
      {a.arquivo && (
        <div className="grid gap-2">
          <p className="text-xs text-muted-foreground">
            <span className="line-through">{a.arquivo.versaoAnterior}</span>
            <ArrowRightIcon aria-label="substituído por" className="mx-1 inline size-3" />
            <span className="font-medium text-foreground">{a.arquivo.versaoNova}</span>
          </p>
          {visiveis.map((t) => (
            <div key={t.secao} className="grid gap-1 border-l-2 pl-3 text-[13px] leading-snug">
              <span className="text-xs font-semibold">{t.secao}</span>
              <span className="rounded-sm bg-destructive/8 px-1.5 py-0.5 whitespace-pre-line text-muted-foreground line-through">
                {t.antes}
              </span>
              <span className="rounded-sm bg-success/10 px-1.5 py-0.5 whitespace-pre-line">{t.depois}</span>
            </div>
          ))}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {trechos.length > TRECHOS_VISIVEIS && (
              <button
                type="button"
                onClick={() => setTodosTrechos((v) => !v)}
                className="font-medium text-muted-foreground hover:text-foreground hover:underline"
              >
                {todosTrechos ? "Ver menos trechos" : `Ver mais ${trechos.length - TRECHOS_VISIVEIS} trechos`}
              </button>
            )}
            <button
              type="button"
              onClick={() => toast(MENSAGEM_NAO_PROTOTIPADO)}
              className="font-medium text-primary hover:underline"
            >
              Comparar documento inteiro
            </button>
          </div>
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
    </div>
  )
}

function MudancaDeEvento({ e }: { e: EventoHistorico }) {
  if (!e.detalhe && !e.versao) return null
  return (
    <div className="grid gap-1 text-[13px] leading-snug">
      {e.detalhe && <span>{e.detalhe}</span>}
      {e.versao && <span className="text-xs text-muted-foreground">Motivo: {e.versao.motivo}</span>}
    </div>
  )
}
