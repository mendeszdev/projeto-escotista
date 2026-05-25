/* ============================================================================
   MAIN.JS - LÓGICA CENTRALIZADA DO SISTEMA
   Integrado com api-escotista (Java/Tomcat)
   ============================================================================ */

/* ============================================================================
   1. CONFIGURAÇÃO GLOBAL E ESTADO DA APLICAÇÃO
   ============================================================================ */

const APP_STATE = {
  isAuthenticated: false,
  user: null,
  token: null,
  currentPage: null,
  userRole: null, // 'lobinho', 'escotista', 'dirigente'
  cache: {
    activities: [],
    users: [],
    teams: [],
    specialties: []
  }
};

/**
 * ─────────────────────────────────────────────────────────────
 * BASE_URL: Endereço do backend Java (Tomcat).
 *
 * Desenvolvimento local → 'http://localhost:8080'
 * Produção             → 'https://seudominio.com.br'  (ajuste aqui)
 * ─────────────────────────────────────────────────────────────
 */
const API_CONFIG = {
  BASE_URL: 'http://localhost:8080',

  ENDPOINTS: {
    AUTH: {
      LOGIN:  '/api/auth/login',   // POST  → LoginServlet
      LOGOUT: null                 // Sem endpoint de logout no backend atual (limpa só o localStorage)
    },
    ASSOCIADOS: {
      LIST:   '/api/associados',           // GET
      BY_ID:  '/api/associados/:id',       // GET
      CREATE: '/api/associados',           // POST
      UPDATE: '/api/associados/:id',       // PUT
      DELETE: '/api/associados/:id',       // DELETE
      BY_PERFIL: '/api/associados?perfil=', // GET ?perfil=lobinho
      BY_GRUPO:  '/api/associados?grupo='   // GET ?grupo=<uuid>
    },
    ATIVIDADES: {
      LIST:   '/api/atividades',           // GET
      CREATE: '/api/atividades',           // POST
      UPDATE: '/api/atividades/:id',       // PUT
      DELETE: '/api/atividades/:id'        // DELETE
    },
    ALCATEIAS: {
      LIST:   '/api/alcateias',
      BY_ID:  '/api/alcateias/:id'
    },
    MATILHAS: {
      LIST:   '/api/matilhas',
      BY_ID:  '/api/matilhas/:id'
    },
    PROGRESSOES: {
      LIST:   '/api/progressoes',
      BY_ID:  '/api/progressoes/:id'
    },
    DISTINTIVOS: {
      LIST:   '/api/distintivos',
      BY_ID:  '/api/distintivos/:id'
    },
    DOCUMENTOS: {
      LIST:   '/api/documentos',
      BY_ID:  '/api/documentos/:id'
    },
    FICHAS_MEDICAS: {
      LIST:   '/api/fichas-medicas',
      BY_ID:  '/api/fichas-medicas/:id'
    },
    RESPONSAVEIS: {
      LIST:   '/api/responsaveis',
      BY_ID:  '/api/responsaveis/:id'
    },
    ACOES_EDUCATIVAS: {
      LIST:   '/api/acoes-educativas',
      BY_ID:  '/api/acoes-educativas/:id'
    },
    GRUPOS: {
      LIST:   '/api/grupos-escoteiros',
      BY_ID:  '/api/grupos-escoteiros/:id'
    }
  },

  TIMEOUT: 10000
};

/* ============================================================================
   2. FUNÇÕES DE AUTENTICAÇÃO
   ============================================================================ */

/**
 * Fazer login do usuário via POST /api/auth/login
 * @param {string} matricula - Matrícula no formato 123.456-7
 * @param {string} senha     - Senha do associado
 * @returns {Promise<Object>} Dados do usuário autenticado
 */
async function login(matricula, senha) {
  if (!matricula || !senha) throw new Error('Matrícula e senha são obrigatórios');

  const response = await fetchAPI('POST', API_CONFIG.ENDPOINTS.AUTH.LOGIN, { matricula, senha });

  if (!response.success) throw new Error(response.message || 'Credenciais inválidas');

  APP_STATE.isAuthenticated = true;
  APP_STATE.user    = response.user;
  APP_STATE.token   = response.token;
  APP_STATE.userRole = response.user.role;

  localStorage.setItem('auth_token', response.token);
  localStorage.setItem('user_data',  JSON.stringify(response.user));

  return response;
}

async function logout() {
  APP_STATE.isAuthenticated = false;
  APP_STATE.user  = null;
  APP_STATE.token = null;
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_data');
}

function isUserAuthenticated() {
  const token    = localStorage.getItem('auth_token');
  const userData = localStorage.getItem('user_data');
  return !!(token && userData);
}

function restoreSession() {
  try {
    const token    = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    if (token && userData) {
      APP_STATE.token           = token;
      APP_STATE.user            = JSON.parse(userData);
      APP_STATE.isAuthenticated = true;
      APP_STATE.userRole        = APP_STATE.user.role;
    }
  } catch (e) {
    console.error('[AUTH] Erro ao restaurar sessão:', e);
  }
}

/* ============================================================================
   3. FUNÇÕES DE ASSOCIADOS (substitui "USERS")
   ============================================================================ */

async function getAssociado(id) {
  return fetchAPI('GET', API_CONFIG.ENDPOINTS.ASSOCIADOS.BY_ID.replace(':id', id));
}

