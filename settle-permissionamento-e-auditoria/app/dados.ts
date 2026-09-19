// Dados de exemplo e regras do console de permissionamento: funções (papéis),
// equipe, catálogo de ações por função e registros de auditoria.

export type Funcao = "somente-ver" | "editar-o-seu" | "editar-geral" | "administrador"

export const FUNCOES: Record<Funcao, { rotulo: string; descricao: string }> = {
  "somente-ver": {
    rotulo: "Visualizador",
    descricao: "Apenas visualiza licitações e dados. Não pode editar, comentar nem mover nada.",
  },
  "editar-o-seu": {
    rotulo: "Editor restrito",
    descricao: "Vê e edita somente as licitações em que é responsável; as demais nem aparecem para ela.",
  },
  "editar-geral": {
    rotulo: "Editor completo",
    descricao: "Vê e edita todas as licitações da organização, incluindo ações em lote.",
  },
  administrador: {
    rotulo: "Administrador",
    descricao: "Pode realizar todas as ações na plataforma, sem restrições.",
  },
}

export const ORDEM_FUNCOES = Object.keys(FUNCOES) as Funcao[]

/* ------------------------------------------------------------------ */
/* Equipe                                                              */
/* ------------------------------------------------------------------ */

export type Pessoa = {
  nome: string
  email: string
  funcao: Funcao
  status: "ativo" | "convidado"
  /** Texto relativo mostrado na tabela. */
  ultimoAcesso: string
  /** AAAA-MM-DD, usado no filtro de data. null = nunca acessou. */
  ultimoAcessoData: string | null
}

export const EQUIPE_INICIAL: Pessoa[] = [
  {
    nome: "Brunno Krier Martins",
    email: "brunno@acme.com.br",
    funcao: "administrador",
    status: "ativo",
    ultimoAcesso: "agora há pouco",
    ultimoAcessoData: "2026-06-22",
  },
  {
    nome: "Carla Mendes",
    email: "carla@acme.com.br",
    funcao: "editar-o-seu",
    status: "ativo",
    ultimoAcesso: "há 2 h",
    ultimoAcessoData: "2026-06-22",
  },
  {
    nome: "Diego Souza",
    email: "diego@acme.com.br",
    funcao: "editar-o-seu",
    status: "ativo",
    ultimoAcesso: "ontem",
    ultimoAcessoData: "2026-06-21",
  },
  {
    nome: "Alice Iglesias",
    email: "alice@acme.com.br",
    funcao: "editar-geral",
    status: "ativo",
    ultimoAcesso: "há 3 h",
    ultimoAcessoData: "2026-06-22",
  },
  {
    nome: "Gabriel Faria",
    email: "gabriel@acme.com.br",
    funcao: "editar-geral",
    status: "ativo",
    ultimoAcesso: "há 1 dia",
    ultimoAcessoData: "2026-06-21",
  },
  {
    nome: "Renata Lima",
    email: "renata@acme.com.br",
    funcao: "somente-ver",
    status: "ativo",
    ultimoAcesso: "há 5 dias",
    ultimoAcessoData: "2026-06-17",
  },
  {
    nome: "Paulo Costa",
    email: "paulo@acme.com.br",
    funcao: "somente-ver",
    status: "convidado",
    ultimoAcesso: "Ainda não acessou",
    ultimoAcessoData: null,
  },
]

export const ROTULO_STATUS: Record<Pessoa["status"], string> = {
  ativo: "Ativo",
  convidado: "Convite pendente",
}

/* ------------------------------------------------------------------ */
/* O que cada função faz                                               */
/* ------------------------------------------------------------------ */

// Escopo por função: A = todas as licitações, R = só onde é responsável, N = sem acesso.
export type Escopo = "all" | "responsible_only" | "none"
const A: Escopo = "all"
const R: Escopo = "responsible_only"
const N: Escopo = "none"

type Capacidade = { acao: string } & Record<Funcao, Escopo>

