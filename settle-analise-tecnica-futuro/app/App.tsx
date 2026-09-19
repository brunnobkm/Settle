// Análise técnica (trilho FUTURO): shell único + mecânicas componíveis por tipo de item.
// Produto = comparar e escolher SKU (matriz); serviço e software = atende / não atende
// (checklist); solução = seções com as duas mecânicas. A lista de itens abre a análise
// de cada um em tela cheia.

import { useEffect, useState } from "react"
import { CheckIcon, DownloadIcon, LinkIcon, Share2Icon, SparklesIcon, StarIcon, XIcon } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { AppShell } from "@/components/ui/app-shell"
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar"
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
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useNaoPrototipado } from "@/settle/nao-prototipado"
import { menuLicitacoes, USUARIO, WORKSPACE } from "@/settle/navegacao"

import { Analise, Frentes, MSG_EXPORTAR, type AcoesDaAnalise } from "./Analise"
import { Dica } from "./comum"
import {
  EDITAL,
  ITENS,
  VAZIO,
  lerPreferencias,
  montarChecklists,
  montarMatrizes,
  novoId,
  resumirItem,
  salvarPreferencias,
  SKUS,
  type Preferencias,
} from "./dados"

const ABAS_DO_WORKSPACE = [
  "Visão geral",
  "Itens",
  "Análise técnica",
  "Documentos",
  "Habilitação",
  "Jurídico",
  "Comunicação",
  "Time",
  "Risco de pagamento do órgão",
]
const FILTROS = [
  { valor: "all", rotulo: "Todos" },
  { valor: "ok", rotulo: "Atende" },
  { valor: "no", rotulo: "Não atende" },
] as const
const PARTICIPANTES = ["LA", "AI", "BK"]

