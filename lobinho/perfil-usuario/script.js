/**
 * MEU PERFIL - SCRIPT
 * =====================================
 * 
 * Este arquivo contém toda a lógica JavaScript para a tela de Meu Perfil.
 * Inclui funções para visualizar dados do perfil, editar informações, compartilhar e interações gerais.
 * 
 * Estrutura pronta para integração com API backend.
 */

// ============================================
// ESTADO DA PÁGINA
// ============================================

const perfilState = {
    userId: 'user-123',
    nome: 'Pedro Silva',
    matricula: '000.123-4',
    matilha: 'Lobos Cinzentos',
    anoIngresso: 2026,
    progresso: 85,
    especialidades: 12,
    progressoTrilha: 'Rastreador',
    especialidadesData: [
        {
            id: 1,
            nome: 'Culinária',
            icon: '🍳',
            data: '15/03/2026',
            status: 'concluida'
        },
        {
            id: 2,
            nome: 'Socorrista',
            icon: '🏥',
            data: '22/03/2026',
            status: 'concluida'
        },
        {
            id: 3,
            nome: 'Pioneira',
            icon: '🏕️',
            data: '08/04/2026',
            status: 'concluida'
        },
        {
            id: 4,
            nome: 'Clima',
            icon: '🌤️',
            data: null,
            status: 'em_progresso'
        }
    ],
    atividades: [
        {
            id: 1,
            titulo: 'Boa Ação da Semana',
            icon: '📋',
            data: '18/05/2026',
            status: 'concluida'
        },
        {
            id: 2,
            titulo: 'Identificar Árvores',
            icon: '🌳',
            data: '15/05/2026',
            status: 'concluida'
        },
        {
            id: 3,
            titulo: 'Fazer Fogo de Acampamento',
            icon: '🔥',
            data: null,
            status: 'pendente'
        }
    ],
    documentos: [
        {
            id: 1,
            nome: 'Carteira de Identidade',
            tipo: 'PDF',
            tamanho: '1.2 MB',
            data: '01/01/2026'
        },
        {
            id: 2,
            nome: 'Comprovante de Filiação',
            tipo: 'PDF',
            tamanho: '450 KB',
            data: '05/01/2026'
        }
    ]
};

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Página de Meu Perfil carregada');
    
    // Carregar dados do perfil
    loadPerfilData();
    
    // Configurar event listeners
    setupEventListeners();
});

// ============================================
// FUNÇÕES DE CARREGAMENTO
// ============================================

/**
 * Carrega os dados do perfil do usuário
 * TODO: Integrar com API para obter dados reais do backend
 */
async function loadPerfilData() {
    try {
        console.log('📥 Carregando dados do perfil...');
        
        // TODO: Substituir por chamada real à API
        // const response = await fetch(`/api/usuarios/${perfilState.userId}`);
        // const data = await response.json();
        // perfilState = { ...perfilState, ...data };
        
        // Por enquanto, usando dados mockados
        console.log('✅ Dados do perfil carregados:', perfilState);
        
        // Renderizar dados
        renderPerfilHeader();
        renderProgressoTrilha();
        renderEspecialidades();
        renderAtividades();
        renderDocumentos();
        
    } catch (error) {
        console.error('❌ Erro ao carregar dados do perfil:', error);
        showError('Erro ao carregar dados do perfil');
    }
}

/**
 * Renderiza o header do perfil com informações básicas
 */
function renderPerfilHeader() {
    console.log('🎨 Renderizando header do perfil');
    
    // Os dados já estão no HTML, mas aqui você pode adicionar
    // lógica para atualizar dinamicamente se necessário
}

/**
 * Renderiza a trilha de progresso
 */
function renderProgressoTrilha() {
    console.log('🎨 Renderizando trilha de progresso');
    
    // Os dados já estão no HTML, mas aqui você pode adicionar
    // lógica para atualizar dinamicamente se necessário
}

/**
 * Renderiza as especialidades
 */
function renderEspecialidades() {
    console.log('🎨 Renderizando especialidades');
    
    // Os dados já estão no HTML, mas aqui você pode adicionar
    // lógica para atualizar dinamicamente se necessário
}

/**
 * Renderiza as atividades recentes
 */
function renderAtividades() {
    console.log('🎨 Renderizando atividades recentes');
    
    // Os dados já estão no HTML, mas aqui você pode adicionar
    // lógica para atualizar dinamicamente se necessário
}

