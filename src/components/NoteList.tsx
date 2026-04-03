import { Note } from '@/types/note';
import { NoteCard } from './NoteCard';

interface NoteListProps {
  notes: Note[];
  searchTerm: string;
  onNoteClick?: (note: Note) => void;
  onNoteDelete?: (noteId: string) => void;
}

export function NoteList({ notes, searchTerm, onNoteClick, onNoteDelete }: NoteListProps) {
  // Filter notes based on search term
  const filteredNotes = notes.filter((note) => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const titleMatch = note.title.toLowerCase().includes(searchLower);
    const bodyMatch = note.body.toLowerCase().includes(searchLower);
    
    return titleMatch || bodyMatch;
  });

  // Handle empty state
  const isEmpty = notes.length === 0;
  const isSearchEmpty = !isEmpty && filteredNotes.length === 0;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      {/* Empty state - no notes */}
      {isEmpty && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No notes yet
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto text-sm">
            Create your first note to get started. Click the "+ New Note" button to begin.
          </p>
        </div>
      )}

      {/* Empty state - no search results */}
      {isSearchEmpty && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No notes found
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto text-sm">
            Try adjusting your search terms or create a new note.
          </p>
        </div>
      )}

      {/* Notes grid */}
      {filteredNotes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onDelete={onNoteDelete}
              onClick={onNoteClick}
            />
          ))}
        </div>
      )}

      {/* Results count */}
      {filteredNotes.length > 0 && (
        <div className="mt-6 text-sm text-gray-500 dark:text-gray-400 text-center">
          {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
          {searchTerm && ` found`}
        </div>
      )}
    </div>
  );
}
