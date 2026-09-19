// Painel lateral "Origem da extração": página e trecho do edital de onde a IA tirou o requisito.

import { FileTextIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"

import { partesDoTrecho, type Origem } from "./dados"

export type OrigemAberta = { req: string; exig?: string; exigNa?: boolean; origem: Origem }

export function PainelDeOrigem({ aberta, onFechar }: { aberta: OrigemAberta | null; onFechar: () => void }) {
  const o = aberta?.origem
  return (
    <Sheet open={!!aberta} onOpenChange={(v) => !v && onFechar()}>
      <SheetContent side="right" className="w-110 max-w-[92vw] gap-0 sm:max-w-110">
        <SheetHeader className="border-b px-4.5 py-4">
          <SheetTitle className="text-[15px] font-semibold">Origem da extração</SheetTitle>
          <SheetDescription className="sr-only">Página e trecho do edital de onde a IA extraiu o requisito.</SheetDescription>
        </SheetHeader>
        {aberta && o && (
          <div className="overflow-y-auto p-4.5">
            <div className="mb-1 text-[13px] text-muted-foreground">Requisito</div>
            <div className="mb-2.5 text-base font-semibold">
              {aberta.req}
              {!aberta.exigNa && (
                <span className="font-medium text-muted-foreground">
                  {" "}
                  · exigido: <span className="font-mono">{aberta.exig}</span>
                </span>
              )}
            </div>
            <div className="mb-3.5 inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
              <FileTextIcon aria-hidden className="size-3.5" />
              {o.doc}
              {o.pag != null && (
                <Badge variant="secondary" className="text-[11px] font-semibold text-foreground">
                  página {o.pag}
                </Badge>
              )}
            </div>
            <div className="mb-1.5 text-[13px] text-muted-foreground">Trecho de onde a informação foi extraída:</div>
            <blockquote className="rounded-r-lg border-l-3 border-primary bg-muted px-3.5 py-3 text-sm leading-relaxed">
              {o.trecho
                ? partesDoTrecho(o.trecho).map((p, i) =>
                    p.destaque ? (
                      <mark key={i} className="rounded-[3px] bg-warning/25 px-0.5 text-foreground">
                        {p.texto}
                      </mark>
                    ) : (
                      <span key={i}>{p.texto}</span>
                    )
                  )
                : "Inserido manualmente pelo usuário."}
            </blockquote>
            <p className="mt-3.5 text-[13px] text-muted-foreground">
              A IA destacou o trecho acima do documento original. Confira a página {o.pag ?? "indicada"} do {o.doc} para
              validação manual.
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
