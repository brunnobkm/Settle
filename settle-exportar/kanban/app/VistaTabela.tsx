// Visão Tabela: todas as licitações em linhas. A ordem das colunas espelha as
// propriedades do card; Etapa (conceito do kanban) fica no fim como contexto. Clicar
// em qualquer ponto de uma célula editável abre o editor da propriedade.

import { useState, type ReactNode } from "react"
import { CircleAlertIcon, ClockIcon, LinkIcon, Trash2Icon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DataTable, DataTableCellFrame, type DataTableColumn } from "@/components/ui/data-table"
import { PropertyChip, PropertyEmpty, PropertyInlineEdit } from "@/components/ui/property-list"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

import {
  avisoDePrazo,
  formatarData,
  formatarMoeda,
  lerValor,
  pessoaPorId,
  resultadoPorId,
  statusPorId,
  urgenciaDaData,
  valorParaInput,
  type Licitacao,
} from "./dados"
import {
  CalendarioEnvio,
  ChipSegmento,
  EditorCidade,
  ListaPessoas,
  ListaSegmentos,
  MenuDeClique,
  OpcoesEtapa,
  OpcoesResultado,
  OpcoesStatus,
  PopoverEditor,
  Selo,
  SeloEtapa,
} from "./editores"

type Props = {
  licitacoes: Licitacao[]
  onChange: (id: string, patch: Partial<Licitacao>) => void
  segmentosDisponiveis: string[]
  onCriarSegmento: (nome: string) => void
  onAbrir: (l: Licitacao) => void
  onCopiarLink: (l: Licitacao) => void
  onDescartar: (l: Licitacao) => void
  /** Resultado só pode ser definido em "Resultados Finais": avisa nas outras etapas. */
  onResultadoBloqueado: () => void
}

/** Célula inteira clicável (gatilho do editor). */
const CELULA = "cursor-pointer hover:bg-foreground/4 aria-expanded:bg-muted"

