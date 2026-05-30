/* eixos-escotista.js */

/**
 * Exibe um toast de notificação temporário.
 * @param {string} icon       - Emoji ou ícone exibido à esquerda
 * @param {string} msg        - Texto da mensagem
 * @param {number} [duration] - Duração em ms antes de sumir (padrão: 3000)
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
 * Anima as barras de progresso ao entrar na viewport.
 * Usa IntersectionObserver para acionar a transição CSS.
 */
function initProgressBars() {
  const bars = document.querySelectorAll(".axis-bar[data-width]");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const bar = entry.target;
          bar.style.width = bar.dataset.width;
          observer.unobserve(bar);
        }
      });
    },
    { threshold: 0.3 },
  );

  bars.forEach((bar) => {
    bar.style.width = "0%"; // começa zerada
    observer.observe(bar);
  });
}

/**
 * Inicializa o destaque de navegação da sidebar.
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

/**
 * Adiciona feedback de clique nos cards de eixo.
 */
function initAxisCards() {
  const cards = document.querySelectorAll(".axis-card");

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      const title = card.querySelector(".axis-title").textContent.trim();
      showToast("📖", `Abrindo eixo: ${title}`);
    });
  });
}

/* ── Bootstrap ── */
document.addEventListener("DOMContentLoaded", () => {
  initSidebarNav();
  initProgressBars();
  initAxisCards();
});
