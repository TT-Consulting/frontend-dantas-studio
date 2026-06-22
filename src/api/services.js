import { apiClient } from './axiosConfig';

//  ============================ Catálogo de Serviços ============================
export const listarServicos = () =>
  apiClient
    .get('/servicos')
    .then((res) => res)
    .catch((err) => {
      throw err;
    });

// Retorna somente serviços ativos para uso no fluxo de agendamento
export const listarServicosAtivos = () =>
  apiClient
    .get('/servicos/ativos')
    .then((res) => res.data)
    .catch((err) => {
      console.error('❌ Erro ao listar serviços ativos:', err);
      throw err;
    });

export const criarServico = (servicoDTO) =>
  apiClient
    .post('/servicos', servicoDTO)
    .then((res) => res)
    .catch((err) => {
      throw err;
    });

export const editarServico = (id, servicoDTO) =>
  apiClient
    .put(`/servicos/${id}`, servicoDTO)
    .then((res) => res)
    .catch((err) => {
      throw err;
    });

export const inativarServico = (id) =>
  apiClient
    .patch(`/servicos/${id}/inativar`)
    .then((res) => res)
    .catch((err) => {
      throw err;
    });

export const consultarHistoricoPrecos = (id) =>
  apiClient
    .get(`/servicos/${id}/historico`)
    .then((res) => res)
    .catch((err) => {
      throw err;
    });

export const buscarServicosComFiltro = (filtros) =>
  apiClient
    .get('/servicos/filtro', { params: filtros })
    .then((res) => res)
    .catch((err) => {
      throw err;
    });

// ========================= Estoque / Materiais ========================   
export const listarEstoque = () =>
  apiClient
    .get('/estoque')
    .then((res) => res.data)
    .catch((err) => {
      console.error('❌ Erro ao listar estoque:', err);
      throw err;
    });

export const listarMateriaisEstoque = () =>
  apiClient
    .get('/estoque')
    .then((res) => {
      const materiais = Array.isArray(res?.data) ? res.data : [];
      return materiais.filter((m) => m.isAtivo === true || m.ativo === true);
    })
    .catch((err) => {
      console.error('❌ Erro ao listar materiais ativos:', err);
      throw err;
    });

export const listarItensCriticos = () =>
  apiClient
    .get('/estoque/critico')
    .then((res) => res.data)
    .catch((err) => {
      console.error('❌ Erro ao listar itens críticos:', err);
      throw err;
    });

export const salvarMaterial = (materialDTO) =>
  apiClient
    .post('/estoque', materialDTO)
    .then((res) => {
      console.log('✅ Material salvo com sucesso:', res.data);
      return res.data;
    })
    .catch((err) => {
      console.error('❌ Erro ao salvar material:', err);
      throw err;
    });

export const ajustarQuantidade = (id, quantidade) =>
  apiClient
    .patch(`/estoque/${id}/ajustar`, null, { params: { quantidade } })
    .then((res) => {
      console.log(`✅ Quantidade ajustada para material ${id}:`, res.data);
      return res.data;
    })
    .catch((err) => {
      console.error(`❌ Erro ao ajustar quantidade do material ${id}:`, err);
      throw err;
    });

export const consumirMaterial = (id, quantidade) =>
  apiClient
    .patch(`/estoque/${id}/consumir`, null, { params: { quantidade } })
    .then((res) => {
      console.log(`✅ Material ${id} consumido:`, res.data);
      return res.data;
    })
    .catch((err) => {
      console.error(`❌ Erro ao consumir material ${id}:`, err);
      throw err;
    });

export const alternarStatusMaterial = (id, ativar = true) =>
  apiClient
    .patch(`/estoque/${id}/${ativar ? 'ativar' : 'desativar'}`)
    .then((res) => {
      console.log(`✅ Status do material ${id} alterado para ${ativar ? 'ativo' : 'inativo'}:`, res.data);
      return res.data;
    })
    .catch((err) => {
      console.error(`❌ Erro ao alterar status do material ${id}:`, err);
      throw err;
    });

// ========================= Locais de Atendimento ========================   
export const listarLocais = () =>
  apiClient
    .get('/locais')
    .then((res) => res.data)
    .catch((err) => {
      console.error('❌ Erro ao listar locais:', err);
      throw err;
    });

export const salvarLocal = (localDTO) =>
  apiClient
    .post('/locais', localDTO)
    .then((res) => res.data)
    .catch((err) => {
      console.error('❌ Erro ao salvar local:', err);
      throw err;
    });

export const atualizarLocal = (id, localDTO) =>
  apiClient
    .put(`/locais/${id}`, localDTO)
    .then((res) => res.data)
    .catch((err) => {
      console.error(`❌ Erro ao atualizar local ${id}:`, err);
      throw err;
    });

export const alternarStatusLocal = (id, ativar = true) =>
  apiClient
    .patch(`/locais/${id}/${ativar ? 'ativar' : 'desativar'}`)
    .then((res) => res.data)
    .catch((err) => {
      console.error(`❌ Erro ao alterar status do local ${id}:`, err);
      throw err;
    });

// ========================= Clientes e Anamnese ========================   
export const listarClientes = (nome = '') =>
  apiClient
    .get('/clientes', { params: { nome } })
    .then((res) => res.data)
    .catch((err) => {
      console.error('❌ Erro ao listar clientes:', err);
      throw err;
    });

