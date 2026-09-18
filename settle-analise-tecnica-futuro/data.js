/* ============================================================
   Dataset — Análise Técnica · multi-tipo (produto / serviço / software / solução)
   Estados de célula (matriz): ok | no | ne | na | sig   ·  c = alta|media|baixa
   Estados de checklist (atende-não): ok | no | parcial | ne
   ============================================================ */

const EDITAL = {
  numero: "R043/2026",
  pill: "Solução",
  orgao: "Prefeitura Municipal de Conselheiro Lafaiete",
  uf: "MG",
  objeto: "FORNECIMENTO DE EQUIPAMENTOS DE VIDEOMONITORAMENTO E PRESTAÇÃO CONTINUADA DE SERVIÇOS DE INSTALAÇÃO, COM CERCO VIRTUAL, LEITURA DE PLACAS (LPR) E RECONHECIMENTO FACIAL.",
  modalidade: "Pregão - Eletrônico",
  julgamento: "Menor preço por lote",
  valorGlobal: "R$ 4.775.427,20",
};

/* catálogo de SKUs (produto) */
const SKUS = [
  { model: "DS-2CD2143G2-I",  brand: "Hikvision" },
  { model: "DS-2CD2043G2-IU", brand: "Hikvision" },
  { model: "VIP-3230-B-IA",   brand: "Intelbras" },
  { model: "IPC-HFW2431S-S2", brand: "Dahua" },
  { model: "DS-2CD2086G2-IU", brand: "Hikvision" },
  { model: "VIP-1230-B",      brand: "Intelbras" },
  { model: "IPC-HDW1431S",    brand: "Dahua" },
];

const c = (st, v, conf) => ({ st, v, c: conf });

