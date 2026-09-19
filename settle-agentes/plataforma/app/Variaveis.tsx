// A tabela de variáveis. As colunas são os campos do formulário, na mesma ordem e com
// os mesmos títulos, mais duas que descrevem a variável em vez de defini-la: de quem
// ela é, e quantos agentes dependem dela. Clicar no título da coluna ordena e filtra,
// como no Notion.

import { useState, type ReactNode } from "react"
import { EllipsisVerticalIcon, SearchIcon, Trash2Icon } from "lucide-react"

import { ActionBarButton } from "@/components/ui/action-bar"
import { Button } from "@/components/ui/button"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

import { TagFonte, TagOrigem } from "./comum"
import { EMPRESA, TIPOS_VAR, type Variavel } from "./dados"
import { useSim } from "./estado"
import { agentesDaVar, cap, fontesDe, type Config } from "./regras"

type Linha = { k: string; v: Variavel }
type Tipo = "texto" | "opcoes" | "multi"

type Coluna = {
  id: string
  titulo: string
  tipo: Tipo
  /** Valor usado para ordenar e filtrar. */
  valor: (l: Linha, cfg: Config) => string | string[]
  /** Opções fixas do filtro (senão, os valores presentes). */
  opcoes?: () => string[]
  largura?: number
  quebra?: boolean
}

const COLUNAS: Coluna[] = [
  { id: "nome", titulo: "Nome da variável", tipo: "texto", valor: (l) => l.v.nome, largura: 240, quebra: true },
  /* A lista do filtro é a mesma do formulário, mesmo que um tipo ainda não esteja em uso. */
  { id: "tipo", titulo: "Tipo", tipo: "opcoes", valor: (l) => cap(l.v.tipo), opcoes: () => TIPOS_VAR.map(cap), largura: 100 },
  { id: "prompt", titulo: "Instruções", tipo: "texto", valor: (l) => l.v.prompt || "", largura: 240, quebra: true },
  /* A célula tem várias fontes, então o filtro é por fonte solta: marcar "Minuta do
     contrato" traz toda variável que procura lá, em qualquer posição da ordem. */
  { id: "fonte", titulo: "Onde procurar", tipo: "multi", valor: (l) => fontesDe(l.v), largura: 170, quebra: true },
  { id: "padrao", titulo: "O que fazer quando não encontrar a variável", tipo: "texto", valor: (l) => l.v.padrao || "", largura: 200 },
  { id: "origem", titulo: "Quem criou", tipo: "opcoes", valor: (l) => (l.v.settle ? "Settle" : EMPRESA), largura: 120 },
  /* Quantos agentes dependem dela, não quantas regras. */
  { id: "usos", titulo: "Agentes usando", tipo: "opcoes", valor: (l, cfg) => String(agentesDaVar(l.k, cfg).length), largura: 130 },
]

type Filtros = Record<string, string | string[]>

function temFiltro(c: Coluna, f: Filtros) {
  const x = f[c.id]
  return c.tipo === "texto" ? !!x : Array.isArray(x) && x.length > 0
}

function passa(l: Linha, cfg: Config, f: Filtros) {
  return COLUNAS.every((c) => {
    if (!temFiltro(c, f)) return true
    const val = c.valor(l, cfg)
    const sel = f[c.id]
    if (c.tipo === "multi") return (val as string[]).some((x) => (sel as string[]).includes(x))
    if (c.tipo === "opcoes") return (sel as string[]).includes(val as string)
    return String(val).toLowerCase().includes(String(sel).toLowerCase())
  })
}

function opcoesDa(c: Coluna, linhas: Linha[], cfg: Config) {
  if (c.opcoes) return c.opcoes()
  const o = new Set<string>()
  linhas.forEach((l) => [c.valor(l, cfg)].flat().forEach((x) => o.add(x)))
  return [...o].sort()
}

