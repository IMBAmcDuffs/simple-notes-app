export interface Note {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export type NoteId = string;

export interface NoteCreateInput {
  title: string;
  body: string;
}

export interface NoteUpdateInput {
  title?: string;
  body?: string;
}

export interface NotesState {
  notes: Note[];
  selectedNoteId: NoteId | null;
  searchQuery: string;
}

export const NOTES_STORAGE_KEY = 'simple-notes-app-notes';
