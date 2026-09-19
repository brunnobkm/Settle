// Conteúdo do Resumo extraído do edital (JetBrains All Products Pack, TRF6): objeto, seções
// com divergências (a mesma informação em documentos diferentes) e informações, alvos de origem
// nos arquivos da licitação, texto de "Copiar conteúdo" e histórico de divergências de exemplo.

import type { DocKey } from "./documentos"

export type Opcao = { texto: string; fonte: string }
export type DivergenciaBase = { id: string; rotulo: string; aberta?: boolean; opcoes: Opcao[] }
export type LinhaBase = { id: string; rotulo: string; valor: string }
export type Secao = {
  id: string
  titulo: string
  aberta?: boolean
  divergencias: DivergenciaBase[]
  linhas: LinhaBase[]
}

export const OBJETO =
  "Aquisição de licenças de software JetBrains All Products Pack, incluindo atualização e suporte técnico por 36 meses."

export const SECOES: Secao[] = [
  {
    id: "prazos",
    titulo: "Prazos e implantação",
    divergencias: [
      {
        id: "prazo-entrega",
        rotulo: "Prazo de entrega",
        opcoes: [
          {
            texto: "Entrega e conclusão dos serviços em até 30 dias corridos.",
            fonte: "Fonte: Termo de Referência, item 5.2.4.1",
          },
          {
            texto: "Recebimento definitivo em até 10 dias corridos após o recebimento provisório.",
            fonte: "Fonte: Termo de Referência, item 6.1.3",
          },
        ],
      },
    ],
    linhas: [
      {
        id: "prazos-regime",
        rotulo: "Regime de Execução",
        valor: "Empreitada por preço global, com execução por preço certo e total.",
      },
      { id: "prazos-criterio", rotulo: "Critério de Julgamento", valor: "Menor preço global." },
      {
        id: "prazos-escopo",
        rotulo: "Escopo principal",
        valor: "Licenças JetBrains, atualização e suporte técnico por 36 meses.",
      },
    ],
  },
  {
    id: "licencas",
    titulo: "Licenças e vigência",
    aberta: true,
    divergencias: [
      {
        id: "quantidade",
        rotulo: "Quantidade de licenças",
        aberta: true,
        opcoes: [
          {
            texto: "20 licenças de direito de uso do JetBrains All Products Pack.",
            fonte: "Fonte: Termo de Referência, item 5.2.1",
          },
          {
            texto: "20 unidades de subscrição por 36 meses.",
            fonte: "Fonte: Termo de Referência, tabela do item 1.1",
          },
        ],
      },
      {
        id: "vigencia-subscricao",
        rotulo: "Vigência da subscrição",
        opcoes: [
          {
            texto: "36 meses contados do recebimento definitivo das licenças.",
            fonte: "Fonte: Termo de Referência, item 1.2",
          },
          {
            texto: "36 meses contados da assinatura do contrato.",
            fonte: "Fonte: Minuta de Contrato, cláusula décima quinta",
          },
        ],
      },
    ],
    linhas: [
      {
        id: "licencas-regime",
        rotulo: "Regime de Execução",
        valor: "Fornecimento de licenças com suporte técnico oficial.",
      },
      { id: "licencas-criterio", rotulo: "Critério de Julgamento", valor: "Menor preço global." },
      {
        id: "licencas-vigencia",
        rotulo: "Vigência",
        valor: "36 meses, contados do recebimento definitivo das licenças.",
      },
    ],
  },
  {
    id: "objeto",
    titulo: "Objeto e escopo",
    divergencias: [],
    linhas: [
      {
        id: "objeto-tipo",
        rotulo: "Tipo de solução",
        valor: "Subscrição de software para desenvolvimento, banco de dados e produtividade técnica.",
      },
      {
        id: "objeto-ferramentas",
        rotulo: "Ferramentas incluídas",
        valor: "IntelliJ IDEA, WebStorm, Rider, PyCharm, CLion, PhpStorm, DataGrip e GoLand.",
      },
      {
        id: "objeto-finalidade",
        rotulo: "Finalidade",
        valor: "Apoiar equipes de desenvolvimento em Java, PHP, bancos de dados e aplicações institucionais.",
      },
    ],
  },
  {
    id: "requisitos",
    titulo: "Requisitos técnicos",
    divergencias: [],
    linhas: [
      {
        id: "requisitos-entrega",
        rotulo: "Entrega",
        valor: "Disponibilização das licenças e ativação da subscrição em até 30 dias corridos.",
      },
      {
        id: "requisitos-atualizacao",
        rotulo: "Atualização",
        valor: "Atualizações do fabricante durante todo o período de vigência da subscrição.",
      },
      {
        id: "requisitos-suporte",
        rotulo: "Suporte técnico",
        valor: "Suporte técnico oficial pelo período de 36 meses.",
      },
    ],
  },
  {
    id: "seguranca",
    titulo: "Segurança e conformidade",
    divergencias: [],
    linhas: [
      {
        id: "seguranca-dados",
        rotulo: "Dados pessoais",
        valor: "Baixo tratamento de dados pessoais, restrito à relação contratual e à gestão das licenças.",
      },
      {
        id: "seguranca-conformidade",
        rotulo: "Conformidade",
        valor: "Observância às normas de proteção de dados e segurança da informação aplicáveis ao contrato.",
      },
      {
        id: "seguranca-sustentabilidade",
        rotulo: "Sustentabilidade",
        valor: "Aplicação das diretrizes de sustentabilidade quando compatíveis com o fornecimento de software.",
      },
    ],
  },
  {
    id: "suporte",
    titulo: "Suporte e SLA",
    divergencias: [],
    linhas: [
      {
        id: "suporte-atendimento",
        rotulo: "Atendimento",
        valor: "Suporte técnico oficial do fabricante durante a vigência da subscrição.",
      },
      {
        id: "suporte-atualizacoes",
        rotulo: "Atualizações",
        valor: "Direito a atualizações do software pelo período de 36 meses.",
      },
      {
        id: "suporte-garantia",
        rotulo: "Garantia",
        valor: "Correção de vícios, defeitos ou incorreções nos serviços de instalação, quando aplicável.",
      },
    ],
  },
  {
    id: "comerciais",
    titulo: "Condições comerciais",
    divergencias: [],
    linhas: [
      {
        id: "comerciais-vigencia",
        rotulo: "Vigência",
        valor: "36 meses, prorrogável nos termos da Lei nº 14.133/2021.",
      },
      {
        id: "comerciais-pagamento",
        rotulo: "Pagamento",
        valor: "Após recebimento definitivo, liquidação da despesa e emissão da nota fiscal.",
      },
      {
        id: "comerciais-valor",
        rotulo: "Valor estimado",
        valor: "R$ 261.698,13 para a subscrição de 36 meses.",
      },
    ],
  },
  {
    id: "julgamento",
    titulo: "Critérios de julgamento",
    divergencias: [],
    linhas: [
      {
        id: "julgamento-disputa",
        rotulo: "Modelo de disputa",
        valor: "Pregão eletrônico, com etapa de lances no Compras.gov.br.",
      },
      {
        id: "julgamento-julgamento",
        rotulo: "Julgamento",
        valor: "Menor preço global, observada a conformidade da proposta com o edital.",
      },
      {
        id: "julgamento-negociacao",
        rotulo: "Negociação",
        valor: "Possibilidade de negociação com a licitante melhor classificada após a fase de lances.",
      },
    ],
  },
  {
    id: "habilitacao",
    titulo: "Documentos de habilitação",
    divergencias: [],
    linhas: [
      {
        id: "habilitacao-tecnica",
        rotulo: "Qualificação técnica",
        valor: "Comprovação compatível com fornecimento de licenças e suporte técnico de software.",
      },
      {
        id: "habilitacao-fiscal",
        rotulo: "Regularidade fiscal",
        valor: "Certidões fiscais federais, estaduais, municipais, FGTS e trabalhista.",
      },
      {
        id: "habilitacao-declaracoes",
        rotulo: "Declarações",
        valor: "Inexistência de impedimentos para licitar e cumprimento das exigências legais.",
      },
    ],
  },
  {
    id: "entregaveis",
    titulo: "Entregáveis e aceite",
    divergencias: [],
    linhas: [
      {
        id: "entregaveis-ordem",
        rotulo: "Ordem de fornecimento",
        valor: "Entrega contada a partir do recebimento da ordem de fornecimento ou serviço.",
      },
      {
        id: "entregaveis-provisorio",
        rotulo: "Recebimento provisório",
        valor: "Até 5 dias corridos após a conclusão dos serviços.",
      },
      {
        id: "entregaveis-definitivo",
        rotulo: "Recebimento definitivo",
        valor: "Até 10 dias corridos após o recebimento provisório.",
      },
    ],
  },
]

