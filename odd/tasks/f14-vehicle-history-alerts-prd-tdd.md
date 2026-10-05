# F14 — Vehículos: Historial & Alertas de Mantenimiento — PRD + TDD Exhaustivo

> Análisis profundo: historial unificado, alertas proactivas, widget dashboard, kilometraje.

---

## 1. CONTEXTO Y PROBLEMA REAL

### 1.1 Estado actual
- **Backend:** `Vehicle` entity existe (plate, brand, model, year, color, notes, clientId, isActive). **NO** tiene: `currentKm`, `maintenanceAlerts`, kilometraje histórico.
- **Frontend:** `ClientDetailPage` muestra tabla `VehicleList` básica. Click en vehículo → nada (no hay detail page). `VehicleForm` solo crea/edita campos básicos.
- **Datos relacionados:** `WorkOrder` tiene `vehicleId`, `WorkOrderService/Product` tienen precios. `Sale` tiene `vehicleId` (opcional). No hay link vehículo → historial.

### 1.2 Dolor real
| Usuario | Problema |
|---|---|
| Recepción | "¿Qué le hicimos a este auto la última vez?" → busca en WO manualmente |
| Mecánico | "¿Cuándo le cambié el aceite?" → memoria o papel |
| Dueño | "¿Este cliente trae el auto cada 6 meses o cada 2 años?" |
| Cliente | "Me avisan cuando toca mantenimiento?" → no hay sistema |

### 1.3 Decisiones de arquitectura
1. **Vehicle entity se extiende** (no tabla nueva): `currentKm`, `maintenanceAlerts (JSON)`, `lastServiceAt`
2. **Historial = vista computada** (no tabla nueva): une `WorkOrder` + `Sale` filtrados por `vehicleId`
3. **Alertas = configuración por vehículo** (JSON array), evaluadas en background job + al crear WO
4. **Kilometraje:** se actualiza en `WorkOrder` done → `Vehicle.currentKm = max(currentKm, wo.kilometraje)`

---

## 2. PRD DETALLADO

### 2.1 Objetivo
Convertir `Vehicle` en entidad con:
- **Historial navegable** (WO + Ventas + Mantenimientos sugeridos)
- **Alertas proactivas** (km/fecha, configurables por vehículo)
- **Widget dashboard** "Próximos mantenimientos" (Admin/Reception/Mechanic)
- **Kilometraje actualizado** automáticamente

### 2.2 Alcance MVP (fijo)

| Feature | Descripción |
|---|---|
| **Vehicle.currentKm** | Number, nullable, actualizable en WO done |
| **Vehicle.maintenanceAlerts** | `MaintenanceAlert[]` JSON: `{ type: 'oil'|'filter'|'brakes'|'tires'|'custom', intervalKm?, intervalMonths?, lastDoneKm?, lastDoneAt?, nextDueKm?, nextDueAt?, enabled }` |
| **Vehicle.lastServiceAt** | DateTime, nullable, actualizado en WO done |
| **GET /api/vehicles/:id/history** | Une WO + Sales + suggestedMaintenance |
| **GET /api/vehicles/alerts** | Lista vehículos con alerta vencida (para widget) |
| **PATCH /api/vehicles/:id** | Extendido para `currentKm`, `maintenanceAlerts` |
| **Background job** | Evalúa alertas cada 6h → crea notificaciones |
| **Frontend: VehicleDetailPage** | Tabs: Historial, Alertas, Mantenimientos |
| **Frontend: Widget dashboard** | "Próximos mantenimientos" (click → VehicleDetail) |

### 2.3 Modelo de datos: MaintenanceAlert

```typescript
type MaintenanceType = 'oil' | 'filter' | 'brakes' | 'tires' | 'spark_plugs' | 'suspension' | 'custom';

interface MaintenanceAlert {
  id: string;                    // UUID
  type: MaintenanceType;
  customName?: string;           // solo si type === 'custom'
  intervalKm?: number;           // ej. 5000
  intervalMonths?: number;       // ej. 6
  lastDoneKm?: number;           // km al último mantenimiento
  lastDoneAt?: string;           // ISO date
  nextDueKm?: number;            // calculado: lastDoneKm + intervalKm
  nextDueAt?: string;            // ISO date calculado
  enabled: boolean;              // default true
  notes?: string;
}
```

