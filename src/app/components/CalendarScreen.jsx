import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Calendar, Clock, RefreshCw, Check, XCircle, DollarSign } from 'lucide-react';
import { buscarAgendamentosPorPeriodo, finalizarAtendimento, cancelarAgendamento } from '../../api/bookings';
import { useLanguage } from '../../context/LanguageContext'; // 🌟 Importando o hook de idioma

// Dicionário local para a tela de Calendário
const localTranslations = {
  'pt-BR': {
    title: 'Calendário',
    subtitle: 'Gerencie sua agenda completa',
    sync: 'Sincronizar',
    loadingText: 'Carregando a agenda do banco...',
    viewMonth: 'Mês',
    viewWeek: 'Semana',
    weekPrefix: 'Semana de',
    blockBtn: 'Bloquear',
    noAppointments: 'Nenhum agendamento neste dia',
    modalDetailsTitle: 'Detalhes do Agendamento',
    labelSelectedDate: 'Data selecionada',
    labelTime: 'Horário',
    labelDuration: 'Tempo de Agendamento',
    labelService: 'Serviço Solicitado',
    labelValue: 'Valor',
    btnCancel: 'Cancelar',
    btnFinish: 'Finalizar',
    btnClose: 'Fechar Detalhes',
    modalBlockTitle: 'Bloquear Agenda',
    labelBlockDate: 'Data do Bloqueio',
    labelReason: 'Motivo',
    placeholderReason: 'Ex: Almoço, Compromisso Médico',
    checkFullDay: 'Bloquear o dia inteiro',
    labelStart: 'Início',
    labelEnd: 'Fim',
    legendTitle: 'Legenda',
    legendToday: 'Hoje',
    legendHasApp: 'Dia com agendamentos',
    legendConfirmed: 'Agendamento confirmado',
    legendPending: 'Agendamento pendente',
    weekDaysShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
    statusFinished: 'Finalizado',
    statusConfirmed: 'Confirmado',
    statusPending: 'Pendente',
    statusBlocked: 'Bloqueado',
    alertFinishSuccess: 'Atendimento finalizado com sucesso!',
    alertFinishError: 'Erro ao finalizar atendimento. Tente novamente.',
    alertCancelSuccess: 'Agendamento cancelado com sucesso!',
    alertCancelError: 'Erro ao cancelar agendamento. Tente novamente.',
    alertBlockSuccess: 'Horário bloqueado com sucesso:\nMotivo: {reason}\nData: {date}\nPeríodo: {start} - {end}'
  },
  'en-US': {
    title: 'Calendar',
    subtitle: 'Manage your full schedule',
    sync: 'Sync',
    loadingText: 'Loading schedule from database...',
    viewMonth: 'Month',
    viewWeek: 'Week',
    weekPrefix: 'Week of',
    blockBtn: 'Block',
    noAppointments: 'No appointments on this day',
    modalDetailsTitle: 'Appointment Details',
    labelSelectedDate: 'Selected Date',
    labelTime: 'Time',
    labelDuration: 'Appointment Duration',
    labelService: 'Requested Service',
    labelValue: 'Value',
    btnCancel: 'Cancel',
    btnFinish: 'Finish',
    btnClose: 'Close Details',
    modalBlockTitle: 'Block Schedule',
    labelBlockDate: 'Block Date',
    labelReason: 'Reason',
    placeholderReason: 'e.g., Lunch, Doctor Appointment',
    checkFullDay: 'Block full day',
    labelStart: 'Start',
    labelEnd: 'End',
    legendTitle: 'Legend',
    legendToday: 'Today',
    legendHasApp: 'Day with appointments',
    legendConfirmed: 'Confirmed appointment',
    legendPending: 'Pending appointment',
    weekDaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    statusFinished: 'Finished',
    statusConfirmed: 'Confirmed',
    statusPending: 'Pending',
    statusBlocked: 'Blocked',
    alertFinishSuccess: 'Service finished successfully!',
    alertFinishError: 'Error finishing service. Please try again.',
    alertCancelSuccess: 'Appointment canceled successfully!',
    alertCancelError: 'Error canceling appointment. Please try again.',
    alertBlockSuccess: 'Time slot blocked successfully:\nReason: {reason}\nDate: {date}\nPeriod: {start} - {end}'
  },
  'es-ES': {
    title: 'Calendario',
    subtitle: 'Gestione su agenda completa',
    sync: 'Sincronizar',
    loadingText: 'Cargando la agenda de la base de datos...',
    viewMonth: 'Mes',
    viewWeek: 'Semana',
    weekPrefix: 'Semana de',
    blockBtn: 'Bloquear',
    noAppointments: 'No hay turnos en este día',
    modalDetailsTitle: 'Detalles del Turno',
    labelSelectedDate: 'Fecha seleccionada',
    labelTime: 'Horario',
    labelDuration: 'Tiempo del Turno',
    labelService: 'Servicio Solicitado',
    labelValue: 'Valor',
    btnCancel: 'Cancelar',
    btnFinish: 'Finalizar',
    btnClose: 'Cerrar Detalles',
    modalBlockTitle: 'Bloquear Agenda',
    labelBlockDate: 'Fecha de Bloqueo',
    labelReason: 'Motivo',
    placeholderReason: 'Ej: Almuerzo, Cita Médica',
    checkFullDay: 'Bloquear todo el día',
    labelStart: 'Inicio',
    labelEnd: 'Fin',
    legendTitle: 'Leyenda',
    legendToday: 'Hoy',
    legendHasApp: 'Día con turnos',
    legendConfirmed: 'Turno confirmado',
    legendPending: 'Turno pendiente',
    weekDaysShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    statusFinished: 'Finalizado',
    statusConfirmed: 'Confirmado',
    statusPending: 'Pendiente',
    statusBlocked: 'Bloqueado',
    alertFinishSuccess: '¡Atención finalizada con éxito!',
    alertFinishError: 'Error al finalizar la atención. Intente nuevamente.',
    alertCancelSuccess: '¡Turno cancelado con éxito!',
    alertCancelError: 'Error al cancelar el turno. Intente novamente.',
    alertBlockSuccess: 'Horario bloqueado con éxito:\nMotivo: {reason}\nFecha: {date}\nPeríodo: {start} - {end}'
  }
};

