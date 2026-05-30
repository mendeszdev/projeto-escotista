requireAuth('lobinho');

/* ============================================
   DASHBOARD LOBINHO - SCRIPT.JS
   Lógica de dashboard com funções comentadas
   Pronto para integração com API backend
   ============================================ */

/**
 * Objeto para armazenar dados do dashboard
 * @type {Object}
 */
const dashboardState = {
    userProfile: null,
    activities: [],
    trails: [],
    badges: [],
    isLoading: false,
};

/**
 * Inicializa o dashboard quando o DOM está pronto
 * Carrega dados do usuário e configura event listeners
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('📊 Dashboard Lobinho inicializado');
    
    // Carregar dados do usuário
    loadUserProfile();
    
    // Carregar atividades
    loadActivities();
    
    // Carregar trilhas de aprendizagem
    loadTrails();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Atualizar dados a cada 30 segundos
    setInterval(() => {
        refreshDashboard();
    }, 30000);
});

/**
 * Carrega o perfil do usuário
 * Busca dados do localStorage ou da API
 */
function loadUserProfile() {
    console.log('👤 Carregando perfil do usuário...');
    
    try {
        // Tentar obter dados do localStorage
        const userData = localStorage.getItem('user');
        
        if (userData) {
            dashboardState.userProfile = JSON.parse(userData);
            console.log('✅ Perfil carregado do localStorage');
            updateProfileCard();
        } else {
            // TODO: Chamar API para obter perfil
            console.log('⚠️ Nenhum perfil encontrado, usando dados MOCK');
            dashboardState.userProfile = getMockUserProfile();
            updateProfileCard();
        }
    } catch (error) {
        console.error('❌ Erro ao carregar perfil:', error);
        dashboardState.userProfile = getMockUserProfile();
        updateProfileCard();
    }
}

/**
 * MOCK: Retorna dados fictícios do perfil do usuário
 * @returns {Object} Dados do perfil
 */
function getMockUserProfile() {
    return {
        id: '123',
        name: 'Mowgli Silva',
        alcateia: 'Alcateia Seeonee',
        xp: 2450,
        xpMax: 3750,
        activities: 12,
        specialties: 4,
        frequency: 85,
        avatar: 'assets/98-1053.webp',
    };
}

/**
 * Atualiza o card de perfil com os dados do usuário
 */
function updateProfileCard() {
    const profile = dashboardState.userProfile;
    
    if (!profile) return;
    
    // Atualizar nome e alcateia
    const profileName = document.querySelector('.profile-name');
    const profileAlcateia = document.querySelector('.profile-alcateia');
    
    if (profileName) profileName.textContent = profile.name;
    if (profileAlcateia) profileAlcateia.textContent = profile.alcateia;
    
    // Atualizar XP
    const xpValue = document.querySelector('.xp-value');
    const xpFill = document.querySelector('.xp-fill');
    
    if (xpValue) xpValue.textContent = `${profile.xp} XP`;
    if (xpFill) {
        const percentage = (profile.xp / profile.xpMax) * 100;
        xpFill.style.width = `${percentage}%`;
    }
    
    // Atualizar stats
    const stats = document.querySelectorAll('.stat-value');
    if (stats.length >= 3) {
        stats[0].textContent = profile.activities;
        stats[1].textContent = profile.specialties;
        stats[2].textContent = `${profile.frequency}%`;
    }
    
    console.log('✅ Card de perfil atualizado');
}

/**
 * Carrega as atividades do usuário
 * Busca da API ou usa dados MOCK
 */
async function loadActivities() {
    console.log('📋 Carregando atividades...');
    
    setLoadingState(true);
    
    try {
        // TODO: Substituir por chamada real à API
        // const response = await fetch('/api/activities', {
        //     headers: { 'Authorization': `Bearer ${authState.token}` }
        // });
        // dashboardState.activities = await response.json();
        
        // MOCK: Usar dados fictícios
        dashboardState.activities = getMockActivities();
        
        updateActivitiesList();
        console.log('✅ Atividades carregadas');
    } catch (error) {
        console.error('❌ Erro ao carregar atividades:', error);
        dashboardState.activities = getMockActivities();
        updateActivitiesList();
    } finally {
        setLoadingState(false);
    }
}

/**
 * MOCK: Retorna atividades fictícias
 * @returns {Array} Lista de atividades
 */
