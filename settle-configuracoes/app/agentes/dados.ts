// Agentes e Variáveis dentro de Configurações: a versão final da área, com as melhorias
// do teste de usabilidade de 21/09 (settle-agentes/RESULTADO-TESTE). Os dados partem do
// handoff (settle-agentes/plataforma/app/dados.ts), que continua como está para os devs.
// O cenário é o mesmo: a B Design, empresa de design que disputa licitações de serviços
// digitais. Tudo vive em memória.

/** Nome da empresa do cenário (a conta que usa a Settle). */
export const EMPRESA = "B Design"

/* ------------------------------------------------------------------ */
/* Variáveis                                                           */
/* ------------------------------------------------------------------ */

/** Os formatos que o backend aceita. O formato decide a resposta padrão. */
export const TIPOS_VAR = ["texto", "número", "sim ou não", "data"] as const
export type TipoVar = (typeof TIPOS_VAR)[number]

/*
  No teste, "Tipo" não disse nada: "sim ou não" ficou sem sentido para duas pessoas, e uma
  achou que o tipo mudava só o texto de "não encontrado". Cada formato agora diz como a
  resposta chega, com um exemplo do próprio domínio.
*/
export const FORMATO_VAR: Record<TipoVar, { t: string; d: string; vazio: string }> = {
  texto: { t: "Texto", d: "Um trecho ou resumo do edital. Ex.: o que o edital diz sobre atestados.", vazio: "Ex.: não encontrado" },
  número: { t: "Número", d: "Um valor para somar ou comparar. Ex.: 2.480.000 ou 1.500 horas.", vazio: "Ex.: 0" },
  "sim ou não": { t: "Sim ou não", d: "Uma resposta direta. Ex.: o edital exige atestado? Sim.", vazio: "" },
  data: { t: "Data", d: "Um dia do calendário. Ex.: 18/09/2026, a data da sessão.", vazio: "" },
}

export type Variavel = {
  nome: string
  tipo: TipoVar
  v: string
  custo: number
  desc: string
  prompt: string
  /** Lista ordenada: a ordem é a ordem em que a Settle procura. */
  fontes: string[]
  /** Se não achar nas fontes, procura nos outros arquivos da licitação. */
  resto: boolean
  padrao: string
  settle?: boolean
  /** Mudou depois que alguma instrução que a usa foi escrita. */
  alterada?: boolean
}

/* As instruções são de verdade: no teste, a tabela com instruções em latim tirou a atenção
   de quem tentava entender o que é uma variável. */
