import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Check, ToggleLeft, ToggleRight, Loader, AlertCircle } from 'lucide-react';
import { listarHorarioComercial, salvarHorarioComercial } from '../../../api';

// Helpers de formatação de horário
const toHHmm = (timeStr) => {
  if (!timeStr) return '';
  // aceita 'HH:mm' ou 'HH:mm:ss' e retorna 'HH:mm' para input type="time"
  const parts = String(timeStr).split(':');
  if (parts.length >= 2) return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
  return timeStr;
};

const toHHmmss = (timeStr) => {
  if (!timeStr) return null;
  const parts = String(timeStr).split(':');
  if (parts.length === 3) {
    return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}:${parts[2].padStart(2, '0')}`;
  }
  if (parts.length === 2) {
    return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}:00`;
  }
  // caso venha apenas 'HH', assume minutos 00 e segundos 00
  if (parts.length === 1) {
    return `${parts[0].padStart(2, '0')}:00:00`;
  }
  return timeStr;
};

export function BusinessHours({ onBack }) {
  const [schedule, setSchedule] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const defaultSchedule = [
    { day: 'monday', dayName: 'Segunda-feira', active: true, openTime: '09:00', closeTime: '18:00' },
    { day: 'tuesday', dayName: 'Terça-feira', active: true, openTime: '09:00', closeTime: '18:00' },
    { day: 'wednesday', dayName: 'Quarta-feira', active: true, openTime: '09:00', closeTime: '18:00' },
    { day: 'thursday', dayName: 'Quinta-feira', active: true, openTime: '09:00', closeTime: '18:00' },
    { day: 'friday', dayName: 'Sexta-feira', active: true, openTime: '09:00', closeTime: '18:00' },
    { day: 'saturday', dayName: 'Sábado', active: true, openTime: '09:00', closeTime: '17:00' },
    { day: 'sunday', dayName: 'Domingo', active: false, openTime: '09:00', closeTime: '17:00' },
  ];

  const mapHorarioFromApi = (horarios) => {
    if (!Array.isArray(horarios) || horarios.length === 0) {
      return defaultSchedule;
    }

    const daysMap = {
      'MONDAY': 'monday',
      'TUESDAY': 'tuesday',
      'WEDNESDAY': 'wednesday',
      'THURSDAY': 'thursday',
      'FRIDAY': 'friday',
      'SATURDAY': 'saturday',
      'SUNDAY': 'sunday',
    };

    const daysNameMap = {
      'monday': 'Segunda-feira',
      'tuesday': 'Terça-feira',
      'wednesday': 'Quarta-feira',
      'thursday': 'Quinta-feira',
      'friday': 'Sexta-feira',
      'saturday': 'Sábado',
      'sunday': 'Domingo',
    };

    return defaultSchedule.map((defaultDay) => {
      const apiHorario = horarios.find((h) => {
        const dayKey = daysMap[h.diaSemana] || h.day;
        return dayKey === defaultDay.day;
      });

      if (apiHorario) {
        return {
          day: defaultDay.day,
          dayName: daysNameMap[defaultDay.day],
          id: apiHorario.id || apiHorario.idHorarioComercial,
          active: apiHorario.ativo !== false && apiHorario.active !== false,
          openTime: toHHmm(apiHorario.horaAbertura || apiHorario.openTime || '09:00'),
          closeTime: toHHmm(apiHorario.horaFechamento || apiHorario.closeTime || '18:00'),
        };
      }
      return defaultDay;
    });
  };

  // Carrega horários do backend ao montar o componente
  useEffect(() => {
    let isMounted = true;

    const fetchSchedule = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log('📅 Carregando horário comercial...');
        const data = await listarHorarioComercial();
        if (isMounted) {
          const mapped = mapHorarioFromApi(data);
          setSchedule(mapped);
          console.log('✅ Horário comercial carregado', mapped);
        }
      } catch (err) {
        console.error('❌ Erro ao listar horário comercial:', err);
        if (isMounted) {
          setError('Erro ao carregar horários. Usando padrão.');
          setSchedule(defaultSchedule);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchSchedule();

    return () => {
      isMounted = false;
    };
    // Intencionalmente vazio: queremos carregar uma única vez ao montar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleDay = (dayIndex) => {
    const newSchedule = [...schedule];
    newSchedule[dayIndex].active = !newSchedule[dayIndex].active;
    setSchedule(newSchedule);
    setHasChanges(true);
  };

  const updateTime = (dayIndex, field, value) => {
    const newSchedule = [...schedule];
    newSchedule[dayIndex][field] = value;
    setSchedule(newSchedule);
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      console.log('💾 Salvando horário comercial...', schedule);
      
      // Mapear para formato do backend
      // Importante: sempre enviar horários válidos (nunca null) para evitar Kotlin null safety issues
      // e incluir ID para fazer update em vez de create (Hibernate)
      const payloadArray = schedule.map((day) => ({
        id: day.id || null, // Importante enviar o ID se existir (para update)
        diaSemana: day.day.toUpperCase(),
        // Enviamos o horário sempre, para evitar erro de parâmetro nulo no Kotlin
        horaAbertura: toHHmmss(day.openTime || '09:00'),
        horaFechamento: toHHmmss(day.closeTime || '18:00'),
        ativo: day.active,
      }));

      console.log('📦 Payload enviado:', JSON.stringify(payloadArray, null, 2));
      await salvarHorarioComercial(payloadArray);
      
      setHasChanges(false);
      console.log('✅ Horário comercial salvo com sucesso!');
      alert('Horários salvos com sucesso!');
    } catch (err) {
      console.error('❌ Erro ao salvar horários:', err);
      const offline = !err?.response;
      if (offline) {
        setError('Servidor inacessível em http://localhost:8080. Verifique se o backend está rodando.');
        alert('Servidor inacessível (localhost:8080). Verifique se o backend está rodando.');
      } else {
        setError('Erro ao salvar horários. Tente novamente.');
        alert('Erro ao salvar horários. Tente novamente.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const copyToAll = (dayIndex) => {
    if (confirm('Copiar este horário para todos os dias ativos?')) {
      const sourceDaySchedule = schedule[dayIndex];
      const newSchedule = schedule.map((day) => ({
        ...day,
        openTime: sourceDaySchedule.openTime,
        closeTime: sourceDaySchedule.closeTime,
      }));
      setSchedule(newSchedule);
      setHasChanges(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader className="animate-spin text-primary" size={32} />
          <p className="text-gray-600">Carregando horários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-white px-5 py-4 shadow-sm sticky top-0 z-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-primary hover:text-accent transition-colors mb-4"
        >
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>
        <h2 className="text-primary text-2xl">Horário Comercial</h2>
        <p className="text-gray-600 text-sm mt-1">Configure quando você atende</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mx-5 mt-4 p-4 rounded-lg bg-yellow-50 text-yellow-700 text-sm flex items-start gap-2">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Schedule Table */}
      <div className="px-5 py-6 space-y-3">
        {schedule.map((daySchedule, index) => (
          <div
            key={daySchedule.day}
            className={`bg-white rounded-xl p-5 shadow-md ${
              !daySchedule.active ? 'opacity-60' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-800 font-semibold">{daySchedule.dayName}</h3>
              <button
                onClick={() => toggleDay(index)}
                className="flex items-center gap-2"
              >
                {daySchedule.active ? (
                  <ToggleRight className="text-primary" size={32} />
                ) : (
                  <ToggleLeft className="text-gray-300" size={32} />
                )}
              </button>
            </div>

            {daySchedule.active && (
              <>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs text-gray-600 mb-2 block">Abertura</label>
                    <input
                      type="time"
                      value={daySchedule.openTime}
                      onChange={(e) => updateTime(index, 'openTime', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-2 block">Fechamento</label>
                    <input
                      type="time"
                      value={daySchedule.closeTime}
                      onChange={(e) => updateTime(index, 'closeTime', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <button
                  onClick={() => copyToAll(index)}
                  className="w-full py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  Copiar para todos os dias
                </button>
              </>
            )}

            {!daySchedule.active && (
              <p className="text-gray-500 text-sm text-center py-2">Fechado</p>
            )}
          </div>
        ))}
      </div>

      {/* Info Card */}
      <div className="px-5 pb-6">
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
          <p className="text-purple-700 text-sm mb-2">
            💡 <strong>Importante:</strong>
          </p>
          <ul className="text-purple-700 text-sm space-y-1 ml-4">
            <li>• Os horários definem quando as clientes podem agendar</li>
            <li>• Você pode bloquear horários específicos no calendário</li>
            <li>• Dias fechados não aparecem como opção no agendamento</li>
          </ul>
        </div>
      </div>

      {/* Save Button */}
      {hasChanges && (
        <div className="fixed bottom-18 left-0 right-0 bg-white border-t border-gray-200 px-5 py-4 shadow-lg">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`w-full max-w-md mx-auto py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
              isSaving
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-accent text-white hover:shadow-xl'
            }`}
          >
            {isSaving ? (
              <>
                <Loader size={20} className="animate-spin" />
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <Check size={20} />
                <span>Salvar Alterações</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

