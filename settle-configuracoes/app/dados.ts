// Dados de exemplo da área de Configurações da organização (regras em ../REGRAS.md).

/* ======================= PAPÉIS ======================= */

export type Papel = "admin" | "editor" | "restrito" | "visual"

export const PAPEIS: Record<Papel, string> = {
  admin: "Administrador",
  editor: "Editor completo",
  restrito: "Editor restrito",
  visual: "Visualizador",
}

export const ADMINS = ["Brunno Krier", "Larissa Almeida", "Bruno Ortiz", "Andre Damiano", "Alice Iglesias", "Malou Chlapec"]

/* ======================= ROTAS ======================= */

export type Rota = "inicio" | "etapas" | "abas" | "motivos" | "card" | "email" | "equipe" | "permissoes" | "auditoria" | "agentes" | "variaveis" | "artefato"

export const NOMES: Record<Rota, string> = {
  inicio: "Configurações",
  etapas: "Etapas do funil",
  abas: "Abas das listas",
  motivos: "Motivos de descarte e perda",
  card: "Campos do card",
  email: "Modelo de e-mail",
  equipe: "Equipe",
  permissoes: "Permissões",
  auditoria: "Auditoria",
  agentes: "Agentes",
  variaveis: "Variáveis",
  artefato: "Artefato",
}

/* Agentes fica de fora: quem não é administrador entra para responder Aprovações. */
export const SO_ADMIN: Rota[] = ["etapas", "abas", "motivos", "card", "email", "equipe", "permissoes", "auditoria", "variaveis", "artefato"]

/* ======================= ETAPAS ======================= */

export type TipoEtapa = "entrada" | "meio" | "saida"

/** Cor do marcador da etapa: cores de categoria do tema (sem ordem de valor). */
export type CorEtapa = "category-1" | "category-2" | "category-4" | "category-5" | "category-6" | "category-7" | "category-8" | "category-3" | "neutra"

export const CLASSE_COR_ETAPA: Record<CorEtapa, string> = {
  "category-1": "bg-category-1",
  "category-2": "bg-category-2",
  "category-3": "bg-category-3",
  "category-4": "bg-category-4",
  "category-5": "bg-category-5",
  "category-6": "bg-category-6",
  "category-7": "bg-category-7",
  "category-8": "bg-category-8",
  neutra: "bg-muted-foreground/60",
}

/** Cores das etapas novas, em rodízio. */
export const CORES_NOVAS: CorEtapa[] = ["category-6", "category-7", "category-3", "category-1", "category-8"]

export type Etapa = { id: string; nome: string; cor: CorEtapa; qtd: number; tipo: TipoEtapa }

export const ETAPAS: Etapa[] = [
  { id: "e1", nome: "Análise de Oportunidades", cor: "category-1", qtd: 49, tipo: "entrada" },
  { id: "e2", nome: "Suspensa", cor: "neutra", qtd: 13, tipo: "meio" },
  { id: "e3", nome: "Preparação de Proposta", cor: "category-4", qtd: 13, tipo: "meio" },
  { id: "e4", nome: "Disputa de Classificação", cor: "category-5", qtd: 2, tipo: "meio" },
  { id: "e5", nome: "Processo de Habilitação", cor: "category-6", qtd: 1, tipo: "meio" },
  { id: "e6", nome: "Fase de Recursos", cor: "category-8", qtd: 0, tipo: "meio" },
  { id: "e7", nome: "Resultados Finais", cor: "category-2", qtd: 27, tipo: "saida" },
]

/* ======================= MOTIVOS ======================= */

export type TipoMotivo = "descarte" | "perda"

export type Motivo = {
  id: string
  nome: string
  uso: number
  /** Aparece em Recomendadas / Em andamento (quando as listas não são unificadas). */
  rec: boolean
  and: boolean
  tipo: TipoMotivo
  arq: boolean
  /** Pede descrição ao ser escolhido. */
  desc: boolean
}

