/* ============================================================
   Análise Técnica · multi-tipo, shell único + mecânicas componíveis
   Mecânicas: produto = comparar/escolher SKU (matriz) · serviço/software = atende-não (checklist) · solução = seções
   ============================================================ */
const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
const cap = s => s ? s[0].toUpperCase() + s.slice(1) : s;
const clone = o => JSON.parse(JSON.stringify(o));
const ICO_OK = `<svg class="ico ok" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 8.5l3 3 6-7"/></svg>`;
const ICO_NO = `<svg class="ico no" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>`;
const ICO_OK_C = `<svg class="ico ok" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="8" cy="8" r="6.3"/><path d="M5.3 8.2l1.9 1.9 3.5-4" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const ICO_NO_C = `<svg class="ico no" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="8" cy="8" r="6.3"/><path d="M5.9 5.9l4.2 4.2M10.1 5.9l-4.2 4.2" stroke-width="1.5" stroke-linecap="round"/></svg>`;
const ICO_ARROW = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 11L11 5M6 5h5v5"/></svg>`;
const ICO_CHAT = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M3 4h10v7H8l-3 2v-2H3z"/></svg>`;
const ICO_PLUS = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M8 3v10M3 8h10"/></svg>`;
const ICO_CARET = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4l4 4-4 4"/></svg>`;
const ICO_REDO = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 3v3.5H9.5"/><path d="M12.5 8a5 5 0 1 1-1.3-4.2L13 6.5"/></svg>`;
const ICO_PENCIL = `<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 2.5l2.5 2.5L6 12.5 3 13l.5-3z"/></svg>`;
const ICO_CHEV_L = `<svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 4l-4 4 4 4"/></svg>`;
const ICO_CHEV_R = `<svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4l4 4-4 4"/></svg>`;
const ICO_TRASH = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.5 8h6l.5-8M6.5 7v3.5M9.5 7v3.5"/></svg>`;
const ICO_LINK = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6.7 9.3l2.6-2.6M7 4.6l1-1a2.4 2.4 0 0 1 3.4 3.4l-1 1M9 11.4l-1 1a2.4 2.4 0 0 1-3.4-3.4l1-1"/></svg>`;
const ICO_GLOBE = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="8" cy="8" r="6"/><path d="M2 8h12" stroke-linecap="round"/><path d="M8 2c2.1 2.2 2.1 9.8 0 12M8 2c-2.1 2.2-2.1 9.8 0 12"/></svg>`;
const ICO_CATALOG = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"><path d="M8 3.4C6.9 2.7 5.4 2.4 3.7 2.6a1 1 0 0 0-.9 1v8a1 1 0 0 0 1.1 1c1.5-.2 2.9.1 4.1.8"/><path d="M8 3.4c1.1-.7 2.6-1 4.3-.8a1 1 0 0 1 .9 1v8a1 1 0 0 1-1.1 1c-1.5-.2-2.9.1-4.1.8"/><path d="M8 3.4v10.4" stroke-linecap="round"/></svg>`;
const ICO_COPY = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><rect x="5.2" y="5.2" width="8" height="8.6" rx="1.3"/><path d="M2.8 10.8V3.2a1 1 0 0 1 1-1h6"/></svg>`;
const ICO_KEBAB = `<svg viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="3.2" r="1.35"/><circle cx="8" cy="8" r="1.35"/><circle cx="8" cy="12.8" r="1.35"/></svg>`;
const ICO_WARN = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2.5l6 11H2l6-11z"/><path d="M8 6.5v3.2"/><path d="M8 11.6v.01"/></svg>`;
const ICO_ALERT = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 5v3.4" stroke-linecap="round"/><path d="M8 11v.01" stroke-linecap="round"/></svg>`;
const ICO_LOCK = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3.2" y="7" width="9.6" height="6.4" rx="1.4"/><path d="M5.4 7V5.2a2.6 2.6 0 0 1 5.2 0V7" stroke-linecap="round"/></svg>`;
const ICO_CLOCK = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 4.8v3.4l2 1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const ICO_INFO = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 7.2v3.2" stroke-linecap="round"/><path d="M8 5v.01" stroke-linecap="round"/></svg>`;
// licitação sem arquivo: os scores não foram gerados (Alice 40:33). Aciona via ?pendente=1
const SEM_ARQUIVO = /[?&]pendente=1/.test(location.search);
const PIN_SVG = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><path d="M6 2.5h4l-.8 3.5 2.3 2H4.5l2.3-2L6 2.5z"/><path d="M8 8v5.5"/></svg>`;

/* ---------- matriz (componente "produto") ----------
   comp = { mecanica:"produto", skus:[...], reqs:[...], overrides:[], naoAnalisadas:[], catalogoNaoEdital:[] } */
function matrixOf(comp) {
  if (!comp._m) {
    const s = clone(comp.reqs); (comp.overrides || []).forEach(o => s[o.ri].cells[o.ci] = { st: o.st, v: o.v, c: o.c });
    // "Não extraído" não existe (decisão Alice 04/08): specs que o SKU tem mas o edital não exige NÃO entram na comparação.
    // Elas vão para a seção "Especificações não exigidas pelo edital" (ver collapsiblesHTML).
    (comp.naoAnalisadas || []).forEach(n => {
      if (s.some(spec => spec.req === n.req)) return;
      s.push({ req: n.req, exig: n.valorEdital || "", unidade: n.unidade || "", pendingAnalysis: true, origem: { doc: "Edital (Termo de Referência)", pag: "", trecho: n.trecho || n.valorEdital || "" }, cells: comp.skus.map(() => ({ st: "ne", v: "", c: null })) });
    });
    comp._m = s;
  }
  return comp._m;
}
function scoresFor(specs, skus) {
  return skus.map((sku, i) => {
    let ok = 0, evaluable = 0, ne = 0; const diverg = [];
    specs.forEach(spec => {
      if (spec.exigNa || spec.naoExtraido || spec.diferencial) return;
      const cell = spec.cells[i];
      if (cell.st === "ok") { ok++; evaluable++; }
      else if (cell.st === "no") { evaluable++; diverg.push(spec.req); }
      else if (cell.st === "ne") ne++;
    });
    return { i, sku, ok, evaluable, ne, pct: evaluable + ne ? Math.min(ne ? 99 : 100, Math.round(ok / (evaluable + ne) * 100)) : 0, diverg };
  });
}
/* compara o valor do produto com a exigência do edital → atende (ok) / não atende (no) / não avaliável (ne) */
const numOf = s => { const m = String(s).replace(",", ".").match(/-?\d+(?:\.\d+)?/); return m ? parseFloat(m[0]) : null; };
const alnum = s => String(s).toLowerCase().replace(/[^a-z0-9]/g, "");
function evalCell(v, req) {
  const rv = (req == null ? "" : String(req)).trim(), vv = (v == null ? "" : String(v)).trim();
  if (!rv || !vv || vv === "—") return "ne";
  const op = rv.match(/(≥|>=|≤|<=|>|<|=)\s*(-?[\d.,]+)/);
  if (op) { const r = numOf(op[2]), n = numOf(vv); if (r == null || n == null) return "ne";
    const o = op[1], ok = (o === "=") ? n === r : (o === "≥" || o === ">=") ? n >= r : (o === "≤" || o === "<=") ? n <= r : (o === ">") ? n > r : n < r; return ok ? "ok" : "no"; }
  if (/^sim\b/i.test(rv)) return (/\b(n[aã]o|nao)\b/i.test(vv)) ? "no" : "ok";
  const ar = alnum(rv), av = alnum(vv); if (!ar) return "ne";
  return (av.includes(ar) || ar.includes(av)) ? "ok" : "no";
}
/* unidade de medida FIXA do requisito: só o valor é editável, a unidade é um sufixo que não muda */
const unitSep = u => (u === "°" || u === "%") ? "" : " ";
function splitUnit(value, unidade) {
  if (!unidade || value == null || value === "—") return value == null ? "" : String(value);
  const re = new RegExp("\\s*" + unidade.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*$");
  return String(value).replace(re, "").replace(/\s+$/, "");
}
function joinUnit(core, unidade) {
  core = String(core).trim();
  if (!unidade || core === "" || core === "—") return core || "—";
  return core + unitSep(unidade) + unidade;
}
const unitTag = unidade => unidade ? `<span class="unit-fixed">${esc(unitSep(unidade) + unidade)}</span>` : "";
/* operador da exigência (≥, ≤, >, <, =) também é FIXO, vem do edital: só o número é editável */
const OP_RE = /^\s*(≥|≤|>=|<=|>|<|=)\s*/;
const splitOp = value => { const m = String(value == null ? "" : value).match(OP_RE); return m ? { op: m[1], rest: String(value).slice(m[0].length) } : { op: "", rest: String(value == null ? "" : value) }; };
const opTag = op => op ? `<span class="op-fixed">${esc(op)} </span>` : "";
const rankFor = sc => [...sc].sort((a, b) => b.pct - a.pct || a.ne - b.ne || b.ok - a.ok);
const bestOf = (specs, skus) => rankFor(scoresFor(specs, skus))[0];
const prodSummary = comp => { const best = bestOf(matrixOf(comp), comp.skus); return { best, ok: !!best && best.evaluable > 0 && best.ne === 0 && best.diverg.length === 0 }; };
// análise vazia = veio sem nenhum requisito/especificação real. Não pode marcar "atende".
const emptyComp = comp => comp.mecanica === "produto" ? !matrixOf(comp).some(sp => !sp.exigNa && !sp.diferencial) : (comp.lista || []).length === 0;
const isConcordant = spec => new Set(spec.cells.filter(c => c.st === "ok" || c.st === "no").map(c => c.st)).size <= 1;

/* ---------- checklist (serviço / software) ---------- */
function checklistSummary(cl) {
  const ev = cl.filter(r => ["ok", "no", "parcial", "parceiro"].includes(r.st));
  const ok = cl.filter(r => r.st === "ok" || r.st === "parceiro").length, no = cl.filter(r => r.st === "no").length;
  const ne = cl.filter(r => r.st === "ne").length, all = cl.length;
  // done = análise finalizada (nada mais "não avaliado"). Enquanto não, mostramos o progresso, não a aderência.
  return { ok, total: ev.length, no, ne, all, done: ne === 0, analisadoPct: all ? Math.round(ev.length / all * 100) : 0, status: no === 0 ? "ok" : "no", pct: ev.length ? Math.round(ok / ev.length * 100) : 0 };
}
const CL_ST = { ok: { cls: "ok", label: "Atende", ico: ICO_OK }, no: { cls: "bad", label: "Não atende", ico: ICO_NO }, parcial: { cls: "warn", label: "Atende parcialmente", ico: "" }, parceiro: { cls: "warn", label: "Atende com parceiro", ico: "" }, ne: { cls: "soft", label: "Não avaliado", ico: "" } };
// software (checklist): status por faixa de aderência, <50% vermelho, >80% verde, 50-80% neutro
const TIER = pct => pct < 50 ? "bad" : pct > 80 ? "ok" : "mid";
const confBadge = c => c ? `<span class="badge ${c === "alta" ? "ok" : c === "media" ? "warn" : "bad"}" data-tip="Confiança da IA na extração">${cap(c === "media" ? "média" : c)}</span>` : `<span class="state-na">—</span>`;

/* ---------- resumo por item (adapta ao tipo) ---------- */
function itemSummary(i) {
  const it = ITEMS[i];
  const comps = it.componentes.map(comp => {
    const empty = emptyComp(comp);
    if (comp.mecanica === "produto") { const ps = prodSummary(comp); return { mecanica: "produto", rotulo: comp.rotulo, empty, ok: empty ? false : (comp.nenhumProduto ? false : ps.ok), best: ps.best, comp }; }
    const s = checklistSummary(comp.lista); return { mecanica: "checklist", rotulo: comp.rotulo, empty, ok: empty ? false : (s.status === "ok"), ok_n: s.ok, total: s.total, pct: s.pct, ne: s.ne, done: s.done, analisadoPct: s.analisadoPct, comp };
  });
  return { comps, multi: comps.length > 1, empty: comps.every(c => c.empty), status: comps.every(c => c.ok) ? "ok" : "no" };
}
/* resumo compacto de uma seção (para o cabeçalho do accordion) */
function secSummary(cs) {
  const mono = m => `<span style="font-family:var(--mono)">${esc(m)}</span>`;
  if (cs.mecanica === "produto") {
    if (cs.comp.nenhumProduto) return ""; // texto fica só na tela vazia da tabela, não no header
    // a escolha substitui a recomendação
    const chosenIdx = prefs.chosen[active];
    if (chosenIdx != null && cs.comp.skus[chosenIdx]) {
      const s = cs.comp.skus[chosenIdx];
      return `<span class="ic-reco-inline chosen"><b>✓ Produto escolhido:</b> ${mono(s.model)} · ${esc(s.brand)}</span>`;
    }
    if (!cs.ok) return ""; // não atende: sem produto recomendado
    return `<span class="ic-reco-inline prod"><b>Melhor produto:</b> ${mono(cs.best.sku.model)} · ${esc(cs.best.sku.brand)}</span>`;
  }
  return `Atende ${cs.ok_n} de ${cs.total} exigências`;
}

/* ---------- estado ---------- */
const LS = "settle-at-prefs-v7";
let prefs = (() => { try { return JSON.parse(localStorage.getItem(LS)) || {}; } catch { return {}; } })();
const savePrefs = () => localStorage.setItem(LS, JSON.stringify(prefs));
prefs.chosen = prefs.chosen || {};
let statusFilter = "all"; // só a tab "Todos" por enquanto (status a resolver depois)
let active = null, SPECS = null, STATE, RANKED, ORDER, BEST, activeComp = null, MX_SKUS = [];
let miniTourStart = null; // mini tour: começa a explicar quando o item é aberto (definido em initTour se ?tour=diferencial)
let editingRow = null, pendingCommitRi = null; // edição inline do "Valor requerido" na matriz (com confirmação)
let currentChecklists = [];
/* "Atualizar informações": re-analisa o item e a IA tenta extrair os valores que faltam (linhas "Valor não extraído") */
function updateInfo() {
  if (!SPECS) { toast("Nada para atualizar neste item"); return; }
  let n = 0;
  SPECS.forEach(spec => {
    if (spec.naoExtraido && spec._valorEdital) {
      spec.exig = spec._valorEdital; spec.naoExtraido = false;
      if (spec._trecho) spec.origem = { doc: "Edital (Termo de Referência)", pag: "—", trecho: spec._trecho };
      rematchRow(spec); n++;
    }
  });
  recompute(); renderMatrix();
  toast(n ? `Análise atualizada: ${n} valor(es) extraído(s) do edital automaticamente.` : "Análise atualizada: nenhum dado faltando.");
}
let colW = prefs.colW || {};
let frozen = new Set(prefs.frozen || ["req", "val"]);
const COLW = k => colW[k] || (k === "check" ? 44 : k === "req" ? 300 : k === "val" ? 160 : k === "acoes" ? 84 : 192);
const saveCols = () => { prefs.colW = colW; prefs.frozen = [...frozen]; savePrefs(); };
let renderPending = false;
const scheduleRender = () => { if (!renderPending) { renderPending = true; requestAnimationFrame(() => { renderPending = false; renderMatrix(); }); } };
function recompute() { STATE = scoresFor(SPECS, MX_SKUS); RANKED = rankFor(STATE); ORDER = RANKED.map(s => s.i); BEST = RANKED[0]; window.SCORES = STATE; }

/* valores do item (a partir do preço unitário) */
const fmtBRL = n => "R$ " + Number(n).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
ITEMS.forEach(it => { const q = parseFloat(it.quantidade) || 1; it.valorUnitario = it.precoUnit ? { v: fmtBRL(it.precoUnit) } : { v: "—" }; it.valorTotal = it.precoUnit ? { v: fmtBRL(it.precoUnit * q) } : { v: "—" }; });

/* ============================================================
   Resumo do edital (stats) + grid de cards
   ============================================================ */
function renderStats(ofType) {
  if (SEM_ARQUIVO) {
    $("#stats").innerHTML = `<div class="stat-pendente"><div class="stat-pendente-ico">${ICO_CLOCK}</div><div class="stat-pendente-txt"><b>Análise pendente</b><span>Esta licitação ainda não tem arquivos identificados. Os scores serão gerados automaticamente assim que os arquivos forem carregados.</span></div></div>`;
    return;
  }
  // Resumo executivo GERAL removido (aguardando feedback dos usuários; a regra de atende/não atende por item ficou sem conclusão).
  // Os resumos DENTRO de cada card (produto/software) seguem ativos. #stats fica vazio e colapsa via .stats:empty.
  $("#stats").innerHTML = "";
}
function renderGrid() {
  $("#crumbId").textContent = `Edital ${EDITAL.numero}`;
  const all = ITEMS.map((it, i) => ({ it, i }));
  renderStats(all);
  const html = all.map(({ it, i }) => {
    const sum = itemSummary(i);
    if (!SEM_ARQUIVO && statusFilter !== "all" && sum.status !== statusFilter) return "";
    const chosenIdx = prefs.chosen[i];
    // badge de apoio (fictícia) só para entender o tipo do item durante a validação
    const TIPO_LBL = { produto: "Produto", servico: "Serviço", software: "Software" };
    const SEG_CLS = { produto: "seg-prod", software: "seg-sw", servico: "seg-serv" };
    const tipos = [...new Set(it.componentes.map(c => c.mecanica === "produto" ? "produto" : (/software|vms|licen/i.test(c.rotulo) ? "software" : "servico")))];
    // uma badge por tipo presente (misto = Produto + Software), cada uma com a cor do tipo
    const segBadge = tipos.map(t => `<span class="badge seg ${SEG_CLS[t]}">${esc(TIPO_LBL[t])}</span>`).join("");
    // descrição no formato "Tipo - Texto completo", truncada com reticência. Tipo = categoria do item (Câmera, Switch, Cabo de rede...), não a mecânica.
    const DESC_MAX = 300; // limite de caracteres do texto do card (inclui o prefixo "Tipo - "); acima disso trunca com reticência
    const descText = it.descricao || it.nome; // descrição longa no card; software (sem descricao) usa o resumo curto
    const descFull = `${it.tipo ? it.tipo + " - " : ""}${descText}`;
    const descTrunc = descFull.length > DESC_MAX ? descFull.slice(0, DESC_MAX).replace(/\s+$/, "") + "…" : descFull;
    const descHTML = `<div class="ic-desc"${descFull.length > DESC_MAX ? ` data-tip="${esc(descFull)}"` : ""}>${esc(descTrunc)}</div>`;
    // status do card: produto = Atende/Não atende; item só de software = faixa de aderência (%) por cor.
    // Enquanto a análise não terminou (há requisitos não avaliados), mostra o progresso em vez da aderência.
    const swComp = it.componentes.every(c => c.mecanica === "checklist") ? sum.comps.find(c => c.mecanica === "checklist") : null;
    // Não processado (análise vazia): nunca marca "atende"; mostra estado próprio.
    const statusBadge = sum.empty
      ? `<span class="badge naoproc" data-tip="A extração automática não encontrou nenhuma especificação para este item. Faça a extração manual do edital.">${ICO_ALERT}Não processado</span>`
      : swComp
      ? (swComp.done
        ? `<span class="badge ${TIER(swComp.pct)}">Aderência ${swComp.pct}%</span>`
        : `<span class="badge mid" data-tip="${esc(swComp.analisadoPct + "% dos requisitos já foram analisados. A aderência aparece quando a análise for concluída.")}">Em análise · ${swComp.analisadoPct}%</span>`)
      : (sum.status === "ok" ? `<span class="badge ok">Atende</span>` : sum.comps.some(c => c.best && c.best.ne > 0 && !c.best.diverg.length) ? `<span class="badge warn">Análise pendente</span>` : `<span class="badge bad">Não atende</span>`);
    const qtyTxt = it.quantidade === "1" ? "1 unidade" : `${esc(it.quantidade)} unidades`;
    if (SEM_ARQUIVO) {
      // licitação sem arquivo: score ainda não gerado, sem Atende/Não atende, sem recomendação
      return `<div class="item-card" data-item="${i}">
        <div class="ic-badges">${segBadge}<span class="badge pendente" data-tip="A análise ainda não foi gerada (licitação sem arquivo)">${ICO_CLOCK}Score pendente</span></div>
        ${descHTML}
        <div class="ic-metaline"><span><b>Quantidade:</b> ${qtyTxt}</span><span><b>Valor unitário:</b> <span class="mono">${esc(it.valorUnitario.v)}</span></span><span><b>Valor total:</b> <span class="mono">${esc(it.valorTotal.v)}</span></span></div>
      </div>`;
    }
    // Sem recomendação de produto no card (decisão Brunno, ago/2026): mostramos apenas a ESCOLHA do usuário, quando houver.
    const prod = sum.comps.find(c => c.mecanica === "produto");
    let reco = "", recoCls = "";
    const chosenSku = (prod && chosenIdx != null && prod.comp.skus[chosenIdx]) ? prod.comp.skus[chosenIdx] : null;
    if (chosenSku) {
      reco = `<b>✓ Produto escolhido:</b> <span style="font-family:var(--mono)">${esc(chosenSku.model)}</span> · ${esc(chosenSku.brand)}`;
      recoCls = " chosen";
    }
    return `<div class="item-card ${chosenIdx != null ? "selected" : ""}" data-item="${i}">
      <div class="ic-badges">${segBadge}${statusBadge}${reco ? `<span class="ic-reco-inline${recoCls}">${reco}</span>` : ""}</div>
      ${descHTML}
      <div class="ic-metaline">
        <span><b>Quantidade:</b> ${qtyTxt}</span>
        <span><b>Valor unitário:</b> <span class="mono">${esc(it.valorUnitario.v)}</span></span>
        <span><b>Valor total:</b> <span class="mono">${esc(it.valorTotal.v)}</span></span>
      </div>
    </div>`;
  }).join("");
  $("#cardGrid").innerHTML = html || `<div style="grid-column:1/-1;color:var(--muted-foreground);padding:24px;text-align:center">Nenhum item neste filtro.</div>`;
}

/* ============================================================
   Overlay, despacha por mecânica
   ============================================================ */
function openTable(i) {
  active = i; const it = ITEMS[i]; editingMeta = null;
  $("#toBody").classList.remove("processing-body");
  $("#toSummary").hidden = false;
  currentChecklists = []; SPECS = null; BEST = null; activeComp = null; MX_SKUS = [];
  closeEditDrawer();
  $("#toTitle").textContent = it.titulo || it.nome;
  const toSum = $("#toSummary"); if (toSum) toSum.classList.remove("is-hidden");
  const toBodyEl = $("#toBody"); if (toBodyEl) toBodyEl.scrollTop = 0;
  const sum = itemSummary(i), multi = it.componentes.length > 1;

  // componente produto é processado antes (collapsiblesHTML usa SPECS)
  const prodComp = it.componentes.find(comp => comp.mecanica === "produto");
  if (prodComp) { activeComp = prodComp; MX_SKUS = prodComp.skus; SPECS = matrixOf(prodComp); recompute(); }

  // licitação sem arquivo: score pendente para todos os itens (Alice 40:33)
  if (SEM_ARQUIVO) {
    renderNav(); renderItemSummary(); renderEditControls();
    $("#toBody").innerHTML = `<div class="to-sections">${pendenteHTML()}</div>`;
    $("#tableOverlay").hidden = false;
    sizeMatrixHeight();
    return;
  }
  // reprocessando: quem disparou vê o loading; se OUTRO usuário está reprocessando, mostra o estado anterior (leitura) com aviso e edição bloqueada
  lockedByOther = null;
  if (reprocessing[i]) {
    const r = reprocessing[i];
    if (!r.by || r.by === "Você") {
      renderNav(); renderItemSummary(); renderEditControls();
      $("#tableOverlay").hidden = false;
      showItemReprocessing(r.val);
      return;
    }
    lockedByOther = r.by; // outro usuário: segue para o render normal + banner de trava
  }
  hideReprocessSonner();
  // análise vazia: nenhum requisito/especificação identificado. Não mostra tabela nem "atende".
  if (sum.empty) {
    renderNav(); renderItemSummary(); renderEditControls();
    const imp = $("#toImport"); if (imp) imp.hidden = true;
    $("#toBody").innerHTML = `<div class="to-sections">${analiseVaziaHTML()}</div>`;
    $("#tableOverlay").hidden = false;
    sizeMatrixHeight();
    return;
  }

  let body = `<div id="itemResumo">${itemResumoHTML(it)}</div>` + collapsiblesHTML(it), secs = "";
  it.componentes.forEach((comp, ci) => {
    let hostHTML, editSec;
    if (comp.mecanica === "produto") { hostHTML = `<div class="mech-host" id="matrixHost"></div>`; editSec = "produto"; }
    else { const idx = currentChecklists.length; currentChecklists.push(comp.lista); hostHTML = `<div class="mech-host" id="clHost-${idx}"></div>`; editSec = "cl:" + idx; }
    const cs = sum.comps[ci];
    // Produto: sem botão "Editar" (a célula "Valor requerido" já é editável inline). Software: "Revisar requisitos".
    const isProd = comp.mecanica === "produto";
    // Software: "Revisar requisitos" + "Concluir análise" como botões no header (resumo já mostra aderência e contagens).
    // Produto: "Editar informações" abre o sheet de edição. Software: "Revisar requisitos" + "Concluir análise". Kebab removido (Importar foi p/ o header).
    const editBtn = isProd
      ? `<button class="comp-edit" data-editsec="produto">Editar informações</button>`
      : `<button class="comp-edit" data-notproto>Revisar requisitos</button>`;
    const concluirBtn = isProd ? "" : `<button class="comp-concluir" data-concluir>Concluir análise</button>`;
    // categoria do componente = com qual catálogo o item é comparado; editável via dropdown (UI pronta, decisão Alice 28/07)
    const catBtn = `<button class="comp-cat" data-catdrop data-catmech="${comp.mecanica}" data-tip="Categoria usada para comparar com o catálogo. Clique para trocar.">${esc(comp.rotulo)}${CARET_SM}</button>`;
    // Produto mantém resumo ("Produto recomendado") + badge Atende/Não atende. Software passa a mostrar isso nos tiles do resumo.
    const compSum = isProd ? `<span class="comp-sum">${secSummary(cs)}</span>` : `<span class="comp-spacer"></span>`;
    const compStatus = isProd
      ? `<span class="comp-status badge ${cs.ok ? "ok" : cs.best?.ne && !cs.best.diverg.length ? "warn" : "bad"}">${cs.ok ? "Atende" : cs.best?.ne && !cs.best.diverg.length ? "Análise pendente" : "Não atende"}</span>`
      : "";
    secs += `<details class="comp-acc" open><summary class="comp-head">${catBtn}${compSum}${compStatus}${editBtn}${concluirBtn}${CARET}</summary><div class="comp-acc-body">${hostHTML}</div></details>`;
  });
  body += `<div class="to-sections">${secs}</div>`;
  // Sem banner (não escala): o item abre normal em leitura; o alerta aparece só ao tentar uma ação de edição.
  $("#toBody").innerHTML = body;
  if ($("#matrixHost")) renderMatrix();
  currentChecklists.forEach((c, idx) => renderChecklist($("#clHost-" + idx), c, idx));
  renderNav(); renderItemSummary(); renderEditControls();
  // Importar (header) só aparece em itens com software (checklist); em produto não existe
  const imp = $("#toImport"); if (imp) imp.hidden = !it.componentes.some(c => c.mecanica === "checklist");
  $("#tableOverlay").hidden = false;
  sizeMatrixHeight();
  if (miniTourStart && i === 2) miniTourStart(); // mini tour: começa a explicar ao abrir o item
}
// altura FIXA do card = viewport menos os dois cabeçalhos (item + "Quantidade"), independente da Descrição/Especificações acima.
// Assim o card da tabela sempre ocupa o máximo da tela. (Contorna o quirk de flex no <details>.)
function sizeMatrixHeight() {
  const ov = $("#tableOverlay"); if (!ov || ov.hidden) return;
  const multi = active != null && ITEMS[active] && ITEMS[active].componentes.length > 1;
  const headH = $(".to-head") ? $(".to-head").getBoundingClientRect().height : 64;
  const metaEl = $("#toSummary");
  const metaH = (metaEl && !metaEl.classList.contains("is-hidden")) ? metaEl.getBoundingClientRect().height : 0;
  ov.querySelectorAll(".comp-acc[open]").forEach(card => {
    const tw = card.querySelector(".table-wrap, .dt-wrap"); if (!tw) return;
    if (multi) { tw.style.height = ""; tw.style.maxHeight = "60vh"; }
    else {
      const chEl = card.querySelector(".comp-head");
      const chH = chEl ? chEl.getBoundingClientRect().height : 52;
      // 32 = padding vertical do corpo do card; 32 = 16 (gap acima do card) + 16 (gap abaixo)
      const footerH = card.querySelector(".spec-footer")?.getBoundingClientRect().height || 0;
      const h = window.innerHeight - headH - metaH - chH - footerH - 32 - 32;
      // altura automática (do tamanho do conteúdo) com teto: poucas linhas ficam compactas, muitas rolam
      tw.style.height = "";
      tw.style.maxHeight = Math.max(240, Math.round(h)) + "px";
    }
    // largura: a tabela sempre preenche; o espaço extra vai para as colunas de SKU (req/val mantêm largura base)
    fillCmpWidth(tw);
  });
}

// Se a soma das larguras base for menor que o espaço disponível, distribui o extra igualmente
// entre as colunas de SKU para a tabela preencher (fill). Se maior, mantém base e rola na horizontal.
function fillCmpWidth(tw) {
  const table = tw.querySelector("table.cmp"); if (!table) return;
  const cols = [...table.querySelectorAll("colgroup col")]; if (!cols.length) return;
  const isSku = c => /^sku-/.test(c.dataset.k || "");
  const skuCols = cols.filter(isSku);
  const base = cols.reduce((s, c) => s + (parseFloat(c.dataset.w) || 0), 0);
  const avail = tw.clientWidth;
  if (skuCols.length && avail > base + 1) {
    const extra = Math.floor((avail - base) / skuCols.length);
    cols.forEach(c => { c.style.width = ((parseFloat(c.dataset.w) || 0) + (isSku(c) ? extra : 0)) + "px"; });
    table.style.width = avail + "px";
  } else {
    cols.forEach(c => { c.style.width = (parseFloat(c.dataset.w) || 0) + "px"; });
    table.style.width = base + "px";
  }
}
const closeTable = () => {
  const ov = $("#tableOverlay"); if (!ov || ov.hidden) return;
  ov.classList.add("closing"); // anima a saída (desliza para a direita) antes de esconder
  setTimeout(() => { ov.classList.remove("closing"); ov.hidden = true; active = null; hideReprocessSonner(); renderGrid(); }, 200);
};
/* itens visíveis segundo o filtro ativo (para a navegação Anterior/Próximo) */
function visibleItemsIdx() { return ITEMS.map((_, i) => i).filter(i => statusFilter === "all" || itemSummary(i).status === statusFilter); }
function renderNav() {
  const nav = $("#toNav"); if (!nav) return;
  const list = visibleItemsIdx(), pos = list.indexOf(active);
  if (pos === -1 || list.length <= 1) { nav.innerHTML = ""; return; }
  const hasPrev = pos > 0, hasNext = pos < list.length - 1;
  nav.innerHTML = `<button class="to-navbtn" data-nav="prev"${hasPrev ? "" : " disabled"} data-tip="Item anterior">${ICO_CHEV_L}</button>
    <span class="to-navcount">${pos + 1} de ${list.length}</span>
    <button class="to-navbtn" data-nav="next"${hasNext ? "" : " disabled"} data-tip="Próximo item">${ICO_CHEV_R}</button>`;
}
/* edição inline dos valores do item na própria barra (sem precisar do "Editar informações do item") */
const UNI_OPTS = ["unidade", "licença", "caixa", "lote", "metro", "peça", "conjunto", "serviço"];
const parseBRL = s => { const n = parseFloat(String(s).replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".")); return isNaN(n) ? 0 : n; };
const parseQty = s => { const n = parseFloat(String(s).replace(/\./g, "").replace(",", ".")); return isNaN(n) ? 0 : n; };
let editingMeta = null; // "quantidade" | "unidade" | "preco"
function renderItemSummary() {
  const el = $("#toSummary"); if (!el || active == null) return;
  const it = ITEMS[active];
  const num = v => parseBRL(v).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
  // v1 (card): valores em formato BADGE, somente leitura; hover mostra o icon group (ver origem + copiar), igual à célula
  const badge = (key, label, disp, copy, opts) => {
    opts = opts || {};
    const rs = opts.money ? `<span class="ts-chip-prefix">R$</span>` : "";
    const val = opts.money ? `<span class="ts-chip-num">${disp}</span>` : disp;
    const tip = opts.tip ? ` data-tip="${opts.tip}"` : "";
    return `<span class="ts-chip ts-chip-static" data-metasrc="${key}" data-copyval="${esc(copy)}"${tip}><span class="ts-chip-label">${label}:</span>${rs}${val}</span>`;
  };
  el.innerHTML = `<div class="ts-metas">
      <span class="ts-field">${badge("unidade", "Unidade de medida", esc(it.unidadeMedida || "unidade"), it.unidadeMedida || "unidade")}</span>
      <span class="ts-field">${badge("quantidade", "Quantidade", esc(it.quantidade), it.quantidade)}</span>
      <span class="ts-field">${badge("preco", "Valor unitário", esc(num(it.valorUnitario.v)), "R$ " + num(it.valorUnitario.v), { money: true })}</span>
      <span class="ts-field">${badge("total", "Valor total", esc(num(it.valorTotal.v)), "R$ " + num(it.valorTotal.v), { money: true, tip: "Calculado automaticamente: quantidade × valor unitário" })}</span>
    </div>`;
}
function commitMeta() {
  const inp = $("#metaInput"), key = editingMeta;
  if (!inp || !key || active == null) { editingMeta = null; renderItemSummary(); return; }
  const it = ITEMS[active], raw = inp.value.trim();
  if (key === "quantidade") { if (raw !== "") it.quantidade = raw.replace(/[^\d.,]/g, ""); }
  else if (key === "unidade") { if (raw) it.unidadeMedida = raw; }
  else if (key === "preco") { const n = parseBRL(raw); it.precoUnit = n; it.valorUnitario = { v: fmtBRL(n) }; }
  const q = parseQty(it.quantidade), unit = parseBRL(it.valorUnitario.v);
  it.valorTotal = { v: fmtBRL(unit * q) };
  editingMeta = null; renderItemSummary(); renderGrid();
  toast("Informações do item atualizadas");
}
/* icon-pill flutuante (fixo, tipo tooltip): não ocupa espaço e reposiciona pra cima quando não cabe embaixo */
let pillActions = [], pillHideT = null;
function actionsForChip(chip) {
  if (chip.matches(".val-chip")) {
    const ri = +chip.dataset.vstart;
    return [
      { ico: ICO_PENCIL, title: "Editar o valor requerido", act: () => startInlineEdit(ri) },
      { ico: ICO_ARROW, title: "Ver de onde a IA extraiu no edital (página e trecho)", act: () => openOriginSpec(SPECS[ri], ri) },
      { ico: ICO_COPY, title: "Copiar o valor requerido", act: () => { const t = SPECS[ri].exig; if (navigator.clipboard) navigator.clipboard.writeText(t).catch(() => {}); toast(`Valor copiado: "${t}"`); } },
    ];
  }
  if (chip.matches("[data-metasrc]")) {
    const k = chip.dataset.metasrc, v = chip.dataset.copyval;
    return [
      { ico: ICO_ARROW, title: "Ver a origem deste valor", act: () => openMetaOrigin(k) },
      { ico: ICO_COPY, title: "Copiar o valor", act: () => { if (navigator.clipboard) navigator.clipboard.writeText(v).catch(() => {}); toast(`Valor copiado: "${v}"`); } },
    ];
  }
  return [];
}
/* origem de um valor da meta do item (barra "Quantidade/Valores") */
function openMetaOrigin(key) {
  const label = { unidade: "Unidade de medida", quantidade: "Quantidade", preco: "Valor unitário", total: "Valor total" }[key] || "Valor do item";
  const nota = key === "total" ? "Valor total é calculado: quantidade × valor unitário." : "Extraído do edital (Termo de Referência) e da planilha de itens.";
  $("#drawerHead").textContent = `Origem: ${label}`;
  $("#drawerBody").innerHTML = `<div class="file-preview-empty">${FILE_SVG}<span>${esc(nota)}</span></div>`;
  $("#drawer").hidden = false; $("#tableOverlay").classList.add("sidebar-open");
}
function showActionPill(chip) {
  const pill = $("#actionPill"); if (!pill) return;
  pillActions = actionsForChip(chip);
  pill.innerHTML = pillActions.map((a, i) => `<button class="pill-btn" data-pillidx="${i}">${a.ico}</button>`).join("");
  pill.hidden = false;
  const r = chip.getBoundingClientRect(), pw = pill.offsetWidth, ph = pill.offsetHeight;
  let top = r.bottom + 3; if (top + ph > innerHeight - 6) top = r.top - ph - 3;
  let left = Math.min(r.left, innerWidth - pw - 6);
  pill.style.top = Math.max(6, top) + "px"; pill.style.left = Math.max(6, left) + "px";
}
function hideActionPill() { const pill = $("#actionPill"); if (pill) pill.hidden = true; pillActions = []; }
/* atualiza ao vivo o resumo da seção de produto (accordion) quando o SKU escolhido muda */
function updateProdSecSummary() {
  const details = [...document.querySelectorAll(".comp-acc")].find(d => d.querySelector("#matrixHost"));
  if (!details || !BEST) return;
  const chosenIdx = prefs.chosen[active], mono = m => `<span style="font-family:var(--mono)">${esc(m)}</span>`;
  const nenhum = !!(activeComp && activeComp.nenhumProduto);
  const ok = !nenhum && BEST.evaluable > 0 && BEST.ne === 0 && BEST.diverg.length === 0;
  let html;
  if (nenhum) html = ""; // texto "Nenhum produto se aplica" fica só na tela vazia da tabela, não no header
  else if (chosenIdx != null && MX_SKUS[chosenIdx]) { const s = MX_SKUS[chosenIdx]; html = `<span class="ic-reco-inline chosen"><b>✓ Produto escolhido:</b> ${mono(s.model)} · ${esc(s.brand)}</span>`; }
  else if (!ok) html = ""; // não atende: sem produto recomendado
  else html = `<span class="ic-reco-inline prod"><b>Melhor produto:</b> ${mono(BEST.sku.model)} · ${esc(BEST.sku.brand)}</span>`;
  const sum = details.querySelector(".comp-sum"); if (sum) sum.innerHTML = html;
  const pending = !nenhum && BEST.ne > 0 && !BEST.diverg.length;
  const st = details.querySelector(".comp-status"); if (st) { st.className = "comp-status badge " + (ok ? "ok" : pending ? "warn" : "bad"); st.textContent = ok ? "Atende" : pending ? "Análise pendente" : "Não atende"; }
}

/* ---------- Mecânica: matriz (produto) ---------- */
function buildCols(order) {
  const cols = [{ key: "req" }, { key: "val" }, ...order.map(i => ({ key: "sku-" + i, skuIdx: i }))];
  // coluna "Ações" (ações da linha) é FIXA, sempre presente. Hoje só a lixeira nas linhas de diferencial
  // (excluir o que veio de "não exigidas pelo edital"); no futuro comporta "copiar link da linha" nas demais.
  cols.push({ key: "acoes" });
  let fl = 0;
  cols.forEach(c => { c.w = COLW(c.key); c.frozen = frozen.has(c.key); });
  cols.forEach(c => { if (c.frozen) { c.left = fl; fl += c.w; } });
  const frz = cols.filter(c => c.frozen); if (frz.length) frz[frz.length - 1].edge = true;
  return cols;
}
const fzCls = c => c.frozen ? ` frozen${c.edge ? " frozen-edge" : ""}` : "";
const fzStyle = c => c.frozen ? ` style="left:${c.left}px"` : "";
const colCtrls = c => `<span class="col-resize" data-resize="${c.key}" data-tip="Arraste para redimensionar a largura"></span>`;
function cellTd(cell, ri, ci, exigNa, c, unidade, chosen) {
  const ch = chosen ? " chosen" : ""; // SKU escolhido: coluna inteira em verde
  if (cell.st === "ne") {
    const missingValue = !cell.v || cell.v === "—";
    const label = missingValue ? "Valor não informado" : "Não analisado";
    const tip = missingValue
      ? "O valor exigido foi extraído do edital, mas não temos o valor desta especificação para este SKU. Sem essa informação, não é possível verificar se o produto atende."
      : "Esta especificação consta no edital, mas ainda não foi possível verificar se este produto atende.";
    return `<td class="cell${ch}${fzCls(c)}"${fzStyle(c)}><div class="cell-line" data-tip="${tip}"><span class="ico-nm">${ICO_ALERT}</span><span class="cell-val">${label}</span></div></td>`;
  }
  if (exigNa) return `<td class="cell na-cell${ch}${fzCls(c)}"${fzStyle(c)}><span class="cell-val" data-full="${esc(cell.v)}">${esc(cell.v)}</span></td>`;
  if (cell.st === "diff") return `<td class="cell diff${ch}${fzCls(c)}"${fzStyle(c)}><div class="cell-line"><span class="ico-nm" data-tip="Sem valor requerido informado. Como o edital não exige esta especificação, não há comparação de atende / não atende. Informe um valor requerido para comparar.">${ICO_ALERT}</span><span class="cell-val" data-full="${esc(cell.v)}">${esc(splitUnit(cell.v, unidade))}</span>${unitTag(unidade)}</div></td>`;
  const icoInner = cell.st === "ok" ? ICO_OK_C : cell.st === "no" ? ICO_NO_C : "";
  const conf = (cell.st !== "ne" && cell.c) ? `<div class="conf ${cell.c}"><span class="dot"></span>${cap(cell.c)} confiança</div>` : "";
  const cpy = `<button class="cell-copy" data-copytext="${esc(cell.v)}" data-tip="Copiar">${ICO_COPY}</button>`;
  return `<td class="cell ${cell.st}${ch}${fzCls(c)}"${fzStyle(c)}><div class="cell-line"><span class="cell-ico ${cell.st}">${icoInner}</span><span class="cell-val" data-full="${esc(cell.v)}">${esc(splitUnit(cell.v, unidade))}</span>${unitTag(unidade)}${cpy}</div>${conf}</td>`;
}
/* edição = ação consciente numa BARRA LATERAL, POR SEÇÃO (cada seção tem seu Editar). Tabela é sempre leitura. */
let editSnapshot = null, editSnapshotDiff = null, editTarget = null; // {type:"produto"} | {type:"checklist", sec:N}
function renderEditControls() { const el = $("#toEditCtrls"); if (el) el.innerHTML = ""; } // "Editar informações do item" removido na v1 (card): a meta é editável inline; cada seção tem seu próprio Editar
function editSecLabel() {
  const it = ITEMS[active];
  if (editTarget.type === "produto") return (it.componentes.find(c => c.mecanica === "produto") || {}).rotulo || "";
  return (it.componentes.filter(c => c.mecanica !== "produto")[editTarget.sec] || {}).rotulo || "";
}
function openEditDrawer(target) {
  editTarget = target;
  if (target.type === "produto") { editSnapshot = SPECS ? clone(SPECS) : null; SPECS = clone(SPECS); editSnapshotDiff = new Set(addedDiff[active] || []); }
  else if (target.type === "checklist") editSnapshot = clone(currentChecklists[target.sec]);
  else { const it = ITEMS[active]; editSnapshot = { quantidade: it.quantidade, unidadeMedida: it.unidadeMedida, vu: it.valorUnitario.v, vt: it.valorTotal.v }; }
  renderEditDrawer();
  $("#editOverlay").hidden = false; $("#editDrawer").hidden = false;
}
function closeEditDrawer() { closeSpecMenu(); $("#editToast")?.classList.remove("show"); $("#editDrawer").hidden = true; $("#editOverlay").hidden = true; editSnapshot = null; editSnapshotDiff = null; editTarget = null; }
function captureEditValues() {
  $("#editBody").querySelectorAll(".ed-input[data-eri]").forEach(el => {
    const spec = SPECS[+el.dataset.eri];
    if (spec) setRequiredValue(spec, String(el.value || ""));
  });
}
function cancelEditDrawer() {
  if (editSnapshot && editTarget) {
    // produto: restaura SPECS e o conjunto de diferenciais adicionados (desfaz o que foi adicionado pelo "+" no sheet)
    if (editTarget.type === "produto") { SPECS = editSnapshot; if (editSnapshotDiff) addedDiff[active] = editSnapshotDiff; recompute(); renderMatrix(); }
    else if (editTarget.type === "checklist") { const l = currentChecklists[editTarget.sec]; l.splice(0, l.length, ...editSnapshot); renderChecklist($("#clHost-" + editTarget.sec), l, editTarget.sec); }
    // item: só aplica no Salvar, nada a restaurar
  }
  closeEditDrawer();
}
function renderEditDrawer() {
  const it = ITEMS[active];
  let scopeLine = "", sectionLabel = "Especificações", fields = "", addBtn = "", hint = "Revise as especificações extraídas do edital. Ao salvar, vamos atualizar a análise de compatibilidade dos produtos.";
  if (editTarget.type === "item") {
    sectionLabel = "Informações do item";
    hint = "Revise as informações do item extraídas do edital. Você pode corrigir os valores caso a IA não tenha extraído corretamente.";
    fields = `
      <div class="ed-field"><label>Quantidade</label><input class="ed-input" data-eitem="quantidade" value="${esc(it.quantidade)}"></div>
      <div class="ed-field"><label>Unidade de medida</label><input class="ed-input" data-eitem="unidadeMedida" value="${esc(it.unidadeMedida || "")}"></div>
      <div class="ed-field"><label>Valor unitário</label><input class="ed-input" data-eitem="vu" value="${esc(it.valorUnitario.v)}"></div>
      <div class="ed-field"><label>Valor total</label><input class="ed-input" data-eitem="vt" value="${esc(it.valorTotal.v)}"></div>`;
  } else if (editTarget.type === "produto") {
    scopeLine = `<div class="ed-scope">Seção: <b>${esc(editSecLabel())}</b></div>`;
    fields = SPECS.map((spec, ri) => {
      if (spec.exigNa) return "";
      const nx = !!spec.naoExtraido, full = nx ? "" : esc(spec.exig);
      const isBool = !nx && /^(sim|n[aã]o)\b/i.test((spec.exig || "").trim());
      const control = isBool
        ? `<select class="ed-input" data-eri="${ri}"><option${/^sim/i.test(spec.exig) ? " selected" : ""}>Sim</option><option${/^n[aã]o/i.test(spec.exig) ? " selected" : ""}>Não</option></select>`
        : `<input class="ed-input" data-eri="${ri}" value="${full}">`;
      return `<div class="ed-field"><label>${esc(spec.req)}</label><div class="ed-value-row">${control}${spec.fromDiff ? `<button class="act-ico danger" data-edit-remove="${ri}" aria-label="Remover ${esc(spec.req)}">${ICO_TRASH}</button>` : ""}</div></div>`;
    }).join("");
    // Sem "Adicionar requisito" em produto: o card "Especificações não exigidas pelo edital" (com o +) já cumpre esse papel.
    addBtn = "";
  } else {
    scopeLine = `<div class="ed-scope">Seção: <b>${esc(editSecLabel())}</b></div>`;
    fields = currentChecklists[editTarget.sec].map((r, ri) => `<div class="ed-field">
      <label>${esc(r.req)}</label>
      <input class="ed-input" data-eri="${ri}" value="${esc(r.exig || "")}" placeholder="Valor exigido">
      <div class="ed-sub"><span class="ed-sub-label">Status</span><select class="ed-status" data-eri="${ri}">${CL_OPTS.map(k => `<option value="${k}"${k === r.st ? " selected" : ""}>${CL_ST[k].label}</option>`).join("")}</select></div>
    </div>`).join("");
    addBtn = `<button class="ed-add" id="editAddCl">${ICO_PLUS} Adicionar requisito</button>`;
  }
  // Produto: cards colapsáveis (Descrição completa + não exigidas + não analisadas), como na tela atrás. Item com produto: só a Descrição completa.
  const temProduto = it.componentes.some(c => c.mecanica === "produto");
  const refCards = editTarget.type === "produto"
    ? editRefCards(it)
    : (temProduto ? collapsible("Descrição completa", `<p class="cps-desc">${esc(it.descricao || it.nome)}</p>`, null, true) : "");
  $("#editHeaderAdd").innerHTML = editTarget.type === "produto" ? specFooterHTML(true) : "";
  $("#editBody").innerHTML = `
    <div class="ed-hintbox">${hint}</div>
    ${refCards}
    <div class="ed-section-label">${sectionLabel}</div>
    ${fields}${addBtn}`;
}
function saveEditDrawer() {
  if (editTarget.type === "item") {
    const it = ITEMS[active];
    $("#editBody").querySelectorAll("[data-eitem]").forEach(el => {
      const k = el.dataset.eitem, v = String(el.value || "").trim();
      if (k === "quantidade") it.quantidade = v;
      else if (k === "unidadeMedida") it.unidadeMedida = v;
      else if (k === "vu") it.valorUnitario = { v };
      else if (k === "vt") it.valorTotal = { v };
    });
  } else if (editTarget.type === "produto") {
    $("#editBody").querySelectorAll(".ed-input[data-eri]").forEach(el => {
      const ri = +el.dataset.eri, spec = SPECS[ri]; if (!spec || spec.exigNa) return;
      const val = String(el.value != null ? el.value : "").trim();
      setRequiredValue(spec, val);
    });
    recompute(); renderMatrix(); updateProdSecSummary();
  } else {
    const l = currentChecklists[editTarget.sec];
    $("#editBody").querySelectorAll(".ed-input[data-eri]").forEach(el => { const ri = +el.dataset.eri; const v = String(el.value || "").trim(); if (l[ri]) l[ri].exig = v || l[ri].exig; });
    $("#editBody").querySelectorAll(".ed-status[data-eri]").forEach(el => { const ri = +el.dataset.eri; if (l[ri]) l[ri].st = el.value; });
    renderChecklist($("#clHost-" + editTarget.sec), l, editTarget.sec); refreshClSecSummary(editTarget.sec); refreshItemResumo();
  }
  renderItemSummary(); closeEditDrawer();
  toast("Análise reprocessada com as novas informações");
}
// re-renderiza o resumo executivo do topo (usa dados atuais): usado quando o status de um requisito muda a análise
function refreshItemResumo() { const el = $("#itemResumo"); if (el && active != null) el.innerHTML = itemResumoHTML(ITEMS[active]); }
function refreshClSecSummary(sec) {
  const host = $("#clHost-" + sec); if (!host) return;
  const details = host.closest(".comp-acc"); if (!details) return;
  const s = checklistSummary(currentChecklists[sec]), ok = s.status === "ok";
  const sum = details.querySelector(".comp-sum"); if (sum) sum.innerHTML = `Atende ${s.ok} de ${s.total} exigências`;
  const st = details.querySelector(".comp-status"); if (st) { st.className = "comp-status badge " + (ok ? "ok" : "bad"); st.textContent = ok ? "Atende" : "Não atende"; }
}
function noProdHTML(comp) {
  return `<div class="no-prod">
      <div class="no-prod-ico">${ICO_ALERT}</div>
      <div class="no-prod-title">Nenhum produto se aplica</div>
      <div class="no-prod-sub">Os produtos do seu catálogo não correspondem à categoria <b>"${esc(comp.rotulo)}"</b>. Verifique se a categoria está correta (use o seletor no topo).</div>
    </div>`;
}
// não processado (análise vazia): nenhuma especificação extraída. Não marca "atende". Resolução = extração manual do edital (produto).
function analiseVaziaHTML() {
  return `<div class="no-prod">
      <div class="no-prod-ico">${ICO_ALERT}</div>
      <div class="no-prod-title">Item não processado</div>
      <div class="no-prod-sub">A extração automática <b>não encontrou nenhuma especificação</b> para este item. Enquanto estiver assim, o item <b>não é marcado como "atende"</b>. Faça a <b>extração manual</b>: abra o edital e selecione as especificações para popular a análise.</div>
      <div class="no-prod-actions"><button class="btn primary" data-extrairvazio>Extrair do edital</button></div>
    </div>`;
}
// ação do estado não processado: abre o edital (visualizador), onde a extração manual acontece (selecionar no PDF)
function extractFromEdital() {
  $("#drawerHead").textContent = "Visualizador do arquivo";
  $("#drawerBody").innerHTML = `<div class="file-preview-empty"><span>Visualizador do arquivo</span></div>`;
  $("#drawer").hidden = false; $("#drawer").classList.remove("beside-edit"); $("#tableOverlay").classList.add("sidebar-open");
}
function pendenteHTML() {
  return `<div class="no-prod">
      <div class="no-prod-ico pendente-ico">${ICO_CLOCK}</div>
      <div class="no-prod-title">Score pendente</div>
      <div class="no-prod-sub">Esta licitação ainda não tem os arquivos identificados, então a análise não foi gerada. Os scores serão calculados automaticamente assim que os arquivos forem carregados.</div>
    </div>`;
}
function renderMatrix() {
  const host = $("#matrixHost"); if (!host) return;
  if (activeComp) activeComp._m = SPECS;
  refreshItemResumo();
  updateProdSecSummary();
  if (activeComp && activeComp.nenhumProduto) { host.innerHTML = noProdHTML(activeComp); sizeMatrixHeight(); return; }
  const chosenIdx = prefs.chosen[active];
  // Preço/Estoque: reserva o espaço só quando ALGUM SKU tem a info (para alinhar as alturas). Se NENHUM tiver, colapsa (não reserva).
  const anyEstoque = (MX_SKUS || []).some(s => s && s.estoque != null);
  const anyPreco = (MX_SKUS || []).some(s => s && s.preco != null);
  const cols = buildCols(ORDER), totalW = cols.reduce((s, c) => s + c.w, 0);
  const colgroup = `<colgroup>${cols.map(c => `<col data-k="${c.key}" data-w="${c.w}" style="width:${c.w}px">`).join("")}</colgroup>`;
  let head = "";
  cols.forEach(c => {
    if (c.key === "req") head += `<th class="col-req${fzCls(c)}"${fzStyle(c)}>Especificações do edital${colCtrls(c)}</th>`;
    else if (c.key === "val") head += `<th class="col-val${fzCls(c)}"${fzStyle(c)}>Valor requerido${colCtrls(c)}</th>`;
    else if (c.key === "acoes") head += `<th class="col-acoes">Ações</th>`;
    else {
      const idx = c.skuIdx, sc = STATE[idx], rank = ORDER.indexOf(idx), best = rank === 0, isChosen = chosenIdx === idx, hasChoice = chosenIdx != null;
      const sku = sc.sku;
      // fonte do dado qualifica o estoque: catálogo = seu estoque; internet = fonte externa (com link para a origem)
      const isNet = sku.origem === "internet";
      // estoque = disponibilidade em 3 estados: com estoque / sem estoque / não informado (nem todo cliente passa essa info)
      // estoque em 3 estados; quando não informado, NÃO mostra placeholder (decisão Brunno, ago/2026: some a informação)
      const estoqueBadge = sku.estoque === true
        ? `<span class="sku-tag ok">Com estoque</span>`
        : sku.estoque === false
          ? `<span class="sku-tag warn">Sem estoque</span>`
          : "";
      // fonte = ÍCONE de origem: livro = catálogo do cliente, globo = internet (externo). Azul quando tem link (clicável), cinza quando não.
      const hasLink = isNet || !!sku.datasheet;
      const srcIco = isNet ? ICO_GLOBE : ICO_CATALOG;
      const srcTip = isNet ? "Fonte: Internet (catálogo externo)" : "Fonte: Catálogo";
      const sourceIcon = hasLink
        ? `<button class="sku-srcico haslink" data-${isNet ? "neturl" : "caturl"}="${idx}" data-tip="${srcTip}, clique para abrir">${srcIco}</button>`
        : `<span class="sku-srcico nolink" data-tip="${srcTip}, sem link para abrir (não temos o datasheet deste produto)">${srcIco}</span>`;
      // preço: quando não informado, reserva o espaço se ALGUM SKU tiver preço (alinhar alturas); se nenhum tiver, colapsa
      const precoLine = sku.preco != null ? `<div class="sku-preco">${esc(fmtBRL(sku.preco))}</div>` : (anyPreco ? `<div class="sku-preco">&nbsp;</div>` : "");
      // barra: cinza (0%, track) -> amarelo de 1% a 99% -> verde em 100%
      const fitCls = sc.pct >= 100 ? "full" : "mid";
      // ícone da FONTE à esquerda do nome do produto/marca; estoque abaixo (some quando não informado)
      head += `<th class="col-sku${isChosen ? " chosen" : ""}${fzCls(c)}"${fzStyle(c)}>
        <div class="sku-idrow">${sourceIcon}<div class="sku-id"><div class="sku-model" data-full="${esc(sku.model)}">${esc(sku.model)}</div><div class="sku-brand" data-full="${esc(sku.brand)}">${esc(sku.brand)}</div></div></div>
        <div class="sku-fit"><span class="score-pct">${sc.pct}%</span><span class="score-frac">${sc.ok}/${sc.evaluable + sc.ne}</span></div>
        ${sc.ne ? `<div class="ex-note">${sc.ne} especificações pendentes</div>` : ""}
        <div class="score-bar"><span class="score-fill ${fitCls}" style="width:${sc.pct}%"></span></div>
        ${precoLine}
        ${anyEstoque ? `<div class="sku-src">${estoqueBadge}</div>` : ""}
        <button class="sku-select${isChosen ? " on" : ""}" data-choose="${idx}">${isChosen ? "✓ Selecionado" : "Selecionar"}</button>${colCtrls(c)}</th>`;
    }
  });
  let body = "";
  SPECS.forEach((spec, ri) => {
    if (spec.exigNa) return;
    const nx = !!spec.naoExtraido, df = !!spec.diferencial, fromDiff = !!spec.fromDiff;
    let row = `<tr class="${df ? "diff-row" : nx ? "nx-row" : (isConcordant(spec) ? "concordant" : "")}">`;
    cols.forEach(c => {
      if (c.key === "req") row += `<td class="col-req${fzCls(c)}"${fzStyle(c)}><span class="req-name" data-full="${esc(spec.req)}">${esc(spec.req)}</span></td>`;
      else if (c.key === "val") {
        if (editingRow === ri) {
          const core = esc(splitUnit(splitOp(spec.exig).rest, spec.unidade)), vrOp = opTag(splitOp(spec.exig).op), vrUnit = unitTag(spec.unidade);
          const okTip = fromDiff ? "Confirmar o valor" : "Confirmar e recalcular", cancelTip = fromDiff ? "Cancelar" : "Cancelar edição";
          row += `<td class="col-val${fzCls(c)}"${fzStyle(c)}><div class="val-head"><span class="ts-chip-edit val-chip-edit">${vrOp}<input class="val-inline-input" data-vedit="${ri}" value="${core}">${vrUnit}<button class="ts-ok" data-vconfirm="${ri}" data-tip="${okTip}">${ICO_OK}</button><button class="ts-cancel" data-vcancel="${ri}" data-tip="${cancelTip}">${ICO_NO}</button></span></div></td>`;
        } else if (df && !spec.exig) {
          // diferencial ainda sem valor requerido: editável (o edital não exige; clique para informar, se o edital exigir)
          row += `<td class="col-val${fzCls(c)}"${fzStyle(c)}><div class="val-head"><button class="ts-chip val-chip val-chip-empty" data-vstart="${ri}" data-tip="Clique para informar um valor requerido (não é obrigatório informar, pois o edital não exige essa especificação).">Não informado</button></div></td>`;
        } else {
          const vrCore = esc(splitUnit(splitOp(spec.exig).rest, spec.unidade)), vrOp = opTag(splitOp(spec.exig).op), vrUnit = unitTag(spec.unidade);
          const chip = `<button class="ts-chip val-chip" data-vstart="${ri}">${vrOp}<span class="val-plain">${vrCore}</span>${vrUnit}</button>`;
          row += `<td class="col-val${fzCls(c)}"${fzStyle(c)}><div class="val-head">${chip}</div></td>`;
        }
      }
      else if (c.key === "acoes") row += `<td class="col-acoes">${fromDiff ? `<div class="acoes-cell"><button class="act-ico danger" data-rmdiff="${esc(spec.req)}" data-tip="Remover da comparação">${ICO_TRASH}</button></div>` : ""}</td>`;
      else if (nx) row += `<td class="cell nm-cell${c.skuIdx === chosenIdx ? " chosen" : ""}${fzCls(c)}"${fzStyle(c)}><div class="cell-line"><span class="ico-nm">${ICO_ALERT}</span><span class="cell-val">${esc(splitUnit(spec.cells[c.skuIdx].v, spec.unidade))}</span>${unitTag(spec.unidade)}</div></td>`;
      else row += cellTd(spec.cells[c.skuIdx], ri, c.skuIdx, spec.exigNa, c, spec.unidade, c.skuIdx === chosenIdx);
    });
    body += row + `</tr>`;
  });
  host.innerHTML = `<div class="table-wrap"><table class="cmp" style="width:${totalW}px">${colgroup}<thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>${specFooterHTML()}`;
  if (editingRow != null) { const inp = host.querySelector(".val-inline-input"); if (inp) { inp.focus(); inp.select(); } }
  sizeMatrixHeight();
}
/* edição inline do "Valor requerido" (matriz): editar direto na célula com confirmação (check) antes de recalcular */
function setRequiredValue(spec, value) {
  spec.exig = value.trim();
  if (spec.exig) spec.naoExtraido = false;
  if (spec.fromDiff) {
    spec.diferencial = !spec.exig;
    if (spec.diferencial) { spec.cells.forEach(cell => { cell.st = "diff"; }); return; }
  }
  rematchRow(spec);
}
function startInlineEdit(ri) { editingRow = ri; renderMatrix(); }
function cancelInlineEdit() { editingRow = null; renderMatrix(); }
function commitInline(ri) {
  const inp = $("#matrixHost .val-inline-input"), spec = SPECS[ri];
  let converted = false;
  if (inp && spec) {
    const raw = String(inp.value || "").trim();
    const op = splitOp(spec.exig).op;
    converted = !!spec.diferencial && !!raw;
    setRequiredValue(spec, raw ? (op ? op + " " : "") + joinUnit(raw, spec.unidade) : "");
  }
  editingRow = null; recompute(); renderMatrix(); updateProdSecSummary();
  toast(converted ? "Valor requerido definido, agora este requisito conta no atende" : "Valor requerido atualizado, análise recalculada");
}
function tryCommitInline(ri) {
  const spec = SPECS[ri];
  // Item recém-adicionado pela badge (diferencial): informar o valor não é "editar" um dado extraído do edital, então não mostra o aviso "Confirmar edição?".
  if (spec && spec.fromDiff) { commitInline(ri); return; }
  if (!prefs.warnedInline) { pendingCommitRi = ri; $("#warnOverlay").hidden = false; $("#warnModal").hidden = false; return; }
  commitInline(ri);
}

/* ---------- Seções colapsáveis (topo do overlay) ---------- */
const CARET = `<svg class="caret-svg" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10l4-4 4 4"/></svg>`;
const CARET_SM = `<svg class="caret-sm" viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6l4 4 4-4"/></svg>`;
function collapsible(title, inner, count, open) {
  return `<details class="cps"${open ? " open" : ""}><summary><span class="cps-title">${title}</span>${count != null ? `<span class="cps-cnt">${count}</span>` : ""}${CARET}</summary><div class="cps-body">${inner}</div></details>`;
}
function tagList(items, note) {
  return `${note ? `<div class="ex-note">${note}</div>` : ""}<div class="tag-list">${items.map(t => `<span class="tag-item">${esc(t)}</span>`).join("")}</div>`;
}
const addedNA = {}; // por item: specs "no edital não analisados" que o usuário adicionou à comparação
const addedDiff = {}; // por item: specs "não exigidas" que o usuário trouxe como diferencial (opção B)
/* Resumo executivo DENTRO do card: produto (3 tiles, por requisito do produto recomendado) e software (7 tiles, por requisito do checklist). */
const RES_I = {
  target: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="6"/><circle cx="8" cy="8" r="3"/><circle cx="8" cy="8" r="0.6" fill="currentColor"/></svg>`,
  layers: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M8 2l6 3-6 3-6-3 6-3z"/><path d="M2 8l6 3 6-3"/></svg>`,
  check: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 8.5l3 3 6-7"/></svg>`,
  cross: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>`,
  help: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="6"/><path d="M6.5 6.4a1.6 1.6 0 1 1 2.2 1.5c-.5.2-.7.5-.7 1v.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 11.6v.01" stroke-linecap="round"/></svg>`,
};
function resTile(cls, svg, n, label, tip) {
  // Sem ícone ⓘ: o tooltip aparece ao passar o mouse no card inteiro (data-tip no tile).
  return `<div class="stat res-tile"${tip ? ` data-tip="${esc(tip)}"` : ""}><div class="stat-top"><div class="stat-ico ${cls}">${svg}</div><div class="stat-n">${n}</div></div><div class="stat-label">${esc(label)}</div></div>`;
}
function resProdTiles(prod, caption) {
  // Resumo de produto por SKU: quantos SKUs foram comparados, quantos atendem 100% e quantos não.
  const specs = matrixOf(prod), scores = scoresFor(specs, prod.skus);
  const analisados = scores.length;
  const atende = scores.filter(s => s.evaluable > 0 && s.ne === 0 && s.pct === 100).length;
  const nao = scores.filter(s => s.diverg.length > 0).length;
  const pendentes = scores.filter(s => s.ne > 0 && !s.diverg.length).length;
  return `<div class="resumo-block">${caption ? `<div class="resumo-cap">${esc(caption)}</div>` : ""}<div class="item-resumo">
    ${resTile("", RES_I.layers, analisados, "SKUs analisados", "Produtos (SKUs) do seu catálogo comparados com as exigências deste item.")}
    ${resTile("ok", RES_I.check, atende, "Atende", "SKUs que cumprem 100% das especificações exigidas pelo edital.")}
    ${resTile("bad", RES_I.cross, nao, "Não atende", "SKUs que não cumprem todas as especificações exigidas.")}
    ${pendentes ? resTile("warn", RES_I.help, pendentes, "Análise pendente", "SKUs sem divergências identificadas, mas com especificações que ainda precisam ser analisadas.") : ""}
  </div></div>`;
}
function resChkTiles(chk, caption) {
  const cl = chk.lista, c = { ok: 0, parcial: 0, parceiro: 0, no: 0, ne: 0 };
  cl.forEach(r => { c[r.st] = (c[r.st] || 0) + 1; });
  const evaluable = c.ok + c.parcial + c.parceiro + c.no;
  const pct = evaluable ? Math.round((c.ok + c.parceiro) / evaluable * 100) : 0;
  return `<div class="resumo-block">${caption ? `<div class="resumo-cap">${esc(caption)}</div>` : ""}<div class="item-resumo sw">
    ${resTile("brand", RES_I.target, pct + "%", "Percentual de aderência", "Percentual de requisitos atendidos (inclui os atendidos com parceiro).")}
    ${resTile("", RES_I.layers, cl.length, "Total de requisitos", "Quantidade total de requisitos deste software.")}
    ${resTile("ok", RES_I.check, c.ok, "Atende", "Requisitos que a sua solução atende integralmente.")}
    ${resTile("warn", RES_I.check, c.parcial, "Atende parcialmente", "Requisitos atendidos apenas em parte.")}
    ${resTile("warn", RES_I.check, c.parceiro, "Atende com parceiro", "Requisitos que você atende com apoio de um parceiro.")}
    ${resTile("bad", RES_I.cross, c.no, "Não atende", "Requisitos que a sua solução não atende.")}
    ${resTile("", RES_I.help, c.ne, "Falta analisar", "Requisitos que ainda não foram analisados.")}
  </div></div>`;
}
// Item misto (produto + software): mostra os dois resumos empilhados, cada um com legenda da seção.
function itemResumoHTML(it) {
  const prods = it.componentes.filter(c => c.mecanica === "produto");
  const chks = it.componentes.filter(c => c.mecanica === "checklist");
  const misto = prods.length && chks.length;
  let html = "";
  prods.forEach(p => { html += resProdTiles(p, misto ? p.rotulo : ""); });
  chks.forEach(c => { html += resChkTiles(c, misto ? c.rotulo : ""); });
  return html;
}
/* "Descrição completa" (card v1): começa aberta; ao passar o mouse mostra um icon group (igual à célula);
   ao colapsar, o texto vira um preview truncado com reticência (quantidade máx. de caracteres a definir). */
