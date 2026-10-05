# F15 — Permisos Granulares (RBAC por Acción) — PRD + TDD Exhaustivo

> Análisis profundo: matriz resource×action, bundles por rol, hook `usePermission`, componente `<Can>`, decorator backend, migración.

---

## 1. CONTEXTO Y PROBLEMA REAL

### 1.1 Estado actual
- **Backend:** Roles coarse-grained: `Admin`, `Reception`, `Mechanic`, `Warehouse`, `Purchasing`, `ReadOnly`. Controlados via `@Roles(...)` en controllers.
- **Frontend:** `navigation.ts` filtra por `allowedRoles` (página completa). `RouteGuard` protege rutas por rol. **No** hay control granular dentro de una página.
- **Problemas reales:**
  - Reception ve precio de costo en productos (debería solo ver precio venta)
  - Mechanic puede editar WO pero no debería poder cancelar
  - Warehouse ve margen en reportes (info sensible)
  - No se puede dar "crear producto" sin "eliminar producto"
  - Auditoría: imposible saber quién tenía qué permiso cuándo

### 1.2 Decisiones de arquitectura
1. **Permission = { resource, action }** — no roles jerárquicos
2. **Role = bundle de permissions** — migración gradual desde roles actuales
3. **Backend:** Decorator `@RequirePermission('products', 'create')` + `PermissionGuard`
4. **Frontend:** Hook `usePermission(resource, action)` + componente `<Can resource="products" action="create">`
5. **Migración:** Roles actuales → bundles de permissions (Admin = all, etc.) — **no breaking change**

---

## 2. PRD DETALLADO

### 2.1 Objetivo
Sistema de permisos granular resource×action que:
- Reemplaza `@Roles` por `@RequirePermission`
- Permite componer roles como bundles de permissions
- Frontend oculta/muestra UI basado en permissions
- Auditoría completa: quién tenía qué permission cuándo
- Migración zero-downtime desde roles actuales

### 2.2 Matriz Resource × Action (MVP: 15 resources × 5 actions = 75 permissions)

| Resource | Actions | Descripción |
|---|---|---|
| `products` | `create`, `read`, `update`, `delete`, `view_cost` | Ver costo = permission separada |
| `services` | `create`, `read`, `update`, `delete`, `view_cost` | |
| `vehicles` | `create`, `read`, `update`, `delete`, `manage_alerts` | Alertas de mantenimiento |
| `clients` | `create`, `read`, `update`, `delete`, `view_history` | Historial WO/Ventas |
| `work-orders` | `create`, `read`, `update`, `delete`, `cancel`, `transition_status`, `view_cost` | Cancel ≠ update |
| `sales` | `create`, `read`, `update`, `delete`, `cancel`, `view_cost`, `process_payment` | Payment = action separada |
| `purchase-orders` | `create`, `read`, `update`, `delete`, `cancel`, `order`, `receive`, `view_cost` | |
| `cash-closings` | `create`, `read`, `update`, `delete`, `close`, `preview` | |
| `lots` | `create`, `read`, `update`, `delete`, `receive`, `view_cost` | |
| `suppliers` | `create`, `read`, `update`, `delete` | |
| `brands` | `create`, `read`, `update`, `delete` | |
| `categories` | `create`, `read`, `update`, `delete` | |
| `presentations` | `create`, `read`, `update`, `delete` | |
| `users` | `create`, `read`, `update`, `delete`, `assign_roles` | |
| `reports` | `read`, `export` | Solo Admin |

**Total: 75 permissions**

### 2.3 Bundles de Roles Actuales (mapeo 1:1 para migración)

