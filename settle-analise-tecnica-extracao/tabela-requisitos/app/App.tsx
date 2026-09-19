// Tabela de requisitos: reconstrução do node 5254-17035 do Figma sobre o DataTable
// da Base. Colunas Requisito, Status, Confiança IA, Fonte, Bloco, Notas, Questionar,
// Impugnar, Revisar e Excluir, mais "Adicionar coluna" e "Adicionar requisito".
// A linha selecionada do Figma (alça + checkbox + menu "Copiar link") vira o estado
// inicial da seleção; o menu abre pela alça da linha.

import { useState } from "react"
import {
  CheckIcon,
  LinkIcon,
  MessageCircleIcon,
  PlusCircleIcon,
  SettingsIcon,
  SparklesIcon,
  Trash2Icon,
} from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { ActionBarButton } from "@/components/ui/action-bar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { DropdownMenuGroup, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { MENSAGEM_NAO_PROTOTIPADO, useNaoPrototipado } from "@/settle/nao-prototipado"

import { REQUISITOS, SELECIONADAS_INICIAIS, novoRequisito, type Manifestacao, type Requisito, type Tom } from "./dados"

const TOM_BADGE: Record<Tom, "success" | "warning" | "destructive" | "secondary"> = {
  success: "success",
  warning: "warning",
  destructive: "destructive",
  neutral: "secondary",
}
const TOM_TEXTO: Record<Tom, string> = {
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
  neutral: "text-foreground",
}

function Placeholder() {
  return <span className="truncate text-muted-foreground">Placeholder</span>
}

/** Interruptor de Questionar/Impugnar com o atalho para o texto (quando ligado). */
function CelulaManifestacao({
  valor,
  rotulo,
  linha,
  aoMudar,
}: {
  valor: Manifestacao
  rotulo: "Questionar" | "Impugnar"
  linha: string
  aoMudar: (ligado: boolean) => void
}) {
  const verbo = rotulo === "Questionar" ? "questionamento" : "impugnação"
  return (
    <span className="inline-flex items-center gap-2">
      <Switch checked={valor.ligado} onCheckedChange={aoMudar} aria-label={`${rotulo}: ${linha}`} />
      {valor.ligado && (
        <Button
          variant="ghost"
          size="icon-xs"
          data-nao-prototipado
          aria-label={valor.icone === "mais" ? `Escrever ${verbo} de ${linha}` : `Ver ${verbo} de ${linha}`}
          className="text-muted-foreground [&_svg:not([class*='size-'])]:size-4"
        >
          {valor.icone === "mais" ? <PlusCircleIcon /> : <MessageCircleIcon />}
        </Button>
      )}
    </span>
  )
}

