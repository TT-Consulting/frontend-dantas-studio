// Adicione o 'useMemo' dentro das chaves do 'react'
import { useState, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, Clock, Loader, CalendarX } from 'lucide-react';
import { buscarDisponibilidade } from '../../api';

export function DateTimeSelection({ selectedServices, selectedDate, setSelectedDate, selectedTime, setSelectedTime, onNext }) {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false); // ✅ Controle para saber se já rodou a busca

  useEffect(() => {
    if (!selectedDate || selectedServices.length === 0) return;

    const carregarSlots = async () => {
      setSlotsLoading(true);
      setHasSearched(false);
      try {
        const ano = selectedDate.getFullYear();
        const mes = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const dia = String(selectedDate.getDate()).padStart(2, '0');
        const dataStr = `${ano}-${mes}-${dia}`;

        const idsDosServicos = selectedServices.map(
          (servico) => parseInt(servico.idServico || servico.id, 10)
        );

        const slots = await buscarDisponibilidade(dataStr, idsDosServicos);
        setAvailableSlots(slots);
      } catch (err) {
        console.error("Erro ao carregar slots livres:", err);
      } finally {
        setSlotsLoading(false);
        setHasSearched(true); // ✅ Busca finalizada
      }
    };

    carregarSlots();
  }, [selectedDate, selectedServices]);

  // ✅ Filtra para ver se existe pelo menos um horário com 'disponivel = true'
  const possuiHorariosLivres = useMemo(() => {
    return availableSlots.some(slot => slot.disponivel === true);
  }, [availableSlots]);

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
          onChange={(e) => {
            const valorInput = e.target.value; // Ex: "2026-07-15"
            if (valorInput) {
              // Adicionar 'T00:00' força a criação da data no fuso horário local da máquina
              setSelectedDate(new Date(`${valorInput}T00:00`));
            } else {
              setSelectedDate(null);
            }
            setSelectedTime(''); // Limpa o horário se mudar a data
          }}
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
          ) : hasSearched && !possuiHorariosLivres ? (
            // 🚨 ✅ ESTADO VAZIO: Mensagem amigável caso não haja nenhuma vaga no dia
            <div className="flex flex-col items-center justify-center text-center py-8 px-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 animate-fadeIn">
              <CalendarX className="text-gray-400 mb-2" size={36} />
              <p className="text-sm font-medium text-gray-600">Nenhum horário disponível para este dia.</p>
              <p className="text-xs text-gray-400 mt-1">Todos os horários estão preenchidos ou o Studio estará fechado. Por favor, selecione outra data!</p>
            </div>
          ) : (
            // 🔑 Exibe a grade se houver horários
            <div className="grid grid-cols-3 gap-2">
              {availableSlots.map((slot) => (
                <button
                  key={slot.hora}
                  disabled={!slot.disponivel}
                  onClick={() => setSelectedTime(slot.hora)}
                  className={`p-3 text-center rounded-xl font-medium text-sm transition-all border ${selectedTime === slot.hora
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
        disabled={!selectedDate || !selectedTime || (hasSearched && !possuiHorariosLivres)}
        className="w-full bg-accent text-white py-4 rounded-xl font-semibold shadow-md disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
      >
        Avançar para Identificação
      </button>
    </div>
  );
}