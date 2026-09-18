/* =========================================================================
   Template de tabela — base da Análise Técnica (Figma) + recursos do Notion
   ========================================================================= */

/* ---------- helper de DOM ---------- */
function h(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const k in attrs) {
    const v = attrs[k];
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k === 'html') e.innerHTML = v;
    else if (k === 'style') e.style.cssText = v;
    else if (k === 'dataset') { for (const d in v) e.dataset[d] = v[d]; }
    else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v);
  }
  for (const kid of kids.flat()) {
    if (kid == null || kid === false) continue;
    e.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  }
  return e;
}
const $ = (s, r = document) => r.querySelector(s);

/* ---------- ícones ---------- */
const I = {
  text:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7V5h16v2M9 19h6M12 5v14"/></svg>',
  number:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 9h16M4 15h16M10 4 8 20M16 4l-2 16"/></svg>',
  select:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
  multiselect:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>',
  status:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18" fill="currentColor" stroke="none"/></svg>',
  date:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
  person:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
  checkbox:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="m8 12 3 3 5-6"/></svg>',
  url:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>',
  email:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>',
  formula:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h12l-7 16M8 12h8"/></svg>',
  toggle:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="10" rx="5"/><circle cx="8" cy="12" r="2.5" fill="currentColor" stroke="none"/></svg>',
  sparkle:(c)=>`<svg class="spark" width="13" height="13" viewBox="0 0 24 24" fill="${c}" aria-hidden="true"><path d="M12 2l1.6 5.4L19 9l-5.4 1.6L12 16l-1.6-5.4L5 9l5.4-1.6L12 2z"/><path d="M19 14l.7 2.3L22 17l-2.3.7L19 20l-.7-2.3L16 17l2.3-.7L19 14z"/></svg>`,
  msg:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z"/></svg>',
  gear:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1A1.6 1.6 0 0 0 9 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1A1.6 1.6 0 0 0 4.6 9a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/></svg>',
  chevDown:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
  chevRight:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>',
  dots:'<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></svg>',
  grip:'<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg>',
  check:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m20 6-11 11-5-5"/></svg>',
  plus:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  x:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  search:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3-3"/></svg>',
  filter:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5h18l-7 8v6l-4-2v-4z"/></svg>',
  sort:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h12M3 12h8M3 18h4M17 8V4m0 0-3 3m3-3 3 3"/></svg>',
  group:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="6" rx="1.5"/><rect x="3" y="14" width="18" height="6" rx="1.5"/></svg>',
  eye:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>',
  eyeOff:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.9 4.2A9.6 9.6 0 0 1 12 4c6.5 0 10 7 10 7a13 13 0 0 1-2.4 3.1M6.6 6.6A13 13 0 0 0 2 11s3.5 7 10 7a9.6 9.6 0 0 0 4-.9M3 3l18 18M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>',
  arrowUp:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
  arrowDown:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>',
  trash:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  copy:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
  link:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>',
  freeze:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M2 12h20M5 5l14 14M19 5 5 19"/></svg>',
  wrap:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M3 18h6M3 12h15a3 3 0 0 1 0 6h-3m0 0 2-2m-2 2 2 2"/></svg>',
  insertL:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5v14M4 12h2M14 8v8a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2z"/></svg>',
  insertR:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5v14M20 12h-2M10 8v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2z"/></svg>',
  open:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M10 14 21 3M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/></svg>',
  board:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="6" height="16" rx="1.5"/><rect x="11" y="4" width="6" height="11" rx="1.5"/></svg>',
  tableIc:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 4v16"/></svg>',
};

/* ---------- tons semânticos (base) + paleta (genérica) ---------- */
const TONES = {
  success:{cls:'success'}, warning:{cls:'warning'}, destructive:{cls:'destructive'}, neutral:{cls:'neutral'},
};
const TONE_HEX = { success:'#16a34a', warning:'#d97706', destructive:'#dc2626', neutral:'#0a0a0a' };
const COLORS = {
  gray:{bg:'#e3e2e0',dot:'#9b9a97'}, brown:{bg:'#eee0da',dot:'#a3613c'}, orange:{bg:'#fadec9',dot:'#d9730d'},
  yellow:{bg:'#fdecc8',dot:'#dfab01'}, green:{bg:'#dbeddb',dot:'#0f7b6c'}, blue:{bg:'#d3e5ef',dot:'#0b6e99'},
  purple:{bg:'#e8deee',dot:'#6940a5'}, pink:{bg:'#f5e0e9',dot:'#ad1a72'}, red:{bg:'#ffe2dd',dot:'#e03e3e'},
};
const COLOR_KEYS = Object.keys(COLORS);

/* ---------- catálogo de tipos ---------- */
const TYPES = {
  text:{label:'Texto', icon:I.text},
  status_ai:{label:'Status (IA)', icon:I.status},
  confidence:{label:'Confiança', icon:I.select},
  select:{label:'Seleção', icon:I.select},
  multiselect:{label:'Multi-seleção', icon:I.multiselect},
  number:{label:'Número', icon:I.number},
  date:{label:'Data', icon:I.date},
  person:{label:'Pessoa', icon:I.person},
  checkbox:{label:'Checkbox', icon:I.checkbox},
  url:{label:'URL', icon:I.url},
  email:{label:'Email', icon:I.email},
  formula:{label:'Fórmula', icon:I.formula},
  toggle_action:{label:'Ação (toggle)', icon:I.toggle},
  revisar:{label:'Revisar', icon:I.gear},
  delete_action:{label:'Excluir', icon:I.trash},
};

const PEOPLE = [
  {id:'u1', name:'Ana Lima', color:'#e06b6b'},
  {id:'u2', name:'Bruno Khauã', color:'#3a9b9e'},
  {id:'u3', name:'Carla Reis', color:'#d97706'},
];
const initials = n => n.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();

/* ---------- esquema (base do Figma) ---------- */
let nextId = 100;
const uid = (p='id') => `${p}${nextId++}`;

let columns = [
  {id:'requisito', name:'Requisito', type:'text', width:260, title:true, hidden:false, wrap:false, agg:'count_values'},
  {id:'status', name:'Status', type:'status_ai', width:170, hidden:false, wrap:false, agg:'none', options:[
    {id:'atende',  name:'Atende', tone:'success'},
    {id:'parcial', name:'Atende com parcialidade', tone:'warning'},
    {id:'revisao', name:'Em revisão', tone:'neutral'},
    {id:'naoatende', name:'Não atende', tone:'destructive'},
  ]},
  {id:'confianca', name:'Confiança IA', type:'confidence', width:120, hidden:false, wrap:false, agg:'none', options:[
    {id:'alta', name:'Alta', tone:'success'},
    {id:'media', name:'Média', tone:'warning'},
    {id:'baixa', name:'Baixa', tone:'destructive'},
  ]},
  {id:'fonte', name:'Fonte', type:'url', width:120, hidden:false, wrap:false, agg:'none'},
  {id:'bloco', name:'Bloco', type:'select', width:140, hidden:false, wrap:false, agg:'none', renderAs:'pill', options:[
    {id:'b1', name:'Funcional', color:'blue'},
    {id:'b2', name:'Não funcional', color:'purple'},
    {id:'b3', name:'Segurança', color:'red'},
    {id:'b4', name:'Integração', color:'orange'},
    {id:'b5', name:'Infraestrutura', color:'green'},
  ]},
  {id:'notas', name:'Notas', type:'text', width:120, hidden:false, wrap:false, agg:'none'},
  {id:'questionar', name:'Questionar', type:'toggle_action', width:110, hidden:false, wrap:false, agg:'none', system:true},
  {id:'impugnar', name:'Impugnar', type:'toggle_action', width:110, hidden:false, wrap:false, agg:'none', system:true},
  {id:'revisar', name:'Revisar', type:'revisar', width:130, hidden:false, wrap:false, agg:'none', system:true},
  {id:'excluir', name:'Excluir', type:'delete_action', width:90, hidden:false, wrap:false, agg:'none', system:true},
];

