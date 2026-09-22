// Campos da configuração de um agente e de uma variável, usados na criação e na edição.
// Mudança principal em relação ao handoff: nas listas suspensas, o texto de cada opção só
// aparecia depois de escolher, e no teste três pessoas não o viram. Agora a explicação
// fica dentro do menu, ao lado de cada opção, e o erro de preenchimento fica embaixo do
// próprio campo.

import { useRef, useState, type ReactNode } from "react"
import { CircleAlertIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { TokenField, type TokenFieldHandle, type TokenFieldMenuApi } from "@/components/ui/token-field"

import { Dica, tokenDaVar, VarChip } from "./comum"
import {
  APROVACAO,
  DESC_GATILHO,
  DIAS,
  FONTES,
  FORMATO_VAR,
  FREQUENCIAS,
  GATILHOS,
  ONDE,
  REP_POR_GATILHO,
  REPETICAO,
  TIPOS_VAR,
  type Agenda,
  type Dia,
  type Frequencia,
  type ModoAprovacao,
  type Momento,
  type Onde,
  type Repeticao,
  type TipoVar,
} from "./dados"
import { useAgentes } from "./estado"
import { varsDoTexto } from "./regras"

/** Um campo do formulário: rótulo, controle, dica e o erro embaixo. */
export function Campo({
  rotulo,
  htmlFor,
  id,
  acao,
  dica,
  erro,
  children,
  className,
}: {
  rotulo: ReactNode
  htmlFor?: string
  /** id do rótulo, para grupos de opções. */
  id?: string
  /** Ação ao lado do título (ex.: Adicionar variável). */
  acao?: ReactNode
  /** Texto de apoio, logo abaixo do rótulo. */
  dica?: ReactNode
  erro?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div data-erro={erro ? "" : undefined} className={cn("mb-5.5 flex flex-col gap-1.5 scroll-mt-4", className)}>
      <div className="flex items-center justify-between gap-2.5">
        {htmlFor ? (
          <Label htmlFor={htmlFor} id={id} className="text-sm font-semibold">
            {rotulo}
          </Label>
        ) : (
          <span id={id} className="text-sm font-semibold">
            {rotulo}
          </span>
        )}
        {acao}
      </div>
      {dica && <Dica className="-mt-0.5 mb-0.5">{dica}</Dica>}
      {children}
      {erro && (
        <p role="alert" className="flex items-start gap-1.5 text-[12.5px] leading-[18px] font-medium text-destructive">
          <CircleAlertIcon aria-hidden className="mt-px size-3.5 shrink-0" />
          {erro}
        </p>
      )}
    </div>
  )
}

/** Leva a janela até o primeiro campo com erro e põe o foco nele. */
export function mostrarPrimeiroErro(raiz: HTMLElement | null) {
  window.requestAnimationFrame(() => {
    const campo = raiz?.querySelector<HTMLElement>("[data-erro]")
    if (!campo) return
    campo.scrollIntoView({ behavior: "smooth", block: "center" })
    campo.querySelector<HTMLElement>("input, textarea, [contenteditable=true], button[role=combobox]")?.focus({ preventScroll: true })
  })
}

/* ------------------------------------------------------------------ */
/* Escolha com explicação no menu                                      */
/* ------------------------------------------------------------------ */

type Opcao<T extends string> = { v: T; t: string; d?: ReactNode }

/*
  Lista suspensa com a explicação de cada opção dentro do menu. No teste, o problema era a
  explicação aparecer só depois de escolher; aqui ela está à vista na hora da escolha, e o
  formulário continua compacto (pedido do Brunno). O campo fechado mostra só o nome.
*/
function Escolha<T extends string>({
  rotuloId,
  valor,
  opcoes,
  onChange,
  placeholder,
  invalido,
}: {
  rotuloId: string
  valor: T | ""
  opcoes: Opcao<T>[]
  onChange: (v: T) => void
  placeholder: string
  invalido?: boolean
}) {
  const escolhida = opcoes.find((o) => o.v === valor)
  return (
    <Select value={valor || undefined} onValueChange={(v) => onChange(v as T)}>
      <SelectTrigger aria-labelledby={rotuloId} aria-invalid={invalido || undefined} className="w-full">
        <SelectValue placeholder={placeholder}>{escolhida?.t}</SelectValue>
      </SelectTrigger>
      <SelectContent position="popper" className="max-h-96">
        {opcoes.map((o) => (
          <SelectItem key={o.v} value={o.v} className="py-2">
            <span className="flex flex-col items-start gap-0.5 whitespace-normal">
              <span className="text-[13.5px] leading-5 font-medium">{o.t}</span>
              {o.d && <span className="text-[12.5px] leading-[17px] text-muted-foreground">{o.d}</span>}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/* ------------------------------------------------------------------ */
/* Onde o resultado aparece                                            */
/* ------------------------------------------------------------------ */

export function CampoOnde({ valor, onChange, erro }: { valor: Onde | ""; onChange: (v: Onde) => void; erro?: string }) {
  const ordem: Onde[] = ["habilitacao", "tecnica", "juridica", "checklist", "score", "nenhum"]
  return (
    <Campo rotulo="Onde o resultado aparece" id="campo-onde" dica="O lugar da licitação onde o que o agente produzir vai aparecer." erro={erro}>
      <Escolha
        rotuloId="campo-onde"
        valor={valor}
        invalido={!!erro}
        onChange={onChange}
        placeholder="Escolha onde o resultado aparece"
        opcoes={ordem.map((k) => ({ v: k, t: ONDE[k].t, d: ONDE[k].d }))}
      />
    </Campo>
  )
}

/* ------------------------------------------------------------------ */
/* Quando o agente trabalha                                            */
/* ------------------------------------------------------------------ */

export function CampoQuando({
  gatilho,
  agenda,
  repete,
  onGatilho,
  onAgenda,
  onRepete,
  erro,
}: {
  gatilho: Momento | ""
  agenda: Agenda
  repete: Repeticao
  onGatilho: (g: Momento) => void
  onAgenda: (a: Agenda) => void
  onRepete: (r: Repeticao) => void
  erro?: string
}) {
  const rep = gatilho ? REP_POR_GATILHO[gatilho] : undefined
  const mudar = (p: Partial<Agenda>) => onAgenda({ ...agenda, ...p })
  return (
    <Campo rotulo="Quando o agente trabalha" id="campo-quando" dica="O que faz o agente começar. Ele trabalha em cada licitação que passar por esse momento." erro={erro}>
      <Escolha
        rotuloId="campo-quando"
        valor={gatilho}
        invalido={!!erro}
        onChange={onGatilho}
        placeholder="Escolha quando o agente trabalha"
        opcoes={(Object.keys(GATILHOS) as Momento[]).map((g) => ({ v: g, t: GATILHOS[g], d: DESC_GATILHO[g] }))}
      />

      {gatilho === "agendado" && (
        <div className="mt-1 flex flex-wrap items-center gap-2 rounded-lg bg-muted/60 p-2.5">
          <NativeSelect aria-label="Frequência" className="min-w-32.5" value={agenda.freq} onChange={(e) => mudar({ freq: e.target.value as Frequencia })}>
            {(Object.keys(FREQUENCIAS) as Frequencia[]).map((f) => (
              <NativeSelectOption key={f} value={f}>
                {FREQUENCIAS[f]}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          {agenda.freq === "mes" && (
            <span className="inline-flex items-center gap-2">
              <span className="text-[13px] whitespace-nowrap text-muted-foreground">começa em</span>
              <Input type="date" aria-label="Data de início" className="w-auto min-w-32.5" value={agenda.inicio} onChange={(e) => mudar({ inicio: e.target.value })} />
            </span>
          )}
          {agenda.freq !== "hora" && (
            <Input type="time" aria-label="Horário" className="w-auto min-w-32.5" value={agenda.hora} onChange={(e) => mudar({ hora: e.target.value })} />
          )}
          {agenda.freq === "semana" && (
            <NativeSelect aria-label="Dia da semana" className="min-w-32.5" value={agenda.dia} onChange={(e) => mudar({ dia: e.target.value as Dia })}>
              {(Object.keys(DIAS) as Dia[]).map((d) => (
                <NativeSelectOption key={d} value={d}>
                  {DIAS[d]}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          )}
        </div>
      )}

      {/* A repetição só existe onde o evento se repete: captura e chegada em Recomendadas. */}
      {rep && (
        <div className="mt-2 flex flex-col gap-1.5">
          <span id="campo-repeticao" className="text-[13px] font-semibold">
            Trabalhar de novo quando o edital mudar?
          </span>
          <Escolha
            rotuloId="campo-repeticao"
            valor={repete}
            onChange={onRepete}
            placeholder="Escolha"
            opcoes={(Object.keys(REPETICAO) as Repeticao[]).map((r) => ({ v: r, t: rep[r].t, d: rep[r].d }))}
          />
        </div>
      )}
    </Campo>
  )
}

/* ------------------------------------------------------------------ */
/* Aprovação das ações                                                 */
/* ------------------------------------------------------------------ */

export function CampoAprovacao({
  valor,
  onChange,
  erro,
  aoVerAprovacoes,
}: {
  valor: ModoAprovacao | ""
  onChange: (v: ModoAprovacao) => void
  erro?: string
  aoVerAprovacoes?: () => void
}) {
  return (
    <Campo
      rotulo="Aprovação das ações"
      id="campo-aprovacao"
      erro={erro}
      dica={
        <>
          Vale para o que o agente faz na licitação, como mover de etapa ou marcar responsável. Ler o edital nunca
          precisa de aprovação. Os pedidos ficam em{" "}
          {aoVerAprovacoes ? (
            <button type="button" className="font-semibold text-primary underline-offset-3 hover:underline" onClick={aoVerAprovacoes}>
              Aprovações
            </button>
          ) : (
            "Aprovações"
          )}
          .
        </>
      }
    >
      <Escolha
        rotuloId="campo-aprovacao"
        valor={valor}
        invalido={!!erro}
        onChange={onChange}
        placeholder="Escolha se as ações precisam de aprovação"
        opcoes={(Object.keys(APROVACAO) as ModoAprovacao[]).map((k) => ({ v: k, t: APROVACAO[k].t, d: APROVACAO[k].d }))}
      />
    </Campo>
  )
}

/* ------------------------------------------------------------------ */
/* Formato da resposta (variável)                                      */
/* ------------------------------------------------------------------ */

export function CampoFormato({
  valor,
  onChange,
  travado,
}: {
  valor: TipoVar
  onChange: (v: TipoVar) => void
  travado?: boolean
}) {
  if (travado) {
    return (
      <Campo rotulo="Formato da resposta">
        <p className="text-sm">{FORMATO_VAR[valor].t}</p>
      </Campo>
    )
  }
  return (
    <Campo
      rotulo="Formato da resposta"
      id="var-tipo"
      dica="Todo resultado é escrito em forma de texto, número ou escolha. Aqui você define o formato da resposta para os agentes que usarem esta variável."
    >
      <Escolha
        rotuloId="var-tipo"
        valor={valor}
        onChange={onChange}
        placeholder="Escolha o formato"
        opcoes={TIPOS_VAR.map((t) => ({ v: t, t: FORMATO_VAR[t].t, d: FORMATO_VAR[t].d }))}
      />
    </Campo>
  )
}

/* ------------------------------------------------------------------ */
/* Instrução com variáveis dentro                                      */
/* ------------------------------------------------------------------ */

function MenuDeVariaveis({ api }: { api: TokenFieldMenuApi }) {
  const { cfg, criarVarRapida } = useAgentes()
  const [criando, setCriando] = useState(false)
  const [nome, setNome] = useState("")
  const [tipo, setTipo] = useState<TipoVar>("sim ou não")
  const [prompt, setPrompt] = useState("")
  const [fonte, setFonte] = useState(FONTES[0])
  const [tentou, setTentou] = useState(false)

  const titulo = (t: string) => (
    <p className="px-2 pt-1.5 pb-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">{t}</p>
  )
  const chip = (ativo: boolean) =>
    cn(
      "rounded-full border px-2.5 py-1 text-xs outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
      ativo ? "border-primary bg-primary/10 text-primary" : "bg-card text-foreground hover:bg-muted"
    )

  if (criando) {
    const faltaNome = tentou && !nome.trim()
    const faltaPrompt = tentou && !prompt.trim()
    return (
      <div className="flex flex-col">
        {titulo("Nova variável")}
        <div className="flex flex-col gap-2.5 px-2 pt-1 pb-2.5">
          <div className="flex flex-col gap-1">
            <Label htmlFor="nova-var-nome" className="text-xs font-normal text-muted-foreground">Nome</Label>
            <Input id="nova-var-nome" autoFocus aria-invalid={faltaNome || undefined} placeholder="Ex.: Atestado exigido" value={nome} onChange={(e) => setNome(e.target.value)} />
            {faltaNome && <span className="text-xs text-destructive">Dê um nome à variável.</span>}
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Formato da resposta</span>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Formato da resposta">
              {TIPOS_VAR.map((t) => (
                <button key={t} type="button" aria-pressed={tipo === t} className={chip(tipo === t)} onClick={() => setTipo(t)}>
                  {FORMATO_VAR[t].t}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="nova-var-prompt" className="text-xs font-normal text-muted-foreground">O que procurar</Label>
            <Textarea
              id="nova-var-prompt"
              rows={2}
              aria-invalid={faltaPrompt || undefined}
              placeholder="Ex.: diga se o edital exige atestado de capacidade técnica."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            {faltaPrompt && <span className="text-xs text-destructive">Diga o que procurar no edital.</span>}
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Procurar primeiro em</span>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Procurar primeiro em">
              {FONTES.slice(0, 4).map((f) => (
                <button key={f} type="button" aria-pressed={fonte === f} className={chip(fonte === f)} onClick={() => setFonte(f)}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <Button
            className="mt-1 w-full"
            onClick={() => {
              setTentou(true)
              const k = criarVarRapida({ nome, tipo, prompt, fonte })
              if (k) api.insert(k, { label: nome.trim() })
            }}
          >
            Criar e inserir
          </Button>
        </div>
      </div>
    )
  }

  const ks = Object.keys(cfg.vars)
  return (
    <div className="flex flex-col">
      {titulo("Variáveis")}
      {ks.map((k) => (
        <button
          key={k}
          type="button"
          onClick={() => api.insert(k)}
          className="flex flex-col rounded-md px-2 py-1.5 text-left outline-none hover:bg-muted focus-visible:bg-muted"
        >
          <span className="text-[13.5px]">{cfg.vars[k].nome}</span>
          <span className="text-[11.5px] text-muted-foreground">{FORMATO_VAR[cfg.vars[k].tipo].t}</span>
        </button>
      ))}
      <button
        type="button"
        onClick={() => setCriando(true)}
        className="mt-1 border-t px-2 pt-2.25 pb-1.75 text-left text-[13.5px] font-semibold text-primary outline-none hover:bg-muted focus-visible:bg-muted"
      >
        Criar uma variável nova aqui
      </button>
    </div>
  )
}

/*
  A instrução com variáveis. Embaixo, a lista do que o agente vai usar: no teste, a
  Graziela não soube dizer se a variável estava ligada ao agente, e a Isadora procurou um
  lugar para escolher a variável fora do texto.
*/
export function CampoInstrucoes({
  id,
  valor,
  onChange,
  erro,
  aoAbrirVariavel,
}: {
  id: string
  valor: string
  onChange: (v: string) => void
  erro?: string
  aoAbrirVariavel?: (k: string) => void
}) {
  const { cfg } = useAgentes()
  const campo = useRef<TokenFieldHandle>(null)
  const usadas = varsDoTexto(valor)
  return (
    <Campo
      rotulo={<span id={`${id}-rotulo`}>O que o agente faz</span>}
      dica="Escreva como pediria para uma pessoa do time. Use variáveis para o que vem do edital."
      erro={erro}
      acao={
        <Button variant="outline" size="xs" className="shadow-none" onClick={() => campo.current?.openMenu()}>
          Inserir variável
        </Button>
      }
    >
      <TokenField
        ref={campo}
        aria-labelledby={`${id}-rotulo`}
        aria-invalid={erro ? true : undefined}
        className={cn(erro && "border-destructive ring-3 ring-destructive/20")}
        defaultValue={valor}
        onValueChange={onChange}
        getToken={(k) => tokenDaVar(k, cfg.vars, cfg.varsEx)}
        placeholder="Ex.: avise quando o edital exigir atestado de capacidade técnica e diga quantos pede. Digite / para inserir uma variável."
        menu={(api) => <MenuDeVariaveis api={api} />}
      />
      <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[12.5px] text-muted-foreground">
        <span>Variáveis usadas:</span>
        {usadas.length ? (
          usadas.map((k) => <VarChip key={k} k={k} aoAbrir={aoAbrirVariavel} />)
        ) : (
          <span>nenhuma ainda. Digite / no texto ou use Inserir variável.</span>
        )}
      </div>
    </Campo>
  )
}
