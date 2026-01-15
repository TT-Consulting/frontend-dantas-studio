import { useState } from 'react';
import Masonry from 'react-responsive-masonry';
import { Plus, X } from 'lucide-react';

export function NotesScreen() {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const notes = [
    {
      id: '1',
      title: 'Summer Collection Ideas',
      content: 'Coral shades, pastel yellows, beach-inspired designs with seashells and waves.',
      color: 'bg-purple-100',
    },
    {
      id: '2',
      title: 'Client Preferences',
      content: 'Maria: loves French tips\nAna: prefers short nails\nJulia: always wants nail art',
      color: 'bg-pink-100',
    },
    {
      id: '3',
      title: 'Inventory Check',
      content: 'Need to reorder: UV gel top coat, nail files, cuticle oil, purple glitter polish',
      color: 'bg-yellow-100',
    },
    {
      id: '4',
      title: 'Marketing Ideas',
      content: 'Instagram reels showing nail art process. Before/after photos. Client testimonials.',
      color: 'bg-blue-100',
    },
    {
      id: '5',
      title: 'New Techniques to Learn',
      content: 'Ombre nails, chrome powder application, 3D nail art with acrylic',
      color: 'bg-green-100',
    },
    {
      id: '6',
      title: 'Holiday Promotion',
      content: 'December special: 20% off gel manicure + free nail art for first-time clients',
      color: 'bg-pink-100',
    },
    {
      id: '7',
      title: 'Equipment Maintenance',
      content: 'UV lamp - clean weekly. Sterilize tools after each client. Replace drill bits monthly.',
      color: 'bg-purple-100',
    },
    {
      id: '8',
      title: 'Goals for 2025',
      content: 'Increase client base by 30%. Launch online booking. Attend nail art masterclass in São Paulo.',
      color: 'bg-yellow-100',
    },
  ];

  const handleAddNote = () => {
    // Handle form submission
    setShowForm(false);
    setTitle('');
    setContent('');
  };

  return (
    <div className="pb-24 lg:pb-8 px-5 lg:px-8 pt-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-primary">Notas de Produtividade</h2>
            <p className="text-gray-600 text-sm">Suas ideias e lembretes</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Plus size={18} />
            <span className="hidden lg:inline">Nova Nota</span>
          </button>
        </div>
      </div>

      {/* Add Note Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-5">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-primary">New Note</h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 mb-2 block">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter note title"
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-2 block">Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your note..."
                  rows={5}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNote}
                className="flex-1 py-3 bg-accent text-white rounded-xl hover:shadow-lg transition-shadow"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Masonry Grid of Notes */}
      <Masonry columnsCount={window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1} gutter="12px">
        {notes.map((note) => (
          <div
            key={note.id}
            className={`${note.color} rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer`}
          >
            <h4 className="text-gray-800 mb-2">{note.title}</h4>
            <p className="text-gray-700 text-sm whitespace-pre-line leading-relaxed">
              {note.content}
            </p>
          </div>
        ))}
      </Masonry>
    </div>
  );
}
