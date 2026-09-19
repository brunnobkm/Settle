// Divergência: a mesma informação veio diferente de documentos distintos. "Revisar"
// mostra as opções para escolher (ou adicionar uma nova informação, com trecho do edital
// opcional); "Confirmar" resolve e a escolhida vira uma informação da seção.

import { useId } from "react"
import { ChevronDownIcon, InfoIcon, LinkIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { CitationList } from "@/components/ui/citation-list"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { MENSAGEM_NAO_PROTOTIPADO } from "@/settle/nao-prototipado"

import { BotaoDeAcao, ESCURO } from "./Linha"
import { DIVERGENCIAS, type Painel } from "./painel"

/** Linha divisória entre opções (não encosta nas bordas). */
const DIVISORIA = "before:absolute before:inset-x-4 before:top-0 before:h-px before:bg-border"

const naoPrototipado = () => toast(MENSAGEM_NAO_PROTOTIPADO)

function IconeDeDivergencia() {
  const rotulo = "Revise as informações divergentes"
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span role="img" aria-label={rotulo} className="inline-flex size-4.5 shrink-0 items-center justify-center text-warning">
          <InfoIcon aria-hidden className="size-4.5" strokeWidth={2.2} />
        </span>
      </TooltipTrigger>
      <TooltipContent>{rotulo}</TooltipContent>
    </Tooltip>
  )
}

export function Divergencia({ painel, id, semBordaSuperior }: { painel: Painel; id: string; semBordaSuperior?: boolean }) {
  const base = DIVERGENCIAS.get(id)!
  const d = painel.estado.divergencias[id]
  const radio = useId()
  if (d.resolvida) return null

  const nova = d.nova
  const vinculado = Boolean(nova?.fonte)

  return (
    <Collapsible open={d.aberta} onOpenChange={() => painel.alternarDivergencia(id)}>
      <div
        className={cn(
          "grid items-center gap-2 border-y px-4 py-2.5 transition-colors hover:bg-muted",
          d.revisando ? "grid-cols-[minmax(0,1fr)_auto_auto_auto]" : "grid-cols-[minmax(0,1fr)_auto_auto]",
          (d.aberta || d.revisando) && "bg-muted",
          semBordaSuperior && "border-t-0"
        )}
      >
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex min-w-0 items-center gap-1.75 rounded-sm text-left outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <IconeDeDivergencia />
            <span className="text-[13px] leading-tight font-semibold">{base.rotulo}</span>
          </button>
        </CollapsibleTrigger>
        <Button size="xs" className={cn("font-semibold", d.revisando && ESCURO)} onClick={() => painel.revisar(id)}>
          {d.revisando ? "Cancelar" : "Revisar"}
        </Button>
        {d.revisando && (
          <Button size="xs" className={cn("font-semibold", ESCURO)} onClick={() => painel.confirmar(id)}>
            Confirmar
          </Button>
        )}
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={d.aberta ? "Recolher divergência" : "Expandir divergência"}
            className="[&_svg:not([class*='size-'])]:size-4.5"
          >
            <ChevronDownIcon aria-hidden className={cn("transition-transform duration-200", d.aberta && "rotate-180")} />
          </Button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent className="bg-muted">
        <RadioGroup value={d.escolha} onValueChange={(v) => painel.escolher(id, v)} aria-label={base.rotulo} className="gap-0">
          {base.opcoes.map((opcao, i) => (
            <div
              key={i}
              className={cn(
                "group/opcao relative px-4 py-2.5 transition-colors hover:bg-foreground/3 focus-within:bg-foreground/3",
                i > 0 && DIVISORIA
              )}
            >
              <div className={cn("grid gap-2", d.revisando && "grid-cols-[18px_minmax(0,1fr)] items-start")}>
                {d.revisando && <RadioGroupItem id={`${radio}-${i}`} value={String(i)} className="mt-0.5 bg-background" />}
                <div className="grid min-w-0 gap-2.5">
                  <label
                    htmlFor={`${radio}-${i}`}
                    className={cn("block text-[13px] leading-[1.45] font-medium text-muted-foreground", d.revisando && "cursor-pointer")}
                  >
                    {opcao.texto}
                  </label>
                  {opcao.trechos && (
                    <CitationList
                      title="Trechos do edital"
                      items={opcao.trechos.map((t) => ({ id: t.id, location: t.local, excerpt: t.trecho, primary: t.principal }))}
                      onView={naoPrototipado}
                      onAdd={naoPrototipado}
                    />
                  )}
                </div>
              </div>
              <BotaoDeAcao
                rotulo="Abrir trecho do edital"
                className={cn(
                  "pointer-events-none absolute top-1 right-1 size-7.5 rounded-lg bg-background/90 text-primary opacity-0 transition-opacity hover:text-primary",
                  "group-hover/opcao:pointer-events-auto group-hover/opcao:opacity-100 focus-visible:pointer-events-auto focus-visible:opacity-100"
                )}
                onClick={() => painel.abrirFonteDaOpcao(id, i)}
              >
                <LinkIcon aria-hidden />
              </BotaoDeAcao>
            </div>
          ))}

          {nova && (
            <div data-editor-nova className="grid grid-cols-[18px_minmax(0,1fr)] items-start gap-x-2 px-4 py-3">
              <RadioGroupItem id={`${radio}-nova`} value="nova" aria-label="Nova informação" className="mt-0.5 bg-background" />
              <div className="grid min-w-0 gap-2.5">
                <Label htmlFor={`${radio}-texto`} className="text-[13px] font-semibold">
                  Nova informação
                </Label>
                <Textarea
                  id={`${radio}-texto`}
                  autoFocus
                  rows={3}
                  placeholder="Digite a informação correta"
                  value={nova.texto}
                  onChange={(e) => painel.digitarNova(id, e.target.value)}
                  aria-invalid={nova.erro ? true : undefined}
                  aria-describedby={nova.erro ? `${radio}-erro` : undefined}
                  className="bg-background text-[13px] leading-snug md:text-[13px]"
                />
                {nova.erro && (
                  <span id={`${radio}-erro`} className="-mt-1 text-xs font-medium text-destructive">
                    {nova.erro}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => painel.vincularNova(id)}
                  className={cn(
                    "justify-self-start rounded-sm text-left text-xs text-foreground/75 underline outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    vinculado && "font-semibold text-primary",
                    !vinculado && nova.vinculando && "font-medium no-underline"
                  )}
                >
                  {vinculado
                    ? "Trecho vinculado"
                    : nova.vinculando
                      ? "Selecione um trecho no edital"
                      : "Vincular trecho do edital (opcional)"}
                </button>
              </div>
            </div>
          )}
        </RadioGroup>

        {d.revisando && !nova && (
          <div className={cn("relative px-4 py-2.5 transition-colors hover:bg-foreground/3", DIVISORIA)}>
            <Button
              variant="ghost"
              size="xs"
              className="h-auto bg-background px-2.5 py-1.75 font-semibold hover:bg-muted"
              onClick={() => painel.abrirNova(id)}
            >
              Adicionar nova informação
            </Button>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  )
}
