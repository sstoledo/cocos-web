# F12 — Cash Closing UI + PDF (LAST UNIT — MVP completion)

## Objective
Cash closing experience: live preview of the open period, close with declared cash, history + detail views, PDF report download. Completes the MVP (25/25).

## Scope (maintainer decisions 2026-09-23)
- PDF via **jsPDF client-side** (no backend change, report design in React)
- Feature: src/features/cash-closings/ + routes + navigation (Admin+Reception only — matches B13 backend)
- Views: close page (live preview + declare + result), history list (paginated), detail (full + PDF download)

## Contract (B13, live on main @ 84dcdcf, obs #1292)
- GET /api/cash-closings/preview → { periodStart: ISO|null, expectedCash/Card/Transfer: string, salesCount: number } (nothing persisted)
- POST /api/cash-closings { declaredCash: string, notes?: string } → closing DTO (409 CLOSING_CONFLICT, 400 validation)
- GET /api/cash-closings?page&limit → { data, meta } newest first
- GET /api/cash-closings/:id → detail (404 CASH_CLOSING_NOT_FOUND)
- DTO: { id, periodStart, periodEnd, expectedCash/Card/Transfer, declaredCash, difference, salesCount, notes, createdAt, closedBy: { id, name } } — decimals as strings

## Decisions
- Money inputs: type="text" inputMode="decimal" (B10 lesson — type="number" corrupts "50.00"); display decimal strings verbatim; arithmetic via cents.ts helpers only
- Difference display: positive/negative visual distinction (green/red per theme tokens), zero = neutral
- Query keys: ['cash-closings','preview'], ['cash-closings',filters], ['cash-closings',id]; POST invalidates all three prefixes
- After successful close: show result inline (difference highlighted) + link to detail — do NOT auto-navigate away (user wants to see the outcome)
- Navigation: new entry "Cierres de caja" (Admin+Reception) + pageTitles + App.tsx routes (/cash-closings, /cash-closings/new? or close integrated — decide: close = /cash-closings/close, detail = /cash-closings/:id)
- PDF content: title "Cierre de caja", period start/end, expected by method, declared, difference, salesCount, closedBy name, notes, generated timestamp. jsPDF + autotable if already present (check deps; jspdf-autotable if table layout needs it — else plain jsPDF text layout)
- Empty states in voseo per repo convention; es-AR dates

## Tasks
- [x] F12.1 Data layer → commit adba809 on feat/f12-1-data, 811 lines (219 impl + 592 spec), 738/738 (23 new). Keys ['cash-closings','preview'|params|'detail',id]; per-feature error-map (CLOSING_CONFLICT/CASH_CLOSING_NOT_FOUND, voseo fallbacks) following F10 pattern; POST JSON w/ Content-Type. PR #92 OPEN.
- [x] F12.2 Close page → commit ff47120 on feat/f12-2-close-page, 620 lines, 759/759 (21 new). Zod schema mirroring backend regex, inputMode=decimal, inline result w/ difference (green/destructive/neutral, toCents sign — no floats), preview refetch post-close verified, 409/400 voseo errors inline. Uses PageTitle "Cierre de caja"; result links /cash-closings/:id. PR #93 OPEN.
- [x] F12.3 History list + detail + routes/nav → commit 36b8168 on feat/f12-3-history, 858 lines (11 files), 782/782 (23 new). Routes guarded Admin+Reception, nav entry IconWallet (ReadOnly/etc. excluded — Sidebar specs), difference-class-name helper extracted, a11y row-click via real link + stopPropagation, PDF button disabled w/ F12.4 insertion point. PR #94 OPEN.
- [x] F12.4 PDF report → commit d3ff60a on feat/f12-4-pdf, 424 lines, 796/796 (14 new). jsPDF@4.2.1 plain text layout (no autotable), money verbatim + signed difference via toCents (no floats), filename cierre-caja-<date>.pdf. jsPDF in LAZY chunk via dynamic import — main chunk +1.55kB only. jspdf mocked via vi.hoisted spies.

## Acceptance Criteria
- Preview panel shows live open-period totals; after close, period resets (new preview shows zeros/empty)
- declaredCash validation matches backend (>= 0, max 2 decimals); 409 conflict shows friendly error
- History paginated newest-first; detail shows all fields + difference visually
- PDF downloads with correct content from detail
- ReadOnly/Mechanic/Purchasing/Warehouse see NO nav entry and routes 403/redirect per repo guard pattern
- pnpm check / test (baseline 715) / build green per task

## Checks
- Standard TDD (cocos-web). Per-commit gate: assess tier (untracked odd/ → canonical hash flags). 4 stacked PRs, ask before merge.

## Progress
(started 2026-09-23)

## Next step
FEATURE CLOSED 2026-09-23 — chain #92→#95 merged to main @ 96c343f (3e11fa1, 9804f30, 1d024de, 96c343f), 796/796 tests green on main, zero conflicts, branches cleaned. **MVP COMPLETE 25/25.** Roadmap #16 updated.