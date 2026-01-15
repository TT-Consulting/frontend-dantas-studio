import { useState } from 'react';
import { ExpensesScreen } from './ExpensesScreen';
import { ReceivablesScreen } from './ReceivablesScreen';

export function FinanceScreen() {
  const [activeTab, setActiveTab] = useState('expenses');

  return (
    <div>
      {/* Top Tabs */}
      <div className="sticky top-0 bg-background px-5 lg:px-8 pt-6 pb-3 z-30">
        <div className="flex gap-2 bg-white rounded-xl p-1 shadow-md max-w-md lg:max-w-lg">
          <button
            onClick={() => setActiveTab('expenses')}
            className={`flex-1 py-3 rounded-lg transition-all ${
              activeTab === 'expenses'
                ? 'bg-primary text-white shadow-md'
                : 'text-gray-600'
            }`}
          >
            Despesas
          </button>
          <button
            onClick={() => setActiveTab('receivables')}
            className={`flex-1 py-3 rounded-lg transition-all ${
              activeTab === 'receivables'
                ? 'bg-primary text-white shadow-md'
                : 'text-gray-600'
            }`}
          >
            Recebíveis
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="pt-0">
        {activeTab === 'expenses' ? <ExpensesScreen /> : <ReceivablesScreen />}
      </div>
    </div>
  );
}
