/* minha-matilha.js */

/* ─────────────────────────────────────────
   ESTADO DA PÁGINA
───────────────────────────────────────── */
const matilhaState = {
  matilhaId:   null,
  matilhaNome: '—',
  status:      '—',
  chefes:      [],
  membros:     [],
  stats:       { especialidades: 0, cacadas: 0, alerta: '—' },
};

/* ─────────────────────────────────────────
   INICIALIZAÇÃO
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
  matilhaState.matilhaId = userData.matilhaId || null;

  loadMatilhaData();
  setupEventListeners();
});

/* ─────────────────────────────────────────
   LOAD MATILHA — busca da API
───────────────────────────────────────── */
async function loadMatilhaData() {
  try {
    if (typeof API === 'undefined' || !matilhaState.matilhaId) {
      console.warn('[Matilha] API indisponível ou matilhaId não definido — usando dados estáticos.');
      return;
    }

    const data = await API.matilhas.getById(matilhaState.matilhaId);

    matilhaState.matilhaNome = data.nome        || matilhaState.matilhaNome;
    matilhaState.status      = data.status      || matilhaState.status;
    matilhaState.chefes      = data.chefes      || [];
    matilhaState.membros     = data.membros      || [];
    matilhaState.stats       = data.stats        || matilhaState.stats;

    renderMatilha(data);

  } catch (err) {
    console.error('[Matilha] Erro ao carregar:', err);
    showError('Erro ao carregar dados da matilha. Usando dados estáticos.');
  }
}

/* ─────────────────────────────────────────
   RENDER — atualiza elementos do DOM com dados da API
───────────────────────────────────────── */
function renderMatilha(data) {
  const nomeEl = document.querySelector('.matilha-title, .pack-name, h1');
  if (nomeEl && data.nome) nomeEl.textContent = data.nome;

  const statusEl = document.querySelector('.matilha-status, .pack-status');
  if (statusEl && data.status) statusEl.textContent = data.status;

  if (data.stats) {
    const espEl = document.querySelector('[data-stat="especialidades"]');
    const cacEl = document.querySelector('[data-stat="cacadas"]');
    const altEl = document.querySelector('[data-stat="alerta"]');
    if (espEl) espEl.textContent = data.stats.especialidades ?? espEl.textContent;
    if (cacEl) cacEl.textContent = data.stats.cacadas        ?? cacEl.textContent;
    if (altEl) altEl.textContent = data.stats.alerta         ?? altEl.textContent;
  }
}

/* ─────────────────────────────────────────
   EVENT LISTENERS
───────────────────────────────────────── */
function setupEventListeners() {
  document.getElementById('btnShare')?.addEventListener('click', shareMatilha);
  document.getElementById('btnProfile')?.addEventListener('click', goToProfile);

  document.querySelectorAll('.membro-card').forEach(card => {
    card.addEventListener('click', function () {
      viewMemberProfile(this.querySelector('.membro-name')?.textContent || '');
    });
  });

  document.querySelectorAll('.chefe-card').forEach(card => {
    if (!card.classList.contains('placeholder')) {
      card.addEventListener('click', function () {
        viewChefProfile(this.querySelector('.chefe-name')?.textContent || '');
      });
    }
  });
}

/* ─────────────────────────────────────────
   PERFIS
───────────────────────────────────────── */
async function viewMemberProfile(memberName) {
  const member = matilhaState.membros.find(m => m.nome === memberName);
  if (!member) return;
  showSuccess(`Perfil de ${memberName}\nStatus: ${member.status || '—'}`);
}

async function viewChefProfile(chefeName) {
  const chefe = matilhaState.chefes.find(c => c.nome === chefeName);
  if (!chefe) return;
  showSuccess(`Perfil de ${chefeName}\nFunção: ${chefe.role || '—'}`);
}

/* ─────────────────────────────────────────
   NAVEGAÇÃO
───────────────────────────────────────── */
function goToProfile() {
  window.location.href = '../perfil-usuario/';
}

/* ─────────────────────────────────────────
   COMPARTILHAMENTO
───────────────────────────────────────── */
async function shareMatilha() {
  const shareData = {
    title: `Nossa Matilha: ${matilhaState.matilhaNome}`,
    text:  `Faça parte da matilha ${matilhaState.matilhaNome} no Sistema de Escoteiros!`,
    url:   window.location.href,
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(window.location.href);
      showSuccess('Link copiado para a área de transferência!');
    }
  } catch (err) {
    if (err.name !== 'AbortError') console.error('[Matilha] Erro ao compartilhar:', err);
  }
}

/* ─────────────────────────────────────────
   NOTIFICAÇÕES
───────────────────────────────────────── */
function showSuccess(message) {
  console.log('✅', message);
  alert(message);
}

function showError(message) {
  console.error('❌', message);
}
