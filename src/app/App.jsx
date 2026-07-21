import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

// ==========================================
// COMPONENTES DE NAVEGAÇÃO INTERNA DO ADMIN
// ==========================================
import { BottomNav } from './components/BottomNav';
import { Sidebar } from './components/Sidebar';

// ==========================================
// TELAS PÚBLICAS (FLUXO DO CLIENTE)
// ==========================================
import { LandingPage } from './components/LandingPage';
import { LoginScreen } from './components/LoginScreen';
import { ClientPortal } from './components/ClientPortal';
import { BookingScreen } from './components/BookingScreen';

// ==========================================
// TELAS PRINCIPAIS DO PAINEL ADMINISTRATIVO
// ==========================================
import { HomeScreen } from './components/HomeScreen';
import { CalendarScreen } from './components/CalendarScreen';
import { FinanceScreen } from './components/FinanceScreen';
import { ClientsScreen } from './components/ClientsScreen';
import { DashboardScreen } from './components/DashboardScreen';
import { NotesScreen } from './components/NotesScreen';
import { SettingsScreen } from './components/SettingsScreen';

// ==========================================
// MODAIS ADMINISTRATIVOS (MÓDULOS DE SUPORTE)
// ==========================================
import { ServiceCatalogAdmin } from './components/ServiceCatalogAdmin';
import { AutomationDashboard } from './components/AutomationDashboard';
import { ProcessFlowDiagram } from './components/ProcessFlowDiagram';

// ==========================================
// SUB-TELAS DE CONFIGURAÇÃO (DENTRO DE AJUSTES)
// ==========================================
import { LocationsManagement } from './components/settings/LocationsManagement';
import { BusinessHours } from './components/settings/BusinessHours';
import { InventoryManagement } from './components/settings/InventoryManagement';
import { InactiveClients } from './components/settings/InactiveClients';
import { AppSettings } from './components/settings/AppSettings';

// ==========================================
// SEGURANÇA E INFRAESTRUTURA
// ==========================================
import { MaintenanceScreen } from './components/MaintenanceScreen';

// 🌟 Importando o Contexto de Idioma Customizado
import { LanguageProvider } from '../context/LanguageContext';

// 🌟 Importando o método para buscar a configuração inicial do banco de dados
import { obterConfiguracoes } from '../api';

// 🚀 CONTROLE DE PRODUÇÃO
const IS_MAINTENANCE_MODE = true;

