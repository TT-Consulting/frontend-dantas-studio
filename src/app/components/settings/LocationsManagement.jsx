import { useState } from 'react';
import { ArrowLeft, MapPin, Plus, Edit2, Trash2, Home, Building2, DollarSign, Check, X } from 'lucide-react';

export function LocationsManagement({ onBack }) {
  const [locations, setLocations] = useState([
    {
      id: '1',
      name: 'Studio Annika - Jardins',
      address: 'Rua das Flores, 123 - Jardins, São Paulo',
      type: 'salon',
      additionalFee: 0,
      active: true,
    },
    {
      id: '2',
      name: 'Espaço Beleza - Moema',
      address: 'Av. Moema, 456 - Moema, São Paulo',
      type: 'salon',
      additionalFee: 0,
      active: true,
    },
    {
      id: '3',
      name: 'Atendimento a Domicílio',
      address: 'No conforto da casa da cliente',
      type: 'home',
      additionalFee: 30,
      active: true,
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    type: 'salon',
    additionalFee: 0,
  });

  const handleSave = () => {
    if (!formData.name || !formData.address) return;

    if (editingLocation) {
      setLocations(locations.map(loc =>
        loc.id === editingLocation.id
          ? { ...loc, ...formData }
          : loc
      ));
    } else {
      const newLocation = {
        id: Date.now().toString(),
        ...formData,
        active: true,
      };
      setLocations([...locations, newLocation]);
    }

    setShowAddModal(false);
    setEditingLocation(null);
    setFormData({ name: '', address: '', type: 'salon', additionalFee: 0 });
  };

  const handleEdit = (location) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      address: location.address,
      type: location.type,
      additionalFee: location.additionalFee,
    });
    setShowAddModal(true);
  };

  const handleDelete = (id) => {
    if (confirm('Tem certeza que deseja remover este local?')) {
      setLocations(locations.filter(loc => loc.id !== id));
    }
  };

  const toggleActive = (id) => {
    setLocations(locations.map(loc =>
      loc.id === id ? { ...loc, active: !loc.active } : loc
    ));
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
        <h2 className="text-primary text-2xl">Locais de Atendimento</h2>
        <p className="text-gray-600 text-sm mt-1">Gerencie onde você atende suas clientes</p>
      </div>

      {/* Locations List */}
      <div className="px-5 py-6 space-y-3">
        {locations.map((location) => {
          const Icon = location.type === 'salon' ? Building2 : Home;
          return (
            <div
              key={location.id}
              className={`bg-white rounded-xl p-5 shadow-md ${
                !location.active ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  location.type === 'salon' ? 'bg-blue-100' : 'bg-purple-100'
                }`}>
                  <Icon className={location.type === 'salon' ? 'text-blue-600' : 'text-purple-600'} size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-gray-800 font-semibold mb-1">{location.name}</h3>
                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                    <MapPin size={14} />
                    <span>{location.address}</span>
                  </div>
                  {location.additionalFee > 0 && (
                    <div className="flex items-center gap-2 bg-accent/10 px-3 py-1 rounded-lg inline-flex">
                      <DollarSign size={14} className="text-accent" />
                      <span className="text-accent text-sm font-medium">
                        Taxa: R$ {location.additionalFee}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => toggleActive(location.id)}
                  className={`flex-1 py-2 rounded-lg text-sm transition-colors ${
                    location.active
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {location.active ? '✓ Ativo' : 'Inativo'}
                </button>
                <button
                  onClick={() => handleEdit(location)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Edit2 className="text-primary" size={18} />
                </button>
                <button
                  onClick={() => handleDelete(location.id)}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="text-red-500" size={18} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Card */}
      <div className="px-5 pb-6">
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
          <p className="text-purple-700 text-sm">
            💡 Os locais inativos não aparecerão como opção no agendamento das clientes.
          </p>
        </div>
      </div>

      {/* Add Button */}
      <button
        onClick={() => {
          setEditingLocation(null);
          setFormData({ name: '', address: '', type: 'salon', additionalFee: 0 });
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
                {editingLocation ? 'Editar Local' : 'Adicionar Local'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingLocation(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 mb-2 block">Tipo de Local</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setFormData({ ...formData, type: 'salon' })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.type === 'salon'
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Building2 className={formData.type === 'salon' ? 'text-primary' : 'text-gray-400'} size={24} />
                    <p className={`text-sm mt-2 ${formData.type === 'salon' ? 'text-primary font-medium' : 'text-gray-600'}`}>
                      Studio
                    </p>
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, type: 'home' })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.type === 'home'
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Home className={formData.type === 'home' ? 'text-primary' : 'text-gray-400'} size={24} />
                    <p className={`text-sm mt-2 ${formData.type === 'home' ? 'text-primary font-medium' : 'text-gray-600'}`}>
                      Domicílio
                    </p>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-2 block">Nome do Local</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Studio Annika - Jardins"
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-2 block">Endereço</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Ex: Rua das Flores, 123 - Jardins, São Paulo"
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-2 block">
                  Taxa Adicional (R$)
                  {formData.type === 'home' && (
                    <span className="text-accent ml-1">(recomendado para domicílio)</span>
                  )}
                </label>
                <input
                  type="number"
                  value={formData.additionalFee}
                  onChange={(e) => setFormData({ ...formData, additionalFee: Number(e.target.value) })}
                  placeholder="0"
                  min="0"
                  step="5"
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingLocation(null);
                }}
                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.name || !formData.address}
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
