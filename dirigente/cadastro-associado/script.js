requireAuth('dirigente');

/* cadastro-associado.js — integração completa com o plano de API */

/* ─────────────────────────────────────────
   SUPABASE — cliente inicializado via SDK
───────────────────────────────────────── */
function getSupabaseClient() {
  const cfg = window.SUPABASE_CONFIG || {};
  if (!cfg.url || !cfg.anonKey || cfg.url.includes('SEU-PROJETO')) return null;
  try {
    const { createClient } = window.supabase;
    return createClient(cfg.url, cfg.anonKey);
  } catch (e) {
    console.warn('[Supabase] SDK não carregado:', e.message);
    return null;
  }
}

const SUPABASE_ERROR_MAP = {
  'Bucket not found':                    'Bucket de armazenamento não encontrado. Verifique o dashboard do Supabase.',
  'exceeded the maximum allowed size':   'Arquivo excede o tamanho máximo permitido.',
  'invalid input syntax for type uuid':  'ID do associado inválido para o caminho do Storage.',
  'row-level security':                  'Permissão negada no Storage. Verifique as policies do bucket.',
};

function friendlyStorageError(message) {
  for (const [key, friendly] of Object.entries(SUPABASE_ERROR_MAP)) {
    if (message?.includes(key)) return friendly;
  }
  return message || 'Erro ao fazer upload do arquivo.';
}

/* ─────────────────────────────────────────
   TOAST
───────────────────────────────────────── */
function showToast(icon, msg, duration = 3500) {
  const toast     = document.getElementById('toast');
  const toastIcon = document.getElementById('toast-icon');
  const toastMsg  = document.getElementById('toast-msg');
  if (!toast) return;
  toastIcon.textContent = icon;
  toastMsg.textContent  = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), duration);
}

