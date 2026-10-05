# F16 — Multi-Sucursal Real — PRD + TDD Exhaustivo

> Análisis profundo: aislamiento de datos por sucursal, stock/ventas/OC por branch, selector global, admin global, migración de datos.

---

## 1. CONTEXTO Y PROBLEMA REAL

### 1.1 Estado actual
- **Schema:** `Branch` existe (id, name, address, phone, isActive, createdAt). `User` NO tiene `branchId`. `Product`, `Lot`, `Sale`, `WorkOrder`, `PurchaseOrder`, `CashClosing` NO tienen `branchId`.
- **Frontend:** Sin selector de sucursal. Todos ven todo.
- **Problema:** Negocio creció a 3 sucursales. Stock mezclado, ventas no atribuibles, reportes globales inútiles.

### 1.2 Decisiones de arquitectura
1. **BranchId obligatorio** en todas las entidades transaccionales (soft delete: `branchId` + `isActive`)
2. **User.branchId obligatorio** (excepto Admin global = `branchId: null`)
3. **Aislamiento automático:** Middleware/Interceptor inyecta `branchId` del user en queries
4. **Admin global** (`branchId: null`) ve todo + selector de sucursal en header
5. **Migración de datos:** Script asigna `branchId` a datos existentes (default: sucursal principal)

---

## 2. PRD DETALLADO

### 2.1 Objetivo
Cada sucursal opera como unidad independiente:
- Stock propio (lotes, movimientos, stock actual)
- Ventas/WO/OC propias
- Usuarios asignados a una sola sucursal
- Reportes por sucursal + consolidado (Admin global)

### 2.2 Alcance MVP

| Entidad | Cambio | Detalle |
|---|---|---|
| `User` | + `branchId` (nullable, Admin = null) | FK a Branch |
| `Product` | + `branchId` | Stock por sucursal |
| `Lot` | + `branchId` | Lotes propios |
| `StockMovement` | + `branchId` | Movimientos aislados |
| `Sale` | + `branchId` | Ventas atribuidas |
| `WorkOrder` | + `branchId` | WO atribuidas |
| `PurchaseOrder` | + `branchId` | OC propias |
| `CashClosing` | + `branchId` | Cierres propios |
| `CashClosingPreview` | + `branchId` | Preview aislado |

### 2.3 Reglas de Negocio

| Regla | Descripción |
|---|---|
| **Creación** | Al crear entidad, `branchId = user.branchId` (auto, no editable) |
| **Lectura** | Queries filtran `WHERE branchId = user.branchId` (excepto Admin global) |
| **Admin global** | `branchId = null` → ve todo + puede filtrar `?branchId=` |
| **Transferencia stock** | Fuera de MVP (futuro: `StockTransfer` entity) |
| **Usuario sin branch** | Solo Admin global; otros roles requieren branch |

### 2.4 Frontend: Branch Selector (Header)
```
┌────────────────────────────────────────────────────┐
│  [Logo]  [Nav]              [🌐 Sucursal Centro ▼]  [User] │
└────────────────────────────────────────────────────┘
```
- Visible **solo** para Admin global (`branchId === null`)
- Cambio → recarga datos (invalidación total de React Query)
- Persistencia: `localStorage` + sync con backend

---

## 3. BACKEND: ARQUITECTURA

### 3.1 Migración Prisma (DDL)
```prisma
// Migración: 2026xxxx_add_branch_id_to_entities
model User {
  // ...
  branchId   String?     @map("branch_id")
  branch     Branch?     @relation(fields: [branchId], references: [id])
  // Admin global = branchId = null
}

model Product {
  // ...
  branchId   String      @map("branch_id")
  branch     Branch      @relation(fields: [branchId], references: [id])
  @@index([branchId])
}

model Lot {
  // ...
  branchId   String      @map("branch_id")
  branch     Branch      @relation(fields: [branchId], references: [id])
  @@index([branchId])
}

// ... igual para Sale, WorkOrder, PurchaseOrder, CashClosing, StockMovement
```

