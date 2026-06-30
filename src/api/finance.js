import { apiClient } from './axiosConfig';

export const financeAPI = {
  /**
   * GET /financeiro/fluxo-caixa
   * Retorna os lançamentos financeiros estruturados de receitas e despesas compreendidos no período.
   * @param {string} inicio - Data inicial do filtro (YYYY-MM-DD).
   * @param {string} fim - Data final do filtro (YYYY-MM-DD).
   */
  listarPorPeriodo: (inicio, fim) =>
    apiClient
      .get('/financeiro/fluxo-caixa', { params: { inicio, fim } })
      .then((res) => res.data)
      .catch((err) => {
        console.error('❌ Erro ao listar fluxo de caixa:', err);
        throw err;
      }),

  /**
   * POST /financeiro
   * Insere manualmente um registro de movimentação monetária de entrada (lucro) ou saída (gasto) no caixa do Studio.
   * @param {Object} transacaoDTO - Detalhes do caixa (descrição, valor, tipo de movimentação, categoria).
   */
  registrarTransacao: (transacaoDTO) =>
    apiClient
      .post('/financeiro', transacaoDTO)
      .then((res) => res.data)
      .catch((err) => {
        console.error('❌ Erro ao registrar transação financeira:', err);
        throw err;
      }),

  /**
   * GET /financeiro/resumo
   * Compila o resumo mensal consolidando o balanço total de entradas, saídas e faturamento líquido para os dashboards.
   */
  obterResumoMensal: () =>
    apiClient
      .get('/financeiro/resumo')
      .then((res) => res.data)
      .catch((err) => {
        console.error('❌ Erro ao obter resumo financeiro mensal:', err);
        throw err;
      }),
};

/**
 * ALIASES DE COMPATIBILIDADE
 * Métodos expostos de forma avulsa para manter a integridade de componentes que importavam as funções fora do objeto unificado financeAPI.
 */
export const listarFluxoCaixa = financeAPI.listarPorPeriodo;
export const registrarMovimentacaoFinanceira = financeAPI.registrarTransacao;
export const obterResumoFinanceiro = financeAPI.obterResumoMensal;