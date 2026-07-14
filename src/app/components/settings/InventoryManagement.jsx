import { useEffect, useState } from 'react';
import { ArrowLeft, Package, Plus, Edit2, Trash2, AlertTriangle, Check, X, RefreshCw } from 'lucide-react';
import { useLanguage } from "../../../context/LanguageContext"; 
import {
  listarEstoque,
  salvarMaterial,
  ajustarQuantidade,
  alternarStatusMaterial,
} from '../../../api';

const localTranslations = {
  'pt-BR': {
    title: 'Estoque e Materiais',
    subtitle: 'Controle seus produtos e materiais do MariaDB',
    btnBack: 'Voltar',
    btnRefresh: 'Atualizar',
    loading: 'Conectando ao MariaDB...',
    errorLoad: 'Falha ao carregar estoque do banco de dados.',
    errorSave: 'Erro ao salvar material. Tente novamente.',
    errorRemove: 'Erro ao remover material.',
    errorUpdateQty: 'Erro ao atualizar quantidade.',
    lowStockSingle: 'item com estoque baixo',
    lowStockPlural: 'itens com estoque baixo',
    lowStockWarning: 'Reabasteça para evitar ficar sem produtos importantes',
    emptyState: 'Nenhum material encontrado no estoque.',
    confirmDelete: 'Tem certeza que deseja desativar este item?',
    lblQty: 'Quantidade',
    lblMin: 'Mín',
    statusEsgotado: 'Esgotado',
    statusBaixo: 'Estoque Baixo',
    statusAtencao: 'Atenção',
    statusOk: 'OK',
    modalNewTitle: 'Adicionar Item',
    modalEditTitle: 'Editar Item',
    formName: 'Nome do Item',
    formCategory: 'Categoria',
    formCurrent: 'Quantidade Atual',
    formMin: 'Quantidade Mínima',
    formUnit: 'Unidade',
    placeholderName: 'Ex: Esmalte Vermelho',
    selectOption: 'Selecione...',
    btnCancel: 'Cancelar',
    btnSave: 'Salvar'
  },
  'en-US': {
    title: 'Inventory & Materials',
    subtitle: 'Control your products and materials from MariaDB',
    btnBack: 'Back',
    btnRefresh: 'Refresh',
    loading: 'Connecting to MariaDB...',
    errorLoad: 'Failed to load inventory from database.',
    errorSave: 'Error saving material. Please try again.',
    errorRemove: 'Error removing material.',
    errorUpdateQty: 'Error updating quantity.',
    lowStockSingle: 'item with low stock',
    lowStockPlural: 'items with low stock',
    lowStockWarning: 'Replenish to avoid running out of important products',
    emptyState: 'No materials found in inventory.',
    confirmDelete: 'Are you sure you want to deactivate this item?',
    lblQty: 'Quantity',
    lblMin: 'Min',
    statusEsgotado: 'Out of Stock',
    statusBaixo: 'Low Stock',
    statusAtencao: 'Warning',
    statusOk: 'OK',
    modalNewTitle: 'Add Item',
    modalEditTitle: 'Edit Item',
    formName: 'Item Name',
    formCategory: 'Category',
    formCurrent: 'Current Quantity',
    formMin: 'Minimum Quantity',
    formUnit: 'Unit',
    placeholderName: 'e.g., Red Nail Polish',
    selectOption: 'Select...',
    btnCancel: 'Cancel',
    btnSave: 'Save'
  },
  'es-ES': {
    title: 'Inventario y Materiales',
    subtitle: 'Controle sus productos y materiales de MariaDB',
    btnBack: 'Volver',
    btnRefresh: 'Actualizar',
    loading: 'Conectando a MariaDB...',
    errorLoad: 'Error al cargar el inventario de la base de datos.',
    errorSave: 'Error al guardar el material. Intente nuevamente.',
    errorRemove: 'Error al eliminar el material.',
    errorUpdateQty: 'Error al actualizar la cantidad.',
    lowStockSingle: 'artículo con stock bajo',
    lowStockPlural: 'artículos con stock bajo',
    lowStockWarning: 'Reabastezca para evitar quedarse sin productos importantes',
    emptyState: 'No se encontraron materiales en el inventario.',
    confirmDelete: '¿Está seguro de que desea desactivar este artículo?',
    lblQty: 'Cantidad',
    lblMin: 'Mín',
    statusEsgotado: 'Agotado',
    statusBaixo: 'Stock Bajo',
    statusAtencao: 'Atención',
    statusOk: 'OK',
    modalNewTitle: 'Añadir Artículo',
    modalEditTitle: 'Editar Artículo',
    formName: 'Nombre del Artículo',
    formCategory: 'Categoría',
    formCurrent: 'Cantidad Actual',
    formMin: 'Cantidad Mínima',
    formUnit: 'Unidad',
    placeholderName: 'Ej: Esmalte Rojo',
    selectOption: 'Seleccione...',
    btnCancel: 'Cancelar',
    btnSave: 'Guardar'
  }
};

