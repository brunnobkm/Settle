// Documentos da licitação (Edital, TR, ETP, Minuta, Proposta) usados no visualizador de
// origem. Cada página recebe parágrafos de complemento até ficar com cara de página real.

export type DocKey = "edital" | "termo" | "etp" | "contrato" | "proposta"

export const LISTA_DE_DOCUMENTOS: { value: DocKey; label: string }[] = [
  { value: "edital", label: "Edital 15/2023" },
  { value: "termo", label: "Termo de Referência" },
  { value: "etp", label: "Estudo Técnico Preliminar" },
  { value: "contrato", label: "Minuta de Contrato" },
  { value: "proposta", label: "Proposta da contratada" },
]

export const DOCUMENTOS: Record<DocKey, { label: string; pages: string[][] }> = {
  edital: {
    label: "Edital 15/2023",
    pages: [
      [
        "PODER JUDICIÁRIO. TRIBUNAL REGIONAL FEDERAL DA 6ª REGIÃO. EDITAL DO PREGÃO ELETRÔNICO Nº 15/2023.",
        "Objeto: aquisição de licenças de software JetBrains All Products Pack, incluindo atualização e serviço de suporte técnico por 36 meses, conforme condições do Edital, do Termo de Referência e de seus anexos.",
        "O certame será realizado em ambiente eletrônico, por meio do portal Compras.gov.br, observadas as regras da Lei nº 14.133/2021 e os princípios da legalidade, impessoalidade, publicidade, eficiência e julgamento objetivo.",
      ],
      [
        "A sessão pública observará a fase de apresentação de propostas, a etapa competitiva de lances, a verificação de conformidade, o julgamento, a habilitação e os procedimentos recursais previstos neste instrumento.",
        "As propostas deverão conter descrição clara do objeto, marca ou fabricante, prazo de entrega, valor unitário, valor total e declaração de que todos os custos diretos e indiretos estão incluídos no preço ofertado.",
        "O licitante é responsável por acompanhar as operações no sistema eletrônico durante todo o processo licitatório, respondendo pelos ônus decorrentes da perda de negócios diante da inobservância de mensagens emitidas pela Administração.",
      ],
      [
        "O critério de julgamento adotado será o menor preço global, considerando o valor total estimado para a contratação das licenças e serviços correlatos.",
        "A Administração poderá negociar condições mais vantajosas após o encerramento da etapa de lances, preservada a ordem de classificação e a compatibilidade da proposta com as especificações técnicas.",
        "A proposta vencedora deverá atender integralmente às exigências de compatibilidade, quantidade, vigência, atualização e suporte técnico estabelecidas no Termo de Referência.",
      ],
      [
        "A habilitação exigirá documentação jurídica, fiscal, social, trabalhista, econômico-financeira e técnica, nos termos do edital e da legislação aplicável.",
        "A ausência de documento obrigatório poderá ser saneada apenas nas hipóteses admitidas pela legislação e pelo entendimento vigente do órgão responsável pela condução do certame.",
        "A Administração consultará cadastros oficiais de sanções e impedimentos para verificar a regularidade da licitante antes da adjudicação.",
      ],
      [
        "Integram o edital, para todos os fins e efeitos, os seguintes anexos: Anexo I - Termo de Referência; Anexo II - Estudo Técnico Preliminar; Anexo III - Minuta de Contrato.",
        "Em caso de divergência entre disposições do Edital e de seus anexos ou demais peças que compõem o processo, prevalecerão as disposições do Edital.",
        "O edital e seus anexos ficam disponíveis no Portal Nacional de Contratações Públicas e no endereço eletrônico institucional do TRF6.",
      ],
      [
        "Os pedidos de esclarecimento e impugnação deverão ser enviados nos prazos previstos, por meio eletrônico, com identificação do interessado e indicação objetiva do ponto questionado.",
        "As respostas a esclarecimentos e impugnações serão divulgadas no sistema eletrônico e passarão a integrar o edital, vinculando Administração e licitantes.",
        "A participação na licitação implica aceitação plena das condições estabelecidas no edital e em seus anexos.",
      ],
      [
        "A adjudicação e a homologação do resultado não implicam direito automático à contratação, ficando a convocação condicionada ao interesse público e à disponibilidade orçamentária.",
        "O contrato observará a vigência, os prazos, as condições de recebimento, a forma de pagamento, as obrigações das partes e as sanções previstas nos anexos do edital.",
        "Os casos omissos serão resolvidos pela Administração com base na Lei nº 14.133/2021 e nas normas federais aplicáveis às contratações públicas.",
      ],
      [
        "O valor estimado da contratação considera pesquisa de preços e o custo total de propriedade do software, incluindo atualização, suporte técnico e continuidade da licença durante o período contratado.",
        "Os preços apresentados deverão permanecer válidos pelo prazo indicado no edital e serão de exclusiva responsabilidade da licitante.",
        "Não será admitida proposta com preço manifestamente inexequível ou incompatível com os valores praticados no mercado, salvo demonstração objetiva de exequibilidade.",
      ],
      [
        "A licitante vencedora deverá assinar o contrato ou retirar instrumento equivalente no prazo definido pela Administração, sob pena de aplicação das penalidades cabíveis.",
        "A recusa injustificada em assinar o contrato, a inexecução total ou parcial e o descumprimento das obrigações assumidas sujeitarão a contratada às sanções previstas no edital.",
        "O foro competente para dirimir controvérsias será o da Justiça Federal de Minas Gerais, conforme minuta contratual.",
      ],
      [
        "Documento assinado eletronicamente por autoridade competente do Tribunal Regional Federal da 6ª Região, com código verificador e código CRC disponíveis para conferência no sistema SEI.",
        "Endereço institucional: Avenida Álvares Cabral, Belo Horizonte, Minas Gerais. Informações complementares poderão ser obtidas no portal oficial do TRF6.",
        "Fim do Edital do Pregão Eletrônico nº 15/2023.",
      ],
    ],
  },
  termo: {
    label: "Termo de Referência",
    pages: [
      [
        "TERMO DE REFERÊNCIA. 1. OBJETO E CONDIÇÕES GERAIS DA CONTRATAÇÃO.",
        "Aquisição de licenças de software JetBrains All Products Pack - subscrição de 36 meses, incluindo atualização e serviço de suporte técnico pelo mesmo período.",
        "O prazo de vigência da contratação é de 3 anos contados do termo de recebimento definitivo das licenças, prorrogável na forma dos artigos 106 e 107 da Lei nº 14.133/2021.",
      ],
      [
        "Item 1: Software All Products Pack - subscrição de 36 meses. CATMAT 27502. Unidade de medida: unidade. Quantidade: 20.",
        "Valor unitário estimado: R$ 13.084,90. Valor total estimado: R$ 261.698,13.",
        "O serviço é caracterizado como comum por possuir padrões de desempenho e qualidade objetivamente definidos por especificações usuais de mercado.",
      ],
      [
        "2. FUNDAMENTAÇÃO E DESCRIÇÃO DA NECESSIDADE DA CONTRATAÇÃO.",
        "A fundamentação encontra-se detalhada no Estudo Técnico Preliminar, com indicação da necessidade de continuidade das ferramentas utilizadas pelas equipes de desenvolvimento.",
        "A solução busca preservar produtividade, padronização do ambiente de desenvolvimento e suporte às aplicações mantidas pela Secretaria de Tecnologia da Informação.",
      ],
      [
        "4. REQUISITOS DA CONTRATAÇÃO. A contratada deverá observar as diretrizes de sustentabilidade, quando aplicáveis, e fornecer as condições necessárias à execução do objeto.",
        "As licenças terão garantia de atualização pela contratada durante o período de 36 meses, contados a partir do recebimento definitivo.",
        "A Administração poderá solicitar demonstração da solução, quando necessário.",
        "A contratada deverá reparar, corrigir, remover, reconstruir ou substituir, às suas expensas, serviços em que forem verificados vícios, defeitos ou incorreções.",
      ],
      [
        "5. MODELO DE EXECUÇÃO DO OBJETO. Local de prestação: Secretaria de Tecnologia da Informação do TRF6, em Belo Horizonte, Minas Gerais.",
        "Regime de execução: empreitada por preço global, com contratação da execução do serviço por preço certo e total.",
        "Características gerais: 20 licenças de direito de uso de programa de computador JetBrains All Products Pack, contemplando IntelliJ IDEA, WebStorm, Rider, PyCharm, CLion, PhpStorm, DataGrip, AppCode, GoLand, RubyMine e demais ferramentas do pacote.",
      ],
      [
        "Prazo máximo para entrega e conclusão dos serviços de instalação e configuração: até 30 dias corridos, contados a partir do primeiro dia útil subsequente à data de recebimento da ordem de fornecimento ou serviço.",
        "Caso não seja possível cumprir a data assinalada, a contratada deverá comunicar as razões com antecedência mínima de 15 dias, para análise de eventual prorrogação.",
        "Os métodos e horários de trabalho deverão ser previamente autorizados pelo TRF6.",
      ],
      [
        "6. CRITÉRIOS DE MEDIÇÃO E PAGAMENTO. O recebimento provisório ocorrerá em até 5 dias corridos, contados da conclusão dos serviços.",
        "O recebimento definitivo ocorrerá em até 10 dias corridos após o recebimento provisório, desde que atendidas as exigências do Termo de Referência.",
        "O objeto poderá ser rejeitado, no todo ou em parte, quando estiver em desacordo com as especificações constantes do Termo de Referência e da proposta.",
      ],
      [
        "7. OBRIGAÇÕES DA CONTRATANTE. A Administração deverá acompanhar e fiscalizar a execução contratual, receber o objeto e efetuar os pagamentos devidos após a liquidação da despesa.",
        "8. OBRIGAÇÕES DA CONTRATADA. A contratada deverá entregar as licenças, manter suporte técnico, cumprir prazos e prestar informações necessárias à fiscalização.",
        "A contratada deverá manter, durante a execução contratual, as condições de habilitação e qualificação exigidas na licitação.",
      ],
      [
        "11. SANÇÕES. O descumprimento injustificado das obrigações poderá sujeitar a contratada a advertência, multa, impedimento de licitar e contratar, declaração de inidoneidade e demais sanções previstas na legislação.",
        "12. PROTEÇÃO DE DADOS. A contratada deverá observar as normas aplicáveis à proteção de dados e à segurança da informação no relacionamento com a Administração.",
        "As disposições do Termo de Referência vinculam a proposta, o contrato e os atos de execução.",
      ],
      [
        "Termo de Referência assinado eletronicamente por representantes da área demandante e da área técnica.",
        "A autenticidade do documento pode ser conferida no sistema SEI, mediante código verificador e código CRC.",
        "Fim do Termo de Referência.",
      ],
    ],
  },
  etp: {
    label: "Estudo Técnico Preliminar",
    pages: [
      [
        "ESTUDO TÉCNICO PRELIMINAR. Contratação de licenças JetBrains All Products Pack para atendimento das equipes de desenvolvimento do TRF6.",
        "O estudo identifica a necessidade de ferramentas integradas para desenvolvimento em PHP, Java, bancos de dados e demais tecnologias utilizadas nas aplicações institucionais.",
        "A solução considera produtividade, continuidade tecnológica, suporte oficial, atualização de versões e redução de riscos operacionais.",
      ],
      [
        "A estimativa de demanda foi definida a partir da quantidade de profissionais que utilizam ferramentas de desenvolvimento e sustentação de sistemas.",
        "Foram avaliadas alternativas de aquisição separada de licenças e a subscrição do pacote All Products Pack.",
        "A análise indicou melhor aderência do pacote completo, pois reúne IDEs e ferramentas utilizadas pelas equipes sem necessidade de contratações adicionais.",
      ],
      [
        "O All Products Pack contempla ferramentas como IntelliJ IDEA, PhpStorm, WebStorm, DataGrip, PyCharm, CLion, GoLand, Rider, RubyMine e complementos de produtividade.",
        "A solução suporta Java, PHP, Python, HTML, XML, JSON, JavaScript, TypeScript, SQL, CSS, Sass e diversos frameworks.",
        "Também há suporte a bancos de dados utilizados na sustentação dos sistemas institucionais.",
      ],
      [
        "A pesquisa de preços considerou fornecedores especializados, valores de mercado e histórico de contratações similares.",
        "A estimativa total da contratação é de R$ 261.698,13 para 36 meses.",
        "O custo total contempla subscrição, atualizações e suporte técnico durante toda a vigência.",
      ],
      [
        "A equipe de planejamento recomenda a contratação por pregão eletrônico, com julgamento pelo menor preço global e especificação objetiva do objeto.",
        "A contratação deverá seguir as diretrizes da Resolução CNJ aplicável às soluções de tecnologia da informação e comunicação.",
        "O estudo foi aprovado pelos integrantes técnico e demandante e pela autoridade da área de TIC.",
      ],
    ],
  },
  contrato: {
    label: "Minuta de Contrato",
    pages: [
      [
        "CONTRATO MINUTA 0522044. Processo SEI nº 0008259-31.2023.4.06.8000. Pregão Eletrônico 15/2023.",
        "Contrato de aquisição de licenças de software All Products Pack, incluindo atualização e suporte técnico, celebrado entre o Tribunal Regional Federal da 6ª Região e a empresa vencedora.",
        "O instrumento vincula o Termo de Referência, o Edital da Licitação, a proposta da contratada e eventuais anexos.",
      ],
      [
        "CLÁUSULA PRIMEIRA - DO OBJETO. Aquisição de licenças JetBrains All Products Pack - subscrição de 36 meses, incluindo atualização e serviço de suporte técnico.",
        "CLÁUSULA SEGUNDA - DA FINALIDADE. Proporcionar ganho de tempo e maior agilidade no desenvolvimento de aplicações, com recursos que reduzem esforços de codificação e facilitam controle de versões.",
        "A ferramenta dará sustentação às equipes responsáveis por aplicações institucionais, incluindo sistemas mantidos pelo TRF6.",
      ],
      [
        "CLÁUSULA TERCEIRA - MODELOS DE EXECUÇÃO E GESTÃO CONTRATUAIS. A contratada deverá observar o Termo de Referência quanto ao objeto, requisitos, execução, medição e pagamento.",
        "CLÁUSULA QUARTA - SUBCONTRATAÇÃO. Não será admitida a subcontratação do objeto contratual.",
        "CLÁUSULA QUINTA - OBRIGAÇÕES DA CONTRATADA. As obrigações são aquelas previstas no Termo de Referência, especialmente no item próprio de obrigações.",
      ],
      [
        "CLÁUSULA SÉTIMA - PREÇO. A contratada receberá o valor definido na proposta adjudicada, observadas as condições do edital e do Termo de Referência.",
        "CLÁUSULA OITAVA - RECEBIMENTO, LIQUIDAÇÃO E PAGAMENTO. A emissão da nota fiscal será precedida do recebimento definitivo do objeto.",
        "CLÁUSULA DÉCIMA PRIMEIRA - REAJUSTE. Os preços serão reajustáveis com periodicidade anual, observada a legislação vigente e o índice previsto no instrumento.",
      ],
      [
        "CLÁUSULA DÉCIMA QUINTA - VIGÊNCIA E PRORROGAÇÃO. O prazo de vigência da contratação é de 36 meses, contado da assinatura do contrato.",
        "CLÁUSULA DÉCIMA SÉTIMA - PUBLICAÇÃO. O instrumento e seus aditivos serão divulgados no Portal Nacional de Contratações Públicas e no sítio oficial.",
        "CLÁUSULA DÉCIMA OITAVA - FORO. Fica eleito o foro da Justiça Federal em Minas Gerais para dirimir dúvidas decorrentes do contrato.",
      ],
    ],
  },
  proposta: {
    label: "Proposta da contratada",
    pages: [
      [
        "PROPOSTA COMERCIAL. Pregão Eletrônico nº 15/2023. Objeto: licenças JetBrains All Products Pack com suporte técnico e atualização por 36 meses.",
        "Item 1: 20 unidades. Unidade de medida: licença/subscrição. Prazo de entrega: até 30 dias corridos após o recebimento da ordem de fornecimento.",
        "A proposta declara que todos os custos, tributos, encargos, despesas operacionais e demais valores necessários ao cumprimento integral do objeto estão incluídos no preço ofertado.",
      ],
      [
        "Condições: validade da proposta conforme edital, garantia de atualização durante a vigência da subscrição e suporte técnico oficial.",
        "A licitante declara ciência das condições do edital, do Termo de Referência e da minuta contratual.",
        "A proposta fica vinculada à adjudicação e à assinatura do contrato, observadas as verificações de habilitação e regularidade.",
      ],
    ],
  },
}

