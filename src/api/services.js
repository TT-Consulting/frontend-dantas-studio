import { apiClient } from './axiosConfig';

/**
 * GET /servicos
 * Retorna o catálogo bruto completo de procedimentos oferecidos pelo Studio.
 */
export const listarServicos = () =>
  apiClient
    .get('/servicos')
    .then((res) => res.data)
    .catch((err) => {
      console.error('❌ Erro ao listar serviços:', err);
      throw err;
    });

/**
 * GET /servicos/ativos
 * Filtra e retorna exclusivamente a lista de procedimentos operacionais e ativos, ideal para popular o agendamento de clientes.
 */
export const listarServicosAtivos = () =>
  apiClient
    .get('/servicos/ativos')
    .then((res) => res.data)
    .catch((err) => {
      console.error('❌ Erro ao listar serviços ativos:', err);
      throw err;
    });

/**
 * POST /servicos
 * Cria e publica uma nova modalidade de serviço no catálogo.
 * @param {Object} servicoDTO - Dados do procedimento (nome, preço sugerido, tempo de duração em minutos).
 */
export const criarServico = (servicoDTO) =>
  apiClient
    .post('/servicos', servicoDTO)
    .then((res) => res.data)
    .catch((err) => {
      console.error('❌ Erro ao criar novo serviço:', err);
      throw err;
    });

/**
 * PUT /servicos/{id}
 * Atualiza propriedades estruturais (preço padrão, título, descrição ou tempo) de um serviço cadastrado.
 * @param {number|string} id - ID do serviço no catálogo.
 * @param {Object} servicoDTO - Objeto estruturado com as alterações de dados.
 */
export const editarServico = (id, servicoDTO) =>
  apiClient
    .put(`/servicos/${id}`, servicoDTO)
    .then((res) => res.data)
    .catch((err) => {
      console.error(`❌ Erro ao editar serviço ${id}:`, err);
      throw err;
    });

/**
 * PATCH /servicos/{id}/inativar
 * Desativa um serviço do catálogo, impedindo que ele seja selecionado em novos agendamentos da interface.
 * @param {number|string} id - ID único do serviço.
 */
export const inativarServico = (id) =>
  apiClient
    .patch(`/servicos/${id}/inativar`)
    .then((res) => res.data)
    .catch((err) => {
      console.error(`❌ Erro ao inativar serviço ${id}:`, err);
      throw err;
    });

/**
 * GET /servicos/{id}/historico
 * Consulta a linha do tempo e auditoria de alterações de preço que este serviço sofreu no Studio.
 * @param {number|string} id - ID do serviço.
 */
export const consultarHistoricoPrecos = (id) =>
  apiClient
    .get(`/servicos/${id}/historico`)
    .then((res) => res.data)
    .catch((err) => {
      console.error(`❌ Erro ao consultar histórico de preços do serviço ${id}:`, err);
      throw err;
    });

/**
 * GET /servicos/filtro
 * Busca serviços de forma personalizada com base em filtros avançados parametrizados.
 * @param {Object} filtros - Parâmetros estruturados para pesquisa cruzada de registros.
 */
export const buscarServicosComFiltro = (filtros) =>
  apiClient
    .get('/servicos/filtro', { params: filtros })
    .then((res) => res.data)
    .catch((err) => {
      console.error('❌ Erro ao buscar serviços filtrados:', err);
      throw err;
    });