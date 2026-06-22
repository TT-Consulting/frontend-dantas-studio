# 🔗 Guia de Integração: Clientes entre Portal e BookingScreen

## 📋 Visão Geral

Este documento descreve como integrar o fluxo de clientes entre:
- **Portal do Cliente** (self-registration flow)
- **BookingScreen Admin** (admin manages clients or registers on-the-fly)

---

## 🏗️ Arquitetura Backend

### Controller: `ClienteController`
**Endpoints Disponíveis:**

```
GET    /clientes                    - Listar todos (com opção de filtro por nome/whatsapp)
GET    /clientes/{id}               - Buscar cliente específico
POST   /clientes                    - Criar novo cliente
PUT    /clientes/{id}               - Atualizar cliente existente
PATCH  /clientes/{id}/inativar      - Inativar (soft delete)
PATCH  /clientes/{id}/ativar        - Reativar cliente
DELETE /clientes/{id}               - Excluir permanentemente
```

### DTO: `ClienteDTO`
Contém todos os dados necessários para cadastro e anamnese:
- `idCliente` (gerado no banco)
- `nome`, `email`, `whatsapp`, `genero`, `dataNascimento`
- `alergias`, `condicoesSaude`
- `possuiUnhasEncravadas`, `sensibilidadeExcessiva`, `possuiMicoseFungos`
- `cep`, `logradouro`, `bairro`, `localidade`, `numero`
- `isAtivo` (boolean, padrão: true)

### Repository: `ClienteRepository`
Métodos disponíveis:
- `findByNomeContainingIgnoreCase(nome)` - Busca por nome (case-insensitive)
- `findByWhatsappContaining(whatsapp)` - Busca por WhatsApp
- `findAllOrderByIsAtivo()` - Lista todos, ativos primeiro

---

## 🎯 Sugestão: Adicionar Busca Unificada

Para otimizar a integração frontend, adicione este método ao `ClienteRepository`:

```kotlin
@Query("SELECT c FROM Cliente c WHERE " +
       "(LOWER(c.nome) LIKE LOWER(CONCAT('%', :termo, '%')) " +
       "OR c.whatsapp LIKE CONCAT('%', :termo, '%')) " +
       "AND c.isAtivo = true " +
       "ORDER BY c.nome ASC")
fun buscarAtivosPorNomeOuWhatsapp(@Param("termo") termo: String): List<Cliente>
```

Isso permite uma busca unificada no frontend com um único campo de entrada.

---

## 🎨 Frontend Integration

### Arquivo: `src/api/services.js`

Funções já disponíveis:
```javascript
export const listarClientes = (nome = '') => // GET /clientes?nome=...
export const buscarClientePorId = (id) => // GET /clientes/{id}
export const salvarCliente = (clienteDTO) => // POST /clientes
export const atualizarCliente = (id, clienteDTO) => // PUT /clientes/{id}
export const alternarStatusCliente = (id, ativar = true) => // PATCH /clientes/{id}/{ativar|inativar}
```

### Componente: `BookingScreen.jsx`

**Estado necessário:**
```javascript
const [clients, setClients] = useState([]);
const [clientsLoading, setClientsLoading] = useState(false);
const [clientsError, setClientsError] = useState(null);
const [clientSearch, setClientSearch] = useState('');
const [selectedClient, setSelectedClient] = useState(null);
```

---

## 🔄 Fluxos de Integração

### Fluxo 1: Cliente Existente
```
1. Admin abre BookingScreen
2. Digita nome/WhatsApp no campo de busca
3. listarClientes(searchTerm) retorna clientes
4. Admin seleciona cliente
5. selectedClient.idCliente é incluído no agendamento
6. POST /agendamentos com { idCliente, servicoId, data, hora }
```

