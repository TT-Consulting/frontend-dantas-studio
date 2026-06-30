import React, { useState, useEffect } from 'react';
import { X, Loader } from 'lucide-react';
import { buscarDisponibilidade } from '../../api'; // Importando a função real de busca

export function NewAppointmentModal({
    show,
    onClose,
    newAppointment,
    handleNewAppointmentChange,
    services,
    servicesLoading,
    servicesError,
    clients,
    handleSaveNewAppointment
}) {
    // Estados internos para gerenciar a busca dinâmica de horários livres
    const [availableSlots, setAvailableSlots] = useState([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [slotsError, setSlotsError] = useState(null);

    // Efeito disparado sempre que a data ou o serviço selecionado mudar
    useEffect(() => {
        const fetchAvailableSlots = async () => {
            // Só busca se houver data e serviço definidos
            if (!newAppointment.date || !newAppointment.service) {
                setAvailableSlots([]);
                return;
            }

            setSlotsLoading(true);
            setSlotsError(null);

            try {
                // Passa os argumentos separados exatamente como a assinatura da função exige
                const dataParam = newAppointment.date; // String "YYYY-MM-DD"
                const idServicosParam = [parseInt(newAppointment.service)]; // Array de ID [2]

                // Executa a chamada passando os dois argumentos separados
                const response = await buscarDisponibilidade(dataParam, idServicosParam);

                // O backend retorna uma lista de objetos: [{ hora: "09:00", disponivel: true }]
                // Mapeia para salvar apenas a string do horário se estiver disponível
                const slotsLivres = response
                    ? response.filter(slot => slot.disponivel).map(slot => slot.hora)
                    : [];

                setAvailableSlots(slotsLivres);
            } catch (err) {
                console.error("Erro ao buscar horários disponíveis:", err);
                setSlotsError("Erro ao carregar horários para esta data.");
                setAvailableSlots([]);
            } finally {
                setSlotsLoading(false);
            }
        };

        if (show) {
            fetchAvailableSlots();
        }
    }, [newAppointment.date, newAppointment.service, newAppointment.location, show]);

    // Limpa o horário selecionado se o usuário mudar de data ou serviço para evitar agendamentos inválidos
    const handleDateChange = (e) => {
        handleNewAppointmentChange('time', '');
        handleNewAppointmentChange('date', e.target.value);
    };

    const handleServiceChange = (e) => {
        handleNewAppointmentChange('time', '');
        handleNewAppointmentChange('service', e.target.value);
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">

                {/* Cabeçalho */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
                    <h2 className="text-lg font-semibold text-gray-800">Novo Agendamento Manual</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="text-gray-600" size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4">

                    {/* Campo de Serviço */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Serviço</label>
                        <select
                            value={newAppointment.service}
                            onChange={handleServiceChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                        >
                            <option value="">Selecione um serviço</option>
                            {servicesLoading && <option disabled>Carregando serviços...</option>}
                            {servicesError && <option disabled>{servicesError}</option>}
                            {services.map((service) => (
                                <option key={service.idServico} value={service.idServico}>
                                    {service.nomeServico} — R$ {service.precoBase}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Campo de Local de Atendimento */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Local</label>
                        <select
                            value={newAppointment.location}
                            onChange={(e) => {
                                handleNewAppointmentChange('time', '');
                                handleNewAppointmentChange('location', e.target.value);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                        >
                            <option value="Studio">Studio — Rua Principal, 123</option>
                            <option value="Domicilio">Atendimento a Domicílio</option>
                        </select>
                    </div>

                    {/* Campo de Seleção de Data */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
                        <input
                            type="date"
                            value={newAppointment.date}
                            min={new Date().toISOString().split('T')[0]} // Impede retroceder para datas passadas
                            onChange={handleDateChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    {/* Grid de Horários Reais */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Horários Disponíveis
                            {slotsLoading && <Loader className="animate-spin inline-block ml-2 text-primary" size={14} />}
                        </label>

                        {!newAppointment.date || !newAppointment.service ? (
                            <p className="text-xs text-gray-400 bg-gray-50 border border-dashed p-3 rounded-lg text-center">
                                Selecione um serviço e uma data para checar a disponibilidade real.
                            </p>
                        ) : slotsError ? (
                            <p className="text-xs text-red-500 bg-red-50 border border-red-100 p-3 rounded-lg text-center">
                                {slotsError}
                            </p>
                        ) : availableSlots.length === 0 && !slotsLoading ? (
                            <p className="text-xs text-yellow-600 bg-yellow-50 border border-yellow-100 p-3 rounded-lg text-center">
                                Nenhum horário disponível encontrado para este dia.
                            </p>
                        ) : (
                            <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1">
                                {availableSlots.map((slot) => (
                                    <button
                                        key={slot}
                                        type="button"
                                        onClick={() => handleNewAppointmentChange('time', slot)}
                                        className={`px-2 py-2 rounded-lg text-sm font-medium transition-all ${newAppointment.time === slot
                                            ? 'bg-primary text-white shadow-md'
                                            : 'bg-white border border-gray-300 text-gray-700 hover:border-primary hover:text-primary'
                                            }`}
                                    >
                                        {slot}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Selecionar Cliente Real */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
                        <select
                            value={newAppointment.clientId}
                            onChange={(e) => handleNewAppointmentChange('clientId', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                        >
                            <option value="">Selecione uma cliente</option>
                            {clients.map((client) => (
                                <option key={client.id} value={client.idCliente}>
                                    {client.name} {client.phone ? `(${client.phone})` : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Rodapé de Ações */}
                <div className="p-6 border-t border-gray-200 flex gap-3 bg-white sticky bottom-0 z-10">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={handleSaveNewAppointment}
                        disabled={!newAppointment.service || !newAppointment.date || !newAppointment.time || !newAppointment.clientId || slotsLoading}
                        className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium shadow-md transition-all hover:bg-primary/95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Confirmar Agendamento
                    </button>
                </div>
            </div>
        </div>
    );
}