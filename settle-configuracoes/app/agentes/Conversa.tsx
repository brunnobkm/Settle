// Criar conversando: o agente (ou a variável) é montado por perguntas, uma de cada vez,
// no formato das perguntas do Claude (opções, "Outra opção" e o contador). Ao
// lado, o que está sendo construído aparece ao vivo, campo por campo: a regra fica
// materializada durante a conversa, como a Alice pediu ("a conversa é uma coisa, o que
// ele construiu é outra"). No fim, "Revisar e criar" abre o formulário de sempre, já
// preenchido.
//
// Motivo (teste de usabilidade de 21/09): o formulário exigia entender variável, gatilho
// e destino antes de começar. Aqui a pessoa diz o que quer com as palavras dela, e a
// variável nasce dentro da conversa quando faz falta.
//
// No protótipo a conversa é roteirizada: as perguntas seguem um caminho fixo, e o texto
// livre é aceito como resposta. O Score continua só no formulário (a Alice achou ruim
// preencher o Score conversando).

import { useEffect, useRef, useState, type ReactNode } from "react"
import { ArrowUpIcon, SparklesIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { USUARIO } from "@/settle/navegacao"

import { TagGatilho, VarChip } from "./comum"
import {
  APROVACAO,
  DESC_FONTE,
  DESC_GATILHO,
  FONTES,
  FORMATO_VAR,
  GATILHOS,
  ONDE,
  REP_POR_GATILHO,
  TIPOS_VAR,
  type ModoAprovacao,
  type Momento,
  type Onde,
  type Repeticao,
  type TipoVar,
} from "./dados"
import { useConfig } from "../estado"
import { useAgentes, type DadosDaVariavel, type Rascunho } from "./estado"
import { Moldura, rascunhoNovo } from "./Janela"

/* ------------------------------------------------------------------ */
/* Peças                                                               */
/* ------------------------------------------------------------------ */

type Opcao = { v: string; t: string; d?: string; rec?: boolean }

type Passo = {
  id: string
  /** O que é isso que está sendo perguntado, antes da pergunta: aqui cabe ensinar. */
  explica?: ReactNode
  pergunta: string
  ajuda?: string
  opcoes: Opcao[]
  /** Texto do campo "Outra opção". */
  outra?: string
  /** Toda pergunta exige resposta: quem não quer aquilo escolhe a opção que diz isso. */
  obrigatorio?: boolean
}

type Fala = { quem: "settle" | "voce"; texto: ReactNode }

const cap = (t: string) => (t ? t.charAt(0).toUpperCase() + t.slice(1) : t)
const semPonto = (t: string) => t.trim().replace(/[.!?]+$/, "")
/** Para nomes: tira só o ponto final; "Exige atestado técnico?" continua pergunta. */
const semPontoFinal = (t: string) => t.trim().replace(/\.+$/, "")
const normal = (t: string) => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")

function Bolha({ fala }: { fala: Fala }) {
  if (fala.quem === "voce") {
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] rounded-2xl rounded-br-md bg-muted px-3.5 py-2 text-[13.5px] leading-5">{fala.texto}</p>
      </div>
    )
  }
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <SparklesIcon aria-hidden className="size-3.5" />
      </span>
      <div className="max-w-[88%] text-[13.5px] leading-5">{fala.texto}</div>
    </div>
  )
}

