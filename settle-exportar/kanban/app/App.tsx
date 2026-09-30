// Licitações em andamento: as licitações que a empresa está disputando, em três
// visualizações. Board (kanban por etapa do nosso processo, arrastar entre colunas),
// Tabela (todas as propriedades em colunas) e Calendário (pelo envio da proposta).
// O card do Board é a fonte da verdade visual; Tabela e Calendário o espelham.

import { useCallback, useState, type ComponentProps } from "react"
import { DownloadIcon, EllipsisIcon, LinkIcon, SearchIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { AppShell } from "@/components/ui/app-shell"
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FilterChip, FilterChipGroup } from "@/components/ui/filter-chip"
import { Kanban } from "@/components/ui/kanban"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MENSAGEM_NAO_PROTOTIPADO, useNaoPrototipado } from "@/settle/nao-prototipado"
import { SAUDACAO, USUARIO, WORKSPACE } from "@/settle/navegacao"

import { ModalExportar, ModalExportarHoje, type AberturaDoModal } from "../../app/exportacao/ModalExportar"
import { gerarLinhas, useDecisoes, useVersao } from "../../app/exportacao/nucleo"
import { menuDoProjeto, PainelDoPrototipo } from "../../app/exportacao/Prototipo"
import { ProvedorDeExportacoes } from "../../app/exportacao/Tarefas"

import { CardKanban } from "./CardKanban"
import { ETAPAS, LICITACOES_DO_BOARD, PESSOAS, SEGMENTOS_INICIAIS, linkDaLicitacao, pessoaPorId, type EtapaId, type Licitacao } from "./dados"
import { VistaCalendario } from "./VistaCalendario"
import { VistaTabela } from "./VistaTabela"

type Vista = "board" | "tabela" | "calendario"

const VISTAS: { id: Vista; rotulo: string }[] = [
  { id: "board", rotulo: "Board" },
  { id: "tabela", rotulo: "Tabela" },
  { id: "calendario", rotulo: "Calendário" },
]

const ESTADOS_DO_FILTRO = ["SP", "RJ", "MG", "PR", "RS", "DF", "ES", "PA"]

export default function App() {
  return (
    <ProvedorDeExportacoes>
      <EmAndamento />
    </ProvedorDeExportacoes>
  )
}

