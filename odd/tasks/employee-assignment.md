# Feature: Employee assignment — cierre del flujo Mechanic

## Objetivo
Cerrar el flujo "Reception/Admin crea y asigna WO → Mechanic ve las suyas" que hoy tiene dos eslabones manuales (SQL):
1. Selector de empleado en el formulario de work orders (quién es el mecánico asignado).
2. Vinculación usuario↔empleado desde la gestión de usuarios (para que el filtro del mecánico funcione).

## Por qué
Decisión del usuario (opción B sobre A=parche SQL): hacer el fix real. Sin esto, el feature mechanic-role-fixes no es usable en la práctica.

## Contexto verificado
- NO existe módulo employees en cocos-back (solo seed con 2 empleados sin userId).
- WorkOrderForm NO tiene campo empleado; el DTO de WO ya acepta employeeId.
- Users endpoints son Admin-only. Employee.userId es @unique.
- Users form: src/features/users/, WO form: src/features/work-orders/components/WorkOrderForm.tsx.

## Alcance autorizado

### Backend (cocos-back, branch feat/employee-assignment, STRICT TDD)
- T1: módulo employees mínimo — `GET /employees` (lista activos, campos para select: id, name, specialty). Roles: Admin, Reception. Sin CRUD completo (los empleados se gestionan por seed por ahora — si se necesita crear empleados desde UI queda como hallazgo separado).
- T2: users — Create/Update aceptan `employeeId?` opcional: vincula Employee.userId al usuario. Validaciones: employee existe y activo; no está ya vinculado a OTRO usuario (409 conflict si sí). Permitir desvincular (employeeId null). Responses de users incluyen employeeId/employee básico. Admin only.

### Frontend (cocos-web, branch feat/employee-assignment)
- T3: WorkOrderForm — select "Mecánico asignado" (opcional) con datos de GET /employees; incluir employeeId en create/update DTOs del front; mostrar empleado asignado en WO detail (si el detail ya muestra datos, agregar la línea).
- T4: UserForm — select "Empleado vinculado" (opcional, Admin) con GET /employees; mostrar vínculo en UserDetailPage.

## Fuera de alcance
- CRUD completo de empleados (hallazgo: hoy solo se crean por seed — reportar al usuario al final).
- Cambios al filtro Mechanic (ya hecho en PRs #85/#113).

## Tareas
- [x] T1 (back): GET /employees + tests
- [x] T2 (back): users employeeId link/unlink + validaciones + tests
- [x] T3 (front): employee select en WorkOrderForm + detail + tests
- [x] T4 (front): employee select en UserForm + detail + tests
- [ ] T5: verificación completa + docs + PRs

## Reglas del usuario (MANDATORY en commits y PRs)
- Commits: SOLO título conventional, sin body.
- PR body: SOLO summary, sin tablas ni test plan.

## Checks aplicables
- Back: pnpm test + pnpm check verdes. Front: pnpm test + pnpm check verdes.

## Progreso
| Tarea | Estado | Commit | Evidencia |
|---|---|---|---|
| T1 | ✅ Done | 644b9e9 (back) | 576 unit + 4 e2e verdes; select {id,name,specialty,userId}, solo activos, orden por nombre |
| T2 | ✅ Done | 23f4bc4 (back) | 589 unit verdes (+13); errores: EMPLOYEE_NOT_FOUND (404) / EMPLOYEE_ALREADY_LINKED (409); transaccional; unlink con null |
| T3 | ✅ Done | 9dbfc4f (front) | 136 tests verdes; feature employees/ nuevo; form guardado a Admin/Reception ya existía; detail ya mostraba empleado (backend incluye employee) |
| — | T4 en curso | — | — |

## Siguiente paso
T4 frontend (employee select en UserForm).
