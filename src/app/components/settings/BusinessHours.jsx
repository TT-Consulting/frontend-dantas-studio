import { useState, useEffect } from 'react';
import { ArrowLeft, Check, ToggleLeft, ToggleRight, Loader, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2'; // 🌟 Correção: Importando o SweetAlert
import { listarHorarioComercial, salvarHorarioComercial } from '../../../api';
import { useLanguage } from '../../../context/LanguageContext';

// Helpers de formatação de horário
const toHHmm = (timeStr) => {
  if (!timeStr) return '';
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
  if (parts.length === 1) {
    return `${parts[0].padStart(2, '0')}:00:00`;
  }
  return timeStr;
};

const localTranslations = {
  'pt-BR': {
    title: 'Horário Comercial',
    subtitle: 'Configure quando você atende',
    btnBack: 'Voltar',
    loading: 'Carregando horários...',
    errorLoad: 'Erro ao carregar horários. Usando padrão.',
    lblOpen: 'Abertura',
    lblClose: 'Fechamento',
    btnCopy: 'Copiar para todos os dias',
    statusClosed: 'Fechado',
    confirmCopy: 'Copiar este horário para todos os dias ativos?',
    infoTitle: 'Importante:',
    infoItems: [
      'Os horários definem quando as clientes podem agendar',
      'Você pode bloquear horários específicos no calendário',
      'Dias fechados não aparecem como opção no agendamento'
    ],
    btnSave: 'Salvar Alterações',
    btnSaving: 'Salvando...',
    swalSuccessTitle: 'Horários Atualizados!',
    swalSuccessText: 'O expediente foi alterado com sucesso. As mudanças já estão aplicadas no sistema!',
    swalSuccessBtn: 'Entendido',
    swalErrorTitle: 'Erro',
    swalErrorText: 'Não foi possível salvar as alterações de horários.',
    days: {
      monday: 'Segunda-feira',
      tuesday: 'Terça-feira',
      wednesday: 'Quarta-feira',
      thursday: 'Quinta-feira',
      friday: 'Sexta-feira',
      saturday: 'Sábado',
      sunday: 'Domingo'
    }
  },
  'en-US': {
    title: 'Business Hours',
    subtitle: 'Configure when you are available',
    btnBack: 'Back',
    loading: 'Loading schedule...',
    errorLoad: 'Error loading schedule. Using default.',
    lblOpen: 'Opening Time',
    lblClose: 'Closing Time',
    btnCopy: 'Copy to all days',
    statusClosed: 'Closed',
    confirmCopy: 'Copy this time to all active days?',
    infoTitle: 'Important:',
    infoItems: [
      'The hours define when clients can book slots',
      'You can block specific times in the calendar',
      'Closed days will not appear as booking options'
    ],
    btnSave: 'Save Changes',
    btnSaving: 'Saving...',
    swalSuccessTitle: 'Schedule Updated!',
    swalSuccessText: 'Business hours have been successfully updated. Changes are applied system-wide!',
    swalSuccessBtn: 'Got it',
    swalErrorTitle: 'Error',
    swalErrorText: 'Could not save schedule changes.',
    days: {
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday'
    }
  },
  'es-ES': {
    title: 'Horario Comercial',
    subtitle: 'Configure quando atiende',
    btnBack: 'Volver',
    loading: 'Cargando horarios...',
    errorLoad: 'Error al cargar los horarios. Usando por defecto.',
    lblOpen: 'Apertura',
    lblClose: 'Cierre',
    btnCopy: 'Copiar para todos los días',
    statusClosed: 'Cerrado',
    confirmCopy: '¿Copiar este horario para todos los días activos?',
    infoTitle: 'Importante:',
    infoItems: [
      'Los horarios definen cuándo los clientes pueden reservar',
      'Puede bloquear horarios específicos en el calendario',
      'Los días cerrados no aparecen como opción en la reserva'
    ],
    btnSave: 'Guardar Cambios',
    btnSaving: 'Guardando...',
    swalSuccessTitle: '¡Horarios Actualizados!',
    swalSuccessText: 'El horario comercial se modificó correctamente. ¡Los cambios ya están aplicados en el sistema!',
    swalSuccessBtn: 'Entendido',
    swalErrorTitle: 'Error',
    swalErrorText: 'No se pudieron guardar los cambios de horario.',
    days: {
      monday: 'Lunes',
      tuesday: 'Martes',
      wednesday: 'Miércoles',
      thursday: 'Jueves',
      friday: 'Viernes',
      saturday: 'Sábado',
      sunday: 'Domingo'
    }
  }
};

export function BusinessHours({ onBack }) {
  const { systemLanguage } = useLanguage(); // 🌟 Hook global de idioma
  const text = localTranslations[systemLanguage] || localTranslations['pt-BR'];

  const [schedule, setSchedule] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Default schedule usa as chaves fixas em inglês para controle do core
  const defaultSchedule = [
    { day: 'monday', active: true, openTime: '09:00', closeTime: '18:00' },
    { day: 'tuesday', active: true, openTime: '09:00', closeTime: '18:00' },
    { day: 'wednesday', active: true, openTime: '09:00', closeTime: '18:00' },
    { day: 'thursday', active: true, openTime: '09:00', closeTime: '18:00' },
    { day: 'friday', active: true, openTime: '09:00', closeTime: '18:00' },
    { day: 'saturday', active: true, openTime: '09:00', closeTime: '17:00' },
    { day: 'sunday', active: false, openTime: '09:00', closeTime: '17:00' },
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

    return defaultSchedule.map((defaultDay) => {
      const apiHorario = horarios.find((h) => {
        const dayKey = daysMap[h.diaSemana] || (h.day ? h.day.toLowerCase() : '');
        return dayKey === defaultDay.day;
      });

      if (apiHorario) {
        const isAtivo = apiHorario.ativo === true || apiHorario.ativo === 1;

        return {
          day: defaultDay.day,
          id: apiHorario.id || apiHorario.idHorarioComercial,
          active: isAtivo,
          openTime: toHHmm(apiHorario.horaAbertura || '09:00'),
          closeTime: toHHmm(apiHorario.horaFechamento || '18:00'),
        };
      }
      return defaultDay;
    });
  };

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
          setError(text.errorLoad);
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
  }, [systemLanguage]); // Recarrega se o idioma mudar

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
      const payload = schedule.map((item) => ({
        id: item.id || null,
        diaSemana: item.day.toUpperCase(),
        horaAbertura: toHHmmss(item.openTime),
        horaFechamento: toHHmmss(item.closeTime),
        ativo: !!item.active,
      }));

      await salvarHorarioComercial(payload);
      setHasChanges(false);

      Swal.fire({
        title: text.swalSuccessTitle,
        text: text.swalSuccessText,
        icon: 'success',
        confirmButtonColor: '#C51B53',
        confirmButtonText: text.swalSuccessBtn,
      }).then(async () => {
        try {
          const data = await listarHorarioComercial();
          const mapped = mapHorarioFromApi(data);
          setSchedule(mapped);
          console.log('✅ Estado local atualizado sem refresh de página', mapped);
        } catch (fetchErr) {
          console.error('Erro ao re-listar horários após salvar:', fetchErr);
        }
      });

    } catch (err) {
      console.error('Erro ao salvar horários comerciais:', err);
      Swal.fire({
        title: text.swalErrorTitle,
        text: text.swalErrorText,
        icon: 'error',
        confirmButtonColor: '#C51B53'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const copyToAll = (dayIndex) => {
    if (confirm(text.confirmCopy)) {
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
          <p className="text-gray-600">{text.loading}</p>
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
          <span>{text.btnBack}</span>
        </button>
        <h2 className="text-primary text-2xl">{text.title}</h2>
        <p className="text-gray-600 text-sm mt-1">{text.subtitle}</p>
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
            className={`bg-white rounded-xl p-5 shadow-md ${!daySchedule.active ? 'opacity-60' : ''}`}
          >
            <div className="flex items-center justify-between mb-4">
              {/* Buscando o nome traduzido dinamicamente baseado no 'day' do core */}
              <h3 className="text-gray-800 font-semibold">{text.days[daySchedule.day]}</h3>
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
                    <label className="text-xs text-gray-600 mb-2 block">{text.lblOpen}</label>
                    <input
                      type="time"
                      value={daySchedule.openTime}
                      onChange={(e) => updateTime(index, 'openTime', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-2 block">{text.lblClose}</label>
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
                  {text.btnCopy}
                </button>
              </>
            )}

            {!daySchedule.active && (
              <p className="text-gray-500 text-sm text-center py-2">{text.statusClosed}</p>
            )}
          </div>
        ))}
      </div>

      {/* Info Card */}
      <div className="px-5 pb-6">
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
          <p className="text-purple-700 text-sm mb-2">
            💡 <strong>{text.infoTitle}</strong>
          </p>
          <ul className="text-purple-700 text-sm space-y-1 ml-4">
            {text.infoItems.map((item, i) => (
              <li key={i}>• {item}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Save Button */}
      {hasChanges && (
        <div className="fixed bottom-18 left-0 right-0 bg-white border-t border-gray-200 px-5 py-4 shadow-lg flex justify-center">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`w-full max-w-md py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${isSaving
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
              : 'bg-accent text-white hover:shadow-xl'
              }`}
          >
            {isSaving ? (
              <>
                <Loader size={20} className="animate-spin" />
                <span>{text.btnSaving}</span>
              </>
            ) : (
              <>
                <Check size={20} />
                <span>{text.btnSave}</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}