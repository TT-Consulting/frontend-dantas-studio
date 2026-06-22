# ✅ Backend Entity Validation & Frontend Integration Confirmation

## 🔍 Backend Entity Check (IMPORTANTE)

Para que o método `atualizar()` do ClienteController funcione corretamente, você **PRECISA VERIFICAR** se a Entity `Cliente` está implementada assim:

### ✅ CORRETO (Cliente.kt)
```kotlin
@Entity
@Table(name = "cliente")
class Cliente(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var idCliente: Int? = null,  // ⭐ VAR - MUTÁVEL (OBRIGATÓRIO)
    
    var nome: String = "",
    var email: String? = null,
    var whatsapp: String = "",
    var genero: String? = null,
    var dataNascimento: LocalDate? = null,
    var alergias: String? = null,
    var condicoesSaude: String? = null,
    var possuiUnhasEncravadas: Boolean = false,
    var sensibilidadeExcessiva: Boolean = false,
    var possuiMicoseFungos: Boolean = false,
    var cep: String? = null,
    var logradouro: String? = null,
    var bairro: String? = null,
    var localidade: String? = null,
    var numero: String? = null,
    var isAtivo: Boolean = true
)
```

### ❌ ERRADO (Não funcionará)
```kotlin
@Entity
@Table(name = "cliente")
data class Cliente(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val idCliente: Int? = null,  // ❌ VAL - IMUTÁVEL (VAI DAR ERRO!)
    
    val nome: String = "",
    // ... resto dos campos
)
```

---

## 🛡️ Por Que Isso É Crítico

Quando o controller faz:
```kotlin
dados.idCliente = id  // Tenta atribuir valor
```

Se `idCliente` for `val` (imutável), vai dar **erro de compilação**:
```
error: val cannot be reassigned
```

Se `idCliente` for `var` (mutável), funciona perfeitamente! ✅

---

## 📋 Checklist: Validar Entity Cliente

Execute esta verificação no seu projeto backend:

1. **Abra:** `src/main/kotlin/com/dantasstudio/backend/entity/Cliente.kt`

2. **Procure pela declaração da classe:**
   ```kotlin
   class Cliente(
   ```

3. **Verifique CADA propriedade:**
   - [ ] `idCliente` é `var` (não `val`)
   - [ ] `nome` é `var` (não `val`)
   - [ ] `whatsapp` é `var` (não `val`)
   - [ ] Todas as outras propriedades são `var`

4. **Se tiver `val` em algum lugar, mude para `var`**

5. **Compile o projeto:**
   ```bash
   ./gradlew clean build
   ```

---

## 🔄 Fluxo Completo de Atualização

### 1️⃣ Frontend (JavaScript) - VALIDADO ✅
```javascript
// services.js - JÁ IMPLEMENTADO CORRETAMENTE
export const atualizarCliente = (id, clienteDTO) =>
  apiClient
    .put(`/clientes/${id}`, clienteDTO)
    .then((res) => res.data)
    .catch((err) => {
      console.error(`❌ Erro ao atualizar cliente ${id}:`, err);
      throw err;
    });

// Uso no componente:
const clienteAtualizado = await atualizarCliente(123, {
  nome: "Maria Silva",
  alergias: "Alergia a acetona",
  condicoesSaude: "Diabetes tipo 2",
  // ... outros campos
});
```

### 2️⃣ Backend (Kotlin) - VERIFICAR ⚠️
```kotlin
@PutMapping("/{id}")
fun atualizar(
    @PathVariable id: Int, 
    @RequestBody @Valid dados: Cliente
): ResponseEntity<ClienteDTO> {
    if (!repository.existsById(id)) 
        return ResponseEntity.notFound().build()
    
    dados.idCliente = id  // ⭐ FUNCIONA SÓ SE idCliente for VAR
    return ResponseEntity.ok(repository.save(dados).toDTO())
}
```

### 3️⃣ Banco de Dados
```sql
UPDATE cliente 
SET nome = ?, alergias = ?, condicoes_saude = ?, ...
WHERE id_cliente = ?
```

---

## 📊 Request/Response Example

### Request
```http
PUT /clientes/123
Content-Type: application/json

{
  "nome": "Maria Silva",
  "email": "maria@email.com",
  "whatsapp": "+55 11 98765-4321",
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
  "numero": "100"
}
```

### Response (201 OK)
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "idCliente": 123,
  "nome": "Maria Silva",
  "email": "maria@email.com",
  "whatsapp": "+55 11 98765-4321",
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

---

## 🎯 Use Cases no BookingScreen

