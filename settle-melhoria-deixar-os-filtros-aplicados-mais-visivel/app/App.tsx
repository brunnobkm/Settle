// Licitações recomendadas: "Selecione quais deseja analisar". Foco desta melhoria:
// os filtros aplicados em cada aba ficam visíveis como selos logo abaixo da barra
// (e o botão Filtrar mostra quantos são). Também tem busca com escopos e a fila
// "Salvos para depois", alternada pela sidebar.

import { useEffect, useRef, useState, type MouseEvent } from "react"
import {
  BellIcon,
  BookmarkIcon,
  BookmarkXIcon,
  ClockIcon,
  FileTextIcon,
  FolderIcon,
  FolderXIcon,
  LinkIcon,
  PencilIcon,
  RefreshCwIcon,
  SearchIcon,
  Share2Icon,
} from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { AppShell, type AppShellGroup, type AppShellItem } from "@/components/ui/app-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import {
  LicitacaoCard,
  LicitacaoCardSegments,
  LicitacaoCardStatusButton,
  type LicitacaoCardIconActionProps,
  type LicitacaoCardItemsColumn,
} from "@/components/ui/licitacao-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useNaoPrototipado } from "@/settle/nao-prototipado"
import { menuLicitacoes, SAUDACAO, USUARIO, WORKSPACE } from "@/settle/navegacao"

import { CampoDeBusca } from "./CampoDeBusca"
import {
  ABA_TODAS,
  ABAS,
  ESCOPOS,
  FILTROS_INICIAIS,
  ITENS,
  LICITACOES,
  RESPONSAVEIS,
  SEGMENTOS_DO_CARD,
  TOTAL_RECOMENDADAS,
  normalizar,
  textoPadraoDeBusca,
  type Filtro,
  type Licitacao,
} from "./dados"
import { FiltrosAplicados } from "./FiltrosAplicados"

const DURACAO_SAIDA = 330 // ms: animação do card saindo da lista
const ATRASO_BUSCA = 450 // ms: simula a busca no servidor (mostra o esqueleto)

type Fila = "recomendadas" | "salvos"

const ROTULO_DA_FILA: Record<Fila, string> = {
  recomendadas: "Recomendadas",
  salvos: "Salvos para depois",
}

const quantidade = (n: number) => `${n} ${n === 1 ? "licitação" : "licitações"}`

