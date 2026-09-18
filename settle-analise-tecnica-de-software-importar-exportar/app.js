/* =========================================================================
   Análise técnica de software — protótipo
   Funcionalidades: render da tabela + Exportar (.xlsx) + Importar (Excel)
   Regras conforme documento "Importação e exportação de dados (Excel)".
   ========================================================================= */

/* ---- Constantes de domínio ---- */
const STATUS = {
  ATENDE: 'Atende',
  PARCIAL: 'Atende parcialmente',
  PARCEIRO: 'Atende com parceiro',
  NAO: 'Não atende',
};
const CONFIANCA = ['Alta', 'Média', 'Baixa'];

// Nome da aba de instruções no template. Regra de leitura de abas:
// a importação IGNORA qualquer aba cujo nome comece com este prefixo.
const INSTRUCOES_PREFIX = '📋';
const ABA_INSTRUCOES = '📋 Instruções';
const ABA_REQUISITOS = 'Requisitos';

// Colunas obrigatórias no arquivo importado.
const COL_ID = 'ID';
const COL_MODULO = 'Nome do Módulo';

// Ordem/cabeçalhos das colunas no arquivo exportado.
const HEADERS = [COL_ID, COL_MODULO, 'Requisito', 'Status', 'Confiança IA', 'Justificativa IA', 'Responsável', 'Notas'];

/* ---- Dados de exemplo (~30 requisitos, como na tela) ---- */
const MODULOS = ['IPTU', 'ISS', 'Dívida Ativa', 'Protocolo', 'Tesouraria', 'Nota Fiscal', 'Cadastro', 'Relatórios'];
const REQ_BASE = 'A fórmula de cálculo do IPTU deve ser totalmente parametrizável pelo gestor tributário do município, não necessitando de qualquer alteração no código executável do sistema para inclusão de novas fórmulas, alíquotas ou índices de correção monetária, garantindo plena autonomia operacional ao setor.';

function gerarDados() {
  const statusCiclo = [STATUS.PARCEIRO, STATUS.ATENDE, STATUS.PARCEIRO, STATUS.PARCEIRO, STATUS.NAO, STATUS.PARCEIRO, STATUS.PARCIAL, STATUS.ATENDE];
  const confCiclo = ['Alta', 'Média', 'Baixa', 'Baixa', 'Baixa', 'Baixa', 'Média', 'Alta'];
  const rows = [];
  for (let i = 0; i < 30; i++) {
    const status = statusCiclo[i % statusCiclo.length];
    rows.push({
      id: 'REQ-' + String(i + 1).padStart(3, '0'),
      tipo: 'Software',
      modulo: MODULOS[i % MODULOS.length],
      requisito: REQ_BASE,
      status,
      // sparkle (sugestão da IA) para tudo que não seja o "Atende" confirmado pelo usuário
      aiSuggested: status !== STATUS.ATENDE,
      confianca: confCiclo[i % confCiclo.length],
      justificativa: REQ_BASE,
      responsavel: i === 0 ? '' : 'Fulano da Silva',
      notas: '',
    });
  }
  return rows;
}

let dados = gerarDados();
let tipoAtivo = 'Software';

/* =========================================================================
   RENDER
   ========================================================================= */
const tbody = document.getElementById('tbody');
const statsEl = document.getElementById('stats');

