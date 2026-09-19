// Tabela modelo padrão: template de tabela completa (base da Análise Técnica no
// Figma + recursos do Notion). Colunas com menu (renomear, trocar tipo, ordenar,
// filtrar, agrupar, quebrar texto, ocultar, inserir, duplicar, excluir), colunas
// redimensionáveis e reordenáveis, linhas reordenáveis, edição por tipo de célula,
// agregações no rodapé, seleção com ações em lote e painel "Abrir".

import { useMemo, useState } from "react"
import { CopyIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { ActionBarButton } from "@/components/ui/action-bar"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useNaoPrototipado } from "@/settle/nao-prototipado"

import { Celula, CelulaTitulo, ProvedorDeAcoes, RotuloDoGrupo, type AcoesDaTabela } from "./Celula"
import {
  COLUNAS_INICIAIS,
  TIPOS,
  agrupar,
  filtroTemEfeito,
  gerarLinhas,
  linhasVisiveis,
  novaColuna,
  novoId,
  operadoresPara,
  trocarTipo,
  valorInicial,
  type Coluna,
  type Filtro,
  type Linha,
  type Ordenacao,
} from "./dados"
import { MenuDaColuna, MenuDaLinha, NovaColuna, RodapeDaColuna, type ApiDasColunas } from "./Menus"

const mover = <T extends { id: string }>(lista: T[], de: string, para: string) => {
  const i = lista.findIndex((x) => x.id === de)
  const j = lista.findIndex((x) => x.id === para)
  if (i < 0 || j < 0) return lista
  const copia = [...lista]
  const [item] = copia.splice(i, 1)
  copia.splice(j, 0, item)
  return copia
}
const copiarValor = <V,>(v: V): V => (Array.isArray(v) ? ([...v] as V) : v)

