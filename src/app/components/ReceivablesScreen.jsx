import { useState } from 'react';
import { Check, DollarSign, AlertCircle } from 'lucide-react';

export function ReceivablesScreen() {
  const [activeTab, setActiveTab] = useState('receive');
  const [paidItems, setPaidItems] = useState([]);

  const receivables = [
    { id: '1', client: 'Maria Silva', amount: 'R$ 120', dueDate: '2025-12-20', status: 'pending' },
    { id: '2', client: 'Ana Costa', amount: 'R$ 85', dueDate: '2025-12-15', status: 'overdue' },
    { id: '3', client: 'Julia Santos', amount: 'R$ 150', dueDate: '2025-12-22', status: 'pending' },
    { id: '4', client: 'Carla Oliveira', amount: 'R$ 95', dueDate: '2025-12-18', status: 'overdue' },
    { id: '5', client: 'Beatriz Lima', amount: 'R$ 200', dueDate: '2025-12-25', status: 'pending' },
  ];

  const credits = [
    { id: '1', client: 'Patricia Alves', amount: 'R$ 300', sessions: '3 sessions left' },
    { id: '2', client: 'Fernanda Rocha', amount: 'R$ 450', sessions: '5 sessions left' },
    { id: '3', client: 'Sofia Martins', amount: 'R$ 180', sessions: '2 sessions left' },
    { id: '4', client: 'Isabela Santos', amount: 'R$ 600', sessions: '6 sessions left' },
  ];

  const togglePaid = (id) => {
    setPaidItems(prev =>
      prev.includes(id)
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  const overdueCount = receivables.filter(r => r.status === 'overdue').length;
  const totalReceivables = receivables.reduce(
    (sum, r) => sum + parseInt(r.amount.replace(/\D/g, '')),
    0
  );

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
        <div className="space-y-3">
          {receivables.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-xl p-4 shadow-md transition-all ${
                paidItems.includes(item.id) ? 'opacity-50' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-primary">{item.client}</p>
                  <p className="text-gray-600 text-sm mt-1">Due: {item.dueDate}</p>
                  {item.status === 'overdue' && (
                    <div className="flex items-center gap-1 mt-2">
                      <AlertCircle size={14} className="text-red-500" />
                      <span className="text-red-500 text-xs">Vencido</span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p
                    className={`text-xl ${
                      item.status === 'overdue' ? 'text-red-500' : 'text-gray-800'
                    }`}
                  >
                    {item.amount}
                  </p>
                </div>
              </div>
              <button
                onClick={() => togglePaid(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  paidItems.includes(item.id)
                    ? 'bg-green-100 text-green-700'
                    : 'bg-accent text-white hover:shadow-lg'
                }`}
              >
                <Check size={16} />
                <span className="text-sm">
                  {paidItems.includes(item.id) ? 'Pago' : 'Marcar como Pago'}
                </span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Prepaid Credits Tab */}
      {activeTab === 'credits' && (
        <div className="space-y-3">
          {credits.map((credit) => (
            <div key={credit.id} className="bg-white rounded-xl p-4 shadow-md">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-primary">{credit.client}</p>
                  <p className="text-gray-600 text-sm mt-1">{credit.sessions}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl text-gray-800">{credit.amount}</p>
                  <span className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs mt-1">
                    Ativo
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-accent h-2 rounded-full"
                  style={{ width: `${(parseInt(credit.sessions) / 6) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
