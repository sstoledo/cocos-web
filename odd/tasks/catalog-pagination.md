# Feature: Catalog Pagination (frontend)

## Objective

Wire `page`/`limit` pagination from the backend into every catalog list screen so
users can navigate large catalog tables instead of seeing only the first page.

## Problem

The backend already answers `{ data, meta: { page, limit, total } }` with
`page`/`limit`/`q` filters for every catalog module (verified: `List*QueryDto`
exists for brands, categories, lots, presentations, products, suppliers and
services). The frontend does not use it:

- `get-<feature>.ts` sends only `q` (and `isActive` where applicable), never
  `page`/`limit`.
- `*ListPage` does not render `<Pagination>`; it renders the whole first page
  with no way to move on. `*ListMeta` already declares `page/limit/total`.

Net effect: the API work is dead code from the UI's point of view.

## Why

Large catalogs (products, suppliers, services) will not fit one page. Shipping
the backend contract without the UI leaves an obvious gap between the two.

## Scope

In scope:

- Send `page`/`limit` from the 7 catalog list APIs.
- Read `page` from the URL search params in each list page.
- Render `<Pagination>` with a page-change handler that resets to page 1 when
  filters change.
- Update/extend the co-located API tests.

Out of scope:

- Changing the backend contract.
- Changing `<Pagination>` itself (it requires `meta.totalPages`; the backend
  meta has no `totalPages`, so the page computes it).
- Migrating `window.confirm` to a dialog (separate pending item).
- Adopting Sonner toasts for mutations (separate pending item).

## Constraints

- TDD: RED (failing test) before implementation for each API change.
- Frontend runner: `pnpm test` (Vitest). Checks: `pnpm check` (Biome).
- API calls stay in `src/features/<feature>/api/`; never fetch from components.
- Keep `window.confirm` behaviour as-is (do not touch it in this feature).
- Use the existing `<Pagination meta={...} onPageChange={...} />` API.

## Acceptance criteria

- Each catalog list request carries `page` and `limit` query params when set.
- Each catalog list page renders `<Pagination>` when `meta.total > 0`.
- Changing filters resets the page to 1.
- `pnpm test` and `pnpm check` pass.

## Tasks

- [ ] T1 Shared helper: `toPaginationMeta(meta)` → `{ page, total, totalPages }`
      (+ unit test) so 7 pages do not repeat `Math.ceil(total / limit)`.
- [ ] T2 brands: `get-brands` sends `page`/`limit`, `BrandListPage` renders
      `<Pagination>` (+ API test update).
- [ ] T3 categories: same as T2.
- [ ] T4 presentations: same as T2.
- [ ] T5 products: same as T2 (keep `isActive`).
- [ ] T6 suppliers: same as T2 (keep `isActive`).
- [ ] T7 services: same as T2 (keep `isActive`).
- [ ] T8 lots: same as T2.
- [ ] T9 Full verification: `pnpm test`, `pnpm check`, `pnpm build`.

## Delivery strategy

- Forecast: ~350 authored changed lines (7 features × ~35 + helper + tests).
  Borderline with the 400-line advisory budget; keep one PR if it stays under,
  otherwise ask before splitting (`ask-on-risk`).

## Progress

- Not started.
