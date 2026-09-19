// Agentes e Variáveis: o painel de controle. Três abas: os agentes (um por
// funcionalidade ou pergunta), as variáveis (o que a Settle extrai do edital e os
// agentes reaproveitam) e a fila de aprovações.

import { useState, type MouseEvent } from "react"
import { PlayIcon, Trash2Icon } from "lucide-react"

import { cn } from "@/lib/utils"
import { ActionBar, ActionBarButton, ActionBarClose, ActionBarGroup, ActionBarLabel, ActionBarSeparator } from "@/components/ui/action-bar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "sonner"

import { TagGatilho } from "./comum"
import { MOSTRAR_CUSTO, type Agente } from "./dados"
import { useSim, type Aba } from "./estado"
import { Aprovacoes } from "./Aprovacoes"
import { dicaQuebra, ehAtivo, moeda, regrasDa, textoLegivel, varsDoTexto, varsQuebradas, type Config } from "./regras"
import { Variaveis } from "./Variaveis"

const TITULO: Record<Aba, string> = { agentes: "Agentes", variaveis: "Variáveis", aprovacoes: "Aprovações" }

function Contador({ n }: { n: number }) {
  return <span className="text-xs font-semibold text-muted-foreground tabular-nums">{n}</span>
}

export function AreaAgentes() {
  const { cfg, aprovacoes, aba, abaAtiva, abrirModal } = useSim()
  return (
    <>
      <h1 className="mb-5.5 text-5xl leading-[1.04] font-bold tracking-tight">{TITULO[aba]}</h1>
      <Tabs value={aba} onValueChange={(v) => abaAtiva(v as Aba)} className="gap-0">
        <div className="mb-4.5 flex flex-wrap items-center justify-between gap-4">
          <TabsList aria-label="Seções">
            <TabsTrigger value="agentes" className="px-3">
              Agentes <Contador n={cfg.agentes.length} />
            </TabsTrigger>
            <TabsTrigger value="variaveis" className="px-3">
              Variáveis <Contador n={Object.keys(cfg.vars).length} />
            </TabsTrigger>
            <TabsTrigger value="aprovacoes" className="px-3">
              Aprovações <Contador n={aprovacoes.length} />
            </TabsTrigger>
          </TabsList>
          {/* cada aba tem a própria ação de criar, alinhada com ela */}
          {aba === "agentes" && <Button onClick={() => abrirModal({ tipo: "modelos" })}>Adicionar agente</Button>}
          {aba === "variaveis" && <Button onClick={() => abrirModal({ tipo: "variavel", k: null })}>Adicionar variável</Button>}
        </div>
        <TabsContent value="agentes">
          <ListaDeAgentes />
        </TabsContent>
        <TabsContent value="variaveis">
          <Variaveis />
        </TabsContent>
        <TabsContent value="aprovacoes">
          <Aprovacoes />
        </TabsContent>
      </Tabs>
    </>
  )
}

/* O custo de um agente, quando o custo voltar para a interface. */
function custoDe(an: Agente, cfg: Config) {
  if (an.formato === "estruturado") return regrasDa(an, cfg.regras).reduce((t, r) => t + r.custo, 0)
  // um agente por componente roda 15 vezes nesta licitação
  if (an.formato === "composicao") return 0.03 * 15
  return varsDoTexto(an.texto).reduce((t, k) => t + (cfg.vars[k]?.custo ?? 0), 0)
}

/* Seleção em lote: como nas variáveis, a única ação que faz sentido em vários ao mesmo tempo é excluir. */
function ListaDeAgentes() {
  const { cfg, abrirModal, executarEmTodas, alterarAgente, excluirAgente, excluirAgentes } = useSim()
  const [sel, setSel] = useState<string[]>([])
  const selecionados = sel.filter((id) => cfg.agentes.some((a) => a.id === id))

  return (
    <>
      <ul className="flex flex-col gap-2.5">
        {cfg.agentes.map((an) => {
          const ativo = ehAtivo(an)
          const quebradas = varsQuebradas(an, cfg)
          const marcado = selecionados.includes(an.id)
          /* A instrução pode ser longa: no card ela vale por duas linhas. */
          const instr = textoLegivel(an.texto, cfg.vars).split("\n").join(" ")
          const abrir = (e: MouseEvent) => {
            if ((e.target as Element).closest("button, a, [role=checkbox], [role=switch], [tabindex]")) return
            abrirModal({ tipo: "agente", id: an.id })
          }
          return (
            <li
              key={an.id}
              className={cn(
                "group/agente flex items-start gap-3.5 rounded-lg border bg-card px-4 py-3.5 transition-colors hover:border-foreground/20",
                !ativo && "bg-muted",
                quebradas.length > 0 && "border-warning/45",
                marcado && "border-primary hover:border-primary"
              )}
            >
              {/* some até o mouse chegar, para a lista respirar */}
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
                <button
                  type="button"
                  onClick={() => abrirModal({ tipo: "agente", id: an.id })}
                  className="rounded-sm text-left text-[15px] leading-[21px] font-semibold outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {an.nome}
                </button>
                <p className="line-clamp-2 text-[13px] leading-[19px] text-muted-foreground">
                  {instr.length > 160 ? `${instr.slice(0, 158)}…` : instr}
                </p>
                <div className="mt-0.5 flex flex-wrap items-center gap-2">
                  {quebradas.length > 0 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="warning" tabIndex={0} className="cursor-help rounded-full">
                          Precisa de atenção
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-70">{dicaQuebra(quebradas, cfg.varsEx)}</TooltipContent>
                    </Tooltip>
                  )}
                  <TagGatilho agente={an} />
                  {MOSTRAR_CUSTO && <span className="text-[11px] text-muted-foreground tabular-nums">{moeda(custoDe(an, cfg))}</span>}
                </div>
              </div>
              {/* Executar, ativar e excluir lado a lado: espaço suficiente para não errar o alvo. */}
              <div className="flex shrink-0 items-center gap-2.5">
                {/* Qualquer agente ativo pode ser forçado a rodar, além do próprio momento
                    dele, como o "Executar agora" das tarefas agendadas do Claude. */}
                {ativo && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        className="shadow-none"
                        aria-label={`Executar ${an.nome} agora`}
                        onClick={() => executarEmTodas(an.id)}
                      >
                        <PlayIcon />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Executar agora</TooltipContent>
                  </Tooltip>
                )}
                <Switch
                  checked={ativo}
                  aria-label={`Ativar ${an.nome}`}
                  onCheckedChange={(v) => {
                    alterarAgente(an.id, { ativo: v })
                    toast(v ? `${an.nome} ativado` : `${an.nome} pausado`)
                  }}
                />
                <Button
                  variant="outline"
                  size="icon-sm"
                  className="shadow-none"
                  aria-label={`Excluir ${an.nome}`}
                  onClick={() => excluirAgente(an.id)}
                >
                  <Trash2Icon />
                </Button>
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
