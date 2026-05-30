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
      if (link.getAttribute("href") === "#") e.preventDefault();
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

/* ─────────────────────────────────────────
   LOAD EIXOS — API real
───────────────────────────────────────── */
async function loadEixos() {
  if (typeof API === 'undefined') return;
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [eixos, progressoes] = await Promise.all([
      API.eixos.list(),
      user.id ? API.progressoes.listByAssociado(user.id) : Promise.resolve([]),
    ]);

    const cards = document.querySelectorAll('.axis-card');
    eixos.forEach((eixo, i) => {
      const card = cards[i];
      if (!card) return;
      card.dataset.eixoTipo = eixo.tipo || eixo.id;

      const prog = progressoes.find(p => p.eixoId === eixo.id);
      const pct  = prog ? Math.round(prog.percentualConcluido) : 0;

      const titleEl = card.querySelector('.axis-title');
      if (titleEl) titleEl.textContent = eixo.nome;

      const bar = card.querySelector('.axis-bar[data-width]');
      if (bar) {
        bar.dataset.width = `${pct}%`;
        bar.style.width   = `${pct}%`;
      }

      const pctEl = card.querySelector('.axis-pct, .axis-progress-text');
      if (pctEl) pctEl.textContent = `${pct}%`;
    });

  } catch (err) {
    console.warn('[Eixos] Erro ao carregar:', err.message);
  }
}

/* ── Bootstrap ── */
document.addEventListener("DOMContentLoaded", () => {
  initSidebarNav();
  initProgressBars();
  initAxisCards();
  loadEixos();
});
