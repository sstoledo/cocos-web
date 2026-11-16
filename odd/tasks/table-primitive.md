# Table primitive (DataTable)

Objective: extract the 28 hand-copied list-table skeletons into one shared
primitive under `src/components/ui/`, preserving visual output exactly.
Branch: `feat/data-table` (stacked on `feat/table-layout` #163).
Delivery strategy: `ask-on-risk` default; two PRs (stage 1 list tables,
stage 2 detail-page tables later).
Test runner: `pnpm test` (Vitest).

## Specs

S1: New `src/components/ui/data-table.tsx` exports `DataTable` and
  `DataTableRow`. `DataTable` renders the exact current shell:
  container `hidden overflow-x-auto rounded-lg border bg-card md:block`,
  table `w-full caption-bottom` with `text-body-sm` (default) or
  `text-caption` size variant, `thead class="bg-muted"`, header row
  `text-left`, th `h-11 px-3 text-caption font-semibold
  text-muted-foreground` plus per-column extra classes.
S2: `DataTableRow` renders tr class `h-14 border-b border-border
  transition-colors last:border-0 hover:bg-muted/50`.
S3: Migrate the 17 list-table components (BrandTable, CategoryTable,
  ClientTable, VehicleList, LotTable, PresentationTable, ProductTable,
  ProformaTable, PurchaseOrderTable, ReceiptTable, SalesTable,
  ServiceTable, StockMovementList, SupplierTable, UserTable,
  VehicleTable, WorkOrderTable) to the primitive with zero visual change
  (same classes in the compiled output).
S4: Existing tests of migrated components keep passing unmodified
  (table role, columnheader roles, row content preserved).
S5: Documented scope guard: user explicitly REJECTED table centering
  and right-aligned price values; the primitive does not introduce
  alignment or width behavior changes.

S6 (stage 2): `DataTable` gains `variant: 'card' | 'page' | 'section' |
  'detail'`. `page` = detail line-item table (`hidden overflow-x-auto
  md:block`, `bg-muted` thead, th `px-3 py-2`, row `h-12 border-b
  border-border last:border-0` without hover). `section` = table inside
  a SectionCard (`overflow-x-auto`, th `px-3 py-2 font-medium`, header
  row `border-b border-border text-left text-muted-foreground`, plain
  `border-b border-border` rows). `detail` = same container, th
  `text-left p-3 font-medium text-muted-foreground`, plain rows.
  `DataTableRow` accepts `onClick` passthrough (pointer-only row
  navigation convenience; biome-ignore lives in the primitive).
S7 (stage 2): Migrate the 12 detail/section tables (SaleDetailPage,
  PurchaseOrderDetailPage, ProformaDetailPage, WorkOrderDetailPage,
  ServiceProductsSection, WorkOrderConsumptionsSection,
  WorkOrderPaymentsSection, BrandDetailPage, CategoryDetailPage,
  SupplierDetailPage ×2, CashClosingsListPage) to the primitive with
  zero visual change: same classes reach the DOM. S5 alignment guard
  applies to stage 2 as well (body price cells stay left-aligned).
S8 (stage 2): Primitive tests cover the variant matrix (container,
  thead, th, row classes per variant; onClick passthrough); existing
  feature tests keep passing unmodified.

## Tasks

T1 (S1,S2): primitive + unit test. Route: inline.
  Commit: `a3e4a50` (merged as PR #164, squash).
T2 (S3,S4): migrate the 17 components. Route: inline.
  Commit: `a3e4a50` (same squash merge as PR #164).
T3 (S6): extend primitive with `page`/`section`/`detail` variants and
  `DataTableRow onClick` passthrough (16 variant tests, RED→GREEN).
  Route: inline. Commit: `ce15277`.
T4 (S7,S8): migrate the 12 detail/section tables across 11 files with
  zero visual change (3 sub-skeletons: page/section/detail; manual
  migrations for ServiceProductsSection conditional headers,
  SupplierDetailPage ×2 tables with `border-border/50` rows,
  CashClosingsListPage clickable card rows). Route: inline.
  Full suite 309 files / 1539 tests green; lint + tsc clean.
  Commit: stage-2 migration commit.

## Log

L1 (2026-11-08): "Vamos por tu recomendacion" — create the shared table
primitive; stage 1 = the 17 identical list tables; stage 2 (detail-page
tables: 8 `text-sm`, 4 `text-caption` inside SectionCards) deferred to a
second PR.

L2 (2026-11-15): Stage 1 + stage 2 merged together as PR #164 (squash,
  main at `a3e4a50`). New branch `feat/detail-tables` off `main` for the
  detail/section migration.
L3 (2026-11-15): Stage-2 variants implemented TDD: 16 primitive tests
  observed RED, then GREEN (`ce15277`). Script migration over 11 files
  fixed mechanical defects along the way (stray `>>` row tags,
  duplicated `return (<>`); CashClosings rows are clickable via the new
  `onClick` passthrough with the a11y ignore centralized in the
  primitive.
L4 (2026-11-15): Runtime note: `gentle-ai review assess` returns
  unassessable in this OpenCode runtime - commits treated as due,
  ordinary checks stand; RDD left untouched. Next: submit stacked PR,
  assign user, watch CI. Visual browser verification still pending
  (user dev stack was down); structural equivalence verified by
  class-copy + full suite.

L5 (2026-11-15): Visual verification done in a real browser (vite dev +
  backend + postgres up, Playwright login as admin, desktop 1440px) over
  all 9 pages hosting migrated tables: list card shells, page/section/
  detail containers, theads, th and row classes match the original
  skeletons, including work-order list `h-[60px]` override and sale
  detail `h-14` row. Found and fixed one real regression: the four
  page-variant detail tables rendered rows as card (h-14 + hover)
  because `DataTableRow` lacked `variant="page"` - fixed in PR #167 with
  a PurchaseOrderDetailPage regression test (RED->GREEN, 49/49). DOM
  classes re-verified after the fix. Cash closings had no data locally:
  card classes verified by DOM probe; onClick pinned by primitive test.
