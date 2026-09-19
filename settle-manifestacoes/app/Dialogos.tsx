// Janelas da tela: mensagem completa da manifestação, "Arquivos da Licitação"
// (accordions) e o visualizador de arquivo (sidebar auxiliar ou modal empilhado).

import type { ReactNode } from "react"
import { DownloadIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"

import { BotaoDeIcone, LinhaDeAnexo, ListaDeAnexos } from "./Anexos"
import { SeloDeCategoria } from "./CardDeManifestacao"
import {
  ARQUIVOS_EDITAL,
  ARQUIVOS_SEM_VINCULO,
  CATEGORIAS,
  formatarDataHora,
  type Anexo,
  type Categoria,
  type Manifestacao,
} from "./dados"

/* ------------------------------------------------------------------ */
/* Peças comuns                                                        */
/* ------------------------------------------------------------------ */

function BotaoFechar({ label = "Fechar" }: { label?: string }) {
  return (
    <DialogClose asChild>
      <Button variant="ghost" size="icon-sm" aria-label={label} className="shrink-0 text-muted-foreground">
        <XIcon />
      </Button>
    </DialogClose>
  )
}

function Campo({ rotulo, data, sub, children }: { rotulo: string; data?: Date; sub?: string; children: ReactNode }) {
  return (
    <div className="mt-3.5 first:mt-0">
      <p className="mb-1.5 text-[11px] font-semibold tracking-[.04em] text-muted-foreground">
        {rotulo}
        {data && <span className="font-normal tracking-normal"> · {formatarDataHora(data)}</span>}
      </p>
      {sub && <p className="mb-2 text-xs text-muted-foreground">{sub}</p>}
      {children}
    </div>
  )
}

function TextoDoCampo({ children }: { children: ReactNode }) {
  return <p className="text-[13.5px] leading-[1.6] whitespace-pre-wrap text-foreground">{children}</p>
}

/* ------------------------------------------------------------------ */
/* Mensagem completa                                                   */
/* ------------------------------------------------------------------ */

export function DialogoDaManifestacao({
  item,
  onOpenChange,
  onVisualizarAnexo,
}: {
  item: Manifestacao | null
  onOpenChange: (aberto: boolean) => void
  onVisualizarAnexo: (anexos: Anexo[], indice: number) => void
}) {
  const anexos = item?.anexos ?? []

  return (
    <Dialog open={!!item} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        aria-describedby={undefined}
        className="flex max-h-[min(600px,80vh)] flex-col gap-0 overflow-hidden rounded-[14px] p-0 sm:max-w-145"
      >
        {item && (
          <>
            {/* um título só: a categoria (ou o título do recurso) */}
            <DialogHeader className="flex-row items-center gap-2.5 border-b px-6 py-4">
              <DialogTitle className="min-w-0 flex-1 text-base leading-[1.4] font-semibold">
                {item.etapas ? item.titulo : CATEGORIAS[item.categoria].label}
              </DialogTitle>
              <BotaoFechar />
            </DialogHeader>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              {item.etapas ? (
                // Recurso: cada etapa em ordem cronológica (origem em cima)
                item.etapas.map((etapa) => (
                  <Campo
                    key={etapa.etapa}
                    rotulo={etapa.etapa}
                    data={etapa.date}
                    sub={etapa.documento ? `${etapa.autor} · ${etapa.documento}` : etapa.autor}
                  >
                    <TextoDoCampo>{etapa.texto}</TextoDoCampo>
                    {!!etapa.anexos?.length && (
                      <ListaDeAnexos className="mt-2.5">
                        {etapa.anexos.map((anexo) => (
                          <LinhaDeAnexo
                            key={anexo.nome}
                            anexo={anexo}
                            onVisualizar={() => onVisualizarAnexo(anexos, Math.max(0, anexos.indexOf(anexo)))}
                          />
                        ))}
                      </ListaDeAnexos>
                    )}
                  </Campo>
                ))
              ) : (
                <>
                  <Campo rotulo="Mensagem" data={item.dateMensagem}>
                    <TextoDoCampo>{item.mensagemCompleta ?? item.mensagem}</TextoDoCampo>
                  </Campo>
                  {item.resposta && (
                    <Campo rotulo="Resposta" data={item.date}>
                      <TextoDoCampo>{item.resposta.texto}</TextoDoCampo>
                    </Campo>
                  )}
                  {anexos.length > 0 && (
                    <Campo rotulo="Anexos">
                      <ListaDeAnexos>
                        {anexos.map((anexo, i) => (
                          <LinhaDeAnexo key={anexo.nome} anexo={anexo} onVisualizar={() => onVisualizarAnexo(anexos, i)} />
                        ))}
                      </ListaDeAnexos>
                    </Campo>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

/* ------------------------------------------------------------------ */
/* Arquivos da Licitação                                               */
/* ------------------------------------------------------------------ */

function Contador({ n }: { n: number }) {
  return (
    <span className="inline-flex min-w-4.5 items-center justify-center rounded-md bg-foreground/8 px-1.5 text-xs leading-4 font-medium text-muted-foreground tabular-nums">
      {n}
    </span>
  )
}

function Secao({
  valor,
  cabecalho,
  total,
  sub,
  children,
}: {
  valor: string
  cabecalho: ReactNode
  total: number
  sub?: boolean
  children: ReactNode
}) {
  return (
    <AccordionItem value={valor} className={cn(sub && "border-b-0 not-first:border-t")}>
      <AccordionTrigger
        className={cn("items-center gap-2 px-1 hover:no-underline", sub ? "px-0.5 py-2" : "py-3")}
      >
        <span className="flex min-w-0 flex-1 items-center">{cabecalho}</span>
        <Contador n={total} />
      </AccordionTrigger>
      <AccordionContent className={sub ? "px-0.5 pb-2" : "px-1 pb-3"}>{children}</AccordionContent>
    </AccordionItem>
  )
}

/**
 * Consolida os arquivos da licitação: edital, anexos das manifestações (por tipo)
 * e os arquivos de manifestação sem vínculo com uma manifestação específica.
 */
export function DialogoDeArquivos({
  aberto,
  onOpenChange,
  itens,
  onVisualizar,
}: {
  aberto: boolean
  onOpenChange: (aberto: boolean) => void
  itens: Manifestacao[]
  onVisualizar: (arquivos: Anexo[], indice: number) => void
}) {
  const comAnexos = itens.filter((it) => it.anexos?.length)
  const porCategoria = new Map<Categoria, Anexo[]>()
  for (const it of comAnexos) porCategoria.set(it.categoria, [...(porCategoria.get(it.categoria) ?? []), ...it.anexos!])
  const totalManifestacoes = comAnexos.reduce((n, it) => n + it.anexos!.length, 0)

  // lista única, na ordem da tela, para o seletor do visualizador
  const todos = [...ARQUIVOS_EDITAL, ...[...porCategoria.values()].flat(), ...ARQUIVOS_SEM_VINCULO]
  const linha = (anexo: Anexo) => (
    <LinhaDeAnexo key={anexo.nome} anexo={anexo} onVisualizar={() => onVisualizar(todos, todos.indexOf(anexo))} />
  )
  const titulo = (texto: string) => <span className="text-sm font-semibold text-foreground">{texto}</span>

  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        aria-describedby={undefined}
        className="flex max-h-[min(80vh,720px)] flex-col gap-0 overflow-hidden rounded-[14px] p-0 sm:max-w-170"
      >
        <DialogHeader className="flex-row items-center gap-3 border-b px-6 py-4">
          <DialogTitle className="min-w-0 flex-1 text-base leading-[1.4] font-semibold">Arquivos da Licitação</DialogTitle>
          <Button size="xs" className="px-2.5" data-nao-prototipado>
            Baixar todos
          </Button>
          <BotaoFechar />
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-1 pb-3">
          <Accordion type="multiple" defaultValue={["edital", "manifestacoes", "sem-vinculo"]}>
            <Secao valor="edital" cabecalho={titulo("Edital e anexos")} total={ARQUIVOS_EDITAL.length}>
              <ListaDeAnexos>{ARQUIVOS_EDITAL.map(linha)}</ListaDeAnexos>
            </Secao>

            {comAnexos.length > 0 && (
              <Secao valor="manifestacoes" cabecalho={titulo("Manifestações")} total={totalManifestacoes}>
                {/* um accordion por tipo: um tipo pode ter muitos anexos */}
                <Accordion type="multiple" defaultValue={[...porCategoria.keys()]}>
                  {[...porCategoria.entries()].map(([categoria, arquivos]) => (
                    <Secao
                      key={categoria}
                      valor={categoria}
                      sub
                      cabecalho={<SeloDeCategoria item={{ categoria }} />}
                      total={arquivos.length}
                    >
                      <ListaDeAnexos>{arquivos.map(linha)}</ListaDeAnexos>
                    </Secao>
                  ))}
                </Accordion>
              </Secao>
            )}

            <Secao valor="sem-vinculo" cabecalho={titulo("Manifestações sem vínculo")} total={ARQUIVOS_SEM_VINCULO.length}>
              <div className="mb-2 text-[12.5px] leading-normal text-muted-foreground">
                Arquivos capturados nesta licitação que não puderam ser associados a uma manifestação específica.
              </div>
              <ListaDeAnexos>{ARQUIVOS_SEM_VINCULO.map(linha)}</ListaDeAnexos>
            </Secao>
          </Accordion>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ------------------------------------------------------------------ */
/* Visualizador de arquivo                                             */
/* ------------------------------------------------------------------ */

export type Visualizacao = { arquivos: Anexo[]; indice: number }

/** Cabeçalho: seletor de arquivo (pílula), baixar e fechar. */
function CabecalhoDoVisualizador({
  visualizacao,
  onIndice,
  fechar,
}: {
  visualizacao: Visualizacao
  onIndice: (indice: number) => void
  fechar: ReactNode
}) {
  return (
    <div className="flex h-16 shrink-0 items-center gap-2 border-b px-4 py-1.5">
      <Select value={String(visualizacao.indice)} onValueChange={(v) => onIndice(Number(v))}>
        <SelectTrigger
          aria-label="Selecionar arquivo"
          className="h-9 w-full min-w-0 flex-1 rounded-lg border-0 bg-foreground/10 px-2 text-base font-semibold text-foreground shadow-none dark:bg-foreground/10 [&_svg:not([class*='text-'])]:text-foreground *:data-[slot=select-value]:block *:data-[slot=select-value]:truncate"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper" align="start">
          <SelectGroup>
            {visualizacao.arquivos.map((arquivo, i) => (
              <SelectItem key={arquivo.nome + i} value={String(i)}>
                {arquivo.nome}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <BotaoDeIcone label="Baixar" variant="ghost" className="size-8 text-foreground" data-nao-prototipado>
        <DownloadIcon />
      </BotaoDeIcone>
      {fechar}
    </div>
  )
}

/** Página do arquivo (mock): linhas de esqueleto no lugar do conteúdo. */
function PaginaDoArquivo() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4">
      <div className="flex flex-1 flex-col gap-2.5 rounded-[14px] border bg-card p-4" aria-hidden>
        {Array.from({ length: 16 }, (_, i) => (
          <Skeleton key={i} className={cn("h-2.25 animate-none rounded-sm", i % 4 === 3 && "w-[62%]")} />
        ))}
      </div>
    </div>
  )
}

/**
 * Sidebar auxiliar "Arquivos da licitação" (aberta pelo olho de um anexo do card).
 * Não bloqueia a tela: o conteúdo divide espaço com ela.
 */
export function SidebarDeArquivos({
  visualizacao,
  onIndice,
  onFechar,
}: {
  visualizacao: Visualizacao | null
  onIndice: (indice: number) => void
  onFechar: () => void
}) {
  return (
    <Sheet open={!!visualizacao} onOpenChange={(aberto) => !aberto && onFechar()} modal={false}>
      <SheetContent
        side="right"
        showCloseButton={false}
        aria-describedby={undefined}
        // fica aberta ao clicar na página: fecha só pelo X ou Esc
        onInteractOutside={(e) => e.preventDefault()}
        size="md"
        className="gap-0 p-0 shadow-none"
      >
        <SheetTitle className="sr-only">Arquivos da licitação</SheetTitle>
        {visualizacao && (
          <>
            <CabecalhoDoVisualizador
              visualizacao={visualizacao}
              onIndice={onIndice}
              fechar={
                <BotaoDeIcone label="Fechar" variant="ghost" className="size-8 text-foreground" onClick={onFechar}>
                  <XIcon />
                </BotaoDeIcone>
              }
            />
            <PaginaDoArquivo />
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

/** Pré-visualização em modal, empilhada sobre outro modal (a sidebar ficaria atrás dele). */
export function ModalDeArquivo({
  visualizacao,
  onIndice,
  onFechar,
}: {
  visualizacao: Visualizacao | null
  onIndice: (indice: number) => void
  onFechar: () => void
}) {
  return (
    <Dialog open={!!visualizacao} onOpenChange={(aberto) => !aberto && onFechar()}>
      <DialogContent
        showCloseButton={false}
        aria-describedby={undefined}
        className="flex h-[calc(100vh-32px)] w-[80vw] max-w-none flex-col gap-0 overflow-hidden rounded-[14px] p-0 sm:max-w-none"
      >
        <DialogTitle className="sr-only">Pré-visualização do arquivo</DialogTitle>
        {visualizacao && (
          <>
            <CabecalhoDoVisualizador
              visualizacao={visualizacao}
              onIndice={onIndice}
              fechar={
                <BotaoDeIcone label="Fechar" variant="ghost" className="size-8 text-foreground" onClick={onFechar}>
                  <XIcon />
                </BotaoDeIcone>
              }
            />
            <PaginaDoArquivo />
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
