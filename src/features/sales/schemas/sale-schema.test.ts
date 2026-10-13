import { describe, expect, it } from 'vitest';
import { saleSchema } from './sale-schema';

const validValues = {
  clientId: 'c1',
  paymentMethod: 'cash',
  productLines: [{ productId: 'p1', quantity: 2 }],
};

describe('saleSchema', () => {
  it('accepts valid values with a product line', () => {
    expect(saleSchema.safeParse(validValues).success).toBe(true);
  });

  it('accepts an omitted clientId (walk-in sale)', () => {
    const result = saleSchema.safeParse({
      paymentMethod: 'cash',
      productLines: [{ productId: 'p1', quantity: 1 }],
    });

    expect(result.success).toBe(true);
  });

  it('accepts an empty-string clientId (walk-in sale)', () => {
    const result = saleSchema.safeParse({
      ...validValues,
      clientId: '',
    });

    expect(result.success).toBe(true);
  });

  it('defaults an omitted productLines array to empty', () => {
    const result = saleSchema.safeParse({
      clientId: 'c1',
      paymentMethod: 'cash',
    });

    expect(result.success).toBe(false);
  });

  it('rejects a missing payment method with the Spanish message', () => {
    const result = saleSchema.safeParse({
      ...validValues,
      paymentMethod: '',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Seleccioná un método de pago'
      );
    }
  });

  it('rejects an invalid payment method', () => {
    const result = saleSchema.safeParse({
      ...validValues,
      paymentMethod: 'check',
    });

    expect(result.success).toBe(false);
  });

  it('rejects a sale with zero product lines', () => {
    const result = saleSchema.safeParse({
      ...validValues,
      productLines: [],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Agregá al menos un producto'
      );
    }
  });

  it('rejects a non-integer quantity', () => {
    const result = saleSchema.safeParse({
      ...validValues,
      productLines: [{ productId: 'p1', quantity: 1.5 }],
    });

    expect(result.success).toBe(false);
  });

  it('rejects quantity below 1', () => {
    const result = saleSchema.safeParse({
      ...validValues,
      productLines: [{ productId: 'p1', quantity: 0 }],
    });

    expect(result.success).toBe(false);
  });

  it('coerces a string quantity to an integer', () => {
    const result = saleSchema.safeParse({
      ...validValues,
      productLines: [{ productId: 'p1', quantity: '2' }],
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.productLines[0].quantity).toBe(2);
    }
  });

  it('rejects duplicate product lines', () => {
    const result = saleSchema.safeParse({
      ...validValues,
      productLines: [
        { productId: 'p1', quantity: 1 },
        { productId: 'p1', quantity: 2 },
      ],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'No podés cargar el mismo producto dos veces.'
      );
    }
  });

  it('strips an unknown serviceLines key instead of accepting it', () => {
    const result = saleSchema.safeParse({
      ...validValues,
      serviceLines: [{ serviceId: 's1', quantity: 1 }],
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty('serviceLines');
    }
  });
});
