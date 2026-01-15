import { useState } from 'react';
import { ArrowLeft, Bell, Moon, Globe, Smartphone, Mail, Shield, Database, Check } from 'lucide-react';

export function AppSettings({ onBack }) {
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('pt-BR');
  const [autoBackup, setAutoBackup] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  const handleToggle = (setter, currentValue) => {
    setter(!currentValue);
    setHasChanges(true);
  };

  const handleSave = () => {
    // Here you would save to backend/local storage
    alert('Configurações salvas com sucesso!');
    setHasChanges(false);
  };

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
        <h2 className="text-primary text-2xl">Configurações do Sistema</h2>
        <p className="text-gray-600 text-sm mt-1">Preferências gerais da aplicação</p>
      </div>

      {/* Settings Sections */}
      <div className="px-5 py-6 space-y-6">
        
        {/* Notifications Section */}
        <div>
          <h3 className="text-gray-700 font-semibold mb-3 text-sm uppercase tracking-wide flex items-center gap-2">
            <Bell size={16} className="text-primary" />
            Notificações
          </h3>
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-4 flex items-center justify-between border-b border-gray-100">
              <div className="flex-1">
                <p className="text-gray-800 font-medium">Notificações Push</p>
                <p className="text-gray-600 text-sm">Receba alertas sobre novos agendamentos</p>
              </div>
              <button
                onClick={() => handleToggle(setNotifications, notifications)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  notifications ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                    notifications ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="flex-1">
                <p className="text-gray-800 font-medium">Notificações por E-mail</p>
                <p className="text-gray-600 text-sm">Resumo diário de agendamentos</p>
              </div>
              <button
                onClick={() => handleToggle(setEmailNotifications, emailNotifications)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  emailNotifications ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                    emailNotifications ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Appearance Section */}
        <div>
          <h3 className="text-gray-700 font-semibold mb-3 text-sm uppercase tracking-wide flex items-center gap-2">
            <Moon size={16} className="text-primary" />
            Aparência
          </h3>
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-gray-800 font-medium">Modo Escuro</p>
                <p className="text-gray-600 text-sm">Interface com tema escuro (em breve)</p>
              </div>
              <button
                onClick={() => handleToggle(setDarkMode, darkMode)}
                disabled
                className={`w-12 h-6 rounded-full transition-colors opacity-50 cursor-not-allowed ${
                  darkMode ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                    darkMode ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Language Section */}
        <div>
          <h3 className="text-gray-700 font-semibold mb-3 text-sm uppercase tracking-wide flex items-center gap-2">
            <Globe size={16} className="text-primary" />
            Idioma e Região
          </h3>
          <div className="bg-white rounded-xl shadow-md p-4">
            <label className="text-sm text-gray-600 mb-2 block">Idioma da Interface</label>
            <select
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                setHasChanges(true);
              }}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="pt-BR">Português (Brasil)</option>
              <option value="en-US">English (US)</option>
              <option value="es-ES">Español</option>
            </select>
          </div>
        </div>

        {/* Data & Privacy Section */}
        <div>
          <h3 className="text-gray-700 font-semibold mb-3 text-sm uppercase tracking-wide flex items-center gap-2">
            <Shield size={16} className="text-primary" />
            Dados e Privacidade
          </h3>
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-4 flex items-center justify-between border-b border-gray-100">
              <div className="flex-1">
                <p className="text-gray-800 font-medium">Backup Automático</p>
                <p className="text-gray-600 text-sm">Backup diário dos dados locais</p>
              </div>
              <button
                onClick={() => handleToggle(setAutoBackup, autoBackup)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  autoBackup ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                    autoBackup ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
            <button className="w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="text-primary" size={20} />
                <div>
                  <p className="text-gray-800 font-medium">Exportar Dados</p>
                  <p className="text-gray-600 text-sm">Baixar todos os seus dados</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Device Section */}
        <div>
          <h3 className="text-gray-700 font-semibold mb-3 text-sm uppercase tracking-wide flex items-center gap-2">
            <Smartphone size={16} className="text-primary" />
            Informações do Dispositivo
          </h3>
          <div className="bg-white rounded-xl shadow-md p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Versão do App</span>
              <span className="text-gray-800 font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Navegador</span>
              <span className="text-gray-800 font-medium text-sm">
                {navigator.userAgent.includes('Chrome') ? 'Chrome' : 
                 navigator.userAgent.includes('Safari') ? 'Safari' : 
                 navigator.userAgent.includes('Firefox') ? 'Firefox' : 'Outro'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Plataforma</span>
              <span className="text-gray-800 font-medium text-sm">
                {/iPhone|iPad|iPod/.test(navigator.userAgent) ? 'iOS' : 
                 /Android/.test(navigator.userAgent) ? 'Android' : 'Desktop'}
              </span>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div>
          <h3 className="text-gray-700 font-semibold mb-3 text-sm uppercase tracking-wide flex items-center gap-2">
            <Mail size={16} className="text-primary" />
            Suporte
          </h3>
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <button className="w-full p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100">
              <p className="text-gray-800 font-medium">Central de Ajuda</p>
              <p className="text-gray-600 text-sm">Tutoriais e perguntas frequentes</p>
            </button>
            <button className="w-full p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100">
              <p className="text-gray-800 font-medium">Relatar Problema</p>
              <p className="text-gray-600 text-sm">Envie feedback ou reporte bugs</p>
            </button>
            <button className="w-full p-4 text-left hover:bg-gray-50 transition-colors">
              <p className="text-gray-800 font-medium">Contato</p>
              <p className="text-gray-600 text-sm">suporte@studioannika.com.br</p>
            </button>
          </div>
        </div>

      </div>

      {/* Info Card */}
      <div className="px-5 pb-6">
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
          <p className="text-purple-700 text-sm">
            🔒 Seus dados são armazenados localmente e nunca são compartilhados com terceiros sem sua permissão.
          </p>
        </div>
      </div>

      {/* Save Button */}
      {hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-5 py-4 shadow-lg">
          <button
            onClick={handleSave}
            className="w-full max-w-md mx-auto bg-accent text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <Check size={20} />
            <span>Salvar Alterações</span>
          </button>
        </div>
      )}
    </div>
  );
}
