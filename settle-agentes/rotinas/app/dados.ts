// Dados de exemplo da versão "Rotinas" dos Agentes (hipótese 2, congelada em 26/08).

export type EstadoAgente = "run" | "warn" | "pause" | "draft"

export type Agente = {
  id: string
  nome: string
  instr: string
  estado: EstadoAgente
  gatilho: string
  /** Custo por licitação já formatado. null = nunca rodou. */
  custo: string | null
  alerta?: string
}

export type Modelo = {
  id: string
  nome: string
  desc: string
  quando: string
  fontes: string
  instr: string
}

export type Fonte = { id: string; nome: string; custo: string; on: boolean }
export type Gatilho = { id: GatilhoId; t: string; d: string }
export type GatilhoId = "analise" | "match" | "demanda"
export type Saida = { id: SaidaId; t: string; curto: string; d: string }
export type SaidaId = "score" | "resumo" | "aba"

export const AGENTES: Agente[] = [
  {
    id: "capag",
    nome: "Score: saúde financeira do órgão",
    instr:
      "Verifique a CAPAG do órgão. Se for A ou B, some 10 pontos ao score. Licitação federal não tem CAPAG: não pontue e explique no Resumo.",
    estado: "run",
    gatilho: "Ao enviar para análise",
    custo: "R$ 0,01",
  },
  {
    id: "hab",
    nome: "Checklist de habilitação",
    instr:
      "Liste todos os documentos de habilitação exigidos no edital e nos anexos, separando por jurídica, fiscal, técnica e econômico-financeira. Marque o que a empresa já tem cadastrado.",
    estado: "run",
    gatilho: "Assim que entra no match",
    custo: "R$ 0,06",
  },
  {
    id: "resumo",
    nome: "Resumo executivo do edital",
    instr: "Em um parágrafo: objeto, valor global, prazo de entrega e as três exigências mais críticas para a nossa operação.",
    estado: "run",
    gatilho: "Ao enviar para análise",
    custo: "R$ 0,04",
  },
  {
    id: "subcontratacao",
    nome: "Análise de subcontratação e consórcio",
    instr:
      "Verifique no Termo de Referência se há permissão de subcontratação e de participação em consórcio, e em que percentual.",
    estado: "warn",
    gatilho: "Ao enviar para análise",
    custo: "R$ 0,03",
    alerta: "Não encontrou a informação em 3 das últimas 10 licitações",
  },
  {
    id: "atestado",
    nome: "Exigência de atestado de capacidade técnica",
    instr: "Identifique se o edital exige atestado de capacidade técnica e qual o quantitativo mínimo comprovado exigido.",
    estado: "pause",
    gatilho: "Pausado desde 14/08",
    custo: "R$ 0,04",
  },
  {
    id: "atas",
    nome: "Comparativo com atas de registro de preço",
    instr:
      "Compare o valor unitário estimado com as atas de registro de preço vigentes do mesmo objeto nos últimos 12 meses.",
    estado: "draft",
    gatilho: "Nunca rodou",
    custo: null,
  },
]

export const MODELOS: Modelo[] = [
  {
    id: "capag",
    nome: "Score de saúde financeira do órgão",
    desc: "Pontua a licitação pela CAPAG do órgão, respeitando a esfera. Órgão federal não tem CAPAG.",
    quando: "Ao enviar para análise",
    fontes: "Portal de origem, base do Tesouro",
    instr: "Verifique a CAPAG do órgão. Se for A ou B, some 10 pontos ao score.",
  },
  {
    id: "hab",
    nome: "Checklist de habilitação",
    desc: "Extrai todos os documentos exigidos e monta a lista por categoria, marcando o que a empresa já tem.",
    quando: "Assim que entra no match",
    fontes: "Edital e anexos, documentos da empresa",
    instr:
      "Liste todos os documentos de habilitação exigidos no edital e nos anexos, separando por jurídica, fiscal, técnica e econômico-financeira.",
  },
  {
    id: "tec",
    nome: "Exigências técnicas do objeto",
    desc: "Compara as especificações do Termo de Referência com o que a sua empresa fornece.",
    quando: "Ao enviar para análise",
    fontes: "Termo de Referência, catálogo da empresa",
    instr:
      "Compare cada especificação técnica do Termo de Referência com o catálogo da empresa e aponte o que não atendemos.",
  },
  {
    id: "resumo",
    nome: "Resumo executivo do edital",
    desc: "Um parágrafo com objeto, valor, prazo e as exigências mais críticas.",
    quando: "Ao enviar para análise",
    fontes: "Edital",
    instr: "Em um parágrafo: objeto, valor global, prazo de entrega e as três exigências mais críticas.",
  },
  {
    id: "prazo",
    nome: "Alerta de prazo curto",
    desc: "Avisa quando a sessão for em menos de 5 dias úteis e ainda houver visita técnica obrigatória.",
    quando: "Assim que entra no match",
    fontes: "Portal de origem, Edital",
    instr:
      "Avise quando a sessão pública for em menos de 5 dias úteis e o edital exigir visita técnica obrigatória.",
  },
  {
    id: "impug",
    nome: "Cláusulas restritivas",
    desc: "Sinaliza cláusulas que costumam embasar impugnação, como exigência de marca ou atestado desproporcional.",
    quando: "Sob demanda",
    fontes: "Edital, Termo de Referência",
    instr:
      "Sinalize cláusulas restritivas à competitividade: exigência de marca, atestado desproporcional ao objeto e prazos inexequíveis.",
  },
]

