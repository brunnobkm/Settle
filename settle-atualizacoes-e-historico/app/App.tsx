// Atualizações e histórico de uma licitação, sobre Recomendadas e Em andamento.
// Selo "Atualizada" nos cards (Board, Tabela, Calendário, Recomendadas) para mudanças do
// portal ainda não vistas. Clicar no selo abre o sheet de Atualizações; clicar no card abre a
// página "Detalhes da licitação" (modelo de produção), que também tem o selo.
// Base: settle-licitacoes-em-andamento. Licitações em andamento em três
// visualizações. Board (kanban por etapa do nosso processo, arrastar entre colunas),
// Tabela (todas as propriedades em colunas) e Calendário (pelo envio da proposta).
// O card do Board é a fonte da verdade visual; Tabela e Calendário o espelham.

import { useCallback, useMemo, useState, type ComponentProps } from "react"
import { LinkIcon, SearchIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { AppShell } from "@/components/ui/app-shell"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Kanban } from "@/components/ui/kanban"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useNaoPrototipado } from "@/settle/nao-prototipado"
import { menuLicitacoes, USUARIO, WORKSPACE, type TelaLicitacoes } from "@/settle/navegacao"
import type { AppShellGroup } from "@/components/ui/app-shell"

import { CardKanban } from "./CardKanban"
import { ETAPAS, LICITACOES, RECOMENDADAS, SEGMENTOS_INICIAIS, linkDaLicitacao, type EtapaId, type Licitacao } from "./dados"
import { ATUALIZACOES, HISTORICO, atualizacoesNovas, type Atualizacao, type EventoHistorico } from "./atualizacoes"
import { Detalhe } from "./Detalhe"
import { PaginaDaLicitacao } from "./PaginaDaLicitacao"
import { NovasContext } from "./Selo"
import { VistaRecomendadas } from "./VistaRecomendadas"
import { VistaCalendario } from "./VistaCalendario"
import { VistaTabela } from "./VistaTabela"

type Vista = "board" | "tabela" | "calendario"

const VISTAS: { id: Vista; rotulo: string }[] = [
  { id: "board", rotulo: "Board" },
  { id: "tabela", rotulo: "Tabela" },
  { id: "calendario", rotulo: "Calendário" },
]

