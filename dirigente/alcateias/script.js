/* gestao-alcateias.js */

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
   PROGRESS BARS ANIMATION
───────────────────────────────────────── */
/**
 * Anima as barras de progresso com IntersectionObserver e data-delay.
 */
function initProgressBars() {
  const bars = document.querySelectorAll(".progress-fill[data-width]");

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
   MATILHA CARD CLICK
───────────────────────────────────────── */
/**
 * Abre detalhes de cada matilha ao clicar no card ou no botão de seta.
 */
function initMatilhaCards() {
  document.querySelectorAll(".matilha-card").forEach((card) => {
    const name = card.querySelector(".matilha-name")?.textContent.trim();
    const pct = card.querySelector(".progress-pct")?.textContent.trim();

    card.addEventListener("click", (e) => {
      if (e.target.closest(".btn-detail")) return; // handled separately
      showToast("🐺", `Abrindo detalhes: ${name} — ${pct} de progresso`);
    });

    card.querySelector(".btn-detail")?.addEventListener("click", (e) => {
      e.stopPropagation();
      showToast("➡️", `Detalhes da ${name}`);
    });
  });
}

/* ─────────────────────────────────────────
   MAP MARKERS
───────────────────────────────────────── */
/**
 * Feedback ao clicar nos marcadores do mapa.
 */
function initMapMarkers() {
  const labels = {
    C: "Matilha Cinza",
    B: "Matilha Branca",
    P: "Matilha Preta",
  };

  document.querySelectorAll(".map-marker").forEach((marker) => {
    const letter = marker.textContent.trim();
    marker.title = labels[letter] || "Matilha";

    marker.addEventListener("click", () => {
      showToast("📍", `Localização: ${labels[letter] || marker.title}`);
    });
  });
}

/* ─────────────────────────────────────────
   PRÓXIMA GRANDE CAÇADA
───────────────────────────────────────── */
function initCacada() {
  document.getElementById("btn-cacada")?.addEventListener("click", () => {
    showToast("🏕️", "Abrindo detalhes do Acantonamento Regional de Alcatéias.");
  });
}

/* ─────────────────────────────────────────
   SIDEBAR CTA
───────────────────────────────────────── */
function initCTA() {
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
  initMatilhaCards();
  initMapMarkers();
  initCacada();
  initCTA();
});
