import { useState } from 'react';
import { Search, User, Phone, Mail, Calendar, X, AlertCircle } from 'lucide-react';

export function ClientsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);

  const clients = [
    {
      id: '1',
      name: 'Maria Silva',
      phone: '+55 11 98765-4321',
      email: 'maria.silva@email.com',
      totalVisits: 12,
      lastVisit: '2025-12-15',
      preferences: 'Loves French tips, allergic to certain gel brands',
      upcomingAppointment: '2025-12-19 at 10:00',
      totalSpent: 'R$ 1,440',
    },
    {
      id: '2',
      name: 'Ana Costa',
      phone: '+55 11 98765-1234',
      email: 'ana.costa@email.com',
      totalVisits: 8,
      lastVisit: '2025-12-12',
      preferences: 'Prefers short nails, likes nude colors',
      upcomingAppointment: '2025-12-19 at 14:00',
      totalSpent: 'R$ 680',
    },
    {
      id: '3',
      name: 'Julia Santos',
      phone: '+55 11 98765-5678',
      email: 'julia.santos@email.com',
      totalVisits: 15,
      lastVisit: '2025-12-10',
      preferences: 'Always wants intricate nail art, prefers long nails',
      upcomingAppointment: 'None',
      totalSpent: 'R$ 2,250',
    },
    {
      id: '4',
      name: 'Carla Oliveira',
      phone: '+55 11 98765-8765',
      email: 'carla.oliveira@email.com',
      totalVisits: 6,
      lastVisit: '2025-12-08',
      preferences: 'Sensitive cuticles, prefers organic products',
      upcomingAppointment: '2025-12-20 at 16:00',
      totalSpent: 'R$ 510',
    },
    {
      id: '5',
      name: 'Beatriz Lima',
      phone: '+55 11 98765-4567',
      email: 'beatriz.lima@email.com',
      totalVisits: 20,
      lastVisit: '2025-12-17',
      preferences: 'VIP client, loves bold colors and glitter',
      upcomingAppointment: '2025-12-22 at 15:00',
      totalSpent: 'R$ 4,000',
    },
  ];

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pb-24 px-5 pt-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-primary">Client Management</h2>
        <p className="text-gray-600 text-sm">View and manage your clients</p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search clients..."
          className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border-2 border-gray-200 focus:outline-none focus:border-primary transition-colors shadow-md"
        />
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl p-3 shadow-md text-center">
          <p className="text-2xl text-primary">{clients.length}</p>
          <p className="text-gray-600 text-xs mt-1">Total Clients</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-md text-center">
          <p className="text-2xl text-accent">15</p>
          <p className="text-gray-600 text-xs mt-1">This Month</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-md text-center">
          <p className="text-2xl text-primary">3</p>
          <p className="text-gray-600 text-xs mt-1">VIP Clients</p>
        </div>
      </div>

      {/* Client List */}
      <div className="space-y-3">
        {filteredClients.map((client) => (
          <button
            key={client.id}
            onClick={() => setSelectedClient(client)}
            className="w-full bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow text-left"
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="text-primary" size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-primary truncate">{client.name}</p>
                  <span className="text-xs text-gray-500">{client.totalVisits} visits</span>
                </div>
                <p className="text-gray-600 text-sm mb-1">{client.phone}</p>
                <p className="text-gray-500 text-xs">Last visit: {client.lastVisit}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Client Profile Modal */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center">
          <div className="bg-white rounded-t-3xl md:rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-primary text-white p-6 rounded-t-3xl md:rounded-t-xl">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="text-white" size={28} />
                  </div>
                  <div>
                    <h3 className="text-white">{selectedClient.name}</h3>
                    <p className="text-purple-200 text-sm">{selectedClient.totalVisits} visits</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedClient(null)}
                  className="text-white/80 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Contact Info */}
              <div>
                <h4 className="text-gray-800 mb-3">Contact Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="text-accent flex-shrink-0" size={20} />
                    <span className="text-gray-700 text-sm">{selectedClient.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="text-accent flex-shrink-0" size={20} />
                    <span className="text-gray-700 text-sm">{selectedClient.email}</span>
                  </div>
                </div>
              </div>

              {/* Visit Stats */}
              <div>
                <h4 className="text-gray-800 mb-3">Visit Statistics</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-purple-50 rounded-lg p-3">
                    <p className="text-gray-600 text-sm mb-1">Total Spent</p>
                    <p className="text-xl text-primary">{selectedClient.totalSpent}</p>
                  </div>
                  <div className="bg-pink-50 rounded-lg p-3">
                    <p className="text-gray-600 text-sm mb-1">Last Visit</p>
                    <p className="text-gray-800">{selectedClient.lastVisit}</p>
                  </div>
                </div>
              </div>

              {/* Upcoming Appointment */}
              <div>
                <h4 className="text-gray-800 mb-3">Upcoming Appointment</h4>
                {selectedClient.upcomingAppointment !== 'None' ? (
                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <Calendar className="text-green-600" size={20} />
                    <span className="text-green-700">{selectedClient.upcomingAppointment}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <AlertCircle className="text-gray-400" size={20} />
                    <span className="text-gray-500">No upcoming appointments</span>
                  </div>
                )}
              </div>

              {/* Personal Notes */}
              <div>
                <h4 className="text-gray-800 mb-3">Personal Notes & Preferences</h4>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-gray-700 text-sm">{selectedClient.preferences}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button className="py-3 bg-primary text-white rounded-xl hover:shadow-lg transition-shadow">
                  Book Appointment
                </button>
                <button className="py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:border-primary transition-colors">
                  Edit Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
