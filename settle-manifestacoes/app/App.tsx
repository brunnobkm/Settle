// Aba Manifestações da licitação: avisos, questionamentos e impugnações como cards.
// Clicar no card abre a mensagem completa; o olho de um anexo abre a sidebar auxiliar
// "Arquivos da licitação" (ou um modal empilhado, quando já há um modal aberto).
// A pasta do cabeçalho abre "Arquivos da Licitação", que também reúne os arquivos
// de manifestação sem vínculo com uma manifestação específica.

import { useEffect, useState } from "react"
import {
  ExternalLinkIcon,
  FileTextIcon,
  FolderIcon,
  GlobeIcon,
  InboxIcon,
  InfoIcon,
  LinkIcon,
  MessageSquareIcon,
  Share2Icon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AppShell } from "@/components/ui/app-shell"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import {
  LicitacaoCardAvatars,
  LicitacaoCardIconAction,
  LicitacaoCardIconActions,
  LicitacaoCardStatusButton,
} from "@/components/ui/licitacao-card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useNaoPrototipado } from "@/settle/nao-prototipado"
import { menuLicitacoes, USUARIO, WORKSPACE } from "@/settle/navegacao"

import { CardDeManifestacao } from "./CardDeManifestacao"
import {
  ABAS,
  ABAS_DO_WORKSPACE,
  ARQUIVOS_SEM_VINCULO,
  LICITACAO_ATUAL,
  OPCOES_DE_ORDEM,
  RESPONSAVEIS,
  abaDaCategoria,
  carregarManifestacoes,
  type Anexo,
  type Manifestacao,
  type Ordem,
} from "./dados"
import { DialogoDaManifestacao, DialogoDeArquivos, ModalDeArquivo, SidebarDeArquivos, type Visualizacao } from "./Dialogos"

// abas no estilo "segmented control" (workspace e categorias)
const LISTA_DE_ABAS =
  "h-auto max-w-full gap-0.5 overflow-x-auto rounded-[10px] bg-foreground/8 p-0.75 [scrollbar-width:none]"
const ABA = "h-auto flex-none rounded-lg px-3 py-1 text-[15px] leading-6 data-active:shadow-xs"

