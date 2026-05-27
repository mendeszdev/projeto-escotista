/* cadastro-associado.js */

/* ─────────────────────────────────────────
   TOAST
───────────────────────────────────────── */
function showToast(icon, msg, duration = 3500) {
  const toast     = document.getElementById('toast');
  const toastIcon = document.getElementById('toast-icon');
  const toastMsg  = document.getElementById('toast-msg');

  toastIcon.textContent = icon;
  toastMsg.textContent  = msg;
  toast.classList.add('show');

  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), duration);
}

/* ─────────────────────────────────────────
   PERFIL — campo dinâmico
───────────────────────────────────────── */
function initPerfilDinamico() {
  const select   = document.getElementById('field-perfil');
  const cardAdult = document.getElementById('card-adulto');
  if (!select || !cardAdult) return;

  function update() {
    const isAdult = select.value === 'escotista' || select.value === 'dirigente';
    cardAdult.classList.toggle('dimmed', !isAdult);
    cardAdult.style.pointerEvents = isAdult ? 'auto' : 'none';
  }

  select.addEventListener('change', update);
  update();
}

/* ─────────────────────────────────────────
   UPLOAD — drag & drop + click
───────────────────────────────────────── */
function initUpload() {
  const zone  = document.getElementById('upload-zone');
  const input = document.getElementById('file-input');
  if (!zone || !input) return;

  zone.addEventListener('click', () => input.click());
  zone.addEventListener('dragover', e => {
    e.preventDefault();
    zone.style.borderColor = 'var(--forest-green)';
    zone.style.background  = 'rgba(35,115,41,0.06)';
  });
  zone.addEventListener('dragleave', () => {
    zone.style.borderColor = '';
    zone.style.background  = '';
  });
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.style.borderColor = '';
    zone.style.background  = '';
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFile(file);
  });

  input.addEventListener('change', () => {
    if (input.files?.[0]) handleFile(input.files[0]);
  });

  function handleFile(file) {
    if (file.type !== 'application/pdf') {
      showToast('⚠️', 'Por favor envie um arquivo PDF.');
      return;
    }
    const label = zone.querySelector('.upload-label');
    if (label) label.textContent = `✔ ${file.name}`;
    zone.style.borderColor = 'var(--forest-green)';
    showToast('📄', `Arquivo "${file.name}" carregado.`);
  }
}

/* ─────────────────────────────────────────
   MÁSCARAS — CPF, CEP, Telefone
───────────────────────────────────────── */
function applyMasks() {
  const cpfInput = document.getElementById('field-cpf');
  if (cpfInput) {
    cpfInput.addEventListener('input', () => {
      let v = cpfInput.value.replace(/\D/g, '').slice(0, 11);
      if      (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
      else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
      else if (v.length > 3) v = v.replace(/(\d{3})(\d{1,3})/, '$1.$2');
      cpfInput.value = v;
    });
  }

  const cepInput = document.getElementById('field-cep');
  if (cepInput) {
    cepInput.addEventListener('input', () => {
      let v = cepInput.value.replace(/\D/g, '').slice(0, 8);
      if (v.length > 5) v = v.replace(/(\d{5})(\d{1,3})/, '$1-$2');
      cepInput.value = v;
      if (v.replace('-', '').length === 8) fetchCep(v.replace('-', ''));
    });
  }

  const telInput = document.getElementById('field-tel');
  if (telInput) {
    telInput.addEventListener('input', () => {
      let v = telInput.value.replace(/\D/g, '').slice(0, 11);
      if      (v.length > 10) v = v.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      else if (v.length > 6)  v = v.replace(/(\d{2})(\d{4,5})(\d{0,4})/, '($1) $2-$3');
      else if (v.length > 2)  v = v.replace(/(\d{2})(\d{0,5})/, '($1) $2');
      telInput.value = v;
    });
  }
}

async function fetchCep(cep) {
  try {
    const res  = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await res.json();
    if (data.erro) { showToast('⚠️', 'CEP não encontrado.'); return; }
    const rua    = document.getElementById('field-rua');
    const bairro = document.getElementById('field-bairro');
    if (rua)    rua.value    = data.logradouro || '';
    if (bairro) bairro.value = data.bairro     || '';
    showToast('📍', `Endereço preenchido: ${data.localidade}/${data.uf}`);
  } catch { /* ignora erros de rede */ }
}

/* ─────────────────────────────────────────
   VALIDAÇÃO
───────────────────────────────────────── */
function validate(input, test, msg) {
  const card  = input.closest('.field-card');
  const errEl = card?.querySelector('.field-error');

  if (!test(input.value)) {
    card?.classList.add('has-error');
    card?.classList.remove('is-valid');
    if (errEl) errEl.textContent = msg;
    return false;
  }
  card?.classList.remove('has-error');
  card?.classList.add('is-valid');
  return true;
}

function validateAll() {
  const nome   = document.getElementById('field-nome');
  const cpf    = document.getElementById('field-cpf');
  const perfil = document.getElementById('field-perfil');
  const email  = document.getElementById('field-email');
  const tel    = document.getElementById('field-tel');
  const cep    = document.getElementById('field-cep');

  let ok = true;
  ok = validate(nome,   v => v.trim().length >= 3,                     'Nome deve ter ao menos 3 caracteres.')  && ok;
  ok = validate(cpf,    v => /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(v),   'CPF inválido. Use 000.000.000-00.')      && ok;
  ok = validate(perfil, v => v !== '',                                  'Selecione um perfil na Alcatéia.')       && ok;
  ok = validate(email,  v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),     'E-mail inválido.')                       && ok;
  ok = validate(tel,    v => v.replace(/\D/g, '').length >= 10,         'Telefone inválido.')                     && ok;
  ok = validate(cep,    v => v.replace(/\D/g, '').length === 8,         'CEP deve ter 8 dígitos.')                && ok;
  return ok;
}

