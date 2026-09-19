// Propostas de evidência do Score / Checklist no card de licitação.
// Comparação com abas: Score (5 modelos x 3 temperaturas), Checklist (4 modelos x
// 2 estados) e Filtro (simulação em padrão de produção). Score e Checklist são
// produtos separados (vendidos por cliente): nunca coexistem no mesmo card. Cada
// modelo usa o card COMPLETO (metadados + itens) com o tratamento aplicado por cima.

import { useState } from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useNaoPrototipado } from "@/settle/nao-prototipado"

import { PropostasDeChecklist } from "./Checklist"
import { AcoesDoFiltro, PainelDoFiltro, useFiltro } from "./Filtro"
import { PropostasDeScore } from "./Score"

const ABAS = [
  { chave: "score", rotulo: "Score" },
  { chave: "checklist", rotulo: "Checklist" },
  { chave: "filtro", rotulo: "Filtro" },
]

export default function App() {
  useNaoPrototipado()
  const [aba, setAba] = useState("score")
  const filtro = useFiltro()

  return (
    <div className="min-h-svh bg-muted">
      <main className="mx-auto max-w-365 px-8 pt-7 pb-22.5 max-sm:px-4">
        <Tabs value={aba} onValueChange={setAba} className="gap-0">
          <div className="mb-5.5 flex flex-wrap items-center justify-between gap-4">
            <TabsList className="h-auto rounded-[10px] bg-foreground/8 p-0.75">
              {ABAS.map((a) => (
                <TabsTrigger
                  key={a.chave}
                  value={a.chave}
                  className="h-auto flex-none rounded-lg px-3 py-1.5 data-active:shadow-none"
                >
                  {a.rotulo}
                </TabsTrigger>
              ))}
            </TabsList>
            {aba === "filtro" && <AcoesDoFiltro f={filtro} />}
          </div>

          <TabsContent value="score">
            <PropostasDeScore />
          </TabsContent>
          <TabsContent value="checklist">
            <PropostasDeChecklist />
          </TabsContent>
          <TabsContent value="filtro">
            <PainelDoFiltro f={filtro} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
