# F19 — Tests E2E (Playwright) — PRD + TDD Exhaustivo

> Análisis profundo: suite E2E full-stack con backend real + Postgres de test, flujos críticos de negocio, CI pipeline, estrategia anti-flakiness.

---

## 1. CONTEXTO Y PROBLEMA REAL

### 1.1 Estado actual
- **Backend**: 571 tests (unit + e2e de API con supertest). Cobertura buena de endpoints aislados.
- **Frontend**: 1114 tests (Vitest + Testing Library + MSW). Cobertura buena de componentes/hooks.
- **Gap crítico**: **cero tests end-to-end** browser + backend real. Los bugs de integración (contrato API, flujos multi-paso, estados de UI entre páginas) solo se descubren en QA manual o producción.
- Ejemplos de bugs que E2E habría pescado: desajuste DTO Decimal (pasó esta semana), redirección post-login rota, filtro que no se aplica al paginar.

### 1.2 Alcance MVP
1. **Playwright** contra **backend real** (NestJS + Postgres docker de test) — no mocks.
2. **10 flujos críticos de negocio** (golden paths) + 5 flujos de error/permisos.
3. **CI pipeline**: corre en GitHub Actions en cada PR (job separado, paralelizable).
4. **Estrategia anti-flakiness** explícita (ver 2.6): nada de `waitForTimeout`, data-testid, fixtures deterministas.
5. **NO en MVP**: visual regression (Percy/Chromatic), cross-browser completo (solo Chromium en CI; Firefox/WebKit local opcional), mobile viewport (queda para post-F18).

---

## 2. PRD DETALLADO

### 2.1 Objetivo
Todo PR pasa por una suite E2E que verifica los flujos de dinero y trabajo del taller de punta a punta: login → operación → persistencia → reflejo en otras vistas. Un merge con E2E rojo está bloqueado.

### 2.2 Infraestructura

```
cocos-web/
├── e2e/
│   ├── playwright.config.ts        # webServer: levanta back+front
│   ├── global-setup.ts             # docker postgres + migrate + seed e2e
│   ├── fixtures/
│   │   ├── auth.fixture.ts         # loginAs por rol (storageState cacheado)
│   │   ├── data.fixture.ts         # factories: createProduct, createClient... via API
│   │   └── test.ts                 # test extendido con fixtures
│   ├── pages/                      # Page Objects
│   │   ├── LoginPage.ts
│   │   ├── WorkOrdersPage.ts / WorkOrderDetailPage.ts
│   │   ├── CheckoutPage.ts
│   │   ├── ProductsPage.ts
│   │   ├── PurchaseOrdersPage.ts
│   │   └── CashClosingPage.ts
│   ├── specs/
│   │   ├── auth.spec.ts
│   │   ├── work-order-lifecycle.spec.ts
│   │   ├── sale-checkout.spec.ts
│   │   ├── stock-fifo.spec.ts
│   │   ├── purchase-order-flow.spec.ts
│   │   ├── cash-closing.spec.ts
│   │   ├── catalog-crud.spec.ts
│   │   ├── dashboard.spec.ts
│   │   ├── permissions.spec.ts
│   │   └── error-handling.spec.ts
│   └── utils/
│       ├── api-client.ts           # helper REST autenticado para setup
│       └── db-reset.ts             # truncate entre workers
└── package.json                    # scripts: e2e, e2e:ui, e2e:ci
```

### 2.3 Entorno de test (determinista)

```
global-setup:
1. docker run postgres:16-test (puerto 5434) — o docker-compose service e2e-db
2. DATABASE_URL=postgresql://...@localhost:5434/cocos_e2e
3. prisma migrate deploy + prisma db seed -- --e2e (seed mínimo: roles, 1 admin,
   1 reception, 1 mechanic, catálogo base, presentaciones)
4. build backend (o ts-node dev) en :4100, build+preview frontend en :4200
5. warmup: login admin → guarda storageState por rol (evita login en cada test)

Entre tests: NO reset de DB completo (lento). Cada test crea sus propios datos
via API (factories) con prefijo único por worker → aislamiento sin truncate.
Solo specs que mutan datos compartidos (stock FIFO) usan transacción/reset por archivo.
```

### 2.4 Los 10 golden paths

| # | Flujo | Por qué es crítico |
|---|---|---|
| 1 | Login → redirect por rol → logout | Puerta de entrada; RBAC básico |
| 2 | WO: crear (cliente+vehículo) → asignar mecánico → in_progress → agregar ítem producto+servicio → done | Ciclo de trabajo completo |
| 3 | Venta desde WO done → checkout → pago efectivo → stock descontado FIFO → comprobante | El flujo de dinero #1 |
| 4 | Venta directa (mostrador) → pago con 2 medios → vuelto | Caja diaria |
| 5 | Compra: crear OC → order → receive (lotes FIFO) → stock aumentado | Abastecimiento |
| 6 | Stock crítico: producto bajo mínimo aparece en dashboard/alertas | Señal operativa |
| 7 | Cierre de caja: preview con movimientos del día → close → totales correctos | Control financiero diario |
| 8 | Catálogo: crear marca/categoría/presentación → crear producto → aparece en buscador de WO | Datos maestros |
| 9 | Permisos: Mechanic NO ve botón eliminar ni costos; Warehouse no puede cobrar | Seguridad visible (F15-ready) |
| 10 | Error handling: 401 → redirect login; 403 → pantalla unauthorized; 500 → toast + no crash | Robustez UX |

