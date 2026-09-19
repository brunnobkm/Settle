// Agentes (V1): autonomia do cliente sobre Score e Resumo.
// Protótipo do conceito discutido nas reuniões de 21 e 24/08/2026, congelado em 26/08
// como hipótese 1 (a conversa conduz do início ao fim) para comparação no teste com clientes.
//
// Tese: o cliente deixa de receber a análise pronta e passa a construir a própria regra.
// A construção é conversacional, mas o resultado é sempre materializado como artefato revisável.
//
// O que o protótipo demonstra:
//   1. Score e Resumo editáveis pelo cliente, com a fonte de cada linha visível
//   2. Variável como bloco reutilizável, versionado e com custo
//   3. Construtor conversa e artefato, com alternância Fluxo/Texto (debate em aberto)
//   4. Tratamento de valor default e do caso CAPAG (lacuna de cenário)
//   5. Pré-visualização em licitações reais antes de ativar (custo do erro alto)
//   6. Versionamento: o que fazer com as licitações em aberto

import { useRef, useState, type MouseEvent, type ReactNode } from "react"
import { BotIcon, ListFilterIcon, MinusIcon, PlusIcon, TriangleAlertIcon, UsersIcon } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AppShell, type AppShellGroup } from "@/components/ui/app-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Item, ItemActions, ItemContent, ItemTitle } from "@/components/ui/item"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useNaoPrototipado } from "@/settle/nao-prototipado"
import { menuLicitacoes, SAUDACAO, USUARIO, WORKSPACE } from "@/settle/navegacao"

import { Construtor } from "./Construtor"
import {
  EXECUCOES,
  RESUMO,
  SCORE_INICIAL,
  VARIAVEIS,
  pontosDaRegra,
  type Fonte,
  type LinhaConfig,
  type Regra,
} from "./dados"

type Aba = "score" | "resumo" | "variaveis" | "execucoes"

const GRUPOS: AppShellGroup[] = [
  ...menuLicitacoes(),
  {
    label: "Configuração da análise",
    items: [
      { label: "Agentes", icon: BotIcon, active: true, href: "#", onClick: (e: MouseEvent) => e.preventDefault() },
      { label: "Segmentos e match", icon: ListFilterIcon, href: "#", "data-nao-prototipado": true },
      { label: "Equipe e permissões", icon: UsersIcon, href: "#", "data-nao-prototipado": true },
    ],
  },
]

