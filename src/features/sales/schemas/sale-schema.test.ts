import { describe, expect, it } from 'vitest';
import { saleSchema } from './sale-schema';

const validValues = {
  clientId: 'c1',
  paymentMethod: 'cash',
  productLines: [{ productId: 'p1', quantity: 2 }],
  serviceLines: [],
};

describe('saleSchema', () => {
  it('accepts valid values with a product line', () => {
    expect(saleSchema.safeParse(validValues).success).toBe(true);
  });

  it('accepts services-only lines', () => {
    const result = saleSchema.safeParse({
      ...validValues,
      productLines: [],
      serviceLines: [{ serviceId: 's1', quantity: 1 }],
    });

    expect(result.success).toBe(true);
  });

  it('accepts a mixed product + service sale', () => {
    const result = saleSchema.safeParse({
      clientId: 'c1',
      paymentMethod: 'card',
      productLines: [{ productId: 'p1', quantity: 1 }],
      serviceLines: [{ serviceId: 's1', quantity: 2 }],
    });

    expect(result.success).toBe(true);
  });

  it('accepts an omitted clientId (walk-in sale)', () => {
    const result = saleSchema.safeParse({
      paymentMethod: 'cash',
      productLines: [{ productId: 'p1', quantity: 1 }],
      serviceLines: [],
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

  it('defaults omitted line arrays to empty', () => {
    const result = saleSchema.safeParse({
      clientId: 'c1',
      paymentMethod: 'cash',
      productLines: [{ productId: 'p1', quantity: 1 }],
    });

    expect(result.success).toBe(true);
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

  it('rejects zero lines across both arrays', () => {
    const result = saleSchema.safeParse({
      ...validValues,
      productLines: [],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Agregá al menos un producto o servicio'
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

  it('rejects duplicate service lines', () => {
    const result = saleSchema.safeParse({
      ...validValues,
      productLines: [],
      serviceLines: [
        { serviceId: 's1', quantity: 1 },
        { serviceId: 's1', quantity: 1 },
      ],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'No podés cargar el mismo servicio dos veces.'
      );
    }
  });

  it('allows the same id as both product and service line', () => {
    const result = saleSchema.safeParse({
      ...validValues,
      productLines: [{ productId: 'x1', quantity: 1 }],
      serviceLines: [{ serviceId: 'x1', quantity: 1 }],
    });

    expect(result.success).toBe(true);
  });
});
