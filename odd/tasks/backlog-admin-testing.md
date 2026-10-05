# Backlog — Bugs encontrados testing como Admin

> Reporte de testing manual 2026-10-04. Clasificados por severidad y módulo.

---

## 🔴 CRÍTICOS — Rompen flujo completo

| # | Módulo | Síntoma | Error consola | Hipótesis |
|---|---|---|---|---|
| B-01 | **Servicios** | Lista rota | `services.map is not a function` | API devuelve objeto `{data: []}` en vez de array, o `useServices` no extrae `.data` |
| B-02 | **Órdenes de trabajo** | "Nueva WO" rota | `entities.map is not a function` | Mismo patrón: `useWorkOrders` o `getWorkOrders` no mapea respuesta |
| B-03 | **Ventas** | "Nueva venta" rota | `entities.map is not a function` | Mismo patrón en `useSales` / `getSales` |

---

## 🟠 ALTOS — Función principal no usable

| # | Módulo | Síntoma | Detalle |
|---|---|---|---|
| B-04 | **Marcas** | "Ver" → 404 | ✅ FASE 2 (PR #104): `BrandDetailPage` + ruta `/brands/:id` |
| B-05 | **Categorías** | "Ver" → 404 | ✅ FASE 2 (PR #104): `CategoryDetailPage` + ruta `/categories/:id` |
| B-06 | **Presentaciones** | "Ver" → 404 | No aplica: queda list-only por decisión de usuario |
| B-07 | **Proveedores** | "Ver" → 404 | ✅ FASE 2 (PR #104): `SupplierDetailPage` + ruta `/suppliers/:id` |
| B-08 | **Categorías** | No crea (ni con ni sin padre) | Validación backend o frontend bloquea; revisar `CategorySchema` y `parentId` opcional |
| B-09 | **Productos** | No crea + toggle activo no funciona | Form submit falla + checkbox no dispara `onChange` |
| B-10 | **Usuarios** | Página "Próximamente" | ✅ **COMPLETADO**: CRUD completo (list, create, edit, detail, assign-role) backend + frontend |

---

## 🟡 MEDIOS — UX / Comportamiento extraño

| # | Módulo | Síntoma | Detalle |
|---|---|---|---|
| B-11 | **Notificaciones** | Toggle lista apenas se mueve | ✅ **COMPLETADO**: Animación CSS del Switch corregida (group-data-*) |
| B-12 | **Productos** | Toggle "Activo" no responde | ✅ **COMPLETADO**: Switch ya funciona correctamente con Controller (tests pasan) |
| B-13 | **Cierres de caja** | Flujo confuso / campos extra | ✅ **COMPLETADO**: Añadida explicación contextual en preview y formulario (qué son los "esperados", diferencia vs declarado) |
| B-14 | **Órdenes de compra** | Doble click en recibir → "no se puede recibir" | ✅ **COMPLETADO**: Guard `isSubmitting` local en botón recibir (setea inmediatamente, 500ms timeout) |

---

## ✅ FUNCIONANDO (validado)

- Clientes: CRUD completo
- Vehículos: CRUD + asociación a cliente
- Órdenes de compra: Crear → Order → Receive (salvo doble click)
- Marcas: **Crear** funciona (solo "Ver" falla)
- **Usuarios: CRUD completo (list, create, edit, detail, assign-role) — Admin only**

---

## 📋 PLAN DE ATAQUE sugerido (orden)

1. ~~**Fix patrón `map is not a function`** (B-01, B-02, B-03) — uno arregla los 3 (hook genérico o API response unwrap)~~ ✅
2. ~~**Rutas detail faltantes** (B-04 a B-07) — crear `XxxDetailPage` + registrar en router~~ ✅
3. ~~**Categorías no crean** (B-08) — revisar schema + validación `parentId`~~
4. ~~**Productos no crean + toggle** (B-09, B-12) — form submit + checkbox binding~~
5. ~~**Usuarios** (B-10) — implementar `UsersPage` (CRUD + asignar roles)~~ ✅
6. ~~**Notificaciones toggle** (B-11) — CSS/animación~~ ✅
7. ~~**Cierres de caja** (B-13) — documentar/clarificar flujo + campos~~ ✅
8. ~~**OC doble click** (B-14) — `isSubmitting` guard + idempotency key~~ ✅

---

## 🔍 NOTAS TÉCNICAS PARA DEV

- **Patrón común**: `entities.map is not a function` sugiere que `useXxx` retorna `{data: T[]}` pero el componente itera `entities` directo sin `.data`. Buscar en `src/features/*/hooks/use-xxx.ts` el `select: (res) => res.data` o falta de unwrap.
- **Rutas detail**: Verificar `App.tsx` / `routes.tsx` — faltan `/:id` para brands, categories, presentations, suppliers.
- **Productos**: Revisar `ProductFormPage` → `ProductForm` → `useCreateProduct` / `useUpdateProduct`. Toggle activo = campo `isActive` boolean.
- **Cierres de caja**: Ver `CloseCashClosingPage` + `useCreateCashClosing` + `CashClosingPreview`. "Efectivo esperado" = suma de ventas en efectivo del día (calculado en preview).
