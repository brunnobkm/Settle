// Sidebar "Requisitos": módulos recolhíveis com itens (trechos do documento).
// Arrastar pela alça reordena itens (inclusive entre módulos) e módulos; setas para
// cima/baixo na alça fazem o mesmo pelo teclado.

import { useEffect, useRef, useState, type DragEvent, type KeyboardEvent, type ReactElement, type ReactNode } from "react"
import { ArrowUpRightIcon, ChevronDownIcon, CopyIcon, GripVerticalIcon, SparklesIcon, Trash2Icon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

import { indicePeloPonteiro, moverItem, moverModulo, totalDeItens, type Item, type Modulo } from "./dados"

export type AcoesDosRequisitos = {
  adicionarModulo: () => void
  renomearModulo: (id: string, nome: string) => void
  alternarModulo: (id: string) => void
  removerModulo: (id: string) => void
  irParaModulo: (id: string) => void
  vincularTitulo: (id: string) => void
  irParaItem: (id: string) => void
  copiarItem: (id: string) => void
  removerItem: (id: string) => void
  reordenar: (fn: (m: Modulo[]) => Modulo[]) => void
  salvar: () => void
}

type Arraste = { tipo: "item" | "modulo"; id: string } | null

const ARRASTE = "application/x-settle-requisito"

function Dica({ texto, children }: { texto: string; children: ReactElement }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent>{texto}</TooltipContent>
    </Tooltip>
  )
}

function Alca({
  rotulo,
  aoIniciar,
  aoTerminar,
  aoTeclar,
  className,
}: {
  rotulo: string
  aoIniciar: (e: DragEvent<HTMLButtonElement>) => void
  aoTerminar: () => void
  aoTeclar: (direcao: -1 | 1) => void
  className?: string
}) {
  return (
    <button
      type="button"
      draggable
      aria-label={rotulo}
      title={rotulo}
      onDragStart={aoIniciar}
      onDragEnd={aoTerminar}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e: KeyboardEvent) => {
        if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return
        e.preventDefault()
        e.stopPropagation()
        aoTeclar(e.key === "ArrowUp" ? -1 : 1)
      }}
      className={cn(
        "grid shrink-0 cursor-grab place-items-center rounded-md text-muted-foreground/50 outline-none hover:bg-muted hover:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/50 active:cursor-grabbing [&_svg]:size-3.5",
        className
      )}
    >
      <GripVerticalIcon aria-hidden />
    </button>
  )
}

function CardDoItem({
  item,
  ativo,
  arrastando,
  registrar,
  acoes,
  alca,
}: {
  item: Item
  ativo: boolean
  arrastando: boolean
  registrar: (el: HTMLDivElement | null) => void
  acoes: AcoesDosRequisitos
  alca: ReactNode
}) {
  return (
    <div
      ref={registrar}
      data-item={item.id}
      onClick={() => acoes.irParaItem(item.id)}
      className={cn(
        "group/item relative flex cursor-pointer items-start gap-1.5 rounded-xl border bg-card py-2.5 pr-2.5 pl-1 transition-colors hover:bg-muted",
        ativo && "bg-muted",
        arrastando && "opacity-50"
      )}
    >
      {alca}
      <button
        type="button"
        aria-current={ativo || undefined}
        onClick={(e) => {
          e.stopPropagation()
          acoes.irParaItem(item.id)
        }}
        className="min-w-0 flex-1 rounded-sm text-left text-[13px] leading-[1.45] text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        {item.ia && (
          <Dica texto="Esta extração foi feita pela IA da Settle">
            <span role="img" aria-label="Extraído pela IA da Settle" className="mr-1.5 inline-flex align-[-2px] text-primary">
              <SparklesIcon aria-hidden className="size-3.5" />
            </span>
          </Dica>
        )}
        <span className="text-muted-foreground">"</span>
        {item.texto}
        <span className="text-muted-foreground">"</span>
      </button>
      <span
        className={cn(
          "absolute top-1.5 right-1.5 inline-flex overflow-hidden rounded-lg bg-card opacity-0 transition-opacity group-hover/item:opacity-100 focus-within:opacity-100",
          ativo && "opacity-100"
        )}
      >
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Copiar texto"
          title="Copiar texto"
          onClick={(e) => {
            e.stopPropagation()
            acoes.copiarItem(item.id)
          }}
          className="size-7 rounded-none text-muted-foreground"
        >
          <CopyIcon />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Ir para o trecho"
          title="Ir para o trecho"
          onClick={(e) => {
            e.stopPropagation()
            acoes.irParaItem(item.id)
          }}
          className="size-7 rounded-none text-primary hover:text-primary"
        >
          <ArrowUpRightIcon />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Excluir"
          title="Excluir"
          onClick={(e) => {
            e.stopPropagation()
            acoes.removerItem(item.id)
          }}
          className="size-7 rounded-none text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2Icon />
        </Button>
      </span>
    </div>
  )
}

