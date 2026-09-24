import { describe, expect, it } from 'vitest';
import {
  purchaseOrderSchema,
  receivePurchaseOrderSchema,
} from './purchase-order-schema';

const validValues = {
  supplierId: 'sup1',
  lines: [
    { productId: 'p1', quantityOrdered: 5, estimatedCostPrice: '120.50' },
  ],
};

describe('purchaseOrderSchema', () => {
  it('accepts valid values', () => {
    expect(purchaseOrderSchema.safeParse(validValues).success).toBe(true);
  });

  it('accepts optional notes', () => {
    const result = purchaseOrderSchema.safeParse({
      ...validValues,
      notes: 'Pedido urgente',
    });

    expect(result.success).toBe(true);
  });

  it('rejects an empty supplierId', () => {
    const result = purchaseOrderSchema.safeParse({
      ...validValues,
      supplierId: '',
    });

    expect(result.success).toBe(false);
  });

  it('rejects an empty lines array', () => {
    const result = purchaseOrderSchema.safeParse({
      ...validValues,
      lines: [],
    });

    expect(result.success).toBe(false);
  });

  it('rejects a line without productId', () => {
    const result = purchaseOrderSchema.safeParse({
      ...validValues,
      lines: [
        { productId: '', quantityOrdered: 5, estimatedCostPrice: '120.50' },
      ],
    });

    expect(result.success).toBe(false);
  });

  it('rejects a non-integer quantity', () => {
    const result = purchaseOrderSchema.safeParse({
      ...validValues,
      lines: [
        { productId: 'p1', quantityOrdered: 1.5, estimatedCostPrice: '120' },
      ],
    });

    expect(result.success).toBe(false);
  });

  it('rejects a quantity below 1', () => {
    const result = purchaseOrderSchema.safeParse({
      ...validValues,
      lines: [
        { productId: 'p1', quantityOrdered: 0, estimatedCostPrice: '120' },
      ],
    });

    expect(result.success).toBe(false);
  });

  it.each(['120', '120.5', '120.50', '0.99'])(
    'accepts the valid money string %s',
    (estimatedCostPrice) => {
      const result = purchaseOrderSchema.safeParse({
        ...validValues,
        lines: [{ productId: 'p1', quantityOrdered: 1, estimatedCostPrice }],
      });

      expect(result.success).toBe(true);
    }
  );

  it.each(['', 'abc', '12.345', '-5', '1,50', '.5'])(
    'rejects the invalid money string %s',
    (estimatedCostPrice) => {
      const result = purchaseOrderSchema.safeParse({
        ...validValues,
        lines: [{ productId: 'p1', quantityOrdered: 1, estimatedCostPrice }],
      });

      expect(result.success).toBe(false);
    }
  );

  it('rejects duplicate product lines', () => {
    const result = purchaseOrderSchema.safeParse({
      ...validValues,
      lines: [
        { productId: 'p1', quantityOrdered: 1, estimatedCostPrice: '10' },
        { productId: 'p1', quantityOrdered: 2, estimatedCostPrice: '20' },
      ],
    });

    expect(result.success).toBe(false);
  });

  it('accepts distinct products in multiple lines', () => {
    const result = purchaseOrderSchema.safeParse({
      ...validValues,
      lines: [
        { productId: 'p1', quantityOrdered: 1, estimatedCostPrice: '10' },
        { productId: 'p2', quantityOrdered: 2, estimatedCostPrice: '20' },
      ],
    });

    expect(result.success).toBe(true);
  });
});

describe('receivePurchaseOrderSchema', () => {
  const validReceive = {
    lines: [
      {
        lineId: 'line1',
        receivedQty: 3,
        expirationDate: '2027-01-15',
        actualCostPrice: '115.75',
      },
    ],
  };

  it('accepts valid values', () => {
    expect(receivePurchaseOrderSchema.safeParse(validReceive).success).toBe(
      true
    );
  });

  it('rejects an empty lines array', () => {
    const result = receivePurchaseOrderSchema.safeParse({ lines: [] });

    expect(result.success).toBe(false);
  });

  it('rejects a line without lineId', () => {
    const result = receivePurchaseOrderSchema.safeParse({
      lines: [{ ...validReceive.lines[0], lineId: '' }],
    });

    expect(result.success).toBe(false);
  });

  it('rejects a receivedQty below 1', () => {
    const result = receivePurchaseOrderSchema.safeParse({
      lines: [{ ...validReceive.lines[0], receivedQty: 0 }],
    });

    expect(result.success).toBe(false);
  });

  it('rejects a non-integer receivedQty', () => {
    const result = receivePurchaseOrderSchema.safeParse({
      lines: [{ ...validReceive.lines[0], receivedQty: 2.5 }],
    });

    expect(result.success).toBe(false);
  });

  it('rejects an empty expirationDate', () => {
    const result = receivePurchaseOrderSchema.safeParse({
      lines: [{ ...validReceive.lines[0], expirationDate: '' }],
    });

    expect(result.success).toBe(false);
  });

  it.each(['abc', '-10', '10.999'])(
    'rejects the invalid money string %s',
    (actualCostPrice) => {
      const result = receivePurchaseOrderSchema.safeParse({
        lines: [{ ...validReceive.lines[0], actualCostPrice }],
      });

      expect(result.success).toBe(false);
    }
  );
});
