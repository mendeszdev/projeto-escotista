let pendingRejectRows = [];

const axisLabels = {
  habilidades: "Habilidades para a Vida",
  "meio-ambiente": "Meio Ambiente",
  paz: "Paz e Desenvolvimento",
  saude: "Saude e Bem-Estar",
};

function initials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function slugForBlock(block) {
  const match = Object.entries(axisLabels).find(([, label]) => label === block);
  return match ? match[0] : "habilidades";
}

function statusLabel(status) {
  if (status === "concluido") return "Concluido";
  if (status === "rejeitado") return "Rejeitado";
  return "Pendente";
}

function statusClass(status) {
  if (status === "concluido") return "green";
  if (status === "rejeitado") return "red";
  return "gold";
}

function allRows() {
  return Array.from(document.querySelectorAll(".activity-row"));
}

function visibleRows() {
  return allRows().filter((row) => !row.classList.contains("is-hidden"));
}

function selectedRows() {
  return visibleRows().filter((row) => row.querySelector(".row-check").checked);
}

function pendingOnly(rows) {
  return rows.filter((row) => row.dataset.status === "pendente");
}

function updateSelection() {
  const count = selectedRows().length;
  document.getElementById("selection-count").textContent = `${count} selecionada${count === 1 ? "" : "s"}`;
  document.getElementById("select-all").checked = count > 0 && count === pendingOnly(visibleRows()).length;
}

function rowTemplate(activity) {
  const axis = slugForBlock(activity.block);
  const disabled = activity.status !== "pendente" ? "disabled" : "";
  const actionButtons =
    activity.status === "pendente"
      ? `
        <button class="btn-secondary" type="button" data-row-action="approve">Aprovar</button>
        <button class="btn-outline" type="button" data-row-action="reject">Rejeitar</button>
      `
      : "";

  return `
    <article
      class="activity-row card"
      data-id="${activity.id}"
      data-status="${activity.status}"
      data-eixo="${axis}"
      data-lobinho="${activity.name}"
      data-title="${activity.tag}"
      data-date="${activity.date}"
      data-description="${activity.quote}"
    >
      <label class="row-check-wrap">
        <input class="row-check" type="checkbox" ${disabled} />
        <span class="visually-hidden">Selecionar ${activity.name}</span>
      </label>
      <span class="row-avatar ${activity.tagType}">${initials(activity.name)}</span>
      <div class="row-main">
        <div class="row-top">
          <div>
            <strong>${activity.name}</strong>
            <span>${activity.tag}</span>
          </div>
          <span class="pill ${statusClass(activity.status)} status-pill">${statusLabel(activity.status)}</span>
        </div>
        <p>"${activity.quote}"</p>
        <div class="row-meta">
          <span>${activity.block}</span>
          <span>Data: ${activity.date}</span>
        </div>
      </div>
      <div class="row-actions">
        <button class="btn-ghost" type="button" data-detail>Detalhes</button>
        ${actionButtons}
      </div>
    </article>
  `;
}

function renderRows() {
  const board = document.querySelector(".activity-board");
  const activities = EscotistaData.getActivities();
  const empty = document.getElementById("empty-state");

  allRows().forEach((row) => row.remove());
  empty.insertAdjacentHTML("beforebegin", activities.map(rowTemplate).join(""));
  bindRowEvents();
  applyFilters();
}

function applyFilters() {
  const query = document.getElementById("search").value.trim().toLowerCase();
  const status = document.getElementById("status-filter").value;
  const axis = document.getElementById("axis-filter").value;
  let matches = 0;

  allRows().forEach((row) => {
    const text = `${row.dataset.lobinho} ${row.dataset.title} ${row.dataset.description}`.toLowerCase();
    const statusMatch = status === "todos" || row.dataset.status === status;
    const axisMatch = axis === "todos" || row.dataset.eixo === axis;
    const queryMatch = !query || text.includes(query);
    const visible = statusMatch && axisMatch && queryMatch;

    row.classList.toggle("is-hidden", !visible);
    if (visible) matches += 1;
    if (!visible) row.querySelector(".row-check").checked = false;
  });

  document.getElementById("empty-state").hidden = matches > 0;
  updateSelection();
}

