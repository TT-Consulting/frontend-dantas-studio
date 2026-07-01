import React from 'react';
import { Search, Users, Plus, Edit2, UserX } from 'lucide-react';

export function ClientsTab({ 
  searchQuery, 
  setSearchQuery, 
  stats,
  filteredClients, 
  openClientDetails, 
  handleNewClientClick,
  handleToggleStatus,
  clientsLoading,
  clientsError
}) {
  return (
    <>
      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome ou telefone..."
            className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-xl p-4 shadow-md mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users className="text-primary" size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total de Clientes</p>
              <p className="text-primary text-2xl">{stats.clients}</p>
            </div>
          </div>
          <button
            onClick={handleNewClientClick}
            className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="text-white" size={24} />
          </button>
        </div>
      </div>

      {/* Clients List Loading/Error states */}
      {clientsLoading && (
        <div className="text-center py-6 text-primary flex items-center justify-center gap-2">
          <span className="animate-spin inline-block border-2 border-primary border-t-transparent rounded-full w-4 h-4"></span>
          <span>Carregando clientes...</span>
        </div>
      )}

      {clientsError && (
        <div className="text-center py-6 text-red-600 bg-red-50 rounded-xl border border-red-100">
          {clientsError}
        </div>
      )}

      {!clientsLoading && !clientsError && (
        <>
          <div className="space-y-3 pb-4">
            {filteredClients.map((client) => (
              <div
                key={client.id}
                className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3 cursor-pointer" onClick={() => openClientDetails(client)}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-semibold text-lg">
                        {client.name ? client.name.charAt(0) : 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-800 font-medium">{client.name}</p>
                      <p className="text-gray-600 text-sm">{client.phone}</p>
                      {client.localidade && (
                        <p className="text-gray-500 text-xs">{client.localidade}</p>
                      )}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs ${client.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {client.status === 'active' ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium text-primary">{client.totalVisits}</span> visits
                    {client.lastVisit && client.lastVisit !== '—' && (
                      <span className="ml-2">• Última: {new Date(client.lastVisit).toLocaleDateString('pt-BR')}</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openClientDetails(client, true); // passa flag para abrir editando
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="text-primary" size={16} />
                    </button>
                    <button 
                      onClick={(e) => handleToggleStatus(client, e)} 
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <UserX className="text-red-500" size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredClients.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="text-gray-400" size={32} />
              </div>
              <p className="text-gray-500">Nenhum cliente encontrado</p>
            </div>
          )}
        </>
      )}
    </>
  );
}