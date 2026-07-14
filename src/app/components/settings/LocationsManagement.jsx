import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Edit2, Globe, Search, Loader2, Image as ImageIcon, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext'; // 🌟 Hook de idioma (única adição)
// Ajustado de editarLocal para atualizarLocal conforme exportado pela sua API
import { listarLocais, salvarLocal, alternarStatusLocal, atualizarLocal } from '../../../api';
import axios from 'axios';

// 🌟 Dicionário de traduções — a única coisa adicionada em relação à versão que já funcionava.
// Toda a lógica de dados (JSON no enderecoCompleto, links combinados com '||') foi mantida
// exatamente como estava, porque é ela que salva CEP e imagem corretamente.
const localTranslations = {
  'pt-BR': {
    title: 'Locais de Atendimento',
    subtitle: 'Gerencie seus estúdios físicos e pontos fixos',
    btnNew: 'Novo Estúdio',
    formTitleNew: 'Cadastrar Novo Ponto Comercial',
    formTitleEdit: 'Editar Ponto Comercial',
    labelName: 'Nome do Estabelecimento *',
    placeholderName: 'Ex: Studio Moema Premium',
    labelCep: 'CEP *',
    labelStreet: 'Rua / Logradouro',
    placeholderStreet: 'Preenchido via CEP',
    labelNumber: 'Número *',
    placeholderNumber: 'Nº 123',
    labelDistrict: 'Bairro',
    placeholderDistrict: 'Bairro',
    labelCityUf: 'Cidade / UF',
    placeholderCityUf: 'Cidade - UF',
    labelFee: 'Taxa de Balcão / Adicional (R$)',
    labelMapsLink: 'Link de Localização (Google Maps URL)',
    labelImageUrl: 'URL da Imagem do Local (Fachada/Interno)',
    placeholderImageUrl: 'https://imagens.com/foto-estudio.jpg',
    btnCancel: 'Cancelar',
    btnUpdate: 'Atualizar Local',
    btnSave: 'Salvar Local de Atendimento',
    loadingList: 'Buscando locais cadastrados...',
    emptyTitle: 'Nenhum estúdio físico ou ponto de atendimento fixo cadastrado.',
    emptySubtitle: 'Cadastre seu primeiro endereço comercial para exibição nas agendas.',
    badgeActive: 'Ativo',
    btnMaps: 'Ver no Maps',
    feeLabel: 'Taxa fixa de balcão: R$',
    cepShort: 'CEP',
    alertRequired: 'Por favor, preencha os campos obrigatórios.',
    alertCepNotFound: 'CEP não encontrado.',
    alertCepError: 'Erro ao buscar informações do CEP.',
    alertUpdateSuccess: 'Ponto de atendimento atualizado com sucesso!',
    alertCreateSuccess: 'Ponto de atendimento cadastrado com sucesso!',
    alertUpdateError: 'Não foi possível atualizar o local.',
    alertCreateError: 'Não foi possível salvar o local.',
    alertToggleConfirm: 'Deseja realmente desativar este local de atendimento?',
    alertToggleError: 'Erro ao alterar status do local.'
  },
  'en-US': {
    title: 'Service Locations',
    subtitle: 'Manage your physical studios and fixed locations',
    btnNew: 'New Studio',
    formTitleNew: 'Register New Business Location',
    formTitleEdit: 'Edit Business Location',
    labelName: 'Business Name *',
    placeholderName: 'E.g.: Studio Moema Premium',
    labelCep: 'ZIP Code *',
    labelStreet: 'Street Address',
    placeholderStreet: 'Filled via ZIP Code',
    labelNumber: 'Building Number *',
    placeholderNumber: 'No. 123',
    labelDistrict: 'Neighborhood',
    placeholderDistrict: 'Neighborhood',
    labelCityUf: 'City / State',
    placeholderCityUf: 'City - State',
    labelFee: 'Front Desk / Additional Fee ($)',
    labelMapsLink: 'Location Link (Google Maps URL)',
    labelImageUrl: 'Location Image URL (Facade/Interior)',
    placeholderImageUrl: 'https://images.com/studio-photo.jpg',
    btnCancel: 'Cancel',
    btnUpdate: 'Update Location',
    btnSave: 'Save Service Location',
    loadingList: 'Loading registered locations...',
    emptyTitle: 'No physical studio or fixed service location registered.',
    emptySubtitle: 'Register your first business address to show it in the schedule.',
    badgeActive: 'Active',
    btnMaps: 'View on Maps',
    feeLabel: 'Fixed front desk fee: $',
    cepShort: 'ZIP',
    alertRequired: 'Please fill in the required fields.',
    alertCepNotFound: 'ZIP Code not found.',
    alertCepError: 'Error fetching ZIP Code information.',
    alertUpdateSuccess: 'Location updated successfully!',
    alertCreateSuccess: 'Location registered successfully!',
    alertUpdateError: 'Could not update the location.',
    alertCreateError: 'Could not save the location.',
    alertToggleConfirm: 'Do you really want to deactivate this service location?',
    alertToggleError: 'Error changing location status.'
  },
  'es-ES': {
    title: 'Lugares de Atención',
    subtitle: 'Gestione sus estudios físicos y puntos fijos',
    btnNew: 'Nuevo Estudio',
    formTitleNew: 'Registrar Nuevo Punto Comercial',
    formTitleEdit: 'Editar Punto Comercial',
    labelName: 'Nombre del Establecimiento *',
    placeholderName: 'Ej: Studio Moema Premium',
    labelCep: 'Código Postal *',
    labelStreet: 'Calle / Avenida',
    placeholderStreet: 'Completado vía Código Postal',
    labelNumber: 'Número *',
    placeholderNumber: 'N.º 123',
    labelDistrict: 'Barrio',
    placeholderDistrict: 'Barrio',
    labelCityUf: 'Ciudad / Provincia',
    placeholderCityUf: 'Ciudad - Provincia',
    labelFee: 'Tarifa de Recepción / Adicional (€)',
    labelMapsLink: 'Enlace de Ubicación (Google Maps URL)',
    labelImageUrl: 'URL de la Imagen del Local (Fachada/Interior)',
    placeholderImageUrl: 'https://imagenes.com/foto-estudio.jpg',
    btnCancel: 'Cancelar',
    btnUpdate: 'Actualizar Local',
    btnSave: 'Guardar Punto de Atención',
    loadingList: 'Buscando locales registrados...',
    emptyTitle: 'Ningún estudio físico o punto de atención fijo registrado.',
    emptySubtitle: 'Registre su primera dirección comercial para mostrarla en la agenda.',
    badgeActive: 'Activo',
    btnMaps: 'Ver en Maps',
    feeLabel: 'Tarifa fija de recepción: €',
    cepShort: 'CP',
    alertRequired: 'Por favor, complete los campos obligatorios.',
    alertCepNotFound: 'Código Postal no encontrado.',
    alertCepError: 'Error al buscar información del Código Postal.',
    alertUpdateSuccess: '¡Punto de atención actualizado con éxito!',
    alertCreateSuccess: '¡Punto de atención registrado con éxito!',
    alertUpdateError: 'No fue posible actualizar el local.',
    alertCreateError: 'No fue posible guardar el local.',
    alertToggleConfirm: '¿Desea realmente desactivar este punto de atención?',
    alertToggleError: 'Error al cambiar el estado del local.'
  }
};