function cap(acao: string, sv: Escopo, es: Escopo, eg: Escopo, ad: Escopo): Capacidade {
  return {
    acao,
    "somente-ver": sv,
    "editar-o-seu": es,
    "editar-geral": eg,
    administrador: ad,
  }
}

export const CAPACIDADES: { area: string; itens: Capacidade[] }[] = [
  {
    area: "Licitações",
    itens: [
      cap("Ver a lista de licitações", A, R, A, A),
      cap("Abrir o detalhe de uma licitação", A, R, A, A),
      cap("Ver os itens da licitação", A, R, A, A),
      cap("Ver os arquivos da licitação", A, R, A, A),
      cap("Ver o termômetro / resumo (IA)", A, R, A, A),
      cap("Ver a análise técnica", A, R, A, A),
      cap("Ver o quadro (kanban / tabela / calendário)", A, R, A, A),
      cap("Ver licitações descartadas", A, A, A, A),
      cap("Buscar licitações no LicitaBank", A, A, A, A),
      cap("Enviar licitação para análise", N, R, A, A),
      cap("Mover licitação de status", N, R, A, A),
      cap("Marcar como ganha", N, R, A, A),
      cap("Marcar como perdida", N, R, A, A),
      cap("Ignorar licitação", N, R, A, A),
      cap("Descartar licitação", N, R, A, A),
      cap("Restaurar licitação descartada", N, R, A, A),
      cap("Mudar status em lote", N, N, A, A),
    ],
  },
  {
    area: "Responsáveis",
    itens: [
      cap("Ver responsáveis", A, R, A, A),
      cap("Atribuir responsável", N, R, A, A),
      cap("Remover responsável", N, R, A, A),
      cap("Atribuir responsáveis em lote", N, N, A, A),
    ],
  },
  {
    area: "Comentários",
    itens: [
      cap("Ver comentários", A, R, A, A),
      cap("Comentar", N, R, A, A),
      cap("Editar comentário", N, R, A, A),
      cap("Excluir comentário", N, R, A, A),
    ],
  },
  {
    area: "Análise técnica",
    itens: [
      cap("Editar a análise técnica", N, R, A, A),
      cap("Aceitar valores da análise", N, R, A, A),
      cap("Reprocessar a análise (IA)", N, R, A, A),
    ],
  },
  {
    area: "Requisitos de software",
    itens: [
      cap("Ver requisitos de software", A, R, A, A),
      cap("Criar requisito", N, R, A, A),
      cap("Editar requisito", N, R, A, A),
      cap("Excluir requisito", N, R, A, A),
      cap("Avaliar requisito", N, R, A, A),
      cap("Definir responsável por requisito", N, R, A, A),
      cap("Mudar status dos requisitos", N, R, A, A),
      cap("Gerenciar colunas dos requisitos", N, R, A, A),
      cap("Importar requisitos", N, N, A, A),
    ],
  },
  {
    area: "Exportação",
    itens: [
      cap("Exportar para CSV", A, R, A, A),
      cap("Exportar para XLSX", A, R, A, A),
      cap("Exportar requisitos", A, R, A, A),
    ],
  },
  {
    area: "Organização (admin)",
    itens: [
      cap("Convidar usuários", N, N, N, A),
      cap("Remover usuários", N, N, N, A),
      cap("Mudar a função de usuários", N, N, N, A),
      cap("Gerenciar segmentos", N, N, N, A),
      cap("Gerenciar órgãos e agências", N, N, N, A),
      cap("Gerenciar configurações da organização", N, N, N, A),
      cap("Ver a auditoria", N, N, N, A),
    ],
  },
]

/* ------------------------------------------------------------------ */
/* Auditoria                                                           */
/* ------------------------------------------------------------------ */

type Meta = {
  biddingId?: number
  biddingIds?: number[]
  status?: string
  view?: string
  query?: string
  email?: string
  [chave: string]: unknown
}

