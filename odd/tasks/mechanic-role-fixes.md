# Feature: Mechanic role fixes — sin dashboard, WOs asignadas

## Objetivo
Implementar el flujo refinado del rol Mechanic (decisión de negocio aprobada, topic `roadmap/role-testing-mechanic`):
1. Dashboard FUERA para Mechanic (frontend + backend).
2. Mechanic ve SOLO sus work orders asignadas (`WorkOrder.employeeId` → `Employee.userId`).
3. Clientes view-only y notificaciones quedan como están.

## Por qué
Paso 3 del roadmap MVP (`roadmap/mvp-closeout`): testing manual del rol Mechanic encontró que el dashboard muestra KPIs con links a rutas denegadas (UX rota + fuga de datos de ventas) y que el listado de WOs no filtra por asignación.

## Alcance autorizado

### Backend (cocos-back)
- `dashboard.controller.ts`: quitar `RoleName.Mechanic` de `ALL_ROLES` del summary.
- `work-orders.service.ts`: en findAll/findOne, si el usuario es Mechanic, filtrar por `employeeId` del Employee vinculado a su `userId`. Si no tiene Employee vinculado → lista vacía (findAll) / 403 o 404 (findOne — elegir el patrón existente del repo para acceso denegado a recurso).
- Controller: verificar que el request llegue con el rol del usuario (RolesGuard ya lo provee).
- Seed/demo-data: verificar que el usuario Mechanic de demo tenga un Employee vinculado (`Employee.userId`); si no, crearlo.
- Strict TDD backend: RED → GREEN → REFACTOR, tests e2e/unit existentes en work-orders.service.spec / controller.spec + dashboard tests.

### Frontend (cocos-web)
- `navigation.ts`: quitar 'Mechanic' de `allowedRoles` de Dashboard (isRouteAllowed también lo cubre — verificar que /dashboard quede bloqueado para Mechanic por RouteGuard).
- Landing: LoginPage navigate y App.tsx index redirect `/dashboard` → para Mechanic debe ir a `/work-orders`. Implementar redirect por rol (helper `getDefaultRouteForRole(role)` o similar, con tests).
- Tests: Sidebar/RouteGuard/LoginPage según corresponda.

## Fuera de alcance
- Otros roles (Warehouse, Purchasing, ReadOnly, Reception) — se testean después, packs separados.
- Cambiar creación/asignación de WOs (Reception/Admin ya pueden asignar via employeeId en el form — verificar que el select exista; si no existe, reportar como hallazgo, NO implementar sin aprobación).

## Tareas
- [x] T1 (back): filtro WOs por Mechanic + dashboard sin Mechanic + tests
- [x] T1b (back): scopear transitionStatus a WOs asignadas (agujero encontrado en T1)
- [ ] T2 (front): navigation sin Dashboard para Mechanic + redirect por rol + tests
- [ ] T3: verificación completa ambos repos + docs + PRs

## Checks aplicables
- Back: `pnpm test` (o el runner del repo) verde; e2e de work-orders/dashboard actualizados.
- Front: `pnpm test` + `pnpm check` verdes.

## Progreso
| Tarea | Estado | Commit | Evidencia |
|---|---|---|---|
| T1 | ✅ Done | b6c309b (back) | 582 tests verdes; 404 para detalle fuera de scope (patrón no-leak); dashboard 403 para Mechanic |
| T1b | ✅ Done | 0269a02 (back) | 586 tests + e2e work-orders 62/62; transitions scopeadas |
| — | T2 en curso | — | — |

## Hallazgos / pendientes manuales
- **Seed**: NO existe usuario Mechanic de demo (users vienen de sign-up, el seed no puede hashear passwords). Al crear el usuario mecánico de demo hay que vincularlo: `Employee.userId = <id del usuario>`. Sin ese vínculo, el mecánico verá lista vacía.
- e2e services/products tienen 4 fallas PRE-EXISTENTES en base (no de este feature).

## Siguiente paso
T2 frontend.
