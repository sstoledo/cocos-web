import type { Client } from '@/features/clients/types';
import type { Product } from '@/features/products/types';
import type { CreateSalePayload, Sale, SaleProductLine } from '../types';

export function buildClient(overrides: Partial<Client> = {}): Client {
  return {
    id: 'c1',
    name: 'Juan Pérez',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

export function buildProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'p1',
    code: 'PRD-001',
    name: 'Filtro de aceite',
    price: '80.50',
    isActive: true,
    presentation: { id: 'pres1', name: 'Unidad' },
    brand: { id: 'b1', name: 'Bosch' },
    category: { id: 'cat1', name: 'Filtros' },
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

// Checkout line inputs as sent to POST /api/sales: id + quantity only,
// the backend owns pricing (SL-F4).
export function buildProductLineInput(
  overrides: Partial<{ productId: string; quantity: number }> = {}
): CreateSalePayload['productLines'][number] {
  return { productId: 'p1', quantity: 1, ...overrides };
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

export function buildSale(overrides: Partial<Sale> = {}): Sale {
  return {
    id: 'sale1',
    saleNumber: 'VTA-2026-000001',
    clientId: 'c1',
    branchId: 'b1',
    employeeId: 'e1',
    status: 'completed',
    paymentMethod: 'cash',
    totalAmount: '80.50',
    isActive: true,
    client: { id: 'c1', name: 'Juan Pérez' },
    branch: { id: 'b1', name: 'Sucursal Centro' },
    employee: { id: 'e1', name: 'María Gómez' },
    products: [buildSaleProductLine()],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    deletedAt: null,
    ...overrides,
  };
}
