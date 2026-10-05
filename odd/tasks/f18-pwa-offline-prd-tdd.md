# F18 — Mobile / PWA Offline-First — PRD + TDD Exhaustivo

> Análisis profundo: PWA installable, cache strategies, cola de operaciones offline, sync con resolución de conflictos, responsive audit completo.

---

## 1. CONTEXTO Y PROBLEMA REAL

### 1.1 Estado actual
- La app es web responsive básica (Tailwind), pero **no es PWA**: no instalable, no funciona sin conexión.
- El mecánico en el taller tiene señal mala/intermitente → pierde trabajo al cargar WO si se corta el wifi.
- Recepción usa tablet compartida; si cae el internet del local, no puede cobrar.
- No hay push notifications (depende de F11 para notificaciones in-app).

### 1.2 Alcance MVP (decisiones clave)
1. **PWA installable**: manifest + service worker (Workbox via `vite-plugin-pwa`) + icons.
2. **Offline READ**: cache de datos de solo-lectura frecuentes (productos, servicios, vehículos, clientes) con estrategia stale-while-revalidate.
3. **Offline WRITE con cola**: operaciones críticas del taller (avance de WO, agregar ítem a WO) encoladas en IndexedDB y sincronizadas al volver conexión.
4. **NO offline**: pagos/caja (riesgo financiero), compras, reportes → muestran banner "requiere conexión".
5. **Responsive audit**: 20 páginas principales verificadas en 360px/768px/1024px con fixes.
6. **NO push notifications** en MVP (queda para F18.2 — requiere backend Web Push + VAPID).

### 1.3 Por qué cola y no CRDT/otro
Las operaciones del taller son append-mostly (agregar ítem, cambiar estado) con baja concurrencia sobre el mismo recurso. Una cola FIFO con idempotency keys + last-write-wins por campo alcanza; un CRDT es over-engineering para este dominio.

---

## 2. PRD DETALLADO

### 2.1 Objetivo
El taller sigue operando con internet intermitente: el mecánico consulta y actualiza WOs offline; recepción ve catálogos offline; al volver la conexión todo se sincroniza sin pérdida ni duplicados.

### 2.2 Matriz de funcionalidad offline

| Funcionalidad | Offline Read | Offline Write | Justificación |
|---|---|---|---|
| Productos/Servicios catálogo | ✅ SWR cache | ❌ | Read-only en operación diaria |
| Vehículos/Clientes | ✅ SWR cache | ❌ | Altas poco frecuentes |
| Work Orders: ver/detalle | ✅ cache | — | Consulta constante del mecánico |
| WO: cambiar estado | — | ✅ cola | Avance de trabajo crítico |
| WO: agregar ítem/nota | — | ✅ cola | Registro de trabajo crítico |
| Ventas: crear/cobrar | ❌ | ❌ | Riesgo financiero + FIFO stock |
| Caja/cierres | ❌ | ❌ | Riesgo financiero |
| Compras/OC | ❌ | ❌ | Complejidad FIFO |
| Reportes | ❌ | ❌ | Datos calculados server-side |
| Dashboard | Parcial (último fetch) | — | Informativo |

### 2.3 Arquitectura PWA

```
cocos-web/
├── public/
│   ├── manifest.webmanifest        # nombre, icons, theme_color, display: standalone
│   ├── icons/ (192, 512, maskable)
│   └── offline.html                # fallback de navegación
├── src/pwa/
│   ├── sw.ts                       # service worker custom (injectManifest)
│   ├── db.ts                       # Dexie: tablas cache + outbox
│   ├── outbox.ts                   # cola de mutaciones offline
│   ├── sync.ts                     # worker de sincronización + backoff
│   ├── conflict.ts                 # resolución de conflictos
│   ├── online-status.ts            # hook useOnlineStatus
│   └── register.ts                 # registro SW + prompt update
└── vite.config.ts                  # VitePWA plugin config
```

### 2.4 Service Worker — estrategias por ruta

