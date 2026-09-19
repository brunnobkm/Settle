// Análise técnica: dados de exemplo e regras de cálculo.
// Modelo de COMPOSIÇÃO: um item do edital é uma lista de componentes e cada componente tem a
// sua mecânica: "produto" (comparar e escolher SKU, matriz) ou "checklist" (atende / não atende).
// Estados da célula da matriz: ok | no | ne (não avaliável) | na (edital não exige) | diff (não exigida).
// Estados do checklist: ok | no | parcial | parceiro | ne (não avaliado).

export type Confianca = "alta" | "media" | "baixa"
export type EstadoCelula = "ok" | "no" | "ne" | "na" | "diff"
export type EstadoChecklist = "ok" | "no" | "parcial" | "parceiro" | "ne"

export type Origem = { doc: string; pag: number | null; trecho: string }
export type Celula = { st: EstadoCelula; v: string; c: Confianca | null }
export type Sku = {
  model: string
  brand: string
  preco: number | null
  /** true = com estoque, false = sem estoque, null = não informado (some da tela) */
  estoque: boolean | null
  origem: "catalogo" | "internet"
  /** link para conferir a origem (datasheet do catálogo); internet sempre tem link */
  datasheet: string | null
}
export type Especificacao = {
  id: string
  req: string
  exig: string
  unidade?: string
  modulo?: string
  /** o edital não exige (a linha não aparece na matriz) */
  exigNa?: boolean
  /** exigida pelo edital, mas sem o valor dos SKUs: "Valor não informado" */
  pendingAnalysis?: boolean
  /** veio de "não exigidas pelo edital" e ainda está sem valor requerido: não conta no atende */
  diferencial?: boolean
  /** foi adicionada pelo usuário a partir de "Adicionar especificação" */
  fromDiff?: boolean
  origem: Origem
  cells: Celula[]
}
export type LinhaChecklist = {
  id: string
  req: string
  exig: string
  modulo: string
  st: EstadoChecklist
  c: Confianca | null
  just: string
  notas?: string
  origem: Origem
}
export type NaoExigida = { req: string; unidade?: string; vals: string[] }
type NaoAnalisada = { req: string; unidade?: string; valorEdital: string; trecho: string; vals: string[] }
type Ajuste = { ri: number; ci: number; st: EstadoCelula; v: string; c: Confianca }

export type ComponenteProduto = {
  mecanica: "produto"
  rotulo: string
  skus: Sku[]
  reqs: Omit<Especificacao, "id">[]
  naoAnalisadas: NaoAnalisada[]
  catalogoNaoEdital: NaoExigida[]
  overrides: Ajuste[]
}
export type ComponenteChecklist = { mecanica: "checklist"; rotulo: string; lista: Omit<LinhaChecklist, "id">[] }
export type Componente = ComponenteProduto | ComponenteChecklist

export type Item = {
  /** "o que é o item" em linguagem clara (rótulo gerado pela IA) */
  titulo: string
  numero: string
  /** categoria do item (Câmera, Switch...), prefixo da descrição no card */
  tipo: string
  nome: string
  quantidade: string
  precoUnit: number
  unidadeMedida: string
  resumoTR: string
  descricao?: string
  componentes: Componente[]
}

export const EDITAL = {
  numero: "R043/2026",
  orgao: "Prefeitura Municipal de Conselheiro Lafaiete",
  uf: "MG",
  objeto:
    "FORNECIMENTO DE EQUIPAMENTOS DE VIDEOMONITORAMENTO E PRESTAÇÃO CONTINUADA DE SERVIÇOS DE INSTALAÇÃO, COM CERCO VIRTUAL, LEITURA DE PLACAS (LPR) E RECONHECIMENTO FACIAL.",
  modalidade: "Pregão - Eletrônico",
  julgamento: "Menor preço por lote",
  valorGlobal: "R$ 4.775.427,20",
}

/** Marca "sem valor". */
export const VAZIO = "–"
const TR = "Termo de Referência"

/* catálogo de SKUs (produto) */
export const SKUS: Sku[] = [
  { model: "DS-2CD2143G2-I", brand: "Hikvision", preco: 1890, estoque: true, origem: "catalogo", datasheet: "ds-2cd2143g2-i.pdf" },
  { model: "DS-2CD2043G2-IU", brand: "Hikvision", preco: 1650, estoque: true, origem: "catalogo", datasheet: "ds-2cd2043g2-iu.pdf" },
  { model: "VIP-3230-B-IA", brand: "Intelbras", preco: 1420, estoque: false, origem: "catalogo", datasheet: null },
  { model: "IPC-HFW2431S-S2", brand: "Dahua", preco: 1290, estoque: null, origem: "internet", datasheet: null },
  { model: "DS-2CD2086G2-IU", brand: "Hikvision", preco: null, estoque: true, origem: "catalogo", datasheet: "ds-2cd2086g2-iu.pdf" },
  { model: "VIP-1230-B", brand: "Intelbras", preco: 980, estoque: false, origem: "internet", datasheet: null },
  { model: "IPC-HDW1431S", brand: "Dahua", preco: 1150, estoque: true, origem: "catalogo", datasheet: "ipc-hdw1431s.pdf" },
]

