requireAuth('escotista');

/* gestao-atividades.js */

/* ─────────────────────────────────────────
   TOAST
───────────────────────────────────────── */
function showToast(icon, msg, duration = 3000) {
  const toast     = document.getElementById('toast');
  const toastIcon = document.getElementById('toast-icon');
  const toastMsg  = document.getElementById('toast-msg');

  toastIcon.textContent = icon;
  toastMsg.textContent  = msg;
  toast.classList.add('show');

  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), duration);
}


/* ─────────────────────────────────────────
   RENDER — constrói uma linha de atividade a partir dos dados da API
───────────────────────────────────────── */
const AREA_CLASSES = {
  saude:        'tag-teal',
  natureza:     'tag-green',
  aventura:     'tag-orange',
  expressao:    'tag-purple',
  cidadania:    'tag-blue',
};

const PERSON_SVG = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>`;

function renderStatusCell(status) {
  const map = {
    pending:  { cls: 'status-pending',  label: 'Pendente'  },
    approved: { cls: 'status-approved', label: 'Aprovado'  },
    rejected: { cls: 'status-rejected', label: 'Rejeitado' },
  };
  const s = map[status] || { cls: 'status-pending', label: status };
  return `<div class="status-cell ${s.cls}"><span class="status-dot"></span><span class="status-label">${s.label}</span></div>`;
}

function renderAtividadeRow(at) {
  const status    = at.status || 'pending';
  const area      = at.area   || '';
  const areaClass = AREA_CLASSES[area.toLowerCase()] || 'tag-teal';
  const dataFmt   = at.dataLimite
    ? new Date(at.dataLimite).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';
  const isPending = status === 'pending';

  const row = document.createElement('div');
  row.className    = 'table-row';
  row.dataset.status = status;
  row.dataset.id     = at.id;
  row.setAttribute('role', 'row');

  row.innerHTML = `
    <div class="td-lobinho">
      <div class="lobinho-avatar">${PERSON_SVG}</div>
      <div>
        <div class="lobinho-name">${at.associadoNome || '—'}</div>
        <div class="lobinho-squad">${at.matilhaNome  || '—'}</div>
      </div>
    </div>
    <div class="td">
      <div class="activity-name">${at.titulo}</div>
      <div class="activity-prog">Progressão: ${at.bloco || '—'}</div>
    </div>
    <div class="td"><span class="area-tag ${areaClass}">${area || '—'}</span></div>
    <div class="td" style="font-size:14px;color:var(--stone-700);line-height:20px">${dataFmt}</div>
    <div class="td">${renderStatusCell(status)}</div>
    <div class="td row-actions">
      <button class="action-btn btn-view" title="Ver detalhes">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
        </svg>
      </button>
      ${isPending ? `
      <button class="action-btn btn-approve" title="Aprovar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </button>
      <button class="action-btn btn-reject" title="Rejeitar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>` : ''}
    </div>`;

  return row;
}

/* ─────────────────────────────────────────
   LOAD ATIVIDADES — busca da API e re-renderiza a tabela
───────────────────────────────────────── */
async function loadAtividades(filtros = {}) {
  const tbody = document.getElementById('table-body');
  if (!tbody) return;

  tbody.innerHTML = '<div style="padding:24px;color:#78716c">Carregando atividades…</div>';

  try {
    const lista = await API.atividades.list(filtros);

    if (!lista || lista.length === 0) {
      tbody.innerHTML = '<div style="padding:24px;color:#78716c">Nenhuma atividade encontrada.</div>';
      return;
    }

    tbody.innerHTML = '';
    lista.forEach(at => tbody.appendChild(renderAtividadeRow(at)));

    const info = document.getElementById('pagination-info');
    if (info) info.textContent = `Mostrando ${lista.length} atividade(s)`;

  } catch (err) {
    console.error('[Atividades] Erro ao carregar:', err);
    tbody.innerHTML = '<div style="padding:24px;color:#dc2626">Erro ao carregar atividades. Verifique se a API está disponível.</div>';
  }
}

/* ─────────────────────────────────────────
   APROVAR / REJEITAR — atualiza UI e chama a API
───────────────────────────────────────── */
async function approveRow(btn) {
  const row        = btn.closest('.table-row');
  const name       = row.querySelector('.lobinho-name')?.textContent.trim() || 'Lobinho';
  const id         = row.dataset.id;
  const statusCell = row.querySelector('.status-cell');

  statusCell.className = 'status-cell status-approved';
  statusCell.innerHTML = '<span class="status-dot"></span><span class="status-label">Aprovado</span>';
  row.dataset.status   = 'approved';
  row.querySelector('.btn-approve')?.remove();
  row.querySelector('.btn-reject')?.remove();
  showToast('✅', `Atividade de ${name} aprovada!`);

  if (id && typeof API !== 'undefined') {
    API.atividades.update(id, { status: 'aprovado' }).catch(err => {
      console.error('[Atividades] Erro ao aprovar:', err);
    });
  }
}

async function rejectRow(btn) {
  const row        = btn.closest('.table-row');
  const name       = row.querySelector('.lobinho-name')?.textContent.trim() || 'Lobinho';
  const id         = row.dataset.id;
  const statusCell = row.querySelector('.status-cell');

  statusCell.className = 'status-cell status-rejected';
  statusCell.innerHTML = '<span class="status-dot"></span><span class="status-label">Rejeitado</span>';
  row.dataset.status   = 'rejected';
  row.querySelector('.btn-approve')?.remove();
  row.querySelector('.btn-reject')?.remove();
  showToast('❌', `Atividade de ${name} rejeitada.`);

  if (id && typeof API !== 'undefined') {
    API.atividades.update(id, { status: 'rejeitado' }).catch(err => {
      console.error('[Atividades] Erro ao rejeitar:', err);
    });
  }
}

/* ─────────────────────────────────────────
   TABLE EVENTS — delegação no tbody
───────────────────────────────────────── */
function initTableEvents() {
  const tbody = document.getElementById('table-body');
  if (!tbody) return;

  tbody.addEventListener('click', e => {
    if (e.target.closest('.btn-approve')) approveRow(e.target.closest('.btn-approve'));
    if (e.target.closest('.btn-reject'))  rejectRow(e.target.closest('.btn-reject'));
    if (e.target.closest('.btn-view'))    showToast('👁️', 'Detalhes da atividade abertos.');
  });
}

/* ─────────────────────────────────────────
   FILTERS
───────────────────────────────────────── */
function applyFilters() {
  const query  = document.getElementById('search-input')?.value.toLowerCase().trim() || '';
  const status = document.getElementById('status-select')?.value || '';
  const rows   = document.querySelectorAll('.table-row');
  let visible  = 0;

  rows.forEach(row => {
    const name      = row.querySelector('.lobinho-name')?.textContent.toLowerCase() || '';
    const rowStatus = row.dataset.status || '';
    const matchName   = !query  || name.includes(query);
    const matchStatus = !status || status === 'all' || rowStatus === status;

    if (matchName && matchStatus) { row.style.display = ''; visible++; }
    else row.style.display = 'none';
  });

  const info = document.getElementById('pagination-info');
  if (info) info.textContent = `Mostrando ${visible} resultado(s)`;
}

/* ─────────────────────────────────────────
   PAGINATION
───────────────────────────────────────── */
function setPage(btn) {
  document.querySelectorAll('.page-btn[data-page]').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  showToast('📄', `Página ${btn.textContent.trim()} carregada`);
}

/* ─────────────────────────────────────────
   BATCH VALIDATE
───────────────────────────────────────── */
function batchValidate() {
  const pendingRows = [...document.querySelectorAll('.table-row[data-status="pending"]')]
    .filter(r => r.style.display !== 'none');

  if (!pendingRows.length) { showToast('ℹ️', 'Nenhuma atividade pendente visível.'); return; }

  const updates = [];

  pendingRows.forEach(row => {
    const statusCell = row.querySelector('.status-cell');
    statusCell.className = 'status-cell status-approved';
    statusCell.innerHTML = '<span class="status-dot"></span><span class="status-label">Aprovado</span>';
    row.dataset.status   = 'approved';
    row.querySelector('.btn-approve')?.remove();
    row.querySelector('.btn-reject')?.remove();

    const id = row.dataset.id;
    if (id && typeof API !== 'undefined') {
      updates.push(API.atividades.update(id, { status: 'aprovado' }));
    }
  });

  Promise.allSettled(updates).then(results => {
    const failed = results.filter(r => r.status === 'rejected').length;
    if (failed) console.warn(`[Atividades] ${failed} aprovação(ões) falharam.`);
  });

  showToast('✅', `${pendingRows.length} atividade(s) aprovadas em lote!`);
}

/* ─────────────────────────────────────────
   BOOTSTRAP
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initTableEvents();

  document.getElementById('btn-filter')?.addEventListener('click', applyFilters);
  document.getElementById('search-input')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') applyFilters();
  });
  document.getElementById('status-select')?.addEventListener('change', applyFilters);
  document.getElementById('btn-batch')?.addEventListener('click', batchValidate);
  document.getElementById('btn-new-activity')?.addEventListener('click', () => {
    window.location.href = '../criacao-atividade/';
  });
  document.getElementById('btn-export')?.addEventListener('click', () => {
    showToast('📥', 'Exportação de relatório iniciada.');
  });
  document.getElementById('btn-create')?.addEventListener('click', () => {
    window.location.href = '../criacao-atividade/';
  });

  if (typeof API !== 'undefined') {
    loadAtividades();
  }
});
