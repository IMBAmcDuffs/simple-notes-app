# Simple Notes App — UI/UX Wireframe Design Specification

## Executive Summary

This document provides the complete UI/UX design specification for the Simple Notes App, a minimal Next.js notes application. The design follows a clean, minimalist aesthetic using Tailwind CSS utility classes directly, focusing on functionality over visual polish as per the approved design handoff.

**Design Philosophy:** Clean, functional, mobile-first interface with neutral grays and blue accent colors.

---

## Design Artifacts

### Stitch Mockup URLs

The following Stitch-generated mockups were created for desktop and mobile views:

| Screen | Device | Mockup URL |
|--------|--------|------------|
| Note List View | Desktop | https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzYzNjc4ZWNlY2E0ODQ0MjI4MGUzZjA1MTI0ZDU2MWE4EgsSBxCC5ZSMnhwYAZIBJAoKcHJvamVjdF9pZBIWQhQxNDAwMTk3NTY4NDA1MDg5Mjc0OA&filename=&opi=96797242 |
| Note List View | Mobile | https://lh3.googleusercontent.com/aida/ADBb0ugujZH_ImHVwGKNzzC8-k8PWuoxDYtHZgoQoz8lCEPOTDrcX4ABS2YNBaJcvkSk71LiJCQFIGPwPxxt7N-XoLugkPpv0NiacrQVGtfxbf-wLGCLAkN-J0TBNC7zLZP7ZPe7qCeyWSarRrY690g6XPIFzDWDLJZSEVCE07R6XwBzk07eLVjRMDNSm3UML20boIVaC3u6weJ4-ElawAM8grDqfL_TWCrPowPFcR_Ml6A8d7dTHKQRkCJAWASb |
| Note Editor | Desktop | https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzEzMTg5ZWE1YjUwNDRjM2E5YjZjOTc1YjNjZDViYzMzEgsSBxCC5ZSMnhwYAZIBJAoKcHJvamVjdF9pZBIWQhQxNDAwMTk3NTY4NDA1MDg5Mjc0OA&filename=&opi=96797242 |
| Note Editor | Mobile | https://lh3.googleusercontent.com/aida/ADBb0ui69dvRmRxrCSiMtnO7IkpZjvhyM7bHYrGShRTTCwddtFFupMucoaHF-ZMC6LoEcJYf7YoHxZytyjXgt3RwNsbGvoEd7wPfnaDOtEYgVLt3m8-inw_KrMQQhiOVBJk1ffpRvX-D5cJRnvUQwOZQc6d8ENKxZgHrrMLeYLe6D2tfL2Erz3FnrgkaIFcWM361iczddf1BZ-EpRcK38lUnkRxotYTtJmcyHYFKGV0s3dXZPoOeCyn2oCXQ7pY0 |

---

## Component Hierarchy

```
App (Root)
├── Header
│   ├── Logo/Title
│   └── SearchBar
├── MainLayout (Responsive 2-column on desktop, stacked on mobile)
│   ├── Sidebar (NoteList)
│   │   ├── NoteCard (repeated)
│   │   │   ├── Title
│   │   │   ├── Preview (truncated body)
│   │   │   ├── Timestamp
│   │   │   └── Delete Button
│   │   └── EmptyState (when no notes)
│   └── EditorPanel (NoteEditor)
│       ├── Title Input
│       ├── Body Textarea
│       ├── Save Button
│       └── Cancel Button (when editing)
└── Footer (optional, minimal)
```

---

## Color Palette & Theme Tokens

### Primary Colors

| Token | Value | Usage |
|-------|-------|-------|
| `bg-primary` | `bg-white` / `bg-gray-50` | Main background |
| `bg-secondary` | `bg-gray-100` | Sidebar, cards |
| `text-primary` | `text-gray-900` | Headings, primary text |
| `text-secondary` | `text-gray-600` | Body text, captions |
| `text-muted` | `text-gray-400` | Timestamps, placeholders |
| `accent-primary` | `bg-blue-600` / `text-blue-600` | Primary buttons, links |
| `accent-hover` | `hover:bg-blue-700` | Button hover states |
| `danger` | `text-red-600` / `bg-red-600` | Delete actions |
| `border-default` | `border-gray-200` | Dividers, borders |

### Focus States

| Token | Value | Usage |
|-------|-------|-------|
| `focus-ring` | `focus:ring-2 focus:ring-blue-500 focus:ring-offset-2` | Input focus states |

---

## Responsive Breakpoints

| Breakpoint | Width | Layout Behavior |
|------------|-------|-----------------|
| `sm` | ≥ 640px | Base mobile layout |
| `md` | ≥ 768px | Tablet optimizations |
| `lg` | ≥ 1024px | Two-column layout (sidebar + editor) |
| `xl` | ≥ 1280px | Wider containers, more padding |

### Layout Strategy

