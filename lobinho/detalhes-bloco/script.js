requireAuth('lobinho');

/**
 * DETALHES DO BLOCO FÍSICO - SCRIPT
 * =====================================
 * 
 * Este arquivo contém toda a lógica JavaScript para a tela de Detalhes do Bloco Físico.
 * Inclui funções para registrar atividades, compartilhar, navegar e interações gerais.
 * 
 * Estrutura pronta para integração com API backend.
 */

// ============================================
// ESTADO DA PÁGINA
// ============================================

const blockDetailsState = {
    blockId: '72-1809',
    blockName: 'Cuidado com o corpo',
    blockTitle: 'O Despertar da Pantera Bagheera',
    energy: 85,
    participants: 12,
    activities: [
        {
            id: 1,
            title: 'Corrida do Baloo',
            description: 'Complete um circuito de obstáculos na natureza em menos de 5 minutos.',
            icon: '🏃',
            color: '#feb300',
            status: 'available'
        },
        {
            id: 2,
            title: 'Nutrição do Lobo',
            description: 'Aprenda e identifique 5 frutas silvestres que são seguras para comer.',
            icon: '🍎',
            color: '#9df197',
            status: 'available'
        },
        {
            id: 3,
            title: 'Mergulho do Rio',
            description: 'Demonstre flutuabilidade básica em águas calmas por 60 segundos.',
            icon: '🏊',
            color: '#5fe0f6',
            status: 'available'
        }
    ],
    pending: [
        {
            id: 1,
            title: 'Salto da Pantera',
            status: 'Aguardando Akela...',
            date: '15/10'
        },
        {
            id: 2,
            title: 'Trilha Silenciosa',
            status: 'Enviado hoje',
            date: '18/10'
        }
    ],
    completed: [
        {
            id: 1,
            title: 'Higiene do Covil',
            date: '12/10'
        },
        {
            id: 2,
            title: 'Respiração da Brisa',
            date: '05/10'
        }
    ]
};

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Página de Detalhes do Bloco carregada');
    
    // Carregar dados da página
    loadBlockDetails();
    
    // Configurar event listeners
    setupEventListeners();
});

// ============================================
// FUNÇÕES DE CARREGAMENTO
// ============================================

/**
 * Carrega os detalhes do bloco de aprendizagem
 * TODO: Integrar com API para obter dados reais do backend
 */
async function loadBlockDetails() {
    try {
        console.log('📥 Carregando detalhes do bloco...');
        
        // TODO: Substituir por chamada real à API
        // const response = await fetch(`/api/blocks/${blockDetailsState.blockId}`);
        // const data = await response.json();
        // blockDetailsState = { ...blockDetailsState, ...data };
        
        // Por enquanto, usando dados mockados
        console.log('✅ Detalhes do bloco carregados:', blockDetailsState);
        
    } catch (error) {
        console.error('❌ Erro ao carregar detalhes do bloco:', error);
        showError('Erro ao carregar detalhes do bloco');
    }
}

// ============================================
// CONFIGURAÇÃO DE EVENT LISTENERS
// ============================================

/**
 * Configura todos os event listeners da página
 */
function setupEventListeners() {
    // Botões de registrar atividade
    document.querySelectorAll('.btn-registrar-atividade').forEach(btn => {
        btn.addEventListener('click', function() {
            const activityId = this.dataset.activity;
            openActivityModal(activityId);
        });
    });
    
    // Botão de compartilhar
    const btnShare = document.getElementById('btnShare');
    if (btnShare) {
        btnShare.addEventListener('click', shareBlock);
    }
    
    // Botão de perfil
    const btnProfile = document.getElementById('btnProfile');
    if (btnProfile) {
        btnProfile.addEventListener('click', goToProfile);
    }
    
    // Botão "Ver toda a jornada"
    const btnJourney = document.querySelector('.btn-see-all-journey');
    if (btnJourney) {
        btnJourney.addEventListener('click', viewFullJourney);
    }
    
    // Botão "Ir para Desafio Final"
    const btnChallenge = document.querySelector('.btn-final-challenge');
    if (btnChallenge) {
        btnChallenge.addEventListener('click', goToFinalChallenge);
    }
    
    // Links de ações pendentes
    document.querySelectorAll('.pending-action').forEach(btn => {
        btn.addEventListener('click', function() {
            viewPendingDetails(this);
        });
    });
    
    // Botões de deletar atividades concluídas
    document.querySelectorAll('.completed-action').forEach(btn => {
        btn.addEventListener('click', function() {
            deleteCompletedActivity(this);
        });
    });
}

// ============================================
// FUNÇÕES DE ATIVIDADES
// ============================================

/**
 * Abre modal para registrar uma atividade
 * @param {string} activityId - ID da atividade
 */
function openActivityModal(activityId) {
    const activity = blockDetailsState.activities.find(a => a.id == activityId);
    
    if (!activity) {
        console.error('❌ Atividade não encontrada');
        return;
    }
    
    console.log('📝 Abrindo modal para registrar:', activity.title);
    
    // TODO: Implementar modal visual
    // Por enquanto, simular com alert
    const result = confirm(`Deseja registrar a atividade: "${activity.title}"?`);
    
    if (result) {
        registerActivity(activityId);
    }
}