function descBlockHTML(it) {
  const actions = `<span class="desc-hover-actions"><button class="desc-ico" data-descextrair data-tip="Copiar a descrição">${ICO_COPY}</button><button class="desc-ico" data-descedital data-tip="Ver no edital">${ICO_ARROW}</button></span>`;
  const full = it.descricao || `${it.nome} ${it.resumoTR}`;
  return `<div class="desc-block open" data-descblock>
      <div class="desc-head" data-desctoggle>
        <span class="cps-title">Descrição completa</span>${actions}<span class="desc-caret">${CARET}</span>
      </div>
      <div class="desc-body">
        <p class="cps-desc desc-full">${esc(full)}</p>
      </div>
    </div>`;
}
function collapsiblesHTML(it) {
  // "Descrição completa" só quando o item tem Produto (software não tem descrição, decisão Alice 28/07)
  const temProduto = it.componentes.some(c => c.mecanica === "produto");
  let html = temProduto ? descBlockHTML(it) : "";
  const prodComps = it.componentes.filter(c => c.mecanica === "produto");
  return `<div class="to-collapsibles">${html}</div>`;
}
function specFooterHTML(header = false) {
  const available = (activeComp?.catalogoNaoEdital || []).filter(d => d.vals && !SPECS.some(s => s.req === d.req));
  const button = `<button class="comp-edit" data-addspec aria-haspopup="menu" aria-expanded="false" aria-controls="specMenu" ${available.length ? "" : 'disabled title="Todas as especificações adicionadas"'}>Adicionar especificação</button>`;
  return header ? button : `<footer class="spec-footer">${button}</footer>`;
}
let specMenuAnchor = null;
function closeSpecMenu(restoreFocus = false) {
  $("#specMenu").hidden = true;
  if (specMenuAnchor) {
    specMenuAnchor.setAttribute("aria-expanded", "false");
    if (restoreFocus) specMenuAnchor.focus();
  }
  specMenuAnchor = null;
}
function openSpecMenu(anchor) {
  if (!$("#specMenu").hidden) { closeSpecMenu(true); return; }
  const menu = $("#specMenu");
  const available = (activeComp?.catalogoNaoEdital || []).filter(d => d.vals && !SPECS.some(s => s.req === d.req));
  menu.innerHTML = available.map(d => `<button class="km-item" role="menuitem" data-specval="${esc(d.req)}">${esc(d.req)}</button>`).join("");
  specMenuAnchor = anchor;
  anchor.setAttribute("aria-expanded", "true");
  menu.hidden = false;
  const r = anchor.getBoundingClientRect();
  const top = r.bottom + 6 + menu.offsetHeight > innerHeight - 8 ? r.top - menu.offsetHeight - 6 : r.bottom + 6;
  menu.style.top = Math.max(8, top) + "px";
  menu.style.left = Math.max(8, Math.min(r.left, innerWidth - menu.offsetWidth - 8)) + "px";
  menu.querySelector("button")?.focus({ preventScroll: true });
}
/* Cards de referência (colapsáveis) DENTRO do sheet de editar: mesma cara dos da tela atrás, porém read-only. */
function editRefCards(it) {
  return descBlockHTML(it);
}
/* "+" numa spec "no edital não analisados": adiciona ao fim da comparação e some da seção */
function addNaoAnalisado(reqName) {
  if (active == null || !SPECS) return;
  const prodComp = ITEMS[active].componentes.find(c => c.mecanica === "produto");
  const n = prodComp && (prodComp.naoAnalisadas || []).find(x => x.req === reqName);
  if (!n) return;
  const exig = n.valorEdital || "";
  SPECS.push({ req: n.req, exig, unidade: n.unidade || "", modulo: "—", origem: { doc: "Edital (Termo de Referência)", pag: "—", trecho: n.trecho || exig }, cells: MX_SKUS.map((_, i) => { const v = (n.vals && n.vals[i]) || "—"; return { st: evalCell(v, exig), v, c: "alta" }; }) });
  (addedNA[active] || (addedNA[active] = new Set())).add(reqName);
  recompute(); renderMatrix();
  const host = document.querySelector("#toBody .to-collapsibles");
  if (host) host.outerHTML = collapsiblesHTML(ITEMS[active]);
  toast(`"${reqName}" adicionado à comparação`);
}
/* "+" numa spec "não exigida pelo edital": entra na tabela como linha de diferencial (opção B).
   Compara os SKUs entre si, sem atende/não atende, e NÃO conta no match. */
