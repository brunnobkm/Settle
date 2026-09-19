// O que aparece por cima ou ao lado da tela: o card de acompanhamento, o painel do
// Score e do Checklist, e a confirmação do que não dá para desfazer sozinho.

import { useEffect, type ReactNode } from "react"
import { XIcon } from "lucide-react"

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
import { BackgroundTasks } from "@/components/ui/background-tasks"
import { Button } from "@/components/ui/button"
import { DockedPanel } from "@/components/ui/docked-panel"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { useSidebar } from "@/components/ui/sidebar"

import { FUNCS } from "./dados"
import { useSim } from "./estado"
import { PainelDeResultado } from "./Funcionalidade"

/* ------------------------------------------------------------------ */
/* Card de acompanhamento                                              */
/* ------------------------------------------------------------------ */

/*
  Aparece quando um evento aciona um ou mais agentes: só os que rodam naquele evento. No
  canto inferior esquerdo, fora do caminho da Settle AI, e depois da sidebar (encostado
  na borda, cobria o avatar do rodapé dela). Não fecha enquanto houver item ativo, e o
  fechamento vale para quem fechou, não para o time. Fora da licitação não aparece.
*/
export function Acompanhamento() {
  const { area, prepItens, licFoco: lic, abrirFuncionalidade, tentarDeNovo, fecharPrep } = useSim()
  const { open, isMobile } = useSidebar()
  if (area !== "workspace" || !prepItens.length) return null

  const ativos = prepItens.filter((k) => lic.fx[k] === "preparando").length
  const falhas = prepItens.filter((k) => lic.fx[k] === "falhou").length

  return (
    <BackgroundTasks
      aria-label="Preparando resultados"
      className={cn(
        "fixed bottom-6 transition-[left] duration-200",
        isMobile ? "right-4 left-4 w-auto" : open ? "left-[calc(var(--sidebar-width)+1rem)]" : "left-[calc(var(--sidebar-width-icon)+1rem)]"
      )}
      title={ativos ? "Preparando resultados" : falhas ? "Nem todos os resultados carregaram" : "Resultados disponíveis"}
      description={
        ativos
          ? "Estamos preparando os resultados abaixo. Você pode continuar navegando; um ✓ aparecerá quando cada item estiver disponível."
          : falhas
            ? "O que ficou pronto já está na licitação. Tente de novo o que faltou."
            : "Todos os itens estão prontos para consulta."
      }
      items={prepItens.map((k) => ({
        id: k,
        label: FUNCS[k].nome,
        status: lic.fx[k] === "preparando" ? "running" : lic.fx[k] === "falhou" ? "failed" : "done",
        onSelect: () => {
          abrirFuncionalidade(k)
          if (k === "tecnica" || k === "habil") {
            requestAnimationFrame(() =>
              document.getElementById("abas-da-licitacao")?.scrollIntoView({ behavior: "smooth", block: "center" })
            )
          }
        },
        /* o caminho de volta fica na própria linha: dizer "não carregou" e deixar a pessoa
           procurar onde tentar de novo é meio caminho */
        onRetry: () => tentarDeNovo(k),
      }))}
      onClose={fecharPrep}
      labels={{ failed: "Não foi possível carregar" }}
    />
  )
}

/* ------------------------------------------------------------------ */
/* Painel do Score e do Checklist                                      */
/* ------------------------------------------------------------------ */

function Cabeca({ k, acoes, titulo }: { k: string; acoes: ReactNode; titulo: (t: string) => ReactNode }) {
  const { fecharPainel } = useSim()
  return (
    <div className="flex shrink-0 items-center gap-2.5 px-5 py-4.5">
      {titulo(k === "score" ? "Score" : "Checklist")}
      {acoes}
      <Button variant="ghost" size="icon-sm" aria-label="Fechar o painel" onClick={fecharPainel}>
        <XIcon />
      </Button>
    </div>
  )
}

/* Dentro da licitação o painel cobre a tela, com o fundo escurecido para fechar. */
export function PainelSobreposto() {
  const { painel, fecharPainel, trazerChatParaFrente } = useSim()
  const aberto = !!painel && !painel.lado
  /* a conversa desliza para a esquerda e continua à vista, por cima do painel */
  useEffect(() => {
    if (!aberto) return
    const t = window.setTimeout(trazerChatParaFrente, 0)
    return () => window.clearTimeout(t)
  }, [aberto, trazerChatParaFrente])
  return (
    <Sheet open={aberto} onOpenChange={(o) => !o && fecharPainel()}>
      <SheetContent
        side="right"
        size="md"
        showCloseButton={false}
        aria-describedby={undefined}
        /* o foco vai para o painel, não para o primeiro botão: senão a dica dele abre sozinha */
        onOpenAutoFocus={(e) => {
          e.preventDefault()
          ;(e.currentTarget as HTMLElement | null)?.focus()
        }}
        className="gap-0 bg-background"
      >
        {painel && !painel.lado && (
          <PainelDeResultado
            k={painel.k}
            cabecalho={(acoes) => (
              <Cabeca k={painel.k} acoes={acoes} titulo={(t) => <SheetTitle className="min-w-0 flex-1 text-lg font-semibold">{t}</SheetTitle>} />
            )}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}

/* Aberto pela lista, o painel empurra a tela em vez de cobri-la: o card que abriu
   continua à vista, e dá para ver o botão e o resultado mudarem juntos quando o
   cenário troca. Sem cobrir, não há fundo para clicar: sai pelo X ou pelo Esc. */
export function PainelAoLado() {
  const { painel, fecharPainel, modal, confirmacao } = useSim()
  const aberto = !!painel?.lado
  useEffect(() => {
    if (!aberto) return
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !modal && !confirmacao && !e.defaultPrevented) fecharPainel()
    }
    document.addEventListener("keydown", aoTeclar)
    return () => document.removeEventListener("keydown", aoTeclar)
  }, [aberto, modal, confirmacao, fecharPainel])

  return (
    <DockedPanel open={aberto} width={30} aria-label="Resultado do agente" className="sticky top-0 h-svh min-h-0 self-start">
      {painel?.lado && (
        <PainelDeResultado
          k={painel.k}
          cabecalho={(acoes) => (
            <Cabeca k={painel.k} acoes={acoes} titulo={(t) => <h2 className="min-w-0 flex-1 text-lg font-semibold">{t}</h2>} />
          )}
        />
      )}
    </DockedPanel>
  )
}

/* ------------------------------------------------------------------ */
/* Confirmação                                                         */
/* ------------------------------------------------------------------ */

/* Para o que não dá para desfazer sozinho: o corpo diz o estrago antes, não depois. */
export function Confirmacao() {
  const { confirmacao, setConfirmacao } = useSim()
  return (
    <AlertDialog open={!!confirmacao} onOpenChange={(o) => !o && setConfirmacao(null)}>
      <AlertDialogContent className="sm:max-w-110">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-[17px] font-semibold">{confirmacao?.titulo}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="flex flex-col gap-1.5 text-sm leading-[21px]">{confirmacao?.corpo}</div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel autoFocus>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => {
              const faz = confirmacao?.faz
              setConfirmacao(null)
              faz?.()
            }}
          >
            {confirmacao?.rotulo}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
