/* ============================================
   LOGIN - SCRIPT.JS
   Integrado com POST /api/auth/login
   ============================================ */

const authState = {
  isLoading: false,
  token: localStorage.getItem('auth_token') || null,
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

  // Se já há sessão, redireciona direto
  if (authState.token) restoreSession();
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
      // Salvar sessão
      authState.token = response.token;
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user_data',  JSON.stringify(response.user));

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
      authState.token = mock.token;
      localStorage.setItem('auth_token', mock.token);
      localStorage.setItem('user_data',  JSON.stringify(mock.user));
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
 * O backend (LoginServlet.java) retorna:
 * { success, token, user: { id, name, matricula, role, email, fotoUrl } }
 */
async function authenticateUser(matricula, senha) {
  // ────────────────────────────────────────────────────────────
  //  URL DO BACKEND — ajuste se o Tomcat rodar em outra porta
  const API_URL = 'http://localhost:8080/api/auth/login';
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
  // Simula perfis diferentes por matrícula para facilitar testes:
  // 001.001-1 → dirigente | 001.001-2 → escotista | qualquer outro → lobinho
  let role = 'lobinho';
  if (matricula === '001.001-1') role = 'dirigente';
  if (matricula === '001.001-2') role = 'escotista';

  return {
    success: true,
    token: 'mock_token_' + Date.now(),
    user: {
      id:       'mock-id-123',
      name:     'Usuário Teste',
      matricula: matricula,
      role:      role,
      email:    'teste@escoteiros.com',
      fotoUrl:  null,
    },
  };
}

/* ─── RESTAURAR SESSÃO ────────────────────────────────────── */

function restoreSession() {
  const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
  if (userData?.role) {
    redirectToDashboard(userData.role);
  }
}

/* ─── REDIRECIONAMENTO ────────────────────────────────────── */

function redirectToDashboard(role) {
  const paths = {
    lobinho:   '../lobinho/dashboard/',
    escotista: '../escotista/dashboard/',
    dirigente: '../dirigente/dashboard/',
  };
  window.location.href = paths[role] || '/lobinho/dashboard/';
}

/* ─── VALIDAÇÕES ──────────────────────────────────────────── */
function validateMatriculaField()  {
  const input    = document.getElementById('matricula');
  const matricula = input?.value.trim();
  const ok = /^\d{3}\.\d{3}-\d{1}$/.test(matricula);
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
  const input = document.getElementById('matricula');
  let v = input.value.replace(/\D/g, '').slice(0, 7);
  if      (v.length <= 3) input.value = v;
  else if (v.length <= 6) input.value = v.slice(0,3) + '.' + v.slice(3);
  else                    input.value = v.slice(0,3) + '.' + v.slice(3,6) + '-' + v.slice(6);
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
  authState.token = null;
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_data');
  window.location.href = '../login/';
}

window.authModule = { logout, isAuthenticated: () => !!authState.token };
