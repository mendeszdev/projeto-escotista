// Painel do Escotista
document.addEventListener('DOMContentLoaded', function() {
  console.log('[DASHBOARD-ESCOTISTA] Página carregada');
  setupEventListeners();
});

function setupEventListeners() {
  const btnAprovar = document.querySelectorAll('.btn-aprovar');
  btnAprovar.forEach(btn => {
    btn.addEventListener('click', handleAprovar);
  });
  
  const btnRejeitar = document.querySelectorAll('.btn-rejeitar');
  btnRejeitar.forEach(btn => {
    btn.addEventListener('click', handleRejeitar);
  });
  
  const btnVerTodas = document.querySelector('.btn-ver-todas');
  if (btnVerTodas) {
    btnVerTodas.addEventListener('click', handleVerTodas);
  }
}

function handleAprovar(event) {
  event.preventDefault();
  const item = event.currentTarget.closest('.atividade-item');
  const nome = item.querySelector('.atividade-nome').textContent;
  console.log('[DASHBOARD-ESCOTISTA] Aprovando:', nome);
  // TODO: Enviar aprovação para API
}

function handleRejeitar(event) {
  event.preventDefault();
  const item = event.currentTarget.closest('.atividade-item');
  const nome = item.querySelector('.atividade-nome').textContent;
  console.log('[DASHBOARD-ESCOTISTA] Rejeitando:', nome);
  // TODO: Enviar rejeição para API
}

function handleVerTodas(event) {
  event.preventDefault();
  console.log('[DASHBOARD-ESCOTISTA] Ver todas as pendências');
  // TODO: Navegar para página de atividades
}

window.DashboardEscotista = { setupEventListeners, handleAprovar, handleRejeitar, handleVerTodas };