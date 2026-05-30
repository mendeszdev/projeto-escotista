requireAuth('lobinho');

/* perfil-usuario.js */

document.addEventListener('DOMContentLoaded', async function() {
  await loadPerfilData();
  setupEventListeners();
});

/* ─────────────────────────────────────────
   CARGA DO PERFIL — API real
───────────────────────────────────────── */
async function loadPerfilData() {
  if (typeof API === 'undefined') return;

  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) return;

    const [assoc, docs, atribuicoes, progressoes] = await Promise.all([
      API.associados.getById(user.id),
      API.documentos.listByAssociado(user.id),
      API.atribuicoes.listByAssociado(user.id),
      API.progressoes.listByAssociado(user.id),
    ]);

    /* Nome e matrícula */
    const nomeEl = document.querySelector('.perfil-nome, .profile-name, h1.user-name');
    if (nomeEl) nomeEl.textContent = assoc.nomeEscoteiro || assoc.nomeCompleto || '—';

    const matEl = document.querySelector('.perfil-matricula, .profile-matricula, .user-matricula');
    if (matEl) matEl.textContent = assoc.matricula || '—';

    /* Progresso geral */
    const progGeral = progressoes.length > 0
      ? progressoes.reduce((acc, p) => acc + (p.percentualConcluido || 0), 0) / progressoes.length
      : 0;

    const progBar = document.querySelector('.progress-bar-fill, .xp-fill, [data-progress]');
    if (progBar) progBar.style.width = `${Math.round(progGeral)}%`;

    const progText = document.querySelector('.progress-pct, .progress-text');
    if (progText) progText.textContent = `${Math.round(progGeral)}%`;

    /* Estatísticas de atividades */
    const concluidas = atribuicoes.filter(a => a.status === 'aprovado').length;
    const pendentes  = atribuicoes.filter(a => a.status === 'pendente').length;

    const statConcluidas = document.querySelector('[data-stat="concluidas"], .stat-concluidas');
    if (statConcluidas) statConcluidas.textContent = concluidas;

    const statPendentes = document.querySelector('[data-stat="pendentes"], .stat-pendentes');
    if (statPendentes) statPendentes.textContent = pendentes;

    /* Documentos */
    if (docs && docs.length > 0) {
      const docsContainer = document.querySelector('.documents-list, .docs-grid, .documentos-lista');
      if (docsContainer) {
        docsContainer.innerHTML = docs.map(doc => `
          <div class="document-item" style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid #f0f0f0">
            <span class="document-name" style="font-size:14px;font-weight:600">${doc.nomeArquivo || doc.tipo || '—'}</span>
            <div style="display:flex;gap:8px">
              ${doc.url ? `<button onclick="window.open('${doc.url}','_blank')" style="background:none;border:1px solid #ddd;border-radius:6px;padding:4px 10px;cursor:pointer;font-size:12px">👁️</button>` : ''}
            </div>
          </div>
        `).join('');
      }
    }

  } catch (err) {
    console.error('[Perfil] Erro ao carregar dados:', err);
  }
}

/* ─────────────────────────────────────────
   EVENTOS
───────────────────────────────────────── */
function setupEventListeners() {
  document.getElementById('btnShare')?.addEventListener('click', async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Meu Perfil Escoteiro', url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
      }
    } catch (err) {
      if (err.name !== 'AbortError') console.error(err);
    }
  });

  document.getElementById('btnUpdateProfile')?.addEventListener('click', () => {
    alert('Funcionalidade de edição de perfil em desenvolvimento.');
  });
}