// Painéis e confirmações da análise: visualizador do edital (origem), sheet "Editar informações",
// avisos de confirmação, alerta de item travado e o cartão "Preparando resultados".

import { useLayoutEffect, useRef, useState } from "react"
import { CheckIcon, Trash2Icon, XIcon } from "lucide-react"
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Spinner } from "@/components/ui/spinner"

import { BlocoDescricao } from "./Descricao"
import { Dica } from "./comum"
import { ITENS, definirValorRequerido, especificacaoNaoExigida, type ComponenteProduto, type Especificacao } from "./dados"
import { MenuDeNaoExigidas } from "./Matriz"

/* ============================================================
   Visualizador do arquivo (origem da extração)
   Divide a tela com a análise (empurra o conteúdo, sem fundo escurecido). Aberto de dentro
   do sheet de editar, fica ao lado dele.
   ============================================================ */
export function PainelDeOrigem({
  aberta,
  aoLadoDaEdicao,
  onFechar,
}: {
  aberta: boolean
  aoLadoDaEdicao: boolean
  onFechar: () => void
}) {
  return (
    <Sheet open={aberta} onOpenChange={(v) => !v && onFechar()} modal={false}>
      <SheetContent
        side="right"
        size="md"
        data-painel-origem
        className={cn("gap-0 shadow-md", aoLadoDaEdicao && "data-[side=right]:right-110")}
        // cliques na análise não fecham o painel: ele fica aberto ao lado enquanto a pessoa confere
        onInteractOutside={(e) => e.preventDefault()}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <SheetHeader className="border-b px-4.5 py-4">
          <SheetTitle className="text-[15px] font-semibold">Visualizador do arquivo</SheetTitle>
          <SheetDescription className="sr-only">Página e trecho do edital de onde a informação foi extraída.</SheetDescription>
        </SheetHeader>
        <div className="flex flex-1 items-center justify-center p-4.5 text-center text-sm font-medium text-muted-foreground">
          Visualizador do arquivo
        </div>
      </SheetContent>
    </Sheet>
  )
}

/* ============================================================
   Sheet "Editar informações" (seção de produto)
   Mostra a Descrição completa e os campos da coluna Valor requerido. Salvar aplica e atualiza
   a comparação; Cancelar descarta. Especificações adicionadas aqui só vão para a tabela ao salvar.
   ============================================================ */
/** Avisos do sheet saem no centro, para não cobrir o Salvar. */
const NO_SHEET = { position: "bottom-center" } as const
const ehSimNao = (v: string) => /^(sim|n[aã]o)\b/i.test(v.trim())
const valorInicial = (s: Especificacao) => (ehSimNao(s.exig) ? (/^sim/i.test(s.exig) ? "Sim" : "Não") : s.exig)

