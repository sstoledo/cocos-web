# F17 — Integraciones Externas (Facturación Electrónica + Contabilidad) — PRD + TDD Exhaustivo

> Análisis profundo: arquitectura de adapters por proveedor fiscal (AFIP/SUNAT/SII), flujo CAE, contingencia offline, export contable, notificaciones WhatsApp.

---

## 1. CONTEXTO Y PROBLEMA REAL

### 1.1 Estado actual
- El sistema registra `Sale` y `Payment` internamente, pero **no emite comprobantes fiscales** (factura/boleta electrónica).
- No hay integración con AFIP (AR), SUNAT (PE), SII (CL) — el taller factura a mano o en otro sistema, duplicando trabajo.
- No hay export contable: el contador pide un Excel a fin de mes y se arma manualmente.
- Clientes piden comprobante por WhatsApp/email — hoy se imprime y se saca foto.

### 1.2 Alcance MVP (decisión clave: NO integrar AFIP real en MVP)
1. **Arquitectura de adapters**: interfaz `FiscalProvider` con implementación `LocalFiscalProvider` (talónario interno con numeración correlativa) + stub `AfipFiscalProvider` documentado.
2. **FiscalDocument entity**: comprobante emitido por cada Sale completada (tipo, punto de venta, número, CAE opcional, QR opcional, PDF).
3. **Numeración por punto de venta**: correlativa, sin huecos, controlada por transacción.
4. **Export contable**: asiento de ventas/cobros/IVA en CSV/Excel compatible con sistemas contables genéricos.
5. **Envío de comprobante**: PDF por email (Resend/SMTP) + link de descarga; WhatsApp = link (no API oficial en MVP).

### 1.3 Por qué no AFIP real en MVP
- AFIP WSAA/WSFE requiere certificado digital, homologación, ambiente de testing separado, y manejo de contingencia (CAEA). Es un proyecto propio de 2-3 sprints. La arquitectura de adapters permite enchufarlo después sin tocar el dominio.

---

## 2. PRD DETALLADO

### 2.1 Objetivo
Cada venta completada genera automáticamente un comprobante fiscal numerado, descargable en PDF, enviable por email, y exportable a contabilidad — con arquitectura lista para enchufar AFIP/SUNAT/SII después.

### 2.2 Modelos (Prisma)

```prisma
model FiscalPointOfSale {
  id          String   @id @default(uuid())
  number      Int      // p.ej. 1, 2
  name        String   // "Caja principal"
  documentTypes String[] // ["B", "C", "INTERNAL"]
  nextNumber  Int      @default(1)
  isActive    Boolean  @default(true)
  branchId    String?  // F16-ready
  documents   FiscalDocument[]
  @@unique([number, branchId])
}

model FiscalDocument {
  id            String   @id @default(uuid())
  pointOfSaleId String
  pointOfSale   FiscalPointOfSale @relation(fields: [pointOfSaleId], references: [id])
  type          String   // INTERNAL | B | C | NC_B | NC_C
  posNumber     Int
  number        Int
  fullNumber    String   // "0001-00000123"
  saleId        String?  @unique
  sale          Sale?    @relation(fields: [saleId], references: [id])
  clientName    String?
  clientTaxId   String?  // CUIT/DNI opcional
  subtotal      Decimal  @db.Decimal(14,2)
  taxAmount     Decimal  @db.Decimal(14,2)
  total         Decimal  @db.Decimal(14,2)
  cae           String?  // null con LocalProvider
  caeDueDate    DateTime?
  status        String   // ISSUED | VOIDED | PENDING
  voidReason    String?
  issuedAt      DateTime @default(now())
  issuedById    String
  pdfPath       String?
  emailSentAt   DateTime?
  @@unique([pointOfSaleId, type, number])
  @@index([issuedAt])
}

model FiscalConfig {
  id            String  @id @default("singleton")
  provider      String  @default("local") // local | afip | sunat | sii
  businessName  String
  taxId         String  // CUIT del negocio
  address       String?
  grossIncome   String? // IIBB
  startDate     DateTime? // inicio actividades
  vatCondition  String  // RI | Monotributo | Exento
  afipCert      String? // encriptado, futuro
  afipKey       String? // encriptado, futuro
  updatedAt     DateTime @updatedAt
}
```

### 2.3 Reglas de negocio

