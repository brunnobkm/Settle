// Dados da casca da Settle compartilhados entre as telas: espaço de trabalho,
// usuário e itens do menu da sidebar. A casca em si é o AppShell do design system.

import {
  BookmarkIcon,
  Columns3Icon,
  FileSearchIcon,
  FileXIcon,
  SproutIcon,
  SquareCheckIcon,
} from "lucide-react"
import type { MouseEvent } from "react"

import type { AppShellGroup, AppShellItem, AppShellUser, AppShellWorkspace } from "@/components/ui/app-shell"

export const WORKSPACE: AppShellWorkspace = {
  name: "Demos",
  description: "Espaço de trabalho",
  icon: SproutIcon,
}

export const USUARIO: AppShellUser = {
  name: "Brunno Krier",
  email: "brunno.krier+demos@settlegov.com",
  initials: "BK",
}

export const SAUDACAO = "Olá, Brunno"

export type TelaLicitacoes = "recomendadas" | "salvos" | "explorar" | "em-andamento" | "descartadas"

// Caminho de cada tela a partir de uma pasta settle-<projeto>/. null = ainda não prototipada.
const CAMINHOS: Record<TelaLicitacoes, string | null> = {
  recomendadas: "../settle-melhoria-deixar-os-filtros-aplicados-mais-visivel/",
  salvos: null,
  explorar: "../settle-explorar-licitacoes/",
  "em-andamento": null,
  descartadas: null,
}

const ITENS: { tela: TelaLicitacoes; label: string; icon: AppShellItem["icon"] }[] = [
  { tela: "recomendadas", label: "Recomendadas", icon: SquareCheckIcon },
  { tela: "salvos", label: "Salvos para depois", icon: BookmarkIcon },
  { tela: "explorar", label: "Explorar licitações", icon: FileSearchIcon },
  { tela: "em-andamento", label: "Em andamento", icon: Columns3Icon },
  { tela: "descartadas", label: "Descartadas", icon: FileXIcon },
]

/**
 * Menu "Licitações" da sidebar.
 * - `ativa`: tela atual (fica destacada e o clique não recarrega a página).
 * - `salvos`: contador de "Salvos para depois" (some quando é 0).
 * Telas sem protótipo recebem data-nao-prototipado (ver useNaoPrototipado).
 */
export function menuLicitacoes({ ativa, salvos }: { ativa?: TelaLicitacoes; salvos?: number } = {}): AppShellGroup[] {
  return [
    {
      label: "Licitações",
      items: ITENS.map(({ tela, label, icon }): AppShellItem => {
        const caminho = CAMINHOS[tela]
        const ativo = tela === ativa
        return {
          label,
          icon,
          active: ativo,
          href: caminho ?? "#",
          count: tela === "salvos" ? salvos : undefined,
          ...(ativo && { onClick: (e: MouseEvent) => e.preventDefault() }),
          ...(!caminho && !ativo && { "data-nao-prototipado": true }),
        }
      }),
    },
  ]
}