export function EdicaoDeProduto({
  aberta,
  specs,
  comp,
  descricao,
  onVerNoEdital,
  onFechar,
  onSalvar,
}: {
  aberta: boolean
  specs: Especificacao[]
  comp: ComponenteProduto
  descricao: string
  onVerNoEdital: () => void
  onFechar: () => void
  onSalvar: (specs: Especificacao[]) => void
}) {
  const [rascunho, setRascunho] = useState(specs)
  const [iniciais] = useState(() => Object.fromEntries(specs.map((s) => [s.id, valorInicial(s)])))
  const [valores, setValores] = useState<Record<string, string>>(iniciais)
  const [descAberta, setDescAberta] = useState(true)
  const [remover, setRemover] = useState<Especificacao | null>(null)
  const [focar, setFocar] = useState<string | null>(null)
  const adicionarRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!focar) return
    const el = document.getElementById(`campo-${focar}`)
    el?.focus()
    el?.scrollIntoView({ block: "center", behavior: "smooth" })
    setFocar(null)
  }, [focar])

  const disponiveis = comp.catalogoNaoEdital.filter((d) => !rascunho.some((s) => s.req === d.req)).map((d) => d.req)

  function adicionar(req: string) {
    const d = comp.catalogoNaoEdital.find((x) => x.req === req)
    if (!d) return
    const nova = especificacaoNaoExigida(d, comp.skus)
    setRascunho((r) => [...r, nova])
    setValores((v) => ({ ...v, [nova.id]: "" }))
    setFocar(nova.id)
    toast(`"${req}" adicionada. Salve para aplicar na tabela.`, NO_SHEET)
  }
  function salvar() {
    // recalcula só o que mudou (e as especificações adicionadas aqui)
    onSalvar(
      rascunho.map((s) => {
        if (s.exigNa) return s
        const v = (valores[s.id] ?? "").trim()
        return v !== iniciais[s.id] || !(s.id in iniciais) ? definirValorRequerido(s, v) : s
      })
    )
  }

  return (
    <Sheet open={aberta} onOpenChange={(v) => !v && onFechar()}>
      <SheetContent
        side="right"
        size="md"
        showCloseButton={false}
        className="gap-0"
        // o visualizador do edital, aberto daqui, fica ao lado sem fechar a edição
        onInteractOutside={(e) => {
          if ((e.target as Element | null)?.closest?.("[data-painel-origem]")) e.preventDefault()
        }}
      >
        <SheetHeader className="flex-row flex-wrap items-center gap-2 border-b px-4.5 py-4">
          <SheetTitle className="text-[15px] font-semibold">Editar informações</SheetTitle>
          <SheetDescription className="sr-only">Revise as especificações extraídas do edital e salve para atualizar a análise.</SheetDescription>
          <div ref={adicionarRef} className="ml-auto">
            <MenuDeNaoExigidas disponiveis={disponiveis} travado={false} onTravado={() => {}} onEscolher={adicionar} />
          </div>
          <SheetClose asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Fechar" className="text-muted-foreground">
              <XIcon />
            </Button>
          </SheetClose>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto p-4.5">
          <p className="mb-4.5 rounded-lg border bg-muted px-4 py-3.5 text-[12.5px] leading-normal text-muted-foreground">
            Revise as especificações extraídas do edital. Ao salvar, vamos atualizar a análise de compatibilidade dos produtos.
          </p>
          <BlocoDescricao
            texto={descricao}
            aberto={descAberta}
            onAlternar={() => setDescAberta((v) => !v)}
            onVerNoEdital={onVerNoEdital}
          />
          <h3 className="mt-5 mb-2.5 text-[15px] font-semibold">Especificações</h3>
          <div className="flex flex-col gap-3.5">
            {rascunho.map((s) => {
              if (s.exigNa) return null
              const id = `campo-${s.id}`
              const simNao = ehSimNao(s.exig)
              return (
                <div key={s.id} className="flex flex-col gap-1.5">
                  <Label htmlFor={id} className="text-[13px] font-semibold">
                    {s.req}
                  </Label>
                  <div className="flex items-center gap-2">
                    {simNao ? (
                      <NativeSelect
                        id={id}
                        className="w-full"
                        value={valores[s.id]}
                        onChange={(e) => setValores((v) => ({ ...v, [s.id]: e.target.value }))}
                      >
                        <NativeSelectOption>Sim</NativeSelectOption>
                        <NativeSelectOption>Não</NativeSelectOption>
                      </NativeSelect>
                    ) : (
                      <Input
                        id={id}
                        value={valores[s.id] ?? ""}
                        onChange={(e) => setValores((v) => ({ ...v, [s.id]: e.target.value }))}
                        className="flex-1"
                      />
                    )}
                    {s.fromDiff && (
                      <Dica texto="Remover da comparação">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Remover ${s.req}`}
                          className="size-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => setRemover(s)}
                        >
                          <Trash2Icon />
                        </Button>
                      </Dica>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <SheetFooter className="gap-2 border-t px-4.5 py-3.5">
          <Button size="lg" className="w-full font-semibold" onClick={salvar}>
            Salvar
          </Button>
          <SheetClose asChild>
            <Button size="lg" variant="ghost" className="w-full font-semibold">
              Cancelar
            </Button>
          </SheetClose>
        </SheetFooter>

        <ConfirmarExclusao
          aberta={!!remover}
          onCancelar={() => setRemover(null)}
          onConfirmar={() => {
            if (!remover) return
            setRascunho((r) => r.filter((x) => x.id !== remover.id))
            toast(`"${remover.req}" removida. Salve para aplicar na tabela.`, NO_SHEET)
            setRemover(null)
            requestAnimationFrame(() => adicionarRef.current?.querySelector<HTMLElement>("button, [tabindex]")?.focus())
          }}
        />
      </SheetContent>
    </Sheet>
  )
}

/* ============================================================
   Confirmações
   ============================================================ */

/** Primeira edição direta na célula: avisa que recalcula a análise (não pergunta de novo). */
export function ConfirmarEdicao({ aberta, onCancelar, onConfirmar }: { aberta: boolean; onCancelar: () => void; onConfirmar: () => void }) {
  return (
    <AlertDialog open={aberta} onOpenChange={(v) => !v && onCancelar()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar edição?</AlertDialogTitle>
          <AlertDialogDescription className="leading-relaxed text-foreground">
            Editar o <b className="font-semibold">valor requerido</b> recalcula a análise de compatibilidade dos produtos para
            este requisito. Você também pode editar em lote pelo botão <b className="font-semibold">Editar</b> da seção. Não
            perguntaremos de novo.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirmar}>Confirmar e recalcular</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

/** Trocar a categoria reprocessa os requisitos da seção com o catálogo da nova categoria. */
export function ConfirmarTrocaDeCategoria({
  categoria,
  onCancelar,
  onConfirmar,
}: {
  categoria: string | null
  onCancelar: () => void
  onConfirmar: () => void
}) {
  return (
    <AlertDialog open={categoria != null} onOpenChange={(v) => !v && onCancelar()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Trocar a categoria?</AlertDialogTitle>
          <AlertDialogDescription className="leading-relaxed text-foreground">
            Ao trocar para <b className="font-semibold">{categoria}</b>, vamos{" "}
            <b className="font-semibold">analisar esta seção de novo</b> usando o catálogo dessa categoria. Os requisitos e o
            resultado (o que você atende e o que não atende) podem mudar.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirmar}>Reprocessar requisitos</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function ConfirmarExclusao({ aberta, onCancelar, onConfirmar }: { aberta: boolean; onCancelar: () => void; onConfirmar: () => void }) {
  return (
    <AlertDialog open={aberta} onOpenChange={(v) => !v && onCancelar()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir requisito</AlertDialogTitle>
          <AlertDialogDescription className="text-foreground">Você tem certeza de que deseja excluir o requisito?</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirmar}>
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

/** Outra pessoa está reprocessando o item: a leitura segue livre, a edição espera terminar. */
export function AlertaDeTrava({ por, onFechar }: { por: string | null; onFechar: () => void }) {
  return (
    <AlertDialog open={por != null} onOpenChange={(v) => !v && onFechar()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Item em reprocessamento</AlertDialogTitle>
          <AlertDialogDescription className="leading-relaxed text-foreground">
            <b className="font-semibold">{por}</b> está reprocessando os requisitos deste item. Você poderá editar quando a
            análise terminar.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onFechar}>Entendi</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

/* ============================================================
   "Preparando resultados": itens reprocessando depois de trocar a categoria
   ============================================================ */
export function CartaoDeProcessamento({ resultados, onAbrir }: { resultados: Record<number, boolean>; onAbrir: (i: number) => void }) {
  const itens = Object.entries(resultados)
  if (!itens.length) return null
  return (
    <aside
      aria-label="Preparando resultados"
      className="fixed bottom-5 left-5 z-20 w-90 max-w-[calc(100vw-40px)] rounded-lg border bg-background p-5 shadow-lg"
    >
      <h2 className="mb-2 text-[15px] font-semibold">Preparando resultados</h2>
      <p className="mb-5 text-[13px] leading-normal text-muted-foreground">
        Estamos preparando os resultados abaixo. Você pode continuar navegando; um ✓ aparecerá quando cada item estiver
        disponível.
      </p>
      <ul aria-live="polite" className="max-h-55 overflow-auto">
        {itens.map(([id, pronto]) => {
          const titulo = ITENS[+id].titulo || ITENS[+id].nome
          return (
            <li key={id} className="border-t py-1">
              <button
                type="button"
                aria-label={`Análise técnica: ${titulo}: ${pronto ? "concluído" : "processando"}`}
                onClick={() => onAbrir(+id)}
                className="flex w-full items-center gap-2.5 rounded-md p-2 text-left text-[13px] outline-none hover:bg-muted focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                {pronto ? (
                  <CheckIcon aria-hidden className="size-3.5 shrink-0 text-success" />
                ) : (
                  <Spinner aria-hidden className="size-3.5 shrink-0 text-primary" />
                )}
                <span className="min-w-0 flex-1 break-words">Análise técnica: {titulo}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