function addDiferencial(reqName, fromSheet) {
  if (active == null || !SPECS) return;
  const prodComp = ITEMS[active].componentes.find(c => c.mecanica === "produto");
  const d = prodComp && (prodComp.catalogoNaoEdital || []).map(t => typeof t === "string" ? { req: t } : t).find(x => x.req === reqName);
  if (!d || !d.vals || SPECS.some(s => s.req === reqName)) return;
  SPECS.push({ req: d.req, exig: "", diferencial: true, fromDiff: true, unidade: d.unidade || "", modulo: "Diferencial", origem: { doc: "Catálogo do produto", pag: "—", trecho: "Especificação do produto, não exigida pelo edital." }, cells: MX_SKUS.map((_, i) => ({ st: "diff", v: (d.vals && d.vals[i]) || "—", c: null })) });
  (addedDiff[active] || (addedDiff[active] = new Set())).add(reqName);
  recompute();
  // Chamado de dentro do sheet de editar: NÃO toca na tabela; o efeito só vai para a tabela ao Salvar (Cancelar reverte).
  // Sonner deixa claro que ficou em rascunho (a badge some da lista, mas nada aparece na tabela até salvar).
  if (fromSheet) { toast(`"${reqName}" adicionada. Salve para aplicar na tabela.`); return; }
  editingRow = SPECS.length - 1; // abre o campo para o usuário informar o valor requerido (ou deixar como não exigido)
  renderMatrix();
  const host = document.querySelector("#toBody .to-collapsibles");
  if (host) host.outerHTML = collapsiblesHTML(ITEMS[active]);
  const inp = document.querySelector("#matrixHost .val-inline-input"); if (inp) inp.scrollIntoView({ block: "center" });
  toast(`"${reqName}" adicionada à tabela. Informe o valor requerido, ou deixe como não exigido.`);
}
/* remover uma linha vinda da seção "não exigidas": some da comparação e volta para a seção */
function confirmRemoveSpec(reqName, fromSheet, trigger) {
  if (!SPECS.some(s => s.fromDiff && s.req === reqName)) return;
  const item = active;
  const overlay = document.createElement("div");
  overlay.className = "warn-overlay";
  const modal = document.createElement("div");
  modal.className = "warn-modal";
  modal.setAttribute("role", "alertdialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-labelledby", "removeSpecTitle");
  modal.setAttribute("aria-describedby", "removeSpecText");
  modal.innerHTML = `<h3 id="removeSpecTitle">Excluir requisito</h3><p id="removeSpecText">Você tem certeza de que deseja excluir o requisito?</p><div class="warn-actions"><button class="btn" data-cancel>Cancelar</button><button class="btn danger" data-confirm>Excluir</button></div>`;
  const close = () => {
    document.removeEventListener("keydown", onKey, true);
    overlay.remove(); modal.remove();
    if (trigger?.isConnected) trigger.focus();
  };
  const onKey = e => {
    if (e.key === "Escape") { e.preventDefault(); e.stopImmediatePropagation(); close(); }
    if (e.key === "Tab") {
      e.preventDefault();
      const buttons = [...modal.querySelectorAll("button")];
      buttons[document.activeElement === buttons[0] ? 1 : 0].focus();
    }
  };
  overlay.onclick = close;
  modal.querySelector("[data-cancel]").onclick = close;
  modal.querySelector("[data-confirm]").onclick = () => {
    close();
    if (active !== item) return;
    if (lockedByOther) { showLockAlert(lockedByOther); return; }
    if (fromSheet) {
      if (editTarget?.type !== "produto") return;
      captureEditValues();
      const ri = SPECS.findIndex(s => s.fromDiff && s.req === reqName);
      if (ri < 0) return;
      SPECS.splice(ri, 1);
      addedDiff[active]?.delete(reqName);
      renderEditDrawer();
      $("#editHeaderAdd button")?.focus();
      toast(`"${reqName}" removida. Salve para aplicar na tabela.`);
    } else {
      removeDiferencial(reqName);
      $("#matrixHost [data-addspec]")?.focus();
    }
  };
  document.body.append(overlay, modal);
  document.addEventListener("keydown", onKey, true);
  modal.querySelector("[data-cancel]").focus();
}
function removeDiferencial(reqName) {
  if (active == null || !SPECS) return;
  const i = SPECS.findIndex(s => s.fromDiff && s.req === reqName);
  if (i >= 0) SPECS.splice(i, 1);
  const set = addedDiff[active]; if (set) set.delete(reqName);
  recompute(); renderMatrix();
  const host = document.querySelector("#toBody .to-collapsibles");
  if (host) host.outerHTML = collapsiblesHTML(ITEMS[active]);
  toast(`"${reqName}" removido da comparação`);
}