/** Trecho de origem de cada informação, pelo rótulo. */
export const ALVOS_DE_ORIGEM: { rotulo: string; documento: DocKey; texto: string }[] = [
  {
    rotulo: "Regime de Execução",
    documento: "termo",
    texto: "Regime de execução: empreitada por preço global, com contratação da execução do serviço por preço certo e total.",
  },
  { rotulo: "Critério de Julgamento", documento: "edital", texto: "O critério de julgamento adotado será o menor preço global" },
  {
    rotulo: "Escopo principal",
    documento: "edital",
    texto: "aquisição de licenças de software JetBrains All Products Pack, incluindo atualização e serviço de suporte técnico por 36 meses",
  },
  { rotulo: "Quantidade de licenças", documento: "termo", texto: "Quantidade: 20" },
  {
    rotulo: "Vigência",
    documento: "termo",
    texto: "O prazo de vigência da contratação é de 3 anos contados do termo de recebimento definitivo das licenças",
  },
  { rotulo: "Tipo de solução", documento: "etp", texto: "subscrição do pacote All Products Pack" },
  {
    rotulo: "Ferramentas incluídas",
    documento: "termo",
    texto: "IntelliJ IDEA, WebStorm, Rider, PyCharm, CLion, PhpStorm, DataGrip, AppCode, GoLand, RubyMine",
  },
  {
    rotulo: "Finalidade",
    documento: "contrato",
    texto: "Proporcionar ganho de tempo e maior agilidade no desenvolvimento de aplicações",
  },
  {
    rotulo: "Entrega",
    documento: "termo",
    texto: "Prazo máximo para entrega e conclusão dos serviços de instalação e configuração: até 30 dias corridos",
  },
  {
    rotulo: "Prazo de entrega",
    documento: "termo",
    texto: "Prazo máximo para entrega e conclusão dos serviços de instalação e configuração: até 30 dias corridos",
  },
  { rotulo: "Atualização", documento: "termo", texto: "garantia de atualização pela contratada durante o período de 36 meses" },
  { rotulo: "Suporte técnico", documento: "termo", texto: "serviço de suporte técnico pelo mesmo período" },
  { rotulo: "Valor estimado", documento: "termo", texto: "R$ 261.698,13" },
  {
    rotulo: "Pagamento",
    documento: "contrato",
    texto: "A emissão da nota fiscal será precedida do recebimento definitivo do objeto",
  },
  { rotulo: "Recebimento provisório", documento: "termo", texto: "O recebimento provisório ocorrerá em até 5 dias corridos" },
  {
    rotulo: "Recebimento definitivo",
    documento: "termo",
    texto: "O recebimento definitivo ocorrerá em até 10 dias corridos após o recebimento provisório",
  },
]

