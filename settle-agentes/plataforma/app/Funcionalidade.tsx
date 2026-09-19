// As funcionalidades da licitação (Score, Checklist, Análise técnica, Habilitação):
// o botão que diz o estado de cada uma, o menu de cenários do simulador, o bloco que
// ocupa o lugar do resultado quando ainda não há resultado, e o resultado em si
// (AI Widget). A funcionalidade existe mesmo sem agente; o agente produz o resultado.

import { useState, type ComponentProps, type ReactNode } from "react"
import { BotIcon, CheckIcon, ChevronDownIcon, GaugeIcon, ListIcon, WrenchIcon } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import {
  AiWidget,
  AiWidgetActions,
  AiWidgetContent,
  AiWidgetHandle,
  AiWidgetHeader,
  AiWidgetNote,
  AiWidgetTitle,
} from "@/components/ui/ai-widget"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"
import { Spinner } from "@/components/ui/spinner"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

import { IconeDeStatus, naoSimulado, SeloDeStatus } from "./comum"
import {
  CENARIOS,
  CHECKLIST,
  DICA_ESTADO,
  FUNCS,
  MOMENTO_TXT,
  RESULTADOS,
  SCORE_VARS,
  type ChaveFn,
  type EstadoFn,
  type Licitacao,
} from "./dados"
import { momentoDaFn, useSim } from "./estado"
import { classificar, tomDoScore } from "./regras"

/* ------------------------------------------------------------------ */
/* Botões do Score e do Checklist                                      */
/* ------------------------------------------------------------------ */

/* Esperando, a dica sai do momento configurado no agente: um texto fixo diria que o
   Score chega depois do envio quando ele roda em Recomendadas. */
export function dicaEstado(k: ChaveFn, st: EstadoFn, lic: Licitacao) {
  if (st !== "aguardando") return DICA_ESTADO[st] ?? ""
  return `O resultado aparece ${MOMENTO_TXT[momentoDaFn(lic, k)]}`
}

/* Sem resultado, o botão fica em âmbar e tracejado: o lugar existe, a resposta ainda
   não, e isso precisa ser notado de longe. O tracejado segura a diferença para quem
   não distingue a cor. Preparando não é falta: fica neutro. Com resultado, a cor é a
   da classificação, como em produção. */
const CLASSE_VAZIO = "border-dashed border-warning/40 bg-warning/8 text-warning-strong hover:bg-warning/14 hover:text-warning-strong"
const CLASSE_PREP = "border-border bg-card text-muted-foreground hover:bg-muted"
const CLASSE_TOM = {
  quente: "border-success/30 bg-success/10 text-success-strong hover:bg-success/16 hover:text-success-strong",
  morno: "border-warning/35 bg-warning/12 text-warning-strong hover:bg-warning/18 hover:text-warning-strong",
  frio: "border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/16 hover:text-destructive",
}

function corpoScore(lic: Licitacao, st: EstadoFn) {
  if (st === "preparando") return <><Spinner data-icon="inline-start" aria-hidden />Calculando o Score</>
  const texto =
    st === "pronto" ? `${lic.score}/100`
      : st === "aguardando" ? "Score não calculado"
        : st === "desativado" ? "Score desativado"
          : st === "falhou" ? "Score não carregou"
            : "Score sem agente"
  return <><GaugeIcon data-icon="inline-start" />{texto}</>
}

/* Quatro estados sem resultado com o mesmo rótulo ficam indistinguíveis: o texto diz qual é. */
function corpoChecklist(st: EstadoFn) {
  if (st === "preparando") return <><Spinner data-icon="inline-start" aria-hidden />Preparando o Checklist</>
  const texto =
    st === "aguardando" ? "Checklist não gerado"
      : st === "sem-agente" ? "Checklist sem agente"
        : st === "desativado" ? "Checklist desativado"
          : st === "falhou" ? "Checklist não carregou"
            : "Checklist"
  return <><ListIcon data-icon="inline-start" className={cn(st === "pronto" && "text-muted-foreground")} />{texto}</>
}

/**
 * O botão é o mesmo na lista e no cabeçalho da licitação. No card do simulador ele
 * abre o menu de cenários; nos outros, abre o resultado, como na plataforma.
 */