export default function App() {
  useNaoPrototipado()

  const [itens, setItens] = useState<Manifestacao[] | null>(null) // null: carregando
  const [secao, setSecao] = useState("manifestacoes")
  const [aba, setAba] = useState("todas")
  const [ordem, setOrdem] = useState<Ordem>("nenhum")

  const [abertoId, setAbertoId] = useState<string | null>(null)
  const [arquivosAberto, setArquivosAberto] = useState(false)
  const [lateral, setLateral] = useState<Visualizacao | null>(null)
  const [previa, setPrevia] = useState<Visualizacao | null>(null)

  useEffect(() => {
    let ativo = true
    carregarManifestacoes(LICITACAO_ATUAL.id).then((lista) => ativo && setItens(lista))
    return () => {
      ativo = false
    }
  }, [])

  const lista = itens ?? []
  const aberto = lista.find((i) => i.id === abertoId) ?? null

  /* ---------------- janelas ---------------- */

  function abrirManifestacao(id: string) {
    setLateral(null) // abrir o modal fecha a sidebar de arquivos
    setAbertoId(id)
  }

  function abrirArquivos() {
    setLateral(null)
    setArquivosAberto(true)
  }

  // Pelo card: sidebar auxiliar. De dentro de um modal a sidebar ficaria atrás dele,
  // então a pré-visualização abre como modal empilhado.
  function visualizarDoCard(item: Manifestacao, indice: number) {
    if (item.anexos?.length) setLateral({ arquivos: item.anexos, indice })
  }
  function visualizarEmModal(arquivos: Anexo[], indice: number) {
    setPrevia({ arquivos, indice })
  }

  /* ---------------- lista ---------------- */

  const contagem = (id: string) => (id === "todas" ? lista.length : lista.filter((i) => abaDaCategoria(i.categoria) === id).length)

  function itensDaAba(id: string) {
    const filtrados = id === "todas" ? lista : lista.filter((i) => abaDaCategoria(i.categoria) === id)
    if (ordem === "nenhum") return filtrados
    // traz o grupo escolhido ao topo; o sort é estável e mantém a ordem por data dentro de cada grupo
    const doGrupo = (i: Manifestacao) =>
      ordem === "com-resposta"
        ? !!i.resposta
        : (i.categoria === "esclarecimento" || i.categoria === "impugnacao") && !i.resposta
    return [...filtrados].sort((a, b) => Number(doGrupo(b)) - Number(doGrupo(a)))
  }

  const abaDemo = aba === "demo-vazio" || aba === "demo-portal"

  return (
    <AppShell
      workspace={WORKSPACE}
      groups={menuLicitacoes({ ativa: "em-andamento" })}
      user={USUARIO}
      header={<CabecalhoDaLicitacao onArquivos={abrirArquivos} />}
    >
      <div className="min-h-[calc(100svh-4rem)] bg-muted">
        <div
          className={cn(
            "max-w-320 px-5 pt-9 pb-18 transition-[margin] duration-250 ease-out",
            // com a sidebar auxiliar aberta, o conteúdo divide espaço com ela
            lateral ? "mr-116 ml-6" : "mx-auto"
          )}
        >
          <h1 className="sr-only">Manifestações da licitação Pregão Eletrônico nº 12/2026</h1>

          <Tabs value={secao} onValueChange={setSecao} className="gap-0">
            <TabsList aria-label="Seções da licitação" className={cn(LISTA_DE_ABAS, "mb-4.5")}>
              {ABAS_DO_WORKSPACE.map((s) => (
                <TabsTrigger key={s.id} value={s.id} className={ABA}>
                  {s.label}
                  {s.beta && (
                    <Badge variant="warning" className="h-5 rounded-full px-1.5 text-xs font-medium">
                      Versão beta
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {ABAS_DO_WORKSPACE.filter((s) => s.id !== "manifestacoes").map((s) => (
              <TabsContent key={s.id} value={s.id}>
                <section className="flex min-h-55 items-center justify-center rounded-2xl border bg-card p-6 text-center text-sm text-muted-foreground">
                  Conteúdo de “{s.label}”: fora do escopo deste protótipo.
                </section>
              </TabsContent>
            ))}

            <TabsContent value="manifestacoes">
              <section aria-label="Manifestações" className="rounded-2xl border bg-card p-2">
                <Tabs value={aba} onValueChange={setAba} className="gap-0">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <TabsList aria-label="Tipos de manifestação" className={LISTA_DE_ABAS}>
                      {ABAS.map((a) => (
                        <TabsTrigger key={a.id} value={a.id} className={ABA}>
                          {a.label}
                          {!a.demo && (
                            <span className="inline-flex min-w-4.5 items-center justify-center rounded-md bg-foreground/10 px-1.5 text-xs leading-4 font-medium tabular-nums">
                              {itens ? contagem(a.id) : "–"}
                            </span>
                          )}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {!abaDemo && <MenuDeOrdem ordem={ordem} onOrdem={setOrdem} />}
                  </div>

                  {ABAS.map((a) => (
                    <TabsContent key={a.id} value={a.id}>
                      {a.id === "demo-vazio" ? (
                        <EstadoVazio tipo="vazio" />
                      ) : a.id === "demo-portal" ? (
                        <EstadoVazio tipo="portal" />
                      ) : (
                        <>
                          {ARQUIVOS_SEM_VINCULO.length > 0 && <AvisoSemVinculo onVer={abrirArquivos} />}
                          {itens ? (
                            <div className="flex flex-col gap-4">
                              {itensDaAba(a.id).map((item) => (
                                <CardDeManifestacao
                                  key={item.id}
                                  item={item}
                                  onAbrir={() => abrirManifestacao(item.id)}
                                  onVisualizarAnexo={(i) => visualizarDoCard(item, i)}
                                />
                              ))}
                            </div>
                          ) : (
                            <CardsCarregando />
                          )}
                        </>
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
              </section>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <SidebarDeArquivos
        visualizacao={lateral}
        onIndice={(indice) => setLateral((v) => v && { ...v, indice })}
        onFechar={() => setLateral(null)}
      />
      <DialogoDaManifestacao
        item={aberto}
        onOpenChange={(abrir) => {
          if (abrir) return
          setAbertoId(null)
          setPrevia(null)
        }}
        onVisualizarAnexo={visualizarEmModal}
      />
      <DialogoDeArquivos
        aberto={arquivosAberto}
        onOpenChange={(abrir) => {
          setArquivosAberto(abrir)
          if (!abrir) setPrevia(null)
        }}
        itens={lista}
        onVisualizar={visualizarEmModal}
      />
      <ModalDeArquivo
        visualizacao={previa}
        onIndice={(indice) => setPrevia((v) => v && { ...v, indice })}
        onFechar={() => setPrevia(null)}
      />
    </AppShell>
  )
}

/* ------------------------------------------------------------------ */
/* Cabeçalho da licitação (barra superior)                             */
/* ------------------------------------------------------------------ */

function Divisor({ className }: { className?: string }) {
  return <Separator orientation="vertical" className={cn("data-vertical:h-6 data-vertical:self-center", className)} />
}

function CabecalhoDaLicitacao({ onArquivos }: { onArquivos: () => void }) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-4">
      <Breadcrumb aria-label="Trilha" className="min-w-0">
        <BreadcrumbList className="flex-nowrap gap-2 sm:gap-2">
          <BreadcrumbItem className="shrink-0 max-md:hidden">
            <BreadcrumbLink href="#" data-nao-prototipado>
              Licitações
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="max-md:hidden" />
          <BreadcrumbItem className="shrink-0 max-md:hidden">
            <BreadcrumbLink href="#" data-nao-prototipado>
              Em andamento
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="max-md:hidden" />
          <BreadcrumbItem className="min-w-0">
            <BreadcrumbPage className="truncate">Pregão Eletrônico nº 12/2026</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* telas estreitas: some primeiro o que é secundário para a trilha continuar legível */}
      <div className="ml-auto flex shrink-0 items-center gap-2">
        <Button variant="ghost" className="bg-foreground/8 px-3 hover:bg-foreground/14 max-md:hidden" data-nao-prototipado>
          Ignorar
        </Button>
        <Button className="px-3 max-md:hidden" data-nao-prototipado>
          Enviar para Workflow
        </Button>
        <Divisor className="max-xl:hidden" />
        <LicitacaoCardStatusButton className="max-xl:hidden" data-nao-prototipado>
          Em disputa ou Homologação
        </LicitacaoCardStatusButton>
        <Divisor className="max-xl:hidden" />
        <LicitacaoCardAvatars className="max-xl:hidden" avatars={RESPONSAVEIS} addProps={{ "data-nao-prototipado": true }} />
        <Divisor className="max-md:hidden" />
        <LicitacaoCardIconActions className="ml-0 gap-2">
          <LicitacaoCardIconAction variant="soft" label="Link da licitação" className="max-sm:hidden" icon={<LinkIcon />} data-nao-prototipado />
          <LicitacaoCardIconAction variant="soft" label="Compartilhar" className="max-sm:hidden" icon={<Share2Icon />} data-nao-prototipado />
          <LicitacaoCardIconAction variant="soft" label="Atalho do edital" className="max-sm:hidden" icon={<FileTextIcon />} data-nao-prototipado />
          <LicitacaoCardIconAction
            variant="soft"
            label="Visualizar arquivos"
            icon={<FolderIcon />}
            className="bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary dark:hover:bg-primary/15"
            onClick={onArquivos}
          />
          <LicitacaoCardIconAction variant="soft" label="Comentários" className="max-sm:hidden" icon={<MessageSquareIcon />} data-nao-prototipado />
        </LicitacaoCardIconActions>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Peças da lista                                                      */
/* ------------------------------------------------------------------ */

function MenuDeOrdem({ ordem, onOrdem }: { ordem: Ordem; onOrdem: (ordem: Ordem) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0 bg-foreground/8 px-3 hover:bg-foreground/14 aria-expanded:bg-foreground/14"
        >
          Ordenar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-70">
        <DropdownMenuGroup>
          <DropdownMenuRadioGroup value={ordem} onValueChange={(v) => onOrdem(v as Ordem)}>
            {OPCOES_DE_ORDEM.map((o) => (
              <DropdownMenuRadioItem key={o.id} value={o.id}>
                {o.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * Aviso da seção: a licitação tem arquivos de manifestação sem associação a uma
 * manifestação específica. Não lista os arquivos (ficam em "Visualizar arquivos");
 * como não dá para saber a qual card pertencem, o aviso é da seção, não de um card.
 */
function AvisoSemVinculo({ onVer }: { onVer: () => void }) {
  const n = ARQUIVOS_SEM_VINCULO.length
  return (
    <Alert
      variant="warning"
      role="note"
      className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-[10px] px-3 py-2.5 *:[svg]:translate-y-0"
    >
      <InfoIcon aria-hidden />
      <AlertDescription className="min-w-0 flex-1 basis-60 text-[13px] leading-snug text-foreground">
        Esta licitação tem <strong className="font-semibold">{n}</strong>{" "}
        {n === 1 ? "arquivo de manifestação" : "arquivos de manifestação"} sem associação a uma manifestação específica.
      </AlertDescription>
      <Button variant="link" className="h-auto shrink-0 p-0 text-[13px] font-semibold" onClick={onVer}>
        Ver em Visualizar arquivos
      </Button>
    </Alert>
  )
}

/** Estados vazios (abas de demonstração). */
function EstadoVazio({ tipo }: { tipo: "vazio" | "portal" }) {
  const portal = tipo === "portal"
  return (
    <Empty className="gap-4.5 px-6 py-12">
      <EmptyHeader className="max-w-110 gap-2">
        <EmptyMedia variant="icon" className="mb-2 size-12 rounded-xl text-muted-foreground">
          {portal ? <GlobeIcon /> : <InboxIcon />}
        </EmptyMedia>
        <EmptyTitle className="text-base font-semibold">
          {portal ? "Captura automática indisponível" : "Nenhuma manifestação ainda"}
        </EmptyTitle>
        <EmptyDescription className="text-[13.5px] leading-[1.55]">
          {portal
            ? "Este portal ainda não é capturado automaticamente pela Settle. Acompanhe as manifestações diretamente no portal oficial da licitação."
            : "Não há avisos, questionamentos ou impugnações registrados para esta licitação até o momento. Assim que algo for publicado, iremos exibir nessa seção."}
        </EmptyDescription>
      </EmptyHeader>
      {portal && (
        <EmptyContent>
          <Button asChild className="px-4">
            <a href="https://www.gov.br/pncp" target="_blank" rel="noopener">
              Abrir no portal
              <ExternalLinkIcon data-icon="inline-end" />
            </a>
          </Button>
        </EmptyContent>
      )}
    </Empty>
  )
}

/** Esqueleto dos cards enquanto as manifestações carregam. */
function CardsCarregando() {
  return (
    <div className="flex flex-col gap-4" aria-busy aria-label="Carregando manifestações">
      {[0, 1, 2].map((i) => (
        <Card key={i} aria-hidden className="gap-3 rounded-[14px] px-3 [--card-spacing:--spacing(3)]">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-24 rounded-md" />
            <Skeleton className="h-6 w-20 rounded-md" />
          </div>
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[82%]" />
        </Card>
      ))}
    </div>
  )
}
