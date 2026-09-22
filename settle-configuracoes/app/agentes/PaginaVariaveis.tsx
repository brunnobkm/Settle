// A tabela de variáveis. Em relação ao handoff: "Tipo" virou "Formato", "Agentes usando"
// virou "Usada por" com os nomes (no teste, "Nenhum agente" fez duas pessoas acharem que
// precisavam ligar a variável aos agentes por aqui), e excluir ficou à vista na linha (a
// Eliane não achou onde excluir).

import { useEffect, useState, type ReactNode } from "react"
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
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { SettingsPage } from "@/components/ui/settings-page"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

import { Aviso } from "../comum"
import { BotaoDeCriar, ComoFunciona, InfoDaColuna, TagFonte, TagOrigem } from "./comum"
import { EMPRESA, FORMATO_VAR, TIPOS_VAR, type Variavel } from "./dados"
import { useAgentes } from "./estado"
import { rascunhoNovo } from "./Janela"
import { agentesDaVar, fontesDe, type Config } from "./regras"

type Linha = { k: string; v: Variavel }
type Tipo = "texto" | "opcoes" | "multi"

type Coluna = {
  id: string
  titulo: string
  tipo: Tipo
  valor: (l: Linha, cfg: Config) => string | string[]
  opcoes?: () => string[]
  largura?: number
  quebra?: boolean
  /** O que a coluna representa: no "i" do cabeçalho e no topo do menu. */
  info: string
}

