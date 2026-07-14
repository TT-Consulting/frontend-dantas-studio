import { MapPin, Clock, Scissors, Package, UserX, ChevronRight, ArrowLeft, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const localTranslations = {
  'pt-BR': {
    title: 'Configurações',
    subtitle: 'Painel de Controle Operacional',
    backBtn: 'Voltar',
    logoutBtn: 'Sair da Conta',
    logoutSub: 'Voltar para a página institucional',
    tipTitle: 'Dica de Gestão:',
    tipContent: 'Configure atentamente os seus horários e locais de atendimento para que as automações e notificações de agendamento online operem com precisão cirúrgica.',
    options: {
      locations: { title: 'Locais de Atendimento', desc: 'Gerencie studios e atendimento domiciliar' },
      hours: { title: 'Horário Comercial', desc: 'Configure dias e horários de funcionamento' },
      services: { title: 'Gestão de Serviços', desc: 'Defina preços, tempo e categorias' },
      inventory: { title: 'Estoque e Materiais', desc: 'Controle de produtos e alertas de estoque' },
      inactiveClients: { title: 'Clientes Desativados', desc: 'Arquivo de clientes inativos' },
      sysConfig: { title: 'Configurações do Sistema', desc: 'Idioma, Notificações, Backup e Temas' }
    }
  },
  'en-US': {
    title: 'Settings',
    subtitle: 'Operational Control Panel',
    backBtn: 'Back',
    logoutBtn: 'Log Out',
    logoutSub: 'Return to institutional landing page',
    tipTitle: 'Management Tip:',
    tipContent: 'Carefully configure your schedules and service locations so that automations and online booking notifications operate with surgical precision.',
    options: {
      locations: { title: 'Service Locations', desc: 'Manage studios and home care locations' },
      hours: { title: 'Business Hours', desc: 'Configure days and operating hours' },
      services: { title: 'Service Catalog', desc: 'Define pricing, duration, and categories' },
      inventory: { title: 'Inventory & Materials', desc: 'Product tracking and low stock alerts' },
      inactiveClients: { title: 'Archived Customers', desc: 'Database of deactivated clients' },
      sysConfig: { title: 'System Configurations', desc: 'Language, Notifications, Backup, and Themes' }
    }
  },
  'es-ES': {
    title: 'Configuraciones',
    subtitle: 'Panel de Control Operativo',
    backBtn: 'Volver',
    logoutBtn: 'Cerrar Sesión',
    logoutSub: 'Volver a la página institucional',
    tipTitle: 'Consejo de Gestión:',
    tipContent: 'Configure cuidadosamente sus horarios y lugares de atención para que las automatizaciones y notificaciones de reservas en línea funcionen con precisión quirúrgica.',
    options: {
      locations: { title: 'Lugares de Atención', desc: 'Gestione estudios y atención a domicilio' },
      hours: { title: 'Horario Comercial', desc: 'Configure días y horarios de funcionamento' },
      services: { title: 'Gestión de Servicios', desc: 'Defina precios, tiempos y categorías' },
      inventory: { title: 'Inventario y Materiales', desc: 'Control de productos y alertas de stock' },
      inactiveClients: { title: 'Clientes Inactivos', desc: 'Archivo de clientes desactivados' },
      sysConfig: { title: 'Configuraciones del Sistema', desc: 'Idioma, Notificaciones, Copia de seguridad y Temas' }
    }
  }
};

export function SettingsScreen({ onBack, onNavigate, onLogout }) {
  const { systemLanguage } = useLanguage(); 
  const text = localTranslations[systemLanguage] || localTranslations['pt-BR'];

  const settingsOptions = [
    {
      id: 'locations',
      title: text.options.locations.title,
      description: text.options.locations.desc,
      icon: MapPin,
      color: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      id: 'business-hours',
      title: text.options.hours.title,
      description: text.options.hours.desc,
      icon: Clock,
      color: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      id: 'services',
      title: text.options.services.title,
      description: text.options.services.desc,
      icon: Scissors,
      color: 'bg-pink-100',
      iconColor: 'text-pink-600',
    },
    {
      id: 'inventory',
      title: text.options.inventory.title,
      description: text.options.inventory.desc,
      icon: Package,
      color: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      id: 'inactive-clients',
      title: text.options.inactiveClients.title,
      description: text.options.inactiveClients.desc,
      icon: UserX,
      color: 'bg-red-100',
      iconColor: 'text-red-600',
    },
    {
      id: 'settings',
      title: text.options.sysConfig.title,
      description: text.options.sysConfig.desc,
      icon: SettingsIcon,
      color: 'bg-gray-100',
      iconColor: 'text-gray-600',
    },
  ];

  return (
    <div className="bg-background min-h-screen pb-24 lg:pb-10 pt-4">
      {/* Top Header Navigation */}
      <div className="px-5 lg:px-8 mb-6 flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 bg-white rounded-xl shadow-sm hover:bg-gray-50 transition-colors lg:hidden"
        >
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
        <div>
          <h2 className="text-primary font-bold">{text.title}</h2>
          <p className="text-gray-500 text-sm">{text.subtitle}</p>
        </div>
      </div>

      {/* Grid List Options */}
      <div className="px-5 lg:px-8 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {settingsOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <button
                key={option.id}
                onClick={() => onNavigate(option.id)}
                className="w-full bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-all text-left border border-gray-50 group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 ${option.color} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                    <IconComponent className={option.iconColor} size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-gray-800 font-semibold mb-0.5 truncate">{option.title}</h4>
                    <p className="text-gray-600 text-sm line-clamp-2">{option.description}</p>
                  </div>
                  <ChevronRight className="text-gray-400 flex-shrink-0 group-hover:translate-x-1 transition-transform" size={20} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Logout Section */}
      <div className="px-5 lg:px-8 pb-6">
        <button
          onClick={onLogout}
          className="w-full bg-red-50 border-2 border-red-200 rounded-xl p-5 hover:bg-red-100 transition-all text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <LogOut className="text-red-600" size={26} />
            </div>
            <div className="flex-1">
              <h3 className="text-red-700 font-semibold mb-1">{text.logoutBtn}</h3>
              <p className="text-red-600 text-sm">{text.logoutSub}</p>
            </div>
          </div>
        </button>
      </div>

      {/* Info Card */}
      <div className="px-5 lg:px-8 pb-6">
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
          <p className="text-gray-700 text-sm">
            💡 <strong>{text.tipTitle}</strong> {text.tipContent}
          </p>
        </div>
      </div>
    </div>
  );
}