### 3.2 Middleware de Aislamiento (BranchScopeInterceptor)
```typescript
// src/common/interceptors/branch-scope.interceptor.ts
@Injectable()
export class BranchScopeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Admin global: no filtrar
    if (!user?.branchId) return next.handle();

    // Inyectar branchId en query params para GET
    if (request.method === 'GET') {
      request.query = { ...request.query, branchId: user.branchId };
    }

    // Inyectar branchId en body para POST/PATCH
    if (['POST', 'PATCH'].includes(request.method)) {
      request.body = { ...request.body, branchId: user.branchId };
    }

    return next.handle();
  }
}
```

### 3.3 Service Base: Auto-filtro por Branch
```typescript
// src/common/base/branch-scoped.service.ts
export abstract class BranchScopedService {
  protected getBranchId(user: User): string | null {
    return user.branchId ?? null; // Admin = null
  }

  protected applyBranchScope<T>(query: Prisma.Args<T, 'findMany'>, user: User): Prisma.Args<T, 'findMany'> {
    const branchId = this.getBranchId(user);
    if (!branchId) return query; // Admin global

    return {
      ...query,
      where: {
        ...query.where,
        branchId,
        isActive: true, // siempre
      },
    };
  }

  protected applyBranchScopeCreate<T>(data: T, user: User): T {
    const branchId = this.getBranchId(user);
    if (!branchId) throw new ForbiddenException('Admin global debe especificar branchId');
    return { ...data, branchId } as T;
  }
}
```

### 3.4 Uso en Services
```typescript
// products.service.ts
@Injectable()
export class ProductsService extends BranchScopedService {
  async findAll(queryDto: ListProductsQueryDto, user: User) {
    const args = this.applyBranchScope({ 
      where: { isActive: true },
      orderBy: { name: 'asc' },
      skip: queryDto.skip,
      take: queryDto.take,
    }, user);
    return this.prisma.product.findMany(args);
  }

  async create(dto: CreateProductDto, user: User) {
    const data = this.applyBranchScopeCreate(dto, user);
    return this.prisma.product.create({ data });
  }
}
```

### 3.5 Controller: Admin Global Override
```typescript
// products.controller.ts
@Get()
@RequirePermission('products', 'read')
findAll(@Query() queryDto: ListProductsQueryDto, @CurrentUser() user: User) {
  // Admin global puede sobrescribir: ?branchId=xxx
  const effectiveBranchId = user.branchId === null ? queryDto.branchId : user.branchId;
  return this.productsService.findAll({ ...queryDto, branchId: effectiveBranchId }, user);
}
```

---

## 4. FRONTEND: ARQUITECTURA

### 4.1 Branch Context + Selector
```tsx
// src/features/shell/context/BranchContext.tsx
interface BranchContextValue {
  currentBranchId: string | null; // null = Admin global (todas)
  branches: Branch[];
  setBranch: (branchId: string | null) => Promise<void>;
}

export const BranchProvider = ({ children }) => {
  const { user } = useAuth();
  const [currentBranchId, setCurrentBranchId] = useState(() => 
    localStorage.getItem('selectedBranchId') ?? user?.branchId ?? null
  );

  const setBranch = async (branchId: string | null) => {
    localStorage.setItem('selectedBranchId', branchId ?? '');
    setCurrentBranchId(branchId);
    queryClient.invalidateQueries(); // invalidación total
  };

  return (
    <BranchContext.Provider value={{ currentBranchId, branches: user?.branches, setBranch }}>
      {children}
    </BranchContext.Provider>
  );
};
```

