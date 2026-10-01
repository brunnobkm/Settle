// Atualizações e histórico de uma licitação.
//
// Atualização = mudança que veio do PORTAL na composição da licitação (data da sessão,
// arquivo novo ou retificado, manifestação respondida, status). Gera o selo "Atualizada"
// nos cards e aparece na aba "Atualizações" do detalhe.
// Histórico = registro de tudo que mudou na licitação, de três origens: portal, agentes
// (versões do que a IA gerou) e pessoas da empresa. Comentário e visualização não entram.
//
// Isto não é a central de notificações: o selo e as atualizações moram na própria licitação.

import { HOJE } from "./dados"

/** Por quanto tempo o selo fica no card se ninguém abrir a licitação. */
export const DIAS_DO_SELO = 7

export type TipoAtualizacao = "data" | "arquivo" | "manifestacao" | "status"

export const ROTULO_DO_TIPO: Record<TipoAtualizacao, string> = {
  data: "Data da sessão",
  arquivo: "Arquivo",
  manifestacao: "Manifestação",
  status: "Status do edital",
}

/** Trecho do arquivo que mudou entre uma versão e outra. */
export type TrechoAlterado = { secao: string; antes: string; depois: string }

export type Atualizacao = {
  id: string
  licitacaoId: string
  tipo: TipoAtualizacao
  /** AAAA-MM-DDTHH:mm */
  quando: string
  titulo: string
  antes?: string
  depois?: string
  /** Seções da licitação que podem mudar por causa desta atualização. */
  impacta?: string[]
  /** Arquivo novo que substitui um anterior (ex.: TR v1 → TR v2). */
  arquivo?: { nome: string; versaoAnterior: string; versaoNova: string; trechos: TrechoAlterado[] }
  /** Data da sessão adiantada: prazo encurtou. */
  antecipou?: boolean
  /** Alguém da empresa tinha editado o valor à mão: o portal não sobrescreve, pede decisão. */
  conflito?: { valorManual: string; autor: string }
  /** Manifestação: pergunta e resposta resumidas. */
  manifestacao?: { pergunta: string; resposta: string }
}

export type OrigemHistorico = "portal" | "agente" | "pessoa"

export const ROTULO_DA_ORIGEM: Record<OrigemHistorico, string> = {
  portal: "Portal",
  agente: "Agentes",
  pessoa: "Pessoas",
}

export type EventoHistorico = {
  id: string
  licitacaoId: string
  origem: OrigemHistorico
  quando: string
  autor: string
  texto: string
  detalhe?: string
  /** Agente que gerou uma nova versão; a anterior continua acessível. */
  versao?: { agente: string; atual: number; motivo: string }
}

/* ------------------------------------------------------------------ */
/* Dados de exemplo (HOJE = 21/05/2026)                               */
/* ------------------------------------------------------------------ */

