import { apiClient } from './axiosConfig';

/**
 * GET /dashboard/resumo
 * Retorna faturamento do dia, total de agendamentos, confirmados, estoque crítico e próximo agendamento.
 */
export const obterResumoDia = () =>
  apiClient.get('/dashboard/resumo').then((res) => res.data);

/**
 * GET /dashboard/kpis
 * Retorna faturamento do mês atual, anterior e lucro líquido anual.
 */
export const obterKpisMensais = () =>
  apiClient.get('/dashboard/kpis').then((res) => res.data);

/**
 * GET /dashboard/ranking-servicos
 * Retorna o top 4 de serviços mais vendidos.
 */
export const obterRankingServicos = () =>
  apiClient.get('/dashboard/ranking-servicos').then((res) => res.data);

/**
 * GET /dashboard/pagamentos
 * Retorna o faturamento distribuído por meio de pagamento.
 */
export const obterFaturamentoPagamentos = () =>
  apiClient.get('/dashboard/pagamentos').then((res) => res.data);

/**
 * GET /dashboard/vendas-semana
 * Retorna o faturamento diário dos últimos dias.
 */
export const obterVendasSemana = () =>
  apiClient.get('/dashboard/vendas-semana').then((res) => res.data);