async function listarAssociados(filtros = {}) {
  let endpoint = API_CONFIG.ENDPOINTS.ASSOCIADOS.LIST;
  if (filtros.perfil) endpoint = API_CONFIG.ENDPOINTS.ASSOCIADOS.BY_PERFIL + filtros.perfil;
  if (filtros.grupo)  endpoint = API_CONFIG.ENDPOINTS.ASSOCIADOS.BY_GRUPO  + filtros.grupo;
  const lista = await fetchAPI('GET', endpoint);
  APP_STATE.cache.users = lista;
  return lista;
}

async function criarAssociado(dados) {
  return fetchAPI('POST', API_CONFIG.ENDPOINTS.ASSOCIADOS.CREATE, dados);
}

async function atualizarAssociado(id, dados) {
  return fetchAPI('PUT', API_CONFIG.ENDPOINTS.ASSOCIADOS.UPDATE.replace(':id', id), dados);
}

async function deletarAssociado(id) {
  return fetchAPI('DELETE', API_CONFIG.ENDPOINTS.ASSOCIADOS.DELETE.replace(':id', id));
}

/* ============================================================================
   4. FUNÇÕES DE ATIVIDADES
   ============================================================================ */

async function listActivities() {
  const lista = await fetchAPI('GET', API_CONFIG.ENDPOINTS.ATIVIDADES.LIST);
  APP_STATE.cache.activities = lista;
  return lista;
}

async function createActivity(data) {
  if (!data.titulo || !data.descricao) throw new Error('Título e descrição são obrigatórios');
  return fetchAPI('POST', API_CONFIG.ENDPOINTS.ATIVIDADES.CREATE, data);
}

async function updateActivity(id, data) {
  return fetchAPI('PUT', API_CONFIG.ENDPOINTS.ATIVIDADES.UPDATE.replace(':id', id), data);
}

async function deleteActivity(id) {
  return fetchAPI('DELETE', API_CONFIG.ENDPOINTS.ATIVIDADES.DELETE.replace(':id', id));
}

/* ============================================================================
   5. FUNÇÕES DE REQUISIÇÃO HTTP
   ============================================================================ */

/**
 * Faz uma requisição ao backend com tratamento de erro.
 * Inclui automaticamente o token de autenticação no header.
 */
async function fetchAPI(method, endpoint, data = null) {
  const url = API_CONFIG.BASE_URL + endpoint;

  const options = {
    method,
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${APP_STATE.token || localStorage.getItem('auth_token') || ''}`
    }
  };

  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }

  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
  options.signal   = controller.signal;

  try {
    const response = await fetch(url, options);
    clearTimeout(timeoutId);

    // Erros HTTP
    if (!response.ok) {
      let msg = `Erro ${response.status}`;
      try {
        const err = await response.json();
        msg = err.erro || err.message || msg;
      } catch {}
      throw new Error(msg);
    }

    // Resposta vazia (ex: DELETE)
    const text = await response.text();
    if (!text) return null;

    return JSON.parse(text);

  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') throw new Error('Tempo limite de conexão excedido');
    throw error;
  }
}

/* ============================================================================
   6. FUNÇÕES DE NAVEGAÇÃO
   ============================================================================ */

function navigateTo(path) {
  window.location.href = path;
}

function navigateToDashboard() {
  const role = APP_STATE.userRole || (JSON.parse(localStorage.getItem('user_data') || '{}')).role;
  switch (role) {
    case 'lobinho':   navigateTo('/lobinho/dashboard/');   break;
    case 'escotista': navigateTo('/escotista/dashboard/'); break;
    case 'dirigente': navigateTo('/dirigente/dashboard/'); break;
    default:          navigateTo('/login/');
  }
}

/* ============================================================================
   7. FUNÇÕES DE DOM (helpers)
   ============================================================================ */

const getElement  = s => document.querySelector(s);
const getElements = s => document.querySelectorAll(s);
const addClass    = (el, c)  => el?.classList.add(c);
const removeClass = (el, c)  => el?.classList.remove(c);
const showElement = el => removeClass(el, 'hidden');
const hideElement = el => addClass(el, 'hidden');
const setContent  = (el, h)  => { if (el) el.innerHTML = h; };
const getInputValue = s => document.querySelector(s)?.value ?? '';
const setInputValue = (s, v) => { const el = document.querySelector(s); if (el) el.value = v; };

/* ============================================================================
   8. VALIDAÇÕES
   ============================================================================ */

const validateEmail    = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const validatePassword = p => p && p.length >= 6;
const validateRequired = v => !!(v && v.trim());

// Matrícula no formato 123.456-7
const validateMatricula = m => /^\d{3}\.\d{3}-\d{1}$/.test(m);

/* ============================================================================
   9. NOTIFICAÇÕES (console + TODO visual)
   ============================================================================ */

function showSuccess(message) { console.log('[✅ SUCCESS]', message); }
function showError(message)   { console.error('[❌ ERROR]', message);  }
function showWarning(message) { console.warn('[⚠️ WARNING]', message); }

/* ============================================================================
   10. INICIALIZAÇÃO
   ============================================================================ */

function initializeApp() {
  restoreSession();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

// Exportações globais
window.APP = {
  STATE: APP_STATE,
  API_CONFIG,
  login,
  logout,
  isUserAuthenticated,
  navigateToDashboard,
  navigateTo,
  getAssociado,
  listarAssociados,
  criarAssociado,
  atualizarAssociado,
  deletarAssociado,
  listActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  fetchAPI,
  getElement, getElements, addClass, removeClass,
  showElement, hideElement, setContent,
  getInputValue, setInputValue,
  validateEmail, validatePassword, validateRequired, validateMatricula,
  showSuccess, showError, showWarning
};
