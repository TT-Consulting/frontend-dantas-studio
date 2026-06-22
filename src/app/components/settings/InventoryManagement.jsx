import { useEffect, useState } from 'react';
import { ArrowLeft, Package, Plus, Edit2, Trash2, AlertTriangle, Check, X, TrendingDown, RefreshCw } from 'lucide-react';
import {
  listarEstoque,
  salvarMaterial,
  ajustarQuantidade,
  alternarStatusMaterial,
} from '../../../api';

export function InventoryManagement({ onBack }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    nomeItem: '',
    categoria: '',
    quantidadeAtual: 0,
    quantidadeMinima: 0,
    unidadeMedida: 'unid',
  });

  const categories = ['Esmaltes', 'Géis', 'Lixas', 'Bases', 'Finalizadores', 'Removedores', 'Materiais', 'Outros'];
  const units = ['unid', 'litros', 'ml', 'gramas', 'kg'];

  // Carregar dados do banco
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listarEstoque();
      console.log('✅ Estoque carregado:', data);
      setItems(data);
    } catch (err) {
      console.error('❌ Erro ao carregar estoque:', err);
      setError('Falha ao carregar estoque do banco de dados.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const lowStockItems = items.filter((item) => item.quantidadeAtual <= item.quantidadeMinima);

  const handleSave = async () => {
    if (!formData.nomeItem || !formData.categoria) return;

    try {
      if (editingItem) {
        // Atualizar item existente
        console.log(`🔄 Atualizando material ${editingItem.idMaterial}`);
        await ajustarQuantidade(editingItem.idMaterial, formData.quantidadeAtual);
      } else {
        // Criar novo material
        console.log('✨ Criando novo material');
        await salvarMaterial(formData);
      }
      await loadData(); // Recarrega a lista
      setShowAddModal(false);
      setEditingItem(null);
      setFormData({
        nomeItem: '',
        categoria: '',
        quantidadeAtual: 0,
        quantidadeMinima: 0,
        unidadeMedida: 'unid',
      });
    } catch (err) {
      console.error('❌ Erro ao salvar material:', err);
      setError('Erro ao salvar material. Tente novamente.');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      nomeItem: item.nomeItem,
      categoria: item.categoria,
      quantidadeAtual: item.quantidadeAtual,
      quantidadeMinima: item.quantidadeMinima,
      unidadeMedida: item.unidadeMedida,
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Tem certeza que deseja remover este item?')) {
      try {
        console.log(`❌ Removendo material ${id}`);
        await alternarStatusMaterial(id, false); // Desativar em vez de deletar
        await loadData();
      } catch (err) {
        console.error('Erro ao remover material:', err);
        setError('Erro ao remover material.');
      }
    }
  };

  const updateQuantity = async (id, change) => {
    try {
      const item = items.find((i) => i.idMaterial === id);
      const novaQuantidade = Math.max(0, item.quantidadeAtual + change);
      console.log(`📦 Ajustando quantidade do material ${id} para ${novaQuantidade}`);
      await ajustarQuantidade(id, novaQuantidade);
      await loadData();
    } catch (err) {
      console.error('Erro ao atualizar quantidade:', err);
      setError('Erro ao atualizar quantidade.');
    }
  };

  const getStockStatus = (item) => {
    const percentage = (item.quantidadeAtual / item.quantidadeMinima) * 100;
    if (item.quantidadeAtual === 0) {
      return { color: 'bg-red-500', label: 'Esgotado', textColor: 'text-red-700' };
    } else if (item.quantidadeAtual < item.quantidadeMinima) {
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
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-primary hover:text-accent transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Voltar</span>
          </button>
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Atualizar
          </button>
        </div>
        <h2 className="text-primary text-2xl">Estoque e Materiais</h2>
        <p className="text-gray-600 text-sm mt-1">Controle seus produtos e materiais do MariaDB</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="px-5 pt-6">
          <div className="bg-red-50 rounded-xl p-4 border border-red-200">
            <p className="text-red-700 font-medium">❌ {error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="px-5 pt-6">
          <p className="text-gray-500 text-center">Conectando ao MariaDB...</p>
        </div>
      )}

      {/* Alert for Low Stock */}
      {!loading && lowStockItems.length > 0 && (
        <div className="px-5 pt-6">
          <div className="bg-red-50 rounded-xl p-4 border border-red-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={20} />
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

      {/* Empty State */}
      {!loading && items.length === 0 && (
        <div className="px-5 pt-6">
          <p className="text-gray-500 text-center">Nenhum material encontrado no estoque.</p>
        </div>
      )}

      {/* Inventory List */}
      <div className="px-5 py-6 space-y-3">
        {!loading &&
          items
            .sort((a, b) => {
              // Sort by low stock first
              const aLow = a.quantidadeAtual <= a.quantidadeMinima;
              const bLow = b.quantidadeAtual <= b.quantidadeMinima;
              if (aLow && !bLow) return -1;
              if (!aLow && bLow) return 1;
              return 0;
            })
            .map((item) => {
              const status = getStockStatus(item);
              const stockPercentage = Math.min(100, (item.quantidadeAtual / (item.quantidadeMinima * 2)) * 100);

            return (
              <div key={item.idMaterial} className="bg-white rounded-xl p-5 shadow-md">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-gray-800 font-semibold mb-1">{item.nomeItem}</h3>
                    <p className="text-gray-600 text-sm">{item.categoria}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.quantidadeAtual === 0
                        ? 'bg-red-100 text-red-700'
                        : item.quantidadeAtual <= item.quantidadeMinima
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {status.label}
                  </span>
                </div>

                {/* Stock Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">
                      Quantidade: <span className="font-semibold text-gray-800">{item.quantidadeAtual} {item.unidadeMedida}</span>
                    </span>
                    <span className="text-gray-500 text-xs">
                      Mín: {item.quantidadeMinima} {item.unidadeMedida}
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
                      onClick={() => updateQuantity(item.idMaterial, -1)}
                      className="w-8 h-8 bg-white rounded hover:bg-gray-50 transition-colors flex items-center justify-center"
                    >
                      <span className="text-gray-600 font-semibold">−</span>
                    </button>
                    <button
                      onClick={() => updateQuantity(item.idMaterial, 1)}
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
                    onClick={() => handleDelete(item.idMaterial)}
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
          setFormData({
            nomeItem: '',
            categoria: '',
            quantidadeAtual: 0,
            quantidadeMinima: 0,
            unidadeMedida: 'unid',
          });
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
                  value={formData.nomeItem}
                  onChange={(e) => setFormData({ ...formData, nomeItem: e.target.value })}
                  placeholder="Ex: Esmalte Vermelho"
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-2 block">Categoria</label>
                <select
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
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
                    value={formData.quantidadeAtual}
                    onChange={(e) => setFormData({ ...formData, quantidadeAtual: Number(e.target.value) })}
                    min="0"
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Quantidade Mínima</label>
                  <input
                    type="number"
                    value={formData.quantidadeMinima}
                    onChange={(e) => setFormData({ ...formData, quantidadeMinima: Number(e.target.value) })}
                    min="0"
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-2 block">Unidade</label>
                <select
                  value={formData.unidadeMedida}
                  onChange={(e) => setFormData({ ...formData, unidadeMedida: e.target.value })}
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
                disabled={!formData.nomeItem || !formData.categoria}
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
