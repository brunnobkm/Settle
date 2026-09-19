// Central de notificações da licitação: avisos, questionamentos, impugnações e
// recursos como cards, dentro da aba Manifestações do workspace.
// Clicar no card abre a mensagem completa; o olho de um anexo abre a sidebar
// auxiliar "Arquivos da licitação" (ou um modal empilhado, quando já há um modal aberto).
// Indicador de "novo": ao SAIR da aba Manifestações, os novos exibidos passam a vistos.

import { useEffect, useState } from "react"
import { InboxIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import {
  NotificationsCenter,
  NotificationsCenterList,
  notificationsCenterTabClassName,
  notificationsCenterTabsListClassName,
} from "@/components/ui/notifications-center"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useNaoPrototipado } from "@/settle/nao-prototipado"

import { CardDeManifestacao } from "./CardDeManifestacao"
import {
  ABAS,
  ABAS_DO_WORKSPACE,
  LICITACAO_ATUAL,
  abaDaCategoria,
  carregarManifestacoes,
  type Anexo,
  type Manifestacao,
} from "./dados"
import { DialogoDaManifestacao, ModalDeArquivo, SidebarDeArquivos, type Visualizacao } from "./Janelas"

export default function App() {
  useNaoPrototipado()

  const [itens, setItens] = useState<Manifestacao[] | null>(null) // null: carregando
  const [secao, setSecao] = useState("manifestacoes")
  const [aba, setAba] = useState("todas")
  // Cards "novos" (não vistos): na primeira visita, os não lidos
  const [novos, setNovos] = useState<Set<string>>(new Set())

  const [abertoId, setAbertoId] = useState<string | null>(null)
  const [lateral, setLateral] = useState<Visualizacao | null>(null)
  const [previa, setPrevia] = useState<Visualizacao | null>(null)

  useEffect(() => {
    let ativo = true
    carregarManifestacoes(LICITACAO_ATUAL.id).then((lista) => {
      if (!ativo) return
      setItens(lista)
      setNovos(new Set(lista.filter((i) => !i.lida).map((i) => i.id)))
    })
    return () => {
      ativo = false
    }
  }, [])

  const lista = itens ?? []
  const aberto = lista.find((i) => i.id === abertoId) ?? null

  function mudarSecao(proxima: string) {
    if (proxima === secao) return
    if (secao === "manifestacoes") setNovos(new Set()) // saiu: os novos exibidos viram vistos
    setSecao(proxima)
  }

  function abrirManifestacao(id: string) {
    setLateral(null) // abrir o modal fecha a sidebar de arquivos
    setAbertoId(id)
    // abrir o card = visto: some a bolinha de "novo" daquele card
    setNovos((atual) => {
      if (!atual.has(id)) return atual
      const proximo = new Set(atual)
      proximo.delete(id)
      return proximo
    })
  }

  // Pelo card: sidebar auxiliar. De dentro do modal a sidebar ficaria atrás dele,
  // então a pré-visualização abre como modal empilhado.
  function visualizarDoCard(item: Manifestacao, indice: number) {
    if (item.anexos?.length) setLateral({ arquivos: item.anexos, indice })
  }
  function visualizarEmModal(arquivos: Anexo[], indice: number) {
    setPrevia({ arquivos, indice })
  }

  const contagem = (id: string) =>
    id === "todas" ? lista.length : lista.filter((i) => abaDaCategoria(i.categoria) === id).length
  const daAba = aba === "todas" ? lista : lista.filter((i) => abaDaCategoria(i.categoria) === aba)

  return (
    <div className="min-h-svh bg-muted text-foreground">
      <main
        className={cn(
          "max-w-190 px-5 pt-9 pb-18 transition-[margin] duration-250 ease-out",
          // com a sidebar auxiliar aberta, o conteúdo divide espaço com ela
          lateral ? "mr-116 ml-6" : "mx-auto"
        )}
      >
        <h1 className="sr-only">Central de notificações da licitação {LICITACAO_ATUAL.label}</h1>

        <Tabs value={secao} onValueChange={mudarSecao} className="gap-0">
          <TabsList aria-label="Seções da licitação" className={cn(notificationsCenterTabsListClassName, "mb-4.5")}>
            {ABAS_DO_WORKSPACE.map((s) => (
              <TabsTrigger key={s.id} value={s.id} className={notificationsCenterTabClassName}>
                {s.label}
                {s.beta && (
                  <Badge variant="warning" className="h-5 rounded-full px-1.5 text-xs font-medium">
                    Versão beta
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {ABAS_DO_WORKSPACE.filter((s) => s.id !== "manifestacoes").map((s) => (
            <TabsContent key={s.id} value={s.id}>
              <section className="flex min-h-55 items-center justify-center rounded-2xl border bg-card p-6 text-center text-sm text-muted-foreground">
                Conteúdo de “{s.label}”: fora do escopo deste protótipo.
              </section>
            </TabsContent>
          ))}

          <TabsContent value="manifestacoes">
            <NotificationsCenter
              aria-label="Manifestações"
              tabsLabel="Tipos de manifestação"
              tabs={ABAS.map((a) => ({ value: a.id, label: a.label, count: itens ? contagem(a.id) : null }))}
              value={aba}
              onValueChange={setAba}
            >
              <NotificationsCenterList
                loading={!itens}
                loadingLabel="Carregando manifestações"
                empty={
                  <Empty className="px-6 py-12">
                    <EmptyHeader>
                      <EmptyMedia variant="icon" className="text-muted-foreground">
                        <InboxIcon />
                      </EmptyMedia>
                      <EmptyTitle className="text-base font-semibold">Sem manifestações</EmptyTitle>
                      <EmptyDescription>Nenhuma manifestação nesta categoria por enquanto.</EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                }
              >
                {daAba.map((item) => (
                  <CardDeManifestacao
                    key={item.id}
                    item={item}
                    novo={novos.has(item.id)}
                    onAbrir={() => abrirManifestacao(item.id)}
                    onVisualizarAnexo={(i) => visualizarDoCard(item, i)}
                  />
                ))}
              </NotificationsCenterList>
            </NotificationsCenter>
          </TabsContent>
        </Tabs>
      </main>

      <SidebarDeArquivos
        visualizacao={lateral}
        onIndice={(indice) => setLateral((v) => v && { ...v, indice })}
        onFechar={() => setLateral(null)}
      />
      <DialogoDaManifestacao
        item={aberto}
        onOpenChange={(abrir) => {
          if (abrir) return
          setAbertoId(null)
          setPrevia(null)
        }}
        onVisualizarAnexo={visualizarEmModal}
      />
      <ModalDeArquivo
        visualizacao={previa}
        onIndice={(indice) => setPrevia((v) => v && { ...v, indice })}
        onFechar={() => setPrevia(null)}
      />
    </div>
  )
}