const DESCARTE: [string, number, boolean, boolean][] = [
  ["Não atende requisitos técnicos", 412, true, true],
  ["Valor abaixo do desejado", 388, true, false],
  ["Prazo inadequado para elaboração proposta", 201, false, true],
  ["Falta de capacidade técnica/operacional", 164, false, true],
  ["Conflito de interesse", 12, false, true],
  ["Documentação técnica restritiva/direcionado", 97, false, true],
  ["Fora da área que quer atuar", 540, true, false],
  ["Minha empresa não atende esse produto / serviço", 1033, true, false],
  ["Órgão indesejado", 287, true, false],
  ["Valor indesejado", 142, true, false],
  ["Região indesejada", 356, true, false],
  ["Prazo muito próximo", 219, true, true],
  ["Duplicado", 88, true, true],
  ["Revenda", 34, true, false],
]

const PERDA: [string, number][] = [
  ["Preço acima do vencedor", 11],
  ["Inabilitação documental", 5],
  ["Desclassificação da proposta técnica", 3],
  ["Recurso não provido", 2],
  ["Não participou da disputa", 4],
  ["Licitação revogada ou fracassada", 2],
]

export const MOTIVOS: Motivo[] = [
  ...DESCARTE.map(([nome, uso, rec, and], i): Motivo => ({
    id: `d${i}`,
    nome,
    uso,
    rec,
    and,
    tipo: "descarte",
    arq: false,
    desc: i === 4,
  })),
  ...PERDA.map(([nome, uso], i): Motivo => ({
    id: `p${i}`,
    nome,
    uso,
    rec: false,
    and: true,
    tipo: "perda",
    arq: false,
    desc: i === 1 || i === 2,
  })),
]

/* ======================= ABAS DAS LISTAS ======================= */

export type TelaAba = "recomendadas" | "descartadas"

export const TELAS: Record<TelaAba, string> = {
  recomendadas: "Recomendadas",
  descartadas: "Descartadas",
}

export type Faixa = { min: string; max: string }
export type ValorFiltro = string[] | string | Faixa
export type FiltroAba = { k: string; v: ValorFiltro }
export type Aba = { id: string; nome: string; fixa?: boolean; f: FiltroAba[] }

export const ABAS: Record<TelaAba, Aba[]> = {
  recomendadas: [
    { id: "a0", nome: "Todas", fixa: true, f: [] },
    { id: "a1", nome: "Ativas", f: [{ k: "situacao", v: ["Ativas"] }] },
    { id: "a2", nome: "Chegou hoje", f: [{ k: "adicao", v: "Últimas 24h" }] },
    { id: "a3", nome: "Vencendo em breve", f: [{ k: "envio", v: "Próximos 7 dias" }] },
  ],
  descartadas: [
    { id: "c0", nome: "Todas", fixa: true, f: [] },
    { id: "c1", nome: "Hoje", f: [{ k: "descarte", v: "Últimas 24h" }] },
    { id: "c2", nome: "Últimos 7 dias", f: [{ k: "descarte", v: "Últimos 7 dias" }] },
    { id: "c3", nome: "Últimos 30 dias", f: [{ k: "descarte", v: "Últimos 30 dias" }] },
  ],
}

/* Filtros que uma aba pode guardar: os mesmos do painel Filtrar da plataforma
   (mesma ordem e mesmos rótulos), mais as variáveis da organização. */
const PASSADO = ["Últimas 24h", "Últimos 7 dias", "Últimos 30 dias"]
const FUTURO = ["Próximos 7 dias", "Próximos 15 dias", "Próximos 30 dias"]

export type DefFiltro = {
  k: string
  n: string
  t: "list" | "range" | "date"
  ops?: string[]
  pre?: string
  telas?: TelaAba[]
  variavel?: boolean
}

