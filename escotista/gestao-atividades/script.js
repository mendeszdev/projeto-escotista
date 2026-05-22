/* gestao-atividades.js */

/* ─────────────────────────────────────────
   TOAST
───────────────────────────────────────── */
/**
 * Exibe um toast de notificação temporário.
 * @param {string} icon       - Emoji exibido à esquerda
 * @param {string} msg        - Texto da mensagem
 * @param {number} [duration] - Duração em ms (padrão 3000)
 */
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
/**
 * Aplica a classe .active ao link clicado na sidebar.
 */
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
   TABLE ACTIONS
───────────────────────────────────────── */
/**
 * Lida com aprovação de uma atividade na linha da tabela.
 * @param {HTMLElement} btn - Botão clicado
 */
function approveRow(btn) {
  const row  = btn.closest('.table-row');
  const name = row.querySelector('.lobinho-name')?.textContent.trim() || 'Lobinho';
  const statusCell = row.querySelector('.status-cell');

  statusCell.className = 'status-cell status-approved';
  statusCell.innerHTML = `
    <span class="status-dot"></span>
    <span class="status-label">Aprovado</span>
  `;

  row.querySelector('.btn-approve')?.remove();
  row.querySelector('.btn-reject')?.remove();

  showToast('✅', `Atividade de ${name} aprovada!`);
}

/**
 * Lida com rejeição de uma atividade na linha da tabela.
 * @param {HTMLElement} btn - Botão clicado
 */
function rejectRow(btn) {
  const row  = btn.closest('.table-row');
  const name = row.querySelector('.lobinho-name')?.textContent.trim() || 'Lobinho';
  const statusCell = row.querySelector('.status-cell');

  statusCell.className = 'status-cell status-rejected';
  statusCell.innerHTML = `
    <span class="status-dot"></span>
    <span class="status-label">Rejeitado</span>
  `;

  row.querySelector('.btn-approve')?.remove();
  row.querySelector('.btn-reject')?.remove();

  showToast('❌', `Atividade de ${name} rejeitada.`);
}

/* ─────────────────────────────────────────
   FILTERS
───────────────────────────────────────── */
/**
 * Aplica filtros visuais à tabela (busca por nome de lobinho).
 */
function applyFilters() {
  const query  = document.getElementById('search-input').value.toLowerCase().trim();
  const status = document.getElementById('status-select').value;
  const rows   = document.querySelectorAll('.table-row');
  let   visible = 0;

  rows.forEach(row => {
    const name       = row.querySelector('.lobinho-name')?.textContent.toLowerCase() || '';
    const rowStatus  = row.dataset.status || '';
    const matchName  = !query  || name.includes(query);
    const matchStatus = !status || status === 'all' || rowStatus === status;

    if (matchName && matchStatus) {
      row.style.display = '';
      visible++;
    } else {
      row.style.display = 'none';
    }
  });

  const info = document.getElementById('pagination-info');
  if (info) info.textContent = `Mostrando ${visible} resultado(s)`;
}

/* ─────────────────────────────────────────
   PAGINATION
───────────────────────────────────────── */
/**
 * Activa a página clicada nos botões de paginação.
 * @param {HTMLElement} btn - Botão de página clicado
 */
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

  if (!pendingRows.length) {
    showToast('ℹ️', 'Nenhuma atividade pendente visível.');
    return;
  }

  pendingRows.forEach(row => {
    const statusCell = row.querySelector('.status-cell');
    statusCell.className = 'status-cell status-approved';
    statusCell.innerHTML = `
      <span class="status-dot"></span>
      <span class="status-label">Aprovado</span>
    `;
    row.dataset.status = 'approved';
    row.querySelector('.btn-approve')?.remove();
    row.querySelector('.btn-reject')?.remove();
  });

  showToast('✅', `${pendingRows.length} atividade(s) aprovadas em lote!`);
}

/* ─────────────────────────────────────────
   BOOTSTRAP
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initSidebarNav();

  /* Filter button */
  document.getElementById('btn-filter')?.addEventListener('click', applyFilters);

  /* Search on Enter */
  document.getElementById('search-input')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') applyFilters();
  });

  /* Status select live filter */
  document.getElementById('status-select')?.addEventListener('change', applyFilters);

  /* Batch validate */
  document.getElementById('btn-batch')?.addEventListener('click', batchValidate);

  /* New activity */
  document.getElementById('btn-new-activity')?.addEventListener('click', () => {
    showToast('➕', 'Formulário de nova atividade aberto.');
  });

  /* Export */
  document.getElementById('btn-export')?.addEventListener('click', () => {
    showToast('📥', 'Exportação de relatório iniciada.');
  });

  /* Create activity (sidebar CTA) */
  document.getElementById('btn-create')?.addEventListener('click', () => {
    showToast('➕', 'Formulário de nova atividade aberto.');
  });
});