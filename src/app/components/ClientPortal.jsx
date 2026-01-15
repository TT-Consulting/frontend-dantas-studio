import { useState } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, MapPin, Phone, ArrowLeft } from 'lucide-react';

export function ClientPortal({ onBack }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const mockAppointments = [
    {
      id: '1',
      service: 'Gel Nails',
      date: '2025-12-19',
      time: '10:00',
      status: 'confirmed',
      price: 'R$ 120',
      professional: 'Annika',
    },
    {
      id: '2',
      service: 'Manicure',
      date: '2025-12-15',
      time: '14:00',
      status: 'completed',
      price: 'R$ 50',
      professional: 'Annika',
    },
    {
      id: '3',
      service: 'Spa Manicure',
      date: '2025-12-22',
      time: '16:00',
      status: 'pending',
      price: 'R$ 85',
      professional: 'Annika',
    },
  ];

  const handleLogin = (e) => {
    e.preventDefault();
    if (email && phone) {
      setIsLoggedIn(true);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs flex items-center gap-1">
            <CheckCircle size={12} />
            Confirmado
          </span>
        );
      case 'pending':
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs flex items-center gap-1">
            <AlertCircle size={12} />
            Pendente
          </span>
        );
      case 'completed':
        return (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs flex items-center gap-1">
            <CheckCircle size={12} />
            Realizado
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs flex items-center gap-1">
            <XCircle size={12} />
            Cancelado
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-white px-5 py-4 shadow-sm">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-primary hover:text-accent transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Voltar</span>
          </button>
        </div>

        {/* Login Form */}
        <div className="px-5 pt-12">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-primary text-2xl mb-2">Área do Cliente</h2>
              <p className="text-gray-600 text-sm">
                Entre com seus dados para acompanhar seus agendamentos
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 mb-2 block">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-2 block">WhatsApp</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 98765-4321"
                  className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-accent text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Acessar Meus Agendamentos
              </button>
            </form>

            <div className="mt-8 p-4 bg-purple-50 rounded-xl">
              <p className="text-gray-600 text-sm text-center">
                <strong>Primeira vez?</strong> Após fazer seu primeiro agendamento, você receberá 
                suas credenciais de acesso via WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white px-5 py-4 shadow-sm">
        <div className="flex justify-between items-center">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-primary hover:text-accent transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Voltar</span>
          </button>
          <button
            onClick={() => setIsLoggedIn(false)}
            className="text-gray-500 text-sm hover:text-primary transition-colors"
          >
            Sair
          </button>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="px-5 pt-6 pb-4">
        <h2 className="text-primary mb-1">Bem-vinda de volta!</h2>
        <p className="text-gray-600 text-sm">{email}</p>
      </div>

      {/* Quick Stats */}
      <div className="px-5 pb-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-4 shadow-md text-center">
            <p className="text-2xl text-accent mb-1">1</p>
            <p className="text-gray-600 text-xs">Próximo</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md text-center">
            <p className="text-2xl text-green-600 mb-1">1</p>
            <p className="text-gray-600 text-xs">Confirmado</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md text-center">
            <p className="text-2xl text-primary mb-1">3</p>
            <p className="text-gray-600 text-xs">Total</p>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="px-5 pb-8">
        <h3 className="text-gray-800 mb-4">Meus Agendamentos</h3>
        <div className="space-y-3">
          {mockAppointments.map((appointment) => (
            <div key={appointment.id} className="bg-white rounded-xl p-5 shadow-md">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-primary mb-1">{appointment.service}</h4>
                  <p className="text-gray-600 text-sm">com {appointment.professional}</p>
                </div>
                {getStatusBadge(appointment.status)}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Calendar size={16} className="text-primary" />
                  <span>{formatDate(appointment.date)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Clock size={16} className="text-primary" />
                  <span>{appointment.time}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <span className="text-accent font-medium">{appointment.price}</span>
                </div>
              </div>

              {appointment.status === 'confirmed' && (
                <div className="flex gap-2">
                  <button className="flex-1 bg-primary/10 text-primary py-2 rounded-lg hover:bg-primary/20 transition-colors text-sm">
                    Remarcar
                  </button>
                  <button className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition-colors text-sm">
                    Cancelar
                  </button>
                </div>
              )}

              {appointment.status === 'pending' && (
                <div className="bg-yellow-50 rounded-lg p-3">
                  <p className="text-yellow-700 text-xs">
                    ⏳ Aguardando confirmação da profissional
                  </p>
                </div>
              )}

              {appointment.status === 'completed' && (
                <button className="w-full bg-purple-50 text-primary py-2 rounded-lg hover:bg-purple-100 transition-colors text-sm">
                  ⭐ Avaliar Serviço
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Studio Info */}
      <div className="px-5 pb-8">
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 shadow-md">
          <h4 className="text-primary mb-3">Studio Annika</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-accent" />
              <span>Rua das Flores, 123 - Jardins</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={16} className="text-accent" />
              <span>+55 11 98765-4321</span>
            </div>
          </div>
          <button className="w-full bg-accent text-white py-3 rounded-lg hover:shadow-lg transition-shadow mt-4">
            Fazer Novo Agendamento
          </button>
        </div>
      </div>
    </div>
  );
}
