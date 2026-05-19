/* ============================================================================
   MAIN.JS - LÓGICA CENTRALIZADA DO SISTEMA
   Estrutura de funções comentadas, pronta para integração com API
   ============================================================================ */

/* ============================================================================
   1. CONFIGURAÇÃO GLOBAL E ESTADO DA APLICAÇÃO
   ============================================================================ */

/**
 * Estado global da aplicação
 * Armazena dados do usuário, autenticação e configurações
 */
const APP_STATE = {
  // Autenticação
  isAuthenticated: false,
  user: null,
  token: null,
  
  // Dados da sessão
  currentPage: null,
  userRole: null, // 'lobinho', 'escotista', 'dirigente'
  
  // Cache de dados
  cache: {
    activities: [],
    users: [],
    teams: [],
    specialties: []
  }
};

/**
 * Configurações de API
 * URLs e endpoints para comunicação com backend
 */
const API_CONFIG = {
  BASE_URL: 'https://api.escoteiros.com/v1',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh'
    },
    USERS: {
      PROFILE: '/users/profile',
      UPDATE: '/users/profile',
      LIST: '/users'
    },
    ACTIVITIES: {
      LIST: '/activities',
      CREATE: '/activities',
      UPDATE: '/activities/:id',
      DELETE: '/activities/:id'
    },
    SPECIALTIES: {
      LIST: '/specialties',
      COMPLETE: '/specialties/:id/complete'
    }
  },
  TIMEOUT: 5000
};

/* ============================================================================
   2. FUNÇÕES DE AUTENTICAÇÃO
   ============================================================================ */

/**
 * Fazer login do usuário
 * @param {string} email - Email do usuário
 * @param {string} password - Senha do usuário
 * @returns {Promise<Object>} Dados do usuário autenticado
 */
async function login(email, password) {
  try {
    console.log('[AUTH] Iniciando login para:', email);
    
    // Validação básica
    if (!email || !password) {
      throw new Error('Email e senha são obrigatórios');
    }
    
    // Chamada à API
    const response = await fetchAPI('POST', API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
      email,
      password
    });
    
    // Armazenar dados de autenticação
    APP_STATE.isAuthenticated = true;
    APP_STATE.user = response.user;
    APP_STATE.token = response.token;
    APP_STATE.userRole = response.user.role;
    
    // Salvar token no localStorage
    localStorage.setItem('auth_token', response.token);
    localStorage.setItem('user_data', JSON.stringify(response.user));
    
    console.log('[AUTH] Login bem-sucedido para:', response.user.name);
    return response;
  } catch (error) {
    console.error('[AUTH] Erro ao fazer login:', error);
    throw error;
  }
}

/**
 * Fazer logout do usuário
 * @returns {Promise<void>}
 */
async function logout() {
  try {
    console.log('[AUTH] Iniciando logout');
    
    // Chamada à API
    await fetchAPI('POST', API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
    
    // Limpar estado
    APP_STATE.isAuthenticated = false;
    APP_STATE.user = null;
    APP_STATE.token = null;
    
    // Limpar localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    
    console.log('[AUTH] Logout bem-sucedido');
  } catch (error) {
    console.error('[AUTH] Erro ao fazer logout:', error);
    throw error;
  }
}

/**
 * Verificar se usuário está autenticado
 * @returns {boolean} True se autenticado
 */
function isUserAuthenticated() {
  const token = localStorage.getItem('auth_token');
  const userData = localStorage.getItem('user_data');
  
  return !!(token && userData && APP_STATE.isAuthenticated);
}

/**
 * Restaurar sessão do localStorage
 * @returns {void}
 */
function restoreSession() {
  try {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      APP_STATE.token = token;
      APP_STATE.user = JSON.parse(userData);
      APP_STATE.isAuthenticated = true;
      APP_STATE.userRole = APP_STATE.user.role;
      
      console.log('[AUTH] Sessão restaurada para:', APP_STATE.user.name);
    }
  } catch (error) {
    console.error('[AUTH] Erro ao restaurar sessão:', error);
  }
}

/* ============================================================================
   3. FUNÇÕES DE USUÁRIO
   ============================================================================ */

/**
 * Obter perfil do usuário
 * @returns {Promise<Object>} Dados do perfil
 */
async function getUserProfile() {
  try {
    console.log('[USER] Buscando perfil do usuário');
    
    const response = await fetchAPI('GET', API_CONFIG.ENDPOINTS.USERS.PROFILE);
    
    APP_STATE.user = response;
    return response;
  } catch (error) {
    console.error('[USER] Erro ao buscar perfil:', error);
    throw error;
  }
}

