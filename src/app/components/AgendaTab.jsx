import React from 'react';
import { Calendar, Clock, DollarSign, Users, Plus, Phone, Settings, MapPin, ChevronRight } from 'lucide-react';

export function AgendaTab({ 
  todayAppointments, 
  stats, 
  loading,
  error,
  openAppointmentDetails, 
  openNewAppointmentModal,
  onServiceCatalogClick,
  onAutomationClick,
  onProcessFlowClick,
  onVerProximosAgendamentos
}) {
  return (
    <>
      {/* Stats Cards - Desktop Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 lg:p-5 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Calendar className="text-primary" size={20} />
            </div>
            <div>
              <p className="text-gray-600 text-xs lg:text-sm">Hoje</p>
              <p className="text-primary text-xl lg:text-2xl">{stats.today}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 lg:p-5 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-accent/10 rounded-lg flex items-center justify-center">
              <Clock className="text-accent" size={20} />
            </div>
            <div>
              <p className="text-gray-600 text-xs lg:text-sm">Pendentes</p>
              <p className="text-accent text-xl lg:text-2xl">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 lg:p-5 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-gray-600 text-xs lg:text-sm">Receita Hoje</p>
              <p className="text-green-600 text-xl lg:text-2xl">{stats.revenue}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 lg:p-5 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-gray-600 text-xs lg:text-sm">Clientes</p>
              <p className="text-blue-600 text-xl lg:text-2xl">{stats.clients}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop: Two Column Layout */}
      <div className="lg:grid lg:grid-cols-3 lg:gap-6">
        
        {/* Today's Appointments Section */}
        <div className="mb-6 lg:col-span-2 lg:mb-0">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-gray-800">Agenda de Hoje</h3>
              {todayAppointments.length > 0 && (
                <button 
                  onClick={onVerProximosAgendamentos}
                  className="text-xs text-primary font-medium flex items-center hover:underline ml-2"
                >
                  Ver próximos <ChevronRight size={14} />
                </button>
              )}
            </div>
            <button
              onClick={openNewAppointmentModal}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Plus size={18} />
              <span className="hidden lg:inline">Novo Agendamento</span>
            </button>
          </div>

          {/* Tratamento de Estados da API */}
          {loading && (
            <div className="bg-white rounded-xl p-8 text-center shadow-md text-primary flex items-center justify-center gap-2">
              <span className="animate-spin inline-block border-2 border-primary border-t-transparent rounded-full w-4 h-4"></span>
              <span>Sincronizando agenda...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 rounded-xl p-4 text-center shadow-sm">
              {error}
            </div>
          )}

          {/* Lista de cards ou Estado Vazio Integral */}
          {!loading && !error && (
            todayAppointments.length > 0 ? (
              <div className="space-y-3">
                {todayAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    onClick={() => openAppointmentDetails(appointment)}
                    className="bg-white rounded-xl p-4 lg:p-5 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 lg:w-14 lg:h-14 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Clock className="text-primary" size={20} />
                        </div>
                        <div>
                          <p className="text-primary font-medium lg:text-lg">{appointment.client}</p>
                          <p className="text-gray-600 text-sm lg:text-base">{appointment.service}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-800 font-medium lg:text-lg">{appointment.time}</p>
                        <p className="text-gray-500 text-xs lg:text-sm">{appointment.duration}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <Phone size={14} />
                        <span>{appointment.phone}</span>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs lg:text-sm ${
                          appointment.status === 'confirmed' || appointment.status === 'Confirmado'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {appointment.status === 'confirmed' || appointment.status === 'Confirmado' ? 'Confirmado' : 'Pendente'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Interface quando não houver agendamentos restantes ou marcados para hoje */
              <div className="bg-white rounded-xl p-8 text-center shadow-md border border-dashed border-gray-200 flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                  <Calendar className="text-gray-400" size={28} />
                </div>
                <p className="text-gray-700 font-medium mb-1">Não temos nenhum agendamento para a data de hoje.</p>
                <p className="text-gray-400 text-sm mb-5">Sua lista se atualiza automaticamente conforme o dia avança.</p>
                <button
                  onClick={onVerProximosAgendamentos}
                  className="bg-primary/10 text-primary px-5 py-2.5 rounded-xl font-medium hover:bg-primary/20 transition-all text-sm flex items-center gap-2"
                >
                  <Calendar size={16} />
                  Ver próximos agendamentos
                </button>
              </div>
            )
          )}
        </div>

        {/* Quick Actions - Desktop Sidebar */}
        <div className="lg:col-span-1">
          <h3 className="text-gray-800 mb-4">Ações Rápidas</h3>
          <div className="space-y-3">
            <button
              onClick={onServiceCatalogClick}
              className="w-full bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all text-left flex items-center gap-3"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Calendar className="text-primary" size={20} />
              </div>
              <div>
                <p className="text-gray-800 font-medium">Catálogo</p>
                <p className="text-gray-500 text-xs">Serviços</p>
              </div>
            </button>

            <button
              onClick={onAutomationClick}
              className="w-full bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all text-left flex items-center gap-3"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Settings className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-gray-800 font-medium">Automação</p>
                <p className="text-gray-500 text-xs">Regras de Automação</p>
              </div>
            </button>

            <button
              onClick={onProcessFlowClick}
              className="w-full bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all text-left flex items-center gap-3"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <MapPin className="text-purple-600" size={20} />
              </div>
              <div>
                <p className="text-gray-800 font-medium">Processos</p>
                <p className="text-gray-500 text-xs">Fluxograma</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}