### 2.5 Flujos de error/permisos (5)

1. Sesión expirada a mitad de checkout → login → retoma
2. Reception intenta acceder /users por URL directa → 403/unauthorized
3. Submit de form con backend caído → toast error, form conserva datos
4. Doble click en "Pagar" → una sola venta (idempotencia UX)
5. Paginación + filtro combinados en listado grande (500 productos seed)

### 2.6 Estrategia anti-flakiness (reglas duras)

| Regla | Detalle |
|---|---|
| Selectores | `data-testid` estable; prohibido CSS classes y nth-child |
| Esperas | Solo `expect(...).toBeVisible()` / `waitForResponse`; **prohibido** `waitForTimeout` |
| Datos | Factories por API, nunca dependencia de datos de otro test; prefijo `w{workerId}-` |
| Auth | storageState cacheado por rol (login 1 vez por worker) |
| Red | Esperas por response real: `page.waitForResponse('**/api/sales')` antes de asserts |
| Retries | CI: 2 retries con trace/video/screenshot solo en retry |
| Paralelismo | 4 workers; specs con stock compartido en grupo serial |
| Reloj | No dependencia de hora real salvo cierre de caja (usa fecha fija via API) |

### 2.7 Page Objects (ejemplo)

```typescript
// pages/CheckoutPage.ts
export class CheckoutPage {
  constructor(private page: Page) {}

  async openSale(saleId: string) {
    await this.page.goto(`/sales/${saleId}/checkout`);
    await expect(this.page.getByTestId('checkout-total')).toBeVisible();
  }

  async payWithCash(amount: string) {
    await this.page.getByTestId('payment-method-cash').click();
    await this.page.getByTestId('payment-amount').fill(amount);
    const response = this.page.waitForResponse(r => r.url().includes('/api/sales') && r.status() === 200);
    await this.page.getByTestId('confirm-payment').click();
    await response;
  }

  async expectPaid() {
    await expect(this.page.getByTestId('sale-status')).toHaveText('Pagada');
  }
}
```

### 2.8 CI Pipeline (GitHub Actions)

```yaml
e2e:
  runs-on: ubuntu-latest
  services:
    postgres: { image: postgres:16, ports: [5434:5432], env: {...} }
  steps:
    - setup node 22 + pnpm + cache
    - pnpm install (back + front)
    - backend: prisma migrate deploy + seed e2e + build + start (:4100) &
    - frontend: build + preview (:4200) &
    - npx playwright install --with-deps chromium
    - pnpm e2e:ci   # --workers=4 --retries=2
    - if failure: upload playwright-report + traces (7 días)
  # Bloquea merge: required check. Cache de browsers entre runs.
  # Duración objetivo: < 12 min total.
```

### 2.9 Scripts

```json
{
  "e2e": "playwright test",
  "e2e:ui": "playwright test --ui",
  "e2e:headed": "playwright test --headed",
  "e2e:ci": "playwright test --workers=4 --retries=2 --reporter=html,github",
  "e2e:debug": "PWDEBUG=1 playwright test"
}
```

---

## 3. TDD SPECS (meta: tests del harness E2E)

El E2E es él mismo código testeado en lo esencial:

### 3.1 Fixtures

```typescript
// fixtures.test.ts (corre como spec smoke)
describe('e2e fixtures', () => {
  it('loginAs reuses storageState and lands on role home', async ({ loginAs }) => {
    const page = await loginAs('mechanic');
    await expect(page).toHaveURL(/\/work-orders/);
  });
  it('data factory creates isolated records with worker prefix', async ({ factory }) => {
    const p = await factory.product({ name: 'Test Widget' });
    expect(p.name).toMatch(/^w\d+-/);
  });
  it('api client authenticates and retries 401 once', async () => { /* ... */ });
});
```

### 3.2 Golden path spec de ejemplo (completo)

```typescript
// work-order-lifecycle.spec.ts
test.describe('WO lifecycle', () => {
  test('create → assign → progress → items → done', async ({ loginAs, factory }) => {
    const client = await factory.client();
    const vehicle = await factory.vehicle({ clientId: client.id });
    const product = await factory.product({ stock: 10 });
    const service = await factory.service();

    const reception = await loginAs('reception');
    const wo = await new WorkOrdersPage(reception).create({ client, vehicle, notes: 'Ruido al frenar' });

    const mechanic = await loginAs('mechanic');
    const detail = new WorkOrderDetailPage(mechanic);
    await detail.open(wo.id);
    await detail.startWork();
    await detail.addProductItem(product, 2);
    await detail.addServiceItem(service, 1);
    await detail.expectItemCount(2);
    await detail.complete();

    await detail.expectStatus('Done');
    // Cross-check: stock descontado solo al venderse, no al hacerse done
  });
});
```

