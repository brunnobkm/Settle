/* =====================================================================
 * notifications-center.js — Componente reutilizável
 * ---------------------------------------------------------------------
 * Base para a central de notificações da plataforma (doc: "Estrutura do
 * componente reutilizável"). Mesmo componente atende as 3 superfícies:
 *   - Painel/central        -> new NotificationsCenter(el, { mode:'panel' })
 *   - Card da licitação      -> abre o painel filtrado por licitacaoId
 *   - Widget (600px)         -> new NotificationsCenter(el, { mode:'widget', licitacaoId })
 *
 * Implementa: header fixo (título + contador de não-lidas + ações),
 * tabs por categoria, área rolável, item expansível, modal de mensagem
 * completa + resposta + anexos, marcar lida/não-lida, estados
 * (loading/vazio/erro), infinite scroll e pull-to-refresh.
 * ===================================================================== */

/* ---------- Ícones (SVG inline, sem dependência externa) ---------- */
const ICON = {
  x:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
  filter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16M7 12h10M10 19h4"/></svg>',
  bell:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>',
  bellOff:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 9.3-5"/><path d="M18 8c0 7 3 9 3 9H7"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/><path d="m2 2 20 20"/></svg>',
  paperclip:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.4 11.05 12.25 20.2a5 5 0 0 1-7.07-7.07l8.49-8.49a3 3 0 0 1 4.24 4.24l-8.49 8.49a1 1 0 0 1-1.41-1.41l7.78-7.78"/></svg>',
  file:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>',
  download:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12m0 0 4-4m-4 4-4-4"/><path d="M5 21h14"/></svg>',
  check:  '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m20 6-11 11-5-5"/></svg>',
  dot:    '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="6"/></svg>',
  copy:   '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
  sparkle:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.6 5.4L19 9l-5.4 1.6L12 16l-1.6-5.4L5 9l5.4-1.6z"/></svg>',
  alert:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4m0 4h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>',
  inbox:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.4 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.4-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.8 1.1z"/></svg>',
};

const MESES = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
const TRUNCATE_LIMIT = 150; // caracteres da mensagem curta
const PULL_THRESHOLD = 120; // px de overscroll p/ disparar o pull-to-refresh

