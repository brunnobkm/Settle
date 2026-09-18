/* ============================================================
   Análise Técnica · multi-tipo — shell único + mecânicas componíveis
   Mecânicas: produto = comparar/escolher SKU (matriz) · serviço/software = atende-não (checklist) · solução = seções
   ============================================================ */
const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
const cap = s => s ? s[0].toUpperCase() + s.slice(1) : s;
const clone = o => JSON.parse(JSON.stringify(o));
const ICO_OK = `<svg class="ico ok" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 8.5l3 3 6-7"/></svg>`;
const ICO_NO = `<svg class="ico no" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>`;
const ICO_ARROW = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 11L11 5M6 5h5v5"/></svg>`;
const ICO_CHAT = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M3 4h10v7H8l-3 2v-2H3z"/></svg>`;
const ICO_PLUS = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M8 3v10M3 8h10"/></svg>`;
const PIN_SVG = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><path d="M6 2.5h4l-.8 3.5 2.3 2H4.5l2.3-2L6 2.5z"/><path d="M8 8v5.5"/></svg>`;

const TIPO_LABEL = { produto: "Produto", servico: "Serviço", software: "Software", solucao: "Solução" };
const tipoChip = t => `<span class="badge tipo-${t}">${TIPO_LABEL[t]}</span>`;

/* ---------- matriz (produto) ---------- */
function matrixOf(holder) {
  if (!holder._m) { const s = clone(REQS); (holder.overrides || []).forEach(o => s[o.ri].cells[o.ci] = { st: o.st, v: o.v, c: o.c }); holder._m = s; }
  return holder._m;
}
function scoresFor(specs) {
  return SKUS.map((sku, i) => {
    let ok = 0, evaluable = 0, ne = 0; const diverg = [];
    specs.forEach(spec => {
      if (spec.exigNa) return;
      const cell = spec.cells[i];
      if (cell.st === "ok") { ok++; evaluable++; }
      else if (cell.st === "no") { evaluable++; diverg.push(spec.req); }
      else if (cell.st === "ne") ne++;
    });
    return { i, sku, ok, evaluable, ne, pct: evaluable ? Math.round(ok / evaluable * 100) : 0, diverg };
  });
}
const rankFor = sc => [...sc].sort((a, b) => b.pct - a.pct || a.ne - b.ne || b.ok - a.ok);
const bestOf = specs => rankFor(scoresFor(specs))[0];
const isConcordant = spec => new Set(spec.cells.filter(c => c.st === "ok" || c.st === "no").map(c => c.st)).size <= 1;

/* ---------- checklist (serviço / software) ---------- */
function checklistSummary(cl) {
  const ev = cl.filter(r => ["ok", "no", "parcial"].includes(r.st));
  const ok = cl.filter(r => r.st === "ok").length, no = cl.filter(r => r.st === "no").length;
  return { ok, total: ev.length, no, status: no === 0 ? "ok" : "no", pct: ev.length ? Math.round(ok / ev.length * 100) : 0 };
}
const CL_ST = { ok: { cls: "ok", label: "Atende", ico: ICO_OK }, no: { cls: "bad", label: "Não atende", ico: ICO_NO }, parcial: { cls: "warn", label: "Atende parcialmente", ico: "" }, ne: { cls: "soft", label: "Não avaliado", ico: "" } };
const confBadge = c => c ? `<span class="badge ${c === "alta" ? "ok" : c === "media" ? "warn" : "bad"}" data-tip="Confiança da IA na extração">${cap(c === "media" ? "média" : c)}</span>` : `<span class="state-na">—</span>`;

/* ---------- resumo por item (adapta ao tipo) ---------- */
function itemSummary(i) {
  const it = ITEMS[i];
  if (it.tipo === "produto") { const best = bestOf(matrixOf(it)); return { kind: "produto", best, status: best.diverg.length === 0 ? "ok" : "no" }; }
  if (it.tipo === "servico" || it.tipo === "software") { const s = checklistSummary(it.checklist); return { kind: "check", ...s }; }
  const secs = it.sections.map(sec => sec.tipo === "produto" ? { tipo: "produto", ok: bestOf(matrixOf(sec)).diverg.length === 0 } : { tipo: sec.tipo, ok: checklistSummary(sec.checklist).status === "ok" });
  return { kind: "solucao", secs, status: secs.every(s => s.ok) ? "ok" : "no" };
}

/* ---------- estado ---------- */
const LS = "settle-at-prefs-v6";
let prefs = (() => { try { return JSON.parse(localStorage.getItem(LS)) || {}; } catch { return {}; } })();
const savePrefs = () => localStorage.setItem(LS, JSON.stringify(prefs));
prefs.chosen = prefs.chosen || {};
let statusFilter = prefs.filter || "all";
let active = null, SPECS = null, STATE, RANKED, ORDER, BEST, activeMatrixHolder = null;
let currentChecklists = [];
let colW = prefs.colW || {};
let frozen = new Set(prefs.frozen || ["req", "val"]);
const COLW = k => colW[k] || (k === "req" ? 300 : k === "val" ? 160 : 176);
const saveCols = () => { prefs.colW = colW; prefs.frozen = [...frozen]; savePrefs(); };
let renderPending = false;
const scheduleRender = () => { if (!renderPending) { renderPending = true; requestAnimationFrame(() => { renderPending = false; renderMatrix(); }); } };
function recompute() { STATE = scoresFor(SPECS); RANKED = rankFor(STATE); ORDER = RANKED.map(s => s.i); BEST = RANKED[0]; window.SCORES = STATE; }

/* ============================================================
   Grid de cards (filtrado por tipo + status)
   ============================================================ */
function renderGrid() {
  $("#crumbId").textContent = `Edital ${EDITAL.numero}`;
  const html = ITEMS.map((it, i) => {
    const sum = itemSummary(i);
    if (statusFilter !== "all" && sum.status !== statusFilter) return "";
    const chosenIdx = prefs.chosen[i];
    const statusBadge = sum.status === "ok"
      ? `<span class="badge ok" data-tip="Você consegue atender este item">${ICO_OK} Atende</span>`
      : `<span class="badge bad" data-tip="Há exigência(s) que você não atende">${ICO_NO} Não atende</span>`;
    const chosenBadge = (sum.kind === "produto" && chosenIdx != null) ? `<span class="badge brand">${ICO_OK} Produto selecionado</span>` : "";
    let answer;
    if (sum.kind === "produto") answer = `<span class="star">★</span> Recomendação: <span style="font-family:var(--mono)">${esc(sum.best.sku.model)}</span> — atende ${sum.best.pct}%`;
    else if (sum.kind === "check") answer = `<span class="star">✓</span> Você atende ${sum.ok} de ${sum.total} exigências`;
    else answer = sum.secs.map(s => `${s.ok ? "✓" : "✗"} ${TIPO_LABEL[s.tipo].toLowerCase()}`).join(" · ");
    return `<div class="item-card ${chosenIdx != null ? "selected" : ""}" data-item="${i}" data-tip="Abrir a análise completa deste item">
      <div class="ic-badges">${statusBadge}${chosenBadge}</div>
      <div class="ic-title">${esc(it.nome)}</div>
      <div class="ic-meta"><b>Quantidade:</b> ${esc(it.quantidade)}</div>
      <div class="ic-answer" data-tip="Resultado da nossa análise">${answer}</div>
    </div>`;
  }).join("");
  $("#cardGrid").innerHTML = html || `<div style="grid-column:1/-1;color:var(--muted-foreground);padding:24px;text-align:center">Nenhum item neste filtro.</div>`;
  [...$("#filterTabs").children].forEach(b => b.classList.toggle("active", b.dataset.filter === statusFilter));
}

/* ============================================================
   Overlay — despacha por mecânica
   ============================================================ */
function openTable(i) {
  active = i; const it = ITEMS[i];
  currentChecklists = []; SPECS = null; BEST = null; activeMatrixHolder = null;
  const hasMatrix = it.tipo === "produto" || it.tipo === "solucao";
  $("#diffToggle").style.display = hasMatrix ? "" : "none";
  $("#tableOverlay").classList.toggle("diff-only", hasMatrix && !!prefs.diff);
  $("#tableOverlay").classList.toggle("show-conf", prefs.conf !== false);
  $("#diffToggle").classList.toggle("on", !!prefs.diff);
  $("#confToggle").classList.toggle("on", prefs.conf !== false);

  let body = `<div class="to-resumo"><div class="rs-label">Resumo do Termo de Referência</div><p>${esc(it.resumoTR)}</p></div>`;
  if (it.tipo === "produto") { activeMatrixHolder = it; SPECS = matrixOf(it); recompute(); body += `<div class="mech-host" id="matrixHost"></div>`; }
  else if (it.tipo === "servico" || it.tipo === "software") { currentChecklists = [it.checklist]; body += `<div class="mech-host" id="clHost-0"></div>`; }
  else {
    it.sections.forEach(sec => {
      body += `<div class="section-head">${esc(sec.titulo)}</div>`;
      if (sec.tipo === "produto") { activeMatrixHolder = sec; body += `<div class="mech-host" id="matrixHost"></div>`; }
      else { const idx = currentChecklists.length; currentChecklists.push(sec.checklist); body += `<div class="mech-host" id="clHost-${idx}"></div>`; }
    });
    if (activeMatrixHolder) { SPECS = matrixOf(activeMatrixHolder); recompute(); }
  }
  $("#toBody").innerHTML = body;
  if ($("#matrixHost")) renderMatrix();
  currentChecklists.forEach((c, idx) => renderChecklist($("#clHost-" + idx), c, idx));
  renderSummary(); renderCta();
  $("#tableOverlay").hidden = false;
}
const closeTable = () => { $("#tableOverlay").hidden = true; active = null; renderGrid(); };

function renderSummary() {
  const it = ITEMS[active], sum = itemSummary(active);
  const stChip = sum.status === "ok" ? `<span class="badge ok">${ICO_OK} Atende</span>` : `<span class="badge bad">${ICO_NO} Não atende</span>`;
  let extra = "";
  if (it.tipo === "produto" && BEST) {
    extra += ` <span class="diverg">Recomendado: <b style="font-family:var(--mono)">${esc(BEST.sku.model)}</b> — ${BEST.ok}/${BEST.evaluable} (${BEST.pct}%)</span>`;
    extra += ` <span class="diverg">Divergências do recomendado: <b>${BEST.diverg.length ? esc(BEST.diverg.join(", ")) : "nenhuma"}</b></span>`;
    const ci = prefs.chosen[active]; if (ci != null) extra += `<span class="chip-chosen">${ICO_OK} Escolhido: ${esc(SKUS[ci].model)}</span>`;
  } else if (sum.kind === "check") {
    const pend = it.checklist.filter(r => r.st === "no" || r.st === "parcial").map(r => r.req);
    extra += ` <span class="diverg">Atende ${sum.ok} de ${sum.total} · Pendências: <b>${pend.length ? esc(pend.join(", ")) : "nenhuma"}</b></span>`;
  } else if (it.tipo === "solucao") {
    extra += ` <span class="diverg">Frentes: ${sum.secs.map(s => `${s.ok ? "✓" : "✗"} ${TIPO_LABEL[s.tipo].toLowerCase()}`).join(" · ")}</span>`;
    if (BEST) { extra += ` <span class="diverg">Câmeras: <b style="font-family:var(--mono)">${esc(BEST.sku.model)}</b> ${BEST.pct}%${BEST.diverg.length ? ` · divergências: ${esc(BEST.diverg.join(", "))}` : ""}</span>`; const ci = prefs.chosen[active]; if (ci != null) extra += `<span class="chip-chosen">${ICO_OK} ${esc(SKUS[ci].model)}</span>`; }
  }
  $("#toSummary").innerHTML = `<span class="to-item-name">${esc(it.nome)}</span>${stChip}${extra}`;
}
function renderCta() {
  const sum = itemSummary(active);
  const hint = sum.status === "ok" ? "Item pronto para entrar na proposta." : "Há pendências — revise, questione ou descarte antes de prosseguir.";
  $("#toCta").innerHTML = `<div class="cta-hint">${hint}</div>
    <button class="btn primary" data-cta="add">Adicionar à proposta</button>
    <button class="btn" data-cta="question">Questionar / Impugnar</button>
    <button class="btn danger" data-cta="discard">Descartar item</button>`;
}

/* ---------- Mecânica: matriz (produto) ---------- */
function buildCols() {
  const cols = [{ key: "req" }, { key: "val" }, ...ORDER.map(i => ({ key: "sku-" + i, skuIdx: i }))];
  let fl = 0;
  cols.forEach(c => { c.w = COLW(c.key); c.frozen = frozen.has(c.key); });
  cols.forEach(c => { if (c.frozen) { c.left = fl; fl += c.w; } });
  const frz = cols.filter(c => c.frozen); if (frz.length) frz[frz.length - 1].edge = true;
  return cols;
}
const fzCls = c => c.frozen ? ` frozen${c.edge ? " frozen-edge" : ""}` : "";
const fzStyle = c => c.frozen ? ` style="left:${c.left}px"` : "";
const colCtrls = c => `<button class="col-pin ${c.frozen ? "on" : ""}" data-pin="${c.key}" data-tip="${c.frozen ? "Descongelar coluna" : "Congelar coluna (fixa ao rolar)"}">${PIN_SVG}</button><span class="col-resize" data-resize="${c.key}" data-tip="Arraste para redimensionar a largura"></span>`;
function cellTd(cell, ri, ci, exigNa, c) {
  if (exigNa) return `<td class="cell na-cell${fzCls(c)}"${fzStyle(c)}><span class="cell-val">${esc(cell.v)}</span></td>`;
  const icoInner = cell.st === "ok" ? ICO_OK : cell.st === "no" ? ICO_NO : "";
  const conf = (cell.st !== "ne" && cell.c) ? `<div class="conf ${cell.c}" data-tip="Confiança da IA na extração deste valor"><span class="dot"></span>${cap(cell.c)} confiança</div>` : "";
  return `<td class="cell ${cell.st}${fzCls(c)}"${fzStyle(c)}><div class="cell-line"><button class="ico-toggle ${cell.st}" data-toggle data-ri="${ri}" data-ci="${ci}" data-tip="Clique para alternar: atende → não atende → não extraído">${icoInner}</button><span class="cell-val editable" data-edit="v" data-ri="${ri}" data-ci="${ci}" contenteditable="true" data-tip="Clique para corrigir o valor extraído">${esc(cell.v)}</span></div>${conf}</td>`;
}
function renderMatrix() {
  const host = $("#matrixHost"); if (!host) return;
  const cols = buildCols(), chosenIdx = prefs.chosen[active], totalW = cols.reduce((s, c) => s + c.w, 0);
  const colgroup = `<colgroup>${cols.map(c => `<col data-k="${c.key}" style="width:${c.w}px">`).join("")}</colgroup>`;
  let head = "";
  cols.forEach(c => {
    if (c.key === "req") head += `<th class="col-req${fzCls(c)}"${fzStyle(c)}>Especificações do edital${colCtrls(c)}</th>`;
    else if (c.key === "val") head += `<th class="col-val${fzCls(c)}"${fzStyle(c)} data-tip="Valor que o edital exige para o requisito">Valor requerido${colCtrls(c)}</th>`;
    else {
      const idx = c.skuIdx, sc = STATE[idx], rank = ORDER.indexOf(idx), best = rank === 0, isChosen = chosenIdx === idx;
      head += `<th class="col-sku${best ? " best" : ""}${isChosen ? " chosen" : ""}${fzCls(c)}"${fzStyle(c)}>
        ${best ? `<div class="best-tag" style="margin:0 0 6px" data-tip="Produto com maior aderência">★ Recomendado</div>` : `<div class="sku-rank">${rank + 1}º</div>`}
        <div class="sku-model">${esc(sc.sku.model)}</div><div class="sku-brand" data-tip="Fabricante (info do SKU, não é requisito)">${esc(sc.sku.brand)}</div>
        <div class="sku-score" data-tip="Percentual de requisitos do edital que este produto atende"><span class="score-pct">${sc.pct}%</span><span class="score-bar"><span class="score-fill" style="width:${sc.pct}%"></span></span></div>
        <div class="score-frac">${sc.ok}/${sc.evaluable} requisitos${sc.ne ? ` · ${sc.ne} não extr.` : ""}</div>
        <div class="sku-actions"><button class="sku-select" data-choose="${idx}" data-tip="Definir como produto escolhido">${isChosen ? "✓ Selecionado" : "Selecionar"}</button></div>${colCtrls(c)}</th>`;
    }
  });
  let body = "";
  SPECS.forEach((spec, ri) => {
    if (spec.exigNa) return;
    let row = `<tr class="${isConcordant(spec) ? "concordant" : ""}">`;
    cols.forEach(c => {
      if (c.key === "req") row += `<td class="col-req${fzCls(c)}"${fzStyle(c)}><div class="req-head"><span class="req-name editable" data-edit="r" data-ri="${ri}" contenteditable="true" data-tip="Clique para editar o requisito">${esc(spec.req)}</span><span class="req-icons"><button class="req-ico" data-origin="${ri}" data-tip="Ver de onde a IA extraiu (página e trecho)">${ICO_ARROW}</button><button class="req-ico" data-question="${ri}" data-tip="Questionar / impugnar este requisito">${ICO_CHAT}</button></span></div></td>`;
      else if (c.key === "val") row += `<td class="col-val${fzCls(c)}"${fzStyle(c)}><span class="editable" data-edit="vr" data-ri="${ri}" contenteditable="true" data-tip="Clique para corrigir o valor exigido">${esc(spec.exig)}</span></td>`;
      else row += cellTd(spec.cells[c.skuIdx], ri, c.skuIdx, spec.exigNa, c);
    });
    body += row + `</tr>`;
  });
  const caret = `<svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 4l4 4-4 4"/></svg>`;
  const naoExigidas = [...SPECS.filter(s => s.exigNa).map(s => s.req), ...CATALOGO_NAO_EDITAL];
  const det = (title, items, note) => `<details><summary><span class="caret">${caret}</span>${title} <span class="cnt">(${items.length})</span></summary><div class="ex-body"><div class="ex-note">${note}</div><div class="tag-list">${items.map(t => `<span class="tag-item">${esc(t)}</span>`).join("")}</div></div></details>`;
  host.innerHTML = `<div class="table-wrap"><table class="cmp" style="width:${totalW}px">${colgroup}<thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>
    <div class="add-req" id="addReq" data-tip="Adicionar um requisito que a IA não extraiu">${ICO_PLUS} Adicionar requisito</div>
    <div class="to-extras">
      ${det("Requisitos do edital ainda não analisados", NAO_ANALISADAS, 'O edital pede, mas a IA não extraiu. Use "+ Adicionar requisito" para incluí-los.')}
      ${det("Especificações não exigidas pelo edital", naoExigidas, "Itens do catálogo que o edital não pede. Não entram no score, mas podem ser diferencial estratégico (questionar / impugnar).")}
    </div>`;
}

