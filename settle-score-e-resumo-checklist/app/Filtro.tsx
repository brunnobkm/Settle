// Aba Filtro: simulação em padrão de produção. Lista de cards completos com o score
// na barra; "Filtrar" abre o painel com o toggle "Precisa de revisão" (só vale ao
// salvar); "Ordenar" reordena; clicar no chip âmbar simula a conclusão da revisão,
// que alimenta a bandeja de revisados e o painel lateral do edital.

import { useEffect, useRef, useState } from "react"
import { CircleAlertIcon, ExternalLinkIcon, FileTextIcon, GaugeIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"

import { CardDoEdital } from "./CardDoEdital"
import {
  CLASSES_DO_TOM,
  EDITAIS_DO_FILTRO,
  ORDENS,
  ordenar,
  temperaturaDoScore,
  type EditalDoFiltro,
  type Ordem,
} from "./dados"

const DURACAO_SAIDA = 260 // ms: card saindo da lista filtrada

/* ------------------------------------------------------------------ */
/* Estado (compartilhado entre a barra de ações e o painel)            */
/* ------------------------------------------------------------------ */

export function useFiltro() {
  const [editais, setEditais] = useState<EditalDoFiltro[]>(EDITAIS_DO_FILTRO)
  const [ordem, setOrdem] = useState<Ordem>("maior")
  // o filtro só vale depois de "Salvar Alterações"; o toggle do painel é um rascunho
  const [revisaoAplicada, setRevisaoAplicada] = useState(false)
  const [rascunho, setRascunho] = useState(false)
  const [filtrosAbertos, setFiltrosAbertos] = useState(false)
  const [saindo, setSaindo] = useState<string[]>([])
  const [revisados, setRevisados] = useState<{ edital: string; score: number }[]>([])
  const [detalhe, setDetalhe] = useState<string | null>(null)
  const timers = useRef<number[]>([])

  useEffect(() => {
    const ativos = timers.current
    return () => ativos.forEach((t) => window.clearTimeout(t))
  }, [])

  const pendentes = editais.filter((d) => d.revisar).length
  const lista = ordenar(editais, ordem).filter(
    (d) => !revisaoAplicada || d.revisar > 0 || saindo.includes(d.edital)
  )

  return {
    ordem,
    lista,
    pendentes,
    saindo,
    revisados,
    detalhe,
    rascunho,
    filtrosAbertos,
    setOrdem,
    setRascunho,
    /** Abre o painel Filtros; o toggle mostra o que está aplicado de fato. Fecha o painel do edital. */
    abrirFiltros() {
      setDetalhe(null)
      setRascunho(revisaoAplicada)
      setFiltrosAbertos(true)
    },
    fecharFiltros: () => setFiltrosAbertos(false),
    salvarFiltros() {
      setRevisaoAplicada(rascunho)
      setFiltrosAbertos(false)
    },
    /** Zera e aplica (mostra tudo), mantendo o painel aberto. */
    limparFiltros() {
      setRascunho(false)
      setRevisaoAplicada(false)
    },
    /** Atalho do aviso: já liga e aplica o filtro. */
    filtrarPendentes() {
      setRascunho(true)
      setRevisaoAplicada(true)
    },
    /** Simula a conclusão da revisão: o score consolida no lugar. */
    concluirRevisao(edital: string) {
      const alvo = editais.find((d) => d.edital === edital)
      if (!alvo) return
      setEditais((ds) => ds.map((d) => (d.edital === edital ? { ...d, revisar: 0 } : d)))
      if (revisaoAplicada) {
        // filtro ligado: já não pertence à lista, sai com transição
        setSaindo((s) => [...s, edital])
        timers.current.push(
          window.setTimeout(() => setSaindo((s) => s.filter((e) => e !== edital)), DURACAO_SAIDA)
        )
      }
      setRevisados((r) => [...r, { edital, score: alvo.score }])
    },
    dispensarRevisados: () => setRevisados([]),
    /** Abre o edital revisado no painel lateral (fecha o painel Filtros). */
    abrirDetalhe(edital: string) {
      setFiltrosAbertos(false)
      setDetalhe(edital)
    },
    fecharDetalhe: () => setDetalhe(null),
  }
}

type Filtro = ReturnType<typeof useFiltro>

/* ------------------------------------------------------------------ */
/* Barra de ações (ao lado das abas)                                   */
/* ------------------------------------------------------------------ */

const BOTAO_DA_BARRA = "h-8 px-3 text-sm font-medium"

export function AcoesDoFiltro({ f }: { f: Filtro }) {
  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" className={BOTAO_DA_BARRA} onClick={f.abrirFiltros}>
        Filtrar
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className={BOTAO_DA_BARRA}>
            Ordenar
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-50" aria-label="Ordenar por">
          <DropdownMenuGroup>
            <DropdownMenuRadioGroup value={f.ordem} onValueChange={(v) => f.setOrdem(v as Ordem)}>
              {ORDENS.map((o) => (
                <DropdownMenuRadioItem key={o.chave} value={o.chave}>
                  {o.rotulo}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button variant="ghost" className={BOTAO_DA_BARRA} data-nao-prototipado>
        Exportar
      </Button>
      <Button variant="ghost" className={BOTAO_DA_BARRA} data-nao-prototipado>
        Buscar
      </Button>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Lista                                                               */
/* ------------------------------------------------------------------ */

const CHIP = "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.25 text-sm font-semibold whitespace-nowrap [&>svg]:size-4"

function ScoreDoEdital({ d, onConcluir }: { d: EditalDoFiltro; onConcluir: () => void }) {
  if (d.revisar) {
    const itens = d.revisar > 1 ? "itens" : "item"
    return (
      <Button
        variant="ghost"
        className={cn(CHIP, "h-auto bg-warning/10 text-warning hover:bg-warning/15 hover:text-warning")}
        title={`Simulação: clique para concluir a revisão dos ${d.revisar} itens`}
        aria-label={`${d.score}/100 · Revisar ${d.revisar} ${itens}: concluir a revisão (simulação)`}
        onClick={onConcluir}
      >
        <GaugeIcon data-icon="inline-start" />
        {d.score}/100 · Revisar {d.revisar} {itens}
      </Button>
    )
  }
  const t = temperaturaDoScore(d.score)
  const tom = CLASSES_DO_TOM[t.tom]
  return (
    <span className={cn(CHIP, tom.fundo, tom.texto)}>
      <GaugeIcon aria-hidden />
      <span className="sr-only">Score </span>
      {d.score}/100
      <span className="sr-only">, {t.rotulo}</span>
    </span>
  )
}

export function PainelDoFiltro({ f }: { f: Filtro }) {
  const editalDoDetalhe = f.revisados.find((r) => r.edital === f.detalhe)

  return (
    <>
      {f.ordem === "menor" && f.pendentes > 0 && (
        // aviso contextual enquanto "Menor score" está ativo
        <Alert variant="warning" className="mb-4 border-transparent bg-warning/10">
          <CircleAlertIcon />
          <AlertTitle className="leading-tight tracking-[-.01em]">
            {f.pendentes} {f.pendentes > 1 ? "editais ainda precisam" : "edital ainda precisa"} de revisão
          </AlertTitle>
          <AlertDescription className="grid justify-items-start gap-2.5 text-[13px] text-warning [&_p:not(:last-child)]:mb-0">
            <p className="leading-normal">
              O score deles ainda é parcial, porque há itens a revisar, e pode se confundir com score baixo no
              "Menor score". Resolva as revisões para o score consolidar e a ordem ficar confiável.
            </p>
            <Button className="px-3.5" onClick={f.filtrarPendentes}>
              Filtrar pendentes
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {f.lista.length ? (
        <ul className="flex flex-col gap-4">
          {f.lista.map((d) => (
            <li
              key={d.edital}
              className={cn(
                "transition-[opacity,transform] duration-250 ease-out",
                f.saindo.includes(d.edital) && "pointer-events-none -translate-y-1.5 opacity-0"
              )}
            >
              <CardDoEdital
                edital={d}
                acaoExtra={<ScoreDoEdital d={d} onConcluir={() => f.concluirRevisao(d.edital)} />}
              />
            </li>
          ))}
        </ul>
      ) : (
        <Empty className="gap-1.5 border border-dashed border-foreground/20 bg-muted px-8 py-14">
          <EmptyHeader>
            <EmptyTitle className="text-[15px] font-semibold">Nenhuma licitação precisa de revisão</EmptyTitle>
            <EmptyDescription className="max-w-105 text-[13px] leading-[19px]">
              Todos os editais em revisão foram resolvidos. Desligue o filtro em Filtrar para ver todas as licitações.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {/* painel Filtros */}
      <Sheet open={f.filtrosAbertos} onOpenChange={(aberto) => (aberto ? f.abrirFiltros() : f.fecharFiltros())}>
        <SheetContent showCloseButton={false} className="w-95 gap-4 p-5 sm:max-w-95">
          <SheetHeader className="gap-4 p-0">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-lg font-bold">Filtros</SheetTitle>
              <SheetClose asChild>
                <Button variant="ghost" size="icon-sm" aria-label="Fechar">
                  <XIcon />
                </Button>
              </SheetClose>
            </div>
            <SheetDescription className="text-[13px]">
              Personalize os filtros da sua busca. Lembre-se de salvar suas alterações.
            </SheetDescription>
          </SheetHeader>
          <div className="flex items-center justify-between gap-3 rounded-lg border px-3.5 py-3">
            <div>
              <Label htmlFor="precisa-de-revisao" className="text-sm font-semibold">
                Precisa de revisão
              </Label>
              <p id="precisa-de-revisao-dica" className="text-xs text-muted-foreground">
                Mostrar só os que precisam de revisão
              </p>
            </div>
            <Switch
              id="precisa-de-revisao"
              aria-describedby="precisa-de-revisao-dica"
              checked={f.rascunho}
              onCheckedChange={f.setRascunho}
            />
          </div>
          <SheetFooter className="p-0">
            <Button className="w-full" onClick={f.salvarFiltros}>
              Salvar Alterações
            </Button>
            <Button variant="outline" className="w-full" onClick={f.limparFiltros}>
              Limpar Filtros
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* painel lateral do edital revisado: abre sem tirar a pessoa da lista */}
      <Sheet open={!!editalDoDetalhe} onOpenChange={(aberto) => !aberto && f.fecharDetalhe()}>
        <SheetContent showCloseButton={false} className="w-95 gap-4 p-5 sm:max-w-95">
          <SheetHeader className="gap-4 p-0">
            <div className="flex items-center justify-between gap-2">
              <SheetTitle className="text-lg font-bold">Score</SheetTitle>
              <div className="flex flex-none items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="font-semibold shadow-none"
                  title="Abrir a licitação em outra aba (desabilitado no protótipo)"
                  data-nao-prototipado
                >
                  <ExternalLinkIcon data-icon="inline-start" />
                  Abrir licitação
                </Button>
                <SheetClose asChild>
                  <Button variant="ghost" size="icon-sm" aria-label="Fechar">
                    <XIcon />
                  </Button>
                </SheetClose>
              </div>
            </div>
            <SheetDescription className="text-[13px]">
              Score consolidado após a revisão do Edital {editalDoDetalhe?.edital}
            </SheetDescription>
          </SheetHeader>
          {/* corpo provisório: os dados do edital ainda são stand-in no protótipo */}
          <Empty className="min-h-55 flex-none gap-2 border border-dashed border-foreground/20 bg-muted p-8">
            <EmptyHeader>
              <EmptyMedia className="text-muted-foreground/60 [&>svg]:size-6.5">
                <FileTextIcon aria-hidden />
              </EmptyMedia>
              <EmptyTitle className="text-[15px] font-semibold">Dados do edital</EmptyTitle>
              <EmptyDescription className="max-w-95 text-[13px] leading-[19px]">
                Placeholder: aqui entram o score consolidado, órgão, valor, itens revisados e demais informações do
                edital. Conteúdo a definir.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </SheetContent>
      </Sheet>

      {/* bandeja fixa de revisados (acumula na sessão) */}
      {f.revisados.length > 0 && (
        <section
          aria-label="Editais revisados"
          aria-live="polite"
          className="fixed bottom-5 left-5 w-80 max-w-[calc(100vw-40px)] overflow-hidden rounded-lg border border-l-3 border-l-success bg-background shadow-lg"
        >
          <div className="flex items-center justify-between border-b px-3 py-2.5">
            <p className="text-[13px] text-muted-foreground">
              <b className="text-sm text-success">{f.revisados.length}</b>{" "}
              {f.revisados.length > 1 ? "editais revisados" : "edital revisado"}
            </p>
            <Button variant="ghost" size="icon-xs" aria-label="Dispensar revisados" onClick={f.dispensarRevisados}>
              <XIcon />
            </Button>
          </div>
          <ul className="max-h-50 overflow-y-auto">
            {f.revisados.map((r) => (
              <li
                key={r.edital}
                className="flex items-center justify-between gap-2 border-t px-3 py-2.25 text-[13px] first:border-t-0"
              >
                <span className="min-w-0">
                  <b>Edital {r.edital}</b> · agora {r.score}/100
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 flex-none px-2.5 text-[13px] font-semibold shadow-none"
                  onClick={() => f.abrirDetalhe(r.edital)}
                >
                  Abrir
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}