/* requisitos de produto (matriz base) */
const REQS = [
  { req: "Resolução", exig: "4 MP (2688×1520)", modulo: "Vídeo",
    origem: { doc: "Termo de Referência", pag: 11, trecho: "As câmeras deverão possuir resolução mínima de <mark>4 MP (2688 × 1520 pixels)</mark>." },
    cells: [c("ok","4 MP","alta"),c("ok","4 MP","alta"),c("no","2 MP","alta"),c("ok","4 MP","alta"),c("ok","8 MP","media"),c("no","2 MP","alta"),c("ok","4 MP","alta")] },
  { req: "Compressão de vídeo", exig: "H.265+", modulo: "Vídeo",
    origem: { doc: "Termo de Referência", pag: 11, trecho: "Suporte a compressão <mark>H.265+</mark> / H.265 / H.264." },
    cells: [c("ok","H.265+","alta"),c("ok","H.265+","alta"),c("ok","H.265+","media"),c("ok","H.265+","alta"),c("ok","H.265+","alta"),c("ok","H.265+","alta"),c("ok","H.265+","media")] },
  { req: "Distância focal", exig: "2.8 mm", modulo: "Óptica",
    origem: { doc: "Termo de Referência", pag: 12, trecho: "Lente fixa de <mark>2,8 mm</mark>, F2.0 ou inferior." },
    cells: [c("ok","2.8 mm","alta"),c("ok","2.8 mm","alta"),c("no","3.6 mm","alta"),c("ok","2.8 mm","alta"),c("no","3.6 mm","alta"),c("no","3.6 mm","alta"),c("ok","2.8 mm","alta")] },
  { req: "Abertura horizontal (FOV)", exig: "≥ 100°", modulo: "Óptica",
    origem: { doc: "Termo de Referência", pag: 12, trecho: "Campo de visão horizontal de no mínimo <mark>100°</mark>." },
    cells: [c("ok","103°","alta"),c("ok","103°","alta"),c("no","87°","alta"),c("ok","105°","media"),c("ok","102°","alta"),c("no","85°","alta"),c("no","98°","media")] },
  { req: "Sensibilidade noturna (colorido)", exig: "≤ 0,005 Lux", modulo: "Óptica",
    origem: { doc: "Termo de Referência", pag: 12, trecho: "Sensibilidade em modo colorido de no máximo <mark>0,005 Lux</mark>." },
    cells: [c("ok","0,003 Lux","alta"),c("ok","0,005 Lux","media"),c("no","0,01 Lux","media"),c("ok","0,0005 Lux","baixa"),c("ok","0,003 Lux","alta"),c("no","0,02 Lux","media"),c("ne","—","baixa")] },
  { req: "Alcance do infravermelho (IR)", exig: "≥ 30 m", modulo: "Visão noturna",
    origem: { doc: "Termo de Referência", pag: 13, trecho: "Iluminação infravermelha com alcance mínimo de <mark>30 metros</mark>." },
    cells: [c("ok","30 m","alta"),c("ok","30 m","alta"),c("ok","30 m","alta"),c("ok","40 m","alta"),c("ok","30 m","alta"),c("ok","32 m","alta"),c("ok","30 m","media")] },
  { req: "Análise inteligente embarcada", exig: "Sim", modulo: "Inteligência",
    origem: { doc: "Termo de Referência", pag: 14, trecho: "Deverá possuir <mark>análise inteligente embarcada</mark> (deep learning)." },
    cells: [c("ok","Sim","alta"),c("ok","Sim","alta"),c("no","Não","alta"),c("ok","Sim","media"),c("ok","Sim","alta"),c("no","Não","alta"),c("ok","Sim","media")] },
  { req: "Detecção de cruzamento de linha", exig: "Sim", modulo: "Inteligência",
    origem: { doc: "Termo de Referência", pag: 14, trecho: "Detecção por <mark>cruzamento de linha</mark> e intrusão de área." },
    cells: [c("ok","Sim","alta"),c("ok","Sim","alta"),c("ne","—","baixa"),c("ok","Sim","alta"),c("ok","Sim","alta"),c("no","Não","alta"),c("ok","Sim","media")] },
  { req: "Detecção facial", exig: "Sim", modulo: "Inteligência",
    origem: { doc: "Termo de Referência", pag: 14, trecho: "Capacidade de <mark>detecção facial</mark> com captura de instantâneo." },
    cells: [c("no","Não","media"),c("no","Não","media"),c("no","Não","alta"),c("no","Não","media"),c("ok","Sim","media"),c("no","Não","alta"),c("no","Não","media")] },
  { req: "Grau de proteção", exig: "IP67", modulo: "Proteção",
    origem: { doc: "Termo de Referência", pag: 13, trecho: "Grau de proteção mínimo <mark>IP67</mark>." },
    cells: [c("ok","IP67","alta"),c("ok","IP67","alta"),c("no","IP66","alta"),c("ok","IP67","alta"),c("no","IP66","alta"),c("no","IP66","alta"),c("ok","IP67","alta")] },
  { req: "Proteção contra impacto", exig: "IK10", modulo: "Proteção",
    origem: { doc: "Termo de Referência", pag: 13, trecho: "Resistência a impacto de no mínimo <mark>IK10</mark>." },
    cells: [c("ok","IK10","alta"),c("no","IK08","alta"),c("ok","IK10","media"),c("no","IK08","alta"),c("ok","IK10","alta"),c("ne","—","baixa"),c("no","IK08","alta")] },
  { req: "Slot de cartão microSD (edge)", exig: "Sim (até 256 GB)", modulo: "Armazenamento",
    origem: { doc: "Termo de Referência", pag: 15, trecho: "Armazenamento local em <mark>microSD de até 256 GB</mark>." },
    cells: [c("ok","256 GB","alta"),c("ok","256 GB","alta"),c("no","128 GB","media"),c("ok","256 GB","alta"),c("ok","256 GB","alta"),c("no","Não possui","alta"),c("ok","256 GB","media")] },
  { req: "Alimentação PoE", exig: "PoE (802.3af)", modulo: "Rede / Energia",
    origem: { doc: "Termo de Referência", pag: 15, trecho: "Alimentação via <mark>PoE (IEEE 802.3af)</mark>." },
    cells: [c("ok","PoE 802.3af","alta"),c("ok","PoE 802.3af","alta"),c("ok","PoE 802.3af","media"),c("ok","PoE 802.3af","alta"),c("ok","PoE 802.3af","alta"),c("ok","PoE 802.3af","alta"),c("ok","PoE 802.3af","media")] },
  { req: "Áudio embarcado", exig: "—", exigNa: true, modulo: "Áudio",
    origem: { doc: "Termo de Referência", pag: 16, trecho: "O Termo de Referência não faz exigência quanto a áudio embarcado." },
    cells: [c("na","Sim"),c("na","Sim"),c("na","Não"),c("na","Sim"),c("na","Sim"),c("na","Não"),c("na","Sim")] },
  { req: "Temperatura de operação", exig: "-30°C a 60°C", modulo: "Ambiental",
    origem: { doc: "Termo de Referência", pag: 13, trecho: "Faixa de operação de <mark>-30 °C a +60 °C</mark>." },
    cells: [c("ok","-30~60°C","alta"),c("ok","-30~60°C","alta"),c("ok","-30~60°C","alta"),c("ok","-30~60°C","alta"),c("ok","-40~60°C","alta"),c("ok","-30~60°C","alta"),c("ok","-30~60°C","media")] },
];