export const ATUALIZACOES: Atualizacao[] = [
  // 048/2026 Santos Dumont: sessão adiantada + TR retificado
  {
    id: "a1", licitacaoId: "1431011", tipo: "data", quando: "2026-05-20T16:40",
    titulo: "Sessão pública adiantada",
    antes: "2026-05-26", depois: "2026-05-23", antecipou: true,
    impacta: ["Cronograma", "Envio da proposta"],
  },
  {
    id: "a2", licitacaoId: "1431011", tipo: "arquivo", quando: "2026-05-20T16:38",
    titulo: "Termo de Referência retificado",
    impacta: ["Requisitos de produto", "Habilitação", "Análise técnica"],
    arquivo: {
      nome: "Termo de Referência",
      versaoAnterior: "TR_048-2026_v1.pdf · 12/05",
      versaoNova: "TR_048-2026_v2_retificado.pdf · 20/05",
      trechos: [
        {
          secao: "4.2 Prazo de execução",
          antes: "O prazo de execução dos serviços será de 180 (cento e oitenta) dias corridos.",
          depois: "O prazo de execução dos serviços será de 120 (cento e vinte) dias corridos.",
        },
        {
          secao: "7.1 Qualificação técnica",
          antes: "Atestado de capacidade técnica de pavimentação rígida com no mínimo 5.000 m².",
          depois: "Atestado de capacidade técnica de pavimentação rígida com no mínimo 8.000 m², em área aeroportuária.",
        },
        {
          secao: "9.3 Garantia",
          antes: "Garantia contratual de 5% do valor do contrato.",
          depois: "Garantia contratual de 5% do valor do contrato.\nSeguro de responsabilidade civil de R$ 2.000.000,00.",
        },
      ],
    },
  },

  // 089/2026 TJSP: esclarecimento respondido + data com conflito
  {
    id: "a3", licitacaoId: "1430715", tipo: "manifestacao", quando: "2026-05-21T09:12",
    titulo: "Esclarecimento respondido",
    impacta: ["Análise técnica"],
    manifestacao: {
      pergunta: "A solução EDR pode ser entregue em modelo SaaS, sem servidor on-premise?",
      resposta: "Sim. Será aceita solução em nuvem, desde que os dados fiquem hospedados em território nacional.",
    },
  },
  {
    id: "a4", licitacaoId: "1430715", tipo: "data", quando: "2026-05-19T11:05",
    titulo: "Nova data da sessão pública",
    antes: "2026-05-26", depois: "2026-06-02",
    impacta: ["Envio da proposta"],
    conflito: { valorManual: "2026-05-29", autor: "Gustavo Néri" },
  },

  // 156/2026 DNIT: suspensa
  {
    id: "a5", licitacaoId: "1430660", tipo: "status", quando: "2026-05-18T14:20",
    titulo: "Licitação suspensa pelo órgão",
    antes: "Abertas para participação", depois: "Suspensa",
    impacta: ["Etapa no board"],
  },

  // 112/2026 Bonsucesso: atualização antiga (mais de 7 dias): não mostra selo
  {
    id: "a6", licitacaoId: "1430952", tipo: "arquivo", quando: "2026-05-10T10:00",
    titulo: "Novo anexo: Planilha de custos",
    impacta: ["Proposta"],
  },
]

export const HISTORICO: EventoHistorico[] = [
  // 048/2026
  { id: "h1", licitacaoId: "1431011", origem: "agente", quando: "2026-05-20T16:52", autor: "Agente de Análise técnica",
    texto: "Gerou a versão 2 da Análise técnica", versao: { agente: "Análise técnica", atual: 2, motivo: "Termo de Referência retificado (v2)" } },
  { id: "h2", licitacaoId: "1431011", origem: "agente", quando: "2026-05-20T16:50", autor: "Agente de Habilitação",
    texto: "Gerou a versão 2 do checklist de Habilitação", detalhe: "1 requisito mudou: atestado de 8.000 m² em área aeroportuária.",
    versao: { agente: "Checklist de Habilitação", atual: 2, motivo: "Termo de Referência retificado (v2)" } },

  { id: "h5", licitacaoId: "1431011", origem: "pessoa", quando: "2026-05-15T10:03", autor: "Maria da Silva",
    texto: "Adicionou Fabio Almeida Lopes Pereira como responsável" },
  { id: "h5b", licitacaoId: "1431011", origem: "pessoa", quando: "2026-05-15T10:01", autor: "Maria da Silva",
    texto: "Adicionou o segmento Infraestrutura" },
  { id: "h5c", licitacaoId: "1431011", origem: "pessoa", quando: "2026-05-15T09:58", autor: "Maria da Silva",
    texto: "Definiu o envio da proposta para 26/05" },
  { id: "h6", licitacaoId: "1431011", origem: "pessoa", quando: "2026-05-14T17:30", autor: "Brunno Krier Martins",
    texto: "Moveu de Recomendadas para Análise de Oportunidades" },
  { id: "h7", licitacaoId: "1431011", origem: "agente", quando: "2026-05-12T08:10", autor: "Agente de Análise técnica",
    texto: "Gerou a versão 1 da Análise técnica", versao: { agente: "Análise técnica", atual: 1, motivo: "Edital publicado" } },

  // 089/2026

  { id: "h10", licitacaoId: "1430715", origem: "pessoa", quando: "2026-05-16T15:44", autor: "Gustavo Néri",
    texto: "Alterou o envio da proposta de 26/05 para 29/05" },
  { id: "h11", licitacaoId: "1430715", origem: "pessoa", quando: "2026-05-13T09:20", autor: "Brunno Krier Martins",
    texto: "Moveu de Análise de Oportunidades para Preparação de Proposta" },

  // 156/2026
  { id: "h13", licitacaoId: "1430660", origem: "pessoa", quando: "2026-05-11T11:00", autor: "Helena Costa",
    texto: "Moveu de Análise de Oportunidades para Preparação de Proposta" },
]

