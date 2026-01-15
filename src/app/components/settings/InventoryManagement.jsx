import { useState } from 'react';
import { ArrowLeft, Package, Plus, Edit2, Trash2, AlertTriangle, Check, X, TrendingDown } from 'lucide-react';

export function InventoryManagement({ onBack }) {
  const [items, setItems] = useState([
    { id: '1', name: 'Esmalte Vermelho', category: 'Esmaltes', currentQuantity: 3, minQuantity: 5, unit: 'unid' },
    { id: '2', name: 'Gel UV Transparente', category: 'Géis', currentQuantity: 8, minQuantity: 3, unit: 'unid' },
    { id: '3', name: 'Lixa 180/240', category: 'Lixas', currentQuantity: 15, minQuantity: 10, unit: 'unid' },
    { id: '4', name: 'Base Coat', category: 'Bases', currentQuantity: 2, minQuantity: 3, unit: 'unid' },
    { id: '5', name: 'Top Coat', category: 'Finalizadores', currentQuantity: 4, minQuantity: 3, unit: 'unid' },
    { id: '6', name: 'Removedor de Gel', category: 'Removedores', currentQuantity: 1, minQuantity: 2, unit: 'litros' },
    { id: '7', name: 'Algodão', category: 'Materiais', currentQuantity: 50, minQuantity: 20, unit: 'unid' },
    { id: '8', name: 'Acetona', category: 'Removedores', currentQuantity: 3, minQuantity: 2, unit: 'litros' },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    currentQuantity: 0,
    minQuantity: 0,
    unit: 'unid',
  });

  const categories = ['Esmaltes', 'Géis', 'Lixas', 'Bases', 'Finalizadores', 'Removedores', 'Materiais', 'Outros'];
  const units = ['unid', 'litros', 'ml', 'gramas', 'kg'];

  const lowStockItems = items.filter(item => item.currentQuantity <= item.minQuantity);

  const handleSave = () => {
    if (!formData.name || !formData.category) return;

    if (editingItem) {
      setItems(items.map(item =>
        item.id === editingItem.id
          ? { ...item, ...formData }
          : item
      ));
    } else {
      const newItem = {
        id: Date.now().toString(),
        ...formData,
      };
      setItems([...items, newItem]);
    }

    setShowAddModal(false);
    setEditingItem(null);
    setFormData({ name: '', category: '', currentQuantity: 0, minQuantity: 0, unit: 'unid' });
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      currentQuantity: item.currentQuantity,
      minQuantity: item.minQuantity,
      unit: item.unit,
    });
    setShowAddModal(true);
  };

  const handleDelete = (id) => {
    if (confirm('Tem certeza que deseja remover este item?')) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateQuantity = (id, change) => {
    setItems(items.map(item =>
      item.id === id
        ? { ...item, currentQuantity: Math.max(0, item.currentQuantity + change) }
        : item
    ));
  };

  const getStockStatus = (item) => {
    const percentage = (item.currentQuantity / item.minQuantity) * 100;
    if (item.currentQuantity === 0) {
      return { color: 'bg-red-500', label: 'Esgotado', textColor: 'text-red-700' };
    } else if (item.currentQuantity < item.minQuantity) {
      return { color: 'bg-red-400', label: 'Estoque Baixo', textColor: 'text-red-700' };
    } else if (percentage <= 150) {
      return { color: 'bg-yellow-400', label: 'Atenção', textColor: 'text-yellow-700' };
    } else {
      return { color: 'bg-green-400', label: 'OK', textColor: 'text-green-700' };
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-white px-5 py-4 shadow-sm sticky top-0 z-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-primary hover:text-accent transition-colors mb-4"
        >
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>
        <h2 className="text-primary text-2xl">Estoque e Materiais</h2>
        <p className="text-gray-600 text-sm mt-1">Controle seus produtos e materiais</p>
      </div>

      {/* Alert for Low Stock */}
      {lowStockItems.length > 0 && (
        <div className="px-5 pt-6">
          <div className="bg-red-50 rounded-xl p-4 border border-red-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-red-700 font-medium mb-1">
                  ⚠️ {lowStockItems.length} {lowStockItems.length === 1 ? 'item com estoque baixo' : 'itens com estoque baixo'}
                </p>
                <p className="text-red-600 text-sm">
                  Reabasteça para evitar ficar sem produtos importantes
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inventory List */}
      <div className="px-5 py-6 space-y-3">
        {items
          .sort((a, b) => {
            // Sort by low stock first
            const aLow = a.currentQuantity <= a.minQuantity;
            const bLow = b.currentQuantity <= b.minQuantity;
            if (aLow && !bLow) return -1;
            if (!aLow && bLow) return 1;
            return 0;
          })
          .map((item) => {
            const status = getStockStatus(item);
            const stockPercentage = Math.min(100, (item.currentQuantity / (item.minQuantity * 2)) * 100);

            return (
              <div key={item.id} className="bg-white rounded-xl p-5 shadow-md">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-gray-800 font-semibold mb-1">{item.name}</h3>
                    <p className="text-gray-600 text-sm">{item.category}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    item.currentQuantity === 0
                      ? 'bg-red-100 text-red-700'
                      : item.currentQuantity <= item.minQuantity
                      ? 'bg-red-100 text-red-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {status.label}
                  </span>
                </div>

                {/* Stock Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">
                      Quantidade: <span className="font-semibold text-gray-800">{item.currentQuantity} {item.unit}</span>
                    </span>
                    <span className="text-gray-500 text-xs">
                      Mín: {item.minQuantity} {item.unit}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${status.color} transition-all`}
                      style={{ width: `${stockPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-8 h-8 bg-white rounded hover:bg-gray-50 transition-colors flex items-center justify-center"
                    >
                      <span className="text-gray-600 font-semibold">−</span>
                    </button>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-8 h-8 bg-white rounded hover:bg-gray-50 transition-colors flex items-center justify-center"
                    >
                      <span className="text-primary font-semibold">+</span>
                    </button>
                  </div>
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="text-primary" size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="text-red-500" size={18} />
                  </button>
                </div>
              </div>
            );
          })}
      </div>

      {/* Add Button */}
      <button
        onClick={() => {
          setEditingItem(null);
          setFormData({ name: '', category: '', currentQuantity: 0, minQuantity: 0, unit: 'unid' });
          setShowAddModal(true);
        }}
        className="fixed bottom-24 right-5 w-14 h-14 bg-accent text-white rounded-full shadow-2xl hover:shadow-3xl transition-all flex items-center justify-center"
      >
        <Plus size={28} />
      </button>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-5">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-primary text-xl">
                {editingItem ? 'Editar Item' : 'Adicionar Item'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingItem(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 mb-2 block">Nome do Item</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Esmalte Vermelho"
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-2 block">Categoria</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Selecione...</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Quantidade Atual</label>
                  <input
                    type="number"
                    value={formData.currentQuantity}
                    onChange={(e) => setFormData({ ...formData, currentQuantity: Number(e.target.value) })}
                    min="0"
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Quantidade Mínima</label>
                  <input
                    type="number"
                    value={formData.minQuantity}
                    onChange={(e) => setFormData({ ...formData, minQuantity: Number(e.target.value) })}
                    min="0"
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-2 block">Unidade</label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {units.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingItem(null);
                }}
                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.name || !formData.category}
                className="flex-1 py-3 bg-accent text-white rounded-xl hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Check size={20} />
                <span>Salvar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
