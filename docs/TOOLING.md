# Cocos Web — Tooling

This document describes the tooling alignment for `cocos-web`, especially the
pre-commit workflow and how Biome, TypeScript, and the legacy GGA hook relate to
each other.

## Pre-commit checks

The pre-commit hook runs:

```bash
pnpm check   # Biome format + lint
pnpm test    # Vitest unit tests
pnpm build   # TypeScript compile + Vite production build
```

These commands are the single source of truth for whether a commit is allowed to
proceed. If any of them fails, the commit is blocked.

Run `pnpm check:fix` before committing to let Biome auto-fix formatting and safe
lint issues.

## Why GGA was replaced as the pre-commit gate

The project previously used `gga run` (Gentleman Guardian Angel) in
`.git/hooks/pre-commit`. GGA is an AI-powered reviewer that reads `AGENTS.md` and
applies its rules heuristically. It could not be pointed directly at
`pnpm check`, `pnpm test`, and `pnpm build`, so it duplicated rules from
`AGENTS.md` and sometimes enforced them differently than Biome/TypeScript.

A concrete example: `AGENTS.md` previously said to import React explicitly in
`.tsx` files. The project uses React 19 with TypeScript's automatic JSX runtime
(`"jsx": "react-jsx"`), so an unused `import * as React from 'react'` is
rejected by TypeScript's `noUnusedLocals` and breaks the build. Biome 1.9.4 does
not require the import, but the AI hook sometimes did.

The pre-commit hook now delegates to the actual toolchain, so the rules applied
at commit time are exactly the rules applied in CI.

## How the hook is installed

The hook lives in `.githooks/pre-commit` and is tracked in git. `package.json`
contains:

```json
"prepare": "git config core.hooksPath .githooks"
```

Running `pnpm install` configures Git to use `.githooks` automatically.

To apply the hook manually in an existing clone:

```bash
git config core.hooksPath .githooks
chmod +x .githooks/pre-commit
```

## Biome, TypeScript, and JSX runtime

- **TypeScript** (`tsconfig.app.json`) uses `"jsx": "react-jsx"`, the automatic
  JSX runtime for React 17+. This is the source of truth for JSX transform.
- **Biome** 1.9.4 only exposes `javascript.jsxRuntime: "reactClassic"` in its
  configuration schema; it does not yet have an automatic-runtime setting. This
  does not cause problems in practice: Biome does not require a React import for
  JSX-only files, and it does not flag an unused React import as an error.
- **GGA** no longer gates commits, so it cannot conflict with Biome or
  TypeScript at commit time. `AGENTS.md` now explicitly forbids adding unused
  React imports.

## Updating these rules

If you change `biome.json`, `tsconfig.app.json`, or the pre-commit hook, run the
verification commands locally before pushing:

```bash
pnpm check
pnpm test
pnpm build
```

Do not change Biome or Tailwind config in the same PR as feature code unless the
feature itself requires that change.
