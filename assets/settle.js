/* ==========================================================================
   SETTLE — Comportamentos da casca (shell)
   --------------------------------------------------------------------------
   Só o que é comum a todas as telas:
   - abrir/fechar a sidebar
   - esconder a navbar ao rolar para baixo, mostrar ao rolar para cima
   - helper de toast

   USO:  <script src="/Settle/assets/settle.js" defer></script>

   A lógica específica de cada protótipo (filtros, busca, dados) fica no
   <script> da própria página. Não coloque regra de negócio aqui.
   ========================================================================== */

(function () {
  'use strict';

  /* ---------- Sidebar ---------------------------------------------------- */

  function initSidebar() {
    var toggle = document.querySelector('[data-sb-toggle]');
    if (toggle) {
      toggle.addEventListener('click', function () {
        document.body.classList.toggle('sb-open');
      });
    }

    // Itens expansíveis (ex.: grupos com sub-itens)
    document.querySelectorAll('.sb-expandable').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        // Sidebar fechada: primeiro clique só abre a sidebar
        if (!document.body.classList.contains('sb-open')) {
          document.body.classList.add('sb-open');
          return;
        }
        el.classList.toggle('open');
      });
    });
  }

  /* ---------- Navbar que some ao rolar ----------------------------------- */

  function initNavbarAutoHide() {
    var TH = 80;     // zona de topo: navbar sempre visível
    var DELTA = 8;   // movimento mínimo para reagir (evita jitter)
    var lastY = window.scrollY || 0;
    var ticking = false;

    function update() {
      var y = window.scrollY;
      if (y < TH) {
        document.body.classList.remove('nav-hidden');
        lastY = y;
      } else if (y - lastY > DELTA) {
        document.body.classList.add('nav-hidden');
        lastY = y;
      } else if (lastY - y > DELTA) {
        document.body.classList.remove('nav-hidden');
        lastY = y;
      }
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
  }

  /* ---------- Toast ------------------------------------------------------ */

  var CHECK_ICON =
    '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" ' +
    'stroke-linecap="round" stroke-linejoin="round"><path d="M4 10.5l4 4 8-9"/></svg>';

  /**
   * Mostra um toast no canto inferior direito.
   * @param {string} msg          Mensagem (texto puro).
   * @param {object} [opts]
   * @param {string} [opts.undoLabel]  Rótulo do botão de desfazer.
   * @param {function} [opts.onUndo]   Callback do desfazer.
   * @param {number} [opts.duration]   Milissegundos até sumir (padrão 4000).
   */
  window.settleToast = function (msg, opts) {
    opts = opts || {};
    var host = document.getElementById('toasts');
    if (!host) {
      host = document.createElement('div');
      host.id = 'toasts';
      document.body.appendChild(host);
    }

    var el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('role', 'status');

    var ico = document.createElement('span');
    ico.className = 'toast-ico';
    ico.innerHTML = CHECK_ICON;

    var text = document.createElement('span');
    text.className = 'toast-msg';
    text.textContent = msg;

    el.appendChild(ico);
    el.appendChild(text);

    if (opts.undoLabel && typeof opts.onUndo === 'function') {
      var undo = document.createElement('button');
      undo.className = 'toast-undo';
      undo.type = 'button';
      undo.textContent = opts.undoLabel;
      undo.addEventListener('click', function () {
        opts.onUndo();
        dismiss();
      });
      el.appendChild(undo);
    }

    host.appendChild(el);
    requestAnimationFrame(function () { el.classList.add('show'); });

    var timer = setTimeout(dismiss, opts.duration || 4000);

    function dismiss() {
      clearTimeout(timer);
      el.classList.remove('show');
      el.classList.add('hide');
      setTimeout(function () { el.remove(); }, 300);
    }

    return dismiss;
  };

  /* ---------- Boot ------------------------------------------------------- */

  function boot() {
    initSidebar();
    initNavbarAutoHide();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
