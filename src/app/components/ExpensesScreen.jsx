import { useState, useEffect } from 'react';
import { DollarSign, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { financeAPI } from '../../api';
import { useLanguage } from '../../context/LanguageContext'; // 🌟 Importando o hook de idioma

// Dicionário local para a tela de Despesas
const localTranslations = {
  'pt-BR': {
    title: 'Segregação Financeira',
    subtitle: 'Acompanhe suas despesas',
    totalBusiness: 'Total Empresarial',
    totalPersonal: 'Total Pessoal',
    btnAddExpense: 'Adicionar Nova Despesa',
    formTitle: 'Nova Despesa',
    formType: 'Tipo de Despesa',
    typeBusiness: 'Empresarial',
    typePersonal: 'Pessoal',
    labelDesc: 'Descrição',
    placeholderDesc: 'Digite a descrição',
    labelValue: 'Valor',
    labelDate: 'Data',
    btnCancel: 'Cancelar',
    btnSave: 'Salvar',
    filterAll: 'Todas',
    historyTitle: 'Despesas Recentes',
    loading: 'Carregando despesas...',
    alertFields: 'Por favor, preencha a descrição e o valor corretamente!'
  },
  'en-US': {
    title: 'Financial Segregation',
    subtitle: 'Track your expenses',
    totalBusiness: 'Business Total',
    totalPersonal: 'Personal Total',
    btnAddExpense: 'Add New Expense',
    formTitle: 'New Expense',
    formType: 'Expense Type',
    typeBusiness: 'Business',
    typePersonal: 'Personal',
    labelDesc: 'Description',
    placeholderDesc: 'Enter description',
    labelValue: 'Amount',
    labelDate: 'Date',
    btnCancel: 'Cancel',
    btnSave: 'Save',
    filterAll: 'All',
    historyTitle: 'Recent Expenses',
    loading: 'Loading expenses...',
    alertFields: 'Please fill in the description and amount correctly!'
  },
  'es-ES': {
    title: 'Segregación Financiera',
    subtitle: 'Haga un seguimiento de sus gastos',
    totalBusiness: 'Total Empresarial',
    totalPersonal: 'Total Personal',
    btnAddExpense: 'Añadir Nuevo Gasto',
    formTitle: 'Nuevo Gasto',
    formType: 'Tipo de Gasto',
    typeBusiness: 'Empresarial',
    typePersonal: 'Personal',
    labelDesc: 'Descripción',
    placeholderDesc: 'Ingrese la descripción',
    labelValue: 'Valor',
    labelDate: 'Fecha',
    btnCancel: 'Cancelar',
    btnSave: 'Guardar',
    filterAll: 'Todas',
    historyTitle: 'Gastos Recientes',
    loading: 'Cargando gastos...',
    alertFields: '¡Por favor, complete la descripción y el valor correctamente!'
  }
};

export function ExpensesScreen({ onTransactionChange, refreshTrigger = 0 }) {
  const { systemLanguage } = useLanguage(); // 🌟 Obtendo o idioma ativo globalmente
  const text = localTranslations[systemLanguage] || localTranslations['pt-BR'];

  const [isBusiness, setIsBusiness] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [expenses, setExpenses] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]);
  const [filtroAtivo, setFiltroAtivo] = useState('TODAS');
  const [loading, setLoading] = useState(true);

  // 🌟 Função para formatar a moeda dinamicamente conforme o idioma
  const formatCurrency = (amount) => {
    if (systemLanguage === 'en-US') {
      return Number(amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    } else if (systemLanguage === 'es-ES') {
      return Number(amount).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
    }
    return Number(amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const carregarDespesas = async () => {
    try {
      setLoading(true);
      const despesas = await financeAPI.listarDespesas('TODAS');
      setAllExpenses(despesas);
    } catch (err) {
      console.error('❌ Erro ao carregar despesas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDespesas();
  }, [refreshTrigger]);

  const filteredExpenses = allExpenses.filter(expense => {
    if (filtroAtivo === 'TODAS') return true;
    if (filtroAtivo === 'STUDIO') return expense.ehProfissional === true;
    if (filtroAtivo === 'PESSOAL') return expense.ehProfissional === false;
    return true;
  });

  const businessTotal = allExpenses
    .filter(e => e.ehProfissional)
    .reduce((sum, e) => sum + (e.valor || 0), 0);

  const personalTotal = allExpenses
    .filter(e => !e.ehProfissional)
    .reduce((sum, e) => sum + (e.valor || 0), 0);

  const handleAddExpense = async () => {
    try {
      const novoValor = parseFloat(value.replace(',', '.'));
      if (!description || isNaN(novoValor)) {
        alert(text.alertFields);
        return;
      }

      await financeAPI.registrarTransacao({
        valor: novoValor,
        tipoTransacao: 'DESPESA',
        dataCompetencia: date,
        ehProfissional: isBusiness,
        categoriaFinanceira: 'Geral',
        descricao: description
      });

      setShowForm(false);
      setDescription('');
      setValue('');
      carregarDespesas();
      if (onTransactionChange) onTransactionChange();
    } catch (err) {
      console.error('❌ Erro ao adicionar despesa:', err);
    }
  };

  return (
    <div className="pb-24 px-5">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-primary">{text.title}</h2>
        <p className="text-gray-600 text-sm">{text.subtitle}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-primary rounded-xl p-4 shadow-lg text-white">
          <p className="text-purple-200 text-sm mb-1">{text.totalBusiness}</p>
          <p className="text-2xl">{formatCurrency(businessTotal)}</p>
        </div>
        <div className="bg-accent rounded-xl p-4 shadow-lg text-white">
          <p className="text-pink-100 text-sm mb-1">{text.totalPersonal}</p>
          <p className="text-2xl">{formatCurrency(personalTotal)}</p>
        </div>
      </div>

      {/* Add Expense Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full bg-white rounded-xl p-4 shadow-md flex items-center justify-center gap-2 mb-6 text-primary hover:shadow-lg transition-shadow"
        >
          <Plus size={20} />
          <span>{text.btnAddExpense}</span>
        </button>
      )}

      {/* Expense Form */}
      {showForm && (
        <div className="bg-white rounded-xl p-5 shadow-md mb-6">
          <h3 className="text-gray-800 mb-4">{text.formTitle}</h3>

          {/* Toggle Switch */}
          <div className="mb-4">
            <label className="text-sm text-gray-600 mb-2 block">{text.formType}</label>
            <div className="flex items-center gap-3 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setIsBusiness(true)}
                className={`flex-1 py-2 rounded-lg transition-all ${isBusiness ? 'bg-primary text-white shadow-md' : 'text-gray-600'
                  }`}
              >
                {text.typeBusiness}
              </button>
              <button
                onClick={() => setIsBusiness(false)}
                className={`flex-1 py-2 rounded-lg transition-all ${!isBusiness ? 'bg-accent text-white shadow-md' : 'text-gray-600'
                  }`}
              >
                {text.typePersonal}
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 mb-2 block">{text.labelDesc}</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={text.placeholderDesc}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-2 block">{text.labelValue}</label>
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
              <label className="text-sm text-gray-600 mb-2 block">{text.labelDate}</label>
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
              {text.btnCancel}
            </button>
            <button
              onClick={handleAddExpense}
              className="flex-1 py-3 bg-accent text-white rounded-xl hover:shadow-lg transition-shadow"
            >
              {text.btnSave}
            </button>
          </div>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="flex gap-2 my-3 overflow-x-auto pb-2">
        {['TODAS', 'STUDIO', 'PESSOAL'].map((tipo) => (
          <button
            key={tipo}
            onClick={() => setFiltroAtivo(tipo)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${filtroAtivo === tipo
                ? 'bg-primary text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            {tipo === 'TODAS' && text.filterAll}
            {tipo === 'STUDIO' && text.typeBusiness}
            {tipo === 'PESSOAL' && text.typePersonal}
          </button>
        ))}
      </div>

      {/* Expense History */}
      <div>
        <h3 className="text-gray-800 mb-3">{text.historyTitle}</h3>
        {loading ? (
          <div className="text-center py-10 text-gray-500">{text.loading}</div>
        ) : (
          <div className="space-y-3">
            {filteredExpenses.map((expense) => (
              <div key={expense.idTransacao} className="bg-white rounded-xl p-4 shadow-md">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-gray-800">{expense.descricao}</p>
                    <p className="text-gray-500 text-sm mt-1">{expense.dataCompetencia}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-800">
                      {formatCurrency(expense.valor)}
                    </p>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs mt-1 ${expense.ehProfissional
                        ? 'bg-purple-100 text-primary'
                        : 'bg-pink-100 text-accent'
                        }`}
                    >
                      {expense.ehProfProfissional ? text.typeBusiness : text.typePersonal}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}