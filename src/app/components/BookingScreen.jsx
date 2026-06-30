import { useState, useEffect, useMemo, useCallback } from 'react';
import { ArrowLeft, Loader, CheckCircle2 } from 'lucide-react'; // Adicionado CheckCircle2
import { criarAgendamento, listarServicosAtivos, buscarDisponibilidade, listarLocais, listarClientes } from '../../api';

import { ServiceSelection } from './ServiceSelection';
import { LocationSelection } from './LocationSelection';
import { DateTimeSelection } from './DateTimeSelection';
import { ClientIdentification } from './ClientIdentification';

export function BookingScreen({ onBack, onViewBooking }) {
    const [step, setStep] = useState('services');
    const [selectedServices, setSelectedServices] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);

    // Endereço domicílio
    const [address, setAddress] = useState({ zip: '', street: '', neighborhood: '', number: '' });

    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState('');
    const [selectedClient, setSelectedClient] = useState(null);
    const [newClientForm, setNewClientForm] = useState({ fullName: '', phone: '', email: '', instagram: '', anamnese: 'no' });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    // Estados para controle do Modal de Sucesso
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [createdBooking, setCreatedBooking] = useState(null);

    // Lógica centralizada para finalizar o agendamento montando o payload para o Kotlin
    const handleFinalizeBooking = async () => {
        if (selectedServices.length === 0 || !selectedDate || !selectedTime) {
            alert("⚠️ Por favor, preencha todos os campos do agendamento.");
            return;
        }

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            // Prepara a lista de serviços com seus IDs
            const servicosList = selectedServices.map(servico => ({
                idServico: parseInt(servico.idServico || servico.id, 10)
            }));

            const idClienteFinal = selectedClient ? (selectedClient.idCliente || selectedClient.id) : null;

            
            const ano = selectedDate.getFullYear();
            const mes = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const dia = String(selectedDate.getDate()).padStart(2, '0');
            const dataFormatada = `${ano}-${mes}-${dia}`;

            const dataHoraInicioIso = `${dataFormatada}T${selectedTime}:00`;
            // =================================================

            const dadosAgendamento = {
                dataHoraInicio: dataHoraInicioIso,
                taxaDeslocamento: selectedLocation === 'home' ? 15.0 : 0.0,
                tipoLocal: selectedLocation === 'home' ? 'DOMICILIO' : 'STUDIO',
                cepAtendimento: selectedLocation === 'home' ? (address.zip.replace(/\D/g, '') || "") : null,
                isManual: false,

                // Envia a lista de serviços
                servicos: servicosList,

                cliente: idClienteFinal
                    ? { idCliente: parseInt(idClienteFinal, 10) }
                    : {
                        nome: newClientForm.fullName,
                        whatsapp: newClientForm.phone.replace(/\D/g, ''),
                        email: newClientForm.email || null,
                        isAtivo: true
                    }
            };

            console.log("📤 Enviando payload estruturado e corrigido:", dadosAgendamento);

            const resposta = await criarAgendamento(dadosAgendamento);

            console.log("✅ Agendamento criado com sucesso no banco:", resposta);

            // Armazena o agendamento retornado pelo back e dispara o popup modal
            setCreatedBooking(resposta);
            setShowSuccessModal(true);

        } catch (err) {
            console.error("❌ Erro ao finalizar agendamento no front:", err);
            const mensagemErro = err.response?.data?.mensagem || err.response?.data?.message || "Erro ao salvar o agendamento. Verifique a console do servidor.";
            setSubmitError(mensagemErro);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Ação executada ao clicar em "Visualizar Agendamento" no modal
    const handleGoToBooking = () => {
        setShowSuccessModal(false);
        if (onViewBooking && createdBooking) {
            // Pegamos os dados do cliente que acabou de agendar
            const clienteDoAgendamento = createdBooking.cliente;

            // Enviamos para a função de redirecionamento
            onViewBooking({
                email: clienteDoAgendamento?.email || newClientForm.email || selectedClient?.email,
                phone: clienteDoAgendamento?.whatsapp || newClientForm.phone || selectedClient?.whatsapp
            });
        } else if (onBack) {
            onBack();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-28 text-gray-800">
            {/* Header Fixo */}
            <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between shadow-sm">
                <button onClick={step === 'services' ? onBack : () => setStep(step === 'location' ? 'services' : step === 'datetime' ? 'location' : 'datetime')} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
                    <ArrowLeft size={20} />
                </button>
                <div className="text-center">
                    <h1 className="font-bold text-lg text-primary">Agendamento Online</h1>
                    <p className="text-xs text-gray-500">Passo {step === 'services' ? '1/4' : step === 'location' ? '2/4' : step === 'datetime' ? '3/4' : '4/4'}</p>
                </div>
                <div className="w-9" />
            </div>

            <div className="max-w-md mx-auto px-4 pt-6">
                {submitError && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                        {submitError}
                    </div>
                )}

                {/* Renderização Condicional Limpa baseada no Step */}
                {step === 'services' && (
                    <ServiceSelection
                        selectedServices={selectedServices}
                        setSelectedServices={setSelectedServices}
                        onNext={() => setStep('location')}
                    />
                )}

                {step === 'location' && (
                    <LocationSelection
                        selectedLocation={selectedLocation}
                        setSelectedLocation={setSelectedLocation}
                        address={address}
                        setAddress={setAddress}
                        onNext={() => setStep('datetime')}
                    />
                )}

                {step === 'datetime' && (
                    <DateTimeSelection
                        selectedServices={selectedServices}
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                        selectedTime={selectedTime}
                        setSelectedTime={setSelectedTime}
                        onNext={() => setStep('client')}
                    />
                )}

                {step === 'client' && (
                    <ClientIdentification
                        selectedClient={selectedClient}
                        setSelectedClient={setSelectedClient}
                        newClientForm={newClientForm}
                        setNewClientForm={setNewClientForm}
                        onFinalize={handleFinalizeBooking}
                        isSubmitting={isSubmitting}
                    />
                )}
            </div>

            {/* ================= MODAL POPUP DE SUCESSO ================= */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl transform transition-all scale-100">
                        <div className="flex justify-center mb-4">
                            <div className="bg-green-50 p-3 rounded-full text-green-500">
                                <CheckCircle2 size={48} className="animate-bounce" />
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            Agendamento Confirmado!
                        </h3>

                        <p className="text-sm text-gray-500 mb-6">
                            Seu horário foi reservado com sucesso no nosso sistema.
                        </p>

                        <div className="flex flex-col gap-2">
                            <button
                                onClick={handleGoToBooking}
                                className="w-full py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark transition-colors shadow-md"
                            >
                                Visualizar Agendamento
                            </button>

                            <button
                                onClick={() => { setShowSuccessModal(false); if (onBack) onBack(); }}
                                className="w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                Voltar para o Início
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* ========================================================= */}
        </div>
    );
}