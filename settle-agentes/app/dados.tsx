// Dados de exemplo e roteiro do construtor da V1 de Agentes (versão congelada em 26/08,
// hipótese 1: a conversa conduz do início ao fim).

import type { ReactNode } from "react"

/* ------------------------------------------------------------------ */
/* Listas: Score, Resumo, Variáveis, Execuções                         */
/* ------------------------------------------------------------------ */

/** De onde sai a linha: variável do espaço de trabalho, dado da Settle ou pendente. */
export type Fonte = "var" | "sys" | "pend"

export type LinhaConfig = {
  id: string
  nome: string
  pts?: number
  fonte: Fonte
  fonteTxt: string
  nota?: ReactNode
  /** false = rascunho (ainda não ativado). */
  ativo?: boolean
  alerta?: string
}

export const SCORE_INICIAL: LinhaConfig[] = [
  {
    id: "seg",
    nome: "Aderência ao segmento",
    pts: 25,
    fonte: "sys",
    fonteTxt: "Settle · match por objeto e item",
    nota: "Critério padrão da plataforma. Você pode reduzir o peso, mas não remover.",
    ativo: true,
  },
  {
    id: "val",
    nome: "Valor estimado da licitação",
    pts: 20,
    fonte: "sys",
    fonteTxt: "Portal de origem",
    nota: (
      <>
        Por faixa: <b>até R$ 1 mi</b> = 5 · <b>R$ 1 mi a R$ 5 mi</b> = 10 · <b>acima de R$ 5 mi</b> = 20
      </>
    ),
    ativo: true,
  },
  {
    id: "ate",
    nome: "Exigência de atestado de capacidade técnica",
    pts: 15,
    fonte: "var",
    fonteTxt: "Variável · Atestado exigido",
    nota: (
      <>
        Quando não encontrado: <b>considera que não exige</b> e soma os 15 pontos.
      </>
    ),
    ativo: true,
    alerta: "Esse default é otimista. Em 3 das últimas 10 análises a exigência estava em anexo separado.",
  },
  {
    id: "sub",
    nome: "Permite subcontratação",
    pts: 10,
    fonte: "var",
    fonteTxt: "Variável · Permite subcontratação",
    nota: (
      <>
        Quando não encontrado: <b>não pontua e sinaliza</b> para revisão manual.
      </>
    ),
    ativo: true,
  },
  {
    id: "praz",
    nome: "Prazo até a sessão pública",
    pts: 10,
    fonte: "sys",
    fonteTxt: "Portal de origem",
    nota: (
      <>
        Menos de 5 dias úteis: <b>0 ponto</b>. De 5 a 15 dias: <b>6</b>. Acima de 15 dias: <b>10</b>.
      </>
    ),
    ativo: true,
  },
  {
    id: "meepp",
    nome: "Participação exclusiva ME/EPP",
    pts: 10,
    fonte: "var",
    fonteTxt: "Variável · Exclusividade ME/EPP",
    nota: (
      <>
        Quando não encontrado: <b>não pontua</b>.
      </>
    ),
    ativo: true,
  },
  {
    id: "visi",
    nome: "Visita técnica obrigatória",
    pts: 0,
    fonte: "pend",
    fonteTxt: "Rascunho · nunca rodou",
    nota: "Criado em 19/08/2026 e ainda não ativado.",
    ativo: false,
  },
]

