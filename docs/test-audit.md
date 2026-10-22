# Test Audit — cocos-web (Phase 0)

> Read-only inventory produced by Phase 0 of the Cocos testing portfolio (`proyectotesting.md`).
> Executed 2026-10-21 on branch `test/test-inventory-audit`.
> **Policy: nothing was modified or deleted in this phase.** MIGRATE execution happens in Phase 4
> (OpenAPI-generated contract types replace the hand-mirrored DTO assertions).

## Baseline (observed)

| Layer | Command | Result |
|---|---|---|
| Unit + component + hooks (Vitest) | `pnpm test` | **283 files · 1379/1379 pass** |

No failing tests at baseline.

## Method note

Classification follows the homogeneous per-directory structure verified feature-by-feature during
exploration (three sibling features compared per pattern; per-file spot reads for anything atypical).
The same rule is then applied deterministically to all 283 files so that every file is bucketed exactly once.
No DELETE candidates were found: no spec asserts only mock-call arguments, and no exact near-duplicates exist.
API-layer specs are the one systematic MIGRATE class: they duplicate fetch-mock plumbing already present in
sibling hook tests and hand-mirror DTO shapes that Phase 4 contract tests will own.

## Summary

| Bucket | Count |
|---|---|
| KEEP | 230 |
| MIGRATE | 53 (all `features/*/api/*.test.ts`) |
| DELETE | 0 |
| Total | 283 |

## Inventory

