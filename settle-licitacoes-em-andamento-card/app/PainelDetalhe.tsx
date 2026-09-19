// Painel de detalhe (§12): abre ao clicar numa área que não é componente editável.
// Mostra o card expandido com TODAS as propriedades editáveis; as mudanças aparecem
// no card em tempo real. Histórico, anexos e comentários ainda não entram.

import { useState, type KeyboardEvent } from "react"
import { TriangleAlertIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"

import { formatarData, pessoaPorId, statusPorId, UFS, type Licitacao } from "./dados"
import {
  CalendarioData,
  CampoValor,
  ChipPessoa,
  ChipSegmento,
  EditorStatus,
  ListaPessoas,
  ListaSegmentos,
  PillStatus,
  PopoverEditor,
} from "./editores"

/** Gatilho dos editores em popover dentro do painel: parece um campo. */
const GATILHO_CAMPO =
  "flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-2.5 py-1.5 text-left text-sm shadow-xs outline-none hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-expanded:bg-muted/50"

/** Enter (sem Shift) conclui a edição do texto. */
const enterConclui = (e: KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault()
    e.currentTarget.blur()
  }
}

export function PainelDetalhe({
  open,
  onOpenChange,
  licitacao: l,
  onChange,
  segmentosDisponiveis,
  onCriarSegmento,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  licitacao: Licitacao
  onChange: (patch: Partial<Licitacao>) => void
  segmentosDisponiveis: string[]
  onCriarSegmento: (nome: string) => void
}) {
  const [editando, setEditando] = useState<string | null>(null)
  const abrir = (chave: string) => (aberto: boolean) => setEditando(aberto ? chave : null)
  const status = statusPorId(l.status)
  const pessoas = l.responsaveis.map(pessoaPorId).filter((p) => !!p)

  return (
    <Sheet
      open={open}
      onOpenChange={(aberto) => {
        if (!aberto) setEditando(null)
        onOpenChange(aberto)
      }}
    >
      <SheetContent
        side="right"
        closeLabel="Fechar detalhe"
        className="gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-lg data-[side=right]:xl:max-w-[40vw]"
      >
        <SheetHeader className="border-b pr-12">
          <SheetTitle className="text-base leading-snug">{l.titulo || "Sem título"}</SheetTitle>
          <SheetDescription>
            Edital {l.codigoEdital || "sem número"}
            {l.orgao ? ` · ${l.orgao}` : ""}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          <FieldGroup className="gap-5">
            <Field>
              <FieldLabel htmlFor="detalhe-titulo">Título</FieldLabel>
              <Textarea
                id="detalhe-titulo"
                rows={2}
                maxLength={200}
                value={l.titulo}
                placeholder="Sem título"
                onChange={(e) => onChange({ titulo: e.target.value })}
                onKeyDown={enterConclui}
                className="min-h-0 font-semibold"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="detalhe-edital">Edital</FieldLabel>
              <Input
                id="detalhe-edital"
                maxLength={30}
                value={l.codigoEdital}
                onChange={(e) => onChange({ codigoEdital: e.target.value })}
                onKeyDown={enterConclui}
                className="font-mono"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="detalhe-segmentos">Segmentos</FieldLabel>
              <PopoverEditor
                open={editando === "segmentos"}
                onOpenChange={abrir("segmentos")}
                gatilho={
                  <button id="detalhe-segmentos" type="button" className={GATILHO_CAMPO}>
                    {l.segmentos.length ? (
                      l.segmentos.map((s) => <ChipSegmento key={s} nome={s} />)
                    ) : (
                      <span className="text-muted-foreground">Adicionar segmento</span>
                    )}
                  </button>
                }
              >
                <ListaSegmentos
                  selecionados={l.segmentos}
                  disponiveis={segmentosDisponiveis}
                  onAlternar={(s) =>
                    onChange({
                      segmentos: l.segmentos.includes(s) ? l.segmentos.filter((x) => x !== s) : [...l.segmentos, s],
                    })
                  }
                  onCriar={(nome) => {
                    onCriarSegmento(nome)
                    onChange({ segmentos: [...l.segmentos, nome] })
                  }}
                />
              </PopoverEditor>
            </Field>

            <Field>
              <FieldLabel htmlFor="detalhe-orgao">Órgão</FieldLabel>
              <Textarea
                id="detalhe-orgao"
                rows={2}
                maxLength={200}
                value={l.orgao}
                onChange={(e) => onChange({ orgao: e.target.value })}
                onKeyDown={enterConclui}
                className="min-h-0"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="detalhe-objeto">Objeto</FieldLabel>
              <Textarea
                id="detalhe-objeto"
                rows={7}
                maxLength={5000}
                value={l.objeto}
                aria-describedby="detalhe-objeto-aviso"
                onChange={(e) => onChange({ objeto: e.target.value })}
                className="min-h-0 leading-snug"
              />
              <FieldDescription id="detalhe-objeto-aviso" className="flex items-center gap-1.5 text-xs text-warning">
                <TriangleAlertIcon aria-hidden className="size-3.5 shrink-0" />
                Este texto vem do edital: edite com cautela.
              </FieldDescription>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="detalhe-status">Status</FieldLabel>
                <EditorStatus
                  open={editando === "status"}
                  onOpenChange={abrir("status")}
                  valor={l.status}
                  onChange={(v) => {
                    onChange({ status: v })
                    setEditando(null)
                  }}
                >
                  <button id="detalhe-status" type="button" className={GATILHO_CAMPO}>
                    {status ? <PillStatus status={status} /> : <span className="text-muted-foreground">Definir status</span>}
                  </button>
                </EditorStatus>
              </Field>

              <Field>
                <FieldLabel htmlFor="detalhe-data">Data de envio da proposta</FieldLabel>
                <PopoverEditor
                  open={editando === "dataEnvio"}
                  onOpenChange={abrir("dataEnvio")}
                  className="min-w-60"
                  gatilho={
                    <button id="detalhe-data" type="button" className={cn(GATILHO_CAMPO, "tabular-nums")}>
                      {l.dataEnvio ? formatarData(l.dataEnvio) : <span className="text-muted-foreground">Definir data</span>}
                    </button>
                  }
                >
                  <CalendarioData
                    valor={l.dataEnvio}
                    onEscolher={(iso) => {
                      onChange({ dataEnvio: iso })
                      setEditando(null)
                    }}
                    onLimpar={() => {
                      onChange({ dataEnvio: null })
                      setEditando(null)
                    }}
                  />
                </PopoverEditor>
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="detalhe-responsaveis">Responsáveis</FieldLabel>
              <PopoverEditor
                open={editando === "responsaveis"}
                onOpenChange={abrir("responsaveis")}
                gatilho={
                  <button id="detalhe-responsaveis" type="button" className={GATILHO_CAMPO}>
                    {pessoas.length ? (
                      pessoas.map((p) => <ChipPessoa key={p.id} nome={p.nome} />)
                    ) : (
                      <span className="text-muted-foreground">Sem responsáveis</span>
                    )}
                  </button>
                }
              >
                <ListaPessoas
                  selecionados={l.responsaveis}
                  onAlternar={(id) =>
                    onChange({
                      responsaveis: l.responsaveis.includes(id)
                        ? l.responsaveis.filter((x) => x !== id)
                        : [...l.responsaveis, id],
                    })
                  }
                />
              </PopoverEditor>
            </Field>

            <div className="grid grid-cols-[1fr_auto] gap-4">
              <Field>
                <FieldLabel htmlFor="detalhe-cidade">Cidade</FieldLabel>
                <Input
                  id="detalhe-cidade"
                  maxLength={100}
                  value={l.cidade}
                  onChange={(e) => onChange({ cidade: e.target.value })}
                  onKeyDown={enterConclui}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="detalhe-estado">Estado</FieldLabel>
                <NativeSelect id="detalhe-estado" value={l.estado} onChange={(e) => onChange({ estado: e.target.value })}>
                  {UFS.map((uf) => (
                    <NativeSelectOption key={uf} value={uf}>
                      {uf}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="detalhe-valor">Valor global</FieldLabel>
              <CampoValor
                id="detalhe-valor"
                valor={l.valorGlobal}
                onSalvar={(v) => onChange({ valorGlobal: v })}
              />
            </Field>
          </FieldGroup>
        </div>
      </SheetContent>
    </Sheet>
  )
}