/** Primeira linha útil do texto (mais de 24 caracteres), com até 140 caracteres, para procurar no documento. */
export function textoDeBusca(texto: string) {
  const linha = texto
    .split(/\n+/)
    .map((l) => l.replace(/\s+/g, " ").trim())
    .find((l) => l.length > 24)
  return (linha || texto.replace(/\s+/g, " ").trim()).slice(0, 140)
}

/** Onde está, nos arquivos, o trecho de uma opção de divergência. */
export function alvoDaOpcao(opcao: Opcao): { documento: DocKey; texto: string } {
  const t = opcao.texto
  if (t.includes("Entrega e conclusão")) {
    return {
      documento: "termo",
      texto: "Prazo máximo para entrega e conclusão dos serviços de instalação e configuração: até 30 dias corridos",
    }
  }
  if (t.includes("Recebimento definitivo")) {
    return {
      documento: "termo",
      texto: "O recebimento definitivo ocorrerá em até 10 dias corridos após o recebimento provisório",
    }
  }
  if (t.includes("20 licenças de direito")) {
    return {
      documento: "termo",
      texto: "20 licenças de direito de uso de programa de computador JetBrains All Products Pack",
    }
  }
  if (t.includes("20 unidades de subscrição")) {
    return {
      documento: "termo",
      texto: "Item 1: Software All Products Pack - subscrição de 36 meses. CATMAT 27502. Unidade de medida: unidade. Quantidade: 20.",
    }
  }
  return { documento: opcao.fonte.includes("Termo") ? "termo" : "edital", texto: textoDeBusca(t) }
}