### 4.2 Branch Selector Component
```tsx
// src/features/shell/components/BranchSelector.tsx
export function BranchSelector() {
  const { user } = useAuth();
  const { currentBranchId, branches, setBranch } = useBranch();

  // Solo Admin global ve el selector
  if (user?.branchId !== null) return null;

  return (
    <Select value={currentBranchId ?? 'all'} onValueChange={setBranch}>
      <SelectTrigger>
        <GlobeIcon /> {currentBranchId ? branches.find(b => b.id === currentBranchId)?.name : 'Todas las sucursales'}
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todas las sucursales</SelectItem>
        {branches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}
```

### 4.3 Integración en Header
```tsx
// src/features/shell/components/Header.tsx
<Header>
  <BranchSelector />
  <UserMenu />
</Header>
```

### 4.4 Query Keys con Branch
```typescript
// hooks/useProducts.ts
export function useProducts(filters: ProductListFilters) {
  const { currentBranchId } = useBranch();
  return useQuery({
    queryKey: ['products', 'list', { ...filters, branchId: currentBranchId }],
    queryFn: () => getProducts({ ...filters, branchId: currentBranchId }),
  });
}
```

---

## 5. MIGRACIÓN DE DATOS (Script Único)

```sql
-- migration: 2026xxxx_assign_branch_id_to_existing_data.sql

-- 1. Obtener branch principal (primera activa)
DO $$
DECLARE
  main_branch_id UUID;
BEGIN
  SELECT id INTO main_branch_id FROM "Branch" WHERE is_active = true ORDER BY created_at LIMIT 1;
  
  -- 2. Asignar branch a Users (excepto admins)
  UPDATE "User" 
  SET branch_id = main_branch_id 
  WHERE branch_id IS NULL AND role_id != (SELECT id FROM "Role" WHERE name = 'Admin');
  
  -- 3. Asignar branch a entidades transaccionales
  UPDATE "Product" SET branch_id = main_branch_id WHERE branch_id IS NULL;
  UPDATE "Lot" SET branch_id = main_branch_id WHERE branch_id IS NULL;
  UPDATE "Sale" SET branch_id = main_branch_id WHERE branch_id IS NULL;
  UPDATE "WorkOrder" SET branch_id = main_branch_id WHERE branch_id IS NULL;
  UPDATE "PurchaseOrder" SET branch_id = main_branch_id WHERE branch_id IS NULL;
  UPDATE "CashClosing" SET branch_id = main_branch_id WHERE branch_id IS NULL;
  UPDATE "StockMovement" SET branch_id = main_branch_id WHERE branch_id IS NULL;
  
  RAISE NOTICE 'Assigned branch % to all entities', main_branch_id;
END $$;

-- 4. Índices compuestos para performance
CREATE INDEX idx_product_branch_active ON "Product" (branch_id, is_active);
CREATE INDEX idx_lot_branch_active ON "Lot" (branch_id, is_active);
CREATE INDEX idx_sale_branch_created ON "Sale" (branch_id, created_at DESC);
CREATE INDEX idx_workorder_branch_status ON "WorkOrder" (branch_id, status);
CREATE INDEX idx_purchaseorder_branch_status ON "PurchaseOrder" (branch_id, status);
CREATE INDEX idx_cashclosing_branch_period ON "CashClosing" (branch_id, period_start);
```

---

## 5. TDD SPECS EXHAUSTIVOS

### 5.1 Backend — Unit Tests (Branch Scoping)

