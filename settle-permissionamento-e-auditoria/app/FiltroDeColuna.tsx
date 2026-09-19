// Funil no cabeçalho de uma coluna: abre um popover com a lista de valores
// (caixas de seleção) ou um intervalo de datas (De / Até).

import { useId, useState } from "react"
import { FunnelIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

import { filtroAtivo, type ValorFiltro } from "./dados"

type Props = {
  rotulo: string
  valor: ValorFiltro | undefined
  onAlterar: (valor: ValorFiltro | undefined) => void
} & ({ tipo: "lista"; opcoes: string[] } | { tipo: "data" })

export function FiltroDeColuna(props: Props) {
  const { rotulo, valor, onAlterar } = props
  const ativo = filtroAtivo(valor)
  const id = useId()
  const [aberto, setAberto] = useState(false)

  return (
    <Popover open={aberto} onOpenChange={setAberto}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={ativo ? `Filtrar ${rotulo} (filtro aplicado)` : `Filtrar ${rotulo}`}
          title="Filtrar"
          className={cn("text-muted-foreground/60 hover:text-foreground", ativo && "text-primary hover:text-primary")}
        >
          <FunnelIcon className={cn(ativo && "fill-current")} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-57 gap-0 rounded-lg p-2.5">
        {props.tipo === "data" ? (
          <div className="flex flex-col gap-2.5">
            {(["de", "ate"] as const).map((campo) => {
              const atual = valor && !Array.isArray(valor) ? valor : {}
              return (
                <div key={campo} className="flex items-center justify-between gap-3">
                  <Label htmlFor={`${id}-${campo}`} className="text-[12.5px] font-normal text-muted-foreground">
                    {campo === "de" ? "De" : "Até"}
                  </Label>
                  <Input
                    id={`${id}-${campo}`}
                    type="date"
                    className="h-8 w-auto text-[13px]"
                    value={atual[campo] ?? ""}
                    onChange={(e) => {
                      const proximo = {
                        ...atual,
                        [campo]: e.target.value || undefined,
                      }
                      onAlterar(proximo.de || proximo.ate ? proximo : undefined)
                    }}
                  />
                </div>
              )
            })}
          </div>
        ) : (
          <div role="group" aria-label={`Valores de ${rotulo}`} className="flex max-h-57.5 flex-col overflow-y-auto">
            {props.opcoes.map((opcao, i) => {
              const marcados = Array.isArray(valor) ? valor : []
              const marcado = marcados.includes(opcao)
              return (
                <div key={opcao} className="flex items-center gap-2 px-1 py-1.5">
                  <Checkbox
                    id={`${id}-${i}`}
                    checked={marcado}
                    onCheckedChange={(c) => {
                      const proximo = c === true ? [...marcados, opcao] : marcados.filter((x) => x !== opcao)
                      onAlterar(proximo.length ? proximo : undefined)
                    }}
                  />
                  <Label htmlFor={`${id}-${i}`} className="flex-1 text-[13.5px] font-normal">
                    {opcao}
                  </Label>
                </div>
              )
            })}
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="mt-1.5 h-7 w-full justify-start px-1 text-[12.5px] font-normal text-muted-foreground"
          onClick={() => {
            onAlterar(undefined)
            setAberto(false)
          }}
        >
          Limpar filtro
        </Button>
      </PopoverContent>
    </Popover>
  )
}