export function BotaoDaFuncionalidade({ k, i }: { k: "score" | "checklist"; i: number }) {
  const { lics, setAberta, abrirFuncionalidade } = useSim()
  const [menu, setMenu] = useState(false)
  const lic = lics[i]
  const st = lic.fx[k]
  if (k === "checklist" && st === "indisponivel") return null

  const pronto = st === "pronto"
  const dica =
    k === "score"
      ? pronto ? `Score ${classificar(lic.score)}` : dicaEstado(k, st, lic)
      : pronto ? "Abrir checklist da licitação" : dicaEstado(k, st, lic)

  return (
    <MenuDeCenario k={k} i={i} aberto={menu} onAbertoChange={setMenu}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverAnchor asChild>
            <Button
              variant="outline"
              data-funcionalidade={k}
              aria-label={k === "score" && pronto ? `Score: ${lic.score}/100, ${classificar(lic.score)}` : undefined}
              onClick={(e) => {
                /* o card inteiro abre a licitação: o botão é dele mesmo */
                e.stopPropagation()
                setAberta(i)
                if (lic.simulador) setMenu(true)
                else abrirFuncionalidade(k)
              }}
              className={cn(
                "h-8.5 px-3 text-[13px] shadow-none",
                k === "score" && "font-semibold",
                st === "preparando" ? CLASSE_PREP : !pronto ? CLASSE_VAZIO : k === "score" && CLASSE_TOM[tomDoScore(lic.score)]
              )}
            >
              {k === "score" ? corpoScore(lic, st) : corpoChecklist(st)}
            </Button>
          </PopoverAnchor>
        </TooltipTrigger>
        <TooltipContent>{dica}</TooltipContent>
      </Tooltip>
    </MenuDeCenario>
  )
}

/* ------------------------------------------------------------------ */
/* Menu de cenários (só no card do simulador)                          */
/* ------------------------------------------------------------------ */

/**
 * O menu é ferramenta de um card só: mostra cada estado da funcionalidade sem ter que
 * esperar o evento que o produz. Os filhos precisam trazer um PopoverAnchor.
 */
