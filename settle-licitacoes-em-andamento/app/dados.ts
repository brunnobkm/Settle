// Dados de exemplo e regras das licitações em andamento (Board, Tabela e Calendário).
// `etapa` define a coluna do kanban (estágio do nosso processo); `status` é a situação
// do edital e aparece como selo colorido dentro do card.

/* ------------------------------------------------------------------ */
/* Etapas (colunas do kanban)                                          */
/* ------------------------------------------------------------------ */

export type EtapaId = "analise" | "suspensa" | "preparacao" | "disputa" | "habilitacao" | "recursos" | "resultados"

// Cores das categorias do tema (paleta dos segmentos); Suspensa fica cinza neutro
// ("pausado/inativo"), decisão Brunno 2026-05-29.
export const ETAPAS: { id: EtapaId; rotulo: string; cor: string }[] = [
  { id: "analise", rotulo: "Análise de Oportunidades", cor: "bg-category-1" },
  { id: "suspensa", rotulo: "Suspensa", cor: "bg-muted-foreground" },
  { id: "preparacao", rotulo: "Preparação de Proposta", cor: "bg-category-6" },
  { id: "disputa", rotulo: "Disputa de Classificação", cor: "bg-category-4" },
  { id: "habilitacao", rotulo: "Processo de Habilitação", cor: "bg-category-5" },
  { id: "recursos", rotulo: "Fase de Recursos", cor: "bg-category-3" },
  { id: "resultados", rotulo: "Resultados Finais", cor: "bg-category-2" },
]

export const etapaPorId = (id: EtapaId) => ETAPAS.find((e) => e.id === id)

/* ------------------------------------------------------------------ */
/* Status do edital e resultado                                        */
/* ------------------------------------------------------------------ */

export type StatusId = "abertas" | "em-disputa" | "suspensa" | "anulada" | "revogada" | "homologada" | "deserta"

/** Família de cor do selo: verde, âmbar ou vermelho. */
export type Tom = "success" | "warning" | "destructive"

export const STATUS: { id: StatusId; rotulo: string; tom: Tom }[] = [
  { id: "abertas", rotulo: "Abertas para participação", tom: "success" },
  { id: "em-disputa", rotulo: "Em disputa ou Homologação", tom: "warning" },
  { id: "suspensa", rotulo: "Suspensa", tom: "warning" },
  { id: "anulada", rotulo: "Anulada", tom: "destructive" },
  { id: "revogada", rotulo: "Revogada", tom: "destructive" },
  { id: "homologada", rotulo: "Homologada", tom: "success" },
  { id: "deserta", rotulo: "Deserta ou Fracassada", tom: "destructive" },
]

export const statusPorId = (id: StatusId | null) => STATUS.find((s) => s.id === id)

/** Resultado da licitação: só nos cards em "Resultados Finais". */
export type ResultadoId = "ganhou" | "perdeu"

export const RESULTADOS: { id: ResultadoId; rotulo: string; tom: Tom }[] = [
  { id: "ganhou", rotulo: "Ganhou e foi habilitado", tom: "success" },
  { id: "perdeu", rotulo: "Perdeu a licitação", tom: "destructive" },
]

export const resultadoPorId = (id: ResultadoId | null | undefined) => RESULTADOS.find((r) => r.id === id)

/* ------------------------------------------------------------------ */
/* Pessoas e segmentos                                                 */
/* ------------------------------------------------------------------ */

export type Pessoa = { id: number; nome: string }

export const PESSOAS: Pessoa[] = [
  { id: 1, nome: "Brunno Krier Martins" },
  { id: 2, nome: "Fabio Almeida Lopes Pereira" },
  { id: 3, nome: "Maria da Silva" },
  { id: 4, nome: "Ana Lima" },
  { id: 5, nome: "Diego Pires" },
  { id: 6, nome: "Eduardo Reis" },
  { id: 7, nome: "Fernanda Ávila" },
  { id: 8, nome: "Gustavo Néri" },
  { id: 9, nome: "Helena Costa" },
  { id: 10, nome: "Carla Souza" },
]

export const pessoaPorId = (id: number) => PESSOAS.find((p) => p.id === id)

/** Cor de categoria do tema (1 a 8): 1 azul, 2 verde, 3 vermelho, 4 roxo, 5 âmbar, 6 índigo, 7 oliva, 8 rosa. */
export type Categoria = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

