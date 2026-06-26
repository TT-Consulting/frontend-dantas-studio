import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Loader } from 'lucide-react';
import { buscarDisponibilidade } from '../../api';

export function DateTimeSelection({ selectedServices, selectedDate, setSelectedDate, selectedTime, setSelectedTime, onNext }) {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  useEffect(() => {
    if (!selectedDate || selectedServices.length === 0) return;

    const carregarSlots = async () => {
      setSlotsLoading(true);
      try {
        const dataStr = selectedDate.toISOString().split('T')[0];
        const idServico = selectedServices[0].idServico || selectedServices[0].id;
        const slots = await buscarDisponibilidade(dataStr, idServico);
        setAvailableSlots(slots);
      } catch (err) {
        console.error("Erro ao carregar slots livres:", err);
      } finally {
        setSlotsLoading(false);
      }
    };

    carregarSlots();
  }, [selectedDate, selectedServices]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
        <CalendarIcon className="text-primary" size={22} /> Escolha a Data e Horário
      </h2>

      {/* Input de Data ou Calendário */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <input 
          type="date" 
          className="w-full p-3 border border-gray-200 rounded-xl focus:outline-primary"
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
        />
      </div>

      {/* Exibição dos Horários vindos da API */}
      {selectedDate && (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <Clock size={18} /> Horários Disponíveis
          </h3>

          {slotsLoading ? (
            <div className="flex justify-center py-6"><Loader className="animate-spin text-primary" /></div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {availableSlots.map((slot) => (
                <button
                  key={slot.hora}
                  disabled={!slot.disponivel}
                  onClick={() => setSelectedTime(slot.hora)}
                  className={`p-3 text-center rounded-xl font-medium text-sm transition-all border ${
                    selectedTime === slot.hora
                      ? 'bg-primary text-white border-primary'
                      : slot.disponivel 
                        ? 'bg-purple-50 text-primary border-purple-100 hover:bg-purple-100'
                        : 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                  }`}
                >
                  {slot.hora}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <button
        onClick={onNext}
        disabled={!selectedDate || !selectedTime}
        className="w-full bg-accent text-white py-4 rounded-xl font-semibold shadow-md disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
      >
        Avançar para Identificação
      </button>
    </div>
  );
}