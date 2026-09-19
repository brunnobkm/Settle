// Órgãos favoritos: a lista de Recomendadas com duas abas, "Todas" e "Órgãos favoritos".
// A aba de órgãos traz um filtro fixo por órgão (selo "Órgão: 2 selecionadas"); a lista e a
// contagem da aba acompanham a seleção. Mantém busca com escopos e "Salvar para depois".

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
import { AppShell, useAppShell, type AppShellGroup } from "@/components/ui/app-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { FilterChip, FilterChipGroup } from "@/components/ui/filter-chip"
import {
  LicitacaoCard,
  LicitacaoCardSegments,
  LicitacaoCardStatusButton,
  type LicitacaoCardIconActionProps,
} from "@/components/ui/licitacao-card"
import { SearchField, useSearchShortcut } from "@/components/ui/search-field"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useNaoPrototipado } from "@/settle/nao-prototipado"
import { menuLicitacoes, SAUDACAO, USUARIO, WORKSPACE } from "@/settle/navegacao"

import {
  ABA_ORGAOS,
  ABA_TODAS,
  ABAS,
  ESCOPOS,
  ITENS,
  LICITACOES,
  ORGAOS,
  ORGAOS_FAVORITOS_INICIAIS,
  RESPONSAVEIS,
  SEGMENTOS_DO_CARD,
  TOTAL_RECOMENDADAS,
  normalizar,
  textoPadraoDeBusca,
  type Aba,
  type Licitacao,
} from "./dados"

const DURACAO_SAIDA = 330 // ms: animação do card saindo da lista
const ATRASO_BUSCA = 450 // ms: simula a busca no servidor (mostra o esqueleto)
const OPCOES_DE_ESCOPO = ESCOPOS.map((e) => ({ value: e.chave, label: e.rotulo }))

type Visao = "recomendadas" | "salvos"

const quantidade = (n: number) => `${n} ${n === 1 ? "licitação" : "licitações"}`