/* ---------- Mecânica: checklist (serviço / software) ---------- */
const clView = {}; // visão por seção: "requisito" (tabela) | "bloco" (agrupado por módulo)
function renderChecklist(host, clArr, sec) {
  if (!host) return;
  const view = clView[sec] || "requisito";
  const seg = `<div class="clview-seg" role="tablist">
      <button class="clview-tab${view === "requisito" ? " on" : ""}" data-clview="${sec}:requisito">Visão em requisito</button>
      <button class="clview-tab${view === "bloco" ? " on" : ""}" data-clview="${sec}:bloco">Visão em bloco</button>
    </div>`;
  if (view === "bloco") { host.innerHTML = seg + renderChecklistBlocks(clArr, sec); sizeMatrixHeight(); return; }
  const rows = clArr.map((r, ri) => {
    const st = CL_ST[r.st] || CL_ST.ne;
    const nota = r.notas
      ? `<span class="cl-nota">${esc(r.notas)}</span>`
      : `<button class="cell-add" data-clnote="${sec}:${ri}">+ Nota</button>`;
    return `<tr>
      <td class="col-req"><div class="req-head"><span class="req-name">${esc(r.req)}</span><button class="req-ico" data-clorigin="${sec}:${ri}" data-tip="Ver de onde a IA extraiu no edital (página e trecho)">${ICO_ARROW}</button></div></td>
      <td class="col-meta"><button class="badge ${st.cls} clickable-badge" data-clstatus="${sec}:${ri}" data-tip="Clique para escolher o status">${st.ico}${st.label}<span class="cl-caret">▾</span></button></td>
      <td class="col-meta">${confBadge(r.c)}</td>
      <td class="col-meta c-just">${esc(r.just || "—")}</td>
      <td class="col-meta"><span class="badge soft">${esc(r.modulo || "—")}</span></td>
      <td class="col-meta"><span class="badge soft with-avatar">Selecionar</span></td>
      <td class="col-meta col-notas">${nota}</td>
      <td class="col-addcol"></td>
    </tr>`;
  }).join("");
  const addColTh = `<th class="col-addcol"><button class="addcol-btn" data-addcol data-tip="Adicionar uma coluna à tabela">${ICO_PLUS}</button></th>`;
  host.innerHTML = seg + `<div class="dt-wrap"><table class="dt"><thead><tr><th class="col-req">Requisito</th><th class="col-meta">Status</th><th class="col-meta">Confiança IA</th><th class="col-meta c-just">Justificativa IA</th><th class="col-meta">Módulo</th><th class="col-meta">Responsável</th><th class="col-meta">Notas</th>${addColTh}</tr></thead><tbody>${rows}</tbody></table></div>`;
  sizeMatrixHeight();
}
/* Visão em bloco: tabela agregada por módulo (contagem por status), espelha produção */
function renderChecklistBlocks(clArr, sec) {
  const groups = {};
  clArr.forEach((r, ri) => { const m = r.modulo || "Outros"; (groups[m] || (groups[m] = [])).push(r); });
  const pct = (n, t) => t ? Math.round(n / t * 100) : 0;
  const cell = (n, t) => `${n} <span class="blk-pct">(${pct(n, t)}%)</span>`;
  const rows = Object.entries(groups).map(([mod, items]) => {
    const t = items.length, cnt = st => items.filter(r => r.st === st).length;
    return `<tr>
      <td class="col-req"><span class="req-name">${esc(mod)}</span></td>
      <td class="col-meta"><span class="badge soft with-avatar">Selecionar</span></td>
      <td class="col-meta blk-num">${t}</td>
      <td class="col-meta blk-num">${cell(cnt("ok"), t)}</td>
      <td class="col-meta blk-num">${cell(cnt("parcial"), t)}</td>
      <td class="col-meta blk-num">${cell(cnt("parceiro"), t)}</td>
      <td class="col-meta blk-num">${cell(cnt("no"), t)}</td>
      <td class="col-meta blk-num">${cell(cnt("ne"), t)}</td>
      <td class="col-meta"><div class="acoes-cell"><button class="act-ico danger" data-blockact="excluir" data-tip="Excluir módulo">${ICO_TRASH}</button><button class="act-ico" data-blockact="ir" data-tip="Ir para o módulo">${ICO_LINK}</button></div></td>
    </tr>`;
  }).join("");
  return `<div class="dt-wrap"><table class="dt"><thead><tr><th class="col-req">Módulo</th><th class="col-meta">Responsável</th><th class="col-meta">Total de Requisitos</th><th class="col-meta">Atende</th><th class="col-meta">Atende parcialmente</th><th class="col-meta">Atende com parceiro</th><th class="col-meta">Não atende</th><th class="col-meta">Sem estado</th><th class="col-meta">Ações</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

/* ============================================================
   Origem (genérico)
   ============================================================ */
let extractRi = null, pendingExtract = null;
const FILE_SVG = `<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 2h6l3 3v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"/><path d="M10 2v3h3"/></svg>`;
function openOriginSpec(spec, ri) {
  extractRi = null; pendingExtract = null;
  $("#drawerHead").textContent = "Visualizador do arquivo";
  $("#drawerBody").innerHTML = `<div class="file-preview-empty"><span>Visualizador do arquivo</span></div>`;
  $("#drawer").hidden = false; $("#tableOverlay").classList.add("sidebar-open");
}
const closeOrigin = () => { $("#drawer").hidden = true; $("#drawer").classList.remove("beside-edit"); $("#tableOverlay").classList.remove("sidebar-open"); extractRi = null; pendingExtract = null; };
/* Descrição (card v1): "Ver no edital" abre o drawer na origem; "Extrair novamente" re-roda a extração da descrição */
function openDescOrigin() {
  extractRi = null; pendingExtract = null;
  $("#drawerHead").textContent = "Visualizador do arquivo";
  $("#drawerBody").innerHTML = `<div class="file-preview-empty"><span>Visualizador do arquivo</span></div>`;
  $("#drawer").hidden = false; $("#tableOverlay").classList.add("sidebar-open");
  // aberto de dentro do sheet de editar: o drawer de origem fica AO LADO do sheet (à esquerda), não atrás
  $("#drawer").classList.toggle("beside-edit", !$("#editDrawer").hidden);
}
function extractDescricao() {
  const block = document.querySelector("#toBody .desc-block");
  const body = block && block.querySelector(".desc-body"); if (!body) return;
  block.classList.add("open");
  const orig = body.innerHTML;
  body.innerHTML = `<div class="sk-box" style="margin:0 0 8px"><div class="sk-line" style="width:82%"></div></div><div class="sk-box" style="margin:0"><div class="sk-line" style="width:58%"></div></div>`;
  toast("Relendo o edital e reextraindo a descrição…");
  setTimeout(() => { body.innerHTML = orig; toast("Descrição atualizada a partir do edital"); }, 1600);
}

let toastT;
function toast(msg) {
  const drawer = $("#editDrawer");
  let t = $("#toast");
  t.classList.remove("show");
  $("#editToast")?.classList.remove("show");
  if (drawer && !drawer.hidden) {
    t = $("#editToast");
    if (!t) {
      t = document.createElement("div");
      t.id = "editToast";
      t.className = "toast edit-toast";
      t.setAttribute("role", "status");
      drawer.appendChild(t);
    }
    t.style.bottom = (drawer.querySelector(".ed-foot").offsetHeight + 12) + "px";
  }
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove("show"), 2400);
}
// sonner padrão para qualquer ação ainda não prototipada
function notPrototyped() { toast("Essa ação ainda não está prototipada."); }
// alerta ao tentar editar um item que outra pessoa está reprocessando (soft lock)
function showLockAlert(by) {
  let ov = document.getElementById("lockOverlay");
  if (!ov) {
    ov = document.createElement("div"); ov.id = "lockOverlay"; ov.className = "warn-overlay"; ov.hidden = true;
    const m = document.createElement("div"); m.className = "warn-modal"; m.id = "lockModal"; m.hidden = true;
    m.innerHTML = `<h3>Item em reprocessamento</h3><p id="lockModalBody"></p><div class="warn-actions"><button class="btn primary" id="lockOk">Entendi</button></div>`;
    document.body.appendChild(ov); document.body.appendChild(m);
    ov.onclick = hideLockAlert; m.querySelector("#lockOk").onclick = hideLockAlert;
  }
  document.getElementById("lockModalBody").innerHTML = `<b>${esc(by)}</b> está reprocessando os requisitos deste item. Você poderá editar quando a análise terminar.`;
  ov.hidden = false; document.getElementById("lockModal").hidden = false;
}
function hideLockAlert() { const ov = document.getElementById("lockOverlay"), m = document.getElementById("lockModal"); if (ov) ov.hidden = true; if (m) m.hidden = true; }

