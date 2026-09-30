// Execução das exportações da versão Proposta: sempre UM arquivo, com cabeçalho
// (data e hora, usuário, filtros). Acima de LIMITE_SEGUNDO_PLANO o arquivo é
// preparado em segundo plano, com progresso e aviso de pronto. Os dados são
// "congelados" no pedido: mudar a tela depois não altera o arquivo.

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react"
import { toast } from "sonner"

import { BackgroundTasks } from "@/components/ui/background-tasks"
import { Progress } from "@/components/ui/progress"

import {
  LIMITE_SEGUNDO_PLANO,
  USUARIO_DA_EXPORTACAO,
  agoraFormatado,
  baixarArquivo,
  nomeDoArquivo,
  quantidade,
  registrarEvento,
  useDecisoes,
  type Arquivo,
  type Formato,
  type Linha,
  type OpcaoExport,
  type TelaExport,
} from "./nucleo"

export type PedidoDeExportacao = {
  tela: TelaExport
  opcao: OpcaoExport
  formato: Formato
  quantidade: number
  /** Linhas do cabeçalho do arquivo (tela, aba, busca, filtros, seleção). */
  resumo: [string, string][]
  /** Chamado no pedido: é aqui que os dados ficam congelados. */
  linhas: () => Linha[]
}

type Tarefa = {
  id: string
  status: "running" | "done" | "failed"
  progresso: number
  arquivo: Arquivo
  pedido: PedidoDeExportacao
  inicio: number
}

const Contexto = createContext<{ exportar: (p: PedidoDeExportacao) => void } | null>(null)

export function useExportacoes() {
  const ctx = useContext(Contexto)
  if (!ctx) throw new Error("useExportacoes fora do ProvedorDeExportacoes")
  return ctx
}

const ROTULO_DA_TELA: Record<TelaExport, string> = { recomendadas: "Recomendadas", kanban: "Em andamento (Kanban)" }

