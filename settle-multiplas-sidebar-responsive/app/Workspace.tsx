// Workspace da licitação: sidebar primária (Resumo) e, ao abrir a origem de uma informação,
// a auxiliar (Arquivos da licitação) ao lado, com divisória arrastável entre as duas.
// Abaixo de 760px de workspace com os arquivos abertos, vira modo abas (Resumo | Arquivos da
// licitação): o título some (a aba já é o título), as ações trocam por aba e, na aba dos
// arquivos, o seletor de documento e o download sobem para o cabeçalho. As ações do Resumo
// só recolhem no menu "Mais ações" quando o cabeçalho não comporta tudo em linha.

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { DownloadIcon, EllipsisVerticalIcon, TriangleAlertIcon, XIcon } from "lucide-react"
import { toast } from "sonner"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DocumentViewer } from "@/components/ui/document-viewer"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Popover, PopoverAnchor, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

import { OBJETO, SECOES, TEXTO_COPIA_RESUMO } from "./dados"
import { Divergencia } from "./Divergencia"
import { LISTA_DE_DOCUMENTOS, PAGINAS, type DocKey } from "./documentos"
import { ConteudoDoHistorico } from "./Historico"
import { Linha } from "./Linha"
import { contextoEfetivo, copiarTexto, temFonte, type Aba, type Painel } from "./painel"

/** Abaixo desta largura de workspace, com os arquivos abertos, o workspace vira abas. */
export const LARGURA_MODO_ABAS = 760
/** Mínimos do lado a lado: o Resumo e os Arquivos nunca ficam menores que isso. */
const MIN_RESUMO = 320
const MIN_ARQUIVOS = 320
/** Passo das setas do teclado na divisória Resumo | Arquivos. */
const PASSO = 16

function Secoes({ painel }: { painel: Painel }) {
  const { estado } = painel
  return (
    <Accordion type="multiple" value={estado.secoesAbertas} onValueChange={painel.definirSecoesAbertas} className="flex-none gap-2">
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
                  <Linha key={id} painel={painel} id={id} className={cn("border-t", i === 0 && linhaSemBorda && "border-t-0")} />
                ))}
              </dl>
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}

/** Divisória arrastável entre Resumo e Arquivos: dá largura própria aos Arquivos. */
function Divisoria({
  largura,
  onLargura,
  minimo,
  maximo,
}: {
  largura: number
  onLargura: (px: number) => void
  minimo: number
  maximo: number
}) {
  const [arrastando, setArrastando] = useState(false)

  useEffect(() => {
    if (!arrastando) return
    const { userSelect, cursor } = document.body.style
    document.body.style.userSelect = "none"
    document.body.style.cursor = "ew-resize"
    return () => {
      document.body.style.userSelect = userSelect
      document.body.style.cursor = cursor
    }
  }, [arrastando])

  const soltar = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!arrastando) return
    e.currentTarget.releasePointerCapture?.(e.pointerId)
    setArrastando(false)
  }

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Redimensionar largura dos Arquivos"
      aria-valuenow={Math.round(largura)}
      aria-valuemin={minimo}
      aria-valuemax={maximo}
      tabIndex={0}
      data-arrastando={arrastando || undefined}
      onPointerDown={(e) => {
        e.preventDefault()
        e.currentTarget.setPointerCapture?.(e.pointerId)
        setArrastando(true)
      }}
      onPointerMove={(e) => {
        // o workspace fica encostado na borda direita da janela
        if (arrastando) onLargura(window.innerWidth - e.clientX)
      }}
      onPointerUp={soltar}
      onPointerCancel={soltar}
      onKeyDown={(e) => {
        let proxima: number | null = null
        if (e.key === "ArrowLeft") proxima = largura + PASSO
        if (e.key === "ArrowRight") proxima = largura - PASSO
        if (e.key === "Home") proxima = minimo
        if (e.key === "End") proxima = maximo
        if (proxima === null) return
        e.preventDefault()
        onLargura(Math.min(maximo, Math.max(minimo, proxima)))
      }}
      className={cn(
        "absolute inset-y-0 -left-1 w-2.75 cursor-ew-resize touch-none outline-none",
        "before:absolute before:inset-y-0 before:left-1 before:w-0.5 before:bg-transparent before:transition-colors",
        "hover:before:bg-primary focus-visible:before:bg-ring data-arrastando:before:bg-primary"
      )}
    />
  )
}

