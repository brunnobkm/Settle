// Janela de criação/edição de um agente, em quatro etapas:
// formulário → revisão (só as lacunas que ficaram em aberto) → pré-visualização → ativar.

import { useEffect, useRef, useState } from "react"
import { CheckIcon, TriangleAlertIcon, XIcon } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Toggle } from "@/components/ui/toggle"

import {
  FONTES,
  GATILHOS,
  LICS,
  SAIDAS,
  custoDoRascunho,
  detectarLacunas,
  resultadoDaPrevia,
  textoDeCusto,
  type GatilhoId,
  type Lacuna,
  type Rascunho,
  type SaidaId,
  type Tom,
} from "./dados"

type Etapa = "form" | "revisao" | "preview" | "ativar"

const STATUS: Record<Etapa, string> = {
  form: "Rascunho",
  revisao: "Em revisão",
  preview: "Pronto para ativar",
  ativar: "Pronto para ativar",
}

const COR_DO_TOM: Record<Tom, string> = {
  ok: "text-success-strong",
  warn: "text-warning-strong",
  dim: "text-muted-foreground",
}

export type AgenteAtivado = { nome: string; instr: string; gatilho: string; custo: string; recalcular: boolean }

export function EditorDeAgente({
  aberto,
  onAbertoChange,
  titulo,
  inicial,
  onAtivar,
}: {
  aberto: boolean
  onAbertoChange: (aberto: boolean) => void
  titulo: string
  /** Rascunho inicial. Troque a key do componente para recomeçar. */
  inicial: Rascunho
  onAtivar: (agente: AgenteAtivado) => void
}) {
  const [r, setR] = useState(inicial)
  const [etapa, setEtapa] = useState<Etapa>("form")
  const [lacunas, setLacunas] = useState<Lacuna[]>([])
  const corpoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    corpoRef.current?.scrollTo({ top: 0 })
  }, [etapa])

  const pendentes = lacunas.filter((l) => !r.lacunas[l.id]).length

  function avancar() {
    if (etapa === "form") {
      if (!r.instr.trim()) {
        toast("Escreva o que a Settle deve fazer")
        return
      }
      setLacunas(detectarLacunas(r))
      setEtapa("revisao")
    } else if (etapa === "revisao") setEtapa("preview")
    else if (etapa === "preview") setEtapa("ativar")
  }

  function voltar() {
    if (etapa === "revisao") setEtapa("form")
    else if (etapa === "preview") setEtapa("revisao")
    else if (etapa === "ativar") setEtapa("preview")
  }

  function ativar(recalcular: boolean) {
    const gat = GATILHOS.find((g) => g.id === r.gatilho)
    onAtivar({
      nome: r.nome || "Agente sem nome",
      instr: r.instr,
      gatilho: gat?.t ?? "",
      custo: `R$ ${custoDoRascunho(r).toFixed(2).replace(".", ",")}`,
      recalcular,
    })
  }

  const rotuloAvancar =
    etapa === "form" ? "Revisar e ativar" : etapa === "revisao" ? "Pré-visualizar em 3 licitações" : "Ativar agente"

  return (
    <Dialog open={aberto} onOpenChange={onAbertoChange}>
      <DialogContent
        showCloseButton={false}
        autoFocus={false}
        aria-describedby={undefined}
        className="flex h-[calc(100svh-2.5rem)] flex-col gap-0 overflow-hidden rounded-[14px] p-0 sm:max-w-205"
      >
        <div className="flex flex-none items-center gap-3 border-b px-5 py-3.5">
          <DialogTitle className="min-w-0 flex-1 text-[17px] leading-6 font-semibold">{titulo}</DialogTitle>
          <Badge variant="secondary" className="rounded-md bg-muted text-muted-foreground">
            {STATUS[etapa]}
          </Badge>
          <DialogClose asChild>
            <Button variant="ghost" size="icon-sm" className="text-muted-foreground" aria-label="Fechar">
              <XIcon />
            </Button>
          </DialogClose>
        </div>

        <div ref={corpoRef} className="min-h-0 flex-1 overflow-y-auto p-5">
          {etapa === "form" && <Formulario r={r} setR={setR} />}
          {etapa === "revisao" && (
            <Revisao
              r={r}
              lacunas={lacunas}
              pendentes={pendentes}
              onResponder={(id, op) => setR((d) => ({ ...d, lacunas: { ...d.lacunas, [id]: op } }))}
            />
          )}
          {etapa === "preview" && <Previa r={r} lacunas={lacunas} />}
          {etapa === "ativar" && <Ativar onEscolher={ativar} />}
        </div>

        <div className="flex flex-none flex-wrap items-center gap-2.5 border-t px-5 py-3.5">
          <span className="text-xs text-muted-foreground tabular-nums">{textoDeCusto(r)}</span>
          <span className="flex-1" />
          {etapa !== "form" && (
            <Button variant="outline" className="px-3.5" onClick={voltar}>
              Voltar
            </Button>
          )}
          {etapa !== "ativar" && (
            <Button className="px-3.5" onClick={avancar} disabled={etapa === "revisao" && pendentes > 0}>
              {rotuloAvancar}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ------------------------------------------------------------------ */
/* Etapa 1: formulário                                                 */
/* ------------------------------------------------------------------ */

const DICA = "text-xs leading-[17px]"

function Formulario({ r, setR }: { r: Rascunho; setR: React.Dispatch<React.SetStateAction<Rascunho>> }) {
  return (
    <FieldGroup className="gap-4.5">
      <Field className="gap-1.5">
        <FieldLabel htmlFor="agente-nome" className="font-semibold">
          Nome
        </FieldLabel>
        <Input
          id="agente-nome"
          value={r.nome}
          onChange={(e) => setR((d) => ({ ...d, nome: e.target.value }))}
          placeholder="Ex.: Score de saúde financeira do órgão"
        />
      </Field>

      <Field className="gap-1.5">
        <FieldLabel htmlFor="agente-instr" className="font-semibold">
          O que a Settle deve fazer
        </FieldLabel>
        <FieldDescription id="agente-instr-dica" className={DICA}>
          Escreva como você explicaria para alguém da sua equipe. Não precisa prever todos os casos agora: na revisão eu
          aponto o que ficou em aberto.
        </FieldDescription>
        <Textarea
          id="agente-instr"
          aria-describedby="agente-instr-dica"
          value={r.instr}
          onChange={(e) => setR((d) => ({ ...d, instr: e.target.value }))}
          className="min-h-30 px-3 py-2.5 leading-[21px]"
        />
      </Field>

      <FieldSet className="gap-2">
        <FieldLegend variant="label" className="mb-0 font-semibold">
          O que ele pode ler
        </FieldLegend>
        <FieldDescription className={DICA}>Cada documento a mais aumenta o custo por licitação.</FieldDescription>
        <div className="flex flex-wrap gap-2">
          {FONTES.map((f) => (
            <Toggle
              key={f.id}
              variant="outline"
              size="sm"
              pressed={!!r.fontes[f.id]}
              onPressedChange={(on) => setR((d) => ({ ...d, fontes: { ...d.fontes, [f.id]: on } }))}
              className="gap-1.5 rounded-full border-border bg-card px-3 text-[13px] font-normal shadow-none aria-pressed:border-primary aria-pressed:bg-primary/10 aria-pressed:text-primary"
            >
              {f.nome}
              <span className="text-[11px] text-muted-foreground group-aria-pressed/toggle:text-primary">{f.custo}</span>
            </Toggle>
          ))}
        </div>
      </FieldSet>

      <FieldSet className="gap-2">
        <FieldLegend variant="label" className="mb-0 font-semibold">
          Quando roda
        </FieldLegend>
        <RadioGroup
          value={r.gatilho}
          onValueChange={(v) => setR((d) => ({ ...d, gatilho: v as GatilhoId }))}
          className="gap-2"
        >
          {GATILHOS.map((g) => (
            <FieldLabel key={g.id} htmlFor={`gatilho-${g.id}`}>
              <Field orientation="horizontal" className="gap-3 px-3.5! py-3!">
                <RadioGroupItem value={g.id} id={`gatilho-${g.id}`} />
                <FieldContent className="gap-0.5">
                  <FieldTitle className="font-semibold">{g.t}</FieldTitle>
                  <FieldDescription className={DICA}>{g.d}</FieldDescription>
                </FieldContent>
              </Field>
            </FieldLabel>
          ))}
        </RadioGroup>
      </FieldSet>

      <FieldSet className="gap-2">
        <FieldLegend variant="label" className="mb-0 font-semibold">
          Onde o resultado aparece
        </FieldLegend>
        <div className="flex flex-col gap-2">
          {SAIDAS.map((s) => (
            <FieldLabel key={s.id} htmlFor={`saida-${s.id}`}>
              <Field orientation="horizontal" className="gap-3 px-3.5! py-3!">
                <Checkbox
                  id={`saida-${s.id}`}
                  checked={r.saidas[s.id]}
                  onCheckedChange={(v) => setR((d) => ({ ...d, saidas: { ...d.saidas, [s.id as SaidaId]: v === true } }))}
                />
                <FieldContent className="gap-0.5">
                  <FieldTitle className="font-semibold">{s.t}</FieldTitle>
                  <FieldDescription className={DICA}>{s.d}</FieldDescription>
                </FieldContent>
              </Field>
            </FieldLabel>
          ))}
        </div>
      </FieldSet>

      <Alert variant="warning">
        <TriangleAlertIcon />
        <AlertTitle>Este agente vale para todo o espaço de trabalho</AlertTitle>
        <AlertDescription>
          <p>
            Ele roda em todas as licitações da B Design e o resultado aparece para as 7 pessoas da equipe. Só
            administradores podem editar depois de ativado.
          </p>
        </AlertDescription>
      </Alert>
    </FieldGroup>
  )
}

/* ------------------------------------------------------------------ */
/* Etapa 2: revisão (elicitação só do que ficou em aberto)             */
/* ------------------------------------------------------------------ */

const DICA_DE_ETAPA = "mb-4.5 text-xs leading-[17px] text-muted-foreground"

function CaixaDeLacuna({
  resolvida,
  titulo,
  children,
}: {
  resolvida?: boolean
  titulo: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "mb-3 rounded-lg border border-l-3 bg-card px-3.5 py-3",
        resolvida ? "border-l-success" : "border-l-warning"
      )}
    >
      <p className="mb-0.5 text-sm leading-[21px] font-semibold">{titulo}</p>
      {children}
    </div>
  )
}

function Opcoes({ opcoes, onEscolher }: { opcoes: string[]; onEscolher: (op: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {opcoes.map((op) => (
        <Button
          key={op}
          variant="outline"
          size="sm"
          className="rounded-full px-3 text-[13px] font-normal shadow-none"
          onClick={() => onEscolher(op)}
        >
          {op}
        </Button>
      ))}
    </div>
  )
}

function Revisao({
  r,
  lacunas,
  pendentes,
  onResponder,
}: {
  r: Rascunho
  lacunas: Lacuna[]
  pendentes: number
  onResponder: (id: string, op: string) => void
}) {
  return (
    <>
      <p className={DICA_DE_ETAPA}>
        Li a sua instrução e encontrei {lacunas.length} ponto(s) que ficaram em aberto. Enquanto eles não forem
        resolvidos eu teria que decidir sozinho, e é aí que o resultado deixa de ser o que você faria na mão.
      </p>
      {lacunas.map((l) => {
        const resp = r.lacunas[l.id]
        return (
          <CaixaDeLacuna key={l.id} titulo={l.q} resolvida={!!resp}>
            <p className="mb-2.5 text-xs leading-[18px] text-muted-foreground">{l.why}</p>
            {resp ? (
              <p className="flex items-center gap-1.5 text-[13px] leading-[19px] font-semibold text-success-strong">
                <CheckIcon aria-hidden className="size-3.5 shrink-0" />
                {resp}
              </p>
            ) : (
              <Opcoes opcoes={l.ops} onEscolher={(op) => onResponder(l.id, op)} />
            )}
          </CaixaDeLacuna>
        )
      })}
      {pendentes === 0 && <RegraFinal r={r} lacunas={lacunas} />}
    </>
  )
}

function RegraFinal({ r, lacunas }: { r: Rascunho; lacunas: Lacuna[] }) {
  const gat = GATILHOS.find((g) => g.id === r.gatilho)
  const saida = SAIDAS.filter((s) => r.saidas[s.id]).map((s) => s.curto)
  const fontes = FONTES.filter((f) => r.fontes[f.id]).map((f) => f.nome)
  const itens: [string, string][] = [
    ["Quando", gat?.t ?? ""],
    ["Lê", fontes.join(", ")],
    ...lacunas.map((l): [string, string] => [l.label || l.q.replace("?", ""), r.lacunas[l.id] ?? ""]),
    ["Aparece", saida.length ? saida.join(" e ") : "em nenhum lugar ainda"],
  ]
  return (
    <div className="rounded-lg border bg-muted px-4 py-3.5 text-[13px] leading-5">
      <p className="font-semibold">Instrução final</p>
      <p>{r.instr}</p>
      <ul className="mt-2 list-disc pl-4.5">
        {itens.map(([k, v]) => (
          <li key={k} className="mb-1 text-muted-foreground">
            <b className="font-semibold text-foreground">{k}:</b> {v}
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Etapa 3: pré-visualização                                           */
/* ------------------------------------------------------------------ */

function Previa({ r, lacunas }: { r: Rascunho; lacunas: Lacuna[] }) {
  return (
    <>
      <p className={DICA_DE_ETAPA}>
        Rodei em três licitações reais da sua carteira, sem alterar nada nelas. Se algum resultado te surpreender, volte e
        ajuste antes de ativar.
      </p>
      <ul className="mb-2">
        {LICS.map((l) => {
          const res = resultadoDaPrevia(l.caso, r)
          return (
            <li key={l.ed} className="mb-2 flex items-start gap-3 rounded-lg border bg-card px-3.5 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold">{l.ed}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{l.org}</p>
                <p className="mt-1.25 text-xs leading-[17px] text-muted-foreground">{res.why}</p>
              </div>
              <p className={cn("min-w-14 flex-none text-right text-[15px] font-bold tabular-nums", COR_DO_TOM[res.tom])}>
                <span className="sr-only">Pontos: </span>
                {res.val}
              </p>
            </li>
          )
        })}
      </ul>
      <RegraFinal r={r} lacunas={lacunas} />
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Etapa 4: ativar                                                     */
/* ------------------------------------------------------------------ */

function Ativar({ onEscolher }: { onEscolher: (recalcular: boolean) => void }) {
  return (
    <CaixaDeLacuna titulo="E as licitações que já estão em aberto?">
      <p className="mb-2.5 text-xs leading-[18px] text-muted-foreground">
        Você tem <b className="font-semibold text-foreground">14 licitações em aberto</b> que foram analisadas sem este
        agente. Recalcular pode mudar o score que a sua equipe já viu.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          className="rounded-full px-3 text-[13px] font-normal shadow-none"
          onClick={() => onEscolher(true)}
        >
          Recalcular as 14
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full px-3 text-[13px] font-normal shadow-none"
          onClick={() => onEscolher(false)}
        >
          Valer só para novas
        </Button>
      </div>
    </CaixaDeLacuna>
  )
}