/* ---------- linhas: gerador de 100 requisitos variados ---------- */
const REQUISITOS = [
  'Autenticação de dois fatores','Controle de acesso por perfil','Exportação de relatórios em PDF',
  'Integração com gov.br','Assinatura digital ICP-Brasil','Backup automático diário','Trilha de auditoria',
  'Disponibilidade mínima de 99,5%','Suporte técnico 8x5','Painel de indicadores','API REST documentada',
  'Conformidade com a LGPD','Importação de planilhas','Notificações por e-mail','Busca textual avançada',
  'Versionamento de documentos','Gestão de prazos e alertas','Cadastro de fornecedores','Emissão de empenho',
  'Controle orçamentário','Workflow de aprovação','Histórico de alterações','Acessibilidade WCAG 2.1',
  'Interface multi-idioma','Recuperação de senha','Dashboard em tempo real','Geração de protocolo',
  'Anexos de até 50MB','Filtros salvos por usuário','Logs de segurança','Cadastro de licitações',
  'Análise técnica de propostas','Emissão de ata de registro','Controle de impugnações','Gestão de recursos',
];
const NOTAS = ['Verificar com o jurídico','Aguardando publicação do edital','Depende de terceiros','Revisar redação','Validado pela equipe',''];
const STATUS_IDS=['atende','parcial','revisao','naoatende'];
const CONF_IDS=['alta','media','baixa'];
const BLOCO_IDS=['b1','b2','b3','b4','b5'];
const REV_IDS=['off','andamento','revisado','pendente'];

function buildRows(n){
  let seed=20260608;                              // RNG determinístico (sem Math.random p/ layout estável)
  const rnd=()=>{seed=(seed*1103515245+12345)&0x7fffffff; return seed/0x7fffffff;};
  const pick=a=>a[Math.floor(rnd()*a.length)];
  const out=[];
  for(let i=0;i<n;i++){
    out.push({
      id:'r'+(i+1),
      requisito: REQUISITOS[i % REQUISITOS.length],
      status: pick(STATUS_IDS),
      confianca: pick(CONF_IDS),
      fonte: rnd()>0.25 ? 'https://exemplo.com/doc/'+(i+1) : '',
      bloco: pick(BLOCO_IDS),
      notas: pick(NOTAS),
      questionar: rnd()>0.6,
      impugnar: rnd()>0.72,
      revisar: pick(REV_IDS),
    });
  }
  return out;
}
let rows = buildRows(100);

/* ---------- estado da view ---------- */
const state = {
  view:'table', search:'', showSearch:false,
  sorts:[], filters:[], group:null,
  collapsed:new Set(), selected:new Set(),
  boardGroup:'status',
};

/* =========================================================================
   Valores
   ========================================================================= */
const colById = id => columns.find(c=>c.id===id);
const optById = (col,id) => (col.options||[]).find(o=>o.id===id);

/* chip visual por tipo (usado em célula, editor, board, grupo) */
function optChip(col, id, {removable=false, onRemove=null} = {}){
  const o = optById(col,id); if(!o) return null;
  if(col.type==='confidence'){
    return h('span',{class:'conf '+(TONES[o.tone]?TONES[o.tone].cls:'neutral')}, o.name);
  }
  if(col.type==='status_ai'){
    const cls = TONES[o.tone]?TONES[o.tone].cls:'neutral';
    return h('span',{class:'badge '+cls},
      h('span',{html:I.sparkle(TONE_HEX[o.tone]||'#0a0a0a')}),
      h('span',{class:'blabel'}, o.name),
      removable?h('span',{class:'x',html:I.x,onclick:e=>{e.stopPropagation();onRemove&&onRemove();}}):null);
  }
  if(col.renderAs==='pill'){
    return h('span',{class:'pill'}, o.name,
      removable?h('span',{class:'x',html:I.x,style:'margin-left:4px',onclick:e=>{e.stopPropagation();onRemove&&onRemove();}}):null);
  }
  const c = COLORS[o.color]||COLORS.gray;
  return h('span',{class:'tag',style:`background:${c.bg}`}, o.name,
    removable?h('span',{class:'x',html:I.x,onclick:e=>{e.stopPropagation();onRemove&&onRemove();}}):null);
}

const REV_STATES = {off:'Não iniciado', andamento:'Em andamento', revisado:'Revisado', pendente:'Marcar como revisado'};

function cellText(col,row){
  const v=row[col.id];
  switch(col.type){
    case 'status_ai': case 'confidence': case 'select': { const o=optById(col,v); return o?o.name:''; }
    case 'multiselect': return (v||[]).map(id=>{const o=optById(col,id);return o?o.name:'';}).join(' ');
    case 'person': { const p=PEOPLE.find(p=>p.id===v); return p?p.name:''; }
    case 'date': return v?fmtDate(v):'';
    case 'checkbox': return v?'sim':'não';
    case 'toggle_action': return v?'Sim':'Não';
    case 'revisar': return REV_STATES[v]||'';
    case 'delete_action': return '';
    case 'formula': return col.compute?col.compute(row):'';
    default: return v==null?'':String(v);
  }
}
function cellSortKey(col,row){
  const v=row[col.id];
  if(col.type==='number') return v==null||v===''?-Infinity:Number(v);
  if(col.type==='checkbox'||col.type==='toggle_action') return v?1:0;
  if(col.type==='date') return v?new Date(v).getTime():-Infinity;
  if(['status_ai','confidence','select'].includes(col.type)){ const i=(col.options||[]).findIndex(o=>o.id===v); return i<0?999:i; }
  if(col.type==='revisar'){ return ['off','andamento','pendente','revisado'].indexOf(v); }
  return cellText(col,row).toLowerCase();
}
function fmtDate(s){ if(!s)return''; return new Date(s+'T00:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'}); }

/* =========================================================================
   Filtro / ordenação / busca
   ========================================================================= */
function passFilter(row,f){
  const col=colById(f.col); if(!col) return true;
  // filtro sem valor ainda preenchido = no-op (não esconde nada)
  const needsVal=['contains','not_contains','is','is_not','gt','lt','eq'].includes(f.op);
  if(needsVal && (f.value==null || f.value==='')) return true;
  const txt=cellText(col,row).toLowerCase(); const val=(f.value||'').toString().toLowerCase();
  switch(f.op){
    case 'contains': return txt.includes(val);
    case 'not_contains': return !txt.includes(val);
    case 'is': return ['status_ai','confidence','select'].includes(col.type)?row[col.id]===f.value:txt===val;
    case 'is_not': return ['status_ai','confidence','select'].includes(col.type)?row[col.id]!==f.value:txt!==val;
    case 'empty': return txt===''||(Array.isArray(row[col.id])&&!row[col.id].length);
    case 'not_empty': return !(txt===''||(Array.isArray(row[col.id])&&!row[col.id].length));
    case 'checked': return !!row[col.id];
    case 'unchecked': return !row[col.id];
    case 'gt': return Number(row[col.id])>Number(f.value);
    case 'lt': return Number(row[col.id])<Number(f.value);
    case 'eq': return Number(row[col.id])===Number(f.value);
    default: return true;
  }
}
function visibleRows(){
  let out=rows.slice();
  if(state.search.trim()){ const q=state.search.trim().toLowerCase(); out=out.filter(r=>columns.some(c=>cellText(c,r).toLowerCase().includes(q))); }
  for(const f of state.filters) out=out.filter(r=>passFilter(r,f));
  for(let i=state.sorts.length-1;i>=0;i--){
    const s=state.sorts[i], col=colById(s.col); if(!col) continue;
    out.sort((a,b)=>{const ka=cellSortKey(col,a),kb=cellSortKey(col,b);let c=ka<kb?-1:ka>kb?1:0;return s.dir==='desc'?-c:c;});
  }
  return out;
}