/* ============================================================
   Edição inline + interações
   ============================================================ */
const rematchRow = spec => { if (spec.exigNa || spec.pendingAnalysis) return; spec.cells.forEach(cc => cc.st = evalCell(cc.v, spec.exig)); };
function commitEdit(el) {
  const ri = +el.dataset.ri, kind = el.dataset.edit, txt = el.textContent.trim(), spec = SPECS[ri];
  // edição só acontece no modo de edição; guarda o valor e reprocessa só no Salvar (sem auto-recálculo)
  if (kind === "vr") {
    if (spec.exigNa) return;
    const wasMissing = spec.naoExtraido;
    if (!txt || txt === "Valor não extraído") { if (!wasMissing) spec.exig = ""; return; }
    const op = wasMissing ? "" : splitOp(spec.exig).op; // operador fixo, preservado do edital
    spec.exig = op ? op + " " + joinUnit(txt, spec.unidade) : joinUnit(txt, spec.unidade);
    if (wasMissing) spec.naoExtraido = false;
  }
}
/* ---------- Adicionar requisito do edital (a partir do catálogo) ---------- */
let addSpec = null, addTrecho = null;
function openAddModal() {
  addSpec = null; addTrecho = null;
  $("#amSearch").value = ""; renderCatalog("");
  $("#amStep2").hidden = true; $("#amStep3").hidden = true; $("#amSel").hidden = true; $("#amAdd").disabled = true;
  $("#amDoc").textContent = EDITAL.docTexto;
  $("#amDocHint").textContent = "Selecione no edital o trecho que comprova a exigência.";
  $("#addModal").hidden = false;
}
function catalogAvailable() { const existing = new Set(SPECS.map(s => s.req.toLowerCase())); return CATALOGO_SPECS.filter(s => !existing.has(s.nome.toLowerCase())); }
function renderCatalog(term) {
  const t = term.trim().toLowerCase(), list = catalogAvailable().filter(s => !t || s.nome.toLowerCase().includes(t));
  $("#amCatalog").innerHTML = list.map(s => `<button class="am-cat-item${addSpec && addSpec.nome === s.nome ? " sel" : ""}" data-cat="${esc(s.nome)}"><span>${esc(s.nome)}</span><span class="am-cat-tag">${s.unidade ? esc(s.unidade) : (s.dominio === "lista" ? "lista" : s.dominio === "booleano" ? "sim/não" : "número")}</span></button>`).join("") || `<div class="am-empty">Nenhuma especificação do catálogo corresponde.</div>`;
  $("#amNotfound").hidden = !(t && list.length === 0);
  $("#amTerm").textContent = term.trim();
}
function pickSpec(nome) {
  addSpec = catalogAvailable().find(s => s.nome === nome); if (!addSpec) return;
  renderCatalog($("#amSearch").value);
  $("#amStep2").hidden = false; $("#amStep3").hidden = false;
  renderAddValue(); updateAddEnabled();
}
function renderAddValue() {
  const s = addSpec; let inp;
  if (s.dominio === "lista") inp = `<select id="amValInput" class="am-input">${s.opcoes.map(o => `<option${o === s.valorEdital ? " selected" : ""}>${esc(o)}</option>`).join("")}</select>`;
  else if (s.dominio === "booleano") inp = `<select id="amValInput" class="am-input"><option${s.valorEdital === "Sim" ? " selected" : ""}>Sim</option><option${s.valorEdital === "Não" ? " selected" : ""}>Não</option></select>`;
  else inp = `<div class="am-num"><span class="am-op">${esc(s.operador || "")}</span><input id="amValInput" class="am-input am-num-input" value="${esc(s.valorEdital)}"><span class="am-unit-fixed">${s.unidade ? esc(unitSep(s.unidade) + s.unidade) : ""}</span></div>`;
  $("#amValue").innerHTML = `<div class="am-hint">A IA sugere o valor a partir do trecho selecionado. Confirme ou ajuste (operador e unidade são fixos, vêm do catálogo).</div>${inp}`;
}
function updateAddEnabled() { $("#amAdd").disabled = !(addSpec && addTrecho); }
function confirmAddReq() {
  if (!addSpec || !addTrecho) return;
  const s = addSpec, vi = $("#amValInput"), raw = String(vi.value != null ? vi.value : vi.textContent).trim();
  const exigFull = s.dominio === "numero" ? ((s.operador ? s.operador + " " : "") + joinUnit(raw, s.unidade)) : raw;
  const cells = s.valsPorSku.map(v => ({ st: evalCell(v, exigFull), v, c: "alta" }));
  SPECS.push({ req: s.nome, exig: exigFull, unidade: s.unidade, added: true, origem: { doc: "Edital (Termo de Referência)", pag: "—", trecho: addTrecho }, cells });
  recompute(); renderMatrix();
  if (!$("#editDrawer").hidden) renderEditDrawer(); // reflete o novo requisito na barra de edição
  $("#addModal").hidden = true;
  toast(`Requisito adicionado do catálogo: "${s.nome}"`);
}
function requestCatalog() { $("#addModal").hidden = true; toast(`Pedido enviado ao time de catálogo: "${$("#amSearch").value.trim()}"`); }