export function ProvedorDeExportacoes({ children }: { children: ReactNode }) {
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [decisoes, alterarDecisoes] = useDecisoes()
  const timers = useRef(new Map<string, number>())
  const decisoesRef = useRef(decisoes)
  decisoesRef.current = decisoes

  useEffect(() => {
    const t = timers.current
    return () => t.forEach((id) => window.clearInterval(id))
  }, [])

  const atualizar = (id: string, patch: Partial<Tarefa>) =>
    setTarefas((ts) => ts.map((t) => (t.id === id ? { ...t, ...patch } : t)))

  const executar = useCallback((tarefa: Tarefa) => {
    const { pedido, arquivo } = tarefa
    const grande = pedido.quantidade > LIMITE_SEGUNDO_PLANO
    const vaiFalhar = decisoesRef.current.simularFalha
    if (vaiFalhar) alterarDecisoes({ simularFalha: false }) // falha uma vez só
    const duracao = grande ? (decisoesRef.current.temposCurtos ? 3000 : 7000) : 1200
    const passo = 100
    let progresso = 0
    const rotulo = `${quantidade(pedido.quantidade)} em ${pedido.formato.toUpperCase()}`
    const idToast = grande ? undefined : toast.loading(`Gerando arquivo: ${rotulo}…`)

    if (grande) {
      toast("Estamos preparando seu arquivo", {
        description: `${rotulo}. Você pode continuar usando a Settle; avisaremos quando estiver pronto.`,
      })
    }

    const inicio = Date.now()
    const falhar = () => {
      window.clearInterval(timers.current.get(tarefa.id))
      atualizar(tarefa.id, { status: "failed" })
      registrarEvento("export_failed", {
        motivo: "tempo_limite_do_servidor",
        progresso_no_erro: Math.round(progresso),
        quantidade: pedido.quantidade,
        formato: pedido.formato,
        tela: pedido.tela,
      })
      toast.error("Não foi possível gerar o arquivo", {
        id: idToast,
        description: "O servidor demorou demais para responder. Nenhum arquivo foi baixado, nem parcial.",
        action: { label: "Tentar de novo", onClick: () => tentarDeNovo(tarefa) },
        duration: 12000,
      })
    }
    const concluir = () => {
      window.clearInterval(timers.current.get(tarefa.id))
      atualizar(tarefa.id, { status: "done", progresso: 100 })
      registrarEvento("export_completed", {
        tempo_ms: Date.now() - inicio,
        arquivos: 1,
        quantidade: pedido.quantidade,
        formato: pedido.formato,
        tela: pedido.tela,
        segundo_plano: grande,
      })
      if (grande) {
        toast.success("Seu arquivo está pronto", {
          description: `${rotulo}, em 1 arquivo.`,
          action: { label: "Baixar", onClick: () => baixarArquivo(arquivo) },
          duration: 15000,
        })
      } else {
        baixarArquivo(arquivo)
        toast.success("Arquivo baixado", { id: idToast, description: `${rotulo}, em 1 arquivo.` })
      }
    }

    const id = window.setInterval(() => {
      progresso = Math.min(100, progresso + (passo / duracao) * 100)
      if (vaiFalhar && progresso >= 55) return falhar()
      if (progresso >= 100) return concluir()
      if (grande) atualizar(tarefa.id, { progresso })
    }, passo)
    timers.current.set(tarefa.id, id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // tentar de novo usa o MESMO pedido congelado (não relê a tela)
  const tentarDeNovo = useCallback(
    (tarefa: Tarefa) => {
      const nova = { ...tarefa, status: "running" as const, progresso: 0, inicio: Date.now() }
      setTarefas((ts) => ts.map((t) => (t.id === tarefa.id ? nova : t)))
      executar(nova)
    },
    [executar]
  )

  const exportar = useCallback(
    (pedido: PedidoDeExportacao) => {
      registrarEvento("export_confirmed", {
        quantidade: pedido.quantidade,
        formato: pedido.formato,
        tela: pedido.tela,
        opcao: pedido.opcao,
      })
      const agora = new Date()
      const arquivo: Arquivo = {
        nome: nomeDoArquivo(pedido.tela, pedido.formato, agora),
        formato: pedido.formato,
        sobre: [
          ["Data e hora da exportação", agoraFormatado(agora)],
          ["Usuário", USUARIO_DA_EXPORTACAO],
          ["Espaço de trabalho", "Demos"],
          ["Tela", ROTULO_DA_TELA[pedido.tela]],
          ...pedido.resumo,
          ["Total de licitações", pedido.quantidade.toLocaleString("pt-BR")],
          ["Observação", "Arquivo único. Filtros congelados no momento do pedido."],
        ],
        linhas: pedido.linhas(),
      }
      const tarefa: Tarefa = { id: String(agora.getTime()), status: "running", progresso: 0, arquivo, pedido, inicio: agora.getTime() }
      if (pedido.quantidade > LIMITE_SEGUNDO_PLANO) setTarefas((ts) => [...ts, tarefa])
      executar(tarefa)
    },
    [executar]
  )

  const emAndamento = tarefas.filter((t) => t.status === "running")
  const falhou = tarefas.some((t) => t.status === "failed")

  return (
    <Contexto.Provider value={{ exportar }}>
      {children}
      {tarefas.length > 0 && (
        <BackgroundTasks
          className="fixed top-20 right-4 z-50"
          title={emAndamento.length ? "Preparando seu arquivo" : falhou ? "Exportação com problema" : "Arquivo pronto"}
          description={
            emAndamento.length ? (
              <span className="flex flex-col gap-2">
                <span>
                  Pode continuar usando a Settle. Mudar filtros ou abas agora não altera este arquivo.
                </span>
                <Progress value={emAndamento[0].progresso} aria-label="Progresso da exportação" />
                <span className="tabular-nums">{Math.round(emAndamento[0].progresso)}%</span>
              </span>
            ) : falhou ? (
              "Nenhum arquivo incompleto foi entregue. Tente de novo."
            ) : (
              "Clique no arquivo para baixar."
            )
          }
          items={tarefas.map((t) => ({
            id: t.id,
            status: t.status,
            label: `${quantidade(t.pedido.quantidade)} · ${t.pedido.formato.toUpperCase()} · 1 arquivo`,
            onSelect: t.status === "done" ? () => baixarArquivo(t.arquivo) : undefined,
            onRetry: () => tentarDeNovo(t),
          }))}
          onClose={() => setTarefas((ts) => ts.filter((t) => t.status === "running"))}
        />
      )}
    </Contexto.Provider>
  )
}
