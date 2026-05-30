requireAuth('lobinho');

/* minha-matilha.js */

const matilhaState = {
  matilhaId:   null,
  matilhaNome: '—',
  status:      '—',
  chefes:      [],
  membros:     [],
};

document.addEventListener('DOMContentLoaded', () => {
  loadMatilhaData();
  setupEventListeners();
});

async function loadMatilhaData() {
  if (typeof API === 'undefined') return;

  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) return;

    /* Descobrir a matilha do lobinho via membros-matilha?associado= */
    const vinculos = await API.membroMatilha.listByAssociado(user.id);
    if (!vinculos || vinculos.length === 0) {
      console.warn('[Matilha] Lobinho sem vínculo de matilha.');
      return;
    }

    const vinculo = vinculos[0];
    matilhaState.matilhaId = vinculo.matilhaId || vinculo.id;

    const [matilha, membros] = await Promise.all([
      API.matilhas.getById(matilhaState.matilhaId),
      API.membroMatilha.listByMatilha(matilhaState.matilhaId),
    ]);

    matilhaState.matilhaNome = matilha.nome   || matilhaState.matilhaNome;
    matilhaState.status      = matilha.status || matilhaState.status;
    matilhaState.chefes      = membros.filter(m => m.cargo === 'chefe' || m.cargo === 'subchefia');
    matilhaState.membros     = membros;

    renderMatilha(matilha, membros);

  } catch (err) {
    console.error('[Matilha] Erro ao carregar:', err);
  }
}

function renderMatilha(matilha, membros) {
  const nomeEl = document.querySelector('.banner-title');
  if (nomeEl && matilha.nome) nomeEl.textContent = `Nossa Matilha: ${matilha.nome}`;

  const statusEl = document.querySelector('.banner-badge');
  if (statusEl && matilha.status) statusEl.textContent = matilha.status.toUpperCase();

  /* Atualiza chefes */
  const chefes = membros.filter(m => m.cargo === 'chefe' || m.cargo === 'subchefia');
  const chefesGrid = document.querySelector('.chefes-grid');
  if (chefesGrid && chefes.length > 0) {
    chefesGrid.innerHTML = chefes.map(c => `
      <div class="chefe-card">
        <div class="chefe-avatar">
          <span class="chefe-badge">👑</span>
        </div>
        <h3 class="chefe-name">${c.nomeCompleto || c.associadoId || '—'}</h3>
        <p class="chefe-role">${c.cargo || 'Chefe'}</p>
      </div>
    `).join('') + '<div class="chefe-card placeholder"><div class="placeholder-icon">👥</div><p class="placeholder-text">NOVOS CHEFES EM BREVE</p></div>';
  }

  /* Atualiza membros */
  const membrosGrid = document.querySelector('.membros-grid');
  const lobishos = membros.filter(m => m.cargo !== 'chefe' && m.cargo !== 'subchefia');
  if (membrosGrid && lobishos.length > 0) {
    const cores = ['#e8f5e9', '#fff3e0', '#e0f2f1', '#f5f5f5'];
    membrosGrid.innerHTML = lobishos.map((m, i) => `
      <div class="membro-card">
        <div class="membro-background" style="background-color: ${cores[i % cores.length]};"></div>
        <h3 class="membro-name">${m.nomeCompleto || m.associadoId || '—'}</h3>
        <span class="membro-badge">${m.cargo || 'Membro'}</span>
      </div>
    `).join('');
  }
}

function setupEventListeners() {
  document.getElementById('btnShare')?.addEventListener('click', shareMatilha);
}

async function shareMatilha() {
  try {
    if (navigator.share) {
      await navigator.share({
        title: `Nossa Matilha: ${matilhaState.matilhaNome}`,
        text:  `Faça parte da matilha ${matilhaState.matilhaNome} no Sistema de Escoteiros!`,
        url:   window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  } catch (err) {
    if (err.name !== 'AbortError') console.error('[Matilha] Erro ao compartilhar:', err);
  }
}