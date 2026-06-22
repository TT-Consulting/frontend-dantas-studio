import { apiClient } from './axiosConfig';

// ========================= Clientes e Anamnese ========================

/**
 * GET /clientes
 * Listar clientes cadastrados (permite filtro opcional por nome)
 * @param {string} nome - Nome para filtro (opcional)
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
 * Buscar os detalhes de um cliente individual por ID
 * @param {number|string} id - ID do cliente
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
 * POST /clientes
 * Salvar/Cadastrar um novo cliente no sistema
 * @param {Object} clienteDTO - Dados do cliente
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
 * Atualizar os dados cadastrais de um cliente existente
 * @param {number|string} id - ID do cliente
 * @param {Object} clienteDTO - Dados atualizados do cliente
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
 * PATCH /clientes/{id}/inativar
 * Alternar status do cliente para INATIVO (Seguindo o padrão de rotas da aplicação)
 * @param {number|string} id - ID do cliente
 */
export const inativarCliente = (id) =>
  apiClient
    .patch(`/clientes/${id}/inativar`)
    .then((res) => res.data)
    .catch((err) => {
      console.error(`❌ Erro ao inativar cliente ${id}:`, err);
      throw err;
    });

/**
 * PATCH /clientes/{id}/ativar
 * Alternar status do cliente para ATIVO
 * @param {number|string} id - ID do cliente
 */
export const ativarCliente = (id) =>
  apiClient
    .patch(`/clientes/${id}/ativar`)
    .then((res) => res.data)
    .catch((err) => {
      console.error(`❌ Erro ao ativar cliente ${id}:`, err);
      throw err;
    });

/* ========================================================================
   NOTA DE COMPATIBILIDADE:
   Os métodos abaixo complementam a estrutura antiga baseada em rotas customizadas,
   caso seu backend utilize mapeamentos específicos para buscas ou filtros.
   ======================================================================== */

/**
 * GET /clientes/inativos
 * Buscar listagem específica de clientes inativados
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
 * Buscar clientes através de um termo ou query de pesquisa abrangente
 * @param {string} query - Termo de busca (nome, cpf, etc)
 */
export const pesquisarClientes = (query) =>
  apiClient
    .get('/clientes/busca', { params: { q: query } })
    .then((res) => res.data)
    .catch((err) => {
      console.error(`❌ Erro ao pesquisar clientes com a query "${query}":`, err);
      throw err;
    });