/* ---------- Mecânica: checklist (serviço / software) ---------- */
function renderChecklist(host, clArr, sec) {
  if (!host) return;
  const rows = clArr.map((r, ri) => {
    const st = CL_ST[r.st] || CL_ST.ne;
    return `<tr>
      <td class="c-check"><span class="cbox"></span></td>
      <td class="c-req"><div class="req-name">${esc(r.req)}</div><div class="req-exig">Exigido: <span class="val">${esc(r.exig)}</span></div><div class="cl-actions"><button class="req-origin" data-clorigin="${sec}:${ri}" data-tip="Ver de onde a IA extraiu (página e trecho)">${ICO_ARROW} Ver no edital · p.${r.origem.pag}</button><button class="req-origin" data-clquestion="${sec}:${ri}" data-tip="Questionar / impugnar este requisito">${ICO_CHAT} Questionar</button></div></td>
      <td><span class="badge soft">${esc(r.modulo || "—")}</span></td>
      <td><button class="badge ${st.cls} clickable-badge" data-clstatus="${sec}:${ri}" data-tip="Clique para alternar o status">${st.ico}${st.label}</button></td>
      <td>${confBadge(r.c)}</td>
      <td class="c-just">${esc(r.just || "—")}</td>
      <td><span class="badge soft with-avatar">Selecionar</span></td>
    </tr>`;
  }).join("");
  host.innerHTML = `<div class="dt-wrap"><table class="dt"><thead><tr><th class="c-check"><span class="cbox"></span></th><th class="c-req">Requisito</th><th>Módulo</th><th>Status</th><th>Confiança IA</th><th class="c-just">Justificativa IA</th><th>Responsável</th></tr></thead><tbody>${rows}</tbody></table><div class="dt-foot" data-addcl="${sec}">${ICO_PLUS} Adicionar requisito</div></div>`;
}

