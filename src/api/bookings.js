import { apiClient } from './axiosConfig';

// ========================= Agendamentos (Agenda do Studio) ========================

/**
 * GET /agendamentos
 * Listar agenda completa de atendimentos
 */
export const listarAgendamentos = () =>
  apiClient
    .get('/agendamentos')
    .then((res) => res.data)
    .catch((err) => {
      console.error('❌ Erro ao listar agendamentos completos:', err);
      throw err;
    });

/**
 * GET /agendamentos/agenda
 * Listagem Inteligente por período. Se não informar parâmetros, retorna os próximos 7 dias.
 * @param {string} inicio - Data de início (YYYY-MM-DD)
 * @param {string} fim - Data final (YYYY-MM-DD)
 */
export const buscarAgendamentosPorPeriodo = (inicio, fim) =>
  apiClient
    .get('/agendamentos/agenda', { params: { inicio, fim } })
    .then((res) => {
      // Se o status for 204 (No Content), retorna um array vazio para não quebrar o .forEach()
      if (res.status === 204 || !res.data) return [];
      return res.data;
    })
    .catch((err) => {
      console.error(`❌ Erro ao buscar período de agendamentos (${inicio} a ${fim}):`, err);
      return [];
    });

/**
 * POST /agendamentos
 * Criar novo agendamento com cálculo automático de término e validações
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
 * PATCH /agendamentos/{id}/finalizar
 * Finalizar atendimento mudando o status e disparando a automação financeira de receitas
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
 * Cancelar agendamento mudando o status para CANCELADO
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
 * Consulta horários livres gerando slots de tempo com base no horário comercial e conflitos existentes
 * @param {string} data - Data da consulta (YYYY-MM-DD)
 * @param {number} idServico - ID do serviço pretendido para cálculo de duração
 */
export const buscarDisponibilidade = (data, idServico) =>
  apiClient
    .get('/agendamentos/disponibilidade', { params: { data, idServico } })
    .then((res) => res.data)
    .catch((err) => {
      console.error(`❌ Erro ao buscar horários de disponibilidade para o dia ${data}:`, err);
      return []; // Retorna lista vazia preventivamente para evitar quebras na UI
    });

/* ========================================================================
   NOTA DE COMPATIBILIDADE:
   Os métodos abaixo estão estruturados no padrão do ecossistema JS da aplicação,
   porém NÃO possuem rotas correspondentes declaradas no AgendamentoController.kt.
   Se consumidos na interface, retornarão status 404/405 até serem criados no Kotlin.
   ======================================================================== */

export const buscarAgendamentoPorId = (id) =>
  apiClient
    .get(`/agendamentos/${id}`)
    .then((res) => res.data)
    .catch((err) => {
      console.error(`❌ Erro ao buscar agendamento individual por ID ${id}:`, err);
      throw err;
    });

export const atualizarAgendamento = (id, agendamentoDTO) =>
  apiClient
    .put(`/agendamentos/${id}`, agendamentoDTO)
    .then((res) => res.data)
    .catch((err) => {
      console.error(`❌ Erro ao atualizar dados do agendamento ${id}:`, err);
      throw err;
    });

export const deletarAgendamentoCompleto = (id) =>
  apiClient
    .delete(`/agendamentos/${id}`)
    .then((res) => res.data)
    .catch((err) => {
      console.error(`❌ Erro ao deletar agendamento ${id}:`, err);
      throw err;
    });