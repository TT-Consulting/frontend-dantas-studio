// src/app/components/finance.js
import { apiClient } from './axiosConfig';

export const financeAPI = {
  // GET /financeiro/fluxo-caixa?inicio=YYYY-MM-DD&fim=YYYY-MM-DD
  listarPorPeriodo: (inicio, fim) =>
    apiClient
      .get('/financeiro/fluxo-caixa', { params: { inicio, fim } })
      .then((res) => res.data)
      .catch((err) => {
        console.error('❌ Erro ao listar fluxo de caixa:', err);
        throw err;
      }),

  // POST /financeiro
  registrarTransacao: (transacaoDTO) =>
    apiClient
      .post('/financeiro', transacaoDTO)
      .then((res) => res.data)
      .catch((err) => {
        console.error('❌ Erro ao registrar transação:', err);
        throw err;
      }),

  // GET /financeiro/resumo
  obterResumoMensal: () =>
    apiClient
      .get('/financeiro/resumo')
      .then((res) => res.data)
      .catch((err) => {
        console.error('❌ Erro ao obter resumo financeiro:', err);
        throw err;
      }),
}