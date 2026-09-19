// Score da Vivo (POC): temperatura, pontuação, aviso de itens em revisão e a janela
// "Como o score é calculado?".

import { useState } from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { SCORE } from "./dados"

export function CartaoDoScore() {
  const [explicacao, setExplicacao] = useState(false)
  const { quente, morno } = SCORE.limites

  return (
    <Card className="flex-none gap-0 rounded-xl py-3.5 shadow-none">
      <CardContent className="grid justify-items-start gap-1.5 px-4">
        <Badge variant="warning" className="text-xs">
          {SCORE.temperatura}
        </Badge>
        <strong className="text-[32px] leading-none font-bold tabular-nums">
          {SCORE.valor}/{SCORE.maximo}
        </strong>
        <Button variant="link" size="xs" className="h-auto px-0 py-0.75 text-xs font-semibold" onClick={() => setExplicacao(true)}>
          Como isso é calculado?
        </Button>
        <Alert variant="warning" className="px-3 py-2.5">
          <AlertDescription className="text-xs leading-[1.45] font-semibold text-warning-strong">
            Itens em revisão não entram no cálculo. Revise todos para atualizar o score.
          </AlertDescription>
        </Alert>
      </CardContent>

      <Dialog open={explicacao} onOpenChange={setExplicacao}>
        <DialogContent className="gap-0 p-0 sm:max-w-105">
          <DialogHeader className="border-b px-4 py-3.5">
            <DialogTitle className="text-base leading-tight font-semibold">Como o score é calculado?</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3.5 p-4">
            <DialogDescription className="text-[13px] leading-normal">
              O score soma os pontos dos critérios definidos pela Vivo para classificar a oportunidade como Quente,
              Morno ou Frio.
            </DialogDescription>
            <dl className="grid divide-y overflow-hidden rounded-[10px] border">
              {[
                ["Quente", `${quente} pontos ou mais`],
                ["Morno", `${morno} a ${quente - 1} pontos`],
                ["Frio", `Abaixo de ${morno} pontos`],
              ].map(([faixa, regra]) => (
                <div key={faixa} className="grid grid-cols-[92px_minmax(0,1fr)] gap-2.5 px-3 py-2.5">
                  <dt className="text-[13px] font-semibold">{faixa}</dt>
                  <dd className="text-[13px] leading-snug text-muted-foreground">{regra}</dd>
                </div>
              ))}
            </dl>
            <p className="text-[13px] leading-normal text-muted-foreground">
              Cada critério compara o que foi encontrado no edital com o esperado pela Vivo. Se houver ambiguidade, o
              score fica pendente de confirmação até a revisão.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
