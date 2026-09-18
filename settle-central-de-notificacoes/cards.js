/* =====================================================================
 * cards.js — Manifestações como cards + modal de mensagem completa
 * ---------------------------------------------------------------------
 * Card mostra: tipo, autor/timestamp e um PREVIEW da mensagem.
 * Quando há conteúdo extra (mensagem longa, resposta ou anexos), exibe
 * "Visualizar mensagem completa" → abre um MODAL com tudo.
 * Aviso curto (sem resposta/anexo) fica inline, sem modal.
 * ===================================================================== */

const app = document.getElementById('app');
// Preview do card: texto original truncado por nº de caracteres (sem resumo).
const TRUNCATE_LIMIT = 300; // limite x — ajustável
let activeTab = 'todas';
let items = [];

// Tabs primárias do workspace. Manifestações é a única "viva" no protótipo;
// Itens/Análise servem para demonstrar a regra do indicador de "novo".
const WS_TABS = [
  { id: 'itens', label: 'Itens' },
  { id: 'analise', label: 'Análise técnica' },
  { id: 'manifestacoes', label: 'Manifestações', beta: true },
];
let wsActive = 'manifestacoes';
// Cards "novos" (não vistos). Regra: ao SAIR da tab Manifestações, os novos
// exibidos passam a "vistos". Como Itens é a 1ª tab aberta (não Manifestações),
// sempre há algo novo na primeira visita.
let novos = new Set();
// Estado da sidebar auxiliar "Arquivos da licitação" (aberta pelo 👁 do anexo).
let auxState = null;

const ICON_CLIP = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21.4 11.05 12.25 20.2a5 5 0 0 1-7.07-7.07l8.49-8.49a3 3 0 0 1 4.24 4.24l-8.49 8.49a1 1 0 0 1-1.41-1.41l7.78-7.78"/></svg>';
const ICON_X = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>';
const ICON_DL = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12m0 0 4-4m-4 4-4-4"/><path d="M5 21h14"/></svg>';
const ICON_FILE = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M16 3H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8z"/></svg>';
const ICON_EYE = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>';
const ICON_CHEVRON_DOWN = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>';

// Status do recurso -> reaproveita os chips existentes (.chip--*)
const STATUS_RECURSO = {
  em_andamento: { label: 'Em andamento', cls: 'chip--pend' },
  provido:      { label: 'Provido',      cls: 'chip--ok' },
  improvido:    { label: 'Improvido',    cls: 'chip--info' },
};

NCData.fetchPage({ licitacaoId: 'pe12', limit: 50 }).then((r) => {
  items = r.items;
  novos = new Set(items.filter((i) => !i.lida).map((i) => i.id)); // novos = não lidos
  render();
});

