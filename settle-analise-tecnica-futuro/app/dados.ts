// Análise Técnica multi-tipo (produto / serviço / software / solução).
// Estados de célula da matriz: ok | no | ne | na, com confiança alta | media | baixa.
// Estados do checklist (atende / não atende): ok | no | parcial | ne.

export type Confianca = "alta" | "media" | "baixa"
export type EstadoCelula = "ok" | "no" | "ne" | "na"
export type EstadoChecklist = "ok" | "no" | "parcial" | "ne"
export type Tipo = "produto" | "servico" | "software" | "solucao"

/** Marca "sem valor" (não extraído / não exigido). */
export const VAZIO = "–"

export type Origem = { doc: string; pag: number | null; trecho?: string }
export type Celula = { st: EstadoCelula; v: string; c?: Confianca }
export type Especificacao = {
  id: string
  req: string
  exig: string
  exigNa?: boolean
  modulo?: string
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
  origem: Origem
}

export const EDITAL = {
  numero: "R043/2026",
  orgao: "Prefeitura Municipal de Conselheiro Lafaiete",
  uf: "MG",
}

/* catálogo de SKUs (produto) */
export const SKUS = [
  { model: "DS-2CD2143G2-I", brand: "Hikvision" },
  { model: "DS-2CD2043G2-IU", brand: "Hikvision" },
  { model: "VIP-3230-B-IA", brand: "Intelbras" },
  { model: "IPC-HFW2431S-S2", brand: "Dahua" },
  { model: "DS-2CD2086G2-IU", brand: "Hikvision" },
  { model: "VIP-1230-B", brand: "Intelbras" },
  { model: "IPC-HDW1431S", brand: "Dahua" },
]

const c = (st: EstadoCelula, v: string, conf?: Confianca): Celula => ({ st, v, c: conf })
const TR = "Termo de Referência"

