// Salvos para depois + notificações (duplicado de Explorar licitações).
// Salvar para depois continua sendo um clique. O sino do card é separado: no primeiro
// clique configura quais atualizações avisar; ligado, mostra as atualizações daquela
// licitação (com Configurar e Desativar). Descartar desliga as notificações, a não ser
// que o usuário marque "Continuar recebendo atualizações" no diálogo de descarte.
// O sino da navbar abre a central de notificações com tudo junto.

import { useEffect, useRef, useState } from "react"
import {
  BellIcon,
  BellRingIcon,
  BookmarkIcon,
  BookmarkXIcon,
  RadioTowerIcon,
  CheckIcon,
  ClockIcon,
  FolderIcon,
  FolderXIcon,
  LinkIcon,
  PencilIcon,
  SearchIcon,
  Share2Icon,
  Trash2Icon,
} from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { AppShell, useAppShell } from "@/components/ui/app-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NotificationsCenterCount, notificationsCenterTabClassName, notificationsCenterTabsListClassName } from "@/components/ui/notifications-center"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { FilterChip, FilterChipGroup } from "@/components/ui/filter-chip"
import { LicitacaoCard, LicitacaoCardStatusButton, type LicitacaoCardIconActionProps } from "@/components/ui/licitacao-card"
import { SearchField, useSearchShortcut } from "@/components/ui/search-field"
import { Skeleton } from "@/components/ui/skeleton"
import { useNaoPrototipado } from "@/settle/nao-prototipado"
import { menuLicitacoes, SAUDACAO, USUARIO, WORKSPACE } from "@/settle/navegacao"

import { CentralDeNotificacoes } from "./CentralDeNotificacoes"
import type { EstadoDaLista } from "./ListaDeNotificacoes"
import { DialogoDeDescarte } from "./DialogoDeDescarte"
import { VERSAO } from "./versao"
import { SinoDaLicitacao } from "./SinoDaLicitacao"
import { AbrirArquivoContext, VisualizadorDeArquivo, type ArquivoAberto } from "./VisualizadorDeArquivo"
import {
  ESCOPOS,
  HOJE,
  LICITACOES,
  NOTIFICACOES,
  PRESETS_DATA,
  PROXIMAS_NOTIFICACOES,
  ROTULO_CURTO,
  TIPOS_DE_ATUALIZACAO,
  TODOS_OS_TIPOS,
  RESPONSAVEIS,
  SEGMENTOS_DO_CARD,
  VISUALIZACAO_INICIAL,
  EDITAIS_DA_ABA,
  VISUALIZACOES_INICIAIS,
  formatarData,
  lerData,
  normalizar,
  textoPadraoDeBusca,
  type Filtro,
  type Licitacao,
  type Notificacao,
  type TipoAtualizacao,
  type Visualizacao,
} from "./dados"

const DURACAO_SAIDA = 330 // ms: animação do card saindo da lista
const ATRASO_BUSCA = 450 // ms: simula a busca no servidor (mostra o esqueleto)
const OPCOES_DE_ESCOPO = ESCOPOS.map((e) => ({ value: e.chave, label: e.rotulo }))

type Tela = "explorar" | "salvos"
type AbaDeSalvos = "todas" | "novidades" | "notificando" | "guardadas"

function pertenceAVisualizacao(l: Licitacao, v: Visualizacao | undefined) {
  const editais = v && EDITAIS_DA_ABA[v.chave]
  return editais ? editais.includes(l.edital) : true
}