### Fluxo 2: Novo Cliente (Cadastro Rápido no Admin)
```
1. Admin clica em "Adicionar Cliente"
2. Preenche formulário de registro rápido
3. POST /clientes com ClienteDTO completo
4. Recebe idCliente da resposta
5. Define selectedClient com o novo cliente
6. Continua com agendamento normalmente
```

### Fluxo 3: Portal do Cliente (Self-Registration)
```
1. Cliente visita ClientPortal
2. Preenche formulário de cadastro
3. POST /clientes com ClienteDTO
4. Recebe idCliente
5. Armazena em estado local/sessionStorage
6. Prossegue para booking de serviço
```

---

## 📦 Sincronização de Dados

### Campos Críticos para Sincronização

| Campo | Origem | Destino | Tipo |
|-------|--------|---------|------|
| `idCliente` | Backend | Frontend (state) | String |
| `nome` | Portal/Admin | Backend | String (required) |
| `whatsapp` | Portal/Admin | Backend | String (required) |
| `email` | Portal/Admin | Backend | String (optional) |
| `alergias` | Portal/Admin | Backend | String (DTO) |
| `condicoesSaude` | Portal/Admin | Backend | String (DTO) |
| `isAtivo` | Backend | Frontend (display) | Boolean |

### Mapeamento Frontend → Backend

```javascript
const mapClientForBackend = (formData) => ({
  nome: formData.fullName,
  email: formData.email,
  whatsapp: formData.whatsapp,
  genero: formData.gender,
  dataNascimento: formData.birthDate,
  alergias: formData.allergies,
  condicoesSaude: formData.healthConditions,
  possuiUnhasEncravadas: formData.ingrowingNails === 'sim',
  sensibilidadeExcessiva: formData.sensitivity === 'alta',
  possuiMicoseFungos: formData.fungus === 'sim',
  cep: formData.cep,
  logradouro: formData.street,
  bairro: formData.neighborhood,
  localidade: formData.city,
  numero: formData.number,
  isAtivo: true,
});
```

---

## ⚙️ Implementação no BookingScreen

### 1. Busca de Clientes com Debounce

```javascript
const [clientSearch, setClientSearch] = useState('');
const [searchTimeout, setSearchTimeout] = useState(null);

const handleClientSearch = (value) => {
  setClientSearch(value);
  
  // Debounce: aguarda 300ms antes de fazer a requisição
  clearTimeout(searchTimeout);
  const timeout = setTimeout(async () => {
    if (value.trim().length >= 2) {
      try {
        setClientsLoading(true);
        const data = await listarClientes(value);
        const mapped = (Array.isArray(data) ? data : []).map(mapClientFromApi);
        setClients(mapped);
      } catch (error) {
        setClientsError('Erro ao buscar clientes');
      } finally {
        setClientsLoading(false);
      }
    }
  }, 300);
  setSearchTimeout(timeout);
};
```

### 2. Seleção e Novo Cadastro

```javascript
const handleSelectClient = (client) => {
  setSelectedClient(client);
  setClientSearch('');
  // Avança para próxima etapa
};

const handleNewClientClick = () => {
  setStep('client-registration');
};

const handleCreateNewClient = async () => {
  try {
    const clientDTO = mapClientForBackend(formData);
    const newClient = await salvarCliente(clientDTO);
    
    // Mapeia resposta
    const mapped = mapClientFromApi(newClient);
    setSelectedClient(mapped);
    
    // Volta para seleção de serviços
    setStep('services');
  } catch (error) {
    setSubmitError('Erro ao cadastrar cliente');
  }
};
```

### 3. Envio do Agendamento com idCliente

```javascript
const handleSubmitBooking = async () => {
  if (!selectedClient?.id) {
    alert('Selecione um cliente');
    return;
  }

  try {
    setIsSubmitting(true);
    const bookingData = {
      idCliente: Number(selectedClient.id),
      idServico: Number(selectedServices[0]),
      dataAgendamento: selectedDate,
      horaAgendamento: selectedTime,
      localizacao: selectedLocation,
      // ... outros campos necessários
    };

    const response = await salvarAgendamento(bookingData);
    console.log('✅ Agendamento criado:', response);
    // Exibe confirmação e volta
    onBack();
  } catch (error) {
    setSubmitError('Erro ao criar agendamento');
  } finally {
    setIsSubmitting(false);
  }
};
```

