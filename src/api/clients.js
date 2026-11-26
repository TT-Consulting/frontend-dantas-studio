import { apiClient } from './axiosConfig';

/**
 * GET /clientes
 * Retorna uma lista de clientes. Permite o uso de um parâmetro opcional de texto para filtrar por nome.
 * @param {string} nome - Nome ou trecho de texto para filtragem de registros (Opcional).
 */
export const listarClientes = (nome = '') =>
  apiClient
    .get('/clientes', { params: { nome } })
    .then((res) => res.data)
    .catch((err) => {
      console.error('❌ Erro ao listar clientes:', err);
      throw err;
    });

/**
 * GET /clientes/{id}
 * Obtém os detalhes completos de cadastro de um cliente individual (útil para ler a ficha de anamnese).
 * @param {number|string} id - ID único do cliente.
 */
export const buscarClientePorId = (id) =>
  apiClient
    .get(`/clientes/${id}`)
    .then((res) => res.data)
    .catch((err) => {
      console.error(`❌ Erro ao buscar cliente por ID ${id}:`, err);
      throw err;
    });

/**
 * POST /clientes/login
 * Autentica o cliente pelo e-mail ou WhatsApp (correspondência exata). Devolve só o cadastro dele.
 * Erros HTTP: 400 dado inválido, 404 não encontrado, 403 cadastro inativo, 409 cadastro duplicado.
 * @param {string} identificador - E-mail ou WhatsApp informado pelo cliente.
 */
export const autenticarCliente = (identificador) =>
  apiClient
    .post('/clientes/login', { identificador })
    .then((res) => res.data)
    .catch((err) => {
      const status = err?.response?.status;
      if (!status || status >= 500) console.error('❌ Erro ao autenticar cliente:', err);
      throw err;
    });

/**
 * POST /clientes
 * Salva e registra um novo cliente no banco de dados do sistema.
 * @param {Object} clienteDTO - Objeto contendo os dados pessoais e ficha inicial de anamnese do cliente.
 */
export const salvarCliente = (clienteDTO) =>
  apiClient
    .post('/clientes', clienteDTO)
    .then((res) => res.data)
    .catch((err) => {
      console.error('❌ Erro ao salvar novo cliente:', err);
      throw err;
    });

/**
 * PUT /clientes/{id}
 * Altera ou atualiza as informações cadastrais e dados de contato de um cliente já existente.
 * @param {number|string} id - ID do cliente que está sendo editado.
 * @param {Object} clienteDTO - Dados atualizados a serem gravados por cima do registro antigo.
 */
export const atualizarCliente = (id, clienteDTO) =>
  apiClient
    .put(`/clientes/${id}`, clienteDTO)
    .then((res) => res.data)
    .catch((err) => {
      console.error(`❌ Erro ao atualizar dados do cliente ${id}:`, err);
      throw err;
    });

/**
 * PATCH /clientes/{id}/{status}
 * Método dinâmico unificado para gerenciar o estado do cliente. Alterna a flag de atividade entre 'ativar' ou 'inativar'.
 * @param {number|string} id - ID único do cliente.
 * @param {boolean} activar - Controla qual endpoint chamar. Se true chama '/ativar', se false chama '/inativar'.
 */
export const alternarStatusCliente = (id, activar = true) =>
  apiClient
    .patch(`/clientes/${id}/${activar ? 'ativar' : 'inativar'}`)
    .then((res) => res.data)
    .catch((err) => {
      console.error(`❌ Erro ao alterar status do cliente ${id}:`, err);
      throw err;
    });

/**
 * ALIAS: inativarCliente
 * Encapsula a chamada dinamicamente enviando 'false' para desativar o cadastro do cliente.
 */
export const inativarCliente = (id) => alternarStatusCliente(id, false);

/**
 * ALIAS: ativarCliente
 * Encapsula a chamada dinamicamente enviando 'true' para reativar o cadastro do cliente.
 */
export const ativarCliente = (id) => alternarStatusCliente(id, true);

/**
 * GET /clientes/inativos
 * Retorna uma lista contendo exclusivamente os clientes que foram arquivados ou marcados como inativos.
 */
export const listarClientesInativos = () =>
  apiClient
    .get('/clientes/inativos')
    .then((res) => res.data)
    .catch((err) => {
      console.error('❌ Erro ao listar clientes inativos:', err);
      throw err;
    });

/**
 * GET /clientes/busca
 * Permite realizar buscas complexas e abrangentes no cadastro usando queries flexíveis (como CPF, Email ou telefone).
 * @param {string} query - Termo ou palavra-chave utilizada no mecanismo de busca interna.
 */
export const pesquisarClientes = (query) =>
  apiClient
    .get('/clientes/busca', { params: { q: query } })
    .then((res) => res.data)
    .catch((err) => {
      console.error(`❌ Erro ao pesquisar clientes com a query "${query}":`, err);
      throw err;
    });