/** Texto de "Copiar conteúdo". */
export const TEXTO_COPIA_RESUMO = [
  "Resumo",
  "",
  "Objeto: Aquisição de licenças de software JetBrains All Products Pack, incluindo atualização e suporte técnico por 36 meses.",
  "",
  "Prazos e implantação",
  "  Prazo de entrega: 30 dias corridos | recebimento definitivo em até 10 dias corridos",
  "  Regime de Execução: Empreitada por preço global.",
  "  Critério de Julgamento: Menor preço global.",
  "  Escopo principal: Licenças JetBrains, atualização e suporte técnico por 36 meses.",
  "",
  "Licenças e vigência",
  "  Quantidade de licenças: 20 licenças de direito de uso | 20 unidades de subscrição por 36 meses",
  "  Regime de Execução: Fornecimento de licenças com suporte técnico oficial.",
  "  Critério de Julgamento: Menor preço global.",
  "  Vigência: 36 meses, contados do recebimento definitivo das licenças.",
  "",
  "Objeto e escopo",
  "  Tipo de solução: Subscrição de software para desenvolvimento, banco de dados e produtividade técnica.",
  "  Ferramentas incluídas: IntelliJ IDEA, WebStorm, Rider, PyCharm, CLion, PhpStorm, DataGrip e GoLand.",
  "  Finalidade: Apoiar equipes de desenvolvimento em Java, PHP, bancos de dados e aplicações institucionais.",
  "",
  "Requisitos técnicos",
  "  Entrega: Disponibilização das licenças e ativação da subscrição em até 30 dias corridos.",
  "  Atualização: Atualizações do fabricante durante todo o período de vigência da subscrição.",
  "  Suporte técnico: Suporte técnico oficial pelo período de 36 meses.",
  "",
  "Segurança e conformidade",
  "  Dados pessoais: Baixo tratamento de dados pessoais, restrito à relação contratual e à gestão das licenças.",
  "  Conformidade: Observância às normas de proteção de dados e segurança da informação aplicáveis ao contrato.",
  "  Sustentabilidade: Aplicação das diretrizes de sustentabilidade quando compatíveis com o fornecimento de software.",
  "",
  "Suporte e SLA",
  "  Atendimento: Suporte técnico oficial do fabricante durante a vigência da subscrição.",
  "  Atualizações: Direito a atualizações do software pelo período de 36 meses.",
  "  Garantia: Correção de vícios, defeitos ou incorreções nos serviços de instalação, quando aplicável.",
  "",
  "Condições comerciais",
  "  Vigência: 36 meses, prorrogável nos termos da Lei nº 14.133/2021.",
  "  Pagamento: Após recebimento definitivo, liquidação da despesa e emissão da nota fiscal.",
  "  Valor estimado: R$ 261.698,13 para a subscrição de 36 meses.",
  "",
  "Critérios de julgamento",
  "  Modelo de disputa: Pregão eletrônico, com etapa de lances no Compras.gov.br.",
  "  Julgamento: Menor preço global, observada a conformidade da proposta com o edital.",
  "  Negociação: Possibilidade de negociação com a licitante melhor classificada.",
  "",
  "Documentos de habilitação",
  "  Qualificação técnica: Comprovação compatível com fornecimento de licenças e suporte técnico de software.",
  "  Regularidade fiscal: Certidões fiscais federais, estaduais, municipais, FGTS e trabalhista.",
  "  Declarações: Inexistência de impedimentos para licitar e cumprimento das exigências legais.",
  "",
  "Entregáveis e aceite",
  "  Ordem de fornecimento: Entrega contada a partir do recebimento da ordem de fornecimento ou serviço.",
  "  Recebimento provisório: Até 5 dias corridos após a conclusão dos serviços.",
  "  Recebimento definitivo: Até 10 dias corridos após o recebimento provisório.",
].join("\n")

export type ItemDeHistorico = {
  rotulo: string
  status: "resolvida" | "pendente"
  /** manual: informação adicionada pela pessoa; escolhida: uma das opções encontradas. */
  tipo?: "escolhida" | "manual"
  escolha?: string
  opcoes: string[]
}

/** Divergências resolvidas antes (exemplo), depois das pendentes e das resolvidas agora. */
export const HISTORICO_DE_EXEMPLO: ItemDeHistorico[] = [
  {
    rotulo: "Prazo de entrega",
    status: "resolvida",
    tipo: "escolhida",
    escolha: "Entrega e conclusão dos serviços em até 30 dias corridos.",
    opcoes: [
      "Entrega e conclusão dos serviços em até 30 dias corridos.",
      "Recebimento definitivo em até 10 dias corridos após o recebimento provisório.",
    ],
  },
  {
    rotulo: "Quantidade de licenças",
    status: "resolvida",
    tipo: "escolhida",
    escolha: "20 licenças de direito de uso do JetBrains All Products Pack.",
    opcoes: ["20 licenças de direito de uso do JetBrains All Products Pack.", "20 unidades de subscrição por 36 meses."],
  },
  {
    rotulo: "Critério de julgamento",
    status: "resolvida",
    tipo: "escolhida",
    escolha: "Menor preço global.",
    opcoes: ["Menor preço global.", "Menor preço por item."],
  },
  {
    rotulo: "Vigência da contratação",
    status: "resolvida",
    tipo: "manual",
    escolha: "36 meses contados do recebimento definitivo das licenças.",
    opcoes: ["36 meses contados da assinatura do contrato.", "3 anos contados do recebimento definitivo das licenças."],
  },
  {
    rotulo: "Suporte técnico",
    status: "resolvida",
    tipo: "manual",
    escolha: "Suporte técnico oficial durante todo o período da subscrição.",
    opcoes: ["Suporte técnico pelo período de 36 meses.", "Suporte técnico conforme disponibilidade do fabricante."],
  },
]