export function InventoryManagement({ onBack }) {
  const { systemLanguage } = useLanguage();
  const text = localTranslations[systemLanguage] || localTranslations['pt-BR'];

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const [formData, setFormData] = useState({
    nomeItem: '',
    categoria: '',
    quantidadeAtual: 0,
    quantidadeMinimaAlerta: 0, // 🌟 Sincronizado com EstoqueMaterialDTO
    unidadeMedida: 'unid',
    isAtivo: true
  });

  const categories = ['Esmaltes', 'Géis', 'Lixas', 'Bases', 'Finalizadores', 'Removedores', 'Materiais', 'Outros'];
  const units = ['unid', 'litros', 'ml', 'gramas', 'kg'];

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listarEstoque();
      // Filtrando para exibir apenas os ativos na listagem principal do front
      const ativos = data.filter(item => item.isAtivo !== false);
      setItems(ativos);
    } catch (err) {
      console.error('❌ Erro ao carregar estoque:', err);
      setError(text.errorLoad);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [systemLanguage]);

  const lowStockItems = items.filter((item) => item.quantidadeAtual <= item.quantidadeMinimaAlerta);

  const handleSave = async () => {
    if (!formData.nomeItem || !formData.categoria) return;

    try {
      if (editingItem) {
        // Como o endpoint /ajustar do backend faz SUM (atual = atual + param),
        // calculamos a diferença para ajustar o valor exato desejado pelo form.
        const diferenca = formData.quantidadeAtual - editingItem.quantidadeAtual;
        
        // Se mudou a quantidade, ajusta. Se mudou outros campos, recria/salva por POST
        if (diferenca !== 0) {
          await ajustarQuantidade(editingItem.idMaterial, diferenca);
        }
        
        // Envia o objeto atualizado completo para salvar alterações de nome/categoria/mínimo
        await salvarMaterial({
          ...editingItem,
          nomeItem: formData.nomeItem,
          categoria: formData.categoria,
          quantidadeMinimaAlerta: formData.quantidadeMinimaAlerta,
          unidadeMedida: formData.unidadeMedida
        });
      } else {
        // Criar novo material
        await salvarMaterial(formData);
      }
      await loadData();
      setShowAddModal(false);
      setEditingItem(null);
    } catch (err) {
      console.error('❌ Erro ao salvar material:', err);
      setError(text.errorSave);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      nomeItem: item.nomeItem,
      categoria: item.categoria || '',
      quantidadeAtual: item.quantidadeAtual,
      quantidadeMinimaAlerta: item.quantidadeMinimaAlerta || 0,
      unidadeMedida: item.unidadeMedida || 'unid',
      isAtivo: item.isAtivo
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm(text.confirmDelete)) {
      try {
        await alternarStatusMaterial(id, false); // Passa false para acionar /desativar
        await loadData();
      } catch (err) {
        console.error('Erro ao remover material:', err);
        setError(text.errorRemove);
      }
    }
  };

  const updateQuantity = async (id, change) => {
    try {
      // Como o endpoint `/ajustar` soma a quantidade enviada ao estoque atual,
      // podemos passar diretamente o `change` (1 ou -1)
      await ajustarQuantidade(id, change);
      await loadData();
    } catch (err) {
      console.error('Erro ao atualizar quantidade:', err);
      setError(text.errorUpdateQty);
    }
  };

  const getStockStatus = (item) => {
    const min = item.quantidadeMinimaAlerta || 1;
    const percentage = (item.quantidadeAtual / min) * 100;
    if (item.quantidadeAtual === 0) {
      return { color: 'bg-red-500', label: text.statusEsgotado, textColor: 'text-red-700' };
    } else if (item.quantidadeAtual <= item.quantidadeMinimaAlerta) {
      return { color: 'bg-red-400', label: text.statusBaixo, textColor: 'text-red-700' };
    } else if (percentage <= 150) {
      return { color: 'bg-yellow-400', label: text.statusAtencao, textColor: 'text-yellow-700' };
    } else {
      return { color: 'bg-green-400', label: text.statusOk, textColor: 'text-green-700' };
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
            <span>{text.btnBack}</span>
          </button>
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} />
            {text.btnRefresh}
          </button>
        </div>
        <h2 className="text-primary text-2xl">{text.title}</h2>
        <p className="text-gray-600 text-sm mt-1">{text.subtitle}</p>
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
          <p className="text-gray-500 text-center">{text.loading}</p>
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
                  ⚠️ {lowStockItems.length} {lowStockItems.length === 1 ? text.lowStockSingle : text.lowStockPlural}
                </p>
                <p className="text-red-600 text-sm">
                  {text.lowStockWarning}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && items.length === 0 && (
        <div className="px-5 pt-6">
          <p className="text-gray-500 text-center">{text.emptyState}</p>
        </div>
      )}

      {/* Inventory List */}
      <div className="px-5 py-6 space-y-3">
        {!loading &&
          items
            .sort((a, b) => {
              const aLow = a.quantidadeAtual <= a.quantidadeMinimaAlerta;
              const bLow = b.quantidadeAtual <= b.quantidadeMinimaAlerta;
              if (aLow && !bLow) return -1;
              if (!aLow && bLow) return 1;
              return 0;
            })
            .map((item) => {
              const status = getStockStatus(item);
              const min = item.quantidadeMinimaAlerta || 1;
              const stockPercentage = Math.min(100, (item.quantidadeAtual / (min * 2)) * 100);

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
                        : item.quantidadeAtual <= item.quantidadeMinimaAlerta
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
                      {text.lblQty}: <span className="font-semibold text-gray-800">{item.quantidadeAtual} {item.unidadeMedida}</span>
                    </span>
                    <span className="text-gray-500 text-xs">
                      {text.lblMin}: {item.quantidadeMinimaAlerta} {item.unidadeMedida}
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
            quantidadeMinimaAlerta: 0,
            unidadeMedida: 'unid',
            isAtivo: true
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
                {editingItem ? text.modalEditTitle : text.modalNewTitle}
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
                <label className="text-sm text-gray-600 mb-2 block">{text.formName}</label>
                <input
                  type="text"
                  value={formData.nomeItem}
                  onChange={(e) => setFormData({ ...formData, nomeItem: e.target.value })}
                  placeholder={text.placeholderName}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-2 block">{text.formCategory}</label>
                <select
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">{text.selectOption}</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">{text.formCurrent}</label>
                  <input
                    type="number"
                    value={formData.quantidadeAtual}
                    onChange={(e) => setFormData({ ...formData, quantidadeAtual: Number(e.target.value) })}
                    min="0"
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">{text.formMin}</label>
                  <input
                    type="number"
                    value={formData.quantidadeMinimaAlerta}
                    onChange={(e) => setFormData({ ...formData, quantidadeMinimaAlerta: Number(e.target.value) })}
                    min="0"
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-2 block">{text.formUnit}</label>
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
                {text.btnCancel}
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.nomeItem || !formData.categoria}
                className="flex-1 py-3 bg-accent text-white rounded-xl hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Check size={20} />
                <span>{text.btnSave}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}