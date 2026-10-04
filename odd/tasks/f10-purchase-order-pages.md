# F10 — Purchase Order Pages (cocos-web)

## Objective
Build the complete purchase-orders frontend (list / detail / create-edit / receive) on top of the shipped B10 backend.

## Problem / Why
B10 backend is live on main (7 endpoints, COM- numbering, partial receiving, RBAC). The frontend only has a placeholder list page. Users cannot create, confirm, receive, or cancel purchase orders from the UI.

## Scope (authorized)
- IN: `src/features/purchase-orders/` full feature (types, api, hooks, schemas, error map, components, 4 pages), routes + page titles wiring, tests per repo rule.
- OUT: backend changes, supplier CRUD pages, lot detail page (received lots shown as text — no link target exists), PDF/print, notifications.

## Binding decisions
- Receive UX: **dedicated page** `/purchase-orders/:id/receive` (precedent: `/sales/new`).
- Create + edit-draft share ONE form page (`/purchase-orders/new` + `/purchase-orders/:id/edit`, draft-only edit, full-replace semantics from B10).
- Roles: list/detail visible to Admin+Purchasing+Warehouse; create/update/order/cancel = Admin+Purchasing; receive = Admin+Purchasing+Warehouse (mirrors backend).
- Reuse patterns verbatim from sales: api file-per-endpoint + parseApiError, thin RQ hooks, URL-driven filters (useSearchParams), status badge, window.confirm actions with prefix invalidation, error-map lib, cents.ts money.
- Suppliers/products selectors: plain `Select` with existing hooks (`lots/hooks/use-suppliers`, `products/hooks/use-products`) — no combobox.
- Inline `role="alert"` error blocks (no Sonner).

## Constraints / config
- TDD mode: **standard** (cocos-web, no strict TDD) — source: session/project config from sdd-init cache. Runner: `pnpm test`.
- Per-task checks: `pnpm check` + focused `pnpm test`; final gate adds `pnpm build`.
- Delivery: chained PRs, stacked-to-main, ~400 authored lines per task (advisory), size:exception asked when a coherent slice overruns. RDD: **OFF** (user-disabled 2026-09-23) — no review preflights.
- Toolchain: nvm Node 22 prefix mandatory. Remote: sstoledo/cocos-web. No labels / no linked issues on PRs.

## Tasks
- [x] F10.1 Data layer — types.ts, 7 api files, error-messages lib (11 codes), zod schema → commit 0e17b38 on feat/f10-1-data-layer, 647 lines, 44 new tests (610 total green). Independent verifier: VERIFIED (6/6 contract claims vs real backend DTOs, 11/11 error codes mapped, no fabrications)
- [x] F10.2 Hooks — 7 thin RQ wrappers → commit 90a1523 on feat/f10-1-data-layer, ~875 lines, 15 hook tests (625 total green). Writer died to kimi quota mid-flight; work salvaged uncommitted, verified, committed by orchestrator. Verifier VERIFIED + gap found: receive/cancel hook tests missing → closed inline (5 tests added). Stray-edit check clean.
- [x] F10.3 List page — table + filters + badge + placeholder replaced + 11 tests → commit 80799f5 on feat/f10-2-list-page, 593 lines, 636 green. PR #82 OPEN (base feat/f10-1b-hooks). First writer died mid-task (quota), resumed writer verified components on-pattern + fixed biome + wrote tests. Money rendered verbatim (cents.ts is arithmetic-only).
- [x] F10.4 Detail page — lines + receipt history + role-gated order/cancel/edit/receive actions + 23 tests → commit 3beface on feat/f10-3-detail-page, 881 lines (295 src), 659 green. window.confirm dismiss-never-fires tested.
- [x] F10.5 Create/edit form — one page two modes (create + draft-edit full-replace), field array, blocked state non-draft → commit 15db5c3 on feat/f10-4-form-page, 985 lines (451 page + 534 tests), 672 green, 13 tests. PR #84 OPEN. Cost input type="text" inputMode="decimal" (NOT number — corrupts "50.00"→"50"). Money math via toCents/formatCents.
- [x] F10.6 Receive page — dedicated page, per-line qty/date/cost field array, remaining computed, blocked states, overshoot 409 resync → commit 6b90d9a on feat/f10-5-receive-page, 690 lines (331 page + 359 tests), 683 green, 11 tests. Dynamic max per line via memoized buildReceiveSchema superRefine.
- [x] F10.7 Wiring + gate — routes with role gates (list/detail: Admin+Purchasing+Warehouse; new/edit: Admin+Purchasing; receive: all three) + page titles → commit 14d5aab on feat/f10-6-wiring, 30 lines, 683 green, check+build green. PR #86 OPEN.

## PR forecast (stacked-to-main) — ACTUAL
- PR #80: F10.1a data layer (647, exception) — OPEN
- PR #81: F10.1b hooks (~875, exception) — OPEN
- PR #82: F10.3 list (603, exception) — OPEN
- PR #83: F10.4 detail (881, exception) — OPEN
- PR #84: F10.5 form (985, exception) — OPEN
- PR #85: F10.6 receive (690, exception) — OPEN
- PR #86: F10.7 wiring (30) — OPEN

## Acceptance criteria
- All 7 backend endpoints consumed with correct contracts (no-body PATCH for order/cancel, receive returns lotIds).
- Role gating matches backend matrix (UI hides/blocks, backend enforces).
- pnpm check/test/build green on every work-unit commit.

## Progress
- 2026-09-23: Exploration done (map: reuse sales patterns; no lot detail page; suppliers/products hooks exist). Receive UX decided: dedicated page. Document created.
- 2026-09-23: **F10.1 done** — 0e17b38, 647 lines, 44 new tests, 610/610 green, verifier VERIFIED. **REAL backend contract (verified, use these in ALL later tasks):** field is `purchaseOrderNumber` (not number) in response + list query param; create lines use `quantityOrdered`; receive lines use `lineId`; no `receiptCount` in responses; response embeds `supplier:{id,name}` + `notes`; receive returns PO with `lotIds` populated; not-found code is `PURCHASE_ORDER_NOT_FOUND`; service also emits SUPPLIER_NOT_FOUND + PRODUCT_NOT_FOUND; money fields are decimal strings; receipts only present in detail (findOne).

## Next step
FEATURE CLOSED 2026-09-23 — chain #80→#86 merged to main @ f058522 (28a2c90, ea6bba0, fe505e5, c03fff0, 71a266f, 5675ab5, f058522), 683/683 tests green on main, zero rebase conflicts, branches cleaned. Roadmap #16 updated.
