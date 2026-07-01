import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Save, RefreshCw, AlertCircle, Upload, Image as ImageIcon } from 'lucide-react';
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
  categoria: s?.categoria ?? '',
  materials: s?.materiais ?? s?.materials ?? [],
  materialObjects: s?.materiais ?? s?.materials ?? [],
  fotoUrl: s?.fotoUrl ?? '', 
});

const mapToApi = (s, availableMaterials = []) => {
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
    .filter(Boolean);

  const payload = {
    nomeServico: s.name,
    descricao: s.description,
    precoBase: Number(s.price) || 0,
    duracaoMinutos: Number(s.duration) || 0,
    ativo: Boolean(s.active),
    categoria: s.categoria || null,
    materiais: materiaisCompletos,
    fotoUrl: s.fotoUrl || null,
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
  const [isDragActive, setIsDragActive] = useState(false);

  const categoriasDisponiveis = [
    "Cabelo",
    "Unhas",
    "Maquilhagem",
    "Sobrancelhas e Cílios",
    "Estética Face",
    "Estética Corpo"
  ];

  // 🌟 ALTERAÇÃO: Carrega os materiais do estoque globalmente para uso na listagem e na edição
  const loadMaterials = async () => {
    try {
      setLoadingMaterials(true);
      const materiais = await listarEstoque();
      if (Array.isArray(materiais)) {
        const materiaisAtivos = materiais.filter((m) => m?.isAtivo === true || m?.ativo === true);
        setAvailableMaterials(materiaisAtivos);
      }
    } catch (err) {
      console.error('❌ Erro ao pré-carregar materiais do estoque:', err);
    } finally {
      setLoadingMaterials(false);
    }
  };

  const loadServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await listarServicos();

      let data = [];
      if (Array.isArray(res)) {
        data = res;
      } else if (Array.isArray(res?.data)) {
        data = res.data;
      } else if (res && typeof res === 'object') {
        data = Array.isArray(res.content) ? res.content : data;
      }

      console.log("📊 Dados de serviços processados para renderização:", data);
      setServices(data.map(mapFromApi));
    } catch (err) {
      console.error('Erro ao carregar serviços', err);
      setError('Não foi possível carregar os serviços.');
    } finally {
      setLoading(false);
    }
  };

  // 🌟 ALTERAÇÃO: Agora carrega ambos no início da tela
  useEffect(() => {
    loadServices();
    loadMaterials();
  }, []);

  const handleEdit = (service) => {
    // Garante que o array de materiais contenha apenas os IDs para o checkbox funcionar na modal
    const materialIds = (service.materials || []).map(m => typeof m === 'object' ? (m?.idMaterial ?? m?.id ?? m?.idEstoque) : m);
    setEditingService({ ...service, materials: materialIds });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!editingService) return;

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

  const hasLowStockMaterials = (service) => {
    if (!service.materials || service.materials.length === 0) return false;
    return service.materials.some((mat) => {
      const materialId = typeof mat === 'object' ? (mat?.idMaterial ?? mat?.id ?? mat?.idEstoque) : mat;
      const material = availableMaterials.find(
        (m) => (m?.idMaterial ?? m?.id ?? m?.idEstoque ?? m?.nomeItem) === materialId
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
      categoria: '',
      active: true,
      materials: [],
      fotoUrl: '', 
    });
    setShowModal(true);
  };

  // Helper para buscar o nome legível de um material a partir do ID ou do Objeto retornado
  const getMaterialName = (mat) => {
    if (typeof mat === 'object' && (mat?.nomeItem || mat?.nome)) {
      return mat.nomeItem ?? mat.nome;
    }
    const found = availableMaterials.find(
      (m) => (m?.idMaterial ?? m?.id ?? m?.idEstoque) === mat
    );
    return found ? (found.nomeItem ?? found.nome) : `Material (ID: ${mat})`;
  };

  const processFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Por favor, envie apenas arquivos de imagem.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setEditingService((prev) => ({ ...prev, fotoUrl: event.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          processFile(file);
          break;
        }
      }
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
          onClick={() => { loadServices(); loadMaterials(); }}
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
        onClick={handleAddNew}
        disabled={loadingMaterials}
        className="w-full bg-accent text-white py-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus size={20} />
        <span>Adicionar Novo Serviço</span>
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
              className={`bg-white rounded-xl overflow-hidden shadow-md transition-all border-l-4 flex flex-col justify-between ${service.active ? '' : 'opacity-60'
                } ${lowStockAlert ? 'border-l-amber-400' : 'border-l-transparent'
                }`}
            >
              <div className="flex flex-col sm:flex-row items-stretch">
                <div className="w-full sm:w-32 h-32 bg-gray-55 shrink-0 flex items-center justify-center text-gray-400 border-b sm:border-b-0 sm:border-r border-gray-100 relative overflow-hidden">
                  {service.fotoUrl ? (
                    <img src={service.fotoUrl} alt={service.name} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon size={28} className="text-gray-300" />
                  )}
                </div>

                <div className="p-4 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-primary">{service.name}</h3>
                    
                    {service.categoria && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-purple-100 text-primary font-medium">
                        {service.categoria}
                      </span>
                    )}

                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${service.active
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
                    <p className="text-accent font-semibold">R$ {service.price}</p>
                    <p className="text-gray-500">{service.duration} min</p>
                  </div>
                  
                  {/* 🌟 CORREÇÃO AQUI: Traduzindo IDs de materiais para Nomes reais na listagem */}
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
                            {getMaterialName(material)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 p-4 pt-0">
                <button
                  onClick={() => handleToggleActive(service)}
                  className={`flex-1 py-2 rounded-lg text-sm transition-colors ${service.active
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
                <label className="text-sm text-gray-600 mb-2 block">Foto do Serviço (Arraste ou cole aqui)</label>
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onPaste={handlePaste}
                  tabIndex="0"
                  className={`w-full h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-3 text-center transition-all outline-none focus:ring-2 focus:ring-primary overflow-hidden relative group ${
                    isDragActive ? 'border-primary bg-purple-50 scale-[0.99]' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  {editingService.fotoUrl ? (
                    <>
                      <img src={editingService.fotoUrl} alt="Preview" className="w-full h-full object-cover absolute inset-0" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium backdrop-blur-[2px]">
                        Arraste ou Cole uma nova foto para substituir
                      </div>
                    </>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                      <Upload size={24} className="text-gray-400 mb-1" />
                      <p className="text-xs font-semibold text-gray-700">Arraste ou cole uma imagem</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">ou clique aqui para abrir os arquivos</p>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => { if (e.target.files?.[0]) processFile(e.target.files[0]); }}
                      />
                    </label>
                  )}
                </div>
              </div>

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
                <label className="text-sm text-gray-600 mb-2 block">Categoria</label>
                <select
                  value={editingService.categoria}
                  onChange={(e) =>
                    setEditingService({ ...editingService, categoria: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer text-sm"
                >
                  <option value="">Selecione uma categoria...</option>
                  {categoriasDisponiveis.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
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
                      const matId = material?.idMaterial ?? material?.id ?? material?.idEstoque ?? material?.nomeItem;
                      const matNome = material?.nomeItem ?? material?.nome ?? material?.name ?? 'Material sem nome';
                      const matQuantidade = material?.quantidadeAtual ?? material?.quantidade ?? material?.qtd ?? 0;
                      const matMinima = material?.quantidadeMinima ?? 0;
                      const isAtivo = material?.isAtivo === true || material?.ativo === true;

                      if (!isAtivo) return null;

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
                              } else {
                                updatedMaterials = updatedMaterials.filter((m) => m !== matId);
                              }
                              setEditingService({ ...editingService, materials: updatedMaterials });
                            }}
                            className="w-4 h-4 accent-primary cursor-pointer"
                          />
                          <div className="flex-1">
                            <span className="text-sm text-gray-700 font-medium">{matNome}</span>
                            <span className={`text-xs ml-2 ${matQuantidade <= matMinima
                                ? 'text-red-600 font-semibold'
                                : 'text-gray-500'
                              }`}>
                              Qtd: {matQuantidade} {matQuantidade <= matMinima ? '(⚠️ baixo)' : ''}
                            </span>
                          </div>
                        </label>
                      );
                    }).filter(Boolean)
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