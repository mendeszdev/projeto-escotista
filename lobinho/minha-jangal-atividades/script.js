requireAuth('lobinho');

/* minha-jangal-atividades.js */

document.addEventListener('DOMContentLoaded', async function() {
  initializeEvents();
  await loadEixos();
});

/* ─────────────────────────────────────────
   EIXOS — carrega da API e atualiza DOM
───────────────────────────────────────── */
async function loadEixos() {
  if (typeof API === 'undefined') return;

  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [eixos, progressoes] = await Promise.all([
      API.eixos.list(),
      user.id ? API.progressoes.listByAssociado(user.id) : Promise.resolve([]),
    ]);

    const cards = document.querySelectorAll('.eixo-card');

    if (cards.length > 0 && eixos.length > 0) {
      eixos.forEach((eixo, i) => {
        const card = cards[i];
        if (!card) return;
        card.dataset.eixoId = eixo.id;

        const prog = progressoes.find(p => p.eixoId === eixo.id);
        const pct  = prog ? `${Math.round(prog.percentualConcluido)}%` : '0%';

        const nomeEl = card.querySelector('.eixo-nome, h3, .card-title');
        if (nomeEl) nomeEl.textContent = eixo.nome;

        const progEl = card.querySelector('.eixo-progresso, .progress-text, .card-progress');
        if (progEl) progEl.textContent = pct;

        const barEl = card.querySelector('.progress-bar-fill, .progress-fill, [style*="width"]');
        if (barEl) barEl.style.width = pct;
      });
    }

    /* Reanexar eventos de clique com UUIDs reais */
    cards.forEach(card => {
      card.addEventListener('click', function() {
        const eixoId = this.dataset.eixoId;
        if (eixoId) {
          sessionStorage.setItem('selectedEixo', eixoId);
          window.location.href = '../minha-jangal-blocos/';
        }
      });
    });

  } catch (err) {
    console.error('[Eixos] Erro ao carregar:', err.message);
  }
}

/* ─────────────────────────────────────────
   EVENTOS
───────────────────────────────────────── */
function initializeEvents() {
  document.getElementById('btnProfile')?.addEventListener('click', () => {
    window.location.href = '../perfil-usuario/';
  });

  document.getElementById('btnVerMissoes')?.addEventListener('click', e => {
    e.preventDefault();
    showMissoesModal();
  });

  document.getElementById('btnShare')?.addEventListener('click', () => {
    if (navigator.share) {
      navigator.share({ title: 'Minha Jângal', url: window.location.href });
    }
  });
}

function showMissoesModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:1000';
  modal.innerHTML = `
    <div style="background:#fff;border-radius:12px;padding:28px;max-width:440px;width:90%">
      <h2 style="margin:0 0 12px;color:#865c00">Próxima Especialidade</h2>
      <p style="color:#555;margin:0 0 8px">Você está a apenas <strong>2 passos</strong> de conquistar o distintivo de <strong>Amigo das Árvores</strong>!</p>
      <button onclick="this.closest('.modal-overlay').remove()" style="margin-top:16px;background:#865c00;color:#fff;border:none;padding:8px 20px;border-radius:6px;cursor:pointer;font-weight:600">Fechar</button>
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}