export default function App() {
  useNaoPrototipado()

  const [aba, setAba] = useState<Aba>("score")
  const [score, setScore] = useState(SCORE_INICIAL)
  const [alertaVersao, setAlertaVersao] = useState(true)
  const [construtor, setConstrutor] = useState({ aberto: false, existente: null as string | null, sessao: 0 })
  const seqNovos = useRef(0)

  const ativos = score.filter((i) => i.ativo !== false)
  const totalPts = ativos.reduce((soma, i) => soma + (i.pts ?? 0), 0)

  function abrirConstrutor(existente: string | null) {
    setConstrutor((c) => ({ aberto: true, existente, sessao: c.sessao + 1 }))
  }

  function ativar(regra: Regra, recalcular: boolean) {
    const id = `novo-${++seqNovos.current}`
    setScore((lista) => [
      ...lista,
      {
        id,
        nome: regra.nome,
        pts: pontosDaRegra(regra),
        fonte: "var",
        fonteTxt: `Variável · ${regra.tipo === "capag" ? "CAPAG (v3)" : "Quantidade de veículos"}`,
        nota: (
          <>
            {regra.pontos}. Quando não encontrado: <b>{(regra.semDado ?? "").replace(/^Não encontrado: /, "")}</b>.
          </>
        ),
        ativo: true,
      },
    ])
    setConstrutor((c) => ({ ...c, aberto: false }))
    toast(`Critério ativado${recalcular ? " e 14 licitações em recálculo" : ""}`, {
      action: { label: "Desfazer", onClick: () => setScore((lista) => lista.filter((i) => i.id !== id)) },
    })
  }

  return (
    <AppShell
      workspace={WORKSPACE}
      groups={GRUPOS}
      user={USUARIO}
      header={<span className="text-[15px] font-semibold">{SAUDACAO}</span>}
    >
      <div className="mx-auto max-w-347 px-6 pt-6 pb-16">
        <header className="mb-5.5">
          <p className="text-3xl font-normal">Agentes</p>
          <h1 className="mt-1.5 text-5xl leading-[1.04] font-bold tracking-[-0.5px]">Score e Resumo</h1>
          <Lead>
            Aqui você define o que a Settle analisa em cada licitação: quais critérios pontuam, de onde sai cada
            informação e o que fazer quando ela não é encontrada. O que você configurar vale para todas as licitações do
            seu espaço de trabalho.
          </Lead>
        </header>

        <div className="flex flex-col gap-4">
          {alertaVersao && (
            <Alert variant="warning">
              <TriangleAlertIcon />
              <AlertTitle>A variável CAPAG mudou e 14 licitações em aberto ainda usam a versão anterior</AlertTitle>
              <AlertDescription className="flex flex-col items-start gap-2.5 text-[13px]">
                <p className="mb-0!">
                  A versão v3 passou a considerar a esfera do órgão. Licitações já analisadas continuam com o resultado
                  antigo até serem recalculadas.
                </p>
                <div className="flex flex-wrap gap-1">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setAlertaVersao(false)
                      toast("Recalculando 14 licitações em aberto")
                    }}
                  >
                    Recalcular as 14 licitações
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setAlertaVersao(false)
                      toast("A v3 passa a valer só para novas licitações")
                    }}
                  >
                    Manter como está
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <Alert variant="warning" className="mb-0.5">
            <TriangleAlertIcon />
            <AlertTitle>Versão congelada em 26/08 · hipótese 1: a conversa conduz do início ao fim</AlertTitle>
            <AlertDescription className="flex flex-col items-start gap-2.5 text-[13px]">
              <p className="mb-0!">
                Esta é uma das duas hipóteses iniciais do projeto de Agentes, mantida como está para comparação no teste
                com clientes. Ela não recebeu nada do que veio depois: análise como um agente com várias regras, variável
                dentro do texto, memória de cálculo, estados de execução, regra condicional nem criação a partir da
                licitação.
              </p>
              <Button variant="outline" asChild>
                <a href="./plataforma/">Abrir a tela atual</a>
              </Button>
            </AlertDescription>
          </Alert>
        </div>

        <Tabs value={aba} onValueChange={(v) => setAba(v as Aba)} className="gap-0">
          <div className="my-5 mb-4 flex flex-wrap items-center justify-between gap-4">
            <TabsList aria-label="Seções da configuração" className="h-auto max-w-full overflow-x-auto">
              <AbaComContador valor="score" rotulo="Score" contador={score.length} />
              <AbaComContador valor="resumo" rotulo="Resumo" contador={RESUMO.length} />
              <AbaComContador valor="variaveis" rotulo="Variáveis" contador={VARIAVEIS.length} />
              <AbaComContador valor="execucoes" rotulo="Execuções" contador={148} />
            </TabsList>
            <Button onClick={() => abrirConstrutor(null)}>
              <PlusIcon data-icon="inline-start" />
              {aba === "resumo" ? "Novo campo no Resumo" : "Novo critério"}
            </Button>
          </div>

          <TabsContent value="score" aria-label="Critérios do score">
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-4">
              <p className="flex items-baseline gap-2 text-[13px] text-muted-foreground">
                <b className="text-xl font-bold text-foreground tabular-nums">{totalPts}</b> pontos distribuídos em{" "}
                {ativos.length} critérios ativos
              </p>
              <p className="flex items-baseline gap-2 text-[13px] text-muted-foreground">
                Custo médio por licitação analisada: <b className="text-xl font-bold text-foreground tabular-nums">R$ 0,14</b>
              </p>
            </div>
            <ListaDeLinhas linhas={score} comPontos onAjustar={abrirConstrutor} />
          </TabsContent>

          <TabsContent value="resumo" aria-label="Campos do resumo">
            <Lead className="mt-0 mb-4">
              Os campos abaixo aparecem no Resumo de cada licitação, nesta ordem. Cada linha diz de onde a informação sai
              e o que acontece quando ela não é encontrada no edital.
            </Lead>
            <ListaDeLinhas linhas={RESUMO} onAjustar={abrirConstrutor} />
          </TabsContent>

          <TabsContent value="variaveis" aria-label="Variáveis">
            <Lead className="mt-0 mb-4">
              Uma variável é uma informação extraída uma vez e reutilizada em qualquer lugar: no Score, no Resumo, no
              match ou em um agente próprio. Alterar uma variável afeta todos os lugares que a usam.
            </Lead>
            <Quadro titulo="Variáveis do espaço de trabalho" contador="6" total="Custo no mês:" valor="R$ 31,80">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <Th>Variável</Th>
                  <Th>Fonte</Th>
                  <Th>Usada em</Th>
                  <Th>Versão</Th>
                  <Th>Custo por extração</Th>
                  <Th>Não encontrada</Th>
                </TableRow>
              </TableHeader>
              <TableBody>
                {VARIAVEIS.map((v) => (
                  <TableRow key={v.nome}>
                    <Td className="font-semibold text-foreground">{v.nome}</Td>
                    <Td>{v.fonte}</Td>
                    <Td>{v.usadaEm}</Td>
                    <Td>{v.versao}</Td>
                    <Td className="tabular-nums">{v.custo}</Td>
                    <Td>{v.naoEncontrada}</Td>
                  </TableRow>
                ))}
              </TableBody>
            </Quadro>
          </TabsContent>

          <TabsContent value="execucoes" aria-label="Execuções">
            <Lead className="mt-0 mb-4">
              Tudo que rodou automaticamente no seu espaço de trabalho, o gatilho que disparou e quanto custou.
            </Lead>
            <Quadro titulo="Últimas execuções" contador="148 no mês" total="Total no mês:" valor="R$ 31,80">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <Th>Quando</Th>
                  <Th>Gatilho</Th>
                  <Th>Licitação</Th>
                  <Th>O que rodou</Th>
                  <Th>Resultado</Th>
                  <Th>Custo</Th>
                </TableRow>
              </TableHeader>
              <TableBody>
                {EXECUCOES.map((e, i) => (
                  <TableRow key={i}>
                    <Td className="tabular-nums">{e.quando}</Td>
                    <Td>{e.gatilho}</Td>
                    <Td>{e.licitacao}</Td>
                    <Td>{e.oQueRodou}</Td>
                    <Td>
                      {e.resultado === null ? (
                        <Badge variant="warning" className="rounded-md">
                          falhou · edital não baixou
                        </Badge>
                      ) : /não encontrad/.test(e.resultado) ? (
                        <span className="text-warning-strong">{e.resultado}</span>
                      ) : (
                        e.resultado
                      )}
                    </Td>
                    <Td className="tabular-nums">{e.custo}</Td>
                  </TableRow>
                ))}
              </TableBody>
            </Quadro>
          </TabsContent>
        </Tabs>
      </div>

      <Construtor
        key={construtor.sessao}
        aberto={construtor.aberto}
        onAbertoChange={(aberto) => setConstrutor((c) => ({ ...c, aberto }))}
        existente={construtor.existente}
        onAtivar={ativar}
      />
    </AppShell>
  )
}

