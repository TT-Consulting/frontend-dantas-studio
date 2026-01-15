import { useState } from 'react';
import { DollarSign, Calendar as CalendarIcon, Plus } from 'lucide-react';

export function ExpensesScreen() {
  const [isBusiness, setIsBusiness] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [date, setDate] = useState('2025-12-18');

  const expenses = [
    { id: 1, description: 'Nail Polish Supplies', value: 'R$ 350', date: '2025-12-15', type: 'business' },
    { id: 2, description: 'Salon Rent', value: 'R$ 1,200', date: '2025-12-10', type: 'business' },
    { id: 3, description: 'UV Lamp', value: 'R$ 450', date: '2025-12-12', type: 'business' },
    { id: 4, description: 'Grocery Shopping', value: 'R$ 280', date: '2025-12-14', type: 'personal' },
    { id: 5, description: 'Marketing Materials', value: 'R$ 150', date: '2025-12-16', type: 'business' },
    { id: 6, description: 'Personal Shopping', value: 'R$ 420', date: '2025-12-17', type: 'personal' },
  ];

  const businessTotal = expenses
    .filter(e => e.type === 'business')
    .reduce((sum, e) => sum + parseInt(e.value.replace(/\D/g, '')), 0);
  
  const personalTotal = expenses
    .filter(e => e.type === 'personal')
    .reduce((sum, e) => sum + parseInt(e.value.replace(/\D/g, '')), 0);

  const handleAddExpense = () => {
    // Handle form submission
    setShowForm(false);
    setDescription('');
    setValue('');
  };

  return (
    <div className="pb-24 px-5">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-primary">Segregação Financeira</h2>
        <p className="text-gray-600 text-sm">Acompanhe suas despesas</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-primary rounded-xl p-4 shadow-lg text-white">
          <p className="text-purple-200 text-sm mb-1">Total Empresarial</p>
          <p className="text-2xl">R$ {businessTotal.toLocaleString()}</p>
        </div>
        <div className="bg-accent rounded-xl p-4 shadow-lg text-white">
          <p className="text-pink-100 text-sm mb-1">Total Pessoal</p>
          <p className="text-2xl">R$ {personalTotal.toLocaleString()}</p>
        </div>
      </div>

      {/* Add Expense Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full bg-white rounded-xl p-4 shadow-md flex items-center justify-center gap-2 mb-6 text-primary hover:shadow-lg transition-shadow"
        >
          <Plus size={20} />
          <span>Adicionar Nova Despesa</span>
        </button>
      )}

      {/* Expense Form */}
      {showForm && (
        <div className="bg-white rounded-xl p-5 shadow-md mb-6">
          <h3 className="text-gray-800 mb-4">Nova Despesa</h3>
          
          {/* Toggle Switch */}
          <div className="mb-4">
            <label className="text-sm text-gray-600 mb-2 block">Tipo de Despesa</label>
            <div className="flex items-center gap-3 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setIsBusiness(true)}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  isBusiness ? 'bg-primary text-white shadow-md' : 'text-gray-600'
                }`}
              >
                Empresarial
              </button>
              <button
                onClick={() => setIsBusiness(false)}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  !isBusiness ? 'bg-accent text-white shadow-md' : 'text-gray-600'
                }`}
              >
                Pessoal
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 mb-2 block">Descrição</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Digite a descrição"
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-2 block">Valor</label>
              <div className="relative">
                <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-2 block">Data</label>
              <div className="relative">
                <CalendarIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 mt-5">
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleAddExpense}
              className="flex-1 py-3 bg-accent text-white rounded-xl hover:shadow-lg transition-shadow"
            >
              Salvar
            </button>
          </div>
        </div>
      )}

      {/* Expense History */}
      <div>
        <h3 className="text-gray-800 mb-3">Despesas Recentes</h3>
        <div className="space-y-3">
          {expenses.map((expense) => (
            <div key={expense.id} className="bg-white rounded-xl p-4 shadow-md">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-gray-800">{expense.description}</p>
                  <p className="text-gray-500 text-sm mt-1">{expense.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-800">{expense.value}</p>
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs mt-1 ${
                      expense.type === 'business'
                        ? 'bg-purple-100 text-primary'
                        : 'bg-pink-100 text-accent'
                    }`}
                  >
                    {expense.type === 'business' ? 'Empresarial' : 'Pessoal'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
