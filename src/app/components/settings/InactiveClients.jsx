import { useState, useEffect } from 'react';
import { ArrowLeft, Users, UserCheck, Trash2, Search } from 'lucide-react';
// Importando o SweetAlert2
import Swal from 'sweetalert2';
// Importando as funções reais da API
import { listarClientesInativos, ativarCliente } from "../../../api"; // Ajuste o caminho relativo se necessário
// 🌟 Importando o hook de idioma do seu contexto global
import { useLanguage } from '../../../context/LanguageContext';

// 🌍 Dicionário de Traduções Locais
const localTranslations = {
  'pt-BR': {
    title: 'Clientes Desativados',
    subtitle: 'Gerencie e reative cadastros arquivados',
    placeholder: 'Buscar por nome ou telefone...',
    loading: 'Carregando clientes inativos...',
    errorMsg: 'Não foi possível carregar a lista de inativos.',
    tryAgain: 'Tentar novamente',
    noPhone: 'Sem telefone',
    btnReactivate: 'Reativar',
    btnDeleteTitle: 'Excluir permanentemente',
    emptyTitle: 'Nenhum cliente desativado encontrado',
    emptySearchDesc: 'Tente buscar por outro termo de nome ou telefone.',
    emptyDesc: 'Quando você desativar clientes na tela principal, eles aparecerão aqui.',
    tipTitle: 'Dica:',
    tipContent: 'Clientes desativados não aparecem nas listagens de agendamento do MVP e não recebem notificações automáticas até serem reativados.',
    swal: {
      reactivateTitle: 'Deseja reativar?',
      reactivateText: 'Tem certeza que deseja reativar o cadastro de {nome}?',
      confirmReactivate: 'Sim, reativar!',
      cancel: 'Cancelar',
      successTitle: 'Reativada com Sucesso!',
      successText: 'A cliente {nome} está ativa no sistema novamente.',
      errorTitle: 'Erro!',
      errorText: 'Não foi possível reativar a cliente no momento. Tente novamente.',
      deleteTitle: 'Atenção!',
      deleteText: 'Tem certeza de que deseja apagar permanentemente os registros de {nome}? Esta ação não pode ser desfeita.',
      confirmDelete: 'Sim, apagar de vez!',
      cancelDelete: 'Manter arquivado',
      deletedTitle: 'Excluído!',
      deletedText: 'O registro foi removido com sucesso.'
    }
  },
  'en-US': {
    title: 'Archived Customers',
    subtitle: 'Manage and reactivate archived records',
    placeholder: 'Search by name or phone...',
    loading: 'Loading archived customers...',
    errorMsg: 'Could not load the archived list.',
    tryAgain: 'Try again',
    noPhone: 'No phone number',
    btnReactivate: 'Reactivate',
    btnDeleteTitle: 'Delete permanently',
    emptyTitle: 'No archived customers found',
    emptySearchDesc: 'Try searching for another name or phone term.',
    emptyDesc: 'When you deactivate clients on the main screen, they will appear here.',
    tipTitle: 'Tip:',
    tipContent: 'Archived clients do not appear in MVP booking lists and do not receive automatic notifications until they are reactivated.',
    swal: {
      reactivateTitle: 'Do you want to reactivate?',
      reactivateText: 'Are you sure you want to reactivate {nome}\'s profile?',
      confirmReactivate: 'Yes, reactivate!',
      cancel: 'Cancel',
      successTitle: 'Reactivated Successfully!',
      successText: 'The client {nome} is active in the system again.',
      errorTitle: 'Error!',
      errorText: 'Could not reactivate the client at this moment. Please try again.',
      deleteTitle: 'Attention!',
      deleteText: 'Are you sure you want to permanently delete {nome}\'s records? This action cannot be undone.',
      confirmDelete: 'Yes, delete permanently!',
      cancelDelete: 'Keep archived',
      deletedTitle: 'Deleted!',
      deletedText: 'The record was successfully removed.'
    }
  },
  'es-ES': {
    title: 'Clientes Inactivos',
    subtitle: 'Gestione y reactive registros archivados',
    placeholder: 'Buscar por nombre o teléfono...',
    loading: 'Cargando clientes inactivos...',
    errorMsg: 'No se pudo cargar la lista de inactivos.',
    tryAgain: 'Intentar de nuevo',
    noPhone: 'Sin teléfono',
    btnReactivate: 'Reactivar',
    btnDeleteTitle: 'Eliminar permanentemente',
    emptyTitle: 'No se encontraron clientes inactivos',
    emptySearchDesc: 'Intente buscar otro término de nombre o teléfono.',
    emptyDesc: 'Cuando desactive clientes en la pantalla principal, aparecerán aquí.',
    tipTitle: 'Consejo:',
    tipContent: 'Los clientes desactivados no aparecen en las listas de reservas de MVP y no reciben notificaciones automáticas hasta que se reactiven.',
    swal: {
      reactivateTitle: '¿Desea reactivar?',
      reactivateText: '¿Está seguro de que desea reactivar el registro de {nome}?',
      confirmReactivate: '¡Sí, reactivar!',
      cancel: 'Cancelar',
      successTitle: '¡Reactivado con Éxito!',
      successText: 'El cliente {nome} está activo de nuevo en el sistema.',
      errorTitle: '¡Error!',
      errorText: 'No se pudo reactivar el cliente en este momento. Inténtelo de nuevo.',
      deleteTitle: '¡Atención!',
      deleteText: '¿Está seguro de que desea eliminar permanentemente los registros de {nome}? Esta acción no se puede deshacer.',
      confirmDelete: '¡Sí, eliminar para siempre!',
      cancelDelete: 'Mantener archivado',
      deletedTitle: '¡Eliminado!',
      deletedText: 'El registro fue eliminado correctamente.'
    }
  }
};

