# ⚡ Quick Start: Client Integration

## 🎯 Current Status

✅ **Backend ready:** `ClienteController` handles all client operations  
✅ **Frontend APIs ready:** All services.js functions available  
✅ **HomeScreen fixed:** Component structure corrected  
⏳ **BookingScreen:** Ready for client integration  

---

## 🚀 Immediate Next Steps

### Step 1: Verify HomeScreen Builds
```bash
cd "c:/Users/DELL_GUUH/Documents/Dantas Studio/Studio-front/dantas-studio"
npm run dev
```
Should see dev server running without errors on HomeScreen.

### Step 2: Open Reference Files
Inside your workspace:
- `INTEGRATION_GUIDE.md` - Full architecture
- `IMPLEMENTATION_SUMMARY.md` - Checklist & overview
- `BOOKINGSCREEN_CLIENT_INTEGRATION.js` - Copy-paste code
- `BACKEND_IMPROVEMENTS.md` - Optional backend enhancement

### Step 3: Quick Copy-Paste Integration

In `BookingScreen.jsx`, add this near the top:

```javascript
// Import the integration hook from the reference file
// (You'll create this custom hook based on BOOKINGSCREEN_CLIENT_INTEGRATION.js)

const useClientIntegration = () => {
  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);

  // Copy mapClientFromApi from BOOKINGSCREEN_CLIENT_INTEGRATION.js
  // Copy handleClientSearch from BOOKINGSCREEN_CLIENT_INTEGRATION.js
  // Copy handleCreateNewClient from BOOKINGSCREEN_CLIENT_INTEGRATION.js
  // ... etc
};
```

---

## 🔗 Three Integration Flows

### Flow A: Search Existing Client (Fastest)
```
1. User types in search field
2. listarClientes(searchTerm) called
3. Results display
4. Click to select
5. Include idCliente in booking

Code: see BOOKINGSCREEN_CLIENT_INTEGRATION.js - handleClientSearch()
```

### Flow B: Create New Client (Admin)
```
1. Click "Add New Client"
2. Fill quick form
3. salvarCliente(data) creates it
4. Backend returns idCliente
5. Use in booking

Code: see BOOKINGSCREEN_CLIENT_INTEGRATION.js - handleCreateNewClient()
```

### Flow C: Portal Registration (Self-Service)
```
1. Client fills ClientPortal form
2. salvarCliente(data)
3. Store returned idCliente
4. Proceed to booking

Code: Similar to Flow B
```

---

## 📝 Essential Code Blocks

### 1. Search with Debounce
```javascript
const handleClientSearch = (value) => {
  setClientSearch(value);
  clearTimeout(searchTimeout);
  
  if (value.trim().length < 2) {
    setClients([]);
    return;
  }

  const timeout = setTimeout(async () => {
    try {
      const data = await listarClientes(value);
      setClients((Array.isArray(data) ? data : []).map(mapClientFromApi));
    } catch (error) {
      console.error('Search error:', error);
    }
  }, 300);
  
  setSearchTimeout(timeout);
};
```

### 2. Map API Response
```javascript
const mapClientFromApi = (client) => ({
  id: String(client.idCliente ?? client.id ?? ''),
  name: client.nome ?? 'Cliente',
  whatsapp: client.whatsapp ?? '',
  email: client.email ?? '',
  allergies: client.alergias ?? '',
});
```

### 3. Create New Client
```javascript
const handleCreateNewClient = async () => {
  try {
    const clientDTO = {
      nome: fullName,
      whatsapp: whatsapp,
      email: email,
      alergias: allergies,
      // ... other required fields
    };
    
    const newClient = await salvarCliente(clientDTO);
    setSelectedClient(mapClientFromApi(newClient));
  } catch (error) {
    console.error('Create error:', error);
  }
};
```

### 4. Send Booking with Client
```javascript
const handleSubmitBooking = async () => {
  const bookingDTO = {
    idCliente: Number(selectedClient.id),  // ← KEY LINE
    idServico: Number(selectedServices[0]),
    dataAgendamento: selectedDate,
    horaAgendamento: selectedTime,
  };
  
  const response = await salvarAgendamento(bookingDTO);
  console.log('✅ Booking created:', response);
};
```