/* ============================================================
   Origem (genérico)
   ============================================================ */
function openOriginSpec(spec) {
  const o = spec.origem;
  $("#drawerBody").innerHTML = `<div class="src-meta">Requisito</div><div style="font-size:16px;font-weight:600;margin-bottom:10px">${esc(spec.req)}${spec.exigNa ? "" : ` <span style="color:var(--muted-foreground);font-weight:500">· exigido: <span style="font-family:var(--mono)">${esc(spec.exig)}</span></span>`}</div><div class="src-doc"><svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 2h6l3 3v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"/><path d="M10 2v3h3"/></svg> ${esc(o.doc)} ${o.pag !== "—" ? `<span class="src-page-tag">página ${o.pag}</span>` : ""}</div><div class="src-meta" style="margin-bottom:6px">Trecho de onde a informação foi extraída:</div><div class="src-quote">${o.trecho || "Inserido manualmente pelo usuário."}</div><div class="src-conf src-meta">A IA destacou o trecho acima do documento original. Confira a página ${o.pag} do ${esc(o.doc)} para validação manual.</div>`;
  $("#drawerOverlay").hidden = false; $("#drawer").hidden = false;
}
const closeOrigin = () => { $("#drawerOverlay").hidden = true; $("#drawer").hidden = true; };