export const FILTROS: DefFiltro[] = [
  { k: "situacao", n: "Situação", t: "list", ops: ["Ativas", "Suspensas", "Encerradas"] },
  { k: "segmento", n: "Segmento", t: "list", ops: ["Software", "Produtos", "Serviços", "Obras"] },
  { k: "valor", n: "Valor global", t: "range", pre: "R$" },
  { k: "score", n: "Score", t: "range" },
  { k: "estado", n: "Estado", t: "list", ops: ["SP", "RJ", "MG", "PR", "RS", "SC", "BA", "MA", "GO", "DF"] },
  {
    k: "cidade",
    n: "Cidade",
    t: "list",
    ops: ["São Paulo", "Limeira", "Campinas", "Belo Horizonte", "Curitiba", "Porto Alegre", "Santo Antônio dos Lopes"],
  },
  {
    k: "orgao",
    n: "Órgão ou Unidade",
    t: "list",
    ops: [
      "Prefeitura Municipal de Limeira",
      "Secretaria de Estado da Saúde de SP",
      "Tribunal de Justiça de MG",
      "Universidade Federal de Pelotas",
      "Secretaria Municipal da Fazenda",
    ],
  },
  {
    k: "responsavel",
    n: "Responsável",
    t: "list",
    ops: ["Eu (quem está vendo)", "Sem responsável", "Mateus Brum", "Larissa Almeida", "Alice Iglesias"],
  },
  { k: "adicao", n: "Data de adição", t: "date", ops: PASSADO },
  { k: "atualizacao", n: "Data de atualização", t: "date", ops: PASSADO },
  { k: "envio", n: "Prazo de envio", t: "date", ops: FUTURO, telas: ["recomendadas"] },
  {
    k: "descartadaPor",
    n: "Descartada por",
    t: "list",
    ops: ["Larissa Almeida", "Mateus Brum", "Alice Iglesias", "Bruno Ortiz"],
    telas: ["descartadas"],
  },
  { k: "descarte", n: "Data do descarte", t: "date", ops: PASSADO, telas: ["descartadas"] },
  {
    k: "motivo",
    n: "Motivo do descarte",
    t: "list",
    ops: [
      "Não atende requisitos técnicos",
      "Valor abaixo do desejado",
      "Fora da área que quer atuar",
      "Minha empresa não atende esse produto / serviço",
      "Órgão indesejado",
      "Região indesejada",
      "Outros",
    ],
    telas: ["descartadas"],
  },
  {
    k: "etapa",
    n: "Etapa na qual ocorreu o descarte",
    t: "list",
    ops: ["Recomendadas", "Em andamento"],
    telas: ["descartadas"],
  },
  { k: "tipo", n: "Tipo", t: "list", ops: ["Produto", "Serviço", "Obra"] },
  { k: "capagE", n: "CAPAG Estadual", t: "list", ops: ["A+", "A", "B", "C", "D"] },
  { k: "capagM", n: "CAPAG Municipal", t: "list", ops: ["A+", "A", "B", "C", "D"] },
  {
    k: "julgamento",
    n: "Forma de julgamento",
    t: "list",
    ops: ["Menor preço", "Menor preço global", "Maior desconto", "Técnica e preço"],
  },
  { k: "populacao", n: "População", t: "range" },
  { k: "amostra", n: "Exige amostra", t: "list", ops: ["Sim", "Não", "Não encontrado"], variavel: true },
  { k: "visita", n: "Visita técnica obrigatória", t: "list", ops: ["Sim", "Não", "Não encontrado"], variavel: true },
]

export const defFiltro = (k: string) => FILTROS.find((f) => f.k === k)!

const numero = (n: string) => Number(n).toLocaleString("pt-BR")

export function temValor(x: FiltroAba) {
  const d = defFiltro(x.k)
  if (d.t === "list") return Array.isArray(x.v) && x.v.length > 0
  if (d.t === "date") return typeof x.v === "string" && !!x.v
  const v = x.v as Faixa
  return !!v && (v.min !== "" || v.max !== "")
}

/** Texto do valor no selo do filtro (ex.: "3 selecionados", "a partir de R$ 100.000"). */
export function resumoFiltro(x: FiltroAba) {
  const d = defFiltro(x.k)
  if (d.t === "list") {
    const v = x.v as string[]
    return v.length === 1 ? v[0] : `${v.length} selecionados`
  }
  if (d.t === "date") return x.v as string
  const p = d.pre ? `${d.pre} ` : ""
  const { min, max } = x.v as Faixa
  if (min !== "" && max !== "") return `${p}${numero(min)} a ${p}${numero(max)}`
  return min !== "" ? `a partir de ${p}${numero(min)}` : `até ${p}${numero(max)}`
}

/* ======================= CAMPOS DO CARD ======================= */

export type GrupoCampo = "destaque" | "datas" | "meta" | "itens"

export type Campo = {
  id: string
  nome: string
  g: GrupoCampo
  on: boolean
  /** Variável adicionada pela organização (ou da Settle) à grade de metadados. */
  var?: boolean
  origem?: OrigemVar
}