**Cálculo de `nextDue`:**
```
nextDueKm = lastDoneKm + intervalKm (si intervalKm definido)
nextDueAt = lastDoneAt + intervalMonths months (si intervalMonths definido)
```
Alerta **vencida** si: `currentKm >= nextDueKm` OR `now >= nextDueAt` (cualquiera que aplique).

### 2.4 Endpoints Nuevos / Modificados

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/vehicles/:id/history` | `{ workOrders, sales, suggestedMaintenance }` |
| `GET` | `/api/vehicles/alerts` | `[{ vehicle, alert, daysOverdue, kmOverdue }]` |
| `PATCH` | `/api/vehicles/:id` | Extiende body: `currentKm?`, `maintenanceAlerts?`, `lastServiceAt?` |
| `POST` | `/api/vehicles/:id/maintenance-done` | Body: `{ alertId, doneKm, doneAt }` → actualiza alerta, setea lastServiceAt/currentKm |

### 2.5 Frontend: VehicleDetailPage (`/vehicles/:id`)

```
┌────────────────────────────────────────────────────────────┐
│  Vehículo ABC-123  Toyota Corolla 2020  [Editar] [Alerta] │
├────────────────────────────────────────────────────────────┤
│  [Historial] [Alertas] [Mantenimientos]                    │
├────────────────────────────────────────────────────────────┤
│  HISTORIAL                                                 │
│  ┌────┬──────────┬──────────┬────────┬────────┬────────┐  │
│  │Tipo│ Fecha    │ Descripción          │ Total  │ Ver  │  │
│  ├────┼──────────┼──────────┼────────┼────────┼────────┤  │
│  │ WO │ 2026-01-15│ Cambio aceite + filtro│ $80.00 │ 👁  │  │
│  │ Vta│ 2026-02-10│ Filtro aceite x1      │ $45.00 │ 👁  │  │
│  │ WO │ 2026-03-20│ Frenos + alineación   │ $220.00│ 👁  │  │
│  └────┴──────────┴──────────┴────────┴────────┴────────┘  │
├────────────────────────────────────────────────────────────┤
│  ALERTAS                                                   │
│  ┌─────────┬──────────┬──────────┬──────────┬────────────┐ │
│  │ Tipo    │ Próx. km │ Próx. fecha│ Estado   │ Acción    │ │
│  ├─────────┼──────────┼──────────┼──────────┼────────────┤ │
│  │ 🛢 Aceite│ 45,000   │ 2026-07-15 │ 🟢 2,000km│ [Hecho]  │ │
│  │ 🔧 Frenos│ 50,000   │ 2026-08-01 │ 🔴 VENCIDO│ [Hecho]  │ │
│  └─────────┴──────────┴──────────┴──────────┴────────────┘ │
├────────────────────────────────────────────────────────────┤
│  MANTENIMIENTOS SUGERIDOS (basado en km/fecha)             │
│  • Aceite: cada 5,000 km o 6 meses → Próx: 45,000 km       │
│  │ Filtro: cada 10,000 km o 12 meses → Próx: 50,000 km     │
│  └────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

### 2.6 Widget Dashboard: "Próximos Mantenimientos"
- Ubicación: DashboardPage, card nueva (visible Admin/Reception/Mechanic)
- Muestra: Top 5 vehículos con alerta más próxima (km o fecha)
- Click → navega a `/vehicles/:id?tab=alerts`
- Actualización: refetch cada 5 min + invalidación al crear WO

### 2.7 Background Job: Evaluación de Alertas
- **Cron:** cada 6 horas (0, 6, 12, 18)
- **Lógica:**
  1. Obtener todos vehículos con `maintenanceAlerts.enabled = true`
  2. Para cada alerta habilitada → calcular `nextDueKm/At`
  3. Si `currentKm >= nextDueKm` OR `now >= nextDueAt` → **vencida**
  4. Crear notificación `type: 'maintenance_due'` con `link: /vehicles/:id?tab=alerts`
  5. Evitar duplicados: única notificación por alerta por vehículo hasta que se marque "Hecho"