// mesma paleta do card canônico, mais os rótulos novos usados no kanban
const COR_DO_SEGMENTO: Record<string, Categoria> = {
  Tecnologia: 1,
  Materiais: 5,
  Saúde: 2,
  Educação: 6,
  Engenharia: 3,
  Serviços: 4,
  Construção: 7,
  Alimentação: 8,
  "Tecnologia da Informação e Comunicação": 1,
  "Materiais de Construção e Engenharia Civil": 7,
  "Equipamentos e Suprimentos Médico-Hospitalares": 2,
  Aeroportos: 6,
  Infraestrutura: 7,
  Limpeza: 2,
  TI: 1,
  Segurança: 6,
  Transporte: 4,
  Mobiliário: 5,
}
// segmentos criados pelo usuário: cor estável pelo nome
const PALETA: Categoria[] = [1, 6, 4, 8, 3, 5, 2, 7]

export function categoriaDoSegmento(nome: string): Categoria {
  const fixa = COR_DO_SEGMENTO[nome]
  if (fixa) return fixa
  let hash = 0
  for (let i = 0; i < nome.length; i++) hash = (hash * 31 + nome.charCodeAt(i)) >>> 0
  return PALETA[hash % PALETA.length]
}

/* ------------------------------------------------------------------ */
/* Licitações                                                          */
/* ------------------------------------------------------------------ */

export type Licitacao = {
  id: string
  codigoEdital: string
  titulo: string
  segmentos: string[]
  orgao: string
  objeto: string
  etapa: EtapaId
  status: StatusId | null
  resultado?: ResultadoId | null
  responsaveis: number[]
  /** AAAA-MM-DD; null = sem data programada. */
  dataEnvio: string | null
  cidade: string
  estado: string
  valorGlobal: number
  itensMatch: number
}

