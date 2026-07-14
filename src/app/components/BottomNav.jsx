import { House, Calendar, DollarSign, StickyNote, BarChart3, Settings } from 'lucide-react';
// 🌟 Importa o hook do nosso contexto central de idiomas
import { useLanguage } from '../../context/LanguageContext';

export function BottomNav({ activeScreen, onNavigate }) {
  const { t } = useLanguage();

  const navItems = [
    { id: 'home', icon: House, label: t('navHome') },
    { id: 'calendar', icon: Calendar, label: t('navCalendar') },
    { id: 'finance', icon: DollarSign, label: t('navFinance') },
    { id: 'dashboard', icon: BarChart3, label: t('navDashboard') },
    { id: 'notes', icon: StickyNote, label: t('navNotes') },
    { id: 'settings', icon: Settings, label: 'Menu' }, // Mantido fixo ou pode mapear se preferir
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