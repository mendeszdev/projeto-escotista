requireAuth('escotista');

/* dashboard-escotista.js */

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

async function handleAction(btn, action) {
  const item          = btn.closest(".activity-item");
  const name          = item.querySelector(".activity-name").textContent.trim();
  const atribuicaoId  = item.dataset.atribuicaoId;
  const novoStatus    = action === "aprovada" ? "aprovado" : "rejeitado";
  const emoji         = action === "aprovada" ? "✅" : "❌";

  if (atribuicaoId && typeof API !== 'undefined') {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      await API.atribuicoes.update(atribuicaoId, { status: novoStatus, validadoPor: user.id });
    } catch (err) {
      console.error('[Dashboard] Erro ao atualizar atribuição:', err);
    }
  }

  item.style.transition = "opacity .4s, transform .4s";
  item.style.opacity = "0";
  item.style.transform = "translateX(30px)";

  setTimeout(() => {
    item.remove();
    showToast(emoji, `Atividade de ${name} ${action}!`);
  }, 400);
}

/* ─────────────────────────────────────────
   CARGA DAS ATIVIDADES PENDENTES
───────────────────────────────────────── */
async function loadAtividadesPendentes() {
  if (typeof API === 'undefined') return;

  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) return;

    const vinculos = await API.escotistaAlcateia.listByAssociado(user.id);
    if (!vinculos.length) return;

    const atribuicoes = await API.atribuicoes.list({ status: 'pendente' });
    const container   = document.querySelector('.activities-list, .activity-list, .pending-list');
    if (!container || !atribuicoes.length) return;

    container.innerHTML = '';
    atribuicoes.forEach(a => {
      const item = document.createElement('div');
      item.className = 'activity-item';
      item.dataset.atribuicaoId = a.id;
      item.innerHTML = `
        <div class="activity-info">
          <span class="activity-name">${a.associadoNome || a.associadoId || '—'}</span>
          <span class="activity-desc">${a.atividadeNome || '—'}</span>
        </div>
        <div class="activity-actions">
          <button onclick="handleAction(this,'aprovada')">✅ Aprovar</button>
          <button onclick="handleAction(this,'rejeitada')">❌ Rejeitar</button>
        </div>
      `;
      container.appendChild(item);
    });

  } catch (err) {
    console.error('[Dashboard] Erro ao carregar atividades:', err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadAtividadesPendentes();
});