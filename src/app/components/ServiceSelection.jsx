import { useState, useEffect, useMemo } from 'react';
import { Search, Clock, Plus, Check } from 'lucide-react';
import { listarServicosAtivos } from '../../api';

export function ServiceSelection({ selectedServices, setSelectedServices, onNext }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    async function carregarServicos() {
      try {
        const dados = await listarServicosAtivos();
        setServices(dados);
      } catch (err) {
        console.error("Erro ao listar serviços:", err);
      } finally {
        setLoading(false);
      }
    }
    carregarServicos();
  }, []);

  const categorias = useMemo(() => {
    const cats = new Set(services.map(s => s.categoria).filter(Boolean));
    return ['all', ...Array.from(cats)];
  }, [services]);

  // 1. CORREÇÃO DO FILTRO (Usando nomeServico)
  const servicosFiltrados = useMemo(() => {
    return services.filter(s => {
      // Como o DTO não trouxe o campo 'descricao', validamos apenas o nomeServico
      const batePesquisa = s.nomeServico?.toLowerCase().includes(searchTerm.toLowerCase());
      const bateCategoria = selectedCategory === 'all' || s.categoria === selectedCategory;
      return batePesquisa && bateCategoria;
    });
  }, [services, searchTerm, selectedCategory]);

  const toggleService = (servico) => {
    setSelectedServices([servico]);
  };

  if (loading) return <div className="text-center py-10 text-gray-500">A carregar serviços...</div>;

  return (
    <div className="space-y-4 animate-fadeIn">
      <h2 className="text-xl font-bold text-gray-900">Selecione o Serviço</h2>
      
      {/* Barra de Pesquisa */}
      <div className="relative">
        <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Buscar unhas, alongamentos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-primary"
        />
      </div>

      {/* Categorias Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categorias.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat ? 'bg-primary text-white' : 'bg-white text-gray-500 border border-gray-100'
            }`}
          >
            {cat === 'all' ? 'Todos' : cat}
          </button>
        ))}
      </div>

      {/* Lista de Serviços */}
      <div className="space-y-3">
        {servicosFiltrados.map(s => {
          const isSelected = selectedServices.some(item => (item.idServico || item.id) === (s.idServico || s.id));
          return (
            <div
              key={s.idServico || s.id}
              onClick={() => toggleService(s)}
              className={`p-4 bg-white rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${
                isSelected ? 'border-primary bg-purple-50/40 shadow-sm' : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className="space-y-1 pr-4">
                {/* 2. CORREÇÃO AQUI: Trocado s.nome por s.nomeServico */}
                <h3 className="font-bold text-gray-800">{s.nomeServico}</h3>
                <p className="text-xs text-gray-400">{s.categoria || 'Geral'}</p>
                <div className="flex items-center gap-1 text-xs text-gray-500 pt-1">
                  <Clock size={12} /> {s.duracaoMinutos || 60} min
                </div>
              </div>
              <div className="text-right flex items-center gap-3">
                <span className="font-extrabold text-primary whitespace-nowrap">
                  {s.precoBase ? `R$ ${s.precoBase.toFixed(2)}` : 'Grátis'}
                </span>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                  isSelected ? 'bg-primary text-white' : 'bg-purple-50 text-primary'
                }`}>
                  {isSelected ? <Check size={16} /> : <Plus size={16} />}
                </div>
              </div>
            </div>
          );
        })}

        {servicosFiltrados.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            Nenhum serviço ativo encontrado para esta busca.
          </div>
        )}
      </div>

      {/* Botão Avançar Fixo na Base */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-5 py-4 shadow-lg z-40">
        <div className="max-w-md mx-auto">
          <button
            onClick={onNext}
            disabled={selectedServices.length === 0}
            className="w-full bg-accent text-white py-4 rounded-xl font-semibold shadow-md disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Avançar para Local
          </button>
        </div>
      </div>
    </div>
  );
}