/* ─────────────────────────────────────────
   COLETA DOS DADOS DO FORMULÁRIO
───────────────────────────────────────── */
function collectFormData() {
  return {
    nome:           document.getElementById('field-nome')?.value.trim()        || '',
    cpf:            document.getElementById('field-cpf')?.value.trim()         || '',
    dataNascimento: document.getElementById('field-nascimento')?.value         || '',
    perfil:         document.getElementById('field-perfil')?.value             || '',
    email:          document.getElementById('field-email')?.value.trim()       || '',
    telefone:       document.getElementById('field-tel')?.value.trim()         || '',
    cep:            document.getElementById('field-cep')?.value.trim()         || '',
    rua:            document.getElementById('field-rua')?.value.trim()         || '',
    bairro:         document.getElementById('field-bairro')?.value.trim()      || '',
    responsaveis:   document.getElementById('field-responsaveis')?.value.trim() || '',
  };
}

/* ─────────────────────────────────────────
   SUBMIT
───────────────────────────────────────── */
function resetForm() {
  document.getElementById('cadastro-form')?.reset();
  document.querySelectorAll('.field-card').forEach(c => c.classList.remove('has-error', 'is-valid'));
}

function initFormActions() {
  const btnSave    = document.getElementById('btn-save');
  const btnDiscard = document.getElementById('btn-discard');

  btnSave?.addEventListener('click', async e => {
    e.preventDefault();

    if (!validateAll()) {
      showToast('⚠️', 'Preencha todos os campos obrigatórios.', 4000);
      return;
    }

    btnSave.textContent = 'Salvando…';
    btnSave.disabled    = true;

    try {
      if (typeof API !== 'undefined') {
        const data = collectFormData();
        await API.associados.create(data);
      }

      btnSave.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
             stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        Salvar Cadastro`;
      showToast('🎉', 'Associado cadastrado com sucesso na Grande Caçada!', 5000);
      resetForm();

    } catch (err) {
      console.error('[Cadastro] Erro ao salvar:', err);
      showToast('❌', `Erro ao salvar: ${err.message}`, 5000);
    } finally {
      btnSave.disabled = false;
    }
  });

  btnDiscard?.addEventListener('click', () => {
    if (confirm('Deseja descartar todas as alterações?')) {
      resetForm();
      showToast('↩️', 'Alterações descartadas.');
    }
  });
}

/* ─────────────────────────────────────────
   BOOTSTRAP
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initPerfilDinamico();
  initUpload();
  applyMasks();
  initFormActions();
});
