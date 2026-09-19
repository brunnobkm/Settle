// Painel de revisão do Resumo, usado no sheet (sobre a página) e no workspace (acoplado).
// Cabeçalho (título, Copiar conteúdo, histórico, fechar), corpo conforme a variante
// (agrupado em seções, sem agrupamento ou Score) e, ao abrir a origem de uma informação,
// o documento do edital ao lado. No workspace estreito, abas alternam Resumo e Edital.

import { useEffect, useRef, useState } from "react"
import { XIcon } from "lucide-react"
import { toast } from "sonner"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DocumentViewer } from "@/components/ui/document-viewer"
import { SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

import {
  OBJETO,
  SCORE,
  SECOES,
  TEXTO_COPIA_PLANO,
  TEXTO_COPIA_RESUMO,
  TEXTO_COPIA_SCORE,
} from "./dados"
import { Divergencia } from "./Divergencia"
import { LISTA_DE_DOCUMENTOS, PAGINAS, type DocKey } from "./documentos"
import { Historico } from "./Historico"
import { Linha } from "./Linha"
import { contextoEfetivo, copiarTexto, temFonte, type Painel } from "./painel"
import { BarraDeLote, ListaPlana } from "./Plano"
import { CartaoDoScore } from "./Score"

/** Abaixo desta largura, o workspace com o edital aberto vira abas. */
const LARGURA_COMPACTA = 760

function CartaoSimples({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <Card className="flex-none gap-1.25 rounded-xl py-3.5 shadow-none">
      <CardHeader className="px-4">
        <CardTitle className="text-[13px] leading-tight font-semibold">{titulo}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 text-[13px] leading-[1.55] text-muted-foreground">{children}</CardContent>
    </Card>
  )
}

function Secoes({ painel }: { painel: Painel }) {
  const { estado } = painel
  const score = estado.variante === "score"
  return (
    <Accordion
      type="multiple"
      value={estado.secoesAbertas}
      onValueChange={painel.definirSecoesAbertas}
      className="flex-none gap-2"
    >
      {SECOES.map((secao) => {
        const visiveis = secao.divergencias.filter((d) => !estado.divergencias[d.id].resolvida)
        const ultima = visiveis.at(-1)
        const linhaSemBorda = ultima ? !estado.divergencias[ultima.id].aberta : false
        return (
          <AccordionItem key={secao.id} value={secao.id} className="overflow-hidden rounded-xl border bg-card not-last:border-b">
            <AccordionTrigger className="min-h-11 items-center rounded-none px-4 py-3.5 text-sm leading-tight font-semibold hover:bg-muted hover:no-underline focus-visible:ring-inset **:data-[slot=accordion-trigger-icon]:size-4.5 **:data-[slot=accordion-trigger-icon]:text-foreground">
              {secao.titulo}
            </AccordionTrigger>
            <AccordionContent className="pb-0">
              {visiveis.map((d, i) => (
                <Divergencia
                  key={d.id}
                  painel={painel}
                  id={d.id}
                  semBordaSuperior={i > 0 && !estado.divergencias[visiveis[i - 1].id].aberta}
                />
              ))}
              <dl>
                {estado.ordem[secao.id].map((id, i) => (
                  <Linha
                    key={id}
                    painel={painel}
                    id={id}
                    score={score}
                    className={cn("border-t", i === 0 && linhaSemBorda && "border-t-0")}
                  />
                ))}
              </dl>
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}

export function PainelDeRevisao({
  painel,
  emSheet,
  onFechar,
}: {
  painel: Painel
  /** No sheet o título é o SheetTitle (nome acessível da janela). */
  emSheet?: boolean
  onFechar: () => void
}) {
  const { estado } = painel
  const { variante, fonte } = estado
  const raiz = useRef<HTMLDivElement>(null)
  const [largura, setLargura] = useState(0)
  const compacto = !emSheet && fonte.aberta && largura > 0 && largura < LARGURA_COMPACTA
  const mostrarFonte = !compacto || estado.aba === "fonte"
  const mostrarResumo = !compacto || estado.aba === "resumo"
  const titulo = variante === "score" ? "Score" : "Resumo"

  // o workspace pode ficar estreito (alça ou janela): mede para decidir as abas
  useEffect(() => {
    const el = raiz.current
    if (!el || emSheet) return
    const observador = new ResizeObserver(([entrada]) => setLargura(entrada.contentRect.width))
    observador.observe(el)
    return () => observador.disconnect()
  }, [emSheet])

  // clique fora da informação ativa (e fora do documento) encerra o vínculo de trecho
  const temContexto = Boolean(estado.contexto)
  const { limparContexto } = painel
  useEffect(() => {
    if (!temContexto) return
    const aoClicar = (e: MouseEvent) => {
      const alvo = e.target
      if (!(alvo instanceof Element)) return
      if (
        alvo.closest(
          "[data-contexto-ativo], [data-editor-nova], [data-slot=document-viewer-body], [data-slot=document-viewer-selection-action]"
        )
      )
        return
      limparContexto()
    }
    document.addEventListener("click", aoClicar)
    return () => document.removeEventListener("click", aoClicar)
  }, [temContexto, limparContexto])

  const ctx = contextoEfetivo(estado)
  let dica: string | undefined
  if (ctx?.tipo === "linha") {
    dica = temFonte(estado.linhas[ctx.linhaId]) ? "Selecione um novo trecho" : "Selecione um trecho"
  } else if (ctx?.tipo === "nova") {
    dica = estado.divergencias[ctx.divergenciaId].nova?.fonte ? "Selecione um novo trecho" : "Selecione um trecho"
  }

  const copiarConteudo = async () => {
    const texto = variante === "score" ? TEXTO_COPIA_SCORE : variante === "plano" ? TEXTO_COPIA_PLANO : TEXTO_COPIA_RESUMO
    toast((await copiarTexto(texto)) ? "Conteúdo copiado!" : "Não foi possível copiar.")
  }

  const Titulo = emSheet ? SheetTitle : "h2"

  return (
    <div
      ref={raiz}
      className={cn(
        "relative grid h-full min-h-0 w-full grid-rows-[auto_minmax(0,1fr)] bg-background",
        fonte.aberta && !compacto && "grid-cols-[minmax(360px,1fr)_minmax(360px,1fr)]"
      )}
    >
      <header className="col-start-1 row-start-1 flex min-h-16 min-w-0 items-center gap-3 border-b p-4 max-[520px]:items-start">
        {compacto && (
          <>
            <Tabs value={estado.aba} onValueChange={(v) => painel.definirAba(v as "resumo" | "fonte")}>
              <TabsList aria-label="Alternar workspace" className="h-auto">
                <TabsTrigger value="resumo" className="px-2.5 py-1.5 text-xs font-semibold">
                  {titulo}
                </TabsTrigger>
                <TabsTrigger value="fonte" className="px-2.5 py-1.5 text-xs font-semibold">
                  Edital
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <span aria-hidden className="h-7 w-px flex-none bg-border" />
          </>
        )}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Titulo className="text-lg leading-none font-semibold">{titulo}</Titulo>
          <Badge variant="warning" className="text-xs">
            Versão beta
          </Badge>
        </div>
        <div className="relative flex min-w-0 items-center gap-2 max-[520px]:gap-1.5">
          <Button variant="secondary" size="sm" className="truncate text-[13px] max-[520px]:px-2.25" onClick={copiarConteudo}>
            Copiar conteúdo
          </Button>
          <Historico painel={painel} />
          <Button variant="ghost" size="icon-sm" aria-label="Fechar" title="Fechar" onClick={onFechar}>
            <XIcon aria-hidden />
          </Button>
        </div>
      </header>

      <div
        className={cn(
          "col-start-1 row-start-2 flex min-h-0 flex-col gap-2 overflow-y-auto px-3 pt-3 pb-5",
          variante === "plano" && "pb-22",
          !mostrarResumo && "hidden"
        )}
      >
        {variante === "score" && <CartaoDoScore />}
        {variante !== "plano" && <CartaoSimples titulo="Objeto">{OBJETO}</CartaoSimples>}
        {variante === "score" && <CartaoSimples titulo="Valor global">{SCORE.valorGlobal}</CartaoSimples>}
        {variante === "plano" ? <ListaPlana painel={painel} /> : <Secoes painel={painel} />}
      </div>

      {fonte.aberta && (
        <DocumentViewer
          aria-label="Trecho do edital"
          documents={LISTA_DE_DOCUMENTOS}
          value={fonte.documento}
          onValueChange={(doc) => painel.trocarDocumento(doc as DocKey)}
          pages={PAGINAS[fonte.documento]}
          highlight={fonte.destaque}
          highlightKey={fonte.token}
          documentLabel="Documento aberto"
          onDownload={() => toast("Download do edital iniciado!")}
          downloadLabel="Baixar edital"
          onClose={painel.fecharFonte}
          closeLabel="Fechar trecho"
          selectionActionLabel={ctx ? "Usar este trecho" : "Adicionar como fonte"}
          onSelectionAction={painel.usarSelecao}
          pointerHint={dica}
          onClickWithoutSelection={() => {
            if (ctx) painel.limparContexto()
          }}
          className={cn(
            compacto ? "col-start-1 row-start-2" : "col-start-2 row-span-2 row-start-1 border-l",
            !mostrarFonte && "hidden"
          )}
        />
      )}

      {variante === "plano" && <BarraDeLote painel={painel} />}
    </div>
  )
}
