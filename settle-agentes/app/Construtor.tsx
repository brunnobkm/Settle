// Construtor de critério: conversa à esquerda, artefato revisável à direita.
// "A conversa é uma coisa, o que ele construiu é outra" (Alice, semanal de 26/08).

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

import {
  LICITACOES_PREVIEW,
  PASSOS,
  formatarReais,
  novaRegra,
  pontosDaRegra,
  proximoPasso,
  type CampoRegra,
  type Opcao,
  type Regra,
  type TipoRegra,
} from "./dados"

type Mensagem = { id: number; quem: "bot" | "me"; conteudo: ReactNode }

/** A que pergunta as respostas rápidas visíveis respondem. */
type Contexto =
  | { tipo: "inicio" }
  | { tipo: "ajustar" }
  | { tipo: "passo"; passo: CampoRegra }
  | { tipo: "preview" }
  | { tipo: "ativar" }

type Respostas = { contexto: Contexto; opcoes: Opcao[] }

type Status = "Rascunho" | "Em construção" | "Pronta para ativar"
type Vista = "fluxo" | "texto"

const PAUSA = 260 // ms entre a resposta e a próxima pergunta
const PAUSA_CURTA = 200

const OPCOES_INICIO: Opcao[] = [
  { t: "Se a CAPAG do órgão for A ou B, somar 10 pontos", tipo: "capag" },
  { t: "Se a frota exigida for acima de 100 veículos, somar 10 pontos", tipo: "veic" },
]

const OPCOES_AJUSTAR: Opcao[] = [
  { t: "A pontuação" },
  { t: "O que fazer quando não encontra o dado" },
  { t: "Quando ele roda" },
]

function estadoInicial(existente: string | null): { msgs: Mensagem[]; respostas: Respostas } {
  return existente
    ? {
        msgs: [{ id: 0, quem: "bot", conteudo: "Esse critério está ativo desde 12/08/2026 e rodou em 148 licitações. O que você quer mudar nele?" }],
        respostas: { contexto: { tipo: "ajustar" }, opcoes: OPCOES_AJUSTAR },
      }
    : {
        msgs: [
          {
            id: 0,
            quem: "bot",
            conteudo:
              "Me diga em uma frase o que você quer que eu avalie. Pode escrever do jeito que você explicaria para alguém da sua equipe.",
          },
        ],
        respostas: { contexto: { tipo: "inicio" }, opcoes: OPCOES_INICIO },
      }
}

