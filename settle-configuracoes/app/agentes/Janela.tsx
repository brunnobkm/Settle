// A janela de configuração: criar um agente (modelos e formulário), ver um agente,
// editar (o mesmo formulário da criação) e criar ou editar uma variável. Uma tela pode
// levar a outra, com o caminho de volta no cabeçalho. Clicar fora não fecha: quem
// preencheu meia configuração não pode perder tudo por um clique fora.

import { useEffect, useRef, useState, type ReactNode } from "react"
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
import { Campo, CampoAprovacao, CampoFormato, CampoInstrucoes, CampoOnde, CampoQuando, mostrarPrimeiroErro } from "./Campos"
import {
  AGENDA_PADRAO,
  APROVACAO,
  ESTADO_EXEC,
  FONTES,
  FORMATO_VAR,
  FORMATOS,
  GATILHOS,
  MODELOS,
  ONDE,
  type FormatoModelo,
  type Momento,
  type TipoVar,
  type Variavel,
} from "./dados"
import { ConversaAgente, ConversaVariavel } from "./Conversa"
import { useAgentes, type DadosDaVariavel, type Erros, type Rascunho, type Tela } from "./estado"
import {
  agentesDaVar,
  dicaQuebra,
  ehAtivo,
  listaDeNomes,
  momentoDe,
  proximaExecucao,
  resumoDoAgente,
  varsDoAgente,
  varsQuebradas,
} from "./regras"

/** Troca de aba dentro de Agentes pelo endereço, de qualquer lugar da janela. */
export function irParaAprovacoes() {
  window.location.hash = "agentes?aba=aprovacoes"
}

/* ------------------------------------------------------------------ */
/* Moldura                                                             */
/* ------------------------------------------------------------------ */

export function Moldura({
  titulo,
  acoesDoTopo,
  rodape,
  corpo,
  children,
}: {
  titulo: string
  acoesDoTopo?: ReactNode
  rodape?: { texto?: ReactNode; acoes: ReactNode }
  /** Referência do corpo rolável, para levar ao primeiro erro. */
  corpo?: React.Ref<HTMLDivElement>
  children: ReactNode
}) {
  const { modal, voltarModal, fecharModal } = useAgentes()
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
      <div ref={corpo} className="min-h-0 flex-1 overflow-y-auto p-5">
        {children}
      </div>
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
  const { modal, fecharModal } = useAgentes()
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
  if (tela.tipo === "novo") return <FormAgente key="novo" inicial={tela.rascunho} />
  if (tela.tipo === "agente") return <DetalheDoAgente id={tela.id} />
  if (tela.tipo === "editar") return <EditarAgente id={tela.id} />
  if (tela.tipo === "conversa-agente") return <ConversaAgente varInicial={tela.varInicial} />
  if (tela.tipo === "conversa-variavel") return <ConversaVariavel />
  return <FormVariavel key={tela.k ?? "nova"} k={tela.k} inicial={tela.inicial} />
}

/* ------------------------------------------------------------------ */
/* Criar: modelos                                                      */
/* ------------------------------------------------------------------ */

const ICONE_DO_FORMATO: Record<FormatoModelo, typeof Rows3Icon> = { score: Rows3Icon, texto: TextIcon }

