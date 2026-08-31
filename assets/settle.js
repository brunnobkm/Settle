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


  /* ---------- Tutorial guiado ---------------------------------------------
     window.settleTour(passos) onde cada passo é:
       { alvo: '#seletor' (opcional; sem alvo o balão fica centralizado),
         titulo, texto (aceita HTML), antes: fn (roda antes de destacar),
         espera: ms (atraso após o `antes`, para animação/render) }
     Retorna { parar }.
  ------------------------------------------------------------------------ */

  var tourAtivo = null;

  window.settleTour = function (passos, opts) {
    if (tourAtivo) tourAtivo.parar();
    opts = opts || {};

    var scrim = document.querySelector('.tut-scrim');
    if (!scrim) {
      scrim = document.createElement('div');
      scrim.className = 'tut-scrim';
      document.body.appendChild(scrim);
    }
    var pop = document.querySelector('.tut-pop');
    if (!pop) {
      pop = document.createElement('div');
      pop.className = 'tut-pop';
      pop.setAttribute('role', 'dialog');
      pop.setAttribute('aria-live', 'polite');
      document.body.appendChild(pop);
    }
    scrim.hidden = false;
    pop.hidden = false;

    var i = 0, alvoAtual = null;

    function limpar() {
      if (alvoAtual) { alvoAtual.classList.remove('tut-alvo'); alvoAtual = null; }
    }

    function posicionar(el) {
      var m = 14, w = pop.offsetWidth, h = pop.offsetHeight;
      if (!el) {
        pop.style.left = Math.round((window.innerWidth - w) / 2) + 'px';
        pop.style.top = Math.round((window.innerHeight - h) / 2) + 'px';
        return;
      }
      var r = el.getBoundingClientRect();
      var top = r.bottom + m;
      if (top + h > window.innerHeight - 8) {
        top = r.top - h - m;
        if (top < 8) top = Math.max(8, (window.innerHeight - h) / 2);
      }
      var left = r.left;
      if (left + w > window.innerWidth - 8) left = window.innerWidth - w - 8;
      if (left < 8) left = 8;
      pop.style.left = Math.round(left) + 'px';
      pop.style.top = Math.round(top) + 'px';
    }

    function render() {
      var p = passos[i];
      limpar();
      if (typeof p.antes === 'function') p.antes();

      setTimeout(function () {
        var el = p.alvo ? document.querySelector(p.alvo) : null;
        if (el) {
          el.classList.add('tut-alvo');
          alvoAtual = el;
          var r = el.getBoundingClientRect();
          if (r.top < 70 || r.bottom > window.innerHeight - 70) {
            el.scrollIntoView({ block: 'center', behavior: 'smooth' });
          }
        }
        pop.innerHTML =
          '<div class="tut-kicker">' + (p.kicker || 'Tutorial') + '</div>' +
          '<h3>' + p.titulo + '</h3>' +
          '<p>' + p.texto + '</p>' +
          '<div class="tut-nav">' +
            '<span class="tut-count">' + (i + 1) + ' de ' + passos.length + '</span>' +
            (i > 0 ? '<button class="btn btn-outline" type="button" data-tut="voltar">Voltar</button>' : '') +
            '<button class="btn btn-outline" type="button" data-tut="sair">Sair</button>' +
            '<button class="btn btn-primary" type="button" data-tut="proximo">' +
              (i === passos.length - 1 ? 'Concluir' : 'Próximo') + '</button>' +
          '</div>';
        pop.querySelectorAll('[data-tut]').forEach(function (b) {
          b.addEventListener('click', function () {
            var a = b.dataset.tut;
            if (a === 'sair') return parar();
            if (a === 'voltar') { i = Math.max(0, i - 1); return render(); }
            if (i === passos.length - 1) return parar();
            i++; render();
          });
        });
        // posiciona depois de medir o balão já preenchido
        requestAnimationFrame(function () { posicionar(el); });
      }, p.espera || (p.antes ? 260 : 0));
    }

    function parar() {
      limpar();
      scrim.hidden = true;
      pop.hidden = true;
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
      tourAtivo = null;
      if (typeof opts.aoSair === 'function') opts.aoSair();
    }

    function onKey(e) { if (e.key === 'Escape') parar(); }
    function onResize() { posicionar(alvoAtual); }

    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);

    tourAtivo = { parar: parar };
    render();
    return tourAtivo;
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
