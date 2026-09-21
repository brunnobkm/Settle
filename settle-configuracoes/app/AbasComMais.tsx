// Barra de abas numa linha só. As abas que não cabem vão para o menu "Mais N";
// a aba ativa fica sempre visível na barra (se estava escondida, entra no lugar da última).
// Composição de Tabs + DropdownMenu do design system, usada na pré-visualização das abas.

import { useLayoutEffect, useRef, useState } from "react"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Item = { id: string; nome: string }

const RESPIRO = 6 // padding interno da TabsList (3px de cada lado)
const LARGURA_MAIS = 92 // espaço reservado para o botão "Mais N"

function distribuir(larguras: number[], disponivel: number, ativo: number) {
  const todos = larguras.map((_, i) => i)
  if (larguras.reduce((s, w) => s + w, 0) <= disponivel) return { visiveis: todos, ocultos: [] as number[] }

  const cabe = disponivel - LARGURA_MAIS
  const visiveis: number[] = []
  let soma = 0
  for (const i of todos) {
    if (soma + larguras[i] > cabe) break
    visiveis.push(i)
    soma += larguras[i]
  }
  if (ativo >= 0 && !visiveis.includes(ativo)) {
    while (visiveis.length && soma + larguras[ativo] > cabe) soma -= larguras[visiveis.pop()!]
    visiveis.push(ativo)
  }
  return { visiveis, ocultos: todos.filter((i) => !visiveis.includes(i)) }
}

export function AbasComMais({
  itens,
  ativo,
  onSelecionar,
  rotulo,
}: {
  itens: Item[]
  ativo: string
  onSelecionar: (id: string) => void
  rotulo: string
}) {
  const caixa = useRef<HTMLDivElement>(null)
  const medida = useRef<HTMLDivElement>(null)
  const [largura, setLargura] = useState(0)
  const [larguras, setLarguras] = useState<number[]>([])

  // Mede a cada renderização e só atualiza o estado quando algo mudou; o ResizeObserver
  // força uma nova medida quando a largura disponível muda.
  const [, redesenhar] = useState(0)
  useLayoutEffect(() => {
    const el = caixa.current
    if (!el) return
    const ro = new ResizeObserver(() => redesenhar((n) => n + 1))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useLayoutEffect(() => {
    const w = Math.round(caixa.current?.getBoundingClientRect().width ?? 0)
    const ws = [...(medida.current?.querySelectorAll<HTMLElement>("[data-slot=tabs-trigger]") ?? [])].map((t) => t.offsetWidth)
    if (w !== largura) setLargura(w)
    if (ws.join() !== larguras.join()) setLarguras(ws)
  })

  const pronto = largura > 0 && larguras.length === itens.length
  const { visiveis, ocultos } = pronto
    ? distribuir(larguras, largura - RESPIRO, itens.findIndex((i) => i.id === ativo))
    : { visiveis: itens.map((_, i) => i), ocultos: [] as number[] }

  return (
    <div ref={caixa} className="relative min-w-0">
      {/* cópia invisível só para medir a largura de cada aba */}
      <div ref={medida} aria-hidden className="pointer-events-none invisible absolute top-0 left-0 h-0 overflow-hidden">
        <Tabs value={ativo}>
          <TabsList className="w-max">
            {itens.map((i) => (
              <TabsTrigger key={i.id} value={i.id} tabIndex={-1} className="flex-none px-3">
                {i.nome}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <Tabs value={ativo} onValueChange={onSelecionar}>
        <TabsList aria-label={rotulo} className="max-w-full justify-start">
          {visiveis.map((i) => (
            <TabsTrigger key={itens[i].id} value={itens[i].id} className="flex-none px-3">
              {itens[i].nome}
            </TabsTrigger>
          ))}
          {ocultos.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-[calc(100%-1px)] flex-none items-center gap-1 rounded-md px-3 text-sm font-medium whitespace-nowrap text-foreground/60 outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  Mais {ocultos.length}
                  <ChevronDownIcon className="size-4" aria-hidden />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-48">
                <DropdownMenuGroup>
                  {ocultos.map((i) => (
                    <DropdownMenuItem key={itens[i].id} onSelect={() => onSelecionar(itens[i].id)} className="justify-between gap-2.5">
                      {itens[i].nome}
                      {itens[i].id === ativo && <CheckIcon aria-label="ativa" className="text-primary" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </TabsList>
      </Tabs>
    </div>
  )
}
