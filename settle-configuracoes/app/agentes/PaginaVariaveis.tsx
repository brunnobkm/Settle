// A tabela de variáveis. Em relação ao handoff: "Tipo" virou "Formato", "Agentes usando"
// virou "Usada por" com os nomes (no teste, "Nenhum agente" fez duas pessoas acharem que
// precisavam ligar a variável aos agentes por aqui), e excluir ficou à vista na linha (a
// Eliane não achou onde excluir).

import { useEffect, useState, type ReactNode } from "react"
import { EllipsisVerticalIcon, PencilIcon, SearchIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

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
import { cn } from "@/lib/utils"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Textarea } from "@/components/ui/textarea"

import { EMPRESA, FORMATO_VAR, TIPOS_VAR, type TipoVar, type Variavel } from "./dados"
import { useAgentes, type DadosDaVariavel } from "./estado"
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
  { id: "nome", titulo: "Nome", tipo: "texto", valor: (l) => l.v.nome, largura: 160, quebra: true,
    info: "Esse é o nome que você escolhe para identificar sua variável, que será usada nos agentes." },
  { id: "prompt", titulo: "O que procurar no edital", tipo: "texto", valor: (l) => l.v.prompt || "", largura: 170, quebra: true,
    info: "Essa é a instrução que você escreve para a gente entender o que precisa procurar para você." },
  { id: "tipo", titulo: "Formato", tipo: "opcoes", valor: (l) => FORMATO_VAR[l.v.tipo].t, opcoes: () => TIPOS_VAR.map((t) => FORMATO_VAR[t].t), largura: 140,
    info: "Todo resultado é escrito em forma de texto, número ou escolha. Aqui você vê qual formato foi escolhido para a resposta desta variável." },
  { id: "fonte", titulo: "Onde procurar", tipo: "multi", valor: (l) => fontesDe(l.v), largura: 150, quebra: true,
    info: "As variáveis podem ser buscadas em vários lugares diferentes. Aqui você vê em quais locais a resposta deve ser procurada, e em qual ordem." },
  { id: "padrao", titulo: "Quando não encontrar", tipo: "texto", valor: (l) => l.v.padrao || "", largura: 150,
    info: "Quando a resposta não é encontrada, precisamos mostrar algo para você entender que não houve resultado. Aqui você define o que vai ver quando isso acontecer." },
  { id: "usos", titulo: "Quais agentes usam", tipo: "multi", valor: (l, cfg) => agentesDaVar(l.k, cfg).map((a) => a.nome), largura: 140, quebra: true,
    info: "Saiba em quais agentes a resposta desta variável está sendo usada." },
  { id: "origem", titulo: "Quem criou", tipo: "opcoes", valor: (l) => (l.v.settle ? "Settle" : EMPRESA), largura: 120,
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

/*
  Edição na própria tabela: um jeito rápido de corrigir um nome ou uma instrução sem abrir
  a variável. Clicar no valor abre o campo; Enter ou sair salva, Esc desfaz. As variáveis
  da Settle não são editáveis, e "Onde procurar" continua só no formulário, porque ali a
  ordem também conta.
*/
function CelulaTexto({
  valor,
  rotulo,
  vazio,
  multilinha,
  travado,
  negrito,
  onSalvar,
}: {
  valor: string
  rotulo: string
  vazio?: string
  multilinha?: boolean
  travado?: boolean
  negrito?: boolean
  onSalvar: (v: string) => void
}) {
  const [editando, setEditando] = useState(false)
  const [texto, setTexto] = useState(valor)
  const classe = negrito ? "text-[13px] font-semibold" : "text-xs leading-4 text-muted-foreground"

  if (travado) return <span className={classe}>{valor || vazio}</span>

  const confirmar = () => {
    setEditando(false)
    if (texto.trim() !== valor) onSalvar(texto.trim())
  }
  if (editando) {
    const comuns = {
      autoFocus: true,
      "aria-label": rotulo,
      value: texto,
      onBlur: confirmar,
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
          setTexto(valor)
          setEditando(false)
        }
        if (e.key === "Enter" && (!multilinha || e.metaKey || e.ctrlKey)) {
          e.preventDefault()
          confirmar()
        }
      },
    }
    return multilinha ? (
      <Textarea {...comuns} rows={3} className="text-xs" onChange={(e) => setTexto(e.target.value)} />
    ) : (
      <Input {...comuns} className="h-7 text-[13px]" onChange={(e) => setTexto(e.target.value)} />
    )
  }
  return (
    <button
      type="button"
      onClick={() => {
        setTexto(valor)
        setEditando(true)
      }}
      className="-mx-1 flex w-[calc(100%+0.5rem)] items-start gap-1 rounded-sm px-1 py-0.5 text-left outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <span className={cn("min-w-0 flex-1", classe, !valor && "text-muted-foreground")}>{valor || vazio}</span>
      <PencilIcon aria-hidden className="mt-0.5 size-3 shrink-0 text-muted-foreground opacity-0 group-hover/cell:opacity-100" />
      <span className="sr-only">Editar {rotulo}</span>
    </button>
  )
}