export default function App() {
  useNaoPrototipado()

  const [fila, setFila] = useState<Fila>("recomendadas")
  const [licitacoes, setLicitacoes] = useState(LICITACOES)
  const [selecionadas, setSelecionadas] = useState<string[]>([])
  const [itensAbertos, setItensAbertos] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(LICITACOES.map((l) => [l.edital, !l.recolhido]))
  )
  const [saindo, setSaindo] = useState<string[]>([])
  const timersSaida = useRef(new Map<string, number>())

  const [aba, setAba] = useState(ABA_TODAS)
  const [filtros, setFiltros] = useState(FILTROS_INICIAIS)

  const [buscaAberta, setBuscaAberta] = useState(false)
  const [consulta, setConsulta] = useState("")
  const [aplicada, setAplicada] = useState("")
  const [escopos, setEscopos] = useState<string[]>([])
  const [carregando, setCarregando] = useState(false)
  const timerBusca = useRef<number | undefined>(undefined)
  const inputBuscaRef = useRef<HTMLInputElement>(null)

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
  const naFila = licitacoes.filter((l) => (fila === "salvos" ? l.salvo : !l.salvo))
  const lista = naFila.filter(casaBusca)
  const totalSalvos = licitacoes.filter((l) => l.salvo).length

  // Em Salvos para depois só existe a aba Todas
  const abas = fila === "salvos" ? ABAS.filter((a) => a.chave === ABA_TODAS) : ABAS
  const contagemDaAba = (chave: string, contagem: number) => {
    if (chave !== ABA_TODAS) return contagem
    if (q) return lista.length
    return fila === "salvos" ? totalSalvos : TOTAL_RECOMENDADAS
  }

  const filtrosDaAba = filtros[aba] ?? []

  function alterarFiltro(indice: number, filtro: Filtro) {
    setFiltros((atuais) => ({
      ...atuais,
      [aba]: (atuais[aba] ?? []).map((f, i) => (i === indice ? filtro : f)),
    }))
  }

  /* ---------------- troca de fila (sidebar) ---------------- */

  function trocarFila(nova: Fila) {
    setFila(nova)
    setAba(ABA_TODAS)
    window.scrollTo(0, 0)
  }

  // Recomendadas e Salvos para depois alternam a lista nesta mesma tela
  const grupos: AppShellGroup[] = menuLicitacoes({ ativa: fila, salvos: totalSalvos }).map((grupo) => ({
    ...grupo,
    items: grupo.items.map((item): AppShellItem => {
      const alvo = (Object.keys(ROTULO_DA_FILA) as Fila[]).find((f) => ROTULO_DA_FILA[f] === item.label)
      if (!alvo) return item
      const semAviso: AppShellItem = { ...item }
      delete semAviso["data-nao-prototipado"]
      return {
        ...semAviso,
        href: "#",
        onClick: (e: MouseEvent) => {
          e.preventDefault()
          if (alvo !== fila) trocarFila(alvo)
        },
      }
    }),
  }))

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

  function fecharBusca() {
    window.clearTimeout(timerBusca.current)
    setBuscaAberta(false)
    setConsulta("")
    setEscopos([])
    setCarregando(false)
    setAplicada("")
  }

  function alternarEscopo(chave: string) {
    setEscopos((atuais) => (atuais.includes(chave) ? atuais.filter((k) => k !== chave) : [...atuais, chave]))
    agendarBusca(consulta)
    inputBuscaRef.current?.focus()
  }

  useEffect(() => {
    if (buscaAberta) inputBuscaRef.current?.focus()
  }, [buscaAberta])

  // atalho "/" abre a busca
  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      const alvo = e.target as HTMLElement | null
      const digitando = alvo?.closest("input, textarea, [contenteditable=true]")
      if (e.key === "/" && !buscaAberta && !digitando) {
        e.preventDefault()
        setBuscaAberta(true)
      }
    }
    document.addEventListener("keydown", aoTeclar)
    return () => document.removeEventListener("keydown", aoTeclar)
  }, [buscaAberta])

  /* ---------------- salvar para depois ---------------- */

  function definirSalvo(edital: string, salvo: boolean) {
    const timer = timersSaida.current.get(edital)
    if (timer) window.clearTimeout(timer)
    timersSaida.current.delete(edital)
    setSaindo((s) => s.filter((e) => e !== edital))
    setLicitacoes((ls) => ls.map((l) => (l.edital === edital ? { ...l, salvo } : l)))
  }

  function alternarSalvo(l: Licitacao) {
    if (saindo.includes(l.edital)) return
    const salvar = !l.salvo
    // o card sai da lista (fade + deslize + recolhe) e só então muda de fila
    setSaindo((s) => [...s, l.edital])
    timersSaida.current.set(
      l.edital,
      window.setTimeout(() => definirSalvo(l.edital, salvar), DURACAO_SAIDA)
    )
    toast(salvar ? "Salvo para depois" : "Removido de Salvos para depois", {
      icon: salvar ? (
        <BookmarkIcon className="size-4 fill-current text-primary" />
      ) : (
        <BookmarkXIcon className="size-4 text-muted-foreground" />
      ),
      action: { label: "Desfazer", onClick: () => definirSalvo(l.edital, l.salvo) },
    })
  }

  useEffect(() => {
    const timers = timersSaida.current
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [])

  /* ---------------- tela ---------------- */

  const cabecalho = q
    ? `Encontramos ${quantidade(lista.length)} com seus filtros`
    : fila === "salvos"
      ? `${quantidade(totalSalvos)} ${totalSalvos === 1 ? "salva" : "salvas"} para depois`
      : `Encontramos ${quantidade(TOTAL_RECOMENDADAS)}`

  return (
    <AppShell
      workspace={WORKSPACE}
      groups={grupos}
      user={USUARIO}
      header={<span className="text-[15px] font-semibold">{SAUDACAO}</span>}
      hideHeaderOnScroll
    >
      <div className="mx-auto max-w-347 px-6 pt-6 pb-16">
        <header className="mb-5.5">
          <p className="text-3xl font-normal" aria-live="polite">
            {cabecalho}
          </p>
          <h1 className="mt-1.5 text-5xl leading-[1.04] font-bold tracking-[-0.5px]">Selecione quais deseja analisar</h1>
        </header>

        {/* barra sticky: gruda logo abaixo da navbar e sobe junto quando ela se esconde */}
        <div className="sticky top-16 z-10 mb-2 bg-background py-3.5 transition-transform duration-250 ease-out group-data-[header-hidden=true]/app-shell:-translate-y-16">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Tabs value={aba} onValueChange={setAba} className="min-w-0">
              <TabsList aria-label="Abas de licitações" className="h-auto max-w-full overflow-x-auto">
                {abas.map((a) => (
                  <TabsTrigger
                    key={a.chave}
                    value={a.chave}
                    className="h-8 flex-none gap-1.5 rounded-lg px-3 hover:bg-background/60 hover:text-foreground"
                  >
                    <span>{a.chave}</span>
                    <span className="rounded-md bg-foreground/10 px-1.5 py-px text-xs leading-4 font-medium text-foreground tabular-nums">
                      {contagemDaAba(a.chave, a.contagem)}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* grupo segmentado de ações */}
            <div
              className={cn(
                "flex items-center rounded-lg bg-foreground/10",
                buscaAberta ? "min-w-0 max-[1040px]:basis-full" : "overflow-hidden"
              )}
            >
              <Button
                variant="ghost"
                size="sm"
                data-nao-prototipado
                aria-label={
                  filtrosDaAba.length
                    ? `Filtrar (${filtrosDaAba.length} ${filtrosDaAba.length === 1 ? "filtro aplicado" : "filtros aplicados"})`
                    : undefined
                }
                className={cn(
                  "h-8 rounded-none px-3 text-foreground hover:bg-foreground/5",
                  buscaAberta && "max-[1040px]:hidden"
                )}
              >
                Filtrar
                {filtrosDaAba.length > 0 && (
                  <span className="rounded-full bg-muted px-1.5 text-xs leading-4.5 font-normal tabular-nums">
                    {filtrosDaAba.length}
                  </span>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                data-nao-prototipado
                className={cn(
                  "h-8 rounded-none px-3 text-foreground hover:bg-foreground/5",
                  buscaAberta && "max-[1040px]:hidden"
                )}
              >
                Ordenar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                data-nao-prototipado
                className={cn(
                  "h-8 rounded-none px-3 text-foreground hover:bg-foreground/5",
                  buscaAberta && "max-[1040px]:hidden"
                )}
              >
                Exportar
              </Button>
              {buscaAberta ? (
                <CampoDeBusca
                  inputRef={inputBuscaRef}
                  consulta={consulta}
                  onConsulta={(texto) => {
                    setConsulta(texto)
                    agendarBusca(texto)
                  }}
                  escopos={escopos}
                  onAlternarEscopo={alternarEscopo}
                  onLimparEscopos={() => {
                    setEscopos([])
                    agendarBusca(consulta)
                  }}
                  onFechar={fecharBusca}
                />
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 rounded-none px-3 text-foreground hover:bg-foreground/5"
                  onClick={() => setBuscaAberta(true)}
                >
                  <SearchIcon data-icon="inline-start" />
                  Buscar
                </Button>
              )}
            </div>
          </div>

          <FiltrosAplicados key={aba} filtros={filtrosDaAba} onAlterar={alterarFiltro} />
        </div>

        <section aria-label={ROTULO_DA_FILA[fila]} aria-busy={carregando}>
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
                    className={cn(
                      "grid transition-all duration-300 ease-out",
                      saindoAgora
                        ? "pointer-events-none translate-x-10 scale-[.98] grid-rows-[0fr] opacity-0"
                        : "grid-rows-[1fr]"
                    )}
                  >
                    <div className={cn("min-h-0", saindoAgora && "overflow-hidden")}>
                      <CardDaLicitacao
                        licitacao={l}
                        salvo={salvo}
                        mostrarAtualizado={fila === "salvos"}
                        selecionada={selecionadas.includes(l.edital)}
                        onSelecionar={(marcada) =>
                          setSelecionadas((s) => (marcada ? [...s, l.edital] : s.filter((e) => e !== l.edital)))
                        }
                        itensAbertos={itensAbertos[l.edital] ?? true}
                        onItensAbertos={(aberto) => setItensAbertos((a) => ({ ...a, [l.edital]: aberto }))}
                        onAlternarSalvo={() => alternarSalvo(l)}
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
                ) : fila === "salvos" ? (
                  <>
                    <EmptyTitle className="text-[15px] font-semibold">Nenhuma licitação salva para depois</EmptyTitle>
                    <EmptyDescription>
                      Use o marcador de um card em Recomendadas para guardar a licitação aqui.
                    </EmptyDescription>
                  </>
                ) : (
                  <>
                    <EmptyTitle className="text-[15px] font-semibold">Nenhuma licitação recomendada</EmptyTitle>
                    <EmptyDescription>As licitações salvas para depois ficam em Salvos para depois.</EmptyDescription>
                  </>
                )}
              </EmptyHeader>
            </Empty>
          )}
        </section>
      </div>
    </AppShell>
  )
}

