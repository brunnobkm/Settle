// Estado do workspace da licitação: seções abertas, divergências em revisão, informações
// (com edição e trecho de origem), arquivos da licitação abertos ao lado e a aba ativa quando
// o workspace fica estreito. Fica no App para o workspace manter o que foi feito ao fechar e
// abrir de novo.

import { useLayoutEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"

import { ALVOS_DE_ORIGEM, SECOES, alvoDaOpcao } from "./dados"
import type { DocKey } from "./documentos"

export type Fonte = { texto: string; documento: DocKey }

export type Linha = {
  id: string
  rotulo: string
  valor: string
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

/** Informação (ou nova informação) que está recebendo um trecho dos arquivos. */
export type Contexto = { tipo: "linha"; linhaId: string } | { tipo: "nova"; divergenciaId: string } | null

export type Aba = "resumo" | "fonte"

export type Estado = {
  secoesAbertas: string[]
  divergencias: Record<string, EstadoDivergencia>
  linhas: Record<string, Linha>
  /** Informações de cada seção, na ordem (as resolvidas entram no topo). */
  ordem: Record<string, string[]>
  edicoes: Record<string, { rascunho: string; erro?: string }>
  fonte: { aberta: boolean; documento: DocKey; destaque: string; token: number }
  contexto: Contexto
  /** Aba ativa no modo abas (workspace estreito com os arquivos abertos). */
  aba: Aba
}

const SECAO_DA_DIVERGENCIA = new Map(SECOES.flatMap((s) => s.divergencias.map((d) => [d.id, s.id] as const)))
export const DIVERGENCIAS = new Map(SECOES.flatMap((s) => s.divergencias.map((d) => [d.id, d] as const)))

function estadoInicial(): Estado {
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
  return {
    secoesAbertas: SECOES.filter((s) => s.aberta).map((s) => s.id),
    divergencias,
    linhas,
    ordem,
    edicoes: {},
    fonte: { aberta: false, documento: "edital", destaque: "", token: 0 },
    contexto: null,
    aba: "resumo",
  }
}

// ---------------------------------------------------------------- origem

export function temFonte(linha: Linha) {
  if (linha.semFonte) return false
  if (linha.fonte) return true
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

// ---------------------------------------------------------------- hook

export function usePainel() {
  const [estado, setEstado] = useState(estadoInicial)
  const atual = useRef(estado)
  useLayoutEffect(() => {
    atual.current = estado
  }, [estado])

  const acoes = useMemo(() => {
    const set = setEstado
    const divergencia = (id: string, fn: (d: EstadoDivergencia) => EstadoDivergencia) =>
      set((e) => ({ ...e, divergencias: { ...e.divergencias, [id]: fn(e.divergencias[id]) } }))

    const semContexto = (e: Estado): Estado => ({ ...e, contexto: null, fonte: { ...e.fonte, destaque: "" } })

    // abrir um trecho sempre leva à aba dos arquivos (no modo abas)
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
      digitarEdicao: (id: string, rascunho: string) => set((e) => ({ ...e, edicoes: { ...e.edicoes, [id]: { rascunho } } })),
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
      abrirFonteDaLinha: (id: string) =>
        set((e) => abrirFonte(e, alvoDaLinha(e.linhas[id]), { tipo: "linha", linhaId: id })),
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
      definirAba: (aba: Aba) => set((e) => (e.aba === aba ? e : { ...e, aba })),

      /** Esc: desfaz o estado mais interno primeiro. Devolve true se tratou. */
      tratarEscape: () => {
        const e = atual.current
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
    }
  }, [])

  return { estado, ...acoes }
}

export type Painel = ReturnType<typeof usePainel>
