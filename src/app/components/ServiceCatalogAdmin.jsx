import { useState } from 'react';
import { Plus, Edit2, Trash2, X, Save } from 'lucide-react';

export function ServiceCatalogAdmin() {
  const [services, setServices] = useState([
    {
      id: '1',
      name: 'Manicure',
      description: 'Classic nail care with polish',
      price: '50',
      duration: '45',
      active: true,
      materials: ['Esmalte', 'Lixa de unhas', 'Hidratante para mãos', 'Alongador de unhas'],
    },
    {
      id: '2',
      name: 'Pedicure',
      description: 'Relaxing foot treatment',
      price: '60',
      duration: '60',
      active: true,
      materials: [],
    },
    {
      id: '3',
      name: 'Gel Nails',
      description: 'Long-lasting gel manicure',
      price: '120',
      duration: '90',
      active: true,
      materials: [],
    },
    {
      id: '4',
      name: 'Nail Art Design',
      description: 'Custom artistic designs',
      price: '150',
      duration: '120',
      active: true,
      materials: [],
    },
    {
      id: '5',
      name: 'Spa Manicure',
      description: 'Luxury spa experience',
      price: '85',
      duration: '75',
      active: true,
      materials: [],
    },
    {
      id: '6',
      name: 'Acrylic Nails',
      description: 'Professional extensions',
      price: '180',
      duration: '120',
      active: false,
      materials: [],
    },
  ]);

  const [editingService, setEditingService] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleEdit = (service) => {
    setEditingService({ ...service });
    setShowModal(true);
  };

  const handleSave = () => {
    if (editingService) {
      setServices(
        services.map((s) => (s.id === editingService.id ? editingService : s))
      );
      setShowModal(false);
      setEditingService(null);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      setServices(services.filter((s) => s.id !== id));
    }
  };

  const handleToggleActive = (id) => {
    setServices(
      services.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    );
  };

  const handleAddNew = () => {
    const newService = {
      id: Date.now().toString(),
      name: '',
      description: '',
      price: '',
      duration: '',
      active: true,
      materials: [],
    };
    setEditingService(newService);
    setShowModal(true);
  };

  return (
    <div className="pb-24 px-5 pt-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-primary">Catálogo de Serviços</h2>
        <p className="text-gray-600 text-sm">Gerencie seus serviços e preços</p>
      </div>

      {/* Add New Button */}
      <button
        onClick={handleAddNew}
        className="w-full bg-accent text-white py-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mb-6"
      >
        <Plus size={20} />
        <span>Adicionar Novo Serviço</span>
      </button>

      {/* Services List */}
      <div className="space-y-3">
        {services.map((service) => (
          <div
            key={service.id}
            className={`bg-white rounded-xl p-4 shadow-md transition-all ${
              service.active ? '' : 'opacity-60'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
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
                </div>
                <p className="text-gray-600 text-sm mb-2">{service.description}</p>
                <div className="flex items-center gap-4 text-sm">
                  <p className="text-accent">R$ {service.price}</p>
                  <p className="text-gray-500">{service.duration} min</p>
                </div>
                {service.materials && service.materials.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Materiais Inclusos</p>
                    <div className="flex flex-wrap gap-1.5">
                      {service.materials.map((material, idx) => (
                        <span key={idx} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
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
                onClick={() => handleToggleActive(service.id)}
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
        ))}
      </div>

      {/* Edit Modal */}
      {showModal && editingService && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-5">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-primary">
                {editingService.id in services ? 'Editar Serviço' : 'Novo Serviço'}
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
                <div className="space-y-2">
                  {editingService.materials && editingService.materials.map((material, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={material}
                        onChange={(e) => {
                          const updatedMaterials = [...(editingService.materials || [])];
                          updatedMaterials[idx] = e.target.value;
                          setEditingService({ ...editingService, materials: updatedMaterials });
                        }}
                        placeholder="Ex: Esmalte"
                        className="flex-1 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <button
                        onClick={() => {
                          const updatedMaterials = editingService.materials.filter((_, i) => i !== idx);
                          setEditingService({ ...editingService, materials: updatedMaterials });
                        }}
                        className="px-3 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const updatedMaterials = [...(editingService.materials || []), ''];
                      setEditingService({ ...editingService, materials: updatedMaterials });
                    }}
                    className="w-full py-2 border border-dashed border-gray-300 text-gray-600 rounded-xl hover:border-primary hover:text-primary transition-colors text-sm"
                  >
                    + Adicionar Material
                  </button>
                </div>
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