export function MenuDeCenario({
  k,
  i,
  aberto,
  onAbertoChange,
  children,
}: {
  k: ChaveFn
  i: number
  aberto: boolean
  onAbertoChange: (aberto: boolean) => void
  children: ReactNode
}) {
  const { lics, mudarEstadoFn, abrirFuncionalidade } = useSim()
  const lic = lics[i]
  const f = FUNCS[k]
  const momento = momentoDaFn(lic, k)
  /* Esperar um evento que já passou não é estado possível: quem roda na captura ou na
     chegada em Recomendadas não pode estar aguardando o momento. */
  const jaPassou = momento === "recomendadas" || momento === "captura"
  const cenarios = CENARIOS.filter((c) => !(jaPassou && c.id === "aguardando"))

  return (
    <Popover open={aberto} onOpenChange={onAbertoChange}>
      {children}
      <PopoverContent align="end" className="w-72 gap-0 p-1" aria-label={`${f.nome}: qual cenário?`}>
        <p className="px-2 pt-1.5 pb-1 text-xs font-semibold text-muted-foreground">{f.nome}: qual cenário?</p>
        <ul className="flex flex-col">
          {cenarios.map((c) => {
            const atual = lic.fx[k] === c.id
            return (
              <li key={c.id}>
                <button
                  type="button"
                  aria-current={atual || undefined}
                  onClick={() => {
                    mudarEstadoFn(i, k, c.id)
                    onAbertoChange(false)
                    abrirFuncionalidade(k)
                  }}
                  className={cn(
                    "flex w-full flex-col rounded-md px-2 py-1.75 text-left text-[13px] outline-none hover:bg-muted focus-visible:bg-muted",
                    atual && "font-semibold text-primary"
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    {atual && <CheckIcon aria-hidden className="size-3.5" />}
                    {c.t}
                  </span>
                  <span className="text-[11.5px] leading-4 font-normal text-muted-foreground">{c.d}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </PopoverContent>
    </Popover>
  )
}

/* ------------------------------------------------------------------ */
/* O lugar do resultado                                                */
/* ------------------------------------------------------------------ */

/* Sem resultado, o padrão é o mesmo do "Não foi possível carregar" da plataforma:
   texto e ação centrados no vazio, sem caixa em volta. */
function Vazio({ children, acao }: { children: ReactNode; acao?: ReactNode }) {
  return (
    <div className="flex min-h-60 flex-col items-center justify-center gap-3 py-6 text-center">
      {children}
      {acao}
    </div>
  )
}

const TextoVazio = ({ children }: { children: ReactNode }) => (
  <p className="max-w-75 text-sm leading-5 text-muted-foreground">{children}</p>
)

/**
 * O estado de uma funcionalidade sem resultado. A ação de configurar existe em todos
 * os estados menos "preparando": ali ela não aparece, nem desabilitada, porque mexer
 * na configuração no meio de uma execução muda o que está sendo preparado.
 */
export function EstadoSemResultado({ k }: { k: ChaveFn }) {
  const { licFoco: lic, aberta, abaAtiva, abrirModal, mudarEstadoFn, tentarDeNovo } = useSim()
  const f = FUNCS[k]
  const st = lic.fx[k]
  if (st === "sem-agente") {
    return (
      <Vazio
        acao={
          <Button
            size="sm"
            onClick={() => {
              /* Configurar abre por cima de onde a pessoa está: a licitação deu o motivo do clique. */
              abaAtiva("agentes")
              abrirModal({ tipo: "modelos" })
            }}
          >
            Configurar Agente
          </Button>
        }
      >
        <TextoVazio>Esse recurso funciona através de um Agente. Configure um Agente para começar a ver as informações.</TextoVazio>
      </Vazio>
    )
  }
  if (st === "desativado") {
    return (
      <Vazio acao={<Button size="sm" onClick={() => mudarEstadoFn(aberta ?? 0, k, "pronto")}>Ativar agente</Button>}>
        <TextoVazio>Este agente está desativado. Ative para voltar a ver os resultados aqui.</TextoVazio>
      </Vazio>
    )
  }
  if (st === "aguardando") {
    return (
      <Vazio>
        <TextoVazio>
          {f.art} {f.nome} aparece aqui {MOMENTO_TXT[momentoDaFn(lic, k)]}.
        </TextoVazio>
      </Vazio>
    )
  }
  if (st === "preparando") {
    return (
      <Vazio>
        <Spinner className="text-primary" aria-hidden />
        <TextoVazio>Estamos preparando este resultado. Ele ficará disponível assim que for concluído.</TextoVazio>
      </Vazio>
    )
  }
  if (st === "falhou") {
    return (
      <Vazio acao={<Button size="sm" onClick={() => tentarDeNovo(k)}>Tentar novamente</Button>}>
        <TextoVazio>Não foi possível carregar</TextoVazio>
      </Vazio>
    )
  }
  return null
}

/* ------------------------------------------------------------------ */
/* AI Widget                                                           */
/* ------------------------------------------------------------------ */

/**
 * O resultado é o resultado: o card diz de qual agente veio e leva à conversa e à
 * configuração dele. Quando uma funcionalidade é respondida por mais de um agente,
 * cada resposta é um AI Widget próprio.
 */
function WidgetDoAgente({
  id,
  titulo,
  arrasto,
}: {
  id: string
  titulo: string
  arrasto?: {
    arrastando: boolean
    alvo: boolean
    props: Pick<ComponentProps<"div">, "draggable" | "onDragStart" | "onDragEnd" | "onDragOver" | "onDragLeave" | "onDrop">
  }
}) {
  const { cfg, licFoco, conversarCom, abrirModal } = useSim()
  const an = cfg.agentes.find((a) => a.id === id)
  const r = RESULTADOS[id]
  return (
    <AiWidget data-dragging={arrasto?.arrastando} data-drop-target={arrasto?.alvo} {...arrasto?.props}>
      <AiWidgetHeader>
        {/* a pessoa move o widget dentro da seção, e só dentro dela (Alice, 09/09, 15:26) */}
        {arrasto && <AiWidgetHandle />}
        <AiWidgetTitle>{an ? an.nome : titulo}</AiWidgetTitle>
        <AiWidgetActions>
          <Button
            size="xs"
            onClick={() =>
              an &&
              conversarCom(
                an.id,
                "Este é o resultado que produzi nesta licitação. Pode me dizer o que ficou errado, ou pedir para eu explicar como cheguei nele.",
                `PE ${licFoco.n}`
              )
            }
          >
            Falar com o agente
          </Button>
          <Button size="xs" onClick={() => an && abrirModal({ tipo: "agente", id: an.id })}>
            Configurar
          </Button>
        </AiWidgetActions>
      </AiWidgetHeader>
      <AiWidgetContent>
        {r ? (
          <>
            <ul className="flex flex-col">
              {r.itens.map((x) => (
                <li key={x.doc} className="flex items-start gap-2 border-b py-1.75 text-[13px] leading-[19px] last:border-b-0">
                  <IconeDeStatus st={x.st} className="mt-0.75" />
                  <span>
                    <b className="font-semibold">{x.doc}</b>
                    <br />
                    <span className="text-muted-foreground">{x.nosso}</span>
                  </span>
                </li>
              ))}
            </ul>
            <AiWidgetNote>{r.por}</AiWidgetNote>
          </>
        ) : (
          <p className="text-[13px] text-muted-foreground">Sem resultado nesta licitação.</p>
        )}
      </AiWidgetContent>
    </AiWidget>
  )
}

/* Uma seção pode ter mais de um agente (Alice, 09/09, 15:08). A ordem é de cada
   usuário: o protótipo simula o arrasto, mas não guarda a ordem. */
function WidgetsReordenaveis() {
  const { ordemWidgets, setOrdemWidgets } = useSim()
  const [origem, setOrigem] = useState<string | null>(null)
  const [alvo, setAlvo] = useState<string | null>(null)
  return (
    <div className="flex flex-col gap-4">
      {ordemWidgets.map((id) => (
        <WidgetDoAgente
          key={id}
          id={id}
          titulo={FUNCS.habil.nome}
          arrasto={{
            arrastando: origem === id,
            alvo: alvo === id,
            props: {
              draggable: true,
              onDragStart: (e) => {
                e.dataTransfer.effectAllowed = "move"
                try {
                  e.dataTransfer.setData("text/plain", id)
                } catch {
                  /* Safari */
                }
                setOrigem(id)
              },
              onDragEnd: () => {
                setOrigem(null)
                setAlvo(null)
              },
              onDragOver: (e) => {
                if (!origem || origem === id) return
                e.preventDefault()
                setAlvo(id)
              },
              onDragLeave: () => setAlvo((a) => (a === id ? null : a)),
              onDrop: (e) => {
                if (!origem || origem === id) return
                e.preventDefault()
                const ids = [...ordemWidgets]
                const de = ids.indexOf(origem)
                const para = ids.indexOf(id)
                ids.splice(para, 0, ids.splice(de, 1)[0])
                setOrdemWidgets(ids)
                setOrigem(null)
                setAlvo(null)
                toast("Ordem dos agentes salva nesta seção")
              },
            },
          }}
        />
      ))}
    </div>
  )
}

/* A Análise técnica é uma tela do sistema, não uma resposta de agente: o widget entra
   junto dela, e não no lugar dela. Os números em cima, um card por item embaixo. */
function AnaliseTecnicaDoSistema({ lic }: { lic: Licitacao }) {
  const atende = lic.tecnica.filter((x) => x.st === "ok").length
  const nao = lic.tecnica.filter((x) => x.st === "no").length
  const kpis: [number, string][] = [
    [lic.itens.length, "Itens com correspondência"],
    [lic.tecnica.length, "Itens com análise técnica"],
    [atende, atende === 1 ? "Item atendido" : "Itens atendidos"],
    [nao, nao === 1 ? "Item não atendido" : "Itens não atendidos"],
  ]
  return (
    <div className="mt-5">
      <dl className="mb-3 grid grid-cols-2 gap-2.5 min-[760px]:grid-cols-4">
        {kpis.map(([n, t]) => (
          <div key={t} className="flex flex-col-reverse rounded-lg border bg-card px-3.5 py-3">
            <dt className="mt-0.5 text-xs text-muted-foreground">{t}</dt>
            <dd className="text-xl leading-[26px] font-bold tabular-nums">{n}</dd>
          </div>
        ))}
      </dl>
      <ul className="flex flex-col gap-2">
        {lic.tecnica.map((x) => (
          <li key={x.nome}>
            <button
              type="button"
              onClick={() => naoSimulado("A comparação item a item")}
              className="block w-full rounded-lg border bg-card px-3.5 py-3 text-left outline-none hover:border-primary hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <SeloDeStatus st={x.st} />
              <p className="mt-2 text-[13.5px] font-semibold">{x.nome}</p>
              <p className="mt-0.5 text-[12.5px] leading-[18px] text-muted-foreground">{x.det}</p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** A aba de uma funcionalidade que mora em aba própria (Análise técnica, Habilitação). */
export function AbaDaFuncionalidade({ k }: { k: "tecnica" | "habil" }) {
  const { licFoco: lic, ordemWidgets } = useSim()
  if (lic.fx[k] !== "pronto") return <EstadoSemResultado k={k} />
  if (k === "habil") {
    return ordemWidgets.length > 1 ? <WidgetsReordenaveis /> : <WidgetDoAgente id={ordemWidgets[0]} titulo={FUNCS.habil.nome} />
  }
  return (
    <>
      <WidgetDoAgente id="tecnica" titulo={FUNCS.tecnica.nome} />
      <AnaliseTecnicaDoSistema lic={lic} />
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Painel lateral do Score e do Checklist                              */
/* ------------------------------------------------------------------ */

function ResultadoDoScore({ lic }: { lic: Licitacao }) {
  return (
    <>
      <div className="mb-3.5 rounded-lg border bg-card px-5 py-4.5 text-3xl font-bold tabular-nums">{lic.score}/100</div>
      <section className="mb-3.5 overflow-hidden rounded-lg border bg-card" aria-label="Variáveis para cálculo do Score">
        <h3 className="px-4 py-3.5 text-sm font-medium">Variáveis para cálculo do Score</h3>
        <ul>
          {SCORE_VARS.map((x) => (
            <li key={x.q} className="flex items-start gap-2.5 border-t px-4 py-3">
              <span className="min-w-0 flex-1">
                <span className="block text-sm leading-5">{x.q}</span>
                <span className="mt-0.5 block text-sm text-muted-foreground">{x.v}</span>
              </span>
              <span className="shrink-0 text-[13px] font-semibold text-muted-foreground tabular-nums">{x.pt}</span>
              <SeloDeStatus st={x.st} na="Não se aplica" />
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}

function ResultadoDoChecklist() {
  return (
    <>
      {CHECKLIST.map((g) => (
        <Collapsible key={g.s} defaultOpen className="group/secao mb-3.5 overflow-hidden rounded-lg border bg-card">
          <CollapsibleTrigger className="flex w-full items-center gap-2 px-4 py-3.5 text-left text-sm font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset">
            <span className="min-w-0 flex-1">{g.s}</span>
            <ChevronDownIcon aria-hidden className="size-3.5 shrink-0 text-muted-foreground transition-transform group-data-[state=closed]/secao:-rotate-90" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ul className="mt-0.5">
              {g.itens.map((x) => (
                <li key={x.q} className="border-t px-4 py-3">
                  <span className="block text-sm leading-5">{x.q}</span>
                  <span className="mt-0.5 block text-sm text-muted-foreground">{x.v}</span>
                </li>
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </>
  )
}

/**
 * O painel serve a mais de um agente: quem abre diz qual. Com resultado, as ações do
 * agente não aparecem no cabeçalho; durante a preparação, configurar não aparece.
 */
export function PainelDeResultado({ k, cabecalho }: { k: "score" | "checklist"; cabecalho: (acoes: ReactNode) => ReactNode }) {
  const { cfg, licFoco: lic, conversarCom, abrirModal } = useSim()
  const st = lic.fx[k]
  const an = cfg.agentes.find((a) => a.id === k)
  const mostrarAcoes = st !== "pronto" && st !== "preparando"
  const acoes = mostrarAcoes && (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Falar com o agente"
            onClick={() =>
              an &&
              conversarCom(
                an.id,
                k === "score"
                  ? `Cheguei em ${lic.score} de 100 nesta licitação. Pode me perguntar por que uma regra pontuou assim, ou dizer o que ficou errado.`
                  : "Este é o checklist que montei para esta licitação. Pode me perguntar de onde saiu cada resposta, ou apontar o que ficou errado.",
                `PE ${lic.n} · ${lic.org}`
              )
            }
          >
            <BotIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Falar com o agente</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label="Configurar o agente" onClick={() => an && abrirModal({ tipo: "agente", id: an.id })}>
            <WrenchIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Configurar o agente</TooltipContent>
      </Tooltip>
    </>
  )
  return (
    <>
      {cabecalho(acoes)}
      {/* vazio se centra no painel inteiro; resultado começa do topo */}
      <div className={cn("min-h-0 flex-1 overflow-y-auto px-5 pb-5", st !== "pronto" && "flex items-center justify-center")}>
        {st !== "pronto" ? <EstadoSemResultado k={k} /> : k === "score" ? <ResultadoDoScore lic={lic} /> : <ResultadoDoChecklist />}
      </div>
    </>
  )
}
