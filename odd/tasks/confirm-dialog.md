# Feature: ConfirmDialog — Reemplazo de window.confirm

## Objetivo
Crear un `ConfirmDialog` reutilizable en `src/components/ui/` construido con `@base-ui/react/dialog` (patrón ya usado en `Drawer.tsx`) y reemplazar los 14 usos de `window.confirm` nativo.

## Por qué
Paso 2 del roadmap MVP (`roadmap/mvp-closeout`). `window.confirm` es nativo del browser: rompe la estética OKLCH, no es estilizable, y bloquea. ConfirmDialog queda consistente con el design system y es accesible (base-ui).

## Alcance autorizado
- Nuevo componente `src/components/ui/ConfirmDialog.tsx` + tests colocados.
- API propuesta: `open`, `onOpenChange`, `title`, `description`, `confirmLabel` (default 'Eliminar'), `cancelLabel` (default 'Cancelar'), `onConfirm`, `variant?: 'danger' | 'default'` (danger = botón estilo destructive).
- Botones con el componente `Button` existente (variants: default | ghost | outline — verificar si hay estilo destructive; si no, usar clases Tailwind con tokens semanticos existentes, NO inventar tokens nuevos).
- Reemplazar window.confirm en los 14 sitios (ver lista abajo), adaptando su estado local (useState open) y tests.
- Copy en español, manteniendo los mensajes actuales de cada confirmación.

## Sitios con window.confirm (14 archivos, 10 de producción + 4 de test)
1. brands/pages/BrandListPage.tsx
2. categories/pages/CategoryListPage.tsx
3. presentations/pages/PresentationListPage.tsx
4. services/components/ServiceTable.tsx
5. vehicles/components/VehicleTable.tsx
6. clients/pages/ClientDetailPage.tsx
7. users/pages/UserListPage.tsx
8. users/pages/UserDetailPage.tsx
9. purchase-orders/components/PurchaseOrderActions.tsx
10. sales/components/SaleCancelAction.tsx
11. work-orders/components/WorkOrderStatusActions.tsx
12. work-orders/pages/WorkOrderDetailPage.tsx
(+ tests que referencian confirm: PurchaseOrderActions.test, SaleCancelAction.test, ServiceTable.test, WorkOrderStatusActions.test, WorkOrderDetailPage.test)

## Patrón de referencia
- Drawer.tsx: Dialog.Root/Portal/Backdrop/Viewport/Popup/Close con Tailwind + cn().
- Tests de diálogo: verificar render cuando open=true, llamada a onConfirm/onOpenChange, NO mockear window.confirm.

## Tareas
- [x] T1: ConfirmDialog component + tests en src/components/ui/
- [x] T2: reemplazo en list pages de catálogos (brands, categories, presentations, services, vehicles) + tests
- [x] T3: reemplazo en clients/users (ClientDetailPage, UserListPage, UserDetailPage) + tests
- [x] T4: reemplazo en acciones (PurchaseOrderActions, SaleCancelAction, WorkOrderStatusActions, WorkOrderDetailPage) + tests
- [x] T5: verificación completa + commit del doc

## Checks aplicables
- `pnpm test` verde por tarea; `pnpm check` sin diagnósticos.
- Tests de páginas/componentes afectados actualizados (ya no mockear window.confirm; interactuar con el diálogo).

## Progreso
| Tarea | Estado | Commit | Evidencia |
|---|---|---|---|
| T1 | ✅ Done | 0413a50 | 44 tests ui verdes (6 ConfirmDialog + 3 Button nuevos); danger = bg-destructive text-white (no existe token destructive-foreground) |
| T2 | ✅ Done | 4185a99 | 283 tests verdes; VehicleTable.test.tsx creado (no existía); window.confirm eliminado de catálogos |
| T3 | ✅ Done | 7a07287 | 149 tests verdes; UserListPage/UserDetailPage tests creados (no existían); error handling intacto |
| T4 | ✅ Done | 3ec0e59 | 373 tests verdes; 0 window.confirm restantes en src; errores inline intactos |
| T5 | ✅ Done | (este commit) | Suite completa: 253 archivos / 1236 tests verdes; biome limpio |

## Siguiente paso
FEATURE COMPLETO. Siguiente: Paso 3 del roadmap — testing manual por rol (lo hace el usuario) con packs de issues por rol.