/**
 * Registra uma atividade como concluída
 * @param {string} activityId - ID da atividade
 */
async function registerActivity(activityId) {
    try {
        console.log('📤 Registrando atividade:', activityId);
        
        // TODO: Integrar com API
        // const response = await fetch('/api/activities/register', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({
        //         blockId: blockDetailsState.blockId,
        //         activityId: activityId,
        //         timestamp: new Date().toISOString()
        //     })
        // });
        
        // if (!response.ok) throw new Error('Erro ao registrar atividade');
        // const data = await response.json();
        
        // Simular sucesso
        showSuccess(`Atividade registrada com sucesso!`);
        
        // Recarregar dados
        setTimeout(() => {
            location.reload();
        }, 1500);
        
    } catch (error) {
        console.error('❌ Erro ao registrar atividade:', error);
        showError('Erro ao registrar atividade. Tente novamente.');
    }
}

/**
 * Visualiza detalhes de uma atividade pendente
 * @param {HTMLElement} element - Elemento clicado
 */
function viewPendingDetails(element) {
    const item = element.closest('.pending-item');
    const title = item.querySelector('.pending-title').textContent;
    
    console.log('👀 Visualizando pendência:', title);
    
    // TODO: Implementar modal com detalhes
    alert(`Detalhes de: ${title}`);
}

/**
 * Deleta uma atividade concluída
 * @param {HTMLElement} element - Elemento clicado
 */
async function deleteCompletedActivity(element) {
    const item = element.closest('.completed-item');
    const title = item.querySelector('.completed-title').textContent;
    
    if (!confirm(`Deseja remover "${title}" do histórico?`)) {
        return;
    }
    
    console.log('🗑️ Deletando atividade concluída:', title);
    
    try {
        // TODO: Integrar com API
        // const response = await fetch('/api/activities/delete', {
        //     method: 'DELETE',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ title: title })
        // });
        
        // Simular sucesso
        item.style.opacity = '0.5';
        setTimeout(() => {
            item.remove();
            showSuccess('Atividade removida do histórico');
        }, 300);
        
    } catch (error) {
        console.error('❌ Erro ao deletar atividade:', error);
        showError('Erro ao remover atividade');
    }
}

// ============================================
// FUNÇÕES DE NAVEGAÇÃO
// ============================================

/**
 * Navega para a página de perfil do usuário
 */
function goToProfile() {
    console.log('🔗 Navegando para perfil do usuário');
    window.location.href = '../perfil-usuario/';
}

/**
 * Visualiza toda a jornada de atividades concluídas
 */
function viewFullJourney() {
    console.log('🗺️ Abrindo visualização de jornada completa');
    
    // TODO: Implementar modal ou página de jornada completa
    alert('Jornada completa: Exibir todas as atividades concluídas');
}

/**
 * Navega para o desafio final da insígnia
 */
function goToFinalChallenge() {
    console.log('🏆 Navegando para desafio final');
    
    // TODO: Integrar com sistema de desafios
    alert('Desafio Final: Insígnia da Saúde');
}

// ============================================
// FUNÇÕES DE COMPARTILHAMENTO
// ============================================

/**
 * Compartilha o bloco de aprendizagem
 */
async function shareBlock() {
    console.log('📤 Compartilhando bloco');
    
    const shareData = {
        title: blockDetailsState.blockTitle,
        text: `Estou praticando "${blockDetailsState.blockTitle}" no Sistema de Escoteiros!`,
        url: window.location.href
    };
    
    try {
        // Usar Web Share API se disponível
        if (navigator.share) {
            await navigator.share(shareData);
            console.log('✅ Compartilhado com sucesso');
        } else {
            // Fallback: copiar link
            copyToClipboard(window.location.href);
            showSuccess('Link copiado para a área de transferência!');
        }
    } catch (error) {
        if (error.name !== 'AbortError') {
            console.error('❌ Erro ao compartilhar:', error);
        }
    }
}

/**
 * Copia texto para a área de transferência
 * @param {string} text - Texto a copiar
 */
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).catch(err => {
        console.error('❌ Erro ao copiar:', err);
    });
}

// ============================================
// FUNÇÕES DE NOTIFICAÇÃO
// ============================================

/**
 * Exibe mensagem de sucesso
 * @param {string} message - Mensagem a exibir
 */
function showSuccess(message) {
    console.log('✅', message);
    
    // TODO: Implementar toast visual
    // Por enquanto, usar alert
    alert(message);
}

/**
 * Exibe mensagem de erro
 * @param {string} message - Mensagem a exibir
 */
function showError(message) {
    console.error('❌', message);
    
    // TODO: Implementar toast visual
    // Por enquanto, usar alert
    alert(message);
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Formata data para formato legível
 * @param {string} dateString - Data em string
 * @returns {string} Data formatada
 */
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
}

/**
 * Calcula progresso percentual
 * @param {number} completed - Atividades completas
 * @param {number} total - Total de atividades
 * @returns {number} Percentual
 */
function calculateProgress(completed, total) {
    return Math.round((completed / total) * 100);
}

console.log('✅ Script de Detalhes do Bloco carregado com sucesso!');
