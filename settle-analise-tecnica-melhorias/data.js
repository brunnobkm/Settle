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
  docTexto: `TERMO DE REFERÊNCIA — AQUISIÇÃO E INSTALAÇÃO DE SISTEMA DE VIDEOMONITORAMENTO

1. OBJETO
Contratação de empresa especializada para fornecimento de equipamentos de videomonitoramento e prestação continuada de serviços de instalação, com cerco virtual, leitura de placas (LPR) e reconhecimento facial, conforme especificações constantes neste Termo de Referência.

2. ESPECIFICAÇÕES TÉCNICAS DAS CÂMERAS
2.1. As câmeras deverão possuir resolução mínima de 4 MP (2688 × 1520 pixels), com varredura progressiva.
2.2. Suporte a compressão de vídeo H.265+ / H.265 / H.264, com taxa de bits ajustável.
2.3. Lente fixa com distância focal de 2,8 mm, abertura de diafragma F2.0 ou inferior, e campo de visão horizontal de no mínimo 100°.
2.4. Sensibilidade luminosa em modo colorido de no máximo 0,005 Lux (F2.0, AGC ON) e iluminação infravermelha com alcance mínimo de 30 metros.
2.5. Deverá possuir análise inteligente embarcada (deep learning) para classificação de pessoas e veículos, com detecção por cruzamento de linha e captura facial.

3. PROTEÇÃO E AMBIENTE
3.1. Invólucro com grau de proteção mínimo IP67 e resistência a impacto IK10.
3.2. Faixa de operação de -30 °C a +60 °C, umidade ≤ 95%.

4. ARMAZENAMENTO E REDE
4.1. Armazenamento local em cartão microSD de até 256 GB para gravação na borda.
4.2. Alimentação via PoE (IEEE 802.3af) e/ou 12 Vdc.`,
};

/* catálogo de SKUs (produto) */
// preco/estoque/origem do SKU; datasheet reservado para link futuro (ainda não exibido)
const SKUS = [
  { model: "DS-2CD2143G2-I",  brand: "Hikvision", preco: 1890, estoque: true,  origem: "catalogo", datasheet: "ds-2cd2143g2-i.pdf" },
  { model: "DS-2CD2043G2-IU", brand: "Hikvision", preco: 1650, estoque: true,  origem: "catalogo", datasheet: "ds-2cd2043g2-iu.pdf" },
  { model: "VIP-3230-B-IA",   brand: "Intelbras", preco: 1420, estoque: false, origem: "catalogo", datasheet: null },
  { model: "IPC-HFW2431S-S2", brand: "Dahua",     preco: 1290, estoque: null,  origem: "internet", datasheet: null },
  { model: "DS-2CD2086G2-IU", brand: "Hikvision", preco: null, estoque: true,  origem: "catalogo", datasheet: "ds-2cd2086g2-iu.pdf" },
  { model: "VIP-1230-B",      brand: "Intelbras", preco: 980,  estoque: false, origem: "internet", datasheet: null },
  { model: "IPC-HDW1431S",    brand: "Dahua",     preco: 1150, estoque: true,  origem: "catalogo", datasheet: "ipc-hdw1431s.pdf" },
];

const c = (st, v, conf) => ({ st, v, c: conf });

