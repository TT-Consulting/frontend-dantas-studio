import { useEffect, useState, useCallback } from 'react';
import { Search, User, Phone, Mail, Calendar, X, AlertCircle, Sparkles, Plus, Edit, UserX, Edit2, MapPin } from 'lucide-react';
import { listarClientes, salvarCliente, atualizarCliente, alternarStatusCliente } from '../../api';
import { useLanguage } from '../../context/LanguageContext'; // 🌟 Importando o hook de idioma

// Dicionário local para itens muito específicos da tela de clientes
const localTranslations = {
  'pt-BR': {
    title: 'Gestão de Clientes',
    subtitle: 'Visualize e gerencie os perfis e históricos',
    searchPlaceholder: 'Buscar cliente pelo nome...',
    statTotal: 'Total',
    statMonth: 'Este Mês',
    statVips: 'VIPs',
    loading: 'Carregando clientes...',
    empty: 'Nenhum cliente encontrado.',
    noPhone: 'Sem telefone',
    noLoc: 'Sem localidade',
    active: 'Ativo',
    inactive: 'Inativo',
    visit: 'visita',
    visits: 'visitas',
    profileTitle: 'Perfil do Cliente',
    profileSub: 'atendimentos realizados',
    basicData: 'Dados Básicos',
    gender: 'Gênero',
    genderNot: 'Não informado',
    age: 'Idade',
    years: 'anos',
    contact: 'Contato',
    address: 'Endereço',
    health: 'Saúde',
    allergies: 'Alergias',
    healthRestrictions: 'Restrições de Saúde',
    observations: 'Observações',
    tagIngrown: 'Unhas encravadas',
    tagSensitive: 'Sensibilidade excessiva',
    tagFungus: 'Micose/fungos',
    close: 'Fechar',
    editClient: 'Editar Cliente',
    newClient: 'Novo Cliente',
    fillBelow: 'Preencha os dados abaixo',
    labelName: 'Nome',
    labelNamePlc: 'Nome completo',
    labelEmail: 'Email',
    labelLocPlc: 'Cidade, Bairro',
    labelAddress: 'Endereço',
    labelAddressPlc: 'Rua, Número',
    labelBirth: 'Data de Nascimento',
    labelSelect: 'Selecione',
    labelAllergiesPlc: 'Descreva alergias, se houver',
    labelHealthPlc: 'Descreva condições de saúde relevantes',
    labelHealthTags: 'Observações de Saúde',
    checkIngrown: 'Tendência a unhas encravadas',
    checkSensitive: 'Sensibilidade cutânea excessiva',
    checkFungus: 'Histórico ou presença de micose/fungos',
    cancel: 'Cancelar',
    saveBtn: 'Salvar Alterações',
    addBtn: 'Adicionar Cliente'
  },
  'en-US': {
    title: 'Client Management',
    subtitle: 'View and manage client profiles and histories',
    searchPlaceholder: 'Search client by name...',
    statTotal: 'Total',
    statMonth: 'This Month',
    statVips: 'VIPs',
    loading: 'Loading clients...',
    empty: 'No clients found.',
    noPhone: 'No phone',
    noLoc: 'No location',
    active: 'Active',
    inactive: 'Inactive',
    visit: 'visit',
    visits: 'visits',
    profileTitle: 'Client Profile',
    profileSub: 'appointments completed',
    basicData: 'Basic Data',
    gender: 'Gender',
    genderNot: 'Not informed',
    age: 'Age',
    years: 'years old',
    contact: 'Contact',
    address: 'Address',
    health: 'Health',
    allergies: 'Allergies',
    healthRestrictions: 'Health Conditions',
    observations: 'Observations',
    tagIngrown: 'Ingrown nails',
    tagSensitive: 'Excessive sensitivity',
    tagFungus: 'Mycosis/fungi',
    close: 'Close',
    editClient: 'Edit Client',
    newClient: 'New Client',
    fillBelow: 'Fill in the information below',
    labelName: 'Name',
    labelNamePlc: 'Full name',
    labelEmail: 'Email',
    labelLocPlc: 'City, Neighborhood',
    labelAddress: 'Address',
    labelAddressPlc: 'Street, Number',
    labelBirth: 'Date of Birth',
    labelSelect: 'Select',
    labelAllergiesPlc: 'Describe allergies, if any',
    labelHealthPlc: 'Describe relevant health conditions',
    labelHealthTags: 'Health Notes',
    checkIngrown: 'Prone to ingrown nails',
    checkSensitive: 'Excessive skin sensitivity',
    checkFungus: 'History or presence of mycosis/fungi',
    cancel: 'Cancel',
    saveBtn: 'Save Changes',
    addBtn: 'Add Client'
  },
  'es-ES': {
    title: 'Gestión de Clientes',
    subtitle: 'Visualice y gestione los perfiles e historiales',
    searchPlaceholder: 'Buscar cliente por nombre...',
    statTotal: 'Total',
    statMonth: 'Este Mes',
    statVips: 'VIPs',
    loading: 'Cargando clientes...',
    empty: 'Ningún cliente encontrado.',
    noPhone: 'Sin teléfono',
    noLoc: 'Sin localidad',
    active: 'Activo',
    inactive: 'Inactivo',
    visit: 'visita',
    visits: 'visitas',
    profileTitle: 'Perfil del Cliente',
    profileSub: 'turnos completados',
    basicData: 'Datos Básicos',
    gender: 'Género',
    genderNot: 'No informado',
    age: 'Edad',
    years: 'años',
    contact: 'Contacto',
    address: 'Dirección',
    health: 'Salud',
    allergies: 'Alergias',
    healthRestrictions: 'Restricciones de Salud',
    observations: 'Observaciones',
    tagIngrown: 'Uñas encarnadas',
    tagSensitive: 'Sensibilidad excesiva',
    tagFungus: 'Micosis/hongos',
    close: 'Cerrar',
    editClient: 'Editar Cliente',
    newClient: 'Nuevo Cliente',
    fillBelow: 'Complete los datos a continuación',
    labelName: 'Nombre',
    labelNamePlc: 'Nombre completo',
    labelEmail: 'Correo electrónico',
    labelLocPlc: 'Ciudad, Barrio',
    labelAddress: 'Dirección',
    labelAddressPlc: 'Calle, Número',
    labelBirth: 'Fecha de Nacimiento',
    labelSelect: 'Seleccione',
    labelAllergiesPlc: 'Describa alergias, si las hay',
    labelHealthPlc: 'Describa condiciones de salud relevantes',
    labelHealthTags: 'Notas de Salud',
    checkIngrown: 'Tendencia a uñas encarnadas',
    checkSensitive: 'Sensibilidad cutánea excesiva',
    checkFungus: 'Historial o presencia de micosis/hongos',
    cancel: 'Cancelar',
    saveBtn: 'Guardar Cambios',
    addBtn: 'Añadir Cliente'
  }
};

