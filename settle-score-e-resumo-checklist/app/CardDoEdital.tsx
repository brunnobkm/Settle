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
  LicitacaoCardMeta,
  LicitacaoCardRoot,
  LicitacaoCardSegments,
  LicitacaoCardSelect,
  LicitacaoCardTitle,
  LicitacaoCardValue,
  type LicitacaoCardMetaField,
} from "@/components/ui/licitacao-card"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

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

// botão de ícone suave (fundo cinza, sem borda), como no Figma
const ICONE_SUAVE =
  "size-8 border-0 bg-foreground/8 text-foreground hover:bg-foreground/14 hover:text-foreground"

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
          <LicitacaoCardIconAction label="Salvar" icon={<BookmarkIcon />} className={ICONE_SUAVE} data-nao-prototipado />
          <LicitacaoCardIconAction
            label="Copiar link"
            icon={<LinkIcon />}
            className={cn(ICONE_SUAVE, "text-primary hover:text-primary")}
            data-nao-prototipado
          />
          <LicitacaoCardIconAction label="Compartilhar" icon={<Share2Icon />} className={ICONE_SUAVE} data-nao-prototipado />
          <LicitacaoCardIconAction label="Arquivos" icon={<FolderIcon />} className={ICONE_SUAVE} data-nao-prototipado />
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

// medidas do Figma: rótulo 14px, caixa com raio de 14px
const CAIXA_DE_METADADOS =
  "rounded-xl [&_dt]:text-sm [&_dt]:leading-5 [&_dd]:leading-5 [&>dl]:gap-x-6 [&>dl]:gap-y-4 [&>dl]:px-3.5 [&>dl]:py-3"

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

/** Duas caixas: datas à esquerda e a grade de 5 colunas à direita. */
function Metadados() {
  return (
    <div className="flex gap-2 max-[1200px]:flex-col">
      <LicitacaoCardMeta
        fields={DATAS.map(paraCampo)}
        className={cn(CAIXA_DE_METADADOS, "flex-none [&>dl]:grid-cols-[max-content_max-content] [&>dl]:gap-x-8")}
      />
      <LicitacaoCardMeta fields={METADADOS.map(paraCampo)} className={cn(CAIXA_DE_METADADOS, "min-w-0 flex-1")} />
    </div>
  )
}

/** Grade única com datas + metadados (usada quando o score ocupa o lugar das datas). */
export function GradeDeMetadadosCompleta() {
  return (
    <LicitacaoCardMeta
      fields={[...DATAS, ...METADADOS].map(paraCampo)}
      className={cn(CAIXA_DE_METADADOS, "min-w-0 flex-1")}
    />
  )
}

/* ------------------------------------------------------------------ */
/* Itens                                                               */
/* ------------------------------------------------------------------ */

const CELULA = "h-9 border-r px-2 py-2 text-xs leading-4 text-muted-foreground last:border-r-0"
const TITULO_DA_COLUNA = "h-auto border-r px-2 py-2 text-sm font-medium last:border-r-0"

function TabelaDeItens({ segmentos }: { segmentos: string[] }) {
  return (
    <section aria-label="Itens com Correspondência" className="overflow-hidden rounded-lg border bg-card">
      <div className="flex items-center justify-between gap-3 border-b p-2">
        <div className="flex items-center gap-1.5">
          <h3 className="text-base leading-6 font-semibold">Itens com Correspondência</h3>
          <Badge variant="secondary" className="rounded-md bg-foreground/10 px-1.5 text-foreground tabular-nums">
            {ITENS_COM_CORRESPONDENCIA}
          </Badge>
        </div>
        <span className="text-sm text-muted-foreground">Total de itens: {TOTAL_DE_ITENS}</span>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead scope="col" className={cn(TITULO_DA_COLUNA, "w-14")}>
              Lote
            </TableHead>
            <TableHead scope="col" className={cn(TITULO_DA_COLUNA, "w-full")}>
              Nome
            </TableHead>
            <TableHead scope="col" className={TITULO_DA_COLUNA}>
              Segmento
            </TableHead>
            <TableHead scope="col" className={cn(TITULO_DA_COLUNA, "w-22.5")}>
              Unidades
            </TableHead>
            <TableHead scope="col" className={cn(TITULO_DA_COLUNA, "w-37.5")}>
              Valor Unitário
            </TableHead>
            <TableHead scope="col" className={cn(TITULO_DA_COLUNA, "w-42.5")}>
              Valor Total
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ITENS.map((item, i) => (
            <TableRow key={i}>
              <TableCell className={CELULA}>{item.lote}</TableCell>
              <TableCell className={CELULA}>{item.nome}</TableCell>
              <TableCell className={CELULA}>
                <LicitacaoCardSegments segments={segmentos} className="flex-nowrap gap-2" />
              </TableCell>
              <TableCell className={cn(CELULA, "tabular-nums")}>{item.unidades}</TableCell>
              <TableCell className={cn(CELULA, "tabular-nums")}>{item.unitario}</TableCell>
              <TableCell className={cn(CELULA, "tabular-nums")}>{item.total}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
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