/* requisitos de produto (matriz base) */
const REQS = [
  { req: "Resolução", exig: "≥ 4 MP", unidade: "MP", modulo: "Vídeo",
    origem: { doc: "Termo de Referência", pag: 11, trecho: "As câmeras deverão possuir resolução mínima de <mark>4 MP (2688 × 1520 pixels)</mark>." },
    cells: [c("ok","4 MP","alta"),c("ok","4 MP","alta"),c("no","2 MP","alta"),c("ok","4 MP","alta"),c("ok","8 MP","media"),c("no","2 MP","alta"),c("ok","4 MP","alta")] },
  { req: "Compressão de vídeo", exig: "H.265+", modulo: "Vídeo",
    origem: { doc: "Termo de Referência", pag: 11, trecho: "Suporte a compressão <mark>H.265+</mark> / H.265 / H.264." },
    cells: [c("ok","H.265+","alta"),c("ok","H.265+","alta"),c("ok","H.265+","media"),c("ok","H.265+","alta"),c("ok","H.265+","alta"),c("ok","H.265+","alta"),c("ok","H.265+","media")] },
  { req: "Distância focal", exig: "2.8 mm", unidade: "mm", modulo: "Óptica",
    origem: { doc: "Termo de Referência", pag: 12, trecho: "Lente fixa de <mark>2,8 mm</mark>, F2.0 ou inferior." },
    cells: [c("ok","2.8 mm","alta"),c("ok","2.8 mm","alta"),c("no","3.6 mm","alta"),c("ok","2.8 mm","alta"),c("no","3.6 mm","alta"),c("no","3.6 mm","alta"),c("ok","2.8 mm","alta")] },
  { req: "Abertura horizontal (FOV)", exig: "≥ 100°", unidade: "°", modulo: "Óptica",
    origem: { doc: "Termo de Referência", pag: 12, trecho: "Campo de visão horizontal de no mínimo <mark>100°</mark>." },
    cells: [c("ok","103°","alta"),c("ok","103°","alta"),c("no","87°","alta"),c("ok","105°","media"),c("ok","102°","alta"),c("no","85°","alta"),c("no","98°","media")] },
  { req: "Sensibilidade noturna (colorido)", exig: "≤ 0,005 Lux", unidade: "Lux", modulo: "Óptica",
    origem: { doc: "Termo de Referência", pag: 12, trecho: "Sensibilidade em modo colorido de no máximo <mark>0,005 Lux</mark>." },
    cells: [c("ok","0,003 Lux","alta"),c("ok","0,005 Lux","media"),c("no","0,01 Lux","media"),c("ok","0,0005 Lux","baixa"),c("ok","0,003 Lux","alta"),c("no","0,02 Lux","media"),c("no","0,01 Lux","media")] },
  { req: "Alcance do infravermelho (IR)", exig: "≥ 30 m", unidade: "m", modulo: "Visão noturna",
    origem: { doc: "Termo de Referência", pag: 13, trecho: "Iluminação infravermelha com alcance mínimo de <mark>30 metros</mark>." },
    cells: [c("ok","30 m","alta"),c("ok","30 m","alta"),c("ok","30 m","alta"),c("ok","40 m","alta"),c("ok","30 m","alta"),c("ok","32 m","alta"),c("ok","30 m","media")] },
  { req: "Análise inteligente embarcada", exig: "Sim", modulo: "Inteligência",
    origem: { doc: "Termo de Referência", pag: 14, trecho: "Deverá possuir <mark>análise inteligente embarcada</mark> (deep learning)." },
    cells: [c("ok","Sim","alta"),c("ok","Sim","alta"),c("no","Não","alta"),c("ok","Sim","media"),c("ok","Sim","alta"),c("no","Não","alta"),c("ok","Sim","media")] },
  { req: "Detecção de cruzamento de linha", exig: "Sim", modulo: "Inteligência",
    origem: { doc: "Termo de Referência", pag: 14, trecho: "Detecção por <mark>cruzamento de linha</mark> e intrusão de área." },
    cells: [c("ok","Sim","alta"),c("ok","Sim","alta"),c("ok","Sim","media"),c("ok","Sim","alta"),c("ok","Sim","alta"),c("no","Não","alta"),c("ok","Sim","media")] },
  { req: "Detecção facial", exig: "Sim", modulo: "Inteligência",
    origem: { doc: "Termo de Referência", pag: 14, trecho: "Capacidade de <mark>detecção facial</mark> com captura de instantâneo." },
    cells: [c("no","Não","media"),c("no","Não","media"),c("no","Não","alta"),c("no","Não","media"),c("ok","Sim","media"),c("no","Não","alta"),c("no","Não","media")] },
  { req: "Grau de proteção", exig: "IP67", modulo: "Proteção",
    origem: { doc: "Termo de Referência", pag: 13, trecho: "Grau de proteção mínimo <mark>IP67</mark>." },
    cells: [c("ok","IP67","alta"),c("ok","IP67","alta"),c("no","IP66","alta"),c("ok","IP67","alta"),c("no","IP66","alta"),c("no","IP66","alta"),c("ok","IP67","alta")] },
  { req: "Proteção contra impacto", exig: "IK10", modulo: "Proteção",
    origem: { doc: "Termo de Referência", pag: 13, trecho: "Resistência a impacto de no mínimo <mark>IK10</mark>." },
    cells: [c("ok","IK10","alta"),c("no","IK08","alta"),c("ok","IK10","media"),c("no","IK08","alta"),c("ok","IK10","alta"),c("no","IK08","alta"),c("no","IK08","alta")] },
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
  cl("Operação assistida 24×7", "24×7 por 12 meses", "Operação", "ok", "alta", "Empresa oferece operação assistida 24×7 com equipe em regime de plantão.", 20, "<mark>Operação assistida 24 horas</mark>, 7 dias por semana, por 12 meses."),
  cl("Equipe técnica certificada", "Certificação do fabricante", "Equipe", "ok", "media", "Equipe possui certificação do fabricante das câmeras.", 21, "Equipe <mark>técnica certificada</mark> pelo fabricante."),
  cl("Garantia e manutenção corretiva", "36 meses", "Garantia", "ok", "alta", "Garantia e manutenção corretiva de 36 meses inclusas na proposta.", 22, "<mark>Garantia e manutenção corretiva</mark> por 36 meses."),
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

/* checklist de SOFTWARE que ATENDE tudo (cenários positivos) */
const SOFTWARE_OK = [
  cl("Gestão por perfis de usuário", "Sim", "Acesso", "ok", "alta", "Perfis e permissões por usuário.", 23, "<mark>Gestão por perfis</mark> de usuário."),
  cl("Autenticação em dois fatores (2FA)", "Sim", "Segurança", "ok", "alta", "2FA nativo incluído.", 24, "<mark>Autenticação em dois fatores</mark>."),
  cl("Registro de auditoria (logs)", "Sim", "Auditoria", "ok", "alta", "Trilha de auditoria completa.", 24, "<mark>Registro de auditoria</mark> de ações."),
  cl("Integração via API REST", "Sim", "Integração", "ok", "media", "API REST documentada.", 25, "Integração via <mark>API REST</mark>."),
  cl("Aplicativo mobile", "Sim", "Mobile", "ok", "alta", "App iOS/Android incluído.", 25, "<mark>Aplicativo mobile</mark> para visualização."),
];

/* checklist de SOFTWARE com análise NÃO FINALIZADA: 3 avaliados + 2 ainda "não avaliado" (ne).
   Demonstra o estado "em análise": em vez de aderência, o card mostra o quanto já foi analisado (60%). */
const SOFTWARE_PARCIAL = [
  cl("Gestão de vídeo (VMS) multiusuário", "Sim", "VMS", "ok", "alta", "Plataforma VMS com perfis e múltiplos usuários simultâneos.", 23, "<mark>Software de gestão de vídeo</mark> multiusuário."),
  cl("Aplicativo mobile gratuito", "Sim", "Mobile", "ok", "alta", "App iOS/Android gratuito incluído.", 25, "<mark>Aplicativo mobile gratuito</mark> para visualização."),
  cl("Reconhecimento facial em tempo real", "Sim", "Analítico", "no", "media", "Módulo facial disponível apenas na versão enterprise, não incluída na proposta.", 24, "<mark>Reconhecimento facial em tempo real</mark>."),
  cl("Integração com cerco virtual", "Sim", "Integração", "ne", "", "", 25, "Integração com <mark>cerco virtual fixo e móvel</mark>."),
  cl("Armazenamento em nuvem", "Opcional", "Storage", "ne", "", "", 26, "<mark>Armazenamento em nuvem</mark> opcional."),
];

/* Requisitos que a IA identificou no edital, mas não conseguiu extrair o VALOR EXIGIDO.
   O valor de cada SKU (catálogo do cliente) nós temos; o que falta é a exigência do edital
   para fazer o match. vals segue a ordem de SKUS. */
const NAO_ANALISADAS = [
  { req: "WDR (faixa dinâmica)",                unidade: "dB", valorEdital: "≥ 120 dB", trecho: "Faixa dinâmica (WDR) de no mínimo 120 dB.", vals: ["120 dB", "120 dB", "120 dB", "120 dB", "140 dB", "100 dB", "120 dB"] },
  { req: "Estabilização eletrônica de imagem",  valorEdital: "Sim", trecho: "Deverá possuir estabilização eletrônica de imagem.", vals: ["Sim", "Sim", "Não", "Sim", "Sim", "Não", "Sim"] },
  { req: "Filtro mecânico IR-Cut",              valorEdital: "Sim", trecho: "Filtro mecânico de corte de infravermelho (IR-Cut).", vals: ["Sim", "Sim", "Sim", "Sim", "Sim", "Sim", "Sim"] },
  { req: "Garantia mínima",                     unidade: "meses", valorEdital: "36 meses", trecho: "Garantia mínima de 36 (trinta e seis) meses.", vals: ["36 meses", "36 meses", "24 meses", "36 meses", "36 meses", "12 meses", "24 meses"] },
  { req: "Certificação Anatel",                 valorEdital: "Homologado", trecho: "Equipamentos homologados pela Anatel.", vals: ["Homologado", "Homologado", "Homologado", "Homologado", "Homologado", "Homologado", "Homologado"] },
];
/* Specs que o SKU tem mas o edital NÃO exige. Viram linha de "diferencial" na tabela (opção B):
   comparam os SKUs entre si, sem atende/não atende, e não contam no match. vals segue a ordem de SKUS. */
const CATALOGO_NAO_EDITAL = [
  { req: "Zoom digital 16×",   vals: ["16×", "16×", "8×", "16×", "4×", "8×", "16×"] },
  { req: "Microfone embutido", vals: ["Sim", "Sim", "Não", "Sim", "Sim", "Não", "Não"] },
  { req: "Sirene integrada",   vals: ["Não", "Não", "Não", "Sim", "Não", "Não", "Sim"] },
];

/* ============================================================
   CATÁLOGO de especificações (vocabulário controlado).
   Regra da Alice: um requisito do edital só entra na comparação se estiver no catálogo.
   Cada spec define nome, unidade, domínio (numero/lista/booleano), operador e o valor dos SKUs
   (que vêm do catálogo do cliente). Aqui só as specs que o usuário pode ADICIONAR (não estão na matriz base).
   valsPorSku segue a ordem de SKUS (câmera). ============================================================ */
const CATALOGO_SPECS = [
  { nome: "Alimentação", unidade: "V", dominio: "numero", operador: "=", trecho: "As câmeras deverão ser alimentadas em 24V.", valorEdital: "24", valsPorSku: ["12","12","12","24","12","12","12"] },
  { nome: "Compensação de luz de fundo (BLC)", unidade: "", dominio: "booleano", trecho: "Deverá possuir compensação de luz de fundo (BLC).", valorEdital: "Sim", valsPorSku: ["Sim","Sim","Não","Sim","Sim","Não","Sim"] },
  { nome: "Máscara de privacidade", unidade: "", dominio: "booleano", trecho: "Suporte a máscara de privacidade configurável.", valorEdital: "Sim", valsPorSku: ["Sim","Sim","Sim","Sim","Sim","Não","Sim"] },
  { nome: "Perfis de streaming simultâneos", unidade: "perfis", dominio: "numero", operador: "≥", trecho: "No mínimo 3 perfis de streaming simultâneos.", valorEdital: "3", valsPorSku: ["3","3","2","3","3","2","3"] },
  { nome: "Suporte ONVIF (Perfil S)", unidade: "", dominio: "booleano", trecho: "Compatibilidade com ONVIF Perfil S.", valorEdital: "Sim", valsPorSku: ["Sim","Sim","Sim","Sim","Sim","Sim","Sim"] },
  { nome: "Adaptador de montagem", unidade: "", dominio: "lista", opcoes: ["Suporte de teto","Suporte de parede","Suporte de poste"], trecho: "Fornecimento com suporte de poste.", valorEdital: "Suporte de poste", valsPorSku: ["Suporte de parede","Suporte de parede","Suporte de poste","Suporte de teto","Suporte de poste","Suporte de parede","Suporte de poste"] },
  { nome: "Temperatura de cor ajustável", unidade: "", dominio: "booleano", trecho: "Ajuste de temperatura de cor (balanço de branco).", valorEdital: "Sim", valsPorSku: ["Sim","Sim","Sim","Sim","Sim","Sim","Não"] },
];

/* ============================================================
   Dataset TI — Firewall (Fortinet) para o caso de COMPOSIÇÃO (caixa + licença + garantia)
   ============================================================ */
const SKUS_FW = [
  { model: "FortiGate-200F", brand: "Fortinet", preco: 42000, estoque: true,  origem: "catalogo", datasheet: "fortigate-200f.pdf" },
  { model: "FortiGate-120G", brand: "Fortinet", preco: 31000, estoque: true,  origem: "catalogo", datasheet: "fortigate-120g.pdf" },
  { model: "FortiGate-100F", brand: "Fortinet", preco: 24000, estoque: false, origem: "catalogo", datasheet: "fortigate-100f.pdf" },
  { model: "FortiGate-80F",  brand: "Fortinet", preco: 15000, estoque: true,  origem: "internet", datasheet: null },
];
const REQS_FW = [
  { req: "Throughput de Firewall", exig: "≥ 10 Gbps", unidade: "Gbps", modulo: "Desempenho",
    origem: { doc: "Termo de Referência", pag: 31, trecho: "Throughput de firewall de no mínimo <mark>10 Gbps</mark>." },
    cells: [c("ok","27 Gbps","alta"),c("ok","21 Gbps","alta"),c("ok","20 Gbps","alta"),c("no","10 Gbps","alta")] },
  { req: "Throughput de Threat Protection", exig: "≥ 1,5 Gbps", modulo: "Desempenho",
    origem: { doc: "Termo de Referência", pag: 31, trecho: "Throughput de threat protection (IPS+AV+App Ctrl) de no mínimo <mark>1,5 Gbps</mark>." },
    cells: [c("ok","3 Gbps","alta"),c("ok","2,2 Gbps","alta"),c("no","1 Gbps","alta"),c("no","900 Mbps","alta")] },
  { req: "Sessões concorrentes", exig: "≥ 1.000.000", modulo: "Capacidade",
    origem: { doc: "Termo de Referência", pag: 32, trecho: "Suporte a no mínimo <mark>1.000.000 de sessões concorrentes</mark>." },
    cells: [c("ok","1.500.000","alta"),c("ok","1.100.000","alta"),c("ok","1.000.000","media"),c("no","700.000","alta")] },
  { req: "Interfaces 1GbE (RJ45)", exig: "≥ 16 portas", unidade: "portas", modulo: "Interfaces",
    origem: { doc: "Termo de Referência", pag: 32, trecho: "No mínimo <mark>16 interfaces 1GbE RJ45</mark>." },
    cells: [c("ok","18 portas","alta"),c("ok","16 portas","alta"),c("no","14 portas","alta"),c("no","10 portas","alta")] },
  { req: "Túneis VPN IPsec", exig: "≥ 2.000", modulo: "VPN",
    origem: { doc: "Termo de Referência", pag: 33, trecho: "Suporte a no mínimo <mark>2.000 túneis VPN IPsec</mark> site-to-site." },
    cells: [c("ok","6.000","alta"),c("ok","2.500","alta"),c("ok","2.000","alta"),c("no","1.500","media")] },
  { req: "Alta disponibilidade (HA)", exig: "Sim (ativo/passivo)", modulo: "Disponibilidade",
    origem: { doc: "Termo de Referência", pag: 33, trecho: "Operação em <mark>alta disponibilidade</mark> ativo/passivo e ativo/ativo." },
    cells: [c("ok","Sim","alta"),c("ok","Sim","alta"),c("ok","Sim","alta"),c("ok","Sim","media")] },
  { req: "Interfaces SFP+ 10GbE", exig: "≥ 4 portas", unidade: "portas", modulo: "Interfaces",
    origem: { doc: "Termo de Referência", pag: 32, trecho: "No mínimo <mark>4 interfaces SFP+ 10GbE</mark>." },
    cells: [c("ok","8 portas","alta"),c("ok","4 portas","alta"),c("no","2 portas","alta"),c("no","0 portas","alta")] },
];
/* licença e garantia entram como CHECKLIST (atende / não), são part numbers que somam à composição */
const LICENCA_FW = [
  cl("Bundle UTP (IPS, AV, Web/DNS, App Ctrl)", "Sim", "Licença", "ok", "alta", "Pacote FortiGuard UTP cobre IPS, antivírus, filtro web/DNS e controle de aplicação.", 34, "Subscrição de segurança com <mark>IPS, antivírus, filtro web e controle de aplicação</mark>."),
  cl("Subscrição mínima de 36 meses", "36 meses", "Licença", "ok", "alta", "Part number de subscrição de 36 meses disponível.", 34, "Subscrição das funcionalidades de segurança por <mark>36 (trinta e seis) meses</mark>."),
  cl("Sandbox / proteção avançada (ATP)", "Sim", "Licença", "no", "media", "ATP/Sandbox não incluso no bundle UTP; exige bundle ATP (custo adicional).", 35, "Proteção avançada contra ameaças (<mark>sandbox / ATP</mark>)."),
];
const GARANTIA_FW = [
  cl("Suporte do fabricante 24×7", "FortiCare 24×7", "Garantia", "ok", "alta", "FortiCare Premium 24×7 disponível como part number de serviço.", 36, "Suporte técnico do fabricante <mark>24 horas por dia, 7 dias por semana</mark>."),
  cl("Troca de hardware (RMA) com envio antecipado", "Sim", "Garantia", "ok", "media", "RMA com Advanced Hardware Replacement incluído no FortiCare.", 36, "Garantia com <mark>troca antecipada de hardware (RMA)</mark>."),
  cl("Prazo de garantia", "36 meses", "Garantia", "ok", "alta", "Serviço de garantia contratável por 36 meses, alinhado à licença.", 36, "Garantia de <mark>36 meses</mark> para o hardware e serviço."),
];
const CATALOGO_NAO_EDITAL_FW = ["Fonte redundante (RPS)", "Módulo Wi-Fi", "FortiToken (MFA)"];

/* ============================================================
   ITENS do edital — modelo de COMPOSIÇÃO.
   Um item NÃO tem mais "tipo": ele é uma lista de COMPONENTES. Cada componente tem a sua
   mecânica: "produto" (comparar/escolher SKU, matriz) ou "checklist" (atende/não atende).
   Um item da vida real é quase sempre uma composição (ex.: caixa + licença + garantia).
   titulo = "o que é o item" em linguagem clara; nome = descrição completa.
   ============================================================ */
/* CENÁRIOS DE CARD (para design): um item por estado possível. Produto, Software e Serviço.
   PROD_OK = há SKU que atende 100% (override em Detecção facial no SKU0). PROD_FAIL = nenhum SKU 100% (melhor = 93%).
   SOFTWARE_OK = checklist tudo atende. SOFTWARE_VMS = checklist com exigência não atendida. */
const PROD_CAM = ov => ({ mecanica: "produto", rotulo: "Câmera (hardware)", skus: SKUS, reqs: REQS, naoAnalisadas: NAO_ANALISADAS, catalogoNaoEdital: CATALOGO_NAO_EDITAL, overrides: ov ? [{ ri: 8, ci: 0, st: "ok", v: "Sim", c: "alta" }] : [] });
const SOFTWARE_LISTS = { ok: SOFTWARE_OK, vms: SOFTWARE_VMS, parcial: SOFTWARE_PARCIAL };
// variante: "ok" (tudo atende) | "vms" (completo, com um não atende) | "parcial" (análise não finalizada). Aceita boolean legado (true=ok, false=vms).
const CHK = (rotulo, variante) => { const key = variante === true ? "ok" : variante === false ? "vms" : variante; return { mecanica: "checklist", rotulo, lista: (SOFTWARE_LISTS[key] || SOFTWARE_OK).map(r => ({ ...r })) }; };

const ITEMS = [
  // 1) SÓ PRODUTO · NÃO ATENDE (nenhum SKU atende 100%)
  { titulo: "Câmeras LPR (leitura de placas)", numero: "1", tipo: "Câmera de segurança",
    nome: "Fornecimento de 80 câmeras IP modelo LPR (leitura de placas) para o anel viário, conforme Termo de Referência.",
    quantidade: "80", precoUnit: 2980, unidadeMedida: "unidade",
    resumoTR: "Aquisição de 80 câmeras IP com leitura de placas (LPR). Compare os SKUs do seu catálogo com a exigência do edital.",
    descricao: "Fornecimento, instalação e configuração de 80 (oitenta) câmeras IP com tecnologia de leitura automática de placas (LPR), destinadas ao monitoramento do anel viário do município, com resolução mínima de 4 MP, lente adequada à captura de placas de veículos em movimento, iluminação infravermelha, grau de proteção IP67 e alimentação via PoE, incluindo suportes de fixação, cabeamento estruturado e todos os acessórios necessários à perfeita instalação, conforme especificações técnicas detalhadas no Termo de Referência (Anexo I) e demais condições estabelecidas no edital.",
    componentes: [ PROD_CAM(false) ] },

  // 2) SÓ PRODUTO · ATENDE (recomendado, sem escolha feita)
  { titulo: "Câmeras dome fixas 4MP", numero: "2", tipo: "Câmera de segurança",
    nome: "Fornecimento de 60 câmeras dome fixas 4MP para ambientes internos.",
    quantidade: "60", precoUnit: 1740, unidadeMedida: "unidade",
    resumoTR: "Aquisição de 60 câmeras dome fixas. Há SKU no catálogo que atende a todos os requisitos.",
    descricao: "Fornecimento e instalação de 60 (sessenta) câmeras IP tipo dome fixas de 4 MP para ambientes internos, com lente fixa, iluminação infravermelha, análise inteligente embarcada e alimentação via PoE, incluindo suportes de fixação, cabeamento e demais acessórios necessários, conforme especificações técnicas detalhadas no Termo de Referência (Anexo I) e nas demais condições estabelecidas no edital.",
    componentes: [ PROD_CAM(true) ] },

  // 3) SÓ PRODUTO · ATENDE · com PRODUTO ESCOLHIDO (seed no boot)
  { titulo: "Câmeras bullet fixas", numero: "3", tipo: "Câmera de segurança",
    nome: "Fornecimento de 100 câmeras bullet fixas para o perímetro externo.",
    quantidade: "100", precoUnit: 2210, unidadeMedida: "unidade",
    resumoTR: "Aquisição de 100 câmeras bullet. Um SKU já foi escolhido para a proposta.",
    descricao: "Fornecimento, instalação e configuração de 100 (cem) câmeras IP tipo bullet fixas destinadas ao monitoramento do perímetro externo da unidade, com resolução mínima de 4 MP, lente fixa, iluminação infravermelha com alcance mínimo de 30 metros, grau de proteção IP67, proteção contra impacto IK10, alimentação via PoE e slot para cartão microSD, incluindo suportes de fixação, cabeamento estruturado e todos os acessórios necessários à perfeita instalação, conforme especificações técnicas detalhadas no Termo de Referência (Anexo I) e demais condições estabelecidas no edital.",
    componentes: [ PROD_CAM(true) ] },

  // 4) SÓ SOFTWARE · ATENDE (checklist tudo atende)
  { titulo: "Software de controle de acesso", numero: "4", tipo: "Software de controle de acesso",
    nome: "Licença de software de controle de acesso integrado ao videomonitoramento.",
    quantidade: "1", precoUnit: 98000, unidadeMedida: "licença",
    resumoTR: "Licenciamento de software de controle de acesso. Confirme se a sua solução atende a cada exigência.",
    componentes: [ CHK("Software de controle de acesso", true) ] },

  // 5) SÓ SOFTWARE · NÃO ATENDE (checklist com exigência não atendida)
  { titulo: "Software de gestão de vídeo (VMS)", numero: "5", tipo: "Software de gestão de vídeo",
    nome: "Licença de software de gestão de vídeo (VMS) com leitura de placas (LPR) e cerco virtual.",
    quantidade: "1", precoUnit: 145000, unidadeMedida: "licença",
    resumoTR: "Licenciamento do VMS. Confirme cada funcionalidade exigida; há exigências não atendidas.",
    componentes: [ CHK("Software de gestão de vídeo (VMS)", "parcial") ] },

  // 6) SÓ SERVIÇO · ATENDE (mecânica checklist aplicada a um serviço: instalação, rede, integração, operação, equipe, garantia)
  { titulo: "Instalação e configuração do sistema de CFTV", numero: "6", tipo: "Serviço de instalação",
    nome: "Serviço de instalação, configuração, integração e operação assistida do sistema de videomonitoramento.",
    quantidade: "1", precoUnit: 320000, unidadeMedida: "serviço",
    resumoTR: "Contratação do serviço de instalação e configuração. Confirme se a sua empresa atende a cada exigência do Termo de Referência.",
    descricao: "Prestação dos serviços de instalação física dos equipamentos, lançamento de infraestrutura de rede, configuração e integração ao software de gestão de vídeo (VMS), operação assistida, disponibilização de equipe técnica certificada e garantia com manutenção corretiva do sistema de videomonitoramento, conforme especificações detalhadas no Termo de Referência (Anexo I) e demais condições estabelecidas no edital.",
    componentes: [ { mecanica: "checklist", rotulo: "Serviço de instalação e configuração", lista: SERVICO_INSTALL.map(r => ({ ...r })) } ] },

  // 7) NÃO PROCESSADO (produto): a extração automática não encontrou nenhuma especificação. Não pode marcar "atende".
  //    Resolução (reunião Alice 24/08): extração MANUAL do edital (produto). A extração popula as especificações.
  { titulo: "Câmeras de monitoramento (lote)", numero: "7", tipo: "Câmera de segurança",
    nome: "Fornecimento de câmeras de monitoramento para o município, conforme Termo de Referência.",
    quantidade: "40", precoUnit: 2100, unidadeMedida: "unidade",
    resumoTR: "Item cuja extração automática não encontrou especificações (não processado).",
    descricao: "Fornecimento e instalação de câmeras IP para monitoramento urbano, conforme especificações técnicas detalhadas no Termo de Referência (Anexo I) e nas demais condições estabelecidas no edital.",
    componentes: [ { mecanica: "produto", rotulo: "Câmera (hardware)", skus: SKUS, reqs: [], naoAnalisadas: [], catalogoNaoEdital: [], overrides: [] } ] },

];
