const form = document.getElementById("activity-form");

function selectedLobinhos() {
  return Array.from(form.querySelectorAll('input[name="lobinhos"]:checked')).map((input) => input.value);
}

function setError(id, message) {
  const target = document.querySelector(`[data-error-for="${id}"]`);
  if (target) target.textContent = message;
}

function clearErrors() {
  document.querySelectorAll(".field-error").forEach((error) => {
    error.textContent = "";
  });
}

function formatDate(value) {
  if (!value) return "Nao definida";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function updatePreview() {
  const title = document.getElementById("activity-name").value.trim();
  const block = document.getElementById("activity-block").value;
  const deadline = document.getElementById("deadline").value;
  const description = document.getElementById("activity-description").value.trim();
  const names = selectedLobinhos();

  document.getElementById("preview-title").textContent = title || "Nova atividade";
  document.getElementById("preview-description").textContent =
    description || "Preencha os dados para visualizar o resumo antes de criar.";
  document.getElementById("preview-block").textContent = block || "Nao definido";
  document.getElementById("preview-deadline").textContent = formatDate(deadline);
  document.getElementById("preview-lobinhos").textContent = names.length ? names.join(", ") : "Nenhum selecionado";
  document.getElementById("selected-count").textContent = `${names.length} selecionado${names.length === 1 ? "" : "s"}`;
}

function validateForm() {
  clearErrors();
  let valid = true;

  const title = document.getElementById("activity-name").value.trim();
  const block = document.getElementById("activity-block").value;
  const deadline = document.getElementById("deadline").value;
  const names = selectedLobinhos();

  if (!title) {
    setError("activity-name", "Informe o nome da atividade.");
    valid = false;
  }

  if (!block) {
    setError("activity-block", "Selecione um bloco de aprendizagem.");
    valid = false;
  }

  if (!deadline) {
    setError("deadline", "Informe a data limite.");
    valid = false;
  } else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(`${deadline}T00:00:00`);
    if (deadlineDate < today) {
      setError("deadline", "A data limite nao pode estar no passado.");
      valid = false;
    }
  }

  if (!names.length) {
    document.getElementById("lobinho-error").textContent = "Selecione pelo menos um lobinho.";
    valid = false;
  }

  return valid;
}

function initForm() {
  form.addEventListener("input", updatePreview);
  form.addEventListener("change", updatePreview);

  form.addEventListener("reset", () => {
    setTimeout(() => {
      clearErrors();
      updatePreview();
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!validateForm()) {
      EscotistaApp.showToast("!", "Revise os campos obrigatorios.");
      return;
    }

    const title = document.getElementById("activity-name").value.trim();
    const block = document.getElementById("activity-block").value;
    const deadline = document.getElementById("deadline").value;
    const description = document.getElementById("activity-description").value.trim();
    const names = selectedLobinhos();
    const tagType = EscotistaData.tagTypeForBlock(block);

    names.forEach((name) => {
      EscotistaData.addActivity({
        name,
        tag: `Atividade: ${title}`,
        tagType,
        quote: description || `Atividade personalizada criada para ${name}.`,
        block,
        date: formatDate(deadline),
      });
    });

    EscotistaApp.showToast("OK", "Atividade personalizada criada com sucesso.");
    form.reset();
    setTimeout(updatePreview);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initForm();
  updatePreview();
});
