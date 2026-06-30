import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, MapPin, Phone, ArrowLeft, UserPlus, Loader, HeartPulse, Home, Filter, User } from 'lucide-react';
import { salvarCliente, listarClientes, atualizarCliente, apiClient, buscarAgendamentosPorCliente } from '../../api';

export function ClientPortal({ onBack, initialClientData }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showQuickRegister, setShowQuickRegister] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' }); // success, error

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

  // Busca de CEP - Alterado para http:// para mitigar ERR_CERT_AUTHORITY_INVALID local
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
        // ✅ Chamada limpa batendo direto no ID do cliente logado
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
      } catch (err) {
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
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs flex items-center gap-1"><CheckCircle size={12} />Confirmado</span>;
      case 'PENDENTE':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs flex items-center gap-1"><AlertCircle size={12} />Pendente</span>;
      case 'REALIZADO':
        return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs flex items-center gap-1"><CheckCircle size={12} />Realizado</span>;
      case 'CANCELADO':
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs flex items-center gap-1"><XCircle size={12} />Cancelado</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs flex items-center gap-1">{status}</span>;
    }
  };

  const formatDate = (dateIsoStr) => {
    if (!dateIsoStr) return '';
    const date = new Date(dateIsoStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const formatTime = (dateIsoStr) => {
    if (!dateIsoStr) return '';
    const date = new Date(dateIsoStr);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  // Função para exibir toast
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  // Componente Toast
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

  // 1️⃣ FLUXO: CADASTRO RÁPIDO
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

  // 2️⃣ FLUXO: FORMULÁRIO DE FORMATAÇÃO / ANAMNESE E EDIÇÃO COMPLETA
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

  // 3️⃣ FLUXO: TELA DE LOGIN
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

  // 4️⃣ FLUXO FINAL: PORTAL DO CLIENTE (DASHBOARD)
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
              // Calcula o valor total dos serviços
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

              // Adiciona taxa de deslocamento
              const taxaDeslocamento = appointment.taxaDeslocamento || 0;
              const totalFinal = totalServicos + taxaDeslocamento;

              return (
                <div key={appointment.idAgendamento} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      {/* Verifica se há múltiplos serviços */}
                      {appointment.servicos && appointment.servicos.length > 1 ? (
                        <h4 className="text-primary font-bold mb-1">
                          {appointment.servicos.length} Serviços Selecionados
                        </h4>
                      ) : (
                        <h4 className="text-primary font-bold mb-1">
                          {appointment.nomeServico || appointment.servico?.nomeServico || appointment.servico?.nome || 'Serviço Personalizado'}
                        </h4>
                      )}
                      <p className="text-gray-500 text-xs">
                        Local: {appointment.tipoLocal === 'DOMICILIO' ? '🏠 Atendimento em Domicílio' : '🏢 No Studio'}
                      </p>
                    </div>
                    {getStatusBadge(appointment.statusAgendamento || appointment.status)}
                  </div>

                  <div className="space-y-3 text-gray-600 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-primary" />
                      <span>{formatDate(appointment.dataHoraInicio)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-primary" />
                      <span>{formatTime(appointment.dataHoraInicio)}</span>
                    </div>

                    {/* Lista de serviços selecionados */}
                    <div className="border-t pt-3 mt-2">
                      <p className="text-xs font-semibold text-gray-500 mb-2">Serviço(s):</p>
                      {appointment.servicos && appointment.servicos.length > 0 ? (
                        <div className="space-y-1">
                          {appointment.servicos.map((servico, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs p-1.5 bg-gray-50 rounded-lg">
                              <span>{servico.nomeServico || servico.nome}</span>
                              <span className="text-accent font-bold">
                                R$ {(servico.precoBase || servico.preco || servico.valor || 0).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex justify-between items-center text-xs p-1.5 bg-gray-50 rounded-lg">
                          <span>{appointment.nomeServico || appointment.servico?.nomeServico || appointment.servico?.nome || 'Serviço Personalizado'}</span>
                          <span className="text-accent font-bold">
                            R$ {(
                              appointment.precoBase ||
                              appointment.valor ||
                              appointment.preco ||
                              appointment.servico?.precoBase ||
                              appointment.servico?.preco ||
                              appointment.servico?.valor ||
                              0
                            ).toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Valor total */}
                    <div className="text-accent font-bold text-lg pt-2 border-t">
                      Total: R$ {totalFinal.toFixed(2)}
                      {/* Adiciona taxa de deslocamento se houver */}
                      {taxaDeslocamento > 0 && (
                        <span className="text-xs text-gray-500 block">
                          (inclui taxa de deslocamento de R$ {taxaDeslocamento.toFixed(2)})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
    <Toast />
    </>
  );
}