export const LICITACOES: Licitacao[] = [
  // ---- Análise de oportunidades ----
  {
    id: "1431011", codigoEdital: "048/2026",
    titulo: "Reforma do pátio de aeronaves norte do Santos Dumont (SBRJ)",
    segmentos: ["Aeroportos", "Infraestrutura"],
    orgao: "INFRAERO / Aeroporto Santos Dumont (SBRJ)",
    objeto: "[LICITANET] - CONTRATAÇÃO DE EMPRESA ESPECIALIZADA PARA EXECUÇÃO DE SERVIÇOS DE ENGENHARIA, COM FORNECIMENTO DE MATERIAIS, MÃO DE OBRA E EQUIPAMENTOS, PARA REFORMA DO PÁTIO DE AERONAVES NORTE DO AEROPORTO SANTOS DUMONT.",
    etapa: "analise", status: "abertas", responsaveis: [1, 2, 3], dataEnvio: "2026-05-19",
    cidade: "Silveira Martins", estado: "RS", valorGlobal: 220950.23, itensMatch: 12,
  },
  {
    id: "1430952", codigoEdital: "112/2026",
    titulo: "Limpeza hospitalar do Hospital Federal de Bonsucesso",
    segmentos: ["Saúde", "Limpeza"],
    orgao: "Ministério da Saúde / Hospital Federal de Bonsucesso",
    objeto: "[LICITANET] - SISTEMA DE REGISTRO DE PREÇOS VISANDO A FUTURA E EVENTUAL CONTRATAÇÃO DE EMPRESA ESPECIALIZADA NA PRESTAÇÃO DE SERVIÇOS CONTINUADOS DE LIMPEZA HOSPITALAR.",
    etapa: "analise", status: "abertas", responsaveis: [10], dataEnvio: "2026-05-22",
    cidade: "Rio de Janeiro", estado: "RJ", valorGlobal: 4200000, itensMatch: 3,
  },
  {
    id: "1430887", codigoEdital: "022/2026",
    titulo: "Merenda escolar do ensino fundamental e infantil de BH",
    segmentos: ["Educação", "Alimentação"],
    orgao: "Prefeitura Municipal de Belo Horizonte / Secretaria de Educação",
    objeto: "AQUISIÇÃO DE GÊNEROS ALIMENTÍCIOS PARA COMPOSIÇÃO DA MERENDA ESCOLAR DAS UNIDADES DE ENSINO FUNDAMENTAL E EDUCAÇÃO INFANTIL DO MUNICÍPIO, COM ENTREGA PROGRAMADA E PRIORIDADE PARA AGRICULTURA FAMILIAR.",
    etapa: "analise", status: "abertas", responsaveis: [5, 6, 7], dataEnvio: null,
    cidade: "Belo Horizonte", estado: "MG", valorGlobal: 7850000, itensMatch: 22,
  },

  // ---- Preparação de Proposta ----
  {
    id: "1430715", codigoEdital: "089/2026",
    titulo: "Solução EDR de proteção de endpoints do TJSP",
    segmentos: ["TI", "Segurança"],
    orgao: "TJSP / Diretoria de Tecnologia da Informação",
    objeto: "REGISTRO DE PREÇOS PARA AQUISIÇÃO DE SOLUÇÃO DE PROTEÇÃO DE ENDPOINTS (EDR), COM SERVIÇOS DE IMPLANTAÇÃO E SUPORTE TÉCNICO, ATENDENDO ESTAÇÕES E SERVIDORES DO TJSP.",
    etapa: "preparacao", status: "abertas", responsaveis: [1, 8], dataEnvio: "2026-05-26",
    cidade: "São Paulo", estado: "SP", valorGlobal: 9120000, itensMatch: 5,
  },
  {
    id: "1430660", codigoEdital: "156/2026",
    titulo: "Restauração da BR-381/MG entre BH e Governador Valadares",
    segmentos: ["Construção", "Infraestrutura"],
    orgao: "DNIT / Superintendência Regional em Minas Gerais",
    objeto: "EXECUÇÃO DE OBRAS DE RESTAURAÇÃO E MANUTENÇÃO DA RODOVIA BR-381/MG, TRECHO BELO HORIZONTE-GOVERNADOR VALADARES, INCLUINDO RECAPEAMENTO E SINALIZAÇÃO HORIZONTAL E VERTICAL.",
    etapa: "preparacao", status: "abertas", responsaveis: [9, 4], dataEnvio: "2026-06-15",
    cidade: "Belo Horizonte", estado: "MG", valorGlobal: 48300000, itensMatch: 11,
  },
  {
    id: "1430501", codigoEdital: "017/2026",
    titulo: "Renovação da frota do transporte metropolitano de Curitiba",
    segmentos: ["Transporte"],
    orgao: "Governo do Estado do Paraná / Secretaria de Infraestrutura e Logística",
    objeto: "AQUISIÇÃO DE ÔNIBUS URBANOS COM ACESSIBILIDADE PARA RENOVAÇÃO DA FROTA DO TRANSPORTE COLETIVO METROPOLITANO DE CURITIBA, ATENDENDO PCD E NORMAS DE EMISSÃO PROCONVE P-8.",
    etapa: "preparacao", status: "abertas", responsaveis: [10, 5], dataEnvio: "2026-05-28",
    cidade: "Curitiba", estado: "PR", valorGlobal: 64900000, itensMatch: 2,
  },

  // ---- Disputa de Classificação ----
  {
    id: "1430340", codigoEdital: "201/2026",
    titulo: "Vigilância armada e desarmada na sede da PF em Brasília",
    segmentos: ["Segurança"],
    orgao: "Ministério da Justiça / Polícia Federal, Superintendência DF",
    objeto: "CONTRATAÇÃO DE SERVIÇOS CONTINUADOS DE VIGILÂNCIA ARMADA E DESARMADA, COM FORNECIMENTO DE POSTOS DE TRABALHO, UNIFORMES E EQUIPAMENTOS DE COMUNICAÇÃO TETRA, NA SEDE DA POLÍCIA FEDERAL EM BRASÍLIA.",
    etapa: "disputa", status: "em-disputa", responsaveis: [6], dataEnvio: "2026-05-24",
    cidade: "Brasília", estado: "DF", valorGlobal: 18700000, itensMatch: 6,
  },
  {
    id: "1430210", codigoEdital: "067/2026",
    titulo: "Equipamentos hospitalares de alta complexidade do HGF",
    segmentos: ["Saúde"],
    orgao: "Secretaria de Estado da Saúde do Ceará / Hospital Geral de Fortaleza",
    objeto: "AQUISIÇÃO DE EQUIPAMENTOS HOSPITALARES DE ALTA COMPLEXIDADE, INCLUINDO VENTILADORES PULMONARES, MONITORES MULTIPARÂMETROS E BOMBAS DE INFUSÃO, COM GARANTIA E TREINAMENTO TÉCNICO.",
    etapa: "disputa", status: "em-disputa", responsaveis: [4, 7, 8], dataEnvio: null,
    cidade: "Fortaleza", estado: "CE", valorGlobal: 22400000, itensMatch: 14,
  },
  {
    id: "1430105", codigoEdital: "009/2026",
    titulo: "Mobiliário corporativo ergonômico da UFRGS",
    segmentos: ["Mobiliário"],
    orgao: "UFRGS / Pró-Reitoria de Planejamento",
    objeto: "REGISTRO DE PREÇOS PARA AQUISIÇÃO DE MOBILIÁRIO CORPORATIVO ERGONÔMICO, COM CADEIRAS, MESAS E ARMÁRIOS, DESTINADO ÀS UNIDADES ACADÊMICAS E ADMINISTRATIVAS DA UFRGS.",
    etapa: "disputa", status: "suspensa", responsaveis: [1, 9], dataEnvio: "2026-06-10",
    cidade: "Porto Alegre", estado: "RS", valorGlobal: 3180000, itensMatch: 9,
  },

  // ---- Processo de Habilitação ----
  {
    id: "1429988", codigoEdital: "234/2026",
    titulo: "Refeições preparadas para a alimentação escolar de Salvador",
    segmentos: ["Alimentação", "Educação"],
    orgao: "Prefeitura Municipal de Salvador / Secretaria Municipal de Educação",
    objeto: "FORNECIMENTO DE REFEIÇÕES PREPARADAS PARA ATENDIMENTO DO PROGRAMA DE ALIMENTAÇÃO ESCOLAR NAS UNIDADES DA REDE MUNICIPAL DE ENSINO DE SALVADOR.",
    etapa: "habilitacao", status: "em-disputa", responsaveis: [10], dataEnvio: null,
    cidade: "Salvador", estado: "BA", valorGlobal: 11650000, itensMatch: 4,
  },
  {
    id: "1429820", codigoEdital: "145/2026",
    titulo: "Limpeza e conservação predial dos campi da UFPE",
    segmentos: ["Limpeza"],
    orgao: "UFPE / Prefeitura Universitária",
    objeto: "PRESTAÇÃO DE SERVIÇOS CONTINUADOS DE LIMPEZA, ASSEIO E CONSERVAÇÃO PREDIAL NAS DEPENDÊNCIAS DOS CAMPI DA UNIVERSIDADE FEDERAL DE PERNAMBUCO.",
    etapa: "habilitacao", status: "em-disputa", responsaveis: [5, 6], dataEnvio: "2026-05-08",
    cidade: "Recife", estado: "PE", valorGlobal: 5960000, itensMatch: 2,
  },

  // ---- Resultados Finais ----
  {
    id: "1429401", codigoEdital: "045/2026",
    titulo: "Licenças de produtividade em nuvem do TCU",
    segmentos: ["TI"],
    orgao: "TCU / Secretaria de Tecnologia da Informação",
    objeto: "AQUISIÇÃO DE LICENÇAS DE SOFTWARE DE PRODUTIVIDADE E COLABORAÇÃO EM NUVEM, COM SUPORTE TÉCNICO E TREINAMENTO, PARA OS USUÁRIOS DO TRIBUNAL DE CONTAS DA UNIÃO.",
    etapa: "resultados", resultado: "ganhou", status: "homologada", responsaveis: [1], dataEnvio: "2026-04-22",
    cidade: "Brasília", estado: "DF", valorGlobal: 14120000, itensMatch: 1,
  },
  {
    id: "1429220", codigoEdital: "178/2026",
    titulo: "Veículos utilitários blindados para transporte de custódia",
    segmentos: ["Transporte"],
    orgao: "Governo do Estado de São Paulo / Secretaria da Administração Penitenciária",
    objeto: "AQUISIÇÃO DE VEÍCULOS UTILITÁRIOS BLINDADOS PARA TRANSPORTE DE CUSTÓDIA, COM ADAPTAÇÕES DE SEGURANÇA E SISTEMA DE COMUNICAÇÃO TETRA.",
    etapa: "resultados", resultado: "perdeu", status: "anulada", responsaveis: [7, 9], dataEnvio: "2026-04-18",
    cidade: "São Paulo", estado: "SP", valorGlobal: 19800000, itensMatch: 1,
  },
  {
    id: "1429110", codigoEdital: "033/2026",
    titulo: "Restauro do patrimônio histórico do centro histórico de Salvador",
    segmentos: ["Construção"],
    orgao: "IPHAN / Superintendência Estadual da Bahia",
    objeto: "EXECUÇÃO DE OBRAS DE RESTAURO DO PATRIMÔNIO HISTÓRICO EDIFICADO DO CENTRO HISTÓRICO DE SALVADOR, ATENDENDO ÀS DIRETRIZES TÉCNICAS DO IPHAN.",
    etapa: "resultados", resultado: "perdeu", status: "deserta", responsaveis: [6, 10], dataEnvio: "2026-04-09",
    cidade: "Salvador", estado: "BA", valorGlobal: 6540000, itensMatch: 4,
  },

  // ---- 20 licitações com envio da proposta hoje (21/05/2026 no protótipo) ----
  // Demonstra o destaque de "hoje" e o volume grande num único dia do calendário.
  { id: "1432001", codigoEdital: "301/2026", titulo: "Gases medicinais do HC FMUSP", segmentos: ["Saúde", "Materiais"], orgao: "USP / Hospital das Clínicas da FMUSP", objeto: "AQUISIÇÃO DE GASES MEDICINAIS, INCLUINDO OXIGÊNIO, ÓXIDO NITROSO E AR COMPRIMIDO, COM FORNECIMENTO PROGRAMADO.", etapa: "analise", status: "abertas", responsaveis: [4, 7], dataEnvio: "2026-05-21", cidade: "São Paulo", estado: "SP", valorGlobal: 2380000, itensMatch: 4 },
  { id: "1432002", codigoEdital: "302/2026", titulo: "Fardamento operacional da PM-SP", segmentos: ["Segurança", "Materiais"], orgao: "Governo do Estado de São Paulo / Polícia Militar", objeto: "REGISTRO DE PREÇOS PARA AQUISIÇÃO DE FARDAMENTO OPERACIONAL E COLETES BALÍSTICOS PARA EFETIVO DA POLÍCIA MILITAR.", etapa: "analise", status: "abertas", responsaveis: [3], dataEnvio: "2026-05-21", cidade: "São Paulo", estado: "SP", valorGlobal: 5640000, itensMatch: 8 },
  { id: "1432003", codigoEdital: "303/2026", titulo: "Software de gestão acadêmica da UFABC", segmentos: ["TI"], orgao: "UFABC / Pró-Reitoria de Tecnologia da Informação", objeto: "LICENCIAMENTO E IMPLANTAÇÃO DE SISTEMA INTEGRADO DE GESTÃO ACADÊMICA, COM MÓDULOS DE MATRÍCULA, NOTAS E DIPLOMAS.", etapa: "preparacao", status: "abertas", responsaveis: [1, 8], dataEnvio: "2026-05-21", cidade: "Santo André", estado: "SP", valorGlobal: 1820000, itensMatch: 2 },
  { id: "1432004", codigoEdital: "304/2026", titulo: "Catering escolar da rede municipal de Curitiba", segmentos: ["Alimentação", "Educação"], orgao: "Prefeitura Municipal de Curitiba / Secretaria de Educação", objeto: "FORNECIMENTO DE REFEIÇÕES PRONTAS PARA O PROGRAMA DE ALIMENTAÇÃO ESCOLAR DAS CRECHES E UNIDADES DE ENSINO FUNDAMENTAL.", etapa: "preparacao", status: "abertas", responsaveis: [10, 5], dataEnvio: "2026-05-21", cidade: "Curitiba", estado: "PR", valorGlobal: 9450000, itensMatch: 6 },
  { id: "1432005", codigoEdital: "305/2026", titulo: "Caminhões coletores do DMLU de Porto Alegre", segmentos: ["Transporte", "Limpeza"], orgao: "Prefeitura de Porto Alegre / DMLU", objeto: "AQUISIÇÃO DE CAMINHÕES COLETORES COMPACTADORES PARA RENOVAÇÃO DA FROTA DE LIMPEZA URBANA.", etapa: "disputa", status: "em-disputa", responsaveis: [9], dataEnvio: "2026-05-21", cidade: "Porto Alegre", estado: "RS", valorGlobal: 12300000, itensMatch: 3 },
  { id: "1432006", codigoEdital: "306/2026", titulo: "Modernização de subestação 138 kV da Eletrobras", segmentos: ["Engenharia", "Infraestrutura"], orgao: "Eletrobras / Diretoria de Operação", objeto: "OBRAS DE MODERNIZAÇÃO DA SUBESTAÇÃO ELÉTRICA DE 138 KV, INCLUINDO SUBSTITUIÇÃO DE TRANSFORMADORES E SISTEMA DE PROTEÇÃO.", etapa: "preparacao", status: "abertas", responsaveis: [2, 9], dataEnvio: "2026-05-21", cidade: "Brasília", estado: "DF", valorGlobal: 38700000, itensMatch: 5 },
  { id: "1432007", codigoEdital: "307/2026", titulo: "Pavimentação asfáltica dos bairros sul de Vitória", segmentos: ["Construção", "Infraestrutura"], orgao: "Prefeitura Municipal de Vitória / Secretaria de Obras", objeto: "EXECUÇÃO DE OBRAS DE PAVIMENTAÇÃO ASFÁLTICA E DRENAGEM EM 22 RUAS DOS BAIRROS DA REGIÃO SUL DE VITÓRIA.", etapa: "analise", status: "abertas", responsaveis: [4], dataEnvio: "2026-05-21", cidade: "Vitória", estado: "ES", valorGlobal: 14200000, itensMatch: 11 },
  { id: "1432008", codigoEdital: "308/2026", titulo: "Carteiras escolares da rede estadual do Pará", segmentos: ["Educação", "Mobiliário"], orgao: "Governo do Estado do Pará / Secretaria de Educação", objeto: "AQUISIÇÃO DE CARTEIRAS ESCOLARES INDIVIDUAIS PARA AS ESCOLAS DA REDE ESTADUAL DE ENSINO DO PARÁ.", etapa: "analise", status: "abertas", responsaveis: [7, 3], dataEnvio: "2026-05-21", cidade: "Belém", estado: "PA", valorGlobal: 6890000, itensMatch: 2 },
  { id: "1432009", codigoEdital: "309/2026", titulo: "Sistema de monitoramento de tráfego do DER-MG", segmentos: ["TI", "Transporte"], orgao: "DER-MG / Departamento de Engenharia Rodoviária", objeto: "IMPLANTAÇÃO DE SISTEMA INTEGRADO DE MONITORAMENTO DE TRÁFEGO COM CFTV E SENSORES EM 14 PONTOS DA MALHA RODOVIÁRIA.", etapa: "disputa", status: "em-disputa", responsaveis: [8, 1], dataEnvio: "2026-05-21", cidade: "Belo Horizonte", estado: "MG", valorGlobal: 7340000, itensMatch: 9 },
  { id: "1432010", codigoEdital: "310/2026", titulo: "Manutenção de geradores do Banco do Brasil", segmentos: ["Engenharia", "Serviços"], orgao: "Banco do Brasil / Diretoria de Infraestrutura", objeto: "CONTRATAÇÃO DE SERVIÇOS DE MANUTENÇÃO PREVENTIVA E CORRETIVA DOS GERADORES DE ENERGIA DAS AGÊNCIAS DO DF.", etapa: "habilitacao", status: "em-disputa", responsaveis: [6], dataEnvio: "2026-05-21", cidade: "Brasília", estado: "DF", valorGlobal: 1980000, itensMatch: 1 },
  { id: "1432011", codigoEdital: "311/2026", titulo: "Equipamentos de fisioterapia do SUS de Joinville", segmentos: ["Saúde", "Equipamentos e Suprimentos Médico-Hospitalares"], orgao: "Prefeitura Municipal de Joinville / Secretaria de Saúde", objeto: "AQUISIÇÃO DE EQUIPAMENTOS DE FISIOTERAPIA E REABILITAÇÃO PARA AS UNIDADES DE ATENÇÃO ESPECIALIZADA.", etapa: "analise", status: "abertas", responsaveis: [5], dataEnvio: "2026-05-21", cidade: "Joinville", estado: "SC", valorGlobal: 980000, itensMatch: 7 },
  { id: "1432012", codigoEdital: "312/2026", titulo: "Reforma de delegacias da SSP-SP", segmentos: ["Construção", "Segurança"], orgao: "Governo do Estado de São Paulo / Secretaria de Segurança Pública", objeto: "EXECUÇÃO DE OBRAS DE REFORMA E ADAPTAÇÃO DE 12 DELEGACIAS DA CAPITAL E DA REGIÃO METROPOLITANA DE SÃO PAULO.", etapa: "preparacao", status: "abertas", responsaveis: [2], dataEnvio: "2026-05-21", cidade: "São Paulo", estado: "SP", valorGlobal: 8120000, itensMatch: 12 },
  { id: "1432013", codigoEdital: "313/2026", titulo: "Materiais de laboratório da Fiocruz", segmentos: ["Saúde", "Materiais"], orgao: "Fundação Oswaldo Cruz / Instituto de Tecnologia em Imunobiológicos", objeto: "REGISTRO DE PREÇOS PARA AQUISIÇÃO DE MATERIAIS DE CONSUMO LABORATORIAL, INCLUINDO REAGENTES E VIDRARIAS.", etapa: "disputa", status: "em-disputa", responsaveis: [7, 4], dataEnvio: "2026-05-21", cidade: "Rio de Janeiro", estado: "RJ", valorGlobal: 3450000, itensMatch: 18 },
  { id: "1432014", codigoEdital: "314/2026", titulo: "Aquisição de vacinas do Ministério da Saúde", segmentos: ["Saúde"], orgao: "Ministério da Saúde / Departamento de Imunizações", objeto: "AQUISIÇÃO DE IMUNOBIOLÓGICOS PARA O PROGRAMA NACIONAL DE IMUNIZAÇÕES, COM FORNECIMENTO PROGRAMADO PARA AS UNIDADES FEDERATIVAS.", etapa: "preparacao", status: "abertas", responsaveis: [1, 8, 3], dataEnvio: "2026-05-21", cidade: "Brasília", estado: "DF", valorGlobal: 124800000, itensMatch: 5 },
  { id: "1432015", codigoEdital: "315/2026", titulo: "Caminhões de bombeiros do CBMERJ", segmentos: ["Transporte", "Segurança"], orgao: "Corpo de Bombeiros Militar do RJ / Diretoria de Logística", objeto: "AQUISIÇÃO DE CAMINHÕES AUTO-BOMBA TANQUE E AUTO-PLATAFORMA MECÂNICA PARA RENOVAÇÃO DA FROTA DO CBMERJ.", etapa: "habilitacao", status: "em-disputa", responsaveis: [9, 2], dataEnvio: "2026-05-21", cidade: "Rio de Janeiro", estado: "RJ", valorGlobal: 24500000, itensMatch: 2 },
  { id: "1432016", codigoEdital: "316/2026", titulo: "Mobiliário hospitalar do INTO", segmentos: ["Saúde", "Mobiliário"], orgao: "Instituto Nacional de Traumatologia e Ortopedia / Diretoria Administrativa", objeto: "AQUISIÇÃO DE MOBILIÁRIO HOSPITALAR, INCLUINDO LEITOS, MACAS E ARMÁRIOS, PARA OS CENTROS CIRÚRGICOS DO INTO.", etapa: "analise", status: "abertas", responsaveis: [10], dataEnvio: "2026-05-21", cidade: "Rio de Janeiro", estado: "RJ", valorGlobal: 2740000, itensMatch: 8 },
  { id: "1432017", codigoEdital: "317/2026", titulo: "VoIP corporativo da Câmara dos Deputados", segmentos: ["TI", "Tecnologia da Informação e Comunicação"], orgao: "Câmara dos Deputados / Diretoria de Tecnologia da Informação", objeto: "CONTRATAÇÃO DE SOLUÇÃO DE TELEFONIA IP CORPORATIVA, COM 4500 RAMAIS E INTEGRAÇÃO AOS SISTEMAS LEGADOS.", etapa: "preparacao", status: "abertas", responsaveis: [8, 6], dataEnvio: "2026-05-21", cidade: "Brasília", estado: "DF", valorGlobal: 5640000, itensMatch: 3 },
  { id: "1432018", codigoEdital: "318/2026", titulo: "Manutenção de aeronaves offshore da Petrobras", segmentos: ["Engenharia", "Aeroportos"], orgao: "Petrobras / Logística Aérea", objeto: "CONTRATAÇÃO DE SERVIÇOS DE MANUTENÇÃO PROGRAMADA DE HELICÓPTEROS UTILIZADOS NO TRANSPORTE OFFSHORE DA BACIA DE CAMPOS.", etapa: "disputa", status: "em-disputa", responsaveis: [4, 9], dataEnvio: "2026-05-21", cidade: "Macaé", estado: "RJ", valorGlobal: 18900000, itensMatch: 6 },
  { id: "1432019", codigoEdital: "319/2026", titulo: "Iluminação pública LED de Florianópolis", segmentos: ["Engenharia", "Infraestrutura"], orgao: "Prefeitura Municipal de Florianópolis / Secretaria de Obras", objeto: "SUBSTITUIÇÃO DE 14.000 PONTOS DE ILUMINAÇÃO PÚBLICA POR LUMINÁRIAS LED COM TELEGESTÃO INDIVIDUAL.", etapa: "analise", status: "abertas", responsaveis: [3, 5], dataEnvio: "2026-05-21", cidade: "Florianópolis", estado: "SC", valorGlobal: 21300000, itensMatch: 4 },
  { id: "1432020", codigoEdital: "320/2026", titulo: "Telas de proteção das escolas do ES", segmentos: ["Educação", "Materiais"], orgao: "Governo do Estado do Espírito Santo / Secretaria de Educação", objeto: "AQUISIÇÃO E INSTALAÇÃO DE TELAS DE PROTEÇÃO PARA QUADRAS POLIESPORTIVAS DAS ESCOLAS DA REDE ESTADUAL.", etapa: "analise", status: "abertas", responsaveis: [7], dataEnvio: "2026-05-21", cidade: "Vitória", estado: "ES", valorGlobal: 1450000, itensMatch: 1 },
]

