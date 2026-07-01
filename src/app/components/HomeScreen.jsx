import { useState, useEffect } from 'react';
import {
  listarClientes,
  listarServicosAtivos,
  listarHorarioComercial,
  criarAgendamento,
  listarAgendamentos,
  salvarCliente,
  atualizarCliente,
  alternarStatusCliente
} from '../../api';
import { X, Phone, Mail, MapPin, Calendar, User, Edit2 } from 'lucide-react';

// Subcomponentes fiéis ao modelo antigo
import { AgendaTab } from './AgendaTab';
import { ClientsTab } from './ClientsTab';
import { NewAppointmentModal } from './NewAppointmentModal';

export function HomeScreen({
  onServiceCatalogClick,
  onAutomationClick,
  onProcessFlowClick,
  onSettingsClick,
  onLogout,
  onVerProximosAgendamentos
}) {
  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [clientsError, setClientsError] = useState(null);
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState(null);
  const [businessHours, setBusinessHours] = useState([]);

  // Novos estados para integração real da agenda
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('agenda');
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const [selectedClient, setSelectedClient] = useState(null);
  const [editData, setEditData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showClientInfoModal, setShowClientInfoModal] = useState(false);

  const [newAppointment, setNewAppointment] = useState({
    service: '',
    location: 'Studio',
    date: '',
    time: '',
    clientId: '',
  });

  // Estados para gerenciar clientes
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    whatsapp: '',
    email: '',
    dataNascimento: '',
    genero: '',
    alergias: '',
    condicoesSaude: '',
    possuiUnhasEncravadas: false,
    sensibilidadeExcessiva: false,
    possuiMicoseFungos: false,
    localidade: '',
    endereco: ''
  });

  // Utility functions
  const formatPhoneNumber = (phone) => {
    if (!phone) return 'Não informado';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    } else if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return 'Não informado';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return `${age} anos`;
  };

  const mapClientFromApi = (client) => ({
    id: String(client.idCliente ?? client.id_cliente ?? client.id),
    idCliente: client.idCliente ?? client.id_cliente ?? client.id, // Keep numeric ID for backend
    name: client.nomeCliente ?? client.nome_cliente ?? client.nome ?? 'Cliente Sem Nome',
    phone: client.whatsapp ?? client.telefone ?? '',
    email: client.email ?? '',
    status: client.isAtivo ? 'active' : 'inactive',
    lastVisit: client.ultimaVisita ?? client.ultima_visita ?? '—',
    totalVisits: client.totalVisitas ?? client.total_visitas ?? 0,
    localidade: client.localidade ?? client.cidade ?? '',
    cep: client.cep ?? '',
    logradouro: client.logradouro ?? client.endereco ?? '',
    bairro: client.bairro ?? '',
    numero: client.numero ?? '',
    endereco: client.endereco ?? client.logradouro ?? '',
    dataNascimento: client.dataNascimento ?? '',
    genero: client.genero ?? '',
    alergias: client.alergias ?? '',
    condicoesSaude: client.condicoesSaude ?? '',
    observacoes: client.observacoes ?? '',
    isAtivo: client.isAtivo ?? true,
    possuiUnhasEncravadas: client.possuiUnhasEncravadas ?? false,
    sensibilidadeExcessiva: client.sensibilidadeExcessiva ?? false,
    possuiMicoseFungos: client.possuiMicoseFungos ?? false
  });

  // Efeito para carregar os agendamentos da API em tempo real
  useEffect(() => {
    const fetchAppointments = async () => {
      setAppointmentsLoading(true);
      setAppointmentsError(null);
      try {
        // Se sua API já possuir o listarAgendamentos implementado, descomente a linha abaixo:
        // const data = await listarAgendamentos();

        // Exemplo de estrutura esperado que sua API vai retornar (substitua pelo retorno real)
        const data = [];
        setAppointments(data);
      } catch (err) {
        setAppointmentsError('Erro ao carregar agendamentos em tempo real.');
        console.error(err);
      } finally {
        setAppointmentsLoading(false);
      }
    };

    if (activeTab === 'agenda') {
      fetchAppointments();
    }
  }, [activeTab]);

  useEffect(() => {
    const fetchServices = async () => {
      setServicesLoading(true);
      try {
        const data = await listarServicosAtivos();
        setServices(data);
      } catch (err) {
        setServicesError('Erro ao carregar catálogo.');
      } finally {
        setServicesLoading(false);
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    const fetchClients = async () => {
      setClientsLoading(true);
      setClientsError(null);
      try {
        const data = await listarClientes(searchQuery);
        setClients(data.map(mapClientFromApi));
      } catch (err) {
        setClientsError('Erro ao carregar lista de clientes.');
        console.error(err);
      } finally {
        setClientsLoading(false);
      }
    };
    fetchClients();
  }, [searchQuery]);

  useEffect(() => {
    const fetchBusinessHours = async () => {
      try {
        const data = await listarHorarioComercial();
        setBusinessHours(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBusinessHours();
  }, []);

  // Filtragem em tempo real baseada na data de hoje do sistema
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(app => {
    // Altere o campo 'date' conforme a propriedade que vem do seu backend (ex: app.dataHoraInicio)
    const appDate = app.date || app.dataHoraInicio?.split('T')[0];
    return appDate === todayStr;
  });

  // Estatísticas baseadas nos dados dinâmicos da API
  const stats = {
    today: todayAppointments.length,
    pending: todayAppointments.filter(a => a.status === 'pending' || a.status === 'Pendente').length,
    revenue: todayAppointments.reduce((acc, curr) => acc + (parseFloat(curr.price?.replace('R$', '').replace(',', '.')) || 0), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    clients: clients.length
  };

  const handleNewAppointmentChange = (field, value) => {
    setNewAppointment(prev => ({ ...prev, [field]: value }));
  };

const handleSaveNewAppointment = async () => {
  // 1. Força a conversão garantindo que estamos lendo a propriedade 'service' preenchida pelo modal
  const serviceId = parseInt(newAppointment.service, 10);
  const clientId = parseInt(newAppointment.clientId, 10);

  // 2. Validações preventivas robustas no front-end
  if (!newAppointment.service || isNaN(serviceId)) {
    alert('Por favor, selecione um serviço válido.');
    return;
  }
  if (!newAppointment.clientId || isNaN(clientId)) {
    alert('Por favor, selecione uma cliente.');
    return;
  }
  if (!newAppointment.date || !newAppointment.time) {
    alert('Por favor, preencha a data e o horário.');
    return;
  }

  // 3. Monta o DTO exatamente como o Kotlin espera receber (like BookingScreen)
  const agendamentoDTO = {
    dataHoraInicio: `${newAppointment.date}T${newAppointment.time}:00`,
    taxaDeslocamento: newAppointment.location === 'Domicilio' ? 15.0 : 0.0,
    tipoLocal: newAppointment.location === 'Domicilio' ? 'DOMICILIO' : 'STUDIO',
    cepAtendimento: newAppointment.location === 'Domicilio' ? '' : null,
    isManual: true, // Mark as manual appointment since it's from HomeScreen
    servicos: [{ idServico: serviceId }], // Send as array of objects with idServico
    cliente: { idCliente: clientId }
  };

  // Log preventivo para checar no console do navegador antes de disparar a requisição
  console.log("📤 Enviando DTO de Agendamento:", agendamentoDTO);

  try {
    const result = await criarAgendamento(agendamentoDTO);
    console.log("✅ Agendamento criado com sucesso!", result);
    alert('Agendamento realizado com sucesso!');
    setShowNewAppointmentModal(false);

    // Limpa o estado do formulário para o próximo uso
    setNewAppointment({
      service: '',
      location: 'Studio',
      date: '',
      time: '',
      clientId: '',
    });

    // Força a atualização da lista/aba
    setActiveTab('agenda');
  } catch (err) {
    console.error("❌ Erro ao salvar agendamento:", err);
    // Exibe a mensagem exata retornada pelo backend se houver
    const msgErro = err.response?.data?.mensagem || 'Erro ao realizar o agendamento.';
    alert(msgErro);
  }
};

  const openClientDetails = (client, triggerEdit = false) => {
    if (triggerEdit) {
      setEditingClient(client);
      setFormData({
        nome: client.name,
        whatsapp: client.phone,
        email: client.email,
        dataNascimento: client.dataNascimento || '',
        genero: client.genero || '',
        alergias: client.alergias || '',
        condicoesSaude: client.condicoesSaude || '',
        possuiUnhasEncravadas: client.possuiUnhasEncravadas,
        sensibilidadeExcessiva: client.sensibilidadeExcessiva,
        possuiMicoseFungos: client.possuiMicoseFungos,
        localidade: client.localidade || '',
        endereco: client.endereco || ''
      });
      setShowClientInfoModal(false);
      setIsModalOpen(true);
    } else {
      setSelectedClient(client);
      setShowClientInfoModal(true);
    }
  };

  const handleNewClientClick = () => {
    setEditingClient(null);
    setFormData({
      nome: '',
      whatsapp: '',
      email: '',
      dataNascimento: '',
      genero: '',
      alergias: '',
      condicoesSaude: '',
      possuiUnhasEncravadas: false,
      sensibilidadeExcessiva: false,
      possuiMicoseFungos: false,
      localidade: '',
      endereco: ''
    });
    setIsModalOpen(true);
  };

  const handleSubmitForm = async () => {
    try {
      if (editingClient) {
        await atualizarCliente(editingClient.idCliente, formData);
      } else {
        await salvarCliente(formData);
      }
      await carregarClientes(); // Recarrega a lista
      setIsModalOpen(false);
    } catch (err) {
      console.error("Erro ao salvar cliente", err);
    }
  };

  const handleToggleStatus = async (client, e) => {
    e.stopPropagation();
    try {
      await alternarStatusCliente(client.idCliente, !client.isAtivo);
      await carregarClientes(); // Recarrega a lista
    } catch (err) {
      console.error("Erro ao alterar status do cliente", err);
    }
  };

  // Função para recarregar clientes
  const carregarClientes = async () => {
    setClientsLoading(true);
    setClientsError(null);
    try {
      const data = await listarClientes(searchQuery);
      setClients(data.map(mapClientFromApi));
    } catch (err) {
      setClientsError('Erro ao carregar lista de clientes.');
      console.error(err);
    } finally {
      setClientsLoading(false);
    }
  };

  return (
    <div className="pb-24 lg:pb-8 px-5 lg:px-8 pt-6">
      {/* Header Fiel */}
      <div className="mb-6">
        <div className="mb-4">
          <h2 className="text-primary font-bold text-2xl">Bem-vinda, Annika!</h2>
          <p className="text-gray-600 text-sm capitalize">
            {new Date().toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long'
            })}
          </p>
        </div>

        {/* Tabs Clássicas e Responsivas */}
        <div className="flex gap-2 max-w-md">
          <button
            onClick={() => setActiveTab('agenda')}
            className={`flex-1 py-3 rounded-xl font-medium transition-all text-center ${activeTab === 'agenda'
                ? 'bg-primary text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200'
              }`}
          >
            Agenda
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            className={`flex-1 py-3 rounded-xl font-medium transition-all text-center ${activeTab === 'clients'
                ? 'bg-primary text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200'
              }`}
          >
            Clientes
          </button>
        </div>
      </div>

      {activeTab === 'agenda' ? (
        <AgendaTab
          todayAppointments={todayAppointments}
          stats={stats}
          loading={appointmentsLoading}
          error={appointmentsError}
          openAppointmentDetails={setSelectedAppointment}
          openNewAppointmentModal={() => setShowNewAppointmentModal(true)}
          onServiceCatalogClick={onServiceCatalogClick}
          onAutomationClick={onAutomationClick}
          onProcessFlowClick={onProcessFlowClick}
          onVerProximosAgendamentos={onVerProximosAgendamentos || (() => alert('Navegar para próximos agendamentos...'))}
        />
      ) : (
        <ClientsTab
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          stats={stats}
          filteredClients={clients}
          openClientDetails={openClientDetails}
          handleNewClientClick={handleNewClientClick}
          handleToggleStatus={handleToggleStatus}
          clientsLoading={clientsLoading}
          clientsError={clientsError}
        />
      )}

      {/* Modal para adicionar/editar clientes */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center p-0 md:p-4 transition-opacity animate-fadeIn">
          <div className="absolute inset-0" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-t-3xl md:rounded-2xl w-full max-w-md max-h-[85vh] md:max-h-[90vh] overflow-y-auto z-10 shadow-2xl relative flex flex-col animate-slideUp">
            <div className="sticky top-0 bg-white px-5 py-4 shrink-0 z-10 shadow-sm border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">{editingClient ? 'Editar Cliente' : 'Novo Cliente'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="px-5 py-4 space-y-4 overflow-y-auto">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Nome</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">WhatsApp</label>
                <input
                  type="text"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                  placeholder="email@exemplo.com"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Localidade</label>
                <input
                  type="text"
                  value={formData.localidade}
                  onChange={(e) => setFormData({ ...formData, localidade: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                  placeholder="Cidade, Bairro"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Endereço</label>
                <input
                  type="text"
                  value={formData.endereco}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                  placeholder="Rua, Número"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Data de Nascimento</label>
                <input
                  type="date"
                  value={formData.dataNascimento}
                  onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Gênero</label>
                <select
                  value={formData.genero}
                  onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                >
                  <option value="">Selecione</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Alergias</label>
                <textarea
                  value={formData.alergias}
                  onChange={(e) => setFormData({ ...formData, alergias: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                  placeholder="Descreva alergias, se houver"
                  rows={2}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Condições de Saúde</label>
                <textarea
                  value={formData.condicoesSaude}
                  onChange={(e) => setFormData({ ...formData, condicoesSaude: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                  placeholder="Descreva condições de saúde relevantes"
                  rows={2}
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 block">Observações de Saúde</label>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.possuiUnhasEncravadas}
                    onChange={(e) => setFormData({ ...formData, possuiUnhasEncravadas: e.target.checked })}
                    className="w-5 h-5 text-primary"
                  />
                  <span className="text-gray-700 text-sm">Tendência a unhas encravadas</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.sensibilidadeExcessiva}
                    onChange={(e) => setFormData({ ...formData, sensibilidadeExcessiva: e.target.checked })}
                    className="w-5 h-5 text-primary"
                  />
                  <span className="text-gray-700 text-sm">Sensibilidade cutânea excessiva</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.possuiMicoseFungos}
                    onChange={(e) => setFormData({ ...formData, possuiMicoseFungos: e.target.checked })}
                    className="w-5 h-5 text-primary"
                  />
                  <span className="text-gray-700 text-sm">Histórico ou presença de micose/fungos</span>
                </div>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-gray-100">
              <div className="flex gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmitForm}
                  className="flex-1 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90"
                >
                  {editingClient ? 'Salvar Alterações' : 'Adicionar Cliente'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <NewAppointmentModal
        show={showNewAppointmentModal}
        onClose={() => setShowNewAppointmentModal(false)}
        newAppointment={newAppointment}
        handleNewAppointmentChange={handleNewAppointmentChange}
        services={services}
        servicesLoading={servicesLoading}
        servicesError={servicesError}
        availableTimeSlots={['09:00', '09:30', '10:00', '10:30', '11:00']}
        bookedTimeSlots={[]}
        clients={clients}
        handleSaveNewAppointment={handleSaveNewAppointment}
      />

      {/* Modal para ver informações do cliente */}
      {showClientInfoModal && selectedClient && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center p-0 md:p-4 transition-opacity animate-fadeIn">
          <div className="absolute inset-0" onClick={() => setShowClientInfoModal(false)}></div>
          <div className="bg-white rounded-t-3xl md:rounded-2xl w-full max-w-md max-h-[85vh] md:max-h-[90vh] overflow-y-auto z-10 shadow-2xl relative flex flex-col animate-slideUp">
            <div className="sticky top-0 bg-white px-5 py-4 shrink-0 z-10 shadow-sm border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Informações do Cliente</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openClientDetails(selectedClient, true)}
                  className="p-1.5 hover:bg-gray-100 rounded-full text-primary"
                >
                  <Edit2 size={20} />
                </button>
                <button onClick={() => setShowClientInfoModal(false)} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-600">
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="px-5 py-6 space-y-6 overflow-y-auto">
              {/* Nome e Avatar */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold text-2xl">
                    {selectedClient.name ? selectedClient.name.charAt(0) : 'U'}
                  </span>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-800">{selectedClient.name}</h4>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 ${selectedClient.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {selectedClient.status === 'active' ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>

              {/* Dados Básicos */}
              <div className="space-y-4">
                <h5 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Dados Básicos</h5>
                
                <div className="flex items-center gap-3">
                  <User size={18} className="text-gray-400" />
                  <span className="text-gray-700">
                    Gênero: {selectedClient.genero || 'Não informado'}
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-gray-400" />
                  <span className="text-gray-700">
                    Idade: {calculateAge(selectedClient.dataNascimento)}
                  </span>
                </div>
              </div>

              {/* Dados de Contato */}
              <div className="space-y-4">
                <h5 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Contato</h5>
                
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-gray-400" />
                  <span className="text-gray-700">
                    {formatPhoneNumber(selectedClient.phone)}
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-gray-400" />
                  <span className="text-gray-700">
                    {selectedClient.email || 'Não informado'}
                  </span>
                </div>
              </div>

              {/* Dados de Endereço */}
              <div className="space-y-4">
                <h5 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Endereço</h5>
                
                {selectedClient.cep && (
                  <div className="flex items-center gap-3">
                    <MapPin size={18} className="text-gray-400" />
                    <span className="text-gray-700">CEP: {selectedClient.cep}</span>
                  </div>
                )}
                
                {selectedClient.logradouro && (
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-gray-400 mt-0.5" />
                    <span className="text-gray-700">
                      {selectedClient.logradouro}
                      {selectedClient.numero && `, ${selectedClient.numero}`}
                    </span>
                  </div>
                )}
                
                {selectedClient.bairro && (
                  <div className="flex items-center gap-3">
                    <MapPin size={18} className="text-gray-400" />
                    <span className="text-gray-700">Bairro: {selectedClient.bairro}</span>
                  </div>
                )}
                
                {selectedClient.localidade && (
                  <div className="flex items-center gap-3">
                    <MapPin size={18} className="text-gray-400" />
                    <span className="text-gray-700">Localidade: {selectedClient.localidade}</span>
                  </div>
                )}
              </div>

              {/* Saúde */}
              <div className="space-y-4">
                <h5 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Saúde</h5>
                
                {selectedClient.alergias && (
                  <div className="bg-yellow-50 p-3 rounded-xl">
                    <p className="text-xs font-semibold text-yellow-800 mb-1">Alergias</p>
                    <p className="text-gray-700 text-sm">{selectedClient.alergias}</p>
                  </div>
                )}
                
                {selectedClient.condicoesSaude && (
                  <div className="bg-blue-50 p-3 rounded-xl">
                    <p className="text-xs font-semibold text-blue-800 mb-1">Restrições de Saúde</p>
                    <p className="text-gray-700 text-sm">{selectedClient.condicoesSaude}</p>
                  </div>
                )}
                
                {selectedClient.observacoes && (
                  <div className="bg-gray-50 p-3 rounded-xl">
                    <p className="text-xs font-semibold text-gray-700 mb-1">Observações</p>
                    <p className="text-gray-700 text-sm">{selectedClient.observacoes}</p>
                  </div>
                )}

                {/* Observações de Saúde (Tags) */}
                <div className="space-y-2">
                  {selectedClient.possuiUnhasEncravadas && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold">
                      Unhas encravadas
                    </span>
                  )}
                  {selectedClient.sensibilidadeExcessiva && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                      Sensibilidade excessiva
                    </span>
                  )}
                  {selectedClient.possuiMicoseFungos && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                      Micose/fungos
                    </span>
                  )}
                </div>
              </div>

              {/* Estatísticas */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl text-center">
                  <p className="text-2xl font-bold text-primary">{selectedClient.totalVisits}</p>
                  <p className="text-sm text-gray-600">Visitas</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl text-center">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Última visita</p>
                  <p className="text-xs text-gray-600">
                    {selectedClient.lastVisit && selectedClient.lastVisit !== '—'
                      ? new Date(selectedClient.lastVisit).toLocaleDateString('pt-BR')
                      : '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}