export default function App() {
  useNaoPrototipado()

  const [licitacoes, setLicitacoes] = useState(LICITACOES)
  const [selecionadas, setSelecionadas] = useState<string[]>([])
  const [saindo, setSaindo] = useState<string[]>([])
  const timersSaida = useRef(new Map<string, number>())

  const [visao, setVisao] = useState<Visao>("recomendadas")
  const [aba, setAba] = useState<Aba>(ABA_TODAS)
  const [orgaosFavoritos, setOrgaosFavoritos] = useState(ORGAOS_FAVORITOS_INICIAIS)

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
  const favorita = (l: Licitacao) => orgaosFavoritos.includes(l.orgao)

  // Recomendadas mostra o que não foi salvo; Salvos para depois, só o que foi salvo
  const fila = licitacoes.filter((l) => (visao === "salvos" ? l.salvo : !l.salvo))
  const abaOrgaos = visao === "recomendadas" && aba === ABA_ORGAOS
  const lista = fila.filter((l) => (!abaOrgaos || favorita(l)) && casaBusca(l))
  const totalSalvos = licitacoes.filter((l) => l.salvo).length

  const contagens: Record<Aba, number> = {
    [ABA_TODAS]: q ? fila.filter(casaBusca).length : visao === "salvos" ? fila.length : TOTAL_RECOMENDADAS,
    [ABA_ORGAOS]: fila.filter((l) => favorita(l) && casaBusca(l)).length,
  }
  // "Órgãos favoritos" some em Salvos para depois
  const abasVisiveis: Aba[] = visao === "salvos" ? [ABA_TODAS] : [...ABAS]
  const filtrosDaAba = abaOrgaos ? 1 : 0

  /* ---------------- sidebar: Recomendadas ↔ Salvos para depois ---------------- */

  function trocarVisao(nova: Visao) {
    setVisao(nova)
    setAba(ABA_TODAS) // volta para a aba Todas ao trocar de visão
    window.scrollTo(0, 0)
  }

  const grupos: AppShellGroup[] = menuLicitacoes({ ativa: visao, salvos: totalSalvos }).map((grupo) => ({
    ...grupo,
    items: grupo.items.map((item) => {
      const alvo: Visao | null =
        item.label === "Recomendadas" ? "recomendadas" : item.label === "Salvos para depois" ? "salvos" : null
      if (!alvo) return item
      // as duas visões existem nesta página: o clique troca a lista sem navegar
      const { "data-nao-prototipado": _naoPrototipado, ...resto } = item as typeof item & {
        "data-nao-prototipado"?: boolean
      }
      return {
        ...resto,
        href: "#",
        onClick: (e: MouseEvent) => {
          e.preventDefault()
          if (alvo !== visao) trocarVisao(alvo)
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

  function alterarEscopos(novos: string[]) {
    setEscopos(novos)
    agendarBusca(consulta)
  }

  // atalho "/" abre a busca
  useSearchShortcut(() => setBuscaAberta(true), { enabled: !buscaAberta })

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

  const titulo = q
    ? `Encontramos ${quantidade(lista.length)} com seus filtros`
    : visao === "salvos"
      ? `${fila.length} ${fila.length === 1 ? "licitação salva" : "licitações salvas"} para depois`
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
          <p className="text-3xl leading-9 font-normal" aria-live="polite">
            {titulo}
          </p>
          <h1 className="mt-1.5 text-5xl leading-[1.04] font-bold tracking-[-0.5px]">Selecione quais deseja analisar</h1>
        </header>

        {/* barra sticky: gruda logo abaixo da navbar e sobe junto quando ela se esconde */}
        <div className="sticky top-16 z-10 mb-2 bg-background py-3.5 transition-transform duration-250 ease-out group-data-[header-hidden=true]/app-shell:-translate-y-16">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <Tabs value={aba} onValueChange={(v) => setAba(v as Aba)} className="min-w-0">
              <TabsList aria-label="Abas da lista" className="h-auto rounded-[10px] bg-foreground/8">
                {abasVisiveis.map((a) => (
                  <TabsTrigger
                    key={a}
                    value={a}
                    className="h-8 flex-none gap-1.5 rounded-lg px-3 hover:bg-background/60 hover:text-foreground data-active:shadow-none"
                  >
                    <span>{a}</span>
                    <span className="rounded-md bg-foreground/10 px-1.5 py-px text-xs leading-4 font-medium text-foreground tabular-nums">
                      {contagens[a]}
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
                {filtrosDaAba > 0 && (
                  <span className="rounded-full bg-muted px-1.5 text-xs leading-4.5 font-normal tabular-nums">
                    {filtrosDaAba}
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
                  onClick={() => setBuscaAberta(true)}
                >
                  <SearchIcon data-icon="inline-start" />
                  Buscar
                </Button>
              )}
            </div>
          </div>

          {abaOrgaos && (
            <FiltroDeOrgaos valor={orgaosFavoritos} onAlterar={setOrgaosFavoritos} />
          )}
        </div>

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
                        mostrarAtualizado={visao === "salvos" && !!l.atualizado}
                        selecionada={selecionadas.includes(l.edital)}
                        onSelecionar={(marcada) =>
                          setSelecionadas((s) => (marcada ? [...s, l.edital] : s.filter((e) => e !== l.edital)))
                        }
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
                ) : abaOrgaos && !orgaosFavoritos.length ? (
                  <>
                    <EmptyTitle className="text-[15px] font-semibold">Nenhum órgão selecionado</EmptyTitle>
                    <EmptyDescription>
                      Selecione órgãos no filtro Órgão para acompanhar tudo o que eles publicarem.
                    </EmptyDescription>
                  </>
                ) : visao === "salvos" ? (
                  <>
                    <EmptyTitle className="text-[15px] font-semibold">Nenhuma licitação salva para depois</EmptyTitle>
                    <EmptyDescription>Use o marcador do card para salvar uma licitação e voltar a ela depois.</EmptyDescription>
                  </>
                ) : (
                  <>
                    <EmptyTitle className="text-[15px] font-semibold">Nenhuma licitação nesta aba</EmptyTitle>
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

const COLUNAS_ITENS = [
  { key: "lote", label: "Lote", muted: true },
  { key: "nome", label: "Nome" },
  { key: "segmento", label: "Segmento" },
  { key: "unidades", label: "Unidades", muted: true },
  { key: "unitario", label: "Valor Unitário", muted: true },
  { key: "total", label: "Valor Total", muted: true },
]

const LINHAS_ITENS = ITENS.map((item) => ({
  ...item,
  segmento: <LicitacaoCardSegments segments={SEGMENTOS_DO_CARD} size="sm" className="flex-nowrap" />,
  unitario: "R$ 00.000,00",
  total: "R$ 0.000.000,00",
}))

function CardDaLicitacao({
  licitacao: l,
  salvo,
  mostrarAtualizado,
  selecionada,
  onSelecionar,
  onAlternarSalvo,
}: {
  licitacao: Licitacao
  salvo: boolean
  mostrarAtualizado: boolean
  selecionada: boolean
  onSelecionar: (marcada: boolean) => void
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
        mostrarAtualizado && (
          <Badge variant="warning" className="h-6 rounded-md px-2 font-semibold" title="Atualizado: o anexo chegou">
            <RefreshCwIcon data-icon="inline-start" />
            Atualizado
          </Badge>
        )
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
        columns: COLUNAS_ITENS,
        rows: LINHAS_ITENS,
        defaultOpen: !l.recolhida,
        showLabel: "Mostrar itens com correspondência",
        hideLabel: "Ocultar itens",
      }}
    />
  )
}

/** Filtro fixo da aba "Órgãos favoritos", como selo ("Órgão: 2 selecionadas ▾"). */
function FiltroDeOrgaos({ valor, onAlterar }: { valor: string[]; onAlterar: (valor: string[]) => void }) {
  const { headerHidden } = useAppShell()
  return (
    <FilterChipGroup
      aria-label="Filtros da aba"
      className={cn(
        "mt-3 max-h-15 transition-[max-height,opacity,margin] duration-250 ease-out",
        // rolando para baixo (navbar escondida): os selos recolhem
        headerHidden && "pointer-events-none mt-0 max-h-0 overflow-hidden opacity-0"
      )}
    >
      <FilterChip
        closeOnScroll
        label="Órgão"
        options={ORGAOS}
        value={valor}
        onValueChange={onAlterar}
        labels={{ empty: "Nenhum órgão encontrado" }}
      />
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
