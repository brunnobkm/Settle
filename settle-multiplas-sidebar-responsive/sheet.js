const appShell = document.querySelector("[data-app-shell]");
const sheetPanel = document.querySelector('[data-panel="sheet"]');
const sidebarPanel = document.querySelector('[data-panel="sidebar"]');
const sidebarShell = document.querySelector("[data-sidebar-shell]");
const sidebarResizeHandle = document.querySelector("[data-sidebar-resize]");
const backdrop = document.querySelector(".sheet-backdrop");
const vivoBackdrop = document.querySelector(".vivo-backdrop");
const vivoPanel = document.querySelector("[data-vivo-panel]");
const vivoRoot = document.querySelector("[data-vivo-root]");
const template = document.querySelector("#summary-panel-template");
const toast = document.querySelector("#toast");
const tooltip = document.createElement("div");
tooltip.className = "floating-tooltip";
tooltip.setAttribute("role", "tooltip");
document.body.append(tooltip);

const sourceSelectionTooltip = document.createElement("button");
sourceSelectionTooltip.className = "source-selection-tooltip";
sourceSelectionTooltip.type = "button";
sourceSelectionTooltip.textContent = "Adicionar como fonte";
document.body.append(sourceSelectionTooltip);

const sourceCursorTooltip = document.createElement("div");
sourceCursorTooltip.className = "source-cursor-tooltip";
sourceCursorTooltip.textContent = "Selecione um trecho";
document.body.append(sourceCursorTooltip);

let sourceSelectionRange = null;
let activeSourceRow = null;
let activeSourceView = null;
let activeManualSourceEditor = null;
let sourceClickStartedWithSelection = false;
let sidebarResizeMode = null;
let flatGroupCounter = 0;
const scrollHideTimers = new WeakMap();
const sidebarWidth = {
  summary: 39,
  source: 70,
};

const SOURCE_TITLE_MARK = "@@TITULO@@";
const SOURCE_SUBTITLE_MARK = "@@SUBTITULO@@";