| Regla | Detalle |
|---|---|
| Emisión automática | Al pasar Sale a `paid` → emitir FiscalDocument (transacción atómica con el pago) |
| Numeración | `nextNumber` del punto de venta se incrementa dentro de la misma transacción (SELECT FOR UPDATE) — sin huecos ni duplicados |
| Tipo de comprobante | Default: `INTERNAL` (no fiscal). Config por punto de venta |
| Anulación | No se borra: `status = VOIDED` + motivo + (futuro: Nota de Crédito vinculada) |
| Reintento de provider | Si el provider fiscal falla: documento queda `PENDING`, job reintenta cada 15 min, alerta a Admin tras 3 fallos |
| PDF | Generado async (cola), guardado en disco/S3, link firmado 7 días |
| Export contable | Rango de fechas → CSV con: fecha, comprobante, cliente, neto, IVA, total, medio de pago |

### 2.4 Arquitectura de adapters

```typescript
// src/fiscal/providers/fiscal-provider.interface.ts
export interface IssueParams {
  sale: SaleWithItems;
  pointOfSale: FiscalPointOfSale;
  client?: { name: string; taxId?: string };
}

export interface IssueResult {
  cae?: string;
  caeDueDate?: Date;
  qrData?: string;
  providerRef?: string;
}

export interface FiscalProvider {
  readonly name: string;
  issue(params: IssueParams): Promise<IssueResult>;
  void(document: FiscalDocument, reason: string): Promise<void>;
  healthCheck(): Promise<boolean>;
}
```

```
src/fiscal/
├── fiscal.module.ts
├── fiscal.config.service.ts        # lee FiscalConfig singleton
├── fiscal-document.service.ts      # CRUD + emisión + anulación
├── fiscal-numbering.service.ts     # numeración transaccional
├── fiscal-export.service.ts        # CSV contable
├── fiscal-pdf.service.ts           # PDF (pdfmake)
├── fiscal-email.service.ts         # envío por email
├── fiscal-retry.job.ts             # reintento PENDING cada 15min
├── providers/
│   ├── fiscal-provider.interface.ts
│   ├── fiscal-provider.factory.ts  # switch por config.provider
│   ├── local.fiscal-provider.ts    # MVP: sin CAE
│   └── afip.fiscal-provider.ts     # stub documentado (throws NotImplemented)
└── dto/
    ├── fiscal-document.dto.ts
    ├── export-query.dto.ts
    └── fiscal-config.dto.ts
```

### 2.5 Numeración transaccional (crítico)

```typescript
// fiscal-numbering.service.ts
async nextNumber(tx: Prisma.Tx, posId: string, type: string): Promise<{ posNumber: number; number: number; fullNumber: string }> {
  const pos = await tx.$queryRaw<FiscalPointOfSale[]>`
    SELECT * FROM "FiscalPointOfSale" WHERE id = ${posId} FOR UPDATE`;
  const number = pos[0].nextNumber;
  await tx.fiscalPointOfSale.update({
    where: { id: posId },
    data: { nextNumber: { increment: 1 } },
  });
  return {
    posNumber: pos[0].number,
    number,
    fullNumber: `${String(pos[0].number).padStart(4, '0')}-${String(number).padStart(8, '0')}`,
  };
}
```

### 2.6 Integración con flujo de pago

```typescript
// sales.service.ts — dentro de processPayment (transacción existente)
await this.prisma.$transaction(async (tx) => {
  // ... lógica actual de pago (FIFO, movimientos, caja)
  if (sale.status === 'paid') {
    await this.fiscalDocuments.issueForSale(tx, sale.id, user.id);
  }
});
```
- El comprobante se emite **dentro de la misma transacción** del pago. Si falla la numeración, falla el pago (consistencia).
- El **provider fiscal** (CAE) corre DESPUÉS del commit: si AFIP cae, el documento queda `PENDING` y el job reintenta. La venta no se bloquea.

### 2.7 PDF del comprobante

Plantilla (pdfmake):
```
┌──────────────────────────────────────────────┐
│  COCOS TALLER            COMPROBANTE B        │
│  CUIT 30-12345678-9     N° 0001-00000123      │
│  Av. Siempre Viva 123   Fecha: 04/10/2026     │
├──────────────────────────────────────────────┤
│  Cliente: Juan Pérez   DNI: 30111222          │
├──────────────────────────────────────────────┤
│  Cant  Descripción          P.Unit   Importe  │
│  2     Filtro aceite X      5.000    10.000   │
│  1     Mano de obra         8.000     8.000   │
├──────────────────────────────────────────────┤
│              Subtotal:               18.000   │
│              IVA 21%:                 3.780   │
│              TOTAL:                  21.780   │
│  Medio de pago: Efectivo                      │
└──────────────────────────────────────────────┘
```

### 2.8 Export contable (CSV)

