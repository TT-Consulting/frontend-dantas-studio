// =====================================================
// BOOKINGSCREEN CLIENT INTEGRATION - IMPLEMENTATION
// =====================================================
// This file shows the exact code needed to integrate clients
// into BookingScreen following the backend ClienteController structure

import { useState, useCallback } from 'react';
import { 
  listarClientes, 
  salvarCliente, 
  salvarAgendamento,
  buscarClientePorId,
  atualizarCliente 
} from '../../api';

// ====== STATE MANAGEMENT ======
export const useClientIntegration = () => {
  // Existing clients list
  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [clientsError, setClientsError] = useState(null);

  // Search & selection
  const [clientSearch, setClientSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTimeout, setSearchTimeout] = useState(null);

  // New client registration form
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [newClientForm, setNewClientForm] = useState({
    fullName: '',
    whatsapp: '',
    email: '',
    birthDate: '',
    gender: '',
    allergies: '',
    healthConditions: '',
    ingrowingNails: '',
    sensitivity: '',
    fungus: '',
    cep: '',
    street: '',
    neighborhood: '',
    city: '',
    number: '',
  });

  // ====== MAPPING FUNCTIONS ======
  const mapClientFromApi = useCallback((client, index) => ({
    id: String(client.idCliente ?? client.id ?? index),
    name: client.nome ?? client.nomeCliente ?? 'Cliente',
    whatsapp: client.whatsapp ?? client.telefone ?? '',
    email: client.email ?? '',
    birthDate: client.dataNascimento ?? '',
    gender: client.genero ?? '',
    allergies: client.alergias ?? '',
    healthConditions: client.condicoesSaude ?? '',
    ingrowingNails: client.possuiUnhasEncravadas ?? '',
    sensitivity: client.sensibilidade ?? '',
    fungus: client.possuiMicoseFungos ?? '',
    cep: client.cep ?? '',
    street: client.logradouro ?? '',
    neighborhood: client.bairro ?? '',
    city: client.localidade ?? '',
    number: client.numero ?? '',
    isActive: client.isAtivo !== false,
    raw: client,
  }), []);

  const mapClientForBackend = (formData) => ({
    nome: formData.fullName,
    email: formData.email || null,
    whatsapp: formData.whatsapp,
    genero: formData.gender || null,
    dataNascimento: formData.birthDate || null,
    alergias: formData.allergies || 'Nenhuma',
    condicoesSaude: formData.healthConditions || 'Nenhuma',
    possuiUnhasEncravadas: formData.ingrowingNails === 'sim',
    sensibilidadeExcessiva: formData.sensitivity === 'alta',
    possuiMicoseFungos: formData.fungus === 'sim',
    cep: formData.cep || null,
    logradouro: formData.street || null,
    bairro: formData.neighborhood || null,
    localidade: formData.city || null,
    numero: formData.number || null,
    isAtivo: true,
  });

  // ====== SEARCH WITH DEBOUNCE ======
  const handleClientSearch = (value) => {
    setClientSearch(value);

    // Clear previous timeout
    if (searchTimeout) clearTimeout(searchTimeout);

    // Only search if at least 2 characters
    if (value.trim().length < 2) {
      setClients([]);
      return;
    }

    // Debounce: wait 300ms before making the request
    const timeout = setTimeout(async () => {
      try {
        setClientsLoading(true);
        setClientsError(null);
        const data = await listarClientes(value);
        const mapped = (Array.isArray(data) ? data : []).map(mapClientFromApi);
        setClients(mapped);
      } catch (error) {
        console.error('❌ Erro ao buscar clientes:', error);
        setClientsError('Erro ao buscar clientes');
        setClients([]);
      } finally {
        setClientsLoading(false);
      }
    }, 300);

    setSearchTimeout(timeout);
  };

  // ====== SELECT EXISTING CLIENT ======
  const handleSelectClient = (client) => {
    setSelectedClient(client);
    setClientSearch('');
    setClients([]);
    setShowNewClientForm(false);
    return client.id; // Return ID for booking
  };

  // ====== NEW CLIENT FORM HANDLING ======
  const handleNewClientFormChange = (field, value) => {
    setNewClientForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateNewClient = () => {
    if (!newClientForm.fullName?.trim()) return 'Nome é obrigatório';
    if (!newClientForm.whatsapp?.trim()) return 'WhatsApp é obrigatório';
    if (newClientForm.whatsapp.length < 11) return 'WhatsApp inválido';
    return null;
  };

  // ====== CREATE NEW CLIENT ======
  const handleCreateNewClient = async () => {
    // Validate
    const validationError = validateNewClient();
    if (validationError) {
      setClientsError(validationError);
      return;
    }

    try {
      setClientsLoading(true);
      setClientsError(null);

      // Map form data to backend DTO
      const clientDTO = mapClientForBackend(newClientForm);

      // Send to backend
      const response = await salvarCliente(clientDTO);

      // Map response and set as selected
      const newClient = mapClientFromApi(response);
      setSelectedClient(newClient);

      // Reset form
      setNewClientForm({
        fullName: '',
        whatsapp: '',
        email: '',
        birthDate: '',
        gender: '',
        allergies: '',
        healthConditions: '',
        ingrowingNails: '',
        sensitivity: '',
        fungus: '',
        cep: '',
        street: '',
        neighborhood: '',
        city: '',
        number: '',
      });
      setShowNewClientForm(false);

      console.log('✅ Cliente cadastrado com sucesso:', newClient);
      return newClient.id;
    } catch (error) {
      console.error('❌ Erro ao cadastrar cliente:', error);
      setClientsError('Erro ao cadastrar cliente');
      return null;
    } finally {
      setClientsLoading(false);
    }
  };

  // ====== BOOKING WITH CLIENT ======
  const buildBookingData = (clientId, bookingFormData) => ({
    idCliente: Number(clientId),
    idServico: Number(bookingFormData.serviceId),
    dataAgendamento: bookingFormData.date,
    horaAgendamento: bookingFormData.time,
    localizacao: bookingFormData.location,
    // Add other fields as needed
  });

  return {
    // State
    clients,
    clientsLoading,
    clientsError,
    clientSearch,
    selectedClient,
    showNewClientForm,
    newClientForm,

    // Actions
    handleClientSearch,
    handleSelectClient,
    handleNewClientFormChange,
    handleCreateNewClient,
    setShowNewClientForm,
    setSelectedClient,
    buildBookingData,
    validateNewClient,
  };
};

// ====== USAGE IN BOOKINGSCREEN.JSX ======
/*

// In your BookingScreen component:
const {
  clients,
  clientsLoading,
  clientsError,
  clientSearch,
  selectedClient,
  showNewClientForm,
  newClientForm,
  handleClientSearch,
  handleSelectClient,
  handleNewClientFormChange,
  handleCreateNewClient,
  setShowNewClientForm,
  buildBookingData,
} = useClientIntegration();

// In your JSX:

// 1. Search existing clients
<div>
  <input
    type="text"
    placeholder="Buscar cliente por nome ou WhatsApp..."
    value={clientSearch}
    onChange={(e) => handleClientSearch(e.target.value)}
  />
  {clientsLoading && <Loader />}
  {clientsError && <AlertError message={clientsError} />}
  {clients.map(client => (
    <ClientOption
      key={client.id}
      client={client}
      onSelect={() => handleSelectClient(client)}
    />
  ))}
</div>

// 2. Show new client form or selected client
{!selectedClient && (
  <button onClick={() => setShowNewClientForm(true)}>
    + Novo Cliente
  </button>
)}

{showNewClientForm && (
  <NewClientForm
    data={newClientForm}
    onFieldChange={handleNewClientFormChange}
    onSubmit={handleCreateNewClient}
    loading={clientsLoading}
    error={clientsError}
  />
)}

{selectedClient && (
  <SelectedClientCard
    client={selectedClient}
    onChangeBtnClick={() => setSelectedClient(null)}
  />
)}

// 3. Submit booking with idCliente
const handleSubmitBooking = async () => {
  if (!selectedClient?.id) {
    alert('Selecione um cliente');
    return;
  }

  const bookingDTO = buildBookingData(selectedClient.id, {
    serviceId: selectedServiceId,
    date: selectedDate,
    time: selectedTime,
    location: selectedLocation,
  });

  try {
    const response = await salvarAgendamento(bookingDTO);
    console.log('✅ Agendamento criado:', response);
    // Show success and navigate back
  } catch (error) {
    console.error('❌ Erro ao criar agendamento:', error);
  }
};

*/

// ====== KEY INTEGRATION POINTS ======
/*

1. FLOW: EXISTING CLIENT
   - User types name/whatsapp
   - handleClientSearch() called with debounce
   - listarClientes(searchTerm) fetches from backend
   - mapClientFromApi() transforms response
   - User clicks client → handleSelectClient()
   - selectedClient.id sent in booking

2. FLOW: NEW CLIENT
   - User clicks "Novo Cliente"
   - Form opens with all fields
   - User fills form
   - handleCreateNewClient() validates and posts to backend
   - salvarCliente() creates new client
   - Backend returns idCliente
   - mapClientFromApi() transforms response
   - New client becomes selectedClient
   - Proceeds with booking flow

3. VALIDATION
   - Frontend: nome, whatsapp required
   - Backend: @NotBlank on ClienteDTO fields
   - Booking requires valid idCliente

4. ERROR HANDLING
   - Catch and display validation errors
   - Show loading states during requests
   - Clear forms on successful submission

*/