const c = (st: EstadoCelula, v: string, conf: Confianca | null = null): Celula => ({ st, v, c: conf })

/* requisitos de produto (matriz base) */
const REQS: Omit<Especificacao, "id">[] = [
  { req: "Resolução", exig: "≥ 4 MP", unidade: "MP", modulo: "Vídeo",
    origem: { doc: TR, pag: 11, trecho: "As câmeras deverão possuir resolução mínima de <mark>4 MP (2688 × 1520 pixels)</mark>." },
    cells: [c("ok","4 MP","alta"),c("ok","4 MP","alta"),c("no","2 MP","alta"),c("ok","4 MP","alta"),c("ok","8 MP","media"),c("no","2 MP","alta"),c("ok","4 MP","alta")] },
  { req: "Compressão de vídeo", exig: "H.265+", modulo: "Vídeo",
    origem: { doc: TR, pag: 11, trecho: "Suporte a compressão <mark>H.265+</mark> / H.265 / H.264." },
    cells: [c("ok","H.265+","alta"),c("ok","H.265+","alta"),c("ok","H.265+","media"),c("ok","H.265+","alta"),c("ok","H.265+","alta"),c("ok","H.265+","alta"),c("ok","H.265+","media")] },
  { req: "Distância focal", exig: "2.8 mm", unidade: "mm", modulo: "Óptica",
    origem: { doc: TR, pag: 12, trecho: "Lente fixa de <mark>2,8 mm</mark>, F2.0 ou inferior." },
    cells: [c("ok","2.8 mm","alta"),c("ok","2.8 mm","alta"),c("no","3.6 mm","alta"),c("ok","2.8 mm","alta"),c("no","3.6 mm","alta"),c("no","3.6 mm","alta"),c("ok","2.8 mm","alta")] },
  { req: "Abertura horizontal (FOV)", exig: "≥ 100°", unidade: "°", modulo: "Óptica",
    origem: { doc: TR, pag: 12, trecho: "Campo de visão horizontal de no mínimo <mark>100°</mark>." },
    cells: [c("ok","103°","alta"),c("ok","103°","alta"),c("no","87°","alta"),c("ok","105°","media"),c("ok","102°","alta"),c("no","85°","alta"),c("no","98°","media")] },
  { req: "Sensibilidade noturna (colorido)", exig: "≤ 0,005 Lux", unidade: "Lux", modulo: "Óptica",
    origem: { doc: TR, pag: 12, trecho: "Sensibilidade em modo colorido de no máximo <mark>0,005 Lux</mark>." },
    cells: [c("ok","0,003 Lux","alta"),c("ok","0,005 Lux","media"),c("no","0,01 Lux","media"),c("ok","0,0005 Lux","baixa"),c("ok","0,003 Lux","alta"),c("no","0,02 Lux","media"),c("no","0,01 Lux","media")] },
  { req: "Alcance do infravermelho (IR)", exig: "≥ 30 m", unidade: "m", modulo: "Visão noturna",
    origem: { doc: TR, pag: 13, trecho: "Iluminação infravermelha com alcance mínimo de <mark>30 metros</mark>." },
    cells: [c("ok","30 m","alta"),c("ok","30 m","alta"),c("ok","30 m","alta"),c("ok","40 m","alta"),c("ok","30 m","alta"),c("ok","32 m","alta"),c("ok","30 m","media")] },
  { req: "Análise inteligente embarcada", exig: "Sim", modulo: "Inteligência",
    origem: { doc: TR, pag: 14, trecho: "Deverá possuir <mark>análise inteligente embarcada</mark> (deep learning)." },
    cells: [c("ok","Sim","alta"),c("ok","Sim","alta"),c("no","Não","alta"),c("ok","Sim","media"),c("ok","Sim","alta"),c("no","Não","alta"),c("ok","Sim","media")] },
  { req: "Detecção de cruzamento de linha", exig: "Sim", modulo: "Inteligência",
    origem: { doc: TR, pag: 14, trecho: "Detecção por <mark>cruzamento de linha</mark> e intrusão de área." },
    cells: [c("ok","Sim","alta"),c("ok","Sim","alta"),c("ok","Sim","media"),c("ok","Sim","alta"),c("ok","Sim","alta"),c("no","Não","alta"),c("ok","Sim","media")] },
  { req: "Detecção facial", exig: "Sim", modulo: "Inteligência",
    origem: { doc: TR, pag: 14, trecho: "Capacidade de <mark>detecção facial</mark> com captura de instantâneo." },
    cells: [c("no","Não","media"),c("no","Não","media"),c("no","Não","alta"),c("no","Não","media"),c("ok","Sim","media"),c("no","Não","alta"),c("no","Não","media")] },
  { req: "Grau de proteção", exig: "IP67", modulo: "Proteção",
    origem: { doc: TR, pag: 13, trecho: "Grau de proteção mínimo <mark>IP67</mark>." },
    cells: [c("ok","IP67","alta"),c("ok","IP67","alta"),c("no","IP66","alta"),c("ok","IP67","alta"),c("no","IP66","alta"),c("no","IP66","alta"),c("ok","IP67","alta")] },
  { req: "Proteção contra impacto", exig: "IK10", modulo: "Proteção",
    origem: { doc: TR, pag: 13, trecho: "Resistência a impacto de no mínimo <mark>IK10</mark>." },
    cells: [c("ok","IK10","alta"),c("no","IK08","alta"),c("ok","IK10","media"),c("no","IK08","alta"),c("ok","IK10","alta"),c("no","IK08","alta"),c("no","IK08","alta")] },
  { req: "Slot de cartão microSD (edge)", exig: "Sim (até 256 GB)", modulo: "Armazenamento",
    origem: { doc: TR, pag: 15, trecho: "Armazenamento local em <mark>microSD de até 256 GB</mark>." },
    cells: [c("ok","256 GB","alta"),c("ok","256 GB","alta"),c("no","128 GB","media"),c("ok","256 GB","alta"),c("ok","256 GB","alta"),c("no","Não possui","alta"),c("ok","256 GB","media")] },
  { req: "Alimentação PoE", exig: "PoE (802.3af)", modulo: "Rede / Energia",
    origem: { doc: TR, pag: 15, trecho: "Alimentação via <mark>PoE (IEEE 802.3af)</mark>." },
    cells: [c("ok","PoE 802.3af","alta"),c("ok","PoE 802.3af","alta"),c("ok","PoE 802.3af","media"),c("ok","PoE 802.3af","alta"),c("ok","PoE 802.3af","alta"),c("ok","PoE 802.3af","alta"),c("ok","PoE 802.3af","media")] },
  { req: "Áudio embarcado", exig: VAZIO, exigNa: true, modulo: "Áudio",
    origem: { doc: TR, pag: 16, trecho: "O Termo de Referência não faz exigência quanto a áudio embarcado." },
    cells: [c("na","Sim"),c("na","Sim"),c("na","Não"),c("na","Sim"),c("na","Sim"),c("na","Não"),c("na","Sim")] },
  { req: "Temperatura de operação", exig: "-30°C a 60°C", modulo: "Ambiental",
    origem: { doc: TR, pag: 13, trecho: "Faixa de operação de <mark>-30 °C a +60 °C</mark>." },
    cells: [c("ok","-30~60°C","alta"),c("ok","-30~60°C","alta"),c("ok","-30~60°C","alta"),c("ok","-30~60°C","alta"),c("ok","-40~60°C","alta"),c("ok","-30~60°C","alta"),c("ok","-30~60°C","media")] },
]

