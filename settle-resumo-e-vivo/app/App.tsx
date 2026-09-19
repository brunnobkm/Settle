// Resumo da licitação: página de entrada com quatro formas de abrir o Resumo extraído
// do edital. "Card da licitação" e "Resumo sem agrupamento" abrem um sheet sobre a página;
// "Workspace da licitação" abre uma lateral acoplada que empurra o conteúdo (larguras
// ajustáveis pela alça); "Vivo - POC" abre o sheet com o Score da Vivo.

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { DockedPanel } from "@/components/ui/docked-panel"
import { Sheet, SheetContent, SheetDescription } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useNaoPrototipado } from "@/settle/nao-prototipado"

import { PainelDeRevisao } from "./PainelDeRevisao"
import { usePainel, type Variante } from "./painel"

/** Larguras do workspace (vw) e limites da alça: só o Resumo, ou Resumo + edital. */
const LIMITES = { resumo: [34, 45], fonte: [64, 78] } as const

export default function App() {
  useNaoPrototipado()

  const [sheetAberto, setSheetAberto] = useState(false)
  const painelSheet = usePainel("resumo")
  const [lateralAberta, setLateralAberta] = useState(false)
  const painelLateral = usePainel("resumo")
  const [larguras, setLarguras] = useState({ resumo: 39, fonte: 70 })

  const modoLateral = painelLateral.estado.fonte.aberta ? "fonte" : "resumo"
  const [minimo, maximo] = LIMITES[modoLateral]

  const fecharLateral = () => {
    setLateralAberta(false)
    painelLateral.fecharFonte()
  }

  const fecharSheet = () => {
    setSheetAberto(false)
    painelSheet.fecharFonte()
  }

  const abrirSheet = (variante: Variante) => {
    if (lateralAberta) fecharLateral()
    // outra variante: o painel começa do zero; a mesma mantém o que foi feito
    if (painelSheet.estado.variante !== variante) painelSheet.reiniciar(variante)
    setSheetAberto(true)
  }

  const alternarLateral = () => {
    if (lateralAberta) return fecharLateral()
    if (sheetAberto) fecharSheet()
    setLateralAberta(true)
  }

  // Esc no workspace: desfaz o estado mais interno; sem nada aberto, fecha a lateral
  const { tratarEscape: escapeDaLateral, fecharFonte: fecharFonteDaLateral } = painelLateral
  useEffect(() => {
    if (!lateralAberta || sheetAberto) return
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || e.defaultPrevented) return
      if (escapeDaLateral()) return
      setLateralAberta(false)
      fecharFonteDaLateral()
    }
    document.addEventListener("keydown", aoTeclar)
    return () => document.removeEventListener("keydown", aoTeclar)
  }, [lateralAberta, sheetAberto, escapeDaLateral, fecharFonteDaLateral])

  const fonteNoSheet = painelSheet.estado.fonte.aberta

  return (
    <div className="flex min-h-svh bg-muted text-foreground">
      <main
        className={cn(
          "grid min-w-0 flex-1 items-center overflow-hidden px-16 py-12 max-[520px]:items-start max-[520px]:px-5 max-[520px]:py-8",
          lateralAberta && "max-[980px]:hidden"
        )}
      >
        <section className="max-w-170">
          <h1 className="text-[clamp(42px,6vw,76px)] leading-[0.95] font-bold tracking-normal">
            Analisar resumo extraído
          </h1>
          <p className="mt-5.5 max-w-135 text-lg leading-normal text-muted-foreground">
            Use o card para abrir um sheet sobre a página ou o workspace para abrir a sidebar acoplada que empurra o
            conteúdo.
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <Button className="rounded-full px-5 text-[13px]" onClick={() => abrirSheet("resumo")}>
              Card da licitação
            </Button>
            <Button variant="outline" className="rounded-full px-5 text-[13px]" onClick={() => abrirSheet("plano")}>
              Resumo sem agrupamento
            </Button>
            <Button
              variant="outline"
              aria-expanded={lateralAberta}
              className="rounded-full px-5 text-[13px]"
              onClick={alternarLateral}
            >
              Workspace da licitação
            </Button>
            <Button variant="outline" className="rounded-full px-5 text-[13px]" onClick={() => abrirSheet("score")}>
              Vivo - POC
            </Button>
          </div>
        </section>
      </main>

      <DockedPanel
        open={lateralAberta}
        width={larguras[modoLateral]}
        minWidth={minimo}
        maxWidth={maximo}
        onWidthChange={(w) => setLarguras((l) => ({ ...l, [modoLateral]: w }))}
        resizeLabel="Redimensionar workspace"
        aria-label="Workspace da licitação"
        className={cn(
          "sticky top-0 h-svh",
          "max-[980px]:data-[state=open]:w-[min(500px,100vw)] max-[520px]:data-[state=open]:w-screen",
          modoLateral === "fonte" && "max-[980px]:data-[state=open]:w-screen"
        )}
      >
        <PainelDeRevisao painel={painelLateral} onFechar={fecharLateral} />
      </DockedPanel>

      <Sheet open={sheetAberto} onOpenChange={(aberto) => (aberto ? setSheetAberto(true) : fecharSheet())}>
        <SheetContent
          side="right"
          showCloseButton={false}
          onEscapeKeyDown={(e) => {
            if (painelSheet.tratarEscape()) e.preventDefault()
          }}
          className={cn(
            "gap-0 p-0 shadow-[-12px_0_32px_color-mix(in_oklab,var(--foreground)_12%,transparent)] transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
            "data-[side=right]:w-[min(500px,100vw)] data-[side=right]:max-w-none data-[side=right]:sm:max-w-none",
            fonteNoSheet && "data-[side=right]:w-[86vw]",
            "max-[520px]:data-[side=right]:w-screen"
          )}
        >
          <SheetDescription className="sr-only">
            Resumo extraído do edital, com divergências para revisar e a origem de cada informação.
          </SheetDescription>
          <PainelDeRevisao painel={painelSheet} emSheet onFechar={fecharSheet} />
        </SheetContent>
      </Sheet>
    </div>
  )
}