export const RESUMO: LinhaConfig[] = [
  { id: "obj", nome: "Objeto da licitação", fonte: "sys", fonteTxt: "Portal de origem", nota: "Sempre visível." },
  {
    id: "org",
    nome: "Órgão, UASG e esfera",
    fonte: "var",
    fonteTxt: "Variável · Esfera",
    nota: "A esfera vem do portal, sem custo de extração.",
  },
  { id: "mod", nome: "Modalidade e critério de julgamento", fonte: "sys", fonteTxt: "Edital" },
  { id: "val", nome: "Valor global estimado", fonte: "sys", fonteTxt: "Portal de origem" },
  { id: "ses", nome: "Data e hora da sessão", fonte: "sys", fonteTxt: "Portal de origem" },
  {
    id: "capag",
    nome: "CAPAG do órgão",
    fonte: "var",
    fonteTxt: "Variável · CAPAG (v3)",
    nota: (
      <>
        Licitação federal: exibe <b>não se aplica</b>, com a explicação.
      </>
    ),
  },
  {
    id: "hab",
    nome: "Documentos de habilitação exigidos",
    fonte: "var",
    fonteTxt: "Variável · Habilitação exigida",
    nota: (
      <>
        Quando não encontrado: exibe <b>não encontrado</b>, nunca lista vazia.
      </>
    ),
  },
  { id: "sub", nome: "Permite subcontratação", fonte: "var", fonteTxt: "Variável · Permite subcontratação" },
  {
    id: "ind",
    nome: "Índices contábeis exigidos",
    fonte: "var",
    fonteTxt: "Variável · Índices contábeis",
    nota: "Não encontrado em 3 das últimas 10 licitações.",
    alerta: "Vale revisar a instrução dessa variável ou trocar a fonte para o anexo de habilitação.",
  },
  {
    id: "visi",
    nome: "Exige visita técnica",
    fonte: "pend",
    fonteTxt: "Oculto no Resumo",
    nota: "Depende do critério que ainda está em rascunho.",
  },
]

export type Variavel = {
  nome: string
  fonte: string
  usadaEm: string
  versao: string
  custo: string
  naoEncontrada: string
}

export const VARIAVEIS: Variavel[] = [
  { nome: "Esfera", fonte: "Portal de origem", usadaEm: "Score, Resumo, Match", versao: "v2", custo: "sem custo", naoEncontrada: "não se aplica" },
  { nome: "CAPAG", fonte: "Base do Tesouro + Esfera", usadaEm: "Score, Resumo", versao: "v3", custo: "R$ 0,01", naoEncontrada: "não pontua e sinaliza" },
  { nome: "Atestado exigido", fonte: "Edital · item de habilitação", usadaEm: "Score", versao: "v1", custo: "R$ 0,04", naoEncontrada: "considera que não exige" },
  { nome: "Permite subcontratação", fonte: "Termo de Referência", usadaEm: "Score, Resumo", versao: "v1", custo: "R$ 0,03", naoEncontrada: "não pontua e sinaliza" },
  { nome: "Quantidade de veículos", fonte: "Termo de Referência", usadaEm: "Match", versao: "v1", custo: "R$ 0,05", naoEncontrada: "mantém a licitação no match" },
  { nome: "Índices contábeis", fonte: "Edital · qualificação econômica", usadaEm: "Resumo", versao: "v1", custo: "R$ 0,02", naoEncontrada: "exibe não encontrado" },
]

export type Execucao = {
  quando: string
  gatilho: string
  licitacao: string
  oQueRodou: string
  /** null = a execução falhou (edital não baixou). */
  resultado: string | null
  custo: string
}

export const EXECUCOES: Execucao[] = [
  { quando: "26/08 09:12", gatilho: "Enviada para análise", licitacao: "PE 90014/2026 · SES-MG", oQueRodou: "Score completo (6 critérios)", resultado: "78 pontos", custo: "R$ 0,14" },
  { quando: "26/08 09:12", gatilho: "Enviada para análise", licitacao: "PE 90014/2026 · SES-MG", oQueRodou: "Resumo (10 campos)", resultado: "9 preenchidos, 1 não encontrado", custo: "R$ 0,06" },
  { quando: "26/08 08:40", gatilho: "Entrou no match", licitacao: "PE 00023/2026 · Pref. Itapevi", oQueRodou: "Variável CAPAG", resultado: "não encontrada, sinalizada", custo: "R$ 0,01" },
  { quando: "25/08 17:03", gatilho: "Enviada para análise", licitacao: "PE 90112/2026 · TRF4", oQueRodou: "Score completo (6 critérios)", resultado: "61 pontos", custo: "R$ 0,13" },
  { quando: "25/08 16:55", gatilho: "Enviada para análise", licitacao: "PE 00311/2026 · Pref. Osasco", oQueRodou: "Score completo (6 critérios)", resultado: null, custo: "R$ 0,04" },
]

