// Modelo da Seleção de PDF: documentos da licitação e requisitos em Módulos -> Itens.
// Cada item (e o título de um módulo) guarda o Range do trecho no documento, que é
// realçado no PDF e usado para ir do card ao trecho e do trecho ao card.

export type DocId = "edital" | "etp" | "tr" | "contrato"

/** Nomes do protótipo original (o teste pede para achar o arquivo certo). */
export const DOCUMENTOS: { id: DocId; nome: string }[] = [
  { id: "edital", nome: "arquivo-errado.pdf" },
  { id: "etp", nome: "arquivo-errado.pdf" },
  { id: "tr", nome: "arquivo-errado.pdf" },
  { id: "contrato", nome: "arquivo-correto.pdf" },
]

export type Item = { id: string; texto: string; range: Range | null; ia: boolean }
export type Modulo = { id: string; nome: string; recolhido: boolean; itens: Item[]; range: Range | null }

let uid = 0
export const novoId = () => `n${++uid}`

export const novoModulo = (nome: string, range: Range | null = null): Modulo => ({
  id: novoId(),
  nome,
  recolhido: false,
  itens: [],
  range,
})

export const totalDeItens = (modulos: Modulo[]) => modulos.reduce((n, m) => n + m.itens.length, 0)

export function acharItem(modulos: Modulo[], itemId: string) {
  for (const m of modulos) {
    const item = m.itens.find((i) => i.id === itemId)
    if (item) return { modulo: m, item }
  }
  return null
}

/* ---------------- extração (IA simulada) ---------------- */

const texto = (el: Element) => (el.textContent ?? "").replace(/\s+/g, " ").trim()
function rangeDe(el: Element) {
  const r = document.createRange()
  r.selectNodeContents(el)
  return r
}
const itemIA = (el: Element | undefined): Item | null =>
  el ? { id: novoId(), texto: texto(el).slice(0, 360), range: rangeDe(el), ia: true } : null

/** Gera os módulos a partir do corpo do documento aberto (marcado com data-doc). */
export function extrairRequisitos(corpo: HTMLElement, docId: DocId): Modulo[] {
  const modulos: Modulo[] = []
  if (docId === "edital") {
    const celula = (s: string) => [...corpo.querySelectorAll("td")].find((x) => x.textContent?.includes(s))
    const paragrafo = (pre: string) => [...corpo.querySelectorAll("p")].find((x) => x.textContent?.trim().startsWith(pre))
    const titulo = (s: string) => [...corpo.querySelectorAll("[data-titulo]")].find((x) => x.textContent?.includes(s))
    const modulo = (nome: string, ancora: Element | undefined, els: (Element | undefined)[]) => {
      const m = novoModulo(nome, ancora ? rangeDe(ancora) : null)
      m.itens = els.map(itemIA).filter((i): i is Item => i !== null)
      modulos.push(m)
    }
    modulo("Objeto e escopo", celula("OBJETO:"), [celula("OBJETO:")])
    modulo("Critério de julgamento", celula("CRITÉRIO DE JULGAMENTO"), [
      celula("CRITÉRIO DE JULGAMENTO"),
      celula("MODO DE DISPUTA"),
    ])
    modulo("Requisitos gerais", titulo("DO OBJETO"), [paragrafo("1.1."), paragrafo("1.2."), paragrafo("2.1.")])
    return modulos
  }
  let atual: Modulo | null = null
  for (const el of corpo.children) {
    if (el.hasAttribute("data-titulo")) {
      atual = novoModulo(texto(el).slice(0, 60), rangeDe(el))
      modulos.push(atual)
    } else if (el.tagName === "P" && atual) {
      const item = itemIA(el)
      if (item) atual.itens.push(item)
    }
  }
  return modulos
}

/* ---------------- mover itens e módulos ---------------- */

const mesmaOrdem = (a: Modulo[], b: Modulo[]) =>
  a.length === b.length &&
  a.every((m, i) => m.id === b[i].id && m.itens.length === b[i].itens.length && m.itens.every((it, j) => it.id === b[i].itens[j].id))

/** Move o item para o módulo `paraModulo`, na posição `indice` (contada sem o próprio item). */
export function moverItem(modulos: Modulo[], itemId: string, paraModulo: string, indice: number): Modulo[] {
  const achado = acharItem(modulos, itemId)
  if (!achado) return modulos
  const sem = modulos.map((m) => ({ ...m, itens: m.itens.filter((i) => i.id !== itemId) }))
  const proximo = sem.map((m) => {
    if (m.id !== paraModulo) return m
    const itens = [...m.itens]
    itens.splice(Math.max(0, Math.min(indice, itens.length)), 0, achado.item)
    return { ...m, itens }
  })
  return mesmaOrdem(modulos, proximo) ? modulos : proximo
}

/** Move o módulo para a posição `indice` (contada sem o próprio módulo). */
export function moverModulo(modulos: Modulo[], moduloId: string, indice: number): Modulo[] {
  const modulo = modulos.find((m) => m.id === moduloId)
  if (!modulo) return modulos
  const proximo = modulos.filter((m) => m.id !== moduloId)
  proximo.splice(Math.max(0, Math.min(indice, proximo.length)), 0, modulo)
  return mesmaOrdem(modulos, proximo) ? modulos : proximo
}

/** Posição de inserção pelo ponteiro: antes do primeiro irmão cujo centro fica abaixo de y. */
export function indicePeloPonteiro(container: Element, seletor: string, ignorar: string, atributo: string, y: number) {
  const irmaos = [...container.querySelectorAll(`:scope > ${seletor}`)].filter(
    (el) => el.getAttribute(atributo) !== ignorar
  )
  const i = irmaos.findIndex((el) => {
    const r = el.getBoundingClientRect()
    return y < r.top + r.height / 2
  })
  return i < 0 ? irmaos.length : i
}

/* ---------------- área de transferência ---------------- */

export function copiarTexto(valor: string, aoConcluir: () => void) {
  const alternativa = () => {
    const ta = document.createElement("textarea")
    ta.value = valor
    ta.style.position = "fixed"
    ta.style.opacity = "0"
    document.body.appendChild(ta)
    ta.select()
    try {
      document.execCommand("copy")
    } catch {
      /* sem suporte: segue com o aviso */
    }
    document.body.removeChild(ta)
    aoConcluir()
  }
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(valor).then(aoConcluir).catch(alternativa)
  else alternativa()
}
