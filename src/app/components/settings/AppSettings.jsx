import { useState, useEffect } from 'react';
import { ArrowLeft, Bell, Moon, Globe, Shield, Database, Check, Smartphone, X, Calendar } from 'lucide-react';
import Swal from 'sweetalert2';
// 🌟 Importa o hook do contexto centralizado
import { useLanguage } from '../../../context/LanguageContext';
import { 
  obterConfiguracoes, 
  salvarConfiguracoes, 
  alternarTemaRapido, 
  mudarIdiomaSistema, 
  alternarPushRapido, 
  alternarEmailRapido,
  exportarDadosBanco
} from "@/api"; 

// 🌍 Dicionário expandido para suportar os termos do novo Modal de Exportação
const translations = {
  'pt-BR': {
    back: 'Voltar',
    title: 'Configurações do Sistema',
    subtitle: 'Preferências gerais da aplicação',
    notifications: 'Notificações',
    push: 'Notificações Push',
    pushDesc: 'Receba alertas em tempo real na plataforma',
    email: 'Notificações por E-mail',
    emailDesc: 'Enviar e-mail de confirmação para os clientes',
    appearance: 'Aparência',
    darkMode: 'Modo Escuro',
    darkModeDesc: 'Interface otimizada para ambientes de baixa luminosidade',
    businessRules: 'Regras de Negócio e Região',
    uiLanguage: 'Idioma da Interface',
    reminder: 'Lembrete Pré-Atendimento (Horas de antecedência)',
    security: 'Segurança e Backup',
    backupFreq: 'Frequência do Backup Automático (Dias)',
    backupFreqDesc: 'Intervalo de salvamento de segurança no banco',
    exportDb: 'Exportar Banco de Dados',
    exportDbDesc: 'Baixar planilha estruturada com dados operacionais do Studio',
    sysInfo: 'Informações do Sistema',
    backendVer: 'Versão da API Backend',
    env: 'Ambiente de Execução',
    saveBtn: 'Salvar Alterações',
    alertThemeTitle: 'Tema Atualizado!',
    alertThemeDesc: 'Interface alterada para o modo',
    alertLangTitle: 'Idioma Alterado!',
    alertLangDesc: 'O sistema da manicure agora está em',
    alertSaveTitle: 'Configurações Salvas!',
    alertSaveDesc: 'As preferências foram salvas com sucesso.',
    // Modal de Exportação:
    modalExportTitle: 'Exportar Dados (CSV)',
    lblSelectTable: 'Selecione a Tabela',
    lblPeriod: 'Período dos Dados',
    lblStartDate: 'Data de Início',
    lblEndDate: 'Data de Término',
    btnExportSubmit: 'Exportar Agora',
    btnCancel: 'Cancelar',
    tableOptions: {
      clientes: 'Clientes',
      servicos: 'Serviços',
      estoque: 'Estoque de Materiais',
      agendamentos: 'Agendamentos'
    }
  },
  'en-US': {
    back: 'Back',
    title: 'System Settings',
    subtitle: 'General application preferences',
    notifications: 'Notifications',
    push: 'Push Notifications',
    pushDesc: 'Receive real-time alerts on the platform',
    email: 'Email Notifications',
    emailDesc: 'Send confirmation email to clients',
    appearance: 'Appearance',
    darkMode: 'Dark Mode',
    darkModeDesc: 'Optimized interface for low light environments',
    businessRules: 'Business Rules and Region',
    uiLanguage: 'Interface Language',
    reminder: 'Pre-Service Reminder (Hours in advance)',
    security: 'Security & Backup',
    backupFreq: 'Automatic Backup Frequency (Days)',
    backupFreqDesc: 'Database security save interval',
    exportDb: 'Export Database',
    exportDbDesc: 'Download structured sheet with Studio operational data',
    sysInfo: 'System Information',
    backendVer: 'Backend API Version',
    env: 'Execution Environment',
    saveBtn: 'Save Changes',
    alertThemeTitle: 'Theme Updated!',
    alertThemeDesc: 'Interface changed to',
    alertLangTitle: 'Language Changed!',
    alertLangDesc: 'The manicurist system is now in',
    alertSaveTitle: 'Settings Saved!',
    alertSaveDesc: 'Preferences updated successfully.',
    // Modal de Exportação:
    modalExportTitle: 'Export Data (CSV)',
    lblSelectTable: 'Select Table',
    lblPeriod: 'Data Period',
    lblStartDate: 'Start Date',
    lblEndDate: 'End Date',
    btnExportSubmit: 'Export Now',
    btnCancel: 'Cancel',
    tableOptions: {
      clientes: 'Clients',
      servicos: 'Services',
      estoque: 'Materials Stock',
      agendamentos: 'Appointments'
    }
  },
  'es-ES': {
    back: 'Volver',
    title: 'Configuraciones del Sistema',
    subtitle: 'Preferencias generales de la aplicação',
    notifications: 'Notificaciones',
    push: 'Notificaciones Push',
    pushDesc: 'Reciba alertas en tiempo real en la plataforma',
    email: 'Notificaciones por Correo',
    emailDesc: 'Enviar correo de confirmación a los clientes',
    appearance: 'Apariencia',
    darkMode: 'Modo Oscuro',
    darkModeDesc: 'Interfaz optimizada para entornos con poca luz',
    businessRules: 'Reglas de Negocio e Región',
    uiLanguage: 'Idioma de la Interfaz',
    reminder: 'Recordatorio de Pre-Atención (Horas de anticipación)',
    security: 'Seguridad y Respaldo',
    backupFreq: 'Frecuencia de Respaldo Automático (Días)',
    backupFreqDesc: 'Intervalo de guardado de segurança en la base de datos',
    exportDb: 'Exportar Base de Datos',
    exportDbDesc: 'Descargar hoja estruturada con datos operativos del Studio',
    sysInfo: 'Información del Sistema',
    backendVer: 'Versión de la API Backend',
    env: 'Entorno de Ejecución',
    saveBtn: 'Guardar Cambios',
    alertThemeTitle: '¡Tema Updated!',
    alertThemeDesc: 'Interfaz cambiada al modo',
    alertLangTitle: '¡Idioma Cambiado!',
    alertLangDesc: 'El sistema de la manicura agora está en',
    alertSaveTitle: '¡Configuraciones Guardadas!',
    alertSaveDesc: 'Las preferencias han sido guardadas con éxito.',
    // Modal de Exportação:
    modalExportTitle: 'Exportar Datos (CSV)',
    lblSelectTable: 'Seleccione la Tabla',
    lblPeriod: 'Período de Datos',
    lblStartDate: 'Fecha de Inicio',
    lblEndDate: 'Fecha de Término',
    btnExportSubmit: 'Exportar Ahora',
    btnCancel: 'Cancelar',
    tableOptions: {
      clientes: 'Clientes',
      servicos: 'Servicios',
      estoque: 'Inventario de Materiales',
      agendamentos: 'Citas'
    }
  }
};

