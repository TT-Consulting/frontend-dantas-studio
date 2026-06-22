import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Save, RefreshCw, AlertCircle } from 'lucide-react';
import {
  listarServicos,
  criarServico,
  editarServico,
  inativarServico,
  listarEstoque,
} from '../../api';

const mapFromApi = (s) => ({
  id: s?.idServico ?? s?.id ?? '',
  name: s?.nomeServico ?? s?.name ?? '',
  description: s?.descricao ?? s?.description ?? '',
  price: s?.precoBase ?? s?.price ?? '',
  duration: s?.duracaoMinutos ?? s?.duration ?? '',
  active: s?.ativo ?? s?.active ?? true,
  materials: s?.materiais ?? s?.materials ?? [],
  materialObjects: s?.materiais ?? s?.materials ?? [], // Armazena os objetos completos
});

const mapToApi = (s, availableMaterials = []) => {
  // Mapeia os IDs selecionados para objetos completos
  const materiaisCompletos = (s.materials || [])
    .map((materialId) => {
      const found = availableMaterials.find(
        (m) =>
          (m?.id ?? m?.idMaterial ?? m?.idEstoque ?? m?.nome) === materialId
      );
      if (found) {
        console.log(`📦 Material mapeado para API:`, found);
        return found;
      }
      console.warn(`⚠️ Material ID ${materialId} não encontrado em availableMaterials`);
      return null;
    })
    .filter(Boolean); // Remove materiais não encontrados

  const payload = {
    nomeServico: s.name,
    descricao: s.description,
    precoBase: Number(s.price) || 0,
    duracaoMinutos: Number(s.duration) || 0,
    ativo: Boolean(s.active),
    materiais: materiaisCompletos, // Envia objetos completos
  };

  console.log('📤 Payload final para API:', payload);
  return payload;
};

