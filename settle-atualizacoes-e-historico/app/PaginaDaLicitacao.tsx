// Detalhes da licitação: a página que abre ao clicar num card de Em andamento, no modelo de
// produção (app.settlegov.com/biddings/<id>): cabeçalho com o edital, o selo "Atualização" e
// as ações; bloco com segmento, órgão, objeto e valor; metadados; notas; itens.
// Montada com o LicitacaoCard do design system (o mesmo de Explorar e Recomendadas).

import { CheckIcon, FolderIcon, LinkIcon, ListChecksIcon, MessageSquareIcon, PlusIcon, Share2Icon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { LicitacaoCard, LicitacaoCardStatusButton } from "@/components/ui/licitacao-card"
import { Textarea } from "@/components/ui/textarea"

import { categoriaDoSegmento, formatarData, formatarMoeda, pessoaPorId, statusPorId, type Licitacao } from "./dados"
import { SeloAtualizacao } from "./Selo"

/** Itens de exemplo: o objeto dividido em lotes, com valores que somam o valor global. */
function itensDe(l: Licitacao) {
  const partes = [0.46, 0.31, 0.23]
  return partes.map((p, i) => {
    const qtd = [1, 12, 40][i]
    const total = l.valorGlobal * p
    return {
      lote: String(i + 1),
      nome: `${["Item principal", "Item complementar", "Serviços acessórios"][i]}: ${l.titulo}`,
      segmento: l.segmentos[0] ?? "-",
      unidades: String(qtd),
      unitario: formatarMoeda(total / qtd),
      total: formatarMoeda(total),
    }
  })
}

export function PaginaDaLicitacao({ licitacao: l }: { licitacao: Licitacao }) {
  const status = statusPorId(l.status)
  const itens = itensDe(l)

  return (
    <div className="mx-auto grid w-full max-w-360 gap-4 px-6 pt-4 pb-16">
      <h1 className="sr-only">Detalhes da licitação {l.id}</h1>
      <LicitacaoCard
        edital={l.codigoEdital}
        badges={<SeloAtualizacao licitacaoId={l.id} />}
        actions={
          <Button variant="outline" className="px-3.5 shadow-none" data-nao-prototipado>
            Descartar
          </Button>
        }
        status={
          status && (
            <LicitacaoCardStatusButton tone={status.tom} data-nao-prototipado>
              {status.rotulo}
            </LicitacaoCardStatusButton>
          )
        }
        avatars={l.responsaveis
          .map(pessoaPorId)
          .filter((p) => !!p)
          .map((p) => ({ name: p!.nome, initials: p!.nome.split(" ").map((n) => n[0]).slice(0, 2).join("") }))}
        addAvatarProps={{ "data-nao-prototipado": true }}
        iconActions={[
          { id: "adicionar", label: "Adicionar", icon: <PlusIcon />, "data-nao-prototipado": true },
          {
            id: "link",
            label: "Copiar link",
            icon: <LinkIcon />,
            onClick: () => toast("Link da licitação copiado", { icon: <CheckIcon className="size-4 text-success" /> }),
          },
          { id: "compartilhar", label: "Compartilhar", icon: <Share2Icon />, "data-nao-prototipado": true },
          { id: "arquivos", label: "3 arquivos anexados", icon: <FolderIcon />, count: 3, "data-nao-prototipado": true },
          { id: "comentarios", label: "Comentários", icon: <MessageSquareIcon />, "data-nao-prototipado": true },
          { id: "checklist", label: "Checklist", icon: <ListChecksIcon />, "data-nao-prototipado": true },
        ]}
        segments={l.segmentos.map((s) => ({ label: s, category: categoriaDoSegmento(s) }))}
        orgao={l.orgao}
        orgaoTag="ME - EPP"
        objeto={l.objeto}
        valor={formatarMoeda(l.valorGlobal)}
        metaAside={[
          [
            { label: "Adicionada", value: "10/05/2026" },
            { label: "Atualizada", value: "20/05/2026" },
          ],
          [{ label: "Envio da proposta", value: l.dataEnvio ? formatarData(l.dataEnvio) : "Sem data" }],
        ]}
        meta={[
          { label: "ID", value: l.id },
          { label: "Julgamento", value: "Menor preço" },
          { label: "Portal de disputa", value: l.objeto.startsWith("[LICITANET]") ? "licitanet.com.br" : "compras.gov.br" },
          { label: "Estado", value: l.estado },
          { label: "CAPAG Estadual", value: "A" },
          { label: "Modalidade", value: "Pregão - Eletrônico" },
          { label: "UASG", value: "-" },
          { label: "Cidade", value: l.cidade },
          { label: "CAPAG Municipal", value: "B" },
          { label: "Habitantes", value: "-" },
        ]}
        items={{
          title: "Itens com Correspondência",
          count: l.itensMatch,
          summary: `Total de itens: ${itens.length}`,
          variant: "boxed",
          columns: [
            { key: "lote", label: "Lote", muted: true, width: 56 },
            { key: "nome", label: "Nome", width: "100%" },
            { key: "segmento", label: "Segmento", width: 140 },
            { key: "unidades", label: "Unidades", align: "right", muted: true, width: 88 },
            { key: "unitario", label: "Valor Unitário", align: "right", width: 140, className: "tabular-nums" },
            { key: "total", label: "Valor Total", align: "right", width: 140, className: "tabular-nums" },
          ],
          rows: itens,
        }}
      />

      <section aria-labelledby="notas" className="grid gap-2">
        <h2 id="notas" className="sr-only">
          Notas
        </h2>
        <Textarea rows={5} placeholder="Escreva aqui..." aria-label="Notas da licitação" className="bg-background" />
      </section>
    </div>
  )
}
