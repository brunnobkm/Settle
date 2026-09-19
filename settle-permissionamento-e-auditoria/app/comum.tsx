// Peças pequenas usadas nas duas visões: toast de confirmação, pílula de função
// e o diálogo de confirmação.

import { useState, type ReactNode } from "react"
import { CheckIcon } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { FUNCOES, type Funcao } from "./dados"

/** Toast de sucesso (com o ícone de check, como no protótipo original). */
export function avisar(mensagem: string) {
  toast(mensagem, { icon: <CheckIcon className="size-4" /> })
}

export const primeiraMaiuscula = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)

/** Pílula neutra com o nome da função. */
export function PilulaDeFuncao({ funcao, className }: { funcao: Funcao; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border bg-muted px-2.25 py-0.75 text-[12.5px] leading-none font-medium whitespace-nowrap text-foreground/75",
        className
      )}
    >
      {FUNCOES[funcao].rotulo}
    </span>
  )
}

export type PedidoDeConfirmacao = {
  icone: ReactNode
  titulo: string
  mensagem: ReactNode
  rotuloOk: string
  perigo?: boolean
  onOk: () => void
}

export function Confirmacao({ pedido, onFechar }: { pedido: PedidoDeConfirmacao | null; onFechar: () => void }) {
  // mantém o último pedido na tela durante a animação de saída
  const [visivel, setVisivel] = useState(pedido)
  if (pedido && pedido !== visivel) setVisivel(pedido)

  return (
    <AlertDialog open={pedido !== null} onOpenChange={(aberto) => !aberto && onFechar()}>
      <AlertDialogContent className="sm:max-w-107.5">
        {visivel && (
          <>
            <AlertDialogHeader className="place-items-start gap-0 text-left">
              <div
                aria-hidden
                className={cn(
                  "mb-3.5 flex size-10.5 items-center justify-center rounded-lg [&_svg]:size-5",
                  visivel.perigo ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                )}
              >
                {visivel.icone}
              </div>
              <AlertDialogTitle className="mb-1.75 text-[17px] font-bold">{visivel.titulo}</AlertDialogTitle>
              <AlertDialogDescription className="text-[13.5px] leading-relaxed">
                {visivel.mensagem}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel variant="ghost">Cancelar</AlertDialogCancel>
              <AlertDialogAction
                variant={visivel.perigo ? "destructive" : "default"}
                onClick={() => {
                  onFechar()
                  visivel.onOk()
                }}
              >
                {visivel.rotuloOk}
              </AlertDialogAction>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}
