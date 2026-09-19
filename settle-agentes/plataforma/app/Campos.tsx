// Campos da configuração de um agente, usados na criação e na edição: onde o
// resultado aparece, quando o agente roda (com a agenda e a repetição), as
// permissões e a instrução com variáveis dentro.

import { useRef, useState, type ReactNode } from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { TokenField, type TokenFieldHandle, type TokenFieldMenuApi } from "@/components/ui/token-field"

import { Dica, tokenDaVar } from "./comum"
import {
  APROVACAO,
  DIAS,
  FONTES,
  FREQUENCIAS,
  FUNCIONALIDADES,
  GATILHOS,
  REP_POR_GATILHO,
  REPETICAO,
  TIPOS_VAR,
  type Agenda,
  type Dia,
  type Frequencia,
  type ModoAprovacao,
  type Momento,
  type Repeticao,
  type TipoVar,
} from "./dados"
import { useSim } from "./estado"
import { cap } from "./regras"

/** Um campo do formulário: rótulo, controle e dica, com o respiro do original. */
export function Campo({
  rotulo,
  htmlFor,
  acao,
  children,
  className,
}: {
  rotulo: ReactNode
  htmlFor?: string
  /** Ação ao lado do título (ex.: Adicionar variável). */
  acao?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("mb-4.5 flex flex-col gap-1.5", className)}>
      <div className="flex items-center justify-between gap-2.5">
        {htmlFor ? (
          <Label htmlFor={htmlFor} className="text-sm font-semibold">
            {rotulo}
          </Label>
        ) : (
          <span className="text-sm font-semibold">{rotulo}</span>
        )}
        {acao}
      </div>
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Onde o resultado aparece                                            */
/* ------------------------------------------------------------------ */

/* "Nenhum lugar" é para instruções que são ações, como mover a licitação ou marcar um
   responsável: não geram AI Widget, e o que o agente fez fica no histórico dele. */
export function CampoOnde({ valor, onChange }: { valor: string; onChange: (v: string) => void }) {
  return (
    <Campo rotulo="Onde o resultado aparece" htmlFor="campo-onde">
      <NativeSelect id="campo-onde" className="w-full" value={valor} onChange={(e) => onChange(e.target.value)}>
        {!valor && (
          <NativeSelectOption value="" disabled>
            Escolha onde o resultado aparece
          </NativeSelectOption>
        )}
        <NativeSelectOption value="nenhum">Nenhum lugar</NativeSelectOption>
        {Object.entries(FUNCIONALIDADES).map(([k, nome]) => (
          <NativeSelectOption key={k} value={k}>
            {nome}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      {valor === "nenhum" && (
        <Dica>
          Para instruções que são ações, como mover a licitação ou marcar um responsável. O agente não gera AI Widget, e
          o que ele fez fica no histórico dele.
        </Dica>
      )}
    </Campo>
  )
}

/* ------------------------------------------------------------------ */
/* Quando roda                                                         */
/* ------------------------------------------------------------------ */

/**
 * O mesmo bloco serve à criação e à edição. Frequência no padrão das tarefas agendadas
 * do Claude: cada opção pede só o que ela precisa.
 */
export function CampoQuando({
  gatilho,
  agenda,
  repete,
  onGatilho,
  onAgenda,
  onRepete,
}: {
  gatilho: Momento | ""
  agenda: Agenda
  /** Só na criação: a repetição do evento. */
  repete?: Repeticao
  onGatilho: (g: Momento) => void
  onAgenda: (a: Agenda) => void
  onRepete?: (r: Repeticao) => void
}) {
  const rep = gatilho ? REP_POR_GATILHO[gatilho] : undefined
  const mudar = (p: Partial<Agenda>) => onAgenda({ ...agenda, ...p })
  return (
    <Campo rotulo="Quando roda" htmlFor="campo-quando">
      <NativeSelect id="campo-quando" className="w-full" value={gatilho} onChange={(e) => onGatilho(e.target.value as Momento)}>
        {/* Do zero, nada vem escolhido: um momento pré-marcado é uma decisão que a pessoa não tomou. */}
        {!gatilho && (
          <NativeSelectOption value="" disabled>
            Escolha quando o agente roda
          </NativeSelectOption>
        )}
        {(Object.keys(GATILHOS) as Momento[]).map((g) => (
          <NativeSelectOption key={g} value={g}>
            {GATILHOS[g]}
          </NativeSelectOption>
        ))}
      </NativeSelect>

      {gatilho === "agendado" && (
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
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
      {rep && onRepete && (
        <div className="mt-2 flex flex-col gap-2">
          <span id="campo-repeticao" className="text-[12.5px] text-muted-foreground">
            Repetição
          </span>
          <RadioGroup
            aria-labelledby="campo-repeticao"
            value={repete ?? "primeira"}
            onValueChange={(v) => onRepete(v as Repeticao)}
            className="flex flex-wrap gap-3.5"
          >
            {(Object.keys(REPETICAO) as Repeticao[]).map((r) => (
              <Label key={r} className="cursor-pointer text-[13px] font-normal">
                <RadioGroupItem value={r} />
                {rep[r]}
              </Label>
            ))}
          </RadioGroup>
        </div>
      )}
    </Campo>
  )
}

/* ------------------------------------------------------------------ */
/* Permissões                                                          */
/* ------------------------------------------------------------------ */

/* A matriz de cinco permissões saiu, mas a fila de aprovações não pode existir sem
   alguém ter dito que quer aprovar. Fica um controle só. */
export function CampoAprovacao({ valor, onChange }: { valor: ModoAprovacao; onChange: (v: ModoAprovacao) => void }) {
  return (
    <Campo rotulo="Permissões" htmlFor="campo-aprovacao">
      <NativeSelect id="campo-aprovacao" className="w-full" value={valor} onChange={(e) => onChange(e.target.value as ModoAprovacao)}>
        {(Object.keys(APROVACAO) as ModoAprovacao[]).map((k) => (
          <NativeSelectOption key={k} value={k}>
            {APROVACAO[k].t}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      <Dica>{APROVACAO[valor].d}</Dica>
    </Campo>
  )
}

/* ------------------------------------------------------------------ */
/* Instrução com variáveis dentro                                      */
/* ------------------------------------------------------------------ */

/*
  Resposta ao "como é que ele cria uma variável ali dentro, de forma muito determinada,
  pro sistema saber que aquilo tem proveniência própria" (Alice, 31/08). A variável não
  é palavra no meio do texto: é um objeto no texto. Some do texto se apagada, e pode ser
  criada sem sair da escrita. Digitar "/" abre a lista.
*/
function MenuDeVariaveis({ api }: { api: TokenFieldMenuApi }) {
  const { cfg, criarVarRapida } = useSim()
  const [criando, setCriando] = useState(false)
  const [nome, setNome] = useState("")
  const [tipo, setTipo] = useState<TipoVar>("texto")
  const [prompt, setPrompt] = useState("")
  const [fonte, setFonte] = useState(FONTES[0])

  const titulo = (t: string) => (
    <p className="px-2 pt-1.5 pb-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">{t}</p>
  )
  const chip = (ativo: boolean) =>
    cn(
      "rounded-full border px-2.5 py-1 text-xs outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
      ativo ? "border-primary bg-primary/10 text-primary" : "bg-card text-foreground hover:bg-muted"
    )

  if (criando) {
    /* Os mesmos campos obrigatórios da janela (nome, tipo, instruções e a primeira
       fonte), em versão curta. O resto fica para a tela de variáveis. */
    return (
      <div className="flex flex-col">
        {titulo("Adicionar variável")}
        <div className="flex flex-col gap-2.5 px-2 pt-1 pb-2.5">
          <div className="flex flex-col gap-1">
            <Label htmlFor="nova-var-nome" className="text-xs font-normal text-muted-foreground">Nome</Label>
            <Input id="nova-var-nome" autoFocus placeholder="Ex.: CNPJ do órgão" value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Tipo</span>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Tipo">
              {TIPOS_VAR.map((t) => (
                <button key={t} type="button" aria-pressed={tipo === t} className={chip(tipo === t)} onClick={() => setTipo(t)}>
                  {cap(t)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="nova-var-prompt" className="text-xs font-normal text-muted-foreground">Instruções</Label>
            <Textarea
              id="nova-var-prompt"
              rows={2}
              placeholder="Ex.: encontre o número do CNPJ do órgão que está contratando."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
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
              const k = criarVarRapida({ nome, tipo, prompt, fonte })
              if (k) api.insert(k, { label: nome.trim(), tone: "warning" })
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
      {ks.length ? (
        ks.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => api.insert(k)}
            className="rounded-md px-2 py-1.75 text-left text-[13.5px] outline-none hover:bg-muted focus-visible:bg-muted"
          >
            {cfg.vars[k].nome}
          </button>
        ))
      ) : (
        <p className="px-2 py-1 text-xs text-muted-foreground">Nenhuma com esse nome.</p>
      )}
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

/**
 * O campo de instrução com variáveis. O botão ao lado do título faz o mesmo que a
 * barra: quem não descobre o atalho tem por onde clicar.
 */
export function CampoInstrucoes({
  id,
  valor,
  onChange,
  placeholder,
}: {
  id: string
  valor: string
  onChange: (v: string) => void
  placeholder: string
}) {
  const { cfg } = useSim()
  const campo = useRef<TokenFieldHandle>(null)
  return (
    <Campo
      rotulo={<span id={`${id}-rotulo`}>Instruções</span>}
      acao={
        <Button variant="outline" size="xs" className="shadow-none" onClick={() => campo.current?.openMenu()}>
          Adicionar variável
        </Button>
      }
    >
      <TokenField
        ref={campo}
        aria-labelledby={`${id}-rotulo`}
        defaultValue={valor}
        onValueChange={onChange}
        getToken={(k) => tokenDaVar(k, cfg.vars, cfg.varsEx)}
        placeholder={placeholder}
        menu={(api) => <MenuDeVariaveis api={api} />}
      />
    </Campo>
  )
}
