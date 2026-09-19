// Explorar licitações: lista de licitações com abas de visualização (Relevantes /
// Provável ruído), busca com escopos, filtros por visualização e "Salvar para depois".

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import {
  BellIcon,
  BookmarkIcon,
  BookmarkXIcon,
  CheckIcon,
  CircleHelpIcon,
  ClockIcon,
  CopyIcon,
  FolderIcon,
  FolderXIcon,
  LinkIcon,
  PencilIcon,
  SearchIcon,
  Share2Icon,
  Trash2Icon,
  XIcon,
} from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { AppShell } from "@/components/ui/app-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { LicitacaoCard, LicitacaoCardStatusButton, type LicitacaoCardIconActionProps } from "@/components/ui/licitacao-card"
import { Skeleton } from "@/components/ui/skeleton"
import { useNaoPrototipado } from "@/settle/nao-prototipado"
import { menuLicitacoes, SAUDACAO, USUARIO, WORKSPACE } from "@/settle/navegacao"

import { BarraDeVisualizacoes } from "./BarraDeVisualizacoes"
import { CampoDeBusca } from "./CampoDeBusca"
import {
  ESCOPOS,
  LICITACOES,
  RESPONSAVEIS,
  ROTULO_ADERENCIA,
  SEGMENTOS_DO_CARD,
  VISUALIZACAO_INICIAL,
  VISUALIZACAO_OBRIGATORIA,
  VISUALIZACAO_ORGAOS,
  VISUALIZACOES_INICIAIS,
  normalizar,
  textoPadraoDeBusca,
  type Aderencia,
  type Filtro,
  type Licitacao,
  type Visualizacao,
} from "./dados"
import { FiltrosDaVisualizacao } from "./FiltrosDaVisualizacao"

const DURACAO_SAIDA = 330 // ms: animação do card saindo da lista
const ATRASO_BUSCA = 450 // ms: simula a busca no servidor (mostra o esqueleto)

function pertenceAVisualizacao(l: Licitacao, v: Visualizacao | undefined) {
  if (!v) return true
  if (v.aderencia) return v.aderencia.includes(l.aderencia)
  if (v.chave === VISUALIZACAO_ORGAOS) {
    const orgaos = v.filtros.find((f) => f.tipo === "lista" && f.rotulo === "Órgão")
    return orgaos?.tipo === "lista" ? orgaos.valor.includes(l.orgao) : true
  }
  return true
}

