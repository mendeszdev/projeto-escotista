/* ============================================================================
   MAIN.JS - LÓGICA CENTRALIZADA DO SISTEMA
   Integrado com api-escotista (Java/Tomcat) — JWT stateless
   ============================================================================ */

/* ============================================================================
   1. CONFIGURAÇÃO GLOBAL E ESTADO DA APLICAÇÃO
   ============================================================================ */

const APP_STATE = {
  isAuthenticated: false,
  user:         null,
  accessToken:  null,
  refreshToken: null,
  currentPage:  null,
  userRole:     null, // 'lobinho' | 'escotista' | 'dirigente'
  cache: {
    activities:  [],
    users:       [],
    teams:       [],
    specialties: []
  }
};

const API_CONFIG = {
  BASE_URL: 'http://localhost:8080',

  ENDPOINTS: {
    AUTH: {
      LOGIN:   '/escoteiros-api/api/auth/login',   // POST
      REFRESH: '/escoteiros-api/api/auth/refresh', // POST
    },
    ASSOCIADOS: {
      LIST:      '/escoteiros-api/api/associados',
      BY_ID:     '/escoteiros-api/api/associados/:id',
      CREATE:    '/escoteiros-api/api/associados',
      UPDATE:    '/escoteiros-api/api/associados/:id',
      DELETE:    '/escoteiros-api/api/associados/:id',
      BY_PERFIL: '/escoteiros-api/api/associados?perfil=',
      BY_GRUPO:  '/escoteiros-api/api/associados?grupo='
    },
    ATIVIDADES: {
      LIST:   '/escoteiros-api/api/atividades',
      CREATE: '/escoteiros-api/api/atividades',
      UPDATE: '/escoteiros-api/api/atividades/:id',
      DELETE: '/escoteiros-api/api/atividades/:id'
    },
    ALCATEIAS: {
      LIST:  '/escoteiros-api/api/alcateias',
      BY_ID: '/escoteiros-api/api/alcateias/:id'
    },
    MATILHAS: {
      LIST:  '/escoteiros-api/api/matilhas',
      BY_ID: '/escoteiros-api/api/matilhas/:id'
    },
    PROGRESSOES: {
      LIST:  '/escoteiros-api/api/progressoes',
      BY_ID: '/escoteiros-api/api/progressoes/:id'
    },
    DISTINTIVOS: {
      LIST:  '/escoteiros-api/api/distintivos',
      BY_ID: '/escoteiros-api/api/distintivos/:id'
    },
    DOCUMENTOS: {
      LIST:  '/escoteiros-api/api/documentos',
      BY_ID: '/escoteiros-api/api/documentos/:id'
    },
    FICHAS_MEDICAS: {
      LIST:  '/escoteiros-api/api/fichas-medicas',
      BY_ID: '/escoteiros-api/api/fichas-medicas/:id'
    },
    RESPONSAVEIS: {
      LIST:  '/escoteiros-api/api/responsaveis',
      BY_ID: '/escoteiros-api/api/responsaveis/:id'
    },
    ACOES_EDUCATIVAS: {
      LIST:  '/escoteiros-api/api/acoes-educativas',
      BY_ID: '/escoteiros-api/api/acoes-educativas/:id'
    },
    GRUPOS: {
      LIST:  '/escoteiros-api/api/grupos-escoteiros',
      BY_ID: '/escoteiros-api/api/grupos-escoteiros/:id'
    }
  },

  TIMEOUT: 10000
};

/* ============================================================================
   2. AUTENTICAÇÃO
   ============================================================================ */

async function login(matricula, senha) {
  if (!matricula || !senha) throw new Error('Matrícula e senha são obrigatórios');

  const response = await fetchAPI('POST', API_CONFIG.ENDPOINTS.AUTH.LOGIN, { matricula, senha });

  if (!response.success) throw new Error(response.message || 'Credenciais inválidas');

  _saveSession(response);
  return response;
}

function logout() {
  APP_STATE.isAuthenticated = false;
  APP_STATE.user        = null;
  APP_STATE.accessToken = null;
  APP_STATE.refreshToken = null;
  APP_STATE.userRole    = null;

  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  localStorage.removeItem('token'); // limpa chave legada

  window.location.replace('/login/');
}

function isUserAuthenticated() {
  return !!localStorage.getItem('accessToken') && !!localStorage.getItem('user');
}

function restoreSession() {
  try {
    const accessToken  = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const userData     = localStorage.getItem('user');

    if (accessToken && userData) {
      APP_STATE.accessToken     = accessToken;
      APP_STATE.refreshToken    = refreshToken || null;
      APP_STATE.user            = JSON.parse(userData);
      APP_STATE.isAuthenticated = true;
      APP_STATE.userRole        = APP_STATE.user.role;
    }
  } catch (e) {
    console.error('[AUTH] Erro ao restaurar sessão:', e);
  }
}

function _saveSession(data) {
  APP_STATE.isAuthenticated = true;
  APP_STATE.accessToken  = data.accessToken;
  APP_STATE.refreshToken = data.refreshToken;
  APP_STATE.user         = data.user;
  APP_STATE.userRole     = data.user.role;

  localStorage.setItem('accessToken',  data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  localStorage.setItem('user', JSON.stringify(data.user));
  localStorage.removeItem('token'); // remove chave legada
}

/* ============================================================================
   3. REFRESH TOKEN
   ============================================================================ */

let _refreshPromise = null; // evita chamadas paralelas de refresh

async function refreshTokens() {
  // Se já há um refresh em andamento, aguarda o mesmo
  if (_refreshPromise) return _refreshPromise;

  _refreshPromise = (async () => {
    const refreshToken = APP_STATE.refreshToken || localStorage.getItem('refreshToken');
    if (!refreshToken) { logout(); return false; }

    try {
      const res = await fetch(
        API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.AUTH.REFRESH,
        {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ refreshToken }),
        }
      );

      if (!res.ok) { logout(); return false; }

      const data = await res.json();
      APP_STATE.accessToken  = data.accessToken;
      APP_STATE.refreshToken = data.refreshToken;
      localStorage.setItem('accessToken',  data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      return true;

    } catch {
      logout();
      return false;
    }
  })();

  try {
    return await _refreshPromise;
  } finally {
    _refreshPromise = null;
  }
}

