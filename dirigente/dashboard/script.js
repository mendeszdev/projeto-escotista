/* dashboard-dirigente.js */

/* ─────────────────────────────────────────
   TOAST
───────────────────────────────────────── */
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

/* ─────────────────────────────────────────
   SIDEBAR NAV
───────────────────────────────────────── */
/**
 * Aplica .active ao link clicado na sidebar.
 */
function initSidebarNav() {
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      document
        .querySelectorAll(".nav-link")
        .forEach((l) => l.classList.remove("active"));
      link.classList.add("active");
    });
  });
}

/* ─────────────────────────────────────────
   PROGRESS BARS — IntersectionObserver
───────────────────────────────────────── */
/**
 * Anima as barras de progresso ao entrarem na viewport,
 * com stagger baseado no atributo data-delay (ms).
 */
function initProgressBars() {
  const bars = document.querySelectorAll("[data-width]");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const bar = entry.target;
        const delay = parseInt(bar.dataset.delay || "0", 10);
        setTimeout(() => {
          bar.style.width = bar.dataset.width;
        }, delay);
        observer.unobserve(bar);
      });
    },
    { threshold: 0.3 },
  );

  bars.forEach((bar) => {
    bar.style.width = "0%";
    observer.observe(bar);
  });
}

/* ─────────────────────────────────────────
   PERIOD TABS (Semanal / Mensal)
───────────────────────────────────────── */
/**
 * Alterna o filtro de período nos botões de tab.
 */
function initPeriodTabs() {
  const tabs = document.querySelectorAll(".tab-btn");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      showToast("📅", `Período: ${tab.textContent.trim()}`);
    });
  });
}

/* ─────────────────────────────────────────
   ALERTA ITEMS
───────────────────────────────────────── */
/**
 * Inicializa ações nos cards de alerta.
 */
function initAlertas() {
  /* "Resolver agora" link */
  document.getElementById("btn-resolver")?.addEventListener("click", () => {
    showToast("📋", "15 registros pendentes abertos para ação.");
  });

  /* Alertas clicáveis */
  document.querySelectorAll(".alerta-item").forEach((item) => {
    item.addEventListener("click", () => {
      const name = item.querySelector(".alerta-name")?.textContent.trim();
      showToast("🔔", `Alerta: ${name}`);
    });
  });
}

/* ─────────────────────────────────────────
   PRÓXIMOS PASSOS
───────────────────────────────────────── */
function initPassos() {
  document.querySelectorAll(".passo-card").forEach((card) => {
    card.style.cursor = "pointer";
    card.addEventListener("click", () => {
      const name = card.querySelector(".passo-name")?.textContent.trim();
      showToast("📌", `Abrindo: ${name}`);
    });
  });
}

/* ─────────────────────────────────────────
   NOVA INSCRIÇÃO
───────────────────────────────────────── */
function initNovaInscricao() {
  document
    .getElementById("btn-nova-inscricao")
    ?.addEventListener("click", () => {
      showToast("✅", "Formulário de nova inscrição aberto.");
    });
}

/* ─────────────────────────────────────────
   BOOTSTRAP
───────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  initSidebarNav();
  initProgressBars();
  initPeriodTabs();
  initAlertas();
  initPassos();
  initNovaInscricao();
});