```typescript
// src/common/base/branch-scoped.service.spec.ts
describe('BranchScopedService', () => {
  let service: TestBranchScopedService;
  let prisma: jest.Mocked<PrismaService>;

  const adminUser = { id: '1', branchId: null, role: { name: 'Admin' } };
  const branchUser = { id: '2', branchId: 'branch-1', role: { name: 'Reception' } };

  beforeEach(() => {
    prisma = createMockPrisma();
    service = new TestBranchScopedService(prisma);
  });

  describe('applyBranchScope', () => {
    it('adds branchId where clause for branch user', () => {
      const query = service.applyBranchScope({ where: { isActive: true } }, branchUser);
      expect(query.where).toEqual({ isActive: true, branchId: 'branch-1' });
    });

    it('returns unchanged query for Admin global', () => {
      const query = service.applyBranchScope({ where: { isActive: true } }, adminUser);
      expect(query.where).toEqual({ isActive: true });
    });

    it('preserves existing where conditions', () => {
      const query = service.applyBranchScope({ where: { name: { contains: 'test' } } }, branchUser);
      expect(query.where).toEqual({ name: { contains: 'test' }, branchId: 'branch-1' });
    });
  });

  describe('applyBranchScopeCreate', () => {
    it('adds branchId to data for branch user', () => {
      const data = service.applyBranchScopeCreate({ name: 'Test' }, branchUser);
      expect(data).toEqual({ name: 'Test', branchId: 'branch-1' });
    });

    it('throws for Admin global (must specify branchId)', () => {
      expect(() => service.applyBranchScopeCreate({ name: 'Test' }, adminUser))
        .toThrow(ForbiddenException);
    });
  });
});
```

```typescript
// src/common/interceptors/branch-scope.interceptor.spec.ts
describe('BranchScopeInterceptor', () => {
  let interceptor: BranchScopeInterceptor;

  beforeEach(() => {
    interceptor = new BranchScopeInterceptor();
  });

  it('injects branchId in query for GET', () => {
    const req = { method: 'GET', query: {}, user: { branchId: 'branch-1' } };
    interceptor.intercept(createMockContext(req), { handle: () => of(null) }).subscribe();
    expect(req.query.branchId).toBe('branch-1');
  });

  it('injects branchId in body for POST', () => {
    const req = { method: 'POST', body: {}, user: { branchId: 'branch-1' } };
    interceptor.intercept(createMockContext(req), { handle: () => of(null) }).subscribe();
    expect(req.body.branchId).toBe('branch-1');
  });

  it('does nothing for Admin global', () => {
    const req = { method: 'GET', query: {}, user: { branchId: null } };
    interceptor.intercept(createMockContext(req), { handle: () => of(null) }).subscribe();
    expect(req.query.branchId).toBeUndefined();
  });
});
```

### 5.2 Backend — Service Tests (Branch Isolation)

```typescript
// src/products/products.service.spec.ts (updated)
describe('ProductsService (branch isolation)', () => {
  let service: ProductsService;
  let prisma: jest.Mocked<PrismaService>;

  const adminUser = { id: '1', branchId: null, role: { name: 'Admin' } };
  const branchAUser = { id: '1', branchId: 'branch-a', role: { name: 'Reception' } };
  const branchBUser = { id: '2', branchId: 'branch-b', role: { name: 'Reception' } };

  beforeEach(() => {
    prisma = createMockPrisma();
    service = new ProductsService(prisma);
  });

  describe('findAll', () => {
    it('branch user sees only own branch products', async () => {
      prisma.product.findMany.mockResolvedValue([{ id: 'p1', branchId: 'branch-a' }]);
      const res = await service.findAll({}, branchAUser);
      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ branchId: 'branch-a' }) })
      );
    });

    it('Admin global sees all when no branchId filter', async () => {
      prisma.product.findMany.mockResolvedValue([
        { id: 'p1', branchId: 'branch-a' },
        { id: 'p2', branchId: 'branch-b' },
      ]);
      await service.findAll({}, adminUser);
      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.not.objectContaining({ where: expect.objectContaining({ branchId: expect.any(String) }) })
      );
    });

    it('Admin global can filter by branchId', async () => {
      await service.findAll({ branchId: 'branch-a' }, adminUser);
      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ branchId: 'branch-a' }) })
      );
    });
  });

  describe('create', () => {
    it('assigns branchId from user', async () => {
      await service.create({ name: 'Test' }, branchAUser);
      expect(prisma.product.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ branchId: 'branch-a' }),
      });
    });

    it('throws for Admin global without explicit branchId', async () => {
      await expect(service.create({ name: 'Test' }, adminUser)).rejects.toThrow(ForbiddenException);
    });
  });
});
```

