import { useNotes } from '@/hooks/useNotes';

interface HeaderProps {
  onNewNote?: () => void;
}

export function Header({ onNewNote }: HeaderProps) {
  const { createNote } = useNotes();

  const handleNewNote = () => {
    if (onNewNote) {
      onNewNote();
    } else {
      // Create a new empty note
      const newNote = createNote({
        title: '',
        body: '',
      });
      // Trigger the callback if provided
      if (onNewNote) {
        onNewNote(newNote.id);
      }
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notes</h1>
          <p className="text-sm text-gray-500">Your personal notes app</p>
        </div>
        <button
          onClick={handleNewNote}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <span className="text-lg">+</span>
          <span>New Note</span>
        </button>
      </div>
    </header>
  );
}
