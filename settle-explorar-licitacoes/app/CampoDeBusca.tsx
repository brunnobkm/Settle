// Busca que abre no lugar do botão "Buscar": escopos (propriedades) viram chips
// dentro do campo e o funil escolhe em quais campos procurar.

import type { Ref } from "react"
import { FunnelIcon, SearchIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"

import { ESCOPOS } from "./dados"

const rotuloDoEscopo = (chave: string) => ESCOPOS.find((e) => e.chave === chave)?.rotulo ?? chave

export function CampoDeBusca({
  inputRef,
  consulta,
  onConsulta,
  escopos,
  onAlternarEscopo,
  onLimparEscopos,
  onFechar,
}: {
  inputRef: Ref<HTMLInputElement>
  consulta: string
  onConsulta: (q: string) => void
  escopos: string[]
  onAlternarEscopo: (chave: string) => void
  onLimparEscopos: () => void
  onFechar: () => void
}) {
  return (
    <InputGroup className="h-auto min-h-8 w-auto min-w-75 flex-1 rounded-lg border-0 bg-transparent shadow-none dark:bg-transparent">
      <InputGroupAddon className="flex-wrap gap-1 py-1 pl-2.5">
        <SearchIcon />
        {escopos.map((chave) => (
          <span
            key={chave}
            className="inline-flex items-center gap-1 rounded-md bg-foreground py-0.5 pr-1 pl-2 text-xs font-medium whitespace-nowrap text-background"
          >
            {rotuloDoEscopo(chave)}
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={`Remover ${rotuloDoEscopo(chave)}`}
              className="size-4 rounded-sm text-background/70 hover:bg-background/20 hover:text-background"
              onClick={() => onAlternarEscopo(chave)}
            >
              <XIcon />
            </Button>
          </span>
        ))}
      </InputGroupAddon>
      <InputGroupInput
        ref={inputRef}
        value={consulta}
        onChange={(e) => onConsulta(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && onFechar()}
        placeholder="Buscar..."
        aria-label="Buscar licitações"
        autoComplete="off"
        className="h-8 min-w-40"
      />
      <InputGroupAddon align="inline-end" className="gap-1 pr-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <InputGroupButton
              size="icon-xs"
              aria-label={
                escopos.length
                  ? `Filtrar por propriedade (${escopos.length} ${escopos.length === 1 ? "selecionada" : "selecionadas"})`
                  : "Filtrar por propriedade"
              }
              data-ativo={escopos.length > 0}
              className="relative overflow-visible data-[ativo=true]:text-primary"
            >
              <FunnelIcon />
              {escopos.length > 0 && (
                <span
                  aria-hidden
                  className="absolute -top-0.75 -right-0.75 flex h-3.75 min-w-3.75 items-center justify-center rounded-full bg-primary px-0.75 text-[9px] leading-none font-bold text-primary-foreground ring-[1.5px] ring-background"
                >
                  {escopos.length}
                </span>
              )}
            </InputGroupButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="max-h-82.5 w-61.5">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                Buscar em
              </DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={escopos.length === 0}
                onCheckedChange={onLimparEscopos}
                onSelect={(e) => e.preventDefault()}
              >
                Todos os campos
              </DropdownMenuCheckboxItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {ESCOPOS.map((e) => (
                <DropdownMenuCheckboxItem
                  key={e.chave}
                  checked={escopos.includes(e.chave)}
                  onCheckedChange={() => onAlternarEscopo(e.chave)}
                  onSelect={(ev) => ev.preventDefault()}
                >
                  {e.rotulo}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <InputGroupButton size="icon-xs" aria-label="Fechar busca" onClick={onFechar}>
          <XIcon />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}
