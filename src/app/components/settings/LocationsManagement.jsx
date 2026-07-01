import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Edit2, Globe, Search, Loader2, Image as ImageIcon, ArrowLeft, Check, AlertCircle } from 'lucide-react';
// Ajustado de editarLocal para atualizarLocal conforme exportado pela sua API
import { listarLocais, salvarLocal, alternarStatusLocal, atualizarLocal } from '../../../api';
import axios from 'axios';

export function LocationsManagement({ onBack }) {
  const [locais, setLocais] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null); // Armazena o ID do local sendo editado

  // Estado do formulário estruturado (Adicionado localidade e uf)
  const [formData, setFormData] = useState({
    nomeLocal: '',
    cep: '',
    logradouro: '',
    bairro: '',
    localidade: '', // Cidade
    uf: '',         // Estado (Ex: SP)
    numero: '',
    linkGoogleMaps: '',
    imageUrl: '', // URL de imagem fornecida para ilustrar o estúdio
    taxaAdicional: 0
  });

  useEffect(() => {
    carregarLocais();
  }, []);

  const carregarLocais = async () => {
    setLoading(true);
    try {
      const dados = await listarLocais();
      setLocais(dados || []);
    } catch (err) {
      console.error("Erro ao carregar locais:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔍 Busca Automática na API ViaCEP com preenchimento de localidade
  const handleCepBlur = async () => {
    const cepLimpo = formData.cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;

    setCepLoading(true);
    try {
      const response = await axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      if (response.data.erro) {
        alert("CEP não encontrado.");
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        logradouro: response.data.logradouro,
        bairro: response.data.bairro,
        localidade: response.data.localidade, // Guarda a cidade (Ex: São Paulo)
        uf: response.data.uf                  // Guarda o estado (Ex: SP)
      }));
    } catch (err) {
      console.error("Erro ao buscar CEP:", err);
      alert("Erro ao buscar informações do CEP.");
    } finally {
      setCepLoading(false);
    }
  };

  // 📝 Gatilho para abrir formulário em modo Edição (Reconstruindo localidade/uf)
  const handleIniciarEdicao = (local) => {
    const end = extrairEndereco(local.enderecoCompleto);
    const links = extrairLinks(local.linkGoogleMaps);

    setEditingId(local.idLocal);
    setFormData({
      nomeLocal: local.nomeLocal || '',
      cep: end.cep || '',
      logradouro: end.logradouro || '',
      bairro: end.bairro || '',
      localidade: end.localidade || '',
      uf: end.uf || '',
      numero: end.numero || '',
      linkGoogleMaps: links.maps || '',
      imageUrl: links.image === 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=600' ? '' : links.image,
      taxaAdicional: local.taxaAdicional || 0
    });
    setShowForm(true);
  };

  const handleCancelarFormulario = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ nomeLocal: '', cep: '', logradouro: '', bairro: '', localidade: '', uf: '', numero: '', linkGoogleMaps: '', imageUrl: '', taxaAdicional: 0 });
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    if (!formData.nomeLocal || !formData.cep || !formData.numero) {
      alert("Por favor, preencha os campos obrigatórios.");
      return;
    }

    setSubmitLoading(true);

    // 📦 Incluído localidade e uf no empacotamento do endereço stringificado
    const enderecoEstruturado = JSON.stringify({
      cep: formData.cep,
      logradouro: formData.logradouro,
      bairro: formData.bairro,
      localidade: formData.localidade,
      uf: formData.uf,
      numero: formData.numero
    });

    const linkCombinado = `${formData.linkGoogleMaps || 'https://maps.google.com'}||${formData.imageUrl || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=600'}`;

    const localDTO = {
      nomeLocal: formData.nomeLocal,
      enderecoCompleto: enderecoEstruturado,
      tipo: "salon",
      taxaAdicional: parseFloat(formData.taxaAdicional) || 0,
      linkGoogleMaps: linkCombinado,
      isAtivo: true
    };

    try {
      if (editingId) {
        await atualizarLocal(editingId, localDTO);
        alert("Ponto de atendimento updated com sucesso!");
      } else {
        await salvarLocal(localDTO);
        alert("Ponto de atendimento cadastrado com sucesso!");
      }
      
      handleCancelarFormulario();
      carregarLocais();
    } catch (err) {
      console.error("Erro ao salvar local:", err);
      alert(editingId ? "Não foi possível atualizar o local." : "Não foi possível salvar o local.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDesativar = async (id) => {
    if (confirm("Deseja realmente desativar este local de atendimento?")) {
      try {
        await alternarStatusLocal(id, false);
        carregarLocais();
      } catch (err) {
        alert("Erro ao alterar status do local.");
      }
    }
  };

  // Helper adaptado para capturar de forma segura cidade (localidade) e UF
  const extrairEndereco = (stringEndereco) => {
    if (!stringEndereco) {
      return { logradouro: 'Endereço não informado', bairro: '', localidade: '', uf: '', numero: 'S/N', cep: '' };
    }
    try {
      const parsed = JSON.parse(stringEndereco);
      if (!parsed || typeof parsed !== 'object') {
        return { logradouro: stringEndereco, bairro: '', localidade: '', uf: '', numero: 'S/N', cep: '' };
      }
      return {
        logradouro: parsed.logradouro || 'Endereço não estruturado',
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

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-primary">Locais de Atendimento</h2>
            <p className="text-xs text-gray-500">Gerencie seus estúdios físicos e pontos fixos</p>
          </div>
        </div>
        
        {!showForm && (
          <button
            onClick={() => { setEditingId(null); setShowForm(true); }}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:bg-primary/95 transition-all"
          >
            <Plus size={16} /> Novo Estúdio
          </button>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6">
        {showForm ? (
          <form onSubmit={handleSalvar} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">
              {editingId ? "Editar Ponto Comercial" : "Cadastrar Novo Ponto Comercial"}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nome do Estabelecimento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Studio Moema Premium"
                  value={formData.nomeLocal}
                  onChange={e => setFormData({...formData, nomeLocal: e.target.value})}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">CEP *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={9}
                    placeholder="00000-000"
                    value={formData.cep}
                    onBlur={handleCepBlur}
                    onChange={e => setFormData({...formData, cep: e.target.value})}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                  {cepLoading && <Loader2 className="absolute right-3 top-3 animate-spin text-primary" size={16} />}
                </div>
              </div>

              <div className="md:col-span-2 grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Rua / Logradouro</label>
                  <input
                    type="text"
                    placeholder="Preenchido via CEP"
                    value={formData.logradouro}
                    onChange={e => setFormData({...formData, logradouro: e.target.value})}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-gray-50 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Número *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nº 123"
                    value={formData.numero}
                    onChange={e => setFormData({...formData, numero: e.target.value})}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Layout dividido dinamicamente para Bairro e Cidade/Localidade */}
              <div className="grid grid-cols-2 gap-3 md:col-span-1">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Bairro</label>
                  <input
                    type="text"
                    placeholder="Bairro"
                    value={formData.bairro}
                    onChange={e => setFormData({...formData, bairro: e.target.value})}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-gray-50 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Cidade / UF</label>
                  <input
                    type="text"
                    readOnly
                    placeholder="Cidade - UF"
                    value={formData.localidade ? `${formData.localidade} - ${formData.uf}` : ''}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Taxa de Balcão / Adicional (R$)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={formData.taxaAdicional}
                  onChange={e => setFormData({...formData, taxaAdicional: e.target.value})}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Link de Localização (Google Maps URL)</label>
                <input
                  type="url"
                  placeholder="https://maps.google.com/..."
                  value={formData.linkGoogleMaps}
                  onChange={e => setFormData({...formData, linkGoogleMaps: e.target.value})}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">URL da Imagem do Local (Fachada/Interno)</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://imagens.com/foto-estudio.jpg"
                    value={formData.imageUrl}
                    onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                    className="flex-1 px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                  <div className="w-10 h-10 border rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 overflow-hidden">
                    {formData.imageUrl ? <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Preview"/> : <ImageIcon size={18} />}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={handleCancelarFormulario}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitLoading}
                className="flex-1 py-3 bg-accent text-white rounded-xl text-sm font-medium hover:shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitLoading && <Loader2 size={16} className="animate-spin" />}
                {editingId ? "Atualizar Local" : "Salvar Local de Atendimento"}
              </button>
            </div>
          </form>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="animate-spin text-primary" size={32} />
            <p className="text-sm text-gray-500">Buscando locais cadastrados...</p>
          </div>
        ) : locais.length === 0 ? (
          <div className="bg-white border border-dashed rounded-2xl p-10 text-center text-gray-400">
            <MapPin size={40} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-medium">Nenhum estúdio físico ou ponto de atendimento fixo cadastrado.</p>
            <p className="text-xs mt-1">Cadastre seu primeiro endereço comercial para exibição nas agendas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {locais.map((local) => {
              const end = extrairEndereco(local.enderecoCompleto);
              const links = extrairLinks(local.linkGoogleMaps);

              return (
                <div key={local.idLocal} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="h-40 w-full bg-gray-200 relative">
                      <img 
                        src={links.image} 
                        alt={local.nomeLocal}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=600'; }}
                      />
                      <span className="absolute top-3 right-3 bg-green-500 text-white text-[10px] uppercase font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
                        <Check size={10} /> Ativo
                      </span>
                    </div>

                    <div className="p-5 space-y-2">
                      <h4 className="font-bold text-gray-800 text-base">{local.nomeLocal}</h4>
                      
                      <div className="space-y-1 text-xs text-gray-600">
                        <p className="font-medium text-gray-800">{end.logradouro}, Nº {end.numero}</p>
                        {/* Exibição formatada com Bairro, Cidade e Estado de maneira limpa */}
                        <p>{end.bairro}{end.localidade ? ` — ${end.localidade} / ${end.uf}` : ''} — CEP: {end.cep}</p>
                        {local.taxaAdicional > 0 && (
                          <p className="text-primary font-semibold mt-1">Taxa fixa de balcão: R$ {local.taxaAdicional.toFixed(2)}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-2 flex gap-2 border-t border-gray-100 bg-gray-50/50">
                    {links.maps && (
                      <a
                        href={links.maps}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm hover:bg-gray-50 transition-all"
                      >
                        <Globe size={14} className="text-blue-500" />
                        Ver no Maps
                      </a>
                    )}
                    
                    <button
                      onClick={() => handleIniciarEdicao(local)}
                      className="px-3 py-2 border border-gray-300 text-gray-600 bg-white rounded-xl hover:bg-gray-50 transition-colors"
                      title="Editar Local"
                    >
                      <Edit2 size={15} />
                    </button>

                    <button
                      onClick={() => handleDesativar(local.idLocal)}
                      className="px-3 py-2 border border-red-200 text-red-600 bg-white rounded-xl hover:bg-red-50 transition-colors"
                      title="Desativar Local"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}