| Rol | Permissions (resource:action[]) |
|---|---|
| **Admin** | `*` (all 75) |
| **Reception** | `products:read`, `services:read`, `vehicles:create|read|update`, `clients:create|read|update|view_history`, `work-orders:create|read|update|transition_status`, `sales:create|read|process_payment`, `cash-closings:create|read|close|preview`, `reports:read` |
| **Mechanic** | `products:read`, `services:read`, `vehicles:read`, `work-orders:read|update|transition_status`, `clients:read|view_history` |
| **Warehouse** | `products:read|view_cost`, `services:read`, `lots:create|read|update|receive|view_cost`, `purchase-orders:read|receive`, `suppliers:read` |
| **Purchasing** | `suppliers:create|read|update|delete`, `purchase-orders:create|read|update|order|receive|view_cost`, `products:read|view_cost`, `lots:read|view_cost` |
| **ReadOnly** | `products:read`, `services:read`, `vehicles:read`, `clients:read`, `work-orders:read`, `sales:read`, `purchase-orders:read`, `lots:read`, `suppliers:read`, `reports:read` |

### 2.4 Permissions Especiales (no CRUD)
| Permission | Qué controla |
|---|---|
| `products:view_cost` | Ver `costPrice` en lotes, `unitPriceSnapshot` en WO/ventas |
| `work-orders:cancel` | Botón "Cancelar" (distinto de update) |
| `work-orders:transition_status` | Cambiar estado (pending→in_progress→done) |
| `sales:process_payment` | Botón "Pagar" en checkout |
| `purchase-orders:order` | Botón "Ordenar" (draft→ordered) |
| `purchase-orders:receive` | Página `/receive` |
| `cash-closings:close` | Página `/cash-closings/close` |
| `users:assign_roles` | Editar roles de otros usuarios |

---

## 3. BACKEND: ARQUITECTURA

### 3.1 Nuevos módulos/archivos
```
src/auth/
├── permissions/
│   ├── permission.registry.ts        # Registro canónico: resource -> actions[]
│   ├── permission.decorator.ts       # @RequirePermission('products', 'create')
│   ├── permission.guard.ts           # PermissionGuard (usa User.permissions)
│   ├── permission.interface.ts       # Permission, PermissionBundle
│   ├── role-to-permissions.ts        # Mapeo RoleName -> Permission[]
│   └── permission.utils.ts           # hasPermission(user, resource, action)
├── user/
│   ├── user.entity.ts                # + permissions: string[] (cached)
│   └── user.service.ts               # + resolvePermissions()
└── ...
```

### 3.2 Permission Registry (Single Source of Truth)
```typescript
// src/auth/permissions/permission.registry.ts
export const PERMISSION_REGISTRY: Record<string, string[]> = {
  products: ['create', 'read', 'update', 'delete', 'view_cost'],
  services: ['create', 'read', 'update', 'delete', 'view_cost'],
  vehicles: ['create', 'read', 'update', 'delete', 'manage_alerts'],
  clients: ['create', 'read', 'update', 'delete', 'view_history'],
  'work-orders': ['create', 'read', 'update', 'delete', 'cancel', 'transition_status', 'view_cost'],
  sales: ['create', 'read', 'update', 'delete', 'cancel', 'view_cost', 'process_payment'],
  'purchase-orders': ['create', 'read', 'update', 'delete', 'cancel', 'order', 'receive', 'view_cost'],
  'cash-closings': ['create', 'read', 'update', 'delete', 'close', 'preview'],
  lots: ['create', 'read', 'update', 'delete', 'receive', 'view_cost'],
  suppliers: ['create', 'read', 'update', 'delete'],
  brands: ['create', 'read', 'update', 'delete'],
  categories: ['create', 'read', 'update', 'delete'],
  presentations: ['create', 'read', 'update', 'delete'],
  users: ['create', 'read', 'update', 'delete', 'assign_roles'],
  reports: ['read', 'export'],
} as const;

export type Resource = keyof typeof PERMISSION_REGISTRY;
export type Action<R extends Resource> = (typeof PERMISSION_REGISTRY)[R][number];
export type Permission = `${Resource}:${Action<Resource>}`;

// Validación en build time
export function validatePermission(resource: string, action: string): boolean {
  return PERMISSION_REGISTRY[resource]?.includes(action) ?? false;
}
```

