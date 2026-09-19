// Dados de exemplo e tipos do protótipo de Agentes na plataforma (handoff).
// O cenário é o da B Design: uma empresa de design que disputa licitações de
// serviços digitais. Tudo vive em memória: recarregar a página volta ao início.

/*
  Custo por execução saiu da interface em 31/08, até a Alice confirmar em que lugar
  ele deve aparecer. Os valores continuam no modelo: basta virar para true para o custo
  voltar aos cards e aos rodapés da configuração.
*/
export const MOSTRAR_CUSTO = false

/** Nome da empresa do cenário (a conta que usa a Settle). */
export const EMPRESA = "B Design"

/* ------------------------------------------------------------------ */
/* Variáveis                                                           */
/* ------------------------------------------------------------------ */

/** Os tipos que o backend aceita. O tipo decide o formato do valor padrão. */
export const TIPOS_VAR = ["texto", "número", "sim ou não", "data"] as const
export type TipoVar = (typeof TIPOS_VAR)[number]

/*
  A variável, com o que o backend precisa receber (reunião de 02/09 com Bruno Ortiz
  e José Victor):
  - tipo é obrigatório e é ele que valida o valor padrão e o que o prompt pode pedir.
  - prompt é campo próprio, separado do nome e da descrição, porque cresce.
  - fontes é uma LISTA ORDENADA, não um conjunto: "o CNPJ quase sempre está na
    minuta do contrato, procure lá primeiro".
  - settle: true são as que a Settle cadastra. O cliente lê, não edita.
*/
export type Variavel = {
  nome: string
  tipo: TipoVar
  v: string
  custo: number
  desc: string
  prompt: string
  fontes: string[]
  /** Se não achar nas fontes, procura nos outros arquivos da licitação. */
  resto: boolean
  padrao: string
  settle?: boolean
  /** Mudou depois que alguma instrução que a usa foi escrita. */
  alterada?: boolean
}

export const VARS_INICIAIS: Record<string, Variavel> = {
  /* As três primeiras existem para quem abre a tela pela primeira vez: o que elas
     extraem se entende sem saber nada de licitação, e entre elas cobrem texto, data
     e número. */
  cnpj: { nome: "CNPJ do órgão", tipo: "texto", v: "v1", custo: 0.01,
    desc: "Número de CNPJ de quem está contratando.",
    prompt: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
    fontes: ["Minuta do contrato", "Edital e anexos"], resto: true, padrao: "não encontrado" },
  sessao: { nome: "Data da sessão pública", tipo: "data", v: "v1", custo: 0.01,
    desc: "Dia e hora da abertura das propostas.",
    prompt: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi.",
    fontes: ["Edital e anexos"], resto: true, padrao: "" },
  valorest: { nome: "Valor estimado", tipo: "número", v: "v1", custo: 0.02,
    desc: "Valor total estimado da contratação.",
    prompt: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.",
    fontes: ["Edital e anexos", "Termo de referência"], resto: true, padrao: "0" },
  esfera: { nome: "Esfera", tipo: "texto", settle: true, v: "v2", custo: 0,
    desc: "Se o órgão é federal, estadual ou municipal.",
    prompt: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia.",
    fontes: ["Dados do portal"], resto: false, padrao: "não se aplica" },
  capag: { nome: "CAPAG", tipo: "texto", settle: true, v: "v3", custo: 0.01,
    desc: "Nota de capacidade de pagamento do ente, de A a D.",
    prompt: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium.",
    fontes: ["Dados do portal", "Bases públicas"], resto: false, padrao: "não encontrado" },
  segmento: { nome: "Segmento da licitação", tipo: "texto", settle: true, v: "v3", custo: 0,
    desc: "Os segmentos de mercado a que o objeto pertence.",
    prompt: "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.",
    fontes: ["Dados do portal"], resto: false, padrao: "não encontrado" },
  populacao: { nome: "População", tipo: "número", settle: true, v: "v1", custo: 0,
    desc: "População do ente, usada para estimar porte.",
    prompt: "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet consectetur.",
    fontes: ["Dados do portal", "Bases públicas"], resto: false, padrao: "0" },
  atestado: { nome: "Atestado exigido", tipo: "sim ou não", v: "v1", custo: 0.04,
    desc: "Se o edital pede atestado de capacidade técnica na habilitação.",
    prompt: "Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam.",
    fontes: ["Edital e anexos"], resto: true, padrao: "não" },
  subcontr: { nome: "Permite subcontratação", tipo: "sim ou não", v: "v1", custo: 0.03,
    desc: "Se o edital autoriza subcontratar parte do objeto.",
    prompt: "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis.",
    fontes: ["Edital e anexos", "Minuta do contrato"], resto: true, padrao: "nenhum" },
  qtdveic: { nome: "Total de horas do projeto", tipo: "número", v: "v1", custo: 0.05,
    desc: "Soma da carga horária de todos os itens de serviço de design.",
    prompt: "Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus.",
    fontes: ["Termo de referência", "Edital e anexos"], resto: true, padrao: "0" },
  docshab: { nome: "Documentos de habilitação", tipo: "texto", v: "v1", custo: 0.06,
    desc: "Relação dos documentos exigidos para habilitação.",
    prompt: "Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit.",
    fontes: ["Edital e anexos"], resto: true, padrao: "não encontrado" },
  componentes: { nome: "Componentes do item", tipo: "texto", v: "v2", custo: 0.02,
    desc: "Os componentes que formam cada item do Termo de Referência.",
    prompt: "Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis.",
    fontes: ["Termo de referência", "Edital e anexos"], resto: true, padrao: "não encontrado" },
  especificacao: { nome: "Especificação exigida", tipo: "texto", v: "v1", custo: 0.01,
    desc: "O texto da especificação técnica de um componente.",
    prompt: "Omnis voluptas assumenda est, omnis dolor repellendus in eligendi optio.",
    fontes: ["Termo de referência"], resto: true, padrao: "não avaliado" },
}

