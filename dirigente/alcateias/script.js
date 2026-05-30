// Gestão de Alcatéias - Dirigente
const API = 'http://localhost:8080';

document.addEventListener('DOMContentLoaded', function () {
    verificarSessao();
    carregarAlcateias();
});

function verificarSessao() {
    const user = JSON.parse(localStorage.getItem('user_data') || '{}');
    if (!user || !user.role) window.location.href = '../../login/';
}

function headers() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    };
}

async function carregarAlcateias() {
    const placeholder = document.querySelector('.placeholder-content-dirigente');
    placeholder.innerHTML = '<p style="color:#aaa">Carregando alcatéias...</p>';

    try {
        const res = await fetch(`${API}/api/alcateias`, { headers: headers() });
        const alcateias = await res.json();
        renderizar(alcateias);
    } catch (e) {
        placeholder.innerHTML = '<p style="color:#e74c3c">Erro ao carregar alcatéias.</p>';
    }
}

function renderizar(alcateias) {
    const placeholder = document.querySelector('.placeholder-content-dirigente');

    placeholder.innerHTML = `
        <style>
            .alc-toolbar { margin-bottom:16px; }
            .alc-btn-nova {
                background:#f0a500; color:#fff; border:none;
                padding:9px 16px; border-radius:8px; font-weight:600; cursor:pointer;
            }
            .alc-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(240px,1fr)); gap:14px; }
            .alc-card {
                background:#fff; border-radius:14px; padding:18px;
                box-shadow:0 2px 8px rgba(0,0,0,0.07);
            }
            .alc-icon { font-size:28px; margin-bottom:8px; }
            .alc-nome { font-weight:700; font-size:15px; color:#1a1a2e; margin-bottom:4px; }
            .alc-desc { font-size:13px; color:#888; margin-bottom:12px; }
            .alc-badge {
                font-size:11px; padding:2px 8px; border-radius:20px;
                background:#d4edda; color:#155724; font-weight:600;
            }
            .alc-actions { display:flex; gap:8px; margin-top:12px; }
            .alc-btn {
                flex:1; padding:7px; border:1px solid #ddd; border-radius:8px;
                background:none; cursor:pointer; font-size:13px; font-weight:600;
            }
            .alc-btn:hover { background:#f5f5f5; }
            .alc-empty { text-align:center; padding:40px; color:#aaa; font-size:14px; }

            /* Modal */
            .modal-overlay {
                display:none; position:fixed; inset:0;
                background:rgba(0,0,0,0.4); z-index:1000;
                align-items:center; justify-content:center;
            }
            .modal-overlay.open { display:flex; }
            .modal-box {
                background:#fff; border-radius:16px; padding:28px;
                width:100%; max-width:400px;
            }
            .modal-box h2 { margin-bottom:18px; font-size:17px; }
            .modal-field { margin-bottom:12px; }
            .modal-field label { display:block; font-size:13px; font-weight:600; margin-bottom:3px; }
            .modal-field input {
                width:100%; padding:9px 12px; border:1px solid #ddd;
                border-radius:8px; font-size:14px; box-sizing:border-box;
            }
            .modal-footer { display:flex; gap:10px; justify-content:flex-end; margin-top:18px; }
            .modal-btn-cancel {
                background:#f0f0f0; color:#333; border:none;
                padding:9px 16px; border-radius:8px; font-weight:600; cursor:pointer;
            }
            .modal-btn-save {
                background:#f0a500; color:#fff; border:none;
                padding:9px 16px; border-radius:8px; font-weight:600; cursor:pointer;
            }
        </style>

        <div class="alc-toolbar">
            <button class="alc-btn-nova" onclick="abrirModal()">+ Nova Alcateia</button>
        </div>

        <div class="alc-grid">
            ${alcateias.length === 0
                ? '<div class="alc-empty">Nenhuma alcateia cadastrada ainda</div>'
                : alcateias.map(a => `
                    <div class="alc-card">
                        <div class="alc-icon">🐾</div>
                        <div class="alc-nome">${a.nome || '–'}</div>
                        <div class="alc-desc">${a.descricao || 'Sem descrição'}</div>
                        <span class="alc-badge">${a.status || 'ativo'}</span>
                        <div class="alc-actions">
                            <button class="alc-btn" onclick="verMatilhas('${a.id}')">🐺 Matilhas</button>
                            <button class="alc-btn" onclick="deletarAlcateia('${a.id}','${a.nome}')">🗑️</button>
                        </div>
                    </div>
                `).join('')
            }
        </div>

        <!-- Modal -->
        <div class="modal-overlay" id="modal-alc">
            <div class="modal-box">
                <h2>Nova Alcateia</h2>
                <div class="modal-field"><label>Nome *</label><input type="text" id="alc-nome" placeholder="Ex: Alcateia dos Lobos"></div>
                <div class="modal-field"><label>Descrição</label><input type="text" id="alc-desc"></div>
                <div class="modal-footer">
                    <button class="modal-btn-cancel" onclick="fecharModal()">Cancelar</button>
                    <button class="modal-btn-save" onclick="salvarAlcateia()">Salvar</button>
                </div>
            </div>
        </div>
    `;
}

function abrirModal() {
    document.getElementById('modal-alc').classList.add('open');
    document.getElementById('alc-nome').value = '';
    document.getElementById('alc-desc').value = '';
}

function fecharModal() {
    document.getElementById('modal-alc').classList.remove('open');
}

async function salvarAlcateia() {
    const nome  = document.getElementById('alc-nome').value.trim();
    const desc  = document.getElementById('alc-desc').value.trim();
    if (!nome) { alert('Informe o nome da alcateia'); return; }

    const user = JSON.parse(localStorage.getItem('user_data') || '{}');

    try {
        const res = await fetch(`${API}/api/alcateias`, {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify({
                nome, descricao: desc || null,
                status: 'ativo',
                grupoEscotelroId: user.grupoId || null
            })
        });
        if (!res.ok) { const e = await res.json(); throw new Error(e.erro || 'Erro'); }
        fecharModal();
        carregarAlcateias();
    } catch (e) {
        alert('Erro: ' + e.message);
    }
}

async function deletarAlcateia(id, nome) {
    if (!confirm(`Remover alcateia "${nome}"?`)) return;
    try {
        await fetch(`${API}/api/alcateias/${id}`, { method: 'DELETE', headers: headers() });
        carregarAlcateias();
    } catch (e) {
        alert('Erro ao remover');
    }
}

function verMatilhas(id) {
    alert('Gestão de matilhas em desenvolvimento — ID: ' + id);
}

window.TelaGestaoAlcateiasDirigente = { carregarAlcateias };
