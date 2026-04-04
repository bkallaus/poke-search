# Setup SearchContext & Types Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Setup SearchContext & Types for global state management.

**Architecture:** Use a SearchContext for global state, wrap App in SearchProvider, and define SearchSegment/SearchContextType.

**Tech Stack:** React 19, TypeScript, useTransition.

---

### Task 1: Define Types

**Files:**
- Create: `src/types/index.ts`

- [ ] **Step 1: Create src/types/index.ts with SearchSegment and SearchContextType**

```typescript
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

- [ ] **Step 2: Verify file existence**

Run: `ls src/types/index.ts`
Expected: File exists

### Task 2: Create SearchContext

**Files:**
- Create: `src/context/SearchContext.tsx`

- [ ] **Step 1: Create src/context/SearchContext.tsx with SearchProvider and useSearch hook**

```tsx
import React, { createContext, useContext, useState, useTransition, useCallback, ReactNode } from 'react';
import { SearchSegment, SearchContextType } from '../types';

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [segments, setSegments] = useState<SearchSegment[]>([]);
  const [, startTransition] = useTransition();

  const addSegment = useCallback((value: string, inclusive: boolean, categoryId: string) => {
    startTransition(() => {
      setSegments((prev) => [
        ...prev,
        { id: crypto.randomUUID(), value, inclusive, categoryId },
      ]);
    });
  }, []);

  const toggleSegment = useCallback((value: string, categoryId: string) => {
    startTransition(() => {
      setSegments((prev) => {
        const index = prev.findIndex((s) => s.value === value && s.categoryId === categoryId);
        if (index >= 0) {
          return prev.filter((_, i) => i !== index);
        }
        return [...prev, { id: crypto.randomUUID(), value, inclusive: true, categoryId }];
      });
    });
  }, []);

  const undo = useCallback(() => {
    startTransition(() => {
      setSegments((prev) => prev.slice(0, -1));
    });
  }, []);

  const clear = useCallback(() => {
    startTransition(() => {
      setSegments([]);
    });
  }, []);

  return (
    <SearchContext.Provider value={{ segments, addSegment, toggleSegment, undo, clear }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};
```

- [ ] **Step 2: Verify file existence**

Run: `ls src/context/SearchContext.tsx`
Expected: File exists

### Task 3: Wrap App in SearchProvider

**Files:**
- Modify: `src/main.tsx`

- [ ] **Step 1: Update src/main.tsx to include SearchProvider**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { SearchProvider } from './context/SearchContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SearchProvider>
      <App />
    </SearchProvider>
  </StrictMode>,
)
```

- [ ] **Step 2: Verify no syntax errors**

Run: `npm run build` or `npx tsc`
Expected: No type errors in these files.

### Task 4: Final Verification

- [ ] **Step 1: Verify exports**
Check that `SearchSegment`, `SearchContextType`, `SearchProvider`, and `useSearch` are correctly exported and usable.