/* checklist (serviço / software): mecânica atende / não atende */
const cl = (
  req: string, exig: string, modulo: string, st: EstadoChecklist, conf: Confianca | null, just: string, pag: number, trecho: string
): Omit<LinhaChecklist, "id"> => ({ req, exig, modulo, st, c: conf, just, origem: { doc: TR, pag, trecho } })

const SERVICO_INSTALL = [
  cl("Instalação física e fixação das câmeras", "Conforme TR", "Instalação", "ok", "alta", "Empresa possui equipe e equipamentos para instalação em postes e fachadas.", 18, "Compreende a <mark>instalação física</mark> dos equipamentos em postes e fachadas."),
  cl("Lançamento de infraestrutura de rede", "Cabo óptico / UTP CAT6", "Rede", "ok", "alta", "Atende ao lançamento de fibra e UTP conforme projeto.", 19, "<mark>Lançamento de infraestrutura</mark> de rede óptica e metálica."),
  cl("Configuração e integração ao VMS", "Sim", "Configuração", "ok", "media", "Equipe certificada na integração ao software de gestão de vídeo.", 19, "Configuração e <mark>integração ao VMS</mark>."),
  cl("Operação assistida 24×7", "24×7 por 12 meses", "Operação", "ok", "alta", "Empresa oferece operação assistida 24×7 com equipe em regime de plantão.", 20, "<mark>Operação assistida 24 horas</mark>, 7 dias por semana, por 12 meses."),
  cl("Equipe técnica certificada", "Certificação do fabricante", "Equipe", "ok", "media", "Equipe possui certificação do fabricante das câmeras.", 21, "Equipe <mark>técnica certificada</mark> pelo fabricante."),
  cl("Garantia e manutenção corretiva", "36 meses", "Garantia", "ok", "alta", "Garantia e manutenção corretiva de 36 meses inclusas na proposta.", 22, "<mark>Garantia e manutenção corretiva</mark> por 36 meses."),
]
/* software que ATENDE tudo */
const SOFTWARE_OK = [
  cl("Gestão por perfis de usuário", "Sim", "Acesso", "ok", "alta", "Perfis e permissões por usuário.", 23, "<mark>Gestão por perfis</mark> de usuário."),
  cl("Autenticação em dois fatores (2FA)", "Sim", "Segurança", "ok", "alta", "2FA nativo incluído.", 24, "<mark>Autenticação em dois fatores</mark>."),
  cl("Registro de auditoria (logs)", "Sim", "Auditoria", "ok", "alta", "Trilha de auditoria completa.", 24, "<mark>Registro de auditoria</mark> de ações."),
  cl("Integração via API REST", "Sim", "Integração", "ok", "media", "API REST documentada.", 25, "Integração via <mark>API REST</mark>."),
  cl("Aplicativo mobile", "Sim", "Mobile", "ok", "alta", "App iOS/Android incluído.", 25, "<mark>Aplicativo mobile</mark> para visualização."),
]
/* software com análise NÃO FINALIZADA: 3 avaliados e 2 ainda "não avaliado".
   O card mostra o quanto já foi analisado (60%) em vez da aderência. */
