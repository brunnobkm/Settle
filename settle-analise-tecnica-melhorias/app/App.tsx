// Análise técnica (melhorias): de informacional para decisão.
// A lista mostra um card por item do edital; clicar abre a análise do item em tela cheia, com
// uma seção por componente (produto = comparação de SKUs; serviço e software = checklist).
// Status sempre calculado a partir dos requisitos.
//
// Parâmetros de demonstração na URL:
//   ?pendente=1  licitação sem arquivo: os scores ainda não foram gerados
//   ?trava=N     outro usuário reprocessando o item N (padrão 2): abre em leitura, edição bloqueada

import { useEffect, useRef, useState } from "react"
import { AlertCircleIcon, CheckIcon, ClockIcon, LinkIcon, Share2Icon } from "lucide-react"
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
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useNaoPrototipado } from "@/settle/nao-prototipado"
import { menuLicitacoes, USUARIO, WORKSPACE } from "@/settle/navegacao"

import { Analise, type AcoesDaAnalise } from "./Analise"
import { Dica } from "./comum"
import {
  EDITAL,
  ITENS,
  faixa,
  formatarBRL,
  lerPreferencias,
  montarEstado,
  pendente,
  resumirItem,
  salvarPreferencias,
  tiposDoItem,
  valorTotal,
  type ComponenteProduto,
  type Estado,
  type Preferencias,
  type TipoDoCard,
} from "./dados"
import { CartaoDeProcessamento } from "./Paineis"

const SEM_ARQUIVO = /[?&]pendente=1/.test(location.search)
const TRAVA = /[?&]trava(?:=(\d+))?/.exec(location.search)
const QUEM_REPROCESSA = "Brunno Krier Martins"
/** Trocar a categoria reprocessa o item: leva cerca de 30 segundos no protótipo. */
const TEMPO_DE_REPROCESSAMENTO = 30000

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
const PARTICIPANTES = ["LA", "AI", "BK"]
const ROTULO_TIPO: Record<TipoDoCard, string> = { produto: "Produto", software: "Software", servico: "Serviço" }
const COR_TIPO = { produto: "category-8", software: "category-1", servico: "category-4" } as const
/** Limite de caracteres do texto do card (com o prefixo "Tipo - "); acima disso trunca com reticência. */
const LIMITE_DA_DESCRICAO = 300

export type Reprocessamento = { val: string; por?: string }

