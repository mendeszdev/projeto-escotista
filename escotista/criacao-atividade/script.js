requireAuth('escotista');

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
  if (badge) badge.textContent = sel === 0 ? `RF${total}` : `${sel}/${total}`;
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
   CARGA DINÂMICA — ações educativas
───────────────────────────────────────── */
async function loadAcoesEducativas() {
  if (typeof API === 'undefined') return;
  try {
    const acoes = await API.acoesEducativas.list();
    const sel   = document.getElementById('activity-block');
    if (!sel) return;
    sel.innerHTML = '<option value="">Selecionar ação educativa...</option>';
    acoes.forEach(acao => {
      const opt = document.createElement('option');
      opt.value       = acao.id;
      opt.textContent = acao.nome;
      sel.appendChild(opt);
    });
  } catch (err) {
    console.warn('[CriaçãoAtividade] Erro ao carregar ações educativas:', err.message);
  }
}

/* ─────────────────────────────────────────
   CARGA DINÂMICA — alcateias do escotista
───────────────────────────────────────── */
async function loadAlcateias() {
  if (typeof API === 'undefined') return;
  try {
    const user    = JSON.parse(localStorage.getItem('user') || '{}');
    const vinculos = await API.escotistaAlcateia.listByAssociado(user.id);
    const sel     = document.getElementById('activity-alcateia');
    if (!sel) return;
    sel.innerHTML = '<option value="">Selecionar alcateia...</option>';
    vinculos.forEach(v => {
      const opt = document.createElement('option');
      opt.value       = v.alcateiaId;
      opt.textContent = v.alcateiaId;
      sel.appendChild(opt);
    });
    if (vinculos.length === 1) {
      sel.value = vinculos[0].alcateiaId;
      await loadLobinhos(vinculos[0].alcateiaId);
    }
    sel.addEventListener('change', () => loadLobinhos(sel.value));
  } catch (err) {
    console.warn('[CriaçãoAtividade] Erro ao carregar alcateias:', err.message);
  }
}

/* ─────────────────────────────────────────
   CARGA DINÂMICA — lobinhos da alcateia
───────────────────────────────────────── */
async function loadLobinhos(alcateiaId) {
  if (!alcateiaId || typeof API === 'undefined') return;
  try {
    const lobinhos = await API.associados.list({ perfil: 'lobinho' });
    const container = document.querySelector('.lobinho-list') || document.querySelector('.lobinhos-grid');
    if (!container) return;
    container.innerHTML = '';
    lobinhos.forEach(l => {
      const li = document.createElement('li');
      li.className         = 'lobinho-item';
      li.role              = 'option';
      li.dataset.id        = l.id;
      li.setAttribute('aria-selected', 'false');
      li.innerHTML = `
        <div class="lobinho-checkbox" aria-hidden="true"></div>
        <div class="lobinho-avatar">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4
                     7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6
                     4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
          </svg>
        </div>
        <div>
          <div class="lobinho-name">${l.nomeEscoteiro || l.nomeCompleto || '—'}</div>
          <div class="lobinho-pack">${l.matricula || ''}</div>
        </div>
      `;
      container.appendChild(li);
    });
    initLobinhoSelection();
    updateBadge();
  } catch (err) {
    console.warn('[CriaçãoAtividade] Erro ao carregar lobinhos:', err.message);
  }
}

/* ─────────────────────────────────────────
   FORM VALIDATION & SUBMIT
───────────────────────────────────────── */
async function handleSubmit(e) {
  e.preventDefault();

  const name       = document.getElementById('activity-name')?.value.trim();
  const desc       = document.getElementById('activity-desc')?.value.trim();
  const block      = document.getElementById('activity-block')?.value;
  const alcateiaId = document.getElementById('activity-alcateia')?.value;
  const date       = document.getElementById('activity-date')?.value;
  const sel        = countSelected();

  if (!name)       { showToast('⚠️', 'Informe o nome da atividade.');              document.getElementById('activity-name')?.focus(); return; }
  if (!desc)       { showToast('⚠️', 'Adicione uma descrição para a tarefa.');      document.getElementById('activity-desc')?.focus(); return; }
  if (!block)      { showToast('⚠️', 'Selecione a ação educativa.');                document.getElementById('activity-block')?.focus(); return; }
  if (!alcateiaId) { showToast('⚠️', 'Selecione a alcateia.');                     document.getElementById('activity-alcateia')?.focus(); return; }
  if (!date)       { showToast('⚠️', 'Defina uma data limite para a atividade.');   document.getElementById('activity-date')?.focus(); return; }
  if (sel === 0)   { showToast('⚠️', 'Selecione pelo menos um lobinho da matilha.'); return; }

  const submitBtn = e.submitter || document.querySelector('[type="submit"]');
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Salvando…'; }

  try {
    if (typeof API !== 'undefined') {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const payload = {
        nomePersonalizado:      name,
        descricaoPersonalizada: desc,
        acaoEducativaId:        block || null,
        alcateiaId,
        ePersonalizada:         !block,
        dataLimite:             date,
        lobinhosIds:            getSelectedLobinhosIds(),
        criadoPor:              user.id,
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
document.addEventListener('DOMContentLoaded', async () => {
  initSidebarNav();

  await Promise.all([loadAcoesEducativas(), loadAlcateias()]);

  initLobinhoSelection();

  document.getElementById('btn-select-all')?.addEventListener('click', toggleSelectAll);
  document.getElementById('create-form')?.addEventListener('submit', handleSubmit);
  document.getElementById('btn-cancel')?.addEventListener('click', () => {
    window.location.href = '../gestao-atividades/';
  });
});