const SOFTWARE_PARCIAL = [
  cl("Gestão de vídeo (VMS) multiusuário", "Sim", "VMS", "ok", "alta", "Plataforma VMS com perfis e múltiplos usuários simultâneos.", 23, "<mark>Software de gestão de vídeo</mark> multiusuário."),
  cl("Aplicativo mobile gratuito", "Sim", "Mobile", "ok", "alta", "App iOS/Android gratuito incluído.", 25, "<mark>Aplicativo mobile gratuito</mark> para visualização."),
  cl("Reconhecimento facial em tempo real", "Sim", "Analítico", "no", "media", "Módulo facial disponível apenas na versão enterprise, não incluída na proposta.", 24, "<mark>Reconhecimento facial em tempo real</mark>."),
  cl("Integração com cerco virtual", "Sim", "Integração", "ne", null, "", 25, "Integração com <mark>cerco virtual fixo e móvel</mark>."),
  cl("Armazenamento em nuvem", "Opcional", "Storage", "ne", null, "", 26, "<mark>Armazenamento em nuvem</mark> opcional."),
]

/* Requisitos que a IA identificou no edital, mas sem o valor dos SKUs no catálogo.
   Entram no fim da tabela com "Valor não informado". vals segue a ordem de SKUS. */
const NAO_ANALISADAS: NaoAnalisada[] = [
  { req: "WDR (faixa dinâmica)", unidade: "dB", valorEdital: "≥ 120 dB", trecho: "Faixa dinâmica (WDR) de no mínimo 120 dB.", vals: ["120 dB", "120 dB", "120 dB", "120 dB", "140 dB", "100 dB", "120 dB"] },
  { req: "Estabilização eletrônica de imagem", valorEdital: "Sim", trecho: "Deverá possuir estabilização eletrônica de imagem.", vals: ["Sim", "Sim", "Não", "Sim", "Sim", "Não", "Sim"] },
  { req: "Filtro mecânico IR-Cut", valorEdital: "Sim", trecho: "Filtro mecânico de corte de infravermelho (IR-Cut).", vals: ["Sim", "Sim", "Sim", "Sim", "Sim", "Sim", "Sim"] },
  { req: "Garantia mínima", unidade: "meses", valorEdital: "36 meses", trecho: "Garantia mínima de 36 (trinta e seis) meses.", vals: ["36 meses", "36 meses", "24 meses", "36 meses", "36 meses", "12 meses", "24 meses"] },
  { req: "Certificação Anatel", valorEdital: "Homologado", trecho: "Equipamentos homologados pela Anatel.", vals: ["Homologado", "Homologado", "Homologado", "Homologado", "Homologado", "Homologado", "Homologado"] },
]
/* Especificações que o SKU tem, mas o edital NÃO exige ("Adicionar especificação").
   Entram na tabela sem atende / não atende e não contam no match. vals segue a ordem de SKUS. */
const CATALOGO_NAO_EDITAL: NaoExigida[] = [
  { req: "Zoom digital 16×", vals: ["16×", "16×", "8×", "16×", "4×", "8×", "16×"] },
  { req: "Microfone embutido", vals: ["Sim", "Sim", "Não", "Sim", "Sim", "Não", "Não"] },
  { req: "Sirene integrada", vals: ["Não", "Não", "Não", "Sim", "Não", "Não", "Sim"] },
]

/* PROD_OK = há SKU que atende 100% (ajuste em "Detecção facial" no SKU 0). */
const produtoCamera = (atende: boolean): ComponenteProduto => ({
  mecanica: "produto",
  rotulo: "Câmera (hardware)",
  skus: SKUS,
  reqs: REQS,
  naoAnalisadas: NAO_ANALISADAS,
  catalogoNaoEdital: CATALOGO_NAO_EDITAL,
  overrides: atende ? [{ ri: 8, ci: 0, st: "ok", v: "Sim", c: "alta" }] : [],
})
const checklist = (rotulo: string, lista: Omit<LinhaChecklist, "id">[]): ComponenteChecklist => ({
  mecanica: "checklist",
  rotulo,
  lista,
})

