import { useState } from 'react';
import { X } from 'lucide-react';
import { BottomNav } from './components/BottomNav';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import { LoginScreen } from './components/LoginScreen';
import { ClientPortal } from './components/ClientPortal';
import { HomeScreen } from './components/HomeScreen';
import { CalendarScreen } from './components/CalendarScreen';
import { BookingScreen } from './components/BookingScreen';
import { FinanceScreen } from './components/FinanceScreen';
import { ClientsScreen } from './components/ClientsScreen';
import { DashboardScreen } from './components/DashboardScreen';
import { ServiceCatalogAdmin } from './components/ServiceCatalogAdmin';
import { AutomationDashboard } from './components/AutomationDashboard';
import { ProcessFlowDiagram } from './components/ProcessFlowDiagram';
import { NotesScreen } from './components/NotesScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { LocationsManagement } from './components/settings/LocationsManagement';
import { BusinessHours } from './components/settings/BusinessHours';
import { InventoryManagement } from './components/settings/InventoryManagement';
import { InactiveClients } from './components/settings/InactiveClients';
import { AppSettings } from './components/settings/AppSettings';
import { MaintenanceScreen } from './components/MaintenanceScreen';

// 🚀 CONTROLE DE PRODUÇÃO: Mude para 'true' para ativar a tela de manutenção nas abas públicas
const IS_MAINTENANCE_MODE = true; 

export default function App() {
  const [appMode, setAppMode] = useState('landing');
  const [activeScreen, setActiveScreen] = useState('home');
  const [activeModal, setActiveModal] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsScreen, setSettingsScreen] = useState('main');
  const [portalTargetClient, setPortalTargetClient] = useState(null);

  const handleBookNow = () => setAppMode('booking');
  const handleAdminLogin = () => setAppMode('admin-login');
  const handleClientLogin = () => setAppMode('client-portal');
  
  const handleLogin = () => {
    setAppMode('admin-dashboard');
    setActiveScreen('home');
  };

  const handleBackToLanding = () => setAppMode('landing');

  // ✅ CORREÇÃO: Ativa o menu de configurações lateral/mobile perfeitamente
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

  // ✅ Centralização Limpa da Renderização das Sub-telas de Configuração
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
      case 'app-settings':
        return <AppSettings onBack={handleSettingsBack} />;
      default:
        return (
          <SettingsScreen 
            onBack={() => setShowSettings(false)} 
            onNavigate={handleSettingsNavigate}
            onLogout={handleLogout}
          />
        );
    }
  };

  // Renderizador principal da área de trabalho do Administrador
  const renderScreen = () => {
    switch (activeScreen) {
      case 'home':
        return (
          <HomeScreen 
            onServiceCatalogClick={() => setActiveModal('services')}
            onAutomationClick={() => setActiveModal('automation')}
            onProcessFlowClick={() => setActiveModal('process')}
          />
        );
      case 'calendar':
        return <CalendarScreen />;
      case 'finance':
        return <FinanceScreen />;
      case 'dashboard':
        return <DashboardScreen />;
      case 'clients':
        return <ClientsScreen />;
      default:
        return (
          <HomeScreen 
            onServiceCatalogClick={() => setActiveModal('services')}
            onAutomationClick={() => setActiveModal('automation')}
            onProcessFlowClick={() => setActiveModal('process')}
          />
        );
    }
  };

  // 1. Landing Page Pública (Ponto de entrada do cliente)
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

  // ==========================================
  // 🛠️ INTERCEPTADOR DE FLUXOS DE MANUTENÇÃO PARA PRODUÇÃO
  // ==========================================
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

  // 2. Painel Administrativo Interno Seguro
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar para telas grandes (Desktop) */}
      <Sidebar 
        activeScreen={activeScreen} 
        onNavigate={(screen) => {
          setShowSettings(false); // Fecha o painel de ajustes ao trocar de aba principal
          setActiveScreen(screen);
        }}
        onSettingsClick={handleSettingsClick}
        onLogout={handleLogout}
      />

      {/* Área de Conteúdo Principal Dinâmico */}
      <div className="lg:pl-20 pb-20 lg:pb-0">
        <div className="max-w-md lg:max-w-7xl 2xl:max-w-[1920px] mx-auto relative">
          {renderScreen()}
        </div>
      </div>

      {/* Barra de Navegação Inferior (Mobile) */}
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

      {/* Gaveta/Painel de Configurações em Tela Cheia */}
      {showSettings && (
        <div className="fixed inset-0 bg-background z-50 overflow-y-auto lg:pl-20 animate-fadeIn">
          <div className="max-w-md lg:max-w-7xl 2xl:max-w-[1920px] mx-auto">
            {renderSettingsScreen()}
          </div>
        </div>
      )}

      {/* Modais Flutuantes disparados pelo Dashboard Home */}
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
  );
}