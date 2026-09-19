// Mecânica de PRODUTO: matriz requisitos x SKUs do catálogo, ordenada pela aderência.
// Colunas congeláveis (grudam à esquerda) e redimensionáveis, células editáveis,
// status alternável (atende, não atende, não extraído) e escolha do SKU.

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react"
import {
  ArrowUpRightIcon,
  CheckIcon,
  ChevronRightIcon,
  MessageSquareIcon,
  PinIcon,
  PlusIcon,
  StarIcon,
  XIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Progress } from "@/components/ui/progress"

import { Dica, Editavel, FUNDO } from "./comum"
import {
  CATALOGO_NAO_EDITAL,
  NAO_ANALISADAS,
  VAZIO,
  concordante,
  pontuar,
  ranquear,
  rotuloConfianca,
  type Celula,
  type Especificacao,
} from "./dados"

const LARGURA_PADRAO = (k: string) => (k === "req" ? 300 : k === "val" ? 160 : 176)
const LARGURA_MINIMA = 90

type Coluna = { key: string; skuIdx?: number; w: number; frozen: boolean; left?: number; edge?: boolean }

export type AcoesDaMatriz = {
  alterarSpec: (ri: number, patch: Partial<Especificacao>) => void
  alterarCelula: (ri: number, ci: number, patch: Partial<Celula>) => void
  adicionarRequisito: () => void
  escolher: (skuIdx: number) => void
  verOrigem: (spec: Especificacao) => void
  questionar: (req: string) => void
}

