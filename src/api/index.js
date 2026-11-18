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

// 6. LOACIS DE ATENDIMENTO (Filiais e Salas Físicas)
export { 
  listarLocais,
  buscarLocalPorId,
  salvarLocal,
  atualizarLocal,
  alternarStatusLocal
} from './locals';

// 7. HORÁRIOS COMERCIAIS (Horário de expediente, turnos e janelas de almoço)
export { 
  listarHorarioComercial,
  salvarHorarioComercial,
  atualizarHorarioComercial,
} from './hours';


// 6. CONFIGURAÇÕES (Locais e Horários Comerciais - Mapeamento com Backend)
export {
  obterConfiguracoes,
  salvarConfiguracoes,
  alternarTemaRapido,
  mudarIdiomaSistema,
  alternarPushRapido,
  alternarEmailRapido,
  exportarDadosBanco
} from './settings';

// 7. AUTENTICAÇÃO E USUÁRIOS
export {
  realizarLogin,
  registrarUsuario
} from './auth';

// 8. CONFIGURAÇÃO DO AXIOS
export { apiClient } from './axiosConfig';
export { default as apiClientDefault } from './axiosConfig';