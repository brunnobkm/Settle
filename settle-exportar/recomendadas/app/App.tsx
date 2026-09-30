// Exportar: tela Recomendadas, com a chave Hoje x Proposta (canto superior direito).
// Hoje: reproduz produção (Exportar só por data; Selecionar tudo lento; lote sem
// confirmação e dividido em vários arquivos). Proposta: modal único com resumo e
// quantidade, "Exportar tudo filtrado", seleção no estilo Gmail e arquivo único.
// Base duplicada de settle-melhoria-deixar-os-filtros-aplicados-mais-visivel.

import { useEffect, useRef, useState } from "react"
import {
  BellIcon,
  BookmarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  FileTextIcon,
  FolderIcon,
  FolderXIcon,
  LinkIcon,
  ListChecksIcon,
  PencilIcon,
  SearchIcon,
  Share2Icon,
} from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { AppShell, useAppShell } from "@/components/ui/app-shell"
import {
  ActionBar,
  ActionBarButton,
  ActionBarClose,
  ActionBarGroup,
  ActionBarLabel,
  ActionBarSeparator,
} from "@/components/ui/action-bar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { FilterChip, FilterChipGroup } from "@/components/ui/filter-chip"
import {
  LicitacaoCard,
  LicitacaoCardSegments,
  LicitacaoCardStatusButton,
  type LicitacaoCardIconActionProps,
  type LicitacaoCardItemsColumn,
} from "@/components/ui/licitacao-card"
import { SearchField } from "@/components/ui/search-field"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useNaoPrototipado } from "@/settle/nao-prototipado"
import { SAUDACAO, USUARIO, WORKSPACE } from "@/settle/navegacao"

import { ModalExportar, ModalExportarHoje, type AberturaDoModal } from "../../app/exportacao/ModalExportar"
import { gerarLinhas, quantidade, registrarEvento, useDecisoes, useVersao } from "../../app/exportacao/nucleo"
import { menuDoProjeto, PainelDoPrototipo } from "../../app/exportacao/Prototipo"
import { ProvedorDeExportacoes } from "../../app/exportacao/Tarefas"
import {
  ABA_TODAS,
  ABAS,
  FILTROS_INICIAIS,
  HOJE,
  ITENS,
  LICITACOES,
  PRESETS_DATA,
  RESPONSAVEIS,
  SEGMENTOS_DO_CARD,
  formatarData,
  lerData,
  normalizar,
  textoPadraoDeBusca,
  type Filtro,
  type Licitacao,
} from "./dados"

const POR_PAGINA = 20
const POR_ARQUIVO_HOJE = 200 // produção divide o lote em arquivos de ~200
const ATRASO_BUSCA = 450

type Card = Licitacao & { chave: string }

/** Texto do filtro para o resumo e o cabeçalho do arquivo. */
function textoDoFiltro(f: Filtro) {
  if (f.tipo === "lista") return f.valor.join(", ") || "Qualquer"
  if (f.valor.data) return f.valor.data
  return PRESETS_DATA[f.modo].find((p) => p.chave === f.valor.preset)?.rotulo ?? "Qualquer"
}

export default function App() {
  return (
    <ProvedorDeExportacoes>
      <Recomendadas />
    </ProvedorDeExportacoes>
  )
}

