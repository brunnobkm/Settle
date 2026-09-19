// Células por tipo de coluna e seus editores (texto inline, seleção, pessoa, data,
// toggle, Revisar, Excluir). Usadas na tabela e no painel "Abrir".

import { createContext, useContext, useRef, useState, type ReactNode } from "react"
import { ptBR } from "date-fns/locale"
import {
  CheckIcon,
  EllipsisIcon,
  MessageCircleIcon,
  PencilIcon,
  PlusIcon,
  SettingsIcon,
  SparklesIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableCellFrame } from "@/components/ui/data-table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

import {
  GRUPO_VAZIO,
  PESSOAS,
  REV_ESTADOS,
  ROTULO_TOM,
  TONS,
  iniciais,
  novoId,
  opcaoPorId,
  formatarData,
  type Coluna,
  type EstadoRevisao,
  type Linha,
  type Opcao,
  type Tom,
  type Valor,
} from "./dados"

/* ---------------- ações compartilhadas ---------------- */

export type AcoesDaTabela = {
  definirValor: (linhaId: string, colId: string, valor: Valor) => void
  atualizarColuna: (colId: string, fn: (c: Coluna) => Coluna) => void
  removerOpcao: (colId: string, opcaoId: string) => void
  excluirLinha: (linhaId: string) => void
  tituloDe: (linha: Linha) => string
}

const Acoes = createContext<AcoesDaTabela | null>(null)
export const ProvedorDeAcoes = Acoes.Provider
function useAcoes() {
  const acoes = useContext(Acoes)
  if (!acoes) throw new Error("ProvedorDeAcoes ausente")
  return acoes
}

/* ---------------- tons ---------------- */

const TOM_BADGE: Record<Tom, string> = {
  neutral: "bg-muted text-foreground",
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
}
const TOM_TEXTO: Record<Tom, string> = {
  neutral: "text-foreground",
  primary: "text-primary",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
}
const TOM_PONTO: Record<Tom, string> = {
  neutral: "bg-muted-foreground",
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
}

/* ---------------- chip de opção ---------------- */

export function Chip({ col, id, onRemove }: { col: Coluna; id: string; onRemove?: () => void }) {
  const o = opcaoPorId(col, id)
  if (!o) return null
  const remover = onRemove && (
    <button
      type="button"
      aria-label={`Remover ${o.name}`}
      onClick={(e) => {
        e.stopPropagation()
        onRemove()
      }}
      className="-mr-1 flex rounded-sm opacity-50 outline-none hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring/50 [&_svg]:size-3"
    >
      <XIcon aria-hidden />
    </button>
  )
  if (col.type === "confidence") {
    return (
      <span className={cn("inline-flex items-center gap-1 text-xs font-medium", TOM_TEXTO[o.tone])}>
        {o.name}
        {remover}
      </span>
    )
  }
  if (col.type === "status_ai") {
    return (
      <Badge variant="secondary" className={cn("max-w-full rounded-sm", TOM_BADGE[o.tone])}>
        <SparklesIcon data-icon="inline-start" aria-hidden />
        <span className="truncate">{o.name}</span>
        {remover}
      </Badge>
    )
  }
  if (col.renderAs === "pill") {
    return (
      <Badge variant="outline" className="rounded-sm bg-muted">
        {o.name}
        {remover}
      </Badge>
    )
  }
  return (
    <Badge variant="secondary" className={cn("rounded-sm font-normal", TOM_BADGE[o.tone])}>
      {o.name}
      {remover}
    </Badge>
  )
}

function Pessoa({ id, nomeCompleto = false }: { id: Valor; nomeCompleto?: boolean }) {
  const p = PESSOAS.find((x) => x.id === id)
  if (!p) return null
  return (
    <span className="inline-flex items-center gap-1.5">
      <Avatar className="size-5">
        <AvatarFallback className="text-[10px] font-semibold">{iniciais(p.name)}</AvatarFallback>
      </Avatar>
      {nomeCompleto ? p.name : p.name.split(" ")[0]}
    </span>
  )
}

/* ---------------- edição inline ---------------- */

