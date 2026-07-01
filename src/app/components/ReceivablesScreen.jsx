import { useState, useEffect } from 'react';
import { Check, DollarSign, AlertCircle } from 'lucide-react';
import { financeAPI } from '../../api';

export function ReceivablesScreen({ onTransactionChange, refreshTrigger = 0 }) {
  const [activeTab, setActiveTab] = useState('receive');
  const [receivables, setReceivables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paidItems, setPaidItems] = useState([]);

  const carregarReceitas = async () => {
    try {
      setLoading(true);
      const hoje = new Date();
      const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];
      const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split('T')[0];
      
      const transacoes = await financeAPI.listarPorPeriodo(primeiroDiaMes, ultimoDiaMes);
      const receitas = transacoes.filter(t => t.tipoTransacao === 'RECEITA');
      setReceivables(receitas);
    } catch (err) {
      console.error('❌ Erro ao carregar receitas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarReceitas();
  }, [refreshTrigger]);

  const togglePaid = async (id) => {
    if (paidItems.includes(id)) {
      setPaidItems(prev => prev.filter(itemId => itemId !== id));
    } else {
      setPaidItems(prev => [...prev, id]);
    }
  };

  const totalReceivables = receivables.reduce((sum, r) => sum + (r.valor || 0), 0);
  const overdueCount = 0;

  return (
    <div className="pb-24 px-5">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-primary">Recebíveis & Créditos</h2>
        <p className="text-gray-600 text-sm">Acompanhe pagamentos e serviços pré-pagos</p>
      </div>

      {/* Summary Card */}
      <div className="bg-primary rounded-xl p-5 mb-6 shadow-lg text-white">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-purple-200 text-sm mb-1">Total a Receber</p>
            <p className="text-3xl">R$ {totalReceivables.toLocaleString()}</p>
          </div>
          <DollarSign size={32} className="text-purple-200" />
        </div>
        {overdueCount > 0 && (
          <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2">
            <AlertCircle size={16} />
            <p className="text-sm">{overdueCount} pagamento{overdueCount > 1 ? 's' : ''} vencido{overdueCount > 1 ? 's' : ''}</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-white rounded-xl p-1 shadow-md">
        <button
          onClick={() => setActiveTab('receive')}
          className={`flex-1 py-3 rounded-lg transition-all ${
            activeTab === 'receive'
              ? 'bg-primary text-white shadow-md'
              : 'text-gray-600'
          }`}
        >
          A Receber
        </button>
        <button
          onClick={() => setActiveTab('credits')}
          className={`flex-1 py-3 rounded-lg transition-all ${
            activeTab === 'credits'
              ? 'bg-primary text-white shadow-md'
              : 'text-gray-600'
          }`}
        >
          Créditos Pré-pagos
        </button>
      </div>

      {/* To Receive Tab */}
      {activeTab === 'receive' && (
        loading ? (
          <div className="text-center py-10 text-gray-500">Carregando receitas...</div>
        ) : (
          <div className="space-y-3">
            {receivables.map((item) => (
              <div
                key={item.idTransacao}
                className={`bg-white rounded-xl p-4 shadow-md transition-all ${
                  paidItems.includes(item.idTransacao) ? 'opacity-50' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-primary">{item.descricao}</p>
                    <p className="text-gray-600 text-sm mt-1">Data: {item.dataCompetencia}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl text-gray-800">
                      R$ {item.valor.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Prepaid Credits Tab */}
      {activeTab === 'credits' && (
        <div className="space-y-3">
          <div className="bg-white rounded-xl p-4 shadow-md">
            <p className="text-gray-600 text-center">Funcionalidade de créditos pré-pagos em desenvolvimento</p>
          </div>
        </div>
      )}
    </div>
  );
}
