import { House, Calendar, DollarSign, StickyNote, BarChart3, Settings } from 'lucide-react';

export function BottomNav({ activeScreen, onNavigate }) {
  const navItems = [
    { id: 'home', icon: House, label: 'Home' },
    { id: 'calendar', icon: Calendar, label: 'Agenda' },
    { id: 'finance', icon: DollarSign, label: 'Finanças' },
    { id: 'dashboard', icon: BarChart3, label: 'Relatórios' },
    { id: 'notes', icon: StickyNote, label: 'Notas' },
    { id: 'settings', icon: Settings, label: 'Menu' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 shadow-lg z-50">
      <div className="max-w-md mx-auto flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="flex flex-col items-center gap-1 transition-colors px-2"
            >
              <Icon
                size={22}
                className={isActive ? 'text-primary' : 'text-gray-400'}
                strokeWidth={2}
              />
              <span className={`text-xs ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
