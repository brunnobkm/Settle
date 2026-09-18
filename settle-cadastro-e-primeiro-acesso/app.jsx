import React, { useState, useEffect, useRef } from "react";
import {
  ArrowRight, ArrowLeft, Check, X, Plus, Sparkles, Building2, Globe, FileText,
  Upload, ThumbsUp, ThumbsDown, Shield, Layers, MapPin, Info, Search, ListFilter,
  Lightbulb, ChevronRight, ChevronDown, CheckCircle2, Pencil, AlertTriangle, Eye, Zap, Trash2,
  MessageSquareText, GitMerge, Square, CheckSquare, BarChart3, Boxes, TrendingUp, Undo2,
  RefreshCw, Bell, Link2, Share2, Folder, FolderX, Bookmark,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Settle — protótipo de onboarding (4 etapas)
// Cadastro -> 1 Sobre você -> 2 Confirmar & organizar -> 3 Segmentos (volume)
//   -> 4 Ajustar & validar (volume reativo) -> Licitações
// ---------------------------------------------------------------------------

const STEPS = [
  { id: "cadastro", label: "Cadastro" },
  { id: "entrada", label: "Sobre você" },
  { id: "confirmar", label: "Confirmar" },
  { id: "segmentos", label: "Segmentos" },
  { id: "ajustar", label: "Ajustar" },
  { id: "licitacoes", label: "Licitações" },
];

// conjuntos de segmentos por eixo de organização
const SEG_SETS = {
  produto: [
    { id: "p1", nome: "Tablets e dispositivos móveis", pos: ["tablet", "tablet educacional", "dispositivo móvel"], neg: ["capa", "película"], filtros: ["Exclui ME/EPP"], regras: [], temPrompt: true },
    { id: "p2", nome: "Notebooks e desktops", pos: ["notebook", "desktop", "computador", "all-in-one"], neg: [], filtros: ["Valor ≥ R$ 200 mil"], regras: [], temPrompt: true },
    { id: "p3", nome: "Kits educacionais", pos: ["kit tecnológico", "lousa digital", "laboratório de informática"], neg: [], filtros: ["Só modalidade Pregão"], regras: [], temPrompt: false },
  ],
  regiao: [
    { id: "r1", nome: "Sudeste + Sul", pos: ["tablet", "notebook", "desktop", "kit tecnológico"], neg: ["capa", "película"], filtros: [], regras: [], temPrompt: true },
    { id: "r2", nome: "Norte + Nordeste", pos: ["tablet", "notebook", "desktop", "kit tecnológico"], neg: ["capa", "película"], filtros: [], regras: [{ modo: "manter", condicoes: [{ campo: "capag", op: "≥", valor: "B" }] }], temPrompt: true },
  ],
  unico: [
    { id: "u1", nome: "Todas as licitações de TI", pos: ["tablet", "notebook", "desktop", "computador", "kit tecnológico", "dispositivo móvel"], neg: ["capa", "película", "treinamento"], filtros: ["Exclui ME/EPP"], regras: [], temPrompt: true },
  ],
};

const clone = (arr) => arr.map((s) => ({ ...s, pos: [...s.pos], neg: [...s.neg], filtros: [...s.filtros], regras: [...(s.regras || [])] }));

const ESTADOS = ["AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA", "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR", "RJ", "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO"];
const CAMPOS = {
  regiao: { label: "Região", ops: ["é", "não é"], tipo: "select", opcoes: ["Norte", "Nordeste", "Centro-Oeste", "Sudeste", "Sul"] },
  estado: { label: "Estado", ops: ["é", "não é"], tipo: "select", opcoes: ESTADOS },
  capag: { label: "CAPAG", ops: ["≥", "="], tipo: "select", opcoes: ["A", "B", "C", "D"] },
  valor: { label: "Valor do edital", ops: ["≥", "≤"], tipo: "moeda" },
  habitantes: { label: "Habitantes", ops: ["≥", "≤"], tipo: "numero" },
  modelo: { label: "Modelo de contrato", ops: ["é", "não é"], tipo: "select", opcoes: ["Pregão", "Dispensa", "Inexigibilidade", "Concorrência", "Credenciamento", "Concurso", "Leilão"] },
};
const primeiroValor = (campo) => (CAMPOS[campo].tipo === "select" ? CAMPOS[campo].opcoes[0] : "");
const fmtValor = (campo, valor) => (campo === "valor" ? "R$ " + (Number(valor) || 0).toLocaleString("pt-BR") : campo === "habitantes" ? (Number(valor) || 0).toLocaleString("pt-BR") + " hab" : valor);
const fmtCond = (c) => `${CAMPOS[c.campo].label} ${c.op} ${fmtValor(c.campo, c.valor)}`;
const PROMPT_PADRAO = "Só me interessa fornecimento do dispositivo como equipamento final. Descarte acessórios avulsos (capas, películas) e serviços (treinamento, manutenção).";

// --- validação de cadastro --------------------------------------------------
const soDigitos = (v) => (v || "").replace(/\D/g, "");
const formatarCNPJ = (v) => soDigitos(v).slice(0, 14)
  .replace(/^(\d{2})(\d)/, "$1.$2")
  .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
  .replace(/\.(\d{3})(\d)/, ".$1/$2")
  .replace(/(\d{4})(\d)/, "$1-$2");
function cnpjValido(v) {
  const c = soDigitos(v);
  if (c.length !== 14 || /^(\d)\1{13}$/.test(c)) return false; // 14 dígitos e não todos iguais
  const d = c.split("").map(Number);
  const dv = (len) => {
    const pesos = len === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let soma = 0; for (let i = 0; i < len; i++) soma += d[i] * pesos[i];
    const r = soma % 11; return r < 2 ? 0 : 11 - r;
  };
  return dv(12) === d[12] && dv(13) === d[13];
}
const emailValido = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((e || "").trim());
const senhaRegras = (s) => [
  { id: "tam", label: "8+ caracteres", ok: s.length >= 8 },
  { id: "mai", label: "1 letra maiúscula", ok: /[A-Z]/.test(s) },
  { id: "min", label: "1 letra minúscula", ok: /[a-z]/.test(s) },
  { id: "num", label: "1 número", ok: /\d/.test(s) },
  { id: "esp", label: "1 caractere especial", ok: /[^A-Za-z0-9]/.test(s) },
];
const senhaValida = (s) => senhaRegras(s).every((r) => r.ok);

// --- validação da tela "Sobre você" -----------------------------------------
const kwTokens = (raw) => (raw || "").split(/[,;\n\t]+/).map((x) => x.trim()).filter(Boolean);
// junta palavras-chave: >=3 chars, sem duplicar (ignora maiúsc/minúsc e acento)
function addKeywords(lista, raw) {
  let result = [...lista]; let curto = false;
  for (const tk of kwTokens(raw)) {
    if (tk.length < 3) { curto = true; continue; }
    if (result.some((k) => normalizar(k) === normalizar(tk))) continue;
    result.push(tk);
  }
  return { result, curto, added: result.length - lista.length };
}
function addCnpjLista(lista, raw) {
  const c = soDigitos(raw);
  if (c.length !== 14) return { erro: "Informe um CNPJ com 14 dígitos." };
  if (!cnpjValido(raw)) return { erro: "Este CNPJ não é válido." };
  if (lista.some((x) => soDigitos(x) === c)) return { erro: "Este CNPJ já foi adicionado." };
  return { result: [...lista, formatarCNPJ(raw)] };
}
const urlValida = (u) => {
  const s = (u || "").trim(); if (!s) return true;
  try { const x = new URL(/^https?:\/\//i.test(s) ? s : "https://" + s); return !!x.hostname && x.hostname.includes("."); } catch { return false; }
};
const ESCOPO_SUGESTOES = ["equipamentos de informática", "notebooks", "tablets educacionais", "desktops", "monitores", "impressoras", "servidores de rede", "licenciamento de software", "solução de armazenamento"];

// modelo simples de volume — reage a palavras-chave, negativas, filtros e regras
const KW_VOL = { tablet: 120, "tablet educacional": 45, "dispositivo móvel": 30, notebook: 140, desktop: 90, computador: 110, "all-in-one": 20, "kit tecnológico": 60, "lousa digital": 25, "laboratório de informática": 35, treinamento: 0 };
const kwVol = (k) => (KW_VOL[k] !== undefined ? KW_VOL[k] : 40);
function estimarVolume(seg) {
  const nFiltros = seg.filtros.length + (seg.regras ? seg.regras.length : 0);
  let cap = seg.pos.reduce((a, k) => a + kwVol(k), 0);
  cap = Math.max(0, cap - seg.neg.length * 10);
  cap = Math.round(cap * Math.pow(0.82, nFiltros));
  const precisao = Math.min(0.93, 0.42 + seg.neg.length * 0.07 + (seg.temPrompt ? 0.18 : 0) + nFiltros * 0.03);
  const entregues = Math.round(cap * precisao);
  return { capturadas: cap, entregues, precisao: Math.round(precisao * 100) };
}

const LICITACOES = [
  { id: 1, titulo: "Aquisição de tablets educacionais 10\" para rede municipal", orgao: "Secretaria de Educação — MG", modalidade: "Pregão Eletrônico", valor: "R$ 2.480.000", capag: "B", confidence: 96, motivos: [{ tipo: "keyword", txt: "tablet", pos: true }, { tipo: "prompt", txt: "dispositivo para uso educacional", pos: true }] },
  { id: 2, titulo: "Fornecimento de notebooks e tablets para servidores", orgao: "Tribunal de Justiça — SP", modalidade: "Pregão Eletrônico", valor: "R$ 5.120.000", capag: "A", confidence: 91, motivos: [{ tipo: "keyword", txt: "tablet", pos: true }, { tipo: "prompt", txt: "fornecimento de hardware", pos: true }] },
  { id: 3, titulo: "Capas protetoras e películas para tablets", orgao: "Prefeitura de Sorocaba — SP", modalidade: "Dispensa", valor: "R$ 85.000", capag: "B", confidence: 41, nota: "Bateu na palavra-chave, mas o prompt está em dúvida: parece acessório, não o dispositivo. Vai pra revisão em vez de sumir.", motivos: [{ tipo: "keyword", txt: "tablet", pos: true }, { tipo: "prompt", txt: "acessório (capa)?", pos: false }] },
  { id: 4, titulo: "Kit tecnológico educacional (lousa digital + suporte)", orgao: "Governo do Estado — CE", modalidade: "Pregão Eletrônico", valor: "R$ 1.900.000", capag: "C", confidence: 38, nota: "CAPAG C no Nordeste — sua regra por região deixaria de fora. Mostrado como incerto, não descartado.", motivos: [{ tipo: "keyword", txt: "kit tecnológico", pos: true }, { tipo: "filtro", txt: "CAPAG C < B", pos: false }] },
  { id: 5, titulo: "Contratação de treinamento em software de gestão", orgao: "Secretaria de Fazenda — RJ", modalidade: "Pregão Eletrônico", valor: "R$ 320.000", capag: "A", confidence: 9, motivos: [{ tipo: "keyword", txt: "software", pos: true }, { tipo: "prompt", txt: "serviço, não fornecimento", pos: false }] },
  { id: 6, titulo: "Locação de impressoras multifuncionais", orgao: "Câmara Municipal — PR", modalidade: "Pregão Eletrônico", valor: "R$ 210.000", capag: "B", confidence: 5, motivos: [{ tipo: "keyword", txt: "equipamento", pos: true }] },
];

// --- utilitários ------------------------------------------------------------

function Chip({ children, tone = "slate", onRemove }) {
  const tones = { slate: "bg-slate-100 text-slate-700 border-slate-200", emerald: "bg-emerald-50 text-emerald-700 border-emerald-200", amber: "bg-amber-50 text-amber-700 border-amber-200", rose: "bg-rose-50 text-rose-700 border-rose-200" };
  return (<span className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium ${tones[tone]}`}>{children}{onRemove && (<button onClick={onRemove} className="ml-0.5 rounded hover:bg-black/5"><X className="h-3 w-3" /></button>)}</span>);
}
function Field({ icon: Icon, label, hint, children }) {
  return (<div className="space-y-1.5"><div className="flex items-center gap-2 text-sm font-medium text-slate-800">{Icon && <Icon className="h-4 w-4 text-slate-400" />}{label}</div>{hint && <p className="text-xs text-slate-500">{hint}</p>}{children}</div>);
}
function PrimaryButton({ children, onClick, disabled }) {
  return (<button onClick={onClick} disabled={disabled} className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:opacity-90 focus:outline-none disabled:opacity-40" style={{ backgroundColor: "#5DCAA5" }}>{children}</button>);
}
function GhostButton({ children, onClick }) {
  return (<button onClick={onClick} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300">{children}</button>);
}

// volumes derivados (rótulos do funil) — sem "precisão" como métrica real
function volumes(seg) {
  const v = estimarVolume(seg);
  return { encontradas: v.capturadas, recomendadas: v.entregues, revisao: Math.max(0, v.capturadas - v.entregues) };
}

function FunilCompacto({ seg, atualizado }) {
  const v = volumes(seg);
  if (!v.encontradas) return <p className="text-xs text-slate-400">Sem palavras-chave ainda — configure o segmento para estimar o volume.</p>;
  const pct = Math.round((v.recomendadas / v.encontradas) * 100);
  return (
    <div aria-live="polite">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
        <span className="text-slate-600"><span className="font-mono font-semibold text-slate-800">≈{v.encontradas}</span> encontradas</span>
        <span className="text-emerald-700"><span className="font-mono font-semibold">≈{v.recomendadas}</span> recomendadas</span>
        <span className="text-amber-700"><span className="font-mono font-semibold">≈{v.revisao}</span> disponíveis para revisão</span>
      </div>
      <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
      {atualizado && <p className="mt-1 text-xs text-emerald-600">Volumes atualizados com a configuração atual.</p>}
    </div>
  );
}

// indicadores do funil em destaque (topo da configuração)
function FunilDestaque({ seg }) {
  const v = volumes(seg);
  const cels = [
    { n: v.encontradas, t: "Oportunidades encontradas", d: "Estimativa de licitações localizadas pelas palavras-chave deste segmento.", cor: "text-slate-900" },
    { n: v.recomendadas, t: "Oportunidades recomendadas", d: "Estimativa de licitações que a IA classificaria como relevantes.", cor: "text-emerald-600" },
    { n: v.revisao, t: "Disponíveis para revisão", d: "Oportunidades em que a IA tem dúvida ou considera fora do escopo, mas que continuam acessíveis.", cor: "text-amber-600" },
  ];
  return (
    <div aria-live="polite" className="grid gap-3 sm:grid-cols-3">
      {cels.map((c, i) => (
        <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className={`font-mono text-2xl font-bold ${c.cor}`}>≈{c.n}</div>
          <div className="text-xs font-semibold text-slate-700">{c.t}</div>
          <p className="mt-0.5 text-[11px] leading-snug text-slate-400">{c.d}</p>
        </div>
      ))}
    </div>
  );
}

// classificação da IA a partir da confiança simulada
const IA_CLASSES = { relevante: { label: "Relevante", tone: "emerald" }, revisar: { label: "Precisa de revisão", tone: "amber" }, fora: { label: "Fora do escopo", tone: "slate" } };
const classeConfianca = (c) => (c >= 75 ? "relevante" : c >= 30 ? "revisar" : "fora");

// status de configuração/validação do segmento
function statusSeg(seg) {
  if (seg.validado) return { id: "validado", label: "Validado", tone: "emerald", acao: "Revisar segmento" };
  if (seg.configurado) return { id: "pronto", label: "Pronto para validar", tone: "amber", acao: "Continuar configuração" };
  return { id: "pendente", label: "Configuração pendente", tone: "slate", acao: "Configurar segmento" };
}
const toneClasses = { emerald: "bg-emerald-50 text-emerald-700 border-emerald-200", amber: "bg-amber-50 text-amber-700 border-amber-200", slate: "bg-slate-100 text-slate-600 border-slate-200", rose: "bg-rose-50 text-rose-700 border-rose-200" };

function Stepper({ current, onJump }) {
  const idx = STEPS.findIndex((s) => s.id === current);
  return (
    <div className="flex items-center gap-1 overflow-x-auto">
      {STEPS.map((s, i) => {
        const done = i < idx, active = i === idx;
        return (
          <React.Fragment key={s.id}>
            <button onClick={() => onJump(s.id)} className={`flex items-center gap-2 whitespace-nowrap rounded-full px-2.5 py-1.5 text-xs font-medium transition ${active ? "bg-emerald-500 text-white" : done ? "text-emerald-700 hover:bg-slate-100" : "text-slate-500 hover:bg-slate-100"}`}>
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${active ? "bg-white/25 text-white" : done ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{done ? <Check className="h-3 w-3" /> : i + 1}</span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
            {i < STEPS.length - 1 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// --- Assistente lateral (sempre aberto) -------------------------------------

const STEP_TIPS = {
  cadastro: { intro: "Oi! Sou o assistente da Settle. Vou te acompanhar em cada etapa do cadastro — é rapidinho. Crie sua conta que a gente começa.", sugestoes: [{ q: "Quanto tempo leva?", a: "Uns 5 minutos: você cola o que já tem, eu proponho tudo, e você ajusta." }, { q: "Meus dados ficam seguros?", a: "Ficam. Seu histórico de licitações e dados de empresa são usados só pra montar seus segmentos, dentro da sua conta." }] },
  entrada: { intro: "Nesta etapa, me conta o que sua empresa faz. Não precisa preencher tudo — quanto mais você der (CNPJ, site, planilha de palavras-chave), melhor a proposta. Mas só o texto livre já basta pra começar.", sugestoes: [{ q: "O que é mais importante preencher?", a: "O que você vende e, principalmente, o que NÃO vende. Esse contraste é o que mais reduz o ruído lá na frente." }, { q: "Não tenho planilha de palavras-chave", a: "Sem problema. Descreva o que faz que eu extraio as palavras-chave sozinho." }, { q: "Por que pedir editais que eu ignoro?", a: "São ouro: viram palavras-chave negativas e ensinam a IA a cortar exatamente o que hoje te incomoda." }] },
  confirmar: { intro: "Confira se entendi seu escopo — ajuste as colunas 'faz' e 'não faz' à vontade. Depois, escolha como quer dividir suas licitações em segmentos.", sugestoes: [{ q: "O que é um segmento?", a: "É a unidade de filtro: cada segmento tem suas próprias palavras-chave e filtros. Ex.: 'tablets' pode ter uma regra por região que 'notebooks' não tem." }, { q: "Qual divisão você recomenda?", a: "Na dúvida, deixa a Settle sugerir. Você reorganiza (junta/separa) na próxima etapa sem perder nada." }, { q: "Posso criar meus próprios segmentos?", a: "Pode! Escolha 'Eu defino os segmentos' e escreva cada um com uma breve explicação." }] },
  segmentos: { intro: "Estes são os segmentos sugeridos para sua empresa. Posso explicar a divisão, ajudar a organizar os segmentos ou orientar qual deles você deve configurar primeiro.", sugestoes: [{ q: "O que é um segmento?", a: "Um segmento é um grupo de oportunidades que compartilha o mesmo escopo, palavras-chave, filtros e critérios de classificação." }, { q: "Por que essa divisão foi sugerida?", a: "Organizamos os segmentos para que produtos, serviços ou regras diferentes possam receber configurações específicas. Você pode alterar essa divisão antes de continuar." }, { q: "Quero juntar segmentos", a: "Selecione dois ou mais segmentos e escolha 'Juntar'. Depois, revise as palavras-chave e os filtros do novo segmento." }, { q: "Qual segmento devo configurar primeiro?", a: "Comece pelo segmento mais importante para sua empresa. Depois de configurá-lo, valide a amostra e repita o processo nos demais." }] },
  ajustar: { intro: "Vamos personalizar este segmento. Posso ajudar a revisar as palavras-chave, explicar os filtros e configurar como tratar oportunidades com classificação incerta.", sugestoes: [{ q: "Revisar palavras-chave", a: "Palavras de interesse encontram oportunidades; palavras de exclusão reduzem resultados indesejados. Um mesmo termo não pode estar nas duas listas." }, { q: "Explicar os volumes", a: "Encontradas = o que as palavras-chave localizam. Recomendadas = o que a IA classificaria como relevante. Disponíveis para revisão = o que fica em dúvida ou fora do escopo, mas ainda acessível." }, { q: "Como funcionam os filtros?", a: "Condições gerais valem para todas as oportunidades: todas precisam ser atendidas. Regras por região funcionam em alternativa: basta uma ser atendida." }, { q: "Como tratar casos incertos?", a: "Você escolhe entre enviar as oportunidades incertas para uma área de revisão (recomendado) ou não exibi-las no feed principal — mas elas sempre continuam acessíveis." }] },
  validar: { intro: "Agora vamos conferir exemplos de licitações encontradas. Confirme quando concordar com a classificação da IA. Se discordar, informe a classificação correta e o motivo.", sugestoes: [{ q: "Como faço a validação?", a: "Analise a classificação apresentada em cada licitação. Confirme quando estiver correta ou informe a classificação adequada quando discordar." }, { q: "O que significa precisa de revisão?", a: "A IA encontrou sinais de interesse, mas não possui informações suficientes para classificar a oportunidade com segurança." }, { q: "Por que justificar uma correção?", a: "A justificativa ajuda a identificar qual palavra-chave, filtro ou critério precisa ser ajustado." }, { q: "Quero revisar a configuração", a: "Você pode voltar à configuração do segmento sem perder as respostas já registradas nesta amostra." }] },
  licitacoes: { intro: "Pronto! Estas são suas licitações, ranqueadas por confiança. Nada some calado — o de baixa confiança fica em 'Fora do escopo', recuperável. Use 👍/👎 pra ensinar o sistema.", sugestoes: [{ q: "Tenho medo de perder alguma", a: "Por isso nada é descartado: o incerto vai pra 'Pra revisar', o improvável pra 'Fora do escopo' — sempre a um clique." }, { q: "O que o 👎 faz?", a: "Vira regra permanente: normalmente uma palavra-chave negativa ou um refino do prompt do segmento." }] },
};

// normaliza pra casar pergunta digitada (minúsculo, sem acento)
const normalizar = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// repositório de perguntas frequentes por etapa (cadastro detalhado)
const FAQ = {
  cadastro: [
    { keys: ["cnpj", "cnpjs", "documento"], a: "O CNPJ precisa ter 14 dígitos e passar na checagem dos dígitos verificadores — se ficar vermelho, provável um número trocado. Uso ele pra puxar seu histórico de licitações e adiantar a proposta." },
    { keys: ["senha", "password", "forte", "segura"], a: "A senha precisa de no mínimo 8 caracteres, com maiúscula, minúscula, número e um caractere especial. A listinha embaixo do campo vai marcando o que já bateu." },
    { keys: ["email", "e-mail", "correio", "login"], a: "Use um e-mail válido da empresa (formato nome@dominio) — é por ele que você faz login e recebe os avisos de licitação." },
    { keys: ["obrigatorio", "obrigatorios", "preencher", "todos", "campos", "pular", "opcional"], a: "Aqui no cadastro todos os campos são obrigatórios: e-mail, CNPJ e senha. O botão 'Criar conta' só libera quando os três estão válidos." },
    { keys: ["tempo", "demora", "rapido", "quanto", "minutos"], a: "O cadastro em si é rapidinho — só e-mail, CNPJ e senha. O onboarding completo leva uns 5 minutos: você cola o que já tem, eu proponho tudo e você ajusta." },
    { keys: ["seguro", "seguranca", "dados", "privacidade", "lgpd", "compartilha"], a: "Seus dados ficam seguros e são usados só pra montar seus segmentos, dentro da sua conta. Não compartilhamos com terceiros." },
    { keys: ["conta", "criar", "cadastrar", "botao", "continuar"], a: "Preencha e-mail, CNPJ e senha válidos e o botão 'Criar conta' libera. Qualquer campo inválido segura o botão até você corrigir." },
    { keys: ["errei", "errado", "invalido", "vermelho", "erro"], a: "Campo em vermelho = ainda inválido. O CNPJ confere os dígitos verificadores; a senha confere a lista de requisitos; o e-mail precisa do formato nome@dominio." },
  ],
};

function responderFAQ(step, texto) {
  const t = normalizar(texto);
  const lista = FAQ[step] || [];
  const hit = lista.find((f) => f.keys.some((k) => t.includes(normalizar(k))));
  if (hit) return hit.a;
  // fallback: tenta casar com as dúvidas comuns da etapa atual
  const dicas = (STEP_TIPS[step] || {}).sugestoes || [];
  const dica = dicas.find((s) => normalizar(s.q).split(/\s+/).some((w) => w.length > 3 && t.includes(w)));
  if (dica) return dica.a;
  return "Ainda não tenho uma resposta pronta pra isso. Tenta reformular, ou toque numa das dúvidas comuns acima — se for algo específico da sua conta, o suporte da Settle resolve rapidinho.";
}

function Assistant({ step, entrada, setEntrada, escopoApi, onFechar }) {
  if (step === "entrada" && entrada && setEntrada) return <AssistantEntrada entrada={entrada} setEntrada={setEntrada} onFechar={onFechar} />;
  if (step === "confirmar" && escopoApi) return <AssistantConfirmar {...escopoApi} onFechar={onFechar} />;
  return <AssistantFAQ step={step} onFechar={onFechar} />;
}

const CONFIRMAR_ATALHOS = ["Está tudo correto", "Quero corrigir o que eu ofereço", "Quero corrigir o que eu não ofereço", "Quero adicionar uma informação", "Quero remover uma sugestão", "Não entendi esta etapa"];
const extrairItem = (s) => (s || "").replace(/^(?:a|o|os|as|um|uma|de|da|do|dos|das)\s+/i, "").replace(/[.!,;]+$/, "").trim();

function AssistantConfirmar({ escopo, mutarEscopo, setValidado, onCorrigir, onFechar }) {
  const [messages, setMessages] = useState([{ from: "bot", text: "Preparei uma sugestão inicial com base no que você informou. Posso ajudar a confirmar o entendimento, mover itens entre as listas, adicionar informações ou corrigir o que não estiver certo." }]);
  const [input, setInput] = useState("");
  const [aguardando, setAguardando] = useState(null);
  const scrollRef = useRef(null);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);
  const bot = (t) => setMessages((m) => [...m, { from: "bot", text: t }]);
  const eu = (t) => setMessages((m) => [...m, { from: "user", text: t }]);
  const base = escopo || { faz: [], naoFaz: [] };
  const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
  const validar = () => { setValidado(true); bot("✓ Marquei o entendimento como validado. É só clicar em “Confirmar escopo e continuar”."); };

  const aplicarAtalho = (label) => {
    eu(label);
    if (/tudo correto/i.test(label)) return validar();
    if (/o que eu ofere/i.test(label)) { setAguardando({ modo: "faz" }); return bot("Certo. Me diga o que ADICIONAR em “Faz parte do seu escopo” — ou escreva “remover <item>”."); }
    if (/o que eu n[ãa]o ofere/i.test(label)) { setAguardando({ modo: "naoFaz" }); return bot("Certo. Me diga o que ADICIONAR em “Não faz parte do seu escopo” — ou escreva “remover <item>”."); }
    if (/adicionar uma informa/i.test(label)) { setAguardando({ modo: "add" }); return bot("O que quer adicionar? Se for algo que você NÃO oferece, comece com “não” (ex.: “não fornecemos impressoras”)."); }
    if (/remover uma sugest/i.test(label)) { setAguardando({ modo: "remove" }); return bot("Qual item devo remover?"); }
    bot("Nesta etapa você confere o que o Settle entendeu: uma coluna com o que faz parte do seu escopo e outra com o que deve ser evitado. Itens “Informado por você” vieram das suas respostas; “Sugestão do Settle” são propostas que você pode aceitar, editar, mover ou remover. Quando estiver certo, marque a confirmação embaixo pra continuar.");
  };

  const processar = (v) => {
    const t = v.trim(); if (!t) return;
    const ag = aguardando; setAguardando(null);
    if (ag?.modo === "voltar") { if (/^s(im)?$/i.test(t)) { bot("Voltando para você editar as informações…"); onCorrigir(); } else bot("Ok, seguimos por aqui."); return; }
    if (ag?.modo === "remove") { mutarEscopo(escopoRemoverTexto(base, t)); return bot(`✓ Removi “${t}”, se existia.`); }
    if (ag?.modo === "faz" || ag?.modo === "naoFaz") {
      const rem = t.match(/^(?:remover|tirar|excluir|apagar)\s+(.+)/i);
      if (rem) { mutarEscopo(escopoRemoverTexto(base, rem[1])); return bot(`✓ Removi “${rem[1].trim()}”.`); }
      const it = cap(extrairItem(t)); mutarEscopo(escopoAddOuMover(base, ag.modo, it, "voce")); return bot(`✓ Adicionei “${it}” em ${ag.modo === "faz" ? "“Faz parte”" : "“Não faz parte”"}.`);
    }
    if (ag?.modo === "add") { const nao = t.match(/^n[ãa]o\s+(.+)/i); const it = cap(extrairItem(nao ? nao[1] : t)); const col = nao ? "naoFaz" : "faz"; mutarEscopo(escopoAddOuMover(base, col, it, "voce")); return bot(`✓ Adicionei “${it}” em ${col === "faz" ? "“Faz parte”" : "“Não faz parte”"}.`); }
    // texto livre sem contexto
    if (/tudo (certo|correto)|est[áa] correto|pode confirmar/i.test(t)) return validar();
    if (/corrigir (as )?informa|voltar|editar o que informei/i.test(t)) { setAguardando({ modo: "voltar" }); return bot("Quer voltar para a etapa anterior e editar o que você informou? (responda Sim ou Não)"); }
    const nao = t.match(/n[ãa]o\s+(?:fornec\w*|ofere\w*|vend\w*|trabalh\w*|fa[çz]\w*)\s+(.+)/i);
    if (nao) { const it = cap(extrairItem(nao[1])); mutarEscopo(escopoAddOuMover(base, "naoFaz", it, "voce")); return bot(`✓ Coloquei “${it}” em “Não faz parte”.`); }
    const rem = t.match(/(?:remover|tirar|excluir|apagar)\s+(.+)/i);
    if (rem) { mutarEscopo(escopoRemoverTexto(base, rem[1])); return bot(`✓ Removi “${rem[1].trim()}”, se existia.`); }
    const faz = t.match(/(?:tamb[ée]m\s+)?(?:fornec\w*|ofere\w*|vend\w*|trabalh\w*|fa[çz]\w*)\s+(.+)/i);
    if (faz) { const it = cap(extrairItem(faz[1])); mutarEscopo(escopoAddOuMover(base, "faz", it, "voce")); return bot(`✓ Coloquei “${it}” em “Faz parte”.`); }
    bot("Posso adicionar, mover ou remover itens. Ex.: “também fornecemos monitores”, “não fornecemos impressoras” ou “remover treinamento”.");
  };

  const enviar = () => { const t = input.trim(); if (!t) return; eu(t); setInput(""); processar(t); };
  const respRapida = (r) => { eu(r); processar(r); };

  const footer = (
    <>
      {aguardando?.modo === "voltar" && (
        <div className="mb-2 flex gap-1.5">{["Sim", "Não"].map((r) => (<button key={r} onClick={() => respRapida(r)} className="rounded-full px-2.5 py-1 text-xs font-semibold text-slate-900 transition hover:opacity-90" style={{ backgroundColor: "#5DCAA5" }}>{r}</button>))}</div>
      )}
      <p className="mb-1.5 text-xs font-medium text-slate-500">Atalhos</p>
      <div className="flex flex-wrap gap-1.5">
        {CONFIRMAR_ATALHOS.map((a, i) => (<button key={i} onClick={() => aplicarAtalho(a)} className="rounded-full border border-white/15 px-2.5 py-1 text-xs font-medium text-slate-300 transition hover:border-white/30 hover:text-white">{a}</button>))}
      </div>
      <div className="mt-3 flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && enviar()} placeholder="Ex.: também fornecemos monitores" aria-label="Mensagem para o assistente" className="flex-1 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none" style={{ caretColor: "#5DCAA5" }} />
        <button onClick={enviar} aria-label="Enviar" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-900 transition hover:opacity-90" style={{ backgroundColor: "#5DCAA5" }}><ArrowRight className="h-4 w-4" /></button>
      </div>
    </>
  );

  return <AssistantShell footer={footer} onFechar={onFechar}><Bolhas messages={messages} scrollRef={scrollRef} /></AssistantShell>;
}

// casca visual reutilizada pelos dois modos do assistente
function AssistantShell({ children, footer, onFechar }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-white/10 shadow-2xl" style={{ backgroundColor: "#0A1A2F" }}>
      <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <span className="relative flex h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: "rgba(93,202,165,0.15)", color: "#5DCAA5" }}><Sparkles className="h-5 w-5" /></span>
        <div className="flex-1 leading-tight"><p className="text-sm font-semibold text-white">Assistente Settle</p><p className="flex items-center gap-1.5 text-xs text-slate-400"><span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "#5DCAA5" }} /> sempre aqui pra ajudar</p></div>
        {onFechar && <button onClick={onFechar} aria-label="Minimizar assistente" className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"><ChevronDown className="h-5 w-5" /></button>}
      </div>
      {children}
      <div className="px-4 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>{footer}</div>
    </div>
  );
}

function Bolhas({ messages, scrollRef }) {
  return (
    <div ref={scrollRef} aria-live="polite" className="max-h-[45vh] flex-1 space-y-3 overflow-y-auto px-4 py-3">
      {messages.map((m, i) => (
        m.from === "bot" ? (
          <div key={i} className="flex gap-2">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: "rgba(93,202,165,0.15)", color: "#5DCAA5" }}><Sparkles className="h-3.5 w-3.5" /></span>
            <div className="rounded-2xl rounded-tl-sm bg-white/5 px-3 py-2 text-sm leading-relaxed text-slate-200">{m.text}</div>
          </div>
        ) : (
          <div key={i} className="flex justify-end"><div className="rounded-2xl rounded-tr-sm px-3 py-2 text-sm leading-relaxed text-slate-900" style={{ backgroundColor: "#5DCAA5" }}>{m.text}</div></div>
        )
      ))}
    </div>
  );
}

// perguntas do fluxo guiado da tela "Sobre você"
const ENTRADA_PERGUNTAS = [
  { texto: "O que sua empresa vende ou oferece para órgãos públicos?", opcional: false, rapidas: [] },
  { texto: "Quais produtos, serviços ou tipos de contratação não fazem parte da atuação da empresa?", opcional: false, rapidas: [] },
  { texto: "Quais palavras ou expressões costumam aparecer nas licitações que interessam? (separe por vírgula)", opcional: false, rapidas: [] },
  { texto: "Deseja incluir outro CNPJ além do informado no cadastro? Se sim, digite o CNPJ.", opcional: true, rapidas: ["Não", "Pular"] },
  { texto: "Você possui exemplos de editais para adicionar? Escolha o tipo e cole os exemplos.", opcional: true, rapidas: ["Relevantes", "Irrelevantes", "Pular"] },
];
const ENTRADA_ATALHOS = [
  { label: "Quero descrever o que vendo", q: 0 },
  { label: "Quero informar o que não vendo", q: 1 },
  { label: "Quero adicionar palavras-chave", q: 2 },
  { label: "Quero adicionar outro CNPJ", q: 3 },
  { label: "Quero incluir exemplos de editais", q: 4 },
];

function AssistantEntrada({ entrada, setEntrada, onFechar }) {
  const [messages, setMessages] = useState([{ from: "bot", text: "Posso ajudar a preencher esta etapa. Vou fazer algumas perguntas sobre a atuação da sua empresa e usar suas respostas para completar o formulário. Você poderá revisar tudo antes de continuar." }]);
  const [mode, setMode] = useState(null);      // null | "form" | "assist"
  const [qIdx, setQIdx] = useState(-1);
  const [pendEdital, setPendEdital] = useState(null); // null | "rel" | "irrel"
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);

  const bot = (text) => setMessages((m) => [...m, { from: "bot", text }]);
  const eu = (text) => setMessages((m) => [...m, { from: "user", text }]);

  const irPara = (i) => { setMode("assist"); setPendEdital(null); setQIdx(i); bot(ENTRADA_PERGUNTAS[i].texto); };
  const avancar = (from) => { const prox = from + 1; if (prox < ENTRADA_PERGUNTAS.length) { setQIdx(prox); bot(ENTRADA_PERGUNTAS[prox].texto); } else { setQIdx(ENTRADA_PERGUNTAS.length); bot("Prontinho! Preenchi o que você me passou. Revise os campos à esquerda e clique em “Criar proposta de escopo”."); } };

  // processa uma resposta (texto livre ou resposta rápida); idx explícito evita estado defasado
  const processar = (valor, idx = qIdx) => {
    const v = (valor || "").trim();
    const skip = /^(pular|n[ãa]o)$/i.test(v);
    if (idx === 0) { if (!v) return; setEntrada((d) => ({ ...d, venda: v })); bot("✓ Preenchi “O que sua empresa vende para o governo”. Você pode editar no formulário."); avancar(idx); return; }
    if (idx === 1) { if (!v) return; setEntrada((d) => ({ ...d, naoVenda: v })); bot("✓ Registrei no campo de exclusões (“o que não oferece”)."); avancar(idx); return; }
    if (idx === 2) { if (!v) return; const r = addKeywords(entrada.keywords, v); setEntrada((d) => ({ ...d, keywords: r.result })); bot(`✓ ${r.added > 0 ? `Adicionei ${r.added} palavra(s)-chave.` : "Nenhuma nova palavra adicionada."}${r.curto ? " Ignorei termos com menos de 3 caracteres." : ""}`); avancar(idx); return; }
    if (idx === 3) { if (skip || !v) { bot("Sem problema, sigo sem CNPJ adicional."); avancar(idx); return; } const r = addCnpjLista(entrada.cnpjs, v); if (r.erro) { bot(`⚠️ ${r.erro} Tente de novo ou responda “Pular”.`); return; } setEntrada((d) => ({ ...d, cnpjs: r.result })); bot(`✓ CNPJ ${formatarCNPJ(v)} adicionado.`); avancar(idx); return; }
    if (idx === 4) {
      if (pendEdital) { if (!v) return; const campo = pendEdital === "rel" ? "edRelTexto" : "edIrrelTexto"; setEntrada((d) => ({ ...d, [campo]: d[campo] ? d[campo] + "\n" + v : v })); bot(`✓ Adicionei aos editais ${pendEdital === "rel" ? "relevantes" : "irrelevantes"}.`); setPendEdital(null); avancar(idx); return; }
      if (skip) { bot("Beleza, encerramos por aqui."); avancar(idx); return; }
      if (/relevante/i.test(v)) { setPendEdital("rel"); bot("Cole os títulos, objetos ou números dos editais relevantes."); return; }
      if (/irrelevante|n[ãa]o.*relevante/i.test(v)) { setPendEdital("irrel"); bot("Cole os títulos, objetos ou números dos editais que não são relevantes."); return; }
      bot("Escolha “Relevantes” ou “Irrelevantes” — ou “Pular”.");
      return;
    }
  };

  const responderRapida = (opt) => { eu(opt); processar(opt); };
  const enviar = () => {
    const t = input.trim(); if (!t) return;
    eu(t); setInput("");
    if (mode !== "assist" || qIdx < 0 || qIdx >= ENTRADA_PERGUNTAS.length) { setMode("assist"); setQIdx(0); processar(t, 0); return; }
    processar(t);
  };

  const perguntaAtual = qIdx >= 0 && qIdx < ENTRADA_PERGUNTAS.length ? ENTRADA_PERGUNTAS[qIdx] : null;
  const rapidas = pendEdital ? [] : (perguntaAtual ? perguntaAtual.rapidas : []);

  const footer = (
    <>
      {mode === null ? (
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-400">Como você prefere preencher?</p>
          <div className="flex flex-col gap-2">
            <button onClick={() => { setMode("form"); bot("Beleza! Preencha os campos à esquerda. Se travar em algo, é só me chamar por aqui."); }} className="rounded-lg border border-white/15 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-white/30 hover:text-white">Preencher pelo formulário</button>
            <button onClick={() => irPara(0)} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-900 transition hover:opacity-90" style={{ backgroundColor: "#5DCAA5" }}>Preencher com o assistente</button>
          </div>
        </div>
      ) : (
        <>
          {rapidas.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {rapidas.map((r, i) => (<button key={i} onClick={() => responderRapida(r)} className="rounded-full px-2.5 py-1 text-xs font-semibold text-slate-900 transition hover:opacity-90" style={{ backgroundColor: "#5DCAA5" }}>{r}</button>))}
            </div>
          )}
          <p className="mb-1.5 text-xs font-medium text-slate-500">Atalhos</p>
          <div className="flex flex-wrap gap-1.5">
            {ENTRADA_ATALHOS.map((a, i) => (<button key={i} onClick={() => irPara(a.q)} className="rounded-full border border-white/15 px-2.5 py-1 text-xs font-medium text-slate-300 transition hover:border-white/30 hover:text-white">{a.label}</button>))}
          </div>
        </>
      )}
      <div className="mt-3 flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && enviar()} placeholder="Responda por aqui…" aria-label="Resposta para o assistente" className="flex-1 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none" style={{ caretColor: "#5DCAA5" }} />
        <button onClick={enviar} aria-label="Enviar resposta" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-900 transition hover:opacity-90" style={{ backgroundColor: "#5DCAA5" }}><ArrowRight className="h-4 w-4" /></button>
      </div>
    </>
  );

  return <AssistantShell footer={footer} onFechar={onFechar}><Bolhas messages={messages} scrollRef={scrollRef} /></AssistantShell>;
}

function AssistantFAQ({ step, onFechar }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const lastStep = useRef(null);
  const scrollRef = useRef(null);
  const tip = STEP_TIPS[step] || STEP_TIPS.cadastro;

  useEffect(() => {
    if (lastStep.current === step) return;
    lastStep.current = step;
    setMessages((m) => [...m, { from: "bot", text: (STEP_TIPS[step] || STEP_TIPS.cadastro).intro }]);
  }, [step]);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);

  const ask = (s) => setMessages((m) => [...m, { from: "user", text: s.q }, { from: "bot", text: s.a }]);
  const send = () => {
    const t = input.trim(); if (!t) return;
    setMessages((m) => [...m, { from: "user", text: t }]); setInput("");
    const resposta = responderFAQ(step, t);
    setTimeout(() => setMessages((m) => [...m, { from: "bot", text: resposta }]), 350);
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-white/10 shadow-2xl" style={{ backgroundColor: "#0A1A2F" }}>
      <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <span className="relative flex h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: "rgba(93,202,165,0.15)", color: "#5DCAA5" }}><Sparkles className="h-5 w-5" /></span>
        <div className="flex-1 leading-tight"><p className="text-sm font-semibold text-white">Assistente Settle</p><p className="flex items-center gap-1.5 text-xs text-slate-400"><span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "#5DCAA5" }} /> sempre aqui pra ajudar</p></div>
        {onFechar && <button onClick={onFechar} aria-label="Minimizar assistente" className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"><ChevronDown className="h-5 w-5" /></button>}
      </div>
      <div ref={scrollRef} className="max-h-[45vh] flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {messages.map((m, i) => (
          m.from === "bot" ? (
            <div key={i} className="flex gap-2">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: "rgba(93,202,165,0.15)", color: "#5DCAA5" }}><Sparkles className="h-3.5 w-3.5" /></span>
              <div className="rounded-2xl rounded-tl-sm bg-white/5 px-3 py-2 text-sm leading-relaxed text-slate-200">{m.text}</div>
            </div>
          ) : (
            <div key={i} className="flex justify-end"><div className="rounded-2xl rounded-tr-sm px-3 py-2 text-sm leading-relaxed text-slate-900" style={{ backgroundColor: "#5DCAA5" }}>{m.text}</div></div>
          )
        ))}
      </div>
      <div className="px-4 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <p className="mb-1.5 text-xs font-medium text-slate-500">Dúvidas comuns aqui</p>
        <div className="flex flex-wrap gap-1.5">
          {tip.sugestoes.map((s, i) => (
            <button key={i} onClick={() => ask(s)} className="rounded-full border border-white/15 px-2.5 py-1 text-xs font-medium text-slate-300 transition hover:border-white/30 hover:text-white">{s.q}</button>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Pergunte qualquer coisa…" className="flex-1 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none" style={{ caretColor: "#5DCAA5" }} />
          <button onClick={send} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-900 transition hover:opacity-90" style={{ backgroundColor: "#5DCAA5" }}><ArrowRight className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );
}

// --- Cadastro ---------------------------------------------------------------

function RegraSenha({ ok, children }) {
  return (
    <li className={`flex items-center gap-1.5 text-xs transition ${ok ? "text-emerald-600" : "text-slate-400"}`}>
      {ok ? <Check className="h-3.5 w-3.5 shrink-0" /> : <span className="h-3 w-3 shrink-0 rounded-full border border-slate-300" />}
      {children}
    </li>
  );
}

function Cadastro({ onNext }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [tocado, setTocado] = useState({});
  const marcar = (campo) => setTocado((t) => ({ ...t, [campo]: true }));

  const emailOk = emailValido(email);
  const cnpjOk = cnpjValido(cnpj);
  const senhaOk = senha.length > 0;
  // teste de usabilidade: nenhum campo é obrigatório, avanço sempre liberado
  const tudoOk = true;

  const submeter = () => onNext(cnpj);

  // borda vermelha só depois que o campo foi tocado e está inválido
  const borda = (ok, mostrar) => (mostrar && !ok
    ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
    : "border-slate-300 focus:border-emerald-400 focus:ring-emerald-100");
  const obrig = <span className="text-rose-500">*</span>;

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-8 text-center">
        <div className="mb-2 inline-flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">S</span>Settle</div>
        <p className="text-sm text-slate-500">Crie sua conta pra começar a ver licitações que importam.</p>
      </div>
      <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <Field icon={FileText} label={<>E-mail {obrig}</>}>
          <input value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => marcar("email")} type="email" placeholder="voce@empresa.com.br" className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${borda(emailOk, tocado.email)}`} />
          {tocado.email && !emailOk && <p className="mt-1 flex items-center gap-1 text-xs text-rose-600"><AlertTriangle className="h-3 w-3 shrink-0" /> {email.trim() === "" ? "Campo obrigatório." : "Informe um e-mail válido (nome@dominio.com.br)."}</p>}
        </Field>

        <Field icon={Building2} label={<>CNPJ da empresa {obrig}</>} hint="Já uso pra puxar seu histórico de licitações e adiantar a proposta.">
          <div className="relative">
            <input value={cnpj} onChange={(e) => setCnpj(formatarCNPJ(e.target.value))} onBlur={() => marcar("cnpj")} inputMode="numeric" placeholder="00.000.000/0001-00" className={`w-full rounded-lg border px-3 py-2.5 pr-9 font-mono text-sm focus:outline-none focus:ring-2 ${borda(cnpjOk, tocado.cnpj)}`} />
            {cnpj && cnpjOk && <Check className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" />}
          </div>
          {tocado.cnpj && !cnpjOk && <p className="mt-1 flex items-center gap-1 text-xs text-rose-600"><AlertTriangle className="h-3 w-3 shrink-0" /> {cnpj.trim() === "" ? "Campo obrigatório." : soDigitos(cnpj).length !== 14 ? "O CNPJ precisa ter 14 dígitos." : "CNPJ inválido — confira os dígitos."}</p>}
        </Field>

        <Field icon={Shield} label={<>Senha {obrig}</>}>
          <input value={senha} onChange={(e) => setSenha(e.target.value)} onBlur={() => marcar("senha")} type="password" placeholder="••••••••" className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${borda(senhaOk, tocado.senha)}`} />
          <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
            {senhaRegras(senha).map((r) => <RegraSenha key={r.id} ok={r.ok}>{r.label}</RegraSenha>)}
          </ul>
        </Field>

        <div className="pt-1">
          <PrimaryButton onClick={submeter} disabled={!tudoOk}>Criar conta <ArrowRight className="h-4 w-4" /></PrimaryButton>
          <p className="mt-2 text-center text-xs text-slate-400">{obrig} Todos os campos são obrigatórios pra continuar.</p>
        </div>
      </div>
    </div>
  );
}

// --- Etapa 1: Sobre você (tela única) ---------------------------------------

function Secao({ icon: Icon, titulo, obrig, apoio, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">{Icon && <Icon className="h-4 w-4 text-emerald-600" />}{titulo}{obrig && <span className="text-rose-500">*</span>}</div>
      {apoio && <p className="mt-1 text-xs text-slate-500">{apoio}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

// anexo simulado: mostra o nome do arquivo e permite remover (sem backend)
function Anexos({ label, itens, onAdd, onRemove }) {
  const inputRef = useRef(null);
  return (
    <div>
      <button type="button" onClick={() => inputRef.current?.click()} className="flex w-full items-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-2.5 text-left text-sm text-slate-500 transition hover:border-emerald-300 hover:text-emerald-600"><Upload className="h-4 w-4 shrink-0" /> {label}</button>
      <input ref={inputRef} type="file" multiple className="hidden" onChange={(e) => { onAdd(e.target.files); e.target.value = ""; }} />
      {itens.length > 0 && (
        <ul className="mt-2 space-y-1">
          {itens.map((n, i) => (
            <li key={i} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-1.5 text-xs text-slate-600">
              <span className="flex min-w-0 items-center gap-1.5"><FileText className="h-3.5 w-3.5 shrink-0 text-slate-400" /><span className="truncate">{n}</span></span>
              <button type="button" onClick={() => onRemove(i)} aria-label={`Remover ${n}`} className="shrink-0 text-slate-400 hover:text-rose-500"><X className="h-3.5 w-3.5" /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ErroCampo({ children }) {
  return <p aria-live="polite" className="mt-1 flex items-center gap-1 text-xs text-rose-600"><AlertTriangle className="h-3 w-3 shrink-0" /> {children}</p>;
}

function Entrada({ data, setData, onNext }) {
  const [loading, setLoading] = useState(false);
  const [tocado, setTocado] = useState({});
  const [novaKw, setNovaKw] = useState(""); const [kwErro, setKwErro] = useState("");
  const [novoCnpj, setNovoCnpj] = useState(""); const [cnpjErro, setCnpjErro] = useState("");
  const [siteErro, setSiteErro] = useState("");
  const [sug, setSug] = useState([]); const [sugLoad, setSugLoad] = useState(false); const [sugPediu, setSugPediu] = useState(false);
  const vendaRef = useRef(null), naoVendaRef = useRef(null), kwRef = useRef(null), cnpjRef = useRef(null);

  const set = (patch) => setData((d) => ({ ...d, ...patch }));
  const marcar = (c) => setTocado((t) => ({ ...t, [c]: true }));

  const vendaOk = data.venda.trim() !== "";
  const naoVendaOk = data.naoVenda.trim() !== "";
  const kwOk = data.keywords.length >= 1;
  const cnpjListaOk = data.cnpjs.length >= 1;
  const siteOk = urlValida(data.site);
  const escopoPreenchido = vendaOk && naoVendaOk;
  // teste de usabilidade: nenhum campo é obrigatório, avanço sempre liberado
  const tudoOk = true;

  const submitKw = (raw) => {
    const tokens = kwTokens(raw);
    const { result, curto, added } = addKeywords(data.keywords, raw);
    set({ keywords: result }); setNovaKw("");
    setKwErro(added === 0 && (curto || tokens.some((t) => t.length < 3)) ? "Digite uma palavra-chave com pelo menos 3 caracteres." : (curto ? "Alguns termos foram ignorados por terem menos de 3 caracteres." : ""));
  };
  const sugerir = () => {
    if (!escopoPreenchido) return;
    setSugLoad(true); setSugPediu(true);
    setTimeout(() => { const jaTem = new Set(data.keywords.map(normalizar)); setSug(ESCOPO_SUGESTOES.filter((s) => !jaTem.has(normalizar(s)))); setSugLoad(false); }, 900);
  };
  const addSug = (s) => { const { result } = addKeywords(data.keywords, s); set({ keywords: result }); setSug((cur) => cur.filter((x) => x !== s)); };

  const submitCnpj = () => {
    const r = addCnpjLista(data.cnpjs, novoCnpj);
    if (r.erro) { setCnpjErro(r.erro); return; }
    set({ cnpjs: r.result }); setNovoCnpj(""); setCnpjErro("");
  };

  const addAnexo = (campo, files) => { const nomes = Array.from(files || []).map((f) => f.name); if (nomes.length) set({ [campo]: [...(data[campo] || []), ...nomes] }); };
  const rmAnexo = (campo, i) => set({ [campo]: (data[campo] || []).filter((_, j) => j !== i) });

  const submeter = () => { setLoading(true); setTimeout(onNext, 1200); };

  if (loading) return (
    <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
      <div className="mb-4 h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />
      <p className="text-sm font-medium text-slate-700">Criando sua proposta de escopo…</p>
      <p className="mt-1 text-xs text-slate-400">Cruzando editais já disputados, site e o que você escreveu pra entender seu escopo.</p>
    </div>
  );

  const areaEscopo = "w-full rounded-lg border px-3 py-2.5 text-sm leading-relaxed focus:outline-none focus:ring-2";
  const bordaOk = "border-slate-300 focus:border-emerald-400 focus:ring-emerald-100";
  const bordaErr = "border-rose-300 focus:border-rose-400 focus:ring-rose-100";

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-xl font-bold text-slate-900">Conte um pouco sobre sua empresa</h1>
      <p className="mt-1 text-sm text-slate-600">Preencha os campos abaixo ou converse com o assistente para nos contar o que sua empresa oferece ao setor público. Com essas informações, o Settle poderá criar uma proposta inicial mais aderente ao seu negócio. Você poderá revisar tudo antes de continuar.</p>
      <p className="mt-3 text-xs font-medium text-slate-500"><span className="text-rose-500">*</span> Os campos marcados com * são necessários para continuar.</p>

      <div className="mt-5 space-y-5">
        {/* 1. Escopo */}
        <Secao icon={MessageSquareText} titulo="Escopo da empresa">
          <Field label={<>O que sua empresa vende para o governo? <span className="text-rose-500">*</span></>} hint="Descreva os produtos e serviços que sua empresa deseja encontrar em licitações públicas.">
            <textarea ref={vendaRef} rows={2} value={data.venda} onChange={(e) => set({ venda: e.target.value })} onBlur={() => marcar("venda")} placeholder="Ex.: fornecemos tablets, notebooks e equipamentos de informática para órgãos públicos." className={`${areaEscopo} ${tocado.venda && !vendaOk ? bordaErr : bordaOk}`} />
            {tocado.venda && !vendaOk && <ErroCampo>Campo obrigatório.</ErroCampo>}
          </Field>
          <Field label={<>Dentro desse ramo, o que sua empresa não oferece? <span className="text-rose-500">*</span></>} hint="Informe produtos, serviços ou tipos de contratação que parecem relacionados ao seu negócio, mas não fazem parte da sua atuação.">
            <textarea ref={naoVendaRef} rows={2} value={data.naoVenda} onChange={(e) => set({ naoVenda: e.target.value })} onBlur={() => marcar("naoVenda")} placeholder="Ex.: não fornecemos acessórios avulsos, manutenção ou treinamento." className={`${areaEscopo} ${tocado.naoVenda && !naoVendaOk ? bordaErr : bordaOk}`} />
            {tocado.naoVenda && !naoVendaOk && <ErroCampo>Campo obrigatório.</ErroCampo>}
          </Field>
        </Secao>

        {/* 2. Palavras-chave */}
        <Secao icon={Search} titulo="Palavras-chave utilizadas nas buscas" obrig apoio="Adicione termos que costumam aparecer nas licitações de interesse da sua empresa.">
          <div>
            <input ref={kwRef} value={novaKw} onChange={(e) => { setNovaKw(e.target.value); if (kwErro) setKwErro(""); }} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); submitKw(novaKw); } }} onPaste={(e) => { const t = e.clipboardData.getData("text"); if (/[,;\n\t]/.test(t)) { e.preventDefault(); submitKw(t); } }} placeholder="digite e aperte Enter, vírgula ou ponto e vírgula" className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${(kwErro || (tocado.keywords && !kwOk)) ? bordaErr : bordaOk}`} />
            {kwErro && <ErroCampo>{kwErro}</ErroCampo>}
            {data.keywords.length > 0 && <div className="mt-2 flex flex-wrap gap-2">{data.keywords.map((k, i) => (<Chip key={i} tone="slate" onRemove={() => set({ keywords: data.keywords.filter((_, j) => j !== i) })}><span className="font-mono">{k}</span></Chip>))}</div>}
            {tocado.keywords && !kwOk && !kwErro && <ErroCampo>Adicione pelo menos uma palavra-chave.</ErroCampo>}
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700"><Sparkles className="h-3.5 w-3.5 text-emerald-600" /> Sugerir palavras-chave</div>
            <p className="mt-0.5 text-xs text-slate-500">Receba sugestões com base no escopo informado acima.</p>
            <button onClick={sugerir} disabled={!escopoPreenchido || sugLoad} className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40">{sugLoad ? <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Gerando…</> : <><Sparkles className="h-3.5 w-3.5" /> Sugerir palavras-chave</>}</button>
            {!escopoPreenchido && <p className="mt-1 text-xs text-slate-400">Preencha os dois campos de escopo pra liberar as sugestões.</p>}
            {sugPediu && !sugLoad && (
              sug.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {sug.map((s, i) => (<button key={i} onClick={() => addSug(s)} className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-white px-2 py-1 text-xs font-medium text-emerald-700 transition hover:bg-emerald-50"><Plus className="h-3 w-3" /> {s}</button>))}
                </div>
              ) : <p className="mt-3 text-xs text-slate-400">Todas as sugestões já foram adicionadas.</p>
            )}
          </div>

          <Anexos label="Importar planilha de palavras-chave (.csv, .xlsx)" itens={data.planilhas || []} onAdd={(f) => addAnexo("planilhas", f)} onRemove={(i) => rmAnexo("planilhas", i)} />
        </Secao>

        {/* 3. Dados da empresa */}
        <Secao icon={Building2} titulo="Dados da empresa">
          <Field label={<>CNPJs que participam de licitações <span className="text-rose-500">*</span></>} hint="Informe os CNPJs utilizados pela empresa para participar de processos licitatórios.">
            {data.cnpjs.length > 0 && <div className="flex flex-wrap gap-2">{data.cnpjs.map((c, i) => (<Chip key={i} tone="emerald" onRemove={() => set({ cnpjs: data.cnpjs.filter((_, j) => j !== i) })}><span className="font-mono">{c}</span></Chip>))}</div>}
            <div className="mt-2 flex gap-2">
              <input ref={cnpjRef} value={novoCnpj} onChange={(e) => { setNovoCnpj(formatarCNPJ(e.target.value)); if (cnpjErro) setCnpjErro(""); }} onKeyDown={(e) => e.key === "Enter" && submitCnpj()} inputMode="numeric" placeholder="00.000.000/0000-00" className={`flex-1 rounded-lg border px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 ${(cnpjErro || (tocado.cnpjs && !cnpjListaOk)) ? bordaErr : bordaOk}`} />
              <GhostButton onClick={submitCnpj}><Plus className="h-4 w-4" /> Adicionar</GhostButton>
            </div>
            {cnpjErro && <ErroCampo>{cnpjErro}</ErroCampo>}
            {tocado.cnpjs && !cnpjListaOk && !cnpjErro && <ErroCampo>Adicione pelo menos um CNPJ válido.</ErroCampo>}
          </Field>
          <Field label="Site da empresa" hint="Opcional.">
            <input value={data.site} onChange={(e) => { set({ site: e.target.value }); if (siteErro) setSiteErro(""); }} onBlur={() => setSiteErro(urlValida(data.site) ? "" : "Informe uma URL válida (ex.: https://suaempresa.com.br).")} placeholder="https://suaempresa.com.br" className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${siteErro ? bordaErr : bordaOk}`} />
            {siteErro && <ErroCampo>{siteErro}</ErroCampo>}
          </Field>
        </Secao>

        {/* 4. Exemplos de editais */}
        <Secao icon={FileText} titulo="Exemplos de editais" apoio="Opcional — exemplos ajudam o Settle a calibrar o que buscar e o que evitar.">
          <div>
            <p className="text-sm font-medium text-slate-800">Editais que você recebe, mas não são relevantes</p>
            <p className="mt-0.5 text-xs text-slate-500">Envie exemplos de oportunidades que não fazem parte do seu escopo. Esses casos ajudam o Settle a entender o que deve ser evitado.</p>
            <textarea rows={2} value={data.edIrrelTexto} onChange={(e) => set({ edIrrelTexto: e.target.value })} placeholder="Cole títulos, objetos ou números de editais…" className={`mt-2 ${areaEscopo} ${bordaOk}`} />
            <div className="mt-2"><Anexos label="Anexe PDFs ou planilhas de editais que não são relevantes para sua empresa." itens={data.edIrrelAnexos} onAdd={(f) => addAnexo("edIrrelAnexos", f)} onRemove={(i) => rmAnexo("edIrrelAnexos", i)} /></div>
          </div>
          <div className="h-px bg-slate-100" />
          <div>
            <p className="text-sm font-medium text-slate-800">Editais que você recebe e considera relevantes</p>
            <p className="mt-0.5 text-xs text-slate-500">Envie exemplos de oportunidades que representam bem o que sua empresa busca. Eles ajudam o Settle a reconhecer padrões de aderência.</p>
            <textarea rows={2} value={data.edRelTexto} onChange={(e) => set({ edRelTexto: e.target.value })} placeholder="Cole títulos, objetos ou números de editais…" className={`mt-2 ${areaEscopo} ${bordaOk}`} />
            <div className="mt-2"><Anexos label="Anexe PDFs ou planilhas de editais relevantes para sua empresa." itens={data.edRelAnexos} onAdd={(f) => addAnexo("edRelAnexos", f)} onRemove={(i) => rmAnexo("edRelAnexos", i)} /></div>
          </div>
        </Secao>

        {/* 5. Materiais complementares */}
        <Secao icon={Upload} titulo="Materiais complementares" apoio="Se desejar, envie uma apresentação comercial, catálogo ou portfólio para ajudar o Settle a compreender melhor a atuação da empresa.">
          <Anexos label="Enviar apresentação, catálogo ou portfólio" itens={data.materiais} onAdd={(f) => addAnexo("materiais", f)} onRemove={(i) => rmAnexo("materiais", i)} />
        </Secao>
      </div>

      <div className="mt-6 flex flex-col items-end gap-2">
        {!tudoOk && <p aria-live="polite" className="text-xs text-slate-500">Preencha os campos obrigatórios para continuar.</p>}
        <PrimaryButton onClick={submeter} disabled={!tudoOk}><Sparkles className="h-4 w-4" /> Criar proposta de escopo</PrimaryButton>
      </div>
    </div>
  );
}

// --- Etapa 2: Confirmar & organizar -----------------------------------------

const ORG_OPCOES = [
  { id: "sugerir", nome: "Deixar a Settle sugerir", desc: "Com base nas informações da sua empresa, a Settle sugere uma divisão equilibrada para encontrar oportunidades relevantes e reduzir resultados indesejados.", icon: Sparkles, rec: true },
  { id: "produto", nome: "Por linha de produto ou serviço", desc: "Crie um segmento para cada família de produtos ou serviços, como tablets, notebooks e kits educacionais.", icon: Boxes },
  { id: "regiao", nome: "Por região", desc: "Organize as licitações por região e aplique critérios diferentes para cada uma, como regras de risco e CAPAG.", icon: MapPin },
  { id: "unico", nome: "Todas em um único segmento", desc: "Mantenha todas as licitações em uma única estrutura. É a opção mais simples, mas oferece menos controle sobre filtros e regras específicas.", icon: Layers },
  { id: "manual", nome: "Definir meus próprios segmentos", desc: "Crie os segmentos manualmente e descreva brevemente quais produtos, serviços ou oportunidades devem fazer parte de cada um.", icon: Pencil },
];

// --- escopo (tela 3): itens {id, texto, origem: "voce"|"smartbid"} ----------
const mkItem = (texto, origem) => ({ id: "it_" + Math.random().toString(36).slice(2, 9), texto: (texto || "").trim(), origem });
function seedEscopo(entrada) {
  const faz = [];
  if (entrada.venda.trim()) faz.push(mkItem(entrada.venda.trim(), "voce"));
  entrada.keywords.forEach((k) => { if (!faz.some((i) => normalizar(i.texto) === normalizar(k))) faz.push(mkItem(k, "voce")); });
  ["Equipamentos de informática", "Periféricos corporativos", "Soluções de rede"].filter((s) => !faz.some((i) => normalizar(i.texto) === normalizar(s))).slice(0, 2).forEach((s) => faz.push(mkItem(s, "smartbid")));
  const naoFaz = [];
  if (entrada.naoVenda.trim()) naoFaz.push(mkItem(entrada.naoVenda.trim(), "voce"));
  ["Acessórios avulsos (capas, películas)", "Treinamento e capacitação", "Serviços de manutenção"].filter((s) => !naoFaz.some((i) => normalizar(i.texto) === normalizar(s))).slice(0, 2).forEach((s) => naoFaz.push(mkItem(s, "smartbid")));
  return { faz, naoFaz };
}
const entradaTemDados = (e) => !!(e && (e.venda.trim() || e.naoVenda.trim() || e.keywords.length));
function escopoAddOuMover(esc, col, texto, origem = "voce") {
  const t = (texto || "").trim(); if (!t) return esc;
  const n = normalizar(t);
  const existente = [...esc.faz, ...esc.naoFaz].find((i) => normalizar(i.texto) === n);
  const item = existente ? { ...existente, texto: t } : mkItem(t, origem);
  const faz = esc.faz.filter((i) => normalizar(i.texto) !== n);
  const naoFaz = esc.naoFaz.filter((i) => normalizar(i.texto) !== n);
  return col === "faz" ? { faz: [...faz, item], naoFaz } : { faz, naoFaz: [...naoFaz, item] };
}
const escopoRemoverId = (esc, id) => ({ faz: esc.faz.filter((i) => i.id !== id), naoFaz: esc.naoFaz.filter((i) => i.id !== id) });
const escopoRemoverTexto = (esc, texto) => { const n = normalizar(texto); return { faz: esc.faz.filter((i) => normalizar(i.texto) !== n), naoFaz: esc.naoFaz.filter((i) => normalizar(i.texto) !== n) }; };
const escopoEditar = (esc, id, novo) => { const f = (arr) => arr.map((i) => (i.id === id ? { ...i, texto: novo } : i)); return { faz: f(esc.faz), naoFaz: f(esc.naoFaz) }; };
function escopoMover(esc, id) {
  const emFaz = esc.faz.find((i) => i.id === id);
  if (emFaz) return { faz: esc.faz.filter((i) => i.id !== id), naoFaz: [...esc.naoFaz, emFaz] };
  const emNao = esc.naoFaz.find((i) => i.id === id);
  if (emNao) return { faz: [...esc.faz, emNao], naoFaz: esc.naoFaz.filter((i) => i.id !== id) };
  return esc;
}

function OrigemBadge({ origem }) {
  return origem === "voce"
    ? <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-slate-100 text-slate-500">Informado por você</span>
    : <span className="inline-flex items-center gap-1 rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-600"><Sparkles className="h-2.5 w-2.5" /> Sugestão do Settle</span>;
}

function EscopoItem({ item, tone, dir, onEdit, onRemove, onMove }) {
  const [editando, setEditando] = useState(false); const [val, setVal] = useState(item.texto);
  const bg = tone === "faz" ? "bg-emerald-50/60 border-emerald-100" : "bg-rose-50/60 border-rose-100";
  const salvar = () => { const v = val.trim(); if (v) onEdit(item.id, v); setEditando(false); };
  return (
    <div className={`rounded-lg border px-3 py-2 ${bg}`}>
      <div className="flex items-start justify-between gap-2">
        {editando ? (
          <input autoFocus value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => e.key === "Enter" && salvar()} onBlur={salvar} className="w-full rounded border border-emerald-300 px-2 py-1 text-sm focus:outline-none" />
        ) : (
          <span className="text-sm text-slate-800">{item.texto}</span>
        )}
        <div className="flex shrink-0 items-center gap-0.5">
          <button onClick={() => onMove(item.id)} title={dir === "right" ? "Mover para “Não faz parte”" : "Mover para “Faz parte”"} className="rounded p-1 text-slate-400 hover:bg-white hover:text-slate-700">{dir === "right" ? <ArrowRight className="h-3.5 w-3.5" /> : <ArrowLeft className="h-3.5 w-3.5" />}</button>
          <button onClick={() => { setVal(item.texto); setEditando(true); }} title="Editar" className="rounded p-1 text-slate-400 hover:bg-white hover:text-slate-700"><Pencil className="h-3.5 w-3.5" /></button>
          <button onClick={() => onRemove(item.id)} title="Remover" className="rounded p-1 text-slate-400 hover:bg-white hover:text-rose-500"><X className="h-3.5 w-3.5" /></button>
        </div>
      </div>
      <div className="mt-1"><OrigemBadge origem={item.origem} /></div>
    </div>
  );
}

function Confirmar({ escopo, mutarEscopo, desfazer, podeDesfazer, validado, setValidado, onAplicar, onBack, onVoltarPreencher }) {
  const [novoFaz, setNovoFaz] = useState(""); const [novoNao, setNovoNao] = useState("");
  const [axis, setAxis] = useState("sugerir");
  const [manualSegs, setManualSegs] = useState([{ nome: "", desc: "" }]);
  const setManual = (i, f, val) => setManualSegs((arr) => arr.map((m, j) => (j === i ? { ...m, [f]: val } : m)));

  // estado vazio: chegou aqui sem dados da etapa anterior
  if (!escopo) {
    return (
      <div className="mx-auto max-w-md py-10 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100"><Info className="h-6 w-6 text-slate-400" /></div>
        <h1 className="text-lg font-bold text-slate-900">Ainda não temos informações suficientes</h1>
        <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">Conte um pouco sobre a sua empresa para que o Settle possa preparar uma sugestão inicial de escopo.</p>
        <div className="mt-5"><PrimaryButton onClick={onVoltarPreencher}><ArrowLeft className="h-4 w-4" /> Voltar e preencher informações</PrimaryButton></div>
      </div>
    );
  }

  const add = (col, texto) => { const t = texto.trim(); if (!t) return; mutarEscopo(escopoAddOuMover(escopo, col, t, "voce")); };

  return (
    <div className="mx-auto max-w-3xl">
      <button onClick={onBack} className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"><ArrowLeft className="h-4 w-4" /> voltar</button>
      <h1 className="text-xl font-bold text-slate-900">Confira se entendemos sua empresa</h1>
      <p className="mt-1 text-sm text-slate-600">Com base nas informações que você compartilhou, o Settle organizou uma sugestão inicial do que faz e do que não faz parte da atuação da sua empresa. Revise as informações abaixo ou converse com o assistente para confirmar, corrigir ou complementar o escopo.</p>
      <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400"><Info className="h-3.5 w-3.5" /> Você poderá ajustar essas informações novamente antes de concluir a configuração.</p>

      <div className="mt-4 flex items-center justify-end">
        <button onClick={desfazer} disabled={!podeDesfazer} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><Undo2 className="h-3.5 w-3.5" /> Desfazer</button>
      </div>

      <div className="mt-2 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700"><CheckCircle2 className="h-4 w-4" /> Faz parte do seu escopo</div>
          <p className="mt-0.5 text-xs text-slate-500">Produtos, serviços e contratações que o Settle entendeu que são relevantes para sua empresa.</p>
          <div className="mt-3 space-y-2">{escopo.faz.map((it) => (<EscopoItem key={it.id} item={it} tone="faz" dir="right" onEdit={(id, v) => mutarEscopo(escopoEditar(escopo, id, v))} onRemove={(id) => mutarEscopo(escopoRemoverId(escopo, id))} onMove={(id) => mutarEscopo(escopoMover(escopo, id))} />))}</div>
          <input value={novoFaz} onChange={(e) => setNovoFaz(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { add("faz", novoFaz); setNovoFaz(""); } }} placeholder="adicionar item…" className="mt-2 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:border-emerald-400 focus:outline-none" />
        </div>
        <div className="rounded-2xl border border-rose-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-rose-700"><X className="h-4 w-4" /> Não faz parte do seu escopo</div>
          <p className="mt-0.5 text-xs text-slate-500">Produtos, serviços e contratações que o Settle entendeu que devem ser evitados.</p>
          <div className="mt-3 space-y-2">{escopo.naoFaz.map((it) => (<EscopoItem key={it.id} item={it} tone="naoFaz" dir="left" onEdit={(id, v) => mutarEscopo(escopoEditar(escopo, id, v))} onRemove={(id) => mutarEscopo(escopoRemoverId(escopo, id))} onMove={(id) => mutarEscopo(escopoMover(escopo, id))} />))}</div>
          <input value={novoNao} onChange={(e) => setNovoNao(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { add("naoFaz", novoNao); setNovoNao(""); } }} placeholder="adicionar item…" className="mt-2 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:border-rose-400 focus:outline-none" />
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-semibold text-slate-800">Como você quer organizar suas licitações?</h2>
        <p className="mt-0.5 text-xs text-slate-500">Um segmento é um grupo de oportunidades que compartilha o mesmo escopo, palavras-chave e filtros. Escolha como deseja organizar esses grupos, e a Settle preparará uma estrutura inicial para você.</p>
        <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
          {ORG_OPCOES.map((o) => {
            const Icon = o.icon, sel = axis === o.id;
            return (
              <button key={o.id} onClick={() => setAxis(o.id)} className={`flex items-start gap-3 rounded-xl border-2 bg-white p-4 text-left transition ${sel ? "border-emerald-500 ring-1 ring-emerald-200" : "border-slate-200 hover:border-slate-300"}`}>
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${sel ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}><Icon className="h-5 w-5" /></span>
                <span>
                  <span className="flex items-center gap-2"><span className="font-semibold text-slate-900">{o.nome}</span>{o.rec && <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-xs font-semibold text-emerald-600">Recomendado</span>}</span>
                  <span className="mt-0.5 block text-xs text-slate-500">{o.desc}</span>
                </span>
              </button>
            );
          })}
        </div>
        {axis === "manual" && (
          <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
            <p className="text-xs font-medium text-emerald-800">Escreva cada segmento que você quer — e o que ele é. Vira a estrutura; as palavras-chave e filtros você refina depois.</p>
            <div className="mt-3 space-y-2">
              {manualSegs.map((m, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input value={m.nome} onChange={(e) => setManual(i, "nome", e.target.value)} placeholder="Nome (ex: Materiais de informática)" className="w-2/5 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none" />
                  <input value={m.desc} onChange={(e) => setManual(i, "desc", e.target.value)} placeholder="O que é — ex: fornecimento de tablets, notebooks e desktops" className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none" />
                  <button onClick={() => setManualSegs(manualSegs.filter((_, j) => j !== i))} className="rounded p-2 text-slate-400 hover:text-rose-500"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
            <button onClick={() => setManualSegs([...manualSegs, { nome: "", desc: "" }])} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-800"><Plus className="h-3.5 w-3.5" /> adicionar segmento</button>
          </div>
        )}
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <label className="flex cursor-pointer items-start gap-3">
          <input type="checkbox" checked={validado} onChange={(e) => setValidado(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-600" />
          <span className="text-sm text-slate-700">Confirmo que o Settle entendeu corretamente a atuação da minha empresa.</span>
        </label>
        <div className="mt-4 flex flex-col items-end gap-2">
          <PrimaryButton onClick={() => onAplicar(axis, manualSegs)} disabled={false}>Confirmar escopo e continuar <ArrowRight className="h-4 w-4" /></PrimaryButton>
        </div>
      </div>
    </div>
  );
}

// --- Etapa 3: Segmentos (organização + preview de volume) -------------------

const uniqCI = (arr) => { const seen = new Set(); const out = []; for (const x of arr) { const n = normalizar(x); if (!seen.has(n)) { seen.add(n); out.push(x); } } return out; };

function Segmentos({ segmentos, setSegmentos, onAjustar, onNext, onBack }) {
  const [sel, setSel] = useState([]);
  const [rename, setRename] = useState(null); const [renameVal, setRenameVal] = useState("");
  const [merge, setMerge] = useState(false);
  const [mergeNome, setMergeNome] = useState("Materiais de informática");
  const [mergeFiltro, setMergeFiltro] = useState("ambos");
  const [confirmDel, setConfirmDel] = useState(null); // segmento validado aguardando confirmação

  const toggleSel = (id) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const selSegs = segmentos.filter((s) => sel.includes(s.id));
  const filtrosDistintos = [...new Set(selSegs.flatMap((s) => s.filtros))];
  const temConflito = selSegs.length > 1 && selSegs.some((s) => s.filtros.join("|") !== selSegs[0].filtros.join("|"));
  const posUnion = uniqCI(selSegs.flatMap((s) => s.pos));
  const negUnion = uniqCI(selSegs.flatMap((s) => s.neg));

  const startRename = (s) => { setRename(s.id); setRenameVal(s.nome); };
  const saveRename = () => { setSegmentos((segs) => segs.map((s) => (s.id === rename ? { ...s, nome: renameVal || s.nome } : s))); setRename(null); };
  const removerSeg = (id) => { setSegmentos((segs) => segs.filter((s) => s.id !== id)); setSel((s) => s.filter((x) => x !== id)); setConfirmDel(null); };
  const pedirDel = (s) => { if (s.validado) setConfirmDel(s); else removerSeg(s.id); };

  const mergePreview = { pos: posUnion, neg: negUnion, filtros: mergeFiltro === "ambos" ? filtrosDistintos : mergeFiltro === "zero" ? [] : (selSegs.find((s) => s.id === mergeFiltro)?.filtros || []), regras: [], temPrompt: selSegs.some((s) => s.temPrompt) };
  const confirmarMerge = () => {
    // segmento unido volta a "Configuração pendente" — precisa revisar e validar de novo
    const novo = { id: "m" + Date.now(), nome: mergeNome || "Novo segmento", pos: posUnion, neg: negUnion, filtros: mergePreview.filtros, regras: [], temPrompt: mergePreview.temPrompt, configurado: false, validado: false, amostra: {} };
    setSegmentos((segs) => [novo, ...segs.filter((s) => !sel.includes(s.id))]); setSel([]); setMerge(false);
  };

  const validados = segmentos.filter((s) => s.validado).length;
  const todosValidados = segmentos.length > 0 && validados === segmentos.length;
  const primeiroPendente = segmentos.find((s) => !s.validado);
  const totalEnc = segmentos.reduce((a, s) => a + volumes(s).encontradas, 0);
  const totalRec = segmentos.reduce((a, s) => a + volumes(s).recomendadas, 0);
  const tentarConcluir = () => onNext();

  return (
    <div className="mx-auto max-w-3xl">
      <button onClick={onBack} className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"><ArrowLeft className="h-4 w-4" /> voltar</button>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Revise seus segmentos</h1>
          <p className="mt-1 max-w-xl text-sm text-slate-600">Criamos uma proposta de organização para suas licitações. Acesse cada segmento para personalizar palavras-chave, filtros e o tratamento das oportunidades em que a IA tiver dúvida. Depois, valide uma amostra para confirmar se a configuração está funcionando como esperado.</p>
          <p className="mt-1 text-xs font-medium text-slate-500">Revise todos os segmentos antes de concluir a configuração.</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div aria-live="polite" className="flex items-center gap-2 text-sm font-semibold text-slate-800"><CheckCircle2 className={`h-4 w-4 ${todosValidados ? "text-emerald-600" : "text-slate-300"}`} /> {validados} de {segmentos.length} segmentos validados</div>
        <div className="text-right text-xs">
          <div className="font-medium uppercase tracking-wide text-slate-400">Estimativa somada dos segmentos</div>
          <div className="text-slate-600"><span className="font-mono font-bold text-slate-900">≈{totalEnc}</span> encontradas → <span className="font-mono font-bold text-emerald-600">≈{totalRec}</span> recomendadas/mês</div>
        </div>
      </div>
      <p className="mt-1 text-xs text-slate-400">Uma mesma oportunidade pode aparecer em mais de um segmento.</p>
      <p className="mt-3 text-sm text-slate-500">Selecione dois ou mais segmentos para juntá-los. Você também pode renomear, excluir ou criar um novo segmento.</p>

      {merge && (
        <div className="mt-4 rounded-2xl border-2 border-emerald-300 bg-emerald-50/60 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-800"><GitMerge className="h-4 w-4" /> Juntar {selSegs.length} segmentos</div>
          <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> O segmento resultante volta a “Configuração pendente”. Você precisará revisá-lo e validá-lo novamente.</div>
          <div className="mt-3"><label className="text-xs font-medium text-slate-600">Nome do segmento unido</label><input value={mergeNome} onChange={(e) => setMergeNome(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none" /></div>
          <div className="mt-3 rounded-lg border border-emerald-200 bg-white p-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700"><Check className="h-3.5 w-3.5" /> Palavras-chave combinadas</div>
            <p className="mt-0.5 text-xs text-slate-500">As palavras-chave dos segmentos selecionados serão reunidas. Termos duplicados serão mantidos apenas uma vez.</p>
            <div className="mt-2 flex flex-wrap gap-1.5">{posUnion.map((k, i) => (<Chip key={i} tone="emerald"><span className="font-mono">{k}</span></Chip>))}{negUnion.map((k, i) => (<Chip key={"n" + i} tone="rose"><span className="font-mono">−{k}</span></Chip>))}</div>
          </div>
          <div className={`mt-3 rounded-lg border p-3 ${temConflito ? "border-amber-300 bg-white" : "border-slate-200 bg-white"}`}>
            <div className={`flex items-center gap-1.5 text-xs font-semibold ${temConflito ? "text-amber-700" : "text-slate-600"}`}>{temConflito ? <AlertTriangle className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}{temConflito ? "Os segmentos possuem filtros diferentes" : "Filtros iguais — sem conflito"}</div>
            {temConflito && <p className="mt-0.5 text-xs text-slate-500">Escolha quais filtros devem ser aplicados ao novo segmento. Você poderá revisá-los novamente antes da validação.</p>}
            {temConflito && (<div className="mt-2 space-y-1.5">{[{ v: "ambos", label: "Aplicar todos os filtros (E) — mais restritivo", desc: filtrosDistintos.join(" · ") }, ...selSegs.map((s) => ({ v: s.id, label: `Manter só os de “${s.nome}”`, desc: s.filtros.join(" · ") || "sem filtros" })), { v: "zero", label: "Redefinir do zero", desc: "começo sem filtro e configuro depois" }].map((opt) => (<label key={opt.v} className={`flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2 text-sm ${mergeFiltro === opt.v ? "border-emerald-400 bg-emerald-50" : "border-slate-200 hover:bg-slate-50"}`}><input type="radio" checked={mergeFiltro === opt.v} onChange={() => setMergeFiltro(opt.v)} className="mt-0.5 accent-emerald-600" /><span><span className="font-medium text-slate-800">{opt.label}</span><span className="block text-xs text-slate-500">{opt.desc}</span></span></label>))}</div>)}
          </div>
          <div className="mt-3 rounded-lg bg-white/60 px-3 py-2"><FunilCompacto seg={mergePreview} /></div>
          <div className="mt-4 flex justify-end gap-2"><GhostButton onClick={() => setMerge(false)}>Cancelar</GhostButton><PrimaryButton onClick={confirmarMerge}><GitMerge className="h-4 w-4" /> Juntar segmentos</PrimaryButton></div>
        </div>
      )}

      <div className="mt-4 space-y-2.5">
        {segmentos.map((s) => {
          const marcado = sel.includes(s.id); const st = statusSeg(s);
          return (
            <div key={s.id} className={`rounded-xl border bg-white p-4 shadow-sm transition ${marcado ? "border-emerald-400 ring-1 ring-emerald-200" : "border-slate-200"}`}>
              <div className="flex items-center gap-3">
                <button onClick={() => toggleSel(s.id)} aria-label={marcado ? "Desmarcar segmento" : "Selecionar segmento"} className="shrink-0 text-slate-400 hover:text-emerald-600">{marcado ? <CheckSquare className="h-5 w-5 text-emerald-600" /> : <Square className="h-5 w-5" />}</button>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {rename === s.id ? (<input autoFocus value={renameVal} onChange={(e) => setRenameVal(e.target.value)} onKeyDown={(e) => e.key === "Enter" && saveRename()} onBlur={saveRename} className="w-full rounded border border-emerald-300 px-2 py-1 text-sm font-semibold focus:outline-none" />) : (<span className="font-semibold text-slate-900">{s.nome}</span>)}
                    <span className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-semibold ${toneClasses[st.tone]}`}>{st.id === "validado" ? <CheckCircle2 className="h-3 w-3" /> : st.id === "pronto" ? <Eye className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}{st.label}</span>
                  </div>
                  {s.desc && <p className="mt-0.5 text-xs italic text-slate-400">{s.desc}</p>}
                  <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500"><span className="inline-flex items-center gap-1"><Search className="h-3 w-3" /> {s.pos.length} chave</span><span className="text-slate-300">·</span><span className="inline-flex items-center gap-1"><ListFilter className="h-3 w-3" /> {(s.filtros.length + (s.regras ? s.regras.length : 0)) || "sem"} filtro(s)</span></div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button onClick={() => startRename(s)} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700" title="Renomear" aria-label="Renomear segmento"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => pedirDel(s)} className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600" title="Excluir" aria-label="Excluir segmento"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="mt-3 pl-8"><FunilCompacto seg={s} /></div>
              <div className="mt-3 flex justify-end pl-8"><PrimaryButton onClick={() => onAjustar(s.id)}>{st.acao} <ChevronRight className="h-4 w-4" /></PrimaryButton></div>
            </div>
          );
        })}
        <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white p-3 text-sm font-medium text-slate-500 transition hover:border-emerald-300 hover:text-emerald-600" onClick={() => setSegmentos((segs) => [...segs, { id: "n" + Date.now(), nome: "Novo segmento", pos: [], neg: [], filtros: [], regras: [], temPrompt: false, configurado: false, validado: false, amostra: {} }])}><Plus className="h-4 w-4" /> Novo segmento em branco</button>
      </div>

      <div className="mt-6 flex flex-col items-end gap-2">
        <PrimaryButton onClick={tentarConcluir} disabled={false}>Concluir configuração <ArrowRight className="h-4 w-4" /></PrimaryButton>
      </div>

      {sel.length >= 2 && !merge && (<div className="fixed inset-x-0 bottom-6 z-50 mx-auto flex max-w-md items-center justify-between gap-3 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-lg"><span>{sel.length} segmentos selecionados</span><div className="flex gap-2"><button onClick={() => setSel([])} className="rounded-lg px-3 py-1.5 text-slate-300 hover:text-white">limpar</button><button onClick={() => setMerge(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 font-semibold hover:bg-emerald-400"><GitMerge className="h-4 w-4" /> Juntar</button></div></div>)}

      {confirmDel && (
        <Modal onClose={() => setConfirmDel(null)} titulo="Excluir segmento validado?">
          <p className="text-sm text-slate-600">O segmento <strong>{confirmDel.nome}</strong> já foi validado. Se excluir, você perderá a configuração e a validação dele.</p>
          <div className="mt-4 flex justify-end gap-2">
            <GhostButton onClick={() => setConfirmDel(null)}>Cancelar</GhostButton>
            <button onClick={() => removerSeg(confirmDel.id)} className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700"><Trash2 className="h-4 w-4" /> Excluir mesmo assim</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// modal simples com fechamento por Escape e clique no fundo
function Modal({ titulo, children, onClose }) {
  useEffect(() => { const h = (e) => e.key === "Escape" && onClose(); window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h); }, [onClose]);
  return (
    <div role="dialog" aria-modal="true" aria-label={titulo} className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-2"><h2 className="text-sm font-bold text-slate-900">{titulo}</h2><button onClick={onClose} aria-label="Fechar" className="rounded p-1 text-slate-400 hover:text-slate-700"><X className="h-4 w-4" /></button></div>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
}

// --- Etapa 4: Ajustar & validar (volume reativo) ----------------------------

const VAL_CLASSES = [{ k: "relevante", label: "Relevante" }, { k: "revisar", label: "Precisa de revisão" }, { k: "fora", label: "Fora do escopo" }];
const VAL_MOTIVOS = ["O produto ou serviço não faz parte do escopo", "O tipo de contratação não é atendido", "A oportunidade deveria ser considerada relevante", "A IA interpretou o contexto de forma incorreta", "A licitação não possui informações suficientes", "Outro motivo"];

function CardValidacao({ l, answer, onConcordar, onDesfazer, onSalvar }) {
  const iaKey = classeConfianca(l.confidence);
  const ia = IA_CLASSES[iaKey];
  const [aberto, setAberto] = useState(false);
  const [draft, setDraft] = useState({ classificacao: "", motivo: "", justificativa: "" });
  const [erros, setErros] = useState({});
  const justRef = useRef(null);
  const confirmado = answer?.resposta === "ok";
  const corrigido = answer?.resposta === "nok" && answer.correcao;
  const abrir = () => { setDraft(answer?.correcao ? { ...answer.correcao } : { classificacao: "", motivo: "", justificativa: "" }); setErros({}); setAberto(true); setTimeout(() => justRef.current?.focus(), 0); };
  const salvar = () => {
    const e = {};
    if (!draft.classificacao) e.classificacao = "Escolha a classificação correta.";
    if (!draft.motivo) e.motivo = "Selecione um motivo.";
    if (draft.motivo === "Outro motivo" && !draft.justificativa.trim()) e.justificativa = "Descreva o motivo para “Outro motivo”.";
    setErros(e); if (Object.keys(e).length) return;
    onSalvar(l.id, { ...draft, justificativa: draft.justificativa.trim() }); setAberto(false);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0"><p className="text-sm font-medium text-slate-800">{l.titulo}</p><p className="text-xs text-slate-400">{l.orgao}</p></div>
        <span className={`shrink-0 rounded-md border px-2 py-0.5 text-xs font-semibold ${toneClasses[ia.tone]}`}>Classificação da IA: {ia.label}</span>
      </div>

      {!aberto && !confirmado && !corrigido && (
        <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
          <button onClick={() => onConcordar(l.id)} className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 px-3 py-1.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50"><ThumbsUp className="h-4 w-4" /> Concordo com a IA</button>
          <button onClick={abrir} className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-700 transition hover:bg-rose-50"><ThumbsDown className="h-4 w-4" /> Discordo da IA</button>
        </div>
      )}

      {confirmado && (
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700"><CheckCircle2 className="h-4 w-4" /> Classificação confirmada</span>
          <button onClick={() => onDesfazer(l.id)} className="text-xs font-medium text-slate-500 hover:text-slate-800">Desfazer</button>
        </div>
      )}

      {corrigido && !aberto && (
        <div className="mt-3 space-y-1 border-t border-slate-100 pt-3 text-xs text-slate-600">
          <div>Classificação original da IA: <span className="font-medium">{ia.label}</span></div>
          <div>Sua classificação: <span className="font-medium text-slate-800">{VAL_CLASSES.find((c) => c.k === answer.correcao.classificacao)?.label}</span></div>
          <div>Motivo: <span className="font-medium">{answer.correcao.motivo}</span></div>
          {answer.correcao.justificativa && <div>Justificativa: <span className="italic">{answer.correcao.justificativa}</span></div>}
          <button onClick={abrir} className="mt-1 inline-flex items-center gap-1 font-semibold text-emerald-600 hover:text-emerald-800"><Pencil className="h-3 w-3" /> Editar correção</button>
        </div>
      )}

      {aberto && (
        <div className="mt-3 space-y-3 border-t border-slate-100 pt-3">
          <div>
            <p className="text-xs font-semibold text-slate-700">Como esta licitação deveria ser classificada?</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">{VAL_CLASSES.map((c) => (<button key={c.k} onClick={() => { setDraft((d) => ({ ...d, classificacao: c.k })); setErros((e) => ({ ...e, classificacao: undefined })); }} className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition ${draft.classificacao === c.k ? "border-emerald-400 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{c.label}</button>))}</div>
            {erros.classificacao && <p aria-live="polite" className="mt-1 text-xs text-rose-600">{erros.classificacao}</p>}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700">Por que a classificação está incorreta?</p>
            <div className="mt-1.5 space-y-1">{VAL_MOTIVOS.map((m) => (<label key={m} className="flex cursor-pointer items-center gap-2 text-xs text-slate-600"><input type="radio" name={`motivo-${l.id}`} checked={draft.motivo === m} onChange={() => { setDraft((d) => ({ ...d, motivo: m })); setErros((e) => ({ ...e, motivo: undefined })); }} className="accent-emerald-600" /> {m}</label>))}</div>
            {erros.motivo && <p aria-live="polite" className="mt-1 text-xs text-rose-600">{erros.motivo}</p>}
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700">Conte o que a IA deveria considerar {draft.motivo === "Outro motivo" && <span className="text-rose-500">*</span>}</label>
            <textarea ref={justRef} rows={2} value={draft.justificativa} onChange={(e) => { setDraft((d) => ({ ...d, justificativa: e.target.value })); if (erros.justificativa) setErros((er) => ({ ...er, justificativa: undefined })); }} placeholder="Ex.: fornecemos o equipamento, mas não prestamos o serviço de manutenção solicitado neste edital." className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100" />
            {erros.justificativa && <p aria-live="polite" className="mt-1 text-xs text-rose-600">{erros.justificativa}</p>}
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setAberto(false)} className="rounded-lg px-3 py-1.5 text-sm text-slate-500 hover:text-slate-800">Cancelar</button>
            <button onClick={salvar} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-emerald-700"><Check className="h-4 w-4" /> Salvar correção</button>
          </div>
        </div>
      )}
    </div>
  );
}

// resumo legível da lógica de filtros (E/OU)
function resumoLogica(seg) {
  const partesE = [];
  if (seg.filtros.includes("Exclui ME/EPP")) partesE.push("não sejam exclusivas para ME/EPP");
  seg.filtros.filter((f) => f !== "Exclui ME/EPP").forEach((f) => partesE.push(f.toLowerCase()));
  const regras = seg.regras || [];
  const condTxt = (r) => (r.condicoes || []).map(fmtCond).join(" E ");
  let frase = "Recomendar oportunidades que " + (partesE.length ? partesE.join(" E ") : "atendam à configuração atual");
  if (regras.length) frase += (partesE.length ? " E que atendam à " : ", atendendo à ") + regras.map((r) => `regra (${condTxt(r)})`).join(" OU à ");
  return frase + ".";
}

function Ajustar({ seg, onUpdate, onApplyAll, onBack, onValidar, onConcluir, ultimo }) {
  const novaLinha = () => ({ campo: "regiao", op: CAMPOS.regiao.ops[0], valor: primeiroValor("regiao") });
  const [novoPos, setNovoPos] = useState(""); const [novoNeg, setNovoNeg] = useState("");
  const [posErro, setPosErro] = useState(""); const [negErro, setNegErro] = useState("");
  const [aplicarTodos, setAplicarTodos] = useState(false);
  const [toast, setToast] = useState(null);
  const [modo, setModo] = useState("excluir");
  const [linhas, setLinhas] = useState([novaLinha()]);
  if (!seg) return null;
  // adiciona palavra-chave com validação (min 3, trim, dedupe CI) e conflito entre listas
  const addPalavra = (lista, outra, raw, chave, setErro) => {
    const tokens = kwTokens(raw);
    const conflito = tokens.find((t) => outra.some((o) => normalizar(o) === normalizar(t)));
    if (conflito) { setErro("Esta palavra já está sendo utilizada na outra lista."); return false; }
    const { result, curto, added } = addKeywords(lista, raw);
    onUpdate({ [chave]: result });
    setErro(added === 0 && (curto || tokens.some((t) => t.length < 3)) ? "Digite uma palavra-chave com pelo menos 3 caracteres." : "");
    return true;
  };
  const submitPos = (raw) => { if (addPalavra(seg.pos, seg.neg, raw, "pos", setPosErro)) setNovoPos(""); };
  const submitNeg = (raw) => { if (addPalavra(seg.neg, seg.pos, raw, "neg", setNegErro)) setNovoNeg(""); };
  const setPos = (next) => onUpdate({ pos: next });
  const setNeg = (next) => onUpdate({ neg: next });
  const cfgKey = JSON.stringify([seg.pos, seg.neg, seg.filtros, seg.regras]);
  const cfgRef = useRef(cfgKey); const [mudou, setMudou] = useState(false);
  useEffect(() => { if (cfgRef.current !== cfgKey) { cfgRef.current = cfgKey; setMudou(true); } }, [cfgKey]);
  const temMe = seg.filtros.includes("Exclui ME/EPP");
  const toggleMe = () => onUpdate({ filtros: temMe ? seg.filtros.filter((f) => f !== "Exclui ME/EPP") : [...seg.filtros, "Exclui ME/EPP"] });
  const regras = seg.regras || [];
  const setLinha = (i, patch) => setLinhas((ls) => ls.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  const trocarCampo = (i, c) => setLinha(i, { campo: c, op: CAMPOS[c].ops[0], valor: primeiroValor(c) });
  const addLinha = () => setLinhas((ls) => [...ls, novaLinha()]);
  const delLinha = (i) => setLinhas((ls) => (ls.length > 1 ? ls.filter((_, j) => j !== i) : ls));
  const linhaValida = (l) => CAMPOS[l.campo].tipo === "select" || String(l.valor).trim() !== "";
  const salvarRegra = () => {
    const cs = linhas.filter(linhaValida);
    if (!cs.length) return;
    const regra = { modo, condicoes: cs };
    if (aplicarTodos) { onApplyAll(regra); setToast("Regra aplicada a todos os segmentos."); setTimeout(() => setToast(null), 3000); }
    else onUpdate({ regras: [...regras, regra] });
    setLinhas([novaLinha()]);
  };
  const delRegra = (i) => onUpdate({ regras: regras.filter((_, j) => j !== i) });
  const borderline = seg.borderline || "receber";
  const promptTexto = seg.prompt !== undefined ? seg.prompt : (seg.temPrompt ? PROMPT_PADRAO : "");
  const temPromptTexto = promptTexto.trim() !== "";

  return (
    <div className="mx-auto max-w-2xl">
      <button onClick={onBack} className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"><ArrowLeft className="h-4 w-4" /> voltar aos segmentos</button>
      <h1 className="text-xl font-bold text-slate-900">Configure este segmento</h1>
      <p className="mt-1 text-sm text-slate-600">Personalize como a Settle deve encontrar e classificar as licitações deste segmento. Revise as palavras-chave, defina os filtros e escolha como tratar oportunidades em que a IA não tiver certeza.</p>
      <div className="mt-3 flex items-center gap-2"><Layers className="h-5 w-5 text-emerald-600" /><span className="text-lg font-semibold text-slate-900">{seg.nome}</span></div>

      {/* navegação interna */}
      <div className="mt-3 inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-sm shadow-sm">
        <span aria-current="step" className="rounded-md bg-emerald-600 px-3 py-1.5 font-semibold text-white">1. Configuração</span>
        <button onClick={onValidar} className="rounded-md px-3 py-1.5 font-medium text-slate-500 transition hover:text-slate-800">2. Validação da amostra</button>
      </div>

      <div className="mt-4 rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-600"><TrendingUp className="h-3.5 w-3.5" /> Estimativa com a configuração atual</div>
        <p className="mt-0.5 text-xs text-slate-500">Os volumes abaixo são atualizados conforme você modifica as palavras-chave, os filtros e as regras deste segmento.</p>
        <div className="mt-3"><FunilDestaque seg={seg} /></div>
        {mudou && <p aria-live="polite" className="mt-2 text-xs text-emerald-600">Volumes atualizados com a configuração atual.</p>}
      </div>

      <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800"><Search className="h-4 w-4 text-slate-400" /> Palavras-chave da busca</div>
        <p className="mt-0.5 text-xs text-slate-500">Defina quais termos a Settle deve procurar nos editais deste segmento. Utilize termos relacionados especificamente a este segmento.</p>
        <div className="mt-3">
          <p className="text-xs font-medium text-emerald-700">Palavras-chave de interesse</p>
          <p className="mb-1.5 text-[11px] text-slate-400">Termos que ajudam a encontrar oportunidades relacionadas a este segmento.</p>
          <div className="flex flex-wrap gap-2">{seg.pos.map((k, i) => (<Chip key={i} tone="emerald" onRemove={() => setPos(seg.pos.filter((_, j) => j !== i))}><span className="font-mono">{k}</span></Chip>))}<input value={novoPos} onChange={(e) => { setNovoPos(e.target.value); if (posErro) setPosErro(""); }} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); submitPos(novoPos); } }} onPaste={(e) => { const t = e.clipboardData.getData("text"); if (/[,;\n\t]/.test(t)) { e.preventDefault(); submitPos(t); } }} aria-label="Adicionar palavra-chave de interesse" placeholder="+ Enter, vírgula ou ;" className="w-40 rounded-md border border-slate-200 px-2 py-1 text-xs focus:border-emerald-400 focus:outline-none" /></div>
          {posErro && <p aria-live="polite" className="mt-1 flex items-center gap-1 text-xs text-rose-600"><AlertTriangle className="h-3 w-3" /> {posErro}</p>}
        </div>
        <div className="mt-4">
          <p className="text-xs font-medium text-rose-700">Palavras-chave de exclusão</p>
          <p className="mb-1.5 text-[11px] text-slate-400">Termos que ajudam a identificar resultados provavelmente indesejados. As oportunidades excluídas continuarão disponíveis para consulta.</p>
          <div className="flex flex-wrap gap-2">{seg.neg.map((k, i) => (<Chip key={i} tone="rose" onRemove={() => setNeg(seg.neg.filter((_, j) => j !== i))}><span className="font-mono">{k}</span></Chip>))}<input value={novoNeg} onChange={(e) => { setNovoNeg(e.target.value); if (negErro) setNegErro(""); }} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); submitNeg(novoNeg); } }} onPaste={(e) => { const t = e.clipboardData.getData("text"); if (/[,;\n\t]/.test(t)) { e.preventDefault(); submitNeg(t); } }} aria-label="Adicionar palavra-chave de exclusão" placeholder="+ Enter, vírgula ou ;" className="w-40 rounded-md border border-slate-200 px-2 py-1 text-xs focus:border-rose-400 focus:outline-none" /></div>
          {negErro && <p aria-live="polite" className="mt-1 flex items-center gap-1 text-xs text-rose-600"><AlertTriangle className="h-3 w-3" /> {negErro}</p>}
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800"><ListFilter className="h-4 w-4 text-slate-400" /> Filtros e regras</div>

        {/* Bloco E — condições gerais */}
        <div className="mt-3 rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2"><span className="text-sm font-semibold text-slate-800">Condições gerais — todas devem ser atendidas</span></div>
          <p className="mt-0.5 text-xs text-slate-500">Todas as condições deste bloco precisam ser atendidas para que a oportunidade seja recomendada.</p>
          <label className="mt-3 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5"><span className="text-sm text-slate-700">Não ser exclusiva para ME/EPP</span><button onClick={toggleMe} role="switch" aria-checked={temMe} aria-label="Excluir licitações exclusivas de ME/EPP" className={`relative h-5 w-9 rounded-full transition ${temMe ? "bg-emerald-600" : "bg-slate-300"}`}><span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${temMe ? "left-4" : "left-0.5"}`} /></button></label>
          {regras.length > 0 && <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600"><Check className="h-3.5 w-3.5 text-emerald-600" /> Atender a uma das regras regionais configuradas abaixo</div>}
        </div>

        {/* Bloco OU — regras por região */}
        <div className="mt-3 rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2"><span className="text-sm font-semibold text-slate-800">Regras por região — basta uma ser atendida</span></div>
          <p className="mt-0.5 text-xs text-slate-500">Quando houver mais de uma regra regional, basta que a oportunidade atenda a uma delas.</p>

          {regras.length > 0 && (
            <div className="mt-3 space-y-2">
              {regras.map((r, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <div className="my-1 h-px bg-slate-200" />}
                  <div className={`rounded-lg border border-slate-200 border-l-4 bg-white px-3 py-2 text-sm shadow-sm ${r.modo === "excluir" ? "border-l-rose-400" : "border-l-emerald-400"}`}>
                    <div className="flex items-start justify-between gap-2">
                      <span className={`text-xs font-semibold ${r.modo === "excluir" ? "text-rose-600" : "text-emerald-700"}`}>{r.modo === "excluir" ? "Excluir quando" : "Manter só quando"}</span>
                      <button onClick={() => delRegra(i)} aria-label="Remover regra" className="shrink-0 text-slate-300 hover:text-rose-500"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                    <div className="mt-1 flex flex-col gap-1">
                      {(r.condicoes || []).map((c, j) => (<span key={j} className="w-fit rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-700">{fmtCond(c)}</span>))}
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          )}

          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
                <button onClick={() => setModo("excluir")} className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${modo === "excluir" ? "bg-rose-500 text-white" : "text-slate-500 hover:text-slate-700"}`}>Excluir</button>
                <button onClick={() => setModo("manter")} className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${modo === "manter" ? "bg-emerald-500 text-white" : "text-slate-500 hover:text-slate-700"}`}>Manter só</button>
              </div>
              <span className="text-sm text-slate-500">editais onde:</span>
            </div>

            <div className="mt-3 space-y-2">
              {linhas.map((l, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-4 shrink-0 text-center text-xs font-medium text-slate-400">{i > 0 ? "e" : ""}</span>
                  <select value={l.campo} onChange={(e) => trocarCampo(i, e.target.value)} className="shrink-0 rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm focus:border-emerald-400 focus:outline-none">{Object.keys(CAMPOS).map((k) => (<option key={k} value={k}>{CAMPOS[k].label}</option>))}</select>
                  <select value={l.op} onChange={(e) => setLinha(i, { op: e.target.value })} className="shrink-0 rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm focus:border-emerald-400 focus:outline-none">{CAMPOS[l.campo].ops.map((o) => (<option key={o} value={o}>{o}</option>))}</select>
                  {CAMPOS[l.campo].tipo === "select" ? (
                    <select value={l.valor} onChange={(e) => setLinha(i, { valor: e.target.value })} className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm focus:border-emerald-400 focus:outline-none">{CAMPOS[l.campo].opcoes.map((o) => (<option key={o} value={o}>{o}</option>))}</select>
                  ) : (
                    <div className="relative min-w-0 flex-1">
                      {l.campo === "valor" && <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">R$</span>}
                      <input type="number" value={l.valor} onChange={(e) => setLinha(i, { valor: e.target.value })} placeholder={l.campo === "habitantes" ? "habitantes" : "valor"} className={`w-full rounded-lg border border-slate-300 bg-white py-2 text-sm focus:border-emerald-400 focus:outline-none ${l.campo === "valor" ? "pl-9 pr-2.5" : "px-2.5"}`} />
                    </div>
                  )}
                  <button onClick={() => delLinha(i)} disabled={linhas.length === 1} className="shrink-0 rounded p-1.5 text-slate-300 hover:text-rose-500 disabled:opacity-30"><X className="h-4 w-4" /></button>
                </div>
              ))}
            </div>

            <button onClick={addLinha} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-800"><Plus className="h-3.5 w-3.5" /> adicionar condição</button>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-3">
              <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-600"><input type="checkbox" checked={aplicarTodos} onChange={() => setAplicarTodos(!aplicarTodos)} className="accent-emerald-600" /> aplicar a <strong>todos os segmentos</strong></label>
              <button onClick={salvarRegra} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"><Check className="h-4 w-4" /> Salvar regra</button>
            </div>
          </div>
        </div>

        <p className="mt-3 text-xs text-slate-500">Dentro de cada regra, todas as condições precisam ser atendidas. Quando existem várias regras regionais, basta que uma delas seja atendida.</p>

        <div className="mt-3 rounded-lg bg-slate-50 p-3">
          <div className="text-xs font-semibold text-slate-700">Como esta configuração será aplicada</div>
          <p aria-live="polite" className="mt-0.5 text-sm text-slate-600">{resumoLogica(seg)}</p>
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800"><AlertTriangle className="h-4 w-4 text-slate-400" /> Como tratar oportunidades com classificação incerta?</div>
        <p className="mt-0.5 text-xs text-slate-500">Algumas licitações podem não trazer informações suficientes para uma decisão segura. Escolha como a Settle deve apresentar esses casos.</p>
        <div className="mt-3 space-y-2">
          {[
            { val: "receber", t: "Enviar para revisão", rec: true, d: "As oportunidades incertas serão exibidas em uma área separada para você analisar. Nenhuma será descartada automaticamente." },
            { val: "ocultar", t: "Não exibir no feed principal", d: "As oportunidades incertas não aparecerão entre as recomendações, mas continuarão disponíveis para consulta." },
          ].map((o) => {
            const sel = borderline === o.val;
            return (
              <label key={o.val} className={`flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2.5 text-sm ${sel ? "border-emerald-400 bg-emerald-50" : "border-slate-200 hover:bg-slate-50"}`}>
                <input type="radio" name="incerto" checked={sel} onChange={() => onUpdate({ borderline: o.val })} className="mt-0.5 accent-emerald-600" />
                <span><span className="font-medium text-slate-800">{o.t}</span>{o.rec && <span className="ml-1.5 rounded bg-emerald-50 px-1.5 py-0.5 text-xs font-semibold text-emerald-600">Recomendado</span>}<span className="block text-xs text-slate-500">{o.d}</span></span>
              </label>
            );
          })}
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800"><MessageSquareText className="h-4 w-4 text-slate-400" /> Critérios de interesse da IA</div>
        <p className="mt-0.5 text-xs text-slate-500">Estas orientações ajudam a IA a decidir quais oportunidades encontradas devem ser recomendadas para este segmento. Descreva o que caracteriza uma oportunidade relevante e quais situações devem ser consideradas fora do escopo.</p>
        <textarea rows={3} value={promptTexto} onChange={(e) => onUpdate({ prompt: e.target.value, temPrompt: e.target.value.trim() !== "" })} aria-label="Critérios de interesse da IA" placeholder="Ex.: recomendar apenas o fornecimento do equipamento; considerar fora do escopo serviços de manutenção e treinamento." className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm leading-relaxed focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100" />
      </section>

      <div className="mt-6 flex justify-end">
        <PrimaryButton onClick={onValidar}><Eye className="h-4 w-4" /> Ir para validação da amostra <ArrowRight className="h-4 w-4" /></PrimaryButton>
      </div>
      {toast && (<div className="fixed inset-x-0 bottom-6 z-50 mx-auto flex max-w-md items-start gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-lg"><Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" /><span>{toast}</span></div>)}
    </div>
  );
}

// --- Validar amostra --------------------------------------------------------

const AJUSTE_LABEL = { interesse: "Palavra-chave de interesse sugerida", exclusao: "Palavra-chave de exclusão sugerida", criterio: "Alteração nos critérios da IA", filtro: "Alteração de filtro" };

function Validar({ seg, onUpdate, onBack, onOk, ultimo, posicao }) {
  const base = LICITACOES.filter((l) => [1, 2, 3, 5].includes(l.id));
  const [ajIgnorados, setAjIgnorados] = useState({});
  const [ajAplicados, setAjAplicados] = useState({});
  const [ajEdit, setAjEdit] = useState({});
  const [reavaliado, setReavaliado] = useState(false);
  if (!seg) return null;
  const amostra = seg.amostra || {};

  const setAmostra = (next) => onUpdate({ amostra: next });
  const concordar = (id) => setAmostra({ ...amostra, [id]: { resposta: "ok" } });
  const desfazer = (id) => { const n = { ...amostra }; delete n[id]; setAmostra(n); };
  const salvarCorrecao = (id, correcao) => setAmostra({ ...amostra, [id]: { resposta: "nok", correcao } });

  const completo = (l) => { const a = amostra[l.id]; return !!(a && (a.resposta === "ok" || (a.resposta === "nok" && a.correcao))); };
  const revisadas = base.filter(completo).length;
  const todos = revisadas === base.length;

  // ajustes considerando TODAS as discordâncias registradas
  const ajustes = [];
  base.forEach((l) => {
    const a = amostra[l.id];
    if (!a || a.resposta !== "nok" || !a.correcao) return;
    const kw = l.motivos?.find((m) => m.tipo === "keyword")?.txt || l.motivos?.[0]?.txt || "";
    if (a.correcao.classificacao === "fora") ajustes.push({ id: "ex" + l.id, tipo: "exclusao", texto: kw, origem: l.titulo });
    else if (a.correcao.classificacao === "relevante") ajustes.push({ id: "in" + l.id, tipo: "interesse", texto: kw, origem: l.titulo });
    else ajustes.push({ id: "cr" + l.id, tipo: "criterio", texto: "Tratar como incerto quando faltar informação", origem: l.titulo });
    if (/contexto/i.test(a.correcao.motivo || "")) ajustes.push({ id: "cx" + l.id, tipo: "criterio", texto: "Reforçar o contexto correto deste caso nos critérios da IA", origem: l.titulo });
  });
  const textoDe = (a) => (ajEdit[a.id] !== undefined ? ajEdit[a.id] : a.texto);
  const ajVisiveis = ajustes.filter((a) => !ajIgnorados[a.id] && !ajAplicados[a.id]);

  const aplicarPatch = (lista) => {
    let pos = [...seg.pos], neg = [...seg.neg], prompt = seg.prompt || (seg.temPrompt ? PROMPT_PADRAO : ""), temPrompt = seg.temPrompt;
    lista.forEach((a) => { const t = textoDe(a); if (a.tipo === "interesse" && t) pos = addKeywords(pos, t).result; else if (a.tipo === "exclusao" && t) neg = addKeywords(neg, t).result; else if (a.tipo === "criterio") { prompt = (prompt ? prompt + " " : "") + t; temPrompt = true; } });
    onUpdate({ pos, neg, prompt, temPrompt });
  };
  const aplicarUm = (a) => { aplicarPatch([a]); setAjAplicados((s) => ({ ...s, [a.id]: true })); };
  const aplicarTodosEReavaliar = () => { aplicarPatch(ajVisiveis); const done = {}; ajVisiveis.forEach((a) => (done[a.id] = true)); setAjAplicados((s) => ({ ...s, ...done })); setReavaliado(true); };

  return (
    <div className="mx-auto max-w-2xl">
      <button onClick={onBack} className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"><ArrowLeft className="h-4 w-4" /> voltar à configuração</button>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2"><Eye className="h-5 w-5 text-emerald-600" /><h1 className="text-xl font-bold text-slate-900">Valide uma amostra do segmento</h1></div>
        {posicao && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">{posicao}</span>}
      </div>
      <p className="mt-1 text-sm text-slate-600">Revise algumas licitações encontradas com a configuração atual. Seu feedback ajudará a confirmar se a Settle está classificando corretamente as oportunidades deste segmento.</p>
      <p className="mt-1 text-sm text-slate-500">Compare a decisão da IA com o que sua empresa realmente buscaria. Confirme quando estiver correto ou corrija quando discordar.</p>

      <div className="mt-3 inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-sm shadow-sm">
        <button onClick={onBack} className="rounded-md px-3 py-1.5 font-medium text-slate-500 transition hover:text-slate-800">1. Configuração</button>
        <span aria-current="step" className="rounded-md bg-emerald-600 px-3 py-1.5 font-semibold text-white">2. Validação da amostra</span>
      </div>

      <div className="mt-5 space-y-2.5">
        {base.map((l) => (<CardValidacao key={l.id} l={l} answer={amostra[l.id]} onConcordar={concordar} onDesfazer={desfazer} onSalvar={salvarCorrecao} />))}
      </div>

      {ajVisiveis.length > 0 && (
        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800"><Sparkles className="h-4 w-4" /> Ajustes sugeridos a partir do seu feedback</div>
          <p className="mt-0.5 text-xs text-emerald-700/80">Identificamos mudanças que podem melhorar a classificação deste segmento. Revise os ajustes antes de aplicá-los.</p>
          <div className="mt-3 space-y-2">
            {ajVisiveis.map((a) => (
              <div key={a.id} className="rounded-lg border border-emerald-200 bg-white p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-emerald-700">{AJUSTE_LABEL[a.tipo]}</span>
                </div>
                <input value={textoDe(a)} onChange={(e) => setAjEdit((s) => ({ ...s, [a.id]: e.target.value }))} aria-label="Editar ajuste sugerido" className="mt-1.5 w-full rounded-md border border-slate-200 px-2 py-1 text-sm focus:border-emerald-400 focus:outline-none" />
                <p className="mt-1 text-[11px] text-slate-400">Origem: “{a.origem}”</p>
                <div className="mt-2 flex gap-2">
                  <button onClick={() => aplicarUm(a)} className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700">Aplicar ajuste</button>
                  <button onClick={() => setAjIgnorados((s) => ({ ...s, [a.id]: true }))} className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50">Ignorar</button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-end"><PrimaryButton onClick={aplicarTodosEReavaliar}><Zap className="h-4 w-4" /> Aplicar ajustes e reavaliar amostra</PrimaryButton></div>
        </div>
      )}

      {reavaliado && (
        <div aria-live="polite" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <p className="flex items-center gap-2 font-semibold"><CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" /> Amostra reavaliada</p>
          <p className="mt-0.5 text-emerald-700">Os ajustes selecionados foram aplicados. Revise novamente os casos alterados antes de concluir.</p>
        </div>
      )}

      <div className="mt-6 flex flex-col items-end gap-2">
        <p aria-live="polite" className="text-xs text-slate-500">{revisadas} de {base.length} licitações revisadas</p>
        <PrimaryButton onClick={onOk} disabled={false}><Check className="h-4 w-4" /> {ultimo ? "Concluir validação" : "Validar segmento e continuar"}</PrimaryButton>
      </div>
    </div>
  );
}

// --- Licitações -------------------------------------------------------------

function confTier(c) { if (c >= 75) return "alta"; if (c >= 30) return "revisar"; return "fora"; }
// --- Etapa 6: Licitações (layout da tela Recomendadas do anexo) -------------
const RECOMENDADAS = [
  { edital: "90001/2026", orgao: "SECRETARIA DE EDUCAÇÃO DO ESTADO DE MINAS GERAIS", objeto: "Aquisição de tablets educacionais 10\", notebooks e desktops para a rede estadual de ensino, incluindo instalação, configuração e garantia de 36 meses com suporte on-site. Entrega em 47 unidades escolares.", valor: "47.284.499,63", id: "1078513", modalidade: "Pregão - Eletrônico", julgamento: "Menor preço por item", estado: "MG", cidade: "Belo Horizonte", habitantes: "2.315.560", portal: "compras.mg.gov…", adicionada: "04/02/2026", atualizada: "12/02/2026", envio: "13/02/2026", arquivos: 3, semAnexo: false, updated: true, aderencia: "aderente", motivo: "Objeto casa com o segmento (tablets, notebooks e desktops)." },
  { edital: "88234/2026", orgao: "TRIBUNAL DE JUSTIÇA DO ESTADO DE SÃO PAULO", objeto: "Fornecimento de notebooks i5/i7 e kits de laboratório de informática para servidores, com suporte e garantia de 48 meses.", valor: "12.640.310,00", id: "1099842", modalidade: "Pregão - Eletrônico", julgamento: "Menor preço por lote", estado: "SP", cidade: "São Paulo", habitantes: "11.451.999", portal: "compras.tjsp.jus…", adicionada: "07/02/2026", atualizada: "14/02/2026", envio: "21/02/2026", arquivos: 3, semAnexo: false, aderencia: "aderente", motivo: "Notebooks e kits de informática dentro do escopo." },
  { edital: "73/2026", orgao: "PREFEITURA MUNICIPAL DE SOROCABA", objeto: "Aquisição de capas protetoras e películas para tablets da rede municipal, com entrega parcelada.", valor: "85.000,00", id: "1102944", modalidade: "Dispensa", julgamento: "Menor preço global", estado: "SP", cidade: "Sorocaba", habitantes: "687.357", portal: "compras.sorocaba.sp…", adicionada: "09/02/2026", atualizada: "11/02/2026", envio: "24/02/2026", arquivos: 1, semAnexo: false, aderencia: "duvida", motivo: "Bateu em “tablet”, mas parece acessório (capa), não o dispositivo. Requer análise." },
  { edital: "90455/2025", orgao: "SECRETARIA DE ESTADO DA SAÚDE DO CEARÁ", objeto: "Registro de preços para aquisição de mobiliário hospitalar, macas e equipamentos médico-hospitalares para as unidades de pronto atendimento.", valor: "8.910.770,45", id: "1065217", modalidade: "Pregão - Presencial", julgamento: "Menor preço por item", estado: "CE", cidade: "Fortaleza", habitantes: "2.703.391", portal: "licitacoes.saude.ce…", adicionada: "29/01/2026", atualizada: "10/02/2026", envio: "18/02/2026", arquivos: 2, semAnexo: false, aderencia: "nao_aderente", motivo: "Mobiliário e equipamentos hospitalares, fora do segmento da empresa." },
  { edital: "204/2025", orgao: "SECRETARIA DE EDUCAÇÃO DO ESTADO DA BAHIA", objeto: "Contratação de treinamento e capacitação de professores no uso de software de gestão escolar.", valor: "320.000,00", id: "1061780", modalidade: "Pregão - Eletrônico", julgamento: "Menor preço por item", estado: "BA", cidade: "Salvador", habitantes: "2.417.678", portal: "comprasnet.ba.gov…", adicionada: "02/02/2026", atualizada: "05/02/2026", envio: "20/02/2026", arquivos: 2, semAnexo: true, aderencia: "nao_aderente", motivo: "Serviço de treinamento, sem fornecimento de equipamento." },
];
const ADER = {
  aderente: { label: "Aderente", cls: "border-emerald-200 bg-emerald-50 text-emerald-700", icon: Check },
  duvida: { label: "Dúvida", cls: "border-amber-200 bg-amber-50 text-amber-700", icon: AlertTriangle },
  nao_aderente: { label: "Não aderente", cls: "border-rose-200 bg-rose-50 text-rose-700", icon: X },
};
const AV_CORES = ["#6b7280", "#0f766e", "#9333ea"];

function Fld({ k, v, warn }) {
  return (<div className="min-w-0"><div className="mb-0.5 text-[13px] font-semibold text-slate-900">{k}</div><div className="truncate text-sm" style={{ color: warn ? "#d97706" : "#737373", fontWeight: warn ? 500 : 400 }}>{v}</div></div>);
}

function RecomendadaCard({ d, segNome }) {
  const ad = ADER[d.aderencia];
  return (
    <article className="rounded-[10px] border border-slate-200 bg-white p-4 shadow-sm sm:px-[18px]">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="h-[18px] w-[18px] flex-none rounded-[5px] border-[1.5px] border-slate-300 bg-white" />
        <span className="whitespace-nowrap text-[15px] font-semibold text-slate-900">Edital <b className="font-bold">{d.edital}</b></span>
        {d.updated && <span className="inline-flex items-center gap-1.5 rounded-[7px] px-2 py-1 text-xs font-semibold text-white" style={{ backgroundColor: "#d97706" }}><RefreshCw className="h-3 w-3" /> Atualizado</span>}
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-50">Descartar</button>
          <button className="rounded-lg border px-3.5 py-2 text-sm font-medium text-white transition hover:opacity-90" style={{ backgroundColor: "#3a9b9e", borderColor: "#3a9b9e" }}>Enviar para análise</button>
          <button className="inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm font-medium transition hover:brightness-95" style={{ backgroundColor: "#fdf6ec", borderColor: "#f3e3c8", color: "#d97706" }}><Pencil className="h-3.5 w-3.5" /> Em disputa ou Homologação</button>
          <div className="flex items-center">
            {["JS", "MR", "AL"].map((a, i) => (<span key={a} className="-ml-2 flex h-[30px] w-[30px] items-center justify-center rounded-full border-2 border-white text-[11px] font-semibold text-white first:ml-0" style={{ backgroundColor: AV_CORES[i] }}>{a}</span>))}
            <span className="-ml-2 flex h-[30px] w-[30px] items-center justify-center rounded-full border-2 border-white bg-slate-100 text-sm font-bold text-slate-500">+</span>
          </div>
          <div className="flex items-center gap-1.5">
            {[Bookmark, Bell, Link2, Share2].map((Ic, i) => (<button key={i} className="flex h-[34px] w-[34px] items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"><Ic className="h-[17px] w-[17px]" /></button>))}
            <button className="relative flex h-[34px] w-[34px] items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50">{d.semAnexo ? <FolderX className="h-[17px] w-[17px]" /> : <Folder className="h-[17px] w-[17px]" />}{!d.semAnexo && d.arquivos > 0 && <span className="absolute -right-1.5 -top-1.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full border-2 border-white px-1 text-[10px] font-bold text-white" style={{ backgroundColor: "#3a9b9e" }}>{d.arquivos}</span>}</button>
          </div>
        </div>
      </div>

      <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
        <span className={`inline-flex items-center gap-1.5 rounded-[7px] border px-2 py-1 text-xs font-semibold ${ad.cls}`}><ad.icon className="h-3 w-3" /> {ad.label}</span>
        <span className="min-w-0 text-[13px] text-slate-500"><b className="font-semibold text-slate-900">Motivo:</b> {d.motivo}</span>
      </div>

      <div className="mb-3 mt-3.5 flex flex-wrap gap-1.5">
        <span className="rounded-[7px] px-2 py-0.5 text-xs font-semibold text-slate-50" style={{ backgroundColor: "#171717" }}>{segNome}</span>
      </div>

      <p className="mb-2 text-sm leading-[21px] text-slate-900"><span className="font-semibold">Órgão:</span> {d.orgao} <span className="ml-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">ME - EPP</span></p>
      <p className="mb-2 text-sm leading-[21px] text-slate-900"><span className="font-semibold">Objeto:</span> {d.objeto}</p>
      <p className="mb-3.5 mt-2.5 text-[15px] font-bold text-slate-900">Valor global: R$ {d.valor}</p>

      <div className="flex flex-col overflow-hidden rounded-lg border border-slate-200 sm:flex-row">
        <div className="flex flex-none flex-col gap-3.5 border-b border-slate-200 p-4 sm:w-[230px] sm:border-b-0 sm:border-r">
          <div className="flex gap-6"><Fld k="Adicionada" v={d.adicionada} /><Fld k="Atualizada" v={d.atualizada} /></div>
          <Fld k="Envio da proposta" v={d.envio} warn />
        </div>
        <div className="grid flex-1 grid-cols-2 gap-x-[18px] gap-y-3.5 p-4 sm:grid-cols-5">
          <Fld k="ID" v={d.id} /><Fld k="UASG" v="–" /><Fld k="Modalidade" v={d.modalidade} /><Fld k="Julgamento" v={d.julgamento} /><Fld k="Estado" v={d.estado} />
          <Fld k="Cidade" v={d.cidade} /><Fld k="Habitantes" v={d.habitantes} /><Fld k="CAPAG Estadual" v="–" /><Fld k="CAPAG Municipal" v="–" /><Fld k="Portal de disputa" v={d.portal} />
        </div>
      </div>
    </article>
  );
}

function Licitacoes({ onBack, onAjustar, segNome }) {
  const [tab, setTab] = useState("relevantes");
  const nRelev = RECOMENDADAS.filter((d) => d.aderencia !== "nao_aderente").length;
  const nRuido = RECOMENDADAS.length - nRelev;
  const lista = RECOMENDADAS.filter((d) => (tab === "relevantes" ? d.aderencia !== "nao_aderente" : d.aderencia === "nao_aderente"));
  return (
    <div className="mx-auto max-w-full">
      <div className="mb-5">
        <p className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[30px]">Licitações recomendadas</p>
        <p className="mt-1 text-sm text-slate-500">Encontramos {lista.length} {lista.length === 1 ? "licitação" : "licitações"} para o segmento {segNome}.</p>
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center rounded-[10px] bg-slate-100 p-[3px]">
          {[["relevantes", "Relevantes", nRelev], ["ruido", "Provável ruído", nRuido]].map(([id, label, n]) => (
            <button key={id} onClick={() => setTab(id)} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${tab === id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>{label} <span className="rounded-full bg-slate-200/80 px-1.5 text-xs">{n}</span></button>
          ))}
          <button className="ml-1 flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-slate-700" title="Nova visualização" aria-label="Nova visualização"><Plus className="h-4 w-4" /></button>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"><ListFilter className="h-4 w-4" /> Filtrar</button>
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"><Search className="h-4 w-4" /> Buscar</button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {lista.map((d) => <RecomendadaCard key={d.id} d={d} segNome={segNome} />)}
      </div>
    </div>
  );
}

// --- App --------------------------------------------------------------------

// dados fictícios pré-preenchidos para o teste de usabilidade
const ENTRADA_INICIAL = {
  venda: "Fornecemos tablets educacionais, notebooks, desktops e kits de laboratório de informática para órgãos públicos, com garantia e assistência técnica.",
  naoVenda: "Não fornecemos acessórios avulsos (capas, películas), serviços de treinamento nem manutenção isolada.",
  keywords: ["tablet", "tablet educacional", "notebook", "desktop", "kit tecnológico", "lousa digital"],
  cnpjs: ["11.222.333/0001-81"],
  site: "https://techedu-exemplo.com.br",
  edIrrelTexto: "", edIrrelAnexos: [], edRelTexto: "", edRelAnexos: [], materiais: [], planilhas: [],
};

// teste de usabilidade: sem persistência — cada atualização da página reinicia do zero
const loadLS = (k, fb) => fb;
const saveLS = () => {};

// chat flutuante, aberto por padrão, ancorado no canto inferior direito
function FloatingAssistant(props) {
  const [aberto, setAberto] = useState(true);
  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      {aberto ? (
        <div className="w-[calc(100vw-2rem)] max-w-sm">
          <Assistant {...props} onFechar={() => setAberto(false)} />
        </div>
      ) : (
        <button onClick={() => setAberto(true)} aria-label="Abrir assistente Settle" className="flex items-center gap-2 rounded-full py-2.5 pl-2.5 pr-4 shadow-2xl transition hover:opacity-90" style={{ backgroundColor: "#0A1A2F" }}>
          <span className="flex h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: "rgba(93,202,165,0.15)", color: "#5DCAA5" }}><Sparkles className="h-5 w-5" /></span>
          <span className="text-sm font-semibold text-white">Assistente</span>
        </button>
      )}
    </div>
  );
}

export default function App() {
  const [step, setStep] = useState(() => loadLS("step", "cadastro"));
  const [segmentos, setSegmentos] = useState(() => loadLS("segmentos", clone(SEG_SETS.produto)));
  const [segAtivoId, setSegAtivoId] = useState(() => loadLS("segAtivoId", "p1"));
  const [entrada, setEntrada] = useState(() => loadLS("entrada", ENTRADA_INICIAL));
  const [escopo, setEscopo] = useState(() => loadLS("escopo", null));
  const [escopoHist, setEscopoHist] = useState([]);
  const [escopoValidado, setEscopoValidado] = useState(() => loadLS("escopoValidado", false));

  useEffect(() => { saveLS("step", step); }, [step]);
  useEffect(() => { saveLS("segmentos", segmentos); }, [segmentos]);
  useEffect(() => { saveLS("segAtivoId", segAtivoId); }, [segAtivoId]);
  useEffect(() => { saveLS("entrada", entrada); }, [entrada]);
  useEffect(() => { saveLS("escopo", escopo); }, [escopo]);
  useEffect(() => { saveLS("escopoValidado", escopoValidado); }, [escopoValidado]);

  const mutarEscopo = (novo) => { setEscopoHist((h) => [...h, escopo]); setEscopo(novo); };
  const desfazer = () => setEscopoHist((h) => { if (!h.length) return h; setEscopo(h[h.length - 1]); return h.slice(0, -1); });

  // leva o CNPJ do cadastro pra segunda tela (estado global, sem backend)
  const irParaEntrada = (cnpjCadastro) => {
    setEntrada((d) => ({ ...d, cnpjs: d.cnpjs.length ? d.cnpjs : (cnpjCadastro ? [cnpjCadastro] : []) }));
    setStep("entrada");
  };
  // monta a sugestão de escopo a partir da etapa anterior (uma vez; preserva edições)
  const irParaConfirmar = () => { setEscopo((e) => e || (entradaTemDados(entrada) ? seedEscopo(entrada) : null)); setStep("confirmar"); };
  useEffect(() => { if (step === "confirmar" && escopo === null && entradaTemDados(entrada)) setEscopo(seedEscopo(entrada)); }, [step]);
  const escopoApi = { escopo, mutarEscopo, setValidado: setEscopoValidado, onCorrigir: () => setStep("entrada") };

  const aplicarOrg = (axis, manuais) => {
    if (axis === "manual") {
      const feitos = (manuais || []).filter((m) => m.nome.trim()).map((m, i) => ({ id: "man" + i + "_" + Date.now(), nome: m.nome.trim(), desc: m.desc.trim(), pos: [], neg: [], filtros: [], regras: [], temPrompt: false }));
      const lista = feitos.length ? feitos : clone(SEG_SETS.produto);
      setSegmentos(lista); setSegAtivoId(lista[0]?.id); setStep("segmentos"); return;
    }
    const key = axis === "sugerir" ? "produto" : axis; const novos = clone(SEG_SETS[key]); setSegmentos(novos); setSegAtivoId(novos[0]?.id); setStep("segmentos");
  };
  const openAjustar = (id) => { setSegAtivoId(id); setSegmentos((segs) => segs.map((s) => (s.id === id ? { ...s, configurado: true } : s))); setStep("ajustar"); };
  const updateSeg = (patch) => setSegmentos((segs) => segs.map((s) => (s.id === segAtivoId ? { ...s, ...patch } : s)));
  const segAtivo = segmentos.find((s) => s.id === segAtivoId) || segmentos[0];
  const segIdx = segmentos.findIndex((s) => s.id === segAtivoId);
  const isUltimoSeg = segIdx === segmentos.length - 1;
  const ultimoParaValidar = segmentos.filter((s) => !s.validado && s.id !== segAtivoId).length === 0;
  const proximoSegmento = () => { const next = segmentos[segIdx + 1]; if (next) { setSegAtivoId(next.id); setStep("ajustar"); } else { setStep("licitacoes"); } };
  // conclui a validação do segmento ativo e avança para o próximo pendente (ou volta à visão geral)
  const concluirValidacao = () => {
    const novos = segmentos.map((s) => (s.id === segAtivoId ? { ...s, validado: true, configurado: true } : s));
    setSegmentos(novos);
    const prox = novos.find((s) => !s.validado);
    if (prox) { setSegAtivoId(prox.id); setStep("ajustar"); } else setStep("segmentos");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900" style={{ fontFamily: "'Inter', -apple-system, system-ui, sans-serif" }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" />
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold tracking-tight text-slate-900"><span className="flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold" style={{ backgroundColor: "#5DCAA5", color: "#0A1A2F" }}>S</span>Settle</div>
          <Stepper current={step === "validar" ? "ajustar" : step} onJump={(id) => setStep(id)} />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 pb-28 sm:py-12">
        {step === "cadastro" && <Cadastro onNext={irParaEntrada} />}
        {step === "entrada" && <Entrada data={entrada} setData={setEntrada} onNext={irParaConfirmar} />}
        {step === "confirmar" && <Confirmar escopo={escopo} mutarEscopo={mutarEscopo} desfazer={desfazer} podeDesfazer={escopoHist.length > 0} validado={escopoValidado} setValidado={setEscopoValidado} onAplicar={aplicarOrg} onBack={() => setStep("entrada")} onVoltarPreencher={() => setStep("entrada")} />}
        {step === "segmentos" && <Segmentos segmentos={segmentos} setSegmentos={setSegmentos} onAjustar={openAjustar} onNext={() => { if (segmentos[0]) setSegAtivoId(segmentos[0].id); setStep("licitacoes"); }} onBack={() => setStep("confirmar")} />}
        {step === "ajustar" && <Ajustar seg={segAtivo} onUpdate={updateSeg} onApplyAll={(regra) => setSegmentos((segs) => segs.map((s) => ({ ...s, regras: [...(s.regras || []), regra] })))} onBack={() => setStep("segmentos")} onValidar={() => setStep("validar")} onConcluir={proximoSegmento} ultimo={isUltimoSeg} />}
        {step === "validar" && <Validar seg={segAtivo} onUpdate={updateSeg} onBack={() => setStep("ajustar")} onOk={concluirValidacao} ultimo={ultimoParaValidar} posicao={`Segmento ${segIdx + 1} de ${segmentos.length}`} />}
        {step === "licitacoes" && <Licitacoes segNome={segAtivo?.nome || "segmento"} onBack={() => setStep("segmentos")} onAjustar={() => setStep("ajustar")} />}
      </main>
      <FloatingAssistant step={step} entrada={entrada} setEntrada={setEntrada} escopoApi={escopoApi} />
    </div>
  );
}
