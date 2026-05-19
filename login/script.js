/* ============================================
   LOGIN - SCRIPT.JS
   Lógica de autenticação e validação
   Pronto para integração com API backend
   ============================================ */

/**
 * Objeto para armazenar dados de autenticação
 * @type {Object}
 */
const authState = {
    isLoading: false,
    error: null,
    token: localStorage.getItem('auth_token') || null,
};

/**
 * Inicializa os event listeners da tela de login
 * Executado quando o DOM está pronto
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔐 Tela de Login inicializada');
    
    // Obter referências dos elementos
    const loginForm = document.getElementById('loginForm');
    const matriculaInput = document.getElementById('matricula');
    const senhaInput = document.getElementById('senha');
    
    // Adicionar listeners de eventos
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }
    
    // Adicionar listeners para validação em tempo real
    if (matriculaInput) {
        matriculaInput.addEventListener('blur', validateMatricula);
        matriculaInput.addEventListener('input', formatMatricula);
    }
    
    if (senhaInput) {
        senhaInput.addEventListener('blur', validateSenha);
    }
    
    // Adicionar listeners para links
    const forgotPasswordLink = document.querySelector('.forgot-password-link');
    const signupLink = document.querySelector('.signup-link');
    
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', handleForgotPassword);
    }
    
    if (signupLink) {
        signupLink.addEventListener('click', handleSignup);
    }
    
    // Restaurar sessão se existir token
    if (authState.token) {
        console.log('✅ Token encontrado, restaurando sessão...');
        restoreSession();
    }
});

/**
 * Manipula o envio do formulário de login
 * @param {Event} event - Evento do formulário
 */
async function handleLoginSubmit(event) {
    event.preventDefault();
    console.log('📝 Formulário de login enviado');
    
    // Obter valores dos inputs
    const matricula = document.getElementById('matricula').value.trim();
    const senha = document.getElementById('senha').value.trim();
    
    // Validar campos
    if (!validateMatricula() || !validateSenha()) {
        console.warn('⚠️ Validação falhou');
        showError('Por favor, preencha todos os campos corretamente');
        return;
    }
    
    // Iniciar carregamento
    setLoadingState(true);
    
    try {
        // Chamar função de autenticação
        const response = await authenticateUser(matricula, senha);
        
        if (response.success) {
            console.log('✅ Autenticação bem-sucedida');
            
            // Armazenar token
            authState.token = response.token;
            localStorage.setItem('auth_token', response.token);
            localStorage.setItem('user_data', JSON.stringify(response.user));
            
            // Mostrar mensagem de sucesso
            showSuccess('Login realizado com sucesso!');
            
            // Redirecionar após 1 segundo
            setTimeout(() => {
                redirectToDashboard(response.user.role);
            }, 1000);
        } else {
            console.error('❌ Erro na autenticação:', response.message);
            showError(response.message || 'Matrícula ou senha incorretos');
        }
    } catch (error) {
        console.error('❌ Erro na requisição:', error);
        showError('Erro ao conectar com o servidor. Tente novamente.');
    } finally {
        setLoadingState(false);
    }
}

/**
 * Autentica o usuário com a API backend
 * @param {string} matricula - Número de matrícula
 * @param {string} senha - Senha do usuário
 * @returns {Promise<Object>} Resposta da autenticação
 */
async function authenticateUser(matricula, senha) {
    console.log('🔄 Enviando credenciais para autenticação...');
    
    // TODO: Substituir URL com endpoint real da API
    const API_URL = 'https://api.escoteiros.com/auth/login';
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                matricula: matricula,
                senha: senha,
            }),
        });
        
        // Verificar se a resposta é válida
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
        
    } catch (error) {
        console.error('Erro na requisição de autenticação:', error);
        
        // MOCK: Retornar dados fictícios para desenvolvimento
        console.log('⚠️ Usando dados MOCK para desenvolvimento');
        return mockAuthenticate(matricula, senha);
    }
}

/**
 * MOCK de autenticação para desenvolvimento
 * Remove quando integrar com API real
 * @param {string} matricula - Número de matrícula
 * @param {string} senha - Senha do usuário
 * @returns {Object} Dados fictícios de autenticação
 */
function mockAuthenticate(matricula, senha) {
    // Aceitar qualquer matrícula e senha para teste
    if (matricula && senha) {
        return {
            success: true,
            token: 'mock_token_' + Date.now(),
            user: {
                id: '123',
                name: 'Usuário Teste',
                matricula: matricula,
                role: 'lobinho', // Pode ser: 'lobinho', 'escotista', 'dirigente'
                email: 'usuario@escoteiros.com',
            },
        };
    }
    
    return {
        success: false,
        message: 'Credenciais inválidas',
    };
}

/**
 * Restaura a sessão do usuário a partir do token armazenado
 * Verifica se o token ainda é válido
 */
async function restoreSession() {
    console.log('🔄 Restaurando sessão...');
    
    // TODO: Implementar validação de token com API
    // Por enquanto, apenas verificar se o token existe
    
    if (authState.token) {
        console.log('✅ Sessão restaurada');
        // Redirecionar para dashboard
        const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
        redirectToDashboard(userData.role || 'lobinho');
    }
}

/**
 * Valida o formato do número de matrícula
 * Formato esperado: XXX.XXX-X
 * @returns {boolean} True se válido
 */
