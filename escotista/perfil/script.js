/* perfil.js */

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
      e.preventDefault();
      document
        .querySelectorAll(".nav-link")
        .forEach((l) => l.classList.remove("active"));
      link.classList.add("active");
    });
  });
}

/**
 * Alterna modo de edição nos campos de informações básicas.
 */
function initEditProfile() {
  const btn = document.getElementById("btn-edit-profile");
  if (!btn) return;

  let editing = false;

  btn.addEventListener("click", () => {
    editing = !editing;

    const fields = document.querySelectorAll(".info-value[data-editable]");
    fields.forEach((field) => {
      if (editing) {
        // replace text with input
        const input = document.createElement("input");
        input.type = "text";
        input.value = field.textContent.trim();
        input.style.cssText = `
          background: white;
          border: 1.5px solid #feb300;
          border-radius: 8px;
          padding: 4px 10px;
          font-family: 'Open Sans', sans-serif;
          font-size: 16px;
          font-weight: 600;
          color: #393834;
          width: 100%;
          outline: none;
        `;
        input.dataset.original = field.textContent.trim();
        field.replaceWith(input);
      } else {
        // save and revert
        const input = document.querySelector(`input[data-original]`);
      }
    });

    if (editing) {
      // convert all .info-value[data-editable] to inputs
      document
        .querySelectorAll(".info-value[data-editable]")
        .forEach((field) => {
          if (
            field.tagName === "P" ||
            field.tagName === "SPAN" ||
            field.tagName === "DIV"
          ) {
            const input = document.createElement("input");
            input.type = "text";
            input.value = field.textContent.trim();
            input.className = "info-value-input";
            input.style.cssText = [
              "background:white",
              "border:1.5px solid #feb300",
              "border-radius:8px",
              "padding:4px 10px",
              "font-family:'Open Sans',sans-serif",
              "font-size:16px",
              "font-weight:600",
              "color:#393834",
              "width:100%",
              "outline:none",
            ].join(";");
            field.replaceWith(input);
          }
        });

      btn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
             stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        Salvar Alterações
      `;
      showToast("✏️", "Modo de edição ativado.");
    } else {
      // revert inputs back to divs
      document.querySelectorAll(".info-value-input").forEach((input) => {
        const div = document.createElement("div");
        div.className = "info-value";
        div.setAttribute("data-editable", "");
        div.textContent = input.value.trim();
        input.replaceWith(div);
      });

      btn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
             stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
        Atualizar Informações
      `;
      showToast("✅", "Informações salvas com sucesso!", 3500);
    }
  });
}

/**
 * Simula renovação de documento expirado.
 */
function initDocActions() {
  document.querySelectorAll(".btn-renew").forEach((btn) => {
    btn.addEventListener("click", () => {
      const docName =
        btn
          .closest(".doc-row")
          ?.querySelector(".doc-name")
          ?.textContent.trim() || "Documento";
      showToast(
        "📄",
        `Solicitação de renovação de "${docName}" enviada!`,
        4000,
      );
      btn.textContent = "Enviado!";
      btn.disabled = true;
      btn.style.opacity = "0.6";
    });
  });

  /* Exam rows — click to open */
  document.querySelectorAll(".exam-row").forEach((row) => {
    row.style.cursor = "pointer";
    row.addEventListener("click", () => {
      const name = row.querySelector(".exam-name")?.textContent.trim();
      showToast("📋", `Abrindo ${name || "exame"}…`);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initSidebarNav();
  initEditProfile();
  initDocActions();
});
