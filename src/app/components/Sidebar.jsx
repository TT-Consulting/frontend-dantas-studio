import { House, Calendar, DollarSign, StickyNote, BarChart3, Settings, MapPin, Clock, Scissors, Package, UserX, LogOut } from 'lucide-react';

export function Sidebar({ activeScreen, onNavigate, onSettingsClick, onLogout }) {
  const navItems = [
    { id: 'home', icon: House, label: 'Home' },
    { id: 'calendar', icon: Calendar, label: 'Agenda' },
    { id: 'finance', icon: DollarSign, label: 'Finanças' },
    { id: 'dashboard', icon: BarChart3, label: 'Relatórios' },
    { id: 'notes', icon: StickyNote, label: 'Notas' },
  ];

  const managementItems = [
    { id: 'locations', icon: MapPin, label: 'Local de Atendimento' },
    { id: 'business-hours', icon: Clock, label: 'Horário Comercial' },
    { id: 'services', icon: Scissors, label: 'Gestão de Serviços' },
    { id: 'inventory', icon: Package, label: 'Estoque e Materiais' },
    { id: 'inactive-clients', icon: UserX, label: 'Clientes Desativados' },
  ];

  return (
    <aside className="hidden lg:flex lg:flex-col lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:w-20 lg:hover:w-64 xl:hover:w-72 bg-white border-r border-gray-200 shadow-lg z-40 transition-all duration-300 group">
      {/* Logo/Header */}
      <div className="p-4 lg:p-6 border-b border-gray-200 overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">SA</span>
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            <h1 className="text-primary text-xl">Studio Annika</h1>
            <p className="text-gray-500 text-xs">Gestão de Beleza</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3">
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeScreen === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-md'
                    : 'text-gray-600 hover:bg-purple-50 hover:text-primary'
                }`}
                title={item.label}
              >
                <Icon size={22} strokeWidth={2} className="flex-shrink-0" />
                <span className="font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Management Section */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 mb-3 px-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
              Central de Gestão
            </p>
          </div>
          <div className="space-y-2">
            {managementItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeScreen === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-primary text-white shadow-md'
                      : 'text-gray-600 hover:bg-purple-50 hover:text-primary'
                  }`}
                  title={item.label}
                >
                  <Icon size={20} strokeWidth={2} className="flex-shrink-0" />
                  <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Footer - Settings & Logout */}
      <div className="p-3 border-t border-gray-200">
        <div className="space-y-2">
          <button
            onClick={onSettingsClick}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-gray-600 hover:bg-purple-50 hover:text-primary transition-all"
            title="Configurações"
          >
            <Settings size={22} strokeWidth={2} className="flex-shrink-0" />
            <span className="font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              Configurações
            </span>
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all"
            title="Sair"
          >
            <LogOut size={22} strokeWidth={2} className="flex-shrink-0" />
            <span className="font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              Sair
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}