export default function App() {
  const [appMode, setAppMode] = useState('landing');
  const [activeScreen, setActiveScreen] = useState('home');
  const [activeModal, setActiveModal] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsScreen, setSettingsScreen] = useState('main');
  const [portalTargetClient, setPortalTargetClient] = useState(null);

  // 🌟 ESTADO GLOBAL DO IDIOMA ADMINISTRATIVO
  const [systemLanguage, setSystemLanguage] = useState('pt-BR');

  // 🔄 Busca o idioma inicial salvo no banco assim que o App inicializa
  useEffect(() => {
    async function carregarIdiomaInicial() {
      try {
        const configs = await obterConfiguracoes();
        if (configs && configs.idioma) {
          setSystemLanguage(configs.idioma);
        }
      } catch (err) {
        console.error('Erro ao buscar idioma inicial:', err);
      }
    }
    carregarIdiomaInicial();
  }, []);

  const handleBookNow = () => setAppMode('booking');
  const handleAdminLogin = () => setAppMode('admin-login');
  const handleClientLogin = () => setAppMode('client-portal');

  const handleLogin = () => {
    setAppMode('admin-dashboard');
    setActiveScreen('home');
  };

  const handleBackToLanding = () => setAppMode('landing');

  const handleSettingsClick = () => {
    setSettingsScreen('main');
    setShowSettings(true);
  };

  const handleSettingsNavigate = (screen) => {
    setSettingsScreen(screen);
  };

  const handleSettingsBack = () => {
    if (settingsScreen === 'main') {
      setShowSettings(false);
    } else {
      setSettingsScreen('main');
    }
  };

  const handleLogout = () => {
    if (confirm('Deseja realmente sair da sua conta?')) {
      setShowSettings(false);
      setAppMode('landing');
      setActiveScreen('home');
    }
  };

  const handleVerProximosAgendamentos = () => {
    setActiveScreen('calendar');
  };

  // ✅ Removido a prop redundante "currentLang" nas telas de gerenciamento direto
  const renderSettingsScreen = () => {
    switch (settingsScreen) {
      case 'locations':
        return <LocationsManagement onBack={handleSettingsBack} />;
      case 'business-hours':
        return <BusinessHours onBack={handleSettingsBack} />;
      case 'inventory':
        return <InventoryManagement onBack={handleSettingsBack} />;
      case 'notes':
        return <NotesScreen onBack={handleSettingsBack} />;
      case 'inactive-clients':
        return <InactiveClients onBack={handleSettingsBack} />;
      case 'services':
        return (
          <div className="min-h-screen bg-background">
            <div className="bg-white px-5 py-4 shadow-sm sticky top-0 z-10 flex flex-col gap-2">
              <button
                onClick={handleSettingsBack}
                className="text-left text-primary hover:text-accent text-sm font-semibold transition-colors"
              >
                ← Voltar para Ajustes
              </button>
              <h2 className="text-primary text-xl font-bold">Gestão de Serviços</h2>
            </div>
            <ServiceCatalogAdmin />
          </div>
        );
      case 'settings': // 🌟 Alterado de 'app-settings' para 'settings' para bater com o ID do botão
        return (
          <AppSettings
            onBack={handleSettingsBack}
            currentLang={systemLanguage}
            onLanguageChange={setSystemLanguage}
          />
        );
      default:
        return (
          <SettingsScreen
            onBack={() => setShowSettings(false)}
            onNavigate={handleSettingsNavigate}
            onLogout={handleLogout}
            currentLang={systemLanguage}
          />
        );
    }
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case 'home':
        return (
          <HomeScreen
            onServiceCatalogClick={() => setActiveModal('services')}
            onAutomationClick={() => setActiveModal('automation')}
            onProcessFlowClick={() => setActiveModal('process')}
            onSettingsClick={handleSettingsClick}
            onLogout={handleLogout}
            onVerProximosAgendamentos={handleVerProximosAgendamentos}
            currentLang={systemLanguage}
          />
        );
      case 'calendar':
        return <CalendarScreen currentLang={systemLanguage} />;
      case 'finance':
        return <FinanceScreen currentLang={systemLanguage} />;
      case 'dashboard':
        return <DashboardScreen currentLang={systemLanguage} />;
      case 'clients':
        return <ClientsScreen currentLang={systemLanguage} />;
      case 'notes':
        return <NotesScreen currentLang={systemLanguage} />;
      default:
        return (
          <HomeScreen
            onServiceCatalogClick={() => setActiveModal('services')}
            onAutomationClick={() => setActiveModal('automation')}
            onProcessFlowClick={() => setActiveModal('process')}
            onSettingsClick={handleSettingsClick}
            onLogout={handleLogout}
            onVerProximosAgendamentos={handleVerProximosAgendamentos}
            currentLang={systemLanguage}
          />
        );
    }
  };

  if (appMode === 'landing') {
    return (
      <div className="min-h-screen bg-background dark">
        <LandingPage
          onBookNow={handleBookNow}
          onAdminLogin={handleAdminLogin}
          onClientLogin={handleClientLogin}
        />
      </div>
    );
  }

  if (IS_MAINTENANCE_MODE) {
    if (appMode === 'client-portal' || appMode === 'booking' || appMode === 'admin-login') {
      return <MaintenanceScreen onBack={handleBackToLanding} />;
    }
  }

  if (appMode === 'client-portal') {
    return <ClientPortal
      initialClientData={portalTargetClient}
      onBack={() => {
        setPortalTargetClient(null);
        setAppMode('booking');
      }}
    />;
  }

  if (appMode === 'booking') {
    return <BookingScreen
      onBack={handleBackToLanding}
      onViewBooking={(clientData) => {
        setPortalTargetClient(clientData);
        setAppMode('client-portal');
      }}
    />;
  }

  if (appMode === 'admin-login') {
    return <LoginScreen onLogin={handleLogin} onBack={handleBackToLanding} />;
  }

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background">
        <Sidebar
          activeScreen={activeScreen}
          onNavigate={(screen) => {
            setShowSettings(false);
            setActiveScreen(screen);
          }}
          onSettingsClick={handleSettingsClick}
          onLogout={handleLogout}
        />

        <div className="lg:pl-20 pb-20 lg:pb-0">
          <div className="max-w-md lg:max-w-7xl 2xl:max-w-[1920px] mx-auto relative">
            {renderScreen()}
          </div>
        </div>

        <BottomNav
          activeScreen={showSettings ? 'settings' : activeScreen}
          onNavigate={(screen) => {
            if (screen === 'settings') {
              handleSettingsClick();
            } else {
              setShowSettings(false);
              setActiveScreen(screen);
            }
          }}
        />

        {showSettings && (
          <div className="fixed inset-0 bg-background z-50 overflow-y-auto lg:pl-20 animate-fadeIn">
            <div className="max-w-md lg:max-w-7xl 2xl:max-w-[1920px] mx-auto">
              {renderSettingsScreen()}
            </div>
          </div>
        )}

        {/* Modais Administrativos */}
        {activeModal === 'services' && (
          <div className="fixed inset-0 bg-background z-50 overflow-y-auto lg:pl-20">
            <div className="max-w-md lg:max-w-7xl 2xl:max-w-[1920px] mx-auto">
              <div className="sticky top-0 bg-background px-5 py-4 border-b border-gray-200 flex justify-between items-center z-10">
                <h2 className="text-primary font-bold">Catálogo de Serviços</h2>
                <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="text-gray-600" size={24} />
                </button>
              </div>
              <ServiceCatalogAdmin />
            </div>
          </div>
        )}

        {activeModal === 'automation' && (
          <div className="fixed inset-0 bg-background z-50 overflow-y-auto lg:pl-20">
            <div className="max-w-md lg:max-w-7xl 2xl:max-w-[1920px] mx-auto">
              <div className="sticky top-0 bg-background px-5 py-4 border-b border-gray-200 flex justify-between items-center z-10">
                <h2 className="text-primary font-bold">Painel de Automações</h2>
                <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="text-gray-600" size={24} />
                </button>
              </div>
              <AutomationDashboard />
            </div>
          </div>
        )}

        {activeModal === 'process' && (
          <div className="fixed inset-0 bg-background z-50 overflow-y-auto lg:pl-20">
            <div className="max-w-md lg:max-w-7xl 2xl:max-w-[1920px] mx-auto">
              <div className="sticky top-0 bg-background px-5 py-4 border-b border-gray-200 flex justify-between items-center z-10">
                <h2 className="text-primary font-bold">Diagrama de Fluxos</h2>
                <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="text-gray-600" size={24} />
                </button>
              </div>
              <ProcessFlowDiagram />
            </div>
          </div>
        )}
      </div>
    </LanguageProvider>
  );
}