import { createContext, useContext, useState, useEffect } from 'react';
import { obterConfiguracoes } from '@/api';

const LanguageContext = createContext();

// Dicionário Centralizado para as telas do painel Administrativo
export const adminTranslations = {
  'pt-BR': {
    // Menu / Navegação
    navHome: 'Início',
    navCalendar: 'Agenda',
    navFinance: 'Financeiro',
    navClients: 'Clientes',
    navDashboard: 'Dashboard',
    navNotes: 'Notas',
    navSettings: 'Ajustes',
    logout: 'Sair',
    // HomeScreen / AgendaTab
    today: 'Hoje',
    catalog: 'Catálogo',
    services: 'Serviços',
    automation: 'Automação',
    processFlow: 'Diagrama de Fluxos',
  },
  'en-US': {
    navHome: 'Home',
    navCalendar: 'Calendar',
    navFinance: 'Finance',
    navClients: 'Clients',
    navDashboard: 'Dashboard',
    navNotes: 'Notes',
    navSettings: 'Settings',
    logout: 'Logout',
    today: 'Today',
    catalog: 'Catalog',
    services: 'Services',
    automation: 'Automation',
    processFlow: 'Process Flow',
  },
  'es-ES': {
    navHome: 'Inicio',
    navCalendar: 'Agenda',
    navFinance: 'Financiero',
    navClients: 'Clientes',
    navDashboard: 'Panel',
    navNotes: 'Notas',
    navSettings: 'Ajustes',
    logout: 'Salir',
    today: 'Hoy',
    catalog: 'Catálogo',
    services: 'Servicios',
    automation: 'Automatización',
    processFlow: 'Diagrama de Flujo',
  }
};

export function LanguageProvider({ children }) {
  const [systemLanguage, setSystemLanguage] = useState('pt-BR');
  const [loading, setLoading] = useState(true);

  // Busca o idioma inicial salvo no banco assim que o App administrativo inicializa
  useEffect(() => {
    async function carregarIdiomaInicial() {
      try {
        const configs = await obterConfiguracoes();
        if (configs && configs.idioma) {
          setSystemLanguage(configs.idioma);
        }
      } catch (err) {
        console.error('Erro ao buscar idioma inicial:', err);
      } finally {
        setLoading(false);
      }
    }
    carregarIdiomaInicial();
  }, []);

  // Função Helper para traduzir strings baseadas no idioma atual
  const t = (key) => {
    return adminTranslations[systemLanguage]?.[key] || adminTranslations['pt-BR']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ systemLanguage, setSystemLanguage, t, loading }}>
      {/* 🌟 Evita renderizar a interface antes do idioma padrão vir da API */}
      {!loading ? children : (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <p className="text-gray-500 font-medium">Carregando idioma...</p>
        </div>
      )}
    </LanguageContext.Provider>
  );
}

// Hook customizado para facilitar o consumo nas telas
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage deve ser usado dentro de um LanguageProvider');
  }
  return context;
}