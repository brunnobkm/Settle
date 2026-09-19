// Análise técnica de software: aba "Análise técnica" de uma licitação em andamento, com
// resumo de aderência, tabela de requisitos e importação/exportação em Excel.
// Decisões em aberto sobre importar/exportar: ver DECISOES.md na pasta.

import { useEffect, useRef, useState, type ComponentType } from "react"
import {
  ArrowDownToLineIcon,
  ArrowUpFromLineIcon,
  CheckIcon,
  FileTextIcon,
  LinkIcon,
  ListIcon,
  MessageSquareIcon,
  PlusIcon,
  Share2Icon,
  SparklesIcon,
  TargetIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { AppShell } from "@/components/ui/app-shell"
import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar"
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
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { MENSAGEM_NAO_PROTOTIPADO, useNaoPrototipado } from "@/settle/nao-prototipado"
import { menuLicitacoes, USUARIO, WORKSPACE } from "@/settle/navegacao"

import {
  ABA_ATUAL,
  ABAS_DA_LICITACAO,
  EQUIPE,
  ETAPAS,
  gerarDados,
  IMPUGNACOES,
  QUESTIONAMENTOS,
  STATUS,
  TIPOS,
  type Requisito,
  type Tipo,
} from "./dados"
import {
  BibliotecaIndisponivel,
  carregarSheetJS,
  exportarPlanilha,
  FORMATOS_ACEITOS,
  importarPlanilha,
} from "./planilha"
import { TabelaDeRequisitos } from "./TabelaDeRequisitos"

const MENSAGEM_SEM_BIBLIOTECA = "Biblioteca de Excel não carregou. Verifique a conexão."

// cor do ponto de cada tipo (o nome vem sempre junto); Software usa o mesmo laranja de "Atende com parceiro"
const PONTO_DO_TIPO: Record<Tipo, string> = {
  Software: "bg-[color-mix(in_oklab,var(--warning),var(--destructive)_45%)]",
  Produto: "bg-destructive",
  Serviço: "bg-success",
}

type Visao = "requisito" | "bloco"

export default function App() {
  useNaoPrototipado()

  const [dados, setDados] = useState<Requisito[]>(gerarDados)
  const [tipo, setTipo] = useState<Tipo>("Software")
  const [visao, setVisao] = useState<Visao>("requisito")
  const [selecionados, setSelecionados] = useState<string[]>([])
  const [erroAberto, setErroAberto] = useState(false)
  const inputArquivo = useRef<HTMLInputElement>(null)

  // a tela original carregava a SheetJS junto com a página
  useEffect(() => {
    carregarSheetJS().catch(() => {})
  }, [])

  const visiveis = dados.filter((r) => r.tipo === tipo)

  async function exportar() {
    try {
      await exportarPlanilha(dados)
      toast.success(`Exportado: ${dados.length} requisitos para Excel.`)
    } catch {
      toast.error(MENSAGEM_SEM_BIBLIOTECA)
    }
  }

  async function importar(arquivo: File) {
    try {
      const { dados: novos, atualizados, criados } = await importarPlanilha(arquivo, dados)
      setDados(novos)
      toast.success(`Importado: ${atualizados} atualizado(s), ${criados} novo(s).`)
    } catch (erro) {
      // biblioteca indisponível avisa pelo toast; qualquer outro erro é de formato do arquivo
      if (erro instanceof BibliotecaIndisponivel) {
        toast.error(MENSAGEM_SEM_BIBLIOTECA)
        return
      }
      console.warn("Falha na importação:", erro instanceof Error ? erro.message : erro)
      setErroAberto(true) // erro genérico: "Releia as instruções e garanta que está alinhado."
    }
  }

  return (
    <AppShell
      workspace={WORKSPACE}
      groups={menuLicitacoes({ ativa: "em-andamento" })}
      user={USUARIO}
      header={<Cabecalho />}
    >
      <Tabs
        value={ABA_ATUAL}
        onValueChange={() => toast(MENSAGEM_NAO_PROTOTIPADO)}
        activationMode="manual"
        className="border-b px-4"
      >
        <TabsList variant="line" tone="primary" aria-label="Seções da licitação" className="h-11 w-full justify-start overflow-x-auto">
          {ABAS_DA_LICITACAO.map((aba) => (
            <TabsTrigger
              key={aba.valor}
              value={aba.valor}
              className="flex-none px-3 text-[13px] data-[state=active]:font-semibold"
            >
              {aba.rotulo}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="px-5 pt-4.5 pb-15">
        <Tabs value={tipo} onValueChange={(v) => setTipo(v as Tipo)} className="mb-4">
          <TabsList aria-label="Tipo de requisito">
            {TIPOS.map((t) => (
              <TabsTrigger key={t} value={t} className="gap-1.75 px-3.5 text-[13px]">
                <span aria-hidden className={cn("size-1.75 rounded-full", PONTO_DO_TIPO[t])} />
                {t}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <Resumo linhas={visiveis} />

        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <Tabs value={visao} onValueChange={(v) => setVisao(v as Visao)}>
            <TabsList aria-label="Visualização">
              <TabsTrigger value="requisito" className="px-3.5 text-[13px]">
                Visão em requisito
              </TabsTrigger>
              <TabsTrigger value="bloco" className="px-3.5 text-[13px]">
                Visão em bloco
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-wrap items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" className="text-[13px]" onClick={() => inputArquivo.current?.click()}>
                  <ArrowDownToLineIcon data-icon="inline-start" className="text-muted-foreground" />
                  Importar
                </Button>
              </TooltipTrigger>
              <TooltipContent>Importar dados de um arquivo Excel</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" className="text-[13px]" onClick={exportar}>
                  <ArrowUpFromLineIcon data-icon="inline-start" className="text-muted-foreground" />
                  Exportar
                </Button>
              </TooltipTrigger>
              <TooltipContent>Exportar os dados para Excel</TooltipContent>
            </Tooltip>
            <Separator orientation="vertical" className="mx-0.5 data-vertical:h-5.5 data-vertical:self-center" />
            <Button variant="outline" className="text-[13px]" data-nao-prototipado>
              Concluir análise
            </Button>
            <Button variant="outline" className="text-[13px]" data-nao-prototipado>
              <SparklesIcon data-icon="inline-start" className="text-muted-foreground" />
              Revisar
            </Button>
          </div>
        </div>

        <TabelaDeRequisitos
          linhas={visiveis}
          tipo={tipo}
          selecionados={selecionados}
          onSelecionadosChange={setSelecionados}
        />
      </div>

      <input
        ref={inputArquivo}
        type="file"
        accept={FORMATOS_ACEITOS}
        aria-label="Arquivo Excel para importar"
        className="hidden"
        onChange={(e) => {
          const arquivo = e.target.files?.[0]
          if (arquivo) importar(arquivo)
          e.target.value = "" // permite reimportar o mesmo arquivo
        }}
      />

      <Dialog open={erroAberto} onOpenChange={setErroAberto}>
        <DialogContent showCloseButton={false} className="gap-5 p-7 text-center sm:max-w-95">
          <DialogHeader className="items-center">
            <span className="mb-1 flex size-11 items-center justify-center rounded-full bg-warning/10 text-warning">
              <TriangleAlertIcon aria-hidden className="size-5.5" />
            </span>
            <DialogTitle className="text-base font-bold">Não foi possível importar o arquivo</DialogTitle>
            <DialogDescription className="text-[13.5px] leading-normal">
              Releia as instruções e garanta que está alinhado.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button className="w-full">Entendi</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  )
}

/* ---------------- barra superior ---------------- */

function Cabecalho() {
  return (
    <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
      <Breadcrumb className="min-w-0">
        <BreadcrumbList className="flex-nowrap text-[13px] whitespace-nowrap">
          <BreadcrumbItem className="max-sm:hidden">
            <BreadcrumbLink href="#" data-nao-prototipado>
              Licitações
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="max-sm:hidden" />
          <BreadcrumbItem className="max-sm:hidden">
            <BreadcrumbLink href="#" data-nao-prototipado>
              Em andamento
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="max-sm:hidden" />
          <BreadcrumbItem className="min-w-0">
            <BreadcrumbPage className="truncate font-semibold">Identificador</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex shrink-0 items-center gap-2">
        <ul aria-label="Etapas" className="hidden items-center gap-2 xl:flex">
          {ETAPAS.map((etapa) => (
            <li key={etapa.rotulo}>
              <Badge
                variant={etapa.atual ? "default" : "secondary"}
                aria-current={etapa.atual ? "step" : undefined}
                className={cn(
                  "h-7 rounded-md px-3 text-xs",
                  etapa.atual ? "bg-warning font-semibold text-foreground" : "text-muted-foreground"
                )}
              >
                {etapa.atual && <span className="sr-only">Etapa atual: </span>}
                {etapa.rotulo}
              </Badge>
            </li>
          ))}
        </ul>

        <div className="ml-1 flex items-center max-md:hidden">
          <AvatarGroup aria-label="Time da licitação" className="-space-x-1">
            {EQUIPE.map((p) => (
              <Avatar key={p.nome} size="sm" title={p.nome}>
                <AvatarFallback className="text-[10px]">{p.iniciais}</AvatarFallback>
              </Avatar>
            ))}
          </AvatarGroup>
          <Button
            variant="outline"
            size="icon-xs"
            aria-label="Adicionar pessoa ao time"
            data-nao-prototipado
            className="-ml-1 rounded-full border-dashed text-muted-foreground"
          >
            <PlusIcon />
          </Button>
        </div>

        {ACOES_DO_TOPO.map(({ rotulo, icone: Icone }) => (
          <Button
            key={rotulo}
            variant="ghost"
            size="icon-sm"
            aria-label={rotulo}
            data-nao-prototipado
            className="text-muted-foreground"
          >
            <Icone />
          </Button>
        ))}
      </div>
    </div>
  )
}

const ACOES_DO_TOPO: { rotulo: string; icone: ComponentType }[] = [
  { rotulo: "Copiar link", icone: LinkIcon },
  { rotulo: "Compartilhar", icone: Share2Icon },
  { rotulo: "Documento", icone: FileTextIcon },
  { rotulo: "Comentários", icone: MessageSquareIcon },
]

/* ---------------- cards de resumo ---------------- */

function Resumo({ linhas }: { linhas: Requisito[] }) {
  const total = linhas.length
  const contar = (s: string) => linhas.filter((r) => r.status === s).length
  const atende = contar(STATUS.ATENDE)
  const aderencia = total ? Math.round((atende / total) * 100) : 0

  const cards: { icone: ComponentType<{ className?: string }>; valor: string | number; rotulo: string }[] = [
    { icone: TargetIcon, valor: `${aderencia}%`, rotulo: "Percentual de aderência" },
    { icone: ListIcon, valor: total, rotulo: "Total de requisitos" },
    { icone: CheckIcon, valor: atende, rotulo: "Atende" },
    { icone: CheckIcon, valor: contar(STATUS.PARCIAL), rotulo: "Atende parcialmente" },
    { icone: CheckIcon, valor: contar(STATUS.PARCEIRO), rotulo: "Atende com parceiro" },
    { icone: XIcon, valor: contar(STATUS.NAO), rotulo: "Não atende" },
    { icone: MessageSquareIcon, valor: QUESTIONAMENTOS, rotulo: "Questionamentos" },
    { icone: MessageSquareIcon, valor: IMPUGNACOES, rotulo: "Impugnação" },
  ]

  return (
    <ul aria-label="Resumo da análise" className="mb-4.5 grid grid-cols-2 gap-2.5 sm:grid-cols-4 min-[73.75rem]:grid-cols-8">
      {cards.map(({ icone: Icone, valor, rotulo }) => (
        <li key={rotulo} className="min-w-0">
          <Card size="sm" className="h-full rounded-lg px-0 pt-3.5 pb-3 shadow-none">
            <CardHeader className="flex flex-col-reverse gap-2 px-3.5">
              <CardDescription className="text-xs leading-tight">{rotulo}</CardDescription>
              <CardTitle className="flex items-center gap-1.75">
                <Icone aria-hidden className="size-3.5 text-muted-foreground" />
                <span className="text-2xl leading-none font-bold tracking-tight tabular-nums">{valor}</span>
              </CardTitle>
            </CardHeader>
          </Card>
        </li>
      ))}
    </ul>
  )
}