export function rascunhoNovo(formato: "texto" | "score", comModelo: boolean): Rascunho {
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
    aprovacao: comModelo ? "manual" : "",
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

function Modelos() {
  const { irParaTela } = useAgentes()
  return (
    <Moldura titulo="Adicionar agente">
      <CartaoDeModelo
        destaque
        titulo="Criar do zero"
        sub="Você escreve o que o agente faz, escolhe quando ele trabalha e onde o resultado aparece."
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
/* Formulário do agente (criar e editar)                               */
/* ------------------------------------------------------------------ */

/** Os campos de um agente, os mesmos na criação e na edição. */
function CamposDoAgente({ r, mudar, erros, idInstrucoes }: { r: Rascunho; mudar: (p: Partial<Rascunho>) => void; erros: Erros; idInstrucoes: string }) {
  const { cfg, abrirComVolta, fecharModal } = useAgentes()
  const verAprovacoes = () => {
    fecharModal()
    irParaAprovacoes()
  }
  const quando = (
    <CampoQuando
      gatilho={r.gatilho}
      agenda={r.agenda}
      repete={r.repete}
      erro={erros.gatilho}
      onGatilho={(gatilho) => mudar({ gatilho })}
      onAgenda={(agenda) => mudar({ agenda })}
      onRepete={(repete) => mudar({ repete })}
    />
  )
  const aprovacao = (
    <CampoAprovacao valor={r.aprovacao} erro={erros.aprovacao} onChange={(aprovacao) => mudar({ aprovacao })} aoVerAprovacoes={verAprovacoes} />
  )

  if (r.formato === "score") {
    /* O modelo de Score: variável, o que conta como acerto, quanto vale. Sem texto
       corrido, porque a regra do Score é uma tabela. */
    const total = r.linhas.reduce((t, l) => t + (+l.pontos || 0), 0)
    const mudarLinha = (i: number, p: Partial<Rascunho["linhas"][number]>) =>
      mudar({ linhas: r.linhas.map((l, j) => (j === i ? { ...l, ...p } : l)) })
    return (
      <>
        <Campo rotulo="Critérios" dica="Cada linha é uma variável, o que conta como acerto e quanto vale." erro={erros.linhas}>
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
                      <Input aria-label={`Condição da linha ${i + 1}`} className="h-8 text-[13px]" placeholder="Ex.: não exige" value={l.cond} onChange={(e) => mudarLinha(i, { cond: e.target.value })} />
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
          <div className="mt-1 flex items-center justify-between gap-2.5">
            <Button variant="outline" size="xs" className="shadow-none" onClick={() => mudar({ linhas: [...r.linhas, { k: "", cond: "", pontos: 10 }] })}>
              Adicionar critério
            </Button>
            <span className="text-[13px] text-muted-foreground tabular-nums">{total} pontos no total</span>
          </div>
        </Campo>
        {quando}
        {aprovacao}
      </>
    )
  }

  return (
    <>
      <CampoInstrucoes
        id={idInstrucoes}
        valor={r.texto}
        erro={erros.texto}
        onChange={(texto) => mudar({ texto })}
        aoAbrirVariavel={(k) => abrirComVolta({ tipo: "variavel", k })}
      />
      <CampoOnde valor={r.onde} erro={erros.onde} onChange={(onde) => mudar({ onde })} />
      {quando}
      {aprovacao}
    </>
  )
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

/*
  O botão de criar nunca fica desativado: no teste, botão que não responde pareceu
  defeito. Clicar com algo faltando mostra o que falta, embaixo de cada campo.
*/
function FormAgente({ inicial }: { inicial: Rascunho }) {
  const { criarAgente, validarAgente } = useAgentes()
  const [r, setR] = useState(inicial)
  const [erros, setErros] = useState<Erros>({})
  const [tentou, setTentou] = useState(false)
  const corpo = useRef<HTMLDivElement>(null)
  const mudar = (p: Partial<Rascunho>) =>
    setR((atual) => {
      const novo = { ...atual, ...p }
      // depois da primeira tentativa, o erro some assim que o campo fica certo
      if (tentou) setErros(validarAgente(novo))
      return novo
    })

  return (
    <Moldura
      titulo="Adicionar agente"
      corpo={corpo}
      rodape={{
        texto: Object.keys(erros).length ? `Falta preencher ${Object.keys(erros).length === 1 ? "1 campo" : `${Object.keys(erros).length} campos`}` : "",
        acoes: (
          <>
            <BotaoValidar />
            <Button
              onClick={() => {
                setTentou(true)
                const e = criarAgente(r)
                if (e) {
                  setErros(e)
                  mostrarPrimeiroErro(corpo.current)
                }
              }}
            >
              Criar agente
            </Button>
          </>
        ),
      }}
    >
      <Campo rotulo="Nome do agente" htmlFor="novo-nome" dica="Um nome que diga o que ele faz. Ex.: Exige atestado técnico?">
        <Input id="novo-nome" placeholder="Ex.: Exige atestado técnico?" value={r.nome} onChange={(e) => mudar({ nome: e.target.value })} />
      </Campo>
      <CamposDoAgente r={r} mudar={mudar} erros={erros} idInstrucoes="novo-instrucoes" />
    </Moldura>
  )
}

/* O mesmo formulário da criação, preenchido. Salvar valida e volta para o agente. */
function EditarAgente({ id }: { id: string }) {
  const { cfg, alterarAgente, validarAgente, voltarModal, modal, irParaTela, fecharModal } = useAgentes()
  const an = cfg.agentes.find((a) => a.id === id)
  const [r, setR] = useState<Rascunho | null>(() =>
    an
      ? {
          formato: "texto",
          nome: an.nome,
          texto: an.texto,
          linhas: [],
          gatilho: momentoDe(an.gatilho),
          repete: an.repete ?? "primeira",
          onde: an.onde ?? "",
          agenda: an.agenda ?? AGENDA_PADRAO,
          aprovacao: an.aprovacao ?? "manual",
        }
      : null
  )
  const [erros, setErros] = useState<Erros>({})
  const corpo = useRef<HTMLDivElement>(null)
  if (!an || !r) return null
  /* Score e Checklist têm as regras deles: aqui só o momento e a aprovação mudam. */
  const estruturado = an.formato !== "texto"
  const validar = (x: Rascunho) => {
    const e = validarAgente(x)
    if (estruturado) {
      delete e.texto
      delete e.onde
    }
    return e
  }
  const mudar = (p: Partial<Rascunho>) =>
    setR((atual) => {
      const novo = { ...(atual as Rascunho), ...p }
      if (Object.keys(erros).length) setErros(validar(novo))
      return novo
    })

  return (
    <Moldura
      titulo={an.nome}
      corpo={corpo}
      rodape={{
        acoes: (
          <>
            <BotaoValidar />
            <Button
              onClick={() => {
                const e = validar(r)
                if (Object.keys(e).length) {
                  setErros(e)
                  mostrarPrimeiroErro(corpo.current)
                  return
                }
                alterarAgente(id, {
                  nome: r.nome.trim() || an.nome,
                  ...(estruturado ? {} : { texto: r.texto, onde: r.onde || undefined }),
                  gatilho: GATILHOS[r.gatilho as Momento],
                  repete: r.repete,
                  agenda: r.agenda,
                  aprovacao: r.aprovacao || undefined,
                })
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
      <Campo
        rotulo="Nome do agente"
        htmlFor="editar-nome"
        dica="Aparece na lista de agentes e no topo do resultado, dentro da licitação."
      >
        <Input id="editar-nome" value={r.nome} onChange={(e) => mudar({ nome: e.target.value })} />
      </Campo>
      {estruturado ? (
        <>
          <Alert className="mb-5">
            <InfoIcon />
            <AlertDescription>
              As regras do {an.nome} são editadas no próprio {an.nome}. Aqui mudam o momento e a aprovação.
            </AlertDescription>
          </Alert>
          <CampoQuando
            gatilho={r.gatilho}
            agenda={r.agenda}
            repete={r.repete}
            erro={erros.gatilho}
            onGatilho={(gatilho) => mudar({ gatilho })}
            onAgenda={(agenda) => mudar({ agenda })}
            onRepete={(repete) => mudar({ repete })}
          />
          <CampoAprovacao
            valor={r.aprovacao}
            erro={erros.aprovacao}
            onChange={(aprovacao) => mudar({ aprovacao })}
            aoVerAprovacoes={() => {
              fecharModal()
              irParaAprovacoes()
            }}
          />
        </>
      ) : (
        <CamposDoAgente r={r} mudar={mudar} erros={erros} idInstrucoes="editar-instrucoes" />
      )}
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
function TextoComVariaveis({ texto, aoAbrir }: { texto: string; aoAbrir: (k: string) => void }) {
  const partes = texto.split(/\{\{(\w+)\}\}/g)
  return (
    <p className="text-sm leading-[26px]">
      {partes.map((p, i) =>
        i % 2 === 1 ? (
          <VarChip key={i} k={p} aoAbrir={aoAbrir} />
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

function DetalheDoAgente({ id }: { id: string }) {
  const { cfg, fecharModal, abrirComVolta, excluirAgentes, executarEmTodas, alterarAgente, marcarVarVista } = useAgentes()
  const an = cfg.agentes.find((a) => a.id === id)
  useEffect(() => {
    if (!an) fecharModal()
  }, [an, fecharModal])
  if (!an) return null

  const ativo = ehAtivo(an)
  const vs = varsDoAgente(an, cfg)
  const quebradas = varsQuebradas(an, cfg)
  const parado = ativo && quebradas.length > 0
  const editar = () => abrirComVolta({ tipo: "editar", id })
  const abrirVar = (k: string) => {
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
          <Button variant="outline" size="icon-sm" className="border-destructive/40 text-destructive shadow-none hover:bg-destructive/8 hover:text-destructive" aria-label="Excluir este agente" onClick={() => excluirAgentes([id], fecharModal)}>
            <Trash2Icon />
          </Button>
        </>
      }
      rodape={{
        texto: parado ? "Revise a instrução para o agente voltar a rodar." : "",
        acoes: (
          <Button disabled={!ativo || parado} onClick={() => executarEmTodas(id)}>
            Executar agora em todas as licitações
          </Button>
        ),
      }}
    >
      {parado && (
        <Alert variant="destructive" className="mb-4">
          <TriangleAlertIcon />
          <AlertTitle>Parado: precisa de atenção</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="min-w-55 flex-1">{dicaQuebra(quebradas, cfg.varsEx)}</span>
            <Button variant="outline" size="sm" className="shadow-none" onClick={editar}>
              Revisar instrução
            </Button>
          </AlertDescription>
        </Alert>
      )}
      <div className="mb-4.5 flex flex-wrap items-center gap-2.5 border-b pb-4 text-[13px] text-muted-foreground">
        <Switch checked={ativo} aria-label="Agente em atividade" onCheckedChange={(v) => alterarAgente(id, { ativo: v })} />
        <Badge variant={parado ? "destructive" : ativo ? "success" : "secondary"}>{parado ? "Parado" : ativo ? "Ativo" : "Pausado"}</Badge>
        <span>{proximaExecucao(an)}</span>
      </div>
      {/* O resumo em frase: o que ninguém conseguiu montar sozinho no teste. */}
      <p className="mb-5 rounded-lg bg-muted/60 px-3.5 py-2.75 text-[13.5px] leading-5">{resumoDoAgente(an, cfg).join(" · ")}</p>
      <div className="grid grid-cols-1 gap-6.5 min-[720px]:grid-cols-[minmax(0,1fr)_280px]">
        <div>
          <Secao titulo="O que o agente faz">
            <TextoComVariaveis texto={an.texto} aoAbrir={abrirVar} />
          </Secao>
          <Secao titulo="Variáveis usadas">
            {vs.length ? (
              <div className="flex flex-wrap gap-1.5">
                {vs.map((k) => (
                  <VarChip key={k} k={k} aoAbrir={abrirVar} />
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-muted-foreground">Nenhuma.</p>
            )}
          </Secao>
          <Secao titulo="Onde o resultado aparece">
            <p className="text-sm leading-[22px]">{an.onde ? ONDE[an.onde].t : "Não definido"}</p>
            {an.onde && <Dica>{ONDE[an.onde].d}</Dica>}
          </Secao>
          <Secao titulo="Quando o agente trabalha">
            <TagGatilho agente={an} />
            {an.repete === "sempre" && <Dica className="mt-1.5">Trabalha de novo quando o edital mudar.</Dica>}
          </Secao>
          <Secao titulo="Aprovação das ações">
            <p className="text-sm leading-[22px]">{APROVACAO[an.aprovacao ?? "manual"].t}</p>
          </Secao>
        </div>
        <Secao titulo="Histórico">
          {an.execs.length ? (
            <ul>
              {an.execs.map((e, i) => (
                <li key={i} className="border-b py-2.5 last:border-b-0">
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13.5px] leading-[19px]">
                    {e.lic}
                    <Badge variant={MARCA_DA_EXEC[e.st]} className="text-[11px]">
                      {ESTADO_EXEC[e.st]}
                    </Badge>
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {e.o} · {e.quando}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] text-muted-foreground">Ainda não rodou em nenhuma licitação.</p>
          )}
        </Secao>
      </div>
    </Moldura>
  )
}

/* ------------------------------------------------------------------ */
/* Variável                                                            */
/* ------------------------------------------------------------------ */

/* A lista de fontes guarda todas as opções, marcadas ou não: a ordem também vale para as
   que ainda não estão marcadas. */
function listaDeFontes(v: Pick<Variavel, "fontes"> | null): PriorityListItem[] {
  const atual = v ? v.fontes : ["Edital e anexos"]
  const item = (f: string, checked: boolean) => ({ id: f, label: f, checked })
  return [...atual.map((f) => item(f, true)), ...FONTES.filter((f) => !atual.includes(f)).map((f) => item(f, false))]
}

function CampoPadrao({
  tipo,
  valor,
  onChange,
  travado,
  invalido,
}: {
  tipo: TipoVar
  valor: string
  onChange: (v: string) => void
  travado: boolean
  invalido?: boolean
}) {
  const id = "var-padrao"
  if (tipo === "sim ou não") {
    return (
      <NativeSelect id={id} className="w-full" disabled={travado} aria-invalid={invalido || undefined} value={valor} onChange={(e) => onChange(e.target.value)}>
        <NativeSelectOption value="" disabled>
          Escolha a resposta
        </NativeSelectOption>
        <NativeSelectOption value="sim">Responder sim</NativeSelectOption>
        <NativeSelectOption value="não">Responder não</NativeSelectOption>
      </NativeSelect>
    )
  }
  return (
    <Input
      id={id}
      type={tipo === "número" ? "number" : tipo === "data" ? "date" : "text"}
      step={tipo === "número" ? "any" : undefined}
      disabled={travado}
      aria-invalid={invalido || undefined}
      placeholder={FORMATO_VAR[tipo].vazio || undefined}
      value={valor}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

function AvisoDeImpacto({ k }: { k: string }) {
  const { cfg, abrirComVolta } = useAgentes()
  const ags = agentesDaVar(k, cfg)
  if (!ags.length) {
    return (
      <Alert className="mb-4">
        <InfoIcon />
        <AlertTitle>Nenhum agente usa esta variável</AlertTitle>
        <AlertDescription>Mudar ou excluir não afeta nenhum agente.</AlertDescription>
      </Alert>
    )
  }
  const links = ags.map((a) => (
    <button
      key={a.id}
      type="button"
      className="font-semibold text-primary underline-offset-3 hover:underline"
      onClick={() => abrirComVolta({ tipo: "agente", id: a.id })}
    >
      {a.nome}
    </button>
  ))
  const um = ags.length === 1
  return (
    <Alert variant="warning" className="mb-4">
      <TriangleAlertIcon />
      <AlertTitle>Usada por {um ? "1 agente" : `${ags.length} agentes`}</AlertTitle>
      <AlertDescription>
        <span>
          {listaDeNomes<ReactNode>(links, " e ")}. Mudar aqui muda o que {um ? "esse agente recebe" : "esses agentes recebem"}.
        </span>
      </AlertDescription>
    </Alert>
  )
}

/* inicial: o que a conversa já preencheu, para revisar antes de criar. */
function FormVariavel({ k, inicial }: { k: string | null; inicial?: DadosDaVariavel }) {
  const { cfg, salvarVar, excluirVars, fecharModal } = useAgentes()
  const v = k ? (cfg.vars[k] ?? null) : null
  const base = v ?? inicial ?? null
  const travado = !!v?.settle
  const [nome, setNome] = useState(base?.nome ?? "")
  const [tipo, setTipo] = useState<TipoVar>(base?.tipo ?? "sim ou não")
  const [prompt, setPrompt] = useState(base?.prompt ?? "")
  const [fontes, setFontes] = useState(() => listaDeFontes(base))
  const [resto, setResto] = useState(base ? base.resto : true)
  const [padrao, setPadrao] = useState(base?.padrao ?? "")
  const [erros, setErros] = useState<Erros>({})
  const corpo = useRef<HTMLDivElement>(null)
  const marcadas = fontes.filter((f) => f.checked)

  const salvar = () => {
    const e = salvarVar(k, { nome, tipo, prompt, resto, padrao, fontes: marcadas.map((f) => f.id) })
    if (e) {
      setErros(e)
      mostrarPrimeiroErro(corpo.current)
      return
    }
    fecharModal()
  }

  return (
    <Moldura
      titulo={v ? v.nome : "Adicionar variável"}
      corpo={corpo}
      rodape={{
        acoes: (
          <>
            {v && !travado && k && (
              <Button
                variant="outline"
                className="border-destructive text-destructive shadow-none hover:bg-destructive/8 hover:text-destructive"
                onClick={() => excluirVars([k], fecharModal)}
              >
                Excluir esta variável
              </Button>
            )}
            {!travado && <Button onClick={salvar}>{v ? "Salvar alterações" : "Criar variável"}</Button>}
          </>
        ),
      }}
    >
      {travado ? (
        <Alert className="mb-4">
          <LockIcon />
          <AlertTitle>Variável cadastrada pela Settle</AlertTitle>
          <AlertDescription>Você pode usá-la em qualquer agente, mas não pode editar. Para uma regra diferente, crie uma variável sua.</AlertDescription>
        </Alert>
      ) : (
        v && k && <AvisoDeImpacto k={k} />
      )}

      <Campo
        rotulo="Nome da variável"
        htmlFor="var-nome"
        dica="É o nome que você escolhe para identificar sua variável, e é por ele que você a encontra ao escrever o que um agente faz."
        erro={erros.nome}
      >
        <Input
          id="var-nome"
          disabled={travado}
          aria-invalid={erros.nome ? true : undefined}
          placeholder="Ex.: Atestado exigido"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
      </Campo>
      {travado && v?.desc && (
        <Campo rotulo="Descrição">
          <Dica className="text-[13px]">{v.desc}</Dica>
        </Campo>
      )}
      <Campo
        rotulo="O que procurar no edital"
        htmlFor="var-prompt"
        dica="É a instrução que você escreve para a gente entender o que precisa procurar para você. Escreva como pediria para uma pessoa do time."
        erro={erros.prompt}
      >
        <Textarea
          id="var-prompt"
          rows={3}
          disabled={travado}
          aria-invalid={erros.prompt ? true : undefined}
          placeholder="Ex.: diga se o edital exige atestado de capacidade técnica para a habilitação."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </Campo>
      <CampoFormato
        valor={tipo}
        travado={travado}
        onChange={(t) => {
          // trocar o formato troca a resposta padrão junto: impede um padrão incompatível
          setTipo(t)
          setPadrao("")
        }}
      />
      <Campo
        rotulo="Onde procurar"
        dica="As variáveis podem ser buscadas em vários lugares diferentes. Marque os documentos e arraste para mudar a ordem: a Settle procura primeiro no de cima e só passa ao seguinte se não achar."
        erro={erros.fontes}
      >
        <PriorityList
          items={fontes}
          onItemsChange={setFontes}
          disabled={travado}
          aria-invalid={erros.fontes ? true : undefined}
          className={erros.fontes ? "rounded-lg ring-3 ring-destructive/20" : undefined}
          aria-label="Onde procurar"
        />
        <Label className="mt-1.5 cursor-pointer text-[13px] font-normal">
          <Checkbox checked={resto} disabled={travado} onCheckedChange={(x) => setResto(x === true)} />
          Se não achar em nenhum deles, procurar nos outros arquivos da licitação
        </Label>
      </Campo>
      <Campo
        rotulo="Resposta quando o edital não falar disso"
        htmlFor="var-padrao"
        dica="Quando a resposta não é encontrada, precisamos mostrar algo para você entender que não houve resultado. É isso que os agentes recebem."
        erro={erros.padrao}
      >
        <CampoPadrao tipo={tipo} valor={padrao} onChange={setPadrao} travado={travado} invalido={!!erros.padrao} />
      </Campo>
    </Moldura>
  )
}
