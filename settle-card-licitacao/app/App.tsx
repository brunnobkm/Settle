// Card de licitação: edição inline por tipo de propriedade.
// Dois cards: o de cima tem uma fonte do edital (o globo abre direto); o de baixo tem
// duas (o globo abre um menu para escolher onde abrir o edital).

import { useNaoPrototipado } from "@/settle/nao-prototipado"

import { CardEditavel } from "./CardEditavel"
import { LINKS_DO_EDITAL } from "./dados"

export function PaginaDoCard({ titulo }: { titulo: string }) {
  useNaoPrototipado()

  return (
    <main className="flex min-h-svh flex-col items-center gap-4 bg-muted p-8 max-sm:p-4">
      <h1 className="sr-only">{titulo}</h1>
      <CardEditavel linksDoEdital={LINKS_DO_EDITAL.slice(0, 1)} />
      <CardEditavel linksDoEdital={LINKS_DO_EDITAL} />
    </main>
  )
}

export default function App() {
  return <PaginaDoCard titulo="Card de licitação" />
}