export default function App() {
  useNaoPrototipado()

  const [tela, setTela] = useState<Tela>("explorar")
  const [licitacoes, setLicitacoes] = useState(LICITACOES)
  const [abaSalvos, setAbaSalvos] = useState<AbaDeSalvos>("todas")
  const [destaque, setDestaque] = useState<string | null>(null)

  // sino da licitação (popover ancorado no botão clicado) e diálogo de descarte
  const [editando, setEditando] = useState<{ edital: string; ancora: HTMLElement } | null>(null)
  const [sinoAberto, setSinoAberto] = useState(false)
  const [arquivo, setArquivo] = useState<ArquivoAberto | null>(null)
  const [descartando, setDescartando] = useState<string | null>(null)

  // central de notificações
  const [notificacoes, setNotificacoes] = useState(NOTIFICACOES)
  const [centralAberta, setCentralAberta] = useState(false)
  const [estadoProto, setEstadoProto] = useState<EstadoDaLista>("normal")
  const [filtroEdital, setFiltroEdital] = useState<string | null>(null)
  const proxima = useRef(0)
  const [selecionadas, setSelecionadas] = useState<string[]>([])
  const [saindo, setSaindo] = useState<string[]>([])
  const timersSaida = useRef(new Map<string, number>())

  const [visualizacoes, setVisualizacoes] = useState(VISUALIZACOES_INICIAIS)
  const [ativa, setAtiva] = useState(VISUALIZACAO_INICIAL)

  const [buscaAberta, setBuscaAberta] = useState(false)
  const [consulta, setConsulta] = useState("")
  const [aplicada, setAplicada] = useState("")
  const [escopos, setEscopos] = useState<string[]>([])
  const [carregando, setCarregando] = useState(false)
  const timerBusca = useRef<number | undefined>(undefined)


  /* ---------------- filtragem ---------------- */

  const q = normalizar(aplicada.trim())
  const casaBusca = (l: Licitacao) => {
    if (!q) return true
    if (!escopos.length) return normalizar(textoPadraoDeBusca(l)).includes(q)
    return escopos.some((chave) => {
      const escopo = ESCOPOS.find((e) => e.chave === chave)
      return escopo ? normalizar(escopo.valor(l)).includes(q) : false
    })
  }
  const fila = licitacoes.filter((l) => !l.salvo && !l.descartada)
  const visualizacaoAtiva = visualizacoes.find((v) => v.chave === ativa)
  const visiveis = visualizacoes.filter((v) => !v.oculta)
  const contagens = Object.fromEntries(
    visualizacoes.map((v) => [v.chave, fila.filter((l) => pertenceAVisualizacao(l, v) && casaBusca(l)).length])
  )
  const listaExplorar = fila.filter((l) => pertenceAVisualizacao(l, visualizacaoAtiva) && casaBusca(l))
  const salvas = licitacoes.filter((l) => l.salvo && !l.descartada)
  const totalSalvos = salvas.length

  const naoLidasDe = (edital: string) => notificacoes.filter((n) => n.edital === edital && !n.lida).length
  const totalNaoLidas = notificacoes.filter((n) => !n.lida).length
  const FILTRO_SALVOS: Record<AbaDeSalvos, (l: Licitacao) => boolean> = {
    todas: () => true,
    novidades: (l) => naoLidasDe(l.edital) > 0,
    notificando: (l) => l.alertas.length > 0,
    guardadas: (l) => !l.alertas.length,
  }
  const listaSalvos = salvas
    .filter(FILTRO_SALVOS[abaSalvos])
    // com novidade primeiro
    .sort((a, b) => Number(naoLidasDe(b.edital) > 0) - Number(naoLidasDe(a.edital) > 0))
  const lista = tela === "explorar" ? listaExplorar : listaSalvos
  const editandoLicitacao = editando ? (licitacoes.find((l) => l.edital === editando.edital) ?? null) : null
  const descartandoLicitacao = descartando ? (licitacoes.find((l) => l.edital === descartando) ?? null) : null

  /* ---------------- abas ---------------- */

  function alterarFiltro(indice: number, filtro: Filtro) {
    setVisualizacoes((vs) =>
      vs.map((v) => (v.chave === ativa ? { ...v, filtros: v.filtros.map((f, i) => (i === indice ? filtro : f)) } : v))
    )
  }

  /* ---------------- busca ---------------- */

  function agendarBusca(texto: string) {
    window.clearTimeout(timerBusca.current)
    if (!texto.trim()) {
      setCarregando(false)
      setAplicada("")
      return
    }
    setCarregando(true)
    timerBusca.current = window.setTimeout(() => {
      setCarregando(false)
      setAplicada(texto)
    }, ATRASO_BUSCA)
  }

  function abrirBusca() {
    setBuscaAberta(true)
  }

  function fecharBusca() {
    window.clearTimeout(timerBusca.current)
    setBuscaAberta(false)
    setConsulta("")
    setEscopos([])
    setCarregando(false)
    setAplicada("")
  }

  function alterarEscopos(novos: string[]) {
    setEscopos(novos)
    agendarBusca(consulta)
  }

  // atalho "/" abre a busca
  useSearchShortcut(abrirBusca, { enabled: !buscaAberta })

  /* ---------------- salvar para depois ---------------- */

  function aplicar(edital: string, mudanca: Partial<Licitacao>) {
    const timer = timersSaida.current.get(edital)
    if (timer) window.clearTimeout(timer)
    timersSaida.current.delete(edital)
    setSaindo((s) => s.filter((e) => e !== edital))
    setLicitacoes((ls) => ls.map((l) => (l.edital === edital ? { ...l, ...mudanca } : l)))
  }

  // o card sai da lista atual (fade + deslize + recolhe) e só então muda de fila
  function sairDaLista(edital: string, mudanca: Partial<Licitacao>) {
    setSaindo((s) => [...s, edital])
    timersSaida.current.set(
      edital,
      window.setTimeout(() => aplicar(edital, mudanca), DURACAO_SAIDA)
    )
  }

  function alternarSalvo(l: Licitacao) {
    if (saindo.includes(l.edital)) return
    const salvar = !l.salvo
    sairDaLista(l.edital, { salvo: salvar, salvaEm: salvar ? "19/06/2026" : undefined })
    toast(salvar ? "Salvo para depois" : "Removido de Salvos para depois", {
      icon: salvar ? (
        <BookmarkIcon className="size-4 fill-current text-primary" />
      ) : (
        <BookmarkXIcon className="size-4 text-muted-foreground" />
      ),
      action: { label: "Desfazer", onClick: () => aplicar(l.edital, { salvo: l.salvo, salvaEm: l.salvaEm }) },
    })
  }

  /* ---------------- sino da licitação ---------------- */

  function abrirSino(l: Licitacao, ancora: HTMLElement) {
    if (saindo.includes(l.edital)) return
    setEditando({ edital: l.edital, ancora })
    setSinoAberto(true)
  }

  function ativarNotificacoes(l: Licitacao, alertas: TipoAtualizacao[]) {
    const eraLigado = l.alertas.length > 0
    aplicar(l.edital, { alertas })
    if (!eraLigado) {
      setSinoAberto(false)
      toast("Notificações ativadas", {
        description: `Edital ${l.edital}. Avisaremos no sino e na central.`,
        icon: <BellRingIcon className="size-4 text-primary" />,
        action: { label: "Desfazer", onClick: () => aplicar(l.edital, { alertas: [] }) },
      })
    } else {
      toast("Notificações atualizadas", { icon: <BellRingIcon className="size-4 text-primary" /> })
    }
  }

  function desativarNotificacoes(l: Licitacao) {
    setSinoAberto(false)
    aplicar(l.edital, { alertas: [] })
    toast("Notificações desativadas", {
      description: `Edital ${l.edital}`,
      icon: <BellIcon className="size-4 text-muted-foreground" />,
      action: { label: "Desfazer", onClick: () => aplicar(l.edital, { alertas: l.alertas }) },
    })
  }

  function fecharSino(lidas: string[]) {
    setSinoAberto(false)
    if (lidas.length) setNotificacoes((ns) => ns.map((n) => (lidas.includes(n.id) ? { ...n, lida: true } : n)))
  }

  /* ---------------- descarte ---------------- */

  function descartar(l: Licitacao, continuarNotificando: boolean) {
    setDescartando(null)
    const alertas = continuarNotificando ? (l.alertas.length ? l.alertas : TODOS_OS_TIPOS) : []
    sairDaLista(l.edital, { descartada: true, alertas })
    toast("Licitação descartada", {
      description: continuarNotificando
        ? "Você continua recebendo as atualizações desta licitação."
        : l.alertas.length
          ? "As notificações desta licitação foram desativadas."
          : undefined,
      icon: <Trash2Icon className="size-4 text-muted-foreground" />,
      action: { label: "Desfazer", onClick: () => aplicar(l.edital, { descartada: false, alertas: l.alertas }) },
    })
  }

  /* ---------------- notificações ---------------- */

  function abrirCentral(edital: string | null = null) {
    setFiltroEdital(edital)
    setCentralAberta(true)
  }

  function marcarLida(id: string, lida: boolean) {
    setNotificacoes((ns) => ns.map((n) => (n.id === id ? { ...n, lida } : n)))
  }

  function marcarTodasLidas() {
    setNotificacoes((ns) => ns.map((n) => (!filtroEdital || n.edital === filtroEdital ? { ...n, lida: true } : n)))
  }

  function verLicitacao(n: Notificacao) {
    marcarLida(n.id, true)
    const l = licitacoes.find((x) => x.edital === n.edital)
    if (l?.descartada) {
      toast("Esta página ainda não foi prototipada.", { description: "A licitação está em Descartadas." })
      return
    }
    setCentralAberta(false)
    if (!l?.salvo) {
      setTela("explorar")
      setAtiva("Todas")
    } else {
      setTela("salvos")
    }
    setAbaSalvos("todas")
    setDestaque(n.edital)
    window.setTimeout(() => {
      document.getElementById(`licitacao-${n.edital}`)?.scrollIntoView({ behavior: "smooth", block: "center" })
    }, 250)
    window.setTimeout(() => setDestaque(null), 2600)
  }

  // Protótipo: simula o portal publicando uma atualização. Só vira notificação
  // se o sino da licitação estiver ligado para aquele tipo (inclusive descartadas que o usuário pediu para acompanhar).
  function simularAtualizacao() {
    const candidatas = PROXIMAS_NOTIFICACOES.filter((p) =>
      licitacoes.some((l) => l.edital === p.edital && l.alertas.includes(p.tipo))
    )
    const escolhida = candidatas[proxima.current % Math.max(candidatas.length, 1)]
    proxima.current += 1
    if (!escolhida) {
      toast("O portal publicou mudanças, mas nenhuma é de um tipo que você acompanha", {
        icon: <RadioTowerIcon className="size-4 text-muted-foreground" />,
      })
      return
    }
    const nova: Notificacao = { ...escolhida, id: `sim-${Date.now()}`, lida: false }
    setNotificacoes((ns) => [nova, ...ns])
    setLicitacoes((ls) => ls.map((l) => (l.edital === nova.edital ? { ...l, atualizada: "19/06/2026" } : l)))
    toast(`${ROTULO_CURTO[nova.tipo]} · Edital ${nova.edital}`, {
      description: nova.titulo,
      icon: <BellRingIcon className="size-4 text-primary" />,
      action: { label: "Ver", onClick: () => abrirCentral(nova.edital) },
    })
  }

  useEffect(() => {
    const timers = timersSaida.current
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [])

  /* ---------------- tela ---------------- */

  const quantidade = (n: number) => `${n} ${n === 1 ? "licitação" : "licitações"}`
  const mensagemResultado = carregando
    ? "Buscando licitações…"
    : q
      ? `Encontramos ${quantidade(lista.length)} com seus filtros`
      : tela === "salvos"
        ? `${quantidade(lista.length)} em Salvos para depois`
        : `${quantidade(lista.length)} em ${visualizacaoAtiva?.rotulo ?? ""}`

  const filtrosAtivos = visualizacaoAtiva?.filtros ?? []

  return (
    <AbrirArquivoContext.Provider value={setArquivo}>
    <AppShell
      workspace={WORKSPACE}
      groups={menuDaTela(tela, totalSalvos, (t) => {
        setTela(t)
        setSelecionadas([])
        window.scrollTo({ top: 0 })
      })}
      user={USUARIO}
      header={
        <div className="flex flex-1 items-center gap-3">
          <span className="text-[15px] font-semibold">{SAUDACAO}</span>
          <span className="rounded-md bg-foreground/10 px-1.5 py-0.5 text-xs font-semibold tabular-nums text-muted-foreground" title="Atualização do protótipo">
            V{VERSAO}
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            className="relative ml-auto"
            aria-label={totalNaoLidas ? `Notificações: ${totalNaoLidas} não lidas` : "Notificações"}
            onClick={() => abrirCentral()}
          >
            <BellIcon />
            {totalNaoLidas > 0 && (
              <span
                aria-hidden
                className="absolute -top-0.5 -right-0.5 flex h-4.25 min-w-4.25 items-center justify-center rounded-full bg-destructive px-1 text-[10px] leading-none font-bold text-white ring-2 ring-background"
              >
                {totalNaoLidas}
              </span>
            )}
          </Button>
        </div>
      }
      hideHeaderOnScroll
    >
      <div className="mx-auto max-w-347 px-6 pt-6 pb-16">
        {tela === "salvos" ? (
          <h1 className="sr-only">Salvos para depois</h1>
        ) : (
          <header className="mb-2">
            <p className="text-3xl font-normal">Encontramos {quantidade(contagens["Ativas"] ?? 0).replace("licitação", "licitação ativa").replace("licitações", "licitações ativas")}</p>
            <h1 className="mt-1.5 text-5xl leading-[1.04] font-bold tracking-[-0.5px]">Selecione quais deseja analisar</h1>
          </header>
        )}
        <p className="sr-only" aria-live="polite">
          {mensagemResultado}
        </p>

        {tela === "salvos" ? (
          <BarraDeSalvos
            aba={abaSalvos}
            onAba={setAbaSalvos}
            contagens={{
              todas: salvas.length,
              novidades: salvas.filter(FILTRO_SALVOS.novidades).length,
              notificando: salvas.filter(FILTRO_SALVOS.notificando).length,
              guardadas: salvas.filter(FILTRO_SALVOS.guardadas).length,
            }}
            onSimular={simularAtualizacao}
            estado={estadoProto}
            onEstado={setEstadoProto}
          />
        ) : (
        /* barra sticky: gruda logo abaixo da navbar e sobe junto quando ela se esconde */
        <div className="sticky top-16 z-10 mb-2 bg-background py-3.5 transition-transform duration-250 ease-out group-data-[header-hidden=true]/app-shell:-translate-y-16">
          <div className={cn("flex items-center justify-between gap-x-4 gap-y-2 max-sm:flex-wrap", buscaAberta && "max-[1040px]:flex-wrap")}>
            <Tabs value={ativa} onValueChange={setAtiva} className="min-w-0">
              <TabsList aria-label="Abas de licitações" className="h-auto max-w-full overflow-x-auto">
                {visiveis.map((v) => (
                  <TabsTrigger
                    key={v.chave}
                    value={v.chave}
                    className="h-7.5 flex-none gap-1.5 rounded-lg px-3 hover:bg-background/60 hover:text-foreground"
                  >
                    <span>{v.rotulo}</span>
                    <span className="rounded-md bg-foreground/10 px-1.5 py-px text-xs leading-4 font-medium text-foreground tabular-nums">
                      {contagens[v.chave]}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* grupo segmentado de ações */}
            <div
              className={cn(
                "flex flex-none items-center rounded-lg bg-foreground/10",
                buscaAberta ? "max-[1040px]:basis-full" : "overflow-hidden"
              )}
            >
              <Button
                variant="ghost"
                size="sm"
                data-nao-prototipado
                className={cn(
                  "h-8 rounded-none px-3 text-foreground hover:bg-foreground/5",
                  buscaAberta && "max-[1040px]:hidden"
                )}
              >
                Filtrar
                {filtrosAtivos.length > 0 && (
                  <span className="rounded-full bg-muted px-1.5 text-xs leading-4.5 font-normal tabular-nums">
                    {filtrosAtivos.length}
                  </span>
                )}
              </Button>
              {["Ordenar", "Exportar"].map((r) => (
                <Button
                  key={r}
                  variant="ghost"
                  size="sm"
                  data-nao-prototipado
                  className={cn("h-8 rounded-none px-3 text-foreground hover:bg-foreground/5", buscaAberta && "max-[1040px]:hidden")}
                >
                  {r}
                </Button>
              ))}
              {buscaAberta ? (
                <SearchField
                  autoFocus
                  value={consulta}
                  onValueChange={(texto) => {
                    setConsulta(texto)
                    agendarBusca(texto)
                  }}
                  scopes={OPCOES_DE_ESCOPO}
                  selectedScopes={escopos}
                  onSelectedScopesChange={alterarEscopos}
                  onClose={fecharBusca}
                  labels={{ input: "Buscar licitações" }}
                  className="w-auto min-w-75 flex-1 rounded-lg border-0 bg-transparent shadow-none dark:bg-transparent"
                />
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 rounded-none px-3 text-foreground hover:bg-foreground/5"
                  onClick={abrirBusca}
                >
                  <SearchIcon data-icon="inline-start" />
                  Buscar
                </Button>
              )}
            </div>
          </div>

          <SelosDeFiltro key={ativa} filtros={filtrosAtivos} onAlterar={alterarFiltro} />
        </div>
        )}

        <section aria-label="Licitações" aria-busy={carregando}>
          {carregando ? (
            <div className="flex flex-col gap-4">
              <CardEsqueleto />
              <CardEsqueleto />
            </div>
          ) : lista.length ? (
            <ul className="flex flex-col gap-4">
              {lista.map((l) => {
                const saindoAgora = saindo.includes(l.edital)
                // durante a saída o marcador já mostra o novo estado
                const salvo = l.salvo !== saindoAgora
                return (
                  <li
                    key={l.edital}
                    id={`licitacao-${l.edital}`}
                    className={cn(
                      "grid scroll-mt-40 rounded-lg transition-all duration-300 ease-out",
                      destaque === l.edital && "ring-2 ring-primary ring-offset-4 ring-offset-background",
                      saindoAgora
                        ? "pointer-events-none translate-x-10 scale-[.98] grid-rows-[0fr] opacity-0"
                        : "grid-rows-[1fr]"
                    )}
                  >
                    <div className={cn("min-h-0", saindoAgora && "overflow-hidden")}>
                      <CardDaLicitacao
                        licitacao={l}
                        salvo={salvo}
                        selecionada={selecionadas.includes(l.edital)}
                        onSelecionar={(marcada) =>
                          setSelecionadas((s) => (marcada ? [...s, l.edital] : s.filter((e) => e !== l.edital)))
                        }
                        naoLidas={naoLidasDe(l.edital)}
                        naTelaDeSalvos={tela === "salvos"}
                        onAlternarSalvo={() => alternarSalvo(l)}
                        onAbrirSino={(ancora) => abrirSino(l, ancora)}
                        onDescartar={() => setDescartando(l.edital)}
                        onVerNovidades={() => abrirCentral(l.edital)}
                      />
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
            <Empty className="border border-dashed bg-card px-4 py-14">
              <EmptyHeader>
                {q ? (
                  <>
                    <EmptyTitle className="text-[15px] font-semibold">Nenhuma licitação encontrada</EmptyTitle>
                    <EmptyDescription>
                      Não há resultados para “<span className="font-semibold text-foreground">{aplicada.trim()}</span>”.
                      Tente outro termo.
                    </EmptyDescription>
                  </>
                ) : tela === "salvos" ? (
                  <>
                    <EmptyTitle className="text-[15px] font-semibold">
                      {abaSalvos === "todas" ? "Nenhuma licitação salva" : "Nenhuma licitação nesta aba"}
                    </EmptyTitle>
                    <EmptyDescription>
                      {abaSalvos === "novidades"
                        ? "Não há atualizações não lidas nas licitações que você acompanha."
                        : "Use o marcador no card para guardar uma licitação e escolher se quer receber atualizações."}
                    </EmptyDescription>
                  </>
                ) : (
                  <>
                    <EmptyTitle className="text-[15px] font-semibold">Nenhuma licitação nesta visualização</EmptyTitle>
                    <EmptyDescription>As licitações salvas para depois ficam em Salvos para depois.</EmptyDescription>
                  </>
                )}
              </EmptyHeader>
            </Empty>
          )}
        </section>
      </div>

      <SinoDaLicitacao
        aberto={sinoAberto}
        licitacao={editandoLicitacao}
        ancora={editando?.ancora ?? null}
        notificacoes={editandoLicitacao ? notificacoes.filter((n) => n.edital === editandoLicitacao.edital) : []}
        onFechar={fecharSino}
        onAtivar={(tipos) => editandoLicitacao && ativarNotificacoes(editandoLicitacao, tipos)}
        onDesativar={() => editandoLicitacao && desativarNotificacoes(editandoLicitacao)}
        estado={estadoProto}
        onLida={marcarLida}
      />

      <DialogoDeDescarte
        licitacao={descartandoLicitacao}
        onFechar={() => setDescartando(null)}
        onDescartar={({ continuarNotificando }) =>
          descartandoLicitacao && descartar(descartandoLicitacao, continuarNotificando)
        }
      />

      <CentralDeNotificacoes
        aberta={centralAberta}
        onAbertaChange={setCentralAberta}
        notificacoes={notificacoes}
        licitacoes={licitacoes}
        estado={estadoProto}
        filtroEdital={filtroEdital}
        onLimparFiltro={() => setFiltroEdital(null)}
        onLida={marcarLida}
        onTodasLidas={marcarTodasLidas}
        onVerLicitacao={verLicitacao}
      />
    </AppShell>
    <VisualizadorDeArquivo
      visualizacao={arquivo}
      onIndice={(indice) => setArquivo((v) => (v ? { ...v, indice } : v))}
      onFechar={() => setArquivo(null)}
    />
    </AbrirArquivoContext.Provider>
  )
}

/* ------------------------------------------------------------------ */
/* Card                                                                */
/* ------------------------------------------------------------------ */

function CardDaLicitacao({
  licitacao: l,
  salvo,
  selecionada,
  naoLidas,
  naTelaDeSalvos,
  onSelecionar,
  onAlternarSalvo,
  onAbrirSino,
  onDescartar,
  onVerNovidades,
}: {
  licitacao: Licitacao
  salvo: boolean
  selecionada: boolean
  naoLidas: number
  naTelaDeSalvos: boolean
  onSelecionar: (marcada: boolean) => void
  onAlternarSalvo: () => void
  onAbrirSino: (ancora: HTMLElement) => void
  onDescartar: () => void
  onVerNovidades: () => void
}) {
  const arquivos = l.arquivos ?? 0
  const notificando = l.alertas.length > 0
  const acoesDeIcone: (LicitacaoCardIconActionProps & { id: string })[] = [
    {
      id: "salvar",
      label: salvo ? "Remover de Salvos para depois" : "Salvar para depois",
      icon: <BookmarkIcon className={cn(salvo && "fill-current")} />,
      pressed: salvo,
      onClick: onAlternarSalvo,
    },
    {
      id: "notificar",
      label: notificando
        ? naoLidas
          ? `Notificações: ${naoLidas} ${naoLidas === 1 ? "atualização nova" : "atualizações novas"}`
          : "Notificações ativadas: ver atualizações"
        : "Ativar notificações",
      icon: notificando ? <BellRingIcon /> : <BellIcon />,
      pressed: notificando,
      count: naoLidas || undefined,
      "aria-haspopup": "dialog",
      onClick: (e) => onAbrirSino(e.currentTarget),
    },
    {
      id: "link",
      label: "Copiar link",
      icon: <LinkIcon />,
      onClick: () => toast("Link do edital copiado", { icon: <CheckIcon className="size-4 text-success" /> }),
    },
    { id: "compartilhar", label: "Compartilhar", icon: <Share2Icon />, "data-nao-prototipado": true },
    l.semAnexo
      ? {
          id: "arquivos",
          label: "Sem anexo: este edital ainda não possui arquivo",
          icon: <FolderXIcon />,
          tone: "warning",
          "data-nao-prototipado": true,
        }
      : {
          id: "arquivos",
          label: `${arquivos} ${arquivos === 1 ? "arquivo anexado" : "arquivos anexados"}`,
          icon: <FolderIcon />,
          count: arquivos,
          "data-nao-prototipado": true,
        },
  ]

  return (
    <LicitacaoCard
      edital={l.edital}
      selectable
      selected={selecionada}
      onSelectedChange={onSelecionar}
      actions={
        <>
          <Button variant="outline" className="px-3.5 shadow-none" onClick={onDescartar}>
            Descartar
          </Button>
          <Button className="px-3.5" data-nao-prototipado>
            Enviar para análise
          </Button>
        </>
      }
      status={
        <LicitacaoCardStatusButton data-nao-prototipado>
          <PencilIcon data-icon="inline-start" />
          Em disputa ou Homologação
        </LicitacaoCardStatusButton>
      }
      avatars={RESPONSAVEIS}
      addAvatarProps={{ "data-nao-prototipado": true }}
      iconActions={acoesDeIcone}
      highlight={
        naTelaDeSalvos ? (
          <LinhaDeAcompanhamento licitacao={l} naoLidas={naoLidas} onVerNovidades={onVerNovidades} />
        ) : undefined
      }
      segments={SEGMENTOS_DO_CARD}
      orgao={l.orgao}
      orgaoTag="ME - EPP"
      objeto={l.objeto}
      valor={`R$ ${l.valor}`}
      metaAside={[
        [
          { label: "Adicionada", value: l.adicionada },
          { label: "Atualizada", value: l.atualizada },
        ],
        [
          {
            label: "Envio da proposta",
            value: l.envio,
            tone: "warning",
            icon: <ClockIcon aria-hidden />,
            title: `Prazo de envio da proposta: ${l.envio}`,
          },
        ],
      ]}
      meta={[
        { label: "ID", value: l.id },
        { label: "UASG", value: "–" },
        { label: "Modalidade", value: l.modalidade },
        { label: "Julgamento", value: l.julgamento },
        { label: "Estado", value: l.estado },
        { label: "Cidade", value: l.cidade },
        { label: "Habitantes", value: l.habitantes },
        { label: "CAPAG Estadual", value: "–" },
        { label: "CAPAG Municipal", value: "–" },
        { label: "Portal de disputa", value: l.portal },
      ]}
    />
  )
}

/** Na tela de Salvos: o que a licitação acompanha e as atualizações não lidas. */
function LinhaDeAcompanhamento({
  licitacao: l,
  naoLidas,
  onVerNovidades,
}: {
  licitacao: Licitacao
  naoLidas: number
  onVerNovidades: () => void
}) {
  const tipos = TIPOS_DE_ATUALIZACAO.filter((t) => l.alertas.includes(t.chave))
  const todos = tipos.length === TIPOS_DE_ATUALIZACAO.length
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-md bg-muted/60 px-2.5 py-1.5 text-[13px]">
      {tipos.length ? (
        <span className="flex min-w-0 items-center gap-1.5">
          <BellRingIcon aria-hidden className="size-3.5 text-primary" />
          <span className="font-semibold">Notificações:</span>
          <span className="text-muted-foreground">
            {todos ? "todas as atualizações" : tipos.map((t) => ROTULO_CURTO[t.chave]).join(", ")}
          </span>
        </span>
      ) : (
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <BookmarkIcon aria-hidden className="size-3.5" />
          Notificações desativadas
        </span>
      )}
      {l.salvaEm && <span className="text-xs text-muted-foreground">Salva em {l.salvaEm}</span>}
      {naoLidas > 0 && (
        <Button size="xs" variant="outline" className="ml-auto border-warning/40 bg-warning/10 text-warning-strong shadow-none hover:bg-warning/20" onClick={onVerNovidades}>
          <BellRingIcon data-icon="inline-start" />
          {naoLidas} {naoLidas === 1 ? "atualização nova" : "atualizações novas"}
        </Button>
      )}
    </div>
  )
}

const MOSTRAR_CONTROLES_DE_PROTOTIPO = false

/** Abas da tela Salvos para depois. */
function BarraDeSalvos({
  aba,
  onAba,
  contagens,
  onSimular,
  estado,
  onEstado,
}: {
  aba: AbaDeSalvos
  onAba: (aba: AbaDeSalvos) => void
  contagens: Record<AbaDeSalvos, number>
  onSimular: () => void
  estado: EstadoDaLista
  onEstado: (e: EstadoDaLista) => void
}) {
  const ABAS: { valor: AbaDeSalvos; rotulo: string }[] = [
    { valor: "todas", rotulo: "Todas" },
    { valor: "novidades", rotulo: "Com atualizações" },
    { valor: "notificando", rotulo: "Com notificações" },
    { valor: "guardadas", rotulo: "Sem notificações" },
  ]
  return (
    <div className="sticky top-16 z-10 mb-2 flex flex-wrap items-center justify-between gap-3 bg-background py-3.5 transition-transform duration-250 ease-out group-data-[header-hidden=true]/app-shell:-translate-y-16">
      <Tabs value={aba} onValueChange={(v) => onAba(v as AbaDeSalvos)}>
        <TabsList aria-label="Filtrar salvos" className={notificationsCenterTabsListClassName}>
          {ABAS.map((a) => (
            <TabsTrigger key={a.valor} value={a.valor} className={notificationsCenterTabClassName}>
              {a.rotulo}
              <NotificationsCenterCount>{contagens[a.valor]}</NotificationsCenterCount>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {/* Controles só de protótipo (estado da lista e simular atualização): escondidos para a
          apresentação. Para usar, troque MOSTRAR_CONTROLES_DE_PROTOTIPO para true. */}
      {MOSTRAR_CONTROLES_DE_PROTOTIPO && (
      <div className="ml-auto flex flex-wrap items-center gap-2">
      <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
        Estado das notificações
        <select
          value={estado}
          onChange={(e) => onEstado(e.target.value as EstadoDaLista)}
          className="h-8 rounded-md border bg-background px-2 text-[13px] text-foreground"
        >
          <option value="normal">Normal</option>
          <option value="vazio">Vazio</option>
          <option value="erro">Erro</option>
        </select>
      </label>
      <Button variant="outline" size="sm" className="shadow-none" onClick={onSimular}>
        <RadioTowerIcon data-icon="inline-start" />
        Simular atualização do portal
        <Badge variant="secondary" className="ml-1 h-4.5 px-1.5 text-[10px]">
          Protótipo
        </Badge>
      </Button>
      </div>
      )}
    </div>
  )
}

/** Menu da sidebar: Explorar e Salvos trocam de tela aqui mesmo; os outros itens mostram "não prototipada". */
function menuDaTela(tela: Tela, salvos: number, ir: (t: Tela) => void) {
  const alvo: Record<string, Tela> = { Recomendadas: "explorar", "Salvos para depois": "salvos" }
  return menuLicitacoes({ salvos }).map((grupo) => ({
    ...grupo,
    items: grupo.items.map((item) => {
      const destino = alvo[item.label]
      // o resto do menu não sai deste projeto (antes Recomendadas levava a outro protótipo)
      if (!destino) return { ...item, href: "#", onClick: undefined, "data-nao-prototipado": true }
      const { "data-nao-prototipado": _ignorado, ...resto } = item as typeof item & { "data-nao-prototipado"?: boolean }
      return {
        ...resto,
        href: "#",
        active: destino === tela,
        onClick: (e: React.MouseEvent) => {
          e.preventDefault()
          if (destino !== tela) ir(destino)
        },
      }
    }),
  }))
}

/** Filtros salvos na visualização, como selos ("Órgão: 2 selecionadas ▾"). */
function SelosDeFiltro({ filtros, onAlterar }: { filtros: Filtro[]; onAlterar: (indice: number, filtro: Filtro) => void }) {
  const { headerHidden } = useAppShell()
  if (!filtros.length) return null

  return (
    <FilterChipGroup
      aria-label="Filtros da visualização"
      className={cn(
        "mt-3 max-h-15 transition-[max-height,opacity,margin] duration-250 ease-out",
        // rolando para baixo (navbar escondida): os selos recolhem
        headerHidden && "pointer-events-none mt-0 max-h-0 overflow-hidden opacity-0"
      )}
    >
      {filtros.map((f, i) =>
        f.tipo === "data" ? (
          <FilterChip
            key={f.rotulo}
            type="date"
            closeOnScroll
            label={f.rotulo}
            presets={PRESETS_DATA[f.modo].map((p) => ({ value: p.chave, label: p.rotulo }))}
            today={HOJE}
            disabled={f.modo === "passado" ? { after: HOJE } : { before: HOJE }}
            formatDate={formatarData}
            value={{ preset: f.valor.preset, date: f.valor.data ? lerData(f.valor.data) : undefined }}
            onValueChange={(v) =>
              onAlterar(i, { ...f, valor: v.preset ? { preset: v.preset } : { data: v.date && formatarData(v.date) } })
            }
          />
        ) : (
          <FilterChip
            key={f.rotulo}
            closeOnScroll
            label={f.rotulo}
            options={f.opcoes}
            value={f.valor}
            onValueChange={(valor) => onAlterar(i, { ...f, valor })}
          />
        )
      )}
    </FilterChipGroup>
  )
}

// Esqueleto do card enquanto a busca "carrega"
function CardEsqueleto() {
  return (
    <Card aria-hidden className="gap-3.5 rounded-lg py-4.5 [--card-spacing:--spacing(4.5)]">
      <CardHeader className="flex flex-wrap items-center gap-2.5">
        <Skeleton className="size-4.5" />
        <Skeleton className="h-4.5 w-37.5" />
        <Skeleton className="h-6 w-23 rounded-md" />
        <Skeleton className="ml-auto h-8.5 w-24 rounded-lg" />
        <Skeleton className="h-8.5 w-32.5 rounded-lg" />
        <Skeleton className="h-8.5 w-42.5 rounded-lg" />
      </CardHeader>
      <CardContent className="gap-3.5">
        <div className="flex gap-2.5">
          <Skeleton className="h-5.5 w-18.5" />
          <Skeleton className="h-5.5 w-18.5" />
        </div>
        <Skeleton className="h-3.5 w-[55%]" />
        <Skeleton className="h-3.5 w-[92%]" />
        <Skeleton className="h-3.5 w-[38%]" />
        <Skeleton className="h-4.5 w-57.5" />
        <Skeleton className="h-32.5 w-full rounded-md" />
      </CardContent>
    </Card>
  )
}