/* requisitos de produto (matriz base) */
const REQS: Omit<Especificacao, "id">[] = [
  { req: "Resolução", exig: "4 MP (2688×1520)", modulo: "Vídeo",
    origem: { doc: TR, pag: 11, trecho: "As câmeras deverão possuir resolução mínima de <mark>4 MP (2688 × 1520 pixels)</mark>." },
    cells: [c("ok","4 MP","alta"),c("ok","4 MP","alta"),c("no","2 MP","alta"),c("ok","4 MP","alta"),c("ok","8 MP","media"),c("no","2 MP","alta"),c("ok","4 MP","alta")] },
  { req: "Compressão de vídeo", exig: "H.265+", modulo: "Vídeo",
    origem: { doc: TR, pag: 11, trecho: "Suporte a compressão <mark>H.265+</mark> / H.265 / H.264." },
    cells: [c("ok","H.265+","alta"),c("ok","H.265+","alta"),c("ok","H.265+","media"),c("ok","H.265+","alta"),c("ok","H.265+","alta"),c("ok","H.265+","alta"),c("ok","H.265+","media")] },
  { req: "Distância focal", exig: "2.8 mm", modulo: "Óptica",
    origem: { doc: TR, pag: 12, trecho: "Lente fixa de <mark>2,8 mm</mark>, F2.0 ou inferior." },
    cells: [c("ok","2.8 mm","alta"),c("ok","2.8 mm","alta"),c("no","3.6 mm","alta"),c("ok","2.8 mm","alta"),c("no","3.6 mm","alta"),c("no","3.6 mm","alta"),c("ok","2.8 mm","alta")] },
  { req: "Abertura horizontal (FOV)", exig: "≥ 100°", modulo: "Óptica",
    origem: { doc: TR, pag: 12, trecho: "Campo de visão horizontal de no mínimo <mark>100°</mark>." },
    cells: [c("ok","103°","alta"),c("ok","103°","alta"),c("no","87°","alta"),c("ok","105°","media"),c("ok","102°","alta"),c("no","85°","alta"),c("no","98°","media")] },
  { req: "Sensibilidade noturna (colorido)", exig: "≤ 0,005 Lux", modulo: "Óptica",
    origem: { doc: TR, pag: 12, trecho: "Sensibilidade em modo colorido de no máximo <mark>0,005 Lux</mark>." },
    cells: [c("ok","0,003 Lux","alta"),c("ok","0,005 Lux","media"),c("no","0,01 Lux","media"),c("ok","0,0005 Lux","baixa"),c("ok","0,003 Lux","alta"),c("no","0,02 Lux","media"),c("ne",VAZIO,"baixa")] },
  { req: "Alcance do infravermelho (IR)", exig: "≥ 30 m", modulo: "Visão noturna",
    origem: { doc: TR, pag: 13, trecho: "Iluminação infravermelha com alcance mínimo de <mark>30 metros</mark>." },
    cells: [c("ok","30 m","alta"),c("ok","30 m","alta"),c("ok","30 m","alta"),c("ok","40 m","alta"),c("ok","30 m","alta"),c("ok","32 m","alta"),c("ok","30 m","media")] },
  { req: "Análise inteligente embarcada", exig: "Sim", modulo: "Inteligência",
    origem: { doc: TR, pag: 14, trecho: "Deverá possuir <mark>análise inteligente embarcada</mark> (deep learning)." },
    cells: [c("ok","Sim","alta"),c("ok","Sim","alta"),c("no","Não","alta"),c("ok","Sim","media"),c("ok","Sim","alta"),c("no","Não","alta"),c("ok","Sim","media")] },
  { req: "Detecção de cruzamento de linha", exig: "Sim", modulo: "Inteligência",
    origem: { doc: TR, pag: 14, trecho: "Detecção por <mark>cruzamento de linha</mark> e intrusão de área." },
    cells: [c("ok","Sim","alta"),c("ok","Sim","alta"),c("ne",VAZIO,"baixa"),c("ok","Sim","alta"),c("ok","Sim","alta"),c("no","Não","alta"),c("ok","Sim","media")] },
  { req: "Detecção facial", exig: "Sim", modulo: "Inteligência",
    origem: { doc: TR, pag: 14, trecho: "Capacidade de <mark>detecção facial</mark> com captura de instantâneo." },
    cells: [c("no","Não","media"),c("no","Não","media"),c("no","Não","alta"),c("no","Não","media"),c("ok","Sim","media"),c("no","Não","alta"),c("no","Não","media")] },
  { req: "Grau de proteção", exig: "IP67", modulo: "Proteção",
    origem: { doc: TR, pag: 13, trecho: "Grau de proteção mínimo <mark>IP67</mark>." },
    cells: [c("ok","IP67","alta"),c("ok","IP67","alta"),c("no","IP66","alta"),c("ok","IP67","alta"),c("no","IP66","alta"),c("no","IP66","alta"),c("ok","IP67","alta")] },
  { req: "Proteção contra impacto", exig: "IK10", modulo: "Proteção",
    origem: { doc: TR, pag: 13, trecho: "Resistência a impacto de no mínimo <mark>IK10</mark>." },
    cells: [c("ok","IK10","alta"),c("no","IK08","alta"),c("ok","IK10","media"),c("no","IK08","alta"),c("ok","IK10","alta"),c("ne",VAZIO,"baixa"),c("no","IK08","alta")] },
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

/** Correção pontual numa célula da matriz base (linha ri, SKU ci). */
type Ajuste = { ri: number; ci: number; st: EstadoCelula; v: string; c: Confianca }

let seq = 0
export const novoId = (prefixo: string) => `${prefixo}-${++seq}`

export function montarMatriz(ajustes: Ajuste[] = []): Especificacao[] {
  const m = REQS.map((r) => ({ ...r, id: novoId("req"), origem: { ...r.origem }, cells: r.cells.map((x) => ({ ...x })) }))
  ajustes.forEach((a) => (m[a.ri].cells[a.ci] = { st: a.st, v: a.v, c: a.c }))
  return m
}

/* checklist de SERVIÇO (mecânica atende / não atende) */
const cl = (
  req: string, exig: string, modulo: string, st: EstadoChecklist, conf: Confianca, just: string, pag: number, trecho: string
): Omit<LinhaChecklist, "id"> => ({ req, exig, modulo, st, c: conf, just, origem: { doc: TR, pag, trecho } })

const SERVICO_INSTALACAO = [
  cl("Instalação física e fixação das câmeras", "Conforme TR", "Instalação", "ok", "alta", "Empresa possui equipe e equipamentos para instalação em postes e fachadas.", 18, "Compreende a <mark>instalação física</mark> dos equipamentos em postes e fachadas."),
  cl("Lançamento de infraestrutura de rede", "Cabo óptico / UTP CAT6", "Rede", "ok", "alta", "Atende ao lançamento de fibra e UTP conforme projeto.", 19, "<mark>Lançamento de infraestrutura</mark> de rede óptica e metálica."),
  cl("Configuração e integração ao VMS", "Sim", "Configuração", "ok", "media", "Equipe certificada na integração ao software de gestão de vídeo.", 19, "Configuração e <mark>integração ao VMS</mark>."),
  cl("Operação assistida 24×7", "24×7 por 12 meses", "Operação", "no", "alta", "Empresa oferece operação assistida em horário comercial; não cobre 24×7.", 20, "<mark>Operação assistida 24 horas</mark>, 7 dias por semana, por 12 meses."),
  cl("Equipe técnica certificada", "Certificação do fabricante", "Equipe", "ok", "media", "Equipe possui certificação do fabricante das câmeras.", 21, "Equipe <mark>técnica certificada</mark> pelo fabricante."),
  cl("Garantia e manutenção corretiva", "36 meses", "Garantia", "parcial", "media", "Garantia padrão de 24 meses; 36 meses disponível com custo adicional.", 22, "<mark>Garantia e manutenção corretiva</mark> por 36 meses."),
]
/* checklist de SOFTWARE (software simples: atende / não atende) */
const SOFTWARE_VMS = [
  cl("Gestão de vídeo (VMS) multiusuário", "Sim", "VMS", "ok", "alta", "Plataforma VMS com perfis e múltiplos usuários simultâneos.", 23, "<mark>Software de gestão de vídeo</mark> multiusuário."),
  cl("Leitura automática de placas (LPR)", "Sim", "Analítico", "ok", "alta", "Módulo LPR nativo integrado ao VMS.", 24, "<mark>Leitura automatizada de placas veiculares (LPR)</mark>."),
  cl("Reconhecimento facial em tempo real", "Sim", "Analítico", "no", "media", "Módulo facial disponível apenas na versão enterprise, não incluída na proposta.", 24, "<mark>Reconhecimento facial em tempo real</mark>."),
  cl("Aplicativo mobile gratuito", "Sim", "Mobile", "ok", "alta", "App iOS/Android gratuito incluído.", 25, "<mark>Aplicativo mobile gratuito</mark> para visualização."),
  cl("Integração com cerco virtual", "Sim", "Integração", "parcial", "baixa", "Integração via API; cerco virtual requer módulo adicional.", 25, "Integração com <mark>cerco virtual fixo e móvel</mark>."),
  cl("Armazenamento em nuvem", "Opcional", "Storage", "ok", "media", "Oferece gravação em nuvem como opção contratável.", 26, "<mark>Armazenamento em nuvem</mark> opcional."),
]

/** Checklists compartilhados: o mesmo serviço/software aparece sozinho e dentro da solução. */
export type ChaveChecklist = "instalacao" | "vms"
export function montarChecklists(): Record<ChaveChecklist, LinhaChecklist[]> {
  const copiar = (lista: Omit<LinhaChecklist, "id">[]) => lista.map((r) => ({ ...r, id: novoId("cl"), origem: { ...r.origem } }))
  return { instalacao: copiar(SERVICO_INSTALACAO), vms: copiar(SOFTWARE_VMS) }
}

/** Chave da matriz de produto: item "0".."2" ou seção da solução "5:0". */
export type Secao =
  | { tipo: "produto"; titulo: string; matriz: string }
  | { tipo: "servico" | "software"; titulo: string; checklist: ChaveChecklist }

export type Item = {
  tipo: Tipo
  nome: string
  quantidade: string
  resumoTR: string
  matriz?: string
  checklist?: ChaveChecklist
  secoes?: Secao[]
}

/* itens do edital: cada um com um TIPO (a lente) e a mecânica correspondente */
export const ITENS: Item[] = [
  // PRODUTO (mecânica: comparar e escolher SKU)
  { tipo: "produto", nome: "Câmera de segurança: fornecimento de 80 câmeras, modelo LPR (leitura de placas)", quantidade: "80", matriz: "0",
    resumoTR: "Aquisição de 80 câmeras IP tipo bullet com leitura de placas (LPR) para o anel viário. Você precisa indicar, do seu catálogo, qual SKU atende às especificações e a que preço." },
  { tipo: "produto", nome: "Câmera de segurança: fornecimento de 100 câmeras, modelo Speed Dome", quantidade: "100", matriz: "1",
    resumoTR: "Aquisição de 100 câmeras Speed Dome (PTZ) para pontos de monitoramento ativo. Escolha o SKU do catálogo que melhor atende." },
  { tipo: "produto", nome: "Câmera de segurança: fornecimento de 100 câmeras, modelo Bullet", quantidade: "100", matriz: "2",
    resumoTR: "Aquisição de 100 câmeras bullet fixas para vigilância perimetral. Escolha o SKU do catálogo que melhor atende." },
  // SERVIÇO (mecânica: atende / não atende)
  { tipo: "servico", nome: "Serviço de instalação, configuração e operação assistida do sistema", quantidade: "1", checklist: "instalacao",
    resumoTR: "Contratação da empresa que vai instalar as câmeras, lançar a rede, integrar ao software e operar o sistema. Aqui não há escolha de SKU: você só precisa confirmar se consegue cumprir cada exigência do serviço." },
  // SOFTWARE (software simples: atende / não atende)
  { tipo: "software", nome: "Licença de software de gestão de vídeo (VMS) com LPR e cerco virtual", quantidade: "1", checklist: "vms",
    resumoTR: "Licenciamento do software que centraliza as câmeras, faz leitura de placas e cerco virtual. Software simples (não exige a análise técnica complexa): confirme se a sua solução atende a cada funcionalidade exigida." },
  // SOLUÇÃO (mistura produto + serviço + software, em seções)
  { tipo: "solucao", nome: "Solução completa de videomonitoramento (fornecimento + instalação + software)", quantidade: "1",
    resumoTR: "Item único que mistura tudo: fornecer as câmeras, instalar/operar e licenciar o software. A análise se quebra em três frentes: produto (escolher SKU), serviço (atende/não) e software (atende/não).",
    secoes: [
      { tipo: "produto", titulo: "Câmeras (fornecimento)", matriz: "5:0" },
      { tipo: "servico", titulo: "Instalação e operação", checklist: "instalacao" },
      { tipo: "software", titulo: "Software de monitoramento (VMS)", checklist: "vms" },
    ] },
]

export function montarMatrizes(): Record<string, Especificacao[]> {
  const deteccaoFacialOk: Ajuste[] = [{ ri: 8, ci: 0, st: "ok", v: "Sim", c: "alta" }]
  return { "0": montarMatriz(), "1": montarMatriz(deteccaoFacialOk), "2": montarMatriz(deteccaoFacialOk), "5:0": montarMatriz() }
}

export const NAO_ANALISADAS = ["Estabilização eletrônica de imagem","WDR 120 dB","Day/Night (ICR)","Compensação de luz de fundo (BLC)","Máscara de privacidade","ROI","Anti-flicker","Suporte ONVIF Perfil S/G/T","Streaming triplo","Watermark digital","Filtro IR-Cut","Detecção de violação (tamper)","Garantia mínima de 36 meses","Instalação e configuração","Treinamento operacional","Suporte técnico nacional","Certificação Anatel","Manual em português"]
export const CATALOGO_NAO_EDITAL = ["Zoom digital 16×","Microfone embutido","Sirene integrada"]

export const TIPO_ROTULO: Record<Tipo, string> = { produto: "Produto", servico: "Serviço", software: "Software", solucao: "Solução" }

/* ---------------- cálculos ---------------- */

export type Pontuacao = {
  i: number
  sku: (typeof SKUS)[number]
  ok: number
  evaluable: number
  ne: number
  pct: number
  diverg: string[]
}

export function pontuar(specs: Especificacao[]): Pontuacao[] {
  return SKUS.map((sku, i) => {
    let ok = 0, evaluable = 0, ne = 0
    const diverg: string[] = []
    specs.forEach((spec) => {
      if (spec.exigNa) return
      const cell = spec.cells[i]
      if (cell.st === "ok") { ok++; evaluable++ }
      else if (cell.st === "no") { evaluable++; diverg.push(spec.req) }
      else if (cell.st === "ne") ne++
    })
    return { i, sku, ok, evaluable, ne, pct: evaluable ? Math.round((ok / evaluable) * 100) : 0, diverg }
  })
}
export const ranquear = (p: Pontuacao[]) => [...p].sort((a, b) => b.pct - a.pct || a.ne - b.ne || b.ok - a.ok)
export const melhor = (specs: Especificacao[]) => ranquear(pontuar(specs))[0]
/** Todos os SKUs concordam (todos atendem ou todos não atendem). */
export const concordante = (spec: Especificacao) =>
  new Set(spec.cells.filter((x) => x.st === "ok" || x.st === "no").map((x) => x.st)).size <= 1

export function resumoChecklist(lista: LinhaChecklist[]) {
  const avaliadas = lista.filter((r) => r.st === "ok" || r.st === "no" || r.st === "parcial")
  const ok = lista.filter((r) => r.st === "ok").length
  const no = lista.filter((r) => r.st === "no").length
  return { ok, total: avaliadas.length, no, status: (no === 0 ? "ok" : "no") as "ok" | "no" }
}

export type Resumo =
  | { kind: "produto"; best: Pontuacao; status: "ok" | "no" }
  | { kind: "check"; ok: number; total: number; no: number; status: "ok" | "no" }
  | { kind: "solucao"; secs: { tipo: Secao["tipo"]; ok: boolean }[]; status: "ok" | "no" }

export function resumirItem(
  it: Item,
  matrizes: Record<string, Especificacao[]>,
  checklists: Record<ChaveChecklist, LinhaChecklist[]>
): Resumo {
  if (it.tipo === "produto") {
    const best = melhor(matrizes[it.matriz!])
    return { kind: "produto", best, status: best.diverg.length === 0 ? "ok" : "no" }
  }
  if (it.tipo === "servico" || it.tipo === "software") return { kind: "check", ...resumoChecklist(checklists[it.checklist!]) }
  const secs = (it.secoes ?? []).map((s) =>
    s.tipo === "produto"
      ? { tipo: s.tipo, ok: melhor(matrizes[s.matriz]).diverg.length === 0 }
      : { tipo: s.tipo, ok: resumoChecklist(checklists[s.checklist]).status === "ok" }
  )
  return { kind: "solucao", secs, status: secs.every((s) => s.ok) ? "ok" : "no" }
}

/** Divide o trecho do edital em partes normais e destacadas (<mark>). */
export function partesDoTrecho(trecho: string) {
  return trecho.split(/<mark>(.*?)<\/mark>/g).map((texto, i) => ({ texto, destaque: i % 2 === 1 }))
}

export const rotuloConfianca = (c: Confianca) => (c === "alta" ? "Alta" : c === "media" ? "Média" : "Baixa")

/* ---------------- preferências (localStorage) ---------------- */

export type Preferencias = {
  chosen: Record<number, number>
  filter: "all" | "ok" | "no"
  colW: Record<string, number>
  frozen: string[]
  diff: boolean
  conf: boolean
}
const CHAVE_PREFS = "settle-at-prefs-v6"

export function lerPreferencias(): Preferencias {
  let salvas: Partial<Preferencias> = {}
  try {
    salvas = JSON.parse(localStorage.getItem(CHAVE_PREFS) ?? "{}") ?? {}
  } catch {
    salvas = {}
  }
  return {
    chosen: salvas.chosen ?? {},
    filter: salvas.filter ?? "all",
    colW: salvas.colW ?? {},
    frozen: salvas.frozen ?? ["req", "val"],
    diff: !!salvas.diff,
    conf: salvas.conf !== false,
  }
}
export function salvarPreferencias(p: Preferencias) {
  try {
    localStorage.setItem(CHAVE_PREFS, JSON.stringify(p))
  } catch {
    /* sem armazenamento: segue só na sessão */
  }
}
