// Card completo do edital (barra de ações + cabeçalho + metadados + itens), montado
// com as peças do LicitacaoCard. Cada proposta aplica o tratamento por cima, em
// "encaixes": faixa no topo, ação extra na barra, módulo no topo, bloco ao lado
// do cabeçalho, metadados substitutos e bloco antes dos itens.

import type { ReactNode } from "react"
import { BookmarkIcon, ClockIcon, FolderIcon, LinkIcon, Share2Icon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  LicitacaoCardActions,
  LicitacaoCardAvatars,
  LicitacaoCardContent,
  LicitacaoCardDescription,
  LicitacaoCardField,
  LicitacaoCardHeader,
  LicitacaoCardIconAction,
  LicitacaoCardIconActions,
  LicitacaoCardItems,
  LicitacaoCardMeta,
  LicitacaoCardRoot,
  LicitacaoCardSegments,
  LicitacaoCardSelect,
  LicitacaoCardTitle,
  LicitacaoCardValue,
  type LicitacaoCardItemsColumn,
  type LicitacaoCardMetaField,
} from "@/components/ui/licitacao-card"
import { Separator } from "@/components/ui/separator"

import {
  DATAS,
  ITENS,
  ITENS_COM_CORRESPONDENCIA,
  METADADOS,
  TOTAL_DE_ITENS,
  type CampoDeMetadado,
  type Edital,
} from "./dados"

/* ------------------------------------------------------------------ */
/* Barra de ações                                                      */
/* ------------------------------------------------------------------ */

export function SeparadorDaBarra() {
  return <Separator orientation="vertical" className="data-vertical:h-8 data-vertical:self-center" />
}

function BarraDeAcoes({ edital, acaoExtra }: { edital: string; acaoExtra?: ReactNode }) {
  return (
    <LicitacaoCardHeader className="gap-2 p-2">
      <LicitacaoCardSelect label={`Selecionar edital ${edital}`} className="size-5" />
      <LicitacaoCardTitle className="text-lg leading-7 font-normal">
        <b>Edital</b> <span className="text-muted-foreground">{edital}</span>
      </LicitacaoCardTitle>
      <LicitacaoCardActions className="justify-end gap-2">
        <Button variant="secondary" size="sm" className="px-3" data-nao-prototipado>
          Descartar
        </Button>
        <Button size="sm" className="px-3" data-nao-prototipado>
          Enviar para análise
        </Button>
        <SeparadorDaBarra />
        <LicitacaoCardAvatars
          avatars={[]}
          addProps={{ "data-nao-prototipado": true, className: "bg-foreground/10 text-foreground ring-0" }}
        />
        <SeparadorDaBarra />
        <LicitacaoCardIconActions className="ml-0 gap-2">
          {/* botões de ícone suaves (fundo cinza, sem borda), como no Figma */}
          <LicitacaoCardIconAction variant="soft" label="Salvar" icon={<BookmarkIcon />} data-nao-prototipado />
          <LicitacaoCardIconAction
            variant="soft"
            label="Copiar link"
            icon={<LinkIcon />}
            className="text-primary hover:text-primary"
            data-nao-prototipado
          />
          <LicitacaoCardIconAction variant="soft" label="Compartilhar" icon={<Share2Icon />} data-nao-prototipado />
          <LicitacaoCardIconAction variant="soft" label="Arquivos" icon={<FolderIcon />} data-nao-prototipado />
        </LicitacaoCardIconActions>
        {acaoExtra && (
          <>
            <SeparadorDaBarra />
            {acaoExtra}
          </>
        )}
      </LicitacaoCardActions>
    </LicitacaoCardHeader>
  )
}

/* ------------------------------------------------------------------ */
/* Cabeçalho (segmentos, órgão, objeto, valor)                         */
/* ------------------------------------------------------------------ */

function Cabecalho({ edital, className }: { edital: Edital; className?: string }) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-2 rounded-lg border p-2", className)}>
      <LicitacaoCardSegments segments={edital.segmentos} className="gap-2" />
      <LicitacaoCardDescription className="gap-2">
        <LicitacaoCardField label="Órgão" tag="ME - EPP" className="leading-5 [&>span:first-child]:font-bold">
          {edital.orgao}
        </LicitacaoCardField>
        <LicitacaoCardField label="Objeto" className="leading-5 [&>span:first-child]:font-bold">
          {edital.objeto}
        </LicitacaoCardField>
      </LicitacaoCardDescription>
      <LicitacaoCardValue className="text-base leading-6">{edital.valor}</LicitacaoCardValue>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Metadados                                                           */
/* ------------------------------------------------------------------ */

