import { useState, useEffect } from 'react';
import { Home, Building2, MapPin, Loader2, Car, Globe } from 'lucide-react';
import { listarLocais } from '../../api'; // Importando a listagem de locais da sua API

export function LocationSelection({ selectedLocation, setSelectedLocation, address, setAddress, onNext }) {
  const [locais, setLocais] = useState([]);
  const [loadingLocais, setLoadingLocais] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [taxaEstimada, setTaxaEstimada] = useState(0);

  // CEP Base de Origem (Casa da Annika)
  const CEP_ORIGEM = "06824140";

  // Carrega os locais comerciais cadastrados ativos assim que o componente monta
  useEffect(() => {
    const buscarEstudios = async () => {
      setLoadingLocais(true);
      try {
        const dados = await listarLocais();
        // Como a API já filtra por it.isAtivo, salvamos direto
        setLocais(dados || []);
      } catch (err) {
        console.error("Erro ao buscar locais de atendimento comerciais:", err);
      } finally {
        setLoadingLocais(false);
      }
    };
    buscarEstudios();
  }, []);

  // Helpers para decodificar a string estruturada e os links concatenados com '||'
  const extrairEndereco = (stringEndereco) => {
    if (!stringEndereco) return { logradouro: 'Endereço não informado', bairro: '', localidade: '', uf: '', numero: 'S/N', cep: '' };
    try {
      const parsed = JSON.parse(stringEndereco);
      if (!parsed || typeof parsed !== 'object') return { logradouro: stringEndereco, bairro: '', localidade: '', uf: '', numero: 'S/N', cep: '' };
      return {
        logradouro: parsed.logradouro || '',
        bairro: parsed.bairro || '',
        localidade: parsed.localidade || '',
        uf: parsed.uf || '',
        numero: parsed.numero || 'S/N',
        cep: parsed.cep || ''
      };
    } catch {
      return { logradouro: stringEndereco, bairro: '', localidade: '', uf: '', numero: 'S/N', cep: '' };
    }
  };

  const extrairLinks = (stringLinks) => {
    if (!stringLinks) return { maps: '', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=600' };
    const partes = stringLinks.split('||');
    return {
      maps: partes[0] || '',
      image: partes[1] || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=600'
    };
  };

  // Função que simula a precificação por estimativa com base na distância regional
  const calcularTaxaDeslocamento = (cepDestino) => {
    const cepLimpo = cepDestino.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return 0;

    const prefixoOrigem = Math.floor(parseInt(CEP_ORIGEM) / 1000);
    const prefixoDestino = Math.floor(parseInt(cepLimpo) / 1000);
    const diferencaRegiao = Math.abs(prefixoOrigem - prefixoDestino);

    let valorBase = 8.00;
    let valorPorKmEstimado = 2.50;

    if (diferencaRegiao === 0) {
      return valorBase + 2.00;
    } else if (diferencaRegiao <= 5) {
      return valorBase + (diferencaRegiao * valorPorKmEstimado);
    } else {
      return valorBase + (diferencaRegiao * 1.80);
    }
  };

  // Monitora preenchimento do CEP domiciliar
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
              taxaDeslocamento: taxa
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

  // Limpa as taxas e gerencia se o usuário seleciona Estúdio ou Domicílio genericamente
  useEffect(() => {
    if (selectedLocation && selectedLocation !== 'home') {
      setTaxaEstimada(0);
      setAddress(prev => ({ ...prev, taxaDeslocamento: 0 }));
    } else if (selectedLocation === 'home' && address.zip) {
      const taxa = calcularTaxaDeslocamento(address.zip);
      setTaxaEstimada(taxa);
      setAddress(prev => ({ ...prev, taxaDeslocamento: taxa }));
    }
  }, [selectedLocation]);

  // Função disparada ao escolher um estúdio fixo específico da listagem
  const handleSelecionarEstudio = (local) => {
    setSelectedLocation(`studio-${local.idLocal}`);
    // Opcional: Se quiser salvar o endereço do estúdio selecionado no estado global
    setAddress({
      zip: extrairEndereco(local.enderecoCompleto).cep,
      street: extrairEndereco(local.enderecoCompleto).logradouro,
      neighborhood: extrairEndereco(local.enderecoCompleto).bairro,
      number: extrairEndereco(local.enderecoCompleto).numero,
      city: extrairEndereco(local.enderecoCompleto).localidade,
      state: extrairEndereco(local.enderecoCompleto).uf,
      taxaDeslocamento: local.taxaAdicional || 0 // Passa a taxa de balcão como taxa do agendamento
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-24">
      <h2 className="text-xl font-bold text-gray-900">Onde deseja o atendimento?</h2>

      <div className="grid grid-cols-2 gap-4">
        {/* Aba Atendimento a Domicílio */}
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

        {/* Aba No Estúdio */}
        <div
          onClick={() => {
            if (locais.length > 0) {
              handleSelecionarEstudio(locais[0]); // Seleciona o primeiro por padrão ao clicar
            } else {
              setSelectedLocation('studio');
            }
          }}
          className={`p-5 rounded-2xl bg-white border-2 text-center cursor-pointer transition-all ${
            selectedLocation && selectedLocation.toString().startsWith('studio') ? 'border-primary bg-purple-50/30' : 'border-gray-100'
          }`}
        >
          <div className="w-12 h-12 bg-purple-50 text-primary rounded-xl flex items-center justify-center mx-auto mb-3">
            <Building2 size={24} />
          </div>
          <h3 className="font-bold text-gray-800 text-sm">No Estúdio</h3>
          <p className="text-xs text-gray-400 mt-1">Em uma de nossas unidades</p>
        </div>
      </div>

      {/* 🏛️ LISTA DOS ESTÚDIOS DISPONÍVEIS (Exibida ao selecionar "No Estúdio") */}
      {selectedLocation && selectedLocation.toString().startsWith('studio') && (
        <div className="space-y-3 animate-fadeIn">
          <h4 className="font-semibold text-xs uppercase tracking-wider text-gray-400">Escolha a unidade desejada:</h4>
          
          {loadingLocais ? (
            <div className="flex justify-center items-center py-6 gap-2 text-sm text-gray-400">
              <Loader2 className="animate-spin text-primary" size={18} /> Buscando unidades...
            </div>
          ) : locais.length === 0 ? (
            <p className="text-xs text-gray-400 bg-gray-50 border border-dashed rounded-xl p-4 text-center">Nenhum endereço físico disponível no momento.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {locais.map((local) => {
                const end = extrairEndereco(local.enderecoCompleto);
                const links = extrairLinks(local.linkGoogleMaps);
                const isSelected = selectedLocation === `studio-${local.idLocal}`;

                return (
                  <div
                    key={local.idLocal}
                    onClick={() => handleSelecionarEstudio(local)}
                    className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all cursor-pointer flex flex-col md:flex-row ${
                      isSelected ? 'ring-2 ring-primary border-transparent' : 'border-gray-200'
                    }`}
                  >
                    {/* Imagem do Estúdio */}
                    <div className="h-32 md:w-40 w-full bg-gray-100 shrink-0 relative">
                      <img 
                        src={links.image} 
                        alt={local.nomeLocal}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=600'; }}
                      />
                    </div>

                    {/* Dados e Informações do Estúdio */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-gray-800 text-sm">{local.nomeLocal}</h4>
                          {local.taxaAdicional > 0 && (
                            <span className="text-[10px] bg-purple-100 text-primary font-bold px-2 py-0.5 rounded-md">
                              + R$ {local.taxaAdicional.toFixed(2)} balcão
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 font-medium mt-1">
                          {end.logradouro}, Nº {end.number}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {end.bairro} {end.localidade ? `— ${end.localidade} / ${end.uf}` : ''}
                        </p>
                      </div>

                      {/* Botão de Localização integrado de forma amigável */}
                      {links.maps && (
                        <div className="pt-2 flex justify-start">
                          <a
                            href={links.maps}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()} // impede disparar o clique de seleção do card
                            className="text-[11px] font-semibold text-blue-500 hover:text-blue-600 flex items-center gap-1 bg-blue-50/50 px-2 py-1 rounded-lg transition-colors"
                          >
                            <Globe size={12} /> Ver rota no Google Maps
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

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

      {/* Botão Fixo de Avançar */}
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