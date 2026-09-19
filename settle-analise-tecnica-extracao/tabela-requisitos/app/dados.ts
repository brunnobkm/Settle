// Linhas da tabela de requisitos, fiéis ao node do Figma: os textos
// "Placeholder" e "Hyperlink" são os do próprio Figma.

export type Tom = "success" | "warning" | "destructive" | "neutral"

/** Questionar / Impugnar: "mais" = ainda sem texto, "mensagem" = já escrito. */
export type Manifestacao = { ligado: boolean; icone: "mais" | "mensagem" }

/** Coluna Revisar: interruptor (com engrenagem quando ligado) ou botão. */
export type Revisao = { tipo: "interruptor"; ligado: boolean } | { tipo: "revisado" } | { tipo: "marcar" }

export type Requisito = {
  id: string
  status: { rotulo: string; tom: Tom } | null
  confianca: { rotulo: string; tom: Tom } | null
  questionar: Manifestacao
  impugnar: Manifestacao
  revisar: Revisao
}

const DESLIGADO: Manifestacao = { ligado: false, icone: "mais" }
const MAIS: Manifestacao = { ligado: true, icone: "mais" }
const MENSAGEM: Manifestacao = { ligado: true, icone: "mensagem" }

const ATENDE = { rotulo: "Atende", tom: "success" } as const
const PARCIAL = { rotulo: "Atende com parcialidade", tom: "warning" } as const
const EM_REVISAO = { rotulo: "Em revisão", tom: "neutral" } as const
const NAO_ATENDE = { rotulo: "Não atende", tom: "destructive" } as const

const ALTA = { rotulo: "Alta", tom: "success" } as const
const MEDIA = { rotulo: "Média", tom: "warning" } as const
const BAIXA = { rotulo: "Baixa", tom: "destructive" } as const

export const REQUISITOS: Requisito[] = [
  { id: "r1", status: ATENDE, confianca: ALTA, questionar: DESLIGADO, impugnar: DESLIGADO, revisar: { tipo: "interruptor", ligado: false } },
  { id: "r2", status: ATENDE, confianca: MEDIA, questionar: DESLIGADO, impugnar: DESLIGADO, revisar: { tipo: "interruptor", ligado: false } },
  { id: "r3", status: PARCIAL, confianca: BAIXA, questionar: DESLIGADO, impugnar: DESLIGADO, revisar: { tipo: "interruptor", ligado: false } },
  { id: "r4", status: EM_REVISAO, confianca: BAIXA, questionar: MAIS, impugnar: MAIS, revisar: { tipo: "interruptor", ligado: true } },
  { id: "r5", status: NAO_ATENDE, confianca: BAIXA, questionar: MENSAGEM, impugnar: MENSAGEM, revisar: { tipo: "revisado" } },
  { id: "r6", status: PARCIAL, confianca: BAIXA, questionar: MENSAGEM, impugnar: MENSAGEM, revisar: { tipo: "marcar" } },
  { id: "r7", status: PARCIAL, confianca: BAIXA, questionar: MENSAGEM, impugnar: MENSAGEM, revisar: { tipo: "marcar" } },
  { id: "r8", status: PARCIAL, confianca: BAIXA, questionar: MENSAGEM, impugnar: MENSAGEM, revisar: { tipo: "marcar" } },
]

/** No Figma, a última linha aparece selecionada (alça + checkbox + menu "Copiar link"). */
export const SELECIONADAS_INICIAIS = ["r8"]

let seq = REQUISITOS.length
export function novoRequisito(): Requisito {
  seq += 1
  return {
    id: `r${seq}`,
    status: null,
    confianca: null,
    questionar: DESLIGADO,
    impugnar: DESLIGADO,
    revisar: { tipo: "interruptor", ligado: false },
  }
}