/* ------------------------------------------------------------------ */
/* Construtor: modelo da regra e roteiro da conversa                   */
/* ------------------------------------------------------------------ */

export type TipoRegra = "capag" | "veic"

export type CampoRegra = "fonte" | "federal" | "semDado" | "pontos" | "gatilho" | "saida"

export type Regra = {
  nome: string
  tipo: TipoRegra
  fonte: string | null
  federal: string | null
  semDado: string | null
  pontos: string | null
  gatilho: string | null
  saida: string | null
  custo: number
}

export function novaRegra(nome: string, tipo: TipoRegra): Regra {
  return {
    nome,
    tipo,
    fonte: null,
    federal: null,
    semDado: null,
    pontos: null,
    gatilho: null,
    saida: null,
    custo: tipo === "capag" ? 0.01 : 0.05,
  }
}

/** Opção oferecida como resposta rápida. `v` é o valor que entra na regra. */
export type Opcao = { t: string; v?: string; extra?: string; tipo?: TipoRegra }

type Passo = {
  pergunta: (r: Regra) => ReactNode
  opcoes: (r: Regra) => Opcao[]
}

export const PASSOS: Record<CampoRegra, Passo> = {
  fonte: {
    pergunta: (r) =>
      r.tipo === "capag" ? (
        <>
          Entendi. A CAPAG não está no edital: ela vem da base do Tesouro Nacional, cruzada com a{" "}
          <b>esfera do órgão</b>. A esfera eu já tenho do portal, sem custo. Uso essa fonte?
        </>
      ) : (
        <>
          Entendi. Essa informação eu preciso extrair do <b>Termo de Referência</b>, que é onde costuma aparecer o
          quantitativo. Uso essa fonte?
        </>
      ),
    opcoes: (r) =>
      r.tipo === "capag"
        ? [
            { t: "Usar a base do Tesouro", v: "Base do Tesouro Nacional + variável Esfera" },
            { t: "Extrair do edital", v: "Edital, quando o órgão declarar a própria CAPAG", extra: "mais lento e menos confiável" },
          ]
        : [
            { t: "Usar o Termo de Referência", v: "Termo de Referência" },
            { t: "Procurar em todos os anexos", v: "Edital e todos os anexos", extra: "custo maior por licitação" },
          ],
  },

  federal: {
    pergunta: () => (
      <>
        Uma coisa que você não me disse: <b>licitação federal não tem CAPAG</b>. A nota só existe para estado e
        município. O que eu faço quando o órgão for federal?
      </>
    ),
    opcoes: () => [
      { t: "Não pontuar e explicar no Resumo", v: 'Federal: 0 ponto, com a nota "não se aplica" no Resumo', extra: "recomendado" },
      { t: "Somar os pontos assim mesmo", v: "Federal: soma os pontos, tratando como risco baixo" },
      { t: "Usar outro indicador", v: "Federal: usar o histórico de pagamento do órgão na Settle" },
    ],
  },

  semDado: {
    pergunta: (r) =>
      r.tipo === "capag" ? (
        <>
          E quando eu <b>não encontrar</b> a CAPAG do município? Acontece bastante com prefeitura pequena. Não
          encontrar não é a mesma coisa que ter nota ruim.
        </>
      ) : (
        <>
          E quando eu <b>não encontrar</b> essa informação no documento? Não encontrar não é a mesma coisa que ser
          zero.
        </>
      ),
    opcoes: () => [
      { t: "Não pontuar e sinalizar para revisão", v: "Não encontrado: 0 ponto, sinalizado para revisão manual", extra: "recomendado" },
      { t: "Não pontuar em silêncio", v: "Não encontrado: 0 ponto, sem sinalizar" },
      { t: "Pontuar como se fosse favorável", v: "Não encontrado: pontua integralmente", extra: "otimista, pode inflar o score" },
    ],
  },

  pontos: {
    pergunta: (r) =>
      r.tipo === "capag"
        ? "Quantos pontos esse critério vale quando a condição for atendida? Hoje seu score soma 90 pontos em 6 critérios ativos."
        : "Como esse critério pontua? Você pode dar um valor único ou trabalhar por faixa.",
    opcoes: (r) =>
      r.tipo === "capag"
        ? [
            { t: "10 pontos", v: "CAPAG A ou B: 10 pontos · CAPAG C ou D: 0 ponto" },
            { t: "15 pontos", v: "CAPAG A ou B: 15 pontos · CAPAG C ou D: 0 ponto" },
            { t: "Escalonado por nota", v: "CAPAG A: 10 · B: 7 · C: 3 · D: 0", extra: "mais granular" },
          ]
        : [
            { t: "10 pontos quando atender", v: "Acima de 100 veículos: 10 pontos. Abaixo: 0 ponto" },
            { t: "Por faixa", v: "Até 50 veículos: 0 · 51 a 100: 5 · acima de 100: 10", extra: "recomendado quando o volume importa" },
          ],
  },

  gatilho: {
    pergunta: () => "Quando eu devo rodar isso? Isso muda o custo: quanto mais cedo, mais licitações passam pelo cálculo.",
    opcoes: () => [
      { t: "Ao enviar para análise", v: "Toda vez que a licitação for enviada para análise", extra: "roda só no que você já filtrou" },
      { t: "Assim que entrar no match", v: "Assim que a licitação entrar no match", extra: "roda em tudo, custo maior" },
      { t: "Só quando eu pedir", v: "Sob demanda, pelo botão na tela da licitação" },
    ],
  },

  saida: {
    pergunta: () => "Por último: onde o resultado aparece?",
    opcoes: (r) => [
      { t: "No Score e no Resumo", v: `Score, no critério "${r.nome}" · Resumo, como campo próprio`, extra: "recomendado" },
      { t: "Só no Score", v: `Score, no critério "${r.nome}"` },
      { t: "Em uma aba nova", v: "Aba própria na tela da licitação, com o resultado completo" },
    ],
  },
}