const sourceDocuments = {
  edital: {
    label: "Edital 15/2023",
    pages: [
      [
        "PODER JUDICIÁRIO. TRIBUNAL REGIONAL FEDERAL DA 6ª REGIÃO. EDITAL DO PREGÃO ELETRÔNICO Nº 15/2023.",
        "Objeto: aquisição de licenças de software JetBrains All Products Pack, incluindo atualização e serviço de suporte técnico por 36 meses, conforme condições do Edital, do Termo de Referência e de seus anexos.",
        "O certame será realizado em ambiente eletrônico, por meio do portal Compras.gov.br, observadas as regras da Lei nº 14.133/2021 e os princípios da legalidade, impessoalidade, publicidade, eficiência e julgamento objetivo.",
      ],
      [
        "@@TITULO@@1. DA SESSÃO PÚBLICA E DAS PROPOSTAS",
        "@@SUBTITULO@@1.1 Da realização da sessão pública",
        "A sessão pública observará a fase de apresentação de propostas, a etapa competitiva de lances, a verificação de conformidade, o julgamento, a habilitação e os procedimentos recursais previstos neste instrumento.",
        "@@SUBTITULO@@1.2 Das propostas e responsabilidades",
        "As propostas deverão conter descrição clara do objeto, marca ou fabricante, prazo de entrega, valor unitário, valor total e declaração de que todos os custos diretos e indiretos estão incluídos no preço ofertado.",
        "O licitante é responsável por acompanhar as operações no sistema eletrônico durante todo o processo licitatório, respondendo pelos ônus decorrentes da perda de negócios diante da inobservância de mensagens emitidas pela Administração.",
      ],
      [
        "@@TITULO@@2. DO JULGAMENTO E DA NEGOCIAÇÃO",
        "@@SUBTITULO@@2.1 Do critério de julgamento",
        "O critério de julgamento adotado será o menor preço global, considerando o valor total estimado para a contratação das licenças e serviços correlatos.",
        "@@SUBTITULO@@2.2 Da negociação e da classificação",
        "A Administração poderá negociar condições mais vantajosas após o encerramento da etapa de lances, preservada a ordem de classificação e a compatibilidade da proposta com as especificações técnicas.",
        "A proposta vencedora deverá atender integralmente às exigências de compatibilidade, quantidade, vigência, atualização e suporte técnico estabelecidas no Termo de Referência.",
      ],
      [
        "@@TITULO@@3. DA HABILITAÇÃO",
        "@@SUBTITULO@@3.1 Da documentação exigida",
        "A habilitação exigirá documentação jurídica, fiscal, social, trabalhista, econômico-financeira e técnica, nos termos do edital e da legislação aplicável.",
        "@@SUBTITULO@@3.2 Do saneamento e das consultas",
        "A ausência de documento obrigatório poderá ser saneada apenas nas hipóteses admitidas pela legislação e pelo entendimento vigente do órgão responsável pela condução do certame.",
        "A Administração consultará cadastros oficiais de sanções e impedimentos para verificar a regularidade da licitante antes da adjudicação.",
      ],
      [
        "@@TITULO@@4. DOS ANEXOS DO EDITAL",
        "@@SUBTITULO@@4.1 Da composição dos anexos",
        "Integram o edital, para todos os fins e efeitos, os seguintes anexos: Anexo I - Termo de Referência; Anexo II - Estudo Técnico Preliminar; Anexo III - Minuta de Contrato.",
        "@@SUBTITULO@@4.2 Da prevalência e da publicidade",
        "Em caso de divergência entre disposições do Edital e de seus anexos ou demais peças que compõem o processo, prevalecerão as disposições do Edital.",
        "O edital e seus anexos ficam disponíveis no Portal Nacional de Contratações Públicas e no endereço eletrônico institucional do TRF6.",
      ],
      [
        "@@TITULO@@5. DOS ESCLARECIMENTOS E DAS IMPUGNAÇÕES",
        "@@SUBTITULO@@5.1 Do envio dos pedidos",
        "Os pedidos de esclarecimento e impugnação deverão ser enviados nos prazos previstos, por meio eletrônico, com identificação do interessado e indicação objetiva do ponto questionado.",
        "@@SUBTITULO@@5.2 Da divulgação e dos efeitos",
        "As respostas a esclarecimentos e impugnações serão divulgadas no sistema eletrônico e passarão a integrar o edital, vinculando Administração e licitantes.",
        "A participação na licitação implica aceitação plena das condições estabelecidas no edital e em seus anexos.",
      ],
      [
        "@@TITULO@@6. DA ADJUDICAÇÃO E DA HOMOLOGAÇÃO",
        "@@SUBTITULO@@6.1 Da adjudicação e da homologação",
        "A adjudicação e a homologação do resultado não implicam direito automático à contratação, ficando a convocação condicionada ao interesse público e à disponibilidade orçamentária.",
        "@@SUBTITULO@@6.2 Da contratação e dos casos omissos",
        "O contrato observará a vigência, os prazos, as condições de recebimento, a forma de pagamento, as obrigações das partes e as sanções previstas nos anexos do edital.",
        "Os casos omissos serão resolvidos pela Administração com base na Lei nº 14.133/2021 e nas normas federais aplicáveis às contratações públicas.",
      ],
      [
        "@@TITULO@@7. DO VALOR ESTIMADO DA CONTRATAÇÃO",
        "@@SUBTITULO@@7.1 Da composição do valor estimado",
        "O valor estimado da contratação considera pesquisa de preços e o custo total de propriedade do software, incluindo atualização, suporte técnico e continuidade da licença durante o período contratado.",
        "@@SUBTITULO@@7.2 Da validade e da exequibilidade dos preços",
        "Os preços apresentados deverão permanecer válidos pelo prazo indicado no edital e serão de exclusiva responsabilidade da licitante.",
        "Não será admitida proposta com preço manifestamente inexequível ou incompatível com os valores praticados no mercado, salvo demonstração objetiva de exequibilidade.",
      ],
      [
        "@@TITULO@@8. DA CONTRATAÇÃO E DAS SANÇÕES",
        "@@SUBTITULO@@8.1 Da formalização da contratação",
        "A licitante vencedora deverá assinar o contrato ou retirar instrumento equivalente no prazo definido pela Administração, sob pena de aplicação das penalidades cabíveis.",
        "@@SUBTITULO@@8.2 Das sanções e do foro",
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
};

const sourceFillers = {
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
};

function buildSourcePageParagraphs(documentKey, paragraphs, pageIndex) {
  const fillers = sourceFillers[documentKey] || sourceFillers.edital;
  const isHeading = (paragraph) => paragraph.startsWith(SOURCE_TITLE_MARK) || paragraph.startsWith(SOURCE_SUBTITLE_MARK);
  const expanded = [...paragraphs];
  const baseBodyCount = paragraphs.filter((paragraph) => !isHeading(paragraph)).length;
  let bodyCount = baseBodyCount;
  let cursor = pageIndex % fillers.length;
  let characterCount = paragraphs.reduce((total, paragraph) => (isHeading(paragraph) ? total : total + paragraph.replace(/<[^>]+>/g, "").length), 0);
  const targetCharacters = 1750;
  const maxCharacters = 2100;

  while (characterCount < targetCharacters && bodyCount < 8) {
    const nextParagraph = fillers[cursor];
    const nextLength = nextParagraph.length;

    if (characterCount + nextLength > maxCharacters && bodyCount > baseBodyCount) break;

    expanded.push(nextParagraph);
    characterCount += nextLength;
    bodyCount += 1;
    cursor = (cursor + 1) % fillers.length;
  }

  return expanded;
}

const sourceHighlightTargets = [
  {
    label: "Regime de Execução",
    documentKey: "termo",
    text: "Regime de execução: empreitada por preço global, com contratação da execução do serviço por preço certo e total.",
  },
  {
    label: "Critério de Julgamento",
    documentKey: "edital",
    text: "O critério de julgamento adotado será o menor preço global",
  },
  {
    label: "Escopo principal",
    documentKey: "edital",
    text: "aquisição de licenças de software JetBrains All Products Pack, incluindo atualização e serviço de suporte técnico por 36 meses",
  },
  {
    label: "Quantidade de licenças",
    documentKey: "termo",
    text: "Quantidade: 20",
  },
  {
    label: "Vigência",
    documentKey: "termo",
    text: "O prazo de vigência da contratação é de 3 anos contados do termo de recebimento definitivo das licenças",
  },
  {
    label: "Tipo de solução",
    documentKey: "etp",
    text: "subscrição do pacote All Products Pack",
  },
  {
    label: "Ferramentas incluídas",
    documentKey: "termo",
    text: "IntelliJ IDEA, WebStorm, Rider, PyCharm, CLion, PhpStorm, DataGrip, AppCode, GoLand, RubyMine",
  },
  {
    label: "Finalidade",
    documentKey: "contrato",
    text: "Proporcionar ganho de tempo e maior agilidade no desenvolvimento de aplicações",
  },
  {
    label: "Entrega",
    documentKey: "termo",
    text: "Prazo máximo para entrega e conclusão dos serviços de instalação e configuração: até 30 dias corridos",
  },
  {
    label: "Prazo de entrega",
    documentKey: "termo",
    text: "Prazo máximo para entrega e conclusão dos serviços de instalação e configuração: até 30 dias corridos",
  },
  {
    label: "Atualização",
    documentKey: "termo",
    text: "garantia de atualização pela contratada durante o período de 36 meses",
  },
  {
    label: "Suporte técnico",
    documentKey: "termo",
    text: "serviço de suporte técnico pelo mesmo período",
  },
  {
    label: "Valor estimado",
    documentKey: "termo",
    text: "R$ 261.698,13",
  },
  {
    label: "Pagamento",
    documentKey: "contrato",
    text: "A emissão da nota fiscal será precedida do recebimento definitivo do objeto",
  },
  {
    label: "Recebimento provisório",
    documentKey: "termo",
    text: "O recebimento provisório ocorrerá em até 5 dias corridos",
  },
  {
    label: "Recebimento definitivo",
    documentKey: "termo",
    text: "O recebimento definitivo ocorrerá em até 10 dias corridos após o recebimento provisório",
  },
];

const vivoPocData = {
  opportunityId: "edital-123",
  title: "Aquisição de equipamentos de informática e serviços correlatos",
  temperature: "MORNO",
  score: 82,
  scoreMax: 100,
  thresholds: { hot: 90, warm: 70 },
  topReasons: [
    "Objeto aderente à Torre de Soluções",
    "Critério de julgamento favorável",
    "Prazo operacional viável",
    "Ambiguidade em Modalidade",
  ],
  scope: {
    tower: "Torre de Soluções",
    segment: "Segmento atual (Vivo)",
    dataSource: "Captura Settle",
    calculatedAt: "2026-05-04T16:30:00-03:00",
  },
  criteria: [
    {
      id: "crit-1",
      section: "Licenças e vigência",
      name: "Regime de execução",
      status: "ATENDE",
      impact: { type: "points", value: 12 },
      selectedValue: "Empreitada Integral",
      expectedValue: "Execução integral ou preço global",
      evidence: {
        snippet: "Regime de execução: empreitada por preço global, com contratação da execução do serviço por preço certo e total.",
        sourceLabel: "Termo de Referência",
        documentKey: "termo",
      },
    },
    {
      id: "crit-2",
      section: "Licenças e vigência",
      name: "Modalidade",
      status: "REQUER_REVISAO",
      impact: { type: "points", value: 0 },
      selectedValue: null,
      expectedValue: "Pregão eletrônico",
      evidence: null,
      ambiguity: {
        optionsFound: 2,
        options: [
          {
            value: "Pregão Eletrônico",
            evidence: {
              snippet: "A equipe de planejamento recomenda a contratação por pregão eletrônico, com julgamento pelo menor preço global e especificação objetiva do objeto.",
              sourceLabel: "Estudo Técnico Preliminar",
              documentKey: "etp",
            },
          },
          {
            value: "Concorrência",
            evidence: {
              snippet: "Modalidade: Concorrência.",
              sourceLabel: "Edital 15/2023",
              documentKey: "edital",
            },
          },
        ],
      },
    },
    {
      id: "crit-3",
      section: "Critérios de julgamento",
      name: "Critério de julgamento",
      status: "ATENDE",
      impact: { type: "points", value: 15 },
      selectedValue: "Menor preço global",
      expectedValue: "Menor preço",
      evidence: {
        snippet: "O critério de julgamento adotado será o menor preço global",
        sourceLabel: "Edital 15/2023",
        documentKey: "edital",
      },
    },
    {
      id: "crit-4",
      section: "Requisitos técnicos",
      name: "Exigência de POC",
      status: "NAO_ATENDE",
      impact: { type: "points", value: 0 },
      selectedValue: "Prova de conceito prevista apenas para habilitação técnica.",
      expectedValue: "POC objetiva com roteiro e aceite definidos",
      evidence: {
        snippet: "A Administração poderá solicitar demonstração da solução, quando necessário.",
        sourceLabel: "Termo de Referência",
        documentKey: "termo",
      },
    },
  ],
};

const vivoCriterionSections = [
  "Prazos e implantação",
  "Licenças e vigência",
  "Objeto e escopo",
  "Requisitos técnicos",
  "Segurança e conformidade",
  "Suporte e SLA",
  "Condições comerciais",
  "Critérios de julgamento",
  "Documentos de habilitação",
  "Entregáveis e aceite",
];

function formatVivoDate(value) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function getVivoPendingCriteria() {
  return vivoPocData.criteria.filter((criterion) => criterion.status === "REQUER_REVISAO" && criterion.ambiguity);
}

function isVivoScoreProvisional() {
  return getVivoPendingCriteria().length > 0;
}

function getVivoStatusLabel(status) {
  return ({
    ATENDE: "Atende",
    NAO_ATENDE: "Não atende",
    REQUER_REVISAO: "Requer revisão",
  })[status] || status;
}

function buildVivoCopyText({ scoreOnly = false } = {}) {
  const pending = getVivoPendingCriteria();
  const scoreStatus = isVivoScoreProvisional() ? "provisório" : "confirmado";
  const criteria = vivoPocData.criteria
    .map((criterion) => {
      const impact = `${criterion.impact.value >= 0 ? "+" : ""}${criterion.impact.value}`;
      const evidence = criterion.evidence?.snippet || "Sem evidência selecionada";
      return `${criterion.name} - ${getVivoStatusLabel(criterion.status)} (${impact}) - ${evidence}`;
    })
    .join("\n");

  const scoreText = `Temperatura: ${vivoPocData.temperature} ${scoreStatus} (${vivoPocData.score}/${vivoPocData.scoreMax})`;
  if (scoreOnly) return scoreText;

  return [
    scoreText,
    `Top motivos: ${vivoPocData.topReasons.join("; ")}`,
    `Pendências: ${pending.length} (${pending.map((item) => item.name).join(", ") || "nenhuma"})`,
    "Critérios (resumo):",
    criteria,
    `Escopo: ${vivoPocData.scope.tower} / ${vivoPocData.scope.segment} / ${vivoPocData.scope.dataSource}`,
  ].join("\n");
}

function getVivoEvidenceTarget(evidence) {
  if (!evidence?.snippet) return null;
  return {
    documentKey: evidence.documentKey || "edital",
    text: evidence.snippet,
  };
}

function vivoIcon(name) {
  const icons = {
    copy: actionIcon("copy"),
    edit: actionIcon("edit"),
    link: actionIcon("link"),
    download: '<svg class="lucide-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5 5 5-5" /><path d="M12 15V3" /></svg>',
    alert: '<svg class="lucide-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 2.7 20h18.6L12 3Z" /><path d="M12 9v5" /><path d="M12 17.2h.01" /></svg>',
    close: '<svg class="lucide-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>',
  };
  return icons[name] || "";
}

function renderVivoScoreModal(titleId = "vivo-score-dialog-title") {
  return `
    <div class="vivo-score-modal" data-vivo-score-modal hidden>
      <div class="vivo-score-modal-backdrop" data-close-vivo-score-modal></div>
      <section class="vivo-score-dialog" role="dialog" aria-modal="true" aria-labelledby="${titleId}">
        <header class="vivo-score-dialog-header">
          <h2 id="${titleId}">Como o score é calculado?</h2>
          <button class="close-btn" type="button" data-close-vivo-score-modal aria-label="Fechar">${vivoIcon("close")}</button>
        </header>
        <div class="vivo-score-dialog-body">
          <p>O score soma os pontos dos critérios definidos pela Vivo para classificar a oportunidade como Quente, Morno ou Frio.</p>
          <dl>
            <div><dt>Quente</dt><dd>${vivoPocData.thresholds.hot} pontos ou mais</dd></div>
            <div><dt>Morno</dt><dd>${vivoPocData.thresholds.warm} a ${vivoPocData.thresholds.hot - 1} pontos</dd></div>
            <div><dt>Frio</dt><dd>Abaixo de ${vivoPocData.thresholds.warm} pontos</dd></div>
          </dl>
          <p>Cada critério compara o que foi encontrado no edital com o esperado pela Vivo. Se houver ambiguidade, o score fica pendente de confirmação até a revisão.</p>
        </div>
      </section>
    </div>
  `;
}

function renderVivoCriterion(criterion) {
  const impact = `${criterion.impact.value >= 0 ? "+" : ""}${criterion.impact.value}`;
  const evidence = criterion.evidence;
  const statusClass = criterion.status.toLowerCase().replaceAll("_", "-");
  const ambiguity = criterion.ambiguity;
  const showComparison = criterion.status !== "ATENDE";
  const evidenceTarget = getVivoEvidenceTarget(evidence);

  return `
    <div class="accordion-row vivo-criterion-row" data-vivo-criterion="${criterion.id}">
      <div class="vivo-row-heading">
        <dt class="row-label">${escapeHTML(criterion.name)}</dt>
        <span class="vivo-status vivo-status--${statusClass}">${getVivoStatusLabel(criterion.status)}</span>
        <strong class="vivo-impact">${impact}</strong>
      </div>
      ${showComparison ? `
        <dl class="vivo-criterion-values">
          <div>
            <dt>Esperado:</dt>
            <dd>${escapeHTML(criterion.expectedValue || "Não definido")}</dd>
          </div>
          <div>
            <dt>Encontrado:</dt>
            <dd>${escapeHTML(criterion.selectedValue || "Aguardando revisão")}</dd>
          </div>
        </dl>
      ` : `<dd class="row-value">${escapeHTML(criterion.selectedValue || "Aguardando revisão")}</dd>`}
      <div class="row-actions">
        <button class="row-action-btn" type="button" data-vivo-copy="${escapeHTML(criterion.selectedValue || "")}" aria-label="Copiar informação">${vivoIcon("copy")}</button>
        <button
          class="row-action-btn"
          type="button"
          data-vivo-source
          data-vivo-document="${escapeHTML(evidenceTarget?.documentKey || "")}"
          data-vivo-text="${escapeHTML(evidenceTarget?.text || "")}"
          aria-label="Abrir origem"
        >${vivoIcon("link")}</button>
      </div>
      ${ambiguity ? `
        <div class="vivo-criterion-review">
          <div class="vivo-criterion-review-header">
            <span class="info-icon" aria-hidden="true">
              <svg class="lucide-icon" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
            </span>
            <strong>Revise as informações divergentes</strong>
          </div>
          <div class="vivo-criterion-options">
            ${ambiguity.options.map((option) => `
              <label class="source-option vivo-option-card">
                <span>
                  <strong>${escapeHTML(option.value)}</strong>
                  <small>${escapeHTML(option.evidence.sourceLabel)} · ${escapeHTML(option.evidence.snippet)}</small>
                </span>
                <div class="vivo-option-actions">
                  <button type="button" data-vivo-use-option="${criterion.id}" data-vivo-option-value="${escapeHTML(option.value)}">Usar esta</button>
                  <button type="button" data-vivo-copy="${escapeHTML(option.value)}">Copiar informação</button>
                </div>
              </label>
            `).join("")}
          </div>
        </div>
      ` : ""}
    </div>
  `;
}

function renderVivoCriterionSection(sectionName) {
  const criteria = vivoPocData.criteria.filter((criterion) => criterion.section === sectionName);
  const isOpen = criteria.length > 0;

  return `
    <section class="accordion">
      <button class="accordion-header${isOpen ? " is-open" : ""}" type="button" data-accordion-toggle aria-expanded="${isOpen}">
        <span class="accordion-header-label">${escapeHTML(sectionName)}</span>
        <span class="chevron${isOpen ? " is-open" : ""}" aria-hidden="true"><svg viewBox="0 0 14 14"><path d="m3.5 5.5 3.5 3.5 3.5-3.5" /></svg></span>
      </button>
      <dl class="accordion-body accordion-list${isOpen ? " is-open" : ""}">
        ${criteria.length ? criteria.map(renderVivoCriterion).join("") : `
          <div class="accordion-row">
            <dt class="row-label">Sem critério avaliado</dt>
            <dd class="row-value">Nenhum critério deste tema foi considerado nesta simulação.</dd>
          </div>
        `}
      </dl>
    </section>
  `;
}

function renderVivoPanel() {
  vivoRoot.innerHTML = `
    <header class="review-header vivo-header">
      <div class="review-title-row">
        <h1 class="review-title">Score</h1>
        <span class="beta-badge">Beta</span>
      </div>
      <div class="review-actions">
        <button class="close-btn" type="button" data-close-vivo aria-label="Fechar">${vivoIcon("close")}</button>
      </div>
    </header>
    <div class="review-body vivo-body">
      <section class="objeto-card vivo-hero">
        <div class="vivo-score-card" title="Quente >= ${vivoPocData.thresholds.hot}; Morno >= ${vivoPocData.thresholds.warm}; Frio < ${vivoPocData.thresholds.warm}">
          <div class="vivo-gauge" aria-hidden="true" style="--score-progress: ${vivoPocData.score}; --score-angle: ${-180 + (vivoPocData.score * 1.8)}deg;">
            <svg class="vivo-gauge-track" viewBox="0 0 160 92">
              <path class="vivo-gauge-segment vivo-gauge-segment--cold" d="M16 80 A64 64 0 0 1 54 23" />
              <path class="vivo-gauge-segment vivo-gauge-segment--warm" d="M66 17 A64 64 0 0 1 94 17" />
              <path class="vivo-gauge-segment vivo-gauge-segment--hot" d="M111 25 A64 64 0 0 1 144 80" />
            </svg>
            <div class="vivo-gauge-needle"></div>
            <div class="vivo-gauge-marker vivo-gauge-marker--${vivoPocData.temperature.toLowerCase()}"></div>
          </div>
          <div class="vivo-score-info">
            <span class="vivo-temperature vivo-temperature--${vivoPocData.temperature.toLowerCase()}">${vivoPocData.temperature}</span>
            <strong>${vivoPocData.score}/${vivoPocData.scoreMax}</strong>
            <button class="vivo-score-help" type="button" data-vivo-score-help>Como isso é calculado?</button>
          </div>
        </div>
      </section>

      <section class="objeto-card">
        <h2 class="objeto-label">Objeto</h2>
        <p class="objeto-value">${escapeHTML(vivoPocData.title)}</p>
      </section>

      ${vivoCriterionSections.map(renderVivoCriterionSection).join("")}

    </div>
    <section class="source-view vivo-source-view" data-source-view hidden aria-label="Trecho do edital">
      <header class="source-header">
        <label class="source-select-wrap" aria-label="Documento aberto">
          <select class="source-document-select" data-source-document>
            <option value="edital">Edital 15/2023</option>
            <option value="termo">Termo de Referência</option>
            <option value="etp">Estudo Técnico Preliminar</option>
            <option value="contrato">Minuta de Contrato</option>
            <option value="proposta">Proposta da contratada</option>
          </select>
          <svg class="lucide-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </label>
        <div class="source-actions">
          <button class="source-icon-btn" type="button" data-download-source aria-label="Baixar edital">${vivoIcon("download")}</button>
          <button class="source-icon-btn" type="button" data-close-vivo-source aria-label="Fechar trecho">${vivoIcon("close")}</button>
        </div>
      </header>
      <div class="source-body">
        <article class="source-card" data-source-card></article>
      </div>
    </section>
    ${renderVivoScoreModal()}
  `;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function scrollSourceHighlightIntoView(sourceView, highlight) {
  const sourceBody = sourceView?.querySelector(".source-body");
  if (!sourceBody || !highlight) return;

  const bodyRect = sourceBody.getBoundingClientRect();
  const highlightRect = highlight.getBoundingClientRect();
  const centeredTop = (
    sourceBody.scrollTop
    + highlightRect.top
    - bodyRect.top
    - (sourceBody.clientHeight / 2)
    + (highlightRect.height / 2)
  );

  sourceBody.scrollTo({
    top: Math.max(0, centeredTop),
    behavior: "auto",
  });
}

function applySourceHighlight(sourceView, text) {
  if (!sourceView || !text) return false;

  clearSourceHighlight(sourceView);
  const paragraphs = sourceView.querySelectorAll(".source-page p");
  const pattern = new RegExp(escapeRegExp(text), "i");

  for (const paragraph of paragraphs) {
    if (!pattern.test(paragraph.textContent)) continue;

    paragraph.innerHTML = paragraph.innerHTML.replace(pattern, (match) => `<mark class="source-highlight">${match}</mark>`);
    scrollSourceHighlightIntoView(sourceView, paragraph.querySelector(".source-highlight"));
    hideSourceCursorTooltip();
    return true;
  }

  return false;
}

function clearSourceHighlight(sourceView) {
  sourceView?.querySelectorAll(".source-highlight").forEach((mark) => {
    mark.replaceWith(document.createTextNode(mark.textContent));
  });
}

function getSourceSearchText(text) {
  const firstUsefulLine = text
    .split(/\n+/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .find((line) => line.length > 24);

  return (firstUsefulLine || text.replace(/\s+/g, " ").trim()).slice(0, 140);
}

function clearActiveSourceContext({ clearHighlight = true } = {}) {
  if (activeSourceRow) {
    activeSourceRow.classList.remove("is-source-active", "is-hovered");
    activeSourceRow.querySelector('[data-row-action="link"]')?.classList.remove("is-active");
    activeSourceRow = null;
  }
  activeSourceView = null;
  activeManualSourceEditor = null;

  if (clearHighlight) {
    document.querySelectorAll("[data-source-view]").forEach((sourceView) => {
      delete sourceView.dataset.highlightText;
      clearSourceHighlight(sourceView);
    });
  }
  sourceSelectionRange = null;
  hideSourceSelectionTooltip();
  hideSourceCursorTooltip();
}

function setActiveSourceRow(row, sourceView) {
  if (!row) return;

  clearActiveSourceContext({ clearHighlight: false });
  activeSourceRow = row;
  activeSourceView = sourceView || null;
  row.classList.add("is-source-active", "is-hovered");
  row.querySelector('[data-row-action="link"]')?.classList.add("is-active");
}

function findSourceHighlightTarget(row) {
  const labelElement = row?.querySelector(".row-label");
  const label = labelElement?.querySelector(":scope > span:first-child")?.textContent.trim()
    || labelElement?.textContent.trim();
  const value = row?.querySelector(".row-value")?.textContent.trim();

  if (row?.dataset.noSource === "true") {
    return {
      documentKey: row.dataset.sourceDocument || "edital",
      text: "",
      fallbackText: value,
    };
  }

  if (row?.dataset.sourceText) {
    return {
      documentKey: row.dataset.sourceDocument || "edital",
      text: row.dataset.sourceSearchText || row.dataset.sourceText,
      isCustom: true,
    };
  }

  const byLabel = sourceHighlightTargets.find((target) => target.label === label);
  if (byLabel) return byLabel;

  return {
    documentKey: "edital",
    text: "",
    fallbackText: value,
  };
}

const copyText = [
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
].join("\n");

const flatCopyText = [
  "Resumo",
  "",
  "Objeto: Aquisição de licenças de software JetBrains All Products Pack, incluindo atualização e suporte técnico por 36 meses.",
  "Prazo de entrega: Entrega e conclusão dos serviços em até 30 dias corridos. | Recebimento definitivo em até 10 dias corridos após o recebimento provisório.",
  "Regime de Execução: Empreitada por preço global, com execução por preço certo e total.",
  "Critério de Julgamento: Menor preço global.",
  "Escopo principal: Licenças JetBrains, atualização e suporte técnico por 36 meses.",
  "Quantidade de licenças: 20 licenças de direito de uso do JetBrains All Products Pack. | 20 unidades de subscrição por 36 meses.",
  "Vigência da subscrição: 36 meses contados do recebimento definitivo das licenças. | 36 meses contados da assinatura do contrato.",
  "Regime de Execução: Fornecimento de licenças com suporte técnico oficial.",
  "Critério de Julgamento: Menor preço global.",
  "Vigência: 36 meses, contados do recebimento definitivo das licenças.",
  "Tipo de solução: Subscrição de software para desenvolvimento, banco de dados e produtividade técnica.",
  "Ferramentas incluídas: IntelliJ IDEA, WebStorm, Rider, PyCharm, CLion, PhpStorm, DataGrip e GoLand.",
  "Finalidade: Apoiar equipes de desenvolvimento em Java, PHP, bancos de dados e aplicações institucionais.",
  "Entrega: Disponibilização das licenças e ativação da subscrição em até 30 dias corridos.",
  "Atualização: Atualizações do fabricante durante todo o período de vigência da subscrição.",
  "Suporte técnico: Suporte técnico oficial pelo período de 36 meses.",
  "Dados pessoais: Baixo tratamento de dados pessoais, restrito à relação contratual e à gestão das licenças.",
  "Conformidade: Observância às normas de proteção de dados e segurança da informação aplicáveis ao contrato.",
  "Sustentabilidade: Aplicação das diretrizes de sustentabilidade quando compatíveis com o fornecimento de software.",
  "Atendimento: Suporte técnico oficial do fabricante durante a vigência da subscrição.",
  "Atualizações: Direito a atualizações do software pelo período de 36 meses.",
  "Garantia: Correção de vícios, defeitos ou incorreções nos serviços de instalação, quando aplicável.",
  "Vigência: 36 meses, prorrogável nos termos da Lei nº 14.133/2021.",
  "Pagamento: Após recebimento definitivo, liquidação da despesa e emissão da nota fiscal.",
  "Valor estimado: R$ 261.698,13 para a subscrição de 36 meses.",
  "Modelo de disputa: Pregão eletrônico, com etapa de lances no Compras.gov.br.",
  "Julgamento: Menor preço global, observada a conformidade da proposta com o edital.",
  "Negociação: Possibilidade de negociação com a licitante melhor classificada.",
  "Qualificação técnica: Comprovação compatível com fornecimento de licenças e suporte técnico de software.",
  "Regularidade fiscal: Certidões fiscais federais, estaduais, municipais, FGTS e trabalhista.",
  "Declarações: Inexistência de impedimentos para licitar e cumprimento das exigências legais.",
  "Ordem de fornecimento: Entrega contada a partir do recebimento da ordem de fornecimento ou serviço.",
  "Recebimento provisório: Até 5 dias corridos após a conclusão dos serviços.",
  "Recebimento definitivo: Até 10 dias corridos após o recebimento provisório.",
].join("\n");

const scoreSheetCopyText = [
  "Score: MORNO (82/100)",
  "",
  "Objeto: Aquisição de licenças de software JetBrains All Products Pack, incluindo atualização e suporte técnico por 36 meses.",
  "Valor global: R$ 209.609,82",
  "",
  "Critérios",
  "  Regime de Execução — Atende (+10)",
  "  Critério de Julgamento — Atende (+12)",
  "  Escopo principal — Atende (+10)",
  "  Vigência — Atende (+8)",
  "  Sustentabilidade — Não atende (+0)",
  "  Negociação — Não atende (+0)",
  "  Recebimento definitivo — Não atende (+0)",
].join("\n");

function renderPanel(panel) {
  panel.append(template.content.cloneNode(true));
  const historyPopover = document.createElement("div");
  historyPopover.className = "history-popover";
  historyPopover.dataset.historyPopover = "";
  historyPopover.hidden = true;
  panel.querySelector(".review-header")?.append(historyPopover);
  panel.querySelectorAll(".info-icon").forEach((icon) => {
    icon.setAttribute("aria-label", "Revise as informações divergentes");
  });
  panel.querySelectorAll(".sub-body").forEach((body, index) => {
    const groupName = `${panel.dataset.panel}-review-${index}`;
    body.querySelectorAll("[data-review-radio]").forEach((radio) => {
      radio.name = groupName;
    });

    if (body.classList.contains("is-open")) {
      const header = body.previousElementSibling;
      const chevron = header?.querySelector(".sub-chevron");
      header?.classList.add("is-open");
      chevron?.classList.add("is-open");
      header?.querySelectorAll("[data-sub-toggle]").forEach((toggle) => {
        toggle.setAttribute("aria-expanded", "true");
      });
    }
  });
  panel.querySelectorAll(".accordion-row").forEach(addRowActions);
  panel.querySelectorAll(".source-option").forEach(addReviewOptionSourceAction);
  renderHistory(panel);
}

const scoreSheetStatusByLabel = new Map([
  ["Sustentabilidade", "Não atende"],
  ["Negociação", "Não atende"],
  ["Recebimento definitivo", "Não atende"],
]);

const scoreSheetPointsByLabel = new Map([
  ["Regime de Execução", "+10"],
  ["Critério de Julgamento", "+12"],
  ["Escopo principal", "+10"],
  ["Vigência", "+8"],
  ["Sustentabilidade", "+0"],
  ["Negociação", "+0"],
  ["Recebimento definitivo", "+0"],
]);

function normalizeText(element) {
  return element?.textContent.replace(/\s+/g, " ").trim() || "";
}

function getFlatPanel(element) {
  const panel = element?.closest?.(".review-panel--flat");
  return panel?.dataset.variant === "flat" ? panel : null;
}

function getSelectedFlatCards(panel) {
  return [...panel.querySelectorAll("[data-flat-card].is-selected")];
}

function clearFlatSelection(panel) {
  panel.querySelectorAll("[data-flat-select]").forEach((input) => {
    input.checked = false;
  });
  panel.querySelectorAll("[data-flat-card].is-selected").forEach((card) => {
    card.classList.remove("is-selected");
  });
  updateFlatBatchBar(panel);
}

function updateFlatBatchBar(panel) {
  if (!panel) return;
  const bar = panel.querySelector("[data-flat-batch-bar]");
  if (!bar) return;

  panel.querySelectorAll("[data-flat-group]").forEach((group) => {
    const groupCards = [...group.querySelectorAll("[data-flat-card]")];
    const selectedCount = groupCards.filter((card) => card.classList.contains("is-selected")).length;
    const isFullySelected = groupCards.length > 0 && selectedCount === groupCards.length;
    const input = group.querySelector("[data-flat-group-select]");
    group.classList.toggle("is-selected", isFullySelected);
    if (input) {
      input.checked = isFullySelected;
      input.indeterminate = selectedCount > 0 && !isFullySelected;
    }
  });

  const selectedCards = getSelectedFlatCards(panel);
  const count = selectedCards.length;
  bar.hidden = count === 0;
  bar.querySelector("[data-flat-selection-count]").textContent = `${count} ${count === 1 ? "item selecionado" : "itens selecionados"}`;
  if (!count) return;

  const selectedGroups = selectedCards.map((card) => card.closest("[data-flat-group]")).filter(Boolean);
  const uniqueGroups = [...new Set(selectedGroups)];
  const allInsideOneGroup = uniqueGroups.length === 1 && selectedGroups.length === selectedCards.length;
  const allGroupCardsSelected = allInsideOneGroup
    && uniqueGroups[0].querySelectorAll("[data-flat-card]").length === selectedCards.length;
  const action = bar.querySelector("[data-flat-batch-action]");

  const hasGroupedCards = selectedGroups.length > 0;
  action.dataset.flatBatchAction = hasGroupedCards ? (allGroupCardsSelected ? "ungroup" : "remove") : "group";
  action.textContent = hasGroupedCards ? (allGroupCardsSelected ? "Desagrupar" : "Remover do grupo") : "Agrupar";
}

function setFlatCardSelected(card, isSelected) {
  const input = card.querySelector("[data-flat-select]");
  card.classList.toggle("is-selected", isSelected);
  if (input) input.checked = isSelected;
  updateFlatBatchBar(card.closest(".review-panel--flat"));
}

function setFlatGroupSelected(group, isSelected) {
  group.querySelectorAll("[data-flat-card]").forEach((card) => {
    const input = card.querySelector("[data-flat-select]");
    card.classList.toggle("is-selected", isSelected);
    if (input) input.checked = isSelected;
  });
  updateFlatBatchBar(group.closest(".review-panel--flat"));
}

function createFlatBatchBar(panel) {
  const bar = document.createElement("div");
  bar.className = "flat-batch-bar";
  bar.dataset.flatBatchBar = "";
  bar.hidden = true;
  bar.innerHTML = `
    <span data-flat-selection-count>0 itens selecionados</span>
    <button type="button" data-flat-batch-action="group">Agrupar</button>
    <button class="flat-batch-close" type="button" data-flat-clear-selection aria-label="Limpar seleção">×</button>
  `;
  panel.append(bar);
}

function createFlatGroup(panel, cards) {
  if (!cards.length) return;

  const group = document.createElement("article");
  group.className = "flat-summary-group";
  group.dataset.flatGroup = `flat-group-${++flatGroupCounter}`;
  group.innerHTML = `
    <header class="flat-group-header">
      <label class="flat-card-check flat-group-check" aria-label="Selecionar grupo">
        <input type="checkbox" data-flat-group-select />
        <span aria-hidden="true"></span>
      </label>
      <input class="flat-group-name" type="text" placeholder="Escolha um nome para esse grupo" aria-label="Nome do grupo" aria-keyshortcuts="Enter Escape" enterkeyhint="done" />
      <button class="flat-group-icon-btn" type="button" data-flat-group-toggle aria-label="Recolher grupo">
        <svg class="lucide-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m18 15-6-6-6 6" /></svg>
      </button>
      <button class="flat-group-icon-btn" type="button" data-flat-group-menu aria-label="Mais ações do grupo">
        <svg class="lucide-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8h.01" /><path d="M12 12h.01" /><path d="M12 16h.01" /></svg>
      </button>
      <div class="flat-group-menu" data-flat-group-menu-popover hidden>
        <button type="button" data-flat-ungroup>Desagrupar</button>
        <button class="is-danger" type="button" data-flat-delete-group>Excluir grupo</button>
      </div>
    </header>
    <div class="flat-group-body"></div>
  `;

  cards[0].insertAdjacentElement("beforebegin", group);
  const body = group.querySelector(".flat-group-body");
  cards.forEach((card) => {
    setFlatCardSelected(card, false);
    body.append(card);
  });
  updateFlatBatchBar(panel);
  requestAnimationFrame(() => {
    group.querySelector(".flat-group-name")?.focus();
  });
}

function ungroupFlatGroup(group) {
  const panel = group.closest(".review-panel--flat");
  const cards = [...group.querySelectorAll("[data-flat-card]")];
  cards.forEach((card) => {
    setFlatCardSelected(card, false);
    group.insertAdjacentElement("beforebegin", card);
  });
  group.remove();
  updateFlatBatchBar(panel);
}

function removeSelectedCardsFromGroups(panel, selectedCards) {
  const affectedGroups = [...new Set(selectedCards.map((card) => card.closest("[data-flat-group]")).filter(Boolean))];
  affectedGroups.forEach((group) => {
    selectedCards
      .filter((card) => card.closest("[data-flat-group]") === group)
      .reverse()
      .forEach((card) => {
        setFlatCardSelected(card, false);
        group.insertAdjacentElement("afterend", card);
      });

    if (!group.querySelector("[data-flat-card]")) group.remove();
  });
  updateFlatBatchBar(panel);
}

function runFlatBatchAction(panel) {
  const selectedCards = getSelectedFlatCards(panel);
  if (!selectedCards.length) return;

  const action = panel.querySelector("[data-flat-batch-action]")?.dataset.flatBatchAction || "group";
  if (action === "group") {
    createFlatGroup(panel, selectedCards);
    return;
  }

  if (action === "ungroup") {
    const group = selectedCards[0].closest("[data-flat-group]");
    if (group) ungroupFlatGroup(group);
    return;
  }

  removeSelectedCardsFromGroups(panel, selectedCards);
}

function createFlatSummary(panel) {
  panel.setAttribute("aria-label", "Resumo");
  panel.querySelector(".review-title").textContent = "Resumo";
  panel.querySelector("[data-workspace-tab='summary']").textContent = "Resumo";

  const body = panel.querySelector(".review-body");
  const objectCard = body.querySelector(".objeto-card");
  const rows = [{
    label: normalizeText(objectCard?.querySelector(".objeto-label")),
    value: normalizeText(objectCard?.querySelector(".objeto-value")),
  }].filter(({ label, value }) => label && value);

  body.querySelectorAll(".accordion").forEach((accordion) => {
    accordion.querySelectorAll(".sub-accordion-header").forEach((header) => {
      const subBody = header.nextElementSibling;
      if (!subBody?.classList.contains("sub-body")) return;

      const label = normalizeText(header.querySelector(".sub-label"));
      const value = [...subBody.querySelectorAll(".source-option strong")]
        .map((option) => normalizeText(option))
        .filter(Boolean)
        .join(" | ");

      if (label && value) rows.push({ label, value });
    });

    accordion.querySelectorAll(".accordion-row").forEach((row) => {
      const label = normalizeText(row.querySelector(".row-label"));
      const value = normalizeText(row.querySelector(".row-value"));
      if (label && value) rows.push({ label, value });
    });
  });

  body.querySelectorAll(".accordion").forEach((accordion) => accordion.remove());
  objectCard?.remove();

  const flatList = document.createElement("dl");
  flatList.className = "flat-summary-list";
  flatList.setAttribute("aria-label", "Informações do resumo");
  flatList.innerHTML = rows.map(({ label, value }, index) => `
    <div class="accordion-row flat-summary-row" data-flat-card data-flat-card-id="flat-card-${index}">
      <label class="flat-card-check" aria-label="Selecionar ${escapeHTML(label)}">
        <input type="checkbox" data-flat-select />
        <span aria-hidden="true"></span>
      </label>
      <div class="flat-card-content">
        <dt class="row-label">${escapeHTML(label)}</dt>
        <dd class="row-value">${escapeHTML(value)}</dd>
      </div>
    </div>
  `).join("");

  body.append(flatList);
  flatList.querySelectorAll(".accordion-row").forEach(addRowActions);
  createFlatBatchBar(panel);
}

function renderSheetPanelVariant(variant = "summary") {
  if (sheetPanel.dataset.variant === variant && sheetPanel.childElementCount) return;

  sheetPanel.innerHTML = "";
  sheetPanel.dataset.variant = variant;
  sheetPanel.classList.toggle("review-panel--score", variant === "score");
  sheetPanel.classList.toggle("review-panel--flat", variant === "flat");
  renderPanel(sheetPanel);

  if (variant === "flat") {
    createFlatSummary(sheetPanel);
    return;
  }

  if (variant !== "score") return;

  sheetPanel.setAttribute("aria-label", "Score");
  sheetPanel.querySelector(".review-title").textContent = "Score";
  sheetPanel.querySelector("[data-workspace-tab='summary']").textContent = "Score";

  const body = sheetPanel.querySelector(".review-body");
  const scoreCard = document.createElement("article");
  scoreCard.className = "objeto-card score-summary-card";
  scoreCard.innerHTML = `
    <div class="vivo-score-card">
      <div class="vivo-score-info">
        <span class="vivo-temperature vivo-temperature--morno">Morno</span>
        <strong>82/100</strong>
        <button class="vivo-score-help" type="button" data-vivo-score-help>Como isso é calculado?</button>
        <div class="score-warning-card">
          Itens em revisão não entram no cálculo. Revise todos para atualizar o score.
        </div>
      </div>
    </div>
  `;
  body.prepend(scoreCard);
  sheetPanel.insertAdjacentHTML("beforeend", renderVivoScoreModal("score-sheet-dialog-title"));

  const objectCard = body.querySelector(".objeto-card:not(.score-summary-card)");
  const valueCard = document.createElement("article");
  valueCard.className = "objeto-card";
  valueCard.innerHTML = `
    <h2 class="objeto-label">Valor global</h2>
    <p class="objeto-value">R$ 209.609,82</p>
  `;
  objectCard?.insertAdjacentElement("afterend", valueCard);

  sheetPanel.querySelectorAll(".accordion-row > .row-label").forEach((label) => {
    const labelText = label.textContent.trim();
    const status = scoreSheetStatusByLabel.get(labelText) || "Atende";
    const points = scoreSheetPointsByLabel.get(labelText) || "+10";
    label.innerHTML = `
      <span>${escapeHTML(labelText)}</span>
      <span class="score-row-meta">
        <span class="score-status-tag score-status-tag--${status === "Atende" ? "match" : "miss"}">${status}</span>
        <span class="score-points">${points}</span>
      </span>
    `;
  });
}

function actionIcon(name) {
  const icons = {
    copy: '<svg class="lucide-icon" viewBox="0 0 24 24" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>',
    edit: '<svg class="lucide-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>',
    link: '<svg class="lucide-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>',
  };
  return icons[name];
}

function addRowActions(row) {
  if (row.querySelector(".row-actions")) return;

  const actions = document.createElement("div");
  actions.className = "row-actions";
  actions.innerHTML = `
    <button class="row-action-btn" type="button" data-row-action="copy" aria-label="Copiar informação">${actionIcon("copy")}</button>
    <button class="row-action-btn" type="button" data-row-action="edit" aria-label="Editar informação">${actionIcon("edit")}</button>
    <button class="row-action-btn" type="button" data-row-action="link" aria-label="Abrir trecho do edital">${actionIcon("link")}</button>
  `;
  row.append(actions);
  updateRowSourceState(row);
}

function addReviewOptionSourceAction(option) {
  if (option.querySelector("[data-review-source]")) return;

  const button = document.createElement("button");
  button.className = "review-source-btn";
  button.type = "button";
  button.dataset.reviewSource = "";
  button.setAttribute("aria-label", "Abrir trecho do edital");
  button.innerHTML = actionIcon("link");
  option.append(button);
}

function escapeHTML(value) {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[char]));
}

function getDivergenceOptions(body) {
  return [...(body?.querySelectorAll(".source-option strong") || [])]
    .map((item) => item.textContent.trim())
    .filter(Boolean);
}

const sampleHistoryItems = [
  {
    label: "Prazo de entrega",
    kind: "selected",
    choice: "Entrega e conclusão dos serviços em até 30 dias corridos.",
    source: true,
    options: [
      "Entrega e conclusão dos serviços em até 30 dias corridos.",
      "Recebimento definitivo em até 10 dias corridos após o recebimento provisório.",
    ],
  },
  {
    label: "Quantidade de licenças",
    kind: "selected",
    choice: "20 licenças de direito de uso do JetBrains All Products Pack.",
    source: true,
    options: [
      "20 licenças de direito de uso do JetBrains All Products Pack.",
      "20 unidades de subscrição por 36 meses.",
    ],
  },
  {
    label: "Critério de julgamento",
    kind: "selected",
    choice: "Menor preço global.",
    source: true,
    options: [
      "Menor preço global.",
      "Menor preço por item.",
    ],
  },
  {
    label: "Vigência da contratação",
    kind: "manual",
    choice: "36 meses contados do recebimento definitivo das licenças.",
    source: true,
    options: [
      "36 meses contados da assinatura do contrato.",
      "3 anos contados do recebimento definitivo das licenças.",
    ],
  },
  {
    label: "Suporte técnico",
    kind: "manual",
    choice: "Suporte técnico oficial durante todo o período da subscrição.",
    source: false,
    options: [
      "Suporte técnico pelo período de 36 meses.",
      "Suporte técnico conforme disponibilidade do fabricante.",
    ],
  },
];

function renderHistoryDecisionIcon(state) {
  const icons = {
    selected: `<circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path>`,
    rejected: `<circle cx="12" cy="12" r="10"></circle><path d="m15 9-6 6"></path><path d="m9 9 6 6"></path>`,
    pending: `<circle cx="12" cy="12" r="10"></circle><path d="M12 8v4"></path><path d="M12 16h.01"></path>`,
  };

  return `
    <svg class="history-decision-icon" aria-hidden="true" viewBox="0 0 24 24">
      ${icons[state] || icons.pending}
    </svg>
  `;
}

function renderHistoryItem({ label, choice = "", status = "resolved", kind, options = [] }) {
  const isResolved = status === "resolved";
  const normalizedOptions = isResolved
    ? (options.includes(choice) ? options : [choice, ...options])
    : options;
  const helperText = kind === "manual" ? "Informação adicionada" : "Opção escolhida";

  return `
    <article class="history-item">
      <div class="history-item-header">
        <strong>${escapeHTML(label)}</strong>
        <span class="history-status ${isResolved ? "is-resolved" : "is-pending"}">
          ${isResolved ? "Resolvida" : "Pendente"}
        </span>
      </div>
      <div class="history-options" aria-label="${escapeHTML(helperText)}">
        ${normalizedOptions.map((option) => {
          const selected = isResolved && option === choice;
          const state = selected ? "selected" : (isResolved ? "rejected" : "pending");
          return `
            <div class="history-option is-${state}">
              ${renderHistoryDecisionIcon(state)}
              <div>
                <span>${isResolved ? (selected ? helperText : "Opção descartada") : "Opção aguardando revisão"}</span>
                <p>${escapeHTML(option)}</p>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    </article>
  `;
}

function renderHistory(panel) {
  const popover = panel.querySelector("[data-history-popover]");
  if (!popover) return;

  const savedItems = [...panel.querySelectorAll(".sub-accordion-header[data-history-status='resolved']")]
    .map((header) => {
      const label = header.querySelector(".sub-label")?.textContent.trim() || "Informação";
      const choice = header.dataset.historyChoice || "";
      const source = header.dataset.historySource === "true";
      const kind = header.dataset.historyKind || "selected";
      const options = getDivergenceOptions(header.nextElementSibling);

      return { label, choice, source, kind, options };
    });

  const pendingItems = [...panel.querySelectorAll(".sub-accordion-header:not([data-history-status='resolved'])")]
    .filter((header) => !header.hidden)
    .map((header) => {
      const label = header.querySelector(".sub-label")?.textContent.trim() || "Informação";
      const options = getDivergenceOptions(header.nextElementSibling);

      return { label, status: "pending", options };
    })
    .filter((item) => item.options.length);

  const items = [...pendingItems, ...savedItems, ...sampleHistoryItems]
    .slice(0, 7)
    .map(renderHistoryItem)
    .join("");

  popover.innerHTML = `
    <div class="history-title">Histórico de divergências</div>
    ${items}
  `;
}

function toggleHistory(button) {
  const panel = button.closest("[data-panel]");
  const popover = panel?.querySelector("[data-history-popover]");
  if (!popover) return;

  const willOpen = popover.hidden;
  document.querySelectorAll("[data-history-popover]").forEach((item) => {
    item.hidden = true;
  });
  if (willOpen) {
    renderHistory(panel);
    popover.hidden = false;
  }
}

function rowHasSource(row) {
  if (!row || row.dataset.noSource === "true") return false;
  if (row.dataset.sourceText) return true;

  const label = row.querySelector(".row-label")?.textContent.trim();
  return sourceHighlightTargets.some((target) => target.label === label);
}

function updateRowSourceState(row) {
  const linkButton = row?.querySelector('[data-row-action="link"]');
  if (!linkButton) return;

  const hasSource = rowHasSource(row);
  row.dataset.sourceStatus = hasSource ? "linked" : "none";
  linkButton.classList.toggle("is-missing-source", !hasSource);
  linkButton.classList.toggle("has-source", hasSource);
  linkButton.setAttribute(
    "aria-label",
    hasSource ? "Abrir trecho do edital" : "Sem trecho vinculado"
  );
}

function createResolvedRow(label, value, options = {}) {
  const row = document.createElement("div");
  row.className = "accordion-row";
  if (options.noSource) row.dataset.noSource = "true";
  if (options.sourceText) row.dataset.sourceText = options.sourceText;
  if (options.sourceSearchText) row.dataset.sourceSearchText = options.sourceSearchText;
  if (options.sourceDocument) row.dataset.sourceDocument = options.sourceDocument;
  row.innerHTML = `<dt class="row-label">${label}</dt><dd class="row-value">${value}</dd>`;
  addRowActions(row);
  return row;
}

function setExpanded(button, isOpen) {
  const header = button.closest(".sub-accordion-header") || button;
  const body = header.nextElementSibling;
  const chevron = header.querySelector(".chevron, .sub-chevron");

  header.querySelectorAll("[data-sub-toggle]").forEach((toggle) => {
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
  if (button.matches("[data-accordion-toggle]")) {
    button.setAttribute("aria-expanded", String(isOpen));
  }
  header.classList.toggle("is-open", isOpen);
  body.classList.toggle("is-open", isOpen);
  chevron?.classList.toggle("is-open", isOpen);
}

function togglePanel(button) {
  const header = button.closest(".sub-accordion-header") || button;
  const body = header.nextElementSibling;
  const isOpen = body.classList.contains("is-open");

  setExpanded(button, !isOpen);
}

function openReview(button) {
  const header = button.closest(".sub-accordion-header");
  const body = header?.nextElementSibling;
  const toggle = header?.querySelector("[data-sub-toggle]");
  if (!header || !body || !toggle) return;

  if (button.classList.contains("is-resolved")) return;

  if (body.classList.contains("is-reviewing")) {
    cancelReview(button);
    return;
  }

  if (!body.classList.contains("is-open")) {
    setExpanded(toggle, true);
  }

  header.classList.add("is-reviewing");
  body.classList.add("is-reviewing");
  const radios = body.querySelectorAll(".source-option [data-review-radio]");
  if (radios.length && ![...radios].some((radio) => radio.checked)) {
    radios[0].checked = true;
  }
  button.textContent = "Cancelar";
}

function showNewOption(button) {
  const body = button.closest(".sub-body");
  const editor = body?.querySelector(".review-editor");
  if (!editor) return;

  clearActiveSourceContext();
  editor.hidden = false;
  button.hidden = true;
  button.closest(".review-footer").hidden = true;
  const radioName = body.querySelector("[data-review-radio]")?.name || `review-${Date.now()}`;
  const radio = document.createElement("input");
  radio.type = "radio";
  radio.name = radioName;
  radio.checked = true;
  radio.dataset.reviewRadio = "";
  editor.prepend(radio);
  editor.classList.add("has-radio");
  editor.querySelector("textarea")?.focus();
}

function resetNewOption(body) {
  const editor = body?.querySelector(".review-editor");
  if (!editor) return;

  editor.querySelector("[data-review-radio]")?.remove();
  editor.hidden = true;
  editor.classList.remove("has-radio");

  const textarea = editor.querySelector("textarea");
  if (textarea) {
    textarea.value = "";
    textarea.removeAttribute("aria-invalid");
  }
  editor.querySelector(".review-editor-error")?.remove();
  delete editor.dataset.sourceText;
  delete editor.dataset.sourceSearchText;
  delete editor.dataset.sourceDocument;

  const linkButton = editor.querySelector("[data-link-source]");
  if (linkButton) {
    linkButton.classList.remove("is-linked", "is-selecting");
    linkButton.textContent = "Vincular trecho do edital (opcional)";
    linkButton.setAttribute("aria-label", "Vincular trecho do edital");
  }

  const addButton = body.querySelector("[data-add-option]");
  if (addButton) {
    addButton.hidden = false;
    addButton.disabled = false;
    addButton.closest(".review-footer").hidden = false;
  }
}

function linkSource(button) {
  const panel = button.closest("[data-panel]");
  const editor = button.closest(".review-editor");
  const sourceView = panel?.querySelector("[data-source-view]");
  if (!panel || !sourceView || !editor) return;

  if (editor.dataset.sourceText) {
    openSourceTarget(panel, {
      documentKey: editor.dataset.sourceDocument || "edital",
      text: editor.dataset.sourceSearchText || editor.dataset.sourceText,
    });
    activeManualSourceEditor = editor;
    activeSourceView = sourceView;
    button.classList.add("is-linked");
    button.textContent = "Trecho vinculado";
    button.setAttribute("aria-label", "Abrir trecho vinculado");
    return;
  }

  clearActiveSourceContext();
  activeManualSourceEditor = editor;
  activeSourceView = sourceView;
  sourceView.dataset.highlightText = "";
  renderSourceDocument(sourceView, "edital");
  panel.classList.add("is-source-open");
  panel.parentElement?.classList.toggle("is-source-open", panel.dataset.panel === "sheet");
  appShell.classList.toggle("source-sidebar-open", panel.dataset.panel === "sidebar");
  sourceView.hidden = false;
  sourceView.querySelector("[data-source-document]").value = "edital";
  sourceView.querySelector(".source-body")?.scrollTo({ top: 0, behavior: "auto" });
  updateSidebarWorkspaceMode();
  if (panel.dataset.panel === "sidebar" && panel.classList.contains("is-compact-workspace")) {
    setWorkspaceTab(panel, "source");
  }

  button.classList.remove("is-linked");
  button.classList.add("is-selecting");
  button.textContent = "Selecione um trecho no edital";
  button.setAttribute("aria-label", "Selecionar trecho do edital");
}

function setManualInfoError(editor, message) {
  const textarea = editor?.querySelector("textarea");
  if (!editor || !textarea) return;

  textarea.setAttribute("aria-invalid", "true");
  let error = editor.querySelector(".review-editor-error");
  if (!error) {
    error = document.createElement("span");
    error.className = "review-editor-error";
    textarea.after(error);
  }
  error.textContent = message;
  textarea.focus();
}

function clearManualInfoError(editor) {
  editor?.querySelector("textarea")?.removeAttribute("aria-invalid");
  editor?.querySelector(".review-editor-error")?.remove();
}

function cancelReview(button) {
  const header = button.closest(".sub-accordion-header") || button.closest(".sub-body")?.previousElementSibling;
  const body = header?.nextElementSibling;
  if (!body || !header) return;

  body.classList.remove("is-reviewing");
  header.classList.remove("is-reviewing");

  resetNewOption(body);

  body.querySelectorAll(".source-option [data-review-radio]").forEach((radio, index) => {
    radio.checked = index === 0;
  });

  const reviewButton = header.querySelector(".review-btn");
  if (reviewButton) reviewButton.textContent = "Revisar";
}

function confirmReview(button) {
  const header = button.closest(".sub-accordion-header") || button.closest(".sub-body")?.previousElementSibling;
  const body = header?.nextElementSibling;
  if (!body || !header) return;

  const selected = body.querySelector("[data-review-radio]:checked");
  const editor = body.querySelector(".review-editor");
  const manualText = editor?.querySelector("textarea")?.value.trim();
  const isManualSelected = Boolean(selected?.closest(".review-editor"));
  if (isManualSelected && !manualText) {
    setManualInfoError(editor, "Preencha a nova informação.");
    return;
  }
  clearManualInfoError(editor);

  const selectedOption = selected?.closest(".source-option");
  const selectedText = manualText || selectedOption?.querySelector("strong")?.textContent || "Informação resolvida";
  const resolvedLabel = header.querySelector(".sub-label")?.textContent || "Informação";
  const isManualInformation = Boolean(manualText);
  const manualSourceOptions = isManualInformation && editor?.dataset.sourceText
    ? {
        sourceText: editor.dataset.sourceText,
        sourceSearchText: editor.dataset.sourceSearchText,
        sourceDocument: editor.dataset.sourceDocument,
      }
    : { noSource: isManualInformation };

  const list = body.nextElementSibling;
  if (list?.classList.contains("accordion-list")) {
    list.prepend(createResolvedRow(resolvedLabel, selectedText, manualSourceOptions));
  }

  header.dataset.historyStatus = "resolved";
  header.dataset.historyChoice = selectedText;
  header.dataset.historySource = String(Boolean(selectedOption || manualSourceOptions.sourceText));
  header.dataset.historyKind = isManualInformation ? "manual" : "selected";
  renderHistory(header.closest("[data-panel]"));
  header.hidden = true;
  body.hidden = true;
  body.classList.remove("is-open", "is-reviewing");
  header.classList.remove("is-open", "is-reviewing");
  showToast("Divergência resolvida!");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");

  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2000);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function setSidebarWidth(mode, value) {
  const nextValue = mode === "source"
    ? clamp(value, 64, 78)
    : clamp(value, 34, 45);

  sidebarWidth[mode] = nextValue;
  appShell.style.setProperty(
    mode === "source" ? "--sidebar-source-width" : "--sidebar-width",
    `${nextValue}vw`
  );
  updateSidebarWorkspaceMode();
}

function setWorkspaceTab(panel, tab) {
  if (!panel) return;

  const showSource = tab === "source";
  panel.classList.toggle("show-source-tab", showSource);
  panel.querySelectorAll("[data-workspace-tab]").forEach((button) => {
    const isActive = button.dataset.workspaceTab === tab;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });
}

function updateSidebarWorkspaceMode() {
  const wasCompact = sidebarPanel.classList.contains("is-compact-workspace");
  if (!sidebarPanel.classList.contains("is-source-open")) {
    sidebarPanel.classList.remove("is-compact-workspace", "show-source-tab");
    setWorkspaceTab(sidebarPanel, "summary");
    return;
  }

  const isCompact = sidebarShell.getBoundingClientRect().width < 760;
  sidebarPanel.classList.toggle("is-compact-workspace", isCompact);
  if (isCompact && !wasCompact) {
    setWorkspaceTab(sidebarPanel, activeSourceView ? "source" : "summary");
  }
  if (!isCompact) {
    sidebarPanel.classList.remove("show-source-tab");
    setWorkspaceTab(sidebarPanel, "summary");
  }
}

function resizeSidebarFromPointer(event) {
  if (!appShell.classList.contains("has-sidebar")) return;

  const widthPercent = ((window.innerWidth - event.clientX) / window.innerWidth) * 100;
  setSidebarWidth(sidebarResizeMode || (appShell.classList.contains("source-sidebar-open") ? "source" : "summary"), widthPercent);
}

function startSidebarResize(event) {
  event.preventDefault();
  sidebarResizeMode = appShell.classList.contains("source-sidebar-open") ? "source" : "summary";
  appShell.classList.add("is-resizing-sidebar");
  sidebarResizeHandle?.setPointerCapture?.(event.pointerId);
  resizeSidebarFromPointer(event);
}

function stopSidebarResize(event) {
  appShell.classList.remove("is-resizing-sidebar");
  sidebarResizeMode = null;
  sidebarResizeHandle?.releasePointerCapture?.(event.pointerId);
}

function positionTooltip(anchor) {
  const spacing = 8;
  const viewportPadding = 8;
  const anchorRect = anchor.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();

  let left = anchorRect.left + anchorRect.width / 2 - tooltipRect.width / 2;
  left = Math.max(viewportPadding, Math.min(left, window.innerWidth - tooltipRect.width - viewportPadding));

  let top = anchorRect.top - tooltipRect.height - spacing;
  if (top < viewportPadding) {
    top = anchorRect.bottom + spacing;
  }
  top = Math.max(viewportPadding, Math.min(top, window.innerHeight - tooltipRect.height - viewportPadding));

  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
}

function showTooltip(anchor) {
  const label = anchor.getAttribute("aria-label");
  if (!label) return;

  tooltip.textContent = label;
  tooltip.classList.add("is-visible");
  positionTooltip(anchor);
}

function hideTooltip() {
  tooltip.classList.remove("is-visible");
}

function renderSourceDocument(sourceView, documentKey = "edital") {
  const card = sourceView.querySelector("[data-source-card]");
  const document = sourceDocuments[documentKey] || sourceDocuments.edital;
  if (!card) return;

  card.innerHTML = document.pages
    .map((paragraphs, index) => `
      <section class="source-page" aria-label="Página ${index + 1}">
        ${buildSourcePageParagraphs(documentKey, paragraphs, index).map((paragraph) => {
          if (paragraph.startsWith(SOURCE_TITLE_MARK)) return `<h3 class="source-section-title">${paragraph.slice(SOURCE_TITLE_MARK.length)}</h3>`;
          if (paragraph.startsWith(SOURCE_SUBTITLE_MARK)) return `<h4 class="source-subsection-title">${paragraph.slice(SOURCE_SUBTITLE_MARK.length)}</h4>`;
          return `<p>${paragraph}</p>`;
        }).join("")}
      </section>
    `)
    .join("");
  card.dataset.documentKey = documentKey;
}

function hideSourceSelectionTooltip() {
  sourceSelectionTooltip.classList.remove("is-visible");
}

function markScrollContainerActive(container) {
  if (!container?.matches?.(".review-body, .source-body")) return;

  container.classList.add("is-scrolling");
  window.clearTimeout(scrollHideTimers.get(container));
  scrollHideTimers.set(
    container,
    window.setTimeout(() => container.classList.remove("is-scrolling"), 700)
  );
}

function clearSourceSelection() {
  sourceSelectionRange = null;
  hideSourceSelectionTooltip();
  window.getSelection()?.removeAllRanges();
}

function hideSourceCursorTooltip() {
  sourceCursorTooltip.classList.remove("is-visible");
}

function findSelectedManualSourceEditor(panel) {
  if (!panel) return null;

  return [...panel.querySelectorAll(".review-editor.has-radio")].find((editor) => {
    const radio = editor.querySelector("[data-review-radio]");
    return !editor.hidden && radio?.checked;
  }) || null;
}

function ensureManualSourceContext(sourceView) {
  if (activeSourceRow || activeManualSourceEditor) return;

  const panel = sourceView?.closest("[data-panel]");
  const editor = findSelectedManualSourceEditor(panel);
  if (!editor) return;

  activeManualSourceEditor = editor;
  activeSourceView = sourceView;
}

function getCaretRangeFromPoint(x, y) {
  if (document.caretRangeFromPoint) {
    return document.caretRangeFromPoint(x, y);
  }

  if (document.caretPositionFromPoint) {
    const position = document.caretPositionFromPoint(x, y);
    if (!position) return null;

    const range = document.createRange();
    range.setStart(position.offsetNode, position.offset);
    range.collapse(true);
    return range;
  }

  return null;
}

function findTextNodeNearCaret(range) {
  const container = range?.startContainer;
  if (!container) return null;
  if (container.nodeType === Node.TEXT_NODE) return container;

  const child = container.childNodes[range.startOffset];
  if (child?.nodeType === Node.TEXT_NODE) return child;

  const previousChild = container.childNodes[range.startOffset - 1];
  if (previousChild?.nodeType === Node.TEXT_NODE) return previousChild;

  return null;
}

function pointerHitsTextRange(textNode, start, end, x, y) {
  if (start < 0 || end > textNode.length || start === end) return false;

  const range = document.createRange();
  range.setStart(textNode, start);
  range.setEnd(textNode, end);
  const rects = [...range.getClientRects()];
  range.detach?.();

  return rects.some((rect) => {
    const tolerance = 2;
    return (
      x >= rect.left - tolerance
      && x <= rect.right + tolerance
      && y >= rect.top - tolerance
      && y <= rect.bottom + tolerance
    );
  });
}

function pointerIsOverSourceText(event) {
  if (!event.target.closest(".source-card p")) return false;

  const range = getCaretRangeFromPoint(event.clientX, event.clientY);
  const textNode = findTextNodeNearCaret(range);
  if (!textNode || !textNode.parentElement?.closest(".source-card p")) return false;

  const offset = range.startContainer === textNode ? range.startOffset : textNode.length;
  return (
    pointerHitsTextRange(textNode, offset - 1, offset, event.clientX, event.clientY)
    || pointerHitsTextRange(textNode, offset, offset + 1, event.clientX, event.clientY)
  );
}

function showSourceCursorTooltip(event) {
  ensureManualSourceContext(event.target.closest("[data-source-view]"));

  if ((!activeSourceRow && !activeManualSourceEditor) || !pointerIsOverSourceText(event)) {
    hideSourceCursorTooltip();
    return;
  }

  const selection = window.getSelection();
  if (selectionIsInsideSource(selection) || sourceSelectionTooltip.classList.contains("is-visible")) {
    hideSourceCursorTooltip();
    return;
  }

  const spacing = 8;
  sourceCursorTooltip.textContent = (
    (activeSourceRow && rowHasSource(activeSourceRow))
    || activeManualSourceEditor?.dataset.sourceText
  )
    ? "Selecione um novo trecho"
    : "Selecione um trecho";
  sourceCursorTooltip.style.left = `${Math.min(event.clientX + spacing, window.innerWidth - sourceCursorTooltip.offsetWidth - 8)}px`;
  sourceCursorTooltip.style.top = `${Math.min(event.clientY + spacing, window.innerHeight - sourceCursorTooltip.offsetHeight - 8)}px`;
  sourceCursorTooltip.classList.add("is-visible");
}

function positionSourceSelectionTooltip(range) {
  const rect = range.getBoundingClientRect();
  const tooltipRect = sourceSelectionTooltip.getBoundingClientRect();
  const viewportPadding = 8;
  const spacing = 8;

  let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
  left = Math.max(viewportPadding, Math.min(left, window.innerWidth - tooltipRect.width - viewportPadding));

  let top = rect.bottom + spacing;
  if (top + tooltipRect.height > window.innerHeight - viewportPadding) {
    top = rect.top - tooltipRect.height - spacing;
  }
  top = Math.max(viewportPadding, Math.min(top, window.innerHeight - tooltipRect.height - viewportPadding));

  sourceSelectionTooltip.style.left = `${left}px`;
  sourceSelectionTooltip.style.top = `${top}px`;
}

function showSourceSelectionTooltip(range) {
  sourceSelectionRange = range.cloneRange();
  sourceSelectionTooltip.textContent = activeSourceRow || activeManualSourceEditor
    ? "Usar este trecho"
    : "Adicionar como fonte";
  hideSourceCursorTooltip();
  sourceSelectionTooltip.classList.add("is-visible");
  positionSourceSelectionTooltip(range);
}

function selectionIsInsideSource(selection) {
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return false;
  const range = selection.getRangeAt(0);
  const sourceCard = range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
    ? range.commonAncestorContainer.closest?.("[data-source-card]")
    : range.commonAncestorContainer.parentElement?.closest("[data-source-card]");
  return Boolean(sourceCard);
}

function nodeIsInsideRange(range, node) {
  if (range.intersectsNode) return range.intersectsNode(node);

  const nodeRange = document.createRange();
  nodeRange.selectNodeContents(node);
  const startsBeforeNodeEnd = range.compareBoundaryPoints(Range.START_TO_END, nodeRange) < 0;
  const endsAfterNodeStart = range.compareBoundaryPoints(Range.END_TO_START, nodeRange) > 0;
  nodeRange.detach?.();
  return startsBeforeNodeEnd && endsAfterNodeStart;
}

function highlightSelectionRange(sourceView, range) {
  const sourceCard = sourceView?.querySelector("[data-source-card]");
  if (!sourceCard || !range) return false;

  const textNodes = [];
  const walker = document.createTreeWalker(sourceCard, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.textContent.trim() && nodeIsInsideRange(range, node)) {
      textNodes.push(node);
    }
  }

  textNodes.reverse().forEach((node) => {
    const start = node === range.startContainer ? range.startOffset : 0;
    const end = node === range.endContainer ? range.endOffset : node.length;
    if (start >= end) return;

    const after = node.splitText(end);
    const highlighted = node.splitText(start);
    const mark = document.createElement("mark");
    mark.className = "source-highlight";
    highlighted.parentNode.insertBefore(mark, after);
    mark.append(highlighted);
  });

  return textNodes.length > 0;
}

function addSelectionAsSource() {
  const selection = window.getSelection();
  const range = sourceSelectionRange;
  if (!range) return;
  const selectedText = range.toString().trim();
  const sourceView = activeSourceView || (
    range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
      ? range.commonAncestorContainer.closest?.("[data-source-view]")
      : range.commonAncestorContainer.parentElement?.closest("[data-source-view]")
  );
  ensureManualSourceContext(sourceView);
  const sourceSearchText = getSourceSearchText(selectedText);

  try {
    clearSourceHighlight(sourceView);
    const highlightedSelection = highlightSelectionRange(sourceView, range);
    const highlight = sourceView?.querySelector(".source-highlight");
    if (highlightedSelection && highlight) {
      scrollSourceHighlightIntoView(sourceView, highlight);
    } else if (sourceSearchText) {
      applySourceHighlight(sourceView, sourceSearchText);
    }
  } catch {
    if (sourceSearchText) applySourceHighlight(sourceView, sourceSearchText);
  }

  if (activeSourceRow && selectedText) {
    const select = sourceView?.querySelector("[data-source-document]");
    activeSourceRow.dataset.sourceText = selectedText;
    activeSourceRow.dataset.sourceSearchText = sourceSearchText;
    activeSourceRow.dataset.sourceDocument = select?.value || "edital";
    delete activeSourceRow.dataset.noSource;
    sourceView.dataset.highlightText = sourceSearchText;
    updateRowSourceState(activeSourceRow);
  }

  if (activeManualSourceEditor && selectedText) {
    const select = sourceView?.querySelector("[data-source-document]");
    const linkButton = activeManualSourceEditor.querySelector("[data-link-source]");
    activeManualSourceEditor.dataset.sourceText = selectedText;
    activeManualSourceEditor.dataset.sourceSearchText = sourceSearchText;
    activeManualSourceEditor.dataset.sourceDocument = select?.value || "edital";
    sourceView.dataset.highlightText = sourceSearchText;
    if (linkButton) {
      linkButton.classList.remove("is-selecting");
      linkButton.classList.add("is-linked");
      linkButton.textContent = "Trecho vinculado";
      linkButton.setAttribute("aria-label", "Abrir trecho vinculado");
    }
  }

  selection?.removeAllRanges();
  sourceSelectionRange = null;
  hideSourceSelectionTooltip();
  showToast(activeSourceRow || activeManualSourceEditor ? "Trecho vinculado!" : "Trecho adicionado como fonte!");
}

async function writeClipboard(text) {
  const fallbackCopy = () => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "-9999px";
    document.body.append(textarea);
    textarea.select();

    try {
      return document.execCommand("copy");
    } finally {
      textarea.remove();
    }
  };

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall back below for file:// and browsers that block the async clipboard API.
  }

  return fallbackCopy();
}

async function copyContent() {
  const text = !sheetPanel.hidden && sheetPanel.dataset.variant === "score"
    ? scoreSheetCopyText
    : (!sheetPanel.hidden && sheetPanel.dataset.variant === "flat" ? flatCopyText : copyText);

  if (await writeClipboard(text)) {
    showToast("Conteúdo copiado!");
  } else {
    showToast("Não foi possível copiar.");
  }
}

function startRowEdit(row) {
  if (!row || row.classList.contains("is-editing")) return;

  const valueElement = row.querySelector(".row-value");
  const currentValue = valueElement?.textContent.trim() || "";
  row.dataset.originalValue = currentValue;
  row.classList.add("is-editing");

  const textarea = document.createElement("textarea");
  textarea.className = "row-edit-input";
  textarea.rows = 3;
  textarea.value = currentValue;
  valueElement.hidden = true;
  valueElement.after(textarea);

  const sourceLink = document.createElement(rowHasSource(row) ? "button" : "span");
  sourceLink.className = "row-edit-source-link";
  sourceLink.textContent = rowHasSource(row) ? "Trecho vinculado" : "Sem trecho vinculado";
  if (sourceLink.tagName === "BUTTON") {
    sourceLink.type = "button";
    sourceLink.dataset.rowEditSource = "";
    sourceLink.setAttribute("aria-label", "Abrir trecho do edital");
  }
  const controls = document.createElement("div");
  controls.className = "row-edit-actions";
  controls.innerHTML = `
    <button class="row-edit-btn row-edit-btn--ghost" type="button" data-cancel-edit>Cancelar</button>
    <button class="row-edit-btn" type="button" data-save-edit>Salvar</button>
  `;
  const footer = document.createElement("div");
  footer.className = "row-edit-footer";
  footer.append(sourceLink, controls);
  row.append(footer);
  textarea.focus();
  textarea.select();
}

function setRowEditError(row, message) {
  const textarea = row?.querySelector(".row-edit-input");
  if (!row || !textarea) return;

  textarea.setAttribute("aria-invalid", "true");
  let error = row.querySelector(".row-edit-error");
  if (!error) {
    error = document.createElement("span");
    error.className = "row-edit-error";
    textarea.after(error);
  }
  error.textContent = message;
  textarea.focus();
}

function clearRowEditError(row) {
  row?.querySelector(".row-edit-input")?.removeAttribute("aria-invalid");
  row?.querySelector(".row-edit-error")?.remove();
}

function closeRowEdit(row, shouldSave) {
  if (!row) return;

  const valueElement = row.querySelector(".row-value");
  const textarea = row.querySelector(".row-edit-input");
  const nextValue = textarea?.value.trim();
  const hadSource = rowHasSource(row);

  if (shouldSave && !nextValue) {
    setRowEditError(row, "Preencha a informação.");
    return;
  }

  if (shouldSave && nextValue && valueElement) {
    valueElement.textContent = nextValue;
    showToast(hadSource ? "Informação atualizada. Fonte mantida!" : "Informação atualizada!");
  }

  clearRowEditError(row);
  valueElement.hidden = false;
  textarea?.remove();
  row.querySelector(".row-edit-footer")?.remove();
  row.classList.remove("is-editing");
  delete row.dataset.originalValue;
}

function cancelActiveInlineState() {
  if (sourceSelectionRange || sourceSelectionTooltip.classList.contains("is-visible")) {
    clearSourceSelection();
    return true;
  }

  const editingRow = document.querySelector(".accordion-row.is-editing");
  if (editingRow) {
    closeRowEdit(editingRow, false);
    return true;
  }

  const reviewingBody = document.querySelector(".sub-body.is-reviewing");
  if (reviewingBody) {
    cancelReview(reviewingBody);
    return true;
  }

  if (activeSourceRow) {
    clearActiveSourceContext();
    return true;
  }

  return false;
}

async function handleRowAction(button) {
  const row = button.closest(".accordion-row");
  const value = row?.querySelector(".row-value")?.textContent.trim();
  const action = button.dataset.rowAction;

  if (action === "copy") {
    if (await writeClipboard(value || "")) {
      showToast("Valor copiado!");
    } else {
      showToast("Não foi possível copiar.");
    }
  }

  if (action === "edit") startRowEdit(row);
  if (action === "link") {
    openSourceView(button);
    return;
  }

  clearActiveSourceContext();
}

function findReviewOptionSourceTarget(option) {
  const text = option?.querySelector("strong")?.textContent.trim() || "";
  const sourceLabel = option?.querySelector("small")?.textContent || "";
  const documentKey = sourceLabel.includes("Termo") ? "termo" : "edital";

  if (text.includes("Entrega e conclusão")) {
    return {
      documentKey: "termo",
      text: "Prazo máximo para entrega e conclusão dos serviços de instalação e configuração: até 30 dias corridos",
    };
  }

  if (text.includes("Recebimento definitivo")) {
    return {
      documentKey: "termo",
      text: "O recebimento definitivo ocorrerá em até 10 dias corridos após o recebimento provisório",
    };
  }

  if (text.includes("20 licenças de direito")) {
    return {
      documentKey: "termo",
      text: "20 licenças de direito de uso de programa de computador JetBrains All Products Pack",
    };
  }

  if (text.includes("20 unidades de subscrição")) {
    return {
      documentKey: "termo",
      text: "Item 1: Software All Products Pack - subscrição de 36 meses. CATMAT 27502. Unidade de medida: unidade. Quantidade: 20.",
    };
  }

  return {
    documentKey,
    text: getSourceSearchText(text),
  };
}

function scrollToSourceHighlight(sourceView) {
  const sourceBody = sourceView.querySelector(".source-body");
  sourceBody?.scrollTo({ top: 0, behavior: "auto" });
  const scrollToHighlight = () => applySourceHighlight(sourceView, sourceView.dataset.highlightText);
  requestAnimationFrame(() => {
    requestAnimationFrame(scrollToHighlight);
  });
  window.setTimeout(scrollToHighlight, 380);
}

function openSourceTarget(panel, target) {
  const sourceView = panel?.querySelector("[data-source-view]");
  if (!panel || !sourceView) return;

  const select = sourceView.querySelector("[data-source-document]");
  if (select) select.value = target.documentKey || "edital";
  clearActiveSourceContext({ clearHighlight: false });
  sourceView.dataset.highlightText = target.text || "";
  renderSourceDocument(sourceView, select?.value || target.documentKey || "edital");
  panel.classList.add("is-source-open");
  panel.parentElement?.classList.toggle("is-source-open", panel.dataset.panel === "sheet");
  appShell.classList.toggle("source-sidebar-open", panel.dataset.panel === "sidebar");
  sourceView.hidden = false;
  updateSidebarWorkspaceMode();
  if (panel.dataset.panel === "sidebar" && panel.classList.contains("is-compact-workspace")) {
    setWorkspaceTab(panel, "source");
  }
  scrollToSourceHighlight(sourceView);
}

function openReviewOptionSource(button) {
  const option = button.closest(".source-option");
  const panel = button.closest("[data-panel]");
  openSourceTarget(panel, findReviewOptionSourceTarget(option));
}

function openSourceView(button) {
  const panel = button.closest("[data-panel]");
  const row = button.closest(".accordion-row");
  const sourceView = panel?.querySelector("[data-source-view]");
  if (!panel || !sourceView) return;

  const target = findSourceHighlightTarget(row);
  const select = sourceView.querySelector("[data-source-document]");
  if (select) select.value = target.documentKey || "edital";
  sourceView.dataset.highlightText = target.text || "";
  setActiveSourceRow(row, sourceView);
  renderSourceDocument(sourceView, select?.value || target.documentKey || "edital");
  panel.classList.add("is-source-open");
  panel.parentElement?.classList.toggle("is-source-open", panel.dataset.panel === "sheet");
  appShell.classList.toggle("source-sidebar-open", panel.dataset.panel === "sidebar");
  sourceView.hidden = false;
  updateSidebarWorkspaceMode();
  if (panel.dataset.panel === "sidebar" && panel.classList.contains("is-compact-workspace")) {
    setWorkspaceTab(panel, "source");
  }

  scrollToSourceHighlight(sourceView);
}

function closeSourceView(button) {
  const panel = button.closest("[data-panel]");
  const sourceView = panel?.querySelector("[data-source-view]");
  if (!panel || !sourceView) return;

  if (panel.classList.contains("is-source-only")) {
    closeSheet();
    return;
  }

  panel.classList.remove("is-source-open");
  panel.parentElement?.classList.remove("is-source-open");
  if (panel.dataset.panel === "sidebar") appShell.classList.remove("source-sidebar-open");
  updateSidebarWorkspaceMode();
  clearActiveSourceContext();
  sourceView.hidden = true;
}

function closeOpenSourceView() {
  const panel = document.querySelector(".review-panel.is-source-open");
  const sourceView = panel?.querySelector("[data-source-view]");
  if (!panel || !sourceView) return false;

  panel.classList.remove("is-source-open");
  panel.parentElement?.classList.remove("is-source-open");
  if (panel.dataset.panel === "sidebar") appShell.classList.remove("source-sidebar-open");
  updateSidebarWorkspaceMode();
  clearActiveSourceContext();
  sourceView.hidden = true;
  return true;
}

function openSheet(variant = "summary") {
  if (appShell.classList.contains("has-sidebar")) closeSidebar();
  if (!vivoPanel.hidden) closeVivoPanel();
  renderSheetPanelVariant(variant);
  sheetPanel.hidden = false;
  sheetPanel.setAttribute("aria-hidden", "false");
  requestAnimationFrame(() => {
    sheetPanel.classList.remove("is-closed");
    backdrop.classList.remove("is-hidden");
  });
}

function openEditalPreview() {
  openSheet();
  openSourceTarget(sheetPanel, { documentKey: "edital", text: "" });
  sheetPanel.classList.add("is-source-only");
  sheetPanel.parentElement?.classList.add("is-source-only");
}

function closeSheet() {
  sheetPanel.classList.add("is-closed");
  backdrop.classList.add("is-hidden");
  sheetPanel.classList.remove("is-source-open", "is-source-only");
  sheetPanel.parentElement?.classList.remove("is-source-open", "is-source-only");
  clearActiveSourceContext();

  window.setTimeout(() => {
    sheetPanel.hidden = true;
    sheetPanel.setAttribute("aria-hidden", "true");
  }, 350);
}

function openSidebar() {
  if (!sheetPanel.hidden) closeSheet();
  if (!vivoPanel.hidden) closeVivoPanel();
  appShell.classList.add("has-sidebar");
  sidebarShell.setAttribute("aria-hidden", "false");
  updateSidebarWorkspaceMode();
}

function toggleSidebar() {
  if (appShell.classList.contains("has-sidebar")) {
    closeSidebar();
    return;
  }

  openSidebar();
}

function closeSidebar() {
  appShell.classList.remove("has-sidebar");
  appShell.classList.remove("source-sidebar-open");
  sidebarPanel.classList.remove("is-source-open");
  updateSidebarWorkspaceMode();
  clearActiveSourceContext();
  sidebarShell.setAttribute("aria-hidden", "true");
}

function closeOwningPanel(button) {
  const panel = button.closest("[data-panel]");
  if (panel?.dataset.panel === "sidebar") {
    closeSidebar();
  } else {
    closeSheet();
  }
}

function openVivoPanel() {
  if (appShell.classList.contains("has-sidebar")) closeSidebar();
  if (!sheetPanel.hidden) closeSheet();

  renderVivoPanel();
  vivoPanel.hidden = false;
  vivoPanel.setAttribute("aria-hidden", "false");
  requestAnimationFrame(() => {
    vivoPanel.classList.remove("is-closed");
    vivoBackdrop.classList.remove("is-hidden");
  });
}

function closeVivoPanel() {
  vivoPanel.classList.add("is-closed");
  vivoBackdrop.classList.add("is-hidden");
  vivoPanel.classList.remove("is-source-open");

  window.setTimeout(() => {
    vivoPanel.hidden = true;
    vivoPanel.setAttribute("aria-hidden", "true");
  }, 350);
}

function openVivoSource(button) {
  const sourceView = vivoPanel.querySelector("[data-source-view]");
  const row = button.closest(".vivo-criterion-row");
  const documentKey = button.dataset.vivoDocument || "edital";
  const text = button.dataset.vivoText || "";
  if (!sourceView || !text) {
    showToast("Sem trecho vinculado.");
    return;
  }

  const select = sourceView.querySelector("[data-source-document]");
  if (select) select.value = documentKey;
  sourceView.dataset.highlightText = text;
  setActiveSourceRow(row, sourceView);
  renderSourceDocument(sourceView, documentKey);
  vivoPanel.classList.add("is-source-open");
  sourceView.hidden = false;
  scrollToSourceHighlight(sourceView);
}

function closeVivoSource() {
  const sourceView = vivoPanel.querySelector("[data-source-view]");
  vivoPanel.classList.remove("is-source-open");
  if (sourceView) sourceView.hidden = true;
  clearActiveSourceContext();
}

function selectVivoOption(button) {
  const criterion = vivoPocData.criteria.find((item) => item.id === button.dataset.vivoUseOption);
  const option = criterion?.ambiguity?.options.find((item) => item.value === button.dataset.vivoOptionValue);
  if (!criterion || !option) return;

  const matchesExpected = option.value.toLowerCase().includes("pregão");
  criterion.status = matchesExpected ? "ATENDE" : "NAO_ATENDE";
  criterion.selectedValue = option.value;
  criterion.evidence = option.evidence;
  criterion.ambiguity = null;
  criterion.impact.value = matchesExpected ? 10 : 0;
  vivoPocData.topReasons = vivoPocData.topReasons.map((reason) => (
    reason === "Ambiguidade em Modalidade" ? `Modalidade revisada: ${option.value}` : reason
  ));
  renderVivoPanel();
  showToast("Critério atualizado!");
}

renderPanel(sheetPanel);
renderPanel(sidebarPanel);
setSidebarWidth("summary", sidebarWidth.summary);
setSidebarWidth("source", sidebarWidth.source);

sidebarResizeHandle?.addEventListener("pointerdown", startSidebarResize);
sidebarResizeHandle?.addEventListener("pointermove", (event) => {
  if (appShell.classList.contains("is-resizing-sidebar")) resizeSidebarFromPointer(event);
});
sidebarResizeHandle?.addEventListener("pointerup", stopSidebarResize);
sidebarResizeHandle?.addEventListener("pointercancel", stopSidebarResize);

new ResizeObserver(updateSidebarWorkspaceMode).observe(sidebarShell);

document.addEventListener("click", (event) => {
  const target = event.target;
  const accordionToggle = target.closest("[data-accordion-toggle]");
  const subToggle = target.closest("[data-sub-toggle]");
  const closeButton = target.closest("[data-close-panel]");
  const flatPanel = getFlatPanel(target);

  if (flatPanel && target.closest("[data-flat-clear-selection]")) {
    clearFlatSelection(flatPanel);
    return;
  }

  if (flatPanel && target.closest("[data-flat-batch-action]")) {
    runFlatBatchAction(flatPanel);
    return;
  }

  if (flatPanel && target.closest("[data-flat-group-toggle]")) {
    const group = target.closest("[data-flat-group]");
    group?.classList.toggle("is-collapsed");
    return;
  }

  if (flatPanel && target.closest("[data-flat-group-menu]")) {
    const group = target.closest("[data-flat-group]");
    const popover = group?.querySelector("[data-flat-group-menu-popover]");
    flatPanel.querySelectorAll("[data-flat-group-menu-popover]").forEach((menu) => {
      if (menu !== popover) menu.hidden = true;
    });
    if (popover) popover.hidden = !popover.hidden;
    return;
  }

  if (flatPanel && target.closest("[data-flat-group-select]")) {
    const group = target.closest("[data-flat-group]");
    if (group) setFlatGroupSelected(group, target.closest("[data-flat-group-select]").checked);
    return;
  }

  if (flatPanel && target.closest("[data-flat-ungroup]")) {
    const group = target.closest("[data-flat-group]");
    if (group) ungroupFlatGroup(group);
    return;
  }

  if (flatPanel && target.closest("[data-flat-delete-group]")) {
    const group = target.closest("[data-flat-group]");
    group?.remove();
    updateFlatBatchBar(flatPanel);
    return;
  }

  if (flatPanel && target.closest("[data-flat-card]") && !target.closest("button, input, textarea, select, a")) {
    const card = target.closest("[data-flat-card]");
    setFlatCardSelected(card, !card.classList.contains("is-selected"));
    return;
  }

  if (flatPanel && target.closest(".flat-group-header") && !target.closest("button, input, textarea, select, a")) {
    const group = target.closest("[data-flat-group]");
    if (group) setFlatGroupSelected(group, !group.classList.contains("is-selected"));
    return;
  }

  if (flatPanel && !target.closest("[data-flat-group-menu], [data-flat-group-menu-popover]")) {
    flatPanel.querySelectorAll("[data-flat-group-menu-popover]").forEach((menu) => {
      menu.hidden = true;
    });
  }

  if (accordionToggle) togglePanel(accordionToggle);
  if (subToggle) togglePanel(subToggle);
  if (target.closest(".review-btn") && !target.closest("[data-vivo-panel]")) openReview(target.closest(".review-btn"));
  if (target.closest("[data-add-option]")) showNewOption(target.closest("[data-add-option]"));
  if (target.closest("[data-link-source]")) linkSource(target.closest("[data-link-source]"));
  if (target.closest("[data-confirm-review]")) confirmReview(target.closest("[data-confirm-review]"));
  if (target.closest("[data-save-edit]")) closeRowEdit(target.closest(".accordion-row"), true);
  if (target.closest("[data-cancel-edit]")) closeRowEdit(target.closest(".accordion-row"), false);
  if (target.closest("[data-row-edit-source]")) {
    openSourceView(target.closest("[data-row-edit-source]"));
    return;
  }
  if (target.closest("[data-review-source]")) {
    event.preventDefault();
    event.stopPropagation();
    openReviewOptionSource(target.closest("[data-review-source]"));
    return;
  }
  if (target.closest("[data-row-action]")) handleRowAction(target.closest("[data-row-action]"));
  if (target.closest("[data-workspace-tab]")) {
    const tabButton = target.closest("[data-workspace-tab]");
    setWorkspaceTab(tabButton.closest("[data-panel]"), tabButton.dataset.workspaceTab);
  }
  if (target.closest("[data-close-source]")) closeSourceView(target.closest("[data-close-source]"));
  if (target.closest("[data-download-source]")) showToast("Download do edital iniciado!");
  if (target.closest("[data-copy-content]")) copyContent();
  if (target.closest("[data-history-toggle]")) toggleHistory(target.closest("[data-history-toggle]"));
  if (target.closest("[data-open-sheet]")) openSheet();
  if (target.closest("[data-open-flat-summary]")) openSheet("flat");
  if (target.closest("[data-open-vivo-new]")) openSheet("score");
  if (target.closest("[data-open-edital]")) openEditalPreview();
  if (target.closest("[data-open-sidebar]")) toggleSidebar();
  if (target.closest("[data-close-sheet]")) closeSheet();
  if (target.closest("[data-open-vivo]")) openVivoPanel();
  if (target.closest("[data-close-vivo]")) closeVivoPanel();
  if (target.closest("[data-vivo-score-help]")) {
    const scoreHost = target.closest(".review-panel, .vivo-panel") || vivoPanel;
    scoreHost.querySelector("[data-vivo-score-modal]").hidden = false;
  }
  if (target.closest("[data-close-vivo-score-modal]")) {
    target.closest("[data-vivo-score-modal]").hidden = true;
  }
  if (target.closest("[data-vivo-use-option]")) selectVivoOption(target.closest("[data-vivo-use-option]"));
  if (target.closest("[data-close-vivo-source]")) closeVivoSource();
  if (target.closest("[data-vivo-scroll]")) {
    vivoPanel.querySelector(target.closest("[data-vivo-scroll]").dataset.vivoScroll)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  if (target.closest("[data-vivo-copy]")) {
    writeClipboard(target.closest("[data-vivo-copy]").dataset.vivoCopy || "").then((success) => showToast(success ? "Valor copiado!" : "Não foi possível copiar."));
  }
  if (target.closest("[data-vivo-source]")) {
    openVivoSource(target.closest("[data-vivo-source]"));
  }
  if (closeButton) closeOwningPanel(closeButton);

  if (
    (activeSourceRow || activeManualSourceEditor)
    && !target.closest(".accordion-row.is-source-active")
    && !target.closest(".review-editor")
    && !target.closest(".source-selection-tooltip")
    && !target.closest(".source-body")
  ) {
    clearActiveSourceContext();
  }

  if (!target.closest("[data-history-toggle]") && !target.closest("[data-history-popover]")) {
    document.querySelectorAll("[data-history-popover]").forEach((item) => {
      item.hidden = true;
    });
  }
});

document.addEventListener("change", (event) => {
  const flatSelect = event.target.closest("[data-flat-select]");
  if (flatSelect) {
    setFlatCardSelected(flatSelect.closest("[data-flat-card]"), flatSelect.checked);
    return;
  }

  const sourceDocument = event.target.closest("[data-source-document]");
  if (sourceDocument) {
    const sourceView = sourceDocument.closest("[data-source-view]");
    renderSourceDocument(sourceView, sourceDocument.value);
    const activeTarget = activeSourceRow ? findSourceHighlightTarget(activeSourceRow) : null;
    const highlightText = activeTarget?.documentKey === sourceDocument.value
      ? activeTarget.text
      : sourceView.dataset.highlightText || "";
    sourceView.dataset.highlightText = highlightText || "";
    if (!highlightText || !applySourceHighlight(sourceView, highlightText)) {
      clearSourceHighlight(sourceView);
      sourceView?.querySelector(".source-body")?.scrollTo({ top: 0 });
    }
    return;
  }

  const radio = event.target.closest(".source-option [data-review-radio]");
  const editorField = event.target.closest(".review-editor textarea");
  if (editorField) clearManualInfoError(editorField.closest(".review-editor"));
  if (!radio) return;

  resetNewOption(radio.closest(".sub-body"));
});

document.addEventListener("input", (event) => {
  const editorField = event.target.closest(".review-editor textarea");
  if (editorField) clearManualInfoError(editorField.closest(".review-editor"));

  const rowEditField = event.target.closest(".row-edit-input");
  if (rowEditField) clearRowEditError(rowEditField.closest(".accordion-row"));
});

document.addEventListener("pointerover", (event) => {
  event.target.closest(".review-footer")?.classList.add("is-hovered");
  event.target.closest(".accordion-row")?.classList.add("is-hovered");
});

document.addEventListener("pointerout", (event) => {
  const footer = event.target.closest(".review-footer");
  if (footer && !footer.contains(event.relatedTarget)) footer.classList.remove("is-hovered");

  const row = event.target.closest(".accordion-row");
  if (row && !row.contains(event.relatedTarget)) row.classList.remove("is-hovered");

  const sourceBody = event.target.closest(".source-body");
  if (sourceBody && !sourceBody.contains(event.relatedTarget)) hideSourceCursorTooltip();
});

document.addEventListener("pointermove", (event) => {
  if (event.target.closest(".source-body")) {
    showSourceCursorTooltip(event);
  } else {
    hideSourceCursorTooltip();
  }
});

document.addEventListener("mouseover", (event) => {
  event.target.closest(".review-footer")?.classList.add("is-hovered");
  event.target.closest(".accordion-row")?.classList.add("is-hovered");
  const actionButton = event.target.closest(".row-action-btn, .review-source-btn, .info-icon");
  if (actionButton) showTooltip(actionButton);
});

document.addEventListener("mouseout", (event) => {
  const footer = event.target.closest(".review-footer");
  if (footer && !footer.contains(event.relatedTarget)) {
    footer.classList.remove("is-hovered");
  }

  const actionButton = event.target.closest(".row-action-btn, .review-source-btn, .info-icon");
  if (actionButton && !actionButton.contains(event.relatedTarget)) hideTooltip();

  const row = event.target.closest(".accordion-row");
  if (row && !row.contains(event.relatedTarget)) row.classList.remove("is-hovered");
});

document.addEventListener("focusin", (event) => {
  const flatGroupName = event.target.closest(".flat-group-name");
  if (flatGroupName) {
    flatGroupName.dataset.previousValue = flatGroupName.value;
    flatGroupName.closest("[data-flat-group]")?.classList.add("is-editing-name");
  }

  const actionButton = event.target.closest(".row-action-btn, .review-source-btn, .info-icon");
  if (actionButton) showTooltip(actionButton);
});

document.addEventListener("focusout", (event) => {
  const flatGroupName = event.target.closest(".flat-group-name");
  if (flatGroupName) {
    flatGroupName.dataset.previousValue = flatGroupName.value;
    flatGroupName.closest("[data-flat-group]")?.classList.remove("is-editing-name");
  }

  if (event.target.closest(".row-action-btn, .review-source-btn, .info-icon")) hideTooltip();
});

document.addEventListener("mouseup", () => {
  window.setTimeout(() => {
    const selection = window.getSelection();
    if (!selectionIsInsideSource(selection)) {
      hideSourceSelectionTooltip();
      return;
    }
    showSourceSelectionTooltip(selection.getRangeAt(0));
  });
});

document.addEventListener("pointerdown", (event) => {
  sourceClickStartedWithSelection = Boolean(
    (activeSourceRow || activeManualSourceEditor)
    && event.target.closest(".source-body")
    && (sourceSelectionRange || sourceSelectionTooltip.classList.contains("is-visible"))
  );
});

document.addEventListener("click", (event) => {
  if ((!activeSourceRow && !activeManualSourceEditor) || !event.target.closest(".source-body")) return;

  window.setTimeout(() => {
    const selection = window.getSelection();
    if (selectionIsInsideSource(selection)) return;

    if (sourceClickStartedWithSelection) {
      clearSourceSelection();
      sourceClickStartedWithSelection = false;
      return;
    }

    if (!selectionIsInsideSource(selection)) {
      clearActiveSourceContext();
    }
  });
});

sourceSelectionTooltip.addEventListener("click", addSelectionAsSource);

document.addEventListener("selectionchange", () => {
  const selection = window.getSelection();
  if (!selectionIsInsideSource(selection)) hideSourceSelectionTooltip();
  if (selectionIsInsideSource(selection)) hideSourceCursorTooltip();
});

document.addEventListener("scroll", () => {
  hideTooltip();
  hideSourceSelectionTooltip();
  hideSourceCursorTooltip();
}, true);

document.addEventListener("scroll", (event) => {
  markScrollContainerActive(event.target);
}, true);

window.addEventListener("resize", () => {
  hideTooltip();
  hideSourceSelectionTooltip();
  hideSourceCursorTooltip();
  updateSidebarWorkspaceMode();
});

document.addEventListener("keydown", (event) => {
  const flatGroupName = event.target.closest(".flat-group-name");
  if (flatGroupName) {
    if (event.key === "Enter") {
      event.preventDefault();
      flatGroupName.blur();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      flatGroupName.value = flatGroupName.dataset.previousValue || "";
      flatGroupName.blur();
      return;
    }
  }

  if (event.key !== "Escape") return;

  hideTooltip();
  hideSourceCursorTooltip();

  if (cancelActiveInlineState()) return;

  const vivoScoreModal = document.querySelector("[data-vivo-score-modal]:not([hidden])");
  if (vivoScoreModal) {
    vivoScoreModal.hidden = true;
    return;
  }

  if (vivoPanel.classList.contains("is-source-open")) {
    closeVivoSource();
    return;
  }

  if (closeOpenSourceView()) return;

  if (!sheetPanel.hidden) {
    closeSheet();
  } else if (!vivoPanel.hidden) {
    closeVivoPanel();
  } else if (appShell.classList.contains("has-sidebar")) {
    closeSidebar();
  }
});


/* ===== Classificação de estrutura por hover: marcar seção/subseção em lote ===== */
const classifyControl = document.createElement("div");
classifyControl.className = "source-classify-control";
classifyControl.innerHTML =
  '<span class="source-classify-label">Marcar como</span>' +
  '<button type="button" class="source-classify-btn" data-classify-type="section">Seção</button>' +
  '<button type="button" class="source-classify-btn" data-classify-type="subsection">Subseção</button>';
document.body.append(classifyControl);

let classifyTarget = null;
let classifyHideTimer = null;

function classifiableHeading(node) {
  const el = node && node.closest && node.closest(".source-section-title, .source-subsection-title");
  if (!el) return null;
  return el.closest("[data-source-view]") ? el : null;
}

function headingNumberDepth(el) {
  const match = el.textContent.trim().match(/^(\d+(?:\.\d+)*)/);
  return match ? match[1].split(".").length : 0;
}

function positionClassifyControl(el) {
  const rect = el.getBoundingClientRect();
  const ctrlRect = classifyControl.getBoundingClientRect();
  const spacing = 8;
  let top = rect.top + rect.height / 2 - ctrlRect.height / 2;
  top = Math.max(8, Math.min(top, window.innerHeight - ctrlRect.height - 8));
  let left = rect.left - ctrlRect.width - spacing;
  if (left < 8) {
    left = Math.min(rect.right + spacing, window.innerWidth - ctrlRect.width - 8);
  }
  classifyControl.style.left = `${left}px`;
  classifyControl.style.top = `${top}px`;
}

function showClassifyControl(el) {
  window.clearTimeout(classifyHideTimer);
  classifyTarget = el;
  classifyControl.classList.add("is-visible");
  positionClassifyControl(el);
}

function hideClassifyControl(immediate = false) {
  const doHide = () => {
    classifyControl.classList.remove("is-visible");
    classifyTarget = null;
  };
  if (immediate) {
    window.clearTimeout(classifyHideTimer);
    doHide();
    return;
  }
  classifyHideTimer = window.setTimeout(doHide, 120);
}

function applyHeadingType(el, type) {
  el.classList.remove("source-section-title", "source-subsection-title");
  el.classList.add(type === "section" ? "source-section-title" : "source-subsection-title");
  el.dataset.lineType = type;
}

function classifyHeadingGroup(type) {
  if (!classifyTarget) return;
  const scope = classifyTarget.closest("[data-source-card]") || classifyTarget.closest(".source-body");
  const targetDepth = headingNumberDepth(classifyTarget);
  const headings = scope
    ? scope.querySelectorAll(".source-section-title, .source-subsection-title")
    : [classifyTarget];
  headings.forEach((el) => {
    if (headingNumberDepth(el) !== targetDepth) return;
    applyHeadingType(el, type);
    el.classList.add("just-classified");
    window.setTimeout(() => el.classList.remove("just-classified"), 700);
  });
  hideClassifyControl(true);
}

document.addEventListener("mouseover", (event) => {
  const heading = classifiableHeading(event.target);
  if (heading) showClassifyControl(heading);
});

document.addEventListener("mouseout", (event) => {
  const heading = classifiableHeading(event.target);
  if (
    heading
    && !heading.contains(event.relatedTarget)
    && !classifyControl.contains(event.relatedTarget)
  ) {
    hideClassifyControl();
  }
});

classifyControl.addEventListener("mouseenter", () => window.clearTimeout(classifyHideTimer));
classifyControl.addEventListener("mouseleave", () => hideClassifyControl());
classifyControl.addEventListener("click", (event) => {
  const button = event.target.closest("[data-classify-type]");
  if (!button) return;
  classifyHeadingGroup(button.dataset.classifyType);
});

document.addEventListener("scroll", () => hideClassifyControl(true), true);
window.addEventListener("resize", () => hideClassifyControl(true));