### 3.3 Decorator + Guard
```typescript
// permission.decorator.ts
export const RequirePermission = (resource: Resource, action: Action) =>
  SetMetadata('requiredPermission', { resource, action });

// permission.guard.ts
@Injectable()
export class PermissionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.get<{ resource: Resource; action: string }>(
      'requiredPermission',
      context.getHandler()
    );
    if (!required) return true; // sin decorator = acceso libre

    const request = context.switchToHttp().getRequest();
    const user = request.user; // inyectado por AuthGuard

    return hasPermission(user, required.resource, required.action);
  }
}
```

### 3.4 Uso en Controllers (reemplaza @Roles)
```typescript
// ANTES
@Post()
@Roles(RoleName.Admin, RoleName.Reception)
create(@Body() dto: CreateProductDto) { ... }

// DESPUÉS
@Post()
@RequirePermission('products', 'create')
create(@Body() dto: CreateProductDto) { ... }
```

### 3.4 User Permissions Resolution
```typescript
// user.service.ts
async resolvePermissions(userId: string): Promise<string[]> {
  const user = await this.findOne(userId);
  const rolePermissions = ROLE_PERMISSIONS[user.role.name] ?? [];
  // Permissions adicionales directas (override)
  const directPermissions = user.directPermissions ?? [];
  return [...new Set([...rolePermissions, ...directPermissions])];
}
```

---

## 3. FRONTEND: ARQUITECTURA

### 3.1 Hook `usePermission`
```typescript
// src/features/auth/hooks/usePermission.ts
export function usePermission(resource: Resource, action: Action): boolean {
  const { user } = useAuth(); // user.permissions: string[]
  return user?.permissions?.includes(`${resource}:${action}`) ?? false;
}

// Uso en componente
function ProductListPage() {
  const canCreate = usePermission('products', 'create');
  const canViewCost = usePermission('products', 'view_cost');

  return (
    <>
      {canCreate && <button>Nuevo producto</button>}
      <ProductTable showCostColumn={canViewCost} />
    </>
  );
}
```

### 3.2 Componente `<Can>`
```tsx
// src/components/auth/Can.tsx
interface CanProps {
  resource: Resource;
  action: Action;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function Can({ resource, action, children, fallback = null }: CanProps) {
  const allowed = usePermission(resource, action);
  return allowed ? <>{children}</> : <>{fallback}</>;
}

// Uso
<Can resource="products" action="create">
  <Button>Nuevo producto</Button>
</Can>
<Can resource="products" action="view_cost" fallback={<span>—</span>}>
  <CostColumn />
</Can>
```

### 3.3 Navigation + Route Guards con Permissions
```typescript
// navigation.ts - cada nav item puede tener permission opcional
interface NavItem {
  // ...
  permission?: { resource: Resource; action: Action };
}

// RouteGuard extendido
function RouteGuard({ requiredPermission }: { requiredPermission?: { resource: Resource; action: Action } }) {
  const allowed = requiredPermission ? usePermission(requiredPermission.resource, requiredPermission.action) : true;
  return allowed ? <Outlet /> : <Navigate to="/unauthorized" />;
}
```

### 3.3 Migración de Navigation.ts
```typescript
// ANTES
{ label: 'Productos', path: '/products', allowedRoles: ['Admin', 'Warehouse'] }

// DESPUÉS
{ label: 'Productos', path: '/products', permission: { resource: 'products', action: 'read' } }
```

---

## 4. MIGRACIÓN ZERO-DOWNTIME

### 4.1 Paso 1: Deploy Permission System (backend + frontend) — **sin romper roles actuales**
1. Deploy `PermissionGuard`, `RequirePermission`, `usePermission`, `<Can>`
2. **Mantener** `@Roles` en controllers como fallback
3. `PermissionGuard` corre **después** de `RolesGuard` — si `@Roles` pasa, `PermissionGuard` no se ejecuta
4. Frontend: `usePermission` lee `user.permissions` (nuevo campo) — si no existe, cae a role mapping