### 2.8 Actualización de Kilometraje en WO
- En `WorkOrder` done: si `wo.kilometraje > vehicle.currentKm` → `vehicle.currentKm = wo.kilometraje`
- `vehicle.lastServiceAt = wo.closedAt`
- Disparar invalidación de cache de alertas

---

## 3. ARQUITECTURA TÉCNICA

### 3.1 Backend: Cambios en VehicleModule
```
src/vehicles/
├── dto/
│   ├── update-vehicle.dto.ts          # + currentKm, maintenanceAlerts
│   ├── maintenance-done.dto.ts        # { alertId, doneKm, doneAt }
│   └── vehicle-history.dto.ts         # Response DTO
├── providers/
│   ├── vehicle-history.provider.ts    # Une WO + Sales + suggested
│   ├── maintenance-alert.provider.ts  # Evaluación, nextDue, vencidas
│   └── vehicle-km.provider.ts         # Actualización km en WO done
├── vehicles.service.ts                # + getHistory, getAlerts, markMaintenanceDone
├── vehicles.controller.ts             # + GET :id/history, GET alerts, POST maintenance-done
├── vehicles.service.spec.ts
└── vehicles.controller.spec.ts
```

### 3.2 Schemas Prisma (migración)
```prisma
model Vehicle {
  // ... existentes
  currentKm         Int?        @map("current_km")
  lastServiceAt     DateTime?   @map("last_service_at")
  maintenanceAlerts Json?       @map("maintenance_alerts")  // MaintenanceAlert[]
  // ...
}
```

### 3.3 Background Job (pg_cron / NestJS Schedule)
```typescript
// src/maintenance/maintenance-scheduler.service.ts
@Injectable()
export class MaintenanceSchedulerService {
  @Cron('0 */6 * * *') // cada 6 horas
  async evaluateAlerts() {
    const vehicles = await this.prisma.vehicle.findMany({
      where: { isActive: true, maintenanceAlerts: { not: Prisma DbNull } },
      include: { client: true },
    });

    for (const vehicle of vehicles) {
      for (const alert of vehicle.maintenanceAlerts) {
        if (!alert.enabled) continue;
        const isOverdue = this.isAlertOverdue(vehicle, alert);
        if (isOverdue && !await this.notificationExists(vehicle.id, alert.id)) {
          await this.createMaintenanceNotification(vehicle, alert);
        }
      }
    }
  }
}
```

### 3.4 Frontend: Feature Structure
```
src/features/vehicles/
├── api/
│   ├── get-vehicle-history.ts
│   ├── get-vehicle-alerts.ts
│   ├── mark-maintenance-done.ts
│   └── update-vehicle.ts (extendido)
├── hooks/
│   ├── use-vehicle-history.ts
│   ├── use-vehicle-alerts.ts
│   └── use-mark-maintenance-done.ts
├── components/
│   ├── VehicleHistoryTab.tsx
│   ├── VehicleAlertsTab.tsx
│   ├── VehicleMaintenanceTab.tsx
│   ├── MaintenanceAlertCard.tsx
│   └── MaintenanceDoneDialog.tsx
├── pages/
│   └── VehicleDetailPage.tsx
├── widgets/
│   └── UpcomingMaintenanceWidget.tsx  # Para Dashboard
└── types.ts (extendido)
```

### 3.4 Integración Dashboard
```typescript
// src/features/dashboard/pages/DashboardPage.tsx
import { UpcomingMaintenanceWidget } from '@/features/vehicles/widgets/UpcomingMaintenanceWidget';

// En render:
<SectionCard title="Próximos mantenimientos">
  <UpcomingMaintenanceWidget />
</SectionCard>
```

---

## 4. TDD SPECS EXHAUSTIVOS

### 4.1 Backend — Unit Tests (Providers)