export const GRUPOS_CAMPO: [GrupoCampo, string, string][] = [
  ["destaque", "Destaque", "abaixo do número do edital"],
  ["datas", "Datas", "coluna da esquerda"],
  ["meta", "Metadados", "qualquer variável da organização pode entrar aqui"],
  ["itens", "Itens", ""],
]

export const CAMPOS: Campo[] = [
  { id: "segmento", nome: "Segmento", g: "destaque", on: true },
  { id: "orgao", nome: "Órgão", g: "destaque", on: true },
  { id: "me", nome: "ME/EPP", g: "destaque", on: true },
  { id: "objeto", nome: "Objeto", g: "destaque", on: true },
  { id: "valor", nome: "Valor global", g: "destaque", on: true },
  { id: "adicionada", nome: "Adicionada", g: "datas", on: true },
  { id: "atualizada", nome: "Atualizada", g: "datas", on: true },
  { id: "envio", nome: "Envio da proposta", g: "datas", on: true },
  { id: "id", nome: "ID", g: "meta", on: true },
  { id: "julgamento", nome: "Julgamento", g: "meta", on: true },
  { id: "portal", nome: "Portal de Disputa", g: "meta", on: true },
  { id: "estado", nome: "Estado", g: "meta", on: true },
  { id: "capagE", nome: "CAPAG Estadual", g: "meta", on: true },
  { id: "modalidade", nome: "Modalidade", g: "meta", on: true },
  { id: "uasg", nome: "UASG", g: "meta", on: true },
  { id: "cidade", nome: "Cidade", g: "meta", on: true },
  { id: "capagM", nome: "CAPAG Municipal", g: "meta", on: true },
  { id: "habitantes", nome: "Habitantes", g: "meta", on: true },
  { id: "substatus", nome: "Substatus", g: "meta", on: true },
  { id: "descricao", nome: "Descrição", g: "meta", on: true },
  { id: "itens", nome: "Itens com correspondência", g: "itens", on: true },
]

export const OPCOES_MAX_ITENS = [3, 5, 10, 0]

/* ======================= VARIÁVEIS ======================= */

export type OrigemVar = "settle" | "minha"

/** Catálogo de variáveis: as da Settle (somente leitura) e as criadas pela organização em Variáveis. */
export type Variavel = { k: string; n: string; o: OrigemVar; tipo?: string }

export const VARS: Variavel[] = [
  { k: "edital", n: "Número do edital", o: "settle" },
  { k: "orgao", n: "Órgão", o: "settle" },
  { k: "objeto", n: "Objeto", o: "settle" },
  { k: "valor", n: "Valor global", o: "settle" },
  { k: "envio", n: "Envio da proposta", o: "settle" },
  { k: "modalidade", n: "Modalidade", o: "settle" },
  { k: "portal", n: "Portal de disputa", o: "settle" },
  { k: "cidade", n: "Cidade/UF", o: "settle" },
  { k: "score", n: "Score", o: "settle" },
  { k: "responsavel", n: "Responsável", o: "settle" },
  { k: "link", n: "Link da licitação", o: "settle" },
  { k: "impugnacao", n: "Prazo de impugnação", o: "settle", tipo: "data" },
  { k: "local_entrega", n: "Local de entrega", o: "settle", tipo: "texto" },
  { k: "prazo_entrega", n: "Prazo de entrega", o: "minha", tipo: "número" },
  { k: "amostra", n: "Exige amostra", o: "minha", tipo: "sim ou não" },
  { k: "garantia", n: "Garantia contratual", o: "minha", tipo: "número" },
  { k: "visita", n: "Visita técnica obrigatória", o: "minha", tipo: "sim ou não" },
]

export const nomeDaVariavel = (k: string) => VARS.find((v) => v.k === k)?.n ?? k

/* ======================= LICITAÇÕES DE EXEMPLO ======================= */

export type Lic = {
  edital: string
  orgao: string
  objeto: string
  valor: string
  envio: string
  modalidade: string
  portal: string
  cidade: string
  score: string
  responsavel: string
  link: string
  prazo_entrega: string
  amostra: string
  garantia: string
  visita: string
  impugnacao: string
  local_entrega: string
  seg: string
  me: boolean
  adicionada: string
  atualizada: string
  id: string
  julgamento: string
  estado: string
  capagE: string
  uasg: string
  capagM: string
  habitantes: string
  itens: [string, string, string][]
}

