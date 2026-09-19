// Múltiplas sidebars (multitasking): o workspace da licitação é uma sidebar acoplada à direita
// que divide a tela com o menu e o conteúdo principal. Primária = Resumo; auxiliar = Arquivos
// da licitação (abre ao lado ao ver a origem de uma informação).
//
// Regras de largura (px), sempre sobre o ESPAÇO ÚTIL (janela menos o menu, 52 ou 280px):
// - Resumo: 39% do espaço útil, entre 320px e o menor de 45% do espaço útil e espaço útil - 640px.
// - Resumo + Arquivos: 70% do espaço útil, entre 480px e espaço útil - 640px.
// - O conteúdo principal reserva 640px (exceto quando o espaço é muito apertado).
// - A largura escolhida na alça fica guardada por modo e é reajustada quando o espaço muda
//   (menu abre/fecha, janela muda); no arraste não há transição.
// - Até 980px de janela o conteúdo principal sai e o workspace ocupa todo o espaço útil.

import { useEffect, useLayoutEffect, useRef, useState } from "react"

import { AppShell } from "@/components/ui/app-shell"
import { Button } from "@/components/ui/button"
import { DockedPanel } from "@/components/ui/docked-panel"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { menuLicitacoes, SAUDACAO, USUARIO, WORKSPACE } from "@/settle/navegacao"
import { useNaoPrototipado } from "@/settle/nao-prototipado"

import { usePainel } from "./painel"
import { Workspace } from "./Workspace"

const MIN_ARQUIVOS_ABERTOS = 480
const MIN_RESUMO = 320
const RESERVA_CONTEUDO = 640
const MAX_RESUMO = 0.45
const PADRAO = { resumo: 0.39, fonte: 0.7 }
/** Até esta largura de janela o conteúdo principal sai e o workspace ocupa o espaço útil. */
const JANELA_ESTREITA = 980

type Modo = "resumo" | "fonte"

/** Limites do workspace (px) em cada modo, para o espaço útil dado. */
function limites(modo: Modo, util: number): [number, number] {
  if (modo === "fonte") return [MIN_ARQUIVOS_ABERTOS, Math.max(MIN_ARQUIVOS_ABERTOS, util - RESERVA_CONTEUDO)]
  return [MIN_RESUMO, Math.max(MIN_RESUMO, Math.min(util * MAX_RESUMO, util - RESERVA_CONTEUDO))]
}

const LINHAS_DO_ESQUELETO = Array.from({ length: 12 }, (_, i) => i + 1)

