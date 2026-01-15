import { useState } from 'react';
import { ArrowLeft, Users, UserCheck, Trash2, Search } from 'lucide-react';

export function InactiveClients({ onBack }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [clients, setClients] = useState([
    {
      id: '1',
      name: 'Camila Rodrigues',
      phone: '+55 11 93210-9876',
      email: 'camila@email.com',
      lastVisit: '2024-08-15',
      totalVisits: 6,
      deactivatedDate: '2024-10-20',
      reason: 'Mudou de cidade',
    },
    {
      id: '2',
      name: 'Daniela Souza',
      phone: '+55 11 92109-8765',
      email: 'daniela@email.com',
      lastVisit: '2024-06-10',
      totalVisits: 3,
      deactivatedDate: '2024-09-15',
    },
    {
      id: '3',
      name: 'Roberta Alves',
      phone: '+55 11 91098-7654',
      email: 'roberta@email.com',
      lastVisit: '2024-05-22',
      totalVisits: 10,
      deactivatedDate: '2024-11-01',
      reason: 'Preferiu outro profissional',
    },
  ]);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone.includes(searchQuery)
  );

  const handleReactivate = (id) => {
    if (confirm('Deseja reativar esta cliente?')) {
      const client = clients.find(c => c.id === id);
      alert(`${client?.name} foi reativada e agora aparece na lista de clientes ativos!`);
      setClients(clients.filter(c => c.id !== id));
    }
  };

  const handleDelete = (id) => {
    if (confirm('Tem certeza que deseja excluir permanentemente este registro? Esta ação não pode ser desfeita.')) {
      setClients(clients.filter(c => c.id !== id));
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
        <h2 className="text-primary text-2xl">Clientes Desativados</h2>
        <p className="text-gray-600 text-sm mt-1">Arquivo de clientes inativos</p>
      </div>

      {/* Search Bar */}
      <div className="px-5 pt-6 pb-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar cliente desativado..."
            className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="px-5 pb-4">
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Users className="text-gray-600" size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Clientes Desativados</p>
              <p className="text-gray-800 text-2xl">{clients.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Clients List */}
      <div className="px-5 space-y-3 pb-6">
        {filteredClients.map((client) => (
          <div key={client.id} className="bg-white rounded-xl p-5 shadow-md">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-semibold text-lg">
                    {client.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-gray-800 font-medium">{client.name}</p>
                  <p className="text-gray-600 text-sm">{client.phone}</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                Inativa
              </span>
            </div>

            <div className="space-y-2 mb-3 pb-3 border-b border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total de visitas:</span>
                <span className="text-gray-800 font-medium">{client.totalVisits}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Última visita:</span>
                <span className="text-gray-800">{new Date(client.lastVisit).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Desativada em:</span>
                <span className="text-gray-800">{new Date(client.deactivatedDate).toLocaleDateString('pt-BR')}</span>
              </div>
              {client.reason && (
                <div className="bg-gray-50 rounded-lg p-2 mt-2">
                  <p className="text-xs text-gray-600">Motivo: {client.reason}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleReactivate(client.id)}
                className="flex-1 py-2 bg-primary text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <UserCheck size={16} />
                <span className="text-sm">Reativar</span>
              </button>
              <button
                onClick={() => handleDelete(client.id)}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="text-red-500" size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12 px-5">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Users className="text-gray-400" size={32} />
          </div>
          <p className="text-gray-500 mb-2">Nenhum cliente desativado encontrado</p>
          <p className="text-gray-400 text-sm">
            {searchQuery
              ? 'Tente buscar por outro nome ou telefone'
              : 'Quando você desativar clientes, eles aparecerão aqui'}
          </p>
        </div>
      )}

      {/* Info Card */}
      <div className="px-5 pb-6">
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
          <p className="text-purple-700 text-sm">
            💡 Clientes desativados não aparecem na lista principal e não podem fazer novos agendamentos. 
            Você pode reativá-los a qualquer momento.
          </p>
        </div>
      </div>
    </div>
  );
}