### 4.2 Paso 2: Migrar Controllers (uno a uno)
```typescript
// Patrón de migración por controller
@Controller('products')
@UseGuards(AuthGuard, RolesGuard, PermissionGuard) // orden importante
export class ProductsController {
  @Get()
  @Roles(...allRoles) // TEMPORAL: fallback
  @RequirePermission('products', 'read')
  findAll() { ... }

  @Post()
  @Roles(RoleName.Admin, RoleName.Reception) // TEMPORAL
  @RequirePermission('products', 'create')
  create() { ... }
}
```

### 4.3 Paso 3: Quitar @Roles (limpieza)
Una vez todos los endpoints tienen `@RequirePermission`, quitar `@Roles` y `RolesGuard` de `app.module.ts`.

### 4.4 Frontend: Migración Navigation
```typescript
// navigation.ts - transición
{
  label: 'Productos',
  path: '/products',
  // TEMPORAL: ambos
  allowedRoles: ['Admin', 'Warehouse'],
  permission: { resource: 'products', action: 'read' },
}
```

---

## 4. TDD SPECS EXHAUSTIVOS

### 4.1 Backend — Unit Tests

```typescript
// src/auth/permissions/permission.utils.spec.ts
describe('hasPermission', () => {
  const adminUser = { permissions: ['*'] };
  const receptionUser = { permissions: ['products:read', 'sales:create', 'sales:process_payment'] };

  it('Admin (*) has all permissions', () => {
    expect(hasPermission(adminUser, 'users', 'delete')).toBe(true);
    expect(hasPermission(adminUser, 'reports', 'export')).toBe(true);
  });

  it('Reception has granted permissions', () => {
    expect(hasPermission(receptionUser, 'products', 'read')).toBe(true);
    expect(hasPermission(receptionUser, 'sales', 'create')).toBe(true);
    expect(hasPermission(receptionUser, 'sales', 'process_payment')).toBe(true);
  });

  it('Reception denied ungranted', () => {
    expect(hasPermission(receptionUser, 'products', 'create')).toBe(false);
    expect(hasPermission(receptionUser, 'products', 'view_cost')).toBe(false);
    expect(hasPermission(receptionUser, 'users', 'delete')).toBe(false);
  });

  it('unknown resource returns false', () => {
    expect(hasPermission(receptionUser, 'unknown', 'read')).toBe(false);
  });

  it('empty permissions returns false', () => {
    expect(hasPermission({ permissions: [] }, 'products', 'read')).toBe(false);
  });
});
```

```typescript
// src/auth/permissions/permission.guard.spec.ts
describe('PermissionGuard', () => {
  let guard: PermissionGuard;
  let reflector: jest.Mocked<Reflector>;
  let context: ExecutionContext;

  beforeEach(() => {
    reflector = { get: jest.fn() };
    guard = new PermissionGuard(reflector);
    context = createMockContext();
  });

  it('allows when no requiredPermission metadata', () => {
    reflector.get.mockReturnValue(undefined);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('allows when user has permission', () => {
    reflector.get.mockReturnValue({ resource: 'products', action: 'read' });
    context.switchToHttp().getRequest().user = { permissions: ['products:read'] };
    expect(guard.canActivate(context)).toBe(true);
  });

  it('denies when user lacks permission', () => {
    reflector.get.mockReturnValue({ resource: 'products', action: 'create' });
    context.switchToHttp().getRequest().user = { permissions: ['products:read'] };
    expect(guard.canActivate(context)).toBe(false);
  });

  it('denies when no user in request', () => {
    reflector.get.mockReturnValue({ resource: 'products', action: 'read' });
    context.switchToHttp().getRequest().user = null;
    expect(guard.canActivate(context)).toBe(false);
  });
});
```

