# localStorage API Patterns Research

## Executive Summary

This research documents localStorage API usage patterns for the Simple Notes App, a client-side Next.js application. The findings cover API mechanics, TypeScript type safety, JSON serialization strategies, and the Note data structure. All data persists in the browser with no backend required.

---

## localStorage API Overview

### Core API Methods

| Method | Description | Return Value |
|--------|-------------|--------------|
| `localStorage.getItem(key)` | Retrieves a stored value | `string \| null` |
| `localStorage.setItem(key, value)` | Stores a key-value pair | `void` |
| `localStorage.removeItem(key)` | Removes a key-value pair | `void` |
| `localStorage.clear()` | Removes all items | `void` |
| `localStorage.key(index)` | Returns key at numeric index | `string \| null` |
| `localStorage.length` | Number of stored items | `number` |

### Key Characteristics

- **Storage Limit**: Approximately 5-10MB per domain (browser-dependent)
- **Data Type**: Strings only — all values must be serialized
- **Scope**: Per-origin (protocol + domain + port)
- **Persistence**: Survives browser restarts until explicitly cleared
- **Synchronous**: Blocks the main thread (avoid large payloads)
- **Availability**: Browser environment only (not available in Node.js server context)

### Browser Compatibility

localStorage is universally supported in all modern browsers:
- Chrome, Edge, Firefox, Safari, Opera
- Mobile browsers (iOS Safari, Chrome Mobile)
- IE9+ (legacy support)

---

## Note Data Structure

### TypeScript Interface

```typescript
interface Note {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}
```

### Field Specifications

| Field | Type | Description | Format |
|-------|------|-------------|--------|
| `id` | `string` | Unique identifier | UUID v4 or timestamp-based |
| `title` | `string` | Note title | Plain text, max 200 chars recommended |
| `body` | `string` | Note content | Plain text, no length limit enforced |
| `createdAt` | `string` | Creation timestamp | ISO 8601 format |
| `updatedAt` | `string` | Last modification timestamp | ISO 8601 format |

### Example Note Object

```typescript
const exampleNote: Note = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  title: "Meeting Notes",
  body: "Discuss project timeline and deliverables...",
  createdAt: "2024-01-15T10:30:00.000Z",
  updatedAt: "2024-01-15T14:22:00.000Z"
};
```

---

## JSON Serialization Strategy

### Storage Key Convention

```typescript
const STORAGE_KEY = "simple-notes-app:notes";
```

**Rationale**: Namespaced key prevents collisions with other applications.

### Serialization Functions

```typescript
// Store notes array
function saveNotes(notes: Note[]): void {
  try {
    const serialized = JSON.stringify(notes);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      console.error("Storage quota exceeded");
    } else {
      console.error("Failed to save notes:", error);
    }
  }
}

// Load notes array
function loadNotes(): Note[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return validateNotes(parsed);
  } catch (error) {
    console.error("Failed to load notes:", error);
    return [];
  }
}
```

### Error Handling Considerations

1. **QuotaExceededError**: Storage limit reached (~5-10MB)
2. **SyntaxError**: Malformed JSON (corrupted data)
3. **SecurityError**: Private browsing mode restrictions
4. **TypeError**: Invalid argument types

### Data Validation

```typescript
function validateNotes(data: unknown): Note[] {
  if (!Array.isArray(data)) return [];
  
  return data.filter((item): item is Note => {
    return (
      typeof item === "object" &&
      item !== null &&
      typeof item.id === "string" &&
      typeof item.title === "string" &&
      typeof item.body === "string" &&
      typeof item.createdAt === "string" &&
      typeof item.updatedAt === "string"
    );
  });
}
```

---

## TypeScript Type Definitions

### Type Guards for localStorage

```typescript
// Type guard for valid Note
function isNote(obj: unknown): obj is Note {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    "title" in obj &&
    "body" in obj &&
    "createdAt" in obj &&
    "updatedAt" in obj &&
    typeof (obj as Note).id === "string" &&
    typeof (obj as Note).title === "string" &&
    typeof (obj as Note).body === "string" &&
    typeof (obj as Note).createdAt === "string" &&
    typeof (obj as Note).updatedAt === "string"
  );
}

// Type guard for notes array
function isNotesArray(data: unknown): data is Note[] {
  return Array.isArray(data) && data.every(isNote);
}
```

