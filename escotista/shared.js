(function () {
  function ensureToast() {
    let toast = document.querySelector(".toast");
    if (toast) return toast;

    toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = '<span class="toast-icon"></span><span class="toast-msg"></span>';
    document.body.appendChild(toast);
    return toast;
  }

  function showToast(icon, message, duration = 3000) {
    const toast = ensureToast();
    const toastIcon = toast.querySelector(".toast-icon");
    const toastMsg = toast.querySelector(".toast-msg");

    toastIcon.textContent = icon;
    toastMsg.textContent = message;
    toast.classList.add("show");

    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => toast.classList.remove("show"), duration);
  }

  function openModal(id) {
    const modal = typeof id === "string" ? document.getElementById(id) : id;
    if (!modal) return;
    modal.classList.add("is-open");
    document.body.classList.add("modal-open");
  }

  function closeModal(modal) {
    const target = modal || document.querySelector(".modal.is-open");
    if (!target) return;
    target.classList.remove("is-open");
    if (!document.querySelector(".modal.is-open")) {
      document.body.classList.remove("modal-open");
    }
  }

  function initChrome() {
    const menuToggle = document.querySelector(".menu-toggle");
    const sidebar = document.querySelector(".sidebar");

    if (menuToggle && sidebar) {
      menuToggle.addEventListener("click", () => sidebar.classList.toggle("open"));
    }

    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        if (sidebar) sidebar.classList.remove("open");
      });
    });

    document.querySelectorAll("[data-close-modal]").forEach((button) => {
      button.addEventListener("click", () => closeModal(button.closest(".modal")));
    });

    document.querySelectorAll(".modal").forEach((modal) => {
      modal.addEventListener("click", (event) => {
        if (event.target === modal) closeModal(modal);
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeModal();
    });
  }

  window.EscotistaApp = {
    showToast,
    openModal,
    closeModal,
  };

  document.addEventListener("DOMContentLoaded", initChrome);
})();