export const FONTES: Fonte[] = [
  { id: "portal", nome: "Portal de origem", custo: "sem custo", on: true },
  { id: "edital", nome: "Edital", custo: "R$ 0,02", on: true },
  { id: "tr", nome: "Termo de Referência", custo: "R$ 0,03", on: false },
  { id: "anexos", nome: "Anexos de habilitação", custo: "R$ 0,04", on: false },
  { id: "empresa", nome: "Documentos da sua empresa", custo: "R$ 0,01", on: false },
  { id: "atas", nome: "Atas e resultados anteriores", custo: "R$ 0,05", on: false },
]

export const GATILHOS: Gatilho[] = [
  { id: "analise", t: "Ao enviar para análise", d: "Roda só nas licitações que você já filtrou. Cerca de 148 por mês." },
  {
    id: "match",
    t: "Assim que entrar no match",
    d: "Roda em tudo que o match trouxer, antes da sua triagem. Cerca de 320 por mês.",
  },
  { id: "demanda", t: "Sob demanda", d: "Só quando alguém clicar no botão dentro da licitação." },
]

/** Licitações por mês em cada gatilho (sob demanda não tem volume previsível). */
export const VOLUME: Record<GatilhoId, number> = { analise: 148, match: 320, demanda: 0 }

export const SAIDAS: Saida[] = [
  { id: "score", t: "No Score", curto: "no Score", d: "Vira um critério com pontuação." },
  { id: "resumo", t: "No Resumo", curto: "no Resumo", d: "Vira um campo do resumo da licitação." },
  {
    id: "aba",
    t: "Em uma aba própria",
    curto: "em uma aba própria",
    d: "Cria uma aba na tela da licitação com o resultado completo.",
  },
]

/** Sugestões da caixa de criação por linguagem natural. */
export const SUGESTOES = [
  { rotulo: "Pontuar pela CAPAG do órgão", texto: "Se a CAPAG do órgão for A ou B, some 10 pontos ao score." },
  {
    rotulo: "Listar os documentos de habilitação exigidos",
    texto: "Liste todos os documentos de habilitação exigidos no edital e nos anexos, separando por categoria.",
  },
  {
    rotulo: "Avisar quando o prazo for curto demais",
    texto: "Avise quando a sessão pública for em menos de 5 dias úteis.",
  },
]

/** Licitações reais da carteira usadas na pré-visualização. */
export const LICS = [
  {
    ed: "Pregão Eletrônico nº 90014/2026",
    org: "Secretaria de Estado da Saúde de Minas Gerais · estadual",
    caso: "ok",
  },
  { ed: "Pregão Eletrônico nº 00023/2026", org: "Prefeitura Municipal de Itapevi/SP · municipal", caso: "semdado" },
  {
    ed: "Pregão Eletrônico nº 90112/2026",
    org: "Tribunal Regional Federal da 4ª Região · federal",
    caso: "federal",
  },
] as const

/* ------------------------------------------------------------------ */
/* Rascunho do agente em edição                                        */
/* ------------------------------------------------------------------ */

export type Rascunho = {
  nome: string
  instr: string
  modelo: string | null
  fontes: Record<string, boolean>
  gatilho: GatilhoId
  saidas: Record<SaidaId, boolean>
  lacunas: Record<string, string>
}

export type Lacuna = { id: string; label: string; q: string; why: string; ops: string[] }

export function novoRascunho(nome: string, instr: string, modelo: string | null): Rascunho {
  return {
    nome,
    instr,
    modelo,
    fontes: Object.fromEntries(FONTES.map((f) => [f.id, f.on])),
    gatilho: modelo === "hab" || modelo === "prazo" ? "match" : "analise",
    saidas: { score: modelo === "capag", resumo: true, aba: false },
    lacunas: {},
  }
}

function valorEmReais(txt: string) {
  const v = parseFloat(txt.replace("R$ ", "").replace(",", "."))
  return Number.isNaN(v) ? 0 : v
}