/** Valor de texto de uma licitação pela chave da variável ou do campo ("" se não houver). */
export function valorDaLic(l: Lic, k: string) {
  const v = (l as unknown as Record<string, unknown>)[k]
  return typeof v === "string" ? v : ""
}

export const LICS: Lic[] = [
  {
    edital: "00153/2026",
    orgao: "PREFEITURA MUNICIPAL DE LIMEIRA",
    objeto:
      "Contratação de empresa especializada para o desenvolvimento e fornecimento de aplicativo mobile nativo (iOS e Android), modelo SaaS, integrado ao sistema de gestão do Serviço 156.",
    valor: "R$ 60.000,00",
    envio: "05/10/2026",
    modalidade: "Pregão - Eletrônico",
    portal: "bnc.org.br",
    cidade: "Limeira · SP",
    score: "55/100",
    responsavel: "Mateus Brum",
    link: "app.settlegov.com/l/1908309",
    prazo_entrega: "30 dias",
    amostra: "Não",
    garantia: "5%",
    visita: "Não",
    impugnacao: "30/09/2026",
    local_entrega: "Secretaria de Tecnologia, Limeira/SP",
    seg: "Software",
    me: false,
    adicionada: "17/09/2026",
    atualizada: "17/09/2026",
    id: "1908309",
    julgamento: "Menor preço",
    estado: "SP",
    capagE: "B",
    uasg: "-",
    capagM: "C",
    habitantes: "291.869",
    itens: [["CONTRATACAO DE EMPRESA ESPECIALIZADA PARA DESENVOLVIMENTO DE APLICATIVO MOBILE NATIVO", "Software", "R$ 60.000,00"]],
  },
  {
    edital: "22/2026",
    orgao: "SECRETARIA MUNICIPAL DA FAZENDA",
    objeto:
      "Registro de preço para licença de software de gestão e controle da arrecadação municipal da Prefeitura de Santo Antônio dos Lopes – MA.",
    valor: "R$ 0,00",
    envio: "05/10/2026",
    modalidade: "Pregão - Eletrônico",
    portal: "Portal de Compras Públicas",
    cidade: "Santo Antônio dos Lopes · MA",
    score: "52/100",
    responsavel: "",
    link: "app.settlegov.com/l/1907748",
    prazo_entrega: "",
    amostra: "",
    garantia: "",
    visita: "Sim",
    impugnacao: "30/09/2026",
    local_entrega: "",
    seg: "Software",
    me: false,
    adicionada: "17/09/2026",
    atualizada: "17/09/2026",
    id: "1907748",
    julgamento: "Maior desconto",
    estado: "MA",
    capagE: "A",
    uasg: "-",
    capagM: "C",
    habitantes: "14.304",
    itens: [
      ["Implantação do software, configuração, migração de dados e parametrização", "Software", "-"],
      ["Suporte técnico e manutenção do sistema integrado de gestão tributária", "Software", "-"],
      ["Cessão de licença de uso do sistema integrado de Gestão Tributária Municipal (21 módulos)", "Software", "-"],
      ["Treinamento dos usuários internos (banco de horas)", "Software", "-"],
    ],
  },
  {
    edital: "37/2026",
    orgao: "ESP-FED-PENIT. ESTADO DE SÃO PAULO",
    objeto: "Aquisição de material permanente: equipamentos de TI (PEAIPEN, Convênio nº 936.735/2022).",
    valor: "R$ 67.949,95",
    envio: "02/10/2026",
    modalidade: "Pregão - Eletrônico",
    portal: "compras.gov.br",
    cidade: "São Paulo · SP",
    score: "65/100",
    responsavel: "Larissa Almeida",
    link: "app.settlegov.com/l/1908424",
    prazo_entrega: "45 dias",
    amostra: "Sim",
    garantia: "",
    visita: "Não",
    impugnacao: "26/09/2026",
    local_entrega: "Almoxarifado central, São Paulo/SP",
    seg: "Produtos",
    me: true,
    adicionada: "17/09/2026",
    atualizada: "17/09/2026",
    id: "1908424",
    julgamento: "Menor preço",
    estado: "SP",
    capagE: "B",
    uasg: "990189",
    capagM: "B",
    habitantes: "11.451.999",
    itens: [
      ['Notebook corporativo 14", 16 GB RAM, SSD 512 GB', "Produtos", "R$ 22.649,97"],
      ['Monitor LED 24", Full HD, ajuste de altura', "Produtos", "R$ 8.940,00"],
      ["Desktop corporativo, Core i5, 16 GB RAM", "Produtos", "R$ 18.300,00"],
      ["Nobreak 1.500 VA bivolt", "Produtos", "R$ 4.380,00"],
      ["Switch gerenciável 24 portas PoE", "Produtos", "R$ 6.790,00"],
      ["Impressora multifuncional laser monocromática", "Produtos", "R$ 3.980,00"],
      ["Webcam Full HD com microfone", "Produtos", "R$ 1.259,98"],
      ["Kit teclado e mouse sem fio", "Produtos", "R$ 950,00"],
      ["Headset USB com cancelamento de ruído", "Produtos", "R$ 700,00"],
    ],
  },
]

