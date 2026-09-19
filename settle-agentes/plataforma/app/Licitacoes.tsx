// Licitações Recomendadas: a lista como ela é na plataforma, com um card por cenário
// do protótipo. O card inteiro abre a licitação; Score e Checklist mostram o estado
// do agente que os alimenta.

import { useState } from "react"
import { BellIcon, BookmarkIcon, ClockIcon, FileTextIcon, FolderIcon, LinkIcon, Share2Icon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import {
  LicitacaoCardActions,
  LicitacaoCardAvatars,
  LicitacaoCardContent,
  LicitacaoCardDescription,
  LicitacaoCardField,
  LicitacaoCardHeader,
  LicitacaoCardIconAction,
  LicitacaoCardIconActions,
  LicitacaoCardMeta,
  LicitacaoCardRoot,
  LicitacaoCardSegments,
  LicitacaoCardSelect,
  LicitacaoCardTitle,
  LicitacaoCardValue,
  type LicitacaoCardMetaField,
} from "@/components/ui/licitacao-card"

import { naoSimulado } from "./comum"
import type { Licitacao } from "./dados"
import { useSim } from "./estado"
import { BotaoDaFuncionalidade } from "./Funcionalidade"

export const TIME = [
  { initials: "MC", name: "Michele Costa" },
  { initials: "RS", name: "Rafael Souza" },
]

/* Nota de capacidade de pagamento, com a cor do que ela significa. */
function Capag({ nota }: { nota: string }) {
  if (!nota || nota === "–") return <>–</>
  const n = nota.toLowerCase()
  return (
    <Badge
      variant={n === "c" ? "warning" : n === "d" ? "destructive" : "secondary"}
      className={cn("h-5.5 min-w-5.5 rounded-md px-1.5 font-bold", (n === "a" || n === "b") && "bg-primary/10 text-primary")}
    >
      {nota}
    </Badge>
  )
}

/** Datas, prazo e a grade de metadados da licitação: o mesmo no card e no topo da licitação. */
export function metadados(l: Licitacao): { aside: LicitacaoCardMetaField[][]; fields: LicitacaoCardMetaField[] } {
  return {
    aside: [
      [
        { label: "Adicionada", value: l.adicionada },
        { label: "Atualizada", value: l.atualizada },
      ],
      [
        {
          label: "Envio da proposta",
          value: l.envio,
          tone: "warning",
          icon: <ClockIcon aria-hidden />,
          title: `Prazo de envio da proposta: ${l.envio}`,
        },
      ],
    ],
    fields: [
      { label: "ID", value: l.id },
      { label: "UASG", value: l.uasg },
      { label: "Modalidade", value: l.modalidade },
      { label: "Julgamento", value: l.julgamento },
      { label: "Estado", value: l.estado },
      { label: "Cidade", value: l.cidade },
      { label: "Habitantes", value: l.habitantes },
      { label: "CAPAG Estadual", value: <Capag nota={l.capagE} />, title: `CAPAG Estadual: ${l.capagE}` },
      { label: "CAPAG Municipal", value: <Capag nota={l.capagM} />, title: `CAPAG Municipal: ${l.capagM}` },
      { label: "Portal de disputa", value: l.portal },
    ],
  }
}

/** Segmentos, órgão, objeto, valor e metadados: o miolo do card, reaproveitado no topo da licitação. */
export function MioloDaLicitacao({ l }: { l: Licitacao }) {
  const { aside, fields } = metadados(l)
  return (
    <>
      <LicitacaoCardSegments segments={l.segs} />
      <LicitacaoCardDescription>
        <LicitacaoCardField label="Órgão" tag="ME · EPP">
          {l.org}
        </LicitacaoCardField>
        <LicitacaoCardField label="Objeto">{l.objeto}</LicitacaoCardField>
      </LicitacaoCardDescription>
      <LicitacaoCardValue>R$ {l.valor}</LicitacaoCardValue>
      <LicitacaoCardMeta aside={aside} fields={fields} />
    </>
  )
}

const ACOES_DE_ICONE = [
  { label: "Notificar", icon: <BellIcon /> },
  { label: "Salvar para depois", icon: <BookmarkIcon /> },
  { label: "Copiar link", icon: <LinkIcon /> },
  { label: "Compartilhar", icon: <Share2Icon /> },
  { label: "Documentos", icon: <FileTextIcon /> },
  { label: "Pastas", icon: <FolderIcon /> },
]

function CardDaLicitacao({ l, i }: { l: Licitacao; i: number }) {
  const { abrirLicitacao, enviarParaAnalise } = useSim()
  const [selecionada, setSelecionada] = useState(false)
  return (
    <LicitacaoCardRoot
      role="link"
      tabIndex={0}
      aria-label={`Abrir o cenário: ${l.cenario}`}
      /* O card inteiro abre a licitação. Os controles dentro dele continuam sendo
         deles: clicar em Descartar não pode navegar. */
      onClick={(e) => {
        const alvo = e.target as Element
        // menus e dicas saem do card pelo portal: clique neles não é clique no card
        if (!e.currentTarget.contains(alvo)) return
        if (alvo.closest("button, a, input, [role=checkbox], [data-slot=licitacao-card-avatars]")) return
        abrirLicitacao(i)
      }}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget || (e.key !== "Enter" && e.key !== " ")) return
        e.preventDefault()
        abrirLicitacao(i)
      }}
      /* sobe um pouco e ganha contorno ao passar o mouse: diz que é clicável sem precisar de botão */
      className="cursor-pointer transition-[transform,box-shadow,border-color] duration-150 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-lg focus-visible:-translate-y-0.5 focus-visible:shadow-lg"
    >
      <LicitacaoCardHeader>
        <LicitacaoCardSelect
          label={`Selecionar o edital ${l.n}`}
          checked={selecionada}
          onCheckedChange={(v) => setSelecionada(v === true)}
        />
        <LicitacaoCardTitle>
          <b>{l.cenario}</b>
        </LicitacaoCardTitle>
        <LicitacaoCardActions>
          <Button variant="outline" className="px-3.5 shadow-none" onClick={() => naoSimulado("Descartar")}>
            Descartar
          </Button>
          <Button className="px-3.5" onClick={() => enviarParaAnalise(i, false)}>
            Enviar para análise
          </Button>
          <LicitacaoCardAvatars avatars={TIME} addProps={{ onClick: () => naoSimulado("Adicionar responsável") }} />
          <LicitacaoCardIconActions>
            {ACOES_DE_ICONE.map((a) => (
              <LicitacaoCardIconAction key={a.label} label={a.label} icon={a.icon} onClick={() => naoSimulado(a.label)} />
            ))}
          </LicitacaoCardIconActions>
          <BotaoDaFuncionalidade k="checklist" i={i} />
          <BotaoDaFuncionalidade k="score" i={i} />
        </LicitacaoCardActions>
      </LicitacaoCardHeader>
      <LicitacaoCardContent>
        <MioloDaLicitacao l={l} />
      </LicitacaoCardContent>
    </LicitacaoCardRoot>
  )
}

export function Licitacoes() {
  const { lics } = useSim()
  const visiveis = lics.map((l, i) => ({ l, i })).filter(({ l }) => !l.enviada)
  return (
    <>
      <h1 className="mb-5.5 text-5xl leading-[1.04] font-bold tracking-tight">Recomendadas</h1>
      {visiveis.length ? (
        <ul className="flex flex-col gap-4">
          {visiveis.map(({ l, i }) => (
            <li key={l.n}>
              <CardDaLicitacao l={l} i={i} />
            </li>
          ))}
        </ul>
      ) : (
        /* Enviada, a licitação sai de Recomendadas. Se todas saírem, a lista diz para onde
           foram e devolve o cenário para quem está demonstrando. */
        <Empty className="border border-dashed bg-card px-4 py-14">
          <EmptyHeader>
            <EmptyTitle className="text-[15px] font-semibold">Nada em Recomendadas</EmptyTitle>
            <EmptyDescription>As licitações enviadas estão em Em andamento, área que este protótipo não simula.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              Recomeçar o cenário
            </Button>
          </EmptyContent>
        </Empty>
      )}
    </>
  )
}
