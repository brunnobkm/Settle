// Estado de um painel de Resumo (sheet ou workspace): seções abertas, divergências em
// revisão, informações (com edição e trecho de origem), visualizador do edital e, na
// variante sem agrupamento, os cards com grupos e seleção. Fica no App para o painel
// manter o que foi feito ao fechar e abrir de novo.

import { useLayoutEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"

import {
  ALVOS_DE_ORIGEM,
  OBJETO,
  SECOES,
  alvoDaOpcao,
  type Trecho,
} from "./dados"
import type { DocKey } from "./documentos"

export type Variante = "resumo" | "plano" | "score"
export type Fonte = { texto: string; documento: DocKey }

export type Linha = {
  id: string
  rotulo: string
  valor: string
  /** Vários trechos de origem (1:N): um botão de origem por trecho. */
  trechos?: Trecho[]
  /** Trecho escolhido pela pessoa no documento. */
  fonte?: Fonte
  /** Informação nova sem trecho vinculado. */
  semFonte?: boolean
}

export type NovaInformacao = { texto: string; erro?: string; fonte?: Fonte; vinculando: boolean }

export type EstadoDivergencia = {
  aberta: boolean
  revisando: boolean
  /** Índice da opção ("0", "1"...) ou "nova". */
  escolha: string
  nova: NovaInformacao | null
  resolvida?: { escolha: string; tipo: "escolhida" | "manual" }
}

export type Contexto =
  | { tipo: "linha"; linhaId: string; botao: string }
  | { tipo: "nova"; divergenciaId: string }
  | null

export type ItemPlano =
  | { tipo: "card"; id: string }
  | { tipo: "grupo"; id: string; nome: string; recolhido: boolean; cards: string[] }

export type Estado = {
  variante: Variante
  secoesAbertas: string[]
  divergencias: Record<string, EstadoDivergencia>
  linhas: Record<string, Linha>
  /** Informações de cada seção, na ordem (as resolvidas entram no topo). */
  ordem: Record<string, string[]>
  edicoes: Record<string, { rascunho: string; erro?: string }>
  fonte: { aberta: boolean; documento: DocKey; destaque: string; token: number }
  contexto: Contexto
  /** Aba do workspace estreito (resumo ou documento). */
  aba: "resumo" | "fonte"
  plano: { itens: ItemPlano[]; selecionados: string[]; grupoNovo?: string }
}

const SECAO_DA_DIVERGENCIA = new Map(
  SECOES.flatMap((s) => s.divergencias.map((d) => [d.id, s.id] as const))
)
export const DIVERGENCIAS = new Map(SECOES.flatMap((s) => s.divergencias.map((d) => [d.id, d] as const)))

export function estadoInicial(variante: Variante): Estado {
  const linhas: Record<string, Linha> = {}
  const ordem: Record<string, string[]> = {}
  const divergencias: Record<string, EstadoDivergencia> = {}
  for (const secao of SECOES) {
    ordem[secao.id] = secao.linhas.map((l) => l.id)
    for (const l of secao.linhas) linhas[l.id] = { ...l }
    for (const d of secao.divergencias) {
      divergencias[d.id] = { aberta: Boolean(d.aberta), revisando: false, escolha: "0", nova: null }
    }
  }

  // sem agrupamento: cada informação vira um card (divergências juntam as opções com " | ")
  const itens: ItemPlano[] = []
  if (variante === "plano") {
    const cards: { rotulo: string; valor: string }[] = [{ rotulo: "Objeto", valor: OBJETO }]
    for (const secao of SECOES) {
      for (const d of secao.divergencias) {
        cards.push({ rotulo: d.rotulo, valor: d.opcoes.map((o) => o.texto).join(" | ") })
      }
      for (const l of secao.linhas) cards.push({ rotulo: l.rotulo, valor: l.valor })
    }
    cards.forEach((c, i) => {
      const id = `plano-${i}`
      linhas[id] = { id, ...c }
      itens.push({ tipo: "card", id })
    })
  }

  return {
    variante,
    secoesAbertas: SECOES.filter((s) => s.aberta).map((s) => s.id),
    divergencias,
    linhas,
    ordem,
    edicoes: {},
    fonte: { aberta: false, documento: "edital", destaque: "", token: 0 },
    contexto: null,
    aba: "resumo",
    plano: { itens, selecionados: [] },
  }
}

// ---------------------------------------------------------------- origem

export function temFonte(linha: Linha) {
  if (linha.semFonte) return false
  if (linha.trechos?.length || linha.fonte) return true
  return ALVOS_DE_ORIGEM.some((a) => a.rotulo === linha.rotulo)
}

export function alvoDaLinha(linha: Linha): { documento: DocKey; texto: string } {
  if (linha.semFonte) return { documento: linha.fonte?.documento ?? "edital", texto: "" }
  if (linha.fonte) return { documento: linha.fonte.documento, texto: linha.fonte.texto }
  const alvo = ALVOS_DE_ORIGEM.find((a) => a.rotulo === linha.rotulo)
  return alvo ? { documento: alvo.documento, texto: alvo.texto } : { documento: "edital", texto: "" }
}

/** Nova informação em edição com a opção marcada: vira o contexto da seleção no documento. */
export function contextoEfetivo(estado: Estado): Contexto {
  if (estado.contexto) return estado.contexto
  const id = Object.keys(estado.divergencias).find((k) => {
    const d = estado.divergencias[k]
    return d.revisando && !d.resolvida && d.nova && d.escolha === "nova"
  })
  return id ? { tipo: "nova", divergenciaId: id } : null
}

// ---------------------------------------------------------------- área de transferência

export async function copiarTexto(texto: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(texto)
      return true
    }
  } catch {
    // arquivo local ou navegador que bloqueia a API: tenta o jeito antigo abaixo
  }
  const campo = document.createElement("textarea")
  campo.value = texto
  campo.setAttribute("readonly", "")
  campo.style.position = "fixed"
  campo.style.top = "-9999px"
  document.body.append(campo)
  campo.select()
  try {
    return document.execCommand("copy")
  } finally {
    campo.remove()
  }
}