export const VARS_INICIAIS: Record<string, Variavel> = {
  cnpj: { nome: "CNPJ do órgão", tipo: "texto", v: "v1", custo: 0.01,
    desc: "Número de CNPJ de quem está contratando.",
    prompt: "Encontre o CNPJ do órgão que está contratando, com os 14 dígitos. Se houver mais de um órgão, traga o do contratante principal.",
    fontes: ["Minuta do contrato", "Edital e anexos"], resto: true, padrao: "não encontrado" },
  sessao: { nome: "Data da sessão pública", tipo: "data", v: "v1", custo: 0.01,
    desc: "Dia e hora da abertura das propostas.",
    prompt: "Encontre a data e a hora da sessão pública de abertura das propostas.",
    fontes: ["Edital e anexos"], resto: true, padrao: "" },
  valorest: { nome: "Valor estimado", tipo: "número", v: "v1", custo: 0.02,
    desc: "Valor total estimado da contratação.",
    prompt: "Encontre o valor global estimado da contratação, somando todos os itens e lotes.",
    fontes: ["Edital e anexos", "Termo de referência"], resto: true, padrao: "0" },
  esfera: { nome: "Esfera", tipo: "texto", settle: true, v: "v2", custo: 0,
    desc: "Se o órgão é federal, estadual ou municipal.",
    prompt: "Classifique o órgão como federal, estadual ou municipal pelo cadastro do portal.",
    fontes: ["Dados do portal"], resto: false, padrao: "não se aplica" },
  capag: { nome: "CAPAG", tipo: "texto", settle: true, v: "v3", custo: 0.01,
    desc: "Nota de capacidade de pagamento do ente, de A a D.",
    prompt: "Traga a nota CAPAG do ente, de A a D, pela base do Tesouro Nacional.",
    fontes: ["Dados do portal", "Bases públicas"], resto: false, padrao: "não encontrado" },
  segmento: { nome: "Segmento da licitação", tipo: "texto", settle: true, v: "v3", custo: 0,
    desc: "Os segmentos de mercado a que o objeto pertence.",
    prompt: "Classifique o objeto nos segmentos de mercado da Settle.",
    fontes: ["Dados do portal"], resto: false, padrao: "não encontrado" },
  populacao: { nome: "População", tipo: "número", settle: true, v: "v1", custo: 0,
    desc: "População do ente, usada para estimar porte.",
    prompt: "Traga a população do município ou do estado pela estimativa mais recente do IBGE.",
    fontes: ["Dados do portal", "Bases públicas"], resto: false, padrao: "0" },
  atestado: { nome: "Atestado exigido", tipo: "sim ou não", v: "v1", custo: 0.04,
    desc: "Se o edital pede atestado de capacidade técnica na habilitação.",
    prompt: "Diga se o edital exige atestado de capacidade técnica para a habilitação.",
    fontes: ["Edital e anexos", "Termo de referência"], resto: true, padrao: "não" },
  subcontr: { nome: "Permite subcontratação", tipo: "sim ou não", v: "v1", custo: 0.03,
    desc: "Se o edital autoriza subcontratar parte do objeto.",
    prompt: "Diga se o edital ou o termo de referência permite subcontratar parte do objeto.",
    fontes: ["Edital e anexos", "Minuta do contrato"], resto: true, padrao: "" },
  qtdveic: { nome: "Total de horas do projeto", tipo: "número", v: "v1", custo: 0.05,
    desc: "Soma da carga horária de todos os itens de serviço de design.",
    prompt: "Some a carga horária de todos os itens de serviço de design no quadro de quantitativos.",
    fontes: ["Termo de referência", "Edital e anexos"], resto: true, padrao: "0" },
  docshab: { nome: "Documentos de habilitação", tipo: "texto", v: "v1", custo: 0.06,
    desc: "Relação dos documentos exigidos para habilitação.",
    prompt: "Liste os documentos de habilitação exigidos, separados em jurídica, fiscal, técnica e econômico-financeira.",
    fontes: ["Edital e anexos"], resto: true, padrao: "não encontrado" },
  componentes: { nome: "Componentes do item", tipo: "texto", v: "v2", custo: 0.02,
    desc: "Os componentes que formam cada item do Termo de Referência.",
    prompt: "Liste os componentes exigidos em cada item do termo de referência.",
    fontes: ["Termo de referência", "Edital e anexos"], resto: true, padrao: "não encontrado" },
  especificacao: { nome: "Especificação exigida", tipo: "texto", v: "v1", custo: 0.01,
    desc: "O texto da especificação técnica de um componente.",
    prompt: "Traga o texto da especificação técnica exigida para o componente.",
    fontes: ["Termo de referência"], resto: true, padrao: "não avaliado" },
}

/*
  Onde procurar. No teste ninguém soube o que eram "Manifestações" e "Arquivos de
  resultado": cada fonte agora diz o que tem dentro.
*/
export const FONTES = [
  "Edital e anexos",
  "Termo de referência",
  "Minuta do contrato",
  "Estudo técnico preliminar",
  "Manifestações",
  "Arquivos de resultado",
]

export const DESC_FONTE: Record<string, string> = {
  "Edital e anexos": "o edital e todos os anexos publicados com ele",
  "Termo de referência": "o documento que descreve o objeto e as exigências técnicas",
  "Minuta do contrato": "o contrato que será assinado com quem vencer",
  "Estudo técnico preliminar": "o estudo que justificou a compra; costuma estar desatualizado",
  Manifestações: "impugnações, pedidos de esclarecimento e as respostas do órgão",
  "Arquivos de resultado": "ata da sessão, resultado e homologação",
}

/** Rótulo da procura nos demais arquivos. */
export const OUTROS_ARQUIVOS = "Outros arquivos"

/* ------------------------------------------------------------------ */
/* Regras do Score e do Checklist                                      */
/* ------------------------------------------------------------------ */

export type Regra = {
  id: string
  nome: string
  destino: "score" | "checklist"
  instr: string
  regraTexto?: string
  vars: string[]
  pontos: number | null
  custo: number
  /** Regra de um Score criado pelo cliente: pertence só a ele. */
  analise?: string
  /** Aviso de que a regra ficou sem a variável que a alimentava. */
  risco?: string | null
  estado?: "run" | "warn"
  /** Variáveis que a regra usava e foram excluídas. */
  perdeu?: string[]
}

