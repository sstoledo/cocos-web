# Selectores async con búsqueda server-side

## Objetivo
Reemplazar los selectores que cargan catálogos completos (con límites artificiales de 10/100) por combobox con búsqueda server-side debounced.

## Problema
- `useClients({})`, `useServices({})`, `useSuppliers()` sin límite → backend default limit 10 → items 11+ invisibles (BUG ACTIVO en checkout, WO form, PO form).
- `useProducts({ limit: 100 })` en modal de consumo y receta → se corta a los 100.
- Las listas (tablas) ya paginan bien — el problema es solo selectores.

## Decisiones
- Combobox async reutilizable: input de búsqueda con debounce ~300ms, query al backend con param de búsqueda, top 20 resultados, muestra selección actual.
- Catálogos bounded (categories, brands, presentations, employees) NO cambian: carga completa OK.
- Redis descartado por ahora (queries indexadas sobre volúmenes chicos; medir antes).
- Parámetros de búsqueda (ya existen): products `q`, suppliers `q`, services `query`, clients `query`.

## Tareas
- [x] **Back**: ✅ NO requiere cambios — clients ya soporta `query` (name/identification insensitive), services `query`, suppliers/products `q`. Verificado en código.
- [x] **Web**: ✅ Mergeado PR #124. AsyncCombobox en src/components/ui + wrappers por entidad + hooks de search (limit 20, debounce 300ms). Adoptado en los 9 puntos del scope. Suite 1373 verde.

## Constraints
- Commits solo título conventional; PR body solo summary.
- No romper formularios existentes: el valor seleccionado debe persistir aunque no esté en los resultados actuales del search.

## Progreso
- ✅ Mergeado PR #124 (web). Back no requirió cambios. Bug extra fixeado: búsqueda de servicios mandaba q, backend espera query.

## Próximo paso
Feature cerrado. Follow-ups detectados (mismo patrón viejo, fuera de scope): filtro de proveedores en PurchaseOrderListPage, useClientsSelect en VehicleFormPage, useProducts({}) para mapeo de errores en CheckoutPage.
