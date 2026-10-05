# F13 — Reportes & Analytics — PRD + TDD Exhaustivo

> Análisis profundo: qué, por qué, cómo, edge cases, arquitectura, migración, tests.

---

## 1. CONTEXTO Y PROBLEMA REAL

### 1.1 Estado actual
- **Backend:** No existe ningún endpoint de reportes. Solo `/api/dashboard/summary` (6 contadores simples).
- **Frontend:** `DashboardPage` muestra 6 StatCards hardcodeadas + "Actividad reciente" stub.
- **Datos disponibles:** Sales (con productos/servicios, employee, branch, paymentMethod), WorkOrders (con services/products, mechanic, status), PurchaseOrders (con supplier, status, receipts), Products (con lotes FIFO, stock), Clients/Vehicles (con historial).

### 1.2 Dolor real del usuario
| Usuario | Pregunta que no puede responder hoy |
|---|---|
| Dueño | "¿Cuánto gané realmente este mes? (ingreso - costo FIFO)" |
| Dueño | "¿Qué vendedor vende más y qué vende?" |
| Gerente | "¿Qué productos me dan margen y cuáles pierdo plata?" |
| Recepción | "¿Qué se vende más para sugerir en checkout?" |
| Mecánico | "¿Cuántas WO hice y cuánto tardé en promedio?" |
| Compras | "¿Qué productos están por debajo del punto de reposición?" |

### 1.3 Decisión de arquitectura: **Reportes como dominio separado**
No meter en `DashboardModule`. Crear `ReportsModule` propio porque:
- Consultas pesadas (agregaciones, window functions, CTEs)
- Diferentes permisos (Admin only vs Dashboard all-roles)
- Caché TTL distinto (reportes: 5-15 min; dashboard: 30s)
- Evolución independiente (nuevos reportes sin tocar dashboard)

---

## 2. PRD DETALLADO

### 2.1 Objetivo
Entregar 5 reportes core MVP con:
- Filtros de fecha flexibles (presets + custom)
- Export CSV/Excel/PDF
- Drill-down navegable
- Rendimiento < 2s para 10k ventas
- Permisos: **Admin only** (info sensible: márgenes, rankings)

### 2.2 Reportes MVP (alcance fijo)

| ID | Reporte | Métricas clave | Granularidad | Filtros |
|---|---|---|---|---|
| R1 | **Ventas por Vendedor** | totalSales, totalAmount, avgTicket, itemsPerSale, rank | Vendedor + día | from, to, branchId, sellerId |
| R2 | **Top Productos** | qtySold, revenue, margin, marginPct | Producto | from, to, categoryId, limit (10/25/50), sortBy (qty|revenue|margin) |
| R3 | **Margen por Categoría** | revenue, cogs (FIFO), margin, marginPct, qtySold | Categoría (con parent) | from, to |
| R4 | **Stock Crítico** | product, currentStock, reorderPoint, suggestedQty, daysOfStock | Producto | branchId, solo críticos (bool) |
| R5 | **WO por Técnico** | count, avgDuration, completionRate, reworkRate | Mecánico | from, to, status |

### 2.3 UI/UX Específica

#### Página principal: `/reports`
```
┌─────────────────────────────────────────────────────────────┐
│  Reportes                                    [Exportar PDF] │
├─────────────────────────────────────────────────────────────┤
│  [Hoy ▼] [Semana ▼] [Mes ▼] [Mes anterior ▼] [Custom...]   │
│  [Sucursal: Todas ▼]                              [Aplicar] │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────┐ │
│  │ R1 Vendedor │ │ R2 Productos│ │ R3 Categor. │ │ R4 Stk │ │
│  │ [Ver ▸]     │ │ [Ver ▸]     │ │ [Ver ▸]     │ │ [Ver ▸]│ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └────────┘ │
│  ┌─────────────┐                                             │
│  │ R5 Técnicos │                                             │
│  │ [Ver ▸]     │                                             │
│  └─────────────┘                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Vista detalle (ej. `/reports/sales-by-seller`)
- Tabla paginada, sortable, filtros laterales
- Click fila → drill-down (ej. vendedor → `/reports/sales-by-seller?sellerId=X`)
- Botón "Exportar CSV" / "Exportar Excel" / "Exportar PDF"

### 2.4 Backend: Endpoints y Contratos

```
GET /api/reports/sales-by-seller
  Query: from, to, branchId?, sellerId?, page, limit
  Response: { data: SellerSales[], meta }