export const reais = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`

export function custoDoRascunho(r: Rascunho) {
  return FONTES.reduce((soma, f) => (r.fontes[f.id] ? soma + valorEmReais(f.custo) : soma), 0)
}

export function textoDeCusto(r: Rascunho) {
  const un = custoDoRascunho(r)
  const vol = VOLUME[r.gatilho]
  let txt = `${reais(un)} por licitação`
  if (vol) txt += ` · cerca de ${reais(un * vol)} por mês`
  return txt
}

/** Elicitação: aponta só o que ficou em aberto na instrução. */
export function detectarLacunas(r: Rascunho): Lacuna[] {
  const txt = r.instr.toLowerCase()
  const L: Lacuna[] = []

  if (/capag/.test(txt) && !/federal/.test(txt)) {
    L.push({
      id: "federal",
      label: "Se o órgão for federal",
      q: "E quando o órgão for federal?",
      why: "Você citou a CAPAG, mas ela só existe para estado e município. Licitação federal não tem nota, então preciso saber o que fazer nesses casos.",
      ops: ["Não pontuar e explicar no Resumo", "Pontuar como se fosse favorável", "Usar o histórico de pagamento do órgão"],
    })
  }
  if (/atestado|quantitativo|percentual|quantidade|veículo/.test(txt) && !/faixa|acima de|abaixo de/.test(txt)) {
    L.push({
      id: "faixa",
      label: "Quantidade",
      q: "Vale a mesma coisa para qualquer quantidade?",
      why: "A instrução trata o quantitativo como sim ou não. Em geral o volume muda o quanto a licitação interessa.",
      ops: ["Sim, é sim ou não", "Quero pontuar por faixa"],
    })
  }
  L.push({
    id: "semdado",
    label: "Quando não encontrar o dado",
    q: "O que eu faço quando não encontrar essa informação?",
    why: "Este agente roda sozinho, sem ninguém acompanhando. Não encontrar não é a mesma coisa que a resposta ser negativa, e eu preciso saber qual das duas você quer.",
    ops: ["Não pontuar e sinalizar para revisão", "Não pontuar em silêncio", "Tratar como se fosse favorável"],
  })
  if (r.gatilho === "match") {
    L.push({
      id: "volume",
      label: "Volume",
      q: "Confirma rodar em tudo que entra no match?",
      why: "São cerca de 320 licitações por mês contra 148 se rodar só no que você filtrou. O resultado é o mesmo, muda o custo e a antecedência.",
      ops: ["Sim, quero antes da triagem", "Prefiro rodar só no que eu filtrar"],
    })
  }
  if (!r.saidas.score && !r.saidas.resumo && !r.saidas.aba) {
    L.push({
      id: "saida",
      label: "Onde aparece",
      q: "Onde o resultado deve aparecer?",
      why: "Sem isso o agente roda mas ninguém vê o resultado.",
      ops: ["No Score", "No Resumo", "Em uma aba própria"],
    })
  }
  return L
}

export type Tom = "ok" | "warn" | "dim"

/** Resultado simulado de cada licitação da pré-visualização, conforme as respostas da revisão. */
export function resultadoDaPrevia(caso: (typeof LICS)[number]["caso"], r: Rascunho): { val: string; tom: Tom; why: string } {
  if (caso === "ok") return { val: "+10", tom: "ok", why: "CAPAG B, dentro do que você definiu como favorável." }
  if (caso === "semdado") {
    const resp = r.lacunas.semdado ?? ""
    if (/favorável/.test(resp))
      return { val: "+10", tom: "warn", why: "CAPAG não encontrada. Pela sua escolha, pontua mesmo assim." }
    if (/silêncio/.test(resp)) return { val: "0", tom: "dim", why: "CAPAG não encontrada. Não pontua e ninguém fica sabendo." }
    return { val: "0", tom: "warn", why: "CAPAG não encontrada. Vai aparecer sinalizada para revisão manual." }
  }
  const resp = r.lacunas.federal ?? ""
  if (/favorável/.test(resp))
    return { val: "+10", tom: "dim", why: "Órgão federal, sem CAPAG. Pela sua escolha, pontua assim mesmo." }
  if (/histórico/.test(resp))
    return {
      val: "+7",
      tom: "dim",
      why: "Órgão federal. Usou o histórico de pagamento: bom pagador nos últimos 24 meses.",
    }
  return { val: "0", tom: "dim", why: "Órgão federal, sem CAPAG. Aparece como não se aplica no Resumo." }
}

/** Nome sugerido a partir do texto livre da caixa de criação. */
export function nomePeloTexto(txt: string) {
  if (/capag/i.test(txt)) return "Score de saúde financeira do órgão"
  if (/habilita/i.test(txt)) return "Checklist de habilitação"
  if (/prazo|sessão/i.test(txt)) return "Alerta de prazo curto"
  return "Novo agente"
}