/* ---------- Alerta de edição direta na célula (1ª vez) ---------- */
let pendingWarnEl = null;
function focusEditable(el) { el.focus(); try { const r = document.createRange(); r.selectNodeContents(el); r.collapse(false); const s = window.getSelection(); s.removeAllRanges(); s.addRange(r); } catch (_) { } }
function openInlineWarn(el) { pendingWarnEl = el; $("#warnModal").hidden = false; }
/* dropdown de status do checklist: escolhe direto em vez de ciclar */
const CL_OPTS = ["ok", "no", "parcial", "parceiro", "ne"];
let statusMenuTarget = null;
function openStatusMenu(anchor, sec, ri) {
  const menu = $("#statusMenu"); if (!menu) return;
  statusMenuTarget = { sec, ri };
  const cur = currentChecklists[sec][ri].st;
  menu.innerHTML = CL_OPTS.map(k => { const o = CL_ST[k]; return `<button class="sm-item${k === cur ? " sel" : ""}" data-stval="${k}"><span class="badge ${o.cls}">${o.ico}${o.label}</span>${k === cur ? `<span class="sm-check">✓</span>` : ""}</button>`; }).join("");
  menu.hidden = false;
  const r = anchor.getBoundingClientRect(), mw = menu.offsetWidth, mh = menu.offsetHeight;
  let top = r.bottom + 6; if (top + mh > innerHeight - 8) top = Math.max(8, r.top - mh - 6);
  menu.style.top = top + "px"; menu.style.left = Math.max(8, Math.min(r.left, innerWidth - mw - 8)) + "px";
}
function closeStatusMenu() { const m = $("#statusMenu"); if (m) m.hidden = true; statusMenuTarget = null; }

function openKebabMenu(anchor) {
  const menu = $("#kebabMenu"); if (!menu) return;
  // "Concluir análise" agora é botão no header do software; kebab fica só com "Importar".
  const items = [["importar", "Importar"]];
  menu.innerHTML = items.map(([k, l]) => `<button class="km-item" data-kbact="${k}">${l}</button>`).join("");
  menu.hidden = false;
  const r = anchor.getBoundingClientRect(), mw = menu.offsetWidth, mh = menu.offsetHeight;
  let top = r.bottom + 6; if (top + mh > innerHeight - 8) top = Math.max(8, r.top - mh - 6);
  menu.style.top = top + "px"; menu.style.left = Math.max(8, Math.min(r.right - mw, innerWidth - mw - 8)) + "px";
}
function closeKebabMenu() { const m = $("#kebabMenu"); if (m) m.hidden = true; }

const CAT_OPTS = {
  produto: ["Câmera de segurança", "Gravador de vídeo (DVR/NVR)", "Cabo de rede", "Access point", "Nobreak / fonte"],
  checklist: ["Software de vídeo monitoramento", "Software de gestão pública", "Software de gestão da educação", "Software de gestão de saúde"],
};
let catMenuAnchor = null;
function openCatMenu(anchor) {
  const menu = $("#catMenu"); if (!menu) return;
  catMenuAnchor = anchor;
  const cur = anchor.textContent.trim();
  const opts = CAT_OPTS[anchor.dataset.catmech] || CAT_OPTS.produto;
  menu.innerHTML = opts.map(o => `<button class="sm-item${o === cur ? " sel" : ""}" data-catval="${esc(o)}"><span>${esc(o)}</span>${o === cur ? `<span class="sm-check">✓</span>` : ""}</button>`).join("");
  menu.hidden = false;
  const r = anchor.getBoundingClientRect(), mw = menu.offsetWidth, mh = menu.offsetHeight;
  let top = r.bottom + 6; if (top + mh > innerHeight - 8) top = Math.max(8, r.top - mh - 6);
  menu.style.top = top + "px"; menu.style.left = Math.max(8, Math.min(r.left, innerWidth - mw - 8)) + "px";
}
function closeCatMenu() { const m = $("#catMenu"); if (m) m.hidden = true; catMenuAnchor = null; }

/* Trocar categoria re-roda a extração dos requisitos (Alice 17/08): não é instantâneo.
   Simulamos: confirmar → loading "reprocessando" sobre o componente → label atualizado + match recalculado. */
let pendingCat = null, reprocessing = {}, lockedByOther = null; // reprocessing[itemIndex] = { val, comp, timer, by }; lockedByOther = nome de quem está reprocessando o item aberto (bloqueia edição)
const processingResults = {};
function renderProcessingCard() {
  let card = document.getElementById("processingCard");
  if (!card) {
    card = document.createElement("aside");
    card.id = "processingCard";
    card.className = "processing-card";
    card.setAttribute("aria-label", "Preparando resultados");
    card.addEventListener("click", e => {
      const button = e.target.closest("[data-processing-item]");
      if (button) openTable(+button.dataset.processingItem);
    });
    document.body.appendChild(card);
  }
  const entries = Object.entries(processingResults);
  card.hidden = !entries.length;
  card.innerHTML = `<h2>Preparando resultados</h2><p>Estamos preparando os resultados abaixo. Você pode continuar navegando; um ✓ aparecerá quando cada item estiver disponível.</p><ul aria-live="polite">${entries.map(([id, done]) => `<li><button data-processing-item="${id}" aria-label="Análise técnica: ${esc(ITEMS[id].titulo || ITEMS[id].nome)}: ${done ? "concluído" : "processando"}">${done ? ICO_OK : '<span class="cat-spin" aria-hidden="true"></span>'}<span>Análise técnica: ${esc(ITEMS[id].titulo || ITEMS[id].nome)}</span></button></li>`).join("")}</ul>`;
}
function itemSkeletonHTML() {
  const row = () => `<div class="sk-row"><div class="sk-cell wide"></div><div class="sk-cell"></div><div class="sk-cell"></div><div class="sk-cell"></div><div class="sk-cell"></div></div>`;
  return `<div class="to-collapsibles">
      <div class="sk-box"><div class="sk-line" style="width:38%"></div></div>
      <div class="sk-box"><div class="sk-line" style="width:52%"></div></div>
    </div>
    <div class="to-sections"><div class="sk-table">
      <div class="sk-row head"><div class="sk-cell wide"></div><div class="sk-cell"></div><div class="sk-cell"></div><div class="sk-cell"></div><div class="sk-cell"></div></div>
      ${Array.from({ length: 8 }, row).join("")}
    </div></div>`;
}
function showReprocessSonner(val) {
  let s = document.getElementById("reprocessSonner");
  if (!s) { s = document.createElement("div"); s.id = "reprocessSonner"; s.className = "reprocess-sonner"; document.body.appendChild(s); }
  s.innerHTML = `<div class="cat-spin"></div><div class="rs-txt"><b>Reprocessando os requisitos para "${esc(val)}"</b><span>Este processo pode demorar um pouco. Você pode sair desta tela. Assim que estiver pronto, avisaremos por e-mail.</span></div>`;
  s.hidden = false;
}
function hideReprocessSonner() { const s = document.getElementById("reprocessSonner"); if (s) s.hidden = true; }
function metaSkeletonHTML() {
  const chip = w => `<span class="ts-field"><span class="sk-chip" style="width:${w}px"></span></span>`;
  return `<div class="ts-metas">${chip(150)}${chip(108)}${chip(140)}${chip(140)}</div>`;
}
/* mostra o estado de reprocessamento (skeleton do item inteiro, inclusive o sub-header, + sonner) na tela atual */
function showItemReprocessing(val) {
  $("#toSummary").hidden = true;
  $("#toBody").classList.add("processing-body");
  $("#toBody").innerHTML = `<div class="processing-message" role="status"><span class="cat-spin" aria-hidden="true"></span><p>Estamos preparando este resultado. Ele ficará disponível assim que for concluído.</p></div>`;
  hideReprocessSonner();
  renderProcessingCard();
}
/* Trocar categoria afeta o ITEM inteiro e pode demorar 1min+. O estado é POR ITEM e persiste:
   o usuário pode navegar entre itens; ao voltar ao item que ainda reprocessa, vê o loading de novo. */