export default function App() {
  useNaoPrototipado()

  const [licitacoes, setLicitacoes] = useState(LICITACOES)
  const [segmentos, setSegmentos] = useState(SEGMENTOS_INICIAIS)
  const [vista, setVista] = useState<Vista>("board")
  const [emEdicao, setEmEdicao] = useState<string[]>([])
  const [paraDescartar, setParaDescartar] = useState<Licitacao | null>(null)
  const [avisoResultado, setAvisoResultado] = useState(false)

  // ---- atualizações e histórico ----
  const [tela, setTela] = useState<"recomendadas" | "em-andamento">("em-andamento")
  const [atualizacoes, setAtualizacoes] = useState(ATUALIZACOES)
  const [historico, setHistorico] = useState(HISTORICO)
  /** Última vez que o usuário abriu cada licitação (o selo some a partir daí). */
  const [vistaEm, setVistaEm] = useState<Record<string, string>>({})
  const [aberta, setAberta] = useState<{ id: string; novas: string[] } | null>(null)

  const novasDe = useCallback(
    (id: string) => atualizacoesNovas(atualizacoes, id, vistaEm[id]),
    [atualizacoes, vistaEm]
  )
  const todas = useMemo(() => [...licitacoes, ...RECOMENDADAS], [licitacoes])
  const licitacaoAberta = aberta ? todas.find((l) => l.id === aberta.id) ?? null : null

  /** Página "Detalhes da licitação" aberta (null = lista). */
  const [pagina, setPagina] = useState<string | null>(null)
  const licitacaoDaPagina = pagina ? todas.find((l) => l.id === pagina) ?? null : null

  /** Abrir o sheet = ver: o selo some; as que eram novas ficam em "Novas" enquanto o sheet está aberto. */
  const abrirAtualizacoes = useCallback(
    (id: string) => {
      const novas = atualizacoesNovas(atualizacoes, id, vistaEm[id]).map((a) => a.id)
      setAberta({ id, novas })
      const ultima = atualizacoes.filter((a) => a.licitacaoId === id).reduce((m, a) => (a.quando > m ? a.quando : m), "")
      setVistaEm((v) => ({ ...v, [id]: ultima }))
    },
    [atualizacoes, vistaEm]
  )
  const contexto = useMemo(() => ({ novasDe, abrirAtualizacoes }), [novasDe, abrirAtualizacoes])

  function abrirLicitacao(l: Licitacao) {
    setPagina(l.id)
    window.scrollTo(0, 0)
  }

  function resolverConflito(a: Atualizacao, escolha: "manual" | "portal") {
    const data = escolha === "portal" ? a.depois! : a.conflito!.valorManual
    atualizar(a.licitacaoId, { dataEnvio: data })
    setAtualizacoes((xs) => xs.map((x) => (x.id === a.id ? { ...x, conflito: undefined } : x)))
    const evento: EventoHistorico = {
      id: `h-${Date.now()}`, licitacaoId: a.licitacaoId, origem: "pessoa", quando: "2026-05-21T18:00",
      autor: USUARIO.name,
      texto: escolha === "portal" ? "Aceitou a data do portal para o envio da proposta" : "Manteve a data editada à mão para o envio da proposta",
    }
    setHistorico((h) => [evento, ...h])
    toast(escolha === "portal" ? "Data do portal aplicada" : "Data editada mantida")
  }

  const atualizar = useCallback((id: string, patch: Partial<Licitacao>) => {
    setLicitacoes((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)))
  }, [])

  // segmento criado vai para o conjunto disponível para os outros cards
  const criarSegmento = useCallback((nome: string) => setSegmentos((s) => (s.includes(nome) ? s : [...s, nome])), [])

  // card com editor aberto não pode ser arrastado (nem os outros, enquanto o editor está aberto)
  const marcarEdicao = useCallback((id: string, ativa: boolean) => {
    setEmEdicao((ids) => {
      const tem = ids.includes(id)
      if (ativa === tem) return ids
      return ativa ? [...ids, id] : ids.filter((x) => x !== id)
    })
  }, [])

  /** Solta o card na coluna `etapa`, na posição `indice` entre os cards dela. */
  function mover(id: string, etapa: string, indice: number) {
    setLicitacoes((ls) => {
      const item = ls.find((l) => l.id === id)
      if (!item) return ls
      const resto = ls.filter((l) => l.id !== id)
      const movido = { ...item, etapa: etapa as EtapaId }
      const daColuna = resto.filter((l) => l.etapa === etapa)
      let posicao = resto.length
      if (indice < daColuna.length) posicao = resto.indexOf(daColuna[indice])
      else if (daColuna.length) posicao = resto.indexOf(daColuna[daColuna.length - 1]) + 1
      return [...resto.slice(0, posicao), movido, ...resto.slice(posicao)]
    })
  }

  const abrir = abrirLicitacao

  async function copiarLink(l: Licitacao) {
    try {
      await navigator.clipboard.writeText(linkDaLicitacao(l.id))
    } catch {
      // protótipo: sem permissão de área de transferência, só avisa
    }
    toast("Link copiado", { icon: <LinkIcon className="size-4" /> })
  }

  function descartar(l: Licitacao) {
    const indice = licitacoes.findIndex((x) => x.id === l.id)
    setLicitacoes((ls) => ls.filter((x) => x.id !== l.id))
    toast("Licitação descartada", {
      description: `Edital ${l.codigoEdital}`,
      icon: <Trash2Icon className="size-4" />,
      duration: 5000,
      action: {
        label: "Desfazer",
        onClick: () =>
          setLicitacoes((ls) => (ls.some((x) => x.id === l.id) ? ls : [...ls.slice(0, indice), l, ...ls.slice(indice)])),
      },
    })
  }

  const propsDoCard = {
    segmentosDisponiveis: segmentos,
    onCriarSegmento: criarSegmento,
  }

  return (
    <NovasContext.Provider value={contexto}>
    <AppShell
      workspace={WORKSPACE}
      groups={menuDaTela(tela, (t) => {
        setTela(t)
        setPagina(null)
      })}
      user={USUARIO}
      header={
        <Breadcrumb>
          <BreadcrumbList className="text-[13px]">
            <BreadcrumbItem>
              <BreadcrumbLink href="#" data-nao-prototipado>
                Licitações
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {licitacaoDaPagina ? (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <button type="button" onClick={() => setPagina(null)}>
                      {tela === "recomendadas" ? "Recomendadas" : "Em andamento"}
                    </button>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-medium">Detalhes da licitação - {licitacaoDaPagina.id}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            ) : (
              <BreadcrumbItem>
                <BreadcrumbPage className="font-medium">{tela === "recomendadas" ? "Recomendadas" : "Em andamento"}</BreadcrumbPage>
              </BreadcrumbItem>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      }
    >
      {licitacaoDaPagina ? (
        <PaginaDaLicitacao licitacao={licitacaoDaPagina} />
      ) : tela === "recomendadas" ? (
        <VistaRecomendadas licitacoes={RECOMENDADAS} onAbrir={abrir} />
      ) : (
      <>
      <h1 className="sr-only">Licitações em andamento</h1>

      <Tabs
        value={vista}
        onValueChange={(v) => setVista(v as Vista)}
        className="h-[calc(100svh-4rem)] min-h-0 gap-0"
      >
        {/* Barra de visualizações: abas à esquerda, ações à direita */}
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 px-4 pt-4">
          <TabsList aria-label="Visualização" className="h-9.5">
            {VISTAS.map((v) => (
              <TabsTrigger key={v.id} value={v.id} className="px-2.5 text-[13px]">
                {v.rotulo}
                <span className="text-xs font-normal text-muted-foreground tabular-nums">{licitacoes.length}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex flex-wrap items-center gap-2">
          <div role="toolbar" aria-label="Ações da visualização" className="flex items-center gap-0.5 rounded-lg bg-muted p-[3px]">
            <BotaoDaBarra data-nao-prototipado>
              Filtrar
              <Badge className="h-4.5 min-w-4.5 bg-foreground px-1.5 text-[11px] text-background tabular-nums">
                1<span className="sr-only"> filtro aplicado</span>
              </Badge>
            </BotaoDaBarra>
            <BotaoDaBarra data-nao-prototipado>Ordenar</BotaoDaBarra>
            <BotaoDaBarra data-nao-prototipado>Modo de visualização</BotaoDaBarra>
            <BotaoDaBarra data-nao-prototipado>
              <SearchIcon data-icon="inline-start" />
              Buscar
            </BotaoDaBarra>
          </div>
          </div>
        </div>

        <TabsContent value="board" className="min-h-0">
          <Kanban
            aria-label="Board kanban"
            columns={ETAPAS.map((e) => ({
              id: e.id,
              title: e.rotulo,
              indicatorClassName: e.cor,
              items: licitacoes.filter((l) => l.etapa === e.id),
            }))}
            getItemId={(l) => l.id}
            onMove={mover}
            dragDisabled={emEdicao.length > 0}
            emptyLabel="Nenhuma licitação nesta etapa."
            renderItem={(l, { dragging }) => (
              <CardKanban
                licitacao={l}
                onChange={(patch) => atualizar(l.id, patch)}
                onAbrir={() => abrir(l)}
                onCopiarLink={() => copiarLink(l)}
                onDescartar={() => setParaDescartar(l)}
                onEdicao={marcarEdicao}
                arrastando={dragging}
                {...propsDoCard}
              />
            )}
          />
        </TabsContent>

        <TabsContent value="tabela" className="min-h-0 p-4">
          <VistaTabela
            licitacoes={licitacoes}
            onChange={atualizar}
            onAbrir={abrir}
            onCopiarLink={copiarLink}
            onDescartar={setParaDescartar}
            onResultadoBloqueado={() => setAvisoResultado(true)}
            {...propsDoCard}
          />
        </TabsContent>

        <TabsContent value="calendario" className="min-h-0 p-4">
          <VistaCalendario
            licitacoes={licitacoes}
            onChange={atualizar}
            onAbrir={abrir}
            onCopiarLink={copiarLink}
            onDescartar={setParaDescartar}
            {...propsDoCard}
          />
        </TabsContent>
      </Tabs>
      </>
      )}

      <Detalhe
        licitacao={licitacaoAberta}
        atualizacoes={licitacaoAberta ? atualizacoes.filter((a) => a.licitacaoId === licitacaoAberta.id).sort((a, b) => b.quando.localeCompare(a.quando)) : []}
        historico={licitacaoAberta ? historico.filter((h) => h.licitacaoId === licitacaoAberta.id).sort((a, b) => b.quando.localeCompare(a.quando)) : []}
        novasIds={aberta?.novas ?? []}
        onFechar={() => setAberta(null)}
        onResolverConflito={resolverConflito}
      />

      {/* Descartar: pede confirmação; o aviso depois permite desfazer */}
      <AlertDialog open={!!paraDescartar} onOpenChange={(open) => !open && setParaDescartar(null)}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Descartar licitação?</AlertDialogTitle>
            <AlertDialogDescription>
              O edital {paraDescartar?.codigoEdital} sai das licitações em andamento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => paraDescartar && descartar(paraDescartar)}>
              Descartar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Resultado fora de "Resultados Finais" (a coluna da tabela é sempre clicável) */}
      <Dialog open={avisoResultado} onOpenChange={setAvisoResultado}>
        <DialogContent className="sm:max-w-105">
          <DialogHeader>
            <DialogTitle>Definir resultado</DialogTitle>
            <DialogDescription className="text-foreground">
              Só é possível definir o resultado quando a licitação estiver na etapa{" "}
              <strong className="font-semibold">Resultados Finais</strong>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button>Entendi</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
    </NovasContext.Provider>
  )
}

/** Menu da sidebar: Recomendadas e Em andamento trocam de tela aqui mesmo; os outros mostram "não prototipada". */
function menuDaTela(tela: "recomendadas" | "em-andamento", ir: (t: "recomendadas" | "em-andamento") => void): AppShellGroup[] {
  return menuLicitacoes({ ativa: tela }).map((g) => ({
    ...g,
    items: g.items.map((item, i) => {
      const id = (["recomendadas", "salvos", "explorar", "em-andamento", "descartadas"] as TelaLicitacoes[])[i]
      if (id !== "recomendadas" && id !== "em-andamento") return { ...item, href: "#", "data-nao-prototipado": true }
      return {
        ...item,
        href: "#",
        onClick: (e: React.MouseEvent) => {
          e.preventDefault()
          ir(id)
        },
      }
    }),
  }))
}

function BotaoDaBarra({ className, ...props }: ComponentProps<typeof Button>) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("h-7.5 gap-1.5 px-2.5 text-[13px] hover:bg-background hover:shadow-xs", className)}
      {...props}
    />
  )
}
