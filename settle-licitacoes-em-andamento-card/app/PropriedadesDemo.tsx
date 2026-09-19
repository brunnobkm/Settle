// "Adicionar propriedade": demonstra no card os tipos de propriedade do Notion
// (texto, número, select, data, pessoa, arquivos...). Cada tipo tem sua forma de
// aparecer no card e seu editor.

import { useRef, useState, type ReactNode } from "react"
import {
  AlignLeftIcon,
  AtSignIcon,
  CalendarIcon,
  CircleChevronDownIcon,
  CircleUserIcon,
  HashIcon,
  LinkIcon,
  ListIcon,
  MapPinIcon,
  MousePointerClickIcon,
  PaperclipIcon,
  PhoneIcon,
  PlusIcon,
  SquareCheckIcon,
  UsersIcon,
  XIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { badgeVariants } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

import { formatarData, pessoaPorId, TIPOS, type EditorDemo, type PropriedadeDemo, type TipoDemo } from "./dados"
import {
  CalendarioData,
  ChipPessoa,
  ChipSegmento,
  ListaArquivos,
  ListaOpcoes,
  ListaPessoas,
  PopoverEditor,
} from "./editores"

const ICONES: Record<TipoDemo, ReactNode> = {
  text: <AlignLeftIcon />,
  number: <HashIcon />,
  select: <CircleChevronDownIcon />,
  "multi-select": <ListIcon />,
  date: <CalendarIcon />,
  person: <UsersIcon />,
  "files-media": <PaperclipIcon />,
  checkbox: <SquareCheckIcon />,
  url: <LinkIcon />,
  email: <AtSignIcon />,
  phone: <PhoneIcon />,
  "last-edited-by": <CircleUserIcon />,
  button: <MousePointerClickIcon />,
  place: <MapPinIcon />,
}

export const editorDaDemo = (demo: PropriedadeDemo): EditorDemo | undefined => TIPOS[demo.tipo].editor

const VAZIO = <span className="text-muted-foreground">Vazio</span>

/* ------------------------------------------------------------------ */
/* Valor da propriedade no card                                        */
/* ------------------------------------------------------------------ */

function ValorDemo({ demo, onChange }: { demo: PropriedadeDemo; onChange: (valor: unknown) => void }) {
  const v = demo.valor
  switch (demo.tipo) {
    case "text":
    case "phone":
    case "place":
      return v ? <>{String(v)}</> : VAZIO
    case "number":
      return v != null && v !== "" ? <span className="tabular-nums">{String(v)}</span> : VAZIO
    case "select":
      return v ? (
        <span className={cn(badgeVariants({ variant: "secondary" }), "h-auto rounded-sm py-0.5 leading-[1.4]")}>
          {String(v)}
        </span>
      ) : (
        VAZIO
      )
    case "multi-select": {
      const tags = v as string[]
      return tags.length ? (
        <span className="flex flex-wrap gap-1">
          {tags.map((t) => (
            <ChipSegmento key={t} nome={t} categoria={1} />
          ))}
        </span>
      ) : (
        VAZIO
      )
    }
    case "date":
      return v ? <span className="tabular-nums">{formatarData(String(v))}</span> : VAZIO
    case "person": {
      const pessoas = (v as number[]).map(pessoaPorId).filter((p) => !!p)
      return pessoas.length ? (
        <span className="flex flex-wrap gap-1">
          {pessoas.map((p) => (
            <ChipPessoa key={p.id} nome={p.nome} />
          ))}
        </span>
      ) : (
        <span className="text-muted-foreground">Sem pessoas</span>
      )
    }
    case "files-media": {
      const n = (v as string[]).length
      return n ? (
        <span className="inline-flex items-center gap-1.5 [&>svg]:size-3">
          <PaperclipIcon aria-hidden />
          {n} {n > 1 ? "arquivos" : "arquivo"}
        </span>
      ) : (
        <span className="text-muted-foreground">Anexar arquivo</span>
      )
    }
    case "checkbox":
      return (
        <Checkbox
          aria-label="Caixa de seleção"
          checked={!!v}
          onCheckedChange={(c) => onChange(c === true)}
          className="align-middle"
        />
      )
    case "url":
    case "email":
      return v ? <span className="text-primary underline underline-offset-2">{String(v)}</span> : VAZIO
    case "last-edited-by": {
      const p = pessoaPorId(Number(v))
      return p ? <ChipPessoa nome={p.nome} /> : null
    }
    case "button":
      return (
        <Button size="xs" data-nao-prototipado>
          {String(v)}
        </Button>
      )
  }
}

/* ------------------------------------------------------------------ */
/* Edição de texto na própria linha                                    */
/* ------------------------------------------------------------------ */

function EntradaNaLinha({
  inicial,
  numero,
  prefixo,
  rotulo,
  onSalvar,
  onFim,
}: {
  inicial: string
  numero?: boolean
  prefixo?: string
  rotulo: string
  onSalvar: (texto: string) => void
  onFim: () => void
}) {
  const [texto, setTexto] = useState(inicial)
  const cancelado = useRef(false)

  return (
    <span className="flex items-baseline gap-1.5">
      {prefixo && <span className="text-[11px] text-muted-foreground">{prefixo}</span>}
      <input
        autoFocus
        type={numero ? "number" : "text"}
        aria-label={rotulo}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onFocus={(e) => e.currentTarget.select()}
        onBlur={() => {
          if (!cancelado.current) onSalvar(texto)
          onFim()
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            e.currentTarget.blur()
          }
          if (e.key === "Escape") {
            cancelado.current = true
            e.currentTarget.blur()
          }
        }}
        className="w-full min-w-0 bg-transparent p-0 text-[13px] outline-none"
      />
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* Conteúdo da linha (valor + editor + remover)                        */
/* ------------------------------------------------------------------ */

export function ConteudoDemo({
  demo,
  editando,
  onEditando,
  editandoInline,
  onFimInline,
  onChange,
  onRemover,
}: {
  demo: PropriedadeDemo
  editando: boolean
  onEditando: (open: boolean) => void
  editandoInline: boolean
  onFimInline: () => void
  onChange: (valor: unknown) => void
  onRemover: () => void
}) {
  const config = TIPOS[demo.tipo]
  const editor = config.editor

  let corpo: ReactNode = <ValorDemo demo={demo} onChange={onChange} />

  if (editandoInline && (editor === "texto" || editor === "numero" || editor === "botao")) {
    corpo = (
      <EntradaNaLinha
        inicial={String(demo.valor ?? "")}
        numero={editor === "numero"}
        prefixo={editor === "botao" ? "Label:" : undefined}
        rotulo={config.rotulo}
        onFim={onFimInline}
        onSalvar={(texto) => {
          if (editor === "numero") {
            const n = parseFloat(texto)
            if (!Number.isNaN(n)) onChange(n)
          } else if (editor === "botao") {
            onChange(texto.trim() || demo.valor)
          } else onChange(texto)
        }}
      />
    )
  } else if (editor === "select" || editor === "multi" || editor === "data" || editor === "pessoa" || editor === "arquivos") {
    corpo = (
      <PopoverEditor
        ancora
        open={editando}
        onOpenChange={onEditando}
        className={editor === "data" ? "min-w-60" : undefined}
        gatilho={<div className="min-w-0">{corpo}</div>}
      >
        {editor === "select" && (
          <ListaOpcoes
            opcoes={config.opcoes ?? []}
            selecionadas={demo.valor ? [String(demo.valor)] : []}
            onEscolher={(o) => {
              onChange(o)
              onEditando(false)
            }}
          />
        )}
        {editor === "multi" && (
          <ListaOpcoes
            multi
            opcoes={config.opcoes ?? []}
            selecionadas={demo.valor as string[]}
            onEscolher={(o) => {
              const atual = demo.valor as string[]
              onChange(atual.includes(o) ? atual.filter((x) => x !== o) : [...atual, o])
            }}
          />
        )}
        {editor === "data" && (
          <CalendarioData
            valor={demo.valor ? String(demo.valor) : null}
            onEscolher={(iso) => {
              onChange(iso)
              onEditando(false)
            }}
          />
        )}
        {editor === "pessoa" && (
          <ListaPessoas
            selecionados={demo.valor as number[]}
            onAlternar={(id) => {
              const atual = demo.valor as number[]
              onChange(atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id])
            }}
          />
        )}
        {editor === "arquivos" && <ListaArquivos arquivos={demo.valor as string[]} onChange={onChange} />}
      </PopoverEditor>
    )
  }

  return (
    <>
      {corpo}
      {!editando && !editandoInline && (
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={`Remover propriedade ${config.rotulo}`}
          onClick={onRemover}
          className="absolute top-1/2 right-1 size-4.5 -translate-y-1/2 bg-card text-muted-foreground opacity-0 group-hover/linha:opacity-100 hover:bg-foreground/8 hover:text-foreground focus-visible:opacity-100"
        >
          <XIcon />
        </Button>
      )}
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Botão e menu "Adicionar propriedade"                                */
/* ------------------------------------------------------------------ */

export function AdicionarPropriedade({
  open,
  onOpenChange,
  onAdicionar,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdicionar: (tipo: TipoDemo) => void
}) {
  return (
    <PopoverEditor
      open={open}
      onOpenChange={onOpenChange}
      gatilho={
        <Button
          variant="outline"
          size="sm"
          className="border-dashed bg-card text-[13px] font-normal text-muted-foreground shadow-none hover:border-solid"
        >
          <PlusIcon data-icon="inline-start" />
          Adicionar propriedade
        </Button>
      }
    >
      <Command className="p-0">
        <CommandInput placeholder="Buscar tipo..." aria-label="Buscar tipo de propriedade" />
        <CommandList className="mt-1 max-h-80">
          <CommandEmpty className="py-3 text-xs text-muted-foreground">Nenhum tipo encontrado</CommandEmpty>
          <CommandGroup heading="Tipo">
            {(Object.keys(TIPOS) as TipoDemo[]).map((tipo) => (
              <CommandItem
                key={tipo}
                value={TIPOS[tipo].rotulo}
                onSelect={() => onAdicionar(tipo)}
                className="text-[13px] [&>svg:first-child]:size-3.5 [&>svg:first-child]:text-muted-foreground"
              >
                {ICONES[tipo]}
                <span className="flex-1">{TIPOS[tipo].rotulo}</span>
                {TIPOS[tipo].automatica && (
                  <span className="text-[10px] tracking-wide text-muted-foreground uppercase">auto</span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverEditor>
  )
}
