// Licitações em andamento: card canônico. Fonte da verdade visual do card do Board
// (kanban), que é espelhado na tabela, no calendário e no painel de detalhe.
// Especificação completa em ../docs/handoff-desenvolvedor.md.

import { useState } from "react"
import { LinkIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

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
import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { useNaoPrototipado } from "@/settle/nao-prototipado"

import { CardLicitacao } from "./CardLicitacao"
import {
  LICITACAO_INICIAL,
  ORDEM_PADRAO,
  SEGMENTOS_INICIAIS,
  TIPOS,
  linkDaLicitacao,
  novaPropriedadeDemo,
  type Licitacao,
  type PropriedadeDemo,
  type TipoDemo,
} from "./dados"
import { PainelDetalhe } from "./PainelDetalhe"
import { AdicionarPropriedade } from "./PropriedadesDemo"

export default function App() {
  useNaoPrototipado()

  const [licitacao, setLicitacao] = useState<Licitacao>(LICITACAO_INICIAL)
  const [segmentos, setSegmentos] = useState(SEGMENTOS_INICIAIS)
  const [demos, setDemos] = useState<PropriedadeDemo[]>([])
  const [ordem, setOrdem] = useState<string[]>(ORDEM_PADRAO)
  const [selecionado, setSelecionado] = useState(false)
  const [editando, setEditando] = useState<string | null>(null)
  const [editandoInline, setEditandoInline] = useState<string | null>(null)
  const [detalhe, setDetalhe] = useState(false)
  const [confirmarDescarte, setConfirmarDescarte] = useState(false)
  const [descartada, setDescartada] = useState(false)

  const alterar = (patch: Partial<Licitacao>) => setLicitacao((l) => ({ ...l, ...patch }))
  // segmento criado vai para o conjunto disponível para os outros cards (§5.3)
  const criarSegmento = (nome: string) => setSegmentos((s) => (s.includes(nome) ? s : [...s, nome]))

  function adicionarPropriedade(tipo: TipoDemo) {
    const demo = novaPropriedadeDemo(tipo)
    setDemos((d) => [...d, demo])
    setOrdem((o) => [...o, demo.id])
    setEditando(null)
    // abre o editor da propriedade nova (depois que o menu fecha e devolve o foco)
    const editor = TIPOS[tipo].editor
    window.setTimeout(() => {
      if (editor === "texto" || editor === "numero" || editor === "botao") setEditandoInline(demo.id)
      else if (editor && editor !== "alternar") setEditando(demo.id)
    }, 60)
  }

  function removerPropriedade(id: string) {
    setDemos((d) => d.filter((x) => x.id !== id))
    setOrdem((o) => o.filter((k) => k !== id))
  }

  async function copiarLink() {
    try {
      await navigator.clipboard.writeText(linkDaLicitacao(licitacao.id))
    } catch {
      // protótipo: sem permissão de área de transferência, só avisa
    }
    toast("Link copiado", { icon: <LinkIcon className="size-4" /> })
  }

  function descartar() {
    setDescartada(true)
    setSelecionado(false)
    toast("Licitação descartada", {
      icon: <Trash2Icon className="size-4" />,
      duration: 5000,
      action: { label: "Desfazer", onClick: () => setDescartada(false) },
    })
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted p-4">
      <h1 className="sr-only">Licitações em andamento: card</h1>

      <div className="flex flex-col items-center gap-3">
        {descartada ? (
          <Empty className="w-[342px] flex-none rounded-xl border bg-card p-6">
            <EmptyHeader>
              <EmptyTitle className="text-sm">Licitação descartada</EmptyTitle>
              <EmptyDescription className="text-[13px]">
                Edital {licitacao.codigoEdital} saiu das licitações em andamento.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="outline" size="sm" onClick={() => setDescartada(false)}>
                Restaurar card
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <>
            <CardLicitacao
              licitacao={licitacao}
              onChange={alterar}
              segmentosDisponiveis={segmentos}
              onCriarSegmento={criarSegmento}
              demos={demos}
              onChangeDemo={(id, valor) => setDemos((d) => d.map((x) => (x.id === id ? { ...x, valor } : x)))}
              onRemoverDemo={removerPropriedade}
              ordem={ordem}
              onOrdem={setOrdem}
              selecionado={selecionado}
              onSelecionado={setSelecionado}
              editando={editando}
              setEditando={setEditando}
              editandoInline={editandoInline}
              setEditandoInline={setEditandoInline}
              onAbrirDetalhe={() => {
                setEditando(null)
                setDetalhe(true)
              }}
              sobreposto={detalhe || confirmarDescarte}
              onCopiarLink={copiarLink}
              onDescartar={() => {
                setEditando(null)
                setConfirmarDescarte(true)
              }}
            />
            <AdicionarPropriedade
              open={editando === "adicionar"}
              onOpenChange={(open) => setEditando(open ? "adicionar" : null)}
              onAdicionar={adicionarPropriedade}
            />
          </>
        )}
      </div>

      <PainelDetalhe
        open={detalhe}
        onOpenChange={setDetalhe}
        licitacao={licitacao}
        onChange={alterar}
        segmentosDisponiveis={segmentos}
        onCriarSegmento={criarSegmento}
      />

      <AlertDialog open={confirmarDescarte} onOpenChange={setConfirmarDescarte}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Descartar licitação?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={descartar}>
              Descartar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}
