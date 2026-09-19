// Tela cheia da análise de um item: resumo do Termo de Referência, a mecânica certa para o
// tipo do item (matriz de SKUs, checklist ou as duas em seções) e a decisão no rodapé.

import { useState, type ReactNode } from "react"
import { CheckIcon, DownloadIcon, Share2Icon, XIcon } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

import { Checklist } from "./Checklist"
import { Dica } from "./comum"
import {
  SKUS,
  TIPO_ROTULO,
  melhor,
  resumirItem,
  type Celula,
  type ChaveChecklist,
  type Especificacao,
  type EstadoChecklist,
  type Item,
  type LinhaChecklist,
  type Preferencias,
  type Secao,
} from "./dados"
import { Matriz } from "./Matriz"
import { PainelDeOrigem, type OrigemAberta } from "./Origem"

export const MSG_EXPORTAR = "Exportando análise (PDF · planilha · resumo técnico)…"

export type AcoesDaAnalise = {
  alterarSpec: (matriz: string, ri: number, patch: Partial<Especificacao>) => void
  alterarCelula: (matriz: string, ri: number, ci: number, patch: Partial<Celula>) => void
  adicionarRequisito: (matriz: string) => void
  escolher: (item: number, sku: number) => void
  alternarStatus: (checklist: ChaveChecklist, id: string, st: EstadoChecklist) => void
  adicionarLinha: (checklist: ChaveChecklist) => void
  preferencias: (patch: Partial<Preferencias>) => void
}

const questionar = (req: string) =>
  toast(`Abrindo questionamento/impugnação: “${req}” (referente ao edital)`)

export function Frentes({ secs }: { secs: { tipo: Secao["tipo"]; ok: boolean }[] }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-x-1.5">
      {secs.map((s, i) => (
        <span key={s.tipo} className="inline-flex items-center gap-1">
          {i > 0 && <span aria-hidden>·</span>}
          {s.ok ? (
            <CheckIcon aria-label="atende" className="size-3.5 text-success" />
          ) : (
            <XIcon aria-label="não atende" className="size-3.5 text-destructive" />
          )}
          {TIPO_ROTULO[s.tipo].toLowerCase()}
        </span>
      ))}
    </span>
  )
}

function SeletorDeModo({
  rotulo,
  dica,
  ligado,
  onMudar,
}: {
  rotulo: string
  dica: string
  ligado: boolean
  onMudar: (v: boolean) => void
}) {
  return (
    <Dica texto={dica}>
      <Label
        className={cn(
          "h-8 cursor-pointer rounded-lg border bg-background px-2.75 text-[13px] hover:bg-muted",
          ligado && "border-primary bg-primary/10 text-primary hover:bg-primary/15"
        )}
      >
        <Switch size="sm" checked={ligado} onCheckedChange={onMudar} />
        {rotulo}
      </Label>
    </Dica>
  )
}