/* ======================= MODELO DE E-MAIL ======================= */

export const EMAIL_ASSUNTO = "Licitação {edital} · {orgao}"
export const EMAIL_CORPO =
  "Olá,\n\nSegue uma licitação que pode interessar:\n\nEdital {edital} · {modalidade}\nÓrgão: {orgao}\nObjeto: {objeto}\nValor global: {valor}\nEnvio da proposta: {envio}\nPortal de disputa: {portal}\n\nScore Settle: {score}\nResponsável: {responsavel}\n\nVer na Settle: {link}"

export type VazioEmail = "texto" | "linha"

/* ======================= ORGANIZAÇÃO ======================= */

export type RegistroAuditoria = { quando: string; quem: string; area: string; txt: string }

export const AUDITORIA: RegistroAuditoria[] = [
  { quando: "17/09/2026 16:42", quem: "Alice Iglesias", area: "Campos do card", txt: 'Ocultou "UASG"' },
  { quando: "15/09/2026 09:10", quem: "Larissa Almeida", area: "Motivos", txt: 'Adicionou o motivo de descarte "Revenda"' },
  {
    quando: "12/09/2026 11:27",
    quem: "Bruno Ortiz",
    area: "Etapas do funil",
    txt: 'Renomeou "Recurso" para "Fase de Recursos"',
  },
]

export const EQUIPE: [string, string, string][] = [
  ["Brunno Krier", "Administrador", "Ativo"],
  ["Larissa Almeida", "Administrador", "Ativo"],
  ["Alice Iglesias", "Administrador", "Ativo"],
  ["Bruno Ortiz", "Administrador", "Ativo"],
  ["Andre Damiano", "Administrador", "Ativo"],
  ["Malou Chlapec", "Administrador", "Convite pendente"],
  ["Mateus Brum", "Editor completo", "Ativo"],
  ["Trochu Kniha", "Editor completo", "Convite pendente"],
  ["Eloi Pattaro", "Editor completo", "Desativado"],
]

export const PERMISSOES: string[][] = [
  ["Etapas do funil", "Altera", "Usa", "Usa", "Vê"],
  ["Abas das listas", "Cria, edita e exclui", "Usa", "Usa", "Usa"],
  ["Motivos de descarte e perda", "Altera", "Usa", "Usa", "Não usa (não descarta)"],
  ["Campos do card", "Altera", "Vê", "Vê", "Vê"],
  ["Modelo de e-mail", "Altera", "Usa", "Usa", "Usa"],
  ["Equipe", "Altera", "Não vê", "Não vê", "Não vê"],
  ["Auditoria", "Vê", "Não vê", "Não vê", "Não vê"],
  ["Agentes e variáveis", "Altera", "Usa", "Usa", "Vê resultados"],
]

/* ======================= UTIL ======================= */

export const fmt = (n: number) => n.toLocaleString("pt-BR")

export function agora() {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, "0")
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`
}

/** Tira o item `deId` da lista e o põe na posição que `paraId` ocupava. */
export function mover<T extends { id: string }>(lista: T[], deId: string, paraId: string) {
  const nova = [...lista]
  const a = nova.findIndex((x) => x.id === deId)
  const b = nova.findIndex((x) => x.id === paraId)
  if (a < 0 || b < 0) return lista
  const [x] = nova.splice(a, 1)
  nova.splice(b, 0, x)
  return nova
}

let seq = 0
export const novoId = (prefixo: string) => `${prefixo}${Date.now()}${seq++}`