function paraCampo(c: CampoDeMetadado): LicitacaoCardMetaField {
  if (c.capag) {
    return {
      label: c.rotulo,
      value: (
        <Badge
          variant={c.capag === "boa" ? "success" : "warning"}
          className="h-5 rounded-md px-1.5"
          aria-label={`Nota ${c.valor}`}
        >
          {c.valor}
        </Badge>
      ),
    }
  }
  if (c.prazo) {
    return {
      label: c.rotulo,
      value: c.valor,
      tone: "warning",
      icon: <ClockIcon aria-hidden />,
      title: `Prazo de envio da proposta: ${c.valor}`,
    }
  }
  return { label: c.rotulo, value: c.valor }
}

// datas em duas colunas (Adicionada | Atualizada, depois Envio da proposta)
const DATAS_EM_LINHAS = [DATAS.slice(0, 2), DATAS.slice(2)].map((linha) => linha.map(paraCampo))

/** Duas caixas (medidas do Figma): datas à esquerda e a grade de 5 colunas à direita. */
function Metadados() {
  return (
    <LicitacaoCardMeta
      variant="boxed"
      aside={DATAS_EM_LINHAS}
      fields={METADADOS.map(paraCampo)}
      className="max-[1200px]:flex-col"
    />
  )
}

/** Grade única com datas + metadados (usada quando o score ocupa o lugar das datas). */
export function GradeDeMetadadosCompleta() {
  return (
    <LicitacaoCardMeta variant="boxed" fields={[...DATAS, ...METADADOS].map(paraCampo)} className="min-w-0 flex-1" />
  )
}

/* ------------------------------------------------------------------ */
/* Itens                                                               */
/* ------------------------------------------------------------------ */

const COLUNAS_DOS_ITENS: LicitacaoCardItemsColumn[] = [
  { key: "lote", label: "Lote", width: "3.5rem" },
  { key: "nome", label: "Nome", width: "100%" },
  { key: "segmento", label: "Segmento" },
  { key: "unidades", label: "Unidades", width: "5.625rem", className: "tabular-nums" },
  { key: "unitario", label: "Valor Unitário", width: "9.375rem", className: "tabular-nums" },
  { key: "total", label: "Valor Total", width: "10.625rem", className: "tabular-nums" },
]

function TabelaDeItens({ segmentos }: { segmentos: string[] }) {
  return (
    <LicitacaoCardItems
      variant="boxed"
      title="Itens com Correspondência"
      count={ITENS_COM_CORRESPONDENCIA}
      summary={`Total de itens: ${TOTAL_DE_ITENS}`}
      columns={COLUNAS_DOS_ITENS}
      rows={ITENS.map((item) => ({
        ...item,
        segmento: <LicitacaoCardSegments segments={segmentos} className="flex-nowrap gap-2" />,
      }))}
    />
  )
}

/* ------------------------------------------------------------------ */
/* Card                                                                */
/* ------------------------------------------------------------------ */

export type Encaixes = {
  /** Faixa colada no topo do card, acima da barra de ações. */
  faixaNoTopo?: ReactNode
  /** Ação extra no fim da barra de ações (depois de um separador). */
  acaoExtra?: ReactNode
  /** Módulo antes do cabeçalho. */
  moduloNoTopo?: ReactNode
  /** Bloco à esquerda do cabeçalho, na mesma linha. */
  aoLadoDoCabecalho?: ReactNode
  /** Substitui a linha de metadados. */
  metadados?: ReactNode
  /** Bloco entre os metadados e a tabela de itens. */
  antesDosItens?: ReactNode
}

export function CardDoEdital({
  edital,
  faixaNoTopo,
  acaoExtra,
  moduloNoTopo,
  aoLadoDoCabecalho,
  metadados,
  antesDosItens,
  segmentosDosItens = ["Segmento 1", "Segmento 2"],
}: Encaixes & { edital: Edital; segmentosDosItens?: string[] }) {
  return (
    <LicitacaoCardRoot className="gap-0 rounded-xl py-0">
      {faixaNoTopo}
      <BarraDeAcoes edital={edital.edital} acaoExtra={acaoExtra} />
      <LicitacaoCardContent className="gap-2 px-2 pt-0 pb-2">
        {moduloNoTopo}
        {aoLadoDoCabecalho ? (
          <div className="flex items-stretch gap-2 max-[900px]:flex-col">
            {aoLadoDoCabecalho}
            <Cabecalho edital={edital} className="flex-1" />
          </div>
        ) : (
          <Cabecalho edital={edital} />
        )}
        {metadados ?? <Metadados />}
        {antesDosItens}
        <TabelaDeItens segmentos={segmentosDosItens} />
      </LicitacaoCardContent>
    </LicitacaoCardRoot>
  )
}
