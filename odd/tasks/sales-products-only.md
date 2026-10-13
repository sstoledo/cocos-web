# Feature: Sales products-only — ventas sin servicios

## Objetivo
Ventas = SOLO productos (mostrador). Los servicios se cobran solo vía work orders. Eliminar serviceLines del checkout y del backend de ventas, dropear el modelo SaleService.

## Por qué
Decisión del usuario en testing Reception (`decision/sales-products-only`). Bug raíz: `create-sale.ts` mandaba `[]` para líneas vacías y el backend las rechazaba con `@ArrayMinSize(1)` — parecía que toda venta requería servicio. El usuario necesita registrar ventas para probar devoluciones.

## Alcance autorizado

### Backend (cocos-back, STRICT TDD)
- T1: quitar `serviceLines` de `CreateSaleDto` (+ `SaleServiceLineDto`), del service (creación, totales, includes) y de response DTOs. `SALE_EMPTY_LINES` pasa a significar "sin líneas de producto".
- T1: migración que dropea el modelo/tabla `SaleService` (pre-MVP, sin data real que preservar — confirmar que el seed/demo-data no crea SaleServices; si los crea, limpiarlos del seed).
- Verificar que refunds/cancelaciones no referencien SaleService; si lo hacen, limpiar esas referencias.

### Frontend (cocos-web)
- T2: CheckoutForm sin sección de servicios (solo líneas de producto); sale-schema sin serviceLines; create-sale payload solo productLines; SalesLineItems y SaleDetailPage sin servicios; RefundPage si referencia servicios, limpiar; mapper de errores de sales: SALE_EMPTY_LINES → mensaje de productos. Tests actualizados.

## Fuera de alcance
- Work orders (siguen teniendo productos + servicios — eso está bien).
- Cambios en devoluciones más allá de quitar referencias a servicios.

## Tareas
- [x] T1 (back): ventas sin serviceLines + migración drop SaleService + tests
- [x] T2 (front): checkout productos-only + schemas/payloads/detail + tests
- [x] T3: verificación completa + docs + PRs

## Reglas del usuario (MANDATORY)
- Commits: SOLO título conventional. PR body: SOLO summary.

## Progreso
| Tarea | Estado | Commit | Evidencia |
|---|---|---|---|
| T1 | ✅ Done | bec1f5c (back) | 602 unit + 18 e2e sales verdes; migración 20261013054022_drop_sale_service aplicada a dev; 4 e2e products/services pre-existentes en base |
| T2 | ✅ Done | 68d46bc (front) | 120 tests sales verdes (+2 guardias anti-serviceLines); −372 líneas netas |
| T3 | ✅ Done | — | PRs abiertos back + front |

## Siguiente paso
FEATURE COMPLETO. Mergear back primero (breaking), front después. Usuario re-testea ventas → desbloquea prueba de devoluciones.
