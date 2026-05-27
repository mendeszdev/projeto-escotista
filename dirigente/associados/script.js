/* gestao-associados.js */

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
   SIDEBAR NAV
───────────────────────────────────────── */
function initSidebarNav() {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });
}

/* ─────────────────────────────────────────
   RENDER — constrói uma linha da tabela a partir dos dados do associado
───────────────────────────────────────── */
const PERFIL_LABELS = {
  lobinho:   { label: 'Lobinho',   cls: 'tag-lobinho'   },
  escotista: { label: 'Escotista', cls: 'tag-escotista' },
  dirigente: { label: 'Dirigente', cls: 'tag-dirigente' },
};

const STATUS_LABELS = {
  ativo:    { label: 'Ativo',    cls: 'status-active'   },
  inativo:  { label: 'Inativo',  cls: 'status-inactive' },
  pendente: { label: 'Pendente', cls: 'status-pending'  },
};

const AVATAR_SVG = `<svg viewBox="0 0 24 24" fill="#065f46"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>`;

const ACTION_BTNS = `
  <button class="row-action-btn btn-view"   title="Visualizar" type="button">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  </button>
  <button class="row-action-btn btn-edit"   title="Editar"     type="button">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  </button>
  <button class="row-action-btn btn-delete" title="Remover"    type="button">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  </button>`;

function renderRow(assoc) {
  const perfil  = PERFIL_LABELS[assoc.perfil]  || { label: assoc.perfil,  cls: ''               };
  const status  = STATUS_LABELS[assoc.status]  || { label: assoc.status,  cls: 'status-active'  };
  const squad   = assoc.matilha ? `Matilha ${assoc.matilha}` : '';

  const row = document.createElement('div');
  row.className = 'table-row';
  row.dataset.id        = assoc.id;
  row.dataset.name      = assoc.nome;
  row.dataset.matricula = assoc.matricula;
  row.dataset.perfil    = assoc.perfil;
  row.dataset.matilha   = assoc.matilha || '';
  row.setAttribute('role', 'row');

  row.innerHTML = `
    <div class="td-name">
      <div class="member-cell">
        <div class="member-avatar avatar-green">
          ${assoc.fotoUrl
            ? `<img src="${assoc.fotoUrl}" alt="${assoc.nome}" onerror="this.style.display='none'">`
            : AVATAR_SVG}
        </div>
        <div>
          <div class="member-name">${assoc.nome}</div>
          <div class="member-squad">${squad}</div>
        </div>
      </div>
    </div>
    <div class="td"><span class="profile-tag ${perfil.cls}">${perfil.label}</span></div>
    <div class="td"><span class="matricula">${assoc.matricula}</span></div>
    <div class="td">
      <div class="status-cell ${status.cls}">
        <div class="status-dot"></div>
        <span class="status-label">${status.label}</span>
      </div>
    </div>
    <div class="td-right">${ACTION_BTNS}</div>`;

  return row;
}

/* ─────────────────────────────────────────
   LOAD ASSOCIADOS — busca da API e re-renderiza a tabela
───────────────────────────────────────── */
async function loadAssociados(filtros = {}) {
  const tbody = document.getElementById('table-body');
  if (!tbody) return;

  tbody.innerHTML = '<div style="padding:24px;color:#78716c">Carregando associados…</div>';

  try {
    const lista = await API.associados.list(filtros);

    if (!lista || lista.length === 0) {
      tbody.innerHTML = '<div style="padding:24px;color:#78716c">Nenhum associado encontrado.</div>';
      return;
    }

    tbody.innerHTML = '';
    lista.forEach(assoc => tbody.appendChild(renderRow(assoc)));

    const info = document.getElementById('pagination-info');
    if (info) info.textContent = `Mostrando ${lista.length} associado(s)`;

  } catch (err) {
    console.error('[Associados] Erro ao carregar:', err);
    tbody.innerHTML = '<div style="padding:24px;color:#dc2626">Erro ao carregar associados. Verifique se a API está disponível.</div>';
  }
}

