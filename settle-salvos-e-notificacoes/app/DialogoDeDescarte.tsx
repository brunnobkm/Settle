// Diálogo "Descartar licitação", igual ao da plataforma (motivo + comentário), com a
// opção nova: continuar recebendo atualizações. Descartar desliga as notificações por
// padrão; marcar a opção mantém (ou liga) o sino. Motivos que uma atualização pode
// desfazer mostram uma sugestão, sem marcar sozinhos.

import { useEffect, useState } from "react"
import { SparklesIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

import { MOTIVOS_DE_DESCARTE, MOTIVOS_REVERSIVEIS, ROTULO_CURTO, TODOS_OS_TIPOS, type Licitacao } from "./dados"

export function DialogoDeDescarte({
  licitacao,
  onFechar,
  onDescartar,
}: {
  /** null: fechado */
  licitacao: Licitacao | null
  onFechar: () => void
  onDescartar: (r: { motivo: string; comentario: string; continuarNotificando: boolean }) => void
}) {
  const [motivo, setMotivo] = useState("")
  const [comentario, setComentario] = useState("")
  const [continuar, setContinuar] = useState(false)
  const [erro, setErro] = useState(false)

  useEffect(() => {
    if (!licitacao) return
    setMotivo("")
    setComentario("")
    setContinuar(false)
    setErro(false)
  }, [licitacao?.edital]) // eslint-disable-line react-hooks/exhaustive-deps

  const ligado = !!licitacao?.alertas.length
  const tipos = ligado ? licitacao!.alertas : TODOS_OS_TIPOS
  const resumoTipos = tipos.length === TODOS_OS_TIPOS.length ? "todas as atualizações" : tipos.map((t) => ROTULO_CURTO[t]).join(", ")
  const sugestao = MOTIVOS_REVERSIVEIS[motivo]

  return (
    <Dialog open={!!licitacao} onOpenChange={(aberto) => !aberto && onFechar()}>
      <DialogContent className="sm:max-w-md">
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (!motivo) {
              setErro(true)
              return
            }
            onDescartar({ motivo, comentario, continuarNotificando: continuar })
          }}
        >
          <DialogHeader>
            <DialogTitle>Descartar licitação</DialogTitle>
            <DialogDescription>Selecione o motivo para descartar essa licitação.</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="motivo-descarte">Motivo</Label>
            <Select
              value={motivo}
              onValueChange={(v) => {
                setMotivo(v)
                setErro(false)
              }}
            >
              <SelectTrigger id="motivo-descarte" className="w-full" aria-invalid={erro || undefined}>
                <SelectValue placeholder="Selecione um motivo" />
              </SelectTrigger>
              <SelectContent>
                {MOTIVOS_DE_DESCARTE.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {erro && (
              <p role="alert" className="text-xs text-destructive">
                Escolha um motivo para descartar.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="comentario-descarte">Comentário</Label>
            <Textarea
              id="comentario-descarte"
              rows={3}
              placeholder="Adicione um comentário opcional"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
            />
          </div>

          <div className="rounded-lg border bg-muted/40 px-3 py-2.5 has-data-[state=checked]:border-primary/40 has-data-[state=checked]:bg-primary/5">
            <div className="flex items-start gap-2.5">
              <Checkbox id="continuar-notificando" className="mt-0.5" checked={continuar} onCheckedChange={(v) => setContinuar(v === true)} />
              <Label htmlFor="continuar-notificando" className="flex-col items-start gap-0.5 font-normal">
                <span className="text-[13px] font-medium">Continuar recebendo atualizações</span>
                <span className="text-xs text-muted-foreground">
                  {continuar
                    ? `Você será avisado sobre ${resumoTipos}. A licitação fica em Descartadas.`
                    : ligado
                      ? "As notificações desta licitação serão desativadas ao descartar."
                      : "Avisamos se o edital mudar, para você reavaliar o descarte."}
                </span>
              </Label>
            </div>
            {sugestao && !continuar && (
              <p className="mt-2 ml-6.5 flex gap-1.5 text-xs text-foreground">
                <SparklesIcon aria-hidden className="mt-0.5 size-3.5 shrink-0 text-primary" />
                <span>
                  <span className="font-medium">Sugestão:</span> {sugestao}
                </span>
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onFechar}>
              Cancelar
            </Button>
            <Button type="submit">Descartar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