GET /api/reports/top-products
  Query: from, to, categoryId?, limit?, sortBy?, branchId?
  Response: { data: TopProduct[], meta }

GET /api/reports/margin-by-category
  Query: from, to, branchId?
  Response: { data: CategoryMargin[] }

GET /api/reports/stock-critical
  Query: branchId?, onlyCritical?
  Response: { data: StockCriticalItem[] }

GET /api/reports/work-orders-by-tech
  Query: from, to, branchId?, mechanicId?
  Response: { data: TechWOStats[] }
```

**Todos:** `200 OK`, `400` (fechas inválidas), `403` (no Admin), `401` (no session).

### 2.5 Cálculos Críticos (fuente de bugs si no se especifica)

#### FIFO Cost of Goods Sold (para R2 margin, R3)
```
Para cada SaleProduct line:
  1. Obtener lotes del producto ordenados por receivedAt ASC (FIFO)
  2. Consumir qty de lotes hasta cubrir quantity vendida
  3. COGS = Σ (qty_consumida_lote_i * costPrice_lote_i)
  4. Margin = revenue - COGS
  5. MarginPct = margin / revenue * 100
```
**Edge cases:**
- Venta qty > stock disponible en lotes → usar último costPrice conocido (fallback)
- Lote con costPrice null → excluir de margin (log warning)
- Producto sin lotes (servicio) → margin = revenue (100%)

#### Reorder Point / Days of Stock (R4)
```
daysOfStock = currentStock / (qtySoldLast30Days / 30)
suggestedQty = max(0, reorderPoint * 3 - currentStock)  // 3x buffer
```
Si `qtySoldLast30Days = 0` → daysOfStock = null, suggestedQty = reorderPoint

#### Completion Rate (R5)
```
completionRate = WOs_done / (WOs_done + WOs_cancelled) * 100
reworkRate = WOs_reopened / WOs_done * 100
avgDuration = AVG(closedAt - createdAt) solo WOs_done
```

### 2.6 Performance Targets
| Reporte | Registros base | Target P95 |
|---|---|---|
| R1 | 50k sales | < 800ms |
| R2 | 50k sales × 10 products | < 1.2s |
| R3 | 50k sales × 20 cats | < 1s |
| R4 | 5k products | < 300ms |
| R5 | 20k WOs | < 600ms |

**Estrategia:**
- Índices compuestos: `(branchId, createdAt)`, `(productId, createdAt)`, `(employeeId, status, createdAt)`
- Materialized view `mv_daily_sales_summary` refrescada cada 15 min (pg_cron)
- Cache Redis TTL 5 min con key `report:{name}:{hash(filters)}`

### 2.7 Permisos
| Reporte | Roles permitidos |
|---|---|
| Todos | **Admin only** (márgenes, rankings, costos) |
| Futuro: "Ventas por vendedor (solo mío)" | Reception/Mechanic (solo own) |

### 2.8 Migración de datos
- **Ninguna** (reportes leen tablas existentes)
- Solo crear materialized view + índices + pg_cron job

---

## 3. ARQUITECTURA TÉCNICA

### 3.1 Estructura de módulos (backend)
```
src/reports/
├── reports.module.ts
├── reports.controller.ts
├── reports.service.ts
├── reports.service.spec.ts
├── reports.controller.spec.ts
├── dto/
│   ├── list-sales-by-seller-query.dto.ts
│   ├── list-top-products-query.dto.ts
│   ├── list-margin-by-category-query.dto.ts
│   ├── list-stock-critical-query.dto.ts
│   ├── list-wo-by-tech-query.dto.ts
│   └── export-report-query.dto.ts
├── providers/
│   ├── fifo-cogs.provider.ts      # Lógica FIFO reutilizable
│   ├── sales-aggregation.provider.ts
│   ├── margin-calculator.provider.ts
│   └── stock-analyzer.provider.ts
├── views/
│   └── mv-daily-sales-summary.sql  # Materialized view DDL
└── reports.module.ts
```

### 3.2 Frontend: Feature structure
```
src/features/reports/
├── api/                    # 5 archivos + export
├── hooks/                  # 5 useReport hooks + useExport
├── components/
│   ├── ReportCard.tsx      # Card en grid principal
│   ├── ReportFilters.tsx   # DateRange + BranchSelect + botón Aplicar
│   ├── ReportTable.tsx     # Tabla genérica sortable/paginada
│   ├── DrillDownLink.tsx   # Link con icono chevron
│   └── ExportButtons.tsx   # CSV/Excel/PDF
├── pages/
│   ├── ReportsDashboard.tsx    # Grid de 5 cards
│   ├── SalesBySellerPage.tsx
│   ├── TopProductsPage.tsx
│   ├── MarginByCategoryPage.tsx
│   ├── StockCriticalPage.tsx
│   └── WorkOrdersByTechPage.tsx
├── schemas/
│   └── report-filters-schema.ts  # Zod para query params
├── types.ts
└── utils/
    ├── export-csv.ts
    ├── export-excel.ts
    └── export-pdf.ts