/**
 * Atualizar perfil do usuário
 * @param {Object} data - Dados a atualizar
 * @returns {Promise<Object>} Dados atualizados
 */
async function updateUserProfile(data) {
  try {
    console.log('[USER] Atualizando perfil do usuário');
    
    const response = await fetchAPI('PUT', API_CONFIG.ENDPOINTS.USERS.UPDATE, data);
    
    APP_STATE.user = response;
    localStorage.setItem('user_data', JSON.stringify(response));
    
    console.log('[USER] Perfil atualizado com sucesso');
    return response;
  } catch (error) {
    console.error('[USER] Erro ao atualizar perfil:', error);
    throw error;
  }
}

/**
 * Listar usuários (para admin/dirigente)
 * @param {Object} filters - Filtros de busca
 * @returns {Promise<Array>} Lista de usuários
 */
async function listUsers(filters = {}) {
  try {
    console.log('[USER] Buscando lista de usuários');
    
    const response = await fetchAPI('GET', API_CONFIG.ENDPOINTS.USERS.LIST, null, filters);
    
    APP_STATE.cache.users = response;
    return response;
  } catch (error) {
    console.error('[USER] Erro ao listar usuários:', error);
    throw error;
  }
}

/* ============================================================================
   4. FUNÇÕES DE ATIVIDADES
   ============================================================================ */

/**
 * Listar atividades do usuário
 * @param {Object} filters - Filtros de busca
 * @returns {Promise<Array>} Lista de atividades
 */
async function listActivities(filters = {}) {
  try {
    console.log('[ACTIVITY] Buscando atividades');
    
    const response = await fetchAPI('GET', API_CONFIG.ENDPOINTS.ACTIVITIES.LIST, null, filters);
    
    APP_STATE.cache.activities = response;
    return response;
  } catch (error) {
    console.error('[ACTIVITY] Erro ao listar atividades:', error);
    throw error;
  }
}

/**
 * Criar nova atividade
 * @param {Object} data - Dados da atividade
 * @returns {Promise<Object>} Atividade criada
 */
async function createActivity(data) {
  try {
    console.log('[ACTIVITY] Criando nova atividade');
    
    // Validação básica
    if (!data.title || !data.description) {
      throw new Error('Título e descrição são obrigatórios');
    }
    
    const response = await fetchAPI('POST', API_CONFIG.ENDPOINTS.ACTIVITIES.CREATE, data);
    
    console.log('[ACTIVITY] Atividade criada com sucesso:', response.id);
    return response;
  } catch (error) {
    console.error('[ACTIVITY] Erro ao criar atividade:', error);
    throw error;
  }
}

/**
 * Atualizar atividade existente
 * @param {string} id - ID da atividade
 * @param {Object} data - Dados a atualizar
 * @returns {Promise<Object>} Atividade atualizada
 */
async function updateActivity(id, data) {
  try {
    console.log('[ACTIVITY] Atualizando atividade:', id);
    
    const endpoint = API_CONFIG.ENDPOINTS.ACTIVITIES.UPDATE.replace(':id', id);
    const response = await fetchAPI('PUT', endpoint, data);
    
    console.log('[ACTIVITY] Atividade atualizada com sucesso');
    return response;
  } catch (error) {
    console.error('[ACTIVITY] Erro ao atualizar atividade:', error);
    throw error;
  }
}

/**
 * Deletar atividade
 * @param {string} id - ID da atividade
 * @returns {Promise<void>}
 */
async function deleteActivity(id) {
  try {
    console.log('[ACTIVITY] Deletando atividade:', id);
    
    const endpoint = API_CONFIG.ENDPOINTS.ACTIVITIES.DELETE.replace(':id', id);
    await fetchAPI('DELETE', endpoint);
    
    console.log('[ACTIVITY] Atividade deletada com sucesso');
  } catch (error) {
    console.error('[ACTIVITY] Erro ao deletar atividade:', error);
    throw error;
  }
}

/* ============================================================================
   5. FUNÇÕES DE ESPECIALIDADES
   ============================================================================ */

/**
 * Listar especialidades disponíveis
 * @returns {Promise<Array>} Lista de especialidades
 */
