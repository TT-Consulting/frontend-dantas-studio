import { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, MapPin, Phone, ArrowLeft, UserPlus, Loader, HeartPulse, Home, Filter, User, X, ExternalLink, DollarSign } from 'lucide-react';
import { salvarCliente, atualizarCliente, apiClient, buscarAgendamentosPorCliente, buscarAgendamentoPorId, listarLocais, listarServicosAtivos } from '../../api';

const toNumber = (...values) => {
  for (const value of values) {
    if (value === undefined || value === null || value === '') continue;
    const normalized = typeof value === 'string'
      ? value.replace(',', '.').replace(/[^0-9.-]/g, '')
      : value;
    const parsed = Number(normalized);
    if (!Number.isNaN(parsed)) return parsed;
  }

  return 0;
};

const extractMapsData = (value) => {
  if (!value) return { maps: '', image: '' };

  if (typeof value === 'string') {
    const [maps = '', image = ''] = value.split('||');
    return { maps, image };
  }

  return {
    maps: value.maps || value.linkMaps || value.linkGoogleMaps || '',
    image: value.image || value.imagem || value.fotoUrl || value.imagemUrl || ''
  };
};

const buildMapsUrl = (address) => {
  if (!address) return 'https://www.google.com/maps';
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
};

export function ClientPortal({ onBack, initialClientData }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showQuickRegister, setShowQuickRegister] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' }); // success, error

  // 🌟 ESTADO: Armazena o agendamento clicado para abrir a modal de detalhes
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // 🌟 ESTADO: Armazena os locais de atendimento do backend
  const [locais, setLocais] = useState([]);
  const [servicosCatalogo, setServicosCatalogo] = useState([]);
  const [isLoadingAppointmentDetails, setIsLoadingAppointmentDetails] = useState(false);

  // Dados do Local (usa o primeiro local da lista ou fallback)
  const dadosDoLocal = useMemo(() => {
    if (locais && locais.length > 0) {
      return {
        nome: locais[0].nomeLocal || locais[0].nome || "Studio de Beleza & Estética",
        endereco: locais[0].enderecoCompleto || locais[0].endereco || locais[0].logradouro || "Av. Paulista, 1000 - Bela Vista, São Paulo - SP, 01310-100",
        telefone: locais[0].telefone || locais[0].contato || "(11) 99999-8888",
        linkMaps: locais[0].linkGoogleMaps || locais[0].linkMaps || locais[0].mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locais[0].enderecoCompleto || locais[0].endereco || "")}`,
        imagemUrl: locais[0].fotoUrl || locais[0].imagemUrl || locais[0].imagem || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80"
      };
    }

    return {
      nome: "Studio de Beleza & Estética",
      endereco: "Av. Paulista, 1000 - Bela Vista, São Paulo - SP, 01310-100",
      telefone: "(11) 99999-8888",
      linkMaps: "https://www.google.com/maps/search/?api=1&query=Av.+Paulista,+1000+-+Bela+Vista,+São+Paulo+-+SP",
      imagemUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80"
    };
  }, [locais]);

  // Controla se a anamnese/formulário deve ser exibido obrigatoriamente
  const [showAnamesis, setShowAnamesis] = useState(false);

  // Campos editáveis principais do cliente
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loginError, setLoginError] = useState(null);

  // Cliente retornado do banco
  const [currentClient, setCurrentClient] = useState(null);

  // Estado para agendamentos reais do banco e filtro de data
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [filterDate, setFilterDate] = useState('');
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);

  // Estados para cadastro rápido
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // Estados do formulário clínico e endereço
  const [genero, setGenero] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [allergies, setAllergies] = useState('');
  const [condicoesSaude, setCondicoesSaude] = useState('');

  const [ingrowingNails, setIngrowingNails] = useState('no');
  const [sensitivity, setSensitivity] = useState('no');
  const [fungus, setFungus] = useState('no');

  const [cep, setCep] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [bairro, setBairro] = useState('');
  const [localidade, setLocalidade] = useState('');
  const [numero, setNumero] = useState('');

  const [isSubmittingAnamnesis, setIsSubmittingAnamnesis] = useState(false);
  const [isLoadingCep, setIsLoadingCep] = useState(false);

  // Busca de CEP
  const handleCepBlur = async () => {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;

    setIsLoadingCep(true);
    try {
      const response = await fetch(`http://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();
      if (!data.erro) {
        setLogradouro(data.logradouro || '');
        setBairro(data.bairro || '');
        setLocalidade(data.localidade || '');
      }
    } catch (err) {
      console.error("Erro ao buscar CEP via HTTP, tentando fallback HTTPS:", err);
      try {
        const responseHttps = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const dataHttps = await responseHttps.json();
        if (!dataHttps.erro) {
          setLogradouro(dataHttps.logradouro || '');
          setBairro(dataHttps.bairro || '');
          setLocalidade(dataHttps.localidade || '');
        }
      } catch (fallbackErr) {
        console.error("Falha total na busca do CEP:", fallbackErr);
      }
    } finally {
      setIsLoadingCep(false);
    }
  };

  // Sincroniza os dados do cliente atual no formulário assim que ele logar
  useEffect(() => {
    if (currentClient) {
      setNome(currentClient.nome || '');
      setEmail(currentClient.email || '');
      setPhone(currentClient.whatsapp || '');
      setGenero(currentClient.genero || '');
      setDataNascimento(currentClient.dataNascimento || '');
      setAllergies(currentClient.alergias || '');
      setCondicoesSaude(currentClient.condicoesSaude || '');
      setIngrowingNails(currentClient.possuiUnhasEncravadas ? 'yes' : 'no');
      setSensitivity(currentClient.sensibilidadeExcessiva ? 'yes' : 'no');
      setFungus(currentClient.possuiMicoseFungos ? 'yes' : 'no');
      setCep(currentClient.cep || '');
      setLogradouro(currentClient.logradouro || '');
      setBairro(currentClient.bairro || '');
      setLocalidade(currentClient.localidade || '');
      setNumero(currentClient.numero || '');
    }
  }, [currentClient]);

  // Carrega agendamentos do banco
  useEffect(() => {
    const carregarAgendamentosReais = async () => {
      if (!currentClient || showAnamesis) return;

      setIsLoadingAppointments(true);
      try {
        const agendamentosDoCliente = await buscarAgendamentosPorCliente(currentClient.idCliente);
        setAppointments(agendamentosDoCliente);
        setFilteredAppointments(agendamentosDoCliente);
      } catch (err) {
        console.error("❌ Erro ao carregar agendamentos:", err);
      } finally {
        setIsLoadingAppointments(false);
      }
    };

    carregarAgendamentosReais();
  }, [currentClient, showAnamesis]);

  // Carrega locais de atendimento do banco
  useEffect(() => {
    const carregarLocais = async () => {
      try {
        const locaisDoBackend = await listarLocais();
        setLocais(locaisDoBackend);
      } catch (err) {
        console.error("❌ Erro ao carregar locais:", err);
      }
    };

    carregarLocais();
  }, []);

  useEffect(() => {
    const carregarServicos = async () => {
      try {
        const servicosDoBackend = await listarServicosAtivos();
        setServicosCatalogo(Array.isArray(servicosDoBackend) ? servicosDoBackend : []);
      } catch (err) {
        console.error('❌ Erro ao carregar catálogo de serviços:', err);
      }
    };

    carregarServicos();
  }, []);

  // Efeito para filtrar agendamentos por data
  useEffect(() => {
    if (!filterDate) {
      setFilteredAppointments(appointments);
    } else {
      const filtrados = appointments.filter(appt => {
        if (!appt.dataHoraInicio) return false;
        return appt.dataHoraInicio.startsWith(filterDate);
      });
      setFilteredAppointments(filtrados);
    }
  }, [filterDate, appointments]);

  // Verifica se o cliente já possui cadastro completo prévio para pular o formulário
  const direcionarFluxoCliente = (cliente) => {
    setCurrentClient(cliente);
    setIsLoggedIn(true);

    if (!cliente.dataNascimento && !cliente.cep && !cliente.genero) {
      setShowAnamesis(true);
    } else {
      setShowAnamesis(false);
    }
  };

  // Login automático
  useEffect(() => {
    if (initialClientData?.email || initialClientData?.phone) {
      const loginAutomatico = async () => {
        try {
          let clientes = [];
          if (initialClientData.phone) {
            const telefoneLimpo = initialClientData.phone.replace(/\D/g, '');
            const res = await apiClient.get('/clientes', { params: { whatsapp: telefoneLimpo } });
            clientes = res.data || [];
          } else if (initialClientData.email) {
            const res = await apiClient.get('/clientes');
            clientes = (res.data || []).filter(c => c.email?.toLowerCase() === initialClientData.email.toLowerCase());
          }

          if (clientes && clientes.length > 0) {
            direcionarFluxoCliente(clientes[0]);
          }
        } catch (err) {
          console.error("Erro no login automático:", err);
        }
      };
      loginAutomatico();
    }
  }, [initialClientData]);

  // Login Manual
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError(null);
    try {
      let clientes = [];
      const inputLimpo = (email || phone).trim();

      if (inputLimpo.includes('@')) {
        const res = await apiClient.get('/clientes');
        clientes = (res.data || []).filter(c => c.email?.toLowerCase() === inputLimpo.toLowerCase());
      } else {
        const telefoneLimpo = inputLimpo.replace(/\D/g, '');
        const res = await apiClient.get('/clientes', { params: { whatsapp: telefoneLimpo } });
        clientes = res.data || [];
      }

      if (clientes && clientes.length > 0) {
        direcionarFluxoCliente(clientes[0]);
      } else {
        setLoginError('⚠️ Cliente não encontrado. Verifique os dados ou realize o Cadastro Rápido.');
      }
    } catch (err) {
      console.error(err);
      setLoginError('❌ Erro ao conectar ao servidor. Tente novamente mais tarde.');
    }
  };

  // Cadastro Rápido
  const handleQuickRegister = async (e) => {
    e.preventDefault();
    if (registerData.name && registerData.phone && registerData.email) {
      try {
        const payloadCliente = {
          idCliente: null,
          nome: registerData.name,
          email: registerData.email.trim(),
          whatsapp: registerData.phone.replace(/\D/g, ''),
          genero: null,
          dataNascimento: null,
          alergias: null,
          condicoesSaude: null,
          possuiUnhasEncravadas: false,
          sensibilidadeExcessiva: false,
          possuiMicoseFungos: false,
          cep: null,
          logradouro: null,
          bairro: null,
          localidade: null,
          numero: null,
          isAtivo: true
        };

        const novoCliente = await salvarCliente(payloadCliente);
        setCurrentClient(novoCliente);
        setIsLoggedIn(true);
        setShowAnamesis(true);
        setShowQuickRegister(false);
      } catch {
        showToast('❌ Erro ao realizar cadastro. Verifique se o WhatsApp ou E-mail já não estão cadastrados.', 'error');
      }
    }
  };

  // Salvar Formulário Completo
  const handleAnamesisSave = async (e) => {
    e.preventDefault();
    if (!currentClient) return;

    setIsSubmittingAnamnesis(true);
    try {
      const payloadAtualizado = {
        ...currentClient,
        nome: nome,
        email: email.trim(),
        whatsapp: phone.replace(/\D/g, ''),
        genero: genero || null,
        dataNascimento: dataNascimento || null,
        alergias: allergies || null,
        condicoesSaude: condicoesSaude || null,
        possuiUnhasEncravadas: ingrowingNails === 'yes',
        sensibilidadeExcessiva: sensitivity === 'yes',
        possuiMicoseFungos: fungus === 'yes',
        cep: cep || null,
        logradouro: logradouro || null,
        bairro: bairro || null,
        localidade: localidade || null,
        numero: numero || null,
        isAtivo: true
      };

      const clienteSalvo = await atualizarCliente(currentClient.idCliente, payloadAtualizado);
      setCurrentClient(clienteSalvo);

      showToast('🎉 Perfil atualizado com sucesso!', 'success');
      setShowAnamesis(false);
    } catch (error) {
      console.error('Erro ao salvar formulário completo:', error);
      showToast('Erro ao salvar alterações.', 'error');
    } finally {
      setIsSubmittingAnamnesis(false);
    }
  };

  const handleRegisterChange = (field, value) => {
    setRegisterData(prev => ({ ...prev, [field]: value }));
  };

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMADO':
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs flex items-center gap-1 font-semibold"><CheckCircle size={12} />Confirmado</span>;
      case 'PENDENTE':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs flex items-center gap-1 font-semibold"><AlertCircle size={12} />Pendente</span>;
      case 'REALIZADO':
        return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs flex items-center gap-1 font-semibold"><CheckCircle size={12} />Realizado</span>;
      case 'CANCELADO':
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs flex items-center gap-1 font-semibold"><XCircle size={12} />Cancelado</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs flex items-center gap-1 font-semibold">{status}</span>;
    }
  };

  const formatDate = (dateIsoStr) => {
    if (!dateIsoStr) return '';

    // Se receber apenas a data YYYY-MM-DD ou contiver o T, extraímos apenas a parte do dia
    const dataPura = dateIsoStr.split('T')[0];
    const partes = dataPura.split('-'); // [ano, mes, dia]

    if (partes.length === 3) {
      // Cria o objeto Date usando inteiros (o mês no JS começa em 0, por isso o -1)
      // Isso força o JavaScript a usar o fuso horário LOCAL do navegador
      const date = new Date(partes[0], partes[1] - 1, partes[2]);
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    }

    // Fallback caso a string venha em outro formato inesperado
    const date = new Date(dateIsoStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const formatTime = (dateIsoStr) => {
    if (!dateIsoStr) return '';
    const date = new Date(dateIsoStr);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const normalizarLocal = useCallback((appointment) => {
    const localBruto = appointment?.localAtendimento || appointment?.local || appointment?.unidade || appointment?.studio || appointment?.localSelecionado || null;
    const localSelecionado = localBruto || (appointment?.tipoLocal === 'DOMICILIO' ? null : locais[0] || null);
    const links = extractMapsData(localSelecionado?.linkGoogleMaps || localSelecionado?.linkMaps || localSelecionado?.mapsUrl || localSelecionado?.link || '');
    const enderecoCompleto = localSelecionado?.enderecoCompleto || localSelecionado?.endereco || localSelecionado?.logradouro || '';

    if (appointment?.tipoLocal === 'DOMICILIO' || appointment?.tipoLocal === 'HOME') {
      const enderecoDomicilio = [
        appointment?.logradouro,
        appointment?.numero,
        appointment?.bairro,
        appointment?.localidade,
        appointment?.cepAtendimento
      ].filter(Boolean).join(', ');

      return {
        nome: 'Atendimento domiciliar',
        endereco: enderecoDomicilio || 'Endereço domiciliar não informado',
        telefone: currentClient?.whatsapp || currentClient?.telefone || dadosDoLocal.telefone,
        linkMaps: buildMapsUrl(enderecoDomicilio),
        imagemUrl: links.image || localSelecionado?.fotoUrl || localSelecionado?.imagemUrl || dadosDoLocal.imagemUrl,
        isDomicilio: true
      };
    }


    return {
      nome: localSelecionado?.nomeLocal || localSelecionado?.nome || dadosDoLocal.nome,
      endereco: enderecoCompleto || dadosDoLocal.endereco,
      telefone: localSelecionado?.telefone || localSelecionado?.contato || dadosDoLocal.telefone,
      linkMaps: links.maps || buildMapsUrl(enderecoCompleto || dadosDoLocal.endereco),
      imagemUrl: links.image || localSelecionado?.fotoUrl || localSelecionado?.imagemUrl || localSelecionado?.imagem || dadosDoLocal.imagemUrl,
      isDomicilio: false,
      taxaDeslocamento: toNumber(localSelecionado?.taxaAdicional, appointment?.taxaDeslocamento)
    };
  }, [locais, currentClient, dadosDoLocal]);

  const normalizarServico = useCallback((servico, index = 0) => {
    const idServico = servico?.idServico || servico?.id || servico?.servicoId;
    const servicoCatalogado = servicosCatalogo.find((item) => String(item?.idServico || item?.id) === String(idServico)) || null;
    const combinado = { ...(servicoCatalogado || {}), ...(servico || {}) };
    const nomeServico = combinado.nomeServico || combinado.nome || servicoCatalogado?.nomeServico || servicoCatalogado?.nome || `Serviço ${index + 1}`;
    const imagemUrl = combinado.fotoUrl || combinado.imagemUrl || combinado.urlImagem || combinado.imagem || servicoCatalogado?.fotoUrl || servicoCatalogado?.imagemUrl || servicoCatalogado?.urlImagem || servicoCatalogado?.imagem || '';
    const valor = toNumber(combinado.precoBase, combinado.preco, combinado.valor, servicoCatalogado?.precoBase, servicoCatalogado?.preco, servicoCatalogado?.valor);

    return {
      ...combinado,
      idServico,
      nomeServico,
      imagemUrl,
      precoBase: valor,
      valor,
      descricao: combinado.descricao || servicoCatalogado?.descricao || 'Tratamento estético personalizado de alto padrão.'
    };
  }, [servicosCatalogo]);

  const appointmentDetails = useMemo(() => {
    if (!selectedAppointment) return null;

    const servicosSelecionados = Array.isArray(selectedAppointment.servicos) && selectedAppointment.servicos.length > 0
      ? selectedAppointment.servicos
      : selectedAppointment.servico
        ? [selectedAppointment.servico]
        : [];

    const servicosDetalhados = servicosSelecionados.map((servico, index) => normalizarServico(servico, index));
    const servicoPrincipal = servicosDetalhados[0] || normalizarServico(selectedAppointment.servico || selectedAppointment, 0);
    const subtotalServicos = servicosDetalhados.length > 0
      ? servicosDetalhados.reduce((acc, servico) => acc + toNumber(servico.precoBase, servico.preco, servico.valor), 0)
      : toNumber(
        selectedAppointment.precoBase,
        selectedAppointment.preco,
        selectedAppointment.valor,
        selectedAppointment.servico?.precoBase,
        selectedAppointment.servico?.preco,
        selectedAppointment.servico?.valor,
        servicoPrincipal.precoBase,
        servicoPrincipal.valor
      );
    const localDetalhado = normalizarLocal(selectedAppointment);
    const taxaDeslocamento = toNumber(selectedAppointment.taxaDeslocamento, localDetalhado.taxaDeslocamento);

    return {
      ...selectedAppointment,
      servicos: servicosDetalhados.length > 0 ? servicosDetalhados : selectedAppointment.servicos,
      servico: servicoPrincipal,
      localDetalhado,
      subtotalServicos,
      taxaDeslocamento,
      totalFinal: subtotalServicos + taxaDeslocamento
    };
  }, [selectedAppointment, normalizarLocal, normalizarServico]);

  // Formata o endereço vindos do banco de dados (evita JSON cru no front-end)
  const formatarEndereco = (enderecoRaw) => {
    if (!enderecoRaw) return 'Endereço não informado';

    // Se já for um objeto vindo da API
    if (typeof enderecoRaw === 'object') {
      const { logradouro, numero, numeroEnd, bairro, localidade, cidade, uf } = enderecoRaw;
      const rua = logradouro || '';
      const num = numero || numeroEnd || 'S/N';
      const b = bairro ? ` - ${bairro}` : '';
      const cid = localidade || cidade || '';
      const estado = uf ? ` - ${uf}` : '';

      if (!rua && !cid) return 'Endereço customizado';
      return `${rua}, ${num}${b}, ${cid}${estado}`.trim().replace(/^,\s*/, '');
    }

    // Se vier como String, tenta decodificar caso seja um JSON disfarçado
    if (typeof enderecoRaw === 'string') {
      const limpo = enderecoRaw.trim();
      if (limpo.startsWith('{') && limpo.endsWith('}')) {
        try {
          const parsed = JSON.parse(limpo);
          return formatarEndereco(parsed); // Reavalia como objeto
        } catch {
          // Se falhar o parse, deixa seguir para o retorno de string comum
        }
      }
      return enderecoRaw; // Retorna a própria string se for texto puro limpo
    }

    return 'Endereço indisponível';
  };

  const handleSelectAppointment = async (appointment) => {
    const appointmentId = appointment?.idAgendamento || appointment?.id;
    setSelectedAppointment(appointment);

    if (!appointmentId) return;

    setIsLoadingAppointmentDetails(true);
    try {
      const detalhesCompletos = await buscarAgendamentoPorId(appointmentId);
      setSelectedAppointment((prev) => {
        const currentId = prev?.idAgendamento || prev?.id;
        if (String(currentId) !== String(appointmentId)) return prev;
        return detalhesCompletos || prev;
      });
    } catch (error) {
      console.error('❌ Erro ao buscar detalhe do agendamento selecionado:', error);
    } finally {
      setIsLoadingAppointmentDetails(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const Toast = () => {
    if (!toast.show) return null;
    const bgColor = toast.type === 'success' ? 'bg-green-500' : 'bg-red-500';
    return (
      <div className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 ${bgColor} text-white px-6 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-2 animate-fade-in`}>
        {toast.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
        <span className="font-medium">{toast.message}</span>
      </div>
    );
  };

  if (!isLoggedIn && showQuickRegister) {
    return (
      <>
        <div className="min-h-screen bg-gray-50">
          <div className="bg-white px-5 py-4 shadow-sm">
            <button onClick={() => setShowQuickRegister(false)} className="flex items-center gap-2 text-primary hover:text-accent transition-colors">
              <ArrowLeft size={20} />
              <span>Voltar</span>
            </button>
          </div>
          <div className="px-5 pt-12">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="text-accent" size={32} />
                </div>
                <h2 className="text-primary text-2xl mb-2">Cadastro Rápido</h2>
                <p className="text-gray-600 text-sm">Crie sua conta no sistema para começar</p>
              </div>
              <form onSubmit={handleQuickRegister} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Nome Completo *</label>
                  <input
                    type="text"
                    value={registerData.name}
                    onChange={(e) => handleRegisterChange('name', e.target.value)}
                    placeholder="Seu nome completo"
                    className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">E-mail *</label>
                  <input
                    type="email"
                    value={registerData.email}
                    onChange={(e) => handleRegisterChange('email', e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">WhatsApp *</label>
                  <input
                    type="tel"
                    value={registerData.phone}
                    onChange={(e) => handleRegisterChange('phone', e.target.value)}
                    placeholder="(11) 98765-4321"
                    className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <button type="submit" className="w-full bg-accent text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-all font-medium">
                  Criar Conta
                </button>
              </form>
            </div>
          </div>
        </div>
        <Toast />
      </>
    );
  }

  if (isLoggedIn && showAnamesis) {
    return (
      <>
        <div className="min-h-screen bg-gray-50">
          <div className="bg-white px-5 py-4 shadow-sm">
            <button onClick={() => setShowAnamesis(false)} className="flex items-center gap-2 text-primary hover:text-accent transition-colors">
              <ArrowLeft size={20} />
              <span>Voltar para o Portal</span>
            </button>
          </div>
          <div className="px-5 pt-6 pb-24">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-primary text-2xl mb-2">Meus Dados & Ficha</h2>
                <p className="text-gray-600 text-sm">Gerencie suas informações cadastrais e ficha clínica abaixo</p>
              </div>

              <form onSubmit={handleAnamesisSave} className="space-y-6">
                {/* Dados Cadastrais */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 space-y-4 shadow-sm">
                  <h3 className="text-sm font-bold text-primary flex items-center gap-1.5 border-b pb-2">
                    <User size={16} /> Dados Cadastrais
                  </h3>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Nome Completo</label>
                    <input
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="w-full p-2.5 text-sm bg-white rounded-xl border border-gray-200 focus:outline-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">E-mail</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-2.5 text-sm bg-white rounded-xl border border-gray-200 focus:outline-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">WhatsApp / Telefone</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full p-2.5 text-sm bg-white rounded-xl border border-gray-200 focus:outline-primary"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Gênero</label>
                      <select value={genero} onChange={(e) => setGenero(e.target.value)} className="w-full p-2.5 text-sm bg-white rounded-xl border border-gray-200 focus:outline-primary">
                        <option value="">Selecione</option>
                        <option value="Feminino">Feminino</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Outro">Outro</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Data de Nascimento</label>
                      <input type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} className="w-full p-2.5 text-sm bg-white rounded-xl border border-gray-200 focus:outline-primary" />
                    </div>
                  </div>
                </div>

                {/* Ficha de Saúde */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 space-y-4 shadow-sm">
                  <h3 className="text-sm font-bold text-primary flex items-center gap-1.5 border-b pb-2">
                    <HeartPulse size={16} /> Questionário de Saúde
                  </h3>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1 block">Alergias Conhecidas</label>
                    <textarea
                      value={allergies}
                      onChange={(e) => setAllergies(e.target.value)}
                      placeholder="Ex: Esmaltes, formaldeído, látex..."
                      className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-gray-200 focus:outline-primary resize-none"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1 block">Condições de Saúde</label>
                    <textarea
                      value={condicoesSaude}
                      onChange={(e) => setCondicoesSaude(e.target.value)}
                      placeholder="Ex: Diabetes, Gestante, Hipertensão..."
                      className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-gray-200 focus:outline-primary resize-none"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-3 pt-1">
                    <div className="flex justify-between items-center gap-2">
                      <label className="text-xs text-gray-600">Possui unhas encravadas recorrentes?</label>
                      <select value={ingrowingNails} onChange={(e) => setIngrowingNails(e.target.value)} className="p-1.5 text-xs bg-white rounded-lg border border-gray-200 focus:outline-primary w-24">
                        <option value="no">Não</option>
                        <option value="yes">Sim</option>
                      </select>
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <label className="text-xs text-gray-600">Sensibilidade excessiva?</label>
                      <select value={sensitivity} onChange={(e) => setSensitivity(e.target.value)} className="p-1.5 text-xs bg-white rounded-lg border border-gray-200 focus:outline-primary w-24">
                        <option value="no">Não</option>
                        <option value="yes">Sim</option>
                      </select>
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <label className="text-xs text-gray-600">Micose ou fungos ativos?</label>
                      <select value={fungus} onChange={(e) => setFungus(e.target.value)} className="p-1.5 text-xs bg-white rounded-lg border border-gray-200 focus:outline-primary w-24">
                        <option value="no">Não</option>
                        <option value="yes">Sim</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Endereço Residencial */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 space-y-4 shadow-sm">
                  <h3 className="text-sm font-bold text-primary flex items-center gap-1.5 border-b pb-2">
                    <Home size={16} /> Endereço Residencial
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1">
                      <label className="text-xs text-gray-500 mb-1 block">CEP</label>
                      <input
                        type="text"
                        value={cep}
                        onChange={(e) => setCep(e.target.value)}
                        onBlur={handleCepBlur}
                        placeholder="00000-000"
                        className="w-full p-2.5 text-sm bg-white rounded-xl border border-gray-200 focus:outline-primary"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-gray-500 mb-1 block">Logradouro</label>
                      <input type="text" value={logradouro} onChange={(e) => setLogradouro(e.target.value)} placeholder="Rua / Avenida" disabled={isLoadingCep} className="w-full p-2.5 text-sm bg-white rounded-xl border border-gray-200 focus:outline-primary disabled:bg-gray-50" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1">
                      <label className="text-xs text-gray-500 mb-1 block">Número</label>
                      <input type="text" value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="Nº" className="w-full p-2.5 text-sm bg-white rounded-xl border border-gray-200 focus:outline-primary" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-gray-500 mb-1 block">Bairro</label>
                      <input type="text" value={bairro} onChange={(e) => setBairro(e.target.value)} placeholder="Bairro" disabled={isLoadingCep} className="w-full p-2.5 text-sm bg-white rounded-xl border border-gray-200 focus:outline-primary disabled:bg-gray-50" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Cidade / Localidade</label>
                    <input type="text" value={localidade} onChange={(e) => setLocalidade(e.target.value)} placeholder="Cidade" disabled={isLoadingCep} className="w-full p-2.5 text-sm bg-white rounded-xl border border-gray-200 focus:outline-primary disabled:bg-gray-50" />
                  </div>
                </div>

                <button type="submit" disabled={isSubmittingAnamnesis} className="w-full bg-accent text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-all font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                  {isSubmittingAnamnesis && <Loader size={18} className="animate-spin" />}
                  <span>{isSubmittingAnamnesis ? 'Salvando dados...' : 'Confirmar e Salvar Perfil'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
        <Toast />
      </>
    );
  }

  if (!isLoggedIn) {
    return (
      <>
        <div className="min-h-screen bg-gray-50">
          <div className="bg-white px-5 py-4 shadow-sm">
            <button onClick={onBack} className="flex items-center gap-2 text-primary hover:text-accent transition-colors">
              <ArrowLeft size={20} />
              <span>Voltar</span>
            </button>
          </div>
          <div className="px-5 pt-12">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-primary text-2xl mb-2">Área do Cliente</h2>
                <p className="text-gray-600 text-sm">Insira seus dados para acessar</p>
              </div>
              {loginError && <div className="mb-4 p-4 bg-red-50 text-red-700 border border-red-200 text-sm rounded-xl">{loginError}</div>}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">WhatsApp ou E-mail</label>
                  <input
                    type="text"
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val.includes('@')) { setEmail(val); setPhone(''); }
                      else { setPhone(val); setEmail(''); }
                    }}
                    placeholder="Seu e-mail ou WhatsApp cadastrado"
                    className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <button type="submit" className="w-full bg-accent text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold">
                  Acessar Portal
                </button>
              </form>
              <div className="mt-8 p-4 bg-purple-50 rounded-xl text-center">
                <p className="text-gray-600 text-sm mb-4"><strong>Primeira vez por aqui?</strong> Faça o cadastro rápido.</p>
                <button onClick={() => setShowQuickRegister(true)} className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
                  Realizar Cadastro Rápido
                </button>
              </div>
            </div>
          </div>
        </div>
        <Toast />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white px-5 py-4 shadow-sm flex justify-between items-center">
          <button onClick={onBack} className="flex items-center gap-2 text-primary hover:text-accent transition-colors">
            <ArrowLeft size={20} />
            <span>Voltar</span>
          </button>
          <div className="flex gap-2">
            <button onClick={() => setShowAnamesis(true)} className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-semibold hover:bg-primary/20">
              Editar Meu Perfil / Ficha
            </button>
            <button onClick={() => { setIsLoggedIn(false); setCurrentClient(null); setAppointments([]); }} className="text-gray-500 text-sm hover:text-primary transition-colors px-2">
              Sair
            </button>
          </div>
        </div>

        <div className="px-5 pt-6 pb-2">
          <h2 className="text-primary mb-1 text-xl font-bold">Olá, {currentClient?.nome || 'Cliente'}!</h2>
          <p className="text-gray-500 text-sm">{currentClient?.email || currentClient?.whatsapp}</p>
        </div>

        {/* Filtro de Data */}
        <div className="px-5 my-4">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-gray-700 text-sm font-medium">
              <Filter size={16} className="text-primary" />
              <span>Filtrar agendamentos por data:</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="px-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-primary text-gray-700"
              />
              {filterDate && (
                <button
                  onClick={() => setFilterDate('')}
                  className="text-xs text-red-500 hover:underline font-medium"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Listagem de Agendamentos */}
        <div className="px-5 pb-8">
          <h3 className="text-gray-800 font-semibold mb-4">Meus Agendamentos</h3>

          {isLoadingAppointments ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-gray-500">
              <Loader size={24} className="animate-spin text-primary" />
              <p className="text-sm">Buscando seus agendamentos no sistema...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-gray-500 text-sm">
              📭 Nenhum agendamento encontrado para os critérios selecionados.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAppointments.map((appointment) => {
                let totalServicos = 0;
                if (appointment.servicos && appointment.servicos.length > 0) {
                  totalServicos = appointment.servicos.reduce((acc, servico) => {
                    return acc + (servico.precoBase || servico.preco || servico.valor || 0);
                  }, 0);
                } else {
                  totalServicos = (
                    appointment.precoBase ||
                    appointment.valor ||
                    appointment.preco ||
                    appointment.servico?.precoBase ||
                    appointment.servico?.preco ||
                    appointment.servico?.valor ||
                    0
                  );
                }

                const taxaDeslocamento = appointment.taxaDeslocamento || 0;
                const totalFinal = totalServicos + taxaDeslocamento;

                return (
                  <div
                    key={appointment.idAgendamento}
                    onClick={() => handleSelectAppointment(appointment)}
                    className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="p-2 bg-purple-50 text-primary rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                          <Calendar size={18} />
                        </span>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{formatDate(appointment.dataHoraInicio)}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1"><Clock size={12} /> {formatTime(appointment.dataHoraInicio)}</p>
                        </div>
                      </div>

                      <div className="pt-1">
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Serviços Solicitados</p>
                        <p className="text-sm font-semibold text-primary mt-0.5">
                          {appointment.servicos && appointment.servicos.length > 0
                            ? appointment.servicos.map(s => s.nomeServico || s.nome).join(', ')
                            : (appointment.servico?.nomeServico || appointment.servico?.nome || 'Serviço Personalizado')
                          }
                        </p>
                      </div>
                    </div>

                    <div className="flex md:flex-col items-start md:items-end justify-between md:justify-center border-t md:border-t-0 pt-3 md:pt-0 border-gray-100 gap-2">
                      {getStatusBadge(appointment.status || appointment.situacao)}
                      <p className="text-accent font-bold text-sm md:text-base">R$ {totalFinal.toFixed(2)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 🌟 MODAL DE DETALHES COMPLETOS DO AGENDAMENTO COM MAPS E VALORES */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] md:max-h-[90vh] overflow-y-auto shadow-2xl relative animate-slideUp flex flex-col">

            {/* Botão de Fechar Absoluto */}
            <button
              onClick={() => setSelectedAppointment(null)}
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full z-30 transition-colors shadow-md"
            >
              <X size={18} />
            </button>

            {/* Imagem do Local / Studio no Topo */}
            <div className="w-full h-44 relative shrink-0 bg-gray-200">
              <img
                src={appointmentDetails?.localDetalhado?.imagemUrl || dadosDoLocal.imagemUrl}
                alt={appointmentDetails?.localDetalhado?.nome || 'Fachada ou Interior do Studio'}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/30 to-transparent flex items-end p-5">
                <div className="w-full">
                  <div className="flex justify-between items-end">
                    <div>
                      <h3 className="text-white text-xl font-bold tracking-tight">{appointmentDetails?.localDetalhado?.nome || dadosDoLocal.nome}</h3>
                      <p className="text-purple-200 text-xs mt-0.5 flex items-center gap-1">
                        <MapPin size={12} /> Studio Presencial
                      </p>
                    </div>
                    <div>
                      {getStatusBadge(appointmentDetails?.status || appointmentDetails?.situacao)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Conteúdo Rolável da Ficha do Agendamento */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">

              {/* Bloco 1: Cronograma */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3.5 rounded-xl border border-gray-100 shadow-inner">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Data do Serviço</p>
                    <p className="text-sm font-bold text-gray-800">{formatDate(appointmentDetails?.dataHoraInicio)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Horário Marcado</p>
                    <p className="text-sm font-bold text-gray-800">{formatTime(appointmentDetails?.dataHoraInicio)}</p>
                  </div>
                </div>
              </div>

              {isLoadingAppointmentDetails && (
                <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
                  <Loader size={14} className="animate-spin text-primary" />
                  Carregando detalhes completos do agendamento...
                </div>
              )}

              {/* Bloco 2: Serviços Solicitados com Imagens Individuais */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Serviço(s) Contratado(s)</h4>
                <div className="space-y-3">
                  {appointmentDetails?.servicos && appointmentDetails.servicos.length > 0 ? (
                    appointmentDetails.servicos.map((servico, index) => (
                      <div key={index} className="flex gap-4 bg-white p-3 rounded-xl border border-gray-100 shadow-sm items-center hover:border-gray-200 transition-all">
                        <div className="w-16 h-16 bg-purple-50 shrink-0 rounded-xl overflow-hidden flex items-center justify-center border border-gray-100/80">
                          {servico.fotoUrl || servico.imagemUrl || servico.imagem || servico.urlImagem ? (
                            <img
                              src={servico.fotoUrl || servico.imagemUrl || servico.imagem || servico.urlImagem}
                              alt={servico.nomeServico || servico.nome}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-primary font-bold text-xl uppercase">
                              {(servico.nomeServico || servico.nome || 'S').charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-800 truncate">{servico.nomeServico || servico.nome}</p>
                          <p className="text-xs text-gray-500 line-clamp-2 mt-0.5 leading-relaxed">
                            {servico.descricao || 'Tratamento estético personalizado de alto padrão.'}
                          </p>
                          <div className="flex items-center gap-1 text-accent font-bold text-sm mt-1">
                            <DollarSign size={14} className="shrink-0" />
                            <span>{toNumber(servico.precoBase, servico.preco, servico.valor).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    /* Fallback Adaptativo para estrutura com objeto único de serviço */
                    <div className="flex gap-4 bg-white p-3 rounded-xl border border-gray-100 shadow-sm items-center">
                      <div className="w-16 h-16 bg-purple-50 shrink-0 rounded-xl overflow-hidden flex items-center justify-center border border-gray-100">
                        {appointmentDetails?.servico?.fotoUrl || appointmentDetails?.servico?.imagemUrl || appointmentDetails?.servico?.imagem ? (
                          <img
                            src={appointmentDetails?.servico.fotoUrl || appointmentDetails?.servico.imagemUrl || appointmentDetails?.servico.imagem}
                            alt="Serviço solicitado"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-primary font-bold text-xl">S</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-800 truncate">
                          {appointmentDetails?.servico?.nomeServico || appointmentDetails?.servico?.nome || 'Serviço Personalizado'}
                        </p>
                        <p className="text-xs text-gray-500 line-clamp-2 mt-0.5 leading-relaxed">
                          {appointmentDetails?.servico?.descricao || 'Atendimento estético exclusivo planejado para as necessidades da cliente.'}
                        </p>
                        <div className="flex items-center gap-1 text-accent font-bold text-sm mt-1">
                          <DollarSign size={14} className="shrink-0" />
                          <span>{toNumber(appointmentDetails?.precoBase, appointmentDetails?.valor, appointmentDetails?.servico?.precoBase, appointmentDetails?.servico?.valor).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bloco 3: Endereço Detalhado & Link Direto para o Maps */}
              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Localização do Atendimento
                </h4>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
                  <div className="flex items-start gap-2.5 text-sm text-gray-700">
                    <MapPin size={18} className="text-accent shrink-0 mt-0.5" />
                    <span className="leading-relaxed font-semibold text-gray-800">
                      {/* Usando o helper para garantir que NUNCA apareça um JSON stringificado */}
                      {formatarEndereco(
                        appointmentDetails?.localAtendimento ||
                        appointmentDetails?.local ||
                        dadosDoLocal.endereco
                      )}
                    </span>
                  </div>

                  {dadosDoLocal.telefone && (
                    <div className="flex items-center gap-2.5 text-sm text-gray-600 border-t border-gray-200/60 pt-2.5">
                      <Phone size={16} className="text-primary shrink-0" />
                      <span className="font-medium">{dadosDoLocal.telefone}</span>
                    </div>
                  )}

                  {/* Botão de Redirecionamento de Rota */}
                  {appointmentDetails?.linkMaps || dadosDoLocal.linkMaps ? (
                    <div className="pt-1">
                      <a
                        href={appointmentDetails?.linkMaps || dadosDoLocal.linkMaps}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/95 transition-all shadow-md active:scale-[0.99]"
                      >
                        <ExternalLink size={14} />
                        Abrir Rota de Navegação no Google Maps
                      </a>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Bloco 4: Demonstrativo de Valores */}
              <div className="border-t border-purple-100/60 pt-4 bg-purple-50/40 border p-4 rounded-xl">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Extrato Financeiro</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Subtotal dos procedimentos:</span>
                    <span className="font-medium">R$ {toNumber(appointmentDetails?.subtotalServicos).toFixed(2)}</span>
                  </div>

                  {toNumber(appointmentDetails?.taxaDeslocamento) > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Taxa de Deslocamento / Home Care:</span>
                      <span className="font-medium">R$ {toNumber(appointmentDetails?.taxaDeslocamento).toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between font-extrabold text-base text-primary pt-2.5 border-t border-dashed border-purple-200">
                    <span className="flex items-center gap-1">Total Confirmado:</span>
                    <span className="text-accent text-lg">
                      R$ {toNumber(appointmentDetails?.totalFinal).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Rodapé Fixo */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedAppointment(null)}
                className="px-5 py-2.5 bg-gray-200 text-gray-700 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-gray-300 transition-colors"
              >
                Fechar Visualização
              </button>
            </div>

          </div>
        </div>
      )}

      <Toast />
    </>
  );
}