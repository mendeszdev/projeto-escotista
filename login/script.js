/* ============================================
   LOGIN - SCRIPT.JS
   Integrado com POST /api/auth/login
   ============================================ */

const authState = {
  isLoading:    false,
  accessToken:  localStorage.getItem('accessToken')  || null,
  refreshToken: localStorage.getItem('refreshToken') || null,
};

document.addEventListener('DOMContentLoaded', () => {
  const loginForm     = document.getElementById('loginForm');
  const matriculaInput = document.getElementById('matricula');
  const senhaInput    = document.getElementById('senha');

  if (loginForm) loginForm.addEventListener('submit', handleLoginSubmit);
  if (matriculaInput) {
    matriculaInput.addEventListener('blur',  validateMatriculaField);
    matriculaInput.addEventListener('input', formatMatricula);
  }
  if (senhaInput) senhaInput.addEventListener('blur', validateSenha);

  document.querySelector('.forgot-password-link')
    ?.addEventListener('click', handleForgotPassword);

  // Se já há sessão válida, redireciona direto
  if (authState.accessToken) restoreSession();
});

/* ─── SUBMIT ──────────────────────────────────────────────── */

async function handleLoginSubmit(event) {
  event.preventDefault();

  const matricula = document.getElementById('matricula').value.trim();
  const senha     = document.getElementById('senha').value.trim();

  if (!validateMatriculaField() || !validateSenha()) {
    showError('Por favor, preencha todos os campos corretamente');
    return;
  }

  setLoadingState(true);

  try {
    const response = await authenticateUser(matricula, senha);

    if (response.success) {
      authState.accessToken  = response.accessToken;
      authState.refreshToken = response.refreshToken;
      localStorage.setItem('accessToken',  response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.removeItem('token'); // remove chave legada

      showSuccess('Login realizado com sucesso!');

      setTimeout(() => redirectToDashboard(response.user.role), 800);
    } else {
      showError(response.message || 'Matrícula ou senha incorretos');
    }

  } catch (error) {
    // Se o backend estiver fora do ar, cai aqui
    console.error('Erro na requisição:', error);

    // MOCK apenas para desenvolvimento — remover em produção
    if (isDevMode()) {
      console.warn('⚠️ Backend indisponível — usando MOCK');
      const mock = mockAuthenticate(matricula, senha);
      authState.accessToken  = mock.accessToken;
      authState.refreshToken = mock.refreshToken;
      localStorage.setItem('accessToken',  mock.accessToken);
      localStorage.setItem('refreshToken', mock.refreshToken);
      localStorage.setItem('user', JSON.stringify(mock.user));
      localStorage.removeItem('token');
      setTimeout(() => redirectToDashboard(mock.user.role), 800);
    } else {
      showError('Erro ao conectar com o servidor. Verifique se a API está rodando em localhost:8080');
    }
  } finally {
    setLoadingState(false);
  }
}

/* ─── CHAMADA À API ───────────────────────────────────────── */

/**
 * Envia matrícula + senha para POST /api/auth/login
 * Retorna: { success, accessToken, refreshToken, expiresIn, user }
 */
async function authenticateUser(matricula, senha) {
  // ────────────────────────────────────────────────────────────
  //  URL DO BACKEND — ajuste se o Tomcat rodar em outra porta
  const API_URL = 'http://localhost:8080/escoteiros-api/api/auth/login';
  // ────────────────────────────────────────────────────────────

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ matricula, senha }),
  });

  if (!response.ok) {
    // Erros 4xx/5xx → tentar ler mensagem do backend
    const err = await response.json().catch(() => ({}));
    return { success: false, message: err.erro || `Erro ${response.status}` };
  }

  return response.json();
}

/* ─── MOCK (só para desenvolvimento) ─────────────────────── */

function isDevMode() {
  // Ativa o mock apenas em localhost; em produção nunca usa mock
  return window.location.hostname === 'localhost' ||
         window.location.hostname === '127.0.0.1';
}