function EmAndamento() {
  useNaoPrototipado()
  const [versao, setVersao] = useVersao()
  const [decisoes] = useDecisoes()
  const proposta = versao === "proposta"

  const [licitacoes, setLicitacoes] = useState(LICITACOES_DO_BOARD)
  const [filtroResponsavel, setFiltroResponsavel] = useState<string[]>([])
  const [filtroEstado, setFiltroEstado] = useState<string[]>([])
  const [modalHoje, setModalHoje] = useState(false)
  const [abertura, setAbertura] = useState<AberturaDoModal | null>(null)

  // filtros do Kanban: valem para o board, a tabela, o calendário e (na proposta) a exportação
  const visiveis = licitacoes.filter(
    (l) =>
      (!filtroResponsavel.length || l.responsaveis.some((id) => filtroResponsavel.includes(pessoaPorId(id)?.nome ?? ""))) &&
      (!filtroEstado.length || filtroEstado.includes(l.estado))
  )
  const nFiltros = (filtroResponsavel.length ? 1 : 0) + (filtroEstado.length ? 1 : 0)
  const etapasComTotal = ETAPAS.map((e) => ({ id: e.id, rotulo: e.rotulo, total: visiveis.filter((l) => l.etapa === e.id).length }))
  const menuNaColuna = proposta && decisoes.etapaVia !== "geral"
  const [segmentos, setSegmentos] = useState(SEGMENTOS_INICIAIS)
  const [vista, setVista] = useState<Vista>("board")
  const [emEdicao, setEmEdicao] = useState<string[]>([])
  const [paraDescartar, setParaDescartar] = useState<Licitacao | null>(null)
  const [avisoResultado, setAvisoResultado] = useState(false)

  const atualizar = useCallback((id: string, patch: Partial<Licitacao>) => {
    setLicitacoes((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)))
  }, [])

  // segmento criado vai para o conjunto disponível para os outros cards
  const criarSegmento = useCallback((nome: string) => setSegmentos((s) => (s.includes(nome) ? s : [...s, nome])), [])

  // card com editor aberto não pode ser arrastado (nem os outros, enquanto o editor está aberto)
  const marcarEdicao = useCallback((id: string, ativa: boolean) => {
    setEmEdicao((ids) => {
      const tem = ids.includes(id)
      if (ativa === tem) return ids
      return ativa ? [...ids, id] : ids.filter((x) => x !== id)
    })
  }, [])

  /** Solta o card na coluna `etapa`, na posição `indice` entre os cards dela. */
  function mover(id: string, etapa: string, indice: number) {
    setLicitacoes((ls) => {
      const item = ls.find((l) => l.id === id)
      if (!item) return ls
      const resto = ls.filter((l) => l.id !== id)
      const movido = { ...item, etapa: etapa as EtapaId }
      const daColuna = resto.filter((l) => l.etapa === etapa)
      let posicao = resto.length
      if (indice < daColuna.length) posicao = resto.indexOf(daColuna[indice])
      else if (daColuna.length) posicao = resto.indexOf(daColuna[daColuna.length - 1]) + 1
      return [...resto.slice(0, posicao), movido, ...resto.slice(posicao)]
    })
  }

  // a tela de detalhe da licitação ainda não foi prototipada
  const abrir = () => toast(MENSAGEM_NAO_PROTOTIPADO)

  async function copiarLink(l: Licitacao) {
    try {
      await navigator.clipboard.writeText(linkDaLicitacao(l.id))
    } catch {
      // protótipo: sem permissão de área de transferência, só avisa
    }
    toast("Link copiado", { icon: <LinkIcon className="size-4" /> })
  }

  function descartar(l: Licitacao) {
    const indice = licitacoes.findIndex((x) => x.id === l.id)
    setLicitacoes((ls) => ls.filter((x) => x.id !== l.id))
    toast("Licitação descartada", {
      description: `Edital ${l.codigoEdital}`,
      icon: <Trash2Icon className="size-4" />,
      duration: 5000,
      action: {
        label: "Desfazer",
        onClick: () =>
          setLicitacoes((ls) => (ls.some((x) => x.id === l.id) ? ls : [...ls.slice(0, indice), l, ...ls.slice(indice)])),
      },
    })
  }

  const propsDoCard = {
    segmentosDisponiveis: segmentos,
    onCriarSegmento: criarSegmento,
  }

  return (
    <AppShell
      workspace={WORKSPACE}
      groups={menuDoProjeto("kanban", versao)}
      user={USUARIO}
      header={<span className="text-[15px] font-semibold">{SAUDACAO}</span>}
    >
      <PainelDoPrototipo tela="kanban" versao={versao} onVersao={setVersao} />
      <h1 className="sr-only">Licitações em andamento</h1>

      <Tabs
        value={vista}
        onValueChange={(v) => setVista(v as Vista)}
        className="h-[calc(100svh-4rem)] min-h-0 gap-0"
      >
        {/* Barra de visualizações: abas à esquerda, ações à direita */}
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 px-4 pt-4">
          <TabsList aria-label="Visualização" className="h-9.5">
            {VISTAS.map((v) => (
              <TabsTrigger key={v.id} value={v.id} className="px-2.5 text-[13px]">
                {v.rotulo}
                <span className="text-xs font-normal text-muted-foreground tabular-nums">{visiveis.length}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div role="toolbar" aria-label="Ações da visualização" className="flex items-center gap-0.5 rounded-lg bg-muted p-[3px]">
            <BotaoDaBarra data-nao-prototipado>
              Filtrar
              {nFiltros > 0 && (
                <Badge className="h-4.5 min-w-4.5 bg-foreground px-1.5 text-[11px] text-background tabular-nums">
                  {nFiltros}
                  <span className="sr-only"> {nFiltros === 1 ? "filtro aplicado" : "filtros aplicados"}</span>
                </Badge>
              )}
            </BotaoDaBarra>
            <BotaoDaBarra data-nao-prototipado>Ordenar</BotaoDaBarra>
            <BotaoDaBarra
              onClick={() =>
                proposta ? setAbertura({ modo: "geral", opcao: "filtrado", origem: "botao_geral" }) : setModalHoje(true)
              }
            >
              Exportar
            </BotaoDaBarra>
            <BotaoDaBarra data-nao-prototipado>
              <SearchIcon data-icon="inline-start" />
              Buscar
            </BotaoDaBarra>
          </div>
        </div>

        <FilterChipGroup aria-label="Filtros aplicados" className="shrink-0 px-4 pt-3">
          <FilterChip
            label="Responsável"
            options={PESSOAS.map((p) => p.nome)}
            value={filtroResponsavel}
            onValueChange={setFiltroResponsavel}
          />
          <FilterChip label="Estado" options={ESTADOS_DO_FILTRO} value={filtroEstado} onValueChange={setFiltroEstado} />
        </FilterChipGroup>

        <TabsContent value="board" className="min-h-0 pt-3">
          <Kanban
            aria-label="Board kanban"
            columns={ETAPAS.map((e) => {
              const itens = visiveis.filter((l) => l.etapa === e.id)
              return {
                id: e.id,
                label: e.rotulo,
                title: menuNaColuna ? (
                  <span className="flex items-center gap-0.5">
                    <span className="truncate">{e.rotulo}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-xs" aria-label={`Ações da etapa ${e.rotulo}`} className="-my-1">
                          <EllipsisIcon />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem
                          onSelect={() =>
                            setAbertura({ modo: "geral", opcao: "etapa", etapas: [e.id], origem: "menu_coluna" })
                          }
                        >
                          <DownloadIcon />
                          Exportar esta etapa ({itens.length})
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </span>
                ) : (
                  e.rotulo
                ),
                indicatorClassName: e.cor,
                items: itens,
              }
            })}
            getItemId={(l) => l.id}
            onMove={mover}
            dragDisabled={emEdicao.length > 0}
            emptyLabel="Nenhuma licitação nesta etapa."
            renderItem={(l, { dragging }) => (
              <CardKanban
                licitacao={l}
                onChange={(patch) => atualizar(l.id, patch)}
                onAbrir={abrir}
                onCopiarLink={() => copiarLink(l)}
                onDescartar={() => setParaDescartar(l)}
                onEdicao={marcarEdicao}
                arrastando={dragging}
                {...propsDoCard}
              />
            )}
          />
        </TabsContent>

        <TabsContent value="tabela" className="min-h-0 p-4">
          <VistaTabela
            licitacoes={visiveis}
            onChange={atualizar}
            onAbrir={abrir}
            onCopiarLink={copiarLink}
            onDescartar={setParaDescartar}
            onResultadoBloqueado={() => setAvisoResultado(true)}
            {...propsDoCard}
          />
        </TabsContent>

        <TabsContent value="calendario" className="min-h-0 p-4">
          <VistaCalendario
            licitacoes={visiveis}
            onChange={atualizar}
            onAbrir={abrir}
            onCopiarLink={copiarLink}
            onDescartar={setParaDescartar}
            {...propsDoCard}
          />
        </TabsContent>
      </Tabs>

      {/* Descartar: pede confirmação; o aviso depois permite desfazer */}
      <AlertDialog open={!!paraDescartar} onOpenChange={(open) => !open && setParaDescartar(null)}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Descartar licitação?</AlertDialogTitle>
            <AlertDialogDescription>
              O edital {paraDescartar?.codigoEdital} sai das licitações em andamento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => paraDescartar && descartar(paraDescartar)}>
              Descartar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Resultado fora de "Resultados Finais" (a coluna da tabela é sempre clicável) */}
      <Dialog open={avisoResultado} onOpenChange={setAvisoResultado}>
        <DialogContent className="sm:max-w-105">
          <DialogHeader>
            <DialogTitle>Definir resultado</DialogTitle>
            <DialogDescription className="text-foreground">
              Só é possível definir o resultado quando a licitação estiver na etapa{" "}
              <strong className="font-semibold">Resultados Finais</strong>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button>Entendi</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ModalExportarHoje
        open={modalHoje}
        onOpenChange={setModalHoje}
        tela="kanban"
        comFormato={false}
        totalHoje={4}
        totalBase={licitacoes.length}
      />
      <ModalExportar
        abertura={abertura}
        onClose={() => setAbertura(null)}
        mostrarOpcaoEtapa={decisoes.etapaVia !== "coluna" || abertura?.origem === "menu_coluna"}
        contexto={{
          tela: "kanban",
          aba: VISTAS.find((v) => v.id === vista)?.rotulo,
          filtros: [
            ...(filtroResponsavel.length ? [{ rotulo: "Responsável", valor: filtroResponsavel.join(", ") }] : []),
            ...(filtroEstado.length ? [{ rotulo: "Estado", valor: filtroEstado.join(", ") }] : []),
          ],
          totalFiltrado: visiveis.length,
          totalHoje: Math.min(4, visiveis.length),
          etapas: etapasComTotal,
        }}
        linhas={({ opcao, quantidade: n, etapas }) =>
          gerarLinhas(n, {
            tela: "kanban",
            etapas: opcao === "etapa" ? etapasComTotal.filter((e) => etapas.includes(e.id)) : etapasComTotal,
            fixos: {
              estado: filtroEstado.length === 1 ? filtroEstado[0] : undefined,
              responsavel: filtroResponsavel.length === 1 ? filtroResponsavel[0] : undefined,
            },
          })
        }
      />
    </AppShell>
  )
}

function BotaoDaBarra({ className, ...props }: ComponentProps<typeof Button>) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("h-7.5 gap-1.5 px-2.5 text-[13px] hover:bg-background hover:shadow-xs", className)}
      {...props}
    />
  )
}
