/**
 * MINHA JÂNGAL - ATIVIDADES E EIXOS
 * Script para gerenciar a tela de eixos de progressão do Lobinho
 */

// ============================================
// ESTADO DA PÁGINA
// ============================================

const pageState = {
    eixos: [
        {
            id: 1,
            nome: 'Habilidades para a Vida',
            progresso: 85,
            link: '../minha-jangal-blocos/'
        },
        {
            id: 2,
            nome: 'Meio Ambiente',
            progresso: 42,
            link: '../minha-jangal-blocos/'
        },
        {
            id: 3,
            nome: 'Paz e Desenvolvimento',
            progresso: 60,
            link: '../minha-jangal-blocos/'
        },
        {
            id: 4,
            nome: 'Saúde e Bem-Estar',
            progresso: 25,
            link: '../minha-jangal-blocos/'
        }
    ]
};

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Página Minha Jângal - Atividades e Eixos carregada');
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
    
    // Botão Ver Missões
    const btnVerMissoes = document.getElementById('btnVerMissoes');
    if (btnVerMissoes) {
        btnVerMissoes.addEventListener('click', function(e) {
            e.preventDefault();
            showMissoesModal();
        });
    }
    
    // Cards dos eixos
    const eixoCards = document.querySelectorAll('.eixo-card');
    eixoCards.forEach((card, index) => {
        card.addEventListener('click', function() {
            const eixoId = index + 1;
            sessionStorage.setItem('selectedEixo', eixoId);
            console.log(`📍 Eixo ${eixoId} selecionado`);
            window.location.href = '../minha-jangal-blocos/';
        });
    });
    
    // Botão de compartilhar
    const btnShare = document.getElementById('btnShare');
    if (btnShare) {
        btnShare.addEventListener('click', function() {
            if (navigator.share) {
                navigator.share({
                    title: 'Minha Jângal',
                    text: 'Confira meu progresso nos Eixos de Progressão!',
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

function showMissoesModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Próxima Especialidade</h2>
                <button class="modal-close">✕</button>
            </div>
            <div class="modal-body">
                <p>Você está a apenas <strong>2 passos</strong> de conquistar o distintivo de <strong>Amigo das Árvores</strong>!</p>
                <p>Complete as seguintes missões:</p>
                <ul>
                    <li>Identificar 5 árvores nativas da região</li>
                    <li>Participar de uma ação de reflorestamento</li>
                </ul>
            </div>
            <div class="modal-footer">
                <button class="btn-modal-close">Fechar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const closeBtn = modal.querySelector('.modal-close');
    const closeBtnFooter = modal.querySelector('.btn-modal-close');
    
    closeBtn.addEventListener('click', () => modal.remove());
    closeBtnFooter.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
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
        margin: 0.5rem 0;
        font-family: 'Open Sans', sans-serif;
        color: #666;
    }
    .modal-body ul {
        margin: 1rem 0;
        padding-left: 1.5rem;
    }
    .modal-body li {
        margin: 0.5rem 0;
        color: #666;
    }
    .modal-footer {
        padding: 1.5rem;
        border-top: 1px solid #e0e0e0;
        display: flex;
        justify-content: flex-end;
    }
    .btn-modal-close {
        background: #865c00;
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
    }
    .btn-modal-close:hover {
        background: #6b4700;
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = modalStyles;
document.head.appendChild(styleSheet);
