# Work Orders v2 — pagos, solo-servicios y consumibles

## Objetivo
Implementar el diseño aprobado de Work Orders v2: modelo de cobro con pagos parciales, WO exclusiva de servicios, y bitácora de consumo de productos con envases abiertos.

## Decisiones aprobadas (diseño)
1. **Cobro**: tabla `WorkOrderPayment` (amount, paymentMethod, paidAt, concepto adelanto/saldo). Deuda (totalAmount) separada del pago. Estado de cobro derivado: pendiente/parcial/pagada. Cierre de caja suma ventas + pagos de WO por fecha de cobro.
2. **WO = solo servicios**: se elimina `WorkOrderProduct` (schema + endpoints + UI). Productos solo por venta de mostrador. Nota: la DB dev tiene 4 líneas de prueba que se pierden.
3. **Consumibles**: bitácora append-only `WorkOrderConsumptionEvent` con 3 eventos: `USED(qty)` (descuenta stock inmediato), `OPENED` (solo traza), `DEPLETED` (stock −1, cierra envase). Productos directos (solo USED) vs parciales (3 eventos). Envases abiertos = OPENED − DEPLETED por producto, visibles en inventario; al registrar consumo, si hay envase abierto el sistema sugiere reutilizarlo (sugiere, no bloquea). Registran mecánico (su WO) y logística. Receta por servicio = template default (preventivos fijos) ajustable por WO (correctivos). Reporte derivado: aperturas/cierres por usuario (indicador de hábitos, no métrica punitiva).
4. **Reglas temporales**: eventos solo mientras la WO está abierta (pending/in_progress); al cerrar (done/cancelled) la bitácora se bloquea. Un DEPLETED de envase abierto de otra WO puede registrarse desde la WO actual o desde inventario por logística.
5. **Limitación aceptada**: no se rastrea la lata física individual; trazabilidad de flujo.

## Slices (PRs)
- [x] **S1 — WO solo-servicios**: eliminar WorkOrderProduct. ✅ Mergeado: back PR #89 (`9a23b1a`), web PR #118 (`ebe7a29`). Suites verdes (back 594, web 1256). Nota: `StockMovement.workOrderId` queda en schema para S3; back dejó 1 stock_movement huérfano en dev (inofensivo); gotcha: `prisma migrate dev` no corre en shell no-interactivo (usar `printf 'y\n' | script -qec ...`).
- [x] **S2 — Pagos de WO**: modelo WorkOrderPayment + endpoints + estado de cobro derivado + cierre de caja suma pagos WO (desglose persistido en snapshot) + UI pagos. ✅ Mergeado: back PR #90 (`7af929c`), web PR #119 (`fe22c8b`). Suites verdes (back 608, web 1296). Notas: pagos de WO luego cancelada SÍ entran al cierre (decisión pendiente si el negocio quiere excluirlos); paidAt no editable por API; el doc de este feature quedó commiteado en web.
- [x] **S3 — Consumibles**: receta ServiceProduct (CRUD Admin/Reception) + Product.consumptionType (direct/partial) + bitácora WorkOrderConsumptionEvent (used/opened/depleted, append-only) + envases abiertos (GET /stock/products/:id/open-containers) + alerta de reutilización + registro mecánico (su WO)/Admin/Reception/Warehouse. ✅ Mergeado: back PR #91 (`ea97f66`), web PR #120 (`ee7586f`). Suites verdes (back 635, web 1342). Notas: stock descontado NO se repone si la WO se cancela (MVP consciente); selector de productos carga limit 100 (pasar a búsqueda server-side si el catálogo crece).

## Progreso
- S1 ✅ mergeado (back #89, web #118)
- S2 ✅ mergeado (back #90, web #119)
- S3 ✅ mergeado (back #91, web #120) — FEATURE COMPLETO

## Próximo paso
Feature cerrado. Pendientes sueltos: decisiones de negocio (pagos de WO cancelada en cierre; paidAt editable); testing por rol Warehouse/Purchasing/ReadOnly; smoke test manual del flujo de consumibles.

## Decisiones extra tomadas durante la implementación
- El desglose de pagos WO en cierre de caja se PERSISTE como columnas del snapshot (workOrderPaymentsCash/Card/Transfer/Count) — los cierres son audit-trail inmutable.
- FIFO de stock replicado entre SalesService y consumos de WO (keep-in-sync documentado; extracción a StockService compartido = follow-up).

## Constraints
- Commits: solo título conventional (sin body). PR body: solo summary.
- Backend corre en :4000; DB: `docker start cocos-postgres` (postgres/postgres, db cocos).
- Tests junto al comportamiento; suite completa en pre-commit (~90s, timeouts >120s).
