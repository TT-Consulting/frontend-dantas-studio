import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, MapPin, Phone, ArrowLeft, UserPlus, Loader } from 'lucide-react';
import { salvarCliente, listarClientes, atualizarCliente, apiClient } from '../../api';

export function ClientPortal({ onBack, initialClientData }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showQuickRegister, setShowQuickRegister] = useState(false);
  const [showAnamesis, setShowAnamesis] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loginError, setLoginError] = useState(null);

  // Cliente retornado do banco
  const [currentClient, setCurrentClient] = useState(null);

  // ESTADO PARA AGENDAMENTOS REAIS DO BANCO
  const [appointments, setAppointments] = useState([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);

  // Estados para cadastro rápido
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // Estados para anamnese
  const [allergies, setAllergies] = useState('');
  const [ingrowingNails, setIngrowingNails] = useState('');
  const [sensitivity, setSensitivity] = useState('');
  const [fungus, setFungus] = useState('');
  const [isSubmittingAnamnesis, setIsSubmittingAnamnesis] = useState(false);

  // Efeito para buscar os agendamentos reais do cliente logado
  useEffect(() => {
    const carregarAgendamentosReais = async () => {
      if (!currentClient) return;

      setIsLoadingAppointments(true);
      try {
        // Traz todos os agendamentos cadastrados no sistema
        const res = await apiClient.get('/agendamentos');
        const todosAgendamentos = res.data || [];

        // Filtra para exibir apenas os agendamentos deste cliente específico
        const agendamentosDoCliente = todosAgendamentos.filter(
          agendamento => agendamento.idCliente === currentClient.idCliente
        );

        // Ordena por data/hora mais recente primeiro
        agendamentosDoCliente.sort((a, b) => new Date(b.dataHoraInicio) - new Date(a.dataHoraInicio));

        setAppointments(agendamentosDoCliente);
      } catch (err) {
        console.error("❌ Erro ao carregar agendamentos do cliente:", err);
      } finally {
        setIsLoadingAppointments(false);
      }
    };

    carregarAgendamentosReais();
  }, [currentClient]);

  // Efeito para logar automaticamente se os dados vierem do BookingScreen
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
            setCurrentClient(clientes[0]);
            setEmail(clientes[0].email || '');
            setPhone(clientes[0].whatsapp || '');
            setIsLoggedIn(true);
          }
        } catch (err) {
          console.error("Erro no login automático:", err);
        }
      };
      loginAutomatico();
    }
  }, [initialClientData]);

  // LOGIN INTEGRADO
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
        const clienteEncontrado = clientes[0];
        setCurrentClient(clienteEncontrado);
        setEmail(clienteEncontrado.email || '');
        setPhone(clienteEncontrado.whatsapp || '');
        setIsLoggedIn(true);
      } else {
        setLoginError('⚠️ Cliente não encontrado. Verifique os dados ou realize o Cadastro Rápido.');
      }
    } catch (err) {
      console.error(err);
      setLoginError('❌ Erro ao conectar ao servidor. Tente novamente mais tarde.');
    }
  };

  // CADASTRO RÁPIDO INTEGRADO
  const handleQuickRegister = async (e) => {
    e.preventDefault();
    if (registerData.name && registerData.phone) {
      try {
        const payloadCliente = {
          idCliente: null,
          nome: registerData.name,
          email: registerData.email || null,
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
        setEmail(novoCliente.email || '');
        setPhone(novoCliente.whatsapp || '');

        setShowQuickRegister(false);
        setShowAnamesis(true);
      } catch (err) {
        alert('❌ Erro ao realizar cadastro. Verifique se o WhatsApp já não está cadastrado.');
      }
    }
  };

  // SALVAR ANAMNESE INTEGRADO
  const handleAnamesisSave = async (e) => {
    e.preventDefault();
    if (!currentClient) return;

    setIsSubmittingAnamnesis(true);
    try {
      const payloadAtualizado = {
        ...currentClient,
        email: email || currentClient.email,
        whatsapp: phone.replace(/\D/g, '') || currentClient.whatsapp,
        alergias: allergies || null,
        possuiUnhasEncravadas: ingrowingNails === 'yes' || ingrowingNails === 'sometimes',
        sensibilidadeExcessiva: sensitivity === 'yes' || sensitivity === 'mild',
        possuiMicoseFungos: fungus === 'yes',
        isAtivo: true
      };

      await atualizarCliente(currentClient.idCliente, payloadAtualizado);

      alert('🎉 Ficha de saúde preenchida com sucesso!');
      setShowAnamesis(false);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Erro ao salvar anamnese:', error);
      alert('Erro ao salvar ficha de saúde. Verifique o console.');
    } finally {
      setIsSubmittingAnamnesis(false);
    }
  };

  const handleRegisterChange = (field, value) => {
    setRegisterData(prev => ({ ...prev, [field]: value }));
  };

  // Mapeia o status do Kotlin para a interface visual
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

  // --- RENDERS DE CADASTRO E ANAMNESE PERMANECEM IDENTICOS ---
  if (!isLoggedIn && showQuickRegister) {
    return (
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
                <label className="text-sm text-gray-600 mb-2 block">E-mail (Opcional)</label>
                <input
                  type="email"
                  value={registerData.email}
                  onChange={(e) => handleRegisterChange('email', e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
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
    );
  }

  if (!isLoggedIn && showAnamesis) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white px-5 py-4 shadow-sm">
          <button onClick={() => { setShowAnamesis(false); setShowQuickRegister(true); }} className="flex items-center gap-2 text-primary hover:text-accent transition-colors">
            <ArrowLeft size={20} />
            <span>Voltar</span>
          </button>
        </div>
        <div className="px-5 pt-6 pb-24">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-primary text-2xl mb-2">Ficha de Saúde</h2>
              <p className="text-gray-600 text-sm">Informações de anamnese cruciais para o atendimento</p>
            </div>
            <form onSubmit={handleAnamesisSave} className="space-y-6">
              <div>
                <label className="text-sm text-gray-600 mb-2 block font-semibold">Alergias Conhecidas</label>
                <textarea
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="Ex: Tolueno, formaldeído, látex, acrílico..."
                  className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows={2}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-2 block font-semibold">Possui unhas encravadas recorrentes?</label>
                <select value={ingrowingNails} onChange={(e) => setIngrowingNails(e.target.value)} className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">Selecione</option>
                  <option value="yes">Sim</option>
                  <option value="no">Não</option>
                  <option value="sometimes">Às vezes</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-2 block font-semibold">Sensibilidade excessiva nas mãos ou pés?</label>
                <select value={sensitivity} onChange={(e) => setSensitivity(e.target.value)} className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">Selecione</option>
                  <option value="yes">Sim</option>
                  <option value="no">Não</option>
                  <option value="mild">Leve</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-2 block font-semibold">Micose ou fungos ativos?</label>
                <select value={fungus} onChange={(e) => setFungus(e.target.value)} className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">Selecione</option>
                  <option value="yes">Sim</option>
                  <option value="no">Não</option>
                </select>
              </div>
              <button type="submit" disabled={isSubmittingAnamnesis} className="w-full bg-accent text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-all font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                {isSubmittingAnamnesis && <Loader size={18} className="animate-spin" />}
                <span>{isSubmittingAnamnesis ? 'Salvando ficha...' : 'Finalizar e Ver Perfil'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
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
              <p className="text-gray-600 text-sm">Insira seus dados para rastrear e gerenciar agendamentos</p>
            </div>
            {loginError && <div className="mb-4 p-4 bg-red-50 text-red-700 border border-red-200 text-sm rounded-xl">{loginError}</div>}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 mb-2 block">WhatsApp ou E-mail</label>
                <input
                  type="text"
                  value={email || phone}
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
                Acessar Meus Agendamentos
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
    );
  }

  // --- TELA LOGADA: EXIBIÇÃO DE DADOS REAIS DO BACKEND ---
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white px-5 py-4 shadow-sm flex justify-between items-center">
        <button onClick={onBack} className="flex items-center gap-2 text-primary hover:text-accent transition-colors">
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>
        <button onClick={() => { setIsLoggedIn(false); setCurrentClient(null); setAppointments([]); }} className="text-gray-500 text-sm hover:text-primary transition-colors">
          Sair
        </button>
      </div>

      <div className="px-5 pt-6 pb-4">
        <h2 className="text-primary mb-1 text-xl font-bold">Olá, {currentClient?.nome || 'Cliente'}!</h2>
        <p className="text-gray-500 text-sm">{currentClient?.email || currentClient?.whatsapp}</p>
      </div>

      <div className="px-5 pb-8">
        <h3 className="text-gray-800 font-semibold mb-4">Meus Agendamentos</h3>

        {isLoadingAppointments ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-gray-500">
            <Loader size={24} className="animate-spin text-primary" />
            <p className="text-sm">Buscando seus agendamentos no sistema...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-gray-500 text-sm">
            📭 Você ainda não possui nenhum agendamento cadastrado.
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((appointment) => (
              <div key={appointment.idAgendamento} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    {/* Lendo direto da propriedade flat do DTO */}
                    <h4 className="text-primary font-bold mb-1">
                      {appointment.nomeServico || 'Serviço Personalizado'}
                    </h4>
                    <p className="text-gray-500 text-xs">
                      Local: {appointment.tipoLocal === 'DOMICILIO' ? '🏠 Atendimento em Domicílio' : '🏢 No Studio'}
                    </p>
                  </div>
                  {getStatusBadge(appointment.statusAgendamento || appointment.status)}
                </div>

                <div className="space-y-2 text-gray-600 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-primary" />
                    <span>{formatDate(appointment.dataHoraInicio)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-primary" />
                    <span>{formatTime(appointment.dataHoraInicio)}</span>
                  </div>
                  <div className="text-accent font-semibold">
                    R$ {(appointment.valorTotal || appointment.precoBase || 0).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}