let toastT;
function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2400); }

/* ============================================================
   Edição inline + interações
   ============================================================ */
function commitEdit(el) {
  const ri = +el.dataset.ri, kind = el.dataset.edit, txt = el.textContent.trim();
  if (kind === "r") SPECS[ri].req = txt || "Requisito";
  else if (kind === "vr") { if (!SPECS[ri].exigNa) SPECS[ri].exig = txt; }
  else if (kind === "v") { const cc = SPECS[ri].cells[+el.dataset.ci]; cc.v = txt || "—"; cc.c = "alta"; }
}
function toggleStatus(ri, ci) {
  const cc = SPECS[ri].cells[ci];
  cc.st = cc.st === "ne" ? "ok" : cc.st === "ok" ? "no" : "ne";
  if (cc.st === "ne") cc.v = "—"; if (!cc.c) cc.c = "alta";
  recompute(); renderMatrix(); renderSummary();
}
function addReq() {
  SPECS.push({ req: "Novo requisito", exig: "", exigNa: false, added: true, origem: { doc: "Inserido manualmente", pag: "—" }, cells: SKUS.map(() => ({ st: "ne", v: "—" })) });
  renderMatrix();
  const rows = $("#matrixHost").querySelectorAll("tbody tr"); const nameEl = rows[rows.length - 1]?.querySelector('[data-edit="r"]');
  if (nameEl) { nameEl.focus(); document.getSelection().selectAllChildren(nameEl); }
}
const CL_CYCLE = { ok: "no", no: "parcial", parcial: "ne", ne: "ok" };
function toggleClStatus(sec, ri) { const r = currentChecklists[sec][ri]; r.st = CL_CYCLE[r.st] || "ok"; renderChecklist($("#clHost-" + sec), currentChecklists[sec], sec); renderSummary(); }
function addClReq(sec) { currentChecklists[sec].push({ req: "Novo requisito", exig: "", modulo: "—", st: "ne", c: null, just: "—", origem: { doc: "Inserido manualmente", pag: "—" } }); renderChecklist($("#clHost-" + sec), currentChecklists[sec], sec); }