export function ClientsScreen() {
  const { systemLanguage } = useLanguage(); // 🌟 Obtendo o idioma ativo globalmente
  const text = localTranslations[systemLanguage] || localTranslations['pt-BR'];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
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

  const mapFromApi = (c) => ({
    id: c?.idCliente ?? c?.id ?? '',
    name: c?.nome ?? c?.name ?? '',
    phone: c?.whatsapp ?? c?.phone ?? '',
    email: c?.email ?? '',
    totalVisits: c?.totalAtendimentos ?? c?.totalVisits ?? 0,
    lastVisit: c?.ultimaVisita ?? c?.lastVisit ?? '—',
    preferences: c?.alergias || c?.condicoesSaude || c?.preferences || '',
    upcomingAppointment: c?.proximoAgendamento ?? c?.upcomingAppointment ?? 'None',
    totalSpent: c?.totalGasto ? `R$ ${c.totalGasto}` : c?.totalSpent ?? 'R$ 0',
    isAtivo: c?.isAtivo ?? c?.ativo ?? true,

    possuiMicoseFungos: c?.possuiMicoseFungos ?? false,
    sensibilidadeExcessiva: c?.sensibilidadeExcessiva ?? false,
    possuiUnhasEncravadas: c?.possuiUnhasEncravadas ?? false,
    alergias: c?.alergias ?? '',
    condicoesSaude: c?.condicoesSaude ?? '',
    observacoes: c?.observacoes ?? '',

    dataNascimento: c?.dataNascimento ?? '', 
    genero: c?.genero ?? '',

    cep: c?.cep ?? '',
    logradouro: c?.logradouro ?? c?.endereco ?? '',
    bairro: c?.bairro ?? '',
    localidade: c?.localidade ?? '', 
    numeroEnd: c?.numeroEnd ?? c?.numero ?? ''
  });

  const formatarTelefoneBR = (telefone) => {
    if (!telefone) return text.genderNot;
    const limpo = String(telefone).replace(/\D/g, '');
    if (limpo.length === 11) {
      return `(${limpo.substring(0, 2)}) ${limpo.substring(2, 7)}-${limpo.substring(7)}`;
    } else if (limpo.length === 10) {
      return `(${limpo.substring(0, 2)}) ${limpo.substring(2, 6)}-${limpo.substring(6)}`;
    }
    return telefone; 
  };

  const calcularIdade = (dataNasc) => {
    if (!dataNasc) return '—';
    const hoje = new Date();
    const nascimento = new Date(dataNasc);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return isNaN(idade) ? '—' : `${idade} ${text.years}`;
  };

  const carregarClientes = useCallback(async (busca = '') => {
    setLoading(true);
    try {
      const data = await listarClientes(busca);
      setClients(Array.isArray(data) ? data.map(mapFromApi) : []);
    } catch (err) {
      console.error('Erro ao buscar clientes', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => carregarClientes(searchQuery), 500);
    return () => clearTimeout(delay);
  }, [searchQuery, carregarClientes]);

  const handleOpenForm = (client = null) => {
    if (client) {
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
    } else {
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
    }
    setIsModalOpen(true);
  };

  const handleSubmitForm = async () => {
    try {
      if (editingClient) {
        await atualizarCliente(editingClient.idCliente, formData);
      } else {
        await salvarCliente(formData);
      }
      await carregarClientes(searchQuery);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Erro ao salvar cliente', err);
    }
  };

  const handleToggleStatus = async (client, e) => {
    e.stopPropagation();
    try {
      await alternarStatusCliente(client.idCliente, !client.isAtivo);
      await carregarClientes(searchQuery);
    } catch (err) {
      console.error('Erro ao alterar status do cliente', err);
    }
  };

  // Helper para tradução dos gêneros vindo do banco
  const traduzirGenero = (g) => {
    if (!g) return text.genderNot;
    if (g === 'Feminino') return systemLanguage === 'en-US' ? 'Female' : systemLanguage === 'es-ES' ? 'Femenino' : 'Feminino';
    if (g === 'Masculino') return systemLanguage === 'en-US' ? 'Male' : systemLanguage === 'es-ES' ? 'Masculino' : 'Masculino';
    if (g === 'Outro') return systemLanguage === 'en-US' ? 'Other' : systemLanguage === 'es-ES' ? 'Otro' : 'Outro';
    return g;
  };

  return (
    <div className="pb-24 px-5 pt-6 bg-background min-h-screen">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-primary text-2xl font-bold">{text.title}</h2>
          <p className="text-gray-600 text-sm">{text.subtitle}</p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className="bg-primary text-white p-3 rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={text.searchPlaceholder}
          className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border-2 border-gray-200 focus:outline-none focus:border-primary transition-colors shadow-sm"
        />
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl p-3 shadow-sm text-center border border-gray-100">
          <p className="text-2xl font-bold text-primary">{clients.length}</p>
          <p className="text-gray-500 text-xs mt-1">{text.statTotal}</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm text-center border border-gray-100">
          <p className="text-2xl font-bold text-accent">15</p>
          <p className="text-gray-500 text-xs mt-1">{text.statMonth}</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm text-center border border-gray-100">
          <p className="text-2xl font-bold text-primary">3</p>
          <p className="text-gray-500 text-xs mt-1">{text.statVips}</p>
        </div>
      </div>

      {/* Client List */}
      <div className="space-y-3">
        {loading && <p className="text-center py-4 text-gray-500 text-sm">{text.loading}</p>}
        {!loading && clients.length === 0 && (
          <p className="text-center py-4 text-gray-500 text-sm">{text.empty}</p>
        )}
        {!loading && clients.map((client) => (
          <div
            key={client.id}
            className="w-full bg-white rounded-xl p-4 shadow-sm hover:shadow-md border border-gray-100/80 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4 min-w-0 cursor-pointer" onClick={() => setSelectedClient(client)}>
                <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center shrink-0 hover:bg-primary/10 transition-colors">
                  <User className="text-primary" size={22} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-800 truncate">{client.name}</p>
                  <p className="text-gray-500 text-sm">{client.phone || text.noPhone}</p>
                  <p className="text-gray-400 text-xs mt-0.5 truncate">{client.localidade || client.endereco || text.noLoc}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${client.isAtivo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {client.isAtivo ? text.active : text.inactive}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-primary">
                {client.totalVisits} {client.totalVisits === 1 ? text.visit : text.visits}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenForm(client);
                  }}
                  className="p-2 text-primary hover:bg-purple-50 rounded-lg transition-colors"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={(e) => handleToggleStatus(client, e)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <UserX size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Client Profile */}
      {selectedClient && (
        <div className="fixed inset-0 bg-white z-[60] flex flex-col animate-fadeIn">
          <div className="sticky top-0 bg-primary text-white p-5 shrink-0 z-20 shadow-sm">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                  <User className="text-white" size={24} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-white text-lg font-bold truncate">{text.profileTitle}</h3>
                  <p className="text-purple-200 text-xs font-medium">{selectedClient.totalVisits} {text.profileSub}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    setSelectedClient(null);
                    handleOpenForm(selectedClient);
                  }}
                  className="p-1.5 bg-white/10 rounded-full text-white/90 hover:text-white transition-colors"
                >
                  <Edit2 size={20} />
                </button>
                <button
                  onClick={() => setSelectedClient(null)}
                  className="p-1.5 bg-white/10 rounded-full text-white/90 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-6 overflow-y-auto flex-1">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-primary font-bold text-2xl">
                  {selectedClient.name ? selectedClient.name.charAt(0) : 'U'}
                </span>
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-800">{selectedClient.name}</h4>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 ${selectedClient.isAtivo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  {selectedClient.isAtivo ? text.active : text.inactive}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <h5 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{text.basicData}</h5>
              <div className="flex items-center gap-3">
                <User size={18} className="text-gray-400" />
                <span className="text-gray-700">
                  {text.gender}: {traduzirGenero(selectedClient.genero)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar size={18} className="text-gray-400" />
                <span className="text-gray-700">
                  {text.age}: {calcularIdade(selectedClient.dataNascimento)}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <h5 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{text.contact}</h5>
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-gray-400" />
                <span className="text-gray-700">
                  {formatarTelefoneBR(selectedClient.phone)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-gray-400" />
                <span className="text-gray-700">
                  {selectedClient.email || text.genderNot}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <h5 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{text.address}</h5>
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
                    {selectedClient.numeroEnd && `, ${selectedClient.numeroEnd}`}
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

            <div className="space-y-4">
              <h5 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{text.health}</h5>
              {selectedClient.alergias && (
                <div className="bg-yellow-50 p-3 rounded-xl">
                  <p className="text-xs font-semibold text-yellow-800 mb-1">{text.allergies}</p>
                  <p className="text-gray-700 text-sm">{selectedClient.alergias}</p>
                </div>
              )}
              {selectedClient.condicoesSaude && (
                <div className="bg-blue-50 p-3 rounded-xl">
                  <p className="text-xs font-semibold text-blue-800 mb-1">{text.healthRestrictions}</p>
                  <p className="text-gray-700 text-sm">{selectedClient.condicoesSaude}</p>
                </div>
              )}
              {selectedClient.observacoes && (
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-xs font-semibold text-gray-700 mb-1">{text.observations}</p>
                  <p className="text-gray-700 text-sm">{selectedClient.observacoes}</p>
                </div>
              )}

              <div className="space-y-2">
                {selectedClient.possuiUnhasEncravadas && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold">
                    {text.tagIngrown}
                  </span>
                )}
                {selectedClient.sensibilidadeExcessiva && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                    {text.tagSensitive}
                  </span>
                )}
                {selectedClient.possuiMicoseFungos && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                    {text.tagFungus}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl text-center">
                <p className="text-2xl font-bold text-primary">{selectedClient.totalVisits}</p>
                <p className="text-sm text-gray-600">{selectedClient.totalVisits === 1 ? text.visit : text.visits}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl text-center">
                <p className="text-sm font-semibold text-gray-700 mb-1">Última visita</p>
                <p className="text-xs text-gray-600">
                  {selectedClient.lastVisit && selectedClient.lastVisit !== '—'
                    ? new Date(selectedClient.lastVisit).toLocaleDateString(systemLanguage)
                    : '—'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 pb-8 border-t border-gray-100 shrink-0 bg-white">
            <button
              onClick={() => setSelectedClient(null)}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
            >
              {text.close}
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Client Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-white z-[60] flex flex-col animate-fadeIn">
          <div className="sticky top-0 bg-primary text-white p-5 shrink-0 z-20 shadow-sm">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                  {editingClient ? <Edit2 className="text-white" size={22} /> : <Plus className="text-white" size={22} />}
                </div>
                <div className="min-w-0">
                  <h3 className="text-white text-lg font-bold truncate">
                    {editingClient ? text.editClient : text.newClient}
                  </h3>
                  <p className="text-purple-200 text-xs font-medium">
                    {editingClient ? editingClient.name : text.fillBelow}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 bg-white/10 rounded-full text-white/90 hover:text-white transition-colors shrink-0"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="p-5 space-y-4 overflow-y-auto flex-1">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">{text.labelName}</label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                placeholder={text.labelNamePlc}
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
              <label className="text-sm font-semibold text-gray-700 mb-1 block">{text.labelEmail}</label>
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
                placeholder={text.labelLocPlc}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">{text.labelAddress}</label>
              <input
                type="text"
                value={formData.endereco}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                placeholder={text.labelAddressPlc}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">{text.labelBirth}</label>
              <input
                type="date"
                value={formData.dataNascimento}
                onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">{text.gender}</label>
              <select
                value={formData.genero}
                onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
              >
                <option value="">{text.labelSelect}</option>
                <option value="Feminino">{systemLanguage === 'en-US' ? 'Female' : systemLanguage === 'es-ES' ? 'Femenino' : 'Feminino'}</option>
                <option value="Masculino">{systemLanguage === 'en-US' ? 'Male' : systemLanguage === 'es-ES' ? 'Masculino' : 'Masculino'}</option>
                <option value="Outro">{systemLanguage === 'en-US' ? 'Other' : systemLanguage === 'es-ES' ? 'Otro' : 'Outro'}</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">{text.allergies}</label>
              <textarea
                value={formData.alergias}
                onChange={(e) => setFormData({ ...formData, alergias: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                placeholder={text.labelAllergiesPlc}
                rows={2}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">{text.healthRestrictions}</label>
              <textarea
                value={formData.condicoesSaude}
                onChange={(e) => setFormData({ ...formData, condicoesSaude: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                placeholder={text.labelHealthPlc}
                rows={2}
              />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 block">{text.labelHealthTags}</label>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.possuiUnhasEncravadas}
                  onChange={(e) => setFormData({ ...formData, possuiUnhasEncravadas: e.target.checked })}
                  className="w-5 h-5 text-primary"
                />
                <span className="text-gray-700 text-sm">{text.checkIngrown}</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.sensibilidadeExcessiva}
                  onChange={(e) => setFormData({ ...formData, sensibilidadeExcessiva: e.target.checked })}
                  className="w-5 h-5 text-primary"
                />
                <span className="text-gray-700 text-sm">{text.checkSensitive}</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.possuiMicoseFungos}
                  onChange={(e) => setFormData({ ...formData, possuiMicoseFungos: e.target.checked })}
                  className="w-5 h-5 text-primary"
                />
                <span className="text-gray-700 text-sm">{text.checkFungus}</span>
              </div>
            </div>
          </div>

          <div className="p-5 pb-8 border-t border-gray-100 shrink-0 bg-white">
            <div className="flex gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                {text.cancel}
              </button>
              <button
                onClick={handleSubmitForm}
                className="flex-1 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
              >
                {editingClient ? text.saveBtn : text.addBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}