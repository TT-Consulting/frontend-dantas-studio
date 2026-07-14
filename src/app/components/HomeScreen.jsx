import { useState, useEffect } from 'react';
import {
  listarClientes,
  listarServicosAtivos,
  criarAgendamento,
  listarAgendamentos,
  buscarAgendamentosPorPeriodo,
  buscarAgendamentoPorId 
} from '../../api';
import { X, Phone } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext'; // 🌟 Importando o hook de idioma

// Subcomponentes fiéis ao modelo antigo
import { AgendaTab } from './AgendaTab';
import { ClientsScreen } from './ClientsScreen';
import { NewAppointmentModal } from './NewAppointmentModal';

export function HomeScreen({
  onServiceCatalogClick,
  onAutomationClick,
  onProcessFlowClick,
  onVerProximosAgendamentos
}) {
  const { t, systemLanguage } = useLanguage(); // 🌟 Consumindo as traduções e o idioma ativo

  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [clientsError, setClientsError] = useState(null);
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState(null);

  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState(null);

  const [activeTab, setActiveTab] = useState('agenda');
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const [newAppointment, setNewAppointment] = useState({
    service: '',
    location: 'Studio',
    date: '',
    time: '',
    clientId: '',
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

  const mapClientFromApi = (client) => ({
    id: String(client.idCliente ?? client.id_cliente ?? client.id),
    idCliente: client.idCliente ?? client.id_cliente ?? client.id,
    name: client.nomeCliente ?? client.nome_cliente ?? client.nome ?? client.name ?? 'Cliente Sem Nome',
    phone: client.whatsapp ?? client.telefone ?? '',
  });

  const mapAppointmentFromApi = (appointment) => {
    const parseNumber = (value) => {
      if (value === null || value === undefined || value === '') return 0;
      if (typeof value === 'number') return value;

      const raw = String(value).replace('R$', '').trim();
      const normalized = raw.includes(',')
        ? raw.replace(/\./g, '').replace(',', '.')
        : raw;

      return parseFloat(normalized) || 0;
    };

    const clientName = appointment?.cliente?.nome ?? appointment?.nomeCliente ?? appointment?.nome_cliente ?? appointment?.client ?? 'Cliente não identificado';
    const clientPhone = appointment?.cliente?.whatsapp ?? appointment?.cliente?.telefone ?? appointment?.whatsapp ?? appointment?.telefone ?? appointment?.phone ?? '';
    const statusNormalizado = appointment?.status ?? appointment?.statusAgendamento ?? appointment?.situacao ?? 'PENDENTE';
    const taxaDeslocamento = parseNumber(appointment?.taxaDeslocamento);

    const servicos = Array.isArray(appointment?.servicos)
      ? appointment.servicos.map((service) => ({
        ...service,
        nome: service?.nome ?? service?.nomeServico ?? 'Serviço não especificado',
        preco: parseNumber(service?.preco ?? service?.precoBase ?? service?.valor),
      }))
      : [];

    const subtotalServicos = parseNumber(appointment?.subtotalServicos) || servicos.reduce((acc, service) => acc + parseNumber(service?.preco), 0);
    const totalFinal = appointment?.totalFinal !== undefined && appointment?.totalFinal !== null
      ? parseNumber(appointment.totalFinal)
      : (appointment?.valorTotalFinal !== undefined && appointment?.valorTotalFinal !== null)
        ? parseNumber(appointment.valorTotalFinal)
        : (subtotalServicos + taxaDeslocamento);

    return {
      ...appointment,
      cliente: {
        ...(appointment?.cliente || {}),
        idCliente: appointment?.cliente?.idCliente ?? appointment?.cliente?.id ?? appointment?.idCliente ?? appointment?.id_cliente,
        nome: appointment?.cliente?.nome ?? clientName,
        whatsapp: appointment?.cliente?.whatsapp ?? clientPhone,
        telefone: appointment?.cliente?.telefone ?? clientPhone,
      },
      servicos,
      nomeCliente: appointment?.nomeCliente ?? clientName,
      status: statusNormalizado,
      statusAgendamento: appointment?.statusAgendamento ?? statusNormalizado,
      subtotalServicos,
      totalFinal,
      taxaDeslocamento,
      phone: appointment?.phone ?? clientPhone,
    };
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      setAppointmentsLoading(true);
      setAppointmentsError(null);
      try {
        const data = await buscarAgendamentosPorPeriodo();
        setAppointments(Array.isArray(data) ? data.map(mapAppointmentFromApi) : []);
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
      } catch {
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
        const data = await listarClientes();
        setClients(Array.isArray(data) ? data.map(mapClientFromApi) : []);
      } catch (err) {
        setClientsError('Erro ao carregar lista de clientes.');
        console.error(err);
      } finally {
        setClientsLoading(false);
      }
    };
    fetchClients();
  }, []);

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  const todayAppointments = appointments.filter(app => {
    let appDate = app.date || (app.dataHoraInicio && app.dataHoraInicio.includes('T') ? app.dataHoraInicio.split('T')[0] : app.dataHoraInicio);
    if (!appDate) return false;
    return String(appDate).trim() === todayStr;
  });

  const stats = {
    today: todayAppointments.length,
    pending: todayAppointments.filter(a => {
      const statusUpper = String(a.status || a.statusAgendamento || '').toUpperCase();
      return statusUpper === 'PENDING' || statusUpper === 'PENDENTE';
    }).length,
    revenue: todayAppointments.reduce((acc, curr) => {
      const val = curr.totalFinal ?? curr.valorTotalFinal ?? curr.subtotalServicos ?? 0;
      return acc + (typeof val === 'number' ? val : parseFloat(val) || 0);
    }, 0).toLocaleString(systemLanguage, { style: 'currency', currency: systemLanguage === 'en-US' ? 'USD' : 'BRL' }),
    clients: clients.length
  };

  const handleNewAppointmentChange = (field, value) => {
    setNewAppointment(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveNewAppointment = async () => {
    const serviceId = parseInt(newAppointment.service, 10);
    const clientId = parseInt(newAppointment.clientId, 10);

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

    const agendamentoDTO = {
      dataHoraInicio: `${newAppointment.date}T${newAppointment.time}:00`,
      taxaDeslocamento: newAppointment.location === 'Domicilio' ? 15.0 : 0.0,
      tipoLocal: newAppointment.location === 'Domicilio' ? 'DOMICILIO' : 'STUDIO',
      cepAtendimento: newAppointment.location === 'Domicilio' ? '' : null,
      isManual: true,
      servicos: [{ idServico: serviceId }],
      cliente: { idCliente: clientId }
    };

    try {
      await criarAgendamento(agendamentoDTO);
      alert('Agendamento realizado com sucesso!');
      setShowNewAppointmentModal(false);
      setNewAppointment({
        service: '',
        location: 'Studio',
        date: '',
        time: '',
        clientId: '',
      });
      const updatedData = await listarAgendamentos();
      setAppointments(Array.isArray(updatedData) ? updatedData.map(mapAppointmentFromApi) : []);
    } catch (err) {
      console.error("❌ Erro ao salvar agendamento:", err);
      const msgErro = err.response?.data?.mensagem || 'Erro ao realizar o agendamento.';
      alert(msgErro);
    }
  };

  return (
    <div className="pb-24 lg:pb-8 px-5 lg:px-8 pt-6">
      {/* Header Fiel */}
      <div className="mb-6">
        <div className="mb-4">
          <h2 className="text-primary font-bold text-2xl">
            {systemLanguage === 'en-US' ? 'Welcome, Annika!' : systemLanguage === 'es-ES' ? '¡Bienvenida, Annika!' : 'Bem-vinda, Annika!'}
          </h2>
          <p className="text-gray-600 text-sm capitalize">
            {new Date().toLocaleDateString(systemLanguage, {
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
            {t('navCalendar')}
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            className={`flex-1 py-3 rounded-xl font-medium transition-all text-center ${activeTab === 'clients'
              ? 'bg-primary text-white shadow-md'
              : 'bg-white text-gray-600 border border-gray-200'
              }`}
          >
            {t('navClients')}
          </button>
        </div>
      </div>

      {activeTab === 'agenda' ? (
        <AgendaTab
          todayAppointments={todayAppointments}
          stats={stats}
          loading={appointmentsLoading}
          error={appointmentsError}
          openAppointmentDetails={async (appointment) => {
            try {
              const idReal = appointment.idAgendamento || appointment.id;
              if (!idReal) return;
              const agendamentoCompleto = await buscarAgendamentoPorId(idReal);
              setSelectedAppointment(mapAppointmentFromApi(agendamentoCompleto));
            } catch (err) {
              console.error("Erro ao carregar detalhes do agendamento:", err);
            }
          }}
          openNewAppointmentModal={() => setShowNewAppointmentModal(true)}
          onServiceCatalogClick={onServiceCatalogClick}
          onAutomationClick={onAutomationClick}
          onProcessFlowClick={onProcessFlowClick}
          onVerProximosAgendamentos={onVerProximosAgendamentos}
        />
      ) : (
        <ClientsScreen />
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

      {/* Modal de Detalhes Completo do Agendamento */}
      {selectedAppointment && selectedAppointment.cliente && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-slideUp">
            <div className="p-5 bg-linear-to-r from-primary to-purple-700 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">
                  {systemLanguage === 'en-US' ? 'Appointment Details' : systemLanguage === 'es-ES' ? 'Detalles del Turno' : 'Detalhes do Agendamento'}
                </h3>
                <p className="text-purple-100 text-xs">ID: #{selectedAppointment.idAgendamento || selectedAppointment.id}</p>
              </div>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                  {systemLanguage === 'en-US' ? 'Client' : systemLanguage === 'es-ES' ? 'Cliente' : 'Cliente'}
                </p>
                <p className="text-gray-800 font-semibold text-base">{selectedAppointment.cliente?.nome || selectedAppointment.nomeCliente || '—'}</p>
                <p className="text-gray-600 text-sm flex items-center gap-1.5 mt-1">
                  <Phone size={14} className="text-gray-400" />
                  {formatPhoneNumber(selectedAppointment.cliente?.whatsapp || selectedAppointment.cliente?.telefone || selectedAppointment.phone)}
                </p>
              </div>

              <div className="bg-purple-50/50 rounded-xl p-4 border border-purple-100/50">
                <p className="text-xs font-bold text-primary uppercase mb-2">
                  {systemLanguage === 'en-US' ? 'Contracted Service' : systemLanguage === 'es-ES' ? 'Servicio Contratado' : 'Serviço Contratado'}
                </p>
                {selectedAppointment.servicos && selectedAppointment.servicos.length > 0 ? (
                  selectedAppointment.servicos.map((serv, idx) => (
                    <div key={idx} className="flex justify-between items-center py-1 border-b border-purple-100/30 last:border-0">
                      <div>
                        <p className="text-gray-800 font-medium text-sm">{serv.nome}</p>
                        <p className="text-gray-500 text-xs">
                          {serv.tempoEstimado || serv.duracao || 0} {systemLanguage === 'en-US' ? 'min duration' : 'min de duração'}
                        </p>
                      </div>
                      <p className="text-gray-700 font-bold text-sm">
                        {systemLanguage === 'en-US' ? `$ ${Number(serv.preco || 0).toFixed(2)}` : `R$ ${Number(serv.preco || 0).toFixed(2)}`}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">Nenhum serviço associado</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                    {systemLanguage === 'en-US' ? 'Date' : systemLanguage === 'es-ES' ? 'Fecha' : 'Data'}
                  </p>
                  <p className="text-gray-700 font-semibold text-sm">
                    {selectedAppointment.dataHoraInicio
                      ? new Date(selectedAppointment.dataHoraInicio).toLocaleDateString(systemLanguage)
                      : '—'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                    {systemLanguage === 'en-US' ? 'Time' : systemLanguage === 'es-ES' ? 'Hora' : 'Horário'}
                  </p>
                  <p className="text-gray-700 font-semibold text-sm">
                    {selectedAppointment.dataHoraInicio
                      ? selectedAppointment.dataHoraInicio.split('T')[1]?.substring(0, 5)
                      : '—'}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-dashed border-gray-200 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal:</span>
                  <span>
                    {systemLanguage === 'en-US' ? `$ ${Number(selectedAppointment.subtotalServicos || 0).toFixed(2)}` : `R$ ${Number(selectedAppointment.subtotalServicos || 0).toFixed(2)}`}
                  </span>
                </div>
                {selectedAppointment.taxaDeslocamento > 0 && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>
                      {systemLanguage === 'en-US' ? 'Additional Fee' : systemLanguage === 'es-ES' ? 'Tasa Adicional' : 'Taxa Adicional'} ({selectedAppointment.tipoLocal}):
                    </span>
                    <span>
                      {systemLanguage === 'en-US' ? `$ ${Number(selectedAppointment.taxaDeslocamento).toFixed(2)}` : `R$ ${Number(selectedAppointment.taxaDeslocamento).toFixed(2)}`}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center text-gray-800 font-bold text-base pt-2 border-t border-gray-100">
                  <span>
                    {systemLanguage === 'en-US' ? 'Total Amount:' : systemLanguage === 'es-ES' ? 'Valor Total:' : 'Valor Total:'}
                  </span>
                  <span className="text-primary text-lg">
                    {systemLanguage === 'en-US' 
                      ? `$ ${Number(selectedAppointment.valorTotalFinal || selectedAppointment.totalFinal || 0).toFixed(2)}` 
                      : `R$ ${Number(selectedAppointment.valorTotalFinal || selectedAppointment.totalFinal || 0).toFixed(2)}`}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedAppointment(null)}
                className="px-5 py-2.5 bg-gray-200 text-gray-700 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-gray-300 transition-colors"
              >
                {systemLanguage === 'en-US' ? 'Close View' : systemLanguage === 'es-ES' ? 'Cerrar Vista' : 'Fechar Visualização'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}