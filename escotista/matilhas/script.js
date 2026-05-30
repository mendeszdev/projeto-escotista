/* matilha.js */

/**
 * Exibe um toast de notificação temporário.
 * @param {string} icon       - Emoji exibido à esquerda
 * @param {string} msg        - Texto da mensagem
 * @param {number} [duration] - Duração em ms (padrão: 3000)
 */
function showToast(icon, msg, duration = 3000) {
  const toast = document.getElementById("toast");
  const toastIcon = document.getElementById("toast-icon");
  const toastMsg = document.getElementById("toast-msg");

  toastIcon.textContent = icon;
  toastMsg.textContent = msg;
  toast.classList.add("show");

  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), duration);
}

/**
 * Aplica a classe .active ao link clicado na sidebar.
 */
function initSidebarNav() {
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      if (link.getAttribute("href") === "#") e.preventDefault();
      document
        .querySelectorAll(".nav-link")
        .forEach((l) => l.classList.remove("active"));
      link.classList.add("active");
    });
  });
}

/**
 * Anima as barras de progresso ao entrarem na viewport.
 * As barras começam em 0 e expandem para o valor definido em data-width.
 */
function initProgressBars() {
  const bars = document.querySelectorAll("[data-width]");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const bar = entry.target;
          // small delay for stagger effect
          const delay = parseInt(bar.dataset.delay || 0, 10);
          setTimeout(() => {
            bar.style.width = bar.dataset.width;
          }, delay);
          observer.unobserve(bar);
        }
      });
    },
    { threshold: 0.3 },
  );

  bars.forEach((bar) => {
    bar.style.width = "0%";
    observer.observe(bar);
  });
}

/**
 * Exibe toast de detalhes ao clicar em um card de lobinho.
 */
function initLobinhoCards() {
  document.querySelectorAll(".lobinho-card").forEach((card) => {
    card.addEventListener("click", () => {
      const name =
        card.querySelector(".card-name")?.textContent.trim() || "Lobinho";
      const progress =
        card.querySelector(".progress-pct")?.textContent.trim() || "";
      showToast("🐾", `${name} — ${progress} de progresso`);
    });
  });
}

/**
 * Filtra os cards de lobinho pelo nome digitado.
 */
function applyFilters() {
  const query = document
    .getElementById("search-input")
    .value.toLowerCase()
    .trim();
  const status = document.getElementById("status-select").value;

  document.querySelectorAll(".lobinho-card").forEach((card) => {
    const name =
      card.querySelector(".card-name")?.textContent.toLowerCase() || "";
    const hasPending = card.querySelector(".pending-badge") !== null;

    const matchName = !query || name.includes(query);
    const matchStatus =
      !status ||
      status === "all" ||
      (status === "pending" && hasPending) ||
      (status === "ok" && !hasPending);

    card.closest("li")
      ? (card.closest("li").style.display =
          matchName && matchStatus ? "" : "none")
      : (card.style.display = matchName && matchStatus ? "" : "none");
  });
}

function initMatilhaCard() {
  document.querySelectorAll(".btn-matilha-detail").forEach((btn) => {
    btn.addEventListener("click", () => {
      const name = btn
        .closest(".matilha-card")
        ?.querySelector(".matilha-name")
        ?.textContent.trim();
      showToast("🐺", `Abrindo detalhes de ${name || "Matilha"}`);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initSidebarNav();
  initProgressBars();
  initLobinhoCards();
  initMatilhaCard();

  /* Filter button */
  document
    .getElementById("btn-filter")
    ?.addEventListener("click", applyFilters);

  /* Search on Enter */
  document.getElementById("search-input")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") applyFilters();
  });

  /* Status live filter */
  document
    .getElementById("status-select")
    ?.addEventListener("change", applyFilters);

  /* Ver todos */
  document.getElementById("btn-ver-todos")?.addEventListener("click", () => {
    showToast("📋", "Exibindo todos os lobinhos da matilha.");
  });
});