export default function App() {
  useNaoPrototipado()

  const [estado, setEstado] = useState<Estado>(() => ({ ...montarEstado(), nenhumProduto: {} }))
  const [prefs, setPrefs] = useState(lerPreferencias)
  const [aberto, setAberto] = useState<number | null>(null)
  const [reprocessando, setReprocessando] = useState<Record<number, Reprocessamento>>(() => {
    if (!TRAVA) return {}
    const idx = TRAVA[1] != null ? +TRAVA[1] : 2
    return ITENS[idx] ? { [idx]: { val: "", por: QUEM_REPROCESSA } } : {}
  })
  const [resultados, setResultados] = useState<Record<number, boolean>>({})

  useEffect(() => salvarPreferencias(prefs), [prefs])
  const abertoRef = useRef(aberto)
  useEffect(() => {
    abertoRef.current = aberto
  }, [aberto])
  const timers = useRef<Record<number, number>>({})
  useEffect(() => {
    const t = timers.current
    return () => Object.values(t).forEach((id) => clearTimeout(id))
  }, [])

  const acoes: AcoesDaAnalise = {
    alterarMatriz: (k, specs) => setEstado((e) => ({ ...e, matrizes: { ...e.matrizes, [k]: specs } })),
    alterarChecklist: (k, linhas) => setEstado((e) => ({ ...e, checklists: { ...e.checklists, [k]: linhas } })),
    escolher: (item, sku) => {
      const desmarcar = prefs.chosen[item] === sku
      const chosen = { ...prefs.chosen }
      if (desmarcar) delete chosen[item]
      else chosen[item] = sku
      setPrefs((p) => ({ ...p, chosen }))
      const comp = ITENS[item].componentes.find((c) => c.mecanica === "produto") as ComponenteProduto
      toast(desmarcar ? "Seleção removida" : `Produto escolhido: ${comp.skus[sku].model}`)
    },
    preferencias: (patch: Partial<Preferencias>) => setPrefs((p) => ({ ...p, ...patch })),
    trocarCategoria: (item, k, val) => {
      // trocar a categoria afeta o ITEM inteiro e pode demorar: o estado é por item e persiste,
      // a pessoa pode navegar entre itens e, ao voltar, vê o carregamento de novo
      const ci = +k.split("-")[1]
      const ehProduto = ITENS[item].componentes[ci].mecanica === "produto"
      const nenhum = ehProduto && !/c[âa]mera/i.test(val)
      setEstado((e) => ({
        ...e,
        categorias: { ...e.categorias, [k]: val },
        nenhumProduto: { ...e.nenhumProduto, [k]: nenhum },
      }))
      setReprocessando((r) => ({ ...r, [item]: { val } }))
      setResultados((r) => ({ ...r, [item]: false }))
      clearTimeout(timers.current[item])
      timers.current[item] = window.setTimeout(() => {
        setReprocessando((r) => {
          const novo = { ...r }
          delete novo[item]
          return novo
        })
        setResultados((r) => ({ ...r, [item]: true }))
        if (abertoRef.current === item)
          toast(
            nenhum
              ? `Nenhum produto do catálogo se aplica a "${val}"`
              : `Requisitos reprocessados para "${val}", análise recalculada`
          )
      }, TEMPO_DE_REPROCESSAMENTO)
    },
  }

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
            <section aria-label="Itens do edital" className="flex flex-col gap-4 rounded-lg border bg-card p-4">
              {/* O resumo executivo GERAL foi removido (aguardando feedback dos usuários). Os resumos
                  dentro de cada item seguem ativos. Sem arquivo, avisa que a análise está pendente. */}
              {SEM_ARQUIVO && (
                <div className="flex items-center gap-3.5 rounded-lg border bg-background px-4.5 py-4">
                  <span className="grid size-9.5 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
                    <ClockIcon aria-hidden className="size-5" />
                  </span>
                  <p className="text-[13px] text-muted-foreground">
                    <b className="block text-sm font-semibold text-foreground">Análise pendente</b>
                    Esta licitação ainda não tem arquivos identificados. Os scores serão gerados automaticamente assim que
                    os arquivos forem carregados.
                  </p>
                </div>
              )}

              <div className="flex">
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto bg-foreground/10 text-[13px] font-semibold hover:bg-foreground/15"
                  data-nao-prototipado
                >
                  Exportar
                </Button>
              </div>

              <ul className="flex flex-col gap-2.5">
                {ITENS.map((it, i) => (
                  <li key={it.numero}>
                    <CardDoItem indice={i} estado={estado} escolhido={prefs.chosen[i]} onAbrir={() => setAberto(i)} />
                  </li>
                ))}
              </ul>
            </section>
          </TabsContent>
        </Tabs>
      </div>

      {aberto == null && <CartaoDeProcessamento resultados={resultados} onAbrir={setAberto} />}

      <Analise
        indice={aberto}
        estado={estado}
        prefs={prefs}
        semArquivo={SEM_ARQUIVO}
        reprocessando={reprocessando}
        resultados={resultados}
        acoes={acoes}
        onAbrir={setAberto}
        onFechar={() => setAberto(null)}
      />
    </AppShell>
  )
}

/* ============================================================
   Card do item na lista
   ============================================================ */
