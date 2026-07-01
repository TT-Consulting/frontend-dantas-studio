// Central export point for all API services

// 1. SERVIÇOS (Catálogo)
export {
  listarServicos,
  listarServicosAtivos,
  criarServico,
  editarServico,
  inativarServico,
  consultarHistoricoPrecos,
  buscarServicosComFiltro
} from './services';

// 2. CLIENTES E ANAMNESE
export { 
  listarClientes, 
  buscarClientePorId, 
  salvarCliente, 
  atualizarCliente, 
  alternarStatusCliente,
  inativarCliente, 
  ativarCliente,
  listarClientesInativos,
  pesquisarClientes
} from './clients';

// 3. AGENDAMENTOS (Agenda e Fluxo de Booking)
export {
  listarAgendamentos,
  buscarAgendamentosPorPeriodo,
  criarAgendamento,
  salvarAgendamento,
  finalizarAtendimento,
  cancelarAgendamento,
  buscarDisponibilidade,
  verificarDisponibilidade,
  buscarAgendamentosPorCliente,
  buscarAgendamentoPorId,
  atualizarAgendamento,
  deletarAgendamentoCompleto
} from './bookings';

// 4. GESTÃO FINANCEIRA
export { 
  financeAPI,
  listarFluxoCaixa,
  registrarMovimentacaoFinanceira,
  obterResumoFinanceiro,
  listarDespesasFiltradas
} from './finance';

// 5. ESTOQUE E INSUMOS (Novo módulo extraído)
export {
  listarEstoque,
  listarMateriaisEstoque,
  listarItensCriticos,
  salvarMaterial,
  ajustarQuantidade,
  consumirMaterial,
  alternarStatusMaterial
} from './inventory';

// 6. CONFIGURAÇÕES (Locais e Horários Comerciais - Novo módulo extraído)
export {
  listarLocais,
  salvarLocal,
  atualizarLocal,
  alternarStatusLocal,
  listarHorarioComercial,
  salvarHorarioComercial,
  atualizarHorarioComercial
} from './settings';

// 7. CONFIGURAÇÃO DO AXIOS
export { apiClient } from './axiosConfig';
export { default as apiClientDefault } from './axiosConfig';