```

### 3.3 Integración con navegación
```typescript
// navigation.ts
{
  label: 'Analytics',
  icon: IconChartBar,
  allowedRoles: ['Admin'],
  items: [
    { label: 'Reportes', path: '/reports' }
  ]
}
```

---

## 4. TDD SPECS EXHAUSTIVOS

### 4.1 Backend — Unit Tests (providers)

```typescript
// src/reports/providers/fifo-cogs.provider.spec.ts
describe('FifoCogsProvider', () => {
  let provider: FifoCogsProvider;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(() => {
    prisma = createMockPrisma();
    provider = new FifoCogsProvider(prisma);
  });

  describe('calculateCogsForSaleLines', () => {
    it('consumes lots in FIFO order', async () => {
      // Setup: product con 3 lotes
      // Lote A: receivedAt 2026-01-01, qty 10, cost 50
      // Lote B: receivedAt 2026-01-15, qty 5, cost 55
      // Lote C: receivedAt 2026-02-01, qty 20, cost 48
      // Venta: 12 unidades
      // Expected: 10 * 50 + 2 * 55 = 610
    });

    it('falls back to last known cost when lots exhausted', async () => {
      // Venta: 100 unidades, solo 35 en lotes
      // Expected: 35 * weighted avg + 65 * last costPrice
    });

    it('handles service lines (no COGS)', async () => {
      // SaleService line → cogs = 0, margin = revenue
    });

    it('excludes lots with null costPrice', async () => {
      // Lote con costPrice null → skip, log warning
    });

    it('handles concurrent sales correctly (isolation)', async () => {
      // Dos ventas simultáneas del mismo producto → cada una ve stock correcto
    });
  });

  describe('calculateCogsForProductInPeriod', () => {
    it('aggregates COGS across multiple sales in date range', async () => { /* ... */ });
    it('groups by product', async () => { /* ... */ });
  });
});
```

```typescript
// src/reports/providers/margin-calculator.provider.spec.ts
describe('MarginCalculatorProvider', () => {
  it('calculates margin = revenue - cogs', () => { /* ... */ });
  it('calculates marginPct = margin / revenue * 100', () => { /* ... */ });
  it('returns 100% margin for services (cogs = 0)', () => { /* ... */ });
  it('handles revenue = 0 (margin = 0, marginPct = 0)', () => { /* ... */ });
  it('rounds to 2 decimals', () => { /* ... */ });
});
```

```typescript
// src/reports/providers/stock-analyzer.provider.spec.ts
describe('StockAnalyzerProvider', () => {
  describe('getCriticalStock', () => {
    it('returns products where currentStock <= reorderPoint', () => { /* ... */ });
    it('calculates daysOfStock = currentStock / (qty30d / 30)', () => { /* ... */ });
    it('returns null daysOfStock when qty30d = 0', () => { /* ... */ });
    it('suggestedQty = max(0, reorderPoint * 3 - currentStock)', () => { /* ... */ });
    it('respects branchId filter', () => { /* ... */ });
    it('onlyCritical=true filters out OK products', () => { /* ... */ });
  });
});
```

### 4.2 Backend — Controller Tests

```typescript
// src/reports/reports.controller.spec.ts
describe('ReportsController', () => {
  let controller: ReportsController;
  let service: jest.Mocked<ReportsService>;

  const adminUser = { role: { name: 'Admin' } };
  const receptionUser = { role: { name: 'Reception' } };

  describe('GET /sales-by-seller', () => {
    it('returns 200 with paginated data for Admin', async () => { /* ... */ });
    it('returns 403 for Reception', async () => {
      const req = { user: receptionUser };
      await expect(controller.getSalesBySeller(req, {})).rejects.toThrow(ForbiddenException);
    });
    it('validates from <= to', async () => { /* 400 */ });
    it('applies branchId filter', async () => { /* ... */ });
    it('applies sellerId filter', async () => { /* ... */ });
    it('paginates correctly', async () => { /* ... */ });
  });

  // Repetir para cada endpoint: top-products, margin-by-category, stock-critical, wo-by-tech
  // Tests comunes: 403 no-Admin, 400 validación, filtros, paginación
});
```

### 4.3 Backend — E2E Tests (contract)

```typescript
// test/reports/reports.e2e-spec.ts
describe('Reports API (e2e)', () => {
  let app: INestApplication;
  let adminCookie: string;

  beforeAll(async () => {
    app = await createTestApp();
    adminCookie = await loginAsAdmin(app);
    await seedReportTestData(app); // 3 sellers, 20 products, 50 sales, 30 WOs, 5 categories, 3 branches
  });

  afterAll(async () => { await app.close(); });

  describe('GET /api/reports/sales-by-seller', () => {
    it('returns sellers ranked by totalAmount DESC', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/reports/sales-by-seller?from=2026-01-01&to=2026-01-31')
        .set('Cookie', adminCookie)
        .expect(200);

      expect(res.body.data).toHaveLength(3);
      expect(res.body.data[0].totalAmount).toBeGreaterThan(res.body.data[1].totalAmount);
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

    it('filters by branchId', async () => { /* ... */ });
    it('filters by sellerId', async () => { /* ... */ });
    it('paginates with page/limit', async () => { /* ... */ });
    it('validates date format (ISO)', async () => { /* 400 */ });
    it('returns 403 for non-Admin', async () => { /* ... */ });
  });

  describe('GET /api/reports/top-products', () => {
    it('sorts by qtySold DESC by default', async () => { /* ... */ });
    it('sorts by revenue when sortBy=revenue', async () => { /* ... */ });
    it('sorts by margin when sortBy=margin', async () => { /* ... */ });
    it('limits results with limit param', async () => { /* ... */ });
    it('filters by categoryId', async () => { /* ... */ });
    it('includes margin and marginPct (2 decimals)', async () => { /* ... */ });
  });

  describe('GET /api/reports/margin-by-category', () => {
    it('includes parent category name', async () => { /* ... */ });
    it('calculates margin using FIFO COGS', async () => { /* ... */ });
    it('returns 0 margin for categories with no sales', async () => { /* ... */ });
  });

  describe('GET /api/reports/stock-critical', () => {
    it('returns only products with stock <= reorderPoint', async () => { /* ... */ });
    it('calculates daysOfStock correctly', async () => { /* ... */ });
    it('suggestedQty = max(0, reorderPoint * 3 - currentStock)', async () => { /* ... */ });
    it('returns null daysOfStock when no sales in 30d', async () => { /* ... */ });
    it('respects branchId filter', async () => { /* ... */ });
  });

  describe('GET /api/reports/work-orders-by-tech', () => {
    it('calculates completionRate = done / (done + cancelled)', async () => { /* ... */ });
    it('calculates reworkRate = reopened / done', async () => { /* ... */ });
    it('avgDuration only for done WOs', async () => { /* ... */ });
  });

  // Export tests
  describe('Export endpoints', () => {
    it('GET /export?format=csv returns text/csv', async () => { /* ... */ });
    it('GET /export?format=excel returns application/vnd.openxmlformats', async () => { /* ... */ });
    it('GET /export?format=pdf returns application/pdf', async () => { /* ... */ });
  });
});
```

### 4.4 Frontend — Unit Tests

```typescript
// src/features/reports/components/ReportFilters.test.tsx
describe('ReportFilters', () => {
  it('renders date presets: Hoy, Semana, Mes, Mes anterior, Custom', () => { /* ... */ });
  it('shows custom date inputs when "Custom" selected', () => { /* ... */ });
  it('branch select only shows for Admin (others hidden)', () => { /* ... */ });
  it('onApply calls onChange with parsed filters', () => { /* ... */ });
  it('validates from <= to', () => { /* ... */ });
  it('resets to default when "Limpiar" clicked', () => { /* ... */ });
});

```typescript
// src/features/reports/components/ReportTable.test.tsx
describe('ReportTable', () => {
  it('renders columns from config', () => { /* ... */ });
  it('sorts on header click (asc/desc/none cycle)', () => { /* ... */ });
  it('paginates with page size selector', () => { /* ... */ });
  it('shows loading skeleton while isLoading', () => { /* ... */ });
  it('shows error inline with retry button', () => { /* ... */ });
  it('drill-down link navigates to detail with context', () => { /* ... */ });
});
```

```typescript
// src/features/reports/pages/SalesBySellerPage.test.tsx
describe('SalesBySellerPage', () => {
  it('fetches data on mount with default filters', () => { /* ... */ });
  it('refetches when filters change', () => { /* ... */ });
  it('clicking seller row navigates to drill-down with sellerId', () => { /* ... */ });
  it('Export CSV downloads file with correct columns', () => { /* ... */ });
  it('Export Excel downloads .xlsx', () => { /* ... */ });
  it('Export PDF downloads .pdf', () => { /* ... */ });
});
```

```typescript
// src/features/reports/hooks/useExport.test.ts
describe('useExport', () => {
  it('CSV: generates proper headers + rows with ; delimiter', () => { /* ... */ });
  it('Excel: generates valid .xlsx with sheet', () => { /* ... */ });
  it('PDF: generates valid .pdf with title + table', () => { /* ... */ });
  it('filename includes report name + date range', () => { /* ... */ });
});
```

### 4.5 Frontend — E2E (Playwright) — Happy Paths

```typescript
// e2e/reports.spec.ts
test.describe('Reports', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/reports');
  });

  test('Dashboard shows 5 report cards', async ({ page }) => {
    await expect(page.locator('text=Ventas por vendedor')).toBeVisible();
    await expect(page.locator('text=Top productos')).toBeVisible();
    await expect(page.locator('text=Margen por categoría')).toBeVisible();
    await expect(page.locator('text=Stock crítico')).toBeVisible();
    await expect(page.locator('text=WO por técnico')).toBeVisible();
  });

  test('Sales by Seller: loads table, sorts, paginates, drills down', async ({ page }) => {
    await page.click('text=Ventas por vendedor >> .. >> button:has-text("Ver")');
    await expect(page).toHaveURL('/reports/sales-by-seller');
    await expect(page.locator('table')).toBeVisible();
    
    // Sort by totalAmount
    await page.click('th:has-text("Total")');
    await expect(page.locator('tbody tr:first-child td:nth-child(4)')).toContainText(/\d+\.\d{2}/);
    
    // Drill-down
    await page.click('tbody tr:first-child >> a:has-text("Ver detalle")');
    await expect(page).toHaveURL(/\/reports\/sales-by-seller\?sellerId=/);
  });

  test('Top Products: changes sortBy, exports CSV', async ({ page }) => {
    await page.goto('/reports/top-products');
    await page.selectOption('#sortBy', 'margin');
    await expect(page.locator('tbody tr:first-child')).toContainText(/\d+\.\d{2}%/);
    
    const download = await page.waitForEvent('download');
    await page.click('button:has-text("Exportar CSV")');
    expect(download.suggestedFilename()).toMatch(/top-products-\d{4}-\d{2}-\d{2}\.csv/);
  });

  test('Stock Critical: filters by branch, shows daysOfStock', async ({ page }) => {
    await page.goto('/reports/stock-critical');
    await page.selectOption('#branchId', 'Sucursal Norte');
    await expect(page.locator('tbody tr:first-child td:last-child')).toContainText(/días|null/);
  });

  test('WO by Tech: shows completionRate and reworkRate', async ({ page }) => {
    await page.goto('/reports/work-orders-by-tech');
    await expect(page.locator('tbody tr:first-child')).toContainText(/\d+%/); // completionRate
    await expect(page.locator('tbody tr:first-child')).toContainText(/\d+%/); // reworkRate
  });

  test('Date presets work: Hoy, Semana, Mes', async ({ page }) => {
    await page.goto('/reports/sales-by-seller');
    await page.click('#datePreset');
    await page.click('text=Esta semana');
    await expect(page.locator('#from')).toHaveValue(expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/));
  });
});
```

---

## 5. PLAN DE EJECUCIÓN (Work Units)

| Task | Descripción | Archivos clave | Tests nuevos | Estimación |
|---|---|---|---|---|
| F13.1 | Backend: ReportsModule + DTOs + 5 endpoints + providers (FIFO, margin, stock) | 15 archivos | 45 unit | 3 sprints |
| F13.2 | Backend: Materialized view + índices + pg_cron job | 3 archivos (SQL + migration) | 5 integration | 1 sprint |
| F13.3 | Backend: Cache Redis + invalidación | 2 archivos | 5 unit | 0.5 sprint |
| F13.4 | Frontend: Reports feature (api, hooks, components, pages, export) | 20 archivos | 60 unit + 10 e2e | 3 sprints |
| F13.5 | Integración: nav + routes + pageTitles + permisos | 3 archivos | 5 e2e | 0.5 sprint |
| **Total** | | **~43 archivos** | **~120 tests** | **8 sprints** |

---

## 6. RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| FIFO COGS incorrecto en concurrencia | Media | Alto (márgenes errados) | Transacción serializable + test concurrencia |
| Materialized view stale | Baja | Medio | pg_cron cada 15 min + invalidación manual en mutaciones |
| Export Excel grande (>10k rows) timeout | Media | Bajo | Streaming XLSX (xlsx-stream) |
| Permisos: Reception ve márgenes | Baja | Crítico | Guard en controller + test 403 obligatorio |
| Performance > 2s en 50k sales | Media | Alto | MV + índices + cache Redis; benchmark en CI |

---

## 7. DEFINITION OF DONE

- [ ] 5 endpoints backend con tests unit + e2e (100% coverage en providers)
- [ ] MV + índices + pg_cron deployados en staging
- [ ] Frontend: 5 páginas + dashboard + exports (CSV/Excel/PDF)
- [ ] Playwright: 5 happy paths + 3 edge cases
- [ ] Permisos: 403 para no-Admin verificado en tests
- [ ] Performance: P95 < targets en staging con 50k sales seed
- [ ] Docs: README en `/reports` + Swagger actualizado