export const REGRAS_INICIAIS: Regra[] = [
  { id: "seg", nome: "Aderência ao segmento", destino: "score", vars: [], pontos: 20, custo: 0,
    instr: "Compare o objeto e os itens da licitação com os segmentos cadastrados da empresa.",
    regraTexto: "Cada segmento em comum soma 10, até o teto de 20" },
  { id: "val", nome: "Valor estimado da licitação", destino: "score", vars: [], pontos: 15, custo: 0,
    instr: "Pontue por faixa de valor global estimado.",
    regraTexto: "Até R$ 1 mi soma 5 · de R$ 1 mi a R$ 5 mi soma 10 · acima de R$ 5 mi soma 15" },
  { id: "ate", nome: "Exigência de atestado de capacidade técnica", destino: "score", vars: ["atestado"], pontos: 15, custo: 0.04,
    instr: "Verifique se o edital exige atestado de capacidade técnica. Se não exigir, some 15 pontos.",
    regraTexto: "Não exige soma 15 · exige soma 0" },
  { id: "cap", nome: "Saúde financeira do órgão", destino: "score", vars: ["esfera", "capag"], pontos: 10, custo: 0.01,
    instr: "Verifique a CAPAG do órgão. Se for A ou B, some 10 pontos.",
    regraTexto: "A ou B soma 10 · C ou D soma 0 · federal e estatal não se aplica" },
  { id: "praz", nome: "Prazo até a sessão pública", destino: "score", vars: [], pontos: 10, custo: 0,
    instr: "Pontue pelos dias úteis até a sessão pública.",
    regraTexto: "Menos de 5 dias soma 0 · de 5 a 15 dias soma 8 · acima de 15 dias soma 10" },
  { id: "sub", nome: "Permite subcontratação", destino: "score", vars: ["subcontr"], pontos: 10, custo: 0.03,
    instr: "Se o termo de referência permitir subcontratação, some 10 pontos.",
    regraTexto: "Permite soma 10 · não permite soma 0" },
  { id: "meepp", nome: "Participação exclusiva ME/EPP", destino: "score", vars: [], pontos: 5, custo: 0,
    instr: "Se a licitação for exclusiva para ME/EPP, some 5 pontos.",
    regraTexto: "Exclusiva para ME/EPP soma 5 · ampla concorrência soma 0" },
  { id: "iso", nome: "Certificação ISO 27001 de segurança da informação", destino: "score", vars: ["segmento"], pontos: 10, custo: 0,
    instr: "Se o edital exigir ISO 27001 e a empresa tiver o certificado válido, some 10 pontos.",
    regraTexto: "Exige e temos soma 10 · exige e não temos soma 0" },
  { id: "frota", nome: "Porte do projeto", destino: "score", vars: ["qtdveic"], pontos: 15, custo: 0.05,
    instr: "Some a carga horária de todos os itens de serviço de design e pontue pela faixa.",
    regraTexto: "Até 1.000 h soma 0 · de 1.001 a 4.000 h soma 10 · acima de 4.000 h soma 15" },
  { id: "hab", nome: "Checklist de habilitação", destino: "checklist", vars: ["docshab"], pontos: null, custo: 0.06,
    instr: "Liste todos os documentos de habilitação exigidos, separando por jurídica, fiscal, técnica e econômico-financeira.",
    regraTexto: "Lista por categoria: jurídica, fiscal, técnica e econômico-financeira" },
]

/** O agente de escopo por componente (Análise técnica): a instrução e as variáveis dele. */
export const AGENTE_TEC = {
  instr: "Para cada componente exigido no Termo de Referência, compare a especificação com o catálogo da empresa e diga se atendemos.",
  vars: ["componentes", "especificacao"],
}

/* ------------------------------------------------------------------ */
/* Quando o agente trabalha                                            */
/* ------------------------------------------------------------------ */

export const GATILHOS = {
  captura: "Quando a licitação é capturada",
  recomendadas: "Quando chega em Recomendadas",
  analise: "Quando é enviada para análise",
  agendado: "Em um horário agendado",
  demanda: "Quando você pedir",
} as const
export type Momento = keyof typeof GATILHOS