export function VistaTabela(props: Props) {
  const { licitacoes, onChange } = props
  // editor aberto: "<id>:<coluna>"
  const [editando, setEditando] = useState<string | null>(null)
  const chave = (l: Licitacao, coluna: string) => `${l.id}:${coluna}`
  const aberto = (l: Licitacao, coluna: string) => editando === chave(l, coluna)
  const abrir = (l: Licitacao, coluna: string) => (open: boolean) => setEditando(open ? chave(l, coluna) : null)
  const fechar = () => setEditando(null)

  /** Célula com editor em popover. */
  const celulaPopover = (
    l: Licitacao,
    coluna: string,
    conteudo: ReactNode,
    editor: ReactNode,
    opcoes: { wrap?: boolean; className?: string; rotulo: string; largura?: string } = { rotulo: "" }
  ) => (
    <PopoverEditor
      open={aberto(l, coluna)}
      onOpenChange={abrir(l, coluna)}
      className={opcoes.largura}
      gatilho={
        <DataTableCellFrame asChild wrap={opcoes.wrap} className={cn(CELULA, opcoes.className)}>
          <button type="button" aria-label={opcoes.rotulo}>
            {conteudo}
          </button>
        </DataTableCellFrame>
      }
    >
      {editor}
    </PopoverEditor>
  )

  /** Célula com menu de seleção única. */
  const celulaMenu = (l: Licitacao, coluna: string, conteudo: ReactNode, opcoes: ReactNode, rotulo: string) => (
    <MenuDeClique
      open={aberto(l, coluna)}
      onOpenChange={abrir(l, coluna)}
      className="min-w-60"
      gatilho={
        <DataTableCellFrame asChild className={CELULA}>
          <button type="button" aria-label={rotulo}>
            {conteudo}
          </button>
        </DataTableCellFrame>
      }
    >
      {opcoes}
    </MenuDeClique>
  )

  /** Célula de texto editada na própria célula. */
  const celulaTexto = (
    l: Licitacao,
    coluna: string,
    conteudo: ReactNode,
    campo: { rotulo: string; valor: string; multiline?: boolean; prefixo?: string; salvar: (v: string) => void },
    className?: string
  ) =>
    aberto(l, coluna) ? (
      <DataTableCellFrame wrap className="rounded-xs bg-muted ring-2 ring-ring ring-inset">
        <PropertyInlineEdit
          label={campo.rotulo}
          defaultValue={campo.valor}
          multiline={campo.multiline}
          prefix={campo.prefixo}
          inputMode={campo.prefixo ? "decimal" : undefined}
          onCommit={(v) => {
            campo.salvar(v)
            fechar()
          }}
          onCancel={fechar}
        />
      </DataTableCellFrame>
    ) : (
      <DataTableCellFrame asChild wrap className={cn(CELULA, className)}>
        <button type="button" aria-label={`${campo.rotulo}: ${campo.valor}. Editar`} onClick={() => setEditando(chave(l, coluna))}>
          {conteudo}
        </button>
      </DataTableCellFrame>
    )

  const colunas: DataTableColumn<Licitacao>[] = [
    {
      id: "codigoEdital",
      header: "Edital",
      width: 150,
      cell: (l) => <span className="font-mono">{l.codigoEdital}</span>,
    },
    {
      id: "segmentos",
      header: "Segmento",
      width: 220,
      frame: false,
      cell: (l) =>
        celulaPopover(
          l,
          "segmentos",
          l.segmentos.length ? (
            l.segmentos.map((s) => <ChipSegmento key={s} nome={s} />)
          ) : (
            <PropertyEmpty>Adicionar segmento</PropertyEmpty>
          ),
          <ListaSegmentos
            selecionados={l.segmentos}
            disponiveis={props.segmentosDisponiveis}
            onAlternar={(s) =>
              onChange(l.id, {
                segmentos: l.segmentos.includes(s) ? l.segmentos.filter((x) => x !== s) : [...l.segmentos, s],
              })
            }
            onCriar={(nome) => {
              props.onCriarSegmento(nome)
              onChange(l.id, { segmentos: [...l.segmentos, nome] })
            }}
          />,
          { wrap: true, rotulo: `Segmentos: ${l.segmentos.join(", ") || "nenhum"}. Editar` }
        ),
    },
    {
      id: "orgao",
      header: "Órgão",
      width: 260,
      wrap: true,
      frame: false,
      cell: (l) =>
        celulaTexto(
          l,
          "orgao",
          l.orgao ? <span className="font-semibold break-words">{l.orgao}</span> : <PropertyEmpty>Adicionar órgão</PropertyEmpty>,
          { rotulo: "Órgão", valor: l.orgao, salvar: (v) => onChange(l.id, { orgao: v.trim() }) },
          "font-semibold"
        ),
    },
    {
      id: "objeto",
      header: "Objeto",
      width: 320,
      wrap: true,
      frame: false,
      cell: (l) =>
        celulaTexto(
          l,
          "objeto",
          l.objeto ? <span className="break-words">{l.objeto}</span> : <PropertyEmpty>Adicionar objeto</PropertyEmpty>,
          { rotulo: "Objeto", valor: l.objeto, multiline: true, salvar: (v) => onChange(l.id, { objeto: v.trim() }) }
        ),
    },
    {
      id: "status",
      header: "Status do edital",
      width: 200,
      frame: false,
      cell: (l) => {
        const s = statusPorId(l.status)
        return celulaMenu(
          l,
          "status",
          s ? <Selo tom={s.tom}>{s.rotulo}</Selo> : <PropertyEmpty>Definir status</PropertyEmpty>,
          <OpcoesStatus
            valor={l.status}
            onChange={(v) => {
              onChange(l.id, { status: v })
              fechar()
            }}
          />,
          `Status do edital: ${s?.rotulo ?? "não definido"}. Alterar`
        )
      },
    },
    {
      id: "responsaveis",
      header: "Responsável",
      width: 260,
      wrap: true,
      frame: false,
      cell: (l) => {
        const pessoas = l.responsaveis.map(pessoaPorId).filter((p) => !!p)
        return celulaPopover(
          l,
          "responsaveis",
          pessoas.length ? (
            <span className="flex flex-wrap gap-1">
              {pessoas.map((p) => (
                <PropertyChip key={p.id}>{p.nome}</PropertyChip>
              ))}
            </span>
          ) : (
            <PropertyEmpty>Sem responsáveis</PropertyEmpty>
          ),
          <ListaPessoas
            selecionados={l.responsaveis}
            onAlternar={(id) =>
              onChange(l.id, {
                responsaveis: l.responsaveis.includes(id) ? l.responsaveis.filter((x) => x !== id) : [...l.responsaveis, id],
              })
            }
          />,
          { wrap: true, rotulo: `Responsáveis: ${pessoas.map((p) => p.nome).join(", ") || "nenhum"}. Editar` }
        )
      },
    },
    {
      id: "dataEnvio",
      header: "Envio da proposta",
      width: 150,
      frame: false,
      cell: (l) => {
        const u = urgenciaDaData(l.dataEnvio)
        const aviso = avisoDePrazo(u)
        return celulaPopover(
          l,
          "dataEnvio",
          l.dataEnvio ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 tabular-nums [&>svg]:size-3.5",
                u.tom === "hoje" && "font-medium text-destructive",
                u.tom === "semana" && "font-medium text-warning-strong"
              )}
            >
              {u.tom === "hoje" && <CircleAlertIcon aria-hidden />}
              {u.tom === "semana" && <ClockIcon aria-hidden />}
              {formatarData(l.dataEnvio)}
            </span>
          ) : (
            <PropertyEmpty>Sem data programada</PropertyEmpty>
          ),
          <CalendarioEnvio
            valor={l.dataEnvio}
            onEscolher={(iso) => {
              onChange(l.id, { dataEnvio: iso })
              fechar()
            }}
          />,
          {
            largura: "min-w-60",
            rotulo: l.dataEnvio
              ? `Envio da proposta: ${formatarData(l.dataEnvio)}${aviso ? `, ${aviso}` : ""}. Alterar`
              : "Sem data programada. Definir envio da proposta",
          }
        )
      },
    },
    {
      id: "local",
      header: "Cidade e Estado",
      width: 170,
      wrap: true,
      frame: false,
      cell: (l) =>
        celulaPopover(
          l,
          "local",
          <span>
            {l.cidade} <span className="text-muted-foreground">•</span> {l.estado}
          </span>,
          <EditorCidade idBase={`tabela-cidade-${l.id}`} cidade={l.cidade} estado={l.estado} onChange={(p) => onChange(l.id, p)} />,
          { wrap: true, largura: "min-w-60", rotulo: `Cidade e Estado: ${l.cidade}, ${l.estado}. Alterar` }
        ),
    },
    {
      id: "valor",
      header: "Valor global",
      width: 150,
      frame: false,
      cell: (l) =>
        celulaTexto(
          l,
          "valor",
          <span className="ml-auto tabular-nums">{formatarMoeda(l.valorGlobal)}</span>,
          {
            rotulo: "Valor global",
            valor: valorParaInput(l.valorGlobal),
            prefixo: "R$",
            salvar: (v) => {
              const lido = lerValor(v)
              if (lido != null) onChange(l.id, { valorGlobal: lido })
            },
          },
          "justify-end text-right"
        ),
    },
    {
      id: "etapa",
      header: "Etapa",
      width: 220,
      frame: false,
      cell: (l) =>
        celulaMenu(
          l,
          "etapa",
          <SeloEtapa etapa={l.etapa} />,
          <OpcoesEtapa
            valor={l.etapa}
            onChange={(v) => {
              onChange(l.id, { etapa: v })
              fechar()
            }}
          />,
          "Etapa. Alterar"
        ),
    },
    {
      id: "resultado",
      header: "Resultado",
      width: 200,
      frame: false,
      cell: (l) => {
        const r = resultadoPorId(l.resultado)
        const conteudo = r ? <Selo tom={r.tom}>{r.rotulo}</Selo> : <PropertyEmpty>Definir resultado</PropertyEmpty>
        const rotulo = `Resultado: ${r?.rotulo ?? "não definido"}. Alterar`
        // fora de "Resultados Finais" a célula continua clicável, mas só avisa a regra
        if (l.etapa !== "resultados") {
          return (
            <DataTableCellFrame asChild className={CELULA}>
              <button type="button" aria-label={rotulo} onClick={props.onResultadoBloqueado}>
                {conteudo}
              </button>
            </DataTableCellFrame>
          )
        }
        return celulaMenu(
          l,
          "resultado",
          conteudo,
          <OpcoesResultado
            valor={l.resultado}
            onChange={(v) => {
              onChange(l.id, { resultado: v })
              fechar()
            }}
          />,
          rotulo
        )
      },
    },
    {
      id: "acoes",
      header: "Ações",
      width: 96,
      cell: (l) => (
        <span className="-mx-2 flex items-center gap-1">
          <AcaoDaLinha rotulo="Copiar link" onClick={() => props.onCopiarLink(l)}>
            <LinkIcon />
          </AcaoDaLinha>
          <AcaoDaLinha rotulo="Descartar" onClick={() => props.onDescartar(l)}>
            <Trash2Icon />
          </AcaoDaLinha>
        </span>
      ),
    },
  ]

  return (
    <DataTable
      columns={colunas}
      rows={licitacoes}
      getRowId={(l) => l.id}
      getRowLabel={(l) => `Edital ${l.codigoEdital}`}
      onOpenRow={props.onAbrir}
      labels={{ openRow: "Abrir", empty: "Nenhuma licitação em andamento." }}
      className="h-full shadow-none"
    />
  )
}

function AcaoDaLinha({ rotulo, onClick, children }: { rotulo: string; onClick: () => void; children: ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon-xs" aria-label={rotulo} onClick={onClick} className="text-muted-foreground hover:text-foreground">
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{rotulo}</TooltipContent>
    </Tooltip>
  )
}