function CardDoItem({
  indice,
  estado,
  escolhido,
  onAbrir,
}: {
  indice: number
  estado: Estado
  escolhido: number | undefined
  onAbrir: () => void
}) {
  const it = ITENS[indice]
  const resumo = resumirItem(indice, estado)
  const tipos = tiposDoItem(indice, estado)

  // descrição no formato "Tipo - Texto completo"; o tipo é a categoria do item, não a mecânica
  const completa = `${it.tipo ? it.tipo + " - " : ""}${it.descricao || it.nome}`
  const cortada = completa.length > LIMITE_DA_DESCRICAO
  const texto = cortada ? completa.slice(0, LIMITE_DA_DESCRICAO).replace(/\s+$/, "") + "…" : completa
  const quantidade = it.quantidade === "1" ? "1 unidade" : `${it.quantidade} unidades`

  // item só de checklist: faixa de aderência (%); enquanto não termina, o progresso da análise
  const soChecklist = it.componentes.every((c) => c.mecanica === "checklist")
  const check = soChecklist ? resumo.comps.find((c) => c.mecanica === "checklist") : undefined
  const prod = resumo.comps.find((c) => c.mecanica === "produto")
  const comp = it.componentes.find((c) => c.mecanica === "produto") as ComponenteProduto | undefined
  const skuEscolhido = prod && comp && escolhido != null ? comp.skus[escolhido] : undefined

  let status
  if (SEM_ARQUIVO)
    status = (
      <Dica texto="A análise ainda não foi gerada (licitação sem arquivo)">
        <Badge variant="outline" tabIndex={0} className="relative z-1 bg-muted text-muted-foreground">
          <ClockIcon data-icon="inline-start" />
          Score pendente
        </Badge>
      </Dica>
    )
  else if (resumo.vazio)
    status = (
      <Dica texto="A extração automática não encontrou nenhuma especificação para este item. Faça a extração manual do edital.">
        <Badge variant="warning" tabIndex={0} className="relative z-1">
          <AlertCircleIcon data-icon="inline-start" />
          Não processado
        </Badge>
      </Dica>
    )
  else if (check?.mecanica === "checklist") {
    const r = check.resumo
    status = r.concluida ? (
      <BadgeDeFaixa pct={r.pct} />
    ) : (
      <Dica texto={`${r.analisadoPct}% dos requisitos já foram analisados. A aderência aparece quando a análise for concluída.`}>
        <Badge variant="outline" tabIndex={0} className="relative z-1 bg-muted text-muted-foreground">
          Em análise · {r.analisadoPct}%
        </Badge>
      </Dica>
    )
  } else
    status = resumo.atende ? (
      <Badge variant="success">Atende</Badge>
    ) : resumo.comps.some((c) => c.mecanica === "produto" && pendente(c.best)) ? (
      <Badge variant="warning">Análise pendente</Badge>
    ) : (
      <Badge variant="destructive">Não atende</Badge>
    )

  return (
    <Card
      size="sm"
      onClick={onAbrir}
      className={cn(
        "relative cursor-pointer gap-2.5 rounded-lg shadow-xs transition-[box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:shadow-md hover:ring-foreground/20 has-focus-visible:ring-3 has-focus-visible:ring-ring/50"
      )}
    >
      <CardHeader className="flex flex-wrap items-center gap-1.5">
        {/* área clicável do card inteiro (teclado e leitor de tela) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onAbrir()
          }}
          className="absolute inset-0 rounded-lg outline-none"
        >
          <span className="sr-only">
            Abrir a análise completa do item {it.numero}: {it.titulo}
          </span>
        </button>
        {tipos.map((t) => (
          <Badge key={t} variant={COR_TIPO[t]} className="font-semibold">
            {ROTULO_TIPO[t]}
          </Badge>
        ))}
        {status}
        {!SEM_ARQUIVO && skuEscolhido && (
          <Badge variant="success" className="h-auto rounded-full border-success/10 px-2.5 font-medium">
            <CheckIcon data-icon="inline-start" />
            <b className="font-semibold">Produto escolhido:</b>
            <span className="font-mono">{skuEscolhido.model}</span> · {skuEscolhido.brand}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {cortada ? (
          <Dica texto={completa}>
            <p className="relative z-1 w-fit text-[13.5px] leading-snug font-medium">{texto}</p>
          </Dica>
        ) : (
          <p className="text-[13.5px] leading-snug font-medium">{texto}</p>
        )}
      </CardContent>
      <CardFooter>
        <div className="flex w-full flex-wrap items-center gap-x-6 gap-y-1.5 border-t border-dashed pt-2 text-[12.5px]">
          <span>
            <b className="font-semibold">Quantidade:</b> {quantidade}
          </span>
          <span>
            <b className="font-semibold">Valor unitário:</b> <span className="font-mono">{formatarBRL(it.precoUnit)}</span>
          </span>
          <span>
            <b className="font-semibold">Valor total:</b> <span className="font-mono">{formatarBRL(valorTotal(it))}</span>
          </span>
        </div>
      </CardFooter>
    </Card>
  )
}

/** Aderência do software por faixa: < 50% vermelho, 50 a 80% neutro, > 80% verde. */
function BadgeDeFaixa({ pct }: { pct: number }) {
  const f = faixa(pct)
  return (
    <Badge
      variant={f === "ok" ? "success" : f === "bad" ? "destructive" : "outline"}
      className={cn(f === "mid" && "bg-muted text-muted-foreground")}
    >
      Aderência {pct}%
    </Badge>
  )
}