const COLUNAS: Coluna[] = [
  { id: "nome", titulo: "Nome", tipo: "texto", valor: (l) => l.v.nome, largura: 210, quebra: true,
    info: "Esse é o nome que você escolhe para identificar sua variável, que será usada nos agentes." },
  { id: "prompt", titulo: "O que procurar no edital", tipo: "texto", valor: (l) => l.v.prompt || "", largura: 260, quebra: true,
    info: "Essa é a instrução que você escreve para a gente entender o que precisa procurar para você." },
  { id: "tipo", titulo: "Formato", tipo: "opcoes", valor: (l) => FORMATO_VAR[l.v.tipo].t, opcoes: () => TIPOS_VAR.map((t) => FORMATO_VAR[t].t), largura: 120,
    info: "Todo resultado é escrito em forma de texto, número ou escolha. Aqui você vê qual formato foi escolhido para a informação extraída." },
  { id: "fonte", titulo: "Onde procurar", tipo: "multi", valor: (l) => fontesDe(l.v), largura: 180, quebra: true,
    info: "As variáveis podem ser buscadas em vários lugares diferentes. Aqui você vê em quais locais o dado deve ser procurado, e em qual ordem." },
  { id: "padrao", titulo: "Quando não encontrar", tipo: "texto", valor: (l) => l.v.padrao || "", largura: 170,
    info: "Quando uma informação não é encontrada, precisamos mostrar algo para você entender que não houve resultado. Aqui você define o que vai ver quando o dado não for encontrado." },
  { id: "usos", titulo: "Quais agentes usam", tipo: "multi", valor: (l, cfg) => agentesDaVar(l.k, cfg).map((a) => a.nome), largura: 200, quebra: true,
    info: "Saiba em quais agentes o dado desta variável está sendo usado." },
  { id: "origem", titulo: "Quem criou", tipo: "opcoes", valor: (l) => (l.v.settle ? "Settle" : EMPRESA), largura: 130,
    info: "Algumas variáveis são criadas pela Settle e não podem ser alteradas; outras você mesmo cria. Aqui mostramos quais são suas e quais são nossas." },
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

/** Pedido de criar vindo de outra página (Campos do card, e-mail, Como funciona). */
function pediuNova() {
  return new URLSearchParams(window.location.hash.split("?")[1] ?? "").get("nova")
}

export function PaginaVariaveis() {
  const { cfg, abrirModal, excluirVars } = useAgentes()
  const [busca, setBusca] = useState("")
  const [ordem, setOrdem] = useState<{ id: string; dir: "asc" | "desc" } | null>(null)
  const [filtros, setFiltros] = useState<Filtros>({})
  const [sel, setSel] = useState<string[]>([])

  useEffect(() => {
    const abrirSePediu = () => {
      const pedido = pediuNova()
      if (!pedido) return
      window.history.replaceState(null, "", "#variaveis")
      abrirModal(pedido === "conversa" ? { tipo: "conversa-variavel" } : { tipo: "variavel", k: null })
    }
    abrirSePediu()
    window.addEventListener("hashchange", abrirSePediu)
    return () => window.removeEventListener("hashchange", abrirSePediu)
  }, [abrirModal])

  const todas: Linha[] = Object.entries(cfg.vars).map(([k, v]) => ({ k, v }))
  const q = busca.trim().toLowerCase()
  const linhas = todas.filter((l) => (!q || `${l.v.nome} ${l.v.desc} ${l.v.prompt}`.toLowerCase().includes(q)) && passa(l, cfg, filtros))
  if (ordem) {
    const c = COLUNAS.find((x) => x.id === ordem.id)!
    linhas.sort((a, b) => {
      const x = [c.valor(a, cfg)].flat().join(", ")
      const y = [c.valor(b, cfg)].flat().join(", ")
      const n = c.id === "usos" ? [c.valor(a, cfg)].flat().length - [c.valor(b, cfg)].flat().length : x.localeCompare(y, "pt-BR")
      return ordem.dir === "asc" ? n : -n
    })
  }
  const selecionadas = sel.filter((k) => cfg.vars[k])

  const menuDaColuna = (c: Coluna) => {
    const ativo = temFiltro(c, filtros) || ordem?.id === c.id
    const marcadas = (filtros[c.id] as string[] | undefined) ?? []
    return (
      <>
        {/* o mesmo texto do "i", para quem chega pelo teclado */}
        <p className="max-w-60 px-2 pt-1.5 pb-2 text-xs leading-[17px] text-muted-foreground">{c.info}</p>
        <DropdownMenuSeparator />
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
                onKeyDown={(e) => e.stopPropagation()}
                onChange={(e) => setFiltros((f) => ({ ...f, [c.id]: e.target.value }))}
              />
            </div>
          </DropdownMenuGroup>
        ) : (
          <DropdownMenuGroup>
            <div className="flex items-center justify-between px-2 py-1">
              <DropdownMenuLabel className="p-0">Mostrar</DropdownMenuLabel>
              <Button variant="ghost" size="xs" className="h-5 px-1.5 text-xs text-primary" onClick={() => setFiltros((f) => ({ ...f, [c.id]: [] }))}>
                {marcadas.length ? "Limpar" : "Todas"}
              </Button>
            </div>
            <div className="max-h-52 overflow-y-auto">
              {opcoesDa(c, todas, cfg).map((o) => (
                <DropdownMenuCheckboxItem
                  key={o}
                  checked={marcadas.includes(o)}
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
    prompt: (l) => <span className="line-clamp-2 text-xs leading-4 text-muted-foreground">{l.v.prompt}</span>,
    tipo: (l) => <span className="text-[13px] text-muted-foreground">{FORMATO_VAR[l.v.tipo].t}</span>,
    fonte: (l) => (
      <span className="flex flex-wrap gap-1 py-0.5">
        {fontesDe(l.v).map((f) => (
          <TagFonte key={f} fonte={f} />
        ))}
      </span>
    ),
    padrao: (l) => <span className="text-xs text-muted-foreground">{l.v.padrao || "sem resposta"}</span>,
    usos: (l) => {
      const a = agentesDaVar(l.k, cfg)
      /* Sem uso não é problema: a variável fica pronta para quando algum agente precisar. */
      if (!a.length) return <span className="text-xs text-muted-foreground">Nenhum agente por enquanto</span>
      const visiveis = a.slice(0, 2)
      const resto = a.length - visiveis.length
      return (
        <span className="flex flex-wrap items-center gap-x-1 text-xs leading-4">
          {visiveis.map((x, i) => (
            <span key={x.id}>
              <button
                type="button"
                className="rounded-sm text-left font-medium text-primary underline-offset-2 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                onClick={() => abrirModal({ tipo: "agente", id: x.id })}
              >
                {x.nome}
              </button>
              {i < visiveis.length - 1 || resto ? "," : ""}
            </span>
          ))}
          {resto > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0} className="cursor-help text-muted-foreground">
                  mais {resto}
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-70">{a.slice(2).map((x) => x.nome).join(", ")}</TooltipContent>
            </Tooltip>
          )}
        </span>
      )
    },
    origem: (l) => <TagOrigem settle={l.v.settle} empresa={EMPRESA} />,
  }

  const colunas: DataTableColumn<Linha>[] = [
    ...COLUNAS.map(
      (c): DataTableColumn<Linha> => ({
        id: c.id,
        header: c.titulo,
        headerAddon: <InfoDaColuna texto={c.info} />,
        width: c.largura,
        wrap: c.quebra,
        sorted: ordem?.id === c.id ? ordem.dir : false,
        filtered: temFiltro(c, filtros),
        cell: celula[c.id],
        menu: menuDaColuna(c),
      })
    ),
    {
      id: "acoes",
      header: "Ações",
      width: 88,
      align: "center",
      cell: (l) => (
        <span className="flex items-center justify-center gap-0.5">
          {!l.v.settle && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="text-destructive hover:bg-destructive/8 hover:text-destructive" aria-label={`Excluir ${l.v.nome}`} onClick={() => excluirVars([l.k])}>
                  <Trash2Icon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Excluir variável</TooltipContent>
            </Tooltip>
          )}
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
                <DropdownMenuItem
                  onSelect={() =>
                    abrirModal({ tipo: "novo", rascunho: { ...rascunhoNovo("texto", false), texto: `Avise quando {{${l.k}}} ` } })
                  }
                >
                  Criar agente com esta variável
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </span>
      ),
    },
  ]

  return (
    <SettingsPage width="full" className="max-w-340">
      <ComoFunciona
        aoCriarVariavel={() => abrirModal({ tipo: "conversa-variavel" })}
        aoCriarAgente={() => {
          window.location.hash = "agentes"
        }}
      />
      <Aviso tom="marca">
        <b>Variáveis</b> são dados que a Settle tira de todo edital, como o CNPJ do órgão ou se exige atestado. Sozinha,
        uma variável não faz nada: ela é o dado que os agentes usam.
      </Aviso>
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
        <InputGroup className="max-w-90">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput type="search" aria-label="Procurar variável" placeholder="Procurar variável" value={busca} onChange={(e) => setBusca(e.target.value)} />
        </InputGroup>
        <BotaoDeCriar
          rotulo="Adicionar variável"
          aoConversar={() => abrirModal({ tipo: "conversa-variavel" })}
          aoConfigurar={() => abrirModal({ tipo: "variavel", k: null })}
        />
      </div>
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
        bulkActions={
          <ActionBarButton onClick={() => excluirVars(selecionadas, () => setSel([]))}>
            <Trash2Icon />
            Excluir selecionadas
          </ActionBarButton>
        }
      />
    </SettingsPage>
  )
}
