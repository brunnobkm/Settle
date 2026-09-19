// Tela cheia da análise de um item: cabeçalho com navegação, barra de informações do item
// (some ao rolar para baixo), resumo executivo, descrição completa e uma seção por componente.

import { useRef, useState, type ReactNode } from "react"
import {
  AlertCircleIcon,
  ArrowLeftIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  CircleHelpIcon,
  ClockIcon,
  DownloadIcon,
  LayersIcon,
  Share2Icon,
  TargetIcon,
  UploadIcon,
  XIcon,
} from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { MENSAGEM_NAO_PROTOTIPADO } from "@/settle/nao-prototipado"

import type { Reprocessamento } from "./App"
import { Checklist, type Visao } from "./Checklist"
import { BlocoDescricao } from "./Descricao"
import { Dica, useAltura, useAlturaDaJanela } from "./comum"
import {
  CATEGORIAS,
  ITENS,
  atendeTudo,
  chave,
  definirValorRequerido,
  especificacaoNaoExigida,
  formatarNumero,
  juntarUnidade,
  pendente,
  pontuar,
  resumirItem,
  separarOperador,
  valorTotal,
  type Componente,
  type ComponenteProduto,
  type Especificacao,
  type Estado,
  type LinhaChecklist,
  type Pontuacao,
  type Preferencias,
} from "./dados"
import { Matriz } from "./Matriz"
import {
  AlertaDeTrava,
  CartaoDeProcessamento,
  ConfirmarEdicao,
  ConfirmarExclusao,
  ConfirmarTrocaDeCategoria,
  EdicaoDeProduto,
  PainelDeOrigem,
} from "./Paineis"

export type AcoesDaAnalise = {
  alterarMatriz: (k: string, specs: Especificacao[]) => void
  alterarChecklist: (k: string, linhas: LinhaChecklist[]) => void
  escolher: (item: number, sku: number) => void
  preferencias: (patch: Partial<Preferencias>) => void
  trocarCategoria: (item: number, k: string, val: string) => void
}

type Props = {
  estado: Estado
  prefs: Preferencias
  semArquivo: boolean
  reprocessando: Record<number, Reprocessamento>
  resultados: Record<number, boolean>
  acoes: AcoesDaAnalise
  onAbrir: (i: number) => void
}

export function Analise({ indice, onFechar, ...props }: Props & { indice: number | null; onFechar: () => void }) {
  // guarda o último item aberto para a animação de saída
  const ultimo = useRef(indice)
  if (indice != null) ultimo.current = indice
  // visão do checklist por seção ("requisito" ou "bloco"): continua igual ao trocar de item
  const [visoes, setVisoes] = useState<Record<string, Visao>>({})

  return (
    <Dialog open={indice != null} onOpenChange={(v) => !v && onFechar()}>
      <DialogContent
        size="full"
        showCloseButton={false}
        // foca a própria janela (e não o primeiro controle), para não abrir a dica dele sozinha
        autoFocus={false}
        // Esc dentro da edição na célula cancela só a edição
        onEscapeKeyDown={(e) => {
          if (document.activeElement?.closest("[data-esc-local]")) e.preventDefault()
        }}
        className="duration-250 data-closed:slide-out-to-right data-open:slide-in-from-right"
      >
        {ultimo.current != null && (
          <Conteudo key={ultimo.current} indice={ultimo.current} visoes={visoes} onVisoes={setVisoes} {...props} />
        )}
      </DialogContent>
    </Dialog>
  )
}

type Origem = null | "tela" | "edicao"

