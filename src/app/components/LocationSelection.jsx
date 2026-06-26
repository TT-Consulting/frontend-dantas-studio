import { Home, Building2, MapPin } from 'lucide-react';

export function LocationSelection({ selectedLocation, setSelectedLocation, address, setAddress, onNext }) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-xl font-bold text-gray-900">Onde deseja o atendimento?</h2>

      <div className="grid grid-cols-2 gap-4">
        {/* Opção Estúdio */}
        <div
          onClick={() => setSelectedLocation('studio')}
          className={`p-5 rounded-2xl bg-white border-2 text-center cursor-pointer transition-all ${
            selectedLocation === 'studio' ? 'border-primary bg-purple-50/30' : 'border-gray-100'
          }`}
        >
          <div className="w-12 h-12 bg-purple-50 text-primary rounded-xl flex items-center justify-center mx-auto mb-3">
            <Building2 size={24} />
          </div>
          <h3 className="font-bold text-gray-800 text-sm">No Estúdio</h3>
          <p className="text-xs text-gray-400 mt-1">Endereço fixo do Studio</p>
        </div>

        {/* Opção Atendimento a Domicílio */}
        <div
          onClick={() => setSelectedLocation('home')}
          className={`p-5 rounded-2xl bg-white border-2 text-center cursor-pointer transition-all ${
            selectedLocation === 'home' ? 'border-primary bg-purple-50/30' : 'border-gray-100'
          }`}
        >
          <div className="w-12 h-12 bg-purple-50 text-primary rounded-xl flex items-center justify-center mx-auto mb-3">
            <Home size={24} />
          </div>
          <h3 className="font-bold text-gray-800 text-sm">A Domicílio</h3>
          <p className="text-xs text-gray-400 mt-1">Vou até a sua casa (+ taxa)</p>
        </div>
      </div>

      {/* Formulário de Endereço se for Atendimento Domiciliar */}
      {selectedLocation === 'home' && (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-3 dynamic-form">
          <h4 className="font-semibold text-sm text-gray-700 flex items-center gap-1.5">
            <MapPin size={16} className="text-primary" /> Endereço de Entrega
          </h4>
          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="CEP"
              value={address.zip}
              onChange={(e) => setAddress({ ...address, zip: e.target.value })}
              className="col-span-1 p-3 text-sm border border-gray-200 rounded-xl focus:outline-primary"
            />
            <input
              type="text"
              placeholder="Rua / Logradouro"
              value={address.street}
              onChange={(e) => setAddress({ ...address, street: e.target.value })}
              className="col-span-2 p-3 text-sm border border-gray-200 rounded-xl focus:outline-primary"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="Bairro"
              value={address.neighborhood}
              onChange={(e) => setAddress({ ...address, neighborhood: e.target.value })}
              className="col-span-2 p-3 text-sm border border-gray-200 rounded-xl focus:outline-primary"
            />
            <input
              type="text"
              placeholder="Número"
              value={address.number}
              onChange={(e) => setAddress({ ...address, number: e.target.value })}
              className="col-span-1 p-3 text-sm border border-gray-200 rounded-xl focus:outline-primary"
            />
          </div>
        </div>
      )}

      {/* Botão Fixo */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-5 py-4 shadow-lg z-40">
        <div className="max-w-md mx-auto">
          <button
            onClick={onNext}
            disabled={!selectedLocation || (selectedLocation === 'home' && !address.street)}
            className="w-full bg-accent text-white py-4 rounded-xl font-semibold shadow-md disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Avançar para Horário
          </button>
        </div>
      </div>
    </div>
  );
}