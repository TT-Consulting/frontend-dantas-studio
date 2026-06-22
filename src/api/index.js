// Central export point for all API services
export * from './services';

// CORREÇÃO DOS CLIENTES (Evitando star export conflitante)
export { 
  listarClientes, 
  buscarClientePorId, 
  salvarCliente, 
  atualizarCliente, 
  inativarCliente, 
  ativarCliente 
} from './clients';

// CORREÇÃO DOS AGENDAMENTOS: Exportando as novas funções nomeadas
export {
  listarAgendamentos,
  buscarAgendamentosPorPeriodo,
  criarAgendamento,
  finalizarAtendimento,
  cancelarAgendamento,
  buscarDisponibilidade,
  buscarAgendamentoPorId,
  atualizarAgendamento,
  deletarAgendamentoCompleto
} from './bookings';

export { financeAPI } from './finance';
export { apiClient } from './axiosConfig';
export { default as apiClientDefault } from './axiosConfig';