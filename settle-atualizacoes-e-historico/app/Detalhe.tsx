// Sheet da licitação em dois modos, separados como pedido na reunião de 02/10:
// - "Atualizações": só o que veio do portal (atualização do sistema). Abre pelo selo.
//   Novas no topo; cada item em até três linhas: o que aconteceu · o que mudou · fonte e quando.
//   Dado que ninguém tinha editado mostra "Aplicada automaticamente"; dado crítico editado à mão
//   (data, status) pede a decisão do cliente.
// - "Histórico": tudo o que aconteceu no card (sistema, agentes, usuários), com filtros.
//   Comentários ficam fora por padrão; bloco de notas nunca entra. Abre pelo botão Histórico da
//   página da licitação ou pelo link no fim das Atualizações.

import { useState } from "react"
import { ArrowRightIcon, BotIcon, CheckIcon, GlobeIcon, MessageSquareIcon, TriangleAlertIcon, UserIcon } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

import { ROTULO_DO_TIPO, dataCurta, quandoRelativo, type Atualizacao, type EventoHistorico } from "./atualizacoes"
import type { Licitacao } from "./dados"

export type ModoDoSheet = "atualizacoes" | "historico"
type Filtro = "todos" | "sistema" | "agente" | "pessoa"

const FILTROS: { id: Filtro; rotulo: string }[] = [
  { id: "todos", rotulo: "Todos" },
  { id: "sistema", rotulo: "Sistema" },
  { id: "agente", rotulo: "Agentes" },
  { id: "pessoa", rotulo: "Usuários" },
]

type Item =
  | { tipo: "portal"; id: string; quando: string; a: Atualizacao }
  | { tipo: "evento"; id: string; quando: string; e: EventoHistorico }

const origemDo = (i: Item): Exclude<Filtro, "todos"> => (i.tipo === "portal" ? "sistema" : i.e.origem === "agente" ? "agente" : "pessoa")
const portalDe = (l: Licitacao) => (l.objeto.startsWith("[LICITANET]") ? "Portal Licitanet" : "Portal Compras.gov")

type PropsDoSheet = {
  licitacao: Licitacao | null
  modo: ModoDoSheet
  onModo: (m: ModoDoSheet) => void
  atualizacoes: Atualizacao[]
  historico: EventoHistorico[]
  /** Atualizações que o usuário ainda não tinha visto ao abrir. */
  novasIds: string[]
  onFechar: () => void
  onResolverConflito: (a: Atualizacao, escolha: "manual" | "portal") => void
}

