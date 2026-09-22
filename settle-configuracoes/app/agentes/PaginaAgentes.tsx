// Agentes, com a fila de Aprovações como seção da mesma página: a fila existe por causa
// da aprovação configurada em cada agente, e no teste ninguém ligou uma coisa à outra
// com as duas separadas. Aprovações também abre para quem não é administrador: quem
// aprova nem sempre é quem configura.

import { useEffect, useState, type MouseEvent } from "react"
import { ArrowRightIcon, CheckIcon, PlayIcon, Trash2Icon, XIcon } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { ActionBar, ActionBarButton, ActionBarClose, ActionBarGroup, ActionBarLabel, ActionBarSeparator } from "@/components/ui/action-bar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { SettingsPage, SettingsPageDescription } from "@/components/ui/settings-page"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

import { Aviso } from "../comum"
import { useConfig } from "../estado"
import { ComoFunciona, InfoDaColuna, TagGatilho } from "./comum"
import { APROVACAO, type Aprovacao } from "./dados"
import { useAgentes } from "./estado"
import { rascunhoNovo } from "./Janela"
import { dicaQuebra, ehAtivo, quandoTxt, resumoDoAgente, textoLegivel, varsQuebradas } from "./regras"

type Aba = "agentes" | "aprovacoes"

const CONTADOR = "rounded-md bg-foreground/10 px-1.5 text-xs leading-4 font-medium text-foreground tabular-nums"

function lerAba(): Aba {
  const q = new URLSearchParams(window.location.hash.split("?")[1] ?? "")
  return q.get("aba") === "aprovacoes" ? "aprovacoes" : "agentes"
}

export function PaginaAgentes() {
  const { isAdmin } = useConfig()
  const { cfg, aprovacoes, abrirModal } = useAgentes()
  const [aba, setAba] = useState<Aba>(lerAba)

  // o link "Aprovações" dentro da janela troca a aba pelo endereço
  useEffect(() => {
    const aoMudar = () => setAba(lerAba())
    window.addEventListener("hashchange", aoMudar)
    return () => window.removeEventListener("hashchange", aoMudar)
  }, [])

  const trocar = (a: Aba) => {
    setAba(a)
    window.history.replaceState(null, "", a === "aprovacoes" ? "#agentes?aba=aprovacoes" : "#agentes")
  }

  if (!isAdmin) {
    return (
      <SettingsPage width="wide">
        <SettingsPageDescription>A configuração dos agentes é feita por administradores.</SettingsPageDescription>
        <FilaDeAprovacoes />
      </SettingsPage>
    )
  }

  return (
    <SettingsPage width="wide">
      <ComoFunciona
        aoCriarVariavel={() => (window.location.hash = "variaveis?nova=1")}
        aoCriarAgente={() => abrirModal({ tipo: "novo", rascunho: rascunhoNovo("texto", false) })}
      />
      <Tabs value={aba} onValueChange={(v) => trocar(v as Aba)} className="gap-0">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <TabsList aria-label="Seções de Agentes">
            <TabsTrigger value="agentes" className="px-3">
              Agentes <span className={CONTADOR}>{cfg.agentes.length}</span>
            </TabsTrigger>
            <TabsTrigger value="aprovacoes" className="px-3">
              Aprovações
              <span className={cn(CONTADOR, aprovacoes.length > 0 && "bg-warning/15 text-warning-strong")}>{aprovacoes.length}</span>
            </TabsTrigger>
          </TabsList>
          {aba === "agentes" && <Button onClick={() => abrirModal({ tipo: "modelos" })}>Adicionar agente</Button>}
        </div>
        <TabsContent value="agentes">
          <Aviso tom="marca">
            <b>Agentes</b> são tarefas que a Settle faz sozinha em cada licitação, como uma pessoa do time. Eles usam as
            variáveis (os dados do edital) para decidir e mostram o resultado dentro da licitação.
          </Aviso>
          <ListaDeAgentes />
        </TabsContent>
        <TabsContent value="aprovacoes">
          <FilaDeAprovacoes />
        </TabsContent>
      </Tabs>
    </SettingsPage>
  )
}

/* ------------------------------------------------------------------ */
/* Lista de agentes                                                    */
/* ------------------------------------------------------------------ */