### Case 1: Atualizar Perfil Enquanto Agenda
```javascript
// Admin seleciona cliente e quer atualizar dados
const handleUpdateClientDuringBooking = async (clientId, updatedData) => {
  try {
    const updated = await atualizarCliente(clientId, updatedData);
    console.log('✅ Cliente atualizado:', updated);
    // Continua com agendamento
  } catch (error) {
    console.error('❌ Erro ao atualizar:', error);
  }
};
```

### Case 2: Atualizar Anamnese
```javascript
// Admin completa ficha de anamnese DURANTE agendamento
const handleSaveAnamneseData = async (clientId) => {
  const anamneseUpdate = {
    alergias: formData.allergies,
    condicoesSaude: formData.healthConditions,
    possuiUnhasEncravadas: formData.ingrowingNails === 'sim',
    sensibilidadeExcessiva: formData.sensitivity === 'alta',
    possuiMicoseFungos: formData.fungus === 'sim',
  };

  const updated = await atualizarCliente(clientId, anamneseUpdate);
  setSelectedClient(updated);
};
```

---

## ⚠️ Possíveis Erros & Soluções

### Erro 1: 404 Not Found
**Problema:** Cliente não existe  
**Solução:** Verificar se `idCliente` existe no banco
```javascript
// Sempre validar antes
if (!selectedClient?.id) {
  console.error('Cliente não selecionado');
  return;
}
```

### Erro 2: 400 Bad Request
**Problema:** Validação falhou (ex: email inválido)  
**Solução:** Incluir no `ClienteDTO` as validações:
```kotlin
@Email(message = "Email deve ser válido")
val email: String?
```

### Erro 3: Kotlin Compilation Error
**Problema:** `idCliente` é `val`, não `var`  
**Solução:** **VERIFICAR ENTITY**
```bash
# Backend build falhará com:
# error: val cannot be reassigned
```

---

## ✅ Validação Passo-a-Passo

### Step 1: Verificar Entity
```bash
# Abra o arquivo
C:/seu-projeto/src/main/kotlin/com/dantasstudio/backend/entity/Cliente.kt

# Procure por:
class Cliente(
    var idCliente: Int? = null,  # ✅ Correto
    val idCliente: Int? = null,  # ❌ Erro
)
```

### Step 2: Build Backend
```bash
cd seu-projeto-backend
./gradlew clean build
```

Se falhar com `val cannot be reassigned`, mude todos os `val` para `var` na Entity.

### Step 3: Test Frontend
```bash
# Terminal 1: Backend
cd seu-projeto-backend
./gradlew bootRun

# Terminal 2: Frontend
cd seu-projeto-frontend
npm run dev
```

### Step 4: Test API
```bash
# Use Postman ou curl
curl -X PUT http://localhost:8080/clientes/123 \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Updated Name",
    "alergias": "New allergies"
  }'

# Deve retornar 200 OK com dados atualizados
```

---

## 🎁 Bônus: Função Completa de Atualização para BookingScreen

Adicione isso ao seu `useClientIntegration()` hook:

```javascript
const handleUpdateClientProfile = async (clientId, updateData) => {
  if (!clientId) {
    setClientsError('Cliente não selecionado');
    return;
  }

  try {
    setClientsLoading(true);
    setClientsError(null);

    const updated = await atualizarCliente(
      Number(clientId),
      updateData
    );

    // Atualiza cliente selecionado
    const mappedUpdated = mapClientFromApi(updated);
    setSelectedClient(mappedUpdated);

    // Atualiza lista também
    setClients(prev => 
      prev.map(c => c.id === clientId ? mappedUpdated : c)
    );

    console.log('✅ Cliente atualizado:', updated);
    return mappedUpdated;
  } catch (error) {
    console.error('❌ Erro ao atualizar cliente:', error);
    setClientsError(
      error.response?.data?.message || 
      'Erro ao atualizar cliente'
    );
    return null;
  } finally {
    setClientsLoading(false);
  }
};
```

---

## 📋 Final Checklist

- [ ] Verifiquei que `idCliente` é `var` na Entity
- [ ] Backend compila sem erros
- [ ] Frontend `atualizarCliente()` está em `services.js` ✅
- [ ] Testeei PUT `/clientes/{id}` com Postman
- [ ] Integração no BookingScreen pronta
- [ ] Dados de anamnese sendo atualizados

---

## 🚀 Status

| Componente | Status | Arquivo |
|-----------|--------|---------|
| Frontend API | ✅ Pronto | services.js |
| Backend Controller | ✅ Pronto | ClienteController.kt |
| Backend Entity | ⚠️ Verificar | Cliente.kt |
| Integration | 🟡 Bloqueado por Entity | Desbloqueia após validação |

---

**Próximo Passo:** Validar Entity `Cliente` no seu backend para garantir que todos os campos são `var`, não `val`. Depois confirme comigo se passou! 🎯