/* checklist de SERVIÇO (mecânica atende / não atende) */
const cl = (req, exig, modulo, st, conf, just, pag, trecho) => ({ req, exig, modulo, st, c: conf, just, origem: { doc: "Termo de Referência", pag, trecho } });
const SERVICO_INSTALL = [
  cl("Instalação física e fixação das câmeras", "Conforme TR", "Instalação", "ok", "alta", "Empresa possui equipe e equipamentos para instalação em postes e fachadas.", 18, "Compreende a <mark>instalação física</mark> dos equipamentos em postes e fachadas."),
  cl("Lançamento de infraestrutura de rede", "Cabo óptico / UTP CAT6", "Rede", "ok", "alta", "Atende ao lançamento de fibra e UTP conforme projeto.", 19, "<mark>Lançamento de infraestrutura</mark> de rede óptica e metálica."),
  cl("Configuração e integração ao VMS", "Sim", "Configuração", "ok", "media", "Equipe certificada na integração ao software de gestão de vídeo.", 19, "Configuração e <mark>integração ao VMS</mark>."),
  cl("Operação assistida 24×7", "24×7 por 12 meses", "Operação", "no", "alta", "Empresa oferece operação assistida em horário comercial; não cobre 24×7.", 20, "<mark>Operação assistida 24 horas</mark>, 7 dias por semana, por 12 meses."),
  cl("Equipe técnica certificada", "Certificação do fabricante", "Equipe", "ok", "media", "Equipe possui certificação do fabricante das câmeras.", 21, "Equipe <mark>técnica certificada</mark> pelo fabricante."),
  cl("Garantia e manutenção corretiva", "36 meses", "Garantia", "parcial", "media", "Garantia padrão de 24 meses; 36 meses disponível com custo adicional.", 22, "<mark>Garantia e manutenção corretiva</mark> por 36 meses."),
];
/* checklist de SOFTWARE (software simples ≈ atende / não) */
const SOFTWARE_VMS = [
  cl("Gestão de vídeo (VMS) multiusuário", "Sim", "VMS", "ok", "alta", "Plataforma VMS com perfis e múltiplos usuários simultâneos.", 23, "<mark>Software de gestão de vídeo</mark> multiusuário."),
  cl("Leitura automática de placas (LPR)", "Sim", "Analítico", "ok", "alta", "Módulo LPR nativo integrado ao VMS.", 24, "<mark>Leitura automatizada de placas veiculares (LPR)</mark>."),
  cl("Reconhecimento facial em tempo real", "Sim", "Analítico", "no", "media", "Módulo facial disponível apenas na versão enterprise, não incluída na proposta.", 24, "<mark>Reconhecimento facial em tempo real</mark>."),
  cl("Aplicativo mobile gratuito", "Sim", "Mobile", "ok", "alta", "App iOS/Android gratuito incluído.", 25, "<mark>Aplicativo mobile gratuito</mark> para visualização."),
  cl("Integração com cerco virtual", "Sim", "Integração", "parcial", "baixa", "Integração via API; cerco virtual requer módulo adicional.", 25, "Integração com <mark>cerco virtual fixo e móvel</mark>."),
  cl("Armazenamento em nuvem", "Opcional", "Storage", "ok", "media", "Oferece gravação em nuvem como opção contratável.", 26, "<mark>Armazenamento em nuvem</mark> opcional."),
];