function Conteudo({
  indice,
  estado,
  prefs,
  semArquivo,
  reprocessando,
  resultados,
  acoes,
  onAbrir,
  visoes,
  onVisoes,
}: Props & { indice: number; visoes: Record<string, Visao>; onVisoes: (v: Record<string, Visao>) => void }) {
  const it = ITENS[indice]
  const resumo = resumirItem(indice, estado)
  const multi = it.componentes.length > 1
  const repro = reprocessando[indice]
  const processando = !!repro && !repro.por
  const travadoPor = repro?.por

  /* ---------- estado da tela ---------- */
  const [metaVisivel, setMetaVisivel] = useState(true)
  const [origem, setOrigem] = useState<Origem>(null)
  const [descAberta, setDescAberta] = useState(true)
  const [secoesFechadas, setSecoesFechadas] = useState<string[]>([])
  const [editando, setEditando] = useState<string | null>(null)
  const [linhaEditando, setLinhaEditando] = useState<{ k: string; id: string } | null>(null)
  const [avisoPendente, setAvisoPendente] = useState<{ k: string; id: string; bruto: string } | null>(null)
  const [trocaPendente, setTrocaPendente] = useState<{ k: string; val: string } | null>(null)
  const [exclusao, setExclusao] = useState<{ k: string; id: string } | null>(null)
  const [alertaTrava, setAlertaTrava] = useState(false)

  /** Ação que edita: se outra pessoa está reprocessando o item, mostra o alerta. */
  const seLivre = (fn: () => void) => () => (travadoPor ? setAlertaTrava(true) : fn())

  /* ---------- alturas: o card da análise ocupa o máximo da tela ---------- */
  const janela = useAlturaDaJanela()
  const metaRef = useRef<HTMLDivElement>(null)
  const alturaMeta = useAltura(metaRef)
  const alturaUtil = janela - 64 - (metaVisivel && !processando ? alturaMeta + 1 : 0)
  const ultimoScroll = useRef(0)

  /* ---------- navegação entre itens ---------- */
  const lista = ITENS.map((_, i) => i)
  const pos = lista.indexOf(indice)

  /* ---------- matriz ---------- */
  const matriz = (k: string) => estado.matrizes[k]
  const alterarSpec = (k: string, id: string, fn: (s: Especificacao) => Especificacao) =>
    acoes.alterarMatriz(
      k,
      matriz(k).map((s) => (s.id === id ? fn(s) : s))
    )
  function aplicarValor(k: string, id: string, bruto: string) {
    const spec = matriz(k).find((s) => s.id === id)
    if (!spec) return
    const { op } = separarOperador(spec.exig)
    const convertido = !!spec.diferencial && !!bruto
    alterarSpec(k, id, (s) => definirValorRequerido(s, bruto ? (op ? op + " " : "") + juntarUnidade(bruto, s.unidade) : ""))
    setLinhaEditando(null)
    toast(convertido ? "Valor requerido definido, agora este requisito conta no atende" : "Valor requerido atualizado, análise recalculada")
  }
  function confirmarValor(k: string, id: string, bruto: string) {
    if (travadoPor) return setAlertaTrava(true)
    const spec = matriz(k).find((s) => s.id === id)
    // informar o valor de uma especificação recém-adicionada não é editar um dado extraído do edital
    if (spec?.fromDiff || prefs.warnedInline) aplicarValor(k, id, bruto)
    else setAvisoPendente({ k, id, bruto })
  }
  function adicionarNaoExigida(k: string, comp: ComponenteProduto, req: string) {
    const d = comp.catalogoNaoEdital.find((x) => x.req === req)
    if (!d || matriz(k).some((s) => s.req === req)) return
    const nova = especificacaoNaoExigida(d, comp.skus)
    acoes.alterarMatriz(k, [...matriz(k), nova])
    setLinhaEditando({ k, id: nova.id }) // abre o campo para informar o valor requerido (ou deixar como não exigido)
    toast(`"${req}" adicionada à tabela. Informe o valor requerido, ou deixe como não exigido.`)
  }
  function excluir() {
    if (!exclusao) return
    const spec = matriz(exclusao.k).find((s) => s.id === exclusao.id)
    acoes.alterarMatriz(
      exclusao.k,
      matriz(exclusao.k).filter((s) => s.id !== exclusao.id)
    )
    if (spec) toast(`"${spec.req}" removido da comparação`)
    setExclusao(null)
  }

  const temChecklist = it.componentes.some((c) => c.mecanica === "checklist")
  const compEditando = editando ? (it.componentes[+editando.split("-")[1]] as ComponenteProduto) : null

  /* ---------- corpo ---------- */
  let corpo: ReactNode
  if (processando)
    corpo = (
      <div className="flex min-h-full items-center justify-center">
        <div role="status" className="max-w-105 p-6 text-center text-sm text-muted-foreground">
          <Spinner aria-hidden className="mx-auto size-7 text-primary" />
          <p className="mt-4 leading-normal">Estamos preparando este resultado. Ele ficará disponível assim que for concluído.</p>
        </div>
      </div>
    )
  else if (semArquivo)
    corpo = (
      <div className="p-4">
        <EstadoVazio
          icone={<ClockIcon />}
          neutro
          titulo="Score pendente"
          texto="Esta licitação ainda não tem os arquivos identificados, então a análise não foi gerada. Os scores serão calculados automaticamente assim que os arquivos forem carregados."
        />
      </div>
    )
  else if (resumo.vazio)
    corpo = (
      <div className="p-4">
        <EstadoVazio
          icone={<AlertCircleIcon />}
          titulo="Item não processado"
          texto={
            <>
              A extração automática <b className="font-semibold text-foreground">não encontrou nenhuma especificação</b> para
              este item. Enquanto estiver assim, o item <b className="font-semibold text-foreground">não é marcado como “atende”</b>.
              Faça a <b className="font-semibold text-foreground">extração manual</b>: abra o edital e selecione as
              especificações para popular a análise.
            </>
          }
          acao={<Button onClick={() => setOrigem("tela")}>Extrair do edital</Button>}
        />
      </div>
    )
  else
    corpo = (
      <>
        <ResumoExecutivo indice={indice} estado={estado} />
        {/* "Descrição completa" só quando o item tem produto (software não tem descrição, decisão Alice 28/07) */}
        {it.componentes.some((c) => c.mecanica === "produto") && (
          <div className="px-4 pt-4">
            <BlocoDescricao
              texto={it.descricao || `${it.nome} ${it.resumoTR}`}
              aberto={descAberta}
              onAlternar={() => setDescAberta((v) => !v)}
              onVerNoEdital={() => setOrigem("tela")}
            />
          </div>
        )}
        <div className="flex flex-col gap-4 p-4">
          {it.componentes.map((comp, ci) => {
            const k = chave(indice, ci)
            const rc = resumo.comps[ci]
            const aberta = !secoesFechadas.includes(k)
            const alternar = () => setSecoesFechadas((f) => (aberta ? [...f, k] : f.filter((x) => x !== k)))
            if (comp.mecanica === "produto") {
              const specs = matriz(k)
              const nenhum = !!estado.nenhumProduto[k]
              const best = rc.mecanica === "produto" ? rc.best : undefined
              const escolhido = prefs.chosen[indice]
              const disponiveis = comp.catalogoNaoEdital.filter((d) => !specs.some((s) => s.req === d.req))
              return (
                <Secao
                  key={k}
                  comp={comp}
                  categoria={estado.categorias[k]}
                  multi={multi}
                  alturaUtil={alturaUtil}
                  aberta={aberta}
                  onAlternar={alternar}
                  travado={!!travadoPor}
                  onTravado={() => setAlertaTrava(true)}
                  onPedirTroca={(val) => setTrocaPendente({ k, val })}
                  resumo={<ResumoDoProduto comp={comp} best={best} escolhido={escolhido} nenhum={nenhum} />}
                  status={<StatusDoProduto best={best} nenhum={nenhum} />}
                  botoes={
                    <Button size="sm" className="text-[12.5px] font-semibold" onClick={seLivre(() => setEditando(k))}>
                      Editar informações
                    </Button>
                  }
                >
                  {(alturaDisponivel) =>
                    nenhum ? (
                      <EstadoVazio
                        icone={<AlertCircleIcon />}
                        titulo="Nenhum produto se aplica"
                        texto={
                          <>
                            Os produtos do seu catálogo não correspondem à categoria{" "}
                            <b className="font-semibold text-foreground">“{estado.categorias[k]}”</b>. Verifique se a categoria
                            está correta (use o seletor no topo).
                          </>
                        }
                      />
                    ) : (
                      <Matriz
                        specs={specs}
                        skus={comp.skus}
                        escolhido={escolhido}
                        larguras={prefs.colW}
                        alturaDisponivel={alturaDisponivel}
                        linhaEditando={linhaEditando?.k === k ? linhaEditando.id : null}
                        disponiveis={disponiveis.map((d) => d.req)}
                        travado={!!travadoPor}
                        onTravado={() => setAlertaTrava(true)}
                        onLarguras={(colW) => acoes.preferencias({ colW })}
                        onIniciarEdicao={(id) => setLinhaEditando({ k, id })}
                        onCancelarEdicao={() => setLinhaEditando(null)}
                        onConfirmarEdicao={(id, bruto) => confirmarValor(k, id, bruto)}
                        onVerOrigem={() => setOrigem("tela")}
                        onEscolher={(sku) => acoes.escolher(indice, sku)}
                        onRemover={(id) => setExclusao({ k, id })}
                        onAdicionar={(req) => adicionarNaoExigida(k, comp, req)}
                      />
                    )
                  }
                </Secao>
              )
            }
            return (
              <Secao
                key={k}
                comp={comp}
                categoria={estado.categorias[k]}
                multi={multi}
                alturaUtil={alturaUtil}
                aberta={aberta}
                onAlternar={alternar}
                travado={!!travadoPor}
                onTravado={() => setAlertaTrava(true)}
                onPedirTroca={(val) => setTrocaPendente({ k, val })}
                botoes={
                  <>
                    <Button
                      size="sm"
                      className="text-[12.5px] font-semibold"
                      onClick={seLivre(() => toast(MENSAGEM_NAO_PROTOTIPADO))}
                    >
                      Revisar requisitos
                    </Button>
                    <Button
                      size="sm"
                      className="text-[12.5px] font-semibold"
                      onClick={seLivre(() => toast(MENSAGEM_NAO_PROTOTIPADO))}
                    >
                      Concluir análise
                    </Button>
                  </>
                }
              >
                {(alturaDisponivel) => (
                  <Checklist
                    linhas={estado.checklists[k]}
                    visao={visoes[k] ?? "requisito"}
                    onVisao={(v) => onVisoes({ ...visoes, [k]: v })}
                    alturaDisponivel={alturaDisponivel}
                    travado={!!travadoPor}
                    onTravado={() => setAlertaTrava(true)}
                    onStatus={(id, st) =>
                      acoes.alterarChecklist(
                        k,
                        estado.checklists[k].map((r) => (r.id === id ? { ...r, st } : r))
                      )
                    }
                    onVerOrigem={() => setOrigem("tela")}
                  />
                )}
              </Secao>
            )
          })}
        </div>
      </>
    )

  const info = [
    { rotulo: "Unidade de medida", valor: it.unidadeMedida || "unidade" },
    { rotulo: "Quantidade", valor: it.quantidade },
    { rotulo: "Valor unitário", valor: formatarNumero(it.precoUnit), dinheiro: true },
    {
      rotulo: "Valor total",
      valor: formatarNumero(valorTotal(it)),
      dinheiro: true,
      dica: "Calculado automaticamente: quantidade × valor unitário",
    },
  ]

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col transition-[padding] duration-200", origem === "tela" && "sm:pr-110")}>
      <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b bg-background px-5">
        <div className="flex min-w-0 items-center gap-2.5">
          <DialogClose asChild>
            <Button variant="outline" size="icon-sm" aria-label="Voltar" className="text-muted-foreground">
              <ArrowLeftIcon />
            </Button>
          </DialogClose>
          <DialogTitle className="truncate text-base font-semibold">{it.titulo || it.nome}</DialogTitle>
          <DialogDescription className="sr-only">
            Análise técnica do item {it.numero} do edital: {it.nome}
          </DialogDescription>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {lista.length > 1 && (
            <nav aria-label="Navegar entre itens" className="mr-1.5 flex items-center gap-1">
              <Dica texto="Item anterior">
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label="Item anterior"
                  disabled={pos === 0}
                  onClick={() => onAbrir(lista[pos - 1])}
                >
                  <ChevronLeftIcon />
                </Button>
              </Dica>
              <span className="px-1 text-[12.5px] whitespace-nowrap text-muted-foreground tabular-nums">
                {pos + 1} de {lista.length}
              </span>
              <Dica texto="Próximo item">
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label="Próximo item"
                  disabled={pos === lista.length - 1}
                  onClick={() => onAbrir(lista[pos + 1])}
                >
                  <ChevronRightIcon />
                </Button>
              </Dica>
            </nav>
          )}
          <Button variant="outline" size="icon-sm" aria-label="Compartilhar" className="text-muted-foreground" data-nao-prototipado>
            <Share2Icon />
          </Button>
          {/* Importar só aparece em itens com software (checklist) */}
          {temChecklist && !resumo.vazio && (
            <Dica texto="Importar (planilha ou modelo)">
              <Button variant="outline" size="icon-sm" aria-label="Importar" className="text-muted-foreground" data-nao-prototipado>
                <UploadIcon />
              </Button>
            </Dica>
          )}
          <Button variant="outline" size="icon-sm" aria-label="Baixar" className="text-muted-foreground" data-nao-prototipado>
            <DownloadIcon />
          </Button>
        </div>
      </header>

      {/* barra de informações do item: some ao rolar para baixo e reaparece ao subir */}
      {!processando && (
        <div
          className={cn(
            "shrink-0 overflow-hidden border-b transition-[max-height,opacity,border-color] duration-200",
            metaVisivel ? "max-h-30 opacity-100" : "max-h-0 border-transparent opacity-0"
          )}
        >
          <div ref={metaRef} className="flex flex-wrap gap-x-5 gap-y-1.5 px-5 py-3 text-[12.5px]">
            {info.map((m) => {
              const chip = (
                <span
                  className={cn("inline-flex items-center gap-1.25 rounded-md border bg-muted px-2.25 py-0.75", m.dica && "cursor-help")}
                  {...(m.dica && { tabIndex: 0 })}
                >
                  <span className="font-semibold">{m.rotulo}:</span>
                  {m.dinheiro && <span className="text-muted-foreground">R$</span>}
                  <span className={cn(m.dinheiro && "font-mono")}>{m.valor}</span>
                </span>
              )
              return m.dica ? (
                <Dica key={m.rotulo} texto={m.dica}>
                  {chip}
                </Dica>
              ) : (
                <span key={m.rotulo}>{chip}</span>
              )
            })}
          </div>
        </div>
      )}

      <div
        className="min-h-0 flex-1 overflow-auto [scrollbar-gutter:stable]"
        onScroll={(e) => {
          const st = e.currentTarget.scrollTop
          if (st <= 4) setMetaVisivel(true)
          else if (st > ultimoScroll.current + 4) setMetaVisivel(false)
          else if (st < ultimoScroll.current - 4) setMetaVisivel(true)
          ultimoScroll.current = st
        }}
      >
        {corpo}
      </div>

      <CartaoDeProcessamento resultados={resultados} onAbrir={onAbrir} />

      <PainelDeOrigem aberta={origem != null} aoLadoDaEdicao={origem === "edicao"} onFechar={() => setOrigem(null)} />

      {compEditando && editando && (
        <EdicaoDeProduto
          aberta
          specs={matriz(editando)}
          comp={compEditando}
          descricao={it.descricao || `${it.nome} ${it.resumoTR}`}
          onVerNoEdital={() => setOrigem("edicao")}
          onFechar={() => {
            setEditando(null)
            setOrigem((o) => (o === "edicao" ? null : o))
          }}
          onSalvar={(novas) => {
            acoes.alterarMatriz(editando, novas)
            setEditando(null)
            setOrigem((o) => (o === "edicao" ? null : o))
            toast("Análise reprocessada com as novas informações")
          }}
        />
      )}

      <ConfirmarEdicao
        aberta={!!avisoPendente}
        onCancelar={() => setAvisoPendente(null)}
        onConfirmar={() => {
          if (!avisoPendente) return
          acoes.preferencias({ warnedInline: true })
          aplicarValor(avisoPendente.k, avisoPendente.id, avisoPendente.bruto)
          setAvisoPendente(null)
        }}
      />
      <ConfirmarTrocaDeCategoria
        categoria={trocaPendente?.val ?? null}
        onCancelar={() => setTrocaPendente(null)}
        onConfirmar={() => {
          if (!trocaPendente) return
          setOrigem(null)
          setLinhaEditando(null)
          acoes.trocarCategoria(indice, trocaPendente.k, trocaPendente.val)
          setTrocaPendente(null)
        }}
      />
      <ConfirmarExclusao aberta={!!exclusao} onCancelar={() => setExclusao(null)} onConfirmar={excluir} />
      <AlertaDeTrava por={alertaTrava ? (travadoPor ?? null) : null} onFechar={() => setAlertaTrava(false)} />
    </div>
  )
}

