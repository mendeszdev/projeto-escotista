requireAuth('lobinho');

/* minha-jangal-blocos.js */

const _eixoId = sessionStorage.getItem('selectedEixo');

document.addEventListener('DOMContentLoaded', async function() {
  initializeEvents();
  await loadBlocos();
});

/* ─────────────────────────────────────────
   BLOCOS — carrega da API pelo eixoId
───────────────────────────────────────── */
async function loadBlocos() {
  if (typeof API === 'undefined' || !_eixoId) return;

  try {
    const blocos = await API.blocoAprendizagem.listByEixo(_eixoId);
    const container = document.querySelector('.blocos-grid, .blocos-list, main .content');
    if (!container || !blocos.length) return;

    /* Atualiza cards existentes se houver, ou cria novos */
    const cards = container.querySelectorAll('.bloco-card, [data-block]');
    if (cards.length >= blocos.length) {
      blocos.forEach((bloco, i) => {
        const card = cards[i];
        if (!card) return;
        card.dataset.block = bloco.id;
        const nomeEl = card.querySelector('h3, .bloco-nome, .card-title');
        if (nomeEl) nomeEl.textContent = bloco.nome;
        const descEl = card.querySelector('p, .bloco-desc, .card-desc');
        if (descEl) descEl.textContent = bloco.descricao || '';
        const btn = card.querySelector('.btn-registrar-atividade, button');
        if (btn) btn.dataset.block = bloco.id;
      });
    }
  } catch (err) {
    console.error('[Blocos] Erro ao carregar:', err.message);
  }
}

/* ─────────────────────────────────────────
   EVENTOS
───────────────────────────────────────── */
function initializeEvents() {
  document.getElementById('btnProfile')?.addEventListener('click', () => {
    window.location.href = '../perfil-usuario/';
  });

  document.getElementById('btnShare')?.addEventListener('click', () => {
    if (navigator.share) navigator.share({ title: 'Minha Jângal - Blocos', url: window.location.href });
  });

  /* Delegação — funciona tanto para cards originais quanto para cards atualizados pela API */
  document.addEventListener('click', e => {
    const btn = e.target.closest('.btn-registrar-atividade');
    if (!btn) return;
    e.preventDefault();
    const blockId   = btn.dataset.block || btn.closest('[data-block]')?.dataset.block;
    const blockName = btn.closest('.bloco-card, [data-block]')?.querySelector('h3, .bloco-nome')?.textContent || 'Bloco';
    showRegistroModal(blockId, blockName);
  });
}

/* ─────────────────────────────────────────
   MODAL + SUBMIT
───────────────────────────────────────── */
function showRegistroModal(blockId, blockName) {
  const existing = document.getElementById('_blocos-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = '_blocos-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:1000';
  modal.innerHTML = `
    <div style="background:#fff;border-radius:12px;padding:28px;max-width:480px;width:90%">
      <h2 style="margin:0 0 8px;color:#865c00">Registrar Atividade</h2>
      <p style="color:#666;margin:0 0 16px"><strong>Bloco:</strong> ${blockName}</p>
      <div style="margin-bottom:12px">
        <label style="display:block;font-weight:600;margin-bottom:4px;font-size:14px">Descrição *</label>
        <textarea id="descricaoAtividade" rows="4" placeholder="Descreva o que você fez..." style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;font-size:14px;box-sizing:border-box;resize:vertical"></textarea>
      </div>
      <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px">
        <button id="_modal-cancel" style="background:#f0f0f0;border:none;padding:9px 16px;border-radius:8px;font-weight:600;cursor:pointer">Cancelar</button>
        <button id="_modal-submit" style="background:#865c00;color:#fff;border:none;padding:9px 16px;border-radius:8px;font-weight:600;cursor:pointer">Registrar</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  modal.querySelector('#_modal-cancel').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  modal.querySelector('#_modal-submit').addEventListener('click', () => submitRegistro(blockId, blockName, modal));
}

async function submitRegistro(blocoId, blockName, modal) {
  const descricao = document.getElementById('descricaoAtividade')?.value.trim();
  if (!descricao) { alert('Informe a descrição da atividade.'); return; }

  if (typeof API === 'undefined') {
    alert('API não disponível.');
    return;
  }

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  try {
    const acoes = await API.acoesEducativas.listByBloco(blocoId);
    if (!acoes || acoes.length === 0) {
      alert(`Nenhuma ação educativa cadastrada no bloco "${blockName}".`);
      modal.remove();
      return;
    }

    await API.atribuicoes.create({
      atividadeId:       acoes[0].id,
      associadoId:       user.id,
      status:            'pendente',
      descricaoRegistro: descricao,
    });

    modal.remove();
    alert('Atividade registrada com sucesso! Aguarde a aprovação do escotista.');
  } catch (err) {
    console.error('[Blocos] Erro ao registrar:', err);
    alert('Erro ao registrar atividade: ' + err.message);
  }
}