export const buscarClientePorId = (id) =>
  apiClient
    .get(`/clientes/${id}`)
    .then((res) => res.data)
    .catch((err) => {
      console.error(`❌ Erro ao buscar cliente ${id}:`, err);
      throw err;
    });

export const salvarCliente = (clienteDTO) =>
  apiClient
    .post('/clientes', clienteDTO)
    .then((res) => res.data)
    .catch((err) => {
      console.error('❌ Erro ao salvar cliente:', err);
      throw err;
    });

export const atualizarCliente = (id, clienteDTO) =>
  apiClient
    .put(`/clientes/${id}`, clienteDTO)
    .then((res) => res.data)
    .catch((err) => {
      console.error(`❌ Erro ao atualizar cliente ${id}:`, err);
      throw err;
    });

export const alternarStatusCliente = (id, ativar = true) =>
  apiClient
    .patch(`/clientes/${id}/${ativar ? 'ativar' : 'inativar'}`)
    .then((res) => res.data)
    .catch((err) => {
      console.error(`❌ Erro ao alterar status do cliente ${id}:`, err);
      throw err;
    });

// ========================= Agendamentos ========================   
export const salvarAgendamento = (agendamentoDTO) =>
  apiClient
    .post('/agendamentos', agendamentoDTO)
    .then((res) => res.data)
    .catch((err) => {
      console.error('❌ Erro ao salvar agendamento:', err);
      throw err;
    });

export const listarAgendamentos = (filtros = {}) =>
  apiClient
    .get('/agendamentos', { params: filtros })
    .then((res) => res.data)
    .catch((err) => {
      console.error('❌ Erro ao listar agendamentos:', err);
      throw err;
    });

export const buscarAgendamentoPorId = (id) =>
  apiClient
    .get(`/agendamentos/${id}`)
    .then((res) => res.data)
    .catch((err) => {
      console.error(`❌ Erro ao buscar agendamento ${id}:`, err);
      throw err;
    });

export const atualizarAgendamento = (id, agendamentoDTO) =>
  apiClient
    .put(`/agendamentos/${id}`, agendamentoDTO)
    .then((res) => res.data)
    .catch((err) => {
      console.error(`❌ Erro ao atualizar agendamento ${id}:`, err);
      throw err;
    });

export const cancelarAgendamento = (id) =>
  apiClient
    .patch(`/agendamentos/${id}/cancelar`)
    .then((res) => res.data)
    .catch((err) => {
      console.error(`❌ Erro ao cancelar agendamento ${id}:`, err);
      throw err;
    });

export const verificarDisponibilidade = (data, hora, duracao) =>
  apiClient
    .get('/agendamentos/disponibilidade', { params: { data, hora, duracao } })
    .then((res) => res.data)
    .catch((err) => {
      console.error('❌ Erro ao verificar disponibilidade:', err);
      throw err;
    });

// Busca disponibilidade por data e serviço (retorna horários liberados para a duração do serviço)
export const buscarDisponibilidade = (data, idServico) =>
  apiClient
    .get('/agendamentos/disponibilidade', { params: { data, idServico } })
    .then((res) => res.data)
    .catch((err) => {
      console.error('❌ Erro ao buscar horários:', err);
      return [];
    });

// Cria agendamento final (alias mais semântico para o fluxo do Booking)
export const criarAgendamento = (dadosAgendamento) =>
  apiClient
    .post('/agendamentos', dadosAgendamento)
    .then((res) => res.data)
    .catch((err) => {
      console.error('❌ Erro ao criar agendamento:', err);
      throw err;
    });
// ========================= Horário Comercial ========================
export const listarHorarioComercial = () =>
  apiClient
    .get('/horario-comercial')
    .then((res) => res.data)
    .catch((err) => {
      console.error('❌ Erro ao listar horário comercial:', err);
      throw err;
    });

export const salvarHorarioComercial = (horarioDTO) =>
  apiClient
    .post('/horario-comercial', horarioDTO)
    .then((res) => res.data)
    .catch((err) => {
      console.error('❌ Erro ao salvar horário comercial:', err);
      throw err;
    });

export const atualizarHorarioComercial = (id, horarioDTO) =>
  apiClient
    .put(`/horario-comercial/${id}`, horarioDTO)
    .then((res) => res.data)
    .catch((err) => {
      console.error(`❌ Erro ao atualizar horário comercial ${id}:`, err);
      throw err;
    });

// ========================= Módulo Financeiro ========================   
export const listarFluxoCaixa = (inicio, fim) =>
  apiClient
    .get('/financeiro/fluxo-caixa', { params: { inicio, fim } })
    .then((res) => res.data)
    .catch((err) => {
      console.error(`❌ Erro ao listar fluxo de caixa de ${inicio} a ${fim}:`, err);
      throw err;
    });

export const registrarMovimentacaoFinanceira = (transacaoDTO) =>
  apiClient
    .post('/financeiro', transacaoDTO)
    .then((res) => res.data)
    .catch((err) => {
      console.error('❌ Erro ao registrar movimentação no back-end:', err);
      throw err;
    });

export const obterResumoFinanceiro = () =>
  apiClient
    .get('/financeiro/resumo')
    .then((res) => res.data)
    .catch((err) => {
      console.error('❌ Erro ao processar resumo financeiro:', err);
      throw err;
    });