/* itens do edital — cada um com um TIPO (a lente) e a mecânica correspondente */
const ITEMS = [
  // ---- PRODUTO (mecânica: comparar & escolher SKU) ----
  { tipo: "produto", nome: "Câmera de segurança — Fornecimento de 80 câmeras, modelo LPR (leitura de placas)", quantidade: "80",
    resumoTR: "Aquisição de 80 câmeras IP tipo bullet com leitura de placas (LPR) para o anel viário. Você precisa indicar, do seu catálogo, qual SKU atende às especificações e a que preço.",
    overrides: [] },
  { tipo: "produto", nome: "Câmera de segurança — Fornecimento de 100 câmeras, modelo Speed Dome", quantidade: "100",
    resumoTR: "Aquisição de 100 câmeras Speed Dome (PTZ) para pontos de monitoramento ativo. Escolha o SKU do catálogo que melhor atende.",
    overrides: [{ ri: 8, ci: 0, st: "ok", v: "Sim", c: "alta" }] },
  { tipo: "produto", nome: "Câmera de segurança — Fornecimento de 100 câmeras, modelo Bullet", quantidade: "100",
    resumoTR: "Aquisição de 100 câmeras bullet fixas para vigilância perimetral. Escolha o SKU do catálogo que melhor atende.",
    overrides: [{ ri: 8, ci: 0, st: "ok", v: "Sim", c: "alta" }] },
  // ---- SERVIÇO (mecânica: atende / não atende) ----
  { tipo: "servico", nome: "Serviço de instalação, configuração e operação assistida do sistema", quantidade: "1",
    resumoTR: "Contratação da empresa que vai instalar as câmeras, lançar a rede, integrar ao software e operar o sistema. Aqui não há escolha de SKU — você só precisa confirmar se consegue cumprir cada exigência do serviço.",
    checklist: SERVICO_INSTALL },
  // ---- SOFTWARE (software simples ≈ atende / não) ----
  { tipo: "software", nome: "Licença de software de gestão de vídeo (VMS) com LPR e cerco virtual", quantidade: "1",
    resumoTR: "Licenciamento do software que centraliza as câmeras, faz leitura de placas e cerco virtual. Software simples (não exige a análise técnica complexa) — confirme se a sua solução atende a cada funcionalidade exigida.",
    checklist: SOFTWARE_VMS },
  // ---- SOLUÇÃO (mistura: produto + serviço + software, em seções) ----
  { tipo: "solucao", nome: "Solução completa de videomonitoramento (fornecimento + instalação + software)", quantidade: "1",
    resumoTR: "Item único que mistura tudo: fornecer as câmeras, instalar/operar e licenciar o software. A análise se quebra em três frentes — produto (escolher SKU), serviço (atende/não) e software (atende/não).",
    sections: [
      { tipo: "produto", titulo: "Câmeras (fornecimento)", overrides: [] },
      { tipo: "servico", titulo: "Instalação e operação", checklist: SERVICO_INSTALL },
      { tipo: "software", titulo: "Software de monitoramento (VMS)", checklist: SOFTWARE_VMS },
    ] },
];

const NAO_ANALISADAS = ["Estabilização eletrônica de imagem","WDR 120 dB","Day/Night (ICR)","Compensação de luz de fundo (BLC)","Máscara de privacidade","ROI","Anti-flicker","Suporte ONVIF Perfil S/G/T","Streaming triplo","Watermark digital","Filtro IR-Cut","Detecção de violação (tamper)","Garantia mínima de 36 meses","Instalação e configuração","Treinamento operacional","Suporte técnico nacional","Certificação Anatel","Manual em português"];
const CATALOGO_NAO_EDITAL = ["Zoom digital 16×","Microfone embutido","Sirene integrada"];
