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
const TRUNCATE_LIMIT = 745; // p50 (~745 chars): mediana cabe inteira; altura ok mesmo em telas menores
let activeTab = 'todas';
let items = [];

// Ordenação (botão "Ordenar"): traz o grupo escolhido ao topo, mantendo a ordem
// por data dentro de cada grupo. 'nenhum' = ordem padrão (cronológica desc).
let sortMode = 'nenhum';
const SORT_OPTIONS = [
  { id: 'nenhum', label: 'Nenhum' },
  { id: 'com-resposta', label: 'Manifestações com resposta' },
  { id: 'aguardando', label: 'Manifestações aguardando resposta' },
];

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
const ICON_INBOX = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>';
const ICON_GLOBE = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
const ICON_EXTLINK = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>';
const ICON_CHECK = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
// Ícones do header (navbar) da licitação.
const ICON_SIDEBAR = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/></svg>';
const ICON_CHEVRON_RIGHT = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>';
const ICON_LINK2 = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';
const ICON_SHARE = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98M15.41 6.51 8.59 10.49"/></svg>';
const ICON_DOC2 = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>';
const ICON_FOLDER = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2z"/></svg>';
const ICON_CHAT = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
const ICON_PLUS = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>';

// Arquivos de demonstração para o painel "Arquivos da Licitação".
const ARQUIVOS_EDITAL = [
  { nome: 'Edital_Pregao_Eletronico_12-2026.pdf', tamanho: '2.4 MB' },
  { nome: 'Termo_de_Referencia.pdf', tamanho: '890 KB' },
  { nome: 'Minuta_do_Contrato.pdf', tamanho: '512 KB' },
];
// O caso do debate: arquivos de manifestação sem vínculo (só título + data de upload).
const ARQUIVOS_SEM_VINCULO = [
  { nome: 'Impugnacao_item_4-2_capacidade_tecnica.pdf', data: new Date(2026, 5, 9, 16, 20), tamanho: '318 KB' },
  { nome: 'Resposta_pregoeiro_documento_digitalizado.pdf', data: new Date(2026, 5, 10, 9, 5), tamanho: '204 KB' },
  { nome: 'Manifestacao_sem_identificacao_0873.pdf', data: new Date(2026, 5, 8, 14, 2), tamanho: '1.2 MB' },
];

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
    const count = t.demo ? '' : `<span class="tab-count">${t.id === 'todas' ? items.length : items.filter((i) => NCData.tabDaCategoria(i.categoria) === t.id).length}</span>`;
    return `<button class="tab${t.id === activeTab ? ' is-active' : ''}" data-tab="${t.id}">${t.label}${count}</button>`;
  }).join('');

  const filtered = activeTab === 'todas'
    ? items
    : items.filter((i) => NCData.tabDaCategoria(i.categoria) === activeTab);

  // "Ordenar": traz o grupo escolhido ao topo. Sort estável → mantém a ordem
  // por data (já vinda do buildAll) dentro de cada grupo.
  const ehDoGrupo = (i) => sortMode === 'com-resposta'
    ? !!i.resposta
    : (i.categoria === 'esclarecimento' || i.categoria === 'impugnacao') && !i.resposta;
  const lista = sortMode === 'nenhum'
    ? filtered
    : [...filtered].sort((a, b) => (ehDoGrupo(b) ? 1 : 0) - (ehDoGrupo(a) ? 1 : 0));

  const isDemo = activeTab === 'demo-vazio' || activeTab === 'demo-portal';
  const sortWrap = isDemo ? '' : `
    <div class="sort-wrap">
      <button class="sort-btn" data-sort-toggle aria-haspopup="true">Ordenar</button>
      <div class="sort-menu" hidden onclick="event.stopPropagation();">
        ${SORT_OPTIONS.map((o) => `<button class="sort-item${o.id === sortMode ? ' is-active' : ''}" data-sort="${o.id}"><span class="sort-check">${o.id === sortMode ? ICON_CHECK : ''}</span>${o.label}</button>`).join('')}
      </div>
    </div>`;

  // Conteúdo do painel: cards OU um empty state (tabs de demonstração).
  let panelInner;
  if (activeTab === 'demo-vazio') panelInner = emptyStateHtml('vazio');
  else if (activeTab === 'demo-portal') panelInner = emptyStateHtml('portal');
  else panelInner = `<div class="cards">${lista.map(cardHtml).join('')}</div>`;

  const wsTabsHtml = WS_TABS.map((t) => `
    <button class="ws-tab${wsActive === t.id ? ' is-active' : ''}" data-ws="${t.id}">${t.label}${t.beta ? '<span class="ws-badge">Versão beta</span>' : ''}</button>`).join('');

  const conteudo = wsActive === 'manifestacoes'
    ? `<section class="panel"><div class="tabs-row"><nav class="tabs">${tabsHtml}</nav>${sortWrap}</div>${panelInner}</section>`
    : `<section class="panel panel--ph">Conteúdo de “${WS_TABS.find((t) => t.id === wsActive).label}” — fora do escopo deste protótipo.</section>`;

  app.innerHTML = `
    ${navbarHtml()}
    <div class="page">
      <header class="app-head">
        <nav class="ws-tabs" aria-label="Seções da licitação">${wsTabsHtml}</nav>
      </header>
      ${conteudo}
    </div>`;

  // Header: a pasta "Visualizar arquivos" abre o painel consolidado (vale em qualquer aba).
  app.querySelector('[data-arquivos]')?.addEventListener('click', (e) => { e.stopPropagation(); openArquivos(); });

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

  // Botão "Ordenar": abre/fecha o menu de seleção única.
  const sortToggle = app.querySelector('[data-sort-toggle]');
  if (sortToggle) {
    sortToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const menu = sortToggle.parentElement.querySelector('.sort-menu');
      const isOpen = !menu.hasAttribute('hidden');
      closeAnexoMenus(); closeSortMenu();
      if (!isOpen) menu.removeAttribute('hidden');
    });
  }
  app.querySelectorAll('[data-sort]').forEach((b) =>
    b.addEventListener('click', (e) => { e.stopPropagation(); sortMode = b.dataset.sort; render(); }));
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
document.addEventListener('click', () => { closeAnexoMenus(); closeSortMenu(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeAnexoMenus(); closeSortMenu(); closeAux(); } });

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