/* ============================================================
   Resumo executivo dentro do item
   produto: por SKU · software: por requisito (7 indicadores)
   ============================================================ */
type Tom = "" | "ok" | "warn" | "bad" | "brand"
const TOM: Record<Tom, string> = {
  "": "bg-muted text-muted-foreground",
  ok: "bg-success/10 text-success",
  warn: "bg-warning/10 text-warning",
  bad: "bg-destructive/10 text-destructive",
  brand: "bg-primary/10 text-primary",
}

function Indicador({ tom, icone, valor, rotulo, dica }: { tom: Tom; icone: ReactNode; valor: ReactNode; rotulo: string; dica: string }) {
  // sem ícone de informação: a dica aparece ao passar o mouse no indicador inteiro
  return (
    <Dica texto={dica}>
      <div tabIndex={0} className="flex cursor-help flex-col gap-2 rounded-lg border bg-card px-3.5 py-3 outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
        <div className="flex items-center gap-2.5">
          <span className={cn("grid size-7.5 shrink-0 place-items-center rounded-lg [&_svg]:size-4", TOM[tom])} aria-hidden>
            {icone}
          </span>
          <span className="text-[22px] leading-none font-bold tabular-nums">{valor}</span>
        </div>
        <span className="text-[13px] leading-tight text-muted-foreground">{rotulo}</span>
      </div>
    </Dica>
  )
}

