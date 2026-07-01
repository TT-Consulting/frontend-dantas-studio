import { MapPin, Clock, Scissors, Package, UserX, ChevronRight, ArrowLeft, Settings as SettingsIcon, LogOut, FileText } from 'lucide-react';

export function SettingsScreen({ onBack, onNavigate, onLogout }) {
  const settingsOptions = [
    {
      id: 'locations',
      title: 'Locais de Atendimento',
      description: 'Gerencie studios e atendimento domiciliar',
      icon: MapPin,
      color: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      id: 'business-hours',
      title: 'Horário Comercial',
      description: 'Configure dias e horários de funcionamento',
      icon: Clock,
      color: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      id: 'services',
      title: 'Gestão de Serviços',
      description: 'Defina preços, tempo e categorias',
      icon: Scissors,
      color: 'bg-pink-100',
      iconColor: 'text-pink-600',
    },
    {
      id: 'inventory',
      title: 'Estoque e Materiais',
      description: 'Controle de produtos e alertas de estoque',
      icon: Package,
      color: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      id: 'notes',
      title: 'Notas',
      description: 'Anote lembretes e informações importantes',
      icon: FileText,
      color: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
    },
    {
      id: 'inactive-clients',
      title: 'Clientes Desativados',
      description: 'Arquivo de clientes inativos',
      icon: UserX,
      color: 'bg-gray-100',
      iconColor: 'text-gray-600',
    },
  ];

  const systemSettings = [
    {
      id: 'app-settings',
      title: 'Configurações do Sistema',
      description: 'Preferências gerais da aplicação',
      icon: SettingsIcon,
      color: 'bg-slate-100',
      iconColor: 'text-slate-600',
    },
  ];

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
        <h2 className="text-primary text-2xl">Central de Gestão</h2>
        <p className="text-gray-600 text-sm mt-1">Controle completo do Studio Annika</p>
      </div>

      {/* Business Management Section */}
      <div className="px-5 py-6">
        <h3 className="text-gray-700 font-semibold mb-3 text-sm uppercase tracking-wide">
          Gestão do Negócio
        </h3>
        <div className="space-y-3">
          {settingsOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                onClick={() => onNavigate(option.id)}
                className="w-full bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-all text-left"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 ${option.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Icon className={option.iconColor} size={26} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-gray-800 font-semibold mb-1">{option.title}</h3>
                    <p className="text-gray-600 text-sm">{option.description}</p>
                  </div>
                  <ChevronRight className="text-gray-400 flex-shrink-0" size={20} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* System Settings Section */}
      <div className="px-5 pb-6">
        <h3 className="text-gray-700 font-semibold mb-3 text-sm uppercase tracking-wide">
          Configurações do Sistema
        </h3>
        <div className="space-y-3">
          {systemSettings.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                onClick={() => onNavigate(option.id)}
                className="w-full bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-all text-left"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 ${option.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Icon className={option.iconColor} size={26} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-gray-800 font-semibold mb-1">{option.title}</h3>
                    <p className="text-gray-600 text-sm">{option.description}</p>
                  </div>
                  <ChevronRight className="text-gray-400 flex-shrink-0" size={20} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Logout Section */}
      <div className="px-5 pb-6">
        <button
          onClick={onLogout}
          className="w-full bg-red-50 border-2 border-red-200 rounded-xl p-5 hover:bg-red-100 transition-all text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <LogOut className="text-red-600" size={26} />
            </div>
            <div className="flex-1">
              <h3 className="text-red-700 font-semibold mb-1">Sair da Conta</h3>
              <p className="text-red-600 text-sm">Voltar para a página institucional</p>
            </div>
          </div>
        </button>
      </div>

      {/* Info Card */}
      <div className="px-5 pb-6">
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
          <p className="text-gray-700 text-sm">
            💡 <strong>Dica:</strong> Mantenha suas configurações atualizadas para garantir que 
            o sistema de agendamento funcione perfeitamente e suas clientes tenham a melhor experiência.
          </p>
        </div>
      </div>
    </div>
  );
}