function statusClass(s) {
  if (s === STATUS.ATENDE) return 'st-atende';
  if (s === STATUS.PARCIAL) return 'st-parcial';
  if (s === STATUS.PARCEIRO) return 'st-parceiro';
  return 'st-nao';
}
function confClass(c) {
  if (c === 'Alta') return 'conf-alta';
  if (c === 'Média') return 'conf-media';
  return 'conf-baixa';
}
function esc(t) {
  return String(t ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function render() {
  const visiveis = dados.filter(r => r.tipo === tipoAtivo);
  renderStats(visiveis);

  tbody.innerHTML = visiveis.map(r => `
    <tr>
      <td class="col-check"><input type="checkbox" /></td>
      <td><div class="cell-text">${esc(r.requisito)}</div></td>
      <td><div class="cell-text">${esc(r.modulo) || '—'}</div></td>
      <td>
        <span class="badge ${statusClass(r.status)}">
          ${r.aiSuggested ? '<span class="spark">✦</span>' : ''}${esc(r.status)}
        </span>
      </td>
      <td><span class="conf ${confClass(r.confianca)}">${esc(r.confianca)}</span></td>
      <td><div class="cell-just">${esc(r.justificativa)}</div></td>
      <td>
        ${r.responsavel
          ? `<span class="resp-tag">${esc(r.responsavel)}</span>`
          : `<span class="resp-tag resp-tag--empty">Selecionar</span>`}
      </td>
      <td>${r.notas ? `<div class="cell-text">${esc(r.notas)}</div>` : `<span class="cell-placeholder">Nota</span>`}</td>
    </tr>
  `).join('');
}

function renderStats(rows) {
  const total = rows.length;
  const count = s => rows.filter(r => r.status === s).length;
  const atende = count(STATUS.ATENDE);
  const aderencia = total ? Math.round((atende / total) * 100) : 0;
  const cards = [
    { ic: '◎', num: aderencia + '%', label: 'Percentual de aderência' },
    { ic: '≣', num: total, label: 'Total de requisitos' },
    { ic: '✓', num: atende, label: 'Atende' },
    { ic: '✓', num: count(STATUS.PARCIAL), label: 'Atende parcialmente' },
    { ic: '✓', num: count(STATUS.PARCEIRO), label: 'Atende com parceiro' },
    { ic: '✕', num: count(STATUS.NAO), label: 'Não atende' },
    { ic: '💬', num: 6, label: 'Questionamentos' },
    { ic: '💬', num: 6, label: 'Impugnação' },
  ];
  statsEl.innerHTML = cards.map(c => `
    <div class="stat-card">
      <div class="stat-top"><span class="stat-ic">${c.ic}</span><span class="stat-num">${c.num}</span></div>
      <div class="stat-label">${c.label}</div>
    </div>
  `).join('');
}

/* tipo filter */
document.getElementById('tipoFilter').addEventListener('click', e => {
  const chip = e.target.closest('.tipo-chip');
  if (!chip) return;
  document.querySelectorAll('.tipo-chip').forEach(c => c.classList.remove('tipo-chip--active'));
  chip.classList.add('tipo-chip--active');
  tipoAtivo = chip.dataset.tipo;
  render();
});

/* segmented view (apenas visual neste protótipo) */
document.querySelector('.seg').addEventListener('click', e => {
  const b = e.target.closest('.seg-btn'); if (!b) return;
  document.querySelectorAll('.seg-btn').forEach(x => x.classList.remove('seg-btn--active'));
  b.classList.add('seg-btn--active');
});

/* =========================================================================
   FEEDBACK (toast / modal)
   ========================================================================= */
const toastEl = document.getElementById('toast');
let toastTimer;
function toast(msg, ok = true) {
  toastEl.textContent = msg;
  toastEl.classList.toggle('toast--ok', ok);
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3200);
}
const errorModal = document.getElementById('errorModal');
function showError() { errorModal.classList.add('show'); }
document.getElementById('errorModalClose').addEventListener('click', () => errorModal.classList.remove('show'));
errorModal.addEventListener('click', e => { if (e.target === errorModal) errorModal.classList.remove('show'); });

/* =========================================================================
   EXPORTAÇÃO  →  gera .xlsx com aba de Instruções + aba de Requisitos
   ========================================================================= */
function exportar() {
  if (typeof XLSX === 'undefined') { toast('Biblioteca de Excel não carregou. Verifique a conexão.', false); return; }

  const wb = XLSX.utils.book_new();

  /* --- Aba de instruções (sugestão @Alice Iglesias) --- */
  const instr = [
    ['Análise técnica de software — instruções de preenchimento'],
    [],
    ['O que esta planilha faz:'],
    ['• Exporta os requisitos da análise técnica para você editar no Excel.'],
    ['• Ao reimportar, o sistema preenche automaticamente a tabela existente.'],
    [],
    ['Regras obrigatórias:'],
    ['• NÃO exclua a coluna "ID" — ela identifica cada requisito.'],
    ['• A coluna "Nome do Módulo" deve estar sempre presente.'],
    ['• Mantenha todas as demais colunas existentes.'],
    ['• Não repita o mesmo requisito em várias abas.'],
    ['• Edite os dados apenas na aba "' + ABA_REQUISITOS + '".'],
    [],
    ['Valores aceitos:'],
    ['• Status: ' + Object.values(STATUS).join(' | ')],
    ['• Confiança IA: ' + CONFIANCA.join(' | ')],
    [],
    ['Leitura de abas:'],
    ['• Esta aba de instruções (prefixo "' + INSTRUCOES_PREFIX + '") é ignorada na importação.'],
    [],
    ['Em caso de erro: releia estas instruções e garanta que está alinhado.'],
  ];
  const wsInstr = XLSX.utils.aoa_to_sheet(instr);
  wsInstr['!cols'] = [{ wch: 90 }];
  XLSX.utils.book_append_sheet(wb, wsInstr, ABA_INSTRUCOES);

  /* --- Aba de requisitos --- */
  const rows = dados.map(r => ({
    [COL_ID]: r.id,
    [COL_MODULO]: r.modulo,
    'Requisito': r.requisito,
    'Status': r.status,
    'Confiança IA': r.confianca,
    'Justificativa IA': r.justificativa,
    'Responsável': r.responsavel,
    'Notas': r.notas,
  }));
  const wsReq = XLSX.utils.json_to_sheet(rows, { header: HEADERS });
  wsReq['!cols'] = [
    { wch: 12 }, { wch: 16 }, { wch: 60 }, { wch: 20 },
    { wch: 13 }, { wch: 60 }, { wch: 18 }, { wch: 24 },
  ];
  XLSX.utils.book_append_sheet(wb, wsReq, ABA_REQUISITOS);

  // Download direto para a pasta padrão do navegador (sem diálogo "salvar como").
  const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'analise-tecnica-software.xlsx';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);

  toast('Exportado: ' + dados.length + ' requisitos para Excel.');
}

