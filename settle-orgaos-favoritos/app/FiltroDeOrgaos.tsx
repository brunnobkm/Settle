// Filtro fixo da aba "Órgãos favoritos", como selo ("Órgão: 2 selecionadas ▾").
// Clicar abre um popover com a lista de órgãos (múltipla seleção, busca e "Selecionar tudo").

import { useEffect, useState } from "react"
import { ChevronDownIcon, SearchIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { useAppShell } from "@/components/ui/app-shell"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

import { normalizar } from "./dados"

function rotuloDaSelecao(valor: string[]) {
  if (!valor.length) return "Qualquer"
  return valor.length === 1 ? valor[0] : `${valor.length} selecionadas`
}

export function FiltroDeOrgaos({
  rotulo,
  opcoes,
  valor,
  onAlterar,
}: {
  rotulo: string
  opcoes: string[]
  valor: string[]
  onAlterar: (valor: string[]) => void
}) {
  const { headerHidden } = useAppShell()
  const [aberto, setAberto] = useState(false)

  // fecha o popover ao rolar (a barra de selos recolhe junto com a navbar)
  useEffect(() => {
    const fechar = () => setAberto(false)
    window.addEventListener("scroll", fechar, { passive: true })
    return () => window.removeEventListener("scroll", fechar)
  }, [])

  return (
    <div
      role="group"
      aria-label="Filtros da aba"
      onScroll={() => setAberto(false)}
      className={cn(
        "mt-3 flex max-h-15 items-center gap-2 overflow-x-auto pb-0.5 transition-[max-height,opacity,margin] duration-250 ease-out",
        // rolando para baixo (navbar escondida): os selos recolhem
        headerHidden && "pointer-events-none mt-0 max-h-0 overflow-hidden opacity-0"
      )}
    >
      <Popover open={aberto} onOpenChange={setAberto}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="xs"
            className="flex-none gap-1.25 rounded-full bg-foreground/10 px-2.75 font-normal hover:bg-foreground/15 aria-expanded:bg-foreground/20"
          >
            <span className="text-muted-foreground">{rotulo}:</span>
            <span className="font-semibold text-foreground">{rotuloDaSelecao(valor)}</span>
            <ChevronDownIcon data-icon="inline-end" className="text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-62 gap-2 p-2">
          <ListaDeOpcoes rotulo={rotulo} opcoes={opcoes} valor={valor} onAlterar={onAlterar} />
        </PopoverContent>
      </Popover>
    </div>
  )
}

function ListaDeOpcoes({
  rotulo,
  opcoes,
  valor,
  onAlterar,
}: {
  rotulo: string
  opcoes: string[]
  valor: string[]
  onAlterar: (valor: string[]) => void
}) {
  const [busca, setBusca] = useState("")
  const todas = valor.length === opcoes.length
  const filtradas = opcoes.filter((o) => normalizar(o).includes(normalizar(busca)))

  return (
    <>
      <div className="flex items-center justify-between px-1.5 pt-1">
        <span className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Lista de opções</span>
        <Button
          variant="link"
          size="xs"
          className="h-auto px-0 font-semibold"
          onClick={() => onAlterar(todas ? [] : [...opcoes])}
        >
          {todas ? "Limpar" : "Selecionar tudo"}
        </Button>
      </div>
      <InputGroup className="h-8">
        <InputGroupInput
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar"
          aria-label={`Buscar em ${rotulo}`}
          autoFocus
        />
        <InputGroupAddon align="inline-end">
          <SearchIcon />
        </InputGroupAddon>
      </InputGroup>
      <ul className="flex max-h-55 flex-col overflow-auto">
        {filtradas.map((o) => {
          const marcada = valor.includes(o)
          return (
            <li key={o}>
              <label className="flex cursor-pointer items-center gap-2.25 rounded-md px-2 py-1.75 text-sm hover:bg-muted">
                <Checkbox
                  checked={marcada}
                  onCheckedChange={() => onAlterar(marcada ? valor.filter((v) => v !== o) : [...valor, o])}
                />
                <span className="min-w-0">{o}</span>
              </label>
            </li>
          )
        })}
        {!filtradas.length && (
          <li className="px-2 py-3 text-center text-[13px] text-muted-foreground">Nenhum órgão encontrado</li>
        )}
      </ul>
    </>
  )
}