/* ------------------------------------------------------------------ */
/* Regras                                                              */
/* ------------------------------------------------------------------ */

const diasDesde = (quando: string) => (HOJE.getTime() + 18 * 3_600_000 - new Date(quando).getTime()) / 86_400_000

/**
 * Atualizações que acendem o selo: não vistas e com até DIAS_DO_SELO dias.
 * `vistaEm`: quando o usuário abriu a licitação pela última vez (AAAA-MM-DDTHH:mm).
 */
export function atualizacoesNovas(lista: Atualizacao[], licitacaoId: string, vistaEm?: string) {
  return lista
    .filter((a) => a.licitacaoId === licitacaoId)
    .filter((a) => diasDesde(a.quando) <= DIAS_DO_SELO)
    .filter((a) => !vistaEm || a.quando > vistaEm)
}

export function quandoRelativo(quando: string) {
  const d = diasDesde(quando)
  const hora = quando.slice(11, 16)
  if (d < 1) return `hoje, ${hora}`
  if (d < 2) return `ontem, ${hora}`
  return `há ${Math.floor(d)} dias`
}

export const dataCurta = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`

/** Texto curto do selo: a mudança mais importante primeiro. */
export function resumoDoSelo(novas: Atualizacao[]) {
  if (!novas.length) return null
  const ordem: TipoAtualizacao[] = ["status", "data", "arquivo", "manifestacao"]
  const principal = [...novas].sort((a, b) => ordem.indexOf(a.tipo) - ordem.indexOf(b.tipo))[0]
  const urgente = novas.some((a) => a.antecipou || a.tipo === "status" || a.conflito)
  return { texto: principal.titulo, extras: novas.length - 1, urgente }
}

/* Recomendadas (ainda fora do pipeline): o selo vale igual, 7 dias ou até abrir */
ATUALIZACOES.push(
  {
    id: "r1a", licitacaoId: "1432210", tipo: "arquivo", quando: "2026-05-21T08:30",
    titulo: "Edital retificado",
    impacta: ["Requisitos de produto", "Score"],
    arquivo: {
      nome: "Edital",
      versaoAnterior: "Edital_PE_33-2026.pdf · 14/05",
      versaoNova: "Edital_PE_33-2026_retificado.pdf · 21/05",
      trechos: [
        {
          secao: "Anexo I · Item 3",
          antes: "Notebook com processador de 8 núcleos, 16 GB de RAM e SSD de 256 GB.",
          depois: "Notebook com processador de 10 núcleos, 16 GB de RAM e SSD de 512 GB.",
        },
      ],
    },
  },
  {
    id: "r2a", licitacaoId: "1432177", tipo: "data", quando: "2026-05-19T15:00",
    titulo: "Sessão pública adiada",
    antes: "2026-05-27", depois: "2026-06-10",
    impacta: ["Envio da proposta"],
  },
)
HISTORICO.push(
  { id: "rh2", licitacaoId: "1432210", origem: "agente", quando: "2026-05-21T08:41", autor: "Agente de Score",
    texto: "Recalculou o score: 74 → 61", versao: { agente: "Score", atual: 2, motivo: "Edital retificado (v2)" } },
)