function ResumoExecutivo({ indice, estado }: { indice: number; estado: Estado }) {
  const it = ITENS[indice]
  const misto = it.componentes.some((c) => c.mecanica === "produto") && it.componentes.some((c) => c.mecanica === "checklist")
  // item misto: os resumos ficam empilhados, cada um com a legenda da seção
  const ordem = [...it.componentes.entries()].sort(([, a], [, b]) => (a.mecanica === b.mecanica ? 0 : a.mecanica === "produto" ? -1 : 1))
  return (
    <>
      {ordem.map(([ci, comp], n) => {
        const k = chave(indice, ci)
        return (
          <div key={k} className={cn("px-4", n === 0 ? "pt-4" : "pt-1")}>
            {misto && <div className="mb-2.5 text-[12.5px] font-semibold text-muted-foreground">{estado.categorias[k]}</div>}
            {comp.mecanica === "produto" ? (
              <IndicadoresDoProduto specs={estado.matrizes[k]} comp={comp} />
            ) : (
              <IndicadoresDoChecklist linhas={estado.checklists[k]} />
            )}
          </div>
        )
      })}
    </>
  )
}

function IndicadoresDoProduto({ specs, comp }: { specs: Especificacao[]; comp: ComponenteProduto }) {
  const p = pontuar(specs, comp.skus)
  const atende = p.filter((s) => s.evaluable > 0 && s.ne === 0 && s.pct === 100).length
  const nao = p.filter((s) => s.diverg.length > 0).length
  const pendentes = p.filter((s) => s.ne > 0 && !s.diverg.length).length
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3">
      <Indicador tom="" icone={<LayersIcon />} valor={p.length} rotulo="SKUs analisados" dica="Produtos (SKUs) do seu catálogo comparados com as exigências deste item." />
      <Indicador tom="ok" icone={<CheckIcon />} valor={atende} rotulo="Atende" dica="SKUs que cumprem 100% das especificações exigidas pelo edital." />
      <Indicador tom="bad" icone={<XIcon />} valor={nao} rotulo="Não atende" dica="SKUs que não cumprem todas as especificações exigidas." />
      {pendentes > 0 && (
        <Indicador
          tom="warn"
          icone={<CircleHelpIcon />}
          valor={pendentes}
          rotulo="Análise pendente"
          dica="SKUs sem divergências identificadas, mas com especificações que ainda precisam ser analisadas."
        />
      )}
    </div>
  )
}

