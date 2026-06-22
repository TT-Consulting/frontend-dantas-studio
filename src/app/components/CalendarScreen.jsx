import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Calendar, Clock, RefreshCw } from 'lucide-react';
// CORREÇÃO: Importando a função nomeada individual que criamos no arquivo de rotas
import { listarAgendamentos } from '../../api/bookings'; 

export function CalendarScreen() {
  // Inicializando em Dezembro de 2025 para bater com os dados de exemplo/testes
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 11)); 
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 11, 19));
  const [viewMode, setViewMode] = useState('month');
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [blockStartTime, setBlockStartTime] = useState('');
  const [blockEndTime, setBlockEndTime] = useState('');

  // Estados para os dados da API
  const [appointmentsByDate, setAppointmentsByDate] = useState({});
  const [loading, setLoading] = useState(true);

  // Função que busca do Back-end e agrupa por data (YYYY-MM-DD)
  const carregarAgendamentos = async () => {
    try {
      setLoading(true);
      
      // CORREÇÃO: Chamando diretamente a função nomeada do JS
      const dados = await listarAgendamentos();
      
      const mapeado = {};

      dados.forEach((apt) => {
        if (!apt.dataHoraInicio) return;
        
        // Separa "2025-12-19T10:00:00" em data e hora
        const partes = apt.dataHoraInicio.split('T');
        const dataChave = partes[0]; // "2025-12-19"
        const horario = partes[1]?.substring(0, 5) || '00:00'; // "10:00"

        // Mapeia o Enum StatusAgendamento vindo do Kotlin
        let statusFinal = 'confirmed';
        if (apt.statusAgendamento === 'PENDENTE') statusFinal = 'pending';
        if (apt.statusAgendamento === 'CANCELADO') statusFinal = 'canceled';
        if (apt.statusAgendamento === 'BLOQUEADO') statusFinal = 'blocked';
        if (apt.statusAgendamento === 'FINALIZADO') statusFinal = 'confirmed'; // Garante que finalizados fiquem verdes

        const novoItem = {
          id: apt.idAgendamento,
          time: horario,
          client: apt.nomeCliente || 'Bloqueio / Compromisso',
          service: apt.nomeServico || '',
          status: statusFinal,
        };

        if (!mapeado[dataChave]) {
          mapeado[dataChave] = [];
        }
        mapeado[dataChave].push(novoItem);
      });

      // Ordena os horários de cada dia de forma crescente
      Object.keys(mapeado).forEach(data => {
        mapeado[data].sort((a, b) => a.time.localeCompare(b.time));
      });

      setAppointmentsByDate(mapeado);
    } catch (error) {
      console.error("Erro ao buscar agendamentos no banco:", error);
    } finally {
      setLoading(false);
    }
  };

  // Carrega ao entrar na tela
  useEffect(() => {
    carregarAgendamentos();
  }, []);

  const monthName = currentMonth.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
  
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    return { firstDay, daysInMonth };
  };

  const getWeekDays = (date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const formatDateKey = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const hasAppointments = (date) => {
    const dateKey = formatDateKey(date);
    return appointmentsByDate[dateKey] && appointmentsByDate[dateKey].length > 0;
  };

  const getAppointmentsForDate = (date) => {
    const dateKey = formatDateKey(date);
    return appointmentsByDate[dateKey] || [];
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isSameDay = (date1, date2) => {
    if (!date1) return false;
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const handleBlockTime = async () => {
    if (!selectedDate || !blockReason || !blockStartTime || !blockEndTime) return;
    
    try {
      alert(`Horário bloqueado com sucesso:\n${blockReason}\n${blockStartTime} - ${blockEndTime}`);
      setShowBlockModal(false);
      setBlockReason('');
      setBlockStartTime('');
      setBlockEndTime('');
    } catch (err) {
      console.error(err);
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 18; hour++) {
      for (let min = 0; min < 60; min += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const renderMonthView = () => {
    const { firstDay, daysInMonth } = getDaysInMonth(currentMonth);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
            <div key={day} className="bg-white text-center text-gray-600 text-sm py-3 font-medium">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {emptyDays.map((_, index) => (
            <div key={`empty-${index}`} className="bg-gray-50 aspect-square" />
          ))}
          {days.map((day) => {
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
            const dayAppointments = hasAppointments(date);
            const isCurrentDay = isToday(date);
            const isSelected = isSameDay(selectedDate, date);

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(date)}
                className={`bg-white aspect-square p-2 flex flex-col items-center justify-center relative transition-all hover:bg-gray-50 ${
                  isSelected ? 'ring-2 ring-inset ring-primary' : ''
                }`}
              >
                <span
                  className={`text-sm mb-1 ${
                    isCurrentDay
                      ? 'w-8 h-8 flex items-center justify-center rounded-full bg-accent text-white font-bold'
                      : isSelected
                      ? 'text-primary font-semibold'
                      : 'text-gray-800'
                  }`}
                >
                  {day}
                </span>
                {dayAppointments && (
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays(selectedDate || new Date());
    const timeSlots = generateTimeSlots();

    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="grid grid-cols-8 gap-px bg-gray-200">
          <div className="bg-white p-3"></div>
          {weekDays.map((day) => {
            const isCurrentDay = isToday(day);
            const isSelected = isSameDay(selectedDate, day);
            
            return (
              <button
                key={day.toString()}
                onClick={() => setSelectedDate(day)}
                className={`bg-white p-3 text-center transition-all hover:bg-gray-50 ${
                  isSelected ? 'ring-2 ring-inset ring-primary' : ''
                }`}
              >
                <p className="text-xs text-gray-500 mb-1">
                  {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
                </p>
                <p
                  className={`text-lg ${
                    isCurrentDay
                      ? 'w-8 h-8 mx-auto flex items-center justify-center rounded-full bg-accent text-white font-bold'
                      : isSelected
                      ? 'text-primary font-semibold'
                      : 'text-gray-800'
                  }`}
                >
                  {day.getDate()}
                </p>
                {hasAppointments(day) && (
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mx-auto mt-1"></div>
                )}
              </button>
            );
          })}
        </div>

        <div className="max-h-[500px] overflow-y-auto">
          <div className="grid grid-cols-8 gap-px bg-gray-200">
            {timeSlots.map((time) => (
              <div key={`slot-${time}`} className="contents">
                <div className="bg-gray-50 p-2 text-xs text-gray-600 text-right pr-3">
                  {time}
                </div>
                {weekDays.map((day) => {
                  const appointments = getAppointmentsForDate(day);
                  const appointment = appointments.find(apt => apt.time === time);
                  const isSelected = isSameDay(selectedDate, day);

                  return (
                    <div
                      key={`${day.toString()}-${time}`}
                      className={`bg-white p-1 min-h-[50px] transition-all ${
                        isSelected ? 'bg-purple-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      {appointment && (
                        <div
                          className={`text-xs p-2 rounded h-full ${
                            appointment.status === 'blocked'
                              ? 'bg-gray-300 text-gray-700'
                              : appointment.status === 'confirmed'
                              ? 'bg-primary/20 text-primary border-l-2 border-primary'
                              : 'bg-yellow-100 text-yellow-700 border-l-2 border-yellow-500'
                          }`}
                        >
                          <p className="font-medium truncate">{appointment.client}</p>
                          {appointment.service && (
                            <p className="truncate opacity-75">{appointment.service}</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="pb-24 lg:pb-8 px-5 lg:px-8 pt-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-primary font-bold">Calendário</h2>
          <p className="text-gray-600 text-sm">Gerencie sua agenda completa</p>
        </div>
        <button
          onClick={carregarAgendamentos}
          className="p-2 border rounded-xl hover:bg-gray-50 text-gray-600 flex items-center gap-1.5 text-sm font-medium transition-colors"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Sincronizar
        </button>
      </div>

      <div className="flex gap-2 mb-4 max-w-md lg:max-w-lg">
        <button
          onClick={() => setViewMode('month')}
          className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
            viewMode === 'month'
              ? 'bg-primary text-white shadow-md'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-primary'
          }`}
        >
          <Calendar size={18} />
          <span>Mês</span>
        </button>
        <button
          onClick={() => setViewMode('week')}
          className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
            viewMode === 'week'
              ? 'bg-primary text-white shadow-md'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-primary'
          }`}
        >
          <Clock size={18} />
          <span>Semana</span>
        </button>
      </div>

      <div className="flex justify-between items-center mb-6 bg-white rounded-xl p-4 shadow-md max-w-md lg:max-w-lg">
        <button
          onClick={() => {
            if (viewMode === 'month') {
              setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
            } else {
              const newDate = new Date(selectedDate || new Date());
              newDate.setDate(newDate.getDate() - 7);
              setSelectedDate(newDate);
              setCurrentMonth(new Date(newDate.getFullYear(), newDate.getMonth()));
            }
          }}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="text-primary" size={24} />
        </button>
        <h3 className="text-primary capitalize font-medium">
          {viewMode === 'month' ? monthName : `Semana de ${monthName.split(' ')[0]}`}
        </h3>
        <button
          onClick={() => {
            if (viewMode === 'month') {
              setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
            } else {
              const newDate = new Date(selectedDate || new Date());
              newDate.setDate(newDate.getDate() + 7);
              setSelectedDate(newDate);
              setCurrentMonth(new Date(newDate.getFullYear(), newDate.getMonth()));
            }
          }}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="text-primary" size={24} />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-md text-gray-500">
          <RefreshCw className="animate-spin mx-auto mb-2 text-primary" size={24} />
          Carregando a agenda do banco...
        </div>
      ) : (
        <div className="lg:grid lg:grid-cols-3 lg:gap-6">
          <div className="mb-6 lg:col-span-2">
            {viewMode === 'month' ? renderMonthView() : renderWeekView()}
          </div>

          {viewMode === 'month' && selectedDate && (
            <div className="bg-white rounded-xl p-5 shadow-md mb-4 lg:col-span-1 lg:mb-0 h-fit">
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h3 className="text-gray-800 font-bold text-base">
                  {selectedDate.toLocaleDateString('pt-BR', { 
                    day: 'numeric', 
                    month: 'long',
                    weekday: 'long'
                  })}
                </h3>
                <button
                  onClick={() => setShowBlockModal(true)}
                  className="bg-accent text-white px-3 py-1.5 rounded-lg text-sm hover:shadow-lg transition-all flex items-center gap-1.5"
                >
                  <Plus size={16} />
                  <span>Bloquear</span>
                </button>
              </div>

              {getAppointmentsForDate(selectedDate).length > 0 ? (
                <div className="space-y-3">
                  {getAppointmentsForDate(selectedDate).map((apt, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        apt.status === 'blocked' ? 'bg-gray-100 border-gray-200' : 'bg-purple-50 border-purple-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-xs">
                          <Clock className="text-primary" size={18} />
                        </div>
                        <div>
                          <p className={`font-semibold text-sm ${apt.status === 'blocked' ? 'text-gray-700' : 'text-primary'}`}>
                            {apt.client}
                          </p>
                          <p className="text-gray-600 text-xs">{apt.time}h</p>
                          {apt.service && (
                            <p className="text-gray-500 text-xs mt-0.5">{apt.service}</p>
                          )}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          apt.status === 'confirmed'
                            ? 'bg-green-100 text-green-700'
                            : apt.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {apt.status === 'confirmed' ? 'Confirmado' : apt.status === 'pending' ? 'Pendente' : 'Bloqueado'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Calendar className="text-gray-400" size={24} />
                  </div>
                  <p className="text-gray-500 text-sm">Nenhum agendamento neste dia</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Block Time Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-5">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-primary text-xl font-bold">Bloquear Horário</h3>
              <button
                onClick={() => {
                  setShowBlockModal(false);
                  setBlockReason('');
                  setBlockStartTime('');
                  setBlockEndTime('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-gray-600 text-sm font-medium">
                {selectedDate?.toLocaleDateString('pt-BR', { 
                  day: 'numeric', 
                  month: 'long',
                  weekday: 'long'
                })}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 mb-2 block">Motivo</label>
                <input
                  type="text"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="Ex: Almoço, Compromisso Médico"
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Início</label>
                  <input
                    type="time"
                    value={blockStartTime}
                    onChange={(e) => setBlockStartTime(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Fim</label>
                  <input
                    type="time"
                    value={blockEndTime}
                    onChange={(e) => setBlockEndTime(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowBlockModal(false);
                  setBlockReason('');
                  setBlockStartTime('');
                  setBlockEndTime('');
                }}
                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleBlockTime}
                disabled={!blockReason || !blockStartTime || !blockEndTime}
                className="flex-1 py-3 bg-accent text-white rounded-xl hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Bloquear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="bg-white rounded-xl p-4 shadow-md mt-4 max-w-md lg:max-w-lg">
        <p className="text-gray-600 text-sm mb-3 font-medium">Legenda</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">19</span>
            </div>
            <span className="text-gray-600 text-sm">Hoje</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white border border-gray-300 rounded flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
            </div>
            <span className="text-gray-600 text-sm">Dia com agendamentos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary/20 border-l-2 border-primary rounded"></div>
            <span className="text-gray-600 text-sm">Agendamento confirmado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-yellow-100 border-l-2 border-yellow-500 rounded"></div>
            <span className="text-gray-600 text-sm">Agendamento pendente</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => setShowBlockModal(true)}
        className="fixed bottom-24 right-5 w-14 h-14 bg-accent text-white rounded-full shadow-2xl hover:shadow-3xl transition-all flex items-center justify-center"
      >
        <Plus size={28} />
      </button>
    </div>
  );
}