export function Analise({
  indice,
  item,
  matrizes,
  checklists,
  prefs,
  acoes,
  onFechar,
}: {
  indice: number | null
  item: Item | null
  matrizes: Record<string, Especificacao[]>
  checklists: Record<ChaveChecklist, LinhaChecklist[]>
  prefs: Preferencias
  acoes: AcoesDaAnalise
  onFechar: () => void
}) {
  const aberta = indice != null && item != null
  return (
    <Dialog open={aberta} onOpenChange={(v) => !v && onFechar()}>
      <DialogContent
        showCloseButton={false}
        // foca a própria janela (e não o primeiro controle), para não abrir a dica dele sozinha
        onOpenAutoFocus={(e) => {
          e.preventDefault()
          ;(e.currentTarget as HTMLElement | null)?.focus()
        }}
        className="top-0 left-0 flex h-svh w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none bg-background p-0 ring-0 sm:max-w-none data-open:zoom-in-100 data-closed:zoom-out-100"
      >
        {aberta && (
          <Conteudo
            indice={indice}
            item={item}
            matrizes={matrizes}
            checklists={checklists}
            prefs={prefs}
            acoes={acoes}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function Conteudo({
  indice,
  item,
  matrizes,
  checklists,
  prefs,
  acoes,
}: {
  indice: number
  item: Item
  matrizes: Record<string, Especificacao[]>
  checklists: Record<ChaveChecklist, LinhaChecklist[]>
  prefs: Preferencias
  acoes: AcoesDaAnalise
}) {
  const [origem, setOrigem] = useState<OrigemAberta | null>(null)
  const resumo = resumirItem(item, matrizes, checklists)
  const chaveMatriz = item.tipo === "produto" ? item.matriz : item.secoes?.find((s) => s.tipo === "produto")?.matriz
  const temMatriz = !!chaveMatriz
  const best = chaveMatriz ? melhor(matrizes[chaveMatriz]) : null
  const escolhido = prefs.chosen[indice]

  const matriz = (chave: string) => (
    <Matriz
      specs={matrizes[chave]}
      escolhido={escolhido}
      larguras={prefs.colW}
      congeladas={prefs.frozen}
      mostrarConfianca={prefs.conf}
      soDiferencas={prefs.diff}
      onLarguras={(colW) => acoes.preferencias({ colW })}
      onCongeladas={(frozen) => acoes.preferencias({ frozen })}
      acoes={{
        alterarSpec: (ri, patch) => acoes.alterarSpec(chave, ri, patch),
        alterarCelula: (ri, ci, patch) => acoes.alterarCelula(chave, ri, ci, patch),
        adicionarRequisito: () => acoes.adicionarRequisito(chave),
        escolher: (sku) => acoes.escolher(indice, sku),
        verOrigem: (s) => setOrigem({ req: s.req, exig: s.exig, exigNa: s.exigNa, origem: s.origem }),
        questionar,
      }}
    />
  )
  const checklist = (chave: ChaveChecklist) => (
    <Checklist
      linhas={checklists[chave]}
      onAlternarStatus={(id, st) => acoes.alternarStatus(chave, id, st)}
      onAdicionar={() => acoes.adicionarLinha(chave)}
      onVerOrigem={(r) => setOrigem({ req: r.req, exig: r.exig, origem: r.origem })}
      onQuestionar={questionar}
    />
  )

  /* ---------- resumo do item (faixa abaixo do cabeçalho) ---------- */
  const extras: ReactNode[] = []
  const chipEscolhido = (prefixo: string) =>
    escolhido != null && (
      <Badge key="escolhido" className="h-6 bg-primary/10 px-2.5 font-semibold text-primary">
        <CheckIcon data-icon="inline-start" />
        {prefixo}
        {SKUS[escolhido].model}
      </Badge>
    )
  const listaDivergencias = (lista: string[]) =>
    lista.length ? <b className="font-semibold text-destructive">{lista.join(", ")}</b> : <b className="font-semibold">nenhuma</b>

  if (item.tipo === "produto" && best) {
    extras.push(
      <span key="rec">
        Recomendado: <b className="font-mono font-semibold text-foreground">{best.sku.model}</b>
        {` · ${best.ok}/${best.evaluable} (${best.pct}%)`}
      </span>,
      <span key="div">Divergências do recomendado: {listaDivergencias(best.diverg)}</span>,
      chipEscolhido("Escolhido: ")
    )
  } else if (resumo.kind === "check" && item.checklist) {
    const pend = checklists[item.checklist].filter((r) => r.st === "no" || r.st === "parcial").map((r) => r.req)
    extras.push(
      <span key="check">
        Atende {resumo.ok} de {resumo.total} · Pendências: {listaDivergencias(pend)}
      </span>
    )
  } else if (resumo.kind === "solucao") {
    extras.push(
      <span key="frentes" className="inline-flex items-center gap-1.5">
        Frentes: <Frentes secs={resumo.secs} />
      </span>
    )
    if (best)
      extras.push(
        <span key="cam">
          Câmeras: <b className="font-mono font-semibold text-foreground">{best.sku.model}</b> {best.pct}%
          {best.diverg.length > 0 && <> · divergências: {listaDivergencias(best.diverg)}</>}
        </span>,
        chipEscolhido("")
      )
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b px-5">
        <DialogTitle className="text-base font-semibold">Tabela</DialogTitle>
        <DialogDescription className="sr-only">Análise técnica do item: {item.nome}</DialogDescription>
        <div className="flex items-center gap-2">
          {temMatriz && (
            <SeletorDeModo
              rotulo="Modo diferenças"
              dica="Mostra só os requisitos em que os produtos divergem entre si; esconde os que todos atendem/não atendem igual"
              ligado={prefs.diff}
              onMudar={(diff) => acoes.preferencias({ diff })}
            />
          )}
          <SeletorDeModo
            rotulo="Confiança da IA"
            dica="Mostra o grau de confiança da IA em cada valor extraído (Alta/Média/Baixa); ajuda a saber o que revisar"
            ligado={prefs.conf}
            onMudar={(conf) => acoes.preferencias({ conf })}
          />
          <Dica texto="Compartilhar link desta análise (para validação por engenharia, fornecedor ou gestor)">
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Compartilhar link desta análise"
              className="text-muted-foreground"
              onClick={() => toast("Link da análise copiado: compartilhe para validação (engenharia, fornecedor, gestor)")}
            >
              <Share2Icon />
            </Button>
          </Dica>
          <Dica texto="Exportar a análise (PDF, planilha ou resumo técnico)">
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Exportar a análise"
              className="text-muted-foreground"
              onClick={() => toast(MSG_EXPORTAR)}
            >
              <DownloadIcon />
            </Button>
          </Dica>
          <Dica texto="Fechar e voltar à lista de itens">
            <DialogClose asChild>
              <Button variant="outline" size="icon-sm" aria-label="Fechar e voltar à lista de itens" className="text-muted-foreground">
                <XIcon />
              </Button>
            </DialogClose>
          </Dica>
        </div>
      </header>

      <div className="flex shrink-0 flex-wrap items-center gap-x-3.5 gap-y-2 border-b bg-muted/40 px-5 py-3 text-[13px] text-muted-foreground">
        <span className="max-w-155 text-sm font-semibold text-foreground">{item.nome}</span>
        {resumo.status === "ok" ? (
          <Badge variant="success">
            <CheckIcon data-icon="inline-start" />
            Atende
          </Badge>
        ) : (
          <Badge variant="destructive">
            <XIcon data-icon="inline-start" />
            Não atende
          </Badge>
        )}
        {extras}
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <div className="sticky left-0 border-b bg-muted/40 px-5 py-3.5">
          <div className="mb-1 text-[11px] font-bold tracking-wide text-primary uppercase">Resumo do Termo de Referência</div>
          <p className="max-w-240 text-[13px] leading-relaxed">{item.resumoTR}</p>
        </div>

        {item.tipo === "produto" && item.matriz && matriz(item.matriz)}
        {(item.tipo === "servico" || item.tipo === "software") && item.checklist && (
          <div className="pt-4 pb-6">{checklist(item.checklist)}</div>
        )}
        {item.tipo === "solucao" &&
          item.secoes?.map((s) => (
            <section key={s.titulo} aria-label={s.titulo}>
              <h3 className="sticky left-0 px-5 pt-4.5 pb-1 text-sm font-semibold">{s.titulo}</h3>
              {s.tipo === "produto" ? matriz(s.matriz) : <div className="pt-2 pb-4">{checklist(s.checklist)}</div>}
            </section>
          ))}
      </div>

      <footer className="flex shrink-0 flex-wrap items-center gap-2.5 border-t bg-muted/40 px-5 py-3">
        <p className="min-w-50 flex-1 text-[13px] text-muted-foreground">
          {resumo.status === "ok"
            ? "Item pronto para entrar na proposta."
            : "Há pendências: revise, questione ou descarte antes de prosseguir."}
        </p>
        <Button onClick={() => toast("Item adicionado à proposta", { icon: <CheckIcon className="size-4 text-success" /> })}>
          Adicionar à proposta
        </Button>
        <Button variant="outline" onClick={() => toast("Abrindo fluxo de questionamento / impugnação…")}>
          Questionar / Impugnar
        </Button>
        <Button
          variant="outline"
          className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => toast("Item descartado")}
        >
          Descartar item
        </Button>
      </footer>

      <PainelDeOrigem aberta={origem} onFechar={() => setOrigem(null)} />
    </>
  )
}
