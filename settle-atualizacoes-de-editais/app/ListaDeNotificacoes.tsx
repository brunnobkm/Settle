// Lista de notificações no padrão do Figma "Central de notificações" (Platform, 923-13801):
// abas por categoria com contagem, itens com selo do tipo, "Nova resposta", título
// "PE 12/2026 · Órgão", mensagem truncada, "Visualizar mensagem completa" e tempo relativo.
// Estados: carregando (esqueleto), vazio e erro com "Tentar novamente".
// Usada no dropdown do sino da licitação (compacta) e na central (sheet).

import { useState } from "react"
import { CheckIcon, FileTextIcon, MailOpenIcon, SparklesIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  NotificationsCenterCount,
  notificationsCenterTabClassName,
  notificationsCenterTabsListClassName,
} from "@/components/ui/notifications-center"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

import {
  CATEGORIAS,
  ROTULO_CATEGORIA,
  ROTULO_CURTO,
  lerQuando,
  tempoRelativo,
  tituloDoEdital,
  type Categoria,
  type Licitacao,
  type Notificacao,
} from "./dados"
import { arquivosDaLicitacao, useAbrirArquivo } from "./VisualizadorDeArquivo"

export type EstadoDaLista = "normal" | "vazio" | "erro"

const TITULO_PLACEHOLDER = "Lorem ipsum 00/0000 · Dolor sit"

const LOREM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."

/** Conteúdo em lorem ipsum: mostra a estrutura sem sugerir regras de conteúdo que ainda não foram definidas. */
function comoPlaceholder(n: Notificacao): Notificacao {
  return {
    ...n,
    titulo: "Lorem ipsum dolor sit amet",
    mensagem: n.mensagem && LOREM,
    resposta: n.resposta && "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    mudanca: n.mudanca && { campo: "Lorem ipsum", de: "Dolor sit", para: "Amet consectetur" },
    impacto: n.impacto && "Consectetur adipiscing elit, sed do eiusmod tempor.",
    documento: n.documento && "lorem-ipsum.pdf",
    anexos: n.anexos?.map((_, i) => `lorem-ipsum-${i + 1}.pdf`),
  }
}