/* =========================================================================
   Agregações
   ========================================================================= */
const AGGS={
  none:{label:'Calcular',fn:()=>''},
  count_all:{label:'Contar tudo',fn:rs=>rs.length},
  count_values:{label:'Valores',fn:(rs,c)=>rs.filter(r=>cellText(c,r)!=='').length},
  count_unique:{label:'Únicos',fn:(rs,c)=>new Set(rs.map(r=>cellText(c,r)).filter(Boolean)).size},
  count_empty:{label:'Vazios',fn:(rs,c)=>rs.filter(r=>cellText(c,r)==='').length},
  count_not_empty:{label:'Preenchidos',fn:(rs,c)=>rs.filter(r=>cellText(c,r)!=='').length},
  percent_empty:{label:'% vazio',fn:(rs,c)=>rs.length?Math.round(rs.filter(r=>cellText(c,r)==='').length/rs.length*100)+'%':'0%'},
  sum:{label:'Soma',fn:(rs,c)=>rs.reduce((a,r)=>a+(Number(r[c.id])||0),0)},
  avg:{label:'Média',fn:(rs,c)=>{const n=rs.map(r=>Number(r[c.id])||0);return n.length?(n.reduce((a,b)=>a+b,0)/n.length).toFixed(1):0;}},
  min:{label:'Mín',fn:(rs,c)=>Math.min(...rs.map(r=>Number(r[c.id])||0))},
  max:{label:'Máx',fn:(rs,c)=>Math.max(...rs.map(r=>Number(r[c.id])||0))},
  percent_checked:{label:'% marcado',fn:(rs,c)=>rs.length?Math.round(rs.filter(r=>r[c.id]).length/rs.length*100)+'%':'0%'},
  checked:{label:'Marcados',fn:(rs,c)=>rs.filter(r=>r[c.id]).length},
};
function aggsFor(col){
  const base=['none','count_all','count_values','count_unique','count_empty','count_not_empty','percent_empty'];
  if(col.type==='number') return [...base,'sum','avg','min','max'];
  if(col.type==='checkbox'||col.type==='toggle_action') return ['none','checked','percent_checked','count_all'];
  if(col.type==='delete_action') return ['none'];
  return base;
}

/* =========================================================================
   Popovers
   ========================================================================= */
function openPop(anchor,node,{align='left'}={}){
  closePop();
  const ov=$('#overlay'); ov.innerHTML='';
  const pop=h('div',{class:'popover'},node);
  ov.append(pop); ov.classList.add('show');
  const r=anchor.getBoundingClientRect();
  pop.style.visibility='hidden';
  requestAnimationFrame(()=>{
    const pw=pop.offsetWidth, ph=pop.offsetHeight;
    let left=align==='right'?r.right-pw:r.left, top=r.bottom+4;
    if(left+pw>innerWidth-8) left=innerWidth-pw-8; if(left<8) left=8;
    if(top+ph>innerHeight-8) top=Math.max(8,r.top-ph-4);
    pop.style.left=left+'px'; pop.style.top=top+'px'; pop.style.visibility='visible';
  });
  ov.onclick=e=>{ if(e.target===ov) closePop(); };
  return pop;
}
function closePop(){ const ov=$('#overlay'); ov.classList.remove('show'); ov.innerHTML=''; ov.onclick=null; }
function item(label,icon,onClick,opts={}){
  return h('button',{class:'pop-item'+(opts.danger?' danger':'')+(opts.active?' active':''),onclick:onClick},
    icon?h('span',{class:'ic',html:icon}):null, h('span',{},label),
    opts.chevron?h('span',{class:'chevron',html:I.chevRight}):null,
    opts.kbd?h('span',{class:'kbd'},opts.kbd):null,
    opts.active?h('span',{class:'ic-check',html:I.check}):null);
}
let toastTimer;
function toast(msg){ let t=$('.toast'); if(!t){t=h('div',{class:'toast'});document.body.append(t);} t.textContent=msg; t.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>t.classList.remove('show'),1600); }

/* =========================================================================
   Render principal
   ========================================================================= */
function render(){ rerenderArea(); }
function rerenderArea(){ const a=$('#viewArea'); a.innerHTML=''; a.append(state.view==='board'?renderBoard():renderTable()); }

function renderViewbar(){
  const bar=$('#viewbar'); bar.innerHTML='';
  const tab=(id,label,icon)=>h('button',{class:'view-tab'+(state.view===id?' active':''),onclick:()=>{state.view=id;render();}}, h('span',{class:'ic',html:icon}),label);
  bar.append(tab('table','Tabela',I.tableIc), tab('board','Quadro',I.board),
    h('button',{class:'view-add',html:I.plus,title:'Nova view',onclick:()=>toast('Abriria o seletor de novas views.')}));
}

function renderToolbar(){
  const tb=$('#toolbar'); tb.innerHTML=''; tb.append(h('div',{class:'spacer'}));
  if(state.showSearch){
    const inp=h('input',{placeholder:'Buscar…',value:state.search,oninput:e=>{state.search=e.target.value;rerenderArea();}});
    tb.append(h('div',{class:'tb-search'},h('span',{class:'ic',html:I.search}),inp,h('span',{class:'ic',style:'cursor:pointer;color:var(--muted-fg)',html:I.x,onclick:()=>{state.showSearch=false;state.search='';render();}})));
    setTimeout(()=>inp.focus(),0);
  } else tb.append(tbBtn(I.search,null,()=>{state.showSearch=true;renderToolbar();}));
  tb.append(
    tbBtn(I.filter,'Filtros',openFilters,state.filters.length),
    tbBtn(I.sort,'Ordenar',openSorts,state.sorts.length),
    tbBtn(I.group,'Agrupar',openGroup,state.group?1:0),
    tbBtn(I.dots,null,openProperties));
  tb.append(h('div',{class:'tb-new'},
    h('button',{class:'main',onclick:()=>addRow()},h('span',{class:'ic',html:I.plus}),'Novo'),
    h('button',{class:'caret',html:I.chevDown,onclick:e=>openPop(e.currentTarget,h('div',{},item('Nova linha vazia',I.plus,()=>{closePop();addRow();})),{align:'right'})})));
}
function tbBtn(icon,label,onClick,badge){ return h('button',{class:'tb-btn'+(badge?' active':''),onclick:e=>onClick(e.currentTarget)},h('span',{class:'ic',html:icon}),label?h('span',{},label):null,badge?h('span',{class:'tb-badge'},badge):null); }

/* =========================================================================
   TABELA
   ========================================================================= */
function visibleCols(){ return columns.filter(c=>!c.hidden); }
const titleCol = () => columns.find(c=>c.title) || columns[0];