---

## ✅ Validation Rules

### Frontend Validation
```javascript
// Before sending to backend
if (!selectedClient?.id) throw 'Select a client';
if (!fullName?.trim()) throw 'Name required';
if (whatsapp.length < 11) throw 'Invalid WhatsApp';
```

### Backend Validation (Automatic)
- `ClienteDTO` has `@NotBlank` on nome, whatsapp
- Database enforces relationships
- Returns 400 if validation fails

---

## 🐛 Common Issues & Fixes

| Problem | Solution |
|---------|----------|
| "No clients found" | Check if `listarClientes` returns data in console |
| "Cannot read idCliente" | Verify `mapClientFromApi` is properly extracting ID |
| "Booking fails" | Ensure `idCliente` is sent as NUMBER not string |
| "New client fails" | Check all required DTO fields are provided |
| "Search is slow" | Already using debounce (300ms) - reduce if needed |

---

## 📊 Data Flow Diagram

```
CLIENT SEARCH FLOW:
┌─────────────────────┐
│ User types in search│
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ handleClientSearch()│ (debounced 300ms)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ listarClientes(term)│ GET /clientes?nome=term
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ mapClientFromApi()  │ Transform DTO to UI
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ setClients([...])   │ Display results
└────────────────────┘

NEW CLIENT FLOW:
┌─────────────────────┐
│ User fills form     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ validateNewClient() │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ salvarCliente(DTO)  │ POST /clientes
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ mapClientFromApi()  │ Transform response
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ setSelectedClient() │ Ready for booking
└────────────────────┘

BOOKING FLOW:
┌─────────────────────┐
│ selectedClient set  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ buildBookingData()  │ Include idCliente
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│salvarAgendamento()  │ POST /agendamentos
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ ✅ Booking created  │
└────────────────────┘
```

---

## 🎁 Ready-to-Use Components

Check the following files for complete implementations:

1. **BOOKINGSCREEN_CLIENT_INTEGRATION.js**
   - `useClientIntegration()` hook
   - All mapping functions
   - All event handlers

2. **INTEGRATION_GUIDE.md**
   - Detailed architecture
   - All three flows explained
   - Backend/frontend sync fields

3. **IMPLEMENTATION_SUMMARY.md**
   - Complete checklist
   - File status
   - Priority order

---

## 🎯 Success Markers

You'll know integration is working when:

1. ✅ HomeScreen runs without errors: `npm run dev`
2. ✅ Clients list in HomeScreen fetches from API
3. ✅ BookingScreen search returns clients
4. ✅ New client form creates client in backend
5. ✅ Booking includes `idCliente`
6. ✅ No console errors

---

## 🚦 Development Roadmap

```
PHASE 1 (DONE):
  ✅ Backend: ClienteController ready
  ✅ Frontend: API services ready
  ✅ HomeScreen: Fixed & ready for data

PHASE 2 (IN PROGRESS):
  ⏳ HomeScreen: Fetch & display clients
  ⏳ Verify clients render correctly

PHASE 3 (NEXT):
  ⏳ BookingScreen: Add search functionality
  ⏳ BookingScreen: Add new client form
  ⏳ BookingScreen: Send idCliente with booking

PHASE 4 (FINAL):
  ⏳ E2E testing: Portal → Booking → Agendamento
  ⏳ Polish UI & error handling
  ⏳ Production deployment
```

---

## 📞 Questions?

Refer to:
- **Architects:** INTEGRATION_GUIDE.md
- **Implementation:** BOOKINGSCREEN_CLIENT_INTEGRATION.js
- **Checklist:** IMPLEMENTATION_SUMMARY.md
- **Troubleshooting:** INTEGRATION_GUIDE.md#Troubleshooting

---

**You are ready to implement! 🚀**

Start with: `BOOKINGSCREEN_CLIENT_INTEGRATION.js` - copy the hook and adapt to your BookingScreen.
