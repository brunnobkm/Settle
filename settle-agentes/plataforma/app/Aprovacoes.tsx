// A fila de aprovações: as ações que os agentes querem executar e que alguém
// configurou para pedir aprovação, de todos os agentes num lugar só, respondidas em
// lote (o corner case do Bruno Ortiz em 02/09).

import { useState } from "react"
import { CheckIcon, XIcon } from "lucide-react"

import { ActionBarButton } from "@/components/ui/action-bar"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"

import type { Aprovacao } from "./dados"
import { useSim } from "./estado"

const COLUNAS: DataTableColumn<Aprovacao>[] = [
  {
    id: "lic",
    header: "Licitação",
    width: 260,
    wrap: true,
    cell: (a) => (
      <span className="flex flex-col">
        <b className="text-[13px] font-semibold">{a.lic}</b>
        <span className="text-xs text-muted-foreground">{a.org}</span>
      </span>
    ),
  },
  { id: "agente", header: "Agente", width: 150, cell: (a) => <span className="text-[13px]">{a.agente}</span> },
  { id: "acao", header: "Ação proposta", width: 240, wrap: true, cell: (a) => <span className="text-[13px]">{a.acao}</span> },
  {
    id: "por",
    header: "Por quê",
    width: 320,
    wrap: true,
    cell: (a) => <span className="text-[13px] text-muted-foreground">{a.por}</span>,
  },
  { id: "quando", header: "Pedido em", width: 130, cell: (a) => <span className="text-[13px] text-muted-foreground">{a.quando}</span> },
]

export function Aprovacoes() {
  const { aprovacoes, responderAprovacoes } = useSim()
  const [sel, setSel] = useState<string[]>([])
  const selecionadas = sel.filter((id) => aprovacoes.some((a) => a.id === id))

  const responder = (aprovou: boolean) => {
    const antes = selecionadas
    responderAprovacoes(selecionadas, aprovou, () => setSel([]), () => setSel(antes))
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs leading-[17px] text-muted-foreground">
        Ações que os agentes querem executar e que você configurou para pedir aprovação. Selecione várias para responder de
        uma vez.
      </p>
      <DataTable
        columns={COLUNAS}
        rows={aprovacoes}
        getRowId={(a) => a.id}
        getRowLabel={(a) => a.lic}
        selectedIds={selecionadas}
        onSelectedIdsChange={setSel}
        labels={{
          selectAll: "Selecionar todas",
          empty: "Nada esperando por você. As ações que os agentes executam sozinhos ficam no histórico de cada agente.",
        }}
        bulkActions={
          <>
            <ActionBarButton onClick={() => responder(false)}>
              <XIcon />
              Recusar
            </ActionBarButton>
            <ActionBarButton onClick={() => responder(true)}>
              <CheckIcon />
              Aprovar
            </ActionBarButton>
          </>
        }
      />
    </div>
  )
}
