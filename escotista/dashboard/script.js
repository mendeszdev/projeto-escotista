/* dashboard-escotista.js */

/**
 * Exibe um toast de notificação temporário.
 * @param {string} icon  - Emoji ou ícone exibido à esquerda
 * @param {string} msg   - Texto da mensagem
 * @param {number} [duration=3000] - Duração em ms antes de sumir
 */
function showToast(icon, msg, duration = 3000) {
  const toast = document.getElementById("toast");
  const toastIcon = document.getElementById("toast-icon");
  const toastMsg = document.getElementById("toast-msg");

  toastIcon.textContent = icon;
  toastMsg.textContent = msg;
  toast.classList.add("show");

  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => toast.classList.remove("show"), duration);
}

/**
 * Aprova ou rejeita uma atividade pendente:
 * anima a saída do item e exibe toast.
 * @param {HTMLElement} btn    - Botão clicado (aprovar ou rejeitar)
 * @param {string}      action - 'aprovada' | 'rejeitada'
 */
function handleAction(btn, action) {
  const item = btn.closest(".activity-item");
  const name = item.querySelector(".activity-name").textContent.trim();
  const emoji = action === "aprovada" ? "✅" : "❌";

  item.style.transition = "opacity .4s, transform .4s";
  item.style.opacity = "0";
  item.style.transform = "translateX(30px)";

  setTimeout(() => {
    item.remove();
    showToast(emoji, `Atividade de ${name} ${action}!`);
  }, 400);
}

/**
 * Inicializa o destaque de navegação da sidebar:
 * ao clicar em um link, remove .active dos demais e aplica no clicado.
 */
function initSidebarNav() {
  const links = document.querySelectorAll(".nav-link");

  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      links.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");
    });
  });
}

/* ── Bootstrap ── */
document.addEventListener("DOMContentLoaded", () => {
  initSidebarNav();
});