/* Timestamp relativo/absoluto conforme as regras do documento. */
function formatTimestamp(date) {
  const min = Math.floor((Date.now() - date.getTime()) / 60000);
  if (min < 1) return 'Agora';
  if (min < 60) return `Há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `Há ${h} h`;
  const d = Math.floor(h / 24);
  if (d <= 6) return `Há ${d} ${d === 1 ? 'dia' : 'dias'}`;
  return `${date.getDate()} de ${MESES[date.getMonth()]} de ${date.getFullYear()}`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

/* Resumo automático sintético (Plus, não obrigatório): inspirado em
 * Apple Mail/Gmail. Aqui é heurístico — no produto viria da API/IA. */
function gerarResumo(texto) {
  const limpo = texto.replace(/\s+/g, ' ').trim();
  const frases = limpo.split(/(?<=[.!?])\s+/);
  return frases.slice(0, 2).join(' ');
}

/* Primeira frase/recorte curto de uma mensagem (para o resumo agregado). */
function primeiraFrase(texto, limite = 96) {
  const s = (texto || '').replace(/\s+/g, ' ').trim();
  const frase = s.split(/(?<=[.!?])\s/)[0] || s;
  return frase.length > limite ? frase.slice(0, limite).trimEnd() + '…' : frase;
}

class NotificationsCenter {
  constructor(container, options = {}) {
    this.el = container;
    this.opts = Object.assign({
      mode: 'panel',          // 'panel' | 'widget'
      density: null,          // 'comfortable' | 'compact' (default: compacto fora do painel)
      licitacaoId: null,      // filtra contexto (card/widget)
      title: 'Manifestações',
      pageSize: 6,
      simulate: 'ok',         // 'ok' | 'empty' | 'error' | 'loading'
      onClose: null,
      showClose: true,
    }, options);
    // Densidade conforme o contexto (doc, pág. 2): sheet/painel usam densidade
    // confortável; widget compacto. O card passa 'compact' explicitamente.
    if (!this.opts.density) {
      this.opts.density = this.opts.mode === 'widget' ? 'compact' : 'comfortable';
    }

    this.items = [];
    this.activeTab = 'todas';
    this.offset = 0;
    this.hasMore = true;
    this.loadingInitial = true;
    this.loadingMore = false;
    this.refreshing = false;
    this.error = false;
    this._pullAccum = 0;

    // Busca (header)
    this.searchOpen = false;
    this.searchQuery = '';

    this._render();
    this._loadInitial();
  }

  /* ---------- Helpers de dados ---------- */
  // Avisos não notificam (decisão da reunião): ficam fora do contador de
  // não-lidas e sem indicador vermelho. Só os tipos críticos notificam.
  get unreadCount() { return this.items.filter((i) => !i.lida && i.categoria !== 'aviso').length; }
  get isQuerying() { return this.searchQuery.trim().length > 0; }

  filteredItems() {
    let items = this.items;
    // 1) Recorte por aba ('recurso' cai sob 'aviso' no MVP).
    if (this.activeTab !== 'todas') {
      items = items.filter((i) => NCData.tabDaCategoria(i.categoria) === this.activeTab);
    }
    // 2) Busca por texto (mensagem, licitação, autor).
    const q = this.searchQuery.trim().toLowerCase();
    if (q) {
      items = items.filter((i) =>
        (i.mensagem || '').toLowerCase().includes(q) ||
        (i.mensagemCompleta || '').toLowerCase().includes(q) ||
        (i.licitacaoInfo && i.licitacaoInfo.label || '').toLowerCase().includes(q) ||
        (i.autor || '').toLowerCase().includes(q)
      );
    }
    return items;
  }

  tabCount(tabId) {
    if (tabId === 'todas') return this.items.length;
    return this.items.filter((i) => NCData.tabDaCategoria(i.categoria) === tabId).length;
  }

  /* ---------- Render da casca ---------- */
  _render() {
    const cls = `nc nc--${this.opts.mode} nc--${this.opts.density}`;
    this.el.innerHTML = this.opts.mode === 'page' ? this._pageShell(cls) : this._sheetShell(cls);

    this.refs = {
      count:      this.el.querySelector('[data-count]'),
      tabs:       this.el.querySelector('[data-tabs]'),
      body:       this.el.querySelector('[data-body]'),
      refresh:    this.el.querySelector('[data-refresh]'),
      list:       this.el.querySelector('[data-list]'),
      newalert:   this.el.querySelector('[data-newalert]'),
      searchbar:  this.el.querySelector('[data-searchbar]'),
      searchInput:this.el.querySelector('[data-search-input]'),
      stats:      this.el.querySelector('[data-stats]'),
      detail:     this.el.querySelector('[data-detail]'),
    };

    const closeBtn = this.el.querySelector('[data-close]');
    if (closeBtn) closeBtn.addEventListener('click', () => this.opts.onClose && this.opts.onClose());

    // Alerta "avisar o usuário": clicar leva ao topo e some.
    this.refs.newalert.addEventListener('click', () => {
      this.refs.body.scrollTop = 0;
      this._hideNewAlert();
    });

    this._bindSearchFilter();
    this.refs.body.addEventListener('scroll', () => this._onScroll());
    this.refs.body.addEventListener('wheel', (e) => this._onWheel(e), { passive: true });
    this._renderTabs();
    this._updateCount();
  }

  /* Casca sheet/widget: header + tabs + lista (drawer estreito). */
  _sheetShell(cls) {
    return `
      <div class="${cls}">
        <div class="nc-list-col">
          <header class="nc-header">
            <h2 class="nc-title">${escapeHtml(this.opts.title)}<span class="nc-count" data-count></span></h2>
            <div class="nc-actions">
              <button class="nc-icon-btn" data-search-toggle title="Buscar">${ICON.search}</button>
              ${this.opts.showClose ? `<button class="nc-icon-btn" data-close title="Fechar">${ICON.x}</button>` : ''}
            </div>
          </header>
          <div class="nc-searchbar" data-searchbar hidden>
            ${ICON.search}
            <input type="text" class="nc-search-input" data-search-input placeholder="Buscar nas manifestações…">
            <button class="nc-icon-btn" data-search-clear title="Fechar busca">${ICON.x}</button>
          </div>
          <nav class="nc-tabs" data-tabs></nav>
          <div class="nc-body-wrap">
            <button class="nc-newalert" data-newalert hidden></button>
            <div class="nc-body" data-body>
              <div class="nc-refresh" data-refresh><span class="nc-spin"></span> Buscando novidades…</div>
              <div class="nc-list" data-list></div>
            </div>
          </div>
        </div>
      </div>`;
  }

  /* Casca página: cards de estatística + master-detail (lista + leitura). */
  _pageShell(cls) {
    return `
      <div class="${cls}">
        <span class="nc-count" data-count hidden></span>
        <div class="nc-stats" data-stats></div>
        <div class="nc-md">
          <div class="nc-md-list">
            <div class="nc-md-toolbar">
              <nav class="nc-tabs" data-tabs></nav>
              <div class="nc-search-box">
                ${ICON.search}
                <input type="text" class="nc-search-input" data-search-input placeholder="Buscar nas manifestações…">
              </div>
            </div>
            <div class="nc-md-listbody" data-body>
              <button class="nc-newalert" data-newalert hidden></button>
              <div class="nc-refresh" data-refresh hidden></div>
              <div class="nc-list" data-list></div>
            </div>
          </div>
          <div class="nc-md-detail" data-detail></div>
        </div>
      </div>`;
  }

  /* ---------- Busca ---------- */
  _bindSearchFilter() {
    const toggle = this.el.querySelector('[data-search-toggle]');
    const clear = this.el.querySelector('[data-search-clear]');
    if (toggle) toggle.addEventListener('click', () => this._toggleSearch());
    if (clear) clear.addEventListener('click', () => this._toggleSearch(false));
    this.refs.searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      this._renderList();
    });
  }

  _toggleSearch(force) {
    this.searchOpen = force !== undefined ? force : !this.searchOpen;
    this.refs.searchbar.hidden = !this.searchOpen;
    if (this.searchOpen) {
      this.refs.searchInput.focus();
    } else {
      this.refs.searchInput.value = '';
      this.searchQuery = '';
      this._renderList();
    }
  }

  _clearQuery() {
    this.searchQuery = '';
    if (this.refs.searchInput) this.refs.searchInput.value = '';
    this._renderList();
  }

  _renderTabs() {
    this.refs.tabs.innerHTML = NCData.TABS.map((t) => {
      const active = t.id === this.activeTab ? ' is-active' : '';
      const n = this.tabCount(t.id);
      const count = this.loadingInitial ? '' : `<span class="nc-tab-count">${n}</span>`;
      return `<button class="nc-tab${active}" data-tab="${t.id}">${t.label}${count}</button>`;
    }).join('');
    this.refs.tabs.querySelectorAll('[data-tab]').forEach((btn) => {
      btn.addEventListener('click', () => this._setTab(btn.dataset.tab));
    });
  }

  _updateCount() {
    const n = this.unreadCount;
    this.refs.count.textContent = n;
    this.refs.count.dataset.zero = String(n === 0);
    if (this.opts.mode !== 'page') this.refs.count.hidden = this.loadingInitial;
  }

  _setTab(tabId) {
    if (tabId === this.activeTab) return;
    this.activeTab = tabId;
    this._renderTabs();
    this._renderList();
  }

  /* ---------- Carga inicial ---------- */
  async _loadInitial() {
    this.loadingInitial = true;
    this.error = false;
    this._renderList();
    try {
      // Na página (tabela) carregamos tudo de uma vez; no sheet, paginado.
      const limit = this.opts.mode === 'page' ? 200 : this.opts.pageSize;
      const { items, hasMore } = await NCData.fetchPage({
        licitacaoId: this.opts.licitacaoId,
        offset: 0,
        limit,
        simulate: this.opts.simulate,
      });
      this.items = items;
      this.offset = items.length;
      this.hasMore = this.opts.mode === 'page' ? false : hasMore;
      this.loadingInitial = false;
    } catch (e) {
      this.loadingInitial = false;
      this.error = true;
    }
    // Página: pré-seleciona o 1º item (preview) para o painel não nascer vazio.
    if (this.opts.mode === 'page' && !this.selectedId && this.items.length) {
      this.selectedId = this.items[0].id;
    }
    this._renderTabs();
    this._updateCount();
    this._renderList();
  }

  /* ---------- Render da lista + estados ---------- */
  _renderList() {
    const body = this.refs.list;

    // Estado: carregando (primeira abertura)
    if (this.loadingInitial) {
      body.innerHTML = this.opts.mode === 'page'
        ? `<div class="nc-state"><span class="nc-spin"></span></div>`
        : Array.from({ length: 4 }).map(() => `
        <div class="nc-skeleton">
          <div class="nc-sk-line" style="width:38%"></div>
          <div class="nc-sk-line" style="width:92%"></div>
          <div class="nc-sk-line" style="width:70%"></div>
        </div>`).join('');
      return;
    }

    // Página: cards de estatística (visão geral, da base completa)
    if (this.opts.mode === 'page') this._renderStats();

    // Estado: erro
    if (this.error) {
      body.innerHTML = `
        <div class="nc-state">
          ${ICON.alert}
          <div class="title">${this.opts.mode === 'widget' ? 'Não foi possível carregar' : 'Nenhuma manifestação encontrada'}</div>
          <div class="desc">Houve uma falha ao carregar as manifestações. Tente novamente.</div>
          <button class="retry" data-retry>Tentar novamente</button>
        </div>`;
      body.querySelector('[data-retry]').addEventListener('click', () => this._loadInitial());
      return;
    }

    const items = this.filteredItems();

    // Estado: nenhum resultado para a busca
    if (items.length === 0 && this.isQuerying) {
      const q = this.searchQuery.trim();
      body.innerHTML = `
        <div class="nc-state">
          ${ICON.search}
          <div class="title">Nenhum resultado</div>
          <div class="desc">Nada encontrado para “${escapeHtml(q)}”.</div>
          <button class="retry" data-clear-query>Limpar busca</button>
        </div>`;
      body.querySelector('[data-clear-query]').addEventListener('click', () => this._clearQuery());
      return;
    }

    // Estado: vazio
    if (items.length === 0) {
      const semCategoria = this.activeTab !== 'todas';
      const tituloVazio = this.opts.mode === 'widget'
        ? 'Nenhuma manifestação encontrada'
        : 'Sem manifestações';
      body.innerHTML = `
        <div class="nc-state">
          ${ICON.inbox}
          <div class="title">${tituloVazio}</div>
          <div class="desc">${semCategoria
            ? 'Nenhuma manifestação nesta categoria por enquanto.'
            : 'Quando houver avisos, impugnações, questionamentos ou recursos, eles aparecem aqui.'}</div>
        </div>`;
      return;
    }

    // Lista de cards (mesma em página e sheet); na página há painel de leitura.
    body.innerHTML = items.map((i) => this._itemHtml(i)).join('') + (this.opts.mode === 'page' ? '' : this._footerHtml());
    this._bindItems();
    if (this.opts.mode === 'page') this._renderDetail();
  }

  /* ---------- Página: cards de estatística + tabela ---------- */
  _renderStats() {
    if (!this.refs.stats) return;
    const all = this.items;
    const by = (c) => all.filter((i) => i.categoria === c).length;
    const cards = [
      { num: all.length, label: 'Total', cls: '' },
      { num: this.unreadCount, label: 'Não lidas', cls: 'is-accent' },
      { num: by('aviso'), label: 'Avisos', cat: 'aviso' },
      { num: by('impugnacao'), label: 'Impugnações', cat: 'impugnacao' },
      { num: by('esclarecimento'), label: 'Questionamentos', cat: 'esclarecimento' },
      { num: by('recurso'), label: 'Recursos', cat: 'recurso' },
    ];
    this.refs.stats.innerHTML = cards.map((c) => `
      <div class="nc-stat${c.cls ? ' ' + c.cls : ''}">
        ${c.cat ? `<span class="nc-stat-ic cat-${c.cat}"></span>` : ''}
        <div class="nc-stat-num">${c.num}</div>
        <div class="nc-stat-label">${c.label}</div>
      </div>`).join('');
  }

  _tableHtml(items) {
    const rows = items.map((item) => {
      const cat = NCData.CATEGORIAS[item.categoria];
      const isUnread = !item.lida && item.categoria !== 'aviso';
      const novaResposta = item.resposta && item.resposta.novaResposta
        ? `<span class="nc-badge nc-badge--resposta">Nova resposta</span>` : '';
      const grupo = item.copias > 1 ? `<span class="nc-group-count">· ${item.copias} cópias</span>` : '';
      const respCol = item.resposta
        ? `<span class="nc-tag nc-tag--ok">Respondida</span>`
        : (item.categoria === 'aviso' ? '<span class="nc-cell-mute">—</span>' : `<span class="nc-tag nc-tag--pend">Pendente</span>`);
      const anexoCol = item.anexos && item.anexos.length
        ? `<span class="nc-anexo-flag">${ICON.paperclip}${item.anexos.length}</span>` : '<span class="nc-cell-mute">—</span>';
      return `
        <tr class="nc-row${isUnread ? ' is-unread' : ''}" data-id="${item.id}">
          <td class="nc-col-dot">${isUnread ? '<span class="nc-unread-dot"></span>' : ''}</td>
          <td><span class="nc-badge nc-badge--${item.categoria}">${cat.label}</span></td>
          <td class="nc-col-msg">
            <span class="nc-cell-msg">${escapeHtml(item.mensagem || '')}</span>
            <span class="nc-cell-tags">${novaResposta}${grupo}</span>
          </td>
          <td class="nc-cell-mute2">${item.autor ? escapeHtml(item.autor) : '—'}</td>
          <td class="nc-cell-mute2 nc-col-date">${formatTimestamp(item.date)}</td>
          <td>${respCol}</td>
          <td class="nc-col-anexo">${anexoCol}</td>
        </tr>`;
    }).join('');
    return `
      <table class="nc-table">
        <thead>
          <tr>
            <th class="nc-col-dot"></th>
            <th>Tipo</th>
            <th>Manifestação</th>
            <th>Autor</th>
            <th>Recebida</th>
            <th>Resposta</th>
            <th>Anexos</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;
  }

  _itemHtml(item) {
    const cat = NCData.CATEGORIAS[item.categoria];
    const msg = item.mensagem || '';
    const truncado = msg.length > TRUNCATE_LIMIT;
    const temResposta = !!item.resposta;
    const temAnexos = item.anexos && item.anexos.length > 0;
    // Só vale abrir o modal se houver algo a mais que a mensagem da lista:
    // texto truncado, mensagem completa, resposta ou anexos.
    const temMais = truncado || temResposta || !!item.mensagemCompleta || temAnexos;
    const short = truncado ? msg.slice(0, TRUNCATE_LIMIT).trimEnd() + '…' : msg;

    const novaResposta = temResposta && item.resposta.novaResposta
      ? `<span class="nc-badge nc-badge--resposta">Nova resposta</span>` : '';
    const grupo = item.copias > 1
      ? `<span class="nc-group-count nc-tip" data-tip="Recebida ${item.copias} vezes (duplicatas / envios em lote do portal). A lista agrupa em 1 item.">· ${item.copias} cópias</span>` : '';
    const anexoFlag = temAnexos
      ? `<span class="nc-anexo-flag">${ICON.paperclip}${item.anexos.length}</span><span class="dot"></span>` : '';
    const autor = item.autor
      ? `<span class="nc-tip" data-tip="Autor: quem publicou esta manifestação no portal (remetente).">${escapeHtml(item.autor)}</span><span class="dot"></span>`
      : '';
    // No contexto de uma licitação (sheet/card), a badge da licitação é
    // redundante; na central global (sem licitacaoId) ela aparece.
    const lic = this.opts.licitacaoId
      ? '' : `<span class="nc-lic">${escapeHtml(item.licitacaoInfo.label)}</span>`;

    // Avisos não entram no fluxo de não-lido (não notificam).
    const isUnread = !item.lida && item.categoria !== 'aviso';
    // Página (master-detail): toda linha é selecionável; nada de botão/modal.
    const isPage = this.opts.mode === 'page';
    const clickable = isPage || temMais;
    const selected = isPage && item.id === this.selectedId;
    return `
      <article class="nc-item${isUnread ? ' is-unread' : ''}${clickable ? ' is-clickable' : ''}${selected ? ' is-selected' : ''}" data-id="${item.id}">
        <div class="nc-item-main">
          <div class="nc-item-head">
            ${isUnread ? '<span class="nc-unread-dot"></span>' : ''}
            <span class="nc-badge nc-badge--${item.categoria}">${cat.label}</span>
            ${novaResposta}
            ${lic}
            ${grupo}
          </div>
          <p class="nc-item-msg">${escapeHtml(short)}</p>
          ${(!isPage && temMais) ? `<button class="nc-btn-link" data-open="${item.id}">Visualizar mensagem completa</button>` : ''}
          <div class="nc-item-foot">
            ${anexoFlag}
            ${autor}
            <span class="nc-item-time">${formatTimestamp(item.date)}</span>
          </div>
        </div>
        ${item.categoria !== 'aviso' ? `
        <div class="nc-item-actions">
          <button class="nc-item-act" data-read="${item.id}" title="${item.lida ? 'Marcar como não lida' : 'Marcar como lida'}">
            ${item.lida ? ICON.bellOff : ICON.check}
          </button>
        </div>` : ''}
      </article>`;
  }

  _footerHtml() {
    if (this.loadingMore) return `<div class="nc-more"><span class="nc-spin"></span> Carregando mais…</div>`;
    if (!this.hasMore && this.activeTab === 'todas') return `<div class="nc-end">— Fim do histórico —</div>`;
    return '';
  }

  _bindItems() {
    this.refs.list.querySelectorAll('[data-open]').forEach((b) =>
      b.addEventListener('click', (e) => { e.stopPropagation(); this._activateItem(b.dataset.open); }));
    this.refs.list.querySelectorAll('[data-read]').forEach((b) =>
      b.addEventListener('click', (e) => { e.stopPropagation(); this._toggleRead(b.dataset.read); }));
    // Itens clicáveis: abrem o detalhe (painel na página / modal no sheet).
    this.refs.list.querySelectorAll('.nc-item.is-clickable').forEach((el) =>
      el.addEventListener('click', () => this._activateItem(el.dataset.id)));
  }

  _toggleRead(id) {
    const item = this.items.find((i) => i.id === id);
    if (!item) return;
    item.lida = !item.lida;
    this._updateCount();
    this._renderList();
  }

  /* ---------- Infinite scroll + pull-to-refresh ---------- */
  _onScroll() {
    const b = this.refs.body;
    // Paginação: últimos ~20% da lista
    if (this.hasMore && !this.loadingMore && !this.loadingInitial && this.activeTab === 'todas') {
      const restante = b.scrollHeight - (b.scrollTop + b.clientHeight);
      if (restante < b.clientHeight * 0.2) this._loadMore();
    }
    // Saiu do topo -> zera o acúmulo do "puxão"
    if (b.scrollTop > 4) this._pullAccum = 0;
  }

  /* Pull-to-refresh: só dispara com um gesto deliberado de "puxar" — ou seja,
   * continuar rolando para cima DEPOIS de já estar no topo, passando do
   * limiar. Assim dá para apenas encostar no topo sem disparar update. */
  _onWheel(e) {
    if (this.refreshing || this.loadingInitial) return;
    const b = this.refs.body;
    if (b.scrollTop <= 0 && e.deltaY < 0) {
      this._pullAccum = (this._pullAccum || 0) + (-e.deltaY);
      if (this._pullAccum >= PULL_THRESHOLD) {
        this._pullAccum = 0;
        this._refresh();
      }
    } else if (e.deltaY > 0) {
      this._pullAccum = 0;
    }
  }

  async _loadMore() {
    this.loadingMore = true;
    this._renderList();
    try {
      const { items, hasMore } = await NCData.fetchPage({
        licitacaoId: this.opts.licitacaoId,
        offset: this.offset,
        limit: this.opts.pageSize,
        simulate: this.opts.simulate,
      });
      this.items = this.items.concat(items);
      this.offset += items.length;
      this.hasMore = hasMore;
    } catch (e) { /* mantém o que já há; usuário pode rolar de novo */ }
    this.loadingMore = false;
    this._renderTabs();
    this._renderList();
  }

  async _refresh() {
    this.refreshing = true;
    this.refs.refresh.classList.add('is-on');
    try {
      const { items } = await NCData.fetchNewer({ licitacaoId: this.opts.licitacaoId });
      const novos = items.filter((n) => !this.items.some((i) => i.id === n.id));
      if (novos.length) {
        // Ancorar a lista para evitar "pulo" perceptível
        const prevH = this.refs.body.scrollHeight;
        this.items = novos.concat(this.items);
        this._renderTabs();
        this._updateCount();
        this._renderList();
        this.refs.body.scrollTop += (this.refs.body.scrollHeight - prevH);
        this._showNewAlert(novos.length); // avisar o usuário
      }
    } catch (e) { /* silencioso */ }
    this.refs.refresh.classList.remove('is-on');
    this.refreshing = false;
  }

  /* Alerta in-app de novidades (doc, pág. 2: "avisar o usuário"). */
  _showNewAlert(n) {
    const a = this.refs.newalert;
    a.textContent = `${n} nova${n > 1 ? 's' : ''} manifestaç${n > 1 ? 'ões' : 'ão'} ↑`;
    a.hidden = false;
    clearTimeout(this._alertTimer);
    this._alertTimer = setTimeout(() => this._hideNewAlert(), 4500);
  }
  _hideNewAlert() { clearTimeout(this._alertTimer); this.refs.newalert.hidden = true; }

  /* Abrir/selecionar marca como lida e a resposta como vista. */
  _markItemHandled(item) {
    let changed = false;
    if (!item.lida) { item.lida = true; changed = true; }
    if (item.resposta && item.resposta.novaResposta) { item.resposta.novaResposta = false; changed = true; }
    return changed;
  }

  /* Conteúdo do detalhe — reusado no modal (sheet) e no painel (página). */
  _detailHeadHtml(item) {
    const cat = NCData.CATEGORIAS[item.categoria];
    return `
      <div class="nc-detail-meta">
        <span class="nc-badge nc-badge--${item.categoria}">${cat.label}</span>
        ${this.opts.licitacaoId ? '' : `<span class="nc-lic">${escapeHtml(item.licitacaoInfo.label)}</span>`}
      </div>
      <div class="nc-detail-sub">${item.autor ? escapeHtml(item.autor) + ' · ' : ''}${formatTimestamp(item.date)}</div>`;
  }

  _detailBodyHtml(item) {
    const full = item.mensagemCompleta || item.mensagem || '';
    const longo = full.length > 320;
    const resumo = item.resumoAuto || (longo ? gerarResumo(full) : '');
    return `
      ${item.copias > 1 ? `
        <div class="nc-dup-note">
          <span>Esta manifestação foi recebida <strong>${item.copias} vezes</strong> (envios em lote). Exibindo a versão mais recente.</span>
        </div>` : ''}
      ${resumo ? `
        <div class="nc-resumo">
          <div class="nc-section-label">${ICON.sparkle} Resumo automático</div>
          <p>${escapeHtml(resumo)}</p>
        </div>` : ''}
      <div class="nc-section">
        <div class="nc-section-label">Mensagem</div>
        <div class="nc-msg-full">${escapeHtml(full)}</div>
      </div>
      ${item.resposta ? `
        <div class="nc-section">
          <div class="nc-section-label">Resposta</div>
          <div class="nc-msg-full">${escapeHtml(item.resposta.texto)}</div>
        </div>` : ''}
      ${item.anexos && item.anexos.length ? `
        <div class="nc-section">
          <div class="nc-section-label">Anexos</div>
          ${item.anexos.map((a) => `
            <a class="nc-anexo" href="#" onclick="return false">
              <span class="file-ic">${ICON.file}</span>
              <span>
                <span class="file-name">${escapeHtml(a.nome)}</span><br>
                <span class="file-size">${escapeHtml(a.tamanho || 'PDF')}</span>
              </span>
              <span class="file-dl" title="Baixar">${ICON.download}</span>
            </a>`).join('')}
        </div>` : ''}`;
  }

  /* Ativar item: página -> painel de detalhe; sheet/widget -> modal. */
  _activateItem(id) {
    if (this.opts.mode === 'page') this._selectItem(id);
    else this._openModal(id);
  }

  /* ---------- Página: painel de detalhe (master-detail) ---------- */
  _selectItem(id) {
    const item = this.items.find((i) => i.id === id);
    if (!item) return;
    this.selectedId = id;
    this._markItemHandled(item);
    this._updateCount();
    this._renderList();
    this._renderDetail();
  }

  _renderDetail() {
    if (!this.refs.detail) return;
    const item = this.items.find((i) => i.id === this.selectedId);
    if (!item) {
      this.refs.detail.innerHTML = `
        <div class="nc-detail-empty">
          ${ICON.inbox}
          <div class="title">Selecione uma manifestação</div>
          <div class="desc">Escolha um item à esquerda para ver a mensagem completa, a resposta e os anexos.</div>
        </div>`;
      return;
    }
    this.refs.detail.innerHTML = `
      <div class="nc-detail-head">${this._detailHeadHtml(item)}</div>
      <div class="nc-detail-body">${this._detailBodyHtml(item)}</div>`;
  }

  /* ---------- Modal "mensagem completa" (sheet/widget) ---------- */
  _openModal(id) {
    const item = this.items.find((i) => i.id === id);
    if (!item) return;
    if (this._markItemHandled(item)) { this._updateCount(); this._renderList(); }

    const backdrop = document.createElement('div');
    backdrop.className = 'nc-modal-backdrop';
    backdrop.innerHTML = `
      <div class="nc-modal" role="dialog" aria-modal="true">
        <div class="nc-modal-head">
          <div class="grow">${this._detailHeadHtml(item)}</div>
          <button class="nc-icon-btn" data-mclose title="Fechar">${ICON.x}</button>
        </div>
        <div class="nc-modal-body">${this._detailBodyHtml(item)}</div>
      </div>`;
    document.body.appendChild(backdrop);
    const close = () => backdrop.remove();
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
    backdrop.querySelector('[data-mclose]').addEventListener('click', close);
    document.addEventListener('keydown', function esc(e) {
      if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
    });
  }

  /* API pública: trocar o estado simulado (demo de loading/vazio/erro). */
  setSimulate(mode) { this.opts.simulate = mode; this.offset = 0; this.hasMore = true; this._loadInitial(); }
  destroy() {
    if (this._closeMenuOnOutside) document.removeEventListener('click', this._closeMenuOnOutside);
    clearTimeout(this._alertTimer);
    this.el.innerHTML = '';
  }
}

if (typeof window !== 'undefined') {
  window.NotificationsCenter = NotificationsCenter;
}
