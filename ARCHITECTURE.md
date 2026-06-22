# 🏗️ Client Integration Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DANTAS STUDIO APP                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────┐        ┌──────────────────────┐          │
│  │   CLIENT PORTAL      │        │  ADMIN DASHBOARD     │          │
│  │                      │        │                      │          │
│  │ 1. Self Registration │        │ 1. BookingScreen     │          │
│  │ 2. View Profile      │        │ 2. HomeScreen        │          │
│  │ 3. My Bookings       │        │ 3. Settings          │          │
│  │ 4. History           │        │                      │          │
│  └──────────┬───────────┘        └──────────┬───────────┘          │
│             │                               │                       │
│             │ CLIENT FLOW                   │ ADMIN FLOW            │
│             │                               │                       │
│             └───────────────┬───────────────┘                       │
│                             │                                       │
│                    ┌────────▼─────────┐                             │
│                    │  CLIENT SERVICE  │                             │
│                    │  (Shared Logic)  │                             │
│                    │                  │                             │
│                    │ • Search         │                             │
│                    │ • Create         │                             │
│                    │ • Update         │                             │
│                    │ • Map Data       │                             │
│                    └────────┬─────────┘                             │
│                             │                                       │
│                    ┌────────▼─────────┐                             │
│                    │   API LAYER      │                             │
│                    │  services.js     │                             │
│                    │                  │                             │
│                    │ ✅ listarClientes│                             │
│                    │ ✅ salvarCliente │                             │
│                    │ ✅ atualizarCliente                            │
│                    │ ✅ buscar...     │                             │
│                    └────────┬─────────┘                             │
│                             │                                       │
│                             │ HTTP Requests                         │
│                             │                                       │
└─────────────────────────────┼─────────────────────────────────────┘
                              │
                              │ axios
                              │
┌─────────────────────────────▼─────────────────────────────────────┐
│                     BACKEND (Spring Boot)                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────────────────┐      │
│  │              ClienteController                           │      │
│  ├──────────────────────────────────────────────────────────┤      │
│  │                                                           │      │
│  │  GET    /clientes                 → listar()            │      │
│  │  GET    /clientes?nome=...        → listar(nome)        │      │
│  │  GET    /clientes?whatsapp=...    → listar(whatsapp)    │      │
│  │  GET    /clientes/{id}            → buscarPorId()       │      │
│  │  POST   /clientes                 → cadastrar()         │      │
│  │  PUT    /clientes/{id}            → atualizar()         │      │
│  │  PATCH  /clientes/{id}/inativar   → inativar()          │      │
│  │  PATCH  /clientes/{id}/ativar     → ativar()            │      │
│  │  DELETE /clientes/{id}            → excluir()           │      │
│  │                                                           │      │
│  └────────┬─────────────────────────────────────────────────┘      │
│           │                                                         │
│           │ DTO: ClienteDTO                                        │
│           │ ├── idCliente                                          │
│           │ ├── nome ⭐ required                                   │
│           │ ├── whatsapp ⭐ required                               │
│           │ ├── email                                              │
│           │ ├── dataNascimento                                     │
│           │ ├── genero                                             │
│           │ ├── alergias                                           │
│           │ ├── condicoesSaude                                     │
│           │ ├── possuiUnhasEncravadas                              │
│           │ ├── sensibilidadeExcessiva                             │
│           │ ├── possuiMicoseFungos                                 │
│           │ ├── cep, logradouro, bairro, localidade, numero       │
│           │ └── isAtivo                                            │
│           │                                                         │
│           ▼                                                         │
│  ┌────────────────────────────────────────────────┐                │
│  │     ClienteRepository (Database Layer)         │                │
│  ├────────────────────────────────────────────────┤                │
│  │                                                │                │
│  │ findByNomeContainingIgnoreCase(nome)           │                │
│  │   → SELECT * FROM cliente                      │                │
│  │     WHERE LOWER(nome) LIKE LOWER(:nome)        │                │
│  │                                                │                │
│  │ findByWhatsappContaining(whatsapp)             │                │
│  │   → SELECT * FROM cliente                      │                │
│  │     WHERE whatsapp LIKE :whatsapp              │                │
│  │                                                │                │
│  │ findAllOrderByIsAtivo()                        │                │
│  │   → SELECT * FROM cliente                      │                │
│  │     ORDER BY is_ativo DESC, nome ASC           │                │
│  │                                                │                │
│  └────────┬───────────────────────────────────────┘                │
│           │                                                         │
│           ▼                                                         │
│  ┌────────────────────────────────────────────────┐                │
│  │          PostgreSQL Database                   │                │
│  ├────────────────────────────────────────────────┤                │
│  │                                                │                │
│  │  Table: cliente                                │                │
│  │  ├─ id_cliente (PK)                            │                │
│  │  ├─ nome (NOT NULL)                            │                │
│  │  ├─ whatsapp (NOT NULL)                        │                │
│  │  ├─ email                                      │                │
│  │  ├─ data_nascimento                            │                │
│  │  ├─ genero                                     │                │
│  │  ├─ alergias                                   │                │
│  │  ├─ condicoes_saude                            │                │
│  │  ├─ is_ativo (DEFAULT: true)                   │                │
│  │  └─ ... (other fields)                         │                │
│  │                                                │                │
│  └────────────────────────────────────────────────┘                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