/** O cartão da pergunta atual, no formato das perguntas do Claude. */
function CartaoDaPergunta({
  passo,
  n,
  total,
  onResponder,
}: {
  passo: Passo
  n: number
  total: number
  onResponder: (valor: string, rotulo: string) => void
}) {
  const [sel, setSel] = useState<string | null>(null)
  const [outra, setOutra] = useState("")
  const escolhida = passo.opcoes.find((o) => o.v === sel)
  const enviar = () => {
    if (sel === "__outra" && outra.trim()) onResponder(`__livre:${outra.trim()}`, outra.trim())
    else if (escolhida) onResponder(escolhida.v, escolhida.t)
  }
  const pode = sel === "__outra" ? !!outra.trim() : !!escolhida
  return (
    <section aria-labelledby={`pergunta-${passo.id}`} className="flex max-h-[min(56svh,460px)] shrink-0 flex-col rounded-xl border bg-card shadow-xs">
      {/* o que é isso que está sendo perguntado: fica sempre à vista, junto da pergunta */}
      {passo.explica && (
        <div className="flex max-h-38 shrink-0 items-start gap-2.5 overflow-y-auto rounded-t-xl border-b bg-primary/5 px-4 py-3 text-[13px] leading-[19px]">
          <SparklesIcon aria-hidden className="mt-0.5 size-3.5 shrink-0 text-primary" />
          <p>{passo.explica}</p>
        </div>
      )}
      <div className="flex shrink-0 items-start gap-3 px-4 pt-3.5 pb-2">
        <div className="min-w-0 flex-1">
          <h3 id={`pergunta-${passo.id}`} className="text-sm leading-5 font-semibold">
            {passo.pergunta}
          </h3>
          {/* com a explicação acima, a ajuda curta só repetiria */}
          {passo.ajuda && !passo.explica && <p className="mt-0.5 text-[12.5px] leading-[18px] text-muted-foreground">{passo.ajuda}</p>}
        </div>
        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
          {n} de {total}
        </span>
      </div>
      <ul role="radiogroup" aria-labelledby={`pergunta-${passo.id}`} className="flex min-h-0 flex-1 flex-col overflow-y-auto px-2">
        {passo.opcoes.map((o) => (
          <li key={o.v} className="border-b last:border-b-0">
            <button
              type="button"
              role="radio"
              aria-checked={sel === o.v}
              onClick={() => setSel(o.v)}
              onDoubleClick={() => onResponder(o.v, o.t)}
              className={cn(
                "flex w-full items-start gap-2.5 rounded-md px-2 py-2.25 text-left outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50",
                sel === o.v && "bg-primary/5"
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border",
                  sel === o.v ? "border-primary bg-primary" : "border-input"
                )}
              >
                {sel === o.v && <span className="size-1.5 rounded-full bg-primary-foreground" />}
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="flex flex-wrap items-center gap-1.5 text-[13.5px] leading-5">
                  {o.t}
                  {o.rec && (
                    <Badge variant="secondary" className="bg-primary/10 font-normal text-primary">
                      Recomendado
                    </Badge>
                  )}
                </span>
                {o.d && <span className="text-[12.5px] leading-[17px] text-muted-foreground">{o.d}</span>}
              </span>
            </button>
          </li>
        ))}
        <li>
          <label
            className={cn(
              "flex items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-muted",
              sel === "__outra" && "bg-primary/5"
            )}
          >
            <span
              aria-hidden
              className={cn(
                "flex size-4 shrink-0 items-center justify-center rounded-full border",
                sel === "__outra" ? "border-primary bg-primary" : "border-input"
              )}
            >
              {sel === "__outra" && <span className="size-1.5 rounded-full bg-primary-foreground" />}
            </span>
            <input
              aria-label="Outra opção"
              placeholder={passo.outra ?? "Outra opção"}
              value={outra}
              onFocus={() => setSel("__outra")}
              onChange={(e) => {
                setOutra(e.target.value)
                setSel("__outra")
              }}
              onKeyDown={(e) => e.key === "Enter" && pode && enviar()}
              className="h-8 min-w-0 flex-1 bg-transparent text-[13.5px] outline-none placeholder:text-muted-foreground"
            />
          </label>
        </li>
      </ul>
      <div className="flex shrink-0 items-center justify-end gap-2 border-t px-3 py-2.5">
        <Button size="icon-sm" aria-label="Responder" disabled={!pode} onClick={enviar}>
          <ArrowUpIcon />
        </Button>
      </div>
    </section>
  )
}

/** O que está sendo construído, ao vivo: cada resposta preenche um campo na hora. */
function Previa({ titulo, linhas, atual }: { titulo: string; linhas: { id: string; rotulo: string; valor: ReactNode }[]; atual: string }) {
  return (
    <aside aria-label={titulo} className="flex flex-col gap-2 rounded-xl border bg-muted/40 p-4">
      <span className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">{titulo}</span>
      <dl className="flex flex-col gap-3">
        {linhas.map((l) => (
          <div
            key={l.id}
            className={cn("rounded-md px-2.5 py-2 transition-colors", l.id === atual && "bg-card ring-1 ring-primary/40")}
          >
            <dt className="text-xs text-muted-foreground">{l.rotulo}</dt>
            <dd className="mt-0.5 text-[13px] leading-[19px]">
              {l.valor ?? <span className="text-muted-foreground italic">a definir</span>}
            </dd>
          </div>
        ))}
      </dl>
    </aside>
  )
}