/*
  "Rodar o quê?", "capturada e recomendada não é a mesma coisa?": cada momento agora diz o
  que acontece na plataforma, com as palavras da rotina de quem analisa.
*/
export const DESC_GATILHO: Record<Momento, string> = {
  captura: "Assim que a Settle encontra a licitação no portal, antes de escolher se ela é para você.",
  recomendadas: "Quando a Settle escolhe a licitação para você e ela aparece em Recomendadas.",
  analise: "Quando alguém clica em Enviar para análise e a licitação vai para Em andamento.",
  agendado: "Num horário fixo, que se repete. Bom para o que muda com o tempo, como a validade das certidões.",
  demanda: "Só quando alguém pedir, pelo botão Executar ou pelo chat.",
}

export const REPETICAO = { primeira: "Só na primeira vez", sempre: "Toda vez" } as const
export type Repeticao = keyof typeof REPETICAO

/*
  A repetição só existe onde o evento se repete. No teste, "a cada atualização da
  licitação" não dizia que atualização era essa (a minha? a do processo?), e as duas
  opções pareciam poder ser marcadas juntas. Virou uma pergunta com duas respostas.
*/
export const REP_POR_GATILHO: Partial<Record<Momento, Record<Repeticao, { t: string; d: string }>>> = {
  captura: {
    primeira: { t: "Não, só uma vez", d: "O agente trabalha quando a licitação é capturada e não volta mais nela." },
    sempre: { t: "Sim, quando o edital mudar", d: "Trabalha de novo a cada retificação, impugnação, esclarecimento ou nova data." },
  },
  recomendadas: {
    primeira: { t: "Não, só uma vez", d: "O agente trabalha quando a licitação chega em Recomendadas e não volta mais nela." },
    sempre: { t: "Sim, quando o edital mudar", d: "Trabalha de novo a cada retificação, impugnação, esclarecimento ou nova data." },
  },
}

export const FREQUENCIAS = { hora: "Por hora", dia: "Diário", uteis: "Dias úteis", semana: "Semanal", mes: "Mensal" } as const
export type Frequencia = keyof typeof FREQUENCIAS
export const DIAS = {
  seg: "segunda-feira", ter: "terça-feira", qua: "quarta-feira", qui: "quinta-feira",
  sex: "sexta-feira", sab: "sábado", dom: "domingo",
} as const
export type Dia = keyof typeof DIAS
export type Agenda = { freq: Frequencia; dia: Dia; hora: string; inicio: string }
export const AGENDA_PADRAO: Agenda = { freq: "semana", dia: "sex", hora: "09:00", inicio: "2026-09-12" }

/* ------------------------------------------------------------------ */
/* Onde o resultado aparece                                            */
/* ------------------------------------------------------------------ */

/*
  O agente não é a funcionalidade: ele produz o resultado que ela mostra. No teste, o texto
  de "Nenhum lugar" só aparecia depois de escolher e passou despercebido para três pessoas,
  e "AI Widget" precisou da analogia com o widget do celular. Cada opção agora diz o lugar
  na licitação, e "Nenhum lugar" diz no próprio nome para que serve.
*/
export const ONDE = {
  score: { t: "Score", d: "Soma pontos na nota que ordena a sua lista." },
  checklist: { t: "Checklist", d: "Vira uma resposta no checklist da licitação." },
  tecnica: { t: "Análise técnica", d: "Aparece na aba Análise técnica da licitação." },
  juridica: { t: "Análise jurídica", d: "Aparece na aba Análise jurídica da licitação." },
  habilitacao: { t: "Habilitação", d: "Aparece na aba Habilitação da licitação." },
  nenhum: { t: "Nenhum lugar: o agente só faz ações", d: "Para agentes que movem a licitação ou marcam um responsável. O que ele fez fica no histórico dele." },
} as const
export type Onde = keyof typeof ONDE

/* ------------------------------------------------------------------ */
/* Aprovação das ações                                                 */
/* ------------------------------------------------------------------ */

/*
  No teste, uma pessoa achou que "pedir aprovação para tudo" era o agente pedir licença
  para ler o edital, como o Claude faz. As três opções ficam à vista, com o que cada uma
  custa, e o título diz de que ação se trata.
*/
export const APROVACAO = {
  manual: { t: "Pedir aprovação para tudo",
    d: "Antes de mover uma licitação, marcar um responsável ou descartar, o agente espera alguém aprovar em Aprovações. É o mais seguro, mas nada anda até alguém responder." },
  auto: { t: "Aprovar o que for seguro",
    d: "As ações do dia a dia seguem sozinhas. As arriscadas, como descartar uma licitação, vão para Aprovações. Reduz o risco, mas não o elimina: uma ação arriscada ainda pode passar quando falta contexto." },
  nunca: { t: "Nunca pedir aprovação",
    d: "O agente age na hora, sem pedir nada. Use só em agentes que você já conferiu: um erro vira mudança nas suas licitações que ninguém revisou." },
} as const
export type ModoAprovacao = keyof typeof APROVACAO