/* Um item por estado possível do card (produto, software e serviço). */
export const ITENS: Item[] = [
  // 1) só produto, não atende (nenhum SKU atende 100%)
  { titulo: "Câmeras LPR (leitura de placas)", numero: "1", tipo: "Câmera de segurança",
    nome: "Fornecimento de 80 câmeras IP modelo LPR (leitura de placas) para o anel viário, conforme Termo de Referência.",
    quantidade: "80", precoUnit: 2980, unidadeMedida: "unidade",
    resumoTR: "Aquisição de 80 câmeras IP com leitura de placas (LPR). Compare os SKUs do seu catálogo com a exigência do edital.",
    descricao: "Fornecimento, instalação e configuração de 80 (oitenta) câmeras IP com tecnologia de leitura automática de placas (LPR), destinadas ao monitoramento do anel viário do município, com resolução mínima de 4 MP, lente adequada à captura de placas de veículos em movimento, iluminação infravermelha, grau de proteção IP67 e alimentação via PoE, incluindo suportes de fixação, cabeamento estruturado e todos os acessórios necessários à perfeita instalação, conforme especificações técnicas detalhadas no Termo de Referência (Anexo I) e demais condições estabelecidas no edital.",
    componentes: [produtoCamera(false)] },

  // 2) só produto, atende (sem escolha feita)
  { titulo: "Câmeras dome fixas 4MP", numero: "2", tipo: "Câmera de segurança",
    nome: "Fornecimento de 60 câmeras dome fixas 4MP para ambientes internos.",
    quantidade: "60", precoUnit: 1740, unidadeMedida: "unidade",
    resumoTR: "Aquisição de 60 câmeras dome fixas. Há SKU no catálogo que atende a todos os requisitos.",
    descricao: "Fornecimento e instalação de 60 (sessenta) câmeras IP tipo dome fixas de 4 MP para ambientes internos, com lente fixa, iluminação infravermelha, análise inteligente embarcada e alimentação via PoE, incluindo suportes de fixação, cabeamento e demais acessórios necessários, conforme especificações técnicas detalhadas no Termo de Referência (Anexo I) e nas demais condições estabelecidas no edital.",
    componentes: [produtoCamera(true)] },

  // 3) só produto, atende, com produto escolhido (escolha semeada na primeira visita)
  { titulo: "Câmeras bullet fixas", numero: "3", tipo: "Câmera de segurança",
    nome: "Fornecimento de 100 câmeras bullet fixas para o perímetro externo.",
    quantidade: "100", precoUnit: 2210, unidadeMedida: "unidade",
    resumoTR: "Aquisição de 100 câmeras bullet. Um SKU já foi escolhido para a proposta.",
    descricao: "Fornecimento, instalação e configuração de 100 (cem) câmeras IP tipo bullet fixas destinadas ao monitoramento do perímetro externo da unidade, com resolução mínima de 4 MP, lente fixa, iluminação infravermelha com alcance mínimo de 30 metros, grau de proteção IP67, proteção contra impacto IK10, alimentação via PoE e slot para cartão microSD, incluindo suportes de fixação, cabeamento estruturado e todos os acessórios necessários à perfeita instalação, conforme especificações técnicas detalhadas no Termo de Referência (Anexo I) e demais condições estabelecidas no edital.",
    componentes: [produtoCamera(true)] },

  // 4) só software, atende (checklist tudo atende)
  { titulo: "Software de controle de acesso", numero: "4", tipo: "Software de controle de acesso",
    nome: "Licença de software de controle de acesso integrado ao videomonitoramento.",
    quantidade: "1", precoUnit: 98000, unidadeMedida: "licença",
    resumoTR: "Licenciamento de software de controle de acesso. Confirme se a sua solução atende a cada exigência.",
    componentes: [checklist("Software de controle de acesso", SOFTWARE_OK)] },

  // 5) só software, análise não finalizada
  { titulo: "Software de gestão de vídeo (VMS)", numero: "5", tipo: "Software de gestão de vídeo",
    nome: "Licença de software de gestão de vídeo (VMS) com leitura de placas (LPR) e cerco virtual.",
    quantidade: "1", precoUnit: 145000, unidadeMedida: "licença",
    resumoTR: "Licenciamento do VMS. Confirme cada funcionalidade exigida; há exigências não atendidas.",
    componentes: [checklist("Software de gestão de vídeo (VMS)", SOFTWARE_PARCIAL)] },

  // 6) só serviço, atende (mecânica checklist aplicada a um serviço)
  { titulo: "Instalação e configuração do sistema de CFTV", numero: "6", tipo: "Serviço de instalação",
    nome: "Serviço de instalação, configuração, integração e operação assistida do sistema de videomonitoramento.",
    quantidade: "1", precoUnit: 320000, unidadeMedida: "serviço",
    resumoTR: "Contratação do serviço de instalação e configuração. Confirme se a sua empresa atende a cada exigência do Termo de Referência.",
    descricao: "Prestação dos serviços de instalação física dos equipamentos, lançamento de infraestrutura de rede, configuração e integração ao software de gestão de vídeo (VMS), operação assistida, disponibilização de equipe técnica certificada e garantia com manutenção corretiva do sistema de videomonitoramento, conforme especificações detalhadas no Termo de Referência (Anexo I) e demais condições estabelecidas no edital.",
    componentes: [checklist("Serviço de instalação e configuração", SERVICO_INSTALL)] },

  // 7) não processado (produto): a extração automática não encontrou nenhuma especificação.
  //    Resolução (reunião Alice 24/08): extração MANUAL do edital.
  { titulo: "Câmeras de monitoramento (lote)", numero: "7", tipo: "Câmera de segurança",
    nome: "Fornecimento de câmeras de monitoramento para o município, conforme Termo de Referência.",
    quantidade: "40", precoUnit: 2100, unidadeMedida: "unidade",
    resumoTR: "Item cuja extração automática não encontrou especificações (não processado).",
    descricao: "Fornecimento e instalação de câmeras IP para monitoramento urbano, conforme especificações técnicas detalhadas no Termo de Referência (Anexo I) e nas demais condições estabelecidas no edital.",
    componentes: [
      { mecanica: "produto", rotulo: "Câmera (hardware)", skus: SKUS, reqs: [], naoAnalisadas: [], catalogoNaoEdital: [], overrides: [] },
    ] },
]

