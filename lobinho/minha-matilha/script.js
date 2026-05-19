/**
 * MINHA MATILHA - SCRIPT
 * =====================================
 * 
 * Este arquivo contém toda a lógica JavaScript para a tela de Minha Matilha.
 * Inclui funções para visualizar membros, chefes, compartilhar e interações gerais.
 * 
 * Estrutura pronta para integração com API backend.
 */

// ============================================
// ESTADO DA PÁGINA
// ============================================

const matilhaState = {
    matilhaId: '72-2278',
    matilhaNome: 'Lobos Cinzentos',
    status: 'ATIVA',
    chefes: [
        {
            id: 1,
            nome: 'Akela',
            role: 'Chefe de Alcateia',
            imagem: './72-2280.webp',
            badge: '👑'
        },
        {
            id: 2,
            nome: 'Baloo',
            role: 'Instrutor da Jângal',
            imagem: './72-2281.webp',
            badge: '🏆'
        }
    ],
    membros: [
        {
            id: 1,
            nome: 'Mowgli',
            imagem: './72-2282.webp',
            status: 'PRÓ',
            cor: '#e8f5e9'
        },
        {
            id: 2,
            nome: 'Bagheera',
            imagem: './72-2283.webp',
            status: 'Pata Tenta',
            cor: '#fff3e0'
        },
        {
            id: 3,
            nome: 'Raksha',
            imagem: './72-2284.webp',
            status: 'Rastreador',
            cor: '#e0f2f1'
        },
        {
            id: 4,
            nome: 'Chil',
            imagem: './72-2285.webp',
            status: 'Pata Veya',
            cor: '#f5f5f5'
        }
    ],
    stats: {
        especialidades: 450,
        cacadas: 12,
        alerta: '100%'
    }
};

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Página de Minha Matilha carregada');
    
    // Carregar dados da página
    loadMatilhaData();
    
    // Configurar event listeners
    setupEventListeners();
});

// ============================================
// FUNÇÕES DE CARREGAMENTO
// ============================================

/**
 * Carrega os dados da matilha
 * TODO: Integrar com API para obter dados reais do backend
 */
async function loadMatilhaData() {
    try {
        console.log('📥 Carregando dados da matilha...');
        
        // TODO: Substituir por chamada real à API
        // const response = await fetch(`/api/matilhas/${matilhaState.matilhaId}`);
        // const data = await response.json();
        // matilhaState = { ...matilhaState, ...data };
        
        // Por enquanto, usando dados mockados
        console.log('✅ Dados da matilha carregados:', matilhaState);
        
        // Renderizar membros
        renderMembros();
        
    } catch (error) {
        console.error('❌ Erro ao carregar dados da matilha:', error);
        showError('Erro ao carregar dados da matilha');
    }
}

/**
 * Renderiza os membros da matilha
 */
function renderMembros() {
    console.log('🎨 Renderizando membros da matilha');
    
    // Os membros já estão no HTML, mas aqui você pode adicionar
    // lógica para atualizar dinamicamente se necessário
}

// ============================================
// CONFIGURAÇÃO DE EVENT LISTENERS
// ============================================

/**
 * Configura todos os event listeners da página
 */
function setupEventListeners() {
    // Botão de compartilhar
    const btnShare = document.getElementById('btnShare');
    if (btnShare) {
        btnShare.addEventListener('click', shareMatilha);
    }
    
    // Botão de perfil
    const btnProfile = document.getElementById('btnProfile');
    if (btnProfile) {
        btnProfile.addEventListener('click', goToProfile);
    }
    
    // Cards de membros
    document.querySelectorAll('.membro-card').forEach(card => {
        card.addEventListener('click', function() {
            const name = this.querySelector('.membro-name').textContent;
            viewMemberProfile(name);
        });
    });
    
    // Cards de chefes
    document.querySelectorAll('.chefe-card').forEach(card => {
        if (!card.classList.contains('placeholder')) {
            card.addEventListener('click', function() {
                const name = this.querySelector('.chefe-name').textContent;
                viewChefProfile(name);
            });
        }
    });
}

// ============================================
// FUNÇÕES DE VISUALIZAÇÃO
// ============================================

/**
 * Visualiza o perfil de um membro
 * @param {string} memberName - Nome do membro
 */
async function viewMemberProfile(memberName) {
    try {
        console.log('👀 Visualizando perfil do membro:', memberName);
        
        const member = matilhaState.membros.find(m => m.nome === memberName);
        
        if (!member) {
            console.error('❌ Membro não encontrado');
            return;
        }
        
        // TODO: Integrar com API para obter detalhes completos
        // const response = await fetch(`/api/membros/${member.id}`);
        // const data = await response.json();
        
        // TODO: Abrir modal ou navegar para página de perfil
        console.log('📋 Detalhes do membro:', member);
        
        // Simular com alert
        alert(`Perfil de ${memberName}\nStatus: ${member.status}`);
        
    } catch (error) {
        console.error('❌ Erro ao visualizar perfil do membro:', error);
        showError('Erro ao visualizar perfil');
    }
}

/**
 * Visualiza o perfil de um chefe
 * @param {string} chefeName - Nome do chefe
 */
async function viewChefProfile(chefeName) {
    try {
        console.log('👀 Visualizando perfil do chefe:', chefeName);
        
        const chefe = matilhaState.chefes.find(c => c.nome === chefeName);
        
        if (!chefe) {
            console.error('❌ Chefe não encontrado');
            return;
        }
        
        // TODO: Integrar com API para obter detalhes completos
        // const response = await fetch(`/api/chefes/${chefe.id}`);
        // const data = await response.json();
        
        // TODO: Abrir modal ou navegar para página de perfil
        console.log('📋 Detalhes do chefe:', chefe);
        
        // Simular com alert
        alert(`Perfil de ${chefeName}\nFunção: ${chefe.role}`);
        
    } catch (error) {
        console.error('❌ Erro ao visualizar perfil do chefe:', error);
        showError('Erro ao visualizar perfil');
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

// ============================================
// FUNÇÕES DE COMPARTILHAMENTO
// ============================================

/**
 * Compartilha a matilha
 */
async function shareMatilha() {
    console.log('📤 Compartilhando matilha');
    
    const shareData = {
        title: `Nossa Matilha: ${matilhaState.matilhaNome}`,
        text: `Faça parte da matilha ${matilhaState.matilhaNome} no Sistema de Escoteiros!`,
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
 * Calcula idade média da matilha
 * @returns {number} Idade média
 */
function calculateAverageAge() {
    // TODO: Implementar cálculo real
    return 8;
}

/**
 * Conta membros por status
 * @returns {object} Contagem por status
 */
function countMembersByStatus() {
    const counts = {};
    
    matilhaState.membros.forEach(member => {
        counts[member.status] = (counts[member.status] || 0) + 1;
    });
    
    return counts;
}

/**
 * Formata número com separador de milhar
 * @param {number} num - Número a formatar
 * @returns {string} Número formatado
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

console.log('✅ Script de Minha Matilha carregado com sucesso!');