```typescript
// sw.ts (Workbox)
// 1. Assets build (JS/CSS/fonts): CacheFirst, revisioned por Vite
precacheAndRoute(self.__WB_MANIFEST);

// 2. API GET catálogos: StaleWhileRevalidate, 7 días, max 500 entries
registerRoute(
  ({ url }) => url.pathname.match(/^\/api\/(products|services|vehicles|clients)/) && method === 'GET',
  new StaleWhileRevalidate({ cacheName: 'api-catalogs', plugins: [expiration(7d, 500)] })
);

// 3. API GET work-orders: NetworkFirst con timeout 3s → cache
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/work-orders') && method === 'GET',
  new NetworkFirst({ cacheName: 'api-wos', networkTimeoutSeconds: 3 })
);

// 4. API mutaciones: NetworkOnly → si falla, el CLIENTE (no el SW) encola en outbox
//    (el SW no intercepta POST; la app decide encolar por diseño)

// 5. Navegación: NetworkFirst → offline.html fallback
```

### 2.5 Outbox (IndexedDB via Dexie)

```typescript
// db.ts
class CocosOfflineDB extends Dexie {
  outbox!: Table<OutboxEntry, string>;
  constructor() {
    super('cocos-offline');
    this.version(1).stores({ outbox: 'id, status, createdAt, entityType' });
  }
}

interface OutboxEntry {
  id: string;               // uuid — también es idempotency key
  entityType: 'work-order';
  operation: 'transition' | 'add-item' | 'add-note';
  entityId: string;
  payload: unknown;
  status: 'pending' | 'syncing' | 'failed';
  attempts: number;
  lastError?: string;
  createdAt: number;        // para orden FIFO
}
```

### 2.6 Flujo de mutación offline-first

```typescript
// useTransitionWorkOrder.ts (patrón para las 3 operaciones)
async function mutate(input) {
  if (navigator.onLine) {
    try { return await api.transition(input); }
    catch (e) { if (!isNetworkError(e)) throw e; /* cae a outbox */ }
  }
  await outbox.enqueue({ operation: 'transition', entityId: input.id, payload: input });
  optimisticUpdate(queryClient, input);   // UI refleja el cambio ya
  toast.info('Sin conexión — se sincronizará automáticamente');
}
```

### 2.7 Sincronización

```typescript
// sync.ts
- Trigger: evento 'online' + cada 30s si hay pendientes + al abrir la app
- Procesa FIFO por createdAt
- Headers: `X-Idempotency-Key: <entry.id>` → backend dedup
- Éxito → borra entry + invalida query React Query
- 409 Conflict → conflict.resolve() (ver 2.8)
- 4xx → status 'failed' + notificación a Admin (no reintenta)
- 5xx/red → backoff exponencial (1m, 5m, 15m, 1h), max 10 intentos
```

### 2.8 Resolución de conflictos

| Conflicto | Resolución |
|---|---|
| WO ya cambió de estado en server (409 con estado actual) | Server gana; entry se descarta; UI muestra toast "La OT ya fue actualizada por otro usuario" + refresh |
| Ítem agregado duplicado | Idempotency key → backend devuelve 200 con el existente (no duplica) |
| WO eliminada/cancelada en server | Entry descartada + toast + refresh |
| Error de validación (precio, stock) | Entry 'failed' + banner en la WO con detalle + acción manual |

### 2.9 Backend — soporte de idempotencia (mínimo)

```typescript
// IdempotencyInterceptor (global para endpoints de WO)
- Lee X-Idempotency-Key
- Tabla IdempotencyKey { key, userId, response Json, createdAt } (TTL 24h)
- Si key existe → devuelve response cacheada (200)
- Si no → ejecuta, guarda response, devuelve
```
Endpoints cubiertos: `POST /work-orders/:id/transitions`, `POST /work-orders/:id/items`, `POST /work-orders/:id/notes`.

### 2.10 UI/UX