export function Construtor({
  aberto,
  onAbertoChange,
  existente,
  onAtivar,
}: {
  aberto: boolean
  onAbertoChange: (aberto: boolean) => void
  /** Nome do critério ao ajustar um existente; null para um critério novo. */
  existente: string | null
  onAtivar: (regra: Regra, recalcular: boolean) => void
}) {
  const [inicial] = useState(() => estadoInicial(existente))
  const [msgs, setMsgs] = useState<Mensagem[]>(inicial.msgs)
  const [respostas, setRespostas] = useState<Respostas | null>(inicial.respostas)
  const [regra, setRegra] = useState<Regra | null>(null)
  const [passoAtual, setPassoAtual] = useState<CampoRegra | null>(null)
  const [vista, setVista] = useState<Vista>("fluxo")
  const [recente, setRecente] = useState<CampoRegra | null>(null)
  const [preview, setPreview] = useState(false)
  const [status, setStatus] = useState<Status>("Rascunho")
  const [pronta, setPronta] = useState(false)
  const [texto, setTexto] = useState("")

  const seq = useRef(1)
  const timers = useRef<number[]>([])
  const rolagem = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const lista = timers.current
    return () => lista.forEach((t) => window.clearTimeout(t))
  }, [])

  // a conversa acompanha a última mensagem
  useEffect(() => {
    const el = rolagem.current
    if (el) el.scrollTop = el.scrollHeight
  }, [msgs, respostas])

  /* ---------------- conversa ---------------- */

  function depois(ms: number, fn: () => void) {
    timers.current.push(window.setTimeout(fn, ms))
  }

  function falar(quem: Mensagem["quem"], conteudo: ReactNode) {
    const id = seq.current++
    setMsgs((m) => [...m, { id, quem, conteudo }])
  }

  function perguntar(passo: CampoRegra, r: Regra) {
    setPassoAtual(passo)
    falar("bot", PASSOS[passo].pergunta(r))
    setRespostas({ contexto: { tipo: "passo", passo }, opcoes: PASSOS[passo].opcoes(r) })
  }

  function aplicar(passo: CampoRegra, valor: string, r: Regra) {
    const nova = { ...r, [passo]: valor }
    setRegra(nova)
    setRecente(passo)
    setPreview(false)
    return nova
  }

  function seguir(r: Regra) {
    const prox = proximoPasso(r)
    depois(PAUSA, () => (prox ? perguntar(prox, r) : concluir()))
  }

  function concluir() {
    setPassoAtual(null)
    falar(
      "bot",
      "Pronto, a regra está completa. Antes de ativar, rode em algumas licitações reais para ver se o resultado bate com o que você faria na mão."
    )
    setPronta(true)
    setStatus("Pronta para ativar")
  }

  function iniciar(frase: string, tipo?: TipoRegra) {
    const t = tipo ?? (/capag/i.test(frase) ? "capag" : "veic")
    const nome = t === "capag" ? "Saúde financeira do órgão" : "Porte da frota exigida"
    const r = novaRegra(nome, t)
    setRegra(r)
    setRecente(null)
    setStatus("Em construção")
    falar(
      "bot",
      <>
        Vou chamar esse critério de <b>{nome}</b>. Você renomeia depois se quiser.
      </>
    )
    depois(PAUSA, () => perguntar("fonte", r))
  }

  /** Regra atual do critério existente (o protótipo parte sempre da CAPAG). */
  function regraExistente(nome: string): Regra {
    return {
      ...novaRegra(nome, "capag"),
      fonte: "Base do Tesouro Nacional + variável Esfera",
      federal: 'Federal: 0 ponto, com a nota "não se aplica" no Resumo',
      gatilho: "Toda vez que a licitação for enviada para análise",
      saida: `Score, no critério "${nome}"`,
      pontos: "CAPAG A ou B: 10 pontos · CAPAG C ou D: 0 ponto",
      semDado: "Não encontrado: 0 ponto, sinalizado para revisão manual",
    }
  }

  function escolher(o: Opcao) {
    if (!respostas) return
    const { contexto } = respostas
    setRespostas(null)

    switch (contexto.tipo) {
      case "inicio":
        falar("me", o.t)
        iniciar(o.t, o.tipo)
        break
      case "ajustar": {
        falar("me", o.t)
        const alvo: CampoRegra = /pontuação/i.test(o.t) ? "pontos" : /roda/i.test(o.t) ? "gatilho" : "semDado"
        const r = { ...regraExistente(existente ?? ""), [alvo]: null }
        setRegra(r)
        setRecente(null)
        depois(PAUSA_CURTA, () => perguntar(alvo, r))
        break
      }
      case "passo":
        if (!regra) return
        falar("me", o.t)
        seguir(aplicar(contexto.passo, o.v ?? o.t, regra))
        break
      case "preview":
        if (/ativar/.test(o.t)) pedirAtivacao()
        else setPreview(false)
        break
      case "ativar":
        if (!regra) return
        falar("me", o.t)
        onAtivar(regra, /Recalcular/.test(o.t))
        break
    }
  }

  function ajustarPasso(passo: CampoRegra) {
    if (!regra) return
    const r = { ...regra, [passo]: null }
    setRegra(r)
    setRespostas(null)
    setRecente(null)
    setPreview(false)
    falar("me", "Quero mudar isso")
    depois(PAUSA_CURTA, () => perguntar(passo, r))
  }

  function enviar(e: FormEvent) {
    e.preventDefault()
    const frase = texto.trim()
    if (!frase) return
    setTexto("")
    setRespostas(null)
    falar("me", frase)
    if (!regra) {
      iniciar(frase)
    } else if (passoAtual) {
      seguir(aplicar(passoAtual, frase, regra))
    } else {
      falar(
        "bot",
        <>
          Anotado. Se quiser mudar algum pedaço específico, use o botão <b>Ajustar</b> no bloco correspondente ao lado.
        </>
      )
    }
  }

  /* ---------------- pré-visualizar e ativar ---------------- */

  function preVisualizar() {
    setPreview(true)
    falar(
      "bot",
      "Rodei em três licitações da sua carteira, sem alterar nada nelas. Se algum resultado te surpreendeu, é sinal de que a regra ainda não está do jeito que você faria na mão."
    )
    setRespostas({ contexto: { tipo: "preview" }, opcoes: [{ t: "Voltar para a regra" }, { t: "Está certo, quero ativar" }] })
  }

  function pedirAtivacao() {
    setRespostas(null)
    falar(
      "bot",
      <>
        Antes de ativar: essa regra usa a variável <b>Esfera</b>, que já é usada no Resumo e no match, e a variável{" "}
        <b>CAPAG</b>, hoje na v3. Você tem <b>14 licitações em aberto</b> que foram analisadas sem esse critério. O que
        faço com elas?
      </>
    )
    setRespostas({
      contexto: { tipo: "ativar" },
      opcoes: [
        { t: "Recalcular as 14", extra: "o score delas pode mudar" },
        { t: "Valer só para novas", extra: "nada muda no que já está aberto" },
      ],
    })
  }

  /* ---------------- render ---------------- */

  const tituloArtefato = preview && regra ? "Resultado em 3 licitações reais" : (regra?.nome ?? "A regra que estou construindo")
  const custo = formatarReais(regra?.custo ?? 0)
  const volume = regra ? (/match/.test(regra.gatilho ?? "") ? "cerca de 320 por mês" : "cerca de 148 por mês") : null

  function corpoDoArtefato(v: Vista) {
    if (!regra) {
      return (
        <Empty className="border border-dashed border-foreground/20 px-6 py-10">
          <EmptyHeader className="max-w-md gap-1">
            <EmptyTitle className="text-sm font-semibold">Nada construído ainda</EmptyTitle>
            <EmptyDescription className="text-[13px] leading-[19px]">
              Conforme você responder, a regra aparece aqui. Você pode revisar, ajustar cada pedaço e ver como fluxo ou
              como texto antes de ativar.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )
    }
    if (preview) return <PreVisualizacao regra={regra} />
    return v === "fluxo" ? (
      <Fluxo regra={regra} recente={recente} onAjustar={ajustarPasso} />
    ) : (
      <Texto regra={regra} />
    )
  }

  return (
    <Dialog open={aberto} onOpenChange={onAbertoChange}>
      <DialogContent
        showCloseButton={false}
        className="top-5 bottom-5 flex w-[calc(100%-40px)] max-w-310 translate-y-0 flex-col gap-0 overflow-hidden rounded-[14px] bg-background p-0 sm:max-w-310"
      >
        <div className="flex flex-none items-center gap-3 border-b px-4.5 py-3.5">
          <div className="min-w-0 flex-1">
            <DialogTitle className="text-[17px] leading-6 font-semibold">
              {existente ? `Ajustar: ${existente}` : "Novo critério de score"}
            </DialogTitle>
            <DialogDescription className="text-[13px]">
              {existente
                ? "Diga o que quer mudar. A regra atual continua valendo até você salvar."
                : "Descreva a regra em palavras. Vou te perguntar o que faltar."}
            </DialogDescription>
          </div>
          <Badge variant="secondary" className="rounded-md">
            {status}
          </Badge>
          <DialogClose asChild>
            <Button variant="outline" size="icon-sm" aria-label="Fechar o construtor">
              <XIcon />
            </Button>
          </DialogClose>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-[minmax(340px,44%)_1fr] max-[1000px]:grid-cols-1 max-[1000px]:grid-rows-[minmax(0,46%)_minmax(0,54%)]">
          {/* coluna esquerda: a conversa */}
          <div className="flex min-h-0 flex-col border-r max-[1000px]:border-r-0 max-[1000px]:border-b">
            <div ref={rolagem} aria-live="polite" className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4.5">
              {msgs.map((m) => (
                <Bubble
                  key={m.id}
                  variant={m.quem === "bot" ? "muted" : "default"}
                  align={m.quem === "bot" ? "start" : "end"}
                  className="max-w-[92%]"
                >
                  <BubbleContent className="px-3.25 py-2.5 text-sm leading-[21px] [&_b]:font-semibold">
                    {m.conteudo}
                  </BubbleContent>
                </Bubble>
              ))}
              {respostas && (
                <div className="flex flex-wrap gap-2" role="group" aria-label="Respostas sugeridas">
                  {respostas.opcoes.map((o) => (
                    <Button
                      key={o.t}
                      type="button"
                      variant="outline"
                      className="h-auto flex-col items-start gap-0 rounded-full px-3.25 py-1.75 text-left text-[13px] whitespace-normal"
                      onClick={() => escolher(o)}
                    >
                      {o.t}
                      {o.extra && <small className="text-[11px] leading-[15px] font-normal text-muted-foreground">{o.extra}</small>}
                    </Button>
                  ))}
                </div>
              )}
            </div>
            <form className="flex flex-none items-end gap-2 border-t px-3.5 py-3" onSubmit={enviar}>
              <Label htmlFor="construtor-mensagem" className="sr-only">
                Escreva o critério ou responda a pergunta
              </Label>
              <Textarea
                id="construtor-mensagem"
                rows={1}
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Ex.: se a CAPAG do órgão for A ou B, somar 10 pontos"
                className="max-h-30 min-h-11 flex-1 resize-y"
              />
              <Button type="submit">Enviar</Button>
            </form>
          </div>

          {/* coluna direita: o artefato */}
          <Tabs
            value={vista}
            onValueChange={(v) => {
              setVista(v as Vista)
              setPreview(false)
              setRecente(null)
            }}
            className="flex min-h-0 flex-col gap-0 bg-muted"
          >
            <div className="flex flex-none items-center gap-2.5 border-b bg-background px-4 py-3">
              <span className="min-w-0 flex-1 truncate text-sm font-semibold">{tituloArtefato}</span>
              <TabsList aria-label="Como ver a regra">
                <TabsTrigger value="fluxo" className="px-3">
                  Fluxo
                </TabsTrigger>
                <TabsTrigger value="texto" className="px-3">
                  Texto
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="fluxo" className="min-h-0 overflow-y-auto p-4">
              {corpoDoArtefato("fluxo")}
            </TabsContent>
            <TabsContent value="texto" className="min-h-0 overflow-y-auto p-4">
              {corpoDoArtefato("texto")}
            </TabsContent>
            <div className="flex flex-none flex-wrap items-center gap-2.5 border-t bg-background px-4 py-3">
              <span className="min-w-0 flex-1 text-xs text-muted-foreground">
                Custo estimado: <b className="font-semibold text-foreground tabular-nums">{custo}</b> por licitação
                {volume && ` · ${volume}`}
              </span>
              <Button variant="outline" disabled={!pronta} onClick={preVisualizar}>
                Pré-visualizar em 3 licitações
              </Button>
              <Button disabled={!pronta} onClick={pedirAtivacao}>
                Ativar
              </Button>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ------------------------------------------------------------------ */
/* Artefato: fluxo                                                     */
/* ------------------------------------------------------------------ */

function Bloco({
  tipo,
  titulo,
  sub,
  passo,
  recente,
  onAjustar,
}: {
  tipo: string
  titulo: string
  sub?: string
  /** Passo que o botão Ajustar reabre (só quando o bloco já tem valor). */
  passo?: CampoRegra | null
  recente?: boolean
  onAjustar?: (passo: CampoRegra) => void
}) {
  return (
    <div className={cn("flex items-start gap-2.5 rounded-lg border bg-card px-3 py-2.5", recente && "border-primary")}>
      <div className="min-w-0 flex-1">
        <div className="mb-0.75 text-[10px] font-bold tracking-[.06em] text-muted-foreground uppercase">{tipo}</div>
        <div className="text-sm leading-5 font-semibold">{titulo}</div>
        {sub && <div className="mt-0.75 text-xs leading-[17px] text-muted-foreground">{sub}</div>}
      </div>
      {passo && onAjustar && (
        <Button
          variant="outline"
          size="xs"
          className="flex-none text-muted-foreground"
          aria-label={`Ajustar ${tipo.toLowerCase()}`}
          onClick={() => onAjustar(passo)}
        >
          Ajustar
        </Button>
      )}
    </div>
  )
}

function Conector() {
  return <div aria-hidden className="ml-5.5 h-3 w-px bg-foreground/20" />
}

function Ramo({ rotulo, saida }: { rotulo: string; saida: string }) {
  return (
    <li className="relative rounded-md border bg-card px-2.75 py-2 text-[13px] leading-[19px] before:absolute before:top-4.25 before:-left-4.25 before:h-px before:w-3.25 before:bg-foreground/20">
      <b className="font-semibold">{rotulo}</b>
      <div className="text-muted-foreground">{saida}</div>
    </li>
  )
}

function Fluxo({
  regra: r,
  recente,
  onAjustar,
}: {
  regra: Regra
  recente: CampoRegra | null
  onAjustar: (passo: CampoRegra) => void
}) {
  const bloco = (tipo: string, campo: CampoRegra, vazio: string, sub?: string) => (
    <Bloco
      tipo={tipo}
      titulo={r[campo] ?? vazio}
      sub={sub}
      passo={r[campo] ? campo : null}
      recente={recente === campo}
      onAjustar={onAjustar}
    />
  )

  return (
    <div>
      {bloco("Gatilho", "gatilho", "Ainda não definido", r.gatilho ? undefined : "Vou te perguntar quando rodar")}
      <Conector />
      {bloco("Fonte", "fonte", "Ainda não definida")}
      {r.tipo === "capag" && (
        <>
          <Conector />
          <Bloco tipo="Variável" titulo="Esfera do órgão" sub="Vem do portal · v2 · sem custo de extração" />
          <Conector />
          <Bloco
            tipo="Decisão"
            titulo="Qual a esfera do órgão?"
            passo={r.federal ? "federal" : null}
            recente={recente === "federal"}
            onAjustar={onAjustar}
          />
          <ul className="ml-5.5 flex flex-col gap-2 border-l border-foreground/20 pl-4" aria-label="Ramos por esfera">
            <Ramo rotulo="Federal" saida={r.federal ?? "ainda não definido"} />
            <Ramo rotulo="Estadual" saida="Usa a CAPAG estadual do órgão" />
            <Ramo rotulo="Municipal" saida="Usa a CAPAG municipal do órgão" />
          </ul>
          <Conector />
          <Bloco tipo="Variável" titulo="CAPAG do órgão" sub="Base do Tesouro · v3 · R$ 0,01 por extração" />
        </>
      )}
      <Conector />
      {bloco("Pontuação", "pontos", "Ainda não definida")}
      <Conector />
      {bloco("Sem o dado", "semDado", "Ainda não definido", "O que fazer quando a informação não for encontrada")}
      <Conector />
      {bloco("Saída", "saida", "Ainda não definida")}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Artefato: texto                                                     */
/* ------------------------------------------------------------------ */

function Texto({ regra: r }: { regra: Regra }) {
  const valor = (v: string | null, vazio: string) => v ?? <span className="text-muted-foreground">{vazio}</span>
  const linhas: [string, ReactNode][] = [
    ["Quando:", valor(r.gatilho, "ainda não definido")],
    ["De onde:", valor(r.fonte, "ainda não definida")],
  ]
  if (r.tipo === "capag") {
    linhas.push(["Se o órgão for federal:", valor(r.federal, "ainda não definido")])
    linhas.push(["Se for estadual ou municipal:", "usa a CAPAG da esfera correspondente"])
  }
  linhas.push(["Pontuação:", valor(r.pontos, "ainda não definida")])
  linhas.push(["Se não encontrar o dado:", valor(r.semDado, "ainda não definido")])
  linhas.push(["Onde aparece:", valor(r.saida, "ainda não definida")])

  return (
    <ol className="flex flex-col gap-2">
      {linhas.map(([rotulo, conteudo], i) => (
        <li key={rotulo} className="relative rounded-md border bg-card py-2.5 pr-3 pl-9.5 text-[13px] leading-[19px]">
          <span
            aria-hidden
            className="absolute top-2.5 left-3 flex size-4.5 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-muted-foreground"
          >
            {i + 1}
          </span>
          <b className="font-semibold">{rotulo}</b> {conteudo}
        </li>
      ))}
    </ol>
  )
}

/* ------------------------------------------------------------------ */
/* Pré-visualização                                                    */
/* ------------------------------------------------------------------ */

function PreVisualizacao({ regra: r }: { regra: Regra }) {
  const pts = pontosDaRegra(r)
  const integral = /pontua integralmente/.test(r.semDado ?? "")

  return (
    <ul className="flex flex-col gap-2" aria-label="Resultado em 3 licitações reais">
      {LICITACOES_PREVIEW.map((l) => {
        let valor: string
        let why: ReactNode
        let cor: string
        if (l.resultado === "ok") {
          valor = `+${pts}`
          cor = "text-success-strong"
          why = `${l.capag}, dentro do que você definiu como favorável.`
        } else if (l.resultado === "warn") {
          cor = "text-warning-strong"
          valor = integral ? `+${pts}` : "0"
          why = integral ? (
            <>
              {l.capag}. Pela sua regra, pontuaria integralmente mesmo sem o dado: <b className="font-semibold">+{pts}</b>.
            </>
          ) : (
            `${l.capag}. ${/sinalizado/.test(r.semDado ?? "") ? "Vai aparecer sinalizada para revisão manual." : "Não pontua, sem sinalizar."}`
          )
        } else {
          valor = /soma os pontos/.test(r.federal ?? "") ? `+${pts}` : "0"
          cor = "text-muted-foreground"
          why = `Órgão federal. ${(r.federal ?? "").replace(/^Federal: /, "")}`
        }
        return (
          <li key={l.edital} className="flex items-start gap-3 rounded-lg border bg-card px-3.25 py-2.75">
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold">{l.edital}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{l.orgao}</div>
              <div className="mt-1.25 text-xs leading-[17px] text-muted-foreground">{why}</div>
            </div>
            <div className={cn("min-w-14.5 flex-none text-right text-[15px] font-bold tabular-nums", cor)}>
              {valor} <span className="sr-only">pontos</span>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