function approveRows(targetRows) {
  const ids = pendingOnly(targetRows).map((row) => Number(row.dataset.id));
  if (!ids.length) {
    EscotistaApp.showToast("!", "Selecione pelo menos uma atividade pendente.");
    return;
  }

  EscotistaData.updateActivityStatus(ids, "concluido");
  EscotistaApp.showToast("OK", `${ids.length} atividade${ids.length === 1 ? "" : "s"} aprovada${ids.length === 1 ? "" : "s"}.`);
  renderRows();
}

function openReject(rowsToReject) {
  const ids = pendingOnly(rowsToReject).map((row) => Number(row.dataset.id));
  if (!ids.length) {
    EscotistaApp.showToast("!", "Selecione pelo menos uma atividade pendente.");
    return;
  }
  pendingRejectRows = ids;
  document.getElementById("reject-reason").value = "";
  document.getElementById("reject-error").textContent = "";
  EscotistaApp.openModal("reject-modal");
}

function fillDetail(row) {
  document.getElementById("detail-lobinho").textContent = row.dataset.lobinho;
  document.getElementById("detail-activity").textContent = row.dataset.title;
  document.getElementById("detail-axis").textContent = axisLabels[row.dataset.eixo];
  document.getElementById("detail-date").textContent = row.dataset.date;
  document.getElementById("detail-description").textContent = row.dataset.description;
  EscotistaApp.openModal("detail-modal");
}

function bindRowEvents() {
  allRows().forEach((row) => {
    row.querySelector(".row-check").addEventListener("change", updateSelection);
    row.querySelector("[data-detail]").addEventListener("click", () => fillDetail(row));

    row.querySelectorAll("[data-row-action]").forEach((button) => {
      button.addEventListener("click", () => {
        if (button.dataset.rowAction === "approve") approveRows([row]);
        if (button.dataset.rowAction === "reject") openReject([row]);
      });
    });
  });
}

function initFilters() {
  ["search", "status-filter", "axis-filter"].forEach((id) => {
    const field = document.getElementById(id);
    field.addEventListener("input", applyFilters);
    field.addEventListener("change", applyFilters);
  });

  const params = new URLSearchParams(window.location.search);
  const axis = params.get("eixo");
  if (axis && document.querySelector(`#axis-filter option[value="${axis}"]`)) {
    document.getElementById("axis-filter").value = axis;
  }
}

function initBulkActions() {
  document.getElementById("select-all").addEventListener("change", (event) => {
    pendingOnly(visibleRows()).forEach((row) => {
      row.querySelector(".row-check").checked = event.target.checked;
    });
    updateSelection();
  });

  document.getElementById("bulk-approve").addEventListener("click", () => approveRows(selectedRows()));
  document.getElementById("bulk-reject").addEventListener("click", () => openReject(selectedRows()));
}

function initRejectForm() {
  document.getElementById("reject-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const reason = document.getElementById("reject-reason").value.trim();
    const error = document.getElementById("reject-error");

    if (!reason) {
      error.textContent = "Informe uma justificativa para rejeitar.";
      return;
    }

    EscotistaData.updateActivityStatus(pendingRejectRows, "rejeitado");
    EscotistaApp.closeModal(document.getElementById("reject-modal"));
    EscotistaApp.showToast("!", `${pendingRejectRows.length} atividade${pendingRejectRows.length === 1 ? "" : "s"} rejeitada${pendingRejectRows.length === 1 ? "" : "s"}.`);
    pendingRejectRows = [];
    renderRows();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initFilters();
  initBulkActions();
  initRejectForm();
  renderRows();
});
