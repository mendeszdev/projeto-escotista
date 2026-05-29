requireAuth('dirigente');

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
  const nome    = assoc.nomeCompleto || assoc.nome || '—';
  const perfil  = PERFIL_LABELS[assoc.perfil]  || { label: assoc.perfil,  cls: '' };
  const status  = STATUS_LABELS[assoc.status]  || { label: assoc.status,  cls: 'status-active' };
  const squad   = assoc.matilha ? `Matilha ${assoc.matilha}` : '';

  const row = document.createElement('div');
  row.className = 'table-row';
  row.dataset.id        = assoc.id;
  row.dataset.name      = nome;
  row.dataset.matricula = assoc.matricula;
  row.dataset.perfil    = assoc.perfil;
  row.dataset.matilha   = assoc.matilha || '';
  row.setAttribute('role', 'row');

  row.innerHTML = `
    <div class="td-name">
      <div class="member-cell">
        <div class="member-avatar avatar-green">
          ${assoc.fotoUrl
            ? `<img src="${assoc.fotoUrl}" alt="${nome}" onerror="this.style.display='none'">`
            : AVATAR_SVG}
        </div>
        <div>
          <div class="member-name">${nome}</div>
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
   PAGINAÇÃO — estado global
───────────────────────────────────────── */
const PAGE_SIZE = 10;
let _allRecords      = [];
let _filteredRecords = [];
let _currentPage     = 1;
let _searchQuery     = '';
let _filterPerfil    = 'all';
let _filterMatilha   = 'all';

function applyFiltersAndRender() {
  const q = _searchQuery;
  _filteredRecords = _allRecords.filter(a => {
    const nome      = (a.nomeCompleto || a.nome || '').toLowerCase();
    const matricula = (a.matricula || '').toLowerCase();
    const matchQ = !q || nome.includes(q) || matricula.includes(q);
    const matchP = _filterPerfil  === 'all' || a.perfil  === _filterPerfil;
    const matchM = _filterMatilha === 'all' || a.matilha === _filterMatilha;
    return matchQ && matchP && matchM;
  });
  renderPage(1);
}

function renderPage(page) {
  _currentPage = page;
  const tbody = document.getElementById('table-body');
  if (!tbody) return;

  const start = (page - 1) * PAGE_SIZE;
  const slice = _filteredRecords.slice(start, start + PAGE_SIZE);

  if (slice.length === 0) {
    tbody.innerHTML = '<div style="padding:24px;color:#78716c">Nenhum associado encontrado.</div>';
  } else {
    tbody.innerHTML = '';
    slice.forEach(a => tbody.appendChild(renderRow(a)));
  }
  updatePaginationUI(_filteredRecords.length, page, PAGE_SIZE);
}

function getPageRange(cur, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (cur <= 4)         return [1, 2, 3, 4, 5, '…', total];
  if (cur >= total - 3) return [1, '…', total-4, total-3, total-2, total-1, total];
  return [1, '…', cur-1, cur, cur+1, '…', total];
}

function updatePaginationUI(total, page, pageSize) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end   = Math.min(page * pageSize, total);

  const info = document.getElementById('pagination-info');
  if (info) info.textContent = total === 0
    ? 'Nenhum associado encontrado'
    : `Mostrando ${start}–${end} de ${total} associado(s)`;

  const prevBtn = document.getElementById('btn-prev');
  const nextBtn = document.getElementById('btn-next');
  if (prevBtn) prevBtn.disabled = page <= 1;
  if (nextBtn) nextBtn.disabled = page >= totalPages;

  const container = document.getElementById('page-numbers');
  if (!container) return;
  container.innerHTML = '';

  getPageRange(page, totalPages).forEach(p => {
    if (p === '…') {
      const s = document.createElement('span');
      s.className = 'page-ellipsis';
      s.textContent = '…';
      container.appendChild(s);
    } else {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'page-btn' + (p === page ? ' active' : '');
      btn.textContent = p;
      btn.addEventListener('click', () => renderPage(p));
      container.appendChild(btn);
    }
  });
}

/* ─────────────────────────────────────────
   LOAD ASSOCIADOS — busca da API e popula _allRecords
───────────────────────────────────────── */
async function loadAssociados(filtros = {}) {
  const tbody = document.getElementById('table-body');
  if (tbody) tbody.innerHTML = '<div style="padding:24px;color:#78716c">Carregando associados…</div>';

  try {
    const lista = await API.associados.list(filtros);
    _allRecords = Array.isArray(lista) ? lista : [];
    applyFiltersAndRender();
  } catch (err) {
    console.error('[Associados] Erro ao carregar:', err);
    if (tbody) tbody.innerHTML = '<div style="padding:24px;color:#dc2626">Erro ao carregar associados. Verifique se a API está disponível.</div>';
  }
}

/* ─────────────────────────────────────────
   MODAL VER — exibe ficha completa do associado
───────────────────────────────────────── */
function openViewModal(data) {
  const modal = document.getElementById('modal-ver');
  if (!modal) return;

  const set = (id, val) => {
    const el = modal.querySelector(`[data-field="${id}"]`);
    if (el) el.textContent = val || '—';
  };

  const PERFIL_PT  = { lobinho: 'Lobinho', escotista: 'Escotista', dirigente: 'Dirigente' };
  const STATUS_PT  = { ativo: 'Ativo', inativo: 'Inativo', pendente: 'Pendente' };
  const GENERO_PT  = { M: 'Masculino', F: 'Feminino' };
  const EC_PT      = { solteiro: 'Solteiro(a)', casado: 'Casado(a)', divorciado: 'Divorciado(a)', 'viúvo': 'Viúvo(a)' };

  const fmt = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('pt-BR') : '—';

  /* Foto + nome no header */
  const foto = document.getElementById('mver-foto');
  const svg  = document.querySelector('#mver-avatar svg');
  if (data.fotoUrl && foto) {
    foto.src = data.fotoUrl; foto.style.display = 'block';
    if (svg) svg.style.display = 'none';
  } else if (foto) {
    foto.style.display = 'none';
    if (svg) svg.style.display = '';
  }
  const nomeTitle = document.getElementById('mver-nome-titulo');
  if (nomeTitle) nomeTitle.textContent = data.nomeCompleto || 'Ficha do Associado';
  const badge = document.getElementById('mver-matricula-badge');
  if (badge) badge.textContent = data.matricula || '';

  set('nome',         data.nomeCompleto);
  set('nomeEscoteiro',data.nomeEscoteiro);
  set('matricula',    data.matricula);
  set('perfil',       PERFIL_PT[data.perfil] || data.perfil);
  set('status',       STATUS_PT[data.status]  || data.status);
  set('nascimento',   fmt(data.dataNascimento));
  set('cpf',          data.cpf);
  set('rg',           data.rg);
  set('genero',       GENERO_PT[data.genero]);
  set('estadoCivil',  EC_PT[data.estadoCivil] || data.estadoCivil);
  set('email',        data.email);
  set('telefone',     data.telefone);
  set('cep',          data.cep);
  set('logradouro',   data.logradouro ? `${data.logradouro}${data.numeroEnd ? ', ' + data.numeroEnd : ''}` : null);
  set('bairro',       data.bairro);
  set('cidade',       data.cidade ? `${data.cidade}${data.estado ? ' / ' + data.estado : ''}` : null);

  modal.classList.add('open');
}

function closeViewModal() {
  document.getElementById('modal-ver')?.classList.remove('open');
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

    /* ── Ver ficha completa ── */
    if (e.target.closest('.btn-view')) {
      if (!id || typeof API === 'undefined') {
        showToast('ℹ️', `Visualizando ${name} (API indisponível).`);
        return;
      }
      try {
        const data = await API.associados.getById(id);
        openViewModal(data);
      } catch (err) {
        showToast('❌', `Erro ao carregar dados: ${err.message}`);
      }
      return;
    }

    /* ── Editar: navega para cadastro com ID na sessionStorage ── */
    if (e.target.closest('.btn-edit')) {
      sessionStorage.setItem('edit-associado-id', id);
      window.location.href = '../cadastro-associado/';
      return;
    }

    /* ── Remover ── */
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
        showToast('❌', `Erro ao remover ${name}: ${err.message}`);
      }
    }
  });

  /* fechar modal ao clicar no overlay ou no X */
  document.getElementById('modal-ver')?.addEventListener('click', e => {
    if (e.target === e.currentTarget || e.target.closest('.modal-ver-close')) closeViewModal();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeViewModal(); });
}

/* ─────────────────────────────────────────
   LIVE SEARCH
───────────────────────────────────────── */
function initSearch() {
  const input = document.getElementById('search-input');
  if (!input) return;
  input.addEventListener('input', () => {
    _searchQuery = input.value.toLowerCase().trim();
    applyFiltersAndRender();
  });
}

/* ─────────────────────────────────────────
   FILTER BY PROFILE & MATILHA
───────────────────────────────────────── */
function initProfileFilter() {
  const select = document.getElementById('filter-profile');
  if (!select) return;
  select.addEventListener('change', () => {
    _filterPerfil = select.value || 'all';
    applyFiltersAndRender();
  });
}

function initMatilhaFilter() {
  const select = document.getElementById('filter-matilha');
  if (!select) return;
  select.addEventListener('change', () => {
    _filterMatilha = select.value || 'all';
    applyFiltersAndRender();
  });
}

function applyFilterInfo() { /* substituído por updatePaginationUI */ }

/* ─────────────────────────────────────────
   PAGINATION EVENTS — prev / next
───────────────────────────────────────── */
function initPagination() {
  document.getElementById('btn-prev')?.addEventListener('click', () => {
    if (_currentPage > 1) renderPage(_currentPage - 1);
  });
  document.getElementById('btn-next')?.addEventListener('click', () => {
    const totalPages = Math.ceil(_filteredRecords.length / PAGE_SIZE);
    if (_currentPage < totalPages) renderPage(_currentPage + 1);
  });
}

/* ─────────────────────────────────────────
   NOVO ASSOCIADO
───────────────────────────────────────── */
function initAddButtons() {
  document.getElementById('btn-novo-associado')?.addEventListener('click', () => {
    window.location.href = '../cadastro-associado/';
  });
  document.getElementById('btn-nova-inscricao')?.addEventListener('click', () => {
    window.location.href = '../cadastro-associado/';
  });
}

/* ─────────────────────────────────────────
   BOOTSTRAP
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
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