```typescript
// src/vehicles/providers/maintenance-alert.provider.spec.ts
describe('MaintenanceAlertProvider', () => {
  let provider: MaintenanceAlertProvider;

  describe('calculateNextDue', () => {
    it('calculates nextDueKm = lastDoneKm + intervalKm', () => {
      const alert = { type: 'oil', intervalKm: 5000, lastDoneKm: 40000 };
      expect(provider.calculateNextDue(alert, 45000)).toEqual({
        nextDueKm: 45000,
        nextDueAt: null,
      });
    });

    it('calculates nextDueAt = lastDoneAt + intervalMonths', () => {
      const alert = { type: 'oil', intervalMonths: 6, lastDoneAt: '2026-01-15' };
      expect(provider.calculateNextDue(alert, 0)).toEqual({
        nextDueKm: null,
        nextDueAt: '2026-07-15', // 6 meses después
      });
    });

    it('handles both km and months', () => { /* ... */ });
    it('returns null if no interval defined', () => { /* ... */ });
    it('handles custom type with customName', () => { /* ... */ });
  });

  describe('isAlertOverdue', () => {
    it('returns true when currentKm >= nextDueKm', () => { /* ... */ });
    it('returns true when now >= nextDueAt', () => { /* ... */ });
    it('returns false when neither condition met', () => { /* ... */ });
    it('returns false if alert disabled', () => { /* ... */ });
    it('ignores km check if intervalKm not set', () => { /* ... */ });
    it('ignores date check if intervalMonths not set', () => { /* ... */ });
  });

  describe('getSuggestedMaintenance', () => {
    it('returns default intervals for vehicle type (car)', () => {
      // Car: oil 5k/6m, filter 10k/12m, brakes 20k/24m, tires 40k/48m
    });
    it('excludes alerts already configured', () => { /* ... */ });
    it('calculates nextDue based on currentKm/lastServiceAt', () => { /* ... */ });
  });
});
```

```typescript
// src/vehicles/providers/vehicle-history.provider.spec.ts
describe('VehicleHistoryProvider', () => {
  let provider: VehicleHistoryProvider;
  let prisma: jest.Mocked<PrismaService>;

  describe('getHistory', () => {
    it('returns workOrders with services/products', async () => {
      // Mock WO con services + products
      // Expected: [{ type: 'work-order', id, date, description, total, items: [] }]
    });

    it('returns sales with products/services', async () => { /* ... */ });
    it('orders by date DESC', async () => { /* ... */ });
    it('includes suggestedMaintenance based on currentKm/lastServiceAt', async () => { /* ... */ });
    it('excludes cancelled WOs', async () => { /* ... */ });
    it('includes vehicleId filter', async () => { /* ... */ });
  });
});
```

```typescript
// src/vehicles/providers/vehicle-km.provider.spec.ts
describe('VehicleKmProvider', () => {
  describe('updateKmOnWorkOrderDone', () => {
    it('updates currentKm if wo.kilometraje > currentKm', async () => { /* ... */ });
    it('does not decrease currentKm', async () => { /* ... */ });
    it('sets lastServiceAt = wo.closedAt', async () => { /* ... */ });
    it('does nothing if wo.kilometraje null', async () => { /* ... */ });
    it('invalidates alert cache', async () => { /* ... */ });
  });
});
```

### 4.2 Backend — Controller Tests

```typescript
// src/vehicles/vehicles.controller.spec.ts
describe('VehiclesController (extended)', () => {
  describe('GET /vehicles/:id/history', () => {
    it('returns { workOrders, sales, suggestedMaintenance }', async () => { /* ... */ });
    it('orders by date DESC', async () => { /* ... */ });
    it('includes suggestedMaintenance based on currentKm', async () => { /* ... */ });
    it('returns 404 if vehicle not found', async () => { /* ... */ });
    it('requires authentication', async () => { /* 401 */ });
  });

  describe('GET /vehicles/alerts', () => {
    it('returns only vehicles with overdue alerts', async () => { /* ... */ });
    it('includes daysOverdue and kmOverdue', async () => { /* ... */ });
    it('Admin sees all branches', async () => { /* ... */ });
    it('Reception sees only own branch', async () => { /* ... */ });
  });

  describe('POST /vehicles/:id/maintenance-done', () => {
    it('updates alert lastDoneKm/At, sets nextDue', async () => { /* ... */ });
    it('updates vehicle.currentKm and lastServiceAt', async () => { /* ... */ });
    it('creates notification for next due', async () => { /* ... */ });
    it('returns 404 if alertId not found in vehicle', async () => { /* 404 */ });
  });
});
```

### 4.3 Backend — E2E Tests