function renderTable(){
  const cols=visibleCols(); const data=visibleRows();
  const card=h('div',{class:'table-card'});
  const scroll=h('div',{class:'tbl-scroll'});
  const table=h('table',{class:'tbl'});

  const cg=h('colgroup');
  cols.forEach(c=>cg.append(h('col',{dataset:{col:c.id},style:`width:${c.width}px`})));
  cg.append(h('col',{style:'width:160px'}));
  table.append(cg);

  // THEAD
  const thead=h('thead'); const htr=h('tr');
  cols.forEach(c=>htr.append(thCell(c,data)));
  htr.append(h('th',{class:'add-col'},h('div',{class:'th-inner',onclick:e=>openAddColumn(e.currentTarget),title:'Adicionar coluna'},h('span',{html:I.plus}),'Adicionar coluna')));
  thead.append(htr); table.append(thead);

  // TBODY
  const tbody=h('tbody');
  if(state.group){
    groupRows(data).forEach(g=>{
      const collapsed=state.collapsed.has(g.key);
      const gtr=h('tr'); const gtd=h('td',{colspan:cols.length+1});
      gtd.append(h('div',{class:'group-head'+(collapsed?' collapsed':''),onclick:()=>{collapsed?state.collapsed.delete(g.key):state.collapsed.add(g.key);rerenderArea();}},
        h('span',{class:'caret',html:I.chevDown}), g.label, h('span',{class:'group-count'},g.rows.length)));
      gtr.append(gtd); tbody.append(gtr);
      if(!collapsed) g.rows.forEach(r=>tbody.append(bodyRow(r,cols)));
    });
  } else data.forEach(r=>tbody.append(bodyRow(r,cols)));
  table.append(tbody);

  // TFOOT
  const tfoot=h('tfoot'); const ftr=h('tr');
  cols.forEach(c=>ftr.append(footCell(c,data)));
  ftr.append(h('td'));
  tfoot.append(ftr); table.append(tfoot);

  scroll.append(table); card.append(scroll);
  card.append(h('button',{class:'add-req',onclick:()=>addRow()},h('span',{class:'ic',html:I.plus}),'Adicionar requisito'));
  enableColResize(table);
  return card;
}

function thCell(col,data){
  const th=h('th',{dataset:{col:col.id},draggable:'true'});
  let inner;
  if(col.type==='delete_action'){
    inner=h('div',{class:'th-inner',onclick:e=>openColMenu(col,th)},
      h('span',{class:'excluir-trunc'},col.name),
      h('span',{class:'trash-head',html:I.trash}),
      h('span',{class:'th-menu',html:I.chevDown}));
    th.classList.add('excluir-col');
  } else {
    const isTitle=col.title;
    inner=h('div',{class:'th-inner',onclick:e=>{ if(e.target.closest('.th-selall'))return; openColMenu(col,th);}},
      isTitle? h('span',{class:'th-selall'+(allSelected(data)?' on':''),html:allSelected(data)?I.check:'',onclick:e=>{e.stopPropagation();toggleAll(data);}}):null,
      h('span',{class:'th-type-ic',html:TYPES[col.type].icon}),
      h('span',{class:'th-name'},col.name),
      h('span',{class:'th-menu',html:I.chevDown}));
  }
  th.append(inner, h('div',{class:'th-resize'}));
  th.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/col',col.id);th.classList.add('dragging');});
  th.addEventListener('dragend',()=>th.classList.remove('dragging'));
  th.addEventListener('dragover',e=>{if(e.dataTransfer.types.includes('text/col'))e.preventDefault();});
  th.addEventListener('drop',e=>{const f=e.dataTransfer.getData('text/col');if(f&&f!==col.id){e.preventDefault();moveColumn(f,col.id);render();}});
  return th;
}

function bodyRow(row,cols){
  const tr=h('tr',{dataset:{row:row.id}});
  if(state.selected.has(row.id)) tr.classList.add('sel');
  tr.addEventListener('dragover',e=>{if(e.dataTransfer.types.includes('text/row'))e.preventDefault();});
  tr.addEventListener('drop',e=>{const f=e.dataTransfer.getData('text/row');if(f&&f!==row.id){e.preventDefault();moveRow(f,row.id);rerenderArea();}});
  cols.forEach(c=>tr.append(cellTd(c,row)));
  tr.append(h('td'));
  return tr;
}

