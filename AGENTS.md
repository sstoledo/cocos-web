# Cocos Web — AI Code Review Rules

## Project Overview

Cocos Web is the React frontend for the Cocos mechanic-shop ERP. It consumes a NestJS backend, uses session-based auth via `better-auth`, and is organized by features. The UI is built with base-ui primitives and styled with Tailwind CSS v4.

## Tech Stack

- **Framework:** React 19, React Router 7, Vite 6
- **Build tool / test runner:** Vite with `@vitejs/plugin-react-swc`, Vitest 3
- **Language:** TypeScript 5.9, project references (`tsconfig.app.json`, `tsconfig.node.json`)
- **Styling:** Tailwind CSS 4, `@tailwindcss/vite`, `tailwind-merge`, `clsx`
- **UI primitives:** `@base-ui/react` (unstyled, accessible)
- **Data fetching:** TanStack React Query v5
- **Forms / validation:** React Hook Form + Zod (`@hookform/resolvers`)
- **Tables:** TanStack React Table v8
- **Charts:** Recharts
- **Notifications:** Sonner
- **URL state:** nuqs
- **Package manager:** pnpm 9.15.0 (`preinstall` enforces `only-allow pnpm`)
- **Formatter / linter:** Biome 1.9.4

## Conventions

### Components

- Write functional components with explicit return types only when they add clarity.
- Forward refs for UI primitives using `React.forwardRef` and set `displayName`.
- Keep components small and focused; derive state close to where it is used.
- Presentational components live in `src/components/ui/`. Feature components live in `src/features/<feature>/components/`.
- Feature pages live in `src/features/<feature>/pages/`.

### Naming

- Components: PascalCase files and exports (`Button.tsx`, `ThemeToggle.tsx`).
- Hooks: camelCase prefixed with `use` (`useAuth`).
- Utility files: camelCase (`utils.ts`, `query-client.ts`).
- barrel files are allowed for feature public APIs.

### Imports

- Use the `@/` path alias for cross-feature imports (`@/components/ui/Button`, `@/lib/utils`).
- Inside a feature, use relative imports.
- Prefer named imports from React Router and TanStack Query.
- Import types explicitly with `import type { ... }` when only types are needed.

### Routing

- Prefer React Router v7 data APIs: define routes as `RouteObject[]` and create the router with `createBrowserRouter`.
- Use `RouterProvider` at the `App` root; do not nest `BrowserRouter`.
- Feature routes are declared in the feature and composed in `src/App.tsx`.

### Styling

- Utility-first with Tailwind CSS v4.
- Use `cn()` from `@/lib/utils` to merge classes; avoid inline string concatenation for conditional classes.
- Theme tokens are CSS variables declared in `src/index.css` and mapped in `@theme`.
- Dark mode is class-based via `.dark` on `document.documentElement`.

### Formatting

- Enforced by Biome: 2-space indentation, LF line endings, 80-character line width.
- Single quotes, semicolons always, trailing commas ES5.
- Biome uses `jsxRuntime: "reactClassic"` (Biome 1.9.4 does not expose an automatic runtime option). TypeScript's `jsx: "react-jsx"` is the source of truth for the JSX transform.
- Do **not** add `import * as React from 'react'` just because a file contains JSX. TypeScript's `noUnusedLocals` will reject an unused React import.
- Import React only when its APIs are actually used (e.g. `useState`, `forwardRef`). Prefer named/type imports when only types are needed.
- Run `pnpm check:fix` before committing.

## Testing Rules

- Unit tests live next to source as `*.test.tsx` (or `*.test.ts`) and run with `pnpm test`.
- Test with `@testing-library/react`, `@testing-library/jest-dom`, and `jsdom`.
- Keep tests behavioral: assert what the user sees, not implementation details.
- Mock external boundaries (HTTP, auth, query client) rather than component internals.
- Do not commit focused or skipped tests (`it.only`, `describe.skip`).

## Security Rules

- **Never hardcode secrets.** Use `.env`/`.env.template` and Vite's `import.meta.env`.
- Auth state comes from the `better-auth` client. Do not invent custom token handling.
- Validate all server input with Zod before sending to the backend.
- Avoid `dangerouslySetInnerHTML`; if unavoidable, sanitize content first.
- Prefer `noopener noreferrer` on external links.
- Scope React Query cache keys by feature and include user/session context when sensitive.

## PR Review Focus

- Does the component use base-ui primitives correctly and remain accessible?
- Are Tailwind classes merged with `cn()` and kept within the design token set?
- Are routes declared with data APIs and free of nested routers?
- Is data fetching handled through React Query with proper loading/error states?
- Do forms validate with Zod + React Hook Form?
- Are tests present for user-visible behavior?
- Does the change pass `pnpm check` and `pnpm test`?

## Forbidden Patterns

- Do not use `var` or implicit `any`; `any` requires a `// biome-ignore lint/suspicious/noExplicitAny: <reason>` comment.
- Do not bypass React Router data APIs with hash routes or manual URL parsing for navigation.
- Do not inline raw CSS files per component; extend `src/index.css` theme tokens or use Tailwind utilities.
- Do not call backend endpoints directly from components; centralize API calls in feature-specific query/mutation hooks.
- Do not commit `console.log`, `debugger`, or leftover `TODO` without a linked issue.
- Do not change Biome or Tailwind config in the same PR as feature code unless required to fix a build/lint failure introduced by the feature.
- Do not import from `node_modules` paths directly (e.g., `@base-ui/react/input` is fine; deep internals are not).
- Do not create feature modules without tests.