export function Variaveis() {
  const { cfg, abrirModal, excluirVar, excluirVars } = useSim()
  const [busca, setBusca] = useState("")
  const [ordem, setOrdem] = useState<{ id: string; dir: "asc" | "desc" } | null>(null)
  const [filtros, setFiltros] = useState<Filtros>({})
  const [sel, setSel] = useState<string[]>([])

  const todas: Linha[] = Object.entries(cfg.vars).map(([k, v]) => ({ k, v }))
  const q = busca.trim().toLowerCase()
  const linhas = todas.filter((l) => (!q || `${l.v.nome} ${l.v.desc}`.toLowerCase().includes(q)) && passa(l, cfg, filtros))
  if (ordem) {
    const c = COLUNAS.find((x) => x.id === ordem.id)!
    linhas.sort((a, b) => {
      const x = [c.valor(a, cfg)].flat().join(", ")
      const y = [c.valor(b, cfg)].flat().join(", ")
      const n = c.id === "usos" ? +x - +y : x.localeCompare(y, "pt-BR")
      return ordem.dir === "asc" ? n : -n
    })
  }
  const selecionadas = sel.filter((k) => cfg.vars[k])

  const menuDaColuna = (c: Coluna) => {
    const ativo = temFiltro(c, filtros) || ordem?.id === c.id
    const marcadas = (filtros[c.id] as string[] | undefined) ?? []
    return (
      <>
        <DropdownMenuGroup>
          <DropdownMenuCheckboxItem checked={ordem?.id === c.id && ordem.dir === "asc"} onSelect={() => setOrdem({ id: c.id, dir: "asc" })}>
            Ordenar de A a Z
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={ordem?.id === c.id && ordem.dir === "desc"} onSelect={() => setOrdem({ id: c.id, dir: "desc" })}>
            Ordenar de Z a A
          </DropdownMenuCheckboxItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {c.tipo === "texto" ? (
          <DropdownMenuGroup>
            <DropdownMenuLabel className="sr-only">Filtrar {c.titulo}</DropdownMenuLabel>
            <div className="p-1">
              <Input
                aria-label={`Filtrar ${c.titulo}`}
                placeholder="Contém…"
                className="h-8"
                autoFocus
                value={(filtros[c.id] as string) ?? ""}
                // o menu não pode tomar as teclas do campo para a busca por letra
                onKeyDown={(e) => e.stopPropagation()}
                onChange={(e) => setFiltros((f) => ({ ...f, [c.id]: e.target.value }))}
              />
            </div>
          </DropdownMenuGroup>
        ) : (
          <DropdownMenuGroup>
            <div className="flex items-center justify-between px-2 py-1">
              <DropdownMenuLabel className="p-0">Mostrar</DropdownMenuLabel>
              <Button
                variant="ghost"
                size="xs"
                className="h-5 px-1.5 text-xs text-primary"
                onClick={() => setFiltros((f) => ({ ...f, [c.id]: [] }))}
              >
                {marcadas.length ? "Limpar" : "Todas"}
              </Button>
            </div>
            <div className="max-h-52 overflow-y-auto">
              {opcoesDa(c, todas, cfg).map((o) => (
                <DropdownMenuCheckboxItem
                  key={o}
                  checked={marcadas.includes(o)}
                  // o menu fica aberto para marcar mais de uma
                  onSelect={(e) => e.preventDefault()}
                  onCheckedChange={(v) =>
                    setFiltros((f) => {
                      const atual = (f[c.id] as string[] | undefined) ?? []
                      return { ...f, [c.id]: v ? [...atual, o] : atual.filter((x) => x !== o) }
                    })
                  }
                >
                  {o}
                </DropdownMenuCheckboxItem>
              ))}
            </div>
          </DropdownMenuGroup>
        )}
        {ativo && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onSelect={() => {
                  setFiltros((f) => {
                    const n = { ...f }
                    delete n[c.id]
                    return n
                  })
                  if (ordem?.id === c.id) setOrdem(null)
                }}
              >
                Limpar esta coluna
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}
      </>
    )
  }

  const celula: Record<string, (l: Linha) => ReactNode> = {
    nome: (l) => (
      <button
        type="button"
        onClick={() => abrirModal({ tipo: "variavel", k: l.k })}
        className="rounded-sm text-left text-[13px] font-semibold outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {l.v.nome}
      </button>
    ),
    tipo: (l) => <span className="text-[13px] text-muted-foreground">{cap(l.v.tipo)}</span>,
    prompt: (l) => {
      const i = l.v.prompt || ""
      const curto = i.length > 90 ? `${i.slice(0, 88)}…` : i
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span tabIndex={0} className="text-xs leading-4 text-muted-foreground">
              {curto}
            </span>
          </TooltipTrigger>
          <TooltipContent className="max-w-70">{i}</TooltipContent>
        </Tooltip>
      )
    },
    fonte: (l) => (
      <span className="flex flex-wrap gap-1 py-0.5">
        {fontesDe(l.v).map((f) => (
          <TagFonte key={f} fonte={f} />
        ))}
      </span>
    ),
    /* Vazio não é "não encontrado": é ausência de valor, e a regra que usar a variável precisa saber disso. */
    padrao: (l) =>
      l.v.padrao ? (
        <span className="text-xs text-muted-foreground">{l.v.padrao}</span>
      ) : (
        <span className="text-xs text-muted-foreground">sem valor</span>
      ),
    origem: (l) => <TagOrigem settle={l.v.settle} empresa={EMPRESA} />,
    usos: (l) => {
      const a = agentesDaVar(l.k, cfg)
      if (!a.length) return <span className="text-xs text-muted-foreground">Nenhum</span>
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span tabIndex={0} className="text-xs text-muted-foreground">
              {a.length} {a.length === 1 ? "agente" : "agentes"}
            </span>
          </TooltipTrigger>
          <TooltipContent className="max-w-70">{a.join(", ")}</TooltipContent>
        </Tooltip>
      )
    },
  }

  const colunas: DataTableColumn<Linha>[] = [
    ...COLUNAS.map(
      (c): DataTableColumn<Linha> => ({
        id: c.id,
        header: c.titulo,
        width: c.largura,
        wrap: c.quebra,
        sorted: ordem?.id === c.id ? ordem.dir : false,
        filtered: temFiltro(c, filtros),
        cell: celula[c.id],
        menu: menuDaColuna(c),
      })
    ),
    /* As ações da linha ficam atrás do "mais opções": excluir deixa de disputar espaço com editar. */
    {
      id: "acoes",
      header: "Ações",
      width: 56,
      align: "center",
      cell: (l) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label={`Mais opções de ${l.v.nome}`}>
              <EllipsisVerticalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem onSelect={() => abrirModal({ tipo: "variavel", k: l.k })}>
                {l.v.settle ? "Ver definição" : "Editar variável"}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            {!l.v.settle && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem variant="destructive" onSelect={() => excluirVar(l.k, false)}>
                    Excluir variável
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4.5">
      <InputGroup className="max-w-90">
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput
          type="search"
          aria-label="Procurar variável"
          placeholder="Procurar variável"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </InputGroup>
      <DataTable
        columns={colunas}
        rows={linhas}
        getRowId={(l) => l.k}
        getRowLabel={(l) => l.v.nome}
        onOpenRow={(l) => abrirModal({ tipo: "variavel", k: l.k })}
        selectedIds={selecionadas}
        onSelectedIdsChange={setSel}
        labels={{
          empty: "Nenhuma variável com esses filtros.",
          selected: (n) => `${n} ${n === 1 ? "variável selecionada" : "variáveis selecionadas"}`,
          selectAll: "Selecionar todas",
        }}
        /* Seleção em lote: a única ação que faz sentido em várias variáveis ao mesmo tempo é excluir. */
        bulkActions={
          <ActionBarButton onClick={() => excluirVars(selecionadas, () => setSel([]))}>
            <Trash2Icon />
            Excluir selecionadas
          </ActionBarButton>
        }
      />
    </div>
  )
}
