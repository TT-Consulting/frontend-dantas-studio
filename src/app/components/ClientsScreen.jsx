import { useEffect, useState, useCallback } from 'react';
import { Search, User, Phone, Mail, Calendar, X, AlertCircle, Sparkles, Plus, Edit, UserX, Edit2, MapPin } from 'lucide-react';
import { listarClientes, salvarCliente, atualizarCliente, alternarStatusCliente } from '../../api';

export function ClientsScreen() {
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

    // Flags de Saúde
    possuiMicoseFungos: c?.possuiMicoseFungos ?? false,
    sensibilidadeExcessiva: c?.sensibilidadeExcessiva ?? false,
    possuiUnhasEncravadas: c?.possuiUnhasEncravadas ?? false,
    alergias: c?.alergias ?? '',
    condicoesSaude: c?.condicoesSaude ?? '',
    observacoes: c?.observacoes ?? '',

    // Dados Pessoais Adicionais
    dataNascimento: c?.dataNascimento ?? '', // formato YYYY-MM-DD
    genero: c?.genero ?? '',

    // Endereço Completo
    cep: c?.cep ?? '',
    logradouro: c?.logradouro ?? c?.endereco ?? '',
    bairro: c?.bairro ?? '',
    localidade: c?.localidade ?? '', // Cidade
    numeroEnd: c?.numeroEnd ?? c?.numero ?? ''
  });

  // Formata números como 11988887777 em (11) 98888-7777
const formatarTelefoneBR = (telefone) => {
  if (!telefone) return 'Não informado';
  const limpo = String(telefone).replace(/\D/g, '');
  if (limpo.length === 11) {
    return `(${limpo.substring(0, 2)}) ${limpo.substring(2, 7)}-${limpo.substring(7)}`;
  } else if (limpo.length === 10) {
    return `(${limpo.substring(0, 2)}) ${limpo.substring(2, 6)}-${limpo.substring(6)}`;
  }
  return telefone; // Retorna original se não bater o tamanho
};

// Calcula a idade com base na data de nascimento (AAAA-MM-DD)
const calcularIdade = (dataNasc) => {
  if (!dataNasc) return '—';
  const hoje = new Date();
  const nascimento = new Date(dataNasc);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const m = hoje.getMonth() - nascimento.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }
  return isNaN(idade) ? '—' : `${idade} anos`;
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

  return (
    <div className="pb-24 px-5 pt-6 bg-background min-h-screen">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-primary text-2xl font-bold">Gestão de Clientes</h2>
          <p className="text-gray-600 text-sm">Visualize e gerencie os perfis e históricos</p>
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
          placeholder="Buscar cliente pelo nome..."
          className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border-2 border-gray-200 focus:outline-none focus:border-primary transition-colors shadow-sm"
        />
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl p-3 shadow-sm text-center border border-gray-100">
          <p className="text-2xl font-bold text-primary">{clients.length}</p>
          <p className="text-gray-500 text-xs mt-1">Total</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm text-center border border-gray-100">
          <p className="text-2xl font-bold text-accent">15</p>
          <p className="text-gray-500 text-xs mt-1">Este Mês</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm text-center border border-gray-100">
          <p className="text-2xl font-bold text-primary">3</p>
          <p className="text-gray-500 text-xs mt-1">VIPs</p>
        </div>
      </div>

      {/* Client List */}
      <div className="space-y-3">
        {loading && <p className="text-center py-4 text-gray-500 text-sm">Carregando clientes...</p>}
        {!loading && clients.length === 0 && (
          <p className="text-center py-4 text-gray-500 text-sm">Nenhum cliente encontrado.</p>
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
                  <p className="text-gray-500 text-sm">{client.phone || 'Sem telefone'}</p>
                  <p className="text-gray-400 text-xs mt-0.5 truncate">{client.localidade || client.endereco || 'Sem localidade'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${client.isAtivo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {client.isAtivo ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-primary">
                {client.totalVisits} {client.totalVisits === 1 ? 'visita' : 'visitas'}
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

      {/* Client Profile Modal */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center p-0 md:p-4 transition-opacity animate-fadeIn">
          {/* Backdrop de Fechamento */}
          <div className="absolute inset-0" onClick={() => setSelectedClient(null)}></div>

          <div className="bg-white rounded-t-3xl md:rounded-2xl w-full max-w-md max-h-[85vh] md:max-h-[90vh] overflow-y-auto z-10 shadow-2xl relative flex flex-col animate-slideUp">

            {/* Modal Header */}
            <div className="sticky top-0 bg-primary text-white p-5 shrink-0 z-20 shadow-sm">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-white text-lg font-bold truncate max-w-[220px]">{selectedClient.name}</h3>
                    <p className="text-purple-200 text-xs font-medium">{selectedClient.totalVisits} atendimentos realizados</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
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

            {/* Modal Content */}
            <div className="p-5 space-y-6 overflow-y-auto">
              
              {/* Nome e Avatar */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold text-2xl">
                    {selectedClient.name ? selectedClient.name.charAt(0) : 'U'}
                  </span>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-800">{selectedClient.name}</h4>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 ${selectedClient.isAtivo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {selectedClient.isAtivo ? 'Ativo' : 'Inativo'}
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
                    Idade: {calcularIdade(selectedClient.dataNascimento)}
                  </span>
                </div>
              </div>

              {/* Dados de Contato */}
              <div className="space-y-4">
                <h5 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Contato</h5>
                
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-gray-400" />
                  <span className="text-gray-700">
                    {formatarTelefoneBR(selectedClient.phone)}
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

      {/* Add/Edit Client Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center p-0 md:p-4 transition-opacity animate-fadeIn">
          <div className="absolute inset-0" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-t-3xl md:rounded-2xl w-full max-w-md max-h-[85vh] md:max-h-[90vh] overflow-y-auto z-10 shadow-2xl relative flex flex-col animate-slideUp">
            <div className="sticky top-0 bg-white p-5 shrink-0 z-20 shadow-sm border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">{editingClient ? 'Editar Cliente' : 'Novo Cliente'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1.5 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200">
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto">
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
            <div className="p-5 border-t border-gray-100">
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
    </div>
  );
}