const COMPLEMENTOS: Record<DocKey, string[]> = {
  edital: [
    "A condução do procedimento observará a vinculação ao instrumento convocatório, cabendo às licitantes examinar cuidadosamente todas as condições de participação, os prazos, as exigências de habilitação, as regras de julgamento e os anexos que integram a contratação.",
    "Os documentos apresentados no sistema eletrônico deverão refletir fielmente as condições ofertadas, sendo de responsabilidade exclusiva da licitante a veracidade das informações, a regularidade dos arquivos enviados e a compatibilidade da proposta com o objeto descrito.",
    "Durante a sessão pública, a Administração poderá solicitar esclarecimentos, promover diligências e registrar em ata os atos relevantes, sempre com o objetivo de preservar a competitividade, a transparência e a seleção da proposta mais vantajosa para o interesse público.",
    "As comunicações oficiais do certame ocorrerão preferencialmente pelo sistema eletrônico, e a ausência de acompanhamento pela licitante não afastará sua responsabilidade por prazos, convocações, mensagens, solicitações de ajuste ou decisões disponibilizadas no ambiente da disputa.",
    "A proposta classificada em primeiro lugar será analisada quanto à aderência técnica, ao preço ofertado e às condições de execução, podendo ser desclassificada quando apresentar inconsistência insanável, preço inexequível ou incompatibilidade com os requisitos do Termo de Referência.",
    "Os recursos administrativos deverão observar os prazos e a forma previstos neste edital, com manifestação motivada, indicação objetiva dos pontos contestados e apresentação das razões no ambiente eletrônico, sob pena de preclusão.",
    "A homologação do resultado dependerá da regularidade dos atos praticados, da inexistência de impedimentos legais e da conveniência administrativa, não gerando à licitante direito subjetivo à contratação antes da convocação formal pelo órgão competente.",
  ],
  termo: [
    "A execução do objeto deverá assegurar a disponibilização regular das licenças, o acesso às atualizações do fabricante e a manutenção das condições de suporte técnico, sem prejuízo das obrigações de correção de falhas relacionadas à entrega ou à ativação das subscrições.",
    "A contratada deverá manter comunicação clara com a fiscalização do contrato, informando prazos, dados de ativação, evidências de fornecimento, eventuais impedimentos e providências necessárias para que a Administração possa validar o recebimento do objeto.",
    "O recebimento provisório não importará aceite definitivo, podendo a Administração verificar posteriormente a conformidade das licenças, a quantidade fornecida, o prazo de vigência, os direitos de atualização e as condições de suporte vinculadas ao fabricante.",
    "Caso sejam identificadas inconsistências, a contratada deverá promover a correção no prazo indicado pela fiscalização, sem ônus adicional para a Administração e sem prejuízo da aplicação das sanções cabíveis em caso de atraso ou descumprimento injustificado.",
    "As obrigações de suporte e atualização permanecerão vigentes durante todo o período contratado, devendo a contratada assegurar que a Administração tenha acesso aos benefícios da subscrição conforme as práticas comerciais e técnicas do fabricante.",
    "A liquidação da despesa dependerá da conferência documental, do aceite do objeto e da regularidade fiscal e trabalhista exigida para pagamentos no âmbito da contratação pública.",
    "A contratada deverá preservar, durante a execução, as condições de habilitação e qualificação demonstradas na licitação, comunicando qualquer fato superveniente que possa comprometer o cumprimento das obrigações assumidas.",
  ],
  etp: [
    "A necessidade da contratação decorre da manutenção de ambiente técnico compatível com as linguagens, bancos de dados e frameworks utilizados pelas equipes de desenvolvimento e sustentação dos sistemas institucionais.",
    "A avaliação das alternativas considerou custo total, abrangência funcional, continuidade operacional, curva de adaptação, suporte do fabricante e impacto de eventual substituição das ferramentas atualmente utilizadas.",
    "A contratação do pacote integrado reduz a necessidade de múltiplos processos de aquisição, concentra o gerenciamento de licenças e amplia a cobertura tecnológica para diferentes perfis de desenvolvedores.",
    "A estimativa de quantidades foi dimensionada a partir da demanda informada pela área técnica, considerando usuários que atuam diretamente em desenvolvimento, manutenção, testes, análise de banco de dados e sustentação de aplicações.",
    "Os riscos identificados envolvem atraso na disponibilização das licenças, incompatibilidade de plano contratado, falhas de ativação, divergência de vigência e ausência de suporte adequado durante o período de utilização.",
    "Como medida de mitigação, recomenda-se especificação clara da subscrição, validação do prazo de 36 meses, conferência da quantidade fornecida e acompanhamento formal pela fiscalização desde a emissão da ordem de fornecimento.",
    "A solução escolhida apresenta aderência ao interesse público por preservar produtividade, reduzir fragmentação de ferramentas e oferecer suporte a tecnologias já adotadas pela área de tecnologia da informação.",
  ],
  contrato: [
    "A contratada obriga-se a executar o objeto em conformidade com o Termo de Referência, a proposta aceita e as demais peças do processo, respondendo pela qualidade, regularidade e tempestividade do fornecimento.",
    "A fiscalização do contrato poderá solicitar documentos, registros, evidências de ativação e quaisquer informações necessárias à verificação do cumprimento das obrigações contratuais, sem que isso exclua a responsabilidade integral da contratada.",
    "Os pagamentos observarão os procedimentos de recebimento, liquidação e atesto definidos no instrumento convocatório, ficando condicionados à efetiva entrega do objeto e à manutenção da regularidade exigida.",
    "A inexecução total ou parcial do contrato poderá ensejar aplicação de advertência, multa, impedimento de licitar e contratar ou outras penalidades previstas na legislação, observados o contraditório e a ampla defesa.",
    "O reajuste, quando cabível, dependerá de solicitação formal, demonstração do índice aplicável e observância da periodicidade prevista, não sendo automático nem devido antes do atendimento das condições contratuais.",
    "As partes deverão observar as regras de proteção de dados, confidencialidade e segurança da informação naquilo que for aplicável à execução do objeto e ao relacionamento institucional.",
    "A extinção contratual poderá ocorrer pelo término da vigência, por acordo entre as partes ou pelas hipóteses legais, com apuração de obrigações pendentes, pagamentos devidos e eventuais responsabilidades.",
  ],
  proposta: [
    "A proponente declara que examinou todas as condições do edital e dos anexos, assumindo integral responsabilidade pela composição dos preços, prazos, tributos, encargos e demais custos necessários ao fornecimento do objeto.",
    "Os valores apresentados contemplam a disponibilização das licenças, o direito de atualização pelo período contratado, o suporte técnico vinculado à subscrição e os procedimentos necessários à ativação junto ao fabricante.",
    "A proposta comercial permanecerá válida pelo prazo estabelecido no edital, vinculando a licitante às condições ofertadas e permitindo a convocação para assinatura contratual ou instrumento equivalente.",
    "A aceitação da proposta fica condicionada à análise de conformidade, à habilitação da licitante e à inexistência de impedimentos para contratar com a Administração Pública.",
    "Eventuais ajustes solicitados pela Administração deverão preservar o preço final ofertado, a descrição do objeto, a quantidade de licenças, a vigência da subscrição e as condições mínimas definidas no Termo de Referência.",
    "A licitante compromete-se a fornecer informações complementares quando solicitada, especialmente aquelas necessárias à comprovação de compatibilidade do plano ofertado com o produto JetBrains All Products Pack.",
    "A assinatura do contrato formalizará as obrigações assumidas na proposta, incluindo prazo de entrega, condições de suporte, validade da subscrição e responsabilidade pelo atendimento ao objeto contratado.",
  ],
}

function montarPagina(doc: DocKey, paragrafos: string[], indice: number) {
  const complementos = COMPLEMENTOS[doc] ?? COMPLEMENTOS.edital
  const pagina = [...paragrafos]
  let cursor = indice % complementos.length
  let caracteres = pagina.reduce((total, p) => total + p.length, 0)
  const alvo = 1750
  const maximo = 2100

  while (caracteres < alvo && pagina.length < 8) {
    const proximo = complementos[cursor]
    if (caracteres + proximo.length > maximo && pagina.length > paragrafos.length) break
    pagina.push(proximo)
    caracteres += proximo.length
    cursor = (cursor + 1) % complementos.length
  }
  return pagina
}

/** Páginas completas de um documento (com os complementos). */
export const PAGINAS: Record<DocKey, string[][]> = Object.fromEntries(
  (Object.keys(DOCUMENTOS) as DocKey[]).map((doc) => [
    doc,
    DOCUMENTOS[doc].pages.map((p, i) => montarPagina(doc, p, i)),
  ])
) as Record<DocKey, string[][]>
