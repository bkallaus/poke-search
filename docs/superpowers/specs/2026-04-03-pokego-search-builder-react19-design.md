# Design Doc: PokéGO Search String Builder (React 19 Edition)

A lightweight, static web application to help Pokémon GO players build complex search strings through an intuitive UI, optimized with React 19's latest features.

## 1. Overview
Players often need specific, complex search strings (e.g., `shiny&!legendary&cp-1500`) to filter their collection. This tool provides a category-based grid of buttons to visually "click together" these strings, supporting both positive and negative matches.

## 2. Architecture & Tech Stack
- **Framework:** React 19 (Vite) + TypeScript.
- **Styling:** Vanilla CSS (CSS Modules) following the **Clay Design System**.
- **Persistence:** `localStorage` for saving the current string across sessions.
- **Deployment:** Static hosting (GitHub Pages).

## 3. React 19 Modernization
This project leverages the following React 19 features to provide a superior user experience and cleaner codebase:

### 3.1. `useOptimistic` for Search String Feedback
The live search string display in the `Header` will use `useOptimistic`. When a user toggles an attribute (e.g., clicking "Shiny"), the UI will update the string immediately while the underlying `segments` state and `localStorage` update in a transition.

### 3.2. `useActionState` for Range Inputs
The `RangeSelector` and `CPSelector` will use `useActionState` to handle the "Add" action. This provides a clean way to manage the transition from user input to string segment without manual loading or success states.

### 3.3. Ref-as-a-Prop
Components like `Header` and `RangeSelector` will accept `ref` directly as a prop, eliminating the need for `forwardRef` and making the component code more readable.

### 3.4. Simplified Context
The `SearchContext` will be used directly as `<SearchContext>` instead of `<SearchContext.Provider>`.

### 3.5. Native Metadata Support
The `App` component will use native `<title>` and `<meta>` tags to update the page title dynamically based on the current search string (e.g., `PokéGO Search: shiny&!legendary`).

## 4. UI/UX Design (Category-Based Grid)
The interface is a single-page, mobile-responsive grid using the **Clay Design System** (warm cream backgrounds, playful hover animations, and the Roobert font).

### 4.1. Top Header (Sticky)
- **Live Search String:** Displays the current string (using `useOptimistic`).
- **Action Buttons:** Copy, Clear, and Undo.

### 4.2. Search Categories
- **Standard Attributes:** Toggle buttons for inclusive/exclusive matches.
- **IV Attributes:** Slider (0-4 stars) with toggle buttons.
- **CP Attributes:** Preset buttons (1500, 2500) and custom range input using `useActionState`.
- **Other Range-Based (Age, Distance, Buddy Level, Year):** Custom inputs using `useActionState`.

## 5. Data Flow & Logic
- **String Construction:** Segments are joined with `&`. Negative segments use `!`.
- **Transitions:** All state changes are wrapped in `startTransition` to enable optimistic updates and keep the UI responsive.
- **Validation:** Inputs are sanitized for valid characters (numbers, hyphens, commas).

## 6. Testing Strategy
- **Unit Tests:** Verify string joining logic and React 19 action handlers.
- **UI Tests:** Ensure optimistic updates reflect correctly in the header.
- **Verification:** Confirm metadata (title) updates correctly in the browser tab.