async function listSpecialties() {
  try {
    console.log('[SPECIALTY] Buscando especialidades');
    
    const response = await fetchAPI('GET', API_CONFIG.ENDPOINTS.SPECIALTIES.LIST);
    
    APP_STATE.cache.specialties = response;
    return response;
  } catch (error) {
    console.error('[SPECIALTY] Erro ao listar especialidades:', error);
    throw error;
  }
}

/**
 * Marcar especialidade como completa
 * @param {string} id - ID da especialidade
 * @returns {Promise<Object>} Especialidade atualizada
 */
async function completeSpecialty(id) {
  try {
    console.log('[SPECIALTY] Marcando especialidade como completa:', id);
    
    const endpoint = API_CONFIG.ENDPOINTS.SPECIALTIES.COMPLETE.replace(':id', id);
    const response = await fetchAPI('POST', endpoint);
    
    console.log('[SPECIALTY] Especialidade marcada como completa');
    return response;
  } catch (error) {
    console.error('[SPECIALTY] Erro ao completar especialidade:', error);
    throw error;
  }
}

/* ============================================================================
   6. FUNÇÕES DE REQUISIÇÃO HTTP
   ============================================================================ */

/**
 * Fazer requisição à API com tratamento de erro
 * @param {string} method - Método HTTP (GET, POST, PUT, DELETE)
 * @param {string} endpoint - Endpoint da API
 * @param {Object} data - Dados a enviar (para POST/PUT)
 * @param {Object} params - Parâmetros de query (para GET)
 * @returns {Promise<Object>} Resposta da API
 */
