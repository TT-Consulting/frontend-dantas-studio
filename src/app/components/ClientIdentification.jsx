import { useState } from 'react';
import { Loader, AlertCircle, CheckCircle2, UserCheck, Search } from 'lucide-react';
import { listarClientes } from '../../api';

export function ClientIdentification({ selectedClient, setSelectedClient, newClientForm, setNewClientForm, onFinalize, isSubmitting }) {
  const [isNewClient, setIsNewClient] = useState(false);
  
  // Estados para o formulário de login/busca de cliente cadastrada
  const [loginForm, setLoginForm] = useState({ nome: '', whatsapp: '' });
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Executa a busca exata combinando Nome e WhatsApp informados
  const handleVerifyClient = async (e) => {
    e.preventDefault();
    if (!loginForm.nome.trim() || !loginForm.whatsapp.trim()) {
      setSearchError('Por favor, preencha o seu nome e o seu número de WhatsApp.');
      return;
    }

    setLoading(true);
    setSearchError('');
    setSelectedClient(null); // Reseta qualquer seleção anterior

    try {
      // Faz o GET passando os filtros para o endpoint do Kotlin (/clientes?nome=...&whatsapp=...)
      const dados = await listarClientes(loginForm.nome.trim());
      
      // Filtra no front-end para garantir que o número bate (proteção dupla)
      const clienteEncontrada = dados.find(
        c => c.whatsapp?.replace(/\D/g, '').includes(loginForm.whatsapp.replace(/\D/g, ''))
      );

      if (clienteEncontrada) {
        setSelectedClient(clienteEncontrada);
      } else {
        setSearchError('Cadastro não encontrado com os dados informados. Verifique se digitou corretamente ou vá em "Nova Cliente".');
      }
    } catch (err) {
      console.error("Erro ao verificar cliente:", err);
      setSearchError('Não encontramos seu cadastro. Se for sua primeira vez, clique em Nova Cliente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Abas de Navegação */}
      <div className="flex rounded-xl bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => { setIsNewClient(false); setSearchError(''); }}
          className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${!isNewClient ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}
        >
          Cliente Já Cadastrada
        </button>
        <button
          type="button"
          onClick={() => { setIsNewClient(true); setSelectedClient(null); }}
          className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${isNewClient ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}
        >
          Nova Cliente (Cadastro Rápido)
        </button>
      </div>

      {/* Formulários Condicionais */}
      {!isNewClient ? (
        <form onSubmit={handleVerifyClient} className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 space-y-3 shadow-sm">
            <p className="text-xs text-gray-500 mb-2">Insira seus dados cadastrados para validar o agendamento de forma segura:</p>
            
            <input
              type="text"
              placeholder="Seu Nome Completo *"
              value={loginForm.nome}
              onChange={(e) => setLoginForm({ ...loginForm, nome: e.target.value })}
              className="w-full p-3 text-sm border border-gray-200 rounded-xl focus:outline-primary"
              disabled={!!selectedClient}
            />
            <input
              type="tel"
              placeholder="Seu WhatsApp (apenas números) *"
              value={loginForm.whatsapp}
              onChange={(e) => setLoginForm({ ...loginForm, whatsapp: e.target.value })}
              className="w-full p-3 text-sm border border-gray-200 rounded-xl focus:outline-primary"
              disabled={!!selectedClient}
            />

            {searchError && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{searchError}</span>
              </div>
            )}

            {/* Sucesso: Identificou a cliente */}
            {selectedClient && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-600" />
                  <span>Olá, <strong>{selectedClient.nome}</strong>! Cadastro validado.</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => setSelectedClient(null)} 
                  className="text-xs text-primary underline font-medium"
                >
                  Alterar
                </button>
              </div>
            )}

            {!selectedClient && (
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary/10 text-primary py-3 rounded-xl font-bold text-sm hover:bg-primary/20 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader size={16} className="animate-spin" /> : <Search size={16} />}
                <span>{loading ? 'Buscando cadastro...' : 'Buscar Meu Cadastro'}</span>
              </button>
            )}
          </div>
        </form>
      ) : (
        /* Cadastro Rápido de Nova Cliente */
        <div className="bg-white p-5 rounded-2xl border border-gray-100 space-y-3 shadow-sm">
          <input
            type="text"
            placeholder="Nome Completo *"
            value={newClientForm.fullName}
            onChange={(e) => setNewClientForm({ ...newClientForm, fullName: e.target.value })}
            className="w-full p-3 text-sm border border-gray-200 rounded-xl focus:outline-primary"
          />
          
          {/* ✅ Adicionado campo de E-mail obrigatório para o backend */}
          <input
            type="email"
            placeholder="E-mail *"
            value={newClientForm.email || ''}
            onChange={(e) => setNewClientForm({ ...newClientForm, email: e.target.value })}
            className="w-full p-3 text-sm border border-gray-200 rounded-xl focus:outline-primary"
          />

          <input
            type="text"
            placeholder="WhatsApp / Telefone *"
            value={newClientForm.phone}
            onChange={(e) => setNewClientForm({ ...newClientForm, phone: e.target.value })}
            className="w-full p-3 text-sm border border-gray-200 rounded-xl focus:outline-primary"
          />
          
          {/* Anamnese Simplificada */}
          <div className="space-y-1 pt-2">
            <label className="text-xs font-bold text-gray-600 flex items-center gap-1">
              <AlertCircle size={14} className="text-amber-500" /> Possui allergy a esmalte ou gel?
            </label>
            <select
              value={newClientForm.anamnese}
              onChange={(e) => setNewClientForm({ ...newClientForm, anamnese: e.target.value })}
              className="w-full p-3 text-sm border border-gray-200 rounded-xl bg-white focus:outline-primary"
            >
              <option value="no">Não possui nenhuma alergia</option>
              <option value="yes">Sim, possui alergia</option>
              <option value="unsure">Não tenho certeza</option>
            </select>
          </div>
        </div>
      )}

      {/* Barra de Ação Fixo na Base */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-5 py-4 shadow-lg z-40">
        <div className="max-w-md mx-auto">
          <button
            onClick={onFinalize}
            /* ✅ Validação ajustada para exigir também o email se for nova cliente */
            disabled={isSubmitting || (!isNewClient && !selectedClient) || (isNewClient && (!newClientForm.fullName || !newClientForm.email))}
            className={`w-full py-4 rounded-xl shadow-lg transition-all font-semibold flex items-center justify-center gap-2 ${
              !isSubmitting ? 'bg-accent text-white hover:shadow-xl' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? <Loader size={18} className="animate-spin" /> : <UserCheck size={18} />}
            <span>{isSubmitting ? 'Finalizando...' : 'Confirmar Agendamento'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}