function CampoInline({
  inicial,
  rotulo,
  numero,
  className,
  aoConcluir,
}: {
  inicial: string
  rotulo: string
  numero?: boolean
  className?: string
  aoConcluir: (valor: string | null) => void
}) {
  const cancelado = useRef(false)
  return (
    <input
      autoFocus
      defaultValue={inicial}
      aria-label={rotulo}
      inputMode={numero ? "decimal" : undefined}
      onFocus={(e) => e.currentTarget.select()}
      onBlur={(e) => aoConcluir(cancelado.current ? null : e.currentTarget.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault()
          e.currentTarget.blur()
        }
        if (e.key === "Escape") {
          cancelado.current = true
          e.currentTarget.blur()
        }
      }}
      className={cn("w-full min-w-0 bg-transparent outline-none", numero && "tabular-nums", className)}
    />
  )
}

function useEdicaoInline(col: Coluna, linha: Linha) {
  const { definirValor } = useAcoes()
  const [editando, setEditando] = useState(false)
  const bruto = linha.valores[col.id]
  const inicial = bruto == null ? "" : String(bruto)
  const concluir = (valor: string | null) => {
    setEditando(false)
    if (valor === null) return
    const limpo = valor.trim()
    definirValor(linha.id, col.id, col.type === "number" ? (limpo === "" ? "" : Number(limpo.replace(",", "."))) : limpo)
  }
  return { editando, setEditando, inicial, concluir }
}

/** Primeira coluna: só o conteúdo (a alça, a seleção e o "Abrir" vêm do DataTable). */
export function CelulaTitulo({ col, linha }: { col: Coluna; linha: Linha }) {
  const { editando, setEditando, inicial, concluir } = useEdicaoInline(col, linha)
  if (editando) {
    return (
      <CampoInline
        inicial={inicial}
        rotulo={col.name}
        aoConcluir={concluir}
        className="-mx-1 rounded-sm px-1 ring-2 ring-ring"
      />
    )
  }
  return (
    <button
      type="button"
      onClick={() => setEditando(true)}
      className={cn(
        "min-w-0 flex-1 cursor-text rounded-sm text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        col.wrap ? "whitespace-normal" : "truncate",
        !inicial && "text-muted-foreground"
      )}
    >
      {inicial || "Vazio"}
    </button>
  )
}

/* ---------------- editor de opções ---------------- */

function MenuDaOpcao({ col, opcao }: { col: Coluna; opcao: Opcao }) {
  const { atualizarColuna, removerOpcao } = useAcoes()
  const [aberto, setAberto] = useState(false)
  const mudar = (patch: Partial<Opcao>) =>
    atualizarColuna(col.id, (c) => ({
      ...c,
      options: (c.options ?? []).map((o) => (o.id === opcao.id ? { ...o, ...patch } : o)),
    }))
  return (
    <Popover open={aberto} onOpenChange={setAberto}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon-xs" aria-label={`Opções de ${opcao.name}`} className="text-muted-foreground">
          <EllipsisIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" side="right" className="w-56 gap-1 p-1.5">
        <Input
          aria-label="Nome da opção"
          value={opcao.name}
          onChange={(e) => mudar({ name: e.target.value })}
          onKeyDown={(e) => e.key === "Enter" && setAberto(false)}
          className="h-8"
        />
        <Separator className="my-1" />
        <p className="px-2 pt-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">Cor</p>
        <div className="flex flex-wrap gap-1 p-1">
          {TONS.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={opcao.tone === t}
              onClick={() => mudar({ tone: t })}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-sm px-2 py-1 text-xs outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50",
                opcao.tone === t && "bg-muted font-medium"
              )}
            >
              <span aria-hidden className={cn("size-2.5 rounded-full", TOM_PONTO[t])} />
              {ROTULO_TOM[t]}
            </button>
          ))}
        </div>
        <Separator className="my-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            removerOpcao(col.id, opcao.id)
            setAberto(false)
          }}
          className="justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2Icon data-icon="inline-start" />
          Excluir opção
        </Button>
      </PopoverContent>
    </Popover>
  )
}