/** Segmentos conhecidos: os da paleta mais os usados nas licitações. */
export const SEGMENTOS_INICIAIS = Array.from(
  new Set([...Object.keys(COR_DO_SEGMENTO), ...LICITACOES.flatMap((x) => x.segmentos)])
)

/* ------------------------------------------------------------------ */
/* Cidades por UF (editor de Cidade e Estado)                          */
/* ------------------------------------------------------------------ */

export const CIDADES_POR_UF: Record<string, string[]> = {
  AC: ["Rio Branco", "Cruzeiro do Sul"],
  AL: ["Maceió", "Arapiraca"],
  AP: ["Macapá", "Santana"],
  AM: ["Manaus", "Parintins"],
  BA: ["Salvador", "Feira de Santana", "Vitória da Conquista", "Camaçari"],
  CE: ["Fortaleza", "Caucaia", "Juazeiro do Norte"],
  DF: ["Brasília", "Taguatinga", "Ceilândia"],
  ES: ["Vitória", "Vila Velha", "Serra", "Cariacica"],
  GO: ["Goiânia", "Aparecida de Goiânia", "Anápolis"],
  MA: ["São Luís", "Imperatriz"],
  MT: ["Cuiabá", "Várzea Grande", "Rondonópolis"],
  MS: ["Campo Grande", "Dourados"],
  MG: ["Belo Horizonte", "Uberlândia", "Contagem", "Juiz de Fora", "Betim"],
  PA: ["Belém", "Ananindeua", "Santarém"],
  PB: ["João Pessoa", "Campina Grande"],
  PR: ["Curitiba", "Londrina", "Maringá", "Ponta Grossa"],
  PE: ["Recife", "Jaboatão dos Guararapes", "Olinda", "Caruaru"],
  PI: ["Teresina", "Parnaíba"],
  RJ: ["Rio de Janeiro", "Niterói", "Macaé", "Petrópolis", "Nova Iguaçu"],
  RN: ["Natal", "Mossoró"],
  RS: ["Porto Alegre", "Caxias do Sul", "Silveira Martins", "Santa Maria", "Pelotas"],
  RO: ["Porto Velho", "Ji-Paraná"],
  RR: ["Boa Vista"],
  SC: ["Florianópolis", "Joinville", "Blumenau", "São José"],
  SP: ["São Paulo", "Campinas", "Guarulhos", "São Bernardo do Campo", "Santos", "Santo André"],
  SE: ["Aracaju", "Nossa Senhora do Socorro"],
  TO: ["Palmas", "Araguaína"],
}