export function Matriz({
  specs,
  escolhido,
  larguras,
  congeladas,
  mostrarConfianca,
  soDiferencas,
  onLarguras,
  onCongeladas,
  acoes,
}: {
  specs: Especificacao[]
  escolhido?: number
  larguras: Record<string, number>
  congeladas: string[]
  mostrarConfianca: boolean
  soDiferencas: boolean
  onLarguras: (l: Record<string, number>) => void
  onCongeladas: (c: string[]) => void
  acoes: AcoesDaMatriz
}) {
  const pontuacoes = pontuar(specs)
  const ordem = ranquear(pontuacoes).map((p) => p.i)
  const largura = (k: string) => larguras[k] ?? LARGURA_PADRAO(k)

  // foca o nome do requisito recém-adicionado
  const [focarId, setFocarId] = useState<string | null>(null)
  const totalAnterior = useRef(specs.length)
  useEffect(() => {
    if (specs.length > totalAnterior.current) setFocarId(specs[specs.length - 1].id)
    totalAnterior.current = specs.length
  }, [specs])

  /* ---------- colunas ---------- */
  const colunas: Coluna[] = [
    { key: "req" },
    { key: "val" },
    ...ordem.map((i) => ({ key: `sku-${i}`, skuIdx: i })),
  ].map((c) => ({ ...c, w: largura(c.key), frozen: congeladas.includes(c.key) }))
  let acumulado = 0
  colunas.forEach((c) => {
    if (c.frozen) {
      c.left = acumulado
      acumulado += c.w
    }
  })
  const ultimaCongelada = colunas.filter((c) => c.frozen).at(-1)
  if (ultimaCongelada) ultimaCongelada.edge = true
  const larguraTotal = colunas.reduce((s, c) => s + c.w, 0)

  const fixa = (c: Coluna) =>
    cn(c.frozen && "sticky z-2", c.edge && "shadow-[2px_0_0_var(--border)]")
  const posicao = (c: Coluna) => (c.frozen ? { left: c.left } : undefined)

  function alternarCongelada(key: string) {
    onCongeladas(congeladas.includes(key) ? congeladas.filter((k) => k !== key) : [...congeladas, key])
  }

  /* ---------- redimensionar ---------- */
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

  const controles = (c: Coluna, nome: string) => (
    <>
      <Dica texto={c.frozen ? "Descongelar coluna" : "Congelar coluna (fixa ao rolar)"}>
        <button
          type="button"
          aria-label={`${c.frozen ? "Descongelar" : "Congelar"} a coluna ${nome}`}
          aria-pressed={c.frozen}
          onClick={() => alternarCongelada(c.key)}
          className={cn(
            "absolute top-1.5 right-3 grid size-5.5 place-items-center rounded-md border border-transparent text-muted-foreground/60 opacity-0 transition-opacity group-hover/th:opacity-100 hover:border-border hover:bg-background hover:text-primary focus-visible:opacity-100 [&_svg]:size-3.25",
            c.frozen && "text-primary opacity-100"
          )}
        >
          <PinIcon />
        </button>
      </Dica>
      <Dica texto="Arraste para redimensionar a largura">
        <span
          aria-hidden
          onPointerDown={(e) => iniciarRedimensionar(e, c.key)}
          className={cn(
            "absolute top-0 right-0 h-full w-2 cursor-col-resize after:absolute after:top-0 after:right-0.75 after:h-full after:w-0.5 hover:after:bg-primary",
            redimensionando === c.key && "after:bg-primary"
          )}
        />
      </Dica>
    </>
  )

  const naoExigidas = [...specs.filter((s) => s.exigNa).map((s) => s.req), ...CATALOGO_NAO_EDITAL]

  return (
    <div>
      <table className="table-fixed border-separate border-spacing-0 text-sm" style={{ width: larguraTotal }}>
        <colgroup>
          {colunas.map((c) => (
            <col key={c.key} style={{ width: c.w }} />
          ))}
        </colgroup>
        <thead>
          <tr>
            {colunas.map((c) => {
              const base = "group/th sticky top-0 z-3 overflow-hidden border-b text-left align-top"
              if (c.key === "req" || c.key === "val") {
                const nome = c.key === "req" ? "Especificações do edital" : "Valor requerido"
                const th = (
                  <th
                    key={c.key}
                    scope="col"
                    style={posicao(c)}
                    className={cn(base, "bg-muted px-4 py-3 text-[13px] font-semibold text-muted-foreground", fixa(c), c.frozen && "z-5")}
                  >
                    {nome}
                    {controles(c, nome)}
                  </th>
                )
                return th
              }
              const idx = c.skuIdx!
              const p = pontuacoes[idx]
              const rank = ordem.indexOf(idx)
              const recomendado = rank === 0
              const selecionado = escolhido === idx
              return (
                <th
                  key={c.key}
                  scope="col"
                  style={posicao(c)}
                  className={cn(
                    base,
                    "px-3.5 py-2.5 font-normal",
                    selecionado
                      ? cn(FUNDO.marca, "shadow-[inset_0_2px_0_var(--primary)]")
                      : recomendado
                        ? FUNDO.ok
                        : "bg-background",
                    fixa(c),
                    c.frozen && "z-5"
                  )}
                >
                  {recomendado ? (
                    <Dica texto="Produto com maior aderência">
                      <div className="mb-1.5 inline-flex items-center gap-1 text-[10.5px] font-bold tracking-wide text-success uppercase">
                        <StarIcon aria-hidden className="size-3 fill-current" /> Recomendado
                      </div>
                    </Dica>
                  ) : (
                    <div className="text-[11px] font-bold tracking-wide text-muted-foreground">{rank + 1}º</div>
                  )}
                  <div className="mt-0.5 truncate font-mono text-sm font-semibold">{p.sku.model}</div>
                  <Dica texto="Fabricante (info do SKU, não é requisito)">
                    <div className="w-fit text-xs text-muted-foreground">{p.sku.brand}</div>
                  </Dica>
                  <Dica texto="Percentual de requisitos do edital que este produto atende">
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-sm font-bold tabular-nums">{p.pct}%</span>
                      <Progress value={p.pct} aria-label={`Aderência de ${p.sku.model}`} className="h-1.25 min-w-11 flex-1" />
                    </div>
                  </Dica>
                  <div className="mt-1 text-[11px] text-muted-foreground tabular-nums">
                    {p.ok}/{p.evaluable} requisitos{p.ne ? ` · ${p.ne} não extr.` : ""}
                  </div>
                  <Dica texto="Definir como produto escolhido">
                    <Button
                      variant={selecionado ? "default" : "outline"}
                      size="xs"
                      aria-pressed={selecionado}
                      className="mt-2 w-full font-semibold"
                      onClick={() => acoes.escolher(idx)}
                    >
                      {selecionado && <CheckIcon data-icon="inline-start" />}
                      {selecionado ? "Selecionado" : "Selecionar"}
                    </Button>
                  </Dica>
                  {controles(c, p.sku.model)}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {specs.map((spec, ri) => {
            if (spec.exigNa) return null
            return (
              <tr key={spec.id} className={cn("group/row", soDiferencas && concordante(spec) && "hidden")}>
                {colunas.map((c) => {
                  const td = "overflow-hidden border-b align-top"
                  if (c.key === "req")
                    return (
                      <th
                        key={c.key}
                        scope="row"
                        style={posicao(c)}
                        className={cn(td, "bg-background px-4 py-3 text-left font-medium group-hover/row:bg-muted", fixa(c))}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <Dica texto="Clique para editar o requisito">
                            <span>
                              <Editavel
                                valor={spec.req}
                                rotulo="Nome do requisito"
                                autoFocus={focarId === spec.id}
                                onConfirmar={(t) => acoes.alterarSpec(ri, { req: t || "Requisito" })}
                              />
                            </span>
                          </Dica>
                          <span className="inline-flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover/row:opacity-100 focus-within:opacity-100">
                            <Dica texto="Ver de onde a IA extraiu (página e trecho)">
                              <Button
                                variant="outline"
                                size="icon-xs"
                                aria-label={`Ver origem de ${spec.req}`}
                                className="text-muted-foreground hover:text-primary"
                                onClick={() => acoes.verOrigem(spec)}
                              >
                                <ArrowUpRightIcon />
                              </Button>
                            </Dica>
                            <Dica texto="Questionar / impugnar este requisito">
                              <Button
                                variant="outline"
                                size="icon-xs"
                                aria-label={`Questionar ${spec.req}`}
                                className="text-muted-foreground hover:text-primary"
                                onClick={() => acoes.questionar(spec.req)}
                              >
                                <MessageSquareIcon />
                              </Button>
                            </Dica>
                          </span>
                        </div>
                      </th>
                    )
                  if (c.key === "val")
                    return (
                      <td
                        key={c.key}
                        style={posicao(c)}
                        className={cn(td, "bg-background px-4 py-3 font-mono group-hover/row:bg-muted", fixa(c))}
                      >
                        <Dica texto="Clique para corrigir o valor exigido">
                          <span>
                            <Editavel
                              valor={spec.exig}
                              rotulo={`Valor exigido de ${spec.req}`}
                              onConfirmar={(t) => acoes.alterarSpec(ri, { exig: t })}
                            />
                          </span>
                        </Dica>
                      </td>
                    )
                  const ci = c.skuIdx!
                  const cell = spec.cells[ci]
                  return (
                    <CelulaSku
                      key={c.key}
                      cell={cell}
                      modelo={pontuacoes[ci].sku.model}
                      req={spec.req}
                      mostrarConfianca={mostrarConfianca}
                      className={cn(td, fixa(c))}
                      style={posicao(c)}
                      onAlternar={() => {
                        const st = cell.st === "ne" ? "ok" : cell.st === "ok" ? "no" : "ne"
                        acoes.alterarCelula(ri, ci, { st, ...(st === "ne" && { v: VAZIO }), ...(!cell.c && { c: "alta" }) })
                      }}
                      onEditar={(t) => acoes.alterarCelula(ri, ci, { v: t || VAZIO, c: "alta" })}
                    />
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>

      <Dica texto="Adicionar um requisito que a IA não extraiu" lado="right">
        <button
          type="button"
          onClick={acoes.adicionarRequisito}
          className="sticky left-0 flex w-full items-center gap-2 border-b bg-background px-4 py-3.5 text-sm font-semibold text-primary hover:bg-muted [&_svg]:size-3.75"
        >
          <PlusIcon aria-hidden /> Adicionar requisito
        </button>
      </Dica>

      <div className="sticky left-0 flex flex-col gap-2.5 px-4 pt-2 pb-6">
        <Extra
          titulo="Requisitos do edital ainda não analisados"
          itens={NAO_ANALISADAS}
          nota="O edital pede, mas a IA não extraiu. Use “+ Adicionar requisito” para incluí-los."
        />
        <Extra
          titulo="Especificações não exigidas pelo edital"
          itens={naoExigidas}
          nota="Itens do catálogo que o edital não pede. Não entram no score, mas podem ser diferencial estratégico (questionar / impugnar)."
        />
      </div>
    </div>
  )
}

function CelulaSku({
  cell,
  modelo,
  req,
  mostrarConfianca,
  className,
  style,
  onAlternar,
  onEditar,
}: {
  cell: Celula
  modelo: string
  req: string
  mostrarConfianca: boolean
  className: string
  style?: CSSProperties
  onAlternar: () => void
  onEditar: (texto: string) => void
}) {
  const estado = cell.st === "ok" ? "atende" : cell.st === "no" ? "não atende" : "não extraído"
  return (
    <td
      style={style}
      className={cn(
        className,
        "px-3.5 py-3",
        cell.st === "ok" ? FUNDO.ok : cell.st === "no" ? FUNDO.no : "bg-background"
      )}
    >
      <div className="flex items-center gap-1.75">
        <Dica texto="Clique para alternar: atende → não atende → não extraído">
          <button
            type="button"
            aria-label={`${modelo}, ${req}: ${estado}. Alternar status`}
            onClick={onAlternar}
            className={cn(
              "grid size-4 shrink-0 place-items-center rounded-sm font-bold hover:shadow-[0_0_0_3px_color-mix(in_oklab,var(--foreground)_6%,transparent)] [&_svg]:size-3.75 [&_svg]:stroke-[2.6]",
              cell.st === "ok" && "text-success",
              cell.st === "no" && "text-destructive",
              cell.st === "ne" && "text-muted-foreground"
            )}
          >
            {cell.st === "ok" ? <CheckIcon /> : cell.st === "no" ? <XIcon /> : VAZIO}
          </button>
        </Dica>
        <Dica texto="Clique para corrigir o valor extraído">
          <span className="min-w-0 font-mono text-[13px]">
            <Editavel valor={cell.v} rotulo={`Valor de ${modelo} para ${req}`} onConfirmar={onEditar} />
          </span>
        </Dica>
      </div>
      {mostrarConfianca && cell.st !== "ne" && cell.c && (
        <Dica texto="Confiança da IA na extração deste valor">
          <div
            className={cn(
              "mt-1.25 inline-flex items-center gap-1 text-[11px] font-semibold",
              cell.c === "alta" && "text-success",
              cell.c === "media" && "text-warning",
              cell.c === "baixa" && "text-destructive"
            )}
          >
            <span aria-hidden className="size-1.75 rounded-full bg-current" />
            {rotuloConfianca(cell.c)} confiança
          </div>
        </Dica>
      )}
    </td>
  )
}

function Extra({ titulo, itens, nota }: { titulo: string; itens: string[]; nota: string }) {
  return (
    <Collapsible className="group/extra rounded-lg border bg-background">
      <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-lg px-3.5 py-3 text-left text-[13px] font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
        <ChevronRightIcon aria-hidden className="size-3.25 text-muted-foreground transition-transform group-data-[state=open]/extra:rotate-90" />
        {titulo} <span className="font-medium text-muted-foreground">({itens.length})</span>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-3.5 pb-3.5 pl-9">
        <p className="mb-2.5 text-xs text-muted-foreground">{nota}</p>
        <ul className="flex flex-wrap gap-1.5">
          {itens.map((t) => (
            <li key={t} className="rounded-md border bg-muted px-2.25 py-0.75 text-xs">
              {t}
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  )
}
