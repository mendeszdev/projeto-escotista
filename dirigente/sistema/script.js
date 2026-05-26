/* configuracoes-sistema.js */

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
   COLOR PALETTE SELECTOR
───────────────────────────────────────── */
/**
 * Seleciona a cor principal da paleta ao clicar em um swatch.
 */
function initColorPalette() {
  const swatches = document.querySelectorAll(".color-swatch");

  swatches.forEach((swatch) => {
    swatch.addEventListener("click", () => {
      swatches.forEach((s) => s.classList.remove("selected"));
      swatch.classList.add("selected");
      const color = swatch.dataset.color || swatch.style.background;
      showToast(
        "🎨",
        `Cor principal selecionada: ${swatch.dataset.name || color}`,
      );
    });
  });

  /* Add-color button */
  document.getElementById("btn-add-color")?.addEventListener("click", () => {
    showToast("➕", "Abrindo seletor de cor personalizado…");
  });
}

/* ─────────────────────────────────────────
   LOGO UPLOAD
───────────────────────────────────────── */
/**
 * Lida com upload do logo via clique e drag & drop.
 */
function initLogoUpload() {
  const zone = document.getElementById("logo-upload-zone");
  const input = document.getElementById("logo-file-input");
  if (!zone || !input) return;

  zone.addEventListener("click", () => input.click());

  zone.addEventListener("dragover", (e) => {
    e.preventDefault();
    zone.style.borderColor = "var(--gold)";
    zone.style.background = "rgba(134,92,0,0.08)";
  });
  zone.addEventListener("dragleave", () => {
    zone.style.borderColor = "";
    zone.style.background = "";
  });
  zone.addEventListener("drop", (e) => {
    e.preventDefault();
    zone.style.borderColor = "";
    zone.style.background = "";
    const file = e.dataTransfer?.files?.[0];
    if (file) handleLogoFile(file);
  });

  input.addEventListener("change", () => {
    if (input.files?.[0]) handleLogoFile(input.files[0]);
  });

  function handleLogoFile(file) {
    const allowed = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];
    if (!allowed.includes(file.type)) {
      showToast("⚠️", "Formato inválido. Use PNG, JPG, SVG ou WEBP.");
      return;
    }
    const label = zone.querySelector(".upload-zone-label");
    if (label) label.textContent = `✔ ${file.name}`;
    zone.style.borderColor = "var(--forest-green)";
    showToast("🖼️", `Logo "${file.name}" carregado com sucesso.`);
  }
}

/* ─────────────────────────────────────────
   SAVE IDENTITY
───────────────────────────────────────── */
function initSaveIdentity() {
  document
    .getElementById("btn-save-identity")
    ?.addEventListener("click", () => {
      showToast("✅", "Identidade visual salva com sucesso!", 4000);
    });
}

/* ─────────────────────────────────────────
   BACKUP / EXPORT
───────────────────────────────────────── */
function initBackup() {
  document.getElementById("btn-export-data")?.addEventListener("click", () => {
    showToast(
      "📥",
      "Exportação de dados iniciada. O arquivo será enviado por e-mail.",
      4000,
    );
  });
}

/* ─────────────────────────────────────────
   NOTIFICATION TOGGLES
───────────────────────────────────────── */
/**
 * Observa mudanças nos toggles de notificação e exibe feedback.
 */
function initToggles() {
  document.querySelectorAll(".toggle input").forEach((toggle) => {
    toggle.addEventListener("change", () => {
      const label =
        toggle
          .closest(".notif-row")
          ?.querySelector(".notif-name")
          ?.textContent.trim() || "Notificação";
      const state = toggle.checked ? "ativada" : "desativada";
      const icon = toggle.checked ? "🔔" : "🔕";
      showToast(icon, `${label} ${state}.`);

      /* Dim the row when off */
      const row = toggle.closest(".notif-row");
      if (row) row.classList.toggle("dimmed", !toggle.checked);
    });
  });
}

/* ─────────────────────────────────────────
   ROLE ROWS — menu
───────────────────────────────────────── */
function initRoleRows() {
  document.querySelectorAll(".role-row").forEach((row) => {
    row.addEventListener("click", (e) => {
      if (e.target.closest(".role-menu-btn")) return;
      const name =
        row.querySelector(".role-name")?.textContent.trim() || "Perfil";
      showToast("👤", `Editando permissões de: ${name}`);
    });
    row.querySelector(".role-menu-btn")?.addEventListener("click", (e) => {
      e.stopPropagation();
      const name =
        row.querySelector(".role-name")?.textContent.trim() || "Perfil";
      showToast("⋯", `Menu de ações para: ${name}`);
    });
  });
}

/* ─────────────────────────────────────────
   NEW PROFILE BUTTON
───────────────────────────────────────── */
function initNewProfile() {
  document.getElementById("btn-novo-perfil")?.addEventListener("click", () => {
    showToast("➕", "Formulário de novo perfil aberto.");
  });
}

/* ─────────────────────────────────────────
   TOPBAR SEARCH
───────────────────────────────────────── */
function initTopbarSearch() {
  const input = document.getElementById("topbar-search");
  if (!input) return;

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && input.value.trim()) {
      showToast("🔍", `Buscando configurações: "${input.value.trim()}"`);
    }
  });
}

/* ─────────────────────────────────────────
   BOOTSTRAP
───────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  initSidebarNav();
  initColorPalette();
  initLogoUpload();
  initSaveIdentity();
  initBackup();
  initToggles();
  initRoleRows();
  initNewProfile();
  initTopbarSearch();
});
