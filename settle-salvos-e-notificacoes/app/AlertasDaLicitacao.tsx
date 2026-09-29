// Popover de "Salvar para depois": o usuário escolhe só guardar a licitação ou
// guardar e receber avisos de atualização, e quais tipos de atualização.
// Abre ancorado no botão clicado do card (marcador ou sino).

import { useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

import { TIPOS_DE_ATUALIZACAO, TODOS_OS_TIPOS, type Licitacao, type TipoAtualizacao } from "./dados"

type Modo = "guardar" | "acompanhar"

export function AlertasDaLicitacao({
  licitacao,
  ancora,
  onFechar,
  onSalvar,
  onRemover,
}: {
  /** null: fechado */
  licitacao: Licitacao | null
  ancora: HTMLElement | null
  onFechar: () => void
  onSalvar: (alertas: TipoAtualizacao[]) => void
  onRemover: () => void
}) {
  const ancoraRef = useRef<HTMLElement | null>(null)
  ancoraRef.current = ancora

  const [modo, setModo] = useState<Modo>("acompanhar")
  const [tipos, setTipos] = useState<TipoAtualizacao[]>(TODOS_OS_TIPOS)

  // ao abrir: parte do que já está salvo (ou, para uma nova, de "acompanhar tudo")
  useEffect(() => {
    if (!licitacao) return
    const ja = licitacao.salvo
    setModo(ja && !licitacao.alertas.length ? "guardar" : "acompanhar")
    setTipos(ja && licitacao.alertas.length ? licitacao.alertas : TODOS_OS_TIPOS)
  }, [licitacao])

  const jaSalva = !!licitacao?.salvo
  const semTipo = modo === "acompanhar" && !tipos.length

  function alternarTipo(tipo: TipoAtualizacao, marcado: boolean) {
    setTipos((t) => (marcado ? TODOS_OS_TIPOS.filter((c) => c === tipo || t.includes(c)) : t.filter((c) => c !== tipo)))
  }

  return (
    <Popover open={!!licitacao} onOpenChange={(aberto) => !aberto && onFechar()}>
      <PopoverAnchor virtualRef={ancoraRef as React.RefObject<HTMLElement>} />
      <PopoverContent align="end" className="w-90 gap-0 p-0">
        {licitacao && (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (semTipo) return
              onSalvar(modo === "guardar" ? [] : tipos)
            }}
          >
            <div className="border-b px-4 pt-3.5 pb-3">
              <h2 className="text-sm font-semibold">{jaSalva ? "Salva para depois" : "Salvar para depois"}</h2>
              <p className="mt-0.5 text-[13px] text-muted-foreground">Edital {licitacao.edital}</p>
            </div>

            <RadioGroup
              value={modo}
              onValueChange={(v) => setModo(v as Modo)}
              aria-label="O que fazer com a licitação salva"
              className="gap-0 px-2 py-2"
            >
              <OpcaoDeModo valor="guardar" titulo="Só guardar" descricao="Fica em Salvos para depois, sem avisos." />
              <OpcaoDeModo
                valor="acompanhar"
                titulo="Guardar e receber atualizações"
                descricao="Avisa na central de notificações quando o edital mudar."
              />
            </RadioGroup>

            {modo === "acompanhar" && (
              <fieldset className="mx-4 mb-3 rounded-lg border bg-muted/40 px-3 pt-2.5 pb-1">
                <div className="mb-1 flex items-center justify-between">
                  <legend className="text-xs font-semibold text-muted-foreground">Avisar sobre</legend>
                  <button
                    type="button"
                    className="rounded text-xs font-medium text-primary hover:underline"
                    onClick={() => setTipos(tipos.length === TODOS_OS_TIPOS.length ? [] : TODOS_OS_TIPOS)}
                  >
                    {tipos.length === TODOS_OS_TIPOS.length ? "Desmarcar todas" : "Marcar todas"}
                  </button>
                </div>
                {TIPOS_DE_ATUALIZACAO.map((t) => {
                  const id = `alerta-${t.chave}`
                  return (
                    <div key={t.chave} className="flex items-start gap-2.5 py-1.5">
                      <Checkbox
                        id={id}
                        className="mt-0.5"
                        checked={tipos.includes(t.chave)}
                        onCheckedChange={(v) => alternarTipo(t.chave, v === true)}
                      />
                      <Label htmlFor={id} className="flex-col items-start gap-0 font-normal">
                        <span className="text-[13px] font-medium">{t.rotulo}</span>
                        <span className="text-xs text-muted-foreground">{t.descricao}</span>
                      </Label>
                    </div>
                  )
                })}
                {semTipo && (
                  <p role="alert" className="pb-1.5 text-xs text-destructive">
                    Marque ao menos um tipo ou escolha “Só guardar”.
                  </p>
                )}
              </fieldset>
            )}

            <div className="flex items-center gap-2 border-t px-4 py-3">
              {jaSalva && (
                <Button type="button" variant="ghost" size="sm" className="-ml-2 text-destructive" onClick={onRemover}>
                  Remover de Salvos
                </Button>
              )}
              <Button type="button" variant="outline" size="sm" className="ml-auto" onClick={onFechar}>
                Cancelar
              </Button>
              <Button type="submit" size="sm" disabled={semTipo}>
                {jaSalva ? "Salvar alterações" : "Salvar"}
              </Button>
            </div>
          </form>
        )}
      </PopoverContent>
    </Popover>
  )
}

function OpcaoDeModo({ valor, titulo, descricao }: { valor: Modo; titulo: string; descricao: string }) {
  const id = `modo-${valor}`
  return (
    <div className={cn("flex items-start gap-2.5 rounded-md px-2 py-2 hover:bg-muted/60")}>
      <RadioGroupItem id={id} value={valor} className="mt-0.5" />
      <Label htmlFor={id} className="flex-col items-start gap-0 font-normal">
        <span className="text-[13px] font-medium">{titulo}</span>
        <span className="text-xs text-muted-foreground">{descricao}</span>
      </Label>
    </div>
  )
}