export function ServiceCatalogAdmin() {
  const [services, setServices] = useState([]);
  const [editingService, setEditingService] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availableMaterials, setAvailableMaterials] = useState([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);

  const loadServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await listarServicos();
      const data = Array.isArray(res?.data) ? res.data : [];
      setServices(data.map(mapFromApi));
    } catch (err) {
      console.error('Erro ao carregar serviços', err);
      setError('Não foi possível carregar os serviços.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleEdit = (service) => {
    setEditingService({ ...service });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!editingService) return;

    // Mapeia com os materiais disponíveis para construir objetos completos
    const payload = mapToApi(editingService, availableMaterials);
    try {
      if (editingService.id) {
        console.log(`🔄 Atualizando serviço ID: ${editingService.id}`);
        await editarServico(editingService.id, payload);
      } else {
        console.log('✨ Criando novo serviço');
        await criarServico(payload);
      }
      await loadServices();
      setShowModal(false);
      setEditingService(null);
    } catch (err) {
      console.error('❌ Erro ao salvar serviço', err);
      alert('Erro ao salvar serviço. Verifique o backend.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deseja inativar este serviço?')) return;
    try {
      await inativarServico(id);
      await loadServices();
    } catch (err) {
      console.error('Erro ao inativar serviço', err);
      alert('Erro ao inativar serviço.');
    }
  };

  const handleToggleActive = async (service) => {
    const updated = { ...service, active: !service.active };
    try {
      await editarServico(service.id, mapToApi(updated, availableMaterials));
      await loadServices();
    } catch (err) {
      console.error('❌ Erro ao atualizar status do serviço', err);
      alert('Erro ao atualizar status.');
    }
  };

  // Função para validar se um serviço tem materiais com estoque baixo
  const hasLowStockMaterials = (service) => {
    if (!service.materials || service.materials.length === 0) return false;
    return service.materials.some((materialId) => {
      const material = availableMaterials.find(
        (m) =>
          (m?.idMaterial ?? m?.id ?? m?.idEstoque ?? m?.nomeItem) === materialId
      );
      if (!material) return false;
      return material.quantidadeAtual <= material.quantidadeMinima;
    });
  };

  const handleAddNew = () => {
    setEditingService({
      id: null,
      name: '',
      description: '',
      price: '',
      duration: '',
      active: true,
      materials: [],
    });
    setShowModal(true);
  };

  const handleAddNewWithMaterials = async () => {
    try {
      setLoadingMaterials(true);
      
      // Busca todos os materiais do estoque (dados reais do MariaDB)
      const materiais = await listarEstoque();
      
      // Valida se há materiais disponíveis
      if (!Array.isArray(materiais) || materiais.length === 0) {
        console.warn('🚨 Nenhum material encontrado no estoque');
        setError('Nenhum material disponível no estoque. Por favor, crie materiais primeiro.');
        setLoadingMaterials(false);
        return;
      }
      
      // Filtra apenas materiais com status ativo (isAtivo ou ativo = true)
      const materiaisAtivos = materiais.filter((m) => {
        const isAtivo = m?.isAtivo === true || m?.ativo === true;
        if (!isAtivo) {
          console.log(`ℹ️ Material ${m?.nomeItem} ignorado (inativo)`);
        }
        return isAtivo;
      });

      if (materiaisAtivos.length === 0) {
        console.warn('⚠️ Nenhum material ativo encontrado');
        setError('Não há materiais ativos no estoque.');
        setLoadingMaterials(false);
        return;
      }

      console.log(`✅ Carregados ${materiaisAtivos.length} materiais ativos do MariaDB:`, materiaisAtivos);
      
      setAvailableMaterials(materiaisAtivos);
      setError(null);
      handleAddNew();
    } catch (err) {
      console.error('❌ Erro ao carregar materiais do estoque:', err);
      setError('Erro ao carregar materiais do estoque. Tente novamente.');
    } finally {
      setLoadingMaterials(false);
    }
  };

  return (
    <div className="pb-24 px-5 pt-6">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-primary">Catálogo de Serviços</h2>
          <p className="text-gray-600 text-sm">Gerencie seus serviços e preços</p>
        </div>
        <button
          onClick={loadServices}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <RefreshCw size={16} />
          Atualizar
        </button>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <button
        onClick={handleAddNewWithMaterials}
        disabled={loadingMaterials}
        className="w-full bg-accent text-white py-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus size={20} />
        <span>{loadingMaterials ? 'Carregando materiais...' : 'Adicionar Novo Serviço'}</span>
      </button>

      <div className="space-y-3">
        {loading && <p className="text-gray-500 text-sm">Carregando serviços...</p>}
        {!loading && services.length === 0 && (
          <p className="text-gray-500 text-sm">Nenhum serviço encontrado.</p>
        )}
        {services.map((service) => {
          const lowStockAlert = hasLowStockMaterials(service);
          return (
          <div
            key={service.id}
            className={`bg-white rounded-xl p-4 shadow-md transition-all border-l-4 ${
              service.active ? '' : 'opacity-60'
            } ${
              lowStockAlert ? 'border-l-amber-400' : 'border-l-transparent'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="text-primary">{service.name}</h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      service.active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {service.active ? 'Ativo' : 'Inativo'}
                  </span>
                  {lowStockAlert && (
                    <span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700 flex items-center gap-1">
                      <AlertCircle size={12} />
                      Estoque baixo
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-2">{service.description}</p>
                <div className="flex items-center gap-4 text-sm">
                  <p className="text-accent">R$ {service.price}</p>
                  <p className="text-gray-500">{service.duration} min</p>
                </div>
                {service.materials && service.materials.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                      Materiais Inclusos
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {service.materials.map((material, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                        >
                          {material}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleToggleActive(service)}
                className={`flex-1 py-2 rounded-lg text-sm transition-colors ${
                  service.active
                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {service.active ? 'Desativar' : 'Ativar'}
              </button>
              <button
                onClick={() => handleEdit(service)}
                className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDelete(service.id)}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        );
        })}
      </div>

      {showModal && editingService && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-5">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-primary">
                {editingService.id ? 'Editar Serviço' : 'Novo Serviço'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingService(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 mb-2 block">Service Name</label>
                <input
                  type="text"
                  value={editingService.name}
                  onChange={(e) =>
                    setEditingService({ ...editingService, name: e.target.value })
                  }
                  placeholder="Ex: Unhas de Gel"
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-2 block">Descrição</label>
                <textarea
                  value={editingService.description}
                  onChange={(e) =>
                    setEditingService({ ...editingService, description: e.target.value })
                  }
                  placeholder="Descreva o serviço..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Preço (R$)</label>
                  <input
                    type="number"
                    value={editingService.price}
                    onChange={(e) =>
                      setEditingService({ ...editingService, price: e.target.value })
                    }
                    placeholder="0"
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Duração (min)</label>
                  <input
                    type="number"
                    value={editingService.duration}
                    onChange={(e) =>
                      setEditingService({ ...editingService, duration: e.target.value })
                    }
                    placeholder="0"
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-2 block">Materiais Inclusos</label>
                <p className="text-xs text-gray-500 mb-2">Selecione apenas materiais ativos do estoque</p>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                  {availableMaterials.length === 0 ? (
                    <p className="text-sm text-gray-500">Nenhum material ativo disponível no estoque.</p>
                  ) : (
                    availableMaterials.map((material) => {
                      // Extrair ID e nome com validação robusta (campos do MariaDB)
                      const matId = material?.idMaterial ?? material?.id ?? material?.idEstoque ?? material?.nomeItem;
                      const matNome = material?.nomeItem ?? material?.nome ?? material?.name ?? 'Material sem nome';
                      const matQuantidade = material?.quantidadeAtual ?? material?.quantidade ?? material?.qtd ?? 0;
                      const matMinima = material?.quantidadeMinima ?? 0;
                      
                      // Validar que o material está ativo
                      const isAtivo = material?.isAtivo === true || material?.ativo === true;
                      
                      if (!isAtivo) {
                        console.warn(`⚠️ Material ${matNome} não está ativo, será ignorado`);
                        return null;
                      }

                      const isSelected = editingService.materials?.includes(matId);

                      return (
                        <label
                          key={matId}
                          className="flex items-center gap-2 cursor-pointer p-2 hover:bg-white rounded transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              let updatedMaterials = editingService.materials || [];
                              if (e.target.checked) {
                                updatedMaterials = [...updatedMaterials, matId];
                                console.log(`✅ Material adicionado: ${matNome} (ID: ${matId})`);
                              } else {
                                updatedMaterials = updatedMaterials.filter((m) => m !== matId);
                                console.log(`❌ Material removido: ${matNome} (ID: ${matId})`);
                              }
                              setEditingService({ ...editingService, materials: updatedMaterials });
                              console.log('📋 Materiais selecionados:', updatedMaterials);
                            }}
                            className="w-4 h-4 accent-primary cursor-pointer"
                          />
                          <div className="flex-1">
                            <span className="text-sm text-gray-700 font-medium">{matNome}</span>
                            <span className={`text-xs ml-2 ${
                              matQuantidade <= matMinima
                                ? 'text-red-600 font-semibold'
                                : 'text-gray-500'
                            }`}>
                              Qtd: {matQuantidade} {matQuantidade <= matMinima ? '(⚠️ baixo)' : ''}
                            </span>
                          </div>
                        </label>
                      );
                    }).filter(Boolean) // Remove null entries
                  )}
                </div>
                {availableMaterials.length > 0 && editingService.materials?.length > 0 && (
                  <p className="text-xs text-gray-600 mt-2">
                    {editingService.materials.length} material(is) selecionado(s)
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <input
                  type="checkbox"
                  id="active"
                  checked={editingService.active}
                  onChange={(e) =>
                    setEditingService({ ...editingService, active: e.target.checked })
                  }
                  className="w-5 h-5 accent-primary cursor-pointer"
                />
                <label htmlFor="active" className="text-gray-700 cursor-pointer">
                  Serviço ativo e visível para clientes
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingService(null);
                }}
                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 bg-accent text-white rounded-xl hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
              >
                <Save size={18} />
                <span>Salvar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
