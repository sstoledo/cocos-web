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

## Tasks

T1 (S1,S2): primitive + unit test. Route: inline.
T2 (S3,S4): migrate the 17 components. Route: inline.

## Log

L1 (2026-11-08): "Vamos por tu recomendacion" — create the shared table
primitive; stage 1 = the 17 identical list tables; stage 2 (detail-page
tables: 8 `text-sm`, 4 `text-caption` inside SectionCards) deferred to a
second PR.
