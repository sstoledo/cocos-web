# Future Roadmap — PRD + TDD Specs

> Documento maestro para features de crecimiento post-MVP. Cada item tiene PRD (Product Requirements Document) + TDD (Test-Driven Development) specs listos para estimación y ejecución.

---

## Índice

1. [F13 — Reportes & Analytics](#f13--reportes--analytics)
2. [F14 — Vehículos: Historial & Alertas](#f14--vehículos-historial--alertas)
3. [F15 — Permisos Granulares (RBAC por acción)](#f15--permisos-granulares-rbac-por-acción)
4. [F16 — Multi-Sucursal Real](#f16--multi-sucursal-real)
5. [F17 — Integraciones Externas (Facturación/Contabilidad)](#f17--integraciones-externas-facturacióncontabilidad)
6. [F18 — Mobile/PWA Offline-First](#f18--mobilepwa-offline-first)
7. [F19 — Tests E2E (Cypress/Playwright)](#f19--tests-e2e-cypressplaywright)

---

## F13 — Reportes & Analytics

### PRD

**Objetivo:** Dashboard analítico para dueño/gerente con métricas de negocio accionables.

**Usuarios objetivo:** Admin, dueño, gerente de tienda.

**Métricas core (MVP):**
| Reporte | Descripción | Frecuencia |
|---|---|---|
| Ventas por vendedor | Total, ticket promedio, items/vta, ranking | Diario/Semanal/Mensual |
| Top productos | Por cantidad, por ingreso, por margen | Semanal/Mensual |
| Margen por categoría | Ingreso - costo (lot FIFO) | Mensual |
| Stock crítico | Productos < punto de reposición | Diario (alerta) |
| Órdenes de trabajo | Por estado, por técnico, tiempo medio | Semanal |

**UI:**
- Nueva sección "Analytics" en nav (Admin only)
- Date range picker global (presets: hoy, semana, mes, mes anterior, custom)
- Export CSV/PDF por reporte
- Drill-down: click en fila → detalle (p.ej. vendedor → sus ventas)

**Backend necesario:**
- Nuevos endpoints: `GET /api/reports/sales-by-seller`, `GET /api/reports/top-products`, `GET /api/reports/margin-by-category`, `GET /api/reports/stock-critical`, `GET /api/reports/work-orders-by-tech`
- Agregaciones SQL/Prisma optimizadas (materialized views o vistas)

---

### TDD Specs (Backend)

```typescript
// test/reports/reports.e2e-spec.ts
describe('Reports API', () => {
  beforeEach(async () => {
    await seedTestData(); // 3 sellers, 20 products, 50 sales, 30 WOs
  });

  describe('GET /api/reports/sales-by-seller', () => {
    it('returns sellers with totalSales, avgTicket, itemsPerSale, ranked', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/reports/sales-by-seller?from=2026-01-01&to=2026-01-31')
        .expect(200);
      expect(res.body.data).toHaveLength(3);
      expect(res.body.data[0]).toMatchObject({
        sellerId: expect.any(String),
        sellerName: expect.any(String),
        totalSales: expect.any(Number),
        totalAmount: expect.stringMatching(/^\d+\.\d{2}$/),
        avgTicket: expect.stringMatching(/^\d+\.\d{2}$/),
        itemsPerSale: expect.any(Number),
        rank: 1,
      });
    });

    it('filters by date range', async () => { /* ... */ });
    it('requires Admin role', async () => { /* 403 for others */ });
  });

  describe('GET /api/reports/top-products', () => {
    it('returns top 10 by quantity sold', async () => { /* ... */ });
    it('returns top 10 by revenue', async () => { /* ... */ });
    it('returns top 10 by margin (FIFO cost)', async () => { /* ... */ });
  });

  describe('GET /api/reports/margin-by-category', () => {
    it('calculates revenue - FIFO cost per category', async () => { /* ... */ });
    it('handles categories with no sales (margin 0)', async () => { /* ... */ });
  });

  describe('GET /api/reports/stock-critical', () => {
    it('returns products where totalStock <= reorderPoint', async () => { /* ... */ });
    it('includes reorderPoint, currentStock, suggestedQty', async () => { /* ... */ });
  });

  describe('GET /api/reports/work-orders-by-tech', () => {
    it('groups by mechanic: count, avgDuration, completionRate', async () => { /* ... */ });
  });
});
```

---

### TDD Specs (Frontend)

```typescript
// src/features/reports/pages/ReportsPage.test.tsx
describe('ReportsPage', () => {
  it('renders 5 report cards with loading skeletons', () => { /* ... */ });
  it('date range picker updates all reports on change', () => { /* ... */ });
  it('click "Exportar CSV" on Ventas por vendedor downloads file', () => { /* ... */ });
  it('drill-down: click seller row navigates to SellerSalesDetail', () => { /* ... */ });
});
```

---

## F14 — Vehículos: Historial & Alertas

### PRD

**Objetivo:** Convertir vehículo en entidad con historial navegable y alertas proactivas.

**Features:**
1. **Historial unificado** en ClientDetailPage → tab "Vehículos" → click vehículo → modal/página con:
   - Órdenes de trabajo (todas, con estado, fecha, total)
   - Ventas (productos/servicios usados en ese vehículo)
   - Próximos mantenimientos sugeridos (basado en km/fecha)
2. **Alertas de mantenimiento:**
   - Configuración por vehículo: km/fecha para aceite, filtros, frenos, etc.
   - Dashboard widget "Próximos mantenimientos" (Admin/Reception/Mechanic)
   - Notificación automática al crear WO si vehículo tiene alerta vigente
3. **Kilometraje:** campo `currentKm` en Vehicle, actualizable en WO done

**Backend:**
- `GET /api/vehicles/:id/history` → { workOrders, sales, suggestedMaintenance }
- `PATCH /api/vehicles/:id` → add `currentKm`, `maintenanceAlerts: MaintenanceAlert[]`
- `GET /api/vehicles/alerts` → vehicles con alerta vencida (para widget)

---

### TDD Specs

```typescript
// test/vehicles/vehicle-history.e2e-spec.ts
describe('Vehicle History', () => {
  it('GET /vehicles/:id/history returns WOs + sales + suggested maintenance', async () => {
    const res = await request(app).get(`/api/vehicles/${vehicleId}/history`).expect(200);
    expect(res.body.workOrders).toBeInstanceOf(Array);
    expect(res.body.sales).toBeInstanceOf(Array);
    expect(res.body.suggestedMaintenance).toBeInstanceOf(Array);
  });

  it('suggested maintenance calculates next oil change at 5000km or 6 months', async () => { /* ... */ });
  it('alert triggers when currentKm >= alertKm or date >= alertDate', async () => { /* ... */ });
});

// src/features/clients/components/VehicleHistory.test.tsx
describe('VehicleHistoryModal', () => {
  it('shows tabs: Órdenes, Ventas, Mantenimientos', () => { /* ... */ });
  it('click WO row navigates to /work-orders/:id', () => { /* ... */ });
  it('alert badge shows "¡Mantenimiento vencido!" in red', () => { /* ... */ });
});
```

---

## F15 — Permisos Granulares (RBAC por acción)

### PRD

**Problema actual:** Roles coarse-grained (Admin/Reception/Mechanic/Warehouse/Purchasing/ReadOnly) controlan páginas enteras. No se puede dar "crear producto" sin "editar producto" ni "ver costo" sin "ver precio".

**Solución:** Permission-based RBAC con actions:
```
permission = { resource: 'products', action: 'create' | 'read' | 'update' | 'delete' | 'view_cost' }
```

**Migración:**
1. Definir matriz resource×action (≈ 15 resources × 5 actions = 75 permissions)
2. Roles actuales → bundles de permissions (Admin=all, Reception=read+create sales/WO, etc.)
3. UI: `usePermission('products', 'create')` hook + `<Can resource="products" action="create">` component
4. Backend: `@RequirePermission('products', 'create')` decorator en controllers

**Fase 1 (MVP):** Solo resources críticos: products, services, vehicles, clients, work-orders, sales, purchase-orders, cash-closings, lots, suppliers, users.

---

### TDD Specs

```typescript
// src/lib/permissions.ts + tests
describe('Permission System', () => {
  describe('Permission matrix', () => {
    it('Admin has all permissions', () => {
      expect(hasPermission('Admin', 'products', 'delete')).toBe(true);
      expect(hasPermission('Admin', 'users', 'view_cost')).toBe(true);
    });
    it('Reception can create sales but not delete', () => {
      expect(hasPermission('Reception', 'sales', 'create')).toBe(true);
      expect(hasPermission('Reception', 'sales', 'delete')).toBe(false);
    });
    it('Mechanic can read/update WO but not create', () => { /* ... */ });
    it('Warehouse can read products/lots but not view_cost', () => { /* ... */ });
  });

  describe('usePermission hook', () => {
    it('returns true/false based on current user role', () => { /* ... */ });
    it('reacts to role change (login as different user)', () => { /* ... */ });
  });

  describe('<Can> component', () => {
    it('renders children when permission granted', () => { /* ... */ });
    it('renders null when denied', () => { /* ... */ });
    it('renders fallback when provided', () => { /* ... */ });
  });
});

// Backend decorator test
describe('@RequirePermission', () => {
  it('allows request when user has permission', async () => { /* ... */ });
  it('returns 403 when missing permission', async () => { /* ... */ });
  it('returns 401 when no session', async () => { /* ... */ });
});
```

---

## F16 — Multi-Sucursal Real

### PRD

**Estado actual:** `Branch` existe en schema pero no se usa para aislar datos.

**Objetivo:** Cada sucursal opera como unidad independiente con stock, ventas, usuarios, reportes separados.

**Cambios core:**
1. **User.branchId** obligatorio (excepto Admin global)
2. **Stock por sucursal:** `Lot.branchId`, `StockMovement.branchId`, `ProductStock` vista por branch
3. **Ventas/Órdenes/OC:** `branchId` obligatorio, filtrado automático por branch del user
4. **Reportes:** agregados por branch + consolidated (Admin global)
5. **UI:** Branch selector en header (Admin global ve todas; usuario ve solo su branch)

**Migración de datos:** Script para asignar branchId a datos existentes (default: branch principal).

---

### TDD Specs

```typescript
// test/multi-branch/multi-branch.e2e-spec.ts
describe('Multi-Branch Isolation', () => {
  let branchA: Branch, branchB: Branch;
  let userA: User, userB: User, admin: User;

  beforeEach(async () => {
    branchA = await createBranch({ name: 'Sucursal Centro' });
    branchB = await createBranch({ name: 'Sucursal Norte' });
    userA = await createUser({ branchId: branchA.id, role: 'Reception' });
    userB = await createUser({ branchId: branchB.id, role: 'Reception' });
    admin = await createUser({ branchId: null, role: 'Admin' }); // global
  });

  it('userA sees only branchA products', async () => {
    const pA = await createProduct({ branchId: branchA.id });
    const pB = await createProduct({ branchId: branchB.id });
    const res = await request(app).get('/api/products').set('Cookie', userA.cookie).expect(200);
    expect(res.body.data.map(p => p.id)).toContain(pA.id);
    expect(res.body.data.map(p => p.id)).not.toContain(pB.id);
  });

  it('userA creates sale auto-assigned to branchA', async () => { /* ... */ });
  it('userA cannot create sale with client from branchB', async () => { /* 403 */ });
  it('admin sees all branches with ?branchId= filter', async () => { /* ... */ });
  it('stock movements scoped to branch', async () => { /* ... */ });
  it('reports aggregated by branch + consolidated for admin', async () => { /* ... */ });
});
```

---

## F17 — Integraciones Externas (Facturación/Contabilidad)

### PRD

**Objetivo:** Conectar con AFIP (Argentina) / SUNAT (Perú) / SII (Chile) + contabilidad (Xero, QuickBooks, contabilidad local).

**Arquitectura:** Adapter pattern — `InvoiceProvider` interface con implementaciones por país/proveedor.

```typescript
interface InvoiceProvider {
  generateInvoice(sale: Sale): Promise<InvoiceResult>; // { cae, pdfUrl, xmlUrl }
  voidInvoice(invoiceId: string): Promise<void>;
  getInvoiceStatus(invoiceId: string): Promise<InvoiceStatus>;
  syncCatalog(products: Product[]): Promise<void>; // códigos de barra, unidades de medida
}
```

**MVP por país:**
- **Argentina (AFIP):** WSFEv1 + WSFEv2, QR, CAE, PDF A4
- **Perú (SUNAT):** Factura electrónica 2.1, CDR, XML UBL 2.1
- **Chile (SII):** DTE, timbre electrónico, PDF

**Contabilidad:** Webhooks sale.created, sale.cancelled, purchase_order.received → push a endpoint configurable.

---

### TDD Specs

```typescript
// test/integrations/afip-adapter.spec.ts
describe('AFIP Invoice Adapter', () => {
  const mockWSAA = nock('https://wsaa.afip.gov.ar');
  const mockWSFE = nock('https://servicios1.afip.gov.ar');

  beforeEach(() => {
    mockWSAA.post('/ws/services/LoginCms').reply(200, { token: 'MOCK_TOKEN', sign: 'MOCK_SIGN' });
  });

  it('generates invoice and returns CAE + PDF', async () => {
    mockWSFE.post('/wsfev1/service.asmx').reply(200, soapResponseWithCAE('12345678'));
    const result = await afipAdapter.generateInvoice(mockSale);
    expect(result.cae).toBe('12345678');
    expect(result.pdfUrl).toMatch(/^https?:\/\//);
  });

  it('handles AFIP error 10001 (token expired) → re-auth + retry', async () => { /* ... */ });
  it('voids invoice correctly', async () => { /* ... */ });
});

// test/integrations/accounting-webhook.spec.ts
describe('Accounting Webhooks', () => {
  it('POST /webhooks/accounting on sale.created with correct payload', async () => { /* ... */ });
  it('retries with exponential backoff on 5xx', async () => { /* ... */ });
  it('idempotency key prevents duplicate processing', async () => { /* ... */ });
});
```

---

## F18 — Mobile/PWA Offline-First

### PRD

**Objetivo:** App instalable para técnicos (mecánicos) y recepción que funcione offline.

**Scope:**
1. **PWA:** manifest, service worker (Workbox), instalable en Android/iOS
2. **Offline reads:** Cache-first para catálogos (productos, servicios, clientes, vehículos)
3. **Offline writes (mutation queue):**
   - Crear WO offline → cola local → sync al reconectar
   - Actualizar estado WO (in_progress → done) offline
   - Agregar líneas a WO offline
4. **Conflict resolution:** Last-write-wins con timestamp + server validation
5. **Background sync:** PeriodicSync API + manual "Sincronizar" button

**Técnico:**
- IndexedDB (idb) para storage local
- React Query `persistQueryClient` + `mutationCache`
- Service worker: precache static assets, runtime cache API GET
- Push notifications para WO asignadas (Web Push API + VAPID)

---

### TDD Specs

```typescript
// src/features/offline/offline-queue.test.ts
describe('Offline Mutation Queue', () => {
  it('enqueues create WO when offline', async () => {
    await act(async () => {
      await mutationQueue.enqueue('createWorkOrder', { clientId: '1', vehicleId: '1' });
    });
    expect(await mutationQueue.getAll()).toHaveLength(1);
  });

  it('flushes queue on online event', async () => {
    mockNetwork.offline();
    await mutationQueue.enqueue('createWorkOrder', payload);
    mockNetwork.online();
    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/work-orders', payload));
  });

  it('resolves conflicts: server wins on version mismatch', async () => { /* ... */ });
});

// cypress/e2e/offline-first.cy.ts
describe('Offline-First PWA', () => {
  it('installs as PWA (manifest + SW registered)', () => { /* ... */ });
  it('loads cached products/services when offline', () => { /* ... */ });
  it('creates WO offline → appears in list → syncs when online', () => { /* ... */ });
  it('shows "Sincronizando..." badge during background sync', () => { /* ... */ });
});
```

---

## F19 — Tests E2E (Cypress/Playwright)

### PRD

**Estado actual:** Solo unit/integration (Vitest). No hay tests de navegador real.

**Objetivo:** Suite E2E cubriendo happy paths críticos + regression guards.

**Stack:** Playwright (recomendado sobre Cypress por multi-browser, parallel, fixtures).

**Cobertura MVP (Critical Paths):**
1. Auth: login → logout → session persist
2. Nueva orden de trabajo completa (cliente → vehículo → productos/servicios → guardar)
3. Nueva venta completa (walk-in + con cliente → pago → ticket)
4. Cierre de caja (preview → declarar → cerrar → ver PDF)
5. Crear producto + usarlo en venta
6. Orden de compra → recibir → verificar stock
7. Permisos: Admin vs Reception vs Mechanic ven cosas distintas

**CI:** GitHub Actions con matrix chromium/firefox/webkit, artifacts en fallo (trace, screenshot, video).

---

### TDD Specs (Playwright)

```typescript
// e2e/critical-paths.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Critical Paths', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name=email]', 'admin@cocos.dev');
    await page.fill('[name=password]', 'cocos1234');
    await page.click('button[type=submit]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('Complete Work Order flow', async ({ page }) => {
    await page.goto('/work-orders/new');
    await page.selectOption('#client', { label: 'Cliente Demo' });
    await page.selectOption('#vehicle', { label: 'ABC-123' });
    await page.click('button:has-text("Agregar servicio")');
    await page.selectOption('#service', { label: 'Cambio de aceite' });
    await page.click('button:has-text("Agregar producto")');
    await page.selectOption('#product', { label: 'Filtro de aceite' });
    await page.fill('#quantity', '1');
    await page.click('button:has-text("Guardar")');
    await expect(page.locator('text=Orden creada')).toBeVisible();
  });

  test('Complete Sale flow (walk-in)', async ({ page }) => {
    await page.goto('/sales/new');
    await page.click('button:has-text("Agregar producto")');
    await page.selectOption('#product', { label: 'Aceite 5W30' });
    await page.fill('#quantity', '2');
    await page.click('button:has-text("Pagar")');
    await page.selectOption('#paymentMethod', 'cash');
    await page.click('button:has-text("Confirmar")');
    await expect(page.locator('text=Venta completada')).toBeVisible();
  });

  test('Cash Closing: preview → declare → close → PDF', async ({ page }) => {
    await page.goto('/cash-closings/close');
    await expect(page.locator('text=Efectivo esperado')).toBeVisible();
    await page.fill('#declaredCash', '15000.00');
    await page.click('button:has-text("Cerrar caja")');
    await expect(page.locator('text=Caja cerrada')).toBeVisible();
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Descargar PDF")');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/cierre-caja-\d{4}-\d{2}-\d{2}\.pdf/);
  });

  test('Role-based UI: Reception cannot see Users page', async ({ page, context }) => {
    // login as reception
    await context.clearCookies();
    await page.goto('/login');
    await page.fill('[name=email]', 'reception@cocos.dev');
    await page.fill('[name=password]', 'cocos1234');
    await page.click('button[type=submit]');
    await page.goto('/users');
    await expect(page).toHaveURL('/unauthorized'); // or 403
  });
});
```

```yaml
# .github/workflows/e2e.yml
name: E2E Tests
on: [push, pull_request]
jobs:
  playwright:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        browser: [chromium, firefox, webkit]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22', cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: pnpm exec playwright install --with-deps ${{ matrix.browser }}
      - run: pnpm test:e2e --project=${{ matrix.browser }}
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-trace-${{ matrix.browser }}
          path: test-results/
```

---

## Priorización Sugerida

| Orden | Feature | Esfuerzo | Valor | Dependencias |
|---|---|---|---|---|
| 1 | F19 E2E Tests | M | 🛡️ Alta (confianza deploy) | Ninguna |
| 2 | F15 RBAC Granular | M | 🔐 Alta (seguridad) | Ninguna |
| 3 | F13 Reportes | L | 💰 Alta (valor negocio) | F15 (permisos reportes) |
| 4 | F14 Vehículos Historial | M | 🔧 Media (retención) | Ninguna |
| 5 | F16 Multi-Sucursal | XL | 🏢 Alta (escalabilidad) | F15 |
| 6 | F17 Integraciones | L | 🌍 Alta (compliance) | F15 |
| 7 | F18 PWA Offline | L | 📱 Media (UX técnicos) | F19 |

---

## Plantilla para nuevos items

```markdown
## F{XX} — {Nombre}

### PRD
**Objetivo:** ...
**Usuarios:** ...
**Features:** ...
**UI/UX:** ...
**Backend/API:** ...
**Migración datos:** ...

### TDD Specs
```typescript
// Archivo y describe blocks con casos: happy path, edge cases, errors, permissions
```

### Estimación
- Backend: X story points
- Frontend: Y story points
- Total: Z sprints
```

---

*Documento vivo — actualizar al iniciar cada feature.*
