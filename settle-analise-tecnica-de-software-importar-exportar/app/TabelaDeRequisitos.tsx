// Tabela de requisitos da análise técnica: seleção por linha, status (com brilho quando é
// sugestão da IA), confiança, justificativa, responsável e notas.

import { PlusIcon, SparklesIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { STATUS, type Confianca, type Requisito, type Status } from "./dados"

// "Atende com parceiro" fica entre o âmbar de "parcialmente" e o vermelho de "não atende"
const COR_LARANJA = "text-[color-mix(in_oklch,var(--warning),var(--destructive)_45%)]"

const COR_DO_STATUS: Record<Status, string> = {
  [STATUS.ATENDE]: "text-success",
  [STATUS.PARCIAL]: "text-warning",
  [STATUS.PARCEIRO]: COR_LARANJA,
  [STATUS.NAO]: "text-destructive",
}

const VARIANTE_DA_CONFIANCA: Record<Confianca, "success" | "warning" | "destructive"> = {
  Alta: "success",
  Média: "warning",
  Baixa: "destructive",
}

const COLUNAS = [
  { rotulo: "Requisito", largura: "w-[27%]" },
  { rotulo: "Módulo", largura: "w-27.5" },
  { rotulo: "Status", largura: "w-37.5" },
  { rotulo: "Confiança IA", largura: "w-25" },
  { rotulo: "Justificativa IA", largura: "w-[27%]" },
  { rotulo: "Responsável", largura: "w-32.5" },
  { rotulo: "Notas", largura: "w-22.5" },
]

const CELULA = "px-3.5 py-3 align-top whitespace-normal"

export function TabelaDeRequisitos({
  linhas,
  tipo,
  selecionados,
  onSelecionadosChange,
}: {
  linhas: Requisito[]
  tipo: string
  selecionados: string[]
  onSelecionadosChange: (ids: string[]) => void
}) {
  const marcados = linhas.filter((r) => selecionados.includes(r.id)).length
  const todos = linhas.length > 0 && marcados === linhas.length
  const idsVisiveis = linhas.map((r) => r.id)

  function marcarTodos(marcar: boolean) {
    const outros = selecionados.filter((id) => !idsVisiveis.includes(id))
    onSelecionadosChange(marcar ? [...outros, ...idsVisiveis] : outros)
  }

  function marcar(id: string, marcar: boolean) {
    onSelecionadosChange(marcar ? [...selecionados, id] : selecionados.filter((s) => s !== id))
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <Table className="min-w-275 table-fixed text-[13px]">
        <TableHeader className="bg-muted">
          <TableRow className="hover:bg-transparent">
            <TableHead className={cn(CELULA, "h-auto w-10")}>
              <Checkbox
                aria-label="Selecionar todos os requisitos"
                checked={todos ? true : marcados > 0 ? "indeterminate" : false}
                onCheckedChange={(v) => marcarTodos(v === true)}
                disabled={!linhas.length}
              />
            </TableHead>
            {COLUNAS.map((c) => (
              <TableHead
                key={c.rotulo}
                scope="col"
                className={cn(CELULA, "h-auto text-xs font-semibold text-muted-foreground", c.largura)}
              >
                {c.rotulo}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {linhas.map((r) => {
            const marcado = selecionados.includes(r.id)
            return (
              <TableRow key={r.id} data-state={marcado ? "selected" : undefined}>
                <TableCell className={CELULA}>
                  <Checkbox
                    aria-label={`Selecionar ${r.id}`}
                    checked={marcado}
                    onCheckedChange={(v) => marcar(r.id, v === true)}
                  />
                </TableCell>
                <TableCell className={cn(CELULA, "text-[12.5px] leading-[1.45]")}>{r.requisito}</TableCell>
                <TableCell className={cn(CELULA, "text-[12.5px] leading-[1.45]")}>
                  {r.modulo || <span className="text-muted-foreground">Sem módulo</span>}
                </TableCell>
                <TableCell className={CELULA}>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.25 px-2.25 py-1 text-xs font-semibold whitespace-nowrap",
                      COR_DO_STATUS[r.status]
                    )}
                  >
                    {r.aiSuggested && (
                      <>
                        <SparklesIcon aria-hidden className="size-3" />
                        <span className="sr-only">Sugestão da IA:</span>
                      </>
                    )}
                    {r.status}
                  </span>
                </TableCell>
                <TableCell className={CELULA}>
                  <Badge
                    variant={VARIANTE_DA_CONFIANCA[r.confianca]}
                    className="h-auto rounded-md px-2.5 py-0.75 text-xs font-semibold"
                  >
                    {r.confianca}
                  </Badge>
                </TableCell>
                <TableCell className={cn(CELULA, "text-[12.5px] leading-[1.45] text-muted-foreground")}>
                  {r.justificativa}
                </TableCell>
                <TableCell className={CELULA}>
                  <button
                    type="button"
                    data-nao-prototipado
                    aria-label={r.responsavel ? `Responsável: ${r.responsavel}. Alterar` : `Selecionar responsável de ${r.id}`}
                    className={cn(
                      "inline-flex max-w-full items-center rounded-md border bg-muted px-2.5 py-1 text-left text-xs outline-none hover:bg-muted/70 focus-visible:ring-3 focus-visible:ring-ring/50",
                      !r.responsavel && "text-muted-foreground"
                    )}
                  >
                    {r.responsavel || "Selecionar"}
                  </button>
                </TableCell>
                <TableCell className={CELULA}>
                  {r.notas ? (
                    <span className="text-[12.5px] leading-[1.45]">{r.notas}</span>
                  ) : (
                    <button
                      type="button"
                      data-nao-prototipado
                      aria-label={`Adicionar nota em ${r.id}`}
                      className="inline-block rounded-md border border-dashed px-2.5 py-1 text-xs text-muted-foreground outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      Nota
                    </button>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
          {!linhas.length && (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={COLUNAS.length + 1} className="px-3.5 py-10 text-center text-muted-foreground">
                Nenhum requisito do tipo {tipo} nesta análise.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Button
        variant="ghost"
        data-nao-prototipado
        className="h-auto w-full justify-start rounded-none border-t px-4 py-3.25 text-[13px] text-primary hover:text-primary"
      >
        <PlusIcon data-icon="inline-start" />
        Adicionar requisito
      </Button>
    </div>
  )
}