```typescript
// src/auth/role-to-permissions.spec.ts
describe('ROLE_PERMISSIONS mapping', () => {
  it('Admin has all 75 permissions', () => {
    expect(ROLE_PERMISSIONS.Admin).toHaveLength(75);
  });

  it('Reception has expected permissions', () => {
    expect(ROLE_PERMISSIONS.Reception).toContain('products:read');
    expect(ROLE_PERMISSIONS.Reception).not.toContain('products:create');
    expect(ROLE_PERMISSIONS.Reception).not.toContain('products:view_cost');
    expect(ROLE_PERMISSIONS.Reception).toContain('sales:create');
    expect(ROLE_PERMISSIONS.Reception).not.toContain('sales:cancel');
  });

  it('Mechanic cannot cancel work-orders', () => {
    expect(ROLE_PERMISSIONS.Mechanic).not.toContain('work-orders:cancel');
  });

  it('Warehouse can view_cost but not create products', () => {
    expect(ROLE_PERMISSIONS.Warehouse).toContain('products:view_cost');
    expect(ROLE_PERMISSIONS.Warehouse).not.toContain('products:create');
  });

  it('no duplicate permissions in any role', () => {
    Object.values(ROLE_PERMISSIONS).forEach(perms => {
      expect(new Set(perms).size).toBe(perms.length);
    });
  });

  it('all permissions in registry are assigned to at least one role', () => {
    const allAssigned = new Set(Object.values(ROLE_PERMISSIONS).flat());
    Object.keys(PERMISSION_REGISTRY).forEach(resource => {
      PERMISSION_REGISTRY[resource].forEach(action => {
        expect(allAssigned.has(`${resource}:${action}`)).toBe(true);
      });
    });
  });
});
```

### 4.2 Backend — Controller Tests (Permission Guard)

```typescript
// src/products/products.controller.spec.ts (updated)
describe('ProductsController (permissions)', () => {
  let controller: ProductsController;
  let guard: PermissionGuard;

  const adminReq = { user: { permissions: ['*'] } };
  const receptionReq = { user: { permissions: ['products:read'] } };

  beforeEach(() => {
    // setup controller with PermissionGuard
  });

  describe('GET /products', () => {
    it('allows Reception (has products:read)', async () => {
      const res = await controller.findAll(receptionReq);
      expect(res).toBeDefined();
    });
  });

  describe('POST /products', () => {
    it('denies Reception (lacks products:create)', async () => {
      await expect(controller.create(receptionReq, mockDto)).rejects.toThrow(ForbiddenException);
    });

    it('allows Admin', async () => { /* ... */ });
  });
});
```

---

## 5. FRONTEND: TDD SPECS

```typescript
// src/features/auth/hooks/usePermission.test.ts
describe('usePermission', () => {
  const mockUserWithPerms = (perms: string[]) => ({
    user: { permissions: perms },
  };

  beforeEach(() => {
    vi.mock('@/features/auth/hooks/useAuth', () => ({
      useAuth: () => mockUserWithPerms(['products:read', 'sales:create']),
    }));
  });

  it('returns true for granted permission', () => {
    const { result } = renderHook(() => usePermission('products', 'read'));
    expect(result.current).toBe(true);
  });

  it('returns false for denied permission', () => {
    const { result } = renderHook(() => usePermission('products', 'create'));
    expect(result.current).toBe(false);
  });

  it('returns false for unknown resource', () => {
    const { result } = renderHook(() => usePermission('unknown', 'read'));
    expect(result.current).toBe(false);
  });
});
```