/* ------------------------------------------------------------------ */
/* Card                                                                */
/* ------------------------------------------------------------------ */

const COLUNAS_DOS_ITENS: LicitacaoCardItemsColumn[] = [
  { key: "lote", label: "Lote", muted: true },
  { key: "nome", label: "Nome" },
  { key: "segmento", label: "Segmento" },
  { key: "unidades", label: "Unidades", muted: true },
  { key: "unitario", label: "Valor Unitário", muted: true },
  { key: "total", label: "Valor Total", muted: true },
]

const LINHAS_DOS_ITENS = ITENS.map((item) => ({
  lote: item.lote,
  nome: item.nome,
  segmento: <LicitacaoCardSegments segments={SEGMENTOS_DO_CARD} size="sm" className="flex-nowrap" />,
  unidades: item.unidades,
  unitario: "R$ 00.000,00",
  total: "R$ 0.000.000,00",
}))

function CardDaLicitacao({
  licitacao: l,
  salvo,
  mostrarAtualizado,
  selecionada,
  onSelecionar,
  itensAbertos,
  onItensAbertos,
  onAlternarSalvo,
}: {
  licitacao: Licitacao
  salvo: boolean
  /** "Atualizado" só aparece em Salvos para depois, quando o anexo chega. */
  mostrarAtualizado: boolean
  selecionada: boolean
  onSelecionar: (marcada: boolean) => void
  itensAbertos: boolean
  onItensAbertos: (aberto: boolean) => void
  onAlternarSalvo: () => void
}) {
  const arquivos = l.arquivos ?? 0
  const acoesDeIcone: (LicitacaoCardIconActionProps & { id: string })[] = [
    {
      id: "salvar",
      label: salvo ? "Remover de Salvos para depois" : "Salvar para depois",
      icon: <BookmarkIcon className={cn(salvo && "fill-current")} />,
      pressed: salvo,
      onClick: onAlternarSalvo,
    },
    { id: "notificar", label: "Notificar", icon: <BellIcon />, "data-nao-prototipado": true },
    { id: "link", label: "Copiar link", icon: <LinkIcon />, "data-nao-prototipado": true },
    { id: "compartilhar", label: "Compartilhar", icon: <Share2Icon />, "data-nao-prototipado": true },
    { id: "documentos", label: "Documentos", icon: <FileTextIcon />, "data-nao-prototipado": true },
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
      badges={
        mostrarAtualizado && l.atualizado ? (
          <Badge
            variant="warning"
            title="Atualizado: o anexo chegou"
            className="h-6 rounded-md border-current/20 px-2 font-semibold"
          >
            <RefreshCwIcon data-icon="inline-start" />
            Atualizado
          </Badge>
        ) : null
      }
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
        <LicitacaoCardStatusButton data-nao-prototipado>
          <PencilIcon data-icon="inline-start" />
          Em disputa ou Homologação
        </LicitacaoCardStatusButton>
      }
      avatars={RESPONSAVEIS}
      addAvatarProps={{ "data-nao-prototipado": true }}
      iconActions={acoesDeIcone}
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
      items={{
        title: "Itens com Correspondência",
        count: l.itens,
        summary: `Total de itens: ${l.total}`,
        columns: COLUNAS_DOS_ITENS,
        rows: LINHAS_DOS_ITENS,
        open: itensAbertos,
        onOpenChange: onItensAbertos,
        showLabel: "Mostrar itens com correspondência",
        hideLabel: "Ocultar itens",
      }}
    />
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
