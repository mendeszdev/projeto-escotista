/* criacao-atividade.js */

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
      if (link.getAttribute('href') === '#') e.preventDefault();
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });
}

/* ─────────────────────────────────────────
   LOBINHO SELECTION
───────────────────────────────────────── */
function countSelected() {
  return document.querySelectorAll('.lobinho-item.selected').length;
}

function updateBadge() {
  const badge = document.getElementById('selection-badge');
  const total = document.querySelectorAll('.lobinho-item').length;
  const sel   = countSelected();
  badge.textContent = sel === 0 ? `RF${total}` : `${sel}/${total}`;
}

function initLobinhoSelection() {
  document.querySelectorAll('.lobinho-item').forEach(item => {
    item.addEventListener('click', () => {
      const selected = item.classList.toggle('selected');
      item.setAttribute('aria-selected', selected);
      updateBadge();
    });
  });
}

function toggleSelectAll() {
  const items  = document.querySelectorAll('.lobinho-item');
  const allSel = countSelected() === items.length;

  items.forEach(item => {
    if (allSel) { item.classList.remove('selected'); item.setAttribute('aria-selected', 'false'); }
    else        { item.classList.add('selected');    item.setAttribute('aria-selected', 'true');  }
  });

  updateBadge();
  const label = document.getElementById('select-all-label');
  if (label) label.textContent = allSel ? 'Selecionar Toda a Matilha' : 'Desmarcar Toda a Matilha';
}

/* ─────────────────────────────────────────
   COLETA DOS IDS DOS LOBINHOS SELECIONADOS
───────────────────────────────────────── */
function getSelectedLobinhosIds() {
  return [...document.querySelectorAll('.lobinho-item.selected')]
    .map(el => el.dataset.id)
    .filter(Boolean);
}

/* ─────────────────────────────────────────
   RESET DO FORMULÁRIO
───────────────────────────────────────── */
function resetForm() {
  document.getElementById('create-form')?.reset();
  document.querySelectorAll('.lobinho-item').forEach(i => {
    i.classList.remove('selected');
    i.setAttribute('aria-selected', 'false');
  });
  updateBadge();
  const label = document.getElementById('select-all-label');
  if (label) label.textContent = 'Selecionar Toda a Matilha';
}

/* ─────────────────────────────────────────
   FORM VALIDATION & SUBMIT
───────────────────────────────────────── */
async function handleSubmit(e) {
  e.preventDefault();

  const name  = document.getElementById('activity-name')?.value.trim();
  const desc  = document.getElementById('activity-desc')?.value.trim();
  const block = document.getElementById('activity-block')?.value;
  const date  = document.getElementById('activity-date')?.value;
  const sel   = countSelected();

  if (!name)  { showToast('⚠️', 'Informe o nome da atividade.');          document.getElementById('activity-name')?.focus(); return; }
  if (!desc)  { showToast('⚠️', 'Adicione uma descrição para a tarefa.');  document.getElementById('activity-desc')?.focus(); return; }
  if (!block) { showToast('⚠️', 'Selecione o bloco de aprendizagem.');     document.getElementById('activity-block')?.focus(); return; }
  if (!date)  { showToast('⚠️', 'Defina uma data limite para a atividade.'); document.getElementById('activity-date')?.focus(); return; }
  if (sel === 0) { showToast('⚠️', 'Selecione pelo menos um lobinho da matilha.'); return; }

  const submitBtn = e.submitter || document.querySelector('[type="submit"]');
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Salvando…'; }

  try {
    if (typeof API !== 'undefined') {
      const payload = {
        titulo:      name,
        descricao:   desc,
        bloco:       block,
        dataLimite:  date,
        lobinhosIds: getSelectedLobinhosIds(),
      };
      await API.atividades.create(payload);
    }

    showToast('🎉', `Atividade "${name}" criada para ${sel} lobinho(s)!`, 4000);
    setTimeout(resetForm, 1500);

  } catch (err) {
    console.error('[Criação de atividade] Erro:', err);
    showToast('❌', `Erro ao criar atividade: ${err.message}`, 5000);
  } finally {
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Criar Atividade'; }
  }
}

/* ─────────────────────────────────────────
   BOOTSTRAP
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initSidebarNav();
  initLobinhoSelection();

  document.getElementById('btn-select-all')?.addEventListener('click', toggleSelectAll);
  document.getElementById('create-form')?.addEventListener('submit', handleSubmit);
  document.getElementById('btn-cancel')?.addEventListener('click', () => {
    showToast('↩️', 'Criação de atividade cancelada.');
  });
});