export default function App() {
  useNaoPrototipado()

  const [linhas, setLinhas] = useState<Requisito[]>(REQUISITOS)
  const [selecionadas, setSelecionadas] = useState<string[]>(SELECIONADAS_INICIAIS)

  const rotuloDe = (r: Requisito) => `Requisito ${linhas.findIndex((l) => l.id === r.id) + 1}`
  const atualizar = (id: string, patch: Partial<Requisito>) =>
    setLinhas((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)))
  const excluir = (ids: string[]) => {
    setLinhas((ls) => ls.filter((l) => !ids.includes(l.id)))
    setSelecionadas((s) => s.filter((id) => !ids.includes(id)))
    toast(ids.length === 1 ? "Requisito excluído" : `${ids.length} requisitos excluídos`)
  }
  const marcarRevisados = (ids: string[]) =>
    setLinhas((ls) => ls.map((l) => (ids.includes(l.id) ? { ...l, revisar: { tipo: "revisado" } } : l)))
  const copiarLink = (r: Requisito) => {
    const link = `${location.href.split("#")[0]}#${r.id}`
    navigator.clipboard?.writeText(link).catch(() => {})
    toast("Link copiado")
  }

  const colunas: DataTableColumn<Requisito>[] = [
    {
      id: "requisito",
      header: "Requisito",
      width: 150,
      cell: () => <Placeholder />,
    },
    {
      id: "status",
      header: "Status",
      width: 182,
      cell: (r) =>
        r.status && (
          <Badge variant={TOM_BADGE[r.status.tom]} className="max-w-[150px] justify-start rounded-sm" title={r.status.rotulo}>
            <SparklesIcon data-icon="inline-start" aria-label="Status sugerido pela IA" />
            <span className="truncate">{r.status.rotulo}</span>
          </Badge>
        ),
    },
    {
      id: "confianca",
      header: "Confiança IA",
      cell: (r) =>
        r.confianca && <span className={cn("text-xs font-medium", TOM_TEXTO[r.confianca.tom])}>{r.confianca.rotulo}</span>,
    },
    {
      id: "fonte",
      header: "Fonte",
      cell: () => (
        <a href="#" data-nao-prototipado className="truncate text-muted-foreground underline-offset-4 hover:underline">
          Hyperlink
        </a>
      ),
    },
    {
      id: "bloco",
      header: "Bloco",
      cell: () => (
        <Badge variant="outline" className="rounded-sm bg-muted text-secondary-foreground">
          Placeholder
        </Badge>
      ),
    },
    { id: "notas", header: "Notas", cell: () => <Placeholder /> },
    {
      id: "questionar",
      header: "Questionar",
      cell: (r) => (
        <CelulaManifestacao
          valor={r.questionar}
          rotulo="Questionar"
          linha={rotuloDe(r)}
          aoMudar={(ligado) => atualizar(r.id, { questionar: { ...r.questionar, ligado } })}
        />
      ),
    },
    {
      id: "impugnar",
      header: "Impugnar",
      cell: (r) => (
        <CelulaManifestacao
          valor={r.impugnar}
          rotulo="Impugnar"
          linha={rotuloDe(r)}
          aoMudar={(ligado) => atualizar(r.id, { impugnar: { ...r.impugnar, ligado } })}
        />
      ),
    },
    {
      id: "revisar",
      header: "Revisar",
      cell: (r) => {
        const linha = rotuloDe(r)
        if (r.revisar.tipo === "interruptor") {
          const ligado = r.revisar.ligado
          return (
            <span className="inline-flex items-center gap-2">
              <Switch
                checked={ligado}
                onCheckedChange={(v) => atualizar(r.id, { revisar: { tipo: "interruptor", ligado: v } })}
                aria-label={`Revisar: ${linha}`}
              />
              {ligado && (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  data-nao-prototipado
                  aria-label={`Configurar revisão de ${linha}`}
                  className="text-muted-foreground [&_svg:not([class*='size-'])]:size-4"
                >
                  <SettingsIcon />
                </Button>
              )}
            </span>
          )
        }
        if (r.revisar.tipo === "revisado") {
          return (
            <Button
              size="xs"
              aria-pressed
              onClick={() => atualizar(r.id, { revisar: { tipo: "marcar" } })}
              title="Revisado (clique para desfazer)"
              className="max-w-[78px] rounded-md bg-muted-foreground text-background hover:bg-muted-foreground/85"
            >
              <CheckIcon data-icon="inline-start" />
              <span className="truncate">Revisado</span>
            </Button>
          )
        }
        return (
          <Button
            size="xs"
            onClick={() => atualizar(r.id, { revisar: { tipo: "revisado" } })}
            title="Marcar como revisado"
            className="max-w-[78px] justify-start rounded-md"
          >
            <span className="truncate">Marcar como revisado</span>
          </Button>
        )
      },
    },
    {
      id: "excluir",
      header: "Excluir",
      width: 104,
      headerAddon: <Trash2Icon aria-hidden className="size-4 shrink-0 text-destructive" />,
      cell: (r) => (
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={`Excluir ${rotuloDe(r)}`}
          onClick={() => excluir([r.id])}
          className="text-destructive opacity-0 group-hover/row:opacity-100 hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100 [&_svg:not([class*='size-'])]:size-4"
        >
          <Trash2Icon />
        </Button>
      ),
    },
  ]

  return (
    <main className="min-h-svh bg-muted/50 px-8 py-12 text-foreground">
      <h1 className="sr-only">Tabela de requisitos</h1>
      <DataTable
        className="w-max max-w-full"
        role="region"
        aria-label="Requisitos"
        columns={colunas}
        rows={linhas}
        getRowId={(r) => r.id}
        getRowLabel={rotuloDe}
        selectedIds={selecionadas}
        onSelectedIdsChange={setSelecionadas}
        bulkActions={
          <>
            <ActionBarButton onClick={() => marcarRevisados(selecionadas)}>
              <CheckIcon aria-hidden />
              Marcar como revisado
            </ActionBarButton>
            <ActionBarButton onClick={() => excluir(selecionadas)}>
              <Trash2Icon aria-hidden />
              Excluir
            </ActionBarButton>
          </>
        }
        rowMenu={(r) => (
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => copiarLink(r)}>
              <LinkIcon />
              Copiar link
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => excluir([r.id])} variant="destructive">
              <Trash2Icon />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuGroup>
        )}
        onRowMove={(de, para) =>
          setLinhas((ls) => {
            const i = ls.findIndex((l) => l.id === de)
            const j = ls.findIndex((l) => l.id === para)
            if (i < 0 || j < 0) return ls
            const copia = [...ls]
            const [item] = copia.splice(i, 1)
            copia.splice(j, 0, item)
            return copia
          })
        }
        addColumn={{
          open: false,
          onOpenChange: (aberto) => aberto && toast(MENSAGEM_NAO_PROTOTIPADO),
          content: null,
        }}
        onAddRow={() => setLinhas((ls) => [...ls, novoRequisito()])}
        labels={{ addRow: "Adicionar requisito", empty: "Nenhum requisito ainda." }}
      />
    </main>
  )
}