/* ─────────────────────────────────────────
   TABLE EVENTS — delegação no tbody
───────────────────────────────────────── */
function initTableEvents() {
  const tbody = document.getElementById('table-body');
  if (!tbody) return;

  tbody.addEventListener('click', async e => {
    const row  = e.target.closest('.table-row');
    if (!row) return;
    const name = row.dataset.name || 'Associado';
    const id   = row.dataset.id;

    if (e.target.closest('.btn-view')) {
      showToast('👁️', `Visualizando ficha de ${name}`);
    }

    if (e.target.closest('.btn-edit')) {
      showToast('✏️', `Editando cadastro de ${name}`);
    }

    if (e.target.closest('.btn-delete')) {
      if (!confirm(`Deseja realmente remover ${name}?`)) return;

      try {
        if (id && typeof API !== 'undefined') {
          await API.associados.delete(id);
        }
        row.style.transition = 'opacity .3s, transform .3s';
        row.style.opacity    = '0';
        row.style.transform  = 'translateX(20px)';
        setTimeout(() => { row.remove(); applyFilterInfo(); }, 320);
        showToast('🗑️', `${name} removido com sucesso.`);
      } catch (err) {
        console.error('[Associados] Erro ao remover:', err);
        showToast('❌', `Erro ao remover ${name}: ${err.message}`);
      }
    }
  });
}

/* ─────────────────────────────────────────
   LIVE SEARCH
───────────────────────────────────────── */
function initSearch() {
  const input = document.getElementById('search-input');
  if (!input) return;

  input.addEventListener('input', () => {
    const query = input.value.toLowerCase().trim();
    let visible = 0;

    document.querySelectorAll('.table-row[data-name]').forEach(row => {
      const name      = (row.dataset.name      || '').toLowerCase();
      const matricula = (row.dataset.matricula || '').toLowerCase();
      const match = !query || name.includes(query) || matricula.includes(query);
      row.style.display = match ? '' : 'none';
      if (match) visible++;
    });

    const info = document.getElementById('pagination-info');
    if (info) info.textContent = query
      ? `Mostrando ${visible} resultado(s) para "${input.value}"`
      : `Mostrando ${visible} associado(s)`;
  });
}

/* ─────────────────────────────────────────
   FILTER BY PROFILE & MATILHA
───────────────────────────────────────── */
function initProfileFilter() {
  const select = document.getElementById('filter-profile');
  if (!select) return;

  select.addEventListener('change', () => {
    const val = select.value;
    document.querySelectorAll('.table-row[data-perfil]').forEach(row => {
      const match = !val || val === 'all' || row.dataset.perfil === val;
      row.style.display = match ? '' : 'none';
    });
    applyFilterInfo();
  });
}

function initMatilhaFilter() {
  const select = document.getElementById('filter-matilha');
  if (!select) return;

  select.addEventListener('change', () => {
    const val = select.value;
    document.querySelectorAll('.table-row[data-matilha]').forEach(row => {
      const match = !val || val === 'all' || row.dataset.matilha === val;
      row.style.display = match ? '' : 'none';
    });
    applyFilterInfo();
  });
}

function applyFilterInfo() {
  const visible = [...document.querySelectorAll('.table-row[data-name]')]
    .filter(r => r.style.display !== 'none').length;
  const info = document.getElementById('pagination-info');
  if (info) info.textContent = `Mostrando ${visible} associado(s)`;
}

/* ─────────────────────────────────────────
   PAGINATION
───────────────────────────────────────── */
function initPagination() {
  document.querySelectorAll('.page-btn[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.page-btn[data-page]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      showToast('📄', `Página ${btn.textContent.trim()} carregada`);
    });
  });

  document.getElementById('btn-prev')?.addEventListener('click', () => showToast('◀️', 'Página anterior'));
  document.getElementById('btn-next')?.addEventListener('click', () => showToast('▶️', 'Próxima página'));
}

/* ─────────────────────────────────────────
   NOVO ASSOCIADO
───────────────────────────────────────── */
function initAddButtons() {
  document.getElementById('btn-novo-associado')?.addEventListener('click', () => {
    window.location.href = '../cadastro-associado/';
  });
  document.getElementById('btn-nova-inscricao')?.addEventListener('click', () => {
    showToast('✅', 'Formulário de nova inscrição aberto.');
  });
}

/* ─────────────────────────────────────────
   BOOTSTRAP
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initSidebarNav();
  initSearch();
  initProfileFilter();
  initMatilhaFilter();
  initTableEvents();
  initPagination();
  initAddButtons();

  if (typeof API !== 'undefined') {
    loadAssociados();
  }
});