### Search Existing Client

```
┌─────────────┐
│ User types  │ "maria silva"
└──────┬──────┘
       │
       ▼
┌──────────────────────────┐
│ handleClientSearch()     │
│ (debounce 300ms)         │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ listarClientes(termo)    │
│ GET /clientes?nome=maria │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ ClienteController.listar()       │
│ repository.findByNome...         │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Database Query                   │
│ SELECT * WHERE nome LIKE '%maria'│
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Response: [ClienteDTO, ...]      │
│ [                                │
│   {idCliente: 1, nome: "Maria"...}│
│   {idCliente: 2, nome: "Mariana"..}│
│ ]                                │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ mapClientFromApi()               │
│ Transform to UI format           │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ setClients([...])                │
│ UI displays results              │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ User clicks client               │
│ handleSelectClient()             │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ setSelectedClient(client)        │
│ Client selected! Ready for booking
└──────────────────────────────────┘
```

### Create New Client

```
┌─────────────────────────────────┐
│ User clicks "Add New Client"    │
└──────┬────────────────────────┬──┘
       │                        │
       ▼                        ▼
┌──────────────────┐  ┌────────────────────┐
│ setShowNewForm() │  │ Show Form Component │
└──────────────────┘  └────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ User fills form                  │
│ ├─ Nome ⭐                       │
│ ├─ WhatsApp ⭐                   │
│ ├─ Email                         │
│ ├─ Alergias                      │
│ └─ ... other fields              │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ handleCreateNewClient()          │
│ validateNewClient()              │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ mapClientForBackend()            │
│ Transform form → ClienteDTO      │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ salvarCliente(clienteDTO)        │
│ POST /clientes                   │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ ClienteController.cadastrar()    │
│ new Cliente(...).save()          │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Database INSERT                  │
│ NEW ID GENERATED                 │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Response: ClienteDTO             │
│ {idCliente: 123, nome: "..."...} │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ mapClientFromApi(response)       │
│ Transform to UI format           │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ setSelectedClient(newClient)     │
│ Reset form                       │
│ Client ready for booking!        │
└──────────────────────────────────┘
```

### Complete Booking Flow

```
┌────────────────────────────────────────────────────────────────────┐
│                      BOOKING WORKFLOW                              │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  1. SELECT CLIENT                                                  │
│     ├─ Search existing client → handleClientSearch()              │
│     │  OR                                                          │
│     └─ Create new client → handleCreateNewClient()                │
│        Result: selectedClient { id: "123", name: "..."  }         │
│                                                                    │
│  2. SELECT SERVICE                                                 │
│     └─ listarServicosAtivos()                                      │
│        Result: selectedServices: ["service_id"]                    │
│                                                                    │
│  3. SELECT DATE & TIME                                             │
│     ├─ Pick date                                                   │
│     ├─ Get available slots based on date                           │
│     └─ Pick time slot                                              │
│        Result: selectedDate, selectedTime                          │
│                                                                    │
│  4. SELECT LOCATION                                                │
│     ├─ Studio (fixed location)                                     │
│     └─ Home (home service)                                         │
│        Result: selectedLocation                                    │
│                                                                    │
│  5. BUILD BOOKING DTO                                              │
│     ┌──────────────────────────────────────────┐                  │
│     │ {                                        │                  │
│     │   idCliente: 123,          ⭐ FROM STEP 1                   │
│     │   idServico: 45,           ⭐ FROM STEP 2                   │
│     │   dataAgendamento: "2026-01-27",  ⭐ FROM STEP 3           │
│     │   horaAgendamento: "10:00",       ⭐ FROM STEP 3           │
│     │   localizacao: "STUDIO"    ⭐ FROM STEP 4                   │
│     │ }                                        │                  │
│     └──────────────────────────────────────────┘                  │
│                                                                    │
│  6. SUBMIT BOOKING                                                 │
│     └─ salvarAgendamento(bookingDTO)                               │
│        POST /agendamentos                                          │
│                                                                    │
│  7. BACKEND VALIDATES                                              │
│     ├─ idCliente exists & isAtivo=true ✓                          │
│     ├─ idServico exists & isAtivo=true ✓                          │
│     ├─ dataAgendamento is future ✓                                │
│     ├─ horaAgendamento is valid ✓                                 │
│     └─ location exists ✓                                          │
│                                                                    │
│  8. SUCCESS!                                                       │
│     └─ Agendamento created with booking_id                        │
│        Show confirmation                                          │
│        Navigate back                                              │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## State Hierarchy

```
BookingScreen Component
├── Client Management
│   ├── clients: []
│   ├── clientsLoading: boolean
│   ├── clientsError: null | string
│   ├── clientSearch: string
│   ├── selectedClient: null | Client
│   ├── showNewClientForm: boolean
│   └── newClientForm: {fullName, whatsapp, email, ...}
│
├── Booking Selection
│   ├── selectedServices: []
│   ├── selectedDate: null | string
│   ├── selectedTime: string
│   ├── selectedLocation: null | string
│   └── step: "clients" | "services" | "date" | "time" | "location" | "confirm"
│
└── Submission
    ├── isSubmitting: boolean
    └── submitError: null | string