function validateMatricula() {
    const matriculaInput = document.getElementById('matricula');
    const matricula = matriculaInput.value.trim();
    
    // Regex para validar formato XXX.XXX-X
    const regex = /^\d{3}\.\d{3}-\d{1}$/;
    
    if (!regex.test(matricula)) {
        console.warn('⚠️ Matrícula inválida');
        matriculaInput.classList.add('error');
        return false;
    }
    
    matriculaInput.classList.remove('error');
    return true;
}

/**
 * Valida o campo de senha
 * Mínimo 6 caracteres
 * @returns {boolean} True se válido
 */
function validateSenha() {
    const senhaInput = document.getElementById('senha');
    const senha = senhaInput.value.trim();
    
    if (senha.length < 6) {
        console.warn('⚠️ Senha muito curta');
        senhaInput.classList.add('error');
        return false;
    }
    
    senhaInput.classList.remove('error');
    return true;
}

/**
 * Formata o número de matrícula enquanto o usuário digita
 * Formato: XXX.XXX-X
 */
function formatMatricula() {
    const input = document.getElementById('matricula');
    let value = input.value.replace(/\D/g, ''); // Remove não-dígitos
    
    if (value.length > 7) {
        value = value.slice(0, 7);
    }
    
    // Aplicar formatação
    if (value.length <= 3) {
        input.value = value;
    } else if (value.length <= 6) {
        input.value = value.slice(0, 3) + '.' + value.slice(3);
    } else {
        input.value = value.slice(0, 3) + '.' + value.slice(3, 6) + '-' + value.slice(6);
    }
}

/**
 * Manipula o clique no link "Esqueci minha senha"
 * @param {Event} event - Evento do clique
 */
function handleForgotPassword(event) {
    event.preventDefault();
    console.log('🔑 Usuário clicou em "Esqueci minha senha"');
    
    // TODO: Implementar modal ou página de recuperação de senha
    alert('Funcionalidade de recuperação de senha em desenvolvimento');
    
    // Exemplo de redirecionamento:
    // window.location.href = '/recuperar-senha';
}

/**
 * Manipula o clique no link "Cadastre-se"
 * @param {Event} event - Evento do clique
 */
function handleSignup(event) {
    event.preventDefault();
    console.log('📝 Usuário clicou em "Cadastre-se"');
    
    // TODO: Implementar modal ou página de cadastro
    alert('Funcionalidade de cadastro em desenvolvimento');
    
    // Exemplo de redirecionamento:
    // window.location.href = '/cadastro';
}

/**
 * Define o estado de carregamento do formulário
 * @param {boolean} isLoading - True se está carregando
 */
function setLoadingState(isLoading) {
    const button = document.querySelector('.action-button');
    const form = document.getElementById('loginForm');
    
    authState.isLoading = isLoading;
    
    if (isLoading) {
        button.disabled = true;
        button.textContent = 'Carregando...';
        form.style.opacity = '0.6';
        form.style.pointerEvents = 'none';
    } else {
        button.disabled = false;
        button.innerHTML = '<span class="button-text">Entrar</span><img src="assets/3-62.svg" alt="Seta" class="button-icon">';
        form.style.opacity = '1';
        form.style.pointerEvents = 'auto';
    }
}

/**
 * Exibe mensagem de erro
 * @param {string} message - Mensagem de erro
 */
function showError(message) {
    console.error('❌ Erro:', message);
    
    // TODO: Implementar toast/notificação visual
    // Por enquanto, usar alert
    alert('❌ ' + message);
    
    // Exemplo com notificação customizada:
    // createNotification('error', message);
}

/**
 * Exibe mensagem de sucesso
 * @param {string} message - Mensagem de sucesso
 */
function showSuccess(message) {
    console.log('✅ Sucesso:', message);
    
    // TODO: Implementar toast/notificação visual
    // Por enquanto, usar alert
    alert('✅ ' + message);
    
    // Exemplo com notificação customizada:
    // createNotification('success', message);
}

/**
 * Redireciona para o dashboard apropriado baseado no role do usuário
 * @param {string} role - Role do usuário (lobinho, escotista, dirigente)
 */
function redirectToDashboard(role) {
    console.log('🔄 Redirecionando para dashboard:', role);
    
    const dashboardPaths = {
        'lobinho': '/lobinho/dashboard/',
        'escotista': '/escotista/dashboard/',
        'dirigente': '/dirigente/dashboard/',
    };
    
    const path = dashboardPaths[role] || '/lobinho/dashboard/';
    window.location.href = path;
}

/**
 * Faz logout do usuário
 * Remove token e dados do localStorage
 */
function logout() {
    console.log('🚪 Fazendo logout...');
    
    // Limpar dados de autenticação
    authState.token = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    
    // Redirecionar para login
    window.location.href = '/login/';
}

/**
 * Obtém os dados do usuário armazenado
 * @returns {Object} Dados do usuário
 */
function getUserData() {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
}

/**
 * Verifica se o usuário está autenticado
 * @returns {boolean} True se autenticado
 */
function isAuthenticated() {
    return !!authState.token;
}

// Exportar funções para uso global
window.authModule = {
    logout,
    getUserData,
    isAuthenticated,
    authenticateUser,
};