/* ============================================================
   Wire
   ============================================================ */
function wire() {
  $("#filterTabs").addEventListener("click", e => { const b = e.target.closest("[data-filter]"); if (b) { statusFilter = b.dataset.filter; prefs.filter = statusFilter; savePrefs(); renderGrid(); } });
  $("#cardGrid").addEventListener("click", e => { const c = e.target.closest("[data-item]"); if (c) openTable(+c.dataset.item); });
  $("#exportBtn").onclick = () => toast("Exportando análise (PDF · planilha · resumo técnico)…");
  $("#page").addEventListener("click", e => { const a = e.target.closest("[data-act]"); if (a) toast(a.dataset.act === "conclude" ? "Análise concluída" : "Revisão da IA solicitada"); });

  const diffBtn = $("#diffToggle"), confBtn = $("#confToggle"), ov = $("#tableOverlay");
  diffBtn.onclick = () => { const on = !diffBtn.classList.contains("on"); diffBtn.classList.toggle("on", on); ov.classList.toggle("diff-only", on); prefs.diff = on; savePrefs(); };
  confBtn.onclick = () => { const on = !confBtn.classList.contains("on"); confBtn.classList.toggle("on", on); ov.classList.toggle("show-conf", on); prefs.conf = on; savePrefs(); };
  $("#toClose").onclick = closeTable;
  $("#toExport").onclick = () => toast("Exportando análise (PDF · planilha · resumo técnico)…");
  $("#toShare").onclick = () => toast("Link da análise copiado — compartilhe para validação (engenharia, fornecedor, gestor)");

  const tb = $("#toBody");
  tb.addEventListener("pointerdown", e => {
    const rz = e.target.closest("[data-resize]"); if (!rz) return;
    e.preventDefault(); rz.classList.add("active");
    const key = rz.dataset.resize, startX = e.clientX, startW = COLW(key);
    const move = ev => { colW[key] = Math.max(90, Math.round(startW + (ev.clientX - startX))); scheduleRender(); };
    const up = () => { saveCols(); window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); renderMatrix(); };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
  });
  tb.addEventListener("click", e => {
    const pin = e.target.closest("[data-pin]"); if (pin) { const k = pin.dataset.pin; frozen.has(k) ? frozen.delete(k) : frozen.add(k); saveCols(); renderMatrix(); return; }
    const tg = e.target.closest("[data-toggle]"); if (tg) { toggleStatus(+tg.dataset.ri, +tg.dataset.ci); return; }
    const ch = e.target.closest("[data-choose]"); if (ch) { const i = +ch.dataset.choose; prefs.chosen[active] = (prefs.chosen[active] === i) ? undefined : i; if (prefs.chosen[active] == null) delete prefs.chosen[active]; savePrefs(); renderMatrix(); renderSummary(); toast(prefs.chosen[active] != null ? `Produto escolhido: ${SKUS[i].model}` : "Seleção removida"); return; }
    const or = e.target.closest("[data-origin]"); if (or) { openOriginSpec(SPECS[+or.dataset.origin]); return; }
    const q = e.target.closest("[data-question]"); if (q) { toast(`Abrindo questionamento/impugnação — "${SPECS[+q.dataset.question].req}" (referente ao edital)`); return; }
    if (e.target.closest("#addReq")) { addReq(); return; }
    const cs = e.target.closest("[data-clstatus]"); if (cs) { const [s, r] = cs.dataset.clstatus.split(":").map(Number); toggleClStatus(s, r); return; }
    const co = e.target.closest("[data-clorigin]"); if (co) { const [s, r] = co.dataset.clorigin.split(":").map(Number); openOriginSpec(currentChecklists[s][r]); return; }
    const cq = e.target.closest("[data-clquestion]"); if (cq) { const [s, r] = cq.dataset.clquestion.split(":").map(Number); toast(`Abrindo questionamento/impugnação — "${currentChecklists[s][r].req}" (referente ao edital)`); return; }
    const ac = e.target.closest("[data-addcl]"); if (ac) { addClReq(+ac.dataset.addcl); return; }
  });
  $("#toCta").addEventListener("click", e => {
    const b = e.target.closest("[data-cta]"); if (!b) return;
    const m = { add: "✓ Item adicionado à proposta", question: "Abrindo fluxo de questionamento / impugnação…", discard: "Item descartado" };
    toast(m[b.dataset.cta] || "Ação");
  });
  tb.addEventListener("focusout", e => { const el = e.target.closest("[data-edit]"); if (el) commitEdit(el); });
  tb.addEventListener("keydown", e => { if (e.key === "Enter" && e.target.closest("[data-edit]")) { e.preventDefault(); e.target.blur(); } });

  $("#drawerClose").onclick = closeOrigin; $("#drawerOverlay").onclick = closeOrigin;
  document.addEventListener("keydown", e => { if (e.key === "Escape") { if (!$("#drawer").hidden) closeOrigin(); else if (!$("#tableOverlay").hidden) closeTable(); } });
}