/**
 * Renderiza os documentos
 */
function renderDocumentos() {
    console.log('🎨 Renderizando documentos');
    
    // Os dados já estão no HTML, mas aqui você pode adicionar
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
        btnShare.addEventListener('click', sharePerfil);
    }
    
    // Botão de perfil
    const btnProfile = document.getElementById('btnProfile');
    if (btnProfile) {
        btnProfile.addEventListener('click', goToProfile);
    }
    
    // Botão de atualizar informações
    const btnUpdateProfile = document.getElementById('btnUpdateProfile');
    if (btnUpdateProfile) {
        btnUpdateProfile.addEventListener('click', updateProfile);
    }
    
    // Links "Ver Todas"
    document.querySelectorAll('.link-action').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.closest('.profile-section');
            const title = section.querySelector('.section-title').textContent;
            console.log('📋 Visualizando todas as:', title);
            // TODO: Implementar navegação para página completa
        });
    });
    
    // Botões de visualizar/baixar documentos
    document.querySelectorAll('.btn-small').forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.textContent.trim();
            const docName = this.closest('.document-item').querySelector('.document-name').textContent;
            
            if (action === '👁️') {
                viewDocument(docName);
            } else if (action === '⬇️') {
                downloadDocument(docName);
            }
        });
    });
}

// ============================================
// FUNÇÕES DE AÇÃO
// ============================================

/**
 * Atualiza as informações do perfil
 */
async function updateProfile() {
    try {
        console.log('✏️ Atualizando perfil do usuário');
        
        // TODO: Integrar com API para atualizar dados
        // const response = await fetch(`/api/usuarios/${perfilState.userId}`, {
        //     method: 'PUT',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(perfilState)
        // });
        
        // TODO: Abrir modal de edição
        alert('Funcionalidade de edição em desenvolvimento');
        
    } catch (error) {
        console.error('❌ Erro ao atualizar perfil:', error);
        showError('Erro ao atualizar perfil');
    }
}

/**
 * Visualiza um documento
 * @param {string} docName - Nome do documento
 */
async function viewDocument(docName) {
    try {
        console.log('👁️ Visualizando documento:', docName);
        
        // TODO: Integrar com API para obter URL do documento
        // const response = await fetch(`/api/documentos/${docName}/view`);
        // const data = await response.json();
        
        // TODO: Abrir documento em nova aba ou modal
        alert(`Visualizando: ${docName}`);
        
    } catch (error) {
        console.error('❌ Erro ao visualizar documento:', error);
        showError('Erro ao visualizar documento');
    }
}

/**
 * Baixa um documento
 * @param {string} docName - Nome do documento
 */
async function downloadDocument(docName) {
    try {
        console.log('⬇️ Baixando documento:', docName);
        
        // TODO: Integrar com API para obter URL de download
        // const response = await fetch(`/api/documentos/${docName}/download`);
        // const blob = await response.blob();
        
        // TODO: Iniciar download
        alert(`Baixando: ${docName}`);
        
    } catch (error) {
        console.error('❌ Erro ao baixar documento:', error);
        showError('Erro ao baixar documento');
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
 * Compartilha o perfil do usuário
 */
async function sharePerfil() {
    console.log('📤 Compartilhando perfil');
    
    const shareData = {
        title: `Perfil: ${perfilState.nome}`,
        text: `Confira meu perfil no Sistema de Escoteiros! Sou ${perfilState.nome}, ${perfilState.progressoTrilha} da matilha ${perfilState.matilha}.`,
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
 * Calcula percentual de progresso
 * @returns {number} Percentual (0-100)
 */
function calculateProgressPercentage() {
    return perfilState.progresso;
}

/**
 * Conta especialidades por status
 * @returns {object} Contagem por status
 */
function countEspecialidadesByStatus() {
    const counts = {
        concluida: 0,
        em_progresso: 0,
        nao_iniciada: 0
    };
    
    perfilState.especialidadesData.forEach(esp => {
        counts[esp.status] = (counts[esp.status] || 0) + 1;
    });
    
    return counts;
}

/**
 * Formata data para exibição
 * @param {string} date - Data em formato DD/MM/YYYY
 * @returns {string} Data formatada
 */
function formatDate(date) {
    if (!date) return 'Não concluída';
    
    const [day, month, year] = date.split('/');
    const dateObj = new Date(year, month - 1, day);
    
    return dateObj.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
}

console.log('✅ Script de Meu Perfil carregado com sucesso!');
