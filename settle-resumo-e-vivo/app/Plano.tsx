// Resumo sem agrupamento: cada informação é um card selecionável. Com cards
// selecionados, a barra de lote agrupa, desagrupa ou remove do grupo. Grupos têm nome
// editável, recolher e menu (Desagrupar, Excluir grupo).

import { useEffect, useRef, useState } from "react"
import { ChevronUpIcon, EllipsisVerticalIcon } from "lucide-react"

import {
  ActionBar,
  ActionBarButton,
  ActionBarClose,
  ActionBarGroup,
  ActionBarLabel,
  ActionBarSeparator,
} from "@/components/ui/action-bar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

import { Linha } from "./Linha"
import { acaoDoLote, type ItemPlano, type Painel } from "./painel"

type Grupo = Extract<ItemPlano, { tipo: "grupo" }>

function GrupoPlano({ painel, grupo }: { painel: Painel; grupo: Grupo }) {
  const { selecionados, grupoNovo } = painel.estado.plano
  const marcados = grupo.cards.filter((c) => selecionados.includes(c)).length
  const todos = grupo.cards.length > 0 && marcados === grupo.cards.length
  const [editandoNome, setEditandoNome] = useState(false)
  const nomeAnterior = useRef("")
  const campo = useRef<HTMLInputElement>(null)

  // grupo recém-criado: o foco vai para o nome
  useEffect(() => {
    if (grupoNovo !== grupo.id) return
    campo.current?.focus()
    painel.grupoFocado()
  }, [grupoNovo, grupo.id, painel])

  return (
    <section
      aria-label={grupo.nome || "Grupo sem nome"}
      className={cn("group/grupo relative flex-none rounded-xl border bg-card", todos && "border-primary")}
    >
      <header
        onClick={(e) => {
          if ((e.target as Element).closest("button, input, textarea, select, a, [role=checkbox]")) return
          painel.alternarGrupo(grupo.id)
        }}
        className={cn(
          "grid min-h-14.5 cursor-pointer items-center gap-2 border-b border-transparent px-4 py-3",
          editandoNome ? "grid-cols-[minmax(0,1fr)_auto_auto]" : "grid-cols-[18px_minmax(0,1fr)_auto_auto]",
          todos && "border-primary"
        )}
      >
        {!editandoNome && (
          <Checkbox
            checked={todos ? true : marcados > 0 ? "indeterminate" : false}
            onCheckedChange={(v) => painel.alternarGrupo(grupo.id, v === true)}
            aria-label="Selecionar grupo"
            className="bg-background opacity-0 transition-opacity group-hover/grupo:opacity-100 focus-visible:opacity-100 data-checked:opacity-100 data-[state=indeterminate]:opacity-100"
          />
        )}
        <input
          ref={campo}
          data-nome-do-grupo=""
          type="text"
          value={grupo.nome}
          onChange={(e) => painel.renomearGrupo(grupo.id, e.target.value)}
          onFocus={() => {
            nomeAnterior.current = grupo.nome
            setEditandoNome(true)
          }}
          onBlur={() => setEditandoNome(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              e.currentTarget.blur()
            }
            if (e.key === "Escape") {
              e.preventDefault()
              painel.renomearGrupo(grupo.id, nomeAnterior.current)
              e.currentTarget.blur()
            }
          }}
          placeholder="Escolha um nome para esse grupo"
          aria-label="Nome do grupo"
          aria-keyshortcuts="Enter Escape"
          enterKeyHint="done"
          className="min-w-0 rounded-sm bg-transparent text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
        />
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={grupo.recolhido ? "Expandir grupo" : "Recolher grupo"}
          onClick={() => painel.alternarRecolhido(grupo.id)}
        >
          <ChevronUpIcon aria-hidden className={cn("transition-transform", grupo.recolhido && "rotate-180")} />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Mais ações do grupo">
              <EllipsisVerticalIcon aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-45">
            <DropdownMenuGroup>
              <DropdownMenuItem onSelect={() => painel.desagrupar(grupo.id)}>Desagrupar</DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onSelect={() => painel.excluirGrupo(grupo.id)}>
                Excluir grupo
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      {!grupo.recolhido && (
        <div>
          {grupo.cards.map((id) => {
            const marcado = selecionados.includes(id)
            return (
              <Linha
                key={id}
                painel={painel}
                id={id}
                como="dl"
                selecao={{ marcada: marcado, alternar: (m) => painel.alternarCard(id, m) }}
                className={cn(
                  "min-h-15 cursor-pointer border-t last:rounded-b-xl",
                  todos && "border-primary",
                  marcado && !todos && "z-1 outline outline-primary -outline-offset-1"
                )}
              />
            )
          })}
        </div>
      )}
    </section>
  )
}

export function ListaPlana({ painel }: { painel: Painel }) {
  const { itens, selecionados } = painel.estado.plano
  return (
    <div role="list" aria-label="Informações do resumo" className="grid flex-none gap-2">
      {itens.map((item) =>
        item.tipo === "grupo" ? (
          <div role="listitem" key={item.id}>
            <GrupoPlano painel={painel} grupo={item} />
          </div>
        ) : (
          <div role="listitem" key={item.id}>
            <Linha
              painel={painel}
              id={item.id}
              como="dl"
              selecao={{
                marcada: selecionados.includes(item.id),
                alternar: (m) => painel.alternarCard(item.id, m),
              }}
              className={cn(
                "min-h-15.5 cursor-pointer rounded-xl border bg-card",
                selecionados.includes(item.id) && "border-primary bg-card hover:bg-card"
              )}
            />
          </div>
        )
      )}
    </div>
  )
}

export function BarraDeLote({ painel }: { painel: Painel }) {
  const { plano } = painel.estado
  const total = plano.selecionados.length
  const acao = acaoDoLote(plano)
  return (
    <ActionBar
      open={total > 0}
      aria-label="Ações em lote"
      className="absolute right-19.5 bottom-4 left-auto translate-x-0"
    >
      <ActionBarLabel>
        {total} {total === 1 ? "item selecionado" : "itens selecionados"}
      </ActionBarLabel>
      <ActionBarSeparator />
      <ActionBarGroup>
        <ActionBarButton onClick={painel.executarLote}>
          {acao === "agrupar" ? "Agrupar" : acao === "desagrupar" ? "Desagrupar" : "Remover do grupo"}
        </ActionBarButton>
      </ActionBarGroup>
      <ActionBarSeparator />
      <ActionBarClose onClick={painel.limparSelecao} />
    </ActionBar>
  )
}
