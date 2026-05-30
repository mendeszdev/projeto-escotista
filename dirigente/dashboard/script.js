// Dashboard Estratégico - Dirigente
const API = 'http://localhost:8080';

document.addEventListener('DOMContentLoaded', function () {
    verificarSessao();
    carregarDashboard();
    configurarNavegacao();
});

function configurarNavegacao() {
    const navItems = document.querySelectorAll('.nav-label');
    navItems.forEach(item => {
        item.parentElement.addEventListener('click', function(e) {
            e.preventDefault();
            const label = item.textContent.trim();
            if (label === 'Dashboard')   window.location.href = '../dashboard/';
            if (label === 'Associados')  window.location.href = '../associados/';
            if (label === 'Alcatéias')   window.location.href = '../alcateias/';
            if (label === 'Perfil')      window.location.href = '../perfil/';
            if (label === 'Sistema')     window.location.href = '../sistema/';
            if (label === 'Sair')        logout();
        });
    });
}

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

async function carregarDashboard() {
    const placeholder = document.querySelector('.placeholder-content-dirigente');
    placeholder.innerHTML = '<p style="color:#aaa">Carregando dados...</p>';

    let associados = [], alcateias = [], atividades = [];

    try {
        const [resA, resAl, resAt] = await Promise.all([
            fetch(`${API}/api/associados`, { headers: headers() }),
            fetch(`${API}/api/alcateias`, { headers: headers() }),
            fetch(`${API}/api/atividades`, { headers: headers() }),
        ]);
        associados  = await resA.json();
        alcateias   = await resAl.json();
        atividades  = await resAt.json();
    } catch (e) {
        placeholder.innerHTML = '<p style="color:#e74c3c">Erro ao conectar com a API.</p>';
        return;
    }

    const lobinhos   = associados.filter(a => a.perfil === 'lobinho').length;
    const escotistas = associados.filter(a => a.perfil === 'escotista').length;
    const recentes   = associados.slice(0, 5);

    placeholder.innerHTML = `
        <style>
            .dash-stats { display:flex; gap:12px; flex-wrap:wrap; margin-bottom:24px; }
            .dash-card {
                flex:1; min-width:120px; background:#fff;
                border-radius:12px; padding:16px 20px;
                box-shadow:0 2px 8px rgba(0,0,0,0.07);
            }
            .dash-card-valor { font-size:28px; font-weight:700; color:#1a1a2e; }
            .dash-card-label { font-size:12px; color:#888; margin-top:2px; }
            .dash-card-icon  { font-size:22px; margin-bottom:6px; }
            .dash-section-title { font-weight:700; font-size:15px; margin-bottom:10px; color:#1a1a2e; }
            .dash-lista { background:#fff; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.07); overflow:hidden; }
            .dash-item { display:flex; align-items:center; gap:10px; padding:10px 16px; border-bottom:1px solid #f0f0f0; }
            .dash-item:last-child { border-bottom:none; }
            .dash-avatar {
                width:34px; height:34px; border-radius:50%;
                background:#f0a500; color:#fff; font-weight:700;
                display:flex; align-items:center; justify-content:center; font-size:13px;
            }
            .dash-nome { font-size:14px; font-weight:600; color:#1a1a2e; }
            .dash-badge {
                margin-left:auto; font-size:11px; padding:2px 8px;
                border-radius:20px; background:#d4edda; color:#155724;
                text-transform:capitalize;
            }
            .dash-empty { padding:20px; text-align:center; color:#aaa; font-size:13px; }
        </style>

        <!-- Cards de estatísticas -->
        <div class="dash-stats">
            <div class="dash-card">
                <div class="dash-card-icon">👥</div>
                <div class="dash-card-valor">${associados.length}</div>
                <div class="dash-card-label">Associados</div>
            </div>
            <div class="dash-card">
                <div class="dash-card-icon">🐺</div>
                <div class="dash-card-valor">${lobinhos}</div>
                <div class="dash-card-label">Lobinhos</div>
            </div>
            <div class="dash-card">
                <div class="dash-card-icon">🏕️</div>
                <div class="dash-card-valor">${alcateias.length}</div>
                <div class="dash-card-label">Alcatéias</div>
            </div>
            <div class="dash-card">
                <div class="dash-card-icon">🎯</div>
                <div class="dash-card-valor">${atividades.length}</div>
                <div class="dash-card-label">Atividades</div>
            </div>
            <div class="dash-card">
                <div class="dash-card-icon">🧭</div>
                <div class="dash-card-valor">${escotistas}</div>
                <div class="dash-card-label">Escotistas</div>
            </div>
        </div>

        <!-- Associados recentes -->
        <div class="dash-section-title">Associados Recentes</div>
        <div class="dash-lista">
            ${recentes.length === 0
                ? '<div class="dash-empty">Nenhum associado cadastrado ainda</div>'
                : recentes.map(a => {
                    const nome = a.nomeCompleto || a.nome_completo || '?';
                    return `
                        <div class="dash-item">
                            <div class="dash-avatar">${nome[0].toUpperCase()}</div>
                            <span class="dash-nome">${nome}</span>
                            <span class="dash-badge">${a.perfil || '–'}</span>
                        </div>
                    `;
                }).join('')
            }
        </div>
    `;
}

function logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    window.location.href = '../../login/';
}

window.TelaDashboardDirigente = { carregarDashboard };
