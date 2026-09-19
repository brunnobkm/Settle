// Navegação entre variações do mesmo modelo de card (ex.: Frio / Morno / Quente).

import { Fragment, useState, type ReactNode } from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export function Variacoes({ rotulos, children }: { rotulos: string[]; children: (indice: number) => ReactNode }) {
  const [indice, setIndice] = useState(0)
  const total = rotulos.length
  const ir = (passo: number) => setIndice((i) => (i + passo + total) % total)

  return (
    <div>
      <div className="mb-2.5 flex items-center justify-center gap-3">
        <Button variant="outline" size="icon-xs" className="size-7 shadow-none" aria-label="Variação anterior" onClick={() => ir(-1)}>
          <ChevronLeftIcon />
        </Button>
        <span aria-live="polite" className="min-w-42.5 text-center text-[13px] font-semibold text-muted-foreground">
          {rotulos[indice] ?? `${indice + 1}/${total}`}
        </span>
        <Button variant="outline" size="icon-xs" className="size-7 shadow-none" aria-label="Próxima variação" onClick={() => ir(1)}>
          <ChevronRightIcon />
        </Button>
      </div>
      {/* key: cada variação é um card próprio (estado de acordeão/painel não passa de uma para outra) */}
      <Fragment key={indice}>{children(indice)}</Fragment>
    </div>
  )
}
