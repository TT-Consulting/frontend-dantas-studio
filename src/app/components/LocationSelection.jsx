import { useState, useEffect } from 'react';
import { Home, Building2, MapPin, Loader2, Car } from 'lucide-react';

export function LocationSelection({ selectedLocation, setSelectedLocation, address, setAddress, onNext }) {
  const [cepLoading, setCepLoading] = useState(false);
  const [taxaEstimada, setTaxaEstimada] = useState(0);

  // CEP Base de Origem (Casa da Annika)
  const CEP_ORIGEM = "06824140";

  // Função que simula a precificação por estimativa (estilo Uber/99) com base na distância das faixas de CEP
  const calcularTaxaDeslocamento = (cepDestino) => {
    const cepLimpo = cepDestino.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return 0;

    // Simulação matemática de distância por prefixos de CEP (Metodologia de estimativa regional)
    const prefixoOrigem = Math.floor(parseInt(CEP_ORIGEM) / 1000);
    const prefixoDestino = Math.floor(parseInt(cepLimpo) / 1000);
    const diferencaRegiao = Math.abs(prefixoOrigem - prefixoDestino);

    let valorBase = 8.00; // Tarifa mínima do deslocamento (Bandeirada)
    let valorPorKmEstimado = 2.50; // Custo estimado por variação regional

    // Se for exatamente o mesmo CEP ou vizinho imediato
    if (diferencaRegiao === 0) {
      return valorBase + 2.00; // Próximo à casa da Annika (~ R$ 10,00)
    } else if (diferencaRegiao <= 5) {
      return valorBase + (diferencaRegiao * valorPorKmEstimado); // Mesma zona/município (~ R$ 12,00 a R$ 18,00)
    } else {
      return valorBase + (diferencaRegiao * 1.80); // Outras regiões/cidades de SP
    }
  };

  // useEffect para monitorar o preenchimento do CEP e disparar o ViaCEP
  useEffect(() => {
    const cepLimpo = address?.zip?.replace(/\D/g, '') || '';
    
    if (cepLimpo.length === 8) {
      const buscarCep = async () => {
        setCepLoading(true);
        try {
          const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
          const data = await response.json();
          
          if (!data.erro) {
            const taxa = calcularTaxaDeslocamento(cepLimpo);
            setTaxaEstimada(taxa);

            setAddress(prev => ({
              ...prev,
              street: data.logradouro,
              neighborhood: data.bairro,
              city: data.localidade,
              state: data.uf,
              taxaDeslocamento: taxa // repassa a taxa calculada para o estado do formulário global
            }));
          } else {
            alert('CEP não encontrado. Por favor, digite manualmente.');
          }
        } catch (error) {
          console.error("Erro ao buscar ViaCEP:", error);
        } finally {
          setCepLoading(false);
        }
      };

      buscarCep();
    }
  }, [address?.zip]);

  // Zera a taxa caso mude para a opção 'No Estúdio'
  useEffect(() => {
    if (selectedLocation === 'studio') {
      setTaxaEstimada(0);
      setAddress(prev => ({ ...prev, taxaDeslocamento: 0 }));
    } else if (selectedLocation === 'home' && address.zip) {
      const taxa = calcularTaxaDeslocamento(address.zip);
      setTaxaEstimada(taxa);
      setAddress(prev => ({ ...prev, taxaDeslocamento: taxa }));
    }
  }, [selectedLocation]);

  return (
    <div className="space-y-6 animate-fadeIn pb-24">
      <h2 className="text-xl font-bold text-gray-900">Onde deseja o atendimento?</h2>

      <div className="grid grid-cols-2 gap-4">
        {/* Opção Estúdio */}
        <div
          onClick={() => setSelectedLocation('studio')}
          className={`p-5 rounded-2xl bg-white border-2 text-center cursor-pointer transition-all ${
            selectedLocation === 'studio' ? 'border-primary bg-purple-50/30' : 'border-gray-100'
          }`}
        >
          <div className="w-12 h-12 bg-purple-50 text-primary rounded-xl flex items-center justify-center mx-auto mb-3">
            <Building2 size={24} />
          </div>
          <h3 className="font-bold text-gray-800 text-sm">No Estúdio</h3>
          <p className="text-xs text-gray-400 mt-1">Endereço fixo do Studio</p>
        </div>

        {/* Opção Atendimento a Domicílio */}
        <div
          onClick={() => setSelectedLocation('home')}
          className={`p-5 rounded-2xl bg-white border-2 text-center cursor-pointer transition-all ${
            selectedLocation === 'home' ? 'border-primary bg-purple-50/30' : 'border-gray-100'
          }`}
        >
          <div className="w-12 h-12 bg-purple-50 text-primary rounded-xl flex items-center justify-center mx-auto mb-3">
            <Home size={24} />
          </div>
          <h3 className="font-bold text-gray-800 text-sm">A Domicílio</h3>
          <p className="text-xs text-gray-400 mt-1">Vou até a sua casa (+ taxa)</p>
        </div>
      </div>

      {/* Formulário de Endereço se for Atendimento Domiciliar */}
      {selectedLocation === 'home' && (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4 dynamic-form animate-fadeIn">
          <h4 className="font-semibold text-sm text-gray-700 flex items-center gap-1.5">
            <MapPin size={16} className="text-primary" /> Endereço de Atendimento
          </h4>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-1 relative">
              <input
                type="text"
                placeholder="CEP"
                maxLength="9"
                value={address.zip || ''}
                onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                className="w-full p-3 text-sm border border-gray-200 rounded-xl focus:outline-primary"
              />
              {cepLoading && (
                <Loader2 className="absolute right-2 top-3.5 text-primary animate-spin" size={16} />
              )}
            </div>
            <input
              type="text"
              placeholder="Rua / Logradouro"
              value={address.street || ''}
              onChange={(e) => setAddress({ ...address, street: e.target.value })}
              className="col-span-2 p-3 text-sm border border-gray-200 rounded-xl focus:outline-primary"
            />
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="Bairro"
              value={address.neighborhood || ''}
              onChange={(e) => setAddress({ ...address, neighborhood: e.target.value })}
              className="col-span-2 p-3 text-sm border border-gray-200 rounded-xl focus:outline-primary"
            />
            <input
              type="text"
              placeholder="Número"
              value={address.number || ''}
              onChange={(e) => setAddress({ ...address, number: e.target.value })}
              className="col-span-1 p-3 text-sm border border-gray-200 rounded-xl focus:outline-primary"
            />
          </div>

          {/* Card Dinâmico da Estimativa de Deslocamento (Estilo Aplicativo de Corrida) */}
          {taxaEstimada > 0 && (
            <div className="flex items-center justify-between bg-gray-50 border border-gray-100 p-3.5 rounded-xl animate-fadeIn">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-100 text-primary rounded-lg">
                  <Car size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700">Taxa de Deslocamento</p>
                  <p className="text-[10px] text-gray-400">Estimada via rota de transporte</p>
                </div>
              </div>
              <span className="text-sm font-bold text-primary">
                {taxaEstimada.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Botão Fixo */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-5 py-4 shadow-lg z-40">
        <div className="max-w-md mx-auto">
          <button
            onClick={onNext}
            disabled={!selectedLocation || (selectedLocation === 'home' && (!address.street || !address.number))}
            className="w-full bg-accent text-white py-4 rounded-xl font-semibold shadow-md disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all"
          >
            Avançar para Horário
          </button>
        </div>
      </div>
    </div>
  );
}