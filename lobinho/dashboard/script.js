requireAuth('lobinho');

/* dashboard-lobinho.js */

const dashboardState = {
  userProfile: null,
  activities:  [],
  trails:      [],
  isLoading:   false,
};

document.addEventListener('DOMContentLoaded', () => {
  loadUserProfile();
  loadActivities();
  loadTrails();
  setupEventListeners();
});

/* ─────────────────────────────────────────
   PERFIL
───────────────────────────────────────── */
function loadUserProfile() {
  try {
    const userData = localStorage.getItem('user');
    if (userData) {
      dashboardState.userProfile = JSON.parse(userData);
      updateProfileCard();
    }
  } catch (error) {
    console.error('[Dashboard] Erro ao carregar perfil:', error);
  }
}

function updateProfileCard() {
  const profile = dashboardState.userProfile;
  if (!profile) return;

  const profileName    = document.querySelector('.profile-name');
  const profileAlcateia = document.querySelector('.profile-alcateia');
  if (profileName)    profileName.textContent    = profile.name || profile.nomeCompleto || '—';
  if (profileAlcateia) profileAlcateia.textContent = profile.alcateia || profile.grupoId || '—';
}

/* ─────────────────────────────────────────
   ATIVIDADES — API real
───────────────────────────────────────── */
async function loadActivities() {
  if (typeof API === 'undefined') return;

  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) return;

    const atribuicoes = await API.atribuicoes.listByAssociado(user.id);
    dashboardState.activities = atribuicoes.map(a => ({
      id:          a.id,
      title:       a.atividadeNome || a.nomePersonalizado || '—',
      description: a.descricaoRegistro || '',
      status:      a.status === 'aprovado' ? 'concluded' : (a.status === 'rejeitado' ? 'rejected' : 'pending'),
    }));
    updateActivitiesList();
  } catch (error) {
    console.error('[Dashboard] Erro ao carregar atividades:', error);
  }
}

function updateActivitiesList() {
  const activitiesList = document.querySelector('.activities-list');
  if (!activitiesList) return;

  if (dashboardState.activities.length === 0) {
    activitiesList.innerHTML = '<p style="color:#aaa;text-align:center;padding:12px">Nenhuma atividade encontrada.</p>';
    return;
  }

  activitiesList.innerHTML = '';
  dashboardState.activities.forEach(activity => {
    activitiesList.appendChild(createActivityElement(activity));
  });
}

function createActivityElement(activity) {
  const div = document.createElement('div');
  div.className = 'activity-item';

  let statusHTML = '';
  if (activity.status === 'concluded') {
    statusHTML = '<span class="activity-status concluded">CONCLUÍDO</span>';
  } else if (activity.status === 'pending') {
    statusHTML = '<span class="activity-status pending">PENDENTE</span>';
  } else {
    statusHTML = '<span class="activity-arrow">→</span>';
  }

  div.innerHTML = `
    <div class="activity-content">
      <p class="activity-title">${activity.title}</p>
      <p class="activity-subtitle">${activity.description}</p>
    </div>
    ${statusHTML}
  `;

  return div;
}

/* ─────────────────────────────────────────
   TRILHAS — API real
───────────────────────────────────────── */
async function loadTrails() {
  if (typeof API === 'undefined') return;

  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [eixos, progressoes] = await Promise.all([
      API.eixos.list(),
      user.id ? API.progressoes.listByAssociado(user.id) : Promise.resolve([]),
    ]);

    dashboardState.trails = eixos.map(e => {
      const prog = progressoes.find(p => p.eixoId === e.id);
      return {
        id:          e.id,
        stage:       e.nome,
        title:       e.nome,
        description: e.descricao || '',
        progress:    prog ? prog.percentualConcluido : 0,
      };
    });

    updateTrailsList();
  } catch (error) {
    console.error('[Dashboard] Erro ao carregar trilhas:', error);
  }
}

function updateTrailsList() {
  const trailsGrid = document.querySelector('.trails-grid');
  if (!trailsGrid) return;

  if (dashboardState.trails.length === 0) return;

  trailsGrid.innerHTML = '';
  dashboardState.trails.slice(0, 2).forEach(trail => {
    trailsGrid.appendChild(createTrailElement(trail));
  });
}

function createTrailElement(trail) {
  const div = document.createElement('div');
  div.className = 'trail-item';
  div.innerHTML = `
    <div class="trail-header">
      <span class="trail-stage">${trail.stage}</span>
    </div>
    <h3 class="trail-title">${trail.title}</h3>
    <p class="trail-description">${trail.description}</p>
    <a href="../minha-jangal-atividades/" class="trail-link">→</a>
  `;
  return div;
}

/* ─────────────────────────────────────────
   EVENTOS
───────────────────────────────────────── */
function setupEventListeners() {
  const btnRegister = document.querySelector('.btn-register-activity');
  if (btnRegister) {
    btnRegister.addEventListener('click', () => {
      window.location.href = '../minha-jangal-atividades/';
    });
  }

  const btnShare = document.getElementById('btnShare');
  if (btnShare) {
    btnShare.addEventListener('click', () => {
      if (navigator.share) {
        navigator.share({ title: 'Meu Dashboard Lobinho', url: window.location.href });
      }
    });
  }
}

window.DashboardLobinho = { loadActivities, loadTrails };