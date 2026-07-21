import { apiClient } from './axiosConfig';

// ========================= Horário Comercial / Expediente ========================

/**
 * GET /horario-comercial
 * Carrega a tabela com as regras de horário comercial, janelas de almoço e turnos configurados no sistema.
 */
export const listarHorarioComercial = () =>
  apiClient
    .get('/horario-comercial')
    .then((res) => res.data)
    .catch((err) => {
      console.error('❌ Erro ao obter quadro de horários comerciais:', err);
      throw err;
    });

/**
 * POST /horario-comercial
 * Configura um novo turno ou regra de expediente padrão de abertura/fechamento para a agenda do Studio.
 * @param {Object} horarioDTO - Objeto com os horários mapeados por dia de semana.
 */
export const salvarHorarioComercial = (horarioDTO) =>
  apiClient
    .post('/horario-comercial', horarioDTO)
    .then((res) => res.data)
    .catch((err) => {
      console.error('❌ Erro ao salvar horário comercial inicial:', err);
      throw err;
    });

/**
 * PUT /horario-comercial/{id}
 * Modifica o horário de expediente de uma janela pré-existente de trabalho.
 * @param {number|string} id - ID único da configuração de horários.
 * @param {Object} horarioDTO - Dados reajustados de expediente para gravação.
 */
export const atualizarHorarioComercial = (id, horarioDTO) =>
  apiClient
    .put(`/horario-comercial/${id}`, horarioDTO)
    .then((res) => res.data)
    .catch((err) => {
      console.error(`❌ Erro ao atualizar configurações do horário comercial ${id}:`, err);
      throw err;
    });