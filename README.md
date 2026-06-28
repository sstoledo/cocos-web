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
- **Lint/Format:** Biome

## Setup

Requires Node.js 22 LTS (use `.nvmrc`) and pnpm (see `packageManager` in `package.json`).

### Supply-chain safety

This project pins exact dependency versions and requires the Node version declared in `.nvmrc` and pnpm declared in `packageManager`:

```bash
nvm use          # reads .nvmrc
corepack enable  # optional, lets Node use the packageManager field automatically
pnpm install     # installs exact versions from pnpm-lock.yaml
```

Never use `npm install` or `pnpm update` in production or before a release; they can bump versions silently. Run `pnpm audit` periodically to check for known vulnerabilities.

### Install and run

```bash
cp .env.template .env
pnpm install
pnpm dev
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
| `pnpm dev` | Start the Vite development server |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview the production build |
| `pnpm format` | Format code with Biome |
| `pnpm format:check` | Check Biome formatting |
| `pnpm lint` | Biome lint |
| `pnpm lint:fix` | Biome lint with auto-fix |
| `pnpm check` | Biome lint + format |
| `pnpm test` | Run the Vitest suite |
| `pnpm test:ui` | Open the Vitest UI |
| `pnpm audit` | Check for known vulnerabilities |
| `pnpm audit:fix` | Auto-fix non-breaking vulnerabilities |

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
