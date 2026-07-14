import { useState, useEffect } from 'react';
import Masonry from 'react-responsive-masonry';
import { Plus, X, Pin, Trash2, Calendar, FileText, Check, Loader2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext'; // 🌟 Importando o hook de idioma
import { listarNotas, criarNota, atualizarNota, toggleFixarNota, excluirNota } from '../../api/notes';

const localTranslations = {
  'pt-BR': {
    title: 'Bloco de Notas',
    subtitle: 'Lembretes operacionais e registros rápidos',
    btnNewNote: 'Nova Nota',
    emptyTitle: 'Seu workspace está limpo',
    emptySub: 'Use notas para registrar preferências de unhas das clientes, controle de marcas ou tarefas rápidas.',
    emptyAction: 'Criar primeira nota',
    pinnedLabel: 'Fixadas no Topo',
    recentLabel: 'Notas Recentes',
    formEditing: 'Editando Nota',
    formNew: 'Nova Nota do Workspace',
    placeholderTitle: 'Título sem nome',
    highlightBg: 'Fundo de Destaque:',
    placeholderContent: 'Escreva livremente ou liste tarefas aqui...',
    btnDiscard: 'Descartar',
    btnSave: 'Salvar Alterações',
    loadingText: 'Carregando bloco de notas...',
    alertTitle: 'O título da nota é obrigatório.',
    confirmDelete: 'Deseja excluir permanentemente esta nota?',
    colors: { default: 'Padrão', gray: 'Cinza', pinkSoft: 'Rosa Soft', pastel: 'Pastel', yellow: 'Amarelo', blue: 'Azul' }
  },
  'en-US': {
    title: 'Notes Workspace',
    subtitle: 'Operational reminders and quick records',
    btnNewNote: 'New Note',
    emptyTitle: 'Your workspace is clear',
    emptySub: 'Use notes to track customer preferences, brand logs, or quick todo lists.',
    emptyAction: 'Create first note',
    pinnedLabel: 'Pinned to Top',
    recentLabel: 'Recent Notes',
    formEditing: 'Editing Note',
    formNew: 'New Workspace Note',
    placeholderTitle: 'Untitled Note',
    highlightBg: 'Highlight Background:',
    placeholderContent: 'Write freely or list tasks here...',
    btnDiscard: 'Discard',
    btnSave: 'Save Changes',
    loadingText: 'Loading notepad...',
    alertTitle: 'Note title is required.',
    confirmDelete: 'Do you want to permanently delete this note?',
    colors: { default: 'Default', gray: 'Gray', pinkSoft: 'Soft Pink', pastel: 'Pastel', yellow: 'Yellow', blue: 'Blue' }
  },
  'es-ES': {
    title: 'Bloc de Notas',
    subtitle: 'Recordatorios operativos y registros rápidos',
    btnNewNote: 'Nueva Nota',
    emptyTitle: 'Tu espacio de trabajo está limpio',
    emptySub: 'Usa notas para registrar preferencias de clientes, marcas o tareas rápidas.',
    emptyAction: 'Crear primera nota',
    pinnedLabel: 'Fijadas en lo Alto',
    recentLabel: 'Notas Recientes',
    formEditing: 'Editando Nota',
    formNew: 'Nueva Nota de Workspace',
    placeholderTitle: 'Nota sin título',
    highlightBg: 'Fondo de Destacado:',
    placeholderContent: 'Escribe libremente o enumera tareas aquí...',
    btnDiscard: 'Descartar',
    btnSave: 'Guardar Cambios',
    loadingText: 'Cargando bloc de notas...',
    alertTitle: 'El título de la nota es obligatorio.',
    confirmDelete: '¿Desea eliminar permanentemente esta nota?',
    colors: { default: 'Predeterminado', gray: 'Gris', pinkSoft: 'Rosa Suave', pastel: 'Pastel', yellow: 'Amarillo', blue: 'Azul' }
  }
};

export function NotesScreen() {
  const { systemLanguage } = useLanguage(); // 🌟 Hook global de idioma
  const text = localTranslations[systemLanguage] || localTranslations['pt-BR'];

  const NOTION_COLORS = [
    { name: text.colors.default, hex: '#FFFFFF', bgClass: 'bg-white border-gray-200' },
    { name: text.colors.gray, hex: '#F3F4F6', bgClass: 'bg-gray-50 border-gray-200' },
    { name: text.colors.pinkSoft, hex: '#FCD3DE', bgClass: 'bg-[#FCD3DE]/40 border-pink-200' },
    { name: text.colors.pastel, hex: '#F7A4BA', bgClass: 'bg-[#F7A4BA]/30 border-pink-300' },
    { name: text.colors.yellow, hex: '#FEF08A', bgClass: 'bg-yellow-50/60 border-yellow-200' },
    { name: text.colors.blue, hex: '#DBEAFE', bgClass: 'bg-blue-50/60 border-blue-200' },
  ];

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedHex, setSelectedHex] = useState('#FFFFFF');

  const carregarNotas = async () => {
    try {
      setLoading(true);
      const dados = await listarNotas();
      setNotes(dados);
    } catch (error) {
      console.error('Erro ao buscar notas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarNotas();
  }, []);

  const handleNewNoteClick = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setSelectedHex('#FFFFFF');
    setShowForm(true);
  };

  const handleEditClick = (note) => {
    setEditingId(note.idNota);
    setTitle(note.titulo);
    setContent(note.conteudo);
    setSelectedHex(note.corHex || '#FFFFFF');
    setShowForm(true);
  };

  const handleSaveNote = async () => {
    if (!title.trim()) {
      alert(text.alertTitle);
      return;
    }

    const payload = {
      titulo: title,
      conteudo: content,
      corHex: selectedHex,
    };

    try {
      if (editingId) {
        await atualizarNota(editingId, payload);
      } else {
        await criarNota(payload);
      }
      setShowForm(false);
      carregarNotas();
    } catch (error) {
      console.error('Erro ao salvar nota:', error);
    }
  };

  const handleToggleFixar = async (id, e) => {
    e.stopPropagation();
    try {
      await toggleFixarNota(id);
      carregarNotas();
    } catch (error) {
      console.error('Erro ao alternar fixação:', error);
    }
  };

  const handleExcluir = async (id, e) => {
    e.stopPropagation();
    if (window.confirm(text.confirmDelete)) {
      try {
        await excluirNota(id);
        carregarNotas();
      } catch (error) {
        console.error('Erro ao excluir nota:', error);
      }
    }
  };

  const getBgClassByHex = (hex) => {
    const matched = NOTION_COLORS.find(c => c.hex.toLowerCase() === hex?.toLowerCase());
    return matched ? matched.bgClass : 'bg-white border-gray-200';
  };

  if (loading && notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2 className="animate-spin text-primary mb-2" size={36} />
        <p className="text-gray-500 font-medium text-sm">{text.loadingText}</p>
      </div>
    );
  }

  const pinnedNotes = notes.filter(n => n.isFixada);
  const regularNotes = notes.filter(n => !n.isFixada);

  return (
    <div className="pb-24 lg:pb-8 px-5 lg:px-8 pt-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-gray-900 font-bold flex items-center gap-2">
            <FileText className="text-primary" size={24} /> {text.title}
          </h2>
          <p className="text-gray-500 text-sm mt-0.5">{text.subtitle}</p>
        </div>
        <button
          onClick={handleNewNoteClick}
          className="bg-primary hover:bg-primary/90 text-white font-medium text-sm px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
        >
          <Plus size={18} /> {text.btnNewNote}
        </button>
      </div>

      {/* Espaço Vazio */}
      {notes.length === 0 && !showForm && (
        <div className="text-center py-20 bg-white border border-dashed border-gray-200 rounded-2xl max-w-xl mx-auto">
          <FileText className="text-gray-300 mx-auto mb-3" size={48} />
          <p className="text-gray-600 font-medium">{text.emptyTitle}</p>
          <p className="text-gray-400 text-xs mt-1 max-w-xs mx-auto">{text.emptySub}</p>
          <button onClick={handleNewNoteClick} className="mt-4 text-xs font-semibold text-primary hover:underline">{text.emptyAction}</button>
        </div>
      )}

      {/* NOTAS FIXADAS */}
      {pinnedNotes.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-1 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            <Pin size={12} className="rotate-45" /> {text.pinnedLabel}
          </div>
          <Masonry columnsCount={window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1} gutter="16px">
            {pinnedNotes.map((note) => (
              <div
                key={note.idNota}
                onClick={() => handleEditClick(note)}
                className={`p-5 rounded-2xl border transition-all hover:shadow-md cursor-pointer group relative ${getBgClassByHex(note.corHex)}`}
              >
                <div className="flex justify-between items-start mb-2 gap-4">
                  <h4 className="text-gray-800 font-semibold text-base line-clamp-2 leading-snug">{note.titulo}</h4>
                  <div className="flex items-center gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleToggleFixar(note.idNota, e)}
                      className="p-1 hover:bg-black/5 rounded text-primary"
                    >
                      <Pin size={14} className="fill-current" />
                    </button>
                    <button
                      onClick={(e) => handleExcluir(note.idNota, e)}
                      className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 text-sm whitespace-pre-line leading-relaxed line-clamp-6">{note.conteudo}</p>
                <div className="mt-4 flex items-center gap-1 text-gray-400 text-[11px]">
                  <Calendar size={12} />
                  <span>{new Date(note.dataCriacao).toLocaleDateString(systemLanguage)}</span>
                </div>
              </div>
            ))}
          </Masonry>
        </div>
      )}

      {/* NOTAS RECENTES */}
      {regularNotes.length > 0 && (
        <div>
          {pinnedNotes.length > 0 && (
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 border-t border-gray-100 pt-6">
              {text.recentLabel}
            </div>
          )}
          <Masonry columnsCount={window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1} gutter="16px">
            {regularNotes.map((note) => (
              <div
                key={note.idNota}
                onClick={() => handleEditClick(note)}
                className={`p-5 rounded-2xl border transition-all hover:shadow-md cursor-pointer group relative ${getBgClassByHex(note.corHex)}`}
              >
                <div className="flex justify-between items-start mb-2 gap-4">
                  <h4 className="text-gray-800 font-semibold text-base line-clamp-2 leading-snug">{note.titulo}</h4>
                  <div className="flex items-center gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleToggleFixar(note.idNota, e)}
                      className="p-1 hover:bg-black/5 rounded text-gray-400 hover:text-gray-600"
                    >
                      <Pin size={14} className="rotate-45" />
                    </button>
                    <button
                      onClick={(e) => handleExcluir(note.idNota, e)}
                      className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 text-sm whitespace-pre-line leading-relaxed line-clamp-6">{note.conteudo}</p>
                <div className="mt-4 flex items-center gap-1 text-gray-400 text-[11px]">
                  <Calendar size={12} />
                  <span>{new Date(note.dataCriacao).toLocaleDateString(systemLanguage)}</span>
                </div>
              </div>
            ))}
          </Masonry>
        </div>
      )}

      {/* MODAL EDIT / FORM */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-xl h-full shadow-2xl flex flex-col transform transition-all animate-slide-left p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                <FileText size={14} /> {editingId ? text.formEditing : text.formNew}
              </span>
              <button
                onClick={() => setShowForm(false)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pr-1">
              <div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={text.placeholderTitle}
                  className="w-full text-2xl font-bold border-none outline-none text-gray-800 dark:text-white placeholder-gray-300 bg-transparent"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide">{text.highlightBg}</label>
                <div className="flex flex-wrap gap-2">
                  {NOTION_COLORS.map((color) => (
                    <button
                      key={color.hex}
                      onClick={() => setSelectedHex(color.hex)}
                      className={`h-7 px-3 text-xs rounded-lg border transition-all flex items-center gap-1 ${color.bgClass} ${selectedHex.toLowerCase() === color.hex.toLowerCase()
                          ? 'ring-2 ring-primary border-transparent font-medium'
                          : 'opacity-80 hover:opacity-100'
                        }`}
                    >
                      {selectedHex.toLowerCase() === color.hex.toLowerCase() && <Check size={10} className="text-primary" />}
                      {color.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-gray-50 dark:border-zinc-800">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={text.placeholderContent}
                  rows={12}
                  className="w-full border-none outline-none text-gray-700 dark:text-zinc-300 text-sm whitespace-pre-line leading-relaxed resize-none bg-transparent placeholder-gray-400"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6 border-t border-gray-100 dark:border-zinc-800 pt-4 pb-20 md:pb-2">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 text-sm font-medium rounded-xl transition-colors"
              >
                {text.btnDiscard}
              </button>
              <button
                onClick={handleSaveNote}
                className="flex-1 py-3 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-xl hover:shadow-md transition-all flex items-center justify-center gap-2"
              >
                {text.btnSave}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}