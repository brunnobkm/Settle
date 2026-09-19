// A janela de configuração: criar um agente (modelos e formulário), ver um agente (o
// que ele é e o que fez), editar (o mesmo formulário da criação, preenchido) e criar
// ou editar uma variável. Uma tela pode levar a outra, com o caminho de volta no
// cabeçalho. Clicar fora não fecha: quem preencheu meia configuração não pode perder
// tudo por um clique fora. Sai pelo X, pelo Esc ou pela ação de confirmar.

import { useEffect, useState, type ReactNode } from "react"
import { ArrowLeftIcon, InfoIcon, LockIcon, MinusIcon, PencilIcon, PlusIcon, Rows3Icon, TextIcon, Trash2Icon, TriangleAlertIcon, XIcon } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { PriorityList, type PriorityListItem } from "@/components/ui/priority-list"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

import { Dica, TagGatilho, VarChip } from "./comum"
import { Campo, CampoAprovacao, CampoInstrucoes, CampoOnde, CampoQuando } from "./Campos"
import {
  AGENDA_PADRAO,
  APROVACAO,
  ESTADO_EXEC,
  FONTES,
  FORMATOS,
  GATILHOS,
  MODELOS,
  MOSTRAR_CUSTO,
  RESPOSTA_A_DEFINIR,
  TIPOS_VAR,
  type FormatoModelo,
  type TipoVar,
  type Variavel,
} from "./dados"
import { useSim, type Rascunho, type Tela } from "./estado"
import {
  agentesDaVar,
  cap,
  dicaQuebra,
  ehAtivo,
  listaDeNomes,
  moeda,
  momentoDe,
  proximaExecucao,
  varsDoTexto,
  varsQuebradas,
} from "./regras"

/* ------------------------------------------------------------------ */
/* Moldura                                                             */
/* ------------------------------------------------------------------ */

function Moldura({
  titulo,
  acoesDoTopo,
  rodape,
  children,
}: {
  titulo: string
  acoesDoTopo?: ReactNode
  /** Texto à esquerda do rodapé e as ações à direita. */
  rodape?: { texto?: ReactNode; acoes: ReactNode }
  children: ReactNode
}) {
  const { modal, voltarModal, fecharModal } = useSim()
  return (
    <>
      <div className="flex shrink-0 items-center gap-3 border-b px-5 py-3.5">
        {!!modal?.pilha.length && (
          <Button variant="ghost" size="icon-sm" aria-label="Voltar para a tela anterior" onClick={voltarModal}>
            <ArrowLeftIcon />
          </Button>
        )}
        <DialogTitle className="min-w-0 flex-1 truncate text-[17px] leading-6 font-semibold">{titulo}</DialogTitle>
        {acoesDoTopo}
        <Button variant="ghost" size="icon-sm" aria-label="Fechar" onClick={fecharModal}>
          <XIcon />
        </Button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>
      {rodape && (
        <div className="flex shrink-0 items-center gap-2.5 border-t px-5 py-3.5">
          <span className="min-w-0 flex-1 text-xs text-muted-foreground">{rodape.texto}</span>
          {rodape.acoes}
        </div>
      )}
    </>
  )
}

export function Janela() {
  const { modal, fecharModal, trazerChatParaFrente } = useSim()
  const aberta = !!modal
  useEffect(() => {
    if (!aberta) return
    const t = window.setTimeout(trazerChatParaFrente, 0)
    return () => window.clearTimeout(t)
  }, [aberta, trazerChatParaFrente])
  return (
    <Dialog open={!!modal} onOpenChange={(o) => !o && fecharModal()}>
      <DialogContent
        showCloseButton={false}
        aria-describedby={undefined}
        onInteractOutside={(e) => e.preventDefault()}
        className="flex h-[calc(100svh-2.5rem)] flex-col gap-0 overflow-hidden rounded-[14px] p-0 sm:max-w-[880px]"
      >
        {modal && <TelaDaJanela tela={modal.tela} />}
      </DialogContent>
    </Dialog>
  )
}

