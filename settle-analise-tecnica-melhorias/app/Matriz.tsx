// Seção de PRODUTO: tabela que compara os SKUs do catálogo com as exigências do edital.
// Linhas = requisitos; colunas fixas "Especificações do edital" e "Valor requerido"; uma coluna
// por SKU, na ordem da aderência. A rolagem acontece dentro do card, com o cabeçalho e as duas
// primeiras colunas travados. Só o valor requerido é editável (na célula ou pelo sheet).

import { useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react"
import {
  AlertCircleIcon,
  ArrowUpRightIcon,
  BookOpenIcon,
  CheckIcon,
  CircleCheckIcon,
  CircleXIcon,
  CopyIcon,
  GlobeIcon,
  PencilIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { copiar, Dica, FUNDO, HOVER_LINHA, Truncado, useAltura, useLarguraInterna } from "./comum"
import {
  formatarBRL,
  pontuar,
  ranquear,
  separadorDeUnidade,
  separarOperador,
  tirarUnidade,
  VAZIO,
  type Celula,
  type Especificacao,
  type Sku,
} from "./dados"

const LARGURA_PADRAO = (k: string) => (k === "req" ? 300 : k === "val" ? 160 : k === "acoes" ? 84 : 192)
const LARGURA_MINIMA = 90
const CONGELADAS = ["req", "val"]

type Coluna = { key: string; skuIdx?: number; w: number; frozen: boolean; left?: number; edge?: boolean }

export function Matriz({
  specs,
  skus,
  escolhido,
  larguras,
  alturaDisponivel,
  linhaEditando,
  disponiveis,
  travado,
  onTravado,
  onLarguras,
  onIniciarEdicao,
  onCancelarEdicao,
  onConfirmarEdicao,
  onVerOrigem,
  onEscolher,
  onRemover,
  onAdicionar,
}: {
  specs: Especificacao[]
  skus: Sku[]
  escolhido?: number
  larguras: Record<string, number>
  /** altura livre para a tabela + rodapé; undefined = item com várias seções (60% da tela) */
  alturaDisponivel: number | undefined
  linhaEditando: string | null
  /** especificações do catálogo, não exigidas pelo edital, que ainda podem entrar na tabela */
  disponiveis: string[]
  travado: boolean
  onTravado: () => void
  onLarguras: (l: Record<string, number>) => void
  onIniciarEdicao: (id: string) => void
  onCancelarEdicao: () => void
  onConfirmarEdicao: (id: string, bruto: string) => void
  onVerOrigem: () => void
  onEscolher: (sku: number) => void
  onRemover: (id: string) => void
  onAdicionar: (req: string) => void
}) {
  const pontuacoes = pontuar(specs, skus)
  const ordem = ranquear(pontuacoes).map((p) => p.i)
  const largura = (k: string) => larguras[k] ?? LARGURA_PADRAO(k)
  const livre = (fn: () => void) => () => (travado ? onTravado() : fn())

  /* ---------- altura: automática, com teto (poucas linhas ficam compactas, muitas rolam) ---------- */
  const rodapeRef = useRef<HTMLElement>(null)
  const alturaRodape = useAltura(rodapeRef)
  const alturaMaxima = alturaDisponivel != null ? `${Math.max(240, Math.round(alturaDisponivel - alturaRodape))}px` : "60vh"

  /* ---------- colunas: a tabela sempre preenche; o espaço extra vai para as colunas de SKU ---------- */
  const caixaRef = useRef<HTMLDivElement>(null)
  const disponivel = useLarguraInterna(caixaRef)
  const colunas: Coluna[] = [
    { key: "req" },
    { key: "val" },
    ...ordem.map((i) => ({ key: `sku-${i}`, skuIdx: i })),
    { key: "acoes" },
  ].map((c) => ({ ...c, w: largura(c.key), frozen: CONGELADAS.includes(c.key) }))
  const base = colunas.reduce((s, c) => s + c.w, 0)
  let acumulado = 0
  colunas.forEach((c) => {
    if (c.frozen) {
      c.left = acumulado
      acumulado += c.w
    }
  })
  const ultimaCongelada = colunas.filter((c) => c.frozen).at(-1)
  if (ultimaCongelada) ultimaCongelada.edge = true
  const nSku = colunas.filter((c) => c.skuIdx != null).length
  const extra = nSku && disponivel > base + 1 ? Math.floor((disponivel - base) / nSku) : 0
  const larguraFinal = (c: Coluna) => c.w + (c.skuIdx != null ? extra : 0)
  const larguraTabela = extra ? disponivel : base

  const fixa = (c: Coluna) => cn(c.frozen && "sticky z-2", c.edge && "shadow-[2px_0_0_var(--border)]")
  const posicao = (c: Coluna): CSSProperties | undefined => (c.frozen ? { left: c.left } : undefined)

  /* ---------- redimensionar coluna ---------- */
  const [redimensionando, setRedimensionando] = useState<string | null>(null)
  function iniciarRedimensionar(e: ReactPointerEvent, key: string) {
    e.preventDefault()
    setRedimensionando(key)
    const inicioX = e.clientX
    const inicioW = largura(key)
    let atual = { ...larguras }
    let quadro = 0
    const mover = (ev: PointerEvent) => {
      atual = { ...atual, [key]: Math.max(LARGURA_MINIMA, Math.round(inicioW + (ev.clientX - inicioX))) }
      cancelAnimationFrame(quadro)
      quadro = requestAnimationFrame(() => onLarguras(atual))
    }
    const soltar = () => {
      cancelAnimationFrame(quadro)
      onLarguras(atual)
      setRedimensionando(null)
      window.removeEventListener("pointermove", mover)
      window.removeEventListener("pointerup", soltar)
    }
    window.addEventListener("pointermove", mover)
    window.addEventListener("pointerup", soltar)
  }
  const alca = (c: Coluna) => (
    <Dica texto="Arraste para redimensionar a largura">
      <span
        aria-hidden
        onPointerDown={(e) => iniciarRedimensionar(e, c.key)}
        className={cn(
          "absolute top-0 right-0 z-7 h-full w-2 cursor-col-resize after:absolute after:top-0 after:right-0.75 after:h-full after:w-0.5 hover:after:bg-primary",
          redimensionando === c.key && "after:bg-primary"
        )}
      />
    </Dica>
  )

  // preço e estoque: reserva o espaço quando ALGUM SKU tem a informação (alinha as alturas); se nenhum tiver, colapsa
  const algumPreco = skus.some((s) => s.preco != null)
  const algumEstoque = skus.some((s) => s.estoque != null)
  const cabecalhoFixo = "px-4 py-3 align-bottom text-[13px] font-semibold text-muted-foreground bg-muted"

  return (
    <div>
      <div ref={caixaRef} className="overflow-auto" style={{ maxHeight: alturaMaxima }}>
        <table className="table-fixed border-separate border-spacing-0 text-sm" style={{ width: larguraTabela }}>
          <colgroup>
            {colunas.map((c) => (
              <col key={c.key} style={{ width: larguraFinal(c) }} />
            ))}
          </colgroup>
          <thead>
            <tr>
              {colunas.map((c) => {
                const th = "sticky top-0 z-3 overflow-hidden border-b text-left"
                if (c.key === "req" || c.key === "val")
                  return (
                    <th key={c.key} scope="col" style={posicao(c)} className={cn(th, cabecalhoFixo, fixa(c), "z-5")}>
                      {c.key === "req" ? "Especificações do edital" : "Valor requerido"}
                      {alca(c)}
                    </th>
                  )
                if (c.key === "acoes")
                  return (
                    <th key={c.key} scope="col" className={cn(th, "px-3.5 py-3 align-bottom text-[13px] font-semibold text-muted-foreground bg-muted")}>
                      Ações
                    </th>
                  )
                const idx = c.skuIdx!
                const p = pontuacoes[idx]
                const sku = p.sku
                const selecionado = escolhido === idx
                return (
                  <th
                    key={c.key}
                    scope="col"
                    style={posicao(c)}
                    className={cn(
                      th,
                      "px-3.5 py-2.5 align-top font-normal",
                      selecionado ? cn(FUNDO.marca, "shadow-[inset_0_2px_0_var(--primary)]") : "bg-background",
                      fixa(c)
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <FonteDoSku sku={sku} />
                      <div className="min-w-0 flex-1">
                        <Truncado texto={sku.model} className="font-mono text-sm font-semibold" />
                        <Truncado texto={sku.brand} className="text-xs text-muted-foreground" />
                      </div>
                    </div>
                    <div className="mt-2.5 flex items-baseline gap-1.5 text-[13px] leading-none font-semibold">
                      <span>{p.pct}%</span>
                      <span className="text-muted-foreground tabular-nums">
                        {p.ok}/{p.evaluable + p.ne}
                      </span>
                    </div>
                    {p.ne > 0 && <div className="mt-1 text-[13px] leading-snug font-semibold">{p.ne} especificações pendentes</div>}
                    {/* barra: trilho cinza no 0%, âmbar de 1% a 99%, verde em 100% */}
                    <div aria-hidden className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-border">
                      <div
                        className={cn("h-full rounded-full", p.pct >= 100 ? "bg-success" : "bg-warning")}
                        style={{ width: `${p.pct}%` }}
                      />
                    </div>
                    {algumPreco && (
                      <div className="mt-2 font-mono text-[13px] font-bold">{sku.preco != null ? formatarBRL(sku.preco) : " "}</div>
                    )}
                    {algumEstoque && (
                      <div className="mt-2 flex min-h-6 items-center">
                        {sku.estoque === true && (
                          <Badge variant="success" className="h-auto px-1.75 py-px text-[10px] font-semibold">
                            Com estoque
                          </Badge>
                        )}
                        {sku.estoque === false && (
                          <Badge variant="warning" className="h-auto px-1.75 py-px text-[10px] font-semibold">
                            Sem estoque
                          </Badge>
                        )}
                      </div>
                    )}
                    <Button
                      size="xs"
                      aria-pressed={selecionado}
                      aria-label={`${selecionado ? "Remover seleção de" : "Selecionar"} ${sku.model}`}
                      className="mt-2.5 w-full text-xs font-semibold"
                      onClick={livre(() => onEscolher(idx))}
                    >
                      {selecionado && <CheckIcon data-icon="inline-start" />}
                      {selecionado ? "Selecionado" : "Selecionar"}
                    </Button>
                    {alca(c)}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {specs.map((spec) => {
              if (spec.exigNa) return null
              const editando = linhaEditando === spec.id
              return (
                <tr key={spec.id} className="group/row">
                  {colunas.map((c) => {
                    const td = "overflow-hidden border-b align-top"
                    if (c.key === "req")
                      return (
                        <th
                          key={c.key}
                          scope="row"
                          style={posicao(c)}
                          className={cn(td, "bg-background px-4 py-3 text-left font-medium", HOVER_LINHA, fixa(c))}
                        >
                          {spec.req}
                        </th>
                      )
                    if (c.key === "val")
                      return (
                        <td
                          key={c.key}
                          style={posicao(c)}
                          className={cn(
                            "border-b bg-background px-4 py-3 align-top font-mono hover:z-4 focus-within:z-4",
                            HOVER_LINHA,
                            fixa(c)
                          )}
                        >
                          {editando ? (
                            <EdicaoNaCelula
                              spec={spec}
                              onConfirmar={(bruto) => onConfirmarEdicao(spec.id, bruto)}
                              onCancelar={onCancelarEdicao}
                            />
                          ) : (
                            <ValorRequerido
                              spec={spec}
                              onEditar={livre(() => onIniciarEdicao(spec.id))}
                              onVerOrigem={onVerOrigem}
                            />
                          )}
                        </td>
                      )
                    if (c.key === "acoes")
                      return (
                        <td key={c.key} className={cn(td, "px-3.5 py-2.5")}>
                          {spec.fromDiff && (
                            <Dica texto="Remover da comparação">
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`Remover ${spec.req} da comparação`}
                                className="size-7 text-muted-foreground opacity-65 group-hover/row:opacity-100 hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100"
                                onClick={livre(() => onRemover(spec.id))}
                              >
                                <Trash2Icon />
                              </Button>
                            </Dica>
                          )}
                        </td>
                      )
                    const ci = c.skuIdx!
                    return (
                      <CelulaSku
                        key={c.key}
                        cell={spec.cells[ci]}
                        unidade={spec.unidade}
                        escolhida={ci === escolhido}
                        className={cn(td, fixa(c))}
                        style={posicao(c)}
                      />
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* adicionar requisito acontece só aqui (e no sheet de editar), nunca solto na tabela */}
      <footer ref={rodapeRef} className="border-t py-3">
        <MenuDeNaoExigidas disponiveis={disponiveis} travado={travado} onTravado={onTravado} onEscolher={onAdicionar} />
      </footer>
    </div>
  )
}

/** Botão "Adicionar especificação": lista as especificações do catálogo que o edital não exige. */
export function MenuDeNaoExigidas({
  disponiveis,
  travado,
  onTravado,
  onEscolher,
}: {
  disponiveis: string[]
  travado: boolean
  onTravado: () => void
  onEscolher: (req: string) => void
}) {
  const escolheu = useRef(false)
  const bloquear = (e: { preventDefault: () => void }) => {
    e.preventDefault()
    onTravado()
  }
  const botao = (
    <Button
      size="sm"
      disabled={!disponiveis.length}
      className="max-w-full text-[12.5px] font-semibold"
      onPointerDown={(e) => travado && bloquear(e)}
      onKeyDown={(e) => travado && ["Enter", " ", "ArrowDown"].includes(e.key) && bloquear(e)}
    >
      Adicionar especificação
    </Button>
  )
  if (!disponiveis.length)
    return (
      <Dica texto="Todas as especificações adicionadas">
        <span tabIndex={0} className="inline-flex w-fit rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
          {botao}
        </span>
      </Dica>
    )
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{botao}</DropdownMenuTrigger>
      <DropdownMenuContent
        aria-label="Especificações não exigidas pelo edital"
        className="max-h-80"
        // ao escolher, o foco vai para o campo do valor requerido da nova linha
        onCloseAutoFocus={(e) => {
          if (escolheu.current) e.preventDefault()
          escolheu.current = false
        }}
      >
        <DropdownMenuGroup>
          {disponiveis.map((req) => (
            <DropdownMenuItem
              key={req}
              className="text-[13px]"
              onSelect={() => {
                escolheu.current = true
                onEscolher(req)
              }}
            >
              {req}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** Ícone da origem do dado: livro = catálogo do cliente, globo = internet. Verde com link, cinza sem. */
function FonteDoSku({ sku }: { sku: Sku }) {
  const internet = sku.origem === "internet"
  const Icone = internet ? GlobeIcon : BookOpenIcon
  const fonte = internet ? "Fonte: Internet (catálogo externo)" : "Fonte: Catálogo"
  const temLink = internet || !!sku.datasheet
  if (temLink)
    return (
      <Dica texto={`${fonte}, clique para abrir`}>
        <button
          type="button"
          aria-label={`${fonte}: abrir a origem de ${sku.model}`}
          data-nao-prototipado
          className="mt-px grid size-6 shrink-0 place-items-center rounded-md border bg-background text-primary outline-none hover:border-primary hover:bg-primary/10 focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:size-3.75"
        >
          <Icone />
        </button>
      </Dica>
    )
  return (
    <Dica texto={`${fonte}, sem link para abrir (não temos o datasheet deste produto)`}>
      <span
        tabIndex={0}
        aria-label={`${fonte}, sem link para abrir`}
        className="mt-px grid size-6 shrink-0 place-items-center rounded-md border border-dashed bg-background text-muted-foreground opacity-70 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:size-3.75"
      >
        <Icone />
      </span>
    </Dica>
  )
}

/** Chip do valor requerido. Ao passar o mouse aparece o grupo de ações: editar, ver origem, copiar. */
function ValorRequerido({ spec, onEditar, onVerOrigem }: { spec: Especificacao; onEditar: () => void; onVerOrigem: () => void }) {
  const { op, resto } = separarOperador(spec.exig)
  const vazio = spec.diferencial && !spec.exig
  const chip = "inline-flex max-w-full min-w-0 items-center gap-1.25 rounded-md border bg-muted px-2.25 py-0.75 text-left outline-none hover:border-foreground/20 focus-visible:ring-3 focus-visible:ring-ring/50"
  const acao =
    "grid size-6.5 place-items-center text-muted-foreground outline-none hover:bg-foreground/5 hover:text-primary focus-visible:bg-foreground/5 focus-visible:text-primary [&_svg]:size-3.25"
  return (
    <div className="group/val relative inline-flex max-w-full">
      {vazio ? (
        <Dica texto="Clique para informar um valor requerido (não é obrigatório informar, pois o edital não exige essa especificação).">
          <button type="button" onClick={onEditar} className={cn(chip, "font-sans text-muted-foreground italic hover:text-foreground")}>
            Não informado
          </button>
        </Dica>
      ) : (
        <button type="button" onClick={onEditar} aria-label={`Valor requerido de ${spec.req}: ${spec.exig}. Editar`} className={chip}>
          {op && <span className="text-muted-foreground">{op}</span>}
          <span className="truncate text-[13px]">{tirarUnidade(resto, spec.unidade)}</span>
          {spec.unidade && <span className="text-muted-foreground">{spec.unidade}</span>}
        </button>
      )}
      <div className="absolute top-full left-0 z-10 hidden pt-0.75 group-focus-within/val:block group-hover/val:block">
        <div className="flex overflow-hidden rounded-md border border-foreground/20 bg-muted shadow-md">
          <Dica texto="Editar o valor requerido">
            <button type="button" aria-label={`Editar o valor requerido de ${spec.req}`} onClick={onEditar} className={acao}>
              <PencilIcon />
            </button>
          </Dica>
          <Dica texto="Ver de onde a IA extraiu no edital (página e trecho)">
            <button type="button" aria-label={`Ver a origem de ${spec.req} no edital`} onClick={onVerOrigem} className={cn(acao, "border-l border-foreground/20")}>
              <ArrowUpRightIcon />
            </button>
          </Dica>
          <Dica texto="Copiar o valor requerido">
            <button
              type="button"
              aria-label={`Copiar o valor requerido de ${spec.req}`}
              onClick={() => {
                copiar(spec.exig)
                toast(`Valor copiado: "${spec.exig}"`)
              }}
              className={cn(acao, "border-l border-foreground/20")}
            >
              <CopyIcon />
            </button>
          </Dica>
        </div>
      </div>
    </div>
  )
}

/** Edição do valor requerido direto na célula: operador e unidade são fixos, só o número muda. */
function EdicaoNaCelula({
  spec,
  onConfirmar,
  onCancelar,
}: {
  spec: Especificacao
  onConfirmar: (bruto: string) => void
  onCancelar: () => void
}) {
  const { op, resto } = separarOperador(spec.exig)
  const [valor, setValor] = useState(tirarUnidade(resto, spec.unidade))
  const ref = useRef<HTMLInputElement>(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.focus()
    el.select()
    el.scrollIntoView({ block: "nearest" })
  }, [])
  // informar o valor de uma especificação adicionada não é editar um dado extraído do edital
  const dicaOk = spec.fromDiff ? "Confirmar o valor" : "Confirmar e recalcular"
  const dicaCancelar = spec.fromDiff ? "Cancelar" : "Cancelar edição"
  return (
    <span
      data-esc-local
      className="inline-flex max-w-full items-center gap-1.25 rounded-lg border border-primary bg-background py-0.5 pr-1.25 pl-2.25 focus-within:ring-3 focus-within:ring-primary/20"
    >
      {op && <span className="text-muted-foreground">{op}</span>}
      <input
        ref={ref}
        value={valor}
        aria-label={`Valor requerido de ${spec.req}`}
        onChange={(e) => setValor(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            onConfirmar(valor.trim())
          } else if (e.key === "Escape") {
            e.preventDefault()
            onCancelar()
          }
        }}
        className="w-14.5 min-w-0 bg-transparent font-mono text-[13px] outline-none"
      />
      {spec.unidade && <span className="text-muted-foreground">{spec.unidade}</span>}
      <Dica texto={dicaOk}>
        <button
          type="button"
          aria-label={dicaOk}
          onClick={() => onConfirmar(valor.trim())}
          className="grid size-5 shrink-0 place-items-center rounded-md text-success outline-none hover:bg-success/10 focus-visible:ring-2 focus-visible:ring-ring/50 [&_svg]:size-3"
        >
          <CheckIcon />
        </button>
      </Dica>
      <Dica texto={dicaCancelar}>
        <button
          type="button"
          aria-label={dicaCancelar}
          onClick={onCancelar}
          className="grid size-5 shrink-0 place-items-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 [&_svg]:size-3"
        >
          <XIcon />
        </button>
      </Dica>
    </span>
  )
}

/** Célula do SKU: atendimento calculado (valor do produto x exigência), somente leitura. */
function CelulaSku({
  cell,
  unidade,
  escolhida,
  className,
  style,
}: {
  cell: Celula
  unidade?: string
  escolhida: boolean
  className: string
  style?: CSSProperties
}) {
  const fundo = escolhida ? FUNDO.marca : cell.st === "diff" ? FUNDO.suave : "bg-background"
  const valor = (
    <>
      <Truncado texto={tirarUnidade(cell.v, unidade)} className="font-mono text-[13px]" />
      {unidade && (
        <span className="shrink-0 font-mono text-[13px] whitespace-pre text-muted-foreground select-none">
          {separadorDeUnidade(unidade) + unidade}
        </span>
      )}
    </>
  )

  if (cell.st === "ne") {
    const semValor = !cell.v || cell.v === VAZIO
    const dica = semValor
      ? "O valor exigido foi extraído do edital, mas não temos o valor desta especificação para este SKU. Sem essa informação, não é possível verificar se o produto atende."
      : "Esta especificação consta no edital, mas ainda não foi possível verificar se este produto atende."
    return (
      <td style={style} className={cn(className, "px-3.5 py-3", fundo)}>
        <Dica texto={dica}>
          <div tabIndex={0} className="flex max-w-full min-w-0 items-center gap-1.75 rounded-sm text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
            <AlertCircleIcon aria-hidden className="size-3.75 shrink-0" />
            <span className="truncate font-mono text-[13px]">{semValor ? "Valor não informado" : "Não analisado"}</span>
          </div>
        </Dica>
      </td>
    )
  }
  if (cell.st === "diff")
    return (
      <td style={style} className={cn(className, "px-3.5 py-3 text-muted-foreground", fundo)}>
        <div className="flex items-center gap-1.75">
          <Dica texto="Sem valor requerido informado. Como o edital não exige esta especificação, não há comparação de atende / não atende. Informe um valor requerido para comparar.">
            <span tabIndex={0} aria-label="Sem comparação" className="inline-flex shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
              <AlertCircleIcon aria-hidden className="size-3.75" />
            </span>
          </Dica>
          {valor}
        </div>
      </td>
    )

  const atende = cell.st === "ok"
  return (
    <td style={style} className={cn(className, "group/cel px-3.5 py-3", fundo)}>
      <div className="flex items-center gap-1.75">
        {atende ? (
          <CircleCheckIcon aria-label="Atende" className="size-3.75 shrink-0 text-success" />
        ) : (
          <CircleXIcon aria-label="Não atende" className="size-3.75 shrink-0 text-destructive" />
        )}
        {valor}
        <Dica texto="Copiar">
          <button
            type="button"
            aria-label={`Copiar ${cell.v}`}
            onClick={() => {
              copiar(cell.v)
              toast(`Valor copiado: "${cell.v}"`)
            }}
            className="ml-auto grid size-5.5 shrink-0 place-items-center rounded-md border bg-background text-muted-foreground opacity-0 outline-none group-hover/cel:opacity-100 hover:bg-muted hover:text-primary focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring/50 [&_svg]:size-3"
          >
            <CopyIcon />
          </button>
        </Dica>
      </div>
    </td>
  )
}