export default function App() {
  useNaoPrototipado()

  const [licitacoes, setLicitacoes] = useState(LICITACOES)
  const [selecionadas, setSelecionadas] = useState<string[]>([])
  const [saindo, setSaindo] = useState<string[]>([])
  const timersSaida = useRef(new Map<string, number>())

  const [visualizacoes, setVisualizacoes] = useState(VISUALIZACOES_INICIAIS)
  const [ativa, setAtiva] = useState(VISUALIZACAO_INICIAL)
  const [novaPendente, setNovaPendente] = useState<string | null>(null)
  const sequenciaNova = useRef(0)

  const [buscaAberta, setBuscaAberta] = useState(false)
  const [consulta, setConsulta] = useState("")
  const [aplicada, setAplicada] = useState("")
  const [escopos, setEscopos] = useState<string[]>([])
  const [carregando, setCarregando] = useState(false)
  const timerBusca = useRef<number | undefined>(undefined)
  const inputBuscaRef = useRef<HTMLInputElement>(null)

  const barraRef = useRef<HTMLDivElement>(null)
  const abasRef = useRef<HTMLDivElement>(null)
  const acoesRef = useRef<HTMLDivElement>(null)
  const [disponivel, setDisponivel] = useState(Number.POSITIVE_INFINITY)

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
  const fila = licitacoes.filter((l) => !l.salvo)
  const visualizacaoAtiva = visualizacoes.find((v) => v.chave === ativa)
  const visiveis = visualizacoes.filter((v) => !v.oculta)
  const contagens = Object.fromEntries(
    visualizacoes.map((v) => [v.chave, fila.filter((l) => pertenceAVisualizacao(l, v) && casaBusca(l)).length])
  )
  const lista = fila.filter((l) => pertenceAVisualizacao(l, visualizacaoAtiva) && casaBusca(l))
  const totalSalvos = licitacoes.filter((l) => l.salvo).length

  /* ---------------- largura livre para as abas ---------------- */

  useLayoutEffect(() => {
    const barra = barraRef.current
    const abas = abasRef.current
    const acoes = acoesRef.current
    if (!barra || !abas || !acoes) return
    const medir = () => {
      // telas estreitas com a busca aberta: as ações descem para a linha de baixo
      const quebrou = acoes.offsetTop > abas.offsetTop + 4
      setDisponivel(quebrou ? barra.clientWidth : barra.clientWidth - acoes.offsetWidth - 16)
    }
    medir()
    const observador = new ResizeObserver(medir)
    observador.observe(barra)
    observador.observe(acoes)
    return () => observador.disconnect()
  }, [])

  /* ---------------- visualizações ---------------- */

  const ativar = useCallback((chave: string) => setAtiva(chave), [])
  const novaTratada = useCallback(() => setNovaPendente(null), [])

  function criarVisualizacao() {
    const chave = `view-${Date.now()}`
    sequenciaNova.current += 1
    setVisualizacoes((vs) => [...vs, { chave, rotulo: `Nova visualização ${sequenciaNova.current}`, filtros: [] }])
    setNovaPendente(chave)
  }

  function moverVisualizacao(chave: string, alvo: string, posicao: "antes" | "depois") {
    setVisualizacoes((vs) => {
      const item = vs.find((v) => v.chave === chave)
      if (!item || chave === alvo) return vs
      const resto = vs.filter((v) => v.chave !== chave)
      const i = resto.findIndex((v) => v.chave === alvo)
      if (i < 0) return vs
      resto.splice(posicao === "antes" ? i : i + 1, 0, item)
      return resto
    })
  }

  function renomearVisualizacao(chave: string, rotulo: string) {
    setVisualizacoes((vs) => vs.map((v) => (v.chave === chave ? { ...v, rotulo } : v)))
  }

  function duplicarVisualizacao(chave: string) {
    const origem = visualizacoes.find((v) => v.chave === chave)
    if (!origem) return
    const nova: Visualizacao = {
      chave: `view-${Date.now()}`,
      rotulo: `${origem.rotulo} (cópia)`,
      aderencia: origem.aderencia && [...origem.aderencia],
      // copia os filtros sem compartilhar referência
      filtros: origem.filtros.map((f) =>
        f.tipo === "lista" ? { ...f, opcoes: [...f.opcoes], valor: [...f.valor] } : { ...f, valor: { ...f.valor } }
      ),
    }
    setVisualizacoes((vs) => {
      const i = vs.findIndex((v) => v.chave === chave)
      return [...vs.slice(0, i + 1), nova, ...vs.slice(i + 1)]
    })
    setAtiva(nova.chave)
    toast(`“${origem.rotulo}” duplicada`, { icon: <CopyIcon className="size-4" /> })
  }

  function excluirVisualizacao(chave: string) {
    if (chave === VISUALIZACAO_OBRIGATORIA) {
      toast("A visualização “Todas” não pode ser excluída", { icon: <Trash2Icon className="size-4" /> })
      return
    }
    if (visiveis.length <= 1) {
      toast("Não é possível excluir a única visualização", { icon: <Trash2Icon className="size-4" /> })
      return
    }
    const indice = visualizacoes.findIndex((v) => v.chave === chave)
    const excluida = visualizacoes[indice]
    if (!excluida) return
    const eraAtiva = ativa === chave
    const iVisivel = visiveis.findIndex((v) => v.chave === chave)
    const vizinha = visiveis[iVisivel - 1] ?? visiveis[iVisivel + 1]
    setVisualizacoes((vs) => vs.filter((v) => v.chave !== chave))
    if (eraAtiva && vizinha) setAtiva(vizinha.chave)
    toast(`“${excluida.rotulo}” excluída`, {
      icon: <Trash2Icon className="size-4" />,
      action: {
        label: "Desfazer",
        onClick: () => {
          setVisualizacoes((vs) =>
            vs.some((v) => v.chave === chave) ? vs : [...vs.slice(0, indice), excluida, ...vs.slice(indice)]
          )
          if (eraAtiva) setAtiva(chave)
        },
      },
    })
  }

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

  const quantidade = (n: number) => `${n} ${n === 1 ? "licitação" : "licitações"}`
  const mensagemResultado = carregando
    ? "Buscando licitações…"
    : q
      ? `Encontramos ${quantidade(lista.length)} com seus filtros`
      : `${quantidade(lista.length)} em ${visualizacaoAtiva?.rotulo ?? ""}`

  const filtrosAtivos = visualizacaoAtiva?.filtros ?? []

  return (
    <AppShell
      workspace={WORKSPACE}
      groups={menuLicitacoes({ ativa: "explorar", salvos: totalSalvos })}
      user={USUARIO}
      header={<span className="text-[15px] font-semibold">{SAUDACAO}</span>}
      hideHeaderOnScroll
    >
      <div className="mx-auto max-w-347 px-6 pt-6 pb-16">
        <h1 className="sr-only">Explorar licitações</h1>
        <p className="sr-only" aria-live="polite">
          {mensagemResultado}
        </p>

        {/* barra sticky: gruda logo abaixo da navbar e sobe junto quando ela se esconde */}
        <div className="sticky top-16 z-10 mb-2 bg-background py-3.5 transition-transform duration-250 ease-out group-data-[header-hidden=true]/app-shell:-translate-y-16">
          <div
            ref={barraRef}
            className={cn("flex items-center justify-between gap-x-4 gap-y-2 max-sm:flex-wrap", buscaAberta && "max-[1040px]:flex-wrap")}
          >
            <div ref={abasRef} className="min-w-0 flex-none">
              <BarraDeVisualizacoes
                visualizacoes={visiveis}
                ativa={ativa}
                contagens={contagens}
                disponivel={disponivel}
                novaPendente={novaPendente}
                onNovaTratada={novaTratada}
                onAtivar={ativar}
                onCriar={criarVisualizacao}
                onMover={moverVisualizacao}
                onRenomear={renomearVisualizacao}
                onCopiarLink={() =>
                  toast("Link da visualização copiado", { icon: <CheckIcon className="size-4 text-success" /> })
                }
                onDuplicar={duplicarVisualizacao}
                onExcluir={excluirVisualizacao}
              />
            </div>

            {/* grupo segmentado de ações */}
            <div
              ref={acoesRef}
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
                  onClick={abrirBusca}
                >
                  <SearchIcon data-icon="inline-start" />
                  Buscar
                </Button>
              )}
            </div>
          </div>

          <FiltrosDaVisualizacao key={ativa} filtros={filtrosAtivos} onAlterar={alterarFiltro} />
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
    </AppShell>
  )
}