export function ListaDeNotificacoes({
  notificacoes,
  licitacoes,
  carregando,
  estado = "normal",
  compacta = false,
  placeholder = false,
  vazio,
  onTentarNovamente,
  onLida,
  onVerLicitacao,
}: {
  notificacoes: Notificacao[]
  licitacoes: Licitacao[]
  carregando: boolean
  /** Protótipo: força vazio ou erro. */
  estado?: EstadoDaLista
  /** No dropdown do sino: menos espaço. */
  compacta?: boolean
  /** Conteúdo genérico nos itens (estrutura sem texto real). */
  placeholder?: boolean
  vazio?: string
  onTentarNovamente: () => void
  onLida: (id: string, lida: boolean) => void
  onVerLicitacao?: (n: Notificacao) => void
}) {
  const [aba, setAba] = useState<Categoria | "todos">("todos")
  const [aberta, setAberta] = useState<Notificacao | null>(null)

  // mais recentes primeiro
  const itens = estado === "vazio" ? [] : [...notificacoes].map((n) => (placeholder ? comoPlaceholder(n) : n)).sort((a, b) => lerQuando(b.quando).getTime() - lerQuando(a.quando).getTime())
  const contagem = (c: Categoria | "todos") => (c === "todos" ? itens.length : itens.filter((n) => n.categoria === c).length)
  const lista = aba === "todos" ? itens : itens.filter((n) => n.categoria === aba)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Tabs value={aba} onValueChange={(v) => setAba(v as Categoria | "todos")} className={cn("gap-0", compacta ? "px-2 pt-2" : "px-3 pt-3")}>
        <TabsList aria-label="Categorias" className={cn(notificationsCenterTabsListClassName, "w-full")}>
          {CATEGORIAS.map((c) => (
            <TabsTrigger key={c.chave} value={c.chave} className={cn(notificationsCenterTabClassName, "px-2.5 text-[13px]")}>
              {c.rotulo}
              <NotificationsCenterCount>{carregando || estado === "erro" ? "–" : contagem(c.chave)}</NotificationsCenterCount>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className={cn("min-h-0 flex-1 overflow-y-auto", compacta ? "max-h-100" : "")} aria-busy={carregando}>
        {carregando ? (
          <div aria-label="Carregando notificações" className="divide-y">
            {[0, 1, 2].map((i) => (
              <div key={i} aria-hidden className="flex flex-col gap-2 px-4 py-3">
                <Skeleton className="h-4.5 w-20 rounded-md" />
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-[70%]" />
              </div>
            ))}
          </div>
        ) : estado === "erro" ? (
          <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
            <p className="text-[13px] text-muted-foreground">Não foi possível carregar</p>
            <Button size="sm" onClick={onTentarNovamente}>
              Tentar novamente
            </Button>
          </div>
        ) : lista.length ? (
          <ul className="divide-y">
            {lista.map((n) => (
              <ItemDeNotificacao
                key={n.id}
                notificacao={n}
                licitacao={licitacoes.find((l) => l.edital === n.edital)}
                compacta={compacta}
                placeholder={placeholder}
                onLida={(lida) => onLida(n.id, lida)}
                onAbrir={() => {
                  setAberta(n)
                  onLida(n.id, true)
                }}
                onVerLicitacao={onVerLicitacao && (() => onVerLicitacao(n))}
              />
            ))}
          </ul>
        ) : (
          <p className="px-4 py-12 text-center text-[13px] text-muted-foreground">
            {aba === "todos" && vazio ? vazio : "Nenhuma notificação encontrada"}
          </p>
        )}
      </div>

      <MensagemCompleta
        notificacao={aberta}
        licitacao={aberta ? licitacoes.find((l) => l.edital === aberta.edital) : undefined}
        placeholder={placeholder}
        onFechar={() => setAberta(null)}
      />
    </div>
  )
}

function ItemDeNotificacao({
  notificacao: n,
  licitacao,
  compacta,
  placeholder,
  onLida,
  onAbrir,
  onVerLicitacao,
}: {
  notificacao: Notificacao
  licitacao?: Licitacao
  compacta: boolean
  placeholder: boolean
  onLida: (lida: boolean) => void
  onAbrir: () => void
  onVerLicitacao?: () => void
}) {
  const abrirArquivo = useAbrirArquivo()
  const atualizacao = n.categoria === "atualizacao"
  const destaque = n.tipo === "retificacao" || n.tipo === "status"
  return (
    <li className={cn("group/item relative px-4 py-3 hover:bg-muted/40", !n.lida && "bg-primary/3")}>
      <div className="flex items-center gap-1.5 pr-8">
        {!n.lida && (
          <span className="size-2 shrink-0 rounded-full bg-destructive" title="Não lida">
            <span className="sr-only">Não lida</span>
          </span>
        )}
        <Badge variant={atualizacao && destaque ? "warning" : "secondary"} className="h-5 rounded-md text-[11px]">
          {atualizacao ? ROTULO_CURTO[n.tipo] : ROTULO_CATEGORIA[n.categoria]}
        </Badge>
        {n.novaResposta && (
          <Badge variant="outline" className="h-5 rounded-md text-[11px]">
            Nova resposta
          </Badge>
        )}
        {licitacao?.descartada && (
          <Badge variant="outline" className="h-5 rounded-md text-[11px] text-muted-foreground">
            Descartada
          </Badge>
        )}
      </div>

      {/* ação no hover, como no Figma */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={n.lida ? "Marcar como não lida" : "Marcar como lida"}
            className="absolute top-2.5 right-3 text-muted-foreground opacity-0 group-hover/item:opacity-100 focus-visible:opacity-100"
            onClick={() => onLida(!n.lida)}
          >
            {n.lida ? <MailOpenIcon /> : <CheckIcon />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{n.lida ? "Marcar como não lida" : "Marcar como lida"}</TooltipContent>
      </Tooltip>

      {!compacta && <p className="mt-1.5 text-[13px] font-semibold">{placeholder ? TITULO_PLACEHOLDER : tituloDoEdital(licitacao, n.edital)}</p>}
      <p className={cn("text-[13px]", compacta ? "mt-1.5 font-medium" : "mt-0.5 text-muted-foreground")}>
        {n.mensagem ? <span className="line-clamp-3">{n.mensagem}</span> : n.titulo}
      </p>

      {n.mudanca && (
        <p className="mt-1 text-xs text-muted-foreground">
          {n.mudanca.campo}: <span className="line-through">{n.mudanca.de}</span> →{" "}
          <span className="font-medium text-foreground">{n.mudanca.para}</span>
        </p>
      )}
      {!compacta && n.impacto && (
        <p className="mt-1.5 flex gap-1.5 text-xs text-muted-foreground">
          <SparklesIcon aria-hidden className="mt-0.5 size-3.5 shrink-0 text-primary" />
          <span>
            <span className="sr-only">Leitura da IA: </span>
            {n.impacto}
          </span>
        </p>
      )}
      {n.documento && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs">
          <FileTextIcon aria-hidden className="size-3.5 text-muted-foreground" />
          <button
            type="button"
            className="truncate rounded-sm text-left font-medium text-primary hover:underline"
            onClick={() => abrirArquivo(arquivosDaLicitacao(n.edital, n.documento!))}
          >
            {n.documento}
          </button>
        </p>
      )}

      {(n.mensagem || (onVerLicitacao && n.documento)) && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {n.mensagem && (
            <Button size="xs" onClick={onAbrir}>
              Visualizar mensagem completa
            </Button>
          )}
          {onVerLicitacao && n.documento && (
            <Button size="xs" variant="outline" className="shadow-none" onClick={onVerLicitacao}>
              Abrir documento
            </Button>
          )}
        </div>
      )}
      <p className="mt-1.5 text-xs text-muted-foreground" title={n.quando}>
        {tempoRelativo(n.quando)}
      </p>
    </li>
  )
}

function MensagemCompleta({
  notificacao: n,
  licitacao,
  placeholder,
  onFechar,
}: {
  notificacao: Notificacao | null
  licitacao?: Licitacao
  placeholder: boolean
  onFechar: () => void
}) {
  const abrirArquivo = useAbrirArquivo()
  return (
    <Dialog open={!!n} onOpenChange={(aberto) => !aberto && onFechar()}>
      <DialogContent className="sm:max-w-lg">
        {n && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-1.5">
                <Badge variant="secondary" className="h-5 rounded-md text-[11px]">
                  {ROTULO_CATEGORIA[n.categoria]}
                </Badge>
                <span className="text-xs text-muted-foreground">{n.quando}</span>
              </div>
              <DialogTitle>{placeholder ? TITULO_PLACEHOLDER : tituloDoEdital(licitacao, n.edital)}</DialogTitle>
              <DialogDescription>{n.titulo}</DialogDescription>
            </DialogHeader>
            <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto text-sm leading-relaxed">
              <p>{n.mensagem}</p>
              {n.resposta && (
                <section className="rounded-lg border bg-muted/40 p-3">
                  <h3 className="mb-1 text-xs font-semibold text-muted-foreground">Resposta do pregoeiro</h3>
                  <p>{n.resposta}</p>
                </section>
              )}
              {!!n.anexos?.length && (
                <section>
                  <h3 className="mb-1.5 text-xs font-semibold text-muted-foreground">Anexos</h3>
                  <ul className="flex flex-col gap-1">
                    {n.anexos.map((a) => (
                      <li key={a} className="flex items-center gap-1.5 text-[13px]">
                        <FileTextIcon aria-hidden className="size-3.5 text-muted-foreground" />
                        <button
                          type="button"
                          className="rounded-sm text-left font-medium text-primary hover:underline"
                          onClick={() => abrirArquivo({ arquivos: n.anexos!, indice: n.anexos!.indexOf(a) })}
                        >
                          {a}
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
