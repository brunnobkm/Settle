// Settle · Agentes na plataforma: o protótipo de handoff dos Agentes para o
// desenvolvimento. É a consolidação do que ficou de pé depois de /agentes (conversa
// primeiro), /agentes-rotinas (estrutura primeiro) e do modelo em MODELO.md:
//
// - Funcionalidade é o lugar, agente é quem produz, resultado é o que aparece. A
//   funcionalidade continua existindo sem agente (NOTION.md).
// - A licitação é onde o resultado de um agente vira AI Widget; Agentes e Variáveis é o
//   painel de controle; a Settle AI está em qualquer tela.
// - Variável e fonte são coisas diferentes: a variável tem tipo, instrução, uma ordem de
//   fontes e o que fazer quando não encontrar.
//
// Tudo em memória: recarregar volta o cenário ao início. ?ir=agentes abre em Agentes.

import { BotIcon, SproutIcon, SquareCheckIcon } from "lucide-react"
import type { MouseEvent } from "react"

import { AppShell, type AppShellGroup } from "@/components/ui/app-shell"
import { useNaoPrototipado } from "@/settle/nao-prototipado"
import { USUARIO } from "@/settle/navegacao"

import { AreaAgentes } from "./AreaAgentes"
import { Cabecalho } from "./Cabecalho"
import { EMPRESA } from "./dados"
import { SimuladorProvider, useSim } from "./estado"
import { Janela } from "./Janela"
import { Licitacoes } from "./Licitacoes"
import { ChatLateral, SettleAI } from "./SettleAI"
import { Acompanhamento, Confirmacao, PainelAoLado, PainelSobreposto } from "./Sobreposicoes"
import { Workspace } from "./Workspace"

export default function App() {
  return (
    <SimuladorProvider>
      <Tela />
    </SimuladorProvider>
  )
}

function Tela() {
  useNaoPrototipado()
  const { area, irPara } = useSim()

  const ir = (destino: "agentes" | "lics") => (e: MouseEvent) => {
    e.preventDefault()
    irPara(destino)
  }

  /* Dentro da licitação a sidebar mantém Licitações marcada: é de onde a pessoa veio, e é
     para onde a trilha do topo devolve. */
  const grupos: AppShellGroup[] = [
    {
      label: "Handoff",
      items: [
        { label: "Agentes e Variáveis", icon: BotIcon, href: "#", active: area === "agentes", onClick: ir("agentes") },
        { label: "Licitações Recomendadas", icon: SquareCheckIcon, href: "#", active: area !== "agentes", onClick: ir("lics") },
      ],
    },
    {
      /* O mesmo caminho no protótipo do teste de usabilidade, que segue em HTML até o teste acabar. */
      label: "Teste de usabilidade",
      items: [
        { label: "Agentes e Variáveis", icon: BotIcon, href: "../teste/index.html?ir=agentes" },
        { label: "Licitações Recomendadas", icon: SquareCheckIcon, href: "../teste/index.html?ir=lics" },
      ],
    },
  ]

  return (
    <>
      {/* O painel do resultado (aberto pela lista) e a conversa lateral são colunas do
          layout, como a sidebar da esquerda: empurram a tela inteira em vez de cobrir. */}
      <div className="flex">
        <div className="min-w-0 flex-1">
          <AppShell
            workspace={{ name: EMPRESA, description: "Espaço de trabalho", icon: SproutIcon }}
            groups={grupos}
            user={USUARIO}
            header={<Cabecalho />}
          >
            <div className="mx-auto max-w-[1388px] px-6 pt-6 pb-16 max-sm:px-4">
              {area === "agentes" && <AreaAgentes />}
              {area === "lics" && <Licitacoes />}
              {area === "workspace" && <Workspace />}
            </div>
            <Acompanhamento />
          </AppShell>
        </div>
        <PainelAoLado />
        <ChatLateral />
      </div>
      <PainelSobreposto />
      <Janela />
      <Confirmacao />
      <SettleAI />
    </>
  )
}