```csv
fecha,comprobante,tipo,cliente,cuit,neto,iva,total,medio_pago
2026-10-04,0001-00000123,B,Juan Pérez,2030111222,18000.00,3780.00,21780.00,efectivo
```
Endpoint: `GET /fiscal-documents/export?from=&to=` (permission `reports:export`).
Columnas configurables por `FiscalConfig.exportTemplate` (futuro).

### 2.9 Endpoints

| Método | Ruta | Permiso | Descripción |
|---|---|---|---|
| GET | `/fiscal-documents` | `sales:read` | Lista con filtros (fecha, tipo, estado, cliente) |
| GET | `/fiscal-documents/:id` | `sales:read` | Detalle |
| GET | `/fiscal-documents/:id/pdf` | `sales:read` | Descarga PDF |
| POST | `/fiscal-documents/:id/email` | `sales:read` | Reenviar por email |
| POST | `/fiscal-documents/:id/void` | `sales:cancel` | Anular (con motivo) |
| POST | `/fiscal-documents/:id/retry` | `sales:update` | Reintentar provider (PENDING → ISSUED) |
| GET | `/fiscal-documents/export` | `reports:export` | CSV contable |
| GET/PATCH | `/fiscal-config` | Admin | Configuración |
| GET/POST/PATCH | `/fiscal-points-of-sale` | Admin | Puntos de venta |

### 2.10 Frontend

```
src/features/fiscal/
├── pages/
│   ├── FiscalDocumentsPage.tsx       # tabla + filtros + badges estado
│   ├── FiscalDocumentDetailPage.tsx  # datos + acciones (PDF, email, anular, reintentar)
│   └── FiscalConfigPage.tsx          # config + puntos de venta (Admin)
├── components/
│   ├── FiscalStatusBadge.tsx         # ISSUED verde / PENDING ámbar / VOIDED gris
│   ├── VoidDocumentDialog.tsx        # motivo obligatorio
│   └── PosFormDialog.tsx
├── hooks/
│   ├── useFiscalDocuments.ts
│   ├── useFiscalConfig.ts
│   └── usePointsOfSale.ts
└── api/fiscal.ts
```

Plus: en `SaleDetailPage`, sección "Comprobante" con número, estado, botones PDF/email/WhatsApp (link `wa.me/?text=<url>`).

---

## 3. TDD SPECS EXHAUSTIVOS

### 3.1 Unit — Numeración

```typescript
// fiscal-numbering.service.spec.ts
describe('FiscalNumberingService', () => {
  it('returns padded fullNumber', async () => {
    // pos.number=1, nextNumber=42 → "0001-00000042"
  });
  it('increments nextNumber atomically', async () => { /* ... */ });
  it('uses SELECT FOR UPDATE inside tx', async () => {
    // dos llamadas concurrentes → números distintos, sin duplicados
  });
  it('throws when point of sale inactive', async () => { /* 409 */ });
});
```

### 3.2 Unit — Emisión

```typescript
// fiscal-document.service.spec.ts
describe('issueForSale', () => {
  it('creates document with correct totals from sale', async () => { /* ... */ });
  it('computes IVA 21% from sale subtotal', async () => { /* ... */ });
  it('runs inside sale payment transaction (rollback on failure)', async () => { /* ... */ });
  it('sets status ISSUED with local provider', async () => { /* ... */ });
  it('sets status PENDING when provider fails after commit', async () => { /* ... */ });
  it('is idempotent: saleId unique → second call returns existing', async () => { /* ... */ });
});

describe('void', () => {
  it('marks VOIDED with reason and keeps number (no reuse)', async () => { /* ... */ });
  it('rejects void of already-voided document', async () => { /* 409 */ });
  it('requires void reason (min 10 chars)', async () => { /* 400 */ });
});
```

### 3.3 Unit — Providers

```typescript
// local.fiscal-provider.spec.ts
it('issues without CAE', async () => {
  const result = await provider.issue(params);
  expect(result.cae).toBeUndefined();
});
it('healthCheck always true', async () => { /* ... */ });

// afip.fiscal-provider.spec.ts (stub)
it('throws NotImplementedException with doc link', async () => { /* ... */ });

// fiscal-provider.factory.spec.ts
it('returns local provider by default', () => { /* ... */ });
it('returns afip provider when config.provider=afip', () => { /* ... */ });
it('falls back to local + warning when unknown provider', () => { /* ... */ });
```

### 3.4 Unit — Export

