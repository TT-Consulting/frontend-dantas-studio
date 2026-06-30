import { useState, useEffect } from 'react';
import {
  listarClientes,
  listarServicosAtivos,
  listarHorarioComercial,
  criarAgendamento,
  // listarAgendamentos // Certifique-se de exportar sua função de listagem na API se houver
} from '../../api';

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
  onVerProximosAgendamentos // Callback para navegar ou abrir os próximos agendamentos
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

  const [newAppointment, setNewAppointment] = useState({
    service: '',
    location: 'Studio',
    date: '',
    time: '',
    clientId: '',
  });

  const mapClientFromApi = (client) => ({
    id: String(client.idCliente ?? client.id_cliente ?? client.id),
    idCliente: client.idCliente ?? client.id_cliente ?? client.id, // Keep numeric ID for backend
    name: client.nomeCliente ?? client.nome_cliente ?? client.nome ?? 'Cliente Sem Nome',
    phone: client.whatsapp ?? client.telefone ?? '',
    status: client.status ?? 'active',
    lastVisit: client.ultimaVisita ?? client.ultima_visita ?? '—',
    totalVisits: client.totalVisitas ?? client.total_visitas ?? 0,
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
    setSelectedClient(client);
    setEditData(client);
    if (triggerEdit) setIsEditing(true);
  };

  const handleNewClientClick = () => {
    const emptyClient = {
      id: null, name: '', phone: '', email: '', status: 'active', lastVisit: '—', totalVisits: 0,
      whatsapp: '', birthDate: '', gender: 'Feminino', allergies: '', healthConditions: '',
      ingrowingNails: 'não', sensitivity: 'Normal', fungus: 'não',
    };
    setSelectedClient(emptyClient);
    setEditData(emptyClient);
    setIsEditing(true);
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
          clientsLoading={clientsLoading}
          clientsError={clientsError}
        />
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
    </div>
  );
}