export function AppSettings({ onBack, currentLang, onLanguageChange }) {
  // 🌟 Pegamos o atualizador global de idioma do context
  const { setSystemLanguage } = useLanguage();

  const [idConfig, setIdConfig] = useState(null);
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [backupDays, setBackupDays] = useState(7);
  const [reminderHours, setReminderHours] = useState(24);

  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  // Estados para gerenciar o Modal de Exportação
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState('clientes');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [exporting, setExporting] = useState(false);

  // Seleciona de forma segura o mapa de strings local desta página
  const localTxt = translations[currentLang] || translations['pt-BR'];

  useEffect(() => {
    async function carregarPreferencias() {
      try {
        setLoading(true);
        const data = await obterConfiguracoes();
        if (data) {
          setIdConfig(data.idConfig);
          setNotifications(data.notificaçõesAtivas);
          setEmailNotifications(data.enviarEmailConfirmacao);
          setDarkMode(data.temaEscuro);
          setBackupDays(data.frequenciaBackupDias);
          setReminderHours(data.lembretePreAtendimentoHoras);
          
          if (data.idioma) {
            onLanguageChange(data.idioma);
            setSystemLanguage(data.idioma); // Atualiza o Context com o banco
          }

          if (data.temaEscuro) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      } catch (err) {
        console.error('Erro ao buscar configurações:', err);
      } finally { 
        setLoading(false);
      }
    }
    carregarPreferencias();
  }, []);

  const registrarMudanca = (setter, valor) => {
    setter(valor);
    setHasChanges(true);
  };

  const handleLanguageChange = async (novoIdioma) => {
    try {
      onLanguageChange(novoIdioma); 
      setSystemLanguage(novoIdioma); // 🌟 Dispara a re-renderização instantânea de toda a árvore admin!
      await mudarIdiomaSistema(novoIdioma);

      const nomesIdiomas = { 'pt-BR': 'Português', 'en-US': 'English', 'es-ES': 'Español' };

      Swal.fire({
        title: translations[novoIdioma].alertLangTitle,
        text: `${translations[novoIdioma].alertLangDesc} ${nomesIdiomas[novoIdioma]}.`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err) {
      Swal.fire('Erro / Error', 'Não foi possível alterar o idioma no servidor.', 'error');
    }
  };

  const handleToggleTema = async () => {
    try {
      const novoEstadoTema = await alternarTemaRapido();
      setDarkMode(novoEstadoTema);

      if (novoEstadoTema) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      Swal.fire({
        title: localTxt.alertThemeTitle,
        text: `${localTxt.alertThemeDesc} ${novoEstadoTema ? 'dark/escuro' : 'light/claro'}.`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      Swal.fire('Erro', 'Falha ao alterar tema.', 'error');
    }
  };

  const handleTogglePush = async () => {
    try {
      const novoEstadoPush = await alternarPushRapido();
      setNotifications(novoEstadoPush);

      const toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
      });
      toast.fire({
        icon: 'success',
        title: novoEstadoPush ? 'Notificações push ativadas!' : 'Notificações push desativadas!'
      });
    } catch (err) {
      Swal.fire('Erro', 'Falha ao alterar notificações push.', 'error');
    }
  };

  const handleToggleEmail = async () => {
    try {
      const novoEstadoEmail = await alternarEmailRapido();
      setEmailNotifications(novoEstadoEmail);

      const toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
      });
      toast.fire({
        icon: 'success',
        title: novoEstadoEmail ? 'Notificações por e-mail ativadas!' : 'Notificações por e-mail desativadas!'
      });
    } catch (err) {
      Swal.fire('Erro', 'Falha ao alterar notificações por e-mail.', 'error');
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
        idConfig,
        temaEscuro: darkMode,
        idioma: currentLang,
        notificaçõesAtivas: notifications,
        enviarEmailConfirmacao: emailNotifications,
        frequenciaBackupDias: backupDays,
        lembretePreAtendimentoHoras: reminderHours
      };

      await salvarConfiguracoes(payload);
      setHasChanges(false);

      Swal.fire({
        title: localTxt.alertSaveTitle,
        text: localTxt.alertSaveDesc,
        icon: 'success',
        confirmButtonColor: '#C51B53'
      });
    } catch (err) {
      Swal.fire({ title: 'Erro', text: 'Erro ao salvar.', icon: 'error' });
    }
  };

  // Executa o download chamando a nova rota na controller
// Executa o download chamando a API através do cliente HTTP centralizado
  const handleExportSubmit = async () => {
    try {
      setExporting(true);

      // 🌟 Agora utiliza a API do Axios configurada, que já traz o blob correto
      const blob = await exportarDadosBanco(selectedTable, startDate, endDate);

      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${selectedTable}_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setShowExportModal(false);
      Swal.fire('Sucesso', 'O seu ficheiro de exportação foi gerado!', 'success');
    } catch (error) {
      console.error(error);
      Swal.fire('Erro', 'Erro ao realizar a exportação.', 'error');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-gray-500 font-medium">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 text-foreground">
      {/* Header */}
      <div className="bg-white dark:bg-card px-5 py-4 shadow-sm sticky top-0 z-10 border-b border-gray-100 dark:border-border">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-primary hover:opacity-80 transition-all mb-4"
        >
          <ArrowLeft size={20} />
          <span>{localTxt.back}</span>
        </button>
        <h2 className="text-primary text-2xl font-bold">{localTxt.title}</h2>
        <p className="text-gray-600 dark:text-muted-foreground text-sm mt-1">{localTxt.subtitle}</p>
      </div>

      <div className="px-5 py-6 space-y-6 max-w-2xl mx-auto">
        {/* Notifications Section */}
        <div>
          <h3 className="text-gray-700 dark:text-foreground font-semibold mb-3 text-sm uppercase tracking-wide flex items-center gap-2">
            <Bell size={16} className="text-primary" />
            {localTxt.notifications}
          </h3>
          <div className="bg-white dark:bg-card rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-border">
            <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-border">
              <div className="flex-1">
                <p className="font-medium">{localTxt.push}</p>
                <p className="text-gray-600 dark:text-muted-foreground text-sm">{localTxt.pushDesc}</p>
              </div>
              <button
                onClick={handleTogglePush}
                className={`w-12 h-6 rounded-full transition-colors ${notifications ? 'bg-primary' : 'bg-gray-300 dark:bg-switch-background'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${notifications ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium">{localTxt.email}</p>
                <p className="text-gray-600 dark:text-muted-foreground text-sm">{localTxt.emailDesc}</p>
              </div>
              <button
                onClick={handleToggleEmail}
                className={`w-12 h-6 rounded-full transition-colors ${emailNotifications ? 'bg-primary' : 'bg-gray-300 dark:bg-switch-background'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${emailNotifications ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Appearance Section */}
        <div>
          <h3 className="text-gray-700 dark:text-foreground font-semibold mb-3 text-sm uppercase tracking-wide flex items-center gap-2">
            <Moon size={16} className="text-primary" />
            {localTxt.appearance}
          </h3>
          <div className="bg-white dark:bg-card rounded-xl shadow-md p-4 border border-gray-100 dark:border-border">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium">{localTxt.darkMode}</p>
                <p className="text-gray-600 dark:text-muted-foreground text-sm">{localTxt.darkModeDesc}</p>
              </div>
              <button
                onClick={handleToggleTema}
                className={`w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-primary' : 'bg-gray-300 dark:bg-switch-background'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Language & Rules Section */}
        <div>
          <h3 className="text-gray-700 dark:text-foreground font-semibold mb-3 text-sm uppercase tracking-wide flex items-center gap-2">
            <Globe size={16} className="text-primary" />
            {localTxt.businessRules}
          </h3>
          <div className="bg-white dark:bg-card rounded-xl shadow-md p-5 space-y-4 border border-gray-100 dark:border-border">
            <div>
              <label className="text-sm text-gray-600 dark:text-muted-foreground mb-2 block">{localTxt.uiLanguage}</label>
              <select
                value={currentLang} 
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-input-background rounded-xl border border-gray-200 dark:border-border focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en-US">English (US)</option>
                <option value="es-ES">Español</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-600 dark:text-muted-foreground mb-2 block">{localTxt.reminder}</label>
              <input
                type="number"
                value={reminderHours}
                onChange={(e) => registrarMudanca(setReminderHours, parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-input-background rounded-xl border border-gray-200 dark:border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Data & Privacy Section */}
        <div>
          <h3 className="text-gray-700 dark:text-foreground font-semibold mb-3 text-sm uppercase tracking-wide flex items-center gap-2">
            <Shield size={16} className="text-primary" />
            {localTxt.security}
          </h3>
          <div className="bg-white dark:bg-card rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-border">
            <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-border">
              <div className="flex-1">
                <p className="font-medium">{localTxt.backupFreq}</p>
                <p className="text-gray-600 dark:text-muted-foreground text-sm">{localTxt.backupFreqDesc}</p>
              </div>
              <input
                type="number"
                value={backupDays}
                onChange={(e) => registrarMudanca(setBackupDays, parseInt(e.target.value) || 7)}
                className="w-20 px-3 py-2 bg-gray-50 dark:bg-input-background rounded-lg border border-gray-200 dark:border-border text-center"
              />
            </div>
            
            {/* Botão de Exportar - Agora abre o Modal */}
            <button 
              onClick={() => setShowExportModal(true)}
              className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-secondary/20 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Database className="text-primary" size={20} />
                <div>
                  <p className="font-medium">{localTxt.exportDb}</p>
                  <p className="text-gray-600 dark:text-muted-foreground text-sm">{localTxt.exportDbDesc}</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Device Info */}
        <div>
          <h3 className="text-gray-700 dark:text-foreground font-semibold mb-3 text-sm uppercase tracking-wide flex items-center gap-2">
            <Smartphone size={16} className="text-primary" />
            {localTxt.sysInfo}
          </h3>
          <div className="bg-white dark:bg-card rounded-xl shadow-md p-4 space-y-3 border border-gray-100 dark:border-border">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-muted-foreground">{localTxt.backendVer}</span>
              <span className="font-semibold">1.0.0-MVP (Spring Boot)</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-muted-foreground">{localTxt.env}</span>
              <span className="text-purple-600 dark:text-primary font-medium">Localhost:8080</span>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      {hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-card border-t border-gray-200 dark:border-border px-5 py-4 shadow-lg flex justify-center z-50">
          <button
            onClick={handleSave}
            className="w-full max-w-md bg-accent text-white py-4 rounded-xl shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-2 font-semibold"
          >
            <Check size={20} />
            <span>{localTxt.saveBtn}</span>
          </button>
        </div>
      )}

      {/* 🌟 NOVO MODAL DE EXPORTAÇÃO SELECIONÁVEL COM PERÍODO DE DATA 🌟 */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/55 z-50 flex items-center justify-center p-5 backdrop-blur-sm">
          <div className="bg-white dark:bg-card rounded-xl p-6 w-full max-w-md border border-gray-100 dark:border-border shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-2">
                <Database className="text-primary" size={20} />
                <h3 className="text-primary dark:text-foreground font-bold text-lg">
                  {localTxt.modalExportTitle}
                </h3>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Seleção de Tabela */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-muted-foreground mb-2 block">
                  {localTxt.lblSelectTable}
                </label>
                <select
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-input-background rounded-xl border border-gray-200 dark:border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm cursor-pointer"
                >
                  <option value="clientes">{localTxt.tableOptions.clientes}</option>
                  <option value="servicos">{localTxt.tableOptions.servicos}</option>
                  <option value="estoque">{localTxt.tableOptions.estoque}</option>
                  <option value="agendamentos">{localTxt.tableOptions.agendamentos}</option>
                </select>
              </div>

              {/* Período das Datas */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-muted-foreground mb-2 block flex items-center gap-1.5">
                  <Calendar size={14} className="text-primary" />
                  {localTxt.lblPeriod}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] text-gray-500 mb-1 block">{localTxt.lblStartDate}</span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-input-background rounded-lg border border-gray-200 dark:border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-500 mb-1 block">{localTxt.lblEndDate}</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-input-background rounded-lg border border-gray-200 dark:border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Ações do Modal */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowExportModal(false)}
                className="flex-1 py-3 bg-gray-100 dark:bg-secondary/40 text-gray-600 dark:text-muted-foreground rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-secondary/60 transition-colors"
              >
                {localTxt.btnCancel}
              </button>
              <button
                onClick={handleExportSubmit}
                disabled={exporting}
                className="flex-1 py-3 bg-accent text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {exporting ? '...' : <Check size={18} />}
                <span>{localTxt.btnExportSubmit}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}