import { apiClient } from './axiosConfig';

// ========================= Locais de Atendimento ========================   

/**
 * GET /locais
 * Retorna os locais físicos mapeados ou filiais cadastradas para prestação de atendimentos do Studio.
 */
export const listarLocais = () =>
  apiClient
    .get('/locais')
    .then((res) => res.data)
    .catch((err) => {
      console.error('❌ Erro ao listar locais físicos:', err);
      throw err;
    });

/**
 * POST /locais
 * Adiciona um novo ponto de atendimento ou sala física ao ecossistema do Studio.
 * @param {Object} localDTO - Objeto estruturado com endereço, nome do local e especificações.
 */
export const salvarLocal = (localDTO) =>
  apiClient
    .post('/locais', localDTO)
    .then((res) => res.data)
    .catch((err) => {
      console.error('❌ Erro ao salvar novo local de atendimento:', err);
      throw err;
    });

/**
 * PUT /locais/{id}
 * Altera informações operacionais ou cadastrais de um estabelecimento/sala de atendimento registrado.
 * @param {number|string} id - ID único do local.
 * @param {Object} localDTO - Informações atualizadas do estabelecimento.
 */
export const atualizarLocal = (id, localDTO) =>
  apiClient
    .put(`/locais/${id}`, localDTO)
    .then((res) => res.data)
    .catch((err) => {
      console.error(`❌ Erro ao atualizar local ${id}:`, err);
      throw err;
    });

/**
 * PATCH /locais/{id}/{status}
 * Habilita ou desabilita um local físico alterando o mapeamento de rotas operacionais do Studio entre '/ativar' ou '/desativar'.
 * @param {number|string} id - ID único do local.
 * @param {boolean} ativar - Se true ativa o local, se false desativa a sua agenda de recebimento.
 */
export const alternarStatusLocal = (id, ativar = true) =>
  apiClient
    .patch(`/locais/${id}/${ativar ? 'ativar' : 'desativar'}`)
    .then((res) => res.data)
    .catch((err) => {
      console.error(`❌ Erro ao alterar status operacional do local ${id}:`, err);
      throw err;
    });