```typescript
// fiscal-export.service.spec.ts
it('generates CSV with one row per ISSUED document in range', async () => { /* ... */ });
it('excludes VOIDED documents', async () => { /* ... */ });
it('includes PENDING with flag column', async () => { /* ... */ });
it('validates date range (from <= to, max 92 días)', async () => { /* 400 */ });
it('escapes CSV injection (=, +, -, @ prefix)', async () => { /* ... */ });
```

### 3.5 Unit — Retry Job

```typescript
// fiscal-retry.job.spec.ts
it('retries PENDING documents older than 15min', async () => { /* ... */ });
it('marks FAILED + notifies Admin after 3 attempts', async () => { /* ... */ });
it('does not retry ISSUED or VOIDED', async () => { /* ... */ });
```

### 3.6 Controller E2E (supertest)

```typescript
describe('FiscalDocuments (e2e)', () => {
  it('completing a sale payment creates fiscal document', async () => {
    // crear sale, pagar → GET /fiscal-documents?saleId → status ISSUED, fullNumber correlativo
  });
  it('two concurrent payments get consecutive numbers without gaps', async () => { /* Promise.all */ });
  it('GET /:id/pdf returns application/pdf', async () => { /* ... */ });
  it('POST /:id/void requires sales:cancel permission', async () => { /* 403 para Reception */ });
  it('GET /export streams CSV with correct totals', async () => { /* ... */ });
  it('retry endpoint transitions PENDING → ISSUED with fixed provider', async () => { /* mock provider */ });
});
```

### 3.7 Frontend

```typescript
// FiscalDocumentsPage.test.tsx
it('lists documents with status badges', () => { /* ... */ });
it('filters by date range and type', () => { /* ... */ });
it('shows void dialog and requires reason', () => { /* ... */ });
it('hides void button without sales:cancel permission (F15)', () => { /* ... */ });

// SaleDetailPage.test.tsx
it('shows fiscal document section after payment', () => { /* ... */ });
it('WhatsApp button builds wa.me link with PDF url', () => { /* ... */ });
```

---

## 4. PLAN DE EJECUCIÓN

| Task | Descripción | Archivos | Tests | Estimación |
|---|---|---|---|---|
| F17.1 | Modelos Prisma + migración (FiscalDocument, FiscalPointOfSale, FiscalConfig) | 2 | 6 unit | 0.5 sprint |
| F17.2 | Adapter interface + LocalProvider + Factory + stub AFIP | 5 | 15 unit | 0.5 |
| F17.3 | Numeración transaccional + emisión integrada al pago | 3 | 20 unit | 1 |
| F17.4 | Anulación + reintentos + job | 3 | 15 unit | 0.5 |
| F17.5 | PDF + email + link descarga | 3 | 12 unit | 1 |
| F17.6 | Export CSV contable | 2 | 10 unit | 0.5 |
| F17.7 | Endpoints + permisos + e2e backend | 3 | 18 e2e | 1 |
| F17.8 | Frontend: páginas + hooks + sección en SaleDetail | 9 | 20 unit | 1.5 |
| **Total** | | **30** | **~116** | **6.5 sprints** |

---

## 5. RIESGOS Y MITIGACIONES

| Riesgo | Prob | Impacto | Mitigación |
|---|---|---|---|
| Huecos en numeración por rollback | Media | Crítico (fiscal) | `SELECT FOR UPDATE` + documento voided nunca se reusa + test de concurrencia |
| Provider externo caído bloquea ventas | Media | Alto | Emisión fiscal post-commit, status PENDING + job reintento; la venta nunca se bloquea por CAE |
| Duplicar comprobante al re-pagar | Baja | Alto | `saleId @unique` + idempotencia en issueForSale |
| CSV injection en export | Baja | Medio | Sanitizar prefijos `=+-@` + test dedicado |
| PDF sync lento en request | Media | Medio | Generación async con cola; PDF disponible segundos después |
| Scope creep a AFIP real | Alta | Alto | Stub con NotImplemented + doc `afip-integration.md` como proyecto separado |

---

## 6. DEFINITION OF DONE

- [ ] Migración con 3 modelos + seed de punto de venta 0001
- [ ] Pago completado → comprobante ISSUED con numeración correlativa sin huecos (test de concurrencia)
- [ ] Anulación con motivo; número nunca reutilizado
- [ ] Provider Local funcionando; AFIP stub documentado
- [ ] Job de reintento PENDING cada 15 min con alerta a Admin
- [ ] PDF descargable + email + link WhatsApp
- [ ] Export CSV contable con sanitización anti-injection
- [ ] Permisos granulares aplicados (F15)
- [ ] 3 páginas frontend + sección en SaleDetail
- [ ] Tests: ~116 (unit + e2e), todos verdes
