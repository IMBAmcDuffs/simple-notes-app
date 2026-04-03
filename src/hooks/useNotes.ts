import { useState, useEffect, useCallback } from 'react';
import type { Note, NoteCreateInput, NoteUpdateInput, NoteId } from '@/types/note';
import { NOTES_STORAGE_KEY } from '@/types/note';

interface UseNotesReturn {
  notes: Note[];
  filteredNotes: Note[];
  selectedNote: Note | null;
  searchQuery: string;
  
  // CRUD operations
  createNote: (input: NoteCreateInput) => Note;
  updateNote: (id: NoteId, input: NoteUpdateInput) => Note | null;
  deleteNote: (id: NoteId) => boolean;
  getNote: (id: NoteId) => Note | null;
  
  // Selection
  selectNote: (id: NoteId | null) => void;
  
  // Search
  setSearchQuery: (query: string) => void;
  
  // Utility
  clearAllNotes: () => void;
}

const STORAGE_KEY = NOTES_STORAGE_KEY;

/**
 * Validates that data is a valid Note object
 */
function isNote(obj: unknown): obj is Note {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    typeof (obj as Note).id === 'string' &&
    'title' in obj &&
    typeof (obj as Note).title === 'string' &&
    'body' in obj &&
    typeof (obj as Note).body === 'string' &&
    'createdAt' in obj &&
    typeof (obj as Note).createdAt === 'string' &&
    'updatedAt' in obj &&
    typeof (obj as Note).updatedAt === 'string'
  );
}

/**
 * Validates that data is a valid array of Notes
 */
function isNotesArray(data: unknown): data is Note[] {
  return (
    Array.isArray(data) &&
    data.every(item => isNote(item))
  );
}

/**
 * Loads notes from localStorage
 */
function loadNotesFromStorage(): Note[] {
  if (typeof window === 'undefined') {
    return [];
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }
    
    const parsed = JSON.parse(stored) as unknown;
    
    if (isNotesArray(parsed)) {
      return parsed;
    }
    
    console.warn('Invalid notes data in localStorage, returning empty array');
    return [];
  } catch (error) {
    console.error('Failed to load notes from localStorage:', error);
    return [];
  }
}

/**
 * Saves notes to localStorage
 */
function saveNotesToStorage(notes: Note[]): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error('Failed to save notes to localStorage:', error);
  }
}

/**
 * Generates a unique ID using crypto.randomUUID when available
 */
function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return `note_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Custom hook for notes management with localStorage persistence
 */
export function useNotes(): UseNotesReturn {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<NoteId | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Load notes from localStorage on mount
  useEffect(() => {
    const loadedNotes = loadNotesFromStorage();
    setNotes(loadedNotes);
  }, []);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    if (notes.length > 0) {
      saveNotesToStorage(notes);
    }
  }, [notes]);

  // Create a new note
  const createNote = useCallback<UseNotesReturn['createNote']>(
    (input: NoteCreateInput) => {
      const now = new Date().toISOString();
      const newNote: Note = {
        id: generateId(),
        title: input.title.trim() || 'Untitled',
        body: input.body.trim(),
        createdAt: now,
        updatedAt: now,
      };
      
      setNotes(prevNotes => [newNote, ...prevNotes]);
      return newNote;
    },
    []
  );

  // Update an existing note
  const updateNote = useCallback<UseNotesReturn['updateNote']>(
    (id: NoteId, input: NoteUpdateInput) => {
      setNotes(prevNotes => {
        const noteIndex = prevNotes.findIndex(n => n.id === id);
        if (noteIndex === -1) {
          return prevNotes;
        }
        
        const updatedNotes = [...prevNotes];
        const now = new Date().toISOString();
        
        updatedNotes[noteIndex] = {
          ...updatedNotes[noteIndex],
          title: input.title !== undefined ? input.title.trim() || 'Untitled' : updatedNotes[noteIndex].title,
          body: input.body !== undefined ? input.body.trim() : updatedNotes[noteIndex].body,
          updatedAt: now,
        };
        
        return updatedNotes;
      });
      
      return getNote(id);
    },
    [getNote]
  );

  // Delete a note
  const deleteNote = useCallback<UseNotesReturn['deleteNote']>(
    (id: NoteId) => {
      const noteExists = notes.some(n => n.id === id);
      if (!noteExists) {
        return false;
      }
      
      setNotes(prevNotes => prevNotes.filter(n => n.id !== id));
      
      // Deselect if deleted note was selected
      if (selectedNoteId === id) {
        setSelectedNoteId(null);
      }
      
      return true;
    },
    [notes, selectedNoteId]
  );

  // Get a note by ID
  const getNote = useCallback<UseNotesReturn['getNote']>(
    (id: NoteId) => {
      return notes.find(n => n.id === id) || null;
    },
    [notes]
  );

  // Select a note
  const selectNote = useCallback<UseNotesReturn['selectNote']>(
    (id: NoteId | null) => {
      setSelectedNoteId(id);
    },
    []
  );

  // Clear all notes
  const clearAllNotes = useCallback(() => {
    setNotes([]);
    setSelectedNoteId(null);
    setSearchQuery('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Filter notes based on search query
  const filteredNotes = notes.filter(note => {
    if (!searchQuery.trim()) {
      return true;
    }
    
    const query = searchQuery.toLowerCase();
    const titleMatch = note.title.toLowerCase().includes(query);
    const bodyMatch = note.body.toLowerCase().includes(query);
    
    return titleMatch || bodyMatch;
  });

  // Get currently selected note
  const selectedNote = selectedNoteId ? getNote(selectedNoteId) : null;

  return {
    notes,
    filteredNotes,
    selectedNote,
    searchQuery,
    createNote,
    updateNote,
    deleteNote,
    getNote,
    selectNote,
    setSearchQuery,
    clearAllNotes,
  };
}
