import { useState, useCallback } from 'react';
import { useNotes } from '@/hooks/useNotes';
import { Header } from '@/components/Header';
import { SearchBar } from '@/components/SearchBar';
import { NoteList } from '@/components/NoteList';
import { NoteEditor } from '@/components/NoteEditor';
import type { NoteId } from '@/types/note';

export default function HomePage() {
  const { notes, searchTerm, setSearchTerm, createNote } = useNotes();
  const [selectedNoteId, setSelectedNoteId] = useState<NoteId | null>(null);

  const handleNewNote = useCallback(() => {
    const newNote = createNote({
      title: '',
      body: '',
    });
    setSelectedNoteId(newNote.id);
  }, [createNote]);

  const handleNoteClick = useCallback((noteId: NoteId) => {
    setSelectedNoteId(noteId);
  }, []);

  const handleEditorClose = useCallback(() => {
    setSelectedNoteId(null);
  }, []);

  const handleEditorSave = useCallback(() => {
    // Editor handles its own save via useNotes hook
    // We can optionally close after save or keep it open
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onNewNote={handleNewNote} />
      
      <main className="container mx-auto px-4 py-6">
        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder="Search notes..."
          />
        </div>

        {/* Two-column layout on desktop, stacked on mobile */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Note List Column */}
          <div className="lg:w-1/3">
            <NoteList
              notes={notes}
              searchTerm={searchTerm}
              onNoteClick={handleNoteClick}
              onNoteDelete={(deletedId) => {
                if (selectedNoteId === deletedId) {
                  setSelectedNoteId(null);
                }
              }}
            />
          </div>

          {/* Note Editor Column */}
          <div className="lg:w-2/3">
            {selectedNoteId ? (
              <NoteEditor
                noteId={selectedNoteId}
                onClose={handleEditorClose}
                onSave={handleEditorSave}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a note to view
                </h3>
                <p className="text-gray-500 mb-4">
                  Choose a note from the list or create a new one
                </p>
                <button
                  onClick={handleNewNote}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <span className="text-lg">+</span>
                  <span>Create New Note</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
