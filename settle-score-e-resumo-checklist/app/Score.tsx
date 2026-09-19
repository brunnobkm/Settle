// Aba Score: 5 modelos de evidência do score no card, cada um com as 3 temperaturas.

import type { ReactNode } from "react"
import { GaugeIcon, PencilIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LicitacaoCardStatusButton } from "@/components/ui/licitacao-card"
import { Progress } from "@/components/ui/progress"
import { ScoreMeter } from "@/components/ui/score-meter"

import { CardDoEdital, GradeDeMetadadosCompleta, type Encaixes } from "./CardDoEdital"
import { CLASSES_DO_TOM, EDITAL_PADRAO, EXEMPLOS_DE_SCORE, type ExemploDeScore, type Temperatura } from "./dados"
import { Variacoes } from "./Variacoes"

/** Selo da temperatura (Frio / Morno / Quente). */
export function SeloDaTemperatura({ temperatura, className }: { temperatura: Temperatura; className?: string }) {
  return (
    <Badge variant={temperatura.tom} className={cn("h-auto rounded-md px-1.75 py-0.5 leading-4 font-semibold", className)}>
      {temperatura.rotulo}
    </Badge>
  )
}

/* A1: chip de score na barra de ações */
function ChipDeScore({ s }: { s: ExemploDeScore }) {
  const tom = CLASSES_DO_TOM[s.tom]
  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label={`Score ${s.valor} de 100, ${s.rotulo}`}
      className={cn("gap-1.5 rounded-lg px-3 font-semibold", tom.fundo, tom.texto, tom.hover)}
      data-nao-prototipado
    >
      <GaugeIcon data-icon="inline-start" />
      <b>{s.valor}</b>
      <span className="font-medium opacity-75">/100</span>
    </Button>
  )
}

/* A2 e A5: bloco compacto com o anel e a temperatura */
function BlocoDeScore({ s }: { s: ExemploDeScore }) {
  return (
    <div className="flex flex-none flex-col items-center justify-center gap-2.5 rounded-lg border bg-card p-3.5 min-[901px]:w-65.25">
      <ScoreMeter value={s.valor} tone={s.tom} size={64} label={`Score ${s.valor} de 100`} />
      <SeloDaTemperatura temperatura={s} />
    </div>
  )
}

/* A3: módulo faixa no topo */
function FaixaDeScore({ s }: { s: ExemploDeScore }) {
  const tom = CLASSES_DO_TOM[s.tom]
  return (
    <div className="flex items-center gap-5 rounded-lg border bg-card px-4 py-3 max-[900px]:flex-wrap">
      <ScoreMeter value={s.valor} tone={s.tom} size={66} label={`Score ${s.valor} de 100`} />
      <div className="min-w-30 flex-1">
        <div className="mb-2 flex items-center gap-2">
          <SeloDaTemperatura temperatura={s} />
          <span className="text-[13px] text-muted-foreground">
            {s.revisar ? "Score parcial calculado" : "Score consolidado"}
          </span>
        </div>
        <Progress
          value={s.valor}
          aria-label={`Score ${s.valor} de 100`}
          className={cn("h-2", tom.indicador)}
        />
      </div>
      {s.revisar > 0 && (
        <div className="flex flex-none flex-col items-end gap-1.5 text-right max-[900px]:items-start max-[900px]:text-left">
          <span className="text-[13px] font-medium text-warning">{s.revisar} campos a revisar</span>
          <LicitacaoCardStatusButton data-nao-prototipado>
            <PencilIcon data-icon="inline-start" />
            Revisar
          </LicitacaoCardStatusButton>
        </div>
      )}
    </div>
  )
}

/* A4: faixa colada no topo do mesmo card */
function FaixaNoTopo({ s }: { s: ExemploDeScore }) {
  const tom = CLASSES_DO_TOM[s.tom]
  return (
    <div className={cn("flex items-center justify-between gap-3 border-b px-4 py-2.5", tom.fundo)}>
      <p className={cn("flex items-center gap-2 text-lg leading-none font-bold", tom.texto)}>
        <GaugeIcon aria-hidden className="size-5" />
        <span className="sr-only">Score</span>
        <b>{s.valor}</b>
        <span className="text-[15px] font-medium opacity-70">/100</span>
        <span className="sr-only">, {s.rotulo}</span>
      </p>
      {s.revisar > 0 && (
        <Badge className="h-auto rounded-lg bg-warning px-3 py-1.25 text-[13px] font-semibold text-warning-foreground">
          {s.revisar} itens para Revisar
        </Badge>
      )}
    </div>
  )
}

const MODELOS: { chave: string; nome: string; encaixes: (s: ExemploDeScore) => Encaixes }[] = [
  { chave: "A1", nome: "Chip na barra de ações", encaixes: (s) => ({ acaoExtra: <ChipDeScore s={s} /> }) },
  { chave: "A2", nome: "Bloco compacto no cabeçalho", encaixes: (s) => ({ aoLadoDoCabecalho: <BlocoDeScore s={s} /> }) },
  { chave: "A3", nome: "Módulo faixa no topo", encaixes: (s) => ({ moduloNoTopo: <FaixaDeScore s={s} /> }) },
  { chave: "A4", nome: "Faixa no topo do card", encaixes: (s) => ({ faixaNoTopo: <FaixaNoTopo s={s} /> }) },
  {
    chave: "A5",
    nome: "Score na linha de metadados",
    encaixes: (s) => ({
      metadados: (
        <div className="flex gap-2 max-[900px]:flex-col">
          <BlocoDeScore s={s} />
          <GradeDeMetadadosCompleta />
        </div>
      ),
    }),
  },
]

export function PropostasDeScore() {
  return (
    <div className="flex flex-col gap-6">
      {MODELOS.map((m) => (
        <Proposta key={m.chave} nome={`${m.chave}: ${m.nome}`}>
          <Variacoes rotulos={EXEMPLOS_DE_SCORE.map((s) => s.rotulo)}>
            {(i) => <CardDoEdital edital={EDITAL_PADRAO} {...m.encaixes(EXEMPLOS_DE_SCORE[i])} />}
          </Variacoes>
        </Proposta>
      ))}
    </div>
  )
}

/** Uma proposta da comparação. O nome fica só para leitores de tela, como no original (sem título visível). */
export function Proposta({ nome, children }: { nome: string; children: ReactNode }) {
  return (
    <section aria-label={nome}>
      {children}
    </section>
  )
}
