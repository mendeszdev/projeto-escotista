/* gestao-associados.js */

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
   LIVE SEARCH
───────────────────────────────────────── */
/**
 * Filtra as linhas da tabela em tempo real pelo nome ou matrícula.
 */
function initSearch() {
  const input = document.getElementById("search-input");
  if (!input) return;

  input.addEventListener("input", () => {
    const query = input.value.toLowerCase().trim();
    let visible = 0;

    document.querySelectorAll(".table-row[data-name]").forEach((row) => {
      const name = (row.dataset.name || "").toLowerCase();
      const matricula = (row.dataset.matricula || "").toLowerCase();
      const match = !query || name.includes(query) || matricula.includes(query);
      row.style.display = match ? "" : "none";
      if (match) visible++;
    });

    const info = document.getElementById("pagination-info");
    if (info) {
      info.textContent = query
        ? `Mostrando ${visible} resultado(s) para "${input.value}"`
        : "Mostrando 4 de 128 associados";
    }
  });
}

/* ─────────────────────────────────────────
   FILTER BY PROFILE & MATILHA
───────────────────────────────────────── */
/**
 * Filtra as linhas ao mudar o select de Perfil.
 */
function initProfileFilter() {
  const select = document.getElementById("filter-profile");
  if (!select) return;

  select.addEventListener("change", () => {
    const val = select.value;
    document.querySelectorAll(".table-row[data-perfil]").forEach((row) => {
      const match = !val || val === "all" || row.dataset.perfil === val;
      row.style.display = match ? "" : "none";
    });
    applyFilterInfo();
  });
}

/**
 * Filtra as linhas ao mudar o select de Matilha.
 */
function initMatilhaFilter() {
  const select = document.getElementById("filter-matilha");
  if (!select) return;

  select.addEventListener("change", () => {
    const val = select.value;
    document.querySelectorAll(".table-row[data-matilha]").forEach((row) => {
      const match = !val || val === "all" || row.dataset.matilha === val;
      row.style.display = match ? "" : "none";
    });
    applyFilterInfo();
  });
}

function applyFilterInfo() {
  const visible = [
    ...document.querySelectorAll(".table-row[data-name]"),
  ].filter((r) => r.style.display !== "none").length;
  const info = document.getElementById("pagination-info");
  if (info) info.textContent = `Mostrando ${visible} de 128 associados`;
}

/* ─────────────────────────────────────────
   TABLE ROW ACTIONS
───────────────────────────────────────── */
/**
 * Inicializa os botões de ação (ver, editar, excluir) nas linhas.
 */
function initRowActions() {
  /* View */
  document.querySelectorAll(".btn-view").forEach((btn) => {
    btn.addEventListener("click", () => {
      const name = btn.closest(".table-row")?.dataset.name || "Associado";
      showToast("👁️", `Visualizando ficha de ${name}`);
    });
  });

  /* Edit */
  document.querySelectorAll(".btn-edit").forEach((btn) => {
    btn.addEventListener("click", () => {
      const name = btn.closest(".table-row")?.dataset.name || "Associado";
      showToast("✏️", `Editando cadastro de ${name}`);
    });
  });

  /* Delete */
  document.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", () => {
      const row = btn.closest(".table-row");
      const name = row?.dataset.name || "Associado";

      if (confirm(`Deseja realmente remover ${name}?`)) {
        row.style.transition = "opacity .3s, transform .3s";
        row.style.opacity = "0";
        row.style.transform = "translateX(20px)";
        setTimeout(() => {
          row.remove();
          applyFilterInfo();
        }, 320);
        showToast("🗑️", `${name} removido com sucesso.`);
      }
    });
  });
}

/* ─────────────────────────────────────────
   PAGINATION
───────────────────────────────────────── */
/**
 * Activa a página clicada.
 */
function initPagination() {
  document.querySelectorAll(".page-btn[data-page]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".page-btn[data-page]")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      showToast("📄", `Página ${btn.textContent.trim()} carregada`);
    });
  });

  /* Prev / Next */
  document.getElementById("btn-prev")?.addEventListener("click", () => {
    showToast("◀️", "Página anterior");
  });
  document.getElementById("btn-next")?.addEventListener("click", () => {
    showToast("▶️", "Próxima página");
  });
}

/* ─────────────────────────────────────────
   NOVO ASSOCIADO + NOVA INSCRIÇÃO
───────────────────────────────────────── */
function initAddButtons() {
  document
    .getElementById("btn-novo-associado")
    ?.addEventListener("click", () => {
      showToast("➕", "Formulário de novo associado aberto.");
    });
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
  initSearch();
  initProfileFilter();
  initMatilhaFilter();
  initRowActions();
  initPagination();
  initAddButtons();
});
