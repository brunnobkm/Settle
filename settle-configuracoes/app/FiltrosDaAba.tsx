// Painel lateral de filtros da aba: mesmo desenho do Filtrar da plataforma (um campo
// por filtro, Salvar e Limpar no rodapé). Edita um rascunho; só vale ao salvar.

import { useState } from "react"
import { ChevronDownIcon, SearchIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

import { FILTROS, TELAS, temValor, type Aba, type DefFiltro, type Faixa, type FiltroAba, type TelaAba, type ValorFiltro } from "./dados"

type Rascunho = Record<string, ValorFiltro>

const QUALQUER_DATA = "Qualquer data"

const normalizar = (t: string) =>
  t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")

export function FiltrosDaAba({
  aba,
  tela,
  onFechar,
  onSalvar,
}: {
  aba: Aba
  tela: TelaAba
  onFechar: () => void
  onSalvar: (f: FiltroAba[]) => void
}) {
  const campos = FILTROS.filter((f) => !f.telas || f.telas.includes(tela))
  const [rasc, setRasc] = useState<Rascunho>(() => Object.fromEntries(aba.f.map((x) => [x.k, structuredClone(x.v)])))
  const mudar = (k: string, v: ValorFiltro) => setRasc((r) => ({ ...r, [k]: v }))

  const campo = (f: DefFiltro) => {
    if (f.t === "range") {
      const v = (rasc[f.k] as Faixa | undefined) ?? { min: "", max: "" }
      return (
        <div key={f.k} className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold">{f.n}</span>
          <div className="flex gap-2.5">
            <Input
              type="number"
              min={0}
              aria-label={`${f.n} mínimo`}
              placeholder="Mínimo"
              value={v.min}
              onChange={(e) => mudar(f.k, { ...v, min: e.target.value })}
            />
            <Input
              type="number"
              min={0}
              aria-label={`${f.n} máximo`}
              placeholder="Máximo"
              value={v.max}
              onChange={(e) => mudar(f.k, { ...v, max: e.target.value })}
            />
          </div>
        </div>
      )
    }
    return (
      <div key={f.k} className="flex flex-col gap-1.5">
        <span id={`rot-${f.k}`} className="text-[13px] font-semibold">
          {f.n}
        </span>
        {f.t === "date" ? (
          <CampoData def={f} valor={(rasc[f.k] as string | undefined) ?? ""} onMudar={(v) => mudar(f.k, v)} />
        ) : (
          <CampoLista def={f} valor={(rasc[f.k] as string[] | undefined) ?? []} onMudar={(v) => mudar(f.k, v)} />
        )}
      </div>
    )
  }

  const daTela = campos.filter((f) => !f.variavel)
  const variaveis = campos.filter((f) => f.variavel)

  return (
    <Sheet open onOpenChange={(aberto) => !aberto && onFechar()}>
      <SheetContent size="md" closeLabel="Fechar sem salvar" className="gap-0">
        <SheetHeader className="px-5 pt-4.5 pb-2.5 pr-12">
          <SheetTitle className="text-[17px] font-semibold">Filtros da aba "{aba.nome}"</SheetTitle>
          <SheetDescription className="text-[13px] leading-[19px]">
            Os mesmos filtros do botão Filtrar de {TELAS[tela]}. Ao salvar, a aba passa a mostrar só o que atende a eles,
            para todas as pessoas.
          </SheetDescription>
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto px-5 pt-1 pb-4">
          {daTela.map(campo)}
          {variaveis.length > 0 && (
            <>
              <div className="mt-2 -mb-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                Variáveis da organização
              </div>
              {variaveis.map(campo)}
            </>
          )}
        </div>
        <SheetFooter className="border-t px-5 pt-3.5 pb-4.5">
          <Button
            onClick={() =>
              onSalvar(FILTROS.filter((f) => rasc[f.k] !== undefined).map((f) => ({ k: f.k, v: rasc[f.k] })).filter(temValor))
            }
          >
            Salvar na aba
          </Button>
          <Button variant="outline" onClick={() => setRasc({})}>
            Limpar filtros
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function Gatilho({ def, texto, vazio, aberto }: { def: DefFiltro; texto: string; vazio: boolean; aberto: boolean }) {
  return (
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        aria-labelledby={`rot-${def.k} val-${def.k}`}
        className={cn("h-9.5 w-full justify-between px-2.75 text-sm font-normal", vazio && "text-muted-foreground")}
      >
        <span id={`val-${def.k}`} className="truncate">
          {texto}
        </span>
        <ChevronDownIcon data-icon="inline-end" className={cn("text-muted-foreground transition-transform", aberto && "rotate-180")} />
      </Button>
    </PopoverTrigger>
  )
}

function CampoLista({ def, valor, onMudar }: { def: DefFiltro; valor: string[]; onMudar: (v: string[]) => void }) {
  const [aberto, setAberto] = useState(false)
  const [busca, setBusca] = useState("")
  const ops = def.ops ?? []
  const todas = valor.length === ops.length
  const texto = !valor.length ? "Nenhuma opção selecionada" : valor.length <= 2 ? valor.join(", ") : `${valor.length} selecionadas`
  const visiveis = ops.filter((o) => normalizar(o).includes(normalizar(busca)))

  return (
    <Popover
      open={aberto}
      onOpenChange={(v) => {
        setAberto(v)
        if (!v) setBusca("")
      }}
    >
      <Gatilho def={def} texto={texto} vazio={!valor.length} aberto={aberto} />
      <PopoverContent align="start" className="w-(--radix-popover-trigger-width) gap-1.5 p-2">
        <div className="flex items-center justify-between px-1.5 pt-1">
          <span className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Lista de opções</span>
          <Button variant="link" size="xs" className="h-auto px-0 font-semibold" onClick={() => onMudar(todas ? [] : [...ops])}>
            {todas ? "Limpar seleção" : "Selecionar todas"}
          </Button>
        </div>
        <InputGroup className="h-8">
          <InputGroupInput
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar"
            aria-label={`Buscar em ${def.n}`}
            autoFocus
          />
          <InputGroupAddon align="inline-end">
            <SearchIcon />
          </InputGroupAddon>
        </InputGroup>
        <ul aria-label={def.n} className="flex max-h-55 flex-col overflow-auto">
          {visiveis.map((o) => {
            const marcado = valor.includes(o)
            return (
              <li key={o}>
                <label className="flex cursor-pointer items-center gap-2.25 rounded-md px-2 py-1.75 text-sm hover:bg-muted">
                  <Checkbox
                    checked={marcado}
                    onCheckedChange={() => onMudar(marcado ? valor.filter((x) => x !== o) : [...valor, o])}
                  />
                  <span className="min-w-0">{o}</span>
                </label>
              </li>
            )
          })}
          {!visiveis.length && <li className="px-2 py-3 text-center text-[13px] text-muted-foreground">Nenhuma opção encontrada</li>}
        </ul>
      </PopoverContent>
    </Popover>
  )
}

function CampoData({ def, valor, onMudar }: { def: DefFiltro; valor: string; onMudar: (v: string) => void }) {
  const [aberto, setAberto] = useState(false)
  return (
    <Popover open={aberto} onOpenChange={setAberto}>
      <Gatilho def={def} texto={valor || QUALQUER_DATA} vazio={!valor} aberto={aberto} />
      <PopoverContent align="start" className="w-(--radix-popover-trigger-width) gap-1.5 p-2">
        <ToggleGroup
          type="single"
          spacing={0}
          value={valor || QUALQUER_DATA}
          onValueChange={(v) => {
            if (!v) return
            onMudar(v === QUALQUER_DATA ? "" : v)
            setAberto(false)
          }}
          aria-label={`Período de ${def.n}`}
          className="w-full rounded-lg bg-muted p-0.75"
        >
          {[QUALQUER_DATA, ...(def.ops ?? [])].map((o) => (
            <ToggleGroupItem
              key={o}
              value={o}
              className="h-7 flex-1 rounded-md px-1 text-xs text-muted-foreground data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-xs"
            >
              {o}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <p className="mx-1 mt-1 mb-0.5 text-xs text-muted-foreground">
          Na aba, a data é sempre relativa ao dia de hoje, para continuar certa com o passar do tempo.
        </p>
      </PopoverContent>
    </Popover>
  )
}