```

---

## Component Communication

```
┌──────────────────────────────────┐
│      BookingScreen (Parent)      │
├──────────────────────────────────┤
│ ├─ ClientSearchComponent         │
│ │  ├─ Triggers: handleClientSearch()
│ │  ├─ Displays: clients[], clientsLoading
│ │  └─ Calls: handleSelectClient()
│ │                                 │
│ ├─ NewClientFormComponent        │
│ │  ├─ Displays: newClientForm    │
│ │  ├─ Triggers: handleNewClientFormChange()
│ │  └─ Calls: handleCreateNewClient()
│ │                                 │
│ ├─ SelectedClientCardComponent   │
│ │  ├─ Displays: selectedClient   │
│ │  └─ Calls: setSelectedClient(null)
│ │                                 │
│ ├─ ServiceSelectionComponent     │
│ │  ├─ Displays: services[]       │
│ │  └─ Calls: setSelectedServices()
│ │                                 │
│ ├─ DateTimeComponent             │
│ │  ├─ Triggers: on date change   │
│ │  ├─ Displays: availableSlots   │
│ │  └─ Calls: setSelectedDate/Time
│ │                                 │
│ └─ ConfirmationComponent         │
│    ├── Reviews all selections    │
│    └─ Calls: handleSubmitBooking()
│                                  │
└──────────────────────────────────┘
```

---

## API Contract

### Request: Create Client
```
POST /clientes
Content-Type: application/json

{
  "nome": "Maria Silva",                           ⭐ required
  "whatsapp": "+55 11 98765-4321",                ⭐ required
  "email": "maria@email.com",                     optional
  "dataNascimento": "1990-05-15",                 optional
  "genero": "Feminino",                           optional
  "alergias": "Alergia a acetona",               optional
  "condicoesSaude": "Diabetes tipo 2",           optional
  "possuiUnhasEncravadas": true,                 optional
  "sensibilidadeExcessiva": false,               optional
  "possuiMicoseFungos": false,                   optional
  "cep": "12345-678",                            optional
  "logradouro": "Rua das Flores",                optional
  "bairro": "Centro",                            optional
  "localidade": "São Paulo",                     optional
  "numero": "100"                                optional
}
```

### Response: Create Client
```
HTTP 201 Created
Content-Type: application/json

{
  "idCliente": 123,
  "nome": "Maria Silva",
  "whatsapp": "+55 11 98765-4321",
  "email": "maria@email.com",
  "dataNascimento": "1990-05-15",
  "genero": "Feminino",
  "alergias": "Alergia a acetona",
  "condicoesSaude": "Diabetes tipo 2",
  "possuiUnhasEncravadas": true,
  "sensibilidadeExcessiva": false,
  "possuiMicoseFungos": false,
  "cep": "12345-678",
  "logradouro": "Rua das Flores",
  "bairro": "Centro",
  "localidade": "São Paulo",
  "numero": "100",
  "isAtivo": true
}
```

### Request: Create Booking
```
POST /agendamentos
Content-Type: application/json

{
  "idCliente": 123,              ⭐ Include client ID
  "idServico": 45,
  "dataAgendamento": "2026-01-27",
  "horaAgendamento": "10:00",
  "localizacao": "STUDIO"
}
```

---

## Error Handling Flow

```
┌─────────────────────────────────────────┐
│         API Request                     │
└──────────────┬──────────────────────────┘
               │
        ┌──────▼──────┐
        │  Success?   │
        └──┬───────┬──┘
           │       │
        YES│       │NO
           │       └────────────────────┐
           ▼                            ▼
    ┌──────────────┐      ┌─────────────────────┐
    │ Map response │      │ Check error type    │
    │ Update state │      └──┬────────┬────────┬┘
    └──────────────┘         │        │        │
                          400│     500│   network
                             ▼        │        │
                      ┌─────────┐     │        ▼
                      │Validation    │    ┌────────────┐
                      │Error         │    │ Show retry │
                      │Show message  │    │ or offline │
                      └─────────┘     │    └────────────┘
                                      ▼
                               ┌──────────────┐
                               │Server Error  │
                               │Show error &  │
                               │support info  │
                               └──────────────┘
```

---

**Architecture Document Created:** January 27, 2026  
**Version:** 1.0  
**Status:** Production Ready