function IndicadoresDoChecklist({ linhas }: { linhas: LinhaChecklist[] }) {
  const n = { ok: 0, parcial: 0, parceiro: 0, no: 0, ne: 0 }
  linhas.forEach((r) => (n[r.st] += 1))
  const avaliaveis = n.ok + n.parcial + n.parceiro + n.no
  const pct = avaliaveis ? Math.round(((n.ok + n.parceiro) / avaliaveis) * 100) : 0
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(128px,1fr))] gap-3">
      <Indicador tom="brand" icone={<TargetIcon />} valor={`${pct}%`} rotulo="Percentual de aderência" dica="Percentual de requisitos atendidos (inclui os atendidos com parceiro)." />
      <Indicador tom="" icone={<LayersIcon />} valor={linhas.length} rotulo="Total de requisitos" dica="Quantidade total de requisitos deste software." />
      <Indicador tom="ok" icone={<CheckIcon />} valor={n.ok} rotulo="Atende" dica="Requisitos que a sua solução atende integralmente." />
      <Indicador tom="warn" icone={<CheckIcon />} valor={n.parcial} rotulo="Atende parcialmente" dica="Requisitos atendidos apenas em parte." />
      <Indicador tom="warn" icone={<CheckIcon />} valor={n.parceiro} rotulo="Atende com parceiro" dica="Requisitos que você atende com apoio de um parceiro." />
      <Indicador tom="bad" icone={<XIcon />} valor={n.no} rotulo="Não atende" dica="Requisitos que a sua solução não atende." />
      <Indicador tom="" icone={<CircleHelpIcon />} valor={n.ne} rotulo="Falta analisar" dica="Requisitos que ainda não foram analisados." />
    </div>
  )
}