/* ------------------------------------------------------------------ */
/* Card                                                                */
/* ------------------------------------------------------------------ */

const ADERENCIA_VISUAL: Record<Aderencia, { variante: "success" | "warning" | "destructive"; Icone: typeof CheckIcon }> = {
  aderente: { variante: "success", Icone: CheckIcon },
  duvida: { variante: "warning", Icone: CircleHelpIcon },
  nao_aderente: { variante: "destructive", Icone: XIcon },
}

function LinhaDeAderencia({ aderencia, motivo }: { aderencia: Aderencia; motivo: string }) {
  const { variante, Icone } = ADERENCIA_VISUAL[aderencia]
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <Badge variant={variante} className="h-6 rounded-md border-current/20 px-2 font-semibold">
        <Icone data-icon="inline-start" />
        {ROTULO_ADERENCIA[aderencia]}
      </Badge>
      <p className="min-w-0 text-[13px] text-muted-foreground">
        <span className="font-semibold text-foreground">Motivo:</span> {motivo}
      </p>
    </div>
  )
}

function CardDaLicitacao({
  licitacao: l,
  salvo,
  selecionada,
  onSelecionar,
  onAlternarSalvo,
}: {
  licitacao: Licitacao
  salvo: boolean
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
      highlight={<LinhaDeAderencia aderencia={l.aderencia} motivo={l.motivo} />}
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