/** Lista carregando da página (larguras variam por linha, como no original). */
function Esqueleto() {
  return (
    <div aria-hidden className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
      {LINHAS_DO_ESQUELETO.map((n) => (
        <div key={n} className="flex min-w-0 flex-none items-center gap-4 overflow-hidden rounded-xl border px-4 py-4.5">
          <div className="flex min-w-0 flex-1 flex-col gap-2.25">
            <Skeleton className={cn("h-3.5 w-full animate-none", n % 3 === 0 ? "max-w-50" : "max-w-60")} />
            <Skeleton
              className={cn("h-3 w-full animate-none", n % 3 === 0 ? "max-w-[410px]" : n % 2 === 1 ? "max-w-75" : "max-w-90")}
            />
          </div>
          <div className="flex min-w-0 shrink flex-col items-end gap-2.25">
            <Skeleton className="h-3.5 w-full max-w-27.5 animate-none" />
            <Skeleton className="h-4.5 w-full max-w-16 animate-none rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function App() {
  useNaoPrototipado()

  const painel = usePainel()
  const [aberto, setAberto] = useState(false)
  const modo: Modo = painel.estado.fonte.aberta ? "fonte" : "resumo"

  // espaço útil: largura da área ao lado do menu (acompanha o menu abrir e fechar)
  const area = useRef<HTMLDivElement>(null)
  const [util, setUtil] = useState(0)
  const [janela, setJanela] = useState(() => window.innerWidth)
  useLayoutEffect(() => {
    const el = area.current
    if (!el) return
    setUtil(el.getBoundingClientRect().width)
    const observador = new ResizeObserver(([entrada]) => setUtil(entrada.contentRect.width))
    observador.observe(el)
    const aoRedimensionar = () => setJanela(window.innerWidth)
    window.addEventListener("resize", aoRedimensionar)
    return () => {
      observador.disconnect()
      window.removeEventListener("resize", aoRedimensionar)
    }
  }, [])

  // larguras escolhidas pela pessoa (px), lembradas por modo; null = proporção padrão
  const [escolhidas, setEscolhidas] = useState<Record<Modo, number | null>>({ resumo: null, fonte: null })
  const [larguraArquivos, setLarguraArquivos] = useState<number | null>(null)

  const estreita = janela <= JANELA_ESTREITA
  const [minimo, maximo] = limites(modo, util)
  const ajustar = (px: number) => Math.round(Math.min(Math.max(px, minimo), maximo))
  const larguraPx = ajustar(escolhidas[modo] ?? util * PADRAO[modo])
  // janela estreita: o workspace ocupa o espaço útil inteiro
  const larguraDoWorkspace = estreita ? util : larguraPx
  const emVw = (px: number) => (px / janela) * 100

  const fechar = () => {
    setAberto(false)
    painel.fecharFonte()
  }

  // Esc no workspace: desfaz o estado mais interno; sem nada aberto, fecha o workspace
  const { tratarEscape, fecharFonte } = painel
  useEffect(() => {
    if (!aberto) return
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || e.defaultPrevented) return
      if (tratarEscape()) return
      setAberto(false)
      fecharFonte()
    }
    document.addEventListener("keydown", aoTeclar)
    return () => document.removeEventListener("keydown", aoTeclar)
  }, [aberto, tratarEscape, fecharFonte])

  return (
    <AppShell
      workspace={WORKSPACE}
      groups={menuLicitacoes()}
      user={USUARIO}
      header={<span className="text-[15px] font-semibold">{SAUDACAO}</span>}
    >
      <div ref={area} className="flex h-[calc(100svh-4rem)] min-h-0 w-full overflow-hidden bg-muted">
        <div className={cn("flex min-w-0 flex-1 flex-col p-4", aberto && estreita && "hidden")}>
          <section
            aria-labelledby="titulo-da-pagina"
            className="flex h-full min-h-0 min-w-0 flex-col gap-5 rounded-2xl border bg-background p-6"
          >
            <header className="flex min-w-0 flex-none items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 id="titulo-da-pagina" className="text-2xl leading-tight font-bold tracking-[-0.01em]">
                  Analisar resumo extraído
                </h1>
                <p className="mt-1.5 max-w-130 text-sm leading-[1.45] text-muted-foreground">
                  Abra o workspace para visualizar o resumo na sidebar acoplada.
                </p>
              </div>
              <Button
                variant="outline"
                aria-expanded={aberto}
                aria-controls="workspace-da-licitacao"
                className="flex-none rounded-full px-5 text-[13px]"
                onClick={() => (aberto ? fechar() : setAberto(true))}
              >
                Abrir sidebar
              </Button>
            </header>
            <Esqueleto />
          </section>
        </div>

        <DockedPanel
          id="workspace-da-licitacao"
          aria-label="Workspace da licitação"
          open={aberto}
          width={emVw(larguraDoWorkspace)}
          minWidth={emVw(minimo)}
          maxWidth={emVw(maximo)}
          onWidthChange={
            estreita ? undefined : (vw) => setEscolhidas((e) => ({ ...e, [modo]: ajustar((vw * janela) / 100) }))
          }
          resizeLabel="Redimensionar workspace"
          style={{ "--docked-panel-width": `${larguraDoWorkspace}px` } as React.CSSProperties}
          className={cn(
            "h-full min-h-0 duration-350",
            // alça: linha na cor da marca ao passar o mouse e ao arrastar (igual à divisória Resumo | Arquivos)
            "[&>[data-slot=docked-panel-handle]]:before:w-0.5 [&>[data-slot=docked-panel-handle]:hover]:before:bg-primary [&>[data-slot=docked-panel-handle][data-resizing]]:before:bg-primary"
          )}
        >
          <Workspace
            painel={painel}
            largura={larguraDoWorkspace}
            larguraArquivos={larguraArquivos}
            onLarguraArquivos={setLarguraArquivos}
            onFechar={fechar}
          />
        </DockedPanel>
      </div>
    </AppShell>
  )
}
