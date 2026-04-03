import { useState, useEffect, useCallback } from 'react';
import type { Note, NoteCreateInput, NoteUpdateInput, NoteId } from '@/types/note';
import { NOTES_STORAGE_KEY } from '@/types/note';

/**
 * Type guard to check if unknown value is a Note
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
 * Type guard to check if unknown value is an array of Notes
 */
function isNotesArray(data: unknown): data is Note[] {
  return (
    Array.isArray(data) &&
    data.every(item => isNote(item))
  );
}

/**
 * Load notes from localStorage with validation
 */
function loadNotesFromStorage(): Note[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(NOTES_STORAGE_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    
    if (isNotesArray(parsed)) {
      return parsed;
    }
    
    console.warn('Invalid notes data in localStorage, returning empty array');
    return [];
  } catch (error) {
    console.error('Error loading notes from localStorage:', error);
    return [];
  }
}

/**
 * Save notes to localStorage
 */
function saveNotesToStorage(notes: Note[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error('Error saving notes to localStorage:', error);
  }
}

/**
 * Generate a unique ID for notes
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Return type for useNotes hook
 */
export interface UseNotesReturn {
  notes: Note[];
  searchTerm: string;
  filteredNotes: Note[];
  createNote: (note: NoteCreateInput) => Note;
  updateNote: (id: NoteId, note: NoteUpdateInput) => Note | null;
  deleteNote: (id: NoteId) => boolean;
  setSearchTerm: (term: string) => void;
  clearAllNotes: () => void;
}

/**
 * Custom hook for notes CRUD operations with localStorage persistence
 */
export function useNotes(): UseNotesReturn {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTermState] = useState<string>('');

  // Load notes from localStorage on mount
  useEffect(() => {
    setNotes(loadNotesFromStorage());
  }, []);

  // Save to localStorage whenever notes change
  useEffect(() => {
    if (notes.length > 0) {
      saveNotesToStorage(notes);
    }
  }, [notes]);

  /**
   * Create a new note
   */
  const createNote = useCallback((noteInput: NoteCreateInput): Note => {
    const now = new Date().toISOString();
    const newNote: Note = {
      id: generateId(),
      title: noteInput.title.trim() || 'Untitled',
      body: noteInput.body?.trim() || '',
      createdAt: now,
      updatedAt: now,
    };

    setNotes(prevNotes => [newNote, ...prevNotes]);
    return newNote;
  }, []);

  /**
   * Update an existing note
   */
  const updateNote = useCallback((id: NoteId, noteInput: NoteUpdateInput): Note | null => {
    return setNotes(prevNotes => {
      const noteIndex = prevNotes.findIndex(n => n.id === id);
      if (noteIndex === -1) return prevNotes;

      const updatedNotes = prevNotes.map((note, index) => {
        if (index === noteIndex) {
          return {
            ...note,
            title: noteInput.title !== undefined ? noteInput.title.trim() || 'Untitled' : note.title,
            body: noteInput.body !== undefined ? noteInput.body.trim() : note.body,
            updatedAt: new Date().toISOString(),
          };
        }
        return note;
      });

      return updatedNotes;
    });
  }, []);

  /**
   * Delete a note
   */
  const deleteNote = useCallback((id: NoteId): boolean => {
    const noteExists = notes.some(n => n.id === id);
    if (!noteExists) return false;

    setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
    return true;
  }, [notes]);

  /**
   * Clear all notes
   */
  const clearAllNotes = useCallback(() => {
    setNotes([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(NOTES_STORAGE_KEY);
    }
  }, []);

  /**
   * Filter notes based on search term
   */
  const filteredNotes = notes.filter(note => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      note.title.toLowerCase().includes(searchLower) ||
      note.body.toLowerCase().includes(searchLower)
    );
  });

  /**
   * Set search term
   */
  const setSearchTerm = useCallback((term: string) => {
    setSearchTermState(term);
  }, []);

  return {
    notes,
    searchTerm,
    filteredNotes,
    createNote,
    updateNote,
    deleteNote,
    setSearchTerm,
    clearAllNotes,
  };
}