export function LocationsManagement({ onBack }) {
  const { systemLanguage } = useLanguage(); // 🌟 idioma atual, vem do Context global
  const t = localTranslations[systemLanguage] || localTranslations['pt-BR'];

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
        alert(t.alertCepNotFound);
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
      alert(t.alertCepError);
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
      alert(t.alertRequired);
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
        alert(t.alertUpdateSuccess);
      } else {
        await salvarLocal(localDTO);
        alert(t.alertCreateSuccess);
      }
      
      handleCancelarFormulario();
      carregarLocais();
    } catch (err) {
      console.error("Erro ao salvar local:", err);
      alert(editingId ? t.alertUpdateError : t.alertCreateError);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDesativar = async (id) => {
    if (confirm(t.alertToggleConfirm)) {
      try {
        await alternarStatusLocal(id, false);
        carregarLocais();
      } catch (err) {
        alert(t.alertToggleError);
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
            <h2 className="text-xl font-bold text-primary">{t.title}</h2>
            <p className="text-xs text-gray-500">{t.subtitle}</p>
          </div>
        </div>
        
        {!showForm && (
          <button
            onClick={() => { setEditingId(null); setShowForm(true); }}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:bg-primary/95 transition-all"
          >
            <Plus size={16} /> {t.btnNew}
          </button>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6">
        {showForm ? (
          <form onSubmit={handleSalvar} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">
              {editingId ? t.formTitleEdit : t.formTitleNew}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">{t.labelName}</label>
                <input
                  type="text"
                  required
                  placeholder={t.placeholderName}
                  value={formData.nomeLocal}
                  onChange={e => setFormData({...formData, nomeLocal: e.target.value})}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">{t.labelCep}</label>
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
                  <label className="block text-xs font-semibold text-gray-700 mb-1">{t.labelStreet}</label>
                  <input
                    type="text"
                    placeholder={t.placeholderStreet}
                    value={formData.logradouro}
                    onChange={e => setFormData({...formData, logradouro: e.target.value})}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-gray-50 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">{t.labelNumber}</label>
                  <input
                    type="text"
                    required
                    placeholder={t.placeholderNumber}
                    value={formData.numero}
                    onChange={e => setFormData({...formData, numero: e.target.value})}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Layout dividido dinamicamente para Bairro e Cidade/Localidade */}
              <div className="grid grid-cols-2 gap-3 md:col-span-1">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">{t.labelDistrict}</label>
                  <input
                    type="text"
                    placeholder={t.placeholderDistrict}
                    value={formData.bairro}
                    onChange={e => setFormData({...formData, bairro: e.target.value})}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-gray-50 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">{t.labelCityUf}</label>
                  <input
                    type="text"
                    readOnly
                    placeholder={t.placeholderCityUf}
                    value={formData.localidade ? `${formData.localidade} - ${formData.uf}` : ''}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">{t.labelFee}</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={formData.taxaAdicional}
                  onChange={e => setFormData({...formData, taxaAdicional: e.target.value})}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">{t.labelMapsLink}</label>
                <input
                  type="url"
                  placeholder="https://maps.google.com/..."
                  value={formData.linkGoogleMaps}
                  onChange={e => setFormData({...formData, linkGoogleMaps: e.target.value})}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">{t.labelImageUrl}</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder={t.placeholderImageUrl}
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
                {t.btnCancel}
              </button>
              <button
                type="submit"
                disabled={submitLoading}
                className="flex-1 py-3 bg-accent text-white rounded-xl text-sm font-medium hover:shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitLoading && <Loader2 size={16} className="animate-spin" />}
                {editingId ? t.btnUpdate : t.btnSave}
              </button>
            </div>
          </form>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="animate-spin text-primary" size={32} />
            <p className="text-sm text-gray-500">{t.loadingList}</p>
          </div>
        ) : locais.length === 0 ? (
          <div className="bg-white border border-dashed rounded-2xl p-10 text-center text-gray-400">
            <MapPin size={40} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-medium">{t.emptyTitle}</p>
            <p className="text-xs mt-1">{t.emptySubtitle}</p>
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
                        <Check size={10} /> {t.badgeActive}
                      </span>
                    </div>

                    <div className="p-5 space-y-2">
                      <h4 className="font-bold text-gray-800 text-base">{local.nomeLocal}</h4>
                      
                      <div className="space-y-1 text-xs text-gray-600">
                        <p className="font-medium text-gray-800">{end.logradouro}, Nº {end.numero}</p>
                        {/* Exibição formatada com Bairro, Cidade e Estado de maneira limpa */}
                        <p>{end.bairro}{end.localidade ? ` — ${end.localidade} / ${end.uf}` : ''} — {t.cepShort}: {end.cep}</p>
                        {local.taxaAdicional > 0 && (
                          <p className="text-primary font-semibold mt-1">{t.feeLabel} {local.taxaAdicional.toFixed(2)}</p>
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
                        {t.btnMaps}
                      </a>
                    )}
                    
                    <button
                      onClick={() => handleIniciarEdicao(local)}
                      className="px-3 py-2 border border-gray-300 text-gray-600 bg-white rounded-xl hover:bg-gray-50 transition-colors"
                      title={t.formTitleEdit}
                    >
                      <Edit2 size={15} />
                    </button>

                    <button
                      onClick={() => handleDesativar(local.idLocal)}
                      className="px-3 py-2 border border-red-200 text-red-600 bg-white rounded-xl hover:bg-red-50 transition-colors"
                      title={t.btnCancel}
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