- **Install prompt**: banner "Instalá Cocos en tu dispositivo" (beforeinstallprompt), dismiss persistente.
- **Online/offline indicator**: pill en header (verde "En línea" / ámbar "Sin conexión — N pendientes").
- **Outbox page** (`/offline-queue`): lista de pendientes con estado, reintentar manual, descartar.
- **Update prompt**: "Nueva versión disponible — Actualizar" (SW update found).
- **Offline banner** en páginas bloqueadas (ventas, caja): "Esta función requiere conexión".

### 2.11 Responsive audit

Checklist por página (20 páginas): tabla → cards en <640px, formularios 1 columna, botones min 44px touch target, modales full-screen en mobile, filtros en drawer. Páginas prioritarias: WOs (mecánico), checkout venta (tablet recepción), productos.

---

## 3. TDD SPECS EXHAUSTIVOS

### 3.1 Unit — Outbox

```typescript
// outbox.test.ts (fake-indexeddb)
describe('outbox', () => {
  it('enqueues entry with uuid id and pending status', async () => { /* ... */ });
  it('lists entries FIFO by createdAt', async () => { /* ... */ });
  it('marks syncing/failed with attempts count', async () => { /* ... */ });
  it('removes entry on success', async () => { /* ... */ });
  it('persists across page reload (IndexedDB)', async () => { /* ... */ });
});
```

### 3.2 Unit — Sync

```typescript
// sync.test.ts (msw)
describe('sync', () => {
  it('processes queue FIFO on online event', async () => { /* ... */ });
  it('sends X-Idempotency-Key header', async () => { /* ... */ });
  it('invalidates React Query cache after success', async () => { /* ... */ });
  it('applies exponential backoff on 5xx', async () => { /* fake timers */ });
  it('marks failed on 4xx without retry', async () => { /* ... */ });
  it('on 409: discards entry and triggers refresh + toast', async () => { /* ... */ });
  it('stops after 10 attempts', async () => { /* ... */ });
  it('does not run concurrently (single-flight)', async () => { /* ... */ });
});
```

### 3.3 Unit — Mutaciones offline-first

```typescript
// useTransitionWorkOrder.test.ts
it('calls API directly when online', async () => { /* ... */ });
it('enqueues + optimistic update when offline', async () => { /* ... */ });
it('enqueues on network error even when online flag true', async () => { /* ... */ });
it('shows info toast when enqueued', async () => { /* ... */ });
it('rolls back optimistic update on immediate server 4xx', async () => { /* ... */ });
```

### 3.4 Backend — Idempotencia

```typescript
// idempotency.interceptor.spec.ts
it('executes once and caches response for same key', async () => { /* ... */ });
it('different key executes again', async () => { /* ... */ });
it('key scoped per user (user A no ve response de user B)', async () => { /* ... */ });
it('expires after 24h', async () => { /* fake timers */ });
it('missing key → executes normally', async () => { /* ... */ });

// work-orders e2e
it('duplicate transition with same idempotency key returns 200 same result, no double transition', async () => { /* ... */ });
it('transition to already-transitioned state without key returns 409 with current state', async () => { /* ... */ });
```

### 3.5 PWA — Service Worker

```typescript
// sw.test.ts (workbox-window mocks + service-worker-mock)
it('precaches build assets', () => { /* ... */ });
it('GET /api/products served from cache when offline', async () => { /* ... */ });
it('GET /api/work-orders falls back to cache after 3s timeout', async () => { /* ... */ });
it('navigation falls back to offline.html when offline + uncached', async () => { /* ... */ });
it('POST requests never cached', async () => { /* ... */ });
```

### 3.6 UI

```typescript
// OnlineIndicator.test.tsx
it('shows green "En línea" when online', () => { /* ... */ });
it('shows amber with pending count when offline with outbox', () => { /* ... */ });

// OfflineQueuePage.test.tsx
it('lists pending entries with entity and operation', () => { /* ... */ });
it('manual retry triggers sync for that entry', () => { /* ... */ });
it('discard removes entry after confirm', () => { /* ... */ });

// blocked pages
it('checkout shows "requiere conexión" banner when offline', () => { /* ... */ });
```