function EditorDeOpcoes({ col, linha }: { col: Coluna; linha: Linha }) {
  const { definirValor, atualizarColuna } = useAcoes()
  const [busca, setBusca] = useState("")
  const multi = col.type === "multiselect"
  const v = linha.valores[col.id]
  const atuais = multi ? (Array.isArray(v) ? v : []) : v ? [String(v)] : []
  const opcoes = col.options ?? []

  const alternar = (id: string) =>
    definirValor(
      linha.id,
      col.id,
      multi ? (atuais.includes(id) ? atuais.filter((x) => x !== id) : [...atuais, id]) : v === id ? null : id
    )
  const remover = (id: string) => definirValor(linha.id, col.id, multi ? atuais.filter((x) => x !== id) : null)

  const q = busca.trim()
  const visiveis = opcoes.filter((o) => o.name.toLowerCase().includes(q.toLowerCase()))
  const podeCriar = q !== "" && !opcoes.some((o) => o.name.toLowerCase() === q.toLowerCase())
  const criar = () => {
    const tom: Tom = col.type === "status_ai" || col.type === "confidence" ? "neutral" : TONS[opcoes.length % TONS.length]
    const nova: Opcao = { id: novoId("o"), name: q, tone: tom }
    atualizarColuna(col.id, (c) => ({ ...c, options: [...(c.options ?? []), nova] }))
    definirValor(linha.id, col.id, multi ? [...atuais, nova.id] : nova.id)
    setBusca("")
  }

  return (
    <>
      <div className="flex min-h-8 flex-wrap items-center gap-1 rounded-md bg-muted p-1.5">
        {atuais.length ? (
          atuais.map((id) => <Chip key={id} col={col} id={id} onRemove={() => remover(id)} />)
        ) : (
          <span className="text-[13px] text-muted-foreground">Vazio</span>
        )}
      </div>
      <Input
        autoFocus
        aria-label="Buscar ou criar opção"
        placeholder="Buscar ou criar opção…"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        onKeyDown={(e) => {
          if (e.key !== "Enter") return
          if (podeCriar) criar()
          else if (visiveis.length === 1) alternar(visiveis[0].id)
        }}
        className="h-8"
      />
      <div className="flex flex-col">
        {visiveis.map((o) => {
          const ligado = atuais.includes(o.id)
          return (
            <div key={o.id} className="flex items-center gap-1 rounded-sm hover:bg-muted">
              <button
                type="button"
                aria-pressed={ligado}
                onClick={() => alternar(o.id)}
                className="flex min-w-0 flex-1 items-center gap-2 rounded-sm px-2 py-1.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <Chip col={col} id={o.id} />
                <span className="flex-1" />
                {ligado && <CheckIcon aria-hidden className="size-4 shrink-0 text-primary" />}
              </button>
              <MenuDaOpcao col={col} opcao={o} />
            </div>
          )
        })}
        {podeCriar && (
          <button
            type="button"
            onClick={criar}
            className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-left text-muted-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50 [&_svg]:size-4"
          >
            <PlusIcon aria-hidden />
            Criar <strong className="font-semibold text-foreground">{q}</strong>
          </button>
        )}
      </div>
    </>
  )
}

/* ---------------- Revisar ---------------- */

