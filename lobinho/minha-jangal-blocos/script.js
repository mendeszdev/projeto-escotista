requireAuth('lobinho');

/**
 * MINHA JÂNGAL - BLOCOS DE EIXO
 * Script para gerenciar a tela de blocos de aprendizagem
 */

// ============================================
// ESTADO DA PÁGINA
// ============================================

const pageState = {
    eixoSelecionado: sessionStorage.getItem('selectedEixo') || 1,
    blocos: [
        {
            id: 1,
            nome: 'Cuidado com o corpo',
            descricao: 'Aprenda sobre higiene, exercícios e como manter sua "máquina" funcionando perfeitamente.',
            cor: 'green'
        },
        {
            id: 2,
            nome: 'Espiritualidade',
            descricao: 'Conecte-se com seus valores, com a natureza e encontre seu momento de paz interior.',
            cor: 'yellow'
        },
        {
            id: 3,
            nome: 'Hábitos saudáveis',
            descricao: 'Comer bem e dormir o suficiente são superpoderes que te dão energia para a caçada.',
            cor: 'blue'
        },
        {
            id: 4,
            nome: 'Intelectual',
            descricao: 'Alimente sua curiosidade e mantenha o cérebro ativo. Aprender é a melhor forma de expandir seus horizontes.',
            cor: 'green'
        },
        {
            id: 5,
            nome: 'Vínculos saudáveis',
            descricao: 'Fazer amigos e cuidar da família é a melhor parte de viver na nossa alcateia.',
            cor: 'yellow'
        }
    ]
};

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Página Minha Jângal - Blocos de Eixo carregada');
    initializeEvents();
});

// ============================================
// FUNÇÕES DE EVENTOS
// ============================================

function initializeEvents() {
    // Botão de perfil
    const btnProfile = document.getElementById('btnProfile');
    if (btnProfile) {
        btnProfile.addEventListener('click', function() {
            window.location.href = '../perfil-usuario/';
        });
    }
    
    // Botões de registrar atividade
    const btnRegistrar = document.querySelectorAll('.btn-registrar-atividade');
    btnRegistrar.forEach((btn) => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const blockId = this.getAttribute('data-block');
            const blockName = pageState.blocos[blockId - 1].nome;
            showRegistroModal(blockId, blockName);
        });
    });
    
    // Botão de compartilhar
    const btnShare = document.getElementById('btnShare');
    if (btnShare) {
        btnShare.addEventListener('click', function() {
            if (navigator.share) {
                navigator.share({
                    title: 'Minha Jângal - Blocos de Eixo',
                    text: 'Confira meu progresso nos blocos de aprendizagem!',
                    url: window.location.href
                });
            } else {
                alert('Compartilhamento não suportado neste navegador');
            }
        });
    }
}

// ============================================
// FUNÇÕES DE MODAL
// ============================================

function showRegistroModal(blockId, blockName) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Registrar Atividade</h2>
                <button class="modal-close">✕</button>
            </div>
            <div class="modal-body">
                <p><strong>Bloco:</strong> ${blockName}</p>
                <form id="registroForm">
                    <div class="form-group">
                        <label for="dataAtividade">Data da Atividade:</label>
                        <input type="date" id="dataAtividade" required />
                    </div>
                    <div class="form-group">
                        <label for="descricaoAtividade">Descrição:</label>
                        <textarea id="descricaoAtividade" rows="4" placeholder="Descreva o que você fez..." required></textarea>
                    </div>
                    <div class="form-group">
                        <label for="evidenciaAtividade">Evidência (opcional):</label>
                        <input type="file" id="evidenciaAtividade" accept="image/*" />
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn-modal-cancel">Cancelar</button>
                <button class="btn-modal-submit">Registrar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const closeBtn = modal.querySelector('.modal-close');
    const cancelBtn = modal.querySelector('.btn-modal-cancel');
    const submitBtn = modal.querySelector('.btn-modal-submit');
    
    closeBtn.addEventListener('click', () => modal.remove());
    cancelBtn.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
    
    submitBtn.addEventListener('click', () => {
        submitRegistro(blockId, blockName, modal);
    });
}

function submitRegistro(blockId, blockName, modal) {
    const data = new Date(document.getElementById('dataAtividade').value).toLocaleDateString('pt-BR');
    const descricao = document.getElementById('descricaoAtividade').value;
    
    console.log(`📝 Atividade registrada:`, {
        bloco: blockName,
        data: data,
        descricao: descricao
    });
    
    // TODO: Enviar para API
    // await fetch('/api/atividades', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //         blocoId: blockId,
    //         data: data,
    //         descricao: descricao
    //     })
    // });
    
    alert('✅ Atividade registrada com sucesso!');
    modal.remove();
}

// ============================================
// ESTILOS DO MODAL
// ============================================

const modalStyles = `
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }
    .modal-content {
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        max-width: 500px;
        width: 90%;
    }
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid #e0e0e0;
    }
    .modal-header h2 {
        margin: 0;
        font-family: 'Bree Serif', serif;
        color: #865c00;
    }
    .modal-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #999;
    }
    .modal-body {
        padding: 1.5rem;
    }
    .modal-body p {
        margin: 0 0 1rem 0;
        font-family: 'Open Sans', sans-serif;
        color: #666;
    }
    .form-group {
        margin-bottom: 1rem;
    }
    .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        font-family: 'Open Sans', sans-serif;
        font-weight: 600;
        color: #333;
    }
    .form-group input,
    .form-group textarea {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-family: 'Open Sans', sans-serif;
        font-size: 0.95rem;
    }
    .form-group textarea {
        resize: vertical;
    }
    .modal-footer {
        padding: 1.5rem;
        border-top: 1px solid #e0e0e0;
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
    }
    .btn-modal-cancel,
    .btn-modal-submit {
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        font-family: 'Open Sans', sans-serif;
    }
    .btn-modal-cancel {
        background: #f0f0f0;
        color: #333;
    }
    .btn-modal-cancel:hover {
        background: #e0e0e0;
    }
    .btn-modal-submit {
        background: #865c00;
        color: white;
    }
    .btn-modal-submit:hover {
        background: #6b4700;
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = modalStyles;
document.head.appendChild(styleSheet);