function ListaDeAgentes() {
  const { cfg, abrirModal, executarEmTodas, alterarAgente, excluirAgentes } = useAgentes()
  const [sel, setSel] = useState<string[]>([])
  const selecionados = sel.filter((id) => cfg.agentes.some((a) => a.id === id))

  if (!cfg.agentes.length) {
    return (
      <div className="rounded-lg border border-dashed px-6 py-10 text-center">
        <p className="text-sm font-semibold">Nenhum agente ainda</p>
        <p className="mt-1 text-[13px] text-muted-foreground">Crie o primeiro para a Settle trabalhar nas suas licitações.</p>
        <Button className="mt-3.5" onClick={() => abrirModal({ tipo: "modelos" })}>
          Adicionar agente
        </Button>
      </div>
    )
  }

  return (
    <>
      <ul className="flex flex-col gap-2.5">
        {cfg.agentes.map((an) => {
          const ativo = ehAtivo(an)
          const quebradas = varsQuebradas(an, cfg)
          /* No teste, o agente com variável excluída continuava com cara de ativo. Agora
             ele aparece parado, e o Executar some até alguém revisar. */
          const parado = ativo && quebradas.length > 0
          const marcado = selecionados.includes(an.id)
          const instr = textoLegivel(an.texto, cfg.vars, cfg.varsEx).split("\n").join(" ")
          const abrir = (e: MouseEvent) => {
            if ((e.target as Element).closest("button, a, [role=checkbox], [role=switch], [tabindex]")) return
            abrirModal({ tipo: "agente", id: an.id })
          }
          return (
            <li
              key={an.id}
              className={cn(
                "group/agente flex items-start gap-3.5 rounded-lg border bg-card px-4 py-3.5 transition-colors hover:border-foreground/20",
                (!ativo || parado) && "bg-muted",
                parado && "border-destructive/40",
                marcado && "border-primary hover:border-primary"
              )}
            >
              <Checkbox
                aria-label={`Selecionar ${an.nome}`}
                checked={marcado}
                onCheckedChange={(v) => setSel((s) => (v === true ? [...s, an.id] : s.filter((x) => x !== an.id)))}
                className={cn(
                  "mt-0.5 opacity-0 transition-opacity group-hover/agente:opacity-100 focus-visible:opacity-100",
                  marcado && "opacity-100"
                )}
              />
              <div className="flex min-w-0 flex-1 cursor-pointer flex-col items-start gap-1.5" onClick={abrir}>
                <span className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => abrirModal({ tipo: "agente", id: an.id })}
                    className={cn(
                      "rounded-sm text-left text-[15px] leading-[21px] font-semibold outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50",
                      (!ativo || parado) && "text-muted-foreground"
                    )}
                  >
                    {an.nome}
                  </button>
                  {parado && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="destructive" tabIndex={0} className="cursor-help rounded-full">
                          Parado: precisa de atenção
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-70">{dicaQuebra(quebradas, cfg.varsEx)}</TooltipContent>
                    </Tooltip>
                  )}
                  {!ativo && (
                    <Badge variant="secondary" className="rounded-full">
                      Desligado
                    </Badge>
                  )}
                </span>
                <p className="line-clamp-2 text-[13px] leading-[19px] text-muted-foreground">
                  {instr.length > 160 ? `${instr.slice(0, 158)}…` : instr}
                </p>
                {/* Quando, com o quê e onde: a frase que ninguém conseguiu montar no teste. */}
                {/* O selo colorido do momento, como no handoff, seguido do resto da frase. */}
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[12.5px] leading-[18px] text-muted-foreground">
                  <TagGatilho agente={an} />
                  <span>
                    {[
                      ...(an.repete === "sempre" ? ["também quando o edital mudar"] : []),
                      ...resumoDoAgente(an, cfg).slice(1),
                    ].join(" · ")}
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2.5">
                {ativo && !parado && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon-sm" className="shadow-none" aria-label={`Executar ${an.nome} agora em todas as licitações`} onClick={() => executarEmTodas(an.id)}>
                        <PlayIcon />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-70">
                      Executar agora: roda este agente em todas as licitações, sem esperar o momento dele
                    </TooltipContent>
                  </Tooltip>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex items-center">
                      <Switch
                        checked={ativo}
                        aria-label={`${an.nome} ligado`}
                        onCheckedChange={(v) => {
                          alterarAgente(an.id, { ativo: v })
                          toast(v ? `${an.nome} ligado` : `${an.nome} desligado. O que ele já produziu continua nas licitações.`)
                        }}
                      />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-70">
                    {ativo
                      ? `Ligado: trabalha sozinho ${quandoTxt(an).charAt(0).toLowerCase() + quandoTxt(an).slice(1)}. Desligue para ele parar nas próximas licitações; o que já produziu continua.`
                      : "Desligado: não trabalha em nenhuma licitação. Ligue para ele voltar a trabalhar no momento configurado."}
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon-sm" className="border-destructive/40 text-destructive shadow-none hover:bg-destructive/8 hover:text-destructive" aria-label={`Excluir ${an.nome}`} onClick={() => excluirAgentes([an.id])}>
                      <Trash2Icon />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Excluir agente</TooltipContent>
                </Tooltip>
              </div>
            </li>
          )
        })}
      </ul>
      <ActionBar open={selecionados.length > 0}>
        <ActionBarLabel>
          {selecionados.length} {selecionados.length === 1 ? "agente selecionado" : "agentes selecionados"}
        </ActionBarLabel>
        <ActionBarSeparator />
        <ActionBarGroup>
          <ActionBarButton onClick={() => excluirAgentes(selecionados, () => setSel([]))}>
            <Trash2Icon />
            Excluir selecionados
          </ActionBarButton>
        </ActionBarGroup>
        <ActionBarSeparator />
        <ActionBarClose label="Limpar seleção" onClick={() => setSel([])} />
      </ActionBar>
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Aprovações                                                          */
/* ------------------------------------------------------------------ */

function FilaDeAprovacoes() {
  const { isAdmin } = useConfig()
  const { cfg, aprovacoes, responderAprovacoes, abrirModal } = useAgentes()
  const [sel, setSel] = useState<string[]>([])
  const selecionadas = sel.filter((id) => aprovacoes.some((a) => a.id === id))

  const responder = (ids: string[], aprovou: boolean) => {
    const antes = selecionadas
    responderAprovacoes(ids, aprovou, () => setSel((s) => s.filter((x) => !ids.includes(x))), () => setSel(antes))
  }

  const colunas: DataTableColumn<Aprovacao>[] = [
    {
      id: "lic",
      header: "Licitação", headerAddon: <InfoDaColuna focavel texto="A licitação em que o agente quer fazer a ação." />,
      width: 186,
      wrap: true,
      cell: (a) => (
        <span className="flex flex-col">
          <b className="text-[13px] font-semibold">{a.lic}</b>
          <span className="text-xs text-muted-foreground">{a.org}</span>
        </span>
      ),
    },
    {
      id: "acao",
      header: "O que o agente quer fazer", headerAddon: <InfoDaColuna focavel texto="A ação que espera resposta. Nada acontece na licitação antes disso." />,
      width: 190,
      wrap: true,
      cell: (a) =>
        a.de && a.para ? (
          <span className="flex flex-wrap items-center gap-1.5 text-[13px]">
            Mover de
            <Badge variant="secondary" className="font-normal">{a.de}</Badge>
            <ArrowRightIcon aria-label="para" className="size-3.5 text-muted-foreground" />
            <Badge variant="secondary" className="font-normal">{a.para}</Badge>
          </span>
        ) : (
          <span className="text-[13px]">{a.acao}</span>
        ),
    },
    {
      id: "por",
      header: "Por quê", headerAddon: <InfoDaColuna focavel texto="O motivo que o agente deu, a partir do que encontrou no edital." />,
      width: 184,
      wrap: true,
      cell: (a) => <span className="text-[13px] text-muted-foreground">{a.por}</span>,
    },
    {
      id: "agente",
      header: "Pedido por", headerAddon: <InfoDaColuna focavel texto="O agente que pediu e a aprovação configurada nele. Para ele parar de pedir, mude a aprovação no agente." />,
      width: 160,
      wrap: true,
      cell: (a) => {
        const an = cfg.agentes.find((x) => x.id === a.agente)
        if (!an) return <span className="text-[13px] text-muted-foreground">Agente excluído</span>
        return (
          <span className="flex flex-col items-start">
            {isAdmin ? (
              <button
                type="button"
                className="rounded-sm text-left text-[13px] font-semibold outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                onClick={() => abrirModal({ tipo: "agente", id: an.id })}
              >
                {an.nome}
              </button>
            ) : (
              <span className="text-[13px] font-semibold">{an.nome}</span>
            )}
            <span className="text-xs text-muted-foreground">{APROVACAO[an.aprovacao ?? "manual"].t}</span>
          </span>
        )
      },
    },
    { id: "quando", header: "Pedido em", headerAddon: <InfoDaColuna focavel texto="Quando o pedido chegou." />, width: 96, cell: (a) => <span className="text-[13px] text-muted-foreground">{a.quando}</span> },
    {
      id: "responder",
      header: "Responder", headerAddon: <InfoDaColuna focavel texto="Aprovar faz a ação na hora. Recusar descarta o pedido, e a licitação continua como está." />,
      width: 160,
      cell: (a) => (
        <span className="flex items-center gap-1.5">
          <Button variant="outline" size="xs" className="shadow-none" onClick={() => responder([a.id], false)}>
            Recusar
          </Button>
          <Button size="xs" onClick={() => responder([a.id], true)}>
            Aprovar
          </Button>
        </span>
      ),
    },
  ]

  return (
    <div className="flex flex-col">
      <Aviso tom="marca">
        <b>Aprovações</b> são as ações que os agentes querem fazer nas licitações, como mover de etapa ou marcar um
        responsável, e que esperam alguém aprovar. Nada muda na licitação até alguém responder.
      </Aviso>
      <DataTable
        columns={colunas}
        rows={aprovacoes}
        getRowId={(a) => a.id}
        getRowLabel={(a) => a.lic}
        selectedIds={selecionadas}
        onSelectedIdsChange={setSel}
        labels={{
          selectAll: "Selecionar todas",
          selected: (n) => `${n} ${n === 1 ? "pedido selecionado" : "pedidos selecionados"}`,
          empty: "Nada esperando por você. As ações que os agentes fazem sozinhos ficam no histórico de cada agente.",
        }}
        bulkActions={
          <>
            <ActionBarButton onClick={() => responder(selecionadas, false)}>
              <XIcon />
              Recusar
            </ActionBarButton>
            <ActionBarButton onClick={() => responder(selecionadas, true)}>
              <CheckIcon />
              Aprovar
            </ActionBarButton>
          </>
        }
      />
    </div>
  )
}