- **Mobile (< lg)**: Stacked layout — NoteList full width, NoteEditor slides in or overlays
- **Desktop (≥ lg)**: Two-column layout — Sidebar (NoteList) fixed width ~280px, EditorPanel fills remaining space

---

## Component Specifications

### 1. SearchBar Component

**Purpose:** Real-time search/filter notes by title and body text.

**Tailwind Classes:**
```
Container: w-full max-w-md mx-auto
Input: w-full px-4 py-2 text-gray-900 placeholder-gray-400
       border border-gray-200 rounded-lg
       focus:outline-none focus:ring-2 focus:ring-blue-500
       focus:border-transparent shadow-sm
Icon (search): absolute left-3 top-1/2 -translate-y-1/2 text-gray-400
```

**Props:**
```typescript
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}
```

---

### 2. NoteCard Component

**Purpose:** Display individual note in the list with title, preview, timestamp, and delete action.

**Tailwind Classes:**
```
Container: p-4 bg-white border border-gray-200 rounded-lg
           hover:bg-gray-50 hover:border-blue-300 cursor-pointer
           transition-all duration-150
           group relative
Title: text-gray-900 font-medium truncate mb-1
Preview: text-gray-600 text-sm truncate mb-2
Timestamp: text-gray-400 text-xs
Delete Button: absolute top-2 right-2 opacity-0 group-hover:opacity-100
              text-gray-400 hover:text-red-600 transition-opacity
```

**Props:**
```typescript
interface NoteCardProps {
  note: Note;
  onSelect: (note: Note) => void;
  onDelete: (id: string) => void;
  isSelected?: boolean;
}
```

**Selected State:**
```
isSelected: ring-2 ring-blue-500 bg-blue-50
```

---

### 3. NoteList Component

**Purpose:** Container for NoteCard components with scrollable list.

**Tailwind Classes:**
```
Container: flex flex-col h-full
Header: p-4 border-b border-gray-200 bg-gray-50
       flex items-center justify-between
Title: text-lg font-semibold text-gray-900
Count: text-sm text-gray-500
List: flex-1 overflow-y-auto p-2 space-y-2
EmptyState: flex flex-col items-center justify-center py-12
           text-center
EmptyText: text-gray-500 text-sm
```

**Props:**
```typescript
interface NoteListProps {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
}
```

---

### 4. NoteEditor Component

**Purpose:** Create and edit notes with title and body fields.

**Tailwind Classes:**
```
Container: flex flex-col h-full bg-white
Header: p-4 border-b border-gray-200 flex items-center justify-between
Title: text-lg font-semibold text-gray-900
Actions: flex gap-2
Body: flex-1 p-4 flex flex-col
Title Input: w-full px-4 py-2 text-lg font-medium text-gray-900
             border border-gray-200 rounded-lg mb-4
             focus:outline-none focus:ring-2 focus:ring-blue-500
             placeholder-gray-400
Body Textarea: flex-1 w-full px-4 py-2 text-gray-900
              border border-gray-200 rounded-lg resize-none
              focus:outline-none focus:ring-2 focus:ring-blue-500
              placeholder-gray-400
              leading-relaxed
Footer: p-4 border-t border-gray-200 flex justify-end gap-2
Save Button: px-4 py-2 bg-blue-600 text-white rounded-lg
             hover:bg-blue-700 font-medium
             focus:outline-none focus:ring-2 focus:ring-blue-500
Cancel Button: px-4 py-2 bg-gray-200 text-gray-700 rounded-lg
              hover:bg-gray-300 font-medium
              focus:outline-none focus:ring-2 focus:ring-gray-400
```

**Props:**
```typescript
interface NoteEditorProps {
  note: Note | null;
  onSave: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isEditing?: boolean;
}
```

**Empty State (No Note Selected):**
```
Placeholder: flex flex-col items-center justify-center h-full
             text-gray-400
Icon: mb-4 text-4xl
Text: text-lg
Subtext: text-sm mt-2
```

---

## Page Layout Specifications

### Desktop Layout (≥ lg breakpoint)

```
┌─────────────────────────────────────────────────────────────┐
│  Header (SearchBar centered)                                 │
├──────────────────┬──────────────────────────────────────────┤
│                  │                                          │
│  Sidebar         │  EditorPanel                             │
│  (NoteList)      │  (NoteEditor)                            │
│  ~280px          │  flex-1                                  │
│                  │                                          │
│  • NoteCard      │  • Title Input                          │
│  • NoteCard      │  • Body Textarea                        │
│  • NoteCard      │  • Save/Cancel Buttons                  │
│  • NoteCard      │                                          │
│                  │                                          │
└──────────────────┴──────────────────────────────────────────┘
```