/** A casca das duas conversas: histórico, pergunta atual, resposta livre e a prévia ao lado. */
function Conversa({
  titulo,
  falas,
  passo,
  n,
  total,
  fim,
  previa,
  onResponder,
  aoConfigurarManualmente,
  respondeu,
  oque,
}: {
  titulo: string
  falas: Fala[]
  passo: Passo | null
  n: number
  total: number
  fim: ReactNode
  previa: ReactNode
  onResponder: (valor: string, rotulo: string) => void
  aoConfigurarManualmente: () => void
  /** Já há resposta a perder. */
  respondeu: boolean
  oque: "o agente" | "a variável"
}) {
  const { confirmar } = useConfig()
  const [livre, setLivre] = useState("")
  /*
    Trocar para o formulário começa do zero, para simplificar o desenvolvimento: o que foi
    respondido na conversa não vai junto. Por isso o aviso antes.
  */
  const irParaOFormulario = () => {
    if (!respondeu) {
      aoConfigurarManualmente()
      return
    }
    confirmar({
      titulo: "Continuar no formulário?",
      corpo: (
        <p>
          O que você respondeu até aqui não vai junto: o formulário de {oque} começa em branco.
        </p>
      ),
      acao: "Continuar no formulário",
      ok: aoConfigurarManualmente,
    })
  }
  const fundo = useRef<HTMLDivElement>(null)
  useEffect(() => {
    fundo.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [falas.length, passo?.id])
  const enviarLivre = () => {
    if (!livre.trim() || !passo) return
    onResponder(`__livre:${livre.trim()}`, livre.trim())
    setLivre("")
  }
  return (
    <Moldura
      titulo={titulo}
      acoesDoTopo={
        <Button variant="outline" size="sm" className="shadow-none" onClick={irParaOFormulario}>
          Configurar manualmente
        </Button>
      }
    >
      <div className="grid h-full min-h-0 grid-cols-1 gap-5 min-[760px]:grid-cols-[minmax(0,1fr)_280px]">
        <div className="flex min-h-0 flex-col gap-3">
          <div className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto pr-1">
            {falas.map((f, i) => (
              <Bolha key={i} fala={f} />
            ))}
            <div ref={fundo} />
          </div>
          {passo ? (
            <>
              <CartaoDaPergunta key={passo.id} passo={passo} n={n} total={total} onResponder={onResponder} />
              <div className="flex items-center gap-2 rounded-xl border bg-card px-3 py-1.5">
                <Input
                  aria-label="Responder com suas palavras"
                  placeholder="Ou responda com suas palavras…"
                  value={livre}
                  onChange={(e) => setLivre(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && enviarLivre()}
                  className="h-8 border-0 px-0 shadow-none focus-visible:ring-0"
                />
                <Button size="icon-sm" variant="ghost" aria-label="Enviar" disabled={!livre.trim()} onClick={enviarLivre}>
                  <ArrowUpIcon />
                </Button>
              </div>
            </>
          ) : (
            fim
          )}
        </div>
        <div className="max-[759px]:hidden">{previa}</div>
      </div>
    </Moldura>
  )
}

/** "Recomendado" na opção sugerida, e ela vai para o topo. */
function comRecomendada(opcoes: Opcao[], rec?: string): Opcao[] {
  if (!rec) return opcoes
  const a = opcoes.find((o) => o.v === rec)
  return a ? [{ ...a, rec: true }, ...opcoes.filter((o) => o.v !== rec)] : opcoes
}

/* ------------------------------------------------------------------ */
/* Aberturas                                                           */
/* ------------------------------------------------------------------ */

/* A conversa começa pelo nome da pessoa e explica o conceito antes da primeira pergunta:
   o que é, como funciona na plataforma e o que vai ser perguntado. */
const PRIMEIRO_NOME = USUARIO.name.split(" ")[0]

const ABERTURA_AGENTE: Fala[] = [
  {
    quem: "settle",
    texto: (
      <>
        Olá, {PRIMEIRO_NOME}. Vou ajudar você a criar um agente. Mas antes vou explicar o que é um agente e como ele
        funciona na plataforma.
      </>
    ),
  },
  {
    quem: "settle",
    texto: (
      <>
        Um <b>agente</b> é uma tarefa que a Settle faz sozinha em cada licitação, como uma pessoa do time a quem você
        delega um trabalho. Ele funciona assim: num <b>momento</b> que você escolhe (por exemplo, quando a licitação chega
        em Recomendadas), ele lê as <b>respostas das variáveis</b> de que precisa, faz o que você pediu e mostra o{" "}
        <b>resultado dentro da licitação</b>.
      </>
    ),
  },
  {
    quem: "settle",
    texto: (
      <>
        Para criar um, preciso saber o nome dele, o que ele faz, de qual variável ele precisa, quando ele trabalha e
        onde você vê o resultado. Vou perguntar uma de cada vez, e ao lado você vê o agente sendo montado. Se preferir,
        dá para <b>Configurar manualmente</b> a qualquer momento, e aí o formulário começa em branco.
      </>
    ),
  },
]

const ABERTURA_VARIAVEL: Fala[] = [
  {
    quem: "settle",
    texto: (
      <>
        Olá, {PRIMEIRO_NOME}. Vou ajudar você a criar uma variável. Mas antes vou explicar o que é uma variável e como ela
        funciona na plataforma.
      </>
    ),
  },
  {
    quem: "settle",
    texto: (
      <>
        Uma <b>variável</b> é uma pergunta que a Settle faz a todo edital, sempre do mesmo jeito, como &quot;o edital
        exige atestado?&quot;. Ela funciona assim: a Settle procura a resposta nos documentos de cada licitação e guarda
        essa resposta. Sozinha, a variável não faz nada: os <b>agentes</b> usam a resposta para decidir o que fazer.
      </>
    ),
  },
  {
    quem: "settle",
    texto: (
      <>
        Para criar uma, preciso saber cinco coisas: o nome, a pergunta, o formato da resposta, onde procurar e o que
        responder quando o edital não falar do assunto. Ao lado você vê a variável sendo montada. Se preferir, dá para{" "}
        <b>Configurar manualmente</b> a qualquer momento, e aí o formulário começa em branco.
      </>
    ),
  },
]

/* ------------------------------------------------------------------ */
/* Agente                                                              */
/* ------------------------------------------------------------------ */

/** O momento em frase, para confirmar a escolha. */
const MOMENTO_FRASE: Record<Momento, string> = {
  captura: "assim que a Settle capturar a licitação no portal",
  recomendadas: "quando a licitação chegar em Recomendadas",
  analise: "quando alguém enviar a licitação para análise",
  agendado: "no horário agendado, que você ajusta na revisão",
  demanda: "só quando alguém pedir",
}

/** O lugar provável do resultado, pelas palavras do pedido. */
function ondeProvavel(pedido: string): Onde | undefined {
  const p = normal(pedido)
  if (/mover|responsavel|descart|etapa/.test(p)) return "nenhum"
  if (/juridic|risco|clausula|impugna/.test(p)) return "juridica"
  if (/tecnic|componente|catalogo|especifica/.test(p) && !/atestado/.test(p)) return "tecnica"
  if (/habilita|atestado|document|certid/.test(p)) return "habilitacao"
  return undefined
}

/** A variável que já existe e parece servir ao pedido: a de mais palavras em comum. */
function variavelProvavel(pedido: string, vars: Record<string, { nome: string }>) {
  const p = normal(pedido)
  let melhor: { k: string; n: number } | null = null
  for (const [k, v] of Object.entries(vars)) {
    const n = normal(v.nome)
      .split(/\W+/)
      .filter((w) => w.length >= 5 && p.includes(w.slice(0, 6))).length
    if (n && (!melhor || n > melhor.n)) melhor = { k, n }
  }
  return melhor?.k ?? null
}

export function ConversaAgente({ varInicial }: { varInicial?: string }) {
  const { cfg, irParaTela, criarVarRapida, abrirComVolta } = useAgentes()
  /* Clicar numa variável citada na conversa abre a variável por cima; fechar volta para
     a conversa no ponto em que estava. Se ela foi excluída, abre em branco com o nome,
     para recriar. */
  const abrirVar = (k: string) =>
    abrirComVolta(
      cfg.vars[k]
        ? { tipo: "variavel", k }
        : {
            tipo: "variavel",
            k: null,
            inicial: { nome: cfg.varsEx[k] ?? k, tipo: "sim ou não", prompt: "", fontes: [], resto: true, padrao: "" },
          }
    )
  const [r, setR] = useState<Rascunho>(() => rascunhoNovo("texto", false))
  const [pedido, setPedido] = useState("")
  const [varK, setVarK] = useState<string | null>(null)
  const [id, setId] = useState("nome")
  const [falas, setFalas] = useState<Fala[]>(ABERTURA_AGENTE)

  const temRep = !!(r.gatilho && REP_POR_GATILHO[r.gatilho])
  const ids = ["nome", "pedido", "variavel", "quando", ...(temRep ? ["repete"] : []), "onde", "aprovacao"]
  /* Quem acabou de criar a variável já chega com ela na mão. */
  const sugerida = varInicial && cfg.vars[varInicial] ? varInicial : pedido ? variavelProvavel(pedido, cfg.vars) : null
  const nomeNova = pedido ? cap(semPonto(pedido)).slice(0, 48) : ""

  const PASSOS: Record<string, Passo> = {
    nome: {
      id: "nome",
      obrigatorio: true,
      explica: (
        <>
          Primeiro, um nome. Ele aparece na lista de agentes e no topo do resultado dentro da licitação, então vale um
          nome que diga o que o agente faz. Pode ser uma pergunta, como &quot;Exige atestado técnico?&quot;.
        </>
      ),
      pergunta: "Como vai se chamar o agente?",
      outra: "Escreva o nome do agente",
      opcoes: [
        { v: "Exige atestado técnico?", t: "Exige atestado técnico?" },
        { v: "Documentos de habilitação em dia?", t: "Documentos de habilitação em dia?" },
        { v: "Score alto vai para análise", t: "Score alto vai para análise" },
      ],
    },
    pedido: {
      id: "pedido",
      obrigatorio: true,
      explica: <>Agora, o trabalho em si. Escreva como pediria para alguém do time: o que ele deve verificar ou fazer em cada licitação.</>,
      pergunta: "O que você quer que o agente faça em cada licitação?",
      ajuda: "Escreva como pediria para uma pessoa do time, ou escolha um exemplo.",
      outra: "Escreva o que o agente deve fazer",
      opcoes: [
        { v: "Avisar quando o edital exigir atestado de capacidade técnica", t: "Avisar quando o edital exigir atestado de capacidade técnica" },
        { v: "Conferir se temos todos os documentos de habilitação", t: "Conferir se temos todos os documentos de habilitação" },
        { v: "Mover para Em análise as licitações com Score acima de 70", t: "Mover para Em análise as licitações com Score acima de 70" },
      ],
    },
    variavel: {
      id: "variavel",
      obrigatorio: true,
      explica: (
        <>
          Para fazer isso, o agente precisa de uma resposta que está no edital, e quem traz essa resposta é uma{" "}
          <b>variável</b>: uma pergunta que a Settle faz a todo edital, sempre igual. Ex.: a variável{" "}
          <i>Atestado exigido</i> responde sim ou não em cada licitação. O agente lê essa resposta e decide o que fazer.
        </>
      ),
      pergunta: sugerida
        ? `Para isso, o agente precisa de uma resposta do edital. Uso a variável "${cfg.vars[sugerida].nome}"?`
        : "Para isso, o agente precisa de uma resposta do edital. Crio uma variável nova?",
      ajuda: "A variável é a pergunta que a Settle faz a todo edital. O agente usa a resposta dela.",
      outra: "O que o agente precisa saber? Ex.: se exige visita técnica",
      opcoes: [
        ...(sugerida
          ? [{ v: `usar:${sugerida}`, t: `Usar "${cfg.vars[sugerida].nome}"`, d: `${FORMATO_VAR[cfg.vars[sugerida].tipo].t} · ${cfg.vars[sugerida].prompt}`, rec: true }]
          : []),
        { v: "nova", t: `Criar a variável "${nomeNova}"`, d: "Formato sim ou não, procurando primeiro no edital. Dá para ajustar depois.", rec: !sugerida },
        { v: "nenhuma", t: "Não usar variável", d: "O agente trabalha só com o que está escrito na instrução." },
      ],
    },
    quando: {
      id: "quando",
      obrigatorio: true,
      explica: (
        <>
          Agora, <b>quando</b> o agente trabalha. Na Settle, uma licitação passa por momentos: é <b>capturada</b> no
          portal, <b>chega em Recomendadas</b> quando a Settle a escolhe para você e vai para Em andamento quando alguém a{" "}
          <b>envia para análise</b>. O agente trabalha em cada licitação que passar pelo momento que você escolher.
        </>
      ),
      pergunta: "Quando o agente deve trabalhar?",
      ajuda: "Ele trabalha em cada licitação que passar por esse momento.",
      outra: "Descreva o momento",
      opcoes: comRecomendada(
        (Object.keys(GATILHOS) as Momento[]).map((g) => ({ v: g, t: GATILHOS[g], d: DESC_GATILHO[g] })),
        "recomendadas"
      ),
    },
    repete: {
      id: "repete",
      obrigatorio: true,
      explica: (
        <>
          Depois de publicada, uma licitação pode mudar: retificação, impugnação aceita, esclarecimento, nova data. Se o
          agente trabalhar de novo nessas horas, o resultado acompanha o edital mais recente.
        </>
      ),
      pergunta: "Trabalhar de novo quando o edital mudar?",
      outra: "Descreva quando repetir",
      opcoes: r.gatilho && REP_POR_GATILHO[r.gatilho]
        ? comRecomendada(
            (Object.keys(REP_POR_GATILHO[r.gatilho]!) as Repeticao[]).map((k) => ({ v: k, t: REP_POR_GATILHO[r.gatilho as Momento]![k].t, d: REP_POR_GATILHO[r.gatilho as Momento]![k].d })),
            "sempre"
          )
        : [],
    },
    onde: {
      id: "onde",
      obrigatorio: true,
      explica: (
        <>
          Onde você vai ver o resultado. O que o agente produz aparece <b>dentro da licitação</b>, num bloco com o nome
          dele e de onde tirou a resposta no edital. Escolha a aba em que esse bloco faz mais sentido. Se o agente só faz ações,
          como mover a licitação, não há bloco: o que ele fez fica no histórico dele.
        </>
      ),
      pergunta: "Onde o resultado deve aparecer?",
      ajuda: "O lugar da licitação onde você vai ver o que o agente produziu.",
      outra: "Descreva onde",
      opcoes: comRecomendada(
        (["habilitacao", "tecnica", "juridica", "checklist", "score", "nenhum"] as Onde[]).map((k) => ({ v: k, t: ONDE[k].t, d: ONDE[k].d })),
        ondeProvavel(pedido)
      ),
    },
    aprovacao: {
      id: "aprovacao",
      obrigatorio: true,
      explica: (
        <>
          Por último, segurança. Ler o edital e mostrar um resultado não mudam nada na licitação, por isso nunca pedem
          aprovação. Mas um agente também pode <b>agir</b>: mover a licitação de etapa, marcar um responsável,
          descartar. Você decide se essas ações esperam alguém aprovar, na aba <b>Aprovações</b>.
        </>
      ),
      pergunta: "Se o agente for mudar algo na licitação, ele precisa pedir aprovação?",
      ajuda: "Vale para ações como mover de etapa ou marcar responsável. Ler o edital nunca precisa de aprovação.",
      outra: "Descreva como aprovar",
      opcoes: comRecomendada(
        (Object.keys(APROVACAO) as ModoAprovacao[]).map((k) => ({ v: k, t: APROVACAO[k].t, d: APROVACAO[k].d })),
        r.onde.includes("nenhum") ? "manual" : "auto"
      ),
    },
  }

  const passo = id === "fim" ? null : PASSOS[id]
  const proximo = (atualId: string, idsAgora = ids) => {
    const i = idsAgora.indexOf(atualId)
    setId(idsAgora[i + 1] ?? "fim")
  }
  const registrar = (p: Passo, resposta: ReactNode, eco?: ReactNode) =>
    setFalas((f) => [
      ...f,
      ...(p.explica ? [{ quem: "settle" as const, texto: p.explica }] : []),
      { quem: "settle", texto: <b className="font-semibold">{p.pergunta}</b> },
      { quem: "voce", texto: resposta },
      ...(eco ? [{ quem: "settle" as const, texto: eco }] : []),
    ])

  const responder = (valor: string, rotulo: string) => {
    if (!passo) return
    const livre = valor.startsWith("__livre:") ? valor.slice(8) : null
    let eco: ReactNode = null
    if (id === "nome") {
      const t = cap(semPontoFinal(livre ?? valor)).slice(0, 60)
      eco = <>Ótimo. O agente vai aparecer como <b>{t}</b>.</>
      setR((x) => ({ ...x, nome: t }))
    }
    if (id === "pedido") {
      const t = livre ?? valor
      eco = <>Entendi. Vou montar um agente para: <b>{semPonto(t).charAt(0).toLowerCase() + semPonto(t).slice(1)}</b>.</>
      setPedido(t)
      setR((x) => ({ ...x, nome: x.nome || cap(semPonto(t)).slice(0, 60), texto: `${cap(semPonto(t))}.` }))
    }
    if (id === "variavel") {
      let k: string | null = null
      if (valor.startsWith("usar:")) k = valor.slice(5)
      if (valor === "nova" || livre) {
        const nome = livre ? cap(semPonto(livre)).slice(0, 48) : nomeNova
        k = criarVarRapida({ nome, tipo: "sim ou não", prompt: livre ?? cap(semPonto(pedido)), fonte: "Edital e anexos" })
        if (k) eco = <>Criei a variável <VarChip k={k} aoAbrir={abrirVar} />. Ela também fica em Variáveis, para outros agentes. Clique nela para ajustar o que ela procura.</>
      }
      if (k && valor.startsWith("usar:")) eco = <>Certo. Em cada licitação, o agente vai ler a resposta de <VarChip k={k} aoAbrir={abrirVar} /> para decidir. Clique nela para ver ou ajustar.</>
      if (valor === "nenhuma") eco = <>Sem variável, o agente se baseia só no que está escrito na instrução, e o resultado pode variar mais de uma licitação para outra.</>
      setVarK(k)
      setR((x) => ({ ...x, texto: `${cap(semPonto(pedido))}.${k ? ` Use {{${k}}}.` : ""}` }))
    }
    if (id === "quando") {
      const g = (livre ? "recomendadas" : valor) as Momento
      eco = livre
        ? <>Não tenho esse momento na lista; deixei <b>{GATILHOS[g]}</b>. Você pode trocar na revisão.</>
        : <>Então o agente vai trabalhar <b>{MOMENTO_FRASE[g]}</b>.</>
      const novoRep = !!REP_POR_GATILHO[g]
      setR((x) => ({ ...x, gatilho: g }))
      registrar(passo, rotulo, eco)
      // a lista de passos muda com o momento: com ou sem a pergunta de repetição
      proximo("quando", ["nome", "pedido", "variavel", "quando", ...(novoRep ? ["repete"] : []), "onde", "aprovacao"])
      return
    }
    if (id === "repete") {
      const rp = (livre ? "sempre" : valor) as Repeticao
      eco = rp === "sempre" ? <>Combinado: se o edital mudar, o agente refaz o trabalho.</> : <>Combinado: ele trabalha uma vez só em cada licitação.</>
      setR((x) => ({ ...x, repete: rp }))
    }
    if (id === "onde") {
      const o = (livre ? ondeProvavel(livre) ?? "habilitacao" : valor) as Onde
      eco = o === "nenhum"
        ? <>Sem bloco na licitação: o que o agente fizer fica no histórico dele.</>
        : <>O resultado vai aparecer na licitação, em <b>{ONDE[o].t}</b>. Na revisão dá para marcar outras abas também.</>
      setR((x) => ({ ...x, onde: [o] }))
    }
    if (id === "aprovacao") {
      const a = (livre ? "manual" : valor) as ModoAprovacao
      eco = {
        manual: <>Toda ação do agente vai esperar alguém aprovar em Aprovações.</>,
        auto: <>As ações do dia a dia seguem sozinhas; as arriscadas, como descartar, esperam aprovação.</>,
        nunca: <>O agente vai agir sem pedir aprovação. Vale conferir o que ele fez nas primeiras licitações.</>,
      }[a]
      setR((x) => ({ ...x, aprovacao: a }))
    }
    registrar(passo, rotulo, eco)
    proximo(id)
  }

  const revisar = () => irParaTela({ tipo: "novo", rascunho: r })
  const n = Math.min(ids.indexOf(id) + 1 || ids.length, ids.length)
  const respondeu = falas.length > ABERTURA_AGENTE.length

  return (
    <Conversa
      titulo="Criar agente conversando"
      falas={falas}
      passo={passo}
      n={n}
      total={ids.length}
      onResponder={responder}
      respondeu={respondeu}
      oque="o agente"
      aoConfigurarManualmente={() => irParaTela({ tipo: "modelos" })}
      fim={
        <div className="flex flex-col gap-3 rounded-xl border bg-card p-4">
          <p className="text-[13.5px] leading-5">
            Pronto. O agente está montado ao lado: ele faz o que você pediu, usando a resposta da variável, no momento que você
            escolheu, e mostra o resultado no lugar certo. Revise os campos e crie: nada é criado antes disso.
          </p>
          <div className="flex gap-2">
            <Button onClick={revisar}>Revisar e criar</Button>
          </div>
        </div>
      }
      previa={
        <Previa
          titulo="Agente"
          atual={id}
          linhas={[
            { id: "nome", rotulo: "Nome", valor: r.nome || null },
            {
              id: "pedido",
              rotulo: "O que o agente faz",
              valor: r.texto ? (
                <>
                  {cap(semPonto(pedido))}.
                  {varK && cfg.vars[varK] && (
                    <>
                      {" "}Use <VarChip k={varK} aoAbrir={abrirVar} />.
                    </>
                  )}
                </>
              ) : null,
            },
            { id: "variavel", rotulo: "Variável usada", valor: varK && cfg.vars[varK] ? <VarChip k={varK} aoAbrir={abrirVar} /> : null },
            {
              id: "quando",
              rotulo: "Quando trabalha",
              valor: r.gatilho ? (
                <span className="flex flex-col items-start gap-1">
                  <TagGatilho agente={{ gatilho: GATILHOS[r.gatilho], agenda: r.agenda }} />
                  {temRep && r.repete === "sempre" && <span className="text-xs text-muted-foreground">e de novo quando o edital mudar</span>}
                </span>
              ) : null,
            },
            { id: "onde", rotulo: "Onde o resultado aparece", valor: r.onde.length ? r.onde.map((k) => ONDE[k].t).join(", ") : null },
            { id: "aprovacao", rotulo: "Aprovação das ações", valor: r.aprovacao ? APROVACAO[r.aprovacao].t : null },
          ]}
        />
      }
    />
  )
}

/* ------------------------------------------------------------------ */
/* Variável                                                            */
/* ------------------------------------------------------------------ */

/** Uma pergunta a partir do nome: "Exige visita técnica" vira "O edital exige visita técnica?". */
function perguntaDoNome(nome: string) {
  const n = semPonto(nome)
  const verbo = /^(exige|permite|tem|aceita|admite|prevê|preve)\b/i.test(n)
  return verbo ? `O edital ${n.charAt(0).toLowerCase() + n.slice(1)}?` : `Qual ${n.charAt(0).toLowerCase() + n.slice(1)} o edital pede?`
}

function formatoProvavel(t: string): TipoVar {
  const p = normal(t)
  if (/(^|\s)(se|exige|exigira|permite|tem|ha)\s/.test(p)) return "sim ou não"
  if (/data|prazo final|dia da|quando/.test(p)) return "data"
  if (/valor|quant|numero|total|percentual|prazo/.test(p)) return "número"
  return "texto"
}

export function ConversaVariavel() {
  const { irParaTela, criarVar, abrirModal } = useAgentes()
  const [d, setD] = useState<DadosDaVariavel>({ nome: "", tipo: "sim ou não", prompt: "", fontes: [], resto: true, padrao: "" })
  const [pergunta, setPergunta] = useState("")
  const [tipoDefinido, setTipoDefinido] = useState(false)
  const [id, setId] = useState("nome")
  const [falas, setFalas] = useState<Fala[]>(ABERTURA_VARIAVEL)
  const ids = ["nome", "pergunta", "formato", "fonte", "vazio"]

  const PASSOS: Record<string, Passo> = {
    nome: {
      id: "nome",
      obrigatorio: true,
      explica: (
        <>
          Primeiro, um nome curto. É por ele que você vai achar a variável quando escrever o que um agente faz, e é ele
          que aparece no card e no e-mail, se ela for parar lá.
        </>
      ),
      pergunta: "Como vai se chamar a variável?",
      outra: "Escreva o nome da variável",
      opcoes: [
        { v: "Exige visita técnica", t: "Exige visita técnica" },
        { v: "Prazo de entrega", t: "Prazo de entrega" },
        { v: "Permite consórcio", t: "Permite consórcio" },
      ],
    },
    pergunta: {
      id: "pergunta",
      obrigatorio: true,
      explica: (
        <>
          Agora, a pergunta que a Settle vai fazer a todo edital. Escreva como alguém perguntaria ao ler o edital:
          quanto mais claro, mais certa a resposta.
        </>
      ),
      pergunta: "O que a Settle deve perguntar a cada edital?",
      outra: "Escreva a pergunta",
      opcoes: d.nome
        ? [{ v: perguntaDoNome(d.nome), t: perguntaDoNome(d.nome), rec: true }]
        : [{ v: "O edital exige visita técnica?", t: "O edital exige visita técnica?" }],
    },
    formato: {
      id: "formato",
      explica: (
        <>
          Agora escolha o formato da resposta. Use <b>sim ou não</b> quando a pergunta for fechada, <b>número</b> quando
          o agente for comparar valores, <b>data</b> quando for um dia do calendário e <b>texto</b> quando você quiser
          ler o trecho do edital.
        </>
      ),
      pergunta: "Como a resposta deve chegar?",
      ajuda: "É assim que os agentes vão receber a resposta.",
      outra: "Descreva o formato",
      opcoes: comRecomendada(
        TIPOS_VAR.map((t) => ({ v: t, t: FORMATO_VAR[t].t, d: FORMATO_VAR[t].d })),
        pergunta ? formatoProvavel(pergunta) : undefined
      ),
    },
    fonte: {
      id: "fonte",
      obrigatorio: true,
      explica: (
        <>
          Onde a Settle procura primeiro. Cada licitação tem vários documentos, e a resposta costuma estar num deles.
          Começar pelo certo deixa a resposta mais precisa. Se não achar ali, ela procura nos outros arquivos.
        </>
      ),
      pergunta: "Onde a Settle deve procurar primeiro?",
      ajuda: "Se não achar ali, ela procura nos outros arquivos da licitação.",
      outra: "Outro documento",
      opcoes: comRecomendada(
        FONTES.map((f) => ({ v: f, t: f, d: DESC_FONTE[f] })),
        "Edital e anexos"
      ),
    },
    vazio: {
      id: "vazio",
      obrigatorio: true,
      explica: (
        <>
          Às vezes o edital não fala do assunto. Diga o que a variável responde nesse caso, para os agentes não ficarem
          sem resposta. Ex.: se o edital não fala de visita técnica, normalmente é porque não exige.
        </>
      ),
      pergunta: "E se o edital não falar disso, o que responder?",
      ajuda: "É o que os agentes recebem quando a Settle procura e não encontra.",
      outra: "Escreva a resposta",
      opcoes:
        d.tipo === "sim ou não"
          ? comRecomendada(
              [
                { v: "não", t: "Responder não", d: "Se o edital não fala nisso, conta como não." },
                { v: "sim", t: "Responder sim", d: "Se o silêncio do edital deve contar como sim." },
              ],
              "não"
            )
          : comRecomendada(
              [
                { v: d.tipo === "número" ? "0" : "não encontrado", t: d.tipo === "número" ? "Responder 0" : "Responder não encontrado" },
                { v: d.tipo === "número" ? "-1" : "não se aplica", t: d.tipo === "número" ? "Responder -1" : "Responder não se aplica", d: "Para diferenciar de um valor que existe." },
              ],
              d.tipo === "número" ? "0" : "não encontrado"
            ),
    },
  }

  const passo = id === "fim" ? null : PASSOS[id]
  const proximo = () => setId(ids[ids.indexOf(id) + 1] ?? "fim")

  const responder = (valor: string, rotulo: string) => {
    if (!passo) return
    const livre = valor.startsWith("__livre:") ? valor.slice(8) : null
    const v = livre ?? valor
    if (id === "pergunta") {
      setPergunta(v)
      setD((x) => ({ ...x, prompt: cap(v.trim()), tipo: tipoDefinido ? x.tipo : formatoProvavel(`${x.nome} ${v}`) }))
    }
    if (id === "nome") setD((x) => ({ ...x, nome: cap(semPontoFinal(v)).slice(0, 48), tipo: tipoDefinido ? x.tipo : formatoProvavel(v) }))
    if (id === "formato") {
      setTipoDefinido(true)
      setD((x) => ({ ...x, tipo: (livre ? formatoProvavel(livre) : valor) as TipoVar, padrao: "" }))
    }
    if (id === "fonte") setD((x) => ({ ...x, fontes: [FONTES.includes(v) ? v : "Edital e anexos"] }))
    if (id === "vazio") setD((x) => ({ ...x, padrao: v }))
    const eco: ReactNode = {
      nome: <>Ótimo. Nas instruções dos agentes, ela vai aparecer como <b>{cap(semPontoFinal(v)).slice(0, 48)}</b>.</>,
      pergunta: <>Entendi. A Settle vai fazer essa pergunta a todo edital.</>,
      formato: <>Combinado: a resposta vai chegar como <b>{FORMATO_VAR[(livre ? formatoProvavel(livre) : valor) as TipoVar]?.t ?? "texto"}</b>.</>,
      fonte: <>Certo: primeiro em <b>{FONTES.includes(v) ? v : "Edital e anexos"}</b>, depois nos outros arquivos.</>,
      vazio: v ? <>Quando o edital não falar disso, a resposta vai ser <b>{v}</b>.</> : <>Quando o edital não falar disso, os agentes recebem o campo vazio.</>,
    }[id]
    setFalas((f) => [
      ...f,
      ...(passo.explica ? [{ quem: "settle" as const, texto: passo.explica }] : []),
      { quem: "settle", texto: <b className="font-semibold">{passo.pergunta}</b> },
      { quem: "voce", texto: rotulo },
      ...(eco ? [{ quem: "settle" as const, texto: eco }] : []),
    ])
    proximo()
  }

  const dados = () => ({ ...d, fontes: d.fontes.length ? d.fontes : ["Edital e anexos"] })
  const revisar = () => irParaTela({ tipo: "variavel", k: null, inicial: dados() })
  /* Criar e emendar no agente: a variável sozinha não faz nada, e esse é o passo seguinte. */
  const criarEUsar = () => {
    const r = criarVar(dados())
    if ("erros" in r) {
      revisar()
      return
    }
    abrirModal({ tipo: "conversa-agente", varInicial: r.k })
  }
  const n = Math.min(ids.indexOf(id) + 1 || ids.length, ids.length)
  const respondeu = falas.length > ABERTURA_VARIAVEL.length

  return (
    <Conversa
      titulo="Criar variável conversando"
      falas={falas}
      passo={passo}
      n={n}
      total={ids.length}
      onResponder={responder}
      respondeu={respondeu}
      oque="a variável"
      aoConfigurarManualmente={() => irParaTela({ tipo: "variavel", k: null })}
      fim={
        <div className="flex flex-col gap-3 rounded-xl border bg-card p-4">
          <p className="text-[13.5px] leading-5">
            Pronto, a variável está montada. Depois de criar, ela ainda não faz nada sozinha: quem usa a resposta dela é
            um agente.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={revisar}>Revisar e criar</Button>
            <Button variant="outline" className="shadow-none" onClick={criarEUsar}>
              Criar e usar em um agente
            </Button>
          </div>
        </div>
      }
      previa={
        <Previa
          titulo="Variável"
          atual={id}
          linhas={[
            { id: "nome", rotulo: "Nome", valor: d.nome || null },
            { id: "pergunta", rotulo: "O que procurar no edital", valor: d.prompt || null },
            { id: "formato", rotulo: "Formato da resposta", valor: tipoDefinido ? FORMATO_VAR[d.tipo].t : null },
            { id: "fonte", rotulo: "Onde procurar primeiro", valor: d.fontes[0] ?? null },
            {
              id: "vazio",
              rotulo: "Quando não encontrar",
              valor: id === "fim" || ids.indexOf(id) > ids.indexOf("vazio") ? d.padrao || "sem resposta" : null,
            },
          ]}
        />
      }
    />
  )
}