/* ---------- célula por tipo ---------- */
function cellTd(col,row){
  const td=h('td',{dataset:{col:col.id,row:row.id}});
  const cell=h('div',{class:'cell'+(col.wrap?'':' nowrap')});
  const v=row[col.id];

  switch(col.type){
    case 'text': {
      if(col.title){
        cell.classList.add('title-cell');
        const sel=state.selected.has(row.id);
        const grip=h('span',{class:'row-grip',html:I.grip,draggable:'true',title:'Arrastar / menu',
          onclick:e=>{e.stopPropagation();openRowMenu(row,e.currentTarget);}});
        grip.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/row',row.id);td.closest('tr').classList.add('dragging');});
        grip.addEventListener('dragend',()=>td.closest('tr').classList.remove('dragging'));
        const chk=h('span',{class:'row-check'+(sel?' on':''),html:sel?I.check:'',onclick:e=>{e.stopPropagation();sel?state.selected.delete(row.id):state.selected.add(row.id);rerenderArea();}});
        cell.append(grip, chk,
          v?h('span',{class:'title-txt'},v):h('span',{class:'placeholder-txt'},'Vazio'),
          h('button',{class:'cell-open',onclick:e=>{e.stopPropagation();openRowPeek(row);}},h('span',{html:I.open}),'Abrir'));
      } else {
        cell.append(v?document.createTextNode(v):h('span',{class:'cell-empty'},''));
      }
      cell.addEventListener('dblclick',()=>startInlineEdit(td,col,row));
      td.addEventListener('click',e=>{ if(e.target.closest('.cell-open,.row-grip,.row-check'))return; startInlineEdit(td,col,row); });
      break;
    }
    case 'number': {
      if(v==null||v==='') cell.append(h('span',{class:'cell-empty'},''));
      else if(col.showAs==='bar'){ cell.append(h('span',{class:'num'},v),h('span',{class:'num-bar'},h('i',{style:`width:${Math.min(100,v/(col.max||10)*100)}%`}))); }
      else cell.append(h('span',{class:'num'},v));
      td.addEventListener('click',()=>startInlineEdit(td,col,row));
      break;
    }
    case 'url': case 'email': {
      if(v){ const href=col.type==='email'?'mailto:'+v:v; cell.append(h('a',{class:'lnk fonte-link',href,target:'_blank',onclick:e=>e.stopPropagation()}, col.id==='fonte'?'Hyperlink':v.replace(/^https?:\/\//,''))); }
      else cell.append(h('span',{class:'cell-empty'}, col.id==='fonte'?'Hyperlink':''));
      td.addEventListener('click',e=>{ if(e.target.closest('a'))return; startInlineEdit(td,col,row); });
      break;
    }
    case 'status_ai': case 'confidence': case 'select': {
      const chip=v?optChip(col,v):null;
      cell.append(chip||h('span',{class:'cell-empty'},''));
      td.addEventListener('click',()=>openSelectEditor(col,row,td));
      break;
    }
    case 'multiselect': {
      const arr=v||[]; if(arr.length) arr.forEach(id=>{const c=optChip(col,id);if(c)cell.append(c);}); else cell.append(h('span',{class:'cell-empty'},''));
      td.addEventListener('click',()=>openSelectEditor(col,row,td));
      break;
    }
    case 'person': {
      const p=PEOPLE.find(p=>p.id===v);
      cell.append(p?h('span',{class:'person'},h('span',{class:'avatar',style:`background:${p.color}`},initials(p.name)),p.name.split(' ')[0]):h('span',{class:'cell-empty'},''));
      td.addEventListener('click',()=>openPersonEditor(col,row,td));
      break;
    }
    case 'date': {
      cell.append(v?document.createTextNode(fmtDate(v)):h('span',{class:'cell-empty'},''));
      td.addEventListener('click',()=>openDateEditor(col,row,td));
      break;
    }
    case 'checkbox': {
      cell.classList.add('center'); cell.style.cursor='pointer';
      cell.append(h('span',{class:'cb'+(v?' on':''),html:v?I.check:''}));
      td.addEventListener('click',()=>{row[col.id]=!row[col.id];rerenderArea();});
      break;
    }
    case 'toggle_action': {
      const sw=h('span',{class:'switch'+(v?' on':''),onclick:()=>{row[col.id]=!row[col.id];rerenderArea();}},h('span',{class:'track'}),h('span',{class:'thumb'}));
      cell.append(v?h('span',{class:'toggle-wrap'},sw,h('span',{class:'icon-muted',html:I.msg})):sw);
      cell.style.cursor='pointer';
      break;
    }
    case 'revisar': {
      cell.append(revisarWidget(col,row));
      cell.style.cursor='pointer';
      break;
    }
    case 'delete_action': {
      cell.classList.add('center');
      cell.append(h('button',{class:'del-btn',html:I.trash,title:'Excluir linha',onclick:e=>{e.stopPropagation();rows=rows.filter(r=>r!==row);state.selected.delete(row.id);rerenderArea();}}));
      break;
    }
    case 'formula': {
      cell.append(h('span',{style:'color:var(--muted-fg)'}, col.compute?col.compute(row):''));
      break;
    }
  }
  td.append(cell);
  return td;
}

function revisarWidget(col,row){
  const v=row[col.id]||'off';
  const openMenu=(anchor)=>openPop(anchor,h('div',{},Object.keys(REV_STATES).map(k=>
    item(REV_STATES[k], k==='revisado'?I.check:k==='andamento'?I.gear:null, ()=>{row[col.id]=k;closePop();rerenderArea();},{active:v===k}))));
  if(v==='off'||v==='andamento'){
    const sw=h('span',{class:'switch'+(v==='andamento'?' on':''),onclick:e=>{e.stopPropagation();row[col.id]=v==='off'?'andamento':'off';rerenderArea();}},h('span',{class:'track'}),h('span',{class:'thumb'}));
    return v==='andamento'? h('span',{class:'toggle-wrap'},sw,h('span',{class:'icon-muted',html:I.gear,onclick:e=>{e.stopPropagation();openMenu(e.currentTarget);}})) : sw;
  }
  if(v==='revisado') return h('button',{class:'btn btn-rev',onclick:e=>{e.stopPropagation();openMenu(e.currentTarget);}},h('span',{html:I.check}),h('span',{class:'blabel'},'Revisado'));
  return h('button',{class:'btn btn-brand',onclick:e=>{e.stopPropagation();row[col.id]='revisado';rerenderArea();}},h('span',{class:'blabel'},'Marcar como revisado'));
}

/* ---------- edição inline ---------- */
function startInlineEdit(td,col,row){
  if(td.classList.contains('editing')) return;
  td.classList.add('editing');
  const cell=td.querySelector('.cell'); cell.innerHTML=''; cell.classList.remove('title-cell');
  cell.contentEditable='true'; cell.textContent=row[col.id]==null?'':String(row[col.id]); cell.focus();
  const range=document.createRange(); range.selectNodeContents(cell);
  const sel=getSelection(); sel.removeAllRanges(); sel.addRange(range);
  const commit=()=>{cell.contentEditable='false';td.classList.remove('editing');let val=cell.textContent.trim();if(col.type==='number')val=val===''?'':Number(val.replace(',','.'));row[col.id]=val;rerenderArea();};
  cell.addEventListener('blur',commit,{once:true});
  cell.addEventListener('keydown',e=>{ if(e.key==='Enter'){e.preventDefault();cell.blur();} if(e.key==='Escape'){cell.textContent=row[col.id]==null?'':String(row[col.id]);cell.blur();} });
}

/* ---------- editor de seleção ---------- */
function openSelectEditor(col,row,anchor){
  const multi=col.type==='multiselect';
  const build=()=>{
    const cur=multi?(row[col.id]||[]):(row[col.id]?[row[col.id]]:[]);
    const wrap=h('div',{style:'min-width:240px'});
    const top=h('div',{class:'sel-current'});
    if(cur.length) cur.forEach(id=>{const c=optChip(col,id,{removable:true,onRemove:()=>{if(multi)row[col.id]=(row[col.id]||[]).filter(x=>x!==id);else row[col.id]=null;openSelectEditor(col,row,anchor);}});if(c)top.append(c);});
    else top.append(h('span',{style:'color:var(--muted-fg);font-size:13px'},'Vazio'));
    wrap.append(top);
    const search=h('input',{class:'pop-input',placeholder:'Buscar ou criar opção…'}); wrap.append(search);
    const list=h('div',{});
    const draw=(q='')=>{
      list.innerHTML='';
      (col.options||[]).filter(o=>o.name.toLowerCase().includes(q.toLowerCase())).forEach(o=>{
        const on=multi?(row[col.id]||[]).includes(o.id):row[col.id]===o.id;
        list.append(h('div',{class:'opt-row'+(on?' on':''),onclick:()=>{
          if(multi){const a=row[col.id]||[];row[col.id]=a.includes(o.id)?a.filter(x=>x!==o.id):[...a,o.id];}
          else row[col.id]=row[col.id]===o.id?null:o.id;
          openSelectEditor(col,row,anchor);}},
          optChip(col,o.id), h('span',{style:'flex:1'}),
          h('button',{class:'eye',style:'background:none;border:none;color:var(--muted-fg)',html:I.dots,onclick:e=>{e.stopPropagation();openOptionMenu(col,o,e.currentTarget,()=>openSelectEditor(col,row,anchor));}}),
          h('span',{class:'check',html:I.check})));
      });
      const q2=q.trim();
      if(q2 && !(col.options||[]).some(o=>o.name.toLowerCase()===q2.toLowerCase())){
        list.append(h('div',{class:'opt-create',onclick:()=>{
          const o={id:uid('o'),name:q2,color:COLOR_KEYS[(col.options||[]).length%COLOR_KEYS.length]};
          if(col.type==='status_ai'||col.type==='confidence') o.tone='neutral';
          col.options=col.options||[]; col.options.push(o);
          if(multi)row[col.id]=[...(row[col.id]||[]),o.id];else row[col.id]=o.id;
          openSelectEditor(col,row,anchor);}}, h('span',{class:'ic',html:I.plus}),'Criar ',h('strong',{style:'margin-left:4px'},q2)));
      }
    };
    draw(); search.addEventListener('input',()=>draw(search.value)); wrap.append(list);
    return wrap;
  };
  openPop(anchor,build());
  setTimeout(()=>{const i=$('#overlay .pop-input');i&&i.focus();},0);
}
function openOptionMenu(col,opt,anchor,back){
  const useTone = col.type==='status_ai'||col.type==='confidence';
  const node=h('div',{},
    (()=>{const inp=h('input',{class:'pop-input',value:opt.name});inp.addEventListener('input',()=>opt.name=inp.value);inp.addEventListener('keydown',e=>{if(e.key==='Enter')back();});return inp;})(),
    h('div',{class:'pop-sep'}), h('div',{class:'pop-label'},'Cor'),
    useTone
      ? h('div',{style:'display:flex;gap:6px;padding:4px;flex-wrap:wrap'}, Object.keys(TONES).map(t=>h('button',{class:'tb-btn'+(opt.tone===t?' active':''),style:`color:${TONE_HEX[t]}`,onclick:()=>{opt.tone=t;back();}},t)))
      : h('div',{class:'swatches'}, COLOR_KEYS.map(k=>h('div',{class:'swatch'+(opt.color===k?' on':''),style:`background:${COLORS[k].bg}`,title:k,onclick:()=>{opt.color=k;back();}}))),
    h('div',{class:'pop-sep'}),
    item('Excluir opção',I.trash,()=>{col.options=col.options.filter(o=>o.id!==opt.id);rows.forEach(r=>{if(Array.isArray(r[col.id]))r[col.id]=r[col.id].filter(x=>x!==opt.id);else if(r[col.id]===opt.id)r[col.id]=null;});back();},{danger:true}));
  openPop(anchor,node);
}
function openPersonEditor(col,row,anchor){
  openPop(anchor,h('div',{}, h('div',{class:'pop-label'},'Pessoa'),
    ...PEOPLE.map(p=>h('button',{class:'pop-item'+(row[col.id]===p.id?' active':''),onclick:()=>{row[col.id]=row[col.id]===p.id?null:p.id;closePop();rerenderArea();}},
      h('span',{class:'avatar',style:`background:${p.color}`},initials(p.name)),p.name,
      row[col.id]===p.id?h('span',{class:'ic-check',html:I.check}):null))));
}
function openDateEditor(col,row,anchor){
  const inp=h('input',{type:'date',class:'pop-input',value:row[col.id]||''}); inp.addEventListener('change',()=>{row[col.id]=inp.value;rerenderArea();});
  openPop(anchor,h('div',{},h('div',{class:'pop-label'},'Data'),inp,h('div',{class:'pop-sep'}),item('Limpar',I.x,()=>{row[col.id]='';closePop();rerenderArea();})));
  setTimeout(()=>inp.focus(),0);
}

/* ---------- rodapé ---------- */
function footCell(col,data){
  const td=h('td',{dataset:{col:col.id}}); const agg=col.agg||'none'; const def=AGGS[agg]; const empty=agg==='none';
  td.append(h('div',{class:'agg'+(empty?' empty':''),onclick:e=>openAggMenu(col,e.currentTarget)},
    empty?h('span',{class:'placeholder-agg'},'Calcular'):h('span',{},h('span',{class:'agg-label'},def.label+' '),h('span',{class:'agg-val'},def.fn(data,col)))));
  return td;
}
function openAggMenu(col,anchor){ openPop(anchor,h('div',{},aggsFor(col).map(k=>item(AGGS[k].label,null,()=>{col.agg=k;closePop();rerenderArea();},{active:col.agg===k})))); }

/* =========================================================================
   Menus de coluna
   ========================================================================= */
function openColMenu(col,anchor){
  const idx=columns.indexOf(col); const sys=col.system;
  const nameInput=h('input',{class:'pop-input',value:col.name}); nameInput.addEventListener('input',()=>col.name=nameInput.value); nameInput.addEventListener('change',()=>render()); nameInput.addEventListener('keydown',e=>{if(e.key==='Enter'){closePop();render();}});
  const node=h('div',{},
    nameInput,
    !sys? item('Editar tipo · '+TYPES[col.type].label,TYPES[col.type].icon,e=>openTypePicker(col,anchor),{chevron:true}):null,
    !sys? h('div',{class:'pop-sep'}):null,
    !sys? item('Ordenar crescente',I.arrowUp,()=>{setSort(col,'asc');closePop();}):null,
    !sys? item('Ordenar decrescente',I.arrowDown,()=>{setSort(col,'desc');closePop();}):null,
    !sys? item('Filtrar',I.filter,()=>{closePop();addFilterFor(col);}):null,
    canGroup(col)? item('Agrupar por isto',I.group,()=>{state.group=col.id;closePop();render();}):null,
    h('div',{class:'pop-sep'}),
    item(col.wrap?'Não quebrar texto':'Quebrar texto',I.wrap,()=>{col.wrap=!col.wrap;closePop();render();}),
    item('Ocultar coluna',I.eyeOff,()=>{col.hidden=true;closePop();render();}),
    h('div',{class:'pop-sep'}),
    item('Inserir à esquerda',I.insertL,()=>{closePop();openAddColumn(anchor,idx);}),
    item('Inserir à direita',I.insertR,()=>{closePop();openAddColumn(anchor,idx+1);}),
    item('Duplicar coluna',I.copy,()=>{duplicateColumn(col);closePop();render();}),
    !col.title? item('Excluir coluna',I.trash,()=>{deleteColumn(col);closePop();render();},{danger:true}):null);
  openPop(anchor,node); setTimeout(()=>nameInput.select(),0);
}
function openTypePicker(col,anchor){
  openPop(anchor,h('div',{},h('div',{class:'pop-label'},'Tipo da propriedade'),
    h('div',{class:'type-grid'},Object.keys(TYPES).filter(t=>!['delete_action'].includes(t)).map(t=>item(TYPES[t].label,TYPES[t].icon,()=>{changeType(col,t);closePop();render();},{active:col.type===t})))));
}
function openAddColumn(anchor,at){
  const nameInput=h('input',{class:'pop-input',placeholder:'Nome da coluna'});
  openPop(anchor,h('div',{},nameInput,h('div',{class:'pop-label'},'Tipo'),
    h('div',{class:'type-grid'},Object.keys(TYPES).filter(t=>!['delete_action'].includes(t)).map(t=>item(TYPES[t].label,TYPES[t].icon,()=>{
      const col={id:uid('c'),name:nameInput.value.trim()||TYPES[t].label,type:t,width:140,hidden:false,wrap:false,agg:'none'};
      if(['select','multiselect','status_ai','confidence'].includes(t)) col.options=[];
      if(t==='select') col.renderAs='pill';
      // "+" no cabeçalho insere antes das colunas de ação; "inserir à esquerda/direita" usa a posição exata
      let pos = at;
      if(pos==null){ const firstSys=columns.findIndex(c=>c.system); pos = firstSys<0?columns.length:firstSys; }
      columns.splice(pos,0,col); closePop(); render();
    })))));
  setTimeout(()=>nameInput.focus(),0);
}
const canGroup=col=>['status_ai','confidence','select','multiselect','person','checkbox','toggle_action','revisar'].includes(col.type);
function setSort(col,dir){ state.sorts=[{col:col.id,dir}]; render(); }
function changeType(col,t){
  col.type=t; col.system=false;
  if(['select','multiselect','status_ai','confidence'].includes(t)&&!col.options) col.options=[];
  if(t==='select'&&!col.renderAs) col.renderAs='pill';
  if(t==='multiselect') rows.forEach(r=>{if(!Array.isArray(r[col.id]))r[col.id]=r[col.id]?[r[col.id]]:[];});
  if(t==='checkbox'||t==='toggle_action') rows.forEach(r=>r[col.id]=!!r[col.id]);
  col.agg='none';
}
function duplicateColumn(col){
  const copy=JSON.parse(JSON.stringify({...col,compute:undefined})); copy.id=uid('c'); copy.name=col.name+' (cópia)'; copy.title=false;
  if(col.compute) copy.compute=col.compute;
  columns.splice(columns.indexOf(col)+1,0,copy);
  rows.forEach(r=>r[copy.id]=Array.isArray(r[col.id])?[...r[col.id]]:r[col.id]);
}
function deleteColumn(col){ columns=columns.filter(c=>c!==col); state.sorts=state.sorts.filter(s=>s.col!==col.id); state.filters=state.filters.filter(f=>f.col!==col.id); if(state.group===col.id)state.group=null; }
function moveColumn(f,t){ const fi=columns.findIndex(c=>c.id===f),ti=columns.findIndex(c=>c.id===t); const [m]=columns.splice(fi,1); columns.splice(ti,0,m); }

/* ---------- linhas ---------- */
function addRow(){
  const r={id:uid('r')};
  columns.forEach(c=>{ if(c.type==='multiselect')r[c.id]=[]; else if(c.type==='checkbox'||c.type==='toggle_action')r[c.id]=false; else if(c.type==='revisar')r[c.id]='off'; else r[c.id]=''; });
  rows.push(r); rerenderArea();
}
function moveRow(f,t){ const fi=rows.findIndex(r=>r.id===f),ti=rows.findIndex(r=>r.id===t); const [m]=rows.splice(fi,1); rows.splice(ti,0,m); }
function openRowMenu(row,anchor){
  openPop(anchor,h('div',{},
    item('Abrir',I.open,()=>{closePop();openRowPeek(row);}),
    item('Copiar link',I.link,()=>{closePop();toast('Link copiado');}),
    item('Duplicar',I.copy,()=>{const c={...row,id:uid('r')};rows.splice(rows.indexOf(row)+1,0,c);closePop();rerenderArea();},{kbd:'⌘D'}),
    h('div',{class:'pop-sep'}),
    item('Excluir',I.trash,()=>{rows=rows.filter(r=>r!==row);state.selected.delete(row.id);closePop();rerenderArea();},{danger:true})));
}
function allSelected(data){ return data.length>0 && data.every(r=>state.selected.has(r.id)); }
function toggleAll(data){ allSelected(data)?data.forEach(r=>state.selected.delete(r.id)):data.forEach(r=>state.selected.add(r.id)); rerenderArea(); }

/* =========================================================================
   Toolbar popovers
   ========================================================================= */
function openSorts(anchor){
  const node=h('div',{});
  if(state.sorts.length){ state.sorts.forEach((s,i)=>{const col=colById(s.col);node.append(h('div',{class:'prop-row'},h('span',{class:'th-type-ic',html:TYPES[col.type].icon}),h('span',{style:'flex:1'},col.name),h('button',{class:'tb-btn',style:'height:24px',onclick:()=>{s.dir=s.dir==='asc'?'desc':'asc';openSorts(anchor);render();}},s.dir==='asc'?'Crescente':'Decrescente'),h('button',{class:'eye',html:I.x,onclick:()=>{state.sorts.splice(i,1);openSorts(anchor);render();}})));}); node.append(h('div',{class:'pop-sep'})); }
  node.append(h('div',{class:'pop-label'},'Adicionar ordenação'));
  columns.filter(c=>!c.system&&!state.sorts.some(s=>s.col===c.id)).forEach(c=>node.append(item(c.name,TYPES[c.type].icon,()=>{state.sorts.push({col:c.id,dir:'asc'});openSorts(anchor);render();})));
  if(state.sorts.length) node.append(h('div',{class:'pop-sep'}),item('Remover ordenação',I.trash,()=>{state.sorts=[];closePop();render();}));
  openPop(anchor,node,{align:'right'});
}
const OPS={ text:[['contains','contém'],['not_contains','não contém'],['is','é'],['empty','vazio'],['not_empty','preenchido']], number:[['eq','='],['gt','>'],['lt','<'],['empty','vazio'],['not_empty','preenchido']], select:[['is','é'],['is_not','não é'],['empty','vazio'],['not_empty','preenchido']], checkbox:[['checked','marcado'],['unchecked','desmarcado']] };
function opsFor(type){ if(['status_ai','confidence','select'].includes(type))return OPS.select; if(['checkbox','toggle_action'].includes(type))return OPS.checkbox; if(type==='number')return OPS.number; return OPS.text; }
function openFilters(anchor){
  const node=h('div',{});
  state.filters.forEach((f,i)=>{const col=colById(f.col);const ops=opsFor(col.type);
    node.append(h('div',{class:'prop-row'},h('span',{class:'th-type-ic',html:TYPES[col.type].icon}),h('span',{style:'width:80px;overflow:hidden;text-overflow:ellipsis'},col.name),
      (()=>{const s=h('select',{class:'tb-btn',style:'height:26px'});ops.forEach(([v,l])=>s.append(h('option',{value:v},l)));s.value=f.op;s.addEventListener('change',()=>{f.op=s.value;openFilters(anchor);render();});return s;})(),
      filterValueInput(f,col), h('button',{class:'eye',html:I.x,onclick:()=>{state.filters.splice(i,1);openFilters(anchor);render();}})));});
  if(state.filters.length) node.append(h('div',{class:'pop-sep'}));
  node.append(h('div',{class:'pop-label'},'Adicionar filtro'));
  columns.filter(c=>c.type!=='delete_action').forEach(c=>node.append(item(c.name,TYPES[c.type].icon,()=>{addFilterFor(c);openFilters(anchor);})));
  openPop(anchor,node,{align:'right'});
}
function filterValueInput(f,col){
  if(['empty','not_empty','checked','unchecked'].includes(f.op)) return h('span',{style:'flex:1'});
  if(['status_ai','confidence','select'].includes(col.type)){const s=h('select',{class:'tb-btn',style:'height:26px;flex:1'});s.append(h('option',{value:''},'—'));(col.options||[]).forEach(o=>s.append(h('option',{value:o.id},o.name)));s.value=f.value||'';s.addEventListener('change',()=>{f.value=s.value;render();});return s;}
  const inp=h('input',{class:'pop-input',style:'flex:1;margin:0',value:f.value||'',placeholder:'valor'}); inp.addEventListener('input',()=>{f.value=inp.value;render();}); return inp;
}
function addFilterFor(col){ state.filters.push({col:col.id,op:opsFor(col.type)[0][0],value:''}); render(); }
function openGroup(anchor){
  openPop(anchor,h('div',{},h('div',{class:'pop-label'},'Agrupar por'),
    item('Nenhum',I.x,()=>{state.group=null;closePop();render();},{active:!state.group}),
    ...columns.filter(canGroup).map(c=>item(c.name,TYPES[c.type].icon,()=>{state.group=c.id;closePop();render();},{active:state.group===c.id}))),{align:'right'});
}
function groupRows(data){
  const col=colById(state.group); if(!col) return [{key:'all',label:'Tudo',rows:data}];
  const map=new Map();
  data.forEach(r=>{ let keys; if(col.type==='multiselect') keys=(r[col.id]&&r[col.id].length)?r[col.id]:['__empty']; else { let k=r[col.id]; if(k==null||k===''||k===false) k= col.type==='toggle_action'?false:'__empty'; keys=[k]; } keys.forEach(k=>{const kk=String(k);if(!map.has(kk))map.set(kk,[]);map.get(kk).push(r);}); });
  const out=[]; const order = col.options? col.options.map(o=>String(o.id)) : [...map.keys()];
  [...new Set([...order,...map.keys()])].forEach(k=>{ if(!map.has(k))return; let label;
    if(k==='__empty') label=h('span',{style:'color:var(--muted-fg)'},'Sem '+col.name.toLowerCase());
    else if(col.type==='person'){const p=PEOPLE.find(p=>p.id===k);label=p?h('span',{class:'person'},h('span',{class:'avatar',style:`background:${p.color}`},initials(p.name)),p.name):k;}
    else if(col.type==='toggle_action'||col.type==='checkbox') label=h('strong',{},k==='true'?'Sim':'Não');
    else if(col.type==='revisar') label=h('strong',{},REV_STATES[k]||k);
    else if(col.options){const c=optChip(col,k);label=c||k;} else label=String(k);
    out.push({key:k,label,rows:map.get(k)}); });
  return out;
}
function openProperties(anchor){
  const node=h('div',{},h('div',{class:'pop-label'},'Propriedades'));
  columns.forEach(c=>{const r=h('div',{class:'prop-row',draggable:'true',dataset:{col:c.id}},h('span',{class:'grip',html:I.grip}),h('span',{class:'th-type-ic',html:TYPES[c.type].icon}),h('span',{style:'flex:1'},c.name),h('button',{class:'eye',html:c.hidden?I.eyeOff:I.eye,onclick:()=>{c.hidden=!c.hidden;openProperties(anchor);render();}}));
    r.addEventListener('dragstart',e=>e.dataTransfer.setData('text/pcol',c.id)); r.addEventListener('dragover',e=>{if(e.dataTransfer.types.includes('text/pcol'))e.preventDefault();}); r.addEventListener('drop',e=>{const f=e.dataTransfer.getData('text/pcol');if(f&&f!==c.id){moveColumn(f,c.id);openProperties(anchor);render();}}); node.append(r);});
  node.append(h('div',{class:'pop-sep'}),item('Mostrar tudo',I.eye,()=>{columns.forEach(c=>c.hidden=false);openProperties(anchor);render();}),item('Ocultar tudo',I.eyeOff,()=>{columns.forEach((c,i)=>{if(!c.title)c.hidden=true;});openProperties(anchor);render();}));
  openPop(anchor,node,{align:'right'});
}

/* ---------- resize ---------- */
function enableColResize(table){
  table.querySelectorAll('.th-resize').forEach(handle=>handle.addEventListener('mousedown',e=>{
    e.preventDefault();e.stopPropagation();
    const th=handle.closest('th');const colId=th.dataset.col;const col=colById(colId);const colEl=table.querySelector(`col[data-col="${colId}"]`);
    const startX=e.clientX,startW=col?col.width:th.offsetWidth;
    const move=ev=>{const w=Math.max(60,startW+(ev.clientX-startX));if(col)col.width=w;if(colEl)colEl.style.width=w+'px';};
    const up=()=>{document.removeEventListener('mousemove',move);document.removeEventListener('mouseup',up);};
    document.addEventListener('mousemove',move);document.addEventListener('mouseup',up);
  }));
}

/* =========================================================================
   BOARD
   ========================================================================= */
function renderBoard(){
  const col=colById(state.boardGroup)||colById('status'); const wrap=h('div',{});
  wrap.append(h('div',{class:'board-toolbar'},h('span',{style:'color:var(--muted-fg);font-size:13px;margin-right:6px'},'Agrupado por:'),
    h('button',{class:'tb-btn active',onclick:e=>openPop(e.currentTarget,h('div',{},columns.filter(canGroup).map(c=>item(c.name,TYPES[c.type].icon,()=>{state.boardGroup=c.id;closePop();rerenderArea();},{active:state.boardGroup===c.id}))))},col.name,h('span',{class:'ic',html:I.chevDown}))));
  const board=h('div',{class:'board'}); const data=visibleRows();
  let buckets;
  if(col.type==='person') buckets=PEOPLE.map(p=>({id:p.id,label:h('span',{class:'person'},h('span',{class:'avatar',style:`background:${p.color}`},initials(p.name)),p.name)}));
  else if(col.type==='toggle_action') buckets=[{id:'true',label:h('strong',{},'Sim')},{id:'false',label:h('strong',{},'Não')}];
  else if(col.type==='revisar') buckets=Object.keys(REV_STATES).map(k=>({id:k,label:REV_STATES[k]}));
  else buckets=(col.options||[]).map(o=>({id:o.id,label:optChip(col,o.id)}));
  buckets.push({id:'__empty',label:h('span',{style:'color:var(--muted-fg)'},'Sem valor')});
  buckets.forEach(b=>{
    const items=data.filter(r=>String(r[col.id]??'__empty')===b.id || (col.type==='toggle_action'&&String(!!r[col.id])===b.id));
    const bcol=h('div',{class:'board-col'}); bcol.append(h('div',{class:'board-col-head'},b.label,h('span',{class:'count'},items.length)));
    items.forEach(r=>{const card=h('div',{class:'board-card',draggable:'true',onclick:()=>openRowPeek(r)},h('div',{class:'bc-title'},r[titleCol().id]||'Sem título'),h('div',{class:'bc-meta'},...metaTags(r)));card.addEventListener('dragstart',e=>e.dataTransfer.setData('text/card',r.id));bcol.append(card);});
    bcol.append(h('button',{class:'board-add',onclick:()=>{addRow();const nr=rows[rows.length-1];nr[col.id]=b.id==='__empty'?'':(col.type==='toggle_action'?b.id==='true':b.id);rerenderArea();}},h('span',{class:'ic',html:I.plus}),'Novo'));
    bcol.addEventListener('dragover',e=>{if(e.dataTransfer.types.includes('text/card'))e.preventDefault();});
    bcol.addEventListener('drop',e=>{const id=e.dataTransfer.getData('text/card');if(id){const r=rows.find(x=>x.id===id);if(r){r[col.id]=b.id==='__empty'?'':(col.type==='toggle_action'?b.id==='true':b.id);rerenderArea();}}});
    board.append(bcol);
  });
  wrap.append(board); return wrap;
}
function metaTags(r){
  const out=[]; const st=colById('status'); if(r.status){const c=optChip(st,r.status);if(c)out.push(c);}
  const cf=colById('confianca'); if(r.confianca){const c=optChip(cf,r.confianca);if(c)out.push(c);}
  return out;
}

/* ---------- peek ---------- */
function openRowPeek(row){
  const node=h('div',{style:'min-width:340px'});
  node.append(h('div',{style:'font-size:18px;font-weight:600;margin-bottom:10px;padding:0 4px'}, row[titleCol().id]||'Sem título'));
  visibleCols().filter(c=>!c.title&&c.type!=='delete_action').forEach(c=>{
    const td=cellTd(c,row); const cell=td.querySelector('.cell'); cell.classList.add('nowrap');
    node.append(h('div',{style:'display:flex;gap:10px;padding:6px 4px;align-items:center'},
      h('span',{style:'width:120px;color:var(--muted-fg);display:flex;gap:6px;align-items:center;font-size:13px'},h('span',{class:'th-type-ic',html:TYPES[c.type].icon}),c.name),
      h('span',{style:'flex:1'},cell)));
  });
  const ov=$('#overlay'); openPop(ov,node); const pop=$('#overlay .popover'); pop.style.left=(innerWidth/2-180)+'px'; pop.style.top='90px';
}

render();
