
const API = (() => {
  const BASE    = 'http://localhost:8080';
  const TIMEOUT = 10000;

  function token() {
    return localStorage.getItem('auth_token') || '';
  }

  async function req(method, path, body = null) {
    const ctrl = new AbortController();
    const tid  = setTimeout(() => ctrl.abort(), TIMEOUT);

    const init = {
      method,
      signal: ctrl.signal,
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${token()}`,
      },
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      init.body = JSON.stringify(body);
    }

    try {
      const res = await fetch(BASE + path, init);
      clearTimeout(tid);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        /* O backend retorna { "erros": [...] } no 400 e { "erro": "..." } no 500 */
        const msg = (Array.isArray(err.erros) && err.erros.length)
          ? err.erros.join(', ')
          : (err.erro || err.message || `Erro ${res.status}`);
        const e = new Error(msg);
        e.status = res.status;
        e.raw    = err;
        throw e;
      }

      const text = await res.text();
      return text ? JSON.parse(text) : null;

    } catch (e) {
      clearTimeout(tid);
      if (e.name === 'AbortError') throw new Error('Tempo limite de conexão excedido');
      throw e;
    }
  }

  function qs(params = {}) {
    const p = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
    ).toString();
    return p ? '?' + p : '';
  }

  return {

    auth: {
      /**
       * POST /api/auth/login
       * @returns {{ success, token, user: { id, name, matricula, role, email, fotoUrl } }}
       */
      login: (matricula, senha) => req('POST', '/api/auth/login', { matricula, senha }),

      logout() {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        window.location.href = '/login/';
      },
    },

    associados: {
      /**
       * GET /api/associados[?perfil=&grupo=&matilha=]
       * @returns {Array<{ id, nome, matricula, perfil, matilha, status, email, fotoUrl }>}
       */
      list:    (params = {}) => req('GET',    '/api/associados' + qs(params)),

      /**
       * GET /api/associados/:id
       */
      getById: (id)          => req('GET',    `/api/associados/${id}`),

      /**
       * GET /api/associados/proxima-matricula?perfil=lobinho
       * @returns {{ matricula: string }}
       */
      proximaMatricula: (perfil) => req('GET', `/api/associados/proxima-matricula?perfil=${perfil}`),

      /**
       * POST /api/associados
       * @param {{ nome, cpf, dataNascimento, perfil, email, telefone, cep, rua, bairro, responsaveis }} data
       */
      create:  (data)        => req('POST',   '/api/associados', data),

      /**
       * PUT /api/associados/:id
       */
      update:  (id, data)    => req('PUT',    `/api/associados/${id}`, data),

      /**
       * DELETE /api/associados/:id
       */
      delete:  (id)          => req('DELETE', `/api/associados/${id}`),
    },

    atividades: {
      /**
       * GET /api/atividades[?status=&associadoId=&matilhaId=]
       * @returns {Array<{ id, titulo, descricao, bloco, area, dataLimite, status, associadoId, matilhaId }>}
       */
      list:    (params = {}) => req('GET',    '/api/atividades' + qs(params)),

      /**
       * POST /api/atividades
       * @param {{ titulo, descricao, bloco, area, dataLimite, lobinhosIds }} data
       */
      create:  (data)        => req('POST',   '/api/atividades', data),

      /**
       * PUT /api/atividades/:id
       * @param {{ status }} data  – 'aprovado' | 'rejeitado' | 'pendente'
       */
      update:  (id, data)    => req('PUT',    `/api/atividades/${id}`, data),

      /**
       * DELETE /api/atividades/:id
       */
      delete:  (id)          => req('DELETE', `/api/atividades/${id}`),
    },

    alcateias: {
      /** GET /api/alcateias */
      list:    ()   => req('GET', '/api/alcateias'),
      /** GET /api/alcateias/:id */
      getById: (id) => req('GET', `/api/alcateias/${id}`),
    },

    matilhas: {
      /** GET /api/matilhas */
      list:    ()   => req('GET', '/api/matilhas'),
      /** GET /api/matilhas/:id */
      getById: (id) => req('GET', `/api/matilhas/${id}`),
    },

    progressoes: {
      /** GET /api/progressoes */
      list:    ()   => req('GET', '/api/progressoes'),
      /** GET /api/progressoes/:id */
      getById: (id) => req('GET', `/api/progressoes/${id}`),
    },

    distintivos: {
      /** GET /api/distintivos */
      list:    ()   => req('GET', '/api/distintivos'),
      /** GET /api/distintivos/:id */
      getById: (id) => req('GET', `/api/distintivos/${id}`),
    },

    documentos: {
      /** GET /api/documentos */
      list:            ()     => req('GET',    '/api/documentos'),
      /** GET /api/documentos?associado={uuid} */
      listByAssociado: (id)   => req('GET',    `/api/documentos?associado=${id}`),
      /** GET /api/documentos/:id */
      getById:         (id)   => req('GET',    `/api/documentos/${id}`),
      /** POST /api/documentos */
      create:          (data) => req('POST',   '/api/documentos', data),
      /** DELETE /api/documentos/:id — remove apenas o registro do banco */
      delete:          (id)   => req('DELETE', `/api/documentos/${id}`),
    },

    fichasMedicas: {
      /** GET /api/fichas-medicas */
      list:    ()   => req('GET', '/api/fichas-medicas'),
      /** GET /api/fichas-medicas/:id */
      getById: (id) => req('GET', `/api/fichas-medicas/${id}`),
    },

    responsaveis: {
      /** GET /api/responsaveis */
      list:            ()          => req('GET',    '/api/responsaveis'),
      /** GET /api/responsaveis?associado={uuid} */
      listByAssociado: (assocId)   => req('GET',    `/api/responsaveis?associado=${assocId}`),
      /** GET /api/responsaveis/:id */
      getById:         (id)        => req('GET',    `/api/responsaveis/${id}`),
      /** POST /api/responsaveis */
      create:          (data)      => req('POST',   '/api/responsaveis', data),
      /** PUT /api/responsaveis/:id — enviar objeto completo para evitar null */
      update:          (id, data)  => req('PUT',    `/api/responsaveis/${id}`, data),
      /** DELETE /api/responsaveis/:id */
      delete:          (id)        => req('DELETE', `/api/responsaveis/${id}`),
    },

    acoesEducativas: {
      /** GET /api/acoes-educativas */
      list:    ()   => req('GET', '/api/acoes-educativas'),
      /** GET /api/acoes-educativas/:id */
      getById: (id) => req('GET', `/api/acoes-educativas/${id}`),
    },

    grupos: {
      /** GET /api/grupos-escoteiros */
      list:    ()   => req('GET', '/api/grupos-escoteiros'),
      /** GET /api/grupos-escoteiros/:id */
      getById: (id) => req('GET', `/api/grupos-escoteiros/${id}`),
    },
  };

})();