function TelaDaJanela({ tela }: { tela: Tela }) {
  if (tela.tipo === "modelos") return <Modelos />
  if (tela.tipo === "novo") return <NovoAgente rascunho={tela.rascunho} />
  if (tela.tipo === "agente") return <DetalheDoAgente id={tela.id} />
  if (tela.tipo === "editar") return <EditarAgente id={tela.id} />
  return <FormVariavel key={tela.k ?? "nova"} k={tela.k} />
}

/** "Validar em 3 licitações": ideia do protótipo (benchmark do Harvey Agent Builder), não decisão de ninguém. */
function BotaoValidar() {
  return (
    <Button
      variant="outline"
      className="shadow-none"
      onClick={() => toast("Ainda não definimos como a validação funciona: quantas licitações, quais, e o que acontece com o resultado")}
    >
      Validar em 3 licitações
    </Button>
  )
}

/* ------------------------------------------------------------------ */
/* Criar: modelos                                                      */
/* ------------------------------------------------------------------ */

const ICONE_DO_FORMATO: Record<FormatoModelo, typeof Rows3Icon> = { score: Rows3Icon, texto: TextIcon }

function rascunhoNovo(formato: "texto" | "score", comModelo: boolean): Rascunho {
  const f = FORMATOS[formato]
  return {
    formato,
    nome: "",
    texto: "",
    linhas: formato === "score" ? [{ k: "", cond: "", pontos: 10 }] : [],
    /* Do zero, nada vem escolhido: um momento pré-marcado é uma decisão que a pessoa não tomou. */
    gatilho: comModelo ? f.gatilho : "",
    repete: "primeira",
    onde: comModelo ? f.onde : "",
    agenda: { ...AGENDA_PADRAO },
    aprovacao: "manual",
  }
}

function CartaoDeModelo({
  titulo,
  sub,
  formato,
  destaque,
  onClick,
}: {
  titulo: string
  sub: string
  formato?: FormatoModelo
  destaque?: boolean
  onClick: () => void
}) {
  const Icone = formato ? ICONE_DO_FORMATO[formato] : PlusIcon
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group/modelo flex w-full items-start gap-2.75 rounded-lg border border-transparent px-3 py-2.75 text-left outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50",
        destaque && "mb-1 border-border bg-card hover:border-primary hover:bg-card"
      )}
    >
      <span className="flex size-7.5 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover/modelo:bg-primary/10 group-hover/modelo:text-primary">
        <Icone aria-hidden className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <b className="block text-[13.5px] font-semibold">{titulo}</b>
        <span className="mt-0.5 block text-[12.5px] leading-[18px] text-muted-foreground">{sub}</span>
        {formato && (
          <span className="mt-1.5 flex items-center gap-1.25 text-[11.5px] text-muted-foreground">
            <Icone aria-hidden className="size-2.75" />
            {FORMATOS[formato].t}
          </span>
        )}
      </span>
    </button>
  )
}

/* Templates de cadastro (Alice, 09/09), no formato das Tarefas agendadas do Claude:
   uma opção de criar do zero em cima, e a grade de modelos abaixo. */
function Modelos() {
  const { irParaTela } = useSim()
  return (
    <Moldura titulo="Adicionar agente">
      <CartaoDeModelo
        destaque
        titulo="Criar do zero"
        sub="Você escreve a instrução e escolhe onde o resultado aparece."
        onClick={() => irParaTela({ tipo: "novo", rascunho: rascunhoNovo("texto", false) })}
      />
      <div className="mt-4 mb-1.5 flex items-center gap-2.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
        Ou comece por um modelo
        <Separator className="flex-1" />
      </div>
      <div className="grid grid-cols-1 gap-0.5 min-[620px]:grid-cols-2">
        {MODELOS.map((m) => (
          <CartaoDeModelo
            key={m.id}
            titulo={m.nome}
            sub={m.sub}
            formato={m.formato}
            onClick={() => irParaTela({ tipo: "novo", rascunho: rascunhoNovo(m.formato, true) })}
          />
        ))}
      </div>
    </Moldura>
  )
}

/* ------------------------------------------------------------------ */
/* Criar: formulário                                                   */
/* ------------------------------------------------------------------ */

