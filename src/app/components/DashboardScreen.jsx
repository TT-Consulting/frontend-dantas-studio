import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Calendar, CreditCard, Scissors, MapPin, Users, Edit2, Check, X, Info, Loader2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext'; // 🌟 Importando o hook de idioma
import {
  obterResumoDia,
  obterKpisMensais,
  obterRankingServicos,
  obterFaturamentoPagamentos,
  obterVendasSemana
} from '../../api/dashboard';

const localTranslations = {
  'pt-BR': {
    title: 'Dashboard & Relatórios',
    subtitle: 'Análise de desempenho do negócio em tempo real',
    nextAppointment: 'Próximo:',
    kpiSalesMonth: 'Vendas do Mês',
    kpiSalesSub: 'Faturamento fechado',
    kpiProfitYear: 'Lucro Anual',
    kpiProfitSub: 'vs mês anterior',
    kpiForecastToday: 'Previsão Hoje',
    kpiForecastSub: 'de {total} confirmados',
    kpiStockCritical: 'Estoque Crítico',
    kpiStockSub: 'Produtos precisando de reposição',
    chartPeriodTitle: 'Faturamento por Período',
    chartMetaLabel: 'Meta Alvo Periódica (R$)',
    chartBtnSave: 'Salvar',
    chartBtnCancel: 'Cancelar',
    chartRealRevenue: 'Faturamento Real',
    chartTargetMeta: 'Meta Estipulada',
    chartPaymentTitle: 'Faturamento por Pagamento',
    chartPaymentRevenue: 'Faturamento',
    rankServicesTitle: 'Ranking de Serviços',
    rankServicesSub: 'atendimentos',
    rankLocationsTitle: 'Ranking de Locais',
    rankClientsTitle: 'Top Clientes',
    rankClientsSub: 'visitas',
    tipTitle: 'Dica:',
    tipContent: 'Acompanhe seus relatórios de forma contínua para prever os fluxos de caixa e gerenciar o estoque com máxima antecedência operacional.',
    loadingText: 'Carregando dados estatísticos...',
    alertMeta: 'Por favor, insira um valor válido para a meta',
    originDataLabel: '📊 Origem dos Dados:',
    impactLabel: '💡 Impacto Estratégico:'
  },
  'en-US': {
    title: 'Dashboard & Reports',
    subtitle: 'Business performance analysis in real-time',
    nextAppointment: 'Next:',
    kpiSalesMonth: 'Sales of the Month',
    kpiSalesSub: 'Closed revenue',
    kpiProfitYear: 'Annual Profit',
    kpiProfitSub: 'vs previous month',
    kpiForecastToday: 'Forecast Today',
    kpiForecastSub: 'of {total} confirmed',
    kpiStockCritical: 'Critical Stock',
    kpiStockSub: 'Products needing replenishment',
    chartPeriodTitle: 'Revenue by Period',
    chartMetaLabel: 'Periodic Target Goal ($)',
    chartBtnSave: 'Save',
    chartBtnCancel: 'Cancel',
    chartRealRevenue: 'Real Revenue',
    chartTargetMeta: 'Stipulated Goal',
    chartPaymentTitle: 'Revenue by Payment Method',
    chartPaymentRevenue: 'Revenue',
    rankServicesTitle: 'Services Ranking',
    rankServicesSub: 'appointments',
    rankLocationsTitle: 'Locations Ranking',
    rankClientsTitle: 'Top Clients',
    rankClientsSub: 'visits',
    tipTitle: 'Tip:',
    tipContent: 'Monitor your reports continuously to forecast cash flows and manage inventory with maximum operational lead time.',
    loadingText: 'Loading statistical data...',
    alertMeta: 'Please enter a valid target value',
    originDataLabel: '📊 Data Source:',
    impactLabel: '💡 Strategic Impact:'
  },
  'es-ES': {
    title: 'Tablero & Informes',
    subtitle: 'Análisis de rendimiento del negocio en tiempo real',
    nextAppointment: 'Próximo:',
    kpiSalesMonth: 'Ventas del Mes',
    kpiSalesSub: 'Facturación cerrada',
    kpiProfitYear: 'Ganancia Anual',
    kpiProfitSub: 'vs mes anterior',
    kpiForecastToday: 'Previsión Hoy',
    kpiForecastSub: 'de {total} confirmados',
    kpiStockCritical: 'Stock Crítico',
    kpiStockSub: 'Productos que necesitan reposición',
    chartPeriodTitle: 'Facturación por Período',
    chartMetaLabel: 'Meta Alvo Periódica (€)',
    chartBtnSave: 'Guardar',
    chartBtnCancel: 'Cancelar',
    chartRealRevenue: 'Facturación Real',
    chartTargetMeta: 'Meta Estipulada',
    chartPaymentTitle: 'Facturación por Forma de Pago',
    chartPaymentRevenue: 'Facturación',
    rankServicesTitle: 'Ranking de Servicios',
    rankServicesSub: 'servicios',
    rankLocationsTitle: 'Ranking de Locales',
    rankClientsTitle: 'Top Clientes',
    rankClientsSub: 'visitas',
    tipTitle: 'Consejo:',
    tipContent: 'Monitoree sus informes continuamente para prever los flujos de caja y gestionar el stock con la máxima anticipación operativa.',
    loadingText: 'Cargando datos estadísticos...',
    alertMeta: 'Por favor, introduzca un valor válido para la meta',
    originDataLabel: '📊 Origen de Datos:',
    impactLabel: '💡 Impacto Estratégico:'
  }
};