export type RegistroAuditoria = {
  /** "AAAA-MM-DD hh:mm:ss" */
  ts: string
  pessoa: string
  recurso: string
  escopo: "all" | "responsible_only" | null
  concedido: boolean
  meta: Meta
}

// Cobre todo o catálogo de recursos e os 4 cenários: concedido (all), concedido (responsible_only),
// negado por pertinência (escopo null) e negado por ownership (escopo responsible_only).
export const AUDITORIA: RegistroAuditoria[] = [
  // Hoje (22/06): administração e requisitos
  {
    ts: "2026-06-22 16:42:10",
    pessoa: "Brunno Krier Martins",
    recurso: "org.audit_log.view",
    escopo: "all",
    concedido: true,
    meta: { filterRange: "2026-06" },
  },
  {
    ts: "2026-06-22 16:38:51",
    pessoa: "Brunno Krier Martins",
    recurso: "org.settings.manage",
    escopo: "all",
    concedido: true,
    meta: { key: "retention_days" },
  },
  {
    ts: "2026-06-22 16:30:22",
    pessoa: "Brunno Krier Martins",
    recurso: "org.agencies.manage",
    escopo: "all",
    concedido: true,
    meta: { agencyId: 12 },
  },
  {
    ts: "2026-06-22 16:22:05",
    pessoa: "Brunno Krier Martins",
    recurso: "org.segments.manage",
    escopo: "all",
    concedido: true,
    meta: { segmentId: 4 },
  },
  {
    ts: "2026-06-22 16:15:40",
    pessoa: "Brunno Krier Martins",
    recurso: "org.user.change_role",
    escopo: "all",
    concedido: true,
    meta: { userId: "p9", role: "editar-o-seu" },
  },
  {
    ts: "2026-06-22 16:10:18",
    pessoa: "Brunno Krier Martins",
    recurso: "org.user.remove",
    escopo: "all",
    concedido: true,
    meta: { userId: "r7" },
  },
  {
    ts: "2026-06-22 16:03:55",
    pessoa: "Brunno Krier Martins",
    recurso: "org.user.invite",
    escopo: "all",
    concedido: true,
    meta: { email: "maria@acme.com.br" },
  },
  {
    ts: "2026-06-22 15:58:31",
    pessoa: "Alice Iglesias",
    recurso: "org.user.invite",
    escopo: null,
    concedido: false,
    meta: { email: "joao@acme.com.br" },
  },
  {
    ts: "2026-06-22 15:50:12",
    pessoa: "Gabriel Faria",
    recurso: "software_requirement.export",
    escopo: "all",
    concedido: true,
    meta: { softwareAnalysisId: 77 },
  },
  {
    ts: "2026-06-22 15:44:03",
    pessoa: "Alice Iglesias",
    recurso: "export.xlsx",
    escopo: "all",
    concedido: true,
    meta: { exportScope: "all" },
  },
  {
    ts: "2026-06-22 15:39:47",
    pessoa: "Carla Mendes",
    recurso: "export.csv",
    escopo: "responsible_only",
    concedido: true,
    meta: { exportScope: "own" },
  },
  {
    ts: "2026-06-22 15:31:09",
    pessoa: "Gabriel Faria",
    recurso: "software_requirement.import",
    escopo: "all",
    concedido: true,
    meta: { softwareAnalysisId: 77 },
  },
  {
    ts: "2026-06-22 15:25:33",
    pessoa: "Gabriel Faria",
    recurso: "software_requirement.columns.manage",
    escopo: "all",
    concedido: true,
    meta: { softwareAnalysisId: 77 },
  },
  {
    ts: "2026-06-22 15:18:50",
    pessoa: "Alice Iglesias",
    recurso: "software_requirement.status",
    escopo: "all",
    concedido: true,
    meta: { softwareAnalysisId: 77, status: "em_revisao" },
  },
  {
    ts: "2026-06-22 15:10:27",
    pessoa: "Gabriel Faria",
    recurso: "software_requirement.set_responsible",
    escopo: "all",
    concedido: true,
    meta: { requirementId: 515, userId: "d1" },
  },
  {
    ts: "2026-06-22 15:02:14",
    pessoa: "Diego Souza",
    recurso: "software_requirement.evaluate",
    escopo: "responsible_only",
    concedido: true,
    meta: { requirementId: 514 },
  },
  {
    ts: "2026-06-22 14:55:08",
    pessoa: "Alice Iglesias",
    recurso: "software_requirement.delete",
    escopo: "all",
    concedido: true,
    meta: { requirementId: 513 },
  },
  {
    ts: "2026-06-22 14:48:41",
    pessoa: "Alice Iglesias",
    recurso: "software_requirement.update",
    escopo: "all",
    concedido: true,
    meta: { requirementId: 512 },
  },
  {
    ts: "2026-06-22 14:40:19",
    pessoa: "Gabriel Faria",
    recurso: "software_requirement.create",
    escopo: "all",
    concedido: true,
    meta: { softwareAnalysisId: 77 },
  },
  {
    ts: "2026-06-22 14:33:02",
    pessoa: "Alice Iglesias",
    recurso: "software_requirement.view",
    escopo: "all",
    concedido: true,
    meta: { biddingId: 201 },
  },
  // Ontem (21/06): análise técnica, comentários, responsáveis, status, navegação
  {
    ts: "2026-06-21 17:50:33",
    pessoa: "Gabriel Faria",
    recurso: "biddings.technical_analysis.reextract",
    escopo: "all",
    concedido: true,
    meta: { biddingId: 201, summaryId: 7, fieldKey: "prazo" },
  },
  {
    ts: "2026-06-21 17:44:11",
    pessoa: "Gabriel Faria",
    recurso: "biddings.technical_analysis.accept",
    escopo: "all",
    concedido: true,
    meta: { biddingId: 201, summaryId: 7, fieldKey: "prazo" },
  },
  {
    ts: "2026-06-21 17:30:58",
    pessoa: "Carla Mendes",
    recurso: "biddings.technical_analysis.edit",
    escopo: "responsible_only",
    concedido: true,
    meta: { biddingId: 321 },
  },
  {
    ts: "2026-06-21 17:12:40",
    pessoa: "Paulo Costa",
    recurso: "biddings.technical_analysis.edit",
    escopo: null,
    concedido: false,
    meta: { biddingId: 201 },
  },
  {
    ts: "2026-06-21 16:58:22",
    pessoa: "Alice Iglesias",
    recurso: "comment.delete",
    escopo: "all",
    concedido: true,
    meta: { commentId: 91 },
  },
  {
    ts: "2026-06-21 16:40:05",
    pessoa: "Carla Mendes",
    recurso: "comment.update",
    escopo: "responsible_only",
    concedido: true,
    meta: { commentId: 88 },
  },
  {
    ts: "2026-06-21 16:22:47",
    pessoa: "Diego Souza",
    recurso: "comment.create",
    escopo: "responsible_only",
    concedido: true,
    meta: { biddingId: 332 },
  },
  {
    ts: "2026-06-21 16:05:13",
    pessoa: "Carla Mendes",
    recurso: "comment.view",
    escopo: "responsible_only",
    concedido: true,
    meta: { biddingId: 321 },
  },
  {
    ts: "2026-06-21 15:48:36",
    pessoa: "Gabriel Faria",
    recurso: "responsible.bulk",
    escopo: "all",
    concedido: true,
    meta: { biddingIds: [332, 340, 351], userIds: ["d1", "c2"] },
  },
  {
    ts: "2026-06-21 15:30:19",
    pessoa: "Alice Iglesias",
    recurso: "responsible.remove",
    escopo: "all",
    concedido: true,
    meta: { biddingId: 540, userId: "r2" },
  },
  {
    ts: "2026-06-21 15:12:51",
    pessoa: "Diego Souza",
    recurso: "responsible.add",
    escopo: "responsible_only",
    concedido: true,
    meta: { biddingId: 332, userId: "d1" },
  },
  {
    ts: "2026-06-21 14:55:30",
    pessoa: "Carla Mendes",
    recurso: "responsible.view",
    escopo: "responsible_only",
    concedido: true,
    meta: { biddingId: 321 },
  },
  {
    ts: "2026-06-21 14:36:12",
    pessoa: "Diego Souza",
    recurso: "biddings.status.move",
    escopo: "responsible_only",
    concedido: false,
    meta: { biddingId: 540, status: "LOST" },
  },
  {
    ts: "2026-06-21 14:20:44",
    pessoa: "Alice Iglesias",
    recurso: "biddings.status.bulk",
    escopo: "all",
    concedido: true,
    meta: {
      biddingIds: [412, 418, 431, 440, 455, 467, 471, 480, 492, 503, 511, 520],
      status: "IGNORED",
    },
  },
  {
    ts: "2026-06-21 14:05:27",
    pessoa: "Gabriel Faria",
    recurso: "biddings.status.restore",
    escopo: "all",
    concedido: true,
    meta: { biddingId: 418 },
  },
  {
    ts: "2026-06-21 13:50:03",
    pessoa: "Alice Iglesias",
    recurso: "biddings.status.discard",
    escopo: "all",
    concedido: true,
    meta: { biddingId: 418, reasonId: 3 },
  },
  {
    ts: "2026-06-21 13:32:48",
    pessoa: "Alice Iglesias",
    recurso: "biddings.status.ignore",
    escopo: "all",
    concedido: true,
    meta: { biddingId: 455 },
  },
  {
    ts: "2026-06-21 13:15:22",
    pessoa: "Diego Souza",
    recurso: "biddings.status.lose",
    escopo: "responsible_only",
    concedido: true,
    meta: { biddingId: 332 },
  },
  {
    ts: "2026-06-21 12:58:09",
    pessoa: "Carla Mendes",
    recurso: "biddings.status.win",
    escopo: "responsible_only",
    concedido: true,
    meta: { biddingId: 321 },
  },
  {
    ts: "2026-06-21 12:40:55",
    pessoa: "Carla Mendes",
    recurso: "biddings.status.move",
    escopo: "responsible_only",
    concedido: true,
    meta: { biddingId: 321, status: "WON" },
  },
  {
    ts: "2026-06-21 12:20:31",
    pessoa: "Renata Lima",
    recurso: "biddings.status.move",
    escopo: null,
    concedido: false,
    meta: { biddingId: 540, status: "LOST" },
  },
  {
    ts: "2026-06-21 12:02:17",
    pessoa: "Diego Souza",
    recurso: "biddings.send_to_analysis",
    escopo: "responsible_only",
    concedido: true,
    meta: { biddingId: 332 },
  },
  {
    ts: "2026-06-21 11:40:50",
    pessoa: "Alice Iglesias",
    recurso: "search.licitabank.view",
    escopo: "all",
    concedido: true,
    meta: { query: "CFTV" },
  },
  {
    ts: "2026-06-21 11:20:14",
    pessoa: "Paulo Costa",
    recurso: "discarded.list.view",
    escopo: "all",
    concedido: true,
    meta: { tab: "descartadas" },
  },
  {
    ts: "2026-06-21 11:00:38",
    pessoa: "Renata Lima",
    recurso: "workflow.board.view",
    escopo: "all",
    concedido: true,
    meta: { view: "kanban" },
  },
  {
    ts: "2026-06-21 10:42:05",
    pessoa: "Gabriel Faria",
    recurso: "biddings.technical_analysis.view",
    escopo: "all",
    concedido: true,
    meta: { biddingId: 201 },
  },
  {
    ts: "2026-06-21 10:20:49",
    pessoa: "Alice Iglesias",
    recurso: "biddings.summary.thermometer.view",
    escopo: "all",
    concedido: true,
    meta: { biddingId: 540 },
  },
  {
    ts: "2026-06-21 10:00:12",
    pessoa: "Diego Souza",
    recurso: "biddings.detail.files.view",
    escopo: "responsible_only",
    concedido: true,
    meta: { biddingId: 332 },
  },
  {
    ts: "2026-06-21 09:40:27",
    pessoa: "Carla Mendes",
    recurso: "biddings.detail.items.view",
    escopo: "responsible_only",
    concedido: true,
    meta: { biddingId: 321 },
  },
  {
    ts: "2026-06-21 09:20:53",
    pessoa: "Carla Mendes",
    recurso: "biddings.detail.view",
    escopo: "responsible_only",
    concedido: true,
    meta: { biddingId: 321 },
  },
  {
    ts: "2026-06-21 09:00:31",
    pessoa: "Renata Lima",
    recurso: "biddings.list",
    escopo: "all",
    concedido: true,
    meta: { tab: "em_andamento" },
  },
]