/*
  Três listas da tela são fechadas pela Settle, não pelo cliente: tipo da resposta,
  onde procurar e quando roda. Na reunião de 02/09 o José Victor ficou de passar as
  três. Até chegarem, o que está aqui é provisório.

  As fontes possíveis. Dentro de "Edital e anexos" há documento que vale e documento
  que já não vale: o estudo preliminar costuma estar desatualizado, o termo de
  referência é o que rege (José Victor, 14:24).
*/
export const FONTES = [
  "Edital e anexos",
  "Termo de referência",
  "Minuta do contrato",
  "Estudo técnico preliminar",
  "Manifestações",
  "Arquivos de resultado",
]

/** Rótulo da procura nos demais arquivos. */
export const OUTROS_ARQUIVOS = "Outros arquivos"

/* ------------------------------------------------------------------ */
/* Regras do Score e do Checklist                                      */
/* ------------------------------------------------------------------ */

/*
  O Score e o Checklist nasceram como lista de regras, antes de a instrução em
  texto virar a forma de criar agente. A instrução deles é derivada das regras uma
  vez, com as variáveis já como variáveis.
*/
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
}

export const REGRAS_INICIAIS: Regra[] = [
  { id: "seg", nome: "Aderência ao segmento", destino: "score", vars: [], pontos: 20, custo: 0,
    instr: "Compare o objeto e os itens da licitação com os segmentos cadastrados da empresa.",
    regraTexto: "Cada segmento em comum soma 10, até o teto de 20" },
  { id: "val", nome: "Valor estimado da licitação", destino: "score", vars: [], pontos: 15, custo: 0,
    instr: "Pontue por faixa de valor global estimado: até R$ 1 mi vale 5, de R$ 1 mi a R$ 5 mi vale 10, acima de R$ 5 mi vale 20.",
    regraTexto: "Até R$ 1 mi soma 5 · de R$ 1 mi a R$ 5 mi soma 10 · acima de R$ 5 mi soma 15" },
  { id: "ate", nome: "Exigência de atestado de capacidade técnica", destino: "score", vars: ["atestado"], pontos: 15, custo: 0.04,
    instr: "Verifique se o edital exige atestado de capacidade técnica. Se não exigir, some 15 pontos.",
    regraTexto: "Não exige soma 15 · exige soma 0", estado: "warn",
    risco: "A informação não foi encontrada, e a regra atual soma os 15 pontos mesmo assim. Em 3 das últimas 10 licitações a exigência estava em anexo separado." },
  { id: "cap", nome: "Saúde financeira do órgão", destino: "score", vars: ["esfera", "capag"], pontos: 10, custo: 0.01,
    instr: "Verifique a CAPAG do órgão. Se for A ou B, some 10 pontos.",
    regraTexto: "A ou B soma 10 · C ou D soma 0 · federal e estatal não se aplica" },
  { id: "praz", nome: "Prazo até a sessão pública", destino: "score", vars: [], pontos: 10, custo: 0,
    instr: "Menos de 5 dias úteis vale 0, de 5 a 15 dias vale 8, acima de 15 dias vale 10.",
    regraTexto: "Menos de 5 dias soma 0 · de 5 a 15 dias soma 8 · acima de 15 dias soma 10" },
  { id: "sub", nome: "Permite subcontratação", destino: "score", vars: ["subcontr"], pontos: 10, custo: 0.03,
    instr: "Se o Termo de Referência permitir subcontratação, some 10 pontos.",
    regraTexto: "Permite soma 10 · não permite soma 0" },
  { id: "meepp", nome: "Participação exclusiva ME/EPP", destino: "score", vars: [], pontos: 5, custo: 0,
    instr: "Se a licitação for exclusiva para ME/EPP, some 10 pontos.",
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
/* Momentos de execução                                                */
/* ------------------------------------------------------------------ */

/*
  Quando o agente roda: um evento da licitação mais uma regra de repetição. Os oito
  momentos levantados no handoff são cinco eventos vezes "só na primeira vez" ou
  "toda vez"; tratar cada combinação como um gatilho diferente multiplicaria a lista.
*/
export const GATILHOS = {
  captura: "Quando a licitação é capturada",
  recomendadas: "Quando chega em Recomendadas",
  analise: "Quando é enviada para análise",
  agendado: "Em um horário agendado",
  demanda: "Quando você pedir",
} as const
export type Momento = keyof typeof GATILHOS

/*
  A frase de espera diz o que a pessoa vai ver e o que falta acontecer para isso:
  "O Checklist aparece aqui depois que você enviar a licitação para análise".
*/
export const MOMENTO_TXT: Record<Momento, string> = {
  recomendadas: "quando a licitação chegar em Recomendadas",
  analise: "depois que você enviar a licitação para análise",
  captura: "quando a licitação for capturada",
  agendado: "no próximo horário agendado",
  demanda: "quando você pedir",
}

export const REPETICAO = { primeira: "Só na primeira vez", sempre: "Toda vez" } as const
export type Repeticao = keyof typeof REPETICAO

/*
  A repetição só existe onde o evento se repete: a licitação capturada e a
  recomendada continuam recebendo atualizações. O envio para análise acontece uma
  vez só, então ali não há o que escolher.
*/
export const REP_POR_GATILHO: Partial<Record<Momento, Record<Repeticao, string>>> = {
  captura: { primeira: "Só quando é capturada", sempre: "Também a cada atualização da licitação" },
  recomendadas: { primeira: "Só quando chega em Recomendadas", sempre: "Também a cada atualização da licitação" },
}

/*
  Frequência no padrão das tarefas agendadas do Claude: cada opção pede só o que
  ela precisa. Diário e dias úteis pedem a hora; semanal, a hora e o dia; mensal,
  a data de início e a hora; por hora, nada.
*/
export const FREQUENCIAS = { hora: "Por hora", dia: "Diário", uteis: "Dias úteis", semana: "Semanal", mes: "Mensal" } as const
export type Frequencia = keyof typeof FREQUENCIAS
export const DIAS = {
  seg: "segunda-feira", ter: "terça-feira", qua: "quarta-feira", qui: "quinta-feira",
  sex: "sexta-feira", sab: "sábado", dom: "domingo",
} as const
export type Dia = keyof typeof DIAS
export type Agenda = { freq: Frequencia; dia: Dia; hora: string; inicio: string }
export const AGENDA_PADRAO: Agenda = { freq: "semana", dia: "sex", hora: "09:00", inicio: "2026-09-12" }

/*
  Onde o resultado aparece. O agente não é a funcionalidade: ele produz o resultado
  que a funcionalidade mostra. "Nenhum lugar" é para instruções que são ações, como
  mover a licitação ou marcar um responsável.
*/
export const FUNCIONALIDADES = {
  score: "Score",
  checklist: "Checklist",
  tecnica: "Análise técnica",
  juridica: "Análise jurídica",
  habilitacao: "Habilitação",
} as const

/*
  No modelo das permissões do Claude, adaptado à Settle: o nome diz o resultado, e o
  texto diz o custo de cada modo. O do meio pressupõe uma verificação que classifica
  cada ação como segura ou arriscada; a lista do que é arriscado ainda precisa ser
  definida.
*/
export const APROVACAO = {
  manual: { t: "Pedir aprovação para tudo",
    d: "O agente pede sua aprovação antes de cada ação, como mover uma licitação ou marcar um responsável. É o modo mais seguro, mas cada ação fica parada na fila de Aprovações até alguém aprovar." },
  auto: { t: "Aprovar o que for seguro",
    d: "As ações do dia a dia seguem sozinhas. As arriscadas, como descartar uma licitação, são barradas, e o agente procura outro caminho. Se ele insistir, você recebe um pedido de aprovação. Reduz o risco, mas não o elimina: uma ação arriscada ainda pode passar quando falta contexto." },
  nunca: { t: "Nunca pedir aprovação",
    d: "O agente age na hora, sem pedir aprovação e sem verificar se a ação é arriscada. Use só em agentes cujas ações você já conferiu: um erro vira mudança nas suas licitações que ninguém revisou." },
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

/*
  Um agente é UMA análise que produz N resultados. O Score é uma análise com 9
  regras dentro, não 9 agentes. A instrução é texto com variáveis dentro, escritas
  como {{chave}}.
*/
export type Agente = {
  id: string
  nome: string
  formato: "estruturado" | "composicao" | "texto"
  desc: string
  /** Rótulo do momento (um dos valores de GATILHOS). */
  gatilho: string
  agenda?: Agenda
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
  { id: "score", nome: "Score", formato: "estruturado",
    desc: "Nota de 0 a 100 que ordena a sua lista de licitações.",
    gatilho: GATILHOS.recomendadas, destino: "score",
    execs: [
      { quando: "hoje, 14:22", lic: "PE 90014/2026 · Secretaria de Saúde de MG", o: "Calculou 78 de 100", st: "ok" },
      { quando: "hoje, 14:22", lic: "PE 00023/2026 · Prefeitura de Itapevi/SP", o: "Calculou 34 de 100 · pediu para mover para Descartadas", st: "aguardando" },
      { quando: "ontem, 17:40", lic: "PE 00088/2026 · Secretaria de Educação do RS", o: "Calculou 81 de 100", st: "ok" },
      { quando: "ontem, 09:14", lic: "PE 90112/2026 · Tribunal Regional Federal da 4ª Região", o: "Não encontrou CAPAG: órgão federal não tem", st: "falhou" },
    ] },
  { id: "checklist", nome: "Checklist", formato: "estruturado",
    desc: "Responde as perguntas fixas sobre o edital, agrupadas por seção.",
    gatilho: GATILHOS.recomendadas, destino: "checklist",
    execs: [
      { quando: "hoje, 14:20", lic: "PE 90014/2026 · Secretaria de Estado de Saúde de MG", o: "Respondeu 21 de 23 perguntas · 2 marcadas para revisar", st: "ok" },
      { quando: "ontem, 11:02", lic: "PE 00471/2026 · Prefeitura de Contagem/MG", o: "Respondeu 23 de 23 perguntas", st: "ok" },
    ] },
  { id: "tecnica", nome: "Análise técnica", formato: "composicao",
    desc: "Compara componente a componente do Termo de Referência com o catálogo da empresa.",
    gatilho: GATILHOS.analise, texto: AGENTE_TEC.instr,
    execs: [
      { quando: "hoje, 14:22", lic: "PE 90014/2026 · Secretaria de Saúde de MG", o: "Avaliou 15 componentes em 3 itens · pediu para mover para Em análise", st: "aguardando" },
      { quando: "ontem, 17:40", lic: "PE 00471/2026 · Prefeitura de Contagem/MG", o: "Avaliou 9 componentes · pediu acesso ao catálogo do fabricante", st: "aguardando" },
    ] },
  /* Segundo caso de uso do teste com usuário (Alice, 17:09 de 03/09): a pessoa sobe os
     atestados que a empresa tem, e o agente compara com o que o edital exige. */
  { id: "habil", nome: "Tenho todos os documentos de habilitação?", formato: "texto",
    desc: "Compara a lista de documentos e atestados da B Design com as exigências do edital.",
    gatilho: GATILHOS.demanda, aprovacao: "manual",
    texto: "Compare os documentos e atestados cadastrados da B Design com as exigências de " +
      "habilitação do edital e diga o que falta. Considere {{docshab}} e {{atestado}}. " +
      "Some a carga horária dos atestados quando o edital admitir soma.",
    execs: [
      { quando: "hoje, 14:20", lic: "PE 90014/2026 · Secretaria de Estado de Saúde de MG", o: "3 de 5 exigências atendidas · 1 não atende · 1 não avaliada", st: "ok" },
      { quando: "ontem, 11:02", lic: "PE 00471/2026 · Prefeitura de Contagem/MG", o: "5 de 5 exigências atendidas", st: "ok" },
    ] },
  /* Segundo agente na mesma aba: uma seção pode ter mais de um widget (Alice, 09/09,
     15:08). Agendado toda segunda: a validade das certidões muda com o tempo, e a
     mesma licitação precisa ser conferida de novo até a sessão. */
  { id: "certidoes", nome: "Alguma certidão vence antes da sessão?", formato: "texto",
    desc: "Compara a validade das certidões da B Design com a data da sessão pública.",
    gatilho: GATILHOS.agendado,
    agenda: { freq: "semana", dia: "seg", hora: "08:00", inicio: "2026-09-14" }, aprovacao: "auto",
    texto: "Compare a validade de cada certidão cadastrada da B Design com {{sessao}} e " +
      "avise quais vencem antes da sessão pública.",
    execs: [
      { quando: "hoje, 14:21", lic: "PE 90014/2026 · Secretaria de Estado de Saúde de MG", o: "1 de 4 certidões vence antes da sessão", st: "ok" },
    ] },
  { id: "juridica", nome: "Análise jurídica", formato: "texto", ativo: false,
    desc: "Texto livre com variáveis dentro.",
    gatilho: GATILHOS.analise, texto: JURIDICA_TEXTO, execs: [] },
]

/* ------------------------------------------------------------------ */
/* Aprovações                                                          */
/* ------------------------------------------------------------------ */

/*
  O corner case do Bruno Ortiz (02/09): se o agente roda em 50 licitações e cada ação
  pede aprovação, ninguém vai abrir 50 licitações para clicar em aprovar. A fila junta
  tudo num lugar e deixa aprovar em lote.
*/
export type Aprovacao = { id: string; lic: string; org: string; agente: string; acao: string; por: string; quando: string }

export const APROVACOES_INICIAIS: Aprovacao[] = [
  { id: "a1", lic: "PE 90014/2026", org: "Secretaria de Saúde de MG", agente: "Análise técnica",
    acao: "Mover para Em análise", por: "11 dos 15 componentes atendem ao Termo de Referência", quando: "hoje, 14:22" },
  { id: "a2", lic: "PE 00023/2026", org: "Prefeitura de Itapevi/SP", agente: "Score",
    acao: "Mover para Descartadas", por: "Score 34 de 100, abaixo do corte de 50", quando: "hoje, 14:22" },
  { id: "a3", lic: "PE 90112/2026", org: "Tribunal Regional Federal da 4ª Região", agente: "Análise técnica",
    acao: "Marcar Michele como responsável", por: "Órgão federal com objeto de design, faixa dela", quando: "hoje, 11:08" },
  { id: "a4", lic: "PE 00471/2026", org: "Prefeitura de Contagem/MG", agente: "Análise técnica",
    acao: "Consultar o catálogo do fabricante", por: "Componente sem especificação equivalente no catálogo interno", quando: "ontem, 17:40" },
  { id: "a5", lic: "PE 00088/2026", org: "Secretaria de Educação do RS", agente: "Score",
    acao: "Mover para Em análise", por: "Score 81 de 100, acima do corte", quando: "ontem, 17:40" },
]

/* ------------------------------------------------------------------ */
/* Criar agente: modelos                                               */
/* ------------------------------------------------------------------ */

/*
  Templates de cadastro (Alice, 09/09, 21:24), no formato das Tarefas agendadas do
  Claude: uma opção de criar do zero mais uma galeria de modelos. O formato de
  preenchimento muda com o template: para o Score, uma lista de variáveis e pontos
  vale mais que conversar. Títulos e descrições em lorem ipsum de propósito: o
  catálogo ainda vai ser definido, e nome de exemplo vira decisão tomada na cabeça de
  quem lê. O que é real em cada card é o formato de preenchimento.
*/
export const FORMATOS = {
  score: { t: "Lista de variáveis e pontos", gatilho: "recomendadas" as Momento, onde: "score" },
  texto: { t: "Instrução em texto", gatilho: "analise" as Momento, onde: "tecnica" },
}
export type FormatoModelo = keyof typeof FORMATOS

export const MODELOS: { id: string; formato: FormatoModelo; nome: string; sub: string }[] = [
  { id: "t1", formato: "score", nome: "Lorem ipsum dolor sit", sub: "Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore." },
  { id: "t2", formato: "texto", nome: "Ut enim ad minim veniam", sub: "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo." },
  { id: "t3", formato: "score", nome: "Duis aute irure dolor", sub: "In reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla." },
  { id: "t4", formato: "texto", nome: "Excepteur sint occaecat", sub: "Cupidatat non proident, sunt in culpa qui officia deserunt mollit anim." },
  { id: "t5", formato: "score", nome: "Sed ut perspiciatis unde", sub: "Omnis iste natus error sit voluptatem accusantium doloremque laudantium." },
  { id: "t6", formato: "texto", nome: "Nemo enim ipsam voluptatem", sub: "Quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur." },
]

/* ------------------------------------------------------------------ */
/* Licitações                                                          */
/* ------------------------------------------------------------------ */

/** Estados possíveis de uma funcionalidade na licitação. */
export type EstadoFn = "pronto" | "aguardando" | "preparando" | "sem-agente" | "desativado" | "falhou" | "indisponivel"
export type ChaveFn = "score" | "checklist" | "tecnica" | "habil"

/* As quatro funcionalidades da simulação: cada uma mostra o estado do agente que a alimenta. */
export const FUNCS: Record<ChaveFn, { nome: string; art: string; agente: string }> = {
  score: { nome: "Score", art: "O", agente: "score" },
  checklist: { nome: "Checklist", art: "O", agente: "checklist" },
  tecnica: { nome: "Análise técnica", art: "A", agente: "tecnica" },
  habil: { nome: "Habilitação", art: "A", agente: "habil" },
}

/* O momento é do agente, mas cada card simula uma configuração diferente. */
export const MOMENTO_PADRAO: Record<ChaveFn, Momento> = {
  score: "recomendadas", checklist: "analise", tecnica: "analise", habil: "analise",
}

/* Cada resultado fica pronto no seu tempo, de propósito, para aparecerem um de cada vez. */
export const PREP_TEMPO: Partial<Record<ChaveFn, number>> = { score: 2000, checklist: 4000, tecnica: 8000 }

export type ItemDaLicitacao = { nome: string; seg: string; qtd: string; vu: string; vt: string }
export type StatusItem = "ok" | "no" | "na"

export type Licitacao = {
  n: string
  cenario: string
  /** Só este card oferece o menu de cenários. */
  simulador?: boolean
  org: string
  objeto: string
  segs: string[]
  valor: string
  adicionada: string
  atualizada: string
  envio: string
  id: string
  uasg: string
  modalidade: string
  julgamento: string
  estado: string
  cidade: string
  habitantes: string
  capagE: string
  capagM: string
  portal: string
  score: number
  fx: Record<ChaveFn, EstadoFn>
  mom?: Partial<Record<ChaveFn, Momento>>
  /** Agentes que não entregam na primeira tentativa (cenário de falha). */
  falhar?: ChaveFn[]
  itens: ItemDaLicitacao[]
  tecnica: { st: StatusItem; nome: string; det: string }[]
  /** Enviada para análise: sai de Recomendadas. */
  enviada?: boolean
  /** Funcionalidades que começam a preparar quando a pessoa entra na licitação. */
  aPreparar?: ChaveFn[] | null
}

/*
  Três cenários lado a lado, para o time ver os estados sem esperar o evento que os
  produz. O resultado do agente não entra no card: a menção da Alice em 03/09 (11:09)
  foi um exemplo de contexto possível, não uma decisão, e o lugar do resultado é o
  widget dentro da licitação.
*/
export const LICITACOES_INICIAIS: Licitacao[] = [
  { n: "90014/2026", cenario: "Simulador", simulador: true,
    org: "SECRETARIA DE ESTADO DE SAÚDE DE MINAS GERAIS",
    objeto: "Contratação de empresa especializada na prestação de serviços de design de produto digital, " +
      "compreendendo pesquisa com usuários, arquitetura de informação, design de interface e manutenção " +
      "de design system, para os canais digitais da Secretaria, pelo período de 24 meses.",
    segs: ["Design de produto", "Pesquisa com usuários"], valor: "2.480.000,00",
    adicionada: "04/08/2026", atualizada: "26/08/2026", envio: "11/09/2026",
    id: "1078513", uasg: "986531", modalidade: "Pregão · Eletrônico", julgamento: "Menor preço por item",
    estado: "MG", cidade: "Belo Horizonte", habitantes: "2.315.560", capagE: "B", capagM: "C",
    portal: "compras.mg.gov.br", score: 78,
    fx: { score: "pronto", checklist: "aguardando", tecnica: "aguardando", habil: "pronto" },
    itens: [
      { nome: "Design de interface: telas de novos fluxos, com protótipo navegável", seg: "Design de produto", qtd: "1.200 h", vu: "R$ 190,00", vt: "R$ 228.000,00" },
      { nome: "Pesquisa com usuários: entrevistas, testes de usabilidade e relatório", seg: "Pesquisa com usuários", qtd: "480 h", vu: "R$ 210,00", vt: "R$ 100.800,00" },
      { nome: "Design system: componentes, documentação e manutenção evolutiva", seg: "Design de produto", qtd: "640 h", vu: "R$ 205,00", vt: "R$ 131.200,00" },
    ],
    tecnica: [
      { st: "ok", nome: "Item 1 · Design de interface", det: "8 de 8 especificações atendidas · 3 perfis do catálogo comparados" },
      { st: "no", nome: "Item 2 · Pesquisa com usuários", det: "4 de 5 · exige laboratório de testes presencial, e o nosso catálogo é remoto" },
      { st: "ok", nome: "Item 3 · Design system", det: "2 de 2 especificações atendidas" },
    ] },

  /* Aqui os dois agentes rodam no envio para análise, e nada foi preparado ainda: é o
     card do fluxo completo, do envio até o resultado dentro da licitação. Sem
     Checklist: na plataforma ele e o Score não convivem no mesmo card. Indisponível é
     o estado em que a funcionalidade não existe para a conta, e não aparece. */
  { n: "00312/2026", cenario: "Todos os agentes rodam no envio para análise",
    org: "TRIBUNAL DE JUSTIÇA DO ESTADO DE SANTA CATARINA",
    objeto: "Contratação de empresa especializada em design de produto digital para a reformulação dos " +
      "canais de atendimento ao cidadão, compreendendo pesquisa, arquitetura de informação, design de " +
      "interface e testes de usabilidade, pelo período de 18 meses.",
    segs: ["Design de produto"], valor: "1.140.000,00",
    adicionada: "08/09/2026", atualizada: "10/09/2026", envio: "29/09/2026",
    id: "1086742", uasg: "925031", modalidade: "Pregão · Eletrônico", julgamento: "Técnica e preço",
    estado: "SC", cidade: "Florianópolis", habitantes: "537.211", capagE: "A", capagM: "B",
    portal: "compras.gov.br", score: 64,
    fx: { score: "aguardando", checklist: "indisponivel", tecnica: "aguardando", habil: "pronto" },
    mom: { score: "analise", tecnica: "analise" },
    itens: [
      { nome: "Pesquisa com usuários e arquitetura de informação", seg: "Design de produto", qtd: "520 h", vu: "R$ 200,00", vt: "R$ 104.000,00" },
      { nome: "Design de interface dos canais de atendimento", seg: "Design de produto", qtd: "980 h", vu: "R$ 195,00", vt: "R$ 191.100,00" },
    ],
    tecnica: [
      { st: "ok", nome: "Item 1 · Pesquisa e arquitetura", det: "5 de 5 especificações atendidas" },
      { st: "ok", nome: "Item 2 · Design de interface", det: "7 de 7 especificações atendidas" },
    ] },

  /* Os dois agentes rodam no envio e um deles não entrega: serve para ver a conclusão
     parcial no card e o caminho de volta dentro da funcionalidade. */
  { n: "00758/2026", cenario: "Um dos itens deu erro no processamento",
    org: "PREFEITURA MUNICIPAL DE JOINVILLE - SECRETARIA DE ADMINISTRAÇÃO",
    objeto: "Contratação de empresa especializada em design de produto digital para a evolução do " +
      "aplicativo de serviços ao cidadão, compreendendo pesquisa, design de interface e " +
      "manutenção de design system, pelo período de 12 meses.",
    segs: ["Design de produto", "Design system"], valor: "860.000,00",
    adicionada: "09/09/2026", atualizada: "10/09/2026", envio: "02/10/2026",
    id: "1087915", uasg: "–", modalidade: "Pregão · Eletrônico", julgamento: "Menor preço global",
    estado: "SC", cidade: "Joinville", habitantes: "616.317", capagE: "A", capagM: "B",
    portal: "compras.gov.br", score: 71,
    fx: { score: "aguardando", checklist: "indisponivel", tecnica: "aguardando", habil: "pronto" },
    mom: { score: "analise", tecnica: "analise" },
    falhar: ["tecnica"],
    itens: [
      { nome: "Evolução do aplicativo de serviços ao cidadão", seg: "Design de produto", qtd: "760 h", vu: "R$ 195,00", vt: "R$ 148.200,00" },
      { nome: "Manutenção do design system", seg: "Design system", qtd: "420 h", vu: "R$ 205,00", vt: "R$ 86.100,00" },
    ],
    tecnica: [
      { st: "ok", nome: "Item 1 · Evolução do aplicativo", det: "6 de 6 especificações atendidas" },
      { st: "ok", nome: "Item 2 · Manutenção do design system", det: "3 de 3 especificações atendidas" },
    ] },
]

/* ------------------------------------------------------------------ */
/* Resultados dos agentes                                              */
/* ------------------------------------------------------------------ */

/*
  Caso 1 do teste: o Score é um botão na barra de ações e abre um painel lateral com a
  nota e as variáveis que a compõem, como na plataforma.
*/
export const SCORE_VARS: { q: string; v: string; pt: string; st: StatusItem }[] = [
  { q: "Quantos segmentos em comum com o nosso catálogo?", v: "2 segmentos: design de produto, pesquisa com usuários", pt: "+20", st: "ok" },
  { q: "Qual o valor estimado da licitação?", v: "R$ 2.480.000,00", pt: "+10", st: "ok" },
  { q: "Exige atestado de capacidade técnica?", v: "Não encontrado", pt: "+15", st: "ok" },
  { q: "Qual a saúde financeira do órgão?", v: "CAPAG B, esfera estadual", pt: "+10", st: "ok" },
  { q: "Quantos dias até a sessão pública?", v: "9 dias", pt: "+8", st: "ok" },
  { q: "Permite subcontratação?", v: "Não permite", pt: "0", st: "no" },
  { q: "É exclusiva para ME/EPP?", v: "Ampla concorrência", pt: "0", st: "no" },
  { q: "Qual o porte do projeto?", v: "2.840 horas", pt: "+10", st: "ok" },
]

/* O Checklist como na plataforma: seções recolhíveis, pergunta em cima e o que foi extraído embaixo. */
export const CHECKLIST: { s: string; itens: { q: string; v: string }[] }[] = [
  { s: "Variáveis para cálculo do Score", itens: [
    { q: "Quantos segmentos em comum com o nosso catálogo?", v: "2 segmentos: design de produto, pesquisa com usuários" },
    { q: "Qual o valor estimado da licitação?", v: "R$ 2.480.000,00" },
    { q: "Exige atestado de capacidade técnica?", v: "Não encontrado" },
    { q: "Qual a saúde financeira do órgão?", v: "CAPAG B, esfera estadual" },
    { q: "Permite subcontratação?", v: "Não permite" },
    { q: "É exclusiva para ME/EPP?", v: "Ampla concorrência" } ] },
  { s: "Dados básicos", itens: [
    { q: "Portal de disputa", v: "compras.mg.gov.br" },
    { q: "Legislação", v: "Lei nº 14.133, de 2021" },
    { q: "Ata de registro de preços?", v: "Não" },
    { q: "Modalidade e julgamento", v: "Pregão eletrônico, menor preço por item" } ] },
  { s: "Condições de participação", itens: [
    { q: "Permite consórcio?", v: "Não" },
    { q: "Permite subcontratação?", v: "Não" },
    { q: "Garantia contratual?", v: "5% do valor do contrato" } ] },
  { s: "Prazos", itens: [
    { q: "Sessão pública", v: "18/09/2026 09:00" },
    { q: "Envio da proposta", v: "11/09/2026" },
    { q: "Impugnação", v: "até 3 dias úteis antes da abertura" },
    { q: "Questionamentos", v: "Não encontrado" } ] },
  { s: "Modelo de execução", itens: [
    { q: "Vigência do contrato", v: "24 meses, prorrogáveis" },
    { q: "Condições de pagamento", v: "30 dias após o aceite da entrega mensal" },
    { q: "Local da prestação dos serviços", v: "remoto, com reuniões em Belo Horizonte" } ] },
  { s: "Habilitação", itens: [
    { q: "Exige certificação técnica?", v: "Sim: atestado de acervo técnico registrado" },
    { q: "Exige índices de liquidez específicos?", v: "LG > 1 / LC > 1 / SG > 1" },
    { q: "Amostra e vistoria", v: "Não exige" } ] },
]

export type LinhaDeResultado = { st: StatusItem; doc: string; nosso: string }

/* O corpo de cada widget depende do agente: o resultado é montado conforme o que ele produz (Alice, 09/09, 14:08). */
export const RESULTADOS: Record<string, { itens: LinhaDeResultado[]; por: string }> = {
  /* Caso 2 do teste: habilitação por atestados, na aba que o agente escolheu. */
  habil: {
    itens: [
      { st: "ok", doc: "Atestado de capacidade técnica em design de produto digital", nosso: "3 atestados somam 2.100 h, acima do mínimo de 1.500 h" },
      { st: "ok", doc: "Certidão negativa de débitos federais", nosso: "válida até 14/10/2026" },
      { st: "ok", doc: "Balanço patrimonial do último exercício", nosso: "2025, com índice de liquidez 1,8" },
      { st: "no", doc: "Atestado com equipe alocada presencialmente", nosso: "nossos atestados são de trabalho remoto" },
      { st: "na", doc: "Registro em conselho profissional", nosso: "o edital não diz qual conselho, e design não tem registro obrigatório" },
    ],
    por: "3 de 5 exigências atendidas. 1 não atende e 1 não foi avaliada, porque o edital não diz qual conselho profissional.",
  },
  certidoes: {
    itens: [
      { st: "no", doc: "Regularidade do FGTS", nosso: "vence em 12/09, seis dias antes da sessão" },
      { st: "ok", doc: "Débitos federais e dívida ativa", nosso: "válida até 14/10/2026" },
      { st: "ok", doc: "Débitos trabalhistas (CNDT)", nosso: "válida até 03/11/2026" },
      { st: "ok", doc: "Regularidade municipal", nosso: "válida até 28/09/2026" },
    ],
    por: "A sessão é em 18/09. A certidão de regularidade do FGTS vence em 12/09, seis dias antes.",
  },
  tecnica: {
    itens: [
      { st: "ok", doc: "Item 1 · Design de interface", nosso: "8 de 8 componentes atendidos" },
      { st: "no", doc: "Item 2 · Pesquisa com usuários", nosso: "4 de 5: falta laboratório de testes presencial" },
      { st: "ok", doc: "Item 3 · Design system", nosso: "2 de 2 componentes atendidos" },
    ],
    por: "A comparação por componente está na tabela abaixo. O item 2 é o único que não fecha: o edital exige laboratório presencial e o nosso catálogo é remoto.",
  },
}

/*
  Os cenários que o menu oferece: os estados possíveis de qualquer funcionalidade,
  para mostrar cada um sem ter que esperar o evento que o produz.
*/
export const CENARIOS: { id: EstadoFn; t: string; d: string }[] = [
  { id: "pronto", t: "Resultado disponível", d: "o agente já rodou e o resultado está aqui" },
  { id: "aguardando", t: "Aguardando o momento", d: "o agente existe, mas o evento ainda não aconteceu" },
  { id: "preparando", t: "Preparando o resultado", d: "o agente está rodando agora" },
  { id: "sem-agente", t: "Agente não configurado", d: "a funcionalidade existe, mas ninguém criou o agente dela" },
  { id: "desativado", t: "Agente desativado", d: "o agente existe e está desligado" },
  { id: "falhou", t: "Não foi possível carregar", d: "o agente rodou e não entregou o resultado" },
]

export const DICA_ESTADO: Partial<Record<EstadoFn, string>> = {
  pronto: "Resultado disponível",
  preparando: "Estamos preparando este resultado",
  "sem-agente": "Nenhum agente configurado",
  desativado: "O agente desta funcionalidade está desativado",
  falhou: "Não foi possível carregar este resultado",
}

/* ------------------------------------------------------------------ */
/* Settle AI                                                           */
/* ------------------------------------------------------------------ */

export type TipoContexto = "pagina" | "licitacao" | "documento" | "area"
export type Contexto = { id: string; nome: string; tipo: TipoContexto; auto?: boolean }
export type OpcaoDeContexto = { id: string; nome: string; tipo?: TipoContexto; sub?: string; quando?: string }

/* O acervo tem centenas de licitações: a lista entra por rolagem, em lotes. */
export const LICITACOES_DO_ACERVO: OpcaoDeContexto[] = [
  { id: "l471", nome: "PE 00471/2026", tipo: "licitacao", sub: "Prefeitura de Contagem/MG · design de produto", quando: "ontem" },
  { id: "l23", nome: "PE 00023/2026", sub: "Prefeitura de Itapevi/SP · identidade visual", quando: "há 2 dias" },
  { id: "l88", nome: "PE 00088/2026", sub: "Secretaria de Educação do RS · pesquisa com usuários", quando: "há 3 dias" },
  { id: "l112", nome: "PE 90112/2026", tipo: "licitacao", sub: "Tribunal Regional Federal da 4ª Região · design system" },
  { id: "l205", nome: "PE 00205/2026", tipo: "licitacao", sub: "Prefeitura de Joinville/SC · redesenho de portal" },
  { id: "l331", nome: "CC 00331/2026", tipo: "licitacao", sub: "Universidade Federal do Paraná · acessibilidade digital" },
  { id: "l402", nome: "PE 00402/2026", tipo: "licitacao", sub: "Companhia de Saneamento do PR · design de serviço" },
  { id: "l517", nome: "PE 00517/2026", tipo: "licitacao", sub: "Secretaria de Fazenda de SC · pesquisa com usuários" },
  { id: "l660", nome: "PE 00660/2026", tipo: "licitacao", sub: "Prefeitura de Niterói/RJ · design system e componentes" },
  { id: "l781", nome: "CC 00781/2026", tipo: "licitacao", sub: "Ministério da Gestão · consultoria em design de produto" },
  { id: "l844", nome: "PE 00844/2026", tipo: "licitacao", sub: "Banco de Desenvolvimento de MG · identidade visual" },
  { id: "l905", nome: "PE 00905/2026", tipo: "licitacao", sub: "Tribunal de Contas do RS · redesenho de portal" },
]

export const GRUPOS_DE_CONTEXTO: { grupo: string; itens: OpcaoDeContexto[] }[] = [
  { grupo: "Desta licitação", itens: [
    { id: "lic", nome: "PE 90014/2026", tipo: "licitacao", sub: "Secretaria de Estado de Saúde de MG" },
    { id: "edital", nome: "Edital e anexos", tipo: "documento", sub: "12 arquivos" },
    { id: "tr", nome: "Termo de Referência", tipo: "documento", sub: "anexo I" },
    { id: "contrato", nome: "Minuta do contrato", tipo: "documento", sub: "anexo V" } ] },
  { grupo: "Da B Design", itens: [
    { id: "catalogo", nome: "Catálogo de serviços", tipo: "documento", sub: "design de produto, pesquisa, design system" },
    { id: "atestados", nome: "Atestados de capacidade técnica", tipo: "documento", sub: "9 documentos" } ] },
  { grupo: "Na plataforma", itens: [
    { id: "agentes", nome: "Agentes e Variáveis", tipo: "area", sub: "6 agentes, 14 variáveis" } ] },
]

/* Uma lista só: onde a Settle AI pode procurar. As conexões são as fontes que ainda precisam ser ligadas. */
export type FonteIA = { nome: string; sub?: string; on: boolean; mestre?: boolean; conexao?: string }
export const FONTES_IA_INICIAIS: FonteIA[] = [
  { nome: "Todas as fontes que posso acessar", on: true, mestre: true },
  { nome: "Licitações recomendadas", sub: "as que a Settle seleciona para a B Design", on: true },
  { nome: "Arquivos da empresa", sub: "catálogo, atestados e propostas anteriores", on: true },
  { nome: "Portais públicos", sub: "PNCP e diários oficiais", on: true },
  { nome: "Acesso à web", sub: "sites fora da plataforma", on: false },
]
export type Conexao = { nome: string; sub: string; on: boolean }
export const CONEXOES_INICIAIS: Conexao[] = [
  { nome: "Google Drive", sub: "pastas compartilhadas da empresa", on: false },
  { nome: "ERP", sub: "contratos assinados e faturamento", on: false },
  { nome: "E-mail", sub: "avisos e respostas dos órgãos", on: false },
]

/* A lista de agentes do chat, agrupada: os que rodam na página em que a pessoa está vêm primeiro. */
export const AGENTES_DA_PAGINA: Record<string, string[]> = { lic: ["score", "habil", "tecnica"], agentes: [] }

/** O texto do chat que ainda não tem resposta definida. */
export const RESPOSTA_A_DEFINIR = "Ainda precisamos pensar no que aparece por aqui."