function CelulaEscolha({
  valor,
  rotulo,
  opcoes,
  travado,
  onSalvar,
}: {
  valor: string
  rotulo: string
  opcoes: { v: string; t: string }[]
  travado?: boolean
  onSalvar: (v: string) => void
}) {
  const [editando, setEditando] = useState(false)
  const atual = opcoes.find((o) => o.v === valor)
  if (travado) return <span className="text-[13px] text-muted-foreground">{atual?.t ?? valor}</span>
  if (editando) {
    return (
      <NativeSelect
        autoFocus
        aria-label={rotulo}
        size="sm"
        className="w-full"
        value={valor}
        onBlur={() => setEditando(false)}
        onChange={(e) => {
          setEditando(false)
          if (e.target.value !== valor) onSalvar(e.target.value)
        }}
      >
        {opcoes.map((o) => (
          <NativeSelectOption key={o.v} value={o.v}>
            {o.t}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    )
  }
  return (
    <button
      type="button"
      onClick={() => setEditando(true)}
      className="-mx-1 flex w-[calc(100%+0.5rem)] items-center gap-1 rounded-sm px-1 py-0.5 text-left outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <span className={cn("min-w-0 flex-1 text-[13px]", atual ? "text-muted-foreground" : "text-muted-foreground italic")}>
        {atual?.t ?? valor}
      </span>
      <PencilIcon aria-hidden className="size-3 shrink-0 text-muted-foreground opacity-0 group-hover/cell:opacity-100" />
      <span className="sr-only">Editar {rotulo}</span>
    </button>
  )
}

/** Pedido de criar vindo de outra página (Campos do card, e-mail, Como funciona). */
function pediuNova() {
  return new URLSearchParams(window.location.hash.split("?")[1] ?? "").get("nova")
}

export function PaginaVariaveis() {
  const { cfg, abrirModal, excluirVars, salvarVar } = useAgentes()
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

  /** Salva uma alteração feita na própria tabela, com as mesmas regras do formulário. */
  const editar = (l: Linha, patch: Partial<DadosDaVariavel>) => {
    const e = salvarVar(l.k, {
      nome: l.v.nome, tipo: l.v.tipo, prompt: l.v.prompt, fontes: l.v.fontes, resto: l.v.resto, padrao: l.v.padrao,
      ...patch,
    })
    if (e) toast(Object.values(e)[0] as string)
  }

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
      <CelulaTexto
        negrito
        rotulo={`Nome de ${l.v.nome}`}
        valor={l.v.nome}
        travado={l.v.settle}
        onSalvar={(v) => editar(l, { nome: v })}
      />
    ),
    prompt: (l) => (
      <CelulaTexto
        multilinha
        rotulo={`O que procurar no edital, de ${l.v.nome}`}
        valor={l.v.prompt}
        travado={l.v.settle}
        onSalvar={(v) => editar(l, { prompt: v })}
      />
    ),
    tipo: (l) => (
      <CelulaEscolha
        rotulo={`Formato de ${l.v.nome}`}
        valor={l.v.tipo}
        travado={l.v.settle}
        opcoes={TIPOS_VAR.map((t) => ({ v: t, t: FORMATO_VAR[t].t }))}
        onSalvar={(v) => editar(l, { tipo: v as TipoVar, padrao: "" })}
      />
    ),
    fonte: (l) => (
      <span className="flex flex-wrap gap-1 py-0.5">
        {fontesDe(l.v).map((f) => (
          <TagFonte key={f} fonte={f} />
        ))}
      </span>
    ),
    padrao: (l) =>
      l.v.tipo === "sim ou não" ? (
        <CelulaEscolha
          rotulo={`Quando não encontrar, de ${l.v.nome}`}
          valor={l.v.padrao}
          travado={l.v.settle}
          opcoes={[
            { v: "", t: "sem resposta" },
            { v: "sim", t: "sim" },
            { v: "não", t: "não" },
          ]}
          onSalvar={(v) => editar(l, { padrao: v })}
        />
      ) : (
        <CelulaTexto
          rotulo={`Quando não encontrar, de ${l.v.nome}`}
          valor={l.v.padrao}
          vazio="sem resposta"
          travado={l.v.settle}
          onSalvar={(v) => editar(l, { padrao: v })}
        />
      ),
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
      width: 76,
      align: "center",
      cell: (l) => (
        <span className="flex items-center justify-center">
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
              {!l.v.settle && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem variant="destructive" onSelect={() => excluirVars([l.k])}>
                      <Trash2Icon />
                      Excluir variável
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </span>
      ),
    },
  ]

  return (
    <SettingsPage width="full">
      <ComoFunciona
        aoCriarVariavel={() => abrirModal({ tipo: "conversa-variavel" })}
        aoCriarAgente={() => {
          window.location.hash = "agentes"
        }}
      />
      <Aviso tom="marca">
        <b>Variáveis</b> são perguntas que a Settle faz a todo edital, como o CNPJ do órgão ou se exige atestado. Sozinha,
        uma variável não faz nada: é a resposta dela que os agentes usam.
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
          oque="uma variável"
          aoConversar={() => abrirModal({ tipo: "conversa-variavel" })}
          aoConfigurar={() => abrirModal({ tipo: "variavel", k: null })}
        />
      </div>
      <DataTable
        layout="fixed"
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