export function InactiveClients({ onBack }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🌟 Capturando o idioma ativo do contexto
  const { systemLanguage } = useLanguage();
  const text = localTranslations[systemLanguage] || localTranslations['pt-BR'];

  // 🔄 Carregar clientes inativos ao montar a tela
  useEffect(() => {
    carregarInativos();
  }, []);

  const carregarInativos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listarClientesInativos();
      setClients(data || []);
    } catch (err) {
      console.error('Erro ao buscar clientes inativos:', err);
      setError(text.errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // 🚀 Integrado: Reativar o cliente usando a API, exibir SweetAlert e voltar para a página de clientes
  const handleReactivate = async (id) => {
    // Encontra o objeto do cliente na lista para pegar o nome correto
    const clienteAlvo = clients.find(c => c.idCliente === id);
    const nomeCliente = clienteAlvo ? clienteAlvo.nome : 'Cliente';

    // SweetAlert de confirmação antes de agir
    const resultado = await Swal.fire({
      title: text.swal.reactivateTitle,
      text: text.swal.reactivateText.replace('{nome}', nomeCliente),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#7C3AED', // Roxo moderno do seu tema
      cancelButtonColor: '#6B7280',
      confirmButtonText: text.swal.confirmReactivate,
      cancelButtonText: text.swal.cancel
    });

    if (resultado.isConfirmed) {
      try {
        await ativarCliente(id);
        
        // SweetAlert de Sucesso informando que a cliente foi reativada
        await Swal.fire({
          title: text.swal.successTitle,
          text: text.swal.successText.replace('{nome}', nomeCliente),
          icon: 'success',
          confirmButtonColor: '#7C3AED',
          timer: 2000, // Fecha automaticamente após 2 segundos
          timerProgressBar: true
        });

        // 🔄 REDIRECIONAMENTO: Aciona a navegação de volta para a tela de clientes ativos
        onBack();
        
      } catch (err) {
        // Alerta em caso de falha
        Swal.fire({
          title: text.swal.errorTitle,
          text: text.swal.errorText,
          icon: 'error',
          confirmButtonColor: '#7C3AED'
        });
      }
    }
  };

  // 🗑️ Exclusão física
  const handleDelete = async (id) => {
    const clienteAlvo = clients.find(c => c.idCliente === id);
    const nomeCliente = clienteAlvo ? clienteAlvo.nome : 'este cliente';

    const resultado = await Swal.fire({
      title: text.swal.deleteTitle,
      text: text.swal.deleteText.replace('{nome}', nomeCliente),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444', 
      cancelButtonColor: '#6B7280',
      confirmButtonText: text.swal.confirmDelete,
      cancelButtonText: text.swal.cancelDelete
    });

    if (resultado.isConfirmed) {
      setClients((prev) => prev.filter((client) => client.idCliente !== id));
      
      Swal.fire({
        title: text.swal.deletedTitle,
        text: text.swal.deletedText,
        icon: 'success',
        confirmButtonColor: '#7C3AED'
      });
    }
  };

  // 🔍 Filtro em tempo de execução na lista retornada do banco
  const filteredClients = clients.filter((client) => {
    const term = searchQuery.toLowerCase();
    const nome = client.nome || '';
    const telefone = client.whatsapp || '';

    return (
      nome.toLowerCase().includes(term) ||
      telefone.includes(term)
    );
  });

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100 shrink-0">
        <button
          onClick={onBack}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h3 className="font-bold text-gray-800 text-base">{text.title}</h3>
          <p className="text-xs text-gray-500">{text.subtitle}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-3 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={text.placeholder}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-4">

        {/* Estado de Carregamento (Loading) */}
        {loading && (
          <div className="text-center py-12 text-gray-500 text-sm">
            {text.loading}
          </div>
        )}

        {/* Estado de Erro */}
        {error && !loading && (
          <div className="text-center py-12 text-red-500 text-sm bg-red-50 rounded-xl border border-red-100 p-4">
            {error}
            <button
              onClick={carregarInativos}
              className="block mx-auto mt-2 text-xs underline font-semibold text-red-700"
            >
              {text.tryAgain}
            </button>
          </div>
        )}

        {/* Listagem dos Clientes */}
        {!loading && !error && filteredClients.map((client) => (
          <div
            key={client.idCliente}
            className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 flex items-center justify-between gap-3 hover:border-gray-200 transition-colors"
          >
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-gray-800 text-sm truncate">
                {client.nome}
              </h4>
              <p className="text-xs text-gray-500 truncate mt-0.5">
                {client.whatsapp || text.noPhone}
              </p>
            </div>

            {/* Ações */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => handleReactivate(client.idCliente)}
                className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 font-medium"
              >
                <UserCheck size={15} />
                <span className="text-xs">{text.btnReactivate}</span>
              </button>
              <button
                onClick={() => handleDelete(client.idCliente)}
                className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                title={text.btnDeleteTitle}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        {/* Estado Vazio (Nenhum registro) */}
        {!loading && !error && filteredClients.length === 0 && (
          <div className="text-center py-12 px-5">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="text-gray-400" size={32} />
            </div>
            <p className="text-gray-500 mb-2 font-medium">{text.emptyTitle}</p>
            <p className="text-gray-400 text-xs max-w-[250px] mx-auto">
              {searchQuery
                ? text.emptySearchDesc
                : text.emptyDesc}
            </p>
          </div>
        )}
      </div>

      {/* Info Card Fixo */}
      {!loading && (
        <div className="px-4 pb-4 shrink-0">
          <div className="bg-purple-50/70 rounded-xl p-3 border border-purple-100/60">
            <p className="text-purple-700 text-xs leading-relaxed">
              💡 <strong>{text.tipTitle}</strong> {text.tipContent}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}