export function Detalhe({ licitacao: l, modo, onModo, onFechar, ...props }: PropsDoSheet) {
  return (
    <Sheet open={!!l} onOpenChange={(o) => !o && onFechar()}>
      <SheetContent side="right" className="gap-0 p-0 data-[side=right]:w-[min(480px,100vw)] data-[side=right]:sm:max-w-none">
        {l && (
          <>
            <SheetHeader className="gap-1 border-b px-5 pt-5 pb-4">
              <SheetTitle className="text-base">{modo === "atualizacoes" ? "Atualizações" : "Histórico"}</SheetTitle>
              <SheetDescription className="text-xs">
                Edital {l.codigoEdital} · {l.orgao}
              </SheetDescription>
            </SheetHeader>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {modo === "atualizacoes" ? (
                <Atualizacoes licitacao={l} {...props} onVerHistorico={() => onModo("historico")} />
              ) : (
                <Historico licitacao={l} {...props} onVerAtualizacoes={() => onModo("atualizacoes")} />
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

/* ------------------------------------------------------------------ */
/* Atualizações (só portal)                                            */
/* ------------------------------------------------------------------ */

function Atualizacoes({
  licitacao: l,
  atualizacoes,
  novasIds,
  onResolverConflito,
  onVerHistorico,
}: Omit<PropsDoSheet, "licitacao" | "modo" | "onModo" | "onFechar" | "historico"> & { licitacao: Licitacao; onVerHistorico: () => void }) {
  const itens: Item[] = atualizacoes.map((a) => ({ tipo: "portal", id: a.id, quando: a.quando, a }))
  const novas = itens.filter((i) => novasIds.includes(i.id))
  const anteriores = itens.filter((i) => !novasIds.includes(i.id))
  const props = { portal: portalDe(l), onResolverConflito }

  return (
    <>
      {itens.length === 0 ? (
        <Empty className="py-12">
          <EmptyHeader>
            <EmptyTitle>Nenhuma atualização do portal</EmptyTitle>
            <EmptyDescription>Quando o órgão publicar arquivo, data, status ou manifestação nova, aparece aqui.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          {novas.length > 0 && (
            <Secao titulo={novas.length === 1 ? "Nova" : `Novas (${novas.length})`}>
              {novas.map((i) => (
                <Linha key={i.id} item={i} nova {...props} />
              ))}
            </Secao>
          )}
          {anteriores.length > 0 && (
            <Secao titulo="Anteriores">
              {anteriores.map((i) => (
                <Linha key={i.id} item={i} {...props} />
              ))}
            </Secao>
          )}
        </>
      )}
      <div className="border-t px-5 py-3">
        <button type="button" onClick={onVerHistorico} className="text-[13px] font-medium text-primary hover:underline">
          Ver histórico completo da licitação
        </button>
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Histórico (sistema + agentes + usuários)                            */
/* ------------------------------------------------------------------ */

function Historico({
  licitacao: l,
  atualizacoes,
  historico,
  onResolverConflito,
  onVerAtualizacoes,
}: Omit<PropsDoSheet, "licitacao" | "modo" | "onModo" | "onFechar" | "novasIds"> & { licitacao: Licitacao; onVerAtualizacoes: () => void }) {
  const [filtro, setFiltro] = useState<Filtro>("todos")
  const [comentarios, setComentarios] = useState(false)

  const todos: Item[] = [
    ...atualizacoes.map((a): Item => ({ tipo: "portal", id: a.id, quando: a.quando, a })),
    ...historico.map((e): Item => ({ tipo: "evento", id: e.id, quando: e.quando, e })),
  ].sort((x, y) => y.quando.localeCompare(x.quando))
  const semComentarios = todos.filter((i) => comentarios || i.tipo === "portal" || !i.e.comentario)
  const visiveis = semComentarios.filter((i) => filtro === "todos" || origemDo(i) === filtro)
  const contagem = (f: Filtro) => (f === "todos" ? semComentarios.length : semComentarios.filter((i) => origemDo(i) === f).length)
  const props = { portal: portalDe(l), onResolverConflito }

  return (
    <>
      <div className="grid gap-3 border-b px-5 py-3">
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          value={filtro}
          onValueChange={(v) => v && setFiltro(v as Filtro)}
          aria-label="Filtrar histórico por origem"
          className="justify-start"
        >
          {FILTROS.map((f) => (
            <ToggleGroupItem key={f.id} value={f.id} className="h-7 px-2.5 text-xs">
              {f.rotulo}
              <span className="text-muted-foreground tabular-nums">{contagem(f.id)}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <div className="flex items-center gap-2">
          <Switch id="mostrar-comentarios" checked={comentarios} onCheckedChange={setComentarios} />
          <Label htmlFor="mostrar-comentarios" className="text-xs font-normal text-muted-foreground">
            Mostrar comentários (os da área Comentários da licitação)
          </Label>
        </div>
      </div>

      {visiveis.length === 0 ? (
        <p className="px-5 py-8 text-[13px] text-muted-foreground">Nada registrado com este filtro.</p>
      ) : (
        <ul className="pt-2">
          {visiveis.map((i) => (
            <Linha key={i.id} item={i} {...props} />
          ))}
        </ul>
      )}
      <div className="grid gap-2 border-t px-5 py-3">
        <p className="text-xs text-muted-foreground">
          Todos da empresa veem o histórico. O bloco de notas não entra.
        </p>
        <button type="button" onClick={onVerAtualizacoes} className="justify-self-start text-[13px] font-medium text-primary hover:underline">
          Ver só as atualizações do portal
        </button>
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Linha (comum aos dois modos)                                        */
/* ------------------------------------------------------------------ */

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
  const origem = origemDo(i)
  const comentario = i.tipo === "evento" && i.e.comentario
  const Icone = comentario ? MessageSquareIcon : origem === "sistema" ? GlobeIcon : origem === "agente" ? BotIcon : UserIcon
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

      {a.automatica && (
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <CheckIcon aria-hidden className="size-3.5 text-success" />
          Aplicada automaticamente: ninguém tinha editado {ROTULO_DO_TIPO[a.tipo].toLowerCase()}.
        </p>
      )}

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

      {/* dado crítico editado à mão: o portal não sobrescreve, o cliente decide */}
      {a.conflito && a.depois && (
        <div className="grid gap-2 rounded-lg border border-warning/40 bg-warning/5 p-2.5">
          <p className="flex gap-2 leading-snug">
            <TriangleAlertIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-warning-strong" />
            <span>
              {a.conflito.autor} tinha definido {fmt(a.conflito.valorManual)}. Qual vale?
            </span>
          </p>
          <div className="flex flex-wrap gap-2 pl-6">
            <Button size="xs" onClick={() => onResolverConflito(a, "portal")}>
              {fmt(a.depois)} (portal)
            </Button>
            <Button size="xs" variant="outline" className="bg-background shadow-none" onClick={() => onResolverConflito(a, "manual")}>
              {fmt(a.conflito.valorManual)} (manter)
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
