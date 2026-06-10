/* =====================================================================
 * app.js — Workspace da licitação (mock) com a tab "Manifestações"
 * ---------------------------------------------------------------------
 * Escopo: a parte de manifestações vira uma TAB de nível do workspace
 * (ao lado de Visão geral, Itens, Análise técnica…), no padrão da tela
 * "Análise técnica". O conteúdo é o componente NotificationsCenter
 * adaptado para página inteira (mode: 'page').
 * ===================================================================== */

const WS_TABS = [
  'Visão geral', 'Itens', 'Análise técnica', 'Documentos', 'Habilitação',
  'Jurídico', 'Comunicação', 'Manifestações', 'Time', 'Risco de pagamento do órgão',
];
const ACTIVE_TAB = 'Manifestações';

const wsTabs = document.getElementById('wsTabs');
wsTabs.innerHTML = WS_TABS.map((t) =>
  `<button class="ws-tab${t === ACTIVE_TAB ? ' is-active' : ''}">${t}</button>`
).join('');
// rola a tab ativa para a vista
const activeEl = wsTabs.querySelector('.ws-tab.is-active');
if (activeEl) activeEl.scrollIntoView({ inline: 'center', block: 'nearest' });

/* Conteúdo da tab Manifestações = NotificationsCenter em página inteira */
new NotificationsCenter(document.getElementById('mount'), {
  mode: 'page',
  title: 'Manifestações',
  licitacaoId: 'pe12',
  showClose: false,
});