// ---------------------------------------------------------------- sem agrupamento

function cardsEmOrdem(itens: ItemPlano[]) {
  return itens.flatMap((i) => (i.tipo === "card" ? [i.id] : i.cards))
}

function grupoDoCard(itens: ItemPlano[], cardId: string) {
  return itens.find((i): i is Extract<ItemPlano, { tipo: "grupo" }> => i.tipo === "grupo" && i.cards.includes(cardId))
}

/** Ação da barra de lote conforme a seleção. */
export function acaoDoLote(plano: Estado["plano"]): "agrupar" | "desagrupar" | "remover" {
  const grupos = plano.selecionados.map((c) => grupoDoCard(plano.itens, c)).filter(Boolean)
  if (!grupos.length) return "agrupar"
  const unicos = new Set(grupos)
  const [grupo] = unicos
  const todosNoMesmo = unicos.size === 1 && grupos.length === plano.selecionados.length
  return todosNoMesmo && grupo!.cards.length === plano.selecionados.length ? "desagrupar" : "remover"
}

let contadorDeGrupos = 0

// ---------------------------------------------------------------- hook

export function usePainel(varianteInicial: Variante) {
  const [estado, setEstado] = useState(() => estadoInicial(varianteInicial))
  const atual = useRef(estado)
  useLayoutEffect(() => {
    atual.current = estado
  }, [estado])

  const acoes = useMemo(() => {
    const set = setEstado
    const divergencia = (id: string, fn: (d: EstadoDivergencia) => EstadoDivergencia) =>
      set((e) => ({ ...e, divergencias: { ...e.divergencias, [id]: fn(e.divergencias[id]) } }))

    const semContexto = (e: Estado): Estado => ({ ...e, contexto: null, fonte: { ...e.fonte, destaque: "" } })

    const abrirFonte = (e: Estado, alvo: { documento: DocKey; texto: string }, contexto: Contexto): Estado => ({
      ...e,
      contexto,
      aba: "fonte",
      fonte: { aberta: true, documento: alvo.documento, destaque: alvo.texto, token: e.fonte.token + 1 },
    })

    const cancelarRevisao = (id: string) =>
      set((e) => ({
        ...e,
        contexto: e.contexto?.tipo === "nova" && e.contexto.divergenciaId === id ? null : e.contexto,
        divergencias: {
          ...e.divergencias,
          [id]: { ...e.divergencias[id], revisando: false, escolha: "0", nova: null },
        },
      }))

    const limparContexto = () => set(semContexto)
    const fecharFonte = () =>
      set((e) => ({ ...semContexto(e), aba: "resumo", fonte: { ...e.fonte, aberta: false, destaque: "" } }))

    return {
      reiniciar: (variante: Variante) => set(estadoInicial(variante)),
      definirSecoesAbertas: (ids: string[]) => set((e) => ({ ...e, secoesAbertas: ids })),
      alternarDivergencia: (id: string) => divergencia(id, (d) => ({ ...d, aberta: !d.aberta })),

      revisar: (id: string) => {
        if (atual.current.divergencias[id].revisando) return cancelarRevisao(id)
        divergencia(id, (d) => ({ ...d, aberta: true, revisando: true }))
      },
      cancelarRevisao,
      escolher: (id: string, valor: string) =>
        divergencia(id, (d) => (valor === "nova" ? { ...d, escolha: valor } : { ...d, escolha: valor, nova: null })),
      abrirNova: (id: string) =>
        set((e) => ({
          ...semContexto(e),
          divergencias: {
            ...e.divergencias,
            [id]: { ...e.divergencias[id], escolha: "nova", nova: { texto: "", vinculando: false } },
          },
        })),
      digitarNova: (id: string, texto: string) =>
        divergencia(id, (d) => ({ ...d, nova: d.nova && { ...d.nova, texto, erro: undefined } })),
      vincularNova: (id: string) =>
        set((e) => {
          const nova = e.divergencias[id].nova
          if (!nova) return e
          if (nova.fonte) return abrirFonte(e, nova.fonte, { tipo: "nova", divergenciaId: id })
          return {
            ...abrirFonte(e, { documento: "edital", texto: "" }, { tipo: "nova", divergenciaId: id }),
            divergencias: { ...e.divergencias, [id]: { ...e.divergencias[id], nova: { ...nova, vinculando: true } } },
          }
        }),
      confirmar: (id: string) => {
        const e = atual.current
        const d = e.divergencias[id]
        const base = DIVERGENCIAS.get(id)!
        const manual = d.escolha === "nova" && d.nova
        const textoManual = manual ? d.nova!.texto.trim() : ""
        if (manual && !textoManual) {
          divergencia(id, (x) => ({ ...x, nova: x.nova && { ...x.nova, erro: "Preencha a nova informação." } }))
          return
        }
        const escolha = textoManual || base.opcoes[Number(d.escolha)]?.texto || "Informação resolvida"
        const secao = SECAO_DA_DIVERGENCIA.get(id)!
        const linhaId = `resolvida-${id}`
        const linha: Linha = {
          id: linhaId,
          rotulo: base.rotulo,
          valor: escolha,
          ...(textoManual ? (d.nova!.fonte ? { fonte: d.nova!.fonte } : { semFonte: true }) : {}),
        }
        // o clique em Confirmar fica fora da informação ativa: encerra o vínculo de trecho
        set((x) => ({
          ...(x.contexto ? semContexto(x) : x),
          linhas: { ...x.linhas, [linhaId]: linha },
          ordem: { ...x.ordem, [secao]: [linhaId, ...x.ordem[secao]] },
          divergencias: {
            ...x.divergencias,
            [id]: {
              ...x.divergencias[id],
              aberta: false,
              revisando: false,
              resolvida: { escolha, tipo: textoManual ? "manual" : "escolhida" },
            },
          },
        }))
        toast("Divergência resolvida!")
      },

      iniciarEdicao: (id: string) =>
        set((e) =>
          e.edicoes[id]
            ? semContexto(e)
            : { ...semContexto(e), edicoes: { ...e.edicoes, [id]: { rascunho: e.linhas[id].valor } } }
        ),
      digitarEdicao: (id: string, rascunho: string) =>
        set((e) => ({ ...e, edicoes: { ...e.edicoes, [id]: { rascunho } } })),
      cancelarEdicao: (id: string) =>
        set((e) => {
          const edicoes = { ...e.edicoes }
          delete edicoes[id]
          return { ...e, edicoes }
        }),
      salvarEdicao: (id: string) => {
        const e = atual.current
        const valor = e.edicoes[id]?.rascunho.trim()
        if (!valor) {
          set((x) => ({ ...x, edicoes: { ...x.edicoes, [id]: { ...x.edicoes[id], erro: "Preencha a informação." } } }))
          return
        }
        const tinhaFonte = temFonte(e.linhas[id])
        set((x) => {
          const edicoes = { ...x.edicoes }
          delete edicoes[id]
          return { ...x, edicoes, linhas: { ...x.linhas, [id]: { ...x.linhas[id], valor } } }
        })
        toast(tinhaFonte ? "Informação atualizada. Fonte mantida!" : "Informação atualizada!")
      },
      copiarLinha: async (id: string) => {
        set(semContexto)
        const ok = await copiarTexto(atual.current.linhas[id]?.valor ?? "")
        toast(ok ? "Valor copiado!" : "Não foi possível copiar.")
      },
      abrirFonteDaLinha: (id: string, botao: string, indiceTrecho?: number) =>
        set((e) => {
          const linha = e.linhas[id]
          const trecho = indiceTrecho === undefined ? undefined : linha.trechos?.[indiceTrecho]
          const alvo = trecho ? { documento: trecho.documento, texto: trecho.texto } : alvoDaLinha(linha)
          return abrirFonte(e, alvo, { tipo: "linha", linhaId: id, botao })
        }),
      abrirFonteDaOpcao: (divergenciaId: string, indice: number) =>
        set((e) => abrirFonte(e, alvoDaOpcao(DIVERGENCIAS.get(divergenciaId)!.opcoes[indice]), null)),
      fecharFonte,
      trocarDocumento: (documento: DocKey) =>
        set((e) => {
          const ctx = e.contexto
          const alvo = ctx?.tipo === "linha" ? alvoDaLinha(e.linhas[ctx.linhaId]) : null
          const destaque = alvo?.documento === documento ? alvo.texto : e.fonte.destaque
          return { ...e, fonte: { ...e.fonte, documento, destaque, token: e.fonte.token + 1 } }
        }),
      usarSelecao: (texto: string) => {
        const e = atual.current
        const ctx = contextoEfetivo(e)
        const fonte: Fonte = { texto, documento: e.fonte.documento }
        set((x) => {
          const y: Estado = { ...x, contexto: ctx, fonte: { ...x.fonte, destaque: texto, token: x.fonte.token + 1 } }
          if (ctx?.tipo === "linha") {
            y.linhas = { ...x.linhas, [ctx.linhaId]: { ...x.linhas[ctx.linhaId], fonte, semFonte: false } }
          }
          if (ctx?.tipo === "nova") {
            const d = x.divergencias[ctx.divergenciaId]
            if (d.nova) {
              y.divergencias = {
                ...x.divergencias,
                [ctx.divergenciaId]: { ...d, nova: { ...d.nova, fonte, vinculando: false } },
              }
            }
          }
          return y
        })
        toast(ctx ? "Trecho vinculado!" : "Trecho adicionado como fonte!")
      },
      limparContexto,
      definirAba: (aba: Estado["aba"]) => set((e) => ({ ...e, aba })),

      /** Esc: desfaz o estado mais interno primeiro. Devolve true se tratou. */
      tratarEscape: () => {
        const e = atual.current
        const ativo = document.activeElement
        if (ativo instanceof HTMLElement && ativo.dataset.nomeDoGrupo !== undefined) return true
        const sel = window.getSelection()
        if (sel && !sel.isCollapsed && sel.anchorNode?.parentElement?.closest("[data-slot=document-viewer-body]")) {
          sel.removeAllRanges()
          return true
        }
        const editando = Object.keys(e.edicoes)[0]
        if (editando) {
          set((x) => {
            const edicoes = { ...x.edicoes }
            delete edicoes[editando]
            return { ...x, edicoes }
          })
          return true
        }
        const revisando = Object.keys(e.divergencias).find((k) => e.divergencias[k].revisando)
        if (revisando) {
          cancelarRevisao(revisando)
          return true
        }
        if (e.contexto?.tipo === "linha") {
          limparContexto()
          return true
        }
        if (e.fonte.aberta) {
          fecharFonte()
          return true
        }
        return false
      },

      // ---- sem agrupamento
      alternarCard: (id: string, marcar?: boolean) =>
        set((e) => {
          const ja = e.plano.selecionados.includes(id)
          const quer = marcar ?? !ja
          const selecionados = quer
            ? ja
              ? e.plano.selecionados
              : [...e.plano.selecionados, id]
            : e.plano.selecionados.filter((c) => c !== id)
          return { ...e, plano: { ...e.plano, selecionados } }
        }),
      alternarGrupo: (grupoId: string, marcar?: boolean) =>
        set((e) => {
          const grupo = e.plano.itens.find((i) => i.id === grupoId)
          if (grupo?.tipo !== "grupo") return e
          const todos = grupo.cards.every((c) => e.plano.selecionados.includes(c))
          const quer = marcar ?? !todos
          const resto = e.plano.selecionados.filter((c) => !grupo.cards.includes(c))
          return { ...e, plano: { ...e.plano, selecionados: quer ? [...resto, ...grupo.cards] : resto } }
        }),
      limparSelecao: () => set((e) => ({ ...e, plano: { ...e.plano, selecionados: [] } })),
      executarLote: () =>
        set((e) => {
          const { itens, selecionados } = e.plano
          if (!selecionados.length) return e
          const acao = acaoDoLote(e.plano)
          const ordem = cardsEmOrdem(itens).filter((c) => selecionados.includes(c))

          if (acao === "agrupar") {
            const id = `grupo-${++contadorDeGrupos}`
            const novo: ItemPlano = { tipo: "grupo", id, nome: "", recolhido: false, cards: ordem }
            const lista: ItemPlano[] = []
            let inserido = false
            for (const item of itens) {
              if (item.tipo === "card" && selecionados.includes(item.id)) {
                if (!inserido) lista.push(novo)
                inserido = true
                continue
              }
              lista.push(item)
            }
            return { ...e, plano: { itens: lista, selecionados: [], grupoNovo: id } }
          }

          if (acao === "desagrupar") {
            const grupo = grupoDoCard(itens, ordem[0])!
            const lista = itens.flatMap((i): ItemPlano[] =>
              i === grupo ? grupo.cards.map((c) => ({ tipo: "card", id: c })) : [i]
            )
            return { ...e, plano: { itens: lista, selecionados: [] } }
          }

          // remover do grupo: os cards saem logo depois do grupo; grupo vazio some
          const lista = itens.flatMap((i): ItemPlano[] => {
            if (i.tipo !== "grupo") return [i]
            const saem = i.cards.filter((c) => selecionados.includes(c))
            if (!saem.length) return [i]
            const ficam = i.cards.filter((c) => !selecionados.includes(c))
            const soltos: ItemPlano[] = saem.map((c) => ({ tipo: "card", id: c }))
            return ficam.length ? [{ ...i, cards: ficam }, ...soltos] : soltos
          })
          return { ...e, plano: { itens: lista, selecionados: [] } }
        }),
      desagrupar: (grupoId: string) =>
        set((e) => {
          const grupo = e.plano.itens.find((i) => i.id === grupoId)
          if (grupo?.tipo !== "grupo") return e
          const lista = e.plano.itens.flatMap((i): ItemPlano[] =>
            i === grupo ? grupo.cards.map((c) => ({ tipo: "card", id: c })) : [i]
          )
          const selecionados = e.plano.selecionados.filter((c) => !grupo.cards.includes(c))
          return { ...e, plano: { itens: lista, selecionados } }
        }),
      excluirGrupo: (grupoId: string) =>
        set((e) => {
          const grupo = e.plano.itens.find((i) => i.id === grupoId)
          if (grupo?.tipo !== "grupo") return e
          return {
            ...e,
            plano: {
              itens: e.plano.itens.filter((i) => i !== grupo),
              selecionados: e.plano.selecionados.filter((c) => !grupo.cards.includes(c)),
            },
          }
        }),
      renomearGrupo: (grupoId: string, nome: string) =>
        set((e) => ({
          ...e,
          plano: {
            ...e.plano,
            itens: e.plano.itens.map((i) => (i.id === grupoId && i.tipo === "grupo" ? { ...i, nome } : i)),
          },
        })),
      alternarRecolhido: (grupoId: string) =>
        set((e) => ({
          ...e,
          plano: {
            ...e.plano,
            itens: e.plano.itens.map((i) =>
              i.id === grupoId && i.tipo === "grupo" ? { ...i, recolhido: !i.recolhido } : i
            ),
          },
        })),
      grupoFocado: () => set((e) => ({ ...e, plano: { ...e.plano, grupoNovo: undefined } })),
    }
  }, [])

  return { estado, ...acoes }
}

export type Painel = ReturnType<typeof usePainel>
