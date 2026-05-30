requireAuth('dirigente');

/* perfil-dirigente.js */

/* ─────────────────────────────────────────
   TOAST
───────────────────────────────────────── */
/**
 * Exibe um toast de notificação temporário.
 * @param {string} icon       - Emoji exibido à esquerda
 * @param {string} msg        - Texto da mensagem
 * @param {number} [duration] - Duração em ms (padrão: 3000)
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

/* ─────────────────────────────────────────
   PROFILE ACTIONS
───────────────────────────────────────── */
/**
 * Inicializa os botões de ação do perfil.
 */
function initProfileActions() {
  /* Atualizar Informações */
  document.getElementById('btn-update')?.addEventListener('click', () => {
    showToast('✏️', 'Formulário de atualização de informações aberto.');
  });

  /* Exportar Ficha */
  document.getElementById('btn-export')?.addEventListener('click', () => {
    showToast('📄', 'Exportando ficha do dirigente em PDF…');
  });

  /* Nova Inscrição (sidebar) */
  document.getElementById('btn-nova-inscricao')?.addEventListener('click', () => {
    showToast('✅', 'Formulário de nova inscrição aberto.');
  });
}

/* ─────────────────────────────────────────
   CONTACT PILLS — click to copy
───────────────────────────────────────── */
/**
 * Copia o texto do contato ao clicar na pílula.
 */
function initContactCopy() {
  document.querySelectorAll('.contact-pill').forEach(pill => {
    pill.style.cursor = 'pointer';
    pill.title = 'Clique para copiar';

    pill.addEventListener('click', async () => {
      const text = pill.querySelector('.contact-text')?.textContent.trim() || '';
      try {
        await navigator.clipboard.writeText(text);
        showToast('📋', `Copiado: ${text}`);
      } catch {
        showToast('📋', `${text}`);
      }
    });
  });
}

/* ─────────────────────────────────────────
   DOCUMENTS — mask toggle
───────────────────────────────────────── */
/**
 * Revela/oculta os dígitos mascarados ao clicar no valor do documento.
 * Simula a interação; em produção integraria com a API.
 */
function initDocMaskToggle() {
  document.querySelectorAll('.doc-value[data-masked]').forEach(el => {
    el.style.cursor = 'pointer';
    el.title = 'Clique para revelar';
    const masked   = el.dataset.masked;
    const revealed = el.dataset.revealed || masked;
    let visible    = false;

    el.addEventListener('click', () => {
      visible     = !visible;
      el.textContent = visible ? revealed : masked;
      el.title    = visible ? 'Clique para mascarar' : 'Clique para revelar';
      showToast(visible ? '👁️' : '🔒', visible ? 'Documento revelado' : 'Documento mascarado');
    });
  });
}

/* ─────────────────────────────────────────
   TIMELINE ITEMS — hover highlight
───────────────────────────────────────── */
function initTimeline() {
  document.querySelectorAll('.timeline-item').forEach(item => {
    item.style.cursor = 'default';
  });
}

/* ─────────────────────────────────────────
   LOAD PERFIL — API
───────────────────────────────────────── */
async function loadPerfil() {
  if (typeof API === 'undefined') return;
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) return;
    const assoc = await API.associados.getById(user.id);

    const nomeEl = document.querySelector('.profile-name, .hero-name, h1');
    if (nomeEl && assoc.nomeCompleto) nomeEl.textContent = assoc.nomeCompleto;

    const emailEl = document.querySelector('.contact-email .contact-text, [data-contact="email"]');
    if (emailEl && assoc.email) emailEl.textContent = assoc.email;

    const telefoneEl = document.querySelector('.contact-phone .contact-text, [data-contact="telefone"]');
    if (telefoneEl && assoc.telefone) telefoneEl.textContent = assoc.telefone;

    const matEl = document.querySelector('.profile-matricula, [data-field="matricula"]');
    if (matEl && assoc.matricula) matEl.textContent = assoc.matricula;

    const docs = await API.documentos.listByAssociado(user.id).catch(() => []);
    if (docs.length) {
      const docsContainer = document.querySelector('.documents-list, .docs-container');
      if (docsContainer) {
        docsContainer.innerHTML = docs.map(d => `
          <div class="doc-item">
            <span class="doc-name">${d.nomeArquivo || d.tipo || '—'}</span>
            ${d.url ? `<a href="${d.url}" target="_blank" style="font-size:12px;color:#237329">Ver</a>` : ''}
          </div>
        `).join('');
      }
    }
  } catch (err) {
    console.warn('[Perfil Dirigente] Erro ao carregar dados:', err.message);
  }
}

/* ─────────────────────────────────────────
   BOOTSTRAP
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  loadPerfil();
  initProfileActions();
  initContactCopy();
  initDocMaskToggle();
  initTimeline();
});