const STATUS_PT: Record<string, string> = {
  WON: "Ganha",
  LOST: "Perdida",
  IGNORED: "Ignorada",
}

// Para cada recurso: g = ação concluída (concedida); inf = infinitivo para "tentou ___" (negada).
type Frase = { g: string; inf: string }
const lic = (m: Meta) => `a licitação nº ${m.biddingId}`
const EVENTOS: Record<string, (m: Meta) => Frase> = {
  "biddings.list": () => ({
    g: "abriu a lista de licitações",
    inf: "abrir a lista de licitações",
  }),
  "biddings.detail.view": (m) => ({
    g: `abriu o detalhe da licitação nº ${m.biddingId}`,
    inf: `abrir o detalhe da licitação nº ${m.biddingId}`,
  }),
  "biddings.detail.items.view": (m) => ({
    g: `viu os itens da licitação nº ${m.biddingId}`,
    inf: `ver os itens da licitação nº ${m.biddingId}`,
  }),
  "biddings.detail.files.view": (m) => ({
    g: `viu os arquivos da licitação nº ${m.biddingId}`,
    inf: `ver os arquivos da licitação nº ${m.biddingId}`,
  }),
  "biddings.summary.thermometer.view": (m) => ({
    g: `viu o termômetro da licitação nº ${m.biddingId}`,
    inf: `ver o termômetro da licitação nº ${m.biddingId}`,
  }),
  "biddings.technical_analysis.view": (m) => ({
    g: `viu a análise técnica da licitação nº ${m.biddingId}`,
    inf: `ver a análise técnica da licitação nº ${m.biddingId}`,
  }),
  "workflow.board.view": (m) => ({
    g: `abriu o quadro (${m.view})`,
    inf: `abrir o quadro (${m.view})`,
  }),
  "discarded.list.view": () => ({
    g: "abriu as licitações descartadas",
    inf: "abrir as licitações descartadas",
  }),
  "search.licitabank.view": (m) => ({
    g: `buscou "${m.query}" no LicitaBank`,
    inf: "buscar no LicitaBank",
  }),
  "biddings.send_to_analysis": (m) => ({
    g: `enviou ${lic(m)} para análise`,
    inf: `enviar ${lic(m)} para análise`,
  }),
  "biddings.status.move": (m) => ({
    g: `moveu ${lic(m)}${m.status ? ` para ${STATUS_PT[m.status] ?? m.status}` : ""}`,
    inf: `mover ${lic(m)}`,
  }),
  "biddings.status.win": (m) => ({
    g: `marcou ${lic(m)} como ganha`,
    inf: `marcar ${lic(m)} como ganha`,
  }),
  "biddings.status.lose": (m) => ({
    g: `marcou ${lic(m)} como perdida`,
    inf: `marcar ${lic(m)} como perdida`,
  }),
  "biddings.status.ignore": (m) => ({
    g: `ignorou ${lic(m)}`,
    inf: `ignorar ${lic(m)}`,
  }),
  "biddings.status.discard": (m) => ({
    g: `descartou ${lic(m)}`,
    inf: `descartar ${lic(m)}`,
  }),
  "biddings.status.restore": (m) => ({
    g: `restaurou ${lic(m)}`,
    inf: `restaurar ${lic(m)}`,
  }),
  "biddings.status.bulk": (m) => ({
    g: `mudou o status de ${(m.biddingIds ?? []).length} licitações em lote`,
    inf: `mudar o status de ${(m.biddingIds ?? []).length} licitações em lote`,
  }),
  "responsible.view": (m) => ({
    g: `viu os responsáveis da licitação nº ${m.biddingId}`,
    inf: `ver os responsáveis da licitação nº ${m.biddingId}`,
  }),
  "responsible.add": (m) => ({
    g: `atribuiu um responsável à licitação nº ${m.biddingId}`,
    inf: `atribuir um responsável à licitação nº ${m.biddingId}`,
  }),
  "responsible.remove": (m) => ({
    g: `removeu um responsável da licitação nº ${m.biddingId}`,
    inf: `remover um responsável da licitação nº ${m.biddingId}`,
  }),
  "responsible.bulk": (m) => ({
    g: `atribuiu responsáveis a ${(m.biddingIds ?? []).length} licitações em lote`,
    inf: `atribuir responsáveis a ${(m.biddingIds ?? []).length} licitações em lote`,
  }),
  "comment.view": (m) => ({
    g: `viu os comentários da licitação nº ${m.biddingId}`,
    inf: `ver os comentários da licitação nº ${m.biddingId}`,
  }),
  "comment.create": (m) => ({
    g: `comentou na licitação nº ${m.biddingId}`,
    inf: `comentar na licitação nº ${m.biddingId}`,
  }),
  "comment.update": () => ({
    g: "editou um comentário",
    inf: "editar um comentário",
  }),
  "comment.delete": () => ({
    g: "excluiu um comentário",
    inf: "excluir um comentário",
  }),
  "biddings.technical_analysis.edit": (m) => ({
    g: `editou a análise técnica da licitação nº ${m.biddingId}`,
    inf: `editar a análise técnica da licitação nº ${m.biddingId}`,
  }),
  "biddings.technical_analysis.accept": (m) => ({
    g: `aceitou um valor da análise da licitação nº ${m.biddingId}`,
    inf: `aceitar um valor da análise da licitação nº ${m.biddingId}`,
  }),
  "biddings.technical_analysis.reextract": (m) => ({
    g: `reprocessou a análise da licitação nº ${m.biddingId}`,
    inf: `reprocessar a análise da licitação nº ${m.biddingId}`,
  }),
  "software_requirement.view": (m) => ({
    g: `viu os requisitos da licitação nº ${m.biddingId}`,
    inf: `ver os requisitos da licitação nº ${m.biddingId}`,
  }),
  "software_requirement.create": () => ({
    g: "criou um requisito de software",
    inf: "criar um requisito de software",
  }),
  "software_requirement.update": () => ({
    g: "editou um requisito de software",
    inf: "editar um requisito de software",
  }),
  "software_requirement.delete": () => ({
    g: "excluiu um requisito de software",
    inf: "excluir um requisito de software",
  }),
  "software_requirement.evaluate": () => ({
    g: "avaliou um requisito de software",
    inf: "avaliar um requisito de software",
  }),
  "software_requirement.set_responsible": () => ({
    g: "definiu o responsável por um requisito",
    inf: "definir o responsável por um requisito",
  }),
  "software_requirement.status": () => ({
    g: "mudou o status dos requisitos",
    inf: "mudar o status dos requisitos",
  }),
  "software_requirement.columns.manage": () => ({
    g: "ajustou as colunas dos requisitos",
    inf: "ajustar as colunas dos requisitos",
  }),
  "software_requirement.import": () => ({
    g: "importou requisitos de software",
    inf: "importar requisitos de software",
  }),
  "export.csv": () => ({ g: "exportou um CSV", inf: "exportar um CSV" }),
  "export.xlsx": () => ({
    g: "exportou uma planilha (XLSX)",
    inf: "exportar uma planilha (XLSX)",
  }),
  "software_requirement.export": () => ({
    g: "exportou os requisitos de software",
    inf: "exportar os requisitos de software",
  }),
  "org.user.invite": (m) => ({
    g: `convidou o usuário ${m.email}`,
    inf: "convidar um usuário",
  }),
  "org.user.remove": () => ({
    g: "removeu um usuário",
    inf: "remover um usuário",
  }),
  "org.user.change_role": () => ({
    g: "mudou a função de um usuário",
    inf: "mudar a função de um usuário",
  }),
  "org.segments.manage": () => ({
    g: "gerenciou os segmentos",
    inf: "gerenciar os segmentos",
  }),
  "org.agencies.manage": () => ({
    g: "gerenciou os órgãos e agências",
    inf: "gerenciar os órgãos e agências",
  }),
  "org.settings.manage": () => ({
    g: "alterou as configurações da organização",
    inf: "alterar as configurações da organização",
  }),
  "org.audit_log.view": () => ({
    g: "abriu a auditoria",
    inf: "abrir a auditoria",
  }),
}

