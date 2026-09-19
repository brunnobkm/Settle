// Aba Checklist: 4 modelos de visibilidade da lista de campos no card, cada um
// com as variações "Com itens a revisar" e "Tudo certo".

import { ChevronDownIcon, ListChecksIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

import { CardDoEdital, type Encaixes } from "./CardDoEdital"
import {
  CHECKLIST,
  CHECKLIST_COMPLETO,
  EDITAL_PADRAO,
  VARIACOES_DO_CHECKLIST,
  pendentesDaSecao,
  pendentesDoChecklist,
  type SecaoDoChecklist,
} from "./dados"
import { Proposta } from "./Score"
import { Variacoes } from "./Variacoes"

type Lista = SecaoDoChecklist[]

/** Selo âmbar "N a revisar". */
function SeloARevisar({ n }: { n: number }) {
  return (
    <Badge variant="warning" className="h-auto rounded-md px-1.75 py-0.5 leading-4 font-semibold">
      {n} a revisar
    </Badge>
  )
}

/** Valor do campo; sem valor extraído vira "Revisar" (texto, não só cor). */
function ValorDoCampo({ valor, className }: { valor: string | null; className?: string }) {
  return valor === null ? (
    <span className={cn("font-semibold text-warning", className)}>Revisar</span>
  ) : (
    <span className={cn("text-muted-foreground", className)}>{valor}</span>
  )
}

// botão da barra no tom do estado: âmbar com pendências, verde quando completo
const TOM_REVISAR = "border-warning bg-warning/10 text-warning hover:bg-warning/15 hover:text-warning aria-expanded:bg-warning/15 aria-expanded:text-warning"
const TOM_OK = "border-success bg-success/10 text-success hover:bg-success/15 hover:text-success aria-expanded:bg-success/15 aria-expanded:text-success"

/* B1: botão de acesso (texto quando há revisão; só ícone quando completo) */
function BotaoDeAcesso({ lista }: { lista: Lista }) {
  const p = pendentesDoChecklist(lista)
  return p ? (
    <Button variant="outline" size="sm" className={cn("rounded-lg px-3 font-semibold shadow-none", TOM_REVISAR)} data-nao-prototipado>
      <ListChecksIcon data-icon="inline-start" />
      {p} itens para revisar
    </Button>
  ) : (
    <Button
      variant="outline"
      size="icon-sm"
      aria-label="Checklist completo"
      className={cn("rounded-lg shadow-none", TOM_OK)}
      data-nao-prototipado
    >
      <ListChecksIcon />
    </Button>
  )
}

/* cabeçalho fixo dos módulos B2 e B3 */
function TopoDoModulo({ lista }: { lista: Lista }) {
  const p = pendentesDoChecklist(lista)
  return (
    <div className="sticky top-0 flex items-center gap-2 border-b bg-card px-3 py-2.5">
      <h3 className="text-[15px] font-semibold">Checklist</h3>
      {p > 0 && <SeloARevisar n={p} />}
    </div>
  )
}

/* B2: grade dos campos, agrupados por seção */
function GradeDoChecklist({ lista }: { lista: Lista }) {
  return (
    <section aria-label="Checklist" className="max-h-70 overflow-y-auto rounded-lg border bg-card">
      <TopoDoModulo lista={lista} />
      {lista.map((secao, i) => (
        <div key={secao.nome} className={cn("p-3", i > 0 && "border-t")}>
          <h4 className="mb-2.5 text-xs font-semibold tracking-[.03em] text-muted-foreground uppercase">{secao.nome}</h4>
          <dl className="grid grid-cols-4 gap-x-5 gap-y-3.5 max-[900px]:grid-cols-2">
            {secao.campos.map(([campo, valor]) => (
              <div key={campo} className="min-w-0">
                <dt className="mb-1 text-sm leading-5 font-semibold">{campo}</dt>
                <dd className="truncate text-sm leading-5">
                  <ValorDoCampo valor={valor} />
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </section>
  )
}

/* B3: acordeão por seção (a primeira começa aberta) */
function AcordeaoDoChecklist({ lista }: { lista: Lista }) {
  return (
    <section aria-label="Checklist" className="max-h-70 overflow-y-auto rounded-lg border bg-card">
      <TopoDoModulo lista={lista} />
      <Accordion type="multiple" defaultValue={[lista[0].nome]}>
        {lista.map((secao) => {
          const p = pendentesDaSecao(secao)
          return (
            <AccordionItem key={secao.nome} value={secao.nome} className="border-t not-last:border-b-0 first:border-t-0">
              <AccordionTrigger className="items-center rounded-none px-3 py-2.75 text-sm font-semibold hover:no-underline">
                <span className="flex items-center gap-2">
                  {secao.nome}
                  <span className="text-xs font-medium text-muted-foreground">{secao.campos.length} campos</span>
                  {p > 0 && <SeloARevisar n={p} />}
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-1.5">
                <dl>
                  {secao.campos.map(([campo, valor]) => (
                    <div key={campo} className="flex items-center justify-between gap-3 border-t py-1.75 text-sm">
                      <dt>{campo}</dt>
                      <dd>
                        <ValorDoCampo valor={valor} />
                      </dd>
                    </div>
                  ))}
                </dl>
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </section>
  )
}

/* B4: botão "Checklist" na barra com a lista num painel suspenso */
function ChecklistSuspenso({ lista }: { lista: Lista }) {
  const p = pendentesDoChecklist(lista)
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          aria-label={p ? `Checklist, ${p} itens para revisar` : "Checklist completo"}
          className={cn("group/checklist rounded-lg px-3 font-semibold shadow-none", p ? TOM_REVISAR : TOM_OK)}
        >
          <ListChecksIcon data-icon="inline-start" />
          Checklist
          <ChevronDownIcon data-icon="inline-end" className="transition-transform group-aria-expanded/checklist:rotate-180" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={6} className="max-h-110 w-90 rounded-lg max-w-[calc(100vw-60px)] gap-0 overflow-y-auto p-2">
        {lista.map((secao) => {
          const pendentes = pendentesDaSecao(secao)
          return (
            <div key={secao.nome} className="px-0.5 pt-0.5 pb-2 not-first:mt-1 not-first:border-t not-first:pt-2">
              <div className="flex items-center gap-2 px-0.5 pt-0.5 pb-1.5">
                <h4 className="text-xs font-semibold tracking-[.03em] text-muted-foreground uppercase">{secao.nome}</h4>
                {pendentes > 0 && <SeloARevisar n={pendentes} />}
              </div>
              <dl>
                {secao.campos.map(([campo, valor]) => (
                  <div key={campo} className="px-0.5 py-1.5 text-sm">
                    <dt>{campo}</dt>
                    <dd className="mt-0.5">
                      <ValorDoCampo valor={valor} />
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )
        })}
        <Button className="mt-2 w-full" data-nao-prototipado>
          Ver lista completa
        </Button>
      </PopoverContent>
    </Popover>
  )
}

const MODELOS: { chave: string; nome: string; encaixes: (lista: Lista) => Encaixes }[] = [
  { chave: "B1", nome: "Botão de acesso", encaixes: (l) => ({ acaoExtra: <BotaoDeAcesso lista={l} /> }) },
  { chave: "B2", nome: "Grade dos campos por seção", encaixes: (l) => ({ antesDosItens: <GradeDoChecklist lista={l} /> }) },
  { chave: "B3", nome: "Acordeão por seção", encaixes: (l) => ({ antesDosItens: <AcordeaoDoChecklist lista={l} /> }) },
  { chave: "B4", nome: "Botão Checklist com dropdown", encaixes: (l) => ({ acaoExtra: <ChecklistSuspenso lista={l} /> }) },
]

const LISTAS = [CHECKLIST, CHECKLIST_COMPLETO]

export function PropostasDeChecklist() {
  return (
    <div className="flex flex-col gap-6">
      {MODELOS.map((m) => (
        <Proposta key={m.chave} nome={`${m.chave}: ${m.nome}`}>
          <Variacoes rotulos={VARIACOES_DO_CHECKLIST}>
            {(i) => <CardDoEdital edital={EDITAL_PADRAO} {...m.encaixes(LISTAS[i])} />}
          </Variacoes>
        </Proposta>
      ))}
    </div>
  )
}