```tsx
// src/components/auth/Can.test.tsx
describe('<Can>', () => {
  const renderWithPerms = (perms: string[]) => render(
    <AuthProvider value={{ user: { permissions: perms } }}>
      <Can resource="products" action="create">
        <span data-testid="allowed">Allowed</span>
      </Can>
    </AuthProvider>
  );

  it('renders children when permission granted', () => {
    renderWithPerms(['products:create']);
    expect(screen.getByTestId('allowed')).toBeInTheDocument();
  });

  it('renders fallback when denied', () => {
    render(
      <AuthProvider value={{ user: { permissions: [] } }}>
        <Can resource="products" action="create" fallback={<span data-testid="fallback">No access</span>}>
          <span>Allowed</span>
        </Can>
      </AuthProvider>
    );
    expect(screen.getByTestId('fallback')).toBeInTheDocument();
  });

  it('renders null when denied and no fallback', () => {
    renderWithPerms([]);
    expect(screen.queryByText('Allowed')).not.toBeInTheDocument();
  });
});
```

```tsx
// src/features/products/pages/ProductListPage.test.tsx (updated)
describe('ProductListPage (permissions)', () => {
  it('shows "Nuevo producto" button only when canCreate', () => {
    renderWithPerms(['products:read', 'products:create']);
    expect(screen.getByText('Nuevo producto')).toBeInTheDocument();
  });

  it('hides "Nuevo producto" when no create permission', () => {
    renderWithPerms(['products:read']);
    expect(screen.queryByText('Nuevo producto')).not.toBeInTheDocument();
  });

  it('shows cost column only when view_cost permission', () => {
    renderWithPerms(['products:read', 'products:view_cost']);
    expect(screen.getByText('Costo')).toBeInTheDocument();
  });

  it('hides cost column when no view_cost', () => {
    renderWithPerms(['products:read']);
    expect(screen.queryByText('Costo')).not.toBeInTheDocument();
  });
});
```

---

## 5. PLAN DE EJECUCIÓN

| Task | Descripción | Archivos | Tests | Sprint |
|---|---|---|---|---|
| F15.1 | Backend: Permission registry, types, decorator, guard, utils | 6 archivos | 30 unit | 1 |
| F15.2 | Backend: Role→permissions mapping + User.permissions resolution | 3 archivos | 15 unit | 0.5 |
| F15.3 | Backend: Migrar 15 controllers (@RequirePermission + dual guard) | 15 archivos | 60 unit | 2 |
| F15.4 | Frontend: usePermission hook + `<Can>` component + types | 4 archivos | 20 unit | 0.5 |
| F15.4 | Frontend: Migrar 20 páginas + navigation.ts + RouteGuard | 22 archivos | 40 unit | 1.5 |
| F15.5 | E2E: Permission matrix verification (matrix testing) | 1 archivo | 30 e2e | 1 |
| **Total** | | **~50 archivos** | **~150 tests** | **4 sprints** |

---

## 6. RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Breaking change en migración | Alta | Crítico | Dual guard (Roles + Permission) + feature flag |
| Permission drift (registry vs código) | Media | Alto | Test `all permissions assigned to at least one role` en CI |
| Performance: resolver permissions por request | Baja | Medio | Cache en User entity (resuelto en login) |
| Frontend flash de UI antes de check | Media | Medio | Suspense boundary + skeleton mientras carga user |
| Permission drift entre back/front | Media | Alto | Shared registry (npm package o copy) + test cross-check |

---

## 7. DEFINITION OF DONE

- [ ] 75 permissions registrados en `PERMISSION_REGISTRY`
- [ ] 6 roles mapeados a bundles (test: cada permission asignada a ≥1 rol)
- [ ] `@RequirePermission` + `PermissionGuard` funcionando en 15 controllers
- [ ] `@Roles` removido de todos los controllers
- [ ] `usePermission` + `<Can>` en frontend
- [ ] 20+ páginas migradas a permissions granulares
- [ ] Navigation + RouteGuard usan permissions
- [ ] Test matrix: cada role × permission = expected allow/deny
- [ ] Zero breaking changes durante migración (dual guard)
- [ ] Docs: `PERMISSIONS.md` con matriz completa
