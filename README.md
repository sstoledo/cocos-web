# Cocos Web

React 19 + Vite 6 + Tailwind CSS v4 SPA for the Cocos workshop ERP.

## Stack

- **Framework:** React 19, React Router v7
- **Build tool:** Vite 6
- **Styling:** Tailwind CSS v4
- **UI primitives:** @base-ui/react
- **Data fetching:** TanStack Query
- **Forms:** React Hook Form + Zod
- **State:** nuqs, TanStack Query, React context
- **Charts:** Recharts
- **Toasts:** Sonner
- **Testing:** Vitest + Testing Library

## Setup

Requires Node.js 22 LTS (use `.nvmrc`).

### Supply-chain safety

This project pins exact dependency versions and requires the Node version declared in `.nvmrc`:

```bash
nvm use          # reads .nvmrc
npm ci           # installs exact versions from package-lock.json
```

Never use `npm install` in production or before a release; it can bump versions silently. Run `npm run audit` periodically to check for known vulnerabilities.

### Install and run

```bash
cp .env.template .env
npm ci
npm run dev
```

## Environment variables

Copy `.env.template` to `.env` and adjust values:

```bash
cp .env.template .env
```

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Base URL for the backend API (e.g. `http://localhost:4000/api`) |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm test` | Run the Vitest suite |
| `npm run test:ui` | Open the Vitest UI |
| `npm run audit` | Check for known vulnerabilities |
| `npm run audit:fix` | Auto-fix non-breaking vulnerabilities |

## Project structure

```
src/
├── components/ui/      # base-ui wrapper components
├── features/           # Domain features (pages, components, hooks, api)
├── lib/                # Shared utilities and clients
├── main.tsx            # Application entry point
├── App.tsx             # Router and root providers
└── index.css           # Tailwind import and CSS variables
```
