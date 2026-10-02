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

export type TipoAtualizacao = "data" | "arquivo" | "manifestacao" | "status" | "orgao"

export const ROTULO_DO_TIPO: Record<TipoAtualizacao, string> = {
  data: "Data da sessão",
  arquivo: "Arquivo",
  manifestacao: "Manifestação",
  status: "Status do edital",
  orgao: "Órgão",
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
  /** Ninguém tinha editado o dado: o sistema aplicou sozinho (data, status, órgão). */
  automatica?: boolean
  /** Alguém da empresa tinha editado o valor à mão (data, status): o portal não sobrescreve, pede decisão. */
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
    antes: "2026-05-26", depois: "2026-05-23", antecipou: true, automatica: true,
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
    antes: "Abertas para participação", depois: "Suspensa", automatica: true,
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

/* Recomendadas (ainda fora do pipeline): o selo vale igual, 7 dias ou até abrir o sheet.
   Um exemplo do card do Notion em cada card de Recomendadas. */
ATUALIZACOES.push(
  // "chegou um novo TR, como ele pode comparar o antigo com o novo"
  {
    id: "r1a", licitacaoId: "1078513", tipo: "arquivo", quando: "2026-05-21T08:30",
    titulo: "Termo de Referência retificado",
    impacta: ["Itens com correspondência", "Habilitação"],
    arquivo: {
      nome: "Termo de Referência",
      versaoAnterior: "TR_90001-2026_v1.pdf · 12/05",
      versaoNova: "TR_90001-2026_v2_retificado.pdf · 21/05",
      trechos: [
        {
          secao: "Lote 2 · Notebook 14\"",
          antes: "Processador i5, 8 GB de RAM e SSD de 256 GB.",
          depois: "Processador i5, 16 GB de RAM e SSD de 512 GB.",
        },
        {
          secao: "8.1 Garantia",
          antes: "Garantia de 36 meses com suporte on-site.",
          depois: "Garantia de 48 meses com suporte on-site em até 24 horas.",
        },
      ],
    },
  },
  // "data de pregão: ela adiantou ao invés de postergar"
  {
    id: "r2a", licitacaoId: "1099842", tipo: "data", quando: "2026-05-20T15:00",
    titulo: "Sessão pública adiantada",
    antes: "2026-06-03", depois: "2026-05-27", antecipou: true, automatica: true,
    impacta: ["Envio da proposta"],
  },
  // "chegou a resposta de um questionamento sobre habilitação"
  {
    id: "r3a", licitacaoId: "1065217", tipo: "manifestacao", quando: "2026-05-21T10:05",
    titulo: "Questionamento sobre habilitação respondido",
    impacta: ["Habilitação"],
    manifestacao: {
      pergunta: "O atestado de capacidade técnica pode ser de fornecimento a hospital privado?",
      resposta: "Sim. Serão aceitos atestados emitidos por pessoa jurídica de direito público ou privado.",
    },
  },
)
HISTORICO.push(
  { id: "rh1", licitacaoId: "1078513", origem: "agente", quando: "2026-05-21T08:41", autor: "Agente de Match",
    texto: "Refez o match de itens: 29 → 31 itens", versao: { agente: "Match de itens", atual: 2, motivo: "Termo de Referência retificado (v2)" } },
  { id: "rh2", licitacaoId: "1065217", origem: "agente", quando: "2026-05-21T10:12", autor: "Agente de Habilitação",
    texto: "Gerou a versão 2 do checklist de Habilitação", detalhe: "Atestado de capacidade técnica: agora aceita emissor privado.",
    versao: { agente: "Checklist de Habilitação", atual: 2, motivo: "Questionamento sobre habilitação respondido" } },
)

/* Tipos de atualização levantados na reunião de 02/10 (documento de resultado/adjudicação,
   nome do órgão, status com conflito) e ações que o histórico registra. */
ATUALIZACOES.push(
  // documento de resultado: qualquer arquivo novo é atualização
  {
    id: "a7", licitacaoId: "1429401", tipo: "arquivo", quando: "2026-05-20T11:20",
    titulo: "Novo documento: Termo de adjudicação",
    depois: "Termo_de_Adjudicacao_045-2026.pdf",
    impacta: ["Resultado"],
  },
  // o órgão chega como unidade (UASG) e depois o portal traz o nome
  {
    id: "a8", licitacaoId: "1430340", tipo: "orgao", quando: "2026-05-19T09:30",
    titulo: "Nome do órgão atualizado",
    antes: "UASG 200366", depois: "Ministério da Justiça / Polícia Federal, Superintendência DF", automatica: true,
  },
  // status editado à mão + portal traz outro: decisão do cliente
  {
    id: "a9", licitacaoId: "1430210", tipo: "status", quando: "2026-05-21T07:50",
    titulo: "Licitação suspensa pelo órgão",
    antes: "Em disputa ou Homologação", depois: "Suspensa",
    conflito: { valorManual: "Homologada", autor: "Ana Lima" },
    impacta: ["Etapa no board"],
  },
)
HISTORICO.push(
  { id: "h20", licitacaoId: "1429401", origem: "pessoa", quando: "2026-05-12T16:00", autor: "Brunno Krier Martins",
    texto: "Definiu o resultado: Ganhou e foi habilitado" },
  { id: "h21", licitacaoId: "1430210", origem: "pessoa", quando: "2026-05-18T10:15", autor: "Ana Lima",
    texto: "Alterou o status de Em disputa ou Homologação para Homologada" },
  // 112/2026: descarte, recuperação, salvar para depois e notificações
  { id: "h22", licitacaoId: "1430952", origem: "pessoa", quando: "2026-05-16T14:30", autor: "Carla Souza",
    texto: "Recuperou a licitação das Descartadas" },
  { id: "h23", licitacaoId: "1430952", origem: "pessoa", quando: "2026-05-15T09:10", autor: "Diego Pires",
    texto: "Descartou a licitação", detalhe: "Motivo: fora do segmento de atuação." },
  { id: "h24", licitacaoId: "1430952", origem: "pessoa", quando: "2026-05-14T17:40", autor: "Carla Souza",
    texto: "Ativou as notificações da licitação" },
  { id: "h25", licitacaoId: "1430952", origem: "pessoa", quando: "2026-05-14T17:38", autor: "Carla Souza",
    texto: "Salvou para depois" },
)

/* ------------------------------------------------------------------ */
/* Comentários: o recurso Comentários da licitação (conversa do time no */
/* card, como em produção). Não entram no Histórico.                    */
/* ------------------------------------------------------------------ */

export type Comentario = { id: string; licitacaoId: string; autor: string; quando: string; texto: string }

export const COMENTARIOS: Comentario[] = [
  { id: "c1", licitacaoId: "1431011", autor: "Fabio Almeida Lopes Pereira", quando: "2026-05-20T17:05",
    texto: "Com 8.000 m² nosso atestado não atende. Vale questionar?" },
  { id: "c2", licitacaoId: "1431011", autor: "Maria da Silva", quando: "2026-05-15T10:20",
    texto: "Fabio, valida o ponto 7.1 do TR (qualificação técnica)." },
  { id: "c3", licitacaoId: "1430715", autor: "Gustavo Néri", quando: "2026-05-16T15:50",
    texto: "Mudei o envio para 29/05 porque o portal ainda mostrava a data antiga." },
  { id: "c4", licitacaoId: "1078513", autor: "Juliana Santos", quando: "2026-05-21T09:00",
    texto: "Marcos, confere se o notebook de 16 GB entra no nosso catálogo." },
]


/** Formato de produção: "14/09/2026 às 14:44". */
export const dataDoComentario = (quando: string) =>
  `${quando.slice(8, 10)}/${quando.slice(5, 7)}/${quando.slice(0, 4)} às ${quando.slice(11, 16)}`