function NovoAgente({ rascunho: r }: { rascunho: Rascunho }) {
  const { cfg, irParaTela, criarAgenteTexto, criarAgenteScore } = useSim()
  const mudar = (p: Partial<Rascunho>) => irParaTela({ tipo: "novo", rascunho: { ...r, ...p } })

  const quando = (
    <CampoQuando
      gatilho={r.gatilho}
      agenda={r.agenda}
      repete={r.repete}
      onGatilho={(gatilho) => mudar({ gatilho })}
      onAgenda={(agenda) => mudar({ agenda })}
      onRepete={(repete) => mudar({ repete })}
    />
  )
  const aprovacao = <CampoAprovacao valor={r.aprovacao} onChange={(aprovacao) => mudar({ aprovacao })} />

  if (r.formato === "score") {
    /* O modelo de Score: variável, o que conta como acerto, quanto vale. Sem texto
       corrido, porque a regra do Score é uma tabela. */
    const total = r.linhas.reduce((t, l) => t + (+l.pontos || 0), 0)
    const prontas = r.linhas.filter((l) => l.k && l.cond).length
    const mudarLinha = (i: number, p: Partial<Rascunho["linhas"][number]>) =>
      mudar({ linhas: r.linhas.map((l, j) => (j === i ? { ...l, ...p } : l)) })
    return (
      <Moldura
        titulo="Adicionar agente"
        rodape={{
          texto: prontas ? `${prontas} critério(s) preenchido(s)` : "",
          acoes: (
            <>
              <BotaoValidar />
              <Button disabled={!prontas} onClick={() => criarAgenteScore(r)}>
                Ativar agente
              </Button>
            </>
          ),
        }}
      >
        <Campo rotulo="Nome do agente" htmlFor="novo-nome">
          <Input id="novo-nome" placeholder="Ex.: Score de aderência" value={r.nome} onChange={(e) => mudar({ nome: e.target.value })} />
        </Campo>
        <Campo rotulo="Critérios">
          <Dica className="-mt-0.5 mb-1">Cada linha é uma variável, o que conta como acerto e quanto vale.</Dica>
          <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-left">
            <thead className="bg-muted text-[11px] font-semibold tracking-wide text-muted-foreground uppercase max-sm:hidden">
              <tr>
                <th scope="col" className="px-2.5 py-2">Variável</th>
                <th scope="col" className="px-2.5 py-2">Conta quando</th>
                <th scope="col" className="w-21 px-2.5 py-2 text-right">Pontos</th>
                <th scope="col" className="w-10 px-2.5 py-2"><span className="sr-only">Remover</span></th>
              </tr>
            </thead>
            <tbody>
              {r.linhas.map((l, i) => (
                <tr key={i} className="border-t">
                  <td className="px-2.5 py-2">
                    <NativeSelect aria-label={`Variável da linha ${i + 1}`} size="sm" className="w-full" value={l.k} onChange={(e) => mudarLinha(i, { k: e.target.value })}>
                      <NativeSelectOption value="">Escolher…</NativeSelectOption>
                      {Object.entries(cfg.vars).map(([k, v]) => (
                        <NativeSelectOption key={k} value={k}>
                          {v.nome}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                  </td>
                  <td className="px-2.5 py-2">
                    <Input aria-label={`Condição da linha ${i + 1}`} className="h-8 text-[13px]" placeholder="Ex.: existe pelo menos um" value={l.cond} onChange={(e) => mudarLinha(i, { cond: e.target.value })} />
                  </td>
                  <td className="px-2.5 py-2">
                    <Input
                      aria-label={`Pontos da linha ${i + 1}`}
                      type="number"
                      min={0}
                      className="h-8 text-right text-[13px] tabular-nums"
                      value={l.pontos}
                      onChange={(e) => mudarLinha(i, { pontos: +e.target.value || 0 })}
                    />
                  </td>
                  <td className="px-2.5 py-2">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Remover a linha ${i + 1}`}
                      onClick={() => {
                        const linhas = r.linhas.filter((_, j) => j !== i)
                        mudar({ linhas: linhas.length ? linhas : [{ k: "", cond: "", pontos: 10 }] })
                      }}
                    >
                      <MinusIcon />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          <div className="mt-2.5 flex items-center justify-between gap-2.5">
            <Button variant="outline" size="xs" className="shadow-none" onClick={() => mudar({ linhas: [...r.linhas, { k: "", cond: "", pontos: 10 }] })}>
              Adicionar critério
            </Button>
            <span className="text-[13px] text-muted-foreground tabular-nums">{total} pontos no total</span>
          </div>
        </Campo>
        {quando}
        {aprovacao}
      </Moldura>
    )
  }

  /* Criar um agente é escrever a instrução dele, não montar caixinhas: "é mais fácil
     pedir em forma de texto, a pessoa não precisa aprender a usar UI" (02/09). */
  const temTexto = !!r.texto.trim()
  const custo = varsDoTexto(r.texto).reduce((t, k) => t + (cfg.vars[k]?.custo ?? 0), 0)
  return (
    <Moldura
      titulo="Adicionar agente"
      rodape={{
        texto: temTexto && MOSTRAR_CUSTO ? `Custo: ${moeda(custo)} por licitação` : "",
        acoes: (
          <>
            <BotaoValidar />
            <Button disabled={!temTexto} onClick={() => criarAgenteTexto(r)}>
              Ativar agente
            </Button>
          </>
        ),
      }}
    >
      <Campo rotulo="Nome do agente" htmlFor="novo-nome">
        <Input id="novo-nome" placeholder="Ex.: Análise de prazos" value={r.nome} onChange={(e) => mudar({ nome: e.target.value })} />
      </Campo>
      <CampoInstrucoes
        id="novo-instrucoes"
        valor={r.texto}
        onChange={(texto) => mudar({ texto })}
        placeholder="Ex.: verifique se o prazo de entrega cabe na nossa operação. Digite / para usar uma variável."
      />
      <CampoOnde valor={r.onde} onChange={(onde) => mudar({ onde })} />
      {quando}
      {aprovacao}
    </Moldura>
  )
}

/* ------------------------------------------------------------------ */
/* Ver um agente                                                       */
/* ------------------------------------------------------------------ */

const MARCA_DA_EXEC = { ok: "success", aguardando: "warning", falhou: "destructive" } as const

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="mb-5.5 last:mb-0">
      <h3 className="mb-2 text-[13px] font-normal text-muted-foreground">{titulo}</h3>
      {children}
    </section>
  )
}

/** A instrução em leitura, com as variáveis como objetos. */
function TextoComVariaveis({ texto, aoVerMudancas }: { texto: string; aoVerMudancas: (k: string) => void }) {
  const partes = texto.split(/\{\{(\w+)\}\}/g)
  return (
    <p className="text-sm leading-[26px]">
      {partes.map((p, i) =>
        i % 2 === 1 ? (
          <VarChip key={i} k={p} aoVerMudancas={aoVerMudancas} />
        ) : (
          p.split("\n").map((linha, j) => (
            <span key={`${i}-${j}`}>
              {j > 0 && <br />}
              {linha}
            </span>
          ))
        )
      )}
    </p>
  )
}

/* Abrir um agente mostra o que ele é e o que ele fez. Editar é outro momento, atrás do
   lápis, e reusa o mesmo formulário da criação. */
function DetalheDoAgente({ id }: { id: string }) {
  const { cfg, fecharModal, abrirComVolta, excluirAgente, executarEmTodas, alterarAgente, conversarCom, marcarVarVista } = useSim()
  const an = cfg.agentes.find((a) => a.id === id)
  useEffect(() => {
    if (!an) fecharModal()
  }, [an, fecharModal])
  if (!an) return null

  const ativo = ehAtivo(an)
  /* As variáveis vêm do próprio texto: é o que a instrução realmente usa. */
  const vs = varsDoTexto(an.texto)
  const quebradas = varsQuebradas(an, cfg)
  const editar = () => abrirComVolta({ tipo: "editar", id })
  /* "Ver mudanças" abre a variável e dá a mudança por vista. */
  const verMudancas = (k: string) => {
    marcarVarVista(k)
    abrirComVolta({ tipo: "variavel", k })
  }

  return (
    <Moldura
      titulo={an.nome}
      acoesDoTopo={
        <>
          <Button variant="outline" size="icon-sm" className="shadow-none" aria-label="Editar este agente" onClick={editar}>
            <PencilIcon />
          </Button>
          <Button variant="outline" size="icon-sm" className="shadow-none" aria-label="Excluir este agente" onClick={() => excluirAgente(id, fecharModal)}>
            <Trash2Icon />
          </Button>
        </>
      }
      rodape={{ acoes: <Button onClick={() => executarEmTodas(id)}>Executar agora</Button> }}
    >
      {quebradas.length > 0 && (
        <Alert variant="warning" className="mb-4">
          <TriangleAlertIcon />
          <AlertTitle>Precisa de atenção</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="min-w-55 flex-1">{dicaQuebra(quebradas, cfg.varsEx)} Revise a instrução ou troque a variável.</span>
            <Button variant="outline" size="sm" className="shadow-none" onClick={editar}>
              Revisar instrução
            </Button>
          </AlertDescription>
        </Alert>
      )}
      <div className="mb-4.5 flex items-center gap-2.5 border-b pb-4 text-[13px] text-muted-foreground">
        <Switch checked={ativo} aria-label="Agente ativo" onCheckedChange={(v) => alterarAgente(id, { ativo: v })} />
        <Badge variant={ativo ? "success" : "secondary"}>{ativo ? "Ativo" : "Pausado"}</Badge>
        <span>{proximaExecucao(an)}</span>
      </div>
      <div className="grid grid-cols-1 gap-6.5 min-[720px]:grid-cols-[280px_minmax(0,1fr)]">
        <Secao titulo="Histórico">
          {an.execs.length ? (
            <ul>
              {an.execs.map((e, i) => (
                <li key={i} className="border-b last:border-b-0">
                  {/* Cada execução abre a conversa daquele resultado, com a configuração ainda na tela. */}
                  <button
                    type="button"
                    onClick={() => conversarCom(an.id, RESPOSTA_A_DEFINIR, `Execução de ${e.quando}`)}
                    className="-mx-2.5 block w-[calc(100%+1.25rem)] rounded-lg px-2.5 py-2.75 text-left outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13.5px] leading-[19px]">
                      {e.lic}
                      <Badge variant={MARCA_DA_EXEC[e.st]} className="text-[11px]">
                        {ESTADO_EXEC[e.st]}
                      </Badge>
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {e.o} · {e.quando}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] text-muted-foreground">Ainda não rodou em nenhuma licitação.</p>
          )}
        </Secao>
        <div>
          <Secao titulo="Instruções">
            <TextoComVariaveis texto={an.texto} aoVerMudancas={verMudancas} />
          </Secao>
          <Secao titulo="Quando roda">
            <TagGatilho agente={an} />
          </Secao>
          <Secao titulo="Permissões">
            <p className="text-sm leading-[22px]">{APROVACAO[an.aprovacao ?? "manual"].t}</p>
          </Secao>
          <Secao titulo="Variáveis usadas">
            {vs.length ? (
              <div className="flex flex-wrap gap-1.5">
                {vs.map((k) => (
                  <VarChip key={k} k={k} aoVerMudancas={verMudancas} />
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-muted-foreground">Nenhuma.</p>
            )}
          </Secao>
        </div>
      </div>
    </Moldura>
  )
}

/* ------------------------------------------------------------------ */
/* Editar um agente                                                    */
/* ------------------------------------------------------------------ */

/* O mesmo formulário da criação, preenchido. As mudanças já valem enquanto a pessoa
   escreve; salvar confirma e volta para o agente. */
function EditarAgente({ id }: { id: string }) {
  const { cfg, alterarAgente, aplicarMomento, voltarModal, modal, irParaTela } = useSim()
  const an = cfg.agentes.find((a) => a.id === id)
  if (!an) return null
  const g = momentoDe(an.gatilho)
  const agenda = an.agenda ?? AGENDA_PADRAO

  return (
    <Moldura
      titulo={an.nome}
      rodape={{
        acoes: (
          <>
            <BotaoValidar />
            <Button
              onClick={() => {
                toast("Agente atualizado")
                const anterior = modal?.pilha[modal.pilha.length - 1]
                if (anterior?.tipo === "agente" && anterior.id === id) voltarModal()
                else irParaTela({ tipo: "agente", id })
              }}
            >
              Salvar alterações
            </Button>
          </>
        ),
      }}
    >
      <Campo rotulo="Nome do agente" htmlFor="editar-nome">
        <Input id="editar-nome" value={an.nome} onChange={(e) => alterarAgente(id, { nome: e.target.value })} />
      </Campo>
      <CampoInstrucoes
        key={id}
        id="editar-instrucoes"
        valor={an.texto}
        onChange={(texto) => alterarAgente(id, { texto })}
        placeholder="Descreva o que o agente deve analisar. Digite / para inserir uma variável."
      />
      {/* Mudar o momento muda a frase de espera da funcionalidade que o agente alimenta. */}
      <CampoQuando
        gatilho={g}
        agenda={agenda}
        onGatilho={(novo) => {
          alterarAgente(id, { gatilho: GATILHOS[novo] })
          aplicarMomento(id, novo)
        }}
        onAgenda={(a) => {
          alterarAgente(id, { agenda: a })
          if (g) aplicarMomento(id, g)
        }}
      />
      <CampoAprovacao valor={an.aprovacao ?? "manual"} onChange={(aprovacao) => alterarAgente(id, { aprovacao })} />
    </Moldura>
  )
}

/* ------------------------------------------------------------------ */
/* Variável                                                            */
/* ------------------------------------------------------------------ */

/* A lista de fontes guarda todas as opções, marcadas ou não, porque a ordem também
   vale para as que ainda não estão marcadas: a pessoa organiza e depois liga. */
function listaDeFontes(v: Variavel | null): PriorityListItem[] {
  const atual = v ? v.fontes : ["Edital e anexos"]
  return [
    ...atual.map((f) => ({ id: f, label: f, checked: true })),
    ...FONTES.filter((f) => !atual.includes(f)).map((f) => ({ id: f, label: f, checked: false })),
  ]
}

/* O campo do valor padrão segue o tipo: uma variável de data não pode ter "abacaxi" como
   padrão, senão quebra na hora de usar no Score (José Victor, 02/09). */
function CampoPadrao({ tipo, valor, onChange, travado }: { tipo: TipoVar; valor: string; onChange: (v: string) => void; travado: boolean }) {
  const id = "var-padrao"
  if (tipo === "sim ou não") {
    return (
      <NativeSelect id={id} className="w-full" disabled={travado} value={valor} onChange={(e) => onChange(e.target.value)}>
        <NativeSelectOption value="">nenhum</NativeSelectOption>
        <NativeSelectOption value="sim">sim</NativeSelectOption>
        <NativeSelectOption value="não">não</NativeSelectOption>
      </NativeSelect>
    )
  }
  return (
    <Input
      id={id}
      type={tipo === "número" ? "number" : tipo === "data" ? "date" : "text"}
      step={tipo === "número" ? "any" : undefined}
      disabled={travado}
      placeholder={tipo === "número" ? "Ex.: 0" : tipo === "texto" ? "Ex.: não encontrado" : undefined}
      value={valor}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

/* Quem sente a mudança, dito numa frase, com o nome de cada agente clicável: quem vai
   alterar a variável precisa poder conferir o agente antes de mexer. */
function AvisoDeImpacto({ k }: { k: string }) {
  const { cfg, abrirComVolta } = useSim()
  const ags = agentesDaVar(k, cfg)
  if (!ags.length) {
    return (
      <Alert className="mb-4">
        <InfoIcon />
        <AlertTitle>Nenhum agente usa esta variável</AlertTitle>
        <AlertDescription>Você pode editar esta variável que não irá afetar nenhum agente.</AlertDescription>
      </Alert>
    )
  }
  const links = ags.map((nome) => {
    const alvo = cfg.agentes.find((a) => a.nome === nome)
    return (
      <button
        key={nome}
        type="button"
        className="font-semibold text-primary underline-offset-3 hover:underline"
        onClick={() => alvo && abrirComVolta({ tipo: "agente", id: alvo.id })}
      >
        {nome}
      </button>
    )
  })
  const um = ags.length === 1
  return (
    <Alert variant="warning" className="mb-4">
      <TriangleAlertIcon />
      <AlertTitle>Variável em uso</AlertTitle>
      <AlertDescription>
        Esta variável está sendo utilizada em {ags.length} {um ? "agente" : "agentes"} (
        {listaDeNomes<ReactNode>(links, " e ")}). Qualquer mudança aqui irá afetar {um ? "esse agente." : "esses agentes."}
      </AlertDescription>
    </Alert>
  )
}

/* Serve para criar e para editar: com uma chave, abre preenchida e avisa quais agentes
   vão sentir a mudança. Variável da Settle abre travada. */
function FormVariavel({ k }: { k: string | null }) {
  const { cfg, salvarVar, excluirVar, fecharModal } = useSim()
  const v = k ? (cfg.vars[k] ?? null) : null
  const travado = !!v?.settle
  const [nome, setNome] = useState(v?.nome ?? "")
  const [tipo, setTipo] = useState<TipoVar>(v?.tipo ?? "texto")
  const [prompt, setPrompt] = useState(v?.prompt ?? "")
  const [fontes, setFontes] = useState(() => listaDeFontes(v))
  const [resto, setResto] = useState(v ? v.resto : true)
  const [padrao, setPadrao] = useState(v?.padrao ?? "")

  return (
    <Moldura
      titulo={v ? v.nome : "Adicionar variável"}
      rodape={{
        acoes: (
          <>
            {/* Excluir fica junto de salvar, em vermelho: é ação da mesma tela, mas não a esperada. */}
            {v && !travado && k && (
              <Button variant="outline" className="border-destructive text-destructive shadow-none hover:bg-destructive/8 hover:text-destructive" onClick={() => excluirVar(k, true)}>
                Excluir esta variável
              </Button>
            )}
            {!travado && (
              <Button
                onClick={() => {
                  const ok = salvarVar(k, {
                    nome, tipo, prompt, resto, padrao,
                    fontes: fontes.filter((f) => f.checked).map((f) => f.id),
                  })
                  if (ok) fecharModal()
                }}
              >
                {v ? "Salvar alterações" : "Criar variável"}
              </Button>
            )}
          </>
        ),
      }}
    >
      {travado ? (
        <Alert className="mb-4">
          <LockIcon />
          <AlertTitle>Variável cadastrada pela Settle</AlertTitle>
          <AlertDescription>
            Você pode usá-la em qualquer agente, mas não pode editar. Variáveis padrões da Settle não podem ser editadas.
            Para uma regra diferente, crie uma variável sua.
          </AlertDescription>
        </Alert>
      ) : (
        v && k && <AvisoDeImpacto k={k} />
      )}

      <Campo rotulo="Nome da variável" htmlFor="var-nome">
        <Input id="var-nome" disabled={travado} placeholder="Ex.: CNPJ do órgão" value={nome} onChange={(e) => setNome(e.target.value)} />
      </Campo>
      {travado && v?.desc && (
        <Campo rotulo="Descrição">
          <Dica className="text-[13px]">{v.desc}</Dica>
        </Campo>
      )}
      <Campo rotulo="Tipo" htmlFor="var-tipo">
        {/* Trocar o tipo troca o campo do valor padrão junto: impede um padrão incompatível. */}
        <NativeSelect
          id="var-tipo"
          className="w-full"
          disabled={travado}
          value={tipo}
          onChange={(e) => {
            setTipo(e.target.value as TipoVar)
            setPadrao("")
          }}
        >
          {TIPOS_VAR.map((t) => (
            <NativeSelectOption key={t} value={t}>
              {cap(t)}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </Campo>
      <Campo rotulo="Instruções" htmlFor="var-prompt">
        <Textarea
          id="var-prompt"
          rows={3}
          disabled={travado}
          placeholder="Ex.: encontre o número do CNPJ do órgão que está contratando, com 14 dígitos."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </Campo>
      <Campo rotulo="Onde procurar">
        {/* A ordem das marcadas é a ordem em que a Settle procura: muda pelas setas ou arrastando. */}
        <PriorityList items={fontes} onItemsChange={setFontes} disabled={travado} aria-label="Onde procurar" />
        <Label className="mt-1.5 cursor-pointer text-[13px] font-normal">
          <Checkbox checked={resto} disabled={travado} onCheckedChange={(x) => setResto(x === true)} />
          Se não achar em nenhuma delas, procurar nos outros arquivos da licitação
        </Label>
      </Campo>
      <Campo rotulo="O que fazer quando não encontrar a variável" htmlFor="var-padrao">
        <CampoPadrao tipo={tipo} valor={padrao} onChange={setPadrao} travado={travado} />
      </Campo>
    </Moldura>
  )
}