/* ============================================================
   Seção de um componente (produto ou checklist)
   ============================================================ */
function Secao({
  comp,
  categoria,
  multi,
  alturaUtil,
  aberta,
  onAlternar,
  travado,
  onTravado,
  onPedirTroca,
  resumo,
  status,
  botoes,
  children,
}: {
  comp: Componente
  categoria: string
  multi: boolean
  alturaUtil: number
  aberta: boolean
  onAlternar: () => void
  travado: boolean
  onTravado: () => void
  onPedirTroca: (val: string) => void
  resumo?: ReactNode
  status?: ReactNode
  botoes: ReactNode
  /** recebe a altura disponível para a tabela (undefined = item com várias seções) */
  children: (alturaDisponivel: number | undefined) => ReactNode
}) {
  const cabecalhoRef = useRef<HTMLDivElement>(null)
  const alturaCabecalho = useAltura(cabecalhoRef)
  // 32 = padding vertical do corpo do card; 32 = 16 acima do card + 16 abaixo
  const alturaDisponivel = multi ? undefined : alturaUtil - alturaCabecalho - 32 - 32

  const bloquear = (e: { preventDefault: () => void }) => {
    e.preventDefault()
    onTravado()
  }

  return (
    <section aria-label={categoria} className="rounded-lg border bg-card">
      <div
        ref={cabecalhoRef}
        className={cn("flex min-h-13 cursor-pointer flex-wrap items-center gap-3 p-4 select-none", aberta && "border-b")}
        onClick={(e) => {
          if ((e.target as Element).closest("button, a, [role=menuitem]")) return
          onAlternar()
        }}
      >
        {/* categoria = com qual catálogo o item é comparado; trocar reprocessa a seção */}
        <DropdownMenu>
          <Dica texto="Categoria usada para comparar com o catálogo. Clique para trocar.">
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-auto gap-1.5 bg-muted px-2.5 py-1 text-[15px] font-semibold shadow-none hover:border-foreground/20 hover:bg-muted"
                onPointerDown={(e) => travado && bloquear(e)}
                onKeyDown={(e) => travado && ["Enter", " ", "ArrowDown"].includes(e.key) && bloquear(e)}
              >
                {categoria}
                <ChevronDownIcon data-icon="inline-end" className="text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
          </Dica>
          <DropdownMenuContent className="min-w-48">
            <DropdownMenuGroup>
              {CATEGORIAS[comp.mecanica].map((o) => (
                <DropdownMenuItem key={o} onSelect={() => o !== categoria && onPedirTroca(o)} className="justify-between gap-2.5">
                  {o}
                  {o === categoria && <CheckIcon aria-label="atual" className="text-primary" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <span className="ml-auto min-w-0 truncate text-[12.5px] text-muted-foreground">{resumo}</span>
        {status}
        {botoes}
        <button
          type="button"
          aria-expanded={aberta}
          aria-label={aberta ? "Recolher seção" : "Expandir seção"}
          onClick={onAlternar}
          className="grid size-6 place-items-center rounded-md text-muted-foreground outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {aberta ? <ChevronUpIcon className="size-4" /> : <ChevronDownIcon className="size-4" />}
        </button>
      </div>
      {aberta && <div className="p-4">{children(alturaDisponivel)}</div>}
    </section>
  )
}

/** A escolha substitui a recomendação; sem atender, não há produto recomendado. */
function ResumoDoProduto({
  comp,
  best,
  escolhido,
  nenhum,
}: {
  comp: ComponenteProduto
  best: Pontuacao | undefined
  escolhido: number | undefined
  nenhum: boolean
}) {
  if (nenhum) return null
  if (escolhido != null && comp.skus[escolhido]) {
    const s = comp.skus[escolhido]
    return (
      <Badge variant="success" className="h-auto max-w-full rounded-full border-success/10 px-2.5 font-medium">
        <CheckIcon data-icon="inline-start" />
        <b className="font-semibold">Produto escolhido:</b>
        <span className="truncate">
          <span className="font-mono">{s.model}</span> · {s.brand}
        </span>
      </Badge>
    )
  }
  if (!atendeTudo(best) || !best) return null
  return (
    <Badge variant="outline" className="h-auto max-w-full rounded-full bg-muted px-2.5 font-medium">
      <b className="font-semibold">Melhor produto:</b>
      <span className="truncate">
        <span className="font-mono">{best.sku.model}</span> · {best.sku.brand}
      </span>
    </Badge>
  )
}

function StatusDoProduto({ best, nenhum }: { best: Pontuacao | undefined; nenhum: boolean }) {
  if (!nenhum && atendeTudo(best)) return <Badge variant="success">Atende</Badge>
  if (!nenhum && pendente(best)) return <Badge variant="warning">Análise pendente</Badge>
  return <Badge variant="destructive">Não atende</Badge>
}

function EstadoVazio({
  icone,
  titulo,
  texto,
  acao,
  neutro,
}: {
  icone: ReactNode
  titulo: string
  texto: ReactNode
  acao?: ReactNode
  neutro?: boolean
}) {
  return (
    <Empty className="gap-2.5 px-6 py-12">
      <EmptyHeader className="max-w-115 gap-2.5">
        <EmptyMedia
          className={cn(
            "mb-0 size-10 rounded-full [&_svg]:size-5.5",
            neutro ? "bg-muted text-muted-foreground" : "bg-warning/10 text-warning"
          )}
        >
          {icone}
        </EmptyMedia>
        <EmptyTitle className="text-base font-semibold">{titulo}</EmptyTitle>
        <EmptyDescription className="text-[13.5px] leading-relaxed">{texto}</EmptyDescription>
      </EmptyHeader>
      {acao && <EmptyContent className="mt-1.5">{acao}</EmptyContent>}
    </Empty>
  )
}
