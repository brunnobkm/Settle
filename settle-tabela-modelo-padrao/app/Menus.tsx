// Menus da tabela: menu do cabeçalho da coluna, "Adicionar coluna", agregação do
// rodapé e menu da alça da linha.

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BetweenVerticalEndIcon,
  BetweenVerticalStartIcon,
  CopyIcon,
  EyeIcon,
  EyeOffIcon,
  FunnelIcon,
  FunnelXIcon,
  GroupIcon,
  LinkIcon,
  SquareArrowOutUpRightIcon,
  Trash2Icon,
  UngroupIcon,
  WrapTextIcon,
  XIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

import {
  AGREGACOES,
  OPERADORES_PRECISAM_VALOR,
  TIPOS,
  TIPOS_ESCOLHIVEIS,
  agregacoesPara,
  filtroUsaOpcoes,
  operadoresPara,
  podeAgrupar,
  type Agregacao,
  type Coluna,
  type Filtro,
  type Linha,
  type Operador,
  type Ordenacao,
  type Tipo,
} from "./dados"

/** Texto dentro de um menu: não deixa a busca por letra do menu roubar as teclas. */
function teclasDeCampo(e: KeyboardEvent<HTMLInputElement>, aoConfirmar?: () => void) {
  if (e.key === "Escape") return
  e.stopPropagation()
  if (e.key === "Enter") {
    e.preventDefault()
    aoConfirmar?.()
  }
}
/** Fecha o menu aberto (mesmo efeito do Esc). */
function fecharMenu(origem: HTMLElement) {
  origem.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))
}

export type ApiDasColunas = {
  renomear: (colId: string, nome: string) => void
  trocarTipo: (colId: string, tipo: Tipo) => void
  ordenar: (colId: string, dir: Ordenacao["dir"] | null) => void
  definirFiltro: (colId: string, patch: Partial<Filtro> | null) => void
  agrupar: (colId: string | null) => void
  alternarQuebra: (colId: string) => void
  ocultar: (colId: string, oculta: boolean) => void
  inserir: (posicao: number | null, nome: string, tipo: Tipo) => void
  duplicar: (colId: string) => void
  excluir: (colId: string) => void
  agregar: (colId: string, agg: Agregacao) => void
}

/* ---------------- tipos em grade ---------------- */

function ItensDeTipo({ aoEscolher }: { aoEscolher: (t: Tipo) => void }) {
  return (
    <DropdownMenuGroup className="grid grid-cols-2 gap-0.5">
      {TIPOS_ESCOLHIVEIS.map((t) => {
        const { label, Icon } = TIPOS[t]
        return (
          <DropdownMenuItem key={t} onSelect={() => aoEscolher(t)}>
            <Icon className="text-muted-foreground" />
            {label}
          </DropdownMenuItem>
        )
      })}
    </DropdownMenuGroup>
  )
}

function SubInserir({ rotulo, icone, aoCriar }: { rotulo: string; icone: ReactNode; aoCriar: (nome: string, tipo: Tipo) => void }) {
  const [nome, setNome] = useState("")
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        {icone}
        {rotulo}
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="w-80">
        <div className="p-1">
          <Input aria-label="Nome da coluna" placeholder="Nome da coluna" value={nome} onChange={(e) => setNome(e.target.value)} onKeyDown={(e) => teclasDeCampo(e)} className="h-8" />
        </div>
        <DropdownMenuLabel>Tipo</DropdownMenuLabel>
        <ItensDeTipo aoEscolher={(t) => aoCriar(nome, t)} />
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  )
}

/* ---------------- filtro da coluna ---------------- */

