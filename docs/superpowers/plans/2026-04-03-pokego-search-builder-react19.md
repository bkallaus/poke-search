# PokéGO Search String Builder (React 19) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a React 19 optimized search string builder for Pokémon GO with optimistic updates and clean action-based state management.

**Architecture:** Use a `SearchContext` for global state, `useOptimistic` for instantaneous string feedback, and `useActionState` for range-based inputs. All state transitions are wrapped in `startTransition`.

**Tech Stack:** React 19, TypeScript, Vite, Vanilla CSS (CSS Modules).

---

### Task 1: Setup SearchContext & Types

**Files:**
- Create: `src/types/index.ts`
- Create: `src/context/SearchContext.tsx`
- Modify: `src/main.tsx`

- [ ] **Step 1: Define types**

```typescript
// src/types/index.ts
export interface SearchSegment {
  id: string;
  value: string;
  inclusive: boolean;
  categoryId: string;
}

export interface SearchContextType {
  segments: SearchSegment[];
  addSegment: (value: string, inclusive: boolean, categoryId: string) => void;
  toggleSegment: (value: string, categoryId: string) => void;
  undo: () => void;
  clear: () => void;
}
```

- [ ] **Step 2: Create SearchContext**

```tsx
// src/context/SearchContext.tsx
import { createContext, useContext, useState, useTransition, useOptimistic, ReactNode } from 'react';
import { SearchSegment, SearchContextType } from '../types';

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [segments, setSegments] = useState<SearchSegment[]>([]);
  const [isPending, startTransition] = useTransition();

  const addSegment = (value: string, inclusive: boolean, categoryId: string) => {
    startTransition(() => {
      setSegments(prev => [...prev.filter(s => s.value !== value), { id: crypto.randomUUID(), value, inclusive, categoryId }]);
    });
  };

  const toggleSegment = (value: string, categoryId: string) => {
    startTransition(() => {
      setSegments(prev => {
        const existing = prev.find(s => s.value === value);
        if (!existing) return [...prev, { id: crypto.randomUUID(), value, inclusive: true, categoryId }];
        if (existing.inclusive) return prev.map(s => s.value === value ? { ...s, inclusive: false } : s);
        return prev.filter(s => s.value !== value);
      });
    });
  };

  const undo = () => startTransition(() => setSegments(prev => prev.slice(0, -1)));
  const clear = () => startTransition(() => setSegments([]));

  return (
    <SearchContext value={{ segments, addSegment, toggleSegment, undo, clear }}>
      {children}
    </SearchContext>
  );
}

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) throw new Error('useSearch must be used within a SearchProvider');
  return context;
};
```

- [ ] **Step 3: Wrap App in SearchProvider**

```tsx
// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { SearchProvider } from './context/SearchContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SearchProvider>
      <App />
    </SearchProvider>
  </StrictMode>,
)
```

- [ ] **Step 4: Commit**
```bash
git add src/types/index.ts src/context/SearchContext.tsx src/main.tsx
git commit -m "feat: setup SearchContext and types"
```

---

### Task 2: Implement Optimistic Header

**Files:**
- Modify: `src/components/Header/Header.tsx`
- Modify: `src/context/SearchContext.tsx`

- [ ] **Step 1: Add optimistic string to context**

```tsx
// src/context/SearchContext.tsx (update)
// ... inside SearchProvider
const buildString = (segs: SearchSegment[]) => segs.map(s => (s.inclusive ? '' : '!') + s.value).join('&');

const [optimisticString, addOptimisticUpdate] = useOptimistic(
  buildString(segments),
  (state, newSegments: SearchSegment[]) => buildString(newSegments)
);

// Update addSegment and toggleSegment to use addOptimisticUpdate
```

- [ ] **Step 2: Update Header to use ref as a prop and optimistic string**

```tsx
// src/components/Header/Header.tsx
import { useSearch } from '../../context/SearchContext';
import styles from './Header.module.css';

interface HeaderProps {
  ref?: React.RefObject<HTMLTextAreaElement | null>;
}

export function Header({ ref }: HeaderProps) {
  const { optimisticString, undo, clear } = useSearch();

  return (
    <header className={styles.header}>
      <textarea 
        ref={ref}
        readOnly 
        value={optimisticString} 
        className={styles.display}
      />
      <div className={styles.actions}>
        <button onClick={undo}>Undo</button>
        <button onClick={clear}>Clear</button>
      </div>
    </header>
  );
}
```

- [ ] **Step 3: Commit**
```bash
git add src/components/Header/Header.tsx src/context/SearchContext.tsx
git commit -m "feat: implement optimistic updates in Header"
```

---

### Task 3: RangeSelector with useActionState

**Files:**
- Modify: `src/components/RangeSelector/RangeSelector.tsx`

- [ ] **Step 1: Refactor to useActionState**

```tsx
// src/components/RangeSelector/RangeSelector.tsx
import { useActionState, useRef } from 'react';
import { useSearch } from '../../context/SearchContext';

interface RangeSelectorProps {
  label: string;
  prefix: string;
  placeholder?: string;
}

export function RangeSelector({ label, prefix, placeholder }: RangeSelectorProps) {
  const { addSegment } = useSearch();
  const inputRef = useRef<HTMLInputElement>(null);

  const [state, formAction, isPending] = useActionState(async (prevState: any, formData: FormData) => {
    const val = formData.get('range') as string;
    if (val) {
      addSegment(`${prefix}${val}`, true, `range-${prefix}`);
      if (inputRef.current) inputRef.current.value = '';
    }
    return null;
  }, null);

  return (
    <form action={formAction}>
      <label>{label}</label>
      <input ref={inputRef} name="range" placeholder={placeholder} />
      <button type="submit" disabled={isPending}>+</button>
    </form>
  );
}
```

- [ ] **Step 2: Commit**
```bash
git add src/components/RangeSelector/RangeSelector.tsx
git commit -m "feat: refactor RangeSelector to useActionState"
```

---

### Task 4: Dynamic Metadata & Title

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Add dynamic title support**

```tsx
// src/App.tsx
import { useSearch } from './context/SearchContext';
// ... other imports

function App() {
  const { optimisticString } = useSearch();

  return (
    <>
      <title>{optimisticString ? `PokéGO: ${optimisticString}` : 'PokéGO Search'}</title>
      <meta name="description" content="Build Pokémon GO search strings easily" />
      {/* ... rest of the app */}
    </>
  );
}
```

- [ ] **Step 2: Commit**
```bash
git add src/App.tsx
git commit -m "feat: add dynamic document title support"
```