/* ---------- Helpers ---------- */
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
// Data + hora pontual (não "Há X min"). Formato do Figma 8486-6904: "DD/MM/AAAA às HH:MM".
function formatTimestamp(date) {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} às ${hh}:${mi}`;
}
// Recurso tem autor (nome/doc/papel); aviso, questionamento e impugnação não —
// a base não guarda esse campo de forma isolada (Diego confirma a impugnação).
function temAutor(categoria) { return categoria === 'recurso'; }

/* ---------- Render ---------- */
function render() {
  const tabsHtml = NCData.TABS.map((t) => {
    const n = t.id === 'todas'
      ? items.length
      : items.filter((i) => NCData.tabDaCategoria(i.categoria) === t.id).length;
    return `<button class="tab${t.id === activeTab ? ' is-active' : ''}" data-tab="${t.id}">${t.label}<span class="tab-count">${n}</span></button>`;
  }).join('');

  const filtered = activeTab === 'todas'
    ? items
    : items.filter((i) => NCData.tabDaCategoria(i.categoria) === activeTab);

  const wsTabsHtml = WS_TABS.map((t) => `
    <button class="ws-tab${wsActive === t.id ? ' is-active' : ''}" data-ws="${t.id}">${t.label}${t.beta ? '<span class="ws-badge">Versão beta</span>' : ''}</button>`).join('');

  const conteudo = wsActive === 'manifestacoes'
    ? `<section class="panel">
         <nav class="tabs">${tabsHtml}</nav>
         <div class="cards">${filtered.map(cardHtml).join('')}</div>
       </section>`
    : `<section class="panel panel--ph">Conteúdo de “${WS_TABS.find((t) => t.id === wsActive).label}” — fora do escopo deste protótipo.</section>`;

  app.innerHTML = `
    <header class="app-head">
      <nav class="ws-tabs" aria-label="Seções da licitação">${wsTabsHtml}</nav>
    </header>
    ${conteudo}`;

  // Tabs do workspace: ao SAIR de Manifestações, os novos exibidos viram "vistos".
  app.querySelectorAll('[data-ws]').forEach((b) =>
    b.addEventListener('click', () => {
      const alvo = b.dataset.ws;
      if (alvo === wsActive) return;
      if (wsActive === 'manifestacoes') novos.clear();
      wsActive = alvo;
      render();
    }));

  if (wsActive !== 'manifestacoes') return; // placeholder: nada a ligar

  app.querySelectorAll('[data-tab]').forEach((b) =>
    b.addEventListener('click', () => { activeTab = b.dataset.tab; render(); }));
  // Card clicável, MAS permitindo selecionar texto: se houve arrasto (seleção)
  // ou existe texto selecionado, não abre o modal.
  app.querySelectorAll('.card.is-clickable').forEach((c) => {
    let sx = 0, sy = 0;
    c.addEventListener('mousedown', (e) => { sx = e.clientX; sy = e.clientY; });
    c.addEventListener('click', (e) => {
      const arrastou = Math.abs(e.clientX - sx) > 4 || Math.abs(e.clientY - sy) > 4;
      const selecionou = window.getSelection && String(window.getSelection()).length > 0;
      if (arrastou || selecionou) return;
      openModal(c.dataset.id);
    });
  });

  // Dropdown "+N anexos": abre/fecha o menu com os anexos colapsados.
  app.querySelectorAll('.anexo-more').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const menu = btn.parentElement.querySelector('.anexo-menu');
      const isOpen = !menu.hasAttribute('hidden');
      closeAnexoMenus();
      if (!isOpen) menu.removeAttribute('hidden');
    });
  });
}

// Fecha dropdowns ao clicar fora ou apertar Esc (uma vez, no nível do documento).
document.addEventListener('click', closeAnexoMenus);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeAnexoMenus(); closeAux(); } });

// Largura é dinâmica: ao redimensionar, o overflow muda, então re-renderiza.
let _rzT;
window.addEventListener('resize', () => {
  clearTimeout(_rzT);
  _rzT = setTimeout(render, 150);
});

function truncar(t) {
  const clean = String(t || '').replace(/\s+/g, ' ').trim();
  return clean.length > TRUNCATE_LIMIT ? clean.slice(0, TRUNCATE_LIMIT).trimEnd() + '…' : clean;
}

function cardHtml(item) {
  const cat = NCData.CATEGORIAS[item.categoria];
  const isAviso = item.categoria === 'aviso';
  const isUnread = !item.lida && !isAviso;
  const autorPrefix = (temAutor(item.categoria) && item.autor) ? escapeHtml(item.autor) + ' · ' : '';
  const dot = novos.has(item.id) ? '<span class="new-dot" title="Novo"></span>' : '';

  // Com resposta → formato e-mail (Figma 8526-34300): resposta em cima, mensagem
  // embaixo, cada uma com sua data. Sem resposta → data + texto único.
  let corpo;
  if (item.etapas) {
    // Recurso: mesma lógica de e-mail — última etapa (atualização) em cima, origem embaixo.
    const ult = item.ultimaEtapa || item.etapas[item.etapas.length - 1];
    const pri = item.etapas[0];
    corpo = `
      <div class="card-meta">${formatTimestamp(ult.date)}</div>
      <p class="card-msg"><strong>${escapeHtml(ult.etapa)}:</strong> ${escapeHtml(truncar(ult.texto))}</p>
      <div class="card-meta">${formatTimestamp(pri.date)}</div>
      <p class="card-msg"><strong>${escapeHtml(pri.etapa)}:</strong> ${escapeHtml(truncar(pri.texto))}</p>`;
  } else if (item.resposta) {
    corpo = `
      <div class="card-meta">${formatTimestamp(item.date)}</div>
      <p class="card-msg"><strong>Resposta:</strong> ${escapeHtml(truncar(item.resposta.texto))}</p>
      <div class="card-meta">${formatTimestamp(item.dateMensagem || item.date)}</div>
      <p class="card-msg"><strong>Mensagem:</strong> ${escapeHtml(truncar(item.mensagemCompleta || item.mensagem || ''))}</p>`;
  } else {
    corpo = `
      <div class="card-meta">${autorPrefix}${formatTimestamp(item.date)}</div>
      <p class="card-msg">${escapeHtml(truncar(item.mensagemCompleta || item.mensagem || ''))}</p>`;
  }

  return `
    <article class="card card--${item.categoria}${isUnread ? ' is-unread' : ''} is-clickable" data-id="${item.id}">
      <div class="card-top">${dot}<span class="badge badge--${item.categoria}">${cat.label}</span></div>
      ${corpo}
      ${cardAnexosHtml(item)}
    </article>`;
}

/* Ações de um anexo: 👁 abre a sidebar "Arquivos da licitação"; ⬇ baixa.
 * stopPropagation evita abrir o modal do card ao clicar nos botões. */
function anexoActions(itemId, idx) {
  return `<button class="ic-btn ic-btn--solid" title="Visualizar" onclick="event.stopPropagation();openAux('${itemId}',${idx});return false;">${ICON_EYE}</button>`
       + `<button class="ic-btn ic-btn--solid" title="Baixar" onclick="event.stopPropagation();return false;">${ICON_DL}</button>`;
}

/* Seção de anexos inline no card (Figma 8486-6904): label + chips com ícone,
 * nome/tamanho e ações (visualizar / baixar). "+N" quando excede o limite. */
function cardAnexosHtml(item) {
  if (!item.anexos || !item.anexos.length) return '';
  const MAX = 3;
  const visiveis = item.anexos.slice(0, MAX);
  const resto = item.anexos.length - visiveis.length;
  const stop = 'onclick="event.stopPropagation();return false;"';

  const chips = visiveis.map((a, i) => `
    <div class="anexo-chip">
      <span class="anexo-chip-ic">${ICON_FILE}</span>
      <span class="anexo-chip-txt">
        <span class="anexo-chip-name" title="${escapeHtml(a.nome)}">${escapeHtml(a.nome)}</span>
        <span class="anexo-chip-size">${escapeHtml(a.tamanho || '')}</span>
      </span>
      <span class="anexo-chip-actions">${anexoActions(item.id, i)}</span>
    </div>`).join('');

  const menuRows = item.anexos.slice(MAX).map((a, i) => `
    <div class="anexo-menu-row">
      <span class="anexo-chip-ic">${ICON_FILE}</span>
      <span class="anexo-chip-txt">
        <span class="anexo-chip-name" title="${escapeHtml(a.nome)}">${escapeHtml(a.nome)}</span>
        <span class="anexo-chip-size">${escapeHtml(a.tamanho || '')}</span>
      </span>
      <span class="anexo-chip-actions">${anexoActions(item.id, i + MAX)}</span>
    </div>`).join('');

  const mais = resto > 0
    ? `<div class="anexo-more-wrap">
        <button class="ic-btn ic-btn--soft anexo-more" aria-haspopup="true" title="Ver mais ${resto} anexo(s)">+${resto}</button>
        <div class="anexo-menu" hidden onclick="event.stopPropagation();">
          <div class="anexo-menu-head">
            <span class="anexo-menu-title">Arquivos da Licitação</span>
            <button class="anexo-menu-all" title="Baixar todos os anexos" ${stop}>${ICON_DL}Baixar todos</button>
          </div>
          <div class="anexo-menu-list">${menuRows}</div>
        </div>
      </div>`
    : '';

  return `
    <div class="card-sep"></div>
    <div class="anexos-sec">
      <div class="anexos-label">Anexos</div>
      <div class="anexos-row">${chips}${mais}</div>
    </div>`;
}

/* Fecha qualquer dropdown de anexos aberto. */
function closeAnexoMenus() {
  document.querySelectorAll('.anexo-menu').forEach((m) => m.setAttribute('hidden', ''));
}

/* ---------- Sidebar auxiliar: Arquivos da licitação (padrão Multitasking) ----------
 * Abre pelo 👁 de um anexo. Mostra um seletor de arquivo + visualizador (mock).
 * Reprodução simplificada — o engine responsivo completo vive no projeto Codex. */
function openAux(itemId, idx) {
  const item = items.find((i) => i.id === itemId);
  if (!item || !item.anexos || !item.anexos.length) return;
  // Dentro do modal a sidebar ficaria ATRÁS dele: abrimos a pré-visualização
  // como modal empilhado. Fora do modal (pelo card), abrimos a sidebar.
  if (document.querySelector('.modal-backdrop')) {
    openPreviewModal(item.anexos, idx);
    return;
  }
  auxState = { files: item.anexos, idx };
  renderAux();
  document.body.classList.add('aux-open');
}
function closeAux() { document.body.classList.remove('aux-open'); }

/* Seletor de arquivo (pílula cinza, source-select-wrap) e página de visualização
 * (source-page) — alinhados ao design Settle, compartilhados sidebar/modal. */
function auxSelectWrap(files, idx) {
  return `<div class="aux-select-wrap">
    <select class="aux-select" aria-label="Selecionar arquivo">${files.map((a, k) =>
      `<option value="${k}"${k === idx ? ' selected' : ''}>${escapeHtml(a.nome)}</option>`).join('')}</select>
    <span class="aux-chevron">${ICON_CHEVRON_DOWN}</span>
  </div>`;
}
function auxPageHtml() {
  // Nome do arquivo está na pílula do header; o card mostra o conteúdo (mock).
  return `
    <div class="aux-page">
      <div class="aux-skel">${'<span></span>'.repeat(16)}</div>
    </div>`;
}
/* source-header compartilhado: seletor de arquivo + baixar + fechar (ghost). */
function auxHeadHtml(files, idx, closeAttr) {
  return `
    <div class="aux-head">
      ${auxSelectWrap(files, idx)}
      <button class="aux-icon-btn" title="Baixar" onclick="event.stopPropagation();return false;">${ICON_DL}</button>
      <button class="aux-icon-btn" ${closeAttr} title="Fechar">${ICON_X}</button>
    </div>`;
}
function renderAux() {
  const aux = document.getElementById('aux');
  if (!aux || !auxState) return;
  const { files, idx } = auxState;
  aux.innerHTML = `${auxHeadHtml(files, idx, 'data-aux-close')}<div class="aux-body">${auxPageHtml(files[idx])}</div>`;
  aux.querySelector('[data-aux-close]').addEventListener('click', closeAux);
  aux.querySelector('.aux-select').addEventListener('change', (e) => {
    auxState.idx = Number(e.target.value);
    renderAux();
  });
}

/* Pré-visualização em MODAL empilhada (aberta de dentro do modal de manifestação).
 * Fechar (X / clique fora) volta ao modal anterior. */
function openPreviewModal(files, startIdx) {
  let idx = startIdx;
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop preview-backdrop';
  const close = () => backdrop.remove();
  const draw = () => {
    backdrop.innerHTML = `
      <div class="modal preview-modal" role="dialog" aria-modal="true">
        ${auxHeadHtml(files, idx, 'data-pclose')}
        <div class="aux-body">${auxPageHtml(files[idx])}</div>
      </div>`;
    backdrop.querySelector('[data-pclose]').addEventListener('click', close);
    backdrop.querySelector('.aux-select').addEventListener('change', (e) => { idx = Number(e.target.value); draw(); });
  };
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
  draw();
  document.body.appendChild(backdrop);
}

/* Corpo do modal de recurso: cada etapa como um bloco de campo (estilo mensagem/resposta). */
function recursoFieldsHtml(item) {
  // Ordem de e-mail: etapa mais recente em cima (Julgamento → … → Intenção e razões).
  return [...item.etapas].reverse().map((e) => `
    <div class="field">
      <div class="field-label">${escapeHtml(e.etapa)} <span class="field-date">· ${formatTimestamp(e.date)}</span></div>
      <div class="field-sub">${escapeHtml(e.autor)}${e.documento ? ' · ' + escapeHtml(e.documento) : ''}</div>
      <div class="field-text">${escapeHtml(e.texto)}</div>
      ${e.anexos && e.anexos.length ? `<div class="anexo-list anexo-list--field">${e.anexos.map((a) => `
        <div class="anexo-row">
          <span class="anexo-chip-ic">${ICON_FILE}</span>
          <span class="anexo-chip-txt">
            <span class="anexo-chip-name" title="${escapeHtml(a.nome)}">${escapeHtml(a.nome)}</span>
            <span class="anexo-chip-size">${escapeHtml(a.tamanho || '')}</span>
          </span>
          <span class="anexo-chip-actions">${anexoActions(item.id, a._gidx != null ? a._gidx : 0)}</span>
        </div>`).join('')}</div>` : ''}
    </div>`).join('');
}

/* ---------- Modal: mensagem completa ---------- */
function anexosHtml(item) {
  if (!item.anexos || !item.anexos.length) return '';
  const stop = 'onclick="event.stopPropagation();return false;"';
  return `
    <div class="field">
      <div class="field-label">Anexos</div>
      <div class="anexo-list">${item.anexos.map((a, i) => `
        <div class="anexo-row">
          <span class="anexo-chip-ic">${ICON_FILE}</span>
          <span class="anexo-chip-txt">
            <span class="anexo-chip-name" title="${escapeHtml(a.nome)}">${escapeHtml(a.nome)}</span>
            <span class="anexo-chip-size">${escapeHtml(a.tamanho || '')}</span>
          </span>
          <span class="anexo-chip-actions">${anexoActions(item.id, i)}</span>
        </div>`).join('')}</div>
    </div>`;
}

function openModal(id) {
  const item = items.find((i) => i.id === id);
  if (!item) return;

  closeAux(); // abrir o modal fecha a sidebar de arquivos

  // Abrir o card = visto: some a bolinha de "novo" daquele card na hora.
  if (novos.delete(id)) {
    const dot = app.querySelector(`.card[data-id="${id}"] .new-dot`);
    if (dot) dot.remove();
  }

  // Recurso: cabeçalho com status + corpo = timeline (intenção → ... → julgamento).
  const isRecurso = !!item.etapas;
  const cat = NCData.CATEGORIAS[item.categoria];
  const full = item.mensagemCompleta || item.mensagem || '';

  // dialog-05: o header tem só UM título (sem badge + subtítulo). A categoria
  // vira o título. As datas vão ao lado de cada prefixo (Mensagem / Resposta).
  const modalTitle = isRecurso ? item.titulo : cat.label;

  const body = isRecurso
    ? recursoFieldsHtml(item)
    : `
        ${item.resposta ? `
          <div class="field">
            <div class="field-label">Resposta <span class="field-date">· ${formatTimestamp(item.date)}</span></div>
            <div class="field-text">${escapeHtml(item.resposta.texto)}</div>
          </div>` : ''}
        <div class="field">
          <div class="field-label">Mensagem <span class="field-date">· ${formatTimestamp(item.dateMensagem || item.date)}</span></div>
          <div class="field-text">${escapeHtml(full)}</div>
        </div>
        ${anexosHtml(item)}`;

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true">
      <div class="modal-head">
        <h2 class="modal-title">${escapeHtml(modalTitle)}</h2>
        <button class="modal-close" data-close title="Fechar">${ICON_X}</button>
      </div>
      <div class="modal-body">
        <div class="modal-fields">${body}</div>
      </div>
    </div>`;

  document.body.appendChild(backdrop);
  const close = () => { document.querySelector('.preview-backdrop')?.remove(); backdrop.remove(); };
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
  backdrop.querySelectorAll('[data-close]').forEach((el) => el.addEventListener('click', close));
  document.addEventListener('keydown', function esc(e) {
    if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
  });
}