function reprocessCategory(anchor, val) {
  const oldLabel = anchor.childNodes[0].nodeValue.trim();
  const it = ITEMS[active];
  const comp = it.componentes.find(c => c.rotulo === oldLabel) || it.componentes.find(c => c.mecanica === anchor.dataset.catmech);
  if (comp) { comp.rotulo = val; comp.nenhumProduto = !/c[âa]mera/i.test(val); } // categoria sem câmera: nenhum produto do catálogo se aplica
  const item = active;
  if (reprocessing[item] && reprocessing[item].timer) clearTimeout(reprocessing[item].timer);
  reprocessing[item] = { val, comp };
  processingResults[item] = false;
  showItemReprocessing(val);
  reprocessing[item].timer = setTimeout(() => {
    const done = reprocessing[item]; delete reprocessing[item];
    processingResults[item] = true;
    renderProcessingCard();
    renderGrid();
    if (active === item) {
      hideReprocessSonner();
      openTable(item);
      toast(done && done.comp && done.comp.nenhumProduto ? `Nenhum produto do catálogo se aplica a "${val}"` : `Requisitos reprocessados para "${val}", análise recalculada`);
    }
    // se o usuário está em outro item, nada visual muda aqui: quando ele voltar, o item já renderiza pronto (o "aviso por e-mail")
  }, 30000);
}

/* ============================================================
   Wire
   ============================================================ */
function wire() {
  const btnExp = $("#btnExportList"); if (btnExp) btnExp.addEventListener("click", notPrototyped);
  $("#cardGrid").addEventListener("click", e => { const c = e.target.closest("[data-item]"); if (c) openTable(+c.dataset.item); });

  $("#toClose").onclick = closeTable;
  $("#toNav").addEventListener("click", e => {
    const b = e.target.closest("[data-nav]"); if (!b || b.disabled) return;
    const list = visibleItemsIdx(), pos = list.indexOf(active);
    const target = b.dataset.nav === "prev" ? list[pos - 1] : list[pos + 1];
    if (target != null) openTable(target);
  });
  $("#toEditCtrls").addEventListener("click", e => { if (e.target.closest("#btnEditItem")) openEditDrawer({ type: "item" }); });
  $("#editClose").onclick = cancelEditDrawer;
  $("#editHeaderAdd").addEventListener("click", e => {
    const add = e.target.closest("[data-addspec]");
    if (add && !add.disabled) { captureEditValues(); openSpecMenu(add); }
  });
  $("#editCancel").onclick = cancelEditDrawer;
  $("#editOverlay").onclick = cancelEditDrawer;
  $("#editSave").onclick = saveEditDrawer;
  $("#editBody").addEventListener("click", e => {
    const add = e.target.closest("[data-addspec]");
    if (add) { captureEditValues(); openSpecMenu(add); return; }
    const remove = e.target.closest("[data-edit-remove]");
    if (remove) {
      const spec = SPECS[+remove.dataset.editRemove];
      if (spec?.fromDiff) confirmRemoveSpec(spec.req, true, remove);
      return;
    }
    // icon group do card de descrição (mesmo da leitura): ver no edital + copiar; e o caret colapsa
    if (e.target.closest("[data-descedital]")) { openDescOrigin(); return; }
    if (e.target.closest("[data-descextrair]")) { notPrototyped(); return; }
    const dtog = e.target.closest("[data-desctoggle]"); if (dtog) { dtog.closest("[data-descblock]").classList.toggle("open"); return; }
    // "+" numa spec não exigida: adiciona à comparação (como na leitura), re-renderiza o drawer e rola até o fim da lista
    const adf = e.target.closest("[data-adddiff]"); if (adf) {
      addDiferencial(adf.dataset.adddiff, true); renderEditDrawer(); // fromSheet: só no drawer; tabela só muda ao Salvar
      const fs = $("#editBody").querySelectorAll(".ed-field"); const last = fs[fs.length - 1];
      if (last) last.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }
    if (e.target.closest("#editAddReq")) { openAddModal(); return; }
    if (e.target.closest("#editAddCl")) { const sec = editTarget.sec; currentChecklists[sec].push({ req: "Novo requisito", exig: "", modulo: "—", st: "ne", c: null, just: "—", origem: { doc: "Inserido manualmente", pag: "—" } }); renderEditDrawer(); return; }
    const more = e.target.closest("#edMore");
    if (more) { const d = $("#editBody .ed-desc"); d.classList.toggle("clamp"); more.textContent = d.classList.contains("clamp") ? "Ver mais" : "Ver menos"; }
  });
  $("#toExport").onclick = notPrototyped;
  // Ações ainda não prototipadas: sonner padrão. (Compartilhar e Importar caem aqui.)
  { const sh = $("#toShare"); if (sh) sh.onclick = notPrototyped; }
  { const im = $("#toImport"); if (im) im.onclick = notPrototyped; }

  const tb = $("#toBody");
  // redimensiona a tabela ao mudar o tamanho da janela ou abrir/fechar uma seção
  window.addEventListener("resize", sizeMatrixHeight);
  tb.addEventListener("toggle", sizeMatrixHeight, true);
  // barra "Quantidade/Valores": some ao rolar para baixo, reaparece ao subir. Quando some, o card recalcula e ganha o espaço.
  let lastToScroll = 0;
  tb.addEventListener("scroll", () => {
    const st = tb.scrollTop, sum = $("#toSummary"); if (!sum) return;
    const was = sum.classList.contains("is-hidden");
    if (st <= 4) sum.classList.remove("is-hidden");
    else if (st > lastToScroll + 4) sum.classList.add("is-hidden");
    else if (st < lastToScroll - 4) sum.classList.remove("is-hidden");
    lastToScroll = st;
    if (sum.classList.contains("is-hidden") !== was) sizeMatrixHeight();
  });
  // edição inline dos valores do item na barra "Quantidade/Valores"
  $("#toSummary").addEventListener("click", e => {
    const ed = e.target.closest("[data-metaedit]"); if (ed) { e.stopPropagation(); editingMeta = ed.dataset.metaedit; renderItemSummary(); return; }
    if (e.target.closest("[data-metaok]")) { e.stopPropagation(); commitMeta(); return; }
    if (e.target.closest("[data-metacancel]")) { e.stopPropagation(); editingMeta = null; renderItemSummary(); return; }
  });
  $("#toSummary").addEventListener("keydown", e => {
    if (!editingMeta) return;
    if (e.key === "Enter") { e.preventDefault(); commitMeta(); }
    else if (e.key === "Escape") { e.preventDefault(); editingMeta = null; renderItemSummary(); }
  });
  document.addEventListener("click", e => { if (editingMeta && !e.target.closest("#toSummary")) commitMeta(); });
  // icon-pill flutuante (tooltip de ações): criar elemento + hover/click
  if (!$("#actionPill")) { const p = document.createElement("div"); p.id = "actionPill"; p.className = "action-pill"; p.hidden = true; document.body.appendChild(p); }
  document.addEventListener("mouseover", e => {
    if (e.target.closest("#actionPill")) { clearTimeout(pillHideT); return; }
    const chip = e.target.closest('#toBody .val-chip[data-vstart]'); // metas do subheader: apenas badge por enquanto (sem hover)
    if (chip) { clearTimeout(pillHideT); showActionPill(chip); }
    else { clearTimeout(pillHideT); pillHideT = setTimeout(hideActionPill, 140); }
  });
  $("#actionPill").addEventListener("click", e => {
    const b = e.target.closest("[data-pillidx]"); if (!b) return;
    e.stopPropagation(); // não deixar o "clicar fora confirma" fechar a edição recém-aberta
    const a = pillActions[+b.dataset.pillidx]; hideActionPill(); if (a) a.act();
  });
  tb.addEventListener("pointerdown", e => {
    const rz = e.target.closest("[data-resize]"); if (!rz) return;
    e.preventDefault(); rz.classList.add("active");
    const key = rz.dataset.resize, startX = e.clientX, startW = COLW(key);
    const move = ev => { colW[key] = Math.max(90, Math.round(startW + (ev.clientX - startX))); scheduleRender(); };
    const up = () => { saveCols(); window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); renderMatrix(); };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
  });
  tb.addEventListener("click", e => {
    // item sendo reprocessado por outro usuário: qualquer tentativa de editar mostra o alerta (leitura liberada)
    if (lockedByOther && e.target.closest("[data-editsec],[data-vstart],[data-vconfirm],[data-adddiff],[data-rmdiff],[data-addna],[data-concluir],[data-notproto],[data-catdrop],[data-choose],[data-clstatus],[data-addcol],[data-clnote]")) {
      e.preventDefault(); e.stopPropagation(); showLockAlert(lockedByOther); return;
    }
    if (e.target.closest("[data-extrairvazio]")) { extractFromEdital(); return; }
    const na = e.target.closest("[data-addna]"); if (na) { addNaoAnalisado(na.dataset.addna); return; }
    const df = e.target.closest("[data-adddiff]"); if (df) { addDiferencial(df.dataset.adddiff); return; }
    const rmd = e.target.closest("[data-rmdiff]"); if (rmd) { confirmRemoveSpec(rmd.dataset.rmdiff, false, rmd); return; }
    if (e.target.closest("[data-descedital]")) { openDescOrigin(); return; }
    if (e.target.closest("[data-descextrair]")) { notPrototyped(); return; }
    const dtog = e.target.closest("[data-desctoggle]"); if (dtog) { dtog.closest("[data-descblock]").classList.toggle("open"); return; }
    if (e.target.closest("[data-concluir]")) { e.preventDefault(); notPrototyped(); return; }
    if (e.target.closest("[data-notproto]")) { e.preventDefault(); notPrototyped(); return; }
    const es = e.target.closest("[data-editsec]"); if (es) { e.preventDefault(); const v = es.dataset.editsec; openEditDrawer(v === "produto" ? { type: "produto" } : { type: "checklist", sec: +v.split(":")[1] }); return; }
    const vs = e.target.closest("[data-vstart]"); if (vs) { startInlineEdit(+vs.dataset.vstart); return; }
    const vconf = e.target.closest("[data-vconfirm]"); if (vconf) { tryCommitInline(+vconf.dataset.vconfirm); return; }
    const vcan = e.target.closest("[data-vcancel]"); if (vcan) { cancelInlineEdit(); return; }
    const pin = e.target.closest("[data-pin]"); if (pin) { const k = pin.dataset.pin; frozen.has(k) ? frozen.delete(k) : frozen.add(k); saveCols(); renderMatrix(); return; }
    const nl = e.target.closest("[data-neturl]"); if (nl) { e.stopPropagation(); notPrototyped(); return; }
    const cl = e.target.closest("[data-caturl]"); if (cl) { e.stopPropagation(); notPrototyped(); return; }
    const ch = e.target.closest("[data-choose]"); if (ch) { const i = +ch.dataset.choose; prefs.chosen[active] = (prefs.chosen[active] === i) ? undefined : i; if (prefs.chosen[active] == null) delete prefs.chosen[active]; savePrefs(); renderMatrix(); updateProdSecSummary(); toast(prefs.chosen[active] != null ? `Produto escolhido: ${MX_SKUS[i].model}` : "Seleção removida"); return; }
    const cv = e.target.closest("[data-copytext]"); if (cv) { e.stopPropagation(); const txt = cv.dataset.copytext; if (navigator.clipboard) navigator.clipboard.writeText(txt).catch(() => {}); toast(`Valor copiado: "${txt}"`); return; }
    const kb = e.target.closest("[data-kebab]"); if (kb) { e.preventDefault(); e.stopPropagation(); openKebabMenu(kb); return; }
    const cd = e.target.closest("[data-catdrop]"); if (cd) { e.preventDefault(); e.stopPropagation(); openCatMenu(cd); return; }
    const clv = e.target.closest("[data-clview]"); if (clv) { const [s, v] = clv.dataset.clview.split(":"); clView[+s] = v; renderChecklist($("#clHost-" + s), currentChecklists[+s], +s); return; }
    const ba = e.target.closest("[data-blockact]"); if (ba) { notPrototyped(); return; }
    const or = e.target.closest("[data-origin]"); if (or) { const ri = +or.dataset.origin; openOriginSpec(SPECS[ri], ri); return; }
    const q = e.target.closest("[data-question]"); if (q) { notPrototyped(); return; }
    const cs = e.target.closest("[data-clstatus]"); if (cs) { const [s, r] = cs.dataset.clstatus.split(":").map(Number); openStatusMenu(cs, s, r); return; }
    const co = e.target.closest("[data-clorigin]"); if (co) { const [s, r] = co.dataset.clorigin.split(":").map(Number); openOriginSpec(currentChecklists[s][r]); return; }
    const cq = e.target.closest("[data-clquestion]"); if (cq) { notPrototyped(); return; }
    const cn = e.target.closest("[data-clnote]"); if (cn) { notPrototyped(); return; }
    const ac = e.target.closest("[data-addcol]"); if (ac) { notPrototyped(); return; }
  });
  tb.addEventListener("click", e => {
    const anchor = e.target.closest("[data-addspec]"); if (!anchor) return;
    if (lockedByOther) { showLockAlert(lockedByOther); return; }
    openSpecMenu(anchor);
  });
  $("#specMenu").addEventListener("click", e => {
    const option = e.target.closest("[data-specval]"); if (!option) return;
    const fromSheet = !!specMenuAnchor?.closest("#editDrawer");
    closeSpecMenu();
    if (lockedByOther) { showLockAlert(lockedByOther); return; }
    addDiferencial(option.dataset.specval, fromSheet);
    if (fromSheet) {
      renderEditDrawer();
      const field = $("#editBody").querySelector(".ed-field:last-of-type .ed-input") || [...$("#editBody").querySelectorAll(".ed-input")].at(-1);
      field?.focus();
    }
  });
  document.addEventListener("click", e => {
    if (!e.target.closest("#specMenu, [data-addspec]")) closeSpecMenu();
  });
  document.addEventListener("keydown", e => {
    if ($("#specMenu").hidden) return;
    if (e.key === "Escape") { e.preventDefault(); e.stopImmediatePropagation(); closeSpecMenu(true); }
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) {
      e.preventDefault();
      const options = [...$("#specMenu").querySelectorAll("button")];
      const i = options.indexOf(document.activeElement);
      const next = e.key === "Home" ? 0 : e.key === "End" ? options.length - 1 : (i + (e.key === "ArrowDown" ? 1 : -1) + options.length) % options.length;
      options[next]?.focus();
    }
    if (e.key === "Tab") closeSpecMenu(true);
  }, true);
  window.addEventListener("resize", () => closeSpecMenu());
  document.addEventListener("scroll", e => { if (!$("#specMenu").contains(e.target)) closeSpecMenu(); }, true);
  tb.addEventListener("keydown", e => {
    const inp = e.target.closest(".val-inline-input"); if (!inp) return;
    if (e.key === "Enter") { e.preventDefault(); tryCommitInline(+inp.dataset.vedit); }
    else if (e.key === "Escape") { e.preventDefault(); cancelInlineEdit(); }
  });

  $("#drawerClose").onclick = closeOrigin; $("#drawerOverlay").onclick = closeOrigin;
  $("#drawerBody").addEventListener("mouseup", () => {
    if (extractRi == null) return;
    const doc = $("#extractDoc"), acts = $("#extractActions"); if (!doc || !acts) return;
    const sel = window.getSelection(), txt = sel.toString().trim();
    if (!txt || !doc.contains(sel.anchorNode)) { acts.hidden = true; pendingExtract = null; return; }
    pendingExtract = txt; $("#extractSel").textContent = `“${txt}”`; acts.hidden = false;
  });
  $("#drawerBody").addEventListener("click", e => {
    if (!e.target.closest("#extractConfirm") || extractRi == null || !pendingExtract) return;
    const ri = extractRi, val = pendingExtract, nm = SPECS[ri].req;
    SPECS[ri].naoExtraido = false; SPECS[ri].exig = val;
    SPECS[ri].origem = { doc: EDITAL.docNome || "Edital (Termo de Referência)", pag: "—", trecho: val };
    recompute(); renderMatrix(); closeOrigin();
    toast(`Valor extraído para "${nm}", produtos liberados para comparação`);
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape") { if (!$("#catMenu").hidden) closeCatMenu(); else if (!$("#kebabMenu").hidden) closeKebabMenu(); else if (!$("#statusMenu").hidden) closeStatusMenu(); else if (!$("#drawer").hidden) closeOrigin(); else if (!$("#tableOverlay").hidden) closeTable(); } });
  // dropdown de categoria da seção (com qual catálogo compara)
  $("#catMenu").addEventListener("click", e => {
    const b = e.target.closest("[data-catval]"); if (!b || !catMenuAnchor) return;
    const val = b.dataset.catval, anchor = catMenuAnchor;
    closeCatMenu();
    if (val === anchor.childNodes[0].nodeValue.trim()) return; // mesma categoria: nada a fazer
    pendingCat = { anchor, val };
    $("#catConfirmName").textContent = val;
    $("#catConfirmOverlay").hidden = false; $("#catConfirmModal").hidden = false;
  });
  const closeCatConfirm = () => { $("#catConfirmOverlay").hidden = true; $("#catConfirmModal").hidden = true; pendingCat = null; };
  $("#catConfirmCancel").onclick = closeCatConfirm;
  $("#catConfirmOverlay").onclick = closeCatConfirm;
  $("#catConfirmOk").onclick = () => { if (pendingCat) reprocessCategory(pendingCat.anchor, pendingCat.val); $("#catConfirmOverlay").hidden = true; $("#catConfirmModal").hidden = true; pendingCat = null; };
  document.addEventListener("click", e => {
    if ($("#catMenu").hidden) return;
    if (e.target.closest("#catMenu") || e.target.closest("[data-catdrop]")) return;
    closeCatMenu();
  });
  // dropdown de mais ações da seção (kebab)
  $("#kebabMenu").addEventListener("click", e => {
    const b = e.target.closest("[data-kbact]"); if (!b) return;
    const msg = { concluir: "Concluir análise desta seção", importar: "Importar (planilha ou modelo) para esta análise", exportar: "Exportando a seção (gera um arquivo com os requisitos e a análise)" };
    toast(msg[b.dataset.kbact] || "");
    closeKebabMenu();
  });
  document.addEventListener("click", e => {
    if ($("#kebabMenu").hidden) return;
    if (e.target.closest("#kebabMenu") || e.target.closest("[data-kebab]")) return;
    closeKebabMenu();
  });
  // dropdown de status do checklist
  $("#statusMenu").addEventListener("click", e => {
    const b = e.target.closest("[data-stval]"); if (!b || !statusMenuTarget) return;
    const { sec, ri } = statusMenuTarget;
    currentChecklists[sec][ri].st = b.dataset.stval;
    renderChecklist($("#clHost-" + sec), currentChecklists[sec], sec);
    refreshItemResumo();
    closeStatusMenu();
  });
  document.addEventListener("click", e => {
    if ($("#statusMenu").hidden) return;
    if (e.target.closest("#statusMenu") || e.target.closest("[data-clstatus]")) return;
    closeStatusMenu();
  });
}


/* ---------- Adicionar requisito: wiring do modal ---------- */
function initAddModal() {
  const close = () => { $("#addModal").hidden = true; };
  $("#amClose").onclick = close; $("#amCancel").onclick = close; $("#addOverlay").onclick = close;
  $("#amSearch").addEventListener("input", e => { addSpec = null; $("#amStep2").hidden = true; $("#amStep3").hidden = true; renderCatalog(e.target.value); updateAddEnabled(); });
  $("#amCatalog").addEventListener("click", e => { const b = e.target.closest("[data-cat]"); if (b) pickSpec(b.dataset.cat); });
  $("#amRequest").onclick = requestCatalog;
  $("#amAdd").onclick = confirmAddReq;
  $("#amValue").addEventListener("input", updateAddEnabled);
  $("#amDoc").addEventListener("mouseup", () => {
    const sel = window.getSelection(), txt = sel.toString().trim();
    if (!txt || !$("#amDoc").contains(sel.anchorNode)) return;
    addTrecho = txt; $("#amSelText").textContent = txt; $("#amSel").hidden = false; updateAddEnabled();
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !$("#addModal").hidden) close(); });
  // alerta de edição direta na célula
  const closeWarn = () => { $("#warnModal").hidden = true; $("#warnOverlay").hidden = true; pendingCommitRi = null; };
  $("#warnCancel").onclick = closeWarn; $("#warnOverlay").onclick = closeWarn;
  $("#warnOk").onclick = () => { prefs.warnedInline = true; savePrefs(); $("#warnModal").hidden = true; $("#warnOverlay").hidden = true; const ri = pendingCommitRi; pendingCommitRi = null; if (ri != null) commitInline(ri); };
}