export function Requisitos({
  modulos,
  itemAtivo,
  vinculando,
  focarModulo,
  aoFocarModulo,
  rolarParaItem,
  aoRolarParaItem,
  acoes,
}: {
  modulos: Modulo[]
  itemAtivo: string | null
  vinculando: string | null
  /** Módulo recém-criado cujo nome deve receber o foco. */
  focarModulo: string | null
  aoFocarModulo: () => void
  /** Item escolhido no PDF: o card rola até ficar visível. */
  rolarParaItem: string | null
  aoRolarParaItem: () => void
  acoes: AcoesDosRequisitos
}) {
  const [arraste, setArraste] = useState<Arraste>(null)
  const arrasteRef = useRef<Arraste>(null)
  const cards = useRef(new Map<string, HTMLDivElement>())
  const nomes = useRef(new Map<string, HTMLInputElement>())
  const total = totalDeItens(modulos)

  useEffect(() => {
    if (!focarModulo) return
    const input = nomes.current.get(focarModulo)
    input?.focus()
    input?.select()
    aoFocarModulo()
  }, [focarModulo, aoFocarModulo])

  useEffect(() => {
    if (!rolarParaItem) return
    cards.current.get(rolarParaItem)?.scrollIntoView({ block: "center", behavior: "smooth" })
    aoRolarParaItem()
  }, [rolarParaItem, aoRolarParaItem])

  const iniciar = (tipo: "item" | "modulo", id: string) => (e: DragEvent<HTMLButtonElement>) => {
    arrasteRef.current = { tipo, id }
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData(ARRASTE, id)
    const card = e.currentTarget.closest(tipo === "item" ? "[data-item]" : "[data-modulo]")
    if (card) e.dataTransfer.setDragImage(card, 12, 12)
    // adiado: mudar o DOM dentro do dragstart cancela o arrastar no Chrome
    setTimeout(() => setArraste({ tipo, id }), 0)
  }
  const terminar = () => {
    arrasteRef.current = null
    setArraste(null)
  }
  // Um item que troca de módulo durante o arraste é remontado e a alça original sai
  // do DOM, então o dragend não chega. O drop (ou o primeiro mousemove depois do
  // arraste, que o navegador suprime enquanto ele dura) encerra o estado.
  useEffect(() => {
    const encerrar = () => {
      if (!arrasteRef.current) return
      arrasteRef.current = null
      setArraste(null)
    }
    document.addEventListener("drop", encerrar)
    document.addEventListener("mousemove", encerrar)
    return () => {
      document.removeEventListener("drop", encerrar)
      document.removeEventListener("mousemove", encerrar)
    }
  }, [])

  const sobreItens = (moduloId: string) => (e: DragEvent<HTMLDivElement>) => {
    const a = arrasteRef.current
    if (a?.tipo !== "item") return
    e.preventDefault()
    e.stopPropagation()
    const indice = indicePeloPonteiro(e.currentTarget, "[data-item]", a.id, "data-item", e.clientY)
    acoes.reordenar((ms) => moverItem(ms, a.id, moduloId, indice))
  }
  const sobreModulos = (e: DragEvent<HTMLDivElement>) => {
    const a = arrasteRef.current
    if (!a) return
    e.preventDefault()
    if (a.tipo !== "modulo") return
    const indice = indicePeloPonteiro(e.currentTarget, "[data-modulo]", a.id, "data-modulo", e.clientY)
    acoes.reordenar((ms) => moverModulo(ms, a.id, indice))
  }

  const moverItemPeloTeclado = (itemId: string, direcao: -1 | 1) =>
    acoes.reordenar((ms) => {
      const m = ms.find((x) => x.itens.some((i) => i.id === itemId))
      if (!m) return ms
      const i = m.itens.findIndex((x) => x.id === itemId)
      return moverItem(ms, itemId, m.id, i + direcao)
    })
  const moverModuloPeloTeclado = (moduloId: string, direcao: -1 | 1) =>
    acoes.reordenar((ms) => moverModulo(ms, moduloId, ms.findIndex((m) => m.id === moduloId) + direcao))

  return (
    <aside
      aria-label="Requisitos do edital"
      className="flex min-h-0 flex-col rounded-xl border bg-card shadow-xs min-[1080px]:h-full"
    >
      <div className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <h2 className="flex-1 text-sm font-bold">Requisitos</h2>
        <Button onClick={acoes.adicionarModulo}>Adicionar módulo</Button>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-4">
        {modulos.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-muted/50 px-4 py-6 text-center text-[13.5px] text-muted-foreground">
            Nenhum requisito ainda. Extraia trechos do PDF ou crie um módulo.
          </div>
        ) : (
          <div className="flex flex-col gap-3" onDragOver={sobreModulos} onDrop={(e) => e.preventDefault()}>
            {modulos.map((m) => {
              const vinculado = !!m.range
              const vinculandoEste = vinculando === m.id
              return (
                <div
                  key={m.id}
                  data-modulo={m.id}
                  className={cn(
                    "rounded-lg border bg-card animate-in fade-in-0 slide-in-from-bottom-1 duration-200",
                    arraste?.tipo === "modulo" && arraste.id === m.id && "opacity-50"
                  )}
                >
                  <div className="flex items-center gap-1 py-2 pr-2 pl-1">
                    <Alca
                      rotulo="Arrastar módulo"
                      aoIniciar={iniciar("modulo", m.id)}
                      aoTerminar={terminar}
                      aoTeclar={(d) => moverModuloPeloTeclado(m.id, d)}
                      className="h-[30px] w-5"
                    />
                    <Input
                      ref={(el) => {
                        if (el) nomes.current.set(m.id, el)
                        else nomes.current.delete(m.id)
                      }}
                      value={m.nome}
                      aria-label="Nome do módulo"
                      onChange={(e) => acoes.renomearModulo(m.id, e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                      className="h-[30px] min-w-0 flex-1 border-transparent bg-transparent px-1.5 text-[13.5px] font-bold shadow-none hover:bg-muted focus-visible:bg-background dark:bg-transparent"
                    />
                    <Badge variant="secondary" className="text-[11px] font-semibold text-muted-foreground tabular-nums">
                      <span className="sr-only">Requisitos no módulo: </span>
                      {m.itens.length}
                    </Badge>
                    <Dica texto={vinculado ? "Ir para o trecho no documento" : "Sem trecho vinculado. Selecione um trecho para vincular."}>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={vinculado ? "Ir para o trecho" : "Vincular trecho"}
                        aria-pressed={vinculado ? undefined : vinculandoEste}
                        onClick={() => (vinculado ? acoes.irParaModulo(m.id) : acoes.vincularTitulo(m.id))}
                        className={cn(
                          "size-7 text-muted-foreground",
                          vinculado && "text-primary hover:bg-primary/10 hover:text-primary",
                          vinculandoEste && "bg-primary/15 text-primary hover:bg-primary/15 hover:text-primary"
                        )}
                      >
                        <ArrowUpRightIcon />
                      </Button>
                    </Dica>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Remover módulo"
                      title="Remover módulo"
                      onClick={() => acoes.removerModulo(m.id)}
                      className="size-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2Icon />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={m.recolhido ? "Expandir" : "Recolher"}
                      aria-expanded={!m.recolhido}
                      onClick={() => acoes.alternarModulo(m.id)}
                      className="h-[30px] w-[26px] text-muted-foreground"
                    >
                      <ChevronDownIcon className={cn("transition-transform duration-200", m.recolhido && "-rotate-90")} />
                    </Button>
                  </div>

                  {!m.recolhido && (
                    <div className="flex min-h-1.5 flex-col gap-2 px-2.5 pb-2.5" onDragOver={sobreItens(m.id)}>
                      {m.itens.length === 0 ? (
                        <div className="rounded-lg border border-dashed px-2 py-3 text-center text-xs text-muted-foreground">
                          Sem requisitos. Arraste um trecho aqui ou extraia do PDF.
                        </div>
                      ) : (
                        m.itens.map((item) => (
                          <CardDoItem
                            key={item.id}
                            item={item}
                            ativo={item.id === itemAtivo}
                            arrastando={arraste?.tipo === "item" && arraste.id === item.id}
                            registrar={(el) => {
                              if (el) cards.current.set(item.id, el)
                              else cards.current.delete(item.id)
                            }}
                            acoes={acoes}
                            alca={
                              <Alca
                                rotulo="Arrastar requisito"
                                aoIniciar={iniciar("item", item.id)}
                                aoTerminar={terminar}
                                aoTeclar={(d) => moverItemPeloTeclado(item.id, d)}
                                className="mt-px h-[22px] w-[18px]"
                              />
                            }
                          />
                        ))
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="border-t px-4 py-3.5">
        <Button
          size="lg"
          aria-disabled={total === 0}
          onClick={acoes.salvar}
          className={cn("h-11.5 w-full text-[14.5px] font-bold", total === 0 && "cursor-not-allowed opacity-50 hover:bg-primary")}
        >
          Salvar
        </Button>
      </div>
    </aside>
  )
}
