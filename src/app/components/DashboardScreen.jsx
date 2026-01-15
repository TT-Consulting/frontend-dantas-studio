import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Calendar, CreditCard, Scissors, MapPin, Users } from 'lucide-react';

export function DashboardScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Vendas por semana do mês atual
  const salesByWeek = [
    { week: 'Semana 1', vendas: 1850, meta: 2000 },
    { week: 'Semana 2', vendas: 2100, meta: 2000 },
    { week: 'Semana 3', vendas: 1950, meta: 2000 },
    { week: 'Semana 4', vendas: 2300, meta: 2000 },
  ];

  // Receita líquida: vendas vs despesas
  const netRevenue = [
    { periodo: 'Mês Passado', vendas: 8200, despesas: 3500, liquido: 4700 },
    { periodo: 'Mês Atual', vendas: 8200, despesas: 2800, liquido: 5400 },
  ];

  // Despesas pessoais
  const personalExpenses = [
    { periodo: 'Mês Passado', despesas: 3500 },
    { periodo: 'Mês Atual', despesas: 2800 },
  ];

  // Faturamento por meio de pagamento
  const paymentMethods = [
    { metodo: 'PIX', valor: 3200 },
    { metodo: 'Dinheiro', valor: 2100 },
    { metodo: 'Cartão', valor: 2900 },
  ];

  // Ranking de serviços
  const serviceRanking = [
    { servico: 'Alongamento em Gel', valor: 3600, quantidade: 24 },
    { servico: 'Manicure Premium', valor: 2400, quantidade: 30 },
    { servico: 'Nail Art', valor: 1500, quantidade: 15 },
    { servico: 'Pedicure', valor: 700, quantidade: 14 },
  ];

  // Ranking de locais
  const locationRanking = [
    { local: 'Studio Jardins', valor: 4800 },
    { local: 'Espaço Moema', valor: 2200 },
    { local: 'Atendimento Domiciliar', valor: 1200 },
  ];

  // Ranking de clientes
  const clientRanking = [
    { cliente: 'Maria Silva', valor: 1200, visitas: 8 },
    { cliente: 'Ana Costa', valor: 950, visitas: 6 },
    { cliente: 'Julia Santos', valor: 850, visitas: 5 },
    { cliente: 'Carla Oliveira', valor: 720, visitas: 4 },
    { cliente: 'Beatriz Lima', valor: 680, visitas: 4 },
  ];

  const totalSales = salesByWeek.reduce((acc, week) => acc + week.vendas, 0);
  const currentMonthNet = netRevenue[1].liquido;
  const previousMonthNet = netRevenue[0].liquido;
  const netGrowth = ((currentMonthNet - previousMonthNet) / previousMonthNet) * 100;

  return (
    <div className="pb-24 lg:pb-8 px-5 lg:px-8 pt-6 bg-background min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-primary">Dashboard & Relatórios</h2>
        <p className="text-gray-600 text-sm mt-1">Análise de desempenho do negócio</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 lg:p-6 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <DollarSign className="text-primary" size={16} />
            </div>
            <p className="text-gray-600 text-xs lg:text-sm">Vendas do Mês</p>
          </div>
          <p className="text-primary text-xl lg:text-2xl font-semibold">R$ {totalSales.toLocaleString()}</p>
          <p className="text-gray-500 text-xs mt-1">4 semanas</p>
        </div>

        <div className="bg-white rounded-xl p-4 lg:p-6 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-green-100 rounded-lg flex items-center justify-center">
              {netGrowth >= 0 ? (
                <TrendingUp className="text-green-600" size={16} />
              ) : (
                <TrendingDown className="text-red-600" size={16} />
              )}
            </div>
            <p className="text-gray-600 text-xs lg:text-sm">Receita Líquida</p>
          </div>
          <p className="text-green-600 text-xl lg:text-2xl font-semibold">R$ {currentMonthNet.toLocaleString()}</p>
          <p className={`text-xs mt-1 ${netGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {netGrowth >= 0 ? '↑' : '↓'} {Math.abs(netGrowth).toFixed(1)}% vs mês anterior
          </p>
        </div>
      </div>

      {/* Charts Grid - Desktop Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Vendas por Semana */}
        <div className="bg-white rounded-xl p-5 lg:p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="text-primary" size={20} />
              <h3 className="text-gray-800 font-semibold">Vendas por Semana</h3>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={salesByWeek}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                formatter={(value) => `R$ ${value}`}
              />
              <Legend />
              <Bar dataKey="vendas" fill="#8A2BE2" radius={[8, 8, 0, 0]} />
              <Bar dataKey="meta" fill="#FFE4E1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Receita Líquida: Vendas vs Despesas */}
        <div className="bg-white rounded-xl p-5 lg:p-6 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-primary" size={20} />
            <h3 className="text-gray-800 font-semibold">Receita Líquida</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={netRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="periodo" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                formatter={(value) => `R$ ${value}`}
              />
              <Legend />
              <Bar dataKey="vendas" fill="#10B981" name="Vendas" radius={[8, 8, 0, 0]} />
              <Bar dataKey="despesas" fill="#EF4444" name="Despesas" radius={[8, 8, 0, 0]} />
              <Bar dataKey="liquido" fill="#8A2BE2" name="Líquido" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Despesas Pessoais */}
        <div className="bg-white rounded-xl p-5 lg:p-6 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="text-red-500" size={20} />
            <h3 className="text-gray-800 font-semibold">Despesas Pessoais</h3>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={personalExpenses}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="periodo" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                formatter={(value) => `R$ ${value}`}
              />
              <Bar dataKey="despesas" fill="#EF4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 p-3 bg-red-50 rounded-lg">
            <p className="text-red-700 text-sm">
              Economia de <strong>R$ {(personalExpenses[0].despesas - personalExpenses[1].despesas).toLocaleString()}</strong> este mês
            </p>
          </div>
        </div>

        {/* Faturamento por Meio de Pagamento */}
        <div className="bg-white rounded-xl p-5 lg:p-6 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="text-primary" size={20} />
            <h3 className="text-gray-800 font-semibold">Faturamento por Pagamento</h3>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={paymentMethods} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="metodo" type="category" tick={{ fontSize: 12 }} width={80} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                formatter={(value) => `R$ ${value}`}
              />
              <Bar dataKey="valor" fill="#FF69B4" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Rankings Grid - Desktop 3 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Ranking de Serviços */}
        <div className="bg-white rounded-xl p-5 lg:p-6 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <Scissors className="text-primary" size={20} />
            <h3 className="text-gray-800 font-semibold">Ranking de Serviços</h3>
          </div>
          <div className="space-y-3">
            {serviceRanking.map((service, index) => (
              <div key={service.servico} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-semibold text-sm">{index + 1}º</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-gray-800 font-medium text-sm">{service.servico}</p>
                    <p className="text-primary font-semibold">R$ {service.valor.toLocaleString()}</p>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-primary rounded-full h-2 transition-all"
                      style={{ width: `${(service.valor / serviceRanking[0].valor) * 100}%` }}
                    />
                  </div>
                  <p className="text-gray-500 text-xs mt-1">{service.quantidade} atendimentos</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ranking de Locais */}
        <div className="bg-white rounded-xl p-5 lg:p-6 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="text-primary" size={20} />
            <h3 className="text-gray-800 font-semibold">Ranking de Locais</h3>
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
                    <p className="text-blue-600 font-semibold">R$ {location.valor.toLocaleString()}</p>
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

        {/* Ranking de Clientes */}
        <div className="bg-white rounded-xl p-5 lg:p-6 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <Users className="text-primary" size={20} />
            <h3 className="text-gray-800 font-semibold">Top Clientes</h3>
          </div>
          <div className="space-y-3">
            {clientRanking.map((client, index) => (
              <div key={client.cliente} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-accent font-semibold text-sm">{index + 1}º</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <p className="text-gray-800 font-medium text-sm">{client.cliente}</p>
                      <p className="text-gray-500 text-xs">{client.visitas} visitas</p>
                    </div>
                    <p className="text-accent font-semibold">R$ {client.valor.toLocaleString()}</p>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-accent rounded-full h-2 transition-all"
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
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
        <p className="text-gray-700 text-sm">
          💡 <strong>Dica:</strong> Acompanhe seus relatórios semanalmente para identificar tendências 
          e tomar decisões estratégicas para o crescimento do seu negócio.
        </p>
      </div>
    </div>
  );
}
