// Mecânica de SERVIÇO / SOFTWARE: checklist atende / não atende, com justificativa da IA.

import { useState } from "react"
import { ArrowUpRightIcon, CheckIcon, MessageSquareIcon, PlusIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { Dica } from "./comum"
import { VAZIO, rotuloConfianca, type EstadoChecklist, type LinhaChecklist } from "./dados"

const STATUS: Record<EstadoChecklist, { rotulo: string; variante: "success" | "destructive" | "warning" | "secondary" }> = {
  ok: { rotulo: "Atende", variante: "success" },
  no: { rotulo: "Não atende", variante: "destructive" },
  parcial: { rotulo: "Atende parcialmente", variante: "warning" },
  ne: { rotulo: "Não avaliado", variante: "secondary" },
}
const CICLO: Record<EstadoChecklist, EstadoChecklist> = { ok: "no", no: "parcial", parcial: "ne", ne: "ok" }

export function Checklist({
  linhas,
  onAlternarStatus,
  onAdicionar,
  onVerOrigem,
  onQuestionar,
}: {
  linhas: LinhaChecklist[]
  onAlternarStatus: (id: string, st: EstadoChecklist) => void
  onAdicionar: () => void
  onVerOrigem: (linha: LinhaChecklist) => void
  onQuestionar: (req: string) => void
}) {
  const [marcadas, setMarcadas] = useState<string[]>([])
  const todas = linhas.length > 0 && linhas.every((l) => marcadas.includes(l.id))
  const algumas = !todas && linhas.some((l) => marcadas.includes(l.id))

  return (
    <div className="sticky left-0 px-4">
      <div className="overflow-hidden rounded-lg border">
        <Table className="min-w-270">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-9 px-3">
                <Checkbox
                  aria-label="Selecionar todos os requisitos"
                  checked={todas ? true : algumas ? "indeterminate" : false}
                  onCheckedChange={(v) => setMarcadas(v === true ? linhas.map((l) => l.id) : [])}
                />
              </TableHead>
              <TableHead className="w-[30%] px-3 text-[13px] font-medium text-muted-foreground">Requisito</TableHead>
              <TableHead className="px-3 text-[13px] font-medium text-muted-foreground">Módulo</TableHead>
              <TableHead className="px-3 text-[13px] font-medium text-muted-foreground">Status</TableHead>
              <TableHead className="px-3 text-[13px] font-medium text-muted-foreground">Confiança IA</TableHead>
              <TableHead className="w-[30%] px-3 text-[13px] font-medium text-muted-foreground">Justificativa IA</TableHead>
              <TableHead className="px-3 text-[13px] font-medium text-muted-foreground">Responsável</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {linhas.map((r) => {
              const st = STATUS[r.st]
              const marcada = marcadas.includes(r.id)
              return (
                <TableRow key={r.id} data-state={marcada ? "selected" : undefined}>
                  <TableCell className="px-3 py-3.5 align-top">
                    <Checkbox
                      aria-label={`Selecionar ${r.req}`}
                      checked={marcada}
                      onCheckedChange={(v) =>
                        setMarcadas((m) => (v === true ? [...m, r.id] : m.filter((id) => id !== r.id)))
                      }
                    />
                  </TableCell>
                  <TableCell className="px-3 py-3.5 align-top whitespace-normal">
                    <div className="font-medium">{r.req}</div>
                    <div className="mt-0.75 text-xs text-muted-foreground">
                      Exigido: <span className="font-mono text-foreground">{r.exig || VAZIO}</span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-3">
                      <Dica texto="Ver de onde a IA extraiu (página e trecho)">
                        <Button
                          variant="link"
                          size="xs"
                          className="h-auto px-0 font-semibold has-data-[icon=inline-start]:pl-0"
                          onClick={() => onVerOrigem(r)}
                        >
                          <ArrowUpRightIcon data-icon="inline-start" />
                          Ver no edital · p.{r.origem.pag ?? VAZIO}
                        </Button>
                      </Dica>
                      <Dica texto="Questionar / impugnar este requisito">
                        <Button
                          variant="link"
                          size="xs"
                          className="h-auto px-0 font-semibold has-data-[icon=inline-start]:pl-0"
                          onClick={() => onQuestionar(r.req)}
                        >
                          <MessageSquareIcon data-icon="inline-start" />
                          Questionar
                        </Button>
                      </Dica>
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-3.5 align-top">
                    <Badge variant="secondary">{r.modulo || VAZIO}</Badge>
                  </TableCell>
                  <TableCell className="px-3 py-3.5 align-top">
                    <Dica texto="Clique para alternar o status">
                      <Badge asChild variant={st.variante}>
                        <button
                          type="button"
                          aria-label={`${r.req}: ${st.rotulo}. Alternar status`}
                          className="cursor-pointer hover:brightness-95"
                          onClick={() => onAlternarStatus(r.id, CICLO[r.st])}
                        >
                          {r.st === "ok" && <CheckIcon data-icon="inline-start" />}
                          {r.st === "no" && <XIcon data-icon="inline-start" />}
                          {st.rotulo}
                        </button>
                      </Badge>
                    </Dica>
                  </TableCell>
                  <TableCell className="px-3 py-3.5 align-top">
                    {r.c ? (
                      <Dica texto="Confiança da IA na extração">
                        <Badge
                          tabIndex={0}
                          variant={r.c === "alta" ? "success" : r.c === "media" ? "warning" : "destructive"}
                        >
                          {rotuloConfianca(r.c)}
                        </Badge>
                      </Dica>
                    ) : (
                      <span className="text-muted-foreground italic">{VAZIO}</span>
                    )}
                  </TableCell>
                  <TableCell className="px-3 py-3.5 align-top text-[13px] leading-normal whitespace-normal text-muted-foreground">
                    {r.just || VAZIO}
                  </TableCell>
                  <TableCell className="px-3 py-3.5 align-top">
                    <Badge asChild variant="secondary">
                      <button type="button" data-nao-prototipado className={cn("cursor-pointer gap-1.5 pl-1")}>
                        <span aria-hidden className="size-3.5 rounded-full bg-muted-foreground/30" />
                        Selecionar
                      </button>
                    </Badge>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        <button
          type="button"
          onClick={onAdicionar}
          className="flex w-full items-center gap-2 border-t px-3 py-3.5 text-[13px] font-semibold text-primary hover:bg-muted [&_svg]:size-3.75"
        >
          <PlusIcon aria-hidden /> Adicionar requisito
        </button>
      </div>
    </div>
  )
}