| Path | Bucket | Reason | Exec phase |
|---|---|---|---|
| `src/App.test.tsx` | KEEP | app shell render smoke test | — |
| `src/components/ui/AsyncCombobox.test.tsx` | KEEP | render/variant/gating | — |
| `src/components/ui/Button.test.tsx` | KEEP | render/variant/gating | — |
| `src/components/ui/ConfirmDialog.test.tsx` | KEEP | render/variant/gating | — |
| `src/components/ui/Label.test.tsx` | KEEP | render/variant/gating | — |
| `src/components/ui/PageContent.test.tsx` | KEEP | render/variant/gating | — |
| `src/components/ui/PageHeader.test.tsx` | KEEP | render/variant/gating | — |
| `src/components/ui/PageTitle.test.tsx` | KEEP | render/variant/gating | — |
| `src/components/ui/Pagination.test.tsx` | KEEP | render/variant/gating | — |
| `src/components/ui/SectionCard.test.tsx` | KEEP | render/variant/gating | — |
| `src/components/ui/Select.test.tsx` | KEEP | render/variant/gating | — |
| `src/components/ui/StatCard.test.tsx` | KEEP | render/variant/gating | — |
| `src/components/ui/Switch.test.tsx` | KEEP | render/variant/gating | — |
| `src/components/ui/Textarea.test.tsx` | KEEP | render/variant/gating | — |
| `src/features/auth/components/Logo.test.tsx` | KEEP | render/variant/gating | — |
| `src/features/auth/hooks/useAuth.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/auth/hooks/useLogin.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/auth/hooks/useRegister.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/auth/hooks/useResetPassword.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/auth/pages/AuthLayout.test.tsx` | KEEP | page render/gating | — |
| `src/features/auth/pages/LoginPage.test.tsx` | KEEP | page render/gating | — |
| `src/features/auth/pages/RegisterPage.test.tsx` | KEEP | page render/gating | — |
| `src/features/auth/pages/ResetPasswordPage.test.tsx` | KEEP | page render/gating | — |
| `src/features/brands/api/create-brand.test.ts` | MIGRATE | hand-mirrors backend DTOs; contract value belongs to generated-type contract tests | Phase 4 |
| `src/features/brands/api/delete-brand.test.ts` | MIGRATE | hand-mirrors backend DTOs; contract value belongs to generated-type contract tests | Phase 4 |
| `src/features/brands/api/get-brand.test.ts` | MIGRATE | hand-mirrors backend DTOs; contract value belongs to generated-type contract tests | Phase 4 |
| `src/features/brands/api/get-brands.test.ts` | MIGRATE | hand-mirrors backend DTOs; contract value belongs to generated-type contract tests | Phase 4 |
| `src/features/brands/api/update-brand.test.ts` | MIGRATE | hand-mirrors backend DTOs; contract value belongs to generated-type contract tests | Phase 4 |
| `src/features/brands/components/BrandFilters.test.tsx` | KEEP | render/variant/gating | — |
| `src/features/brands/components/BrandForm.test.tsx` | KEEP | render/variant/gating | — |
| `src/features/brands/components/BrandTable.test.tsx` | KEEP | render/variant/gating | — |
| `src/features/brands/hooks/use-brand.test.tsx` | KEEP | hook logic with light fetch mocks | — |
| `src/features/brands/hooks/use-brands.test.tsx` | KEEP | hook logic with light fetch mocks | — |
| `src/features/brands/hooks/use-create-brand.test.tsx` | KEEP | hook logic with light fetch mocks | — |
| `src/features/brands/hooks/use-delete-brand.test.tsx` | KEEP | hook logic with light fetch mocks | — |
| `src/features/brands/hooks/use-update-brand.test.tsx` | KEEP | hook logic with light fetch mocks | — |
| `src/features/brands/pages/BrandDetailPage.test.tsx` | KEEP | page render/gating | — |
| `src/features/brands/pages/BrandFormPage.test.tsx` | KEEP | page render/gating | — |
| `src/features/brands/pages/BrandListPage.test.tsx` | KEEP | page render/gating | — |
| `src/features/brands/schemas/brand-schema.test.ts` | KEEP | Zod form/product validation | — |
| `src/features/cash-closings/hooks/use-cash-closing.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/cash-closings/hooks/use-cash-closings.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/cash-closings/hooks/use-closing-preview.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/cash-closings/hooks/use-create-cash-closing.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/cash-closings/lib/cash-closing-error-messages.test.ts` | KEEP | pure function tests | — |
| `src/features/cash-closings/lib/cash-closing-pdf.test.ts` | KEEP | pure function tests | — |
| `src/features/cash-closings/pages/CashClosingDetailPage.test.tsx` | KEEP | page render/gating | — |
| `src/features/cash-closings/pages/CashClosingsListPage.test.tsx` | KEEP | page render/gating | — |
| `src/features/cash-closings/pages/CloseCashClosingPage.test.tsx` | KEEP | page render/gating | — |
| `src/features/cash-closings/schemas/cash-closing-schema.test.ts` | KEEP | Zod form/product validation | — |
| `src/features/categories/api/create-category.test.ts` | MIGRATE | hand-mirrors backend DTOs; contract value belongs to generated-type contract tests | Phase 4 |
| `src/features/categories/api/delete-category.test.ts` | MIGRATE | hand-mirrors backend DTOs; contract value belongs to generated-type contract tests | Phase 4 |
| `src/features/categories/api/get-categories.test.ts` | MIGRATE | hand-mirrors backend DTOs; contract value belongs to generated-type contract tests | Phase 4 |
| `src/features/categories/api/get-category.test.ts` | MIGRATE | hand-mirrors backend DTOs; contract value belongs to generated-type contract tests | Phase 4 |
| `src/features/categories/api/update-category.test.ts` | MIGRATE | hand-mirrors backend DTOs; contract value belongs to generated-type contract tests | Phase 4 |
| `src/features/categories/components/CategoryFilters.test.tsx` | KEEP | render/variant/gating | — |
| `src/features/categories/components/CategoryForm.test.tsx` | KEEP | render/variant/gating | — |
| `src/features/categories/components/CategoryTable.test.tsx` | KEEP | render/variant/gating | — |
| `src/features/categories/hooks/use-categories.test.tsx` | KEEP | hook logic with light fetch mocks | — |
| `src/features/categories/hooks/use-category.test.tsx` | KEEP | hook logic with light fetch mocks | — |
| `src/features/categories/hooks/use-create-category.test.tsx` | KEEP | hook logic with light fetch mocks | — |
| `src/features/categories/hooks/use-delete-category.test.tsx` | KEEP | hook logic with light fetch mocks | — |
| `src/features/categories/hooks/use-update-category.test.tsx` | KEEP | hook logic with light fetch mocks | — |
| `src/features/categories/pages/CategoryDetailPage.test.tsx` | KEEP | page render/gating | — |
| `src/features/categories/pages/CategoryFormPage.test.tsx` | KEEP | page render/gating | — |
| `src/features/categories/pages/CategoryListPage.test.tsx` | KEEP | page render/gating | — |
| `src/features/categories/schemas/category-schema.test.ts` | KEEP | Zod form/product validation | — |
| `src/features/clients/api/create-client.test.ts` | MIGRATE | hand-mirrors backend DTOs; contract value belongs to generated-type contract tests | Phase 4 |
| `src/features/clients/api/create-vehicle.test.ts` | MIGRATE | hand-mirrors backend DTOs; contract value belongs to generated-type contract tests | Phase 4 |
| `src/features/clients/api/delete-client.test.ts` | MIGRATE | hand-mirrors backend DTOs; contract value belongs to generated-type contract tests | Phase 4 |
| `src/features/clients/api/delete-vehicle.test.ts` | MIGRATE | hand-mirrors backend DTOs; contract value belongs to generated-type contract tests | Phase 4 |
| `src/features/clients/api/get-client.test.ts` | MIGRATE | hand-mirrors backend DTOs; contract value belongs to generated-type contract tests | Phase 4 |
| `src/features/clients/api/get-clients.test.ts` | MIGRATE | hand-mirrors backend DTOs; contract value belongs to generated-type contract tests | Phase 4 |
| `src/features/clients/api/get-vehicles.test.ts` | MIGRATE | hand-mirrors backend DTOs; contract value belongs to generated-type contract tests | Phase 4 |
| `src/features/clients/api/update-client.test.ts` | MIGRATE | hand-mirrors backend DTOs; contract value belongs to generated-type contract tests | Phase 4 |
| `src/features/clients/api/update-vehicle.test.ts` | MIGRATE | hand-mirrors backend DTOs; contract value belongs to generated-type contract tests | Phase 4 |
| `src/features/clients/components/ClientForm.test.tsx` | KEEP | render/variant/gating | — |
| `src/features/clients/components/ClientTable.test.tsx` | KEEP | render/variant/gating | — |
| `src/features/clients/components/VehicleForm.test.tsx` | KEEP | render/variant/gating | — |
| `src/features/clients/components/VehicleList.test.tsx` | KEEP | render/variant/gating | — |
| `src/features/clients/hooks/use-client-search.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/clients/hooks/use-client.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/clients/hooks/use-clients.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/clients/hooks/use-create-client.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/clients/hooks/use-create-vehicle.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/clients/hooks/use-delete-client.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/clients/hooks/use-delete-vehicle.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/clients/hooks/use-update-client.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/clients/hooks/use-update-vehicle.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/clients/hooks/use-vehicles.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/clients/pages/ClientDetailPage.test.tsx` | KEEP | page render/gating | — |
| `src/features/clients/pages/ClientFormPage.test.tsx` | KEEP | page render/gating | — |
| `src/features/clients/pages/ClientListPage.test.tsx` | KEEP | page render/gating | — |
| `src/features/clients/schemas/client-schema.test.ts` | KEEP | Zod form/product validation | — |
| `src/features/clients/schemas/vehicle-schema.test.ts` | KEEP | Zod form/product validation | — |
| `src/features/dashboard/hooks/use-dashboard-summary.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/dashboard/pages/DashboardPage.test.tsx` | KEEP | page render/gating | — |
| `src/features/employees/api/get-employees.test.ts` | MIGRATE | hand-mirrors backend DTOs; contract value belongs to generated-type contract tests | Phase 4 |
| `src/features/employees/hooks/use-employees.test.tsx` | KEEP | hook logic with light fetch mocks | — |
| `src/features/lots/api/get-lots.test.ts` | MIGRATE | hand-mirrors backend DTOs; contract value belongs to generated-type contract tests | Phase 4 |
| `src/features/lots/components/LotForm.test.tsx` | KEEP | render/variant/gating | — |
| `src/features/lots/hooks/use-create-lot.test.tsx` | KEEP | hook logic with light fetch mocks | — |
| `src/features/lots/hooks/use-lots.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/lots/pages/LotFormPage.test.tsx` | KEEP | page render/gating | — |
| `src/features/lots/pages/LotListPage.test.tsx` | KEEP | page render/gating | — |
| `src/features/notifications/hooks/use-mark-all-notifications-read.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/notifications/hooks/use-mark-notification-read.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/notifications/hooks/use-notifications.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/notifications/hooks/use-unread-notifications-count.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/notifications/pages/NotificationListPage.test.tsx` | KEEP | page render/gating | — |
| `src/features/presentations/api/create-presentation.test.ts` | MIGRATE | hand-mirrors backend DTOs; contract value belongs to generated-type contract tests | Phase 4 |
| `src/features/presentations/api/delete-presentation.test.ts` | MIGRATE | hand-mirrors backend DTOs; contract value belongs to generated-type contract tests | Phase 4 |
| `src/features/presentations/api/get-presentation.test.ts` | MIGRATE | hand-mirrors backend DTOs; contract value belongs to generated-type contract tests | Phase 4 |
| `src/features/presentations/api/get-presentations.test.ts` | MIGRATE | hand-mirrors backend DTOs; contract value belongs to generated-type contract tests | Phase 4 |
| `src/features/presentations/api/update-presentation.test.ts` | MIGRATE | hand-mirrors backend DTOs; contract value belongs to generated-type contract tests | Phase 4 |
| `src/features/presentations/components/PresentationFilters.test.tsx` | KEEP | render/variant/gating | — |
| `src/features/presentations/components/PresentationForm.test.tsx` | KEEP | render/variant/gating | — |
| `src/features/presentations/components/PresentationTable.test.tsx` | KEEP | render/variant/gating | — |
| `src/features/presentations/hooks/use-create-presentation.test.tsx` | KEEP | hook logic with light fetch mocks | — |
| `src/features/presentations/hooks/use-delete-presentation.test.tsx` | KEEP | hook logic with light fetch mocks | — |
| `src/features/presentations/hooks/use-presentation.test.tsx` | KEEP | hook logic with light fetch mocks | — |
| `src/features/presentations/hooks/use-presentations.test.tsx` | KEEP | hook logic with light fetch mocks | — |
| `src/features/presentations/hooks/use-update-presentation.test.tsx` | KEEP | hook logic with light fetch mocks | — |
| `src/features/presentations/pages/PresentationFormPage.test.tsx` | KEEP | page render/gating | — |
| `src/features/presentations/pages/PresentationListPage.test.tsx` | KEEP | page render/gating | — |
| `src/features/presentations/schemas/presentation-schema.test.ts` | KEEP | Zod form/product validation | — |
| `src/features/products/api/get-products.test.ts` | MIGRATE | hand-mirrors backend DTOs; contract value belongs to generated-type contract tests | Phase 4 |
| `src/features/products/components/ProductForm.test.tsx` | KEEP | render/variant/gating | — |
| `src/features/products/components/ProductImageUpload.test.tsx` | KEEP | render/variant/gating | — |
| `src/features/products/components/ProductTable.test.tsx` | KEEP | render/variant/gating | — |
| `src/features/products/hooks/use-create-product.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/products/hooks/use-product-references.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/products/hooks/use-product-search.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/products/hooks/use-product.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/products/hooks/use-products.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/products/hooks/use-remove-product-image.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/products/hooks/use-update-product.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/products/pages/ProductDetailPage.test.tsx` | KEEP | page render/gating | — |
| `src/features/products/pages/ProductFormPage.test.tsx` | KEEP | page render/gating | — |
| `src/features/products/pages/ProductListPage.test.tsx` | KEEP | page render/gating | — |
| `src/features/purchase-orders/components/PurchaseOrderActions.test.tsx` | KEEP | render/variant/gating | — |
| `src/features/purchase-orders/hooks/use-cancel-purchase-order.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/purchase-orders/hooks/use-create-purchase-order.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/purchase-orders/hooks/use-order-purchase-order.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/purchase-orders/hooks/use-purchase-order.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/purchase-orders/hooks/use-purchase-orders.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/purchase-orders/hooks/use-receive-purchase-order.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/purchase-orders/hooks/use-update-purchase-order.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/purchase-orders/lib/purchase-order-error-messages.test.ts` | KEEP | pure function tests | — |
| `src/features/purchase-orders/pages/PurchaseOrderDetailPage.test.tsx` | KEEP | page render/gating | — |
| `src/features/purchase-orders/pages/PurchaseOrderFormPage.test.tsx` | KEEP | page render/gating | — |
| `src/features/purchase-orders/pages/PurchaseOrderListPage.test.tsx` | KEEP | page render/gating | — |
| `src/features/purchase-orders/pages/PurchaseOrderReceivePage.test.tsx` | KEEP | page render/gating | — |
| `src/features/purchase-orders/schemas/purchase-order-schema.test.ts` | KEEP | Zod form/product validation | — |
| `src/features/refunds/pages/RefundPage.test.tsx` | KEEP | page render/gating | — |
| `src/features/sales/api/cancel-sale.test.ts` | MIGRATE | hand-mirrors backend DTOs; contract value belongs to generated-type contract tests | Phase 4 |
| `src/features/sales/api/create-sale.test.ts` | MIGRATE | hand-mirrors backend DTOs; contract value belongs to generated-type contract tests | Phase 4 |
| `src/features/sales/api/get-sale.test.ts` | MIGRATE | hand-mirrors backend DTOs; contract value belongs to generated-type contract tests | Phase 4 |
| `src/features/sales/api/get-sales.test.ts` | MIGRATE | hand-mirrors backend DTOs; contract value belongs to generated-type contract tests | Phase 4 |
| `src/features/sales/components/CheckoutForm.test.tsx` | KEEP | render/variant/gating | — |
| `src/features/sales/components/PaymentMethodBadge.test.tsx` | KEEP | render/variant/gating | — |
| `src/features/sales/components/SaleCancelAction.test.tsx` | KEEP | render/variant/gating | — |
| `src/features/sales/components/SaleStatusBadge.test.tsx` | KEEP | render/variant/gating | — |
| `src/features/sales/components/SalesTable.test.tsx` | KEEP | render/variant/gating | — |
| `src/features/sales/hooks/use-cancel-sale.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/sales/hooks/use-create-sale.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/sales/hooks/use-sale.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/sales/hooks/use-sales.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/sales/lib/sales-error-messages.test.ts` | KEEP | pure function tests | — |
| `src/features/sales/pages/CheckoutPage.test.tsx` | KEEP | page render/gating | — |
| `src/features/sales/pages/SaleDetailPage.test.tsx` | KEEP | page render/gating | — |
| `src/features/sales/pages/SalesListPage.test.tsx` | KEEP | page render/gating | — |
| `src/features/sales/schemas/sale-schema.test.ts` | KEEP | Zod form/product validation | — |
| `src/features/services/api/create-service.test.ts` | MIGRATE | hand-mirrors backend DTOs; contract value belongs to generated-type contract tests | Phase 4 |
| `src/features/services/api/get-service.test.ts` | MIGRATE | hand-mirrors backend DTOs; contract value belongs to generated-type contract tests | Phase 4 |
| `src/features/services/api/get-services.test.ts` | MIGRATE | hand-mirrors backend DTOs; contract value belongs to generated-type contract tests | Phase 4 |
| `src/features/services/api/update-service.test.ts` | MIGRATE | hand-mirrors backend DTOs; contract value belongs to generated-type contract tests | Phase 4 |
| `src/features/services/components/ServiceForm.test.tsx` | KEEP | render/variant/gating | — |
| `src/features/services/components/ServiceProductsSection.test.tsx` | KEEP | render/variant/gating | — |
| `src/features/services/components/ServiceTable.test.tsx` | KEEP | render/variant/gating | — |
| `src/features/services/hooks/use-create-service.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/services/hooks/use-delete-service.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/services/hooks/use-service-products.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/services/hooks/use-service-search.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/services/hooks/use-service.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/services/hooks/use-services.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/services/hooks/use-update-service.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/services/pages/ServiceDetailPage.test.tsx` | KEEP | page render/gating | — |
| `src/features/services/pages/ServiceFormPage.test.tsx` | KEEP | page render/gating | — |
| `src/features/services/pages/ServiceListPage.test.tsx` | KEEP | page render/gating | — |
| `src/features/services/schemas/service-product-schema.test.ts` | KEEP | Zod form/product validation | — |
| `src/features/services/schemas/service-schema.test.ts` | KEEP | Zod form/product validation | — |
| `src/features/shell/components/Drawer.test.tsx` | KEEP | render/variant/gating | — |
| `src/features/shell/components/Header.test.tsx` | KEEP | render/variant/gating | — |
| `src/features/shell/components/NotificationBell.test.tsx` | KEEP | render/variant/gating | — |
| `src/features/shell/components/RoleBasedIndex.test.tsx` | KEEP | render/variant/gating | — |
| `src/features/shell/components/RouteGuard.test.tsx` | KEEP | render/variant/gating | — |
| `src/features/shell/components/Sidebar.test.tsx` | KEEP | render/variant/gating | — |
| `src/features/shell/components/ThemeToggle.test.tsx` | KEEP | render/variant/gating | — |
| `src/features/shell/components/UserMenu.test.tsx` | KEEP | render/variant/gating | — |
| `src/features/shell/hooks/useLogout.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/shell/hooks/useUser.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/shell/lib/defaultRoute.test.ts` | KEEP | pure function tests | — |
| `src/features/shell/lib/navigation.test.ts` | KEEP | pure function tests | — |
| `src/features/shell/lib/pageTitles.test.ts` | KEEP | pure function tests | — |
| `src/features/shell/pages/Layout.test.tsx` | KEEP | page render/gating | — |
| `src/features/stock/hooks/use-create-stock-movement.test.tsx` | KEEP | hook logic with light fetch mocks | — |
| `src/features/stock/hooks/use-open-containers.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/stock/pages/ProductStockPage.test.tsx` | KEEP | page render/gating | — |
| `src/features/suppliers/api/create-supplier.test.ts` | MIGRATE | hand-mirrors backend DTOs; contract value belongs to generated-type contract tests | Phase 4 |
| `src/features/suppliers/api/delete-supplier.test.ts` | MIGRATE | hand-mirrors backend DTOs; contract value belongs to generated-type contract tests | Phase 4 |
| `src/features/suppliers/api/get-supplier.test.ts` | MIGRATE | hand-mirrors backend DTOs; contract value belongs to generated-type contract tests | Phase 4 |
| `src/features/suppliers/api/get-suppliers.test.ts` | MIGRATE | hand-mirrors backend DTOs; contract value belongs to generated-type contract tests | Phase 4 |
| `src/features/suppliers/api/update-supplier.test.ts` | MIGRATE | hand-mirrors backend DTOs; contract value belongs to generated-type contract tests | Phase 4 |
| `src/features/suppliers/components/SupplierFilters.test.tsx` | KEEP | render/variant/gating | — |
| `src/features/suppliers/components/SupplierForm.test.tsx` | KEEP | render/variant/gating | — |
| `src/features/suppliers/components/SupplierStatusBadge.test.tsx` | KEEP | render/variant/gating | — |
| `src/features/suppliers/components/SupplierTable.test.tsx` | KEEP | render/variant/gating | — |
| `src/features/suppliers/hooks/use-create-supplier.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/suppliers/hooks/use-delete-supplier.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/suppliers/hooks/use-supplier-search.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/suppliers/hooks/use-supplier.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/suppliers/hooks/use-suppliers.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/suppliers/hooks/use-update-supplier.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/suppliers/pages/SupplierDetailPage.test.tsx` | KEEP | page render/gating | — |
| `src/features/suppliers/pages/SupplierFormPage.test.tsx` | KEEP | page render/gating | — |
| `src/features/suppliers/pages/SupplierListPage.test.tsx` | KEEP | page render/gating | — |
| `src/features/suppliers/schemas/supplier-schema.test.ts` | KEEP | Zod form/product validation | — |
| `src/features/users/api/assign-role.test.ts` | MIGRATE | hand-mirrors backend DTOs; contract value belongs to generated-type contract tests | Phase 4 |
| `src/features/users/api/create-user.test.ts` | MIGRATE | hand-mirrors backend DTOs; contract value belongs to generated-type contract tests | Phase 4 |
| `src/features/users/api/delete-user.test.ts` | MIGRATE | hand-mirrors backend DTOs; contract value belongs to generated-type contract tests | Phase 4 |
| `src/features/users/api/get-users.test.ts` | MIGRATE | hand-mirrors backend DTOs; contract value belongs to generated-type contract tests | Phase 4 |
| `src/features/users/api/update-user.test.ts` | MIGRATE | hand-mirrors backend DTOs; contract value belongs to generated-type contract tests | Phase 4 |
| `src/features/users/components/UserForm.test.tsx` | KEEP | render/variant/gating | — |
| `src/features/users/hooks/use-assign-role.test.tsx` | KEEP | hook logic with light fetch mocks | — |
| `src/features/users/hooks/use-create-user.test.tsx` | KEEP | hook logic with light fetch mocks | — |
| `src/features/users/hooks/use-delete-user.test.tsx` | KEEP | hook logic with light fetch mocks | — |
| `src/features/users/hooks/use-update-user.test.tsx` | KEEP | hook logic with light fetch mocks | — |
| `src/features/users/pages/UserDetailPage.test.tsx` | KEEP | page render/gating | — |
| `src/features/users/pages/UserListPage.test.tsx` | KEEP | page render/gating | — |
| `src/features/users/schemas/user-schema.test.ts` | KEEP | Zod form/product validation | — |
| `src/features/users/schemas/user-update-schema.test.ts` | KEEP | Zod form/product validation | — |
| `src/features/vehicles/components/VehicleTable.test.tsx` | KEEP | render/variant/gating | — |
| `src/features/vehicles/hooks/use-create-vehicle.test.tsx` | KEEP | hook logic with light fetch mocks | — |
| `src/features/vehicles/hooks/use-delete-vehicle.test.tsx` | KEEP | hook logic with light fetch mocks | — |
| `src/features/vehicles/hooks/use-update-vehicle.test.tsx` | KEEP | hook logic with light fetch mocks | — |
| `src/features/vehicles/schemas/vehicle-schema.test.ts` | KEEP | Zod form/product validation | — |
| `src/features/work-orders/api/create-work-order-payment.test.ts` | MIGRATE | hand-mirrors backend DTOs; contract value belongs to generated-type contract tests | Phase 4 |
| `src/features/work-orders/api/create-work-order.test.ts` | MIGRATE | hand-mirrors backend DTOs; contract value belongs to generated-type contract tests | Phase 4 |
| `src/features/work-orders/api/delete-work-order.test.ts` | MIGRATE | hand-mirrors backend DTOs; contract value belongs to generated-type contract tests | Phase 4 |
| `src/features/work-orders/api/get-work-order-payments.test.ts` | MIGRATE | hand-mirrors backend DTOs; contract value belongs to generated-type contract tests | Phase 4 |
| `src/features/work-orders/api/get-work-order.test.ts` | MIGRATE | hand-mirrors backend DTOs; contract value belongs to generated-type contract tests | Phase 4 |
| `src/features/work-orders/api/get-work-orders.test.ts` | MIGRATE | hand-mirrors backend DTOs; contract value belongs to generated-type contract tests | Phase 4 |
| `src/features/work-orders/api/transition-work-order-status.test.ts` | MIGRATE | hand-mirrors backend DTOs; contract value belongs to generated-type contract tests | Phase 4 |
| `src/features/work-orders/api/update-work-order.test.ts` | MIGRATE | hand-mirrors backend DTOs; contract value belongs to generated-type contract tests | Phase 4 |
| `src/features/work-orders/components/WorkOrderConsumptionsSection.test.tsx` | KEEP | render/variant/gating | — |
| `src/features/work-orders/components/WorkOrderForm.test.tsx` | KEEP | render/variant/gating | — |
| `src/features/work-orders/components/WorkOrderPaymentsSection.test.tsx` | KEEP | render/variant/gating | — |
| `src/features/work-orders/components/WorkOrderStatusActions.test.tsx` | KEEP | render/variant/gating | — |
| `src/features/work-orders/components/WorkOrderStatusBadge.test.tsx` | KEEP | render/variant/gating | — |
| `src/features/work-orders/components/WorkOrderTable.test.tsx` | KEEP | render/variant/gating | — |
| `src/features/work-orders/hooks/use-create-work-order-payment.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/work-orders/hooks/use-create-work-order.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/work-orders/hooks/use-delete-work-order.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/work-orders/hooks/use-transition-work-order-status.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/work-orders/hooks/use-update-work-order.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/work-orders/hooks/use-work-order-consumptions.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/work-orders/hooks/use-work-order-payments.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/work-orders/hooks/use-work-order.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/work-orders/hooks/use-work-orders.test.ts` | KEEP | hook logic with light fetch mocks | — |
| `src/features/work-orders/lib/work-order-consumption-error-messages.test.ts` | KEEP | pure function tests | — |
| `src/features/work-orders/lib/work-order-error-messages.test.ts` | KEEP | pure function tests | — |
| `src/features/work-orders/lib/work-order-payment-error-messages.test.ts` | KEEP | pure function tests | — |
| `src/features/work-orders/lib/work-order-transitions.test.ts` | KEEP | pure function tests | — |
| `src/features/work-orders/pages/WorkOrderDetailPage.test.tsx` | KEEP | page render/gating | — |
| `src/features/work-orders/pages/WorkOrderFormPage.test.tsx` | KEEP | page render/gating | — |
| `src/features/work-orders/pages/WorkOrderListPage.test.tsx` | KEEP | page render/gating | — |
| `src/features/work-orders/schemas/work-order-consumption-schema.test.ts` | KEEP | Zod form/product validation | — |
| `src/features/work-orders/schemas/work-order-payment-schema.test.ts` | KEEP | Zod form/product validation | — |
| `src/features/work-orders/schemas/work-order-schema.test.ts` | KEEP | Zod form/product validation | — |
| `src/lib/api-error.test.ts` | KEEP | pure function tests | — |
| `src/lib/cents.test.ts` | KEEP | pure function tests | — |
| `src/lib/pagination.test.ts` | KEEP | pure function tests | — |

## Execution policy

- Phase 4 first generates TypeScript types from `cocos-back/docs/openapi/cocos-back.yaml` and adds the
  CI contract check; only then may the 57 MIGRATE api-layer specs be reduced or retired, in feature order
  (largest first: clients, work-orders, users/suppliers/presentations/categories/brands).
- All KEEP specs stay as the fast unit layer of the CI pipeline (Phase 5).