export default function App() {
  useNaoPrototipado()

  const [colunas, setColunas] = useState<Coluna[]>(COLUNAS_INICIAIS)
  const [linhas, setLinhas] = useState<Linha[]>(() => gerarLinhas(100))
  const [ordenacao, setOrdenacao] = useState<Ordenacao | null>(null)
  const [filtros, setFiltros] = useState<Filtro[]>([])
  const [agrupadoPor, setAgrupadoPor] = useState<string | null>(null)
  const [recolhidos, setRecolhidos] = useState<string[]>([])
  const [selecionadas, setSelecionadas] = useState<string[]>([])
  const [aberta, setAberta] = useState<string | null>(null)
  const [novaColunaAberta, setNovaColunaAberta] = useState(false)

  const colunaTitulo = colunas.find((c) => c.title) ?? colunas[0]
  const tituloDe = (l: Linha) => String(l.valores[colunaTitulo.id] ?? "") || "Sem título"
  const visiveis = colunas.filter((c) => !c.hidden)
  const dados = useMemo(() => linhasVisiveis(linhas, colunas, filtros, ordenacao), [linhas, colunas, filtros, ordenacao])
  const colunaDoGrupo = agrupadoPor ? colunas.find((c) => c.id === agrupadoPor) : undefined
  const linhaAberta = linhas.find((l) => l.id === aberta)

  /* ---------------- linhas ---------------- */

  const atualizarColuna = (colId: string, fn: (c: Coluna) => Coluna) =>
    setColunas((cs) => cs.map((c) => (c.id === colId ? fn(c) : c)))

  const acoes: AcoesDaTabela = {
    definirValor: (linhaId, colId, valor) =>
      setLinhas((ls) => ls.map((l) => (l.id === linhaId ? { ...l, valores: { ...l.valores, [colId]: valor } } : l))),
    atualizarColuna,
    removerOpcao: (colId, opcaoId) => {
      atualizarColuna(colId, (c) => ({ ...c, options: (c.options ?? []).filter((o) => o.id !== opcaoId) }))
      setLinhas((ls) =>
        ls.map((l) => {
          const v = l.valores[colId]
          if (Array.isArray(v)) return { ...l, valores: { ...l.valores, [colId]: v.filter((x) => x !== opcaoId) } }
          return v === opcaoId ? { ...l, valores: { ...l.valores, [colId]: null } } : l
        })
      )
    },
    excluirLinha: (id) => excluirLinhas([id]),
    tituloDe,
  }

  function excluirLinhas(ids: string[]) {
    setLinhas((ls) => ls.filter((l) => !ids.includes(l.id)))
    setSelecionadas((s) => s.filter((id) => !ids.includes(id)))
    if (aberta && ids.includes(aberta)) setAberta(null)
  }
  function duplicarLinhas(ids: string[]) {
    setLinhas((ls) =>
      ls.flatMap((l) =>
        ids.includes(l.id)
          ? [l, { id: novoId("r"), valores: Object.fromEntries(Object.entries(l.valores).map(([k, v]) => [k, copiarValor(v)])) }]
          : [l]
      )
    )
  }
  function adicionarLinha() {
    setLinhas((ls) => [...ls, { id: novoId("r"), valores: Object.fromEntries(colunas.map((c) => [c.id, valorInicial(c)])) }])
  }

  /* ---------------- colunas ---------------- */

  const api: ApiDasColunas = {
    renomear: (colId, nome) => atualizarColuna(colId, (c) => ({ ...c, name: nome })),
    trocarTipo: (colId, tipo) => {
      const col = colunas.find((c) => c.id === colId)
      if (!col) return
      const r = trocarTipo(col, tipo, linhas)
      atualizarColuna(colId, () => r.coluna)
      setLinhas(r.linhas)
      setFiltros((fs) => fs.filter((f) => f.col !== colId))
    },
    ordenar: (colId, dir) => setOrdenacao(dir ? { col: colId, dir } : null),
    definirFiltro: (colId, patch) =>
      setFiltros((fs) => {
        if (patch === null) return fs.filter((f) => f.col !== colId)
        const atual = fs.find((f) => f.col === colId)
        if (atual) return fs.map((f) => (f.col === colId ? { ...f, ...patch } : f))
        const col = colunas.find((c) => c.id === colId)
        const op = col ? operadoresPara(col.type)[0][0] : "contains"
        return [...fs, { col: colId, op, value: "", ...patch }]
      }),
    agrupar: (colId) => {
      setAgrupadoPor(colId)
      setRecolhidos([])
    },
    alternarQuebra: (colId) => atualizarColuna(colId, (c) => ({ ...c, wrap: !c.wrap })),
    ocultar: (colId, oculta) => atualizarColuna(colId, (c) => ({ ...c, hidden: oculta })),
    inserir: (posicao, nome, tipo) =>
      setColunas((cs) => {
        // "Adicionar coluna" insere antes das colunas de ação; "Inserir à esquerda/direita" usa a posição exata
        let pos = posicao
        if (pos === null) {
          const primeiraDeAcao = cs.findIndex((c) => c.system)
          pos = primeiraDeAcao < 0 ? cs.length : primeiraDeAcao
        }
        const copia = [...cs]
        copia.splice(pos, 0, novaColuna(nome, tipo))
        return copia
      }),
    duplicar: (colId) => {
      const col = colunas.find((c) => c.id === colId)
      if (!col) return
      const copia: Coluna = { ...col, id: novoId("c"), name: `${col.name} (cópia)`, title: false, options: col.options?.map((o) => ({ ...o })) }
      setColunas((cs) => {
        const i = cs.findIndex((c) => c.id === colId)
        return [...cs.slice(0, i + 1), copia, ...cs.slice(i + 1)]
      })
      setLinhas((ls) => ls.map((l) => ({ ...l, valores: { ...l.valores, [copia.id]: copiarValor(l.valores[colId]) } })))
    },
    excluir: (colId) => {
      setColunas((cs) => cs.filter((c) => c.id !== colId))
      if (ordenacao?.col === colId) setOrdenacao(null)
      setFiltros((fs) => fs.filter((f) => f.col !== colId))
      if (agrupadoPor === colId) setAgrupadoPor(null)
    },
    agregar: (colId, agg) => atualizarColuna(colId, (c) => ({ ...c, agg })),
  }

  /* ---------------- DataTable ---------------- */

  const colunasDaTabela: DataTableColumn<Linha>[] = visiveis.map((col) => {
    const { Icon } = TIPOS[col.type]
    const excluir = col.type === "delete_action"
    const filtro = filtros.find((f) => f.col === col.id)
    return {
      id: col.id,
      header: col.name,
      icon: excluir ? undefined : <Icon />,
      headerAddon: excluir ? <Trash2Icon aria-hidden className="size-4 shrink-0 text-destructive" /> : undefined,
      width: col.width,
      wrap: col.wrap,
      sorted: ordenacao?.col === col.id ? ordenacao.dir : false,
      filtered: !!filtro && filtroTemEfeito(filtro),
      frame: col.title ? undefined : false,
      cell: (l) => (col.title ? <CelulaTitulo col={col} linha={l} /> : <Celula col={col} linha={l} />),
      menu: (
        <MenuDaColuna
          col={col}
          indice={colunas.indexOf(col)}
          ordenacao={ordenacao}
          filtro={filtro}
          agrupadoPor={agrupadoPor}
          api={api}
        />
      ),
      footer: <RodapeDaColuna col={col} linhas={dados} api={api} />,
    }
  })

  const grupos = colunaDoGrupo
    ? agrupar(dados, colunaDoGrupo).map((g) => ({
        id: g.chave,
        label: <RotuloDoGrupo col={colunaDoGrupo} chave={g.chave} />,
        rows: g.linhas,
        collapsed: recolhidos.includes(g.chave),
      }))
    : undefined

  return (
    <ProvedorDeAcoes value={acoes}>
      <main className="flex h-svh flex-col bg-background p-4 text-foreground">
        <h1 className="sr-only">Tabela modelo padrão</h1>
        <DataTable
          className="flex-1"
          role="region"
          aria-label="Requisitos"
          columns={colunasDaTabela}
          rows={dados}
          groups={grupos}
          onToggleGroup={(id) => setRecolhidos((r) => (r.includes(id) ? r.filter((x) => x !== id) : [...r, id]))}
          getRowId={(l) => l.id}
          getRowLabel={tituloDe}
          selectedIds={selecionadas}
          onSelectedIdsChange={setSelecionadas}
          bulkActions={
            <>
              <ActionBarButton onClick={() => duplicarLinhas(selecionadas)}>
                <CopyIcon aria-hidden />
                Duplicar
              </ActionBarButton>
              <ActionBarButton onClick={() => excluirLinhas(selecionadas)}>
                <Trash2Icon aria-hidden />
                Excluir
              </ActionBarButton>
            </>
          }
          rowMenu={(l) => (
            <MenuDaLinha
              aoAbrir={() => setAberta(l.id)}
              aoCopiarLink={() => toast("Link copiado")}
              aoDuplicar={() => duplicarLinhas([l.id])}
              aoExcluir={() => excluirLinhas([l.id])}
            />
          )}
          onRowMove={(de, para) => setLinhas((ls) => mover(ls, de, para))}
          onOpenRow={(l) => setAberta(l.id)}
          onColumnMove={(de, para) => setColunas((cs) => mover(cs, de, para))}
          onColumnResize={(id, largura) => atualizarColuna(id, (c) => ({ ...c, width: largura }))}
          addColumn={{
            open: novaColunaAberta,
            onOpenChange: setNovaColunaAberta,
            content: <NovaColuna ocultas={colunas.filter((c) => c.hidden)} api={api} aoConcluir={() => setNovaColunaAberta(false)} />,
          }}
          onAddRow={adicionarLinha}
          labels={{
            addRow: "Adicionar requisito",
            empty: "Nenhum requisito encontrado.",
            selected: (n) => (n === 1 ? "1 requisito selecionado" : `${n} requisitos selecionados`),
          }}
        />
      </main>

      <Dialog open={!!linhaAberta} onOpenChange={(o) => !o && setAberta(null)}>
        {linhaAberta && (
          <DialogContent className="gap-3 sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="px-1 text-lg font-semibold">{tituloDe(linhaAberta)}</DialogTitle>
              <DialogDescription className="sr-only">Propriedades do requisito</DialogDescription>
            </DialogHeader>
            <dl className="flex flex-col">
              {visiveis
                .filter((c) => !c.title && c.type !== "delete_action")
                .map((c) => {
                  const { Icon } = TIPOS[c.type]
                  return (
                    <div key={c.id} className="flex items-center gap-2.5">
                      <dt className="flex w-[120px] shrink-0 items-center gap-1.5 px-1 text-[13px] text-muted-foreground">
                        <Icon aria-hidden className="size-4 shrink-0" />
                        <span className="truncate">{c.name}</span>
                      </dt>
                      <dd className="min-w-0 flex-1">
                        <Celula col={c} linha={linhaAberta} className="min-h-9 px-2" />
                      </dd>
                    </div>
                  )
                })}
            </dl>
          </DialogContent>
        )}
      </Dialog>
    </ProvedorDeAcoes>
  )
}