/* ---------- tooltip próprio ---------- */
function initTooltip() {
  const tip = document.createElement("div"); tip.className = "tt"; document.body.appendChild(tip);
  let cur = null;
  const place = el => { const r = el.getBoundingClientRect(); let top = r.top - tip.offsetHeight - 8; if (top < 6) top = r.bottom + 8; let left = r.left + r.width / 2 - tip.offsetWidth / 2; left = Math.max(6, Math.min(left, innerWidth - tip.offsetWidth - 6)); tip.style.top = top + "px"; tip.style.left = left + "px"; };
  const hide = () => { tip.classList.remove("show"); cur = null; };
  document.addEventListener("mouseover", e => {
    const el = e.target.closest("[data-tip],[data-full],[title]"); if (!el || el === cur) return;
    if (el.hasAttribute("title")) { const t = el.getAttribute("title"); if (t) el.setAttribute("data-tip", t); el.removeAttribute("title"); }
    let txt = el.getAttribute("data-tip");
    // data-full: mostra o valor completo SÓ quando o texto está truncado (reticência)
    if (!txt && el.hasAttribute("data-full") && el.scrollWidth > el.clientWidth + 1) txt = el.dataset.full;
    if (!txt) return;
    cur = el; tip.textContent = txt; tip.classList.add("show"); place(el);
  });
  document.addEventListener("mouseout", e => { if (cur && (!e.relatedTarget || !cur.contains(e.relatedTarget))) hide(); });
  document.addEventListener("click", hide);
  window.addEventListener("scroll", hide, true);
}

/* ---------- Tour guiado (onboarding do protótipo) ---------- */
function initTour() {
  const layer = $("#tourLayer"), hi = $("#tourHi"), pop = $("#tourPop");
  const ensureGrid = () => { if (!$("#tableOverlay").hidden) closeTable(); if (!$("#drawer").hidden) closeOrigin(); };
  const MISTO = 2; // item de PRODUTO com matriz (usado pelos passos do tour; itens misto foram removidos)
  const ensureMisto = () => { if ($("#tableOverlay").hidden || active !== MISTO) openTable(MISTO); };
  // mini tour (para gravação): fluxo das especificações não exigidas pelo edital. Aciona via ?tour=diferencial
  const openItem3 = () => { if ($("#tableOverlay").hidden || active !== 2) openTable(2); };
  const addDemoDiff = () => { openItem3(); if (!document.querySelector("tr.diff-row")) { const b = document.querySelector('[data-adddiff="Zoom digital 16×"]'); if (b) b.click(); } };
  const MINI_STEPS = [
    { before: openItem3, title: "Especificações não exigidas pelo edital", text: "Vou mostrar rapidinho o que acontece com as especificações que o seu produto tem, mas que o edital não pediu." },
    { before: openItem3, sel: ".diff-tag", title: "Onde elas ficam", text: "Ficam aqui, numa seção à parte, como referência. Por padrão não entram na tabela e não contam no atende, porque o edital não exigiu." },
    { before: openItem3, sel: "[data-adddiff]", title: "Você decide, uma a uma", text: "A tabela mostra só o que o edital pediu. Mas cada uma tem esse '+'. Se você quiser comparar alguma, é só clicar." },
    { before: addDemoDiff, sel: "#matrixHost .val-inline-input", title: "Preencha o valor, ou não", text: "Ao clicar no '+', a especificação entra no fim da tabela e abre este campo. Aqui você tem duas escolhas." },
    { before: addDemoDiff, sel: "tr.diff-row", title: "Vira requisito ou fica como extra", text: "Se você preencher um valor, ela vira um requisito de verdade e passa a contar no atende. Se deixar em branco, fica como 'Não exigido', só para comparar entre os produtos, sem contar." },
    { before: addDemoDiff, sel: "tr.diff-row [data-rmdiff]", title: "Dá para remover", text: "E se mudar de ideia, a lixeira na coluna Ações tira a especificação da tabela e devolve para a seção. Nada é irreversível." },
    { before: openItem3, title: "É isso", text: "Resumindo: por padrão elas ficam fora da conta (é o produto oferecendo a mais), e você decide, uma a uma, se quer puxar para a tabela e transformar em requisito." },
  ];
  const isMini = /[?&]tour=diferencial/.test(location.search);
  const MAIN_STEPS = [
    { before: ensureGrid, title: "Bem-vindo à Análise Técnica", text: "Em cerca de 1 minuto eu mostro como o protótipo transforma o edital em decisão: o que você atende, o que falta e qual produto indicar. Use Próximo para avançar." },
    { before: ensureGrid, sel: "#stats", title: "Resumo executivo", text: "Os indicadores do edital ficam aqui. Estão como 'A definir' porque vamos redefinir juntos quais números fazem mais sentido." },
    { before: ensureGrid, sel: ".item-card", title: "Cada card é um item do edital", text: "O card mostra o tipo, a descrição do item, quantidade, valores e se você atende. Clicar abre a análise completa." },
    { before: ensureMisto, sel: ".comp-head", title: "Um item pode ter várias seções", text: "Ao abrir, o item se divide em seções (produto, licença, garantia, serviço), cada uma com a sua análise. Item simples tem só uma seção." },
    { before: ensureMisto, sel: ".best-tag", title: "Comparação de produtos", text: "Na seção de produto, comparamos os SKUs do seu catálogo com a exigência do edital e recomendamos o que mais atende." },
    { before: ensureMisto, sel: ".val-missing", title: "Valor não extraído", text: "Quando a IA não achou a exigência no edital, marcamos aqui. O ícone ao lado do valor abre o arquivo para você selecionar o trecho e extrair o dado." },
    { before: ensureMisto, sel: "th.col-val", title: "Corrija a extração do edital", text: "Esta coluna é a exigência que a IA extraiu do EDITAL. Se ela leu errado, você corrige o valor requerido e o atendimento de todos os produtos é recalculado. Os valores dos seus produtos vêm do seu catálogo, não se corrigem aqui." },
    { before: ensureMisto, sel: ".dt-wrap", title: "Software e serviço: atende / não", text: "Nas seções que não são de produto (software, serviço, licença, garantia) não há comparação de SKU: para cada exigência do edital você confirma se atende ou não." },
    { before: ensureMisto, sel: ".sku-select", title: "Escolha o produto da proposta", text: "Quando decidir, selecione o SKU que vai para a proposta. É o encerramento do fluxo de análise do item." },
    { before: ensureGrid, title: "Pronto!", text: "Esse é o fluxo: entender o item, ver o que falta, corrigir a extração e escolher o produto. Você pode refazer o tour quando quiser pelo botão no canto inferior direito." },
  ];
  const STEPS = isMini ? MINI_STEPS : MAIN_STEPS;
  let idx = 0;
  function place() {
    const step = STEPS[idx], el = step.sel ? $(step.sel) : null;
    $("#tourStepLbl").textContent = `Passo ${idx + 1} de ${STEPS.length}`;
    $("#tourTitle").textContent = step.title;
    $("#tourText").textContent = step.text;
    $("#tourPrev").disabled = idx === 0;
    $("#tourNext").textContent = idx === STEPS.length - 1 ? "Concluir" : "Próximo";
    if (el) {
      el.scrollIntoView({ block: "center", inline: "center" });
      requestAnimationFrame(() => {
        const r = el.getBoundingClientRect(), pad = 6;
        hi.style.display = "block";
        hi.style.top = (r.top - pad) + "px"; hi.style.left = (r.left - pad) + "px";
        hi.style.width = (r.width + pad * 2) + "px"; hi.style.height = (r.height + pad * 2) + "px";
        const pw = pop.offsetWidth || 330, ph = pop.offsetHeight || 170;
        let top = r.bottom + 12; if (top + ph > innerHeight - 12) top = Math.max(12, r.top - ph - 12);
        let left = Math.max(12, Math.min(r.left, innerWidth - pw - 12));
        pop.style.top = top + "px"; pop.style.left = left + "px";
      });
    } else {
      hi.style.display = "none";
      const pw = pop.offsetWidth || 330, ph = pop.offsetHeight || 170;
      pop.style.top = (innerHeight / 2 - ph / 2) + "px"; pop.style.left = (innerWidth / 2 - pw / 2) + "px";
    }
  }
  function show(i) { idx = Math.max(0, Math.min(STEPS.length - 1, i)); const s = STEPS[idx]; if (s.before) s.before(); layer.hidden = false; place(); }
  function end() { layer.hidden = true; if (!$("#tableOverlay").hidden) closeTable(); }
  const tf = $("#tourFab"); if (tf) tf.onclick = () => show(0); // FAB do tour foi substituído por "Tire suas dúvidas"; tour segue via deep-link ?tour=
  $("#tourSkip").onclick = end;
  $("#tourPrev").onclick = () => { if (idx > 0) show(idx - 1); };
  $("#tourNext").onclick = () => { if (idx >= STEPS.length - 1) end(); else show(idx + 1); };
  window.addEventListener("resize", () => { if (!layer.hidden) place(); });
  document.addEventListener("keydown", e => { if (!layer.hidden) { if (e.key === "Escape") end(); else if (e.key === "ArrowRight") $("#tourNext").click(); else if (e.key === "ArrowLeft") $("#tourPrev").click(); } });
  if (isMini) {
    document.body.classList.add("mini-tour");
    let started = false;
    miniTourStart = () => { if (!started) { started = true; setTimeout(() => show(0), 150); } }; // dispara ao abrir o item (atraso p/ o layout assentar)
  }
}

/* boot */
// demo: pré-seleciona um produto num item que ATENDE, para ilustrar melhor o "produto escolhido"
if (!prefs.seededChosen2) {
  const DEMO_ITEM = 2; // "Câmeras bullet fixas": só produto que ATENDE, para ilustrar o "produto escolhido"
  const pc = ITEMS[DEMO_ITEM].componentes.find(c => c.mecanica === "produto");
  prefs.chosen = pc ? { [DEMO_ITEM]: bestOf(matrixOf(pc), pc.skus).i } : {};
  prefs.seededChosen2 = true; savePrefs();
}
// DEMO: ?trava[=N] simula OUTRO usuário reprocessando o item N (padrão: 2) — abre em leitura com aviso e edição bloqueada
{ const t = /[?&]trava(?:=(\d+))?/.exec(location.search); if (t) { const idx = t[1] != null ? +t[1] : 2; if (ITEMS[idx]) reprocessing[idx] = { by: "Brunno Krier Martins", persistent: true }; } }
renderGrid(); wire(); initAddModal(); initTooltip(); initTour();
