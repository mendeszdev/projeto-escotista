let pendingRejectId = null;

function initials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function pendingActivities() {
  return window.EscotistaData ? EscotistaData.getPendingActivities() : [];
}

function renderPendingActivities() {
  const list = document.getElementById("activities-list");
  const activities = pendingActivities();
  const count = activities.length;

  document.getElementById("pending-count").textContent = String(count);
  document.getElementById("see-all-link").textContent = `Ver todas as ${count} pendencia${count === 1 ? "" : "s"}`;

  if (!count) {
    list.innerHTML = `
      <div class="empty-dashboard-state">
        <div class="empty-icon">OK</div>
        <strong>Tudo validado!</strong>
        <span>Nenhuma atividade pendente no momento.</span>
      </div>
    `;
    return;
  }

  list.innerHTML = activities
    .slice(0, 2)
    .map(
      (activity) => `
        <article
          class="activity-item"
          data-id="${activity.id}"
          data-name="${activity.name}"
          data-activity="${activity.tag}"
          data-description="${activity.quote}"
          data-block="${activity.block}"
          data-date="${activity.date}"
        >
          <button class="activity-summary" type="button" data-open-details>
            <span class="activity-avatar ${activity.tagType}">${initials(activity.name)}</span>
            <span class="activity-copy">
              <span class="activity-top">
                <span>
                  <strong>${activity.name}</strong>
                  <span class="pill ${activity.tagType}">${activity.tag}</span>
                </span>
                <small>${activity.time}</small>
              </span>
              <span class="activity-quote">"${activity.quote}"</span>
            </span>
          </button>
          <div class="activity-actions">
            <button class="btn-secondary" type="button" data-action="approve">Aprovar</button>
            <button class="btn-outline" type="button" data-action="reject">Rejeitar</button>
          </div>
        </article>
      `,
    )
    .join("");

  bindPendingActivityEvents();
}

function setActivityStatus(id, status) {
  EscotistaData.updateActivityStatus(Number(id), status);
  renderPendingActivities();
}

function fillDetails(item) {
  document.getElementById("modal-name").textContent = item.dataset.name;
  document.getElementById("modal-block").textContent = item.dataset.block;
  document.getElementById("modal-date").textContent = item.dataset.date;
  document.getElementById("modal-description").textContent = item.dataset.description;
  EscotistaApp.openModal("activity-modal");
}

function bindPendingActivityEvents() {
  document.querySelectorAll(".activity-item").forEach((item) => {
    item.querySelector("[data-open-details]").addEventListener("click", () => fillDetails(item));

    item.querySelectorAll("[data-action]").forEach((button) => {
      button.addEventListener("click", () => {
        if (button.dataset.action === "approve") {
          setActivityStatus(item.dataset.id, "concluido");
          EscotistaApp.showToast("OK", `Atividade de ${item.dataset.name} aprovada.`);
          return;
        }

        pendingRejectId = Number(item.dataset.id);
        document.getElementById("reject-reason").value = "";
        document.getElementById("reject-error").textContent = "";
        EscotistaApp.openModal("reject-modal");
      });
    });
  });
}

function initRejectForm() {
  const form = document.getElementById("reject-form");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const reason = document.getElementById("reject-reason").value.trim();
    const error = document.getElementById("reject-error");

    if (!reason) {
      error.textContent = "A justificativa e obrigatoria para rejeitar.";
      return;
    }

    if (pendingRejectId) {
      setActivityStatus(pendingRejectId, "rejeitado");
      pendingRejectId = null;
    }
    EscotistaApp.closeModal(document.getElementById("reject-modal"));
    EscotistaApp.showToast("!", "Atividade rejeitada.");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderPendingActivities();
  initRejectForm();

  document.getElementById("congrats-btn").addEventListener("click", () => {
    EscotistaApp.showToast("OK", "Parabens enviados para Bia Oliveira.");
  });
});