/* =========================================================================
   IMPORTAÇÃO  →  lê Excel, valida, preenche a tabela existente
   ========================================================================= */
function importar(file) {
  if (typeof XLSX === 'undefined') { toast('Biblioteca de Excel não carregou. Verifique a conexão.', false); return; }

  const reader = new FileReader();
  reader.onload = e => {
    try {
      const wb = XLSX.read(e.target.result, { type: 'array' });

      // Regra de leitura: ignora abas de instruções (prefixo) e lê as demais.
      const abasDados = wb.SheetNames.filter(n => !n.trim().startsWith(INSTRUCOES_PREFIX));
      if (abasDados.length === 0) throw new Error('sem aba de dados');

      // Junta linhas de todas as abas de dados (suporta divisão por módulo).
      let linhas = [];
      for (const nome of abasDados) {
        const json = XLSX.utils.sheet_to_json(wb.Sheets[nome], { defval: '' });
        linhas = linhas.concat(json);
      }
      if (linhas.length === 0) throw new Error('arquivo vazio');

      // Valida colunas obrigatórias: ID e Nome do Módulo.
      const cols = Object.keys(linhas[0]);
      const norm = s => String(s).trim().toLowerCase();
      const temCol = alvo => cols.some(c => norm(c) === norm(alvo));
      if (!temCol(COL_ID) || !temCol(COL_MODULO)) throw new Error('colunas obrigatórias ausentes');

      const findKey = alvo => cols.find(c => norm(c) === norm(alvo));
      const kId = findKey(COL_ID), kMod = findKey(COL_MODULO);
      const kReq = findKey('Requisito'), kStatus = findKey('Status');
      const kConf = findKey('Confiança IA'), kJust = findKey('Justificativa IA');
      const kResp = findKey('Responsável'), kNotas = findKey('Notas');

      const porId = new Map(dados.map(r => [r.id, r]));
      let atualizados = 0, criados = 0;
      const vistos = new Set();

      for (const ln of linhas) {
        const id = String(ln[kId]).trim();
        if (!id) throw new Error('linha sem ID');
        if (vistos.has(id)) continue; // não duplicar requisito repetido entre abas
        vistos.add(id);

        const valStatus = kStatus ? String(ln[kStatus]).trim() : '';
        const status = Object.values(STATUS).includes(valStatus) ? valStatus : STATUS.PARCIAL;
        const valConf = kConf ? String(ln[kConf]).trim() : '';
        const confianca = CONFIANCA.includes(valConf) ? valConf : 'Média';

        const campos = {
          modulo: String(ln[kMod] ?? '').trim(),
          requisito: kReq ? String(ln[kReq] ?? '').trim() : '',
          status,
          confianca,
          justificativa: kJust ? String(ln[kJust] ?? '').trim() : '',
          responsavel: kResp ? String(ln[kResp] ?? '').trim() : '',
          notas: kNotas ? String(ln[kNotas] ?? '').trim() : '',
        };

        const existente = porId.get(id);
        if (existente) {
          Object.assign(existente, campos, { aiSuggested: false });
          atualizados++;
        } else {
          const novo = { id, tipo: 'Software', aiSuggested: false, ...campos };
          dados.push(novo);
          porId.set(id, novo);
          criados++;
        }
      }

      render();
      toast(`Importado: ${atualizados} atualizado(s), ${criados} novo(s).`);
    } catch (err) {
      console.warn('Falha na importação:', err.message);
      showError(); // erro genérico → "Releia as instruções e garanta que está alinhado."
    }
  };
  reader.onerror = () => showError();
  reader.readAsArrayBuffer(file);
}

/* ---- wiring dos botões ---- */
const fileInput = document.getElementById('fileInput');
document.getElementById('btnExportar').addEventListener('click', exportar);
document.getElementById('btnImportar').addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', e => {
  const f = e.target.files[0];
  if (f) importar(f);
  fileInput.value = ''; // permite reimportar o mesmo arquivo
});

document.getElementById('checkAll').addEventListener('change', e => {
  document.querySelectorAll('#tbody input[type="checkbox"]').forEach(c => c.checked = e.target.checked);
});

/* init */
render();