export const UFS = Object.keys(CIDADES_POR_UF).sort()

/* ------------------------------------------------------------------ */
/* Datas, valores e urgência                                           */
/* ------------------------------------------------------------------ */

/** "Hoje" do protótipo: os dados de exemplo giram em torno de 21/05/2026. */
export const HOJE = new Date(2026, 4, 21)

export const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
]

export const dataParaIso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`

export const isoParaData = (iso: string) => {
  const [a, m, d] = iso.split("-").map(Number)
  return new Date(a, m - 1, d)
}

export const HOJE_ISO = dataParaIso(HOJE)

export const formatarData = (iso: string) => {
  const [a, m, d] = iso.split("-")
  return `${d}/${m}/${a}`
}

export const formatarMoeda = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** Valor digitado ("1.234.567,89" ou "1234567.89"); null se não for número. */
export function lerValor(texto: string): number | null {
  const t = texto.replace(/[^\d.,]/g, "")
  if (!t) return null
  const normalizado = t.includes(",") ? t.replace(/\./g, "").replace(",", ".") : t
  const n = Number(normalizado)
  return Number.isFinite(n) ? n : null
}

/** Texto do campo de edição: 220950.23 vira "220950,23". */
export const valorParaInput = (v: number) => String(v).replace(".", ",")

/**
 * Urgência do envio da proposta (regra do cliente): hoje = vermelho; 1 a 7 dias =
 * âmbar; o resto (inclusive data passada) = neutro; sem data = "nenhuma".
 */
export type Urgencia = { tom: "hoje" | "semana" | "normal" | "nenhuma"; dias: number }

export function urgenciaDaData(iso: string | null): Urgencia {
  if (!iso) return { tom: "nenhuma", dias: 0 }
  const dias = Math.round((isoParaData(iso).getTime() - HOJE.getTime()) / 86_400_000)
  if (dias === 0) return { tom: "hoje", dias }
  if (dias >= 1 && dias <= 7) return { tom: "semana", dias }
  return { tom: "normal", dias }
}

/** Texto do aviso de prazo, para leitores de tela e dicas. */
export function avisoDePrazo(u: Urgencia) {
  if (u.tom === "hoje") return "envio hoje"
  if (u.tom === "semana") return `faltam ${u.dias} ${u.dias === 1 ? "dia" : "dias"}`
  return ""
}

/** Link único do card. */
export const linkDaLicitacao = (id: string) => `https://app.settle.com/licitacao/${id}`
