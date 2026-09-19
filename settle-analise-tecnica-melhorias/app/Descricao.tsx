// "Descrição completa" do item: começa aberta; ao passar o mouse mostra copiar e ver no edital.
// Usada na análise e no sheet de editar.

import { ArrowUpRightIcon, ChevronDownIcon, ChevronUpIcon, CopyIcon } from "lucide-react"

import { Dica } from "./comum"

export function BlocoDescricao({
  texto,
  aberto,
  onAlternar,
  onVerNoEdital,
}: {
  texto: string
  aberto: boolean
  onAlternar: () => void
  onVerNoEdital: () => void
}) {
  return (
    <div className="group/desc rounded-lg border bg-card">
      <div className="flex cursor-pointer items-center gap-2.5 px-4 py-3.5 select-none" onClick={onAlternar}>
        <button type="button" aria-expanded={aberto} className="flex-1 rounded-sm text-left text-sm font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
          Descrição completa
        </button>
        {/* ao passar o mouse: copiar a descrição e ver no edital */}
        <span
          className="inline-flex overflow-hidden rounded-md border border-border bg-muted opacity-0 transition-opacity group-hover/desc:opacity-100 focus-within:opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          <Dica texto="Copiar a descrição">
            <button
              type="button"
              aria-label="Copiar a descrição"
              data-nao-prototipado
              className="grid h-6.5 w-7 place-items-center text-muted-foreground outline-none hover:bg-foreground/5 hover:text-primary focus-visible:bg-foreground/5 [&_svg]:size-3.75"
            >
              <CopyIcon />
            </button>
          </Dica>
          <Dica texto="Ver no edital">
            <button
              type="button"
              aria-label="Ver a descrição no edital"
              onClick={onVerNoEdital}
              className="grid h-6.5 w-7 place-items-center border-l text-muted-foreground outline-none hover:bg-foreground/5 hover:text-primary focus-visible:bg-foreground/5 [&_svg]:size-3.75"
            >
              <ArrowUpRightIcon />
            </button>
          </Dica>
        </span>
        {aberto ? (
          <ChevronUpIcon aria-hidden className="size-4 text-muted-foreground" />
        ) : (
          <ChevronDownIcon aria-hidden className="size-4 text-muted-foreground" />
        )}
      </div>
      {aberto && <p className="max-w-245 px-4 pt-1.5 pb-3.5 text-[13px] leading-relaxed text-muted-foreground">{texto}</p>}
    </div>
  )
}