/* Categoria do componente = com qual catálogo o item é comparado (menu da seção). */
export const CATEGORIAS: Record<Componente["mecanica"], string[]> = {
  produto: ["Câmera de segurança", "Gravador de vídeo (DVR/NVR)", "Cabo de rede", "Access point", "Nobreak / fonte"],
  checklist: ["Software de vídeo monitoramento", "Software de gestão pública", "Software de gestão da educação", "Software de gestão de saúde"],
}

/* ============================================================
   Estado inicial (cópias editáveis por componente)
   ============================================================ */
let seq = 0
export const novoId = (prefixo: string) => `${prefixo}-${++seq}`
/** Chave de um componente: "item-componente". */
export const chave = (item: number, comp: number) => `${item}-${comp}`

/** Matriz do componente: base + ajustes + requisitos exigidos sem valor dos SKUs no fim. */
function montarMatriz(comp: ComponenteProduto): Especificacao[] {
  const m: Especificacao[] = comp.reqs.map((r) => ({
    ...r,
    id: novoId("req"),
    origem: { ...r.origem },
    cells: r.cells.map((x) => ({ ...x })),
  }))
  comp.overrides.forEach((o) => (m[o.ri].cells[o.ci] = { st: o.st, v: o.v, c: o.c }))
  // "Não extraído" não existe (decisão Alice 04/08): o que o SKU tem mas o edital não exige
  // fica no menu "Adicionar especificação", fora da comparação.
  comp.naoAnalisadas.forEach((n) => {
    if (m.some((s) => s.req === n.req)) return
    m.push({
      id: novoId("req"),
      req: n.req,
      exig: n.valorEdital,
      unidade: n.unidade ?? "",
      pendingAnalysis: true,
      origem: { doc: "Edital (Termo de Referência)", pag: null, trecho: n.trecho },
      cells: comp.skus.map(() => ({ st: "ne", v: "", c: null })),
    })
  })
  return m
}

export function montarEstado() {
  const matrizes: Record<string, Especificacao[]> = {}
  const checklists: Record<string, LinhaChecklist[]> = {}
  const categorias: Record<string, string> = {}
  ITENS.forEach((it, i) =>
    it.componentes.forEach((comp, ci) => {
      const k = chave(i, ci)
      categorias[k] = comp.rotulo
      if (comp.mecanica === "produto") matrizes[k] = montarMatriz(comp)
      else checklists[k] = comp.lista.map((r) => ({ ...r, id: novoId("cl"), origem: { ...r.origem } }))
    })
  )
  return { matrizes, checklists, categorias }
}

/* ============================================================
   Regras da matriz (produto)
   ============================================================ */
export type Pontuacao = { i: number; sku: Sku; ok: number; evaluable: number; ne: number; pct: number; diverg: string[] }

export function pontuar(specs: Especificacao[], skus: Sku[]): Pontuacao[] {
  return skus.map((sku, i) => {
    let ok = 0
    let evaluable = 0
    let ne = 0
    const diverg: string[] = []
    specs.forEach((spec) => {
      if (spec.exigNa || spec.diferencial) return
      const cell = spec.cells[i]
      if (cell.st === "ok") {
        ok++
        evaluable++
      } else if (cell.st === "no") {
        evaluable++
        diverg.push(spec.req)
      } else if (cell.st === "ne") ne++
    })
    // com especificação pendente, o percentual não chega a 100%
    const pct = evaluable + ne ? Math.min(ne ? 99 : 100, Math.round((ok / (evaluable + ne)) * 100)) : 0
    return { i, sku, ok, evaluable, ne, pct, diverg }
  })
}
export const ranquear = (p: Pontuacao[]) => [...p].sort((a, b) => b.pct - a.pct || a.ne - b.ne || b.ok - a.ok)
export const melhor = (specs: Especificacao[], skus: Sku[]) => ranquear(pontuar(specs, skus))[0]
/** O melhor SKU atende tudo, sem pendências. */
export const atendeTudo = (p: Pontuacao | undefined) => !!p && p.evaluable > 0 && p.ne === 0 && p.diverg.length === 0
/** Sem divergências, mas com especificação pendente. */
export const pendente = (p: Pontuacao | undefined) => !!p && p.ne > 0 && p.diverg.length === 0

