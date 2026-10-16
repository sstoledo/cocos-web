import { describe, expect, it } from 'vitest';
import { workOrderConsumptionSchema } from './work-order-consumption-schema';

describe('workOrderConsumptionSchema', () => {
  it('accepts a used event with a positive integer quantity', () => {
    const result = workOrderConsumptionSchema.safeParse({
      productId: 'p1',
      type: 'used',
      quantity: '3',
    });

    expect(result.success).toBe(true);
  });

  it('requires quantity for used events', () => {
    const result = workOrderConsumptionSchema.safeParse({
      productId: 'p1',
      type: 'used',
      quantity: '',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['quantity']);
    }
  });

  it('rejects non-integer quantities for used events', () => {
    const result = workOrderConsumptionSchema.safeParse({
      productId: 'p1',
      type: 'used',
      quantity: '1.5',
    });

    expect(result.success).toBe(false);
  });

  it('accepts opened and depleted events without quantity', () => {
    for (const type of ['opened', 'depleted']) {
      const result = workOrderConsumptionSchema.safeParse({
        productId: 'p1',
        type,
      });
      expect(result.success).toBe(true);
    }
  });

  it('requires a product', () => {
    const result = workOrderConsumptionSchema.safeParse({
      productId: '',
      type: 'opened',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['productId']);
    }
  });

  it('rejects an unknown event type', () => {
    const result = workOrderConsumptionSchema.safeParse({
      productId: 'p1',
      type: 'returned',
    });

    expect(result.success).toBe(false);
  });
});
