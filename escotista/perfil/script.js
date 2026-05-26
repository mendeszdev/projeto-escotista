function setError(id, message) {
  const target = document.querySelector(`[data-error-for="${id}"]`);
  if (target) target.textContent = message;
}

function clearErrors() {
  document.querySelectorAll(".field-error").forEach((error) => {
    error.textContent = "";
  });
}

function isValidCpf(cpf) {
  return /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpf);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateProfile() {
  clearErrors();
  let valid = true;

  const name = document.getElementById("edit-name").value.trim();
  const cpf = document.getElementById("edit-cpf").value.trim();
  const branch = document.getElementById("edit-branch").value.trim();
  const email = document.getElementById("edit-email").value.trim();
  const currentPassword = document.getElementById("current-password").value.trim();
  const newPassword = document.getElementById("new-password").value.trim();

  if (!name) {
    setError("edit-name", "Nome nao pode estar vazio.");
    valid = false;
  }

  if (!cpf) {
    setError("edit-cpf", "CPF nao pode estar vazio.");
    valid = false;
  } else if (!isValidCpf(cpf)) {
    setError("edit-cpf", "Use o formato 000.000.000-00.");
    valid = false;
  }

  if (!branch) {
    setError("edit-branch", "Ramo nao pode estar vazio.");
    valid = false;
  }

  if (email && !isValidEmail(email)) {
    setError("edit-email", "Informe um e-mail valido.");
    valid = false;
  }

  if (newPassword && !currentPassword) {
    setError("current-password", "Informe a senha atual para alterar a senha.");
    valid = false;
  }

  return valid;
}

function saveProfile() {
  const fullName = document.getElementById("edit-name").value.trim();
  const shortName = fullName.split(" ").slice(0, 3).join(" ");
  const cpf = document.getElementById("edit-cpf").value.trim();
  const branch = document.getElementById("edit-branch").value.trim();
  const email = document.getElementById("edit-email").value.trim();
  const phone = document.getElementById("edit-phone").value.trim();

  document.getElementById("profile-name").textContent = shortName || fullName;
  document.getElementById("basic-name").textContent = fullName;
  document.getElementById("basic-cpf").textContent = cpf;
  document.getElementById("profile-branch").textContent = branch;
  document.getElementById("basic-email").textContent = email || "Nao informado";
  document.getElementById("basic-phone").textContent = phone || "Nao informado";
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("open-edit").addEventListener("click", () => {
    clearErrors();
    EscotistaApp.openModal("edit-modal");
  });

  document.getElementById("profile-form").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!validateProfile()) {
      EscotistaApp.showToast("!", "Revise os dados do perfil.");
      return;
    }

    saveProfile();
    document.getElementById("current-password").value = "";
    document.getElementById("new-password").value = "";
    EscotistaApp.closeModal(document.getElementById("edit-modal"));
    EscotistaApp.showToast("OK", "Perfil atualizado com sucesso.");
  });
});
