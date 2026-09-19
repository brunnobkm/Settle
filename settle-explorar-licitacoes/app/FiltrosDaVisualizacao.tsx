// Filtros salvos na visualização, como selos ("Órgão: 2 selecionadas ▾").
// Clicar abre um popover: lista com múltipla seleção ou data (atalhos + calendário).

import { useEffect, useState } from "react"
import { ChevronDownIcon, SearchIcon } from "lucide-react"
import { ptBR } from "react-day-picker/locale"

import { cn } from "@/lib/utils"
import { useAppShell } from "@/components/ui/app-shell"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

import {
  HOJE,
  PRESETS_DATA,
  formatarData,
  lerData,
  normalizar,
  type Filtro,
  type FiltroData,
  type FiltroLista,
} from "./dados"

export function rotuloDoFiltro(f: Filtro) {
  if (f.tipo === "data") {
    if (f.valor.preset) return PRESETS_DATA[f.modo].find((p) => p.chave === f.valor.preset)?.rotulo ?? f.valor.preset
    if (f.valor.data) return f.valor.data === formatarData(HOJE) ? "Hoje" : f.valor.data
    return "Qualquer data"
  }
  if (!f.valor.length) return "Qualquer"
  return f.valor.length === 1 ? f.valor[0] : `${f.valor.length} selecionadas`
}

export function FiltrosDaVisualizacao({
  filtros,
  onAlterar,
}: {
  filtros: Filtro[]
  onAlterar: (indice: number, filtro: Filtro) => void
}) {
  const { headerHidden } = useAppShell()
  const [aberto, setAberto] = useState<number | null>(null)

  // fecha o popover ao rolar (a barra de selos recolhe junto com a navbar)
  useEffect(() => {
    const fechar = () => setAberto(null)
    window.addEventListener("scroll", fechar, { passive: true })
    return () => window.removeEventListener("scroll", fechar)
  }, [])

  if (!filtros.length) return null

  return (
    <div
      role="group"
      aria-label="Filtros da visualização"
      onScroll={() => setAberto(null)}
      className={cn(
        "mt-3 flex max-h-15 items-center gap-2 overflow-x-auto pb-0.5 transition-[max-height,opacity,margin] duration-250 ease-out",
        // rolando para baixo (navbar escondida): os selos recolhem
        headerHidden && "pointer-events-none mt-0 max-h-0 overflow-hidden opacity-0"
      )}
    >
      {filtros.map((f, i) => (
        <Popover key={f.rotulo} open={aberto === i} onOpenChange={(o) => setAberto(o ? i : null)}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="xs"
              className="flex-none gap-1.25 rounded-full bg-foreground/10 px-2.75 font-normal hover:bg-foreground/15 aria-expanded:bg-foreground/20"
            >
              <span className="text-muted-foreground">{f.rotulo}:</span>
              <span className="font-semibold text-foreground">{rotuloDoFiltro(f)}</span>
              <ChevronDownIcon data-icon="inline-end" className="text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className={cn("gap-2 p-2", f.tipo === "data" ? "w-75" : "w-62")}>
            {f.tipo === "data" ? (
              <PopoverDeData
                filtro={f}
                onAlterar={(novo) => {
                  onAlterar(i, novo)
                  setAberto(null)
                }}
              />
            ) : (
              <PopoverDeLista filtro={f} onAlterar={(novo) => onAlterar(i, novo)} />
            )}
          </PopoverContent>
        </Popover>
      ))}
    </div>
  )
}

function PopoverDeLista({ filtro, onAlterar }: { filtro: FiltroLista; onAlterar: (f: FiltroLista) => void }) {
  const [busca, setBusca] = useState("")
  const todas = filtro.valor.length === filtro.opcoes.length
  const opcoes = filtro.opcoes.filter((o) => normalizar(o).includes(normalizar(busca)))

  return (
    <>
      <div className="flex items-center justify-between px-1.5 pt-1">
        <span className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Lista de opções</span>
        <Button
          variant="link"
          size="xs"
          className="h-auto px-0 font-semibold"
          onClick={() => onAlterar({ ...filtro, valor: todas ? [] : [...filtro.opcoes] })}
        >
          {todas ? "Limpar" : "Selecionar tudo"}
        </Button>
      </div>
      <InputGroup className="h-8">
        <InputGroupInput
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar"
          aria-label={`Buscar em ${filtro.rotulo}`}
        />
        <InputGroupAddon align="inline-end">
          <SearchIcon />
        </InputGroupAddon>
      </InputGroup>
      <ul className="flex max-h-55 flex-col overflow-auto">
        {opcoes.map((o) => {
          const marcada = filtro.valor.includes(o)
          return (
            <li key={o}>
              <label className="flex cursor-pointer items-center gap-2.25 rounded-md px-2 py-1.75 text-sm hover:bg-muted">
                <Checkbox
                  checked={marcada}
                  onCheckedChange={() =>
                    onAlterar({
                      ...filtro,
                      valor: marcada ? filtro.valor.filter((v) => v !== o) : [...filtro.valor, o],
                    })
                  }
                />
                <span className="min-w-0">{o}</span>
              </label>
            </li>
          )
        })}
      </ul>
    </>
  )
}

function PopoverDeData({ filtro, onAlterar }: { filtro: FiltroData; onAlterar: (f: FiltroData) => void }) {
  const selecionada = filtro.valor.data ? lerData(filtro.valor.data) : undefined
  return (
    <>
      <ToggleGroup
        type="single"
        spacing={0}
        value={filtro.valor.preset ?? ""}
        onValueChange={(preset) => preset && onAlterar({ ...filtro, valor: { preset } })}
        aria-label="Atalhos de período"
        className="w-full rounded-lg bg-muted p-0.75"
      >
        {PRESETS_DATA[filtro.modo].map((p) => (
          <ToggleGroupItem
            key={p.chave}
            value={p.chave}
            className="h-7 flex-1 rounded-md px-1 text-xs text-muted-foreground data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-xs"
          >
            {p.rotulo}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <Calendar
        mode="single"
        locale={ptBR}
        today={HOJE}
        selected={selecionada}
        defaultMonth={selecionada ?? HOJE}
        disabled={filtro.modo === "passado" ? { after: HOJE } : { before: HOJE }}
        onSelect={(d) => d && onAlterar({ ...filtro, valor: { data: formatarData(d) } })}
        className="w-full p-1"
      />
    </>
  )
}