/* compara o valor do produto com a exigência do edital: atende (ok), não atende (no) ou não avaliável (ne) */
const numero = (s: string) => {
  const m = String(s).replace(",", ".").match(/-?\d+(?:\.\d+)?/)
  return m ? parseFloat(m[0]) : null
}
const alfanum = (s: string) => String(s).toLowerCase().replace(/[^a-z0-9]/g, "")
export function avaliarCelula(v: string, req: string): EstadoCelula {
  const rv = (req ?? "").trim()
  const vv = (v ?? "").trim()
  if (!rv || !vv || vv === VAZIO) return "ne"
  const op = rv.match(/(≥|>=|≤|<=|>|<|=)\s*(-?[\d.,]+)/)
  if (op) {
    const r = numero(op[2])
    const n = numero(vv)
    if (r == null || n == null) return "ne"
    const o = op[1]
    const ok =
      o === "=" ? n === r : o === "≥" || o === ">=" ? n >= r : o === "≤" || o === "<=" ? n <= r : o === ">" ? n > r : n < r
    return ok ? "ok" : "no"
  }
  if (/^sim\b/i.test(rv)) return /\b(n[aã]o|nao)\b/i.test(vv) ? "no" : "ok"
  const ar = alfanum(rv)
  const av = alfanum(vv)
  if (!ar) return "ne"
  return av.includes(ar) || ar.includes(av) ? "ok" : "no"
}