/** Evento em linguagem natural, com o metadado costurado na frase. */
export function fraseDoEvento(a: RegistroAuditoria) {
  const f = EVENTOS[a.recurso]
  const e = f ? f(a.meta) : { g: a.recurso, inf: a.recurso }
  const frase = a.concedido ? e.g : `tentou ${e.inf} e o acesso foi negado (403)`
  return frase.charAt(0).toUpperCase() + frase.slice(1)
}

/** Área do recurso, usada no filtro "Tipo de evento". */
export function areaDoRecurso(recurso: string) {
  if (recurso.startsWith("org.")) return "Organização"
  if (recurso.includes("technical_analysis")) return "Análise técnica"
  if (recurso.startsWith("software_requirement")) return "Requisitos de software"
  if (recurso.startsWith("export.")) return "Exportação"
  if (recurso.startsWith("comment.")) return "Comentários"
  if (recurso.startsWith("responsible.")) return "Responsáveis"
  return "Licitações"
}

/** "2026-06-22 16:42:10" → "22/06/2026 às 16:42:10" */
export function formatarDataHora(ts: string) {
  const [data, hora] = ts.split(" ")
  const [a, m, d] = data.split("-")
  return `${d}/${m}/${a} às ${hora}`
}

export const chaveDoRegistro = (a: RegistroAuditoria) => `${a.ts}|${a.pessoa}|${a.recurso}`

/* ------------------------------------------------------------------ */
/* Filtros por coluna                                                  */
/* ------------------------------------------------------------------ */

/** Lista: valores marcados. Data: intervalo AAAA-MM-DD. */
export type ValorFiltro = string[] | { de?: string; ate?: string }

export function filtroAtivo(v: ValorFiltro | undefined) {
  if (!v) return false
  return Array.isArray(v) ? v.length > 0 : Boolean(v.de || v.ate)
}

export function passaLista(v: ValorFiltro | undefined, valor: string) {
  if (!v || !Array.isArray(v) || !v.length) return true
  return v.some((x) => x.toLowerCase() === valor.toLowerCase())
}

export function passaData(v: ValorFiltro | undefined, data: string | null) {
  if (!v || Array.isArray(v) || (!v.de && !v.ate)) return true
  if (!data) return false
  return (!v.de || data >= v.de) && (!v.ate || data <= v.ate)
}

export const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`