export default function App() {
  useNaoPrototipado()

  const [matrizes, setMatrizes] = useState(montarMatrizes)
  const [checklists, setChecklists] = useState(montarChecklists)
  const [prefs, setPrefs] = useState(lerPreferencias)
  const [aberto, setAberto] = useState<number | null>(null)

  useEffect(() => salvarPreferencias(prefs), [prefs])
  const mudarPrefs = (patch: Partial<Preferencias>) => setPrefs((p) => ({ ...p, ...patch }))

  const acoes: AcoesDaAnalise = {
    alterarSpec: (chave, ri, patch) =>
      setMatrizes((m) => ({ ...m, [chave]: m[chave].map((s, i) => (i === ri ? { ...s, ...patch } : s)) })),
    alterarCelula: (chave, ri, ci, patch) =>
      setMatrizes((m) => ({
        ...m,
        [chave]: m[chave].map((s, i) =>
          i === ri ? { ...s, cells: s.cells.map((c, j) => (j === ci ? { ...c, ...patch } : c)) } : s
        ),
      })),
    adicionarRequisito: (chave) =>
      setMatrizes((m) => ({
        ...m,
        [chave]: [
          ...m[chave],
          {
            id: novoId("req"),
            req: "Novo requisito",
            exig: "",
            origem: { doc: "Inserido manualmente", pag: null },
            cells: SKUS.map(() => ({ st: "ne" as const, v: VAZIO })),
          },
        ],
      })),
    escolher: (item, sku) => {
      const desmarcar = prefs.chosen[item] === sku
      const chosen = { ...prefs.chosen }
      if (desmarcar) delete chosen[item]
      else chosen[item] = sku
      mudarPrefs({ chosen })
      toast(desmarcar ? "Seleção removida" : `Produto escolhido: ${SKUS[sku].model}`)
    },
    alternarStatus: (chave, id, st) =>
      setChecklists((c) => ({ ...c, [chave]: c[chave].map((r) => (r.id === id ? { ...r, st } : r)) })),
    adicionarLinha: (chave) =>
      setChecklists((c) => ({
        ...c,
        [chave]: [
          ...c[chave],
          {
            id: novoId("cl"),
            req: "Novo requisito",
            exig: "",
            modulo: VAZIO,
            st: "ne",
            c: null,
            just: VAZIO,
            origem: { doc: "Inserido manualmente", pag: null },
          },
        ],
      })),
    preferencias: mudarPrefs,
  }

  const itens = ITENS.map((it, i) => ({ it, i, resumo: resumirItem(it, matrizes, checklists) })).filter(
    ({ resumo }) => prefs.filter === "all" || resumo.status === prefs.filter
  )

  return (
    <AppShell
      workspace={WORKSPACE}
      groups={menuLicitacoes({ ativa: "em-andamento" })}
      user={USUARIO}
      header={
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <Breadcrumb className="min-w-0">
            <BreadcrumbList className="flex-nowrap">
              <BreadcrumbItem>
                <BreadcrumbLink href="#" data-nao-prototipado>
                  Licitações
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="#" data-nao-prototipado className="whitespace-nowrap">
                  Em andamento
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-medium whitespace-nowrap">Edital {EDITAL.numero}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="ml-auto flex shrink-0 items-center gap-2.5">
            <Button variant="outline" size="sm" className="max-lg:hidden" data-nao-prototipado>
              Análise de Oportunidades
            </Button>
            <Button
              size="sm"
              className="bg-warning/10 font-semibold text-warning-strong hover:bg-warning/20 max-lg:hidden"
              data-nao-prototipado
            >
              Em disputa ou Homologação
            </Button>
            <AvatarGroup aria-label="Pessoas nesta licitação" className="max-md:hidden">
              {PARTICIPANTES.map((p) => (
                <Avatar key={p} className="size-7">
                  <AvatarFallback className="text-[10px] font-semibold">{p}</AvatarFallback>
                </Avatar>
              ))}
              <AvatarGroupCount className="size-7 text-[10px]">+2</AvatarGroupCount>
            </AvatarGroup>
            <Dica texto="Copiar link" lado="bottom">
              <Button variant="outline" size="icon-sm" aria-label="Copiar link" className="text-muted-foreground" data-nao-prototipado>
                <LinkIcon />
              </Button>
            </Dica>
            <Dica texto="Compartilhar" lado="bottom">
              <Button variant="outline" size="icon-sm" aria-label="Compartilhar" className="text-muted-foreground" data-nao-prototipado>
                <Share2Icon />
              </Button>
            </Dica>
          </div>
        </div>
      }
    >
      <div className="mx-auto max-w-360 p-4">
        <h1 className="sr-only">Análise técnica do edital {EDITAL.numero}</h1>

        {/* abas do workspace da licitação: só a Análise técnica foi prototipada */}
        <Tabs value="Análise técnica" onValueChange={() => {}} className="gap-4">
          <div className="overflow-x-auto">
            <TabsList>
              {ABAS_DO_WORKSPACE.map((aba) => (
                <TabsTrigger
                  key={aba}
                  value={aba}
                  className="flex-none px-3"
                  {...(aba !== "Análise técnica" && { "data-nao-prototipado": true })}
                >
                  {aba}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="Análise técnica">
            <section aria-label="Itens do edital" className="rounded-lg border bg-card p-4">
              <Tabs
                value={prefs.filter}
                onValueChange={(v) => mudarPrefs({ filter: v as Preferencias["filter"] })}
                className="gap-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <TabsList aria-label="Filtrar itens pelo resultado" className="h-8">
                    {FILTROS.map((f) => (
                      <TabsTrigger key={f.valor} value={f.valor} className="flex-none px-2.5 text-[13px]">
                        {f.rotulo}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  <div className="inline-flex items-center gap-0.5 rounded-lg bg-muted p-0.75">
                    <Button variant="ghost" size="sm" className="hover:bg-background" onClick={() => toast("Análise concluída")}>
                      <CheckIcon data-icon="inline-start" />
                      Concluir análise
                    </Button>
                    <Button variant="ghost" size="sm" className="hover:bg-background" onClick={() => toast(MSG_EXPORTAR)}>
                      <DownloadIcon data-icon="inline-start" />
                      Exportar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:bg-background hover:text-primary"
                      onClick={() => toast("Revisão da IA solicitada")}
                    >
                      <SparklesIcon data-icon="inline-start" />
                      Revisar
                    </Button>
                  </div>
                </div>

                <TabsContent value={prefs.filter}>
                  {itens.length === 0 ? (
                    <Empty className="py-6">
                      <EmptyHeader>
                        <EmptyTitle className="text-sm font-normal text-muted-foreground">Nenhum item neste filtro.</EmptyTitle>
                      </EmptyHeader>
                    </Empty>
                  ) : (
                    <ul className="grid grid-cols-3 gap-3 max-lg:grid-cols-2 max-sm:grid-cols-1">
                      {itens.map(({ it, i, resumo }) => {
                        const escolhido = prefs.chosen[i]
                        return (
                          <li key={it.nome} className="flex">
                            <Card
                              size="sm"
                              className={cn(
                                "relative min-h-37.5 flex-1 gap-2 rounded-lg py-3.5 shadow-none transition-shadow hover:shadow-md hover:ring-foreground/20 has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
                                escolhido != null && "ring-2 ring-primary hover:ring-primary"
                              )}
                            >
                              <CardHeader className="flex flex-wrap items-center gap-1.5">
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
                                {resumo.kind === "produto" && escolhido != null && (
                                  <Badge className="bg-primary/10 text-primary">
                                    <CheckIcon data-icon="inline-start" />
                                    Produto selecionado
                                  </Badge>
                                )}
                              </CardHeader>
                              <CardContent className="gap-2">
                                <CardTitle className="line-clamp-3 text-sm leading-snug font-semibold">
                                  <Dica texto="Abrir a análise completa deste item">
                                    <button
                                      type="button"
                                      onClick={() => setAberto(i)}
                                      className="text-left outline-none after:absolute after:inset-0 after:rounded-lg"
                                    >
                                      {it.nome}
                                    </button>
                                  </Dica>
                                </CardTitle>
                                <p className="text-[13px]">
                                  <b className="font-semibold">Quantidade:</b> {it.quantidade}
                                </p>
                              </CardContent>
                              <CardFooter className="mt-auto">
                                <div className="flex w-full flex-wrap items-center gap-1.5 border-t border-dashed pt-2 text-[13px] font-semibold text-primary">
                                  {resumo.kind === "produto" && (
                                    <>
                                      <StarIcon aria-hidden className="size-3.5 fill-current text-success" />
                                      <span>
                                        Recomendação: <span className="font-mono">{resumo.best.sku.model}</span>, atende{" "}
                                        {resumo.best.pct}%
                                      </span>
                                    </>
                                  )}
                                  {resumo.kind === "check" && (
                                    <>
                                      <CheckIcon aria-hidden className="size-3.5 text-success" />
                                      <span>
                                        Você atende {resumo.ok} de {resumo.total} exigências
                                      </span>
                                    </>
                                  )}
                                  {resumo.kind === "solucao" && <Frentes secs={resumo.secs} />}
                                </div>
                              </CardFooter>
                            </Card>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </TabsContent>
              </Tabs>
            </section>
          </TabsContent>
        </Tabs>
      </div>

      <Analise
        indice={aberto}
        item={aberto != null ? ITENS[aberto] : null}
        matrizes={matrizes}
        checklists={checklists}
        prefs={prefs}
        acoes={acoes}
        onFechar={() => setAberto(null)}
      />
    </AppShell>
  )
}
