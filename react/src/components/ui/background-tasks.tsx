import * as React from "react"
import { CheckIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

// Card de acompanhamento de tarefas em segundo plano: uma linha por tarefa, com o
// estado (em andamento, pronta, falhou). Cada linha pode abrir o resultado e a que
// falhou oferece tentar de novo. O fechamento só aparece quando nada está em
// andamento: fechar não pode significar cancelar. A posição (ex.: fixo no canto)
// fica com a tela, pelo className. Todo o texto vem por props.

type BackgroundTaskStatus = "running" | "done" | "failed"

type BackgroundTask = {
  id: string
  label: React.ReactNode
  status: BackgroundTaskStatus
  /** Abre o resultado da tarefa (a linha vira botão). */
  onSelect?: () => void
  /** Tentar de novo (só nas que falharam). */
  onRetry?: () => void
}

type BackgroundTasksLabels = {
  close: string
  retry: string
  /** Nome acessível do ícone de cada estado. */
  running: string
  done: string
  failed: string
}

const DEFAULT_LABELS: BackgroundTasksLabels = {
  close: "Fechar",
  retry: "Tentar novamente",
  running: "Em andamento",
  done: "Pronto",
  failed: "Não foi possível concluir",
}

function StatusIcon({
  status,
  labels,
}: {
  status: BackgroundTaskStatus
  labels: BackgroundTasksLabels
}) {
  if (status === "running") {
    return <Spinner aria-label={labels.running} className="size-3.5 text-primary" />
  }
  // falhou e pronto se distinguem pelo ícone, não só pela cor
  return status === "failed" ? (
    <XIcon role="img" aria-label={labels.failed} className="size-3.5 shrink-0 text-destructive" />
  ) : (
    <CheckIcon role="img" aria-label={labels.done} className="size-3.5 shrink-0 text-success" />
  )
}

function BackgroundTasks({
  title,
  description,
  items,
  onClose,
  labels: labelsProp,
  className,
  ...props
}: Omit<React.ComponentProps<"aside">, "title"> & {
  title: React.ReactNode
  description?: React.ReactNode
  items: BackgroundTask[]
  /** Fechar o card. Só aparece quando nenhuma tarefa está em andamento. */
  onClose?: () => void
  labels?: Partial<BackgroundTasksLabels>
}) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp }
  const running = items.some((i) => i.status === "running")
  const failed = items.some((i) => i.status === "failed")
  const state = running ? "running" : failed ? "partial" : "done"

  return (
    <aside
      data-slot="background-tasks"
      data-state={state}
      aria-live="polite"
      className={cn(
        "w-[min(360px,calc(100vw-2rem))] rounded-2xl border bg-background px-5 pt-4.5 pb-2 text-foreground shadow-lg",
        className
      )}
      {...props}
    >
      <div className="flex items-start gap-2">
        {/* tudo pronto: título em verde; terminou com falha não é conclusão */}
        <h2
          className={cn(
            "min-w-0 flex-1 text-base font-semibold",
            state === "done" && "text-success-strong"
          )}
        >
          {title}
        </h2>
        {onClose && !running && (
          <Button variant="ghost" size="icon-xs" aria-label={labels.close} onClick={onClose}>
            <XIcon />
          </Button>
        )}
      </div>
      {description != null && (
        <p className="mt-1.5 text-[13px] leading-[19px] text-muted-foreground">{description}</p>
      )}
      <ul className="mt-3.5 flex flex-col">
        {items.map((item) => {
          const content = (
            <>
              <StatusIcon status={item.status} labels={labels} />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
            </>
          )
          return (
            <li
              key={item.id}
              data-status={item.status}
              className="flex items-center border-t text-sm"
            >
              {item.onSelect ? (
                <button
                  type="button"
                  onClick={item.onSelect}
                  className="flex min-h-10.5 min-w-0 flex-1 items-center gap-2.5 rounded-md px-2 py-2.5 text-left outline-none hover:bg-muted focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  {content}
                </button>
              ) : (
                <div className="flex min-h-10.5 min-w-0 flex-1 items-center gap-2.5 px-2 py-2.5">
                  {content}
                </div>
              )}
              {item.status === "failed" && item.onRetry && (
                <Button variant="outline" size="xs" className="ml-2 shadow-none" onClick={item.onRetry}>
                  {labels.retry}
                </Button>
              )}
            </li>
          )
        })}
      </ul>
    </aside>
  )
}

export {
  BackgroundTasks,
  type BackgroundTask,
  type BackgroundTaskStatus,
  type BackgroundTasksLabels,
}