/* ------------------------------------------------------------------ */
/* Peças da tela                                                        */
/* ------------------------------------------------------------------ */

function Lead({ className, children }: { className?: string; children: ReactNode }) {
  return <p className={cn("mt-2 max-w-190 text-sm leading-[21px] text-muted-foreground", className)}>{children}</p>
}

function AbaComContador({ valor, rotulo, contador }: { valor: Aba; rotulo: string; contador: number }) {
  return (
    <TabsTrigger value={valor} className="px-3 py-1.5">
      {rotulo}
      <span className="text-xs font-semibold text-muted-foreground tabular-nums">{contador}</span>
    </TabsTrigger>
  )
}

const CLASSE_FONTE: Record<Fonte, string> = {
  var: "bg-primary/10 text-primary",
  sys: "bg-muted text-muted-foreground",
  pend: "",
}

function SeloDeFonte({ fonte, children }: { fonte: Fonte; children: ReactNode }) {
  return (
    <Badge
      variant={fonte === "pend" ? "warning" : "secondary"}
      className={cn("h-auto rounded-md px-1.75 py-0.5 text-[11px] leading-4 font-semibold", CLASSE_FONTE[fonte])}
    >
      {children}
    </Badge>
  )
}

function ListaDeLinhas({
  linhas,
  comPontos = false,
  onAjustar,
}: {
  linhas: LinhaConfig[]
  comPontos?: boolean
  onAjustar: (nome: string) => void
}) {
  return (
    <ul className="flex flex-col gap-2">
      {linhas.map((item) => {
        const rascunho = item.ativo === false
        return (
          <Item
            key={item.id}
            asChild
            variant="outline"
            className={cn("flex-nowrap items-start gap-3 rounded-lg bg-card px-3.5 py-3", rascunho && "bg-muted")}
          >
            <li>
              <ItemContent className="min-w-0 gap-0">
                <ItemTitle className="line-clamp-none flex-wrap font-semibold">
                  {item.nome}
                  {rascunho && (
                    <Badge variant="secondary" className="rounded-md font-medium">
                      rascunho
                    </Badge>
                  )}
                </ItemTitle>
                <div className="mt-1.25 flex flex-wrap items-center gap-1.5">
                  <SeloDeFonte fonte={item.fonte}>{item.fonteTxt}</SeloDeFonte>
                </div>
                {item.nota && (
                  <p className="mt-1.5 text-xs leading-[17px] text-muted-foreground [&_b]:font-semibold [&_b]:text-foreground">
                    {item.nota}
                  </p>
                )}
                {item.alerta && (
                  <p className="mt-1.5 text-xs leading-[17px] text-warning-strong">Atenção: {item.alerta}</p>
                )}
              </ItemContent>
              {comPontos && (
                <div className="min-w-16.5 flex-none text-right text-[15px] font-bold tabular-nums">
                  {rascunho ? (
                    <span className="inline-flex text-muted-foreground">
                      <MinusIcon aria-hidden className="size-4" />
                      <span className="sr-only">sem pontos, em rascunho</span>
                    </span>
                  ) : (
                    `${item.pts} pts`
                  )}
                </div>
              )}
              <ItemActions className="flex-none">
                <Button variant="outline" onClick={() => onAjustar(item.nome)}>
                  Ajustar
                </Button>
              </ItemActions>
            </li>
          </Item>
        )
      })}
    </ul>
  )
}

function Quadro({
  titulo,
  contador,
  total,
  valor,
  children,
}: {
  titulo: string
  contador: string
  total: string
  valor: string
  children: ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-lg border bg-card" aria-label={titulo}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b p-2">
        <div className="flex items-center gap-1.5">
          <h3 className="text-base leading-6 font-semibold">{titulo}</h3>
          <Badge variant="secondary" className="rounded-md">
            {contador}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {total} <b className="font-semibold text-foreground tabular-nums">{valor}</b>
        </p>
      </div>
      <Table>{children}</Table>
    </section>
  )
}

function Th({ children }: { children: ReactNode }) {
  return (
    <TableHead scope="col" className="h-auto border-r px-2 py-2 text-sm last:border-r-0">
      {children}
    </TableHead>
  )
}

function Td({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <TableCell className={cn("h-9 border-r px-2 text-xs leading-4 text-muted-foreground last:border-r-0", className)}>
      {children}
    </TableCell>
  )
}