/* Estados vazios (tabs de demonstração). */
function emptyStateHtml(tipo) {
  if (tipo === 'portal') {
    return `
      <div class="empty-state">
        <span class="empty-ic">${ICON_GLOBE}</span>
        <div class="empty-title">Captura automática indisponível</div>
        <p class="empty-text">Este portal ainda não é capturado automaticamente pela Settle. Acompanhe as manifestações diretamente no portal oficial da licitação.</p>
        <a class="btn-portal" href="https://www.gov.br/pncp" target="_blank" rel="noopener">Abrir no portal ${ICON_EXTLINK}</a>
      </div>`;
  }
  return `
    <div class="empty-state">
      <span class="empty-ic">${ICON_INBOX}</span>
      <div class="empty-title">Nenhuma manifestação ainda</div>
      <p class="empty-text">Não há avisos, questionamentos ou impugnações registrados para esta licitação até o momento. Assim que algo for publicado, aparece aqui automaticamente.</p>
    </div>`;
}

function cardHtml(item) {
  const cat = NCData.CATEGORIAS[item.categoria];
  const isAviso = item.categoria === 'aviso';
  const isUnread = !item.lida && !isAviso;

  // Status (questionamento/impugnação): Respondido (success) ou Aguardando resposta (warning).
  let statusBadge = '';
  if (item.categoria === 'esclarecimento' || item.categoria === 'impugnacao') {
    statusBadge = item.resposta
      ? '<span class="badge badge--success">Respondido</span>'
      : '<span class="badge badge--warning">Aguardando resposta</span>';
  }

  // Data da última atualização da thread (mensagem ou resposta mais recente); a lista ordena por ela.
  const capturado = `<div class="card-captured"><span class="cap-hi">Atualizado</span> em <span class="cap-hi">${formatTimestamp(item.dateAtualizacao || item.date)}</span></div>`;

  // Cada bloco numa caixa com borda, com sua própria data. Mensagem (origem) primeiro.
  const box = (date, label, texto) => `
    <div class="card-box">
      <div class="card-box-date">${formatTimestamp(date)}</div>
      <div class="card-box-text">${label ? `<strong>${label}</strong> ` : ''}${escapeHtml(truncar(texto))}</div>
    </div>`;

  let boxes;
  if (item.etapas) {
    const pri = item.etapas[0];
    const ult = item.ultimaEtapa || item.etapas[item.etapas.length - 1];
    boxes = box(pri.date, escapeHtml(pri.etapa) + ':', pri.texto)
          + box(ult.date, escapeHtml(ult.etapa) + ':', ult.texto);
  } else if (item.resposta) {
    boxes = box(item.dateMensagem || item.date, 'Mensagem:', item.mensagemCompleta || item.mensagem || '')
          + box(item.date, 'Resposta:', item.resposta.texto);
  } else {
    boxes = box(item.dateMensagem || item.date, 'Mensagem:', item.mensagemCompleta || item.mensagem || '');
  }

  return `
    <article class="card card--${item.categoria}${isUnread ? ' is-unread' : ''} is-clickable" data-id="${item.id}">
      <div class="card-top"><span class="badge badge--${item.categoria}">${cat.label}</span>${statusBadge}</div>
      ${capturado}
      ${boxes}
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

  // "Baixar todos" só faz sentido com mais de 1 anexo.
  const baixarTodos = item.anexos.length > 1
    ? `<button class="btn-baixar-todos" title="Baixar todos os anexos" ${stop}>Baixar todos</button>`
    : '';

  return `
    <div class="anexos-sec">
      <div class="anexos-head">
        <span class="anexos-label">Anexos</span>
        ${baixarTodos}
      </div>
      <div class="anexos-row">${chips}${mais}</div>
    </div>`;
}

/* Fecha qualquer dropdown de anexos aberto. */
function closeAnexoMenus() {
  document.querySelectorAll('.anexo-menu').forEach((m) => m.setAttribute('hidden', ''));
}

/* Fecha o menu do botão "Ordenar". */
function closeSortMenu() {
  document.querySelectorAll('.sort-menu').forEach((m) => m.setAttribute('hidden', ''));
}

/* ---------- Header (navbar) da licitação ---------- */
function navbarHtml() {
  return `
    <div class="navbar">
      <div class="nav-left">
        <button class="nav-ic nav-ic--ghost" title="Recolher menu">${ICON_SIDEBAR}</button>
        <span class="nav-div"></span>
        <nav class="breadcrumb" aria-label="Trilha">
          <span class="bc-muted">Licitações</span>${ICON_CHEVRON_RIGHT}
          <span class="bc-muted">Em andamento</span>${ICON_CHEVRON_RIGHT}
          <span class="bc-current">Pregão Eletrônico nº 12/2026</span>
        </nav>
      </div>
      <div class="nav-right">
        <button class="btn-soft">Ignorar</button>
        <button class="btn-solid">Enviar para Workflow</button>
        <span class="nav-div"></span>
        <span class="status-pill">Em disputa ou Homologação</span>
        <span class="nav-div"></span>
        <div class="avatars">
          <span class="av av1"></span><span class="av av2"></span><span class="av av3"></span>
          <button class="av-add" title="Adicionar responsável">${ICON_PLUS}</button>
        </div>
        <span class="nav-div"></span>
        <button class="nav-ic" title="Link da licitação">${ICON_LINK2}</button>
        <button class="nav-ic" title="Compartilhar">${ICON_SHARE}</button>
        <button class="nav-ic" title="Atalho do edital">${ICON_DOC2}</button>
        <button class="nav-ic nav-ic--folder" data-arquivos title="Visualizar arquivos">${ICON_FOLDER}</button>
        <button class="nav-ic" title="Comentários">${ICON_CHAT}</button>
      </div>
    </div>`;
}

/* Linha de arquivo no painel consolidado (reaproveita o padrão de anexo). */
function fileRowHtml(nome, sub, idx) {
  return `
    <div class="anexo-row">
      <span class="anexo-chip-ic">${ICON_FILE}</span>
      <span class="anexo-chip-txt">
        <span class="anexo-chip-name" title="${escapeHtml(nome)}">${escapeHtml(nome)}</span>
        <span class="anexo-chip-size">${escapeHtml(sub)}</span>
      </span>
      <span class="anexo-chip-actions">
        <button class="ic-btn ic-btn--solid" data-file-eye="${idx}" title="Visualizar">${ICON_EYE}</button>
        <button class="ic-btn ic-btn--solid" title="Baixar" onclick="event.stopPropagation();return false;">${ICON_DL}</button>
      </span>
    </div>`;
}

/* Painel "Arquivos da Licitação": consolida tudo num lugar, organizado em accordions.
 * É aqui que os arquivos de manifestação SEM VÍNCULO ganham um lar honesto. */
function openArquivos() {
  closeAux();
  // Vinculados: anexos que já pertencem a uma manifestação (mostra de qual).
  const vinculados = [];
  items.forEach((it) => (it.anexos || []).forEach((a) => {
    const cat = NCData.CATEGORIAS[it.categoria];
    vinculados.push({ nome: a.nome, sub: `${cat.label} · ${a.tamanho || ''}` });
  }));

  const groups = [
    { title: 'Edital e anexos', files: ARQUIVOS_EDITAL.map((a) => ({ nome: a.nome, sub: a.tamanho })) },
    { title: 'Manifestações', files: vinculados },
    {
      title: 'Manifestações sem vínculo',
      note: 'Arquivos capturados como manifestação desta licitação, sem vínculo identificado com uma manifestação específica.',
      files: ARQUIVOS_SEM_VINCULO.map((a) => ({ nome: a.nome, sub: `Enviado em ${formatTimestamp(a.data)}` })),
      destaque: true,
    },
  ].filter((g) => g.files.length);

  let idx = 0;
  const flat = [];
  const accHtml = groups.map((g) => {
    const rows = g.files.map((f) => { const i = idx++; flat.push({ nome: f.nome, tamanho: '' }); return fileRowHtml(f.nome, f.sub, i); }).join('');
    return `
      <div class="acc${g.destaque ? ' acc--destaque' : ''}" data-acc>
        <button class="acc-head" data-acc-toggle>
          <span class="acc-chev">${ICON_CHEVRON_DOWN}</span>
          <span class="acc-title">${g.title}</span>
          <span class="acc-count">${g.files.length}</span>
        </button>
        <div class="acc-body">
          ${g.note ? `<p class="acc-note">${g.note}</p>` : ''}
          <div class="anexo-list">${rows}</div>
        </div>
      </div>`;
  }).join('');

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = `
    <div class="modal arquivos-modal" role="dialog" aria-modal="true">
      <div class="modal-head">
        <h2 class="modal-title">Arquivos da Licitação</h2>
        <button class="btn-baixar-todos" title="Baixar todos os arquivos" onclick="event.stopPropagation();return false;">Baixar todos</button>
        <button class="modal-close" data-close title="Fechar">${ICON_X}</button>
      </div>
      <div class="modal-body arquivos-body">${accHtml}</div>
    </div>`;

  document.body.appendChild(backdrop);
  const close = () => backdrop.remove();
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
  backdrop.querySelector('[data-close]').addEventListener('click', close);
  // Accordions: expande/colapsa.
  backdrop.querySelectorAll('[data-acc-toggle]').forEach((h) =>
    h.addEventListener('click', () => h.closest('.acc').classList.toggle('is-collapsed')));
  // 👁 abre a pré-visualização empilhada (o painel já é um modal).
  backdrop.querySelectorAll('[data-file-eye]').forEach((b) =>
    b.addEventListener('click', (e) => { e.stopPropagation(); openPreviewModal(flat, Number(b.dataset.fileEye)); }));
  document.addEventListener('keydown', function esc(e) {
    if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
  });
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
  // Ordem cronológica: origem em cima (Intenção e razões → Contrarrazões → Julgamento).
  return item.etapas.map((e) => `
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
        <div class="field">
          <div class="field-label">Mensagem <span class="field-date">· ${formatTimestamp(item.dateMensagem || item.date)}</span></div>
          <div class="field-text">${escapeHtml(full)}</div>
        </div>
        ${item.resposta ? `
          <div class="field">
            <div class="field-label">Resposta <span class="field-date">· ${formatTimestamp(item.date)}</span></div>
            <div class="field-text">${escapeHtml(item.resposta.texto)}</div>
          </div>` : ''}
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
