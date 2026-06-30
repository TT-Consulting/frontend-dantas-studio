import { apiClient } from './axiosConfig';

/**
 * GET /estoque
 * Retorna uma lista com todos os itens do almoxarifado/estoque cadastrados, independente de estarem ativos ou não.
 */
export const listarEstoque = () =>
  apiClient
    .get('/estoque')
    .then((res) => res.data)
    .catch((err) => {
      console.error('❌ Erro ao listar estoque geral:', err);
      throw err;
    });

/**
 * GET /estoque
 * Executa a chamada de listagem e aplica um filtro local no front-end para expor somente materiais operacionais.
 */
export const listarMateriaisEstoque = () =>
  apiClient
    .get('/estoque')
    .then((res) => {
      const materiais = Array.isArray(res?.data) ? res.data : [];
      return materiais.filter((m) => m.isAtivo === true || m.ativo === true);
    })
    .catch((err) => {
      console.error('❌ Erro ao filtrar materiais ativos:', err);
      throw err;
    });

/**
 * GET /estoque/critico
 * Consulta automática que retorna os produtos cujos volumes estão abaixo da margem mínima estipulada de segurança (alerta de reabastecimento).
 */
export const listarItensCriticos = () =>
  apiClient
    .get('/estoque/critico')
    .then((res) => res.data)
    .catch((err) => {
      console.error('❌ Erro ao listar itens em nível crítico:', err);
      throw err;
    });

/**
 * POST /estoque
 * Registra um novo insumo físico (ex: esmaltes, brocas, géis) no catálogo de gerenciamento do estoque.
 * @param {Object} materialDTO - Dados do material (nome, quantidade atual, limite crítico).
 */
export const salvarMaterial = (materialDTO) =>
  apiClient
    .post('/estoque', materialDTO)
    .then((res) => res.data)
    .catch((err) => {
      console.error('❌ Erro ao salvar material no estoque:', err);
      throw err;
    });

/**
 * PATCH /estoque/{id}/ajustar
 * Atualiza ou redefine manualmente o saldo numérico de um material (usado em balanços físicos de inventário).
 * @param {number|string} id - ID único do material.
 * @param {number} quantidade - Novo volume numérico exato a ser gravado no banco de dados.
 */
export const ajustarQuantidade = (id, quantidade) =>
  apiClient
    .patch(`/estoque/${id}/ajustar`, null, { params: { quantidade } })
    .then((res) => res.data)
    .catch((err) => {
      console.error(`❌ Erro ao ajustar quantidade do material ${id}:`, err);
      throw err;
    });

/**
 * PATCH /estoque/{id}/consumir
 * Deduz unidades do estoque de um insumo devido à utilização operacional nos atendimentos diários.
 * @param {number|string} id - ID único do material.
 * @param {number} quantidade - Quantidade de itens consumidos a serem subtraídos.
 */
export const consumirMaterial = (id, quantidade) =>
  apiClient
    .patch(`/estoque/${id}/consumir`, null, { params: { quantidade } })
    .then((res) => res.data)
    .catch((err) => {
      console.error(`❌ Erro ao deduzir consumo do material ${id}:`, err);
      throw err;
    });

/**
 * PATCH /estoque/{id}/{status}
 * Altera a flag lógica de disponibilidade do material no estoque alternando entre '/ativar' e '/desativar'.
 * @param {number|string} id - ID único do material.
 * @param {boolean} ativar - Status pretendido. True direciona para ativar e False para desativar.
 */
export const alternarStatusMaterial = (id, ativar = true) =>
  apiClient
    .patch(`/estoque/${id}/${ativar ? 'ativar' : 'desativar'}`)
    .then((res) => res.data)
    .catch((err) => {
      console.error(`❌ Erro ao alterar status do material ${id}:`, err);
      throw err;
    });