---

## 6. FRONTEND TDD SPECS

```typescript
// src/features/shell/context/BranchContext.test.tsx
describe('BranchContext', () => {
  const renderWithUser = (user: User) => render(
    <AuthProvider value={user}>
      <BranchProvider>
        <TestComponent />
      </BranchProvider>
    </AuthProvider>
  );

  it('branch user sees only their branch (no selector)', () => {
    renderWithUser({ branchId: 'branch-1', role: { name: 'Reception' } });
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(useBranch().currentBranchId).toBe('branch-1');
  });

  it('Admin global sees selector with all branches', () => {
    renderWithUser({ branchId: null, role: { name: 'Admin' }, branches: [{ id: '1', name: 'Centro' }, { id: '2', name: 'Norte' }] });
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('changing branch invalidates queries', async () => {
    const { queryClient } = renderWithAdmin();
    setBranch('branch-2');
    await waitFor(() => expect(queryClient.invalidateQueries).toHaveBeenCalled());
  });
});
```

```typescript
// src/features/products/hooks/useProducts.test.ts (updated)
describe('useProducts (branch isolation)', () => {
  it('includes branchId in queryKey', () => {
    const { result } = renderHook(() => useProducts({}));
    expect(result.current.queryKey).toContainEqual(expect.objectContaining({ branchId: 'branch-1' }));
  });

  it('Admin global: branchId from selector', () => {
    // mock useBranch returning 'branch-2'
    const { result } = renderHook(() => useProducts({}), { wrapper: AdminWrapper });
    expect(result.current.queryKey).toContainEqual(expect.objectContaining({ branchId: 'branch-2' }));
  });
});
```

---

## 6. BACKEND E2E TESTS (Critical)

```typescript
// test/multi-branch/multi-branch.e2e-spec.ts
describe('Multi-Branch Isolation (e2e)', () => {
  let app: INestApplication;
  let adminCookie: string;
  let branchAUserCookie: string;
  let branchBUserCookie: string;
  let branchA: Branch, branchB: Branch;

  beforeAll(async () => {
    app = await createTestApp();
    adminCookie = await loginAsAdmin(app);
    branchA = await createBranch({ name: 'Sucursal Centro' });
    branchB = await createBranch({ name: 'Sucursal Norte' });
    branchAUserCookie = await createUser({ branchId: branchA.id, role: 'Reception' });
    branchBUserCookie = await createUser({ branchId: branchB.id, role: 'Reception' });
  });

  describe('Product Isolation', () => {
    it('branchA user sees only branchA products', async () => {
      const pA = await createProduct({ branchId: branchA.id, name: 'Producto A' }, adminCookie);
      const pB = await createProduct({ branchId: branchB.id, name: 'Producto B' }, adminCookie);

      const resA = await request(app.getHttpServer())
        .get('/api/products')
        .set('Cookie', branchAUserCookie)
        .expect(200);

      expect(resA.body.data.map(p => p.id)).toContain(pA.id);
      expect(resA.body.data.map(p => p.id)).not.toContain(pB.id);
    });

    it('branchA user creates product auto-assigned to branchA', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/products')
        .set('Cookie', branchAUserCookie)
        .send({ name: 'Nuevo Prod', code: 'NP-001', price: 100, presentationId: 'pres-1', brandId: 'brand-1', categoryId: 'cat-1' })
        .expect(201);

      expect(res.body.branchId).toBe(branchA.id);
    });

    it('Admin global sees all with ?branchId= filter', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/products?branchId=branch-a')
        .set('Cookie', adminCookie)
        .expect(200);
      expect(res.body.data.every(p => p.branchId === branchA.id)).toBe(true);
    });
  });

  describe('Sale Isolation', () => {
    it('branchA user creates sale auto-assigned to branchA', async () => { /* ... */ });
    it('branchA cannot create sale with client from branchB', async () => { /* 403 */ });
  });

  describe('Stock Isolation', () => {
    it('stock movements scoped to branch', async () => { /* ... */ });
  });

  describe('Reports', () => {
    it('reports aggregated by branch', async () => { /* ... */ });
    it('Admin global gets consolidated with ?branchId=', async () => { /* ... */ });
  });
});
```