/* ============================================================================
   4. FUNÇÕES DE ASSOCIADOS
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
   5. FUNÇÕES DE ATIVIDADES
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
   6. INTERCEPTOR DE REQUISIÇÕES HTTP (com auto-refresh)
   ============================================================================ */

/**
 * Ponto único de chamada à API.
 * - Injeta Authorization: Bearer <accessToken>
 * - Em 401: tenta refresh → repete a chamada uma vez
 * - Em 401 após refresh: chama logout()
 *
 * @param {string}  method   - GET | POST | PUT | DELETE
 * @param {string}  endpoint - Path relativo (sem base URL)
 * @param {Object}  [data]   - Body (POST/PUT)
 * @param {boolean} [_retry] - Interno: impede loop infinito de refresh
 */
async function fetchAPI(method, endpoint, data = null, _retry = false) {
  const url         = API_CONFIG.BASE_URL + endpoint;
  const accessToken = APP_STATE.accessToken || localStorage.getItem('accessToken') || '';

  const options = {
    method,
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${accessToken}`,
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

    // Auto-refresh em 401 (uma tentativa)
    if (response.status === 401 && !_retry) {
      const refreshed = await refreshTokens();
      if (refreshed) return fetchAPI(method, endpoint, data, true);
      return null; // logout() já foi chamado dentro de refreshTokens()
    }

    if (!response.ok) {
      let msg = `Erro ${response.status}`;
      try {
        const err = await response.json();
        msg = err.erro || err.message || msg;
      } catch {}
      throw new Error(msg);
    }

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
   7. GUARD DE ROTA
   ============================================================================ */

/**
 * Protege páginas de dashboard.
 * Chame no topo de cada script de página (fora do DOMContentLoaded).
 *
 * @param {string} allowedRole - 'lobinho' | 'escotista' | 'dirigente'
 */
function requireAuth(allowedRole) {
  const accessToken = localStorage.getItem('accessToken');
  const rawUser     = localStorage.getItem('user');

  if (!accessToken || !rawUser) {
    window.location.replace('/login/');
    return;
  }

  let user;
  try { user = JSON.parse(rawUser); } catch { user = null; }

  if (!user || !user.role) {
    logout();
    return;
  }

  // Role errado → redireciona para o dashboard correto do usuário
  if (allowedRole && user.role !== allowedRole) {
    const redirects = {
      lobinho:   '/lobinho/dashboard/',
      escotista: '/escotista/dashboard/',
      dirigente: '/dirigente/dashboard/',
    };
    window.location.replace(redirects[user.role] || '/login/');
  }
}

/* ============================================================================
   8. NAVEGAÇÃO
   ============================================================================ */

function navigateTo(path) {
  window.location.href = path;
}

function navigateToDashboard() {
  const role = APP_STATE.userRole || (JSON.parse(localStorage.getItem('user') || '{}')).role;
  switch (role) {
    case 'lobinho':   navigateTo('/lobinho/dashboard/');   break;
    case 'escotista': navigateTo('/escotista/dashboard/'); break;
    case 'dirigente': navigateTo('/dirigente/dashboard/'); break;
    default:          navigateTo('/login/');
  }
}

/* ============================================================================
   9. HELPERS DE DOM
   ============================================================================ */

const getElement    = s      => document.querySelector(s);
const getElements   = s      => document.querySelectorAll(s);
const addClass      = (el, c) => el?.classList.add(c);
const removeClass   = (el, c) => el?.classList.remove(c);
const showElement   = el     => removeClass(el, 'hidden');
const hideElement   = el     => addClass(el, 'hidden');
const setContent    = (el, h) => { if (el) el.innerHTML = h; };
const getInputValue = s      => document.querySelector(s)?.value ?? '';
const setInputValue = (s, v) => { const el = document.querySelector(s); if (el) el.value = v; };

/* ============================================================================
   10. VALIDAÇÕES
   ============================================================================ */

const validateEmail    = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const validatePassword = p => p && p.length >= 6;
const validateRequired = v => !!(v && v.trim());
const validateMatricula = m => /^[A-Za-z]{2}\.\d{4}-\d{3}$/.test(m); // ex: LB.2024-001

/* ============================================================================
   11. NOTIFICAÇÕES
   ============================================================================ */

function showSuccess(message) { console.log('[✅ SUCCESS]', message); }
function showError(message)   { console.error('[❌ ERROR]', message);  }
function showWarning(message) { console.warn('[⚠️ WARNING]', message); }

/* ============================================================================
   12. INICIALIZAÇÃO
   ============================================================================ */

function initializeApp() {
  restoreSession();

  // DOM is already parsed when scripts run at end of <body>; no DOMContentLoaded needed
  document.querySelectorAll('[data-action="logout"]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  });

  // Auto-highlight active sidebar item based on current URL
  const pathname = window.location.pathname;
  document.querySelectorAll('.sidebar-nav a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href === '#') return;
    try {
      const linkPath = new URL(href, window.location.href).pathname;
      link.classList.toggle('active', pathname === linkPath);
    } catch {}
  });
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
  refreshTokens,
  requireAuth,
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
