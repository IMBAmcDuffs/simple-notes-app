import { useState, useEffect, useRef, useCallback } from 'react';
import { useNotes } from '@/hooks/useNotes';
import type { Note, NoteId } from '@/types/note';

interface NoteEditorProps {
  noteId?: NoteId;
  onClose?: () => void;
  onSave?: (note: Note) => void;
}

export function NoteEditor({ noteId, onClose, onSave }: NoteEditorProps) {
  const { createNote, updateNote, notes } = useNotes();
  
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [titleError, setTitleError] = useState('');
  const [bodyError, setBodyError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load existing note when noteId changes
  useEffect(() => {
    if (noteId) {
      const note = notes.find(n => n.id === noteId);
      if (note) {
        setTitle(note.title);
        setBody(note.body);
      }
    } else {
      // New note - clear form
      setTitle('');
      setBody('');
    }
    setTitleError('');
    setBodyError('');
  }, [noteId, notes]);

  // Autosize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 600);
      textarea.style.height = `${newHeight}px`;
    }
  }, [body]);

  const validateTitle = (value: string): boolean => {
    if (!value.trim()) {
      setTitleError('Title is required');
      return false;
    }
    if (value.length > 200) {
      setTitleError('Title must be 200 characters or less');
      return false;
    }
    setTitleError('');
    return true;
  };

  const validateBody = (value: string): boolean => {
    if (value.length > 50000) {
      setBodyError('Body must be 50,000 characters or less');
      return false;
    }
    setBodyError('');
    return true;
  };

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTitle(value);
    if (titleError) {
      validateTitle(value);
    }
  }, [titleError]);

  const handleBodyChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setBody(value);
    if (bodyError) {
      validateBody(value);
    }
  }, [bodyError]);

  const handleSave = useCallback(async () => {
    const titleValid = validateTitle(title);
    const bodyValid = validateBody(body);
    
    if (!titleValid || !bodyValid) {
      return;
    }

    setIsSaving(true);

    try {
      let savedNote: Note;
      
      if (noteId) {
        // Update existing note
        const success = updateNote(noteId, { title: title.trim(), body });
        if (!success) {
          throw new Error('Failed to update note');
        }
        savedNote = notes.find(n => n.id === noteId)!;
      } else {
        // Create new note
        const newId = createNote({ title: title.trim(), body });
        savedNote = notes.find(n => n.id === newId)!;
      }

      // Clear form after save
      setTitle('');
      setBody('');
      
      // Call onSave callback if provided
      if (onSave) {
        onSave(savedNote);
      }

      // Close editor if onClose provided
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setIsSaving(false);
    }
  }, [title, body, noteId, createNote, updateNote, notes, onSave, onClose]);

  const handleCancel = useCallback(() => {
    setTitle('');
    setBody('');
    setTitleError('');
    setBodyError('');
    
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  const hasErrors = !!titleError || !!bodyError;
  const isTitleValid = !titleError && title.trim().length > 0;
  const isBodyValid = !bodyError;
  const canSave = isTitleValid && isBodyValid && !isSaving;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {noteId ? 'Edit Note' : 'New Note'}
        </h2>
        <button
          onClick={handleCancel}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          disabled={isSaving}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="space-y-4 max-w-3xl mx-auto">
          {/* Title Input */}
          <div>
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="Note title..."
              className={`w-full text-2xl font-bold bg-transparent border-none focus:ring-0 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100 ${
                titleError ? 'text-red-600 dark:text-red-400' : ''
              }`}
              disabled={isSaving}
              maxLength={200}
              aria-invalid={!!titleError}
              aria-describedby={titleError ? 'title-error' : undefined}
            />
            {titleError && (
              <p id="title-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
                {titleError}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              {title.length}/200 characters
            </p>
          </div>

          {/* Body Textarea */}
          <div>
            <textarea
              ref={textareaRef}
              value={body}
              onChange={handleBodyChange}
              placeholder="Start writing your note..."
              className="w-full text-lg bg-transparent border-none focus:ring-0 placeholder-gray-400 dark:placeholder-gray-500 text-gray-700 dark:text-gray-300 resize-none overflow-hidden leading-relaxed min-h-[200px]"
              disabled={isSaving}
              maxLength={50000}
              aria-invalid={!!bodyError}
              aria-describedby={bodyError ? 'body-error' : undefined}
            />
            {bodyError && (
              <p id="body-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
                {bodyError}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              {body.length}/50,000 characters
            </p>
          </div>
        </div>
      </div>

      {/* Footer with Save Button */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <button
          onClick={handleCancel}
          className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSaving}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!canSave}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
        >
          {isSaving ? 'Saving...' : noteId ? 'Update Note' : 'Create Note'}
        </button>
      </div>
    </div>
  );
}
