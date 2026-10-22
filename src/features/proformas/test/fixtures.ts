import type { Client } from '@/features/clients/types';
import type { Product } from '@/features/products/types';
import type {
  ConvertProformaPayload,
  Proforma,
  ProformaProductLine,
} from '../types';

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

export function buildProformaProductLine(
  overrides: Partial<ProformaProductLine> = {}
): ProformaProductLine {
  return {
    id: 'sp1',
    proformaId: 'prof1',
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

export function buildProforma(overrides: Partial<Proforma> = {}): Proforma {
  return {
    id: 'prof1',
    proformaNumber: 'PRO-2026-000001',
    clientId: 'c1',
    branchId: 'b1',
    employeeId: 'e1',
    status: 'draft',
    totalAmount: '80.50',
    notes: null,
    convertedSaleId: null,
    isActive: true,
    client: { id: 'c1', name: 'Juan Pérez' },
    branch: { id: 'b1', name: 'Sucursal Centro' },
    employee: { id: 'e1', name: 'María Gómez' },
    products: [buildProformaProductLine()],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    deletedAt: null,
    ...overrides,
  };
}

export function buildConvertProformaPayload(
  overrides: Partial<ConvertProformaPayload> = {}
): ConvertProformaPayload {
  return { paymentMethod: 'cash', ...overrides };
}