/* ─────────────────────────────────────────
   VALIDAÇÕES
───────────────────────────────────────── */
function validarCPF(cpf) {
  const d = cpf.replace(/\D/g, '');
  if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false;
  let s = 0;
  for (let i = 0; i < 9; i++) s += parseInt(d[i]) * (10 - i);
  let r = (s * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  if (r !== parseInt(d[9])) return false;
  s = 0;
  for (let i = 0; i < 10; i++) s += parseInt(d[i]) * (11 - i);
  r = (s * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  return r === parseInt(d[10]);
}

function validarEmail(v) {
  return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

function validarTelefone(v) {
  const d = v.replace(/\D/g, '');
  return !v || d.length === 10 || d.length === 11;
}

function markField(inputEl, valid, msg) {
  const card  = inputEl?.closest('.field-card');
  const errEl = card?.querySelector('.field-error');
  if (!card) return;
  card.classList.toggle('has-error', !valid);
  card.classList.toggle('is-valid',  valid);
  if (errEl && msg) errEl.textContent = msg;
}

function validateAll() {
  const nome       = document.getElementById('field-nome');
  const nasc       = document.getElementById('field-nascimento');
  const cpf        = document.getElementById('field-cpf');
  const perfil     = document.getElementById('field-perfil');
  const email      = document.getElementById('field-email');
  const tel        = document.getElementById('field-tel');
  let ok = true;

  const nomeVal = nome?.value.trim() || '';
  markField(nome, nomeVal.length >= 3, 'Nome deve ter ao menos 3 caracteres.');
  if (nomeVal.length < 3) ok = false;

  const nascVal = nasc?.value || '';
  const nascOk  = !!nascVal && new Date(nascVal) < new Date();
  markField(nasc, nascOk, 'Data inválida ou futura.');
  if (!nascOk) ok = false;

  const cpfOk = validarCPF(cpf?.value || '');
  markField(cpf, cpfOk, 'CPF inválido. Use 000.000.000-00.');
  if (!cpfOk) ok = false;

  const perfilOk = !!perfil?.value;
  markField(perfil, perfilOk, 'Selecione um perfil na Alcatéia.');
  if (!perfilOk) ok = false;

  const emailOk = validarEmail(email?.value || '');
  markField(email, emailOk, 'E-mail inválido.');
  if (!emailOk) ok = false;

  const telOk = validarTelefone(tel?.value || '');
  markField(tel, telOk, 'Telefone inválido (10 ou 11 dígitos).');
  if (!telOk) ok = false;

  return ok;
}

/* ─────────────────────────────────────────
   MÁSCARAS
───────────────────────────────────────── */
function applyMasks() {
  const cpfInput = document.getElementById('field-cpf');
  cpfInput?.addEventListener('input', () => {
    let v = cpfInput.value.replace(/\D/g, '').slice(0, 11);
    if      (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    else if (v.length > 3) v = v.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    cpfInput.value = v;
  });

  const cepInput = document.getElementById('field-cep');
  cepInput?.addEventListener('input', () => {
    let v = cepInput.value.replace(/\D/g, '').slice(0, 8);
    if (v.length > 5) v = v.replace(/(\d{5})(\d{1,3})/, '$1-$2');
    cepInput.value = v;
  });
  cepInput?.addEventListener('blur', () => {
    const digits = cepInput.value.replace(/\D/g, '');
    if (digits.length === 8) fetchCep(digits);
  });

  function maskTel(el) {
    el?.addEventListener('input', () => {
      let v = el.value.replace(/\D/g, '').slice(0, 11);
      if      (v.length > 10) v = v.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      else if (v.length > 6)  v = v.replace(/(\d{2})(\d{4,5})(\d{0,4})/, '($1) $2-$3');
      else if (v.length > 2)  v = v.replace(/(\d{2})(\d{0,5})/, '($1) $2');
      el.value = v;
    });
  }

  function maskCPF(el) {
    el?.addEventListener('input', () => {
      let v = el.value.replace(/\D/g, '').slice(0, 11);
      if      (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
      else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
      else if (v.length > 3) v = v.replace(/(\d{3})(\d{1,3})/, '$1.$2');
      el.value = v;
    });
  }

  maskTel(document.getElementById('field-tel'));
  maskTel(document.getElementById('field-resp-telefone'));
  maskCPF(document.getElementById('field-resp-cpf'));
}

/* ─────────────────────────────────────────
   STEP 1 — Matrícula automática ao mudar perfil
───────────────────────────────────────── */
function initPerfilDinamico() {
  const select    = document.getElementById('field-perfil');
  const cardAdult = document.getElementById('card-adulto');
  if (!select) return;

  async function onPerfilChange() {
    const val = select.value;

    /* Toggle cards de requisitos */
    if (cardAdult) {
      const isAdult = val === 'escotista' || val === 'dirigente';
      cardAdult.classList.toggle('dimmed', !isAdult);
      cardAdult.style.pointerEvents = isAdult ? 'auto' : 'none';
    }

    /* Busca próxima matrícula */
    if (!val) {
      const mEl = document.getElementById('field-matricula');
      if (mEl) mEl.value = '';
      return;
    }
    try {
      const mEl = document.getElementById('field-matricula');
      if (mEl) mEl.value = '…';
      const data = await API.associados.proximaMatricula(val);
      if (mEl) mEl.value = data?.matricula || '';
    } catch {
      const mEl = document.getElementById('field-matricula');
      if (mEl) mEl.value = '';
    }
  }

  select.addEventListener('change', onPerfilChange);
  if (select.value) onPerfilChange();
}

/* ─────────────────────────────────────────
   STEP 3 — ViaCEP
───────────────────────────────────────── */
async function fetchCep(digits) {
  try {
    const res  = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
    const data = await res.json();
    if (data.erro) { showToast('⚠️', 'CEP não encontrado.'); return; }

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
    set('field-rua',    data.logradouro);
    set('field-bairro', data.bairro);
    set('field-cidade', data.localidade);
    set('field-estado', data.uf);
    showToast('📍', `${data.localidade} / ${data.uf}`);
  } catch { /* ignora erros de rede */ }
}

/* ─────────────────────────────────────────
   UPLOAD — Supabase Storage via SDK
   Buckets:
     foto     → 'fotos'      path: associados/{id}/perfil.{ext}
     certidão → 'documentos' path: associados/{id}/{tipo}.{ext}
───────────────────────────────────────── */
async function uploadToSupabase(associadoId, file, tipo) {
  const sb = getSupabaseClient();
  if (!sb) {
    console.warn('[Upload] Supabase não configurado — upload ignorado.');
    return null;
  }

  const ext    = file.name.split('.').pop().toLowerCase();
  const isFoto = tipo === 'foto';
  const bucket = isFoto ? 'fotos' : 'documentos';
  const path   = isFoto
    ? `associados/${associadoId}/perfil.${ext}`
    : `associados/${associadoId}/${tipo}.${ext}`;

  const { data, error } = await sb.storage
    .from(bucket)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) throw new Error(friendlyStorageError(error.message));

  const { data: urlData } = sb.storage.from(bucket).getPublicUrl(data.path);

  return {
    url:          urlData.publicUrl,
    nomeArquivo:  file.name,
    tamanhoBytes: file.size,
  };
}

/* ─────────────────────────────────────────
   UPLOAD — certidão PDF + foto de perfil
───────────────────────────────────────── */
let _uploadedFile = null;  // certidão PDF
let _uploadedFoto = null;  // foto de perfil

function initUpload() {
  /* ── Certidão PDF ── */
  const zone  = document.getElementById('upload-zone');
  const input = document.getElementById('file-input');
  if (zone && input) {
    input.addEventListener('change', () => {
      const file = input.files?.[0];
      if (!file) return;
      if (file.type !== 'application/pdf') {
        showToast('⚠️', 'Por favor envie um arquivo PDF.'); return;
      }
      _uploadedFile = file;
      const label = zone.querySelector('.upload-label');
      if (label) label.textContent = `✔ ${file.name}`;
      zone.style.borderColor = 'var(--forest-green)';
      showToast('📄', `Arquivo "${file.name}" carregado.`);
    });
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', e => {
      e.preventDefault(); zone.classList.remove('drag-over');
      const dt = e.dataTransfer?.files?.[0];
      if (dt) { input.files = createFileList(dt); input.dispatchEvent(new Event('change')); }
    });
  }

  /* ── Foto de perfil ── */
  const fotoInput   = document.getElementById('file-foto');
  const fotoPreview = document.getElementById('foto-img');
  const fotoNome    = document.getElementById('foto-nome');

  fotoInput?.addEventListener('change', () => {
    const file = fotoInput.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('⚠️', 'Envie uma imagem JPG, PNG ou WebP.'); return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast('⚠️', 'A foto deve ter no máximo 2 MB.'); return;
    }
    _uploadedFoto = file;
    if (fotoNome)    fotoNome.textContent = `✔ ${file.name}`;
    if (fotoPreview) {
      fotoPreview.src = URL.createObjectURL(file);
      fotoPreview.style.display = 'block';
      const svg = document.querySelector('#foto-preview svg');
      if (svg) svg.style.display = 'none';
    }
    showToast('🖼️', `Foto "${file.name}" selecionada.`);
  });
}

/* helper — criar FileList sintético para drag-and-drop */
function createFileList(file) {
  try {
    const dt = new DataTransfer();
    dt.items.add(file);
    return dt.files;
  } catch { return null; }
}

/* ─────────────────────────────────────────
   JWT — extrai grupoId do access token
───────────────────────────────────────── */
function extractGrupoId() {
  try {
    const token   = localStorage.getItem('accessToken') || '';
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.grupoId || payload.grupoEscotelroId || null;
  } catch {
    return null;
  }
}

/* ─────────────────────────────────────────
   MENSAGENS AMIGÁVEIS — constraints 500
───────────────────────────────────────── */
const CONSTRAINT_MSG = {
  'associados_cpf_key':       'CPF já cadastrado. Verifique se o associado já existe.',
  'associados_email_key':     'E-mail já cadastrado.',
  'associados_matricula_key': 'Matrícula já existe — recarregue e tente novamente.',
  'fn_validar_grupo_ativo':   'Grupo escoteiro inativo ou não encontrado.',
};

function friendlyError(err) {
  const msg = err.message || '';
  for (const [key, friendly] of Object.entries(CONSTRAINT_MSG)) {
    if (msg.includes(key)) return friendly;
  }
  return msg || 'Erro desconhecido.';
}

/* ─────────────────────────────────────────
   COLETA DOS DADOS
───────────────────────────────────────── */
function collectFormData() {
  const cpfRaw   = (document.getElementById('field-cpf')?.value || '').replace(/\D/g, '');
  const grupoId  = extractGrupoId();

  const val = id => document.getElementById(id)?.value || undefined;
  const str = id => (document.getElementById(id)?.value || '').trim() || undefined;

  return {
    grupoEscotelroId: grupoId || undefined,
    matricula:        val('field-matricula'),
    senhaHash:        cpfRaw || 'Senha@123',
    perfil:           val('field-perfil'),
    nomeCompleto:     (document.getElementById('field-nome')?.value || '').trim(),
    nomeEscoteiro:    str('field-nome-escoteiro'),
    dataNascimento:   val('field-nascimento'),
    genero:           val('field-genero'),
    estadoCivil:      val('field-estado-civil'),
    cpf:              val('field-cpf'),
    rg:               str('field-rg'),
    email:            str('field-email'),
    telefone:         val('field-tel'),
    cep:              val('field-cep'),
    logradouro:       str('field-rua'),
    numeroEnd:        str('field-numero'),
    bairro:           str('field-bairro'),
    cidade:           str('field-cidade'),
    estado:           str('field-estado'),
    status:           'ativo',
  };
}

function collectResponsavelData(associadoId) {
  const nome = (document.getElementById('field-resp-nome')?.value || '').trim();
  if (!nome) return null;

  return {
    associadoId,
    nomeCompleto:          nome,
    parentesco:            (document.getElementById('field-resp-parentesco')?.value || '').trim() || undefined,
    telefone:              document.getElementById('field-resp-telefone')?.value || undefined,
    cpf:                   document.getElementById('field-resp-cpf')?.value || undefined,
    responsavelFinanceiro: document.getElementById('field-resp-financeiro')?.checked ?? false,
  };
}

/* ─────────────────────────────────────────
   SUBMIT — fluxo completo multi-step API
───────────────────────────────────────── */
function setBtnState(btn, loading) {
  btn.disabled = loading;
  if (loading) {
    btn.dataset.originalHtml = btn.innerHTML;
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
           stroke-linecap="round" stroke-linejoin="round"
           style="width:18px;height:18px;animation:spin 0.7s linear infinite">
        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
      </svg>
      Salvando…`;
  } else if (btn.dataset.originalHtml) {
    btn.innerHTML = btn.dataset.originalHtml;
  }
}

function resetForm() {
  document.getElementById('cadastro-form')?.reset();
  document.querySelectorAll('.field-card').forEach(c => c.classList.remove('has-error', 'is-valid'));
  _uploadedFile = null;
  _uploadedFoto = null;

  /* Reset foto preview */
  const fotoImg = document.getElementById('foto-img');
  const fotoSvg = document.querySelector('#foto-preview svg');
  const fotoNomeEl = document.getElementById('foto-nome');
  if (fotoImg) { fotoImg.src = ''; fotoImg.style.display = 'none'; }
  if (fotoSvg) fotoSvg.style.display = '';
  if (fotoNomeEl) fotoNomeEl.textContent = '';
  const fotoInput = document.getElementById('file-foto');
  if (fotoInput) fotoInput.value = '';

  const zone = document.getElementById('upload-zone');
  if (zone) {
    zone.style.borderColor = '';
    const label = zone.querySelector('.upload-label');
    if (label) label.textContent = 'Clique para enviar PDF';
  }
  /* Limpa matrícula ao resetar */
  const mEl = document.getElementById('field-matricula');
  if (mEl) mEl.value = '';
}

function initFormActions() {
  const btnSave    = document.getElementById('btn-save');
  const btnDiscard = document.getElementById('btn-discard');

  btnSave?.addEventListener('click', async e => {
    e.preventDefault();

    if (!validateAll()) {
      showToast('⚠️', 'Corrija os campos marcados em vermelho.', 4000);
      document.querySelector('.has-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setBtnState(btnSave, true);

    try {
      const payload = collectFormData();

      /* ── Passo 2: criar OU atualizar associado ── */
      let associadoId;
      if (_editingId) {
        await API.associados.update(_editingId, payload);
        associadoId = _editingId;
      } else {
        const assocData = await API.associados.create(payload);
        associadoId = assocData?.id;
      }

      /* ── Passo 3: criar OU atualizar responsável legal ── */
      if (associadoId) {
        const respData = collectResponsavelData(associadoId);
        if (respData) {
          try {
            if (_editingRespId) {
              /* PUT — envia objeto completo para não sobrescrever campos com null */
              await API.responsaveis.update(_editingRespId, {
                nomeCompleto:          respData.nomeCompleto,
                parentesco:            respData.parentesco,
                cpf:                   respData.cpf,
                telefone:              respData.telefone,
                responsavelFinanceiro: respData.responsavelFinanceiro,
              });
            } else {
              await API.responsaveis.create(respData);
            }
          } catch (e) { console.warn('[Cadastro] Responsável:', e.message); }
        }
      }

      /* ── Passo 4: foto de perfil (upload → PUT /api/associados) ── */
      if (associadoId && _uploadedFoto) {
        try {
          const upload = await uploadToSupabase(associadoId, _uploadedFoto, 'foto');
          if (upload?.url) {
            await API.associados.update(associadoId, { fotoUrl: upload.url });
            showToast('🖼️', 'Foto de perfil salva.', 2000);
          }
        } catch (e) {
          console.warn('[Upload] Foto:', e.message);
          showToast('⚠️', `Foto não enviada: ${e.message}`, 4000);
        }
      }

      /* ── Passo 5: certidão de idoneidade (upload → POST /api/documentos) ── */
      if (associadoId && _uploadedFile) {
        try {
          const upload = await uploadToSupabase(associadoId, _uploadedFile, 'certidao_idoneidade');
          await API.documentos.create({
            associadoId,
            tipo:         'certidao_idoneidade',
            nomeArquivo:  _uploadedFile.name,
            url:          upload?.url || '',
            tamanhoBytes: _uploadedFile.size,
            obrigatorio:  true,
            status:       'pendente',
          });
          showToast('📄', 'Certidão registrada.', 2000);
        } catch (e) {
          console.warn('[Upload] Certidão:', e.message);
          showToast('⚠️', `Documento não enviado: ${e.message}`, 4000);
        }
      }

      const msg = _editingId ? 'atualizado' : 'cadastrado';
      showToast('🎉', `${payload.nomeCompleto} ${msg} com sucesso!`, 5000);
      _editingId     = null;
      _editingRespId = null;
      resetForm();
      setTimeout(() => { window.location.href = '../associados/'; }, 2000);

    } catch (err) {
      console.error('[Cadastro] Erro:', err);
      /* Erro 400 — o services.js já une erros[] em string; erro 500 — constraint amigável */
      const msg = err.status === 500 ? friendlyError(err) : (err.message || 'Erro ao salvar. Tente novamente.');
      showToast('❌', msg, 6000);
    } finally {
      setBtnState(btnSave, false);
    }
  });

  btnDiscard?.addEventListener('click', () => {
    if (confirm('Deseja descartar todas as alterações?')) {
      resetForm();
      window.location.href = '../associados/';
    }
  });
}

/* ─────────────────────────────────────────
   MODO EDIÇÃO — pré-preenche campos a partir de um id na sessionStorage
───────────────────────────────────────── */
let _editingId    = null;  // ID do associado sendo editado
let _editingRespId = null; // ID do responsável existente (para PUT)

async function initEditMode() {
  const id = sessionStorage.getItem('edit-associado-id');
  if (!id || typeof API === 'undefined') return;

  _editingId = id;
  sessionStorage.removeItem('edit-associado-id');

  try {
    const data = await API.associados.getById(id);
    if (!data) return;

    /* Preenche campos de texto */
    const set = (fieldId, val) => {
      const el = document.getElementById(fieldId);
      if (el && val != null) el.value = val;
    };

    set('field-nome',          data.nomeCompleto);
    set('field-matricula',     data.matricula);
    set('field-nascimento',    data.dataNascimento);
    set('field-cpf',           data.cpf);
    set('field-rg',            data.rg);
    set('field-nome-escoteiro',data.nomeEscoteiro);
    set('field-email',         data.email);
    set('field-tel',           data.telefone);
    set('field-cep',           data.cep);
    set('field-rua',           data.logradouro);
    set('field-numero',        data.numeroEnd);
    set('field-bairro',        data.bairro);
    set('field-cidade',        data.cidade);
    set('field-estado',        data.estado);

    /* Selects */
    const sel = (fieldId, val) => {
      const el = document.getElementById(fieldId);
      if (el && val) el.value = val;
    };
    sel('field-perfil',       data.perfil);
    sel('field-genero',       data.genero);
    sel('field-estado-civil', data.estadoCivil);

    /* Dispara onPerfilChange para atualizar os cards de requisito */
    document.getElementById('field-perfil')?.dispatchEvent(new Event('change'));

    /* Pré-preenche foto existente */
    if (data.fotoUrl) {
      const img = document.getElementById('foto-img');
      const svg = document.querySelector('#foto-preview svg');
      if (img) { img.src = data.fotoUrl; img.style.display = 'block'; }
      if (svg) svg.style.display = 'none';
    }

    /* Pré-preenche responsável legal */
    try {
      const resps = await API.responsaveis.listByAssociado(id);
      const resp  = Array.isArray(resps) ? resps[0] : null;
      if (resp) {
        _editingRespId = resp.id;   // guarda para usar no PUT
        const setR = (fid, val) => { const el = document.getElementById(fid); if (el && val != null) el.value = val; };
        setR('field-resp-nome',       resp.nomeCompleto);
        setR('field-resp-parentesco', resp.parentesco);
        setR('field-resp-telefone',   resp.telefone);
        setR('field-resp-cpf',        resp.cpf);
        const fin = document.getElementById('field-resp-financeiro');
        if (fin) fin.checked = resp.responsavelFinanceiro ?? false;
      }
    } catch (e) { console.warn('[Edição] Responsável:', e.message); }

    /* Altera título e botão para modo edição */
    const title = document.querySelector('.hero-title');
    if (title) title.textContent = 'Editar Caminheiro da Trilha';

    const btnSave = document.getElementById('btn-save');
    if (btnSave) {
      const label = btnSave.querySelector('svg');
      btnSave.innerHTML = (label?.outerHTML || '') + ' Atualizar Cadastro';
    }

    showToast('✏️', `Editando: ${data.nomeCompleto}`, 3000);

  } catch (err) {
    console.error('[Edição] Erro ao carregar dados:', err);
    showToast('❌', 'Não foi possível carregar os dados para edição.', 4000);
  }
}

/* ─────────────────────────────────────────
   BOOTSTRAP
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  initPerfilDinamico();
  initUpload();
  applyMasks();
  await initEditMode();   /* deve rodar antes de initFormActions para _editingId estar pronto */
  initFormActions();
});