/* ------------------------------------------------------------------ */
/* Agentes                                                             */
/* ------------------------------------------------------------------ */

export type Execucao = { quando: string; lic: string; o: string; st: "ok" | "aguardando" | "falhou" }

export const ESTADO_EXEC: Record<Execucao["st"], string> = {
  ok: "Concluída",
  aguardando: "Aguardando aprovação",
  falhou: "Falhou",
}

export type Agente = {
  id: string
  nome: string
  formato: "estruturado" | "composicao" | "texto"
  desc: string
  /** Rótulo do momento (um dos valores de GATILHOS). */
  gatilho: string
  repete?: Repeticao
  agenda?: Agenda
  /** Onde o resultado aparece na licitação. */
  onde?: Onde
  destino?: "score" | "checklist"
  /** Score criado pelo cliente: as regras são só as dele. */
  propria?: boolean
  aprovacao?: ModoAprovacao
  execs: Execucao[]
  /** undefined vale como ativo. */
  ativo?: boolean
  texto: string
}

type AgenteSemTexto = Omit<Agente, "texto"> & { texto?: string }

const JURIDICA_TEXTO =
  "Analise o edital e aponte risco jurídico para a nossa participação. Considere {{subcontr}} e {{atestado}}. " +
  "Sinalize cláusula que restrinja a competitividade, como exigência de marca ou de atestado desproporcional ao objeto."

export const AGENTES_SEM_TEXTO: AgenteSemTexto[] = [
  { id: "score", nome: "Score", formato: "estruturado", onde: "score",
    desc: "Nota de 0 a 100 que ordena a sua lista de licitações.",
    gatilho: GATILHOS.recomendadas, destino: "score", aprovacao: "manual",
    execs: [
      { quando: "hoje, 14:22", lic: "PE 90014/2026 · Secretaria de Saúde de MG", o: "Calculou 78 de 100", st: "ok" },
      { quando: "hoje, 14:22", lic: "PE 00023/2026 · Prefeitura de Itapevi/SP", o: "Calculou 34 de 100 · pediu para mover para Descartadas", st: "aguardando" },
      { quando: "ontem, 17:40", lic: "PE 00088/2026 · Secretaria de Educação do RS", o: "Calculou 81 de 100", st: "ok" },
    ] },
  { id: "checklist", nome: "Checklist", formato: "estruturado", onde: "checklist",
    desc: "Responde as perguntas fixas sobre o edital, agrupadas por seção.",
    gatilho: GATILHOS.recomendadas, destino: "checklist",
    execs: [
      { quando: "hoje, 14:20", lic: "PE 90014/2026 · Secretaria de Estado de Saúde de MG", o: "Respondeu 21 de 23 perguntas · 2 marcadas para revisar", st: "ok" },
    ] },
  { id: "tecnica", nome: "Análise técnica", formato: "composicao", onde: "tecnica",
    desc: "Compara componente a componente do Termo de Referência com o catálogo da empresa.",
    gatilho: GATILHOS.analise, texto: AGENTE_TEC.instr, aprovacao: "manual",
    execs: [
      { quando: "hoje, 14:22", lic: "PE 90014/2026 · Secretaria de Saúde de MG", o: "Avaliou 15 componentes em 3 itens · pediu para mover para Em análise", st: "aguardando" },
    ] },
  { id: "habil", nome: "Tenho todos os documentos de habilitação?", formato: "texto", onde: "habilitacao",
    desc: "Compara a lista de documentos e atestados da B Design com as exigências do edital.",
    gatilho: GATILHOS.analise, aprovacao: "manual",
    texto: "Compare os documentos e atestados cadastrados da B Design com as exigências de " +
      "habilitação do edital e diga o que falta. Considere {{docshab}} e {{atestado}}. " +
      "Some a carga horária dos atestados quando o edital admitir soma.",
    execs: [
      { quando: "hoje, 14:20", lic: "PE 90014/2026 · Secretaria de Estado de Saúde de MG", o: "3 de 5 exigências atendidas · 1 não atende · 1 não avaliada", st: "ok" },
    ] },
  { id: "certidoes", nome: "Alguma certidão vence antes da sessão?", formato: "texto", onde: "habilitacao",
    desc: "Compara a validade das certidões da B Design com a data da sessão pública.",
    gatilho: GATILHOS.agendado,
    agenda: { freq: "semana", dia: "seg", hora: "08:00", inicio: "2026-09-14" }, aprovacao: "auto",
    texto: "Compare a validade de cada certidão cadastrada da B Design com {{sessao}} e " +
      "avise quais vencem antes da sessão pública.",
    execs: [
      { quando: "hoje, 14:21", lic: "PE 90014/2026 · Secretaria de Estado de Saúde de MG", o: "1 de 4 certidões vence antes da sessão", st: "ok" },
    ] },
  { id: "juridica", nome: "Análise jurídica", formato: "texto", ativo: false, onde: "juridica",
    desc: "Aponta risco jurídico para a participação.",
    gatilho: GATILHOS.analise, texto: JURIDICA_TEXTO, execs: [] },
]

