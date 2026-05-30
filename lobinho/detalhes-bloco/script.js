requireAuth('lobinho');

/* detalhes-bloco.js */

document.addEventListener('DOMContentLoaded', async function() {
  await loadBlockDetails();
  setupEventListeners();
});

/* ─────────────────────────────────────────
   CARREGAMENTO — bloco via sessionStorage
───────────────────────────────────────── */
async function loadBlockDetails() {
  if (typeof API === 'undefined') return;

  try {
    const blocoId = sessionStorage.getItem('selectedBloco');
    if (!blocoId) return;

    const [bloco, acoes] = await Promise.all([
      API.blocoAprendizagem.getById(blocoId),
      API.acoesEducativas.listByBloco(blocoId),
    ]);

    /* Título do bloco */
    const titleEl = document.querySelector('.block-title, h1, .hero-title');
    if (titleEl && bloco.nome) titleEl.textContent = bloco.nome;

    const descEl = document.querySelector('.block-desc, .hero-subtitle, .block-description');
    if (descEl && bloco.descricao) descEl.textContent = bloco.descricao;

    /* Lista de ações educativas */
    const container = document.querySelector('.activities-list, .acoes-lista, .block-activities');
    if (container && acoes.length > 0) {
      container.innerHTML = acoes.map(acao => `
        <div class="activity-card" data-activity="${acao.id}" style="background:#fff;border-radius:12px;padding:16px;margin-bottom:12px;box-shadow:0 2px 8px rgba(0,0,0,.07)">
          <h3 style="margin:0 0 4px;font-size:15px">${acao.nome || '—'}</h3>
          <p style="margin:0 0 12px;color:#777;font-size:13px">${acao.descricao || ''}</p>
          <button class="btn-registrar-atividade" data-activity="${acao.id}" style="background:#237329;color:#fff;border:none;padding:8px 16px;border-radius:8px;cursor:pointer;font-weight:600;font-size:14px">
            Registrar Atividade
          </button>
        </div>
      `).join('');
    }

  } catch (err) {
    console.error('[DetalheBloco] Erro ao carregar:', err);
  }
}

/* ─────────────────────────────────────────
   EVENTOS
───────────────────────────────────────── */
function setupEventListeners() {
  document.getElementById('btnShare')?.addEventListener('click', async () => {
    try {
      if (navigator.share) await navigator.share({ url: window.location.href });
    } catch (err) {
      if (err.name !== 'AbortError') console.error(err);
    }
  });

  document.getElementById('btnProfile')?.addEventListener('click', () => {
    window.location.href = '../perfil-usuario/';
  });

  /* Delegação — funciona com ações carregadas dinamicamente */
  document.addEventListener('click', e => {
    const btn = e.target.closest('.btn-registrar-atividade');
    if (!btn) return;
    const acaoId = btn.dataset.activity;
    openActivityModal(acaoId, btn.closest('.activity-card')?.querySelector('h3')?.textContent || 'Atividade');
  });
}

/* ─────────────────────────────────────────
   MODAL + REGISTRO
───────────────────────────────────────── */
function openActivityModal(acaoEducativaId, activityTitle) {
  const existing = document.getElementById('_bloco-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = '_bloco-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:1000';
  modal.innerHTML = `
    <div style="background:#fff;border-radius:12px;padding:28px;max-width:440px;width:90%">
      <h2 style="margin:0 0 8px;color:#237329">Registrar Atividade</h2>
      <p style="color:#555;margin:0 0 16px"><strong>${activityTitle}</strong></p>
      <div style="margin-bottom:12px">
        <label style="display:block;font-weight:600;margin-bottom:4px;font-size:14px">Descrição *</label>
        <textarea id="descricaoRegistro" rows="4" placeholder="Descreva como você realizou esta atividade..." style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;font-size:14px;box-sizing:border-box;resize:vertical"></textarea>
      </div>
      <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px">
        <button id="_bloco-cancel" style="background:#f0f0f0;border:none;padding:9px 16px;border-radius:8px;font-weight:600;cursor:pointer">Cancelar</button>
        <button id="_bloco-submit" style="background:#237329;color:#fff;border:none;padding:9px 16px;border-radius:8px;font-weight:600;cursor:pointer">Registrar</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  modal.querySelector('#_bloco-cancel').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  modal.querySelector('#_bloco-submit').addEventListener('click', () => registerActivity(acaoEducativaId, modal));
}

async function registerActivity(acaoEducativaId, modal) {
  const descricao = document.getElementById('descricaoRegistro')?.value.trim();
  if (!descricao) { alert('Informe a descrição da atividade.'); return; }
  if (typeof API === 'undefined') { alert('API não disponível.'); return; }

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  try {
    /* Buscar ou criar atividade para essa ação educativa */
    const atividades = await API.atividades.list();
    let atividadeId = atividades.find(a => a.acaoEducativaId === acaoEducativaId)?.id;

    if (!atividadeId) {
      const nova = await API.atividades.create({
        acaoEducativaId,
        alcateiaId:    user.alcateiaId || null,
        criadoPor:     user.id,
        ePersonalizada: false,
      });
      atividadeId = nova?.id;
    }

    if (!atividadeId) throw new Error('Não foi possível obter a atividade.');

    await API.atribuicoes.create({
      atividadeId,
      associadoId:       user.id,
      status:            'pendente',
      descricaoRegistro: descricao,
    });

    modal.remove();
    alert('Atividade registrada! Aguarde a aprovação do escotista.');

  } catch (err) {
    console.error('[DetalheBloco] Erro ao registrar:', err);
    alert('Erro ao registrar atividade: ' + err.message);
  }
}