**Tailwind Classes:**
```
Page Container: min-h-screen bg-gray-50
Header: h-16 bg-white border-b border-gray-200 flex items-center px-6
Main: flex h-[calc(100vh-4rem)]
Sidebar: w-72 bg-white border-r border-gray-200 flex-shrink-0
EditorPanel: flex-1 flex flex-col overflow-hidden
```

### Mobile Layout (< lg breakpoint)

```
┌─────────────────────────┐
│  Header (SearchBar)     │
├─────────────────────────┤
│  NoteList (Full Width)  │
│  • NoteCard             │
│  • NoteCard             │
│  • NoteCard             │
└─────────────────────────┘
```

**Editor Overlay (when note selected):**
```
┌─────────────────────────┐
│  Header (Back + Title)  │
├─────────────────────────┤
│  NoteEditor (Full Width)│
│  • Title Input          │
│  • Body Textarea        │
│  • Save/Cancel Buttons  │
└─────────────────────────┘
```

**Tailwind Classes:**
```
Mobile Container: min-h-screen bg-gray-50 flex flex-col
Header: h-14 bg-white border-b border-gray-200 flex items-center px-4
Main: flex-1 overflow-hidden
NoteList: flex-1 overflow-y-auto
Editor Overlay: fixed inset-0 bg-white z-50 flex flex-col
```

---

## Typography Scale

| Element | Class | Size |
|---------|-------|------|
| Page Title | `text-2xl font-bold` | 24px |
| Section Header | `text-lg font-semibold` | 18px |
| Note Title | `text-base font-medium` | 16px |
| Body Text | `text-base` | 16px |
| Caption/Timestamp | `text-sm` | 14px |
| Small/Meta | `text-xs` | 12px |

---

## Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Tight spacing |
| `space-2` | 8px | Small gaps |
| `space-4` | 16px | Standard spacing |
| `space-6` | 24px | Section spacing |
| `space-8` | 32px | Large gaps |

---

## Interaction States

### Hover States

```
Buttons: hover:bg-blue-700 (primary), hover:bg-gray-300 (secondary)
Cards: hover:bg-gray-50 hover:border-blue-300
Links: hover:text-blue-700
```

### Focus States

```
Inputs: focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
Buttons: focus:outline-none focus:ring-2 focus:ring-blue-500
```

### Active/Selected States

```
Selected Note Card: ring-2 ring-blue-500 bg-blue-50
Active Button: bg-blue-700
```

---

## Empty States

### No Notes Empty State

```
Container: flex flex-col items-center justify-center py-16 px-4
Icon: text-4xl text-gray-300 mb-4
Title: text-lg font-medium text-gray-700
Subtitle: text-sm text-gray-500 mt-1
```

### No Search Results

```
Container: flex flex-col items-center justify-center py-12 px-4
Icon: text-3xl text-gray-300 mb-3
Title: text-base font-medium text-gray-700
Subtitle: text-sm text-gray-500
```

---

## Accessibility Considerations

1. **Keyboard Navigation**: All interactive elements focusable via Tab
2. **Focus Indicators**: Visible ring on focus for all inputs and buttons
3. **ARIA Labels**: Search input has aria-label="Search notes"
4. **Color Contrast**: Meets WCAG AA standards (gray-600 on white = 4.5:1)
5. **Touch Targets**: Minimum 44px touch targets on mobile

---

## Conclusions

This design specification provides a clean, functional interface for the Simple Notes App. The design prioritizes:

1. **Simplicity**: Minimal visual elements, focus on content
2. **Responsiveness**: Mobile-first approach with proper breakpoints
3. **Consistency**: Unified color palette and spacing scale
4. **Accessibility**: Proper focus states and keyboard navigation

The Tailwind utility classes specified can be directly implemented in the React components without additional CSS files.

---

## Action Items

| Item | Description | Owner |
|------|-------------|-------|
| 1 | Implement NoteCard component with specified Tailwind classes | Build agent |
| 2 | Implement NoteList component with scrollable container | Build agent |
| 3 | Implement NoteEditor component with title/body inputs | Build agent |
| 4 | Implement SearchBar component with real-time filtering | Build agent |
| 5 | Assemble main page layout with responsive breakpoints | Build agent |
| 6 | Verify responsive behavior at sm, md, lg, xl breakpoints | QA agent |
| 7 | Test keyboard navigation and focus states | QA agent |

---

## References

- **Stitch Workspace**: https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzYzNjc4ZWNlY2E0ODQ0MjI4MGUzZjA1MTI0ZDU2MWE4EgsSBxCC5ZSMnhwYAZIBJAoKcHJvamVjdF9pZBIWQhQxNDAwMTk3NTY4NDA1MDg5Mjc0OA&filename=&opi=96797242
- **Design Brief**: Simple notes app - clean minimalist UI with Tailwind CSS
- **Repository**: https://github.com/IMBAmcDuffs/simple-notes-app
- **Branch**: mission/simple-notes-app-model-test-94a4e4fd