/* ------------------------------------------------------------------ */
/* Aprovações                                                          */
/* ------------------------------------------------------------------ */

/*
  No teste, quatro pessoas leram a fila como outra coisa (editais selecionados, relatório
  de captados, pré-análise) e uma não sabia de onde a licitação estava saindo. Cada pedido
  agora diz o agente que pediu e, quando é mudança de etapa, de onde para onde.
*/
export type Aprovacao = {
  id: string
  lic: string
  org: string
  /** id do agente que pediu. */
  agente: string
  acao: string
  de?: string
  para?: string
  por: string
  quando: string
}

export const APROVACOES_INICIAIS: Aprovacao[] = [
  { id: "a1", lic: "PE 90014/2026", org: "Secretaria de Saúde de MG", agente: "tecnica",
    acao: "Mover etapa", de: "Recomendadas", para: "Em análise", por: "11 dos 15 componentes atendem ao Termo de Referência", quando: "hoje, 14:22" },
  { id: "a2", lic: "PE 00023/2026", org: "Prefeitura de Itapevi/SP", agente: "score",
    acao: "Mover etapa", de: "Recomendadas", para: "Descartadas", por: "Score 34 de 100, abaixo do corte de 50", quando: "hoje, 14:22" },
  { id: "a3", lic: "PE 90112/2026", org: "Tribunal Regional Federal da 4ª Região", agente: "tecnica",
    acao: "Marcar Michele como responsável", por: "Órgão federal com objeto de design, faixa dela", quando: "hoje, 11:08" },
  { id: "a4", lic: "PE 00471/2026", org: "Prefeitura de Contagem/MG", agente: "tecnica",
    acao: "Consultar o catálogo do fabricante", por: "Componente sem especificação equivalente no catálogo interno", quando: "ontem, 17:40" },
  { id: "a5", lic: "PE 00088/2026", org: "Secretaria de Educação do RS", agente: "score",
    acao: "Mover etapa", de: "Recomendadas", para: "Em análise", por: "Score 81 de 100, acima do corte", quando: "ontem, 17:40" },
]

/* ------------------------------------------------------------------ */
/* Criar agente: modelos                                               */
/* ------------------------------------------------------------------ */

/*
  Títulos e descrições em lorem ipsum de propósito (decisão do Brunno): o catálogo ainda
  vai ser definido, e nome de exemplo vira decisão tomada na cabeça de quem lê. O que é
  real em cada card é o formato de preenchimento.
*/
export const FORMATOS = {
  score: { t: "Lista de variáveis e pontos", gatilho: "recomendadas" as Momento, onde: "score" as Onde },
  texto: { t: "Instrução em texto", gatilho: "analise" as Momento, onde: "tecnica" as Onde },
}
export type FormatoModelo = keyof typeof FORMATOS

export const MODELOS: { id: string; formato: FormatoModelo; nome: string; sub: string }[] = [
  { id: "t1", formato: "score", nome: "Lorem ipsum dolor sit", sub: "Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore." },
  { id: "t2", formato: "texto", nome: "Ut enim ad minim veniam", sub: "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo." },
  { id: "t3", formato: "score", nome: "Duis aute irure dolor", sub: "In reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla." },
  { id: "t4", formato: "texto", nome: "Excepteur sint occaecat", sub: "Cupidatat non proident, sunt in culpa qui officia deserunt mollit anim." },
]