export function ordemDosPassos(r: Regra): CampoRegra[] {
  return r.tipo === "capag"
    ? ["fonte", "federal", "semDado", "pontos", "gatilho", "saida"]
    : ["fonte", "semDado", "pontos", "gatilho", "saida"]
}

export function proximoPasso(r: Regra): CampoRegra | null {
  return ordemDosPassos(r).find((c) => r[c] === null) ?? null
}

/** Pontos que o critério soma quando atendido (a pré-visualização e a ativação usam o mesmo cálculo). */
export function pontosDaRegra(r: Regra) {
  return /15 pontos/.test(r.pontos ?? "") ? 15 : 10
}

export function formatarReais(valor: number) {
  return `R$ ${valor.toFixed(2).replace(".", ",")}`
}

/* ------------------------------------------------------------------ */
/* Pré-visualização em três licitações reais                           */
/* ------------------------------------------------------------------ */

export type LicitacaoPreview = {
  edital: string
  orgao: string
  capag: string
  resultado: "ok" | "warn" | "dim"
}

export const LICITACOES_PREVIEW: LicitacaoPreview[] = [
  { edital: "Pregão Eletrônico nº 90014/2026", orgao: "Secretaria de Estado da Saúde de Minas Gerais · estadual", capag: "CAPAG B", resultado: "ok" },
  { edital: "Pregão Eletrônico nº 00023/2026", orgao: "Prefeitura Municipal de Itapevi/SP · municipal", capag: "CAPAG não encontrada", resultado: "warn" },
  { edital: "Pregão Eletrônico nº 90112/2026", orgao: "Tribunal Regional Federal da 4ª Região · federal", capag: "Não se aplica", resultado: "dim" },
]