/* ---------- tooltip próprio ---------- */
function initTooltip() {
  const tip = document.createElement("div"); tip.className = "tt"; document.body.appendChild(tip);
  let cur = null;
  const place = el => { const r = el.getBoundingClientRect(); let top = r.top - tip.offsetHeight - 8; if (top < 6) top = r.bottom + 8; let left = r.left + r.width / 2 - tip.offsetWidth / 2; left = Math.max(6, Math.min(left, innerWidth - tip.offsetWidth - 6)); tip.style.top = top + "px"; tip.style.left = left + "px"; };
  const hide = () => { tip.classList.remove("show"); cur = null; };
  document.addEventListener("mouseover", e => {
    const el = e.target.closest("[data-tip],[title]"); if (!el || el === cur) return;
    if (el.hasAttribute("title")) { const t = el.getAttribute("title"); if (t) el.setAttribute("data-tip", t); el.removeAttribute("title"); }
    const txt = el.getAttribute("data-tip"); if (!txt) return;
    cur = el; tip.textContent = txt; tip.classList.add("show"); place(el);
  });
  document.addEventListener("mouseout", e => { if (cur && (!e.relatedTarget || !cur.contains(e.relatedTarget))) hide(); });
  document.addEventListener("click", hide);
  window.addEventListener("scroll", hide, true);
}

/* boot */
renderGrid(); wire(); initTooltip();