async function fetchAPI(method, endpoint, data = null, params = {}) {
  try {
    const url = new URL(API_CONFIG.BASE_URL + endpoint);
    
    // Adicionar parâmetros de query
    Object.keys(params).forEach(key => {
      url.searchParams.append(key, params[key]);
    });
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${APP_STATE.token}`
      },
      timeout: API_CONFIG.TIMEOUT
    };
    
    // Adicionar corpo para POST/PUT
    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }
    
    console.log(`[API] ${method} ${endpoint}`);
    
    const response = await fetch(url.toString(), options);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log(`[API] Resposta recebida:`, result);
    
    return result;
  } catch (error) {
    console.error(`[API] Erro na requisição:`, error);
    throw error;
  }
}

/* ============================================================================
   7. FUNÇÕES DE MANIPULAÇÃO DO DOM
   ============================================================================ */

/**
 * Obter elemento do DOM
 * @param {string} selector - Seletor CSS
 * @returns {Element} Elemento encontrado
 */
function getElement(selector) {
  return document.querySelector(selector);
}

/**
 * Obter múltiplos elementos do DOM
 * @param {string} selector - Seletor CSS
 * @returns {NodeList} Lista de elementos
 */
function getElements(selector) {
  return document.querySelectorAll(selector);
}

/**
 * Adicionar classe a um elemento
 * @param {Element} element - Elemento
 * @param {string} className - Nome da classe
 * @returns {void}
 */
function addClass(element, className) {
  if (element) {
    element.classList.add(className);
  }
}

/**
 * Remover classe de um elemento
 * @param {Element} element - Elemento
 * @param {string} className - Nome da classe
 * @returns {void}
 */
function removeClass(element, className) {
  if (element) {
    element.classList.remove(className);
  }
}

/**
 * Alternar classe de um elemento
 * @param {Element} element - Elemento
 * @param {string} className - Nome da classe
 * @returns {void}
 */
function toggleClass(element, className) {
  if (element) {
    element.classList.toggle(className);
  }
}

/**
 * Mostrar elemento
 * @param {Element} element - Elemento
 * @returns {void}
 */
function showElement(element) {
  if (element) {
    removeClass(element, 'hidden');
  }
}

/**
 * Ocultar elemento
 * @param {Element} element - Elemento
 * @returns {void}
 */
function hideElement(element) {
  if (element) {
    addClass(element, 'hidden');
  }
}

/**
 * Definir conteúdo de um elemento
 * @param {Element} element - Elemento
 * @param {string} content - Conteúdo HTML
 * @returns {void}
 */
function setContent(element, content) {
  if (element) {
    element.innerHTML = content;
  }
}

/**
 * Obter valor de um input
 * @param {string} selector - Seletor do input
 * @returns {string} Valor do input
 */
function getInputValue(selector) {
  const element = getElement(selector);
  return element ? element.value : '';
}

/**
 * Definir valor de um input
 * @param {string} selector - Seletor do input
 * @param {string} value - Valor a definir
 * @returns {void}
 */
function setInputValue(selector, value) {
  const element = getElement(selector);
  if (element) {
    element.value = value;
  }
}

/* ============================================================================
   8. FUNÇÕES DE VALIDAÇÃO
   ============================================================================ */

/**
 * Validar email
 * @param {string} email - Email a validar
 * @returns {boolean} True se válido
 */
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Validar senha (mínimo 6 caracteres)
 * @param {string} password - Senha a validar
 * @returns {boolean} True se válido
 */
function validatePassword(password) {
  return password && password.length >= 6;
}

/**
 * Validar campo obrigatório
 * @param {string} value - Valor a validar
 * @returns {boolean} True se preenchido
 */
function validateRequired(value) {
  return !!(value && value.trim());
}

/* ============================================================================
   9. FUNÇÕES DE NOTIFICAÇÃO
   ============================================================================ */

/**
 * Mostrar notificação de sucesso
 * @param {string} message - Mensagem a exibir
 * @param {number} duration - Duração em ms (padrão: 3000)
 * @returns {void}
 */
function showSuccess(message, duration = 3000) {
  console.log('[SUCCESS]', message);
  // TODO: Implementar UI de notificação
  // showNotification(message, 'success', duration);
}

/**
 * Mostrar notificação de erro
 * @param {string} message - Mensagem a exibir
 * @param {number} duration - Duração em ms (padrão: 5000)
 * @returns {void}
 */
function showError(message, duration = 5000) {
  console.error('[ERROR]', message);
  // TODO: Implementar UI de notificação
  // showNotification(message, 'error', duration);
}

/**
 * Mostrar notificação de aviso
 * @param {string} message - Mensagem a exibir
 * @param {number} duration - Duração em ms (padrão: 4000)
 * @returns {void}
 */
function showWarning(message, duration = 4000) {
  console.warn('[WARNING]', message);
  // TODO: Implementar UI de notificação
  // showNotification(message, 'warning', duration);
}

/* ============================================================================
   10. FUNÇÕES DE NAVEGAÇÃO
   ============================================================================ */

/**
 * Navegar para página
 * @param {string} path - Caminho da página
 * @returns {void}
 */
function navigateTo(path) {
  console.log('[NAVIGATION] Navegando para:', path);
  window.location.href = path;
}

/**
 * Navegar para dashboard baseado no role do usuário
 * @returns {void}
 */
function navigateToDashboard() {
  const role = APP_STATE.userRole;
  
  switch (role) {
    case 'lobinho':
      navigateTo('/lobinho/dashboard/');
      break;
    case 'escotista':
      navigateTo('/escotista/dashboard/');
      break;
    case 'dirigente':
      navigateTo('/dirigente/dashboard/');
      break;
    default:
      navigateTo('/login/');
  }
}

/* ============================================================================
   11. INICIALIZAÇÃO DA APLICAÇÃO
   ============================================================================ */

/**
 * Inicializar aplicação ao carregar página
 * @returns {void}
 */
function initializeApp() {
  console.log('[APP] Inicializando aplicação');
  
  // Restaurar sessão
  restoreSession();
  
  // Verificar autenticação
  if (!isUserAuthenticated()) {
    console.log('[APP] Usuário não autenticado');
    // Redirecionar para login se necessário
    // navigateTo('/login/');
  } else {
    console.log('[APP] Usuário autenticado:', APP_STATE.user.name);
  }
  
  // Inicializar listeners de eventos
  initializeEventListeners();
}

/**
 * Inicializar listeners de eventos globais
 * @returns {void}
 */
function initializeEventListeners() {
  // TODO: Adicionar listeners de eventos globais
  // Exemplo:
  // document.addEventListener('click', handleGlobalClick);
  // window.addEventListener('beforeunload', handleWindowUnload);
}

/* ============================================================================
   12. EXECUTAR AO CARREGAR A PÁGINA
   ============================================================================ */

// Executar inicialização quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

// Exportar funções para uso global (se necessário)
window.APP = {
  STATE: APP_STATE,
  login,
  logout,
  isUserAuthenticated,
  getUserProfile,
  updateUserProfile,
  listActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  listSpecialties,
  completeSpecialty,
  getElement,
  getElements,
  addClass,
  removeClass,
  toggleClass,
  showElement,
  hideElement,
  setContent,
  getInputValue,
  setInputValue,
  validateEmail,
  validatePassword,
  validateRequired,
  showSuccess,
  showError,
  showWarning,
  navigateTo,
  navigateToDashboard
};