function getMockActivities() {
    return [
        {
            id: '1',
            title: 'Lei do Lobinho',
            description: 'Revisar com Baloo',
            icon: 'assets/72-101.svg',
            status: 'concluded',
        },
        {
            id: '2',
            title: 'Boa Ação Diária',
            description: 'Ajudar em casa',
            icon: 'assets/72-113.svg',
            status: 'pending',
        },
        {
            id: '3',
            title: 'Identificar Árvores',
            description: 'Na trilha da Jângal',
            icon: 'assets/72-125.svg',
            status: 'in_progress',
        },
    ];
}

/**
 * Atualiza a lista de atividades na interface
 */
function updateActivitiesList() {
    const activitiesList = document.querySelector('.activities-list');
    
    if (!activitiesList) return;
    
    // Limpar lista
    activitiesList.innerHTML = '';
    
    // Adicionar atividades
    dashboardState.activities.forEach((activity) => {
        const activityElement = createActivityElement(activity);
        activitiesList.appendChild(activityElement);
    });
    
    console.log('✅ Lista de atividades atualizada');
}

/**
 * Cria um elemento HTML para uma atividade
 * @param {Object} activity - Dados da atividade
 * @returns {HTMLElement} Elemento da atividade
 */
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
        <div class="activity-icon">
            <img src="${activity.icon}" alt="${activity.title}" class="icon">
        </div>
        <div class="activity-content">
            <p class="activity-title">${activity.title}</p>
            <p class="activity-subtitle">${activity.description}</p>
        </div>
        ${statusHTML}
    `;
    
    // Adicionar event listener
    div.addEventListener('click', () => handleActivityClick(activity));
    
    return div;
}

/**
 * Manipula o clique em uma atividade
 * @param {Object} activity - Dados da atividade
 */
function handleActivityClick(activity) {
    console.log('🖱️ Atividade clicada:', activity.title);
    
    // TODO: Redirecionar para página de detalhes da atividade
    // window.location.href = `/lobinho/atividade/${activity.id}`;
    
    alert(`Atividade: ${activity.title}\n\n${activity.description}`);
}

/**
 * Carrega as trilhas de aprendizagem
 * Busca da API ou usa dados MOCK
 */
async function loadTrails() {
    console.log('🗺️ Carregando trilhas de aprendizagem...');
    
    try {
        // TODO: Substituir por chamada real à API
        // const response = await fetch('/api/trails', {
        //     headers: { 'Authorization': `Bearer ${authState.token}` }
        // });
        // dashboardState.trails = await response.json();
        
        // MOCK: Usar dados fictícios
        dashboardState.trails = getMockTrails();
        
        updateTrailsList();
        console.log('✅ Trilhas carregadas');
    } catch (error) {
        console.error('❌ Erro ao carregar trilhas:', error);
        dashboardState.trails = getMockTrails();
        updateTrailsList();
    }
}

/**
 * MOCK: Retorna trilhas fictícias
 * @returns {Array} Lista de trilhas
 */
function getMockTrails() {
    return [
        {
            id: '1',
            stage: 'Etapa 1',
            title: 'A História da Jângal',
            description: 'Aprenda sobre a Alcateia de Seeonee e nossos amigos Akela, Baloo e Bagheera.',
            participants: ['assets/72-184.webp', 'assets/72-186.webp'],
            participantCount: 4,
            locked: false,
        },
        {
            id: '2',
            stage: 'Etapa 3',
            title: 'Primeiros Cuidados',
            description: 'Conheça as ervas da Jângal e como tratar pequenos arranhões de espinhos.',
            participants: ['assets/72-206.webp'],
            participantCount: 8,
            locked: false,
        },
    ];
}

/**
 * Atualiza a lista de trilhas na interface
 */
function updateTrailsList() {
    const trailsGrid = document.querySelector('.trails-grid');
    
    if (!trailsGrid) return;
    
    // Limpar grid
    trailsGrid.innerHTML = '';
    
    // Adicionar trilhas
    dashboardState.trails.forEach((trail) => {
        const trailElement = createTrailElement(trail);
        trailsGrid.appendChild(trailElement);
    });
    
    console.log('✅ Lista de trilhas atualizada');
}

/**
 * Cria um elemento HTML para uma trilha
 * @param {Object} trail - Dados da trilha
 * @returns {HTMLElement} Elemento da trilha
 */
function createTrailElement(trail) {
    const div = document.createElement('div');
    div.className = 'trail-item';
    
    let participantsHTML = '';
    trail.participants.forEach((participant) => {
        participantsHTML += `<img src="${participant}" alt="Participant" class="participant-avatar">`;
    });
    participantsHTML += `<span class="participant-count">+${trail.participantCount}</span>`;
    
    div.innerHTML = `
        <div class="trail-header">
            <span class="trail-stage">${trail.stage}</span>
            <img src="assets/${trail.locked ? '72-174.svg' : '72-191.svg'}" alt="Lock" class="trail-icon">
        </div>
        <h3 class="trail-title">${trail.title}</h3>
        <p class="trail-description">${trail.description}</p>
        <div class="trail-participants">
            ${participantsHTML}
        </div>
        <a href="#" class="trail-link">→</a>
    `;
    
    // Adicionar event listener
    div.addEventListener('click', () => handleTrailClick(trail));
    
    return div;
}

/**
 * Manipula o clique em uma trilha
 * @param {Object} trail - Dados da trilha
 */
function handleTrailClick(trail) {
    console.log('🖱️ Trilha clicada:', trail.title);
    
    // TODO: Redirecionar para página de detalhes da trilha
    // window.location.href = `/lobinho/trilha/${trail.id}`;
    
    alert(`Trilha: ${trail.title}\n\n${trail.description}`);
}

/**
 * Configura os event listeners dos botões
 */
function setupEventListeners() {
    // Botão "Registrar Atividade"
    const btnRegisterActivity = document.querySelector('.btn-register-activity');
    if (btnRegisterActivity) {
        btnRegisterActivity.addEventListener('click', handleRegisterActivity);
    }
    
    // Botão "Compartilhar"
    const btnShare = document.getElementById('btnShare');
    if (btnShare) {
        btnShare.addEventListener('click', handleShare);
    }
    
    // Links "Ver Todos"
    const cardLinks = document.querySelectorAll('.card-link');
    cardLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('🔗 Link clicado');
            // TODO: Implementar navegação
        });
    });
}

/**
 * Manipula o clique no botão "Registrar Atividade"
 */
function handleRegisterActivity() {
    console.log('📝 Registrar atividade clicado');
    
    // TODO: Abrir modal ou redirecionar para página de registro
    alert('Funcionalidade de registro de atividade em desenvolvimento');
}

/**
 * Manipula o clique no botão "Compartilhar"
 */
function handleShare() {
    console.log('📤 Compartilhar clicado');
    
    // TODO: Implementar compartilhamento
    if (navigator.share) {
        navigator.share({
            title: 'Meu Dashboard Lobinho',
            text: 'Confira meu progresso na Jângal!',
            url: window.location.href,
        });
    } else {
        alert('Funcionalidade de compartilhamento não disponível');
    }
}

/**
 * Atualiza o dashboard (recarrega dados)
 */
async function refreshDashboard() {
    console.log('🔄 Atualizando dashboard...');
    
    await loadUserProfile();
    await loadActivities();
    await loadTrails();
}

/**
 * Define o estado de carregamento
 * @param {boolean} isLoading - True se está carregando
 */
function setLoadingState(isLoading) {
    dashboardState.isLoading = isLoading;
    
    // TODO: Mostrar/ocultar spinner de carregamento
    if (isLoading) {
        console.log('⏳ Carregando...');
    } else {
        console.log('✅ Carregamento concluído');
    }
}

/**
 * Marca uma atividade como concluída
 * @param {string} activityId - ID da atividade
 */
async function completeActivity(activityId) {
    console.log('✅ Marcando atividade como concluída:', activityId);
    
    try {
        // TODO: Chamar API para marcar atividade como concluída
        // const response = await fetch(`/api/activities/${activityId}/complete`, {
        //     method: 'POST',
        //     headers: { 'Authorization': `Bearer ${authState.token}` }
        // });
        
        console.log('✅ Atividade marcada como concluída');
        
        // Atualizar dashboard
        await refreshDashboard();
    } catch (error) {
        console.error('❌ Erro ao marcar atividade como concluída:', error);
    }
}

/**
 * Obtém o progresso geral do usuário
 * @returns {number} Percentual de progresso (0-100)
 */
function getOverallProgress() {
    const profile = dashboardState.userProfile;
    
    if (!profile) return 0;
    
    return (profile.xp / profile.xpMax) * 100;
}

/**
 * Exibe uma notificação
 * @param {string} message - Mensagem da notificação
 * @param {string} type - Tipo (success, error, warning, info)
 */
function showNotification(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // TODO: Implementar notificação visual
    // createNotification(type, message);
}

// Exportar funções para uso global
window.DashboardLobinho = {
    loadUserProfile,
    loadActivities,
    loadTrails,
    refreshDashboard,
    completeActivity,
    getOverallProgress,
    showNotification,
};
