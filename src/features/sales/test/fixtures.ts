import type {
  CreateSalePayload,
  Sale,
  SaleProductLine,
  SaleServiceLine,
} from '../types';

// Checkout line inputs as sent to POST /api/sales: id + quantity only,
// the backend owns pricing (SL-F4).
export function buildProductLineInput(
  overrides: Partial<{ productId: string; quantity: number }> = {}
): NonNullable<CreateSalePayload['productLines']>[number] {
  return { productId: 'p1', quantity: 1, ...overrides };
}

export function buildServiceLineInput(
  overrides: Partial<{ serviceId: string; quantity: number }> = {}
): NonNullable<CreateSalePayload['serviceLines']>[number] {
  return { serviceId: 's1', quantity: 1, ...overrides };
}

// Self-contained sales fixtures (SL-NF3). Do NOT refactor the shared
// work-orders fixtures from here; these builders stand on their own.
export function buildSaleProductLine(
  overrides: Partial<SaleProductLine> = {}
): SaleProductLine {
  return {
    id: 'sp1',
    productId: 'p1',
    quantity: 1,
    unitPriceSnapshot: '80.50',
    subtotal: '80.50',
    product: {
      id: 'p1',
      code: 'PRD-001',
      name: 'Filtro de aceite',
      description: null,
      price: '80.50',
    },
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

export function buildSaleServiceLine(
  overrides: Partial<SaleServiceLine> = {}
): SaleServiceLine {
  return {
    id: 'ss1',
    serviceId: 's1',
    quantity: 2,
    unitPriceSnapshot: '150.00',
    subtotal: '300.00',
    service: {
      id: 's1',
      code: 'SRV-001',
      name: 'Cambio de aceite',
      description: null,
      price: '150.00',
    },
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

export function buildSale(overrides: Partial<Sale> = {}): Sale {
  return {
    id: 'sale1',
    saleNumber: 'VTA-2026-000001',
    clientId: 'c1',
    branchId: 'b1',
    employeeId: 'e1',
    status: 'completed',
    paymentMethod: 'cash',
    totalAmount: '380.50',
    isActive: true,
    client: { id: 'c1', name: 'Juan Pérez' },
    branch: { id: 'b1', name: 'Sucursal Centro' },
    employee: { id: 'e1', name: 'María Gómez' },
    products: [buildSaleProductLine()],
    services: [buildSaleServiceLine()],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    deletedAt: null,
    ...overrides,
  };
}
