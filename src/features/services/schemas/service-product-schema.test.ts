import { describe, expect, it } from 'vitest';
import { serviceProductSchema } from './service-product-schema';

describe('serviceProductSchema', () => {
  it('accepts a product with a positive integer quantity', () => {
    const result = serviceProductSchema.safeParse({
      productId: 'p1',
      quantity: 2,
    });

    expect(result.success).toBe(true);
  });

  it('coerces string quantities from number inputs', () => {
    const result = serviceProductSchema.safeParse({
      productId: 'p1',
      quantity: '3',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.quantity).toBe(3);
    }
  });

  it('requires a product', () => {
    const result = serviceProductSchema.safeParse({
      productId: '',
      quantity: 1,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['productId']);
    }
  });

  it('rejects zero, negative and fractional quantities', () => {
    for (const quantity of [0, -1, 1.5]) {
      const result = serviceProductSchema.safeParse({
        productId: 'p1',
        quantity,
      });
      expect(result.success).toBe(false);
    }
  });
});