function MenuRevisao({ valor, aoEscolher, children }: { valor: EstadoRevisao; aoEscolher: (v: EstadoRevisao) => void; children: ReactNode }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-auto min-w-52">
        <DropdownMenuGroup>
          {(Object.keys(REV_ESTADOS) as EstadoRevisao[]).map((k) => (
            <DropdownMenuItem key={k} onSelect={() => aoEscolher(k)}>
              {k === "revisado" ? <CheckIcon /> : k === "andamento" ? <SettingsIcon /> : <span aria-hidden className="size-4" />}
              {REV_ESTADOS[k]}
              {valor === k && <CheckIcon aria-label="atual" className="ml-auto text-primary" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function Revisar({ col, linha }: { col: Coluna; linha: Linha }) {
  const { definirValor, tituloDe } = useAcoes()
  const v = (linha.valores[col.id] || "off") as EstadoRevisao
  const definir = (novo: EstadoRevisao) => definirValor(linha.id, col.id, novo)
  if (v === "off" || v === "andamento") {
    return (
      <span className="inline-flex items-center gap-2">
        <Switch
          aria-label={`${col.name}: ${tituloDe(linha)}`}
          checked={v === "andamento"}
          onCheckedChange={(ligado) => definir(ligado ? "andamento" : "off")}
        />
        {v === "andamento" && (
          <MenuRevisao valor={v} aoEscolher={definir}>
            <Button variant="ghost" size="icon-xs" aria-label="Estado da revisão" className="text-muted-foreground">
              <SettingsIcon />
            </Button>
          </MenuRevisao>
        )}
      </span>
    )
  }
  if (v === "revisado") {
    return (
      <MenuRevisao valor={v} aoEscolher={definir}>
        <Button size="xs" className="h-7 max-w-[120px] bg-muted-foreground px-2.5 text-background hover:bg-muted-foreground/80">
          <CheckIcon data-icon="inline-start" />
          <span className="truncate">Revisado</span>
        </Button>
      </MenuRevisao>
    )
  }
  return (
    <Button size="xs" onClick={() => definir("revisado")} className="h-7 max-w-[120px] px-2.5" title="Marcar como revisado">
      <span className="truncate">Marcar como revisado</span>
    </Button>
  )
}

/* ---------------- célula por tipo ---------------- */

export function Celula({ col, linha, className }: { col: Coluna; linha: Linha; className?: string }) {
  const { definirValor, excluirLinha, tituloDe } = useAcoes()
  const edicao = useEdicaoInline(col, linha)
  const [dataAberta, setDataAberta] = useState(false)
  const v = linha.valores[col.id]
  const vazio = <span aria-hidden />
  const rotuloLinha = `${col.name}: ${tituloDe(linha)}`

  switch (col.type) {
    case "text":
    case "number": {
      if (edicao.editando) {
        return (
          <DataTableCellFrame wrap={col.wrap} className={cn("rounded-xs ring-2 ring-ring ring-inset", className)}>
            <CampoInline inicial={edicao.inicial} rotulo={col.name} numero={col.type === "number"} aoConcluir={edicao.concluir} />
          </DataTableCellFrame>
        )
      }
      return (
        <DataTableCellFrame asChild wrap={col.wrap} className={cn("cursor-text", className)}>
          <button type="button" onClick={() => edicao.setEditando(true)}>
            {edicao.inicial ? (
              <span className={cn(!col.wrap && "truncate", col.type === "number" && "tabular-nums")}>{edicao.inicial}</span>
            ) : (
              <span className="sr-only">Vazio</span>
            )}
          </button>
        </DataTableCellFrame>
      )
    }
    case "url":
    case "email": {
      if (edicao.editando) {
        return (
          <DataTableCellFrame className={cn("rounded-xs ring-2 ring-ring ring-inset", className)}>
            <CampoInline inicial={edicao.inicial} rotulo={col.name} aoConcluir={edicao.concluir} />
          </DataTableCellFrame>
        )
      }
      const fonte = col.id === "fonte"
      const texto = typeof v === "string" ? v : ""
      return (
        <DataTableCellFrame
          className={cn("cursor-text", className)}
          onClick={(e) => {
            if (!(e.target as Element).closest("a")) edicao.setEditando(true)
          }}
        >
          {texto ? (
            <a
              href={col.type === "email" ? `mailto:${texto}` : texto}
              target="_blank"
              rel="noreferrer"
              {...(fonte ? { "data-nao-prototipado": "" } : {})}
              className={cn(
                "truncate underline underline-offset-2",
                fonte ? "text-muted-foreground hover:text-foreground" : "text-primary"
              )}
            >
              {fonte ? "Hyperlink" : texto.replace(/^https?:\/\//, "")}
            </a>
          ) : (
            fonte && <span className="text-muted-foreground/50 underline underline-offset-2">Hyperlink</span>
          )}
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={`Editar ${col.name}`}
            onClick={(e) => {
              e.stopPropagation()
              edicao.setEditando(true)
            }}
            className="ml-auto opacity-0 focus-visible:opacity-100"
          >
            <PencilIcon />
          </Button>
        </DataTableCellFrame>
      )
    }
    case "status_ai":
    case "confidence":
    case "select":
    case "multiselect": {
      const ids = Array.isArray(v) ? v : v ? [String(v)] : []
      return (
        <Popover>
          <PopoverTrigger asChild>
            <DataTableCellFrame asChild wrap={col.wrap || col.type === "multiselect"} className={cn("cursor-pointer", className)}>
              <button type="button">
                {ids.length ? ids.map((id) => <Chip key={id} col={col} id={id} />) : <span className="sr-only">Vazio</span>}
              </button>
            </DataTableCellFrame>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-64 gap-1 p-1.5">
            <EditorDeOpcoes col={col} linha={linha} />
          </PopoverContent>
        </Popover>
      )
    }
    case "person":
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <DataTableCellFrame asChild className={cn("cursor-pointer", className)}>
              <button type="button">{v ? <Pessoa id={v} /> : <span className="sr-only">Vazio</span>}</button>
            </DataTableCellFrame>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-auto min-w-52">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Pessoa</DropdownMenuLabel>
              {PESSOAS.map((p) => (
                <DropdownMenuItem key={p.id} onSelect={() => definirValor(linha.id, col.id, v === p.id ? null : p.id)}>
                  <Pessoa id={p.id} nomeCompleto />
                  {v === p.id && <CheckIcon aria-label="selecionada" className="ml-auto text-primary" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    case "date": {
      const texto = typeof v === "string" ? v : ""
      return (
        <Popover open={dataAberta} onOpenChange={setDataAberta}>
          <PopoverTrigger asChild>
            <DataTableCellFrame asChild className={cn("cursor-pointer", className)}>
              <button type="button" className="tabular-nums">
                {texto ? formatarData(texto) : <span className="sr-only">Vazio</span>}
              </button>
            </DataTableCellFrame>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto gap-1 p-1.5">
            <Calendar
              mode="single"
              locale={ptBR}
              selected={texto ? new Date(`${texto}T00:00:00`) : undefined}
              onSelect={(d) => {
                if (!d) return
                const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
                definirValor(linha.id, col.id, iso)
                setDataAberta(false)
              }}
            />
            <Separator />
            <Button
              variant="ghost"
              size="sm"
              className="justify-start"
              onClick={() => {
                definirValor(linha.id, col.id, "")
                setDataAberta(false)
              }}
            >
              <XIcon data-icon="inline-start" />
              Limpar
            </Button>
          </PopoverContent>
        </Popover>
      )
    }
    case "checkbox":
      return (
        <DataTableCellFrame
          align="center"
          className={cn("cursor-pointer", className)}
          onClick={(e) => {
            if (!(e.target as Element).closest("[data-slot=checkbox]")) definirValor(linha.id, col.id, !v)
          }}
        >
          <Checkbox aria-label={rotuloLinha} checked={!!v} onCheckedChange={(c) => definirValor(linha.id, col.id, c === true)} />
        </DataTableCellFrame>
      )
    case "toggle_action":
      return (
        <DataTableCellFrame className={cn("cursor-pointer gap-2", className)}>
          <Switch aria-label={rotuloLinha} checked={!!v} onCheckedChange={(c) => definirValor(linha.id, col.id, c)} />
          {v && <MessageCircleIcon aria-hidden className="size-4 text-muted-foreground" />}
        </DataTableCellFrame>
      )
    case "revisar":
      return (
        <DataTableCellFrame className={className}>
          <Revisar col={col} linha={linha} />
        </DataTableCellFrame>
      )
    case "delete_action":
      return (
        <DataTableCellFrame align="center" className={cn("py-0", className)}>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Excluir ${tituloDe(linha)}`}
            title="Excluir linha"
            onClick={() => excluirLinha(linha.id)}
            className="text-destructive opacity-0 group-hover/row:opacity-100 hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100"
          >
            <Trash2Icon />
          </Button>
        </DataTableCellFrame>
      )
    case "formula":
      return <DataTableCellFrame className={cn("text-muted-foreground", className)}>{vazio}</DataTableCellFrame>
  }
}

/* ---------------- rótulo do grupo ---------------- */

export function RotuloDoGrupo({ col, chave }: { col: Coluna; chave: string }) {
  if (chave === GRUPO_VAZIO) return <span className="text-muted-foreground">Sem {col.name.toLowerCase()}</span>
  if (col.type === "person") return <Pessoa id={chave} nomeCompleto />
  if (col.type === "toggle_action" || col.type === "checkbox")
    return <strong className="font-semibold">{chave === "true" ? "Sim" : "Não"}</strong>
  if (col.type === "revisar") return <strong className="font-semibold">{REV_ESTADOS[chave as EstadoRevisao] ?? chave}</strong>
  if (opcaoPorId(col, chave)) return <Chip col={col} id={chave} />
  return <span>{chave}</span>
}