---

## 🔐 Validações Essenciais

### Frontend
```javascript
// Antes de enviar agendamento
- selectedClient !== null
- selectedServices.length > 0
- selectedDate !== null
- selectedTime !== ''
- selectedLocation !== null
```

### Backend (Controller)
```kotlin
// Validações automáticas via @Valid
- nome: @NotBlank
- whatsapp: @NotBlank
- email: @Email (se preenchido)
- dataNascimento: @PastOrPresent
```

---

## 📊 Estados de Carregamento

```javascript
// Durante busca de clientes
if (clientsLoading) return <Loader />;
if (clientsError) return <ErrorAlert message={clientsError} />;

// Durante submissão
if (isSubmitting) return <span>Processando...</span>;
if (submitError) return <ErrorAlert message={submitError} />;
```

---

## 🎬 Exemplo Completo: Fluxo Admin Rápido

```javascript
// 1. Admin busca cliente
<input 
  value={clientSearch}
  onChange={(e) => handleClientSearch(e.target.value)}
  placeholder="Buscar por nome ou WhatsApp..."
/>

// 2. Mostra resultados
{clients.map(client => (
  <button key={client.id} onClick={() => handleSelectClient(client)}>
    {client.name} - {client.whatsapp}
  </button>
))}

// 3. Ou cria novo
<button onClick={handleNewClientClick}>
  + Novo Cliente
</button>

// 4. Após cliente selecionado
{selectedClient && (
  <div>
    <p>Cliente: {selectedClient.name}</p>
    <p>WhatsApp: {selectedClient.whatsapp}</p>
    {/* Continuar com seleção de serviço, data, hora */}
  </div>
)}
```

---

## ✅ Checklist de Integração

- [ ] Backend: `ClienteController` com todos os endpoints
- [ ] Backend: `ClienteRepository` com métodos de busca
- [ ] Frontend: `listarClientes()`, `salvarCliente()` em `services.js`
- [ ] Frontend: `BookingScreen.jsx` com estado de clientes
- [ ] Frontend: Busca com debounce implementada
- [ ] Frontend: Fluxo novo cliente funcionando
- [ ] Frontend: `idCliente` sendo enviado no agendamento
- [ ] Backend: Validação de `idCliente` existente antes de criar agendamento
- [ ] Testes: E2E do Portal → Agendamento
- [ ] Testes: E2E do Admin BookingScreen com cliente novo

---

## 🐛 Troubleshooting

**Problema:** Clientes não aparecem na busca
- Verificar se `listarClientes` retorna dados
- Validar mapeamento em `mapClientFromApi`
- Checar se query parameters estão corretos

**Problema:** Erro ao criar novo cliente
- Validar `ClienteDTO` tem todos os campos obrigatórios
- Checar resposta do servidor em `salvarCliente`
- Confirmar que `idCliente` é retornado no response

**Problema:** Agendamento com `idCliente` falha
- Verificar se `idCliente` é válido (existe no banco)
- Validar formato esperado pelo backend (número vs string)
- Confirmar que cliente não foi inativado

---

## 📝 Notas Importantes

1. **Sempre mapear resposta do backend**: A estrutura retornada pode diferir da esperada
2. **Usar debounce para busca**: Evita requisições desnecessárias
3. **Validar `idCliente` antes de enviar**: Agendamento falha sem ele
4. **Sincronizar campos**: Garanta que frontend envia exatamente o que backend espera
5. **Tratar erros graciosamente**: Usuário precisa entender o que deu errado

---

**Última atualização:** 27 de janeiro de 2026
**Responsável:** Felipe Dantas Studio