### 3.3 Sale checkout (flujo de dinero)

```typescript
test('checkout descuenta stock FIFO y genera comprobante', async ({ loginAs, factory }) => {
  const product = await factory.productWithLots([
    { qty: 5, cost: 100 }, { qty: 5, cost: 120 },
  ]);
  const sale = await factory.saleWithItems([{ productId: product.id, qty: 6 }]);

  const reception = await loginAs('reception');
  const checkout = new CheckoutPage(reception);
  await checkout.openSale(sale.id);
  await checkout.payWithCash('25000');
  await checkout.expectPaid();

  // verificación vía API: FIFO consumió lote 1 completo + 1 del lote 2
  const stock = await factory.api.get(`/api/products/${product.id}/stock`);
  expect(stock.total).toBe(4);
  expect(stock.lots[0].qty).toBe(0);
});
```

### 3.4 Permissions spec

```typescript
test('mechanic no ve acciones destructivas ni costos', async ({ loginAs, factory }) => {
  const mechanic = await loginAs('mechanic');
  await new WorkOrderDetailPage(mechanic).open((await factory.workOrder()).id);
  await expect(mechanic.getByTestId('wo-delete')).toBeHidden();
  await expect(mechanic.getByTestId('item-cost')).toBeHidden();
});
```

### 3.5 Anti-flakiness: meta-tests del harness

```typescript
// flake-audit: corre en CI semanal (cron), 20 repeticiones del suite
// playwright test --repeat-each=20 → cualquier fallo = flake → issue automático
```

---

## 4. PLAN DE EJECUCIÓN

| Task | Descripción | Archivos | Tests | Estimación |
|---|---|---|---|---|
| F19.1 | Setup: Playwright, config, docker pg test, global-setup, seed e2e | 5 | 2 smoke | 1 sprint |
| F19.2 | Fixtures: auth (storageState), factories API, test extendido | 4 | 4 unit | 0.5 |
| F19.3 | Page Objects: 8 páginas core | 8 | — | 1 |
| F19.4 | Specs 1-3: auth, WO lifecycle, checkout+FIFO | 3 | 3 specs (~20 tests) | 1.5 |
| F19.5 | Specs 4-7: venta directa, OC, stock crítico, cierre caja | 4 | 4 specs (~20 tests) | 1.5 |
| F19.6 | Specs 8-10: catálogo, permisos, error handling | 3 | 3 specs (~15 tests) | 1 |
| F19.7 | CI: GitHub Action, required check, artifacts, cache | 2 | — | 0.5 |
| F19.8 | Estabilización: flake audit, retries, docs `E2E.md` | 1 | — | 0.5 |
| **Total** | | **30** | **~60 tests e2e** | **6.5 sprints** |

---

## 5. RIESGOS Y MITIGACIONES

| Riesgo | Prob | Impacto | Mitigación |
|---|---|---|---|
| Flakiness erosiona confianza (se ignoran rojos) | Alta | Crítico | Reglas duras 2.6, flake audit semanal ×20, retry solo con trace, cultura: flake = bug P1 |
| Suite lenta (>15 min) → devs la saltean | Media | Alto | Paralelismo 4 workers, storageState cache, sin resets completos, shard si supera 12 min |
| Mantenimiento de Page Objects al cambiar UI | Media | Medio | Pocos POs (8), data-testid estables, selectores en un solo lugar |
| DB de test contaminada entre specs | Media | Alto | Factories con prefijo por worker + specs de stock en grupo serial |
| Backend levantado en CI difiere de dev | Baja | Medio | Mismo docker-compose + .env.e2e versionado para local y CI |
| Cobertura falsa (E2E verde, bugs en edge cases) | Media | Medio | E2E = golden paths solamente; edge cases siguen en unit/integration |

---

## 6. DEFINITION OF DONE

- [ ] `pnpm e2e` corre local contra backend real + Postgres docker (un comando)
- [ ] 10 golden paths + 5 flujos de error/permisos, ~60 tests
- [ ] 8 Page Objects con data-testid estables
- [ ] storageState por rol; factories aisladas por worker
- [ ] CI: job requerido en PR, < 12 min, artifacts (trace/video) en fallos
- [ ] Flake audit semanal configurado (cron ×20)
- [ ] Doc `e2e/README.md`: cómo correr, debuggear, agregar specs, convenciones
- [ ] 0 usos de `waitForTimeout` (lint rule custom o grep en CI)
- [ ] Merge bloqueado si E2E rojo (branch protection)