function mockAuthenticate(matricula, senha) {
  const usuarios = {
    'LB.2024-001': { role: 'lobinho',   name: 'Pedro Henrique Santos Oliveira', nomeEscoteiro: 'Falcão Veloz',   email: 'pedro.santos.teste@email.com' },
    'ES.2024-001': { role: 'escotista', name: 'Ana Carolina Ferreira Lima',     nomeEscoteiro: 'Lince Ágil',     email: 'ana.ferreira.teste@email.com' },
    'DG.2024-001': { role: 'dirigente', name: 'Carlos Eduardo Mendes Costa',    nomeEscoteiro: 'Urso Sábio',     email: 'carlos.mendes.teste@email.com' },
  };

  const u = usuarios[matricula] || { role: 'lobinho', name: 'Usuário Teste', nomeEscoteiro: 'Teste', email: 'teste@escoteiros.com' };

  return {
    success:      true,
    accessToken:  'mock-access-'  + crypto.randomUUID(),
    refreshToken: 'mock-refresh-' + crypto.randomUUID(),
    expiresIn:    1800,
    user: {
      id:           'mock-id-' + Date.now(),
      name:          u.name,
      nomeEscoteiro: u.nomeEscoteiro,
      matricula,
      role:          u.role,
      email:         u.email,
      fotoUrl:       null,
      grupoId:       null,
    },
  };
}

/* ─── RESTAURAR SESSÃO ────────────────────────────────────── */

function restoreSession() {
  const accessToken = localStorage.getItem('accessToken');
  const userData    = JSON.parse(localStorage.getItem('user') || '{}');
  if (accessToken && userData?.role) {
    redirectToDashboard(userData.role);
  }
}

/* ─── REDIRECIONAMENTO ────────────────────────────────────── */

function redirectToDashboard(role) {
  const paths = {
    lobinho:   '/lobinho/dashboard/',
    escotista: '/escotista/dashboard/',
    dirigente: '/dirigente/dashboard/',
  };
  window.location.href = paths[role] || '/lobinho/dashboard/';
}

/* ─── VALIDAÇÕES ──────────────────────────────────────────── */
function validateMatriculaField() {
  const input = document.getElementById('matricula');
  const matricula = input?.value.trim();
  // Formato: XX.AAAA-NNN (ex: LB.2024-001, ES.2024-001, DG.2024-001)
  const ok = /^[A-Za-z]{2}\.\d{4}-\d{3}$/.test(matricula);
  input?.classList.toggle('error', !ok);
  return ok;
}

function validateSenha() {
  const input = document.getElementById('senha');
  const ok = (input?.value.trim().length ?? 0) >= 6;
  input?.classList.toggle('error', !ok);
  return ok;
}

function formatMatricula() {
  // Formato livre — não formata automaticamente pois inclui letras (ex: LB.2024-001)
}

/* ─── UI ──────────────────────────────────────────────────── */

function setLoadingState(isLoading) {
  const button = document.querySelector('.action-button');
  const form   = document.getElementById('loginForm');
  authState.isLoading = isLoading;

  if (button) {
    button.disabled = isLoading;
    button.innerHTML = isLoading
      ? 'Carregando...'
      : '<span class="button-text">Entrar</span><img src="assets/3-62.svg" alt="Seta" class="button-icon">';
  }
  if (form) {
    form.style.opacity       = isLoading ? '0.6' : '1';
    form.style.pointerEvents = isLoading ? 'none' : 'auto';
  }
}

function showError(message) {
  console.error('❌', message);
  // TODO: Substituir alert por toast visual
  alert('❌ ' + message);
}

function showSuccess(message) {
  console.log('✅', message);
  // TODO: Substituir alert por toast visual
  alert('✅ ' + message);
}

function handleForgotPassword(event) {
  event.preventDefault();
  alert('Funcionalidade de recuperação de senha em desenvolvimento');
}

/* ─── LOGOUT (chamado por outras telas) ───────────────────── */

function logout() {
<<<<<<< HEAD
  authState.token = null;
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_data');
  window.location.href = '../login/';
=======
  authState.accessToken  = null;
  authState.refreshToken = null;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  localStorage.removeItem('token'); // remove chave legada
  window.location.replace('/login/');
>>>>>>> 46b8af6213d1ab90b652fc61a0b7035f67093410
}

window.authModule = { logout, isAuthenticated: () => !!authState.accessToken };
