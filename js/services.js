const API = (() => {
  const BASE    = 'http://localhost:8080/escoteiros-api';
  const TIMEOUT = 10000;

  function token() {
    return localStorage.getItem('accessToken') || '';
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
      login: (matricula, senha) => req('POST', '/api/auth/login', { matricula, senha }),

      logout() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login/';
      },
    },

    associados: {
      list:    (params = {}) => req('GET',    '/api/associados' + qs(params)),
      getById: (id)          => req('GET',    `/api/associados/${id}`),
      create:  (data)        => req('POST',   '/api/associados', data),
      update:  (id, data)    => req('PUT',    `/api/associados/${id}`, data),
      delete:  (id)          => req('DELETE', `/api/associados/${id}`),
    },

    atividades: {
      list:    (params = {}) => req('GET',    '/api/atividades' + qs(params)),
      create:  (data)        => req('POST',   '/api/atividades', data),
      update:  (id, data)    => req('PUT',    `/api/atividades/${id}`, data),
      delete:  (id)          => req('DELETE', `/api/atividades/${id}`),
    },

    alcateias: {
      list:        (params = {}) => req('GET',    '/api/alcateias' + qs(params)),
      listByGrupo: (grupoId)     => req('GET',    `/api/alcateias?grupo=${grupoId}`),
      getById:     (id)          => req('GET',    `/api/alcateias/${id}`),
      create:      (data)        => req('POST',   '/api/alcateias', data),
      update:      (id, data)    => req('PUT',    `/api/alcateias/${id}`, data),
      delete:      (id)          => req('DELETE', `/api/alcateias/${id}`),
    },

    matilhas: {
      list:           (params = {}) => req('GET',    '/api/matilhas' + qs(params)),
      listByAlcateia: (alcateiaId)  => req('GET',    `/api/matilhas?alcateia=${alcateiaId}`),
      getById:        (id)          => req('GET',    `/api/matilhas/${id}`),
      create:         (data)        => req('POST',   '/api/matilhas', data),
      update:         (id, data)    => req('PUT',    `/api/matilhas/${id}`, data),
      delete:         (id)          => req('DELETE', `/api/matilhas/${id}`),
    },

    progressoes: {
      list:            ()            => req('GET', '/api/progressoes'),
      listByAssociado: (associadoId) => req('GET', `/api/progressoes?associado=${associadoId}`),
    },

    distintivos: {
      list:    ()   => req('GET', '/api/distintivos'),
      getById: (id) => req('GET', `/api/distintivos/${id}`),
    },

    documentos: {
      listByAssociado: (id)      => req('GET',    `/api/documentos?associado=${id}`),
      getById:         (id)      => req('GET',    `/api/documentos/${id}`),
      create:          (data)    => req('POST',   '/api/documentos', data),
      update:          (id, data)=> req('PUT',    `/api/documentos/${id}`, data),
      delete:          (id)      => req('DELETE', `/api/documentos/${id}`),
    },

    fichasMedicas: {
      getByAssociado: (associadoId) => req('GET',  `/api/fichas-medicas?associado=${associadoId}`),
      salvar:         (data)        => req('POST',  '/api/fichas-medicas', data),
    },

    responsaveis: {
      listByAssociado: (assocId)   => req('GET',    `/api/responsaveis?associado=${assocId}`),
      getById:         (id)        => req('GET',    `/api/responsaveis/${id}`),
      create:          (data)      => req('POST',   '/api/responsaveis', data),
      update:          (id, data)  => req('PUT',    `/api/responsaveis/${id}`, data),
      delete:          (id)        => req('DELETE', `/api/responsaveis/${id}`),
    },

    acoesEducativas: {
      list:        (params = {}) => req('GET', '/api/acoes-educativas' + qs(params)),
      listByBloco: (blocoId)     => req('GET', `/api/acoes-educativas?bloco=${blocoId}`),
      getById:     (id)          => req('GET', `/api/acoes-educativas/${id}`),
    },

    grupos: {
      list:    ()   => req('GET', '/api/grupos-escoteiros'),
      getById: (id) => req('GET', `/api/grupos-escoteiros/${id}`),
    },

    eixos: {
      list:    ()   => req('GET', '/api/eixos'),
      getById: (id) => req('GET', `/api/eixos/${id}`),
    },

    blocoAprendizagem: {
      list:       ()       => req('GET', '/api/blocos-aprendizagem'),
      listByEixo: (eixoId) => req('GET', `/api/blocos-aprendizagem?eixo=${eixoId}`),
      getById:    (id)     => req('GET', `/api/blocos-aprendizagem/${id}`),
    },

    atribuicoes: {
      list:            (params = {}) => req('GET',    '/api/atribuicoes' + qs(params)),
      listByAssociado: (id)          => req('GET',    `/api/atribuicoes?associado=${id}`),
      listByAtividade: (id)          => req('GET',    `/api/atribuicoes?atividade=${id}`),
      getById:         (id)          => req('GET',    `/api/atribuicoes/${id}`),
      create:          (data)        => req('POST',   '/api/atribuicoes', data),
      update:          (id, data)    => req('PUT',    `/api/atribuicoes/${id}`, data),
      delete:          (id)          => req('DELETE', `/api/atribuicoes/${id}`),
    },

    escotistaAlcateia: {
      listByAlcateia:  (id)   => req('GET',    `/api/escotistas-alcateias?alcateia=${id}`),
      listByAssociado: (id)   => req('GET',    `/api/escotistas-alcateias?associado=${id}`),
      create:          (data) => req('POST',   '/api/escotistas-alcateias', data),
      encerrar:        (id)   => req('PUT',    `/api/escotistas-alcateias/${id}`),
      delete:          (id)   => req('DELETE', `/api/escotistas-alcateias/${id}`),
    },

    membroMatilha: {
      listByMatilha:   (matilhaId)   => req('GET',    `/api/membros-matilha?matilha=${matilhaId}`),
      listByAssociado: (associadoId) => req('GET',    `/api/membros-matilha?associado=${associadoId}`),
      create:          (data)        => req('POST',   '/api/membros-matilha', data),
      encerrar:        (id)          => req('PUT',    `/api/membros-matilha/${id}`),
      delete:          (id)          => req('DELETE', `/api/membros-matilha/${id}`),
    },

  };

})();