---

## 7. FRONTEND E2E TESTS

```typescript
// e2e/multi-branch.spec.ts
test.describe('Multi-Branch', () => {
  test('Branch selector visible only for Admin global', async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.locator('[data-testid=branch-selector]')).toBeVisible();

    await loginAsReception(page);
    await expect(page.locator('[data-testid=branch-selector]')).not.toBeVisible();
  });

  test('Branch selector filters data globally', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/products');
    await page.selectOption('[data-testid=branch-selector]', 'branch-norte');
    await expect(page.locator('tbody tr:first-child')).toContainText('Producto Norte');
  });

  test('Reception user cannot see other branch data', async ({ page }) => {
    await loginAsReception(page); // branch-a
    await page.goto('/products');
    await expect(page.locator('text=Producto Exclusivo Norte')).not.toBeVisible();
  });
});
```

---

## 7. PLAN DE EJECUCIÓN

| Task | Descripción | Archivos | Tests | Sprint |
|---|---|---|---|---|
| F16.1 | Migración Prisma: branchId en 8 entidades + índices | 1 migración + 8 modelos | 5 unit | 1 |
| F16.2 | Backend: BranchScopedService + Interceptor + User.branchId | 5 archivos | 20 unit | 1 |
| F16.3 | Backend: Migración 12 services a BranchScopedService | 12 archivos | 60 unit | 2 |
| F16.4 | Backend: Admin global override + Controllers update | 12 archivos | 24 unit | 1 |
| F16.5 | Migración datos: script SQL + seeds actualizados | 2 archivos | 5 integration | 0.5 |
| F16.6 | Frontend: BranchContext + Selector + Header integration | 5 archivos | 15 unit | 1 |
| F16.7 | Frontend: Query keys con branchId en 20 hooks | 20 archivos | 20 unit | 1 |
| F16.8 | E2E: Matriz completa aislamiento (6 roles × 8 entidades) | 1 archivo | 48 e2e | 1 |
| **Total** | | **~60 archivos** | **~150 tests** | **6 sprints** |

---

## 8. RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Query sin branchId (fuga de datos) | Alta | Crítico | Test E2E obligatorio por entidad + lint rule `no-prisma-findmany-without-branch` |
| Migración datos incorrecta | Media | Crítico | Script idempotente + dry-run en staging + validación post-migración |
| Admin global sin selector | Baja | Alto | Test E2E: selector visible solo para Admin global |
| Performance: índices compuestos faltantes | Media | Alto | `EXPLAIN ANALYZE` en CI para queries críticas |
| Transferencia stock entre sucursales (fuera de MVP) | N/A | N/A | Documentar como F16.2 futuro |

---

## 9. DEFINITION OF DONE

- [ ] Migración Prisma: branchId en 8 entidades + índices compuestos
- [ ] BranchScopedService base + Interceptor funcionando
- [ ] 12 services migrados con tests de aislamiento
- [ ] Admin global: selector + `?branchId=` override
- [ ] Script migración datos idempotente + validado en staging
- [ ] Frontend: BranchContext + Selector en Header (solo Admin global)
- [ ] 20 hooks actualizados con branchId en queryKey
- [ ] E2E: 48 tests de matriz aislamiento (6 roles × 8 entidades)
- [ ] Performance: queries < 200ms con 50k registros por branch
