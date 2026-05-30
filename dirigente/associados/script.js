// Gestão de Associados - Dirigente
const BASE_URL = 'http://localhost:8080/escoteiros-api';
let todosAssociados = [];

document.addEventListener('DOMContentLoaded', function () {
    verificarSessao();
    carregarAssociados();
});

function verificarSessao() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user || !user.role) window.location.href = '../../login/';
}

function headers() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    };
}

async function carregarAssociados() {
    const placeholder = document.querySelector('.placeholder-content-dirigente');
    placeholder.innerHTML = '<p style="color:#aaa">Carregando associados...</p>';

    try {
        const res = await fetch(`${BASE_URL}/api/associados`, { headers: headers() });
        todosAssociados = await res.json();
        renderizar(todosAssociados);
    } catch (e) {
        placeholder.innerHTML = '<p style="color:#e74c3c">Erro ao carregar associados.</p>';
    }
}

function renderizar(lista) {
    const placeholder = document.querySelector('.placeholder-content-dirigente');

    placeholder.innerHTML = `
        <style>
            .assoc-toolbar { display:flex; gap:10px; margin-bottom:16px; flex-wrap:wrap; }
            .assoc-search {
                flex:1; min-width:180px; padding:9px 13px;
                border:1px solid #ddd; border-radius:8px; font-size:14px;
            }
            .assoc-select {
                padding:9px 13px; border:1px solid #ddd;
                border-radius:8px; font-size:14px;
            }
            .assoc-btn-novo {
                background:#f0a500; color:#fff; border:none;
                padding:9px 16px; border-radius:8px; font-weight:600;
                cursor:pointer; font-size:14px;
            }
            .assoc-table { width:100%; border-collapse:collapse; background:#fff;
                border-radius:12px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.07); }
            .assoc-table th {
                background:#f8f8f8; padding:11px 14px; text-align:left;
                font-size:12px; color:#666; text-transform:uppercase; font-weight:600;
            }
            .assoc-table td { padding:11px 14px; border-bottom:1px solid #f0f0f0; font-size:14px; }
            .assoc-table tr:last-child td { border-bottom:none; }
            .badge {
                padding:2px 9px; border-radius:20px; font-size:11px;
                font-weight:600; text-transform:capitalize;
            }
            .badge-lobinho  { background:#fff3cd; color:#856404; }
            .badge-escotista{ background:#d1ecf1; color:#0c5460; }
            .badge-dirigente{ background:#d4edda; color:#155724; }
            .badge-ativo    { background:#d4edda; color:#155724; }
            .badge-inativo  { background:#f8d7da; color:#721c24; }
            .assoc-btn-del {
                background:none; border:1px solid #ddd; border-radius:6px;
                padding:3px 9px; cursor:pointer; font-size:12px;
            }
            .assoc-empty { text-align:center; padding:32px; color:#aaa; }

            .modal-overlay {
                display:none; position:fixed; inset:0;
                background:rgba(0,0,0,0.4); z-index:1000;
                align-items:center; justify-content:center;
            }
            .modal-overlay.open { display:flex; }
            .modal-box {
                background:#fff; border-radius:16px; padding:28px;
                width:100%; max-width:440px; max-height:90vh; overflow-y:auto;
            }
            .modal-box h2 { margin-bottom:18px; font-size:17px; }
            .modal-field { margin-bottom:12px; }
            .modal-field label { display:block; font-size:13px; font-weight:600; margin-bottom:3px; }
            .modal-field input, .modal-field select {
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

        <div class="assoc-toolbar">
            <input type="text" id="assoc-search" class="assoc-search" placeholder="Buscar por nome ou matrícula...">
            <select id="assoc-filtro" class="assoc-select">
                <option value="">Todos os perfis</option>
                <option value="lobinho">Lobinho</option>
                <option value="escotista">Escotista</option>
                <option value="dirigente">Dirigente</option>
            </select>
            <button class="assoc-btn-novo" onclick="abrirModal()">+ Novo</button>
        </div>

        <table class="assoc-table">
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>Matrícula</th>
                    <th>Perfil</th>
                    <th>Status</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody id="assoc-tbody">
                ${renderLinhas(lista)}
            </tbody>
        </table>

        <div class="modal-overlay" id="modal-assoc">
            <div class="modal-box">
                <h2>Novo Associado</h2>
                <div class="modal-field"><label>Nome Completo *</label><input type="text" id="m-nome"></div>
                <div class="modal-field"><label>CPF *</label><input type="text" id="m-cpf" placeholder="000.000.000-00"></div>
                <div class="modal-field"><label>Data de Nascimento *</label><input type="date" id="m-nasc"></div>
                <div class="modal-field"><label>Matrícula *</label><input type="text" id="m-matricula" placeholder="000.000-0"></div>
                <div class="modal-field"><label>Senha *</label><input type="password" id="m-senha"></div>
                <div class="modal-field"><label>Perfil *</label>
                    <select id="m-perfil">
                        <option value="lobinho">Lobinho</option>
                        <option value="escotista">Escotista</option>
                        <option value="dirigente">Dirigente</option>
                    </select>
                </div>
                <div class="modal-field"><label>Email</label><input type="email" id="m-email"></div>
                <div class="modal-footer">
                    <button class="modal-btn-cancel" onclick="fecharModal()">Cancelar</button>
                    <button class="modal-btn-save" onclick="salvarAssociado()">Salvar</button>
                </div>
            </div>
        </div>
    `;

    document.getElementById('assoc-search').addEventListener('input', filtrar);
    document.getElementById('assoc-filtro').addEventListener('change', filtrar);
}