function Recomendadas() {
  useNaoPrototipado()
  const [versao, setVersao] = useVersao()
  const [decisoes] = useDecisoes()
  const proposta = versao === "proposta"

  const [aba, setAba] = useState(ABA_TODAS)
  const [filtros, setFiltros] = useState(FILTROS_INICIAIS)
  const [pagina, setPagina] = useState(1)

  const [buscaAberta, setBuscaAberta] = useState(false)
  const [consulta, setConsulta] = useState("")
  const [aplicada, setAplicada] = useState("")
  const [carregando, setCarregando] = useState(false)
  const timerBusca = useRef<number | undefined>(undefined)

  const [selecionadas, setSelecionadas] = useState<string[]>([])
  const [todasDoFiltro, setTodasDoFiltro] = useState(false)
  const [carregandoTudo, setCarregandoTudo] = useState(false)
  const [progressoLote, setProgressoLote] = useState<{ feitas: number; total: number } | null>(null)
  const timers = useRef<number[]>([])
  const [itensAbertos, setItensAbertos] = useState<Record<string, boolean>>({})

  const [modalHoje, setModalHoje] = useState(false)
  const [abertura, setAbertura] = useState<AberturaDoModal | null>(null)

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), [])

  /* ---------------- resultado atual ---------------- */

  const dadosDaAba = ABAS.find((a) => a.chave === aba) ?? ABAS[0]
  const q = normalizar(aplicada.trim())
  const bases = LICITACOES.filter((l) => !q || normalizar(textoPadraoDeBusca(l)).includes(q))
  // busca simulada: o total cai na proporção dos cards de exemplo que casam
  const total = q ? Math.round((dadosDaAba.contagem * bases.length) / LICITACOES.length / 3) : dadosDaAba.contagem
  const totalHoje = q ? Math.min(total, Math.round(dadosDaAba.hoje / 3)) : dadosDaAba.hoje
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA))
  const inicio = (pagina - 1) * POR_PAGINA
  const cards: Card[] = bases.length
    ? Array.from({ length: Math.max(0, Math.min(POR_PAGINA, total - inicio)) }, (_, i) => {
        const n = inicio + i
        const base = bases[n % bases.length]
        return { ...base, edital: `${String(77 + n).padStart(3, "0")}/2026`, chave: `${aba}-${n}` }
      })
    : []

  const filtrosDaAba = filtros[aba] ?? []
  const filtrosParaResumo = filtrosDaAba.map((f) => ({ rotulo: f.rotulo, valor: textoDoFiltro(f) }))
  const unico = (rotulo: string) => {
    const f = filtrosDaAba.find((x) => x.rotulo === rotulo)
    return f?.tipo === "lista" && f.valor.length === 1 ? f.valor[0] : undefined
  }

  const nSelecionadas = todasDoFiltro ? total : selecionadas.length
  const paginaToda = cards.length > 0 && cards.every((c) => selecionadas.includes(c.chave))

  /* ---------------- ações ---------------- */

  function limparSelecao() {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
    setSelecionadas([])
    setTodasDoFiltro(false)
    setCarregandoTudo(false)
    setProgressoLote(null)
  }

  function trocarAba(nova: string) {
    setAba(nova)
    setPagina(1)
    limparSelecao()
  }

  function agendarBusca(texto: string) {
    window.clearTimeout(timerBusca.current)
    limparSelecao()
    setPagina(1)
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
    setCarregando(false)
    setAplicada("")
  }

  function alterarFiltro(indice: number, filtro: Filtro) {
    setFiltros((atuais) => ({ ...atuais, [aba]: (atuais[aba] ?? []).map((f, i) => (i === indice ? filtro : f)) }))
  }

  function selecionarTudo() {
    if (proposta) {
      // Gmail: marca a página na hora; o aviso oferece o resto do filtro
      setSelecionadas(cards.map((c) => c.chave))
      return
    }
    // produção: carrega o filtro inteiro antes de liberar (30 a 50 s)
    setCarregandoTudo(true)
    const espera = decisoes.temposCurtos ? 6000 : 40000
    timers.current.push(
      window.setTimeout(() => {
        setCarregandoTudo(false)
        setTodasDoFiltro(true)
        setSelecionadas(cards.map((c) => c.chave))
      }, espera)
    )
  }

  function exportarLote() {
    if (proposta) {
      setAbertura({ modo: "lote", lote: nSelecionadas, origem: "barra_lote" })
      return
    }
    // produção: começa na hora, sem confirmação nem formato, em arquivos de ~200
    const n = nSelecionadas
    const arquivos = Math.ceil(n / POR_ARQUIVO_HOJE)
    const inicioLote = Date.now()
    registrarEvento("export_option_selected", { opcao: "lote", tela: "recomendadas" })
    registrarEvento("export_confirmed", { quantidade: n, formato: "xlsx", tela: "recomendadas", opcao: "lote" })
    const passo = decisoes.temposCurtos ? 500 : 1500
    for (let k = 0; k <= arquivos; k++) {
      timers.current.push(
        window.setTimeout(() => {
          if (k < arquivos) setProgressoLote({ feitas: Math.min(n, k * POR_ARQUIVO_HOJE), total: n })
          else {
            setProgressoLote(null)
            registrarEvento("export_completed", { tempo_ms: Date.now() - inicioLote, arquivos, quantidade: n, tela: "recomendadas" })
            toast.success(`Licitações exportadas com sucesso em ${arquivos} ${arquivos === 1 ? "arquivo" : "arquivos"}.`)
          }
        }, k * passo)
      )
    }
  }

  function abrirExportarGeral() {
    if (proposta) setAbertura({ modo: "geral", opcao: "filtrado", origem: "botao_geral" })
    else setModalHoje(true)
  }

  /* ---------------- tela ---------------- */

  const cabecalho = q
    ? `Encontramos ${quantidade(total)} com sua busca`
    : `Encontramos ${quantidade(total)} ${aba === "Ativas" || aba === ABA_TODAS ? "ativas" : ""}`.trim()

  let rotuloDaBarra: React.ReactNode = `${quantidade(nSelecionadas)} ${nSelecionadas === 1 ? "selecionada" : "selecionadas"}`
  if (carregandoTudo)
    rotuloDaBarra = (
      <span className="flex items-center gap-2">
        <Spinner className="size-3.5" /> Carregando licitações do filtro atual...
      </span>
    )
  if (progressoLote)
    rotuloDaBarra = (
      <span className="flex items-center gap-2">
        <Spinner className="size-3.5" /> {progressoLote.feitas.toLocaleString("pt-BR")} de{" "}
        {progressoLote.total.toLocaleString("pt-BR")} licitações exportadas
      </span>
    )

  return (
    <AppShell
      workspace={WORKSPACE}
      groups={menuDoProjeto("recomendadas", versao)}
      user={USUARIO}
      header={<span className="text-[15px] font-semibold">{SAUDACAO}</span>}
      hideHeaderOnScroll
    >
      <PainelDoPrototipo
        tela="recomendadas"
        versao={versao}
        onVersao={(v) => {
          limparSelecao()
          setVersao(v)
        }}
      />

      <div className="mx-auto max-w-347 px-6 pt-6 pb-24">
        <header className="mb-5.5">
          <p className="text-3xl font-normal" aria-live="polite">
            {cabecalho}
          </p>
          <h1 className="mt-1.5 text-5xl leading-[1.04] font-bold tracking-[-0.5px]">Selecione quais deseja analisar</h1>
        </header>

        <div className="sticky top-16 z-10 mb-2 bg-background py-3.5 transition-transform duration-250 ease-out group-data-[header-hidden=true]/app-shell:-translate-y-16">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Tabs value={aba} onValueChange={trocarAba} className="min-w-0">
              <TabsList aria-label="Abas de licitações" className="h-auto max-w-full overflow-x-auto">
                {ABAS.map((a) => (
                  <TabsTrigger
                    key={a.chave}
                    value={a.chave}
                    className="h-7.5 flex-none gap-1.5 rounded-lg px-3 hover:bg-background/60 hover:text-foreground"
                  >
                    <span>{a.chave}</span>
                    <span className="rounded-md bg-foreground/10 px-1.5 py-px text-xs leading-4 font-medium text-foreground tabular-nums">
                      {(a.chave === aba ? total : a.contagem).toLocaleString("pt-BR")}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className={cn("flex items-center rounded-lg bg-foreground/10", buscaAberta ? "min-w-0" : "overflow-hidden")}>
              <Button variant="ghost" size="sm" data-nao-prototipado className="h-8 rounded-none px-3 text-foreground hover:bg-foreground/5">
                Filtrar
                {filtrosDaAba.length > 0 && (
                  <span className="rounded-full bg-muted px-1.5 text-xs leading-4.5 font-normal tabular-nums">{filtrosDaAba.length}</span>
                )}
              </Button>
              <Button variant="ghost" size="sm" data-nao-prototipado className="h-8 rounded-none px-3 text-foreground hover:bg-foreground/5">
                Ordenar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={abrirExportarGeral}
                className="h-8 rounded-none px-3 text-foreground hover:bg-foreground/5"
              >
                Exportar
              </Button>
              {buscaAberta ? (
                <SearchField
                  autoFocus
                  value={consulta}
                  onValueChange={(texto) => {
                    setConsulta(texto)
                    agendarBusca(texto)
                  }}
                  onClose={fecharBusca}
                  labels={{ input: "Buscar licitações" }}
                  className="w-auto min-w-75 flex-1 rounded-lg border-0 bg-transparent shadow-none dark:bg-transparent"
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

          {/* Proposta: aviso de seleção no estilo Gmail */}
          {proposta && (paginaToda || todasDoFiltro) && total > cards.length && (
            <div role="status" className="mt-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-lg bg-muted px-4 py-2.5 text-[13px]">
              {todasDoFiltro ? (
                <>
                  <span>
                    Todas as <strong className="font-semibold tabular-nums">{total.toLocaleString("pt-BR")}</strong> licitações do
                    filtro atual estão selecionadas.
                  </span>
                  <Button variant="link" size="sm" className="h-auto p-0 text-[13px]" onClick={limparSelecao}>
                    Limpar seleção
                  </Button>
                </>
              ) : (
                <>
                  <span>
                    Todas as <strong className="font-semibold tabular-nums">{cards.length}</strong> desta página estão selecionadas.
                  </span>
                  <Button variant="link" size="sm" className="h-auto p-0 text-[13px]" onClick={() => setTodasDoFiltro(true)}>
                    Selecionar todas as {total.toLocaleString("pt-BR")} do filtro
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        <section aria-label="Recomendadas" aria-busy={carregando}>
          {carregando ? (
            <div className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
              <Spinner /> Buscando…
            </div>
          ) : cards.length ? (
            <>
              <ul className="flex flex-col gap-4">
                {cards.map((l, i) => (
                  <li key={l.chave}>
                    <CardDaLicitacao
                      licitacao={l}
                      selecionada={todasDoFiltro || selecionadas.includes(l.chave)}
                      onSelecionar={(marcada) => {
                        if (!marcada) setTodasDoFiltro(false)
                        setSelecionadas((s) => (marcada ? [...s, l.chave] : s.filter((e) => e !== l.chave)))
                      }}
                      itensAbertos={itensAbertos[l.chave] ?? (i === 0 && pagina === 1)}
                      onItensAbertos={(aberto) => setItensAbertos((a) => ({ ...a, [l.chave]: aberto }))}
                    />
                  </li>
                ))}
              </ul>
              <nav aria-label="Paginação" className="mt-6 flex items-center justify-between gap-4 text-sm">
                <span className="text-muted-foreground tabular-nums">
                  Mostrando {(inicio + 1).toLocaleString("pt-BR")}–{(inicio + cards.length).toLocaleString("pt-BR")} de{" "}
                  {total.toLocaleString("pt-BR")}
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={pagina === 1} onClick={() => setPagina((p) => p - 1)}>
                    <ChevronLeftIcon data-icon="inline-start" /> Anterior
                  </Button>
                  <span className="tabular-nums">
                    Página {pagina} de {paginas}
                  </span>
                  <Button variant="outline" size="sm" disabled={pagina >= paginas} onClick={() => setPagina((p) => p + 1)}>
                    Próxima <ChevronRightIcon data-icon="inline-end" />
                  </Button>
                </div>
              </nav>
            </>
          ) : (
            <Empty className="border border-dashed bg-card px-4 py-14">
              <EmptyHeader>
                <EmptyTitle className="text-[15px] font-semibold">Nenhuma licitação encontrada</EmptyTitle>
                <EmptyDescription>
                  Não há resultados para “<span className="font-semibold text-foreground">{aplicada.trim()}</span>”. Tente outro
                  termo.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </section>
      </div>

      <ActionBar open={nSelecionadas > 0 || carregandoTudo || !!progressoLote} aria-label="Ações em lote">
        <ActionBarLabel>{rotuloDaBarra}</ActionBarLabel>
        <ActionBarSeparator />
        <ActionBarGroup>
          <ActionBarButton data-nao-prototipado>Descartar</ActionBarButton>
          <ActionBarButton onClick={exportarLote} disabled={carregandoTudo || !!progressoLote}>
            Exportar
          </ActionBarButton>
          <ActionBarButton data-nao-prototipado>Adicionar responsável</ActionBarButton>
          <ActionBarButton data-nao-prototipado>Enviar para análise</ActionBarButton>
          <ActionBarButton onClick={selecionarTudo} disabled={carregandoTudo || todasDoFiltro || (proposta && paginaToda)}>
            Selecionar tudo
          </ActionBarButton>
        </ActionBarGroup>
        <ActionBarClose onClick={limparSelecao} />
      </ActionBar>

      <ModalExportarHoje
        open={modalHoje}
        onOpenChange={setModalHoje}
        tela="recomendadas"
        comFormato
        totalHoje={ABAS[0].hoje}
        totalBase={ABAS[0].contagem}
      />
      <ModalExportar
        abertura={abertura}
        onClose={() => setAbertura(null)}
        contexto={{
          tela: "recomendadas",
          aba,
          busca: aplicada.trim(),
          filtros: filtrosParaResumo,
          totalFiltrado: total,
          totalHoje,
        }}
        linhas={({ quantidade: n }) =>
          gerarLinhas(n, {
            tela: "recomendadas",
            comEtapaAtual: decisoes.etapaNoArquivoRecomendadas,
            fixos: { estado: unico("Estado"), responsavel: unico("Responsável") },
            semente: pagina,
          })
        }
      />
    </AppShell>
  )
}

/* ------------------------------------------------------------------ */
/* Card (igual ao de produção)                                         */
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
  unitario: "R$ 12.480,00",
  total: "R$ 1.173.120,00",
}))

function CardDaLicitacao({
  licitacao: l,
  selecionada,
  onSelecionar,
  itensAbertos,
  onItensAbertos,
}: {
  licitacao: Card
  selecionada: boolean
  onSelecionar: (marcada: boolean) => void
  itensAbertos: boolean
  onItensAbertos: (aberto: boolean) => void
}) {
  const arquivos = l.arquivos ?? 0
  const acoesDeIcone: (LicitacaoCardIconActionProps & { id: string })[] = [
    { id: "salvar", label: "Salvar para depois", icon: <BookmarkIcon />, "data-nao-prototipado": true },
    { id: "notificar", label: "Notificar", icon: <BellIcon />, "data-nao-prototipado": true },
    { id: "link", label: "Copiar link", icon: <LinkIcon />, "data-nao-prototipado": true },
    { id: "compartilhar", label: "Compartilhar", icon: <Share2Icon />, "data-nao-prototipado": true },
    { id: "documentos", label: "Documentos", icon: <FileTextIcon />, "data-nao-prototipado": true },
    l.semAnexo
      ? { id: "arquivos", label: "Sem anexo", icon: <FolderXIcon />, tone: "warning", "data-nao-prototipado": true }
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
        <>
          <Badge variant="outline" className="h-6 rounded-md px-2" data-nao-prototipado>
            <ListChecksIcon data-icon="inline-start" />
            Checklist
          </Badge>
          <Badge variant="secondary" className="h-6 rounded-md px-2 tabular-nums" title="Nota de aderência">
            75/100
          </Badge>
        </>
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
          Aguardando análise
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
        [{ label: "Envio da proposta", value: l.envio, tone: "warning", icon: <ClockIcon aria-hidden /> }],
      ]}
      meta={[
        { label: "ID", value: l.id },
        { label: "Modalidade", value: l.modalidade },
        { label: "Julgamento", value: l.julgamento },
        { label: "Portal de Disputa", value: l.portal },
        { label: "Estado", value: l.estado },
        { label: "Cidade", value: l.cidade },
        { label: "CAPAG", value: "B" },
        { label: "Habitantes", value: l.habitantes },
        { label: "Substatus", value: "Aguardando análise" },
        { label: "Descrição", value: "Entrega parcelada; garantia mínima de 36 meses." },
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

function FiltrosAplicados({ filtros, onAlterar }: { filtros: Filtro[]; onAlterar: (indice: number, filtro: Filtro) => void }) {
  const { headerHidden } = useAppShell()
  if (!filtros.length) return null
  return (
    <FilterChipGroup
      aria-label="Filtros aplicados"
      className={cn(
        "mt-3 max-h-15 transition-[max-height,opacity,margin] duration-250 ease-out",
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