```typescript
// test/vehicles/vehicle-history-alerts.e2e-spec.ts
describe('Vehicle History & Alerts (e2e)', () => {
  let app: INestApplication;
  let adminCookie: string;
  let vehicleId: string;

  beforeAll(async () => {
    app = await createTestApp();
    adminCookie = await loginAsAdmin(app);
    vehicleId = await seedVehicleWithAlerts(app); // vehicle con alertas oil/filter
  });

  describe('GET /vehicles/:id/history', () => {
    it('returns workOrders + sales + suggestedMaintenance', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/vehicles/${vehicleId}/history`)
        .set('Cookie', adminCookie)
        .expect(200);

      expect(res.body.workOrders).toBeInstanceOf(Array);
      expect(res.body.sales).toBeInstanceOf(Array);
      expect(res.body.suggestedMaintenance).toBeInstanceOf(Array);
      expect(res.body.suggestedMaintenance[0]).toMatchObject({
        type: expect.stringMatching(/oil|filter|brakes/),
        nextDueKm: expect.any(Number),
        nextDueAt: expect.any(String),
      });
    });
  });

  describe('GET /vehicles/alerts', () => {
    it('returns only overdue alerts', async () => { /* ... */ });
    it('includes kmOverdue and daysOverdue', async () => { /* ... */ });
  });

  describe('POST /vehicles/:id/maintenance-done', () => {
    it('marks alert as done, updates nextDue, updates vehicle km', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/vehicles/${vehicleId}/maintenance-done`)
        .set('Cookie', adminCookie)
        .send({ alertId: 'oil', doneKm: 45000, doneAt: new Date().toISOString() })
        .expect(200);

      expect(res.body.alert.nextDueKm).toBe(50000); // 45000 + 5000
      expect(res.body.vehicle.currentKm).toBe(45000);
      expect(res.body.vehicle.lastServiceAt).toBeDefined();
    });
  });
});
```

### 4.4 Frontend — Unit Tests

```typescript
// src/features/vehicles/components/VehicleAlertsTab.test.tsx
describe('VehicleAlertsTab', () => {
  it('renders alert cards with type icon, nextDueKm/At, status badge', () => { /* ... */ });
  it('shows green badge when km remaining > 0', () => { /* ... */ });
  it('shows red "VENCIDO" badge when overdue', () => { /* ... */ });
  it('click "Hecho" opens MaintenanceDoneDialog with prefilled doneKm=currentKm', () => { /* ... */ });
  it('submitting dialog calls markMaintenanceDone mutation', () => { /* ... */ });
});

```typescript
// src/features/vehicles/components/VehicleHistoryTab.test.tsx
describe('VehicleHistoryTab', () => {
  it('renders tabs: Órdenes, Ventas, Mantenimientos', () => { /* ... */ });
  it('shows WO with type badge, date, description, total, eye icon', () => { /* ... */ });
  it('click eye icon on WO navigates to /work-orders/:id', () => { /* ... */ });
  it('shows sales with product/service lines', () => { /* ... */ });
  it('shows suggestedMaintenance with nextDueKm/At', () => { /* ... */ });
});
```

```typescript
// src/features/vehicles/widgets/UpcomingMaintenanceWidget.test.tsx
describe('UpcomingMaintenanceWidget', () => {
  it('fetches /vehicles/alerts and shows top 5', () => { /* ... */ });
  it('shows vehicle plate, brand/model, alert type, nextDue', () => { /* ... */ });
  it('click row navigates to /vehicles/:id?tab=alerts', () => { /* ... */ });
  it('refetches every 5 minutes', () => { /* ... */ });
});
```

### 4.5 Frontend — Page Tests

```typescript
// src/features/vehicles/pages/VehicleDetailPage.test.tsx
describe('VehicleDetailPage', () => {
  it('shows vehicle header: plate, brand, model, year, client', () => { /* ... */ });
  it('tabs: Historial / Alertas / Mantenimientos', () => { /* ... */ });
  it('Historial tab: shows WO + Sales + Suggested, click eye navigates', () => { /* ... */ });
  it('Alertas tab: shows alert cards, click "Hecho" opens dialog', () => { /* ... */ });
  it('MaintenanceDoneDialog: submits, invalidates alerts, shows success', () => { /* ... */ });
  it('Mantenimientos tab: shows suggested with default intervals', () => { /* ... */ });
});
```

### 4.6 Frontend — E2E (Playwright)

```typescript
// e2e/vehicle-history-alerts.spec.ts
test.describe('Vehicle History & Alerts', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('VehicleDetailPage shows history tabs and data', async ({ page }) => {
    await page.goto('/vehicles');
    await page.click('tbody tr:first-child >> a:has-text("Ver")');
    await expect(page).toHaveURL(/\/vehicles\/[a-z0-9]+/);

    // Tabs
    await expect(page.locator('text=Historial')).toBeVisible();
    await expect(page.locator('text=Alertas')).toBeVisible();
    await expect(page.locator('text=Mantenimientos')).toBeVisible();

    // Historial tab
    await expect(page.locator('text=Historial')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();

    // Alertas tab
    await page.click('text=Alertas');
    await expect(page.locator('text=Alertas')).toBeVisible();
  });

  test('Mark maintenance done updates alert and vehicle', async ({ page }) => {
    await page.goto(`/vehicles/${vehicleWithOverdueAlert}`);
    await page.click('text=Alertas');
    await page.click('button:has-text("Hecho") >> nth=0'); // primera alerta vencida
    await page.fill('#doneKm', '45000');
    await page.click('button:has-text("Confirmar")');
    await expect(page.locator('text=Mantenimiento registrado')).toBeVisible();
    await expect(page.locator('text=VENCIDO')).not.toBeVisible(); // badge actualizado
  });

  test('Dashboard widget shows upcoming maintenance', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('text=Próximos mantenimientos')).toBeVisible();
    await expect(page.locator('tbody tr:first-child')).toContainText(/ABC-123/);
    await page.click('tbody tr:first-child >> a');
    await expect(page).toHaveURL(/\/vehicles\/[a-z0-9]+\?tab=alerts/);
  });

  test('Creating WO with kilometraje updates vehicle.currentKm', async ({ page }) => {
    await page.goto('/work-orders/new');
    await page.selectOption('#vehicle', { label: 'ABC-123 Toyota Corolla' });
    await page.fill('#kilometraje', '50000');
    // ... completar WO y guardar
    await page.goto('/vehicles');
    await page.click('text=ABC-123 >> .. >> a:has-text("Ver")');
    await expect(page.locator('text=Kilometraje actual: 50,000')).toBeVisible();
  });
});
```

---

## 5. PLAN DE EJECUCIÓN

| Task | Descripción | Archivos | Tests | Sprint |
|---|---|---|---|---|
| F14.1 | Backend: Vehicle entity + migration + DTOs + history/alerts providers | 8 archivos | 25 unit | 1 |
| F14.2 | Backend: Controller endpoints + background job (Schedule) | 4 archivos | 15 unit + 5 e2e | 1 |
| F14.3 | Frontend: VehicleDetailPage + 3 tabs + dialog + types | 10 archivos | 20 unit | 1 |
| F14.4 | Frontend: UpcomingMaintenanceWidget + Dashboard integración | 3 archivos | 5 unit + 3 e2e | 0.5 |
| F14.5 | Integración: routes, nav (VehicleDetail en ClientDetail), pageTitles | 3 archivos | 3 e2e | 0.5 |
| **Total** | | **~28 archivos** | **~60 tests** | **3.5 sprints** |

---

## 6. RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Alertas duplicadas en background job | Media | Medio | Unique constraint en notification (vehicleId + alertId) + check exists |
| Kilometraje decreciente en WO | Baja | Medio | Validación en provider: solo aumentar |
| Alertas custom sin intervalo | Baja | Bajo | Validación: custom requiere intervalKm o intervalMonths |
| Performance history en vehículos con 100+ WOs | Media | Medio | Paginación en history endpoint, índices en vehicleId+createdAt |

---

## 7. DEFINITION OF DONE

- [ ] Vehicle entity extendido + migración Prisma
- [ ] 4 endpoints backend + background job con tests
- [ ] VehicleDetailPage con 3 tabs funcionales
- [ ] MaintenanceDoneDialog funcional + invalida cache
- [ ] UpcomingMaintenanceWidget en Dashboard visible para roles correctos
- [ ] Background job cada 6h crea notificaciones sin duplicados
- [ ] WO done actualiza vehicle.currentKm + lastServiceAt
- [ ] Tests: 40 unit + 10 e2e + 5 Playwright
