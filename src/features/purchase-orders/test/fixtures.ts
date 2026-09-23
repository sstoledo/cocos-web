import type {
  CreatePurchaseOrderPayload,
  PurchaseOrder,
  PurchaseOrderLine,
} from '../types';

export function buildPurchaseOrderLine(
  overrides: Partial<PurchaseOrderLine> = {}
): PurchaseOrderLine {
  return {
    id: 'line1',
    productId: 'p1',
    quantityOrdered: 10,
    quantityReceived: 0,
    estimatedCostPrice: '50.00',
    product: {
      id: 'p1',
      code: 'PRD-001',
      name: 'Filtro de aceite',
    },
    ...overrides,
  };
}

export function buildPurchaseOrder(
  overrides: Partial<PurchaseOrder> = {}
): PurchaseOrder {
  return {
    id: 'po1',
    purchaseOrderNumber: 'COM-2024-000001',
    supplierId: 'sup1',
    status: 'draft',
    notes: null,
    estimatedTotal: '500.00',
    supplier: { id: 'sup1', name: 'Repuestos SA' },
    lines: [buildPurchaseOrderLine()],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

export function buildCreatePurchaseOrderPayload(
  overrides: Partial<CreatePurchaseOrderPayload> = {}
): CreatePurchaseOrderPayload {
  return {
    supplierId: 'sup1',
    lines: [
      { productId: 'p1', quantityOrdered: 10, estimatedCostPrice: '50.00' },
    ],
    ...overrides,
  };
}