/* unidade de medida e operador são FIXOS (vêm do edital): só o valor é editável */
export const separadorDeUnidade = (u?: string) => (u === "°" || u === "%" ? "" : " ")
export function tirarUnidade(valor: string, unidade?: string) {
  if (!unidade || valor === VAZIO) return valor ?? ""
  const re = new RegExp("\\s*" + unidade.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*$")
  return String(valor).replace(re, "").replace(/\s+$/, "")
}
export function juntarUnidade(nucleo: string, unidade?: string) {
  const n = nucleo.trim()
  if (!unidade || n === "" || n === VAZIO) return n || VAZIO
  return n + separadorDeUnidade(unidade) + unidade
}
const OPERADOR = /^\s*(≥|≤|>=|<=|>|<|=)\s*/
export function separarOperador(valor: string) {
  const m = (valor ?? "").match(OPERADOR)
  return m ? { op: m[1], resto: valor.slice(m[0].length) } : { op: "", resto: valor ?? "" }
}

/** Recalcula o atende / não atende da linha com a exigência atual. */
function recalcularLinha(spec: Especificacao): Especificacao {
  if (spec.exigNa || spec.pendingAnalysis) return spec
  return { ...spec, cells: spec.cells.map((cc) => ({ ...cc, st: avaliarCelula(cc.v, spec.exig) })) }
}
/**
 * Define o valor requerido. Numa especificação adicionada ("não exigida"), preencher o valor
 * a faz entrar na comparação; apagar devolve ao estado não exigido, fora do cálculo.
 */
export function definirValorRequerido(spec: Especificacao, valor: string): Especificacao {
  const exig = valor.trim()
  let s: Especificacao = { ...spec, exig }
  if (s.fromDiff) {
    s.diferencial = !exig
    if (s.diferencial) return { ...s, cells: s.cells.map((cc) => ({ ...cc, st: "diff" })) }
  }
  s = recalcularLinha(s)
  return s
}
/** Linha nova vinda de "Adicionar especificação" (sem valor requerido). */
export function especificacaoNaoExigida(d: NaoExigida, skus: Sku[]): Especificacao {
  return {
    id: novoId("req"),
    req: d.req,
    exig: "",
    diferencial: true,
    fromDiff: true,
    unidade: d.unidade ?? "",
    modulo: "Diferencial",
    origem: { doc: "Catálogo do produto", pag: null, trecho: "Especificação do produto, não exigida pelo edital." },
    cells: skus.map((_, i) => ({ st: "diff", v: d.vals[i] ?? VAZIO, c: null })),
  }
}
/** Análise vazia: veio sem nenhuma especificação real. Não pode marcar "atende". */
export const semEspecificacoes = (specs: Especificacao[]) => !specs.some((s) => !s.exigNa && !s.diferencial)

/* ============================================================
   Regras do checklist (serviço / software)
   ============================================================ */
export const ESTADOS_CHECKLIST: EstadoChecklist[] = ["ok", "no", "parcial", "parceiro", "ne"]
export const ROTULO_STATUS: Record<EstadoChecklist, string> = {
  ok: "Atende",
  no: "Não atende",
  parcial: "Atende parcialmente",
  parceiro: "Atende com parceiro",
  ne: "Não avaliado",
}
export function resumirChecklist(linhas: LinhaChecklist[]) {
  const avaliadas = linhas.filter((r) => ["ok", "no", "parcial", "parceiro"].includes(r.st))
  const ok = linhas.filter((r) => r.st === "ok" || r.st === "parceiro").length
  const no = linhas.filter((r) => r.st === "no").length
  const ne = linhas.filter((r) => r.st === "ne").length
  const todas = linhas.length
  return {
    ok,
    no,
    ne,
    todas,
    total: avaliadas.length,
    // análise finalizada = nada mais "não avaliado"; enquanto não, mostramos o progresso
    concluida: ne === 0,
    analisadoPct: todas ? Math.round((avaliadas.length / todas) * 100) : 0,
    atende: no === 0,
    pct: avaliadas.length ? Math.round((ok / avaliadas.length) * 100) : 0,
  }
}
/** Faixa de aderência do software: < 50% vermelho, > 80% verde, 50 a 80% neutro. */
export const faixa = (pct: number) => (pct < 50 ? "bad" : pct > 80 ? "ok" : "mid")

/* ============================================================
   Resumo por item
   ============================================================ */
export type Estado = {
  matrizes: Record<string, Especificacao[]>
  checklists: Record<string, LinhaChecklist[]>
  categorias: Record<string, string>
  /** categoria sem correspondência no catálogo: nenhum produto se aplica */
  nenhumProduto: Record<string, boolean>
}
export type ResumoComponente =
  | { mecanica: "produto"; chave: string; vazio: boolean; ok: boolean; best: Pontuacao | undefined }
  | { mecanica: "checklist"; chave: string; vazio: boolean; ok: boolean; resumo: ReturnType<typeof resumirChecklist> }

export function resumirItem(i: number, estado: Estado) {
  const comps: ResumoComponente[] = ITENS[i].componentes.map((comp, ci) => {
    const k = chave(i, ci)
    if (comp.mecanica === "produto") {
      const specs = estado.matrizes[k]
      const vazio = semEspecificacoes(specs)
      const best = melhor(specs, comp.skus)
      return { mecanica: "produto", chave: k, vazio, best, ok: !vazio && !estado.nenhumProduto[k] && atendeTudo(best) }
    }
    const linhas = estado.checklists[k]
    const resumo = resumirChecklist(linhas)
    const vazio = linhas.length === 0
    return { mecanica: "checklist", chave: k, vazio, resumo, ok: !vazio && resumo.atende }
  })
  return { comps, vazio: comps.every((c) => c.vazio), atende: comps.every((c) => c.ok) }
}

/* tipo exibido no card: produto, software ou serviço (pela categoria do componente) */
export type TipoDoCard = "produto" | "software" | "servico"
export function tiposDoItem(i: number, estado: Estado): TipoDoCard[] {
  const tipos = ITENS[i].componentes.map((comp, ci): TipoDoCard =>
    comp.mecanica === "produto" ? "produto" : /software|vms|licen/i.test(estado.categorias[chave(i, ci)]) ? "software" : "servico"
  )
  return [...new Set(tipos)]
}

/* ============================================================
   Valores do item
   ============================================================ */
export const formatarBRL = (n: number) => "R$ " + n.toLocaleString("pt-BR", { minimumFractionDigits: 2 })
export const formatarNumero = (n: number) => n.toLocaleString("pt-BR", { minimumFractionDigits: 2 })
export const valorTotal = (it: Item) => it.precoUnit * (parseFloat(it.quantidade) || 1)

/* ============================================================
   Preferências (localStorage)
   ============================================================ */
export type Preferencias = {
  /** SKU escolhido por item */
  chosen: Record<number, number>
  /** o aviso "Confirmar edição?" já foi mostrado */
  warnedInline?: boolean
  /** largura das colunas da matriz */
  colW: Record<string, number>
  seededChosen2?: boolean
}
const CHAVE_PREFS = "settle-at-prefs-v7"
export function lerPreferencias(): Preferencias {
  let p: Partial<Preferencias> = {}
  try {
    p = JSON.parse(localStorage.getItem(CHAVE_PREFS) ?? "{}") ?? {}
  } catch {
    p = {}
  }
  const prefs: Preferencias = { ...p, chosen: p.chosen ?? {}, colW: p.colW ?? {} }
  // demonstração: pré-seleciona um produto no item 3, que atende, para ilustrar o "produto escolhido"
  if (!prefs.seededChosen2) {
    const DEMO = 2
    const comp = ITENS[DEMO].componentes[0] as ComponenteProduto
    prefs.chosen = { [DEMO]: melhor(montarMatriz(comp), comp.skus).i }
    prefs.seededChosen2 = true
  }
  return prefs
}
export function salvarPreferencias(p: Preferencias) {
  try {
    localStorage.setItem(CHAVE_PREFS, JSON.stringify(p))
  } catch {
    /* sem armazenamento: segue só na memória */
  }
}