### 3.7 E2E (Playwright — context offline)

```typescript
test('mechanic updates WO offline and it syncs', async ({ page, context }) => {
  await loginAsMechanic(page);
  await page.goto('/work-orders/wo-1');          // cachea
  await context.setOffline(true);
  await page.click('[data-testid=advance-status]'); // encolado
  await expect(page.locator('text=Sin conexión')).toBeVisible();
  await context.setOffline(false);
  await expect(page.locator('text=En línea')).toBeVisible();
  await page.reload();
  await expect(page.locator('[data-testid=wo-status]')).toHaveText('In Progress');
});

test('install prompt shown and dismissible', async ({ page }) => { /* ... */ });
test('update prompt reloads app', async ({ page }) => { /* ... */ });
```

---

## 4. PLAN DE EJECUCIÓN

| Task | Descripción | Archivos | Tests | Estimación |
|---|---|---|---|---|
| F18.1 | PWA base: manifest, icons, vite-plugin-pwa, registro, install prompt | 6 | 8 unit | 0.5 sprint |
| F18.2 | SW custom: precache + runtime strategies + offline.html | 2 | 12 unit | 1 |
| F18.3 | IndexedDB outbox + online status hook + indicator | 4 | 15 unit | 1 |
| F18.4 | Mutaciones offline-first (3 ops WO) + optimistic updates | 6 | 18 unit | 1.5 |
| F18.5 | Sync engine: FIFO, backoff, conflictos, single-flight | 3 | 20 unit | 1.5 |
| F18.6 | Backend: IdempotencyInterceptor + tabla + e2e | 4 | 12 unit/e2e | 1 |
| F18.7 | OfflineQueuePage + banners en páginas bloqueadas | 4 | 10 unit | 0.5 |
| F18.8 | Responsive audit: 20 páginas + fixes mobile | 20 | visual/e2e | 1.5 |
| F18.9 | E2E Playwright offline scenarios | 1 | 8 e2e | 0.5 |
| **Total** | | **50** | **~103** | **9 sprints** |

---

## 5. RIESGOS Y MITIGACIONES

| Riesgo | Prob | Impacto | Mitigación |
|---|---|---|---|
| Duplicados al sincronizar | Media | Alto | Idempotency key obligatoria + tabla backend + test e2e duplicado |
| Optimistic update inconsistente | Media | Medio | Rollback en 4xx inmediato; refresh tras sync; conflicto 409 → server gana |
| Cache stale de catálogos | Media | Bajo | SWR: revalida en background; TTL 7d; invalidación manual en config |
| IndexedDB quota en tablets viejas | Baja | Medio | Outbox acotado (max 200 entries) + eviction LRU del cache API |
| SW update loop / versiones viejas | Media | Alto | `skipWaiting` controlado + update prompt explícito + versionado de caches por build |
| iOS Safari PWA limitaciones | Alta | Medio | Test manual en iOS; degradación elegante (sin install → banner explicativo) |
| Scope creep a push notifications | Alta | Medio | Explícitamente F18.2; MVP solo in-app |

---

## 6. DEFINITION OF DONE

- [ ] App instalable (Lighthouse PWA ✓, manifest completo, icons maskable)
- [ ] Catálogos y WOs disponibles offline (cache verificado en DevTools)
- [ ] 3 operaciones WO funcionan offline con cola + optimistic UI
- [ ] Sync FIFO con backoff, single-flight, resolución de conflictos 409
- [ ] Backend idempotente en endpoints de WO (test e2e duplicado)
- [ ] Indicador online/offline + contador de pendientes
- [ ] Página /offline-queue con retry/discard manual
- [ ] Páginas financieras bloqueadas offline con banner claro
- [ ] Responsive audit: 20 páginas OK en 360/768/1024
- [ ] E2E Playwright: flujo completo offline→sync
- [ ] Tests: ~103 verdes
