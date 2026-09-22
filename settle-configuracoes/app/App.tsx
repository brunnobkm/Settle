// Configurações da organização: área única no padrão do Linear. A sidebar da plataforma
// dá lugar à navegação das configurações ("Voltar para a plataforma" no topo) e cada
// página é uma coluna de caixas com linhas. Regras de negócio em ../REGRAS.md.
// Task do Notion "Fluxo para Configurações da Plataforma" (Alice, 12/09/2026).

import { useEffect, useState, type ComponentType } from "react"
import {
  ArrowLeftIcon,
  ClockIcon,
  Columns3Icon,
  FolderIcon,
  MailIcon,
  SettingsIcon,
  ShieldIcon,
  SparkleIcon,
  SquareMenuIcon,
  TextAlignStartIcon,
  UsersIcon,
  VariableIcon,
} from "lucide-react"

import { AppShell, type AppShellGroup } from "@/components/ui/app-shell"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { useNaoPrototipado } from "@/settle/nao-prototipado"
import { USUARIO } from "@/settle/navegacao"

import { AgentesProvider, useAgentes } from "./agentes/estado"
import { Janela } from "./agentes/Janela"
import { PaginaAgentes } from "./agentes/PaginaAgentes"
import { PaginaVariaveis } from "./agentes/PaginaVariaveis"
import { NOMES, PAPEIS, SO_ADMIN, type Papel, type Rota } from "./dados"
import { EstadoProvider, useConfig } from "./estado"
import { VERSAO } from "./versao"
import { PaginaAbas } from "./PaginaAbas"
import { PaginaCard } from "./PaginaCard"
import { PaginaEmail } from "./PaginaEmail"
import { PaginaEtapas } from "./PaginaEtapas"
import { PaginaInicio, SemPermissao } from "./PaginaInicio"
import { PaginaMotivos } from "./PaginaMotivos"
import { PaginaAuditoria, PaginaEquipe, PaginaPermissoes } from "./PaginaOrganizacao"
import { SettleAI } from "./SettleAI"

// "Voltar para a plataforma" leva para Recomendadas
const PLATAFORMA = "../settle-melhoria-deixar-os-filtros-aplicados-mais-visivel/"

const PAGINAS: Record<Rota, ComponentType> = {
  inicio: PaginaInicio,
  etapas: PaginaEtapas,
  abas: PaginaAbas,
  motivos: PaginaMotivos,
  card: PaginaCard,
  email: PaginaEmail,
  equipe: PaginaEquipe,
  permissoes: PaginaPermissoes,
  auditoria: PaginaAuditoria,
  agentes: PaginaAgentes,
  variaveis: PaginaVariaveis,
}

function lerRota(): Rota {
  const r = window.location.hash.slice(1).split("?")[0]
  return r in PAGINAS ? (r as Rota) : "inicio"
}

export default function App() {
  return (
    <EstadoProvider>
      <AgentesProvider>
        <Configuracoes />
        <Janela />
      </AgentesProvider>
    </EstadoProvider>
  )
}

function Configuracoes() {
  useNaoPrototipado()
  const { papel, setPapel, isAdmin } = useConfig()
  const { aprovacoes } = useAgentes()
  const [rota, setRota] = useState<Rota>(lerRota)

  useEffect(() => {
    const aoMudar = () => {
      setRota(lerRota())
      window.scrollTo(0, 0)
    }
    window.addEventListener("hashchange", aoMudar)
    return () => window.removeEventListener("hashchange", aoMudar)
  }, [])

  const nome = !isAdmin && rota === "agentes" ? "Aprovações" : NOMES[rota]
  useEffect(() => {
    document.title = rota === "inicio" ? "Settle · Configurações" : `Settle · ${nome} · Configurações`
  }, [rota, nome])

  const item = (r: Rota, icon: ComponentType<{ className?: string }>) => ({
    label: NOMES[r],
    icon,
    href: `#${r}`,
    active: rota === r,
  })

  const grupos: AppShellGroup[] = [
    {
      items: [
        /* o selo diz qual versão da página está no ar: é como se confere que atualizou */
        { label: "Voltar para a plataforma", icon: ArrowLeftIcon, href: PLATAFORMA, className: "font-medium", badge: `V${VERSAO}` },
      ],
    },
    { items: [{ ...item("inicio", SettingsIcon), label: "Visão geral" }] },
    ...(isAdmin
      ? [
          {
            label: "Licitações",
            items: [
              item("etapas", Columns3Icon),
              item("abas", FolderIcon),
              item("motivos", TextAlignStartIcon),
              item("card", SquareMenuIcon),
              item("email", MailIcon),
            ],
          },
          {
            label: "Organização",
            items: [item("equipe", UsersIcon), item("permissoes", ShieldIcon), item("auditoria", ClockIcon)],
          },
          {
            label: "Inteligência",
            items: [
              /* o contador é da fila de Aprovações, que mora dentro de Agentes */
              { ...item("agentes", SparkleIcon), count: aprovacoes.length },
              item("variaveis", VariableIcon),
            ],
          },
        ]
      : [
          /* Quem não é administrador só responde Aprovações: o item leva direto para a fila. */
          {
            label: "Inteligência",
            items: [{ ...item("agentes", SparkleIcon), label: "Aprovações", count: aprovacoes.length }],
          },
        ]),
  ]

  const Pagina = !isAdmin && SO_ADMIN.includes(rota) ? SemPermissao : PAGINAS[rota]

  return (
    <AppShell
      defaultOpen
      groups={grupos}
      user={USUARIO}
      labels={{ navigation: "Navegação das configurações" }}
      header={
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <h1 className="min-w-0 truncate text-[15px] font-semibold">{nome}</h1>
          <label className="ml-auto flex flex-none items-center gap-2 text-[13px] text-muted-foreground">
            Ver como
            <NativeSelect
              size="sm"
              value={papel}
              onChange={(e) => setPapel(e.target.value as Papel)}
              className="text-foreground"
            >
              {(Object.keys(PAPEIS) as Papel[]).map((p) => (
                <NativeSelectOption key={p} value={p}>
                  {PAPEIS[p]}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </label>
        </div>
      }
    >
      <Pagina key={rota} />
      {/* Settle AI: a mesma da plataforma, presente em qualquer tela. */}
      <SettleAI rota={rota} />
    </AppShell>
  )
}
