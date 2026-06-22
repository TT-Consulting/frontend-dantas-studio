import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, MapPin, Phone, Plus, Search, Edit2, UserX, Settings, X, AlertTriangle, Loader } from 'lucide-react';
import { DollarSign } from 'lucide-react';
import { listarServicosAtivos, listarHorarioComercial, listarClientes, salvarCliente, atualizarCliente } from '../../api';

export function HomeScreen({
  onServiceCatalogClick,
  onAutomationClick,
  onProcessFlowClick,
  onSettingsClick,
  onLogout,
}) {
  // State: Clients
  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [clientsError, setClientsError] = useState(null);

  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState(null);

  const [businessHours, setBusinessHours] = useState([]);
  const [businessHoursLoading, setBusinessHoursLoading] = useState(false);

  // State: Clients Tab
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [editData, setEditData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // State: Appointments
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [newAppointment, setNewAppointment] = useState({
    service: '',
    location: 'Studio',
    date: '',
    time: '',
    clientId: '',
  });
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);

  // State: UI
  const [activeTab, setActiveTab] = useState('agenda');

  // Stub data for appointments (will be replaced with API)
  const todayAppointments = [
    {
      id: '1',
      client: 'Maria Silva',
      service: 'Manicure Premium',
      time: '10:00',
      duration: '45min',
      phone: '+55 11 98765-4321',
      email: 'maria@email.com',
      status: 'confirmed',
      price: 'R$ 120',
      location: 'Studio',
      allergies: 'Alergia a acetona',
      healthConditions: 'Diabetes tipo 2',
    },
    {
      id: '2',
      client: 'Ana Costa',
      service: 'Pedicure',
      time: '11:00',
      duration: '1h',
      phone: '+55 11 97654-3210',
      email: 'ana@email.com',
      status: 'pending',
      price: 'R$ 100',
      location: 'Studio',
      allergies: 'Nenhuma',
      healthConditions: 'Nenhuma',
    },
  ];

  const formatCurrency = (value) => {
    const num = Number(value || 0);
    return `R$ ${num.toFixed(2).replace('.', ',')}`;
  };

  const mapServiceFromApi = (service, index) => ({
    id: String(service.idServico ?? service.id ?? index),
    name: service.nomeServico ?? service.nome ?? service.titulo ?? 'Serviço',
    price: formatCurrency(service.precoBase ?? service.preco ?? service.valor ?? service.precoEstimado ?? 0),
    raw: service,
  });

  useEffect(() => {
    let active = true;
    const fetchServices = async () => {
      setServicesLoading(true);
      setServicesError(null);
      try {
        const data = await listarServicosAtivos();
        if (active) {
          const mapped = (Array.isArray(data) ? data : []).map(mapServiceFromApi);
          setServices(mapped);
        }
      } catch (error) {
        console.error('❌ Erro ao listar serviços (admin modal):', error);
        if (active) setServicesError('Erro ao carregar serviços.');
      } finally {
        if (active) setServicesLoading(false);
      }
    };
    fetchServices();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const fetchClients = async () => {
      setClientsLoading(true);
      setClientsError(null);
      try {
        const data = await listarClientes('');
        if (active) {
          const mapped = (Array.isArray(data) ? data : []).map((c, idx) => ({
            id: String(c.idCliente ?? c.id ?? idx),
            name: c.nome ?? c.nomeCliente ?? 'Cliente',
            phone: c.whatsapp ?? c.telefone ?? '',
            email: c.email ?? '',
            status: 'active',
            lastVisit: c.ultimaVisita ?? null,
            totalVisits: c.totalVisitas ?? 0,
            whatsapp: c.whatsapp ?? c.telefone ?? '',
            birthDate: c.dataNascimento ?? '',
            gender: c.genero ?? '',
            allergies: c.alergias ?? '',
            healthConditions: c.condicoesSaude ?? '',
            ingrowingNails: c.possuiUnhasEncravadas ?? '',
            sensitivity: c.sensibilidade ?? '',
            fungus: c.possuiMicoseFungos ?? '',
          }));
          setClients(mapped);
        }
      } catch (error) {
        console.error('❌ Erro ao listar clientes:', error);
        if (active) setClientsError('Não foi possível carregar os clientes.');
      } finally {
        if (active) setClientsLoading(false);
      }
    };
    fetchClients();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const fetchBusinessHours = async () => {
      setBusinessHoursLoading(true);
      try {
        const data = await listarHorarioComercial();
        if (active) {
          setBusinessHours(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('❌ Erro ao listar horário comercial:', error);
        setBusinessHours([]);
      } finally {
        if (active) setBusinessHoursLoading(false);
      }
    };
    fetchBusinessHours();
    return () => {
      active = false;
    };
  }, []);

  // Gera slots de 30 em 30 minutos entre hora inicial e final
  const generateTimeSlots = (startTime, endTime) => {
    const slots = [];
    if (!startTime || !endTime) return slots;

    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    let current = new Date();
    current.setHours(startHour, startMin, 0);
    const end = new Date();
    end.setHours(endHour, endMin, 0);

    while (current < end) {
      const hour = String(current.getHours()).padStart(2, '0');
      const min = String(current.getMinutes()).padStart(2, '0');
      slots.push(`${hour}:${min}`);
      current.setMinutes(current.getMinutes() + 30);
    }
    return slots;
  };

  // Gera horários disponíveis baseado na data e horário comercial
  const getAvailableTimeSlots = () => {
    if (!newAppointment.date || businessHours.length === 0) {
      return [];
    }

    // Parse da data: input type="date" pode vir em diferentes formatos
    // Tenta formato YYYY-MM-DD primeiro (padrão), depois DD/MM/YYYY
    let selectedDate;
    if (newAppointment.date.includes('-')) {
      // Formato: YYYY-MM-DD (padrão do input type="date")
      selectedDate = new Date(newAppointment.date + 'T00:00:00');
    } else if (newAppointment.date.includes('/')) {
      // Formato: DD/MM/YYYY
      const [day, month, year] = newAppointment.date.split('/');
      selectedDate = new Date(year, month - 1, day);
    } else {
      return [];
    }

    // Validar se a data é válida
    if (isNaN(selectedDate.getTime())) {
      return [];
    }

    // Corrigir: toLocaleDateString não aceita 'uppercase' como opção
    // Usar 'long' e depois aplicar toUpperCase()
    const dayOfWeek = selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    const dayMap = {
      'SUNDAY': 'SUNDAY',
      'MONDAY': 'MONDAY',
      'TUESDAY': 'TUESDAY',
      'WEDNESDAY': 'WEDNESDAY',
      'THURSDAY': 'THURSDAY',
      'FRIDAY': 'FRIDAY',
      'SATURDAY': 'SATURDAY',
    };
    const normalizedDay = dayMap[dayOfWeek] || dayOfWeek;

    const dayHours = businessHours.find((h) => h.diaSemana === normalizedDay);

    if (!dayHours || !dayHours.ativo) {
      return []; // Dia fechado
    }

    // Extrair apenas HH:mm
    const openTime = dayHours.horaAbertura?.substring(0, 5) || '09:00';
    const closeTime = dayHours.horaFechamento?.substring(0, 5) || '18:00';

    return generateTimeSlots(openTime, closeTime);
  };

  const availableTimeSlots = getAvailableTimeSlots();

  // Horários ocupados (baseado nos agendamentos de hoje)
  const bookedTimeSlots = todayAppointments.map(apt => apt.time);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone.includes(searchQuery)
  );

  const openClientDetails = (client) => {
    setSelectedClient(client);
    setEditData({ ...client });
    setIsEditing(false);
  };

  const closeClientModal = () => {
    setSelectedClient(null);
    setEditData(null);
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    // Validar campos obrigatórios
    if (!editData?.name?.trim()) {
      alert('Nome é obrigatório');
      return;
    }

    if (!editData?.whatsapp?.trim()) {
      alert('WhatsApp é obrigatório');
      return;
    }

    try {
      let savedClient;

      if (editData.id) {
        // Atualizar cliente existente
        const updateDTO = {
          nome: editData.name,
          email: editData.email || null,
          whatsapp: editData.whatsapp,
          dataNascimento: editData.birthDate || null,
          genero: editData.gender || null,
          alergias: editData.allergies || 'Nenhuma',
          condicoesSaude: editData.healthConditions || 'Nenhuma',
          possuiUnhasEncravadas: editData.ingrowingNails === 'sim',
          sensibilidadeExcessiva: editData.sensitivity === 'alta',
          possuiMicoseFungos: editData.fungus === 'sim',
          isAtivo: editData.status === 'active',
        };

        savedClient = await atualizarCliente(Number(editData.id), updateDTO);
        console.log('✅ Cliente atualizado:', savedClient);
      } else {
        // Criar novo cliente
        const newClientDTO = {
          nome: editData.name,
          email: editData.email || null,
          whatsapp: editData.whatsapp,
          dataNascimento: editData.birthDate || null,
          genero: editData.gender || null,
          alergias: editData.allergies || 'Nenhuma',
          condicoesSaude: editData.healthConditions || 'Nenhuma',
          possuiUnhasEncravadas: editData.ingrowingNails === 'sim',
          sensibilidadeExcessiva: editData.sensitivity === 'alta',
          possuiMicoseFungos: editData.fungus === 'sim',
          isAtivo: true,
        };

        savedClient = await salvarCliente(newClientDTO);
        console.log('✅ Cliente criado:', savedClient);
      }

      // Mapear resposta
      const mappedClient = {
        id: String(savedClient.idCliente),
        name: savedClient.nome,
        phone: savedClient.whatsapp,
        email: savedClient.email || '',
        status: savedClient.isAtivo ? 'active' : 'inactive',
        lastVisit: savedClient.ultimaVisita || null,
        totalVisits: savedClient.totalVisitas || 0,
        whatsapp: savedClient.whatsapp,
        birthDate: savedClient.dataNascimento || '',
        gender: savedClient.genero || '',
        allergies: savedClient.alergias || '',
        healthConditions: savedClient.condicoesSaude || '',
        ingrowingNails: savedClient.possuiUnhasEncravadas ? 'sim' : 'não',
        sensitivity: savedClient.sensibilidadeExcessiva ? 'alta' : 'normal',
        fungus: savedClient.possuiMicoseFungos ? 'sim' : 'não',
      };

      // Atualizar lista
      if (editData.id) {
        setClients((prev) => prev.map((c) => (c.id === editData.id ? mappedClient : c)));
      } else {
        setClients((prev) => [mappedClient, ...prev]);
      }

      setSelectedClient(mappedClient);
      setIsEditing(false);
      alert('✅ Cliente salvo com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao salvar cliente:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido';
      alert('❌ Erro ao salvar cliente:\n' + errorMessage);
    }
  };

  const handleEditChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const openAppointmentDetails = (appointment) => {
    setSelectedAppointment(appointment);
  };

  const closeAppointmentModal = () => {
    setSelectedAppointment(null);
  };

  const openNewAppointmentModal = () => {
    setNewAppointment({
      service: '',
      location: 'Studio',
      date: '',
      time: '',
      clientId: '',
    });
    setShowNewAppointmentModal(true);
  };

  const closeNewAppointmentModal = () => {
    setShowNewAppointmentModal(false);
  };

  const handleNewAppointmentChange = (field, value) => {
    setNewAppointment(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveNewAppointment = () => {
    // Aqui você poderia fazer uma requisição para salvar o agendamento no backend
    if (newAppointment.service && newAppointment.date && newAppointment.time && newAppointment.clientId) {
      console.log('Novo agendamento criado:', newAppointment);
      closeNewAppointmentModal();
    } else {
      alert('Por favor, preencha todos os campos');
    }
  };

  const handleCancelAppointment = () => {
    if (!selectedAppointment) return;
    
    const confirmed = window.confirm(
      `Tem certeza que deseja cancelar o atendimento?\n\nCliente: ${selectedAppointment.client}\nServiço: ${selectedAppointment.service}\nHorário: ${selectedAppointment.time}`
    );
    
    if (confirmed) {
      // Aqui você faria a requisição para cancelar no backend
      console.log('Atendimento cancelado:', selectedAppointment.id);
      alert('Atendimento cancelado com sucesso!');
      closeAppointmentModal();
    }
  };

  const stats = {
    today: todayAppointments.length,
    pending: todayAppointments.filter(a => a.status === 'pending').length,
    revenue: 'R$ 1.240',
    clients: clients.length,
  };

  const renderAgendaTab = () => (
    <>
      {/* Stats Cards - Desktop Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 lg:p-5 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Calendar className="text-primary" size={20} />
            </div>
            <div>
              <p className="text-gray-600 text-xs lg:text-sm">Hoje</p>
              <p className="text-primary text-xl lg:text-2xl">{stats.today}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 lg:p-5 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-accent/10 rounded-lg flex items-center justify-center">
              <Clock className="text-accent" size={20} />
            </div>
            <div>
              <p className="text-gray-600 text-xs lg:text-sm">Pendentes</p>
              <p className="text-accent text-xl lg:text-2xl">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 lg:p-5 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-gray-600 text-xs lg:text-sm">Receita Hoje</p>
              <p className="text-green-600 text-xl lg:text-2xl">{stats.revenue}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 lg:p-5 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-gray-600 text-xs lg:text-sm">Clientes</p>
              <p className="text-blue-600 text-xl lg:text-2xl">{stats.clients}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop: Two Column Layout */}
      <div className="lg:grid lg:grid-cols-3 lg:gap-6">
        {/* Today's Appointments */}
        <div className="mb-6 lg:col-span-2 lg:mb-0">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-800">Agenda de Hoje</h3>
            <button
              onClick={openNewAppointmentModal}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Plus size={18} />
              <span className="hidden lg:inline">Novo Agendamento</span>
            </button>
          </div>
          <div className="space-y-3">
            {todayAppointments.map((appointment) => (
              <div
                key={appointment.id}
                onClick={() => openAppointmentDetails(appointment)}
                className="bg-white rounded-xl p-4 lg:p-5 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 lg:w-14 lg:h-14 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Clock className="text-primary" size={20} />
                    </div>
                    <div>
                      <p className="text-primary font-medium lg:text-lg">{appointment.client}</p>
                      <p className="text-gray-600 text-sm lg:text-base">{appointment.service}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-800 font-medium lg:text-lg">{appointment.time}</p>
                    <p className="text-gray-500 text-xs lg:text-sm">{appointment.duration}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Phone size={14} />
                    <span>{appointment.phone}</span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs lg:text-sm ${
                      appointment.status === 'confirmed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {appointment.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions - Desktop Sidebar */}
        <div className="lg:col-span-1">
          <h3 className="text-gray-800 mb-4">Ações Rápidas</h3>
          <div className="space-y-3">
            <button
              onClick={onServiceCatalogClick}
              className="w-full bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all text-left flex items-center gap-3"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Calendar className="text-primary" size={20} />
              </div>
              <div>
                <p className="text-gray-800 font-medium">Catálogo</p>
                <p className="text-gray-500 text-xs">Serviços</p>
              </div>
            </button>

            <button
              onClick={onAutomationClick}
              className="w-full bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all text-left flex items-center gap-3"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Settings className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-gray-800 font-medium">Automação</p>
                <p className="text-gray-500 text-xs">Regras de Automação</p>
              </div>
            </button>

            <button
              onClick={onProcessFlowClick}
              className="w-full bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all text-left flex items-center gap-3"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <MapPin className="text-purple-600" size={20} />
              </div>
              <div>
                <p className="text-gray-800 font-medium">Processos</p>
                <p className="text-gray-500 text-xs">Fluxograma</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );

  const renderClientsTab = () => (
    <>
      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome ou telefone..."
            className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-xl p-4 shadow-md mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users className="text-primary" size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total de Clientes</p>
              <p className="text-primary text-2xl">{stats.clients}</p>
            </div>
          </div>
          <button
            onClick={() => {
              const emptyClient = {
                id: null,
                name: '',
                phone: '',
                email: '',
                status: 'active',
                lastVisit: '—',
                totalVisits: 0,
                whatsapp: '',
                birthDate: '',
                gender: 'Feminino',
                allergies: '',
                healthConditions: '',
                ingrowingNails: 'não',
                sensitivity: 'Normal',
                fungus: 'não',
              };
              setSelectedClient(emptyClient);
              setEditData(emptyClient);
              setIsEditing(true);
            }}
            className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="text-white" size={24} />
          </button>
        </div>
      </div>

      {/* Clients List */}
      {clientsLoading && (
        <div className="text-center py-6 text-primary flex items-center justify-center gap-2">
          <Loader className="animate-spin" size={18} />
          <span>Carregando clientes...</span>
        </div>
      )}

      {clientsError && (
        <div className="text-center py-6 text-red-600 bg-red-50 rounded-xl border border-red-100">
          {clientsError}
        </div>
      )}

      {!clientsLoading && !clientsError && (
        <>
          <div className="space-y-3 pb-4">
            {filteredClients.map((client) => (
              <div
                key={client.id}
                onClick={() => openClientDetails(client)}
                className="bg-white rounded-xl p-4 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-semibold text-lg">
                        {client.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-800 font-medium">{client.name}</p>
                      <p className="text-gray-600 text-sm">{client.phone}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                    Ativa
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium text-primary">{client.totalVisits}</span> visitas
                    {client.lastVisit && (
                      <span className="ml-2">• Última: {new Date(client.lastVisit).toLocaleDateString('pt-BR')}</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openClientDetails(client);
                        setIsEditing(true);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="text-primary" size={16} />
                    </button>
                    <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                      <UserX className="text-red-500" size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredClients.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="text-gray-400" size={32} />
              </div>
              <p className="text-gray-500">Nenhum cliente encontrado</p>
            </div>
          )}
        </>
      )}
    </>
  );

  return (
    <div className="pb-24 lg:pb-8 px-5 lg:px-8 pt-6">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-4">
          <h2 className="text-primary">Bem-vinda, Annika!</h2>
          <p className="text-gray-600 text-sm">
            {new Date().toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long' 
            })}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 max-w-md">
          <button
            onClick={() => setActiveTab('agenda')}
            className={`flex-1 py-3 rounded-xl transition-all ${
              activeTab === 'agenda'
                ? 'bg-primary text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            Agenda
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            className={`flex-1 py-3 rounded-xl transition-all ${
              activeTab === 'clients'
                ? 'bg-primary text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            Clientes
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'agenda' ? renderAgendaTab() : renderClientsTab()}

      {/* Client Details Modal */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-lg font-semibold text-gray-800">
                {isEditing ? 'Editar Cliente' : 'Detalhes do Cliente'}
              </h2>
              <button
                onClick={closeClientModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="text-gray-600" size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {isEditing ? (
                <>
                  {/* Edit Mode */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => handleEditChange('name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) => handleEditChange('email', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                    <input
                      type="tel"
                      value={editData.phone}
                      onChange={(e) => handleEditChange('phone', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={editData.status}
                      onChange={(e) => handleEditChange('status', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="active">Ativo</option>
                      <option value="inactive">Inativo</option>
                    </select>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-sm font-semibold text-gray-800 mb-3">Dados de Cadastro</h3>
                    
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp</label>
                      <input
                        type="tel"
                        value={editData.whatsapp}
                        onChange={(e) => handleEditChange('whatsapp', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Data de Nascimento</label>
                      <input
                        type="date"
                        value={editData.birthDate}
                        onChange={(e) => handleEditChange('birthDate', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Gênero</label>
                      <select
                        value={editData.gender}
                        onChange={(e) => handleEditChange('gender', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="Feminino">Feminino</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Outro">Outro</option>
                      </select>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-sm font-semibold text-gray-800 mb-3">Ficha de Anamnese</h3>
                    
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Alergias</label>
                      <input
                        type="text"
                        value={editData.allergies}
                        onChange={(e) => handleEditChange('allergies', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Ex: Alergia a acetona"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Condições de Saúde</label>
                      <input
                        type="text"
                        value={editData.healthConditions}
                        onChange={(e) => handleEditChange('healthConditions', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Ex: Diabetes tipo 2"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Unhas Encravadas</label>
                      <select
                        value={editData.ingrowingNails}
                        onChange={(e) => handleEditChange('ingrowingNails', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="não">Não</option>
                        <option value="sim">Sim</option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sensibilidade</label>
                      <select
                        value={editData.sensitivity}
                        onChange={(e) => handleEditChange('sensitivity', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="Baixa">Baixa</option>
                        <option value="Normal">Normal</option>
                        <option value="Média">Média</option>
                        <option value="Alta">Alta</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Fungo</label>
                      <select
                        value={editData.fungus}
                        onChange={(e) => handleEditChange('fungus', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="não">Não</option>
                        <option value="sim">Sim</option>
                      </select>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* View Mode */}
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                    <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-semibold text-xl">
                        {selectedClient.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-800">{selectedClient.name}</p>
                      <p className="text-sm text-gray-600">
                        {selectedClient.status === 'active' ? 'Cliente Ativo' : 'Cliente Inativo'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Email</p>
                      <p className="text-gray-800 mt-1">{selectedClient.email}</p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Telefone</p>
                      <p className="text-gray-800 mt-1">{selectedClient.phone}</p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Total de Visitas</p>
                      <p className="text-gray-800 mt-1">{selectedClient.totalVisits}</p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Última Visita</p>
                      <p className="text-gray-800 mt-1">
                        {new Date(selectedClient.lastVisit).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  {/* Dados de Cadastro */}
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-800 mb-3">Dados de Cadastro</h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">WhatsApp</p>
                        <p className="text-gray-800 mt-1">{selectedClient.whatsapp}</p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Data de Nascimento</p>
                        <p className="text-gray-800 mt-1">
                          {new Date(selectedClient.birthDate).toLocaleDateString('pt-BR')}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Gênero</p>
                        <p className="text-gray-800 mt-1">{selectedClient.gender}</p>
                      </div>
                    </div>
                  </div>

                  {/* Ficha de Anamnese */}
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-800 mb-3">Ficha de Anamnese</h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Alergias</p>
                        <p className="text-gray-800 mt-1">{selectedClient.allergies}</p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Condições de Saúde</p>
                        <p className="text-gray-800 mt-1">{selectedClient.healthConditions}</p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Unhas Encravadas</p>
                        <p className="text-gray-800 mt-1 capitalize">{selectedClient.ingrowingNails}</p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Sensibilidade</p>
                        <p className="text-gray-800 mt-1">{selectedClient.sensitivity}</p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Fungo</p>
                        <p className="text-gray-800 mt-1 capitalize">{selectedClient.fungus}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 flex gap-3 sticky bottom-0 bg-white">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Salvar
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit2 size={16} />
                    Editar
                  </button>
                  <button
                    onClick={closeClientModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Fechar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-lg font-semibold text-gray-800">Detalhes do Atendimento</h2>
              <button
                onClick={closeAppointmentModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="text-gray-600" size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Informações Principais */}
              <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm text-gray-600">Horário</p>
                    <p className="text-2xl font-semibold text-primary">{selectedAppointment.time}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedAppointment.status === 'confirmed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {selectedAppointment.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                  </span>
                </div>
              </div>

              {/* Serviço */}
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Serviço</p>
                <p className="text-gray-800 mt-2 font-medium">{selectedAppointment.service}</p>
                <div className="flex justify-between items-center mt-2 text-sm">
                  <span className="text-gray-600">Duração: {selectedAppointment.duration}</span>
                  <span className="font-semibold text-primary">{selectedAppointment.price}</span>
                </div>
              </div>

              {/* Local */}
              <div className="border-t border-gray-200 pt-4">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Local do Atendimento</p>
                <div className="flex items-start gap-2 mt-2">
                  <MapPin className="text-primary mt-0.5" size={16} />
                  <p className="text-gray-800">{selectedAppointment.location}</p>
                </div>
              </div>

              {/* Dados da Cliente */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Dados da Cliente</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-semibold">
                        {selectedAppointment.client.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{selectedAppointment.client}</p>
                      <p className="text-xs text-gray-600">{selectedAppointment.email}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Telefone</p>
                    <p className="text-gray-800 mt-1">{selectedAppointment.phone}</p>
                  </div>
                </div>
              </div>

              {/* Ficha de Anamnese da Cliente */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Ficha de Anamnese</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Alergias</p>
                    <p className="text-gray-800 mt-1">{selectedAppointment.allergies}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Condições de Saúde</p>
                    <p className="text-gray-800 mt-1">{selectedAppointment.healthConditions}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Unhas Encravadas</p>
                    <p className="text-gray-800 mt-1 capitalize">{selectedAppointment.ingrowingNails}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Sensibilidade</p>
                    <p className="text-gray-800 mt-1">{selectedAppointment.sensitivity}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Fungo</p>
                    <p className="text-gray-800 mt-1 capitalize">{selectedAppointment.fungus}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 flex gap-3 sticky bottom-0 bg-white">
              <button
                onClick={handleCancelAppointment}
                className="flex-1 px-4 py-2 border-2 border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
              >
                <AlertTriangle size={18} />
                Cancelar Atendimento
              </button>
              <button
                onClick={closeAppointmentModal}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Appointment Modal */}
      {showNewAppointmentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-lg font-semibold text-gray-800">Novo Agendamento</h2>
              <button
                onClick={closeNewAppointmentModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="text-gray-600" size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Selecionar Serviço */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Serviço</label>
                <select
                  value={newAppointment.service}
                  onChange={(e) => handleNewAppointmentChange('service', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Selecione um serviço</option>
                  {servicesLoading && <option disabled>Carregando serviços...</option>}
                  {servicesError && <option disabled>{servicesError}</option>}
                  {!servicesLoading && !servicesError && services.length === 0 && (
                    <option disabled>Nenhum serviço disponível</option>
                  )}
                  {!servicesLoading && !servicesError && services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} - {service.price}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selecionar Local */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Local</label>
                <select
                  value={newAppointment.location}
                  onChange={(e) => handleNewAppointmentChange('location', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Studio">Studio - Rua Principal, 123</option>
                  <option value="Domicilio">Atendimento a Domicílio</option>
                </select>
              </div>

              {/* Selecionar Data */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
                <input
                  type="date"
                  value={newAppointment.date}
                  onChange={(e) => handleNewAppointmentChange('date', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Selecionar Horário */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Horário</label>
                <div className="grid grid-cols-4 gap-2">
                  {availableTimeSlots.map((slot) => {
                    const isBooked = bookedTimeSlots.includes(slot);
                    return (
                      <button
                        key={slot}
                        onClick={() => !isBooked && handleNewAppointmentChange('time', slot)}
                        disabled={isBooked}
                        className={`px-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                          newAppointment.time === slot
                            ? 'bg-primary text-white'
                            : isBooked
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white border border-gray-300 text-gray-700 hover:border-primary hover:text-primary'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selecionar Cliente */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
                <select
                  value={newAppointment.clientId}
                  onChange={(e) => handleNewAppointmentChange('clientId', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Selecione uma cliente</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Preview do Agendamento */}
              {newAppointment.service && newAppointment.date && newAppointment.time && newAppointment.clientId && (
                <div className="bg-primary/5 rounded-lg p-4 border border-primary/10 mt-4">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Resumo</p>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-gray-600">Serviço:</p>
                      <p className="font-medium text-gray-800">
                        {services.find(s => s.id === newAppointment.service)?.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Local:</p>
                      <p className="font-medium text-gray-800">{newAppointment.location}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Data:</p>
                      <p className="font-medium text-gray-800">
                        {new Date(newAppointment.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Horário:</p>
                      <p className="font-medium text-gray-800">{newAppointment.time}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Cliente:</p>
                      <p className="font-medium text-gray-800">
                        {clients.find(c => c.id === newAppointment.clientId)?.name}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 flex gap-3 sticky bottom-0 bg-white">
              <button
                onClick={closeNewAppointmentModal}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveNewAppointment}
                disabled={!newAppointment.service || !newAppointment.date || !newAppointment.time || !newAppointment.clientId}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Agendar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