function renderLinhas(lista) {
    if (!lista || lista.length === 0) {
        return '<tr><td colspan="5" class="assoc-empty">Nenhum associado encontrado</td></tr>';
    }
    return lista.map(a => {
        const nome = a.nomeCompleto || a.nome_completo || '–';
        return `
            <tr>
                <td>${nome}</td>
                <td>${a.matricula || '–'}</td>
                <td><span class="badge badge-${a.perfil}">${a.perfil || '–'}</span></td>
                <td><span class="badge badge-${a.status}">${a.status || 'ativo'}</span></td>
                <td><button class="assoc-btn-del" onclick="deletarAssociado('${a.id}','${nome}')">🗑️</button></td>
            </tr>
        `;
    }).join('');
}

function filtrar() {
    const busca  = document.getElementById('assoc-search').value.toLowerCase();
    const perfil = document.getElementById('assoc-filtro').value;
    const filtrado = todosAssociados.filter(a => {
        const nome = (a.nomeCompleto || a.nome_completo || '').toLowerCase();
        const mat  = (a.matricula || '').toLowerCase();
        return (!busca || nome.includes(busca) || mat.includes(busca))
            && (!perfil || a.perfil === perfil);
    });
    document.getElementById('assoc-tbody').innerHTML = renderLinhas(filtrado);
}

function abrirModal() {
    document.getElementById('modal-assoc').classList.add('open');
}

function fecharModal() {
    document.getElementById('modal-assoc').classList.remove('open');
}

async function salvarAssociado() {
    const nome      = document.getElementById('m-nome').value.trim();
    const cpf       = document.getElementById('m-cpf').value.trim();
    const matricula = document.getElementById('m-matricula').value.trim();
    const senha     = document.getElementById('m-senha').value.trim();
    const perfil    = document.getElementById('m-perfil').value;
    const nasc      = document.getElementById('m-nasc').value;
    const email     = document.getElementById('m-email').value.trim();

    if (!nome || !cpf || !matricula || !senha || !nasc) {
        alert('Preencha os campos obrigatórios (*)');
        return;
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    try {
        const res = await fetch(`${BASE_URL}/api/associados`, {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify({
                nomeCompleto: nome, cpf, matricula, senha,
                perfil, dataNascimento: nasc,
                email: email || null, status: 'ativo',
                grupoEscoteiroId: user.grupoId || null,
            })
        });
        if (!res.ok) { const e = await res.json(); throw new Error(e.erro || 'Erro'); }
        fecharModal();
        carregarAssociados();
    } catch (e) {
        alert('Erro: ' + e.message);
    }
}

async function deletarAssociado(id, nome) {
    if (!confirm(`Remover "${nome}"?`)) return;
    try {
        await fetch(`${BASE_URL}/api/associados/${id}`, { method: 'DELETE', headers: headers() });
        carregarAssociados();
    } catch (e) {
        alert('Erro ao remover');
    }
}

window.TelaGestaoAssociadosDirigente = { carregarAssociados };
