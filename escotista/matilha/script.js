function cardColorClass(lobinho) {
  if (lobinho.name === "Mowgli") return "dark";
  if (lobinho.color === "teal") return "teal";
  if (lobinho.color === "green") return "red";
  return "gold";
}

function levelClass(lobinho) {
  if (lobinho.level === "SALTADOR") return "green";
  if (lobinho.level === "RASTREADOR") return "gold";
  return "blue";
}

function initials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function lobinhoCards() {
  return Array.from(document.querySelectorAll(".lobinho-card"));
}

function renderLobinhos() {
  const grid = document.getElementById("lobinhos-grid");
  grid.innerHTML = EscotistaData.lobinhos
    .map(
      (lobinho) => `
        <article
          class="lobinho-card"
          data-name="${lobinho.name}"
          data-status="${lobinho.pending > 0 ? "pendente" : "em-dia"}"
          data-progress="${lobinho.progress}"
        >
          ${lobinho.pending > 0 ? `<span class="pending-badge">${lobinho.pending} pendente${lobinho.pending === 1 ? "" : "s"}</span>` : ""}
          <span class="portrait ${cardColorClass(lobinho)}">${initials(lobinho.name)}</span>
          <h2>${lobinho.name}</h2>
          <span class="pill ${levelClass(lobinho)}">${lobinho.level}</span>
          <div class="card-progress">
            <span>Progresso</span><strong>${lobinho.progress}%</strong>
            <div class="progress-track"><div class="progress-bar" style="width: ${lobinho.progress}%"></div></div>
          </div>
          <button class="card-link" type="button" data-open-lobinho>Ver detalhes</button>
        </article>
      `,
    )
    .join("");
}

function applyLobinhoFilters() {
  const search = document.getElementById("search-lobinho").value.trim().toLowerCase();
  const status = document.getElementById("status-lobinho").value;

  lobinhoCards().forEach((card) => {
    const nameMatch = card.dataset.name.toLowerCase().includes(search);
    const statusMatch = status === "todos" || card.dataset.status === status;
    card.classList.toggle("is-hidden", !(nameMatch && statusMatch));
  });
}

function initLobinhoDetails() {
  lobinhoCards().forEach((card) => {
    card.querySelector("[data-open-lobinho]").addEventListener("click", () => {
      const name = card.dataset.name;
      const progress = card.dataset.progress;
      const status = card.dataset.status === "pendente" ? "Com atividades pendentes" : "Em dia";

      document.getElementById("detail-avatar").textContent = initials(name);
      document.getElementById("detail-name").textContent = name;
      document.getElementById("detail-status").textContent = `${status} - progresso ${progress}%`;
      document.getElementById("detail-progress").style.width = `${progress}%`;
      EscotistaApp.openModal("lobinho-modal");
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderLobinhos();
  initLobinhoDetails();

  document.getElementById("search-lobinho").addEventListener("input", applyLobinhoFilters);
  document.getElementById("status-lobinho").addEventListener("change", applyLobinhoFilters);
  document.getElementById("filter-btn").addEventListener("click", () => {
    applyLobinhoFilters();
    EscotistaApp.showToast("OK", "Filtros aplicados na matilha.");
  });
});
