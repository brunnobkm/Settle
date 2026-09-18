/* =====================================================================
 * recurso.js — Proposta de solução para Recurso + Contrarrazões
 * ---------------------------------------------------------------------
 * Modela o recurso como um FLUXO encadeado (uma "thread"):
 *   intenção → razões → contrarrazões → julgamento
 * porque a contrarrazão só faz sentido dentro do processo do recurso.
 * Mostra (1) como aparece na lista e (2) o detalhe (timeline).
 * ===================================================================== */

const app = document.getElementById('app');

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
function fmt(minAtras) {
  const date = new Date(Date.now() - minAtras * 60000);
  const min = Math.floor((Date.now() - date.getTime()) / 60000);
  if (min < 60) return `Há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `Há ${h} h`;
  const d = Math.floor(h / 24);
  if (d <= 6) return `Há ${d} ${d === 1 ? 'dia' : 'dias'}`;
  return `${date.getDate()} de ${MESES[date.getMonth()]} de ${date.getFullYear()}`;
}

const STATUS = {
  em_andamento: { label: 'Em andamento', cls: 'st-wait' },
  provido:      { label: 'Provido',      cls: 'st-pos' },
  improvido:    { label: 'Improvido',    cls: 'st-neg' },
};

/* Um recurso = uma thread de etapas. */
const RECURSO = {
  titulo: 'Recurso à decisão de habilitação — Item 1',
  status: 'improvido',
  etapas: [
    {
      etapa: 'Intenção de recurso', curto: 'Intenção',
      autor: 'Licitante — Gamma Engenharia (recorrente)', minAtras: 60 * 24 * 4,
      texto: 'Manifestação de intenção de recurso contra a decisão que habilitou a empresa classificada em 1º lugar no item 1.',
    },
    {
      etapa: 'Razões do recurso', curto: 'Razões',
      autor: 'Licitante — Gamma Engenharia (recorrente)', minAtras: 60 * 24 * 3,
      texto: 'O recorrente sustenta que a empresa habilitada não atende ao item 7.2 do edital (atestado de capacidade técnica com quantitativo mínimo), e pleiteia a reforma da decisão de habilitação.',
      anexos: [{ nome: 'Razoes_do_recurso.pdf', tamanho: '240 KB' }],
    },
    {
      etapa: 'Contrarrazões', curto: 'Contrarrazões',
      autor: 'Licitante — Alfa Tecnologia LTDA (recorrida)', minAtras: 60 * 24 * 2,
      texto: 'Apresentação de contrarrazões sustentando a regularidade da documentação de habilitação, com atestados que comprovam o quantitativo exigido no item 7.2 do edital. Requer-se o não provimento do recurso.',
      anexos: [{ nome: 'Contrarrazoes.pdf', tamanho: '188 KB' }],
      foco: true,
    },
    {
      etapa: 'Julgamento do recurso', curto: 'Julgamento',
      autor: 'Autoridade Competente', minAtras: 60 * 24,
      texto: 'Recurso conhecido e, no mérito, IMPROVIDO. Mantém-se a decisão de habilitação — os atestados apresentados atendem ao quantitativo do item 7.2.',
      resultado: 'Improvido',
    },
  ],
};

function render() {
  const st = STATUS[RECURSO.status];
  const ultima = RECURSO.etapas[RECURSO.etapas.length - 1];

  const stepper = RECURSO.etapas.map((e, i) => `
    <div class="step is-done${e.foco ? ' is-foco' : ''}">
      <span class="step-dot"></span><span class="step-label">${escapeHtml(e.curto)}</span>
    </div>${i < RECURSO.etapas.length - 1 ? '<span class="step-line"></span>' : ''}`).join('');

  const timeline = RECURSO.etapas.map((e) => `
    <div class="tl-item${e.foco ? ' is-foco' : ''}">
      <span class="tl-marker"></span>
      <div class="tl-body">
        <div class="tl-etapa">
          ${escapeHtml(e.etapa)}
          ${e.foco ? '<span class="tag-foco">contrarrazões</span>' : ''}
          ${e.resultado ? `<span class="chip ${st.cls}">${escapeHtml(e.resultado)}</span>` : ''}
        </div>
        <div class="tl-meta">${escapeHtml(e.autor)} · ${fmt(e.minAtras)}</div>
        <div class="tl-text">${escapeHtml(e.texto)}</div>
        ${e.anexos && e.anexos.length ? `<div class="tl-anexos">${e.anexos.map((a) =>
          `<a class="anexo-mini" href="#" onclick="return false">📎 ${escapeHtml(a.nome)} · ${escapeHtml(a.tamanho)}</a>`).join('')}</div>` : ''}
      </div>
    </div>`).join('');

  app.innerHTML = `
    <header class="app-head">
      <h1>Recurso &amp; Contrarrazões</h1>
      <span class="app-sub">Proposta — PE 12/2026 · Prefeitura SP</span>
    </header>

    <p class="demo-intro">
      A ideia: o <strong>recurso</strong> não é vários itens soltos — é <strong>um processo encadeado</strong>.
      A <strong>contrarrazão</strong> é uma <strong>etapa dentro do recurso</strong> (a resposta da parte recorrida).
    </p>

    <div class="demo-section">
      <div class="demo-label">1 · Como aparece na lista de Manifestações</div>
      <article class="card card--recurso">
        <div class="card-top">
          <span class="badge badge--recurso">Recurso</span>
          <span class="chip ${st.cls}">${st.label}</span>
        </div>
        <div class="rec-title">${escapeHtml(RECURSO.titulo)}</div>
        <div class="card-meta">${RECURSO.etapas.length} etapas · última: ${ultima.curto} · ${fmt(ultima.minAtras)}</div>
        <div class="stepper">${stepper}</div>
        <button class="btn-completa">Ver recurso completo</button>
      </article>
    </div>

    <div class="demo-section">
      <div class="demo-label">2 · Ao abrir — o fluxo do recurso (timeline)</div>
      <div class="thread"><div class="timeline">${timeline}</div></div>
    </div>`;
}
render();
