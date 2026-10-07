# Feature: Sonner Migration — Mutation Feedback Toasts

## Objetivo
Wirear `toast()` de Sonner en los 51 mutation hooks de TanStack Query para que toda mutación (create/update/delete/acciones) dé feedback visual de éxito y error. Hoy el `<Toaster>` está montado en `main.tsx` pero ningún feature lo llama.

## Por qué
Paso 1 del roadmap MVP acordado (topic `roadmap/mvp-closeout`): Sonner → ConfirmDialog → testing por roles → backlog lejano.

## Alcance autorizado
- Agregar `toast.success` / `toast.error` en hooks de mutación (`onSuccess`/`onError` hook-level).
- Import: `import { toast } from 'sonner'` (el wrapper `@/components/ui/sonner` solo re-exporta `Toaster`).
- Copy de toasts en español, consistente con la UI existente.
- Tests: actualizar/crear tests de hooks con `vi.mock('sonner', ...)` y asserts sobre los spies, siguiendo el patrón existente (stub de `globalThis.fetch` + `QueryClientProvider` wrapper).
- NO tocar páginas ni superficies inline de error en este feature (salvo decisión registrada abajo).

## Datos del mapa (exploración 2026-10-07)
- 51 mutation hooks en `src/features/*/hooks/`. 49 tienen `onSuccess` (solo invalidación); solo `useCancelPurchaseOrder` tiene `onError` (re-invalidación en 409, no UI).
- Callers pasan callbacks per-call vía `mutate(vars, { onSuccess/onError })` → componen con hook-level en TanStack Query v5. **Sin conflictos**.
- Páginas con superficie inline de error (riesgo de doble-reporte si se agrega toast.error genérico): FormPages de clients/products/services/brands/categories/presentations/suppliers/vehicles/work-orders/POs, PurchaseOrderActions, SaleCancelAction, WorkOrderStatusActions, NotificationListPage, UserFormPage/UserDetailPage, Login/Register/ResetPassword, ProductImageUpload.
- `users/hooks/` no tiene tests de hooks (gap a cubrir).
- Casos especiales: `useLogout` (navega en onSuccess), `useResetPassword` (sin callbacks), `useLogin`/`useRegister` (auth — decidir si toast aplica).

## Decisión de diseño
- **Éxito**: `toast.success` en TODAS las mutaciones de negocio (catálogos, clients, vehicles, sales, POs, work-orders, stock, cash-closings, users, notifications, lots). Auth (login/register/logout/reset): sin toast de éxito (la navegación ya es feedback).
- **Error**: `toast.error` SOLO en hooks cuyas páginas NO tienen superficie inline (principalmente deletes y acciones desde list pages). Donde ya existe inline error contextual, se deja el inline (mejor UX para formularios) y no se agrega toast para evitar doble-reporte.
- Copy: español, formato `'<Entidad> creada/actualizada/eliminada correctamente'` y `'No se pudo <acción> <entidad>'`.

## Tareas
- [x] T1: brands (3 hooks) + tests
- [x] T2: categories (3) + presentations (3) + tests
- [x] T3: products (3) + suppliers (3) + services (3) + tests
- [x] T4: clients (3) + vehicles (3) + clients/vehicles anidados (3) + lots (1) + tests
- [x] T5: users (4 hooks, incluye crear tests de hooks desde cero) + tests
- [x] T6: sales (2) + purchase-orders (5) + work-orders (4) + tests
- [x] T7: stock (1) + cash-closings (1) + notifications (2 — sin toasts por diseño, inline actionError cubre) + tests
- [x] T8: `pnpm check:fix` + `pnpm test` completo + commit(s) de cierre

## Checks aplicables
- `pnpm test` (Vitest) verde por tarea.
- `pnpm check` (Biome) sin nuevos diagnósticos.
- TDD estándar frontend: tests actualizados junto al hook.

## Progreso
| Tarea | Estado | Commit | Evidencia |
|---|---|---|---|
| T1 | ✅ Done | 2609acf | 58 tests verdes; spot check OK |
| T2 | ✅ Done | 28c7778 | 112 tests verdes; spot check OK |
| T3 | ✅ Done | 71ab610 | 199 tests verdes; spot check OK; error toast en remove-image justificado (removal era silenciosa) |
| T4 | ✅ Done | 0034fa9 | 161 tests verdes (4 test files nuevos); error toasts en deletes de client/vehicle (eran silenciosos) |
| T5 | ✅ Done | 06f2af6 | 38 tests users (4 archivos nuevos); error toast delete justificado (UserListPage no tenía superficie) |
| T6 | ✅ Done | 0f6f20b | 373 tests verdes; error toast en delete WO (WorkOrderDetailPage silencioso); 409 onError de cancel-PO intacto |
| T7 | ✅ Done | c1b9347 | 107 tests verdes; notifications sin toasts (ruido/duplicación); stock y cash-closings success-only (inline errors cubren) |

| T8 | ✅ Done | (este commit) | Suite completa: 248 archivos / 1213 tests verdes; biome 609 archivos limpio |

## Siguiente paso
FEATURE COMPLETO. Siguiente: Paso 2 del roadmap (ConfirmDialog con @base-ui/react/dialog, reemplazar 14 window.confirm).
