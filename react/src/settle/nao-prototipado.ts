// Links e botões para telas que ainda não existem levam data-nao-prototipado:
// o clique não navega e mostra um toast (mesma regra do settle.js das telas HTML).

import { useEffect } from "react"
import { toast } from "sonner"

export const MENSAGEM_NAO_PROTOTIPADO = "Esta página ainda não foi prototipada."

/** Chame uma vez no App da tela. */
export function useNaoPrototipado() {
  useEffect(() => {
    const aoClicar = (e: MouseEvent) => {
      const alvo = e.target instanceof Element ? e.target.closest("[data-nao-prototipado]") : null
      if (!alvo) return
      e.preventDefault()
      e.stopPropagation()
      toast(MENSAGEM_NAO_PROTOTIPADO)
    }
    // captura: roda antes dos handlers do React e impede a navegação
    document.addEventListener("click", aoClicar, true)
    return () => document.removeEventListener("click", aoClicar, true)
  }, [])
}
