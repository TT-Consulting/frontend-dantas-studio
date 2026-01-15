import { useState } from 'react';
import { ArrowLeft, Clock, Check, ToggleLeft, ToggleRight } from 'lucide-react';

export function BusinessHours({ onBack }) {
  const [schedule, setSchedule] = useState([
    { day: 'monday', dayName: 'Segunda-feira', active: true, openTime: '09:00', closeTime: '18:00' },
    { day: 'tuesday', dayName: 'Terça-feira', active: true, openTime: '09:00', closeTime: '18:00' },
    { day: 'wednesday', dayName: 'Quarta-feira', active: true, openTime: '09:00', closeTime: '18:00' },
    { day: 'thursday', dayName: 'Quinta-feira', active: true, openTime: '09:00', closeTime: '18:00' },
    { day: 'friday', dayName: 'Sexta-feira', active: true, openTime: '09:00', closeTime: '18:00' },
    { day: 'saturday', dayName: 'Sábado', active: true, openTime: '09:00', closeTime: '17:00' },
    { day: 'sunday', dayName: 'Domingo', active: false, openTime: '09:00', closeTime: '17:00' },
  ]);

  const [hasChanges, setHasChanges] = useState(false);

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

  const handleSave = () => {
    // Here you would save to backend/state management
    alert('Horários salvos com sucesso!');
    setHasChanges(false);
  };

  const copyToAll = (dayIndex) => {
    if (confirm('Copiar este horário para todos os dias ativos?')) {
      const sourceDaySchedule = schedule[dayIndex];
      const newSchedule = schedule.map(day => ({
        ...day,
        openTime: sourceDaySchedule.openTime,
        closeTime: sourceDaySchedule.closeTime,
      }));
      setSchedule(newSchedule);
      setHasChanges(true);
    }
  };

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
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-5 py-4 shadow-lg">
          <button
            onClick={handleSave}
            className="w-full max-w-md mx-auto bg-accent text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <Check size={20} />
            <span>Salvar Alterações</span>
          </button>
        </div>
      )}
    </div>
  );
}
