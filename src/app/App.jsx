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

export default function App() {
  const [appMode, setAppMode] = useState('landing');
  const [activeScreen, setActiveScreen] = useState('home');
  const [activeModal, setActiveModal] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsScreen, setSettingsScreen] = useState('main');
  const [previousScreen, setPreviousScreen] = useState('home');

  const handleBookNow = () => {
    setAppMode('booking');
  };

  const handleAdminLogin = () => {
    setAppMode('admin-login');
  };

  const handleClientLogin = () => {
    setAppMode('client-portal');
  };

  const handleLogin = () => {
    setAppMode('admin-dashboard');
    setActiveScreen('home');
  };

  const handleBackToLanding = () => {
    setAppMode('landing');
  };

  const handleSettingsClick = () => {
    setActiveScreen('app-settings');
  };

  const handleSettingsNavigate = (screen) => {
    setSettingsScreen(screen);
  };

  const handleNavigateToManagement = (screen) => {
    setPreviousScreen('settings');
    setActiveScreen(screen);
  };

  const handleBackFromManagement = () => {
    setActiveScreen('settings');
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

  const renderSettingsScreen = () => {
    switch (settingsScreen) {
      case 'locations':
        return <LocationsManagement onBack={handleSettingsBack} />;
      case 'business-hours':
        return <BusinessHours onBack={handleSettingsBack} />;
      case 'inventory':
        return <InventoryManagement onBack={handleSettingsBack} />;
      case 'notes':
        return <NotesScreen />;
      case 'inactive-clients':
        return <InactiveClients onBack={handleSettingsBack} />;
      case 'services':
        return (
          <div className="min-h-screen bg-background">
            <div className="bg-white px-5 py-4 shadow-sm sticky top-0 z-10">
              <button
                onClick={handleSettingsBack}
                className="flex items-center gap-2 text-primary hover:text-accent transition-colors mb-4"
              >
                ← Voltar
              </button>
              <h2 className="text-primary text-2xl">Gestão de Serviços</h2>
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
      case 'notes':
        return <NotesScreen />;
      case 'locations':
        return <LocationsManagement onBack={handleBackFromManagement} />;
      case 'business-hours':
        return <BusinessHours onBack={handleBackFromManagement} />;
      case 'services':
        return <ServiceCatalogAdmin onBack={handleBackFromManagement} />;
      case 'inventory':
        return <InventoryManagement onBack={handleBackFromManagement} />;
      case 'inactive-clients':
        return <InactiveClients onBack={handleBackFromManagement} />;
      case 'settings':
        return <SettingsScreen onNavigate={handleNavigateToManagement} onBack={() => setActiveScreen('home')} onLogout={handleLogout} />;
      case 'app-settings':
        return <AppSettings />;
      default:
        return (
          <HomeScreen 
            onServiceCatalogClick={() => setActiveModal('services')}
            onAutomationClick={() => setActiveModal('automation')}
            onProcessFlowClick={() => setActiveModal('process')}
            onSettingsClick={handleSettingsClick}
            onLogout={handleLogout}
          />
        );
    }
  };

  // Landing Page - Public Entry Point
  if (appMode === 'landing') {
    return (
      <div className="min-h-screen bg-background">
        <LandingPage 
          onBookNow={handleBookNow} 
          onAdminLogin={handleAdminLogin}
          onClientLogin={handleClientLogin}
        />
      </div>
    );
  }

  // Client Portal - Client Area
  if (appMode === 'client-portal') {
    return (
      <div className="min-h-screen bg-background max-w-md mx-auto">
        <ClientPortal onBack={handleBackToLanding} />
      </div>
    );
  }

  // Booking Flow - Client Journey
  if (appMode === 'booking') {
    return (
      <div className="min-h-screen bg-background max-w-md mx-auto relative">
        <BookingScreen onBack={handleBackToLanding} />
      </div>
    );
  }

  // Admin Login
  if (appMode === 'admin-login') {
    return (
      <div className="min-h-screen bg-background">
        <div className="px-5 py-4">
          <button
            onClick={handleBackToLanding}
            className="text-primary hover:text-accent transition-colors text-sm"
          >
            ← Back to Studio Annika
          </button>
        </div>
        <LoginScreen onLogin={handleLogin} />
      </div>
    );
  }

  // Admin Dashboard - Annika's Management System
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <Sidebar 
        activeScreen={activeScreen} 
        onNavigate={setActiveScreen}
        onSettingsClick={handleSettingsClick}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="lg:pl-20">
        <div className="max-w-md lg:max-w-7xl 2xl:max-w-[1920px] mx-auto relative">
          {renderScreen()}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav activeScreen={activeScreen} onNavigate={setActiveScreen} />

      {/* Settings Full Screen */}
      {showSettings && (
        <div className="fixed inset-0 bg-background z-50 overflow-y-auto lg:pl-20">
          <div className="max-w-md lg:max-w-7xl 2xl:max-w-[1920px] mx-auto">
            {renderSettingsScreen()}
          </div>
        </div>
      )}

      {/* Modal Overlays */}
      {activeModal === 'services' && (
        <div className="fixed inset-0 bg-background z-50 overflow-y-auto lg:pl-20">
          <div className="max-w-md lg:max-w-7xl 2xl:max-w-[1920px] mx-auto">
            <div className="sticky top-0 bg-background z-10 px-5 lg:px-8 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-primary">Catálogo de Serviços</h2>
              <button
                onClick={() => setActiveModal(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
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
            <div className="sticky top-0 bg-background z-10 px-5 lg:px-8 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-primary">Automação</h2>
              <button
                onClick={() => setActiveModal(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
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
            <div className="sticky top-0 bg-background z-10 px-5 lg:px-8 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-primary">Fluxo de Processos</h2>
              <button
                onClick={() => setActiveModal(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
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