function SubFiltro({ col, filtro, api }: { col: Coluna; filtro?: Filtro; api: ApiDasColunas }) {
  const ops = operadoresPara(col.type)
  const op = filtro?.op ?? ops[0][0]
  const precisaValor = OPERADORES_PRECISAM_VALOR.includes(op)
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <FunnelIcon />
        Filtrar
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="w-60">
        <DropdownMenuLabel>Condição</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={op} onValueChange={(v) => api.definirFiltro(col.id, { op: v as Operador })}>
          {ops.map(([valor, rotulo]) => (
            <DropdownMenuRadioItem key={valor} value={valor} onSelect={(e) => e.preventDefault()}>
              {rotulo}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        {precisaValor && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Valor</DropdownMenuLabel>
            {filtroUsaOpcoes(col) ? (
              <DropdownMenuRadioGroup value={filtro?.value ?? ""} onValueChange={(v) => api.definirFiltro(col.id, { op, value: v })}>
                {(col.options ?? []).map((o) => (
                  <DropdownMenuRadioItem key={o.id} value={o.id} onSelect={(e) => e.preventDefault()}>
                    {o.name}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            ) : (
              <div className="p-1">
                <Input
                  aria-label={`Valor do filtro de ${col.name}`}
                  placeholder="valor"
                  inputMode={col.type === "number" ? "decimal" : undefined}
                  value={filtro?.value ?? ""}
                  onChange={(e) => api.definirFiltro(col.id, { op, value: e.target.value })}
                  onKeyDown={(e) => teclasDeCampo(e, () => fecharMenu(e.currentTarget))}
                  className="h-8"
                />
              </div>
            )}
          </>
        )}
        {filtro && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem variant="destructive" onSelect={() => api.definirFiltro(col.id, null)}>
                <FunnelXIcon />
                Remover filtro
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  )
}

/* ---------------- menu do cabeçalho ---------------- */

/** Nome da coluna no topo do menu: já abre selecionado, como no original. */
function CampoNome({ valor, aoMudar }: { valor: string; aoMudar: (nome: string) => void }) {
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    const t = setTimeout(() => ref.current?.select(), 0)
    return () => clearTimeout(t)
  }, [])
  return (
    <Input
      ref={ref}
      aria-label="Nome da coluna"
      value={valor}
      onChange={(e) => aoMudar(e.target.value)}
      onKeyDown={(e) => teclasDeCampo(e, () => fecharMenu(e.currentTarget))}
      className="h-8"
    />
  )
}

export function MenuDaColuna({
  col,
  indice,
  ordenacao,
  filtro,
  agrupadoPor,
  api,
}: {
  col: Coluna
  /** Posição na lista completa de colunas. */
  indice: number
  ordenacao: Ordenacao | null
  filtro?: Filtro
  agrupadoPor: string | null
  api: ApiDasColunas
}) {
  const sistema = col.system
  const { label: rotuloTipo, Icon: IconeTipo } = TIPOS[col.type]
  const ordenada = ordenacao?.col === col.id
  return (
    <>
      <div className="p-1">
        <CampoNome valor={col.name} aoMudar={(nome) => api.renomear(col.id, nome)} />
      </div>
      {!sistema && (
        <>
          <DropdownMenuGroup>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <IconeTipo />
                Editar tipo · {rotuloTipo}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-80">
                <DropdownMenuLabel>Tipo da propriedade</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={col.type} onValueChange={(t) => api.trocarTipo(col.id, t as Tipo)} className="grid grid-cols-2 gap-0.5">
                  {TIPOS_ESCOLHIVEIS.map((t) => {
                    const { label, Icon } = TIPOS[t]
                    return (
                      <DropdownMenuRadioItem key={t} value={t}>
                        <Icon className="text-muted-foreground" />
                        {label}
                      </DropdownMenuRadioItem>
                    )
                  })}
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => api.ordenar(col.id, "asc")}>
              <ArrowUpIcon />
              Ordenar crescente
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => api.ordenar(col.id, "desc")}>
              <ArrowDownIcon />
              Ordenar decrescente
            </DropdownMenuItem>
            {ordenada && (
              <DropdownMenuItem onSelect={() => api.ordenar(col.id, null)}>
                <XIcon />
                Remover ordenação
              </DropdownMenuItem>
            )}
            <SubFiltro col={col} filtro={filtro} api={api} />
          </DropdownMenuGroup>
        </>
      )}
      {podeAgrupar(col) && (
        <DropdownMenuGroup>
          {agrupadoPor === col.id ? (
            <DropdownMenuItem onSelect={() => api.agrupar(null)}>
              <UngroupIcon />
              Desagrupar
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onSelect={() => api.agrupar(col.id)}>
              <GroupIcon />
              Agrupar por isto
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
      )}
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem onSelect={() => api.alternarQuebra(col.id)}>
          <WrapTextIcon />
          {col.wrap ? "Não quebrar texto" : "Quebrar texto"}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => api.ocultar(col.id, true)}>
          <EyeOffIcon />
          Ocultar coluna
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <SubInserir rotulo="Inserir à esquerda" icone={<BetweenVerticalStartIcon />} aoCriar={(nome, tipo) => api.inserir(indice, nome, tipo)} />
        <SubInserir rotulo="Inserir à direita" icone={<BetweenVerticalEndIcon />} aoCriar={(nome, tipo) => api.inserir(indice + 1, nome, tipo)} />
        <DropdownMenuItem onSelect={() => api.duplicar(col.id)}>
          <CopyIcon />
          Duplicar coluna
        </DropdownMenuItem>
        {!col.title && (
          <DropdownMenuItem variant="destructive" onSelect={() => api.excluir(col.id)}>
            <Trash2Icon />
            Excluir coluna
          </DropdownMenuItem>
        )}
      </DropdownMenuGroup>
    </>
  )
}

/* ---------------- adicionar coluna ---------------- */

export function NovaColuna({ ocultas, api, aoConcluir }: { ocultas: Coluna[]; api: ApiDasColunas; aoConcluir: () => void }) {
  const [nome, setNome] = useState("")
  return (
    <>
      <Input autoFocus aria-label="Nome da coluna" placeholder="Nome da coluna" value={nome} onChange={(e) => setNome(e.target.value)} className="h-8" />
      <p className="px-2 pt-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">Tipo</p>
      <div className="grid grid-cols-2 gap-0.5">
        {TIPOS_ESCOLHIVEIS.map((t) => {
          const { label, Icon } = TIPOS[t]
          return (
            <Button
              key={t}
              variant="ghost"
              size="sm"
              className="justify-start font-normal"
              onClick={() => {
                api.inserir(null, nome, t)
                setNome("")
                aoConcluir()
              }}
            >
              <Icon data-icon="inline-start" className="text-muted-foreground" />
              {label}
            </Button>
          )
        })}
      </div>
      {ocultas.length > 0 && (
        <>
          <Separator className="my-1" />
          <p className="px-2 pt-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">Colunas ocultas</p>
          {ocultas.map((c) => {
            const { Icon } = TIPOS[c.type]
            return (
              <div key={c.id} className="flex items-center gap-2 rounded-sm px-2 py-1 hover:bg-muted">
                <Icon aria-hidden className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate">{c.name}</span>
                <Button variant="ghost" size="icon-xs" aria-label={`Mostrar ${c.name}`} onClick={() => api.ocultar(c.id, false)}>
                  <EyeIcon />
                </Button>
              </div>
            )
          })}
        </>
      )}
    </>
  )
}

/* ---------------- rodapé: agregação ---------------- */

export function RodapeDaColuna({ col, linhas, api }: { col: Coluna; linhas: Linha[]; api: ApiDasColunas }) {
  const agg = col.agg ?? "none"
  const vazio = agg === "none"
  const def = AGREGACOES[agg]
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={vazio ? `Calcular ${col.name}` : undefined}
          className="group/agg flex h-8 w-full items-center justify-end gap-1 px-4 text-xs whitespace-nowrap text-muted-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset"
        >
          {vazio ? (
            <span className="text-muted-foreground/60 opacity-0 group-hover/agg:opacity-100 group-focus-visible/agg:opacity-100">Calcular</span>
          ) : (
            <>
              <span className="opacity-70">{def.label}</span>
              <span className="font-semibold text-foreground tabular-nums">{def.fn(linhas, col)}</span>
            </>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuRadioGroup value={agg} onValueChange={(v) => api.agregar(col.id, v as Agregacao)}>
          {agregacoesPara(col).map((k) => (
            <DropdownMenuRadioItem key={k} value={k}>
              {AGREGACOES[k].label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/* ---------------- menu da linha ---------------- */

export function MenuDaLinha({ aoAbrir, aoCopiarLink, aoDuplicar, aoExcluir }: { aoAbrir: () => void; aoCopiarLink: () => void; aoDuplicar: () => void; aoExcluir: () => void }) {
  return (
    <>
      <DropdownMenuGroup>
        <DropdownMenuItem onSelect={aoAbrir}>
          <SquareArrowOutUpRightIcon />
          Abrir
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={aoCopiarLink}>
          <LinkIcon />
          Copiar link
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={aoDuplicar}>
          <CopyIcon />
          Duplicar
          <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem variant="destructive" onSelect={aoExcluir}>
          <Trash2Icon />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuGroup>
    </>
  )
}