export function Workspace({
  painel,
  largura,
  larguraArquivos,
  onLarguraArquivos,
  onFechar,
}: {
  painel: Painel
  /** Largura do workspace (px) que as regras de espaço definiram. */
  largura: number
  /** Largura dos Arquivos escolhida na divisória (px); null = metade do workspace. */
  larguraArquivos: number | null
  onLarguraArquivos: (px: number) => void
  /** Fecha o workspace inteiro. */
  onFechar: () => void
}) {
  const { estado, definirAba } = painel
  const { fonte, aba } = estado
  const cabecalho = useRef<HTMLElement>(null)
  const [historicoAberto, setHistoricoAberto] = useState(false)
  const abrindoHistorico = useRef(false)

  const modoAbas = fonte.aberta && largura < LARGURA_MODO_ABAS
  const ladoALado = fonte.aberta && !modoAbas
  const naAbaArquivos = modoAbas && aba === "fonte"
  const ctx = contextoEfetivo(estado)

  // largura própria dos Arquivos, reajustada para nunca esmagar o Resumo
  const maxArquivos = Math.max(MIN_ARQUIVOS, largura - MIN_RESUMO)
  const arquivos =
    larguraArquivos === null ? null : Math.round(Math.min(Math.max(larguraArquivos, MIN_ARQUIVOS), maxArquivos))

  // entrou no modo abas por mudança de espaço (e não por abrir um trecho): mostra os arquivos
  // só se houver uma informação recebendo trecho; ao sair do modo abas, volta ao Resumo
  const anterior = useRef({ modoAbas, token: fonte.token })
  useEffect(() => {
    const antes = anterior.current
    if (modoAbas && !antes.modoAbas && fonte.token === antes.token) definirAba(ctx ? "fonte" : "resumo")
    if (!modoAbas && antes.modoAbas) definirAba("resumo")
    anterior.current = { modoAbas, token: fonte.token }
  }, [modoAbas, fonte.token, ctx, definirAba])

  // ações do Resumo recolhem no "Mais ações" só quando o cabeçalho não comporta tudo em linha
  const sincronizarCabecalho = useCallback(() => {
    const el = cabecalho.current
    if (!el) return
    el.dataset.recolhido = "false"
    if (naAbaArquivos) return
    void el.offsetWidth
    el.dataset.recolhido = String(el.scrollWidth > el.clientWidth + 1)
  }, [naAbaArquivos])

  useLayoutEffect(sincronizarCabecalho)
  useEffect(() => {
    const el = cabecalho.current
    if (!el) return
    const observador = new ResizeObserver(sincronizarCabecalho)
    observador.observe(el)
    return () => observador.disconnect()
  }, [sincronizarCabecalho])

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

  let dica: string | undefined
  if (ctx?.tipo === "linha") {
    dica = temFonte(estado.linhas[ctx.linhaId]) ? "Selecione um novo trecho" : "Selecione um trecho"
  } else if (ctx?.tipo === "nova") {
    dica = estado.divergencias[ctx.divergenciaId].nova?.fonte ? "Selecione um novo trecho" : "Selecione um trecho"
  }

  const copiarConteudo = async () => {
    toast((await copiarTexto(TEXTO_COPIA_RESUMO)) ? "Conteúdo copiado!" : "Não foi possível copiar.")
  }
  const baixar = () => toast("Download do edital iniciado!")

  return (
    <div
      style={arquivos === null ? undefined : ({ "--largura-arquivos": `${arquivos}px` } as React.CSSProperties)}
      className={cn(
        "relative grid min-h-0 w-full flex-1 grid-rows-[auto_minmax(0,1fr)] bg-background",
        ladoALado && "grid-cols-[minmax(320px,1fr)_minmax(320px,var(--largura-arquivos,1fr))]"
      )}
    >
      <header
        ref={cabecalho}
        className="group/cabecalho @container col-start-1 row-start-1 flex min-h-16 min-w-0 items-center gap-3 border-b p-4 max-[520px]:items-start"
      >
        {modoAbas && (
          <Tabs value={aba} onValueChange={(v) => definirAba(v as Aba)} className="flex-none">
            <TabsList aria-label="Alternar workspace" className="h-8 p-0.5">
              <TabsTrigger value="resumo" className="px-2.5 text-xs font-semibold">
                Resumo
              </TabsTrigger>
              <TabsTrigger value="fonte" className="px-2.5 text-xs font-semibold">
                Arquivos da licitação
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        {/* no modo abas a aba já é o título */}
        {!modoAbas && (
          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
            <h2 className="min-w-0 truncate text-lg leading-none font-semibold">Resumo</h2>
            <Badge variant="warning" className="text-xs @max-[380px]:hidden">
              Versão beta
            </Badge>
          </div>
        )}

        {naAbaArquivos ? (
          <>
            <NativeSelect
              size="sm"
              aria-label="Documento aberto"
              value={fonte.documento}
              onChange={(e) => painel.trocarDocumento(e.target.value as DocKey)}
              className="min-w-0 flex-1 [&_select]:truncate [&_select]:font-semibold"
            >
              {LISTA_DE_DOCUMENTOS.map((d) => (
                <NativeSelectOption key={d.value} value={d.value}>
                  {d.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <div className="flex flex-none items-center gap-2 max-[520px]:gap-1.5">
              <Button variant="ghost" size="icon-sm" aria-label="Baixar arquivo" title="Baixar arquivo" onClick={baixar}>
                <DownloadIcon aria-hidden />
              </Button>
              {/* na aba dos arquivos, o fechar volta ao Resumo */}
              <Button variant="ghost" size="icon-sm" aria-label="Fechar arquivos" title="Fechar arquivos" onClick={painel.fecharFonte}>
                <XIcon aria-hidden />
              </Button>
            </div>
          </>
        ) : (
          <Popover open={historicoAberto} onOpenChange={setHistoricoAberto}>
            <PopoverAnchor asChild>
              <div className={cn("relative flex flex-none items-center gap-2 max-[520px]:gap-1.5", modoAbas && "ml-auto")}>
                <Button
                  variant="secondary"
                  size="sm"
                  className="text-[13px] group-data-[recolhido=true]/cabecalho:hidden max-[520px]:px-2.25"
                  onClick={copiarConteudo}
                >
                  Copiar conteúdo
                </Button>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Ver histórico de divergências"
                    title="Ver histórico de divergências"
                    className="group-data-[recolhido=true]/cabecalho:hidden"
                  >
                    <TriangleAlertIcon aria-hidden />
                  </Button>
                </PopoverTrigger>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Mais ações"
                      title="Mais ações"
                      className="hidden group-data-[recolhido=true]/cabecalho:inline-flex"
                    >
                      <EllipsisVerticalIcon aria-hidden />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="min-w-57.5"
                    onCloseAutoFocus={(e) => {
                      // histórico: abre só depois que o menu fechou (o foco vai para o popover, não volta ao botão)
                      if (abrindoHistorico.current) {
                        e.preventDefault()
                        abrindoHistorico.current = false
                        setHistoricoAberto(true)
                      }
                    }}
                  >
                    <DropdownMenuGroup>
                      <DropdownMenuItem onSelect={copiarConteudo}>Copiar conteúdo</DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => {
                          abrindoHistorico.current = true
                        }}
                      >
                        Histórico de divergências
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="ghost" size="icon-sm" aria-label="Fechar" title="Fechar" onClick={onFechar}>
                  <XIcon aria-hidden />
                </Button>
              </div>
            </PopoverAnchor>
            <ConteudoDoHistorico painel={painel} />
          </Popover>
        )}
      </header>

      <div
        className={cn(
          "col-start-1 row-start-2 flex min-h-0 flex-col gap-2 overflow-y-auto px-3 pt-3 pb-5",
          naAbaArquivos && "hidden"
        )}
      >
        <Card className="flex-none gap-1.25 rounded-xl py-3.5 shadow-none">
          <CardHeader className="px-4">
            <CardTitle className="text-[13px] leading-tight font-semibold">Objeto</CardTitle>
          </CardHeader>
          <CardContent className="px-4 text-[13px] leading-[1.55] text-muted-foreground">{OBJETO}</CardContent>
        </Card>
        <Secoes painel={painel} />
      </div>

      {fonte.aberta && (
        <div
          className={cn(
            "relative grid min-h-0 min-w-0",
            modoAbas ? "col-start-1 row-start-2" : "col-start-2 row-span-2 row-start-1 border-l",
            modoAbas && !naAbaArquivos && "hidden"
          )}
        >
          <DocumentViewer
            aria-label="Arquivos da licitação"
            documents={LISTA_DE_DOCUMENTOS}
            value={fonte.documento}
            onValueChange={(doc) => painel.trocarDocumento(doc as DocKey)}
            pages={PAGINAS[fonte.documento]}
            highlight={fonte.destaque}
            highlightKey={fonte.token}
            documentLabel="Documento aberto"
            onDownload={baixar}
            downloadLabel="Baixar arquivo"
            onClose={painel.fecharFonte}
            closeLabel="Fechar trecho"
            selectionActionLabel={ctx ? "Usar este trecho" : "Adicionar como fonte"}
            onSelectionAction={painel.usarSelecao}
            pointerHint={dica}
            onClickWithoutSelection={() => {
              if (ctx) painel.limparContexto()
            }}
            // modo abas: o seletor e o download ficam no cabeçalho do workspace
            className={cn("min-h-0", modoAbas && "grid-rows-[minmax(0,1fr)] [&>[data-slot=document-viewer-header]]:hidden")}
          />
          {ladoALado && (
            <Divisoria
              largura={arquivos ?? Math.round(largura / 2)}
              onLargura={onLarguraArquivos}
              minimo={MIN_ARQUIVOS}
              maximo={maxArquivos}
            />
          )}
        </div>
      )}
    </div>
  )
}