export function CalendarScreen() {
  const { systemLanguage } = useLanguage(); // 🌟 Obtendo o idioma ativo globalmente
  const text = localTranslations[systemLanguage] || localTranslations['pt-BR'];

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month');

  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [blockDate, setBlockDate] = useState('');
  const [isFullDay, setIsFullDay] = useState(false);
  const [blockStartTime, setBlockStartTime] = useState('');
  const [blockEndTime, setBlockEndTime] = useState('');

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointmentsByDate, setAppointmentsByDate] = useState({});
  const [loading, setLoading] = useState(true);

  const formatDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatCurrency = (amount) => {
    if (systemLanguage === 'en-US') {
      return Number(amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    } else if (systemLanguage === 'es-ES') {
      return Number(amount).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
    }
    return Number(amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const carregarAgendamentos = async () => {
    try {
      setLoading(true);
      const dados = await buscarAgendamentosPorPeriodo();
      const mapeado = {};

      dados.forEach((apt) => {
        if (!apt.dataHoraInicio) return;

        const partes = apt.dataHoraInicio.split('T');
        const dataChave = partes[0];
        const horario = partes[1]?.substring(0, 5) || '00:00';

        const statusVindoDoBack = apt.status || apt.statusAgendamento || 'PENDENTE';

        let statusFinal = 'confirmed';
        if (statusVindoDoBack === 'PENDENTE') statusFinal = 'pending';
        if (statusVindoDoBack === 'CANCELADO') statusFinal = 'canceled';
        if (statusVindoDoBack === 'BLOQUEADO') statusFinal = 'blocked';
        if (statusVindoDoBack === 'FINALIZADO') statusFinal = 'confirmed';

        const primeiroServico = Array.isArray(apt.servicos) ? apt.servicos[0] : null;
        const nomeServico = primeiroServico?.nome || primeiroServico?.nomeServico || apt.nomeServico || apt.servicoNome || 'Serviço não informado';
        const valorServico = apt.valorTotalFinal ?? apt.totalFinal ?? apt.subtotalServicos ?? primeiroServico?.preco ?? apt.valor ?? apt.preco ?? 0;
        const tempoDuracao = primeiroServico?.tempoEstimado || apt.duracao || apt.tempoAgendamento || 30;

        const novoItem = {
          id: apt.id || apt.idAgendamento,
          time: horario,
          client: apt.cliente?.nome || apt.nomeCliente || 'Cliente',
          service: nomeServico,
          status: statusFinal,
          statusAgendamento: statusVindoDoBack,
          price: valorServico,
          duration: tempoDuracao
        };

        if (!mapeado[dataChave]) {
          mapeado[dataChave] = [];
        }
        mapeado[dataChave].push(novoItem);
      });

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

  useEffect(() => {
    carregarAgendamentos();
  }, []);

  const handleFinalizarAtendimento = async (id) => {
    try {
      await finalizarAtendimento(id);
      alert(text.alertFinishSuccess);
      setSelectedAppointment(null);
      carregarAgendamentos();
    } catch (error) {
      console.error('Erro ao finalizar atendimento:', error);
      alert(text.alertFinishError);
    }
  };

  const handleCancelarAgendamento = async (id) => {
    try {
      await cancelarAgendamento(id);
      alert(text.alertCancelSuccess);
      setSelectedAppointment(null);
      carregarAgendamentos();
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
      alert(text.alertCancelError);
    }
  };

  const monthName = currentMonth.toLocaleString(systemLanguage, { month: 'long', year: 'numeric' });

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

  const abrirModalBloqueio = () => {
    setBlockDate(formatDateString(selectedDate || new Date()));
    setBlockReason('');
    setIsFullDay(false);
    setBlockStartTime('');
    setBlockEndTime('');
    setShowBlockModal(true);
  };

  const handleBlockTime = async () => {
    if (!blockDate || !blockReason) return;
    if (!isFullDay && (!blockStartTime || !blockEndTime)) return;

    const inicio = isFullDay ? '00:00' : blockStartTime;
    const fim = isFullDay ? '23:59' : blockEndTime;

    try {
      const msg = text.alertBlockSuccess
        .replace('{reason}', blockReason)
        .replace('{date}', blockDate)
        .replace('{start}', inicio)
        .replace('{end}', fim);
      alert(msg);
      setShowBlockModal(false);
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
          {text.weekDaysShort.map((day) => (
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
                className={`bg-white aspect-square p-2 flex flex-col items-center justify-center relative transition-all hover:bg-gray-50 ${isSelected ? 'ring-2 ring-inset ring-primary' : ''}`}
              >
                <span
                  className={`text-sm mb-1 ${isCurrentDay
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
                className={`bg-white p-3 text-center transition-all hover:bg-gray-50 ${isSelected ? 'ring-2 ring-inset ring-primary' : ''}`}
              >
                <p className="text-xs text-gray-500 mb-1">
                  {day.toLocaleDateString(systemLanguage, { weekday: 'short' })}
                </p>
                <p
                  className={`text-lg ${isCurrentDay
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
                      className={`bg-white p-1 min-h-[60px] transition-all ${isSelected ? 'bg-purple-50/50' : 'hover:bg-gray-50'}`}
                    >
                      {appointment && (
                        <div
                          onClick={() => appointment.status !== 'blocked' && setSelectedAppointment(appointment)}
                          className={`text-xs p-1.5 rounded h-full text-left cursor-pointer transition-transform active:scale-95 flex flex-col justify-between ${appointment.status === 'blocked'
                            ? 'bg-gray-300 text-gray-700 cursor-not-allowed'
                            : appointment.status === 'confirmed'
                              ? 'bg-primary/20 text-primary border-l-2 border-primary hover:bg-primary/30'
                              : 'bg-yellow-100 text-yellow-700 border-l-2 border-yellow-500 hover:bg-yellow-200'
                            }`}
                        >
                          <div>
                            <p className="font-bold truncate">{appointment.client}</p>
                            <p className="truncate opacity-85 text-[10px] font-medium text-gray-600">{appointment.service}</p>
                          </div>
                          {appointment.status !== 'blocked' && (
                            <p className="text-[10px] font-bold mt-0.5 text-right text-emerald-700">
                              {formatCurrency(appointment.price)}
                            </p>
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
          <h2 className="text-primary font-bold">{text.title}</h2>
          <p className="text-gray-600 text-sm">{text.subtitle}</p>
        </div>
        <button
          onClick={carregarAgendamentos}
          className="p-2 border rounded-xl hover:bg-gray-50 text-gray-600 flex items-center gap-1.5 text-sm font-medium transition-colors"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          {text.sync}
        </button>
      </div>

      <div className="flex gap-2 mb-4 max-w-md lg:max-w-lg">
        <button
          onClick={() => setViewMode('month')}
          className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${viewMode === 'month'
            ? 'bg-primary text-white shadow-md'
            : 'bg-white text-gray-600 border border-gray-200 hover:border-primary'
            }`}
        >
          <Calendar size={18} />
          <span>{text.viewMonth}</span>
        </button>
        <button
          onClick={() => setViewMode('week')}
          className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${viewMode === 'week'
            ? 'bg-primary text-white shadow-md'
            : 'bg-white text-gray-600 border border-gray-200 hover:border-primary'
            }`}
        >
          <Clock size={18} />
          <span>{text.viewWeek}</span>
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
          {viewMode === 'month' ? monthName : `${text.weekPrefix} ${monthName.split(' ')[0]}`}
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
          {text.loadingText}
        </div>
      ) : (
        <div className="lg:grid lg:grid-cols-3 lg:gap-6">
          <div className="mb-6 lg:col-span-2">
            {viewMode === 'month' ? renderMonthView() : renderWeekView()}
          </div>

          {selectedDate && (
            <div className="bg-white rounded-xl p-5 shadow-md mb-4 lg:col-span-1 lg:mb-0 h-fit">
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h3 className="text-gray-800 font-bold text-base">
                  {selectedDate.toLocaleDateString(systemLanguage, {
                    day: 'numeric',
                    month: 'long',
                    weekday: 'long'
                  })}
                </h3>
                <button
                  onClick={abrirModalBloqueio}
                  className="bg-accent text-white px-3 py-1.5 rounded-lg text-sm hover:shadow-lg transition-all flex items-center gap-1.5"
                >
                  <Plus size={16} />
                  <span>{text.blockBtn}</span>
                </button>
              </div>

              {getAppointmentsForDate(selectedDate).length > 0 ? (
                <div className="space-y-3">
                  {getAppointmentsForDate(selectedDate).map((apt, index) => (
                    <div
                      key={index}
                      onClick={() => apt.status !== 'blocked' && setSelectedAppointment(apt)}
                      className={`p-3 rounded-lg border transition-all ${apt.status === 'blocked'
                        ? 'bg-gray-100 border-gray-200'
                        : 'bg-purple-50 border-purple-100 hover:border-primary cursor-pointer hover:shadow-sm'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-xs">
                            <Clock className="text-primary" size={18} />
                          </div>
                          <div>
                            <p className={`font-semibold text-sm ${apt.status === 'blocked' ? 'text-gray-700' : 'text-primary'}`}>
                              {apt.client}
                            </p>
                            <p className="text-gray-600 text-xs">{apt.time}h</p>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${apt.status === 'confirmed'
                            ? 'bg-green-100 text-green-700'
                            : apt.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-200 text-gray-700'
                            }`}
                        >
                          {apt.statusAgendamento === 'FINALIZADO' ? text.statusFinished :
                            apt.status === 'confirmed' ? text.statusConfirmed :
                              apt.status === 'pending' ? text.statusPending : text.statusBlocked}
                        </span>
                      </div>

                      {apt.status !== 'blocked' && (
                        <div className="flex justify-between items-center border-t border-purple-200/40 pt-2 mt-2 text-xs">
                          <span className="text-gray-600 font-medium truncate max-w-[150px]">{apt.service}</span>
                          <span className="text-emerald-700 font-bold">
                            {formatCurrency(apt.price)}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Calendar className="text-gray-400" size={24} />
                  </div>
                  <p className="text-gray-500 text-sm">{text.noAppointments}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* MODAL DE DETALHES DO AGENDAMENTO */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-5 animate-fade-in">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl relative">
            <button
              onClick={() => setSelectedAppointment(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
            >
              <X size={20} />
            </button>

            <div className="mb-5">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${selectedAppointment.statusAgendamento === 'FINALIZADO' ? 'bg-green-100 text-green-800' :
                selectedAppointment.statusAgendamento === 'CANCELADO' ? 'bg-red-100 text-red-800' : 'bg-purple-100 text-purple-800'
                }`}>
                {selectedAppointment.statusAgendamento === 'FINALIZADO' ? text.statusFinished :
                  selectedAppointment.statusAgendamento === 'CANCELADO' ? text.btnCancel : selectedAppointment.statusAgendamento}
              </span>
              <h3 className="text-xl font-bold text-gray-800 mt-2">{selectedAppointment.client}</h3>
              <p className="text-sm text-gray-500">{text.modalDetailsTitle}</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-3.5 border border-gray-100 mb-6">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Calendar size={18} className="text-primary shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 font-medium">{text.labelSelectedDate}</p>
                  <p className="font-semibold">{selectedDate?.toLocaleDateString(systemLanguage, { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <Clock size={18} className="text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 font-medium">{text.labelTime}</p>
                    <p className="font-semibold">{selectedAppointment.time}h</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <Clock size={18} className="text-accent shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 font-medium">{text.labelDuration}</p>
                    <p className="font-semibold">{selectedAppointment.duration} min</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200/60 my-2 pt-2"></div>

              <div className="flex items-center gap-3 text-sm text-gray-700">
                <div className="w-4 h-4 rounded-full border border-primary flex items-center justify-center text-[10px] text-primary font-bold shrink-0">S</div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">{text.labelService}</p>
                  <p className="font-semibold text-gray-800">{selectedAppointment.service}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-700">
                <DollarSign size={18} className="text-emerald-600 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 font-medium">{text.labelValue}</p>
                  <p className="font-bold text-emerald-600 text-base">
                    {formatCurrency(selectedAppointment.price)}
                  </p>
                </div>
              </div>
            </div>

            {selectedAppointment.statusAgendamento !== 'FINALIZADO' && selectedAppointment.statusAgendamento !== 'CANCELADO' ? (
              <div className="flex gap-3">
                <button
                  onClick={() => handleCancelarAgendamento(selectedAppointment.id)}
                  className="flex-1 border border-red-200 text-red-600 py-3 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors flex items-center justify-center gap-1.5"
                >
                  <XCircle size={16} />
                  {text.btnCancel}
                </button>
                <button
                  onClick={() => handleFinalizarAtendimento(selectedAppointment.id)}
                  className="flex-1 bg-green-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-green-700 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
                >
                  <Check size={16} />
                  {text.btnFinish}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSelectedAppointment(null)}
                className="w-full bg-gray-100 text-gray-600 py-3 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors"
              >
                {text.btnClose}
              </button>
            )}
          </div>
        </div>
      )}

      {/* MODAL DE BLOQUEIO DE HORÁRIO */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-5">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-primary text-xl font-bold">{text.modalBlockTitle}</h3>
              <button
                onClick={() => setShowBlockModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 mb-1 block font-medium">{text.labelBlockDate}</label>
                <input
                  type="date"
                  value={blockDate}
                  onChange={(e) => setBlockDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary font-semibold text-gray-700"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1 block font-medium">{text.labelReason}</label>
                <input
                  type="text"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder={text.placeholderReason}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex items-center gap-2.5 bg-purple-50/50 p-3 rounded-xl border border-purple-100/50">
                <input
                  type="checkbox"
                  id="fullDayCheck"
                  checked={isFullDay}
                  onChange={(e) => setIsFullDay(e.target.checked)}
                  className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="fullDayCheck" className="text-sm font-bold text-primary cursor-pointer select-none">
                  {text.checkFullDay}
                </label>
              </div>

              {!isFullDay && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block font-medium">{text.labelStart}</label>
                    <input
                      type="time"
                      value={blockStartTime}
                      onChange={(e) => setBlockStartTime(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block font-medium">{text.labelEnd}</label>
                    <input
                      type="time"
                      value={blockEndTime}
                      onChange={(e) => setBlockEndTime(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowBlockModal(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                {text.btnCancel}
              </button>
              <button
                onClick={handleBlockTime}
                disabled={!blockReason || !blockDate || (!isFullDay && (!blockStartTime || !blockEndTime))}
                className="flex-1 py-3 bg-accent text-white rounded-xl hover:shadow-lg transition-shadow font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {text.blockBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="bg-white rounded-xl p-4 shadow-md mt-4 max-w-md lg:max-w-lg">
        <p className="text-gray-600 text-sm mb-3 font-medium">{text.legendTitle}</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">19</span>
            </div>
            <span className="text-gray-600 text-sm">{text.legendToday}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white border border-gray-300 rounded flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
            </div>
            <span className="text-gray-600 text-sm">{text.legendHasApp}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary/20 border-l-2 border-primary rounded"></div>
            <span className="text-gray-600 text-sm">{text.legendConfirmed}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-yellow-100 border-l-2 border-yellow-500 rounded"></div>
            <span className="text-gray-600 text-sm">{text.legendPending}</span>
          </div>
        </div>
      </div>

      <button
        onClick={abrirModalBloqueio}
        className="fixed bottom-24 right-5 w-14 h-14 bg-accent text-white rounded-full shadow-2xl hover:shadow-3xl transition-all flex items-center justify-center"
      >
        <Plus size={28} />
      </button>
    </div>
  );
}