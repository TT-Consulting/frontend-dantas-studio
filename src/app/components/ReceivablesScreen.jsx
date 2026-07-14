import { useState, useEffect } from 'react';
import { Check, DollarSign, AlertCircle } from 'lucide-react';
import { financeAPI } from '../../api';
import { useLanguage } from '../../context/LanguageContext'; // 🌟 Importando o hook de idioma

// Dicionário local para a tela de Recebíveis
const localTranslations = {
  'pt-BR': {
    title: 'Recebíveis & Créditos',
    subtitle: 'Acompanhe pagamentos e serviços pré-pagos',
    totalReceive: 'Total a Receber',
    tabReceive: 'A Receber',
    tabCredits: 'Créditos Pré-pagos',
    loading: 'Carregando receitas...',
    labelDate: 'Data',
    creditsFeature: 'Funcionalidade de créditos pré-pagos em desenvolvimento',
    overdueSingular: 'pagamento vencido',
    overduePlural: 'pagamentos vencidos'
  },
  'en-US': {
    title: 'Receivables & Credits',
    subtitle: 'Track payments and prepaid services',
    totalReceive: 'Total to Receive',
    tabReceive: 'To Receive',
    tabCredits: 'Prepaid Credits',
    loading: 'Loading revenues...',
    labelDate: 'Date',
    creditsFeature: 'Prepaid credits feature under development',
    overdueSingular: 'overdue payment',
    overduePlural: 'overdue payments'
  },
  'es-ES': {
    title: 'Cuentas a Cobrar & Créditos',
    subtitle: 'Haga un seguimiento de pagos y servicios prepagos',
    totalReceive: 'Total a Recibir',
    tabReceive: 'A Recibir',
    tabCredits: 'Créditos Prepagos',
    loading: 'Cargando ingresos...',
    labelDate: 'Fecha',
    creditsFeature: 'Funcionalidad de créditos prepagos en desarrollo',
    overdueSingular: 'pago vencido',
    overduePlural: 'pagos vencidos'
  }
};

export function ReceivablesScreen({ onTransactionChange, refreshTrigger = 0 }) {
  const { systemLanguage } = useLanguage(); // 🌟 Obtendo o idioma ativo globalmente
  const text = localTranslations[systemLanguage] || localTranslations['pt-BR'];

  const [activeTab, setActiveTab] = useState('receive');
  const [receivables, setReceivables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paidItems, setPaidItems] = useState([]);

  // 🌟 Função para formatar a moeda dinamicamente conforme o idioma
  const formatCurrency = (amount) => {
    if (systemLanguage === 'en-US') {
      return Number(amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    } else if (systemLanguage === 'es-ES') {
      return Number(amount).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
    }
    return Number(amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

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
        <h2 className="text-primary">{text.title}</h2>
        <p className="text-gray-600 text-sm">{text.subtitle}</p>
      </div>

      {/* Summary Card */}
      <div className="bg-primary rounded-xl p-5 mb-6 shadow-lg text-white">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-purple-200 text-sm mb-1">{text.totalReceive}</p>
            <p className="text-3xl">{formatCurrency(totalReceivables)}</p>
          </div>
          <DollarSign size={32} className="text-purple-200" />
        </div>
        {overdueCount > 0 && (
          <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2">
            <AlertCircle size={16} />
            <p className="text-sm">
              {overdueCount} {overdueCount > 1 ? text.overduePlural : text.overdueSingular}
            </p>
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
          {text.tabReceive}
        </button>
        <button
          onClick={() => setActiveTab('credits')}
          className={`flex-1 py-3 rounded-lg transition-all ${
            activeTab === 'credits'
              ? 'bg-primary text-white shadow-md'
              : 'text-gray-600'
          }`}
        >
          {text.tabCredits}
        </button>
      </div>

      {/* To Receive Tab */}
      {activeTab === 'receive' && (
        loading ? (
          <div className="text-center py-10 text-gray-500">{text.loading}</div>
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
                    <p className="text-gray-600 text-sm mt-1">{text.labelDate}: {item.dataCompetencia}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl text-gray-800">
                      {formatCurrency(item.valor)}
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
            <p className="text-gray-600 text-center">{text.creditsFeature}</p>
          </div>
        </div>
      )}
    </div>
  );
}