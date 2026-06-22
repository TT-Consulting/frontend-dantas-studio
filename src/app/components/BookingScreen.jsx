import { useState, useEffect, useMemo, useCallback } from 'react';
import { ArrowLeft, Clock, Plus, Check, Calendar as CalendarIcon, Download, MapPin, Home, Building2, DollarSign, Eye, EyeOff, AlertCircle, Loader, Search } from 'lucide-react';
import { salvarAgendamento, listarServicosAtivos, buscarDisponibilidade, listarLocais, listarClientes } from '../../api';

export function BookingScreen({ onBack }) {
  const [step, setStep] = useState('services');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [homeZip, setHomeZip] = useState('');
  const [homeStreet, setHomeStreet] = useState('');
  const [homeNeighborhood, setHomeNeighborhood] = useState('');
  const [homeNumber, setHomeNumber] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Clientes dinâmicos (admin)
  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [clientsError, setClientsError] = useState(null);
  const [clientSearch, setClientSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);

  // Registration states
  const [fullName, setFullName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [allergies, setAllergies] = useState('');
  const [healthConditions, setHealthConditions] = useState({
    diabetes: false,
    circulatory: false,
    anticoagulant: false,
    pregnancy: false,
  });
  const [ingrowingNails, setIngrowingNails] = useState('');
  const [sensitivity, setSensitivity] = useState('');
  const [fungus, setFungus] = useState('');

  const mapClientFromApi = useCallback((client, index) => ({
    id: String(client.idCliente ?? client.id ?? index),
    name: client.nome ?? client.nomeCliente ?? 'Cliente',
    whatsapp: client.whatsapp ?? client.telefone ?? '',
    email: client.email ?? '',
    raw: client,
  }), []);

  // Serviços dinâmicos
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState(null);

  // Horários dinâmicos
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState(null);

  // Locais dinâmicos
  const [locations, setLocations] = useState([]);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [locationsError, setLocationsError] = useState(null);

  const mapLocationFromApi = (location, index) => ({
    id: String(location.idLocal ?? location.id ?? index),
    name: location.nomeLocal ?? location.nome ?? location.name ?? 'Local',
    type: (location.tipo ?? location.type ?? 'STUDIO').toLowerCase() === 'domicilio' ? 'home' : 'salon',
    address: location.enderecoCompleto ?? location.endereco ?? location.address ?? '',
    additionalFee: Number(location.taxaAdicional ?? location.taxaDeslocamento ?? location.taxa ?? 0),
    description: location.descricao ?? location.description ?? 'Espaço de atendimento',
    icon: location.tipo === 'DOMICILIO' || location.type === 'home' ? '🏠' : '🏢',
    isAtivo: location.isAtivo !== false && location.ativo !== false,
    raw: location,
  });

  const mapServiceFromApi = (service, index) => ({
    id: String(service.idServico ?? service.id ?? index),
    name: service.nomeServico ?? service.nome ?? service.titulo ?? 'Serviço',
    price: Number(service.precoBase ?? service.preco ?? service.valor ?? service.precoEstimado ?? 0),
    duration: Number(service.duracaoMinutos ?? service.duracao ?? service.tempoExecucao ?? 0),
    category: (service.categoria ?? service.categoriaServico ?? service.tipo ?? 'other') || 'other',
    raw: service,
  });

  useEffect(() => {
    let active = true;
    const fetchClients = async () => {
      setClientsLoading(true);
      setClientsError(null);
      try {
        const data = await listarClientes(clientSearch || '');
        if (active) {
          const mapped = (Array.isArray(data) ? data : []).map(mapClientFromApi);
          setClients(mapped);
        }
      } catch (error) {
        console.error('❌ Erro ao listar clientes:', error);
        if (active) setClientsError('Erro ao carregar clientes.');
      } finally {
        if (active) setClientsLoading(false);
      }
    };
    const debounceId = setTimeout(fetchClients, 500); // 500ms para reduzir carga no backend
    return () => {
      active = false;
      clearTimeout(debounceId);
    };
  }, [clientSearch]);

  useEffect(() => {
    let isMounted = true;

    const fetchServices = async () => {
      setServicesLoading(true);
      setServicesError(null);
      try {
        const data = await listarServicosAtivos();
        const mapped = (Array.isArray(data) ? data : []).map(mapServiceFromApi);
        if (isMounted) {
          setServices(mapped);
        }
      } catch (error) {
        console.error('❌ Erro ao listar serviços ativos:', error);
        if (isMounted) {
          setServicesError('Erro ao carregar serviços. Tente novamente.');
        }
      } finally {
        if (isMounted) {
          setServicesLoading(false);
        }
      }
    };

    fetchServices();

    return () => {
      isMounted = false;
    };
  }, []);

  // Carrega horários disponíveis quando a data é selecionada
  useEffect(() => {
    if (!selectedDate || !selectedServices.length) {
      setAvailableSlots([]);
      return;
    }

    let isMounted = true;

    const fetchSlots = async () => {
      setSlotsLoading(true);
      setSlotsError(null);
      try {
        const dateISO = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD
        const idServico = parseInt(selectedServices[0]?.id) || 1;
        
        console.log(`📅 Buscando disponibilidade para ${dateISO} e serviço ID ${idServico}`);
        const slots = await buscarDisponibilidade(dateISO, idServico);
        
        if (isMounted) {
          // Mapear horários retornados do backend em formato ["14:00", "14:30", ...]
          // ou em formato de objetos {time, available}
          const formattedSlots = Array.isArray(slots)
            ? slots.map((slot) => 
                typeof slot === 'string' 
                  ? { time: slot, available: true }
                  : { time: slot.time ?? slot.hora, available: slot.available !== false }
              )
            : [];
          
          setAvailableSlots(formattedSlots);
          console.log(`✅ ${formattedSlots.length} horários carregados`, formattedSlots);
        }
      } catch (error) {
        console.error('❌ Erro ao buscar disponibilidade:', error);
        if (isMounted) {
          setSlotsError('Erro ao carregar horários. Tente outra data.');
        }
      } finally {
        if (isMounted) {
          setSlotsLoading(false);
        }
      }
    };

    fetchSlots();

    return () => {
      isMounted = false;
    };
  }, [selectedDate, selectedServices]);

  // Carrega locais disponíveis na montagem do componente
  useEffect(() => {
    let isMounted = true;

    const fetchLocations = async () => {
      setLocationsLoading(true);
      setLocationsError(null);
      try {
        console.log('📍 Carregando locais de atendimento...');
        const data = await listarLocais();
        const mapped = (Array.isArray(data) ? data : [])
          .map(mapLocationFromApi)
          .filter((loc) => loc.isAtivo);
        
        if (isMounted) {
          setLocations(mapped);
          console.log(`✅ ${mapped.length} locais carregados`, mapped);
        }
      } catch (error) {
        console.error('❌ Erro ao listar locais:', error);
        if (isMounted) {
          setLocationsError('Erro ao carregar locais de atendimento.');
        }
      } finally {
        if (isMounted) {
          setLocationsLoading(false);
        }
      }
    };

    fetchLocations();

    return () => {
      isMounted = false;
    };
  }, []);

  // Use locations dinâmicos ou fallback mockado se houver erro
  const availableLocations = locationsError || (!locationsLoading && locations.length === 0) 
    ? [
        {
          id: '1',
          name: 'Studio Padrão',
          type: 'salon',
          address: 'Endereço padrão',
          additionalFee: 0,
          description: 'Atendimento em estúdio',
          icon: '🏢',
        },
      ]
    : locations;


  const uniqueCategories = useMemo(() =>
    Array.from(
      new Set(services.map((service) => service.category || 'other'))
    ).filter(Boolean),
    [services]
  );

  const categories = useMemo(() => [
    { id: 'all', label: 'Todos' },
    ...uniqueCategories.map((cat) => ({
      id: cat,
      label: cat.charAt(0).toUpperCase() + cat.slice(1),
    })),
  ], [uniqueCategories]);

  useEffect(() => {
    const validCategoryIds = categories.map((c) => c.id);
    if (!validCategoryIds.includes(selectedCategory)) {
      setSelectedCategory('all');
    }
  }, [categories, selectedCategory]);

  const filteredServices = selectedCategory === 'all'
    ? services
    : services.filter((s) => s.category === selectedCategory);

  const toggleService = (service) => {
    if (selectedServices.find(s => s.id === service.id)) {
      setSelectedServices(selectedServices.filter(s => s.id !== service.id));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}m`;
    }
  };

  const getTotalPrice = () => {
    const servicesTotal = selectedServices.reduce((sum, service) => sum + service.price, 0);
    const locationFee = selectedLocation?.additionalFee || 0;
    return servicesTotal + locationFee;
  };

  const getTotalDuration = () => {
    return selectedServices.reduce((sum, service) => sum + service.duration, 0);
  };

  const handleFinalizeBooking = async () => {
    const hasSelectedClient = !!selectedClient;
    const hasNewClientData = fullName && whatsapp && email;

    if ((!hasSelectedClient && !hasNewClientData) || !selectedDate || !selectedTime) {
      setSubmitError('Selecione um cliente ou preencha os dados obrigatórios.');
      return;
    }

    // Se é novo cliente (cadastro rápido), vai para anamnese
    if (!hasSelectedClient && hasNewClientData && step === 'registration') {
      setStep('anamnesis');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Mapear dados de saúde checados
      const healthIssues = [];
      if (healthConditions.diabetes) healthIssues.push('DIABETES');
      if (healthConditions.circulatory) healthIssues.push('CIRCULATORIA');
      if (healthConditions.anticoagulant) healthIssues.push('ANTICOAGULANTE');
      if (healthConditions.pregnancy) healthIssues.push('GRAVIDEZ');

      // Construir payload do agendamento conforme especificado no backend
      const agendamentoData = {
        cliente: hasSelectedClient ? { idCliente: parseInt(selectedClient.id) } : null,
        servico: { idServico: parseInt(selectedServices[0]?.id || 1) },
        dataHoraInicio: `${selectedDate.toISOString().split('T')[0]}T${selectedTime}:00`,
        tipoLocal: selectedLocation?.type === 'home' ? 'DOMICILIO' : 'STUDIO',
        localStudio: selectedLocation?.type === 'salon' ? { idLocal: parseInt(selectedLocation.id) } : null,
        taxaDeslocamento: selectedLocation?.additionalFee || 0.0,
        cepAtendimento: homeZip || null,
        // Dados de anamnese do cliente
        nomeCliente: hasSelectedClient ? selectedClient.name : fullName,
        whatsappCliente: hasSelectedClient ? selectedClient.whatsapp : whatsapp,
        emailCliente: hasSelectedClient ? selectedClient.email : email,
        dataNascimento: birthDate || null,
        genero: gender || 'NAO_INFORMADO',
        alergias: allergies || null,
        condicoesSaude: healthIssues.length > 0 ? healthIssues.join(',') : null,
        possuiUnhasEncravadas: ingrowingNails === 'sim',
        sensibilidadeExcessiva: sensitivity === 'Alta',
        possuiMicoseFungos: fungus === 'sim',
      };

      console.log('📤 Enviando agendamento:', agendamentoData);
      await salvarAgendamento(agendamentoData);
      
      console.log('✅ Agendamento realizado com sucesso!');
      setStep('success');
    } catch (error) {
      console.error('❌ Erro ao agendar:', error);
      setSubmitError(
        error.response?.data?.message || 
        'Erro ao confirmar agendamento. Verifique o horário disponível e tente novamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isHomeSelected = selectedLocation?.type === 'home';
  const normalizedCep = homeZip.replace(/\D/g, '');
  const isCepValid = normalizedCep.length === 8;
  const isAddressComplete = homeStreet && homeNeighborhood && homeNumber && isCepValid;
  const canProceedLocation = selectedLocation && (!isHomeSelected || isAddressComplete);

  // TELA 3: Seleção de Serviços
  if (step === 'services') {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-white px-5 py-4 shadow-sm sticky top-0 z-10">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-primary hover:text-accent transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span>Voltar</span>
          </button>
          <h2 className="text-primary text-2xl">O que vamos fazer hoje?</h2>
        </div>

        {/* Filters */}
        <div className="px-5 py-4 bg-white border-b border-gray-100 sticky top-20 z-10">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  selectedCategory === category.id
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-primary'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Services List */}
        <div className="px-5 py-6 space-y-3 pb-32">
          {servicesLoading && (
            <div className="flex items-center gap-3 text-primary">
              <Loader className="animate-spin" size={18} />
              <span>Carregando serviços...</span>
            </div>
          )}

          {servicesError && !servicesLoading && (
            <div className="p-4 rounded-lg bg-red-50 text-red-700 text-sm">
              {servicesError}
            </div>
          )}

          {!servicesLoading && !servicesError && filteredServices.length === 0 && (
            <div className="p-4 rounded-lg bg-gray-50 text-gray-600 text-sm">
              Nenhum serviço disponível no momento.
            </div>
          )}

          {filteredServices.map((service) => {
            const isSelected = selectedServices.find((s) => s.id === service.id);
            return (
              <div
                key={service.id}
                className={`bg-white rounded-xl p-5 shadow-md transition-all ${
                  isSelected ? 'ring-2 ring-primary shadow-lg' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="text-gray-800 font-semibold mb-1">{service.name}</h4>
                    <div className="flex items-center gap-3 mb-2">
                      <p className="text-accent text-lg">R$ {service.price}</p>
                      <div className="flex items-center gap-1 text-gray-500 text-sm">
                        <Clock size={14} />
                        <span>{formatDuration(service.duration)}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleService(service)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-primary text-white shadow-lg'
                        : 'bg-gray-100 text-gray-400 hover:bg-primary hover:text-white'
                    }`}
                  >
                    {isSelected ? <Check size={20} /> : <Plus size={20} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Fixed Bottom Bar */}
        {selectedServices.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-5 py-4 shadow-lg">
            <div className="max-w-md mx-auto">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <p className="text-gray-600 text-sm">{selectedServices.length} serviço(s)</p>
                  <p className="text-primary text-lg">R$ {getTotalPrice()} • {formatDuration(getTotalDuration())}</p>
                </div>
              </div>
              <button
                onClick={() => setStep('location')}
                className="w-full bg-accent text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Escolher Local de Atendimento
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // NOVA TELA: Seleção de Local
  if (step === 'location') {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-white px-5 py-4 shadow-sm">
          <button
            onClick={() => setStep('services')}
            className="flex items-center gap-2 text-primary hover:text-accent transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span>Voltar</span>
          </button>
          <h2 className="text-primary text-2xl">Onde prefere ser atendida?</h2>
          <p className="text-gray-600 text-sm mt-2">Escolha o local mais conveniente para você</p>
        </div>

        {/* CEP overlay when home service is selected */}
        {isHomeSelected && (
          <div className="px-5 -mt-2 mb-2 relative z-10">
            <div className="bg-white rounded-xl p-5 shadow-xl border border-primary/10">
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={16} className="text-primary" />
                <p className="text-gray-800 font-semibold text-sm">Endereço para atendimento domiciliar</p>
              </div>
              <p className="text-gray-600 text-sm mb-4">Informe seus dados para confirmar disponibilidade e calcular a taxa de deslocamento.</p>
              
              {/* Rua */}
              <div className="mb-3">
                <label className="text-gray-700 text-xs font-semibold mb-1 block">Rua</label>
                <input
                  type="text"
                  value={homeStreet}
                  onChange={(e) => setHomeStreet(e.target.value)}
                  placeholder="Ex: Rua das Flores"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {/* Bairro e Número */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-gray-700 text-xs font-semibold mb-1 block">Bairro</label>
                  <input
                    type="text"
                    value={homeNeighborhood}
                    onChange={(e) => setHomeNeighborhood(e.target.value)}
                    placeholder="Ex: Jardins"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="text-gray-700 text-xs font-semibold mb-1 block">Número</label>
                  <input
                    type="text"
                    value={homeNumber}
                    onChange={(e) => setHomeNumber(e.target.value)}
                    placeholder="Ex: 123"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              {/* CEP */}
              <div className="flex gap-3">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={9}
                  value={homeZip}
                  onChange={(e) => setHomeZip(e.target.value)}
                  placeholder="Ex: 01310-100"
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <div className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center whitespace-nowrap ${
                  isCepValid ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {isCepValid ? '✓ CEP' : '8 dig'}
                </div>
              </div>
              {homeZip && !isCepValid && (
                <p className="text-accent text-xs mt-2">Digite um CEP com 8 números para continuar.</p>
              )}
            </div>
          </div>
        )}

        {/* Locations List */}
        <div className="px-5 py-6 space-y-4 pb-32">
          {locationsLoading && (
            <div className="flex items-center gap-3 text-primary">
              <Loader className="animate-spin" size={18} />
              <span>Carregando locais...</span>
            </div>
          )}

          {locationsError && !locationsLoading && (
            <div className="p-4 rounded-lg bg-yellow-50 text-yellow-700 text-sm">
              ⚠️ {locationsError} Usando local padrão.
            </div>
          )}

          {!locationsLoading && availableLocations.length === 0 && (
            <div className="p-4 rounded-lg bg-gray-50 text-gray-600 text-sm">
              Nenhum local de atendimento disponível no momento.
            </div>
          )}

          {availableLocations.map((location) => {
            const isSelected = selectedLocation?.id === location.id;
            const IconComponent = location.type === 'salon' ? Building2 : Home;
            
            return (
              <div
                key={location.id}
                onClick={() => {
                  setSelectedLocation(location);
                  if (location.type !== 'home') {
                    setHomeZip('');
                    setHomeStreet('');
                    setHomeNeighborhood('');
                    setHomeNumber('');
                  }
                }}
                className={`bg-white rounded-xl p-5 shadow-md cursor-pointer transition-all ${
                  isSelected ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-lg'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                    isSelected ? 'bg-primary/10' : 'bg-gray-50'
                  }`}>
                    {location.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className={`font-semibold ${isSelected ? 'text-primary' : 'text-gray-800'}`}>
                        {location.name}
                      </h4>
                      {isSelected && (
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <Check className="text-white" size={14} />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                      <MapPin size={14} className="text-primary" />
                      <span>{location.address}</span>
                    </div>

                    <p className="text-gray-600 text-sm mb-3">{location.description}</p>

                    {/* Additional Fee */}
                    {location.additionalFee > 0 ? (
                      <div className="flex items-center gap-2 bg-accent/10 px-3 py-2 rounded-lg">
                        <DollarSign size={14} className="text-accent" />
                        <span className="text-accent text-sm font-medium">
                          Taxa adicional: R$ {location.additionalFee}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
                        <Check size={14} className="text-green-600" />
                        <span className="text-green-600 text-sm font-medium">
                          Sem custo adicional
                        </span>
                      </div>
                    )}

                    {/* Home Service Info */}
                    {location.type === 'home' && (
                      <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                        <p className="text-purple-700 text-xs">
                          ℹ️ Atendimento domiciliar disponível em horário reduzido (10h às 17h)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Fixed Bottom Bar */}
        {selectedLocation && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-5 py-4 shadow-lg">
            <div className="max-w-md mx-auto">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <p className="text-gray-600 text-sm">{selectedLocation.name}</p>
                  <p className="text-primary text-lg">
                    Total: R$ {getTotalPrice()}
                    {selectedLocation.additionalFee > 0 && (
                      <span className="text-gray-500 text-sm ml-2">
                        (inclui taxa de R$ {selectedLocation.additionalFee})
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={() => canProceedLocation && setStep('datetime')}
                disabled={!canProceedLocation}
                className={`w-full py-4 rounded-xl shadow-lg transition-all ${
                  canProceedLocation
                    ? 'bg-accent text-white hover:shadow-xl'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                }`}
              >
                Escolher Data e Horário
              </button>
              {isHomeSelected && !isAddressComplete && (
                <p className="text-gray-600 text-xs text-center mt-2">Informe o endereço completo para prosseguir com atendimento a domicílio.</p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // TELA 4: Seleção de Data e Horário
  if (step === 'datetime') {
    const dates = generateDates();

    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-white px-5 py-4 shadow-sm">
          <button
            onClick={() => setStep('location')}
            className="flex items-center gap-2 text-primary hover:text-accent transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span>Voltar</span>
          </button>
          <h2 className="text-primary text-2xl">Escolha a Data e Horário</h2>
        </div>

        {/* Calendar Horizontal */}
        <div className="px-5 py-6 bg-white border-b border-gray-100">
          <p className="text-gray-600 text-sm mb-4">Selecione o dia</p>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {dates.map((date, index) => {
              const isSelected = selectedDate?.toDateString() === date.toDateString();
              const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' });
              const dayNum = date.getDate();
              
              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  className={`shrink-0 w-16 h-20 rounded-xl flex flex-col items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-primary text-white shadow-lg scale-105'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <p className="text-xs capitalize mb-1">{dayName}</p>
                  <p className={`text-xl ${isSelected ? 'font-bold' : ''}`}>{dayNum}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Grid */}
        {selectedDate && (
          <div className="px-5 py-6">
            <p className="text-gray-600 text-sm mb-4">Horários disponíveis</p>
            
            {slotsLoading && (
              <div className="flex items-center gap-3 text-primary">
                <Loader className="animate-spin" size={18} />
                <span>Carregando horários...</span>
              </div>
            )}

            {slotsError && !slotsLoading && (
              <div className="p-4 rounded-lg bg-red-50 text-red-700 text-sm">
                {slotsError}
              </div>
            )}

            {!slotsLoading && !slotsError && availableSlots.length === 0 && (
              <div className="p-4 rounded-lg bg-yellow-50 text-yellow-700 text-sm">
                Nenhum horário disponível para esta data. Tente escolher outra.
              </div>
            )}

            {!slotsLoading && availableSlots.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {availableSlots.map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => slot.available && setSelectedTime(slot.time)}
                    disabled={!slot.available}
                    className={`py-3 rounded-lg text-sm transition-all ${
                      selectedTime === slot.time
                        ? 'bg-primary text-white shadow-lg'
                        : slot.available
                        ? 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm'
                        : 'bg-gray-100 text-gray-300 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Fixed Bottom Button */}
        {selectedDate && selectedTime && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-5 py-4 shadow-lg">
            <button
              onClick={() => setStep('confirmation')}
              className="w-full max-w-md mx-auto bg-accent text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <Check size={20} />
              <span>Confirmar Horário</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // TELA 5: Resumo e Sucesso
  if (step === 'confirmation' || step === 'success') {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-white px-5 py-4 shadow-sm">
          <button
            onClick={step === 'confirmation' ? () => setStep('datetime') : onBack}
            className="flex items-center gap-2 text-primary hover:text-accent transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Voltar</span>
          </button>
        </div>

        {/* Success Icon */}
        <div className="px-5 pt-12 pb-8 text-center">
          <div className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="text-accent" size={48} />
          </div>
          <h2 className="text-primary text-2xl mb-2">Agendamento Confirmado!</h2>
          <p className="text-gray-600">Seu horário foi reservado com sucesso</p>
        </div>

        {/* Summary Card */}
        <div className="px-5 pb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-primary/20 max-w-md mx-auto">
            <h3 className="text-primary mb-4 text-lg">Resumo do Agendamento</h3>
            
            {/* Services */}
            <div className="mb-4 pb-4 border-b border-gray-100">
              <p className="text-gray-600 text-sm mb-2">Serviços</p>
              {selectedServices.map((service) => (
                <div key={service.id} className="flex justify-between items-start mb-2">
                  <p className="text-gray-800">{service.name}</p>
                  <p className="text-accent">R$ {service.price}</p>
                </div>
              ))}
            </div>

            {/* Cliente */}
            <div className="mb-4 pb-4 border-b border-gray-100">
              <p className="text-gray-600 text-sm mb-2">Cliente</p>
              <p className="text-gray-800">{selectedClient?.name || 'Selecione um cliente'}</p>
              {selectedClient?.whatsapp && (
                <p className="text-gray-600 text-xs mt-1">WhatsApp: {selectedClient.whatsapp}</p>
              )}
            </div>

            {/* Date and Time */}
            <div className="mb-4 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <MapPin size={18} className="text-primary" />
                <div>
                  <p className="text-gray-600 text-sm">Local</p>
                  <p className="text-gray-800">{selectedLocation?.name}</p>
                  {selectedLocation?.additionalFee && selectedLocation.additionalFee > 0 && (
                    <p className="text-accent text-xs">+ Taxa: R$ {selectedLocation.additionalFee}</p>
                  )}
                  {selectedLocation?.type === 'home' && homeStreet && (
                    <div className="text-gray-600 text-xs mt-2 pt-2 border-t border-gray-100">
                      <p>{homeStreet}, {homeNumber} - {homeNeighborhood}</p>
                      <p>CEP: {normalizedCep}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <CalendarIcon size={18} className="text-primary" />
                <div>
                  <p className="text-gray-600 text-sm">Data</p>
                  <p className="text-gray-800">{selectedDate && formatDate(selectedDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock size={18} className="text-primary" />
                <div>
                  <p className="text-gray-600 text-sm">Horário</p>
                  <p className="text-gray-800">{selectedTime}</p>
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center">
              <p className="text-gray-800">Total</p>
              <p className="text-primary text-2xl">R$ {getTotalPrice()}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-5 pb-8">
          <div className="space-y-3 max-w-md mx-auto">
            {step === 'confirmation' && (
              <button
                onClick={() => setStep('registration')}
                className="w-full bg-primary text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <Check size={20} />
                <span>Faça seu Cadastro Rápido</span>
              </button>
            )}
            <button
              onClick={() => {
                // Simulate calendar save
                alert('Agendamento salvo no calendário!');
              }}
              className="w-full bg-primary text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <Download size={20} />
              <span>Salvar no meu Calendário</span>
            </button>
            <button
              onClick={onBack}
              className="w-full bg-white text-primary border-2 border-primary py-4 rounded-xl hover:bg-primary/5 transition-all"
            >
              Voltar para Home
            </button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="px-5 pb-8">
          <div className="bg-purple-50 rounded-xl p-4 max-w-md mx-auto">
            <p className="text-gray-700 text-sm text-center">
              📱 Você receberá uma confirmação via WhatsApp com todos os detalhes do seu agendamento.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // TELA 6: Cadastro Rápido
  if (step === 'registration') {
    const isFormComplete = fullName && whatsapp && email && password && birthDate && gender;

    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-white px-5 py-4 shadow-sm sticky top-0 z-10">
          <button
            onClick={() => setStep('confirmation')}
            className="flex items-center gap-2 text-primary hover:text-accent transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span>Voltar</span>
          </button>
          <h2 className="text-primary text-2xl">Cadastro Rápido</h2>
          <p className="text-gray-600 text-sm mt-2">Preencha seus dados para completar o agendamento</p>
        </div>

        {/* Form Content */}
        <div className="px-5 py-6 pb-32 max-w-md mx-auto">
          
          {/* SEÇÃO 1: Identificação e Contato */}
          <div className="mb-8">
            <h3 className="text-primary font-semibold text-base mb-4 flex items-center gap-2">
              👤 Identificação e Contato
            </h3>

            {/* Nome Completo */}
            <div className="mb-4">
              <label className="text-gray-700 text-sm font-semibold mb-1 block">Nome Completo *</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ex: Maria Silva Santos"
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* WhatsApp */}
            <div className="mb-4">
              <label className="text-gray-700 text-sm font-semibold mb-1 block">WhatsApp *</label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="Ex: (11) 98765-4321"
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <p className="text-gray-500 text-xs mt-1">📱 Usamos para confirmar e lembrar seu agendamento</p>
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="text-gray-700 text-sm font-semibold mb-1 block">E-mail *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex: maria@email.com"
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Senha */}
            <div className="mb-4">
              <label className="text-gray-700 text-sm font-semibold mb-1 block">Senha *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Crie uma senha segura"
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-600 hover:text-gray-800"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Data de Nascimento */}
            <div className="mb-4">
              <label className="text-gray-700 text-sm font-semibold mb-1 block">Data de Nascimento *</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <p className="text-gray-500 text-xs mt-1">🎂 Para ações de marketing e verificação de procedimentos</p>
            </div>

            {/* Gênero */}
            <div className="mb-4">
              <label className="text-gray-700 text-sm font-semibold mb-1 block">Gênero *</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Selecione uma opção</option>
                <option value="cisgender">Cisgênero</option>
                <option value="transgender">Transgênero</option>
                <option value="nonbinary">Não-binário</option>
                <option value="prefer-not">Prefiro não informar</option>
              </select>
            </div>
          </div>

          {/* SEÇÃO 2: Ficha de Anamnese */}
          <div className="mb-8 pb-8 border-t border-gray-200 pt-8">
            <h3 className="text-primary font-semibold text-base mb-4 flex items-center gap-2">
              🩺 Ficha de Anamnese (Saúde)
            </h3>
            <p className="text-gray-600 text-sm mb-4">Estas informações garantem sua segurança durante o procedimento</p>

            {/* Alergias */}
            <div className="mb-4">
              <label className="text-gray-700 text-sm font-semibold mb-1 block">Alergias Conhecidas</label>
              <textarea
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="Ex: Tolueno, formaldeído, látex, acrílico..."
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                rows={2}
              />
              <p className="text-gray-500 text-xs mt-1">Deixe em branco se não tem alergias conhecidas</p>
            </div>

            {/* Condições de Saúde */}
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-gray-700 text-sm font-semibold mb-3">Condições de Saúde</p>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={healthConditions.diabetes}
                    onChange={(e) => setHealthConditions({...healthConditions, diabetes: e.target.checked})}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-gray-700 text-sm">Diabetes (exige cuidado redobrado)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={healthConditions.circulatory}
                    onChange={(e) => setHealthConditions({...healthConditions, circulatory: e.target.checked})}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-gray-700 text-sm">Problemas circulatórios</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={healthConditions.anticoagulant}
                    onChange={(e) => setHealthConditions({...healthConditions, anticoagulant: e.target.checked})}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-gray-700 text-sm">Uso de medicamentos anticoagulantes</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={healthConditions.pregnancy}
                    onChange={(e) => setHealthConditions({...healthConditions, pregnancy: e.target.checked})}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-gray-700 text-sm">Gestação</span>
                </label>
              </div>
            </div>

            {/* Histórico das Unhas */}
            <div className="space-y-4">
              <div>
                <label className="text-gray-700 text-sm font-semibold mb-1 block">Possui unhas encravadas recorrentes?</label>
                <select
                  value={ingrowingNails}
                  onChange={(e) => setIngrowingNails(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Selecione</option>
                  <option value="yes">Sim</option>
                  <option value="no">Não</option>
                  <option value="sometimes">Às vezes</option>
                </select>
              </div>

              <div>
                <label className="text-gray-700 text-sm font-semibold mb-1 block">Sensibilidade excessiva nas mãos ou pés?</label>
                <select
                  value={sensitivity}
                  onChange={(e) => setSensitivity(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Selecione</option>
                  <option value="yes">Sim</option>
                  <option value="no">Não</option>
                  <option value="mild">Leve</option>
                </select>
              </div>

              <div>
                <label className="text-gray-700 text-sm font-semibold mb-1 block">Micose ou fungos ativos?</label>
                <select
                  value={fungus}
                  onChange={(e) => setFungus(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Selecione</option>
                  <option value="yes">Sim</option>
                  <option value="no">Não</option>
                  <option value="unsure">Não tenho certeza</option>
                </select>
                <p className="text-gray-500 text-xs mt-1">⚠️ Importante para garantir a segurança de todos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-5 py-4 shadow-lg">
          <div className="max-w-md mx-auto">
            {submitError && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">{submitError}</p>
              </div>
            )}
            <button
              onClick={handleFinalizeBooking}
              disabled={!isFormComplete || isSubmitting}
              className={`w-full py-4 rounded-xl shadow-lg transition-all font-semibold flex items-center justify-center gap-2 ${
                isFormComplete && !isSubmitting
                  ? 'bg-accent text-white hover:shadow-xl'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting && <Loader size={18} className="animate-spin" />}
              <span>{isSubmitting ? 'Próximo...' : 'Próximo: Ficha de Saúde'}</span>
            </button>
            {!isFormComplete && !isSubmitting && (
              <p className="text-gray-600 text-xs text-center mt-2">Preencha todos os campos obrigatórios (*)</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // TELA 7: Ficha de Anamnese
  if (step === 'anamnesis') {
    const isAnamnesisComplete = allergies || ingrowingNails || sensitivity || fungus;

    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-white px-5 py-4 shadow-sm sticky top-0 z-10">
          <button
            onClick={() => setStep('registration')}
            className="flex items-center gap-2 text-primary hover:text-accent transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span>Voltar</span>
          </button>
          <h2 className="text-primary text-2xl">Ficha de Anamnese</h2>
          <p className="text-gray-600 text-sm mt-2">Informações importantes sobre sua saúde</p>
        </div>

        {/* Form Content */}
        <div className="px-5 py-6 pb-32 max-w-md mx-auto">
          
          {/* Alergias */}
          <div className="mb-6">
            <h3 className="text-primary font-semibold text-base mb-4 flex items-center gap-2">
              ⚠️ Alergias
            </h3>
            <div>
              <label className="text-gray-700 text-sm font-semibold mb-2 block">Possui alguma alergia conhecida? *</label>
              <textarea
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="Ex: Tolueno, formaldeído, látex, acrílico..."
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                rows={2}
              />
              <p className="text-gray-500 text-xs mt-1">Deixe em branco se não tem alergias conhecidas</p>
            </div>
          </div>

          {/* Histórico das Unhas */}
          <div className="mb-6">
            <h3 className="text-primary font-semibold text-base mb-4 flex items-center gap-2">
              💅 Histórico das Unhas
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-gray-700 text-sm font-semibold mb-1 block">Possui unhas encravadas recorrentes?</label>
                <select
                  value={ingrowingNails}
                  onChange={(e) => setIngrowingNails(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Selecione</option>
                  <option value="yes">Sim</option>
                  <option value="no">Não</option>
                  <option value="sometimes">Às vezes</option>
                </select>
              </div>

              <div>
                <label className="text-gray-700 text-sm font-semibold mb-1 block">Sensibilidade excessiva nas mãos ou pés?</label>
                <select
                  value={sensitivity}
                  onChange={(e) => setSensitivity(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Selecione</option>
                  <option value="yes">Sim</option>
                  <option value="no">Não</option>
                  <option value="mild">Leve</option>
                </select>
              </div>

              <div>
                <label className="text-gray-700 text-sm font-semibold mb-1 block">Micose ou fungos ativos?</label>
                <select
                  value={fungus}
                  onChange={(e) => setFungus(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Selecione</option>
                  <option value="yes">Sim</option>
                  <option value="no">Não</option>
                  <option value="unsure">Não tenho certeza</option>
                </select>
                <p className="text-gray-500 text-xs mt-1">⚠️ Importante para garantir a segurança de todos</p>
              </div>
            </div>
          </div>

          {/* Informação Importante */}
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-purple-700 text-sm">
              <strong>ℹ️ Informação importante:</strong> Essas informações ajudam nossa equipe a oferecer o melhor atendimento e cuidado personalizado para você.
            </p>
          </div>
        </div>

        {/* Fixed Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-5 py-4 shadow-lg">
          <div className="max-w-md mx-auto">
            <button
              onClick={handleFinalizeBooking}
              disabled={isSubmitting}
              className={`w-full py-4 rounded-xl shadow-lg transition-all font-semibold flex items-center justify-center gap-2 ${
                !isSubmitting
                  ? 'bg-accent text-white hover:shadow-xl'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting && <Loader size={18} className="animate-spin" />}
              <span>{isSubmitting ? 'Finalizando...' : 'Confirmar Agendamento'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
