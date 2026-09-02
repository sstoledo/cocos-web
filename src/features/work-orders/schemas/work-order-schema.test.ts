import { describe, expect, it } from 'vitest';
import { workOrderSchema } from './work-order-schema';

const validValues = {
  clientId: 'c1',
  vehicleId: 'v1',
  description: 'Cambio de aceite',
  services: [{ serviceId: 's1', quantity: 2, unitPrice: 150 }],
  products: [],
};

describe('workOrderSchema', () => {
  it('accepts valid values with a service line', () => {
    expect(workOrderSchema.safeParse(validValues).success).toBe(true);
  });

  it('accepts products-only lines', () => {
    const result = workOrderSchema.safeParse({
      ...validValues,
      services: [],
      products: [{ productId: 'p1', quantity: 1 }],
    });

    expect(result.success).toBe(true);
  });

  it('accepts omitted line arrays by defaulting to empty plus one line', () => {
    const result = workOrderSchema.safeParse({
      clientId: 'c1',
      vehicleId: 'v1',
      services: [{ serviceId: 's1', quantity: 1 }],
    });

    expect(result.success).toBe(true);
  });

  it('rejects a missing clientId', () => {
    const result = workOrderSchema.safeParse({ ...validValues, clientId: '' });

    expect(result.success).toBe(false);
  });

  it('rejects a missing vehicleId', () => {
    const result = workOrderSchema.safeParse({ ...validValues, vehicleId: '' });

    expect(result.success).toBe(false);
  });

  it('rejects zero lines across both arrays', () => {
    const result = workOrderSchema.safeParse({
      clientId: 'c1',
      vehicleId: 'v1',
      services: [],
      products: [],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Agregá al menos un servicio o producto'
      );
    }
  });

  it('rejects non-integer quantity', () => {
    const result = workOrderSchema.safeParse({
      ...validValues,
      services: [{ serviceId: 's1', quantity: 1.5 }],
    });

    expect(result.success).toBe(false);
  });

  it('rejects quantity below 1', () => {
    const result = workOrderSchema.safeParse({
      ...validValues,
      services: [{ serviceId: 's1', quantity: 0 }],
    });

    expect(result.success).toBe(false);
  });

  it('accepts an omitted unitPrice (server-side default)', () => {
    const result = workOrderSchema.safeParse({
      ...validValues,
      services: [{ serviceId: 's1', quantity: 1 }],
    });

    expect(result.success).toBe(true);
  });

  it('accepts an empty-string unitPrice as omitted', () => {
    const result = workOrderSchema.safeParse({
      ...validValues,
      services: [{ serviceId: 's1', quantity: 1, unitPrice: '' }],
    });

    expect(result.success).toBe(true);
  });

  it('rejects a non-positive unitPrice', () => {
    const result = workOrderSchema.safeParse({
      ...validValues,
      services: [{ serviceId: 's1', quantity: 1, unitPrice: 0 }],
    });

    expect(result.success).toBe(false);
  });

  it('rejects a unitPrice with more than 2 decimals', () => {
    const result = workOrderSchema.safeParse({
      ...validValues,
      services: [{ serviceId: 's1', quantity: 1, unitPrice: 10.999 }],
    });

    expect(result.success).toBe(false);
  });

  it('accepts a 2dp unitPrice', () => {
    const result = workOrderSchema.safeParse({
      ...validValues,
      services: [{ serviceId: 's1', quantity: 1, unitPrice: 90.25 }],
    });

    expect(result.success).toBe(true);
  });

  it('rejects a description over 2000 characters', () => {
    const result = workOrderSchema.safeParse({
      ...validValues,
      description: 'a'.repeat(2001),
    });

    expect(result.success).toBe(false);
  });
});