### Generic Storage Utility Types

```typescript
// Generic storage operations
type StorageKey = "simple-notes-app:notes";

interface StorageOperations<T> {
  get: () => T | null;
  set: (value: T) => void;
  remove: () => void;
}

// Typed localStorage wrapper
function createStorage<T>(key: string): StorageOperations<T> {
  return {
    get: (): T | null => {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      } catch {
        return null;
      }
    },
    set: (value: T): void => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error(`Failed to set ${key}:`, error);
      }
    },
    remove: (): void => {
      localStorage.removeItem(key);
    },
  };
}

// Usage
const notesStorage = createStorage<Note[]>(STORAGE_KEY);
```

### CRUD Operation Types

```typescript
// CRUD operation result types
type CreateNoteResult = { success: true; note: Note } | { success: false; error: string };
type UpdateNoteResult = { success: true; note: Note } | { success: false; error: string };
type DeleteNoteResult = { success: true; deletedId: string } | { success: false; error: string };

// Search/filter types
type SearchQuery = string;
type FilterFunction = (note: Note) => boolean;
```

---

## Next.js Considerations

### Client-Side Only Access

localStorage is **not available** in:
- Server Components (default in Next.js 14+ App Router)
- Server Actions
- Build-time execution

**Must use** `"use client"` directive for components accessing localStorage:

```typescript
"use client";

import { useEffect, useState } from "react";

function NotesProvider() {
  // localStorage access here is safe
}
```

### Recommended Architecture

```
src/
├── app/
│   └── page.tsx          # "use client" - main page
├── components/
│   ├── NoteList.tsx      # "use client"
│   ├── NoteEditor.tsx    # "use client"
│   ├── NoteCard.tsx      # "use client"
│   └── SearchBar.tsx     # "use client"
├── hooks/
│   └── useNotes.ts       # "use client" - CRUD + search logic
├── types/
│   └── note.ts           # Note interface definition
└── utils/
    └── storage.ts        # localStorage wrapper functions
```

---

## Conclusions and Recommendations

### Summary of Decisions

1. **Storage Key**: `"simple-notes-app:notes"` — namespaced to avoid conflicts
2. **Data Structure**: Array of `Note` objects stored as single JSON string
3. **ID Generation**: UUID v4 (via `crypto.randomUUID()`) or timestamp-based
4. **Timestamp Format**: ISO 8601 strings (e.g., `"2024-01-15T10:30:00.000Z"`)
5. **Error Handling**: Try-catch around all localStorage operations with graceful fallbacks
6. **Type Safety**: Full TypeScript interfaces with runtime validation

### Best Practices

- ✅ Always validate parsed data against expected schema
- ✅ Handle `QuotaExceededError` for large note collections
- ✅ Use `"use client"` directive for all localStorage-accessing code
- ✅ Implement debounced saves for frequent updates (e.g., typing)
- ✅ Consider IndexedDB for future scalability if needed

### Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Storage quota exceeded | Warn user, offer to delete old notes |
| Data corruption | Validate on load, provide recovery option |
| Browser clearing storage | Document limitation, consider export feature |
| Cross-device sync not available | Accept as design constraint (local-first app) |

---

## Action Items

1. **Create `research/` directory** at repository root
2. **Save this document** as `research/localstorage-api-patterns.md`
3. **Create `research/README.md`** indexing all research files
4. **Implement Note interface** in `src/types/note.ts`
5. **Create storage utility** in `src/utils/storage.ts`
6. **Build `useNotes` hook** in `src/hooks/useNotes.ts`

---

## References

- MDN Web Docs: [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
- Next.js Documentation: [Client Components](https://nextjs.org/docs/app/building-your-application/rendering/client-components)
- TypeScript Handbook: [Type Guards](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)