export function DashboardScreen() {
  const { systemLanguage } = useLanguage(); // 🌟 Hook global de idioma
  const text = localTranslations[systemLanguage] || localTranslations['pt-BR'];

  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [weeklyMeta, setWeeklyMeta] = useState(2000);
  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [metaInput, setMetaInput] = useState(weeklyMeta.toString());
  const [infoModal, setInfoModal] = useState(null);

  const [resumoDia, setResumoDia] = useState(null);
  const [kpis, setKpis] = useState(null);
  const [salesByWeek, setSalesByWeek] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [serviceRanking, setServiceRanking] = useState([]);

  const [locationRanking] = useState([
    { local: 'Studio Jardins', valor: 4800 },
    { local: 'Espaço Moema', valor: 2200 },
    { local: 'Atendimento Domiciliar', valor: 1200 },
  ]);

  const [clientRanking] = useState([
    { cliente: 'Maria Silva', valor: 1200, visitas: 8 },
    { cliente: 'Ana Costa', valor: 950, visitas: 6 },
    { cliente: 'Julia Santos', valor: 850, visitas: 5 },
    { cliente: 'Carla Oliveira', valor: 720, visitas: 4 },
    { cliente: 'Beatriz Lima', valor: 680, visitas: 4 },
  ]);

  // 🌟 Formatador de moeda unificado
  const formatCurrency = (amount) => {
    if (systemLanguage === 'en-US') {
      return Number(amount).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2 });
    } else if (systemLanguage === 'es-ES') {
      return Number(amount).toLocaleString('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 2 });
    }
    return Number(amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 2 });
  };

  useEffect(() => {
    async function carregarDadosDashboard() {
      try {
        setLoading(true);
        const [resumo, kpiData, rankingServ, pagamentos, vendas] = await Promise.all([
          obterResumoDia(),
          obterKpisMensais(),
          obterRankingServicos(),
          obterFaturamentoPagamentos(),
          obterVendasSemana()
        ]);

        setResumoDia(resumo);
        setKpis(kpiData);
        setServiceRanking(rankingServ);
        setPaymentMethods(pagamentos);

        if (vendas && vendas.length > 0) {
          const dadosFormatados = vendas.map((v) => {
            const dataObj = new Date(v.dataDia);
            const labelDia = isNaN(dataObj.getTime())
              ? 'Dia'
              : dataObj.toLocaleDateString(systemLanguage, { day: 'numeric', month: 'short' });
            return {
              week: labelDia,
              vendas: v.faturamentoDia || 0,
            };
          });
          setSalesByWeek(dadosFormatados);
        }

      } catch (error) {
        console.error("Erro ao carregar dados do painel:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarDadosDashboard();
  }, [systemLanguage]);

  const totalSales = kpis?.faturamentoMesAtual || 0;
  const faturamentoAnterior = kpis?.faturamentoMesAnterior || 1;
  const netGrowth = ((totalSales - faturamentoAnterior) / faturamentoAnterior) * 100;
  const currentMonthNet = kpis?.lucroLiquidoAnual || 0;

  const updatedSalesByWeek = salesByWeek.map(item => ({
    ...item,
    meta: weeklyMeta
  }));

  const handleSaveMeta = () => {
    const newMeta = parseFloat(metaInput);
    if (!isNaN(newMeta) && newMeta > 0) {
      setWeeklyMeta(newMeta);
      setIsEditingMeta(false);
    } else {
      alert(text.alertMeta);
    }
  };

  const handleCancelMeta = () => {
    setMetaInput(weeklyMeta.toString());
    setIsEditingMeta(false);
  };

  // 🌟 Descrições traduzidas dinamicamente baseadas nas chaves de idioma
  const tooltips = {
    vendas_mes: {
      titulo: text.kpiSalesMonth,
      descricao: systemLanguage === 'en-US' ? 'Total sum of all monthly sales captured by the system' : systemLanguage === 'es-ES' ? 'Suma total de todas las ventas del mes actual capturadas por el sistema' : 'Soma total de todas las vendas do mês atual capturadas pelo sistema',
      dados: systemLanguage === 'en-US' ? 'Aggregation based on real monthly billing' : systemLanguage === 'es-ES' ? 'Agregación basada en la facturación mensual real' : 'Agregação baseada no faturamento mensal real',
      por_que: systemLanguage === 'en-US' ? 'Allows tracking general monthly performance and comparing with previous periods' : systemLanguage === 'es-ES' ? 'Permite seguir el rendimiento general del mes y comparar con períodos anteriores' : 'Permite acompanhar o desempenho geral do mês e comparar com períodos anteriores'
    },
    receita_liquida: {
      titulo: systemLanguage === 'en-US' ? 'Estimated Annual Return' : systemLanguage === 'es-ES' ? 'Retorno Anual Estimado' : 'Retorno Anual Estimado',
      descricao: systemLanguage === 'en-US' ? 'Accumulated value of annual net profit' : systemLanguage === 'es-ES' ? 'Valor acumulado del beneficio neto anual' : 'Valor acumulado do lucro líquido anual',
      dados: systemLanguage === 'en-US' ? 'Revenue calculation deducted from operational expenses' : systemLanguage === 'es-ES' ? 'Cálculo de ingresos deducidos de gastos operativos' : 'Cálculo de receitas deduzidas de despesas operacionais',
      por_que: systemLanguage === 'en-US' ? 'Shows consolidated real business earnings' : systemLanguage === 'es-ES' ? 'Muestra la ganancia real consolidada del negocio' : 'Mostra o ganho real consolidado do negócio'
    },
    vendas_semana: {
      titulo: text.chartPeriodTitle,
      descricao: systemLanguage === 'en-US' ? 'Comparison between daily sales made and target goal established' : systemLanguage === 'es-ES' ? 'Comparación entre ventas diarias realizadas y meta establecida' : 'Comparação entre vendas diárias realizadas e meta estabelecida',
      dados: systemLanguage === 'en-US' ? 'Purple bars = actual billing | Pink bars = stipulated goal' : systemLanguage === 'es-ES' ? 'Barras moradas = facturación real | Barras rosa = meta estipulada' : 'Barras roxas = faturamento real | Barras rosa = meta estipulada',
      por_que: systemLanguage === 'en-US' ? 'Identifies variations in recent financial flow for corrective actions' : systemLanguage === 'es-ES' ? 'Identifica variaciones en el flujo financiero reciente para acciones correctivas' : 'Identifica variações no fluxo financeiro recente para ações corretivas'
    },
    pagamento: {
      titulo: text.chartPaymentTitle,
      descricao: systemLanguage === 'en-US' ? 'Sales distribution by payment method used' : systemLanguage === 'es-ES' ? 'Distribución de ventas por método de pago utilizado' : 'Distribuição de vendas por método de pagamento utilizado',
      dados: systemLanguage === 'en-US' ? 'Gross amounts aggregated by PIX, Cash, and Card' : systemLanguage === 'es-ES' ? 'Valores brutos agregados por PIX, Efectivo y Tarjeta' : 'Valores brutos agregados por PIX, Dinheiro e Cartão',
      por_que: systemLanguage === 'en-US' ? 'Helps understand customer preferences and accounts receivable cash flow' : systemLanguage === 'es-ES' ? 'Ayuda a entender preferencias de clientes y flujo de caja de cuentas por cobrar' : 'Ajuda a entender preferências de clientes e fluxo de caixa de recebíveis'
    },
    servicos: {
      titulo: text.rankServicesTitle,
      descricao: systemLanguage === 'en-US' ? 'The 4 top-selling and executed services' : systemLanguage === 'es-ES' ? 'Los 4 servicios más vendidos y ejecutados' : 'Os 4 serviços mais vendidos e executados',
      dados: systemLanguage === 'en-US' ? 'Total revenue and quantity of appointments computed' : systemLanguage === 'es-ES' ? 'Facturación total y cantidad de servicios computados' : 'Faturamento total e quantidade de atendimentos computados',
      por_que: systemLanguage === 'en-US' ? 'Identifies which services generate most revenue to optimize offers' : systemLanguage === 'es-ES' ? 'Identifica qué servicios generan más ingresos para optimizar la oferta' : 'Identifies quais serviços geram mais receita para otimizar oferta'
    },
    locais: {
      titulo: text.rankLocationsTitle,
      descricao: systemLanguage === 'en-US' ? 'Productivity by service location' : systemLanguage === 'es-ES' ? 'Productividad por local de atención' : 'Produtividade por local de atendimento',
      dados: systemLanguage === 'en-US' ? 'Total revenue of each location' : systemLanguage === 'es-ES' ? 'Facturación total de cada local' : 'Faturamento total de cada local',
      por_que: systemLanguage === 'en-US' ? 'Allows evaluating which location is more profitable and efficient' : systemLanguage === 'es-ES' ? 'Permite evaluar qué local es más lucrativo y eficiente' : 'Permite avaliar qual local é mais lucrativo e eficiente'
    },
    clientes: {
      titulo: text.rankClientsTitle,
      descricao: systemLanguage === 'en-US' ? 'Customers who spend the most in the business' : systemLanguage === 'es-ES' ? 'Clientes que más gastan en el negocio' : 'Clientes que mais gastam no negócio',
      dados: systemLanguage === 'en-US' ? 'Revenue and number of visits per customer' : systemLanguage === 'es-ES' ? 'Facturación y cantidad de visitas por cliente' : 'Faturamento e quantidade de visitas por cliente',
      por_que: systemLanguage === 'en-US' ? 'Focusing on VIP customers helps maximize revenue' : systemLanguage === 'es-ES' ? 'El enfoque en clientes VIP ayuda a maximizar los ingresos' : 'Foco em cliente VIP ajuda a maximizar receita'
    }
  };

  const TooltipButton = ({ tooltipId }) => {
    const data = tooltips[tooltipId];
    if (!data) return null;

    return (
      <>
        <button
          onClick={() => setInfoModal(data)}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center text-gray-400 hover:text-primary"
          title="Info"
        >
          <Info size={18} />
        </button>

        {infoModal && infoModal.titulo === data.titulo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 dark:border-zinc-800 transform scale-100 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-primary">
                  <Info size={20} />
                  <h4 className="text-gray-900 dark:text-white font-semibold text-base">{data.titulo}</h4>
                </div>
                <button
                  onClick={() => setInfoModal(null)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-gray-600 dark:text-zinc-300 text-sm mb-4 leading-relaxed">
                {data.descricao}
              </p>

              <div className="space-y-3 border-t border-gray-100 dark:border-zinc-800 pt-4">
                <div className="bg-pink-50/50 dark:bg-pink-950/20 p-3 rounded-xl">
                  <p className="text-xs font-bold text-primary mb-0.5">{text.originDataLabel}</p>
                  <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">{data.dados}</p>
                </div>

                <div className="bg-gray-50 dark:bg-zinc-800/50 p-3 rounded-xl">
                  <p className="text-xs font-bold text-gray-700 dark:text-zinc-300 mb-0.5">{text.impactLabel}</p>
                  <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">{data.por_que}</p>
                </div>
              </div>

              <button
                onClick={() => setInfoModal(null)}
                className="mt-5 w-full py-2 bg-primary text-white font-medium text-sm rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
              >
                OK
              </button>
            </div>
          </div>
        )}
      </>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2 className="animate-spin text-primary mb-2" size={40} />
        <p className="text-gray-600 font-medium">{text.loadingText}</p>
      </div>
    );
  }

  return (
    <div className="pb-24 lg:pb-8 px-5 lg:px-8 pt-6 bg-background min-h-screen">
      {/* Header */}
      <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-primary">{text.title}</h2>
          <p className="text-gray-600 text-sm mt-1">{text.subtitle}</p>
        </div>
        {resumoDia?.proximoAgendamento && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-2 text-xs lg:text-sm text-gray-700 max-w-md">
            📌 <strong>{text.nextAppointment}</strong> {resumoDia.proximoAgendamento}
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 lg:p-6 shadow-md">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <DollarSign className="text-primary" size={16} />
              </div>
              <p className="text-gray-600 text-xs lg:text-sm">{text.kpiSalesMonth}</p>
            </div>
            <TooltipButton tooltipId="vendas_mes" />
          </div>
          <p className="text-primary text-xl lg:text-2xl font-semibold">{formatCurrency(totalSales)}</p>
          <p className="text-gray-500 text-xs mt-1">{text.kpiSalesSub}</p>
        </div>

        <div className="bg-white rounded-xl p-4 lg:p-6 shadow-md">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-green-100 rounded-lg flex items-center justify-center">
                {netGrowth >= 0 ? (
                  <TrendingUp className="text-green-600" size={16} />
                ) : (
                  <TrendingDown className="text-red-600" size={16} />
                )}
              </div>
              <p className="text-gray-600 text-xs lg:text-sm">{text.kpiProfitYear}</p>
            </div>
            <TooltipButton tooltipId="receita_liquida" />
          </div>
          <p className="text-green-600 text-xl lg:text-2xl font-semibold">{formatCurrency(currentMonthNet)}</p>
          <p className={`text-xs mt-1 ${netGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {netGrowth >= 0 ? '↑' : '↓'} {Math.abs(netGrowth).toFixed(1)}% {text.kpiProfitSub}
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 lg:p-6 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="text-blue-600" size={16} />
            </div>
            <p className="text-gray-600 text-xs lg:text-sm">{text.kpiForecastToday}</p>
          </div>
          <p className="text-blue-600 text-xl lg:text-2xl font-semibold">
            {formatCurrency(resumoDia?.faturamentoPrevistoHoje || 0)}
          </p>
          <p className="text-gray-500 text-xs mt-1">
            {text.kpiForecastSub.replace('{total}', resumoDia?.totalAgendamentosHoje || 0).replace('{confirmed}', resumoDia?.agendamentosConfirmados || 0)}
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 lg:p-6 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <X className="text-red-600" size={16} />
            </div>
            <p className="text-gray-600 text-xs lg:text-sm">{text.kpiStockCritical}</p>
          </div>
          <p className="text-red-600 text-xl lg:text-2xl font-semibold">
            {resumoDia?.itensEstoqueCritico || 0}
          </p>
          <p className="text-gray-500 text-xs mt-1">{text.kpiStockSub}</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl p-5 lg:p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="text-primary" size={20} />
              <h3 className="text-gray-800 font-semibold">{text.chartPeriodTitle}</h3>
            </div>
            <div className="flex items-center gap-2">
              <TooltipButton tooltipId="vendas_semana" />
              <button
                onClick={() => {
                  setIsEditingMeta(true);
                  setMetaInput(weeklyMeta.toString());
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Edit2 className="text-gray-600" size={18} />
              </button>
            </div>
          </div>

          {isEditingMeta && (
            <div className="mb-4 p-4 bg-pink-50/50 rounded-lg border border-pink-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {text.chartMetaLabel}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={metaInput}
                  onChange={(e) => setMetaInput(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  min="0"
                  step="100"
                />
                <button
                  onClick={handleSaveMeta}
                  className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1"
                >
                  <Check size={16} />
                  {text.chartBtnSave}
                </button>
                <button
                  onClick={handleCancelMeta}
                  className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors flex items-center gap-1"
                >
                  <X size={16} />
                  {text.chartBtnCancel}
                </button>
              </div>
            </div>
          )}

          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={updatedSalesByWeek}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                formatter={(value) => `${formatCurrency(value)}`}
              />
              <Legend />
              <Bar dataKey="vendas" name={text.chartRealRevenue} fill="#C51B53" radius={[8, 8, 0, 0]} />
              <Bar dataKey="meta" name={text.chartTargetMeta} fill="#FCD3DE" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-5 lg:p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CreditCard className="text-primary" size={20} />
              <h3 className="text-gray-800 font-semibold">{text.chartPaymentTitle}</h3>
            </div>
            <TooltipButton tooltipId="pagamento" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={paymentMethods} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="meioPagamento" type="category" tick={{ fontSize: 12 }} width={90} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                formatter={(value) => `${formatCurrency(value)}`}
              />
              <Bar dataKey="totalValor" name={text.chartPaymentRevenue} fill="#E45883" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Rankings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl p-5 lg:p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Scissors className="text-primary" size={20} />
              <h3 className="text-gray-800 font-semibold">{text.rankServicesTitle}</h3>
            </div>
            <TooltipButton tooltipId="servicos" />
          </div>
          <div className="space-y-3">
            {serviceRanking.map((service, index) => {
              const maiorValor = serviceRanking[0]?.faturamentoTotal || 1;
              return (
                <div key={service.nomeServico || index} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-semibold text-sm">{index + 1}º</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-gray-800 font-medium text-sm">{service.nomeServico || 'Desconhecido'}</p>
                      <p className="text-primary font-semibold">{formatCurrency(service.faturamentoTotal || 0)}</p>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-primary rounded-full h-2 transition-all"
                        style={{ width: `${((service.faturamentoTotal || 0) / maiorValor) * 100}%` }}
                      />
                    </div>
                    <p className="text-gray-500 text-xs mt-1">{service.quantidadeAtendimentos || 0} {text.rankServicesSub}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 lg:p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="text-primary" size={20} />
              <h3 className="text-gray-800 font-semibold">{text.rankLocationsTitle}</h3>
            </div>
            <TooltipButton tooltipId="locais" />
          </div>
          <div className="space-y-3">
            {locationRanking.map((location, index) => (
              <div key={location.local} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold text-sm">{index + 1}º</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-gray-800 font-medium text-sm">{location.local}</p>
                    <p className="text-blue-600 font-semibold">{formatCurrency(location.valor)}</p>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-blue-500 rounded-full h-2 transition-all"
                      style={{ width: `${(location.valor / locationRanking[0].valor) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 lg:p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="text-primary" size={20} />
              <h3 className="text-gray-800 font-semibold">{text.rankClientsTitle}</h3>
            </div>
            <TooltipButton tooltipId="clientes" />
          </div>
          <div className="space-y-3">
            {clientRanking.map((client, index) => (
              <div key={client.cliente} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-pink-600 font-semibold text-sm">{index + 1}º</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <p className="text-gray-800 font-medium text-sm">{client.cliente}</p>
                      <p className="text-gray-500 text-xs">{client.visitas} {text.rankClientsSub}</p>
                    </div>
                    <p className="text-pink-600 font-semibold">{formatCurrency(client.valor)}</p>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-pink-500 rounded-full h-2 transition-all"
                      style={{ width: `${(client.valor / clientRanking[0].valor) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-br from-pink-50 to-gray-50 rounded-xl p-5 border border-pink-100">
        <p className="text-gray-700 text-sm">
          💡 <strong>{text.tipTitle}</strong> {text.tipContent}
        </p>
      </div>
    </div>
  );
}