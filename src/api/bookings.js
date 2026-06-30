import { apiClient } from './axiosConfig';

/**
 * GET /agendamentos
 * Retorna a lista completa com todos os agendamentos cadastrados no sistema.
 * @param {Object} filtros - Filtros opcionais de busca (ex: status, cliente).
 */
export const listarAgendamentos = (filtros = {}) =>
  apiClient
    .get('/agendamentos', { params: filtros })
    .then((res) => res.data)
    .catch((err) => {
      console.error('❌ Erro ao listar agendamentos completos:', err);
      throw err;
    });

/**
 * GET /agendamentos/agenda
 * Realiza uma listagem inteligente filtrada por intervalo de datas.
 * Se nenhum parâmetro for informado, o backend retorna por padrão os próximos 7 dias.
 * @param {string} inicio - Data de início no formato (YYYY-MM-DD).
 * @param {string} fim - Data final no formato (YYYY-MM-DD).
 */
export const buscarAgendamentosPorPeriodo = (inicio, fim) =>
  apiClient
    .get('/agendamentos/agenda', { params: { inicio, fim } })
    .then((res) => {
      if (res.status === 204 || !res.data) return [];
      return res.data;
    })
    .catch((err) => {
      console.error(`❌ Erro ao buscar período de agendamentos (${inicio} a ${fim}):`, err);
      return [];
    });

/**
 * POST /agendamentos
 * Cria um novo agendamento no sistema. O backend calcula automaticamente o horário de término
 * baseado na soma de duração dos serviços informados e valida possíveis conflitos.
 * @param {Object} agendamentoDTO - Objeto com os dados do agendamento (cliente, serviços, data, hora, etc).
 */
export const criarAgendamento = (agendamentoDTO) =>
  apiClient
    .post('/agendamentos', agendamentoDTO)
    .then((res) => res.data)
    .catch((err) => {
      console.error('❌ Erro ao criar novo agendamento:', err);
      throw err;
    });

/**
 * ALIAS: salvarAgendamento
 * Mapeamento alternativo que aponta para 'criarAgendamento' para fins de retrocompatibilidade na UI.
 */
export const salvarAgendamento = criarAgendamento;

/**
 * PATCH /agendamentos/{id}/finalizar
 * Conclui um atendimento no sistema, alterando o status do agendamento para 'CONCLUÍDO'
 * e engatilhando de forma automática a geração de receitas no fluxo de caixa.
 * @param {number|string} id - ID único do agendamento a ser finalizado.
 */
export const finalizarAtendimento = (id) =>
  apiClient
    .patch(`/agendamentos/${id}/finalizar`)
    .then((res) => res.data)
    .catch((err) => {
      console.error(`❌ Erro ao finalizar atendimento ${id}:`, err);
      throw err;
    });

/**
 * PATCH /agendamentos/{id}/cancelar
 * Modifica o status de um agendamento para 'CANCELADO', liberando o horário na grade do Studio.
 * @param {number|string} id - ID único do agendamento a ser cancelado.
 */
export const cancelarAgendamento = (id) =>
  apiClient
    .patch(`/agendamentos/${id}/cancelar`)
    .then((res) => res.data)
    .catch((err) => {
      console.error(`❌ Erro ao cancelar agendamento ${id}:`, err);
      throw err;
    });

/**
 * GET /agendamentos/disponibilidade
 * Consulta os horários disponíveis (slots livres) para um ou mais serviços em uma determinada data,
 * cruzando as regras de expediente do Studio e os conflitos da agenda.
 * @param {string} data - Data da consulta no formato (YYYY-MM-DD).
 * @param {number[]|number} idServicos - Array de IDs ou ID individual dos serviços para calcular o tempo acumulado.
 */
export const buscarDisponibilidade = (data, idServicos) => {
  // Garante que se vier um array ou número, vira string limpa separada por vírgula (ex: "2" ou "2,3")
  const servicosParam = Array.isArray(idServicos) ? idServicos.join(',') : idServicos;

  return apiClient
    .get('/agendamentos/disponibilidade', { 
      params: { 
        data: data, 
        idServicos: servicosParam 
      } 
    })
    .then((res) => res.data)
    .catch((err) => {
      console.error(`❌ Erro ao buscar horários de disponibilidade para o dia ${data}:`, err);
      return []; 
    });
};

/**
 * GET /agendamentos/disponibilidade
 * Verifica de forma manual se um slot com data, hora e duração específicas está livre no sistema.
 * Usado para validações em tempo real em agendamentos customizados na área administrativa.
 * @param {string} data - Data desejada (YYYY-MM-DD).
 * @param {string} hora - Horário de início (HH:mm).
 * @param {number} duracao - Tempo total estimado do atendimento em minutos.
 */
export const verificarDisponibilidade = (data, hora, duracao) =>
  apiClient
    .get('/agendamentos/disponibilidade', { params: { data, hora, duracao } })
    .then((res) => res.data)
    .catch((err) => {
      console.error('❌ Erro ao verificar disponibilidade manual:', err);
      throw err;
    });

/**
 * GET /agendamentos/cliente/{idCliente}
 * Busca e retorna o histórico completo e exclusivo de agendamentos associados a um determinado cliente.
 * @param {number|string} idCliente - ID único do cliente.
 */
export const buscarAgendamentosPorCliente = (idCliente) =>
  apiClient
    .get(`/agendamentos/cliente/${idCliente}`)
    .then((res) => {
      if (res.status === 204 || !res.data) return [];
      return res.data;
    })
    .catch((err) => {
      console.error(`❌ Erro ao buscar agendamentos do cliente ${idCliente}:`, err);
      return [];
    });

/**
 * GET /agendamentos/{id}
 * Busca as informações detalhadas de um único agendamento por ID.
 * (Nota: Certifique-se de que a rota correspondente esteja exposta pelo backend).
 * @param {number|string} id - ID único do agendamento.
 */
export const buscarAgendamentoPorId = (id) =>
  apiClient
    .get(`/agendamentos/${id}`)
    .then((res) => res.data)
    .catch((err) => {
      console.error(`❌ Erro ao buscar agendamento individual por ID ${id}:`, err);
      throw err;
    });

/**
 * PUT /agendamentos/{id}
 * Modifica integralmente os dados de um agendamento existente no banco de dados.
 * (Nota: Certifique-se de que a rota correspondente esteja exposta pelo backend).
 * @param {number|string} id - ID único do agendamento a ser modificado.
 * @param {Object} agendamentoDTO - Dados estruturados atualizados do agendamento.
 */
export const atualizarAgendamento = (id, agendamentoDTO) =>
  apiClient
    .put(`/agendamentos/${id}`, agendamentoDTO)
    .then((res) => res.data)
    .catch((err) => {
      console.error(`❌ Erro ao atualizar dados do agendamento ${id}:`, err);
      throw err;
    });

/**
 * DELETE /agendamentos/{id}
 * Remove permanentemente um registro de agendamento do sistema.
 * (Nota: Certifique-se de que a rota correspondente esteja exposta pelo backend).
 * @param {number|string} id - ID do agendamento a ser deletado.
 */
export const deletarAgendamentoCompleto = (id) =>
  apiClient
    .delete(`/agendamentos/${id}`)
    .then((res) => res.data)
    .catch((err) => {
      console.error(`❌ Erro ao deletar agendamento ${id}:`, err);
      throw err;
    });