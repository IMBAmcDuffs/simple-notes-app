import { Note } from '@/types/note';

interface NoteCardProps {
  note: Note;
  onDelete: (id: string) => void;
  onClick?: (note: Note) => void;
}

export function NoteCard({ note, onDelete, onClick }: NoteCardProps) {
  const handleDelete = () => {
    if (window.confirm(`Delete note "${note.title}"? This action cannot be undone.`)) {
      onDelete(note.id);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div
      className="group bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={() => onClick?.(note)}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-gray-900 line-clamp-1 flex-1">
          {note.title || 'Untitled'}
        </h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 shrink-0"
          aria-label={`Delete note "${note.title}"`}
          title="Delete note"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
            />
          </svg>
        </button>
      </div>
      
      {note.body && (
        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
          {note.body}
        </p>
      )}
      
      <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
        <time dateTime={note.updatedAt}>
          {formatDate(note.updatedAt)}
        </time>
      </div>
    </div>
  );
}
