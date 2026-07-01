import { useState, useEffect } from 'react';
import { ExpensesScreen } from './ExpensesScreen';
import { ReceivablesScreen } from './ReceivablesScreen';
import { financeAPI } from '../../api/finance'; // ◄ O único import necessário para a API financeira

export function FinanceScreen() {
  const [activeTab, setActiveTab] = useState('expenses');
  const [resumo, setResumo] = useState({
    totalReceitas: 0.0,
    custosOperacionais: 0.0,
    lucroLiquidoStudio: 0.0,
    retiradaPessoal: 0.0
  });
  const [loading, setLoading] = useState(true);
  const [refreshCount, setRefreshCount] = useState(0);

  const handleTransactionChange = async () => {
    setRefreshCount(prev => prev + 1);
    await carregarResumo();
  };

  const carregarResumo = async () => {
    try {
      setLoading(true);
      const dados = await financeAPI.obterResumoMensal();
      setResumo(dados);
    } catch (error) {
      console.error("Erro ao carregar o resumo no componente:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarResumo();
    setRefreshCount(prev => prev + 1);
  }, [activeTab]);

  return (
    <div className="bg-background min-h-screen pb-10">
      
      {/* Top Tabs e Mini Dashboard */}
      <div className="sticky top-0 bg-background px-5 lg:px-8 pt-6 pb-3 z-30 space-y-4">
        
        {/* Cards Rápidos de Indicadores */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500">
            <p className="text-xs text-gray-500 font-medium">Faturamento Studio</p>
            <p className="text-lg font-bold text-gray-800">
              R$ {resumo.totalReceitas.toFixed(2)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-[#8A2BE2]">
            <p className="text-xs text-gray-500 font-medium">Custos Operacionais</p>
            <p className="text-lg font-bold text-gray-800">
              R$ {resumo.custosOperacionais.toFixed(2)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-[#FF69B4]">
            <p className="text-xs text-gray-500 font-medium">Lucro Líquido</p>
            <p className="text-lg font-bold text-gray-800">
              R$ {resumo.lucroLiquidoStudio.toFixed(2)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-orange-400">
            <p className="text-xs text-gray-500 font-medium">Retiradas Pessoais</p>
            <p className="text-lg font-bold text-gray-800">
              R$ {resumo.retiradaPessoal.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Seletores de Abas */}
        <div className="flex gap-2 bg-white rounded-xl p-1 shadow-md max-w-md lg:max-w-lg">
          <button
            onClick={() => setActiveTab('expenses')}
            className={`flex-1 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'expenses'
                ? 'bg-[#8A2BE2] text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Despesas
          </button>
          <button
            onClick={() => setActiveTab('receivables')}
            className={`flex-1 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'receivables'
                ? 'bg-[#8A2BE2] text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Recebíveis
          </button>
        </div>
      </div>

      {/* Seção de Conteúdo */}
      <div className="px-5 lg:px-8 pt-2">
        {activeTab === 'expenses' ? (
          <ExpensesScreen onTransactionChange={handleTransactionChange} refreshTrigger={refreshCount} />
        ) : (
          <ReceivablesScreen onTransactionChange={handleTransactionChange} refreshTrigger={refreshCount} />
        )}
      </div>
    </div>
  );
}